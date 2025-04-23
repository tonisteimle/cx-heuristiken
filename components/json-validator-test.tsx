"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { JsonValidator } from "@/services/json-validator"
import { AlertCircle, Check } from "lucide-react"

export default function JsonValidatorTest() {
  const [jsonText, setJsonText] = useState("")
  const [result, setResult] = useState<{
    valid: boolean
    fixed: string
    corrections: string[]
    originalError?: string
  } | null>(null)

  const handleValidate = () => {
    if (!jsonText.trim()) {
      setResult({
        valid: false,
        fixed: "",
        corrections: ["Kein JSON-Text eingegeben"],
        originalError: "Empty input",
      })
      return
    }

    const validationResult = JsonValidator.validateAndFix(jsonText)
    setResult(validationResult)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">JSON-Validator und -Korrektor</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Eingabe</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="JSON-Text hier einfügen..."
              className="min-h-[300px] font-mono text-sm"
            />
            <Button onClick={handleValidate} className="mt-4 w-full">
              Validieren und korrigieren
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ergebnis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result && (
              <>
                <Alert
                  variant={result.valid ? "default" : "destructive"}
                  className={result.valid ? "bg-green-50 border-green-200" : ""}
                >
                  {result.valid ? <Check className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4" />}
                  <AlertTitle className={result.valid ? "text-green-800" : ""}>
                    {result.valid ? "JSON ist gültig" : "JSON ist ungültig"}
                  </AlertTitle>
                  <AlertDescription className={result.valid ? "text-green-700" : ""}>
                    {result.valid
                      ? "Das JSON wurde erfolgreich validiert und korrigiert."
                      : `Fehler: ${result.originalError}`}
                  </AlertDescription>
                </Alert>

                {result.corrections.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Durchgeführte Korrekturen:</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {result.corrections.map((correction, index) => (
                        <li key={index}>{correction}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.valid && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Korrigiertes JSON:</h3>
                    <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[300px]">
                      <pre className="text-xs">{result.fixed}</pre>
                    </div>
                  </div>
                )}
              </>
            )}

            {!result && (
              <div className="text-center py-12 text-muted-foreground">Validierungsergebnis wird hier angezeigt</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
