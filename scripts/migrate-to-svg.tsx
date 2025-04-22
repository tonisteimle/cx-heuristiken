import { getStorageService } from "@/services/storage-factory"

/**
 * Dieses Skript konvertiert bestehende Bild-URLs in einfache SVG-Platzhalter
 * Es kann in einer Server-Aktion oder einem Admin-Tool ausgeführt werden
 */
export async function migrateImageDataToSvg() {
  const storageService = getStorageService()
  const data = await storageService.loadData()

  // Für jede Guideline mit Bildern einen SVG-Platzhalter erstellen
  const updatedGuidelines = data.guidelines.map((guideline) => {
    // Einfacher SVG-Platzhalter mit 200x200 Größe
    const placeholder = `<svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0" />
      <text x="50%" y="50%" fontFamily="Arial" fontSize="24" fill="#666" textAnchor="middle">
        SVG Placeholder
      </text>
    </svg>`

    return {
      ...guideline,
      // Wenn ein Bild vorhanden war, SVG-Platzhalter setzen
      svgContent: guideline.imageUrl ? placeholder : undefined,
      detailSvgContent: guideline.detailImageUrl ? placeholder : undefined,
      // Alte Bildfelder beibehalten (optional)
      // imageUrl: undefined,
      // imageName: undefined,
      // detailImageUrl: undefined,
      // detailImageName: undefined
    }
  })

  // Aktualisierte Daten speichern
  await storageService.saveData({
    ...data,
    guidelines: updatedGuidelines,
    lastUpdated: new Date().toISOString(),
  })

  return {
    success: true,
    message: `Migrated ${updatedGuidelines.length} guidelines to SVG format`,
  }
}
