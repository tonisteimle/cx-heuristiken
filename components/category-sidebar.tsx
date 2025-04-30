"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Tag,
  Layers,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Users,
  Lightbulb,
  Palette,
  Layout,
  Shapes,
  Compass,
  Sparkles,
  Zap,
} from "lucide-react"
import { FIXED_CATEGORIES } from "@/lib/constants"
import { SmallText } from "@/components/ui/typography"
import { cn } from "@/lib/utils"

interface CategorySidebarProps {
  selectedCategory: string | null
  onChange: (category: string | null) => void
  categoryCount: Record<string, number>
  className?: string
}

export function CategorySidebar({ selectedCategory, onChange, categoryCount, className }: CategorySidebarProps) {
  // Berechne die Gesamtzahl der Guidelines
  const totalCount = Object.values(categoryCount).reduce((sum, count) => sum + count, 0)

  // State für mobile Ansicht (ein-/ausklappbar)
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Überprüfe die Bildschirmbreite beim Laden und bei Änderungen
  useEffect(() => {
    const checkScreenWidth = () => {
      const mobile = window.innerWidth < 768 // md Breakpoint bei 768px
      setIsMobile(mobile)
      setIsCollapsed(mobile) // Auf Mobilgeräten standardmäßig eingeklappt
    }

    // Initial prüfen
    checkScreenWidth()

    // Event-Listener für Größenänderungen
    window.addEventListener("resize", checkScreenWidth)

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenWidth)
  }, [])

  // Funktion, um das passende Icon für eine Kategorie zu erhalten
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Didaktik":
        return <BookOpen className="h-4 w-4 mr-2" />
      case "Lernende":
        return <Users className="h-4 w-4 mr-2" />
      case "Kognition":
        return <Lightbulb className="h-4 w-4 mr-2" />
      case "Design":
        return <Palette className="h-4 w-4 mr-2" />
      case "Interface":
        return <Layout className="h-4 w-4 mr-2" />
      case "Interaktion":
        return <Shapes className="h-4 w-4 mr-2" />
      case "Navigation":
        return <Compass className="h-4 w-4 mr-2" />
      case "Motivation":
        return <Sparkles className="h-4 w-4 mr-2" />
      case "Technologie":
        return <Zap className="h-4 w-4 mr-2" />
      default:
        return <Tag className="h-4 w-4 mr-2" />
    }
  }

  return (
    <div
      className={cn(
        "transition-all duration-300 bg-white pt-[84px]",
        isMobile
          ? isCollapsed
            ? "w-12 fixed left-0 top-[73px] bottom-0 z-40"
            : "w-64 fixed left-0 top-[73px] bottom-0 z-40 shadow-lg"
          : "w-64 fixed left-0 top-[73px] bottom-0 z-40",
        className,
      )}
    >
      {/* Toggle Button für mobile Ansicht */}
      {isMobile && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute -right-3 top-4 h-6 w-6 rounded-full border shadow-sm p-0 bg-white"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </Button>
      )}

      <div className="p-3">
        <h3 className={cn("font-medium text-sm mb-3 text-gray-500", isCollapsed && isMobile && "sr-only")}>
          Kategorien
        </h3>

        <div className="space-y-1">
          {/* "Alle" Option */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange(null)}
            className={cn(
              "w-full justify-start",
              isCollapsed && isMobile && "p-2 justify-center",
              selectedCategory === null && "bg-gray-100",
            )}
          >
            <Layers className="h-4 w-4 mr-2" />
            {(!isCollapsed || !isMobile) && (
              <>
                <span>Alle</span>
                <SmallText className="ml-auto text-gray-400">({totalCount})</SmallText>
              </>
            )}
          </Button>

          {/* Kategorien */}
          {FIXED_CATEGORIES.map((category) => (
            <Button
              key={category}
              variant="ghost"
              size="sm"
              onClick={() => onChange(category)}
              className={cn(
                "w-full justify-start",
                isCollapsed && isMobile && "p-2 justify-center",
                selectedCategory === category && "bg-gray-100",
              )}
            >
              {getCategoryIcon(category)}
              {(!isCollapsed || !isMobile) && (
                <>
                  <span className="truncate">{category}</span>
                  {categoryCount[category] > 0 && (
                    <SmallText className="ml-auto text-gray-400">({categoryCount[category] || 0})</SmallText>
                  )}
                </>
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
