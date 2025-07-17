import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * We only create the Supabase client if the public URL and
 * anonymous key are present. This avoids the
 * “supabaseKey is required” runtime exception.
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let _client: SupabaseClient | null = null
function getClient(): SupabaseClient | null {
  if (_client) return _client
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn("[marketplace-db] Supabase env vars not found – running in anonymous-only mode.")
    return null
  }
  _client = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  })
  return _client
}

/**
 * Looks up the profile row for the supplied `userId`.
 * Returns `null` when:
 *  • no userId (anonymous visit)
 *  • Supabase not configured
 *  • profile missing or duplicated
 */
export async function getCurrentUser(userId?: string | null): Promise<Record<string, unknown> | null> {
  if (!userId) return null

  const supabase = getClient()
  if (!supabase) return null

  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle()

  if (error) {
    console.error("[marketplace-db] getCurrentUser:", error)
    return null
  }
  return data ?? null
}
