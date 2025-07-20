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
  domeProjection?: boolean
  domeDiameter?: number
  domeResolution?: string
  projectionType?: string
}

export interface UpscaleParams extends GenerationParams {
  scaleFactor: number
  highResolution: boolean
  extraDetail: boolean
}

// Pure 4-color palettes for visual themes
const colorPalettes = {
  plasma: ["#0D001A", "#7209B7", "#F72585", "#FFBE0B"],
  quantum: ["#001122", "#0066FF", "#00FFAA", "#FFD700"],
  cosmic: ["#000000", "#4B0082", "#9370DB", "#FFFFFF"],
  thermal: ["#000080", "#FF4500", "#FFD700", "#FFFFFF"],
  spectral: ["#8B00FF", "#0000FF", "#00FF00", "#FFFF00"],
  crystalline: ["#E6E6FA", "#4169E1", "#00CED1", "#FFFFFF"],
  bioluminescent: ["#000080", "#008B8B", "#00FF7F", "#ADFF2F"],
  aurora: ["#191970", "#00CED1", "#7FFF00", "#FFD700"],
  metallic: ["#B87333", "#C0C0C0", "#FFD700", "#E5E4E2"],
  prismatic: ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00"],
  monochromatic: ["#000000", "#404040", "#808080", "#FFFFFF"],
  infrared: ["#8B0000", "#FF4500", "#FF6347", "#FFA500"],
}

// Complex mathematical dataset generators
function generateSpirals(rng: () => number, numSamples: number, noiseScale: number): Array<[number, number]> {
  const points: Array<[number, number]> = []

  for (let i = 0; i < numSamples; i++) {
    const t = (i / numSamples) * 20 * Math.PI

    // Fibonacci spiral
    const fibR = Math.sqrt(i) * 0.5
    const fibTheta = i * 2.399963229728653 // Golden angle

    // Logarithmic spiral
    const logR = Math.exp(t * 0.1)
    const logTheta = t

    // Archimedean spiral
    const archR = t * 0.1
    const archTheta = t

    // Blend all three spirals
    const r = (fibR + logR * 0.01 + archR) / 3
    const theta = (fibTheta + logTheta + archTheta) / 3

    const x = r * Math.cos(theta) + (rng() - 0.5) * noiseScale
    const y = r * Math.sin(theta) + (rng() - 0.5) * noiseScale

    points.push([x, y])
  }

  return points
}

function generateQuantumFields(rng: () => number, numSamples: number, noiseScale: number): Array<[number, number]> {
  const points: Array<[number, number]> = []

  for (let i = 0; i < numSamples; i++) {
    // Schrödinger wave function simulation
    const x = (rng() - 0.5) * 10
    const y = (rng() - 0.5) * 10

    // Wave function probability density
    const psi = Math.exp(-(x * x + y * y) / 4) * Math.cos(x) * Math.sin(y)
    const probability = psi * psi

    // Heisenberg uncertainty principle
    const deltaX = Math.sqrt(probability) * (rng() - 0.5) * noiseScale
    const deltaY = Math.sqrt(probability) * (rng() - 0.5) * noiseScale

    // Quantum entanglement correlation
    const entangled = Math.sin(x + y) * Math.cos(x - y)

    points.push([x + deltaX + entangled * 0.1, y + deltaY + entangled * 0.1])
  }

  return points
}

function generateStringTheory(rng: () => number, numSamples: number, noiseScale: number): Array<[number, number]> {
  const points: Array<[number, number]> = []

  for (let i = 0; i < numSamples; i++) {
    const t = (i / numSamples) * 4 * Math.PI

    // 11-dimensional M-theory projection to 2D
    const dimensions = []
    for (let d = 0; d < 11; d++) {
      dimensions.push(Math.sin(t * (d + 1)) * Math.cos(t * (d + 2)))
    }

    // Calabi-Yau manifold compactification
    const compactX = dimensions.slice(0, 6).reduce((sum, val) => sum + val, 0) / 6
    const compactY = dimensions.slice(6, 11).reduce((sum, val) => sum + val, 0) / 5

    // Brane world dynamics
    const braneX = compactX * Math.cos(t) - compactY * Math.sin(t)
    const braneY = compactX * Math.sin(t) + compactY * Math.cos(t)

    points.push([braneX + (rng() - 0.5) * noiseScale, braneY + (rng() - 0.5) * noiseScale])
  }

  return points
}

