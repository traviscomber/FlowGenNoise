import { createNoise2D } from "simplex-noise"
import { plotPointsToSvg } from "./plot-utils"

interface FlowArtOptions {
  dataset: "mandelbrot" | "julia" | "lorenz" | "sierpinski"
  scenario: "zoom" | "rotate" | "morph" | "fractal-walk"
  colorScheme: "plasma" | "viridis" | "magma" | "cividis" | "rainbow"
  numSamples: number
  noiseScale: number
  enableStereographic: boolean
  stereographicPerspective: "little-planet" | "tunnel"
}

export function generateFlowArt(options: FlowArtOptions): string {
  const { dataset, scenario, colorScheme, numSamples, noiseScale, enableStereographic, stereographicPerspective } =
    options

  let points: { x: number; y: number }[] = []

  // Generate base points based on dataset
  switch (dataset) {
    case "mandelbrot":
      points = generateMandelbrotPoints(numSamples)
      break
    case "julia":
      points = generateJuliaPoints(numSamples)
      break
    case "lorenz":
      points = generateLorenzAttractorPoints(numSamples)
      break
    case "sierpinski":
      points = generateSierpinskiTrianglePoints(numSamples)
      break
    default:
      points = generateMandelbrotPoints(numSamples)
  }

  // Apply scenario transformations
  points = applyScenario(points, scenario)

  // Apply noise for organic feel
  points = applyNoise(points, noiseScale)

  // Apply stereographic projection if enabled
  if (enableStereographic) {
    points = applyStereographicProjection(points, stereographicPerspective)
  }

  // Plot points to SVG with color scheme
  return plotPointsToSvg(points, colorScheme)
}

function generateMandelbrotPoints(num: number): { x: number; y: number }[] {
  const points = []
  for (let i = 0; i < num; i++) {
    const x0 = Math.random() * 3.5 - 2.5 // x from -2.5 to 1
    const y0 = Math.random() * 2 - 1 // y from -1 to 1
    let x = 0.0
    let y = 0.0
    let iteration = 0
    const maxIteration = 100

    while (x * x + y * y < 4 && iteration < maxIteration) {
      const xtemp = x * x - y * y + x0
      y = 2 * x * y + y0
      x = xtemp
      iteration++
    }
    if (iteration < maxIteration) {
      points.push({ x: x0, y: y0 })
    }
  }
  return points
}

function generateJuliaPoints(num: number): { x: number; y: number }[] {
  const points = []
  const cx = -0.7
  const cy = 0.27015
  for (let i = 0; i < num; i++) {
    let x = Math.random() * 4 - 2
    let y = Math.random() * 4 - 2
    let iteration = 0
    const maxIteration = 100

    while (x * x + y * y < 4 && iteration < maxIteration) {
      const xtemp = x * x - y * y + cx
      y = 2 * x * y + cy
      x = xtemp
      iteration++
    }
    if (iteration < maxIteration) {
      points.push({ x, y })
    }
  }
  return points
}

function generateLorenzAttractorPoints(num: number): { x: number; y: number }[] {
  const points = []
  let x = 0.01,
    y = 0,
    z = 0
  const sigma = 10,
    rho = 28,
    beta = 8 / 3
  const dt = 0.01

  for (let i = 0; i < num; i++) {
    const dx = sigma * (y - x) * dt
    const dy = (x * (rho - z) - y) * dt
    const dz = (x * y - beta * z) * dt
    x += dx
    y += dy
    z += dz
    points.push({ x: x / 30, y: y / 30 }) // Normalize for plotting
  }
  return points
}

function generateSierpinskiTrianglePoints(num: number): { x: number; y: number }[] {
  const points = []
  const vertices = [
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 0.5, y: 0 },
  ]
  let currentPoint = { x: Math.random(), y: Math.random() }

  for (let i = 0; i < num; i++) {
    const randomIndex = Math.floor(Math.random() * 3)
    const targetVertex = vertices[randomIndex]
    currentPoint = {
      x: (currentPoint.x + targetVertex.x) / 2,
      y: (currentPoint.y + targetVertex.y) / 2,
    }
    points.push(currentPoint)
  }
  return points
}

