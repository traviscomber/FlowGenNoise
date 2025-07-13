import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase URL or Anon Key environment variables.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
          }
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
          }
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
          }
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