function generateFractals(rng: () => number, numSamples: number, noiseScale: number): Array<[number, number]> {
  const points: Array<[number, number]> = []

  for (let i = 0; i < numSamples; i++) {
    // Mandelbrot set boundary
    const c_real = (rng() - 0.5) * 4
    const c_imag = (rng() - 0.5) * 4

    let z_real = 0
    let z_imag = 0
    let iterations = 0
    const maxIterations = 100

    while (z_real * z_real + z_imag * z_imag < 4 && iterations < maxIterations) {
      const temp = z_real * z_real - z_imag * z_imag + c_real
      z_imag = 2 * z_real * z_imag + c_imag
      z_real = temp
      iterations++
    }

    // Julia set variation
    const julia_real = z_real + Math.sin(iterations * 0.1)
    const julia_imag = z_imag + Math.cos(iterations * 0.1)

    // Sierpinski triangle influence
    const sierpinski = Math.sin(julia_real * 3) * Math.cos(julia_imag * 3)

    // Barnsley fern transformation
    const fern_x = julia_real * 0.85 + julia_imag * 0.04
    const fern_y = julia_real * -0.04 + julia_imag * 0.85 + 1.6

    points.push([
      (fern_x + sierpinski) * 0.5 + (rng() - 0.5) * noiseScale,
      (fern_y + sierpinski) * 0.5 + (rng() - 0.5) * noiseScale,
    ])
  }

  return points
}

function generateTopology(rng: () => number, numSamples: number, noiseScale: number): Array<[number, number]> {
  const points: Array<[number, number]> = []

  for (let i = 0; i < numSamples; i++) {
    const u = rng() * 2 * Math.PI
    const v = rng() * 2 * Math.PI

    // Klein bottle parametrization
    const klein_x = (2 + Math.cos(v / 2) * Math.sin(u) - Math.sin(v / 2) * Math.sin(2 * u)) * Math.cos(v / 2)
    const klein_y = (2 + Math.cos(v / 2) * Math.sin(u) - Math.sin(v / 2) * Math.sin(2 * u)) * Math.sin(v / 2)

    // Hopf fibration
    const hopf_x = Math.sin(u) * Math.cos(v)
    const hopf_y = Math.sin(u) * Math.sin(v)

    // Riemann surface
    const riemann_x = Math.sqrt(Math.abs(klein_x)) * Math.cos(u / 2)
    const riemann_y = Math.sqrt(Math.abs(klein_y)) * Math.sin(v / 2)

    points.push([
      (klein_x * 0.1 + hopf_x + riemann_x) / 3 + (rng() - 0.5) * noiseScale,
      (klein_y * 0.1 + hopf_y + riemann_y) / 3 + (rng() - 0.5) * noiseScale,
    ])
  }

  return points
}

function generateHyperbolicMoons(rng: () => number, numSamples: number, noiseScale: number): Array<[number, number]> {
  const points: Array<[number, number]> = []

  for (let i = 0; i < numSamples; i++) {
    const t = (i / numSamples) * 4 * Math.PI

    // Elliptic curve: y² = x³ + ax + b
    const a = -1
    const b = 1
    const x = Math.cos(t) * 3
    const y_squared = x * x * x + a * x + b
    const y = Math.sqrt(Math.abs(y_squared)) * Math.sign(Math.sin(t))

    // Hyperbolic geometry (Poincaré disk model)
    const hyperbolic_r = Math.tanh(Math.sqrt(x * x + y * y))
    const hyperbolic_theta = Math.atan2(y, x)

    const hyp_x = hyperbolic_r * Math.cos(hyperbolic_theta)
    const hyp_y = hyperbolic_r * Math.sin(hyperbolic_theta)

    // Non-Euclidean moon phases
    const moon_phase = Math.sin(t) * Math.cos(t / 2)

    points.push([
      hyp_x + moon_phase * 0.5 + (rng() - 0.5) * noiseScale,
      hyp_y + moon_phase * 0.3 + (rng() - 0.5) * noiseScale,
    ])
  }

  return points
}

