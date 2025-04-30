import { createClient } from "@supabase/supabase-js"

// Singleton-Instanz für den Server-Client
let serverClientInstance: ReturnType<typeof createClient> | null = null

// Singleton-Instanz für den Browser-Client
let browserClientInstance: ReturnType<typeof createClient> | null = null

// Erstellt einen Supabase-Client für serverseitige Operationen
export function createServerSupabaseClient() {
  if (serverClientInstance) return serverClientInstance

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL oder Service Role Key nicht gefunden")
  }

  serverClientInstance = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  })

  return serverClientInstance
}

// Erstellt einen Supabase-Client für clientseitige Operationen
export function createBrowserSupabaseClient() {
  if (typeof window === "undefined") {
    throw new Error("createBrowserSupabaseClient sollte nur im Browser aufgerufen werden")
  }

  if (browserClientInstance) return browserClientInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL oder Anon Key nicht gefunden")
  }

  browserClientInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storageKey: "guidelines-manager-auth",
    },
  })

  return browserClientInstance
}

// Hilfsfunktion, um den richtigen Client basierend auf der Umgebung zu erhalten
export function getSupabaseClient() {
  if (typeof window === "undefined") {
    return createServerSupabaseClient()
  } else {
    return createBrowserSupabaseClient()
  }
}
