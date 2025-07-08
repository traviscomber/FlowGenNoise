import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
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

export interface User {
  id: string
  wallet_address: string
  username: string | null
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  email: string | null
  notification_preferences: any
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

export interface Bid {
  id: string
  artwork_id: string
  bidder_id: string
  amount: number
  currency: "ETH" | "USD" | "MATIC"
  expires_at: string | null
  is_active: boolean
  created_at: string
  artwork?: Artwork
  bidder?: User
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
  user_id: string | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
  follower?: User
  following?: Artist
}
