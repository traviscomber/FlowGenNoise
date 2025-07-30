export interface GenerationParams {
  dataset: string
  scenario: string
  colorScheme: string
  seed: number
  numSamples: number
  noiseScale: number
  timeStep?: number
}

export interface DataPoint {
  x: number
  y: number
  label: number
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

  nextGaussian(): number {
    const u = this.next()
    const v = this.next()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }
}

// Color schemes
const colorSchemes = {
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
  magma: ["#000004", "#1c1044", "#4f127b", "#812581", "#b5367a", "#e55964", "#fb8761", "#fec287", "#fcfdbf"],
  sunset: ["#ff6b35", "#f7931e", "#ffd23f", "#06ffa5", "#1fb3d3", "#5d2e5d"],
  cosmic: ["#2c1810", "#8b4513", "#ffa500", "#ffff00", "#ffffff"],
  quantum: ["#001122", "#003366", "#0066cc", "#3399ff", "#66ccff", "#99ddff"],
  thermal: [
    "#000000",
    "#330000",
    "#660000",
    "#990000",
    "#cc0000",
    "#ff0000",
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
    "#e8f4f8",
    "#b8e6f0",
    "#88d8e8",
    "#58cae0",
    "#28bcd8",
    "#1e90ff",
    "#4169e1",
    "#6a5acd",
    "#9370db",
    "#ba55d3",
  ],
  bioluminescent: ["#001122", "#003344", "#005566", "#007788", "#0099aa", "#00bbcc", "#00ddee", "#33eeff", "#66ffff"],
  aurora: [
    "#001100",
    "#003300",
    "#005500",
    "#007700",
    "#009900",
    "#00bb00",
    "#00dd00",
    "#00ff00",
    "#33ff33",
    "#66ff66",
  ],
  metallic: [
    "#2c2c2c",
    "#4a4a4a",
    "#686868",
    "#868686",
    "#a4a4a4",
    "#c2c2c2",
    "#e0e0e0",
    "#ffd700",
    "#ffed4e",
    "#fff8dc",
  ],
  neon: ["#ff0080", "#ff0040", "#ff4000", "#ff8000", "#ffff00", "#80ff00", "#40ff00", "#00ff40", "#00ff80", "#00ffff"],
}

function getColor(scheme: string, t: number): string {
  const colors = colorSchemes[scheme as keyof typeof colorSchemes] || colorSchemes.plasma
  const index = Math.floor(t * (colors.length - 1))
  const nextIndex = Math.min(index + 1, colors.length - 1)
  const localT = t * (colors.length - 1) - index

  // Simple linear interpolation between colors
  const color1 = colors[index]
  const color2 = colors[nextIndex]

  if (localT === 0) return color1

  // Parse hex colors
  const r1 = Number.parseInt(color1.slice(1, 3), 16)
  const g1 = Number.parseInt(color1.slice(3, 5), 16)
  const b1 = Number.parseInt(color1.slice(5, 7), 16)

  const r2 = Number.parseInt(color2.slice(1, 3), 16)
  const g2 = Number.parseInt(color2.slice(3, 5), 16)
  const b2 = Number.parseInt(color2.slice(5, 7), 16)

  const r = Math.round(r1 + (r2 - r1) * localT)
  const g = Math.round(g1 + (g2 - g1) * localT)
  const b = Math.round(b1 + (b2 - b1) * localT)

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
}

// Dataset generators
function generateSpirals(numSamples: number, rng: SeededRandom): Array<{ x: number; y: number; label: number }> {
  const points = []
  for (let i = 0; i < numSamples; i++) {
    const t = (i / numSamples) * 4 * Math.PI
    const spiral = Math.floor(i / (numSamples / 2))
    const r = t * 0.1
    const noise = rng.nextGaussian() * 0.1

    if (spiral === 0) {
      points.push({
        x: (r * Math.cos(t) + noise) * 50 + 256,
        y: (r * Math.sin(t) + noise) * 50 + 256,
        label: 0,
      })
    } else {
      points.push({
        x: (r * Math.cos(t + Math.PI) + noise) * 50 + 256,
        y: (r * Math.sin(t + Math.PI) + noise) * 50 + 256,
        label: 1,
      })
    }
  }
  return points
}

