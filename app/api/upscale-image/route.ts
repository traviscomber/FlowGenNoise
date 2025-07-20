import { type NextRequest, NextResponse } from "next/server"
import { generateFlowField } from "@/lib/flow-model"

/**
 * POST /api/upscale-image
 *
 * Body:
 * {
 *   dataset: string,
 *   scenario: string,
 *   colorScheme: string,
 *   seed: number,
 *   numSamples: number,
 *   noise: number,
 *   scaleFactor: number,
 *   highResolution: boolean,
 *   extraDetail: boolean
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const { dataset, scenario, colorScheme, seed, numSamples, noise, scaleFactor, highResolution, extraDetail } =
      await req.json()

    // For mathematical upscaling, we re-generate the SVG with higher parameters
    const upscaledSvgContent = generateFlowField({
      dataset,
      scenario,
      colorScheme,
      seed,
      numSamples: numSamples * scaleFactor * scaleFactor, // Increase samples for higher detail
      noiseScale: noise,
      timeStep: 0.01, // Time step is not directly scaled, keep consistent
      enableStereographic: false, // Upscaling is for the base flow field
      stereographicPerspective: undefined,
    })

    // In a real application, you might convert this SVG to a high-res PNG here
    // using a server-side library like `sharp` or `resvg-js`.
    // For this example, we'll just return the SVG content.
    return NextResponse.json({
      upscaledSvgContent,
      message: "Mathematical upscaling applied (SVG re-generated with more points).",
    })
  } catch (err: any) {
    console.error("Upscale image route error:", err)
    return NextResponse.json({ error: "Image upscaling failed", detail: err.message }, { status: 500 })
  }
}
