import { type NextRequest, NextResponse } from "next/server"
import { callOpenAI, generateDomePrompt, generatePanoramaPrompt } from "./utils"
import { buildPrompt } from "@/lib/ai-prompt"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("🎨 AI Art API called with body:", JSON.stringify(body, null, 2))

    const {
      dataset,
      scenario,
      colorScheme,
      seed,
      numSamples,
      noise,
      timeStep,
      customPrompt,
      domeDiameter,
      domeResolution,
      projectionType,
      panoramaResolution,
      panoramaFormat,
      stereographicPerspective,
    } = body

    // Build the main prompt (shared builder)
    const mainPrompt = buildPrompt(dataset, scenario, colorScheme, customPrompt)
    console.log("📝 Generated main prompt:", mainPrompt.substring(0, 200) + "...")
    console.log("📏 Prompt length:", mainPrompt.length, "characters")

    let mainImageUrl: string
    let domeImageUrl: string
    let panoramaImageUrl: string
    const generationDetails: any = {}

    try {
      console.log("🖼️ Generating main image...")
      mainImageUrl = await callOpenAI(mainPrompt)
      generationDetails.mainImage = "Generated successfully"
      console.log("✅ Main image generated successfully")
    } catch (error: any) {
      console.error("❌ Main image generation failed:", error.message)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate main image: " + error.message,
          promptLength: mainPrompt.length,
          promptPreview: mainPrompt.substring(0, 200) + "...",
        },
        { status: 500 },
      )
    }

    // ALWAYS generate dome projection
    console.log(`🏛️ Generating ${domeDiameter || 20}m dome projection with TUNNEL UP effect...`)
    generationDetails.domeImage = "Generating..."
    try {
      const domePrompt = generateDomePrompt(mainPrompt, domeDiameter, domeResolution, projectionType)
      console.log("📝 Generated dome TUNNEL UP prompt:", domePrompt.substring(0, 200) + "...")
      domeImageUrl = await callOpenAI(domePrompt)
      generationDetails.domeImage = "Generated successfully with TUNNEL UP effect"
      console.log(`✅ ${domeDiameter || 20}m dome TUNNEL UP projection generated successfully`)
    } catch (error: any) {
      console.error(`❌ ${domeDiameter || 20}m dome TUNNEL UP projection generation failed:`, error.message)
      domeImageUrl = mainImageUrl
      generationDetails.domeImage = `Fallback used: ${error.message}`
    }

    // ALWAYS generate 360° panorama
    console.log("🌐 Generating 360° panorama...")
    generationDetails.panoramaImage = "Generating..."
    try {
      const panoramaPrompt = generatePanoramaPrompt(
        mainPrompt,
        panoramaResolution,
        panoramaFormat,
        stereographicPerspective,
      )
      console.log("📝 Generated panorama prompt:", panoramaPrompt.substring(0, 200) + "...")
      panoramaImageUrl = await callOpenAI(panoramaPrompt)
      generationDetails.panoramaImage = "Generated successfully"
      console.log("✅ 360° panorama generated successfully")
    } catch (error: any) {
      console.error("❌ 360° panorama generation failed:", error.message)
      panoramaImageUrl = mainImageUrl
      generationDetails.panoramaImage = `Fallback used: ${error.message}`
    }

    const response = {
      success: true,
      image: mainImageUrl,
      domeImage: domeImageUrl || mainImageUrl,
      panoramaImage: panoramaImageUrl || mainImageUrl,
      originalPrompt: mainPrompt,
      promptLength: mainPrompt.length,
      provider: "OpenAI",
      model: "DALL-E 3",
      estimatedFileSize: "~2-4MB",
      generationDetails,
      parameters: {
        dataset,
        scenario,
        colorScheme,
        seed,
        numSamples,
        noiseScale: noise,
        timeStep,
        domeProjection: true,
        domeDiameter: domeDiameter || 20,
        domeResolution: domeResolution || "4K",
        projectionType: projectionType || "fisheye",
        panoramic360: true,
        panoramaResolution: panoramaResolution || "8K",
        panoramaFormat: panoramaFormat || "equirectangular",
        stereographicPerspective,
      },
    }

    console.log("✅ Returning successful response with all three images including TUNNEL UP dome effect")
    return NextResponse.json(response)
  } catch (error: any) {
    console.error("❌ AI Art generation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate AI art",
        details: error.stack,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
