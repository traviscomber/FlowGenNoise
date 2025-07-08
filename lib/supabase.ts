import { createClient } from "@supabase/supabase-js"

// Your actual Supabase credentials
const supabaseUrl = "https://ngtfnkcszgnmpddfgdst.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndGZua2NzemdubXBkZGZnZHN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4OTUzNTcsImV4cCI6MjA2NzQ3MTM1N30.Gg-hbKTbSo_M1cUVkwz2gqp1tyyFtqp5UBTG_WI-8bg"

// Create the main Supabase client for client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Create server-side client with service role key (for admin operations)
export function getSupabaseServerClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceKey) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY not found, using anon key")
    return createClient(supabaseUrl, supabaseAnonKey)
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Create admin client for database operations
export function getSupabaseAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin operations")
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Test connection function
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from("artworks").select("count").limit(1)

    if (error) {
      console.error("Supabase connection error:", error)
      return false
    }

    console.log("Supabase connection successful")
    return true
  } catch (err) {
    console.error("Supabase connection failed:", err)
    return false
  }
}
