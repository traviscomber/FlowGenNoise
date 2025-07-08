import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/* -------------------------------------------------------------------------- */
/*                          Safe-read environment values                      */
/* -------------------------------------------------------------------------- */

/**
 * Returns the requested env-var or a fallback placeholder (valid enough for
 * Supabase) so local / preview builds never crash. In production, you **must**
 * supply real values via `.env.local` or project settings.
 */
function readEnv(key: string, fallback: string): string {
  const value = process.env[key as keyof NodeJS.ProcessEnv]
  if (!value || value.trim() === "") {
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Missing required environment variable: ${key}`)
    }
    // eslint-disable-next-line no-console
    console.warn(`[supabase] Missing env "${key}". Using fallback "${fallback}" so the build keeps working.`)
    return fallback
  }
  return value
}

function validateUrl(url: string, name: string): string {
  try {
    new URL(url)
    return url
  } catch {
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Invalid URL for ${name}: ${url}`)
    }
    // Return a valid placeholder URL for development
    return "https://placeholder.supabase.co"
  }
}

/* -------------------------------------------------------------------------- */
/*                           Lazy client construction                         */
/* -------------------------------------------------------------------------- */

function initClient(): SupabaseClient {
  const url = validateUrl(
    readEnv("NEXT_PUBLIC_SUPABASE_URL", "https://placeholder.supabase.co"),
    "NEXT_PUBLIC_SUPABASE_URL",
  )
  const anonKey = readEnv(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder",
  )
  return createClient(url, anonKey)
}

/**
 * Singleton holder for the **browser** client.  It’s created the first time any
 * code tries to access a property on `supabase` or calls `getSupabaseClient()`.
 */
let cachedClient: SupabaseClient | null = null

function ensureClient(): SupabaseClient {
  if (!cachedClient) cachedClient = initClient()
  return cachedClient
}

/* -------------------------------------------------------------------------- */
/*                        Public helpers & lazy export                        */
/* -------------------------------------------------------------------------- */

/**
 * The traditional named export many files already import:
 * `import { supabase } from "@/lib/supabase"`
 *
 * It’s a Proxy that lazily instantiates the real client on first property
 * access, so nothing happens at module-evaluation time.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = ensureClient()
    // @ts-expect-error – dynamic prop access
    return client[prop]
  },
}) as SupabaseClient

/**
 * Explicit getter for the browser client if you prefer not to rely on the
 * Proxy export.
 */
export function getSupabaseClient(): SupabaseClient {
  return ensureClient()
}

/**
 * Server-side helper that uses the Service Role key. Safe for edge / server
 * actions, **never** bundle it to the client.
 */
export function getSupabaseServerClient(): SupabaseClient {
  const url = validateUrl(
    readEnv("NEXT_PUBLIC_SUPABASE_URL", "https://placeholder.supabase.co"),
    "NEXT_PUBLIC_SUPABASE_URL",
  )
  const serviceKey = readEnv(
    "SUPABASE_SERVICE_ROLE_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY0NTE5MjgwMCwiZXhwIjoxOTYwNzY4ODAwfQ.placeholder",
  )
  return createClient(url, serviceKey)
}
