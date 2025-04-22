import type { StorageInterface } from "./storage-interface"
import type { StorageData, StorageStats } from "@/types/storage-data"
import type { Guideline } from "@/types/guideline"
import { initialData } from "@/data/initial-data"

// Implementierung des StorageInterface mit localStorage
export const LocalStorageService: StorageInterface = {
  async saveData(data: StorageData): Promise<boolean> {
    try {
      localStorage.setItem(
        "guidelines_data",
        JSON.stringify({
          ...data,
          lastUpdated: new Date().toISOString(),
        }),
      )
      return true
    } catch (error) {
      console.error("Error saving data to localStorage:", error)
      return false
    }
  },

  async loadData(): Promise<StorageData> {
    try {
      const storedData = localStorage.getItem("guidelines_data")
      if (!storedData) {
        console.log("No data found in localStorage, returning initial data")
        return initialData
      }
      return JSON.parse(storedData) as StorageData
    } catch (error) {
      console.error("Error loading data from localStorage:", error)
      return initialData
    }
  },

  async uploadImage(file: File): Promise<{ url: string; name: string } | null> {
    try {
      // Konvertiere das Bild in Base64
      const base64 = await fileToBase64(file)
      const imageId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

      // Speichere das Bild in localStorage
      const images = JSON.parse(localStorage.getItem("guidelines_images") || "{}")
      images[imageId] = {
        url: base64,
        name: file.name,
        type: file.type,
        size: file.size,
        timestamp: Date.now(),
      }
      localStorage.setItem("guidelines_images", JSON.stringify(images))

      return {
        url: base64,
        name: file.name,
      }
    } catch (error) {
      console.error("Error uploading image to localStorage:", error)
      return null
    }
  },

  async deleteImage(url: string): Promise<boolean> {
    try {
      // Für Base64-Bilder in localStorage müssen wir nichts tun
      return true
    } catch (error) {
      console.error("Error deleting image from localStorage:", error)
      return false
    }
  },

  async getStats(): Promise<StorageStats> {
    try {
      const data = await this.loadData()
      const images = JSON.parse(localStorage.getItem("guidelines_images") || "{}")

      return {
        imagesCount: Object.keys(images).length,
        totalSize: JSON.stringify(data).length + JSON.stringify(images).length,
        lastUpdated: data.lastUpdated || new Date().toISOString(),
        guidelinesCount: data.guidelines.length,
        categoriesCount: data.categories.length,
        principlesCount: data.principles.length,
        databaseSize: JSON.stringify(data).length,
      }
    } catch (error) {
      console.error("Error getting stats from localStorage:", error)
      return {
        imagesCount: 0,
        totalSize: 0,
        lastUpdated: new Date().toISOString(),
        guidelinesCount: 0,
        categoriesCount: 0,
        principlesCount: 0,
        databaseSize: 0,
      }
    }
  },

  async saveGuideline(guideline: Guideline): Promise<boolean> {
    try {
      const data = await this.loadData()

      // Finde den Index der Guideline, falls sie bereits existiert
      const index = data.guidelines.findIndex((g) => g.id === guideline.id)

      if (index >= 0) {
        // Aktualisiere die bestehende Guideline
        data.guidelines[index] = guideline
      } else {
        // Füge eine neue Guideline hinzu
        data.guidelines.push(guideline)
      }

      // Speichere die aktualisierten Daten
      return await this.saveData(data)
    } catch (error) {
      console.error("Error saving guideline to localStorage:", error)
      return false
    }
  },

  async deleteGuideline(id: string): Promise<boolean> {
    try {
      const data = await this.loadData()

      // Filtere die zu löschende Guideline heraus
      data.guidelines = data.guidelines.filter((g) => g.id !== id)

      // Speichere die aktualisierten Daten
      return await this.saveData(data)
    } catch (error) {
      console.error("Error deleting guideline from localStorage:", error)
      return false
    }
  },

  // Hilfsmethode zum Bereinigen von Bild-Referenzen
  cleanImageReferences(data: any): any {
    return data
  },

  // Hilfsmethode zum Loggen von Debug-Informationen
  async logDebug(message: string, data?: any): Promise<void> {
    console.log(`[DEBUG] ${message}`, data)
  },

  // Hilfsmethode zum Exportieren von Debug-Logs
  async exportDebugLogs(): Promise<boolean> {
    return true
  },
}

// Hilfsfunktion zum Konvertieren einer Datei in Base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      resolve(result)
    }
    reader.onerror = (error) => {
      reject(error)
    }
  })
}
