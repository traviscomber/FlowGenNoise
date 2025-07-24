import { Vector3 } from "three"

export interface FlowParameters {
  dataset: string // e.g., "spirals", "fractals", "quantum"
  scenario: string // e.g., "pure", "cosmic", "neural"
  colorScheme: string // e.g., "plasma", "quantum", "thermal"
  seed: number
  noise: number
  samples: number
  stereographic: boolean // Whether to apply stereographic projection
}

export interface GalleryItem {
  id: string
  image_url: string
  prompt: string
  parameters: FlowParameters
  created_at: string
  ai_enhanced_prompt?: string
}

export type FlowField = (p: Vector3) => Vector3

export const DATASETS = [
  {
    name: "Lorenz Attractor",
    description: "A chaotic system known for its butterfly effect.",
    params: {
      sigma: 10,
      rho: 28,
      beta: 8 / 3,
    },
    flow: (p: Vector3, params: any) => {
      const { sigma, rho, beta } = params
      const dx = sigma * (p.y - p.x)
      const dy = p.x * (rho - p.z) - p.y
      const dz = p.x * p.y - beta * p.z
      return new Vector3(dx, dy, dz)
    },
  },
  {
    name: "Rossler Attractor",
    description: "A simpler chaotic system, often used as an example.",
    params: {
      a: 0.2,
      b: 0.2,
      c: 5.7,
    },
    flow: (p: Vector3, params: any) => {
      const { a, b, c } = params
      const dx = -p.y - p.z
      const dy = p.x + a * p.y
      const dz = b + p.z * (p.x - c)
      return new Vector3(dx, dy, dz)
    },
  },
  {
    name: "Duffing Oscillator",
    description: "A non-linear oscillator exhibiting chaotic behavior.",
    params: {
      delta: 0.2,
      gamma: 0.3,
      omega: 1.0,
      alpha: 1.0,
      beta: -1.0,
    },
    flow: (p: Vector3, params: any) => {
      const { delta, gamma, omega, alpha, beta } = params
      const x = p.x
      const y = p.y
      const dx = y
      const dy = -delta * y - alpha * x - beta * x * x * x + gamma * Math.cos(omega * p.z) // p.z is time
      return new Vector3(dx, dy, 1) // 1 for time progression
    },
  },
  {
    name: "Aizawa Attractor",
    description: "A complex chaotic system with interesting visual properties.",
    params: {
      a: 0.95,
      b: 0.7,
      c: 0.6,
      d: 3.5,
      e: 0.25,
      f: 0.1,
    },
    flow: (p: Vector3, params: any) => {
      const { a, b, c, d, e, f } = params
      const dx = (p.z - b) * p.x - d * p.y
      const dy = d * p.x + (p.z - b) * p.y
      const dz = c + a * p.z - (p.x * p.x + p.y * p.y) * (1 + e * p.z) + f * p.z * p.x * p.x * p.x
      return new Vector3(dx, dy, dz)
    },
  },
  {
    name: "Thomas Attractor",
    description: "A simple 3D chaotic system.",
    params: {
      b: 0.2,
    },
    flow: (p: Vector3, params: any) => {
      const { b } = params
      const dx = -b * p.x + p.y - p.z
      const dy = -b * p.y + p.z - p.x
      const dz = -b * p.z + p.x - p.y
      return new Vector3(dx, dy, dz)
    },
  },
]

