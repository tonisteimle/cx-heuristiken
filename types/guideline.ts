export type PrincipleElement = "all" | "ui" | "ux" | "content" | "other"

export interface Principle {
  id: string
  title: string
  description: string
  element: PrincipleElement
  imageUrl?: string
  createdAt?: string
  updatedAt?: string
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