function generateManifoldTorus(rng: () => number, numSamples: number, noiseScale: number): Array<[number, number]> {
  const points: Array<[number, number]> = []

  for (let i = 0; i < numSamples; i++) {
    const u = rng() * 2 * Math.PI
    const v = rng() * 2 * Math.PI

    // 4D torus projection
    const R = 3 // Major radius
    const r = 1 // Minor radius

    // Standard torus in 3D
    const torus_x = (R + r * Math.cos(v)) * Math.cos(u)
    const torus_y = (R + r * Math.cos(v)) * Math.sin(u)
    const torus_z = r * Math.sin(v)

    // 4D rotation and projection
    const w = Math.sin(u + v) // 4th dimension
    const proj_x = torus_x * Math.cos(w) - torus_z * Math.sin(w)
    const proj_y = torus_y

    // Möbius strip transformation
    const mobius_x = proj_x * Math.cos(u / 2) - proj_y * Math.sin(u / 2)
    const mobius_y = proj_x * Math.sin(u / 2) + proj_y * Math.cos(u / 2)

    points.push([mobius_x * 0.3 + (rng() - 0.5) * noiseScale, mobius_y * 0.3 + (rng() - 0.5) * noiseScale])
  }

  return points
}

function generateVoronoiDynamics(rng: () => number, numSamples: number, noiseScale: number): Array<[number, number]> {
  const points: Array<[number, number]> = []

  // Generate seed points for Voronoi diagram
  const seeds: Array<[number, number]> = []
  for (let i = 0; i < 20; i++) {
    seeds.push([(rng() - 0.5) * 10, (rng() - 0.5) * 10])
  }

  for (let i = 0; i < numSamples; i++) {
    const x = (rng() - 0.5) * 10
    const y = (rng() - 0.5) * 10

    // Find closest seed (Voronoi cell)
    let minDist = Number.POSITIVE_INFINITY
    let closestSeed = seeds[0]

    for (const seed of seeds) {
      const dist = Math.sqrt((x - seed[0]) ** 2 + (y - seed[1]) ** 2)
      if (dist < minDist) {
        minDist = dist
        closestSeed = seed
      }
    }

    // Lorenz attractor dynamics
    const dt = 0.01
    const sigma = 10
    const rho = 28
    const beta = 8 / 3

    const dx = sigma * (y - x)
    const dy = x * (rho - closestSeed[0]) - y
    const dz = x * y - beta * closestSeed[1]

    // Chaos theory influence
    const chaos_x = x + dx * dt + Math.sin(minDist) * 0.1
    const chaos_y = y + dy * dt + Math.cos(minDist) * 0.1

    points.push([chaos_x + (rng() - 0.5) * noiseScale, chaos_y + (rng() - 0.5) * noiseScale])
  }

  return points
}

function generateFractalCheckerboard(
  rng: () => number,
  numSamples: number,
  noiseScale: number,
): Array<[number, number]> {
  const points: Array<[number, number]> = []

  for (let i = 0; i < numSamples; i++) {
    const x = (rng() - 0.5) * 8
    const y = (rng() - 0.5) * 8

    // Mandelbrot set influence
    const c_real = x * 0.5
    const c_imag = y * 0.5

    let z_real = 0
    let z_imag = 0
    let iterations = 0

    while (z_real * z_real + z_imag * z_imag < 4 && iterations < 50) {
      const temp = z_real * z_real - z_imag * z_imag + c_real
      z_imag = 2 * z_real * z_imag + c_imag
      z_real = temp
      iterations++
    }

    // Checkerboard pattern in complex plane
    const checker_x = Math.floor(z_real * 2) % 2
    const checker_y = Math.floor(z_imag * 2) % 2
    const checker_pattern = (checker_x + checker_y) % 2

    // Fractal distortion
    const fractal_x = x + Math.sin(iterations * 0.2) * checker_pattern
    const fractal_y = y + Math.cos(iterations * 0.2) * checker_pattern

    points.push([fractal_x + (rng() - 0.5) * noiseScale, fractal_y + (rng() - 0.5) * noiseScale])
  }

  return points
}

