/**
 * FlowSketch – Stereographic Mathematical Art Generator
 * -----------------------------------------------------------
 * This file generates high-quality stereographic projections of mathematical
 * visualizations, focusing on Little Planet and Tunnel View projections.
 */

export interface GenerationParams {
  dataset: string
  scenario: string
  colorScheme: string
  seed: number
  numSamples: number
  noiseScale: number
  timeStep: number
  projectionType: "little-planet" | "tunnel"
  resolution: string
  complexity: number
  symmetry: number
}

// Seeded random number generator for reproducible results
class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed % 2147483647
    if (this.seed <= 0) this.seed += 2147483646
  }

  next(): number {
    this.seed = (this.seed * 16807) % 2147483647
    return (this.seed - 1) / 2147483646
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min)
  }
}

// Color palette generator
function getColorPalette(scheme: string): string[] {
  const palettes: Record<string, string[]> = {
    plasma: ["#0d001a", "#2d0845", "#5d1a8b", "#8b2da6", "#b83dba", "#e55c9c", "#ff8a75", "#ffb347"],
    quantum: ["#001122", "#003344", "#005566", "#007788", "#00aa99", "#33ccaa", "#66eebb", "#99ffcc"],
    cosmic: ["#0a0015", "#1a0030", "#2a0045", "#3a0060", "#4a0075", "#5a0090", "#6a00a5", "#7a00c0"],
    thermal: ["#000000", "#330000", "#660000", "#990000", "#cc0000", "#ff3300", "#ff6600", "#ff9900"],
    spectral: ["#ff0000", "#ff8000", "#ffff00", "#80ff00", "#00ff00", "#00ff80", "#00ffff", "#0080ff"],
    crystalline: ["#e6f3ff", "#cce7ff", "#b3dbff", "#99cfff", "#80c3ff", "#66b7ff", "#4dabff", "#339fff"],
    bioluminescent: ["#001a1a", "#003333", "#004d4d", "#006666", "#008080", "#00b3b3", "#00e6e6", "#33ffff"],
    aurora: ["#001100", "#002200", "#003300", "#004400", "#005500", "#006600", "#007700", "#008800"],
    metallic: ["#2c1810", "#4a2c1a", "#684024", "#86542e", "#a46838", "#c27c42", "#e0904c", "#ffa456"],
    prismatic: ["#ff0066", "#ff6600", "#ffcc00", "#66ff00", "#00ff66", "#0066ff", "#6600ff", "#cc00ff"],
    monochromatic: ["#000000", "#1a1a1a", "#333333", "#4d4d4d", "#666666", "#808080", "#999999", "#b3b3b3"],
    infrared: ["#000000", "#1a0000", "#330000", "#4d0000", "#660000", "#800000", "#990000", "#b30000"],
    neon: ["#ff00ff", "#ff0080", "#ff0040", "#ff4000", "#ff8000", "#ffff00", "#80ff00", "#00ff80"],
    sunset: ["#1a0d00", "#331a00", "#4d2600", "#663300", "#804000", "#994d00", "#b35900", "#cc6600"],
    ocean: ["#000d1a", "#001a33", "#00264d", "#003366", "#004080", "#004d99", "#0059b3", "#0066cc"],
    forest: ["#0d1a0d", "#1a331a", "#264d26", "#336633", "#408040", "#4d994d", "#59b359", "#66cc66"],
    volcanic: ["#1a0000", "#330d00", "#4d1a00", "#662600", "#803300", "#994000", "#b34d00", "#cc5900"],
    arctic: ["#f0f8ff", "#e6f3ff", "#ddeeff", "#d4e9ff", "#cbe4ff", "#c2dfff", "#b9daff", "#b0d5ff"],
  }

  return palettes[scheme] || palettes.plasma
}

