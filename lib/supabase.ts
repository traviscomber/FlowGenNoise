"use client"

/**
 * Centralised Supabase client + tiny auth helpers.
 * Works both in the browser and in server actions (for server, create a new
 * client with the Service Role key instead).
 */

import { createClient } from "@supabase/supabase-js"
import { useEffect, useState } from "react"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ---- Singleton client ------------------------------------------------------

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/* -------------------------------------------------------------------------- */
/*                                Auth helpers                               */
/* -------------------------------------------------------------------------- */

/** Simple wrapper around `supabase.auth.signOut()` so it can be imported anywhere. */
export async function signOut() {
  await supabase.auth.signOut()
}

/**
 * React hook that returns the current user object and keeps it in-sync
 * with auth state changes.
 *
 * ```tsx
 * const user = useUser()
 * if (!user) return <LoginScreen />
 * ```
 */
export function useUser() {
  const [user, setUser] = useState<Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"]>(null)

  useEffect(() => {
    // Fetch the user once on mount
    supabase.auth.getUser().then(({ data }) => setUser(data.user))

    // Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null))

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  return user
}
