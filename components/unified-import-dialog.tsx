"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Check, Upload, FileText, X, AlertTriangle } from "lucide-react"
import type { StorageData } from "@/types/storage-data"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ImportService, type ImportOptions } from "@/services/import-service"
// import { useToast } from "@/components/ui/use-toast" // Removed duplicate import
// import { useState, useRef, useEffect } from 'react'; // Removed duplicate import

// Importiere die Typografie-Komponenten
import { DialogTitleText, DialogDescriptionText, SmallText, SectionTitle } from "@/components/ui/typography"

interface UnifiedImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function UnifiedImportDialog({ open, onOpenChange, onSuccess }: UnifiedImportDialogProps) {
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [jsonData, setJsonData] = useState<StorageData | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [importProgress, setImportProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState<string>("")
  const [replaceMode, setReplaceMode] = useState(false)
  const [importMethod, setImportMethod] = useState<"file" | "text">("file")
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    guidelines: true,
    principles: true,
    categories: true,
    replaceMode: false,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(open)
  const [jsonText, setJsonText] = useState<string>("") // Declare jsonText state

  // Update replaceMode when importOptions.replaceMode changes
  useEffect(() => {
    setReplaceMode(importOptions.replaceMode)
  }, [importOptions.replaceMode])

  // Update importOptions.replaceMode when replaceMode changes
  useEffect(() => {
    setImportOptions((prev) => ({ ...prev, replaceMode }))
  }, [replaceMode])

  const resetState = () => {
    setIsImporting(false)
    setError(null)
    setJsonData(null)
    setFileName(null)
    setImportProgress(0)
    setProgressMessage("")
    setReplaceMode(false)
    setJsonText("")
    setImportOptions({
      guidelines: true,
      principles: true,
      categories: true,
      replaceMode: false,
    })
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

    try {
      const content = await file.text()

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
        handleImport() // Directly trigger import after successful validation
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

  const handleImport = async () => {
    if (!jsonData) {
      setError("Please select a JSON file first.")
      return
    }

    setIsImporting(true)
    setError(null)
    setImportProgress(10)
    setProgressMessage("Starting import...")

    try {
      // Import the data
      const importResult = await ImportService.importData(jsonData, importOptions, (progress) => {
        // Map the progress to 25-100% range
        setImportProgress(25 + (progress.progress * 75) / 100)
        setProgressMessage(progress.message || progress.stage)
      })

      if (importResult.success) {
        setImportProgress(100)
        setProgressMessage("Import complete")

        toast({
          title: replaceMode ? "Data replaced" : "Import successful",
          description: `${replaceMode ? "Replaced" : "Imported"}: ${
            importResult.stats?.guidelines || 0
          } guidelines, ${importResult.stats?.categories || 0} categories, ${
            importResult.stats?.principles || 0
          } principles.`,
        })

        // Close dialog and reset state
        resetState()
        onOpenChange(false)

        // Call onSuccess to trigger a refresh
        onSuccess()

        // Force a page reload to ensure data is reloaded
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        throw new Error(importResult.error || "Unknown import error")
      }
    } catch (err) {
      console.error(`Error ${replaceMode ? "replacing" : "importing"} JSON data:`, err)
      setError(`Import failed: ${err instanceof Error ? err.message : "Unknown error"}`)
      setImportProgress(0)
      setProgressMessage("")
    } finally {
      setIsImporting(false)
    }
  }

  // Generate a summary of what will be imported
  const getImportSummary = () => {
    if (!jsonData) return null

    const summary = []
    if (importOptions.guidelines && jsonData.guidelines.length > 0) {
      summary.push(`${jsonData.guidelines.length} guidelines`)
    }
    if (importOptions.principles && jsonData.principles.length > 0) {
      summary.push(`${jsonData.principles.length} principles`)
    }
    if (importOptions.categories && jsonData.categories.length > 0) {
      summary.push(`${jsonData.categories.length} categories`)
    }

    return summary.length > 0 ? `Will import: ${summary.join(", ")}` : "No data selected for import"
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitleText>Import Data</DialogTitleText>
            <DialogDescriptionText>
              Import guidelines, categories, and principles from a JSON file.
            </DialogDescriptionText>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {replaceMode && (
              <Alert variant="warning" className="bg-amber-50 border-amber-200 text-amber-800">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  Warning: In replacement mode, all existing data will be deleted and replaced with the imported data.
                  This action cannot be undone.
                </AlertDescription>
              </Alert>
            )}

            {jsonData && (
              <Alert variant="success" className="bg-green-50 border-green-200 text-green-800">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  File successfully validated: {jsonData.guidelines.length} guidelines, {jsonData.categories.length}{" "}
                  categories, {jsonData.principles.length} principles
                </AlertDescription>
              </Alert>
            )}

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
                Select JSON File
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

            <div className="space-y-4">
              <SectionTitle className="text-sm">Import options:</SectionTitle>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="import-guidelines"
                    checked={importOptions.guidelines}
                    onCheckedChange={(checked) => setImportOptions({ ...importOptions, guidelines: checked === true })}
                    disabled={!jsonData?.guidelines || jsonData?.guidelines?.length === 0 || isImporting}
                  />
                  <Label htmlFor="import-guidelines">
                    Guidelines {jsonData?.guidelines ? `(${jsonData?.guidelines?.length})` : "(0)"}
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="import-principles"
                    checked={importOptions.principles}
                    onCheckedChange={(checked) => setImportOptions({ ...importOptions, principles: checked === true })}
                    disabled={!jsonData?.principles || jsonData?.principles?.length === 0 || isImporting}
                  />
                  <Label htmlFor="import-principles">
                    Principles {jsonData?.principles ? `(${jsonData?.principles?.length})` : "(0)"}
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="import-categories"
                    checked={importOptions.categories}
                    onCheckedChange={(checked) => setImportOptions({ ...importOptions, categories: checked === true })}
                    disabled={!jsonData?.categories || jsonData?.categories?.length === 0 || isImporting}
                  />
                  <Label htmlFor="import-categories">
                    Categories {jsonData?.categories ? `(${jsonData?.categories?.length})` : "(0)"}
                  </Label>
                </div>
              </div>

              <SmallText className="text-muted-foreground">{getImportSummary()}</SmallText>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch id="replace-mode" checked={replaceMode} onCheckedChange={setReplaceMode} disabled={isImporting} />
              <Label htmlFor="replace-mode">Replace existing data (instead of adding)</Label>
            </div>

            {importProgress > 0 && (
              <div className="space-y-2">
                <Progress value={importProgress} className="h-2" />
                <SmallText className="text-muted-foreground">
                  {isImporting
                    ? `Importing... ${progressMessage}`
                    : importProgress === 100
                      ? "Validation complete"
                      : `Validating... ${progressMessage}`}
                </SmallText>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isImporting}>
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={!jsonData || isImporting}
                className={isImporting ? "opacity-80" : ""}
                variant={replaceMode ? "destructive" : "default"}
              >
                {isImporting ? "Importing..." : replaceMode ? "Replace All Data" : "Import Data"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function UnifiedImportButton({ onSuccess }: { onSuccess: () => void }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)} className="flex items-center gap-1">
        <Upload size={14} />
        Import Data
      </Button>
      <UnifiedImportDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSuccess={onSuccess} />
    </>
  )
}
