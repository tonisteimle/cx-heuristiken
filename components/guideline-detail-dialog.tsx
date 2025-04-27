"use client"

import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import type { Guideline, Principle } from "@/types/guideline"
import { Separator } from "@/components/ui/separator"
import {
  Title,
  SectionTitle,
  SubsectionTitle,
  DialogParagraph,
  DialogDescriptionText,
} from "@/components/ui/typography"

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <Title className="text-3xl font-bold mb-2">{guideline.title}</Title>
          <DialogDescriptionText>
            Erstellt am {new Date(guideline.createdAt).toLocaleDateString()} • Aktualisiert am{" "}
            {new Date(guideline.updatedAt).toLocaleDateString()}
          </DialogDescriptionText>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* SVG-Anzeige */}
          {guideline.svgContent && (
            <div className="mb-6 flex justify-center">
              <div
                className="w-64 h-64 bg-white rounded-md p-4 border"
                dangerouslySetInnerHTML={{ __html: guideline.svgContent }}
              />
            </div>
          )}

          {/* Alternativ, wenn kein SVG vorhanden ist, aber ein Bild */}
          {!guideline.svgContent && guideline.imageUrl && (
            <div className="mb-6 flex justify-center">
              <img
                src={guideline.imageUrl || "/placeholder.svg"}
                alt={guideline.title}
                className="w-64 h-64 object-contain bg-white rounded-md p-4 border"
              />
            </div>
          )}

          {/* Guideline-Text mit grünem Rand links */}
          <div className="border-l-4 border-[#62b4b0] bg-muted/20 p-4">
            <div className="mb-1">
              <span className="text-[#62b4b0] font-bold">Guideline</span>
            </div>
            <DialogParagraph className="text-xl">{guideline.text}</DialogParagraph>
          </div>

          <Separator className="my-4" />

          {/* Zwei-Spalten-Layout für Begründung und Prinzipien */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Begründung */}
            <div className="space-y-2">
              <SubsectionTitle className="font-bold">BEGRÜNDUNG</SubsectionTitle>
              <DialogParagraph>{guideline.justification}</DialogParagraph>
            </div>

            {/* Psychologische Prinzipien */}
            <div className="space-y-2">
              <SubsectionTitle className="font-bold">PSYCHOLOGISCHE PRINZIPIEN</SubsectionTitle>
              {guidelinePrinciples.length > 0 ? (
                <div className="space-y-4">
                  {guidelinePrinciples.map((principle) => (
                    <DialogParagraph key={principle.id}>{principle.description}</DialogParagraph>
                  ))}
                </div>
              ) : (
                <DialogParagraph>Keine psychologischen Prinzipien zugeordnet.</DialogParagraph>
              )}
            </div>
          </div>

          {/* Kategorien */}
          <div className="mt-6">
            <SectionTitle className="font-bold mb-4">Kategorien</SectionTitle>
            <div className="flex flex-wrap gap-3">
              {guideline.categories.map((category) => (
                <Badge
                  key={category}
                  className="bg-[#62b4b0] text-white px-4 py-3 cursor-pointer"
                  onClick={() => onCategorySelect(category)}
                >
                  {category}
                </Badge>
              ))}
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
          {guideline.svgContent && (
            <div className="text-xs text-muted-foreground mt-2">
              SVG vorhanden: {guideline.svgContent.length} Zeichen
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
