"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
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

// Sammlung von SVG-Icons für die Kategorien
const SVG_ICONS = [
  // Einfaches Trichter-Icon (Lead Generation)
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M22 2L2 2L12 22L22 2Z" />
    <path d="M8 8L16 8" />
    <path d="M10 14L14 14" />
  </svg>`,

  // Lupe (Discovery)
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>`,

  // Dokument mit Stift (Lösungskonzeption)
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M16 13l-4 4-4-4" />
    <path d="M8 13h8" />
  </svg>`,

  // Vertrag (Vertrags-Prozess)
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="9" y1="9" x2="15" y2="9" />
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="13" y2="17" />
  </svg>`,

  // Flagge (Kick-off)
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>`,

  // Zahnrad (Service-Delivery)
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>`,

  // Buch (Training)
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>`,

  // Benutzer mit Herz (Customer Success)
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
    <path d="M16 17.5l2 2 4-4" />
  </svg>`,

  // Rechnung (Billing)
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <line x1="6" y1="16" x2="6" y2="16" />
    <line x1="10" y1="16" x2="10" y2="16" />
    <line x1="14" y1="16" x2="14" y2="16" />
    <line x1="18" y1="16" x2="18" y2="16" />
  </svg>`,

  // Erneuerung (Renewal)
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M21.5 2v6h-6" />
    <path d="M2.5 22v-6h6" />
    <path d="M2 11.5a10 10 0 0 1 18.8-4.3" />
    <path d="M22 12.5a10 10 0 0 1-18.8 4.2" />
  </svg>`,

  // Tür (Offboarding)
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14" />
    <path d="M2 20h20" />
    <path d="M14 12v.01" />
  </svg>`,

  // Werkzeug (Maintenance)
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>`,

  // Headset (Support)
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13 15v4" />
    <path d="M11 15v4" />
    <path d="M12 3v5" />
  </svg>`,

  // Zusätzliche Icons für bestehende Kategorien

  // Netzwerk
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="3" />
    <circle cx="19" cy="5" r="2" />
    <circle cx="5" cy="19" r="2" />
    <circle cx="5" cy="5" r="2" />
    <circle cx="19" cy="19" r="2" />
    <line x1="12" y1="9" x2="12" y2="5" />
    <line x1="15" y1="12" x2="19" y2="12" />
    <line x1="12" y1="15" x2="12" y2="19" />
    <line x1="9" y1="12" x2="5" y2="12" />
  </svg>`,

  // Daten
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>`,

  // Kalender
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>`,

  // Stern
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>`,

  // Glühbirne
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
  </svg>`,

  // Kompass
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>`,

  // Diagramm
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>`,

  // Puzzle
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M19 11V9a2 2 0 0 0-2-2h-1a3 3 0 0 1-3-3V3a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v1a3 3 0 0 1-3 3H3a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1a3 3 0 0 1 3 3v1a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-1a3 3 0 0 1 3-3h1a2 2 0 0 0 2-2z" />
  </svg>`,

  // Ziel
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>`,
]

export default function AddCategoriesWithSvgPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    addedCategories: string[]
    updatedCategories: string[]
    error?: string
  } | null>(null)

  const addCategoriesWithSvg = async () => {
    setIsProcessing(true)
    setResult(null)

    try {
      // 1. Lade aktuelle Daten
      const currentDataResponse = await fetch("/api/supabase/load-data")
      if (!currentDataResponse.ok) {
        throw new Error(`Fehler beim Laden der Daten: ${currentDataResponse.status}`)
      }

      const currentData = await currentDataResponse.json()
      const existingCategories = currentData.categories || []

      // 2. Erstelle Map der vorhandenen Kategorien nach Namen
      const existingCategoryMap = new Map<string, Category>()
      existingCategories.forEach((category: Category) => {
        existingCategoryMap.set(category.name, category)
      })

      // 3. Erstelle neue Kategorien und aktualisiere bestehende mit SVGs
      const updatedCategories: Category[] = []
      const newCategories: Category[] = []
      const addedCategoryNames: string[] = []
      const updatedCategoryNames: string[] = []
      const timestamp = new Date().toISOString()

      // Zufällige Reihenfolge der SVG-Icons erstellen
      const shuffledIcons = [...SVG_ICONS].sort(() => Math.random() - 0.5)
      let iconIndex = 0

      // Zuerst neue Kategorien hinzufügen
      for (const categoryName of CATEGORIES_TO_ADD) {
        if (!existingCategoryMap.has(categoryName)) {
          const newCategory: Category = {
            id: `category-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            name: categoryName,
            description: `Automatisch erstellt am ${new Date().toLocaleDateString()}`,
            svgContent: shuffledIcons[iconIndex % shuffledIcons.length], // Zyklisch durch die Icons gehen
            createdAt: timestamp,
            updatedAt: timestamp,
          }

          newCategories.push(newCategory)
          addedCategoryNames.push(categoryName)
          iconIndex++
        }
      }

      // Dann bestehende Kategorien aktualisieren
      for (const category of existingCategories) {
        // SVG hinzufügen, wenn keines vorhanden ist oder wenn es überschrieben werden soll
        if (!category.svgContent || category.svgContent.trim() === "") {
          const updatedCategory = {
            ...category,
            svgContent: shuffledIcons[iconIndex % shuffledIcons.length], // Zyklisch durch die Icons gehen
            updatedAt: timestamp,
          }

          updatedCategories.push(updatedCategory)
          updatedCategoryNames.push(category.name)
          iconIndex++
        } else {
          // Kategorie unverändert lassen
          updatedCategories.push(category)
        }
      }

      // 4. Speichere die aktualisierten Kategorien
      const allCategories = [...updatedCategories, ...newCategories]

      const saveDataResponse = await fetch("/api/supabase/save-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            categories: allCategories,
            guidelines: currentData.guidelines || [], // Bestehende Guidelines beibehalten
            principles: currentData.principles || [], // Bestehende Principles beibehalten
            lastUpdated: timestamp,
            version: "2.0",
          },
          isIncremental: false, // Vollständiger Modus, um alle Kategorien zu aktualisieren
        }),
      })

      if (!saveDataResponse.ok) {
        const errorData = await saveDataResponse.json().catch(() => ({}))
        throw new Error(
          `Fehler beim Speichern der Kategorien: ${saveDataResponse.status} ${
            errorData.error || saveDataResponse.statusText
          }`,
        )
      }

      setResult({
        success: true,
        message: `${newCategories.length} neue Kategorien hinzugefügt und ${updatedCategoryNames.length} bestehende Kategorien mit SVGs aktualisiert.`,
        addedCategories: addedCategoryNames,
        updatedCategories: updatedCategoryNames,
      })
    } catch (error) {
      console.error("Fehler beim Hinzufügen/Aktualisieren der Kategorien:", error)
      setResult({
        success: false,
        message: "Fehler beim Hinzufügen/Aktualisieren der Kategorien",
        error: error instanceof Error ? error.message : "Unbekannter Fehler",
        addedCategories: [],
        updatedCategories: [],
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Kategorien mit SVG-Icons hinzufügen/aktualisieren</CardTitle>
          <CardDescription>
            Fügt neue Kategorien hinzu und aktualisiert alle Kategorien mit zufälligen SVG-Icons.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-md p-4 bg-gray-50">
              <h3 className="font-medium mb-2">Folgende Kategorien werden hinzugefügt (falls nicht vorhanden):</h3>
              <ul className="list-disc pl-5 space-y-1">
                {CATEGORIES_TO_ADD.map((category) => (
                  <li key={category}>{category}</li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-gray-600">
                Zusätzlich werden alle bestehenden Kategorien ohne SVG-Icon mit einem zufälligen Icon aktualisiert.
              </p>
            </div>

            {result && (
              <Alert variant={result.success ? "default" : "destructive"}>
                {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{result.success ? "Erfolg" : "Fehler"}</AlertTitle>
                <AlertDescription>
                  <p>{result.message}</p>
                  {result.error && <p className="text-sm mt-1">Details: {result.error}</p>}

                  {result.addedCategories.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium">Hinzugefügte Kategorien:</p>
                      <ul className="list-disc pl-5 text-sm">
                        {result.addedCategories.map((cat) => (
                          <li key={cat}>{cat}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.updatedCategories.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium">Aktualisierte Kategorien mit SVG-Icons:</p>
                      <ul className="list-disc pl-5 text-sm">
                        {result.updatedCategories.map((cat) => (
                          <li key={cat}>{cat}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={addCategoriesWithSvg} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Kategorien werden aktualisiert...
              </>
            ) : (
              "Kategorien mit SVG-Icons aktualisieren"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
