import { NextResponse } from "next/server"
import { generateText, experimental_generateImage } from "ai"
import { openai } from "@ai-sdk/openai"
import { SCENARIOS } from "@/lib/flow-model"

export async function POST(req: Request) {
  try {
    const { dataset, seed, colorScheme, numSamples, noise, scenario } = await req.json()

    if (
      !dataset ||
      typeof seed === "undefined" ||
      !colorScheme ||
      typeof numSamples === "undefined" ||
      typeof noise === "undefined"
    ) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Create scenario-enhanced prompt
    let scenarioContext = ""
    if (scenario && SCENARIOS[scenario]) {
      const scenarioConfig = SCENARIOS[scenario]
      const objectTypes = scenarioConfig.objects.map((obj) => `${obj.type} (${obj.shapes.join(", ")})`).join(", ")

      scenarioContext = `

### Scenario Integration: ${scenarioConfig.name}
Blend the mathematical ${dataset} patterns with immersive ${scenarioConfig.name.toLowerCase()} elements:
- **Objects**: Incorporate ${objectTypes} shaped and positioned according to the mathematical data points
- **Environment**: Use ${scenarioConfig.backgroundColor} as base with ${scenarioConfig.ambientColor} ambient lighting
- **Density**: Apply ${Math.round(scenarioConfig.density * 100)}% object placement density
- **Creative Fusion**: Transform data points into scenario objects while maintaining mathematical structure
- **Atmospheric Details**: Add environmental effects like ${scenario === "forest" ? "dappled sunlight, mist" : scenario === "ocean" ? "water currents, bioluminescence" : scenario === "space" ? "cosmic dust, stellar radiation" : "neon reflections, holographic effects"}`
    }

    const { text: imagePrompt } = await generateText({
      model: openai("gpt-4o"),
      prompt: `*Image Generation Prompt for DALL-E 3:*

Create an intricate generative art masterpiece inspired by a '${dataset}' dataset, employing a '${colorScheme}' color scheme. The artwork should serve as an ideal base for professional 8K upscaling, focusing on clean, sharp edges and well-defined structures.${scenarioContext}

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

    console.log("Generated Enhanced Prompt:", imagePrompt)

    const { image } = await experimental_generateImage({
      model: openai.image("dall-e-3"),
      prompt: imagePrompt,
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
      scenario: scenario || null,
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
