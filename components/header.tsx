"use client"

import type React from "react"
import { UnifiedImportButton } from "@/components/unified-import-dialog"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useAppContext } from "@/contexts/app-context"
import { LoginButton } from "@/components/login-dialog"

const Header: React.FC = () => {
  const { exportData } = useAppContext()

  const handleExport = async () => {
    await exportData()
  }

  return (
    <header className="bg-gray-100 py-4 shadow-md">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">CX Guidelines</h1>
        <div className="flex gap-2">
          <UnifiedImportButton onSuccess={() => {}} />
          <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-1">
            <Download size={14} />
            Export
          </Button>
          <LoginButton />
        </div>
      </div>
    </header>
  )
}

export default Header
