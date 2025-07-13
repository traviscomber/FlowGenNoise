import { PlotUtils } from "./plot-utils"

export interface FlowArtSettings {
  dataset: string
  scenario: string
  colorScheme: string
  seed: number
  samples: number
  noise: number
  generationMode: "svg" | "ai"
  upscale: boolean
}

/**
 * Generates mathematical flow art as an SVG.
 * @param settings - The generation settings.
 * @param onProgress - Callback for progress updates (0-100).
 * @returns A data URL for the generated SVG image.
 */
export function generateFlowArt(settings: FlowArtSettings, onProgress?: (progress: number) => void): string {
  onProgress?.(10)

  // Simulate data generation based on dataset
  let data: { x: number; y: number }[] = []
  const numPoints = settings.samples

  // Simple pseudo-random number generator for deterministic results based on seed
  const mulberry32 = (a: number) => {
    return () => {
      let t = (a += 0x6d2b79f5)
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t = (t ^ (t >>> 7)) + (t >>> 3)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }

  const random = mulberry32(settings.seed)

  const generateGaussianBlobs = (count: number, noise: number) => {
    const blobs = []
    for (let i = 0; i < 3; i++) {
      const centerX = random() * 2 - 1
      const centerY = random() * 2 - 1
      for (let j = 0; j < count / 3; j++) {
        const angle = random() * Math.PI * 2
        const radius = random() * 0.5 + noise
        blobs.push({
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
        })
      }
    }
    return blobs
  }

  const generateSpirals = (count: number, noise: number) => {
    const spirals = []
    for (let i = 0; i < count; i++) {
      const angle = i * 0.1 + random() * noise * 10
      const radius = i * 0.001 + random() * noise
      spirals.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      })
    }
    return spirals
  }

  const generateMoons = (count: number, noise: number) => {
    const moons = []
    for (let i = 0; i < count / 2; i++) {
      moons.push({
        x: Math.cos(i * 0.1) + random() * noise,
        y: Math.sin(i * 0.1) + random() * noise,
      })
    }
    for (let i = 0; i < count / 2; i++) {
      moons.push({
        x: Math.cos(i * 0.1) + 1 + random() * noise,
        y: Math.sin(i * 0.1) + random() * noise,
      })
    }
    return moons
  }

  const generateCheckerboard = (count: number, noise: number) => {
    const checkerboard = []
    const gridSize = Math.sqrt(count)
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        checkerboard.push({
          x: i / gridSize + (random() - 0.5) * noise,
          y: j / gridSize + (random() - 0.5) * noise,
        })
      }
    }
    return checkerboard
  }

  const generateGrid = (count: number, noise: number) => {
    const grid = []
    const numRowsCols = Math.floor(Math.sqrt(count))
    for (let i = 0; i < numRowsCols; i++) {
      for (let j = 0; j < numRowsCols; j++) {
        grid.push({
          x: (i / (numRowsCols - 1)) * 2 - 1 + (random() - 0.5) * noise,
          y: (j / (numRowsCols - 1)) * 2 - 1 + (random() - 0.5) * noise,
        })
      }
    }
    return grid
  }

  const generateNeuralConnections = (count: number, noise: number) => {
    const nodes = []
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: random() * 2 - 1 + (random() - 0.5) * noise,
        y: random() * 2 - 1 + (random() - 0.5) * noise,
      })
    }
    return nodes
  }

  switch (settings.dataset) {
    case "gaussian":
      data = generateGaussianBlobs(numPoints, settings.noise)
      break
    case "spirals":
      data = generateSpirals(numPoints, settings.noise)
      break
    case "moons":
      data = generateMoons(numPoints, settings.noise)
      break
    case "checkerboard":
      data = generateCheckerboard(numPoints, settings.noise)
      break
    case "grid":
      data = generateGrid(numPoints, settings.noise)
      break
    case "neural":
      data = generateNeuralConnections(numPoints, settings.noise)
      break
    case "mandelbrot":
      // Simplified Mandelbrot set points (not actual fractal generation)
      for (let i = 0; i < numPoints; i++) {
        const cx = random() * 3.5 - 2.5 // Real part range
        const cy = random() * 2.5 - 1.25 // Imaginary part range
        data.push({ x: cx + (random() - 0.5) * settings.noise, y: cy + (random() - 0.5) * settings.noise })
      }
      break
    case "julia":
      // Simplified Julia set points
      for (let i = 0; i < numPoints; i++) {
        const zx = random() * 4 - 2
        const zy = random() * 4 - 2
        data.push({ x: zx + (random() - 0.5) * settings.noise, y: zy + (random() - 0.5) * settings.noise })
      }
      break
    case "sierpinski":
      // Simplified Sierpinski triangle points
      let x = 0,
        y = 0
      for (let i = 0; i < numPoints; i++) {
        const r = random()
        if (r < 1 / 3) {
          x /= 2
          y /= 2
        } else if (r < 2 / 3) {
          x = (x + 1) / 2
          y /= 2
        } else {
          x = (x + 0.5) / 2
          y = (y + Math.sqrt(3) / 2) / 2
        }
        data.push({ x: x + (random() - 0.5) * settings.noise, y: y + (random() - 0.5) * settings.noise })
      }
      break
    case "barnsley":
      // Simplified Barnsley fern points
      let fx = 0,
        fy = 0
      for (let i = 0; i < numPoints; i++) {
        const r = random()
        let newFx, newFy
        if (r < 0.01) {
          // Stem
          newFx = 0
          newFy = 0.16 * fy
        } else if (r < 0.86) {
          // Successively smaller leaflets
          newFx = 0.85 * fx + 0.04 * fy
          newFy = -0.04 * fx + 0.85 * fy + 1.6
        } else if (r < 0.93) {
          // Largest left-hand leaflet
          newFx = 0.2 * fx - 0.26 * fy
          newFy = 0.23 * fx + 0.22 * fy + 1.6
        } else {
          // Largest right-hand leaflet
          newFx = -0.15 * fx + 0.28 * fy
          newFy = 0.26 * fx + 0.24 * fy + 0.44
        }
        fx = newFx
        fy = newFy
        data.push({ x: fx + (random() - 0.5) * settings.noise, y: fy + (random() - 0.5) * settings.noise })
      }
      break
    case "newton":
      // Simplified Newton fractal points
      for (let i = 0; i < numPoints; i++) {
        const zx = random() * 4 - 2
        const zy = random() * 4 - 2
        data.push({ x: zx + (random() - 0.5) * settings.noise, y: zy + (random() - 0.5) * settings.noise })
      }
      break
    default:
      // Default to random points if dataset is unknown
      for (let i = 0; i < numPoints; i++) {
        data.push({
          x: random() * 2 - 1 + (random() - 0.5) * settings.noise,
          y: random() * 2 - 1 + (random() - 0.5) * settings.noise,
        })
      }
      break
  }

  onProgress?.(50)

  const svg = PlotUtils.createSVGPlot(data, settings.colorScheme, 800, 600)

  onProgress?.(90)

  const blob = new Blob([svg], { type: "image/svg+xml" })
  const url = URL.createObjectURL(blob)

  onProgress?.(100)
  return url
}

/**
 * Generates AI-enhanced art by calling an external API.
 * @param settings - The generation settings.
 * @param onProgress - Callback for progress updates (0-100).
 * @returns A promise that resolves to an object containing the image URL, filename, and potentially updated settings.
 */
export async function generateAIArt(
  settings: FlowArtSettings,
  onProgress?: (progress: number) => void,
): Promise<{ imageUrl: string; filename: string; settings: FlowArtSettings }> {
  onProgress?.(10)

  const response = await fetch("/api/generate-ai-art", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      dataset: settings.dataset,
      seed: settings.seed,
      colorScheme: settings.colorScheme,
      numSamples: settings.samples,
      noise: settings.noise,
      scenario: settings.scenario,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to generate AI art")
  }

  onProgress?.(70)

  const result = await response.json()

  onProgress?.(100)

  return {
    imageUrl: result.image,
    filename: result.filename,
    settings: result.settings, // Use settings returned by API, which might include actual seed used by AI model
  }
}
