import { SupabaseStorageService } from "./supabase-storage-service"
import type { StorageService } from "./storage-interface"

// Singleton-Instanz des Storage-Service
let storageService: StorageService | null = null

export function getStorageService(): StorageService {
  if (!storageService) {
    storageService = new SupabaseStorageService()
  }

  return storageService
}
