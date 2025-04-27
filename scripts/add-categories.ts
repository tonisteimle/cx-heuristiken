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

export default function AddCategoriesPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    addedCategories: string[]
    existingCategories: string[]
    error?: string
  } | null>(null)

  const addCategories = async () => {
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

      // 3. Erstelle neue Kategorien für alle Namen, die noch nicht existieren
      const newCategories: Category[] = []
      const addedCategoryNames: string[] = []
      const existingCategoryNames: string[] = []
      const timestamp = new Date().toISOString()

      for (const categoryName of CATEGORIES_TO_ADD) {
        if (!existingCategoryMap.has(categoryName)) {
          const newCategory: Category = {
            id: `category-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            name: categoryName,
            description: `Automatisch erstellt am ${new Date().toLocaleDateString()}`,
            createdAt: timestamp,
            updatedAt: timestamp,
          }

          newCategories.push(newCategory)
          addedCategoryNames.push(categoryName)
        } else {
          existingCategoryNames.push(categoryName)
        }
      }

      if (newCategories.length === 0) {
        setResult({
          success: true,
          message: "Alle Kategorien existieren bereits. Keine Änderungen notwendig.",
          addedCategories: [],
          existingCategories: existingCategoryNames,
        })
        return
      }

      // 4. Speichere die neuen Kategorien
      const allCategories = [...existingCategories, ...newCategories]

      const saveDataResponse = await fetch("/api/supabase/save-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            categories: allCategories,
            guidelines: [], // Keine Guidelines ändern
            principles: [], // Keine Principles ändern
            lastUpdated: timestamp,
            version: "2.0",
          },
          isIncremental: true, // Inkrementeller Modus, um nur Kategorien zu aktualisieren
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
        message: `${newCategories.length} neue Kategorien erfolgreich hinzugefügt.`,
        addedCategories: addedCategoryNames,
        existingCategories: existingCategoryNames,
      })
    } catch (error) {
      console.error("Fehler beim Hinzufügen der Kategorien:", error)
      setResult({
        success: false,
        message: "Fehler beim Hinzufügen der Kategorien",
        error: error instanceof Error ? error.message : "Unbekannter Fehler",
        addedCategories: [],
        existingCategories: [],
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Kategorien hinzufügen</CardTitle>
          <CardDescription>
            Fügt die vordefinierten Kategorien zum System hinzu, falls sie noch nicht existieren.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-md p-4 bg-gray-50">
              <h3 className="font-medium mb-2">Folgende Kategorien werden hinzugefügt:</h3>
              <ul className="list-disc pl-5 space-y-1">
                {CATEGORIES_TO_ADD.map((category) => (
                  <li key={category}>{category}</li>
                ))}
              </ul>
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

                  {result.existingCategories.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium">Bereits vorhandene Kategorien:</p>
                      <ul className="list-disc pl-5 text-sm">
                        {result.existingCategories.map((cat) => (
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
          <Button onClick={addCategories} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Kategorien werden hinzugefügt...
              </>
            ) : (
              "Kategorien hinzufügen"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
