import { generateFlowArtData } from "@/lib/flow-model"
import { getSvgDataUrl } from "@/lib/plot-utils"
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
      width,
      height,
    } = await req.json()

    const { points, colors } = generateFlowArtData({
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

    // Generate SVG data URL
    const svgDataUrl = getSvgDataUrl(points, colors, enableStereographic, stereographicPerspective, width, height)

    return NextResponse.json({ imageUrl: svgDataUrl })
  } catch (error) {
    console.error("Error generating art:", error)
    return NextResponse.json({ error: "Failed to generate art" }, { status: 500 })
  }
}
