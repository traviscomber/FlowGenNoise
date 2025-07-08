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
/*                             Default Browser Client                         */
/* -------------------------------------------------------------------------- */

export const supabase = createClient(
  safeEnv("NEXT_PUBLIC_SUPABASE_URL", "https://preview-project.supabase.co"),
  safeEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "public-anon-key"),
)

/* -------------------------------------------------------------------------- */
/*                               Browser Client                               */
/* -------------------------------------------------------------------------- */

export function getSupabaseBrowserClient() {
  return supabase
}

/* -------------------------------------------------------------------------- */
/*                               Server Client                                */
/* -------------------------------------------------------------------------- */

export function getSupabaseServerClient() {
  const supabaseUrl = safeEnv("NEXT_PUBLIC_SUPABASE_URL", "https://preview-project.supabase.co")
  const serviceRoleKey = safeEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-key-placeholder")
  return createClient(supabaseUrl, serviceRoleKey)
}