function generateMultiModalGaussian(
  rng: () => number,
  numSamples: number,
  noiseScale: number,
): Array<[number, number]> {
  const points: Array<[number, number]> = []

  // Multiple Gaussian centers
  const centers = [
    [0, 0],
    [3, 3],
    [-3, 3],
    [3, -3],
    [-3, -3],
    [0, 4],
    [0, -4],
    [4, 0],
    [-4, 0],
  ]

  for (let i = 0; i < numSamples; i++) {
    // Choose random center
    const center = centers[Math.floor(rng() * centers.length)]

    // Box-Muller transform for Gaussian distribution
    const u1 = rng()
    const u2 = rng()
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2)

    // Correlated Gaussian with rotation
    const angle = i * 0.01
    const corr_x = z0 * Math.cos(angle) - z1 * Math.sin(angle)
    const corr_y = z0 * Math.sin(angle) + z1 * Math.cos(angle)

    // Perlin noise influence
    const perlin_x = Math.sin(corr_x * 0.5) * Math.cos(corr_y * 0.3)
    const perlin_y = Math.cos(corr_x * 0.3) * Math.sin(corr_y * 0.5)

    points.push([
      center[0] + corr_x + perlin_x * 0.5 + (rng() - 0.5) * noiseScale,
      center[1] + corr_y + perlin_y * 0.5 + (rng() - 0.5) * noiseScale,
    ])
  }

  return points
}

function generateNonLinearGrid(rng: () => number, numSamples: number, noiseScale: number): Array<[number, number]> {
  const points: Array<[number, number]> = []

  const gridSize = Math.ceil(Math.sqrt(numSamples))

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (points.length >= numSamples) break

      const u = (i / gridSize) * 2 * Math.PI
      const v = (j / gridSize) * 2 * Math.PI

      // Klein bottle transformation
      const klein_factor = Math.sin(u) * Math.cos(v)

      // Wave distortion
      const wave_x = Math.sin(u * 3) * Math.cos(v * 2) * 0.5
      const wave_y = Math.cos(u * 2) * Math.sin(v * 3) * 0.5

      // Non-linear grid transformation
      const grid_x = i - gridSize / 2 + wave_x + klein_factor * 0.3
      const grid_y = j - gridSize / 2 + wave_y + klein_factor * 0.3

      points.push([grid_x + (rng() - 0.5) * noiseScale, grid_y + (rng() - 0.5) * noiseScale])
    }
  }

  return points.slice(0, numSamples)
}

// Dataset generator mapping
const datasetGenerators = {
  spirals: generateSpirals,
  quantum: generateQuantumFields,
  strings: generateStringTheory,
  fractals: generateFractals,
  topology: generateTopology,
  moons: generateHyperbolicMoons,
  circles: generateManifoldTorus,
  blobs: generateVoronoiDynamics,
  checkerboard: generateFractalCheckerboard,
  gaussian: generateMultiModalGaussian,
  grid: generateNonLinearGrid,
}

