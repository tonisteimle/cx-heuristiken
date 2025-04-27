"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CategorySidebarProps {
  selectedCategory: string | null
  onSelectCategory: (category: string | null) => void
  categories: string[]
  categoryCount: Record<string, number>
  totalCount: number
  className?: string
}

export function CategorySidebar({
  selectedCategory,
  onSelectCategory,
  categories,
  categoryCount,
  totalCount,
  className,
}: CategorySidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  // Sortiere Kategorien alphabetisch
  const sortedCategories = [...categories].sort((a, b) => a.localeCompare(b))

  // Vereinfachte Kategorienamen für die Anzeige
  const getDisplayName = (category: string): string => {
    // Hier könnten wir eine Map mit vereinfachten Namen verwenden
    // Für jetzt kürzen wir einfach lange Namen ab
    if (category.includes("&")) {
      return category.split("&")[0].trim()
    }
    if (category.includes(" und ")) {
      return category.split(" und ")[0].trim()
    }
    return category
  }

  return (
    <div
      className={cn(
        "fixed left-0 h-[calc(100vh-164px)] bg-background border-r transition-all duration-300 z-10",
        collapsed ? "w-12" : "w-64",
        className,
      )}
    >
      <div className="flex items-center justify-between p-2">
        {!collapsed && <h3 className="text-sm font-medium ml-2">Kategorien</h3>}
        <Button
          variant="ghost"
          size="icon"
          className={cn("ml-auto", collapsed && "mx-auto")}
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Sidebar ausklappen" : "Sidebar einklappen"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <Separator />
      <ScrollArea className="h-[calc(100%-3rem)]">
        <div className="py-2">
          <Button
            variant={selectedCategory === null ? "secondary" : "ghost"}
            className={cn("w-full justify-start rounded-none", collapsed ? "px-2" : "px-4")}
            onClick={() => onSelectCategory(null)}
          >
            {collapsed ? (
              <span className="font-bold">A</span>
            ) : (
              <div className="flex justify-between w-full">
                <span>Alle</span>
                <span className="text-muted-foreground text-xs bg-muted rounded-full px-2 py-0.5">{totalCount}</span>
              </div>
            )}
          </Button>
          {sortedCategories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "secondary" : "ghost"}
              className={cn("w-full justify-start rounded-none", collapsed ? "px-2" : "px-4", "text-left truncate")}
              onClick={() => onSelectCategory(category)}
              title={category} // Original-Kategorie als Tooltip
            >
              {collapsed ? (
                <span className="font-bold">{category.charAt(0).toUpperCase()}</span>
              ) : (
                <div className="flex justify-between w-full">
                  <span className="truncate">{getDisplayName(category)}</span>
                  <span className="text-muted-foreground text-xs bg-muted rounded-full px-2 py-0.5 shrink-0 ml-1">
                    {categoryCount[category] || 0}
                  </span>
                </div>
              )}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
