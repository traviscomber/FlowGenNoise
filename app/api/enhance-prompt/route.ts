import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  try {
    const { dataset, scenario, colorScheme, numSamples, noiseScale, currentPrompt } = await req.json()

    if (!dataset || !scenario || !colorScheme) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    console.log("Enhancing prompt for:", { dataset, scenario, colorScheme, numSamples, noiseScale })

    const enhancementPrompt = `You are a world-renowned expert in mathematical visualization, theoretical physics, and AI art generation. You possess deep knowledge of:

MATHEMATICAL DOMAINS:
- Advanced topology (Klein bottles, Möbius strips, Hopf fibrations)
- Quantum field theory and string theory visualizations
- Fractal geometry (Hausdorff dimensions, Julia sets, Mandelbrot sets)
- Complex analysis and Riemann surfaces
- Differential geometry and manifold theory
- Chaos theory and dynamical systems
- Number theory and prime distributions

ARTISTIC MASTERY:
- Sacred geometry and golden ratio compositions
- Color theory with mathematical precision
- Light physics and atmospheric rendering
- Texture synthesis using mathematical functions
- Compositional harmony based on mathematical ratios

Create an enhanced, museum-quality prompt for generating AI artwork based on these parameters:
- Dataset: ${dataset} (advanced mathematical structure)
- Scenario: ${scenario} (environmental/thematic context)
- Color Scheme: ${colorScheme} (sophisticated palette)
- Data Points: ${numSamples} (complexity scale)
- Noise Level: ${noiseScale} (organic variation)

Current prompt: "${currentPrompt || "None provided"}"

Generate a sophisticated, technically precise prompt that:

1. MATHEMATICAL PRECISION: Describe the ${dataset} pattern with advanced mathematical terminology, including:
   - Specific equations, transformations, or geometric properties
   - Dimensional analysis and topological characteristics
   - Quantum mechanical or field theory analogies where applicable
   - Fractal dimensions and self-similarity properties

2. SCENARIO INTEGRATION: Seamlessly blend ${scenario} elements with mathematical accuracy:
   - Physical laws governing the scenario (fluid dynamics, thermodynamics, etc.)
   - Environmental parameters with quantitative descriptions
   - Realistic material properties and interactions
   - Scale relationships and dimensional consistency

3. ARTISTIC SOPHISTICATION: Incorporate ${colorScheme} with professional art direction:
   - Color temperature specifications (Kelvin values)
   - Lighting models (Rayleigh scattering, subsurface scattering)
   - Composition using mathematical ratios (golden ratio, rule of thirds)
   - Texture details based on physical or mathematical properties

4. TECHNICAL EXCELLENCE: Include professional rendering specifications:
   - High dynamic range (HDR) lighting
   - Physically based rendering (PBR) materials
   - Anti-aliasing and sampling quality
   - Resolution and detail enhancement keywords

5. SCALE AND COMPLEXITY: Reference the ${numSamples} data points and ${noiseScale} noise:
   - Microscopic to macroscopic scale transitions
   - Emergent complexity from simple rules
   - Statistical distributions and probability densities
   - Organic variation within mathematical constraints

The prompt should be 3-4 sentences, rich in technical detail, and optimized for creating gallery-worthy mathematical art that bridges science and aesthetics. Use terminology that would impress both mathematicians and artists.

Focus on creating breathtaking visualizations that reveal the hidden beauty in mathematical structures while maintaining scientific accuracy and artistic excellence.`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: enhancementPrompt,
      temperature: 0.7,
      maxTokens: 300,
    })

    console.log("Enhanced prompt generated:", text)

    return NextResponse.json({
      enhancedPrompt: text.trim(),
      originalParams: { dataset, scenario, colorScheme, numSamples, noiseScale },
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
