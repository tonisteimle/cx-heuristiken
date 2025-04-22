"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import type { Principle } from "@/types/guideline"
import { DialogTitleText, DialogDescriptionText, MutedText } from "@/components/ui/typography"

interface ImportEvidenzDialogProps {
  open: boolean
  onClose: () => void
  onImport: (principles: Principle[]) => void
  existingPrinciples: Principle[]
}

export default function ImportEvidenzDialog({ open, onClose, onImport, existingPrinciples }: ImportEvidenzDialogProps) {
  const [evidenzText, setEvidenzText] = useState("")
  const { toast } = useToast()

  const handleImport = () => {
    try {
      // Teile den Text in Abschnitte für verschiedene Prinzipien
      const sections = evidenzText.split(/\n(?=[A-Z][a-z]+\s[A-Z][a-z]+|\w+\s\w+\s$$[^)]+$$)/)

      // Erstelle ein Array für die aktualisierten Prinzipien
      const updatedPrinciples: Principle[] = [...existingPrinciples]

      // Verarbeite jeden Abschnitt
      sections.forEach((section) => {
        // Extrahiere den Titel (erste Zeile)
        const titleMatch = section.match(/^([^\n]+)/)
        if (!titleMatch) return

        const title = titleMatch[1].trim()

        // Suche nach einem passenden Prinzip
        const principleIndex = updatedPrinciples.findIndex(
          (p) =>
            p.name.toLowerCase() === title.toLowerCase() ||
            title.toLowerCase().includes(p.name.toLowerCase()) ||
            p.name.toLowerCase().includes(title.toLowerCase()),
        )

        if (principleIndex !== -1) {
          // Füge den gesamten Abschnitt als Evidenz hinzu
          updatedPrinciples[principleIndex] = {
            ...updatedPrinciples[principleIndex],
            evidenz: section.trim(),
          }
        }
      })

      // Rufe die Import-Funktion mit den aktualisierten Prinzipien auf
      onImport(updatedPrinciples)

      toast({
        title: "Evidenz importiert",
        description: "Die Evidenz wurde erfolgreich zu den passenden Prinzipien hinzugefügt.",
      })

      onClose()
    } catch (error) {
      toast({
        title: "Fehler beim Import",
        description: "Es ist ein Fehler beim Importieren der Evidenz aufgetreten.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitleText>Evidenz importieren</DialogTitleText>
          <DialogDescriptionText>
            Fügen Sie Evidenz-Texte ein, die automatisch den passenden Prinzipien zugeordnet werden.
          </DialogDescriptionText>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="evidenz-text">Evidenz-Text</Label>
            <Textarea
              id="evidenz-text"
              value={evidenzText}
              onChange={(e) => setEvidenzText(e.target.value)}
              placeholder="Fügen Sie hier Ihren Evidenz-Text ein..."
              className="min-h-[300px]"
            />
            <MutedText>Der Text sollte strukturiert sein, wobei jedes Prinzip mit seinem Namen beginnt.</MutedText>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button onClick={handleImport}>Importieren</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
