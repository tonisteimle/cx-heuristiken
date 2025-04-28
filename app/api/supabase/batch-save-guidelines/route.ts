import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"

export async function POST(request: Request) {
  try {
    console.log("batch-save-guidelines: Received request")

    // Parse request body
    let requestData
    try {
      requestData = await request.json()
      console.log(`batch-save-guidelines: Parsed request data with ${requestData.guidelines?.length || 0} guidelines`)
    } catch (error) {
      console.error("batch-save-guidelines: Error parsing request JSON:", error)
      return NextResponse.json({ success: false, error: "Invalid JSON in request body" }, { status: 400 })
    }

    const { guidelines } = requestData

    if (!Array.isArray(guidelines) || guidelines.length === 0) {
      console.error("batch-save-guidelines: No guidelines provided or invalid format")
      return NextResponse.json({ success: false, error: "No guidelines provided or invalid format" }, { status: 400 })
    }

    // Debug: Überprüfe SVG-Inhalte in den Guidelines
    let svgCount = 0
    for (const guideline of guidelines) {
      if (guideline.svgContent) {
        svgCount++
      }
    }
    console.log(`batch-save-guidelines: ${svgCount} von ${guidelines.length} Guidelines haben SVG-Inhalte`)

    // Get Supabase client
    const supabase = createServerSupabaseClient()

    // Load current data to get the guidelines array
    const { data: currentData, error: loadError } = await supabase
      .from("guidelines_data")
      .select("data")
      .eq("id", "main")
      .single()

    if (loadError) {
      console.error("batch-save-guidelines: Error loading current data:", loadError)
      return NextResponse.json({ success: false, error: loadError.message }, { status: 500 })
    }

    if (!currentData || !currentData.data) {
      console.error("batch-save-guidelines: No current data found")
      return NextResponse.json({ success: false, error: "No current data found" }, { status: 500 })
    }

    const currentGuidelines = currentData.data.guidelines || []

    // Create a map of existing guidelines for faster lookup
    const guidelinesMap = new Map()
    for (const guideline of currentGuidelines) {
      if (guideline && guideline.id) {
        guidelinesMap.set(guideline.id, guideline)
      }
    }

    // Update or add new guidelines
    for (const guideline of guidelines) {
      if (guidelinesMap.has(guideline.id)) {
        // Update existing guideline
        guidelinesMap.set(guideline.id, {
          ...guideline,
          updatedAt: new Date().toISOString(),
        })
      } else {
        // Add new guideline
        guidelinesMap.set(guideline.id, {
          ...guideline,
          createdAt: guideline.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }
    }

    // Convert map back to array
    const updatedGuidelines = Array.from(guidelinesMap.values())

    // Update the data in Supabase
    const { error: updateError } = await supabase
      .from("guidelines_data")
      .update({
        data: {
          ...currentData.data,
          guidelines: updatedGuidelines,
          lastUpdated: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", "main")

    if (updateError) {
      console.error("batch-save-guidelines: Error updating data:", updateError)
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })
    }

    // Debug: Überprüfe, wie viele Guidelines gespeichert wurden
    console.log(`batch-save-guidelines: ${guidelines.length} Guidelines erfolgreich gespeichert`)

    return NextResponse.json({
      success: true,
      message: `${guidelines.length} guidelines saved successfully`,
      count: guidelines.length,
    })
  } catch (error) {
    console.error("batch-save-guidelines: Unhandled error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
