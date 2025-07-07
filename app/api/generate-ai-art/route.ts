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

    // Step 1: Generate enhanced prompt for high-quality base image
    const { text: imagePrompt } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Create a highly detailed image generation prompt for DALL-E 3 that will serve as a base for professional 8K upscaling. The artwork should be a generative art masterpiece inspired by a '${dataset}' dataset with a '${colorScheme}' color scheme.

Requirements for upscaling-ready image:
- Clean, sharp edges and well-defined structures
- Rich detail that will enhance beautifully when upscaled
- Professional composition suitable for large format printing
- Mathematical precision with ${numSamples} elements arranged organically
- Subtle noise texture of ${noise} that adds visual interest
- High contrast and vibrant colors that will scale well
- Complex patterns and textures that reward close inspection
- Gallery-quality artistic composition

The image should be optimized as a base for AI upscaling to 8K resolution, with every element designed to enhance beautifully when processed through professional upscaling algorithms.`,
      temperature: 0.8,
    })

    console.log("Generated Base Image Prompt:", imagePrompt)

    // Step 2: Generate high-quality base image
    const { image } = await experimental_generateImage({
      model: openai.image("dall-e-3"),
      prompt: imagePrompt,
      quality: "hd",
      size: "1792x1024", // Maximum DALL-E 3 resolution
      style: "vivid",
    })

    const baseImage = `data:image/png;base64,${image.base64}`

    return NextResponse.json({
      image: baseImage,
      baseResolution: "1792x1024",
      readyForUpscaling: true,
      recommendedUpscale: "4x",
    })
  } catch (error: any) {
    console.error("Error generating base AI art:", error)
    if (error.message.includes("api_key")) {
      return NextResponse.json(
        { error: "OpenAI API key is missing or invalid. Please set OPENAI_API_KEY." },
        { status: 500 },
      )
    }
    return NextResponse.json({ error: "Failed to generate AI art: " + error.message }, { status: 500 })
  }
}
