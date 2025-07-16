export interface GenerationParams {
  dataset: string
  scenario: string
  seed: number
  numSamples: number
  noiseScale: number
  timeStep: number
}

// Simple noise function for flow field generation
function noise(x: number, y: number, seed: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453
  return (n - Math.floor(n)) * 2 - 1
}

// Generate dataset points based on type
function generateDatasetPoints(dataset: string, numSamples: number, seed: number): Array<[number, number]> {
  const points: Array<[number, number]> = []
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }

  for (let i = 0; i < numSamples; i++) {
    let x: number, y: number

    switch (dataset) {
      case "spirals":
        const t = (i / numSamples) * 4 * Math.PI
        const r = t / (4 * Math.PI)
        x = r * Math.cos(t) * 200 + 256 + (random() - 0.5) * 20
        y = r * Math.sin(t) * 200 + 256 + (random() - 0.5) * 20
        break

      case "moons":
        const angle = random() * Math.PI
        const radius = 100 + (random() - 0.5) * 20
        if (random() > 0.5) {
          x = Math.cos(angle) * radius + 200
          y = Math.sin(angle) * radius + 256
        } else {
          x = Math.cos(angle + Math.PI) * radius + 312
          y = Math.sin(angle + Math.PI) * radius + 256
        }
        break

      case "circles":
        const circleAngle = random() * 2 * Math.PI
        const circleRadius = Math.sqrt(random()) * 80
        x = Math.cos(circleAngle) * circleRadius + 256 + (random() > 0.5 ? 100 : -100)
        y = Math.sin(circleAngle) * circleRadius + 256
        break

      case "blobs":
        const blobAngle = random() * 2 * Math.PI
        const blobRadius = (random() * 0.5 + 0.5) * 120
        x = Math.cos(blobAngle) * blobRadius + 256 + (random() - 0.5) * 100
        y = Math.sin(blobAngle) * blobRadius + 256 + (random() - 0.5) * 100
        break

      case "checkerboard":
        x = Math.floor(random() * 8) * 64 + 32
        y = Math.floor(random() * 8) * 64 + 32
        break

      case "gaussian":
        // Box-Muller transform for Gaussian distribution
        const u1 = random()
        const u2 = random()
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
        const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2)
        x = z0 * 60 + 256
        y = z1 * 60 + 256
        break

      case "grid":
        const gridSize = Math.ceil(Math.sqrt(numSamples))
        const gridX = i % gridSize
        const gridY = Math.floor(i / gridSize)
        x = (gridX / gridSize) * 400 + 56 + (random() - 0.5) * 20
        y = (gridY / gridSize) * 400 + 56 + (random() - 0.5) * 20
        break

      default:
        x = random() * 512
        y = random() * 512
    }

    points.push([Math.max(0, Math.min(512, x)), Math.max(0, Math.min(512, y))])
  }

  return points
}

// Apply scenario-based styling
function getScenarioColors(scenario: string): { colors: string[]; background: string } {
  switch (scenario) {
    case "forest":
      return {
        colors: ["#2d5016", "#4a7c59", "#6b8e23", "#8fbc8f", "#90ee90"],
        background: "#f0fff0",
      }
    case "cosmic":
      return {
        colors: ["#191970", "#4b0082", "#8a2be2", "#9370db", "#ba55d3"],
        background: "#000011",
      }
    case "ocean":
      return {
        colors: ["#006994", "#1e90ff", "#00bfff", "#87ceeb", "#b0e0e6"],
        background: "#f0f8ff",
      }
    case "neural":
      return {
        colors: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7"],
        background: "#2d3436",
      }
    case "fire":
      return {
        colors: ["#8b0000", "#dc143c", "#ff4500", "#ff6347", "#ffa500"],
        background: "#2f1b14",
      }
    case "ice":
      return {
        colors: ["#b0e0e6", "#87ceeb", "#4682b4", "#5f9ea0", "#708090"],
        background: "#f0f8ff",
      }
    case "desert":
      return {
        colors: ["#daa520", "#cd853f", "#d2691e", "#bc8f8f", "#f4a460"],
        background: "#fdf5e6",
      }
    case "sunset":
      return {
        colors: ["#ff7f50", "#ff6347", "#ff4500", "#ffa500", "#ffb347"],
        background: "#ffe4e1",
      }
    case "monochrome":
      return {
        colors: ["#2c2c2c", "#4a4a4a", "#696969", "#808080", "#a9a9a9"],
        background: "#f5f5f5",
      }
    default:
      return {
        colors: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7"],
        background: "#ffffff",
      }
  }
}

export function generateFlowField(params: GenerationParams): string {
  const { dataset, scenario, seed, numSamples, noiseScale, timeStep } = params
  const width = 512
  const height = 512

  // Generate dataset points
  const points = generateDatasetPoints(dataset, numSamples, seed)

  // Get scenario colors
  const { colors, background } = getScenarioColors(scenario)

  // Create SVG paths using flow field
  let svgPaths = ""

  points.forEach((point, index) => {
    const [startX, startY] = point
    let x = startX
    let y = startY
    let path = `M ${x} ${y}`

    // Generate flow field path
    for (let step = 0; step < 50; step++) {
      const angle = noise(x * noiseScale, y * noiseScale, seed + index) * Math.PI * 2
      const dx = Math.cos(angle) * timeStep * 100
      const dy = Math.sin(angle) * timeStep * 100

      x += dx
      y += dy

      // Keep within bounds
      if (x < 0 || x > width || y < 0 || y > height) break

      path += ` L ${x} ${y}`
    }

    const color = colors[index % colors.length]
    const opacity = 0.3 + (index % 3) * 0.2

    svgPaths += `<path d="${path}" stroke="${color}" stroke-width="1" fill="none" opacity="${opacity}" />\n`
  })

  return `
    <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" fill="${background}" />
      ${svgPaths}
    </svg>
  `
}
