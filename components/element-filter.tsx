"use client"

import { Button } from "@/components/ui/button"
import { Eye, Brain, HeartPulse, HandMetal, Globe, Layers, ChevronDown } from "lucide-react"
import type { PrincipleElement } from "@/types/guideline"
import { useEffect, useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SmallText } from "@/components/ui/typography"

interface ElementFilterProps {
  selectedElement: PrincipleElement
  onChange: (element: PrincipleElement) => void
  principleCountByElement?: Record<string, number>
}

export function ElementFilter({ selectedElement, onChange, principleCountByElement = {} }: ElementFilterProps) {
  // Ändern der Elementnamen von Englisch auf Deutsch
  const elements = [
    {
      id: "all",
      name: "Alle",
      icon: <Layers className="h-4 w-4" />,
    },
    {
      id: "input",
      name: "Eingabe",
      icon: <Eye className="h-4 w-4" />,
    },
    {
      id: "processing",
      name: "Verarbeitung",
      icon: <Brain className="h-4 w-4" />,
    },
    {
      id: "decision",
      name: "Entscheidung",
      icon: <HeartPulse className="h-4 w-4" />,
    },
    {
      id: "output",
      name: "Ausgabe",
      icon: <HandMetal className="h-4 w-4" />,
    },
    {
      id: "environment",
      name: "Umgebung",
      icon: <Globe className="h-4 w-4" />,
    },
  ]

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

  // Finde das aktuell ausgewählte Element
  const selectedElementObj = elements.find((el) => el.id === selectedElement) || elements[0]

  // Berechne die Gesamtzahl der Prinzipien
  const totalCount = Object.values(principleCountByElement).reduce((sum, count) => sum + count, 0)

  // Dropdown-Ansicht für mobile Geräte
  if (isMobile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full flex justify-between items-center">
            <span className="flex items-center gap-1.5">
              {selectedElementObj.icon}
              <span>{selectedElementObj.name}</span>
              <SmallText className="ml-1 text-gray-400">
                ({selectedElement === "all" ? totalCount : principleCountByElement[selectedElement] || 0})
              </SmallText>
            </span>
            <ChevronDown className="h-4 w-4 ml-2 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full min-w-[200px]">
          {elements.map((element) => (
            <DropdownMenuItem
              key={element.id}
              onClick={() => onChange(element.id as PrincipleElement)}
              className={selectedElement === element.id ? "bg-accent text-accent-foreground" : ""}
            >
              {element.icon}
              <span className="ml-2">{element.name}</span>
              <SmallText className="ml-auto text-gray-400">
                ({element.id === "all" ? totalCount : principleCountByElement[element.id] || 0})
              </SmallText>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Button-Ansicht für Desktop
  return (
    <div className="flex flex-wrap gap-2">
      {elements.map((element) => (
        <Button
          key={element.id}
          variant={selectedElement === element.id ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(element.id as PrincipleElement)}
          className={`flex items-center gap-1.5 ${
            selectedElement === element.id ? "bg-black hover:bg-black/90 text-white" : ""
          }`}
        >
          {element.icon}
          <span>{element.name}</span>
          {/* Füge die Anzahl der Prinzipien in feinem Grau hinzu */}
          {(element.id === "all" ? totalCount : principleCountByElement[element.id]) > 0 && (
            <SmallText className={`ml-1 ${selectedElement === element.id ? "text-gray-300" : "text-gray-400"}`}>
              ({element.id === "all" ? totalCount : principleCountByElement[element.id] || 0})
            </SmallText>
          )}
        </Button>
      ))}
    </div>
  )
}
