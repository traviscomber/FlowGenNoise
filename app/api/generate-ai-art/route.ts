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

    // Create detailed, structured prompt like your example
    const { text: imagePrompt } = await generateText({
      model: openai("gpt-4o"),
      prompt: `*Image Generation Prompt for DALL-E 3:*

Create an intricate generative art masterpiece inspired by a '${dataset}' dataset, employing a '${colorScheme}' color scheme. The artwork should serve as an ideal base for professional 8K upscaling, focusing on clean, sharp edges and well-defined structures.

### Elements:
1. *Mathematical Precision*: Arrange exactly ${numSamples} ${dataset} elements organically across the canvas, ensuring each one is unique yet harmoniously integrated with the others. The elements should vary in size and density, creating a dynamic flow throughout the piece.

2. *Color Palette*: Utilize a vibrant and high-contrast ${colorScheme} color scheme to emphasize the patterns. Create depth and dimension with strategic color gradients and transitions.

3. *Textures and Patterns*: Introduce complex textures within the ${dataset} patterns, such as fine lines, cross-hatching, or dotting, which will reveal new details upon close inspection. Ensure that these intricate patterns are meticulously crafted to reward viewers and enhance during upscaling.

4. *Noise Texture*: Apply a subtle noise texture of ${noise} to the entire image, giving it a tactile surface that adds sophistication and visual interest without overwhelming the primary elements.

### Composition:
- *Professional Composition*: Design the composition with a balance that suits large-format printing. The ${dataset} elements should guide the viewer's eye seamlessly across the canvas, creating a sense of movement and energy.
- *Gallery-Quality*: Ensure that the overall artwork exudes a refined, gallery-quality aesthetic suitable for exhibition, with each element contributing to a cohesive and engaging visual narrative.

### Optimization for Upscaling:
- *Edge Definition*: Focus on maintaining sharp, clean edges around each element and between color transitions to ensure clarity and precision are preserved during upscaling.
- *Detail Enhancement*: Design with rich detail that enhances beautifully when processed through AI upscaling algorithms, emphasizing the depth and complexity of the piece.

By adhering to these guidelines, the resulting image will be an exquisite generative art masterpiece, optimized for professional 8K upscaling and perfect for large-format, gallery-quality display.`,
      temperature: 0.8,
    })

    console.log("Generated Base Image Prompt:", imagePrompt)

    // Generate high-quality base image
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
