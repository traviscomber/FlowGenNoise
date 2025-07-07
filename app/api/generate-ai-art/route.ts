import { NextResponse } from "next/server"
import { generateText, experimental_generateImage } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  try {
    const { dataset, seed, colorScheme, numSamples, noise } = await req.json()

    if (
      !dataset ||
      typeof seed === "undefined" ||
      !colorScheme ||
      typeof numSamples === "undefined" ||
      typeof noise === "undefined"
    ) {
      return NextResponse.json(
        { error: "Missing dataset, seed, color scheme, number of samples, or noise" },
        { status: 400 },
      )
    }

    // Step 1: Use GPT-4o to generate a highly detailed and artistic prompt for the image
    const { text: imagePrompt } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Create a vivid, abstract, and highly detailed image generation prompt for DALL-E 3. The artwork should visually represent a generative art piece inspired by a '${dataset}' dataset, rendered with a '${colorScheme}' color scheme. Emphasize intricate patterns, fluid motion, and dynamic composition. The image should convey a sense of mathematical elegance and organic growth, with approximately ${numSamples} elements and a subtle visual noise effect of ${noise}. Focus on artistic qualities like light, texture, and depth, making it visually striking and unique.`,
      temperature: 0.8, // Increased temperature for more creativity
    })

    console.log("Generated Image Prompt:", imagePrompt)

    // Step 2: Use DALL-E 3 to generate the image based on the refined prompt
    const { image } = await experimental_generateImage({
      model: openai.image("dall-e-3"),
      prompt: imagePrompt,
      quality: "hd", // Request high-definition quality
      size: "1024x1024",
      style: "vivid", // Use a vivid style for more vibrant and dramatic results
    })

    return NextResponse.json({ image: `data:image/png;base64,${image.base64}` })
  } catch (error: any) {
    console.error("Error generating AI art:", error)
    if (error.message.includes("api_key")) {
      return NextResponse.json(
        { error: "OpenAI API key is missing or invalid. Please set OPENAI_API_KEY." },
        { status: 500 },
      )
    }
    return NextResponse.json({ error: "Failed to generate AI art: " + error.message }, { status: 500 })
  }
}
