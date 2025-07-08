import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/* -------------------------------------------------------------------------- */
/*                        Your actual Supabase credentials                    */
/* -------------------------------------------------------------------------- */

const SUPABASE_URL = "https://ngtfnkcszgnmpddfgdst.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndGZua2NzemdubXBkZGZnZHN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4OTUzNTcsImV4cCI6MjA2NzQ3MTM1N30.Gg-hbKTbSo_M1cUVkwz2gqp1tyyFtqp5UBTG_WI-8bg"

/* -------------------------------------------------------------------------- */
/*                        Lazy, singleton client loader                       */
/* -------------------------------------------------------------------------- */

let cachedClient: SupabaseClient | null = null

function initClient(): SupabaseClient {
  // Use hardcoded values first, then fall back to env vars
  const url = SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error("[supabase] Missing Supabase credentials")
  }

  // Basic URL sanity-check
  try {
    new URL(url)
  } catch {
    throw new Error(`[supabase] "${url}" is not a valid URL`)
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    db: {
      schema: "public",
    },
  })
}

/**
 * Returns a memoised browser client.
 * Safe to call in React components, Server Actions, Route Handlers etc.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!cachedClient) cachedClient = initClient()
  return cachedClient
}

/* -------------------------------------------------------------------------- */
/*                    Classic named export used around the app                */
/* -------------------------------------------------------------------------- */

/**
 * Many files do `import { supabase } from "@/lib/supabase"`.
 * We keep that API by exporting a Proxy that delegates property access to the
 * lazily-initialised real client, ensuring zero work at module evaluation time.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_t, prop) {
    const client = getSupabaseClient()
    // @ts-expect-error – dynamic access is fine here
    return client[prop]
  },
}) as SupabaseClient

/* -------------------------------------------------------------------------- */
/*                        Optional server-side admin client                    */
/* -------------------------------------------------------------------------- */

/**
 * ONLY call this from the server (e.g. Server Actions / Route Handlers).
 * Uses the Service-Role key so **never** expose it to the browser.
 */
export function getSupabaseServerClient(): SupabaseClient {
  const url = SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY

  if (!url || !serviceKey) {
    throw new Error("[supabase] Missing server credentials")
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/* -------------------------------------------------------------------------- */
/*                              Test functions                                */
/* -------------------------------------------------------------------------- */

export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from("artworks").select("id").limit(1)

    if (error) {
      console.error("Supabase connection test failed:", error)
      return { success: false, error: error.message }
    }

    console.log("✅ Supabase connection successful")
    return { success: true, data }
  } catch (error) {
    console.error("Supabase connection error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
