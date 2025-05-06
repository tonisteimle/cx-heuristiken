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
import { Pencil, Trash2, Search, X, LayoutGrid, List } from "lucide-react"
import type { Principle, PrincipleElement } from "@/types/guideline"
import { PrincipleDetailDialog } from "./principle-detail-dialog"

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
    description: "",
    element: "ui",
  })
  const [selectedPrinciple, setSelectedPrinciple] = useState<Principle | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  // Alle möglichen Elemente für die Filterung
  const elements: PrincipleElement[] = ["all", "ui", "ux", "content", "other"]

  // Filtere die Principles basierend auf Suchbegriff und ausgewähltem Element
  const filteredPrinciples = principles.filter(
    (principle) =>
      (searchTerm === "" ||
        principle.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        principle.description?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedElement === "all" || principle.element === selectedElement),
  )

  const handleAddPrinciple = () => {
    if (!newPrinciple.title || !newPrinciple.description) return

    const principle: Principle = {
      id: `principle-${Date.now()}`,
      title: newPrinciple.title,
      description: newPrinciple.description,
      element: (newPrinciple.element as PrincipleElement) || "other",
      createdAt: new Date().toISOString(),
    }

    const updatedPrinciples = [...principles, principle]
    onSave(updatedPrinciples)
    setNewPrinciple({ title: "", description: "", element: "ui" })
    onAddDialogOpenChange(false)
  }

  const handleEditPrinciple = () => {
    if (!editingPrinciple || !editingPrinciple.title || !editingPrinciple.description) return

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrinciples.map((principle) => (
            <Card
              key={principle.id}
              className="overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => openDetailDialog(principle)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{principle.title}</CardTitle>
                <Badge variant="outline" className="text-xs w-fit mt-1">
                  {principle.element}
                </Badge>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">{principle.description}</p>
                {principle.imageUrl && (
                  <div className="mt-4 h-32 overflow-hidden rounded-md">
                    <img
                      src={principle.imageUrl || "/placeholder.svg"}
                      alt={principle.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?key=sdnoa"
                      }}
                    />
                  </div>
                )}
              </CardContent>
              {isAuthenticated && (
                <div className="p-4 pt-2 flex justify-end gap-2">
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
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPrinciples.map((principle) => (
            <Card
              key={principle.id}
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => openDetailDialog(principle)}
            >
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{principle.title}</h3>
                    <Badge variant="outline" className="text-xs mt-1">
                      {principle.element}
                    </Badge>
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
                {principle.imageUrl && (
                  <div className="mt-4 h-32 overflow-hidden rounded-md">
                    <img
                      src={principle.imageUrl || "/placeholder.svg"}
                      alt={principle.title}
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
        <DialogContent className="sm:max-w-[500px]">
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
                value={newPrinciple.title || ""}
                onChange={(e) => setNewPrinciple({ ...newPrinciple, title: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="element" className="text-right">
                Element
              </Label>
              <Select
                value={newPrinciple.element || "ui"}
                onValueChange={(value) => setNewPrinciple({ ...newPrinciple, element: value as PrincipleElement })}
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
        <DialogContent className="sm:max-w-[500px]">
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
                  value={editingPrinciple.title}
                  onChange={(e) => setEditingPrinciple({ ...editingPrinciple, title: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-element" className="text-right">
                  Element
                </Label>
                <Select
                  value={editingPrinciple.element}
                  onValueChange={(value) =>
                    setEditingPrinciple({ ...editingPrinciple, element: value as PrincipleElement })
                  }
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
