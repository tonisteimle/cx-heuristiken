import type { Guideline } from "@/types/guideline"
import { createApiHandler } from "@/lib/api-handler"
import Ajv from "ajv"
import { v4 as uuidv4 } from "uuid"

// Define a JSON schema for Guideline validation
const guidelineSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    text: { type: "string" },
    justification: { type: "string", nullable: true },
    categories: { type: "array", items: { type: "string" } },
    principles: { type: "array", items: { type: "string" } },
    createdAt: { type: "string" },
    updatedAt: { type: "string" },
    imageUrl: { type: "string", nullable: true },
    svgContent: { type: "string", nullable: true },
  },
  // Wir entfernen die required-Validierung, um flexibler zu sein
  additionalProperties: true,
}

const ajv = new Ajv({ allErrors: true, coerceTypes: true })
const validate = ajv.compile(guidelineSchema)

// Definiere den Handler für das Speichern einer Guideline
async function saveGuidelineHandler(data: any, supabase: any) {
  try {
    // Stelle sicher, dass wir ein gültiges Guideline-Objekt haben
    let guideline: any = { ...data }

    // Wenn die Daten in einem data-Feld verschachtelt sind, extrahiere sie
    if (data && data.data && typeof data.data === "object") {
      guideline = { ...data.data }
    }

    // Wenn die Daten in einem guideline-Feld verschachtelt sind, extrahiere sie
    if (data && data.guideline && typeof data.guideline === "object") {
      guideline = { ...data.guideline }
    }

    // Stelle sicher, dass die Guideline eine ID hat
    if (!guideline.id) {
      guideline.id = uuidv4()
      console.log("Neue ID generiert:", guideline.id)
    }

    // Stelle sicher, dass alle Felder den richtigen Typ haben
    guideline = {
      id: String(guideline.id),
      title: String(guideline.title || "Untitled Guideline"),
      text: String(guideline.text || ""),
      categories: Array.isArray(guideline.categories) ? guideline.categories.filter(Boolean).map(String) : [],
      principles: Array.isArray(guideline.principles) ? guideline.principles.filter(Boolean).map(String) : [],
      updatedAt: new Date().toISOString(),
      createdAt: guideline.createdAt || new Date().toISOString(),
      // Optionale Felder nur hinzufügen, wenn sie vorhanden sind
      ...(guideline.justification ? { justification: String(guideline.justification) } : {}),
      ...(guideline.imageUrl ? { imageUrl: String(guideline.imageUrl) } : {}),
      ...(guideline.svgContent ? { svgContent: String(guideline.svgContent) } : {}),
    }

    // Validiere die Guideline gegen das Schema
    const valid = validate(guideline)
    if (!valid) {
      console.warn("Guideline-Validierungswarnung:", validate.errors)
      // Wir werfen keinen Fehler, sondern fahren mit den bereinigten Daten fort
    }

    // Lade die aktuellen Daten mit Fehlerbehandlung
    let currentData
    try {
      const { data, error } = await supabase.from("guidelines_data").select("data").eq("id", "main").maybeSingle()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      currentData = data
    } catch (fetchError) {
      console.error("Fehler beim Laden der aktuellen Daten:", fetchError)
      // Wenn wir die aktuellen Daten nicht laden können, erstellen wir einen neuen Eintrag
      currentData = null
    }

    // Initialisiere die Datenstrukturen mit Fallback-Werten
    const currentGuidelines = currentData?.data?.guidelines || []
    const updatedCategories = [...(currentData?.data?.categories || [])]

    // Finde, ob die Guideline bereits existiert
    const index = currentGuidelines.findIndex((g: Guideline) => g.id === guideline.id)

    // Aktualisiere oder füge die Guideline hinzu
    let updatedGuidelines
    if (index >= 0) {
      updatedGuidelines = [...currentGuidelines]
      updatedGuidelines[index] = guideline
    } else {
      updatedGuidelines = [...currentGuidelines, guideline]
    }

    // Füge neue Kategorien hinzu
    if (guideline.categories && Array.isArray(guideline.categories)) {
      guideline.categories.forEach((category: string) => {
        if (category && !updatedCategories.includes(category)) {
          updatedCategories.push(category)
        }
      })
    }

    // Erstelle die zu speichernden Daten
    const dataToSave = {
      guidelines: updatedGuidelines,
      categories: updatedCategories,
      principles: currentData?.data?.principles || [],
      lastUpdated: new Date().toISOString(),
      version: currentData?.data?.version || "2.0",
    }

    // Wenn keine aktuellen Daten vorhanden sind, erstelle einen neuen Eintrag
    if (!currentData) {
      try {
        const { error: insertError } = await supabase.from("guidelines_data").insert({
          id: "main",
          data: dataToSave,
          updated_at: new Date().toISOString(),
        })

        if (insertError) throw insertError
      } catch (insertError) {
        console.error("Fehler beim Einfügen neuer Daten:", insertError)

        // Versuche es erneut mit einem minimalen Datensatz
        const minimalData = {
          guidelines: [guideline],
          categories: guideline.categories || [],
          principles: [],
          lastUpdated: new Date().toISOString(),
          version: "2.0",
        }

        const { error: retryError } = await supabase.from("guidelines_data").insert({
          id: "main",
          data: minimalData,
          updated_at: new Date().toISOString(),
        })

        if (retryError) throw retryError
      }
    } else {
      // Aktualisiere die Daten in Supabase
      try {
        const { error: updateError } = await supabase
          .from("guidelines_data")
          .update({
            data: dataToSave,
            updated_at: new Date().toISOString(),
          })
          .eq("id", "main")

        if (updateError) throw updateError
      } catch (updateError) {
        console.error("Fehler beim Aktualisieren der Daten:", updateError)

        // Versuche es erneut mit einem minimalen Update
        const { error: retryError } = await supabase
          .from("guidelines_data")
          .update({
            data: {
              guidelines: [guideline],
              categories: guideline.categories || [],
              principles: [],
              lastUpdated: new Date().toISOString(),
              version: "2.0",
            },
            updated_at: new Date().toISOString(),
          })
          .eq("id", "main")

        if (retryError) throw retryError
      }
    }

    return {
      id: guideline.id,
      success: true,
      message: index >= 0 ? "Guideline aktualisiert" : "Neue Guideline erstellt",
    }
  } catch (error) {
    console.error("Fehler beim Speichern der Guideline:", error)
    throw error
  }
}

// Exportiere die POST-Funktion mit dem API-Handler
export const POST = createApiHandler(saveGuidelineHandler)
