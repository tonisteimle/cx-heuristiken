"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog"
import { ElementSelector } from "./element-selector"
import type { Principle } from "@/types/guideline"
import { DialogTitleText, DialogDescriptionText } from "@/components/ui/typography"

interface AddPrincipleDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (principle: Principle) => void
}

export function AddPrincipleDialog({ open, onClose, onSubmit }: AddPrincipleDialogProps) {
  const [newPrinciple, setNewPrinciple] = useState<Principle>({
    id: "",
    name: "",
    description: "",
    elements: [],
    implikation: "", // Added implikation field
  })

  const handleSubmit = () => {
    if (!newPrinciple.name || !newPrinciple.description) {
      return
    }

    const id = newPrinciple.name.toLowerCase().replace(/\s+/g, "-")
    onSubmit({ ...newPrinciple, id })

    // Reset form
    setNewPrinciple({
      id: "",
      name: "",
      description: "",
      elements: [],
      implikation: "", // Reset implikation as well
    })
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitleText>Neues Prinzip hinzufügen</DialogTitleText>
          <DialogDescriptionText>Fügen Sie ein neues psychologisches Prinzip hinzu</DialogDescriptionText>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={newPrinciple.name}
              onChange={(e) => setNewPrinciple({ ...newPrinciple, name: e.target.value })}
              placeholder="Name des Prinzips"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={newPrinciple.description}
              onChange={(e) => setNewPrinciple({ ...newPrinciple, description: e.target.value })}
              placeholder="Beschreibung des Prinzips"
              className="min-h-[150px]"
            />
          </div>

          {/* Optionales Feld für Evidenz als einfaches Textfeld */}
          <div className="grid gap-2">
            <Label htmlFor="experiments">Evidenz (optional)</Label>
            <Textarea
              id="experiments"
              value={newPrinciple.evidenz || ""}
              onChange={(e) => setNewPrinciple({ ...newPrinciple, evidenz: e.target.value })}
              placeholder="Beschreiben Sie Evidenz, die dieses Prinzip validiert oder anwendet"
              className="min-h-[150px]"
            />
          </div>

          {/* Optionales Feld für Implikation als einfaches Textfeld */}
          <div className="grid gap-2">
            <Label htmlFor="implikation">Implikation (optional)</Label>
            <Textarea
              id="implikation"
              value={newPrinciple.implikation || ""}
              onChange={(e) => setNewPrinciple({ ...newPrinciple, implikation: e.target.value })}
              placeholder="Beschreiben Sie die praktischen Implikationen dieses Prinzips"
              className="min-h-[150px]"
            />
          </div>

          {/* Element-Auswahl */}
          <div className="grid gap-2">
            <Label>Element-Zuordnung</Label>
            <ElementSelector
              selectedElements={newPrinciple.elements}
              onChange={(elements) => setNewPrinciple({ ...newPrinciple, elements })}
              showDescriptions={false}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} disabled={!newPrinciple.name || !newPrinciple.description}>
            Prinzip hinzufügen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
