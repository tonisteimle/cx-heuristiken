import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Singleton-Instanzen für Client und Server
const browserClient: ReturnType<typeof createSupabaseClient> | null = null
let serverClient: ReturnType<typeof createSupabaseClient> | null = null

// Prüfen, ob wir im Browser oder auf dem Server sind
const isBrowser = typeof window !== "undefined"

// Client für den Browser erstellen (verwendet den anonymen Key)
// Add better error handling to the Supabase client creation

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase URL or Anon Key is missing. Check your environment variables.")

    // Return a mock client that will gracefully fail
    return {
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: new Error("Supabase credentials are missing") }),
          }),
          limit: () => ({
            maybeSingle: async () => ({ data: null, error: new Error("Supabase credentials are missing") }),
          }),
        }),
        insert: async () => ({ error: new Error("Supabase credentials are missing") }),
        upsert: async () => ({ error: new Error("Supabase credentials are missing") }),
      }),
      rpc: async () => ({ error: new Error("Supabase credentials are missing") }),
    }
  }

  try {
    return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        fetch: (...args) => {
          return fetch(...args).catch((err) => {
            console.error("Fetch error in Supabase client:", err)
            throw err
          })
        },
      },
    })
  } catch (error) {
    console.error("Error creating Supabase client:", error)
    throw error
  }
}

// Client für den Server erstellen (verwendet den Service Role Key)
export function createServerClient() {
  if (isBrowser) {
    throw new Error("createServerClient sollte nicht im Browser aufgerufen werden")
  }

  if (!serverClient) {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase URL oder Service Role Key fehlt")
      throw new Error("Supabase URL oder Service Role Key fehlt")
    }

    console.log("Creating server Supabase client with URL:", supabaseUrl)
    serverClient = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        fetch: fetch.bind(globalThis),
      },
    })
  }

  return serverClient
}

// Replace the testSupabaseConnection function with this version that doesn't use aggregate functions
export async function testSupabaseConnection() {
  try {
    const supabase = createClient()
    // Use a simple SELECT query instead of COUNT()
    const { data, error } = await supabase.from("guidelines_data").select("id").limit(1)

    if (error) {
      console.error("Supabase connection test failed:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Unexpected error during Supabase connection test:", error)
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    }
  }
}

// Function to initialize the database if needed
export async function initializeDatabase() {
  try {
    const supabase = createClient()

    // Check if the table exists
    const { error: checkError } = await supabase.from("guidelines_data").select("id").limit(1)

    if (checkError && checkError.message.includes("does not exist")) {
      // Table doesn't exist, create it
      const { error: createError } = await supabase.rpc("create_guidelines_table")

      if (createError) {
        console.error("Failed to create table via RPC:", createError)

        // Try direct SQL as fallback (this might not work in all environments)
        try {
          const { error: sqlError } = await supabase.from("guidelines_data").insert({
            id: "app_data",
            data: {
              principles: [],
              guidelines: [],
              categories: [],
              elements: [],
            },
            updated_at: new Date().toISOString(),
          })

          if (sqlError && !sqlError.message.includes("already exists")) {
            return { success: false, error: sqlError }
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error : new Error(String(error)),
          }
        }
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Failed to initialize database:", error)
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    }
  }
}
