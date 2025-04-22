import type { StorageData } from "@/types/storage-data"
import type { Guideline } from "@/types/guideline"

export interface StorageInterface {
  // Data operations
  saveData(data: StorageData): Promise<boolean>
  loadData(): Promise<StorageData>
  saveGuideline(guideline: Guideline): Promise<boolean>
  deleteGuideline(id: string): Promise<boolean>

  // Image operations
  uploadImage(file: File): Promise<{ url: string; name: string } | null>
  deleteImage(url: string): Promise<boolean>

  // Stats
  getStats(): Promise<any>
}
