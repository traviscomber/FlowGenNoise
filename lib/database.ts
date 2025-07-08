import { supabase, type Artwork, type Artist, type User, type Transaction } from "./supabase"

// Artwork queries
export async function getArtworks(
  options: {
    limit?: number
    offset?: number
    sortBy?: "created_at" | "price" | "views" | "likes"
    sortOrder?: "asc" | "desc"
    filterBy?: {
      dataset?: string
      rarity?: string
      artist_id?: string
      collection_id?: string
      status?: string
      price_min?: number
      price_max?: number
    }
    search?: string
  } = {},
) {
  let query = supabase.from("artworks").select(`
      *,
      artist:artists(*),
      collection:collections(*)
    `)

  // Apply filters
  if (options.filterBy) {
    const { dataset, rarity, artist_id, collection_id, status, price_min, price_max } = options.filterBy

    if (dataset) query = query.eq("dataset", dataset)
    if (rarity) query = query.eq("rarity", rarity)
    if (artist_id) query = query.eq("artist_id", artist_id)
    if (collection_id) query = query.eq("collection_id", collection_id)
    if (status) query = query.eq("status", status)
    if (price_min) query = query.gte("price", price_min)
    if (price_max) query = query.lte("price", price_max)
  }

  // Apply search
  if (options.search) {
    query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`)
  }

  // Apply sorting
  const sortBy = options.sortBy || "created_at"
  const sortOrder = options.sortOrder || "desc"
  query = query.order(sortBy, { ascending: sortOrder === "asc" })

  // Apply pagination
  if (options.limit) {
    query = query.limit(options.limit)
  }
  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching artworks:", error)
    throw error
  }
  return data as (Artwork & { artist: Artist })[]
}

export async function getArtworkById(id: string, userId?: string) {
  const { data, error } = await supabase
    .from("artworks")
    .select(`
      *,
      artist:artists(*),
      collection:collections(*)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching artwork:", error)
    throw error
  }

  // Check if user has liked this artwork
  if (userId) {
    const { data: likeData } = await supabase
      .from("artwork_likes")
      .select("id")
      .eq("artwork_id", id)
      .eq("user_id", userId)
      .single()

    data.is_liked = !!likeData
  }

  return data as Artwork & { artist: Artist; is_liked?: boolean }
}

export async function getFeaturedArtworks(limit = 6) {
  const { data, error } = await supabase
    .from("artworks")
    .select(`
      *,
      artist:artists(*),
      collection:collections(*)
    `)
    .eq("status", "available")
    .order("views", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching featured artworks:", error)
    throw error
  }
  return data as (Artwork & { artist: Artist })[]
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

  if (options.verified !== undefined) {
    query = query.eq("verified", options.verified)
  }

  const sortBy = options.sortBy || "total_sales"
  const sortOrder = options.sortOrder || "desc"
  query = query.order(sortBy, { ascending: sortOrder === "asc" })

  if (options.limit) {
    query = query.limit(options.limit)
  }
  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error } = await query
  if (error) {
    console.error("Error fetching artists:", error)
    throw error
  }
  return data as Artist[]
}

export async function getArtistById(id: string) {
  const { data, error } = await supabase.from("artists").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching artist:", error)
    throw error
  }
  return data as Artist
}

export async function getArtistByWallet(walletAddress: string) {
  const { data, error } = await supabase.from("artists").select("*").eq("wallet_address", walletAddress).single()

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching artist by wallet:", error)
    throw error
  }
  return data as Artist | null
}

// User queries
export async function getUserByWallet(walletAddress: string) {
  const { data, error } = await supabase.from("users").select("*").eq("wallet_address", walletAddress).single()

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching user by wallet:", error)
    throw error
  }
  return data as User | null
}

export async function createUser(userData: Partial<User>) {
  const { data, error } = await supabase.from("users").insert(userData).select().single()

  if (error) {
    console.error("Error creating user:", error)
    throw error
  }
  return data as User
}

// Engagement functions
export async function recordArtworkView(artworkId: string, userId?: string, ipAddress?: string, userAgent?: string) {
  const { error } = await supabase.from("artwork_views").insert({
    artwork_id: artworkId,
    user_id: userId,
    ip_address: ipAddress,
    user_agent: userAgent,
  })

  if (error) {
    console.error("Error recording artwork view:", error)
    throw error
  }
}

export async function toggleArtworkLike(artworkId: string, userId: string) {
  // Check if like exists
  const { data: existingLike } = await supabase
    .from("artwork_likes")
    .select("id")
    .eq("artwork_id", artworkId)
    .eq("user_id", userId)
    .single()

  if (existingLike) {
    // Remove like
    const { error } = await supabase.from("artwork_likes").delete().eq("artwork_id", artworkId).eq("user_id", userId)

    if (error) {
      console.error("Error removing like:", error)
      throw error
    }
    return false
  } else {
    // Add like
    const { error } = await supabase.from("artwork_likes").insert({
      artwork_id: artworkId,
      user_id: userId,
    })

    if (error) {
      console.error("Error adding like:", error)
      throw error
    }
    return true
  }
}

// Transaction functions
export async function createTransaction(transactionData: Partial<Transaction>) {
  const { data, error } = await supabase.from("transactions").insert(transactionData).select().single()

  if (error) {
    console.error("Error creating transaction:", error)
    throw error
  }
  return data as Transaction
}

export async function getTransactionsByUser(userId: string, type: "buyer" | "seller" = "buyer") {
  const column = type === "buyer" ? "buyer_id" : "seller_id"

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      *,
      artwork:artworks(*),
      seller:artists(*),
      buyer:users(*)
    `)
    .eq(column, userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching transactions:", error)
    throw error
  }
  return data as (Transaction & { artwork: Artwork; seller: Artist; buyer: User })[]
}

// Analytics functions
export async function getMarketplaceStats() {
  try {
    const [{ count: totalArtworks }, { count: totalArtists }, { count: totalTransactions }, { data: totalVolumeData }] =
      await Promise.all([
        supabase.from("artworks").select("*", { count: "exact", head: true }),
        supabase.from("artists").select("*", { count: "exact", head: true }),
        supabase.from("transactions").select("*", { count: "exact", head: true }).eq("status", "completed"),
        supabase.from("transactions").select("price").eq("status", "completed"),
      ])

    const volume = totalVolumeData?.reduce((sum, tx) => sum + tx.price, 0) || 0

    return {
      totalArtworks: totalArtworks || 0,
      totalArtists: totalArtists || 0,
      totalTransactions: totalTransactions || 0,
      totalVolume: volume,
    }
  } catch (error) {
    console.error("Error fetching marketplace stats:", error)
    return {
      totalArtworks: 0,
      totalArtists: 0,
      totalTransactions: 0,
      totalVolume: 0,
    }
  }
}

// Collection functions
export async function getFeaturedCollections(limit = 5) {
  const { data, error } = await supabase
    .from("collections")
    .select(`
      *,
      artist:artists(*)
    `)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching featured collections:", error)
    throw error
  }
  return data
}

export async function getArtworksByCollection(collectionId: string, limit = 10) {
  const { data, error } = await supabase
    .from("artworks")
    .select(`
      *,
      artist:artists(*)
    `)
    .eq("collection_id", collectionId)
    .eq("status", "available")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching artworks by collection:", error)
    throw error
  }
  return data as (Artwork & { artist: Artist })[]
}
