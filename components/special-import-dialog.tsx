"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Check, Upload } from "lucide-react"

interface SpecialImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function SpecialImportDialog({ open, onOpenChange, onSuccess }: SpecialImportDialogProps) {
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleImport = async () => {
    try {
      setIsImporting(true)
      setProgress(10)
      setError(null)

      // Hier die JSON-Daten direkt einfügen
      const principlesData = {
        principles: [
          // Hier würden alle Prinzipien aus der JSON-Datei eingefügt werden
          // Für die Übersichtlichkeit habe ich nur ein Beispiel eingefügt
          {
            id: "action-bias",
            name: "Action Bias",
            description:
              "Du neigst dazu, lieber aktiv zu handeln, selbst wenn Nicht-Handeln vorteilhafter wäre – was zu impulsiven Entscheidungen führen kann.",
            elements: ["decision"],
            evidenz: "Beispiele: Mehrmaliges Refresh bei Verzögerungen; Manager ändern Strategien impulsiv.",
          },
          // ... weitere Prinzipien
        ],
      }

      setProgress(30)

      // API-Aufruf zum Importieren der Daten
      const response = await fetch("/api/special-import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(principlesData),
      })

      setProgress(70)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Fehler beim Import")
      }

      const result = await response.json()
      setResult(result)
      setProgress(100)

      toast({
        title: "Import erfolgreich",
        description: `${result.stats.updated} Prinzipien wurden aktualisiert.`,
      })

      // Dialog schließen und Daten aktualisieren
      setTimeout(() => {
        onOpenChange(false)
        onSuccess()
      }, 2000)
    } catch (error) {
      console.error("Fehler beim Import:", error)
      setError(error instanceof Error ? error.message : "Unbekannter Fehler beim Import")
      setProgress(0)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Spezial-Import: Prinzipien aktualisieren</DialogTitle>
          <DialogDescription>
            Diese Funktion aktualisiert die Elemente und Evidenz-Angaben der bestehenden Prinzipien. Keine Daten werden
            gelöscht oder dupliziert.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Fehler</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert variant="success" className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Import erfolgreich</AlertTitle>
              <AlertDescription className="text-green-700">
                <p>Statistik:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>Aktualisierte Prinzipien: {result.stats.updated}</li>
                  <li>Unveränderte Prinzipien: {result.stats.unchanged}</li>
                  <li>Fehler: {result.stats.errors}</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {progress > 0 && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {isImporting ? "Importiere..." : progress === 100 ? "Import abgeschlossen" : "Vorbereitung..."}
              </p>
            </div>
          )}

          <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
            <p className="text-amber-800 text-sm">
              <strong>Hinweis:</strong> Diese Funktion ist für einen einmaligen Import gedacht und kann nach der
              Verwendung wieder entfernt werden. Es werden nur die Elemente und Evidenz-Angaben der bestehenden
              Prinzipien aktualisiert.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isImporting}>
            Abbrechen
          </Button>
          <Button onClick={handleImport} disabled={isImporting} className="flex items-center gap-2">
            <Upload size={16} />
            {isImporting ? "Importiere..." : "Jetzt importieren"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function SpecialImportButton({ onSuccess }: { onSuccess: () => void }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)} className="flex items-center gap-1">
        <Upload size={14} />
        Prinzipien-Elemente importieren
      </Button>
      <SpecialImportDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSuccess={onSuccess} />
    </>
  )
}
