import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Use the generateText function from the AI SDK
    const { text: enhancedPrompt } = await generateText({
      model: openai("gpt-4o"), // Using gpt-4o model
      prompt: `Enhance the following art generation prompt to be more descriptive and creative, suitable for an AI image generator. Focus on visual details, style, and mood. Keep it concise, around 50-100 words: "${prompt}"`,
    })

    return NextResponse.json({ success: true, enhancedPrompt })
  } catch (error) {
    console.error("Error enhancing prompt:", error)
    return NextResponse.json({ success: false, error: "Failed to enhance prompt" }, { status: 500 })
  }
}
