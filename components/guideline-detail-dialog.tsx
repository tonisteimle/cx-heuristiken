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
import { Pencil } from "lucide-react"
import type { Guideline, Principle } from "@/types/guideline"

interface GuidelineDetailDialogProps {
  guideline: Guideline | null
  principles: Principle[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (guideline: Guideline) => void
}

export function GuidelineDetailDialog({
  guideline,
  principles,
  open,
  onOpenChange,
  onEdit,
}: GuidelineDetailDialogProps) {
  if (!guideline) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{guideline.title}</DialogTitle>
          <DialogDescription>Bearbeiten Sie diese Guideline oder schließen Sie den Dialog.</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onEdit(guideline)}>
            <Pencil size={14} className="mr-1" />
            Bearbeiten
          </Button>
          <Button onClick={() => onOpenChange(false)}>Schließen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
