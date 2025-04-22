"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog"
import { ElementSelector } from "./element-selector"
import type { Principle } from "@/types/guideline"
import { DialogTitleText, DialogDescriptionText } from "@/components/ui/typography"

interface EditPrincipleDialogProps {
  open: boolean
  onClose: () => void
  principle: Principle | null | undefined
  onSubmit: (principle: Principle) => void
}

export function EditPrincipleDialog({ open, onClose, principle, onSubmit }: EditPrincipleDialogProps) {
  const [editedPrinciple, setEditedPrinciple] = useState<Principle>({
    id: "",
    name: "",
    description: "",
    elements: [],
    implikation: "",
  })

  useEffect(() => {
    if (principle) {
      setEditedPrinciple({
        id: principle.id,
        name: principle.name,
        description: principle.description,
        elements: principle.elements || [],
        evidenz: principle.evidenz || "",
        implikation: principle.implikation || "",
      })
    }
  }, [principle])

  const handleSubmit = () => {
    if (editedPrinciple.name && editedPrinciple.description) {
      onSubmit(editedPrinciple)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitleText>Prinzip bearbeiten</DialogTitleText>
          <DialogDescriptionText>Ändern Sie die Details des psychologischen Prinzips</DialogDescriptionText>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              value={editedPrinciple.name}
              onChange={(e) => setEditedPrinciple({ ...editedPrinciple, name: e.target.value })}
              placeholder="Name des Prinzips"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-description">Beschreibung</Label>
            <Textarea
              id="edit-description"
              value={editedPrinciple.description}
              onChange={(e) => setEditedPrinciple({ ...editedPrinciple, description: e.target.value })}
              placeholder="Beschreibung des Prinzips"
              className="min-h-[150px]"
            />
          </div>

          {/* Evidenz als einfaches Textfeld */}
          <div className="grid gap-2">
            <Label htmlFor="edit-experiments">Evidenz (optional)</Label>
            <Textarea
              id="edit-experiments"
              value={editedPrinciple.evidenz || ""}
              onChange={(e) => setEditedPrinciple({ ...editedPrinciple, evidenz: e.target.value })}
              placeholder="Beschreiben Sie Evidenz, die dieses Prinzip validiert oder anwenden"
              className="min-h-[150px]"
            />
          </div>

          {/* Implikation als einfaches Textfeld */}
          <div className="grid gap-2">
            <Label htmlFor="edit-implikation">Implikation (optional)</Label>
            <Textarea
              id="edit-implikation"
              value={editedPrinciple.implikation || ""}
              onChange={(e) => setEditedPrinciple({ ...editedPrinciple, implikation: e.target.value })}
              placeholder="Beschreiben Sie die praktischen Implikationen dieses Prinzips"
              className="min-h-[150px]"
            />
          </div>

          {/* Element-Auswahl */}
          <div className="grid gap-2">
            <Label>Element-Zuordnung</Label>
            <ElementSelector
              selectedElements={editedPrinciple.elements}
              onChange={(elements) => setEditedPrinciple({ ...editedPrinciple, elements })}
              showDescriptions={false}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} disabled={!editedPrinciple.name || !editedPrinciple.description}>
            Änderungen speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
