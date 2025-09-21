import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      artworks: {
        Row: {
          id: string
          created_at: string
          user_id: string
          title: string
          description: string
          image_url: string
          parameters: any
          mode: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          title: string
          description?: string
          image_url: string
          parameters: any
          mode: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          title?: string
          description?: string
          image_url?: string
          parameters?: any
          mode?: string
        }
      }
    }
  }
}
