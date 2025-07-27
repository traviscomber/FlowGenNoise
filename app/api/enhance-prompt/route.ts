import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Mathematical datasets with enhanced descriptions
const MATHEMATICAL_DATASETS = {
  spirals: {
    name: "Fibonacci Spirals",
    description: "Golden ratio spiral patterns with φ = 1.618, creating natural logarithmic curves",
    mathematicalContext:
      "Based on the Fibonacci sequence where F(n) = F(n-1) + F(n-2), creating spirals with golden ratio proportions",
  },
  fractal: {
    name: "Fractal Trees",
    description: "Recursive branching structures following Z² + C iterations",
    mathematicalContext:
      "Self-similar recursive structures with infinite detail at every scale, following L-system rules",
  },
  mandelbrot: {
    name: "Mandelbrot Set",
    description: "Classic fractal visualization where |Z| < 2",
    mathematicalContext: "Complex plane fractal defined by Z(n+1) = Z(n)² + C, where points remain bounded",
  },
  julia: {
    name: "Julia Sets",
    description: "Complex plane transformations with C = -0.7269",
    mathematicalContext:
      "Connected Julia sets in the complex plane with fixed parameter C, creating intricate boundary patterns",
  },
  lorenz: {
    name: "Lorenz Attractor",
    description: "Chaotic system dynamics showing butterfly effect",
    mathematicalContext: "Strange attractor from the Lorenz equations: dx/dt = σ(y-x), dy/dt = x(ρ-z)-y, dz/dt = xy-βz",
  },
  hyperbolic: {
    name: "Hyperbolic Geometry",
    description: "Non-Euclidean patterns with K = -1 curvature",
    mathematicalContext:
      "Hyperbolic plane geometry with negative curvature, creating infinite tessellations and saddle surfaces",
  },
  gaussian: {
    name: "Gaussian Fields",
    description: "Statistical distributions with σ² variance",
    mathematicalContext: "Random fields following Gaussian probability distributions with correlation structures",
  },
  cellular: {
    name: "Cellular Automata",
    description: "Emergent grid patterns following Conway's rules",
    mathematicalContext: "Discrete computational models with local rules creating emergent global patterns",
  },
  voronoi: {
    name: "Voronoi Diagrams",
    description: "Natural tessellations based on nearest neighbor",
    mathematicalContext: "Spatial partitioning based on distance metrics, creating natural cellular structures",
  },
  perlin: {
    name: "Perlin Noise",
    description: "Multi-octave organic texture patterns",
    mathematicalContext: "Gradient noise function with multiple octaves creating natural-looking random textures",
  },
  diffusion: {
    name: "Reaction-Diffusion",
    description: "Turing patterns from chemical reactions",
    mathematicalContext: "Partial differential equations modeling chemical morphogenesis and pattern formation",
  },
  wave: {
    name: "Wave Interference",
    description: "Harmonic superposition creating interference",
    mathematicalContext:
      "Wave equation solutions with multiple sources creating constructive and destructive interference",
  },
  neural: {
    name: "Neural Networks",
    description: "Interconnected node patterns mimicking brain structures",
    mathematicalContext: "Graph structures representing artificial neural network topologies and connections",
  },
  quantum: {
    name: "Quantum Fields",
    description: "Probability wave functions in quantum mechanics",
    mathematicalContext: "Schrödinger equation solutions showing quantum probability distributions and wave functions",
  },
  crystalline: {
    name: "Crystal Lattices",
    description: "Atomic structure symmetries in solid state physics",
    mathematicalContext: "Periodic crystal structures with translational symmetry in three-dimensional space",
  },
  plasma: {
    name: "Plasma Dynamics",
    description: "Electromagnetic field dynamics in magnetohydrodynamics",
    mathematicalContext: "Magnetohydrodynamic equations governing plasma behavior in electromagnetic fields",
  },
}

// Scenario contexts for enhanced prompting
const SCENARIO_CONTEXTS = {
  pure: "pure mathematical abstraction with geometric precision and clean scientific visualization",
  cosmic: "cosmic space environment with stellar formations, nebulae, and galactic structures",
  microscopic: "microscopic world with cellular structures, molecular interactions, and biological detail",
  crystalline: "crystalline mineral formations with prismatic clarity and geometric perfection",
  organic: "organic biological forms with natural growth patterns and living complexity",
  atmospheric: "atmospheric phenomena with weather dynamics, cloud formations, and fluid motion",
  quantum: "quantum realm visualization with subatomic interactions and particle physics",
  neural: "neural network structures with synaptic connections and brain-like patterns",
  electromagnetic: "electromagnetic field visualizations with energy propagation and wave dynamics",
  fluid: "fluid dynamics with turbulent flow patterns and hydrodynamic structures",
  botanical: "botanical growth patterns with plant morphology and natural organic forms",
  geological: "geological formations with rock structures, mineral patterns, and earth sciences",
  architectural: "architectural geometric structures with building forms and urban design",
  textile: "textile patterns with weaving structures and fabric design aesthetics",
}

