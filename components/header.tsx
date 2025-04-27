"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

const Header: React.FC = () => {
  return (
    <header className="pt-8">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">CX Guidelines</h1>
        <div className="flex gap-2">
          <a href="/admin">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Settings size={14} />
              Admin
            </Button>
          </a>
        </div>
      </div>
    </header>
  )
}

export default Header
