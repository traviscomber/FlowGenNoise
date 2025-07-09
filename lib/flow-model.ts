export interface DataPoint {
  x: number
  y: number
  category?: number
}

// Seeded random number generator for reproducible results
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
    // Box-Muller transform for Gaussian distribution
    const u1 = this.next()
    const u2 = this.next()
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  }
}

export function generateDataset(type: string, seed: number, numSamples: number, noise: number): DataPoint[] {
  const rng = new SeededRandom(seed)
  const points: DataPoint[] = []

  switch (type) {
    case "spirals":
      return generateSpirals(rng, numSamples, noise)
    case "moons":
      return generateMoons(rng, numSamples, noise)
    case "checkerboard":
      return generateCheckerboard(rng, numSamples, noise)
    case "gaussian":
      return generateGaussian(rng, numSamples, noise)
    case "grid":
      return generateGrid(rng, numSamples, noise)
    case "neural":
      return generateNeuralNetwork(rng, numSamples, noise)
    default:
      return generateSpirals(rng, numSamples, noise)
  }
}

function generateSpirals(rng: SeededRandom, numSamples: number, noise: number): DataPoint[] {
  const points: DataPoint[] = []
  const numSpirals = 2

  for (let i = 0; i < numSamples; i++) {
    const spiralId = Math.floor(i / (numSamples / numSpirals))
    const t = ((i % (numSamples / numSpirals)) / (numSamples / numSpirals)) * 4 * Math.PI

    const r = t * 0.5
    const angle = t + spiralId * Math.PI

    const x = r * Math.cos(angle) + rng.nextGaussian() * noise
    const y = r * Math.sin(angle) + rng.nextGaussian() * noise

    points.push({ x, y, category: spiralId })
  }

  return points
}

function generateMoons(rng: SeededRandom, numSamples: number, noise: number): DataPoint[] {
  const points: DataPoint[] = []

  for (let i = 0; i < numSamples; i++) {
    const category = i < numSamples / 2 ? 0 : 1

    if (category === 0) {
      // Upper moon
      const angle = rng.next() * Math.PI
      const x = Math.cos(angle) + rng.nextGaussian() * noise
      const y = Math.sin(angle) + rng.nextGaussian() * noise
      points.push({ x, y, category })
    } else {
      // Lower moon
      const angle = rng.next() * Math.PI
      const x = 1 - Math.cos(angle) + rng.nextGaussian() * noise
      const y = 0.5 - Math.sin(angle) + rng.nextGaussian() * noise
      points.push({ x, y, category })
    }
  }

  return points
}

function generateCheckerboard(rng: SeededRandom, numSamples: number, noise: number): DataPoint[] {
  const points: DataPoint[] = []

  for (let i = 0; i < numSamples; i++) {
    const x = rng.next() * 4 - 2
    const y = rng.next() * 4 - 2

    const gridX = Math.floor(x + 2)
    const gridY = Math.floor(y + 2)
    const category = (gridX + gridY) % 2

    const noisyX = x + rng.nextGaussian() * noise
    const noisyY = y + rng.nextGaussian() * noise

    points.push({ x: noisyX, y: noisyY, category })
  }

  return points
}

function generateGaussian(rng: SeededRandom, numSamples: number, noise: number): DataPoint[] {
  const points: DataPoint[] = []
  const numClusters = 3
  const centers = [
    { x: -1, y: -1 },
    { x: 1, y: 1 },
    { x: -1, y: 1 },
  ]

  for (let i = 0; i < numSamples; i++) {
    const clusterId = Math.floor(rng.next() * numClusters)
    const center = centers[clusterId]

    const x = center.x + rng.nextGaussian() * 0.5 + rng.nextGaussian() * noise
    const y = center.y + rng.nextGaussian() * 0.5 + rng.nextGaussian() * noise

    points.push({ x, y, category: clusterId })
  }

  return points
}

function generateGrid(rng: SeededRandom, numSamples: number, noise: number): DataPoint[] {
  const points: DataPoint[] = []
  const gridSize = Math.ceil(Math.sqrt(numSamples))

  for (let i = 0; i < numSamples; i++) {
    const row = Math.floor(i / gridSize)
    const col = i % gridSize

    const x = (col / (gridSize - 1)) * 4 - 2 + rng.nextGaussian() * noise
    const y = (row / (gridSize - 1)) * 4 - 2 + rng.nextGaussian() * noise

    points.push({ x, y, category: (row + col) % 2 })
  }

  return points
}

function generateNeuralNetwork(rng: SeededRandom, numSamples: number, noise: number): DataPoint[] {
  const points: DataPoint[] = []

  // Generate input data uniformly distributed over [-2, 2]
  for (let i = 0; i < numSamples; i++) {
    const x1 = rng.next() * 4 - 2 // Input 1: [-2, 2]
    const x2 = rng.next() * 4 - 2 // Input 2: [-2, 2]

    // Neural network weights (fixed for reproducibility)
    const w1 = 0.7,
      w2 = 0.3,
      w3 = -0.5,
      w4 = 0.8,
      w5 = 0.6,
      w6 = -0.4

    // Layer 1: Input layer (identity)
    const l1_1 = x1
    const l1_2 = x2

    // Layer 2: Hidden layer with ReLU activation
    const z2_1 = w1 * l1_1 + w2 * l1_2
    const z2_2 = w3 * l1_1 + w4 * l1_2
    const l2_1 = Math.max(0, z2_1) // ReLU
    const l2_2 = Math.max(0, z2_2) // ReLU

    // Layer 3: Output layer with tanh-like activation
    const z3 = w5 * l2_1 + w6 * l2_2
    const l3 = 2 / (1 + Math.exp(-z3)) - 1 // Scaled sigmoid (tanh-like)

    // Combine with trigonometric functions for complex patterns
    const output1 = Math.sin(l2_1 * 0.5) * Math.cos(l2_2 * 0.5)
    const output2 = l3 + Math.sin(x1 * 0.8) * 0.3 + Math.cos(x2 * 0.8) * 0.3

    // Add noise
    const finalX = output1 + rng.nextGaussian() * noise
    const finalY = output2 + rng.nextGaussian() * noise

    // Determine category based on activation patterns
    const category = l2_1 > l2_2 ? 0 : 1

    points.push({ x: finalX, y: finalY, category })
  }

  return points
}
