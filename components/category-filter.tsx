"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Filter, X, Settings } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface CategoryFilterProps {
  categories: string[]
  selectedCategories: string[]
  onChange: (categories: string[]) => void
  categoryCount: Record<string, number>
  onManageCategories?: () => void
  isAuthenticated?: boolean
}

export function CategoryFilter({
  categories,
  selectedCategories,
  onChange,
  categoryCount,
  onManageCategories,
  isAuthenticated = false,
}: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Sortiere Kategorien nach Nutzungshäufigkeit (absteigend)
  const sortedCategories = [...categories].sort((a, b) => (categoryCount[b] || 0) - (categoryCount[a] || 0))

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onChange(selectedCategories.filter((c) => c !== category))
    } else {
      onChange([...selectedCategories, category])
    }
  }

  const resetFilters = () => {
    onChange([])
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-10 flex items-center gap-2 text-gray-700">
            <Filter size={14} />
            Kategorien
            {selectedCategories.length > 0 && (
              <Badge variant="secondary" className="ml-1 px-1 py-0">
                {selectedCategories.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 p-0" align="start">
          <div className="p-2">
            <div className="flex items-center justify-between font-medium text-sm px-2 py-1.5">
              <span>Kategorien filtern</span>
              {isAuthenticated && onManageCategories && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsOpen(false)
                    onManageCategories()
                  }}
                  className="h-8 flex items-center gap-1 text-xs"
                >
                  <Settings size={12} />
                  Verwalten
                </Button>
              )}
            </div>
            <div className="h-px bg-muted my-1 -mx-1"></div>
            <div className="max-h-[300px] overflow-y-auto py-1">
              {sortedCategories.map((category) => (
                <div
                  key={category}
                  className="flex items-center space-x-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent cursor-pointer"
                  onClick={() => toggleCategory(category)}
                >
                  <div
                    className={`h-4 w-4 rounded-sm border ${
                      selectedCategories.includes(category)
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-primary"
                    } flex items-center justify-center`}
                  >
                    {selectedCategories.includes(category) && <Check className="h-3 w-3" />}
                  </div>
                  <span>{category}</span>
                  <span className="text-gray-400 text-xs ml-auto">({categoryCount[category] || 0})</span>
                </div>
              ))}
            </div>
            {selectedCategories.length > 0 && (
              <>
                <div className="h-px bg-muted my-1 -mx-1"></div>
                <Button variant="ghost" size="sm" onClick={resetFilters} className="w-full h-8 px-2 mt-1">
                  <X size={14} className="mr-1" />
                  Filter zurücksetzen
                </Button>
              </>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Ausgewählte Kategorien als Badges anzeigen */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedCategories.map((category) => (
            <Badge
              key={category}
              variant="outline"
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => toggleCategory(category)}
            >
              {category}
              <X size={12} className="ml-1 opacity-70" />
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={resetFilters} className="h-6 text-xs px-2 text-muted-foreground">
            Zurücksetzen
          </Button>
        </div>
      )}
    </div>
  )
}
