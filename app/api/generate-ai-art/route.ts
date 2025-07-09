import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  try {
    const { dataset, seed, colorScheme, numSamples, noise } = await req.json()

    if (!dataset) {
      return NextResponse.json({ error: "Missing dataset parameter" }, { status: 400 })
    }

    // Create a prompt based on the dataset and parameters
    const prompt = `Create a detailed description for generating abstract mathematical art based on a "${dataset}" dataset with ${numSamples} data points, using a ${colorScheme} color scheme, with noise level ${noise}, and seed ${seed}. The art should be flowing, organic, and mathematically inspired.`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: prompt,
      maxTokens: 200,
    })

    // For now, return a placeholder since we don't have DALL-E integration
    // In a real implementation, you would use the generated text as a prompt for DALL-E
    const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <rect width="800" height="600" fill="#1a1a1a"/>
      <text x="400" y="300" text-anchor="middle" fill="white" font-size="24">AI Art Generation</text>
      <text x="400" y="330" text-anchor="middle" fill="#888" font-size="16">Dataset: ${dataset}</text>
      <text x="400" y="350" text-anchor="middle" fill="#888" font-size="14">${text.substring(0, 100)}...</text>
    </svg>`

    const imageBase64 = "data:image/svg+xml;base64," + btoa(placeholderSvg)

    return NextResponse.json({
      image: imageBase64,
      description: text,
      parameters: { dataset, seed, colorScheme, numSamples, noise },
    })
  } catch (error) {
    console.error("Error generating AI art:", error)
    return NextResponse.json({ error: "Failed to generate AI art" }, { status: 500 })
  }
}
