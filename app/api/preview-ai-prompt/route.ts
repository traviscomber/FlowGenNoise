import { type NextRequest, NextResponse } from "next/server"
import { buildPrompt } from "@/lib/ai-prompt"

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Preview AI prompt request received")

    const body = await request.json()
    console.log("📝 Request body:", body)

    // Extract parameters with safe defaults
    const params = {
      dataset: body?.dataset || "vietnamese",
      scenario: body?.scenario || "temple-of-literature",
      colorScheme: body?.colorScheme || "cosmic",
      seed: body?.seed || 1234,
      numSamples: body?.numSamples || 4000,
      noiseScale: body?.noiseScale || 0.08,
      customPrompt: body?.customPrompt || "",
      panoramic360: body?.panoramic360 !== undefined ? body.panoramic360 : false,
      panoramaFormat: body?.panoramaFormat || "equirectangular",
    }

    console.log("🔧 Processing with safe params:", params)

    // Build the prompt using the utility function
    const prompt = buildPrompt(params)

    console.log("✅ Prompt built successfully, length:", prompt.length)
    console.log("📝 Prompt preview:", prompt.substring(0, 200) + "...")

    return NextResponse.json({
      success: true,
      prompt: prompt,
      length: prompt.length,
      parameters: params,
    })
  } catch (error: any) {
    console.error("❌ Preview prompt failed:", error)

    // Return a safe fallback response
    const fallbackPrompt =
      "Beautiful Vietnamese temple with traditional architecture, cosmic nebula colors, professional quality, ultra-high detail, immersive, cinematic lighting, masterpiece artwork. Generated with 4000 data points, noise scale 0.08, seed 1234."

    return NextResponse.json({
      success: true,
      prompt: fallbackPrompt,
      length: fallbackPrompt.length,
      error: "Used fallback prompt due to: " + error.message,
      parameters: {
        dataset: "vietnamese",
        scenario: "temple-of-literature",
        colorScheme: "cosmic",
      },
    })
  }
}
