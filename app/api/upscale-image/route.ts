import { type NextRequest, NextResponse } from "next/server"
import { getUpscaler } from "@/lib/client-upscaler"

/**
 * POST /api/upscale-image
 * Upscales an image using the Upscaler.js library.
 *
 * Request JSON:
 *   { imageDataUrl: string }
 *
 * Response JSON:
 *   { upscaledImageUrl: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { imageDataUrl } = await request.json()

    if (!imageDataUrl) {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 })
    }

    const upscaler = await getUpscaler()
    const upscaledImage = await upscaler.upscale(imageDataUrl, { output: "base64" })

    return NextResponse.json({ upscaledImageUrl: `data:image/png;base64,${upscaledImage}` })
  } catch (error: any) {
    console.error("Image upscaling error:", error)
    return NextResponse.json({ error: "Failed to upscale image", details: error.message }, { status: 500 })
  }
}
