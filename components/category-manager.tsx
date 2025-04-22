"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, X, Trash2, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Guideline } from "@/types/guideline"
import { Title, MutedText, BoldText, SmallText } from "@/components/ui/typography"

interface CategoryManagerProps {
  categories: string[]
  guidelines: Guideline[]
  onDeleteCategory: (category: string) => Promise<void>
  onClose: () => void
}

export function CategoryManager({ categories, guidelines, onDeleteCategory, onClose }: CategoryManagerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)

  // Zählen, wie oft jede Kategorie verwendet wird
  const categoryUsage = categories.reduce(
    (acc, category) => {
      acc[category] = guidelines.filter((g) => g.categories.includes(category)).length
      return acc
    },
    {} as Record<string, number>,
  )

  // Sortiere Kategorien nach Nutzungshäufigkeit (absteigend)
  const sortedCategories = [...categories].sort((a, b) => categoryUsage[b] - categoryUsage[a])

  // Filtere Kategorien basierend auf dem Suchbegriff
  const filteredCategories = searchTerm
    ? sortedCategories.filter((category) => category.toLowerCase().includes(searchTerm.toLowerCase()))
    : sortedCategories

  const handleDeleteCategory = async (category: string) => {
    try {
      setIsDeleting(true)
      await onDeleteCategory(category)
      setCategoryToDelete(null)
    } catch (error) {
      console.error("Fehler beim Löschen der Kategorie:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <Title>Kategorien verwalten</Title>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Kategorien durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setSearchTerm("")}
            >
              <X size={14} />
            </Button>
          )}
        </div>

        {/* Bestätigungsdialog für das Löschen */}
        {categoryToDelete && (
          <Alert variant="warning" className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700">
              <BoldText>Kategorie löschen</BoldText>
              <p>
                Möchten Sie die Kategorie <BoldText>"{categoryToDelete}"</BoldText> wirklich löschen?
                {categoryUsage[categoryToDelete] > 0 && (
                  <span>
                    {" "}
                    Diese Kategorie wird in <BoldText>{categoryUsage[categoryToDelete]}</BoldText> Guidelines verwendet.
                  </span>
                )}
              </p>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => setCategoryToDelete(null)} disabled={isDeleting}>
                  Abbrechen
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteCategory(categoryToDelete)}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Wird gelöscht..." : "Löschen bestätigen"}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="border rounded-md p-4 max-h-[400px] overflow-y-auto">
          {filteredCategories.length > 0 ? (
            <div className="space-y-2">
              {filteredCategories.map((category) => (
                <div key={category} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{category}</Badge>
                    <SmallText>{categoryUsage[category]} Guidelines</SmallText>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCategoryToDelete(category)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    disabled={isDeleting || !!categoryToDelete}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <MutedText>{searchTerm ? "Keine Kategorien gefunden" : "Keine Kategorien vorhanden"}</MutedText>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" onClick={onClose} disabled={isDeleting || !!categoryToDelete}>
          Schließen
        </Button>
      </CardFooter>
    </Card>
  )
}
