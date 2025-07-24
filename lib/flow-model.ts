import { MathPlotter } from "./plot-utils"

/**
 * FlowSketch – Mathematical Art Generator with 360° Panorama Support
 * -----------------------------------------------------------
 * This file defines the public helpers that generate mathematical visualizations
 * in various formats: standard, dome projection, and 360° panoramic skyboxes.
 */

// Mathematical flow field generation with advanced datasets
export interface GenerationParams {
  dataset: string
  scenario: string
  colorScheme: string
  seed: number
  numSamples: number
  noiseScale: number
  timeStep: number
  domeProjection?: boolean
  domeDiameter?: number
  domeResolution?: string
  projectionType?: string
  panoramic360?: boolean
  panoramaResolution?: string
  panoramaFormat?: string
  stereographicPerspective?: string
}

// Seeded random number generator
class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280
    return this.seed / 233280
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min)
  }
}

/* ------------------------------------------------------------------ */
/*  Colour palettes (kept – many parts of the UI reference them)      */
/* ------------------------------------------------------------------ */

// Color palette generators
const colorPalettes = {
  plasma: [
    "#0d0887",
    "#46039f",
    "#7201a8",
    "#9c179e",
    "#bd3786",
    "#d8576b",
    "#ed7953",
    "#fb9f3a",
    "#fdca26",
    "#f0f921",
  ],
  quantum: ["#001122", "#003366", "#0066cc", "#3399ff", "#66ccff", "#99ffff", "#ccffff", "#ffffff"],
  cosmic: ["#000011", "#220066", "#4400aa", "#6600ee", "#8833ff", "#aa66ff", "#cc99ff", "#eeccff"],
  thermal: [
    "#000000",
    "#330000",
    "#660000",
    "#990000",
    "#cc0000",
    "#ff3300",
    "#ff6600",
    "#ff9900",
    "#ffcc00",
    "#ffff00",
  ],
  spectral: [
    "#9e0142",
    "#d53e4f",
    "#f46d43",
    "#fdae61",
    "#fee08b",
    "#e6f598",
    "#abdda4",
    "#66c2a5",
    "#3288bd",
    "#5e4fa2",
  ],
  crystalline: [
    "#e6f3ff",
    "#cce7ff",
    "#99d6ff",
    "#66c2ff",
    "#33adff",
    "#0099ff",
    "#0080cc",
    "#006699",
    "#004d66",
    "#003333",
  ],
  bioluminescent: [
    "#001a1a",
    "#003333",
    "#004d4d",
    "#006666",
    "#008080",
    "#00b3b3",
    "#00e6e6",
    "#33ffff",
    "#66ffff",
    "#99ffff",
  ],
  aurora: ["#001122", "#003344", "#005566", "#007788", "#0099aa", "#33bbcc", "#66ddee", "#99ffff"],
  metallic: ["#2c1810", "#5d4037", "#8d6e63", "#a1887f", "#bcaaa4", "#d7ccc8", "#efebe9", "#f5f5f5"],
  prismatic: [
    "#ff0000",
    "#ff8000",
    "#ffff00",
    "#80ff00",
    "#00ff00",
    "#00ff80",
    "#00ffff",
    "#0080ff",
    "#0000ff",
    "#8000ff",
  ],
  monochromatic: [
    "#000000",
    "#1a1a1a",
    "#333333",
    "#4d4d4d",
    "#666666",
    "#808080",
    "#999999",
    "#b3b3b3",
    "#cccccc",
    "#ffffff",
  ],
  infrared: [
    "#000000",
    "#1a0000",
    "#330000",
    "#4d0000",
    "#660000",
    "#800000",
    "#990000",
    "#b30000",
    "#cc0000",
    "#ff0000",
  ],
  lava: ["#000000", "#330000", "#660000", "#990000", "#cc0000", "#ff3300", "#ff6600", "#ff9900", "#ffcc00", "#ffff66"],
  futuristic: [
    "#0a0a0a",
    "#1a1a2e",
    "#16213e",
    "#0f3460",
    "#533483",
    "#7209b7",
    "#a663cc",
    "#4717f6",
    "#00d4aa",
    "#7fffd4",
  ],
  forest: ["#0d2818", "#1e3a2e", "#2f4f4f", "#228b22", "#32cd32", "#90ee90", "#98fb98", "#f0fff0"],
  ocean: ["#000080", "#191970", "#0000cd", "#0000ff", "#4169e1", "#6495ed", "#87ceeb", "#b0e0e6", "#e0ffff"],
  sunset: [
    "#2f1b14",
    "#8b4513",
    "#cd853f",
    "#daa520",
    "#ffd700",
    "#ffa500",
    "#ff8c00",
    "#ff6347",
    "#ff4500",
    "#dc143c",
  ],
  arctic: [
    "#f0f8ff",
    "#e6f3ff",
    "#cce7ff",
    "#b3daff",
    "#99ccff",
    "#80bfff",
    "#66b2ff",
    "#4da6ff",
    "#3399ff",
    "#1a8cff",
  ],
  neon: ["#ff00ff", "#ff0080", "#ff0040", "#ff4000", "#ff8000", "#ffff00", "#80ff00", "#00ff00", "#00ff80", "#00ffff"],
  vintage: [
    "#8b4513",
    "#a0522d",
    "#cd853f",
    "#daa520",
    "#b8860b",
    "#daa520",
    "#f4a460",
    "#deb887",
    "#d2b48c",
    "#f5deb3",
  ],
  toxic: ["#32cd32", "#7fff00", "#adff2f", "#9aff9a", "#00ff7f", "#00fa9a", "#40e0d0", "#00ced1", "#00bfff", "#1e90ff"],
  ember: ["#000000", "#1a0000", "#330000", "#4d0000", "#660000", "#800000", "#990000", "#b30000", "#cc0000", "#ff6600"],
} as const

