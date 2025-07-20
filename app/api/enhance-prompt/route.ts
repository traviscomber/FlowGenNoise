import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

/**
 * POST /api/enhance-prompt
 * Builds a “god-level” prompt for AI image generation and
 * returns the enhanced text in JSON: { enhancedPrompt: string }
 */
export async function POST(request: NextRequest) {
  try {
    /* ------------------------------------------------------------------ */
    /* 1. Parse request body                                              */
    /* ------------------------------------------------------------------ */
    const {
      dataset,
      scenario,
      colorScheme,
      numSamples,
      noiseScale,
      currentPrompt,
    }: {
      dataset: string
      scenario: string
      colorScheme: string
      numSamples: number
      noiseScale: number
      currentPrompt?: string
    } = await request.json()

    /* ------------------------------------------------------------------ */
    /* 2. Compose the base (fallback) prompt                              */
    /* ------------------------------------------------------------------ */
    const basePrompt = `
Generate a highly detailed, abstract mathematical artwork:

• DATASET "${dataset}" introduces intricate visual patterns.
• SCENARIO "${scenario}" provides thematic atmosphere.
• COLOR SCHEME "${colorScheme}" dictates the palette.
• SAMPLE POINTS ≈ ${numSamples}, NOISE SCALE ${noiseScale}.

Focus on vibrant color interplay, mathematical beauty, and gallery-level polish.`.trim()

    /* ------------------------------------------------------------------ */
    /* 3. Build the instruction we send to the LLM to make it “god-level” */
    /* ------------------------------------------------------------------ */
    const systemPrompt =
      "You are a world-class mathematical artist and theoretical physicist who crafts museum-quality AI art prompts."

    const enhancementPrompt = `
Create an extraordinary AI-art prompt based on the following details.

DATASET:        ${dataset}
SCENARIO:       ${scenario}
COLOR SCHEME:   ${colorScheme}
SAMPLE POINTS:  ${numSamples}
NOISE SCALE:    ${noiseScale}
CURRENT PROMPT: ${currentPrompt ?? "—"}

Requirements:
1. Describe mathematical foundations as visual structures.
2. Translate physical laws into compositional elements.
3. Specify professional lighting, materials, and camera work.
4. Provide scale hints (quantum ⇄ cosmic) & artistic techniques.
5. End with:  IMPORTANT: No text, letters, labels or equations.

Respond with the final prompt ONLY.`.trim()

    /* ------------------------------------------------------------------ */
    /* 4. Call the model                                                  */
    /* ------------------------------------------------------------------ */
    const TEMPERATURE = 0.8

    const { text: enhancedPrompt } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: enhancementPrompt,
      maxTokens: 1_000,
      temperature: TEMPERATURE,
    })

    /* ------------------------------------------------------------------ */
    /* 5. Return JSON response                                            */
    /* ------------------------------------------------------------------ */
    return NextResponse.json({ enhancedPrompt: enhancedPrompt || basePrompt })
  } catch (error: any) {
    console.error("enhance-prompt error:", error)
    return NextResponse.json(
      {
        error: "Failed to enhance prompt",
        details: error?.message ?? "Unknown error",
      },
      { status: 500 },
    )
  }
}
