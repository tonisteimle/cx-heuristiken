import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"

// Erstellt einen API-Handler mit Fehlerbehandlung und Supabase-Client
export function createApiHandler(handler: Function) {
  return async (request: Request) => {
    try {
      // Erstelle den Supabase-Client
      const supabase = createServerSupabaseClient()

      // Parse den Request-Body
      const body = await request.json()

      // Führe den Handler aus
      const result = await handler(body, supabase)

      // Erfolgreiche Antwort
      return NextResponse.json({ success: true, ...result })
    } catch (error: any) {
      console.error("API error:", error)

      // Fehlerantwort
      return NextResponse.json(
        {
          success: false,
          error: error.message || "An unknown error occurred",
        },
        { status: 500 },
      )
    }
  }
}
