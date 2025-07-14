// lib/flow-model.ts
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

export interface FlowParameters {
  dataset: DatasetType
  samples: number
  noise: number
  complexity: number
  symmetry: number
  colorVariation: number
  flowIntensity: number
  scenario: ScenarioType
  scenarioThreshold: number
}

export interface DataPoint {
  x: number
  y: number
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

// Enhanced mathematical dataset generator that uses ALL parameters
export function generateDataset(
  datasetType: DatasetType,
  seed: number,
  numSamples: number,
  noise: number,
  complexity = 2,
  symmetry = 0.5,
  flowIntensity = 1.5,
  scenarioThreshold = 50,
): Array<{ x: number; y: number }> {
  // Ensure we always have valid parameters
  const safeSeed = typeof seed === "number" && !isNaN(seed) ? seed : Math.floor(Math.random() * 100000)
  const safeSamples =
    typeof numSamples === "number" && numSamples > 0 ? Math.max(10, Math.min(10000, numSamples)) : 1000
  const safeNoise = typeof noise === "number" && !isNaN(noise) ? Math.max(0, Math.min(1, noise)) : 0.1
  const safeComplexity =
    typeof complexity === "number" && !isNaN(complexity) ? Math.max(0.1, Math.min(10, complexity)) : 2
  const safeSymmetry = typeof symmetry === "number" && !isNaN(symmetry) ? Math.max(0, Math.min(1, symmetry)) : 0.5
  const safeFlowIntensity =
    typeof flowIntensity === "number" && !isNaN(flowIntensity) ? Math.max(0.1, Math.min(5, flowIntensity)) : 1.5
  const safeScenarioThreshold =
    typeof scenarioThreshold === "number" && !isNaN(scenarioThreshold)
      ? Math.max(0, Math.min(100, scenarioThreshold))
      : 50

  console.log("generateDataset called with:", {
    datasetType,
    safeSeed,
    safeSamples,
    safeNoise,
    safeComplexity,
    safeSymmetry,
    safeFlowIntensity,
    safeScenarioThreshold,
  })

  const data: Array<{ x: number; y: number }> = []

  // Seeded random number generator for reproducible results
  const seededRandom = (s: number) => {
    const x = Math.sin(s + safeSeed) * 10000
    return x - Math.floor(x)
  }

  // Initialize variables for iterative patterns
  let x = 0
  let y = 0

  for (let i = 0; i < safeSamples; i++) {
    const t = (i / safeSamples) * 2 * Math.PI
    const normalizedI = i / safeSamples

    // Apply complexity to time parameter - this affects frequency and detail
    const complexTime = t * safeComplexity

    // Apply seed-based variation
    const seedVariation = safeSeed * 0.001
    const tWithSeed = complexTime + seedVariation

    // Apply flow intensity as a scaling factor
    const flowScale = safeFlowIntensity * 0.5

    switch (datasetType) {
      case "lissajous":
        // Complexity affects frequency ratios, Symmetry affects phase relationships
        const freqA = 2 * safeComplexity + (seededRandom(safeSeed * 0.1) - 0.5) * 0.5
        const freqB = 3 * safeComplexity + (seededRandom(safeSeed * 0.2) - 0.5) * 0.5
        const phaseShift = safeSeed * 0.01 + (1 - safeSymmetry) * Math.PI

        x = Math.sin(freqA * tWithSeed + phaseShift) * flowScale + safeNoise * (seededRandom(i * 10 + safeSeed) - 0.5)
        y =
          Math.cos(freqB * tWithSeed + phaseShift * safeSymmetry) * flowScale +
          safeNoise * (seededRandom(i * 20 + safeSeed) - 0.5)
        break

      case "mandelbrot":
        // Complexity affects iteration depth, Symmetry affects the center point
        const cx = -0.7 + (seededRandom(safeSeed * 0.3) - 0.5) * 0.5 * (1 - safeSymmetry)
        const cy = 0.0 + (seededRandom(safeSeed * 0.4) - 0.5) * 0.5 * (1 - safeSymmetry)
        let zx = (normalizedI - 0.5) * 3 * flowScale
        let zy = (seededRandom(i + safeSeed) - 0.5) * 3 * flowScale

        // Complexity determines iteration count
        const iterations = Math.floor(3 + safeComplexity * 2)
        for (let iter = 0; iter < iterations; iter++) {
          const tempX = zx * zx - zy * zy + cx
          zy = 2 * zx * zy + cy
          zx = tempX
        }

        x = zx * 0.3 * flowScale + safeNoise * (seededRandom(i * 30 + safeSeed) - 0.5)
        y = zy * 0.3 * flowScale + safeNoise * (seededRandom(i * 40 + safeSeed) - 0.5)
        break

      case "julia":
        // Julia set with complexity-dependent parameters
        const juliaC = {
          x: -0.4 + (seededRandom(safeSeed * 0.5) - 0.5) * 0.6 * safeComplexity * 0.2,
          y: 0.6 + (seededRandom(safeSeed * 0.6) - 0.5) * 0.4 * safeComplexity * 0.2,
        }
        let jx = (normalizedI - 0.5) * 2.5 * flowScale
        let jy = (seededRandom(i + safeSeed * 2) - 0.5) * 2.5 * flowScale

        // Complexity affects iteration depth
        const juliaIterations = Math.floor(2 + safeComplexity * 1.5)
        for (let iter = 0; iter < juliaIterations; iter++) {
          const tempX = jx * jx - jy * jy + juliaC.x
          jy = 2 * jx * jy + juliaC.y * safeSymmetry
          jx = tempX
        }

        x = jx * 0.4 * flowScale + safeNoise * (seededRandom(i * 50 + safeSeed) - 0.5)
        y = jy * 0.4 * flowScale + safeNoise * (seededRandom(i * 60 + safeSeed) - 0.5)
        break

      case "sierpinski":
        // Sierpinski triangle with complexity affecting vertex selection
        const vertices = [
          { x: 0, y: 1 * flowScale },
          { x: -0.866 * flowScale, y: -0.5 * flowScale },
          { x: 0.866 * flowScale, y: -0.5 * flowScale },
        ]

        if (i === 0) {
          x = seededRandom(safeSeed) - 0.5
          y = seededRandom(safeSeed + 1) - 0.5
        } else {
          // Complexity affects chaos game rules
          const vertexProb = 1 / (1 + safeComplexity * 0.5)
          const vertexIndex = Math.floor(seededRandom(i + safeSeed) * 3)
          const vertex = vertices[vertexIndex]

          // Symmetry affects the convergence rate
          const convergenceRate = 0.5 * (1 + safeSymmetry * 0.3)
          x = (x + vertex.x) * convergenceRate
          y = (y + vertex.y) * convergenceRate
        }

        x += safeNoise * (seededRandom(i * 70 + safeSeed) - 0.5)
        y += safeNoise * (seededRandom(i * 80 + safeSeed) - 0.5)
        break

      case "fern":
        // Barnsley fern with flow intensity affecting growth
        if (i === 0) {
          x = 0
          y = 0
        } else {
          const r = seededRandom(i + safeSeed)
          let nextX, nextY

          // Flow intensity affects the transformation matrices
          const scale = flowScale * 0.8

          if (r <= 0.01) {
            nextX = 0
            nextY = 0.16 * y * scale
          } else if (r <= 0.86) {
            nextX = (0.85 * x + 0.04 * y) * scale
            nextY = (-0.04 * x + 0.85 * y + 1.6) * scale
          } else if (r <= 0.93) {
            nextX = (0.2 * x - 0.26 * y) * scale
            nextY = (0.23 * x + 0.22 * y + 1.6) * scale
          } else {
            nextX = (-0.15 * x + 0.28 * y) * scale
            nextY = (0.26 * x + 0.24 * y + 0.44) * scale
          }

          // Symmetry affects the branching
          if (safeSymmetry > 0.7) {
            nextX *= 1 + (seededRandom(i * 5 + safeSeed) - 0.5) * 0.2
          }

          x = nextX + safeNoise * (seededRandom(i * 90 + safeSeed) - 0.5)
          y = nextY + safeNoise * (seededRandom(i * 100 + safeSeed) - 0.5)
        }
        break

      case "neural_network":
        // Neural network with complexity affecting layer count
        const numLayers = Math.floor(3 + safeComplexity * 2)
        const layer = Math.floor(normalizedI * numLayers)
        const nodeInLayer = (normalizedI * numLayers - layer) * (5 + safeComplexity * 5)

        // Flow intensity affects connection spread
        const connectionSpread = safeFlowIntensity * 0.3

        x =
          (layer / numLayers) * 4 -
          2 +
          connectionSpread * Math.sin(nodeInLayer + seedVariation) +
          safeNoise * (seededRandom(i * 110 + safeSeed) - 0.5)
        y =
          Math.sin(nodeInLayer + seedVariation) * 1.5 * flowScale +
          (1 - safeSymmetry) * Math.cos(nodeInLayer * 2) +
          safeNoise * (seededRandom(i * 120 + safeSeed) - 0.5)
        break

      case "moon_phases":
        // Moon phases with complexity affecting orbital mechanics
        const orbitalPeriod = 2 + safeComplexity * 0.5
        const phase = (tWithSeed * orbitalPeriod) % (2 * Math.PI)
        const radius = (0.8 + 0.3 * Math.sin(phase * 4 + seedVariation)) * flowScale
        const eccentricity = 0.1 + (1 - safeSymmetry) * 0.3

        x =
          radius * (1 + eccentricity * Math.cos(phase)) * Math.cos(tWithSeed) +
          safeNoise * (seededRandom(i * 130 + safeSeed) - 0.5)
        y =
          radius * (1 + eccentricity * Math.cos(phase)) * Math.sin(tWithSeed) +
          safeNoise * (seededRandom(i * 140 + safeSeed) - 0.5)
        break

      case "checkerboard":
        // Dynamic checkerboard with complexity affecting grid resolution
        const gridSize = Math.floor(4 + safeComplexity * 4)
        const gridX = Math.floor(normalizedI * gridSize)
        const gridY = Math.floor(seededRandom(i + safeSeed) * gridSize)
        const checker = (gridX + gridY) % 2

        // Flow intensity affects displacement
        const displacement = checker * 0.1 * safeFlowIntensity

        x = (gridX / gridSize) * 2 - 1 + displacement + safeNoise * (seededRandom(i * 150 + safeSeed) - 0.5)
        y =
          (gridY / gridSize) * 2 -
          1 +
          displacement * safeSymmetry +
          safeNoise * (seededRandom(i * 160 + safeSeed) - 0.5)
        break

      case "spiral_galaxy":
        // Spiral galaxy with complexity affecting arm count and tightness
        const numArms = Math.floor(2 + safeComplexity)
        const armIndex = Math.floor(seededRandom(i + safeSeed * 2) * numArms)
        const armAngle = (armIndex / numArms) * 2 * Math.PI

        const spiralRadius = normalizedI * 2 * flowScale
        const spiralTightness = 3 + safeComplexity
        const spiralAngle = tWithSeed * spiralTightness + armAngle + spiralRadius * 0.5

        // Symmetry affects arm uniformity
        const armVariation = (1 - safeSymmetry) * (seededRandom(i * 3 + safeSeed) - 0.5) * 0.5

        x = spiralRadius * Math.cos(spiralAngle + armVariation) + safeNoise * (seededRandom(i * 170 + safeSeed) - 0.5)
        y = spiralRadius * Math.sin(spiralAngle + armVariation) + safeNoise * (seededRandom(i * 180 + safeSeed) - 0.5)
        break

      case "dna_helix":
        // DNA double helix with complexity affecting pitch and radius
        const helixRadius = (0.5 + safeComplexity * 0.1) * flowScale
        const helixPitch = 4 + safeComplexity
        const strand = Math.floor(seededRandom(i + safeSeed * 3) * 2)
        const strandOffset = strand * Math.PI * safeSymmetry

        x =
          helixRadius * Math.cos(tWithSeed * helixPitch + strandOffset) +
          safeNoise * (seededRandom(i * 190 + safeSeed) - 0.5)
        y = normalizedI * 3 - 1.5 + safeNoise * (seededRandom(i * 200 + safeSeed) - 0.5)

        // Add base pair connections based on complexity
        if (i % Math.floor(20 / safeComplexity) === 0) {
          x += helixRadius * 0.5 * Math.cos(tWithSeed * helixPitch + Math.PI / 2) * safeFlowIntensity
        }
        break

      case "wave_interference":
        // Multiple wave interference with complexity affecting wave count
        const numWaves = Math.floor(2 + safeComplexity * 2)
        let waveSum = 0

        for (let w = 0; w < numWaves; w++) {
          const frequency = (w + 1) * safeComplexity * 0.5 + seededRandom(safeSeed * (1.6 + w * 0.1)) * 2
          const amplitude = (1 / (w + 1)) * flowScale
          const phaseShift = seededRandom(safeSeed * (1.7 + w * 0.1)) * 2 * Math.PI * safeSymmetry
          waveSum += amplitude * Math.sin(frequency * tWithSeed + phaseShift)
        }

        x = normalizedI * 4 - 2 + safeNoise * (seededRandom(i * 210 + safeSeed) - 0.5)
        y = waveSum * 0.8 + safeNoise * (seededRandom(i * 220 + safeSeed) - 0.5)
        break

      case "crystal_lattice":
        // 3D crystal lattice with complexity affecting lattice size
        const latticeSize = Math.floor(3 + safeComplexity * 2)
        const latticeX = Math.floor(normalizedI * latticeSize)
        const latticeY = Math.floor(seededRandom(i + safeSeed * 4) * latticeSize)
        const latticeZ = Math.floor(seededRandom(i + safeSeed * 5) * latticeSize)

        // Flow intensity affects perspective projection
        const perspective = 0.5 + safeFlowIntensity * 0.2

        x =
          (latticeX / latticeSize) * 2 -
          1 +
          (latticeZ / latticeSize) * perspective * flowScale +
          safeNoise * (seededRandom(i * 230 + safeSeed) - 0.5)
        y =
          (latticeY / latticeSize) * 2 -
          1 +
          (latticeZ / latticeSize) * perspective * 0.5 * flowScale * safeSymmetry +
          safeNoise * (seededRandom(i * 240 + safeSeed) - 0.5)
        break

      default:
        // Fallback with all parameters affecting the pattern
        x = (seededRandom(i + safeSeed) - 0.5) * 2 * flowScale * safeComplexity
        y = (seededRandom(i * 2 + safeSeed) - 0.5) * 2 * flowScale * safeSymmetry
        break
    }

    // Apply scenario threshold as a distortion factor
    if (safeScenarioThreshold > 0) {
      const distortionFactor = safeScenarioThreshold / 100
      const distortionX = Math.sin(normalizedI * Math.PI * 4 + safeSeed * 0.01) * distortionFactor * 0.2
      const distortionY = Math.cos(normalizedI * Math.PI * 6 + safeSeed * 0.02) * distortionFactor * 0.2

      x += distortionX
      y += distortionY
    }

    // Ensure x and y are valid numbers
    if (typeof x !== "number" || isNaN(x)) x = 0
    if (typeof y !== "number" || isNaN(y)) y = 0

    data.push({ x, y })
  }

  // Safety: must never return an empty array
  if (data.length === 0) {
    data.push({ x: 0, y: 0 })
  }

  console.log("Generated data points:", data.length, "first few:", data.slice(0, 3))
  return data
}

export function generateFlowField(width: number, height: number, params: FlowParameters): DataPoint[] {
  try {
    const validWidth = Math.max(100, Number(width) || 400)
    const validHeight = Math.max(100, Number(height) || 400)

    const gridSize = 20
    const field: DataPoint[] = []

    for (let x = 0; x < validWidth; x += gridSize) {
      for (let y = 0; y < validHeight; y += gridSize) {
        const angle = Math.atan2(y - validHeight / 2, x - validWidth / 2) * params.complexity
        const magnitude = params.flowIntensity * 10

        const flowX = x + Math.cos(angle) * magnitude
        const flowY = y + Math.sin(angle) * magnitude

        if (isFinite(flowX) && isFinite(flowY)) {
          field.push({ x: flowX, y: flowY })
        }
      }
    }

    return field.length > 0 ? field : [{ x: 200, y: 200 }]
  } catch (error) {
    console.error("Error in generateFlowField:", error)
    return [{ x: 200, y: 200 }]
  }
}
