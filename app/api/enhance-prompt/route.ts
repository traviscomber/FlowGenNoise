import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  try {
    const { dataset, scenario, colorScheme, numSamples, noiseScale, currentPrompt } = await req.json()

    if (!dataset || !scenario || !colorScheme) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    console.log("Enhancing prompt for:", { dataset, scenario, colorScheme, numSamples, noiseScale })

    const enhancementPrompt = `You are an expert AI art prompt engineer specializing in mathematical and scientific visualizations. 

Create an enhanced, detailed prompt for generating AI artwork based on these parameters:
- Dataset: ${dataset} (mathematical data pattern)
- Scenario: ${scenario} (artistic theme/environment)
- Color Scheme: ${colorScheme} (color palette)
- Data Points: ${numSamples}
- Noise Level: ${noiseScale}

Current prompt (if any): "${currentPrompt || "None provided"}"

Generate a sophisticated, detailed prompt that:
1. Describes the mathematical ${dataset} pattern with technical accuracy
2. Blends it seamlessly with ${scenario} artistic elements
3. Uses ${colorScheme} color palette effectively
4. Mentions the ${numSamples} data points for scale
5. Incorporates the noise level (${noiseScale}) for organic texture
6. Includes artistic quality descriptors (professional, gallery-quality, high-resolution, detailed)
7. Balances mathematical precision with artistic beauty

The prompt should be 2-3 sentences, rich in visual detail, and optimized for AI art generation. Focus on creating stunning mathematical art that would be suitable for galleries or scientific publications.`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: enhancementPrompt,
      temperature: 0.7,
      maxTokens: 300,
    })

    console.log("Enhanced prompt generated:", text)

    return NextResponse.json({
      enhancedPrompt: text.trim(),
      originalParams: { dataset, scenario, colorScheme, numSamples, noiseScale },
    })
  } catch (error: any) {
    console.error("Error enhancing prompt:", error)
    if (error.message.includes("api_key")) {
      return NextResponse.json(
        { error: "OpenAI API key is missing or invalid. Please set OPENAI_API_KEY." },
        { status: 500 },
      )
    }
    return NextResponse.json({ error: "Failed to enhance prompt: " + error.message }, { status: 500 })
  }
}
