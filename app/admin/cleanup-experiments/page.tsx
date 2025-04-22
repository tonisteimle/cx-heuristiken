"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function CleanupExperimentsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleCleanup = async () => {
    if (isLoading) return

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/supabase/cleanup-experiments")
      const data = await response.json()

      setResult({
        success: data.success,
        message: data.success
          ? "Experiments wurden erfolgreich aus der Datenbank entfernt."
          : data.error || "Ein Fehler ist aufgetreten.",
      })
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Ein unbekannter Fehler ist aufgetreten.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Experiment-Daten bereinigen</CardTitle>
          <CardDescription>
            Diese Funktion entfernt alle Experiment-Daten aus der Supabase-Datenbank, da diese Funktionalität nicht mehr
            verwendet wird.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result && (
            <Alert className={result.success ? "bg-green-50" : "bg-red-50"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertTitle>{result.success ? "Erfolg" : "Fehler"}</AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleCleanup} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird bereinigt...
              </>
            ) : (
              "Experiment-Daten bereinigen"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