// Mathematical dataset generators
function generateDataset(
  dataset: string,
  numSamples: number,
  complexity: number,
  symmetry: number,
  rng: SeededRandom,
): Array<{ x: number; y: number; z?: number; intensity: number }> {
  const points: Array<{ x: number; y: number; z?: number; intensity: number }> = []

  switch (dataset) {
    case "spirals":
      return generateFibonacciSpiral(numSamples, complexity, symmetry, rng)
    case "fractal":
      return generateFractalTree(numSamples, complexity, symmetry, rng)
    case "mandelbrot":
      return generateMandelbrotSet(numSamples, complexity, symmetry, rng)
    case "julia":
      return generateJuliaSet(numSamples, complexity, symmetry, rng)
    case "lorenz":
      return generateLorenzAttractor(numSamples, complexity, symmetry, rng)
    case "hyperbolic":
      return generateHyperbolicGeometry(numSamples, complexity, symmetry, rng)
    case "gaussian":
      return generateGaussianFields(numSamples, complexity, symmetry, rng)
    case "cellular":
      return generateCellularAutomata(numSamples, complexity, symmetry, rng)
    case "voronoi":
      return generateVoronoiDiagram(numSamples, complexity, symmetry, rng)
    case "perlin":
      return generatePerlinNoise(numSamples, complexity, symmetry, rng)
    case "diffusion":
      return generateReactionDiffusion(numSamples, complexity, symmetry, rng)
    case "wave":
      return generateWaveInterference(numSamples, complexity, symmetry, rng)
    case "neural":
      return generateNeuralNetwork(numSamples, complexity, symmetry, rng)
    case "quantum":
      return generateQuantumFields(numSamples, complexity, symmetry, rng)
    case "crystalline":
      return generateCrystalLattice(numSamples, complexity, symmetry, rng)
    case "plasma":
      return generatePlasmaDynamics(numSamples, complexity, symmetry, rng)
    default:
      return generateFibonacciSpiral(numSamples, complexity, symmetry, rng)
  }
}

// Individual dataset generators
function generateFibonacciSpiral(
  numSamples: number,
  complexity: number,
  symmetry: number,
  rng: SeededRandom,
): Array<{ x: number; y: number; intensity: number }> {
  const points = []
  const phi = (1 + Math.sqrt(5)) / 2 // Golden ratio
  const angleIncrement = (2 * Math.PI) / phi

  for (let i = 0; i < numSamples; i++) {
    const t = i / numSamples
    const angle = i * angleIncrement * complexity
    const radius = Math.sqrt(i) * 0.1 * complexity

    const x = radius * Math.cos(angle) + rng.range(-0.1, 0.1) * (1 - symmetry)
    const y = radius * Math.sin(angle) + rng.range(-0.1, 0.1) * (1 - symmetry)
    const intensity = Math.sin(t * Math.PI * complexity) * 0.5 + 0.5

    points.push({ x, y, intensity })
  }

  return points
}

function generateFractalTree(
  numSamples: number,
  complexity: number,
  symmetry: number,
  rng: SeededRandom,
): Array<{ x: number; y: number; intensity: number }> {
  const points = []
  const maxDepth = Math.floor(complexity * 8)

  function addBranch(x: number, y: number, angle: number, length: number, depth: number) {
    if (depth > maxDepth || length < 0.01) return

    const endX = x + length * Math.cos(angle)
    const endY = y + length * Math.sin(angle)

    const steps = Math.max(1, Math.floor(length * 50))
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const px = x + (endX - x) * t + rng.range(-0.02, 0.02) * (1 - symmetry)
      const py = y + (endY - y) * t + rng.range(-0.02, 0.02) * (1 - symmetry)
      const intensity = (maxDepth - depth) / maxDepth

      points.push({ x: px, y: py, intensity })
    }

    const branchAngle = (Math.PI / 4) * complexity
    const lengthReduction = 0.7

    addBranch(endX, endY, angle - branchAngle, length * lengthReduction, depth + 1)
    addBranch(endX, endY, angle + branchAngle, length * lengthReduction, depth + 1)
  }

  addBranch(0, -0.5, Math.PI / 2, 0.3, 0)

  return points.slice(0, numSamples)
}

