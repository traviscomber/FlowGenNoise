import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

/**
 * POST /api/upscale-image
 * Body:
 * {
 *   imageUrl: string
 * }
 *
 * Response:
 *   { upscaledImageUrl: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { imageUrl }: { imageUrl: string } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    // Use a specific image upscaling model, e.g., Real-ESRGAN
    const output = await replicate.run(
      "nightmareai/real-esrgan:42fed1c4974146ea4952a37168e170c773901d520246c73500247f97696d36d7",
      {
        input: {
          image: imageUrl,
          scale: 4, // Upscale by 4x
        },
      },
    )

    const upscaledImageUrl = Array.isArray(output) && output.length > 0 ? output[0] : null

    if (!upscaledImageUrl) {
      throw new Error("Failed to upscale image from Replicate.")
    }

    return NextResponse.json({ upscaledImageUrl })
  } catch (err: any) {
    console.error("[upscale-image] error:", err)
    return NextResponse.json({ error: "Failed to upscale image", details: err.message }, { status: 500 })
  }
}
