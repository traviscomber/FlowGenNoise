export interface DataPoint {
  x: number
  y: number
  label?: number
}

// Seeded random number generator
class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280
    return this.seed / 233280
  }

  gaussian(): number {
    // Box-Muller transform
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
      for (let i = 0; i < numSamples; i++) {
        const t = (i / numSamples) * 4 * Math.PI
        const r = t / (4 * Math.PI)
        const x = r * Math.cos(t) + noise * rng.gaussian()
        const y = r * Math.sin(t) + noise * rng.gaussian()
        points.push({ x, y, label: 0 })
      }
      break

    case "moons":
      const halfSamples = Math.floor(numSamples / 2)
      // First moon
      for (let i = 0; i < halfSamples; i++) {
        const t = (i / halfSamples) * Math.PI
        const x = Math.cos(t) + noise * rng.gaussian()
        const y = Math.sin(t) + noise * rng.gaussian()
        points.push({ x, y, label: 0 })
      }
      // Second moon
      for (let i = 0; i < numSamples - halfSamples; i++) {
        const t = (i / (numSamples - halfSamples)) * Math.PI
        const x = 1 - Math.cos(t) + noise * rng.gaussian()
        const y = 1 - Math.sin(t) - 0.5 + noise * rng.gaussian()
        points.push({ x, y, label: 1 })
      }
      break

    case "checkerboard":
      for (let i = 0; i < numSamples; i++) {
        const x = (rng.next() - 0.5) * 4
        const y = (rng.next() - 0.5) * 4
        const label = (Math.floor(x + 2) + Math.floor(y + 2)) % 2
        points.push({
          x: x + noise * rng.gaussian(),
          y: y + noise * rng.gaussian(),
          label,
        })
      }
      break

    case "gaussian":
      const numClusters = 4
      const samplesPerCluster = Math.floor(numSamples / numClusters)
      const centers = [
        { x: -1, y: -1 },
        { x: 1, y: -1 },
        { x: -1, y: 1 },
        { x: 1, y: 1 },
      ]

      for (let cluster = 0; cluster < numClusters; cluster++) {
        const center = centers[cluster]
        const samples = cluster === numClusters - 1 ? numSamples - cluster * samplesPerCluster : samplesPerCluster

        for (let i = 0; i < samples; i++) {
          const x = center.x + 0.5 * rng.gaussian() + noise * rng.gaussian()
          const y = center.y + 0.5 * rng.gaussian() + noise * rng.gaussian()
          points.push({ x, y, label: cluster })
        }
      }
      break

    case "grid":
      const gridSize = Math.ceil(Math.sqrt(numSamples))
      for (let i = 0; i < numSamples; i++) {
        const row = Math.floor(i / gridSize)
        const col = i % gridSize
        const x = (col / (gridSize - 1)) * 4 - 2 + noise * rng.gaussian()
        const y = (row / (gridSize - 1)) * 4 - 2 + noise * rng.gaussian()
        points.push({ x, y, label: (row + col) % 2 })
      }
      break

    case "neural":
      // Mathematical neural network simulation
      for (let i = 0; i < numSamples; i++) {
        // Generate input in range [-2, 2]
        const input1 = (rng.next() - 0.5) * 4
        const input2 = (rng.next() - 0.5) * 4

        // Neural network weights (fixed for reproducibility)
        const w1 = 0.7,
          w2 = 0.3,
          w3 = -0.5,
          w4 = 0.8,
          w5 = 0.6,
          w6 = -0.4

        // Layer 1: Input layer (identity)
        const l1_1 = input1
        const l1_2 = input2

        // Layer 2: Hidden layer with ReLU activation
        const l2_1 = Math.max(0, w1 * l1_1 + w2 * l1_2)
        const l2_2 = Math.max(0, w3 * l1_1 + w4 * l1_2)

        // Layer 3: Output layer with sigmoid-like activation
        const l3_1 = 2 / (1 + Math.exp(-(w5 * l2_1 + w6 * l2_2))) - 1

        // Create neural pattern using mathematical combinations
        const x = Math.sin(l2_1 * 0.5) * Math.cos(l2_2 * 0.5) + Math.sin(input1 * 0.8)
        const y = l3_1 + Math.cos(input2 * 0.8)

        points.push({
          x: x + noise * rng.gaussian(),
          y: y + noise * rng.gaussian(),
          label: l3_1 > 0 ? 1 : 0,
        })
      }
      break

    default:
      // Default to spirals
      for (let i = 0; i < numSamples; i++) {
        const t = (i / numSamples) * 4 * Math.PI
        const r = t / (4 * Math.PI)
        const x = r * Math.cos(t) + noise * rng.gaussian()
        const y = r * Math.sin(t) + noise * rng.gaussian()
        points.push({ x, y, label: 0 })
      }
  }

  return points
}