function generateMandelbrotSet(
  numSamples: number,
  complexity: number,
  symmetry: number,
  rng: SeededRandom,
): Array<{ x: number; y: number; intensity: number }> {
  const points = []
  const maxIterations = Math.floor(complexity * 100)
  const zoom = 2 / complexity

  for (let i = 0; i < numSamples; i++) {
    const x = rng.range(-2, 2) * zoom
    const y = rng.range(-2, 2) * zoom

    let zx = 0,
      zy = 0
    let iterations = 0

    while (zx * zx + zy * zy < 4 && iterations < maxIterations) {
      const temp = zx * zx - zy * zy + x
      zy = 2 * zx * zy + y
      zx = temp
      iterations++
    }

    if (iterations < maxIterations) {
      const intensity = iterations / maxIterations
      const px = x + rng.range(-0.01, 0.01) * (1 - symmetry)
      const py = y + rng.range(-0.01, 0.01) * (1 - symmetry)
      points.push({ x: px, y: py, intensity })
    }
  }

  return points
}

function generateJuliaSet(
  numSamples: number,
  complexity: number,
  symmetry: number,
  rng: SeededRandom,
): Array<{ x: number; y: number; intensity: number }> {
  const points = []
  const maxIterations = Math.floor(complexity * 100)
  const cx = -0.7269 * complexity
  const cy = 0.1889 * complexity

  for (let i = 0; i < numSamples; i++) {
    let zx = rng.range(-2, 2)
    let zy = rng.range(-2, 2)
    let iterations = 0

    while (zx * zx + zy * zy < 4 && iterations < maxIterations) {
      const temp = zx * zx - zy * zy + cx
      zy = 2 * zx * zy + cy
      zx = temp
      iterations++
    }

    if (iterations < maxIterations) {
      const intensity = iterations / maxIterations
      const px = zx + rng.range(-0.01, 0.01) * (1 - symmetry)
      const py = zy + rng.range(-0.01, 0.01) * (1 - symmetry)
      points.push({ x: px * 0.5, y: py * 0.5, intensity })
    }
  }

  return points
}

function generateLorenzAttractor(
  numSamples: number,
  complexity: number,
  symmetry: number,
  rng: SeededRandom,
): Array<{ x: number; y: number; intensity: number }> {
  const points = []
  const sigma = 10 * complexity
  const rho = 28 * complexity
  const beta = (8 / 3) * complexity
  const dt = 0.01

  let x = 1,
    y = 1,
    z = 1

  for (let i = 0; i < numSamples; i++) {
    const dx = sigma * (y - x)
    const dy = x * (rho - z) - y
    const dz = x * y - beta * z

    x += dx * dt
    y += dy * dt
    z += dz * dt

    const intensity = Math.sin(i * 0.01) * 0.5 + 0.5
    const px = x * 0.02 + rng.range(-0.01, 0.01) * (1 - symmetry)
    const py = y * 0.02 + rng.range(-0.01, 0.01) * (1 - symmetry)

    points.push({ x: px, y: py, intensity })
  }

  return points
}

function generateHyperbolicGeometry(
  numSamples: number,
  complexity: number,
  symmetry: number,
  rng: SeededRandom,
): Array<{ x: number; y: number; intensity: number }> {
  const points = []

  for (let i = 0; i < numSamples; i++) {
    const t = (i / numSamples) * 2 * Math.PI * complexity
    const r = Math.tanh(t * 0.5)

    const x = r * Math.cos(t) + rng.range(-0.05, 0.05) * (1 - symmetry)
    const y = r * Math.sin(t) + rng.range(-0.05, 0.05) * (1 - symmetry)
    const intensity = Math.abs(Math.sin(t * complexity))

    points.push({ x, y, intensity })
  }

  return points
}

