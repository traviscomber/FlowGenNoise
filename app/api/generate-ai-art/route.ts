import { type NextRequest, NextResponse } from "next/server"
import { generateImage, validateGenerationParams } from "./utils"
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
      generateTypes: body.generateTypes, // Log generation types
      type: body.type,
      provider: body.provider,
      model: body.model,
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

    const provider = body.provider || "replicate"
    const model = body.model || "black-forest-labs/flux-1.1-pro"

    console.log(`🤖 Using provider: ${provider}, model: ${model}`)

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

    if (body.generateAll === false && body.generateTypes) {
      console.log("🔄 Starting selective generation based on user preferences...")
      console.log("🎯 Selected types:", body.generateTypes)

      const results: any = { errors: [] }

      // Generate only selected image types
      if (body.generateTypes.standard) {
        try {
          console.log("🎯 Generating standard image...")
          const standardResult = await generateImage(finalPrompt, "standard", params, provider, model)
          results.standard = standardResult.imageUrl
          console.log("✅ Standard image generated successfully")
          console.log("[v0] Standard image URL:", standardResult.imageUrl)
        } catch (error: any) {
          console.error("❌ Standard generation failed:", error)
          results.errors.push(`Standard generation failed: ${error.message}`)
        }
      }

      if (body.generateTypes.dome) {
        try {
          console.log("🎯 Generating dome projection...")
          const domeResult = await generateImage(finalPrompt, "dome", params, provider, model)
          results.dome = domeResult.imageUrl
          console.log("✅ Dome projection generated successfully")
          console.log("[v0] Dome image URL:", domeResult.imageUrl)
        } catch (error: any) {
          console.error("❌ Dome generation failed:", error)
          results.errors.push(`Dome generation failed: ${error.message}`)
        }
      }

      if (body.generateTypes.panorama360) {
        try {
          console.log("🎯 Generating 360° panorama...")
          const panoramaResult = await generateImage(finalPrompt, "360", params, provider, model)
          results.panorama360 = panoramaResult.imageUrl
          console.log("✅ 360° panorama generated successfully")
          console.log("[v0] 360° image URL:", panoramaResult.imageUrl)
        } catch (error: any) {
          console.error("❌ 360° generation failed:", error)
          results.errors.push(`360° generation failed: ${error.message}`)
        }
      }

      const selectedCount = Object.values(body.generateTypes).filter(Boolean).length
      const successCount = [results.standard, results.dome, results.panorama360].filter(Boolean).length
      console.log(`🎉 Selective generation completed: ${successCount}/${selectedCount} images generated`)

      console.log("[v0] Final results being returned to frontend:")
      console.log("[v0] Results.standard exists:", !!results.standard)
      console.log("[v0] Results.dome exists:", !!results.dome)
      console.log("[v0] Results.panorama360 exists:", !!results.panorama360)
      console.log("[v0] Results.errors:", results.errors)

      return NextResponse.json({
        success: true,
        selectiveGeneration: true,
        ...results,
        prompt: finalPrompt,
        parameters: params,
        timestamp: new Date().toISOString(),
      })
    }

    // Handle batch generation (all 3 types) - fallback for generateAll: true
    if (body.generateAll) {
      console.log("🔄 Starting batch generation for all 3 types...")

      const results: any = { errors: [] }

      // Generate standard image
      try {
        console.log("🎯 Generating standard image...")
        const standardResult = await generateImage(finalPrompt, "standard", params, provider, model)
        results.standard = standardResult.imageUrl
        console.log("✅ Standard image generated successfully")
        console.log("[v0] Standard image URL:", standardResult.imageUrl)
        console.log("[v0] Standard image URL length:", standardResult.imageUrl?.length || 0)
        console.log(
          "[v0] Standard image URL starts with https:",
          standardResult.imageUrl?.startsWith("https://") || false,
        )
      } catch (error: any) {
        console.error("❌ Standard generation failed:", error)
        results.errors.push(`Standard generation failed: ${error.message}`)
      }

      // Generate dome projection
      try {
        console.log("🎯 Generating dome projection...")
        const domeResult = await generateImage(finalPrompt, "dome", params, provider, model)
        results.dome = domeResult.imageUrl
        console.log("✅ Dome projection generated successfully")
        console.log("[v0] Dome image URL:", domeResult.imageUrl)
        console.log("[v0] Dome image URL length:", domeResult.imageUrl?.length || 0)
        console.log("[v0] Dome image URL starts with https:", domeResult.imageUrl?.startsWith("https://") || false)
      } catch (error: any) {
        console.error("❌ Dome generation failed:", error)
        results.errors.push(`Dome generation failed: ${error.message}`)
      }

      // Generate 360° panorama
      try {
        console.log("🎯 Generating 360° panorama...")
        const panoramaResult = await generateImage(finalPrompt, "360", params, provider, model)
        results.panorama360 = panoramaResult.imageUrl
        console.log("✅ 360° panorama generated successfully")
        console.log("[v0] 360° image URL:", panoramaResult.imageUrl)
        console.log("[v0] 360° image URL length:", panoramaResult.imageUrl?.length || 0)
        console.log("[v0] 360° image URL starts with https:", panoramaResult.imageUrl?.startsWith("https://") || false)
      } catch (error: any) {
        console.error("❌ 360° generation failed:", error)
        results.errors.push(`360° generation failed: ${error.message}`)
      }

      const successCount = [results.standard, results.dome, results.panorama360].filter(Boolean).length
      console.log(`🎉 Batch generation completed: ${successCount}/3 images generated`)

      console.log("[v0] Final results being returned to frontend:")
      console.log("[v0] Results.standard exists:", !!results.standard)
      console.log("[v0] Results.dome exists:", !!results.dome)
      console.log("[v0] Results.panorama360 exists:", !!results.panorama360)
      console.log("[v0] Results.errors:", results.errors)

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
      const result = await generateImage(finalPrompt, generationType, params, provider, model)

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
