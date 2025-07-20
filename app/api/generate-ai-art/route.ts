import { type NextRequest, NextResponse } from "next/server"
import { experimental_generateImage, NoImageGeneratedError } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const {
      dataset,
      scenario,
      colorScheme,
      seed,
      numSamples,
      noise,
      customPrompt,
      enableStereographic,
      stereographicPerspective,
    } = await request.json()

    let finalPrompt = customPrompt

    // If no custom prompt is provided, or if it's empty after enhancement, generate a default detailed prompt
    if (!finalPrompt) {
      let basePrompt = `Generate a highly detailed, abstract mathematical artwork.
      The core structure is derived from a "${dataset}" dataset, featuring intricate patterns like ${
        dataset === "spirals"
          ? "Fibonacci, logarithmic, and Archimedean spirals with golden ratio and prime number modulations"
          : dataset === "quantum"
            ? "Schrödinger wave functions, Heisenberg uncertainty principles, and quantum entanglement correlations"
            : dataset === "strings"
              ? "11-dimensional M-theory projections, Calabi-Yau manifold compactifications, and string vibration modes"
              : dataset === "fractals"
                ? "Hausdorff dimensions, Sierpinski triangle iterations, Julia set dynamics, and Barnsley fern mutations"
                : dataset === "topology"
                  ? "Klein bottle embeddings, Möbius strips, Torus knots, and Hopf fibrations"
                  : dataset === "moons"
                    ? "hyperbolic curves, elliptic functions, and non-Euclidean geometries forming crescent shapes"
                    : dataset === "circles"
                      ? "concentric manifold projections, 4D torus embeddings, and Möbius strip influences"
                      : dataset === "blobs"
                        ? "Voronoi dynamics, Lorenz attractor chaos, and turbulent flow patterns"
                        : dataset === "checkerboard"
                          ? "fractal checkerboard patterns with Mandelbrot-like iterations and complex plane distortions"
                          : dataset === "gaussian"
                            ? "multi-modal Gaussian distributions with correlated noise and Perlin-like distortions"
                            : dataset === "grid"
                              ? "non-linear grid distortions, Klein bottle transformations, and wave-like effects"
                              : "complex mathematical structures"
      }.`

      basePrompt += ` The visual narrative is blended with a "${scenario}" scenario, evoking ${
        scenario === "pure"
          ? "sacred geometry, advanced mathematical visualization, and a sense of profound cosmic order"
          : scenario === "quantum"
            ? "the ethereal and probabilistic nature of the quantum realm, with shimmering particles and wave-like energy fields"
            : scenario === "cosmic"
              ? "vast cosmic scales, gravitational lensing, dark matter halos, and distant nebulae with stellar nurseries"
              : scenario === "microscopic"
                ? "the intricate world of molecular dynamics, Brownian motion, chemical bonds, and protein folding"
                : scenario === "forest"
                  ? "an enchanted living forest, with L-system fractal trees, bioluminescent flora, and hidden magical energies"
                  : scenario === "ocean"
                    ? "the mysterious deep ocean, with bioluminescent creatures, swirling currents, and ancient coral formations"
                    : scenario === "neural"
                      ? "the complex architecture of neural networks, with firing neurons, synaptic connections, and intricate brainwave patterns"
                      : scenario === "crystalline"
                        ? "perfect crystalline lattice structures, gemstone formations, and subtle light refractions within minerals"
                        : scenario === "plasma"
                          ? "dynamic plasma physics, electromagnetic fields, charged particle interactions, and controlled fusion reactions"
                          : scenario === "atmospheric"
                            ? "majestic atmospheric phenomena, swirling clouds, lightning strikes, and the ethereal glow of auroras"
                            : scenario === "geological"
                              ? "the immense forces of geological time, tectonic plate movements, volcanic eruptions, and mineral crystallization"
                              : scenario === "biological"
                                ? "the fundamental processes of biological systems, DNA helices, protein synthesis, and cellular metabolism"
                                : "a unique artistic interpretation"
      }.`

      basePrompt += ` The artwork is rendered in a "${colorScheme}" color palette, featuring ${
        colorScheme === "plasma"
          ? "deep purples, vibrant magentas, and electric yellows, creating an energetic and fluid visual"
          : colorScheme === "quantum"
            ? "probability blues, wave greens, and particle golds, suggesting an otherworldly, ethereal glow"
            : colorScheme === "cosmic"
              ? "void blacks, nebula purples, and stark star whites, capturing the grandeur of deep space"
              : colorScheme === "thermal"
                ? "absolute zero blues transitioning to fiery oranges and molten golds, depicting intense heat gradients"
                : colorScheme === "spectral"
                  ? "a full electromagnetic spectrum, with vibrant reds, greens, and blues blending seamlessly"
                  : colorScheme === "crystalline"
                    ? "diamond whites, sapphire blues, and emerald greens, reflecting purity and geometric precision"
                    : colorScheme === "bioluminescent"
                      ? "deep sea blues and greens with glowing algae and ethereal light trails"
                      : colorScheme === "aurora"
                        ? "deep indigos, teal greens, and golden yellows, mimicking the dance of the northern lights"
                        : colorScheme === "metallic"
                          ? "shimmering coppers, silvers, golds, and platinums, evoking a sense of precious metals"
                          : colorScheme === "prismatic"
                            ? "intense light refraction, with a full rainbow dispersion and vibrant, sharp color separation"
                            : colorScheme === "monochromatic"
                              ? "a perfect grayscale spectrum, emphasizing mathematical form and shadow play"
                              : colorScheme === "infrared"
                                ? "deep reds, fiery oranges, and warm yellows, visualizing heat signatures and hidden energies"
                                : "a rich and harmonious blend of colors"
      }.`

      basePrompt += ` It incorporates approximately ${numSamples} sample points, with a subtle noise scale of ${noise} to introduce organic imperfections and depth.`

      if (enableStereographic) {
        if (stereographicPerspective === "little-planet") {
          basePrompt += ` The entire composition is transformed into a stunning 'Little Planet' stereographic projection, creating a spherical, miniature world effect where the edges of the scene wrap around to form a tiny globe. Emphasize the curved horizon, the sense of looking down onto a small, self-contained universe, and the distortion that makes distant elements appear closer to the center. The perspective should be grand yet intimate, like a tiny celestial body.`
        } else if (stereographicPerspective === "tunnel") {
          basePrompt += ` The artwork is projected into a dramatic 'Tunnel Vision' stereographic effect, pulling the viewer into an infinite, inward-curving vortex. Highlight the strong vanishing point at the center, the radial lines converging, and the sense of being drawn into a deep, mesmerizing abyss. The distortion should create a powerful, immersive, and almost hypnotic tunnel-like experience.`
        }
      }

      basePrompt += ` The final image should be a high-resolution, visually stunning, and conceptually rich piece of digital art, suitable for a gallery display. Focus on intricate details, vibrant colors, and a sense of dynamic mathematical beauty.`
      finalPrompt = basePrompt
    }

    const { image } = await experimental_generateImage({
      model: openai.image("dall-e-3"),
      prompt: finalPrompt,
    })

    return NextResponse.json({ image: image.base64 })
  } catch (error: any) {
    console.error("AI image generation error:", error)
    if (NoImageGeneratedError.isInstance(error)) {
      console.error("No image generated:", error.cause, error.responses)
      return NextResponse.json(
        { error: "AI model failed to generate an image.", details: error.cause?.message || "Unknown error" },
        { status: 500 },
      )
    }
    return NextResponse.json({ error: "Failed to generate AI art", details: error.message }, { status: 500 })
  }
}