function generateGaussianFields(
  numSamples: number,
  complexity: number,
  symmetry: number,
  rng: SeededRandom,
): Array<{ x: number; y: number; intensity: number }> {
  const points = []

  for (let i = 0; i < numSamples; i++) {
    // Box-Muller transform for Gaussian distribution
    const u1 = rng.next()
    const u2 = rng.next()
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2)

    const x = z0 * 0.3 * complexity + rng.range(-0.02, 0.02) * (1 - symmetry)
    const y = z1 * 0.3 * complexity + rng.range(-0.02, 0.02) * (1 - symmetry)
    const intensity = Math.exp(-(x * x + y * y) / (2 * complexity * complexity))

    points.push({ x, y, intensity })
  }

  return points
}

function generateCellularAutomata(
  numSamples: number,
  complexity: number,
  symmetry: number,
  rng: SeededRandom,
): Array<{ x: number; y: number; intensity: number }> {
  const points = []
  const gridSize = Math.floor(Math.sqrt(numSamples) * complexity)
  const grid = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(0))

  // Initialize random cells
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      grid[i][j] = rng.next() > 0.5 ? 1 : 0
    }
  }

  // Apply cellular automata rules
  const generations = Math.floor(complexity * 10)
  for (let gen = 0; gen < generations; gen++) {
    const newGrid = grid.map((row) => [...row])

    for (let i = 1; i < gridSize - 1; i++) {
      for (let j = 1; j < gridSize - 1; j++) {
        const neighbors =
          grid[i - 1][j - 1] +
          grid[i - 1][j] +
          grid[i - 1][j + 1] +
          grid[i][j - 1] +
          grid[i][j + 1] +
          grid[i + 1][j - 1] +
          grid[i + 1][j] +
          grid[i + 1][j + 1]

        if (grid[i][j] === 1) {
          newGrid[i][j] = neighbors === 2 || neighbors === 3 ? 1 : 0
        } else {
          newGrid[i][j] = neighbors === 3 ? 1 : 0
        }
      }
    }

    grid.splice(0, grid.length, ...newGrid)
  }

  // Convert grid to points
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (grid[i][j] === 1) {
        const x = (i / gridSize - 0.5) * 2 + rng.range(-0.01, 0.01) * (1 - symmetry)
        const y = (j / gridSize - 0.5) * 2 + rng.range(-0.01, 0.01) * (1 - symmetry)
        const intensity = 1
        points.push({ x, y, intensity })
      }
    }
  }

  return points.slice(0, numSamples)
}

function generateVoronoiDiagram(
  numSamples: number,
  complexity: number,
  symmetry: number,
  rng: SeededRandom,
): Array<{ x: number; y: number; intensity: number }> {
  const points = []
  const seeds = Math.floor(complexity * 20)
  const seedPoints = []

  // Generate seed points
  for (let i = 0; i < seeds; i++) {
    seedPoints.push({
      x: rng.range(-1, 1),
      y: rng.range(-1, 1),
      intensity: rng.next(),
    })
  }

  // Generate Voronoi cells
  for (let i = 0; i < numSamples; i++) {
    const x = rng.range(-1, 1)
    const y = rng.range(-1, 1)

    let closestSeed = seedPoints[0]
    let minDistance = Number.POSITIVE_INFINITY

    for (const seed of seedPoints) {
      const distance = Math.sqrt((x - seed.x) ** 2 + (y - seed.y) ** 2)
      if (distance < minDistance) {
        minDistance = distance
        closestSeed = seed
      }
    }

    const px = x + rng.range(-0.02, 0.02) * (1 - symmetry)
    const py = y + rng.range(-0.02, 0.02) * (1 - symmetry)

    points.push({ x: px, y: py, intensity: closestSeed.intensity })
  }

  return points
}

