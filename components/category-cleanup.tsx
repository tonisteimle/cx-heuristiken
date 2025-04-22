"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { useAppContext } from "@/contexts/app-context"
import { useToast } from "@/components/ui/use-toast"
import { getStorageService } from "@/services/storage-factory"
import { FIXED_CATEGORIES } from "@/lib/constants"

export function CategoryCleanup() {
  const { state, refreshData } = useAppContext()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    stats?: {
      removedCategories: string[]
      updatedGuidelines: number
    }
  } | null>(null)

  const handleCleanup = async () => {
    try {
      setIsProcessing(true)
      setResult(null)

      // Alle Kategorien, die entfernt werden sollen (alle außer den fest definierten)
      const allCategories = new Set<string>()
      state.guidelines.forEach((guideline) => {
        guideline.categories.forEach((category) => {
          allCategories.add(category)
        })
      })

      const categoriesToRemove = Array.from(allCategories).filter((category) => !FIXED_CATEGORIES.includes(category))

      // Aktualisiere die Guidelines, um die zu entfernenden Kategorien zu entfernen
      const updatedGuidelines = state.guidelines.map((guideline) => {
        const updatedCategories = guideline.categories.filter((category) => FIXED_CATEGORIES.includes(category))

        // Nur aktualisieren, wenn sich die Kategorien geändert haben
        if (updatedCategories.length !== guideline.categories.length) {
          return {
            ...guideline,
            categories: updatedCategories,
            updatedAt: new Date().toISOString(),
          }
        }

        return guideline
      })

      // Speichere die aktualisierten Daten
      const storageService = getStorageService()
      const success = await storageService.saveData({
        ...state,
        guidelines: updatedGuidelines,
        categories: FIXED_CATEGORIES, // Nur die fest definierten Kategorien behalten
        lastUpdated: new Date().toISOString(),
      })

      if (success) {
        setResult({
          success: true,
          message: "Kategorien wurden erfolgreich bereinigt",
          stats: {
            removedCategories: categoriesToRemove,
            updatedGuidelines: updatedGuidelines.filter(
              (g, i) => g.categories.length !== state.guidelines[i].categories.length,
            ).length,
          },
        })

        // Daten neu laden
        await refreshData()

        toast({
          title: "Kategorien bereinigt",
          description: `${categoriesToRemove.length} Kategorien wurden entfernt und ${FIXED_CATEGORIES.length} Kategorien beibehalten.`,
        })
      } else {
        throw new Error("Fehler beim Speichern der bereinigten Daten")
      }
    } catch (error) {
      console.error("Fehler bei der Kategoriebereinigung:", error)
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Unbekannter Fehler bei der Kategoriebereinigung",
      })

      toast({
        title: "Fehler",
        description: "Bei der Kategoriebereinigung ist ein Fehler aufgetreten.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Kategorien bereinigen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>Diese Funktion entfernt alle Kategorien außer den folgenden aus allen Guidelines:</p>
        <ul className="list-disc pl-5 space-y-1">
          {FIXED_CATEGORIES.map((category) => (
            <li key={category}>{category}</li>
          ))}
        </ul>

        <Alert variant="warning" className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Achtung</AlertTitle>
          <AlertDescription className="text-amber-700">
            Diese Aktion kann nicht rückgängig gemacht werden. Alle anderen Kategorien werden aus allen Guidelines
            entfernt.
          </AlertDescription>
        </Alert>

        {result && (
          <Alert
            variant={result.success ? "default" : "destructive"}
            className={result.success ? "bg-green-50 border-green-200" : ""}
          >
            {result.success ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle className={result.success ? "text-green-800" : ""}>
              {result.success ? "Erfolg" : "Fehler"}
            </AlertTitle>
            <AlertDescription className={result.success ? "text-green-700" : ""}>
              <p>{result.message}</p>
              {result.stats && (
                <div className="mt-2">
                  <p>Entfernte Kategorien ({result.stats.removedCategories.length}):</p>
                  <ul className="list-disc pl-5 mt-1">
                    {result.stats.removedCategories.map((category) => (
                      <li key={category}>{category}</li>
                    ))}
                  </ul>
                  <p className="mt-2">Aktualisierte Guidelines: {result.stats.updatedGuidelines}</p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleCleanup} disabled={isProcessing} className="w-full">
          {isProcessing ? "Wird bearbeitet..." : "Kategorien bereinigen"}
        </Button>
      </CardFooter>
    </Card>
  )
}
