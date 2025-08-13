import { type NextRequest, NextResponse } from "next/server"
import { buildPrompt } from "@/lib/ai-prompt"
import { generateWithOpenAI, type GenerationParams } from "./utils"

export async function POST(request: NextRequest) {
  try {
    console.log("🎨 Professional AI Art Generation request received")

    const body = await request.json()
    console.log("📝 Request body:", JSON.stringify(body, null, 2))

    // Extract parameters with safe defaults
    const params: GenerationParams = {
      dataset: body.dataset || "vietnamese",
      scenario: body.scenario || "trung-sisters",
      colorScheme: body.colorScheme || "metallic",
      seed: body.seed || Math.floor(Math.random() * 10000),
      numSamples: body.numSamples || 4000,
      noiseScale: body.noiseScale || 0.08,
      customPrompt: body.customPrompt || "",
      domeProjection: body.domeProjection !== undefined ? body.domeProjection : false,
      domeDiameter: body.domeDiameter || 15,
      domeResolution: body.domeResolution || "4K",
      projectionType: body.projectionType || "fisheye",
      panoramic360: body.panoramic360 !== undefined ? body.panoramic360 : false,
      panoramaResolution: body.panoramaResolution || "8K",
      panoramaFormat: body.panoramaFormat || "equirectangular",
      stereographicPerspective: body.stereographicPerspective || "little-planet",
    }

    console.log("🔧 Processing generation request with parameters:", params)

    // Determine generation type
    const generationType = body.type || "standard"
    console.log("🎯 Generation type:", generationType)

    // Build the prompt
    const prompt = buildPrompt({
      dataset: params.dataset,
      scenario: params.scenario,
      colorScheme: params.colorScheme,
      seed: params.seed,
      numSamples: params.numSamples,
      noiseScale: params.noiseScale,
      customPrompt: params.customPrompt,
      panoramic360: generationType === "360",
      panoramaFormat: params.panoramaFormat,
    })

    console.log("📝 Generated prompt:", prompt.substring(0, 200) + "...")

    // Generate the image
    const result = await generateWithOpenAI(prompt, generationType)

    console.log("✅ Image generated successfully")

    const response = {
      success: true,
      imageUrl: result.imageUrl,
      prompt: result.prompt,
      promptLength: prompt.length,
      provider: "OpenAI DALL-E 3",
      model: "dall-e-3",
      quality: "Professional HD",
      estimatedFileSize: "~1.8MB",
      parameters: params,
      generationType: generationType,
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("❌ Professional generation failed:", error)

    // Return detailed error information
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate professional image",
        details: error.stack || "No stack trace available",
        provider: "OpenAI DALL-E 3",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
