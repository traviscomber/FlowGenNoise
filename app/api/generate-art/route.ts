import { type NextRequest, NextResponse } from "next/server"
import { generateFlowArt } from "@/lib/flow-model"

/**
 * POST /api/generate-art
 * Body:
 * {
 *   dataset: string,
 *   scenario: string,
 *   colorScheme: string,
 *   numSamples: number,
 *   noiseScale: number,
 *   enableStereographic: boolean,
 *   stereographicPerspective: "little-planet" | "tunnel"
 * }
 *
 * Response:
 *   { svg: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { dataset, scenario, colorScheme, numSamples, noiseScale, enableStereographic, stereographicPerspective } =
      await request.json()

    if (!dataset || !scenario || !colorScheme || !numSamples || !noiseScale) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const svg = generateFlowArt({
      dataset,
      scenario,
      colorScheme,
      numSamples,
      noiseScale,
      enableStereographic,
      stereographicPerspective,
    })

    return NextResponse.json({ svg })
  } catch (err: any) {
    console.error("[generate-art] error:", err)
    return NextResponse.json({ error: "Failed to generate mathematical art", details: err.message }, { status: 500 })
  }
}
