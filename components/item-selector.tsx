"use client"

import { useState, useRef } from "react"
import { PlusCircle, X, Search, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export interface Item {
  id: string
  name: string
  description?: string
}

interface ItemSelectorProps<T extends Item> {
  title: string
  items: T[]
  selectedItemIds: string[]
  onChange: (selectedItemIds: string[]) => void
  onAddNewItem: (item: Partial<T>) => void
  newItemTemplate: Partial<T>
  showDescription?: boolean
  searchPlaceholder?: string
  addButtonText?: string
  dialogTitle?: string
  dialogDescription?: string
  itemNameLabel?: string
  itemDescriptionLabel?: string
  noItemsFoundText?: string
  createNewItemText?: string
}

export function ItemSelector<T extends Item>({
  title,
  items,
  selectedItemIds,
  onChange,
  onAddNewItem,
  newItemTemplate,
  showDescription = false,
  searchPlaceholder = "Suchen und auswählen...",
  addButtonText = "Neu hinzufügen",
  dialogTitle = "Neues Element hinzufügen",
  dialogDescription = "Erstellen Sie ein neues Element.",
  itemNameLabel = "Name",
  itemDescriptionLabel = "Beschreibung",
  noItemsFoundText = "Keine Elemente gefunden",
  createNewItemText = "Neues Element erstellen",
}: ItemSelectorProps<T>) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [lastSelectedItemId, setLastSelectedItemId] = useState<string | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Dialog-State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newItem, setNewItem] = useState<Partial<T>>(newItemTemplate)

  const addItem = (itemId: string) => {
    if (!selectedItemIds.includes(itemId)) {
      onChange([...selectedItemIds, itemId])

      // Visuelles Feedback
      setLastSelectedItemId(itemId)
      setTimeout(() => setLastSelectedItemId(null), 1000)
    }
  }

  const handleAddNewItem = () => {
    if (!newItem.name) return

    onAddNewItem(newItem)
    setNewItem(newItemTemplate)
    setIsDialogOpen(false)
  }

  const removeItem = (itemId: string) => {
    onChange(selectedItemIds.filter((id) => id !== itemId))
  }

  const toggleItem = (itemId: string) => {
    if (selectedItemIds.includes(itemId)) {
      removeItem(itemId)
    } else {
      addItem(itemId)
    }
  }

  // Filter items based on search term
  const filteredItems = searchTerm
    ? items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    : items

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <Label>{title}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-1"
        >
          <PlusCircle size={14} />
          {addButtonText}
        </Button>
      </div>

      {/* Suchfeld und Dropdown */}
      <div className="relative">
        <div className="flex items-center border rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          <Search className="h-4 w-4 mr-2 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder={searchPlaceholder}
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
              {filteredItems.length > 0 ? (
                <div className="space-y-1">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-2 p-2 rounded-md cursor-pointer hover:bg-muted ${
                        selectedItemIds.includes(item.id) ? "bg-secondary/20" : ""
                      }`}
                      onClick={() => {
                        toggleItem(item.id)
                        // Keep focus in the search input
                        searchInputRef.current?.focus()
                      }}
                    >
                      <div className="flex-1">
                        <div className="font-medium flex items-center">
                          {selectedItemIds.includes(item.id) && <Check className="h-4 w-4 mr-2 text-primary" />}
                          {item.name}
                        </div>
                        {showDescription && item.description && (
                          <div className="text-sm text-muted-foreground line-clamp-2">{item.description}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>{noItemsFoundText}</p>
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
                    {createNewItemText}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isSearching && <div className="fixed inset-0 z-0" onClick={() => setIsSearching(false)} />}

      {/* Ausgewählte Items NACH dem Suchfeld */}
      {selectedItemIds.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-4 p-3 border rounded-md bg-muted/20">
          {selectedItemIds.map((itemId) => {
            const item = items.find((i) => i.id === itemId)
            return (
              <Badge
                key={itemId}
                variant="secondary"
                className={`flex items-center gap-2 px-3 py-1.5 transition-all duration-300 ${
                  lastSelectedItemId === itemId ? "bg-primary text-primary-foreground scale-110" : ""
                }`}
              >
                {item?.name || itemId}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1 opacity-50 hover:opacity-100"
                  onClick={() => removeItem(itemId)}
                >
                  <X size={12} />
                  <span className="sr-only">Remove {item?.name || itemId}</span>
                </Button>
              </Badge>
            )
          })}
        </div>
      )}

      {/* Dialog zum Hinzufügen eines neuen Elements */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="item-name">{itemNameLabel}</Label>
              <Input
                id="item-name"
                value={newItem.name || ""}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder={`${itemNameLabel} eingeben`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !showDescription && newItem.name) {
                    e.preventDefault()
                    handleAddNewItem()
                  }
                }}
              />
            </div>

            {showDescription && (
              <div className="grid gap-2">
                <Label htmlFor="item-description">{itemDescriptionLabel}</Label>
                <Textarea
                  id="item-description"
                  value={newItem.description || ""}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder={`${itemDescriptionLabel} eingeben`}
                  className="min-h-[250px]"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button
              type="button"
              onClick={handleAddNewItem}
              disabled={!newItem.name || (showDescription && !newItem.description)}
            >
              Hinzufügen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
