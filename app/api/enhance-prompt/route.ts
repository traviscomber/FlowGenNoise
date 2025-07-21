import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

/**
 * POST /api/enhance-prompt
 * Enhances (or builds) a “god-level” prompt for AI-image generation.
 * Response → { enhancedPrompt: string }
 */
export async function POST(request: NextRequest) {
  try {
    /* ──────────────────────────────────────────────────────────
       1. Read parameters from the client
    ────────────────────────────────────────────────────────── */
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

    /* ──────────────────────────────────────────────────────────
       2. Fallback prompt if nothing was supplied
    ────────────────────────────────────────────────────────── */
    const fallback = `
Generate a highly-detailed abstract mathematical artwork.

• DATASET  = ${dataset}
• SCENARIO = ${scenario}
• PALETTE  = ${colorScheme}
• SAMPLES  ≈ ${numSamples}
• NOISE    = ${noiseScale}

Focus on mathematical beauty, rich lighting, and gallery-grade polish.
`.trim()

    /* ──────────────────────────────────────────────────────────
       3. Instruction for the LLM
    ────────────────────────────────────────────────────────── */
    const system =
      "You are a world-class mathematical artist and theoretical physicist who writes museum-quality AI-art prompts."

    const user = `
Elevate the following draft prompt. Use advanced artistic vocabulary,
describe lighting, physical materials, atmosphere, scale and composition.
Finish with:
IMPORTANT: No text, labels, letters or equations visible.

"""${currentPrompt || fallback}"""
`.trim()

    /* ──────────────────────────────────────────────────────────
       4. Call GPT-4o  (one temperature constant only)
    ────────────────────────────────────────────────────────── */
    const LLM_TEMPERATURE = 0.8

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system,
      prompt: user,
      temperature: LLM_TEMPERATURE,
      maxTokens: 1_000,
    })

    /* ──────────────────────────────────────────────────────────
       5. Return the enhanced prompt (or fallback)
    ────────────────────────────────────────────────────────── */
    return NextResponse.json({ enhancedPrompt: text || fallback })
  } catch (error: any) {
    console.error("enhance-prompt error:", error)
    return NextResponse.json({ error: "Failed to enhance prompt", detail: error.message }, { status: 500 })
  }
}
