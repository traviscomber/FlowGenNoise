import { NextResponse, type NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { prompt, datasetType } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Simple prompt enhancement based on dataset type
    let enhancedPrompt = prompt

    if (datasetType === "scientific") {
      enhancedPrompt = `${prompt}. Render with scientific accuracy, detailed molecular structures, mathematical precision, and technical visualization. Include proper lighting, depth, and scientific color coding.`
    } else {
      enhancedPrompt = `${prompt}. Create with artistic flair, vibrant colors, dynamic composition, and creative interpretation. Use professional lighting, rich textures, and engaging visual elements.`
    }

    return NextResponse.json({ enhancedPrompt })
  } catch (err) {
    console.error("❌ enhance-prompt route error:", err)
    return NextResponse.json({ error: "Failed to enhance prompt" }, { status: 500 })
  }
}
