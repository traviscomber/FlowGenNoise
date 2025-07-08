import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { artworkId, buyerAddress, transactionHash, price, chainId } = body

    // Validate required fields
    if (!artworkId || !buyerAddress || !transactionHash || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get artwork details
    const { data: artwork, error: artworkError } = await supabase
      .from("artworks")
      .select(`
        *,
        artist:artists(*)
      `)
      .eq("id", artworkId)
      .single()

    if (artworkError || !artwork) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 })
    }

    if (artwork.status !== "available") {
      return NextResponse.json({ error: "Artwork is no longer available" }, { status: 400 })
    }

    // Update artwork status to sold
    const { error: updateError } = await supabase
      .from("artworks")
      .update({
        status: "sold",
        owner_address: buyerAddress,
        sold_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", artworkId)

    if (updateError) {
      console.error("Error updating artwork:", updateError)
      return NextResponse.json({ error: "Failed to update artwork status" }, { status: 500 })
    }

    // Create transaction record
    const platformFee = price * 0.025
    const artistRoyalty = price * 0.075

    const { error: transactionError } = await supabase.from("transactions").insert({
      artwork_id: artworkId,
      seller_id: artwork.artist_id,
      buyer_id: buyerAddress,
      price: price,
      currency: "ETH",
      status: "completed",
      tx_hash: transactionHash,
      platform_fee: platformFee,
      artist_royalty: artistRoyalty,
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    })

    if (transactionError) {
      console.error("Error creating transaction:", transactionError)
    }

    // Update artist statistics
    if (artwork.artist) {
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
    }

    // Create or update user record
    const { data: existingUser } = await supabase.from("users").select("id").eq("wallet_address", buyerAddress).single()

    if (!existingUser) {
      const { error: userError } = await supabase.from("users").insert({
        wallet_address: buyerAddress,
        username: `user_${buyerAddress.slice(-6)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (userError) {
        console.error("Error creating user:", userError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Purchase completed successfully",
      transactionHash,
      artworkId,
    })
  } catch (error) {
    console.error("Purchase API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
