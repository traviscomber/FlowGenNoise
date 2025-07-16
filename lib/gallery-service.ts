import { supabase } from "@/lib/supabase"

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

export interface CreateGalleryItem {
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
  is_favorite?: boolean
}

export interface GalleryFilters {
  search?: string
  mode?: "svg" | "ai"
  favorites?: boolean
  tags?: string[]
  dataset?: string
  scenario?: string
}

export interface GalleryStats {
  total: number
  svg_count: number
  ai_count: number
  favorites_count: number
  recent_count: number
}

class GalleryService {
  private supabase = supabase

  async saveArtwork(artwork: CreateGalleryItem): Promise<GalleryItem | null> {
    try {
      const { data, error } = await this.supabase.from("gallery").insert([artwork]).select().single()

      if (error) {
        console.error("Error saving artwork:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error saving artwork:", error)
      return null
    }
  }

  async getArtworks(
    filters: GalleryFilters = {},
    limit = 20,
    offset = 0,
    sortBy = "created_at",
    sortOrder: "asc" | "desc" = "desc",
  ): Promise<GalleryItem[]> {
    try {
      let query = this.supabase
        .from("gallery")
        .select("*")
        .order(sortBy, { ascending: sortOrder === "asc" })
        .range(offset, offset + limit - 1)

      // Apply filters
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      if (filters.mode) {
        query = query.eq("mode", filters.mode)
      }

      if (filters.favorites) {
        query = query.eq("is_favorite", true)
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps("tags", filters.tags)
      }

      if (filters.dataset) {
        query = query.eq("dataset", filters.dataset)
      }

      if (filters.scenario) {
        query = query.eq("scenario", filters.scenario)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching artworks:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error fetching artworks:", error)
      return []
    }
  }

  async getArtworkById(id: string): Promise<GalleryItem | null> {
    try {
      const { data, error } = await this.supabase.from("gallery").select("*").eq("id", id).single()

      if (error) {
        console.error("Error fetching artwork:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error fetching artwork:", error)
      return null
    }
  }

  async updateArtwork(id: string, updates: Partial<CreateGalleryItem>): Promise<GalleryItem | null> {
    try {
      const { data, error } = await this.supabase.from("gallery").update(updates).eq("id", id).select().single()

      if (error) {
        console.error("Error updating artwork:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error updating artwork:", error)
      return null
    }
  }

  async deleteArtwork(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.from("gallery").delete().eq("id", id)

      if (error) {
        console.error("Error deleting artwork:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error deleting artwork:", error)
      return false
    }
  }

  async toggleFavorite(id: string): Promise<boolean> {
    try {
      // First get the current favorite status
      const { data: current, error: fetchError } = await this.supabase
        .from("gallery")
        .select("is_favorite")
        .eq("id", id)
        .single()

      if (fetchError) {
        console.error("Error fetching current favorite status:", fetchError)
        return false
      }

      // Toggle the favorite status
      const { error: updateError } = await this.supabase
        .from("gallery")
        .update({ is_favorite: !current.is_favorite })
        .eq("id", id)

      if (updateError) {
        console.error("Error toggling favorite:", updateError)
        return false
      }

      return true
    } catch (error) {
      console.error("Error toggling favorite:", error)
      return false
    }
  }

  async getStats(): Promise<GalleryStats> {
    try {
      const { data, error } = await this.supabase.from("gallery").select("mode, is_favorite, created_at")

      if (error) {
        console.error("Error fetching stats:", error)
        return {
          total: 0,
          svg_count: 0,
          ai_count: 0,
          favorites_count: 0,
          recent_count: 0,
        }
      }

      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      const stats = data.reduce(
        (acc, item) => {
          acc.total++
          if (item.mode === "svg") acc.svg_count++
          if (item.mode === "ai") acc.ai_count++
          if (item.is_favorite) acc.favorites_count++
          if (new Date(item.created_at) > weekAgo) acc.recent_count++
          return acc
        },
        {
          total: 0,
          svg_count: 0,
          ai_count: 0,
          favorites_count: 0,
          recent_count: 0,
        },
      )

      return stats
    } catch (error) {
      console.error("Error fetching stats:", error)
      return {
        total: 0,
        svg_count: 0,
        ai_count: 0,
        favorites_count: 0,
        recent_count: 0,
      }
    }
  }

  async getPopularTags(limit = 10): Promise<Array<{ tag: string; count: number }>> {
    try {
      const { data, error } = await this.supabase.from("gallery").select("tags")

      if (error) {
        console.error("Error fetching tags:", error)
        return []
      }

      // Count tag occurrences
      const tagCounts: Record<string, number> = {}
      data.forEach((item) => {
        if (item.tags && Array.isArray(item.tags)) {
          item.tags.forEach((tag) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1
          })
        }
      })

      // Sort by count and return top tags
      return Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
    } catch (error) {
      console.error("Error fetching popular tags:", error)
      return []
    }
  }

  async getUniqueDatasets(): Promise<string[]> {
    try {
      const { data, error } = await this.supabase.from("gallery").select("dataset").order("dataset")

      if (error) {
        console.error("Error fetching datasets:", error)
        return []
      }

      const uniqueDatasets = [...new Set(data.map((item) => item.dataset))]
      return uniqueDatasets
    } catch (error) {
      console.error("Error fetching datasets:", error)
      return []
    }
  }

  async getUniqueScenarios(): Promise<string[]> {
    try {
      const { data, error } = await this.supabase.from("gallery").select("scenario").order("scenario")

      if (error) {
        console.error("Error fetching scenarios:", error)
        return []
      }

      const uniqueScenarios = [...new Set(data.map((item) => item.scenario))]
      return uniqueScenarios
    } catch (error) {
      console.error("Error fetching scenarios:", error)
      return []
    }
  }
}

export const galleryService = new GalleryService()
