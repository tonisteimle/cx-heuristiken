"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function LocalToSupabaseMigration() {
  const [localData, setLocalData] = useState<any>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [exportedJson, setExportedJson] = useState<string | null>(null)

  // Lade lokale Daten beim ersten Rendern
  useEffect(() => {
    try {
      const data = localStorage.getItem("guidelines_data")
      if (data) {
        const parsedData = JSON.parse(data)
        setLocalData(parsedData)
        setStatus(
          `Lokale Daten gefunden: ${parsedData.guidelines?.length || 0} Guidelines, ${parsedData.principles?.length || 0} Prinzipien`,
        )
      } else {
        setStatus("Keine lokalen Daten gefunden")
      }
    } catch (err) {
      setError("Fehler beim Laden der lokalen Daten")
      console.error(err)
    }
  }, [])

  // Exportiere lokale Daten als JSON-Datei
  const exportLocalData = () => {
    try {
      setIsExporting(true)
      setProgress(30)

      if (!localData) {
        throw new Error("Keine lokalen Daten gefunden")
      }

      // JSON-String mit Formatierung erstellen
      const jsonString = JSON.stringify(localData, null, 2)
      setExportedJson(jsonString)

      // Blob mit korrektem MIME-Typ erstellen
      const blob = new Blob([jsonString], { type: "application/json" })

      // Download-Link erstellen
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")

      // Dateinamen mit Datum generieren
      const date = new Date().toISOString().split("T")[0] // Format: YYYY-MM-DD
      a.download = `guidelines-local-backup-${date}.json`
      a.href = url

      setProgress(70)

      // Link zum DOM hinzufügen, klicken und entfernen
      document.body.appendChild(a)
      a.click()

      // Kurze Verzögerung vor dem Aufräumen
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        setProgress(100)
        setSuccess("Lokale Daten wurden erfolgreich exportiert")
        setIsExporting(false)
      }, 100)
    } catch (err: any) {
      setError(`Fehler beim Exportieren: ${err.message}`)
      setIsExporting(false)
      console.error(err)
    }
  }

  // Importiere lokale Daten in Supabase
  const importToSupabase = async () => {
    try {
      setIsImporting(true)
      setProgress(10)
      setError(null)
      setSuccess(null)

      if (!localData) {
        throw new Error("Keine lokalen Daten gefunden")
      }

      setStatus("Verbindung zu Supabase wird hergestellt...")
      const supabase = createClientComponentClient()

      setProgress(20)
      setStatus("Prüfe bestehende Daten in Supabase...")

      // Prüfe, ob bereits Daten in Supabase existieren
      const { data: existingData, error: checkError } = await supabase
        .from("guidelines_data")
        .select("id, data")
        .eq("id", "main")
        .maybeSingle()

      if (checkError) {
        throw new Error(`Fehler beim Prüfen bestehender Daten: ${checkError.message}`)
      }

      setProgress(40)

      if (existingData) {
        setStatus("Bestehende Daten in Supabase gefunden. Führe Daten zusammen...")

        // Zusammenführen der Daten (optional)
        const mergedData = {
          guidelines: [...(existingData.data?.guidelines || []), ...(localData.guidelines || [])],
          categories: [...new Set([...(existingData.data?.categories || []), ...(localData.categories || [])])],
          principles: [...(existingData.data?.principles || []), ...(localData.principles || [])],
          lastUpdated: new Date().toISOString(),
          version: localData.version || "2.0",
        }

        setProgress(60)
        setStatus("Aktualisiere Daten in Supabase...")

        // Aktualisiere bestehende Daten
        const { error: updateError } = await supabase
          .from("guidelines_data")
          .update({
            data: mergedData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", "main")

        if (updateError) {
          throw new Error(`Fehler beim Aktualisieren der Daten: ${updateError.message}`)
        }
      } else {
        setStatus("Keine bestehenden Daten in Supabase gefunden. Erstelle neue Daten...")
        setProgress(60)

        // Erstelle neue Daten
        const { error: insertError } = await supabase.from("guidelines_data").insert({
          id: "main",
          data: localData,
          updated_at: new Date().toISOString(),
        })

        if (insertError) {
          throw new Error(`Fehler beim Einfügen neuer Daten: ${insertError.message}`)
        }
      }

      setProgress(100)
      setSuccess("Lokale Daten wurden erfolgreich in Supabase importiert")
      setStatus("Migration abgeschlossen")
      setIsImporting(false)
    } catch (err: any) {
      setError(`Fehler beim Importieren: ${err.message}`)
      setIsImporting(false)
      console.error(err)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Migration: Lokaler Speicher → Supabase</CardTitle>
          <CardDescription>
            Dieses Tool hilft dir, deine lokalen Daten zu sichern und in Supabase zu übertragen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Fehler</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertTitle>Erfolg</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Status</h3>
            <p className="text-sm text-muted-foreground">{status}</p>
          </div>

          {(isExporting || isImporting) && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Fortschritt</h3>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {localData && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Gefundene lokale Daten</h3>
              <div className="bg-muted p-3 rounded-md text-sm">
                <p>Guidelines: {localData.guidelines?.length || 0}</p>
                <p>Kategorien: {localData.categories?.length || 0}</p>
                <p>Prinzipien: {localData.principles?.length || 0}</p>
                <p>Letzte Aktualisierung: {new Date(localData.lastUpdated).toLocaleString()}</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={exportLocalData}
            disabled={!localData || isExporting || isImporting}
            className="w-full sm:w-auto"
          >
            1. Lokale Daten sichern (JSON)
          </Button>
          <Button
            onClick={importToSupabase}
            disabled={!localData || isExporting || isImporting}
            className="w-full sm:w-auto"
            variant="default"
          >
            2. In Supabase importieren
          </Button>
        </CardFooter>
      </Card>

      {exportedJson && (
        <Card className="w-full max-w-4xl mx-auto mt-6">
          <CardHeader>
            <CardTitle>Exportierte Daten (Vorschau)</CardTitle>
            <CardDescription>
              Dies ist eine Vorschau der exportierten Daten. Die vollständigen Daten wurden als JSON-Datei
              heruntergeladen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-3 rounded-md overflow-auto max-h-60">
              <pre className="text-xs">{exportedJson.substring(0, 1000)}...</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
