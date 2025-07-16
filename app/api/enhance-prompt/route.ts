import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

const MATHEMATICAL_DATASETS = {
  spirals: {
    name: "Spirals",
    description: "Logarithmic and Archimedean spiral patterns",
    mathConcept: "Polar coordinates, exponential growth",
  },
  moons: {
    name: "Two Moons",
    description: "Interleaving crescent shapes",
    mathConcept: "Non-linear classification boundaries",
  },
  circles: {
    name: "Concentric Circles",
    description: "Nested circular patterns",
    mathConcept: "Radial symmetry, distance metrics",
  },
  blobs: {
    name: "Gaussian Blobs",
    description: "Clustered point distributions",
    mathConcept: "Normal distribution, clustering",
  },
  checkerboard: {
    name: "Checkerboard",
    description: "Grid-based alternating patterns",
    mathConcept: "Discrete topology, tessellation",
  },
  gaussian: {
    name: "Gaussian Distribution",
    description: "Bell curve point distribution",
    mathConcept: "Statistical distribution, central limit theorem",
  },
  grid: {
    name: "Regular Grid",
    description: "Uniform lattice structure",
    mathConcept: "Cartesian coordinates, periodic tiling",
  },
}

const SCENARIOS = {
  forest: "Organic forest with natural greens and earth tones",
  cosmic: "Deep space with purples, blues and cosmic phenomena",
  ocean: "Underwater scene with blues and aquatic elements",
  neural: "Neural network visualization with vibrant connections",
  fire: "Fiery landscape with reds, oranges and heat effects",
  ice: "Frozen crystalline structures with cool blues and whites",
  desert: "Arid landscape with warm sandy tones",
  sunset: "Golden hour with warm oranges and soft lighting",
  monochrome: "Black and white artistic interpretation",
}

export async function POST(request: NextRequest) {
  try {
    const { dataset, scenario, numSamples, noiseScale, currentPrompt, customElements } = await request.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "OpenAI API key not configured",
        },
        { status: 500 },
      )
    }

    const datasetInfo = MATHEMATICAL_DATASETS[dataset as keyof typeof MATHEMATICAL_DATASETS]
    const scenarioDesc = SCENARIOS[scenario as keyof typeof SCENARIOS]

    const systemPrompt = `You are an expert AI art prompt engineer specializing in mathematical and generative art. 
    You create detailed, artistic prompts that combine mathematical concepts with visual aesthetics for DALL-E image generation.
    
    Focus on:
    - Mathematical beauty and precision
    - Artistic composition and color theory
    - Visual harmony between math and art
    - Technical art terminology
    - Specific visual details that enhance the mathematical concept`

    const userPrompt = `Enhance this mathematical art prompt for DALL-E generation:

MATHEMATICAL FOUNDATION:
- Dataset: ${datasetInfo?.name} (${datasetInfo?.description})
- Mathematical Concept: ${datasetInfo?.mathConcept}
- Artistic Style: ${scenarioDesc}
- Sample Points: ${numSamples}
- Noise Scale: ${noiseScale}

CURRENT PROMPT:
${currentPrompt}

${
  customElements
    ? `CUSTOM ELEMENTS TO INCORPORATE:
${customElements}`
    : ""
}

REQUIREMENTS:
1. Keep the mathematical foundation as the core concept
2. Enhance with rich artistic details, lighting, composition
3. Add specific color palettes and textures
4. Include technical art terms (chiaroscuro, sfumato, etc.)
5. Maintain the mathematical integrity while making it visually stunning
6. Make it suitable for high-quality DALL-E generation
${customElements ? "7. Seamlessly integrate the custom elements provided" : ""}

Create an enhanced prompt that will generate a masterpiece combining mathematical precision with artistic beauty.`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
      maxTokens: 500,
    })

    return NextResponse.json({
      success: true,
      enhancedPrompt: text.trim(),
    })
  } catch (error) {
    console.error("Error enhancing prompt:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to enhance prompt",
      },
      { status: 500 },
    )
  }
}
