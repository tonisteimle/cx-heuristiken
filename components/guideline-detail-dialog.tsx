"use client"

import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import type { Guideline, Principle } from "@/types/guideline"
import { Separator } from "@/components/ui/separator"
import { BodyText, MutedText } from "@/components/ui/typography"

interface GuidelineDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guideline: Guideline | null
  principles: Principle[]
  isAuthenticated: boolean
  onEdit: (guideline: Guideline) => void
  onDelete: (id: string) => void
  onCategorySelect: (category: string) => void
}

export function GuidelineDetailDialog({
  open,
  onOpenChange,
  guideline,
  principles,
  isAuthenticated,
  onEdit,
  onDelete,
  onCategorySelect,
}: GuidelineDetailDialogProps) {
  if (!guideline) return null

  // Finde die Prinzipien, die dieser Guideline zugeordnet sind
  const guidelinePrinciples = principles.filter((principle) => guideline.principles.includes(principle.id))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <h2 className="text-xl font-semibold text-black">{guideline.title}</h2>
          <MutedText className="text-xs">
            Erstellt am {new Date(guideline.createdAt).toLocaleDateString()} • Aktualisiert am{" "}
            {new Date(guideline.updatedAt).toLocaleDateString()}
          </MutedText>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Guideline-Text */}
          <div className="space-y-2">
            <h3 className="text-base font-medium text-black">Guideline</h3>
            <BodyText className="text-gray-700 whitespace-pre-wrap">{guideline.text}</BodyText>
          </div>

          <Separator className="my-4" />

          {/* Begründung */}
          <div className="space-y-2">
            <h3 className="text-base font-medium text-black">Begründung</h3>
            <BodyText className="text-gray-700 whitespace-pre-wrap">{guideline.justification}</BodyText>
          </div>

          <Separator className="my-4" />

          {/* Psychologische Prinzipien */}
          <div className="space-y-4">
            <h3 className="text-base font-medium text-black">Psychologische Prinzipien</h3>

            {guidelinePrinciples.length > 0 ? (
              <div className="space-y-5">
                {guidelinePrinciples.map((principle) => (
                  <div key={principle.id} className="bg-gray-50 p-4 rounded-md">
                    <h4 className="text-base font-medium text-black mb-2">{principle.name}</h4>
                    <BodyText className="text-gray-700 whitespace-pre-wrap">{principle.description}</BodyText>
                  </div>
                ))}
              </div>
            ) : (
              <BodyText className="text-gray-500">Keine psychologischen Prinzipien zugeordnet.</BodyText>
            )}
          </div>

          {/* Kategorien */}
          <div className="space-y-2">
            <h3 className="text-base font-medium text-black">Kategorien</h3>
            <div className="flex flex-wrap gap-2">
              {guideline.categories.map((category) => (
                <Badge
                  key={category}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 cursor-pointer"
                  onClick={() => onCategorySelect(category)}
                >
                  {category}
                </Badge>
              ))}

              {guideline.categories.length === 0 && <MutedText>Keine Kategorien zugeordnet.</MutedText>}
            </div>
          </div>
        </div>

        {/* Footer mit Aktionen */}
        <DialogFooter className="flex justify-between items-center border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Schließen
          </Button>

          {isAuthenticated && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  onEdit(guideline)
                  onOpenChange(false)
                }}
                className="flex items-center gap-1"
              >
                <Pencil size={16} />
                Bearbeiten
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  onDelete(guideline.id)
                  onOpenChange(false)
                }}
                className="flex items-center gap-1 text-muted-foreground"
              >
                <Trash2 size={16} />
                Löschen
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
