import type { FlowFieldPoint } from "./flow-model"

// Complex number class for Mandelbrot/Julia sets
export class Complex {
  constructor(
    public re: number,
    public im: number,
  ) {}

  add(other: Complex): Complex {
    return new Complex(this.re + other.re, this.im + other.im)
  }

  mul(other: Complex): Complex {
    return new Complex(this.re * other.re - this.im * other.im, this.re * other.im + this.im * other.re)
  }

  magSq(): number {
    return this.re * this.re + this.im * this.im
  }
}

// Mandelbrot set iteration
export function mandelbrot(c: Complex, maxIterations = 100): number {
  let z = new Complex(0, 0)
  let n = 0
  while (z.magSq() <= 4 && n < maxIterations) {
    z = z.mul(z).add(c)
    n++
  }
  return n / maxIterations // Normalized iteration count
}

// Julia set iteration
export function julia(z: Complex, c: Complex, maxIterations = 100): number {
  let n = 0
  while (z.magSq() <= 4 && n < maxIterations) {
    z = z.mul(z).add(c)
    n++
  }
  return n / maxIterations // Normalized iteration count
}

// Lorenz Attractor (simplified for plotting points)
export function lorenz(
  x: number,
  y: number,
  z: number,
  dt = 0.01,
  sigma = 10,
  rho = 28,
  beta: number = 8 / 3,
): { x: number; y: number; z: number } {
  const dx = sigma * (y - x)
  const dy = x * (rho - z) - y
  const dz = x * y - beta * z
  return {
    x: x + dx * dt,
    y: y + dy * dt,
    z: z + dz * dt,
  }
}

// Sierpinski Triangle (Chaos Game)
export function sierpinski(
  point: { x: number; y: number },
  vertices: { x: number; y: number }[],
): { x: number; y: number } {
  const randomIndex = Math.floor(Math.random() * vertices.length)
  const targetVertex = vertices[randomIndex]
  return {
    x: (point.x + targetVertex.x) / 2,
    y: (point.y + targetVertex.y) / 2,
  }
}

// Stereographic Projection
export function transformPointStereographic(
  point: { x: number; y: number; z: number },
  perspective: "little-planet" | "tunnel",
): { x: number; y: number } {
  const { x, y, z } = point

  // Normalize coordinates to a sphere of radius 1
  // Assuming x, y, z are already somewhat normalized or within a reasonable range
  // For mathematical art, we might map the input space to a sphere.
  // Let's assume input x, y are in [-1, 1] and z is depth/value in [-1, 1]
  const radius = 1
  const sx = x * radius
  const sy = y * radius
  const sz = z * radius

  let projectedX: number, projectedY: number

  if (perspective === "little-planet") {
    // Project from the North Pole (0,0,1) onto the z=0 plane
    // P' = (x / (1 - z), y / (1 - z))
    const divisor = 1 - sz
    if (divisor === 0) {
      // Handle the North Pole point itself, project to origin or infinity
      projectedX = 0
      projectedY = 0
    } else {
      projectedX = sx / divisor
      projectedY = sy / divisor
    }
  } else {
    // "Tunnel vision" effect: project from a point on the positive X axis (e.g., (1,0,0))
    // This creates a distortion that pulls points towards a central vanishing point.
    // A common way to achieve a tunnel effect is to project onto a cylinder or use a different perspective.
    // For a simple "tunnel" effect, we can project from a point on the sphere's surface
    // and map to a plane perpendicular to the projection direction.
    // Let's project from (0,0,-1) (South Pole) onto the z=0 plane for an "inside-out" tunnel.
    // P' = (x / (1 + z), y / (1 + z))
    const divisor = 1 + sz
    if (divisor === 0) {
      // Handle the South Pole point itself
      projectedX = 0
      projectedY = 0
    } else {
      projectedX = sx / divisor
      projectedY = sy / divisor
    }
  }

  // Scale and center the projected points for display
  // Assuming the output needs to fit within a [0, 1] or [-1, 1] range for plotting
  // These scaling factors might need adjustment based on the actual output range of projectedX/Y
  const scaleFactor = 0.5 // Adjust as needed to fit the canvas
  return { x: projectedX * scaleFactor, y: projectedY * scaleFactor }
}

export function drawFlowField(
  ctx: CanvasRenderingContext2D,
  points: FlowFieldPoint[],
  width: number,
  height: number,
  showConnections: boolean,
  showGrid: boolean,
) {
  ctx.clearRect(0, 0, width, height)

  // Sort points by depth for correct rendering order (far to near)
  points.sort((a, b) => a.depth - b.depth)

  // Draw grid if enabled
  if (showGrid) {
    drawGrid(ctx, width, height)
  }

  // Draw connections if enabled
  if (showConnections) {
    drawConnections(ctx, points, width, height)
  }

  // Draw points
  for (const point of points) {
    const x = point.position.x + width / 2
    const y = point.position.y + height / 2
    const size = 2 + point.depth * 2 // Scale size by depth for perspective

    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fillStyle = point.color
    ctx.fill()
  }
}

