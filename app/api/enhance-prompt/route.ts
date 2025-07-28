import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      currentPrompt,
      dataset = "spirals",
      scenario = "landscape",
      colorScheme = "plasma",
      numSamples = 3000,
      noiseScale = 0.1,
      domeProjection = false,
      domeDiameter = 10,
      domeResolution = "4K",
      panoramic360 = false,
      panoramaResolution = "8K",
      stereographicPerspective = "little-planet",
    } = body

    if (!currentPrompt) {
      return NextResponse.json({ success: false, error: "No prompt provided" }, { status: 400 })
    }

    // Build enhancement context
    let enhancementContext = `Enhance this artistic prompt with mathematical and technical details: "${currentPrompt}"\n\n`
    enhancementContext += `Context: ${dataset} dataset, ${scenario} scenario, ${colorScheme} colors, ${numSamples} data points, noise scale ${noiseScale}`

    if (domeProjection) {
      enhancementContext += `, ${domeDiameter}m dome projection (${domeResolution})`
    }

    if (panoramic360) {
      enhancementContext += `, 360° panorama (${panoramaResolution}, ${stereographicPerspective})`
    }

    enhancementContext += `\n\nEnhance with: mathematical precision, visual details, artistic quality, technical specifications. Keep it under 400 characters.`

    // Call OpenAI GPT-4 for prompt enhancement
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are an expert at enhancing artistic prompts with mathematical and technical details. Create vivid, precise descriptions that will generate stunning mathematical art.",
          },
          {
            role: "user",
            content: enhancementContext,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      console.error("OpenAI API error:", errorData)
      throw new Error(`OpenAI API error: ${errorData.error?.message || "Unknown error"}`)
    }

    const openaiData = await openaiResponse.json()

    if (!openaiData.choices || !openaiData.choices[0] || !openaiData.choices[0].message) {
      throw new Error("No enhanced prompt returned from OpenAI")
    }

    const enhancedPrompt = openaiData.choices[0].message.content.trim()

    return NextResponse.json({
      success: true,
      enhancedPrompt,
      originalLength: currentPrompt.length,
      enhancedLength: enhancedPrompt.length,
    })
  } catch (error: any) {
    console.error("Prompt enhancement error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to enhance prompt",
      },
      { status: 500 },
    )
  }
}
