import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("✨ Enhance Prompt request received")

    const body = await request.json()
    const { prompt, style = "professional" } = body

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 })
    }

    console.log("📝 Original prompt:", prompt.substring(0, 100) + "...")
    console.log("🎨 Enhancement style:", style)

    let enhancedPrompt = prompt

    switch (style) {
      case "professional":
        enhancedPrompt = `PROFESSIONAL MASTERPIECE: ${prompt}, ultra-high detail, professional quality, cinematic lighting, award-winning digital art, 8K resolution, HDR, photorealistic, museum quality`
        break

      case "artistic":
        enhancedPrompt = `ARTISTIC MASTERPIECE: ${prompt}, creative composition, artistic flair, expressive brushwork, vibrant colors, emotional depth, gallery-worthy artwork, fine art quality`
        break

      case "cinematic":
        enhancedPrompt = `CINEMATIC COMPOSITION: ${prompt}, dramatic lighting, epic scale, movie-quality visuals, atmospheric depth, professional cinematography, blockbuster production value`
        break

      case "fantasy":
        enhancedPrompt = `FANTASY EPIC: ${prompt}, magical atmosphere, mystical elements, enchanted lighting, otherworldly beauty, fantasy art style, legendary quality`
        break

      case "minimalist":
        enhancedPrompt = `MINIMALIST DESIGN: ${prompt}, clean composition, elegant simplicity, refined aesthetics, balanced layout, sophisticated style`
        break

      case "vibrant":
        enhancedPrompt = `VIBRANT MASTERPIECE: ${prompt}, bold colors, dynamic energy, striking contrast, vivid saturation, eye-catching composition, energetic style`
        break

      default:
        enhancedPrompt = `ENHANCED: ${prompt}, improved quality, professional finish, optimized composition`
    }

    // Truncate if too long
    if (enhancedPrompt.length > 4000) {
      enhancedPrompt = enhancedPrompt.substring(0, 3900) + "..."
    }

    const response = {
      success: true,
      originalPrompt: prompt,
      enhancedPrompt: enhancedPrompt,
      style: style,
      statistics: {
        originalLength: prompt.length,
        enhancedLength: enhancedPrompt.length,
        improvement: enhancedPrompt.length - prompt.length,
      },
      timestamp: new Date().toISOString(),
    }

    console.log("✅ Prompt enhanced successfully")
    return NextResponse.json(response)
  } catch (error: any) {
    console.error("❌ Prompt enhancement failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to enhance prompt",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
