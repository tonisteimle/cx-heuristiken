// Ich erstelle diese Datei, da sie in der ImportJsonDialog verwendet wird, aber nicht im Projekt zu sehen ist
// Dies ist eine Vermutung, wie die Datei aussehen könnte

import type { StorageData } from "@/contexts/app-context"
import { createClient } from "@supabase/supabase-js"

// Singleton-Instanz für den Supabase-Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export class BlobStorageService {
  static async loadData(): Promise<StorageData> {
    try {
      const { data, error } = await supabase.from("guidelines_data").select("*").single()

      if (error) {
        console.error("Error loading data:", error)
        return { guidelines: [], principles: [], categories: [], version: "2.0" }
      }

      return data || { guidelines: [], principles: [], categories: [], version: "2.0" }
    } catch (error) {
      console.error("Error in loadData:", error)
      return { guidelines: [], principles: [], categories: [], version: "2.0" }
    }
  }

  static async saveData(data: StorageData): Promise<boolean> {
    try {
      const { error } = await supabase.from("guidelines_data").upsert({
        id: 1, // Assuming there's only one record
        guidelines: data.guidelines,
        principles: data.principles,
        categories: data.categories,
        version: data.version,
        lastUpdated: new Date().toISOString(),
      })

      if (error) {
        console.error("Error saving data:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error in saveData:", error)
      return false
    }
  }
}
