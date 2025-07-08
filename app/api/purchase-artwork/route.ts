import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { artworkId, buyerAddress, transactionHash, price, chainId } = body

    // Validate required fields
    if (!artworkId || !buyerAddress || !transactionHash || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Start a transaction to update multiple tables
    const { data: artwork, error: artworkError } = await supabase
      .from("artworks")
      .select("*, artist:artists(*)")
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
        sale_price: price,
      })
      .eq("id", artworkId)

    if (updateError) {
      console.error("Error updating artwork:", updateError)
      return NextResponse.json({ error: "Failed to update artwork status" }, { status: 500 })
    }

    // Create transaction record
    const { error: transactionError } = await supabase.from("transactions").insert({
      artwork_id: artworkId,
      buyer_address: buyerAddress,
      seller_address: artwork.artist.wallet_address,
      transaction_hash: transactionHash,
      price: price,
      chain_id: chainId,
      status: "completed",
      created_at: new Date().toISOString(),
    })

    if (transactionError) {
      console.error("Error creating transaction:", transactionError)
      // Don't fail the request if transaction logging fails
    }

    // Update artist statistics
    const { error: artistError } = await supabase
      .from("artists")
      .update({
        total_sales: artwork.artist.total_sales + price,
        updated_at: new Date().toISOString(),
      })
      .eq("id", artwork.artist_id)

    if (artistError) {
      console.error("Error updating artist stats:", artistError)
      // Don't fail the request if stats update fails
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
