import { generateFlowField } from "@/lib/flow-model"
import { drawFlowFieldToSVG } from "@/lib/plot-utils"

export const runtime = "edge"

export async function POST(req: Request) {
  try {
    const {
      width = 800,
      height = 600,
      depth = 100,
      numSamples,
      noiseScale,
      dataset,
      scenario,
      colorScheme,
      seed = Math.floor(Math.random() * 100000),
      enableStereographic,
      stereographicPerspective,
    } = await req.json()

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

    const svg = drawFlowFieldToSVG(flowField, width, height)

    return new Response(JSON.stringify({ svg }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error: any) {
    console.error("Error generating mathematical art:", error)
    return new Response(JSON.stringify({ details: error.message || "Internal Server Error" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    })
  }
}
