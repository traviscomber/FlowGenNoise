import { type NextRequest, NextResponse } from "next/server"
import { generateWithOpenAI, validateGenerationParams } from "./utils"
import { buildPrompt } from "@/lib/ai-prompt"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("🎨 Generation request received:", {
      dataset: body.dataset,
      scenario: body.scenario,
      generateAll: body.generateAll,
      type: body.type,
    })

    // Validate and sanitize parameters
    const params = validateGenerationParams(body)

    // Build the prompt
    let finalPrompt = ""
    if (body.prompt && body.prompt.trim()) {
      finalPrompt = body.prompt.trim()
    } else {
      finalPrompt = buildPrompt({
        dataset: params.dataset,
        scenario: params.scenario,
        colorScheme: params.colorScheme,
        seed: params.seed,
        numSamples: params.numSamples,
        noiseScale: params.noiseScale,
        customPrompt: params.customPrompt,
        panoramic360: params.panoramic360,
        panoramaFormat: params.panoramaFormat,
        projectionType: params.projectionType,
      })
    }

    console.log("📝 Final prompt length:", finalPrompt?.length || 0, "characters")

    // Handle batch generation (all 3 types)
    if (body.generateAll) {
      console.log("🚀 Starting batch generation for all 3 types...")

      const results: any = { errors: [] }

      // Generate standard image
      try {
        console.log("🎨 Generating standard image...")
        const standardResult = await generateWithOpenAI(finalPrompt, "standard", params)
        results.standard = standardResult.imageUrl
        console.log("✅ Standard image generated successfully")
      } catch (error: any) {
        console.error("❌ Standard generation failed:", error.message)
        results.errors.push(`Standard generation failed: ${error.message}`)
      }

      // Generate dome image
      try {
        console.log("🏔️ Generating dome image...")
        const domeResult = await generateWithOpenAI(finalPrompt, "dome", params)
        results.dome = domeResult.imageUrl
        console.log("✅ Dome image generated successfully")
      } catch (error: any) {
        console.error("❌ Dome generation failed:", error.message)
        results.errors.push(`Dome generation failed: ${error.message}`)
      }

      // Generate 360° panorama
      try {
        console.log("🌐 Generating 360° panorama...")
        const panoramaResult = await generateWithOpenAI(finalPrompt, "360", params)
        results.panorama360 = panoramaResult.imageUrl
        console.log("✅ 360° panorama generated successfully")
      } catch (error: any) {
        console.error("❌ 360° generation failed:", error.message)
        results.errors.push(`360° generation failed: ${error.message}`)
      }

      // Check if at least one image was generated
      const successCount = [results.standard, results.dome, results.panorama360].filter(Boolean).length
      console.log(`📊 Batch generation complete: ${successCount}/3 images generated`)

      if (successCount === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "All generations failed",
            errors: results.errors,
          },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        batchGeneration: true,
        ...results,
        provider: "OpenAI DALL-E 3",
        model: "dall-e-3",
        quality: "GODLEVEL Professional",
        parameters: params,
        timestamp: new Date().toISOString(),
      })
    }

    // Handle single image generation
    const type = body.type || "standard"
    console.log(`🎨 Generating single ${type} image...`)

    try {
      const result = await generateWithOpenAI(finalPrompt, type, params)

      return NextResponse.json({
        success: true,
        imageUrl: result.imageUrl,
        prompt: result.prompt,
        type: type,
        aspectRatio: type === "360" ? "2:1" : "1:1",
        format: type === "360" ? "360° Panorama" : type === "dome" ? "Dome Projection" : "Standard",
        resolution: type === "360" ? "1792×1024" : "1024×1024",
        vrOptimized: type === "360",
        seamlessWrapping: type === "360" && params.panoramaFormat === "equirectangular",
        planetariumOptimized: type === "dome",
        projectionType: type === "dome" ? params.projectionType : undefined,
        panoramaFormat: type === "360" ? params.panoramaFormat : undefined,
        provider: "OpenAI DALL-E 3",
        model: "dall-e-3",
        quality: "GODLEVEL Professional",
        parameters: params,
        timestamp: new Date().toISOString(),
      })
    } catch (error: any) {
      console.error(`❌ ${type} generation failed:`, error.message)
      return NextResponse.json(
        {
          success: false,
          error: error.message || `${type} generation failed`,
          type: type,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("❌ API route error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 },
    )
  }
}
