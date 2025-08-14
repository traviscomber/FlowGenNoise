import { type NextRequest, NextResponse } from "next/server"
import { buildPrompt } from "@/lib/ai-prompt"
import { generateWithOpenAI, validateGenerationParams, type GenerationParams } from "./utils"

export async function POST(request: NextRequest) {
  try {
    console.log("🎨 Professional AI Art Generation request received")

    const body = await request.json()
    console.log("📝 Request body:", JSON.stringify(body, null, 2))

    // Validate and extract parameters
    const params: GenerationParams = validateGenerationParams(body)
    console.log("🔧 Validated parameters:", params)

    // Check if this is a batch generation request (all 3 types)
    const isBatchGeneration = body.generateAll === true
    const generationType = body.type || "standard"

    console.log("🎯 Generation mode:", isBatchGeneration ? "BATCH (All 3 types)" : `SINGLE (${generationType})`)

    if (isBatchGeneration) {
      // Generate all 3 types in parallel
      console.log("🚀 Starting batch generation for all 3 types...")

      const abortController = new AbortController()
      const signal = abortController.signal

      // Set timeout for the entire batch operation
      const timeoutId = setTimeout(() => {
        abortController.abort()
        console.log("⏰ Batch generation timed out")
      }, 180000) // 3 minute timeout for all 3 images

      try {
        // Build base prompt
        const basePrompt = buildPrompt({
          dataset: params.dataset,
          scenario: params.scenario,
          colorScheme: params.colorScheme,
          seed: params.seed,
          numSamples: params.numSamples,
          noiseScale: params.noiseScale,
          customPrompt: params.customPrompt,
          panoramic360: false,
          panoramaFormat: params.panoramaFormat,
        })

        console.log("📝 Base prompt generated:", basePrompt.substring(0, 200) + "...")

        // Generate all 3 types in parallel with their specific parameters
        const [standardResult, domeResult, panoramaResult] = await Promise.all([
          generateWithOpenAI(basePrompt, "standard", params, signal),
          generateWithOpenAI(basePrompt, "dome", params, signal),
          generateWithOpenAI(basePrompt, "360", params, signal),
        ])

        clearTimeout(timeoutId)
        console.log("✅ All 3 images generated successfully!")

        const response = {
          success: true,
          batchGeneration: true,
          images: {
            standard: {
              imageUrl: standardResult.imageUrl,
              prompt: standardResult.prompt,
              aspectRatio: "1:1",
              format: "Standard Square",
              resolution: "1024x1024",
            },
            dome: {
              imageUrl: domeResult.imageUrl,
              prompt: domeResult.prompt,
              aspectRatio: "1:1",
              format: `Dome ${params.projectionType || "Fisheye"}`,
              planetariumOptimized: true,
              projectionType: params.projectionType || "fisheye",
            },
            panorama: {
              imageUrl: panoramaResult.imageUrl,
              prompt: panoramaResult.prompt,
              aspectRatio: "1.75:1",
              format: `${params.panoramaFormat === "stereographic" ? "Stereographic" : "Equirectangular"} Panorama`,
              vrOptimized: true,
              seamlessWrapping: params.panoramaFormat === "equirectangular",
              panoramaFormat: params.panoramaFormat || "equirectangular",
            },
          },
          provider: "OpenAI DALL-E 3",
          model: "dall-e-3",
          quality: "Professional HD",
          parameters: params,
          timestamp: new Date().toISOString(),
        }

        return NextResponse.json(response)
      } catch (error: any) {
        clearTimeout(timeoutId)
        throw error
      }
    } else {
      // Single generation (existing logic)
      let prompt: string

      if (generationType === "360") {
        prompt = buildPrompt({
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
      } else {
        prompt = buildPrompt({
          dataset: params.dataset,
          scenario: params.scenario,
          colorScheme: params.colorScheme,
          seed: params.seed,
          numSamples: params.numSamples,
          noiseScale: params.noiseScale,
          customPrompt: params.customPrompt,
          panoramic360: false,
          panoramaFormat: params.panoramaFormat,
        })
      }

      console.log("📝 Generated prompt:", prompt.substring(0, 200) + "...")

      // Generate the single image with parameters
      const result = await generateWithOpenAI(prompt, generationType as "standard" | "dome" | "360", params)

      console.log("✅ Single image generated successfully")

      const response = {
        success: true,
        batchGeneration: false,
        imageUrl: result.imageUrl,
        prompt: result.prompt,
        promptLength: prompt.length,
        provider: "OpenAI DALL-E 3",
        model: "dall-e-3",
        quality: "Professional HD",
        generationType: generationType,
        parameters: params,
        timestamp: new Date().toISOString(),
      }

      // Add type-specific metadata
      if (generationType === "360") {
        Object.assign(response, {
          aspectRatio: "1.75:1",
          format: `${params.panoramaFormat === "stereographic" ? "Stereographic" : "Equirectangular"} Panorama`,
          vrOptimized: true,
          seamlessWrapping: params.panoramaFormat === "equirectangular",
          panoramaFormat: params.panoramaFormat || "equirectangular",
        })
      } else if (generationType === "dome") {
        Object.assign(response, {
          aspectRatio: "1:1",
          format: `Dome ${params.projectionType || "Fisheye"}`,
          planetariumOptimized: true,
          projectionType: params.projectionType || "fisheye",
        })
      } else {
        Object.assign(response, {
          aspectRatio: "1:1",
          format: "Standard Square",
          resolution: "1024x1024",
        })
      }

      return NextResponse.json(response)
    }
  } catch (error: any) {
    console.error("❌ Professional generation failed:", error)

    // Handle specific error types
    const errorMessage = error.message || "Failed to generate professional image"
    let statusCode = 500

    if (error.message?.includes("Rate limit")) {
      statusCode = 429
    } else if (error.message?.includes("Invalid request") || error.message?.includes("Bad request")) {
      statusCode = 400
    } else if (error.message?.includes("API key") || error.message?.includes("Invalid API key")) {
      statusCode = 401
    } else if (error.message?.includes("cancelled") || error.message?.includes("AbortError")) {
      statusCode = 499
    } else if (error.message?.includes("timeout")) {
      statusCode = 408
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error.stack || "No stack trace available",
        provider: "OpenAI DALL-E 3",
        timestamp: new Date().toISOString(),
      },
      { status: statusCode },
    )
  }
}
