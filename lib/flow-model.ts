// lib/flow-model.ts
import * as d3 from "d3"

export type DatasetType =
  | "lissajous"
  | "mandelbrot"
  | "julia"
  | "sierpinski"
  | "fern"
  | "neural_network"
  | "moon_phases"
  | "checkerboard"
  | "spiral_galaxy"
  | "dna_helix"
  | "wave_interference"
  | "crystal_lattice"

export type ColorSchemeType =
  | "viridis"
  | "plasma"
  | "inferno"
  | "magma"
  | "cividis"
  | "rainbow"
  | "grayscale"
  | "neon"
  | "pastel"
  | "monochrome"

export type ScenarioType =
  | "none"
  | "enchanted_forest"
  | "deep_ocean"
  | "cosmic_nebula"
  | "cyberpunk_city"
  | "ancient_temple"
  | "crystal_cave"
  | "aurora_borealis"
  | "volcanic_landscape"
  | "neural_connections"
  | "quantum_realm"
  | "steampunk_workshop"
  | "underwater_city"
  | "space_station"
  | "mystical_portal"

export interface FlowArtSettings {
  dataset: DatasetType
  colorScheme: ColorSchemeType
  samples: number
  noise: number
  seed: number
  generationMode: "svg" | "ai"
  scenario: ScenarioType
  aiPrompt?: string
  aiNegativePrompt?: string
  scenarioThreshold: number
}

export interface FlowArtData {
  paths: string[]
  colors: string[]
  width: number
  height: number
}

export const defaultFlowArtSettings: FlowArtSettings = {
  dataset: "lissajous",
  colorScheme: "viridis",
  samples: 1000,
  noise: 0.1,
  seed: Math.floor(Math.random() * 100000),
  generationMode: "svg",
  scenario: "none",
  scenarioThreshold: 50,
}

export const datasets = [
  { value: "lissajous", label: "Lissajous Curves" },
  { value: "mandelbrot", label: "Mandelbrot Set" },
  { value: "julia", label: "Julia Set" },
  { value: "sierpinski", label: "Sierpinski Triangle" },
  { value: "fern", label: "Barnsley Fern" },
  { value: "neural_network", label: "Neural Network" },
  { value: "moon_phases", label: "Moon Phases" },
  { value: "checkerboard", label: "Checkerboard Pattern" },
  { value: "spiral_galaxy", label: "Spiral Galaxy" },
  { value: "dna_helix", label: "DNA Helix" },
  { value: "wave_interference", label: "Wave Interference" },
  { value: "crystal_lattice", label: "Crystal Lattice" },
]

export const colorSchemes = [
  { value: "viridis", label: "Viridis" },
  { value: "plasma", label: "Plasma" },
  { value: "inferno", label: "Inferno" },
  { value: "magma", label: "Magma" },
  { value: "cividis", label: "Cividis" },
  { value: "rainbow", label: "Rainbow" },
  { value: "grayscale", label: "Grayscale" },
  { value: "neon", label: "Neon" },
  { value: "pastel", label: "Pastel" },
  { value: "monochrome", label: "Monochrome" },
]

export const scenarios = [
  { value: "none", label: "None (Pure Mathematical)" },
  { value: "enchanted_forest", label: "Enchanted Forest" },
  { value: "deep_ocean", label: "Deep Ocean" },
  { value: "cosmic_nebula", label: "Cosmic Nebula" },
  { value: "cyberpunk_city", label: "Cyberpunk City" },
  { value: "ancient_temple", label: "Ancient Temple" },
  { value: "crystal_cave", label: "Crystal Cave" },
  { value: "aurora_borealis", label: "Aurora Borealis" },
  { value: "volcanic_landscape", label: "Volcanic Landscape" },
  { value: "neural_connections", label: "Neural Connections" },
  { value: "quantum_realm", label: "Quantum Realm" },
  { value: "steampunk_workshop", label: "Steampunk Workshop" },
  { value: "underwater_city", label: "Underwater City" },
  { value: "space_station", label: "Space Station" },
  { value: "mystical_portal", label: "Mystical Portal" },
]

