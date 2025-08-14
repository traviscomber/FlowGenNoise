import { type NextRequest, NextResponse } from "next/server"
import { buildPrompt } from "@/lib/ai-prompt"

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Preview AI prompt request received")

    const body = await request.json()
    console.log("📝 Preview request body:", JSON.stringify(body, null, 2))

    // Safe parameter validation with fallback defaults
    const params = {
      dataset: body.dataset || "vietnamese",
      scenario: body.scenario || "trung-sisters",
      colorScheme: body.colorScheme || "metallic",
      seed: typeof body.seed === "number" ? body.seed : 1234,
      numSamples: typeof body.numSamples === "number" ? body.numSamples : 4000,
      noiseScale: typeof body.noiseScale === "number" ? body.noiseScale : 0.08,
      customPrompt: body.customPrompt || "",
      panoramic360: body.panoramic360 || false,
      panoramaFormat: body.panoramaFormat || "equirectangular",
    }

    console.log("🔧 Processing preview with safe parameters:", params)

    // Build the prompt using the same function as generation
    const prompt = buildPrompt(params)

    console.log("✅ Prompt preview generated successfully")
    console.log("📏 Prompt length:", prompt.length)

    return NextResponse.json({
      success: true,
      prompt: prompt,
      promptLength: prompt.length,
      parameters: params,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("❌ Preview prompt failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to preview prompt",
        details: error.stack || "No stack trace available",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
