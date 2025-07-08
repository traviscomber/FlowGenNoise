import { createClient } from "@supabase/supabase-js"

// Environment variables with proper validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch (error) {
  throw new Error(`Invalid NEXT_PUBLIC_SUPABASE_URL format: ${supabaseUrl}`)
}

// Create the main Supabase client for client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Create server-side client with service role key (for admin operations)
export function getSupabaseServerClient() {
  if (!supabaseServiceKey) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY not found, using anon key")
    return createClient(supabaseUrl, supabaseAnonKey)
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Create admin client for database operations
export function getSupabaseAdminClient() {
  if (!supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin operations")
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Export types
export type { Database } from "./database.types"
