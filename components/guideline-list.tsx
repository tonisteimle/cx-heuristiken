"use client"
import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Pencil, Trash2, Search, X, LayoutGrid, List } from "lucide-react"
import type { Guideline, Principle } from "@/types/guideline"
import { GuidelineDetailDialog } from "./guideline-detail-dialog"

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
  const [selectedGuideline, setSelectedGuideline] = useState<Guideline | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

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

  // Funktion zum Öffnen des Detail-Dialogs
  const openDetailDialog = (guideline: Guideline) => {
    setSelectedGuideline(guideline)
    setDetailDialogOpen(true)
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuidelines.map((guideline) => (
            <Card
              key={guideline.id}
              className="overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => openDetailDialog(guideline)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{guideline.title}</CardTitle>
                <div className="flex flex-wrap gap-1 mt-2">
                  {guideline.categories.map((category) => (
                    <Badge key={category} variant="outline" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                {/* Bild vor dem Text anzeigen */}
                <div className="mb-4 h-40 overflow-hidden rounded-md flex items-center justify-center">
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
                <p className="text-sm text-muted-foreground line-clamp-3">{guideline.text}</p>
              </CardContent>
              {isAuthenticated && (
                <CardFooter className="pt-2 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation() // Verhindert, dass der Dialog geöffnet wird
                      onEdit(guideline)
                    }}
                  >
                    <Pencil size={14} className="mr-1" />
                    Bearbeiten
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation() // Verhindert, dass der Dialog geöffnet wird
                      handleDelete(guideline.id)
                    }}
                  >
                    <Trash2 size={14} className="mr-1" />
                    Löschen
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGuidelines.map((guideline) => (
            <Card
              key={guideline.id}
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => openDetailDialog(guideline)}
            >
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation() // Verhindert, dass der Dialog geöffnet wird
                            onEdit(guideline)
                          }}
                        >
                          <Pencil size={14} className="mr-1" />
                          Bearbeiten
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation() // Verhindert, dass der Dialog geöffnet wird
                            handleDelete(guideline.id)
                          }}
                        >
                          <Trash2 size={14} className="mr-1" />
                          Löschen
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{guideline.text}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detail-Dialog */}
      <GuidelineDetailDialog
        guideline={selectedGuideline}
        principles={principles}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onEdit={onEdit}
      />
    </div>
  )
}