function generateMoons(numSamples: number, rng: SeededRandom): Array<{ x: number; y: number; label: number }> {
  const points = []
  for (let i = 0; i < numSamples; i++) {
    const label = Math.floor(i / (numSamples / 2))
    const t = ((i % (numSamples / 2)) / (numSamples / 2)) * Math.PI
    const noise = rng.nextGaussian() * 10

    if (label === 0) {
      points.push({
        x: Math.cos(t) * 100 + 200 + noise,
        y: Math.sin(t) * 100 + 256 + noise,
        label: 0,
      })
    } else {
      points.push({
        x: (1 - Math.cos(t)) * 100 + 200 + noise,
        y: (1 - Math.sin(t)) * 100 + 200 + noise,
        label: 1,
      })
    }
  }
  return points
}

function generateCircles(numSamples: number, rng: SeededRandom): Array<{ x: number; y: number; label: number }> {
  const points = []
  for (let i = 0; i < numSamples; i++) {
    const angle = rng.next() * 2 * Math.PI
    const radius = rng.next() * 150 + 50
    const label = radius > 100 ? 1 : 0
    const noise = rng.nextGaussian() * 5

    points.push({
      x: Math.cos(angle) * radius + 256 + noise,
      y: Math.sin(angle) * radius + 256 + noise,
      label,
    })
  }
  return points
}

function generateBlobs(numSamples: number, rng: SeededRandom): Array<{ x: number; y: number; label: number }> {
  const points = []
  const centers = [
    { x: 150, y: 150, label: 0 },
    { x: 362, y: 150, label: 1 },
    { x: 150, y: 362, label: 2 },
    { x: 362, y: 362, label: 3 },
  ]

  for (let i = 0; i < numSamples; i++) {
    const center = centers[Math.floor(rng.next() * centers.length)]
    const angle = rng.next() * 2 * Math.PI
    const radius = Math.abs(rng.nextGaussian()) * 40 + 60

    points.push({
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
      label: center.label,
    })
  }
  return points
}

function generateCheckerboard(numSamples: number, rng: SeededRandom): Array<{ x: number; y: number; label: number }> {
  const points = []
  for (let i = 0; i < numSamples; i++) {
    const x = rng.next() * 512
    const y = rng.next() * 512
    const gridX = Math.floor(x / 64)
    const gridY = Math.floor(y / 64)
    const label = (gridX + gridY) % 2

    points.push({ x, y, label })
  }
  return points
}

function generateGaussian(numSamples: number, rng: SeededRandom): Array<{ x: number; y: number; label: number }> {
  const points = []
  for (let i = 0; i < numSamples; i++) {
    const x = rng.nextGaussian() * 80 + 256
    const y = rng.nextGaussian() * 80 + 256
    const label = Math.floor(rng.next() * 2)

    points.push({ x, y, label })
  }
  return points
}

function generateGrid(numSamples: number, rng: SeededRandom): Array<{ x: number; y: number; label: number }> {
  const points = []
  const gridSize = Math.ceil(Math.sqrt(numSamples))

  for (let i = 0; i < numSamples; i++) {
    const row = Math.floor(i / gridSize)
    const col = i % gridSize
    const x = (col / gridSize) * 512 + rng.nextGaussian() * 10
    const y = (row / gridSize) * 512 + rng.nextGaussian() * 10
    const label = (row + col) % 2

    points.push({ x, y, label })
  }
  return points
}

