export interface DataPoint {
  x: number
  y: number
  color?: string
}

export function seededRandom(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

export function generateDataset(type: string, seed: number, numSamples: number, noise: number): DataPoint[] {
  const random = seededRandom(seed)
  const data: DataPoint[] = []

  for (let i = 0; i < numSamples; i++) {
    const t = i / numSamples
    let x: number, y: number

    switch (type) {
      case "spiral":
        const angle = t * 8 * Math.PI
        const radius = t * 100
        x = radius * Math.cos(angle) + (random() - 0.5) * noise * 20
        y = radius * Math.sin(angle) + (random() - 0.5) * noise * 20
        break

      case "circle":
        const circleAngle = t * 2 * Math.PI
        const circleRadius = 80 + (random() - 0.5) * noise * 40
        x = circleRadius * Math.cos(circleAngle) + (random() - 0.5) * noise * 20
        y = circleRadius * Math.sin(circleAngle) + (random() - 0.5) * noise * 20
        break

      case "wave":
        x = t * 200 - 100 + (random() - 0.5) * noise * 20
        y = Math.sin(t * 4 * Math.PI) * 50 + (random() - 0.5) * noise * 20
        break

      case "fractal":
        const fractalX = (random() - 0.5) * 200
        const fractalY = (random() - 0.5) * 200
        x = fractalX + Math.sin(fractalX * 0.1) * 20 + (random() - 0.5) * noise * 20
        y = fractalY + Math.cos(fractalY * 0.1) * 20 + (random() - 0.5) * noise * 20
        break

      case "noise":
      default:
        x = (random() - 0.5) * 200 + (random() - 0.5) * noise * 50
        y = (random() - 0.5) * 200 + (random() - 0.5) * noise * 50
        break
    }

    data.push({ x, y })
  }

  return data
}
