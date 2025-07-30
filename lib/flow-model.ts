// lib/flow-model.ts
import { generateScatterPlotSVG, type DataPoint } from "./plot-utils"

export interface FlowArtSettings {
  dataset: string
  scenario: string
  colorScheme: string
  seed: number
  samples: number
  noise: number
  upscale: boolean
}

export const DATASETS = ["mathematical", "organic", "geometric", "abstract"] as const

export const SCENARIOS = ["spiral", "wave", "fractal", "flow-field", "particle-system"] as const

export const COLOR_SCHEMES = ["warm", "cool", "monochrome", "rainbow", "pastel"] as const

export const DEFAULT_SETTINGS: FlowArtSettings = {
  dataset: "mathematical",
  scenario: "spiral",
  colorScheme: "warm",
  seed: 42,
  samples: 100,
  noise: 0.1,
  upscale: false,
}

export class FlowModel {
  static validateSettings(settings: Partial<FlowArtSettings>): FlowArtSettings {
    return {
      dataset: DATASETS.includes(settings.dataset as any) ? settings.dataset! : DEFAULT_SETTINGS.dataset,
      scenario: SCENARIOS.includes(settings.scenario as any) ? settings.scenario! : DEFAULT_SETTINGS.scenario,
      colorScheme: COLOR_SCHEMES.includes(settings.colorScheme as any)
        ? settings.colorScheme!
        : DEFAULT_SETTINGS.colorScheme,
      seed: typeof settings.seed === "number" ? Math.max(1, Math.floor(settings.seed)) : DEFAULT_SETTINGS.seed,
      samples:
        typeof settings.samples === "number"
          ? Math.max(10, Math.min(1000, Math.floor(settings.samples)))
          : DEFAULT_SETTINGS.samples,
      noise: typeof settings.noise === "number" ? Math.max(0, Math.min(1, settings.noise)) : DEFAULT_SETTINGS.noise,
      upscale: typeof settings.upscale === "boolean" ? settings.upscale : DEFAULT_SETTINGS.upscale,
    }
  }

  static generateSeed(): number {
    return Math.floor(Math.random() * 10000) + 1
  }
}