function applyScenario(
  points: { x: number; y: number }[],
  scenario: FlowArtOptions["scenario"],
): { x: number; y: number }[] {
  return points.map((p) => {
    switch (scenario) {
      case "zoom":
        return { x: p.x * 1.5, y: p.y * 1.5 }
      case "rotate":
        const angle = Math.PI / 4 // 45 degrees
        return {
          x: p.x * Math.cos(angle) - p.y * Math.sin(angle),
          y: p.x * Math.sin(angle) + p.y * Math.cos(angle),
        }
      case "morph":
        // Simple morph: stretch x, compress y
        return { x: p.x * 2, y: p.y * 0.5 }
      case "fractal-walk":
        // Simulate a slight random walk for each point
        return { x: p.x + (Math.random() - 0.5) * 0.1, y: p.y + (Math.random() - 0.5) * 0.1 }
      default:
        return p
    }
  })
}

function applyNoise(points: { x: number; y: number }[], noiseScale: number): { x: number; y: number }[] {
  const noise2D = createNoise2D()
  return points.map((p, i) => {
    const nx = noise2D(p.x * noiseScale, p.y * noiseScale)
    const ny = noise2D(p.y * noiseScale, p.x * noiseScale)
    return {
      x: p.x + nx * 0.1, // Apply small displacement based on noise
      y: p.y + ny * 0.1,
    }
  })
}

function applyStereographicProjection(
  points: { x: number; y: number }[],
  perspective: FlowArtOptions["stereographicPerspective"],
): { x: number; y: number }[] {
  // Normalize points to a sphere-like range, e.g., -1 to 1
  const normalizedPoints = points.map((p) => ({
    x: ((p.x - -2) / (2 - -2)) * 2 - 1, // Assuming original x range -2 to 2
    y: ((p.y - -2) / (2 - -2)) * 2 - 1, // Assuming original y range -2 to 2
  }))

  return normalizedPoints.map((p) => {
    const x = p.x
    const y = p.y
    let projectedX, projectedY

    if (perspective === "little-planet") {
      // Inverse stereographic projection for "little planet" effect
      // Treat (x,y) as points on a plane, project to sphere, then project back from south pole
      const r = Math.sqrt(x * x + y * y)
      const theta = Math.atan2(y, x)

      // Map r to a sphere's latitude (e.g., 0 to PI)
      const phi = (r * Math.PI) / 2 // Map r from 0-sqrt(2) to 0-PI/2, then scale to 0-PI for full hemisphere

      // Convert spherical to Cartesian (on unit sphere)
      const sx = Math.sin(phi) * Math.cos(theta)
      const sy = Math.sin(phi) * Math.sin(theta)
      const sz = Math.cos(phi)

      // Stereographic projection from North Pole (0,0,1) to z=0 plane
      // (X, Y, Z) -> (X/(1-Z), Y/(1-Z))
      projectedX = sx / (1 - sz)
      projectedY = sy / (1 - sz)

      // Scale and center for visualization
      projectedX = projectedX * 0.5 + 0.5
      projectedY = projectedY * 0.5 + 0.5
    } else {
      // "Tunnel vision" effect (stereographic projection from a point on the plane)
      // This is a more direct stereographic projection from a point on the plane to a sphere,
      // then mapping back to a 2D plane, creating a "fisheye" or "tunnel" effect.
      const d = Math.sqrt(x * x + y * y)
      const scale = 2 / (1 + d * d)
      projectedX = x * scale
      projectedY = y * scale

      // Scale and center for visualization
      projectedX = projectedX * 0.5 + 0.5
      projectedY = projectedY * 0.5 + 0.5
    }

    return { x: projectedX, y: projectedY }
  })
}
