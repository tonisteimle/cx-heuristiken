import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { openSans } from "./fonts"

export const metadata: Metadata = {
  title: "CX Guidelines",
  description: "A tool for managing guidelines",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={openSans.variable}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