// Function to generate data points for various mathematical datasets
export function generateDataset(dataset: string, seed: number, numSamples: number, noise: number): DataPoint[] {
  const data: DataPoint[] = []
  const random = createRandomNumberGenerator(seed)

  for (let i = 0; i < numSamples; i++) {
    let x: number, y: number, value: number

    switch (dataset) {
      case "spirals":
        const angle = i * 0.1 + random() * noise * 10
        const radius = i * 0.01 + random() * noise * 5
        x = radius * Math.cos(angle)
        y = radius * Math.sin(angle)
        value = Math.sin(angle / (2 * Math.PI)) // Value based on angle for color
        break
      case "checkerboard":
        x = random() * 2 - 1 + (random() * 2 - 1) * noise // -1 to 1
        y = random() * 2 - 1 + (random() * 2 - 1) * noise // -1 to 1
        value = (Math.floor((x + 1) * 5) + Math.floor((y + 1) * 5)) % 2 // 0 or 1
        break
      case "moons":
        const r = random()
        const t = random() * Math.PI
        const offset = i % 2 === 0 ? 0.5 : -0.5
        x = r * Math.cos(t) + offset + (random() * 2 - 1) * noise
        y = r * Math.sin(t) + (random() * 2 - 1) * noise
        value = i % 2 // Two distinct values for two moons
        break
      case "gaussian":
        // Box-Muller transform for Gaussian distribution
        const u1 = random()
        const u2 = random()
        const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
        const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2)
        x = z1 * 0.3 + (random() * 2 - 1) * noise // Scale and add noise
        y = z2 * 0.3 + (random() * 2 - 1) * noise
        value = Math.exp(-(x * x + y * y)) // Value based on distance from center
        break
      case "grid":
        const gridX = Math.floor(random() * 10)
        const gridY = Math.floor(random() * 10)
        x = gridX * 0.2 - 1 + (random() * 2 - 1) * noise * 0.1
        y = gridY * 0.2 - 1 + (random() * 2 - 1) * noise * 0.1
        value = (gridX + gridY) % 2
        break
      case "mandelbrot":
        // Simplified Mandelbrot set point generation
        const cx = random() * 3.5 - 2.5 + (random() * 2 - 1) * noise * 0.1 // -2.5 to 1
        const cy = random() * 2.5 - 1.25 + (random() * 2 - 1) * noise * 0.1 // -1.25 to 1.25
        let zx = 0
        let zy = 0
        let iteration = 0
        const maxIterations = 50
        while (zx * zx + zy * zy < 4 && iteration < maxIterations) {
          const tempX = zx * zx - zy * zy + cx
          zy = 2 * zx * zy + cy
          zx = tempX
          iteration++
        }
        x = cx
        y = cy
        value = iteration / maxIterations // Value based on escape time
        break
      case "julia":
        // Simplified Julia set point generation
        const jx = random() * 3 - 1.5 + (random() * 2 - 1) * noise * 0.1 // -1.5 to 1.5
        const jy = random() * 3 - 1.5 + (random() * 2 - 1) * noise * 0.1 // -1.5 to 1.5
        let z_x = jx
        let z_y = jy
        let iter = 0
        const c_x = -0.7 // Fixed c for Julia set
        const c_y = 0.27015
        const maxIter = 50
        while (z_x * z_x + z_y * z_y < 4 && iter < maxIter) {
          const temp_x = z_x * z_x - z_y * z_y + c_x
          z_y = 2 * z_x * z_y + c_y
          z_x = temp_x
          iter++
        }
        x = jx
        y = jy
        value = iter / maxIter // Value based on escape time
        break
      case "sierpinski":
        // Sierpinski triangle (chaos game)
        const vertices = [
          { x: -1, y: -1 },
          { x: 1, y: -1 },
          { x: 0, y: Math.sqrt(3) - 1 },
        ]
        let currentX = random() * 2 - 1
        let currentY = random() * 2 - 1
        for (let k = 0; k < i; k++) {
          // Iterate to get closer to the fractal
          const vertex = vertices[Math.floor(random() * 3)]
          currentX = (currentX + vertex.x) / 2 + (random() * 2 - 1) * noise * 0.01
          currentY = (currentY + vertex.y) / 2 + (random() * 2 - 1) * noise * 0.01
        }
        x = currentX
        y = currentY
        value = random() // Random value for color
        break
      case "barnsley":
        // Barnsley fern
        let fx = 0
        let fy = 0
        for (let k = 0; k < i; k++) {
          // Iterate to get closer to the fractal
          const p = random()
          let next_fx, next_fy
          if (p < 0.01) {
            // Stem
            next_fx = 0
            next_fy = 0.16 * fy
          } else if (p < 0.86) {
            // Successive smaller leaflets
            next_fx = 0.85 * fx + 0.04 * fy
            next_fy = -0.04 * fx + 0.85 * fy + 1.6
          } else if (p < 0.93) {
            // Largest left-hand leaflet
            next_fx = 0.2 * fx - 0.26 * fy
            next_fy = 0.23 * fx + 0.22 * fy + 1.6
          } else {
            // Largest right-hand leaflet
            next_fx = -0.15 * fx + 0.28 * fy
            next_fy = 0.26 * fx + 0.24 * fy + 0.44
          }
          fx = next_fx
          fy = next_fy
        }
        x = fx + (random() * 2 - 1) * noise * 0.1
        y = fy + (random() * 2 - 1) * noise * 0.1
        value = random() // Random value for color
        break
      case "newton":
        // Newton fractal (for z^3 - 1 = 0)
        let nx = random() * 4 - 2 + (random() * 2 - 1) * noise * 0.1 // -2 to 2
        let ny = random() * 4 - 2 + (random() * 2 - 1) * noise * 0.1 // -2 to 2
        let n_iter = 0
        const n_maxIter = 50
        const epsilon = 1e-6
        while (n_iter < n_maxIter) {
          const x2 = nx * nx
          const y2 = ny * ny
          const den = (x2 + y2) * (x2 + y2)
          if (den === 0) break // Avoid division by zero
          const realPart = nx * (x2 - 3 * y2) + 1
          const imagPart = ny * (3 * x2 - y2)
          const dx = (realPart * (x2 - y2) + imagPart * (2 * nx * ny)) / den
          const dy = (imagPart * (x2 - y2) - realPart * (2 * nx * ny)) / den
          nx -= dx
          ny -= dy
          if (Math.sqrt(dx * dx + dy * dy) < epsilon) break
          n_iter++
        }
        x = nx
        y = ny
        value = n_iter / n_maxIter // Value based on convergence speed
        break
      default:
        // Default to spirals if dataset is unknown
        const defaultAngle = i * 0.1 + random() * noise * 10
        const defaultRadius = i * 0.01 + random() * noise * 5
        x = defaultRadius * Math.cos(defaultAngle)
        y = defaultRadius * Math.sin(defaultAngle)
        value = Math.sin(defaultAngle / (2 * Math.PI))
        break
    }
    data.push({ x, y, value })
  }
  return data
}

