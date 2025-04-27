import { createApiHandler } from "@/lib/api-handler"
import type { Guideline } from "@/types/guideline"

async function saveGuidelinesBatchHandler(requestData: any, supabase: any) {
  try {
    console.log("saveGuidelinesBatchHandler: Received request", {
      guidelinesCount: requestData.guidelines?.length || 0,
    })

    if (!Array.isArray(requestData.guidelines) || requestData.guidelines.length === 0) {
      return {
        success: false,
        error: "No guidelines provided or invalid format",
      }
    }

    const guidelines = requestData.guidelines as Guideline[]
    const results = []

    // Lade aktuelle Daten
    const { data: currentData, error: loadError } = await supabase
      .from("guidelines_data")
      .select("data")
      .eq("id", "main")
      .single()

    if (loadError) {
      console.error("Error loading current data:", loadError)
      return {
        success: false,
        error: `Failed to load current data: ${loadError.message}`,
      }
    }

    // Erstelle eine Map der bestehenden Guidelines für schnellen Zugriff
    const existingGuidelines = new Map()
    if (currentData?.data?.guidelines) {
      for (const guideline of currentData.data.guidelines) {
        if (guideline && guideline.id) {
          existingGuidelines.set(guideline.id, guideline)
        }
      }
    }

    // Verarbeite jede Guideline im Batch
    for (const guideline of guidelines) {
      try {
        // Prüfe, ob die Guideline bereits existiert
        const existingGuideline = existingGuidelines.get(guideline.id)

        if (existingGuideline) {
          // Aktualisiere bestehende Guideline
          existingGuidelines.set(guideline.id, {
            ...existingGuideline,
            ...guideline,
            updatedAt: new Date().toISOString(),
          })
        } else {
          // Füge neue Guideline hinzu
          existingGuidelines.set(guideline.id, {
            ...guideline,
            createdAt: guideline.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        }

        results.push({
          id: guideline.id,
          success: true,
        })
      } catch (error) {
        console.error(`Error processing guideline ${guideline.id}:`, error)
        results.push({
          id: guideline.id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    // Aktualisiere die Daten in der Datenbank
    const updatedData = {
      ...currentData.data,
      guidelines: Array.from(existingGuidelines.values()),
      lastUpdated: new Date().toISOString(),
    }

    const { error: updateError } = await supabase
      .from("guidelines_data")
      .update({
        data: updatedData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", "main")

    if (updateError) {
      console.error("Error updating data:", updateError)
      return {
        success: false,
        error: `Failed to update data: ${updateError.message}`,
        partialResults: results,
      }
    }

    return {
      success: true,
      message: `Successfully processed ${guidelines.length} guidelines`,
      results,
    }
  } catch (error) {
    console.error("Error in saveGuidelinesBatchHandler:", error)
    return {
      success: false,
      error: `Server error: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export const POST = createApiHandler(saveGuidelinesBatchHandler)
