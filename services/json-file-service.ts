import type { Guideline } from "../types/guideline"
import { IncrementalImportService } from "./incremental-import-service"

// Fügen Sie diese Methode zur JsonFileService-Klasse hinzu oder aktualisieren Sie sie

interface StorageData {
  guidelines: Guideline[]
  categories: any[] // Replace 'any' with the actual type if available
  principles: any[] // Replace 'any' with the actual type if available
  lastUpdated: string
  version: string
}

class JsonFileService {
  static async saveGuideline(guideline: Guideline): Promise<boolean> {
    try {
      // Speichern über die API
      const response = await fetch("/api/supabase/save-guideline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(guideline),
      })

      const result = await response.json()

      if (result.success) {
        // Wenn die API eine neue ID zurückgibt, aktualisieren wir die Guideline
        if (result.id && result.id !== guideline.id) {
          console.log(`Guideline ID updated from ${guideline.id} to ${result.id}`)
          guideline.id = result.id
        }
        return true
      } else {
        console.error("API error:", result.error)
        return false
      }
    } catch (error) {
      console.error("Error saving guideline:", error)
      return false
    }
  }

  static async saveData(data: StorageData): Promise<boolean> {
    try {
      // Validate and clean the data incrementally
      const validData = await IncrementalImportService.validateData(data, (stage, processed, total) => {
        console.log(`Validating ${stage}: ${processed}/${total}`)
      })

      // Log the validated data
      console.log(
        `Validated data: ${validData.guidelines.length} guidelines, ${validData.categories.length} categories, ${validData.principles.length} principles`,
      )

      // Speichern über die API
      const response = await fetch("/api/supabase/save-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: validData }),
      })

      // Check if the response is valid
      if (!response.ok) {
        const errorText = await response.text()
        console.error("API error response:", errorText)
        return false
      }

      try {
        const result = await response.json()
        if (result.success) {
          return true
        } else {
          console.error("API error:", result.error)
          return false
        }
      } catch (jsonError) {
        console.error("Error parsing API response:", jsonError)
        return false
      }
    } catch (error) {
      console.error("Error saving data:", error)
      return false
    }
  }

  // Hilfsmethode zum Extrahieren von Base64-Bildern
  static extractBase64Images(data: StorageData): { count: number; totalSize: number } {
    let count = 0
    let totalSize = 0

    if (data.guidelines) {
      data.guidelines.forEach((guideline) => {
        // Prüfe imageUrl
        if (guideline.imageUrl && guideline.imageUrl.startsWith("data:")) {
          count++
          totalSize += guideline.imageUrl.length
        }

        // Prüfe detailImageUrl
        if (guideline.detailImageUrl && guideline.detailImageUrl.startsWith("data:")) {
          count++
          totalSize += guideline.detailImageUrl.length
        }
      })
    }

    return { count, totalSize }
  }
}

export { JsonFileService, type StorageData }
