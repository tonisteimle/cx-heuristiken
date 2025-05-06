import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-client"

// Update the GET function to avoid using aggregate functions
export async function GET() {
  try {
    const supabase = createServerClient()

    // Check if we can connect to Supabase with a simple query
    const { data: connectionData, error: connectionError } = await supabase
      .from("guidelines_data")
      .select("id")
      .limit(1)

    if (connectionError) {
      // If the error indicates the table doesn't exist, try to create it
      if (connectionError.message.includes("does not exist")) {
        try {
          // Try to create the table via RPC
          const { error: rpcError } = await supabase.rpc("create_guidelines_table")

          if (rpcError) {
            return NextResponse.json(
              {
                success: false,
                error: `Failed to create table: ${rpcError.message}`,
                details: {
                  connectionError,
                  rpcError,
                },
              },
              { status: 500 },
            )
          }

          // Check if the table was created successfully
          const { data: checkData, error: checkError } = await supabase.from("guidelines_data").select("id").limit(1)

          if (checkError) {
            return NextResponse.json(
              {
                success: false,
                error: `Table was created but still can't be accessed: ${checkError.message}`,
                details: {
                  connectionError,
                  checkError,
                },
              },
              { status: 500 },
            )
          }

          return NextResponse.json({
            success: true,
            message: "Table was created successfully",
            data: checkData,
          })
        } catch (error) {
          return NextResponse.json(
            {
              success: false,
              error: `Failed to create table: ${error instanceof Error ? error.message : String(error)}`,
              details: {
                connectionError,
                error,
              },
            },
            { status: 500 },
          )
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: `Connection error: ${connectionError.message}`,
          details: {
            connectionError,
          },
        },
        { status: 500 },
      )
    }

    // Check if we can access the app_data record
    const { data: recordData, error: recordError } = await supabase
      .from("guidelines_data")
      .select("data")
      .eq("id", "app_data")
      .single()

    if (recordError && recordError.code !== "PGRST116") {
      return NextResponse.json(
        {
          success: false,
          error: `Record access error: ${recordError.message}`,
          details: {
            recordError,
          },
        },
        { status: 500 },
      )
    }

    // If the record doesn't exist, create it
    if (recordError && recordError.code === "PGRST116") {
      try {
        const { error: insertError } = await supabase.from("guidelines_data").insert({
          id: "app_data",
          data: {
            principles: [],
            guidelines: [],
            categories: [],
            elements: [],
          },
          updated_at: new Date().toISOString(),
        })

        if (insertError) {
          return NextResponse.json(
            {
              success: false,
              error: `Failed to create initial record: ${insertError.message}`,
              details: {
                insertError,
              },
            },
            { status: 500 },
          )
        }

        return NextResponse.json({
          success: true,
          message: "Initial record created successfully",
          data: {
            principles: 0,
            guidelines: 0,
            categories: 0,
            elements: 0,
          },
        })
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: `Failed to create initial record: ${error instanceof Error ? error.message : String(error)}`,
            details: {
              error,
            },
          },
          { status: 500 },
        )
      }
    }

    // Return success with data stats
    return NextResponse.json({
      success: true,
      message: "Connection successful",
      data: {
        principles: recordData?.data?.principles?.length || 0,
        guidelines: recordData?.data?.guidelines?.length || 0,
        categories: recordData?.data?.categories?.length || 0,
        elements: recordData?.data?.elements?.length || 0,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
        details: {
          error,
        },
      },
      { status: 500 },
    )
  }
}