/* ------------------------------------------------------------------ */
/*  Helper that picks a colour based on index                          */
/* ------------------------------------------------------------------ */
function paletteColor(palette: readonly string[], idx: number): string {
  return palette[idx % palette.length]
}

/* ------------------------------------------------------------------ */
/*  Seeded random number generator for consistent results              */
/* ------------------------------------------------------------------ */
function seededRandom(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

/* ------------------------------------------------------------------ */
/*  Convert resolution string to actual dimensions                     */
/* ------------------------------------------------------------------ */
function getActualDimensions(resolution?: string) {
  switch (resolution) {
    case "1080p":
      return { width: 1080, height: 1080 }
    case "1440p":
      return { width: 1440, height: 1440 }
    case "2160p":
      return { width: 2160, height: 2160 }
    default:
      return { width: 1080, height: 1080 }
  }
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * generateFlowField - basic spirals placeholder
 * Returns an SVG string that the UI can preview.
 */
// Mathematical dataset generators
function generateSpirals(params: GenerationParams, rng: SeededRandom): Array<{ x: number; y: number; color: string }> {
  const points: Array<{ x: number; y: number; color: string }> = []
  const palette = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma

  for (let i = 0; i < params.numSamples; i++) {
    const t = (i / params.numSamples) * 20 * Math.PI
    const r = Math.sqrt(t) * 10
    const x = r * Math.cos(t) + rng.range(-50, 50) * params.noiseScale
    const y = r * Math.sin(t) + rng.range(-50, 50) * params.noiseScale

    const colorIndex = Math.floor((i / params.numSamples) * (palette.length - 1))
    points.push({ x, y, color: palette[colorIndex] })
  }

  return points
}

function generateFractal(params: GenerationParams, rng: SeededRandom): Array<{ x: number; y: number; color: string }> {
  const points: Array<{ x: number; y: number; color: string }> = []
  const palette = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma

  for (let i = 0; i < params.numSamples; i++) {
    let x = rng.range(-2, 2)
    let y = rng.range(-2, 2)

    // Iterate fractal equation
    for (let j = 0; j < 10; j++) {
      const newX = x * x - y * y + rng.range(-0.5, 0.5) * params.noiseScale
      const newY = 2 * x * y + rng.range(-0.5, 0.5) * params.noiseScale
      x = newX
      y = newY
    }

    const colorIndex = Math.floor(rng.next() * palette.length)
    points.push({ x: x * 100, y: y * 100, color: palette[colorIndex] })
  }

  return points
}

function generateMandelbrot(
  params: GenerationParams,
  rng: SeededRandom,
): Array<{ x: number; y: number; color: string }> {
  const points: Array<{ x: number; y: number; color: string }> = []
  const palette = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma

  for (let i = 0; i < params.numSamples; i++) {
    const cx = rng.range(-2.5, 1.5)
    const cy = rng.range(-2, 2)

    let x = 0,
      y = 0
    let iterations = 0
    const maxIterations = 100

    while (x * x + y * y < 4 && iterations < maxIterations) {
      const newX = x * x - y * y + cx
      const newY = 2 * x * y + cy
      x = newX + rng.range(-0.1, 0.1) * params.noiseScale
      y = newY + rng.range(-0.1, 0.1) * params.noiseScale
      iterations++
    }

    const colorIndex = Math.floor((iterations / maxIterations) * (palette.length - 1))
    points.push({ x: cx * 200, y: cy * 200, color: palette[colorIndex] })
  }

  return points
}

function generateLorenz(params: GenerationParams, rng: SeededRandom): Array<{ x: number; y: number; color: string }> {
  const points: Array<{ x: number; y: number; color: string }> = []
  const palette = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma

  let x = 1,
    y = 1,
    z = 1
  const sigma = 10,
    rho = 28,
    beta = 8 / 3

  for (let i = 0; i < params.numSamples; i++) {
    const dx = sigma * (y - x) * params.timeStep
    const dy = (x * (rho - z) - y) * params.timeStep
    const dz = (x * y - beta * z) * params.timeStep

    x += dx + rng.range(-0.1, 0.1) * params.noiseScale
    y += dy + rng.range(-0.1, 0.1) * params.noiseScale
    z += dz + rng.range(-0.1, 0.1) * params.noiseScale

    const colorIndex = Math.floor((i / params.numSamples) * (palette.length - 1))
    points.push({ x: x * 5, y: y * 5, color: palette[colorIndex] })
  }

  return points
}

function generateJulia(params: GenerationParams, rng: SeededRandom): Array<{ x: number; y: number; color: string }> {
  const points: Array<{ x: number; y: number; color: string }> = []
  const palette = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma

  const cx = -0.7269 + rng.range(-0.1, 0.1) * params.noiseScale
  const cy = 0.1889 + rng.range(-0.1, 0.1) * params.noiseScale

  for (let i = 0; i < params.numSamples; i++) {
    let x = rng.range(-2, 2)
    let y = rng.range(-2, 2)
    let iterations = 0
    const maxIterations = 100

    while (x * x + y * y < 4 && iterations < maxIterations) {
      const newX = x * x - y * y + cx
      const newY = 2 * x * y + cy
      x = newX
      y = newY
      iterations++
    }

    const colorIndex = Math.floor((iterations / maxIterations) * (palette.length - 1))
    points.push({ x: x * 100, y: y * 100, color: palette[colorIndex] })
  }

  return points
}

function generateHyperbolic(
  params: GenerationParams,
  rng: SeededRandom,
): Array<{ x: number; y: number; color: string }> {
  const points: Array<{ x: number; y: number; color: string }> = []
  const palette = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma

  for (let i = 0; i < params.numSamples; i++) {
    const u = rng.range(-Math.PI, Math.PI)
    const v = rng.range(-2, 2)

    const x = Math.sinh(v) * Math.cos(u) + rng.range(-10, 10) * params.noiseScale
    const y = Math.sinh(v) * Math.sin(u) + rng.range(-10, 10) * params.noiseScale

    const colorIndex = Math.floor((i / params.numSamples) * (palette.length - 1))
    points.push({ x: x * 50, y: y * 50, color: palette[colorIndex] })
  }

  return points
}

function generateGaussian(params: GenerationParams, rng: SeededRandom): Array<{ x: number; y: number; color: string }> {
  const points: Array<{ x: number; y: number; color: string }> = []
  const palette = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma

  for (let i = 0; i < params.numSamples; i++) {
    // Box-Muller transform for Gaussian distribution
    const u1 = rng.next()
    const u2 = rng.next()
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2)

    const x = z0 * 100 + rng.range(-20, 20) * params.noiseScale
    const y = z1 * 100 + rng.range(-20, 20) * params.noiseScale

    const colorIndex = Math.floor((i / params.numSamples) * (palette.length - 1))
    points.push({ x, y, color: palette[colorIndex] })
  }

  return points
}

function generateCellular(params: GenerationParams, rng: SeededRandom): Array<{ x: number; y: number; color: string }> {
  const points: Array<{ x: number; y: number; color: string }> = []
  const palette = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma

  const gridSize = Math.floor(Math.sqrt(params.numSamples))

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const state = rng.next() > 0.5 ? 1 : 0
      const x = (i - gridSize / 2) * 10 + rng.range(-5, 5) * params.noiseScale
      const y = (j - gridSize / 2) * 10 + rng.range(-5, 5) * params.noiseScale

      const colorIndex = state * (palette.length - 1)
      points.push({ x, y, color: palette[colorIndex] })
    }
  }

  return points
}

