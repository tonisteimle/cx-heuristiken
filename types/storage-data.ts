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
  guidelines: any[] // Replace 'any' with the actual type if available
  categories: any[] // Replace 'any' with the actual type if available
  principles: any[] // Replace 'any' with the actual type if available
  lastUpdated: string
  version: string
}
