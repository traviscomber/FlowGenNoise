import { supabase } from "./supabase"

export interface Artist {
  id: string
  wallet_address: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  banner_url: string | null
  website_url: string | null
  twitter_handle: string | null
  instagram_handle: string | null
  verified: boolean
  total_sales: number
  total_artworks: number
  created_at: string
  updated_at: string
}

export interface Collection {
  id: string
  artist_id: string
  name: string
  description: string | null
  banner_url: string | null
  slug: string
  is_featured: boolean
  created_at: string
  updated_at: string
  artist?: Artist
}

export interface Artwork {
  id: string
  artist_id: string
  collection_id: string | null
  title: string
  description: string | null
  image_url: string
  image_ipfs_hash: string | null
  metadata_url: string | null
  metadata_ipfs_hash: string | null
  dataset: string
  color_scheme: string
  seed: number
  num_samples: number
  noise: number
  generation_mode: "svg" | "ai"
  price: number
  currency: "ETH" | "USD" | "MATIC"
  status: "available" | "sold" | "reserved" | "auction"
  rarity: "Common" | "Rare" | "Epic" | "Legendary"
  edition: string
  views: number
  likes: number
  token_id: string | null
  contract_address: string | null
  blockchain: string
  minted_at: string | null
  listed_at: string
  created_at: string
  updated_at: string
  artist?: Artist
  collection?: Collection
}

export interface User {
  id: string
  wallet_address: string
  username: string | null
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  email: string | null
  notification_preferences: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  artwork_id: string
  seller_id: string
  buyer_id: string
  price: number
  currency: "ETH" | "USD" | "MATIC"
  status: "pending" | "completed" | "failed" | "cancelled"
  tx_hash: string | null
  block_number: number | null
  gas_used: number | null
  gas_price: number | null
  platform_fee: number
  artist_royalty: number
  created_at: string
  completed_at: string | null
  artwork?: Artwork
  seller?: Artist
  buyer?: User
}

export interface MarketplaceStats {
  totalArtworks: number
  totalArtists: number
  totalSales: number
  totalVolume: number
}

// Fetch all artworks with artist and collection data
export async function getArtworks(filters?: {
  rarity?: string
  dataset?: string
  minPrice?: number
  maxPrice?: number
  limit?: number
  offset?: number
}) {
  let query = supabase
    .from("artworks")
    .select(`
      *,
      artist:artists(*),
      collection:collections(*)
    `)
    .eq("status", "available")
    .order("created_at", { ascending: false })

  if (filters?.rarity) {
    query = query.eq("rarity", filters.rarity)
  }

  if (filters?.dataset) {
    query = query.eq("dataset", filters.dataset)
  }

  if (filters?.minPrice !== undefined) {
    query = query.gte("price", filters.minPrice)
  }

  if (filters?.maxPrice !== undefined) {
    query = query.lte("price", filters.maxPrice)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching artworks:", error)
    throw error
  }

  return data as Artwork[]
}

// Fetch featured artworks
export async function getFeaturedArtworks(limit = 6) {
  const { data, error } = await supabase
    .from("artworks")
    .select(`
      *,
      artist:artists(*),
      collection:collections(*)
    `)
    .eq("status", "available")
    .in("rarity", ["Legendary", "Epic"])
    .order("views", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching featured artworks:", error)
    throw error
  }

  return data as Artwork[]
}

// Fetch all artists
export async function getArtists(limit?: number) {
  let query = supabase.from("artists").select("*").order("total_sales", { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching artists:", error)
    throw error
  }

  return data as Artist[]
}

// Fetch featured collections
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

  return data as Collection[]
}

// Fetch marketplace statistics
export async function getMarketplaceStats(): Promise<MarketplaceStats> {
  try {
    // Get total artworks
    const { count: totalArtworks } = await supabase.from("artworks").select("*", { count: "exact", head: true })

    // Get total artists
    const { count: totalArtists } = await supabase.from("artists").select("*", { count: "exact", head: true })

    // Get completed transactions for sales count and volume
    const { data: transactions } = await supabase
      .from("transactions")
      .select("price, currency")
      .eq("status", "completed")

    const totalSales = transactions?.length || 0
    const totalVolume = transactions?.reduce((sum, tx) => sum + tx.price, 0) || 0

    return {
      totalArtworks: totalArtworks || 0,
      totalArtists: totalArtists || 0,
      totalSales,
      totalVolume,
    }
  } catch (error) {
    console.error("Error fetching marketplace stats:", error)
    return {
      totalArtworks: 0,
      totalArtists: 0,
      totalSales: 0,
      totalVolume: 0,
    }
  }
}

// Fetch single artwork by ID
export async function getArtworkById(id: string) {
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

  return data as Artwork
}

// Fetch artworks by artist
export async function getArtworksByArtist(artistId: string) {
  const { data, error } = await supabase
    .from("artworks")
    .select(`
      *,
      artist:artists(*),
      collection:collections(*)
    `)
    .eq("artist_id", artistId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching artworks by artist:", error)
    throw error
  }

  return data as Artwork[]
}

// Fetch artworks by collection
export async function getArtworksByCollection(collectionId: string) {
  const { data, error } = await supabase
    .from
