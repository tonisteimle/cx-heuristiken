import type { StorageData } from "@/types/storage-data"
import { createApiHandler } from "@/lib/api-handler"

// Definiere den Handler für das Speichern von Daten
async function saveDataHandler(requestData: any, supabase: any) {
  console.log("saveDataHandler: Received request", {
    hasData: !!requestData.data,
    isIncremental: !!requestData.isIncremental,
  })

  // Extrahiere die Daten mit Fallback-Werten und tiefer Validierung
  let data = requestData.data || {}

  console.log("saveDataHandler: Received data", { dataSize: JSON.stringify(data).length })

  // Wenn die Daten in einem verschachtelten Objekt sind, extrahiere sie
  if (typeof data !== "object" && requestData.guidelines) {
    data = requestData // Die Daten könnten direkt im Root-Objekt sein
  }

  // Stelle sicher, dass wir ein gültiges Objekt haben
  if (typeof data !== "object" || data === null) {
    data = {}
  }

  const isIncremental = Boolean(requestData.isIncremental || data.isIncremental || false)

  // Stelle sicher, dass die Grundstruktur vorhanden ist und validiere jeden Eintrag
  const safeData: Partial<StorageData> = {
    guidelines: Array.isArray(data.guidelines)
      ? data.guidelines
          .filter((g: any) => g && typeof g === "object")
          .map((g: any) => ({
            id: g.id || `guideline_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            title: String(g.title || "Untitled"),
            text: String(g.text || ""),
            categories: Array.isArray(g.categories) ? g.categories.filter(Boolean).map(String) : [],
            principles: Array.isArray(g.principles) ? g.principles.filter(Boolean).map(String) : [],
            createdAt: g.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            // Optionale Felder nur hinzufügen, wenn sie vorhanden sind
            ...(g.justification ? { justification: String(g.justification) } : {}),
            ...(g.imageUrl ? { imageUrl: String(g.imageUrl) } : {}),
            ...(g.svgContent ? { svgContent: String(g.svgContent) } : {}),
          }))
      : [],
    categories: Array.isArray(data.categories)
      ? [...new Set(data.categories.filter(Boolean).map(String))] // Duplikate entfernen
      : [],
    principles: Array.isArray(data.principles)
      ? data.principles
          .filter((p: any) => p && typeof p === "object")
          .map((p: any) => ({
            id: p.id || `principle_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            name: String(p.name || "Untitled Principle"),
            description: String(p.description || ""),
            // Weitere Felder nach Bedarf
            ...(p.elements ? { elements: Array.isArray(p.elements) ? p.elements : [] } : {}),
            ...(p.evidenz ? { evidenz: String(p.evidenz) } : {}),
            ...(p.implikation ? { implikation: String(p.implikation) } : {}),
          }))
      : [],
    lastUpdated: new Date().toISOString(),
    version: String(data.version || "2.0"),
  }

  console.log("saveDataHandler: Processed data", {
    guidelinesCount: safeData.guidelines?.length || 0,
    categoriesCount: safeData.categories?.length || 0,
    principlesCount: safeData.principles?.length || 0,
    isIncremental,
  })

  // Wenn inkrementell, müssen wir die bestehenden Daten abrufen und zusammenführen
  if (isIncremental) {
    try {
      // Hole aktuelle Daten mit Fehlerbehandlung
      console.log("saveDataHandler: Fetching current data for incremental update")
      const { data: currentData, error } = await supabase
        .from("guidelines_data")
        .select("data")
        .eq("id", "main")
        .maybeSingle()

      if (error) {
        console.error("saveDataHandler: Error fetching current data", error)
      }

      // Wenn keine aktuellen Daten vorhanden sind oder ein Fehler auftritt, erstellen wir einen neuen Eintrag
      if (error || !currentData?.data) {
        console.log("saveDataHandler: No current data found, creating new entry")
        const { error: insertError } = await supabase.from("guidelines_data").insert({
          id: "main",
          data: safeData,
          updated_at: new Date().toISOString(),
        })

        if (insertError) {
          console.error("saveDataHandler: Error inserting new data", insertError)
          throw new Error(`Fehler beim Einfügen neuer Daten: ${insertError.message}`)
        }

        return {
          message: "Neue Daten erstellt (inkrementeller Modus)",
          details: {
            guidelinesCount: safeData.guidelines?.length || 0,
            categoriesCount: safeData.categories?.length || 0,
            principlesCount: safeData.principles?.length || 0,
          },
        }
      }

      console.log("saveDataHandler: Current data found, merging")

      // Stelle sicher, dass die aktuellen Daten eine gültige Struktur haben
      const currentGuidelines = Array.isArray(currentData.data.guidelines) ? currentData.data.guidelines : []
      const currentCategories = Array.isArray(currentData.data.categories) ? currentData.data.categories : []
      const currentPrinciples = Array.isArray(currentData.data.principles) ? currentData.data.principles : []

      // Erstelle eine Map der bestehenden Guidelines nach ID für effiziente Suche
      const guidelinesMap = new Map()
      currentGuidelines.forEach((g: any) => {
        if (g && g.id) {
          guidelinesMap.set(g.id, g)
        }
      })

      // Führe die Guidelines zusammen, aktualisiere bestehende und füge neue hinzu
      const mergedGuidelines = [...currentGuidelines]

      if (Array.isArray(safeData.guidelines)) {
        safeData.guidelines.forEach((newGuideline: any) => {
          if (!newGuideline || !newGuideline.id) return

          const index = currentGuidelines.findIndex((g: any) => g.id === newGuideline.id)

          if (index >= 0) {
            // Aktualisiere bestehende Guideline
            mergedGuidelines[index] = {
              ...currentGuidelines[index],
              ...newGuideline,
              updatedAt: new Date().toISOString(),
            }
          } else {
            // Füge neue Guideline hinzu
            mergedGuidelines.push(newGuideline)
          }
        })
      }

      // Führe die Kategorien zusammen und entferne Duplikate
      const mergedCategories = [...new Set([...currentCategories, ...(safeData.categories || [])])]

      // Erstelle eine Map der bestehenden Principles nach ID für effiziente Suche
      const principlesMap = new Map()
      currentPrinciples.forEach((p: any) => {
        if (p && p.id) {
          principlesMap.set(p.id, p)
        }
      })

      // Führe die Principles zusammen, aktualisiere bestehende und füge neue hinzu
      const mergedPrinciples = [...currentPrinciples]

      if (Array.isArray(safeData.principles) && safeData.principles.length > 0) {
        safeData.principles.forEach((newPrinciple: any) => {
          if (!newPrinciple || !newPrinciple.id) return

          const index = currentPrinciples.findIndex((p: any) => p.id === newPrinciple.id)

          if (index >= 0) {
            // Aktualisiere bestehendes Principle
            mergedPrinciples[index] = {
              ...currentPrinciples[index],
              ...newPrinciple,
            }
          } else {
            // Füge neues Principle hinzu
            mergedPrinciples.push(newPrinciple)
          }
        })
      }

      // Erstelle die zusammengeführten Daten
      const mergedData = {
        guidelines: mergedGuidelines,
        categories: mergedCategories,
        principles: mergedPrinciples,
        lastUpdated: new Date().toISOString(),
        version: safeData.version || currentData.data.version || "2.0",
      }

      console.log("saveDataHandler: Merged data", {
        guidelinesCount: mergedGuidelines.length,
        categoriesCount: mergedCategories.length,
        principlesCount: mergedPrinciples.length,
      })

      // Aktualisiere die Daten mit Fehlerbehandlung
      const { error: updateError } = await supabase
        .from("guidelines_data")
        .update({
          data: mergedData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", "main")

      if (updateError) {
        console.error("saveDataHandler: Error updating data", updateError)
        throw new Error(`Fehler beim inkrementellen Update: ${updateError.message}`)
      }

      return {
        message: "Daten inkrementell aktualisiert",
        details: {
          guidelinesCount: mergedGuidelines.length,
          categoriesCount: mergedCategories.length,
          principlesCount: mergedPrinciples.length,
        },
      }
    } catch (error) {
      console.error("Fehler beim inkrementellen Update:", error)
      throw error
    }
  } else {
    // Nicht inkrementell - prüfe, ob bereits Daten existieren
    try {
      console.log("saveDataHandler: Non-incremental update, checking for existing data")
      const { data: existingData, error: checkError } = await supabase
        .from("guidelines_data")
        .select("id, data")
        .eq("id", "main")
        .maybeSingle()

      if (checkError) {
        console.error("saveDataHandler: Error checking for existing data", checkError)
      }

      // Wenn keine bestehenden Daten vorhanden sind oder ein Fehler auftritt, erstellen wir einen neuen Eintrag
      if (checkError || !existingData) {
        console.log("saveDataHandler: No existing data found, creating new entry")
        const { error: insertError } = await supabase.from("guidelines_data").insert({
          id: "main",
          data: safeData,
          updated_at: new Date().toISOString(),
        })

        if (insertError) {
          console.error("saveDataHandler: Error inserting new data", insertError)
          throw new Error(`Fehler beim Einfügen neuer Daten: ${insertError.message}`)
        }

        return {
          message: "Neue Daten eingefügt",
          details: {
            guidelinesCount: safeData.guidelines?.length || 0,
            categoriesCount: safeData.categories?.length || 0,
            principlesCount: safeData.principles?.length || 0,
          },
        }
      } else {
        console.log("saveDataHandler: Existing data found, updating")

        // Wenn die neuen Daten leer sind, behalten wir die bestehenden Daten bei
        if (
          (!safeData.guidelines || safeData.guidelines.length === 0) &&
          (!safeData.categories || safeData.categories.length === 0) &&
          (!safeData.principles || safeData.principles.length === 0)
        ) {
          console.log("saveDataHandler: New data is empty, only updating timestamp")
          // Aktualisiere nur das lastUpdated-Feld
          const { error: updateError } = await supabase
            .from("guidelines_data")
            .update({
              data: {
                ...existingData.data,
                lastUpdated: new Date().toISOString(),
              },
              updated_at: new Date().toISOString(),
            })
            .eq("id", "main")

          if (updateError) {
            console.error("saveDataHandler: Error updating timestamp", updateError)
            throw new Error(`Fehler beim Aktualisieren des Zeitstempels: ${updateError.message}`)
          }

          return {
            message: "Keine Änderungen, nur Zeitstempel aktualisiert",
            details: {
              guidelinesCount: existingData.data?.guidelines?.length || 0,
              categoriesCount: existingData.data?.categories?.length || 0,
              principlesCount: existingData.data?.principles?.length || 0,
            },
          }
        }

        // Aktualisiere bestehende Daten
        console.log("saveDataHandler: Updating existing data")
        const { error: updateError } = await supabase
          .from("guidelines_data")
          .update({
            data: safeData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", "main")

        if (updateError) {
          console.error("saveDataHandler: Error updating existing data", updateError)
          throw new Error(`Fehler beim Aktualisieren bestehender Daten: ${updateError.message}`)
        }

        return {
          message: "Bestehende Daten aktualisiert",
          details: {
            guidelinesCount: safeData.guidelines?.length || 0,
            categoriesCount: safeData.categories?.length || 0,
            principlesCount: safeData.principles?.length || 0,
          },
        }
      }
    } catch (error) {
      console.error("Fehler beim nicht-inkrementellen Update:", error)
      throw error
    }
  }
}

export const POST = createApiHandler(saveDataHandler)
