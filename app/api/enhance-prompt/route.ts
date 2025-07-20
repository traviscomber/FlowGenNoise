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

    console.log("Enhancing prompt with params:", {
      dataset,
      scenario,
      colorScheme,
      panoramic360,
      panoramaFormat,
      stereographicPerspective,
      domeProjection,
    })

    // Build context about the mathematical dataset
    const datasetContext = {
      spirals: "Fibonacci spirals with golden ratio mathematics, logarithmic growth patterns",
      fractal: "Fractal patterns with recursive self-similarity, Mandelbrot-like structures",
      hyperbolic: "Hyperbolic geometry with non-Euclidean curved space mathematics",
      gaussian: "Gaussian field distributions with statistical probability curves",
      cellular: "Cellular automata with Conway's Game of Life-style evolution",
      voronoi: "Voronoi diagrams with natural tessellation patterns",
      perlin: "Perlin noise with organic procedural generation",
      mandelbrot: "Mandelbrot set with complex number iterations and escape sequences",
      lorenz: "Lorenz attractor with chaotic dynamical systems",
      julia: "Julia sets with complex plane transformations",
      diffusion: "Reaction-diffusion systems with Turing patterns",
      wave: "Wave interference patterns with harmonic oscillations",
    }

    // Build context about the scenario
    const scenarioContext = {
      pure: "pure mathematical visualization with abstract geometric forms",
      landscape: "natural landscape with mountains, trees, grass, and organic textures",
      architectural: "architectural forms with buildings, geometric structures, and urban design",
      geological: "geological formations with rocks, crystals, minerals, and earth textures",
      botanical: "botanical structures with plants, leaves, flowers, and organic growth patterns",
      atmospheric: "atmospheric phenomena with clouds, mist, weather effects, and sky elements",
      crystalline: "crystalline structures with geometric crystal formations and prismatic effects",
      textile: "textile patterns with woven fabrics, threads, and material textures",
      metallic: "metallic surfaces with reflective materials, chrome, and industrial finishes",
      organic: "organic textures with flowing, natural, biological forms and surfaces",
      urban: "urban environments with city streets, buildings, infrastructure, and metropolitan elements",
      marine: "marine ecosystems with water, waves, underwater elements, and aquatic life",
    }

    // Build projection-specific context
    let projectionContext = ""
    if (panoramic360 && panoramaFormat === "stereographic") {
      if (stereographicPerspective === "tunnel") {
        projectionContext = `STEREOGRAPHIC TUNNEL PROJECTION: Looking upward perspective with buildings, structures, or landscape elements curving dramatically around the edges toward a central sky or ceiling. The center should be bright (sky, ceiling, or open space) with architectural or natural elements forming a circular tunnel effect around the perimeter. Think of standing in a courtyard looking up at surrounding buildings that curve inward due to the fisheye effect. The image should have a dramatic circular distortion with elements appearing to bend and curve toward the center point. Perfect for creating immersive upward-looking environments.`
      } else {
        projectionContext = `STEREOGRAPHIC LITTLE PLANET PROJECTION: Looking downward perspective creating a tiny planet effect with landscape, buildings, or terrain in the center and sky around the edges. The ground/surface should be in the center with elements radiating outward, and the sky or background forming the outer ring. Think of a miniature world viewed from above with dramatic circular distortion. The image should curve and wrap around itself creating a spherical planet-like appearance. Perfect for social media and artistic tiny planet effects.`
      }
    } else if (panoramic360 && panoramaFormat === "equirectangular") {
      projectionContext = `360° EQUIRECTANGULAR PANORAMA: Full spherical environment in 2:1 aspect ratio suitable for VR and 360° viewers. The image should wrap seamlessly from left to right (360° horizontally) and cover from zenith to nadir (180° vertically). Include horizon line in the middle, sky in upper half, and ground/floor in lower half. Perfect for immersive VR environments and skyboxes.`
    } else if (domeProjection) {
      projectionContext = `DOME PROJECTION: Fisheye circular format optimized for ${domeDiameter}m planetarium dome in ${domeResolution} resolution. The image should be contained within a perfect circle with content distributed radially from center to edge. Include zenith point at center and horizon around the perimeter. Perfect for immersive dome theaters and planetarium shows.`
    }

    // Build color scheme context
    const colorContext = {
      plasma: "vibrant plasma colors with deep purples, magentas, and bright yellows",
      quantum: "quantum-inspired colors with electric blues, cyan, and gold accents",
      cosmic: "cosmic space colors with deep blacks, purples, and bright whites",
      thermal: "thermal heat colors with deep blues transitioning to bright yellows and whites",
      futuristic: "futuristic colors with cyan, electric blue, and bright whites",
      neon: "neon colors with bright magentas, electric greens, and glowing yellows",
      urban: "urban colors with grays, blues, and metallic accents",
    }

    const mathDataset = datasetContext[dataset as keyof typeof datasetContext] || dataset
    const scenarioDesc = scenarioContext[scenario as keyof typeof scenarioContext] || scenario
    const colorDesc = colorContext[colorScheme as keyof typeof colorContext] || `${colorScheme} color palette`

    // Create enhanced prompt
    const systemPrompt = `You are an expert at creating detailed prompts for AI art generation that combines advanced mathematics with photorealistic environments. Your task is to enhance prompts for mathematical art that will be rendered in specific projection formats.

Focus on:
1. Mathematical accuracy and visual complexity
2. Photorealistic textures, lighting, and materials
3. Specific projection format requirements
4. Environmental details and atmospheric effects
5. Professional photography and rendering techniques

Always include technical photography terms like "ultra-detailed", "8K resolution", "professional lighting", "photorealistic rendering", etc.`

    const userPrompt = `Create an enhanced prompt for AI art generation with these specifications:

MATHEMATICAL DATASET: ${mathDataset}
SCENARIO/ENVIRONMENT: ${scenarioDesc}
COLOR SCHEME: ${colorDesc}
COMPLEXITY: ${numSamples} sample points with ${noiseScale} noise scale

${projectionContext}

CURRENT PROMPT: "${currentPrompt || "Create mathematical art"}"

Please enhance this into a detailed, professional prompt that combines the mathematical concepts with photorealistic environmental details. Include specific technical terms for the projection format, lighting, materials, and rendering quality. The result should be suitable for generating stunning, mathematically-accurate artwork in the specified format.

Make the prompt detailed but concise (under 200 words). Focus on visual impact and technical accuracy.`

    console.log("Sending to OpenAI:", { systemPrompt, userPrompt })

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
      maxTokens: 300,
    })

    console.log("Enhanced prompt generated:", text)

    return NextResponse.json({
      enhancedPrompt: text,
      success: true,
    })
  } catch (error: any) {
    console.error("Prompt enhancement error:", error)
    return NextResponse.json(
      {
        error: "Failed to enhance prompt",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
