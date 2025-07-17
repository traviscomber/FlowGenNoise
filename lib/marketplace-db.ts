import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

/**
 * Returns the single user row for the current JWT.
 * If the query yields 0 **or** >1 rows we gracefully return `null`
 * instead of throwing – preventing “JSON object requested …” errors.
 */
export async function getCurrentUser(token?: string) {
  // Nothing to do if we have no auth (anonymous access path)
  if (!token) return null

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", token)
    .limit(2) // keep the payload tiny & detect duplicates
    .maybeSingle() // <- avoids the JSON object error

  if (error) {
    console.error("[marketplace-db] getCurrentUser error ⇒", error)
    return null
  }

  return data ?? null
}
