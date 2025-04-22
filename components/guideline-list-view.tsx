"use client"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Info, BookOpen } from "lucide-react"
import type { Guideline, Principle } from "@/types/guideline"
import { FIXED_CATEGORIES } from "@/lib/constants"
import { SectionTitle, BodyText, LabelText, MutedText, BoldText } from "@/components/ui/typography"

interface GuidelineListViewProps {
  guidelines: Guideline[]
  principles: Principle[]
  onEdit: (guideline: Guideline) => void
  onDelete: (id: string) => void
  isAuthenticated: boolean
  onViewDetails: (guideline: Guideline) => void
}

export default function GuidelineListView({
  guidelines,
  principles,
  onEdit,
  onDelete,
  isAuthenticated,
  onViewDetails,
}: GuidelineListViewProps) {
  return (
    <div className="space-y-6">
      {guidelines.map((guideline) => (
        <Card key={guideline.id} className="overflow-hidden">
          <CardHeader className="pb-2 bg-muted/30">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <SectionTitle>{guideline.title}</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {guideline.categories
                  .filter((category) => FIXED_CATEGORIES.includes(category))
                  .map((category) => (
                    <Badge key={category} variant="secondary" className="text-xs px-3 py-1">
                      {category}
                    </Badge>
                  ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div>
                <LabelText className="mb-2">Guideline</LabelText>
                <BodyText>{guideline.text}</BodyText>
              </div>

              {guideline.justification && (
                <div>
                  <LabelText className="mb-2">Begründung</LabelText>
                  <BodyText className="whitespace-pre-wrap">{guideline.justification}</BodyText>
                </div>
              )}

              {guideline.principles && guideline.principles.length > 0 && (
                <div>
                  <LabelText className="mb-2 flex items-center gap-1">
                    <BookOpen size={14} />
                    Psychologische Prinzipien
                  </LabelText>
                  <div className="space-y-2">
                    {guideline.principles.map((principleId) => {
                      const principle = principles.find((p) => p.id === principleId)
                      return principle ? (
                        <div key={principleId} className="bg-muted/30 p-3 rounded-md">
                          <BoldText>{principle.name}</BoldText>
                          <MutedText className="mt-1">{principle.description}</MutedText>
                        </div>
                      ) : null
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          {isAuthenticated && (
            <CardFooter className="pt-2 flex justify-between border-t">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs flex items-center gap-1"
                onClick={() => onViewDetails(guideline)}
              >
                <Info size={14} />
                Details
              </Button>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => onEdit(guideline)} className="h-8 w-8 p-0">
                  <Pencil size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(guideline.id)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      ))}

      {guidelines.length === 0 && (
        <div className="text-center py-12 border rounded-lg">
          <SectionTitle>Keine Guidelines gefunden</SectionTitle>
          <MutedText className="mt-2">
            Versuchen Sie, Ihre Suchkriterien anzupassen oder die Filter zurückzusetzen.
          </MutedText>
        </div>
      )}
    </div>
  )
}
