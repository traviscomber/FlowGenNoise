import { supabase } from "./supabase"

// Artwork queries
export async function getArtworks(filters?: {
  rarity?: string
  dataset?: string
  minPrice?: number
  maxPrice?: number
  limit?: number
  offset?: number
}) {
  const query = supabase
    .from("artworks")
    .select(`
      *,
      artist:artists(*),
      collection:collections(*)
    `)
    .eq("status", "available")
    .order("created_at", { ascending: false })

  if (filters?.rarity) {
    query.eq("rarity", filters.rarity)
  }
  if (filters?.dataset) {
    query.eq("dataset", filters.dataset)
  }
  if (filters?.minPrice !== undefined) {
    query.gte("price", filters.minPrice)
  }
  if (filters?.maxPrice !== undefined) {
    query.lte("price", filters.maxPrice)
  }
  if (filters?.limit) {
    query.limit(filters.limit)
  }
  if (filters?.offset) {
    query.range(filters.offset, filters.offset + filters.limit - 1)
  }

  const { data, error } = await query
  if (error) {
    console.error("Error fetching artworks:", error)
    throw error
  }
  return data
}

// Artist queries
export async function getArtists(
  options: {
    limit?: number
    offset?: number
    sortBy?: "created_at" | "total_sales" | "total_artworks"
    sortOrder?: "asc" | "desc"
    verified?: boolean
  } = {},
) {
  let query = supabase.from("artists").select("*")

  // filter by verification badge if specified
  if (options.verified !== undefined) {
    query = query.eq("verified", options.verified)
  }

  // apply sorting
  const sortBy = options.sortBy || "total_sales"
  const sortOrder = options.sortOrder || "desc"
  query = query.order(sortBy, { ascending: sortOrder === "asc" })

  // apply pagination
  if (options.limit) {
    query = query.limit(options.limit)
  }
  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  // execute the query
  const { data, error } = await query
  if (error) {
    console.error("Error fetching artists:", error)
    throw error
  }
  return data
}

// Featured artworks (top-viewed, still available)
export async function getFeaturedArtworks(limit = 6) {
  const { data, error } = await supabase
    .from("artworks")
    .select(
      `
        *,
        artist:artists(*),
        collection:collections(*)
      `,
    )
    .eq("status", "available")
    .order("views", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching featured artworks:", error)
    throw error
  }

  return data
}

// Featured collections (flagged with `is_featured = true`)
export async function getFeaturedCollections(limit = 5) {
  const { data, error } = await supabase
    .from("collections")
    .select(
      `
        *,
        artist:artists(*)
      `,
    )
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching featured collections:", error)
    throw error
  }

  return data
}
