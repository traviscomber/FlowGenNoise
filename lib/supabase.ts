import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase environment variables are not set. Supabase client will not be initialized.")
}

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null
;("use client")
import { useEffect, useState } from "react"
import type { Session } from "@supabase/supabase-js"

export type Database = {
  public: {
    Tables: {
      gallery_images: {
        Row: {
          id: string
          user_id: string
          image_url: string
          thumbnail_url: string | null
          metadata: {
            dataset: string
            scenario: string
            colorScheme: string
            seed: number
            samples: number
            noise: number
            generationMode: "svg" | "ai"
            createdAt: number
            filename: string
            fileSize: number
            cloudStored: boolean
            aiPrompt?: string
            aiDescription?: string
            scenarioThreshold?: number
            aestheticScore?: {
              score: number
              rating: string
              method: string
            }
            uploadedAt?: number
            originalSize?: number
          }
          aesthetic_score: {
            score: number
            rating: string
            method: string
          } | null
          is_favorite: boolean
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          image_url: string
          thumbnail_url?: string | null
          metadata: {
            dataset: string
            scenario: string
            colorScheme: string
            seed: number
            samples: number
            noise: number
            generationMode: "svg" | "ai"
            createdAt: number
            filename: string
            fileSize: number
            cloudStored: boolean
            aiPrompt?: string
            aiDescription?: string
            scenarioThreshold?: number
            aestheticScore?: {
              score: number
              rating: string
              method: string
            }
            uploadedAt?: number
            originalSize?: number
          }
          aesthetic_score?: {
            score: number
            rating: string
            method: string
          } | null
          is_favorite?: boolean
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          image_url?: string
          thumbnail_url?: string | null
          metadata?: {
            dataset: string
            scenario: string
            colorScheme: string
            seed: number
            samples: number
            noise: number
            generationMode: "svg" | "ai"
            createdAt: number
            filename: string
            fileSize: number
            cloudStored: boolean
            aiPrompt?: string
            aiDescription?: string
            scenarioThreshold?: number
            aestheticScore?: {
              score: number
              rating: string
              method: string
            }
            uploadedAt?: number
            originalSize?: number
          }
          aesthetic_score?: {
            score: number
            rating: string
            method: string
          } | null
          is_favorite?: boolean
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          sync_enabled: boolean
          storage_quota: number
          storage_used: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          sync_enabled?: boolean
          storage_quota?: number
          storage_used?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          sync_enabled?: boolean
          storage_quota?: number
          storage_used?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

/**
 * React hook that returns the current Supabase user (or `null` when signed-out).
 * It automatically listens for auth state changes.
 */
export function useUser() {
  const [user, setUser] = useState<Session["user"] | null>()

  useEffect(() => {
    if (!supabase) {
      setUser(null)
      return
    }

    // Get the initial session
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })

    // Subscribe to future auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return user
}

/**
 * Convenience helper for signing the current user out.
 */
export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
}
