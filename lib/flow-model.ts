import { Vector2, Vector3 } from "three"
import { Complex, mandelbrot, julia, transformPointStereographic } from "./plot-utils"

export type FlowFieldPoint = {
  position: Vector3
  velocity: Vector3
  color: string
  originalPosition: Vector3
  depth: number
}

export type FlowFieldConfig = {
  width: number
  height: number
  depth: number
  numSamples: number
  noiseScale: number
  dataset: string
  scenario: string
  colorScheme: string
  seed: number
  enableStereographic: boolean
  stereographicPerspective: "little-planet" | "tunnel"
}

interface GenerateFlowArtOptions {
  dataset: string
  scenario: string
  numSamples: number
  noiseScale: number
  enableStereographic: boolean
  stereographicPerspective: "little-planet" | "tunnel"
}

interface FlowArtData {
  points: { x: number; y: number; value: number }[]
  connections: { x1: number; y1: number; x2: number; y2: number }[]
}

const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2

// Utility function to generate a pseudo-random number based on a seed
function mulberry32(a: number) {
  return () => {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t = (t ^ (t >>> 7)) + Math.imul(t ^ (t >>> 14), t | 1)
    return ((t ^ (t >>> 12)) >>> 0) / 4294967296
  }
}

// Perlin noise function (simplified for 2D)
function perlinNoise2D(x: number, y: number, seed: number) {
  const rand = mulberry32(seed)
  const floorX = Math.floor(x)
  const floorY = Math.floor(y)

  const dotGridient = (ix: number, iy: number, rx: number, ry: number) => {
    const v = rand() * 2 * Math.PI
    const gx = Math.cos(v)
    const gy = Math.sin(v)
    return rx * gx + ry * gy
  }

  const smooth = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)

  const x0 = floorX
  const x1 = x0 + 1
  const y0 = floorY
  const y1 = y0 + 1

  const sx = x - x0
  const sy = y - y0

  const n00 = dotGridient(x0, y0, sx, sy)
  const n10 = dotGridient(x1, y0, sx - 1, sy)
  const n01 = dotGridient(x0, y1, sx, sy - 1)
  const n11 = dotGridient(x1, y1, sx - 1, sy - 1)

  const ix0 = smooth(sx)
  const ix1 = smooth(sy)

  const value = n00 * (1 - ix0) * (1 - ix1) + n10 * ix0 * (1 - ix1) + n01 * (1 - ix0) * ix1 + n11 * ix0 * ix1

  return value
}

// Data generation functions
const generateSpirals = (rand: () => number, numSamples: number, noiseScale: number) => {
  const points: Vector3[] = []
  for (let i = 0; i < numSamples; i++) {
    const angle = i * GOLDEN_RATIO * Math.PI * 2
    const radius = Math.sqrt(i / numSamples) * 0.8 + rand() * noiseScale * 0.1
    const x = radius * Math.cos(angle)
    const y = radius * Math.sin(angle)
    const z = (rand() - 0.5) * noiseScale * 0.2
    points.push(new Vector3(x, y, z))
  }
  return points
}

const generateQuantum = (rand: () => number, numSamples: number, noiseScale: number) => {
  const points: Vector3[] = []
  for (let i = 0; i < numSamples; i++) {
    const x = (rand() - 0.5) * 2 * (1 + perlinNoise2D(i * 0.01, 0, rand()) * noiseScale)
    const y = (rand() - 0.5) * 2 * (1 + perlinNoise2D(0, i * 0.01, rand()) * noiseScale)
    const z = (rand() - 0.5) * 2 * (1 + perlinNoise2D(i * 0.01, i * 0.01, rand()) * noiseScale)
    points.push(new Vector3(x, y, z))
  }
  return points
}

const generateStrings = (rand: () => number, numSamples: number, noiseScale: number) => {
  const points: Vector3[] = []
  for (let i = 0; i < numSamples; i++) {
    const t = (i / numSamples) * Math.PI * 4
    const x = Math.sin(t) * (0.8 + rand() * noiseScale * 0.2)
    const y = Math.cos(t * 2) * (0.6 + rand() * noiseScale * 0.2)
    const z = Math.sin(t * 3) * (0.4 + rand() * noiseScale * 0.2)
    points.push(new Vector3(x, y, z))
  }
  return points
}

