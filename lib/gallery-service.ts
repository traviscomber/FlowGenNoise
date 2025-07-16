import { createClient } from "@supabase/supabase-js"
import { supabaseUrl, supabaseAnonKey } from "./supabaseConfig" // Assuming supabaseUrl and supabaseAnonKey are defined in a separate file

// Define the structure for an artwork in the gallery
export interface GalleryArtwork {
  id: string
  name: string
  description: string
  imageUrl: string
  originalPrompt: string
  dataset: string
  scenario: string
  created_at: string // ISO timestamp
}

// Initialize Supabase client
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

export interface ArtworkData {
  id?: string
  title: string
  description?: string
  imageUrl: string
  upscaledImageUrl?: string
  svgContent?: string
  mode: "flow" | "ai"
  dataset: string
  scenario: string
  seed: number
  numSamples?: number
  noiseScale?: number
  timeStep?: number
  customPrompt?: string
  upscaleMethod?: string
  tags: string[]
  isFavorite: boolean
  createdAt?: string
  updatedAt?: string
}

export interface GalleryFilters {
  search?: string
  mode?: "flow" | "ai" | "all"
  dataset?: string
  scenario?: string
  isFavorite?: boolean
  tags?: string[]
  sortBy?: "created_at" | "title" | "dataset" | "scenario"
  sortOrder?: "asc" | "desc"
  limit?: number
  offset?: number
}

export interface GalleryStats {
  totalArtworks: number
  flowArtworks: number
  aiArtworks: number
  favoriteArtworks: number
  totalDatasets: number
  totalScenarios: number
  popularDatasets: Array<{ dataset: string; count: number }>
  popularScenarios: Array<{ scenario: string; count: number }>
}

export class GalleryService {
  private static readonly TABLE_NAME = "artworks"

  /**
   * Saves a new artwork to the Supabase gallery.
   * @param artwork The artwork data to save (excluding id and created_at).
   * @returns The saved artwork with its generated id and created_at timestamp.
   * @throws Error if Supabase client is not initialized or save fails.
   */
  static async saveArtwork(artwork: Omit<GalleryArtwork, "id" | "created_at">): Promise<GalleryArtwork> {
    if (!supabase) {
      throw new Error("Supabase client not initialized. Cannot save artwork.")
    }

    const { data, error } = await supabase.from(this.TABLE_NAME).insert([artwork]).select().single()

    if (error) {
      console.error("Supabase save error:", error)
      throw new Error(`Failed to save artwork: ${error.message}`)
    }

    return data as GalleryArtwork
  }

  /**
   * Retrieves all artworks from the Supabase gallery, ordered by creation date.
   * @returns An array of GalleryArtwork objects.
   * @throws Error if Supabase client is not initialized or fetch fails.
   */
  static async getArtworks(): Promise<GalleryArtwork[]> {
    if (!supabase) {
      console.warn("Supabase client not initialized. Returning empty array for artworks.")
      return []
    }

    const { data, error } = await supabase.from(this.TABLE_NAME).select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase fetch error:", error)
      throw new Error(`Failed to fetch artworks: ${error.message}`)
    }

