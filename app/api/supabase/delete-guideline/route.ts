import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client for server-side operations
const supabase = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "")

export async function POST(request: Request) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, error: "No guideline ID provided" }, { status: 400 })
    }

    // Delete guideline
    const { error } = await supabase.from("guidelines").delete().eq("id", id)

    if (error) {
      throw new Error(`Failed to delete guideline: ${error.message}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting guideline:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error deleting guideline",
      },
      { status: 500 },
    )
  }
}