function drawConnections(ctx: CanvasRenderingContext2D, points: FlowFieldPoint[], width: number, height: number) {
  ctx.strokeStyle = "rgba(150, 150, 150, 0.2)"
  ctx.lineWidth = 0.5

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const p1 = points[i]
      const p2 = points[j]

      const dist = p1.position.distanceTo(p2.position)
      if (dist < 50) {
        // Only connect close points
        ctx.beginPath()
        ctx.moveTo(p1.position.x + width / 2, p1.position.y + height / 2)
        ctx.lineTo(p2.position.x + width / 2, p2.position.y + height / 2)
        ctx.stroke()
      }
    }
  }
}

function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.strokeStyle = "rgba(200, 200, 200, 0.1)"
  ctx.lineWidth = 0.5

  const gridSize = 50 // pixels per grid cell

  // Vertical lines
  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  // Horizontal lines
  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
}

// Function to convert points and connections to SVG
export function plotPointsToSVG(
  points: { x: number; y: number; value: number }[],
  connections: { x1: number; y1: number; x2: number; y2: number }[],
  colorScheme: string,
  width = 1000,
  height = 1000,
): string {
  // Find min/max coordinates to normalize to SVG viewbox
  let minX = Number.POSITIVE_INFINITY,
    maxX = Number.NEGATIVE_INFINITY,
    minY = Number.POSITIVE_INFINITY,
    maxY = Number.NEGATIVE_INFINITY

  points.forEach((p) => {
    minX = Math.min(minX, p.x)
    maxX = Math.max(maxX, p.x)
    minY = Math.min(minY, p.y)
    maxY = Math.max(maxY, p.y)
  })

  connections.forEach((c) => {
    minX = Math.min(minX, c.x1, c.x2)
    maxX = Math.max(maxX, c.x1, c.x2)
    minY = Math.min(minY, c.y1, c.y2)
    maxY = Math.max(maxY, c.y1, c.y2)
  })

  // Add some padding
  const padding = 0.1 * Math.max(maxX - minX, maxY - minY)
  minX -= padding
  maxX += padding
  minY -= padding
  maxY += padding

  const viewBoxWidth = maxX - minX
  const viewBoxHeight = maxY - minY

  // Function to map a value (0-1) to a color from a scheme
  const getColor = (value: number): string => {
    // Simple color schemes (can be expanded)
    switch (colorScheme) {
      case "plasma":
        // Example: simple gradient from blue to red
        const r = Math.floor(255 * value)
        const b = Math.floor(255 * (1 - value))
        return `rgb(${r}, 0, ${b})`
      case "viridis":
        // A more complex, perceptually uniform colormap
        // This is a simplified approximation. Real Viridis is more complex.
        const vR = Math.floor(255 * (0.2 + 0.7 * value))
        const vG = Math.floor(255 * (0.9 - 0.8 * value))
        const vB = Math.floor(255 * (0.1 + 0.6 * value))
        return `rgb(${vR}, ${vG}, ${vB})`
      case "magma":
        const mR = Math.floor(255 * (0.9 * value + 0.1))
        const mG = Math.floor(255 * (0.5 * value + 0.2))
        const mB = Math.floor(255 * (0.1 * value + 0.3))
        return `rgb(${mR}, ${mG}, ${mB})`
      case "cividis":
        const cR = Math.floor(255 * (0.1 + 0.8 * value))
        const cG = Math.floor(255 * (0.7 - 0.6 * value))
        const cB = Math.floor(255 * (0.9 - 0.8 * value))
        return `rgb(${cR}, ${cG}, ${cB})`
      case "rainbow":
        // Simple HSL-based rainbow
        const hue = value * 360
        return `hsl(${hue}, 100%, 50%)`
      default:
        return `hsl(${value * 360}, 70%, 50%)` // Default to a basic hue
    }
  }

  let svgContent = ""

  // Add connections (lines)
  connections.forEach((c) => {
    svgContent += `<line x1="${((c.x1 - minX) / viewBoxWidth) * width}" y1="${((c.y1 - minY) / viewBoxHeight) * height}" x2="${((c.x2 - minX) / viewBoxWidth) * width}" y2="${((c.y2 - minY) / viewBoxHeight) * height}" stroke="rgba(100,100,100,0.1)" stroke-width="0.5" />`
  })

  // Add points (circles)
  points.forEach((p) => {
    const normalizedValue = p.value // Assuming p.value is already normalized 0-1
    const color = getColor(normalizedValue)
    svgContent += `<circle cx="${((p.x - minX) / viewBoxWidth) * width}" cy="${((p.y - minY) / viewBoxHeight) * height}" r="1.5" fill="${color}" />`
  })

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">${svgContent}</svg>`
}
