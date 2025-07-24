import Replicate from "replicate"
import type { UpscaleParams } from "@/lib/flow-model"
import { generateHighResFlowField } from "@/lib/flow-model"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(req: Request) {
  try {
    const params = (await req.json()) as UpscaleParams

    // Generate the high-resolution SVG locally first
    const svgString = generateHighResFlowField(params)

    // Convert SVG string to a data URL
    const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgString).toString("base64")}`

    // Use Replicate to upscale the image (SVG to PNG conversion and upscaling)
    // Note: Replicate's models typically take image URLs or base64 data.
    // We'll use a general image upscaling model.
    const output = await replicate.run(
      "nightmareai/real-esrgan:42fed1c4974146ea495a897357674777957f1137be936de67a1767e2c732549c",
      {
        input: {
          image: svgDataUrl,
          scale: params.scaleFactor, // Use the requested scale factor
        },
      },
    )

    return new Response(JSON.stringify({ upscaledImageUrl: output }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error upscaling image:", error)
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
