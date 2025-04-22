"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Eye, Brain, HeartPulse, HandMetal, Globe } from "lucide-react"
import { MutedText } from "@/components/ui/typography"

interface ElementSelectorProps {
  selectedElements: string[]
  onChange: (elements: string[]) => void
  showDescriptions?: boolean
}

export function ElementSelector({ selectedElements = [], onChange, showDescriptions = true }: ElementSelectorProps) {
  const handleElementChange = (element: string, checked: boolean) => {
    if (checked) {
      // Hinzufügen des Elements, wenn es noch nicht ausgewählt ist
      if (!selectedElements.includes(element)) {
        onChange([...selectedElements, element])
      }
    } else {
      // Entfernen des Elements, wenn es ausgewählt ist
      onChange(selectedElements.filter((e) => e !== element))
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="element-input"
            checked={selectedElements.includes("input")}
            onCheckedChange={(checked) => handleElementChange("input", checked === true)}
          />
          <Label htmlFor="element-input" className="flex items-center cursor-pointer">
            <Eye className="h-4 w-4 mr-2" />
            Eingabe
          </Label>
        </div>
        {showDescriptions && (
          <MutedText>Wahrnehmung: Sensible Reize werden aufgenommen und nach Gestaltprinzipien strukturiert.</MutedText>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="element-processing"
            checked={selectedElements.includes("processing")}
            onCheckedChange={(checked) => handleElementChange("processing", checked === true)}
          />
          <Label htmlFor="element-processing" className="flex items-center cursor-pointer">
            <Brain className="h-4 w-4 mr-2" />
            Verarbeitung
          </Label>
        </div>
        {showDescriptions && (
          <MutedText>
            Vorverarbeitung und kognitive Verarbeitung: Schnelle, heuristische Prozesse (System 1) liefern erste
            Eindrücke, während langsame, analytische Prozesse (System 2) eine tiefere Verarbeitung ermöglichen.
          </MutedText>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="element-decision"
            checked={selectedElements.includes("decision")}
            onCheckedChange={(checked) => handleElementChange("decision", checked === true)}
          />
          <Label htmlFor="element-decision" className="flex items-center cursor-pointer">
            <HeartPulse className="h-4 w-4 mr-2" />
            Entscheidung
          </Label>
        </div>
        {showDescriptions && (
          <MutedText>
            Entscheidungsfindung: Interne emotionale, motivationale und soziale Faktoren modulieren die Entscheidung.
          </MutedText>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="element-output"
            checked={selectedElements.includes("output")}
            onCheckedChange={(checked) => handleElementChange("output", checked === true)}
          />
          <Label htmlFor="element-output" className="flex items-center cursor-pointer">
            <HandMetal className="h-4 w-4 mr-2" />
            Ausgabe
          </Label>
        </div>
        {showDescriptions && (
          <MutedText>
            Verhalten und Rückkopplung: Die getroffene Entscheidung und deren Konsequenzen führen zu Feedback, das
            zukünftiges Verhalten beeinflusst.
          </MutedText>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="element-environment"
            checked={selectedElements.includes("environment")}
            onCheckedChange={(checked) => handleElementChange("environment", checked === true)}
          />
          <Label htmlFor="element-environment" className="flex items-center cursor-pointer">
            <Globe className="h-4 w-4 mr-2" />
            Umgebung
          </Label>
        </div>
        {showDescriptions && (
          <MutedText>
            Kontext und Nudging: Die Umgebung wird so gestaltet, dass sie alle diese Prozesse unterstützt und optimiert.
          </MutedText>
        )}
      </div>
    </div>
  )
}
