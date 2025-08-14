import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get("url")

    if (!imageUrl) {
      return NextResponse.json({ error: "Missing image URL" }, { status: 400 })
    }

    console.log("📥 Downloading image:", imageUrl)

    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "FlowSketch-Art-Generator/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`)
    }

    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get("content-type") || "image/png"

    console.log("✅ Image downloaded successfully")

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": "attachment",
        "Cache-Control": "public, max-age=31536000",
      },
    })
  } catch (error: any) {
    console.error("❌ Download proxy failed:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageUrl } = body

    if (!imageUrl) {
      return NextResponse.json({ error: "Missing image URL" }, { status: 400 })
    }

    console.log("📥 Downloading image via POST:", imageUrl)

    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "FlowSketch-Art-Generator/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`)
    }

    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get("content-type") || "image/png"

    console.log("✅ Image downloaded successfully via POST")

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": "attachment",
        "Cache-Control": "public, max-age=31536000",
      },
    })
  } catch (error: any) {
    console.error("❌ Download proxy POST failed:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
