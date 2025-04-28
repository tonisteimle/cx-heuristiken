import type { StorageData } from "@/types/storage-data"
import { getStorageService } from "./storage-factory"
import type { Guideline } from "@/types/guideline"

export interface ImportOptions {
  guidelines: boolean
  principles: boolean
  categories: boolean
  replaceMode: boolean
}

export interface ImportResult {
  success: boolean
  error?: string
  message?: string
  stats?: {
    guidelines: number
    principles: number
    categories: number
    svgCount?: number
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
   * Processes and saves data from a JSON string
   * @param jsonString The JSON string to process
   * @param options Import options
   * @param onProgress Callback for progress updates
   * @returns Import result
   */
  static async processAndSaveData(
    jsonString: string,
    options: ImportOptions,
    onProgress?: (progress: ImportProgress) => void,
  ): Promise<ImportResult> {
    try {
      console.log("processAndSaveData: Starting import", { options })

      // Report initial progress
      if (onProgress) {
        onProgress({ stage: "preparing", progress: 5, message: "Preparing import..." })
      }

      // Parse the JSON string
      let parsedData: any
      try {
        if (onProgress) {
          onProgress({ stage: "parsing", progress: 10, message: "Parsing JSON data..." })
        }
        parsedData = JSON.parse(jsonString)
        console.log("JSON parsed successfully")
      } catch (parseError) {
        console.error("Error parsing JSON data:", parseError)
        return {
          success: false,
          error: `Error parsing JSON data: ${parseError instanceof Error ? parseError.message : "Unknown error"}`,
        }
      }

      // Basic validation of the parsed data
      if (!parsedData || typeof parsedData !== "object") {
        console.error("Invalid JSON data: not an object")
        return { success: false, error: "The JSON data is empty or invalid." }
      }

      // Get the storage service
      const storageService = getStorageService()

      // Load current data if not in replace mode
      let currentData: StorageData | null = null
      if (!options.replaceMode) {
        try {
          if (onProgress) {
            onProgress({ stage: "loading-current", progress: 20, message: "Loading current data..." })
          }
          currentData = await storageService.loadData()
          console.log("Current data loaded successfully")
        } catch (loadError) {
          console.error("Error loading current data:", loadError)
          return {
            success: false,
            error: `Error loading current data: ${loadError instanceof Error ? loadError.message : "Unknown error"}`,
          }
        }
      }

      // Zähle SVGs in den importierten Daten
      let svgCount = 0
      if (Array.isArray(parsedData.guidelines)) {
        for (const guideline of parsedData.guidelines) {
          if (guideline && guideline.svgContent) {
            svgCount++
            // Überprüfe, ob das SVG gültig ist
            if (!guideline.svgContent.trim().startsWith("<svg") && !guideline.svgContent.trim().startsWith("<?xml")) {
              console.warn(
                `Ungültiges SVG-Format in Guideline ${guideline.id || "unknown"}: ${guideline.svgContent.substring(0, 50)}...`,
              )
            }
          }
        }
      }
      console.log(`Gefundene SVGs in importierten Daten: ${svgCount}`)

      // Prepare data for import
      const importData: StorageData = {
        guidelines: options.guidelines && Array.isArray(parsedData.guidelines) ? parsedData.guidelines : [],
        categories: options.categories && Array.isArray(parsedData.categories) ? parsedData.categories : [],
        principles: options.principles && Array.isArray(parsedData.principles) ? parsedData.principles : [],
        lastUpdated: new Date().toISOString(),
        version: parsedData.version || "2.0",
      }

      console.log("Import data prepared", {
        guidelinesCount: importData.guidelines.length,
        categoriesCount: importData.categories.length,
        principlesCount: importData.principles.length,
        svgCount: svgCount,
      })

      // Process and save data
      if (options.replaceMode) {
        // Replace mode: save the imported data directly
        if (onProgress) {
          onProgress({ stage: "saving", progress: 50, message: "Saving imported data..." })
        }

        try {
          // Direkt an die API senden, um Umgebungsvariablen-Probleme zu umgehen
          const response = await fetch("/api/supabase/save-data", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: importData,
              isIncremental: false,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(`API error: ${response.status} ${errorData.error || response.statusText}`)
          }

          const result = await response.json()
          console.log("API response:", result)
        } catch (saveError) {
          console.error("Error saving imported data:", saveError)
          return {
            success: false,
            error: `Error saving imported data: ${saveError instanceof Error ? saveError.message : "Unknown error"}`,
          }
        }
      } else {
        // Merge mode: merge with existing data
        if (onProgress) {
          onProgress({ stage: "merging", progress: 40, message: "Merging with existing data..." })
        }

        if (!currentData) {
          console.error("Current data is null in merge mode")
          return {
            success: false,
            error: "Failed to load current data for merging",
          }
        }

        // Process guidelines
        if (options.guidelines && importData.guidelines.length > 0) {
          if (onProgress) {
            onProgress({ stage: "processing-guidelines", progress: 50, message: "Processing guidelines..." })
          }

          let processedSvgCount = 0
          let preservedSvgCount = 0

          // Lade alle bestehenden Guidelines, um SVG-Inhalte zu erhalten
          const existingGuidelines: Record<string, Guideline> = {}
          if (currentData && Array.isArray(currentData.guidelines)) {
            for (const guideline of currentData.guidelines) {
              if (guideline && guideline.id) {
                existingGuidelines[guideline.id] = guideline
              }
            }
          }

          console.log(`Gefundene bestehende Guidelines: ${Object.keys(existingGuidelines).length}`)

          // Debug: Überprüfe SVG-Inhalte in importierten Daten
          let importSvgCount = 0
          for (const guideline of importData.guidelines) {
            if (guideline.svgContent) {
              importSvgCount++
              console.log(`SVG in importierter Guideline ${guideline.id}: ${guideline.svgContent.substring(0, 50)}...`)
            }
          }
          console.log(`SVGs in importierten Daten gefunden: ${importSvgCount}`)

          // Erhöhe die Chunk-Größe für bessere Performance
          const CHUNK_SIZE = 100 // Kleinere Chunks für bessere Zuverlässigkeit

          // Verarbeite Guidelines in Batches für bessere Performance
          const guidelineBatches = []
          for (let i = 0; i < importData.guidelines.length; i += CHUNK_SIZE) {
            guidelineBatches.push(importData.guidelines.slice(i, i + CHUNK_SIZE))
          }

          let processedCount = 0
          for (const batch of guidelineBatches) {
            const processedGuidelines = batch
              .map((guideline) => {
                try {
                  // Prüfe, ob eine bestehende Guideline mit dieser ID existiert
                  const existingGuideline = guideline.id ? existingGuidelines[guideline.id] : null

                  // Explizit alle Felder kopieren, um sicherzustellen, dass nichts verloren geht
                  const processedGuideline: Guideline = {
                    id: guideline.id || `guideline-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                    title: guideline.title || "Untitled",
                    text: guideline.text || "",
                    categories: Array.isArray(guideline.categories) ? guideline.categories : [],
                    principles: Array.isArray(guideline.principles) ? guideline.principles : [],
                    createdAt: guideline.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    justification: guideline.justification || existingGuideline?.justification || "",

                    // Explizit alle SVG- und Bild-Felder kopieren
                    svgContent: guideline.svgContent || existingGuideline?.svgContent || undefined,
                    detailSvgContent: guideline.detailSvgContent || existingGuideline?.detailSvgContent || undefined,
                    imageUrl: guideline.imageUrl || existingGuideline?.imageUrl || undefined,
                    imageName: guideline.imageName || existingGuideline?.imageName || undefined,
                    detailImageUrl: guideline.detailImageUrl || existingGuideline?.detailImageUrl || undefined,
                    detailImageName: guideline.detailImageName || existingGuideline?.detailImageName || undefined,
                  }

                  // Debug: Überprüfe, ob SVG-Inhalte korrekt übernommen wurden
                  if (guideline.svgContent && !processedGuideline.svgContent) {
                    console.warn(`SVG-Inhalt ging verloren für Guideline ${guideline.id}`)
                  }

                  // Zähle SVGs
                  if (processedGuideline.svgContent) {
                    if (guideline.svgContent) {
                      processedSvgCount++
                    } else if (existingGuideline?.svgContent) {
                      preservedSvgCount++
                    }
                  }

                  return processedGuideline
                } catch (error) {
                  console.error(`Error processing guideline:`, error)
                  return null
                }
              })
              .filter(Boolean)

            // Debug: Überprüfe verarbeitete Guidelines
            console.log(`Batch mit ${processedGuidelines.length} Guidelines verarbeitet`)
            let batchSvgCount = 0
            for (const guideline of processedGuidelines) {
              if (guideline.svgContent) {
                batchSvgCount++
              }
            }
            console.log(`SVGs in verarbeitetem Batch: ${batchSvgCount}`)

            // Batch-Speicherung für bessere Performance
            try {
              const response = await fetch("/api/supabase/batch-save-guidelines", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ guidelines: processedGuidelines }),
              })

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                console.error(`API error: ${response.status} ${errorData.error || response.statusText}`)
              } else {
                console.log(`Batch erfolgreich gespeichert`)
              }
            } catch (apiError) {
              console.error(`Error saving guidelines batch via API:`, apiError)
            }

            processedCount += batch.length

            // Update progress
            if (onProgress) {
              onProgress({
                stage: "saving-guidelines",
                progress: 50 + (processedCount / importData.guidelines.length) * 20,
                message: `Saving guidelines ${processedCount}/${importData.guidelines.length}`,
              })
            }
          }

          console.log(`Verarbeitete SVGs: ${processedSvgCount} von ${importData.guidelines.length} Guidelines`)
          console.log(`Beibehaltene SVGs: ${preservedSvgCount} von ${importData.guidelines.length} Guidelines`)
        }

        // Process principles and categories via API
        if (
          (options.principles && importData.principles.length > 0) ||
          (options.categories && importData.categories.length > 0)
        ) {
          if (onProgress) {
            onProgress({
              stage: "processing-principles-categories",
              progress: 80,
              message: "Processing principles and categories...",
            })
          }

          // Prepare data for API
          const apiData: Partial<StorageData> = {
            principles: options.principles ? importData.principles : [],
            categories: options.categories ? importData.categories : [],
            guidelines: [], // No guidelines here, we processed them individually
            lastUpdated: new Date().toISOString(),
            version: "2.0",
          }

          try {
            const response = await fetch("/api/supabase/save-data", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                data: apiData,
                isIncremental: true, // Use incremental mode to merge with existing data
              }),
            })

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}))
              throw new Error(`API error: ${response.status} ${errorData.error || response.statusText}`)
            }

            const result = await response.json()
            console.log("Principles and categories saved:", result)
          } catch (apiError) {
            console.error("Error saving principles and categories:", apiError)
          }
        }
      }

      // Report completion
      if (onProgress) {
        onProgress({ stage: "completed", progress: 100, message: "Import completed" })
      }

      console.log("Import completed successfully")
      return {
        success: true,
        message: "Import completed successfully",
        stats: {
          guidelines: importData.guidelines.length,
          principles: importData.principles.length,
          categories: importData.categories.length,
          svgCount: svgCount,
        },
      }
    } catch (error) {
      console.error("Error in processAndSaveData:", error)
      return {
        success: false,
        error: `Import failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }

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
        onProgress({ stage: "parsing", progress: 30 })
      }

      // Try to parse the JSON
      let parsedData: Partial<StorageData>
      try {
        // Verwende einen performanteren JSON-Parser für große Datenmengen
        parsedData = JSON.parse(jsonText)
      } catch (err) {
        console.error("validateJsonData: JSON parsing error", err)
        return {
          valid: false,
          error: `Invalid JSON format: ${err instanceof Error ? err.message : "Unknown error"}`,
        }
      }

      // Report progress
      if (onProgress) {
        onProgress({ stage: "validating content", progress: 60 })
      }

      // Basic structure validation
      if (!parsedData || typeof parsedData !== "object") {
        console.warn("validateJsonData: Parsed data is not an object")
        return { valid: false, error: "The JSON data is empty or invalid." }
      }

      // Verwende Referenzen statt Kopien, wo möglich
      const validData: StorageData = {
        guidelines: Array.isArray(parsedData.guidelines) ? parsedData.guidelines : [],
        categories: Array.isArray(parsedData.categories) ? parsedData.categories : [],
        principles: Array.isArray(parsedData.principles) ? parsedData.principles : [],
        lastUpdated: parsedData.lastUpdated || new Date().toISOString(),
        version: parsedData.version || "2.0",
      }

      // Optimierte SVG-Zählung mit frühem Abbruch
      let svgCount = 0
      if (Array.isArray(validData.guidelines)) {
        // Verwende for-Schleife statt forEach für bessere Performance
        for (let i = 0; i < validData.guidelines.length; i++) {
          const guideline = validData.guidelines[i]
          if (guideline && guideline.svgContent) {
            svgCount++
          }
        }
      }
      console.log(`Gefundene SVGs in validierten Daten: ${svgCount}`)

      // Check if at least one of the arrays contains data
      if (validData.guidelines.length === 0 && validData.categories.length === 0 && validData.principles.length === 0) {
        console.warn("validateJsonData: No importable data found")
        return {
          valid: false,
          error: "The JSON contains no importable data (no guidelines, categories, or principles).",
        }
      }

      // Report progress
      if (onProgress) {
        onProgress({ stage: "validated", progress: 100 })
      }

      console.log("validateJsonData: Validation successful", {
        guidelinesCount: validData.guidelines.length,
        categoriesCount: validData.categories.length,
        principlesCount: validData.principles.length,
        svgCount: svgCount,
      })

      return { valid: true, data: validData }
    } catch (error) {
      console.error("Error validating JSON data:", error)
      return {
        valid: false,
        error: `Error validating JSON data: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }
}
