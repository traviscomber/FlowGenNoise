import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get("url")
    const filename = searchParams.get("filename") || "mathematical-art.png"

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    console.log("Download proxy GET request for:", imageUrl)

    // Handle data URLs
    if (imageUrl.startsWith("data:")) {
      const [header, data] = imageUrl.split(",")
      const mimeMatch = header.match(/data:([^;]+)/)
      const mimeType = mimeMatch ? mimeMatch[1] : "image/png"

      const buffer = Buffer.from(data, "base64")

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": mimeType,
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Content-Length": buffer.length.toString(),
        },
      })
    }

    // Handle blob URLs and external URLs
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "FlowSketch-Art-Generator/1.0",
      },
    })

    if (!response.ok) {
      console.error("Failed to fetch image:", response.status, response.statusText)
      return NextResponse.json({ error: "Failed to fetch image" }, { status: response.status })
    }

    const contentType = response.headers.get("content-type") || "image/png"
    const buffer = await response.arrayBuffer()

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.byteLength.toString(),
        "Cache-Control": "public, max-age=31536000",
      },
    })
  } catch (error) {
    console.error("Download proxy error:", error)
    return NextResponse.json(
      { error: "Failed to download image", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageUrl, filename = "mathematical-art.png" } = body

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    console.log("Download proxy POST request for:", imageUrl)

    // Handle data URLs
    if (imageUrl.startsWith("data:")) {
      const [header, data] = imageUrl.split(",")
      const mimeMatch = header.match(/data:([^;]+)/)
      const mimeType = mimeMatch ? mimeMatch[1] : "image/png"

      const buffer = Buffer.from(data, "base64")

      return NextResponse.json({
        success: true,
        data: imageUrl, // Return the data URL as-is for client-side download
        contentType: mimeType,
        size: buffer.length,
      })
    }

    // Handle blob URLs and external URLs
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "FlowSketch-Art-Generator/1.0",
      },
    })

    if (!response.ok) {
      console.error("Failed to fetch image:", response.status, response.statusText)
      return NextResponse.json({ error: "Failed to fetch image" }, { status: response.status })
    }

    const contentType = response.headers.get("content-type") || "image/png"
    const buffer = await response.arrayBuffer()

    // Convert to base64 for JSON response
    const base64 = Buffer.from(buffer).toString("base64")
    const dataUrl = `data:${contentType};base64,${base64}`

    return NextResponse.json({
      success: true,
      data: dataUrl,
      contentType,
      size: buffer.byteLength,
    })
  } catch (error) {
    console.error("Download proxy POST error:", error)
    return NextResponse.json(
      { error: "Failed to process download", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
