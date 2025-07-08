import { createClient } from "@supabase/supabase-js"

// Your actual Supabase credentials
const supabaseUrl = "https://ngtfnkcszgnmpddfgdst.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndGZua2NzemdubXBkZGZnZHN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4OTUzNTcsImV4cCI6MjA2NzQ3MTM1N30.Gg-hbKTbSo_M1cUVkwz2gqp1tyyFtqp5UBTG_WI-8bg"

// Validate URL format
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Create and validate the Supabase client
function createSupabaseClient() {
  // Validate URL
  if (!isValidUrl(supabaseUrl)) {
    console.error("[Supabase] Invalid URL:", supabaseUrl)
    throw new Error(`Invalid Supabase URL: ${supabaseUrl}`)
  }

  // Validate anon key
  if (!supabaseAnonKey || supabaseAnonKey.length < 10) {
    console.error("[Supabase] Invalid anon key")
    throw new Error("Invalid Supabase anon key")
  }

  console.log("[Supabase] Initializing client with URL:", supabaseUrl)

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
}

// Create the client instance
export const supabase = createSupabaseClient()

// Alternative getter function for explicit access
export function getSupabaseClient() {
  return supabase
}

// Test connection function
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from("artworks").select("count").limit(1)

    if (error) {
      console.error("[Supabase] Connection test failed:", error.message)
      return false
    }

    console.log("[Supabase] Connection test successful")
    return true
  } catch (error) {
    console.error("[Supabase] Connection test error:", error)
    return false
  }
}
