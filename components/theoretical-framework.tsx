"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Brain, HeartPulse, HandMetal, Globe, ArrowRight } from "lucide-react"
import type { PrincipleElement } from "@/types/guideline"

interface TheoreticalFrameworkProps {
  onSelectElement: (element: PrincipleElement) => void
  principleCountByElement: Record<string, number>
}

export function TheoreticalFramework({ onSelectElement, principleCountByElement }: TheoreticalFrameworkProps) {
  const elements = [
    {
      id: "input",
      title: "Eingabe",
      description: "Wahrnehmung: Sensible Reize werden aufgenommen und nach Gestaltprinzipien strukturiert.",
      icon: <Eye className="h-6 w-6" />,
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
      textColor: "text-blue-700",
      iconBg: "bg-blue-100",
    },
    {
      id: "processing",
      title: "Verarbeitung",
      description:
        "Vorverarbeitung und kognitive Verarbeitung: Schnelle, heuristische Prozesse (System 1) liefern erste Eindrücke, während langsame, analytische Prozesse (System 2) eine tiefere Verarbeitung ermöglichen.",
      icon: <Brain className="h-6 w-6" />,
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
      textColor: "text-purple-700",
      iconBg: "bg-purple-100",
    },
    {
      id: "decision",
      title: "Entscheidung",
      description:
        "Entscheidungsfindung: Interne emotionale, motivationale und soziale Faktoren modulieren die Entscheidung.",
      icon: <HeartPulse className="h-6 w-6" />,
      color: "bg-red-50 border-red-200 hover:bg-red-100",
      textColor: "text-red-700",
      iconBg: "bg-red-100",
    },
    {
      id: "output",
      title: "Ausgabe",
      description:
        "Verhalten und Rückkopplung: Die getroffene Entscheidung und deren Konsequenzen führen zu Feedback, das zukünftiges Verhalten beeinflusst.",
      icon: <HandMetal className="h-6 w-6" />,
      color: "bg-green-50 border-green-200 hover:bg-green-100",
      textColor: "text-green-700",
      iconBg: "bg-green-100",
    },
    {
      id: "environment",
      title: "Umgebung",
      description:
        "Kontext und Nudging: Die Umgebung wird so gestaltet, dass sie alle diese Prozesse unterstützt und optimiert.",
      icon: <Globe className="h-6 w-6" />,
      color: "bg-amber-50 border-amber-200 hover:bg-amber-100",
      textColor: "text-amber-700",
      iconBg: "bg-amber-100",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Theoretisches Gerüst</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Dieses Modell beschreibt den Prozess der menschlichen Informationsverarbeitung und Entscheidungsfindung. Jedes
          psychologische Prinzip kann einem dieser Elemente zugeordnet werden.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {elements.map((element) => (
          <Card
            key={element.id}
            className={`cursor-pointer transition-all ${element.color} border-2`}
            onClick={() => onSelectElement(element.id as PrincipleElement)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${element.iconBg}`}>{element.icon}</div>
                <div>
                  <CardTitle className={element.textColor}>{element.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="font-normal">
                      {principleCountByElement[element.id] || 0} Prinzipien
                    </Badge>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      Anzeigen <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-700">{element.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
