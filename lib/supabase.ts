import { createClient } from "@supabase/supabase-js"

/**
 * Reads an env var (string | undefined) and, if it’s missing, returns a
 * harmless placeholder so the browser preview doesn’t crash.
 */
function safeEnv(key: string, fallback: string): string {
  const value = process.env[key as keyof NodeJS.ProcessEnv]
  if (!value || value.trim() === "") {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(
        `[supabase] Environment variable "${key}" is missing – ` + `using "${fallback}" so the preview keeps working.`,
      )
    }
    return fallback
  }
  return value
}

/* -------------------------------------------------------------------------- */
/*                               Browser Client                               */
/* -------------------------------------------------------------------------- */

/**
 * We keep the singleton inside a closure so we don’t try to construct it
 * before the env vars are evaluated / inlined on the client bundle.
 */
let browserClient: ReturnType<typeof createClient> | null = null

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    const supabaseUrl = safeEnv("NEXT_PUBLIC_SUPABASE_URL", "https://preview-project.supabase.co")
    const supabaseAnonKey = safeEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "public-anon-key")

    browserClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  return browserClient
}

/* -------------------------------------------------------------------------- */
/*                               Server Client                                */
/* -------------------------------------------------------------------------- */

export function getSupabaseServerClient() {
  const supabaseUrl = safeEnv("NEXT_PUBLIC_SUPABASE_URL", "https://preview-project.supabase.co")
  const serviceRoleKey = safeEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-key-placeholder")
  return createClient(supabaseUrl, serviceRoleKey)
}
