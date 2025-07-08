import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * Singleton pattern - ensures we don’t create more than one client
 * on the client side.  On the server each request gets its own.
 */
let supabaseClient: SupabaseClient | null = null

function getEnv(name: string) {
  if (typeof process === "undefined") return ""
  return (process.env as Record<string, string | undefined>)[name] ?? ""
}

export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) return supabaseClient

  const url = getEnv("NEXT_PUBLIC_SUPABASE_URL")
  const anon = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

  if (!url || !anon) {
    /* eslint-disable no-console */
    console.error("[Supabase] Missing env vars. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.")
    throw new Error("Supabase environment variables are not configured")
  }

  try {
    // basic sanity check for URL format
    // throws if malformed (matches browser’s URL constructor behaviour)
    new URL(url)
  } catch {
    console.error("[Supabase] Invalid URL provided:", url)
    throw new Error("Invalid Supabase URL")
  }

  supabaseClient = createClient(url, anon, {
    auth: { persistSession: true, autoRefreshToken: true },
  })

  return supabaseClient
}
