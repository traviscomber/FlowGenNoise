import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const { artworkId, status, buyerAddress, txHash, price } = await req.json()

    if (!artworkId || !status || !buyerAddress || !txHash) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Update artwork status
    const { error: artworkError } = await supabase
      .from("artworks")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", artworkId)

    if (artworkError) {
      console.error("Error updating artwork:", artworkError)
      return NextResponse.json({ error: "Failed to update artwork" }, { status: 500 })
    }

    // Get artwork and artist details for transaction record
    const { data: artwork } = await supabase
      .from("artworks")
      .select("*, artist:artists(*)")
      .eq("id", artworkId)
      .single()

    if (!artwork) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 })
    }

    // Create transaction record
    const platformFee = price * 0.025
    const artistRoyalty = price * 0.075

    const { error: transactionError } = await supabase.from("transactions").insert({
      artwork_id: artworkId,
      seller_id: artwork.artist_id,
      buyer_id: buyerAddress, // In a real app, you'd have user IDs
      price: price,
      currency: "ETH",
      status: "completed",
      tx_hash: txHash,
      platform_fee: platformFee,
      artist_royalty: artistRoyalty,
      completed_at: new Date().toISOString(),
    })

    if (transactionError) {
      console.error("Error creating transaction:", transactionError)
      // Don't fail the request if transaction logging fails
    }

    // Update artist total sales
    const { error: artistError } = await supabase
      .from("artists")
      .update({
        total_sales: (artwork.artist.total_sales || 0) + price,
        updated_at: new Date().toISOString(),
      })
      .eq("id", artwork.artist_id)

    if (artistError) {
      console.error("Error updating artist stats:", artistError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Purchase API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
