import { NextResponse } from "next/server"
import Replicate from "replicate"

// Initialize Replicate client with the API token from environment variables
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      console.warn("REPLICATE_API_TOKEN is not set. AI art generation will not work.")
      return NextResponse.json({ error: "AI art generation is not configured." }, { status: 500 })
    }

    console.log("Generating AI art with prompt:", prompt)

    // Use a text-to-image model from Replicate
    // Example: stability-ai/sdxl
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de75666d65e85c78093a68784d9d81e",
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

    // The output from Replicate is typically an array of URLs or a single URL
    let imageUrl: string | null = null
    if (Array.isArray(output) && output.length > 0) {
      imageUrl = output[0] as string
    } else if (typeof output === "string") {
      imageUrl = output
    }

    if (imageUrl) {
      return NextResponse.json({ success: true, imageUrl })
    } else {
      console.error("Failed to get image URL from Replicate output:", output)
      return NextResponse.json({ success: false, error: "Failed to generate AI art" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error generating AI art:", error)
    return NextResponse.json({ success: false, error: "Failed to generate AI art" }, { status: 500 })
  }
}
