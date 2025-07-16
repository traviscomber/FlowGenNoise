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
}

// Generate base datasets
export function generateDataset(name: string, seed: number, n_samples: number, noise: number): number[][] {
  const prng = createPrng(seed)

  if (name === "spirals") {
    const data: number[][] = []
    for (let i = 0; i < n_samples; i++) {
      const theta = Math.sqrt(prng()) * 2 * Math.PI
      const r = 2 * theta
      const x = r * Math.cos(theta) + (prng() * 2 - 1) * noise
      const y = r * Math.sin(theta) + (prng() * 2 - 1) * noise
      data.push([x, y])
    }
    return data
  } else if (name === "checkerboard") {
    const data: number[][] = []
    for (let i = 0; i < n_samples; i++) {
      const x = Math.floor(prng() * 4 - 2) + (prng() * 2 - 1) * noise
      const y = Math.floor(prng() * 4 - 2) + (prng() * 2 - 1) * noise
      data.push([x, y])
    }
    return data
  } else if (name === "moons") {
    const X: number[][] = []
    for (let i = 0; i < n_samples / 2; i++) {
      const angle = (Math.PI * i) / (n_samples / 2 - 1)
      X.push([Math.cos(angle) + (prng() * 2 - 1) * noise, Math.sin(angle) + (prng() * 2 - 1) * noise])
    }
    for (let i = 0; i < n_samples / 2; i++) {
      const angle = (Math.PI * i) / (n_samples / 2 - 1) + Math.PI
      X.push([1 - Math.cos(angle) + (prng() * 2 - 1) * noise, 1 - Math.sin(angle) + (prng() * 2 - 1) * noise])
    }
    return X
  } else if (name === "gaussian") {
    const data: number[][] = []
    for (let i = 0; i < n_samples; i++) {
      const u1 = prng()
      const u2 = prng()
      const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)
      const z2 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2)
      data.push([z1 * 0.5 + (prng() * 2 - 1) * noise, z2 * 0.5 + (prng() * 2 - 1) * noise])
    }
    return data
  } else if (name === "grid") {
    const data: number[][] = []
    const numPointsPerSide = Math.floor(Math.sqrt(n_samples))
    const step = 2 / (numPointsPerSide - 1)
    for (let i = 0; i < numPointsPerSide; i++) {
      for (let j = 0; j < numPointsPerSide; j++) {
        data.push([-1 + i * step + (prng() * 2 - 1) * noise, -1 + j * step + (prng() * 2 - 1) * noise])
      }
    }
    return data
  } else if (name === "circles") {
    const data: number[][] = []
    for (let i = 0; i < n_samples; i++) {
      const angle = prng() * 2 * Math.PI
      const radius = 0.5 + prng() * 0.5
      const x = radius * Math.cos(angle) + (prng() * 2 - 1) * noise
      const y = radius * Math.sin(angle) + (prng() * 2 - 1) * noise
      data.push([x, y])
    }
    return data
  } else if (name === "blobs") {
    const data: number[][] = []
    const centers = [
      [-1, -1],
      [1, 1],
      [-1, 1],
      [1, -1],
    ]
    for (let i = 0; i < n_samples; i++) {
      const center = centers[Math.floor(prng() * centers.length)]
      const u1 = prng()
      const u2 = prng()
      const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)
      const z2 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2)
      const x = center[0] + z1 * 0.3 + (prng() * 2 - 1) * noise
      const y = center[1] + z2 * 0.3 + (prng() * 2 - 1) * noise
      data.push([x, y])
    }
    return data
  }

  // Default to random noise if name is not recognized
  return Array.from({ length: n_samples }, () => [prng() * 2 - 1, prng() * 2 - 1])
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
        }
        break

      case "forest":
        // Add tree-like growth patterns
        const treeHeight = Math.abs(baseY) * 0.5 + rng.range(0, 0.3)
        const branchFactor = Math.sin(baseX * 3) * 0.2
        x = baseX + branchFactor
        y = baseY + treeHeight
        metadata = {
          isTree: rng.next() < 0.1,
          treeHeight: treeHeight * 20,
          leafDensity: Math.abs(Math.sin(baseX * baseY)) * 0.8 + 0.2,
        }
        break

      case "cosmic":
        // Add stellar and nebula effects
        const distance = Math.sqrt(baseX * baseX + baseY * baseY)
        const angle = Math.atan2(baseY, baseX)
        const spiral = angle + distance * 0.5
        x = baseX + Math.cos(spiral) * distance * 0.1
        y = baseY + Math.sin(spiral) * distance * 0.1
        metadata = {
          isStar: rng.next() < 0.05,
          brightness: Math.max(0, 1 - distance * 0.5),
          nebulaDensity: Math.abs(Math.sin(spiral)) * 0.6 + 0.4,
        }
        break

      case "ocean":
        // Add wave and current effects
        const waveX = Math.sin(baseX * 2 + baseY * 0.5) * 0.2
        const waveY = Math.cos(baseY * 1.5 + baseX * 0.3) * 0.15
        x = baseX + waveX
        y = baseY + waveY
        metadata = {
          waveHeight: Math.abs(waveY) * 10,
          currentStrength: Math.sqrt(waveX * waveX + waveY * waveY),
          depth: Math.max(0, 1 - Math.abs(baseY) * 0.5),
        }
        break

      case "neural":
        // Add neural network connections
        const activation = Math.tanh(baseX * 0.8 + baseY * 0.6)
        const weight = Math.sin(baseX * 1.2) * Math.cos(baseY * 1.2)
        x = baseX + activation * weight * 0.1
        y = baseY + Math.sin(activation * Math.PI) * 0.1
        metadata = {
          activation: activation,
          isNeuron: Math.abs(activation) > 0.3,
          connectionStrength: Math.abs(weight),
          layerDepth: Math.floor((baseX + 2) * 2.5),
        }
        break

      case "desert":
        // Add sand dune effects
        const duneHeight = Math.sin(baseX * 1.5) * Math.cos(baseY * 0.8) * 0.3
        const sandShift = (rng.next() - 0.5) * 0.1
        x = baseX + sandShift
        y = baseY + duneHeight
        metadata = {
          duneHeight: duneHeight * 15,
          sandDensity: rng.next() * 0.5 + 0.5,
          windEffect: Math.abs(sandShift) * 10,
        }
        break

      case "fire":
        // Add flame and ember effects
        const flameHeight = Math.abs(baseY) * 0.4 + rng.range(0, 0.2)
        const flicker = Math.sin(baseX * 5 + rng.range(0, Math.PI)) * 0.1
        x = baseX + flicker
        y = baseY + flameHeight
        metadata = {
          isEmber: rng.next() < 0.08,
          flameIntensity: flameHeight * 5,
          heat: Math.max(0, 1 - Math.abs(baseY) * 0.3),
        }
        break

      case "ice":
        // Add crystalline and frost effects
        const crystalGrowth = Math.abs(Math.sin(baseX * 3) * Math.cos(baseY * 3)) * 0.2
        const frostPattern = (Math.sin(baseX * 8) + Math.cos(baseY * 8)) * 0.05
        x = baseX + frostPattern
        y = baseY + crystalGrowth
        metadata = {
          isCrystal: rng.next() < 0.06,
          crystallineStructure: crystalGrowth * 8,
          frostLevel: Math.abs(frostPattern) * 10,
        }
        break

      default:
        // No transformation for monochrome or unknown scenarios
        metadata = {
          intensity: Math.sqrt(baseX * baseX + baseY * baseY),
          pattern: Math.sin(baseX + baseY),
        }
    }

    transformedPoints.push({ x, y, metadata })
  }

  return transformedPoints
}

