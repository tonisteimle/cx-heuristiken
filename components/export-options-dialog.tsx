"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Download } from "lucide-react"
// Importiere die Typografie-Komponenten
import { DialogTitleText, DialogDescriptionText, SmallText } from "@/components/ui/typography"

// Ändere die ExportOptions-Schnittstelle, um die neue Option hinzuzufügen
export interface ExportOptions {
  guidelines: boolean
  principles: boolean
  categories: boolean
  includeImages: boolean
  onlyIncomplete?: boolean
}

interface ExportOptionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExport: (options: ExportOptions) => Promise<void>
  guidelinesCount: number
  principlesCount: number
  categoriesCount: number
  imagesCount: number
}

// Aktualisiere die Komponente, um die neue Option anzuzeigen
export function ExportOptionsDialog({
  open,
  onOpenChange,
  onExport,
  guidelinesCount,
  principlesCount,
  categoriesCount,
  imagesCount,
}: ExportOptionsDialogProps) {
  const [options, setOptions] = useState<ExportOptions>({
    guidelines: true,
    principles: true,
    categories: true,
    includeImages: true,
    onlyIncomplete: false,
  })
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleExport = async () => {
    try {
      setIsExporting(true)
      await onExport(options)
      onOpenChange(false)
    } catch (error) {
      console.error("Error during export:", error)
      toast({
        title: "Export fehlgeschlagen",
        description: "Beim Exportieren der Daten ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Berechne die geschätzte Dateigröße basierend auf den Optionen
  const estimateFileSize = (): string => {
    // Sehr grobe Schätzung - in einer realen Anwendung würde man das genauer berechnen
    let size = 0
    if (options.guidelines) size += guidelinesCount * 2 // 2KB pro Guideline ohne Bilder
    if (options.principles) size += principlesCount * 1 // 1KB pro Principle
    if (options.categories) size += categoriesCount * 0.1 // 0.1KB pro Kategorie
    if (options.includeImages && options.guidelines) size += imagesCount * 100 // 100KB pro Bild (sehr grob)

    // Wenn nur unvollständige Elemente exportiert werden, reduziere die Größe
    if (options.onlyIncomplete) size = size * 0.3 // Annahme: ca. 30% sind unvollständig

    // Formatiere die Größe
    if (size < 1000) return `${Math.round(size)} KB`
    return `${(size / 1000).toFixed(1)} MB`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitleText>Exportoptionen</DialogTitleText>
          <DialogDescriptionText>Wählen Sie aus, welche Daten exportiert werden sollen.</DialogDescriptionText>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="export-guidelines"
              checked={options.guidelines}
              onCheckedChange={(checked) => setOptions({ ...options, guidelines: checked === true })}
            />
            <Label htmlFor="export-guidelines" className="flex-1">
              Guidelines ({guidelinesCount})
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="export-principles"
              checked={options.principles}
              onCheckedChange={(checked) => setOptions({ ...options, principles: checked === true })}
            />
            <Label htmlFor="export-principles" className="flex-1">
              Psychologische Prinzipien ({principlesCount})
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="export-categories"
              checked={options.categories}
              onCheckedChange={(checked) => setOptions({ ...options, categories: checked === true })}
            />
            <Label htmlFor="export-categories" className="flex-1">
              Kategorien ({categoriesCount})
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="export-images"
              checked={options.includeImages}
              onCheckedChange={(checked) => setOptions({ ...options, includeImages: checked === true })}
              disabled={!options.guidelines}
            />
            <Label htmlFor="export-images" className={`flex-1 ${!options.guidelines ? "text-muted-foreground" : ""}`}>
              Bilder einschließen ({imagesCount})
            </Label>
          </div>

          {/* Neue Option für unvollständige Elemente */}
          <div className="flex items-center space-x-2 pt-2 border-t">
            <Checkbox
              id="export-incomplete"
              checked={options.onlyIncomplete}
              onCheckedChange={(checked) => setOptions({ ...options, onlyIncomplete: checked === true })}
            />
            <Label htmlFor="export-incomplete" className="flex-1">
              Nur unvollständige Elemente exportieren
            </Label>
          </div>
          <SmallText className="-mt-2 ml-6 text-muted-foreground">
            Exportiert nur Guidelines und Prinzipien mit fehlenden Feldern oder Zuordnungen
          </SmallText>

          <SmallText className="mt-2 text-muted-foreground">Geschätzte Dateigröße: {estimateFileSize()}</SmallText>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Abbrechen
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || (!options.guidelines && !options.principles && !options.categories)}
            className="flex items-center gap-1"
          >
            <Download size={16} />
            {isExporting ? "Exportiere..." : "Exportieren"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
