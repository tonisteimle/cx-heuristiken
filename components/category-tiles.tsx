"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useAppContext } from "@/contexts/app-context"
import { Title, MutedText } from "@/components/ui/typography"
import { FIXED_CATEGORIES } from "@/lib/constants"
import type { Guideline } from "@/types/guideline"

interface CategoryTilesProps {
  guidelines?: Guideline[]
  onCategorySelect: (category: string) => void
}

export function CategoryTiles({ guidelines = [], onCategorySelect }: CategoryTilesProps) {
  const { state } = useAppContext()
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({})

  // Finde für jede Kategorie ein repräsentatives Bild aus den Guidelines
  useEffect(() => {
    const images: Record<string, string> = {}

    // Verwende die festen Kategorien aus den Konstanten
    FIXED_CATEGORIES.forEach((category) => {
      // Finde Guidelines mit dieser Kategorie und einem SVG oder Bild
      const guidelinesWithImage = state.guidelines.filter(
        (g) => g.categories.includes(category) && (g.svgContent || g.imageUrl),
      )

      if (guidelinesWithImage.length > 0) {
        // Verwende das erste gefundene Bild
        const guideline = guidelinesWithImage[0]
        images[category] = guideline.svgContent || guideline.imageUrl || ""
      }
    })

    setCategoryImages(images)
  }, [state.guidelines])

  // Zähle die Anzahl der Guidelines pro Kategorie
  const getCategoryCount = (category: string) => {
    return state.guidelines.filter((g) => g.categories.includes(category)).length
  }

  return (
    <div className="space-y-6">
      <Title>Kategorien</Title>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {FIXED_CATEGORIES.map((category) => {
          const count = getCategoryCount(category)
          const hasImage = !!categoryImages[category]

          return (
            <Card
              key={category}
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onCategorySelect(category)}
            >
              {hasImage && (
                <div className="aspect-video bg-muted/30 flex items-center justify-center overflow-hidden">
                  {categoryImages[category].startsWith("<svg") ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: categoryImages[category] }}
                      className="w-full h-full flex items-center justify-center p-4"
                    />
                  ) : (
                    <img
                      src={categoryImages[category] || "/placeholder.svg"}
                      alt={category}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              )}
              <CardContent className="p-4">
                <h3 className="font-medium text-lg mb-1">{category}</h3>
                <p className="text-sm text-muted-foreground">
                  {count} {count === 1 ? "Guideline" : "Guidelines"}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {FIXED_CATEGORIES.length === 0 && (
        <div className="text-center py-8">
          <MutedText>Keine Kategorien vorhanden</MutedText>
        </div>
      )}
    </div>
  )
}
