"use client"

import { useState, useEffect } from "react"
import { Search, ChevronRight, X, Filter, CheckSquare } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { SmallText } from "@/components/ui/typography"

interface CategorySidebarProps {
  categories: string[]
  selectedCategories: string[]
  onChange: (categories: string[]) => void
  categoryCount: Record<string, number>
  onClose?: () => void
  isOpen: boolean
}

export function CategorySidebar({
  categories,
  selectedCategories,
  onChange,
  categoryCount,
  onClose,
  isOpen,
}: CategorySidebarProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Sortiere Kategorien nach Nutzungshäufigkeit (absteigend)
  const sortedCategories = [...categories].sort((a, b) => (categoryCount[b] || 0) - (categoryCount[a] || 0))

  // Filtere Kategorien basierend auf dem Suchbegriff
  const filteredCategories = searchTerm
    ? sortedCategories.filter((category) => category.toLowerCase().includes(searchTerm.toLowerCase()))
    : sortedCategories

  // Berechne die Gesamtzahl der Guidelines
  const totalCount = Object.values(categoryCount).reduce((sum, count) => sum + count, 0)

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

  // Responsive Design: Auf kleinen Bildschirmen als Overlay anzeigen
  const [isMobile, setIsMobile] = useState(false)

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

  if (!isOpen && !isCollapsed) {
    return null
  }

  // Minimierte Ansicht (nur Icons)
  if (isCollapsed) {
    return (
      <div className="h-full border-r bg-background flex flex-col w-12">
        <div className="p-2 flex justify-center border-b">
          <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(false)} className="h-8 w-8">
            <Filter size={16} />
          </Button>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <div className="flex flex-col items-center gap-2">
            <Button
              variant={selectedCategories.length === 0 ? "default" : "ghost"}
              size="icon"
              onClick={() => onChange([])}
              className="h-8 w-8"
              title="Alle Kategorien"
            >
              <CheckSquare size={16} />
            </Button>
            {selectedCategories.length > 0 && (
              <Badge variant="secondary" className="w-6 h-6 flex items-center justify-center p-0">
                {selectedCategories.length}
              </Badge>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`${
        isMobile
          ? "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          : "h-full border-r bg-background flex flex-col"
      }`}
    >
      {isMobile && <div className="absolute inset-0 bg-background/80" onClick={onClose} aria-hidden="true" />}

      <div
        className={`${
          isMobile ? "fixed inset-y-0 left-0 z-50 w-3/4 max-w-xs bg-background shadow-lg" : "w-64 flex flex-col h-full"
        }`}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={16} />
            <h3 className="font-medium text-sm">Kategorien</h3>
            {selectedCategories.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {selectedCategories.length}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {!isMobile && (
              <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(true)} className="h-8 w-8">
                <ChevronRight size={16} />
              </Button>
            )}
            {isMobile && onClose && (
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X size={16} />
              </Button>
            )}
          </div>
        </div>

        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Kategorien suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            <div
              className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                selectedCategories.length === 0 ? "bg-accent" : "hover:bg-muted"
              }`}
              onClick={() => onChange([])}
            >
              <span className="font-medium">Alle Kategorien</span>
              <SmallText className="text-muted-foreground">({totalCount})</SmallText>
            </div>

            {selectedCategories.length > 0 && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="w-full mt-2 text-xs justify-start">
                <X size={12} className="mr-1" />
                Filter zurücksetzen
              </Button>
            )}

            <Separator className="my-2" />

            {filteredCategories.length > 0 ? (
              <div className="space-y-1">
                {filteredCategories.map((category) => (
                  <div
                    key={category}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                      selectedCategories.includes(category) ? "bg-accent" : "hover:bg-muted"
                    }`}
                    onClick={() => toggleCategory(category)}
                  >
                    <span className="text-sm">{category}</span>
                    <SmallText className="text-muted-foreground">({categoryCount[category] || 0})</SmallText>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                <p className="text-sm">Keine Kategorien gefunden</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {selectedCategories.length > 0 && (
          <div className="p-4 border-t">
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
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
