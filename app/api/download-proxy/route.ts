import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get("url")
    const filename = searchParams.get("filename") || "flowsketch-art.jpg"

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    console.log("📥 Download proxy request for:", imageUrl.substring(0, 100) + "...")

    // Fetch the image
    const response = await fetch(imageUrl)

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
    }

    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get("content-type") || "image/jpeg"

    console.log("✅ Image fetched successfully, size:", imageBuffer.byteLength, "bytes")

    // Return the image with download headers
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": imageBuffer.byteLength.toString(),
      },
    })
  } catch (error: any) {
    console.error("❌ Download proxy failed:", error)

    return NextResponse.json(
      {
        error: error.message || "Failed to download image",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
