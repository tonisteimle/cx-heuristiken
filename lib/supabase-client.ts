import { createClient } from "@supabase/supabase-js"

// Fallback-Werte für den Fall, dass die Umgebungsvariablen nicht verfügbar sind
const FALLBACK_SUPABASE_URL = "https://qlrdpyjoxzsgawnhxvkn.supabase.co"
const FALLBACK_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscmRweWpveHpzZ2F3bmh4dmtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2Mjc3MTgsImV4cCI6MjA1OTIwMzcxOH0.Wd9JKE1sBxnOCJJbmM2F4P_eQVbRV2_K0MyON_glBgY"

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
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    FALLBACK_SUPABASE_ANON_KEY

  // Create a client with the service role key to bypass RLS
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  })
}
