import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

/**
 * POST /api/enhance-prompt
 *
 * Body:
 * {
 *   dataset: string,
 *   scenario: string,
 *   colorScheme: string,
 *   numSamples: number,
 *   noiseScale: number,
 *   currentPrompt?: string,
 *   enableStereographic?: boolean,
 *   stereographicPerspective?: string
 * }
 */
export async function POST(req: NextRequest) {
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
    } = await req.json()

    const systemPrompt = `You are an AI art prompt enhancer. Your task is to take a basic description of a mathematical artwork and expand it into a highly detailed, professional, and artistic prompt suitable for advanced AI image generation models like DALL-E 3 or Midjourney. Focus on adding rich visual descriptors, artistic styles, lighting, textures, and complex mathematical concepts.

Guidelines:
- Incorporate the dataset, scenario, color scheme, number of samples, and noise scale into the prompt.
- Use terms like "ultra-high-resolution", "museum-grade composition", "HDR lighting", "PBR materials", "cinematic", "photorealistic", "abstract", "surreal", "futuristic".
- Emphasize mathematical precision and beauty.
- If 'enableStereographic' is true, describe the specific stereographic projection effect ('little-planet' or 'tunnel') in detail, ensuring the mathematical patterns conform to this perspective.
- Ensure the output is a single, coherent paragraph.
- IMPORTANT: The final prompt MUST NOT contain any text, words, letters, typography, labels, captions, or mathematical equations visible as text. It should be purely visual art description.
- IMPORTANT: Do not include any instructions or conversational text in the output, only the enhanced prompt.`

    const userPrompt = `Enhance the following art concept:
Dataset: ${dataset}
Scenario: ${scenario}
Color Scheme: ${colorScheme}
Number of Samples: ${numSamples}
Noise Scale: ${noiseScale}
${enableStereographic ? `Stereographic Projection: ${stereographicPerspective}` : ""}
${currentPrompt ? `Current User Idea: ${currentPrompt}` : ""}`

    const { text: enhancedPrompt } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: userPrompt,
    })

    return NextResponse.json({ enhancedPrompt })
  } catch (error: any) {
    console.error("Prompt enhancement error:", error)
    return NextResponse.json({ error: "Failed to enhance prompt", detail: error.message }, { status: 500 })
  }
}