function generatePerlinNoise(
  numSamples: number,
  complexity: number,
  symmetry: number,
  rng: SeededRandom,
): Array<{ x: number; y: number; intensity: number }> {
  const points = []

  // Simple Perlin-like noise implementation
  function noise(x: number, y: number): number {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
    return (n - Math.floor(n)) * 2 - 1
  }

  function smoothNoise(x: number, y: number): number {
    const corners = (noise(x - 1, y - 1) + noise(x + 1, y - 1) + noise(x - 1, y + 1) + noise(x + 1, y + 1)) / 16
    const sides = (noise(x - 1, y) + noise(x + 1, y) + noise(x, y - 1) + noise(x, y + 1)) / 8
    const center = noise(x, y) / 4

    return corners + sides + center
  }

  for (let i = 0; i < numSamples; i++) {
    const x = rng.range(-2, 2)
    const y = rng.range(-2, 2)

    let intensity = 0
    let amplitude = 1
    let frequency = complexity

    // Multi-octave noise
    for (let octave = 0; octave < 4; octave++) {
      intensity += smoothNoise(x * frequency, y * frequency) * amplitude
      amplitude *= 0.5
      frequency *= 2
    }

    intensity = (intensity + 1) / 2 // Normalize to 0-1

    const px = x * 0.5 + rng.range(-0.02, 0.02) * (1 - symmetry)
    const py = y * 0.5 + rng.range(-0.02, 0.02) * (1 - symmetry)

    points.push({ x: px, y: py, intensity })
  }

  return points
}

function generateReactionDiffusion(
  numSamples: number,
  complexity: number,
  symmetry: number,
  rng: SeededRandom,
): Array<{ x: number; y: number; intensity: number }> {
  const points = []
  const gridSize = Math.floor(Math.sqrt(numSamples / 4))
  const A = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(1))
  const B = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(0))

  // Initialize with random spots
  for (let i = 0; i < gridSize * gridSize * 0.1; i++) {
    const x = Math.floor(rng.next() * gridSize)
    const y = Math.floor(rng.next() * gridSize)
    B[x][y] = 1
  }

  const Da = 1.0 * complexity
  const Db = 0.5 * complexity
  const f = 0.055 * complexity
  const k = 0.062 * complexity
  const dt = 1.0

  // Run simulation
  const steps = Math.floor(complexity * 50)
  for (let step = 0; step < steps; step++) {
    const newA = A.map((row) => [...row])
    const newB = B.map((row) => [...row])

    for (let i = 1; i < gridSize - 1; i++) {
      for (let j = 1; j < gridSize - 1; j++) {
        const a = A[i][j]
        const b = B[i][j]

        const laplaceA = A[i - 1][j] + A[i + 1][j] + A[i][j - 1] + A[i][j + 1] - 4 * a
        const laplaceB = B[i - 1][j] + B[i + 1][j] + B[i][j - 1] + B[i][j + 1] - 4 * b

        newA[i][j] = a + (Da * laplaceA - a * b * b + f * (1 - a)) * dt
        newB[i][j] = b + (Db * laplaceB + a * b * b - (k + f) * b) * dt
      }
    }

    A.splice(0, A.length, ...newA)
    B.splice(0, B.length, ...newB)
  }

  // Convert to points
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (B[i][j] > 0.1) {
        const x = (i / gridSize - 0.5) * 2 + rng.range(-0.01, 0.01) * (1 - symmetry)
        const y = (j / gridSize - 0.5) * 2 + rng.range(-0.01, 0.01) * (1 - symmetry)
        const intensity = B[i][j]
        points.push({ x, y, intensity })
      }
    }
  }

  return points.slice(0, numSamples)
}

function generateWaveInterference(
  numSamples: number,
  complexity: number,
  symmetry: number,
  rng: SeededRandom,
): Array<{ x: number; y: number; intensity: number }> {
  const points = []
  const sources = Math.floor(complexity * 5)
  const waveSourcesData = []

  // Generate wave sources
  for (let i = 0; i < sources; i++) {
    waveSourcesData.push({
      x: rng.range(-1, 1),
      y: rng.range(-1, 1),
      frequency: rng.range(1, 5) * complexity,
      amplitude: rng.range(0.5, 1),
      phase: rng.range(0, 2 * Math.PI),
    })
  }

  for (let i = 0; i < numSamples; i++) {
    const x = rng.range(-2, 2)
    const y = rng.range(-2, 2)

    let totalAmplitude = 0

    for (const source of waveSourcesData) {
      const distance = Math.sqrt((x - source.x) ** 2 + (y - source.y) ** 2)
      const wave = source.amplitude * Math.sin(source.frequency * distance + source.phase)
      totalAmplitude += wave
    }

    const intensity = (totalAmplitude / sources + 1) / 2 // Normalize

    if (intensity > 0.3) {
      // Only show significant interference
      const px = x * 0.5 + rng.range(-0.01, 0.01) * (1 - symmetry)
      const py = y * 0.5 + rng.range(-0.01, 0.01) * (1 - symmetry)
      points.push({ x: px, y: py, intensity })
    }
  }

  return points.slice(0, numSamples)
}

