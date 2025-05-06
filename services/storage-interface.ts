import type { StorageData } from "@/types/storage-data"
import type { Guideline } from "@/types/guideline"

export interface StorageService {
  saveData(data: StorageData): Promise<boolean>
  loadData(): Promise<StorageData>
  getStats(): Promise<{ lastUpdated: string | null }>
  deleteGuideline(id: string): Promise<boolean>
  saveGuideline(guideline: Guideline): Promise<boolean>
}
