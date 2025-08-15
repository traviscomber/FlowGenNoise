import { type NextRequest, NextResponse } from "next/server"
import { buildPrompt } from "@/lib/ai-prompt"

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Preview AI Prompt request received")

    const body = await request.json()
    console.log("📝 Request body:", JSON.stringify(body, null, 2))

    // Safe parameter extraction with fallback defaults
    const params = {
      dataset: body.dataset || "vietnamese",
      scenario: body.scenario || "trung-sisters",
      colorScheme: body.colorScheme || "metallic",
      seed: typeof body.seed === "number" ? body.seed : Math.floor(Math.random() * 10000),
      numSamples: typeof body.numSamples === "number" ? body.numSamples : 4000,
      noiseScale: typeof body.noiseScale === "number" ? body.noiseScale : 0.08,
      customPrompt: body.customPrompt || "",
      panoramic360: body.panoramic360 || false,
      panoramaFormat: body.panoramaFormat || "equirectangular",
    }

    console.log("🔧 Safe parameters:", params)

    // Build the prompt
    const prompt = buildPrompt(params)

    console.log("📝 Generated prompt preview:", prompt.substring(0, 200) + "...")

    // Calculate statistics
    const wordCount = prompt.split(/\s+/).length
    const charCount = prompt.length
    const estimatedTokens = Math.ceil(charCount / 4) // Rough estimate

    const response = {
      success: true,
      prompt: prompt,
      statistics: {
        characters: charCount,
        words: wordCount,
        estimatedTokens: estimatedTokens,
        maxLength: 4000,
        withinLimit: charCount <= 4000,
      },
      parameters: params,
      timestamp: new Date().toISOString(),
    }

    console.log("✅ Prompt preview generated successfully")
    return NextResponse.json(response)
  } catch (error: any) {
    console.error("❌ Preview generation failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate prompt preview",
        details: error.stack || "No stack trace available",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
