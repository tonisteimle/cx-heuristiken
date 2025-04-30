import { safelyParseJson, createSuccessResponse, createErrorResponse } from "@/lib/api-utils"
import type { NextRequest } from "next/server"

// Definiere den Handler für das Löschen einer Guideline
async function deleteGuidelineHandler(request: NextRequest, supabase: any) {
  try {
    // Sicheres Parsen der JSON-Daten
    const jsonResult = await safelyParseJson<{ id: string }>(request)

    if (!jsonResult.success) {
      return jsonResult.response
    }

    const { id } = jsonResult.data

    if (!id) {
      return createErrorResponse("Keine Guideline-ID angegeben", 400)
    }

    // Lade die aktuellen Daten
    const { data: currentData, error: fetchError } = await supabase
      .from("guidelines_data")
      .select("data")
      .eq("id", "main")
      .single()

    if (fetchError) {
      console.error("Fehler beim Laden der Daten:", fetchError)
      return createErrorResponse(`Fehler beim Laden der Daten: ${fetchError.message}`, 500)
    }

    if (!currentData?.data?.guidelines) {
      console.warn("Keine Guidelines gefunden, aber wir betrachten das als Erfolg")
      return createSuccessResponse({ message: "Keine Guidelines zum Löschen gefunden" })
    }

    // Prüfen, ob die Guideline existiert
    const guidelineExists = currentData.data.guidelines.some((g: any) => g.id === id)

    if (!guidelineExists) {
      console.warn(`Guideline mit ID ${id} nicht in der Datenbank gefunden, aber wir betrachten das als Erfolg`)
      return createSuccessResponse({ message: `Guideline mit ID ${id} bereits gelöscht oder nicht vorhanden` })
    }

    // Filtere die zu löschende Guideline heraus
    const updatedGuidelines = currentData.data.guidelines.filter((g: any) => g.id !== id)

    // Aktualisiere die Daten in Supabase
    const { error: updateError } = await supabase
      .from("guidelines_data")
      .update({
        data: {
          ...currentData.data,
          guidelines: updatedGuidelines,
          lastUpdated: new Date().toISOString(),
        },
      })
      .eq("id", "main")

    if (updateError) {
      console.error("Fehler beim Aktualisieren der Daten:", updateError)
      return createErrorResponse(`Fehler beim Aktualisieren der Daten: ${updateError.message}`, 500)
    }

    return createSuccessResponse({ message: `Guideline mit ID ${id} erfolgreich gelöscht` })
  } catch (error) {
    console.error("Unbehandelter Fehler beim Löschen der Guideline:", error)
    return createErrorResponse(`Unbehandelter Fehler: ${error instanceof Error ? error.message : String(error)}`, 500)
  }
}

// Direkter Export der POST-Funktion
export async function POST(request: NextRequest) {
  // Supabase-Client aus dem Request-Context holen
  const { supabase } = (request as any).supabase || {}

  if (!supabase) {
    return createErrorResponse("Supabase-Client nicht verfügbar", 500)
  }

  return deleteGuidelineHandler(request, supabase)
}
