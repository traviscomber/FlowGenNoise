import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

/**
 * POST /api/enhance-prompt
 *
 * Request JSON:
 * {
 *   dataset: string,
 *   scenario: string,
 *   colorScheme: string,
 *   numSamples: number,
 *   noiseScale: number,
 *   currentPrompt?: string,
 *   enableStereographic?: boolean,
 *   stereographicPerspective?: "little-planet" | "tunnel"
 * }
 */
export async function POST(request: NextRequest) {
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
    } = await request.json()

    /* ------------------------------------------------------------------ */
    /* 1. Build a comprehensive “base” prompt from the supplied settings  */
    /* ------------------------------------------------------------------ */
    let basePrompt = `Generate a highly detailed, abstract mathematical artwork.
The core structure is derived from a "${dataset}" dataset, featuring intricate patterns like ${
      dataset === "spirals"
        ? "Fibonacci, logarithmic, and Archimedean spirals with golden-ratio modulations"
        : dataset === "quantum"
          ? "Schrödinger wave functions, Heisenberg uncertainty principles, and quantum-entanglement correlations"
          : dataset === "strings"
            ? "11-dimensional M-theory projections, Calabi-Yau compactifications, and string-vibration modes"
            : dataset === "fractals"
              ? "Hausdorff dimensions, Sierpiński-triangle iterations, Julia-set dynamics, and Barnsley-fern mutations"
              : dataset === "topology"
                ? "Klein-bottle embeddings, Möbius strips, torus knots, and Hopf fibrations"
                : dataset === "moons"
                  ? "hyperbolic curves, elliptic functions, and non-Euclidean geometries forming crescent shapes"
                  : dataset === "circles"
                    ? "concentric manifold projections, 4-D torus embeddings, and Möbius-strip influences"
                    : dataset === "blobs"
                      ? "Voronoi dynamics, Lorenz-attractor chaos, and turbulent-flow patterns"
                      : dataset === "checkerboard"
                        ? "fractal checkerboards with Mandelbrot-like iterations and complex-plane distortions"
                        : dataset === "gaussian"
                          ? "multi-modal Gaussian distributions with correlated noise and Perlin-like distortions"
                          : dataset === "grid"
                            ? "non-linear grid distortions, Klein-bottle transformations, and wave-like effects"
                            : "complex mathematical structures"
    }.`

    basePrompt += ` The visual narrative is blended with a "${scenario}" scenario, evoking ${
      scenario === "pure"
        ? "sacred geometry and a sense of profound cosmic order"
        : scenario === "quantum"
          ? "the probabilistic nature of the quantum realm with shimmering particles and energy fields"
          : scenario === "cosmic"
            ? "vast cosmic scales, gravitational lensing, and distant nebulae"
            : scenario === "microscopic"
              ? "intricate molecular dynamics and protein folding"
              : scenario === "forest"
                ? "an enchanted fractal forest of bioluminescent flora"
                : scenario === "ocean"
                  ? "the mysterious deep ocean with swirling currents and ancient coral formations"
                  : scenario === "neural"
                    ? "the architecture of neural networks with firing neurons and synaptic connections"
                    : scenario === "crystalline"
                      ? "perfect crystal lattices and gemstone formations"
                      : scenario === "plasma"
                        ? "dynamic plasma physics with charged-particle interactions"
                        : scenario === "atmospheric"
                          ? "majestic atmospheric phenomena such as auroras and lightning"
                          : scenario === "geological"
                            ? "tectonic movements, volcanic eruptions, and mineral crystallisation"
                            : scenario === "biological"
                              ? "the fundamental processes of DNA helices and cellular metabolism"
                              : "a unique artistic interpretation"
    }.`

    basePrompt += ` The artwork is rendered in a "${colorScheme}" colour palette with approximately ${numSamples} sample points and a noise scale of ${noiseScale}.`

    if (enableStereographic) {
      basePrompt +=
        stereographicPerspective === "little-planet"
          ? ` Apply a "Little-Planet" stereographic projection, wrapping the scene into a tiny spherical world with a curved horizon and an intimate, miniature-universe aesthetic.`
          : ` Apply a "Tunnel-Vision" stereographic projection, drawing the viewer into an inward-curving vortex with a hypnotic vanishing-point centre.`
    }

    basePrompt += ` The final image must be high-resolution, visually stunning, and conceptually rich.`

    /* ------------------------------------------------------------------ */
    /* 2. Enhance the prompt with GPT-4o                                  */
    /* ------------------------------------------------------------------ */
    const SYSTEM_MESSAGE =
      "You are a world-class mathematical artist and theoretical physicist that writes museum-quality AI-art prompts."

    const GPT_TEMPERATURE = 0.8 // renamed so no duplicate “temperature” identifier

    const { text: enhancedPrompt } = await generateText({
      model: openai("gpt-4o"),
      system: SYSTEM_MESSAGE,
      prompt: `Elevate the following draft prompt. Use advanced artistic terminology, describe lighting, materials, atmosphere, and ensure the mathematics remains visually represented.\n\nDraft prompt:\n"""${currentPrompt || basePrompt}"""\n\nEnhanced prompt:`,
      temperature: GPT_TEMPERATURE,
      maxTokens: 900,
    })

    return NextResponse.json({ enhancedPrompt })
  } catch (err: any) {
    console.error("Prompt-enhancement error:", err)
    return NextResponse.json({ error: "Failed to enhance prompt", details: err.message }, { status: 500 })
  }
}