export const COLOR_SCHEMES = [
  { name: "Plasma", colors: ["#000000", "#0000FF", "#FF00FF", "#FFFF00", "#FFFFFF"] },
  { name: "Viridis", colors: ["#440154", "#414487", "#2A788E", "#22A884", "#7AD151", "#FDE725"] },
  { name: "Inferno", colors: ["#000004", "#2C1A5B", "#781C6D", "#BB3754", "#ED6925", "#FCF754"] },
  { name: "Magma", colors: ["#000004", "#3B0F70", "#8C2981", "#DE4968", "#FE9F6D", "#FCF754"] },
  { name: "Cividis", colors: ["#00204D", "#004F73", "#00876C", "#74B75F", "#D0EE11"] },
  { name: "Twilight", colors: ["#000000", "#400040", "#800080", "#C000C0", "#FF00FF"] },
  { name: "Rainbow", colors: ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#9400D3"] },
  { name: "Grayscale", colors: ["#000000", "#FFFFFF"] },
  { name: "Ocean", colors: ["#000080", "#00FFFF", "#ADD8E6", "#87CEEB", "#4682B4"] },
  { name: "Forest", colors: ["#006400", "#228B22", "#32CD32", "#90EE90", "#ADFF2F"] },
]

export const SCENARIOS = [
  {
    name: "Standard",
    description: "Default flow field visualization.",
    initialPosition: new Vector3(0.1, 0.1, 0.1),
    noiseStrength: 0.0,
    stereographic: false,
  },
  {
    name: "Turbulent",
    description: "Adds noise for a more chaotic, turbulent look.",
    initialPosition: new Vector3(0.1, 0.1, 0.1),
    noiseStrength: 0.5,
    stereographic: false,
  },
  {
    name: "Stereographic Projection",
    description: "Projects the 3D flow onto a 2D plane.",
    initialPosition: new Vector3(0.1, 0.1, 0.1),
    noiseStrength: 0.0,
    stereographic: true,
  },
  {
    name: "Warped Space",
    description: "Combines noise and stereographic projection.",
    initialPosition: new Vector3(0.1, 0.1, 0.1),
    noiseStrength: 0.3,
    stereographic: true,
  },
  {
    name: "Zoomed In",
    description: "Starts closer to the origin for detailed views.",
    initialPosition: new Vector3(0.001, 0.001, 0.001),
    noiseStrength: 0.0,
    stereographic: false,
  },
]

export const DEFAULT_FLOW_PARAMETERS: FlowParameters = {
  dataset: "spirals",
  scenario: "pure",
  colorScheme: "plasma",
  seed: Math.floor(Math.random() * 100000),
  noise: 0.01,
  samples: 50000,
  stereographic: false,
}

// Utility function to get a pseudo-random number generator
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Perlin noise implementation (simplified for 2D)
class PerlinNoise {
  private p: number[]
  private rand: () => number

  constructor(seed: number) {
    this.rand = mulberry32(seed)
    this.p = Array.from({ length: 512 }, (_, i) => i)
    this.shuffle(this.p)
    this.p = this.p.concat(this.p) // Duplicate for convenience
  }

  private shuffle(array: number[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(this.rand() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
  }

  private fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }

  private lerp(a: number, b: number, t: number) {
    return a + t * (b - a)
  }

  private grad(hash: number, x: number, y: number) {
    const h = hash & 15
    const u = h < 8 ? x : y
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
  }

  noise(x: number, y: number) {
    const X = Math.floor(x) & 255
    const Y = Math.floor(y) & 255

    x -= Math.floor(x)
    y -= Math.floor(y)

    const u = this.fade(x)
    const v = this.fade(y)

    const A = this.p[X] + Y
    const B = this.p[X + 1] + Y

    return this.lerp(
      this.lerp(this.grad(this.p[A], x, y), this.grad(this.p[B], x - 1, y), u),
      this.lerp(this.grad(this.p[A + 1], x, y - 1), this.grad(this.p[B + 1], x - 1, y - 1), u),
      v,
    )
  }
}

// Vector field functions
type VectorField = (x: number, y: number, noise: PerlinNoise, noiseScale: number) => { dx: number; dy: number }

const vectorFields: { [key: string]: VectorField } = {
  // Pure mathematical fields
  spirals: (x, y, noise, noiseScale) => {
    const angle = Math.atan2(y, x)
    const radius = Math.sqrt(x * x + y * y)
    const n = noise.noise(x * noiseScale, y * noiseScale) * 0.5
    const dx = -y + x * n
    const dy = x + y * n
    return { dx, dy }
  },
  fractals: (x, y, noise, noiseScale) => {
    const n = noise.noise(x * noiseScale, y * noiseScale)
    const dx = Math.sin(x * 3 + n * 5) + Math.cos(y * 2)
    const dy = Math.cos(y * 3 + n * 5) + Math.sin(x * 2)
    return { dx, dy }
  },
  quantum: (x, y, noise, noiseScale) => {
    const n = noise.noise(x * y * 5 + noiseScale * 2)
    const dx = Math.sin(x * y * 5 + n * 2)
    const dy = Math.cos(x * y * 5 + n * 2)
    return { dx, dy }
  },
  topology: (x, y, noise, noiseScale) => {
    const n = noise.noise(x * noiseScale, y * noiseScale)
    const dx = Math.sin(x * 2 + n) * Math.cos(y * 3)
    const dy = Math.cos(y * 2 + n) * Math.sin(x * 3)
    return { dx, dy }
  },
  checkerboard: (x, y, noise, noiseScale) => {
    const n = noise.noise(x * noiseScale, y * noiseScale)
    const dx = Math.sin(x * 10) * Math.cos(y * 10 + n)
    const dy = Math.cos(y * 10) * Math.sin(x * 10 + n)
    return { dx, dy }
  },
  moons: (x, y, noise, noiseScale) => {
    const n = noise.noise(x * noiseScale, y * noiseScale)
    const r = Math.sqrt(x * x + y * y)
    const theta = Math.atan2(y, x)
    const dx = -y / (r * r + n)
    const dy = x / (r * r + n)
    return { dx, dy }
  },
  gaussian: (x, y, noise, noiseScale) => {
    const n = noise.noise(x * noiseScale, y * noiseScale)
    const dx = -x * Math.exp(-(x * x + y * y) / 2) + n * 0.1
    const dy = -y * Math.exp(-(x * x + y * y) / 2) + n * 0.1
    return { dx, dy }
  },
  grid: (x, y, noise, noiseScale) => {
    const n = noise.noise(x * noiseScale, y * noiseScale)
    const dx = Math.sin(x * 5 + n) * 0.5
    const dy = Math.cos(y * 5 + n) * 0.5
    return { dx, dy }
  },
  circles: (x, y, noise, noiseScale) => {
    const n = noise.noise(x * noiseScale, y * noiseScale)
    const r = Math.sqrt(x * x + y * y)
    const dx = -y / (r + n * 0.5)
    const dy = x / (r + n * 0.5)
    return { dx, dy }
  },
  blobs: (x, y, noise, noiseScale) => {
    const n = noise.noise(x * noiseScale, y * noiseScale)
    const dx = Math.sin(x * 2 + y * 3 + n)
    const dy = Math.cos(x * 3 - y * 2 + n)
    return { dx, dy }
  },
  strings: (x, y, noise, noiseScale) => {
    const n = noise.noise(x * noiseScale, y * noiseScale)
    const dx = Math.sin(x * 4 + n) + Math.cos(y * 4)
    const dy = Math.cos(y * 4 + n) + Math.sin(x * 4)
    return { dx, dy }
  },
}

// Color palette functions
type ColorPalette = (t: number) => string

const colorPalettes: { [key: string]: ColorPalette } = {
  plasma: (t) => {
    const r = Math.floor(Math.sin(t * Math.PI) * 127 + 128)
    const g = Math.floor(Math.sin(t * Math.PI * 2) * 127 + 128)
    const b = Math.floor(Math.sin(t * Math.PI * 3) * 127 + 128)
    return `rgb(${r},${g},${b})`
  },
  quantum: (t) => {
    const r = Math.floor(Math.sin(t * Math.PI * 0.5) * 255)
    const g = Math.floor(Math.cos(t * Math.PI * 0.5) * 255)
    const b = Math.floor(Math.sin(t * Math.PI) * 255)
    return `rgb(${r},${g},${b})`
  },
  cosmic: (t) => {
    const r = Math.floor(t * 50)
    const g = Math.floor(t * 10)
    const b = Math.floor(t * 200)
    return `rgb(${r},${g},${b})`
  },
  thermal: (t) => {
    const r = Math.floor(t * 255)
    const g = Math.floor(t * 100)
    const b = Math.floor(t * 50)
    return `rgb(${r},${g},${b})`
  },
  spectral: (t) => {
    const hue = t * 360
    return `hsl(${hue}, 100%, 50%)`
  },
  crystalline: (t) => {
    const r = Math.floor(t * 100 + 155)
    const g = Math.floor(t * 200 + 55)
    const b = Math.floor(t * 255)
    return `rgb(${r},${g},${b})`
  },
  bioluminescent: (t) => {
    const r = Math.floor(t * 50)
    const g = Math.floor(t * 200 + 55)
    const b = Math.floor(t * 255)
    return `rgb(${r},${g},${b})`
  },
  aurora: (t) => {
    const r = Math.floor(Math.sin(t * Math.PI * 0.7) * 100 + 50)
    const g = Math.floor(Math.sin(t * Math.PI * 1.2) * 150 + 100)
    const b = Math.floor(Math.sin(t * Math.PI * 1.5) * 200 + 50)
    return `rgb(${r},${g},${b})`
  },
  metallic: (t) => {
    const gray = Math.floor(t * 200 + 55)
    return `rgb(${gray},${gray},${gray})`
  },
  prismatic: (t) => {
    const r = Math.floor(Math.sin(t * Math.PI * 2 + 0) * 127 + 128)
    const g = Math.floor(Math.sin(t * Math.PI * 2 + 2) * 127 + 128)
    const b = Math.floor(Math.sin(t * Math.PI * 2 + 4) * 127 + 128)
    return `rgb(${r},${g},${b})`
  },
  monochromatic: (t) => {
    const gray = Math.floor(t * 255)
    return `rgb(${gray},${gray},${gray})`
  },
  infrared: (t) => {
    const r = Math.floor(t * 255)
    const g = Math.floor((1 - t) * 255)
    const b = 0
    return `rgb(${r},${g},${b})`
  },
  lava: (t) => {
    const r = Math.floor(255 * Math.min(1, t * 2))
    const g = Math.floor(255 * Math.max(0, t * 2 - 1))
    const b = 0
    return `rgb(${r},${g},${b})`
  },
  futuristic: (t) => {
    const r = Math.floor(t * 50 + 50)
    const g = Math.floor(t * 150 + 100)
    const b = Math.floor(t * 200 + 50)
    return `rgb(${r},${g},${b})`
  },
  forest: (t) => {
    const r = Math.floor(t * 50)
    const g = Math.floor(t * 150 + 100)
    const b = Math.floor(t * 50)
    return `rgb(${r},${g},${b})`
  },
  ocean: (t) => {
    const r = Math.floor(t * 50)
    const g = Math.floor(t * 100)
    const b = Math.floor(t * 200 + 50)
    return `rgb(${r},${g},${b})`
  },
  sunset: (t) => {
    const r = Math.floor(t * 255)
    const g = Math.floor(t * 150)
    const b = Math.floor(t * 50)
    return `rgb(${r},${g},${b})`
  },
  arctic: (t) => {
    const r = Math.floor(t * 50 + 200)
    const g = Math.floor(t * 100 + 150)
    const b = Math.floor(t * 200 + 50)
    return `rgb(${r},${g},${b})`
  },
  neon: (t) => {
    const r = Math.floor(Math.sin(t * Math.PI * 2 + 0) * 127 + 128)
    const g = Math.floor(Math.sin(t * Math.PI * 2 + 2) * 127 + 128)
    const b = Math.floor(Math.sin(t * Math.PI * 2 + 4) * 127 + 128)
    return `rgb(${r},${g},${b})`
  },
  vintage: (t) => {
    const r = Math.floor(t * 100 + 100)
    const g = Math.floor(t * 80 + 80)
    const b = Math.floor(t * 60 + 60)
    return `rgb(${r},${g},${b})`
  },
  toxic: (t) => {
    const r = Math.floor(t * 50)
    const g = Math.floor(t * 200 + 50)
    const b = Math.floor(t * 50)
    return `rgb(${r},${g},${b})`
  },
  ember: (t) => {
    const r = Math.floor(t * 255)
    const g = Math.floor(t * 100)
    const b = Math.floor(t * 20)
    return `rgb(${r},${g},${b})`
  },
}

// Main generation function
export function generateFlowArtData(params: FlowParameters) {
  const { dataset, scenario, colorScheme, seed, noise, samples, stereographic } = params

  const rand = mulberry32(seed)
  const perlin = new PerlinNoise(seed)

  const field = vectorFields[dataset]
  const palette = colorPalettes[colorScheme]

  if (!field || !palette) {
    throw new Error("Invalid dataset or color scheme selected.")
  }

  const points = []
  for (let i = 0; i < samples; i++) {
    let x = (rand() * 4 - 2) * 1.5 // Start points within a larger range
    let y = (rand() * 4 - 2) * 1.5

    // Simulate particle movement through the field
    for (let j = 0; j < 100; j++) {
      // More steps for smoother trails
      const { dx, dy } = field(x, y, perlin, noise)
      const len = Math.sqrt(dx * dx + dy * dy)
      if (len > 0) {
        x += (dx / len) * 0.01 // Smaller step size
        y += (dy / len) * 0.01
      }

      // Apply stereographic projection if enabled
      if (stereographic) {
        const r2 = x * x + y * y
        const z = (r2 - 1) / (r2 + 1)
        const scale = 1 / (1 - z) // Projection scale factor
        x *= scale
        y *= scale
      }

      // Add point to array if within bounds
      if (x > -2 && x < 2 && y > -2 && y < 2) {
        const color = palette(j / 100) // Color based on age/progress
        points.push({ x, y, color })
      }
    }
  }
  return points
}

/**
 * A simple seeded pseudo-random number generator (PRNG).
 * Not cryptographically secure, but sufficient for reproducible dataset generation.
 */
function createPrng(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

export interface GenerationParams {
  dataset: string
  scenario: string
  colorScheme: string
  seed: number
  numSamples: number
  noiseScale: number
  timeStep: number
  enableStereographic?: boolean
  stereographicPerspective?: string
}

export interface UpscaleParams extends GenerationParams {
  scaleFactor: number
  highResolution: boolean
  extraDetail: boolean
}

// Pure 4-color palettes for visual themes
const colorPalettesOld = {
  plasma: ["#0D001A", "#7209B7", "#F72585", "#FFBE0B"],
  quantum: ["#001122", "#0066FF", "#00FFAA", "#FFD700"],
  cosmic: ["#000000", "#4B0082", "#9370DB", "#FFFFFF"],
  thermal: ["#000080", "#FF4500", "#FFD700", "#FFFFFF"],
  spectral: ["#8B00FF", "#0000FF", "#00FF00", "#FFFF00"],
  crystalline: ["#E6E6FA", "#4169E1", "#00CED1", "#FFFFFF"],
  bioluminescent: ["#000080", "#008B8B", "#00FF7F", "#ADFF2F"],
  aurora: ["#191970", "#00CED1", "#7FFF00", "#FFD700"],
  metallic: ["#B87333", "#C0C0C0", "#FFD700", "#E5E4E2"],
  prismatic: ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00"],
  monochromatic: ["#000000", "#404040", "#808080", "#FFFFFF"],
  infrared: ["#8B0000", "#FF4500", "#FF6347", "#FFA500"],
  // Keep existing palettes
  lava: ["#1A0000", "#8B0000", "#FF4500", "#FFD700"],
  futuristic: ["#001122", "#00FFFF", "#0080FF", "#FFFFFF"],
  forest: ["#0F1B0F", "#228B22", "#32CD32", "#90EE90"],
  ocean: ["#000080", "#0066CC", "#00BFFF", "#E0F6FF"],
  sunset: ["#2D1B69", "#FF6B35", "#F7931E", "#FFD23F"],
  arctic: ["#1E3A8A", "#60A5FA", "#E0F2FE", "#FFFFFF"],
  neon: ["#000000", "#FF00FF", "#00FF00", "#FFFF00"],
  vintage: ["#8B4513", "#CD853F", "#F4A460", "#FFF8DC"],
  toxic: ["#1A1A00", "#66FF00", "#CCFF00", "#FFFF99"],
  ember: ["#2D0A00", "#CC4400", "#FF8800", "#FFCC66"],
}

// Seeded random number generator for consistent results
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

  gaussian(): number {
    // Box-Muller transform for Gaussian distribution
    const u1 = this.next()
    const u2 = this.next()
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  }
}

// Generate complex mathematical datasets
export function generateDataset(name: string, seed: number, n_samples: number, noise: number): number[][] {
  const prng = createPrng(seed)
  const rng = new SeededRandom(seed)

  switch (name) {
    case "spirals":
      return generateComplexSpirals(rng, n_samples, noise)
    case "quantum":
      return generateQuantumFields(rng, n_samples, noise)
    case "strings":
      return generateStringTheory(rng, n_samples, noise)
    case "fractals":
      return generateFractalDimensions(rng, n_samples, noise)
    case "topology":
      return generateTopologicalSpaces(rng, n_samples, noise)
    case "checkerboard":
      return generateFractalCheckerboard(rng, n_samples, noise)
    case "moons":
      return generateHyperbolicMoons(rng, n_samples, noise)
    case "gaussian":
      return generateMultiModalGaussian(rng, n_samples, noise)
    case "grid":
      return generateNonLinearGrid(rng, n_samples, noise)
    case "circles":
      return generateConcentricManifolds(rng, n_samples, noise)
    case "blobs":
      return generateVoronoiBlobs(rng, n_samples, noise)
    default:
      return generateComplexSpirals(rng, n_samples, noise)
  }
}

// Complex mathematical dataset generators
function generateComplexSpirals(rng: SeededRandom, n_samples: number, noise: number): number[][] {
  const data: number[][] = []

  for (let i = 0; i < n_samples; i++) {
    const t = (i / n_samples) * 12 * Math.PI

    // Archimedean spiral with golden ratio
    const phi = (1 + Math.sqrt(5)) / 2
    const archSpiral = 0.3 * t * Math.cos(t)

    // Logarithmic spiral with Euler's number
    const logSpiral = Math.exp(0.08 * t) * Math.cos(t * Math.E) * 0.05

    // Fibonacci spiral with prime number modulation
    const fibSpiral = Math.sqrt(t) * Math.cos(t * phi + (isPrime(Math.floor(t)) ? Math.PI / 4 : 0)) * 0.2

    // Hyperbolic spiral with chaos theory
    const hypSpiral = (1 / (t + 0.1)) * Math.sin(t * 3.14159) * 0.4

    // Fermat's spiral (parabolic)
    const fermatSpiral = Math.sqrt(t) * Math.cos(2 * Math.sqrt(t)) * 0.15

    // Cornu spiral (Euler spiral) for clothoid curves
    const cornuT = t * 0.1
    const cornuX = Math.cos(cornuT * cornuT) * 0.3
    const cornuY = Math.sin(cornuT * cornuT) * 0.3

    // Dragon curve fractal influence
    const dragonScale = Math.pow(0.7, Math.floor(t / Math.PI))
    const dragonAngle = t * (1 + Math.sin(t * 0.5))
    const dragonX = dragonScale * Math.cos(dragonAngle) * 0.1
    const dragonY = dragonScale * Math.sin(dragonAngle) * 0.1

    // Combine all spirals with harmonic oscillations
    const harmonicX = Math.sin(t * 2) + Math.sin(t * 3) / 2 + Math.sin(t * 5) / 3 + Math.sin(t * 7) / 4
    const harmonicY = Math.cos(t * 2) + Math.cos(t * 3) / 2 + Math.cos(t * 5) / 3 + Math.cos(t * 7) / 4

    const x =
      archSpiral +
      logSpiral +
      fibSpiral * Math.cos(t) +
      hypSpiral +
      fermatSpiral +
      cornuX +
      dragonX +
      harmonicX * 0.05 +
      noise * rng.gaussian()
    const y =
      archSpiral * Math.sin(t) +
      logSpiral * Math.sin(t * Math.E) +
      fibSpiral * Math.sin(t * phi) +
      cornuY +
      dragonY +
      harmonicY * 0.05 +
      noise * rng.gaussian()

    data.push([x * 0.08, y * 0.08])
  }

  return data
}

function generateQuantumFields(rng: SeededRandom, n_samples: number, noise: number): number[][] {
  const data: number[][] = []

  for (let i = 0; i < n_samples; i++) {
    // Quantum wave function simulation
    const psi = (i / n_samples) * 4 * Math.PI

    // Schrödinger equation solutions for hydrogen atom
    const n = Math.floor(rng.range(1, 4)) // Principal quantum number
    const l = Math.floor(rng.range(0, n)) // Angular momentum
    const m = Math.floor(rng.range(-l, l + 1)) // Magnetic quantum number

    // Radial wave function (simplified Laguerre polynomials)
    const r = Math.abs(psi) * 0.5
    const radialPart = Math.exp(-r / n) * Math.pow(r, l) * (1 + Math.sin(r * n))

    // Angular part (spherical harmonics)
    const theta = psi
    const phi = theta * theta
    const angularPart = Math.sin(theta) * Math.cos(m * phi) * Math.pow(Math.sin(theta), Math.abs(m))

    // Quantum tunneling effect
    const barrier = Math.exp(-Math.abs(psi - Math.PI) * 2)
    const tunneling = barrier * Math.sin(psi * 10) * 0.1

    // Heisenberg uncertainty principle visualization
    const uncertainty = 1 / (1 + Math.abs(psi) * 0.5)
    const deltaX = uncertainty * rng.gaussian() * 0.1
    const deltaP = (1 / uncertainty) * rng.gaussian() * 0.1

    // Quantum entanglement correlation
    const entangled = Math.sin(psi) * Math.cos(psi + Math.PI / 2) * 0.2

    const x = radialPart * Math.cos(theta) + tunneling + deltaX + entangled + noise * rng.gaussian()
    const y = radialPart * Math.sin(theta) + angularPart * 0.3 + deltaP + noise * rng.gaussian()

    data.push([x * 0.4, y * 0.4])
  }

  return data
}

function generateStringTheory(rng: SeededRandom, n_samples: number, noise: number): number[][] {
  const data: number[][] = []

  for (let i = 0; i < n_samples; i++) {
    const t = (i / n_samples) * 8 * Math.PI

    // 11-dimensional M-theory projection to 2D
    const dimensions = []
    for (let d = 0; d < 11; d++) {
      dimensions.push(Math.sin((t * (d + 1)) / 11) * Math.cos(t * Math.sqrt(d + 1)))
    }

    // Calabi-Yau manifold compactification
    const calabiYau = dimensions.slice(6).reduce((sum, dim, idx) => sum + dim * Math.exp(-idx * 0.5), 0) * 0.1

    // String vibration modes
    const fundamentalFreq = 1
    const harmonics = []
    for (let h = 1; h <= 8; h++) {
      harmonics.push(Math.sin(t * h * fundamentalFreq) / h)
    }
    const stringVibration = harmonics.reduce((sum, h) => sum + h, 0) * 0.2

    // Brane world interactions
    const braneDistance = Math.abs(Math.sin(t * 0.3)) + 0.1
    const braneForce = (1 / (braneDistance * braneDistance)) * 0.05

    // Extra dimensional leakage
    const extraDimX = dimensions[6] * Math.cos(t * 2) + dimensions[7] * Math.sin(t * 3)
    const extraDimY = dimensions[8] * Math.cos(t * 5) + dimensions[9] * Math.sin(t * 7)

    // Supersymmetry breaking
    const susyBreaking = Math.exp(-t * 0.1) * Math.sin(t * 13) * 0.15

    const x =
      dimensions[0] + stringVibration + extraDimX * 0.3 + braneForce + calabiYau + susyBreaking + noise * rng.gaussian()
    const y =
      dimensions[1] + stringVibration * Math.sin(t) + extraDimY * 0.3 + calabiYau * Math.cos(t) + noise * rng.gaussian()

    data.push([x * 0.3, y * 0.3])
  }

  return data
}

function generateFractalDimensions(rng: SeededRandom, n_samples: number, noise: number): number[][] {
  const data: number[][] = []

  for (let i = 0; i < n_samples; i++) {
    const t = (i / n_samples) * 6 * Math.PI

    // Hausdorff dimension calculation
    const hausdorffDim = 1.5 + 0.5 * Math.sin(t * 0.2)

    // Sierpinski triangle with variable dimension
    let sierpX = 0,
      sierpY = 0
    let currentX = rng.range(-1, 1),
      currentY = rng.range(-1, 1)
    const vertices = [
      [-1, -1],
      [1, -1],
      [0, Math.sqrt(3)],
    ]

    for (let iter = 0; iter < 10; iter++) {
      const vertex = vertices[Math.floor(rng.next() * 3)]
      currentX = (currentX + vertex[0]) * 0.5
      currentY = (currentY + vertex[1]) * 0.5
      sierpX += currentX * Math.pow(0.5, iter * hausdorffDim)
      sierpY += currentY * Math.pow(0.5, iter * hausdorffDim)
    }

    // Julia set with varying parameters
    const c_real = -0.7 + 0.3 * Math.sin(t * 0.1)
    const c_imag = 0.27015 + 0.1 * Math.cos(t * 0.1)
    let z_real = rng.range(-2, 2)
    let z_imag = rng.range(-2, 2)

    let juliaIterations = 0
    const maxJuliaIter = 50

    while (z_real * z_real + z_imag * z_imag < 4 && juliaIterations < maxJuliaIter) {
      const temp = z_real * z_real - z_imag * z_imag + c_real
      z_imag = 2 * z_real * z_imag + c_imag
      z_real = temp
      juliaIterations++
    }

    const juliaValue = juliaIterations / maxJuliaIter

    // Barnsley fern with mutations
    let fernX = 0,
      fernY = 0
    for (let f = 0; f < 5; f++) {
      const r = rng.next()
      let newX, newY

      if (r < 0.01) {
        newX = 0
        newY = 0.16 * fernY
      } else if (r < 0.86) {
        newX = 0.85 * fernX + 0.04 * fernY
        newY = -0.04 * fernX + 0.85 * fernY + 1.6
      } else if (r < 0.93) {
        newX = 0.2 * fernX - 0.26 * fernY
        newY = 0.23 * fernX + 0.22 * fernY + 1.6
      } else {
        newX = -0.15 * fernX + 0.28 * fernY
        newY = 0.26 * fernX + 0.24 * fernY + 0.44
      }

      fernX = newX
      fernY = newY
    }

    // Combine all fractal elements
    const x = sierpX * 0.3 + z_real * 0.1 + fernX * 0.05 + juliaValue * Math.cos(t) * 0.2 + noise * rng.gaussian()
    const y = sierpY * 0.3 + z_imag * 0.1 + fernY * 0.05 + juliaValue * Math.sin(t) * 0.2 + noise * rng.gaussian()

    data.push([x * 0.4, y * 0.4])
  }

  return data
}

function generateTopologicalSpaces(rng: SeededRandom, n_samples: number, noise: number): number[][] {
  const data: number[][] = []

  for (let i = 0; i < n_samples; i++) {
    const t = (i / n_samples) * 4 * Math.PI

    // Klein bottle embedding in 4D, projected to 2D
    const u = t
    const v = t * 0.7
    const kleinX = (2 + Math.cos(v / 2) * Math.sin(u) - Math.sin(v / 2) * Math.sin(2 * u)) * Math.cos(v / 2)
    const kleinY = (2 + Math.cos(v / 2) * Math.sin(u) - Math.sin(v / 2) * Math.sin(2 * u)) * Math.sin(v / 2)
    const kleinZ = Math.sin(v / 2) * Math.sin(u) + Math.cos(v / 2) * Math.sin(2 * u)
    const kleinW = Math.cos(v)

    // Project 4D to 2D with perspective
    const perspective = 3 / (3 + kleinZ + kleinW * 0.5)
    const klein2DX = kleinX * perspective
    const klein2DY = kleinY * perspective

    // Möbius strip with varying width
    const mobiusU = t
    const mobiusV = rng.range(-0.5, 0.5) * (1 + 0.3 * Math.sin(t * 2))
    const mobiusX = (1 + mobiusV * Math.cos(mobiusU / 2)) * Math.cos(mobiusU)
    const mobiusY = (1 + mobiusV * Math.cos(mobiusU / 2)) * Math.sin(mobiusU)
    const mobiusZ = mobiusV * Math.sin(mobiusU / 2)

    // Torus knot (trefoil)
    const p = 3,
      q = 2 // Trefoil knot parameters
    const knotR = Math.cos(q * t) + 2
    const knotX = knotR * Math.cos(p * t)
    const knotY = knotR * Math.sin(p * t)
    const knotZ = -Math.sin(q * t)

    // Hopf fibration
    const hopfTheta = t
    const hopfPhi = t * Math.sqrt(2)
    const hopfPsi = t * Math.sqrt(3)

    const hopfX = Math.sin(hopfTheta) * Math.cos(hopfPhi)
    const hopfY = Math.sin(hopfTheta) * Math.sin(hopfPhi)
    const hopfZ = Math.cos(hopfTheta)
    const hopfW = Math.cos(hopfPsi)

    // Stereographic projection from S³ to R³, then to R²
    const stereoX = hopfX / (1 - hopfW + 0.1)
    const stereoY = hopfY / (1 - hopfW + 0.1)

    // Riemann surface (complex logarithm)
    const complex_r = Math.sqrt(t * t + 1)
    const complex_theta = Math.atan2(1, t) + 2 * Math.PI * Math.floor(t / (2 * Math.PI))
    const riemannX = Math.log(complex_r) * Math.cos(complex_theta)
    const riemannY = Math.log(complex_r) * Math.sin(complex_theta)

    // Combine topological elements
    const x = klein2DX * 0.2 + mobiusX * 0.15 + knotX * 0.1 + stereoX * 0.1 + riemannX * 0.05 + noise * rng.gaussian()
    const y = klein2DY * 0.2 + mobiusY * 0.15 + knotY * 0.1 + stereoY * 0.1 + riemannY * 0.05 + noise * rng.gaussian()

    data.push([x * 0.5, y * 0.5])
  }

  return data
}

function generateFractalCheckerboard(rng: SeededRandom, n_samples: number, noise: number): number[][] {
  const data: number[][] = []

  for (let i = 0; i < n_samples; i++) {
    let x = rng.range(-2, 2)
    let y = rng.range(-2, 2)

    // Apply fractal transformation
    for (let iter = 0; iter < 3; iter++) {
      const scale = Math.pow(0.5, iter)
      const offsetX = Math.sin(x * Math.pow(2, iter)) * scale
      const offsetY = Math.cos(y * Math.pow(2, iter)) * scale

      x += offsetX
      y += offsetY
    }

    // Mandelbrot-like iteration
    const cx = x,
      cy = y
    let zx = 0,
      zy = 0
    let iterations = 0
    const maxIter = 20

    while (zx * zx + zy * zy < 4 && iterations < maxIter) {
      const temp = zx * zx - zy * zy + cx
      zy = 2 * zx * zy + cy
      zx = temp
      iterations++
    }

    // Use iteration count to modify position
    const factor = iterations / maxIter
    x += Math.sin(factor * Math.PI) * 0.5
    y += Math.cos(factor * Math.PI) * 0.5

    data.push([x + noise * rng.gaussian(), y + noise * rng.gaussian()])
  }

  return data
}

function generateHyperbolicMoons(rng: SeededRandom, n_samples: number, noise: number): number[][] {
  const data: number[][] = []
  const samplesPerMoon = Math.floor(n_samples / 3)

  // First hyperbolic moon
  for (let i = 0; i < samplesPerMoon; i++) {
    const t = (i / samplesPerMoon) * Math.PI
    const r = 1 + 0.3 * Math.sin(3 * t)

    // Hyperbolic transformation
    const x = r * Math.cosh(0.5 * t) * Math.cos(t)
    const y = r * Math.sinh(0.5 * t) * Math.sin(t)

    data.push([x * 0.3 + noise * rng.gaussian(), y * 0.3 + noise * rng.gaussian()])
  }

  // Second moon with different curvature
  for (let i = 0; i < samplesPerMoon; i++) {
    const t = (i / samplesPerMoon) * Math.PI
    const r = 1 + 0.2 * Math.cos(5 * t)

    const x = 1.5 - r * Math.cos(t + Math.PI)
    const y = 1 - r * Math.sin(t + Math.PI) + 0.5 * Math.sin(2 * t)

    data.push([x + noise * rng.gaussian(), y + noise * rng.gaussian()])
  }

  // Third moon with elliptic curves
  for (let i = 0; i < n_samples - 2 * samplesPerMoon; i++) {
    const t = (i / (n_samples - 2 * samplesPerMoon)) * 2 * Math.PI

    // Elliptic curve: y² = x³ + ax + b
    const a = -1,
      b = 1
    const x = 2 * Math.cos(t)
    const y = Math.sqrt(Math.abs(x * x * x + a * x + b)) * Math.sign(Math.sin(t))

    data.push([x * 0.3 - 0.5 + noise * rng.gaussian(), y * 0.3 + 1.5 + noise * rng.gaussian()])
  }

  return data
}

function generateMultiModalGaussian(rng: SeededRandom, n_samples: number, noise: number): number[][] {
  const data: number[][] = []

  // Multiple Gaussian centers with different covariances
  const centers = [
    { x: -1.5, y: -1.5, sx: 0.3, sy: 0.8, angle: Math.PI / 4 },
    { x: 1.5, y: -1.5, sx: 0.8, sy: 0.3, angle: -Math.PI / 4 },
    { x: 0, y: 1.5, sx: 0.5, sy: 0.5, angle: 0 },
    { x: -0.8, y: 0.3, sx: 0.2, sy: 0.6, angle: Math.PI / 3 },
    { x: 0.8, y: 0.3, sx: 0.6, sy: 0.2, angle: -Math.PI / 3 },
  ]

  for (let i = 0; i < n_samples; i++) {
    const center = centers[Math.floor(rng.next() * centers.length)]

    // Generate correlated Gaussian samples
    const u1 = rng.gaussian()
    const u2 = rng.gaussian()

    // Apply rotation and scaling
    const cos_a = Math.cos(center.angle)
    const sin_a = Math.sin(center.angle)

    const x = center.x + (u1 * center.sx * cos_a - u2 * center.sy * sin_a)
    const y = center.y + (u1 * center.sx * sin_a + u2 * center.sy * cos_a)

    // Add Perlin-like noise
    const perlinX = Math.sin(x * 5) * Math.cos(y * 3) * 0.1
    const perlinY = Math.cos(x * 3) * Math.sin(y * 5) * 0.1

    data.push([x + perlinX + noise * rng.gaussian(), y + perlinY + noise * rng.gaussian()])
  }

  return data
}

function generateNonLinearGrid(rng: SeededRandom, n_samples: number, noise: number): number[][] {
  const data: number[][] = []
  const gridSize = Math.ceil(Math.sqrt(n_samples))

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize && data.length < n_samples; j++) {
      let x = (i / (gridSize - 1)) * 4 - 2
      let y = (j / (gridSize - 1)) * 4 - 2

      // Apply non-linear transformations
      const r = Math.sqrt(x * x + y * y)
      const theta = Math.atan2(y, x)

      // Polar distortion
      const newR = r + 0.3 * Math.sin(3 * theta) + 0.2 * Math.sin(5 * r)
      const newTheta = theta + 0.2 * Math.sin(2 * r)

      x = newR * Math.cos(newTheta)
      y = newR * Math.sin(newTheta)

      // Add wave distortion
      x += 0.3 * Math.sin(y * 2) * Math.cos(x * 1.5)
      y += 0.3 * Math.cos(x * 2) * Math.sin(y * 1.5)

      // Klein bottle transformation
      const u = x * 0.5
      const v = y * 0.5
      const kleinX = (2 + Math.cos(v)) * Math.cos(u)
      const kleinY = (2 + Math.cos(v)) * Math.sin(u)

      data.push([x * 0.7 + kleinX * 0.3 + noise * rng.gaussian(), y * 0.7 + kleinY * 0.3 + noise * rng.gaussian()])
    }
  }

  return data
}