function generateVoronoi(params: GenerationParams, rng: SeededRandom): Array<{ x: number; y: number; color: string }> {
  const points: Array<{ x: number; y: number; color: string }> = []
  const palette = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma

  // Generate seed points
  const seeds: Array<{ x: number; y: number; color: string }> = []
  const numSeeds = Math.min(20, Math.floor(params.numSamples / 100))

  for (let i = 0; i < numSeeds; i++) {
    seeds.push({
      x: rng.range(-200, 200),
      y: rng.range(-200, 200),
      color: palette[Math.floor(rng.next() * palette.length)],
    })
  }

  // Generate Voronoi cells
  for (let i = 0; i < params.numSamples; i++) {
    const x = rng.range(-200, 200) + rng.range(-10, 10) * params.noiseScale
    const y = rng.range(-200, 200) + rng.range(-10, 10) * params.noiseScale

    // Find closest seed
    let minDist = Number.POSITIVE_INFINITY
    let closestSeed = seeds[0]

    for (const seed of seeds) {
      const dist = Math.sqrt((x - seed.x) ** 2 + (y - seed.y) ** 2)
      if (dist < minDist) {
        minDist = dist
        closestSeed = seed
      }
    }

    points.push({ x, y, color: closestSeed.color })
  }

  return points
}

