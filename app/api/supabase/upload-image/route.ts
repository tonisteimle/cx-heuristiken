import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const image = formData.get("image") as File
    const name = formData.get("name") as string

    if (!image || !name) {
      return NextResponse.json({ success: false, error: "Image and name are required" }, { status: 400 })
    }

    // Create a Supabase client with service role
    const supabase = createServerSupabaseClient()

    // Upload the image to Supabase Storage
    const { data, error } = await supabase.storage.from("guidelines-images").upload(`${name}`, image, {
      cacheControl: "3600",
      upsert: true,
    })

    if (error) {
      console.error("Error uploading image:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Get the public URL for the uploaded image
    const { data: publicUrlData } = supabase.storage.from("guidelines-images").getPublicUrl(data.path)

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
    })
  } catch (error) {
    console.error("Error in upload-image API route:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
