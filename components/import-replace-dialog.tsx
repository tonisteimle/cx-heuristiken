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
import { Upload, AlertCircle, FileText, Check, X, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import type { StorageData } from "@/services/json-file-service"
import { LocalStorageService } from "@/services/local-storage-service"

interface ImportReplaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ImportReplaceDialog({ open, onOpenChange, onSuccess }: ImportReplaceDialogProps) {
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [jsonData, setJsonData] = useState<StorageData | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [importProgress, setImportProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const resetState = () => {
    setIsImporting(false)
    setError(null)
    setJsonData(null)
    setFileName(null)
    setImportProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Verbesserte handleFileChange-Funktion
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    setFileName(file.name)
    setImportProgress(10)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        setImportProgress(30)
        const content = e.target?.result as string

        // Basic validation - check if it's valid JSON
        let parsedData: any
        try {
          parsedData = JSON.parse(content)
          setImportProgress(50)
        } catch (err) {
          setError("Ungültiges JSON-Format. Bitte stellen Sie sicher, dass die Datei gültiges JSON enthält.")
          setImportProgress(0)
          return
        }

        // Validate structure
        if (!parsedData) {
          setError("Die JSON-Datei ist leer oder ungültig.")
          setImportProgress(0)
          return
        }

        // Check for required fields
        if (!parsedData.guidelines || !Array.isArray(parsedData.guidelines)) {
          setError("Ungültige JSON-Struktur: Das Feld 'guidelines' fehlt oder ist kein Array.")
          setImportProgress(0)
          return
        }

        if (!parsedData.categories || !Array.isArray(parsedData.categories)) {
          setError("Ungültige JSON-Struktur: Das Feld 'categories' fehlt oder ist kein Array.")
          setImportProgress(0)
          return
        }

        if (!parsedData.principles || !Array.isArray(parsedData.principles)) {
          setError("Ungültige JSON-Struktur: Das Feld 'principles' fehlt oder ist kein Array.")
          setImportProgress(0)
          return
        }

        // Validate guidelines structure
        for (let i = 0; i < parsedData.guidelines.length; i++) {
          const guideline = parsedData.guidelines[i]
          if (!guideline.id || !guideline.title || !guideline.text || !guideline.categories) {
            setError(
              `Ungültige Guideline an Index ${i}: Erforderliche Felder fehlen (id, title, text oder categories).`,
            )
            setImportProgress(0)
            return
          }
        }

        // Validate principles structure
        for (let i = 0; i < parsedData.principles.length; i++) {
          const principle = parsedData.principles[i]
          if (!principle.id || !principle.name || !principle.description) {
            setError(`Ungültiges Prinzip an Index ${i}: Erforderliche Felder fehlen (id, name oder description).`)
            setImportProgress(0)
            return
          }
        }

        setImportProgress(70)

        // Bereinige die Daten
        const cleanedData = LocalStorageService.cleanImageReferences(parsedData)

        // All validations passed
        const validData: StorageData = {
          guidelines: cleanedData.guidelines,
          categories: cleanedData.categories,
          principles: cleanedData.principles,
          experiments: cleanedData.experiments || [],
          lastUpdated: cleanedData.lastUpdated || new Date().toISOString(),
          version: cleanedData.version || "2.0",
        }

        setJsonData(validData)
        setImportProgress(100)
        setError(null)
      } catch (err) {
        console.error("Fehler beim Verarbeiten der JSON-Datei:", err)
        setError(`Fehler beim Verarbeiten der JSON-Datei: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`)
        setImportProgress(0)
        setJsonData(null)
      }
    }

    reader.onerror = () => {
      setError("Fehler beim Lesen der Datei. Bitte versuchen Sie es mit einer anderen Datei.")
      setImportProgress(0)
      setJsonData(null)
    }

    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!jsonData) return

    setIsImporting(true)
    setError(null)
    setImportProgress(10)

    try {
      // Speichere zuerst im localStorage
      const localSuccess = LocalStorageService.saveData({
        ...jsonData,
        lastUpdated: new Date().toISOString(),
      })

      if (!localSuccess) {
        throw new Error("Failed to save data to localStorage")
      }

      setImportProgress(50)

      try {
        // Versuche auch in der JSON-Datei zu speichern, aber lasse den Import nicht fehlschlagen, wenn dies nicht klappt
        const response = await fetch("/api/replace-all-data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(jsonData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.warn("API warning: Failed to save to JSON file:", errorData)
          // Wir werfen hier keinen Fehler, da der localStorage-Import erfolgreich war
        }
      } catch (apiError) {
        console.warn("API warning: Network error when saving to JSON file:", apiError)
        // Wir werfen hier keinen Fehler, da der localStorage-Import erfolgreich war
      }

      setImportProgress(100)
      toast({
        title: "Import successful",
        description: `Successfully imported ${jsonData.guidelines.length} guidelines, ${jsonData.categories.length} categories, and ${jsonData.principles.length} principles.`,
      })

      // Close dialog and reset state
      resetState()
      onOpenChange(false)

      // Call onSuccess to trigger a refresh
      onSuccess()

      // Force a hard refresh of the page to ensure data is reloaded
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (err) {
      console.error("Error importing JSON data:", err)
      setError(`Import failed: ${err instanceof Error ? err.message : "Unknown error"}`)
      setImportProgress(0)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          resetState()
        }
        onOpenChange(newOpen)
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Daten importieren und ersetzen</DialogTitle>
          <DialogDescription>
            Importieren Sie Daten aus einer JSON-Datei. <strong>Achtung:</strong> Alle vorhandenen Daten werden gelöscht
            und durch die importierten Daten ersetzt.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Alert variant="warning" className="bg-amber-50 border-amber-200 text-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Diese Aktion wird alle vorhandenen Daten löschen und durch die importierten Daten ersetzen. Dieser Vorgang
              kann nicht rückgängig gemacht werden.
            </AlertDescription>
          </Alert>

          {jsonData && (
            <Alert variant="success" className="bg-green-50 border-green-200 text-green-800">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Datei erfolgreich validiert: {jsonData.guidelines.length} Guidelines, {jsonData.categories.length}{" "}
                Kategorien, {jsonData.principles.length} Prinzipien
                {jsonData.experiments &&
                  jsonData.experiments.length > 0 &&
                  `, ${jsonData.experiments.length} Evidenzen`}
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

              {fileName && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  {fileName}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      resetState()
                    }}
                    className="h-6 w-6 p-0 rounded-full"
                    disabled={isImporting}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            {importProgress > 0 && (
              <div className="space-y-2">
                <Progress value={importProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {isImporting
                    ? "Importiere..."
                    : importProgress === 100
                      ? "Validierung abgeschlossen"
                      : "Validiere..."}
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isImporting}>
            Abbrechen
          </Button>
          <Button
            onClick={handleImport}
            disabled={!jsonData || isImporting}
            className={isImporting ? "opacity-80" : ""}
            variant="destructive"
          >
            {isImporting ? "Importiere..." : "Alle Daten ersetzen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ImportReplaceButton({ onSuccess }: { onSuccess: () => void }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)} className="flex items-center gap-1">
        <Upload size={14} />
        Daten importieren & ersetzen
      </Button>
      <ImportReplaceDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSuccess={onSuccess} />
    </>
  )
}
