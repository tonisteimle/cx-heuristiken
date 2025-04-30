import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"

export async function POST(request: Request) {
  try {
    // Daten aus dem Request extrahieren
    let data
    try {
      data = await request.json()
    } catch (error) {
      console.error("Fehler beim Parsen der Request-Daten:", error)
      return NextResponse.json({ success: false, error: "Ungültiges JSON-Format" }, { status: 400 })
    }

    const { id } = data

    if (!id) {
      return NextResponse.json({ success: false, error: "Keine Guideline-ID angegeben" }, { status: 400 })
    }

    // Supabase-Client erstellen
    const supabase = createServerSupabaseClient()

    // Lade die aktuellen Daten
    const { data: currentData, error: fetchError } = await supabase
      .from("guidelines_data")
      .select("data")
      .eq("id", "main")
      .single()

    if (fetchError) {
      console.error("Fehler beim Laden der Daten:", fetchError)
      return NextResponse.json(
        { success: false, error: `Fehler beim Laden der Daten: ${fetchError.message}` },
        { status: 500 },
      )
    }

    if (!currentData?.data?.guidelines) {
      console.warn("Keine Guidelines gefunden, aber wir betrachten das als Erfolg")
      return NextResponse.json({ success: true, message: "Keine Guidelines zum Löschen gefunden" }, { status: 200 })
    }

    // Prüfen, ob die Guideline existiert
    const guidelineExists = currentData.data.guidelines.some((g: any) => g.id === id)

    if (!guidelineExists) {
      console.warn(`Guideline mit ID ${id} nicht in der Datenbank gefunden, aber wir betrachten das als Erfolg`)
      return NextResponse.json(
        { success: true, message: `Guideline mit ID ${id} bereits gelöscht oder nicht vorhanden` },
        { status: 200 },
      )
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
      return NextResponse.json(
        { success: false, error: `Fehler beim Aktualisieren der Daten: ${updateError.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, message: `Guideline mit ID ${id} erfolgreich gelöscht` }, { status: 200 })
  } catch (error) {
    console.error("Unbehandelter Fehler beim Löschen der Guideline:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Unbehandelter Fehler: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}