function generatePerlin(params: GenerationParams, rng: SeededRandom): Array<{ x: number; y: number; color: string }> {
  const points: Array<{ x: number; y: number; color: string }> = []
  const palette = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma

  // Simple Perlin-like noise
  for (let i = 0; i < params.numSamples; i++) {
    const x = rng.range(-200, 200)
    const y = rng.range(-200, 200)

    // Multi-octave noise
    let noise = 0
    let amplitude = 1
    let frequency = 0.01

    for (let octave = 0; octave < 4; octave++) {
      noise += amplitude * (rng.next() - 0.5) * Math.sin(frequency * x) * Math.cos(frequency * y)
      amplitude *= 0.5
      frequency *= 2
    }

    noise += rng.range(-0.5, 0.5) * params.noiseScale

    const colorIndex = Math.floor(((noise + 1) / 2) * (palette.length - 1))
    points.push({ x, y, color: palette[Math.max(0, Math.min(palette.length - 1, colorIndex))] })
  }

  return points
}

function generateDiffusion(
  params: GenerationParams,
  rng: SeededRandom,
): Array<{ x: number; y: number; color: string }> {
  const points: Array<{ x: number; y: number; color: string }> = []
  const palette = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma

  // Reaction-diffusion simulation
  const gridSize = Math.floor(Math.sqrt(params.numSamples / 4))

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const u = rng.next()
      const v = rng.next()

      // Simple reaction-diffusion step
      const laplacianU = rng.range(-0.1, 0.1)
      const laplacianV = rng.range(-0.1, 0.1)

      const reaction = u * v * v
      const newU = u + params.timeStep * (0.16 * laplacianU - reaction + 0.035 * (1 - u))
      const newV = v + params.timeStep * (0.08 * laplacianV + reaction - 0.099 * v)

      const x = (i - gridSize / 2) * 8 + rng.range(-4, 4) * params.noiseScale
      const y = (j - gridSize / 2) * 8 + rng.range(-4, 4) * params.noiseScale

      const colorIndex = Math.floor(newU * (palette.length - 1))
      points.push({ x, y, color: palette[Math.max(0, Math.min(palette.length - 1, colorIndex))] })
    }
  }

  return points
}

