import { type NextRequest, NextResponse } from "next/server"
import { experimental_generateImage } from "ai"
import { openai } from "@ai-sdk/openai"

/**
 * Generate an AI image from a fully-formed prompt.
 *
 * Request JSON:
 *   { prompt: string, size?: "1024x1024" | "1792x1024" | "1024x1792" }
 *
 * Response JSON:
 *   { imageUrl: string }
 */
export async function POST(request: NextRequest) {
  try {
    /* ------------------------------------------------------------ */
    /* 1 — Parse request body                                       */
    /* ------------------------------------------------------------ */
    const { prompt, size = "1024x1024" } = (await request.json()) as {
      prompt: string
      size?: "1024x1024" | "1792x1024" | "1024x1792"
    }

    /* ------------------------------------------------------------ */
    /* 2 — Generate the image                                       */
    /* ------------------------------------------------------------ */
    const TEMPERATURE = 0.8

    const { imageUrl } = await experimental_generateImage({
      model: openai("dall-e-3"), // Stable DALL·E 3 via AI SDK
      prompt,
      temperature: TEMPERATURE,
      size,
    })

    /* ------------------------------------------------------------ */
    /* 3 — Return URL of generated image                            */
    /* ------------------------------------------------------------ */
    return NextResponse.json({ imageUrl })
  } catch (err: any) {
    console.error("generate-ai-art error:", err)
    return NextResponse.json({ error: "Failed to generate AI art", details: err.message }, { status: 500 })
  }
}
