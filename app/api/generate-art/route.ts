import { type NextRequest, NextResponse } from "next/server"
import { generateFlowArt } from "@/lib/flow-model" // Assuming this function exists
import { plotPointsToSVG } from "@/lib/plot-utils" // Assuming this function exists

/**
 * POST /api/generate-art
 * Body:
 * {
 *   dataset: string
 *   scenario: string
 *   colorScheme: string
 *   numSamples: number
 *   noiseScale: number
 *   enableStereographic: boolean
 *   stereographicPerspective: "little-planet" | "tunnel"
 * }
 *
 * Response:
 *   { svg: string }
 */
export async function POST(request: NextRequest) {
  try {
    const {
      dataset,
      scenario,
      colorScheme,
      numSamples,
      noiseScale,
      enableStereographic,
      stereographicPerspective,
    }: {
      dataset: string
      scenario: string
      colorScheme: string
      numSamples: number
      noiseScale: number
      enableStereographic: boolean
      stereographicPerspective: "little-planet" | "tunnel"
    } = await request.json()

    // Generate mathematical points based on parameters
    const { points, connections } = generateFlowArt({
      dataset,
      scenario,
      numSamples,
      noiseScale,
      enableStereographic,
      stereographicPerspective,
    })

    // Plot points and connections to SVG
    const svg = plotPointsToSVG(points, connections, colorScheme)

    return NextResponse.json({ svg })
  } catch (err: any) {
    console.error("[generate-art] error:", err)
    return NextResponse.json({ error: "Failed to generate mathematical art", details: err.message }, { status: 500 })
  }
}
