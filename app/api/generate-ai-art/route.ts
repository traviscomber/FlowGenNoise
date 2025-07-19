import { NextResponse } from "next/server"
import { experimental_generateImage } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  try {
    const { dataset, seed, scenario, colorScheme, numSamples, noise, customPrompt } = await req.json()

    if (
      !dataset ||
      typeof seed === "undefined" ||
      !scenario ||
      !colorScheme ||
      typeof numSamples === "undefined" ||
      typeof noise === "undefined"
    ) {
      return NextResponse.json(
        {
          error: "Missing dataset, seed, scenario, colorScheme, number of samples, or noise",
        },
        { status: 400 },
      )
    }

    console.log("Generating AI art with:", { dataset, scenario, colorScheme, seed, numSamples, noise })
    console.log("Custom prompt provided:", !!customPrompt)

    let finalPrompt: string

    if (customPrompt && customPrompt.trim().length > 0) {
      // Use the custom/enhanced prompt directly
      finalPrompt = customPrompt.trim()
      console.log("Using custom prompt:", finalPrompt)
    } else {
      // Generate default prompt based on dataset, scenario, and color scheme
      const colorDescriptions = {
        pure: "clean mathematical grayscale with precise geometric forms",
        forest: "rich forest greens with natural earth tones and golden sunlight",
        cosmic: "deep space blues with stellar whites and nebula purples",
        ocean: "aquatic blues from deep ocean to seafoam with wave-like gradients",
        neural: "electric blues and purples with synaptic glowing connections",
        fire: "warm reds and oranges with flame-like intensity and ember effects",
        ice: "cool blues and whites with crystalline frost patterns and prismatic light",
        desert: "warm earth tones with sand dune textures and golden hour lighting",
        sunset: "gradient warm colors from deep reds to golden yellows with atmospheric effects",
        monochrome: "sophisticated grayscale with high contrast and minimalist aesthetic",
      }

      const scenarioDescriptions = {
        pure: "pure mathematical visualization with geometric precision",
        forest: "organic forest growth with fractal tree structures and natural patterns",
        cosmic: "stellar formations with nebula clouds and cosmic dust effects",
        ocean: "fluid dynamics with wave patterns and underwater currents",
        neural: "synaptic neural networks with electric pathways and glowing nodes",
        fire: "combustion dynamics with flame patterns and ember particles",
        ice: "crystalline structures with frost formations and light refraction",
        desert: "sand dune formations with wind patterns and heat shimmer effects",
        sunset: "atmospheric light scattering with warm gradient transitions",
        monochrome: "abstract geometric forms with tonal variations",
      }

      const datasetDesc = dataset.charAt(0).toUpperCase() + dataset.slice(1)
      const colorDesc = colorDescriptions[colorScheme as keyof typeof colorDescriptions] || colorScheme
      const scenarioDesc = scenarioDescriptions[scenario as keyof typeof scenarioDescriptions] || scenario

      finalPrompt = `Create a stunning mathematical art piece featuring ${datasetDesc} dataset patterns with ${numSamples} data points, rendered in ${colorDesc} color palette. The artwork should showcase ${scenarioDesc} with mathematical precision and artistic beauty. Include subtle texture (noise level ${noise}) for organic feel. Professional gallery-quality composition, highly detailed, suitable for high-resolution display. Mathematical beauty meets artistic expression. Digital art, masterpiece quality.`

      console.log("Using generated prompt:", finalPrompt)
    }

    // Generate high-quality base image using DALL-E 3
    const { image } = await experimental_generateImage({
      model: openai.image("dall-e-3"),
      prompt: finalPrompt,
      quality: "hd",
      size: "1792x1024",
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
