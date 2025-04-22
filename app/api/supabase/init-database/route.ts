import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"
import { initialData } from "@/data/initial-data"

export async function GET() {
  try {
    // Create a Supabase client with service role key
    const supabase = createServerSupabaseClient()

    // Check if we already have data using count
    const { count, error: countError } = await supabase
      .from("guidelines_data")
      .select("*", { count: "exact", head: true })
      .eq("id", "main")

    if (countError) {
      console.error("Error checking for existing data:", countError)
      return NextResponse.json({ success: false, error: countError.message }, { status: 500 })
    }

    // If data already exists, don't overwrite it
    if (count && count > 0) {
      return NextResponse.json({
        success: true,
        message: "Database already initialized, skipping",
      })
    }

    // Insert initial data using service role
    const { error: insertError } = await supabase.from("guidelines_data").insert({ id: "main", data: initialData })

    if (insertError) {
      // Handle duplicate key error specifically
      if (insertError.code === "23505") {
        return NextResponse.json({
          success: true,
          message: "Database already initialized (detected by duplicate key)",
        })
      }

      console.error("Error inserting initial data:", insertError)
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Database initialized with initial data",
    })
  } catch (error) {
    console.error("Error initializing database:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
