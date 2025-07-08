import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/* -------------------------------------------------------------------------- */
/*                               Env helpers                                  */
/* -------------------------------------------------------------------------- */

function readEnv(key: string, fatal = true): string {
  const val = typeof process !== "undefined" ? (process.env as Record<string, string | undefined>)[key] : undefined

  if (!val) {
    if (fatal) {
      /* eslint-disable no-console */
      console.error(
        `[supabase] Missing required env "${key}". Add it to .env.local or Vercel → Settings → Environment Variables.`,
      )
      throw new Error(`Missing environment variable: ${key}`)
    }
    return ""
  }

  return val
}

/* -------------------------------------------------------------------------- */
/*                        Lazy, singleton client loader                       */
/* -------------------------------------------------------------------------- */

let cachedClient: SupabaseClient | null = null

function initClient(): SupabaseClient {
  const url = readEnv("NEXT_PUBLIC_SUPABASE_URL")
  const anonKey = readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

  // Basic URL sanity-check so we fail early in dev if it’s malformed
  try {
    // eslint-disable-next-line no-new
    new URL(url)
  } catch {
    throw new Error(`[supabase] "${url}" is not a valid URL. Check NEXT_PUBLIC_SUPABASE_URL.`)
  }

  return createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
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
  const url = readEnv("NEXT_PUBLIC_SUPABASE_URL")
  const serviceKey = readEnv("SUPABASE_SERVICE_ROLE_KEY")
  return createClient(url, serviceKey)
}
