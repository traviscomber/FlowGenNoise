import { generateFlowField, generateStereographicProjection } from "@/lib/flow-model"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const {
      dataset,
      scenario,
      colorScheme,
      seed,
      numSamples,
      noiseScale,
      timeStep,
      enableStereographic,
      stereographicPerspective,
    } = await req.json()

    let svgContent: string

    if (enableStereographic) {
      svgContent = generateStereographicProjection({
        dataset,
        scenario,
        colorScheme,
        seed,
        numSamples,
        noiseScale,
        timeStep,
        enableStereographic,
        stereographicPerspective,
      })
    } else {
      svgContent = generateFlowField({
        dataset,
        scenario,
        colorScheme,
        seed,
        numSamples,
        noiseScale,
        timeStep,
      })
    }

    return NextResponse.json({ svgContent })
  } catch (error) {
    console.error("Error generating art:", error)
    return NextResponse.json({ error: "Failed to generate art" }, { status: 500 })
  }
}
