import { NextResponse, type NextRequest } from "next/server"
import { experimental_generateImage } from "ai"
import { openai } from "@ai-sdk/openai"

/**
 * POST /api/generate-ai-art
 *
 * Accepts JSON:
 * {
 *   dataset:   "spirals" | …,
 *   scenario:  "forest"  | …,
 *   seed:      number,
 *   numSamples:number,
 *   noise:     number,
 *   customPrompt?: string
 * }
 *
 * Returns `{ success:true, image:string (data-url) }`
 * or `{ success:false, error:string }`
 */
export async function POST(req: NextRequest) {
  try {
    // -----------------------------------------------------------------
    // 1. Parse & validate input
    // -----------------------------------------------------------------
    const {
      dataset,
      scenario,
      seed = Math.floor(Math.random() * 10_000),
      numSamples = 2_000,
      noise = 0.05,
      customPrompt = "",
    } = await req.json()

    if (!dataset || !scenario) {
      return NextResponse.json({ success: false, error: "`dataset` and `scenario` are required." }, { status: 400 })
    }

    // -----------------------------------------------------------------
    // 2. Build the prompt
    // -----------------------------------------------------------------
    const prompt =
      customPrompt.trim() ||
      `Create a stunning mathematical art piece inspired by a ${dataset} dataset with ${numSamples} data points, ` +
        `arranged in a ${scenario} theme. Add subtle noise texture (${noise}) for an organic feel. ` +
        `High-resolution, richly detailed, gallery quality. Seed ${seed}.`

    // -----------------------------------------------------------------
    // 3. If no OpenAI key → return placeholder so preview doesn’t crash
    // -----------------------------------------------------------------
    if (!process.env.OPENAI_API_KEY) {
      console.warn("⚠️  OPENAI_API_KEY not set – returning placeholder image.")
      return NextResponse.json({
        success: true,
        placeholder: true,
        prompt,
        image: "/placeholder.svg?height=512&width=512",
      })
    }

    // -----------------------------------------------------------------
    // 4. Call DALL·E 3 via AI SDK
    // -----------------------------------------------------------------
    const { image } = await experimental_generateImage({
      model: openai.image("dall-e-3"),
      prompt,
      size: "1024x1024",
      quality: "hd",
      style: "vivid",
    })

    const dataUrl = `data:image/png;base64,${image.base64}`

    return NextResponse.json({ success: true, image: dataUrl, prompt })
  } catch (err: unknown) {
    console.error("❌ AI-generation error:", err)
    return NextResponse.json({ success: false, error: "Failed to generate AI art." }, { status: 500 })
  }
}
