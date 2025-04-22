import type { StorageInterface } from "./storage-interface"
import type { StorageData, StorageStats } from "@/types/storage-data"
import { getSupabaseClient } from "@/lib/supabase-client"
import type { Guideline } from "@/types/guideline"
import { initialData } from "@/data/initial-data"

export class SupabaseStorageService implements StorageInterface {
  private readonly BUCKET_NAME = "guidelines-images"

  async saveData(data: StorageData): Promise<boolean> {
    try {
      const response = await fetch("/api/supabase/save-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }),
      })

      const result = await response.json()
      return result.success
    } catch (error) {
      console.error("Error saving data:", error)
      // Fallback auf localStorage, wenn die API nicht erreichbar ist
      try {
        localStorage.setItem(
          "guidelines_data",
          JSON.stringify({
            ...data,
            lastUpdated: new Date().toISOString(),
          }),
        )
        console.log("Data saved to localStorage as fallback")
        return true
      } catch (localStorageError) {
        console.error("Error saving to localStorage fallback:", localStorageError)
        return false
      }
    }
  }

  async loadData(): Promise<StorageData> {
    try {
      const response = await fetch("/api/supabase/load-data")

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        return result.data
      } else {
        console.error("Error loading data from API:", result.error)
        // Versuche, aus dem localStorage zu laden, wenn die API fehlschlägt
        const storedData = localStorage.getItem("guidelines_data")
        if (storedData) {
          console.log("Loading data from localStorage fallback")
          return JSON.parse(storedData) as StorageData
        }
        return initialData
      }
    } catch (error) {
      console.error("Error loading data from API:", error)
      // Versuche, aus dem localStorage zu laden, wenn die API fehlschlägt
      try {
        const storedData = localStorage.getItem("guidelines_data")
        if (storedData) {
          console.log("Loading data from localStorage fallback")
          return JSON.parse(storedData) as StorageData
        }
      } catch (localStorageError) {
        console.error("Error loading from localStorage fallback:", localStorageError)
      }
      return initialData
    }
  }

  async uploadImage(file: File): Promise<{ url: string; name: string; base64?: string } | null> {
    try {
      // Versuche zuerst, das Bild in Base64 zu konvertieren für den Fallback
      const base64 = await this.fileToBase64(file)

      try {
        const formData = new FormData()
        formData.append("image", file)
        formData.append("name", file.name)

        const response = await fetch("/api/supabase/upload-image", {
          method: "POST",
          body: formData,
        })

        const result = await response.json()

        if (result.success) {
          return {
            url: result.url,
            name: file.name,
            base64: base64, // Speichere auch die Base64-Version für Fallback
          }
        }
      } catch (uploadError) {
        console.error("Error uploading to Supabase, using Base64 fallback:", uploadError)
      }

      // Fallback: Verwende Base64 direkt
      return {
        url: base64,
        name: file.name,
        base64: base64,
      }
    } catch (error) {
      console.error("Error in image upload:", error)
      return null
    }
  }

  async deleteImage(imageUrl: string): Promise<boolean> {
    try {
      // Wenn es eine Base64-URL ist, müssen wir nichts tun
      if (imageUrl.startsWith("data:")) {
        return true
      }

      const response = await fetch("/api/supabase/delete-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: imageUrl }),
      })

      const result = await response.json()
      return result.success
    } catch (error) {
      console.error("Error deleting image:", error)
      return false
    }
  }

  async getStats(): Promise<StorageStats> {
    try {
      // Versuche, Statistiken von Supabase zu bekommen
      try {
        // Get the Supabase client
        const supabase = getSupabaseClient()

        // Get the list of files in the bucket to count them
        const { data: files, error } = await supabase.storage.from(this.BUCKET_NAME).list()

        if (!error && files) {
          // Calculate total size (this is an estimate as we don't have file sizes)
          const totalSize = files.reduce((acc, file) => acc + (file.metadata?.size || 0), 0)

          // Lade die Daten, um die Anzahl der Guidelines, Kategorien und Prinzipien zu zählen
          const data = await this.loadData()

          return {
            imagesCount: files.length,
            totalSize,
            lastUpdated: data.lastUpdated || new Date().toISOString(),
            guidelinesCount: data.guidelines.length,
            categoriesCount: data.categories.length,
            principlesCount: data.principles.length,
            databaseSize: JSON.stringify(data).length,
          }
        }
      } catch (supabaseError) {
        console.error("Error getting stats from Supabase:", supabaseError)
      }

      // Fallback: Berechne Statistiken aus den lokalen Daten
      const data = await this.loadData()

      return {
        imagesCount: 0,
        totalSize: JSON.stringify(data).length,
        lastUpdated: data.lastUpdated || new Date().toISOString(),
        guidelinesCount: data.guidelines.length,
        categoriesCount: data.categories.length,
        principlesCount: data.principles.length,
        databaseSize: JSON.stringify(data).length,
      }
    } catch (error) {
      console.error("Error getting storage stats:", error)
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
  }

  // Aktualisieren Sie die saveGuideline-Methode in der SupabaseStorageService-Klasse
  async saveGuideline(guideline: Guideline): Promise<boolean> {
    try {
      // Versuche zuerst, die Guideline über die API zu speichern
      try {
        const response = await fetch("/api/supabase/save-guideline", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(guideline),
        })

        const result = await response.json()
        if (result.success) {
          // Wenn die API einen neuen ID zurückgibt, aktualisieren wir die lokale Guideline
          if (result.id && result.id !== guideline.id) {
            // Aktualisiere die ID in den lokalen Daten
            const data = await this.loadData()
            const updatedGuidelines = data.guidelines.map((g) => (g.id === guideline.id ? { ...g, id: result.id } : g))

            await this.saveData({
              ...data,
              guidelines: updatedGuidelines,
              lastUpdated: new Date().toISOString(),
            })
          }
          return true
        }
      } catch (apiError) {
        console.error("Error saving guideline via API:", apiError)
      }

      // Fallback: Aktualisiere die Daten lokal
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
      console.error("Error saving guideline:", error)
      return false
    }
  }

  async deleteGuideline(id: string): Promise<boolean> {
    try {
      // Versuche zuerst, die Guideline über die API zu löschen
      try {
        const response = await fetch("/api/supabase/delete-guideline", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        })

        const result = await response.json()
        if (result.success) {
          return true
        }
      } catch (apiError) {
        console.error("Error deleting guideline via API:", apiError)
      }

      // Fallback: Lösche die Guideline lokal
      const data = await this.loadData()

      // Filtere die zu löschende Guideline heraus
      data.guidelines = data.guidelines.filter((g) => g.id !== id)

      // Speichere die aktualisierten Daten
      return await this.saveData(data)
    } catch (error) {
      console.error("Error deleting guideline:", error)
      return false
    }
  }

  // Hilfsmethode zum Konvertieren einer Datei in Base64
  private async fileToBase64(file: File): Promise<string> {
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

  // Hilfsmethode zum Bereinigen von Bild-Referenzen
  cleanImageReferences(data: any): any {
    return data
  }

  // Hilfsmethode zum Loggen von Debug-Informationen
  async logDebug(message: string, data?: any): Promise<void> {
    console.log(`[DEBUG] ${message}`, data)
  }

  // Hilfsmethode zum Exportieren von Debug-Logs
  async exportDebugLogs(): Promise<boolean> {
    return true
  }
}
