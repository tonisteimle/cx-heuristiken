import { StorageService } from "./storage-service"

// Direkte Base64-Speicherung ohne API-Route
export const ImageService = {
  async uploadImage(file: File): Promise<{ url: string; name: string; base64: string } | null> {
    try {
      console.log(`Starte Bildupload: ${file.name}, Typ: ${file.type}, Größe: ${file.size} Bytes`)

      // Prüfen, ob die Datei ein Bild ist
      if (!file.type.startsWith("image/")) {
        throw new Error("Die hochgeladene Datei ist kein Bild")
      }

      // Maximale Dateigröße: 5MB
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        throw new Error("Das Bild ist zu groß (max. 5MB)")
      }

      // Bild in Base64 konvertieren
      const base64 = await this.fileToBase64(file)
      console.log(`Bild in Base64 konvertiert, Länge: ${base64.length} Zeichen`)

      // Eindeutige ID für das Bild generieren
      const timestamp = Date.now()
      const randomPart = Math.random().toString(36).substring(2, 9)
      const imageId = `img_${timestamp}_${randomPart}`
      console.log(`Bild-ID generiert: ${imageId}`)

      // Wir speichern das Bild nicht mehr in Redis, sondern geben die Base64-Daten direkt zurück
      console.log(`Bild erfolgreich verarbeitet: ${imageId}`)

      return {
        url: base64, // Direkt die Base64-Daten als URL zurückgeben
        name: file.name,
        base64: base64,
      }
    } catch (error) {
      console.error("Fehler beim Hochladen des Bildes:", error)
      await StorageService.logDebug("Fehler beim Hochladen des Bildes", error)
      return null
    }
  },

  // Hilfsfunktion zum Konvertieren einer Datei in Base64
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        console.log(`Datei in Base64 konvertiert, Anfang: ${result.substring(0, 50)}...`)
        resolve(result)
      }
      reader.onerror = (error) => {
        console.error("Fehler beim Lesen der Datei:", error)
        reject(error)
      }
    })
  },
}
