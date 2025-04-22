import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"
import type { Principle } from "@/types/guideline"

export async function POST(request: NextRequest) {
  try {
    const principles = (await request.json()) as Principle[]

    if (!Array.isArray(principles)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid data: principles must be an array",
        },
        { status: 400 },
      )
    }

    const supabase = createServerSupabaseClient()

    // Process each principle
    for (const principle of principles) {
      if (!principle.name) {
        continue // Skip principles without a name
      }

      // Check if principle exists by name
      const { data: existingPrincipleByName } = await supabase
        .from("principles")
        .select("id")
        .eq("name", principle.name)
        .maybeSingle()

      // Check if principle exists by ID if provided
      let existingPrincipleById = null
      if (principle.id && principle.id.includes("-") && principle.id.length > 30) {
        const { data } = await supabase.from("principles").select("id").eq("id", principle.id).maybeSingle()

        existingPrincipleById = data
      }

      const existingPrinciple = existingPrincipleByName || existingPrincipleById

      if (existingPrinciple) {
        // Update existing principle
        const { error } = await supabase
          .from("principles")
          .update({
            name: principle.name,
            description: principle.description || "",
            evidenz: principle.evidenz || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingPrinciple.id)

        if (error) throw error
      } else {
        // Insert new principle - ohne ID, damit Supabase eine UUID generiert
        const { error } = await supabase.from("principles").insert({
          name: principle.name,
          description: principle.description || "",
          evidenz: principle.evidenz || null,
        })

        if (error) throw error
      }
    }

    // Update version
    await supabase
      .from("version")
      .update({
        last_updated: new Date().toISOString(),
      })
      .eq("id", 1)

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("Error in save-principles API route:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error saving principles",
      },
      { status: 500 },
    )
  }
}
