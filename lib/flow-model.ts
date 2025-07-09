export interface DataPoint {
  x: number
  y: number
  category?: number
  scenario?: string
  objectType?: string
}

export interface ScenarioConfig {
  name: string
  objects: ScenarioObject[]
  backgroundColor: string
  ambientColor: string
  density: number
}

export interface ScenarioObject {
  type: string
  probability: number
  sizeRange: [number, number]
  colorVariations: string[]
  shapes: string[]
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

  choice<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)]
  }
}

// Scenario definitions for creative blending
const SCENARIOS: Record<string, ScenarioConfig> = {
  forest: {
    name: "Enchanted Forest",
    objects: [
      {
        type: "tree",
        probability: 0.4,
        sizeRange: [0.5, 2.0],
        colorVariations: ["#2d5016", "#4a7c59", "#8fbc8f", "#228b22"],
        shapes: ["pine", "oak", "birch", "willow"],
      },
      {
        type: "mushroom",
        probability: 0.2,
        sizeRange: [0.1, 0.3],
        colorVariations: ["#ff6347", "#ffd700", "#9370db", "#ff69b4"],
        shapes: ["toadstool", "shiitake", "morel", "chanterelle"],
      },
      {
        type: "flower",
        probability: 0.3,
        sizeRange: [0.05, 0.2],
        colorVariations: ["#ff1493", "#00bfff", "#ffd700", "#ff6347"],
        shapes: ["rose", "daisy", "tulip", "lily"],
      },
      {
        type: "butterfly",
        probability: 0.1,
        sizeRange: [0.03, 0.08],
        colorVariations: ["#ff69b4", "#00bfff", "#ffd700", "#9370db"],
        shapes: ["monarch", "swallowtail", "blue", "skipper"],
      },
    ],
    backgroundColor: "#0f2027",
    ambientColor: "#2c5530",
    density: 0.6,
  },
  ocean: {
    name: "Deep Ocean",
    objects: [
      {
        type: "fish",
        probability: 0.3,
        sizeRange: [0.1, 0.4],
        colorVariations: ["#ff6347", "#ffd700", "#00bfff", "#ff69b4"],
        shapes: ["tropical", "angelfish", "clownfish", "tang"],
      },
      {
        type: "coral",
        probability: 0.4,
        sizeRange: [0.2, 0.8],
        colorVariations: ["#ff7f50", "#ff69b4", "#ffd700", "#9370db"],
        shapes: ["brain", "staghorn", "table", "pillar"],
      },
      {
        type: "seaweed",
        probability: 0.2,
        sizeRange: [0.3, 1.2],
        colorVariations: ["#2e8b57", "#3cb371", "#20b2aa", "#008b8b"],
        shapes: ["kelp", "sea_lettuce", "rockweed", "bladder_wrack"],
      },
      {
        type: "jellyfish",
        probability: 0.1,
        sizeRange: [0.15, 0.5],
        colorVariations: ["#ff69b4", "#00bfff", "#9370db", "#ffd700"],
        shapes: ["moon", "box", "lion", "crystal"],
      },
    ],
    backgroundColor: "#001f3f",
    ambientColor: "#004080",
    density: 0.5,
  },
  space: {
    name: "Cosmic Nebula",
    objects: [
      {
        type: "star",
        probability: 0.5,
        sizeRange: [0.02, 0.1],
        colorVariations: ["#ffffff", "#ffd700", "#ff6347", "#00bfff"],
        shapes: ["dwarf", "giant", "supergiant", "neutron"],
      },
      {
        type: "planet",
        probability: 0.1,
        sizeRange: [0.3, 1.0],
        colorVariations: ["#ff6347", "#ffd700", "#00bfff", "#9370db"],
        shapes: ["terrestrial", "gas_giant", "ice_giant", "dwarf"],
      },
      {
        type: "asteroid",
        probability: 0.2,
        sizeRange: [0.05, 0.2],
        colorVariations: ["#696969", "#a0522d", "#8b4513", "#2f4f4f"],
        shapes: ["irregular", "spherical", "elongated", "fragmented"],
      },
      {
        type: "nebula",
        probability: 0.2,
        sizeRange: [0.8, 2.0],
        colorVariations: ["#ff69b4", "#9370db", "#00bfff", "#ffd700"],
        shapes: ["emission", "reflection", "planetary", "dark"],
      },
    ],
    backgroundColor: "#000011",
    ambientColor: "#1a0033",
    density: 0.4,
  },
  city: {
    name: "Cyberpunk Metropolis",
    objects: [
      {
        type: "building",
        probability: 0.4,
        sizeRange: [0.5, 2.5],
        colorVariations: ["#ff6347", "#00bfff", "#ffd700", "#9370db"],
        shapes: ["skyscraper", "tower", "dome", "pyramid"],
      },
      {
        type: "vehicle",
        probability: 0.2,
        sizeRange: [0.1, 0.3],
        colorVariations: ["#ff1493", "#00ff00", "#00bfff", "#ffd700"],
        shapes: ["hover_car", "drone", "bike", "transport"],
      },
      {
        type: "neon_sign",
        probability: 0.3,
        sizeRange: [0.2, 0.6],
        colorVariations: ["#ff1493", "#00ff00", "#00bfff", "#ff6347"],
        shapes: ["text", "symbol", "arrow", "circle"],
      },
      {
        type: "hologram",
        probability: 0.1,
        sizeRange: [0.3, 0.8],
        colorVariations: ["#00bfff", "#ff69b4", "#00ff00", "#ffd700"],
        shapes: ["avatar", "advertisement", "data", "interface"],
      },
    ],
    backgroundColor: "#0a0a0a",
    ambientColor: "#1a1a2e",
    density: 0.7,
  },
}

