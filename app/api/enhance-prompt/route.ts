import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export const runtime = "edge"

/**
 * POST /api/enhance-prompt
 * Body:
 * {
 *   dataset: string,
 *   scenario: string,
 *   colorScheme: string,
 *   numSamples: number,
 *   noiseScale: number,
 *   currentPrompt: string,
 *   enableStereographic: boolean,
 *   stereographicPerspective: "little-planet" | "tunnel"
 * }
 *
 * Response:
 *   { enhancedPrompt: string }
 */
export async function POST(request: NextRequest) {
  try {
    const {
      dataset,
      scenario,
      colorScheme,
      numSamples,
      noiseScale,
      currentPrompt,
      enableStereographic,
      stereographicPerspective,
    } = await request.json()

    const basePrompt = `Abstract mathematical art based on ${dataset} dataset, ${scenario} scenario, ${colorScheme} color scheme, ${numSamples} samples, ${noiseScale} noise scale.`
    const stereographicDescription = enableStereographic
      ? ` With a ${stereographicPerspective === "little-planet" ? "little planet" : "tunnel vision"} stereographic projection.`
      : ""

    const fullPrompt = currentPrompt
      ? `${basePrompt}${stereographicDescription} User's additional request: ${currentPrompt}`
      : `${basePrompt}${stereographicDescription}`

    const { text: enhancedPrompt } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Enhance the following art generation prompt to be more descriptive and creative for an AI image generator, adding artistic styles, lighting, and composition details. Make it sound like a professional art description. Ensure the core mathematical and projection elements are clearly maintained.
      
      Original prompt: "${fullPrompt}"
      
      Enhanced prompt:`,
      temperature: 0.7, // Ensure this is not redeclared
    })

    return NextResponse.json({ enhancedPrompt })
  } catch (err: any) {
    console.error("[enhance-prompt] error:", err)
    return NextResponse.json({ error: "Failed to enhance prompt", details: err.message }, { status: 500 })
  }
}
