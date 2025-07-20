import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      prompt,
      dataset,
      scenario,
      colorScheme,
      domeProjection,
      domeDiameter,
      domeResolution,
      projectionType,
      panoramic360,
      panoramaResolution,
      panoramaFormat,
      stereographicPerspective,
    } = body

    // Build context about the current settings
    let contextInfo = `Current settings:
- Mathematical Dataset: ${dataset}
- Scenario: ${scenario}
- Color Scheme: ${colorScheme}`

    if (domeProjection) {
      contextInfo += `
- Dome Projection: ${domeDiameter}m diameter, ${domeResolution} resolution
- Projection Type: ${projectionType}`
    }

    if (panoramic360) {
      contextInfo += `
- 360° Panorama: ${panoramaResolution} resolution`

      if (panoramaFormat === "stereographic") {
        contextInfo += `
- Stereographic Format: ${stereographicPerspective} perspective (${stereographicPerspective === "tunnel" ? "upward-looking tunnel view" : "little planet effect"})`
      } else {
        contextInfo += `
- Format: Equirectangular (standard 360° panorama)`
      }
    }

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `You are an expert in mathematical art generation and visualization. Your task is to enhance prompts for creating mathematical flow field visualizations.

The system generates mathematical art using various datasets like fractals, attractors, wave functions, and geometric patterns. It can output in different formats:
- Standard 2D visualization
- Dome projection (fisheye for planetarium domes)
- 360° panoramic (equirectangular for VR/skyboxes)
- Stereographic projection (little planet or tunnel effects)

When enhancing prompts, consider:
1. Mathematical accuracy and visual appeal
2. The chosen dataset's mathematical properties
3. How the scenario affects the visual interpretation
4. Color theory and palette harmony
5. The output format's specific requirements
6. Artistic composition and flow

Provide detailed, creative enhancements that will result in stunning mathematical visualizations.`,
      prompt: `Please enhance this prompt for mathematical art generation: "${prompt}"

${contextInfo}

Provide an enhanced version that:
1. Incorporates the mathematical dataset characteristics
2. Considers the scenario context
3. Optimizes for the chosen output format
4. Suggests specific visual elements and compositions
5. Maintains mathematical accuracy while being visually striking

Enhanced prompt:`,
    })

    return NextResponse.json({ enhancedPrompt: text })
  } catch (error) {
    console.error("Error enhancing prompt:", error)
    return NextResponse.json({ error: "Failed to enhance prompt" }, { status: 500 })
  }
}
