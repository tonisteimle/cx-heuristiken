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
    } catch (error) {
      console.warn("Failed to initialize Supabase storage service, falling back to local storage:", error)
      // Fallback auf lokalen Speicher, wenn Supabase nicht verfügbar ist
      storageService = LocalStorageService
    }
  }

  return storageService
}