function generateConcentricManifolds(rng: SeededRandom, n_samples: number, noise: number): number[][] {
  const data: number[][] = []

  for (let i = 0; i < n_samples; i++) {
    const layer = Math.floor(rng.next() * 5) + 1
    const t = rng.next() * 2 * Math.PI

    // Base radius with harmonic variations
    const r = layer * 0.4 + 0.2 * Math.sin(layer * t * 3) + 0.1 * Math.sin(layer * t * 7)

    // Torus embedding
    const R = 1.5 // Major radius
    const minorR = r * 0.3
    const phi = t
    const theta = (layer * Math.PI) / 3

    // Torus coordinates
    const torusX = (R + minorR * Math.cos(theta)) * Math.cos(phi)
    const torusY = (R + minorR * Math.cos(theta)) * Math.sin(phi)
    const torusZ = minorR * Math.sin(theta)

    // Project to 2D with perspective
    const perspective = 3 / (3 + torusZ)
    let x = torusX * perspective
    let y = torusY * perspective

    // Add Möbius strip transformation for some layers
    if (layer % 2 === 0) {
      const mobiusT = t / 2
      const mobiusR = 0.5 + 0.3 * Math.cos(mobiusT)
      x = mobiusR * Math.cos(t) + 0.3 * Math.cos(mobiusT) * Math.cos(t)
      y = mobiusR * Math.sin(t) + 0.3 * Math.cos(mobiusT) * Math.sin(t)
    }

    data.push([x + noise * rng.gaussian(), y + noise * rng.gaussian()])
  }

  return data
}

