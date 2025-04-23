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
import { ImportService } from "@/services/import-service"

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
  const [progressMessage, setProgressMessage] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const resetState = () => {
    setIsImporting(false)
    setError(null)
    setJsonData(null)
    setFileName(null)
    setImportProgress(0)
    setProgressMessage("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    setFileName(file.name)
    setImportProgress(10)
    setProgressMessage("Reading file...")

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string

        // Validate the JSON
        const validationResult = await ImportService.validateJsonData(content, (progress) => {
          setImportProgress(progress.progress)
          setProgressMessage(progress.stage)
        })

        if (validationResult.valid && validationResult.data) {
          setJsonData(validationResult.data)
          setImportProgress(100)
          setProgressMessage("Validation complete")
          setError(null)
        } else {
          setError(validationResult.error || "Unknown validation error")
          setImportProgress(0)
          setProgressMessage("")
          setJsonData(null)
        }
      } catch (err) {
        console.error("Error processing JSON file:", err)
        setError(`Error processing JSON file: ${err instanceof Error ? err.message : "Unknown error"}`)
        setImportProgress(0)
        setProgressMessage("")
        setJsonData(null)
      }
    }

    reader.onerror = () => {
      setError("Error reading file. Please try again with a different file.")
      setImportProgress(0)
      setProgressMessage("")
      setJsonData(null)
    }

    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!jsonData) return

    setIsImporting(true)
    setError(null)
    setImportProgress(10)
    setProgressMessage("Starting import...")

    try {
      // Import the data with replace mode
      const importResult = await ImportService.importData(
        jsonData,
        {
          guidelines: true,
          principles: true,
          categories: true,
          replaceMode: true,
        },
        (progress) => {
          setImportProgress(progress.progress)
          setProgressMessage(progress.message || progress.stage)
        },
      )

      if (importResult.success) {
        setImportProgress(100)
        setProgressMessage("Import complete")

        toast({
          title: "Import successful",
          description: `Successfully imported ${importResult.stats?.guidelines || 0} guidelines, ${
            importResult.stats?.categories || 0
          } categories, and ${importResult.stats?.principles || 0} principles.`,
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
      } else {
        throw new Error(importResult.error || "Unknown import error")
      }
    } catch (err) {
      console.error("Error importing JSON data:", err)
      setError(`Import failed: ${err instanceof Error ? err.message : "Unknown error"}`)
      setImportProgress(0)
      setProgressMessage("")
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
                    ? `Importiere... ${progressMessage}`
                    : importProgress === 100
                      ? "Validierung abgeschlossen"
                      : `Validiere... ${progressMessage}`}
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