export function generateDataset(
  type: string,
  seed: number,
  numSamples: number,
  noise: number,
  scenario?: string,
): DataPoint[] {
  const rng = new SeededRandom(seed)
  let points: DataPoint[] = []

  // Generate base mathematical dataset
  switch (type) {
    case "spirals":
      points = generateSpirals(rng, numSamples, noise)
      break
    case "moons":
      points = generateMoons(rng, numSamples, noise)
      break
    case "checkerboard":
      points = generateCheckerboard(rng, numSamples, noise)
      break
    case "gaussian":
      points = generateGaussian(rng, numSamples, noise)
      break
    case "grid":
      points = generateGrid(rng, numSamples, noise)
      break
    case "neural":
      points = generateNeuralNetwork(rng, numSamples, noise)
      break
    default:
      points = generateSpirals(rng, numSamples, noise)
  }

  // Apply scenario blending if specified
  if (scenario && SCENARIOS[scenario]) {
    points = blendWithScenario(points, SCENARIOS[scenario], rng)
  }

  return points
}

function blendWithScenario(points: DataPoint[], scenarioConfig: ScenarioConfig, rng: SeededRandom): DataPoint[] {
  const blendedPoints: DataPoint[] = []

  points.forEach((point, index) => {
    // Determine if this point should become a scenario object
    if (rng.next() < scenarioConfig.density) {
      // Choose random object type based on probabilities
      let cumulativeProbability = 0
      let selectedObject: ScenarioObject | null = null

      for (const obj of scenarioConfig.objects) {
        cumulativeProbability += obj.probability
        if (rng.next() < cumulativeProbability) {
          selectedObject = obj
          break
        }
      }

      if (selectedObject) {
        // Create scenario object at this point
        const size =
          selectedObject.sizeRange[0] + rng.next() * (selectedObject.sizeRange[1] - selectedObject.sizeRange[0])

        blendedPoints.push({
          ...point,
          scenario: scenarioConfig.name,
          objectType: `${selectedObject.type}_${rng.choice(selectedObject.shapes)}`,
          category: point.category, // Preserve original category for coloring
        })

        // Add additional detail points around the main object
        const detailCount = Math.floor(size * 10)
        for (let i = 0; i < detailCount; i++) {
          const angle = rng.next() * 2 * Math.PI
          const distance = rng.next() * size * 0.5
          const detailX = point.x + Math.cos(angle) * distance
          const detailY = point.y + Math.sin(angle) * distance

          blendedPoints.push({
            x: detailX,
            y: detailY,
            category: point.category,
            scenario: scenarioConfig.name,
            objectType: `${selectedObject.type}_detail`,
          })
        }
      } else {
        blendedPoints.push(point)
      }
    } else {
      blendedPoints.push(point)
    }
  })

  return blendedPoints
}

// Base dataset generators (same as before)
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
      const angle = rng.next() * Math.PI
      const x = Math.cos(angle) + rng.nextGaussian() * noise
      const y = Math.sin(angle) + rng.nextGaussian() * noise
      points.push({ x, y, category })
    } else {
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

  for (let i = 0; i < numSamples; i++) {
    const x1 = rng.next() * 4 - 2
    const x2 = rng.next() * 4 - 2

    const w1 = 0.7,
      w2 = 0.3,
      w3 = -0.5,
      w4 = 0.8,
      w5 = 0.6,
      w6 = -0.4

    const l1_1 = x1
    const l1_2 = x2

    const z2_1 = w1 * l1_1 + w2 * l1_2
    const z2_2 = w3 * l1_1 + w4 * l1_2
    const l2_1 = Math.max(0, z2_1)
    const l2_2 = Math.max(0, z2_2)

    const z3 = w5 * l2_1 + w6 * l2_2
    const l3 = 2 / (1 + Math.exp(-z3)) - 1

    const output1 = Math.sin(l2_1 * 0.5) * Math.cos(l2_2 * 0.5)
    const output2 = l3 + Math.sin(x1 * 0.8) * 0.3 + Math.cos(x2 * 0.8) * 0.3

    const finalX = output1 + rng.nextGaussian() * noise
    const finalY = output2 + rng.nextGaussian() * noise

    const category = l2_1 > l2_2 ? 0 : 1

    points.push({ x: finalX, y: finalY, category })
  }

  return points
}

// Export scenario configurations for UI
export { SCENARIOS }