// Color scheme enhancement contexts
const COLOR_CONTEXTS = {
  plasma: "electric plasma energy colors with purple, blue, and magenta luminosity",
  quantum: "quantum field colors with glowing greens, blues, and ethereal radiance",
  cosmic: "deep cosmic colors with purples, blues, and stellar light",
  thermal: "thermal heat colors with reds, oranges, and fiery intensity",
  spectral: "full spectrum rainbow colors with prismatic light transitions",
  crystalline: "crystalline ice colors with blues, whites, and silver clarity",
  bioluminescent: "bioluminescent colors with aquatic blues and organic green glow",
  aurora: "aurora borealis colors with dancing greens and atmospheric purples",
  metallic: "metallic colors with gold, silver, and bronze reflective surfaces",
  prismatic: "prismatic light colors with rainbow refraction and optical beauty",
  monochromatic: "elegant monochromatic grayscale with sophisticated tonal variations",
  infrared: "infrared heat signature colors with thermal red visualization",
  neon: "bright neon colors with fluorescent electric vibrancy",
  sunset: "sunset sky colors with warm oranges, pinks, and golden hour magic",
  ocean: "ocean depth colors with deep blues, teals, and aquatic mystery",
  forest: "forest nature colors with greens, browns, and organic earth tones",
  volcanic: "volcanic colors with lava reds, oranges, and geological fire",
  arctic: "arctic ice colors with cool blues, whites, and polar serenity",
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      dataset = "spirals",
      scenario = "pure",
      colorScheme = "plasma",
      customPrompt = "",
      projectionType = "little-planet",
      resolution = "2160p",
    } = body

    console.log("🎯 Enhancing prompt for:", { dataset, scenario, colorScheme, projectionType })

    // Get mathematical context
    const datasetInfo = MATHEMATICAL_DATASETS[dataset as keyof typeof MATHEMATICAL_DATASETS]
    const scenarioContext = SCENARIO_CONTEXTS[scenario as keyof typeof SCENARIO_CONTEXTS]
    const colorContext = COLOR_CONTEXTS[colorScheme as keyof typeof COLOR_CONTEXTS]

    // Create comprehensive prompt enhancement request
    const enhancementPrompt = `You are an expert AI art prompt engineer specializing in mathematical visualization and stereographic projections. 

Create a masterful, detailed prompt for generating a ${projectionType} stereographic projection artwork featuring:

MATHEMATICAL DATASET: ${datasetInfo?.name || dataset}
- Description: ${datasetInfo?.description || "Mathematical pattern"}
- Mathematical Context: ${datasetInfo?.mathematicalContext || "Complex mathematical structure"}

VISUAL SCENARIO: ${scenario}
- Context: ${scenarioContext || "Abstract visualization"}

COLOR PALETTE: ${colorScheme}
- Colors: ${colorContext || "Vibrant color scheme"}

PROJECTION TYPE: ${projectionType}
- ${projectionType === "little-planet" ? "Little Planet: Spherical world projection with curved horizon and 360-degree perspective" : "Tunnel View: Inverted perspective projection with infinite depth and radial symmetry"}

CUSTOM ELEMENTS: ${customPrompt || "None specified"}

REQUIREMENTS:
1. Create a highly detailed, artistic prompt that captures the mathematical beauty
2. Include specific visual qualities: lighting, composition, detail level, artistic style
3. Emphasize the stereographic projection characteristics
4. Incorporate the mathematical dataset's unique properties
5. Blend the scenario context naturally with the mathematical elements
6. Use the specified color palette effectively
7. Ensure the prompt is optimized for DALL-E 3 generation
8. Keep it under 4000 characters but make it rich and descriptive
9. Focus on artistic and aesthetic qualities while maintaining mathematical accuracy
10. Make it safe for work and appropriate for all audiences

Generate only the enhanced prompt text, no explanations or additional text.`

    console.log("🤖 Sending enhancement request to GPT-4o...")

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert AI art prompt engineer specializing in mathematical visualization and stereographic projections. Create detailed, artistic prompts that capture mathematical beauty while being optimized for AI image generation.",
        },
        {
          role: "user",
          content: enhancementPrompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    const enhancedPrompt = completion.choices[0]?.message?.content?.trim()

    if (!enhancedPrompt) {
      throw new Error("No enhanced prompt generated")
    }

    console.log("✅ Prompt enhanced successfully")
    console.log("📝 Enhanced prompt length:", enhancedPrompt.length)

    return NextResponse.json({
      success: true,
      enhancedPrompt,
      originalDataset: dataset,
      originalScenario: scenario,
      originalColorScheme: colorScheme,
      projectionType,
      promptLength: enhancedPrompt.length,
    })
  } catch (error: any) {
    console.error("🚨 Prompt enhancement error:", error)

    // Fallback prompt if OpenAI fails
    const fallbackPrompt = `A stunning ${request.body.projectionType || "little-planet"} stereographic projection showcasing ${request.body.dataset || "mathematical"} patterns in ${request.body.scenario || "abstract"} style with ${request.body.colorScheme || "vibrant"} colors. Professional digital art with dramatic lighting, perfect composition, ultra-high detail, award-winning quality, 8K resolution, photorealistic rendering, cinematic lighting, depth of field, artistic masterpiece. ${request.body.customPrompt || ""}`

    return NextResponse.json({
      success: true,
      enhancedPrompt: fallbackPrompt,
      fallback: true,
      error: error.message,
      promptLength: fallbackPrompt.length,
    })
  }
}
