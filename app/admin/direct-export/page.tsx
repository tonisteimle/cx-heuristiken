"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createClient } from "@supabase/supabase-js"
import { CheckCircle, AlertCircle, Database, Download, ArrowRight } from "lucide-react"

// Verwende die Umgebungsvariablen direkt
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export default function DirectExportPage() {
  const [localData, setLocalData] = useState<any>(null)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [backupCreated, setBackupCreated] = useState(false)

  useEffect(() => {
    // Versuche, lokale Daten zu laden
    try {
      const data = localStorage.getItem("guidelines-data")
      if (data) {
        const parsedData = JSON.parse(data)
        setLocalData(parsedData)

        // Erstelle automatisch ein Backup im sessionStorage
        sessionStorage.setItem("guidelines-data-backup", data)
        setBackupCreated(true)
        console.log("Automatisches Backup im sessionStorage erstellt")
      }
    } catch (error) {
      console.error("Fehler beim Laden der lokalen Daten:", error)
      setMessage("Fehler beim Laden der lokalen Daten. Siehe Konsole für Details.")
    }
  }, [])

  const exportToSupabase = async () => {
    if (!localData) {
      setStatus("error")
      setMessage("Keine lokalen Daten gefunden.")
      return
    }

    setStatus("loading")
    setMessage("Exportiere Daten nach Supabase...")

    try {
      // Überprüfe, ob die Umgebungsvariablen vorhanden sind
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Supabase-Umgebungsvariablen fehlen. Bitte überprüfe deine Umgebungsvariablen.")
      }

      console.log("Supabase URL:", supabaseUrl)
      console.log("Verwende Supabase-Anon-Key (erste 5 Zeichen):", supabaseAnonKey?.substring(0, 5))

      // Erstelle den Supabase-Client
      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      // Bereite die Daten vor
      const dataToExport = {
        id: "main",
        data: localData,
        updated_at: new Date().toISOString(),
      }

      // Prüfe, ob bereits ein Eintrag existiert
      const { data: existingData, error: fetchError } = await supabase
        .from("guidelines_data")
        .select("id")
        .eq("id", "main")
        .single()

      if (fetchError && fetchError.code !== "PGRST116") {
        throw new Error(`Fehler beim Prüfen existierender Daten: ${fetchError.message}`)
      }

      let result

      if (existingData) {
        // Update existierenden Eintrag
        result = await supabase
          .from("guidelines_data")
          .update({ data: localData, updated_at: new Date().toISOString() })
          .eq("id", "main")
      } else {
        // Erstelle neuen Eintrag
        result = await supabase.from("guidelines_data").insert(dataToExport)
      }

      if (result.error) {
        throw new Error(`Fehler beim Speichern der Daten: ${result.error.message}`)
      }

      setStatus("success")
      setMessage("Daten wurden erfolgreich nach Supabase exportiert!")
    } catch (error) {
      console.error("Fehler beim Export nach Supabase:", error)
      setStatus("error")
      setMessage(`Export fehlgeschlagen: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const downloadLocalData = () => {
    if (!localData) {
      setMessage("Keine lokalen Daten zum Herunterladen gefunden.")
      return
    }

    try {
      const jsonString = JSON.stringify(localData, null, 2)
      const blob = new Blob([jsonString], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `guidelines-data-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Fehler beim Herunterladen der Daten:", error)
      setMessage("Fehler beim Herunterladen der Daten. Siehe Konsole für Details.")
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Direkter Export nach Supabase</CardTitle>
          <CardDescription>Exportiere deine lokalen Daten direkt in die Supabase-Datenbank</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status der lokalen Daten */}
          <div className="p-4 border rounded-md bg-gray-50">
            <h3 className="font-medium mb-2">Lokale Daten:</h3>
            {localData ? (
              <div className="text-sm">
                <p className="text-green-600 font-medium flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" /> Daten gefunden
                </p>
                <p className="text-gray-600 mt-1">Größe: {JSON.stringify(localData).length.toLocaleString()} Zeichen</p>
                <p className="text-gray-600">Guidelines: {localData.guidelines?.length || 0}</p>
                <p className="text-gray-600">Prinzipien: {localData.principles?.length || 0}</p>
              </div>
            ) : (
              <p className="text-red-600 text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" /> Keine lokalen Daten gefunden
              </p>
            )}
          </div>

          {/* Umgebungsvariablen-Status */}
          <div className="p-4 border rounded-md bg-gray-50">
            <h3 className="font-medium mb-2">Supabase-Konfiguration:</h3>
            <div className="text-sm">
              <p className={`font-medium flex items-center ${supabaseUrl ? "text-green-600" : "text-red-600"}`}>
                {supabaseUrl ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" /> SUPABASE_URL: Verfügbar
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 mr-2" /> SUPABASE_URL: Nicht gefunden
                  </>
                )}
              </p>
              <p
                className={`font-medium flex items-center mt-1 ${supabaseAnonKey ? "text-green-600" : "text-red-600"}`}
              >
                {supabaseAnonKey ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" /> SUPABASE_ANON_KEY: Verfügbar
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 mr-2" /> SUPABASE_ANON_KEY: Nicht gefunden
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Automatisches Backup */}
          {backupCreated && (
            <div className="p-4 border rounded-md bg-blue-50">
              <p className="text-blue-700 text-sm flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Automatisches Backup im Browser-Speicher erstellt
              </p>
            </div>
          )}

          {/* Status-Meldungen */}
          {status === "success" && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Erfolg</AlertTitle>
              <AlertDescription className="text-green-700">{message}</AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Fehler</AlertTitle>
              <AlertDescription className="text-red-700">{message}</AlertDescription>
            </Alert>
          )}

          {status === "loading" && (
            <Alert className="bg-blue-50 border-blue-200">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2" />
              <AlertTitle className="text-blue-800">Wird verarbeitet...</AlertTitle>
              <AlertDescription className="text-blue-700">{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={exportToSupabase}
            disabled={!localData || status === "loading" || status === "success"}
            className="w-full sm:w-auto"
          >
            <Database className="mr-2 h-4 w-4" />
            Nach Supabase exportieren
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={downloadLocalData} disabled={!localData} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Lokale Daten sichern
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