function generateVoronoiBlobs(rng: SeededRandom, n_samples: number, noise: number): number[][] {
  const data: number[][] = []

  // Generate Voronoi seed points
  const numSeeds = 8
  const seeds: Array<{ x: number; y: number; weight: number }> = []

  for (let i = 0; i < numSeeds; i++) {
    seeds.push({
      x: rng.range(-2, 2),
      y: rng.range(-2, 2),
      weight: rng.range(0.5, 2.0),
    })
  }

  for (let i = 0; i < n_samples; i++) {
    let x = rng.range(-2.5, 2.5)
    let y = rng.range(-2.5, 2.5)

    // Find closest seed (weighted Voronoi)
    let minDist = Number.POSITIVE_INFINITY
    let closestSeed = seeds[0]

    for (const seed of seeds) {
      const dist = Math.sqrt((x - seed.x) ** 2 + (y - seed.y) ** 2) / seed.weight
      if (dist < minDist) {
        minDist = dist
        closestSeed = seed
      }
    }

    // Apply attractor dynamics
    const attractorStrength = 0.3
    const dx = closestSeed.x - x
    const dy = closestSeed.y - y

    x += dx * attractorStrength
    y += dy * attractorStrength

    // Add turbulence based on distance to seed
    const turbulence = Math.exp(-minDist * 2)
    const turbX = turbulence * Math.sin(x * 8 + y * 6) * 0.2
    const turbY = turbulence * Math.cos(x * 6 + y * 8) * 0.2

    // Lorenz attractor influence
    const lorenzScale = 0.1
    const lorenzX = 10 * (y - x) * lorenzScale
    const lorenzY = (x * (28 - y) - y) * lorenzScale

    data.push([x + turbX + lorenzX + noise * rng.gaussian(), y + turbY + lorenzY + noise * rng.gaussian()])
  }

  return data
}

