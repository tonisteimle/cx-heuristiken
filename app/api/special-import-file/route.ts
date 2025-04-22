import { NextResponse } from "next/server"
import { getStorageService } from "@/services/storage-factory"

// Diese Funktion ist für einen einmaligen Import der Prinzipien mit Elements-Attributen
// aus einer hochgeladenen JSON-Datei
// Sie kann nach dem Import wieder entfernt werden
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: "Keine Datei gefunden" }, { status: 400 })
    }

    // Datei lesen
    const fileContent = await file.text()
    let jsonData

    try {
      jsonData = JSON.parse(fileContent)
    } catch (error) {
      return NextResponse.json({ success: false, error: "Ungültiges JSON-Format" }, { status: 400 })
    }

    const { principles } = jsonData

    if (!Array.isArray(principles)) {
      return NextResponse.json(
        { success: false, error: "Ungültiges Format: principles muss ein Array sein" },
        { status: 400 },
      )
    }

    // Aktuelle Daten laden
    const storageService = getStorageService()
    const currentData = await storageService.loadData()

    // Statistiken für die Antwort vorbereiten
    const stats = {
      total: principles.length,
      updated: 0,
      unchanged: 0,
      errors: 0,
    }

    // Für jedes Prinzip in den neuen Daten
    const updatedPrinciples = currentData.principles.map((existingPrinciple) => {
      // Suche das entsprechende Prinzip in den neuen Daten
      const newPrinciple = principles.find((p) => p.id === existingPrinciple.id)

      if (newPrinciple && newPrinciple.elements) {
        // Wenn gefunden und elements vorhanden, aktualisiere NUR die elements Eigenschaft
        stats.updated++
        return {
          ...existingPrinciple,
          elements: newPrinciple.elements,
        }
      }

      // Wenn nicht gefunden oder keine elements, behalte das bestehende Prinzip unverändert
      stats.unchanged++
      return existingPrinciple
    })

    // Speichere die aktualisierten Daten
    const updatedData = {
      ...currentData,
      principles: updatedPrinciples,
      lastUpdated: new Date().toISOString(),
    }

    const success = await storageService.saveData(updatedData)

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Fehler beim Speichern der aktualisierten Daten" },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Prinzipien-Kategorien erfolgreich aktualisiert",
      stats,
    })
  } catch (error) {
    console.error("Fehler beim Spezial-Import:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unbekannter Fehler beim Import",
      },
      { status: 500 },
    )
  }
}
