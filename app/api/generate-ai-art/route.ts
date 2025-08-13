import { type NextRequest, NextResponse } from "next/server"
import { buildPrompt } from "@/lib/ai-prompt"
import { generateWithOpenAI, type GenerationParams } from "./utils"

export async function POST(request: NextRequest) {
  try {
    console.log("🎨 Professional AI Art Generation request received")

    const body = await request.json()
    console.log("📝 Request body:", body)

    // Extract parameters with safe defaults
    const params: GenerationParams = {
      dataset: body.dataset || "vietnamese",
      scenario: body.scenario || "temple-of-literature",
      colorScheme: body.colorScheme || "cosmic",
      seed: body.seed || Math.floor(Math.random() * 10000),
      numSamples: body.numSamples || 4000,
      noiseScale: body.noiseScale || 0.08,
      customPrompt: body.customPrompt || "",
      domeProjection: body.domeProjection !== undefined ? body.domeProjection : true,
      domeDiameter: body.domeDiameter || 15,
      domeResolution: body.domeResolution || "4K",
      projectionType: body.projectionType || "fisheye",
      panoramic360: body.panoramic360 !== undefined ? body.panoramic360 : true,
      panoramaResolution: body.panoramaResolution || "8K",
      panoramaFormat: body.panoramaFormat || "equirectangular",
      stereographicPerspective: body.stereographicPerspective || "little-planet",
    }

    console.log("🔧 Processing generation request with parameters:", params)

    // Generate all three versions
    const results: any = {}

    // Build prompts for each type
    const standardPrompt = buildPrompt({
      dataset: params.dataset,
      scenario: params.scenario,
      colorScheme: params.colorScheme,
      seed: params.seed,
      numSamples: params.numSamples,
      noiseScale: params.noiseScale,
      customPrompt: params.customPrompt,
      panoramic360: false,
    })

    console.log("📝 Standard prompt built:", standardPrompt.substring(0, 100) + "...")

    // Generate standard image
    console.log("🖼️ Generating standard image...")
    const standardResult = await generateWithOpenAI(standardPrompt, "standard")
    results.image = standardResult.imageUrl

    // Generate dome image if enabled
    if (params.domeProjection) {
      console.log("🏛️ Generating dome projection...")
      const domePrompt = buildPrompt({
        dataset: params.dataset,
        scenario: params.scenario,
        colorScheme: params.colorScheme,
        seed: params.seed,
        numSamples: params.numSamples,
        noiseScale: params.noiseScale,
        customPrompt: params.customPrompt,
        panoramic360: false,
      })
      const domeResult = await generateWithOpenAI(domePrompt, "dome")
      results.domeImage = domeResult.imageUrl
    }

    // Generate 360° panorama if enabled
    if (params.panoramic360) {
      console.log("🌐 Generating 360° panorama...")
      const panoramaPrompt = buildPrompt({
        dataset: params.dataset,
        scenario: params.scenario,
        colorScheme: params.colorScheme,
        seed: params.seed,
        numSamples: params.numSamples,
        noiseScale: params.noiseScale,
        customPrompt: params.customPrompt,
        panoramic360: true,
        panoramaFormat: params.panoramaFormat,
      })
      const panoramaResult = await generateWithOpenAI(panoramaPrompt, "360")
      results.panoramaImage = panoramaResult.imageUrl
    }

    console.log("✅ All images generated successfully")

    const response = {
      success: true,
      image: results.image,
      domeImage: results.domeImage || null,
      panoramaImage: results.panoramaImage || null,
      originalPrompt: standardPrompt,
      promptLength: standardPrompt.length,
      provider: "OpenAI DALL-E 3",
      model: "dall-e-3",
      quality: "Professional HD",
      estimatedFileSize: "~1.8MB standard, ~2.5MB panorama",
      generationDetails: {
        mainImage: results.image,
        domeImage: results.domeImage || "Not generated",
        panoramaImage: results.panoramaImage || "Not generated",
      },
      parameters: params,
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
