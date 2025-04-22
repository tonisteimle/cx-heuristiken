"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog"
import { Upload, AlertCircle, FileText, Check, X, AlertTriangle, Code, FileUp } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { getStorageService } from "@/services/storage-factory"
import type { StorageData } from "@/types/storage-data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

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
  const [replaceMode, setReplaceMode] = useState(false)
  const [importMethod, setImportMethod] = useState<"file" | "text">("file")
  const [jsonText, setJsonText] = useState<string>("")
  const [importOptions, setImportOptions] = useState({
    guidelines: true,
    principles: true,
    categories: true,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const resetState = () => {
    setIsImporting(false)
    setError(null)
    setJsonData(null)
    setFileName(null)
    setImportProgress(0)
    setReplaceMode(false)
    setJsonText("")
    setImportOptions({
      guidelines: true,
      principles: true,
      categories: true,
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

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

        // Set the content to the text area
        setJsonText(content)

        // Switch to the text tab
        setImportMethod("text")

        // Try to validate the JSON
        try {
          const parsedData = JSON.parse(content)
          setImportProgress(50)

          // Validate structure - less strict validation
          if (!parsedData) {
            setError("The JSON file is empty or invalid.")
            setImportProgress(0)
            return
          }

          // Ensure the basic structure is present, but allow missing attributes
          const validData: StorageData = {
            guidelines: Array.isArray(parsedData.guidelines) ? parsedData.guidelines : [],
            categories: Array.isArray(parsedData.categories) ? parsedData.categories : [],
            principles: Array.isArray(parsedData.principles) ? parsedData.principles : [],
            lastUpdated: parsedData.lastUpdated || new Date().toISOString(),
            version: parsedData.version || "2.0",
          }

          // Check if at least one of the arrays contains data
          if (
            validData.guidelines.length === 0 &&
            validData.categories.length === 0 &&
            validData.principles.length === 0
          ) {
            setError("The file contains no importable data (no guidelines, categories, or principles).")
            setImportProgress(0)
            return
          }

          setImportProgress(70)

          // Count guidelines with images
          const guidelinesWithImages = validData.guidelines.filter((g: any) => g.imageUrl || g.detailImageUrl).length
          console.log(`Import contains ${guidelinesWithImages} guidelines with images`)

          setJsonData(validData)
          setImportProgress(100)
          setError(null)
        } catch (err) {
          setError("Invalid JSON format. Please ensure the file contains valid JSON.")
          setImportProgress(0)
          setJsonData(null)
        }
      } catch (err) {
        console.error("Error processing JSON file:", err)
        setError(`Error processing JSON file: ${err instanceof Error ? err.message : "Unknown error"}`)
        setImportProgress(0)
        setJsonData(null)
      }
    }

    reader.onerror = () => {
      setError("Error reading file. Please try again with a different file.")
      setImportProgress(0)
      setJsonData(null)
    }

    reader.readAsText(file)
  }

  const handleJsonTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonText(e.target.value)
    setError(null)
    setJsonData(null)

    // Only try to parse if there's content
    if (!e.target.value.trim()) return

    setImportProgress(10)

    try {
      // Basic validation - check if it's valid JSON
      let parsedData: any
      try {
        parsedData = JSON.parse(e.target.value)
        setImportProgress(50)
      } catch (err) {
        setError("Invalid JSON format. Please ensure the text contains valid JSON.")
        setImportProgress(0)
        return
      }

      // Validate structure - less strict validation
      if (!parsedData) {
        setError("The JSON text is empty or invalid.")
        setImportProgress(0)
        return
      }

      // Ensure the basic structure is present, but allow missing attributes
      const validData: StorageData = {
        guidelines: Array.isArray(parsedData.guidelines) ? parsedData.guidelines : [],
        categories: Array.isArray(parsedData.categories) ? parsedData.categories : [],
        principles: Array.isArray(parsedData.principles) ? parsedData.principles : [],
        lastUpdated: parsedData.lastUpdated || new Date().toISOString(),
        version: parsedData.version || "2.0",
      }

      // Check if at least one of the arrays contains data
      if (validData.guidelines.length === 0 && validData.categories.length === 0 && validData.principles.length === 0) {
        setError("The text contains no importable data (no guidelines, categories, or principles).")
        setImportProgress(0)
        return
      }

      setImportProgress(70)

      // Count guidelines with images
      const guidelinesWithImages = validData.guidelines.filter((g: any) => g.imageUrl || g.detailImageUrl).length
      console.log(`Import contains ${guidelinesWithImages} guidelines with images`)

      setJsonData(validData)
      setImportProgress(100)
      setError(null)
    } catch (err) {
      console.error("Error processing JSON text:", err)
      setError(`Error processing JSON text: ${err instanceof Error ? err.message : "Unknown error"}`)
      setImportProgress(0)
      setJsonData(null)
    }
  }

  const handleImport = async () => {
    if (!jsonText.trim()) {
      setError("Please enter or upload JSON data first.")
      return
    }

    setIsImporting(true)
    setError(null)
    setImportProgress(10)

    try {
      // Parse the JSON text
      let parsedData: any
      try {
        parsedData = JSON.parse(jsonText)
        setImportProgress(30)
      } catch (err) {
        setError(`Invalid JSON format: ${err instanceof Error ? err.message : "Unknown error"}`)
        setIsImporting(false)
        return
      }

      // Validate and prepare the data
      const validData: StorageData = {
        guidelines: Array.isArray(parsedData.guidelines) ? parsedData.guidelines : [],
        categories: Array.isArray(parsedData.categories) ? parsedData.categories : [],
        principles: Array.isArray(parsedData.principles) ? parsedData.principles : [],
        lastUpdated: parsedData.lastUpdated || new Date().toISOString(),
        version: "2.0",
      }

      // Check if there's any data to import
      if (validData.guidelines.length === 0 && validData.categories.length === 0 && validData.principles.length === 0) {
        setError("The JSON contains no importable data (no guidelines, categories, or principles).")
        setIsImporting(false)
        return
      }

      // Filter data based on import options
      const filteredData: StorageData = {
        guidelines: importOptions.guidelines ? validData.guidelines : [],
        categories: importOptions.categories ? validData.categories : [],
        principles: importOptions.principles ? validData.principles : [],
        lastUpdated: new Date().toISOString(),
        version: "2.0",
      }

      setImportProgress(50)
      const storageService = getStorageService()

      // Log the operation to console
      console.log(`${replaceMode ? "Replacing all data" : "Importing data"}`, {
        guidelinesCount: filteredData.guidelines.length,
        categoriesCount: filteredData.categories.length,
        principlesCount: filteredData.principles.length,
        replaceMode,
        dataSize: JSON.stringify(filteredData).length,
      })

      let success = false
      let finalData

      if (replaceMode) {
        // Replace all existing data
        finalData = {
          ...filteredData,
          lastUpdated: new Date().toISOString(),
        }

        // Save to storage
        try {
          success = await storageService.saveData(finalData)
        } catch (saveError) {
          console.error("Error saving data during import:", saveError)
          throw new Error(`Error saving data: ${saveError instanceof Error ? saveError.message : "Unknown error"}`)
        }
      } else {
        // Add data to existing
        let currentData
        try {
          currentData = await storageService.loadData()
        } catch (loadError) {
          console.error("Error loading current data during import:", loadError)
          throw new Error(
            `Error loading current data: ${loadError instanceof Error ? loadError.message : "Unknown error"}`,
          )
        }

        // Intelligent merge of data
        finalData = mergeData(currentData, filteredData)

        // Save to storage
        try {
          success = await storageService.saveData(finalData)
        } catch (saveError) {
          console.error("Error saving merged data during import:", saveError)
          throw new Error(
            `Error saving merged data: ${saveError instanceof Error ? saveError.message : "Unknown error"}`,
          )
        }
      }

      setImportProgress(80)

      if (success) {
        setImportProgress(100)
        toast({
          title: replaceMode ? "Data replaced" : "Import successful",
          description: `${replaceMode ? "Replaced" : "Imported"}: ${filteredData.guidelines.length} guidelines, ${filteredData.categories.length} categories, ${filteredData.principles.length} principles.`,
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
        throw new Error(`Error ${replaceMode ? "replacing" : "saving"} imported data`)
      }
    } catch (err) {
      console.error(`Error ${replaceMode ? "replacing" : "importing"} JSON data:`, err)
      setError(`Import failed: ${err instanceof Error ? err.message : "Unknown error"}`)
      setImportProgress(0)
    } finally {
      setIsImporting(false)
    }
  }

  // Function for intelligent merging of data
  const mergeData = (currentData: StorageData, importData: StorageData): StorageData => {
    // Merge categories (simple, as they are just strings)
    const mergedCategories = [...new Set([...currentData.categories, ...importData.categories])]

    // Merge principles
    const mergedPrinciples = mergePrinciples(currentData.principles, importData.principles)

    // Merge guidelines
    const mergedGuidelines = mergeGuidelines(currentData.guidelines, importData.guidelines)

    return {
      guidelines: mergedGuidelines,
      categories: mergedCategories,
      principles: mergedPrinciples,
      lastUpdated: new Date().toISOString(),
      version: "2.0",
    }
  }

  // Function to merge principles
  const mergePrinciples = (existing: any[], imported: any[]): any[] => {
    const result = [...existing]
    const existingIds = new Set(existing.map((p) => p.id))

    imported.forEach((importedPrinciple) => {
      // Check if principle already exists
      const existingIndex = result.findIndex((p) => p.id === importedPrinciple.id)

      if (existingIndex >= 0) {
        // Add missing attributes to existing principle
        result[existingIndex] = {
          ...result[existingIndex],
          ...importedPrinciple,
          // Ensure no attributes are lost
          name: importedPrinciple.name || result[existingIndex].name,
          description: importedPrinciple.description || result[existingIndex].description,
          evidenz: importedPrinciple.evidenz || result[existingIndex].evidenz,
        }
      } else {
        // Add new principle
        result.push({
          id: importedPrinciple.id || `principle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: importedPrinciple.name || "Unnamed Principle",
          description: importedPrinciple.description || "",
          evidenz: importedPrinciple.evidenz || "",
          ...importedPrinciple,
        })
      }
    })

    return result
  }

  // Function to merge guidelines
  const mergeGuidelines = (existing: any[], imported: any[]): any[] => {
    const result = [...existing]
    const existingIds = new Set(existing.map((g) => g.id))

    imported.forEach((importedGuideline) => {
      // Check if guideline already exists
      const existingIndex = result.findIndex((g) => g.id === importedGuideline.id)

      if (existingIndex >= 0) {
        // Add missing attributes to existing guideline
        result[existingIndex] = {
          ...result[existingIndex],
          ...importedGuideline,
          // Ensure no attributes are lost
          title: importedGuideline.title || result[existingIndex].title,
          text: importedGuideline.text || result[existingIndex].text,
          justification: importedGuideline.justification || result[existingIndex].justification,
          categories: importedGuideline.categories || result[existingIndex].categories || [],
          principles: importedGuideline.principles || result[existingIndex].principles || [],
          updatedAt: new Date().toISOString(),
        }
      } else {
        // Add new guideline with default values for missing attributes
        result.push({
          id: importedGuideline.id || `guideline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: importedGuideline.title || "Unnamed Guideline",
          text: importedGuideline.text || "",
          justification: importedGuideline.justification || "",
          categories: importedGuideline.categories || [],
          principles: importedGuideline.principles || [],
          createdAt: importedGuideline.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...importedGuideline,
        })
      }
    })

    return result
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
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          resetState()
        }
        onOpenChange(newOpen)
      }}
    >
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitleText>Import Data</DialogTitleText>
          <DialogDescriptionText>
            Import guidelines, categories, and principles from a JSON file or by pasting JSON directly.
          </DialogDescriptionText>
        </DialogHeader>

        <Tabs value={importMethod} onValueChange={(value) => setImportMethod(value as "file" | "text")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file" className="flex items-center gap-2">
              <FileUp size={16} />
              File Upload
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <Code size={16} />
              JSON Text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="py-4">
            <div className="grid gap-4">
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
            </div>
          </TabsContent>

          <TabsContent value="text" className="py-4">
            <div className="grid gap-4">
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
                    JSON successfully validated: {jsonData.guidelines.length} guidelines, {jsonData.categories.length}{" "}
                    categories, {jsonData.principles.length} principles
                  </AlertDescription>
                </Alert>
              )}

              <Textarea
                value={jsonText}
                onChange={handleJsonTextChange}
                placeholder="Paste your JSON data here..."
                className="min-h-[300px] font-mono text-sm resize-y"
                style={{ maxHeight: "60vh" }}
                disabled={isImporting}
              />
            </div>
          </TabsContent>
        </Tabs>

        {jsonData && (
          <div className="space-y-4">
            <SectionTitle className="text-sm">Import options:</SectionTitle>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="import-guidelines"
                  checked={importOptions.guidelines}
                  onCheckedChange={(checked) => setImportOptions({ ...importOptions, guidelines: checked === true })}
                  disabled={!jsonData.guidelines || jsonData.guidelines.length === 0 || isImporting}
                />
                <Label htmlFor="import-guidelines">
                  Guidelines {jsonData.guidelines ? `(${jsonData.guidelines.length})` : "(0)"}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="import-principles"
                  checked={importOptions.principles}
                  onCheckedChange={(checked) => setImportOptions({ ...importOptions, principles: checked === true })}
                  disabled={!jsonData.principles || jsonData.principles.length === 0 || isImporting}
                />
                <Label htmlFor="import-principles">
                  Principles {jsonData.principles ? `(${jsonData.principles.length})` : "(0)"}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="import-categories"
                  checked={importOptions.categories}
                  onCheckedChange={(checked) => setImportOptions({ ...importOptions, categories: checked === true })}
                  disabled={!jsonData.categories || jsonData.categories.length === 0 || isImporting}
                />
                <Label htmlFor="import-categories">
                  Categories {jsonData.categories ? `(${jsonData.categories.length})` : "(0)"}
                </Label>
              </div>
            </div>

            <SmallText className="text-muted-foreground">{getImportSummary()}</SmallText>
          </div>
        )}

        <div className="flex items-center space-x-2 pt-2">
          <Switch id="replace-mode" checked={replaceMode} onCheckedChange={setReplaceMode} disabled={isImporting} />
          <Label htmlFor="replace-mode">Replace existing data (instead of adding)</Label>
        </div>

        {importProgress > 0 && (
          <div className="space-y-2">
            <Progress value={importProgress} className="h-2" />
            <SmallText className="text-muted-foreground">
              {isImporting ? "Importing..." : importProgress === 100 ? "Validation complete" : "Validating..."}
            </SmallText>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isImporting}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!jsonText.trim() || isImporting}
            className={isImporting ? "opacity-80" : ""}
            variant={replaceMode ? "destructive" : "default"}
          >
            {isImporting ? "Importing..." : replaceMode ? "Replace All Data" : "Import Data"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
