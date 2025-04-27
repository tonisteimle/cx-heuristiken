import { createClient } from "@supabase/supabase-js"

// Fallback-Werte für den Fall, dass die Umgebungsvariablen nicht verfügbar sind
const FALLBACK_SUPABASE_URL = "https://qlrdpyjoxzsgawnhxvkn.supabase.co"
const FALLBACK_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscmRweWpveHpzZ2F3bmh4dmtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2Mjc3MTgsImV4cCI6MjA1OTIwMzcxOH0.Wd9JKE1sBxnOCJJbmM2F4P_eQVbRV2_K0MyON_glBgY"
const FALLBACK_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscmRweWpveHpzZ2F3bmh4dmtuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzYyNzcxOCwiZXhwIjoyMDU5MjAzNzE4fQ.scW0UjHV4lVEGCONhgygr1FjH2qPxx9_AaGPfV92Z2k"

// Hilfsfunktion zum Loggen von Umgebungsvariablen (ohne sensible Werte)
function logEnvironmentVariables() {
  console.log("Environment Variables Check:", {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
    SUPABASE_URL: process.env.SUPABASE_URL ? "Set" : "Not set",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set",
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? "Set" : "Not set",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Not set",
    NODE_ENV: process.env.NODE_ENV,
  })
}

// Client-side Supabase client (with limited permissions)
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
    },
  },
)

// This function should only be used in server components or API routes
export const createServerSupabaseClient = () => {
  // Log environment variables for debugging
  logEnvironmentVariables()

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || FALLBACK_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase environment variables for server client")
  }

  // Create a client with the service role key to bypass RLS
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export const getSupabaseClient = () => {
  // Prüfen, ob wir im Browser oder auf dem Server sind
  const isServer = typeof window === "undefined"

  if (isServer) {
    // Server-side: Verwende den Service-Role-Key für volle Zugriffsrechte
    return createServerSupabaseClient()
  } else {
    // Client-side: Verwende den Anon-Key mit eingeschränkten Rechten
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables for client")
    }

    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    })
  }
}
