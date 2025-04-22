"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, ArrowLeft, RefreshCw, FileCode } from "lucide-react"
import { migrateImageDataToSvg } from "@/scripts/migrate-to-svg"
import { useRouter } from "next/navigation"
import { svgTemplates } from "@/components/svg-templates"

export default function MigrateToSvgPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ success: boolean; message: string; details?: any } | null>(null)
  const [step, setStep] = useState<"intro" | "migrating" | "complete" | "error">("intro")
  const router = useRouter()

  async function runMigration() {
    setIsLoading(true)
    setProgress(10)
    setStep("migrating")

    try {
      // Simuliere Fortschritt
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      // Führe die Migration aus
      const migrationResult = await migrateImageDataToSvg()

      clearInterval(progressInterval)
      setProgress(100)

      if (migrationResult.success) {
        setResult({
          success: true,
          message: migrationResult.message,
          details: migrationResult.details || { migratedCount: 0 },
        })
        setStep("complete")
      } else {
        throw new Error(migrationResult.message || "Unbekannter Fehler bei der Migration")
      }
    } catch (error) {
      console.error("Fehler bei der Migration:", error)
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Unbekannter Fehler bei der Migration",
      })
      setStep("error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push("/")} className="flex items-center gap-2 mb-4">
          <ArrowLeft size={16} />
          Zurück zur Hauptseite
        </Button>

        <h1 className="text-3xl font-bold">SVG-Migration</h1>
        <p className="text-muted-foreground mt-2">
          Migrieren Sie bestehende Bild-URLs zu SVG-Inhalten für verbesserte Visualisierungen
        </p>
      </div>

      {step === "intro" && (
        <Card>
          <CardHeader>
            <CardTitle>Migration zu SVG-Unterstützung</CardTitle>
            <CardDescription>
              Dieses Tool konvertiert bestehende Bild-URLs in SVG-Platzhalter und aktualisiert die Datenbank.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Wichtiger Hinweis</AlertTitle>
              <AlertDescription className="text-amber-700">
                Bitte stellen Sie sicher, dass Sie ein Backup Ihrer Daten haben, bevor Sie fortfahren. Die Migration
                behält die bestehenden Bild-URLs bei, fügt aber SVG-Platzhalter hinzu.
              </AlertDescription>
            </Alert>

            <div className="space-y-4 mt-4">
              <h3 className="text-lg font-medium">Was wird migriert?</h3>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  Alle Guidelines mit <Badge variant="outline">imageUrl</Badge> erhalten einen SVG-Platzhalter
                </li>
                <li>
                  Alle Guidelines mit <Badge variant="outline">detailImageUrl</Badge> erhalten einen
                  SVG-Detail-Platzhalter
                </li>
                <li>Die Datenbank wird mit den neuen SVG-Spalten aktualisiert</li>
                <li>Bestehende Bild-URLs bleiben erhalten und funktionieren weiterhin</li>
              </ul>
            </div>

            <div className="space-y-4 mt-4">
              <h3 className="text-lg font-medium">SVG-Platzhalter Beispiel</h3>
              <div className="border rounded-md p-4 bg-white">
                <div dangerouslySetInnerHTML={{ __html: svgTemplates.placeholder }} className="w-full h-40" />
              </div>
              <p className="text-sm text-muted-foreground">
                Dieser Platzhalter wird für alle bestehenden Bilder verwendet. Sie können die SVG-Inhalte später
                individuell anpassen.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <Button variant="outline" onClick={() => router.push("/")}>
              Abbrechen
            </Button>
            <Button onClick={runMigration} disabled={isLoading}>
              <FileCode size={16} className="mr-2" />
              Migration starten
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === "migrating" && (
        <Card>
          <CardHeader>
            <CardTitle>Migration läuft...</CardTitle>
            <CardDescription>Bitte warten Sie, während die Daten migriert werden.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Fortschritt</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="space-y-2 mt-4">
              <h3 className="text-sm font-medium">Aktuelle Schritte:</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>Datenbankschema überprüfen</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>Daten laden</span>
                </li>
                {progress >= 30 && (
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle size={16} className="text-green-500" />
                    <span>SVG-Platzhalter erstellen</span>
                  </li>
                )}
                {progress >= 60 && (
                  <li className="flex items-center gap-2 text-sm">
                    <RefreshCw size={16} className="animate-spin text-amber-500" />
                    <span>Daten aktualisieren</span>
                  </li>
                )}
                {progress >= 90 && (
                  <li className="flex items-center gap-2 text-sm">
                    <RefreshCw size={16} className="animate-spin text-amber-500" />
                    <span>Änderungen speichern</span>
                  </li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "complete" && (
        <Card>
          <CardHeader className="bg-green-50 border-b border-green-100">
            <div className="flex items-center gap-2">
              <CheckCircle size={20} className="text-green-500" />
              <CardTitle>Migration erfolgreich</CardTitle>
            </div>
            <CardDescription>Die Migration zu SVG wurde erfolgreich abgeschlossen.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Erfolg</AlertTitle>
              <AlertDescription className="text-green-700">{result?.message}</AlertDescription>
            </Alert>

            <div className="space-y-4 mt-4">
              <h3 className="text-lg font-medium">Nächste Schritte</h3>
              <ul className="space-y-2 list-disc pl-5">
                <li>Kehren Sie zur Hauptseite zurück und überprüfen Sie die Guidelines</li>
                <li>Bearbeiten Sie die Guidelines, um die SVG-Inhalte anzupassen</li>
                <li>Erstellen Sie neue Guidelines mit benutzerdefinierten SVG-Inhalten</li>
              </ul>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Hinweise zur Verwendung der neuen SVG-Funktionalität:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Die Anwendung unterstützt jetzt sowohl SVG als auch PNG-Bilder</li>
                <li>SVG-Inhalte haben Vorrang vor Bildern, wenn beide vorhanden sind</li>
                <li>
                  Sie können SVG-Vorlagen aus der Datei <code>svg-templates.tsx</code> verwenden
                </li>
                <li>Für eine vollständige Migration sollten alle bestehenden Guidelines aktualisiert werden</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <Button variant="outline" onClick={() => setStep("intro")}>
              Zurück
            </Button>
            <Button onClick={() => router.push("/")}>Zur Hauptseite</Button>
          </CardFooter>
        </Card>
      )}

      {step === "error" && (
        <Card>
          <CardHeader className="bg-red-50 border-b border-red-100">
            <div className="flex items-center gap-2">
              <AlertCircle size={20} className="text-red-500" />
              <CardTitle>Fehler bei der Migration</CardTitle>
            </div>
            <CardDescription>Bei der Migration ist ein Fehler aufgetreten.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Fehler</AlertTitle>
              <AlertDescription>{result?.message}</AlertDescription>
            </Alert>

            <div className="space-y-4 mt-4">
              <h3 className="text-lg font-medium">Mögliche Lösungen</h3>
              <ul className="space-y-2 list-disc pl-5">
                <li>Stellen Sie sicher, dass die Datenbank-Migration ausgeführt wurde</li>
                <li>Überprüfen Sie die Konsolenausgabe auf weitere Fehlermeldungen</li>
                <li>Stellen Sie sicher, dass alle erforderlichen Komponenten installiert sind</li>
                <li>Versuchen Sie, die Anwendung neu zu starten und erneut zu migrieren</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <Button variant="outline" onClick={() => router.push("/")}>
              Abbrechen
            </Button>
            <Button onClick={() => setStep("intro")}>Erneut versuchen</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
