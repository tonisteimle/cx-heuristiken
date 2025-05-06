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

  // Finde die verknüpften Prinzipien
  const linkedPrinciples = principles.filter((principle) => guideline.principles.includes(principle.id))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{guideline.title}</DialogTitle>
          <DialogDescription>
            <div className="flex flex-wrap gap-1 mt-2">
              {guideline.categories.map((category) => (
                <Badge key={category} variant="outline">
                  {category}
                </Badge>
              ))}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Linke Spalte: Bild und Text */}
          <div className="space-y-4">
            <div className="h-64 overflow-hidden rounded-md flex items-center justify-center bg-gray-50">
              {guideline.svgContent ? (
                <div dangerouslySetInnerHTML={{ __html: guideline.svgContent }} className="w-full h-full" />
              ) : guideline.imageUrl ? (
                <img
                  src={guideline.imageUrl || "/placeholder.svg"}
                  alt={guideline.title}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?key=sdnoa"
                  }}
                />
              ) : (
                <div className="text-gray-400 text-sm">Kein Bild verfügbar</div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Beschreibung</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{guideline.text}</p>
            </div>
          </div>

          {/* Rechte Spalte: Detail-Bild und verknüpfte Prinzipien */}
          <div className="space-y-4">
            {(guideline.detailSvgContent || guideline.detailImageUrl) && (
              <div>
                <h3 className="text-lg font-medium mb-2">Detail-Ansicht</h3>
                <div className="h-64 overflow-hidden rounded-md flex items-center justify-center bg-gray-50">
                  {guideline.detailSvgContent ? (
                    <div dangerouslySetInnerHTML={{ __html: guideline.detailSvgContent }} className="w-full h-full" />
                  ) : guideline.detailImageUrl ? (
                    <img
                      src={guideline.detailImageUrl || "/placeholder.svg"}
                      alt={`${guideline.title} (Detail)`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?key=sdnoa"
                      }}
                    />
                  ) : null}
                </div>
              </div>
            )}

            {linkedPrinciples.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Verknüpfte psychologische Prinzipien</h3>
                <div className="space-y-3">
                  {linkedPrinciples.map((principle) => (
                    <div key={principle.id} className="p-3 border rounded-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{principle.title}</h4>
                          <Badge variant="outline" className="text-xs mt-1">
                            {principle.element}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{principle.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

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
