/**
 * A simple seeded pseudo-random number generator (PRNG).
 * Not cryptographically secure, but sufficient for reproducible dataset generation.
 */
function createPrng(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

export interface GenerationParams {
  dataset: string
  scenario: string
  colorScheme: string
  seed: number
  numSamples: number
  noiseScale: number
  timeStep: number
}

export interface UpscaleParams extends GenerationParams {
  scaleFactor: number
  highResolution: boolean
  extraDetail: boolean
}

// Pure 4-color palettes for visual themes
const colorPalettes = {
  plasma: ["#0D001A", "#7209B7", "#F72585", "#FFBE0B"], // Deep purple to bright pink to yellow
  lava: ["#1A0000", "#8B0000", "#FF4500", "#FFD700"], // Deep red to orange to gold
  futuristic: ["#001122", "#00FFFF", "#0080FF", "#FFFFFF"], // Dark blue to cyan to white
  forest: ["#0F1B0F", "#228B22", "#32CD32", "#90EE90"], // Dark green to light green
  ocean: ["#000080", "#0066CC", "#00BFFF", "#E0F6FF"], // Deep blue to light blue
  sunset: ["#2D1B69", "#FF6B35", "#F7931E", "#FFD23F"], // Purple to orange to yellow
  arctic: ["#1E3A8A", "#60A5FA", "#E0F2FE", "#FFFFFF"], // Deep blue to white
  neon: ["#000000", "#FF00FF", "#00FF00", "#FFFF00"], // Black to bright neon colors
  vintage: ["#8B4513", "#CD853F", "#F4A460", "#FFF8DC"], // Brown to cream
  cosmic: ["#0B0B2F", "#4B0082", "#9370DB", "#FFD700"], // Deep space to gold
  toxic: ["#1A1A00", "#66FF00", "#CCFF00", "#FFFF99"], // Dark to bright green-yellow
  ember: ["#2D0A00", "#CC4400", "#FF8800", "#FFCC66"], // Dark brown to bright orange
}

// Seeded random number generator for consistent results
class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280
    return this.seed / 233280
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min)
  }

  gaussian(): number {
    // Box-Muller transform for Gaussian distribution
    const u1 = this.next()
    const u2 = this.next()
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  }
}

// Generate complex mathematical datasets
export function generateDataset(name: string, seed: number, n_samples: number, noise: number): number[][] {
  const rng = new SeededRandom(seed)

  switch (name) {
    case "spirals":
      return generateSpirals(rng, n_samples, noise)
    case "moons":
      return generateMoons(rng, n_samples, noise)
    case "circles":
      return generateCircles(rng, n_samples, noise)
    case "blobs":
      return generateBlobs(rng, n_samples, noise)
    case "checkerboard":
      return generateCheckerboard(rng, n_samples, noise)
    case "gaussian":
      return generateGaussian(rng, n_samples, noise)
    case "grid":
      return generateGrid(rng, n_samples, noise)
    case "fractal":
      return generateFractal(rng, n_samples, noise)
    case "mandelbrot":
      return generateMandelbrot(rng, n_samples, noise)
    case "julia":
      return generateJulia(rng, n_samples, noise)
    case "lorenz":
      return generateLorenz(rng, n_samples, noise)
    case "tribes":
      return generateTribes(rng, n_samples, noise)
    case "heads":
      return generateHeads(rng, n_samples, noise)
    case "natives":
      return generateNatives(rng, n_samples, noise)
    default:
      return generateSpirals(rng, n_samples, noise)
  }
}

// Classic dataset generators
function generateSpirals(rng: SeededRandom, n_samples: number, noise: number): number[][] {
  const data: number[][] = []
  const samplesPerSpiral = Math.floor(n_samples / 2)

  for (let i = 0; i < n_samples; i++) {
    const spiral = i < samplesPerSpiral ? 0 : 1
    const t = ((i % samplesPerSpiral) / samplesPerSpiral) * 4 * Math.PI

    const r = t * 0.1
    const x = r * Math.cos(t + spiral * Math.PI)
    const y = r * Math.sin(t + spiral * Math.PI)

    data.push([x + noise * rng.gaussian(), y + noise * rng.gaussian()])
  }

  return data
}

function generateMoons(rng: SeededRandom, n_samples: number, noise: number): number[][] {
  const data: number[][] = []
  const samplesPerMoon = Math.floor(n_samples / 2)

  for (let i = 0; i < n_samples; i++) {
    const moon = i < samplesPerMoon ? 0 : 1
    const t = ((i % samplesPerMoon) / samplesPerMoon) * Math.PI

    let x, y
    if (moon === 0) {
      x = Math.cos(t)
      y = Math.sin(t)
    } else {
      x = 1 - Math.cos(t)
      y = 1 - Math.sin(t) - 0.5
    }

    data.push([x + noise * rng.gaussian(), y + noise * rng.gaussian()])
  }

  return data
}

