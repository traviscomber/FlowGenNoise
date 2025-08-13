import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get("url")

    if (!imageUrl) {
      return NextResponse.json({ error: "Missing image URL" }, { status: 400 })
    }

    console.log("📥 Downloading image from:", imageUrl)

    // Fetch the image
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "FlowSketch-Professional/1.0",
        Accept: "image/*",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
    }

    const contentType = response.headers.get("content-type") || "image/png"
    const imageBuffer = await response.arrayBuffer()

    console.log("✅ Image downloaded successfully")
    console.log("📊 Content-Type:", contentType)
    console.log("📏 Size:", imageBuffer.byteLength, "bytes")

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": imageBuffer.byteLength.toString(),
        "Cache-Control": "public, max-age=31536000",
        "Content-Disposition": 'attachment; filename="flowsketch-professional.png"',
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