const generateFractals = (rand: () => number, numSamples: number, noiseScale: number) => {
  const points: Vector3[] = []
  let x = 0,
    y = 0,
    z = 0
  for (let i = 0; i < numSamples; i++) {
    const r = rand()
    if (r < 0.01) {
      x = 0
      y = 0.16 * y
    } else if (r < 0.86) {
      x = 0.85 * x + 0.04 * y
      y = -0.04 * x + 0.85 * y + 1.6
    } else if (r < 0.93) {
      x = 0.2 * x - 0.26 * y
      y = 0.23 * x + 0.22 * y + 1.6
    } else {
      x = -0.15 * x + 0.28 * y
      y = 0.26 * x + 0.24 * y + 0.44
    }
    points.push(new Vector3(x * 0.1, y * 0.1, (rand() - 0.5) * noiseScale * 0.1))
  }
  return points
}

const generateTopology = (rand: () => number, numSamples: number, noiseScale: number) => {
  const points: Vector3[] = []
  for (let i = 0; i < numSamples; i++) {
    const u = rand() * Math.PI * 2
    const v = rand() * Math.PI * 2
    const r = 0.7 + noiseScale * (rand() - 0.5) * 0.1
    const x = r * Math.cos(u) * (1 + 0.5 * Math.cos(v))
    const y = r * Math.sin(u) * (1 + 0.5 * Math.cos(v))
    const z = r * 0.5 * Math.sin(v)
    points.push(new Vector3(x, y, z))
  }
  return points
}

const generateMoons = (rand: () => number, numSamples: number, noiseScale: number) => {
  const points: Vector3[] = []
  for (let i = 0; i < numSamples; i++) {
    const angle = rand() * Math.PI * 2
    const radius = 0.5 + rand() * 0.3 + noiseScale * (rand() - 0.5) * 0.1
    const x = radius * Math.cos(angle)
    const y = radius * Math.sin(angle)
    const z = Math.sin(angle * 5) * 0.1 * (1 + noiseScale * rand())
    points.push(new Vector3(x, y, z))
  }
  return points
}

const generateCircles = (rand: () => number, numSamples: number, noiseScale: number) => {
  const points: Vector3[] = []
  for (let i = 0; i < numSamples; i++) {
    const angle = rand() * Math.PI * 2
    const radius = 0.5 + noiseScale * (rand() - 0.5) * 0.1
    const x = radius * Math.cos(angle)
    const y = radius * Math.sin(angle)
    const z = (rand() - 0.5) * noiseScale * 0.1
    points.push(new Vector3(x, y, z))
  }
  return points
}

const generateBlobs = (rand: () => number, numSamples: number, noiseScale: number) => {
  const points: Vector3[] = []
  for (let i = 0; i < numSamples; i++) {
    const x = (rand() - 0.5) * 2 * (1 + rand() * noiseScale)
    const y = (rand() - 0.5) * 2 * (1 + rand() * noiseScale)
    const z = (rand() - 0.5) * 2 * (1 + rand() * noiseScale)
    points.push(new Vector3(x, y, z))
  }
  return points
}

const generateCheckerboard = (rand: () => number, numSamples: number, noiseScale: number) => {
  const points: Vector3[] = []
  const gridSize = 10
  for (let i = 0; i < numSamples; i++) {
    const x = (Math.floor(rand() * gridSize) / gridSize - 0.5) * 2
    const y = (Math.floor(rand() * gridSize) / gridSize - 0.5) * 2
    const z = (rand() - 0.5) * noiseScale * 0.1
    points.push(new Vector3(x, y, z))
  }
  return points
}

const generateGaussian = (rand: () => number, numSamples: number, noiseScale: number) => {
  const points: Vector3[] = []
  for (let i = 0; i < numSamples; i++) {
    // Box-Muller transform for Gaussian distribution
    const u1 = rand()
    const u2 = rand()
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)
    const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2)

    const x = z0 * 0.3 + (rand() - 0.5) * noiseScale * 0.1
    const y = z1 * 0.3 + (rand() - 0.5) * noiseScale * 0.1
    const z = (rand() - 0.5) * noiseScale * 0.1
    points.push(new Vector3(x, y, z))
  }
  return points
}

const generateGrid = (rand: () => number, numSamples: number, noiseScale: number) => {
  const points: Vector3[] = []
  const numPointsPerSide = Math.ceil(Math.sqrt(numSamples))
  const spacing = 2 / numPointsPerSide
  for (let i = 0; i < numPointsPerSide; i++) {
    for (let j = 0; j < numPointsPerSide; j++) {
      const x = -1 + i * spacing + (rand() - 0.5) * noiseScale * 0.1
      const y = -1 + j * spacing + (rand() - 0.5) * noiseScale * 0.1
      const z = (rand() - 0.5) * noiseScale * 0.1
      points.push(new Vector3(x, y, z))
    }
  }
  return points
}

