import type { StorageData } from "@/types/storage-data"
import type { Guideline, Principle, PrincipleElement } from "@/types/guideline"
import { getStorageService } from "./storage-factory"

export interface ImportOptions {
  mergeStrategy: "replace" | "merge" | "preserve"
  importGuidelines: boolean
  importPrinciples: boolean
  importCategories: boolean
  preserveImages: boolean
}

export class ImportService {
  /**
   * Process and import data with various options
   */
  public async importData(
    importData: StorageData,
    options: ImportOptions = {
      mergeStrategy: "merge",
      importGuidelines: true,
      importPrinciples: true,
      importCategories: true,
      preserveImages: true,
    },
  ): Promise<{ success: boolean; message: string; stats?: ImportStats }> {
    try {
      console.log("Importing data:", JSON.stringify(importData).substring(0, 200) + "...")

      // Normalize the import data to match our expected structure
      const normalizedData = this.normalizeImportData(importData)
      console.log("Normalized data:", JSON.stringify(normalizedData).substring(0, 200) + "...")

      // Validate the import data
      const validationResult = this.validateImportData(normalizedData)
      if (!validationResult.valid) {
        return {
          success: false,
          message: `Die importierten Daten haben ein ungültiges Format: ${validationResult.error}`,
        }
      }

      // Get current data from storage
      const storageService = getStorageService()
      const currentData = await storageService.loadData()
      console.log("Current data before import:", JSON.stringify(currentData).substring(0, 200) + "...")

      // Process data based on options
      const processedData = await this.processImportData(currentData, normalizedData, options)
      console.log("Processed data after import:", JSON.stringify(processedData).substring(0, 200) + "...")

      // Save the processed data
      const success = await storageService.saveData(processedData)

      if (!success) {
        return { success: false, message: "Fehler beim Speichern der importierten Daten." }
      }

      // Generate import statistics
      const stats = this.generateImportStats(currentData, processedData, normalizedData)

      return {
        success: true,
        message: "Daten erfolgreich importiert.",
        stats,
      }
    } catch (error) {
      console.error("Import error:", error)
      return {
        success: false,
        message: `Fehler beim Importieren der Daten: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  }

  /**
   * Normalize the import data to match our expected structure
   */
  private normalizeImportData(data: any): StorageData {
    const normalized: StorageData = {
      guidelines: [],
      principles: [],
      categories: [],
      elements: [],
      lastUpdated: new Date().toISOString(),
      version: data.version || "2.0",
    }

    // Normalize guidelines
    if (Array.isArray(data.guidelines)) {
      normalized.guidelines = data.guidelines.map((guideline: any) => {
        return {
          id: guideline.id || `guideline-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          title: guideline.title || "",
          text: guideline.text || "",
          categories: Array.isArray(guideline.categories) ? guideline.categories : [],
          principles: Array.isArray(guideline.principles) ? guideline.principles : [],
          imageUrl: guideline.imageUrl || undefined,
          detailImageUrl: guideline.detailImageUrl || undefined,
          svgContent: guideline.svgContent || undefined,
          detailSvgContent: guideline.detailSvgContent || undefined,
          createdAt: guideline.createdAt || new Date().toISOString(),
          updatedAt: guideline.updatedAt || new Date().toISOString(),
        }
      })
    }

    // Normalize principles
    if (Array.isArray(data.principles)) {
      normalized.principles = data.principles.map((principle: any) => {
        // Handle both name and title fields
        const title = principle.title || principle.name || ""
        const name = principle.name || principle.title || ""

        // Handle element field
        let element: PrincipleElement = "other"
        if (principle.element) {
          element = principle.element as PrincipleElement
        } else if (Array.isArray(principle.elements) && principle.elements.length > 0) {
          element = principle.elements[0] as PrincipleElement
        }

        // Preserve all fields from the original data
        return {
          id: principle.id || `principle-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          title: title,
          name: name,
          description: principle.description || "",
          element: element,
          elements: Array.isArray(principle.elements) ? principle.elements : [element],
          imageUrl: principle.imageUrl || undefined,
          evidenz: principle.evidenz || undefined,
          evidence: principle.evidence || principle.evidenz || undefined, // Map evidenz to evidence if needed
          implikation: principle.implikation || undefined,
          examples: principle.examples || undefined,
          sources: Array.isArray(principle.sources) ? principle.sources : undefined,
          relatedPrinciples: Array.isArray(principle.relatedPrinciples) ? principle.relatedPrinciples : undefined,
          applications: principle.applications || undefined,
          limitations: principle.limitations || undefined,
          createdAt: principle.createdAt || new Date().toISOString(),
          updatedAt: principle.updatedAt || new Date().toISOString(),
        }
      })
    }

    // Normalize categories
    if (Array.isArray(data.categories)) {
      normalized.categories = data.categories
    }

    // Normalize elements
    if (Array.isArray(data.elements)) {
      normalized.elements = data.elements
    } else {
      // Extract unique elements from principles if not provided
      const elementsSet = new Set<string>()
      if (Array.isArray(data.principles)) {
        data.principles.forEach((principle: any) => {
          if (Array.isArray(principle.elements)) {
            principle.elements.forEach((element: string) => elementsSet.add(element))
          } else if (principle.element) {
            elementsSet.add(principle.element)
          }
        })
      }
      normalized.elements = Array.from(elementsSet)
    }

    return normalized
  }

  /**
   * Validate the structure of the import data
   */
  private validateImportData(data: any): { valid: boolean; error?: string } {
    if (!data || typeof data !== "object") {
      return { valid: false, error: "Daten sind kein gültiges Objekt" }
    }

    // Check if guidelines array exists if we need it
    if (!Array.isArray(data.guidelines)) {
      console.warn("Guidelines is not an array or missing")
      // Make it an empty array to avoid errors
      data.guidelines = []
    }

    // Check if principles array exists if we need it
    if (!Array.isArray(data.principles)) {
      console.warn("Principles is not an array or missing")
      // Make it an empty array to avoid errors
      data.principles = []
    }

    // Check if categories array exists if we need it
    if (!Array.isArray(data.categories)) {
      console.warn("Categories is not an array or missing")
      // Make it an empty array to avoid errors
      data.categories = []
    }

    // Validate guidelines structure with more flexibility
    for (const guideline of data.guidelines) {
      if (!guideline.id) {
        return { valid: false, error: "Eine Guideline hat keine ID" }
      }

      if (!guideline.title) {
        console.warn(`Guideline ${guideline.id} has no title, setting empty title`)
        guideline.title = ""
      }

      if (!guideline.text) {
        console.warn(`Guideline ${guideline.id} has no text, setting empty text`)
        guideline.text = ""
      }

      if (!Array.isArray(guideline.categories)) {
        console.warn(`Guideline ${guideline.id} has no categories array, creating empty array`)
        guideline.categories = []
      }

      if (!Array.isArray(guideline.principles)) {
        console.warn(`Guideline ${guideline.id} has no principles array, creating empty array`)
        guideline.principles = []
      }
    }

    // Validate principles structure with more flexibility
    for (const principle of data.principles) {
      if (!principle.id) {
        return { valid: false, error: "Ein Principle hat keine ID" }
      }

      // Handle both name and title fields for principles
      if (!principle.title && !principle.name) {
        console.warn(`Principle ${principle.id} has no title/name, setting empty title`)
        principle.title = ""
        principle.name = ""
      } else if (!principle.title && principle.name) {
        // If name exists but title doesn't, copy name to title
        principle.title = principle.name
      } else if (principle.title && !principle.name) {
        // If title exists but name doesn't, copy title to name
        principle.name = principle.title
      }

      if (!principle.description) {
        console.warn(`Principle ${principle.id} has no description, setting empty description`)
        principle.description = ""
      }

      // Handle element vs elements field
      if (!principle.element && Array.isArray(principle.elements) && principle.elements.length > 0) {
        // If elements array exists but element doesn't, use the first element
        principle.element = principle.elements[0]
      } else if (!principle.element) {
        // Default to "other" if no element is specified
        principle.element = "other"
      }

      // Ensure elements array exists
      if (!Array.isArray(principle.elements)) {
        principle.elements = [principle.element]
      }
    }

    return { valid: true }
  }

  /**
   * Process the import data based on options
   */
  private async processImportData(
    currentData: StorageData,
    importData: StorageData,
    options: ImportOptions,
  ): Promise<StorageData> {
    const result: StorageData = {
      guidelines: [...currentData.guidelines],
      principles: [...currentData.principles],
      categories: [...currentData.categories],
      elements: [...(currentData.elements || [])],
      version: currentData.version,
      lastUpdated: new Date().toISOString(),
    }

    // Process guidelines if enabled
    if (options.importGuidelines) {
      result.guidelines = this.processGuidelines(currentData.guidelines, importData.guidelines, options)
    }

    // Process principles if enabled
    if (options.importPrinciples) {
      result.principles = this.processPrinciples(currentData.principles, importData.principles, options)
    }

    // Process categories if enabled
    if (options.importCategories) {
      result.categories = this.processCategories(currentData.categories, importData.categories, options)
    }

    // Process elements if available
    if (importData.elements && importData.elements.length > 0) {
      result.elements = this.processElements(currentData.elements || [], importData.elements, options)
    }

    return result
  }

  /**
   * Process guidelines based on import options
   */
  private processGuidelines(
    currentGuidelines: Guideline[],
    importGuidelines: Guideline[],
    options: ImportOptions,
  ): Guideline[] {
    // Create a map of imported guidelines for faster lookup
    const importedGuidelineMap = new Map<string, Guideline>()
    importGuidelines.forEach((guideline) => {
      importedGuidelineMap.set(guideline.id, guideline)
    })

    // Start with all current guidelines
    const result: Guideline[] = [...currentGuidelines]
    const existingIds = new Set(currentGuidelines.map((g) => g.id))

    // Process each imported guideline
    importGuidelines.forEach((importedGuideline) => {
      if (existingIds.has(importedGuideline.id)) {
        // Update existing guideline if strategy is merge or replace
        if (options.mergeStrategy === "merge" || options.mergeStrategy === "replace") {
          const existingGuideline = currentGuidelines.find((g) => g.id === importedGuideline.id)!
          const mergedGuideline = this.mergeGuideline(existingGuideline, importedGuideline, options)

          // Replace the existing guideline with the merged one
          const index = result.findIndex((g) => g.id === existingGuideline.id)
          if (index !== -1) {
            result[index] = mergedGuideline
          }
        }
        // If strategy is 'preserve', we keep the existing guideline
      } else {
        // Add new guideline
        result.push(importedGuideline)
      }
    })

    return result
  }

  /**
   * Merge a guideline with an imported one, preserving images if needed
   */
  private mergeGuideline(
    existingGuideline: Guideline,
    importedGuideline: Guideline,
    options: ImportOptions,
  ): Guideline {
    const result = { ...importedGuideline }

    // Preserve images if option is enabled and imported guideline lacks images
    if (options.preserveImages) {
      // Preserve SVG content if existing has it but imported doesn't
      if (existingGuideline.svgContent && !importedGuideline.svgContent) {
        result.svgContent = existingGuideline.svgContent
      }

      // Preserve detail SVG content if existing has it but imported doesn't
      if (existingGuideline.detailSvgContent && !importedGuideline.detailSvgContent) {
        result.detailSvgContent = existingGuideline.detailSvgContent
      }

      // Preserve image URL if existing has it but imported doesn't
      if (existingGuideline.imageUrl && !importedGuideline.imageUrl) {
        result.imageUrl = existingGuideline.imageUrl
      }

      // Preserve detail image URL if existing has it but imported doesn't
      if (existingGuideline.detailImageUrl && !importedGuideline.detailImageUrl) {
        result.detailImageUrl = existingGuideline.detailImageUrl
      }
    }

    return result
  }

  /**
   * Process principles based on import options
   */
  private processPrinciples(
    currentPrinciples: Principle[],
    importPrinciples: Principle[],
    options: ImportOptions,
  ): Principle[] {
    // Create a map of imported principles for faster lookup
    const importedPrincipleMap = new Map<string, Principle>()
    importPrinciples.forEach((principle) => {
      importedPrincipleMap.set(principle.id, principle)
    })

    // Start with all current principles
    const result: Principle[] = [...currentPrinciples]
    const existingIds = new Set(currentPrinciples.map((p) => p.id))

    // Process each imported principle
    importPrinciples.forEach((importedPrinciple) => {
      if (existingIds.has(importedPrinciple.id)) {
        // Update existing principle if strategy is merge or replace
        if (options.mergeStrategy === "merge" || options.mergeStrategy === "replace") {
          const existingPrinciple = currentPrinciples.find((p) => p.id === importedPrinciple.id)!
          const mergedPrinciple = this.mergePrinciple(existingPrinciple, importedPrinciple, options)

          // Replace the existing principle with the merged one
          const index = result.findIndex((p) => p.id === existingPrinciple.id)
          if (index !== -1) {
            result[index] = mergedPrinciple
          }
        }
        // If strategy is 'preserve', we keep the existing principle
      } else {
        // Add new principle
        result.push(importedPrinciple)
      }
    })

    return result
  }

  /**
   * Merge a principle with an imported one, preserving images if needed
   */
  private mergePrinciple(
    existingPrinciple: Principle,
    importedPrinciple: Principle,
    options: ImportOptions,
  ): Principle {
    const result = { ...importedPrinciple }

    // Preserve images if option is enabled and imported principle lacks images
    if (options.preserveImages) {
      // Preserve image URL if existing has it but imported doesn't
      if (existingPrinciple.imageUrl && !importedPrinciple.imageUrl) {
        result.imageUrl = existingPrinciple.imageUrl
      }
    }

    return result
  }

  /**
   * Process categories based on import options
   */
  private processCategories(currentCategories: string[], importCategories: string[], options: ImportOptions): string[] {
    if (options.mergeStrategy === "replace") {
      return importCategories
    }

    // For merge strategy, combine categories and remove duplicates
    const combinedCategories = [...currentCategories, ...importCategories]
    return [...new Set(combinedCategories)]
  }

  /**
   * Process elements based on import options
   */
  private processElements(currentElements: string[], importElements: string[], options: ImportOptions): string[] {
    if (options.mergeStrategy === "replace") {
      return importElements
    }

    // For merge strategy, combine elements and remove duplicates
    const combinedElements = [...currentElements, ...importElements]
    return [...new Set(combinedElements)]
  }

  /**
   * Generate statistics about the import operation
   */
  private generateImportStats(
    originalData: StorageData,
    resultData: StorageData,
    importData: StorageData,
  ): ImportStats {
    return {
      guidelinesTotal: resultData.guidelines.length,
      guidelinesAdded: resultData.guidelines.length - originalData.guidelines.length,
      guidelinesUpdated: this.countUpdatedItems(originalData.guidelines, resultData.guidelines, importData.guidelines),

      principlesTotal: resultData.principles.length,
      principlesAdded: resultData.principles.length - originalData.principles.length,
      principlesUpdated: this.countUpdatedItems(originalData.principles, resultData.principles, importData.principles),

      categoriesTotal: resultData.categories.length,
      categoriesAdded: resultData.categories.length - originalData.categories.length,

      elementsTotal: (resultData.elements || []).length,
      elementsAdded: (resultData.elements || []).length - (originalData.elements || []).length,
    }
  }

  /**
   * Count how many items were updated during import
   */
  private countUpdatedItems<T extends { id: string }>(
    originalItems: T[],
    resultItems: T[],
    importedItems: T[],
  ): number {
    let count = 0

    // Create maps for faster lookup
    const originalMap = new Map<string, T>()
    originalItems.forEach((item) => originalMap.set(item.id, item))

    const resultMap = new Map<string, T>()
    resultItems.forEach((item) => resultMap.set(item.id, item))

    // Check each imported item
    importedItems.forEach((importedItem) => {
      const originalItem = originalMap.get(importedItem.id)
      const resultItem = resultMap.get(importedItem.id)

      // If item existed before, exists now, and is different from original, it was updated
      if (originalItem && resultItem && JSON.stringify(originalItem) !== JSON.stringify(resultItem)) {
        count++
      }
    })

    return count
  }
}

export interface ImportStats {
  guidelinesTotal: number
  guidelinesAdded: number
  guidelinesUpdated: number

  principlesTotal: number
  principlesAdded: number
  principlesUpdated: number

  categoriesTotal: number
  categoriesAdded: number

  elementsTotal: number
  elementsAdded: number
}
