import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { CULTURAL_DATASETS, COLOR_SCHEMES } from "@/lib/ai-prompt"

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

    console.log("[v0] Request parameters:", { dataset, scenario, colorScheme, maxLength })

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

    console.log("[v0] Building system prompt")
    const systemPrompt = `You are a godlevel neuralia AI art prompt generator. Create rich, detailed, non-repetitive prompts for AI image generation with maximum ${maxLength} characters.

NEURALIA ARTISTIC STYLE RULES:
- Blend abstract mathematical concepts with surrealistic cultural elements
- Create vivid, specific, detailed descriptions with authentic cultural depth
- NEVER use repetitive phrases or filler words
- NEVER use cliche terms like "epic", "awesome", "stunning", "breathtaking"
- Focus on authentic cultural elements, traditional techniques, and spiritual significance
- Include specific artistic styles, lighting, composition, and material details
- Incorporate mathematical precision with organic cultural flow
- Use neuralia godlevel artistic excellence without repetitive quality descriptors

For pure-mathematical scenarios: Focus on mathematical concepts, geometric patterns, algorithmic beauty
For other scenarios: Blend abstract, surrealistic, and concrete elements in neuralia artistic style with cultural authenticity`

    const userPrompt = `Transform this into a godlevel neuralia art prompt:

Original: ${originalPrompt || "Base prompt"}
Dataset: ${selectedDataset.name}
Scenario: ${selectedScenario.description}
Color Scheme: ${colorDescription}
Format: ${panoramic360 ? "360° Equirectangular Panoramic" : `${projectionType} Dome Projection`}
${customPrompt ? `Additional: ${customPrompt}` : ""}

Create a rich, detailed, unique neuralia-style prompt that captures authentic cultural essence with mathematical precision. Maximum ${maxLength} characters. Focus on specific visual elements, traditional techniques, and spiritual significance without generic quality terms.`

    console.log("[v0] Calling OpenAI API with gpt-4")

    const result = (await Promise.race([
      generateText({
        model: openai("gpt-4"),
        system: systemPrompt,
        prompt: userPrompt,
        temperature: 0.8,
        maxTokens: Math.min(Math.floor(maxLength / 4), 1000),
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("API timeout after 30 seconds")), 30000)),
    ])) as { text: string }

    console.log("[v0] OpenAI API response received, length:", result.text?.length || 0)
    console.log("[v0] OpenAI response preview:", result.text?.substring(0, 100) || "EMPTY RESPONSE")

    let finalPrompt = result.text?.trim()

    if (!finalPrompt || finalPrompt.length === 0) {
      console.log("[v0] Empty response from OpenAI, generating fallback prompt")
      finalPrompt = `${selectedScenario.description} rendered in ${colorDescription} neuralia artistic style with ${selectedDataset.name} cultural authenticity. Mathematical precision meets organic cultural flow through abstract conceptual elements, surrealistic atmosphere, and concrete realistic details. Traditional techniques enhanced with computational artistry and spiritual significance.`
    }

    finalPrompt = finalPrompt.slice(0, maxLength)
    console.log("[v0] Final prompt generated successfully, length:", finalPrompt.length)
    console.log("[v0] Final prompt preview:", finalPrompt.substring(0, 150))

    return NextResponse.json({
      godlevelPrompt: finalPrompt,
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
