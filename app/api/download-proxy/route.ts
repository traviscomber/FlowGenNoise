import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get("url")
    const filename = searchParams.get("filename") || "flowsketch-art.jpg"

    if (!imageUrl) {
      return NextResponse.json({ error: "No image URL provided" }, { status: 400 })
    }

    console.log("Downloading image:", imageUrl)

    // Fetch the image
    const imageResponse = await fetch(imageUrl)

    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`)
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const contentType = imageResponse.headers.get("content-type") || "image/jpeg"

    console.log(`Image downloaded successfully: ${imageBuffer.byteLength} bytes`)

    // Return the image with proper headers for download
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": imageBuffer.byteLength.toString(),
        "Cache-Control": "no-cache",
      },
    })
  } catch (error: any) {
    console.error("Download proxy error:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to download image",
        details: error.stack,
      },
      { status: 500 },
    )
  }
}
