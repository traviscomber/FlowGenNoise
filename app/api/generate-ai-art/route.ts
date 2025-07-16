import { experimental_generateImage } from "ai"
import { openai } from "@ai-sdk/openai"
import { type NextRequest, NextResponse } from "next/server"

/**
 * POST /api/generate-ai-art
 * Body: { prompt: string }
 * Always responds with JSON: { imageUrl: string; altText: string; placeholder?: true }
 * Never throws – even provider errors fall back to a local placeholder so the
 * client doesn’t see “Internal server error”.
 */
export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // -----------------------------------------------------------------------
    // 1. If no key, or if the image generation fails, we’ll fall back to a
    //    placeholder and still return 200 so the UI keeps working.
    // -----------------------------------------------------------------------
    const PLACEHOLDER = {
      imageUrl: "/placeholder.svg?height=1024&width=1024",
      altText: "Placeholder image – AI generation unavailable",
      placeholder: true as const,
    }

    if (!process.env.OPENAI_API_KEY) {
      console.warn("⚠️  OPENAI_API_KEY not set – returning placeholder image.")
      return NextResponse.json(PLACEHOLDER)
    }

    try {
      // 🔥 Call DALL·E 3 through the AI SDK
      const { url } = await experimental_generateImage({
        model: openai.image("dall-e-3"),
        prompt,
        size: "1024x1024",
        style: "vivid",
        quality: "standard",
      })

      return NextResponse.json({ imageUrl: url, altText: prompt })
    } catch (providerErr) {
      console.error("❌ OpenAI image generation failed:", providerErr)
      return NextResponse.json(PLACEHOLDER)
    }
  } catch (err) {
    // Truly unexpected (e.g. malformed JSON body) – still respond gracefully.
    console.error("❌ generate-ai-art route crashed:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
