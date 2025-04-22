"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, AlertCircle, FileText, Upload, X } from "lucide-react"
import { getStorageService } from "@/services/storage-factory"
import type { StorageData } from "@/types/storage-data"

export default function TestImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [jsonData, setJsonData] = useState<StorageData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [importProgress, setImportProgress] = useState(0)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<any>(null)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [activeTab, setActiveTab] = useState<string>("file")
  const [jsonText, setJsonText] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetState = () => {
    setFile(null)
    setJsonData(null)
    setError(null)
    setImportProgress(0)
    setIsImporting(false)
    setImportResult(null)
    setDebugInfo("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    setImportProgress(10)
    setFile(file)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        setImportProgress(30)
        const content = e.target?.result as string
        setJsonText(content)

        // Versuche, das JSON zu parsen
        try {
          const parsedData = JSON.parse(content)
          setImportProgress(50)

          // Validiere die Struktur
          if (!parsedData) {
            setError("Die JSON-Datei ist leer oder ungültig.")
            setImportProgress(0)
            return
          }

          // Zähle die Bilder
          const guidelinesWithImages =
            parsedData.guidelines?.filter(
              (g: any) => g.imageUrl || g.detailImageUrl || g.svgContent || g.detailSvgContent,
            ).length || 0

          // Füge Debug-Informationen hinzu
          setDebugInfo(
            JSON.stringify(
              {
                fileName: file.name,
                fileSize: file.size,
                guidelinesCount: parsedData.guidelines?.length || 0,
                categoriesCount: parsedData.categories?.length || 0,
                principlesCount: parsedData.principles?.length || 0,
                guidelinesWithImages,
                firstGuideline: parsedData.guidelines?.[0] || null,
              },
              null,
              2,
            ),
          )

          setJsonData(parsedData)
          setImportProgress(100)
          setError(null)
        } catch (err) {
          setError("Ungültiges JSON-Format. Bitte stellen Sie sicher, dass die Datei gültiges JSON enthält.")
          setImportProgress(0)
          setDebugInfo(`Fehler beim Parsen: ${err instanceof Error ? err.message : String(err)}`)
        }
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

  const handleJsonTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonText(e.target.value)
    setError(null)
    setJsonData(null)
    setDebugInfo("")

    if (!e.target.value.trim()) return

    try {
      const parsedData = JSON.parse(e.target.value)

      // Validiere die Struktur
      if (!parsedData) {
        setError("Die JSON-Datei ist leer oder ungültig.")
        return
      }

      // Zähle die Bilder
      const guidelinesWithImages =
        parsedData.guidelines?.filter((g: any) => g.imageUrl || g.detailImageUrl || g.svgContent || g.detailSvgContent)
          .length || 0

      // Füge Debug-Informationen hinzu
      setDebugInfo(
        JSON.stringify(
          {
            textLength: e.target.value.length,
            guidelinesCount: parsedData.guidelines?.length || 0,
            categoriesCount: parsedData.categories?.length || 0,
            principlesCount: parsedData.principles?.length || 0,
            guidelinesWithImages,
            firstGuideline: parsedData.guidelines?.[0] || null,
          },
          null,
          2,
        ),
      )

      setJsonData(parsedData)
      setError(null)
    } catch (err) {
      setError("Ungültiges JSON-Format. Bitte stellen Sie sicher, dass der Text gültiges JSON enthält.")
      setDebugInfo(`Fehler beim Parsen: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const handleImport = async () => {
    if (!jsonData && !jsonText) {
      setError("Bitte wählen Sie eine JSON-Datei aus oder geben Sie JSON-Text ein.")
      return
    }

    setIsImporting(true)
    setError(null)
    setImportProgress(10)
    setDebugInfo("")

    try {
      // Parsen des JSON-Textes, falls noch nicht geschehen
      let dataToImport = jsonData
      if (!dataToImport && jsonText) {
        try {
          dataToImport = JSON.parse(jsonText)
        } catch (err) {
          throw new Error(`Ungültiges JSON-Format: ${err instanceof Error ? err.message : String(err)}`)
        }
      }

      if (!dataToImport) {
        throw new Error("Keine gültigen Daten zum Importieren gefunden.")
      }

      setImportProgress(30)

      // Speichern der Daten
      const storageService = getStorageService()

      // Debug-Informationen vor dem Speichern
      setDebugInfo((prev) => prev + "\n\nVersuche, Daten zu speichern...")

      // Speichern der Daten
      const success = await storageService.saveData({
        ...dataToImport,
        lastUpdated: new Date().toISOString(),
      })

      setImportProgress(80)

      if (success) {
        setImportProgress(100)
        setImportResult({
          success: true,
          message: "Import erfolgreich",
          details: {
            guidelinesCount: dataToImport.guidelines?.length || 0,
            categoriesCount: dataToImport.categories?.length || 0,
            principlesCount: dataToImport.principles?.length || 0,
          },
        })
        setDebugInfo((prev) => prev + "\n\nDaten erfolgreich gespeichert!")
      } else {
        throw new Error("Fehler beim Speichern der Daten")
      }
    } catch (err) {
      console.error("Fehler beim Importieren der JSON-Daten:", err)
      setError(`Import fehlgeschlagen: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`)
      setImportProgress(0)
      setDebugInfo((prev) => prev + `\n\nFehler beim Import: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsImporting(false)
    }
  }

  const handleDirectApiCall = async () => {
    if (!jsonData && !jsonText) {
      setError("Bitte wählen Sie eine JSON-Datei aus oder geben Sie JSON-Text ein.")
      return
    }

    setIsImporting(true)
    setError(null)
    setImportProgress(10)
    setDebugInfo("Starte direkten API-Aufruf...")

    try {
      // Parsen des JSON-Textes, falls noch nicht geschehen
      let dataToImport = jsonData
      if (!dataToImport && jsonText) {
        try {
          dataToImport = JSON.parse(jsonText)
        } catch (err) {
          throw new Error(`Ungültiges JSON-Format: ${err instanceof Error ? err.message : String(err)}`)
        }
      }

      if (!dataToImport) {
        throw new Error("Keine gültigen Daten zum Importieren gefunden.")
      }

      setImportProgress(30)
      setDebugInfo((prev) => prev + "\nSende Daten an API...")

      // Direkter API-Aufruf
      const response = await fetch("/api/supabase/save-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: dataToImport }),
      })

      setImportProgress(70)

      // Antwort verarbeiten
      const result = await response.json()
      setDebugInfo((prev) => prev + `\nAPI-Antwort: ${JSON.stringify(result, null, 2)}`)

      if (result.success) {
        setImportProgress(100)
        setImportResult({
          success: true,
          message: "API-Aufruf erfolgreich",
          details: {
            guidelinesCount: dataToImport.guidelines?.length || 0,
            categoriesCount: dataToImport.categories?.length || 0,
            principlesCount: dataToImport.principles?.length || 0,
          },
        })
      } else {
        throw new Error(result.error || "API-Fehler")
      }
    } catch (err) {
      console.error("Fehler beim API-Aufruf:", err)
      setError(`API-Aufruf fehlgeschlagen: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`)
      setImportProgress(0)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">JSON-Import-Test</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>JSON-Daten importieren</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="file">Datei-Upload</TabsTrigger>
              <TabsTrigger value="text">JSON-Text</TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="space-y-4">
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
                      onClick={resetState}
                      className="h-6 w-6 p-0 rounded-full"
                      disabled={isImporting}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="text" className="space-y-4">
              <Textarea
                value={jsonText}
                onChange={handleJsonTextChange}
                placeholder="JSON-Text hier einfügen..."
                className="min-h-[300px] font-mono text-sm"
                disabled={isImporting}
              />
            </TabsContent>
          </Tabs>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Fehler</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {jsonData && (
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <Check className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">JSON validiert</AlertTitle>
              <AlertDescription className="text-green-700">
                {jsonData.guidelines?.length || 0} Guidelines, {jsonData.categories?.length || 0} Kategorien,{" "}
                {jsonData.principles?.length || 0} Prinzipien
              </AlertDescription>
            </Alert>
          )}

          {importProgress > 0 && (
            <div className="space-y-2">
              <Progress value={importProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {isImporting ? "Importiere..." : importProgress === 100 ? "Import abgeschlossen" : "Validiere..."}
              </p>
            </div>
          )}

          {importResult && (
            <Alert className={importResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
              {importResult.success ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertTitle className={importResult.success ? "text-green-800" : "text-red-800"}>
                {importResult.message}
              </AlertTitle>
              <AlertDescription className={importResult.success ? "text-green-700" : "text-red-700"}>
                {importResult.details && (
                  <ul className="list-disc pl-5 mt-1">
                    <li>Guidelines: {importResult.details.guidelinesCount}</li>
                    <li>Kategorien: {importResult.details.categoriesCount}</li>
                    <li>Prinzipien: {importResult.details.principlesCount}</li>
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button onClick={handleImport} disabled={(!jsonData && !jsonText) || isImporting}>
              Mit StorageService importieren
            </Button>
            <Button onClick={handleDirectApiCall} disabled={(!jsonData && !jsonText) || isImporting} variant="outline">
              Direkter API-Aufruf
            </Button>
          </div>
        </CardContent>
      </Card>

      {debugInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Debug-Informationen</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[500px] text-xs">{debugInfo}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
