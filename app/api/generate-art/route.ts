import {
  generateFlowField,
  generateHighResFlowField,
  type GenerationParams,
  type UpscaleParams,
} from "@/lib/flow-model"

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
      scaleFactor,
      highResolution,
      extraDetail,
    } = (await req.json()) as GenerationParams & UpscaleParams

    let svgString: string

    if (enableStereographic) {
      svgString = generateFlowField({
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
      svgString = generateHighResFlowField({
        dataset,
        scenario,
        colorScheme,
        seed,
        numSamples,
        noiseScale,
        timeStep,
        scaleFactor,
        highResolution,
        extraDetail,
      })
    }

    // Convert SVG string to a data URL
    const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgString).toString("base64")}`

    return new Response(JSON.stringify({ imageUrl: svgDataUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error generating art:", error)
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
