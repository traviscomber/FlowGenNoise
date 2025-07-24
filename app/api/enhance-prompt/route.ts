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
 *   enableStereographic: boolean // Added for stereographic projection
 *   stereographicPerspective: "little-planet" | "tunnel" // Added for stereographic projection
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
      enableStereographic,
      stereographicPerspective,
    }: {
      dataset: string
      scenario: string
      colorScheme: string
      numSamples: number
      noiseScale: number
      currentPrompt?: string
      enableStereographic: boolean
      stereographicPerspective: "little-planet" | "tunnel"
    } = await request.json()

    /* ── 2. Build a fallback (base) prompt ───────────────────────────── */
    const basePrompt = `
Generate a highly detailed, abstract mathematical artwork.

• Dataset .......... ${dataset}
• Scenario ......... ${scenario}
• Colour scheme .... ${colorScheme}
• Sample points .... ≈${numSamples}
• Noise scale ...... ${noiseScale}
${enableStereographic ? `• Stereographic Projection: ${stereographicPerspective === "little-planet" ? "Little Planet" : "Tunnel Vision"}` : ""}

Focus on mathematical elegance, dramatic lighting, and gallery-grade polish.
`.trim()

    /* ── 3. Compose instructions for GPT-4o ───────────────────────────── */
    const SYSTEM_PROMPT =
      "You are a world-class mathematical artist and theoretical physicist who writes museum-quality prompts for AI image generators."

    const USER_PROMPT = `
Elevate the following draft using advanced artistic language.
Describe lighting, materials, atmosphere, scale, and composition.
${enableStereographic ? `Specifically incorporate the chosen stereographic projection style: ${stereographicPerspective === "little-planet" ? "a spherical, planet-like curvature with the viewer looking down at a miniature world. Include curved horizons, radial perspective, and the sense of viewing a tiny sphere from above." : "a dramatic tunnel or vortex-like perspective with strong inward curvature. Include vanishing point effects, radial distortion, and the sense of looking into an infinite tunnel or void."}` : ""}
Finish with:
IMPORTANT: No text, letters, labels, captions, or equations visible.

"""${currentPrompt?.trim() || basePrompt}"""
`.trim()

    /* ── 4. Call GPT-4o (single temperature constant!) ───────────────── */
    const LLM_TEMP = 0.8 // This is the only temperature constant

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: SYSTEM_PROMPT,
      prompt: USER_PROMPT,
      temperature: LLM_TEMP, // This is the only temperature property
      maxTokens: 1_000,
    })

    /* ── 5. Return the enhanced prompt ───────────────────────────────── */
    return NextResponse.json({ enhancedPrompt: text || basePrompt })
  } catch (err: any) {
    console.error("[enhance-prompt] error:", err)
    return NextResponse.json({ error: "Failed to enhance prompt", details: err.message }, { status: 500 })
  }
}
