import { createApiHandler } from "@/lib/api-handler"

// Handler für Batch-Speicherung von Guidelines
async function batchSaveGuidelinesHandler(requestData: any, supabase: any) {
  try {
    console.log("batchSaveGuidelinesHandler: Received request", {
      guidelinesCount: requestData.guidelines?.length || 0,
    })

    if (!Array.isArray(requestData.guidelines) || requestData.guidelines.length === 0) {
      return {
        success: false,
        error: "No guidelines provided or invalid format",
      }
    }

    // Hole aktuelle Daten
    const { data: currentData, error: fetchError } = await supabase
      .from("guidelines_data")
      .select("data")
      .eq("id", "main")
      .single()

    if (fetchError) {
      console.error("Error fetching current data:", fetchError)
      return {
        success: false,
        error: `Failed to fetch current data: ${fetchError.message}`,
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

    // Aktualisiere oder füge Guidelines hinzu
    const updatedGuidelines = [...(currentData?.data?.guidelines || [])]
    const processedIds = new Set()

    for (const guideline of requestData.guidelines) {
      if (!guideline || !guideline.id) continue

      processedIds.add(guideline.id)
      const index = updatedGuidelines.findIndex((g) => g.id === guideline.id)

      if (index >= 0) {
        // Aktualisiere bestehende Guideline
        updatedGuidelines[index] = guideline
      } else {
        // Füge neue Guideline hinzu
        updatedGuidelines.push(guideline)
      }
    }

    // Aktualisiere die Daten in der Datenbank
    const { error: updateError } = await supabase
      .from("guidelines_data")
      .update({
        data: {
          ...currentData.data,
          guidelines: updatedGuidelines,
          lastUpdated: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", "main")

    if (updateError) {
      console.error("Error updating guidelines:", updateError)
      return {
        success: false,
        error: `Failed to update guidelines: ${updateError.message}`,
      }
    }

    return {
      success: true,
      message: `Successfully processed ${requestData.guidelines.length} guidelines`,
      updatedCount: requestData.guidelines.length,
    }
  } catch (error) {
    console.error("Error in batch save guidelines:", error)
    return {
      success: false,
      error: `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export const POST = createApiHandler(batchSaveGuidelinesHandler)
