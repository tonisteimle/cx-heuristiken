import { createClient } from "@/lib/supabase-client"
import type { StorageData } from "@/types/storage-data"
import type { StorageService } from "./storage-interface"
import type { Guideline } from "@/types/guideline"

// Definiere die initialen Daten direkt hier
const initialData: StorageData = {
  principles: [],
  guidelines: [],
  categories: [],
  elements: [],
}

export class SupabaseStorageService implements StorageService {
  private supabase = createClient()
  private tableName = "guidelines_data"
  private recordId = "app_data"
  private lastError: Error | null = null

  constructor() {
    console.log("SupabaseStorageService initialized")
  }

  // Get the last error that occurred
  getLastError(): Error | null {
    return this.lastError
  }

  async initializeTable(): Promise<boolean> {
    try {
      console.log("Versuche, die Tabelle zu erstellen, falls sie nicht existiert...")

      // Verwende die from-Methode, um zu prüfen, ob die Tabelle existiert
      // Wenn die Tabelle nicht existiert, wird ein Fehler ausgelöst
      try {
        const { data, error } = await this.supabase.from(this.tableName).select("id").limit(1)

        if (error) {
          console.error("Error checking if table exists:", error)

          if (error.message.includes("does not exist")) {
            console.log("Table does not exist, trying to create it...")
          } else {
            this.lastError = new Error(`Failed to check if table exists: ${error.message}`)
            return false
          }
        } else {
          console.log("Tabelle existiert bereits")
          return true
        }
      } catch (error) {
        console.log("Tabelle existiert möglicherweise nicht, versuche sie zu erstellen")
      }

      // Verwende die SQL-Funktion über RPC, um die Tabelle zu erstellen
      const { error } = await this.supabase.rpc("create_guidelines_table")

      if (error) {
        console.error("Fehler beim Erstellen der Tabelle über RPC:", error)

        // Wenn die RPC-Funktion nicht existiert oder fehlschlägt, verwenden wir einen Fallback
        // Wir erstellen die Tabelle direkt über eine INSERT-Operation und fangen mögliche Fehler ab
        try {
          // Versuche, einen Datensatz einzufügen, um zu sehen, ob die Tabelle existiert
          const { error: insertError } = await this.supabase.from(this.tableName).insert({
            id: this.recordId,
            data: initialData,
            updated_at: new Date().toISOString(),
          })

          if (!insertError) {
            console.log("Tabelle existiert und Daten wurden eingefügt")
            return true
          }

          // Wenn ein Fehler auftritt, der nicht mit der Tabellenexistenz zusammenhängt
          if (insertError && !insertError.message.includes("does not exist")) {
            console.error("Fehler beim Einfügen von Daten:", insertError)
            this.lastError = new Error(`Failed to insert data: ${insertError.message}`)
            return false
          }

          // Wenn die Tabelle nicht existiert, können wir sie nicht direkt erstellen
          // Wir müssen einen anderen Ansatz verwenden oder einen Fehler zurückgeben
          console.error("Tabelle existiert nicht und kann nicht erstellt werden:", insertError)
          this.lastError = new Error(`Table does not exist and cannot be created: ${insertError.message}`)
          return false
        } catch (insertError) {
          console.error("Fehler beim Versuch, Daten einzufügen:", insertError)
          this.lastError = insertError instanceof Error ? insertError : new Error(String(insertError))
          return false
        }
      }

      console.log("Tabelle erfolgreich erstellt")
      return true
    } catch (error) {
      console.error("Fehler bei der Tabelleninitialisierung:", error)
      this.lastError = error instanceof Error ? error : new Error(String(error))
      return false
    }
  }

  async saveData(data: StorageData): Promise<boolean> {
    try {
      console.log("Speichere Daten in Supabase...")

      // Stelle sicher, dass die Tabelle existiert
      const tableInitialized = await this.initializeTable()
      if (!tableInitialized) {
        console.error("Tabelle konnte nicht initialisiert werden")
        return false
      }

      // Ensure data has the correct structure
      const normalizedData: StorageData = {
        principles: Array.isArray(data.principles) ? data.principles : [],
        guidelines: Array.isArray(data.guidelines) ? data.guidelines : [],
        categories: Array.isArray(data.categories) ? data.categories : [],
        elements: Array.isArray(data.elements) ? data.elements : [],
        lastUpdated: data.lastUpdated || new Date().toISOString(),
        version: data.version || "2.0",
      }

      // Speichere die Daten in der Tabelle
      const { error } = await this.supabase.from(this.tableName).upsert(
        {
          id: this.recordId,
          data: normalizedData,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        },
      )

      if (error) {
        console.error("Error saving data to Supabase:", error)
        this.lastError = new Error(`Failed to save data: ${error.message}`)
        return false
      }

      console.log("Daten erfolgreich in Supabase gespeichert")
      return true
    } catch (error) {
      console.error("Fehler beim Speichern der Daten in Supabase:", error)
      this.lastError = error instanceof Error ? error : new Error(String(error))
      return false
    }
  }

