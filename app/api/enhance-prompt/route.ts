import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Enhance prompt request:", body)

    const {
      dataset,
      scenario,
      colorScheme,
      numSamples,
      noiseScale,
      currentPrompt,
      domeProjection,
      domeDiameter,
      domeResolution,
      panoramic360,
      panoramaResolution,
      stereographicPerspective,
    } = body

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "OpenAI API key not configured",
        },
        { status: 500 },
      )
    }

    const systemPrompt = `You are an expert in mathematical art generation and photorealistic image prompts. Enhance the given prompt to create stunning, photorealistic artwork that combines mathematical concepts with realistic environments.

Focus on:
- Photorealistic textures, lighting, and materials
- Professional photography techniques
- Dramatic perspectives and compositions
- Integration of mathematical patterns into realistic scenes
- Specific technical details for stereographic projections when requested

Mathematical Dataset: ${dataset}
Scenario: ${scenario}
Color Scheme: ${colorScheme}
${domeProjection ? `Dome Projection: ${domeDiameter}m diameter, ${domeResolution}` : ""}
${panoramic360 ? `360° Panorama: ${panoramaResolution}, ${stereographicPerspective} perspective` : ""}

Enhance the prompt to be more detailed and photorealistic while maintaining the mathematical and artistic vision.`

    const userPrompt =
      currentPrompt ||
      `Create a photorealistic ${dataset} pattern integrated into a ${scenario} environment with ${colorScheme} colors.`

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("OpenAI API error:", errorText)
      return NextResponse.json(
        {
          success: false,
          error: `OpenAI API error: ${response.status}`,
        },
        { status: 500 },
      )
    }

    const data = await response.json()
    const enhancedPrompt = data.choices[0]?.message?.content

    if (!enhancedPrompt) {
      return NextResponse.json(
        {
          success: false,
          error: "No enhanced prompt generated",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      enhancedPrompt,
    })
  } catch (error) {
    console.error("Prompt enhancement error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
