import type { StorageData } from "@/types/storage-data"
import { getStorageService } from "./storage-factory"
import type { Guideline, Principle } from "@/types/guideline"
import { JsonValidator } from "./json-validator"

export interface ImportOptions {
  guidelines: boolean
  principles: boolean
  categories: boolean
  replaceMode: boolean
}

export interface ImportResult {
  success: boolean
  error?: string
  stats?: {
    guidelines: number
    principles: number
    categories: number
  }
}

export interface ImportProgress {
  stage: string
  progress: number
  message?: string
}

/**
 * Service for handling all import operations
 */
export class ImportService {
  /**
   * Validates JSON data for import
   * @param jsonText The JSON text to validate
   * @param onProgress Optional callback for progress updates
   * @returns Validation result with parsed data if successful
   */
  static async validateJsonData(
    jsonText: string,
    onProgress?: (progress: ImportProgress) => void,
  ): Promise<{ valid: boolean; data?: StorageData; error?: string }> {
    try {
      console.log("validateJsonData: Starting validation")
      if (!jsonText || jsonText.trim() === "") {
        console.warn("validateJsonData: Empty JSON data")
        return { valid: false, error: "Empty JSON data" }
      }

      // Report progress
      if (onProgress) {
        onProgress({ stage: "parsing", progress: 10 })
      }

      // Verbesserte JSON-Validierung und -Korrektur
      const validationResult = JsonValidator.validateAndFix(jsonText)

      // Report progress
      if (onProgress) {
        onProgress({ stage: "validating structure", progress: 20 })
      }

      if (!validationResult.valid) {
        console.error("validateJsonData: JSON structure validation failed", validationResult)
        return {
          valid: false,
          error: `JSON-Struktur konnte nicht korrigiert werden: ${validationResult.originalError}`,
        }
      }

      // Verwende den korrigierten JSON-Text
      const fixedJsonText = validationResult.fixed

      // Wenn Korrekturen vorgenommen wurden, logge sie
      if (validationResult.corrections.length > 0) {
        console.log("validateJsonData: JSON corrections applied:", validationResult.corrections)
      }

      // Try to parse the JSON
      let parsedData: Partial<StorageData>
      try {
        parsedData = JSON.parse(fixedJsonText)
      } catch (err) {
        console.error("validateJsonData: JSON parsing error after fixes", err)
        return {
          valid: false,
          error: `Invalid JSON format after fixes: ${err instanceof Error ? err.message : "Unknown error"}`,
        }
      }

      // Report progress
      if (onProgress) {
        onProgress({ stage: "validating content", progress: 30 })
      }

      // Validate structure - less strict validation
      if (!parsedData || typeof parsedData !== "object") {
        console.warn("validateJsonData: Parsed data is not an object")
        return { valid: false, error: "The JSON data is empty or invalid." }
      }

      // Ensure the basic structure is present, but allow missing attributes
      const validData: StorageData = {
        guidelines: Array.isArray(parsedData.guidelines) ? parsedData.guidelines : [],
        categories: Array.isArray(parsedData.categories) ? parsedData.categories : [],
        principles: Array.isArray(parsedData.principles) ? parsedData.principles : [],
        lastUpdated: parsedData.lastUpdated || new Date().toISOString(),
        version: parsedData.version || "2.0",
      }

      // Check if at least one of the arrays contains data
      if (validData.guidelines.length === 0 && validData.categories.length === 0 && validData.principles.length === 0) {
        console.warn("validateJsonData: No importable data found")
        return {
          valid: false,
          error: "The JSON contains no importable data (no guidelines, categories, or principles).",
        }
      }

      // Sanitize text fields in guidelines and principles
      validData.guidelines = this.sanitizeGuidelines(validData.guidelines)
      validData.principles = this.sanitizePrinciples(validData.principles)

      // Report progress
      if (onProgress) {
        onProgress({ stage: "validated", progress: 100 })
      }

      console.log("validateJsonData: Validation successful")
      return { valid: true, data: validData }
    } catch (error) {
      console.error("Error validating JSON data:", error)
      return {
        valid: false,
        error: `Error validating JSON data: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }

  /**
   * Cleans JSON text to fix common issues
   * @param jsonText Original JSON text
   * @returns Cleaned JSON text
   */
  private static cleanJsonText(jsonText: string): string {
    const cleanedText = jsonText
      // Normalize whitespace
      .replace(/\n/g, " ")
      .replace(/\r/g, "")
      .replace(/\t/g, " ")
      // Remove trailing commas
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]")
      // Fix multiple consecutive spaces
      .replace(/\s+/g, " ")
      // Remove invalid characters
      .replace(/[^\x20-\x7E]/g, "")
      // Handle invalid quotation marks
      .replace(/[""'']/g, '"')
      // Fix missing commas in object literals (risky but helpful in some cases)
      .replace(/}(\s*){/g, "},{")
      // Fix missing commas in arrays (risky but helpful in some cases)
      .replace(/](\s*)\[/g, "],[")

    return cleanedText
  }

  /**
   * Sanitize guidelines text fields
   * @param guidelines Guidelines to sanitize
   * @returns Sanitized guidelines
   */
  private static sanitizeGuidelines(guidelines: any[]): Guideline[] {
    return guidelines.map((guideline) => ({
      ...guideline,
      text: typeof guideline.text === "string" ? this.sanitizeDescription(guideline.text) : guideline.text,
      justification:
        typeof guideline.justification === "string"
          ? this.sanitizeDescription(guideline.justification)
          : guideline.justification,
    })) as Guideline[]
  }

  /**
   * Sanitize principles text fields
   * @param principles Principles to sanitize
   * @returns Sanitized principles
   */
  private static sanitizePrinciples(principles: any[]): Principle[] {
    return principles.map((principle) => ({
      ...principle,
      description:
        typeof principle.description === "string"
          ? this.sanitizeDescription(principle.description)
          : principle.description,
      evidenz: typeof principle.evidenz === "string" ? this.sanitizeDescription(principle.evidenz) : principle.evidenz,
      implikation:
        typeof principle.implikation === "string"
          ? this.sanitizeDescription(principle.implikation)
          : principle.implikation,
    })) as Principle[]
  }

  /**
   * Removes surrounding quotes from a string
   * @param text The text to sanitize
   * @returns The sanitized text
   */
  static sanitizeDescription(text: string): string {
    // Handle various types of quotation marks
    if (text && typeof text === "string") {
      const quotesRegex = /^["'“”‘’](.*)["'“”‘’]$/
      const match = text.match(quotesRegex)
      return match ? match[1] : text
    }
    return text
  }

  /**
   * Imports data with the specified options
   * @param data The data to import
   * @param options Import options
   * @param onProgress Callback for progress updates
   * @returns Import result
   */
  static async importData(
    data: StorageData,
    options: ImportOptions,
    onProgress?: (progress: ImportProgress) => void,
  ): Promise<ImportResult> {
    try {
      console.log("importData: Starting import", { options })

      // Report initial progress
      if (onProgress) {
        onProgress({ stage: "preparing", progress: 10 })
      }

      // Filter data based on import options
      const filteredData: StorageData = {
        guidelines: options.guidelines ? data.guidelines : [],
        categories: options.categories ? data.categories : [],
        principles: options.principles ? data.principles : [],
        lastUpdated: new Date().toISOString(),
        version: "2.0",
      }

      // Report progress
      if (onProgress) {
        onProgress({ stage: "filtering", progress: 20 })
      }

      // Log the operation to console
      console.log(`${options.replaceMode ? "Replacing all data" : "Importing data"}`, {
        guidelinesCount: filteredData.guidelines.length,
        categoriesCount: filteredData.categories.length,
        principlesCount: filteredData.principles.length,
        replaceMode: options.replaceMode,
        dataSize: JSON.stringify(filteredData).length,
      })

      // Check if the data is too large (over 5MB)
      const dataSize = JSON.stringify(filteredData).length
      const isLargeData = dataSize > 5 * 1024 * 1024 // 5MB

      if (isLargeData) {
        console.log("Large data detected, using incremental import")
      }

      // Get the storage service
      const storageService = getStorageService()

      let finalData: StorageData

      // Prepare the final data based on the import mode
      if (options.replaceMode) {
        // Replace all existing data
        finalData = {
          ...filteredData,
          lastUpdated: new Date().toISOString(),
        }

        // Report progress
        if (onProgress) {
          onProgress({ stage: "preparing-replace", progress: 40 })
        }
      } else {
        // Add data to existing by merging
        let currentData: StorageData
        try {
          // Report progress
          if (onProgress) {
            onProgress({ stage: "loading-current", progress: 30 })
          }

          console.log("Loading current data...")
          currentData = await storageService.loadData()
          console.log("Current data loaded successfully")
        } catch (loadError) {
          console.error("Error loading current data during import:", loadError)
          return {
            success: false,
            error: `Error loading current data: ${loadError instanceof Error ? loadError.message : "Unknown error"}`,
          }
        }

        // Report progress
        if (onProgress) {
          onProgress({ stage: "merging", progress: 40 })
        }

        // Intelligent merge of data
        console.log("Merging data...")
        finalData = ImportService.mergeData(currentData, filteredData)
        console.log("Data merged successfully")
      }

      try {
        return await ImportService.saveImportData(finalData, options, storageService, isLargeData, onProgress)
      } catch (saveError) {
        console.error("Error saving data during import:", saveError)
        return {
          success: false,
          error: `Error saving data: ${saveError instanceof Error ? saveError.message : "Unknown error"}`,
        }
      }
    } catch (error) {
      console.error(`Error ${options.replaceMode ? "replacing" : "importing"} data:`, error)
      return {
        success: false,
        error: `Import failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }

  /**
   * Saves imported data with progress reporting
   * @param finalData Data to save
   * @param options Import options
   * @param storageService Storage service instance
   * @param isLargeData Whether data is large
   * @param onProgress Progress callback
   * @returns Import result
   */
  private static async saveImportData(
    finalData: StorageData,
    options: ImportOptions,
    storageService: any,
    isLargeData: boolean,
    onProgress?: (progress: ImportProgress) => void,
  ): Promise<ImportResult> {
    // Report progress
    if (onProgress) {
      onProgress({ stage: "saving", progress: 60 })
    }

    console.log("Saving data...")

    let success = false

    if (isLargeData) {
      // For large data, use incremental saving
      success = await ImportService.saveDataIncrementally(finalData, storageService, onProgress)
    } else {
      // For smaller data, save everything at once
      success = await storageService.saveData(finalData)
    }

    // Report progress
    if (onProgress) {
      onProgress({ stage: "completed", progress: 100 })
    }

    console.log("Data saved successfully:", success)

    if (success) {
      return {
        success: true,
        stats: {
          guidelines: finalData.guidelines.length,
          principles: finalData.principles.length,
          categories: finalData.categories.length,
        },
      }
    } else {
      throw new Error(`Error ${options.replaceMode ? "replacing" : "saving"} imported data`)
    }
  }

  /**
   * Saves large data incrementally in chunks
   * @param finalData Data to save
   * @param storageService Storage service instance
   * @param onProgress Progress callback
   * @returns Success status
   */
  private static async saveDataIncrementally(
    finalData: StorageData,
    storageService: any,
    onProgress?: (progress: ImportProgress) => void,
  ): Promise<boolean> {
    console.log("Using incremental saving for large data")

    // Save guidelines in chunks
    if (finalData.guidelines.length > 0) {
      const chunkSize = 50
      for (let i = 0; i < finalData.guidelines.length; i += chunkSize) {
        const chunk = finalData.guidelines.slice(i, i + chunkSize)
        const chunkNumber = i / chunkSize + 1
        const totalChunks = Math.ceil(finalData.guidelines.length / chunkSize)
        console.log(`Saving guidelines chunk ${chunkNumber}/${totalChunks}`)

        // Report progress
        if (onProgress) {
          onProgress({
            stage: "saving-guidelines",
            progress: 60 + (i / finalData.guidelines.length) * 20,
            message: `Saving guidelines chunk ${chunkNumber}/${totalChunks}`,
          })
        }

        // Create a temporary data object with just this chunk
        const chunkData = {
          ...finalData,
          guidelines: chunk,
          lastUpdated: new Date().toISOString(),
        }

        try {
          const chunkSuccess = await storageService.saveData(chunkData, true)
          if (!chunkSuccess) {
            throw new Error(`Failed to save guidelines chunk ${chunkNumber}: chunkSuccess=${chunkSuccess}`)
          }
        } catch (chunkSaveError) {
          console.error(`Error saving guidelines chunk ${chunkNumber}:`, chunkSaveError)
          throw new Error(
            `Failed to save guidelines chunk ${chunkNumber}: ${
              chunkSaveError instanceof Error ? chunkSaveError.message : "Unknown error"
            }`,
          )
        }
      }
    }

    // Report progress
    if (onProgress) {
      onProgress({ stage: "saving-final", progress: 80 })
    }

    // Save the rest of the data (categories and principles)
    const finalChunkData = {
      ...finalData,
      guidelines: [], // Clear guidelines to avoid exceeding size limits
    }

    return await storageService.saveData(finalChunkData)
  }

  /**
   * Generic merge function for entities with IDs
   * @param existing Existing entities
   * @param imported Entities to import
   * @param defaultId ID generation function
   * @param defaultValues Default values for missing attributes
   * @param mergeStrategy Custom merge strategy function
   * @returns Merged entities
   */
  private static mergeEntities<T extends { id: string }>(
    existing: T[],
    imported: T[],
    defaultId: () => string,
    defaultValues: Partial<T>,
    mergeStrategy?: (existingEntity: T, importedEntity: T) => T,
  ): T[] {
    const result = [...existing]

    imported.forEach((importedEntity) => {
      // Check if entity already exists
      const existingIndex = result.findIndex((e) => e.id === importedEntity.id)

      if (existingIndex >= 0) {
        // Use custom merge strategy if provided
        if (mergeStrategy) {
          result[existingIndex] = mergeStrategy(result[existingIndex], importedEntity)
        } else {
          // Default merge strategy: spread both objects with imported taking precedence
          result[existingIndex] = {
            ...result[existingIndex],
            ...importedEntity,
          }
        }
      } else {
        // Add new entity with defaults
        result.push({
          id: importedEntity.id || defaultId(),
          ...defaultValues,
          ...importedEntity,
        } as T)
      }
    })

    return result
  }

  /**
   * Merges two sets of principles
   * @param existing Existing principles
   * @param imported Principles to import
   * @returns Merged principles
   */
  static mergePrinciples(existing: Principle[], imported: Principle[]): Principle[] {
    const defaultId = () => `principle-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    const defaultValues: Partial<Principle> = {
      name: "Unnamed Principle",
      description: "",
      evidenz: "",
      elements: [],
    }

    const mergeStrategy = (existingPrinciple: Principle, importedPrinciple: Principle): Principle => {
      return {
        ...existingPrinciple,
        ...importedPrinciple,
        // Ensure no attributes are lost
        name: importedPrinciple.name || existingPrinciple.name,
        description: importedPrinciple.description || existingPrinciple.description,
        evidenz: importedPrinciple.evidenz || existingPrinciple.evidenz,
        elements: importedPrinciple.elements || existingPrinciple.elements || [],
      }
    }

    return this.mergeEntities<Principle>(existing, imported, defaultId, defaultValues, mergeStrategy)
  }

  /**
   * Merges two sets of guidelines
   * @param existing Existing guidelines
   * @param imported Guidelines to import
   * @returns Merged guidelines
   */
  static mergeGuidelines(existing: Guideline[], imported: Guideline[]): Guideline[] {
    const defaultId = () => `guideline-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    const defaultValues: Partial<Guideline> = {
      title: "Unnamed Guideline",
      text: "",
      justification: "",
      categories: [],
      principles: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const mergeStrategy = (existingGuideline: Guideline, importedGuideline: Guideline): Guideline => {
      return {
        ...existingGuideline,
        ...importedGuideline,
        // Ensure no attributes are lost
        title: importedGuideline.title || existingGuideline.title,
        text: importedGuideline.text || existingGuideline.text,
        justification: importedGuideline.justification || existingGuideline.justification,
        categories: importedGuideline.categories || existingGuideline.categories || [],
        principles: importedGuideline.principles || existingGuideline.principles || [],
        updatedAt: new Date().toISOString(),
      }
    }

    return this.mergeEntities<Guideline>(existing, imported, defaultId, defaultValues, mergeStrategy)
  }

  /**
   * Imports principles from a special format
   * @param principles Principles to import
   * @returns Import result
   */
  static async importPrinciples(principles: Principle[]): Promise<ImportResult> {
    try {
      // Get the storage service
      const storageService = getStorageService()

      // Load current data
      const currentData = await storageService.loadData()

      // Merge principles
      const mergedPrinciples = ImportService.mergePrinciples(currentData.principles, principles)

      // Save the updated data
      const success = await storageService.saveData({
        ...currentData,
        principles: mergedPrinciples,
        lastUpdated: new Date().toISOString(),
      })

      if (success) {
        return {
          success: true,
          stats: {
            principles: principles.length,
            guidelines: 0,
            categories: 0,
          },
        }
      } else {
        throw new Error("Failed to save principles")
      }
    } catch (error) {
      console.error("Error importing principles:", error)
      return {
        success: false,
        error: `Error importing principles: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }

  /**
   * Imports principle elements from a special format
   * @param principleElements Principle elements to import
   * @returns Import result
   */
  static async importPrincipleElements(principleElements: { id: string; elements: string[] }[]): Promise<ImportResult> {
    try {
      // Get the storage service
      const storageService = getStorageService()

      // Load current data
      const currentData = await storageService.loadData()

      // Update principles with elements
      let updated = 0
      let unchanged = 0
      const errors = 0

      const updatedPrinciples = currentData.principles.map((principle) => {
        const elementUpdate = principleElements.find((pe) => pe.id === principle.id)
        if (elementUpdate) {
          if (JSON.stringify(principle.elements || []) !== JSON.stringify(elementUpdate.elements)) {
            updated++
            return {
              ...principle,
              elements: elementUpdate.elements,
            }
          } else {
            unchanged++
            return principle
          }
        } else {
          return principle
        }
      })

      // Save the updated data
      const success = await storageService.saveData({
        ...currentData,
        principles: updatedPrinciples,
        lastUpdated: new Date().toISOString(),
      })

      if (success) {
        return {
          success: true,
          stats: {
            principles: updated,
            guidelines: 0,
            categories: 0,
          },
        }
      } else {
        throw new Error("Failed to save principle elements")
      }
    } catch (error) {
      console.error("Error importing principle elements:", error)
      return {
        success: false,
        error: `Error importing principle elements: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }

  /**
   * Merges two StorageData objects, giving priority to the imported data
   * @param currentData The current StorageData
   * @param filteredData The imported StorageData
   * @returns The merged StorageData
   */
  private static mergeData(currentData: StorageData, filteredData: StorageData): StorageData {
    const mergedGuidelines = ImportService.mergeGuidelines(currentData.guidelines, filteredData.guidelines)
    const mergedPrinciples = ImportService.mergePrinciples(currentData.principles, filteredData.principles)

    return {
      guidelines: mergedGuidelines,
      categories: [...new Set([...currentData.categories, ...filteredData.categories])],
      principles: mergedPrinciples,
      lastUpdated: new Date().toISOString(),
      version: "2.0",
    }
  }
}
