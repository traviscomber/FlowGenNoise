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
    .from('artworks')
    .select(`
      *,
      artist:artists(*),
      collection:collections(*)
    `)
    .eq('status', 'available')
    .order('created_at', { ascending: false })

  if (filters?.rarity) {
