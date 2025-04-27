"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Upload, FileText, X, AlertTriangle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ImportService, type ImportOptions } from "@/services/import-service"
import { DialogTitleText, DialogDescriptionText, SmallText, SectionTitle } from "@/components/ui/typography"

interface UnifiedImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function UnifiedImportDialog({ open, onOpenChange, onSuccess }: UnifiedImportDialogProps) {
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [importProgress, setImportProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    guidelines: true,
    principles: true,
    categories: true,
    replaceMode: false,
  })
  const [content, setContent] = useState<string | null>(null)

  const resetState = () => {
    setIsImporting(false)
    setError(null)
    setFileName(null)
    setImportProgress(0)
    setProgressMessage("")
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
      const fileContent = await file.text()
      setContent(fileContent)
      setImportProgress(20)
      setProgressMessage("File loaded successfully")
    } catch (err) {
      console.error("Error reading file:", err)
      setError(`Error reading file: ${err instanceof Error ? err.message : "Unknown error"}`)
      setImportProgress(0)
      setProgressMessage("")
    }
  }

  const handleImport = async () => {
    if (!content) {
      setError("No file content to import")
      return
    }

    setIsImporting(true)
    setError(null)
    setImportProgress(10)
    setProgressMessage("Starting import...")

    try {
      // Validate the JSON data
      const validationResult = await ImportService.validateJsonData(content, (progress) => {
        setImportProgress(10 + progress.progress * 0.2) // 10-30% progress for validation
        setProgressMessage(`Validating: ${progress.stage || ""}`)
      })

      if (!validationResult.valid || !validationResult.data) {
        throw new Error(validationResult.error || "Invalid JSON data")
      }

      // Show summary of data to be imported
      setProgressMessage(
        `Ready to import: ${validationResult.data.guidelines.length} guidelines, ${validationResult.data.principles.length} principles, ${validationResult.data.categories.length} categories`,
      )
      setImportProgress(30)

      // Perform the actual import
      const importResult = await ImportService.processAndSaveData(
        content,
        {
          ...importOptions,
          replaceMode: importOptions.replaceMode,
        },
        (progress) => {
          setImportProgress(30 + progress.progress * 0.7) // 30-100% progress for import
          setProgressMessage(progress.message || progress.stage)
        },
      )

      if (importResult.success) {
        setImportProgress(100)
        setProgressMessage("Import complete")

        toast({
          title: importOptions.replaceMode ? "Data replaced" : "Import successful",
          description: `${importOptions.replaceMode ? "Replaced" : "Imported"}: ${
            importResult.stats?.guidelines || 0
          } guidelines, ${importResult.stats?.categories || 0} categories, ${
            importResult.stats?.principles || 0
          } principles.`,
        })

        resetState()
        onOpenChange(false)
        onSuccess()

        // Reload the page to reflect the changes
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        throw new Error(importResult.error || "Unknown import error")
      }
    } catch (err) {
      console.error(`Error ${importOptions.replaceMode ? "replacing" : "importing"} JSON data:`, err)
      setError(`Import failed: ${err instanceof Error ? err.message : "Unknown error"}`)
      setImportProgress(0)
      setProgressMessage("")
    } finally {
      setIsImporting(false)
    }
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

            {importOptions.replaceMode && (
              <Alert variant="warning" className="bg-amber-50 border-amber-200 text-amber-800">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  Warning: In replacement mode, all existing data will be deleted and replaced with the imported data.
                  This action cannot be undone.
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
                    onCheckedChange={(checked) =>
                      setImportOptions((prev) => ({ ...prev, guidelines: checked === true }))
                    }
                    disabled={isImporting}
                  />
                  <Label htmlFor="import-guidelines">Guidelines</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="import-principles"
                    checked={importOptions.principles}
                    onCheckedChange={(checked) =>
                      setImportOptions((prev) => ({ ...prev, principles: checked === true }))
                    }
                    disabled={isImporting}
                  />
                  <Label htmlFor="import-principles">Principles</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="import-categories"
                    checked={importOptions.categories}
                    onCheckedChange={(checked) =>
                      setImportOptions((prev) => ({ ...prev, categories: checked === true }))
                    }
                    disabled={isImporting}
                  />
                  <Label htmlFor="import-categories">Categories</Label>
                </div>
              </div>

              <SmallText className="text-muted-foreground">
                {fileName ? "Ready to import data from the selected file." : "Please select a JSON file to import."}
              </SmallText>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="replace-mode"
                checked={importOptions.replaceMode}
                onCheckedChange={(checked) => setImportOptions((prev) => ({ ...prev, replaceMode: checked }))}
                disabled={isImporting}
              />
              <Label htmlFor="replace-mode">Replace existing data (instead of adding)</Label>
            </div>

            {importProgress > 0 && (
              <div className="space-y-2">
                <Progress value={importProgress} className="h-2" />
                <SmallText className="text-muted-foreground">
                  {isImporting ? `Importing... ${progressMessage}` : progressMessage}
                </SmallText>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isImporting}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!fileName || isImporting || !content}
              className={isImporting ? "opacity-80" : ""}
              variant={importOptions.replaceMode ? "destructive" : "default"}
            >
              {isImporting ? "Importing..." : importOptions.replaceMode ? "Replace All Data" : "Import Data"}
            </Button>
          </DialogFooter>
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