// Apply scenario transformations to dataset points with rich contextual theming
function applyScenarioTransform(
  points: number[][],
  scenario: string,
  rng: SeededRandom,
): Array<{ x: number; y: number; metadata: any }> {
  const transformedPoints: Array<{ x: number; y: number; metadata: any }> = []

  for (let i = 0; i < points.length; i++) {
    const [baseX, baseY] = points[i]
    let x = baseX
    let y = baseY
    let metadata: any = {}

    switch (scenario) {
      case "pure":
        // Pure mathematical - enhanced with sacred geometry and mathematical beauty
        metadata = {
          magnitude: Math.sqrt(baseX * baseX + baseY * baseY),
          angle: Math.atan2(baseY, baseX),
          quadrant: baseX >= 0 ? (baseY >= 0 ? 1 : 4) : baseY >= 0 ? 2 : 3,
          isPrime: isPrime(Math.floor(Math.abs(baseX * 100) + Math.abs(baseY * 100))),
          harmonicSeries:
            Math.sin(baseX * Math.PI) + Math.sin(baseY * Math.PI * 2) / 2 + Math.sin(baseX * Math.PI * 3) / 3,
          fibonacci: fibonacciSpiral(baseX, baseY),
          goldenRatio: Math.abs(baseX / baseY - 1.618) < 0.1,
          fractalDepth: Math.floor(Math.log(Math.abs(baseX * baseY) + 1) * 3),
        }
        break

      case "forest": {
        // Enchanted living forest with magical creatures and organic life
        const forestDepth = Math.abs(baseY) + 1
        const canopyDensity = Math.sin(baseX * 2) * Math.cos(baseY * 1.5) + 0.5

        // Tree growth patterns with L-system fractals
        const treeAge = Math.abs(baseX * baseY) * 100 + 50
        const branchAngle = Math.atan2(baseY, baseX) + rng.range(-0.4, 0.4)
        const rootNetwork = Math.sin(baseX * 5) * Math.cos(baseY * 3) * 0.15

        // Fairy presence - magical sparkles around certain points
        const fairyMagic = Math.exp(-((baseX - Math.sin(i * 0.1)) ** 2 + (baseY - Math.cos(i * 0.1)) ** 2) * 3)
        const fairyTrail = fairyMagic > 0.3 ? Math.sin(i * 0.5) * 0.1 : 0

        // Insect swarms and fireflies
        const bugSwarm = Math.sin(baseX * 8 + i * 0.1) * Math.cos(baseY * 6 + i * 0.1) * 0.08
        const firefly = rng.next() < 0.05 && Math.sin(i * 0.3) > 0.7

        // Mushroom rings and magical circles
        const mushroomRing = Math.abs(Math.sqrt(baseX ** 2 + baseY ** 2) - 1.2) < 0.1
        const magicCircle = mushroomRing ? Math.sin(Math.atan2(baseY, baseX) * 8) * 0.1 : 0

        // Vine growth and organic curves
        const vineGrowth = Math.sin(baseX * 3 + baseY * 2) * Math.exp(-Math.abs(baseY) * 0.5) * 0.12

        x = baseX + rootNetwork + fairyTrail + bugSwarm + magicCircle + vineGrowth
        y = baseY + forestDepth * 0.1 + fairyTrail * Math.sin(i * 0.2) + vineGrowth * 0.8

        metadata = {
          isTree: canopyDensity > 0.6,
          treeAge: treeAge,
          canopyDensity: canopyDensity,
          hasFairy: fairyMagic > 0.3,
          fairyType: Math.floor(rng.next() * 4), // Different fairy types
          bugType: Math.floor(rng.next() * 6), // Beetles, butterflies, fireflies, etc.
          isFirefly: firefly,
          mushroomRing: mushroomRing,
          vineThickness: Math.abs(vineGrowth) * 10,
          magicalEnergy: fairyMagic + (mushroomRing ? 0.5 : 0),
          seasonalPhase: Math.sin(baseX + baseY + Math.PI / 4), // Spring/Summer/Fall/Winter
          forestSpirit: rng.next() < 0.02, // Rare forest spirits
        }
        break
      }

      case "cosmic": {
        // Deep space with galaxies, nebulae, stars, and cosmic phenomena
        const distance = Math.sqrt(baseX * baseX + baseY * baseY)
        const angle = Math.atan2(baseY, baseX)

        // Galaxy spiral arms with dark matter
        const spiralArm = angle + distance * 0.3 + Math.sin(distance * 2) * 0.3
        const darkMatterHalo = Math.exp(-distance * 0.5) * Math.sin(spiralArm * 3) * 0.1

        // Nebula clouds with gas and dust
        const nebulaDensity = Math.abs(Math.sin(baseX * 0.8) * Math.cos(baseY * 0.6)) * 0.2
        const gasCloud = Math.sin(baseX * 1.2 + baseY * 0.8) * nebulaDensity
        const cosmicDust = rng.gaussian() * nebulaDensity * 0.05

        // Stellar formation regions
        const stellarNursery = nebulaDensity > 0.15 && rng.next() < 0.1
        const protostar = stellarNursery && Math.sin(distance * 10) > 0.8

        // Black hole gravitational lensing
        const blackHolePos = { x: 0.8, y: -0.3 }
        const bhDistance = Math.sqrt((baseX - blackHolePos.x) ** 2 + (baseY - blackHolePos.y) ** 2)
        const gravitationalLens = bhDistance < 0.5 ? (1 / (bhDistance + 0.1)) * 0.03 : 0
        const eventHorizon = bhDistance < 0.1

        // Pulsar beams and neutron stars
        const pulsar = rng.next() < 0.005
        const pulsarBeam = pulsar ? Math.sin(i * 0.1) * Math.cos(angle * 2) * 0.15 : 0

        // Cosmic rays and solar wind
        const cosmicRay = Math.sin(baseX * 20 + i * 0.05) * Math.cos(baseY * 15) * 0.02
        const solarWind = Math.exp(-distance * 2) * Math.sin(angle * 4 + i * 0.1) * 0.05

        x = baseX + darkMatterHalo + gasCloud + gravitationalLens * Math.cos(angle) + pulsarBeam + cosmicRay
        y = baseY + gasCloud * 0.8 + gravitationalLens * Math.sin(angle) + solarWind + cosmicDust

        metadata = {
          isStar: rng.next() < 0.08,
          isBlackHole: eventHorizon,
          isPulsar: pulsar,
          isProtostar: protostar,
          stellarClass: Math.floor(rng.next() * 7), // O, B, A, F, G, K, M
          nebulaDensity: nebulaDensity,
          darkMatterDensity: Math.abs(darkMatterHalo) * 10,
          redshift: distance * 0.1,
          cosmicAge: distance * 13.8, // Billion years
          hasExoplanets: rng.next() < 0.3,
          galaxyType: Math.floor(rng.next() * 4), // Spiral, elliptical, irregular, dwarf
          quasarActivity: distance > 2 && rng.next() < 0.01,
        }
        break
      }

      case "ocean": {
        // Deep ocean with sea creatures, coral reefs, and marine life
        const depth = Math.max(0, -baseY * 1000 + 500) // 0-1000m depth
        const currentStrength = Math.sin(baseX * 1.5) * Math.cos(baseY * 0.8) * 0.2

        // Ocean currents and tidal forces
        const tidalForce = Math.sin(baseX * 0.3 + i * 0.01) * 0.1
        const gulfStream = Math.exp(-Math.abs(baseY - 0.2) * 5) * Math.sin(baseX * 2) * 0.15

        // Marine life ecosystems
        const coralReef = depth < 200 && Math.sin(baseX * 4) * Math.cos(baseY * 3) > 0.5
        const kelp = depth < 100 && Math.sin(baseX * 6 + baseY * 4) > 0.6
        const plankton = Math.sin(baseX * 15 + baseY * 12 + i * 0.1) * Math.exp(-depth * 0.001) * 0.03

        // Sea creatures
        const whale = rng.next() < 0.001 && depth > 200
        const dolphinPod = rng.next() < 0.005 && depth < 300
        const shark = rng.next() < 0.003 && depth > 50
        const jellyfish = rng.next() < 0.02 && Math.sin(i * 0.2) > 0.5
        const schoolOfFish = rng.next() < 0.1 && depth < 500

        // Bioluminescence
        const bioluminescence = depth > 200 ? Math.sin(i * 0.3) * Math.exp(-depth * 0.0005) * 0.1 : 0
        const deepSeaCreature = depth > 800 && rng.next() < 0.01

        // Underwater vents and thermal activity
        const thermalVent = depth > 600 && rng.next() < 0.002
        const mineralDeposit = thermalVent ? Math.sin(baseX * 10) * 0.05 : 0

        // Wave action and turbulence
        const waveAction = depth < 50 ? Math.sin(baseX * 3 + i * 0.05) * Math.cos(baseY * 2) * 0.1 : 0
        const turbulence = Math.sin(baseX * 8 + baseY * 6) * currentStrength * 0.5

        x = baseX + currentStrength + gulfStream + plankton + bioluminescence + waveAction + turbulence
        y = baseY + tidalForce + kelp * 0.1 + mineralDeposit + turbulence * 0.8

        metadata = {
          depth: depth,
          temperature: 25 - depth * 0.02, // Temperature drops with depth
          salinity: 35 + Math.sin(baseX) * 2,
          pressure: 1 + depth * 0.1, // Atmospheric pressure
          hasCoralReef: coralReef,
          hasKelp: kelp,
          creatureType: whale
            ? "whale"
            : dolphinPod
              ? "dolphin"
              : shark
                ? "shark"
                : jellyfish
                  ? "jellyfish"
                  : schoolOfFish
                    ? "fish"
                    : deepSeaCreature
                      ? "deep_sea"
                      : "none",
          bioluminescent: bioluminescence > 0.05,
          thermalVent: thermalVent,
          currentSpeed: Math.abs(currentStrength) * 10, // km/h
          waveHeight: Math.abs(waveAction) * 5, // meters
          oxygenLevel: Math.max(0, 8 - depth * 0.005),
          marineLifeDensity: (coralReef ? 0.8 : 0) + (kelp ? 0.6 : 0) + Math.abs(plankton) * 10,
        }
        break
      }

      case "neural": {
        // Brain networks with neurons, synapses, and neural activity
        const neuralActivity = Math.tanh(baseX * 1.2 + baseY * 0.8)
        const synapticWeight = Math.sin(baseX * 2.5) * Math.cos(baseY * 2.5)

        // Neural pathways and dendrites
        const dendriticBranching = Math.sin(baseX * 8) * Math.cos(baseY * 6) * 0.08
        const axonLength = Math.abs(neuralActivity) * 0.15
        const myelinSheath = Math.abs(synapticWeight) > 0.5 ? 0.05 : 0

        // Neurotransmitter release
        const dopamine = Math.sin(baseX * 3 + i * 0.1) > 0.7 ? 0.1 : 0
        const serotonin = Math.cos(baseY * 4 + i * 0.15) > 0.8 ? 0.08 : 0
        const acetylcholine = Math.sin(baseX * baseY * 10) > 0.9 ? 0.06 : 0

        // Brain waves and electrical activity
        const alphaWave = Math.sin(i * 0.08) * 0.03 // 8-12 Hz
        const betaWave = Math.sin(i * 0.15) * 0.02 // 13-30 Hz
        const gammaWave = Math.sin(i * 0.4) * 0.01 // 30-100 Hz

        // Neural plasticity and learning
        const synapticPlasticity = Math.exp(-Math.abs(neuralActivity) * 2) * 0.05
        const memoryFormation = Math.abs(synapticWeight) > 0.7 && rng.next() < 0.1

        // Glial cells and support structures
        const astrocyte = rng.next() < 0.15
        const microglia = rng.next() < 0.08
        const oligodendrocyte = rng.next() < 0.05

        x = baseX + dendriticBranching + axonLength * Math.cos(Math.atan2(baseY, baseX)) + dopamine + alphaWave
        y = baseY + dendriticBranching * 0.8 + axonLength * Math.sin(Math.atan2(baseY, baseX)) + serotonin + betaWave

        metadata = {
          neuronType: Math.floor(rng.next() * 5), // Motor, sensory, interneuron, etc.
          firingRate: Math.max(0, neuralActivity * 100 + rng.gaussian() * 20),
          synapticStrength: Math.abs(synapticWeight),
          neurotransmitter:
            dopamine > 0 ? "dopamine" : serotonin > 0 ? "serotonin" : acetylcholine > 0 ? "acetylcholine" : "GABA",
          brainRegion: Math.floor(rng.next() * 8), // Cortex, hippocampus, amygdala, etc.
          isInhibitory: synapticWeight < 0,
          myelinated: myelinSheath > 0,
          memoryTrace: memoryFormation,
          glialSupport: astrocyte || microglia || oligodendrocyte,
          electricalActivity: Math.abs(alphaWave + betaWave + gammaWave) * 100,
          plasticity: synapticPlasticity * 100,
        }
        break
      }

      case "quantum": {
        // Quantum realm with particles, waves, and quantum phenomena
        const waveFunction = Math.sin(baseX * 15) * Math.cos(baseY * 15) * Math.exp(-(baseX ** 2 + baseY ** 2) * 1.5)
        const particlePosition = rng.gaussian() * 0.08

        // Wave-particle duality
        const observationCollapse = rng.next() < 0.3
        const quantumState = observationCollapse ? particlePosition : waveFunction

        // Quantum superposition
        const superposition = ((Math.sin(baseX * 8) + Math.cos(baseY * 8)) / Math.sqrt(2)) * 0.1
        const coherenceTime = Math.exp(-Math.abs(baseX * baseY) * 5)

        // Quantum entanglement
        const entanglementPair = Math.floor(i / 2) * 2 // Pair particles
        const entangled = i === entanglementPair || i === entanglementPair + 1
        const spookyAction = entangled ? Math.sin(i * 0.5) * 0.15 : 0

        // Virtual particles and vacuum fluctuations
        const virtualParticle = rng.next() < 0.1 && Math.sin(i * 0.8) > 0.9
        const vacuumFluctuation = Math.sin(baseX * 25 + baseY * 20 + i * 0.3) * 0.02

        // Quantum tunneling
        const barrier = Math.abs(baseX) > 1 || Math.abs(baseY) > 1
        const tunnelingProbability = barrier ? Math.exp(-Math.abs(baseX + baseY) * 3) : 1
        const tunneled = barrier && rng.next() < tunnelingProbability

        // Quantum field fluctuations
        const fieldFluctuation = Math.sin(baseX * 30) * Math.cos(baseY * 25) * Math.sin(i * 0.1) * 0.03

        x = baseX + quantumState + superposition + spookyAction + vacuumFluctuation + fieldFluctuation
        y = baseY + quantumState * Math.sin(i * 0.1) + spookyAction * 0.8 + (tunneled ? rng.gaussian() * 0.2 : 0)

        metadata = {
          particleType: Math.floor(rng.next() * 6), // Electron, photon, quark, etc.
          spin: rng.next() < 0.5 ? 0.5 : -0.5,
          charge: Math.floor(rng.next() * 3) - 1, // -1, 0, 1
          waveFunction: waveFunction,
          isObserved: observationCollapse,
          entanglement: entangled,
          tunneling: tunneled,
          coherence: coherenceTime,
          virtualParticle: virtualParticle,
          fieldStrength: Math.abs(fieldFluctuation) * 100,
        }
        break
      }

      case "crystal": {
        // Crystal lattice with atoms, defects, and crystalline structures
        const latticeConstant = 0.2
        const atomPositionX = Math.round(baseX / latticeConstant) * latticeConstant
        const atomPositionY = Math.round(baseY / latticeConstant) * latticeConstant

        // Atomic vibrations and thermal energy
        const thermalVibrationX = Math.sin(i * 0.2) * 0.03
        const thermalVibrationY = Math.cos(i * 0.2) * 0.03

        // Crystal defects and impurities
        const vacancyDefect = rng.next() < 0.01
        const interstitialDefect = rng.next() < 0.005
        const impurityAtom = rng.next() < 0.02

        // Grain boundaries and crystal orientation
        const grainBoundary = Math.abs(baseX + baseY) > 1.5
        const crystalOrientation = Math.atan2(baseY, baseX)

        // Phonons and lattice waves
        const phononWaveX = Math.sin(baseX * 10 + i * 0.1) * 0.05
        const phononWaveY = Math.cos(baseY * 10 + i * 0.1) * 0.05

        // Piezoelectric effect
        const piezoelectricStress = Math.sin(baseX * 5) * Math.cos(baseY * 5) * 0.02
        const electricField = piezoelectricStress * 100

        x = atomPositionX + thermalVibrationX + phononWaveX + piezoelectricStress
        y = atomPositionY + thermalVibrationY + phononWaveY

        metadata = {
          atomType: Math.floor(rng.next() * 8), // Silicon, carbon, oxygen, etc.
          latticePosition: { x: atomPositionX, y: atomPositionY },
          thermalEnergy: Math.abs(thermalVibrationX + thermalVibrationY) * 100,
          vacancyDefect: vacancyDefect,
          interstitialDefect: interstitialDefect,
          impurityAtom: impurityAtom,
          grainBoundary: grainBoundary,
          crystalOrientation: crystalOrientation,
          phononFrequency: Math.abs(phononWaveX + phononWaveY) * 100,
          electricField: electricField,
        }
        break
      }

      case "plasma": {
        // Plasma physics with charged particles, magnetic fields, and electromagnetic radiation
        const electronDensity = Math.sin(baseX * 8) * Math.cos(baseY * 8) * 0.5 + 0.5
        const ionDensity = Math.cos(baseX * 10) * Math.sin(baseY * 10) * 0.5 + 0.5

        // Magnetic field lines
        const magneticFieldX = Math.sin(baseX * 3) * 0.2
        const magneticFieldY = Math.cos(baseY * 3) * 0.2

        // Electromagnetic radiation
        const emRadiation = Math.sin(i * 0.3) * 0.1
        const radiationFrequency = Math.abs(emRadiation) * 100

        // Plasma instabilities
        const plasmaInstability = rng.next() < 0.05 && Math.sin(i * 0.5) > 0.8
        const instabilityDisruption = plasmaInstability ? rng.gaussian() * 0.1 : 0

        // Fusion reactions
        const fusionReaction = rng.next() < 0.01 && electronDensity > 0.8 && ionDensity > 0.8
        const fusionEnergy = fusionReaction ? 0.2 : 0

        // Plasma waves
        const plasmaWaveX = Math.sin(baseX * 15 + i * 0.2) * 0.08
        const plasmaWaveY = Math.cos(baseY * 15 + i * 0.2) * 0.08

        x = baseX + magneticFieldX + emRadiation + instabilityDisruption + plasmaWaveX + fusionEnergy
        y = baseY + magneticFieldY + plasmaWaveY

        metadata = {
          electronDensity: electronDensity,
          ionDensity: ionDensity,
          magneticFieldStrength: Math.sqrt(magneticFieldX ** 2 + magneticFieldY ** 2),
          radiationFrequency: radiationFrequency,
          plasmaInstability: plasmaInstability,
          fusionReaction: fusionReaction,
          plasmaTemperature: electronDensity * 10000, // Kelvin
          plasmaPressure: ionDensity * 100, // Pascals
        }
        break
      }

      case "atmospheric": {
        // Atmospheric physics with weather patterns, clouds, and atmospheric phenomena
        const altitude = Math.max(0, -baseY * 1000 + 500) // 0-1000m altitude
        const windSpeed = Math.sin(baseX * 2) * Math.cos(baseY * 1.5) * 0.3

        // Cloud formations
        const cloudDensity = Math.sin(baseX * 5) * Math.cos(baseY * 4) * 0.5 + 0.5
        const cloudType = Math.floor(rng.next() * 6) // Cumulus, stratus, cirrus, etc.

        // Precipitation
        const precipitation = rng.next() < 0.1 && cloudDensity > 0.7
        const rainIntensity = precipitation ? Math.sin(i * 0.3) * 0.2 : 0

        // Atmospheric pressure
        const atmosphericPressure = 101325 - altitude * 10 // Pascals

        // Temperature gradient
        const temperature = 25 - altitude * 0.0065 // Celsius

        // Turbulence and wind shear
        const turbulence = Math.sin(baseX * 8 + baseY * 6) * windSpeed * 0.5
        const windShear = Math.cos(baseX * 6 + baseY * 8) * windSpeed * 0.3

        x = baseX + windSpeed + turbulence
        y = baseY + windShear + rainIntensity

        metadata = {
          altitude: altitude,
          temperature: temperature,
          windSpeed: Math.abs(windSpeed) * 10, // km/h
          cloudDensity: cloudDensity,
          cloudType: cloudType,
          precipitation: precipitation,
          atmosphericPressure: atmosphericPressure,
          humidity: Math.sin(baseX + baseY) * 0.5 + 0.5,
          visibility: Math.max(0, 10 - cloudDensity * 8), // km
        }
        break
      }

      case "geological": {
        // Geological time with tectonic plates, erosion, and geological formations
        const depth = Math.max(0, -baseY * 1000 + 500) // 0-1000m depth
        const tectonicActivity = Math.sin(baseX * 2) * Math.cos(baseY * 1.5) * 0.2

        // Tectonic plate boundaries
        const plateBoundary = Math.abs(baseX + baseY) > 1.5
        const plateType = Math.floor(rng.next() * 4) // Convergent, divergent, transform, etc.

        // Erosion and weathering
        const erosionRate = Math.sin(baseX * 5) * Math.cos(baseY * 4) * 0.1
        const sedimentDeposit = erosionRate * 0.8

        // Volcanic activity
        const volcanicActivity = rng.next() < 0.05 && depth > 500
        const lavaFlow = volcanicActivity ? Math.sin(i * 0.3) * 0.2 : 0

        // Seismic activity
        const seismicActivity = rng.next() < 0.02 && plateBoundary
        const earthquakeMagnitude = seismicActivity ? rng.range(4, 8) : 0

        x = baseX + tectonicActivity + erosionRate + lavaFlow
        y = baseY + sedimentDeposit

        metadata = {
          depth: depth,
          plateBoundary: plateBoundary,
          plateType: plateType,
          erosionRate: Math.abs(erosionRate) * 10, // mm/year
          sedimentDeposit: sedimentDeposit,
          volcanicActivity: volcanicActivity,
          earthquakeMagnitude: earthquakeMagnitude,
          rockType: Math.floor(rng.next() * 8), // Igneous, sedimentary, metamorphic, etc.
          geologicalAge: depth * 1000000, // Years
        }
        break
      }

      case "biological": {
        // Biological systems with cells, DNA, and organic life
        const cellDensity = Math.sin(baseX * 8) * Math.cos(baseY * 8) * 0.5 + 0.5
        const dnaStructure = Math.cos(baseX * 10) * Math.sin(baseY * 10) * 0.2

        // Cell division and growth
        const cellDivision = rng.next() < 0.1 && cellDensity > 0.8
        const cellGrowth = cellDivision ? Math.sin(i * 0.3) * 0.1 : 0

        // Genetic mutations
        const geneticMutation = rng.next() < 0.01
        const mutationEffect = geneticMutation ? rng.gaussian() * 0.05 : 0

        // Protein synthesis
        const proteinSynthesis = Math.sin(baseX * 15 + i * 0.2) * 0.08
        const proteinType = Math.floor(rng.next() * 12) // Enzyme, antibody, hormone, etc.

        x = baseX + dnaStructure + cellGrowth + mutationEffect + proteinSynthesis
        y = baseY

        metadata = {
          cellType: Math.floor(rng.next() * 10), // Neuron, muscle, epithelial, etc.
          cellDensity: cellDensity,
          dnaStructure: dnaStructure,
          cellDivision: cellDivision,
          geneticMutation: geneticMutation,
          proteinType: proteinType,
          metabolicRate: cellDensity * 100, // Arbitrary units
          organismType: Math.floor(rng.next() * 6), // Bacteria, plant, animal, etc.
        }
        break
      }

      default:
        // Default scenario - no transformation
        metadata = {
          default: true,
        }
        break
    }

    transformedPoints.push({ x, y, metadata })
  }

  return transformedPoints
}

// Helper function to check if a number is prime
function isPrime(num: number): boolean {
  if (num <= 1) return false
  if (num <= 3) return true

  if (num % 2 === 0 || num % 3 === 0) return false

  for (let i = 5; i * i <= num; i = i + 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false
  }

  return true
}

// Helper function to generate a Fibonacci spiral
function fibonacciSpiral(x: number, y: number): number {
  const angle = Math.atan2(y, x)
  const radius = Math.sqrt(x * x + y * y)
  const fibonacci = Math.round(radius)
  return fibonacci
}