// Scenario transformations
function applyScenarioTransformation(
  points: Array<[number, number]>,
  scenario: string,
  rng: () => number,
): Array<[number, number]> {
  switch (scenario) {
    case "pure":
      // Pure mathematical - no transformation, just enhanced precision
      return points.map(([x, y]) => [x * 1.1, y * 1.1])

    case "quantum":
      // Quantum realm - wave-particle duality
      return points.map(([x, y]) => {
        const wave = Math.sin(x * 2) * Math.cos(y * 2) * 0.2
        const particle = (rng() - 0.5) * 0.1
        return [x + wave + particle, y + wave - particle]
      })

    case "cosmic":
      // Cosmic scale - gravitational lensing
      return points.map(([x, y]) => {
        const r = Math.sqrt(x * x + y * y)
        const lensing = 1 / (1 + r * 0.1)
        return [x * lensing, y * lensing]
      })

    case "microscopic":
      // Microscopic - Brownian motion
      return points.map(([x, y]) => [x + (rng() - 0.5) * 0.3, y + (rng() - 0.5) * 0.3])

    case "forest":
      // Living forest - L-system growth
      return points.map(([x, y]) => {
        const growth = Math.sin(x * 0.5) * Math.cos(y * 0.5) * 0.2
        return [x + growth, y + Math.abs(growth)]
      })

    case "ocean":
      // Deep ocean - fluid dynamics
      return points.map(([x, y]) => {
        const flow_x = Math.sin(y * 0.3) * 0.2
        const flow_y = Math.cos(x * 0.3) * 0.2
        return [x + flow_x, y + flow_y]
      })

    case "neural":
      // Neural networks - synaptic connections
      return points.map(([x, y]) => {
        const activation = 1 / (1 + Math.exp(-(x + y))) // Sigmoid
        return [x * activation, y * activation]
      })

    case "crystalline":
      // Crystal lattice - symmetry groups
      return points.map(([x, y]) => {
        const lattice_x = Math.round(x * 2) / 2
        const lattice_y = Math.round(y * 2) / 2
        return [lattice_x, lattice_y]
      })

    case "plasma":
      // Plasma physics - electromagnetic fields
      return points.map(([x, y]) => {
        const field_x = Math.sin(y * 0.5) * 0.3
        const field_y = Math.cos(x * 0.5) * 0.3
        return [x + field_x, y + field_y]
      })

    case "atmospheric":
      // Atmospheric physics - Rayleigh scattering
      return points.map(([x, y]) => {
        const scatter = Math.exp(-(x * x + y * y) * 0.1) * 0.2
        return [x + scatter * Math.cos(x), y + scatter * Math.sin(y)]
      })

    case "geological":
      // Geological time - tectonic forces
      return points.map(([x, y]) => {
        const tectonic = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 0.5
        return [x + tectonic, y - tectonic * 0.5]
      })

    case "biological":
      // Biological systems - DNA helix
      return points.map(([x, y]) => {
        const helix = Math.sin(x * 0.5) * 0.3
        return [x, y + helix]
      })

    default:
      return points
  }
}

// Generate dome projection optimized version
export function generateDomeProjection(params: GenerationParams): string {
  const rng = createPrng(params.seed)
  const generator = datasetGenerators[params.dataset as keyof typeof datasetGenerators]

  if (!generator) {
    throw new Error(`Unknown dataset: ${params.dataset}`)
  }

  // Generate more points for dome projection
  const domePoints = generator(rng, params.numSamples * 2, params.noiseScale * 0.5)
  const transformedPoints = applyScenarioTransformation(domePoints, params.scenario, rng)

  // Apply fisheye/dome projection transformation
  const domeProjectedPoints = transformedPoints.map(([x, y]) => {
    const r = Math.sqrt(x * x + y * y)
    const theta = Math.atan2(y, x)

    // Fisheye projection for dome
    const fisheyeR = Math.sin(r * 0.5) * 2
    const domeX = fisheyeR * Math.cos(theta)
    const domeY = fisheyeR * Math.sin(theta)

    return [domeX, domeY]
  })

  const colors = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma

  // Create dome-optimized SVG with circular viewport
  const svgWidth = 800
  const svgHeight = 800
  const centerX = svgWidth / 2
  const centerY = svgHeight / 2
  const radius = Math.min(svgWidth, svgHeight) / 2 - 20

  let svgContent = `<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">`

  // Add dome circle boundary
  svgContent += `<circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="none" stroke="${colors[0]}" stroke-width="2" opacity="0.3"/>`

  // Add radial gradient for dome effect
  svgContent += `<defs>
    <radialGradient id="domeGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:0.1"/>
      <stop offset="100%" style="stop-color:${colors[3]};stop-opacity:0.3"/>
    </radialGradient>
  </defs>`

  svgContent += `<circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="url(#domeGradient)"/>`

  // Scale and center points for dome
  const scale = radius * 0.8

  domeProjectedPoints.forEach(([x, y], i) => {
    const screenX = centerX + (x * scale) / 6
    const screenY = centerY + (y * scale) / 6

    // Only draw points within dome circle
    const distFromCenter = Math.sqrt((screenX - centerX) ** 2 + (screenY - centerY) ** 2)
    if (distFromCenter <= radius) {
      const colorIndex = Math.floor((i / domeProjectedPoints.length) * colors.length)
      const color = colors[colorIndex % colors.length]
      const opacity = 1 - (distFromCenter / radius) * 0.5 // Fade towards edges

      svgContent += `<circle cx="${screenX}" cy="${screenY}" r="2" fill="${color}" opacity="${opacity}"/>`
    }
  })

  svgContent += "</svg>"
  return svgContent
}

