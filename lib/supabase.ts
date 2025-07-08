import { createClient } from "@supabase/supabase-js"

/**
 * Reads an env var (string | undefined) and, if it's missing, returns a
 * harmless placeholder so the browser preview doesn't crash.
 */
function safeEnv(key: string, fallback: string): string {
  const value = process.env[key as keyof NodeJS.ProcessEnv]
  if (!value || value.trim() === "") {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[supabase] Environment variable "${key}" is missing – using "${fallback}" so the preview keeps working.`,
      )
    }
    return fallback
  }
  return value
}

// Main Supabase client for browser use
export const supabase = createClient(
  safeEnv("NEXT_PUBLIC_SUPABASE_URL", "https://preview-project.supabase.co"),
  safeEnv(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByZXZpZXctcHJvamVjdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQ2MDI4NDAwLCJleHAiOjE5NjE2MDQ0MDB9.placeholder",
  ),
)

// Client-side singleton pattern
let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(
      safeEnv("NEXT_PUBLIC_SUPABASE_URL", "https://preview-project.supabase.co"),
      safeEnv(
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByZXZpZXctcHJvamVjdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQ2MDI4NDAwLCJleHAiOjE5NjE2MDQ0MDB9.placeholder",
      ),
    )
  }
  return supabaseClient
}

// Server-side client (for server actions and API routes)
export function createServerClient() {
  return createClient(
    safeEnv("NEXT_PUBLIC_SUPABASE_URL", "https://preview-project.supabase.co"),
    safeEnv(
      "SUPABASE_SERVICE_ROLE_KEY",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByZXZpZXctcHJvamVjdCIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2NDYwMjg0MDAsImV4cCI6MTk2MTYwNDQwMH0.placeholder",
    ),
  )
}

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
  owner_address: string | null
  purchase_transaction_hash: string | null
  sold_at: string | null
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

export interface Purchase {
  id: string
  artwork_id: string
  buyer_address: string
  seller_address: string
  price_eth: number
  transaction_hash: string
  block_number: number | null
  gas_used: number | null
  gas_price: number | null
  status: "pending" | "completed" | "failed"
  created_at: string
  completed_at: string | null
}

export interface WalletConnection {
  id: string
  wallet_address: string
  chain_id: number
  network_name: string
  connected_at: string
  last_active: string
  user_agent: string | null
}

export interface BlockchainTransaction {
  id: string
  transaction_hash: string
  from_address: string
  to_address: string
  value_eth: number
  gas_used: number | null
  gas_price: number | null
  block_number: number | null
  transaction_type: "mint" | "purchase" | "transfer"
  artwork_id: string | null
  status: "pending" | "completed" | "failed"
  created_at: string
  completed_at: string | null
}
