"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { FIXED_CATEGORIES } from "@/lib/constants"
import { SectionTitle } from "@/components/ui/typography"

interface FixedCategorySelectorProps {
  selectedCategories: string[]
  onChange: (selectedCategories: string[]) => void
}

export function FixedCategorySelector({ selectedCategories, onChange }: FixedCategorySelectorProps) {
  const toggleCategory = (category: string, checked: boolean) => {
    if (checked) {
      // Kategorie hinzufügen, wenn sie noch nicht ausgewählt ist
      if (!selectedCategories.includes(category)) {
        onChange([...selectedCategories, category])
      }
    } else {
      // Kategorie entfernen, wenn sie ausgewählt ist
      onChange(selectedCategories.filter((c) => c !== category))
    }
  }

  return (
    <div className="space-y-4">
      <SectionTitle>Kategorien</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {FIXED_CATEGORIES.map((category) => (
          <div key={category} className="flex items-center space-x-2">
            <Checkbox
              id={`category-${category}`}
              checked={selectedCategories.includes(category)}
              onCheckedChange={(checked) => toggleCategory(category, checked === true)}
            />
            <Label htmlFor={`category-${category}`} className="text-sm font-normal cursor-pointer">
              {category}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}