// Main flow field generation function
export function generateFlowField(params: GenerationParams): string {
  const rng = createPrng(params.seed)
  const generator = datasetGenerators[params.dataset as keyof typeof datasetGenerators]

  if (!generator) {
    throw new Error(`Unknown dataset: ${params.dataset}`)
  }

  console.log(`Generating ${params.dataset} with ${params.numSamples} samples`)

  const points = generator(rng, params.numSamples, params.noiseScale)
  const transformedPoints = applyScenarioTransformation(points, params.scenario, rng)

  const colors = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma

  // Find bounds for scaling
  let minX = Number.POSITIVE_INFINITY,
    maxX = Number.NEGATIVE_INFINITY,
    minY = Number.POSITIVE_INFINITY,
    maxY = Number.NEGATIVE_INFINITY
  transformedPoints.forEach(([x, y]) => {
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
  })

  const svgWidth = 800
  const svgHeight = 600
  const padding = 50

  const scaleX = (svgWidth - 2 * padding) / (maxX - minX)
  const scaleY = (svgHeight - 2 * padding) / (maxY - minY)
  const scale = Math.min(scaleX, scaleY)

  const offsetX = (svgWidth - (maxX - minX) * scale) / 2 - minX * scale
  const offsetY = (svgHeight - (maxY - minY) * scale) / 2 - minY * scale

  let svgContent = `<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">`

  // Add background gradient
  svgContent += `<defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:0.1"/>
      <stop offset="100%" style="stop-color:${colors[1]};stop-opacity:0.1"/>
    </linearGradient>
  </defs>`

  svgContent += `<rect width="100%" height="100%" fill="url(#bg)"/>`

  // Draw points with flow field connections
  transformedPoints.forEach(([x, y], i) => {
    const screenX = x * scale + offsetX
    const screenY = y * scale + offsetY

    const colorIndex = Math.floor((i / transformedPoints.length) * colors.length)
    const color = colors[colorIndex % colors.length]

    // Draw point
    svgContent += `<circle cx="${screenX}" cy="${screenY}" r="1.5" fill="${color}" opacity="0.8"/>`

    // Draw connections to nearby points (flow field)
    if (i < transformedPoints.length - 1) {
      const [nextX, nextY] = transformedPoints[i + 1]
      const nextScreenX = nextX * scale + offsetX
      const nextScreenY = nextY * scale + offsetY

      const distance = Math.sqrt((nextScreenX - screenX) ** 2 + (nextScreenY - screenY) ** 2)
      if (distance < 50) {
        // Only connect nearby points
        svgContent += `<line x1="${screenX}" y1="${screenY}" x2="${nextScreenX}" y2="${nextScreenY}" stroke="${color}" stroke-width="0.5" opacity="0.3"/>`
      }
    }
  })

  svgContent += "</svg>"
  return svgContent
}

// Mathematical upscaling function
export function upscaleFlowField(params: UpscaleParams): string {
  console.log(`Mathematical upscaling with ${params.scaleFactor}x factor`)

  // Generate with much higher sample count for true mathematical detail
  const upscaledParams = {
    ...params,
    numSamples: params.numSamples * params.scaleFactor * params.scaleFactor,
    noiseScale: params.noiseScale / params.scaleFactor, // Reduce noise for higher resolution
  }

  return generateFlowField(upscaledParams)
}
