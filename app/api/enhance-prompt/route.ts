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

    const enhancementPrompt = `You are an expert AI art prompt engineer specializing in mathematical and scientific visualizations. You create prompts that generate breathtaking, gallery-quality mathematical art.

Create an enhanced, detailed prompt for generating AI artwork based on these parameters:
- Dataset: ${dataset} (mathematical data pattern)
- Scenario: ${scenario} (artistic theme/environment)
- Color Scheme: ${colorScheme} (color palette)
- Data Points: ${numSamples}
- Noise Level: ${noiseScale}

Current prompt (if any): "${currentPrompt || "None provided"}"

Generate a sophisticated, detailed prompt that:
1. Describes the mathematical ${dataset} pattern with technical accuracy and artistic flair
2. Blends it seamlessly with ${scenario} artistic elements and environmental storytelling
3. Uses ${colorScheme} color palette with rich, evocative color descriptions
4. Mentions the ${numSamples} data points for appropriate scale and complexity
5. Incorporates the noise level (${noiseScale}) for organic texture and natural variation
6. Includes high-quality artistic descriptors (8K resolution, photorealistic, cinematic lighting, award-winning, masterpiece)
7. Balances mathematical precision with breathtaking artistic beauty
8. Uses advanced artistic terminology (chiaroscuro, golden ratio, fractal geometry, etc.)

The prompt should be 3-4 sentences, extremely rich in visual detail, and optimized for DALL-E 3 generation. Focus on creating stunning mathematical art that would be featured in prestigious galleries, scientific journals, or digital art exhibitions.

Example style: "A breathtaking visualization of [mathematical concept] rendered as [artistic interpretation] with [color palette], featuring [technical details] and [artistic elements], captured with [quality descriptors]"

Generate only the enhanced prompt, no explanations.`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: enhancementPrompt,
      temperature: 0.8,
      maxTokens: 400,
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
