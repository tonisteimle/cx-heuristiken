"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export interface ExportOptions {
  includeGuidelines: boolean
  includePrinciples: boolean
  includeCategories: boolean
  includeImages: boolean
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

export function ExportOptionsDialog({
  open,
  onOpenChange,
  onExport,
  guidelinesCount,
  principlesCount,
  categoriesCount,
  imagesCount,
}: ExportOptionsDialogProps) {
  const [includeGuidelines, setIncludeGuidelines] = useState(true)
  const [includePrinciples, setIncludePrinciples] = useState(true)
  const [includeCategories, setIncludeCategories] = useState(true)
  const [includeImages, setIncludeImages] = useState(true)

  const handleExport = async () => {
    const options: ExportOptions = {
      includeGuidelines,
      includePrinciples,
      includeCategories,
      includeImages,
    }
    try {
      await onExport(options)
      onOpenChange(false)
    } catch (error) {
      // Fehlerbehandlung erfolgt im übergeordneten Komponenten
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Optionen</DialogTitle>
          <DialogDescription>Wählen Sie aus, welche Daten exportiert werden sollen.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeGuidelines"
                checked={includeGuidelines}
                onCheckedChange={(checked) => setIncludeGuidelines(!!checked)}
              />
              <Label htmlFor="includeGuidelines">CX Guidelines ({guidelinesCount})</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includePrinciples"
                checked={includePrinciples}
                onCheckedChange={(checked) => setIncludePrinciples(!!checked)}
              />
              <Label htmlFor="includePrinciples">Psychologische Effekte ({principlesCount})</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeCategories"
                checked={includeCategories}
                onCheckedChange={(checked) => setIncludeCategories(!!checked)}
              />
              <Label htmlFor="includeCategories">Kategorien ({categoriesCount})</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeImages"
                checked={includeImages}
                onCheckedChange={(checked) => setIncludeImages(!!checked)}
              />
              <Label htmlFor="includeImages">Bilder ({imagesCount})</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button type="button" onClick={handleExport}>
            Exportieren
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
