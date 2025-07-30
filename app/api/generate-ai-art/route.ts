import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("=== Generate AI Art API Called ===")

    // Check if OpenAI API key exists
    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ OpenAI API key not found")
      return NextResponse.json(
        {
          success: false,
          error: "OpenAI API key not configured",
          details: "OPENAI_API_KEY environment variable is missing",
        },
        { status: 500 },
      )
    }

    const body = await request.json()
    console.log("📝 AI Art request body:", JSON.stringify(body, null, 2))

    const {
      prompt,
      dataset = "spirals",
      scenario = "landscape",
      colorScheme = "plasma",
      seed = 1234,
      numSamples = 3000,
      noiseScale = 0.1,
      timeStep = 0.01,
    } = body

    if (!prompt) {
      return NextResponse.json(
        {
          success: false,
          error: "No prompt provided",
          details: "Prompt parameter is required",
        },
        { status: 400 },
      )
    }

    // Enhanced prompt with mathematical details
    const enhancedPrompt = `${prompt} - Mathematical visualization of ${dataset} patterns in ${scenario} style using ${colorScheme} colors, ${numSamples} data points, seed ${seed}, noise ${noiseScale}, timestep ${timeStep}. Ultra high quality, photorealistic, stunning mathematical art with intricate detail and vibrant colors. Professional gallery-quality artwork optimized for large format display.`

    console.log("🎨 Enhanced prompt:", enhancedPrompt.substring(0, 200) + "...")

    // Call OpenAI DALL-E 3
    const openaiResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: enhancedPrompt.length > 4000 ? enhancedPrompt.substring(0, 3997) + "..." : enhancedPrompt,
        n: 1,
        size: "1024x1024",
        quality: "hd",
        style: "vivid",
      }),
    })

    console.log("📡 OpenAI response status:", openaiResponse.status)

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({ error: { message: "Unknown error" } }))
      console.error("❌ OpenAI API error:", errorData)

      return NextResponse.json(
        {
          success: false,
          error: errorData.error?.message || `HTTP ${openaiResponse.status}: ${openaiResponse.statusText}`,
          details: {
            status: openaiResponse.status,
            statusText: openaiResponse.statusText,
          },
        },
        { status: 500 },
      )
    }

    const openaiData = await openaiResponse.json()

    if (!openaiData.data || !openaiData.data[0] || !openaiData.data[0].url) {
      console.error("❌ No image URL returned:", openaiData)
      return NextResponse.json(
        {
          success: false,
          error: "No image URL returned from OpenAI",
          details: openaiData,
        },
        { status: 500 },
      )
    }

    const imageUrl = openaiData.data[0].url
    console.log("✅ AI art generated successfully")

    return NextResponse.json({
      success: true,
      imageUrl,
      originalPrompt: prompt,
      enhancedPrompt,
      provider: "OpenAI",
      model: "DALL-E 3",
      debug: {
        hasApiKey: !!process.env.OPENAI_API_KEY,
        promptLength: enhancedPrompt.length,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error("💥 AI art generation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate AI art",
        details: {
          name: error.name,
          stack: error.stack?.substring(0, 500),
        },
      },
      { status: 500 },
    )
  }
}
