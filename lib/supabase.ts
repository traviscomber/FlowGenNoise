import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing. Please check your environment variables.")
  // Fallback for local development if keys are missing, though functionality will be limited.
  // In a real application, you might want to throw an error or handle this more gracefully.
}

export const supabase = createClient(supabaseUrl || "http://localhost:54321", supabaseAnonKey || "YOUR_ANON_KEY_HERE")
