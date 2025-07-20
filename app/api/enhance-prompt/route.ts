import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

/**
 * Enhance a draft prompt (or build one from scratch) so it is suitable for a
 * high-quality AI image generator.
 *
 * Response shape:
 *   { enhancedPrompt: string }
 */
export async function POST(request: NextRequest) {
  try {
    /* ------------------------------------------------------------ */
    /* 1 — Parse incoming JSON                                      */
    /* ------------------------------------------------------------ */
    const { dataset, scenario, colorScheme, numSamples, noiseScale, currentPrompt } = (await request.json()) as {
      dataset: string
      scenario: string
      colorScheme: string
      numSamples: number
      noiseScale: number
      currentPrompt?: string
    }

    /* ------------------------------------------------------------ */
    /* 2 — Create a fallback “basePrompt” in case user supplies none */
    /* ------------------------------------------------------------ */
    const basePrompt = `
Generate a highly detailed, abstract mathematical artwork:

• DATASET  = ${dataset}
• SCENARIO = ${scenario}
• COLOURS  = ${colorScheme}
• SAMPLES  ≈ ${numSamples}
• NOISE    = ${noiseScale}

Focus on mathematical beauty, rich lighting, and gallery-grade polish.
`.trim()

    /* ------------------------------------------------------------ */
    /* 3 — Tell the model how to enhance the prompt                  */
    /* ------------------------------------------------------------ */
    const systemPrompt =
      "You are a world-class mathematical artist and theoretical physicist who writes museum-quality AI-art prompts."

    const enhancementPrompt = `
Elevate the following draft.  Use advanced artistic terminology, describe
lighting, physical materials, atmosphere, scale, and composition.
End with:
IMPORTANT: No text, labels, letters, or equations visible.

"""${currentPrompt || basePrompt}"""
`.trim()

    /* ------------------------------------------------------------ */
    /* 4 — Call GPT-4o with ONE temperature constant                */
    /* ------------------------------------------------------------ */
    const TEMPERATURE = 0.8

    const { text: enhancedPrompt } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: enhancementPrompt,
      temperature: TEMPERATURE,
      maxTokens: 1_000,
    })

    /* ------------------------------------------------------------ */
    /* 5 — Return JSON                                              */
    /* ------------------------------------------------------------ */
    return NextResponse.json({
      enhancedPrompt: enhancedPrompt || basePrompt,
    })
  } catch (err: any) {
    console.error("enhance-prompt error:", err)
    return NextResponse.json({ error: "Failed to enhance prompt", details: err.message }, { status: 500 })
  }
}
