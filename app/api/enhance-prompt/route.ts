import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const {
      dataset,
      scenario,
      colorScheme,
      numSamples,
      noiseScale,
      currentPrompt,
      domeProjection,
      domeDiameter,
      domeResolution,
      panoramic360,
      panoramaResolution,
      panoramaFormat,
      stereographicPerspective,
    } = await request.json()

    console.log("Enhancing prompt with parameters:", {
      dataset,
      scenario,
      colorScheme,
      panoramic360,
      panoramaFormat,
      stereographicPerspective,
      domeProjection,
    })

    // Build projection-specific context
    let projectionContext = ""
    if (panoramic360 && panoramaFormat === "stereographic") {
      if (stereographicPerspective === "tunnel") {
        projectionContext = `
        STEREOGRAPHIC TUNNEL PROJECTION REQUIREMENTS:
        - Looking UP perspective with sky/ceiling in the center
        - Buildings, structures, or landscape elements curve around the edges
        - Fisheye distortion effect with dramatic perspective
        - Center should be bright (sky, ceiling, or overhead elements)
        - Edges should contain ground-level or architectural elements
        - Create immersive upward-looking tunnel effect
        - Use dramatic lighting from above
        `
      } else {
        projectionContext = `
        STEREOGRAPHIC LITTLE PLANET PROJECTION REQUIREMENTS:
        - Looking DOWN perspective with ground/landscape in the center
        - Sky, horizon, or upper elements curve around the edges
        - Tiny planet effect with ground as focal point
        - Center should contain terrain, buildings, or ground elements
        - Edges should contain sky, clouds, or atmospheric elements
        - Create miniature world effect
        - Use natural lighting from above
        `
      }
    } else if (panoramic360) {
      projectionContext = `
      360° PANORAMIC REQUIREMENTS:
      - Equirectangular projection format
      - Seamless wraparound environment
      - Immersive skybox suitable for VR
      - Wide field of view with natural perspective
      `
    } else if (domeProjection) {
      projectionContext = `
      DOME PROJECTION REQUIREMENTS:
      - Fisheye perspective optimized for ${domeDiameter}m dome
      - ${domeResolution} resolution
      - Immersive 360-degree view
      - Suitable for planetarium display
      `
    }

    // Build mathematical context based on dataset
    const mathematicalContext = {
      lorenz: "Lorenz attractor with chaotic butterfly patterns, strange attractors, nonlinear dynamics",
      rossler: "Rössler attractor with spiral chaotic flows, continuous dynamical systems",
      henon: "Hénon map discrete chaotic system, fractal basin boundaries",
      clifford: "Clifford attractor with symmetric chaotic patterns, beautiful strange attractors",
      mandelbrot: "Mandelbrot set fractal with infinite complexity, self-similar patterns",
      julia: "Julia set fractals with intricate boundary structures",
      newton: "Newton fractal with complex root-finding visualization, colorful basins",
      cellular: "Cellular automata with emergent patterns, Conway's Game of Life",
      diffusion: "Reaction-diffusion systems with Turing patterns, biological morphogenesis",
      wave: "Wave interference patterns, standing waves, harmonic oscillations",
      spirals: "Fibonacci spirals with golden ratio proportions, natural growth patterns",
      voronoi: "Voronoi diagrams with cellular tessellations, natural partitioning",
      perlin: "Perlin noise with organic textures, procedural generation",
    }

    // Build scenario context
    const scenarioContext = {
      pure: "pure mathematical visualization with abstract geometric forms",
      urban: "urban environments with buildings, streets, and city architecture",
      landscape: "natural landscapes with mountains, valleys, and organic terrain",
      geological: "geological formations with rock structures, mineral patterns",
      botanical: "botanical structures with plant forms, organic growth patterns",
      atmospheric: "atmospheric phenomena with clouds, weather, and sky effects",
      crystalline: "crystalline structures with geometric crystal formations",
      textile: "textile patterns with fabric textures and woven designs",
      metallic: "metallic surfaces with reflective materials and industrial textures",
      organic: "organic textures with natural biological forms",
      marine: "marine ecosystems with underwater environments and sea life",
      architectural: "architectural forms with structural engineering and design",
    }

    const basePrompt =
      currentPrompt ||
      `Create a photorealistic ${mathematicalContext[dataset] || dataset} visualization in a ${scenarioContext[scenario] || scenario} setting with ${colorScheme} color palette`

    const enhancementPrompt = `
    You are an expert in mathematical visualization and AI art generation. Enhance this prompt for creating stunning photorealistic artwork:

    BASE PROMPT: "${basePrompt}"

    MATHEMATICAL DATASET: ${dataset} - ${mathematicalContext[dataset] || "advanced mathematical patterns"}
    SCENARIO: ${scenario} - ${scenarioContext[scenario] || scenario}
    COLOR SCHEME: ${colorScheme}
    COMPLEXITY: ${numSamples} sample points, noise scale ${noiseScale}

    ${projectionContext}

    ENHANCEMENT REQUIREMENTS:
    1. Add specific technical details about the mathematical algorithm
    2. Include photorealistic rendering specifications
    3. Add atmospheric and lighting details
    4. Specify material properties and textures
    5. Include composition and perspective guidance
    6. Add environmental context appropriate for the scenario
    7. Ensure the description works well for AI image generation
    8. Make it vivid and technically precise

    Return only the enhanced prompt, no explanations.
    `

    console.log("Sending enhancement request to OpenAI...")

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: enhancementPrompt,
      maxTokens: 500,
    })

    console.log("Enhanced prompt generated:", text)

    return NextResponse.json({
      enhancedPrompt: text.trim(),
    })
  } catch (error: any) {
    console.error("Prompt enhancement error:", error)
    return NextResponse.json({ error: "Failed to enhance prompt", details: error.message }, { status: 500 })
  }
}
