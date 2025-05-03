"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function NotfallExport() {
  const [localStorageData, setLocalStorageData] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Alle localStorage-Daten sammeln
    try {
      const data: Record<string, string> = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          const value = localStorage.getItem(key)
          if (value) {
            data[key] = value
          }
        }
      }
      setLocalStorageData(data)
    } catch (err) {
      console.error("Fehler beim Lesen des localStorage:", err)
      setError("Konnte localStorage nicht lesen: " + String(err))
    }
  }, [])

  const exportAllData = () => {
    try {
      // Alle Daten als JSON exportieren
      const jsonString = JSON.stringify(localStorageData, null, 2)
      const blob = new Blob([jsonString], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      const date = new Date().toISOString().split("T")[0]
      a.download = `all-local-storage-${date}.json`
      a.href = url
      document.body.appendChild(a)
      a.click()

      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        setSuccess("Alle lokalen Daten wurden erfolgreich exportiert")
      }, 100)
    } catch (err) {
      console.error("Fehler beim Exportieren:", err)
      setError("Fehler beim Exportieren: " + String(err))
    }
  }

  const exportGuidelinesData = () => {
    try {
      // Nur guidelines_data exportieren
      const guidelinesData = localStorageData["guidelines_data"]

      if (!guidelinesData) {
        setError("Keine Guidelines-Daten im localStorage gefunden")
        return
      }

      // Versuche die Daten zu parsen und schön zu formatieren
      try {
        const parsedData = JSON.parse(guidelinesData)
        const formattedJson = JSON.stringify(parsedData, null, 2)

        const blob = new Blob([formattedJson], { type: "application/json" })
        const url = URL.createObjectURL(blob)

        const a = document.createElement("a")
        const date = new Date().toISOString().split("T")[0]
        a.download = `guidelines-data-${date}.json`
        a.href = url
        document.body.appendChild(a)
        a.click()

        setTimeout(() => {
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          setSuccess("Guidelines-Daten wurden erfolgreich exportiert")
        }, 100)
      } catch {
        // Wenn Parsen fehlschlägt, exportiere die Rohdaten
        const blob = new Blob([guidelinesData], { type: "application/json" })
        const url = URL.createObjectURL(blob)

        const a = document.createElement("a")
        const date = new Date().toISOString().split("T")[0]
        a.download = `guidelines-data-raw-${date}.json`
        a.href = url
        document.body.appendChild(a)
        a.click()

        setTimeout(() => {
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          setSuccess("Guidelines-Rohdaten wurden erfolgreich exportiert")
        }, 100)
      }
    } catch (err) {
      console.error("Fehler beim Exportieren der Guidelines-Daten:", err)
      setError("Fehler beim Exportieren der Guidelines-Daten: " + String(err))
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Notfall-Datenexport</CardTitle>
          <CardDescription>
            Dieses Tool exportiert alle Daten aus dem lokalen Speicher deines Browsers als Sicherung
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
            <h3 className="text-sm font-medium">Gefundene Daten im lokalen Speicher</h3>
            <div className="bg-muted p-3 rounded-md text-sm">
              <p>Anzahl der Einträge: {Object.keys(localStorageData).length}</p>
              <p>Schlüssel: {Object.keys(localStorageData).join(", ")}</p>
              {localStorageData["guidelines_data"] && (
                <p className="text-green-600 font-medium">✓ Guidelines-Daten gefunden</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={exportGuidelinesData}
            disabled={!localStorageData["guidelines_data"]}
            className="w-full sm:w-auto"
            variant="default"
          >
            Nur Guidelines-Daten exportieren
          </Button>
          <Button onClick={exportAllData} className="w-full sm:w-auto" variant="outline">
            Alle lokalen Daten exportieren
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
