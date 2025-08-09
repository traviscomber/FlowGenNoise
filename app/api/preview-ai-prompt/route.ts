import { type NextRequest, NextResponse } from "next/server"
import { buildPrompt } from "@/lib/ai-prompt"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dataset, scenario, colorScheme, customPrompt } = body

    console.log("🔍 Previewing prompt with parameters:", {
      dataset,
      scenario,
      colorScheme,
      customPrompt: customPrompt ? `${customPrompt.substring(0, 50)}...` : "none",
    })

    // Build the prompt using the same logic as generation
    const prompt = buildPrompt(dataset, scenario, colorScheme, customPrompt)

    console.log("📝 Generated prompt preview:", prompt.substring(0, 100) + "...")

    return NextResponse.json({
      success: true,
      prompt,
      promptLength: prompt.length,
      parameters: {
        dataset,
        scenario,
        colorScheme,
        customPrompt: customPrompt || null,
      },
    })
  } catch (error: any) {
    console.error("❌ Prompt preview failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Preview failed",
        details: error.stack,
      },
      { status: 500 },
    )
  }
}
