"use client"

import { Button } from "@/components/ui/button"
import { Tag, Layers, ChevronDown } from "lucide-react"
import { FIXED_CATEGORIES } from "@/lib/constants"
import { useEffect, useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SmallText } from "@/components/ui/typography"

interface CategoryButtonFilterProps {
  selectedCategory: string | null
  onChange: (category: string | null) => void
  categoryCount: Record<string, number>
}

export function CategoryButtonFilter({ selectedCategory, onChange, categoryCount }: CategoryButtonFilterProps) {
  // Berechne die Gesamtzahl der Guidelines
  const totalCount = Object.values(categoryCount).reduce((sum, count) => sum + count, 0)

  // State für die Bildschirmbreite
  const [isMobile, setIsMobile] = useState(false)

  // Überprüfe die Bildschirmbreite beim Laden und bei Änderungen
  useEffect(() => {
    const checkScreenWidth = () => {
      setIsMobile(window.innerWidth < 768) // md Breakpoint bei 768px
    }

    // Initial prüfen
    checkScreenWidth()

    // Event-Listener für Größenänderungen
    window.addEventListener("resize", checkScreenWidth)

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenWidth)
  }, [])

  // Dropdown-Ansicht für mobile Geräte
  if (isMobile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full flex justify-between items-center">
            <span className="flex items-center gap-1.5">
              {selectedCategory === null ? (
                <>
                  <Layers className="h-4 w-4" />
                  <span>Alle</span>
                </>
              ) : (
                <>
                  <Tag className="h-4 w-4" />
                  <span>{selectedCategory}</span>
                </>
              )}
              <SmallText className="ml-1 text-gray-400">
                ({selectedCategory === null ? totalCount : categoryCount[selectedCategory] || 0})
              </SmallText>
            </span>
            <ChevronDown className="h-4 w-4 ml-2 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full min-w-[200px]">
          <DropdownMenuItem
            onClick={() => onChange(null)}
            className={selectedCategory === null ? "bg-accent text-accent-foreground" : ""}
          >
            <Layers className="h-4 w-4 mr-2" />
            <span>Alle</span>
            <SmallText className="ml-auto text-gray-400">({totalCount})</SmallText>
          </DropdownMenuItem>

          {FIXED_CATEGORIES.map((category) => (
            <DropdownMenuItem
              key={category}
              onClick={() => onChange(category)}
              className={selectedCategory === category ? "bg-accent text-accent-foreground" : ""}
            >
              <Tag className="h-4 w-4 mr-2" />
              <span>{category}</span>
              <SmallText className="ml-auto text-gray-400">({categoryCount[category] || 0})</SmallText>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Button-Ansicht für Desktop
  return (
    <div className="flex flex-wrap gap-2">
      {/* "Alle" Button als erster */}
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        size="sm"
        onClick={() => onChange(null)}
        className={`flex items-center gap-1.5 ${
          selectedCategory === null ? "bg-black hover:bg-black/90 text-white" : ""
        }`}
      >
        <Layers className="h-4 w-4" />
        <span>Alle</span>
        <SmallText className={`ml-1 ${selectedCategory === null ? "text-gray-300" : "text-gray-400"}`}>
          ({totalCount})
        </SmallText>
      </Button>

      {/* Nur die festen Kategorien anzeigen */}
      {FIXED_CATEGORIES.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(category)}
          className={`flex items-center gap-1.5 ${
            selectedCategory === category ? "bg-black hover:bg-black/90 text-white" : ""
          }`}
        >
          <Tag className="h-4 w-4" />
          <span>{category}</span>
          {categoryCount[category] > 0 && (
            <SmallText className={`ml-1 ${selectedCategory === category ? "text-gray-300" : "text-gray-400"}`}>
              ({categoryCount[category] || 0})
            </SmallText>
          )}
        </Button>
      ))}
    </div>
  )
}
