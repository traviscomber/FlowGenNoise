import { type NextRequest, NextResponse } from "next/server"
import { generateWithOpenAI, validateGenerationParams } from "./utils"
import { buildPrompt } from "@/lib/ai-prompt"

export async function POST(request: NextRequest) {
  console.log("🎨 Generation API route called")

  try {
    // Parse request body with error handling
    let body: any
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON in request body",
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      )
    }

    console.log("🎨 Generation request received:", {
      dataset: body.dataset,
      scenario: body.scenario,
      generateAll: body.generateAll,
      type: body.type,
    })

    // Validate and sanitize parameters
    const params = validateGenerationParams(body)

    const generationType = body.type || "standard"
    if (generationType === "360") {
      params.panoramic360 = true
      params.domeProjection = false
    } else if (generationType === "dome") {
      params.domeProjection = true
      params.panoramic360 = false
    } else {
      params.panoramic360 = false
      params.domeProjection = false
    }

    // Build the prompt
    let finalPrompt = ""
    try {
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
    } catch (promptError) {
      console.error("❌ Failed to build prompt:", promptError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate prompt",
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }

    if (!finalPrompt || finalPrompt.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Empty prompt generated",
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      )
    }

    console.log("📝 Final prompt generated:", finalPrompt.substring(0, 200) + "...")

    // Handle batch generation (all 3 types)
    if (body.generateAll) {
      console.log("🔄 Starting batch generation for all 3 types...")

      const results: any = { errors: [] }

      // Generate standard image
      try {
        console.log("🎯 Generating standard image...")
        const standardResult = await generateWithOpenAI(finalPrompt, "standard", params)
        results.standard = standardResult.imageUrl
        console.log("✅ Standard image generated successfully")
      } catch (error: any) {
        console.error("❌ Standard generation failed:", error)
        results.errors.push(`Standard generation failed: ${error.message}`)
      }

      // Generate dome projection
      try {
        console.log("🎯 Generating dome projection...")
        const domeResult = await generateWithOpenAI(finalPrompt, "dome", params)
        results.dome = domeResult.imageUrl
        console.log("✅ Dome projection generated successfully")
      } catch (error: any) {
        console.error("❌ Dome generation failed:", error)
        results.errors.push(`Dome generation failed: ${error.message}`)
      }

      // Generate 360° panorama
      try {
        console.log("🎯 Generating 360° panorama...")
        const panoramaResult = await generateWithOpenAI(finalPrompt, "360", params)
        results.panorama360 = panoramaResult.imageUrl
        console.log("✅ 360° panorama generated successfully")
      } catch (error: any) {
        console.error("❌ 360° generation failed:", error)
        results.errors.push(`360° generation failed: ${error.message}`)
      }

      const successCount = [results.standard, results.dome, results.panorama360].filter(Boolean).length
      console.log(`🎉 Batch generation completed: ${successCount}/3 images generated`)

      return NextResponse.json({
        success: true,
        batchGeneration: true,
        ...results,
        prompt: finalPrompt,
        parameters: params,
        timestamp: new Date().toISOString(),
      })
    }

    // Handle single image generation
    console.log(`🎯 Generating single ${generationType} image...`)

    try {
      const result = await generateWithOpenAI(finalPrompt, generationType, params)

      console.log(`✅ ${generationType} image generated successfully`)

      return NextResponse.json({
        success: true,
        imageUrl: result.imageUrl,
        prompt: result.prompt,
        type: generationType,
        aspectRatio: generationType === "360" ? "1.75:1" : "1:1",
        format: generationType === "360" ? "360° Panorama" : generationType === "dome" ? "Dome Projection" : "Standard",
        resolution: generationType === "360" ? "1792×1024" : "1024×1024",
        vrOptimized: generationType === "360",
        seamlessWrapping: generationType === "360" && params.panoramaFormat === "equirectangular",
        planetariumOptimized: generationType === "dome",
        projectionType: generationType === "dome" ? params.projectionType : undefined,
        panoramaFormat: generationType === "360" ? params.panoramaFormat : undefined,
        parameters: params,
        timestamp: new Date().toISOString(),
      })
    } catch (generationError: any) {
      console.error(`❌ ${generationType} generation failed:`, generationError)
      return NextResponse.json(
        {
          success: false,
          error: `${generationType} generation failed: ${generationError.message}`,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("❌ Generation API error:", error)

    // Ensure we always return valid JSON
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown generation error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