function generateNeuralNetwork(
  numSamples: number,
  complexity: number,
  symmetry: number,
  rng: SeededRandom,
): Array<{ x: number; y: number; intensity: number }> {
  const points = []
  const nodes = Math.floor(complexity * 30)
  const nodePositions = []

  // Generate nodes
  for (let i = 0; i < nodes; i++) {
    nodePositions.push({
      x: rng.range(-1, 1),
      y: rng.range(-1, 1),
      activation: rng.next(),
    })
  }

  // Generate connections
  for (let i = 0; i < nodes; i++) {
    for (let j = i + 1; j < nodes; j++) {
      const distance = Math.sqrt(
        (nodePositions[i].x - nodePositions[j].x) ** 2 + (nodePositions[i].y - nodePositions[j].y) ** 2,
      )

      if (distance < 0.5 * complexity && rng.next() > 0.7) {
        const steps = Math.floor(distance * 50)
        const weight = (nodePositions[i].activation + nodePositions[j].activation) / 2

        for (let step = 0; step <= steps; step++) {
          const t = step / steps
          const x = nodePositions[i].x + (nodePositions[j].x - nodePositions[i].x) * t
          const y = nodePositions[i].y + (nodePositions[j].y - nodePositions[i].y) * t

          const px = x + rng.range(-0.02, 0.02) * (1 - symmetry)
          const py = y + rng.range(-0.02, 0.02) * (1 - symmetry)

          points.push({ x: px, y: py, intensity: weight })
        }
      }
    }
  }

  // Add nodes themselves
  for (const node of nodePositions) {
    const px = node.x + rng.range(-0.01, 0.01) * (1 - symmetry)
    const py = node.y + rng.range(-0.01, 0.01) * (1 - symmetry)
    points.push({ x: px, y: py, intensity: node.activation })
  }

  return points.slice(0, numSamples)
}

function generateQuantumFields(
  numSamples: number,
  complexity: number,
  symmetry: number,
  rng: SeededRandom,
): Array<{ x: number; y: number; intensity: number }> {
  const points = []

  for (let i = 0; i < numSamples; i++) {
    const x = rng.range(-2, 2)
    const y = rng.range(-2, 2)

    // Quantum harmonic oscillator wave function
    const n = Math.floor(complexity * 5)
    const m = Math.floor(complexity * 5)

    const psi =
      Math.exp(-(x * x + y * y) / 2) * Math.pow(x, n) * Math.pow(y, m) * Math.cos(complexity * Math.sqrt(x * x + y * y))

    const intensity = psi * psi // Probability density

    if (intensity > 0.01) {
      const px = x * 0.3 + rng.range(-0.01, 0.01) * (1 - symmetry)
      const py = y * 0.3 + rng.range(-0.01, 0.01) * (1 - symmetry)
      points.push({ x: px, y: py, intensity: Math.min(intensity, 1) })
    }
  }

  return points
}