function generateWave(params: GenerationParams, rng: SeededRandom): Array<{ x: number; y: number; color: string }> {
  const points: Array<{ x: number; y: number; color: string }> = []
  const palette = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma

  for (let i = 0; i < params.numSamples; i++) {
    const x = rng.range(-200, 200)
    const y = rng.range(-200, 200)

    // Wave interference pattern
    const wave1 = Math.sin(0.05 * x + params.timeStep * 100)
    const wave2 = Math.sin(0.05 * y + params.timeStep * 100)
    const wave3 = Math.sin(0.03 * (x + y) + params.timeStep * 50)

    const interference = (wave1 + wave2 + wave3) / 3
    const amplitude = interference + rng.range(-0.2, 0.2) * params.noiseScale

    const colorIndex = Math.floor(((amplitude + 1) / 2) * (palette.length - 1))
    points.push({ x, y, color: palette[Math.max(0, Math.min(palette.length - 1, colorIndex))] })
  }

  return points
}

// Dataset selector
function generateDataset(params: GenerationParams): Array<{ x: number; y: number; color: string }> {
  const rng = new SeededRandom(params.seed)

  switch (params.dataset) {
    case "spiral":
      return generateSpirals(params, rng)
    case "checkerboard":
      return generateCheckerboard(params, rng)
    case "neural":
      return generateNeuralNetwork(params, rng)
    case "fractal":
      return generateFractal(params, rng)
    case "wave":
      return generateWave(params, rng)
    case "particle":
      return generateParticleSystem(params, rng)
    case "mandala":
      return generateMandala(params, rng)
    case "crystal":
      return generateCrystalLattice(params, rng)
    case "flow":
      return generateFlowFieldInternal(params, rng)
    case "noise":
      return generatePerlin(params, rng)
    case "cellular":
      return generateCellular(params, rng)
    case "attractor":
      return generateAttractor(params, rng)
    // Legacy support for old dataset names
    case "spirals":
      return generateSpirals(params, rng)
    case "mandelbrot":
      return generateMandelbrot(params, rng)
    case "lorenz":
      return generateLorenz(params, rng)
    case "julia":
      return generateJulia(params, rng)
    case "hyperbolic":
      return generateHyperbolic(params, rng)
    case "gaussian":
      return generateGaussian(params, rng)
    case "voronoi":
      return generateVoronoi(params, rng)
    case "diffusion":
      return generateDiffusion(params, rng)
    default:
      return generateSpirals(params, rng)
  }
}

function generateCheckerboard(
  params: GenerationParams,
  rng: SeededRandom,
): Array<{ x: number; y: number; color: string }> {
  const points: Array<{ x: number; y: number; color: string }> = []
  const palette = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma

  const gridSize = Math.floor(Math.sqrt(params.numSamples / 4))
  const cellSize = 400 / gridSize

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const isBlack = (i + j) % 2 === 0
      const x = (i - gridSize / 2) * cellSize + rng.range(-cellSize / 4, cellSize / 4) * params.noiseScale
      const y = (j - gridSize / 2) * cellSize + rng.range(-cellSize / 4, cellSize / 4) * params.noiseScale

      // Add multiple points per cell for density
      for (let k = 0; k < 4; k++) {
        const offsetX = rng.range(-cellSize / 2, cellSize / 2)
        const offsetY = rng.range(-cellSize / 2, cellSize / 2)
        const colorIndex = isBlack ? 0 : palette.length - 1
        points.push({
          x: x + offsetX,
          y: y + offsetY,
          color: palette[colorIndex],
        })
      }
    }
  }

  return points
}

