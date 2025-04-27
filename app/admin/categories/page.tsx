"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { CategoryAdmin } from "@/components/category-admin"
import { AppProvider } from "@/contexts/app-context"
import { AuthProvider } from "@/contexts/auth-context"

export default function CategoriesAdminPage() {
  const router = useRouter()

  return (
    <AuthProvider>
      <AppProvider>
        <div className="container mx-auto py-8 px-4">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => router.push("/")} className="flex items-center gap-2 mb-4">
              <ArrowLeft size={16} />
              Zurück zur Hauptseite
            </Button>

            <CategoryAdmin />
          </div>
        </div>
      </AppProvider>
    </AuthProvider>
  )
}
