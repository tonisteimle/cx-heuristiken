"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Upload, X, FileCode } from "lucide-react"

interface SvgUploaderProps {
  initialSvgContent?: string
  onSvgChange: (svgContent: string) => void
  label?: string
}

export function SvgUploader({ initialSvgContent = "", onSvgChange, label = "SVG-Datei" }: SvgUploaderProps) {
  const [svgContent, setSvgContent] = useState(initialSvgContent)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  // Funktion zum Skalieren des SVGs auf 200x200
  const scaleSvgTo200x200 = (svgContent: string): string => {
    // Erstelle ein temporäres DOM-Element, um das SVG zu parsen
    const parser = new DOMParser()
    const svgDoc = parser.parseFromString(svgContent, "image/svg+xml")
    const svgElement = svgDoc.documentElement

    // Setze die Breite und Höhe auf 100% für bessere Zentrierung
    svgElement.setAttribute("width", "100%")
    svgElement.setAttribute("height", "100%")

    // Stelle sicher, dass das viewBox-Attribut vorhanden ist
    if (!svgElement.hasAttribute("viewBox") && svgElement.hasAttribute("width") && svgElement.hasAttribute("height")) {
      // Wenn kein viewBox vorhanden ist, aber width und height, erstelle einen
      const width = svgElement.getAttribute("width")?.replace(/px$/, "") || "200"
      const height = svgElement.getAttribute("height")?.replace(/px$/, "") || "200"
      svgElement.setAttribute("viewBox", `0 0 ${width} ${height}`)
    }

    // Setze preserveAspectRatio, um sicherzustellen, dass das SVG zentriert wird
    svgElement.setAttribute("preserveAspectRatio", "xMidYMid meet")

    // Konvertiere das modifizierte SVG zurück zu einem String
    return new XMLSerializer().serializeToString(svgDoc)
  }

  const processSvgFile = (file: File) => {
    // Überprüfen, ob es sich um eine SVG-Datei handelt
    if (file.type !== "image/svg+xml" && !file.name.toLowerCase().endsWith(".svg")) {
      setError("Bitte laden Sie nur SVG-Dateien hoch")
      return
    }

    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string

        // Einfache Validierung des SVG-Inhalts
        if (!content.includes("<svg") || !content.includes("</svg>")) {
          setError("Die Datei enthält keinen gültigen SVG-Code")
          return
        }

        // Skaliere das SVG auf 200x200
        const scaledSvgContent = scaleSvgTo200x200(content)

        setSvgContent(scaledSvgContent)
        setError(null)
        onSvgChange(scaledSvgContent)
      } catch (err) {
        console.error("Fehler beim Lesen der SVG-Datei:", err)
        setError("Die SVG-Datei konnte nicht gelesen werden")
      }
    }

    reader.onerror = () => {
      setError("Fehler beim Lesen der Datei")
    }

    reader.readAsText(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    processSvgFile(file)
  }

  const handleRemove = () => {
    setSvgContent("")
    setFileName(null)
    setError(null)
    onSvgChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Drag & Drop Handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      processSvgFile(file)
    }
  }

  // Skaliere auch das initiale SVG, wenn es vorhanden ist
  useEffect(() => {
    if (initialSvgContent && initialSvgContent.trim() !== "") {
      try {
        const scaledSvgContent = scaleSvgTo200x200(initialSvgContent)
        setSvgContent(scaledSvgContent)
        // Wir rufen onSvgChange nicht auf, um einen Endlos-Loop zu vermeiden
      } catch (err) {
        console.error("Fehler beim Skalieren des initialen SVGs:", err)
      }
    }
  }, [initialSvgContent])

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div
        ref={dropZoneRef}
        className={`border rounded-md p-4 ${isDragging ? "bg-primary/5 border-primary/50" : "bg-muted/30"} transition-colors`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {svgContent ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <FileCode size={16} className="text-muted-foreground" />
                <span className="font-medium">{fileName || "SVG-Datei"}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleRemove} className="h-8 w-8 p-0">
                <X size={16} />
              </Button>
            </div>

            <div className="bg-white rounded-md overflow-hidden border flex items-center justify-center">
              <div
                dangerouslySetInnerHTML={{ __html: svgContent }}
                className="w-full h-[200px] flex items-center justify-center pt-2"
                style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">200 x 200 Pixel</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".svg,image/svg+xml"
              onChange={handleFileChange}
              className="hidden"
            />

            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2">
              <Upload size={16} />
              SVG-Datei hochladen
            </Button>

            <p className="text-xs text-muted-foreground">
              Ziehen Sie eine SVG-Datei hierher oder klicken Sie zum Hochladen
            </p>
            <p className="text-xs text-muted-foreground">Das SVG wird auf 200 x 200 Pixel skaliert</p>
          </div>
        )}
      </div>
    </div>
  )
}
