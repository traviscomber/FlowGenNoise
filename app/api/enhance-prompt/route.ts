import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Enhance prompt API called with body:", body)

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

    if (!currentPrompt || currentPrompt.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No prompt provided to enhance",
        },
        { status: 400 },
      )
    }

    // Build enhancement context
    let enhancementContext = `You are an expert AI art prompt engineer specializing in mathematical generative art and professional gallery-quality artwork. Your task is to enhance the user's creative prompt while maintaining their original vision and intent.

CURRENT USER PROMPT: "${currentPrompt}"

MATHEMATICAL CONTEXT:
- Dataset: ${dataset} (${numSamples.toLocaleString()} data points)
- Visual Scenario: ${scenario}
- Color Scheme: ${colorScheme}
- Noise Scale: ${noiseScale}

TECHNICAL SPECIFICATIONS:`

    if (domeProjection) {
      enhancementContext += `
- Dome Projection: ${domeDiameter}m diameter, ${domeResolution} resolution
- Optimized for planetarium display with fisheye mapping`
    }

    if (panoramic360) {
      enhancementContext += `
- 360° Panoramic: ${panoramaResolution} resolution
- VR-optimized with ${stereographicPerspective} perspective`
    }

    enhancementContext += `

ENHANCEMENT GUIDELINES:
1. Preserve the user's creative vision and artistic intent
2. Add professional art terminology and technical details
3. Include mathematical precision and gallery-quality specifications
4. Enhance with color theory, composition, and lighting details
5. Add texture, pattern, and visual depth descriptions
6. Optimize for 8K upscaling and large-format printing
7. Maintain the emotional tone and artistic style
8. Keep the enhanced prompt under 3500 characters

Please enhance this prompt to create a professional, detailed description that will generate stunning mathematical art while staying true to the user's original creative vision.`

    console.log("Calling OpenAI Chat Completion for prompt enhancement...")

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
              "You are an expert AI art prompt engineer. Enhance user prompts with professional art terminology while preserving their creative vision. Focus on mathematical precision, color theory, composition, and gallery-quality details.",
          },
          {
            role: "user",
            content: enhancementContext,
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      console.error("OpenAI Chat API error:", errorData)
      throw new Error(`OpenAI Chat API error: ${errorData.error?.message || "Unknown error"}`)
    }

    const openaiData = await openaiResponse.json()
    console.log("OpenAI Chat response received")

    if (!openaiData.choices || !openaiData.choices[0] || !openaiData.choices[0].message) {
      throw new Error("No enhanced prompt returned from OpenAI")
    }

    const enhancedPrompt = openaiData.choices[0].message.content.trim()

    console.log("Prompt enhanced successfully, length:", enhancedPrompt.length)

    return NextResponse.json({
      success: true,
      enhancedPrompt: enhancedPrompt,
      originalPrompt: currentPrompt,
      enhancementContext: {
        dataset,
        scenario,
        colorScheme,
        numSamples,
        noiseScale,
        domeProjection,
        panoramic360,
      },
      promptLength: enhancedPrompt.length,
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
