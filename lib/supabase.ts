import { createClient } from "@supabase/supabase-js"

// Your actual Supabase credentials
const supabaseUrl = "https://ngtfnkcszgnmpddfgdst.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndGZua2NzemdubXBkZGZnZHN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4OTUzNTcsImV4cCI6MjA2NzQ3MTM1N30.Gg-hbKTbSo_M1cUVkwz2gqp1tyyFtqp5UBTG_WI-8bg"

// Validate environment variables
function validateSupabaseConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase configuration")
  }

  try {
    new URL(supabaseUrl)
  } catch {
    throw new Error("Invalid Supabase URL")
  }
}

// Initialize Supabase client with error handling
let supabaseClient: ReturnType<typeof createClient> | null = null

function initializeSupabase() {
  if (!supabaseClient) {
    try {
      validateSupabaseConfig()
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
        db: {
          schema: "public",
        },
        global: {
          headers: {
            "X-Client-Info": "flowsketch-marketplace",
          },
        },
      })
    } catch (error) {
      console.error("Failed to initialize Supabase client:", error)
      throw error
    }
  }
  return supabaseClient
}

// Export the client
export const supabase = initializeSupabase()

// Server-side client for admin operations
export function getSupabaseServerClient() {
  return supabase
}

// Test connection function
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .limit(1)

    if (error) {
      console.error("Supabase connection test failed:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Supabase connection test error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Health check function
export async function checkDatabaseHealth() {
  try {
    const { data, error } = await supabase.rpc("get_table_columns", {
      tbl_name: "artworks",
    })

    if (error) {
      return { healthy: false, error: error.message }
    }

    return { healthy: true, tablesFound: data?.length || 0 }
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
