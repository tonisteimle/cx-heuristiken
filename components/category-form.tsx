"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { SvgUploader } from "@/components/svg-uploader"
import { Title } from "@/components/ui/typography"
import type { Category } from "@/types/category"

interface CategoryFormProps {
  initialCategory?: Partial<Category>
  onSubmit: (category: Partial<Category>) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function CategoryForm({ initialCategory, onSubmit, onCancel, isSubmitting = false }: CategoryFormProps) {
  const [category, setCategory] = useState<Partial<Category>>(
    initialCategory || {
      name: "",
      description: "",
      svgContent: "",
    },
  )

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory)
    }
  }, [initialCategory])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCategory((prev) => ({ ...prev, [name]: value }))

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSvgChange = (svgContent: string) => {
    setCategory((prev) => ({ ...prev, svgContent }))

    // Clear error when SVG is updated
    if (errors.svgContent) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.svgContent
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!category.name?.trim()) {
      newErrors.name = "Kategoriename ist erforderlich"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    await onSubmit(category)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <Title>{initialCategory?.id ? "Kategorie bearbeiten" : "Neue Kategorie erstellen"}</Title>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Kategoriename</Label>
            <Input
              id="name"
              name="name"
              value={category.name || ""}
              onChange={handleChange}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung (optional)</Label>
            <Textarea
              id="description"
              name="description"
              value={category.description || ""}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <SvgUploader
            initialSvgContent={category.svgContent || ""}
            onSvgChange={handleSvgChange}
            label="Kategorie-Icon (SVG)"
          />
          {errors.svgContent && <p className="text-sm text-red-500">{errors.svgContent}</p>}
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Abbrechen
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Wird gespeichert..." : initialCategory?.id ? "Aktualisieren" : "Erstellen"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
