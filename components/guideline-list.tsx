"use client"
import { useState } from "react"
import type React from "react"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Pencil, Trash2, Search, X, LayoutGrid, List, BookOpen } from "lucide-react"
import type { Guideline, Principle } from "@/types/guideline"
import { PrincipleDetailDialog } from "./principle-detail-dialog"

// Importiere die Masonry-Komponenten am Anfang der Datei
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"

interface GuidelineListProps {
  guidelines: Guideline[]
  principles: Principle[]
  onEdit: (guideline: Guideline) => void
  onDelete: (id: string) => void
  isAuthenticated: boolean
  headerHeight: number
  inFixedHeader: boolean
  searchTerm: string
  onSearchChange: (term: string) => void
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
  viewMode: "grid" | "list"
  onViewModeChange: (mode: "grid" | "list") => void
}

export default function GuidelineList({
  guidelines,
  principles,
  onEdit,
  onDelete,
  isAuthenticated,
  headerHeight,
  inFixedHeader,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  viewMode,
  onViewModeChange,
}: GuidelineListProps) {
  const [selectedPrinciple, setSelectedPrinciple] = useState<Principle | null>(null)
  const [principleDialogOpen, setPrincipleDialogOpen] = useState(false)

  // Extrahiere alle eindeutigen Kategorien aus den Guidelines
  const allCategories = Array.from(new Set(guidelines.flatMap((g) => g.categories || [])))
    .filter(Boolean)
    .sort()

  // Filtere die Guidelines basierend auf Suchbegriff und ausgewählter Kategorie
  const filteredGuidelines = guidelines.filter(
    (guideline) =>
      (searchTerm === "" ||
        guideline.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guideline.text.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedCategory === null || guideline.categories.includes(selectedCategory)),
  )

  // Funktion zum Löschen einer Guideline mit Bestätigung
  const handleDelete = (id: string) => {
    if (window.confirm("Sind Sie sicher, dass Sie diese Guideline löschen möchten?")) {
      onDelete(id)
    }
  }

  // Funktion zum Abrufen der verknüpften Prinzipien für eine Guideline
  const getLinkedPrinciples = (guideline: Guideline) => {
    return principles.filter((principle) => guideline.principles.includes(principle.id))
  }

  // Funktion zum Öffnen des Prinzip-Detail-Dialogs
  const openPrincipleDialog = (principle: Principle, e: React.MouseEvent) => {
    e.stopPropagation() // Verhindert Event-Bubbling
    setSelectedPrinciple(principle)
    setPrincipleDialogOpen(true)
  }

  // Funktion zum Bearbeiten eines Prinzips (Dummy-Funktion, da wir keine Bearbeitung implementieren)
  const handleEditPrinciple = (principle: Principle) => {
    // Diese Funktion wird nicht implementiert, da wir keine Bearbeitung von Prinzipien aus dem Guideline-Kontext erlauben
    setPrincipleDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      {!inFixedHeader && (
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Guidelines durchsuchen..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => onSearchChange("")}
              >
                <X size={14} />
              </Button>
            )}
          </div>

          <Select
            value={selectedCategory || "all"}
            onValueChange={(value) => onCategoryChange(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Alle Kategorien" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Kategorien</SelectItem>
              {allCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="text-xs text-muted-foreground whitespace-nowrap">
            {filteredGuidelines.length} von {guidelines.length}
            {(searchTerm || selectedCategory) && " (gefiltert)"}
          </div>

          <div className="flex gap-2 ml-auto">
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => value && onViewModeChange(value as "grid" | "list")}
            >
              <ToggleGroupItem value="grid" size="sm" aria-label="Kachelansicht">
                <LayoutGrid size={16} />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" size="sm" aria-label="Listenansicht">
                <List size={16} />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      )}

      {filteredGuidelines.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Keine Guidelines gefunden.</p>
          {(searchTerm || selectedCategory) && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                onSearchChange("")
                onCategoryChange(null)
              }}
            >
              Filter zurücksetzen
            </Button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 1100: 3, 1500: 4 }}>
          <Masonry gutter="24px">
            {filteredGuidelines.map((guideline) => {
              // Bestimme die Größe der Karte basierend auf dem Inhalt
              const hasImage = !!guideline.imageUrl || !!guideline.svgContent
              const textLength = guideline.text.length
              const categoriesCount = guideline.categories.length

              // Berechne eine deterministische "Zufälligkeit" basierend auf der ID
              const hash = guideline.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
              const randomFactor = hash % 3 // 0, 1, oder 2

              // Bestimme die Größe basierend auf Inhalt und "Zufall"
              let cardSize = "medium"
              if ((textLength > 300 && hasImage) || randomFactor === 2) {
                cardSize = "large"
              } else if ((textLength < 100 && !hasImage) || randomFactor === 0) {
                cardSize = "small"
              }

              // Bestimme die Bildhöhe basierend auf der Kartengröße
              const imageHeight = cardSize === "small" ? "h-32" : cardSize === "large" ? "h-56" : "h-40"

              // Hole die verknüpften Prinzipien
              const linkedPrinciples = getLinkedPrinciples(guideline)

              return (
                <Card key={guideline.id} className={`overflow-hidden flex flex-col mb-6`}>
                  <CardHeader className={`pb-2 ${cardSize === "small" ? "p-3" : cardSize === "large" ? "p-5" : "p-4"}`}>
                    <CardTitle className={cardSize === "large" ? "text-xl" : "text-lg"}>{guideline.title}</CardTitle>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {guideline.categories.map((category) => (
                        <Badge key={category} variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent
                    className={`flex-grow ${cardSize === "small" ? "px-3 py-1" : cardSize === "large" ? "px-5 py-1" : "px-4 py-1"}`}
                  >
                    {/* Bild vor dem Text anzeigen mit variabler Höhe */}
                    {(guideline.svgContent || guideline.imageUrl) && (
                      <div
                        className={`mb-4 ${imageHeight} overflow-hidden rounded-md flex items-center justify-center`}
                      >
                        {guideline.svgContent ? (
                          <div dangerouslySetInnerHTML={{ __html: guideline.svgContent }} className="w-full h-full" />
                        ) : guideline.imageUrl ? (
                          <img
                            src={guideline.imageUrl || "/placeholder.svg"}
                            alt={guideline.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?key=sdnoa"
                            }}
                          />
                        ) : null}
                      </div>
                    )}

                    {/* Vollständiger Text ohne line-clamp */}
                    <p className="text-sm text-muted-foreground mb-4">{guideline.text}</p>
                    {/* Justification anzeigen, falls vorhanden */}
                    {guideline.justification && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-1">Begründung:</h4>
                        <p className="text-sm text-muted-foreground">{guideline.justification}</p>
                      </div>
                    )}

                    {/* Verknüpfte Prinzipien als Mini-Kacheln anzeigen */}
                    {linkedPrinciples.length > 0 && (
                      <div className="mt-3 pt-2 border-t">
                        <div className="flex items-center gap-1 mb-2">
                          <BookOpen size={14} className="text-muted-foreground" />
                          <p className="text-xs font-medium text-muted-foreground">Psychologische Prinzipien:</p>
                        </div>
                        <div className="space-y-2">
                          {linkedPrinciples.map((principle) => (
                            <div
                              key={principle.id}
                              className="bg-gray-50 p-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                              onClick={(e) => openPrincipleDialog(principle, e)}
                            >
                              <h4 className="text-sm font-medium">{principle.title || principle.name}</h4>
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{principle.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  {isAuthenticated && (
                    <CardFooter
                      className={`pt-1 flex justify-end gap-2 ${cardSize === "small" ? "p-2" : cardSize === "large" ? "p-3" : "p-2"}`}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-gray-700"
                        onClick={() => onEdit(guideline)}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-gray-700"
                        onClick={() => handleDelete(guideline.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              )
            })}
          </Masonry>
        </ResponsiveMasonry>
      ) : (
        <div className="space-y-4">
          {filteredGuidelines.map((guideline) => {
            // Hole die verknüpften Prinzipien
            const linkedPrinciples = getLinkedPrinciples(guideline)

            return (
              <Card key={guideline.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-56 h-40 md:h-auto overflow-hidden flex items-center justify-center">
                    {guideline.svgContent ? (
                      <div dangerouslySetInnerHTML={{ __html: guideline.svgContent }} className="w-full h-full" />
                    ) : guideline.imageUrl ? (
                      <img
                        src={guideline.imageUrl || "/placeholder.svg"}
                        alt={guideline.title}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?key=sdnoa"
                        }}
                      />
                    ) : (
                      <div className="text-gray-400 text-xs">Kein Bild verfügbar</div>
                    )}
                  </div>
                  <div className="flex-grow flex flex-col p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{guideline.title}</h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {guideline.categories.map((category) => (
                            <Badge key={category} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {isAuthenticated && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => onEdit(guideline)}>
                            <Pencil size={14} className="mr-1" />
                            Bearbeiten
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(guideline.id)}>
                            <Trash2 size={14} className="mr-1" />
                            Löschen
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Vollständiger Text ohne line-clamp */}
                    <p className="text-sm text-muted-foreground mt-2 mb-4">{guideline.text}</p>
                    {/* Justification anzeigen, falls vorhanden */}
                    {guideline.justification && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-1">Begründung:</h4>
                        <p className="text-sm text-muted-foreground">{guideline.justification}</p>
                      </div>
                    )}

                    {/* Verknüpfte Prinzipien als Mini-Kacheln anzeigen */}
                    {linkedPrinciples.length > 0 && (
                      <div className="mt-3 pt-2 border-t">
                        <div className="flex items-center gap-1 mb-2">
                          <BookOpen size={14} className="text-muted-foreground" />
                          <p className="text-xs font-medium text-muted-foreground">Psychologische Prinzipien:</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {linkedPrinciples.map((principle) => (
                            <div
                              key={principle.id}
                              className="bg-gray-50 p-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                              onClick={(e) => openPrincipleDialog(principle, e)}
                            >
                              <h4 className="text-sm font-medium">{principle.title || principle.name}</h4>
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{principle.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Principle-Detail-Dialog */}
      <PrincipleDetailDialog
        principle={selectedPrinciple}
        open={principleDialogOpen}
        onOpenChange={setPrincipleDialogOpen}
        onEdit={handleEditPrinciple}
      />
    </div>
  )
}
