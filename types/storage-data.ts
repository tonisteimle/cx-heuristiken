import type { Guideline, Principle } from "./guideline"

export interface StorageData {
  principles: Principle[]
  guidelines: Guideline[]
  categories: string[]
  elements: string[]
  lastUpdated?: string
  version?: string
}

export interface StorageStats {
  imagesCount: number
  totalSize: number
  lastUpdated: string
  guidelinesCount: number
  categoriesCount: number
  principlesCount: number
  databaseSize: number
}
