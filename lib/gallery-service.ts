import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export interface GalleryItem {
  id: string
  title: string
  description?: string
  image_url: string
  svg_content?: string
  upscaled_image_url?: string
  mode: "svg" | "ai"
  dataset: string
  scenario: string
  seed: number
  num_samples: number
  noise_scale: number
  time_step?: number
  custom_prompt?: string
  upscale_method?: string
  tags: string[]
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export interface SaveArtworkData {
  title: string
  description?: string
  image_url: string
  svg_content?: string
  upscaled_image_url?: string
  mode: "svg" | "ai"
  dataset: string
  scenario: string
  seed: number
  num_samples: number
  noise_scale: number
  time_step?: number
  custom_prompt?: string
  upscale_method?: string
  tags?: string[]
}

export interface GalleryStats {
  total: number
  svg: number
  ai: number
  favorites: number
  enhanced: number
}

class GalleryService {
  private handleError(error: any, operation: string) {
    console.error(`Gallery service error (${operation}):`, error)

    // Check if it's a "table does not exist" error
    if (error?.message?.includes("does not exist") || error?.code === "42P01") {
      throw new Error(`Database table not found. Please run the gallery migration script first.`)
    }

    throw new Error(`Failed to ${operation}: ${error?.message || "Unknown error"}`)
  }

  async saveArtwork(data: SaveArtworkData): Promise<GalleryItem> {
    try {
      const { data: result, error } = await supabase
        .from("gallery")
        .insert([
          {
            ...data,
            tags: data.tags || this.generateAutoTags(data),
          },
        ])
        .select()
        .single()

      if (error) throw error
      return result
    } catch (error) {
      this.handleError(error, "save artwork")
      throw error // TypeScript requires this
    }
  }

  async getGalleryItems(
    options: {
      limit?: number
      offset?: number
      search?: string
      mode?: "svg" | "ai"
      favorites?: boolean
      tags?: string[]
      sortBy?: "created_at" | "title"
      sortOrder?: "asc" | "desc"
    } = {},
  ): Promise<GalleryItem[]> {
    try {
      const {
        limit = 20,
        offset = 0,
        search,
        mode,
        favorites,
        tags,
        sortBy = "created_at",
        sortOrder = "desc",
      } = options

      let query = supabase.from("gallery").select("*")

      // Apply filters
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
      }

      if (mode) {
        query = query.eq("mode", mode)
      }

      if (favorites) {
        query = query.eq("is_favorite", true)
      }

      if (tags && tags.length > 0) {
        query = query.overlaps("tags", tags)
      }

      // Apply sorting and pagination
      query = query.order(sortBy, { ascending: sortOrder === "asc" }).range(offset, offset + limit - 1)

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      this.handleError(error, "fetch gallery items")
      return [] // Fallback for UI
    }
  }

  async getGalleryItem(id: string): Promise<GalleryItem | null> {
    try {
      const { data, error } = await supabase.from("gallery").select("*").eq("id", id).single()

      if (error) throw error
      return data
    } catch (error) {
      this.handleError(error, "fetch gallery item")
      return null
    }
  }

  async updateArtwork(id: string, updates: Partial<SaveArtworkData>): Promise<GalleryItem> {
    try {
      const { data, error } = await supabase.from("gallery").update(updates).eq("id", id).select().single()

      if (error) throw error
      return data
    } catch (error) {
      this.handleError(error, "update artwork")
      throw error
    }
  }

  async toggleFavorite(id: string): Promise<GalleryItem> {
    try {
      // First get current state
      const { data: current, error: fetchError } = await supabase
        .from("gallery")
        .select("is_favorite")
        .eq("id", id)
        .single()

      if (fetchError) throw fetchError

      // Toggle the favorite status
      const { data, error } = await supabase
        .from("gallery")
        .update({ is_favorite: !current.is_favorite })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      this.handleError(error, "toggle favorite")
      throw error
    }
  }

  async deleteArtwork(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("gallery").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      this.handleError(error, "delete artwork")
      throw error
    }
  }

  async getStats(): Promise<GalleryStats> {
    try {
      const { data, error } = await supabase.from("gallery").select("mode, is_favorite, upscaled_image_url")

      if (error) throw error

      const stats = {
        total: data?.length || 0,
        svg: data?.filter((item) => item.mode === "svg").length || 0,
        ai: data?.filter((item) => item.mode === "ai").length || 0,
        favorites: data?.filter((item) => item.is_favorite).length || 0,
        enhanced: data?.filter((item) => item.upscaled_image_url).length || 0,
      }

      return stats
    } catch (error) {
      this.handleError(error, "fetch stats")
      return { total: 0, svg: 0, ai: 0, favorites: 0, enhanced: 0 }
    }
  }

  async getPopularTags(): Promise<{ tag: string; count: number }[]> {
    try {
      const { data, error } = await supabase.from("gallery").select("tags")

      if (error) throw error

      // Count tag occurrences
      const tagCounts: Record<string, number> = {}
      data?.forEach((item) => {
        item.tags?.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      })

      // Convert to array and sort by count
      return Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20) // Top 20 tags
    } catch (error) {
      this.handleError(error, "fetch tags")
      return []
    }
  }

  private generateAutoTags(data: SaveArtworkData): string[] {
    const tags = [data.dataset, data.scenario, data.mode]

    if (data.upscaled_image_url) {
      tags.push("enhanced")
    }

    if (data.custom_prompt) {
      tags.push("custom-prompt")
    }

    if (data.num_samples > 3000) {
      tags.push("high-detail")
    }

    return tags
  }
}

export const galleryService = new GalleryService()
