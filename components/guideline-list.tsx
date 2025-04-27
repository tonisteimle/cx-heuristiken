"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, X } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import GuidelineForm from "@/components/guideline-form" // Korrigierter Import
import { GuidelineDetailDialog } from "@/components/guideline-detail-dialog"
import { useAppContext } from "@/contexts/app-context"
import { useToast } from "@/components/ui/use-toast"
import type { Guideline } from "@/types/guideline"
import { Title, MutedText } from "@/components/ui/typography"

interface GuidelineListProps {
  categoryFilter?: string[]
}

export function GuidelineList({ categoryFilter }: GuidelineListProps) {
  const { state, addGuideline } = useAppContext()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedGuideline, setSelectedGuideline] = useState<Guideline | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filteredGuidelines, setFilteredGuidelines] = useState<Guideline[]>([])

  // Filtern der Guidelines basierend auf Suchbegriff und Kategorie-Filter
  useEffect(() => {
    let filtered = [...state.guidelines]

    // Filtern nach Kategorien, wenn ein Filter gesetzt ist
    if (categoryFilter && categoryFilter.length > 0) {
      filtered = filtered.filter((guideline) => guideline.categories.some((catId) => categoryFilter.includes(catId)))
    }

    // Filtern nach Suchbegriff
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (guideline) =>
          guideline.title.toLowerCase().includes(searchLower) ||
          guideline.text.toLowerCase().includes(searchLower) ||
          (guideline.justification && guideline.justification.toLowerCase().includes(searchLower)),
      )
    }

    // Sortieren nach Erstellungsdatum (neueste zuerst)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    setFilteredGuidelines(filtered)
  }, [state.guidelines, searchTerm, categoryFilter])

  const handleAddGuideline = async (guideline: Partial<Guideline>) => {
    try {
      setIsSubmitting(true)
      await addGuideline(guideline as Guideline)
      setIsAddDialogOpen(false)
      toast({
        title: "Guideline erstellt",
        description: "Die Guideline wurde erfolgreich erstellt.",
      })
    } catch (error) {
      console.error("Fehler beim Erstellen der Guideline:", error)
      toast({
        title: "Fehler",
        description: "Die Guideline konnte nicht erstellt werden.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGuidelineClick = (guideline: Guideline) => {
    setSelectedGuideline(guideline)
    setIsDetailDialogOpen(true)
  }

  // Funktion zum Abrufen des Kategorienamens anhand der ID
  const getCategoryName = (categoryId: string) => {
    const category = state.categories.find((cat) => cat.id === categoryId)
    return category ? category.name : categoryId
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title>Guidelines</Title>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              Neue Guideline
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <GuidelineForm
              existingCategories={state.categories}
              existingPrinciples={state.principles}
              onSubmit={handleAddGuideline}
              onAddPrinciple={() => {}}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Guidelines durchsuchen..."
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

      {filteredGuidelines.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-auto">
          {filteredGuidelines.map((guideline) => {
            const hasImage = !!(guideline.svgContent || guideline.imageUrl)

            return (
              <Card
                key={guideline.id}
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow flex flex-col"
                onClick={() => handleGuidelineClick(guideline)}
              >
                {hasImage && (
                  <div className="aspect-video bg-muted/30 flex items-center justify-center overflow-hidden">
                    {guideline.svgContent ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: guideline.svgContent }}
                        className="w-full h-full flex items-center justify-center p-4"
                      />
                    ) : guideline.imageUrl ? (
                      <img
                        src={guideline.imageUrl || "/placeholder.svg"}
                        alt={guideline.title}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                )}
                <CardContent className={`p-4 flex-1 flex flex-col ${hasImage ? "" : "pt-4"}`}>
                  <h3 className="font-medium text-lg mb-1 line-clamp-2">{guideline.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3 flex-1">{guideline.text}</p>
                  <div className="flex flex-wrap gap-1 mt-auto">
                    {guideline.categories.slice(0, 3).map((categoryId) => (
                      <Badge key={categoryId} variant="outline">
                        {getCategoryName(categoryId)}
                      </Badge>
                    ))}
                    {guideline.categories.length > 3 && (
                      <Badge variant="outline">+{guideline.categories.length - 3}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <MutedText>
            {searchTerm
              ? "Keine Guidelines gefunden"
              : categoryFilter && categoryFilter.length > 0
                ? "Keine Guidelines in dieser Kategorie"
                : "Keine Guidelines vorhanden"}
          </MutedText>
        </div>
      )}

      {selectedGuideline && (
        <GuidelineDetailDialog
          guideline={selectedGuideline}
          isOpen={isDetailDialogOpen}
          onClose={() => {
            setIsDetailDialogOpen(false)
            setSelectedGuideline(null)
          }}
        />
      )}
    </div>
  )
}
