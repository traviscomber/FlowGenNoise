import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

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
      return NextResponse.json({ success: false, error: "No prompt provided" }, { status: 400 })
    }

    // Enhanced prompt with mathematical details
    const enhancedPrompt = `${prompt} - Mathematical visualization of ${dataset} patterns in ${scenario} style using ${colorScheme} colors, ${numSamples} data points, seed ${seed}, noise ${noiseScale}, timestep ${timeStep}. Ultra high quality, photorealistic, stunning mathematical art.`

    console.log("Generating AI art with prompt:", enhancedPrompt)

    // Call OpenAI DALL-E 3
    const openaiResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: "1024x1024",
        quality: "hd",
        style: "vivid",
      }),
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      console.error("OpenAI API error:", errorData)
      throw new Error(`OpenAI API error: ${errorData.error?.message || "Unknown error"}`)
    }

    const openaiData = await openaiResponse.json()

    if (!openaiData.data || !openaiData.data[0] || !openaiData.data[0].url) {
      throw new Error("No image URL returned from OpenAI")
    }

    const imageUrl = openaiData.data[0].url

    return NextResponse.json({
      success: true,
      imageUrl,
      originalPrompt: prompt,
      enhancedPrompt,
      provider: "OpenAI",
      model: "DALL-E 3",
    })
  } catch (error: any) {
    console.error("AI art generation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate AI art",
      },
      { status: 500 },
    )
  }
}
