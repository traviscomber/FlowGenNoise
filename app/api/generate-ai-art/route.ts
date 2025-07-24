import { experimental_generateImage } from "ai"
import { openai } from "@ai-sdk/openai"

export const runtime = "edge"

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return new Response(JSON.stringify({ detail: "Prompt is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { url } = await experimental_generateImage({
      model: openai.dallE("dall-e-3"),
      prompt: prompt,
      quality: "hd",
      style: "vivid",
      size: "1024x1024",
    })

    return new Response(
      JSON.stringify({
        image: url,
        promptUsed: prompt,
        provider: "DALL-E 3",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    )
  } catch (error: any) {
    console.error("Error generating AI art:", error)
    return new Response(JSON.stringify({ detail: error.message || "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
