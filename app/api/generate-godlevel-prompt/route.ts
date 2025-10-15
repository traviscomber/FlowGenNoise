import { type NextRequest, NextResponse } from "next/server"
import { CULTURAL_DATASETS, COLOR_SCHEMES, buildPrompt } from "@/lib/ai-prompt"

export async function POST(request: NextRequest) {
  console.log("[v0] Godlevel prompt API called")

  try {
    console.log("[v0] Parsing request body")
    const {
      dataset,
      scenario,
      colorScheme,
      customPrompt,
      panoramic360,
      projectionType,
      maxLength = 4000,
      originalPrompt,
    } = await request.json()

    console.log("[v0] Request parameters:", { dataset, scenario, colorScheme, maxLength, projectionType, panoramic360 })

    const selectedDataset = CULTURAL_DATASETS[dataset as keyof typeof CULTURAL_DATASETS]
    const selectedScenario = selectedDataset?.scenarios[scenario as keyof typeof selectedDataset.scenarios]
    const colorDescription = COLOR_SCHEMES[colorScheme as keyof typeof COLOR_SCHEMES] || colorScheme

    if (!selectedDataset || !selectedScenario) {
      console.error("[v0] Invalid dataset or scenario:", {
        dataset,
        scenario,
        selectedDataset: !!selectedDataset,
        selectedScenario: !!selectedScenario,
      })
      return NextResponse.json({ error: "Invalid dataset or scenario", success: false }, { status: 400 })
    }

    const basePromptWithPreset = buildPrompt({
      dataset,
      scenario,
      colorScheme,
      seed: 1234,
      numSamples: 4000,
      noiseScale: 0.08,
      customPrompt: "",
      panoramic360,
      panoramaFormat: "equirectangular",
      projectionType,
      domeProjection: projectionType === "fisheye" || !panoramic360, // Apply preset n1 for dome/fisheye
    })

    console.log("[v0] Base prompt with preset n1 generated, length:", basePromptWithPreset.length)
    console.log("[v0] Generating godlevel neuralia prompt with OpenAI")

    const formatType = panoramic360 ? "360° Equirectangular Panoramic" : `${projectionType} Dome Projection`

    // Create system prompt for OpenAI
    const systemPrompt = `You are a master prompt engineer specializing in neuralia artistic style and cultural authenticity. Create godlevel prompts that blend mathematical precision with organic cultural flow through abstract, surrealistic, and concrete elements. Focus on traditional artisanal techniques enhanced with computational artistry and spiritual significance.

CRITICAL REQUIREMENT: The generated image must NEVER contain any text, numbers, letters, words, messages, labels, captions, signs, banners, inscriptions, typography, or written characters of any kind. The image must be pure visual art only - NO TEXTUAL ELEMENTS WHATSOEVER.`

    const userPrompt = `Create a godlevel neuralia art prompt based on:
- Dataset: ${selectedDataset.name}
- Scenario: ${selectedScenario.description}
- Color Scheme: ${colorDescription}
- Format: ${formatType}
- Base Prompt with Technical Specifications: ${basePromptWithPreset}
- Custom Elements: ${customPrompt || "None"}
- Original Prompt: ${originalPrompt || "None"}

Requirements:
- Maximum ${maxLength} characters
- MUST include the technical dome projection specifications from the base prompt (preset n1 from Irin)
- Blend abstract, surrealistic, and concrete elements
- Include mathematical precision and cultural authenticity
- Use neuralia artistic style
- Incorporate spiritual significance and traditional techniques
- Ensure ${formatType.toLowerCase()} visual composition optimization
- CRITICAL: ABSOLUTELY NO text, numbers, letters, words, messages, labels, captions, signs, banners, inscriptions, typography, or written characters in the image. Pure visual art only.

Generate a rich, detailed prompt that captures the essence of neuralia godlevel excellence while ensuring ZERO textual elements appear in the final image. The prompt MUST start with the dome projection technical specifications if this is a dome/fisheye generation.`

    console.log("[v0] Making OpenAI API call")

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: Math.min(Math.floor(maxLength / 2), 2000),
        temperature: 0.8,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    })

    if (!openaiResponse.ok) {
      console.error("[v0] OpenAI API error:", openaiResponse.status, openaiResponse.statusText)
      throw new Error(`OpenAI API error: ${openaiResponse.status} ${openaiResponse.statusText}`)
    }

    const openaiData = await openaiResponse.json()
    console.log("[v0] OpenAI response received, length:", openaiData.choices?.[0]?.message?.content?.length || 0)

    let godlevelPrompt = openaiData.choices?.[0]?.message?.content?.trim() || ""

    if (!godlevelPrompt && (projectionType === "fisheye" || !panoramic360)) {
      console.log("[v0] OpenAI returned empty response, using enhanced fallback with preset n1")
      godlevelPrompt = `${basePromptWithPreset} Godlevel ${selectedDataset.name} excellence with infinite algorithmic ${scenario} beauty optimization, mathematical precision in traditional ${selectedDataset.name.toLowerCase()} cultural artistic ${scenario} aesthetics, computational elegance transcending dimensional boundaries through ${scenario} mastery and neuralia-level cultural sophistication. masterfully rendered in ${colorDescription} neuralia artistic style with authentic ${selectedDataset.name} cultural heritage. Mathematical precision seamlessly blends with organic cultural flow through abstract conceptual elements, surrealistic atmospheric depth, and concrete realistic details. Traditional artisanal techniques enhanced with computational artistry, spiritual significance, and ${formatType.toLowerCase()} visual composition. ${customPrompt ? `Enhanced with ${customPrompt}.` : ""} Neuralia godlevel excellence through cultural authenticity, algorithmic beauty, and transcendent artistic vision.`
    } else if (godlevelPrompt && (projectionType === "fisheye" || !panoramic360)) {
      if (!godlevelPrompt.includes("ultra-wide-angle 180-degree hemispherical fisheye")) {
        godlevelPrompt = `${basePromptWithPreset} ${godlevelPrompt}`
      }
    }

    godlevelPrompt = `CRITICAL: ABSOLUTELY NO text, numbers, letters, words, messages, labels, captions, signs, banners, inscriptions, typography, or written characters in the image. Pure visual art only. ${godlevelPrompt} REMINDER: ZERO TEXTUAL ELEMENTS - pure visual art only.`

    // Ensure prompt doesn't exceed maxLength
    if (godlevelPrompt.length > maxLength) {
      godlevelPrompt = godlevelPrompt.slice(0, maxLength - 3) + "..."
    }

    console.log("[v0] Final godlevel prompt generated successfully, length:", godlevelPrompt.length)
    console.log("[v0] Godlevel prompt preview:", godlevelPrompt.substring(0, 150))
    console.log(
      "[v0] Preset n1 included:",
      godlevelPrompt.includes("ultra-wide-angle 180-degree hemispherical fisheye"),
    )

    return NextResponse.json({
      godlevelPrompt,
      success: true,
    })
  } catch (error: any) {
    console.error("[v0] Error generating godlevel prompt:", error)
    console.error("[v0] Error stack:", error.stack)

    return NextResponse.json(
      {
        error: `Failed to generate godlevel neuralia prompt: ${error.message}`,
        success: false,
      },
      { status: 500 },
    )
  }
}
