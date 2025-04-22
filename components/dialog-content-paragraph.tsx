import type React from "react"
import { DialogParagraph } from "@/components/ui/typography"

interface DialogContentParagraphProps {
  children: React.ReactNode
  className?: string
}

export function DialogContentParagraph({ children, className }: DialogContentParagraphProps) {
  return <DialogParagraph className={className}>{children}</DialogParagraph>
}
