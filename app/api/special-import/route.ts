import { NextResponse } from "next/server"
import { getStorageService } from "@/services/storage-factory"

// Diese Funktion ist für einen einmaligen Import der Prinzipien mit Elements-Attributen
// Sie kann nach dem Import wieder entfernt werden
export async function POST(request: Request) {
  try {
    // Daten aus dem Request-Body extrahieren
    const { principles } = await request.json()

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

      if (newPrinciple) {
        // Wenn gefunden, aktualisiere nur die elements und evidenz Eigenschaften
        stats.updated++
        return {
          ...existingPrinciple,
          elements: newPrinciple.elements || existingPrinciple.elements,
          evidenz: newPrinciple.evidenz || existingPrinciple.evidenz,
        }
      }

      // Wenn nicht gefunden, behalte das bestehende Prinzip unverändert
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
      message: "Prinzipien erfolgreich aktualisiert",
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
