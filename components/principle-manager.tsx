"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Trash2, Edit, Search, X, Info, FlaskRoundIcon as Flask } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import type { Principle, PrincipleElement } from "@/types/guideline"
import { ElementFilter } from "./element-filter"
import ImportEvidenzDialog from "./import-evidenz-dialog"
import { Badge } from "@/components/ui/badge"
import { Eye, Brain, HeartPulse, HandMetal, Globe } from "lucide-react"
import { AddPrincipleDialog } from "./add-principle-dialog"
import { EditPrincipleDialog } from "./edit-principle-dialog"
import PrincipleListView from "./principle-list-view"
import { LayoutGrid, List } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

// Importiere die Typografie-Komponenten
import {
  SectionTitle,
  SubsectionTitle,
  BodyText,
  MutedText,
  SmallText,
  CardTitleText,
  DialogTitleText,
} from "@/components/ui/typography"

interface PrincipleManagerProps {
  principles: Principle[]
  onSave: (principles: Principle[]) => void
  isAuthenticated: boolean
  isAddDialogOpen?: boolean
  onAddDialogOpenChange?: (open: boolean) => void
  headerHeight?: number
  inFixedHeader?: boolean
  searchTerm?: string
  onSearchChange?: (term: string) => void
  selectedElement?: PrincipleElement
  onElementChange?: (element: PrincipleElement) => void
  viewMode?: "grid" | "list"
  onViewModeChange?: (mode: "grid" | "list") => void
}