function generateCrystalLattice(
  numSamples: number,
  complexity: number,
  symmetry: number,
  rng: SeededRandom,
): Array<{ x: number; y: number; intensity: number }> {
  const points = []
  const latticeSize = Math.floor(Math.sqrt(numSamples) * complexity)
  const spacing = 2 / latticeSize

  // Generate different crystal structures
  const structures = ["cubic", "hexagonal", "triangular"]
  const structure = structures[Math.floor(rng.next() * structures.length)]

  for (let i = 0; i < latticeSize; i++) {
    for (let j = 0; j < latticeSize; j++) {
      let x, y

      switch (structure) {
        case "cubic":
          x = (i - latticeSize / 2) * spacing
          y = (j - latticeSize / 2) * spacing
          break
        case "hexagonal":
          x = (i - latticeSize / 2) * spacing + (j % 2) * spacing * 0.5
          y = ((j - latticeSize / 2) * spacing * Math.sqrt(3)) / 2
          break
        case "triangular":
          x = (i - latticeSize / 2) * spacing + (j % 2) * spacing * 0.5
          y = ((j - latticeSize / 2) * spacing * Math.sqrt(3)) / 2
          break
        default:
          x = (i - latticeSize / 2) * spacing
          y = (j - latticeSize / 2) * spacing
      }

      // Add thermal vibrations
      const px = x + rng.range(-0.02, 0.02) * (1 - symmetry)
      const py = y + rng.range(-0.02, 0.02) * (1 - symmetry)

      const intensity = Math.exp(-((px * px + py * py) / (2 * complexity * complexity)))

      points.push({ x: px, y: py, intensity })
    }
  }

  return points.slice(0, numSamples)
}

function generatePlasmaDynamics(
  numSamples: number,
  complexity: number,
  symmetry: number,
  rng: SeededRandom,
): Array<{ x: number; y: number; intensity: number }> {
  const points = []

  // Simulate plasma particles in electromagnetic field
  for (let i = 0; i < numSamples; i++) {
    const t = (i / numSamples) * 2 * Math.PI * complexity

    // Cyclotron motion in magnetic field
    const B = complexity // Magnetic field strength
    const omega = B // Cyclotron frequency

    const r = rng.range(0.1, 1) * complexity
    const phase = rng.range(0, 2 * Math.PI)

    const x = r * Math.cos(omega * t + phase) + rng.range(-0.05, 0.05) * (1 - symmetry)
    const y = r * Math.sin(omega * t + phase) + rng.range(-0.05, 0.05) * (1 - symmetry)

    // Electric field effects
    const Ex = Math.sin(t * complexity) * 0.1
    const Ey = Math.cos(t * complexity) * 0.1

    const px = x + Ex + rng.range(-0.02, 0.02) * (1 - symmetry)
    const py = y + Ey + rng.range(-0.02, 0.02) * (1 - symmetry)

    const intensity = Math.exp(-t * 0.1) * (Math.sin(t * 5) * 0.5 + 0.5)

    points.push({ x: px * 0.5, y: py * 0.5, intensity })
  }

  return points
}

// Stereographic projection functions
function applyStereographicProjection(
  points: Array<{ x: number; y: number; intensity: number }>,
  projectionType: "little-planet" | "tunnel",
  complexity: number,
): Array<{ x: number; y: number; intensity: number }> {
  return points.map((point) => {
    const { x, y, intensity } = point
    const r = Math.sqrt(x * x + y * y)
    const theta = Math.atan2(y, x)

    let newX, newY

    if (projectionType === "little-planet") {
      // Little planet projection (stereographic from sphere)
      const scale = 2 / (1 + r * r + 1)
      newX = x * scale * complexity
      newY = y * scale * complexity
    } else {
      // Tunnel view projection (inverse stereographic)
      const scale = r / (1 + Math.sqrt(1 + r * r))
      newX = Math.cos(theta) * scale * complexity
      newY = Math.sin(theta) * scale * complexity
    }

    return { x: newX, y: newY, intensity }
  })
}

