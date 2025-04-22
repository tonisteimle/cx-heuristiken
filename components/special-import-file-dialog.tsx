"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Check, Upload, FileText, X } from "lucide-react"

interface SpecialImportFileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function SpecialImportFileDialog({ open, onOpenChange, onSuccess }: SpecialImportFileDialogProps) {
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleImport = async () => {
    if (!file) {
      setError("Bitte wählen Sie eine JSON-Datei aus")
      return
    }

    try {
      setIsImporting(true)
      setProgress(10)
      setError(null)

      // Formular erstellen
      const formData = new FormData()
      formData.append("file", file)

      setProgress(30)

      // API-Aufruf zum Importieren der Datei
      const response = await fetch("/api/special-import-file", {
        method: "POST",
        body: formData,
      })

      setProgress(70)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Fehler beim Import")
      }

      const result = await response.json()
      setResult(result)
      setProgress(100)

      toast({
        title: "Import erfolgreich",
        description: `${result.stats.updated} Prinzipien-Kategorien wurden aktualisiert.`,
      })

      // Dialog schließen und Daten aktualisieren
      setTimeout(() => {
        onOpenChange(false)
        onSuccess()
      }, 2000)
    } catch (error) {
      console.error("Fehler beim Import:", error)
      setError(error instanceof Error ? error.message : "Unbekannter Fehler beim Import")
      setProgress(0)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Spezial-Import: Prinzipien-Kategorien aktualisieren</DialogTitle>
          <DialogDescription>
            Diese Funktion aktualisiert ausschließlich die Kategorie-Zuordnungen (elements) der bestehenden Prinzipien.
            Keine anderen Daten werden verändert.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Fehler</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert variant="success" className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Import erfolgreich</AlertTitle>
              <AlertDescription className="text-green-700">
                <p>Statistik:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>Aktualisierte Prinzipien: {result.stats.updated}</li>
                  <li>Unveränderte Prinzipien: {result.stats.unchanged}</li>
                  <li>Fehler: {result.stats.errors}</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <input
                type="file"
                id="json-file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
                disabled={isImporting}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                JSON-Datei auswählen
              </Button>

              {file && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  {file.name}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
                    className="h-6 w-6 p-0 rounded-full"
                    disabled={isImporting}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            {progress > 0 && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {isImporting ? "Importiere..." : progress === 100 ? "Import abgeschlossen" : "Vorbereitung..."}
                </p>
              </div>
            )}
          </div>

          <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
            <p className="text-amber-800 text-sm">
              <strong>Hinweis:</strong> Diese Funktion ist für einen einmaligen Import gedacht und kann nach der
              Verwendung wieder entfernt werden. Es werden ausschließlich die Kategorie-Zuordnungen (elements) der
              bestehenden Prinzipien aktualisiert.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isImporting}>
            Abbrechen
          </Button>
          <Button onClick={handleImport} disabled={isImporting || !file} className="flex items-center gap-2">
            <Upload size={16} />
            {isImporting ? "Importiere..." : "Jetzt importieren"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function SpecialImportFileButton({ onSuccess }: { onSuccess: () => void }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)} className="flex items-center gap-1">
        <Upload size={14} />
        Prinzipien-Kategorien importieren
      </Button>
      <SpecialImportFileDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSuccess={onSuccess} />
    </>
  )
}
