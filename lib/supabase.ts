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

// Create the client with validation
function createSupabaseClient() {
  if (!isValidUrl(supabaseUrl)) {
    console.error("[Supabase] Invalid URL:", supabaseUrl)
    throw new Error("Invalid Supabase URL configuration")
  }

  if (!supabaseAnonKey || supabaseAnonKey.length < 10) {
    console.error("[Supabase] Invalid or missing anon key")
    throw new Error("Invalid Supabase anon key configuration")
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

// Export the client instance
export const supabase = createSupabaseClient()

// Also export a getter function for explicit access
export function getSupabaseClient() {
  return supabase
}

// Export URL and key for other utilities that might need them
export { supabaseUrl, supabaseAnonKey }
