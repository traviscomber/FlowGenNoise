import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { artworkId, buyerAddress, transactionHash, price } = await request.json()

    // Validate required fields
    if (!artworkId || !buyerAddress || !transactionHash || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Start a transaction
    const { data: artwork, error: artworkError } = await supabase
      .from("artworks")
      .select("*")
      .eq("id", artworkId)
      .single()

    if (artworkError || !artwork) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 })
    }

    if (artwork.status !== "available") {
      return NextResponse.json({ error: "Artwork is not available for purchase" }, { status: 400 })
    }

    // Update artwork status to sold
    const { error: updateError } = await supabase
      .from("artworks")
      .update({
        status: "sold",
        owner_address: buyerAddress,
        sold_at: new Date().toISOString(),
      })
      .eq("id", artworkId)

    if (updateError) {
      throw updateError
    }

    // Record the transaction
    const { error: transactionError } = await supabase.from("transactions").insert({
      artwork_id: artworkId,
      buyer_address: buyerAddress,
      seller_address: artwork.artist_address || "0x0000000000000000000000000000000000000000",
      transaction_hash: transactionHash,
      price: price,
      platform_fee: price * 0.025,
      artist_royalty: price * 0.075,
      status: "completed",
      created_at: new Date().toISOString(),
    })

    if (transactionError) {
      // Rollback artwork update if transaction recording fails
      await supabase
        .from("artworks")
        .update({
          status: "available",
          owner_address: null,
          sold_at: null,
        })
        .eq("id", artworkId)

      throw transactionError
    }

    // Update artist statistics
    const { error: artistError } = await supabase
      .from("artists")
      .update({
        total_sales: artwork.artist_total_sales + 1,
        total_earnings: artwork.artist_total_earnings + price * 0.925, // Artist gets 92.5% (100% - 2.5% platform - 7.5% royalty)
      })
      .eq("wallet_address", artwork.artist_address)

    if (artistError) {
      console.error("Failed to update artist stats:", artistError)
      // Don't rollback the sale for this error, just log it
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