/**
 * Simple Linear Congruential Generator (LCG) for reproducible random numbers.
 * @param seed - The initial seed for the generator.
 * @returns A function that generates pseudo-random numbers between 0 (inclusive) and 1 (exclusive).
 */
function createRandomNumberGenerator(seed: number) {
  let currentSeed = seed % 2147483647 // Ensure seed is within int32 range
  if (currentSeed <= 0) currentSeed += 2147483646 // Ensure positive

  return () => {
    currentSeed = (currentSeed * 16807) % 2147483647
    return (currentSeed - 1) / 2147483646
  }
}

/**
 * Generates mathematical flow art as an SVG.
 * @param settings - The settings for art generation.
 * @param onProgress - Callback for progress updates (0-100).
 * @returns A base64 encoded SVG string.
 */
export function generateFlowArt(settings: FlowArtSettings, onProgress?: (progress: number) => void): string {
  onProgress?.(10) // Start progress
  const data = generateDataset(settings.dataset, settings.seed, settings.samples, settings.noise)
  onProgress?.(70) // Data generation complete
  const svg = generateScatterPlotSVG(data, settings)
  onProgress?.(100) // SVG generation complete
  return svg
}

// Define detailed scenarios for AI prompt generation
const DETAILED_SCENARIOS = {
  none: {
    name: "Pure Mathematical",
    description: "Focuses purely on the mathematical pattern without additional thematic elements.",
    objects: [],
    backgroundColor: "white",
    ambientColor: "neutral light",
    density: 0,
  },
  "abstract-patterns": {
    name: "Abstract Patterns",
    description: "Emphasizes intricate, non-representational designs and textures.",
    objects: [
      { type: "geometric shapes", shapes: ["fractal lines", "polygons", "spirals"] },
      { type: "fluid dynamics", shapes: ["swirling currents", "smoke trails", "liquid flows"] },
      { type: "light refractions", shapes: ["prismatic effects", "lens flares", "glowing particles"] },
    ],
    backgroundColor: "gradient of deep blues and purples",
    ambientColor: "soft, diffused light",
    density: 0.6,
  },
  "organic-forms": {
    name: "Organic Forms",
    description: "Incorporates natural, biological shapes and textures.",
    objects: [
      { type: "botanical elements", shapes: ["leaf veins", "petal structures", "root systems"] },
      { type: "cellular structures", shapes: ["microscopic organisms", "cell division", "neural networks"] },
      { type: "natural textures", shapes: ["wood grain", "stone erosion", "water ripples"] },
    ],
    backgroundColor: "earthy tones, deep greens and browns",
    ambientColor: "warm, natural light",
    density: 0.7,
  },
  "futuristic-landscapes": {
    name: "Futuristic Landscapes",
    description: "Depicts advanced technological environments and alien terrains.",
    objects: [
      { type: "cybernetic structures", shapes: ["glowing circuits", "data streams", "holographic projections"] },
      { type: "alien flora", shapes: ["bioluminescent plants", "crystalline growths", "exotic fungi"] },
      { type: "architectural elements", shapes: ["sleek towers", "floating platforms", "energy conduits"] },
    ],
    backgroundColor: "dark, neon-lit cityscapes or alien skies",
    ambientColor: "electric blues and purples, neon glows",
    density: 0.8,
  },
  "celestial-bodies": {
    name: "Celestial Bodies",
    description: "Explores cosmic phenomena, stars, galaxies, and nebulae.",
    objects: [
      { type: "stellar formations", shapes: ["star clusters", "gas clouds", "cosmic dust"] },
      { type: "celestial bodies", shapes: ["distant planets", "asteroid fields", "comet trails"] },
      { type: "energy phenomena", shapes: ["plasma streams", "magnetic fields", "gravitational waves"] },
    ],
    backgroundColor: "deep space black",
    ambientColor: "cosmic purple and pink nebula glow",
    density: 0.5,
  },
  "geometric-abstractions": {
    name: "Geometric Abstractions",
    description: "Focuses on precise, mathematical shapes and their interactions.",
    objects: [
      { type: "polygonal structures", shapes: ["cubes", "spheres", "pyramids"] },
      { type: "interlocking patterns", shapes: ["tessellations", "mosaics", "kaleidoscopic designs"] },
      { type: "light and shadow", shapes: ["sharp contrasts", "defined edges", "volumetric lighting"] },
    ],
    backgroundColor: "monochromatic or high-contrast palettes",
    ambientColor: "crisp, directional light",
    density: 0.7,
  },
}

