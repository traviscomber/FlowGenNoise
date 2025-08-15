import { type NextRequest, NextResponse } from "next/server"
import { buildPrompt } from "@/lib/ai-prompt"

export async function POST(request: NextRequest) {
  console.log("🔍 GODLEVEL Prompt preview API called")

  try {
    const body = await request.json()
    const {
      dataset = "vietnamese",
      scenario = "trung-sisters",
      colorScheme = "metallic",
      seed = 1234,
      numSamples = 4000,
      noiseScale = 0.08,
      customPrompt = "",
      panoramic360 = false,
      panoramaFormat = "equirectangular",
      projectionType = "fisheye",
      useCustomPrompt = false,
    } = body

    console.log("📋 Preview parameters:", {
      dataset,
      scenario,
      colorScheme,
      useCustomPrompt,
      customPromptLength: customPrompt.length,
    })

    let previewPrompt: string

    if (useCustomPrompt && customPrompt.trim()) {
      // Use custom prompt as-is for preview
      previewPrompt = customPrompt.trim()
      console.log("📝 Using custom prompt for preview")
    } else {
      // Build GODLEVEL prompt from parameters
      try {
        previewPrompt = buildPrompt({
          dataset,
          scenario,
          colorScheme,
          seed,
          numSamples,
          noiseScale,
          customPrompt: "",
          panoramic360,
          panoramaFormat,
          projectionType,
        })
        console.log("📝 Built GODLEVEL prompt from parameters")
      } catch (buildError) {
        console.error("❌ Failed to build preview prompt:", buildError)
        return NextResponse.json(
          {
            success: false,
            error: "Failed to build preview prompt",
            details: buildError instanceof Error ? buildError.message : "Unknown build error",
          },
          { status: 500 },
        )
      }
    }

    // Analyze prompt characteristics
    const promptAnalysis = {
      length: previewPrompt.length,
      wordCount: previewPrompt.split(/\s+/).length,
      hasGodlevelKeywords: /godlevel|museum|masterpiece|award-winning|professional|ultra-detailed/i.test(previewPrompt),
      hasCulturalTerms: /cultural|heritage|traditional|authentic|respectful/i.test(previewPrompt),
      hasTechnicalTerms: /8K|resolution|quality|composition|lighting|cinematic/i.test(previewPrompt),
      maxLength: 4000,
      utilizationPercentage: Math.round((previewPrompt.length / 4000) * 100),
    }

    // Provide quality assessment
    let qualityLevel = "Basic"
    if (promptAnalysis.hasGodlevelKeywords && promptAnalysis.hasCulturalTerms && promptAnalysis.hasTechnicalTerms) {
      qualityLevel = "GODLEVEL"
    } else if (
      promptAnalysis.hasGodlevelKeywords ||
      (promptAnalysis.hasCulturalTerms && promptAnalysis.hasTechnicalTerms)
    ) {
      qualityLevel = "Professional"
    } else if (promptAnalysis.hasCulturalTerms || promptAnalysis.hasTechnicalTerms) {
      qualityLevel = "Enhanced"
    }

    // Provide suggestions for improvement
    const suggestions = []
    if (!promptAnalysis.hasGodlevelKeywords) {
      suggestions.push("Consider using AI enhancement for GODLEVEL quality descriptors")
    }
    if (!promptAnalysis.hasCulturalTerms) {
      suggestions.push("Add cultural heritage and respectful representation terms")
    }
    if (!promptAnalysis.hasTechnicalTerms) {
      suggestions.push("Include technical photography and quality specifications")
    }
    if (promptAnalysis.length < 500) {
      suggestions.push("Prompt could be more detailed for better results")
    }
    if (promptAnalysis.length > 3800) {
      suggestions.push("Prompt is near character limit - consider optimization")
    }

    console.log(`✅ GODLEVEL prompt preview generated - Length: ${promptAnalysis.length}, Quality: ${qualityLevel}`)

    return NextResponse.json({
      success: true,
      prompt: previewPrompt,
      analysis: promptAnalysis,
      qualityLevel,
      suggestions,
      metadata: {
        dataset,
        scenario,
        colorScheme,
        useCustomPrompt,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error("❌ Prompt preview error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate prompt preview",
        details: error.message || "Unknown preview error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