// Enhanced dataset generator with all patterns
export function generateDataset(datasetType: DatasetType, seed: number, numSamples: number, noise: number) {
  const data = []
  const random = (s: number) => {
    const x = Math.sin(s) * 10000
    return x - Math.floor(x)
  }

  for (let i = 0; i < numSamples; i++) {
    const t = (i / numSamples) * 2 * Math.PI
    let x = 0
    let y = 0

    switch (datasetType) {
      case "lissajous":
        x = Math.sin(2 * t + seed * 0.01) + noise * (random(i * 10 + seed) - 0.5)
        y = Math.cos(3 * t + seed * 0.01) + noise * (random(i * 20 + seed) - 0.5)
        break

      case "mandelbrot":
        // Simplified representation for visualization
        x = Math.sin(t) * (1 + noise * (random(i * 10 + seed) - 0.5))
        y = Math.cos(t) * (1 + noise * (random(i * 20 + seed) - 0.5))
        break

      case "julia":
        // Simplified representation for visualization
        x = Math.sin(t * 1.5) * (1 + noise * (random(i * 15 + seed) - 0.5))
        y = Math.cos(t * 2.5) * (1 + noise * (random(i * 25 + seed) - 0.5))
        break

      case "sierpinski":
        // Simplified representation for visualization
        const p = random(i + seed)
        if (p < 0.33) {
          x = 0.5 * x
          y = 0.5 * y
        } else if (p < 0.66) {
          x = 0.5 * x + 0.5
          y = 0.5 * y
        } else {
          x = 0.5 * x + 0.25
          y = 0.5 * y + 0.5
        }
        x += noise * (random(i * 30 + seed) - 0.5)
        y += noise * (random(i * 40 + seed) - 0.5)
        break

      case "fern":
        // Simplified representation for visualization
        const r = random(i + seed)
        let nextX = 0
        let nextY = 0
        if (r <= 0.01) {
          nextX = 0
          nextY = 0.16 * y
        } else if (r <= 0.86) {
          nextX = 0.85 * x + 0.04 * y
          nextY = -0.04 * x + 0.85 * y + 1.6
        } else if (r <= 0.93) {
          nextX = 0.2 * x - 0.26 * y
          nextY = 0.23 * x + 0.22 * y + 1.6
        } else {
          nextX = -0.15 * x + 0.28 * y
          nextY = 0.26 * x + 0.24 * y + 0.44
        }
        x = nextX + noise * (random(i * 50 + seed) - 0.5)
        y = nextY + noise * (random(i * 60 + seed) - 0.5)
        break

      case "neural_network":
        // Neural network-like connections
        const layer = Math.floor(i / (numSamples / 5))
        const nodeInLayer = i % (numSamples / 5)
        x = layer * 0.4 + noise * (random(i * 70 + seed) - 0.5)
        y = (nodeInLayer / (numSamples / 5)) * 2 - 1 + noise * (random(i * 80 + seed) - 0.5)
        break

      case "moon_phases":
        // Moon phase pattern
        const phase = (t + seed * 0.01) % (2 * Math.PI)
        const radius = 0.8 + 0.2 * Math.sin(phase * 4)
        x = radius * Math.cos(t) + noise * (random(i * 90 + seed) - 0.5)
        y = radius * Math.sin(t) + noise * (random(i * 100 + seed) - 0.5)
        break

      case "checkerboard":
        // Checkerboard pattern
        const gridSize = 8
        const gridX = Math.floor((t / (2 * Math.PI)) * gridSize)
        const gridY = Math.floor(random(i + seed) * gridSize)
        x = (gridX / gridSize) * 2 - 1 + noise * (random(i * 110 + seed) - 0.5)
        y = (gridY / gridSize) * 2 - 1 + noise * (random(i * 120 + seed) - 0.5)
        break

      case "spiral_galaxy":
        // Spiral galaxy pattern
        const spiralRadius = t * 0.1
        const spiralAngle = t * 3 + seed * 0.01
        x = spiralRadius * Math.cos(spiralAngle) + noise * (random(i * 130 + seed) - 0.5)
        y = spiralRadius * Math.sin(spiralAngle) + noise * (random(i * 140 + seed) - 0.5)
        break

      case "dna_helix":
        // DNA double helix pattern
        const helixRadius = 0.5
        x = helixRadius * Math.cos(t * 4 + seed * 0.01) + noise * (random(i * 150 + seed) - 0.5)
        y = t * 0.3 + helixRadius * Math.sin(t * 4 + Math.PI + seed * 0.01) + noise * (random(i * 160 + seed) - 0.5)
        break

      case "wave_interference":
        // Wave interference pattern
        const wave1 = Math.sin(t * 2 + seed * 0.01)
        const wave2 = Math.sin(t * 3 + seed * 0.02)
        x = t * 0.3 + noise * (random(i * 170 + seed) - 0.5)
        y = (wave1 + wave2) * 0.5 + noise * (random(i * 180 + seed) - 0.5)
        break

      case "crystal_lattice":
        // Crystal lattice structure
        const latticeX = Math.floor(t * 3) % 3
        const latticeY = Math.floor(random(i + seed) * 3)
        x = latticeX * 0.6 - 0.6 + noise * (random(i * 190 + seed) - 0.5)
        y = latticeY * 0.6 - 0.6 + noise * (random(i * 200 + seed) - 0.5)
        break
    }

    data.push({ x, y })
  }

  return data
}

export async function generateFlowArt(prompt: string, width = 800, height = 600): Promise<FlowArtData> {
  // Simple flow field generation based on prompt
  const paths: string[] = []
  const colors: string[] = []

  const numPaths = 50 + Math.floor(Math.random() * 100)

  for (let i = 0; i < numPaths; i++) {
    const path = generateFlowPath(width, height)
    const color = generateColor(prompt, i)

    paths.push(path)
    colors.push(color)
  }

  return {
    paths,
    colors,
    width,
    height,
  }
}

function generateFlowPath(width: number, height: number): string {
  const points: [number, number][] = []

  let x = Math.random() * width
  let y = Math.random() * height

  const numPoints = 20 + Math.floor(Math.random() * 30)

  for (let i = 0; i < numPoints; i++) {
    points.push([x, y])

    // Simple flow field simulation
    const angle = (x / width + y / height) * Math.PI * 4
    const step = 5 + Math.random() * 10

    x += Math.cos(angle) * step
    y += Math.sin(angle) * step

    // Wrap around edges
    x = ((x % width) + width) % width
    y = ((y % height) + height) % height
  }

  const line = d3.line().curve(d3.curveCatmullRom)
  return line(points) || ""
}

function generateColor(prompt: string, index: number): string {
  // Generate colors based on prompt characteristics
  const hue = (prompt.length * 137.5 + index * 25) % 360
  const saturation = 60 + Math.random() * 40
  const lightness = 40 + Math.random() * 30

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}
