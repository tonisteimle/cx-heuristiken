// Fügen Sie Code hinzu, um die Kategorien zu aktualisieren, wenn eine Guideline gespeichert wird

import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"
import type { Guideline } from "@/types/guideline"

export async function POST(request: Request) {
  try {
    const guideline = await request.json()

    // Validate the guideline
    if (!guideline) {
      return NextResponse.json({ success: false, error: "No guideline provided" }, { status: 400 })
    }

    // Create a Supabase client with service role
    const supabase = createServerSupabaseClient()

    // Get current data to update categories
    const { data: currentData, error: fetchError } = await supabase
      .from("guidelines_data")
      .select("data")
      .eq("id", "main")
      .single()

    if (fetchError) {
      console.error("Error fetching current data:", fetchError)
      return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 })
    }

    // Update or add the guideline
    let updatedGuidelines = []
    const updatedCategories = currentData?.data?.categories || []

    if (currentData?.data?.guidelines) {
      // Find if guideline already exists
      const index = currentData.data.guidelines.findIndex((g: Guideline) => g.id === guideline.id)

      if (index >= 0) {
        // Update existing guideline
        updatedGuidelines = [...currentData.data.guidelines]
        updatedGuidelines[index] = guideline
      } else {
        // Add new guideline
        updatedGuidelines = [...currentData.data.guidelines, guideline]
      }
    } else {
      // No guidelines yet, create new array
      updatedGuidelines = [guideline]
    }

    // Add any new categories that don't exist yet
    if (guideline.categories && Array.isArray(guideline.categories)) {
      guideline.categories.forEach((category: string) => {
        if (!updatedCategories.includes(category)) {
          updatedCategories.push(category)
        }
      })
    }

    // Update the data in Supabase
    const { error: updateError } = await supabase
      .from("guidelines_data")
      .update({
        data: {
          ...currentData.data,
          guidelines: updatedGuidelines,
          categories: updatedCategories,
          lastUpdated: new Date().toISOString(),
        },
      })
      .eq("id", "main")

    if (updateError) {
      console.error("Error updating guideline:", updateError)
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: guideline.id })
  } catch (error) {
    console.error("Error in save-guideline API route:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