/**
 * Generates AI-enhanced art using DALL-E 3.
 * @param settings - The settings for art generation.
 * @param onProgress - Callback for progress updates (0-100).
 * @returns An object containing the image URL, filename, and potentially refined settings.
 */
export async function generateAIArt(
  settings: FlowArtSettings,
  onProgress?: (progress: number) => void,
): Promise<{ imageUrl: string; filename: string; settings: FlowArtSettings }> {
  onProgress?.(10) // Start progress

  const scenarioConfig =
    DETAILED_SCENARIOS[settings.scenario as keyof typeof DETAILED_SCENARIOS] || DETAILED_SCENARIOS.none

  const objectTypes = scenarioConfig.objects.map((obj) => `${obj.type} (${obj.shapes.join(", ")})`).join(", ")

  const prompt = `
    Create a vivid, abstract, and highly detailed image generation prompt for DALL-E 3.
    The artwork should visually represent a generative art piece inspired by a '${settings.dataset}' mathematical pattern,
    rendered with a '${settings.colorScheme}' color scheme.

    ### Scenario Integration: ${scenarioConfig.name}
    Blend the mathematical ${settings.dataset} patterns with immersive ${scenarioConfig.name.toLowerCase()} elements:
    - **Objects**: Incorporate ${objectTypes || "abstract shapes"} shaped and positioned according to the mathematical data points.
    - **Environment**: Use ${scenarioConfig.backgroundColor} as base with ${scenarioConfig.ambientColor} ambient lighting.
    - **Density**: Apply ${Math.round(scenarioConfig.density * 100)}% object placement density.
    - **Creative Fusion**: Transform data points into scenario objects while maintaining mathematical structure.
    - **Atmospheric Details**: Add environmental effects like ${
      settings.scenario === "abstract-patterns"
        ? "dappled sunlight, mist, magical sparkles"
        : settings.scenario === "organic-forms"
          ? "water currents, bioluminescence, flowing movements"
          : settings.scenario === "futuristic-landscapes"
            ? "neon reflections, holographic effects, digital glitches"
            : settings.scenario === "celestial-bodies"
              ? "cosmic dust, stellar radiation, gravitational lensing"
              : settings.scenario === "geometric-abstractions"
                ? "sharp contrasts, defined edges, volumetric lighting"
                : "subtle atmospheric effects"
    }.

    Focus on artistic qualities like light, texture, and depth, making it visually striking and unique.
    The style should be a fusion of digital art and abstract expressionism.
    Ensure the composition is balanced and visually engaging.
    Seed: ${settings.seed}, Samples: ${settings.samples}, Noise: ${settings.noise}.
    Output a single, high-quality image.
  `

  console.log("Sending prompt to DALL-E 3:", prompt)
  onProgress?.(30) // Prompt generated

  try {
    const response = await fetch("/api/generate-ai-art", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dataset: settings.dataset,
        seed: settings.seed,
        colorScheme: settings.colorScheme,
        numSamples: settings.samples,
        noise: settings.noise,
        scenario: settings.scenario,
        prompt: prompt, // Pass the generated prompt to the API route
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(errorData.error || "Failed to generate AI image.")
    }

    const data = await response.json()
    onProgress?.(90) // Image received

    const imageUrl = data.image
    const filename = data.filename || `ai-flowsketch-${settings.dataset}-${Date.now()}.png`
    const returnedSettings = data.settings || settings // Use settings returned by API if available

    onProgress?.(100) // Complete
    return { imageUrl, filename, settings: returnedSettings }
  } catch (error) {
    console.error("Error in generateAIArt:", error)
    onProgress?.(0) // Reset progress on error
    throw error // Re-throw to be caught by the component
  }
}
