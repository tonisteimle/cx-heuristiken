"use client"

import { useState, useMemo, useEffect } from "react"
import { Pencil, Trash2, BookOpen, Search, X, Info, LayoutGrid, List } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import type { Guideline, Principle } from "@/types/guideline"
import { CategoryButtonFilter } from "./category-button-filter"
import { FIXED_CATEGORIES } from "@/lib/constants"
import GuidelineListView from "@/components/guideline-list-view" // Absoluter Import für bessere Konsistenz
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { GuidelineDetailDialog } from "./guideline-detail-dialog"
// Importiere die Typografie-Komponenten
import {
  SectionTitle,
  BodyText,
  MutedText,
  SmallText,
  CardTitleText,
  DialogTitleText,
  DialogDescriptionText,
} from "@/components/ui/typography"

interface GuidelineListProps {
  guidelines: Guideline[]
  principles: Principle[]
  onEdit: (guideline: Guideline) => void
  onDelete: (id: string) => void
  isAuthenticated: boolean
  headerHeight?: number
  inFixedHeader?: boolean
  searchTerm?: string
  onSearchChange?: (term: string) => void
  selectedCategory?: string | null
  onCategoryChange?: (category: string | null) => void
  viewMode?: "grid" | "list"
  onViewModeChange?: (mode: "grid" | "list") => void
  hideCategoryFilter?: boolean // Neue Prop
}