function generateFractal(numSamples: number, rng: SeededRandom): Array<{ x: number; y: number; label: number }> {
  const points = []
  const vertices = [
    { x: 256, y: 50 }, // Top
    { x: 50, y: 400 }, // Bottom left
    { x: 462, y: 400 }, // Bottom right
  ]

  let currentPoint = { x: 256, y: 256 }

  for (let i = 0; i < numSamples; i++) {
    const targetVertex = vertices[Math.floor(rng.next() * 3)]
    currentPoint = {
      x: (currentPoint.x + targetVertex.x) / 2,
      y: (currentPoint.y + targetVertex.y) / 2,
    }

    points.push({
      x: currentPoint.x + rng.nextGaussian() * 2,
      y: currentPoint.y + rng.nextGaussian() * 2,
      label: Math.floor(rng.next() * 3),
    })
  }
  return points
}

function generateMandelbrot(numSamples: number, rng: SeededRandom): Array<{ x: number; y: number; label: number }> {
  const points = []

  for (let i = 0; i < numSamples; i++) {
    const x = rng.next() * 4 - 2 // Real part: -2 to 2
    const y = rng.next() * 4 - 2 // Imaginary part: -2 to 2

    let zx = 0,
      zy = 0
    let iterations = 0
    const maxIterations = 100

    while (zx * zx + zy * zy < 4 && iterations < maxIterations) {
      const temp = zx * zx - zy * zy + x
      zy = 2 * zx * zy + y
      zx = temp
      iterations++
    }

    if (iterations < maxIterations) {
      points.push({
        x: (x + 2) * 128, // Scale to 0-512
        y: (y + 2) * 128,
        label: iterations % 10,
      })
    }
  }
  return points
}

function generateJuliaSet(numSamples: number, rng: SeededRandom): Array<{ x: number; y: number; label: number }> {
  const points = []
  const cx = -0.7269 // Julia set constant
  const cy = 0.1889

  for (let i = 0; i < numSamples; i++) {
    let zx = rng.next() * 4 - 2
    let zy = rng.next() * 4 - 2
    let iterations = 0
    const maxIterations = 100

    while (zx * zx + zy * zy < 4 && iterations < maxIterations) {
      const temp = zx * zx - zy * zy + cx
      zy = 2 * zx * zy + cy
      zx = temp
      iterations++
    }

    if (iterations < maxIterations) {
      points.push({
        x: (zx + 2) * 128,
        y: (zy + 2) * 128,
        label: iterations % 10,
      })
    }
  }
  return points
}

function generateLorenz(numSamples: number, rng: SeededRandom): Array<{ x: number; y: number; label: number }> {
  const points = []
  let x = 1,
    y = 1,
    z = 1
  const dt = 0.01
  const sigma = 10,
    rho = 28,
    beta = 8 / 3

  for (let i = 0; i < numSamples; i++) {
    const dx = sigma * (y - x)
    const dy = x * (rho - z) - y
    const dz = x * y - beta * z

    x += dx * dt
    y += dy * dt
    z += dz * dt

    points.push({
      x: x * 8 + 256,
      y: y * 8 + 256,
      label: z > 25 ? 1 : 0,
    })
  }
  return points
}

function generateTribes(numSamples: number, rng: SeededRandom): Array<{ x: number; y: number; label: number }> {
  const points = []
  const tribes = [
    { x: 128, y: 128, size: 0.3 },
    { x: 384, y: 128, size: 0.25 },
    { x: 128, y: 384, size: 0.2 },
    { x: 384, y: 384, size: 0.25 },
  ]

  for (let i = 0; i < numSamples; i++) {
    const tribe = tribes[Math.floor(rng.next() * tribes.length)]
    const angle = rng.next() * 2 * Math.PI
    const radius = Math.abs(rng.nextGaussian()) * tribe.size * 100 + 50

    points.push({
      x: tribe.x + Math.cos(angle) * radius,
      y: tribe.y + Math.sin(angle) * radius,
      label: tribes.indexOf(tribe),
    })
  }
  return points
}

