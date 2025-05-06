"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Pencil, Trash2, Search, X, LayoutGrid, List, ChevronDown } from "lucide-react"
import type { Principle, PrincipleElement } from "@/types/guideline"
import { PrincipleDetailDialog } from "./principle-detail-dialog"

// Importiere die Masonry-Komponenten am Anfang der Datei
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"

interface PrincipleManagerProps {
  principles: Principle[]
  onSave: (principles: Principle[]) => Promise<boolean>
  isAuthenticated: boolean
  isAddDialogOpen: boolean
  onAddDialogOpenChange: (open: boolean) => void
  headerHeight: number
  inFixedHeader: boolean
  searchTerm: string
  onSearchChange: (term: string) => void
  selectedElement: PrincipleElement
  onElementChange: (element: PrincipleElement) => void
  viewMode: "grid" | "list"
  onViewModeChange: (mode: "grid" | "list") => void
}

export default function PrincipleManager({
  principles,
  onSave,
  isAuthenticated,
  isAddDialogOpen,
  onAddDialogOpenChange,
  headerHeight,
  inFixedHeader,
  searchTerm,
  onSearchChange,
  selectedElement,
  onElementChange,
  viewMode,
  onViewModeChange,
}: PrincipleManagerProps) {
  const [editingPrinciple, setEditingPrinciple] = useState<Principle | null>(null)
  const [newPrinciple, setNewPrinciple] = useState<Partial<Principle>>({
    title: "",
    name: "",
    description: "",
    element: "ui",
    elements: ["ui"],
  })
  const [selectedPrinciple, setSelectedPrinciple] = useState<Principle | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  // Alle möglichen Elemente für die Filterung
  const elements: PrincipleElement[] = ["all", "ui", "ux", "content", "other", "decision"]

  // Filtere die Principles basierend auf Suchbegriff und ausgewähltem Element
  const filteredPrinciples = principles.filter((principle) => {
    const titleMatch = (principle.title || principle.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    const descriptionMatch = principle.description.toLowerCase().includes(searchTerm.toLowerCase())

    const elementMatch =
      selectedElement === "all" ||
      principle.element === selectedElement ||
      (Array.isArray(principle.elements) && principle.elements.includes(selectedElement))

    return (searchTerm === "" || titleMatch || descriptionMatch) && elementMatch
  })

  const handleAddPrinciple = () => {
    if (!newPrinciple.title && !newPrinciple.name) return
    if (!newPrinciple.description) return

    const principle: Principle = {
      id: `principle-${Date.now()}`,
      title: newPrinciple.title || "",
      name: newPrinciple.name || newPrinciple.title || "",
      description: newPrinciple.description,
      element: (newPrinciple.element as PrincipleElement) || "other",
      elements: newPrinciple.elements || [(newPrinciple.element as PrincipleElement) || "other"],
      createdAt: new Date().toISOString(),
    }

    const updatedPrinciples = [...principles, principle]
    onSave(updatedPrinciples)
    setNewPrinciple({ title: "", name: "", description: "", element: "ui", elements: ["ui"] })
    onAddDialogOpenChange(false)
  }

  const handleEditPrinciple = () => {
    if (!editingPrinciple) return
    if (!editingPrinciple.title && !editingPrinciple.name) return
    if (!editingPrinciple.description) return

    const updatedPrinciple = {
      ...editingPrinciple,
      updatedAt: new Date().toISOString(),
    }

    const updatedPrinciples = principles.map((p) => (p.id === updatedPrinciple.id ? updatedPrinciple : p))
    onSave(updatedPrinciples)
    setEditingPrinciple(null)
  }

  const handleDeletePrinciple = (id: string) => {
    if (window.confirm("Sind Sie sicher, dass Sie dieses Prinzip löschen möchten?")) {
      const updatedPrinciples = principles.filter((p) => p.id !== id)
      onSave(updatedPrinciples)
    }
  }

  // Funktion zum Öffnen des Detail-Dialogs
  const openDetailDialog = (principle: Principle) => {
    setSelectedPrinciple(principle)
    setDetailDialogOpen(true)
  }

  // Funktion zum Anzeigen des Titels eines Prinzips
  const getPrincipleTitle = (principle: Principle) => {
    return principle.name || principle.title || ""
  }

  return (
    <div className="space-y-6">
      {!inFixedHeader && (
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Prinzipien durchsuchen..."
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

          <Select value={selectedElement} onValueChange={(value) => onElementChange(value as PrincipleElement)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Alle Elemente" />
            </SelectTrigger>
            <SelectContent>
              {elements.map((element) => (
                <SelectItem key={element} value={element}>
                  {element === "all" ? "Alle Elemente" : element.charAt(0).toUpperCase() + element.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="text-xs text-muted-foreground whitespace-nowrap">
            {filteredPrinciples.length} von {principles.length}
            {(searchTerm || selectedElement !== "all") && " (gefiltert)"}
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

      {filteredPrinciples.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Keine Prinzipien gefunden.</p>
          {(searchTerm || selectedElement !== "all") && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                onSearchChange("")
                onElementChange("all")
              }}
            >
              Filter zurücksetzen
            </Button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="container mx-auto px-4">
          <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 1100: 3, 1500: 4 }}>
            <Masonry gutter="24px">
              {filteredPrinciples.map((principle) => {
                // Bestimme die Größe der Karte basierend auf dem Inhalt
                const hasImage = !!principle.imageUrl
                const textLength = principle.description.length
                const hasEvidenz = !!(principle.evidenz || principle.evidence)

                // Berechne eine deterministische "Zufälligkeit" basierend auf der ID
                const hash = principle.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
                const randomFactor = hash % 3 // 0, 1, oder 2

                // Bestimme die Größe basierend auf Inhalt und "Zufall"
                let cardSize = "medium"
                if ((textLength > 300 && (hasImage || hasEvidenz)) || randomFactor === 2) {
                  cardSize = "large"
                } else if ((textLength < 100 && !hasImage) || randomFactor === 0) {
                  cardSize = "small"
                }

                // Bestimme die Bildhöhe basierend auf der Kartengröße
                const imageHeight = cardSize === "small" ? "h-24" : cardSize === "large" ? "h-48" : "h-32"

                return (
                  <Card
                    key={principle.id}
                    className={`overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-shadow mb-6`}
                    onClick={() => openDetailDialog(principle)}
                  >
                    <CardHeader
                      className={`pb-2 ${cardSize === "small" ? "p-3" : cardSize === "large" ? "p-4" : "p-3"}`}
                    >
                      <CardTitle className={cardSize === "large" ? "text-xl" : "text-lg"}>
                        {getPrincipleTitle(principle)}
                      </CardTitle>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(principle.elements || [principle.element]).filter(Boolean).map((element, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {element}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent
                      className={`flex-grow ${cardSize === "small" ? "px-3 py-1" : cardSize === "large" ? "px-4 py-1" : "px-3 py-1"}`}
                    >
                      <p className="text-sm text-muted-foreground">{principle.description}</p>

                      {/* Zeige Evidenz für Karten an, mit Begrenzung auf 3 Zeilen */}
                      {hasEvidenz && (
                        <div className="mt-3 pt-2 border-t">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Evidenz:</p>
                          <p className="text-xs text-muted-foreground line-clamp-3">
                            {principle.evidenz || principle.evidence}
                          </p>
                          {(principle.evidenz || principle.evidence || "").length > 150 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs mt-1 h-6 px-2 text-muted-foreground hover:text-foreground"
                              onClick={(e) => {
                                e.stopPropagation()
                                openDetailDialog(principle)
                              }}
                            >
                              Mehr anzeigen <ChevronDown className="ml-1 h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      )}

                      {principle.imageUrl && (
                        <div className={`mt-3 ${imageHeight} overflow-hidden rounded-md`}>
                          <img
                            src={principle.imageUrl || "/placeholder.svg"}
                            alt={getPrincipleTitle(principle)}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?key=sdnoa"
                            }}
                          />
                        </div>
                      )}
                    </CardContent>
                    {isAuthenticated && (
                      <div
                        className={`p-2 pt-1 flex justify-end gap-2 ${cardSize === "small" ? "p-2" : cardSize === "large" ? "p-3" : "p-2"}`}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-gray-700"
                          onClick={(e) => {
                            e.stopPropagation() // Verhindert, dass der Dialog geöffnet wird
                            setEditingPrinciple(principle)
                          }}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-gray-700"
                          onClick={(e) => {
                            e.stopPropagation() // Verhindert, dass der Dialog geöffnet wird
                            handleDeletePrinciple(principle.id)
                          }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    )}
                  </Card>
                )
              })}
            </Masonry>
          </ResponsiveMasonry>
        </div>
      ) : (
        <div className="container mx-auto px-4 space-y-4">
          {filteredPrinciples.map((principle) => (
            <Card
              key={principle.id}
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => openDetailDialog(principle)}
            >
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{getPrincipleTitle(principle)}</h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(principle.elements || [principle.element]).filter(Boolean).map((element, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {element}
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
                          setEditingPrinciple(principle)
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
                          handleDeletePrinciple(principle.id)
                        }}
                      >
                        <Trash2 size={14} className="mr-1" />
                        Löschen
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">{principle.description}</p>

                {/* Zeige Evidenz mit Begrenzung auf 3 Zeilen */}
                {(principle.evidenz || principle.evidence) && (
                  <div className="mt-3 pt-2 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Evidenz:</p>
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {principle.evidenz || principle.evidence}
                    </p>
                    {(principle.evidenz || principle.evidence || "").length > 150 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs mt-1 h-6 px-2 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation()
                          openDetailDialog(principle)
                        }}
                      >
                        Mehr anzeigen <ChevronDown className="ml-1 h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}

                {principle.imageUrl && (
                  <div className="mt-4 h-32 overflow-hidden rounded-md">
                    <img
                      src={principle.imageUrl || "/placeholder.svg"}
                      alt={getPrincipleTitle(principle)}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?key=sdnoa"
                      }}
                    />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog zum Hinzufügen eines neuen Prinzips */}
      <Dialog open={isAddDialogOpen} onOpenChange={onAddDialogOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Neues Prinzip hinzufügen</DialogTitle>
            <DialogDescription>Fügen Sie ein neues psychologisches Prinzip hinzu.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newPrinciple.name || ""}
                onChange={(e) => setNewPrinciple({ ...newPrinciple, name: e.target.value, title: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="element" className="text-right">
                Element
              </Label>
              <Select
                value={newPrinciple.element || "ui"}
                onValueChange={(value) => {
                  const elementValue = value as PrincipleElement
                  setNewPrinciple({
                    ...newPrinciple,
                    element: elementValue,
                    elements: [elementValue],
                  })
                }}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Element auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {elements
                    .filter((e) => e !== "all")
                    .map((element) => (
                      <SelectItem key={element} value={element}>
                        {element.charAt(0).toUpperCase() + element.slice(1)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Beschreibung
              </Label>
              <Textarea
                id="description"
                value={newPrinciple.description || ""}
                onChange={(e) => setNewPrinciple({ ...newPrinciple, description: e.target.value })}
                className="col-span-3"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="evidenz" className="text-right pt-2">
                Evidenz
              </Label>
              <Textarea
                id="evidenz"
                value={newPrinciple.evidenz || ""}
                onChange={(e) => setNewPrinciple({ ...newPrinciple, evidenz: e.target.value })}
                className="col-span-3"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="implikation" className="text-right pt-2">
                Implikation
              </Label>
              <Textarea
                id="implikation"
                value={newPrinciple.implikation || ""}
                onChange={(e) => setNewPrinciple({ ...newPrinciple, implikation: e.target.value })}
                className="col-span-3"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleAddPrinciple}>
              Hinzufügen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog zum Bearbeiten eines Prinzips */}
      <Dialog open={!!editingPrinciple} onOpenChange={(open) => !open && setEditingPrinciple(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prinzip bearbeiten</DialogTitle>
            <DialogDescription>Bearbeiten Sie die Details des Prinzips.</DialogDescription>
          </DialogHeader>
          {editingPrinciple && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={editingPrinciple.name || editingPrinciple.title || ""}
                  onChange={(e) =>
                    setEditingPrinciple({
                      ...editingPrinciple,
                      name: e.target.value,
                      title: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-element" className="text-right">
                  Element
                </Label>
                <Select
                  value={editingPrinciple.element || "other"}
                  onValueChange={(value) => {
                    const elementValue = value as PrincipleElement
                    setEditingPrinciple({
                      ...editingPrinciple,
                      element: elementValue,
                      elements: [elementValue],
                    })
                  }}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Element auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {elements
                      .filter((e) => e !== "all")
                      .map((element) => (
                        <SelectItem key={element} value={element}>
                          {element.charAt(0).toUpperCase() + element.slice(1)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-description" className="text-right pt-2">
                  Beschreibung
                </Label>
                <Textarea
                  id="edit-description"
                  value={editingPrinciple.description}
                  onChange={(e) => setEditingPrinciple({ ...editingPrinciple, description: e.target.value })}
                  className="col-span-3"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-evidenz" className="text-right pt-2">
                  Evidenz
                </Label>
                <Textarea
                  id="edit-evidenz"
                  value={editingPrinciple.evidenz || editingPrinciple.evidence || ""}
                  onChange={(e) =>
                    setEditingPrinciple({
                      ...editingPrinciple,
                      evidenz: e.target.value,
                      evidence: e.target.value,
                    })
                  }
                  className="col-span-3"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-implikation" className="text-right pt-2">
                  Implikation
                </Label>
                <Textarea
                  id="edit-implikation"
                  value={editingPrinciple.implikation || ""}
                  onChange={(e) => setEditingPrinciple({ ...editingPrinciple, implikation: e.target.value })}
                  className="col-span-3"
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" onClick={handleEditPrinciple}>
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail-Dialog */}
      <PrincipleDetailDialog
        principle={selectedPrinciple}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onEdit={setEditingPrinciple}
      />
    </div>
  )
}
