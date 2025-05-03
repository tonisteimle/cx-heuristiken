"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@supabase/supabase-js"

export default function LocalToSupabaseMigration() {
  const [localData, setLocalData] = useState<any>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("Lade lokale Daten...")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [exportedJson, setExportedJson] = useState<string | null>(null)

  // Supabase-Konfiguration
  const [supabaseUrl, setSupabaseUrl] = useState("")
  const [supabaseKey, setSupabaseKey] = useState("")
  const [configReady, setConfigReady] = useState(false)

  // Lade lokale Daten beim ersten Rendern
  useEffect(() => {
    try {
      // Direkt aus dem localStorage lesen
      const data = localStorage.getItem("guidelines_data")
      console.log("Gelesene Daten aus localStorage:", data ? "Daten gefunden" : "Keine Daten")

      if (data) {
        try {
          const parsedData = JSON.parse(data)
          console.log("Daten erfolgreich geparst:", {
            guidelines: parsedData.guidelines?.length || 0,
            principles: parsedData.principles?.length || 0,
          })

          setLocalData(parsedData)
          setStatus(
            `Lokale Daten gefunden: ${parsedData.guidelines?.length || 0} Guidelines, ${parsedData.principles?.length || 0} Prinzipien`,
          )
        } catch (parseError) {
          console.error("Fehler beim Parsen der Daten:", parseError)
          setError("Die Daten im lokalen Speicher sind beschädigt und können nicht gelesen werden.")
          setStatus("Fehler beim Parsen der lokalen Daten")
        }
      } else {
        console.log("Keine Daten im localStorage gefunden")
        setStatus("Keine lokalen Daten gefunden")
      }
    } catch (err) {
      console.error("Fehler beim Zugriff auf localStorage:", err)
      setError("Fehler beim Laden der lokalen Daten: " + (err instanceof Error ? err.message : String(err)))
      setStatus("Fehler beim Zugriff auf lokalen Speicher")
    }
  }, [])

  // Überprüfe Supabase-Konfiguration
  useEffect(() => {
    setConfigReady(supabaseUrl.trim() !== "" && supabaseKey.trim() !== "")
  }, [supabaseUrl, supabaseKey])

  // Manuelle Datenextraktion aus localStorage
  const extractLocalData = () => {
    try {
      // Alle localStorage-Schlüssel durchgehen
      const allKeys = Object.keys(localStorage)
      console.log("Alle localStorage-Schlüssel:", allKeys)

      // Nach relevanten Daten suchen
      const relevantData: Record<string, any> = {}

      allKeys.forEach((key) => {
        try {
          const value = localStorage.getItem(key)
          if (value) {
            try {
              const parsed = JSON.parse(value)
              relevantData[key] = parsed
            } catch {
              // Wenn nicht als JSON parsbar, dann als String speichern
              relevantData[key] = value
            }
          }
        } catch (e) {
          console.warn(`Konnte Wert für Schlüssel ${key} nicht lesen`, e)
        }
      })

      setLocalData(relevantData)
      setStatus("Alle lokalen Daten extrahiert")
      setSuccess("Lokale Daten wurden erfolgreich extrahiert")

      return relevantData
    } catch (err) {
      console.error("Fehler bei manueller Datenextraktion:", err)
      setError("Fehler bei der manuellen Datenextraktion: " + (err instanceof Error ? err.message : String(err)))
      return null
    }
  }

  // Exportiere lokale Daten als JSON-Datei
  const exportLocalData = () => {
    try {
      setIsExporting(true)
      setProgress(30)
      setError(null)

      // Wenn keine Daten vorhanden, versuche sie manuell zu extrahieren
      const dataToExport = localData || extractLocalData()

      if (!dataToExport) {
        throw new Error("Keine lokalen Daten gefunden oder extrahierbar")
      }

      // JSON-String mit Formatierung erstellen
      const jsonString = JSON.stringify(dataToExport, null, 2)
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
      console.error("Fehler beim Exportieren:", err)
      setError(`Fehler beim Exportieren: ${err.message || String(err)}`)
      setIsExporting(false)
    }
  }

  // Importiere lokale Daten in Supabase
  const importToSupabase = async () => {
    try {
      setIsImporting(true)
      setProgress(10)
      setError(null)
      setSuccess(null)

      // Überprüfe Supabase-Konfiguration
      if (!configReady) {
        throw new Error("Bitte gib die Supabase-URL und den Anon-Key ein")
      }

      // Wenn keine Daten vorhanden, versuche sie manuell zu extrahieren
      const dataToImport = localData || extractLocalData()

      if (!dataToImport) {
        throw new Error("Keine lokalen Daten gefunden oder extrahierbar")
      }

      setStatus("Verbindung zu Supabase wird hergestellt...")

      // Erstelle Supabase-Client mit den eingegebenen Werten
      const supabase = createClient(supabaseUrl, supabaseKey)

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

      // Extrahiere die Guidelines-Daten aus dem lokalData-Objekt
      const guidelinesData = dataToImport.guidelines_data || dataToImport

      if (existingData) {
        setStatus("Bestehende Daten in Supabase gefunden. Führe Daten zusammen...")

        // Zusammenführen der Daten
        const mergedData = {
          guidelines: [...(existingData.data?.guidelines || []), ...(guidelinesData.guidelines || [])],
          categories: [...new Set([...(existingData.data?.categories || []), ...(guidelinesData.categories || [])])],
          principles: [...(existingData.data?.principles || []), ...(guidelinesData.principles || [])],
          lastUpdated: new Date().toISOString(),
          version: guidelinesData.version || "2.0",
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
          data: guidelinesData,
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
      console.error("Fehler beim Importieren:", err)
      setError(`Fehler beim Importieren: ${err.message || String(err)}`)
      setIsImporting(false)
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
                <p>
                  Letzte Aktualisierung:{" "}
                  {localData.lastUpdated ? new Date(localData.lastUpdated).toLocaleString() : "Unbekannt"}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4 border p-4 rounded-md">
            <h3 className="text-sm font-medium">Supabase-Konfiguration</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="supabase-url">Supabase URL</Label>
                <Input
                  id="supabase-url"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://deine-projekt-id.supabase.co"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="supabase-key">Supabase Anon Key</Label>
                <Input
                  id="supabase-key"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  placeholder="dein-anon-key"
                  type="password"
                />
              </div>
              <Alert className={configReady ? "bg-green-50" : "bg-amber-50"}>
                <AlertDescription>
                  {configReady
                    ? "✅ Supabase-Konfiguration bereit"
                    : "⚠️ Bitte gib die Supabase-URL und den Anon-Key ein"}
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button onClick={exportLocalData} disabled={isExporting || isImporting} className="w-full sm:w-auto">
            1. Lokale Daten sichern (JSON)
          </Button>
          <Button
            onClick={importToSupabase}
            disabled={isExporting || isImporting || !configReady}
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