export default function GuidelineList({
  guidelines,
  principles,
  onEdit,
  onDelete,
  isAuthenticated,
  headerHeight = 73,
  inFixedHeader = false,
  searchTerm: externalSearchTerm,
  onSearchChange,
  selectedCategory: externalSelectedCategory,
  onCategoryChange,
  viewMode: externalViewMode = "grid",
  onViewModeChange,
  hideCategoryFilter,
}: GuidelineListProps) {
  // Verwende interne Zustände nur, wenn keine externen bereitgestellt werden
  const [internalSearchTerm, setInternalSearchTerm] = useState("")
  const [internalSelectedCategory, setInternalSelectedCategory] = useState<string | null>(null)
  const [internalViewMode, setInternalViewMode] = useState<"grid" | "list">("grid")

  // Verwende entweder externe oder interne Zustände
  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm
  const setSearchTerm = onSearchChange || setInternalSearchTerm
  const selectedCategory = externalSelectedCategory !== undefined ? externalSelectedCategory : internalSelectedCategory
  const setSelectedCategory = onCategoryChange || setInternalSelectedCategory
  const viewMode = externalViewMode !== undefined ? externalViewMode : internalViewMode
  const setViewMode = onViewModeChange || setInternalViewMode

  const [selectedImageDialog, setSelectedImageDialog] = useState<string | null>(null)
  const [selectedGuideline, setSelectedGuideline] = useState<Guideline | null>(null)

  useEffect(() => {
    console.log(`GuidelineList received ${guidelines.length} guidelines`)
  }, [guidelines.length])

  // Berechne die Anzahl der Guidelines pro Kategorie
  const categoryUsage = useMemo(() => {
    const usage: Record<string, number> = {}
    FIXED_CATEGORIES.forEach((category) => {
      usage[category] = guidelines.filter((g) => g.categories.includes(category)).length
    })
    return usage
  }, [guidelines])

  // Filtern der Guidelines basierend auf Suchbegriff und ausgewählter Kategorie
  const filteredGuidelines = useMemo(() => {
    return guidelines.filter((guideline) => {
      // Nach Suchbegriff filtern
      const matchesSearch =
        searchTerm === "" ||
        guideline.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guideline.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guideline.justification?.toLowerCase().includes(searchTerm.toLowerCase())

      // Nach Kategorie filtern
      const matchesCategory = selectedCategory === null || guideline.categories.includes(selectedCategory)

      return matchesSearch && matchesCategory
    })
  }, [guidelines, searchTerm, selectedCategory])

  // Guideline-Details öffnen
  const openGuidelineDetails = (guideline: Guideline) => {
    setSelectedGuideline(guideline)
  }

  if (guidelines.length === 0 && !inFixedHeader) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">Noch keine Guidelines vorhanden</h3>
        <p className="text-muted-foreground mt-2">
          {isAuthenticated
            ? 'Erstellen Sie Ihre erste Guideline, indem Sie auf "Guideline hinzufügen" klicken.'
            : "Es wurden noch keine Guidelines erstellt."}
        </p>
      </div>
    )
  }

  // Only render the search and filter section if we're in the fixed header
  // or render the grid of guidelines if we're not in the fixed header
  if (inFixedHeader) {
    return (
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="relative flex-1 min-w-[200px]">
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

          <div className="text-xs text-muted-foreground whitespace-nowrap">
            {filteredGuidelines.length} von {guidelines.length}
            {(searchTerm || selectedCategory) && " (gefiltert)"}
          </div>

          <div className="flex gap-2 ml-auto">
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => value && setViewMode(value as "grid" | "list")}
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

        {/* Kategoriefilter als Buttons - Nur die festen Kategorien anzeigen */}
        {!hideCategoryFilter && (
          <CategoryButtonFilter
            selectedCategory={selectedCategory}
            onChange={setSelectedCategory}
            categoryCount={categoryUsage}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Ansicht basierend auf dem viewMode */}
      {viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-2">
          {filteredGuidelines.map((guideline) => (
            <Card
              key={guideline.id}
              className="flex flex-col hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => openGuidelineDetails(guideline)}
            >
              {/* Bild außerhalb von CardContent, damit es bis zum Rand geht */}
              {guideline.svgContent ? (
                <div className="relative w-full overflow-hidden rounded-t-lg flex justify-center bg-white p-4">
                  <div
                    dangerouslySetInnerHTML={{ __html: guideline.svgContent }}
                    className="w-[200px] h-[200px]"
                    style={{ width: "200px", height: "200px" }}
                  />
                </div>
              ) : guideline.imageUrl ? (
                <div
                  className="relative w-full overflow-hidden rounded-t-lg"
                  style={{ paddingBottom: "calc(230 / 490 * 100%)" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={guideline.imageUrl || "/placeholder.svg"}
                    alt="UI-Beispiel"
                    className="absolute inset-0 object-contain w-full h-full object-top"
                    onError={(e) => {
                      console.error("Error loading image in card preview")
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                </div>
              ) : null}

              <CardContent className={`p-4 pb-4 flex-1 ${guideline.imageUrl ? "" : "pt-4"}`}>
                {/* Titel nach dem Bild, ohne Begrenzung */}
                <CardTitleText className="mb-2">{guideline.title}</CardTitleText>

                <div className="mb-2">
                  <BodyText className="text-muted-foreground text-sm line-clamp-3">{guideline.text}</BodyText>
                </div>

                {/* Psychologische Prinzipien anzeigen, falls vorhanden */}
                {guideline.principles && guideline.principles.length > 0 && (
                  <div className="mt-2 border-t pt-2">
                    <SmallText className="text-muted-foreground mb-1 flex items-center">
                      <BookOpen size={12} className="mr-1" />
                      <span className="font-medium">Psychologische Prinzipien</span>
                    </SmallText>
                    <SmallText className="text-muted-foreground line-clamp-2">
                      {guideline.principles
                        .map((principleId) => {
                          const principle = principles.find((p) => p.id === principleId)
                          return principle ? principle.name : null
                        })
                        .filter(Boolean)
                        .join(", ")}
                    </SmallText>
                    <SmallText className="text-muted-foreground mt-1 line-clamp-2">
                      {(() => {
                        const firstPrincipleId = guideline.principles[0]
                        const firstPrinciple = principles.find((p) => p.id === firstPrincipleId)
                        return firstPrinciple ? firstPrinciple.description : ""
                      })()}
                    </SmallText>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-2">
                  {/* Nur die Kategorien anzeigen, die in FIXED_CATEGORIES enthalten sind */}
                  {guideline.categories
                    .filter((category) => FIXED_CATEGORIES.includes(category))
                    .map((category) => (
                      <Badge
                        key={category}
                        variant="secondary"
                        className="text-xs px-3 py-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Wenn die Kategorie bereits ausgewählt ist, entferne sie
                          if (selectedCategory === category) {
                            setSelectedCategory(null)
                          } else {
                            // Sonst füge sie hinzu
                            setSelectedCategory(category)
                          }
                        }}
                      >
                        {category}
                      </Badge>
                    ))}
                </div>
              </CardContent>
              {isAuthenticated && (
                <CardFooter className="pt-2 flex justify-between border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs flex items-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      openGuidelineDetails(guideline)
                    }}
                  >
                    <Info size={14} />
                    Details
                  </Button>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(guideline)
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(guideline.id)
                      }}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <GuidelineListView
          guidelines={filteredGuidelines}
          principles={principles}
          onEdit={onEdit}
          onDelete={onDelete}
          isAuthenticated={isAuthenticated}
          onViewDetails={openGuidelineDetails}
        />
      )}

      {/* Neuer Guideline-Detail-Dialog */}
      <GuidelineDetailDialog
        open={!!selectedGuideline}
        onOpenChange={(open) => !open && setSelectedGuideline(null)}
        guideline={selectedGuideline}
        principles={principles}
        isAuthenticated={isAuthenticated}
        onEdit={onEdit}
        onDelete={onDelete}
        onCategorySelect={(category) => {
          setSelectedCategory(category)
          setSelectedGuideline(null)
        }}
      />

      {/* Bild-Dialog für vergrößerte Ansicht */}
      <Dialog open={!!selectedImageDialog} onOpenChange={(open) => !open && setSelectedImageDialog(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitleText>UI-Beispiel</DialogTitleText>
            <DialogDescriptionText>Detailansicht des UI-Beispiels</DialogDescriptionText>
          </DialogHeader>
          <div className="mt-4 bg-muted rounded-md overflow-hidden">
            {selectedImageDialog && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={selectedImageDialog || "/placeholder.svg"}
                alt="UI-Beispiel (vergrößert)"
                className="w-full h-auto max-h-[70vh] object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg"
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Keine Ergebnisse */}
      {filteredGuidelines.length === 0 && (
        <div className="text-center py-12 border rounded-lg">
          <SectionTitle>Keine Guidelines gefunden</SectionTitle>
          <MutedText className="mt-2">
            Versuchen Sie, Ihre Suchkriterien anzupassen oder die Filter zurückzusetzen.
          </MutedText>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm("")
              setSelectedCategory(null)
            }}
            className="mt-4"
          >
            Filter zurücksetzen
          </Button>
        </div>
      )}
    </div>
  )
}
