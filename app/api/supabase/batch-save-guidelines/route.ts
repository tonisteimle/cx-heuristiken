import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Direct implementation instead of using the createApiHandler
export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "")

    // Parse request data safely
    let requestData
    try {
      requestData = await request.json()
    } catch (error) {
      console.error("Error parsing JSON:", error)
      return NextResponse.json({ success: false, error: "Invalid JSON in request" }, { status: 400 })
    }

    console.log("batchSaveGuidelinesHandler: Received request", {
      guidelinesCount: requestData.guidelines?.length || 0,
    })

    if (!Array.isArray(requestData.guidelines) || requestData.guidelines.length === 0) {
      return NextResponse.json({ success: false, error: "No guidelines provided or invalid format" }, { status: 400 })
    }

    // Fetch current data
    const { data: currentData, error: fetchError } = await supabase
      .from("guidelines_data")
      .select("data")
      .eq("id", "main")
      .single()

    if (fetchError) {
      console.error("Error fetching current data:", fetchError)
      return NextResponse.json(
        { success: false, error: `Failed to fetch current data: ${fetchError.message}` },
        { status: 500 },
      )
    }

    // Create a map of existing guidelines for quick access
    const existingGuidelines = new Map()
    if (currentData?.data?.guidelines) {
      for (const guideline of currentData.data.guidelines) {
        if (guideline && guideline.id) {
          existingGuidelines.set(guideline.id, guideline)
        }
      }
    }

    // Update or add guidelines
    const updatedGuidelines = [...(currentData?.data?.guidelines || [])]
    const processedIds = new Set()

    for (const guideline of requestData.guidelines) {
      if (!guideline || !guideline.id) continue

      processedIds.add(guideline.id)
      const index = updatedGuidelines.findIndex((g) => g.id === guideline.id)

      if (index >= 0) {
        // Update existing guideline
        updatedGuidelines[index] = guideline
      } else {
        // Add new guideline
        updatedGuidelines.push(guideline)
      }
    }

    // Update data in the database
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
      console.error("Error updating guidelines:", updateError)
      return NextResponse.json(
        { success: false, error: `Failed to update guidelines: ${updateError.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${requestData.guidelines.length} guidelines`,
      updatedCount: requestData.guidelines.length,
    })
  } catch (error) {
    console.error("Error in batch save guidelines:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
