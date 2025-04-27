"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import type { Category } from "@/types/category"
import type { Guideline } from "@/types/guideline"
import { useAppContext } from "@/contexts/AppContext"

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

// Fallback SVG für den Fall, dass keine Guidelines mit SVGs gefunden werden
const FALLBACK_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <circle cx="12" cy="12" r="10" />
  <path d="M12 8v4M12 16h.01" />
</svg>`

export default function AddCategoriesWithGuidelineSvgPage() {
  const { state, refreshData } = useAppContext()
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    addedCategories: string[]
    updatedCategories: string[]
    svgsFound: number
    error?: string
  } | null>(null)

  const addCategoriesWithSvg = async () => {
    setIsProcessing(true)
    setResult(null)

    try {
      // 1. Verwende die Daten aus dem AppContext
      const existingCategories = state.categories || []
      const guidelines = state.guidelines || []

      // 2. Extrahiere SVGs aus den Guidelines
      const svgsFromGuidelines: string[] = []

      guidelines.forEach((guideline: Guideline) => {
        if (guideline.svgContent && guideline.svgContent.trim() !== "") {
          svgsFromGuidelines.push(guideline.svgContent)
        }
        if (guideline.detailSvgContent && guideline.detailSvgContent.trim() !== "") {
          svgsFromGuidelines.push(guideline.detailSvgContent)
        }
      })

      console.log(`Gefundene SVGs aus Guidelines: ${svgsFromGuidelines.length}`)

      // Wenn keine SVGs gefunden wurden, verwende das Fallback-SVG
      if (svgsFromGuidelines.length === 0) {
        svgsFromGuidelines.push(FALLBACK_SVG)
      }

      // 3. Erstelle Map der vorhandenen Kategorien nach Namen
      const existingCategoryMap = new Map<string, Category>()
      existingCategories.forEach((category: any) => {
        if (typeof category === "string") {
          // Wenn die Kategorie nur ein String ist, erstelle ein einfaches Objekt
          existingCategoryMap.set(category, {
            name: category,
            id: `category-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          } as Category)
        } else {
          // Wenn die Kategorie ein Objekt ist, verwende es direkt
          existingCategoryMap.set(category.name, category)
        }
      })

      // 4. Erstelle neue Kategorien und aktualisiere bestehende mit SVGs
      const updatedCategories: Category[] = []
      const newCategories: Category[] = []
      const addedCategoryNames: string[] = []
      const updatedCategoryNames: string[] = []
      const timestamp = new Date().toISOString()

      // Zufällige Reihenfolge der SVG-Icons erstellen
      const shuffledSvgs = [...svgsFromGuidelines].sort(() => Math.random() - 0.5)
      let svgIndex = 0

      // Zuerst neue Kategorien hinzufügen
      for (const categoryName of CATEGORIES_TO_ADD) {
        if (!existingCategoryMap.has(categoryName)) {
          const newCategory: Category = {
            id: `category-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            name: categoryName,
            description: `Automatisch erstellt am ${new Date().toLocaleDateString()}`,
            svgContent: shuffledSvgs[svgIndex % shuffledSvgs.length], // Zyklisch durch die SVGs gehen
            createdAt: timestamp,
            updatedAt: timestamp,
          }

          newCategories.push(newCategory)
          addedCategoryNames.push(categoryName)
          svgIndex++
        }
      }

      // Dann bestehende Kategorien aktualisieren
      for (const category of existingCategories) {
        // Wenn die Kategorie nur ein String ist, erstelle ein Kategorie-Objekt
        if (typeof category === "string") {
          const newCategory: Category = {
            id: `category-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            name: category,
            description: `Automatisch aktualisiert am ${new Date().toLocaleDateString()}`,
            svgContent: shuffledSvgs[svgIndex % shuffledSvgs.length],
            createdAt: timestamp,
            updatedAt: timestamp,
          }
          updatedCategories.push(newCategory)
          updatedCategoryNames.push(category)
          svgIndex++
        }
        // SVG hinzufügen, wenn keines vorhanden ist oder wenn es überschrieben werden soll
        else if (!category.svgContent || category.svgContent.trim() === "") {
          const updatedCategory = {
            ...category,
            svgContent: shuffledSvgs[svgIndex % shuffledSvgs.length], // Zyklisch durch die SVGs gehen
            updatedAt: timestamp,
          }

          updatedCategories.push(updatedCategory)
          updatedCategoryNames.push(category.name)
          svgIndex++
        } else {
          // Kategorie unverändert lassen
          updatedCategories.push(category)
        }
      }

      // 5. Speichere die aktualisierten Kategorien mit dem JsonFileService
      // Wir verwenden den AppContext, um die Daten zu speichern
      const allCategories = [...updatedCategories, ...newCategories]

      // Speichere die Daten mit dem JsonFileService
      const success = await fetch("/api/supabase/save-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            categories: allCategories,
            guidelines: state.guidelines || [],
            principles: state.principles || [],
            lastUpdated: timestamp,
            version: "2.0",
          },
        }),
      }).then((res) => res.ok)

      if (success) {
        // Aktualisiere die Daten im AppContext
        await refreshData()

        setResult({
          success: true,
          message: `${newCategories.length} neue Kategorien hinzugefügt und ${updatedCategoryNames.length} bestehende Kategorien mit SVGs aktualisiert.`,
          addedCategories: addedCategoryNames,
          updatedCategories: updatedCategoryNames,
          svgsFound: svgsFromGuidelines.length,
        })
      } else {
        throw new Error("Fehler beim Speichern der Kategorien")
      }
    } catch (error) {
      console.error("Fehler beim Hinzufügen/Aktualisieren der Kategorien:", error)
      setResult({
        success: false,
        message: "Fehler beim Hinzufügen/Aktualisieren der Kategorien",
        error: error instanceof Error ? error.message : "Unbekannter Fehler",
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
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Kategorien mit SVG-Icons aus Guidelines aktualisieren</CardTitle>
          <CardDescription>
            Fügt neue Kategorien hinzu und aktualisiert alle Kategorien mit SVG-Icons aus bestehenden Guidelines.
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
                Zusätzlich werden alle bestehenden Kategorien ohne SVG-Icon mit einem SVG aus vorhandenen Guidelines
                aktualisiert.
              </p>
            </div>

            {result && (
              <Alert variant={result.success ? "default" : "destructive"}>
                {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{result.success ? "Erfolg" : "Fehler"}</AlertTitle>
                <AlertDescription>
                  <p>{result.message}</p>
                  {result.error && <p className="text-sm mt-1">Details: {result.error}</p>}

                  <p className="text-sm mt-1">
                    {result.svgsFound > 0
                      ? `${result.svgsFound} SVGs aus Guidelines gefunden und verwendet.`
                      : "Keine SVGs in Guidelines gefunden, Fallback-SVG verwendet."}
                  </p>

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
              "Kategorien mit SVG-Icons aus Guidelines aktualisieren"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
