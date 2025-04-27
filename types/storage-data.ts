import type { Guideline } from "@/types/guideline"
import type { Principle } from "@/types/principle"
import type { Category } from "@/types/category"

export interface StorageStats {
  imagesCount: number
  totalSize: number
  lastUpdated: string
  guidelinesCount: number
  categoriesCount: number
  principlesCount: number
  databaseSize: number
}

export interface StorageData {
  guidelines: Guideline[]
  categories: Category[]
  principles: Principle[]
  lastUpdated: string
  version: string
}
