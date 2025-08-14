import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get("url")
    const filename = searchParams.get("filename")

    if (!imageUrl) {
      return NextResponse.json({ error: "Missing image URL" }, { status: 400 })
    }

    console.log("📥 Download proxy request:", { imageUrl: imageUrl.substring(0, 100) + "...", filename })

    // Fetch the image
    const response = await fetch(imageUrl)

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
    }

    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get("content-type") || "image/jpeg"

    console.log("✅ Image fetched successfully:", {
      size: imageBuffer.byteLength,
      contentType,
    })

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": filename ? `attachment; filename="${filename}"` : "attachment",
        "Content-Length": imageBuffer.byteLength.toString(),
      },
    })
  } catch (error: any) {
    console.error("❌ Download proxy error:", error)

    return NextResponse.json(
      {
        error: error.message || "Download failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
