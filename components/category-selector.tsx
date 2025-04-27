"use client"

import { useState } from "react"
import { X, Check, ChevronsUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"

// Ändern Sie die Schnittstelle für die verfügbaren Kategorien
interface CategoryOption {
  id: string
  name: string
}

interface CategorySelectorProps {
  selectedCategories: string[]
  availableCategories: CategoryOption[]
  onChange: (categories: string[]) => void
}

// Aktualisieren Sie die Komponente, um mit den neuen Kategorien zu arbeiten
export function CategorySelector({ selectedCategories, availableCategories, onChange }: CategorySelectorProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")

  // Filtere verfügbare Kategorien basierend auf Eingabe und bereits ausgewählten Kategorien
  const filteredCategories = availableCategories
    .filter(
      (category) =>
        category.name.toLowerCase().includes(inputValue.toLowerCase()) && !selectedCategories.includes(category.id),
    )
    .slice(0, 10)

  // Funktion zum Hinzufügen einer Kategorie
  const addCategory = (categoryId: string) => {
    if (!selectedCategories.includes(categoryId)) {
      onChange([...selectedCategories, categoryId])
    }
    setInputValue("")
  }

  // Funktion zum Entfernen einer Kategorie
  const removeCategory = (categoryId: string) => {
    onChange(selectedCategories.filter((id) => id !== categoryId))
  }

  // Funktion zum Erstellen einer neuen Kategorie
  const createNewCategory = () => {
    if (inputValue.trim()) {
      // Prüfe, ob die Kategorie bereits existiert
      const existingCategory = availableCategories.find((cat) => cat.name.toLowerCase() === inputValue.toLowerCase())

      if (existingCategory) {
        // Wenn die Kategorie existiert, füge sie hinzu
        addCategory(existingCategory.id)
      } else {
        // Hier würden wir normalerweise eine neue Kategorie erstellen
        // Da wir jetzt mit Kategorie-Objekten arbeiten, müssten wir hier
        // eine neue Kategorie erstellen und dann zur Datenbank hinzufügen
        // Für dieses Beispiel zeigen wir nur eine Warnung
        alert("Neue Kategorien können nur im Kategorien-Admin erstellt werden.")
      }
    }
  }

  // Funktion zum Abrufen des Kategorienamens anhand der ID
  const getCategoryName = (categoryId: string) => {
    const category = availableCategories.find((cat) => cat.id === categoryId)
    return category ? category.name : categoryId
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-10 py-2"
        >
          {selectedCategories.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selectedCategories.map((categoryId) => (
                <Badge key={categoryId} variant="secondary" className="mr-1 mb-1">
                  {getCategoryName(categoryId)}
                  <button
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      removeCategory(categoryId)
                    }}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">Kategorien auswählen...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Kategorie suchen..." value={inputValue} onValueChange={setInputValue} />
          <CommandList>
            <CommandEmpty>
              <div className="py-6 text-center text-sm">
                <p>Keine Kategorie gefunden.</p>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {filteredCategories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.name}
                  onSelect={() => {
                    addCategory(category.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedCategories.includes(category.id) ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {category.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
