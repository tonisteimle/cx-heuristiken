"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import Link from "next/link"

const Header: React.FC = () => {
  return (
    <header className="pt-8">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">CX Guidelines</h1>
        <div className="flex gap-2">
          <Link href="/admin" passHref>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Settings size={14} />
              Admin
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header
