import { createApiHandler } from "@/lib/api-handler"

// Definiere den Handler für das Löschen einer Guideline
async function deleteGuidelineHandler(data: { id: string }, supabase: any) {
  const { id } = data

  if (!id) {
    throw new Error("Keine Guideline-ID angegeben")
  }

  // Lade die aktuellen Daten
  const { data: currentData } = await supabase.from("guidelines_data").select("data").eq("id", "main").single()

  if (!currentData?.data?.guidelines) {
    throw new Error("Keine Guidelines gefunden")
  }

  // Filtere die zu löschende Guideline heraus
  const updatedGuidelines = currentData.data.guidelines.filter((g: any) => g.id !== id)

  // Wenn die Anzahl gleich ist, wurde nichts gelöscht
  if (updatedGuidelines.length === currentData.data.guidelines.length) {
    throw new Error(`Guideline mit ID ${id} nicht gefunden`)
  }

  // Aktualisiere die Daten in Supabase
  const { error } = await supabase
    .from("guidelines_data")
    .update({
      data: {
        ...currentData.data,
        guidelines: updatedGuidelines,
        lastUpdated: new Date().toISOString(),
      },
    })
    .eq("id", "main")

  if (error) {
    throw error
  }

  return { message: `Guideline mit ID ${id} erfolgreich gelöscht` }
}

// Exportiere die POST-Funktion mit dem API-Handler
export const POST = createApiHandler(deleteGuidelineHandler)