function generateCircles(rng: SeededRandom, n_samples: number, noise: number): number[][] {
  const data: number[][] = []

  for (let i = 0; i < n_samples; i++) {
    const r = rng.next() < 0.5 ? 0.5 : 1.5
    const t = rng.next() * 2 * Math.PI

    const x = r * Math.cos(t)
    const y = r * Math.sin(t)

    data.push([x + noise * rng.gaussian(), y + noise * rng.gaussian()])
  }

  return data
}

function generateBlobs(rng: SeededRandom, n_samples: number, noise: number): number[][] {
  const data: number[][] = []
  const centers = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]

  for (let i = 0; i < n_samples; i++) {
    const center = centers[Math.floor(rng.next() * centers.length)]
    const r = rng.next() * 0.5
    const t = rng.next() * 2 * Math.PI

    const x = center[0] + r * Math.cos(t)
    const y = center[1] + r * Math.sin(t)

    data.push([x + noise * rng.gaussian(), y + noise * rng.gaussian()])
  }

  return data
}

function generateCheckerboard(rng: SeededRandom, n_samples: number, noise: number): number[][] {
  const data: number[][] = []

  for (let i = 0; i < n_samples; i++) {
    const x = rng.range(-2, 2)
    const y = rng.range(-2, 2)

    const checkX = Math.floor(x + 2)
    const checkY = Math.floor(y + 2)

    if ((checkX + checkY) % 2 === 0) {
      data.push([x + noise * rng.gaussian(), y + noise * rng.gaussian()])
    }
  }

  // Fill remaining samples if needed
  while (data.length < n_samples) {
    const x = rng.range(-2, 2)
    const y = rng.range(-2, 2)
    data.push([x + noise * rng.gaussian(), y + noise * rng.gaussian()])
  }

  return data
}

function generateGaussian(rng: SeededRandom, n_samples: number, noise: number): number[][] {
  const data: number[][] = []

  for (let i = 0; i < n_samples; i++) {
    const x = rng.gaussian()
    const y = rng.gaussian()

    data.push([x + noise * rng.gaussian(), y + noise * rng.gaussian()])
  }

  return data
}

function generateGrid(rng: SeededRandom, n_samples: number, noise: number): number[][] {
  const data: number[][] = []
  const gridSize = Math.ceil(Math.sqrt(n_samples))

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize && data.length < n_samples; j++) {
      const x = (i / (gridSize - 1)) * 4 - 2
      const y = (j / (gridSize - 1)) * 4 - 2

      data.push([x + noise * rng.gaussian(), y + noise * rng.gaussian()])
    }
  }

  return data
}

function generateFractal(rng: SeededRandom, n_samples: number, noise: number): number[][] {
  const data: number[][] = []

  for (let i = 0; i < n_samples; i++) {
    let x = 0,
      y = 0

    // Sierpinski triangle-like fractal
    for (let iter = 0; iter < 10; iter++) {
      const choice = Math.floor(rng.next() * 3)
      const scale = 0.5

      switch (choice) {
        case 0:
          x = x * scale
          y = y * scale
          break
        case 1:
          x = x * scale + 0.5
          y = y * scale
          break
        case 2:
          x = x * scale + 0.25
          y = y * scale + 0.5
          break
      }
    }

    data.push([(x - 0.25) * 4 + noise * rng.gaussian(), (y - 0.25) * 4 + noise * rng.gaussian()])
  }

  return data
}

function generateMandelbrot(rng: SeededRandom, n_samples: number, noise: number): number[][] {
  const data: number[][] = []

  for (let i = 0; i < n_samples; i++) {
    const cx = rng.range(-2, 1)
    const cy = rng.range(-1.5, 1.5)

    let zx = 0,
      zy = 0
    let iterations = 0
    const maxIter = 100

    while (zx * zx + zy * zy < 4 && iterations < maxIter) {
      const temp = zx * zx - zy * zy + cx
      zy = 2 * zx * zy + cy
      zx = temp
      iterations++
    }

    if (iterations < maxIter) {
      data.push([cx + noise * rng.gaussian(), cy + noise * rng.gaussian()])
    }
  }

  // Fill remaining samples if needed
  while (data.length < n_samples) {
    const x = rng.range(-2, 2)
    const y = rng.range(-2, 2)
    data.push([x + noise * rng.gaussian(), y + noise * rng.gaussian()])
  }

  return data
}