  async loadData(): Promise<StorageData> {
    try {
      console.log("Versuche, Daten aus Supabase zu laden...")

      // Stelle sicher, dass die Tabelle existiert
      const tableInitialized = await this.initializeTable()
      if (!tableInitialized) {
        console.warn("Tabelle konnte nicht initialisiert werden, verwende initiale Daten")
        return initialData
      }

      // Versuche, Daten aus der Tabelle zu laden
      try {
        const { data, error } = await this.supabase.from(this.tableName).select("data").eq("id", this.recordId).single()

        if (error) {
          // Wenn der Fehler darauf hinweist, dass keine Daten gefunden wurden
          if (error.code === "PGRST116") {
            console.log("Keine Daten in Supabase gefunden, verwende initiale Daten...")

            // Speichere die initialen Daten, wenn keine Daten gefunden wurden
            await this.saveData(initialData)

            return initialData
          }

          console.error("Error loading data from Supabase:", error)
          this.lastError = new Error(`Failed to load data: ${error.message}`)
          return initialData
        }

        if (!data || !data.data) {
          console.log("Keine gültigen Daten in Supabase gefunden, verwende initiale Daten...")
          return initialData
        }

        console.log("Daten erfolgreich aus Supabase geladen:", JSON.stringify(data.data).substring(0, 200) + "...")
        console.log(
          `Loaded ${data.data.guidelines?.length || 0} guidelines and ${data.data.principles?.length || 0} principles`,
        )

        // Ensure the data has the expected structure
        const loadedData = data.data as StorageData

        // Make sure all required arrays exist
        if (!Array.isArray(loadedData.guidelines)) loadedData.guidelines = []
        if (!Array.isArray(loadedData.principles)) loadedData.principles = []
        if (!Array.isArray(loadedData.categories)) loadedData.categories = []
        if (!Array.isArray(loadedData.elements)) loadedData.elements = []

        return loadedData
      } catch (error) {
        // Wenn ein Fehler beim Laden auftritt, versuche zu erkennen, ob die Tabelle nicht existiert
        console.error("Fehler beim Laden der Daten:", error)
        this.lastError = error instanceof Error ? error : new Error(String(error))

        // Verwende initiale Daten als Fallback
        console.log("Verwende initiale Daten als Fallback...")
        return initialData
      }
    } catch (error) {
      console.error("Fehler beim Laden der Daten aus Supabase:", error)
      this.lastError = error instanceof Error ? error : new Error(String(error))
      return initialData // Verwende initiale Daten als Fallback
    }
  }

  async getStats(): Promise<{ lastUpdated: string | null }> {
    try {
      // Stelle sicher, dass die Tabelle existiert
      const tableInitialized = await this.initializeTable()
      if (!tableInitialized) {
        return { lastUpdated: null }
      }

      // Lade die Daten aus der Tabelle
      try {
        const { data, error } = await this.supabase
          .from(this.tableName)
          .select("updated_at")
          .eq("id", this.recordId)
          .single()

        if (error) {
          if (error.code === "PGRST116") {
            // Keine Daten gefunden
            return { lastUpdated: null }
          }

          console.error("Error getting stats:", error)
          this.lastError = new Error(`Failed to get stats: ${error.message}`)
          return { lastUpdated: null }
        }

        return { lastUpdated: data?.updated_at || null }
      } catch (error) {
        console.error("Fehler beim Abrufen der Statistiken:", error)
        this.lastError = error instanceof Error ? error : new Error(String(error))
        return { lastUpdated: null }
      }
    } catch (error) {
      console.error("Fehler beim Abrufen der Statistiken:", error)
      this.lastError = error instanceof Error ? error : new Error(String(error))
      return { lastUpdated: null }
    }
  }

  async deleteGuideline(id: string): Promise<boolean> {
    try {
      // Lade die aktuellen Daten
      const currentData = await this.loadData()

      // Finde und entferne die Guideline
      const updatedGuidelines = currentData.guidelines.filter((g) => g.id !== id)

      // Wenn keine Änderung, dann existiert die Guideline nicht
      if (updatedGuidelines.length === currentData.guidelines.length) {
        return false
      }

      // Speichere die aktualisierten Daten
      const success = await this.saveData({
        ...currentData,
        guidelines: updatedGuidelines,
      })

      return success
    } catch (error) {
      console.error("Fehler beim Löschen der Guideline:", error)
      this.lastError = error instanceof Error ? error : new Error(String(error))
      return false
    }
  }

  async saveGuideline(guideline: Guideline): Promise<boolean> {
    try {
      // Lade die aktuellen Daten
      const currentData = await this.loadData()

      // Finde den Index der Guideline, falls sie bereits existiert
      const index = currentData.guidelines.findIndex((g) => g.id === guideline.id)

      let updatedGuidelines
      if (index >= 0) {
        // Aktualisiere die existierende Guideline
        updatedGuidelines = [...currentData.guidelines]
        updatedGuidelines[index] = guideline
      } else {
        // Füge eine neue Guideline hinzu
        updatedGuidelines = [...currentData.guidelines, guideline]
      }

      // Speichere die aktualisierten Daten
      const success = await this.saveData({
        ...currentData,
        guidelines: updatedGuidelines,
      })

      return success
    } catch (error) {
      console.error("Fehler beim Speichern der Guideline:", error)
      this.lastError = error instanceof Error ? error : new Error(String(error))
      return false
    }
  }
}
