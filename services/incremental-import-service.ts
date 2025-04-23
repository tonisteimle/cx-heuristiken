import type { Guideline, Principle } from "@/types/guideline"
import type { StorageData } from "@/types/storage-data"

/**
 * Service for handling incremental imports of large datasets
 */
export class IncrementalImportService {
  /**
   * Processes a large dataset in chunks to avoid memory issues
   * @param data The data to process
   * @param chunkSize The size of each chunk
   * @param onProgress Callback for progress updates
   * @param onError Callback for error handling
   */
  static async processInChunks<T>(
    data: T[],
    chunkSize = 100,
    onProgress?: (processed: number, total: number) => void,
    onError?: (error: Error, item: T, index: number) => void,
  ): Promise<T[]> {
    if (!Array.isArray(data)) {
      return []
    }

    const result: T[] = []
    const total = data.length

    // Process in chunks to avoid memory issues
    for (let i = 0; i < total; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize)

      // Process each item in the chunk
      for (let j = 0; j < chunk.length; j++) {
        try {
          const item = chunk[j]
          if (item) {
            result.push(item)
          }
        } catch (error) {
          console.error(`Error processing item at index ${i + j}:`, error)
          if (onError) {
            onError(error instanceof Error ? error : new Error(String(error)), chunk[j], i + j)
          }
        }
      }

      // Report progress
      if (onProgress) {
        onProgress(Math.min(i + chunkSize, total), total)
      }

      // Allow UI to update by yielding to the event loop
      await new Promise((resolve) => setTimeout(resolve, 0))
    }

    return result
  }

  /**
   * Validates and cleans a guideline object
   * @param guideline The guideline to validate
   * @returns A cleaned guideline object or null if invalid
   */
  static validateGuideline(guideline: any): Guideline | null {
    if (!guideline || typeof guideline !== "object") {
      return null
    }

    try {
      // Ensure required fields exist
      const id = guideline.id || `guideline-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      const title = guideline.title || "Unnamed Guideline"
      const text = guideline.text || ""

      // Ensure arrays are valid
      const categories = Array.isArray(guideline.categories) ? guideline.categories : []
      const principles = Array.isArray(guideline.principles) ? guideline.principles : []

      // Ensure dates are valid
      const createdAt = guideline.createdAt || new Date().toISOString()
      const updatedAt = guideline.updatedAt || new Date().toISOString()

      return {
        ...guideline,
        id,
        title,
        text,
        categories,
        principles,
        createdAt,
        updatedAt,
      }
    } catch (error) {
      console.error("Error validating guideline:", error)
      return null
    }
  }

  /**
   * Validates and cleans a principle object
   * @param principle The principle to validate
   * @returns A cleaned principle object or null if invalid
   */
  static validatePrinciple(principle: any): Principle | null {
    if (!principle || typeof principle !== "object") {
      return null
    }

    try {
      // Ensure required fields exist
      const id = principle.id || `principle-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      const name = principle.name || "Unnamed Principle"
      const description = principle.description || ""

      return {
        ...principle,
        id,
        name,
        description,
      }
    } catch (error) {
      console.error("Error validating principle:", error)
      return null
    }
  }

  /**
   * Validates and cleans a StorageData object
   * @param data The data to validate
   * @param onProgress Callback for progress updates
   * @returns A cleaned StorageData object
   */
  static async validateData(
    data: any,
    onProgress?: (stage: string, processed: number, total: number) => void,
  ): Promise<StorageData> {
    const result: StorageData = {
      guidelines: [],
      categories: [],
      principles: [],
      lastUpdated: new Date().toISOString(),
      version: data?.version || "2.0",
    }

    // Process guidelines
    if (Array.isArray(data?.guidelines)) {
      const validGuidelines = await this.processInChunks<Guideline>(
        data.guidelines,
        50,
        (processed, total) => {
          if (onProgress) onProgress("guidelines", processed, total)
        },
        (error, item, index) => {
          console.warn(`Skipping invalid guideline at index ${index}:`, error)
        },
      )

      // Filter out invalid guidelines
      result.guidelines = validGuidelines
        .map((g) => this.validateGuideline(g))
        .filter((g): g is Guideline => g !== null)
    }

    // Process principles
    if (Array.isArray(data?.principles)) {
      const validPrinciples = await this.processInChunks<Principle>(
        data.principles,
        50,
        (processed, total) => {
          if (onProgress) onProgress("principles", processed, total)
        },
        (error, item, index) => {
          console.warn(`Skipping invalid principle at index ${index}:`, error)
        },
      )

      // Filter out invalid principles
      result.principles = validPrinciples
        .map((p) => this.validatePrinciple(p))
        .filter((p): p is Principle => p !== null)
    }

    // Process categories
    if (Array.isArray(data?.categories)) {
      // Filter out invalid categories
      result.categories = data.categories
        .filter((c) => typeof c === "string")
        .map((c) => c.trim())
        .filter((c) => c.length > 0)
    }

    return result
  }
}
