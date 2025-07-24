import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are not set. Supabase features will be disabled.",
  )
  // Return null or throw an error if Supabase is critical for the app
  // For now, we'll allow the app to run without it, but features will be disabled.
}

// Client-side Supabase client (singleton pattern)
let supabaseClientInstance: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null // Supabase not configured
  }
  if (!supabaseClientInstance) {
    supabaseClientInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseClientInstance
}

// Server-side Supabase client (for API routes, server actions)
// This client is created directly as it's typically used in a serverless function
// context where a new instance per request is acceptable.
export const supabaseServer = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null
