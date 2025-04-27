"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import type { Guideline, Principle } from "@/types/guideline"
import { Separator } from "@/components/ui/separator"
import { SvgUploader } from "@/components/svg-uploader"
import { ImageUpload } from "@/components/image-upload"
import { FixedCategorySelector } from "@/components/fixed-category-selector"
import { ItemSelector } from "@/components/item-selector"
import { FIXED_CATEGORIES } from "@/lib/constants"
import { SectionTitle, MutedText, LabelText } from "@/components/ui/typography"
import { useAppContext } from "@/contexts/app-context"

interface GuidelineFormProps {
  existingCategories: string[]
  existingPrinciples: Principle[]
  onSubmit: (guideline: Guideline) => void
  onAddPrinciple: (principle: Principle) => void
  initialData?: Guideline | null
}

export default function GuidelineForm({
  existingCategories,
  existingPrinciples,
  onSubmit,
  onAddPrinciple,
  initialData,
}: GuidelineFormProps) {
  const [title, setTitle] = useState("")
  const [text, setText] = useState("")
  const [justification, setJustification] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedPrinciples, setSelectedPrinciples] = useState<string[]>([])
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined)
  const [imageName, setImageName] = useState<string | undefined>(undefined)
  const [detailImageUrl, setDetailImageUrl] = useState<string | undefined>(undefined)
  const [detailImageName, setDetailImageName] = useState<string | undefined>(undefined)
  const [svgContent, setSvgContent] = useState<string | undefined>(undefined)
  const [detailSvgContent, setDetailSvgContent] = useState<string | undefined>(undefined)
  const { toast } = useToast()
  const { state } = useAppContext()

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title)
      setText(initialData.text)
      setJustification(initialData.justification || "")

      // Filtere die Kategorien, um nur die fest definierten zu verwenden
      const validCategories = initialData.categories.filter((cat) => FIXED_CATEGORIES.includes(cat))
      setSelectedCategories(validCategories)

      setSelectedPrinciples(initialData.principles || [])
      setImageUrl(initialData.imageUrl)
      setImageName(initialData.imageName)
      setDetailImageUrl(initialData.detailImageUrl)
      setDetailImageName(initialData.detailImageName)
      setSvgContent(initialData.svgContent)
      setDetailSvgContent(initialData.detailSvgContent)
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validiere Form-Daten
    const errors = []

    if (!title.trim()) {
      errors.push("Title is required")
    }

    if (!text.trim()) {
      errors.push("Guideline text is required")
    }

    if (!justification.trim()) {
      errors.push("Justification is required")
    }

    if (selectedCategories.length === 0) {
      errors.push("Mindestens eine Kategorie ist erforderlich")
    }

    if (errors.length > 0) {
      toast({
        title: "Fehlende Angaben",
        description: errors.join(", "),
        variant: "destructive",
      })
      return
    }

    try {
      console.log("Submitting guideline form...")

      const validCategories = selectedCategories

      const guideline: Guideline = {
        id: initialData?.id || "",
        title: title.trim(),
        text: text.trim(),
        justification: justification.trim(),
        categories: validCategories,
        principles: selectedPrinciples,
        imageUrl,
        imageName,
        detailImageUrl,
        detailImageName,
        svgContent,
        detailSvgContent,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      console.log("Guideline data:", guideline)

      onSubmit(guideline)

      // Reset form if not editing
      if (!initialData) {
        setTitle("")
        setText("")
        setJustification("")
        setSelectedCategories([])
        setSelectedPrinciples([])
        setImageUrl(undefined)
        setImageName(undefined)
        setDetailImageUrl(undefined)
        setDetailImageName(undefined)
        setSvgContent(undefined)
        setDetailSvgContent(undefined)
      }
    } catch (error) {
      console.error("Error in form submission:", error)
      toast({
        title: "Error",
        description: "There was a problem submitting the form. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handler für das Hinzufügen eines neuen Prinzips
  const handleAddNewPrinciple = (principle: Partial<Principle>) => {
    if (!principle.name || !principle.description) return

    const id = principle.name.toLowerCase().replace(/\s+/g, "-")
    const newPrinciple: Principle = {
      id,
      name: principle.name,
      description: principle.description,
    }

    onAddPrinciple(newPrinciple)

    // Ändern Sie hier, um das neue Prinzip automatisch auszuwählen
    setSelectedPrinciples([...selectedPrinciples, id])

    toast({
      title: "Prinzip hinzugefügt",
      description: `Das Prinzip "${newPrinciple.name}" wurde erfolgreich hinzugefügt und ausgewählt.`,
    })
  }

  // Handler für hochgeladene Bilder (Übersichtsbild)
  const handleImageUploaded = (url: string, name: string) => {
    setImageUrl(url)
    setImageName(name)
  }

  // Handler für entfernte Bilder (Übersichtsbild)
  const handleImageRemoved = () => {
    setImageUrl(undefined)
    setImageName(undefined)
  }

  // Handler für hochgeladene Bilder (Detailbild)
  const handleDetailImageUploaded = (url: string, name: string) => {
    setDetailImageUrl(url)
    setDetailImageName(name)
  }

  // Handler für entfernte Bilder (Detailbild)
  const handleDetailImageRemoved = () => {
    setDetailImageUrl(undefined)
    setDetailImageName(undefined)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Titel</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Geben Sie einen Titel für diese Guideline ein"
          required
        />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="text">Guideline</Label>
          <Textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Geben Sie den Guideline-Text ein"
            className="min-h-[150px]"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="justification">Begründung</Label>
          <Textarea
            id="justification"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Erklären Sie die Begründung für diese Guideline"
            className="min-h-[150px]"
            required
          />
        </div>
      </div>

      <Separator className="my-6" />

      {/* Verwende die aktualisierte FixedCategorySelector mit Mehrfachauswahl */}
      {/* <FixedCategorySelector selectedCategories={selectedCategories} onChange={setSelectedCategories} /> */}
      <FixedCategorySelector selectedCategories={selectedCategories} onChange={setSelectedCategories} />

      <div className="space-y-4">
        <ItemSelector
          title="Psychologische Prinzipien"
          items={existingPrinciples}
          selectedItemIds={selectedPrinciples}
          onChange={setSelectedPrinciples}
          onAddNewItem={handleAddNewPrinciple}
          newItemTemplate={{ name: "", description: "" }}
          showDescription={false}
          searchPlaceholder="Prinzipien suchen und auswählen..."
          addButtonText="Neues Prinzip"
          dialogTitle="Neues psychologisches Prinzip hinzufügen"
          dialogDescription="Erstellen Sie ein neues Prinzip, das Sie dieser Guideline zuordnen können."
          itemNameLabel="Name"
          itemDescriptionLabel="Beschreibung"
          noItemsFoundText="Keine Prinzipien gefunden"
          createNewItemText="Neues Prinzip erstellen"
        />
      </div>

      <Separator className="my-6" />

      <div className="space-y-2">
        <SectionTitle>Visualisierungen</SectionTitle>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <LabelText>Übersichts-SVG</LabelText>
            <SvgUploader
              initialSvgContent={svgContent}
              onSvgChange={setSvgContent}
              label="SVG für die Übersicht (optional)"
            />
            <MutedText>Dieses SVG wird in der Übersicht angezeigt.</MutedText>
          </div>

          <div className="space-y-4">
            <LabelText>Detailbild (PNG)</LabelText>
            <ImageUpload
              initialImageUrl={detailImageUrl}
              initialImageName={detailImageName}
              onImageUploaded={handleDetailImageUploaded}
              onImageRemoved={handleDetailImageRemoved}
              label="Detailbild (optional)"
            />
            <MutedText>Dieses Bild wird nur in der Detailansicht angezeigt.</MutedText>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full">
        {initialData ? "Guideline aktualisieren" : "Guideline speichern"}
      </Button>
    </form>
  )
}
