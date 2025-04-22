"use client"

import { useState, useRef } from "react"
import { Search, Check, X, PlusCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Principle } from "@/types/guideline"
import { BodyText, SmallText, MutedText } from "@/components/ui/typography"

interface PrincipleSelectorProps {
  principles: Principle[]
  selectedPrinciples: string[]
  onChange: (selectedPrinciples: string[]) => void
  onAddNewPrinciple: (principle: Principle) => void
}

export function PrincipleSelector({
  principles,
  selectedPrinciples,
  onChange,
  onAddNewPrinciple,
}: PrincipleSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [lastSelectedPrinciple, setLastSelectedPrinciple] = useState<string | null>(null)

  // Neuer Dialog-State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newPrinciple, setNewPrinciple] = useState<{ name: string; description: string }>({
    name: "",
    description: "",
  })

  const [localSelectedPrinciples, setLocalSelectedPrinciples] = useState<string[]>(selectedPrinciples)

  const addPrinciple = (principleId: string) => {
    if (!localSelectedPrinciples.includes(principleId)) {
      const updatedPrinciples = [...localSelectedPrinciples, principleId]
      setLocalSelectedPrinciples(updatedPrinciples)
      onChange(updatedPrinciples)
      // Setze das zuletzt ausgewählte Prinzip für visuelles Feedback
      setLastSelectedPrinciple(principleId)
      // Nach 1 Sekunde zurücksetzen
      setTimeout(() => setLastSelectedPrinciple(null), 1000)
    }
  }

  const removePrinciple = (principleId: string) => {
    const updatedPrinciples = localSelectedPrinciples.filter((id) => id !== principleId)
    setLocalSelectedPrinciples(updatedPrinciples)
    onChange(updatedPrinciples)
  }

  const togglePrinciple = (principleId: string) => {
    if (localSelectedPrinciples.includes(principleId)) {
      removePrinciple(principleId)
    } else {
      addPrinciple(principleId)
    }
  }

  // Funktion zum Hinzufügen eines neuen Prinzips
  const handleAddNewPrinciple = () => {
    if (!newPrinciple.name || !newPrinciple.description) {
      return
    }

    const id = newPrinciple.name.toLowerCase().replace(/\s+/g, "-")
    const principle: Principle = {
      id,
      name: newPrinciple.name,
      description: newPrinciple.description,
    }

    onAddNewPrinciple(principle)

    // Neues Prinzip automatisch auswählen
    const updatedPrinciples = [...localSelectedPrinciples, id]
    setLocalSelectedPrinciples(updatedPrinciples)
    onChange(updatedPrinciples)

    // Dialog schließen und Formular zurücksetzen
    setIsDialogOpen(false)
    setNewPrinciple({ name: "", description: "" })
  }

  // Filter principles based on search term
  const filteredPrinciples = searchTerm
    ? principles.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : principles

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <Label>Psychologische Prinzipien</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-1"
        >
          <PlusCircle size={14} />
          Neues Prinzip
        </Button>
      </div>

      {principles.length > 0 ? (
        <div className="relative">
          <div className="flex items-center border rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
            <Search className="h-4 w-4 mr-2 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Prinzipien suchen und auswählen..."
              className="border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setIsSearching(true)
              }}
              onFocus={() => setIsSearching(true)}
            />
          </div>

          {isSearching && (
            <div className="absolute w-full z-10 mt-1 bg-popover border rounded-md shadow-md">
              <div className="max-h-[300px] overflow-y-auto p-2">
                {filteredPrinciples.length > 0 ? (
                  <div className="space-y-1">
                    {filteredPrinciples.map((principle) => (
                      <div
                        key={principle.id}
                        className={`flex items-start gap-2 p-2 rounded-md cursor-pointer hover:bg-muted ${
                          localSelectedPrinciples.includes(principle.id) ? "bg-secondary/20" : ""
                        }`}
                        onClick={() => {
                          togglePrinciple(principle.id)
                          // Keep focus in the search input
                          searchInputRef.current?.focus()
                        }}
                      >
                        <div className="flex-1">
                          <div className="font-medium flex items-center">
                            {localSelectedPrinciples.includes(principle.id) && (
                              <Check className="h-4 w-4 mr-2 text-primary" />
                            )}
                            <BodyText>{principle.name}</BodyText>
                          </div>
                          <MutedText className="line-clamp-2">{principle.description}</MutedText>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <MutedText>Keine Prinzipien gefunden</MutedText>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsSearching(false)
                        setIsDialogOpen(true)
                      }}
                      className="mt-2 flex items-center gap-1"
                    >
                      <PlusCircle size={14} />
                      Neues Prinzip erstellen
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <MutedText>
          Keine Prinzipien verfügbar. Fügen Sie Prinzipien im Prinzipien-Tab hinzu oder erstellen Sie ein neues Prinzip.
        </MutedText>
      )}

      {isSearching && <div className="fixed inset-0 z-0" onClick={() => setIsSearching(false)} />}

      {/* Ausgewählte Prinzipien NACH dem Suchfeld */}
      {localSelectedPrinciples.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-4 p-3 border rounded-md bg-muted/20">
          {localSelectedPrinciples.map((principleId) => {
            const principle = principles.find((p) => p.id === principleId)
            return (
              <Badge
                key={principleId}
                variant="secondary"
                className={`flex items-center gap-2 px-3 py-1.5 transition-all duration-300 ${
                  lastSelectedPrinciple === principleId ? "bg-primary text-primary-foreground scale-110" : ""
                }`}
              >
                <SmallText>{principle?.name || principleId}</SmallText>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1 opacity-50 hover:opacity-100"
                  onClick={() => removePrinciple(principleId)}
                >
                  <X size={12} />
                  <span className="sr-only">Remove {principle?.name || principleId}</span>
                </Button>
              </Badge>
            )
          })}
        </div>
      )}

      {/* Dialog zum Hinzufügen eines neuen Prinzips */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Neues psychologisches Prinzip hinzufügen</DialogTitle>
            <DialogDescription>
              Erstellen Sie ein neues Prinzip, das Sie dieser Guideline zuordnen können.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="principle-name">Name</Label>
              <Input
                id="principle-name"
                value={newPrinciple.name}
                onChange={(e) => setNewPrinciple({ ...newPrinciple, name: e.target.value })}
                placeholder="Name des Prinzips"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="principle-description">Beschreibung</Label>
              <Textarea
                id="principle-description"
                value={newPrinciple.description}
                onChange={(e) => setNewPrinciple({ ...newPrinciple, description: e.target.value })}
                placeholder="Beschreibung des Prinzips"
                className="min-h-[250px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button
              type="button"
              onClick={handleAddNewPrinciple}
              disabled={!newPrinciple.name || !newPrinciple.description}
            >
              Prinzip hinzufügen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
