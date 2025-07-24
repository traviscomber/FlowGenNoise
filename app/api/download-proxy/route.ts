import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, fileName } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ success: false, error: "No image URL provided" }, { status: 400 })
    }

    // Fetch the image from the external URL
    const response = await fetch(imageUrl)

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`)
    }

    const imageBuffer = await response.arrayBuffer()

    // Return the image as a blob with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": response.headers.get("content-type") || "image/jpeg",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": imageBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error("Download proxy error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
