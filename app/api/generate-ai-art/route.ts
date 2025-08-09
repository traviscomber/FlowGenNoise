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

    console.log("🎨 Starting AI art generation with parameters:", {
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
    const mainImage = await callOpenAI(basePrompt)

    let domeImage: string | undefined
    let panoramaImage: string | undefined

    // Generate dome projection if requested
    if (domeDiameter && domeResolution && projectionType) {
      console.log("🏛️ Generating dome projection...")
      const domePrompt = generateDomePrompt(basePrompt, domeDiameter, domeResolution, projectionType)
      domeImage = await callOpenAI(domePrompt)
    }

    // Generate 360° panorama if requested
    if (panoramaResolution && panoramaFormat) {
      console.log("🌐 Generating 360° panorama...")
      const panoramaPrompt = generatePanoramaPrompt(
        basePrompt,
        panoramaResolution,
        panoramaFormat,
        stereographicPerspective,
      )

      // Prefer a landscape panoramic output (closest to 2:1) for equirectangular.
      const panoSize = panoramaFormat === "equirectangular" ? "1792x1024" : "1024x1024"

      panoramaImage = await callOpenAI(panoramaPrompt, { size: panoSize })
    }

    console.log("✅ All images generated successfully")

    return NextResponse.json({
      success: true,
      image: mainImage,
      domeImage,
      panoramaImage,
      originalPrompt: basePrompt,
      promptLength: basePrompt.length,
      provider: "OpenAI",
      model: "DALL-E 3",
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
    console.error("❌ AI art generation failed:", error)
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
