"use client"

import { Button } from "@/components/ui/button"
import { UnifiedImportDialog } from "@/components/unified-import-dialog"
import { useState } from "react"

export function UnifiedImportDialogTrigger() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button id="unified-import-dialog-trigger" className="hidden" onClick={() => setOpen(true)}>
        Hidden Trigger
      </Button>
      <UnifiedImportDialog open={open} onOpenChange={setOpen} onSuccess={() => {}} />
    </>
  )
}
