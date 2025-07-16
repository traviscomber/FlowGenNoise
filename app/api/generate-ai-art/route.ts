import { experimental_generateImage } from "ai"
import { openai } from "@ai-sdk/openai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // If no key, return a placeholder so the UI still works
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY is not set. Returning placeholder.")
      return NextResponse.json({
        imageUrl: "/placeholder.svg?height=1024&width=1024",
        altText: "Placeholder image (missing OPENAI_API_KEY)",
      })
    }

    // Call DALL·E-3 through the AI SDK
    const { image } = await experimental_generateImage({
      model: openai.image("dall-e-3"),
      prompt,
      quality: "standard",
      style: "vivid",
      size: "1024x1024",
    })

    // `image` can contain a url OR a base64 buffer depending on the provider
    const imageUrl = typeof image === "string" ? image : `data:image/png;base64,${image.base64}`

    return NextResponse.json({ imageUrl, altText: prompt })
  } catch (error) {
    console.error("❌ generate-ai-art API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
