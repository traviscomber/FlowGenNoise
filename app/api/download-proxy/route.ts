import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get("url")
    const filename = searchParams.get("filename") || "download"

    if (!url) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
    }

    console.log("📥 Download proxy request for:", url.substring(0, 50) + "...")

    // Fetch the image
    const response = await fetch(url, {
      headers: {
        "User-Agent": "FlowSketch-Art-Generator/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream"
    const buffer = await response.arrayBuffer()

    console.log("✅ Image fetched successfully, size:", buffer.byteLength)

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.byteLength.toString(),
      },
    })
  } catch (error: any) {
    console.error("❌ Download proxy failed:", error)
    return NextResponse.json({ error: "Failed to download image: " + error.message }, { status: 500 })
  }
}
