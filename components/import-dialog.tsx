"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload, AlertCircle, CheckCircle2 } from "lucide-react"
import { useAppContext } from "@/contexts/app-context"
import type { StorageData } from "@/types/storage-data"
import { ImportService, type ImportOptions, type ImportStats } from "@/services/import-service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

export function ImportDialog() {
  const [open, setOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [jsonFile, setJsonFile] = useState<File | null>(null)
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    mergeStrategy: "merge",
    importGuidelines: true,
    importPrinciples: true,
    importCategories: true,
    preserveImages: true,
  })
  const [importStats, setImportStats] = useState<ImportStats | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [importProgress, setImportProgress] = useState(0)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [validationMessages, setValidationMessages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { toast } = useToast()
  const { refreshData, state } = useAppContext()
  const importService = new ImportService()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setJsonFile(e.target.files[0])
      setImportError(null)
      setImportStats(null)
      setValidationMessages([])

      // Automatisch validieren, wenn eine Datei ausgewählt wird
      validateFile(e.target.files[0])
    }
  }

  const resetImport = () => {
    setJsonFile(null)
    setImportError(null)
    setImportStats(null)
    setImportProgress(0)
    setValidationMessages([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const validateFile = async (file: File) => {
    try {
      // Datei lesen
      const fileContent = await file.text()

      // JSON parsen
      let parsedData: any
      try {
        parsedData = JSON.parse(fileContent)
      } catch (error) {
        setValidationMessages(["Die Datei enthält kein gültiges JSON-Format."])
        return false
      }

      // Grundlegende Struktur prüfen
      const messages: string[] = []

      if (!parsedData || typeof parsedData !== "object") {
        messages.push("Die Datei enthält kein gültiges JSON-Objekt.")
        setValidationMessages(messages)
        return false
      }

      // Prüfen, ob guidelines, principles und categories vorhanden sind
      if (!Array.isArray(parsedData.guidelines)) {
        messages.push("Warnung: 'guidelines' ist kein Array oder fehlt.")
      } else if (parsedData.guidelines.length === 0) {
        messages.push("Hinweis: Das 'guidelines' Array ist leer.")
      }

      if (!Array.isArray(parsedData.principles)) {
        messages.push("Warnung: 'principles' ist kein Array oder fehlt.")
      } else if (parsedData.principles.length === 0) {
        messages.push("Hinweis: Das 'principles' Array ist leer.")
      }

      if (!Array.isArray(parsedData.categories)) {
        messages.push("Warnung: 'categories' ist kein Array oder fehlt.")
      } else if (parsedData.categories.length === 0) {
        messages.push("Hinweis: Das 'categories' Array ist leer.")
      }

      // Struktur der Guidelines prüfen
      if (Array.isArray(parsedData.guidelines) && parsedData.guidelines.length > 0) {
        const missingFields: string[] = []

        // Prüfe das erste Guideline-Objekt auf erforderliche Felder
        const firstGuideline = parsedData.guidelines[0]
        if (!firstGuideline.id) missingFields.push("id")
        if (!firstGuideline.title) missingFields.push("title")
        if (!firstGuideline.text) missingFields.push("text")
        if (!Array.isArray(firstGuideline.categories)) missingFields.push("categories (als Array)")
        if (!Array.isArray(firstGuideline.principles)) missingFields.push("principles (als Array)")

        if (missingFields.length > 0) {
          messages.push(`Warnung: In Guidelines fehlen möglicherweise wichtige Felder: ${missingFields.join(", ")}`)
        }
      }

      // Struktur der Principles prüfen
      if (Array.isArray(parsedData.principles) && parsedData.principles.length > 0) {
        const missingFields: string[] = []

        // Prüfe das erste Principle-Objekt auf erforderliche Felder
        const firstPrinciple = parsedData.principles[0]
        if (!firstPrinciple.id) missingFields.push("id")
        if (!firstPrinciple.title && !firstPrinciple.name) missingFields.push("title/name")
        if (!firstPrinciple.description) missingFields.push("description")
        if (!firstPrinciple.element && !Array.isArray(firstPrinciple.elements)) missingFields.push("element/elements")

        if (missingFields.length > 0) {
          messages.push(`Warnung: In Principles fehlen möglicherweise wichtige Felder: ${missingFields.join(", ")}`)
        }
      }

      // Statistiken anzeigen
      const stats = {
        guidelines: Array.isArray(parsedData.guidelines) ? parsedData.guidelines.length : 0,
        principles: Array.isArray(parsedData.principles) ? parsedData.principles.length : 0,
        categories: Array.isArray(parsedData.categories) ? parsedData.categories.length : 0,
      }

      messages.push(
        `Dateiinhalt: ${stats.guidelines} Guidelines, ${stats.principles} Principles, ${stats.categories} Kategorien`,
      )

      setValidationMessages(messages)
      return messages.every((msg) => !msg.startsWith("Warnung:"))
    } catch (error) {
      setValidationMessages([`Fehler bei der Validierung: ${error instanceof Error ? error.message : String(error)}`])
      return false
    }
  }

  const handleImport = async () => {
    try {
      setIsImporting(true)
      setImportError(null)
      setImportStats(null)
      setImportProgress(10)

      if (!jsonFile) {
        setImportError("Keine Datei zum Importieren ausgewählt.")
        return
      }

      setImportProgress(30)

      // Read file content
      const jsonData = await jsonFile.text()

      // Parse JSON data
      let parsedData: StorageData
      try {
        parsedData = JSON.parse(jsonData)
        console.log("Parsed data:", JSON.stringify(parsedData).substring(0, 200) + "...")
      } catch (error) {
        setImportError("Die Datei enthält kein gültiges JSON-Format.")
        return
      }

      // Basic validation
      if (!parsedData || typeof parsedData !== "object") {
        setImportError("Die Daten sind kein gültiges Objekt.")
        return
      }

      setImportProgress(50)

      // Import data using our service
      const result = await importService.importData(parsedData, importOptions)

      setImportProgress(90)

      if (!result.success) {
        setImportError(result.message)
        return
      }

      // Refresh data in the app context
      const refreshSuccess = await refreshData()

      if (!refreshSuccess) {
        console.error("Failed to refresh data after import")
        setImportError(
          "Daten wurden importiert, aber die Anzeige konnte nicht aktualisiert werden. Bitte laden Sie die Seite neu.",
        )
        return
      }

      console.log("Data after refresh:", JSON.stringify(state).substring(0, 200) + "...")

      setImportProgress(100)

      if (result.stats) {
        setImportStats(result.stats)
      }

      toast({
        title: "Import erfolgreich",
        description: result.message,
      })
    } catch (error) {
      console.error("Import error:", error)
      setImportError(`Fehler beim Importieren der Daten: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsImporting(false)
    }
  }

  const handleClose = () => {
    if (!isImporting) {
      setOpen(false)
      // Reset after dialog closes
      setTimeout(resetImport, 300)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button id="import-dialog-trigger" variant="outline" size="sm" className="flex items-center gap-1">
          <Upload size={14} className="mr-1" />
          Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Daten importieren</DialogTitle>
          <DialogDescription>Importieren Sie Daten aus einer JSON-Datei.</DialogDescription>
        </DialogHeader>

        {!importStats ? (
          <>
            <div className="py-4">
              <div className="grid w-full items-center gap-4">
                <Label htmlFor="json-file">JSON-Datei</Label>
                <Input
                  id="json-file"
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  disabled={isImporting}
                />
                {jsonFile && (
                  <p className="text-sm text-muted-foreground">
                    Ausgewählte Datei: {jsonFile.name} ({(jsonFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>
            </div>

            {validationMessages.length > 0 && (
              <div className="mb-4">
                <Alert
                  variant={validationMessages.some((msg) => msg.startsWith("Warnung:")) ? "destructive" : "default"}
                >
                  <AlertTitle>Dateivalidierung</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                      {validationMessages.map((message, index) => (
                        <li key={index} className={message.startsWith("Warnung:") ? "text-red-500" : ""}>
                          {message}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <div className="flex items-center space-x-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                disabled={isImporting}
              >
                {showAdvancedOptions ? "Einfache Optionen" : "Erweiterte Optionen"}
              </Button>
            </div>

            {showAdvancedOptions ? (
              <div className="space-y-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="merge-strategy">Import-Strategie</Label>
                    <Select
                      value={importOptions.mergeStrategy}
                      onValueChange={(value) =>
                        setImportOptions({
                          ...importOptions,
                          mergeStrategy: value as "replace" | "merge" | "preserve",
                        })
                      }
                      disabled={isImporting}
                    >
                      <SelectTrigger id="merge-strategy">
                        <SelectValue placeholder="Strategie wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="merge">Zusammenführen</SelectItem>
                        <SelectItem value="replace">Ersetzen</SelectItem>
                        <SelectItem value="preserve">Beibehalten</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      {importOptions.mergeStrategy === "merge" &&
                        "Bestehende Daten mit importierten Daten zusammenführen"}
                      {importOptions.mergeStrategy === "replace" &&
                        "Bestehende Daten durch importierte Daten ersetzen, ohne Daten zu löschen"}
                      {importOptions.mergeStrategy === "preserve" &&
                        "Bestehende Daten beibehalten, nur neue hinzufügen"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Zu importierende Daten</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="import-guidelines"
                        checked={importOptions.importGuidelines}
                        onCheckedChange={(checked) =>
                          setImportOptions({
                            ...importOptions,
                            importGuidelines: !!checked,
                          })
                        }
                        disabled={isImporting}
                      />
                      <Label htmlFor="import-guidelines" className="text-sm font-normal">
                        Guidelines
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="import-principles"
                        checked={importOptions.importPrinciples}
                        onCheckedChange={(checked) =>
                          setImportOptions({
                            ...importOptions,
                            importPrinciples: !!checked,
                          })
                        }
                        disabled={isImporting}
                      />
                      <Label htmlFor="import-principles" className="text-sm font-normal">
                        Principles
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="import-categories"
                        checked={importOptions.importCategories}
                        onCheckedChange={(checked) =>
                          setImportOptions({
                            ...importOptions,
                            importCategories: !!checked,
                          })
                        }
                        disabled={isImporting}
                      />
                      <Label htmlFor="import-categories" className="text-sm font-normal">
                        Kategorien
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="preserve-images"
                    checked={importOptions.preserveImages}
                    onCheckedChange={(checked) =>
                      setImportOptions({
                        ...importOptions,
                        preserveImages: !!checked,
                      })
                    }
                    disabled={isImporting}
                  />
                  <Label htmlFor="preserve-images" className="text-sm font-normal">
                    Bestehende Bilder beibehalten, wenn importierte Elemente keine Bilder haben
                  </Label>
                </div>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="preserve-images-simple"
                    checked={importOptions.preserveImages}
                    onCheckedChange={(checked) =>
                      setImportOptions({
                        ...importOptions,
                        preserveImages: !!checked,
                      })
                    }
                    disabled={isImporting}
                  />
                  <Label htmlFor="preserve-images-simple" className="text-sm font-normal">
                    Bestehende Bilder beibehalten, wenn importierte Elemente keine Bilder haben
                  </Label>
                </div>
              </div>
            )}

            {importError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Fehler</AlertTitle>
                <AlertDescription>{importError}</AlertDescription>
              </Alert>
            )}

            {isImporting && (
              <div className="space-y-2 my-4">
                <Progress value={importProgress} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">Importiere Daten... {importProgress}%</p>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4 py-4">
            <Alert variant="success" className="border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-700">Import erfolgreich</AlertTitle>
              <AlertDescription className="text-green-600">Die Daten wurden erfolgreich importiert.</AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Guidelines</h3>
                <p className="text-sm text-muted-foreground">Gesamt: {importStats.guidelinesTotal}</p>
                <p className="text-sm text-muted-foreground">Neu hinzugefügt: {importStats.guidelinesAdded}</p>
                <p className="text-sm text-muted-foreground">Aktualisiert: {importStats.guidelinesUpdated}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Principles</h3>
                <p className="text-sm text-muted-foreground">Gesamt: {importStats.principlesTotal}</p>
                <p className="text-sm text-muted-foreground">Neu hinzugefügt: {importStats.principlesAdded}</p>
                <p className="text-sm text-muted-foreground">Aktualisiert: {importStats.principlesUpdated}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Kategorien</h3>
                <p className="text-sm text-muted-foreground">Gesamt: {importStats.categoriesTotal}</p>
                <p className="text-sm text-muted-foreground">Neu hinzugefügt: {importStats.categoriesAdded}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Elemente</h3>
                <p className="text-sm text-muted-foreground">Gesamt: {importStats.elementsTotal}</p>
                <p className="text-sm text-muted-foreground">Neu hinzugefügt: {importStats.elementsAdded}</p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {!importStats ? (
            <>
              <Button variant="outline" onClick={handleClose} disabled={isImporting}>
                Abbrechen
              </Button>
              <Button onClick={handleImport} disabled={isImporting || !jsonFile}>
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importiere...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Importieren
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose}>Schließen</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
