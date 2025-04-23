import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"
import type { StorageData } from "@/types/storage-data"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Log the request method and headers for debugging
    console.log("Request method:", request.method)
    console.log("Content-Type:", request.headers.get("Content-Type"))

    // Get the request body as text first for debugging
    let bodyText
    try {
      // Clone the request to avoid consuming the body
      const clonedRequest = request.clone()
      bodyText = await clonedRequest.text()

      if (!bodyText || bodyText.trim() === "") {
        return NextResponse.json({ success: false, error: "Empty request body" }, { status: 400 })
      }

      console.log("Request body length:", bodyText.length)
      console.log("Request body (first 100 chars):", bodyText.substring(0, 100))
    } catch (textError) {
      console.error("Error reading request body as text:", textError)
      return NextResponse.json(
        {
          success: false,
          error: `Error reading request body: ${textError instanceof Error ? textError.message : String(textError)}`,
        },
        { status: 400 },
      )
    }

    // Parse the body text as JSON with error handling
    let body
    try {
      body = JSON.parse(bodyText)
    } catch (parseError) {
      console.error("Error parsing request body as JSON:", parseError)

      // Try to recover from common JSON parsing errors
      try {
        // Try to fix common JSON issues
        const fixedText = bodyText
          .replace(/\n/g, " ")
          .replace(/\r/g, "")
          .replace(/\t/g, " ")
          .replace(/,\s*}/g, "}") // Remove trailing commas
          .replace(/,\s*]/g, "]") // Remove trailing commas in arrays

        body = JSON.parse(fixedText)
        console.log("Successfully recovered from JSON parsing error")
      } catch (recoveryError) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid JSON in request body: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
          },
          { status: 400 },
        )
      }
    }

    // Extract the data field
    const data = body?.data

    // Validate the data with robust error handling
    if (!data) {
      console.error("No data provided in request body")
      return NextResponse.json({ success: false, error: "No data provided in request body" }, { status: 400 })
    }

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

    // Process data incrementally to avoid overwhelming the system
    // First, prepare a clean data object with robust validation
    const cleanData: StorageData = {
      guidelines: Array.isArray(data.guidelines) ? data.guidelines.filter((g) => g && typeof g === "object") : [],
      categories: Array.isArray(data.categories) ? data.categories.filter((c) => c && typeof c === "string") : [],
      principles: Array.isArray(data.principles) ? data.principles.filter((p) => p && typeof p === "object") : [],
      lastUpdated: new Date().toISOString(),
      version: data.version || "2.0",
    }

    // Log the cleaned data stats
    console.log(
      `Cleaned data: ${cleanData.guidelines.length} guidelines, ${cleanData.categories.length} categories, ${cleanData.principles.length} principles`,
    )

    // Merge categories if needed
    if (existingData?.data?.categories && cleanData.categories) {
      // Ensure we don't have duplicate categories
      const existingCategories = existingData.data.categories || []
      const newCategories = cleanData.categories || []

      // Combine categories and remove duplicates
      cleanData.categories = [...new Set([...existingCategories, ...newCategories])]
    }

    // Check if the data is too large
    const dataSize = JSON.stringify(cleanData).length
    console.log(`Data size: ${dataSize} bytes`)

    // Supabase has a 1MB limit for JSON columns
    if (dataSize > 900000) {
      // 900KB to be safe
      console.warn("Data size exceeds safe limit for Supabase JSON column")
      return NextResponse.json(
        {
          success: false,
          error: "Data size too large. Please try importing smaller chunks of data.",
        },
        { status: 413 },
      )
    }

    // Save the data with robust error handling
    try {
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
        },
      })
    } catch (saveError) {
      console.error("Error in save operation:", saveError)
      return NextResponse.json(
        { success: false, error: saveError instanceof Error ? saveError.message : "Unknown error during save" },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in save-data API route:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
