// Mathematical plotting utilities for SVG generation

export interface Point {
  x: number
  y: number
}

export interface PlotConfig {
  width: number
  height: number
  margin: number
  backgroundColor: string
  strokeColor: string
  strokeWidth: number
}

export class MathPlotter {
  private config: PlotConfig

  constructor(config: Partial<PlotConfig> = {}) {
    this.config = {
      width: 800,
      height: 800,
      margin: 50,
      backgroundColor: "#000000",
      strokeColor: "#ffffff",
      strokeWidth: 1,
      ...config,
    }
  }

  // Generate Fibonacci spiral points
  generateFibonacciSpiral(numPoints: number, scale = 1): Point[] {
    const points: Point[] = []
    const phi = (1 + Math.sqrt(5)) / 2 // Golden ratio

    for (let i = 0; i < numPoints; i++) {
      const angle = (i * 2 * Math.PI) / phi
      const radius = Math.sqrt(i) * scale

      points.push({
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
      })
    }

    return points
  }

  // Generate fractal tree points
  generateFractalTree(depth: number, length: number, angle: number): string {
    if (depth === 0) return ""

    const x1 = 0
    const y1 = 0
    const x2 = length * Math.cos(angle)
    const y2 = length * Math.sin(angle)

    let path = `M ${x1} ${y1} L ${x2} ${y2} `

    if (depth > 1) {
      const newLength = length * 0.7
      const leftAngle = angle + Math.PI / 6
      const rightAngle = angle - Math.PI / 6

      path += `M ${x2} ${y2} ` + this.generateFractalTree(depth - 1, newLength, leftAngle)
      path += `M ${x2} ${y2} ` + this.generateFractalTree(depth - 1, newLength, rightAngle)
    }

    return path
  }

  // Generate Mandelbrot set points
  generateMandelbrotSet(width: number, height: number, maxIterations = 100): Point[] {
    const points: Point[] = []
    const zoom = 1
    const moveX = -0.5
    const moveY = 0

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const zx = (x - width / 2) / (0.5 * zoom * width) + moveX
        const zy = (y - height / 2) / (0.5 * zoom * height) + moveY

        let cx = zx
        let cy = zy
        let i = maxIterations

        while (cx * cx + cy * cy < 4 && i > 0) {
          const tmp = cx * cx - cy * cy + zx
          cy = 2.0 * cx * cy + zy
          cx = tmp
          i--
        }

        if (i > 0) {
          points.push({ x, y })
        }
      }
    }

    return points
  }

  // Generate Lorenz attractor points
  generateLorenzAttractor(numPoints: number, dt = 0.01): Point[] {
    const points: Point[] = []
    const sigma = 10
    const rho = 28
    const beta = 8 / 3

    let x = 1
    let y = 1
    let z = 1

    for (let i = 0; i < numPoints; i++) {
      const dx = sigma * (y - x)
      const dy = x * (rho - z) - y
      const dz = x * y - beta * z

      x += dx * dt
      y += dy * dt
      z += dz * dt

      points.push({ x, y })
    }

    return points
  }

  // Convert points to SVG path
  pointsToPath(points: Point[]): string {
    if (points.length === 0) return ""

    let path = `M ${points[0].x} ${points[0].y}`

    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`
    }

    return path
  }

  // Generate complete SVG
  generateSVG(paths: string[], colors: string[] = []): string {
    const { width, height, backgroundColor } = this.config

    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`
    svg += `<rect width="100%" height="100%" fill="${backgroundColor}"/>`

    paths.forEach((path, index) => {
      const color = colors[index] || this.config.strokeColor
      svg += `<path d="${path}" stroke="${color}" stroke-width="${this.config.strokeWidth}" fill="none"/>`
    })

    svg += "</svg>"
    return svg
  }
}

// Utility functions for mathematical calculations
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function map(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
}

export function noise(x: number, y = 0): number {
  // Simple pseudo-random noise function
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return n - Math.floor(n)
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}
