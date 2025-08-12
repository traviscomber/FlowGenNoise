import { type NextRequest, NextResponse } from "next/server"
import { buildPrompt } from "@/lib/ai-prompt"
import { callOpenAI, generateDomePrompt, generatePanoramaPrompt } from "./utils"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
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

    console.log("🎨 Starting professional AI art generation with parameters:", {
      dataset,
      scenario,
      colorScheme,
      seed,
      numSamples,
      noise,
      timeStep,
      customPrompt: customPrompt ? `${customPrompt.substring(0, 50)}...` : "none",
      domeDiameter,
      domeResolution,
      projectionType,
      panoramaResolution,
      panoramaFormat,
      stereographicPerspective,
    })

    // Build the base prompt
    const basePrompt = buildPrompt(dataset, scenario, colorScheme, customPrompt)
    console.log("📝 Base prompt built:", basePrompt.substring(0, 100) + "...")

    // Generate main image
    console.log("🖼️ Generating main image...")
    const mainImage = await callOpenAI(basePrompt, { quality: "hd" })

    let domeImage: string | undefined
    let panoramaImage: string | undefined

    // Generate dome projection if requested
    if (domeDiameter && domeResolution && projectionType) {
      console.log("🏛️ Generating professional dome projection...")
      const domePrompt = generateDomePrompt(basePrompt, domeDiameter, domeResolution, projectionType)
      domeImage = await callOpenAI(domePrompt, { quality: "hd" })
    }

    // Generate 360° panorama if requested
    if (panoramaResolution && panoramaFormat) {
      console.log("🌐 Generating professional 360° panorama with seamless wrapping...")
      const panoramaPrompt = generatePanoramaPrompt(
        basePrompt,
        panoramaResolution,
        panoramaFormat,
        stereographicPerspective,
      )

      // Use optimal size for each format
      let panoSize: "1024x1024" | "1792x1024" | "1024x1792" = "1024x1024"

      if (panoramaFormat === "equirectangular") {
        // Use 1792x1024 for equirectangular (professional widescreen panorama)
        panoSize = "1792x1024"
        console.log(`📐 Using professional panorama format: ${panoSize} (1.75:1 ratio) for seamless 360° wrapping`)
      } else {
        // Use square format for other projection types
        panoSize = "1024x1024"
        console.log(`📐 Using square format: ${panoSize} for ${panoramaFormat} projection`)
      }

      panoramaImage = await callOpenAI(panoramaPrompt, { size: panoSize, quality: "hd" })
    }

    console.log("✅ All professional images generated successfully")

    return NextResponse.json({
      success: true,
      image: mainImage,
      domeImage,
      panoramaImage,
      originalPrompt: basePrompt,
      promptLength: basePrompt.length,
      provider: "OpenAI",
      model: "DALL-E 3",
      quality: "HD Professional",
      parameters: {
        dataset,
        scenario,
        colorScheme,
        seed,
        numSamples,
        noise,
        timeStep,
        domeDiameter,
        domeResolution,
        projectionType,
        panoramaResolution,
        panoramaFormat,
        stereographicPerspective,
      },
    })
  } catch (error: any) {
    console.error("❌ Professional AI art generation failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Generation failed",
        details: error.stack,
      },
      { status: 500 },
    )
  }
}
