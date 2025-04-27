import { type NextRequest, NextResponse } from "next/server"

/**
 * Zentrale Hilfsfunktion zum sicheren Parsen von JSON-Anfragen
 * @param request Die NextRequest-Instanz
 * @returns Ein Objekt mit dem geparsten Daten oder Fehlerinformationen
 */
export async function safelyParseJson<T>(request: NextRequest): Promise<
  | { success: true; data: T }
  | {
      success: false
      error: string
      status: number
      response: NextResponse
    }
> {
  try {
    // Versuche, die Anfrage direkt als JSON zu parsen
    const data = (await request.json()) as T
    return { success: true, data }
  } catch (parseError) {
    console.error("JSON-Parsing-Fehler:", parseError)

    // Versuche, den Rohtext für Debugging-Zwecke zu bekommen
    let rawText = ""
    try {
      // Wir müssen die Anfrage klonen, da der Body-Stream bereits verbraucht wurde
      const clonedRequest = request.clone()
      rawText = await clonedRequest.text()
      console.error("Roher Anfrage-Body:", rawText.substring(0, 500)) // Nur die ersten 500 Zeichen loggen
    } catch (textError) {
      console.error("Konnte Rohtext nicht abrufen:", textError)
    }

    // Erstelle eine standardisierte Fehlerantwort
    const response = NextResponse.json(
      {
        success: false,
        error: "Ungültiges JSON in der Anfrage",
        details: parseError instanceof Error ? parseError.message : "Unbekannter Fehler",
        rawTextPreview: rawText.substring(0, 100), // Vorschau für Debugging
      },
      { status: 400 },
    )

    return {
      success: false,
      error: "Ungültiges JSON in der Anfrage",
      status: 400,
      response,
    }
  }
}

/**
 * Hilfsfunktion zum Erstellen einer standardisierten Erfolgsantwort
 */
export function createSuccessResponse(data: any, status = 200): NextResponse {
  return NextResponse.json({ success: true, ...data }, { status })
}

/**
 * Hilfsfunktion zum Erstellen einer standardisierten Fehlerantwort
 */
export function createErrorResponse(error: string | Error, status = 500): NextResponse {
  const errorMessage = error instanceof Error ? error.message : error
  console.error(`API-Fehler (${status}):`, errorMessage)

  return NextResponse.json(
    {
      success: false,
      error: errorMessage,
    },
    { status },
  )
}

/**
 * Wrapper für API-Handler zur einheitlichen Fehlerbehandlung
 */
export function withErrorHandling(handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      return await handler(request, ...args)
    } catch (error) {
      console.error("Unbehandelter API-Fehler:", error)
      return createErrorResponse(error instanceof Error ? error : "Ein unerwarteter Fehler ist aufgetreten", 500)
    }
  }
}
