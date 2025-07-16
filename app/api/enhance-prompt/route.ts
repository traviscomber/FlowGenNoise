import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  try {
    const { dataset, scenario, numSamples, noiseScale, currentPrompt } = await req.json()

    console.log("Enhancing prompt for:", { dataset, scenario, numSamples, noiseScale })

    // Generate mathematical context for the dataset
    const datasetMath = getDatasetMathematicalContext(dataset)
    const scenarioContext = getScenarioContext(scenario)

    const enhancementPrompt = `You are an expert in both mathematics and AI art generation. Create an enhanced DALL-E 3 prompt that combines mathematical precision with artistic beauty.

Current Context:
- Dataset: ${dataset} (${datasetMath})
- Scenario: ${scenario} (${scenarioContext})
- Data Points: ${numSamples}
- Noise Level: ${noiseScale}
- Current Prompt: ${currentPrompt || "None provided"}

Create a detailed, professional prompt that:
1. Incorporates the mathematical nature of the ${dataset} dataset
2. Blends it seamlessly with ${scenario} artistic elements
3. Mentions the complexity of ${numSamples} data points
4. Uses the noise level (${noiseScale}) to inform texture and detail
5. Ensures the result is suitable for high-resolution upscaling
6. Includes specific artistic techniques and visual elements
7. Maintains mathematical accuracy while being visually stunning

The prompt should be 2-3 sentences, highly detailed, and optimized for DALL-E 3's capabilities. Focus on creating gallery-quality mathematical art.`

    const { text: enhancedPrompt } = await generateText({
      model: openai("gpt-4o"),
      prompt: enhancementPrompt,
      temperature: 0.7,
      maxTokens: 300,
    })

    console.log("Generated enhanced prompt:", enhancedPrompt)

    return NextResponse.json({
      enhancedPrompt: enhancedPrompt.trim(),
      originalContext: {
        dataset,
        scenario,
        numSamples,
        noiseScale,
      },
    })
  } catch (error: any) {
    console.error("Error enhancing prompt:", error)

    if (error.message.includes("api_key")) {
      return NextResponse.json(
        { error: "OpenAI API key is missing or invalid. Please set OPENAI_API_KEY." },
        { status: 500 },
      )
    }

    return NextResponse.json({ error: "Failed to enhance prompt: " + error.message }, { status: 500 })
  }
}

function getDatasetMathematicalContext(dataset: string): string {
  const contexts = {
    spirals:
      "logarithmic spirals with polar coordinates r = aθ, featuring golden ratio proportions and Fibonacci sequences",
    moons:
      "two interlocking crescents based on circular arcs, representing binary classification boundaries in machine learning",
    circles: "concentric circular patterns following radial distribution functions and harmonic oscillations",
    blobs: "Gaussian mixture models with multivariate normal distributions creating organic cluster formations",
    checkerboard:
      "discrete grid patterns with alternating binary states, representing cellular automata and tessellation theory",
    gaussian: "normal distribution bell curves with statistical probability density functions and random sampling",
    grid: "regular lattice structures with uniform spacing, representing crystalline formations and periodic functions",
  }
  return contexts[dataset as keyof typeof contexts] || "mathematical point distributions with geometric patterns"
}

function getScenarioContext(scenario: string): string {
  const contexts = {
    pure: "clean mathematical visualization with grid lines, axes, and pure geometric forms highlighting mathematical properties",
    forest:
      "organic growth patterns, fractal tree structures, natural color gradients from deep forest greens to golden sunlight",
    cosmic: "stellar formations, nebula clouds, deep space colors with cosmic dust and celestial mechanics",
    ocean: "fluid dynamics, wave interference patterns, aquatic color palettes from deep blue to seafoam",
    neural: "synaptic connections, brain-like networks, electric blue and purple neural pathways with glowing nodes",
    fire: "combustion dynamics, flame propagation patterns, warm color spectrums from deep red to bright orange",
    ice: "crystalline structures, frost patterns, cool color palettes with prismatic light refraction",
    desert: "sand dune formations, wind erosion patterns, warm earth tones and golden hour lighting",
    sunset: "atmospheric light scattering, warm gradient transitions, golden hour color temperature",
    monochrome: "grayscale tonal variations, high contrast artistic composition, minimalist aesthetic",
  }
  return contexts[scenario as keyof typeof contexts] || "thematic visual elements with artistic color coordination"
}
