"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FIXED_CATEGORIES } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface CategorySidebarProps {
  selectedCategory: string | null
  onChange: (category: string | null) => void
  categoryCount: Record<string, number>
  className?: string
}

export function CategorySidebar({ selectedCategory, onChange, categoryCount, className }: CategorySidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "bg-white border-r h-full transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64",
        className,
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && <h3 className="font-medium">Kategorien</h3>}
        <Button
          variant="ghost"
          size="sm"
          className={cn("p-0 h-8 w-8", collapsed && "ml-auto")}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          <Button
            variant={selectedCategory === null ? "secondary" : "ghost"}
            className={cn("w-full justify-start mb-1", collapsed ? "px-2" : "px-3")}
            onClick={() => onChange(null)}
          >
            {collapsed ? "Alle" : "Alle Kategorien"}
            {!collapsed && (
              <span className="ml-auto bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                {Object.values(categoryCount).reduce((sum, count) => sum + count, 0)}
              </span>
            )}
          </Button>

          {FIXED_CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "secondary" : "ghost"}
              className={cn("w-full justify-start mb-1", collapsed ? "px-2" : "px-3")}
              onClick={() => onChange(category)}
            >
              {collapsed ? category.charAt(0).toUpperCase() : category}
              {!collapsed && categoryCount[category] > 0 && (
                <span className="ml-auto bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                  {categoryCount[category]}
                </span>
              )}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
