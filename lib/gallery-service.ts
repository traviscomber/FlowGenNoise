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

class GalleryService {
  async saveArtwork(artworkData: Omit<ArtworkData, "id" | "createdAt" | "updatedAt">): Promise<ArtworkData | null> {
    try {
      const { data, error } = await supabase
        .from("gallery")
        .insert([
          {
            title: artworkData.title,
            description: artworkData.description,
            image_url: artworkData.imageUrl,
            svg_content: artworkData.svgContent,
            upscaled_image_url: artworkData.upscaledImageUrl,
            mode: artworkData.mode,
            dataset: artworkData.dataset,
            scenario: artworkData.scenario,
            seed: artworkData.seed,
            num_samples: artworkData.numSamples,
            noise_scale: artworkData.noiseScale,
            time_step: artworkData.timeStep,
            custom_prompt: artworkData.customPrompt,
            upscale_method: artworkData.upscaleMethod,
            tags: Array.isArray(artworkData.tags) ? artworkData.tags : [],
            is_favorite: artworkData.isFavorite,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("Error saving artwork:", error)
        return null
      }

      return this.mapDatabaseToArtwork(data)
    } catch (error) {
      console.error("Error saving artwork:", error)
      return null
    }
  }

  async getArtworks(filters: GalleryFilters = {}): Promise<ArtworkData[]> {
    try {
      let query = supabase.from("gallery").select("*")

      // Apply filters
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      if (filters.mode && filters.mode !== "all") {
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

      // Apply sorting
      const sortBy = filters.sortBy || "created_at"
      const sortOrder = filters.sortOrder || "desc"
      query = query.order(sortBy, { ascending: sortOrder === "asc" })

      // Apply pagination
      const limit = filters.limit ?? 20
      if (filters.limit) {
        query = query.limit(limit)
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + limit - 1)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching artworks:", error)
        return []
      }

      return data?.map(this.mapDatabaseToArtwork) || []
    } catch (error) {
      console.error("Error fetching artworks:", error)
      return []
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

  async deleteArtwork(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("gallery").delete().eq("id", id)

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

export const galleryService = new GalleryService()
