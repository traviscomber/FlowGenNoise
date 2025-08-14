import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get("url")

    if (!imageUrl) {
      return NextResponse.json({ error: "Missing image URL parameter" }, { status: 400 })
    }

    console.log("📥 Download proxy request for:", imageUrl)

    // Create AbortController with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      const response = await fetch(imageUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "FlowSketch-Art-Generator/1.0",
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
      }

      const contentType = response.headers.get("content-type") || "image/jpeg"
      const buffer = await response.arrayBuffer()

      console.log("✅ Image downloaded successfully, size:", buffer.byteLength)

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": contentType,
          "Content-Length": buffer.byteLength.toString(),
          "Cache-Control": "public, max-age=31536000",
        },
      })
    } catch (fetchError: any) {
      clearTimeout(timeoutId)

      if (fetchError.name === "AbortError") {
        throw new Error("Download timeout - image took too long to fetch")
      }
      throw fetchError
    }
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
