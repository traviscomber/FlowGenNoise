import { type NextRequest, NextResponse } from "next/server"
import { generateFlowField } from "@/lib/flow-model"

/**
 * POST /api/generate-art
 * Generates mathematical flow field data based on client parameters.
 * Response → { flowField: FlowFieldPoint[] }
 */
export async function POST(request: NextRequest) {
  try {
    const {
      width,
      height,
      depth,
      numSamples,
      noiseScale,
      dataset,
      scenario,
      colorScheme,
      seed,
      enableStereographic,
      stereographicPerspective,
    } = await request.json()

    const flowField = generateFlowField({
      width,
      height,
      depth,
      numSamples,
      noiseScale,
      dataset,
      scenario,
      colorScheme,
      seed,
      enableStereographic,
      stereographicPerspective,
    })

    return NextResponse.json({ flowField })
  } catch (error: any) {
    console.error("Generate art error:", error)
    return NextResponse.json({ error: "Failed to generate art", details: error.message }, { status: 500 })
  }
}
