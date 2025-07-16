import { type NextRequest, NextResponse } from "next/server"
import { generateFlowField, type GenerationParams } from "@/lib/flow-model"
import { experimental_generateImage } from "ai"
import { openai } from "@ai-sdk/openai"

/**
 * POST /api/generate
 *
 * Unified API endpoint for both Flow Field and AI Art generation.
 *
 * Accepts JSON:
 * {
 *   mode: "flow" | "ai",
 *   dataset: string,
 *   scenario: string,
 *   seed: number,
 *   numSamples?: number,    // For flow mode
 *   noiseScale?: number,    // For flow mode
 *   timeStep?: number,      // For flow mode
 *   customPrompt?: string,  // For AI mode
 *   upscaleMethod?: string  // For AI mode
 * }
 *
 * Returns `{ success:true, imageUrl:string (data-url), svgContent?:string, prompt?:string }`
 * or `{ success:false, error:string }`
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mode, dataset, scenario, seed, numSamples, noiseScale, timeStep, customPrompt } = body

    if (!mode || !dataset || !scenario || seed === undefined) {
      return NextResponse.json(
        { success: false, error: "`mode`, `dataset`, `scenario`, and `seed` are required." },
        { status: 400 },
      )
    }

    if (mode === "flow") {
      // -----------------------------------------------------------------
      // Flow Field Generation
      // -----------------------------------------------------------------
      const params: GenerationParams = {
        dataset,
        scenario,
        seed,
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
    } else if (mode === "ai") {
      // -----------------------------------------------------------------
      // AI Art Generation (DALL·E 3)
      // -----------------------------------------------------------------

      // 1. Build the prompt
      const prompt =
        customPrompt.trim() ||
        `Create a stunning mathematical art piece inspired by a ${dataset} dataset, ` +
          `arranged in a ${scenario} theme. High-resolution, richly detailed, gallery quality. Seed ${seed}.`

      // 2. If no OpenAI key → return placeholder so preview doesn’t crash
      if (!process.env.OPENAI_API_KEY) {
        console.warn("⚠️  OPENAI_API_KEY not set – returning placeholder image.")
        return NextResponse.json({
          success: true,
          placeholder: true,
          prompt,
          imageUrl: "/placeholder.svg?height=512&width=512",
        })
      }

      // 3. Call DALL·E 3 via AI SDK
      const { image } = await experimental_generateImage({
        model: openai.image("dall-e-3"),
        prompt,
        size: "1024x1024",
        quality: "hd",
        style: "vivid",
      })

      const dataUrl = `data:image/png;base64,${image.base64}`

      return NextResponse.json({ success: true, imageUrl: dataUrl, prompt })
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid mode specified. Must be 'flow' or 'ai'." },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Error generating artwork:", error)
    return NextResponse.json({ success: false, error: "Failed to generate artwork." }, { status: 500 })
  }
}
