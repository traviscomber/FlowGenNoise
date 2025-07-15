"use client"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { useEffect, useState } from "react"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Singleton – ensures we reuse the same Supabase instance everywhere
let _client: SupabaseClient | null = null

export function supabase(): SupabaseClient {
  if (!_client) {
    _client = createClient(supabaseUrl, supabaseAnonKey)
  }
  return _client
}

export async function signOut() {
  await supabase().auth.signOut()
}

export function useUser() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Initial fetch
    supabase()
      .auth.getUser()
      .then(({ data }) => setUser(data.user ?? null))

    // Listen for future auth events
    const {
      data: { subscription },
    } = supabase().auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return user
}
