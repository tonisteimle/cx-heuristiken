import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-client"

export async function GET() {
  return handleRequest()
}

export async function POST() {
  return handleRequest()
}

async function handleRequest() {
  try {
    const supabase = createServerClient()

    // Prüfe, ob die Tabelle existiert, indem wir versuchen, Daten abzurufen
    try {
      const { data, error } = await supabase.from("guidelines_data").select("id").limit(1)

      if (!error) {
        return NextResponse.json({
          success: true,
          message: "Tabelle existiert bereits",
        })
      }
    } catch (error) {
      console.log("Tabelle existiert möglicherweise nicht, versuche sie zu erstellen")
    }

    // Versuche, die Tabelle über eine RPC-Funktion zu erstellen
    const { error: rpcError } = await supabase.rpc("create_guidelines_table")

    if (rpcError) {
      console.error("Fehler beim Erstellen der Tabelle über RPC:", rpcError)

      // Wenn die RPC-Funktion nicht existiert oder fehlschlägt, verwenden wir einen Fallback
      // Wir erstellen die Tabelle direkt über eine INSERT-Operation und fangen mögliche Fehler ab
      try {
        // Versuche, einen Datensatz einzufügen, um zu sehen, ob die Tabelle existiert
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

        if (!insertError) {
          return NextResponse.json({
            success: true,
            message: "Tabelle existiert und Daten wurden eingefügt",
          })
        }

        // Wenn ein Fehler auftritt, der nicht mit der Tabellenexistenz zusammenhängt
        if (insertError && !insertError.message.includes("does not exist")) {
          return NextResponse.json(
            {
              success: false,
              error: `Fehler beim Einfügen von Daten: ${insertError.message}`,
            },
            { status: 500 },
          )
        }

        // Wenn die Tabelle nicht existiert, können wir sie nicht direkt erstellen
        return NextResponse.json(
          {
            success: false,
            error: `Tabelle existiert nicht und kann nicht erstellt werden: ${insertError.message}`,
          },
          { status: 500 },
        )
      } catch (insertError) {
        return NextResponse.json(
          {
            success: false,
            error: `Fehler beim Versuch, Daten einzufügen: ${
              insertError instanceof Error ? insertError.message : String(insertError)
            }`,
          },
          { status: 500 },
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: "Tabelle erfolgreich erstellt",
    })
  } catch (error) {
    console.error("Unerwarteter Fehler bei der Tabelleninitialisierung:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Unerwarteter Fehler: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}
