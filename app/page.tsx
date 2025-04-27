"use client"

import { useState } from "react"
import { AppProvider, useAppContext } from "@/contexts/app-context"
import { AuthProvider } from "@/contexts/auth-context"
import Header from "@/components/header"
import { CategoryTiles } from "@/components/category-tiles"
import { GuidelineList } from "@/components/guideline-list"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

// Innere Komponente, die den useAppContext Hook verwendet
function GuidelinesContent() {
  const { state } = useAppContext()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  return (
    <div className="container mx-auto px-4 py-8">
      {selectedCategory ? (
        <>
          <Button variant="ghost" onClick={() => setSelectedCategory(null)} className="mb-4 flex items-center gap-2">
            <ArrowLeft size={16} />
            Zurück zu allen Kategorien
          </Button>
          <GuidelineList categoryFilter={[selectedCategory]} />
        </>
      ) : (
        <CategoryTiles categories={state.categories} onCategorySelect={setSelectedCategory} />
      )}
    </div>
  )
}

// Hauptkomponente, die die Provider bereitstellt
export default function Home() {
  return (
    <AuthProvider>
      <AppProvider>
        <main className="min-h-screen bg-background">
          <Header />
          <GuidelinesContent />
        </main>
      </AppProvider>
    </AuthProvider>
  )
}
