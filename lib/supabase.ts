// This file was previously truncated. Here's its full content.
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Ensure Supabase client is only created once (singleton pattern)
let cachedSupabase: ReturnType<typeof createClient> | null = null

export const supabase = (() => {
  if (cachedSupabase) {
    return cachedSupabase
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "Supabase environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are not set. Supabase features will be disabled.",
    )
    return null
  }

  cachedSupabase = createClient(supabaseUrl, supabaseAnonKey)
  return cachedSupabase
})()
