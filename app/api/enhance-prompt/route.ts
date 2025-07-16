import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { dataset, scenario, numSamples, noiseScale, currentPrompt } = await request.json()

    const systemPrompt = `You are an expert AI art prompt engineer specializing in mathematical and generative art. 
    Create detailed, artistic prompts that combine mathematical concepts with visual aesthetics.`

    const userPrompt = `Create an enhanced AI art prompt based on these parameters:
    - Dataset: ${dataset}
    - Scenario: ${scenario}  
    - Sample Points: ${numSamples}
    - Noise Scale: ${noiseScale}
    - Current Prompt: ${currentPrompt || "None"}

    Generate a detailed, artistic prompt that captures the mathematical beauty of ${dataset} patterns 
    combined with the aesthetic of ${scenario}. Include artistic style, colors, composition, and mood.
    Make it suitable for AI image generation.`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: userPrompt,
    })

    return NextResponse.json({
      success: true,
      enhancedPrompt: text,
    })
  } catch (error) {
    console.error("Error enhancing prompt:", error)
    return NextResponse.json({ success: false, error: "Failed to enhance prompt" }, { status: 500 })
  }
}
