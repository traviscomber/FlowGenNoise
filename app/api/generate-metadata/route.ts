import { NextResponse, type NextRequest } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

const MATHEMATICAL_DATASETS = {
  spirals: {
    name: "Logarithmic Spirals",
    description: "Golden ratio spirals following r = a·e^(b·θ), mimicking nautilus shells and galaxy arms",
    mathConcept: "Polar coordinates, exponential growth, Fibonacci sequences, φ = 1.618",
  },
  moons: {
    name: "Two Moons Problem",
    description: "Interleaving crescents creating non-linear decision boundaries",
    mathConcept: "Non-linear classification, manifold learning, topological separation",
  },
  circles: {
    name: "Concentric Circles",
    description: "Radial symmetry with multiple distance metrics r² = x² + y²",
    mathConcept: "Euclidean distance, radial basis functions, circular harmonics",
  },
  blobs: {
    name: "Gaussian Mixture",
    description: "Multivariate normal distributions creating organic cluster formations",
    mathConcept: "Probability density functions, statistical clustering, σ² variance",
  },
  checkerboard: {
    name: "Discrete Tessellation",
    description: "Alternating grid pattern with sharp topological boundaries",
    mathConcept: "Discrete topology, tessellation theory, decision boundaries",
  },
  gaussian: {
    name: "Normal Distribution",
    description: "Perfect bell curve following central limit theorem N(μ,σ²)",
    mathConcept: "Statistical distribution, probability density, central limit theorem",
  },
  grid: {
    name: "Cartesian Lattice",
    description: "Regular coordinate system with periodic tiling structure",
    mathConcept: "Cartesian coordinates, lattice theory, periodic functions",
  },
}

const SCENARIOS = {
  forest: "Enchanted mathematical forest with emerald canopies, golden light, and organic textures",
  cosmic: "Deep space nebula with stellar formations, gravitational lensing, and cosmic phenomena",
  ocean: "Underwater paradise with bioluminescent organisms, caustic lighting, and flowing currents",
  neural: "Living neural network with synaptic connections, electrical impulses, and brain-like structures",
  fire: "Mathematical flames with heat distortion, dancing embers, and molten intensity",
  ice: "Crystalline wonderland with hexagonal symmetry, aurora effects, and pristine frost patterns",
  desert: "Wind-carved formations with golden sands, mirages, and oasis reflections",
  sunset: "Golden hour atmosphere with coral skies, lens flares, and warm atmospheric perspective",
  monochrome: "Classical black and white with dramatic chiaroscuro, fine art composition, and pure form",
}

export async function POST(request: NextRequest) {
  try {
    const { dataset, scenario, seed, numSamples, noiseScale, timeStep, mode, customPrompt } = await request.json()

    if (!process.env.OPENAI_API_KEY) {
      // Return fallback metadata if no API key
      const datasetInfo = MATHEMATICAL_DATASETS[dataset as keyof typeof MATHEMATICAL_DATASETS]
      const scenarioDesc = SCENARIOS[scenario as keyof typeof SCENARIOS]

      return NextResponse.json({
        success: true,
        metadata: {
          title: `${datasetInfo?.name || dataset} in ${scenario.charAt(0).toUpperCase() + scenario.slice(1)}`,
          description: `A mathematical visualization featuring ${datasetInfo?.description || dataset} rendered in ${scenarioDesc || scenario} style. Generated with ${numSamples} data points and seed ${seed}.`,
        },
      })
    }

    const datasetInfo = MATHEMATICAL_DATASETS[dataset as keyof typeof MATHEMATICAL_DATASETS]
    const scenarioDesc = SCENARIOS[scenario as keyof typeof SCENARIOS]

    const systemPrompt = `You are a master storyteller and art curator who creates captivating titles and poetic descriptions for mathematical art pieces. Your descriptions should:

1. Create an evocative, artistic title (3-6 words)
2. Tell the story of what's happening in the mathematical visualization
3. Blend mathematical concepts with artistic narrative
4. Use vivid, sensory language that makes math feel alive
5. Capture both the technical precision and emotional beauty
6. Make the viewer feel wonder and curiosity

Format your response as JSON:
{
  "title": "Captivating Title Here",
  "description": "A poetic story describing what's happening in this mathematical artwork, making the viewer feel the beauty and wonder of the mathematical concepts at play."
}`

    const userPrompt = `Create a captivating title and story description for this mathematical artwork:

MATHEMATICAL FOUNDATION:
- Dataset: ${datasetInfo?.name} (${datasetInfo?.description})
- Mathematical Concept: ${datasetInfo?.mathConcept}
- Artistic Style: ${scenarioDesc}
- Generation Mode: ${mode.toUpperCase()}
- Parameters: ${numSamples} points, seed ${seed}, noise ${noiseScale}, flow ${timeStep}

${customPrompt ? `CUSTOM ELEMENTS: ${customPrompt}` : ""}

The artwork visualizes ${datasetInfo?.name} in a ${scenario} setting. Tell the story of what mathematical phenomena are unfolding, what the viewer is witnessing, and why this particular combination creates something magical. Make it feel like a living, breathing mathematical universe.`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.8,
      maxTokens: 300,
    })

    try {
      const metadata = JSON.parse(text.trim())
      return NextResponse.json({
        success: true,
        metadata,
      })
    } catch (parseError) {
      // Fallback if JSON parsing fails
      const lines = text.trim().split("\n")
      const title = lines[0]?.replace(/^["']|["']$/g, "") || `${datasetInfo?.name} Visualization`
      const description =
        lines
          .slice(1)
          .join(" ")
          .replace(/^["']|["']$/g, "") || `A beautiful mathematical visualization of ${datasetInfo?.name}.`

      return NextResponse.json({
        success: true,
        metadata: { title, description },
      })
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate metadata",
      },
      { status: 500 },
    )
  }
}
