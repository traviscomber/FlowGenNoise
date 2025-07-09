// Toy dataset generation for flow-based art
export interface DataPoint {
  x: number
  y: number
  category?: number
}

export function generateDataset(datasetType: string, seed: number, numSamples: number, noise: number): DataPoint[] {
  // Simple seeded random number generator
  let randomSeed = seed
  const seededRandom = () => {
    randomSeed = (randomSeed * 9301 + 49297) % 233280
    return randomSeed / 233280
  }

  const data: DataPoint[] = []

  switch (datasetType) {
    case "spirals":
      for (let i = 0; i < numSamples; i++) {
        const t = (i / numSamples) * 4 * Math.PI
        const r = t / (4 * Math.PI)
        const category = Math.floor(i / (numSamples / 2))
        const angle = t + category * Math.PI

        data.push({
          x: r * Math.cos(angle) + (seededRandom() - 0.5) * noise,
          y: r * Math.sin(angle) + (seededRandom() - 0.5) * noise,
          category,
        })
      }
      break

    case "moons":
      for (let i = 0; i < numSamples; i++) {
        const category = i < numSamples / 2 ? 0 : 1
        const t = ((i % (numSamples / 2)) / (numSamples / 2)) * Math.PI

        if (category === 0) {
          data.push({
            x: Math.cos(t) + (seededRandom() - 0.5) * noise,
            y: Math.sin(t) + (seededRandom() - 0.5) * noise,
            category,
          })
        } else {
          data.push({
            x: 1 - Math.cos(t) + (seededRandom() - 0.5) * noise,
            y: 0.5 - Math.sin(t) + (seededRandom() - 0.5) * noise,
            category,
          })
        }
      }
      break

    case "checkerboard":
      for (let i = 0; i < numSamples; i++) {
        const x = seededRandom() * 4 - 2
        const y = seededRandom() * 4 - 2
        const category = (Math.floor(x + 2) + Math.floor(y + 2)) % 2

        data.push({
          x: x + (seededRandom() - 0.5) * noise,
          y: y + (seededRandom() - 0.5) * noise,
          category,
        })
      }
      break

    case "gaussian":
      for (let i = 0; i < numSamples; i++) {
        const category = Math.floor(seededRandom() * 3)
        const centers = [
          [-1, -1],
          [1, 1],
          [0, 0],
        ]
        const center = centers[category]

        // Box-Muller transform for Gaussian
        const u1 = seededRandom()
        const u2 = seededRandom()
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
        const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2)

        data.push({
          x: center[0] + z0 * 0.5 + (seededRandom() - 0.5) * noise,
          y: center[1] + z1 * 0.5 + (seededRandom() - 0.5) * noise,
          category,
        })
      }
      break

    case "grid":
      const gridSize = Math.ceil(Math.sqrt(numSamples))
      for (let i = 0; i < numSamples; i++) {
        const row = Math.floor(i / gridSize)
        const col = i % gridSize
        const category = (row + col) % 3

        data.push({
          x: (col / gridSize) * 4 - 2 + (seededRandom() - 0.5) * noise,
          y: (row / gridSize) * 4 - 2 + (seededRandom() - 0.5) * noise,
          category,
        })
      }
      break

    default:
      // Default to random points
      for (let i = 0; i < numSamples; i++) {
        data.push({
          x: (seededRandom() - 0.5) * 4,
          y: (seededRandom() - 0.5) * 4,
          category: Math.floor(seededRandom() * 3),
        })
      }
  }

  return data
}