// Color mapping functions
const getColorForScheme = (scheme: string, value: number, rand: () => number) => {
  switch (scheme) {
    case "plasma":
      return `hsl(${value * 360}, 100%, 50%)`
    case "quantum":
      return `hsl(${200 + value * 60}, 80%, ${30 + value * 40}%)`
    case "cosmic":
      return `hsl(${240 + value * 60}, 50%, ${10 + value * 30}%)`
    case "thermal":
      return `hsl(${value * 60}, 100%, 50%)`
    case "spectral":
      return `hsl(${value * 360}, 100%, 50%)`
    case "crystalline":
      return `hsl(${180 + value * 60}, 50%, ${50 + value * 20}%)`
    case "bioluminescent":
      return `hsl(${180 + value * 60}, 80%, ${30 + value * 40}%)`
    case "aurora":
      return `hsl(${120 + value * 120}, 70%, ${40 + value * 30}%)`
    case "metallic":
      return `hsl(0, 0%, ${50 + value * 50}%)`
    case "prismatic":
      return `hsl(${value * 360}, 100%, 70%)`
    case "monochromatic":
      return `hsl(0, 0%, ${value * 100}%)`
    case "infrared":
      return `hsl(${value * 30}, 100%, 50%)`
    default:
      return `hsl(${value * 360}, 100%, 50%)`
  }
}

// Stereographic projection functions
const projectLittlePlanet = (point: Vector3, center: Vector3) => {
  const p = point.clone().sub(center)
  const r = p.length()
  if (r === 0) return new Vector2(0, 0)

  const theta = Math.atan2(p.y, p.x)
  const phi = Math.acos(p.z / r)

  const projectedRadius = (2 * Math.tan(phi / 2)) / (1 + r) // Scale by r for better effect
  const x = projectedRadius * Math.sin(theta)
  const y = projectedRadius * Math.cos(theta)

  return new Vector2(x, y)
}

const projectTunnel = (point: Vector3, center: Vector3) => {
  const p = point.clone().sub(center)
  const r = p.length()
  if (r === 0) return new Vector2(0, 0)

  const theta = Math.atan2(p.y, p.x)
  const phi = Math.acos(p.z / r)

  const projectedRadius = (2 * Math.tan(Math.PI / 2 - phi / 2)) / (1 + r) // Invert phi for tunnel
  const x = projectedRadius * Math.sin(theta)
  const y = projectedRadius * Math.cos(theta)

  return new Vector2(x, y)
}