function generateHeads(numSamples: number, rng: SeededRandom): Array<{ x: number; y: number; label: number }> {
  const points = []

  for (let i = 0; i < numSamples; i++) {
    const angle = rng.next() * 2 * Math.PI
    const radius = 80 + rng.nextGaussian() * 20
    const x = 256 + Math.cos(angle) * radius
    const y = 256 + Math.sin(angle) * radius

    // Add facial features
    let label = 0
    if (Math.abs(x - 256) < 20 && y > 240 && y < 280) label = 1 // Eyes area
    if (Math.abs(x - 256) < 10 && y > 280 && y < 300) label = 2 // Nose area
    if (Math.abs(x - 256) < 25 && y > 300 && y < 320) label = 3 // Mouth area

    points.push({ x, y, label })
  }
  return points
}

function generateNatives(numSamples: number, rng: SeededRandom): Array<{ x: number; y: number; label: number }> {
  const points = []
  const villages = [
    { x: 150, y: 150, type: "longhouse" },
    { x: 362, y: 150, type: "tipi" },
    { x: 256, y: 300, type: "pueblo" },
  ]

  for (let i = 0; i < numSamples; i++) {
    const village = villages[Math.floor(rng.next() * villages.length)]
    const angle = rng.next() * 2 * Math.PI
    const radius = Math.abs(rng.nextGaussian()) * 60 + 80

    points.push({
      x: village.x + Math.cos(angle) * radius,
      y: village.y + Math.sin(angle) * radius,
      label: villages.indexOf(village),
    })
  }
  return points
}

function generateDataset(dataset: string, numSamples: number, rng: SeededRandom) {
  switch (dataset) {
    case "spirals":
      return generateSpirals(numSamples, rng)
    case "moons":
      return generateMoons(numSamples, rng)
    case "circles":
      return generateCircles(numSamples, rng)
    case "blobs":
      return generateBlobs(numSamples, rng)
    case "checkerboard":
      return generateCheckerboard(numSamples, rng)
    case "gaussian":
      return generateGaussian(numSamples, rng)
    case "grid":
      return generateGrid(numSamples, rng)
    case "fractal":
      return generateFractal(numSamples, rng)
    case "mandelbrot":
      return generateMandelbrot(numSamples, rng)
    case "julia":
      return generateJuliaSet(numSamples, rng)
    case "lorenz":
      return generateLorenz(numSamples, rng)
    case "tribes":
      return generateTribes(numSamples, rng)
    case "heads":
      return generateHeads(numSamples, rng)
    case "natives":
      return generateNatives(numSamples, rng)
    default:
      return generateSpirals(numSamples, rng)
  }
}

export function generateFlowField(params: GenerationParams): string {
  const { dataset, colorScheme, seed, numSamples, noiseScale } = params
  const rng = new SeededRandom(seed)

  // Generate the dataset points
  const points = generateDataset(dataset, numSamples, rng)

  // Create SVG
  let svg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" fill="#000011"/>
    <defs>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>`

  // Add points
  points.forEach((point, i) => {
    const maxLabel = Math.max(1, Math.max(...points.map((p) => p.label)))
    const t = point.label / maxLabel
    const color = getColor(colorScheme, t)
    const noise = rng.nextGaussian() * noiseScale * 10
    const x = Math.max(0, Math.min(512, point.x + noise))
    const y = Math.max(0, Math.min(512, point.y + noise))
    const radius = 1 + rng.next() * 2

    svg += `<circle cx="${x}" cy="${y}" r="${radius}" fill="${color}" opacity="0.8" filter="url(#glow)"/>`
  })

  svg += "</svg>"
  return svg
}

export function generateDomeProjection(params: { width: number; height: number; fov: number; tilt: number }): string {
  const { width, height } = params

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="domeGradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#000000;stop-opacity:0" />
      </radialGradient>
    </defs>
    <circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) / 2}" fill="url(#domeGradient)" />
    <text x="${width / 2}" y="${height / 2}" text-anchor="middle" fill="white" font-size="24">Dome Projection</text>
  </svg>`
}