    return data as GalleryArtwork[]
  }

  /**
   * Deletes an artwork from the gallery by its ID.
   * @param id The ID of the artwork to delete.
   * @throws Error if Supabase client is not initialized or delete fails.
   */
  static async deleteArtwork(id: string): Promise<void> {
    if (!supabase) {
      throw new Error("Supabase client not initialized. Cannot delete artwork.")
    }

    const { error } = await supabase.from(this.TABLE_NAME).delete().eq("id", id)

    if (error) {
      console.error("Supabase delete error:", error)
      throw new Error(`Failed to delete artwork: ${error.message}`)
    }
  }

  async getArtworkById(id: string): Promise<ArtworkData | null> {
    try {
      const { data, error } = await supabase.from("gallery").select("*").eq("id", id).single()

      if (error) {
        console.error("Error fetching artwork:", error)
        return null
      }

      return this.mapDatabaseToArtwork(data)
    } catch (error) {
      console.error("Error fetching artwork:", error)
      return null
    }
  }

  async updateArtwork(id: string, updates: Partial<ArtworkData>): Promise<ArtworkData | null> {
    try {
      const updateData: any = {}

      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.tags !== undefined) updateData.tags = updates.tags
      if (updates.isFavorite !== undefined) updateData.is_favorite = updates.isFavorite

      const { data, error } = await supabase.from("gallery").update(updateData).eq("id", id).select().single()

      if (error) {
        console.error("Error updating artwork:", error)
        return null
      }

      return this.mapDatabaseToArtwork(data)
    } catch (error) {
      console.error("Error updating artwork:", error)
      return null
    }
  }

  async toggleFavorite(id: string): Promise<boolean> {
    try {
      // First get current favorite status
      const { data: current, error: fetchError } = await supabase
        .from("gallery")
        .select("is_favorite")
        .eq("id", id)
        .single()

      if (fetchError) {
        console.error("Error fetching current favorite status:", fetchError)
        return false
      }

      // Toggle the favorite status
      const { error: updateError } = await supabase
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

  async getGalleryStats(): Promise<GalleryStats> {
    try {
      const { data, error } = await supabase.from("gallery").select("mode, dataset, scenario, is_favorite")

      if (error) {
        console.error("Error fetching gallery stats:", error)
        return this.getEmptyStats()
      }

      const stats: GalleryStats = {
        totalArtworks: data.length,
        flowArtworks: data.filter((item) => item.mode === "flow").length,
        aiArtworks: data.filter((item) => item.mode === "ai").length,
        favoriteArtworks: data.filter((item) => item.is_favorite).length,
        totalDatasets: new Set(data.map((item) => item.dataset)).size,
        totalScenarios: new Set(data.map((item) => item.scenario)).size,
        popularDatasets: this.getPopularItems(data, "dataset"),
        popularScenarios: this.getPopularItems(data, "scenario"),
      }

      return stats
    } catch (error) {
      console.error("Error calculating gallery stats:", error)
      return this.getEmptyStats()
    }
  }

  async getPopularTags(limit = 10): Promise<Array<{ tag: string; count: number }>> {
    try {
      const { data, error } = await supabase.from("gallery").select("tags")

      if (error) {
        console.error("Error fetching tags:", error)
        return []
      }

      const tagCounts: Record<string, number> = {}

      data.forEach((item) => {
        if (item.tags && Array.isArray(item.tags)) {
          item.tags.forEach((tag: string) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1
          })
        }
      })

      return Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
    } catch (error) {
      console.error("Error fetching popular tags:", error)
      return []
    }
  }

  private mapDatabaseToArtwork(data: any): ArtworkData {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      imageUrl: data.image_url,
      svgContent: data.svg_content,
      upscaledImageUrl: data.upscaled_image_url,
      mode: data.mode,
      dataset: data.dataset,
      scenario: data.scenario,
      seed: data.seed,
      numSamples: data.num_samples,
      noiseScale: data.noise_scale,
      timeStep: data.time_step,
      customPrompt: data.custom_prompt,
      upscaleMethod: data.upscale_method,
      tags: data.tags || [],
      isFavorite: data.is_favorite,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  }

  private getPopularItems(data: any[], field: string): Array<{ [key: string]: string | number }> {
    const counts: Record<string, number> = {}

    data.forEach((item) => {
      const value = item[field]
      if (value) {
        counts[value] = (counts[value] || 0) + 1
      }
    })

    return Object.entries(counts)
      .map(([key, count]) => ({ [field]: key, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  private getEmptyStats(): GalleryStats {
    return {
      totalArtworks: 0,
      flowArtworks: 0,
      aiArtworks: 0,
      favoriteArtworks: 0,
      totalDatasets: 0,
      totalScenarios: 0,
      popularDatasets: [],
      popularScenarios: [],
    }
  }
}