function generateJulia(rng: SeededRandom, n_samples: number, noise: number): number[][] {
  const data: number[][] = []
  const c = { x: -0.7, y: 0.27015 } // Julia set parameter

  for (let i = 0; i < n_samples; i++) {
    let zx = rng.range(-2, 2)
    let zy = rng.range(-2, 2)
    let iterations = 0
    const maxIter = 100

    while (zx * zx + zy * zy < 4 && iterations < maxIter) {
      const temp = zx * zx - zy * zy + c.x
      zy = 2 * zx * zy + c.y
      zx = temp
      iterations++
    }

    if (iterations < maxIter) {
      data.push([zx * 0.5 + noise * rng.gaussian(), zy * 0.5 + noise * rng.gaussian()])
    }
  }

  // Fill remaining samples if needed
  while (data.length < n_samples) {
    const x = rng.range(-2, 2)
    const y = rng.range(-2, 2)
    data.push([x + noise * rng.gaussian(), y + noise * rng.gaussian()])
  }

  return data
}

function generateLorenz(rng: SeededRandom, n_samples: number, noise: number): number[][] {
  const data: number[][] = []

  let x = 1,
    y = 1,
    z = 1
  const dt = 0.01
  const sigma = 10,
    rho = 28,
    beta = 8 / 3

  for (let i = 0; i < n_samples; i++) {
    const dx = sigma * (y - x)
    const dy = x * (rho - z) - y
    const dz = x * y - beta * z

    x += dx * dt
    y += dy * dt
    z += dz * dt

    data.push([x * 0.05 + noise * rng.gaussian(), y * 0.05 + noise * rng.gaussian()])
  }

  return data
}

function generateTribes(rng: SeededRandom, n_samples: number, noise: number): number[][] {
  const data: number[][] = []
  const villages = [
    { x: -1.5, y: -1, size: 0.8 },
    { x: 1.5, y: -1, size: 0.6 },
    { x: 0, y: 1.5, size: 1.0 },
    { x: -0.8, y: 0.3, size: 0.5 },
    { x: 0.8, y: 0.3, size: 0.7 },
  ]

  for (let i = 0; i < n_samples; i++) {
    const village = villages[Math.floor(rng.next() * villages.length)]
    const r = rng.next() * village.size
    const t = rng.next() * 2 * Math.PI

    const x = village.x + r * Math.cos(t)
    const y = village.y + r * Math.sin(t)

    data.push([x + noise * rng.gaussian(), y + noise * rng.gaussian()])
  }

  return data
}

function generateHeads(rng: SeededRandom, n_samples: number, noise: number): number[][] {
  const data: number[][] = []

  for (let i = 0; i < n_samples; i++) {
    const t = (i / n_samples) * 2 * Math.PI
    const r = 1 + 0.3 * Math.sin(5 * t) // Face outline

    let x = r * Math.cos(t)
    let y = r * Math.sin(t)

    // Add facial features
    if (rng.next() < 0.1) {
      // Eyes
      x = rng.next() < 0.5 ? -0.3 : 0.3
      y = 0.3
    } else if (rng.next() < 0.05) {
      // Nose
      x = 0
      y = 0
    } else if (rng.next() < 0.08) {
      // Mouth
      x = (rng.next() - 0.5) * 0.6
      y = -0.3
    }

    data.push([x + noise * rng.gaussian(), y + noise * rng.gaussian()])
  }

  return data
}

function generateNatives(rng: SeededRandom, n_samples: number, noise: number): number[][] {
  const data: number[][] = []
  const settlements = [
    { x: -1.2, y: -0.8, type: "longhouse" },
    { x: 1.2, y: -0.8, type: "tipi" },
    { x: 0, y: 1.2, type: "pueblo" },
    { x: -0.6, y: 0.6, type: "hogan" },
    { x: 0.6, y: 0.6, type: "wigwam" },
  ]

  for (let i = 0; i < n_samples; i++) {
    const settlement = settlements[Math.floor(rng.next() * settlements.length)]

    let x, y
    switch (settlement.type) {
      case "longhouse":
        x = settlement.x + (rng.next() - 0.5) * 1.5
        y = settlement.y + (rng.next() - 0.5) * 0.4
        break
      case "tipi":
        const r = rng.next() * 0.6
        const t = rng.next() * 2 * Math.PI
        x = settlement.x + r * Math.cos(t)
        y = settlement.y + r * Math.sin(t)
        break
      default:
        x = settlement.x + (rng.next() - 0.5) * 0.8
        y = settlement.y + (rng.next() - 0.5) * 0.8
    }

    data.push([x + noise * rng.gaussian(), y + noise * rng.gaussian()])
  }

  return data
}

