import { type NextRequest, NextResponse } from "next/server"
import { experimental_generateImage } from "ai"
import { openai } from "@ai-sdk/openai"

export const runtime = "edge"

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Check for OPENAI_API_KEY
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY is not set. Returning placeholder image.")
      // Return a placeholder image URL if API key is missing
      return NextResponse.json({
        imageUrl: "/placeholder.svg?height=1024&width=1024",
        altText: "Placeholder image due to missing OpenAI API key",
      })
    }

    const { url } = await experimental_generateImage({
      model: openai("dall-e-3"),
      prompt: prompt,
      quality: "standard",
      style: "vivid",
      size: "1024x1024",
    })

    return NextResponse.json({ imageUrl: url, altText: prompt })
  } catch (error) {
    console.error("Error generating AI art:", error)
    return NextResponse.json({ error: "Failed to generate AI art" }, { status: 500 })
  }
}
