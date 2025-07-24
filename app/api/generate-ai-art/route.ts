import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Use a text-to-image model from Replicate
    // This model is just an example, you might choose a different one.
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfdc453588a754f1c2982c2d95c3",
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

    if (!output || !Array.isArray(output) || output.length === 0 || typeof output[0] !== "string") {
      throw new Error("Replicate API did not return a valid image URL.")
    }

    return NextResponse.json({ success: true, imageUrl: output[0] })
  } catch (error: any) {
    console.error("Error generating AI art with Replicate:", error)
    return NextResponse.json({ error: "Failed to generate AI art", details: error.message }, { status: 500 })
  }
}
