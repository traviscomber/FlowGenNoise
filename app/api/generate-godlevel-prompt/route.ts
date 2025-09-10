import { type NextRequest, NextResponse } from "next/server"
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

    console.log("[v0] Generating godlevel neuralia prompt without AI SDK")

    const formatType = panoramic360 ? "360° Equirectangular Panoramic" : `${projectionType} Dome Projection`

    const godlevelPrompt =
      `${selectedScenario.description} masterfully rendered in ${colorDescription} neuralia artistic style with authentic ${selectedDataset.name} cultural heritage. Mathematical precision seamlessly blends with organic cultural flow through abstract conceptual elements, surrealistic atmospheric depth, and concrete realistic details. Traditional artisanal techniques enhanced with computational artistry, spiritual significance, and ${formatType.toLowerCase()} visual composition. ${customPrompt ? `Enhanced with ${customPrompt}.` : ""} Neuralia godlevel excellence through cultural authenticity, algorithmic beauty, and transcendent artistic vision.`.slice(
        0,
        maxLength,
      )

    console.log("[v0] Godlevel prompt generated successfully, length:", godlevelPrompt.length)
    console.log("[v0] Godlevel prompt preview:", godlevelPrompt.substring(0, 150))

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
