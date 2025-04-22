import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"
import { initialData } from "@/data/initial-data"

export async function GET() {
  try {
    // Create a Supabase client with service role key
    const supabase = createServerSupabaseClient()

    try {
      // Load the data from the guidelines_data table
      const { data, error } = await supabase.from("guidelines_data").select("data").eq("id", "main").maybeSingle()

      if (error) {
        console.error("Error loading data from Supabase:", error)
        return NextResponse.json({ success: false, error: error.message, data: initialData }, { status: 200 })
      }

      // If no data found, return initial data
      if (!data) {
        console.log("No data found in guidelines_data table, returning initial data")
        return NextResponse.json({ success: true, data: initialData })
      }

      // Return the data
      return NextResponse.json({ success: true, data: data.data || initialData })
    } catch (supabaseError) {
      console.error("Supabase query error:", supabaseError)
      return NextResponse.json(
        {
          success: false,
          error: supabaseError instanceof Error ? supabaseError.message : "Supabase query failed",
          data: initialData,
        },
        { status: 200 },
      )
    }
  } catch (error) {
    console.error("Error in load-data API route:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        data: initialData,
      },
      { status: 200 },
    )
  }
}
