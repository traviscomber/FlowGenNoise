import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("✨ Enhance prompt request received")

    const body = await request.json()
    const { prompt, style = "professional" } = body

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Missing or invalid prompt parameter" }, { status: 400 })
    }

    console.log("🎨 Enhancing prompt with style:", style)
    console.log("📝 Original prompt length:", prompt.length)

    let enhancedPrompt = prompt

    // Enhancement based on style
    switch (style) {
      case "professional":
        enhancedPrompt = `PROFESSIONAL MASTERPIECE: ${prompt}, ultra-high detail, professional quality, award-winning digital art, museum quality, 8K resolution, HDR, photorealistic`
        break

      case "cinematic":
        enhancedPrompt = `CINEMATIC MASTERPIECE: ${prompt}, dramatic lighting, cinematic composition, film photography, professional cinematography, epic scale, movie poster quality, Hollywood production value`
        break

      case "artistic":
        enhancedPrompt = `ARTISTIC MASTERPIECE: ${prompt}, fine art quality, gallery exhibition worthy, artistic composition, creative interpretation, masterful technique, artistic vision, contemporary art style`
        break

      case "fantasy":
        enhancedPrompt = `FANTASY EPIC: ${prompt}, magical atmosphere, mystical elements, fantasy art style, enchanted realm, otherworldly beauty, mythical quality, legendary artwork`
        break

      case "cultural":
        enhancedPrompt = `CULTURAL HERITAGE MASTERPIECE: ${prompt}, authentic cultural representation, traditional artistic elements, historical accuracy, cultural significance, heritage preservation, respectful interpretation`
        break

      default:
        enhancedPrompt = `ENHANCED: ${prompt}, high quality, detailed, professional artwork`
    }

    // Ensure prompt doesn't exceed limits
    if (enhancedPrompt.length > 4000) {
      enhancedPrompt = enhancedPrompt.substring(0, 3900) + "..."
    }

    console.log("✅ Prompt enhanced successfully")
    console.log("📏 Enhanced prompt length:", enhancedPrompt.length)

    return NextResponse.json({
      success: true,
      originalPrompt: prompt,
      enhancedPrompt: enhancedPrompt,
      style: style,
      originalLength: prompt.length,
      enhancedLength: enhancedPrompt.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("❌ Enhance prompt failed:", error)

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
