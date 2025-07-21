import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

/**
 * POST /api/enhance-prompt
 * Body:
 * {
 *   dataset: string
 *   scenario: string
 *   colorScheme: string
 *   numSamples: number
 *   noiseScale: number
 *   currentPrompt?: string
 * }
 *
 * Response:
 *   { enhancedPrompt: string }
 */
export async function POST(request: NextRequest) {
  try {
    /* ── 1. Parse request ─────────────────────────────────────────────── */
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

    /* ── 2. Build a fallback (base) prompt ───────────────────────────── */
    const basePrompt = `
Generate a highly detailed, abstract mathematical artwork.

• Dataset .......... ${dataset}
• Scenario ......... ${scenario}
• Colour scheme .... ${colorScheme}
• Sample points .... ≈${numSamples}
• Noise scale ...... ${noiseScale}

Focus on mathematical elegance, dramatic lighting, and gallery-grade polish.
`.trim()

    /* ── 3. Compose instructions for GPT-4o ───────────────────────────── */
    const SYSTEM_PROMPT =
      "You are a world-class mathematical artist and theoretical physicist who writes museum-quality prompts for AI image generators."

    const USER_PROMPT = `
Elevate the following draft using advanced artistic language.
Describe lighting, materials, atmosphere, scale, and composition.
Finish with:
IMPORTANT: No text, letters, labels, captions, or equations visible.

"""${currentPrompt?.trim() || basePrompt}"""
`.trim()

    /* ── 4. Call GPT-4o (single temperature constant!) ───────────────── */
    const LLM_TEMP = 0.8

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: SYSTEM_PROMPT,
      prompt: USER_PROMPT,
      temperature: LLM_TEMP, // ← one and only declaration
      maxTokens: 1_000,
    })

    /* ── 5. Return the enhanced prompt ───────────────────────────────── */
    return NextResponse.json({ enhancedPrompt: text || basePrompt })
  } catch (err: any) {
    console.error("[enhance-prompt] error:", err)
    return NextResponse.json({ error: "Failed to enhance prompt", details: err.message }, { status: 500 })
  }
}
