import { supabase } from "@/lib/supabase"
import type { GenerationParams } from "@/lib/flow-model"

// helper ─ place near the top (after imports)
function isMissingTable(error: any) {
  return (
    error?.code === "42P01" || // Postgres undefined table
    (typeof error?.message === "string" && error.message.includes("does not exist"))
  )
}

export interface GalleryItem {
  id: string
  title: string
  description?: string
  image_url: string
  upscaled_image_url?: string
  generation_params: GenerationParams
  mode: "svg" | "ai"
  custom_prompt?: string
  upscale_method?: string
  tags: string[]
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export interface SaveArtworkParams {
  title: string
  description?: string
  imageUrl: string
  upscaledImageUrl?: string
  generationParams: GenerationParams
  mode: "svg" | "ai"
  customPrompt?: string
  upscaleMethod?: string
  tags?: string[]
}

export class GalleryService {
  static async saveArtwork(params: SaveArtworkParams): Promise<GalleryItem> {
    const {
      title,
      description,
      imageUrl,
      upscaledImageUrl,
      generationParams,
      mode,
      customPrompt,
      upscaleMethod,
      tags = [],
    } = params

    // Auto-generate tags based on generation params
    const autoTags = [
      generationParams.dataset,
      generationParams.scenario,
      mode,
      `${generationParams.numSamples}-points`,
      `seed-${generationParams.seed}`,
    ]

    if (upscaledImageUrl) {
      autoTags.push("enhanced")
    }

    if (customPrompt) {
      autoTags.push("custom-prompt")
    }

    const allTags = [...new Set([...autoTags, ...tags])]

    const { data, error } = await supabase
      .from("gallery")
      .insert({
        title,
        description,
        image_url: imageUrl,
        upscaled_image_url: upscaledImageUrl,
        generation_params: generationParams,
        mode,
        custom_prompt: customPrompt,
        upscale_method: upscaleMethod,
        tags: allTags,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to save artwork: ${error.message}`)
    }

    return data
  }

  static async getGalleryItems(
    options: {
      limit?: number
      offset?: number
      mode?: "svg" | "ai"
      favoritesOnly?: boolean
      searchTerm?: string
      sortBy?: "created_at" | "title"
      sortOrder?: "asc" | "desc"
    } = {},
  ): Promise<{ items: GalleryItem[]; total: number }> {
    try {
      const {
        limit = 20,
        offset = 0,
        mode,
        favoritesOnly = false,
        searchTerm,
        sortBy = "created_at",
        sortOrder = "desc",
      } = options

      let query = supabase.from("gallery").select("*", { count: "exact" })

      // Apply filters
      if (mode) {
        query = query.eq("mode", mode)
      }

      if (favoritesOnly) {
        query = query.eq("is_favorite", true)
      }

      if (searchTerm) {
        query = query.or(
          `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,tags.cs.{${searchTerm.toLowerCase()}}`,
        )
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === "asc" })

      // Apply pagination
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw error

      return {
        items: data || [],
        total: count || 0,
      }
    } catch (error: any) {
      if (isMissingTable(error)) {
        // table not ready yet → return empty list instead of failing
        return { items: [], total: 0 }
      }
      throw new Error(`Failed to fetch gallery items: ${error.message}`)
    }
  }

  static async getArtworkById(id: string): Promise<GalleryItem | null> {
    const { data, error } = await supabase.from("gallery").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        return null // Not found
      }
      throw new Error(`Failed to fetch artwork: ${error.message}`)
    }

    return data
  }

  static async updateArtwork(
    id: string,
    updates: Partial<Pick<GalleryItem, "title" | "description" | "tags" | "is_favorite">>,
  ): Promise<GalleryItem> {
    const { data, error } = await supabase
      .from("gallery")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update artwork: ${error.message}`)
    }

    return data
  }

  static async deleteArtwork(id: string): Promise<void> {
    const { error } = await supabase.from("gallery").delete().eq("id", id)

    if (error) {
      throw new Error(`Failed to delete artwork: ${error.message}`)
    }
  }

  static async toggleFavorite(id: string): Promise<GalleryItem> {
    // First get the current state
    const current = await this.getArtworkById(id)
    if (!current) {
      throw new Error("Artwork not found")
    }

    // Toggle the favorite status
    return this.updateArtwork(id, { is_favorite: !current.is_favorite })
  }

  static async getPopularTags(limit = 20): Promise<Array<{ tag: string; count: number }>> {
    try {
      const { data, error } = await supabase.from("gallery").select("tags")

      if (error) throw error

      // Count tag occurrences
      const tagCounts: Record<string, number> = {}
      data.forEach((item) => {
        item.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      })

      // Sort by count and return top tags
      return Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
    } catch (error: any) {
      if (isMissingTable(error)) {
        return [] // no tags yet
      }
      throw new Error(`Failed to fetch tags: ${error.message}`)
    }
  }

  static async getStats(): Promise<{
    totalArtworks: number
    svgCount: number
    aiCount: number
    enhancedCount: number
    favoritesCount: number
  }> {
    try {
      const { data, error } = await supabase.from("gallery").select("mode, upscaled_image_url, is_favorite")

      if (error) throw error

      const stats = {
        totalArtworks: data.length,
        svgCount: data.filter((item) => item.mode === "svg").length,
        aiCount: data.filter((item) => item.mode === "ai").length,
        enhancedCount: data.filter((item) => item.upscaled_image_url).length,
        favoritesCount: data.filter((item) => item.is_favorite).length,
      }

      return stats
    } catch (error: any) {
      if (isMissingTable(error)) {
        return { totalArtworks: 0, svgCount: 0, aiCount: 0, enhancedCount: 0, favoritesCount: 0 }
      }
      throw new Error(`Failed to fetch stats: ${error.message}`)
    }
  }
}
