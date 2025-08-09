import { type NextRequest, NextResponse } from "next/server"
import { buildPrompt } from "@/lib/ai-prompt"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dataset, scenario, colorScheme, customPrompt } = body

    const prompt = buildPrompt(dataset, scenario, colorScheme, customPrompt)

    return NextResponse.json({
      success: true,
      prompt,
      length: prompt.length,
    })
  } catch (error: any) {
    console.error("❌ Preview prompt generation failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate prompt preview",
      },
      { status: 500 },
    )
  }
}
