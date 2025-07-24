import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Enhance the following art generation prompt for a mathematical art generator. Make it more descriptive, evocative, and suitable for generating abstract, complex, and visually stunning mathematical art. Focus on elements like color, texture, light, and overall mood. The output should be a single, concise, enhanced prompt.

Original prompt: "${prompt}"

Enhanced prompt:`,
      maxTokens: 4000, // Limit maxTokens to prevent crashes
    })

    return NextResponse.json({ enhancedPrompt: text })
  } catch (error) {
    console.error("Error enhancing prompt:", error)
    return NextResponse.json({ error: "Failed to enhance prompt" }, { status: 500 })
  }
}