export default function PrincipleManager({
  principles,
  onSave,
  isAuthenticated,
  isAddDialogOpen: isAddDialogOpenProp = false,
  onAddDialogOpenChange,
  headerHeight = 73,
  inFixedHeader = false,
  searchTerm: externalSearchTerm,
  onSearchChange,
  selectedElement: externalSelectedElement,
  onElementChange,
  viewMode: externalViewMode = "grid",
  onViewModeChange,
}: PrincipleManagerProps) {
  // Verwende interne Zustände nur, wenn keine externen bereitgestellt werden
  const [internalSearchTerm, setInternalSearchTerm] = useState("")
  const [internalSelectedElement, setInternalSelectedElement] = useState<PrincipleElement>("all")
  const [internalViewMode, setInternalViewMode] = useState<"grid" | "list">("grid")

  // Verwende entweder externe oder interne Zustände
  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm
  const setSearchTerm = onSearchChange || setInternalSearchTerm
  const selectedElement = externalSelectedElement !== undefined ? externalSelectedElement : internalSelectedElement
  const setSelectedElement = onElementChange || setInternalSelectedElement
  const viewMode = externalViewMode !== undefined ? externalViewMode : internalViewMode
  const setViewMode = onViewModeChange || setInternalViewMode

  const [selectedPrinciple, setSelectedPrinciple] = useState<Principle | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [newPrinciple, setNewPrinciple] = useState<Principle>({ id: "", name: "", description: "", elements: [] })
  const [editingPrinciple, setEditingPrinciple] = useState<Principle | null>(null)
  const { toast } = useToast()

  // Element-Icons für die Anzeige
  const elementIcons: Record<string, React.ReactNode> = {
    input: <Eye className="h-4 w-4" />,
    processing: <Brain className="h-4 w-4" />,
    decision: <HeartPulse className="h-4 w-4" />,
    output: <HandMetal className="h-4 w-4" />,
    environment: <Globe className="h-4 w-4" />,
  }

  // Element-Namen für die Anzeige
  const elementNames: Record<string, string> = {
    input: "Eingabe",
    processing: "Verarbeitung",
    decision: "Entscheidung",
    output: "Ausgabe",
    environment: "Umgebung",
  }

  // Filter principles based on search term and selected element
  const filteredPrinciples = useMemo(() => {
    return principles
      .filter(
        (p) =>
          (searchTerm === "" ||
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (selectedElement === "all" || (p.elements && p.elements.includes(selectedElement))),
      )
      .sort((a, b) => a.name.localeCompare(b.name)) // Alphabetisch nach Namen sortieren
  }, [principles, searchTerm, selectedElement])

  const handleAddPrinciple = (newPrinciple: Principle) => {
    const updatedPrinciples = [...principles, newPrinciple]
    onSave(updatedPrinciples)
    if (onAddDialogOpenChange) {
      onAddDialogOpenChange(false)
    }
  }

  const handleUpdatePrinciple = (updatedPrinciple: Principle) => {
    const updatedPrinciples = principles.map((p) => (p.id === updatedPrinciple.id ? updatedPrinciple : p))
    onSave(updatedPrinciples)
    setIsEditDialogOpen(false)
    setEditingPrinciple(null)
  }

  const handleDeletePrinciple = (id: string) => {
    const updatedPrinciples = principles.filter((p) => p.id !== id)
    onSave(updatedPrinciples)
  }

  const handleImportEvidenz = (updatedPrinciples: Principle[]) => {
    onSave(updatedPrinciples)
  }

  const openEditDialog = (principle: Principle) => {
    if (!isAuthenticated) return
    setEditingPrinciple(principle)
    setIsEditDialogOpen(true)
  }

  const openPrincipleDetails = (principle: Principle) => {
    setSelectedPrinciple(principle)
  }

  const [isAddDialogOpenInternal, setIsAddDialogOpenInternal] = useState(false)
  const isAddDialogOpen = isAddDialogOpenProp !== undefined ? isAddDialogOpenProp : isAddDialogOpenInternal
  const setIsAddDialogOpen = onAddDialogOpenChange || setIsAddDialogOpenInternal

  // Berechne die Anzahl der Prinzipien pro Element
  const principleCountByElement = useMemo(() => {
    const counts: Record<string, number> = {
      input: 0,
      processing: 0,
      decision: 0,
      output: 0,
      environment: 0,
    }

    principles.forEach((principle) => {
      if (principle.elements && principle.elements.length > 0) {
        principle.elements.forEach((element) => {
          if (counts[element] !== undefined) {
            counts[element]++
          }
        })
      }
    })

    return counts
  }, [principles])

  // Only render the search and filter section if we're in the fixed header
  if (inFixedHeader) {
    return (
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Prinzipien durchsuchen..."
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
            {filteredPrinciples.length} von {principles.length}
            {searchTerm && " (gefiltert)"}
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

        {/* Element-Filter */}
        <ElementFilter
          selectedElement={selectedElement}
          onChange={setSelectedElement}
          principleCountByElement={principleCountByElement}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Prinzipien-Ansicht */}
      {filteredPrinciples.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
            {filteredPrinciples.map((principle) => (
              <Card
                key={principle.id}
                className="flex flex-col hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => openPrincipleDetails(principle)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitleText className="line-clamp-1">{principle.name}</CardTitleText>
                    {principle.elements && principle.elements.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {principle.elements.map((element) => (
                          <Badge key={element} variant="outline" className="flex items-center gap-1 px-2 py-1">
                            {elementIcons[element]}
                            <span className="text-xs">{elementNames[element]}</span>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-4 flex-1">
                  <BodyText className="text-muted-foreground text-sm line-clamp-3">{principle.description}</BodyText>

                  {/* Evidenz-Teaser hinzufügen, wenn Evidenz vorhanden ist */}
                  {principle.evidenz && (
                    <div className="mt-2 border-t pt-2">
                      <SmallText className="flex items-center text-muted-foreground mb-1">
                        <Flask size={12} className="mr-1" />
                        <span className="font-medium">Evidenz</span>
                      </SmallText>
                      <SmallText className="text-muted-foreground line-clamp-2">{principle.evidenz}</SmallText>
                    </div>
                  )}
                </CardContent>
                {isAuthenticated && (
                  <CardFooter className="pt-2 flex justify-between border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs flex items-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        openPrincipleDetails(principle)
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
                          openEditDialog(principle)
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeletePrinciple(principle.id)
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
          <PrincipleListView principles={filteredPrinciples} isAuthenticated={isAuthenticated} />
        )
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <SectionTitle>Keine Prinzipien gefunden</SectionTitle>
          <MutedText className="mt-2">
            {searchTerm || selectedElement !== "all"
              ? "Versuchen Sie einen anderen Suchbegriff oder Filter"
              : "Fügen Sie Ihr erstes Prinzip hinzu"}
          </MutedText>
          {(searchTerm || selectedElement !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("")
                setSelectedElement("all")
              }}
              className="mt-4"
            >
              Filter zurücksetzen
            </Button>
          )}
        </div>
      )}

      {/* Dialog zum Hinzufügen eines neuen Prinzips */}
      <AddPrincipleDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddPrinciple}
      />

      {/* Dialog zum Bearbeiten eines Prinzips */}
      {editingPrinciple && (
        <EditPrincipleDialog
          open={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          principle={editingPrinciple}
          onSubmit={handleUpdatePrinciple}
        />
      )}

      {/* Dialog für Prinzip-Details */}
      {selectedPrinciple && (
        <Dialog open={!!selectedPrinciple} onOpenChange={(open) => !open && setSelectedPrinciple(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitleText className="text-xl">{selectedPrinciple.name}</DialogTitleText>
            </DialogHeader>
            {selectedPrinciple.elements && selectedPrinciple.elements.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2 mb-4">
                {selectedPrinciple.elements.map((element) => (
                  <Badge key={element} variant="outline" className="flex items-center gap-1.5 px-2.5 py-1">
                    {elementIcons[element]}
                    <span>{elementNames[element]}</span>
                  </Badge>
                ))}
              </div>
            )}
            <div className="space-y-4 py-4">
              <div>
                <SubsectionTitle className="mb-2">Beschreibung</SubsectionTitle>
                <div className="bg-muted/70 p-4 rounded-md">
                  <p className="dialog-paragraph">{selectedPrinciple.description}</p>
                </div>
              </div>

              {/* Evidenz als einfacher Text anzeigen, wenn vorhanden */}
              {selectedPrinciple.evidenz && (
                <div>
                  <SubsectionTitle className="mb-2">Evidenz</SubsectionTitle>
                  <div className="bg-muted/70 p-4 rounded-md">
                    <p className="whitespace-pre-wrap dialog-paragraph">{selectedPrinciple.evidenz}</p>
                  </div>
                </div>
              )}

              {/* Implikation als einfacher Text anzeigen, wenn vorhanden */}
              {selectedPrinciple.implikation && (
                <div>
                  <SubsectionTitle className="mb-2">Implikation</SubsectionTitle>
                  <div className="bg-muted/70 p-4 rounded-md">
                    <p className="whitespace-pre-wrap dialog-paragraph">{selectedPrinciple.implikation}</p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex justify-between items-center border-t pt-4">
              <Button variant="outline" onClick={() => setSelectedPrinciple(null)}>
                Schließen
              </Button>
              {isAuthenticated && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      openEditDialog(selectedPrinciple)
                      setSelectedPrinciple(null)
                    }}
                    className="flex items-center gap-1"
                  >
                    <Edit size={16} />
                    Bearbeiten
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleDeletePrinciple(selectedPrinciple.id)
                      setSelectedPrinciple(null)
                    }}
                    className="flex items-center gap-1 text-muted-foreground"
                  >
                    <Trash2 size={16} />
                    Löschen
                  </Button>
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog zum Importieren von Evidenz */}
      <ImportEvidenzDialog
        open={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={handleImportEvidenz}
        existingPrinciples={principles}
      />
    </div>
  )
}