export function generateFlowField({
  width,
  height,
  depth,
  numSamples,
  noiseScale,
  dataset,
  scenario,
  colorScheme,
  seed,
  enableStereographic,
  stereographicPerspective,
}: FlowFieldConfig): FlowFieldPoint[] {
  const rand = mulberry32(seed)
  let points: Vector3[] = []

  // Generate points based on dataset
  switch (dataset) {
    case "spirals":
      points = generateSpirals(rand, numSamples, noiseScale)
      break
    case "quantum":
      points = generateQuantum(rand, numSamples, noiseScale)
      break
    case "strings":
      points = generateStrings(rand, numSamples, noiseScale)
      break
    case "fractals":
      points = generateFractals(rand, numSamples, noiseScale)
      break
    case "topology":
      points = generateTopology(rand, numSamples, noiseScale)
      break
    case "moons":
      points = generateMoons(rand, numSamples, noiseScale)
      break
    case "circles":
      points = generateCircles(rand, numSamples, noiseScale)
      break
    case "blobs":
      points = generateBlobs(rand, numSamples, noiseScale)
      break
    case "checkerboard":
      points = generateCheckerboard(rand, numSamples, noiseScale)
      break
    case "gaussian":
      points = generateGaussian(rand, numSamples, noiseScale)
      break
    case "grid":
      points = generateGrid(rand, numSamples, noiseScale)
      break
    default:
      points = generateSpirals(rand, numSamples, noiseScale)
  }

  // Normalize points to fit within a -1 to 1 range for projection
  const maxDim = Math.max(
    ...points.map((p) => Math.abs(p.x)),
    ...points.map((p) => Math.abs(p.y)),
    ...points.map((p) => Math.abs(p.z)),
  )
  const scaleFactor = maxDim > 0 ? 1 / maxDim : 1
  points.forEach((p) => p.multiplyScalar(scaleFactor * 0.8)) // Scale to fit within unit sphere

  const flowField: FlowFieldPoint[] = []
  const center = new Vector3(0, 0, 0) // Center for stereographic projection

  for (let i = 0; i < points.length; i++) {
    const transformedPosition = points[i].clone()
    let projected2D: Vector2 | null = null

    if (enableStereographic) {
      if (stereographicPerspective === "little-planet") {
        projected2D = projectLittlePlanet(transformedPosition, center)
      } else if (stereographicPerspective === "tunnel") {
        projected2D = projectTunnel(transformedPosition, center)
      }

      if (projected2D) {
        // Scale projected 2D points to fit canvas
        transformedPosition.x = projected2D.x * (width / 2)
        transformedPosition.y = projected2D.y * (height / 2)
        transformedPosition.z = points[i].z // Keep original Z for depth effect
      }
    } else {
      // Scale original 3D points to fit canvas
      transformedPosition.x *= width / 2
      transformedPosition.y *= height / 2
      transformedPosition.z *= depth / 2
    }

    // Apply scenario blending (simple velocity for now)
    let velocity = new Vector3(0, 0, 0)
    switch (scenario) {
      case "pure":
        velocity = new Vector3(0, 0, 0) // Static
        break
      case "quantum":
        velocity = new Vector3(Math.sin(i * 0.1) * 0.1, Math.cos(i * 0.1) * 0.1, (rand() - 0.5) * 0.1)
        break
      case "cosmic":
        velocity = new Vector3(
          (transformedPosition.x / width) * 0.05,
          (transformedPosition.y / height) * 0.05,
          (transformedPosition.z / depth) * 0.05,
        )
        break
      case "microscopic":
        velocity = new Vector3((rand() - 0.5) * 0.2, (rand() - 0.5) * 0.2, (rand() - 0.5) * 0.2)
        break
      case "forest":
        velocity = new Vector3(
          Math.sin(transformedPosition.y * 0.01) * 0.05,
          Math.cos(transformedPosition.x * 0.01) * 0.05,
          0,
        )
        break
      case "ocean":
        velocity = new Vector3(
          Math.sin(transformedPosition.z * 0.01) * 0.05,
          0,
          Math.cos(transformedPosition.x * 0.01) * 0.05,
        )
        break
      case "neural":
        velocity = new Vector3(
          Math.sin(i * 0.05 + rand() * 0.5) * 0.1,
          Math.cos(i * 0.05 + rand() * 0.5) * 0.1,
          (rand() - 0.5) * 0.1,
        )
        break
      case "crystalline":
        velocity = new Vector3(
          Math.round((rand() - 0.5) * 0.2),
          Math.round((rand() - 0.5) * 0.2),
          Math.round((rand() - 0.5) * 0.2),
        )
        break
      case "plasma":
        velocity = new Vector3(Math.sin(i * 0.02) * 0.2, Math.cos(i * 0.03) * 0.2, Math.sin(i * 0.04) * 0.2)
        break
      case "atmospheric":
        velocity = new Vector3((rand() - 0.5) * 0.3, (rand() - 0.5) * 0.3, 0)
        break
      case "geological":
        velocity = new Vector3(Math.sin(i * 0.005) * 0.02, Math.cos(i * 0.005) * 0.02, (rand() - 0.5) * 0.01)
        break
      case "biological":
        velocity = new Vector3(
          Math.sin(i * 0.01 + transformedPosition.x * 0.001) * 0.05,
          Math.cos(i * 0.01 + transformedPosition.y * 0.001) * 0.05,
          (rand() - 0.5) * 0.05,
        )
        break
      default:
        velocity = new Vector3(0, 0, 0)
    }

    flowField.push({
      position: transformedPosition,
      velocity: velocity,
      color: getColorForScheme(colorScheme, rand()),
      originalPosition: points[i].clone(),
      depth: points[i].z,
    })
  }

  return flowField
}

