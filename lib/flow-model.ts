// Mathematical dataset generators for flow-based art

export interface DataPoint {
  x: number
  y: number
  cluster?: number
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

export function generateDataset(dataset: string, seed: number, numSamples: number, noise: number): DataPoint[] {
  const rng = new SeededRandom(seed)
  const points: DataPoint[] = []

  switch (dataset) {
    case "spiral":
      return generateSpiral(rng, numSamples, noise)
    case "moons":
      return generateMoons(rng, numSamples, noise)
    case "circles":
      return generateCircles(rng, numSamples, noise)
    case "checkerboard":
      return generateCheckerboard(rng, numSamples, noise)
    case "swiss_roll":
      return generateSwissRoll(rng, numSamples, noise)
    case "s_curve":
      return generateSCurve(rng, numSamples, noise)
    case "blobs":
      return generateBlobs(rng, numSamples, noise)
    case "aniso":
      return generateAnisotropic(rng, numSamples, noise)
    default:
      return generateSpiral(rng, numSamples, noise)
  }
}

function generateSpiral(rng: SeededRandom, numSamples: number, noise: number): DataPoint[] {
  const points: DataPoint[] = []

  for (let i = 0; i < numSamples; i++) {
    const t = (i / numSamples) * 4 * Math.PI
    const r = t / (4 * Math.PI)

    const x = r * Math.cos(t) + noise * rng.gaussian()
    const y = r * Math.sin(t) + noise * rng.gaussian()

    points.push({ x, y, cluster: Math.floor(t / (2 * Math.PI)) })
  }

  return points
}

function generateMoons(rng: SeededRandom, numSamples: number, noise: number): DataPoint[] {
  const points: DataPoint[] = []
  const samplesPerMoon = Math.floor(numSamples / 2)

  // First moon
  for (let i = 0; i < samplesPerMoon; i++) {
    const t = (i / samplesPerMoon) * Math.PI
    const x = Math.cos(t) + noise * rng.gaussian()
    const y = Math.sin(t) + noise * rng.gaussian()
    points.push({ x, y, cluster: 0 })
  }

  // Second moon
  for (let i = 0; i < numSamples - samplesPerMoon; i++) {
    const t = (i / (numSamples - samplesPerMoon)) * Math.PI
    const x = 1 - Math.cos(t) + noise * rng.gaussian()
    const y = 1 - Math.sin(t) - 0.5 + noise * rng.gaussian()
    points.push({ x, y, cluster: 1 })
  }

  return points
}

function generateCircles(rng: SeededRandom, numSamples: number, noise: number): DataPoint[] {
  const points: DataPoint[] = []

  for (let i = 0; i < numSamples; i++) {
    const cluster = Math.floor(rng.next() * 3)
    const radius = (cluster + 1) * 0.5
    const angle = rng.next() * 2 * Math.PI

    const x = radius * Math.cos(angle) + noise * rng.gaussian()
    const y = radius * Math.sin(angle) + noise * rng.gaussian()

    points.push({ x, y, cluster })
  }

  return points
}

function generateCheckerboard(rng: SeededRandom, numSamples: number, noise: number): DataPoint[] {
  const points: DataPoint[] = []

  for (let i = 0; i < numSamples; i++) {
    const x = rng.next() * 4 - 2
    const y = rng.next() * 4 - 2

    const gridX = Math.floor((x + 2) * 2)
    const gridY = Math.floor((y + 2) * 2)
    const cluster = (gridX + gridY) % 2

    const noisyX = x + noise * rng.gaussian()
    const noisyY = y + noise * rng.gaussian()

    points.push({ x: noisyX, y: noisyY, cluster })
  }

  return points
}

function generateSwissRoll(rng: SeededRandom, numSamples: number, noise: number): DataPoint[] {
  const points: DataPoint[] = []

  for (let i = 0; i < numSamples; i++) {
    const t = (i / numSamples) * 3 * Math.PI
    const height = rng.next() * 2 - 1

    const x = t * Math.cos(t) + noise * rng.gaussian()
    const y = height + noise * rng.gaussian()

    points.push({ x, y, cluster: Math.floor(t / Math.PI) })
  }

  return points
}

function generateSCurve(rng: SeededRandom, numSamples: number, noise: number): DataPoint[] {
  const points: DataPoint[] = []

  for (let i = 0; i < numSamples; i++) {
    const t = (i / numSamples) * 2 * Math.PI
    const x = Math.sin(t) + noise * rng.gaussian()
    const y = Math.sign(Math.sin(t)) * (Math.cos(t) - 1) + noise * rng.gaussian()

    points.push({ x, y, cluster: Math.sin(t) > 0 ? 0 : 1 })
  }

  return points
}

function generateBlobs(rng: SeededRandom, numSamples: number, noise: number): DataPoint[] {
  const points: DataPoint[] = []
  const centers = [
    { x: -1, y: -1 },
    { x: 1, y: -1 },
    { x: 0, y: 1 },
  ]

  for (let i = 0; i < numSamples; i++) {
    const cluster = Math.floor(rng.next() * centers.length)
    const center = centers[cluster]

    const x = center.x + 0.5 * rng.gaussian() + noise * rng.gaussian()
    const y = center.y + 0.5 * rng.gaussian() + noise * rng.gaussian()

    points.push({ x, y, cluster })
  }

  return points
}

function generateAnisotropic(rng: SeededRandom, numSamples: number, noise: number): DataPoint[] {
  const points: DataPoint[] = []

  for (let i = 0; i < numSamples; i++) {
    const cluster = Math.floor(rng.next() * 2)

    let x, y
    if (cluster === 0) {
      x = rng.gaussian() * 2 + noise * rng.gaussian()
      y = rng.gaussian() * 0.5 + noise * rng.gaussian()
    } else {
      x = rng.gaussian() * 0.5 + 2 + noise * rng.gaussian()
      y = rng.gaussian() * 2 + noise * rng.gaussian()
    }

    points.push({ x, y, cluster })
  }

  return points
}
