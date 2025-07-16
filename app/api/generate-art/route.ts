import { type NextRequest, NextResponse } from "next/server"
import { generateFlowField, type GenerationParams } from "@/lib/flow-model"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dataset, scenario, seed, numSamples, noiseScale, timeStep } = body

    const params: GenerationParams = {
      dataset: dataset || "spirals",
      scenario: scenario || "forest",
      seed: seed || Math.floor(Math.random() * 10000),
      numSamples: numSamples || 2000,
      noiseScale: noiseScale || 0.05,
      timeStep: timeStep || 0.01,
    }

    const svgContent = generateFlowField(params)

    // Convert SVG to data URL
    const svgBlob = Buffer.from(svgContent, "utf-8")
    const base64 = svgBlob.toString("base64")
    const dataUrl = `data:image/svg+xml;base64,${base64}`

    return NextResponse.json({
      success: true,
      imageUrl: dataUrl,
      svgContent,
      params,
    })
  } catch (error) {
    console.error("Error generating art:", error)
    return NextResponse.json({ success: false, error: "Failed to generate art" }, { status: 500 })
  }
}
