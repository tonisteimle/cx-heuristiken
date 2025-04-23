import type { Principle } from "@/types/guideline"
import type { StorageData } from "@/types/storage-data"
import { getStorageService } from "./storage-factory"

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
   * @returns Validation result with parsed data if successful
   */
  static async validateJsonData(
    jsonText: string,
    onProgress?: (progress: ImportProgress) => void,
  ): Promise<{ valid: boolean; data?: StorageData; error?: string }> {
    try {
      if (!jsonText || jsonText.trim() === "") {
        return { valid: false, error: "Empty JSON data" }
      }

      // Report progress
      if (onProgress) {
        onProgress({ stage: "parsing", progress: 10 })
      }

      // Try to parse the JSON
      let parsedData: any
      try {
        // Try to fix common JSON issues before parsing
        const cleanedText = jsonText
          .replace(/\n/g, " ")
          .replace(/\r/g, "")
          .replace(/\t/g, " ")
          .replace(/,\s*}/g, "}") // Remove trailing commas
          .replace(/,\s*]/g, "]") // Remove trailing commas in arrays

        parsedData = JSON.parse(cleanedText)
      } catch (err) {
        return {
          valid: false,
          error: `Invalid JSON format: ${err instanceof Error ? err.message : "Unknown error"}`,
        }
      }

      // Report progress
      if (onProgress) {
        onProgress({ stage: "validating", progress: 30 })
      }

      // Validate structure - less strict validation
      if (!parsedData || typeof parsedData !== "object") {
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
        return {
          valid: false,
          error: "The JSON contains no importable data (no guidelines, categories, or principles).",
        }
      }

      // Report progress
      if (onProgress) {
        onProgress({ stage: "validated", progress: 100 })
      }

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
        finalData = this.mergeData(currentData, filteredData)
        console.log("Data merged successfully")
      }

      // Save the data with improved error handling
      try {
        // Report progress
        if (onProgress) {
          onProgress({ stage: "saving", progress: 60 })
        }

        console.log("Saving data...")

        let success = false

        if (isLargeData) {
          // For large data, use incremental saving
          console.log("Using incremental saving for large data")

          // Save guidelines in chunks
          if (finalData.guidelines.length > 0) {
            const chunkSize = 50
            for (let i = 0; i < finalData.guidelines.length; i += chunkSize) {
              const chunk = finalData.guidelines.slice(i, i + chunkSize)
              console.log(
                `Saving guidelines chunk ${i / chunkSize + 1}/${Math.ceil(finalData.guidelines.length / chunkSize)}`,
              )

              // Report progress
              if (onProgress) {
                onProgress({
                  stage: "saving-guidelines",
                  progress: 60 + (i / finalData.guidelines.length) * 20,
                  message: `Saving guidelines chunk ${i / chunkSize + 1}/${Math.ceil(
                    finalData.guidelines.length / chunkSize,
                  )}`,
                })
              }

              // Create a temporary data object with just this chunk
              const chunkData = {
                ...finalData,
                guidelines: i === 0 ? chunk : [...(await storageService.loadData()).guidelines, ...chunk],
                lastUpdated: new Date().toISOString(),
              }

              const chunkSuccess = await storageService.saveData(chunkData)
              if (!chunkSuccess) {
                throw new Error(`Failed to save guidelines chunk ${i / chunkSize + 1}`)
              }
            }
          }

          // Report progress
          if (onProgress) {
            onProgress({ stage: "saving-final", progress: 80 })
          }

          // Save the rest of the data (categories and principles)
          const finalChunkData = {
            ...(await storageService.loadData()),
            categories: finalData.categories,
            principles: finalData.principles,
            lastUpdated: new Date().toISOString(),
          }

          success = await storageService.saveData(finalChunkData)
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
              guidelines: filteredData.guidelines.length,
              principles: filteredData.principles.length,
              categories: filteredData.categories.length,
            },
          }
        } else {
          throw new Error(`Error ${options.replaceMode ? "replacing" : "saving"} imported data`)
        }
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
   * Merges two sets of data intelligently
   * @param currentData Current data
   * @param importData Data to import
   * @returns Merged data
   */
  static mergeData(currentData: StorageData, importData: StorageData): StorageData {
    // Merge categories (simple, as they are just strings)
    const mergedCategories = [...new Set([...currentData.categories, ...importData.categories])]

    // Merge principles
    const mergedPrinciples = this.mergePrinciples(currentData.principles, importData.principles)

    // Merge guidelines
    const mergedGuidelines = this.mergeGuidelines(currentData.guidelines, importData.guidelines)

    return {
      guidelines: mergedGuidelines,
      categories: mergedCategories,
      principles: mergedPrinciples,
      lastUpdated: new Date().toISOString(),
      version: "2.0",
    }
  }

  /**
   * Merges two sets of principles
   * @param existing Existing principles
   * @param imported Principles to import
   * @returns Merged principles
   */
  static mergePrinciples(existing: any[], imported: any[]): any[] {
    const result = [...existing]
    const existingIds = new Set(existing.map((p) => p.id))

    imported.forEach((importedPrinciple) => {
      // Check if principle already exists
      const existingIndex = result.findIndex((p) => p.id === importedPrinciple.id)

      if (existingIndex >= 0) {
        // Add missing attributes to existing principle
        result[existingIndex] = {
          ...result[existingIndex],
          ...importedPrinciple,
          // Ensure no attributes are lost
          name: importedPrinciple.name || result[existingIndex].name,
          description: importedPrinciple.description || result[existingIndex].description,
          evidenz: importedPrinciple.evidenz || result[existingIndex].evidenz,
          elements: importedPrinciple.elements || result[existingIndex].elements || [],
        }
      } else {
        // Add new principle
        result.push({
          id: importedPrinciple.id || `principle-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: importedPrinciple.name || "Unnamed Principle",
          description: importedPrinciple.description || "",
          evidenz: importedPrinciple.evidenz || "",
          elements: importedPrinciple.elements || [],
          ...importedPrinciple,
        })
      }
    })

    return result
  }

  /**
   * Merges two sets of guidelines
   * @param existing Existing guidelines
   * @param imported Guidelines to import
   * @returns Merged guidelines
   */
  static mergeGuidelines(existing: any[], imported: any[]): any[] {
    const result = [...existing]
    const existingIds = new Set(existing.map((g) => g.id))

    imported.forEach((importedGuideline) => {
      // Check if guideline already exists
      const existingIndex = result.findIndex((g) => g.id === importedGuideline.id)

      if (existingIndex >= 0) {
        // Add missing attributes to existing guideline
        result[existingIndex] = {
          ...result[existingIndex],
          ...importedGuideline,
          // Ensure no attributes are lost
          title: importedGuideline.title || result[existingIndex].title,
          text: importedGuideline.text || result[existingIndex].text,
          justification: importedGuideline.justification || result[existingIndex].justification,
          categories: importedGuideline.categories || result[existingIndex].categories || [],
          principles: importedGuideline.principles || result[existingIndex].principles || [],
          updatedAt: new Date().toISOString(),
        }
      } else {
        // Add new guideline with default values for missing attributes
        result.push({
          id: importedGuideline.id || `guideline-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          title: importedGuideline.title || "Unnamed Guideline",
          text: importedGuideline.text || "",
          justification: importedGuideline.justification || "",
          categories: importedGuideline.categories || [],
          principles: importedGuideline.principles || [],
          createdAt: importedGuideline.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...importedGuideline,
        })
      }
    })

    return result
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
      const mergedPrinciples = this.mergePrinciples(currentData.principles, principles)

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
}
