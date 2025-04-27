"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"

export default function SvgDebug() {
  const [guidelineId, setGuidelineId] = useState("")
  const [svgContent, setSvgContent] = useState("")
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchGuideline = async () => {
    if (!guidelineId.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie eine Guideline-ID ein",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Lade alle Guidelines
      const response = await fetch("/api/supabase/load-data", {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      // Finde die Guideline mit der angegebenen ID
      const guideline = data.data.guidelines.find((g: any) => g.id === guidelineId)

      if (!guideline) {
        toast({
          title: "Nicht gefunden",
          description: `Keine Guideline mit ID ${guidelineId} gefunden`,
          variant: "destructive",
        })
        setDebugInfo(null)
        setSvgContent("")
        return
      }

      // Setze SVG-Inhalt und Debug-Informationen
      setSvgContent(guideline.svgContent || "")
      setDebugInfo({
        title: guideline.title,
        hasSvgContent: !!guideline.svgContent,
        svgContentLength: guideline.svgContent ? guideline.svgContent.length : 0,
        svgContentStart: guideline.svgContent ? guideline.svgContent.substring(0, 100) : "",
        hasDetailSvgContent: !!guideline.detailSvgContent,
        hasImageUrl: !!guideline.imageUrl,
        imageUrl: guideline.imageUrl || "",
      })

      toast({
        title: "Guideline geladen",
        description: `${guideline.title} erfolgreich geladen`,
      })
    } catch (error) {
      console.error("Error fetching guideline:", error)
      toast({
        title: "Fehler",
        description: `Fehler beim Laden der Guideline: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateSvgContent = async () => {
    if (!guidelineId.trim() || !svgContent.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie eine Guideline-ID und SVG-Inhalt ein",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Lade alle Guidelines
      const response = await fetch("/api/supabase/load-data", {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      // Finde die Guideline mit der angegebenen ID
      const guideline = data.data.guidelines.find((g: any) => g.id === guidelineId)

      if (!guideline) {
        toast({
          title: "Nicht gefunden",
          description: `Keine Guideline mit ID ${guidelineId} gefunden`,
          variant: "destructive",
        })
        return
      }

      // Aktualisiere die Guideline mit dem neuen SVG-Inhalt
      const updatedGuideline = {
        ...guideline,
        svgContent: svgContent,
        updatedAt: new Date().toISOString(),
      }

      // Speichere die aktualisierte Guideline
      const saveResponse = await fetch("/api/supabase/save-guideline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedGuideline),
      })

      if (!saveResponse.ok) {
        throw new Error(`API error: ${saveResponse.status}`)
      }

      const saveResult = await saveResponse.json()

      toast({
        title: "SVG aktualisiert",
        description: `SVG-Inhalt für ${guideline.title} erfolgreich aktualisiert`,
      })

      // Aktualisiere Debug-Informationen
      setDebugInfo({
        ...debugInfo,
        hasSvgContent: true,
        svgContentLength: svgContent.length,
        svgContentStart: svgContent.substring(0, 100),
      })
    } catch (error) {
      console.error("Error updating SVG content:", error)
      toast({
        title: "Fehler",
        description: `Fehler beim Aktualisieren des SVG-Inhalts: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>SVG Debug Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="guideline-id">Guideline ID</Label>
            <div className="flex gap-2">
              <Input
                id="guideline-id"
                value={guidelineId}
                onChange={(e) => setGuidelineId(e.target.value)}
                placeholder="Geben Sie die Guideline-ID ein"
              />
              <Button onClick={fetchGuideline} disabled={loading}>
                {loading ? "Lädt..." : "Laden"}
              </Button>
            </div>
          </div>

          {debugInfo && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Debug-Informationen</h3>
                <div className="bg-muted p-4 rounded-md">
                  <p>
                    <strong>Titel:</strong> {debugInfo.title}
                  </p>
                  <p>
                    <strong>SVG vorhanden:</strong> {debugInfo.hasSvgContent ? "Ja" : "Nein"}
                  </p>
                  {debugInfo.hasSvgContent && (
                    <>
                      <p>
                        <strong>SVG Länge:</strong> {debugInfo.svgContentLength} Zeichen
                      </p>
                      <p>
                        <strong>SVG Anfang:</strong> <code className="text-xs">{debugInfo.svgContentStart}...</code>
                      </p>
                    </>
                  )}
                  <p>
                    <strong>Detail-SVG vorhanden:</strong> {debugInfo.hasDetailSvgContent ? "Ja" : "Nein"}
                  </p>
                  <p>
                    <strong>Bild-URL vorhanden:</strong> {debugInfo.hasImageUrl ? "Ja" : "Nein"}
                  </p>
                  {debugInfo.hasImageUrl && (
                    <p>
                      <strong>Bild-URL:</strong> <code className="text-xs">{debugInfo.imageUrl}</code>
                    </p>
                  )}
                </div>
              </div>

              <Separator />
              <div className="space-y-2">
                <Label htmlFor="svg-content">SVG-Inhalt</Label>
                <Textarea
                  id="svg-content"
                  value={svgContent}
                  onChange={(e) => setSvgContent(e.target.value)}
                  placeholder="SVG-Inhalt"
                  className="min-h-[200px] font-mono text-xs"
                />
                <Button onClick={updateSvgContent} disabled={loading}>
                  {loading ? "Speichert..." : "SVG-Inhalt aktualisieren"}
                </Button>
              </div>

              {svgContent && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">SVG-Vorschau</h3>
                    <div className="bg-white p-4 rounded-md border flex justify-center">
                      <div className="w-64 h-64" dangerouslySetInnerHTML={{ __html: svgContent }} />
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
