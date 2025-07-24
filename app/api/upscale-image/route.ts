import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"

export const runtime = "edge"

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
export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json()

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json({ error: "REPLICATE_API_TOKEN is not set" }, { status: 500 })
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    })

    // Use a suitable image upscaling model from Replicate
    // Example: stability-ai/stable-diffusion-xl
    // You might need to find a dedicated upscaling model or adjust parameters
    // For a simple upscale, we can use a general image-to-image model with a high scale factor
    const output = await replicate.run(
      "nightmareai/real-esrgan:42fed1c4974146ea49526d747c5699356754a30385c966f78650500958767d17", // A common ESRGAN model
      {
        input: {
          image: imageUrl,
          scale: 4, // Upscale by 4x
        },
      },
    )

    const upscaledImageUrl = Array.isArray(output) ? output[0] : output

    if (!upscaledImageUrl) {
      throw new Error("Replicate did not return an upscaled image URL.")
    }

    return NextResponse.json({ upscaledImageUrl })
  } catch (error: any) {
    console.error("Upscale image error:", error)
    return NextResponse.json({ error: "Failed to upscale image", details: error.message }, { status: 500 })
  }
}
