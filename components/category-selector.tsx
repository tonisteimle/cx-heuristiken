"use client"

import { useState, useRef } from "react"
import { PlusCircle, X, Search, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BodyText, MutedText, SmallText } from "@/components/ui/typography"

interface CategorySelectorProps {
  existingCategories: string[]
  selectedCategories: string[]
  onChange: (selectedCategories: string[]) => void
}

export function CategorySelector({ existingCategories, selectedCategories, onChange }: CategorySelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [lastSelectedCategory, setLastSelectedCategory] = useState<string | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Dialog-State für neue Kategorien
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newCategory, setNewCategory] = useState("")

  // Ändern Sie die addCategory-Funktion, um sicherzustellen, dass die Kategorie korrekt hinzugefügt wird
  const addCategory = (category: string) => {
    if (category && !selectedCategories.includes(category)) {
      const updatedCategories = [...selectedCategories, category]
      onChange(updatedCategories)

      // Visuelles Feedback
      setLastSelectedCategory(category)
      setTimeout(() => setLastSelectedCategory(null), 1000)

      // Schließe die Suche nach dem Hinzufügen
      setSearchTerm("")
      setIsSearching(false)
    }
  }

  // Ändern Sie die handleAddNewCategory-Funktion, um sicherzustellen, dass die Kategorie korrekt hinzugefügt wird
  const handleAddNewCategory = () => {
    if (!newCategory) return

    // Füge die neue Kategorie hinzu und aktualisiere den State
    addCategory(newCategory)

    // Setze den Dialog zurück
    setNewCategory("")
    setIsDialogOpen(false)

    // Schließe die Suche
    setSearchTerm("")
    setIsSearching(false)
  }

  const removeCategory = (category: string) => {
    onChange(selectedCategories.filter((c) => c !== category))
  }

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      removeCategory(category)
    } else {
      addCategory(category)
    }
  }

  // Filter categories based on search term
  const filteredCategories = searchTerm
    ? existingCategories.filter((category) => category.toLowerCase().includes(searchTerm.toLowerCase()))
    : existingCategories

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <Label>Kategorien</Label>
        {/* Neuer Button für "Neue Kategorie" */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-1 ml-auto"
        >
          <PlusCircle size={14} />
          Neue Kategorie
        </Button>
      </div>

      {/* Suchfeld und Dropdown für existierende Kategorien */}
      <div className="relative">
        <div className="flex items-center border rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          <Search className="h-4 w-4 mr-2 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Kategorien suchen und auswählen..."
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
              {filteredCategories.length > 0 ? (
                <div className="space-y-1">
                  {filteredCategories.map((category) => (
                    <div
                      key={category}
                      className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-muted ${
                        selectedCategories.includes(category) ? "bg-secondary/20" : ""
                      }`}
                      onClick={() => {
                        toggleCategory(category)
                        searchInputRef.current?.focus()
                      }}
                    >
                      <div className="font-medium flex items-center">
                        {selectedCategories.includes(category) && <Check className="h-4 w-4 mr-2 text-primary" />}
                        <BodyText>{category}</BodyText>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <MutedText>Keine passenden Kategorien gefunden</MutedText>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsSearching(false)
                      setIsDialogOpen(true)
                      setNewCategory(searchTerm) // Suchbegriff als Vorschlag übernehmen
                    }}
                    className="mt-2 flex items-center gap-1"
                  >
                    <PlusCircle size={14} />
                    Neue Kategorie erstellen
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isSearching && <div className="fixed inset-0 z-0" onClick={() => setIsSearching(false)} />}

      {/* Ausgewählte Kategorien NACH dem Suchfeld */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-4 p-3 border rounded-md bg-muted/20">
          {selectedCategories.map((category) => (
            <Badge
              key={category}
              variant="secondary"
              className={`flex items-center gap-2 px-3 py-1.5 transition-all duration-300 ${
                lastSelectedCategory === category ? "bg-primary text-primary-foreground scale-110" : ""
              }`}
            >
              <SmallText>{category}</SmallText>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 opacity-50 hover:opacity-100"
                onClick={() => removeCategory(category)}
              >
                <X size={12} />
                <span className="sr-only">Remove {category}</span>
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Dialog zum Hinzufügen einer neuen Kategorie */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Neue Kategorie hinzufügen</DialogTitle>
            <DialogDescription>Erstellen Sie eine neue Kategorie für Ihre Guidelines.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category-name">Name der Kategorie</Label>
              <Input
                id="category-name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Name der Kategorie eingeben"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newCategory) {
                    e.preventDefault()
                    handleAddNewCategory()
                  }
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button type="button" onClick={handleAddNewCategory} disabled={!newCategory}>
              Kategorie hinzufügen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
