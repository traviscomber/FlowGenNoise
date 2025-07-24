import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

/**
 * POST /api/generate-ai-art
 * Body:
 * {
 *   prompt: string
 * }
 *
 * Response:
 *   { imageUrl: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { prompt }: { prompt: string } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Use a specific model for AI art generation, e.g., Stable Diffusion XL
    // The model version should be specified in REPLICATE_MODEL_VERSION env var
    const output = await replicate.run(
      process.env.REPLICATE_MODEL_VERSION ||
        "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a892f1b1c7bdc70a55dcd654bd3d33635f44cf6584",
      {
        input: {
          prompt: prompt,
          width: 1024,
          height: 1024,
          num_inference_steps: 50,
          guidance_scale: 7.5,
        },
      },
    )

    const imageUrl = Array.isArray(output) && output.length > 0 ? output[0] : null

    if (!imageUrl) {
      throw new Error("Failed to generate image from Replicate.")
    }

    return NextResponse.json({ imageUrl })
  } catch (err: any) {
    console.error("[generate-ai-art] error:", err)
    return NextResponse.json({ error: "Failed to generate AI art", details: err.message }, { status: 500 })
  }
}
