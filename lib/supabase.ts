import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase URL or Anon Key environment variables.")
}

// Client-side Supabase client (singleton pattern)
let supabaseClientInstance: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClientInstance) {
    supabaseClientInstance = createClient(supabaseUrl!, supabaseAnonKey!)
  }
  return supabaseClientInstance
}

// Server-side Supabase client (for API routes, server actions)
// This client should use the service role key for elevated privileges if needed,
// but for typical user-scoped operations, the anon key is sufficient.
// For server actions/route handlers, you might want to create a new client
// per request to ensure proper session handling, or use a pattern like:
// import { createServerClient } from '@supabase/ssr'
// export const createServerSupabaseClient = (cookies) => createServerClient(supabaseUrl, supabaseAnonKey, { cookies })
// For simplicity here, we'll just export a direct client for server-side use.
export const supabaseServer = createClient(supabaseUrl, supabaseAnonKey)
