"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getStorageService } from "@/services/storage-factory"
import type { Guideline } from "@/types/guideline"

export default function SvgPreservationTest() {
  const [guidelines, setGuidelines] = useState<Guideline[]>([])
  const [selectedGuideline, setSelectedGuideline] = useState<Guideline | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  // Lade alle Guidelines beim Start
  useEffect(() => {
    async function loadGuidelines() {
      setLoading(true)
      try {
        const storageService = getStorageService()
        const data = await storageService.loadData()
        if (data && Array.isArray(data.guidelines)) {
          setGuidelines(data.guidelines)
          setMessage({ type: "success", text: `${data.guidelines.length} Guidelines geladen` })
        } else {
          setMessage({ type: "error", text: "Keine Guidelines gefunden" })
        }
      } catch (error) {
        console.error("Fehler beim Laden der Guidelines:", error)
        setMessage({
          type: "error",
          text: `Fehler beim Laden: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
        })
      } finally {
        setLoading(false)
      }
    }

    loadGuidelines()
  }, [])

  // Wähle eine Guideline mit SVG-Inhalt
  const selectGuidelineWithSvg = () => {
    const guidelinesWithSvg = guidelines.filter((g) => g.svgContent)
    if (guidelinesWithSvg.length > 0) {
      const randomIndex = Math.floor(Math.random() * guidelinesWithSvg.length)
      setSelectedGuideline(guidelinesWithSvg[randomIndex])
      setMessage({ type: "info", text: `Guideline mit SVG-Inhalt ausgewählt: ${guidelinesWithSvg[randomIndex].title}` })
    } else {
      setMessage({ type: "error", text: "Keine Guidelines mit SVG-Inhalt gefunden" })
    }
  }

  // Teste die SVG-Erhaltung
  const testSvgPreservation = async () => {
    if (!selectedGuideline) {
      setMessage({ type: "error", text: "Bitte wähle zuerst eine Guideline aus" })
      return
    }

    setLoading(true)
    setTestResult(null)
    try {
      // Erstelle eine Kopie der Guideline ohne SVG-Inhalt
      const guidelineWithoutSvg: Guideline = {
        ...selectedGuideline,
        svgContent: undefined,
        detailSvgContent: undefined,
        updatedAt: new Date().toISOString(),
      }

      // Speichere die Guideline ohne SVG-Inhalt
      const response = await fetch("/api/supabase/save-guideline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(guidelineWithoutSvg),
      })

      if (!response.ok) {
        throw new Error(`API-Fehler: ${response.status} ${response.statusText}`)
      }

      // Lade die Guideline erneut, um zu prüfen, ob der SVG-Inhalt erhalten blieb
      const storageService = getStorageService()
      const data = await storageService.loadData()
      const updatedGuideline = data.guidelines.find((g) => g.id === selectedGuideline.id)

      if (!updatedGuideline) {
        throw new Error("Guideline nach dem Speichern nicht gefunden")
      }

      // Prüfe, ob der SVG-Inhalt erhalten blieb
      const svgPreserved = !!updatedGuideline.svgContent
      const detailSvgPreserved = !!updatedGuideline.detailSvgContent

      // Setze das Testergebnis
      setTestResult(
        `Test abgeschlossen:\n\n` +
          `SVG-Inhalt erhalten: ${svgPreserved ? "JA ✅" : "NEIN ❌"}\n` +
          `Detail-SVG-Inhalt erhalten: ${detailSvgPreserved ? "JA ✅" : "NEIN ❌"}\n\n` +
          `Original SVG-Länge: ${selectedGuideline.svgContent?.length || 0} Zeichen\n` +
          `Aktuell SVG-Länge: ${updatedGuideline.svgContent?.length || 0} Zeichen`,
      )

      // Aktualisiere die ausgewählte Guideline
      setSelectedGuideline(updatedGuideline)

      // Aktualisiere die Liste der Guidelines
      setGuidelines(data.guidelines)

      setMessage({
        type: svgPreserved ? "success" : "error",
        text: svgPreserved
          ? "SVG-Inhalt wurde erfolgreich erhalten!"
          : "SVG-Inhalt ging verloren! Bitte überprüfe die Implementierung.",
      })
    } catch (error) {
      console.error("Fehler beim Testen der SVG-Erhaltung:", error)
      setMessage({
        type: "error",
        text: `Fehler beim Test: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">SVG-Erhaltungs-Test</h1>

      {message && (
        <Alert
          className={`mb-6 ${message.type === "success" ? "bg-green-50" : message.type === "error" ? "bg-red-50" : "bg-blue-50"}`}
        >
          <AlertTitle>
            {message.type === "success" ? "Erfolg" : message.type === "error" ? "Fehler" : "Information"}
          </AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Guidelines</CardTitle>
            <CardDescription>
              {guidelines.length} Guidelines geladen, davon {guidelines.filter((g) => g.svgContent).length} mit
              SVG-Inhalt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={selectGuidelineWithSvg}
              disabled={loading || guidelines.filter((g) => g.svgContent).length === 0}
              className="w-full mb-4"
            >
              Guideline mit SVG-Inhalt auswählen
            </Button>

            {selectedGuideline && (
              <div className="border rounded-md p-4 mt-4">
                <h3 className="font-semibold mb-2">{selectedGuideline.title}</h3>
                <p className="text-sm text-gray-600 mb-2">ID: {selectedGuideline.id}</p>
                <p className="text-sm mb-4">{selectedGuideline.text.substring(0, 100)}...</p>

                <div className="text-sm">
                  <p>
                    SVG-Inhalt:{" "}
                    {selectedGuideline.svgContent
                      ? `Vorhanden (${selectedGuideline.svgContent.length} Zeichen)`
                      : "Nicht vorhanden"}
                  </p>
                  <p>
                    Detail-SVG-Inhalt:{" "}
                    {selectedGuideline.detailSvgContent
                      ? `Vorhanden (${selectedGuideline.detailSvgContent.length} Zeichen)`
                      : "Nicht vorhanden"}
                  </p>
                </div>

                {selectedGuideline.svgContent && (
                  <div className="mt-4 border p-2 bg-gray-50">
                    <div className="text-xs text-gray-500 mb-2">SVG-Vorschau:</div>
                    <div
                      className="flex justify-center bg-white p-2 border"
                      dangerouslySetInnerHTML={{ __html: selectedGuideline.svgContent }}
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={testSvgPreservation}
              disabled={loading || !selectedGuideline}
              className="w-full"
              variant="default"
            >
              {loading ? "Wird getestet..." : "SVG-Erhaltung testen"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Testergebnisse</CardTitle>
            <CardDescription>
              Dieser Test prüft, ob SVG-Inhalte erhalten bleiben, wenn eine Guideline ohne SVG-Inhalt gespeichert wird
            </CardDescription>
          </CardHeader>
          <CardContent>
            {testResult ? (
              <Textarea value={testResult} readOnly className="h-64 font-mono text-sm" />
            ) : (
              <div className="h-64 flex items-center justify-center border rounded-md bg-gray-50">
                <p className="text-gray-500">Noch keine Testergebnisse</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col items-start">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Wie funktioniert der Test?</strong>
            </p>
            <ol className="text-sm text-gray-600 list-decimal pl-4 space-y-1">
              <li>Wähle eine Guideline mit SVG-Inhalt aus</li>
              <li>Der Test erstellt eine Kopie ohne SVG-Inhalte</li>
              <li>Die Kopie wird gespeichert</li>
              <li>Die Guideline wird erneut geladen</li>
              <li>Der Test prüft, ob der SVG-Inhalt erhalten blieb</li>
            </ol>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
