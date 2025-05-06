export type PrincipleElement = "all" | "ui" | "ux" | "content" | "other" | "decision"

export interface Principle {
  id: string
  title?: string
  name?: string
  description: string
  element?: PrincipleElement
  elements?: string[]
  imageUrl?: string
  createdAt?: string
  updatedAt?: string
  evidence?: string
  evidenz?: string
  examples?: string
  sources?: string[]
  relatedPrinciples?: string[]
  applications?: string
  limitations?: string
  implikation?: string
}

export interface Guideline {
  id: string
  title: string
  text: string
  categories: string[]
  principles: string[]
  imageUrl?: string
  detailImageUrl?: string
  svgContent?: string
  detailSvgContent?: string
  createdAt?: string
  updatedAt?: string
}
