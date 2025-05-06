"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Upload } from "lucide-react"
import type { Guideline, Principle } from "@/types/guideline"

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
  const [formData, setFormData] = useState<Partial<Guideline>>({
    id: "",
    title: "",
    text: "",
    categories: [],
    principles: [],
    imageUrl: "",
    detailImageUrl: "",
  })

  const [newCategory, setNewCategory] = useState("")
  const [newPrinciple, setNewPrinciple] = useState<Partial<Principle>>({
    title: "",
    description: "",
    element: "ui",
  })
  const [isAddPrincipleDialogOpen, setIsAddPrincipleDialogOpen] = useState(false)

  // Initialisiere das Formular mit den vorhandenen Daten, wenn vorhanden
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
      })
    } else {
      // Generiere eine neue ID für neue Guidelines
      setFormData({
        id: `guideline-${Date.now()}`,
        title: "",
        text: "",
        categories: [],
        principles: [],
        imageUrl: "",
        detailImageUrl: "",
        createdAt: new Date().toISOString(),
      })
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddCategory = () => {
    if (newCategory && !formData.categories?.includes(newCategory)) {
      setFormData((prev) => ({
        ...prev,
        categories: [...(prev.categories || []), newCategory],
      }))
      setNewCategory("")
    }
  }

  const handleRemoveCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories?.filter((c) => c !== category) || [],
    }))
  }

  const handleSelectPrinciple = (principleId: string) => {
    if (!formData.principles?.includes(principleId)) {
      setFormData((prev) => ({
        ...prev,
        principles: [...(prev.principles || []), principleId],
      }))
    }
  }

  const handleRemovePrinciple = (principleId: string) => {
    setFormData((prev) => ({
      ...prev,
      principles: prev.principles?.filter((p) => p !== principleId) || [],
    }))
  }

  const handleAddNewPrinciple = () => {
    if (newPrinciple.title && newPrinciple.description) {
      const principle: Principle = {
        id: `principle-${Date.now()}`,
        title: newPrinciple.title,
        description: newPrinciple.description,
        element: newPrinciple.element as "ui" | "ux" | "content" | "other",
        createdAt: new Date().toISOString(),
      }

      onAddPrinciple(principle)

      // Füge das neue Prinzip auch zur aktuellen Guideline hinzu
      setFormData((prev) => ({
        ...prev,
        principles: [...(prev.principles || []), principle.id],
      }))

      // Zurücksetzen des Formulars
      setNewPrinciple({
        title: "",
        description: "",
        element: "ui",
      })

      setIsAddPrincipleDialogOpen(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Aktualisiere das Datum
    const updatedData: Guideline = {
      ...(formData as Guideline),
      updatedAt: new Date().toISOString(),
    }

    onSubmit(updatedData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Titel</Label>
          <Input id="title" name="title" value={formData.title || ""} onChange={handleChange} required />
        </div>

        <div>
          <Label htmlFor="text">Beschreibung</Label>
          <Textarea id="text" name="text" value={formData.text || ""} onChange={handleChange} rows={5} required />
        </div>

        <div>
          <Label>Kategorien</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.categories?.map((category) => (
              <Badge key={category} variant="secondary" className="flex items-center gap-1">
                {category}
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(category)}
                  className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
                >
                  <X size={12} />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <Select value={newCategory} onValueChange={setNewCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Kategorie auswählen oder eingeben" />
              </SelectTrigger>
              <SelectContent>
                {existingCategories
                  .filter((category) => !formData.categories?.includes(category))
                  .map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Oder neue Kategorie eingeben"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1"
            />
            <Button type="button" onClick={handleAddCategory} disabled={!newCategory}>
              <Plus size={16} />
            </Button>
          </div>
        </div>

        <div>
          <Label>Psychologische Effekte</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.principles?.map((principleId) => {
              const principle = existingPrinciples.find((p) => p.id === principleId)
              return principle ? (
                <Badge key={principleId} variant="secondary" className="flex items-center gap-1">
                  {principle.title}
                  <button
                    type="button"
                    onClick={() => handleRemovePrinciple(principleId)}
                    className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              ) : null
            })}
          </div>
          <div className="flex gap-2 mt-2">
            <Select onValueChange={handleSelectPrinciple}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Effekt auswählen" />
              </SelectTrigger>
              <SelectContent>
                {existingPrinciples
                  .filter((principle) => !formData.principles?.includes(principle.id))
                  .map((principle) => (
                    <SelectItem key={principle.id} value={principle.id}>
                      {principle.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Dialog open={isAddPrincipleDialogOpen} onOpenChange={setIsAddPrincipleDialogOpen}>
              <DialogTrigger asChild>
                <Button type="button">
                  <Plus size={16} className="mr-1" />
                  Neu
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Neuen psychologischen Effekt hinzufügen</DialogTitle>
                  <DialogDescription>
                    Fügen Sie einen neuen psychologischen Effekt hinzu, der in Guidelines verwendet werden kann.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="principle-title" className="text-right">
                      Titel
                    </Label>
                    <Input
                      id="principle-title"
                      value={newPrinciple.title || ""}
                      onChange={(e) => setNewPrinciple({ ...newPrinciple, title: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="principle-element" className="text-right">
                      Element
                    </Label>
                    <Select
                      value={newPrinciple.element || "ui"}
                      onValueChange={(value) =>
                        setNewPrinciple({ ...newPrinciple, element: value as "ui" | "ux" | "content" | "other" })
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Element auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ui">UI</SelectItem>
                        <SelectItem value="ux">UX</SelectItem>
                        <SelectItem value="content">Content</SelectItem>
                        <SelectItem value="other">Sonstiges</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="principle-description" className="text-right pt-2">
                      Beschreibung
                    </Label>
                    <Textarea
                      id="principle-description"
                      value={newPrinciple.description || ""}
                      onChange={(e) => setNewPrinciple({ ...newPrinciple, description: e.target.value })}
                      className="col-span-3"
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" onClick={handleAddNewPrinciple}>
                    Hinzufügen
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div>
          <Label htmlFor="imageUrl">Bild-URL</Label>
          <div className="flex gap-2">
            <Input
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl || ""}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
            <Button type="button" variant="outline" className="flex items-center gap-1">
              <Upload size={16} />
              Upload
            </Button>
          </div>
          {formData.imageUrl && (
            <div className="mt-2 h-32 w-full overflow-hidden rounded-md border">
              <img
                src={formData.imageUrl || "/placeholder.svg"}
                alt="Vorschau"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?key=sdnoa"
                }}
              />
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="detailImageUrl">Detail-Bild-URL</Label>
          <div className="flex gap-2">
            <Input
              id="detailImageUrl"
              name="detailImageUrl"
              value={formData.detailImageUrl || ""}
              onChange={handleChange}
              placeholder="https://example.com/detail-image.jpg"
            />
            <Button type="button" variant="outline" className="flex items-center gap-1">
              <Upload size={16} />
              Upload
            </Button>
          </div>
          {formData.detailImageUrl && (
            <div className="mt-2 h-32 w-full overflow-hidden rounded-md border">
              <img
                src={formData.detailImageUrl || "/placeholder.svg"}
                alt="Detail-Vorschau"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?key=sw9qq"
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit">{initialData ? "Aktualisieren" : "Erstellen"}</Button>
      </div>
    </form>
  )
}
