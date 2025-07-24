import { NextResponse } from "next/server"
import { upscaleImage } from "@/lib/client-upscaler" // Assuming client-upscaler.ts contains the Replicate logic

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    const upscaledUrl = await upscaleImage(imageUrl)

    return NextResponse.json({ success: true, upscaledUrl })
  } catch (error) {
    console.error("Error in upscale-image API:", error)
    return NextResponse.json({ success: false, error: "Failed to upscale image" }, { status: 500 })
  }
}
