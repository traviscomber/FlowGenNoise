import { NextResponse } from "next/server"
import Replicate from "replicate"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Use a text-to-image model from Replicate
    // Example: stability-ai/sdxl:da775e53394c2e7d455dfb3182a1e5c36689c8ffce87eb4e1758d472c3924137
    const output = await replicate.run(
      "stability-ai/sdxl:da775e53394c2e7d455dfb3182a1e5c36689c8ffce87eb4e1758d472c3924137",
      {
        input: {
          prompt: prompt,
          width: 768,
          height: 768,
          num_inference_steps: 25,
          guidance_scale: 7.5,
        },
      },
    )

    if (!output || !Array.isArray(output) || output.length === 0 || typeof output[0] !== "string") {
      throw new Error("Replicate did not return a valid image URL.")
    }

    return NextResponse.json({ imageUrl: output[0] })
  } catch (error) {
    console.error("Error generating AI art:", error)
    return NextResponse.json({ error: "Failed to generate AI art" }, { status: 500 })
  }
}
