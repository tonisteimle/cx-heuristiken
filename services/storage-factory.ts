import type { StorageInterface } from "./storage-interface"
import { SupabaseStorageService } from "./supabase-storage-service"
import { LocalStorageService } from "./local-storage-service"

// Singleton instance
let storageService: StorageInterface | null = null

export function getStorageService(): StorageInterface {
  if (!storageService) {
    try {
      // Versuche zuerst, den Supabase-Service zu verwenden
      storageService = new SupabaseStorageService()
      console.log("Using Supabase storage service")
    } catch (error) {
      console.warn("Failed to initialize Supabase storage service, falling back to local storage:", error)
      // Fallback auf lokalen Speicher, wenn Supabase nicht verfügbar ist
      storageService = LocalStorageService
      console.log("Using local storage service as fallback")
    }
  }

  return storageService
}

// Hilfsfunktion zum Aufteilen großer Daten in Chunks
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  return chunks
}

// Hilfsfunktion zum Bereinigen von JSON-Daten
export function sanitizeJsonData(data: any): any {
  if (!data) return null

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeJsonData(item)).filter(Boolean)
  }

  if (typeof data === "object") {
    const result: Record<string, any> = {}
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = sanitizeJsonData(data[key])
        if (value !== undefined && value !== null) {
          result[key] = value
        }
      }
    }
    return result
  }

  return data
}
