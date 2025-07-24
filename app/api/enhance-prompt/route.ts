import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Enhance the following art generation prompt to be more descriptive, creative, and suitable for an AI image generator. Focus on visual details, artistic styles, and mood. Make it concise and impactful, around 50-100 words.

Original prompt: "${prompt}"

Enhanced prompt:`,
      temperature: 0.7,
      maxTokens: 100,
    })

    return NextResponse.json({ enhancedPrompt: text })
  } catch (error) {
    console.error("Error enhancing prompt:", error)
    return NextResponse.json({ error: "Failed to enhance prompt" }, { status: 500 })
  }
}
