import { NextResponse } from "next/server"
import { experimental_generateImage } from "ai"
import { openai } from "@ai-sdk/openai"
import Replicate from "replicate"

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    let imageUrl: string | undefined

    // Attempt to use OpenAI DALL-E 3 first
    if (process.env.OPENAI_API_KEY) {
      try {
        const { url } = await experimental_generateImage({
          model: openai("dall-e-3"),
          prompt: prompt,
          quality: "hd",
          style: "natural",
          size: "1024x1024",
        })
        imageUrl = url
      } catch (openaiError) {
        console.warn("OpenAI DALL-E 3 failed, falling back to Replicate:", openaiError)
      }
    }

    // Fallback to Replicate if OpenAI failed or not configured
    if (!imageUrl && process.env.REPLICATE_API_TOKEN) {
      try {
        const output = await replicate.run(
          "stability-ai/sdxl:39ed52f2a78e934b3ba6e2fe167842eccd310f2ae99a31aa29ea79bcc9f6cece",
          {
            input: {
              prompt: prompt,
              width: 1024,
              height: 1024,
              num_outputs: 1,
              num_inference_steps: 50,
              guidance_scale: 7.5,
              scheduler: "K_EULER_ANCESTRAL",
              seed: Math.floor(Math.random() * 1000000000),
            },
          },
        )
        // Replicate returns an array of URLs
        if (Array.isArray(output) && output.length > 0) {
          imageUrl = output[0] as string
        }
      } catch (replicateError) {
        console.error("Replicate image generation failed:", replicateError)
      }
    }

    if (!imageUrl) {
      return NextResponse.json({ error: "Failed to generate image with available AI models." }, { status: 500 })
    }

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error("Error in AI art generation route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
