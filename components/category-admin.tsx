"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Plus, Edit, Trash2, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { CategoryForm } from "@/components/category-form"
import { Title, MutedText, BoldText, SmallText } from "@/components/ui/typography"
import type { Category } from "@/types/category"
import { useAppContext } from "@/contexts/app-context"
import { useToast } from "@/components/ui/use-toast"

export function CategoryAdmin() {
  const { state, addCategory, updateCategory, deleteCategory } = useAppContext()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Zählen, wie oft jede Kategorie verwendet wird
  const categoryUsage = state.categories.reduce(
    (acc, category) => {
      acc[category.id] = state.guidelines.filter((g) => g.categories.includes(category.id)).length
      return acc
    },
    {} as Record<string, number>,
  )

  // Sortiere Kategorien nach Name
  const sortedCategories = [...state.categories].sort((a, b) => a.name.localeCompare(b.name))

  // Filtere Kategorien basierend auf dem Suchbegriff
  const filteredCategories = searchTerm
    ? sortedCategories.filter(
        (category) =>
          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    : sortedCategories

  const handleAddCategory = async (category: Partial<Category>) => {
    try {
      setIsSubmitting(true)
      await addCategory(category)
      setIsAddDialogOpen(false)
      toast({
        title: "Kategorie erstellt",
        description: `Die Kategorie "${category.name}" wurde erfolgreich erstellt.`,
      })
    } catch (error) {
      console.error("Fehler beim Erstellen der Kategorie:", error)
      toast({
        title: "Fehler",
        description: "Die Kategorie konnte nicht erstellt werden.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateCategory = async (category: Partial<Category>) => {
    if (!selectedCategory) return

    try {
      setIsSubmitting(true)
      await updateCategory({ ...selectedCategory, ...category })
      setIsEditDialogOpen(false)
      setSelectedCategory(null)
      toast({
        title: "Kategorie aktualisiert",
        description: `Die Kategorie "${category.name}" wurde erfolgreich aktualisiert.`,
      })
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Kategorie:", error)
      toast({
        title: "Fehler",
        description: "Die Kategorie konnte nicht aktualisiert werden.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCategory = async (category: Category) => {
    try {
      setIsDeleting(true)
      await deleteCategory(category.id)
      setCategoryToDelete(null)
      toast({
        title: "Kategorie gelöscht",
        description: `Die Kategorie "${category.name}" wurde erfolgreich gelöscht.`,
      })
    } catch (error) {
      console.error("Fehler beim Löschen der Kategorie:", error)
      toast({
        title: "Fehler",
        description: "Die Kategorie konnte nicht gelöscht werden.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title>Kategorien verwalten</Title>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              Neue Kategorie
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <CategoryForm
              onSubmit={handleAddCategory}
              onCancel={() => setIsAddDialogOpen(false)}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
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
                  Möchten Sie die Kategorie <BoldText>"{categoryToDelete.name}"</BoldText> wirklich löschen?
                  {categoryUsage[categoryToDelete.id] > 0 && (
                    <span>
                      {" "}
                      Diese Kategorie wird in <BoldText>{categoryUsage[categoryToDelete.id]}</BoldText> Guidelines
                      verwendet.
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

          <div className="border rounded-md p-4 max-h-[600px] overflow-y-auto">
            {filteredCategories.length > 0 ? (
              <div className="space-y-2">
                {filteredCategories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
                    <div className="flex items-center gap-3">
                      {category.svgContent && (
                        <div
                          className="w-8 h-8 flex items-center justify-center bg-white rounded border"
                          dangerouslySetInnerHTML={{ __html: category.svgContent }}
                        />
                      )}
                      <div>
                        <div className="font-medium">{category.name}</div>
                        {category.description && (
                          <SmallText className="text-muted-foreground line-clamp-1">{category.description}</SmallText>
                        )}
                      </div>
                      <Badge variant="outline">{categoryUsage[category.id] || 0} Guidelines</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Dialog
                        open={isEditDialogOpen && selectedCategory?.id === category.id}
                        onOpenChange={(open) => {
                          setIsEditDialogOpen(open)
                          if (!open) setSelectedCategory(null)
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCategory(category)
                              setIsEditDialogOpen(true)
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Edit size={14} />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[550px]">
                          {selectedCategory && (
                            <CategoryForm
                              initialCategory={selectedCategory}
                              onSubmit={handleUpdateCategory}
                              onCancel={() => {
                                setIsEditDialogOpen(false)
                                setSelectedCategory(null)
                              }}
                              isSubmitting={isSubmitting}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
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
      </Card>
    </div>
  )
}
