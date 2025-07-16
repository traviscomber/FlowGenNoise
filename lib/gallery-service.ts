import { supabase } from "./supabase"

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
  mode?: "flow" | "ai"
  dataset?: string
  scenario?: string
  isFavorite?: boolean
  tags?: string[]
}

export interface GalleryStats {
  totalArtworks: number
  flowArtworks: number
  aiArtworks: number
  favoriteArtworks: number
  totalDatasets: number
  totalScenarios: number
}

export class GalleryService {
  static async saveArtwork(artwork: Omit<ArtworkData, "id" | "createdAt" | "updatedAt">): Promise<ArtworkData> {
    try {
      // Ensure tags is always an array of strings
      const tagsArray = Array.isArray(artwork.tags) ? artwork.tags : []

      const { data, error } = await supabase
        .from("gallery")
        .insert({
          title: artwork.title,
          description: artwork.description,
          image_url: artwork.imageUrl,
          upscaled_image_url: artwork.upscaledImageUrl,
          svg_content: artwork.svgContent,
          mode: artwork.mode,
          dataset: artwork.dataset,
          scenario: artwork.scenario,
          seed: artwork.seed,
          num_samples: artwork.numSamples,
          noise_scale: artwork.noiseScale,
          time_step: artwork.timeStep,
          custom_prompt: artwork.customPrompt,
          upscale_method: artwork.upscaleMethod,
          tags: tagsArray,
          is_favorite: artwork.isFavorite,
        })
        .select()
        .single()

      if (error) {
        console.error("Supabase error:", error)
        throw new Error(`Failed to save artwork: ${error.message}`)
      }

      return this.mapDatabaseToArtwork(data)
    } catch (error) {
      console.error("Error saving artwork:", error)
      throw error
    }
  }

  static async getArtworks(filters: GalleryFilters = {}, limit = 50, offset = 0): Promise<ArtworkData[]> {
    try {
      let query = supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1)

      // Apply filters
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      if (filters.mode) {
        query = query.eq("mode", filters.mode)
      }

      if (filters.dataset) {
        query = query.eq("dataset", filters.dataset)
      }

      if (filters.scenario) {
        query = query.eq("scenario", filters.scenario)
      }

      if (filters.isFavorite !== undefined) {
        query = query.eq("is_favorite", filters.isFavorite)
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps("tags", filters.tags)
      }

      const { data, error } = await query

      if (error) {
        console.error("Supabase error:", error)
        throw new Error(`Failed to fetch artworks: ${error.message}`)
      }

      return (data || []).map(this.mapDatabaseToArtwork)
    } catch (error) {
      console.error("Error fetching artworks:", error)
      return []
    }
  }

  static async getArtworkById(id: string): Promise<ArtworkData | null> {
    try {
      const { data, error } = await supabase.from("gallery").select("*").eq("id", id).single()

      if (error) {
        console.error("Supabase error:", error)
        return null
      }

      return data ? this.mapDatabaseToArtwork(data) : null
    } catch (error) {
      console.error("Error fetching artwork:", error)
      return null
    }
  }

  static async updateArtwork(id: string, updates: Partial<ArtworkData>): Promise<ArtworkData | null> {
    try {
      const updateData: any = {}

      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.isFavorite !== undefined) updateData.is_favorite = updates.isFavorite
      if (updates.tags !== undefined) updateData.tags = Array.isArray(updates.tags) ? updates.tags : []

      const { data, error } = await supabase.from("gallery").update(updateData).eq("id", id).select().single()

      if (error) {
        console.error("Supabase error:", error)
        throw new Error(`Failed to update artwork: ${error.message}`)
      }

      return data ? this.mapDatabaseToArtwork(data) : null
    } catch (error) {
      console.error("Error updating artwork:", error)
      return null
    }
  }

  static async deleteArtwork(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("gallery").delete().eq("id", id)

      if (error) {
        console.error("Supabase error:", error)
        throw new Error(`Failed to delete artwork: ${error.message}`)
      }

      return true
    } catch (error) {
      console.error("Error deleting artwork:", error)
      return false
    }
  }

  static async getStats(): Promise<GalleryStats> {
    try {
      const { data, error } = await supabase.from("gallery").select("mode, dataset, scenario, is_favorite")

      if (error) {
        console.error("Supabase error:", error)
        return {
          totalArtworks: 0,
          flowArtworks: 0,
          aiArtworks: 0,
          favoriteArtworks: 0,
          totalDatasets: 0,
          totalScenarios: 0,
        }
      }

      const artworks = data || []
      const datasets = new Set(artworks.map((a) => a.dataset))
      const scenarios = new Set(artworks.map((a) => a.scenario))

      return {
        totalArtworks: artworks.length,
        flowArtworks: artworks.filter((a) => a.mode === "flow").length,
        aiArtworks: artworks.filter((a) => a.mode === "ai").length,
        favoriteArtworks: artworks.filter((a) => a.is_favorite).length,
        totalDatasets: datasets.size,
        totalScenarios: scenarios.size,
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
      return {
        totalArtworks: 0,
        flowArtworks: 0,
        aiArtworks: 0,
        favoriteArtworks: 0,
        totalDatasets: 0,
        totalScenarios: 0,
      }
    }
  }

  static async getPopularTags(limit = 20): Promise<Array<{ tag: string; count: number }>> {
    try {
      const { data, error } = await supabase.from("gallery").select("tags")

      if (error) {
        console.error("Supabase error:", error)
        return []
      }

      const tagCounts: Record<string, number> = {}
      ;(data || []).forEach((row) => {
        const tags = row.tags || []
        tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
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

  private static mapDatabaseToArtwork(data: any): ArtworkData {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      imageUrl: data.image_url,
      upscaledImageUrl: data.upscaled_image_url,
      svgContent: data.svg_content,
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
}
