import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface Artist {
  id: string
  wallet_address: string
  username: string
  display_name?: string
  bio?: string
  avatar_url?: string
  banner_url?: string
  website_url?: string
  twitter_handle?: string
  instagram_handle?: string
  verified: boolean
  total_sales: number
  total_artworks: number
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  wallet_address: string
  username?: string
  display_name?: string
  bio?: string
  avatar_url?: string
  email?: string
  notification_preferences: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Collection {
  id: string
  artist_id: string
  name: string
  description?: string
  banner_url?: string
  slug: string
  is_featured: boolean
  created_at: string
  updated_at: string
  artist?: Artist
}

export interface Artwork {
  id: string
  artist_id: string
  collection_id?: string
  title: string
  description?: string
  image_url: string
  image_ipfs_hash?: string
  metadata_url?: string
  metadata_ipfs_hash?: string

  // Generation parameters
  dataset: string
  color_scheme: string
  seed: number
  num_samples: number
  noise: number
  generation_mode: "svg" | "ai"

  // Marketplace data
  price: number
  currency: "ETH" | "USD" | "MATIC"
  status: "available" | "sold" | "reserved" | "auction"
  rarity: "Common" | "Rare" | "Epic" | "Legendary"
  edition: string

  // Engagement metrics
  views: number
  likes: number

  // Blockchain data
  token_id?: string
  contract_address?: string
  blockchain: string

  // Timestamps
  minted_at?: string
  listed_at: string
  created_at: string
  updated_at: string

  // Relations
  artist?: Artist
  collection?: Collection
  is_liked?: boolean
}

export interface Transaction {
  id: string
  artwork_id: string
  seller_id: string
  buyer_id: string
  price: number
  currency: "ETH" | "USD" | "MATIC"
  status: "pending" | "completed" | "failed" | "cancelled"
  tx_hash?: string
  block_number?: number
  gas_used?: number
  gas_price?: number
  platform_fee: number
  artist_royalty: number
  created_at: string
  completed_at?: string

  // Relations
  artwork?: Artwork
  seller?: Artist
  buyer?: User
}

export interface ArtworkLike {
  id: string
  artwork_id: string
  user_id: string
  created_at: string
}

export interface ArtworkView {
  id: string
  artwork_id: string
  user_id?: string
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface Bid {
  id: string
  artwork_id: string
  bidder_id: string
  amount: number
  currency: "ETH" | "USD" | "MATIC"
  expires_at?: string
  is_active: boolean
  created_at: string

  // Relations
  artwork?: Artwork
  bidder?: User
}

// Helper function to create a singleton Supabase client
let supabaseInstance: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

// Server-side Supabase client (for API routes)
export function createServerSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