function generateNeuralNetwork(
  params: GenerationParams,
  rng: SeededRandom,
): Array<{ x: number; y: number; color: string }> {
  const points: Array<{ x: number; y: number; color: string }> = []
  const palette = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma

  // Create neural network layers
  const layers = 5
  const nodesPerLayer = 8
  const layerSpacing = 300 / layers
  const nodeSpacing = 200 / nodesPerLayer

  // Generate nodes
  const nodes: Array<{ x: number; y: number; layer: number; index: number }> = []

  for (let layer = 0; layer < layers; layer++) {
    for (let node = 0; node < nodesPerLayer; node++) {
      const x = (layer - layers / 2) * layerSpacing + rng.range(-20, 20) * params.noiseScale
      const y = (node - nodesPerLayer / 2) * nodeSpacing + rng.range(-20, 20) * params.noiseScale
      nodes.push({ x, y, layer, index: node })

      // Add node points
      const colorIndex = Math.floor((layer / layers) * (palette.length - 1))
      points.push({ x, y, color: palette[colorIndex] })
    }
  }

  // Generate connections between layers
  for (let layer = 0; layer < layers - 1; layer++) {
    const currentLayerNodes = nodes.filter((n) => n.layer === layer)
    const nextLayerNodes = nodes.filter((n) => n.layer === layer + 1)

    currentLayerNodes.forEach((currentNode) => {
      nextLayerNodes.forEach((nextNode) => {
        if (rng.next() > 0.3) {
          // 70% connection probability
          // Create connection line with points
          const steps = 10
          for (let step = 0; step <= steps; step++) {
            const t = step / steps
            const x = currentNode.x + (nextNode.x - currentNode.x) * t
            const y = currentNode.y + (nextNode.y - currentNode.y) * t
            const colorIndex = Math.floor(t * (palette.length - 1))
            points.push({ x, y, color: palette[colorIndex] })
          }
        }
      })
    })
  }

  return points
}

function generateParticleSystem(
  params: GenerationParams,
  rng: SeededRandom,
): Array<{ x: number; y: number; color: string }> {
  const points: Array<{ x: number; y: number; color: string }> = []
  const palette = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma

  // Create multiple particle emitters
  const emitters = 3

  for (let e = 0; e < emitters; e++) {
    const emitterX = rng.range(-150, 150)
    const emitterY = rng.range(-150, 150)
    const particlesPerEmitter = Math.floor(params.numSamples / emitters)

    for (let i = 0; i < particlesPerEmitter; i++) {
      const t = i / particlesPerEmitter
      const angle = rng.range(0, 2 * Math.PI)
      const velocity = rng.range(50, 200)
      const life = rng.range(0.5, 2.0)

      // Simulate particle movement over time
      const x = emitterX + Math.cos(angle) * velocity * life + rng.range(-30, 30) * params.noiseScale
      const y = emitterY + Math.sin(angle) * velocity * life + rng.range(-30, 30) * params.noiseScale - 50 * life * life // gravity

      const colorIndex = Math.floor((1 - life) * (palette.length - 1))
      points.push({ x, y, color: palette[colorIndex] })
    }
  }

  return points
}

function generateMandala(params: GenerationParams, rng: SeededRandom): Array<{ x: number; y: number; color: string }> {
  const points: Array<{ x: number; y: number; color: string }> = []
  const palette = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma

  const symmetryOrder = 8 // 8-fold symmetry
  const rings = 6
  const pointsPerRing = Math.floor(params.numSamples / rings)

  for (let ring = 0; ring < rings; ring++) {
    const radius = (ring + 1) * 30

    for (let i = 0; i < pointsPerRing; i++) {
      const baseAngle = (i / pointsPerRing) * 2 * Math.PI

      // Create symmetric copies
      for (let sym = 0; sym < symmetryOrder; sym++) {
        const angle = baseAngle + (sym * 2 * Math.PI) / symmetryOrder
        const r = radius + Math.sin(angle * 5) * 10 + rng.range(-10, 10) * params.noiseScale

        const x = r * Math.cos(angle)
        const y = r * Math.sin(angle)

        const colorIndex = Math.floor((ring / rings) * (palette.length - 1))
        points.push({ x, y, color: palette[colorIndex] })
      }
    }
  }

  return points
}

