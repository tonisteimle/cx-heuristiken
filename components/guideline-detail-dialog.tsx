"use client"

import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import type { Guideline, Principle } from "@/types/guideline"
import { Separator } from "@/components/ui/separator"
import { Title } from "@/components/ui/typography"

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
          <Title className="text-2xl font-bold">{guideline.title}</Title>
          <p className="text-sm text-muted-foreground">
            Erstellt am {new Date(guideline.createdAt).toLocaleDateString()} • Aktualisiert am{" "}
            {new Date(guideline.updatedAt).toLocaleDateString()}
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Bild/SVG */}
          {(guideline.svgContent || guideline.imageUrl) && (
            <div className="flex justify-center mb-4">
              {guideline.svgContent ? (
                <div
                  className="w-48 h-48 bg-white rounded border"
                  dangerouslySetInnerHTML={{ __html: guideline.svgContent }}
                />
              ) : (
                <img
                  src={guideline.imageUrl || "/placeholder.svg"}
                  alt={guideline.title}
                  className="w-48 h-48 object-contain bg-white rounded border"
                />
              )}
            </div>
          )}

          {/* Guideline Text */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Guideline</h3>
            <p>{guideline.text}</p>
          </div>

          <Separator />

          {/* Begründung */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Begründung</h3>
            <p>{guideline.justification}</p>
          </div>

          <Separator />

          {/* Psychologische Prinzipien */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Psychologische Prinzipien</h3>
            {guidelinePrinciples.length > 0 ? (
              <div className="space-y-2">
                {guidelinePrinciples.map((principle) => (
                  <p key={principle.id}>{principle.description}</p>
                ))}
              </div>
            ) : (
              <p>Keine psychologischen Prinzipien zugeordnet.</p>
            )}
          </div>

          <Separator />

          {/* Kategorien */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Kategorien</h3>
            <div className="flex flex-wrap gap-2">
              {guideline.categories.map((category) => (
                <span
                  key={category}
                  className="px-2 py-1 bg-gray-100 rounded text-sm cursor-pointer"
                  onClick={() => onCategorySelect(category)}
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer mit Aktionen */}
        <DialogFooter className="border-t pt-4">
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
              >
                <Pencil size={16} className="mr-2" />
                Bearbeiten
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  onDelete(guideline.id)
                  onOpenChange(false)
                }}
              >
                <Trash2 size={16} className="mr-2" />
                Löschen
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