// Apply scenario transformations to dataset points
function applyScenarioTransform(
  points: number[][],
  scenario: string,
  rng: SeededRandom,
): Array<{ x: number; y: number; metadata: any }> {
  const transformedPoints: Array<{ x: number; y: number; metadata: any }> = []

  for (let i = 0; i < points.length; i++) {
    const [baseX, baseY] = points[i]
    let x = baseX
    let y = baseY
    let metadata: any = {}

    switch (scenario) {
      case "pure":
        // Pure mathematical - no transformation, just preserve the mathematical structure
        metadata = {
          magnitude: Math.sqrt(baseX * baseX + baseY * baseY),
          angle: Math.atan2(baseY, baseX),
          quadrant: baseX >= 0 ? (baseY >= 0 ? 1 : 4) : baseY >= 0 ? 2 : 3,
          isPrime: isPrime(Math.floor(Math.abs(baseX * 100) + Math.abs(baseY * 100))),
          harmonicSeries:
            Math.sin(baseX * Math.PI) + Math.sin(baseY * Math.PI * 2) / 2 + Math.sin(baseX * Math.PI * 3) / 3,
          fibonacci: fibonacciSpiral(baseX, baseY),
        }
        break

      case "forest":
        // Add complex tree-like growth patterns with L-systems
        const treeHeight = Math.abs(baseY) * 0.5 + rng.range(0, 0.3)
        const branchAngle = Math.atan2(baseY, baseX) + rng.range(-0.3, 0.3)
        const branchFactor = Math.sin(baseX * 3) * Math.cos(baseY * 2) * 0.2

        // Fractal branching
        let fractalX = 0,
          fractalY = 0
        for (let level = 0; level < 4; level++) {
          const scale = Math.pow(0.6, level)
          fractalX += Math.cos(branchAngle + level * 0.5) * scale * 0.1
          fractalY += Math.sin(branchAngle + level * 0.5) * scale * 0.1
        }

        x = baseX + branchFactor + fractalX
        y = baseY + treeHeight + fractalY

        metadata = {
          isTree: rng.next() < 0.15,
          treeHeight: treeHeight * 20,
          leafDensity: Math.abs(Math.sin(baseX * baseY)) * 0.8 + 0.2,
          branchComplexity: Math.abs(fractalX + fractalY) * 10,
          seasonalFactor: Math.sin(baseX + baseY + Math.PI / 4),
        }
        break

      case "cosmic":
        // Add stellar and nebula effects with gravitational lensing
        const distance = Math.sqrt(baseX * baseX + baseY * baseY)
        const angle = Math.atan2(baseY, baseX)

        // Galaxy spiral arms
        const spiralArm = angle + distance * 0.5 + Math.sin(distance * 3) * 0.2

        // Gravitational lensing effect
        const lensStrength = 1 / (1 + distance * distance)
        const lensX = Math.cos(spiralArm) * lensStrength * 0.1
        const lensY = Math.sin(spiralArm) * lensStrength * 0.1

        // Dark matter influence
        const darkMatterX = Math.sin(baseX * 0.5) * Math.cos(baseY * 0.3) * 0.05
        const darkMatterY = Math.cos(baseX * 0.3) * Math.sin(baseY * 0.5) * 0.05

        x = baseX + lensX + darkMatterX
        y = baseY + lensY + darkMatterY

        metadata = {
          isStar: rng.next() < 0.08,
          isBlackHole: rng.next() < 0.01,
          brightness: Math.max(0, 1 - distance * 0.5) * (1 + Math.sin(distance * 10) * 0.3),
          nebulaDensity: Math.abs(Math.sin(spiralArm)) * 0.6 + 0.4,
          redshift: distance * 0.1,
          stellarClass: Math.floor(rng.next() * 7), // O, B, A, F, G, K, M
        }
        break

      case "ocean":
        // Add complex wave and current effects with fluid dynamics
        const waveX = Math.sin(baseX * 2 + baseY * 0.5) * 0.2
        const waveY = Math.cos(baseY * 1.5 + baseX * 0.3) * 0.15

        // Turbulence and vortices
        const vortexStrength = Math.exp(-((baseX - 0.5) ** 2 + (baseY + 0.3) ** 2) * 2)
        const vortexAngle = Math.atan2(baseY + 0.3, baseX - 0.5)
        const vortexX = -Math.sin(vortexAngle) * vortexStrength * 0.3
        const vortexY = Math.cos(vortexAngle) * vortexStrength * 0.3

        // Tidal effects
        const tidalForce = Math.sin(baseX * 0.5) * Math.cos(baseY * 0.3) * 0.1

        x = baseX + waveX + vortexX
        y = baseY + waveY + vortexY + tidalForce

        metadata = {
          waveHeight: Math.abs(waveY) * 10,
          currentStrength: Math.sqrt((waveX + vortexX) ** 2 + (waveY + vortexY) ** 2),
          depth: Math.max(0, 1 - Math.abs(baseY) * 0.5),
          temperature: 15 + 10 * Math.sin(baseX * 0.2) + 5 * Math.cos(baseY * 0.3),
          salinity: 35 + 3 * Math.sin(baseX + baseY),
          isWhirlpool: vortexStrength > 0.5,
        }
        break

      case "neural":
        // Add complex neural network connections with synaptic dynamics
        const activation = Math.tanh(baseX * 0.8 + baseY * 0.6)
        const weight = Math.sin(baseX * 1.2) * Math.cos(baseY * 1.2)

        // Synaptic plasticity
        const plasticity = Math.exp(-Math.abs(activation) * 2) * 0.1
        const learningRate = 0.1 * (1 + Math.sin(baseX + baseY))

        // Dendritic branching
        const dendriticX = Math.sin(baseX * 5) * Math.cos(baseY * 3) * plasticity
        const dendriticY = Math.cos(baseX * 3) * Math.sin(baseY * 5) * plasticity

        x = baseX + activation * weight * 0.1 + dendriticX
        y = baseY + Math.sin(activation * Math.PI) * 0.1 + dendriticY

        metadata = {
          activation: activation,
          isNeuron: Math.abs(activation) > 0.3,
          connectionStrength: Math.abs(weight),
          layerDepth: Math.floor((baseX + 2) * 2.5),
          neurotransmitter: Math.floor(rng.next() * 4), // Different types
          firingRate: Math.max(0, activation * 50 + rng.gaussian() * 10),
          synapticDelay: Math.abs(weight) * 5 + 1,
        }
        break

      case "desert":
        // Add complex sand dune effects with wind patterns
        const duneHeight = Math.sin(baseX * 1.5) * Math.cos(baseY * 0.8) * 0.3
        const windDirection = Math.atan2(baseY, baseX) + Math.PI / 4
        const windStrength = 0.5 + 0.3 * Math.sin(baseX * 0.5 + baseY * 0.3)

        // Sand particle dynamics
        const sandShift = Math.sin(windDirection) * windStrength * 0.1
        const erosion = Math.cos(windDirection) * windStrength * 0.05

        // Oasis effect
        const oasisDistance = Math.sqrt((baseX - 0.8) ** 2 + (baseY + 0.5) ** 2)
        const oasisEffect = Math.exp(-oasisDistance * 3) * 0.2

        x = baseX + sandShift - erosion
        y = baseY + duneHeight + oasisEffect

        metadata = {
          duneHeight: duneHeight * 15,
          sandDensity: rng.next() * 0.5 + 0.5,
          windEffect: windStrength * 10,
          temperature: 35 + 15 * Math.sin(baseX * 0.3) + 10 * Math.cos(baseY * 0.2),
          isOasis: oasisDistance < 0.3,
          sandstormIntensity: Math.max(0, windStrength - 0.7) * 10,
        }
        break

      case "fire":
        // Add complex flame and ember effects with combustion dynamics
        const flameHeight = Math.abs(baseY) * 0.4 + rng.range(0, 0.2)
        const turbulence = Math.sin(baseX * 8 + baseY * 6) * 0.1
        const flicker = Math.sin(baseX * 5 + rng.range(0, Math.PI)) * 0.1

        // Heat convection
        const convectionX = Math.sin(baseY * 3) * Math.exp(-Math.abs(baseX) * 2) * 0.1
        const convectionY = Math.abs(baseX) * 0.2 + turbulence

        // Plasma dynamics
        const plasmaIntensity = Math.exp(-((baseX ** 2 + baseY ** 2) * 2)) * 0.3

        x = baseX + flicker + convectionX + turbulence
        y = baseY + flameHeight + convectionY

        metadata = {
          isEmber: rng.next() < 0.12,
          flameIntensity: flameHeight * 5 + plasmaIntensity * 10,
          heat: Math.max(0, 1 - Math.abs(baseY) * 0.3) * 1000 + 300,
          oxygenLevel: Math.max(0, 1 - plasmaIntensity) * 21,
          combustionRate: plasmaIntensity * 100,
          smokeParticle: rng.next() < 0.2,
        }
        break

      case "ice":
        // Add complex crystalline and frost effects with phase transitions
        const crystalGrowth = Math.abs(Math.sin(baseX * 3) * Math.cos(baseY * 3)) * 0.2
        const frostPattern = (Math.sin(baseX * 8) + Math.cos(baseY * 8)) * 0.05

        // Hexagonal crystal structure
        const hexAngle = Math.atan2(baseY, baseX)
        const hexRadius = Math.sqrt(baseX ** 2 + baseY ** 2)
        const hexSymmetry = Math.sin(hexAngle * 6) * Math.exp(-hexRadius * 2) * 0.1

        // Sublimation effects
        const sublimation = Math.sin(baseX * 2 + baseY * 2) * 0.02

        x = baseX + frostPattern + hexSymmetry
        y = baseY + crystalGrowth + sublimation

        metadata = {
          isCrystal: rng.next() < 0.1,
          crystallineStructure: crystalGrowth * 8,
          frostLevel: Math.abs(frostPattern) * 10,
          temperature: -20 + 10 * Math.sin(baseX * 0.2) - Math.abs(baseY) * 5,
          iceThickness: Math.max(0, 1 - hexRadius) * 10,
          phaseTransition: Math.abs(sublimation) > 0.01,
        }
        break

      case "sunset":
        // Add atmospheric light scattering with Rayleigh and Mie effects
        const altitude = baseY + 1
        const atmosphericDensity = Math.exp(-altitude * 2)

        // Rayleigh scattering (blue light)
        const rayleighScatter = atmosphericDensity * Math.pow(0.4, -4) * 0.1

        // Mie scattering (red/orange light)
        const mieScatter = atmosphericDensity * 0.05

        // Cloud formations
        const cloudDensity = Math.max(0, Math.sin(baseX * 2) * Math.cos(baseY * 1.5) + 0.3) * 0.2

        x = baseX + rayleighScatter * Math.sin(altitude * 5)
        y = baseY + mieScatter + cloudDensity

        metadata = {
          lightIntensity: Math.max(0, 1 - altitude * 0.5),
          colorTemperature: 2000 + 3000 * Math.exp(-altitude),
          atmosphericPressure: 1013 * atmosphericDensity,
          humidity: 60 + 30 * Math.sin(baseX + baseY),
          cloudCover: cloudDensity * 100,
          sunAngle: (Math.atan2(altitude, baseX) * 180) / Math.PI,
        }
        break

      case "monochrome":
        // Add complex grayscale patterns with mathematical beauty
        const intensity = Math.sqrt(baseX * baseX + baseY * baseY)
        const pattern = Math.sin(baseX + baseY) + Math.sin(baseX * 2) / 2 + Math.sin(baseY * 3) / 3

        // Interference patterns
        const wave1 = Math.sin(baseX * 5) * Math.cos(baseY * 3)
        const wave2 = Math.cos(baseX * 3) * Math.sin(baseY * 5)
        const interference = (wave1 + wave2) * 0.1

        x = baseX + interference
        y = baseY + pattern * 0.05

        metadata = {
          intensity: intensity,
          pattern: pattern,
          contrast: Math.abs(interference) * 10,
          frequency: Math.sqrt(baseX ** 2 * 25 + baseY ** 2 * 9),
          amplitude: Math.abs(wave1 + wave2),
          phase: Math.atan2(wave2, wave1),
        }
        break

      default:
        // Default case with basic transformations
        metadata = {
          intensity: Math.sqrt(baseX * baseX + baseY * baseY),
          pattern: Math.sin(baseX + baseY),
        }
    }

    transformedPoints.push({ x, y, metadata })
  }

  return transformedPoints
}

