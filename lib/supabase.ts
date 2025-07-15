"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ---------------------------------------------------------------------------
// Hook - returns the current Supabase user and keeps it in sync client-side.
export function useUser() {
  const [user, setUser] = useState<import("@supabase/supabase-js").User | null>(null)

  useEffect(() => {
    // Initial fetch (wrapped in an IIFE because getUser returns a Promise)
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user ?? null)
    })()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription?.unsubscribe()
  }, [])

  return user
}

// Simple wrapper so components can call signOut() directly.
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
