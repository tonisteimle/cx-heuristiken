export interface Guideline {
  id: string
  title: string
  text: string
  justification?: string
  categories: string[]
  principles: string[]
  createdAt: string
  updatedAt: string
  imageUrl?: string
  imageName?: string
  detailImageUrl?: string
  detailImageName?: string
  svgContent?: string
  detailSvgContent?: string
}

export type PrincipleElement = "input" | "processing" | "decision" | "output" | "environment" | "all"

export interface Principle {
  id: string
  name: string
  description: string
  elements?: string[]
  evidenz?: string
  implikation?: string
}

export interface ExportOptions {
  guidelines: boolean
  principles: boolean
  categories: boolean
  includeImages: boolean
  onlyIncomplete?: boolean
}
