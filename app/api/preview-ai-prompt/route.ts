import { type NextRequest, NextResponse } from "next/server"
import { buildPrompt } from "@/lib/ai-prompt"

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Preview AI prompt request received")

    const body = await request.json()
    console.log("📝 Preview request body:", JSON.stringify(body, null, 2))

    // Extract parameters with safe defaults
    const params = {
      dataset: body.dataset || "vietnamese",
      scenario: body.scenario || "trung-sisters",
      colorScheme: body.colorScheme || "metallic",
      seed: body.seed || 1234,
      numSamples: body.numSamples || 4000,
      noiseScale: body.noiseScale || 0.08,
      customPrompt: body.customPrompt || "",
      panoramic360: body.panoramic360 || false,
      panoramaFormat: body.panoramaFormat || "equirectangular",
    }

    console.log("🔧 Processing preview with parameters:", params)

    // Build the god-level prompt
    const prompt = buildPrompt({
      dataset: params.dataset,
      scenario: params.scenario,
      colorScheme: params.colorScheme,
      seed: params.seed,
      numSamples: params.numSamples,
      noiseScale: params.noiseScale,
      customPrompt: params.customPrompt,
      panoramic360: params.panoramic360,
      panoramaFormat: params.panoramaFormat,
    })

    console.log("✅ God-level prompt generated successfully")
    console.log("📏 Prompt length:", prompt.length)

    const response = {
      success: true,
      prompt: prompt,
      promptLength: prompt.length,
      parameters: params,
      quality: "God-Level Professional",
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("❌ Preview generation failed:", error)

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
