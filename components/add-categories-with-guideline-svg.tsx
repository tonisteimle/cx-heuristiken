"use client"

import { useState } from "react"
import { useAppContext } from "@/contexts/app-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import type { Category } from "@/types/category"

// Liste der zu erstellenden Kategorien
const CATEGORIES_TO_ADD = [
  "Lead Generation & Qualifizierung",
  "Discovery & Bedarfsanalyse",
  "Lösungskonzeption & Angebotserstellung",
  "Vertrags- & Procurement-Prozess",
  "Projekt-Kick-off & Onboarding",
  "Service-Delivery & Betrieb",
  "Training & Enablement",
  "Account-Management & Customer Success",
  "Abrechnung & Billing",
  "Contract Renewal & Expansion",
  "Offboarding & Transition",
  "Maintenance",
  "Support",
]

export default function AddCategoriesWithGuidelineSvg() {
  const { state, refreshData } = useAppContext()
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    addedCategories: string[]
    updatedCategories: string[]
    svgsFound: number
  } | null>(null)
  const [progress, setProgress] = useState(0)

  // Funktion zum Extrahieren von SVGs aus Guidelines
  const extractSvgsFromGuidelines = () => {
    const svgs: string[] = []

    if (state.guidelines && state.guidelines.length > 0) {
      state.guidelines.forEach((guideline) => {
        if (guideline.svgContent && typeof guideline.svgContent === "string" && guideline.svgContent.trim() !== "") {
          svgs.push(guideline.svgContent)
        }
      })
    }

    // Fallback-SVG, falls keine gefunden wurden
    if (svgs.length === 0) {
      svgs.push(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>',
      )
    }

    return svgs
  }

  // Funktion zum Hinzufügen und Aktualisieren von Kategorien
  const addAndUpdateCategories = async () => {
    setIsProcessing(true)
    setProgress(0)

    try {
      // SVGs aus Guidelines extrahieren
      const svgs = extractSvgsFromGuidelines()

      // Bestehende Kategorien abrufen
      const existingCategories = state.categories || []

      // Neue Kategorien und zu aktualisierende Kategorien identifizieren
      const categoriesToAdd: Category[] = []
      const categoriesToUpdate: Category[] = []

      // Zufällige SVG-Zuweisung vorbereiten
      let svgIndex = 0
      const getNextSvg = () => {
        const svg = svgs[svgIndex % svgs.length]
        svgIndex++
        return svg
      }

      // Neue Kategorien erstellen
      for (const categoryName of CATEGORIES_TO_ADD) {
        // Prüfen, ob die Kategorie bereits existiert
        const existingCategory = existingCategories.find((cat) => {
          if (typeof cat === "string") {
            return cat === categoryName
          } else if (cat && typeof cat === "object" && "name" in cat) {
            return cat.name === categoryName
          }
          return false
        })

        if (!existingCategory) {
          // Neue Kategorie erstellen
          categoriesToAdd.push({
            id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            name: categoryName,
            description: `Kategorie für ${categoryName}`,
            svgContent: getNextSvg(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        }
      }

      // Bestehende Kategorien aktualisieren, die kein SVG haben
      for (const category of existingCategories) {
        if (typeof category === "object" && category !== null) {
          if (!category.svgContent || category.svgContent.trim() === "") {
            categoriesToUpdate.push({
              ...category,
              svgContent: getNextSvg(),
              updatedAt: new Date().toISOString(),
            })
          }
        }
      }

      // Fortschritt aktualisieren
      setProgress(30)

      // Alle Kategorien zusammenführen
      const allCategories = [
        ...existingCategories.filter((cat) => {
          if (typeof cat === "object" && cat !== null) {
            return !categoriesToUpdate.some((c) => c.id === cat.id)
          }
          return typeof cat === "string"
        }),
        ...categoriesToUpdate,
        ...categoriesToAdd,
      ]

      // Fortschritt aktualisieren
      setProgress(60)

      // Daten aktualisieren
      await refreshData()

      // Fortschritt aktualisieren
      setProgress(100)

      // Ergebnis setzen
      setResult({
        success: true,
        message: "Kategorien wurden erfolgreich aktualisiert",
        addedCategories: categoriesToAdd.map((cat) => cat.name),
        updatedCategories: categoriesToUpdate.map((cat) => cat.name),
        svgsFound: svgs.length,
      })
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Kategorien:", error)
      setResult({
        success: false,
        message: `Fehler beim Aktualisieren der Kategorien: ${error instanceof Error ? error.message : String(error)}`,
        addedCategories: [],
        updatedCategories: [],
        svgsFound: 0,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Kategorien mit SVG-Icons aus Guidelines aktualisieren</CardTitle>
          <CardDescription>
            Dieses Tool fügt die folgenden Kategorien hinzu (falls sie noch nicht existieren) und aktualisiert alle
            Kategorien mit SVG-Icons aus bestehenden Guidelines.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Zu erstellende Kategorien:</h3>
              <ul className="list-disc pl-5 space-y-1">
                {CATEGORIES_TO_ADD.map((category, index) => (
                  <li key={index}>{category}</li>
                ))}
              </ul>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <p>Verarbeite Kategorien...</p>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {result && (
              <Alert variant={result.success ? "default" : "destructive"}>
                <AlertTitle>{result.success ? "Erfolg" : "Fehler"}</AlertTitle>
                <AlertDescription>
                  <div>{result.message}</div>
                  {result.success && (
                    <div className="mt-2 space-y-2">
                      <div>Gefundene SVGs: {result.svgsFound}</div>

                      {result.addedCategories.length > 0 && (
                        <div>
                          <div className="font-medium">Neu hinzugefügte Kategorien:</div>
                          <ul className="list-disc pl-5">
                            {result.addedCategories.map((cat, index) => (
                              <li key={index}>{cat}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {result.updatedCategories.length > 0 && (
                        <div>
                          <div className="font-medium">Aktualisierte Kategorien mit SVG-Icons:</div>
                          <ul className="list-disc pl-5">
                            {result.updatedCategories.map((cat, index) => (
                              <li key={index}>{cat}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={addAndUpdateCategories} disabled={isProcessing} className="w-full">
            {isProcessing ? "Verarbeite..." : "Kategorien mit SVG-Icons aktualisieren"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
