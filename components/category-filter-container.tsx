"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import { CategorySidebar } from "@/components/category-sidebar"
import { CategoryFilter } from "@/components/category-filter"

interface CategoryFilterContainerProps {
  categories: string[]
  selectedCategories: string[]
  onChange: (categories: string[]) => void
  categoryCount: Record<string, number>
  onManageCategories?: () => void
  isAuthenticated?: boolean
}

export function CategoryFilterContainer({
  categories,
  selectedCategories,
  onChange,
  categoryCount,
  onManageCategories,
  isAuthenticated = false,
}: CategoryFilterContainerProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  // Überprüfe die Bildschirmbreite beim Laden und bei Änderungen
  useEffect(() => {
    const checkScreenWidth = () => {
      const width = window.innerWidth
      setIsMobile(width < 768) // md Breakpoint bei 768px
      setIsDesktop(width >= 1024) // lg Breakpoint bei 1024px
    }

    // Initial prüfen
    checkScreenWidth()

    // Event-Listener für Größenänderungen
    window.addEventListener("resize", checkScreenWidth)

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenWidth)
  }, [])

  // Auf Desktop-Geräten die Sidebar standardmäßig anzeigen
  useEffect(() => {
    if (isDesktop) {
      setIsSidebarOpen(true)
    } else {
      setIsSidebarOpen(false)
    }
  }, [isDesktop])

  return (
    <div className="flex">
      {/* Sidebar für Desktop */}
      {isDesktop && (
        <CategorySidebar
          categories={categories}
          selectedCategories={selectedCategories}
          onChange={onChange}
          categoryCount={categoryCount}
          isOpen={isSidebarOpen}
        />
      )}

      {/* Hauptinhalt */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {/* Sidebar-Toggle für Desktop */}
          {isDesktop && !isSidebarOpen && (
            <Button variant="outline" size="sm" onClick={() => setIsSidebarOpen(true)}>
              <Filter size={14} className="mr-1" />
              Kategorien
            </Button>
          )}

          {/* Mobile Filter Button */}
          {isMobile && (
            <Button variant="outline" size="sm" onClick={() => setIsSidebarOpen(true)}>
              <Filter size={14} className="mr-1" />
              Kategorien filtern
              {selectedCategories.length > 0 && (
                <span className="ml-1 bg-muted rounded-full px-1.5 py-0.5 text-xs">{selectedCategories.length}</span>
              )}
            </Button>
          )}

          {/* Tablet: Dropdown-Filter */}
          {!isMobile && !isDesktop && (
            <CategoryFilter
              categories={categories}
              selectedCategories={selectedCategories}
              onChange={onChange}
              categoryCount={categoryCount}
              onManageCategories={onManageCategories}
              isAuthenticated={isAuthenticated}
            />
          )}
        </div>

        {/* Mobile Sidebar (als Overlay) */}
        {isMobile && (
          <CategorySidebar
            categories={categories}
            selectedCategories={selectedCategories}
            onChange={onChange}
            categoryCount={categoryCount}
            onClose={() => setIsSidebarOpen(false)}
            isOpen={isSidebarOpen}
          />
        )}
      </div>
    </div>
  )
}
