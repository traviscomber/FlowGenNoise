import { createNoise2D } from "simplex-noise"
import alea from "alea"

interface FlowFieldParams {
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

interface Point {
  x: number
  y: number
  z: number
  color: string
  originalX: number
  originalY: number
  originalZ: number
}

export function generateFlowField(params: FlowFieldParams): Point[] {
  const {
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
  } = params

  const prng = alea(seed)
  const noise2D = createNoise2D(prng)

  const points: Point[] = []

  for (let i = 0; i < numSamples; i++) {
    let x, y, z
    let color = "#FFFFFF" // Default color

    // Generate points based on dataset
    switch (dataset) {
      case "mandelbrot":
        ;[x, y, z, color] = generateMandelbrotPoint(prng, noise2D, width, height, depth, scenario, colorScheme)
        break
      case "julia":
        ;[x, y, z, color] = generateJuliaPoint(prng, noise2D, width, height, depth, scenario, colorScheme)
        break
      case "lorenz":
        ;[x, y, z, color] = generateLorenzPoint(prng, noise2D, width, height, depth, scenario, colorScheme)
        break
      case "sierpinski":
        ;[x, y, z, color] = generateSierpinskiPoint(prng, noise2D, width, height, depth, scenario, colorScheme)
        break
      default:
        // Fallback to random points if dataset is unknown
        x = prng() * width
        y = prng() * height
        z = prng() * depth
        color = getColor(prng(), colorScheme)
    }

    // Apply noise to coordinates
    x += noise2D(x * noiseScale, y * noiseScale) * 50
    y += noise2D(y * noiseScale, z * noiseScale) * 50
    z += noise2D(z * noiseScale, x * noiseScale) * 50

    // Apply stereographic projection if enabled
    if (enableStereographic) {
      ;[x, y, z] = applyStereographicProjection(x, y, z, width, height, depth, stereographicPerspective)
    }

    points.push({ x, y, z, color, originalX: x, originalY: y, originalZ: z })
  }

  return points
}

function generateMandelbrotPoint(
  prng: () => number,
  noise2D: (x: number, y: number) => number,
  width: number,
  height: number,
  depth: number,
  scenario: string,
  colorScheme: string,
): [number, number, number, string] {
  let x = 0,
    y = 0,
    iter = 0
  const maxIter = 100
  const zoom = 200 // Adjust zoom for detail
  const offsetX = width / 2
  const offsetY = height / 2

  let cx = prng() * 3.5 - 2.5 + noise2D(prng() * 10, prng() * 10) * 0.1 // Real part of C
  let cy = prng() * 2.5 - 1.25 + noise2D(prng() * 10, prng() * 10) * 0.1 // Imaginary part of C

  // Apply scenario effects
  if (scenario === "zoom") {
    // Focus on a specific interesting part of the Mandelbrot set
    cx = -0.743643887037151 + (prng() * 0.001 - 0.0005) // Slightly vary around a known point
    cy = 0.13182590420533 + (prng() * 0.001 - 0.0005)
  } else if (scenario === "rotate") {
    const angle = prng() * Math.PI * 2
    const tempCx = cx * Math.cos(angle) - cy * Math.sin(angle)
    const tempCy = cx * Math.sin(angle) + cy * Math.cos(angle)
    cx = tempCx
    cy = tempCy
  } else if (scenario === "morph") {
    // Morphing effect by blending C values
    const targetCx = -0.1
    const targetCy = 0.65
    const blend = prng()
    cx = cx * (1 - blend) + targetCx * blend
    cy = cy * (1 - blend) + targetCy * blend
  } else if (scenario === "fractal-walk") {
    // Simulate walking through the fractal by small random steps
    cx += (prng() - 0.5) * 0.01
    cy += (prng() - 0.5) * 0.01
  }

  for (let i = 0; i < maxIter; i++) {
    const x2 = x * x
    const y2 = y * y
    if (x2 + y2 > 4) break
    y = 2 * x * y + cy
    x = x2 - y2 + cx
    iter = i
  }

  const mappedX = x * zoom + offsetX
  const mappedY = y * zoom + offsetY
  const mappedZ = (iter / maxIter) * depth // Z based on iteration count

  const color = getColor(iter / maxIter, colorScheme)
  return [mappedX, mappedY, mappedZ, color]
}

function generateJuliaPoint(
  prng: () => number,
  noise2D: (x: number, y: number) => number,
  width: number,
  height: number,
  depth: number,
  scenario: string,
  colorScheme: string,
): [number, number, number, string] {
  let x = prng() * 4 - 2 + noise2D(prng() * 10, prng() * 10) * 0.1
  let y = prng() * 4 - 2 + noise2D(prng() * 10, prng() * 10) * 0.1
  let iter = 0
  const maxIter = 100
  const zoom = 100
  const offsetX = width / 2
  const offsetY = height / 2

  let cx = -0.70176 // Fixed C for Julia set
  let cy = -0.3842

  // Apply scenario effects
  if (scenario === "zoom") {
    // Focus on a specific interesting part
    x = prng() * 0.5 - 0.25
    y = prng() * 0.5 - 0.25
  } else if (scenario === "rotate") {
    const angle = prng() * Math.PI * 2
    const tempCx = cx * Math.cos(angle) - cy * Math.sin(angle)
    const tempCy = cx * Math.sin(angle) + cy * Math.cos(angle)
    cx = tempCx
    cy = tempCy
  } else if (scenario === "morph") {
    // Morphing C value
    const targetCx = 0.285
    const targetCy = 0.01
    const blend = prng()
    cx = cx * (1 - blend) + targetCx * blend
    cy = cy * (1 - blend) + targetCy * blend
  } else if (scenario === "fractal-walk") {
    x += (prng() - 0.5) * 0.05
    y += (prng() - 0.5) * 0.05
  }

  for (let i = 0; i < maxIter; i++) {
    const x2 = x * x
    const y2 = y * y
    if (x2 + y2 > 4) break
    y = 2 * x * y + cy
    x = x2 - y2 + cx
    iter = i
  }

  const mappedX = x * zoom + offsetX
  const mappedY = y * zoom + offsetY
  const mappedZ = (iter / maxIter) * depth

  const color = getColor(iter / maxIter, colorScheme)
  return [mappedX, mappedY, mappedZ, color]
}

function generateLorenzPoint(
  prng: () => number,
  noise2D: (x: number, y: number) => number,
  width: number,
  height: number,
  depth: number,
  scenario: string,
  colorScheme: string,
): [number, number, number, string] {
  let x = prng() * 20 - 10
  let y = prng() * 20 - 10
  let z = prng() * 30 - 15

  const dt = 0.01
  const sigma = 10
  const rho = 28
  const beta = 8 / 3

  // Apply scenario effects
  if (scenario === "zoom") {
    // Start closer to the attractor
    x = (prng() * 2 - 1) * 0.1
    y = (prng() * 2 - 1) * 0.1
    z = (prng() * 2 - 1) * 0.1 + 25
  } else if (scenario === "rotate") {
    const angle = prng() * Math.PI * 2
    const tempX = x * Math.cos(angle) - y * Math.sin(angle)
    const tempY = x * Math.sin(angle) + y * Math.cos(angle)
    x = tempX
    y = tempY
  } else if (scenario === "morph") {
    // Morphing parameters
    const targetSigma = 15
    const targetRho = 35
    const blend = prng()
    const currentSigma = sigma * (1 - blend) + targetSigma * blend
    const currentRho = rho * (1 - blend) + targetRho * blend

    const dx = currentSigma * (y - x) * dt
    const dy = (x * (currentRho - z) - y) * dt
    const dz = (x * y - beta * z) * dt
    x += dx
    y += dy
    z += dz
  } else if (scenario === "fractal-walk") {
    // Simulate a walk by taking multiple small steps
    for (let k = 0; k < 5; k++) {
      const dx = sigma * (y - x) * dt
      const dy = (x * (rho - z) - y) * dt
      const dz = (x * y - beta * z) * dt
      x += dx
      y += dy
      z += dz
    }
  }

  const dx = sigma * (y - x) * dt
  const dy = (x * (rho - z) - y) * dt
  const dz = (x * y - beta * z) * dt

  x += dx
  y += dy
  z += dz

  const mappedX = (x + 25) * (width / 50)
  const mappedY = (y + 25) * (height / 50)
  const mappedZ = (z + 25) * (depth / 50)

  const color = getColor(prng(), colorScheme)
  return [mappedX, mappedY, mappedZ, color]
}

function generateSierpinskiPoint(
  prng: () => number,
  noise2D: (x: number, y: number) => number,
  width: number,
  height: number,
  depth: number,
  scenario: string,
  colorScheme: string,
): [number, number, number, string] {
  const vertices = [
    { x: 0, y: height },
    { x: width / 2, y: 0 },
    { x: width, y: height },
  ]

  let currentX = prng() * width
  let currentY = prng() * height

  const iterations = 1000 // Number of iterations for the chaos game

  // Apply scenario effects
  if (scenario === "zoom") {
    // Focus on the center
    currentX = width / 2 + (prng() - 0.5) * width * 0.1
    currentY = height / 2 + (prng() - 0.5) * height * 0.1
  } else if (scenario === "rotate") {
    const angle = prng() * Math.PI * 2
    const centerX = width / 2
    const centerY = height / 2
    const tempX = currentX - centerX
    const tempY = currentY - centerY
    currentX = tempX * Math.cos(angle) - tempY * Math.sin(angle) + centerX
    currentY = tempX * Math.sin(angle) + tempY * Math.cos(angle) + centerY
  } else if (scenario === "morph") {
    // Morphing by slightly adjusting vertex positions
    vertices[0].x += (prng() - 0.5) * 10
    vertices[1].y += (prng() - 0.5) * 10
    vertices[2].x += (prng() - 0.5) * 10
  } else if (scenario === "fractal-walk") {
    // Simulate a walk by taking multiple small steps
    for (let k = 0; k < 10; k++) {
      const randomIndex = Math.floor(prng() * 3)
      const targetVertex = vertices[randomIndex]
      currentX = (currentX + targetVertex.x) / 2
      currentY = (currentY + targetVertex.y) / 2
    }
  }

  for (let i = 0; i < iterations; i++) {
    const randomIndex = Math.floor(prng() * 3)
    const targetVertex = vertices[randomIndex]
    currentX = (currentX + targetVertex.x) / 2
    currentY = (currentY + targetVertex.y) / 2
  }

  const mappedZ = prng() * depth // Z is random for Sierpinski

  const color = getColor(prng(), colorScheme)
  return [currentX, currentY, mappedZ, color]
}

function getColor(value: number, scheme: string): string {
  // Map value (0-1) to a color based on the scheme
  switch (scheme) {
    case "plasma":
      return `hsl(${value * 360}, 100%, 50%)` // Full spectrum
    case "viridis":
      // Viridis-like gradient (green-blue-yellow)
      const rV = Math.floor(255 * (0.2 + 0.7 * Math.sin(value * Math.PI)))
      const gV = Math.floor(255 * (0.5 + 0.5 * Math.sin(value * Math.PI * 2)))
      const bV = Math.floor(255 * (0.8 + 0.2 * Math.cos(value * Math.PI)))
      return `rgb(${rV},${gV},${bV})`
    case "magma":
      // Magma-like gradient (black-red-orange-yellow-white)
      const rM = Math.floor(255 * Math.min(1, value * 2))
      const gM = Math.floor(255 * Math.max(0, Math.min(1, value * 2 - 0.5)))
      const bM = Math.floor(255 * Math.max(0, Math.min(1, value * 2 - 1)))
      return `rgb(${rM},${gM},${bM})`
    case "cividis":
      // Cividis-like gradient (blue-green-yellow)
      const rC = Math.floor(255 * (0.1 + 0.8 * Math.sin(value * Math.PI * 0.8)))
      const gC = Math.floor(255 * (0.3 + 0.7 * Math.sin(value * Math.PI * 1.2)))
      const bC = Math.floor(255 * (0.9 - 0.8 * Math.sin(value * Math.PI * 0.5)))
      return `rgb(${rC},${gC},${bC})`
    case "rainbow":
      return `hsl(${value * 360}, 100%, 50%)`
    default:
      return `hsl(${value * 360}, 70%, 60%)`
  }
}

function applyStereographicProjection(
  x: number,
  y: number,
  z: number,
  width: number,
  height: number,
  depth: number,
  perspective: "little-planet" | "tunnel",
): [number, number, number] {
  const centerX = width / 2
  const centerY = height / 2
  const centerZ = depth / 2

  // Normalize coordinates to -1 to 1 range relative to the center
  const nx = (x - centerX) / (width / 2)
  const ny = (y - centerY) / (height / 2)
  const nz = (z - centerZ) / (depth / 2)

  let projectedX, projectedY, projectedZ

  if (perspective === "little-planet") {
    // Inverse stereographic projection to map 3D space onto a sphere, then project back to 2D
    // This creates a "little planet" effect
    const r = Math.sqrt(nx * nx + ny * ny + nz * nz)
    if (r === 0) return [centerX, centerY, centerZ] // Avoid division by zero

    const theta = Math.atan2(ny, nx)
    const phi = Math.acos(nz / r)

    // Map spherical coordinates back to a 2D plane for display
    // This is a simplified equirectangular projection for visualization
    projectedX = (theta / (2 * Math.PI)) * width + centerX
    projectedY = (phi / Math.PI) * height + centerY
    projectedZ = r * depth // Depth based on original distance from center
  } else {
    // "Tunnel vision" effect: project points from a sphere onto a plane,
    // where the projection point is at one pole.
    // This creates a distortion that looks like looking down a tunnel.
    const R = 1.0 // Radius of the sphere
    const Pz = R // Projection point at (0, 0, R)

    const denominator = R - nz
    if (denominator === 0) return [centerX, centerY, centerZ] // Avoid division by zero

    projectedX = (R * nx) / denominator
    projectedY = (R * ny) / denominator
    projectedZ = nz // Keep original Z for depth perception

    // Scale back to canvas coordinates
    projectedX = projectedX * (width / 2) + centerX
    projectedY = projectedY * (height / 2) + centerY
    projectedZ = ((projectedZ + R) / (2 * R)) * depth // Normalize Z to 0-depth range
  }

  return [projectedX, projectedY, projectedZ]
}