// Helper functions
function isPrime(n: number): boolean {
  if (n < 2) return false
  if (n === 2) return true
  if (n % 2 === 0) return false
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false
  }
  return true
}

function fibonacciSpiral(x: number, y: number): number {
  const phi = (1 + Math.sqrt(5)) / 2
  const r = Math.sqrt(x * x + y * y)
  const theta = Math.atan2(y, x)
  return Math.sin(theta * phi + r * phi) * Math.exp(-r * 0.5)
}

export function generateFlowField(params: GenerationParams): string {
  return generateHighResFlowField({ ...params, scaleFactor: 1, highResolution: false, extraDetail: false })
}

export function generateHighResFlowField(params: UpscaleParams): string {
  const {
    dataset,
    scenario,
    colorScheme,
    seed,
    numSamples,
    noiseScale,
    timeStep,
    scaleFactor,
    highResolution,
    extraDetail,
  } = params

  // Calculate enhanced parameters for upscaling
  const baseSize = 512
  const size = baseSize * scaleFactor
  const enhancedSamples = highResolution ? numSamples * scaleFactor * scaleFactor : numSamples

  const rng = new SeededRandom(seed)
  const colors = colorPalettes[colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma

  // Generate base dataset
  const basePoints = generateDataset(dataset, seed, enhancedSamples, noiseScale)

  // Apply scenario transformation
  const transformedPoints = applyScenarioTransform(basePoints, scenario, rng)

  let svgContent = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`

  // Add background gradient based on color palette
  svgContent += `
    <defs>
      <radialGradient id="bg-${seed}" cx="50%" cy="50%" r="70%">
        <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:0.9"/>
        <stop offset="100%" style="stop-color:${colors[1]};stop-opacity:1"/>
      </radialGradient>
    </defs>
    <rect width="${size}" height="${size}" fill="url(#bg-${seed})"/>
  `

  const centerX = size / 2
  const centerY = size / 2
  const scale = size / 8

  // Render points with scenario-specific styling but color palette colors
  for (let i = 0; i < transformedPoints.length; i++) {
    const point = transformedPoints[i]
    const screenX = centerX + point.x * scale
    const screenY = centerY + point.y * scale

    if (screenX >= 0 && screenX <= size && screenY >= 0 && screenY <= size) {
      // Use color palette for coloring (cycle through the 4 colors)
      const colorIndex = Math.floor((i / transformedPoints.length) * 4) % 4
      let pointColor = colors[colorIndex]

      let radius = 1
      let opacity = 0.6
      let strokeWidth = 0
      let stroke = "none"

      // Apply scenario-specific sizing and effects (but not colors)
      switch (scenario) {
        case "pure":
          // Pure mathematical visualization with enhanced complexity
          radius = 0.8 + point.metadata.magnitude * 0.5 + Math.abs(point.metadata.harmonicSeries) * 0.3
          opacity = 0.7 + (point.metadata.magnitude / 3) * 0.3

          // Special highlighting for prime numbers and Fibonacci points
          if (point.metadata.isPrime) {
            radius *= 1.5
            stroke = colors[3]
            strokeWidth = 0.5
          }
          if (Math.abs(point.metadata.fibonacci) > 0.5) {
            stroke = colors[2]
            strokeWidth = 0.3
          }
          break

        case "forest":
          radius = 0.5 + point.metadata.leafDensity * 2 + point.metadata.branchComplexity * 0.1
          opacity = 0.4 + point.metadata.leafDensity * 0.4 + Math.abs(point.metadata.seasonalFactor) * 0.2
          if (point.metadata.isTree) {
            // Draw complex tree structure
            const branchHeight = point.metadata.treeHeight
            const branchComplexity = point.metadata.branchComplexity

            for (let branch = 0; branch < Math.min(branchComplexity, 5); branch++) {
              const branchAngle = ((branch / branchComplexity) * Math.PI) / 3 - Math.PI / 6
              const branchLength = branchHeight * (1 - branch * 0.2)
              const endX = screenX + Math.sin(branchAngle) * branchLength
              const endY = screenY + branchLength

              svgContent += `<line x1="${screenX}" y1="${screenY}" x2="${endX}" y2="${endY}" stroke="${colors[2]}" stroke-width="${2 - branch * 0.3}" opacity="0.7"/>`
            }
            radius = 3 + rng.range(0, 4)
            opacity = 0.8
          }
          break

        case "cosmic":
          radius = 0.3 + point.metadata.brightness * 3
          opacity = 0.2 + point.metadata.brightness * 0.8

          if (point.metadata.isStar) {
            radius = 2 + rng.range(0, 3) + point.metadata.stellarClass * 0.5
            opacity = 0.9
            stroke = colors[3]
            strokeWidth = 0.5

            // Add stellar corona
            svgContent += `<circle cx="${screenX}" cy="${screenY}" r="${radius * 2}" fill="none" stroke="${colors[3]}" stroke-width="0.2" opacity="0.3"/>`
          }

          if (point.metadata.isBlackHole) {
            // Draw event horizon
            svgContent += `<circle cx="${screenX}" cy="${screenY}" r="${radius * 3}" fill="${colors[0]}" opacity="0.8"/>`
            svgContent += `<circle cx="${screenX}" cy="${screenY}" r="${radius * 4}" fill="none" stroke="${colors[1]}" stroke-width="1" opacity="0.5"/>`
          }
          break

        case "ocean":
          radius = 0.4 + point.metadata.depth * 2
          opacity = 0.3 + point.metadata.depth * 0.5

          if (point.metadata.isWhirlpool) {
            // Draw whirlpool spiral
            for (let spiral = 0; spiral < 3; spiral++) {
              const spiralRadius = radius * (3 - spiral)
              const spiralOpacity = opacity * (0.8 - spiral * 0.2)
              svgContent += `<circle cx="${screenX}" cy="${screenY}" r="${spiralRadius}" fill="none" stroke="${colors[1]}" stroke-width="0.5" opacity="${spiralOpacity}"/>`
            }
          }
          break

        case "neural":
          radius = 0.5 + Math.abs(point.metadata.activation) * 2 + point.metadata.firingRate * 0.02
          opacity = 0.3 + Math.abs(point.metadata.activation) * 0.6

          if (point.metadata.isNeuron) {
            stroke = colors[3]
            strokeWidth = 0.5 + point.metadata.connectionStrength * 0.5

            // Add synaptic connections with delay visualization
            if (point.metadata.synapticDelay > 3) {
              svgContent += `<circle cx="${screenX}" cy="${screenY}" r="${radius * 1.5}" fill="none" stroke="${colors[2]}" stroke-width="0.3" opacity="0.4"/>`
            }
          }
          break

        case "fire":
          radius = 0.4 + point.metadata.heat * 0.001 + point.metadata.combustionRate * 0.01
          opacity = 0.4 + (point.metadata.heat - 300) * 0.0005

          if (point.metadata.isEmber) {
            radius = 1 + rng.range(0, 2)
            opacity = 0.9
            stroke = colors[3]
            strokeWidth = 0.3
          }

          if (point.metadata.smokeParticle) {
            opacity *= 0.5
            radius *= 1.5
          }
          break

        case "ice":
          radius = 0.3 + point.metadata.crystallineStructure * 0.3 + point.metadata.iceThickness * 0.1
          opacity = 0.5 + point.metadata.frostLevel * 0.04

          if (point.metadata.isCrystal) {
            stroke = colors[3]
            strokeWidth = 0.3

            // Draw hexagonal crystal structure
            const hexSize = radius * 0.8
            let hexPath = `M ${screenX + hexSize} ${screenY}`
            for (let i = 1; i < 6; i++) {
              const angle = (i * Math.PI) / 3
              const hexX = screenX + hexSize * Math.cos(angle)
              const hexY = screenY + hexSize * Math.sin(angle)
              hexPath += ` L ${hexX} ${hexY}`
            }
            hexPath += " Z"
            svgContent += `<path d="${hexPath}" fill="none" stroke="${colors[2]}" stroke-width="0.2" opacity="0.6"/>`
          }
          break

        case "sunset":
          radius = 0.4 + point.metadata.lightIntensity * 1.5
          opacity = 0.3 + point.metadata.lightIntensity * 0.5

          // Color temperature affects the color choice
          const tempFactor = (point.metadata.colorTemperature - 2000) / 3000
          const tempColorIndex = Math.floor(tempFactor * 3) % 4
          pointColor = colors[tempColorIndex]

          if (point.metadata.cloudCover > 50) {
            opacity *= 0.7
            radius *= 1.3
          }
          break

        case "desert":
          radius = 0.4 + point.metadata.sandDensity * 1.5 + point.metadata.duneHeight * 0.1
          opacity = 0.3 + point.metadata.sandDensity * 0.4

          if (point.metadata.isOasis) {
            stroke = colors[2]
            strokeWidth = 0.5
            radius *= 1.5
          }

          if (point.metadata.sandstormIntensity > 5) {
            opacity *= 0.6
            radius *= 0.8
          }
          break

        case "monochrome":
          radius = 0.5 + point.metadata.intensity * 0.5 + point.metadata.amplitude * 0.3
          opacity = 0.4 + Math.abs(point.metadata.pattern) * 0.4 + point.metadata.contrast * 0.05
          break

        default:
          radius = 0.5 + point.metadata.intensity * 0.5
          opacity = 0.4 + Math.abs(point.metadata.pattern) * 0.4
      }

      svgContent += `<circle cx="${screenX}" cy="${screenY}" r="${radius}" fill="${pointColor}" opacity="${opacity}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`
    }
  }

  // Add scenario-specific overlays with enhanced complexity
  if (scenario === "neural") {
    // Add complex neural connections with synaptic delays
    for (let i = 0; i < Math.min(transformedPoints.length, 300); i++) {
      const point1 = transformedPoints[i]
      const point2 = transformedPoints[(i + 1) % transformedPoints.length]

      if (point1.metadata.isNeuron && point2.metadata.isNeuron) {
        const x1 = centerX + point1.x * scale
        const y1 = centerY + point1.y * scale
        const x2 = centerX + point2.x * scale
        const y2 = centerY + point2.y * scale

        const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
        if (distance < scale * 0.6) {
          const connectionOpacity = 0.1 + point1.metadata.connectionStrength * point2.metadata.connectionStrength * 0.3
          const synapticDelay = (point1.metadata.synapticDelay + point2.metadata.synapticDelay) / 2
          const strokeWidth = 0.5 + synapticDelay * 0.1

          svgContent += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${colors[2]}" stroke-width="${strokeWidth}" opacity="${connectionOpacity}"/>`
        }
      }
    }
  } else if (scenario === "pure") {
    // Add enhanced mathematical grid lines and golden ratio spirals
    const gridSpacing = size / 12
    for (let i = 0; i <= 12; i++) {
      const pos = i * gridSpacing
      svgContent += `<line x1="${pos}" y1="0" x2="${pos}" y2="${size}" stroke="${colors[1]}" stroke-width="0.3" opacity="0.15"/>`
      svgContent += `<line x1="0" y1="${pos}" x2="${size}" y2="${pos}" stroke="${colors[1]}" stroke-width="0.3" opacity="0.15"/>`
    }

    // Add axes with enhanced styling
    svgContent += `<line x1="${centerX}" y1="0" x2="${centerX}" y2="${size}" stroke="${colors[2]}" stroke-width="1.5" opacity="0.4"/>`
    svgContent += `<line x1="0" y1="${centerY}" x2="${size}" y2="${centerY}" stroke="${colors[2]}" stroke-width="1.5" opacity="0.4"/>`

    // Add golden ratio spiral
    const phi = (1 + Math.sqrt(5)) / 2
    let spiralPath = `M ${centerX} ${centerY}`
    for (let t = 0; t < 4 * Math.PI; t += 0.1) {
      const r = Math.exp(t / phi) * 5
      const x = centerX + r * Math.cos(t)
      const y = centerY + r * Math.sin(t)
      if (x >= 0 && x <= size && y >= 0 && y <= size) {
        spiralPath += ` L ${x} ${y}`
      }
    }
    svgContent += `<path d="${spiralPath}" fill="none" stroke="${colors[3]}" stroke-width="0.8" opacity="0.3"/>`
  }

  svgContent += "</svg>"
  return svgContent
}
