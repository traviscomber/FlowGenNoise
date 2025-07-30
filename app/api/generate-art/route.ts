import { type NextRequest, NextResponse } from "next/server"
import { generateFlowField } from "@/lib/flow-model"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Generate art API called with body:", body)

    const {
      dataset = "spirals",
      scenario = "landscape",
      colorScheme = "plasma",
      seed = 1234,
      numSamples = 3000,
      noise = 0.1,
    } = body

    // Generate SVG content using the flow model
    const svgContent = generateFlowField({
      dataset,
      scenario,
      colorScheme,
      seed,
      numSamples,
      noiseScale: noise,
      timeStep: 0.01,
    })

    // Convert SVG to data URL
    const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString("base64")}`

    console.log("SVG generated successfully, length:", svgContent.length)

    return NextResponse.json({
      success: true,
      image: svgDataUrl,
      metadata: {
        dataset,
        scenario,
        colorScheme,
        seed,
        numSamples,
        noise,
      },
    })
  } catch (error: any) {
    console.error("Art generation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate artwork",
      },
      { status: 500 },
    )
  }
}
