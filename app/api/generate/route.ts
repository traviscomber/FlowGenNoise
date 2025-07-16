import { NextResponse, type NextRequest } from "next/server"
import { generateFlowField, type GenerationParams } from "@/lib/flow-model"
import { experimental_generateImage } from "ai"
import { openai } from "@ai-sdk/openai"

/**
 * Unified generator for Flow (SVG) and AI modes.
 *
 * Expects JSON:
 * {
 *   mode:        "flow" | "ai",
 *   dataset:     string,
 *   scenario:    string,
 *   seed?:       number,
 *   numSamples?: number,
 *   noiseScale?: number,
 *   timeStep?:   number,
 *   customPrompt?: string
 * }
 *
 * Returns:
 * { imageUrl: string, svgContent?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const {
      mode = "flow",
      dataset,
      scenario,
      seed = Math.floor(Math.random() * 10_000),
      numSamples = 2_000,
      noiseScale = 0.05,
      timeStep = 0.01,
      customPrompt = "",
    } = await req.json()

    if (!dataset || !scenario) {
      return NextResponse.json({ error: "`dataset` and `scenario` are required." }, { status: 400 })
    }

    /* ------------------------------------------------------------------ */
    /* FLOW  (SVG)                                                        */
    /* ------------------------------------------------------------------ */
    if (mode === "flow") {
      const params: GenerationParams = { dataset, scenario, seed, numSamples, noiseScale, timeStep }
      const svgContent = generateFlowField(params)

      // Encode SVG as data-URL so the client can <img src="...">
      const base64 = Buffer.from(svgContent, "utf8").toString("base64")
      const imageUrl = `data:image/svg+xml;base64,${base64}`

      return NextResponse.json({ imageUrl, svgContent })
    }

    /* ------------------------------------------------------------------ */
    /* AI  (DALL·E 3)                                                     */
    /* ------------------------------------------------------------------ */
    const prompt =
      customPrompt.trim() ||
      `Create an artistic piece inspired by a ${dataset} dataset (${numSamples} points) in a ${scenario} theme. ` +
        `Add subtle noise (${noiseScale}) for an organic feel. High-resolution, richly detailed. Seed ${seed}.`

    // If no key, return a placeholder so the local preview still works.
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        imageUrl: `/placeholder.svg?height=512&width=512&query=${encodeURIComponent("flow+art")}`,
      })
    }

    const { image } = await experimental_generateImage({
      model: openai.image("dall-e-3"),
      prompt,
      size: "1024x1024",
      quality: "hd",
      style: "vivid",
    })

    const imageUrl = `data:image/png;base64,${image.base64}`

    return NextResponse.json({ imageUrl })
  } catch (err) {
    console.error("❌ /api/generate error:", err)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}