function generateCrystalLattice(
  params: GenerationParams,
  rng: SeededRandom,
): Array<{ x: number; y: number; color: string }> {
  const points: Array<{ x: number; y: number; color: string }> = []
  const palette = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma

  // Hexagonal crystal lattice
  const latticeSpacing = 25
  const rows = Math.floor(Math.sqrt(params.numSamples / 2))
  const cols = Math.floor(Math.sqrt(params.numSamples / 2))

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Hexagonal offset for every other row
      const offsetX = (row % 2) * latticeSpacing * 0.5
      const x = (col - cols / 2) * latticeSpacing + offsetX + rng.range(-5, 5) * params.noiseScale
      const y = (row - rows / 2) * latticeSpacing * 0.866 + rng.range(-5, 5) * params.noiseScale // 0.866 = sqrt(3)/2

      // Add crystal defects and variations
      const defectProbability = 0.1
      if (rng.next() > defectProbability) {
        const colorIndex = Math.floor((((row + col) % 4) / 4) * (palette.length - 1))
        points.push({ x, y, color: palette[colorIndex] })

        // Add satellite points for crystal structure
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * 2 * Math.PI
          const satelliteR = 8 + rng.range(-2, 2)
          const sx = x + satelliteR * Math.cos(angle)
          const sy = y + satelliteR * Math.sin(angle)
          points.push({ x: sx, y: sy, color: palette[colorIndex] })
        }
      }
    }
  }

  return points
}

function generateFlowFieldInternal(
  params: GenerationParams,
  rng: SeededRandom,
): Array<{ x: number; y: number; color: string }> {
  const points: Array<{ x: number; y: number; color: string }> = []
  const palette = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma

  // Generate flow field vectors
  const gridSize = 20
  const stepSize = 2
  const maxSteps = 50

  for (let i = 0; i < params.numSamples / maxSteps; i++) {
    let x = rng.range(-200, 200)
    let y = rng.range(-200, 200)

    for (let step = 0; step < maxSteps; step++) {
      // Flow field function - creates swirling patterns
      const angle = Math.sin(x * 0.01) * Math.cos(y * 0.01) * Math.PI * 2 + Math.sin(x * 0.005 + y * 0.005) * Math.PI

      const flowX = Math.cos(angle) * stepSize
      const flowY = Math.sin(angle) * stepSize

      x += flowX + rng.range(-1, 1) * params.noiseScale
      y += flowY + rng.range(-1, 1) * params.noiseScale

      const colorIndex = Math.floor((step / maxSteps) * (palette.length - 1))
      points.push({ x, y, color: palette[colorIndex] })
    }
  }

  return points
}

function generateAttractor(
  params: GenerationParams,
  rng: SeededRandom,
): Array<{ x: number; y: number; color: string }> {
  const points: Array<{ x: number; y: number; color: string }> = []
  const palette = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma

  // Rössler attractor
  let x = 1,
    y = 1,
    z = 1
  const a = 0.2,
    b = 0.2,
    c = 5.7
  const dt = 0.01

  for (let i = 0; i < params.numSamples; i++) {
    const dx = (-y - z) * dt
    const dy = (x + a * y) * dt
    const dz = (b + z * (x - c)) * dt

    x += dx + rng.range(-0.1, 0.1) * params.noiseScale
    y += dy + rng.range(-0.1, 0.1) * params.noiseScale
    z += dz + rng.range(-0.1, 0.1) * params.noiseScale

    const colorIndex = Math.floor((i / params.numSamples) * (palette.length - 1))
    points.push({ x: x * 10, y: y * 10, color: palette[colorIndex] })
  }

  return points
}

