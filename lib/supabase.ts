import { createClient } from "@supabase/supabase-js"

// Client-side Supabase client (for public data access)
// Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

// Server-side Supabase client (for secure operations, e.g., in API routes or Server Actions)
// Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env.local
const serviceRoleSupabaseUrl = process.env.SUPABASE_URL
const serviceRoleSupabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin =
  serviceRoleSupabaseUrl && serviceRoleSupabaseKey ? createClient(serviceRoleSupabaseUrl, serviceRoleSupabaseKey) : null

// You can add more specific client instances or helper functions here as needed.
