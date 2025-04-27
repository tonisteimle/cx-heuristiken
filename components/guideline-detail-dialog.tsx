"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { BookOpen } from "lucide-react"
import type { Guideline } from "@/types/guideline"
import { useAppContext } from "@/contexts/app-context"

interface GuidelineDetailDialogProps {
  guideline: Guideline | null
  isOpen: boolean
  onClose: () => void
}

export function GuidelineDetailDialog({ guideline, isOpen, onClose }: GuidelineDetailDialogProps) {
  const { state } = useAppContext()

  if (!guideline) return null

  // Funktion zum Abrufen des Kategorienamens anhand der ID
  const getCategoryName = (categoryId: string) => {
    const category = state.categories.find((cat) => cat.id === categoryId)
    return category ? category.name : categoryId
  }

  // Funktion zum Abrufen des Prinzips anhand der ID
  const getPrinciple = (principleId: string) => {
    return state.principles.find((p) => p.id === principleId)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{guideline.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Bild oder SVG anzeigen, falls vorhanden */}
          {(guideline.detailSvgContent || guideline.detailImageUrl || guideline.svgContent || guideline.imageUrl) && (
            <div className="bg-muted/30 rounded-md overflow-hidden flex justify-center items-center p-4">
              {guideline.detailSvgContent ? (
                <div
                  dangerouslySetInnerHTML={{ __html: guideline.detailSvgContent }}
                  className="w-full max-h-[300px]"
                />
              ) : guideline.detailImageUrl ? (
                <img
                  src={guideline.detailImageUrl || "/placeholder.svg"}
                  alt={guideline.title}
                  className="max-h-[300px] object-contain"
                />
              ) : guideline.svgContent ? (
                <div dangerouslySetInnerHTML={{ __html: guideline.svgContent }} className="w-full max-h-[300px]" />
              ) : guideline.imageUrl ? (
                <img
                  src={guideline.imageUrl || "/placeholder.svg"}
                  alt={guideline.title}
                  className="max-h-[300px] object-contain"
                />
              ) : null}
            </div>
          )}

          {/* Guideline-Text */}
          <div>
            <h3 className="text-sm font-medium mb-1">Guideline</h3>
            <p className="text-sm">{guideline.text}</p>
          </div>

          {/* Begründung */}
          {guideline.justification && (
            <div>
              <h3 className="text-sm font-medium mb-1">Begründung</h3>
              <p className="text-sm">{guideline.justification}</p>
            </div>
          )}

          {/* Kategorien */}
          <div>
            <h3 className="text-sm font-medium mb-2">Kategorien</h3>
            <div className="flex flex-wrap gap-2">
              {guideline.categories.map((categoryId) => (
                <Badge key={categoryId} variant="outline">
                  {getCategoryName(categoryId)}
                </Badge>
              ))}
            </div>
          </div>

          {/* Psychologische Prinzipien */}
          {guideline.principles && guideline.principles.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <BookOpen size={14} className="mr-1" />
                Psychologische Prinzipien
              </h3>
              <div className="space-y-2">
                {guideline.principles.map((principleId) => {
                  const principle = getPrinciple(principleId)
                  return principle ? (
                    <div key={principleId} className="bg-muted/30 p-3 rounded-md">
                      <h4 className="font-medium text-sm">{principle.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{principle.description}</p>
                    </div>
                  ) : null
                })}
              </div>
            </div>
          )}

          {/* Metadaten */}
          <div className="text-xs text-muted-foreground pt-2">
            <p>Erstellt: {new Date(guideline.createdAt).toLocaleDateString()}</p>
            <p>Aktualisiert: {new Date(guideline.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
