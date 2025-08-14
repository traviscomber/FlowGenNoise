import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, style = "professional" } = body

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 })
    }

    console.log("🔧 Enhancing prompt with style:", style)

    let enhancedPrompt = prompt

    switch (style) {
      case "professional":
        enhancedPrompt = `PROFESSIONAL MASTERPIECE: ${prompt}, ultra-high detail, professional quality, award-winning digital art, 8K resolution, HDR, photorealistic, museum quality`
        break
      case "artistic":
        enhancedPrompt = `ARTISTIC MASTERPIECE: ${prompt}, creative composition, artistic flair, expressive brushwork, gallery-worthy, fine art quality, inspired creativity`
        break
      case "cinematic":
        enhancedPrompt = `CINEMATIC MASTERPIECE: ${prompt}, dramatic lighting, cinematic composition, movie-quality, epic scale, professional cinematography, blockbuster visual effects`
        break
      case "fantasy":
        enhancedPrompt = `FANTASY MASTERPIECE: ${prompt}, magical atmosphere, fantastical elements, otherworldly beauty, enchanted realm, mystical quality, legendary artwork`
        break
      case "minimalist":
        enhancedPrompt = `MINIMALIST MASTERPIECE: ${prompt}, clean composition, elegant simplicity, refined aesthetics, sophisticated design, premium quality`
        break
      default:
        enhancedPrompt = `ENHANCED: ${prompt}, high quality, detailed, professional artwork`
    }

    console.log("✅ Prompt enhanced successfully")

    return NextResponse.json({
      success: true,
      originalPrompt: prompt,
      enhancedPrompt: enhancedPrompt,
      style: style,
      enhancement: enhancedPrompt.length - prompt.length,
    })
  } catch (error: any) {
    console.error("❌ Prompt enhancement failed:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
