"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil } from "lucide-react"
import type { Principle } from "@/types/guideline"

interface PrincipleDetailDialogProps {
  principle: Principle | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (principle: Principle) => void
}

export function PrincipleDetailDialog({ principle, open, onOpenChange, onEdit }: PrincipleDetailDialogProps) {
  if (!principle) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{principle.title}</DialogTitle>
          <DialogDescription>
            <Badge variant="outline" className="mt-2">
              {principle.element}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Bild (falls vorhanden) */}
          {principle.imageUrl && (
            <div className="h-64 overflow-hidden rounded-md flex items-center justify-center bg-gray-50">
              <img
                src={principle.imageUrl || "/placeholder.svg"}
                alt={principle.title}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?key=sdnoa"
                }}
              />
            </div>
          )}

          {/* Beschreibung */}
          <div>
            <h3 className="text-lg font-medium mb-2">Beschreibung</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{principle.description}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onEdit(principle)}>
            <Pencil size={14} className="mr-1" />
            Bearbeiten
          </Button>
          <Button onClick={() => onOpenChange(false)}>Schließen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