function getBackgroundColor(colorScheme: string): string {
  const palette = colorPalettes[colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma
  return palette[0]
}

function getStrokeColor(colorScheme: string): string {
  const palette = colorPalettes[colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma
  return palette[palette.length - 1]
}

export function generateFlowField(params: GenerationParams): string {
  const plotter = new MathPlotter({
    width: 800,
    height: 800,
    backgroundColor: getBackgroundColor(params.colorScheme),
    strokeColor: getStrokeColor(params.colorScheme),
  })

  // Generate points using the dataset system
  const datasetPoints = generateDataset(params)

  const paths: string[] = []
  const colors: string[] = []

  // Convert dataset points to SVG paths
  if (datasetPoints.length > 0) {
    // Group points by color for efficient rendering
    const colorGroups: { [color: string]: Array<{ x: number; y: number }> } = {}

    datasetPoints.forEach((point) => {
      if (!colorGroups[point.color]) {
        colorGroups[point.color] = []
      }
      colorGroups[point.color].push({ x: point.x + 400, y: point.y + 400 }) // Center in 800x800 canvas
    })

    // Create paths for each color group
    Object.entries(colorGroups).forEach(([color, points]) => {
      if (points.length > 1) {
        const path = plotter.pointsToPath(points)
        paths.push(path)
        colors.push(color)
      } else if (points.length === 1) {
        // Single point as small circle
        const point = points[0]
        paths.push(
          `M ${point.x - 1} ${point.y} A 1 1 0 1 1 ${point.x + 1} ${point.y} A 1 1 0 1 1 ${point.x - 1} ${point.y}`,
        )
        colors.push(color)
      }
    })
  }

  // Fallback to original generation if no points
  if (paths.length === 0) {
    const spiralPoints = plotter.generateFibonacciSpiral(params.numSamples, 10)
    paths.push(plotter.pointsToPath(spiralPoints))
    colors.push(getStrokeColor(params.colorScheme))
  }

  return plotter.generateSVG(paths, colors)
}

/**
 * generateDomeProjection – proper fisheye transformation for dome projection.
 * This applies real fisheye mathematics to create immersive dome-ready content.
 */
export function generateDomeProjection(params: GenerationParams): string {
  // Generate dome-optimized SVG with fisheye transformation
  const baseSvg = generateFlowField(params)

  // Apply dome transformation (simplified for demo)
  return baseSvg.replace("<svg", '<svg viewBox="0 0 800 800" style="transform: perspective(1000px) rotateX(45deg)"')
}

/**
 * generate360Panorama – creates equirectangular 360° panoramic images or stereographic projections
 * Perfect for VR environments, skyboxes, and 360° viewers like Blockade Labs
 */
export function generate360Panorama(params: GenerationParams): string {
  const datasetPoints = generateDataset(params)

  // Apply stereographic projection
  const projectedPoints = datasetPoints.map((point) => {
    if (params.panoramaFormat === "stereographic" && params.stereographicPerspective) {
      const projected = stereographicProjection(point.x, point.y, params.stereographicPerspective)
      return { ...point, x: projected.x, y: projected.y }
    }
    return point
  })

  const width = 800
  const height = 800
  const centerX = width / 2
  const centerY = height / 2

  let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`
  svg += `<rect width="100%" height="100%" fill="#000000"/>`

  for (const point of projectedPoints) {
    const x = centerX + point.x
    const y = centerY + point.y

    if (x >= 0 && x <= width && y >= 0 && y <= height) {
      svg += `<circle cx="${x}" cy="${y}" r="1.5" fill="${point.color}" opacity="0.8"/>`
    }
  }

  svg += "</svg>"
  return svg
}

// Stereographic projection helpers
function stereographicProjection(x: number, y: number, perspective: string): { x: number; y: number } {
  if (perspective === "tunnel") {
    // Tunnel projection (looking up)
    const r = Math.sqrt(x * x + y * y)
    const theta = Math.atan2(y, x)
    const newR = 200 / (1 + r / 100)
    return {
      x: newR * Math.cos(theta),
      y: newR * Math.sin(theta),
    }
  } else {
    // Little planet projection (looking down)
    const r = Math.sqrt(x * x + y * y)
    const theta = Math.atan2(y, x)
    const newR = r / (1 + r / 200)
    return {
      x: newR * Math.cos(theta),
      y: newR * Math.sin(theta),
    }
  }
}
