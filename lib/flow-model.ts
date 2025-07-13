export interface DataPoint {
  x: number
  y: number
  cluster?: number
}

export class FlowModel {
  static generateDataset(type: string, samples = 1000, seed = 42, noise = 0.05): DataPoint[] {
    // Simple seeded random number generator
    let rng = seed
    const random = () => {
      rng = (rng * 9301 + 49297) % 233280
      return rng / 233280
    }

    const points: DataPoint[] = []

    switch (type) {
      case "spiral":
        return this.generateSpiral(samples, random, noise)
      case "moons":
        return this.generateMoons(samples, random, noise)
      case "circles":
        return this.generateCircles(samples, random, noise)
      case "checkerboard":
        return this.generateCheckerboard(samples, random, noise)
      case "swiss_roll":
        return this.generateSwissRoll(samples, random, noise)
      case "s_curve":
        return this.generateSCurve(samples, random, noise)
      case "blobs":
        return this.generateBlobs(samples, random, noise)
      case "rings":
        return this.generateRings(samples, random, noise)
      default:
        return this.generateSpiral(samples, random, noise)
    }
  }

  private static generateSpiral(samples: number, random: () => number, noise: number): DataPoint[] {
    const points: DataPoint[] = []
    for (let i = 0; i < samples; i++) {
      const t = (i / samples) * 4 * Math.PI
      const r = t / (4 * Math.PI)
      const x = r * Math.cos(t) + (random() - 0.5) * noise
      const y = r * Math.sin(t) + (random() - 0.5) * noise
      points.push({ x, y, cluster: Math.floor(t / (2 * Math.PI)) })
    }
    return points
  }

  private static generateMoons(samples: number, random: () => number, noise: number): DataPoint[] {
    const points: DataPoint[] = []
    const samplesPerMoon = Math.floor(samples / 2)

    // First moon
    for (let i = 0; i < samplesPerMoon; i++) {
      const t = (i / samplesPerMoon) * Math.PI
      const x = Math.cos(t) + (random() - 0.5) * noise
      const y = Math.sin(t) + (random() - 0.5) * noise
      points.push({ x, y, cluster: 0 })
    }

    // Second moon
    for (let i = 0; i < samples - samplesPerMoon; i++) {
      const t = (i / (samples - samplesPerMoon)) * Math.PI
      const x = 1 - Math.cos(t) + (random() - 0.5) * noise
      const y = 0.5 - Math.sin(t) + (random() - 0.5) * noise
      points.push({ x, y, cluster: 1 })
    }

    return points
  }

  private static generateCircles(samples: number, random: () => number, noise: number): DataPoint[] {
    const points: DataPoint[] = []
    const samplesPerCircle = Math.floor(samples / 3)

    for (let circle = 0; circle < 3; circle++) {
      const radius = (circle + 1) * 0.5
      const samplesThisCircle = circle === 2 ? samples - 2 * samplesPerCircle : samplesPerCircle

      for (let i = 0; i < samplesThisCircle; i++) {
        const t = (i / samplesThisCircle) * 2 * Math.PI
        const x = radius * Math.cos(t) + (random() - 0.5) * noise
        const y = radius * Math.sin(t) + (random() - 0.5) * noise
        points.push({ x, y, cluster: circle })
      }
    }

    return points
  }

  private static generateCheckerboard(samples: number, random: () => number, noise: number): DataPoint[] {
    const points: DataPoint[] = []
    const gridSize = 8

    for (let i = 0; i < samples; i++) {
      const x = random() * gridSize - gridSize / 2
      const y = random() * gridSize - gridSize / 2
      const cluster = (Math.floor(x + gridSize / 2) + Math.floor(y + gridSize / 2)) % 2
      points.push({
        x: x + (random() - 0.5) * noise,
        y: y + (random() - 0.5) * noise,
        cluster,
      })
    }

    return points
  }

  private static generateSwissRoll(samples: number, random: () => number, noise: number): DataPoint[] {
    const points: DataPoint[] = []

    for (let i = 0; i < samples; i++) {
      const t = (i / samples) * 3 * Math.PI
      const x = t * Math.cos(t) + (random() - 0.5) * noise
      const y = random() * 2 - 1 + (random() - 0.5) * noise
      points.push({ x, y, cluster: Math.floor(t / Math.PI) })
    }

    return points
  }

  private static generateSCurve(samples: number, random: () => number, noise: number): DataPoint[] {
    const points: DataPoint[] = []

    for (let i = 0; i < samples; i++) {
      const t = (i / samples) * 2 * Math.PI
      const x = Math.sin(t) + (random() - 0.5) * noise
      const y = Math.sign(Math.sin(t)) * (Math.cos(t) - 1) + (random() - 0.5) * noise
      points.push({ x, y, cluster: Math.floor(t / Math.PI) })
    }

    return points
  }

  private static generateBlobs(samples: number, random: () => number, noise: number): DataPoint[] {
    const points: DataPoint[] = []
    const centers = [
      { x: -2, y: -2 },
      { x: 2, y: -2 },
      { x: 0, y: 2 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
    ]

    for (let i = 0; i < samples; i++) {
      const center = centers[i % centers.length]
      const angle = random() * 2 * Math.PI
      const radius = Math.sqrt(random()) * 0.8
      const x = center.x + radius * Math.cos(angle) + (random() - 0.5) * noise
      const y = center.y + radius * Math.sin(angle) + (random() - 0.5) * noise
      points.push({ x, y, cluster: i % centers.length })
    }

    return points
  }

  private static generateRings(samples: number, random: () => number, noise: number): DataPoint[] {
    const points: DataPoint[] = []
    const rings = [0.5, 1.0, 1.5, 2.0]

    for (let i = 0; i < samples; i++) {
      const ring = i % rings.length
      const radius = rings[ring]
      const t = random() * 2 * Math.PI
      const x = radius * Math.cos(t) + (random() - 0.5) * noise
      const y = radius * Math.sin(t) + (random() - 0.5) * noise
      points.push({ x, y, cluster: ring })
    }

    return points
  }

  static applyScenarioBlending(points: DataPoint[], scenario: string): DataPoint[] {
    if (scenario === "none") return points

    // Apply scenario-specific transformations
    switch (scenario) {
      case "enchanted_forest":
        return points.map((p) => ({
          ...p,
          x: p.x + Math.sin(p.y * 3) * 0.1,
          y: p.y + Math.cos(p.x * 3) * 0.1,
        }))
      case "deep_ocean":
        return points.map((p) => ({
          ...p,
          x: p.x + Math.sin(p.y * 2) * 0.2,
          y: p.y + Math.sin(p.x * 1.5) * 0.15,
        }))
      case "cosmic_nebula":
        return points.map((p) => ({
          ...p,
          x: p.x * (1 + Math.sin(p.y) * 0.1),
          y: p.y * (1 + Math.cos(p.x) * 0.1),
        }))
      default:
        return points
    }
  }
}
