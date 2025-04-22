"use client"

import type React from "react"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SvgEditorProps {
  initialSvgContent?: string
  onSvgChange: (svgContent: string) => void
  label?: string
}

export function SvgEditor({ initialSvgContent = "", onSvgChange, label = "SVG-Code" }: SvgEditorProps) {
  const [svgContent, setSvgContent] = useState(initialSvgContent)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setSvgContent(newContent)

    // Einfache Validierung
    if (newContent && !newContent.trim().startsWith("<svg")) {
      setError("Der Code muss mit einem <svg>-Tag beginnen")
    } else if (newContent && !newContent.includes("</svg>")) {
      setError("Der SVG-Code muss ein schließendes </svg>-Tag enthalten")
    } else {
      setError(null)
      onSvgChange(newContent)
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Textarea
        value={svgContent}
        onChange={handleChange}
        placeholder="<svg>...</svg>"
        className="font-mono text-sm h-40"
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="border rounded-md p-4 bg-muted/30">
        <Label className="mb-2 block">Vorschau</Label>
        {svgContent ? (
          <div
            dangerouslySetInnerHTML={{ __html: svgContent }}
            className="w-full h-40 flex items-center justify-center bg-white rounded"
          />
        ) : (
          <div className="text-muted-foreground text-sm h-40 flex items-center justify-center">
            Keine Vorschau verfügbar
          </div>
        )}
      </div>
    </div>
  )
}
