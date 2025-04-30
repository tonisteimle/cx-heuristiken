import type React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Brain, HeartPulse, HandMetal, Globe, FlaskRoundIcon as Flask } from "lucide-react"
import type { Principle } from "@/types/guideline"
import { SectionTitle, BodyText, LabelText, SmallText, MutedText } from "@/components/ui/typography"

interface PrincipleListViewProps {
  principles: Principle[]
  isAuthenticated: boolean
}

export default function PrincipleListView({ principles, isAuthenticated }: PrincipleListViewProps) {
  // Element-Icons für die Anzeige
  const elementIcons: Record<string, React.ReactNode> = {
    input: <Eye className="h-4 w-4" />,
    processing: <Brain className="h-4 w-4" />,
    decision: <HeartPulse className="h-4 w-4" />,
    output: <HandMetal className="h-4 w-4" />,
    environment: <Globe className="h-4 w-4" />,
  }

  // Element-Namen für die Anzeige
  const elementNames: Record<string, string> = {
    input: "Eingabe",
    processing: "Verarbeitung",
    decision: "Entscheidung",
    output: "Ausgabe",
    environment: "Umgebung",
  }

  return (
    <div className="space-y-8">
      {principles.map((principle) => (
        <Card key={principle.id} className="overflow-hidden">
          <CardHeader className="pb-2 bg-muted/30">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <SectionTitle>{principle.name}</SectionTitle>
              {principle.elements && principle.elements.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {principle.elements.map((element) => (
                    <Badge key={element} variant="outline" className="flex items-center gap-1 px-2 py-1">
                      {elementIcons[element]}
                      <SmallText as="span">{elementNames[element]}</SmallText>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div>
                <LabelText className="mb-2">Beschreibung</LabelText>
                <BodyText className="whitespace-pre-wrap">{principle.description}</BodyText>
              </div>

              {principle.evidenz && (
                <div>
                  <LabelText className="mb-2" icon={<Flask size={14} />}>
                    Evidenz
                  </LabelText>
                  <BodyText className="whitespace-pre-wrap">{principle.evidenz}</BodyText>
                </div>
              )}

              {principle.implikation && (
                <div>
                  <LabelText className="mb-2">Implikation</LabelText>
                  <BodyText className="whitespace-pre-wrap">{principle.implikation}</BodyText>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {principles.length === 0 && (
        <div className="text-center py-12 border rounded-lg">
          <SectionTitle>Keine Prinzipien gefunden</SectionTitle>
          <MutedText className="mt-2">Versuchen Sie einen anderen Suchbegriff oder Filter</MutedText>
        </div>
      )}
    </div>
  )
}
