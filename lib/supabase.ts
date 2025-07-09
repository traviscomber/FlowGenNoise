import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Generation {
  id: string
  created_at: string
  updated_at: string
  dataset: string
  seed: number
  num_samples: number
  noise: number
  color_scheme?: string
  generation_type: "svg" | "ai"
  ai_prompt?: string
  cloudinary_public_id?: string
  cloudinary_url?: string
  image_width?: number
  image_height?: number
  image_format?: string
  image_bytes?: number
  is_upscaled: boolean
  original_generation_id?: string
  scale_factor?: number
  upscale_method?: string
  base64_fallback?: string
  generation_time_ms?: number
}

export async function saveGeneration(
  generation: Omit<Generation, "id" | "created_at" | "updated_at">,
): Promise<Generation> {
  const { data, error } = await supabase.from("generations").insert(generation).select().single()

  if (error) {
    console.error("Error saving generation:", error)
    throw new Error("Failed to save generation to database")
  }

  return data
}

export async function getGenerations(limit = 50): Promise<Generation[]> {
  const { data, error } = await supabase
    .from("generations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching generations:", error)
    throw new Error("Failed to fetch generations from database")
  }

  return data || []
}

export async function getGenerationById(id: string): Promise<Generation | null> {
  const { data, error } = await supabase.from("generations").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching generation:", error)
    return null
  }

  return data
}

export async function updateGeneration(id: string, updates: Partial<Generation>): Promise<Generation> {
  const { data, error } = await supabase.from("generations").update(updates).eq("id", id).select().single()

  if (error) {
    console.error("Error updating generation:", error)
    throw new Error("Failed to update generation in database")
  }

  return data
}