// SVG generation with enhanced quality
export function generateStereographicProjection(params: GenerationParams): string {
  const {
    dataset,
    scenario,
    colorScheme,
    seed,
    numSamples,
    noiseScale,
    projectionType,
    resolution,
    complexity,
    symmetry,
  } = params

  console.log("🎯 Generating stereographic projection:", projectionType)
  console.log("📊 Dataset:", dataset, "Samples:", numSamples)

  const rng = new SeededRandom(seed)
  const colors = getColorPalette(colorScheme)
  const dimensions = getResolutionDimensions(resolution)

  // Generate mathematical dataset
  let points = generateDataset(dataset, numSamples, complexity, symmetry, rng)

  // Apply noise
  if (noiseScale > 0) {
    points = points.map((point) => ({
      ...point,
      x: point.x + rng.range(-noiseScale, noiseScale),
      y: point.y + rng.range(-noiseScale, noiseScale),
    }))
  }

  // Apply stereographic projection
  points = applyStereographicProjection(points, projectionType, complexity)

  // Normalize points to fit in viewport
  const maxCoord = Math.max(...points.map((p) => Math.max(Math.abs(p.x), Math.abs(p.y))))
  const scale = maxCoord > 0 ? 0.8 / maxCoord : 1

  points = points.map((point) => ({
    ...point,
    x: point.x * scale,
    y: point.y * scale,
  }))

  // Generate SVG
  const centerX = dimensions.width / 2
  const centerY = dimensions.height / 2
  const viewportSize = Math.min(dimensions.width, dimensions.height)

  // Create gradients
  const gradientDefs = colors
    .map((color, index) => {
      const nextColor = colors[(index + 1) % colors.length]
      return `
      <radialGradient id="grad${index}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" style="stop-color:${color};stop-opacity:0.8" />
        <stop offset="100%" style="stop-color:${nextColor};stop-opacity:0.3" />
      </radialGradient>
    `
    })
    .join("")

  // Create filter effects
  const filters = `
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="1"/>
    </filter>
  `

  // Generate point elements
  const pointElements = points
    .map((point, index) => {
      const x = centerX + point.x * viewportSize * 0.4
      const y = centerY + point.y * viewportSize * 0.4
      const colorIndex = Math.floor(point.intensity * (colors.length - 1))
      const color = colors[colorIndex]
      const size = Math.max(0.5, point.intensity * complexity * 2)
      const opacity = Math.max(0.1, point.intensity * 0.8)

      return `<circle cx="${x}" cy="${y}" r="${size}" fill="${color}" opacity="${opacity}" filter="url(#glow)"/>`
    })
    .join("")

  // Create background pattern
  const backgroundPattern =
    projectionType === "little-planet"
      ? `<circle cx="${centerX}" cy="${centerY}" r="${viewportSize * 0.45}" fill="none" stroke="${colors[0]}" stroke-width="1" opacity="0.1"/>`
      : `<rect x="0" y="0" width="${dimensions.width}" height="${dimensions.height}" fill="url(#grad0)" opacity="0.05"/>`

  const svg = `
    <svg width="${dimensions.width}" height="${dimensions.height}" viewBox="0 0 ${dimensions.width} ${dimensions.height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        ${gradientDefs}
        ${filters}
      </defs>
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="#000000"/>
      ${backgroundPattern}
      
      <!-- Mathematical points -->
      <g filter="url(#blur)">
        ${pointElements}
      </g>
      
      <!-- Projection overlay -->
      ${
        projectionType === "little-planet"
          ? `<circle cx="${centerX}" cy="${centerY}" r="${viewportSize * 0.4}" fill="none" stroke="${colors[colors.length - 1]}" stroke-width="2" opacity="0.3"/>`
          : `<circle cx="${centerX}" cy="${centerY}" r="${viewportSize * 0.1}" fill="${colors[colors.length - 1]}" opacity="0.5"/>`
      }
    </svg>
  `

  console.log("✅ Generated SVG with", points.length, "points")
  return svg
}

function getResolutionDimensions(resolution: string): { width: number; height: number } {
  switch (resolution) {
    case "1080p":
      return { width: 1080, height: 1080 }
    case "1440p":
      return { width: 1440, height: 1440 }
    case "2160p":
      return { width: 2160, height: 2160 }
    default:
      return { width: 2160, height: 2160 }
  }
}
