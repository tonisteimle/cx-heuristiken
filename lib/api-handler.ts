import type { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"
import { safelyParseJson, createSuccessResponse, createErrorResponse } from "./api-utils"

/**
 * Klasse zur Verarbeitung von API-Anfragen mit einheitlicher Fehlerbehandlung und Logging
 */
export class ApiHandler {
  private supabase: any
  private requestId: string
  private startTime: number

  constructor(private handler: (data: any, supabase: any) => Promise<any>) {
    this.requestId = uuidv4().substring(0, 8)
    this.startTime = Date.now()

    try {
      // Supabase-Client initialisieren
      this.supabase = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "")
    } catch (error) {
      console.error(`[${this.requestId}] Fehler bei der Initialisierung des Supabase-Clients:`, error)
      throw error
    }
  }

  /**
   * Verarbeitet die eingehende Anfrage
   */
  async handleRequest(request: NextRequest): Promise<NextResponse> {
    try {
      // JSON-Daten aus der Anfrage parsen
      const parseResult = await safelyParseJson(request)

      if (!parseResult.success) {
        this.logError("Fehler beim Parsen der JSON-Daten")
        return parseResult.response
      }

      // Handler mit den geparsten Daten aufrufen
      const result = await this.handler(parseResult.data, this.supabase)

      // Erfolgreiche Antwort erstellen
      const duration = Date.now() - this.startTime
      this.log(`API-Anfrage erfolgreich bearbeitet in ${duration}ms`)
      return createSuccessResponse(result)
    } catch (error) {
      // Fehlerbehandlung
      const duration = Date.now() - this.startTime
      this.logError(`API-Fehler nach ${duration}ms:`, error)
      return createErrorResponse(error as Error)
    }
  }

  /**
   * Protokolliert eine Nachricht mit der Request-ID
   */
  private log(message: string): void {
    console.log(`[${this.requestId}] ${message}`)
  }

  /**
   * Protokolliert einen Fehler mit der Request-ID
   */
  private logError(message: string, error?: any): void {
    if (error) {
      console.error(`[${this.requestId}] ${message}`, error)
    } else {
      console.error(`[${this.requestId}] ${message}`)
    }
  }
}

/**
 * Factory-Funktion zur Erstellung eines API-Handlers
 */
export function createApiHandler(handler: (data: any, supabase: any) => Promise<any>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const apiHandler = new ApiHandler(handler)
    return apiHandler.handleRequest(request)
  }
}
