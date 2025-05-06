"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, BookOpen, FileText, Link2, ExternalLink } from "lucide-react"
import type { Principle } from "@/types/guideline"

interface PrincipleDetailDialogProps {
  principle: Principle | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (principle: Principle) => void
}

export function PrincipleDetailDialog({ principle, open, onOpenChange, onEdit }: PrincipleDetailDialogProps) {
  if (!principle) return null

  // Verwende name als Fallback für title und umgekehrt
  const displayTitle = principle.name || principle.title || ""

  // Extrahiere alle möglichen Felder
  const evidenz = principle.evidenz || principle.evidence || ""
  const implikation = principle.implikation || ""
  const examples = principle.examples || ""
  const sources = Array.isArray(principle.sources) ? principle.sources : []
  const relatedPrinciples = Array.isArray(principle.relatedPrinciples) ? principle.relatedPrinciples : []
  const applications = principle.applications || ""
  const limitations = principle.limitations || ""

  // Stelle sicher, dass elements ein Array ist
  const elements = Array.isArray(principle.elements) ? principle.elements : [principle.element].filter(Boolean)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{displayTitle}</DialogTitle>
          <div className="flex flex-wrap gap-1 mt-2">
            {elements.map((element, index) => (
              <Badge key={index} variant="outline">
                {element}
              </Badge>
            ))}
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Bild (falls vorhanden) */}
          {principle.imageUrl && (
            <div className="h-64 overflow-hidden rounded-md flex items-center justify-center bg-gray-50">
              <img
                src={principle.imageUrl || "/placeholder.svg"}
                alt={displayTitle}
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

          {/* Evidenz (falls vorhanden) */}
          {evidenz && (
            <div>
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <BookOpen size={18} className="mr-2" />
                Evidenz
              </h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{evidenz}</p>
            </div>
          )}

          {/* Implikation (falls vorhanden) */}
          {implikation && (
            <div>
              <h3 className="text-lg font-medium mb-2">Implikation</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{implikation}</p>
            </div>
          )}

          {/* Anwendungsbeispiele (falls vorhanden) */}
          {examples && (
            <div>
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <FileText size={18} className="mr-2" />
                Anwendungsbeispiele
              </h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{examples}</p>
            </div>
          )}

          {/* Anwendungsbereiche (falls vorhanden) */}
          {applications && (
            <div>
              <h3 className="text-lg font-medium mb-2">Anwendungsbereiche</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{applications}</p>
            </div>
          )}

          {/* Einschränkungen (falls vorhanden) */}
          {limitations && (
            <div>
              <h3 className="text-lg font-medium mb-2">Einschränkungen</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{limitations}</p>
            </div>
          )}

          {/* Quellen (falls vorhanden) */}
          {sources.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <Link2 size={18} className="mr-2" />
                Quellen
              </h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {sources.map((source: string, index: number) => (
                  <li key={index}>
                    {source.startsWith("http") ? (
                      <a
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        {source}
                        <ExternalLink size={12} className="ml-1" />
                      </a>
                    ) : (
                      source
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Verwandte Prinzipien (falls vorhanden) */}
          {relatedPrinciples.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Verwandte Prinzipien</h3>
              <div className="flex flex-wrap gap-2">
                {relatedPrinciples.map((related: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {related}
                  </Badge>
                ))}
              </div>
            </div>
          )}
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
