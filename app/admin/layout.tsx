import type React from "react"
import { AppProvider } from "@/contexts/app-context"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AppProvider>{children}</AppProvider>
}
