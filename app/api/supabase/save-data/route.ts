import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"
import type { StorageData } from "@/types/storage-data"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Extract the JSON data from the request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("Error parsing request body:", parseError)
      return NextResponse.json(
        {
          success: false,
          error: `Invalid JSON in request body: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
        },
        { status: 400 },
      )
    }

    const data = body?.data

    // Validate the data
    if (!data) {
      return NextResponse.json({ success: false, error: "No data provided" }, { status: 400 })
    }

    // Log some information about the data
    console.log(
      `Received data with ${data.guidelines?.length || 0} guidelines, ${data.categories?.length || 0} categories, and ${data.principles?.length || 0} principles`,
    )

    // Check for images
    const imagesCount =
      data.guidelines?.filter((g: any) => g.imageUrl || g.detailImageUrl || g.svgContent || g.detailSvgContent)
        .length || 0
    console.log(`Found ${imagesCount} guidelines with images`)

    // Create a Supabase client with service role
    const supabase = createServerSupabaseClient()

    // Check if a record already exists
    const { data: existingData, error: checkError } = await supabase
      .from("guidelines_data")
      .select("id, data")
      .eq("id", "main")
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking for existing data:", checkError)
      return NextResponse.json({ success: false, error: checkError.message }, { status: 500 })
    }

    // Prepare a clean data object for saving
    const cleanData: StorageData = {
      guidelines: Array.isArray(data.guidelines) ? data.guidelines : [],
      categories: Array.isArray(data.categories) ? data.categories : [],
      principles: Array.isArray(data.principles) ? data.principles : [],
      lastUpdated: new Date().toISOString(),
      version: data.version || "2.0",
    }

    // Merge categories if needed
    if (existingData?.data?.categories && cleanData.categories) {
      // Ensure we don't have duplicate categories
      const existingCategories = existingData.data.categories || []
      const newCategories = cleanData.categories || []

      // Combine categories and remove duplicates
      cleanData.categories = [...new Set([...existingCategories, ...newCategories])]
    }

    let saveError

    // If data exists, update it; otherwise, insert it
    if (existingData) {
      const { error } = await supabase
        .from("guidelines_data")
        .update({
          data: cleanData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", "main")

      saveError = error
    } else {
      const { error } = await supabase.from("guidelines_data").insert({
        id: "main",
        data: cleanData,
        updated_at: new Date().toISOString(),
      })

      saveError = error
    }

    if (saveError) {
      console.error("Error saving data:", saveError)
      return NextResponse.json({ success: false, error: saveError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      details: {
        guidelinesCount: cleanData.guidelines.length,
        categoriesCount: cleanData.categories.length,
        principlesCount: cleanData.principles.length,
        imagesCount,
      },
    })
  } catch (error) {
    console.error("Error in save-data API route:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
