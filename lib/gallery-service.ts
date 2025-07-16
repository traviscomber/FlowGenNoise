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
  scenario?: string
  seed: number
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
  sortBy?: "created_at" | "title" | "dataset"
  sortOrder?: "asc" | "desc"
  limit?: number
  offset?: number
}

export interface GalleryStats {
  totalArtworks: number
  totalFavorites: number
  totalByMode: { flow: number; ai: number }
  totalByDataset: Record<string, number>
  popularTags: Array<{ tag: string; count: number }>
}

class GalleryService {
  async saveArtwork(artwork: ArtworkData): Promise<string | null> {
    try {
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
          tags: Array.isArray(artwork.tags) ? artwork.tags : [],
          is_favorite: artwork.isFavorite || false,
        })
        .select("id")
        .single()

      if (error) {
        console.error("Error saving artwork:", error)
        return null
      }

      return data?.id || null
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
      query = query.order(sortBy === "created_at" ? "created_at" : sortBy, { ascending: sortOrder === "asc" })

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit)
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching artworks:", error)
        return []
      }

      return (data || []).map(this.mapDatabaseToArtwork)
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

      return data ? this.mapDatabaseToArtwork(data) : null
    } catch (error) {
      console.error("Error fetching artwork:", error)
      return null
    }
  }

  async updateArtwork(id: string, updates: Partial<ArtworkData>): Promise<boolean> {
    try {
      const updateData: any = {}

      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.tags !== undefined) updateData.tags = Array.isArray(updates.tags) ? updates.tags : []
      if (updates.isFavorite !== undefined) updateData.is_favorite = updates.isFavorite
      if (updates.upscaledImageUrl !== undefined) updateData.upscaled_image_url = updates.upscaledImageUrl

      const { error } = await supabase.from("gallery").update(updateData).eq("id", id)

      if (error) {
        console.error("Error updating artwork:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error updating artwork:", error)
      return false
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
      // First get the current favorite status
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

  async getStats(): Promise<GalleryStats> {
    try {
      const { data, error } = await supabase.from("gallery").select("mode, dataset, tags, is_favorite")

      if (error) {
        console.error("Error fetching stats:", error)
        return {
          totalArtworks: 0,
          totalFavorites: 0,
          totalByMode: { flow: 0, ai: 0 },
          totalByDataset: {},
          popularTags: [],
        }
      }

      const artworks = data || []
      const totalArtworks = artworks.length
      const totalFavorites = artworks.filter((a) => a.is_favorite).length

      const totalByMode = artworks.reduce(
        (acc, artwork) => {
          acc[artwork.mode as "flow" | "ai"]++
          return acc
        },
        { flow: 0, ai: 0 },
      )

      const totalByDataset = artworks.reduce(
        (acc, artwork) => {
          acc[artwork.dataset] = (acc[artwork.dataset] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const tagCounts = artworks.reduce(
        (acc, artwork) => {
          if (artwork.tags && Array.isArray(artwork.tags)) {
            artwork.tags.forEach((tag: string) => {
              acc[tag] = (acc[tag] || 0) + 1
            })
          }
          return acc
        },
        {} as Record<string, number>,
      )

      const popularTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      return {
        totalArtworks,
        totalFavorites,
        totalByMode,
        totalByDataset,
        popularTags,
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
      return {
        totalArtworks: 0,
        totalFavorites: 0,
        totalByMode: { flow: 0, ai: 0 },
        totalByDataset: {},
        popularTags: [],
      }
    }
  }

  async getPopularTags(limit = 20): Promise<Array<{ tag: string; count: number }>> {
    try {
      const { data, error } = await supabase.from("gallery").select("tags")

      if (error) {
        console.error("Error fetching tags:", error)
        return []
      }

      const tagCounts = (data || []).reduce(
        (acc, artwork) => {
          if (artwork.tags && Array.isArray(artwork.tags)) {
            artwork.tags.forEach((tag: string) => {
              acc[tag] = (acc[tag] || 0) + 1
            })
          }
          return acc
        },
        {} as Record<string, number>,
      )

      return Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
    } catch (error) {
      console.error("Error fetching popular tags:", error)
      return []
    }
  }

  private mapDatabaseToArtwork(dbArtwork: any): ArtworkData {
    return {
      id: dbArtwork.id,
      title: dbArtwork.title,
      description: dbArtwork.description,
      imageUrl: dbArtwork.image_url,
      upscaledImageUrl: dbArtwork.upscaled_image_url,
      svgContent: dbArtwork.svg_content,
      mode: dbArtwork.mode,
      dataset: dbArtwork.dataset,
      scenario: dbArtwork.scenario,
      seed: dbArtwork.seed,
      tags: Array.isArray(dbArtwork.tags) ? dbArtwork.tags : [],
      isFavorite: dbArtwork.is_favorite || false,
      createdAt: dbArtwork.created_at,
      updatedAt: dbArtwork.updated_at,
    }
  }
}

export const galleryService = new GalleryService()
