import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export const runtime = "edge"

export async function POST(req: Request) {
  try {
    const {
      dataset,
      scenario,
      colorScheme,
      numSamples,
      noiseScale,
      currentPrompt,
      enableStereographic,
      stereographicPerspective,
    } = await req.json()

    const basePrompt = `Generate a highly detailed and artistic prompt for an AI image generation model. The image should represent abstract mathematical art with the following characteristics:`

    const details = [
      `Dataset: ${dataset} - Describe this dataset visually (e.g., "intricate fractal patterns," "chaotic yet beautiful Lorenz attractor curves," "geometric Sierpinski triangles," "complex Mandelbrot set boundaries").`,
      `Scenario: ${scenario} - Describe the dynamic or perspective (e.g., "a deep, immersive zoom into the fractal," "a mesmerizing rotation through the attractor's space," "a fluid morphing of mathematical forms," "a journey through a fractal landscape").`,
      `Color Scheme: ${colorScheme} - Describe the color palette and its mood (e.g., "vibrant plasma colors with electric blues and fiery oranges," "ethereal viridis gradients with deep purples and bright yellows," "dark and intense magma tones," "harmonious cividis hues," "a full spectrum rainbow").`,
      `Number of Samples: ${numSamples} - Emphasize density and detail (e.g., "extremely high detail," "dense and intricate," "millions of tiny points forming a cohesive image").`,
      `Noise Scale: ${noiseScale} - Describe the level of organic imperfection or smoothness (e.g., "subtle organic noise for a natural feel," "minimal noise for pristine mathematical precision," "a delicate scattering of points").`,
    ]

    if (enableStereographic) {
      details.push(
        `Stereographic Projection: ${stereographicPerspective} - Describe the visual effect (e.g., "a 'little planet' effect where the mathematical space wraps around a sphere," "a 'tunnel vision' effect creating an infinite, converging corridor of patterns").`,
      )
    }

    if (currentPrompt) {
      details.push(
        `User's additional input: "${currentPrompt}". Incorporate this seamlessly into the artistic description.`,
      )
    }

    const fullPrompt = `${basePrompt}\n\n${details.map((d) => `- ${d}`).join("\n")}\n\nEnsure the prompt is evocative, highly descriptive, and suitable for generating a visually stunning and complex abstract image. Focus on artistic style, lighting, texture, and overall atmosphere. Do not include any instructions or conversational text in the final prompt, only the prompt itself.`

    const LLM_TEMP = 0.7 // Define temperature here

    const { text: enhancedPrompt } = await generateText({
      model: openai("gpt-4o"),
      prompt: fullPrompt,
      temperature: LLM_TEMP, // Use the defined temperature
    })

    return new Response(JSON.stringify({ enhancedPrompt }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error: any) {
    console.error("Error enhancing prompt:", error)
    return new Response(JSON.stringify({ details: error.message || "Internal Server Error" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    })
  }
}
