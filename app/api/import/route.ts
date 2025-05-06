import { NextResponse } from "next/server"
import { ImportService } from "@/services/import-service"
import type { StorageData } from "@/types/storage-data"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const data: StorageData = await request.json()

    // Get import options from request headers or use defaults
    const options = {
      mergeStrategy: (request.headers.get("x-import-strategy") as "replace" | "merge" | "preserve") || "merge",
      importGuidelines: request.headers.get("x-import-guidelines") !== "false",
      importPrinciples: request.headers.get("x-import-principles") !== "false",
      importCategories: request.headers.get("x-import-categories") !== "false",
      preserveImages: request.headers.get("x-preserve-images") !== "false",
    }

    // Use the import service to process the data
    const importService = new ImportService()
    const result = await importService.importData(data, options)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      stats: result.stats,
    })
  } catch (error) {
    console.error("Fehler beim Importieren der Daten:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Fehler beim Importieren der Daten: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}
