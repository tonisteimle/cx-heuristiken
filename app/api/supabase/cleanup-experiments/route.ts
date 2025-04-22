import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"

export async function GET() {
  try {
    // Create a Supabase client with service role key
    const supabase = createServerSupabaseClient()

    // Load the current data
    const { data, error } = await supabase.from("guidelines_data").select("data").eq("id", "main").single()

    if (error) {
      console.error("Error loading data from Supabase:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    if (!data || !data.data) {
      return NextResponse.json({ success: false, error: "No data found" }, { status: 404 })
    }

    // Create a copy of the data without the experiments field
    const cleanedData = { ...data.data }

    // Remove the experiments field if it exists
    if ("experiments" in cleanedData) {
      delete cleanedData.experiments
    }

    // Save the cleaned data back to the database
    const { error: updateError } = await supabase
      .from("guidelines_data")
      .update({
        data: cleanedData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", "main")

    if (updateError) {
      console.error("Error updating data in Supabase:", updateError)
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Experiments data removed successfully",
    })
  } catch (error) {
    console.error("Error in cleanup-experiments API route:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
