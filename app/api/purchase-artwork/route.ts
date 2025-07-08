import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { artworkId, buyerAddress, transactionHash, price, chainId } = await request.json()

    // Validate required fields
    if (!artworkId || !buyerAddress || !transactionHash || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Start a transaction to update multiple tables
    const { data: artwork, error: artworkError } = await supabase
      .from("artworks")
      .select("*")
      .eq("id", artworkId)
      .single()

    if (artworkError || !artwork) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 })
    }

    // Check if artwork is still available
    if (artwork.owner_id && artwork.owner_id !== artwork.artist_id) {
      return NextResponse.json({ error: "Artwork already sold" }, { status: 400 })
    }

    // Update artwork ownership
    const { error: updateError } = await supabase
      .from("artworks")
      .update({
        owner_id: buyerAddress.toLowerCase(),
        purchase_transaction_hash: transactionHash,
        sold_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", artworkId)

    if (updateError) {
      console.error("Error updating artwork:", updateError)
      return NextResponse.json({ error: "Failed to update artwork ownership" }, { status: 500 })
    }

    // Create purchase record
    const { error: purchaseError } = await supabase.from("purchases").insert({
      artwork_id: artworkId,
      buyer_id: buyerAddress.toLowerCase(),
      seller_id: artwork.artist_id,
      price: price,
      transaction_hash: transactionHash,
      blockchain_network: chainId?.toString(),
      platform_fee: price * 0.025, // 2.5% platform fee
      artist_royalty: price * 0.1, // 10% artist royalty
      created_at: new Date().toISOString(),
    })

    if (purchaseError) {
      console.error("Error creating purchase record:", purchaseError)
      // Don't fail the request if purchase record creation fails
    }

    // Update or create buyer user record
    const { data: existingBuyer } = await supabase
      .from("users")
      .select("*")
      .eq("wallet_address", buyerAddress.toLowerCase())
      .single()

    if (!existingBuyer) {
      const { error: buyerError } = await supabase.from("users").insert({
        wallet_address: buyerAddress.toLowerCase(),
        username: `User_${buyerAddress.slice(-6)}`,
        email: null,
        avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${buyerAddress}`,
        bio: "NFT Collector",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (buyerError) {
        console.error("Error creating buyer user:", buyerError)
      }
    }

    // Update artist earnings
    const artistEarnings = price * 0.9 // 90% to artist (after platform fee)
    const { error: earningsError } = await supabase.rpc("update_artist_earnings", {
      artist_wallet: artwork.artist_id,
      amount: artistEarnings,
    })

    if (earningsError) {
      console.error("Error updating artist earnings:", earningsError)
    }

    // Update marketplace statistics
    const { error: statsError } = await supabase.rpc("update_marketplace_stats", {
      total_volume: price,
      total_sales: 1,
    })

    if (statsError) {
      console.error("Error updating marketplace stats:", statsError)
    }

    return NextResponse.json({
      success: true,
      message: "Purchase completed successfully",
      transactionHash,
    })
  } catch (error) {
    console.error("Purchase API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
