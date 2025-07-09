export interface DataPoint {
  x: number
  y: number
  category: number
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
        const category = i % 2
        const r = (i / numSamples) * 5
        const theta = (i / numSamples) * 4 * Math.PI + category * Math.PI
        const x = r * Math.cos(theta) + (seededRandom() - 0.5) * noise * 2
        const y = r * Math.sin(theta) + (seededRandom() - 0.5) * noise * 2
        data.push({ x, y, category })
      }
      break

    case "checkerboard":
      for (let i = 0; i < numSamples; i++) {
        const x = (seededRandom() - 0.5) * 10
        const y = (seededRandom() - 0.5) * 10
        const category = (Math.floor(x + 5) + Math.floor(y + 5)) % 2
        data.push({
          x: x + (seededRandom() - 0.5) * noise,
          y: y + (seededRandom() - 0.5) * noise,
          category,
        })
      }
      break

    case "moons":
      for (let i = 0; i < numSamples; i++) {
        const category = i % 2
        const angle = seededRandom() * Math.PI
        const radius = 2
        let x, y
        if (category === 0) {
          x = radius * Math.cos(angle)
          y = radius * Math.sin(angle)
        } else {
          x = radius * Math.cos(angle) + radius
          y = -radius * Math.sin(angle) + 1
        }
        data.push({
          x: x + (seededRandom() - 0.5) * noise,
          y: y + (seededRandom() - 0.5) * noise,
          category,
        })
      }
      break

    case "gaussian":
      for (let i = 0; i < numSamples; i++) {
        const category = i % 3
        const centerX = category === 0 ? -2 : category === 1 ? 2 : 0
        const centerY = category === 0 ? -2 : category === 1 ? -2 : 2
        const x = centerX + (seededRandom() - 0.5) * 2 + (seededRandom() - 0.5) * noise
        const y = centerY + (seededRandom() - 0.5) * 2 + (seededRandom() - 0.5) * noise
        data.push({ x, y, category })
      }
      break

    case "grid":
      const gridSize = Math.ceil(Math.sqrt(numSamples))
      for (let i = 0; i < numSamples; i++) {
        const row = Math.floor(i / gridSize)
        const col = i % gridSize
        const x = (col - gridSize / 2) * 2 + (seededRandom() - 0.5) * noise
        const y = (row - gridSize / 2) * 2 + (seededRandom() - 0.5) * noise
        const category = (row + col) % 3
        data.push({ x, y, category })
      }
      break

    default:
      throw new Error(`Unknown dataset type: ${datasetType}`)
  }

  return data
}