// Helper function to check if a number is prime (for pure mathematical scenario)
function isPrime(n: number): boolean {
  if (n < 2) return false
  if (n === 2) return true
  if (n % 2 === 0) return false
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false
  }
  return true
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
      const pointColor = colors[colorIndex]

      let radius = 1
      let opacity = 0.6
      let strokeWidth = 0
      let stroke = "none"

      // Apply scenario-specific sizing and effects (but not colors)
      switch (scenario) {
        case "pure":
          // Pure mathematical visualization
          radius = 0.8 + point.metadata.magnitude * 0.5
          opacity = 0.7 + (point.metadata.magnitude / 3) * 0.3

          // Special highlighting for prime numbers
          if (point.metadata.isPrime) {
            radius *= 1.5
            stroke = colors[3] // Use brightest color for stroke
            strokeWidth = 0.5
          }
          break

        case "forest":
          radius = 0.5 + point.metadata.leafDensity * 2
          opacity = 0.4 + point.metadata.leafDensity * 0.4
          if (point.metadata.isTree) {
            // Draw tree trunk
            svgContent += `<line x1="${screenX}" y1="${screenY}" x2="${screenX}" y2="${screenY + point.metadata.treeHeight}" stroke="${colors[2]}" stroke-width="2" opacity="0.7"/>`
            // Draw tree crown
            radius = 3 + rng.range(0, 4)
            opacity = 0.8
          }
          break

        case "cosmic":
          radius = 0.3 + point.metadata.brightness * 3
          opacity = 0.2 + point.metadata.brightness * 0.8
          if (point.metadata.isStar) {
            radius = 2 + rng.range(0, 3)
            opacity = 0.9
            stroke = colors[3] // Brightest color for stars
            strokeWidth = 0.5
          }
          break

        case "ocean":
          radius = 0.4 + point.metadata.depth * 2
          opacity = 0.3 + point.metadata.depth * 0.5
          break

        case "neural":
          radius = 0.5 + Math.abs(point.metadata.activation) * 2
          opacity = 0.3 + Math.abs(point.metadata.activation) * 0.6
          if (point.metadata.isNeuron) {
            stroke = colors[3] // Brightest color for neurons
            strokeWidth = 0.5
          }
          break

        case "fire":
          radius = 0.4 + point.metadata.heat * 2.5
          opacity = 0.4 + point.metadata.heat * 0.6
          if (point.metadata.isEmber) {
            radius = 1 + rng.range(0, 2)
            opacity = 0.9
            stroke = colors[3] // Brightest color for embers
            strokeWidth = 0.3
          }
          break

        case "ice":
          radius = 0.3 + point.metadata.crystallineStructure * 0.3
          opacity = 0.5 + point.metadata.frostLevel * 0.04
          if (point.metadata.isCrystal) {
            stroke = colors[3] // Brightest color for crystals
            strokeWidth = 0.3
          }
          break

        case "desert":
          radius = 0.4 + point.metadata.sandDensity * 1.5
          opacity = 0.3 + point.metadata.sandDensity * 0.4
          break

        default:
          radius = 0.5 + point.metadata.intensity * 0.5
          opacity = 0.4 + Math.abs(point.metadata.pattern) * 0.4
      }

      svgContent += `<circle cx="${screenX}" cy="${screenY}" r="${radius}" fill="${pointColor}" opacity="${opacity}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`
    }
  }

  // Add scenario-specific overlays (using color palette)
  if (scenario === "neural") {
    // Add neural connections
    for (let i = 0; i < Math.min(transformedPoints.length, 200); i++) {
      const point1 = transformedPoints[i]
      const point2 = transformedPoints[(i + 1) % transformedPoints.length]

      if (point1.metadata.isNeuron && point2.metadata.isNeuron) {
        const x1 = centerX + point1.x * scale
        const y1 = centerY + point1.y * scale
        const x2 = centerX + point2.x * scale
        const y2 = centerY + point2.y * scale

        const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
        if (distance < scale * 0.5) {
          const connectionOpacity = 0.1 + point1.metadata.connectionStrength * point2.metadata.connectionStrength * 0.3
          svgContent += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${colors[2]}" stroke-width="0.5" opacity="${connectionOpacity}"/>`
        }
      }
    }
  } else if (scenario === "pure") {
    // Add mathematical grid lines for pure mathematical visualization
    const gridSpacing = size / 10
    for (let i = 0; i <= 10; i++) {
      const pos = i * gridSpacing
      svgContent += `<line x1="${pos}" y1="0" x2="${pos}" y2="${size}" stroke="${colors[1]}" stroke-width="0.5" opacity="0.2"/>`
      svgContent += `<line x1="0" y1="${pos}" x2="${size}" y2="${pos}" stroke="${colors[1]}" stroke-width="0.5" opacity="0.2"/>`
    }

    // Add axes
    svgContent += `<line x1="${centerX}" y1="0" x2="${centerX}" y2="${size}" stroke="${colors[2]}" stroke-width="1" opacity="0.4"/>`
    svgContent += `<line x1="0" y1="${centerY}" x2="${size}" y2="${centerY}" stroke="${colors[2]}" stroke-width="1" opacity="0.4"/>`
  }

  svgContent += "</svg>"
  return svgContent
}
