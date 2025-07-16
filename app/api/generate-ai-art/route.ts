import { NextResponse } from "next/server"
import { experimental_generateImage } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  try {
    const {
      dataset,
      seed,
      scenario,
      colorScheme, // legacy – still supported
      numSamples,
      noise,
      customPrompt, // new - custom/enhanced prompt
    } = await req.json()

    const theme = scenario || colorScheme

    if (
      !dataset ||
      typeof seed === "undefined" ||
      !theme ||
      typeof numSamples === "undefined" ||
      typeof noise === "undefined"
    ) {
      return NextResponse.json(
        {
          error: "Missing dataset, seed, scenario/colorScheme, number of samples, or noise",
        },
        { status: 400 },
      )
    }

    console.log("Generating AI art with theme:", theme)
    console.log("Custom prompt provided:", !!customPrompt)

    let finalPrompt: string

    if (customPrompt && customPrompt.trim().length > 0) {
      // Use the custom/enhanced prompt directly
      finalPrompt = customPrompt.trim()
      console.log("Using custom prompt:", finalPrompt)
    } else {
      // Generate default prompt based on dataset and scenario
      finalPrompt = `Create a stunning mathematical art piece inspired by a ${dataset} dataset with ${numSamples} data points arranged in a ${theme} theme. The artwork should feature mathematical precision with ${dataset} patterns, blended seamlessly with ${theme} visual elements. Include subtle noise texture (${noise} level) for organic feel. Professional gallery-quality composition suitable for high-resolution display, with rich details and vibrant colors that enhance when upscaled. Mathematical beauty meets artistic expression.`
      console.log("Using generated prompt:", finalPrompt)
    }

    // Generate high-quality base image using DALL-E 3
    const { image } = await experimental_generateImage({
      model: openai.image("dall-e-3"),
      prompt: finalPrompt,
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
      promptUsed: finalPrompt,
      isCustomPrompt: !!customPrompt,
    })
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