export function generateFlowArt({
  dataset,
  scenario,
  numSamples,
  noiseScale,
  enableStereographic,
  stereographicPerspective,
}: GenerateFlowArtOptions): FlowArtData {
  const points: { x: number; y: number; value: number }[] = []
  const connections: { x1: number; y1: number; x2: number; y2: number }[] = []

  const width = 1000
  const height = 1000

  // Define bounds for the mathematical functions
  let xMin = -2
  let xMax = 2
  let yMin = -2
  let yMax = 2

  // Adjust bounds based on dataset and scenario
  if (dataset === "mandelbrot") {
    xMin = -2.5
    xMax = 1.5
    yMin = -2
    yMax = 2
    if (scenario === "zoom") {
      // Zoom into a specific part of the Mandelbrot set
      xMin = -0.75
      xMax = -0.74
      yMin = 0.1
      yMax = 0.11
    }
  } else if (dataset === "julia") {
    xMin = -1.5
    xMax = 1.5
    yMin = -1.5
    yMax = 1.5
  } else if (dataset === "lorenz") {
    xMin = -30
    xMax = 30
    yMin = -30
    yMax = 30
  } else if (dataset === "sierpinski") {
    xMin = 0
    xMax = 1
    yMin = 0
    yMax = 1
  }

  for (let i = 0; i < numSamples; i++) {
    let x: number, y: number, value: number

    // Generate points based on dataset
    if (dataset === "mandelbrot") {
      const real = xMin + Math.random() * (xMax - xMin)
      const imag = yMin + Math.random() * (yMax - yMin)
      value = mandelbrot(new Complex(real, imag))
      x = real
      y = imag
    } else if (dataset === "julia") {
      const real = xMin + Math.random() * (xMax - xMin)
      const imag = yMin + Math.random() * (yMax - yMin)
      // Example Julia set constant (can be made dynamic)
      const c = new Complex(-0.70176, -0.3842)
      value = julia(new Complex(real, imag), c)
      x = real
      y = imag
    } else if (dataset === "lorenz") {
      // Lorenz attractor simulation (simplified for point generation)
      const dt = 0.01
      const sigma = 10
      const rho = 28
      const beta = 8 / 3
      let lx = Math.random() * 60 - 30 // Initial x
      let ly = Math.random() * 60 - 30 // Initial y
      let lz = Math.random() * 60 - 30 // Initial z

      for (let j = 0; j < 100; j++) {
        // Run a few iterations to get a point on the attractor
        const dx = sigma * (ly - lx) * dt
        const dy = (lx * (rho - lz) - ly) * dt
        const dz = (lx * ly - beta * lz) * dt
        lx += dx
        ly += dy
        lz += dz
      }
      x = lx
      y = ly
      value = lz // Use z-coordinate for value
    } else if (dataset === "sierpinski") {
      // Sierpinski triangle (Chaos Game)
      const vertices = [
        { x: 0.5, y: 1 },
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ]
      const currentPoint = { x: Math.random(), y: Math.random() }
      for (let j = 0; j < 100; j++) {
        const randomIndex = Math.floor(Math.random() * 3)
        const targetVertex = vertices[randomIndex]
        currentPoint.x = (currentPoint.x + targetVertex.x) / 2
        currentPoint.y = (currentPoint.y + targetVertex.y) / 2
      }
      x = currentPoint.x
      y = currentPoint.y
      value = (x + y) / 2 // Simple value based on position
    } else {
      // Default random points
      x = Math.random() * (xMax - xMin) + xMin
      y = Math.random() * (yMax - yMin) + yMin
      value = Math.random()
    }

    // Apply noise
    x += (Math.random() - 0.5) * noiseScale * (xMax - xMin)
    y += (Math.random() - 0.5) * noiseScale * (yMax - yMin)

    // Apply stereographic projection if enabled
    if (enableStereographic) {
      const projected = transformPointStereographic(
        { x, y, z: value * 2 - 1 }, // Normalize value to -1 to 1 for Z
        stereographicPerspective,
      )
      x = projected.x
      y = projected.y
      // Value remains the same for coloring, or could be adjusted based on depth
    }

    points.push({ x, y, value })
  }

  // Generate connections (simplified: connect random nearby points)
  // This is a very basic connection logic. For complex patterns,
  // you'd need more sophisticated algorithms (e.g., Delaunay triangulation, k-NN).
  for (let i = 0; i < numSamples / 100; i++) {
    const p1 = points[Math.floor(Math.random() * points.length)]
    const p2 = points[Math.floor(Math.random() * points.length)]
    if (p1 && p2) {
      connections.push({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y })
    }
  }

  return { points, connections }
}

export function generateStereographicProjection(point: Vector3, perspective: "little-planet" | "tunnel"): Vector2 {
  const center = new Vector3(0, 0, 0)
  if (perspective === "little-planet") {
    return projectLittlePlanet(point, center)
  } else if (perspective === "tunnel") {
    return projectTunnel(point, center)
  }
  return new Vector2(0, 0) // Should not happen
}
