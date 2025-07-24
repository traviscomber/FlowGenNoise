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
  enableStereographic?: boolean
  stereographicPerspective?: string
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
  // Keep existing palettes
  lava: ["#1A0000", "#8B0000", "#FF4500", "#FFD700"],
  futuristic: ["#001122", "#00FFFF", "#0080FF", "#FFFFFF"],
  forest: ["#0F1B0F", "#228B22", "#32CD32", "#90EE90"],
  ocean: ["#000080", "#0066CC", "#00BFFF", "#E0F6FF"],
  sunset: ["#2D1B69", "#FF6B35", "#F7931E", "#FFD23F"],
  arctic: ["#1E3A8A", "#60A5FA", "#E0F2FE", "#FFFFFF"],
  neon: ["#000000", "#FF00FF", "#00FF00", "#FFFF00"],
  vintage: ["#8B4513", "#CD853F", "#F4A460", "#FFF8DC"],
  toxic: ["#1A1A00", "#66FF00", "#CCFF00", "#FFFF99"],
  ember: ["#2D0A00", "#CC4400", "#FF8800", "#FFCC66"],
}

export interface FlowParameters {
  dataset: string
  scenario: string
  noise: number
  samples: number
  colorScheme: string
  stereographic: boolean
}

export interface GalleryItem {
  id: string
  image_url: string
  parameters: FlowParameters
  created_at: string
  prompt?: string
  ai_enhanced_prompt?: string
}

export const DATASETS = [
  { value: "mandelbrot", label: "Mandelbrot Set" },
  { value: "julia", label: "Julia Set" },
  { value: "lyapunov", label: "Lyapunov Exponent" },
  { value: "newton", label: "Newton Fractal" },
]

export const SCENARIOS = [
  { value: "default", label: "Default" },
  { value: "spiral", label: "Spiral" },
  { value: "warp", label: "Warp" },
  { value: "kaleidoscope", label: "Kaleidoscope" },
]

export const COLOR_SCHEMES = [
  { value: "plasma", label: "Plasma" },
  { value: "viridis", label: "Viridis" },
  { value: "magma", label: "Magma" },
  { value: "cividis", label: "Cividis" },
  { value: "twilight", label: "Twilight" },
]

export const DEFAULT_FLOW_PARAMETERS: FlowParameters = {
  dataset: "mandelbrot",
  scenario: "default",
  noise: 0.5,
  samples: 100000,
  colorScheme: "plasma",
  stereographic: false,
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
  const prng = createPrng(seed)
  const rng = new SeededRandom(seed)

  switch (name) {
    case "spirals":
      return generateComplexSpirals(rng, n_samples, noise)
    case "quantum":
      return generateQuantumFields(rng, n_samples, noise)
    case "strings":
      return generateStringTheory(rng, n_samples, noise)
    case "fractals":
      return generateFractalDimensions(rng, n_samples, noise)
    case "topology":
      return generateTopologicalSpaces(rng, n_samples, noise)
    case "checkerboard":
      return generateFractalCheckerboard(rng, n_samples, noise)
    case "moons":
      return generateHyperbolicMoons(rng, n_samples, noise)
    case "gaussian":
      return generateMultiModalGaussian(rng, n_samples, noise)
    case "grid":
      return generateNonLinearGrid(rng, n_samples, noise)
    case "circles":
      return generateConcentricManifolds(rng, n_samples, noise)
    case "blobs":
      return generateVoronoiBlobs(rng, n_samples, noise)
    default:
      return generateComplexSpirals(rng, n_samples, noise)
  }
}

// Complex mathematical dataset generators
function generateComplexSpirals(rng: SeededRandom, n_samples: number, noise: number): number[][] {
  const data: number[][] = []

  for (let i = 0; i < n_samples; i++) {
    const t = (i / n_samples) * 12 * Math.PI

    // Archimedean spiral with golden ratio
    const phi = (1 + Math.sqrt(5)) / 2
    const archSpiral = 0.3 * t * Math.cos(t)

    // Logarithmic spiral with Euler's number
    const logSpiral = Math.exp(0.08 * t) * Math.cos(t * Math.E) * 0.05

    // Fibonacci spiral with prime number modulation
    const fibSpiral = Math.sqrt(t) * Math.cos(t * phi + (isPrime(Math.floor(t)) ? Math.PI / 4 : 0)) * 0.2

    // Hyperbolic spiral with chaos theory
    const hypSpiral = (1 / (t + 0.1)) * Math.sin(t * 3.14159) * 0.4

    // Fermat's spiral (parabolic)
    const fermatSpiral = Math.sqrt(t) * Math.cos(2 * Math.sqrt(t)) * 0.15

    // Cornu spiral (Euler spiral) for clothoid curves
    const cornuT = t * 0.1
    const cornuX = Math.cos(cornuT * cornuT) * 0.3
    const cornuY = Math.sin(cornuT * cornuT) * 0.3

    // Dragon curve fractal influence
    const dragonScale = Math.pow(0.7, Math.floor(t / Math.PI))
    const dragonAngle = t * (1 + Math.sin(t * 0.5))
    const dragonX = dragonScale * Math.cos(dragonAngle) * 0.1
    const dragonY = dragonScale * Math.sin(dragonAngle) * 0.1

    // Combine all spirals with harmonic oscillations
    const harmonicX = Math.sin(t * 2) + Math.sin(t * 3) / 2 + Math.sin(t * 5) / 3 + Math.sin(t * 7) / 4
    const harmonicY = Math.cos(t * 2) + Math.cos(t * 3) / 2 + Math.cos(t * 5) / 3 + Math.cos(t * 7) / 4

    const x =
      archSpiral +
      logSpiral +
      fibSpiral * Math.cos(t) +
      hypSpiral +
      fermatSpiral +
      cornuX +
      dragonX +
      harmonicX * 0.05 +
      noise * rng.gaussian()
    const y =
      archSpiral * Math.sin(t) +
      logSpiral * Math.sin(t * Math.E) +
      fibSpiral * Math.sin(t * phi) +
      cornuY +
      dragonY +
      harmonicY * 0.05 +
      noise * rng.gaussian()

    data.push([x * 0.08, y * 0.08])
  }

  return data
}

function generateQuantumFields(rng: SeededRandom, n_samples: number, noise: number): number[][] {
  const data: number[][] = []

  for (let i = 0; i < n_samples; i++) {
    // Quantum wave function simulation
    const psi = (i / n_samples) * 4 * Math.PI

    // Schrödinger equation solutions for hydrogen atom
    const n = Math.floor(rng.range(1, 4)) // Principal quantum number
    const l = Math.floor(rng.range(0, n)) // Angular momentum
    const m = Math.floor(rng.range(-l, l + 1)) // Magnetic quantum number

    // Radial wave function (simplified Laguerre polynomials)
    const r = Math.abs(psi) * 0.5
    const radialPart = Math.exp(-r / n) * Math.pow(r, l) * (1 + Math.sin(r * n))

    // Angular part (spherical harmonics)
    const theta = psi
    const phi = theta * theta
    const angularPart = Math.sin(theta) * Math.cos(m * phi) * Math.pow(Math.sin(theta), Math.abs(m))

    // Quantum tunneling effect
    const barrier = Math.exp(-Math.abs(psi - Math.PI) * 2)
    const tunneling = barrier * Math.sin(psi * 10) * 0.1

    // Heisenberg uncertainty principle visualization
    const uncertainty = 1 / (1 + Math.abs(psi) * 0.5)
    const deltaX = uncertainty * rng.gaussian() * 0.1
    const deltaP = (1 / uncertainty) * rng.gaussian() * 0.1

    // Quantum entanglement correlation
    const entangled = Math.sin(psi) * Math.cos(psi + Math.PI / 2) * 0.2

    const x = radialPart * Math.cos(theta) + tunneling + deltaX + entangled + noise * rng.gaussian()
    const y = radialPart * Math.sin(theta) + angularPart * 0.3 + deltaP + noise * rng.gaussian()

    data.push([x * 0.4, y * 0.4])
  }

  return data
}

function generateStringTheory(rng: SeededRandom, n_samples: number, noise: number): number[][] {
  const data: number[][] = []

  for (let i = 0; i < n_samples; i++) {
    const t = (i / n_samples) * 8 * Math.PI

    // 11-dimensional M-theory projection to 2D
    const dimensions = []
    for (let d = 0; d < 11; d++) {
      dimensions.push(Math.sin((t * (d + 1)) / 11) * Math.cos(t * Math.sqrt(d + 1)))
    }

    // Calabi-Yau manifold compactification
    const calabiYau = dimensions.slice(6).reduce((sum, dim, idx) => sum + dim * Math.exp(-idx * 0.5), 0) * 0.1

    // String vibration modes
    const fundamentalFreq = 1
    const harmonics = []
    for (let h = 1; h <= 8; h++) {
      harmonics.push(Math.sin(t * h * fundamentalFreq) / h)
    }
    const stringVibration = harmonics.reduce((sum, h) => sum + h, 0) * 0.2

    // Brane world interactions
    const braneDistance = Math.abs(Math.sin(t * 0.3)) + 0.1
    const braneForce = (1 / (braneDistance * braneDistance)) * 0.05

    // Extra dimensional leakage
    const extraDimX = dimensions[6] * Math.cos(t * 2) + dimensions[7] * Math.sin(t * 3)
    const extraDimY = dimensions[8] * Math.cos(t * 5) + dimensions[9] * Math.sin(t * 7)

    // Supersymmetry breaking
    const susyBreaking = Math.exp(-t * 0.1) * Math.sin(t * 13) * 0.15

    const x =
      dimensions[0] + stringVibration + extraDimX * 0.3 + braneForce + calabiYau + susyBreaking + noise * rng.gaussian()
    const y =
      dimensions[1] + stringVibration * Math.sin(t) + extraDimY * 0.3 + calabiYau * Math.cos(t) + noise * rng.gaussian()

    data.push([x * 0.3, y * 0.3])
  }

  return data
}

function generateFractalDimensions(rng: SeededRandom, n_samples: number, noise: number): number[][] {
  const data: number[][] = []

  for (let i = 0; i < n_samples; i++) {
    const t = (i / n_samples) * 6 * Math.PI

    // Hausdorff dimension calculation
    const hausdorffDim = 1.5 + 0.5 * Math.sin(t * 0.2)

    // Sierpinski triangle with variable dimension
    let sierpX = 0,
      sierpY = 0
    let currentX = rng.range(-1, 1),
      currentY = rng.range(-1, 1)
    const vertices = [
      [-1, -1],
      [1, -1],
      [0, Math.sqrt(3)],
    ]

    for (let iter = 0; iter < 10; iter++) {
      const vertex = vertices[Math.floor(rng.next() * 3)]
      currentX = (currentX + vertex[0]) * 0.5
      currentY = (currentY + vertex[1]) * 0.5
      sierpX += currentX * Math.pow(0.5, iter * hausdorffDim)
      sierpY += currentY * Math.pow(0.5, iter * hausdorffDim)
    }

    // Julia set with varying parameters
    const c_real = -0.7 + 0.3 * Math.sin(t * 0.1)
    const c_imag = 0.27015 + 0.1 * Math.cos(t * 0.1)
    let z_real = rng.range(-2, 2)
    let z_imag = rng.range(-2, 2)

    let juliaIterations = 0
    const maxJuliaIter = 50

    while (z_real * z_real + z_imag * z_imag < 4 && juliaIterations < maxJuliaIter) {
      const temp = z_real * z_real - z_imag * z_imag + c_real
      const zy = 2 * z_real * z_imag + c_imag // Corrected: declare zy
      z_real = temp
      z_imag = zy // Corrected: assign to z_imag
      juliaIterations++
    }

    const juliaValue = juliaIterations / maxJuliaIter

    // Barnsley fern with mutations
    let fernX = 0,
      fernY = 0
    for (let f = 0; f < 5; f++) {
      const r = rng.next()
      let newX, newY

      if (r < 0.01) {
        newX = 0
        newY = 0.16 * fernY
      } else if (r < 0.86) {
        newX = 0.85 * fernX + 0.04 * fernY
        newY = -0.04 * fernX + 0.85 * fernY + 1.6
      } else if (r < 0.93) {
        newX = 0.2 * fernX - 0.26 * fernY
        newY = 0.23 * fernX + 0.22 * fernY + 1.6
      } else {
        newX = -0.15 * fernX + 0.28 * fernY
        newY = 0.26 * fernX + 0.24 * fernY + 0.44
      }

      fernX = newX
      fernY = newY
    }

    // Combine all fractal elements
    const x = sierpX * 0.3 + z_real * 0.1 + fernX * 0.05 + juliaValue * Math.cos(t) * 0.2 + noise * rng.gaussian()
    const y = sierpY * 0.3 + z_imag * 0.1 + fernY * 0.05 + juliaValue * Math.sin(t) * 0.2 + noise * rng.gaussian()

    data.push([x * 0.4, y * 0.4])
  }

  return data
}

function generateTopologicalSpaces(rng: SeededRandom, n_samples: number, noise: number): number[][] {
  const data: number[][] = []

  for (let i = 0; i < n_samples; i++) {
    const t = (i / n_samples) * 4 * Math.PI

    // Klein bottle embedding in 4D, projected to 2D
    const u = t
    const v = t * 0.7
    const kleinX = (2 + Math.cos(v / 2) * Math.sin(u) - Math.sin(v / 2) * Math.sin(2 * u)) * Math.cos(v / 2)
    const kleinY = (2 + Math.cos(v / 2) * Math.sin(u) - Math.sin(v / 2) * Math.sin(2 * u)) * Math.sin(v / 2)
    const kleinZ = Math.sin(v / 2) * Math.sin(u) + Math.cos(v / 2) * Math.sin(2 * u)
    const kleinW = Math.cos(v)

    // Project 4D to 2D with perspective
    const perspective = 3 / (3 + kleinZ + kleinW * 0.5)
    const klein2DX = kleinX * perspective
    const klein2DY = kleinY * perspective

    // Möbius strip with varying width
    const mobiusU = t
    const mobiusV = rng.range(-0.5, 0.5) * (1 + 0.3 * Math.sin(t * 2))
    const mobiusX = (1 + mobiusV * Math.cos(mobiusU / 2)) * Math.cos(mobiusU)
    const mobiusY = (1 + mobiusV * Math.cos(mobiusU / 2)) * Math.sin(mobiusU)
    const mobiusZ = mobiusV * Math.sin(mobiusU / 2)

    // Torus knot (trefoil)
    const p = 3,
      q = 2 // Trefoil knot parameters
    const knotR = Math.cos(q * t) + 2
    const knotX = knotR * Math.cos(p * t)
    const knotY = knotR * Math.sin(p * t)
    const knotZ = -Math.sin(q * t)

    // Hopf fibration
    const hopfTheta = t
    const hopfPhi = t * Math.sqrt(2)
    const hopfPsi = t * Math.sqrt(3)

    const hopfX = Math.sin(hopfTheta) * Math.cos(hopfPhi)
    const hopfY = Math.sin(hopfTheta) * Math.sin(hopfPhi)
    const hopfZ = Math.cos(hopfTheta)
    const hopfW = Math.cos(hopfPsi)

    // Stereographic projection from S³ to R³, then to R²
    const stereoX = hopfX / (1 - hopfW + 0.1)
    const stereoY = hopfY / (1 - hopfW + 0.1)

    // Riemann surface (complex logarithm)
    const complex_r = Math.sqrt(t * t + 1)
    const complex_theta = Math.atan2(1, t) + 2 * Math.PI * Math.floor(t / (2 * Math.PI))
    const riemannX = Math.log(complex_r) * Math.cos(complex_theta)
    const riemannY = Math.log(complex_r) * Math.sin(complex_theta)

    // Combine topological elements
    const x = klein2DX * 0.2 + mobiusX * 0.15 + knotX * 0.1 + stereoX * 0.1 + riemannX * 0.05 + noise * rng.gaussian()
    const y = klein2DY * 0.2 + mobiusY * 0.15 + knotY * 0.1 + stereoY * 0.1 + riemannY * 0.05 + noise * rng.gaussian()

    data.push([x * 0.5, y * 0.5])
  }

  return data
}

function generateFractalCheckerboard(rng: SeededRandom, n_samples: number, noise: number): number[][] {
  const data: number[][] = []

  for (let i = 0; i < n_samples; i++) {
    let x = rng.range(-2, 2)
    let y = rng.range(-2, 2)

    // Apply fractal transformation
    for (let iter = 0; iter < 3; iter++) {
      const scale = Math.pow(0.5, iter)
      const offsetX = Math.sin(x * Math.pow(2, iter)) * scale
      const offsetY = Math.cos(y * Math.pow(2, iter)) * scale

      x += offsetX
      y += offsetY
    }

    // Mandelbrot-like iteration
    const cx = x,
      cy = y
    let zx = 0,
      zy = 0
    let iterations = 0
    const maxIter = 20

    while (zx * zx + zy * zy < 4 && iterations < maxIter) {
      const temp = zx * zx - zy * zy + cx
      zy = 2 * zx * zy + cy
      zx = temp
      iterations++
    }

    // Use iteration count to modify position
    const factor = iterations / maxIter
    x += Math.sin(factor * Math.PI) * 0.5
    y += Math.cos(factor * Math.PI) * 0.5

    data.push([x + noise * rng.gaussian(), y + noise * rng.gaussian()])
  }

  return data
}

function generateHyperbolicMoons(rng: SeededRandom, n_samples: number, noise: number): number[][] {
  const data: number[][] = []
  const samplesPerMoon = Math.floor(n_samples / 3)

  // First hyperbolic moon
  for (let i = 0; i < samplesPerMoon; i++) {
    const t = (i / samplesPerMoon) * Math.PI
    const r = 1 + 0.3 * Math.sin(3 * t)

    // Hyperbolic transformation
    const x = r * Math.cosh(0.5 * t) * Math.cos(t)
    const y = r * Math.sinh(0.5 * t) * Math.sin(t)

    data.push([x * 0.3 + noise * rng.gaussian(), y * 0.3 + noise * rng.gaussian()])
  }

  // Second moon with different curvature
  for (let i = 0; i < samplesPerMoon; i++) {
    const t = (i / samplesPerMoon) * Math.PI
    const r = 1 + 0.2 * Math.cos(5 * t)

    const x = 1.5 - r * Math.cos(t + Math.PI)
    const y = 1 - r * Math.sin(t + Math.PI) + 0.5 * Math.sin(2 * t)

    data.push([x + noise * rng.gaussian(), y + noise * rng.gaussian()])
  }

  // Third moon with elliptic curves
  for (let i = 0; i < n_samples - 2 * samplesPerMoon; i++) {
    const t = (i / (n_samples - 2 * samplesPerMoon)) * 2 * Math.PI

    // Elliptic curve: y² = x³ + ax + b
    const a = -1,
      b = 1
    const x = 2 * Math.cos(t)
    const y = Math.sqrt(Math.abs(x * x * x + a * x + b)) * Math.sign(Math.sin(t))

    data.push([x * 0.3 - 0.5 + noise * rng.gaussian(), y * 0.3 + 1.5 + noise * rng.gaussian()])
  }

  return data
}

function generateMultiModalGaussian(rng: SeededRandom, n_samples: number, noise: number): number[][] {
  const data: number[][] = []

  // Multiple Gaussian centers with different covariances
  const centers = [
    { x: -1.5, y: -1.5, sx: 0.3, sy: 0.8, angle: Math.PI / 4 },
    { x: 1.5, y: -1.5, sx: 0.8, sy: 0.3, angle: -Math.PI / 4 },
    { x: 0, y: 1.5, sx: 0.5, sy: 0.5, angle: 0 },
    { x: -0.8, y: 0.3, sx: 0.2, sy: 0.6, angle: Math.PI / 3 },
    { x: 0.8, y: 0.3, sx: 0.6, sy: 0.2, angle: -Math.PI / 3 },
  ]

  for (let i = 0; i < n_samples; i++) {
    const center = centers[Math.floor(rng.next() * centers.length)]

    // Generate correlated Gaussian samples
    const u1 = rng.gaussian()
    const u2 = rng.gaussian()

    // Apply rotation and scaling
    const cos_a = Math.cos(center.angle)
    const sin_a = Math.sin(center.angle)

    const x = center.x + (u1 * center.sx * cos_a - u2 * center.sy * sin_a)
    const y = center.y + (u1 * center.sx * sin_a + u2 * center.sy * cos_a)

    // Add Perlin-like noise
    const perlinX = Math.sin(x * 5) * Math.cos(y * 3) * 0.1
    const perlinY = Math.cos(x * 3) * Math.sin(y * 5) * 0.1

    data.push([x + perlinX + noise * rng.gaussian(), y + perlinY + noise * rng.gaussian()])
  }

  return data
}

function generateNonLinearGrid(rng: SeededRandom, n_samples: number, noise: number): number[][] {
  const data: number[][] = []
  const gridSize = Math.ceil(Math.sqrt(n_samples))

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize && data.length < n_samples; j++) {
      let x = (i / (gridSize - 1)) * 4 - 2
      let y = (j / (gridSize - 1)) * 4 - 2

      // Apply non-linear transformations
      const r = Math.sqrt(x * x + y * y)
      const theta = Math.atan2(y, x)

      // Polar distortion
      const newR = r + 0.3 * Math.sin(3 * theta) + 0.2 * Math.sin(5 * r)
      const newTheta = theta + 0.2 * Math.sin(2 * r)

      x = newR * Math.cos(newTheta)
      y = newR * Math.sin(newTheta)

      // Add wave distortion
      x += 0.3 * Math.sin(y * 2) * Math.cos(x * 1.5)
      y += 0.3 * Math.cos(x * 2) * Math.sin(y * 1.5)

      // Klein bottle transformation
      const u = x * 0.5
      const v = y * 0.5
      const kleinX = (2 + Math.cos(v)) * Math.cos(u)
      const kleinY = (2 + Math.cos(v)) * Math.sin(u)

      data.push([x * 0.7 + kleinX * 0.3 + noise * rng.gaussian(), y * 0.7 + kleinY * 0.3 + noise * rng.gaussian()])
    }
  }

  return data
}

function generateConcentricManifolds(rng: SeededRandom, n_samples: number, noise: number): number[][] {
  const data: number[][] = []

  for (let i = 0; i < n_samples; i++) {
    const layer = Math.floor(rng.next() * 5) + 1
    const t = rng.next() * 2 * Math.PI

    // Base radius with harmonic variations
    const r = layer * 0.4 + 0.2 * Math.sin(layer * t * 3) + 0.1 * Math.sin(layer * t * 7)

    // Torus embedding
    const R = 1.5 // Major radius
    const minorR = r * 0.3
    const phi = t
    const theta = (layer * Math.PI) / 3

    // Torus coordinates
    const torusX = (R + minorR * Math.cos(theta)) * Math.cos(phi)
    const torusY = (R + minorR * Math.cos(theta)) * Math.sin(phi)
    const torusZ = minorR * Math.sin(theta)

    // Project to 2D with perspective
    const perspective = 3 / (3 + torusZ)
    let x = torusX * perspective
    let y = torusY * perspective

    // Add Möbius strip transformation for some layers
    if (layer % 2 === 0) {
      const mobiusT = t / 2
      const mobiusR = 0.5 + 0.3 * Math.cos(mobiusT)
      x = mobiusR * Math.cos(t) + 0.3 * Math.cos(mobiusT) * Math.cos(t)
      y = mobiusR * Math.sin(t) + 0.3 * Math.cos(mobiusT) * Math.sin(t)
    }

    data.push([x + noise * rng.gaussian(), y + noise * rng.gaussian()])
  }

  return data
}

function generateVoronoiBlobs(rng: SeededRandom, n_samples: number, noise: number): number[][] {
  const data: number[][] = []

  // Generate Voronoi seed points
  const numSeeds = 8
  const seeds: Array<{ x: number; y: number; weight: number }> = []

  for (let i = 0; i < numSeeds; i++) {
    seeds.push({
      x: rng.range(-2, 2),
      y: rng.range(-2, 2),
      weight: rng.range(0.5, 2.0),
    })
  }

  for (let i = 0; i < n_samples; i++) {
    let x = rng.range(-2.5, 2.5)
    let y = rng.range(-2.5, 2.5)

    // Find closest seed (weighted Voronoi)
    let minDist = Number.POSITIVE_INFINITY
    let closestSeed = seeds[0]

    for (const seed of seeds) {
      const dist = Math.sqrt((x - seed.x) ** 2 + (y - seed.y) ** 2) / seed.weight
      if (dist < minDist) {
        minDist = dist
        closestSeed = seed
      }
    }

    // Apply attractor dynamics
    const attractorStrength = 0.3
    const dx = closestSeed.x - x
    const dy = closestSeed.y - y

    x += dx * attractorStrength
    y += dy * attractorStrength

    // Add turbulence based on distance to seed
    const turbulence = Math.exp(-minDist * 2)
    const turbX = turbulence * Math.sin(x * 8 + y * 6) * 0.2
    const turbY = turbulence * Math.cos(x * 6 + y * 8) * 0.2

    // Lorenz attractor influence
    const lorenzScale = 0.1
    const lorenzX = 10 * (y - x) * lorenzScale
    const lorenzY = (x * (28 - y) - y) * lorenzScale

    data.push([x + turbX + lorenzX + noise * rng.gaussian(), y + turbY + lorenzY + noise * rng.gaussian()])
  }

  return data
}

// Apply scenario transformations to dataset points with rich contextual theming
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
        // Pure mathematical - enhanced with sacred geometry and mathematical beauty
        metadata = {
          magnitude: Math.sqrt(baseX * baseX + baseY * baseY),
          angle: Math.atan2(baseY, baseX),
          quadrant: baseX >= 0 ? (baseY >= 0 ? 1 : 4) : baseY >= 0 ? 2 : 3,
          isPrime: isPrime(Math.floor(Math.abs(baseX * 100) + Math.abs(baseY * 100))),
          harmonicSeries:
            Math.sin(baseX * Math.PI) + Math.sin(baseY * Math.PI * 2) / 2 + Math.sin(baseX * Math.PI * 3) / 3,
          fibonacci: fibonacciSpiral(baseX, baseY),
          goldenRatio: Math.abs(baseX / baseY - 1.618) < 0.1,
          fractalDepth: Math.floor(Math.log(Math.abs(baseX * baseY) + 1) * 3),
        }
        break

      case "forest": {
        // Enchanted living forest with magical creatures and organic life
        const forestDepth = Math.abs(baseY) + 1
        const canopyDensity = Math.sin(baseX * 2) * Math.cos(baseY * 1.5) + 0.5

        // Tree growth patterns with L-system fractals
        const treeAge = Math.abs(baseX * baseY) * 100 + 50
        const branchAngle = Math.atan2(baseY, baseX) + rng.range(-0.4, 0.4)
        const rootNetwork = Math.sin(baseX * 5) * Math.cos(baseY * 3) * 0.15

        // Fairy presence - magical sparkles around certain points
        const fairyMagic = Math.exp(-((baseX - Math.sin(i * 0.1)) ** 2 + (baseY - Math.cos(i * 0.1)) ** 2) * 3)
        const fairyTrail = fairyMagic > 0.3 ? Math.sin(i * 0.5) * 0.1 : 0

        // Insect swarms and fireflies
        const bugSwarm = Math.sin(baseX * 8 + i * 0.1) * Math.cos(baseY * 6 + i * 0.1) * 0.08
        const firefly = rng.next() < 0.05 && Math.sin(i * 0.3) > 0.7

        // Mushroom rings and magical circles
        const mushroomRing = Math.abs(Math.sqrt(baseX ** 2 + baseY ** 2) - 1.2) < 0.1
        const magicCircle = mushroomRing ? Math.sin(Math.atan2(baseY, baseX) * 8) * 0.1 : 0

        // Vine growth and organic curves
        const vineGrowth = Math.sin(baseX * 3 + baseY * 2) * Math.exp(-Math.abs(baseY) * 0.5) * 0.12

        x = baseX + rootNetwork + fairyTrail + bugSwarm + magicCircle + vineGrowth
        y = baseY + forestDepth * 0.1 + fairyTrail * Math.sin(i * 0.2) + vineGrowth * 0.8

        metadata = {
          isTree: canopyDensity > 0.6,
          treeAge: treeAge,
          canopyDensity: canopyDensity,
          hasFairy: fairyMagic > 0.3,
          fairyType: Math.floor(rng.next() * 4), // Different fairy types
          bugType: Math.floor(rng.next() * 6), // Beetles, butterflies, fireflies, etc.
          isFirefly: firefly,
          mushroomRing: mushroomRing,
          vineThickness: Math.abs(vineGrowth) * 10,
          magicalEnergy: fairyMagic + (mushroomRing ? 0.5 : 0),
          seasonalPhase: Math.sin(baseX + baseY + Math.PI / 4), // Spring/Summer/Fall/Winter
          forestSpirit: rng.next() < 0.02, // Rare forest spirits
        }
        break
      }

      case "cosmic": {
        // Deep space with galaxies, nebulae, stars, and cosmic phenomena
        const distance = Math.sqrt(baseX * baseX + baseY * baseY)
        const angle = Math.atan2(baseY, baseX)

        // Galaxy spiral arms with dark matter
        const spiralArm = angle + distance * 0.3 + Math.sin(distance * 2) * 0.3
        const darkMatterHalo = Math.exp(-distance * 0.5) * Math.sin(spiralArm * 3) * 0.1

        // Nebula clouds with gas and dust
        const nebulaDensity = Math.abs(Math.sin(baseX * 0.8) * Math.cos(baseY * 0.6)) * 0.2
        const gasCloud = Math.sin(baseX * 1.2 + baseY * 0.8) * nebulaDensity
        const cosmicDust = rng.gaussian() * nebulaDensity * 0.05

        // Stellar formation regions
        const stellarNursery = nebulaDensity > 0.15 && rng.next() < 0.1
        const protostar = stellarNursery && Math.sin(distance * 10) > 0.8

        // Black hole gravitational lensing
        const blackHolePos = { x: 0.8, y: -0.3 }
        const bhDistance = Math.sqrt((baseX - blackHolePos.x) ** 2 + (baseY - blackHolePos.y) ** 2)
        const gravitationalLens = bhDistance < 0.5 ? (1 / (bhDistance + 0.1)) * 0.03 : 0
        const eventHorizon = bhDistance < 0.1

        // Pulsar beams and neutron stars
        const pulsar = rng.next() < 0.005
        const pulsarBeam = pulsar ? Math.sin(i * 0.1) * Math.cos(angle * 2) * 0.15 : 0

        // Cosmic rays and solar wind
        const cosmicRay = Math.sin(baseX * 20 + i * 0.05) * Math.cos(baseY * 15) * 0.02
        const solarWind = Math.exp(-distance * 2) * Math.sin(angle * 4 + i * 0.1) * 0.05

        x = baseX + darkMatterHalo + gasCloud + gravitationalLens * Math.cos(angle) + pulsarBeam + cosmicRay
        y = baseY + gasCloud * 0.8 + gravitationalLens * Math.sin(angle) + solarWind + cosmicDust

        metadata = {
          isStar: rng.next() < 0.08,
          isBlackHole: eventHorizon,
          isPulsar: pulsar,
          isProtostar: protostar,
          stellarClass: Math.floor(rng.next() * 7), // O, B, A, F, G, K, M
          nebulaDensity: nebulaDensity,
          darkMatterDensity: Math.abs(darkMatterHalo) * 10,
          redshift: distance * 0.1,
          cosmicAge: distance * 13.8, // Billion years
          hasExoplanets: rng.next() < 0.3,
          galaxyType: Math.floor(rng.next() * 4), // Spiral, elliptical, irregular, dwarf
          quasarActivity: distance > 2 && rng.next() < 0.01,
        }
        break
      }

      case "ocean": {
        // Deep ocean with sea creatures, coral reefs, and marine life
        const depth = Math.max(0, -baseY * 1000 + 500) // 0-1000m depth
        const currentStrength = Math.sin(baseX * 1.5) * Math.cos(baseY * 0.8) * 0.2

        // Ocean currents and tidal forces
        const tidalForce = Math.sin(baseX * 0.3 + i * 0.01) * 0.1
        const gulfStream = Math.exp(-Math.abs(baseY - 0.2) * 5) * Math.sin(baseX * 2) * 0.15

        // Marine life ecosystems
        const coralReef = depth < 200 && Math.sin(baseX * 4) * Math.cos(baseY * 3) > 0.5
        const kelp = depth < 100 && Math.sin(baseX * 6 + baseY * 4) > 0.6
        const plankton = Math.sin(baseX * 15 + baseY * 12 + i * 0.1) * Math.exp(-depth * 0.001) * 0.03

        // Sea creatures
        const whale = rng.next() < 0.001 && depth > 200
        const dolphinPod = rng.next() < 0.005 && depth < 300
        const shark = rng.next() < 0.003 && depth > 50
        const jellyfish = rng.next() < 0.02 && Math.sin(i * 0.2) > 0.5
        const schoolOfFish = rng.next() < 0.1 && depth < 500

        // Bioluminescence
        const bioluminescence = depth > 200 ? Math.sin(i * 0.3) * Math.exp(-depth * 0.0005) * 0.1 : 0
        const deepSeaCreature = depth > 800 && rng.next() < 0.01

        // Underwater vents and thermal activity
        const thermalVent = depth > 600 && rng.next() < 0.002
        const mineralDeposit = thermalVent ? Math.sin(baseX * 10) * 0.05 : 0

        // Wave action and turbulence
        const waveAction = depth < 50 ? Math.sin(baseX * 3 + i * 0.05) * Math.cos(baseY * 2) * 0.1 : 0
        const turbulence = Math.sin(baseX * 8 + baseY * 6) * currentStrength * 0.5

        x = baseX + currentStrength + gulfStream + plankton + bioluminescence + waveAction + turbulence
        y = baseY + tidalForce + kelp * 0.1 + mineralDeposit + turbulence * 0.8

        metadata = {
          depth: depth,
          temperature: 25 - depth * 0.02, // Temperature drops with depth
          salinity: 35 + Math.sin(baseX) * 2,
          pressure: 1 + depth * 0.1, // Atmospheric pressure
          hasCoralReef: coralReef,
          hasKelp: kelp,
          creatureType: whale
            ? "whale"
            : dolphinPod
              ? "dolphin"
              : shark
                ? "shark"
                : jellyfish
                  ? "jellyfish"
                  : schoolOfFish
                    ? "fish"
                    : deepSeaCreature
                      ? "deep_sea"
                      : "none",
          bioluminescent: bioluminescence > 0.05,
          thermalVent: thermalVent,
          currentSpeed: Math.abs(currentStrength) * 10, // km/h
          waveHeight: Math.abs(waveAction) * 5, // meters
          oxygenLevel: Math.max(0, 8 - depth * 0.005),
          marineLifeDensity: (coralReef ? 0.8 : 0) + (kelp ? 0.6 : 0) + Math.abs(plankton) * 10,
        }
        break
      }

      case "neural": {
        // Brain networks with neurons, synapses, and neural activity
        const neuralActivity = Math.tanh(baseX * 1.2 + baseY * 0.8)
        const synapticWeight = Math.sin(baseX * 2.5) * Math.cos(baseY * 2.5)

        // Neural pathways and dendrites
        const dendriticBranching = Math.sin(baseX * 8) * Math.cos(baseY * 6) * 0.08
        const axonLength = Math.abs(neuralActivity) * 0.15
        const myelinSheath = Math.abs(synapticWeight) > 0.5 ? 0.05 : 0

        // Neurotransmitter release
        const dopamine = Math.sin(baseX * 3 + i * 0.1) > 0.7 ? 0.1 : 0
        const serotonin = Math.cos(baseY * 4 + i * 0.15) > 0.8 ? 0.08 : 0
        const acetylcholine = Math.sin(baseX * baseY * 10) > 0.9 ? 0.06 : 0

        // Brain waves and electrical activity
        const alphaWave = Math.sin(i * 0.08) * 0.03 // 8-12 Hz
        const betaWave = Math.sin(i * 0.15) * 0.02 // 13-30 Hz
        const gammaWave = Math.sin(i * 0.4) * 0.01 // 30-100 Hz

        // Neural plasticity and learning
        const synapticPlasticity = Math.exp(-Math.abs(neuralActivity) * 2) * 0.05
        const memoryFormation = Math.abs(synapticWeight) > 0.7 && rng.next() < 0.1

        // Glial cells and support structures
        const astrocyte = rng.next() < 0.15
        const microglia = rng.next() < 0.08
        const oligodendrocyte = rng.next() < 0.05

        x = baseX + dendriticBranching + axonLength * Math.cos(Math.atan2(baseY, baseX)) + dopamine + alphaWave
        y = baseY + dendriticBranching * 0.8 + axonLength * Math.sin(Math.atan2(baseY, baseX)) + serotonin + betaWave

        metadata = {
          neuronType: Math.floor(rng.next() * 5), // Motor, sensory, interneuron, etc.
          firingRate: Math.max(0, neuralActivity * 100 + rng.gaussian() * 20),
          synapticStrength: Math.abs(synapticWeight),
          neurotransmitter:
            dopamine > 0 ? "dopamine" : serotonin > 0 ? "serotonin" : acetylcholine > 0 ? "acetylcholine" : "GABA",
          brainRegion: Math.floor(rng.next() * 8), // Cortex, hippocampus, amygdala, etc.
          isInhibitory: synapticWeight < 0,
          myelinated: myelinSheath > 0,
          memoryTrace: memoryFormation,
          glialSupport: astrocyte || microglia || oligodendrocyte,
          electricalActivity: Math.abs(alphaWave + betaWave + gammaWave) * 100,
          plasticity: synapticPlasticity * 100,
        }
        break
      }

      case "quantum": {
        // Quantum realm with particles, waves, and quantum phenomena
        const waveFunction = Math.sin(baseX * 15) * Math.cos(baseY * 15) * Math.exp(-(baseX ** 2 + baseY ** 2) * 1.5)
        const particlePosition = rng.gaussian() * 0.08

        // Wave-particle duality
        const observationCollapse = rng.next() < 0.3
        const quantumState = observationCollapse ? particlePosition : waveFunction

        // Quantum superposition
        const superposition = ((Math.sin(baseX * 8) + Math.cos(baseY * 8)) / Math.sqrt(2)) * 0.1
        const coherenceTime = Math.exp(-Math.abs(baseX * baseY) * 5)

        // Quantum entanglement
        const entanglementPair = Math.floor(i / 2) * 2 // Pair particles
        const entangled = i === entanglementPair || i === entanglementPair + 1
        const spookyAction = entangled ? Math.sin(i * 0.5) * 0.15 : 0

        // Virtual particles and vacuum fluctuations
        const virtualParticle = rng.next() < 0.1 && Math.sin(i * 0.8) > 0.9
        const vacuumFluctuation = Math.sin(baseX * 25 + baseY * 20 + i * 0.3) * 0.02

        // Quantum tunneling
        const barrier = Math.abs(baseX) > 1 || Math.abs(baseY) > 1
        const tunnelingProbability = barrier ? Math.exp(-Math.abs(baseX + baseY) * 3) : 1
        const tunneled = barrier && rng.next() < tunnelingProbability

        // Quantum foam and spacetime curvature
        const quantumFoam = Math.sin(baseX * 50) * Math.cos(baseY * 50) * 0.01
        const spacetimeCurvature = Math.sqrt(baseX ** 2 + baseY ** 2) * 0.05

        x = baseX + quantumState + spookyAction + vacuumFluctuation + (tunneled ? 0.2 : 0) + quantumFoam
        y = baseY + superposition + spookyAction * 0.8 + vacuumFluctuation * 0.5 + quantumFoam * 0.8

        metadata = {
          isParticle: observationCollapse,
          isWave: !observationCollapse,
          quantumSpin: rng.next() < 0.5 ? "up" : "down",
          entangled: entangled,
          coherence: coherenceTime,
          virtualParticle: virtualParticle,
          tunneled: tunneled,
          spacetimeDistortion: spacetimeCurvature,
          quantumFieldStrength: Math.abs(waveFunction) * 10,
          particleType: Math.floor(rng.next() * 6), // Electron, photon, neutrino, quark, gluon, Higgs
          quantumGravity: Math.abs(quantumFoam) * 100,
          quantumFluctuation: Math.abs(vacuumFluctuation) * 100,
        }
        break
      }

      case "microscopic": {
        // Microscopic world with cells, bacteria, viruses, and molecular structures
        const cellDensity = Math.sin(baseX * 5) * Math.cos(baseY * 5) + 0.5
        const molecularVibration = Math.sin(baseX * 20 + baseY * 20 + i * 0.5) * 0.01

        // Cell division and growth
        const cellCycle = Math.sin(i * 0.05) * 0.1
        const mitosis = cellCycle > 0.8 && rng.next() < 0.1
        const cellGrowth = mitosis ? 0.05 : 0

        // Bacterial colonies and biofilms
        const bacterialColony = cellDensity > 0.7 && rng.next() < 0.2
        const biofilmMatrix = bacterialColony ? Math.sin(baseX * 10) * Math.cos(baseY * 8) * 0.05 : 0

        // Viral replication and infection
        const virusPresent = rng.next() < 0.01
        const viralReplication = virusPresent ? Math.sin(i * 0.2) * 0.1 : 0
        const infectedCell = virusPresent && rng.next() < 0.5

        // DNA/RNA strands and genetic code
        const dnaHelix = Math.sin(baseX * 12) * Math.cos(baseY * 12) * 0.03
        const geneticMutation = rng.next() < 0.005

        // Nanobots and microscopic machinery
        const nanobot = rng.next() < 0.002
        const nanobotTrail = nanobot ? Math.sin(i * 0.1) * 0.05 : 0

        // Brownian motion
        const brownianX = rng.gaussian() * 0.02
        const brownianY = rng.gaussian() * 0.02

        x =
          baseX +
          cellGrowth +
          biofilmMatrix +
          viralReplication +
          dnaHelix +
          nanobotTrail +
          brownianX +
          molecularVibration
        y =
          baseY +
          cellGrowth * 0.8 +
          biofilmMatrix * 0.5 +
          viralReplication * 0.8 +
          dnaHelix * 0.5 +
          nanobotTrail * 0.8 +
          brownianY

        metadata = {
          cellType: Math.floor(rng.next() * 5), // Prokaryotic, eukaryotic, plant, animal, fungal
          isBacteria: bacterialColony,
          isVirus: virusPresent,
          isDNA: geneticMutation,
          isNanobot: nanobot,
          mitosis: mitosis,
          infectionStatus: infectedCell ? "infected" : "healthy",
          geneticCode: geneticMutation ? "mutated" : "normal",
          molecularWeight: Math.abs(molecularVibration) * 1000,
          pHLevel: 7 + Math.sin(baseX) * 0.5,
          nutrientConcentration: 100 * Math.exp(-(baseX ** 2 + baseY ** 2) * 0.5),
          enzymeActivity: Math.abs(molecularVibration) * 50,
        }
        break
      }

      case "crystal": {
        // Crystal lattice with atomic bonds, energy fields, and geometric precision
        const latticeStrength = Math.sin(baseX * 4) * Math.cos(baseY * 4) + 0.5
        const atomicVibration = Math.sin(baseX * 10 + baseY * 10 + i * 0.2) * 0.02

        // Crystal growth patterns
        const growthRate = Math.abs(latticeStrength) * 0.1
        const crystalDefect = rng.next() < 0.01
        const dislocation = crystalDefect ? 0.05 : 0

        // Energy fields and light refraction
        const energyField = Math.sin(baseX * 6) * Math.cos(baseY * 6) * 0.1
        const lightRefraction = Math.sin(baseX * 3 + baseY * 3) * 0.08
        const photonEmission = rng.next() < 0.03 && energyField > 0.05

        // Quantum dots and impurities
        const quantumDot = rng.next() < 0.005
        const impurity = quantumDot ? 0.03 : 0

        // Piezoelectric effect
        const pressurePoint = Math.abs(baseX) < 0.1 && Math.abs(baseY) < 0.1
        const electricalCharge = pressurePoint ? Math.sin(i * 0.1) * 0.05 : 0

        // Phonons (lattice vibrations)
        const phononX = Math.sin(baseX * 15 + i * 0.05) * 0.01
        const phononY = Math.cos(baseY * 15 + i * 0.05) * 0.01

        x =
          baseX +
          growthRate +
          dislocation +
          energyField +
          lightRefraction +
          impurity +
          electricalCharge +
          phononX +
          atomicVibration
        y =
          baseY +
          growthRate * 0.8 +
          dislocation * 0.5 +
          energyField * 0.8 +
          lightRefraction * 0.5 +
          impurity * 0.8 +
          electricalCharge * 0.5 +
          phononY

        metadata = {
          crystalSystem: Math.floor(rng.next() * 7), // Cubic, hexagonal, tetragonal, etc.
          bondStrength: latticeStrength,
          hasDefect: crystalDefect,
          isQuantumDot: quantumDot,
          isPiezoelectric: pressurePoint,
          photonEmitting: photonEmission,
          latticeConstant: 0.5 + Math.abs(atomicVibration) * 0.1,
          energyBandGap: 1 + Math.abs(energyField) * 2, // eV
          refractiveIndex: 1.5 + Math.abs(lightRefraction) * 0.2,
          electricalConductivity: pressurePoint ? 100 : 0.01,
          thermalConductivity: 50 + Math.abs(atomicVibration) * 100,
          phononEnergy: Math.abs(phononX + phononY) * 100,
        }
        break
      }

      case "plasma": {
        // Plasma physics with ionized gas, magnetic fields, and fusion reactions
        const plasmaDensity = Math.sin(baseX * 3) * Math.cos(baseY * 3) + 0.5
        const magneticFieldStrength = Math.sin(baseX * 2) * Math.cos(baseY * 2) * 0.3

        // Ionized particles and electron flow
        const electronFlowX = Math.sin(baseY * 10 + i * 0.1) * 0.05
        const electronFlowY = Math.cos(baseX * 10 + i * 0.1) * 0.05
        const ionMotion = Math.sin(baseX * 15 + baseY * 15) * 0.03

        // Fusion reactions and energy release
        const fusionReaction = plasmaDensity > 0.8 && magneticFieldStrength > 0.2 && rng.next() < 0.005
        const energyBurst = fusionReaction ? 0.1 : 0

        // Magnetic confinement and instabilities
        const magneticConfinement = Math.exp(-(baseX ** 2 + baseY ** 2) * 0.5) * 0.1
        const plasmaInstability = magneticConfinement < 0.05 && rng.next() < 0.02

        // Solar flares and coronal mass ejections
        const solarFlare = rng.next() < 0.001
        const coronalEjection = solarFlare ? Math.sin(i * 0.05) * 0.1 : 0

        // Aurora borealis effects
        const aurora = Math.abs(baseY) > 1.5 && rng.next() < 0.05
        const auroraGlow = aurora ? Math.sin(baseX * 5) * 0.1 : 0

        // Cherenkov radiation
        const cherenkov = rng.next() < 0.008 && plasmaDensity > 0.6
        const cherenkovLight = cherenkov ? Math.sin(i * 0.3) * 0.08 : 0

        x =
          baseX +
          electronFlowX +
          ionMotion +
          energyBurst +
          magneticConfinement +
          coronalEjection +
          auroraGlow +
          cherenkovLight
        y =
          baseY +
          electronFlowY +
          ionMotion * 0.8 +
          energyBurst * 0.5 +
          magneticConfinement * 0.8 +
          coronalEjection * 0.5 +
          auroraGlow * 0.8 +
          cherenkovLight * 0.5

        metadata = {
          plasmaState: plasmaDensity > 0.7 ? "hot" : "cold",
          magneticField: magneticFieldStrength,
          isFusion: fusionReaction,
          isInstability: plasmaInstability,
          isSolarFlare: solarFlare,
          hasAurora: aurora,
          hasCherenkov: cherenkov,
          temperature: plasmaDensity * 10000000, // Kelvin
          density: plasmaDensity * 1e20, // particles/m³
          confinementTime: magneticConfinement * 100, // seconds
          energyOutput: energyBurst * 1e10, // Joules
          particleVelocity: Math.abs(electronFlowX + electronFlowY) * 1e6, // m/s
          radiationLevel: Math.abs(cherenkovLight) * 100,
        }
        break
      }

      case "atmospheric": {
        // Atmospheric physics with weather patterns, clouds, and climate phenomena
        const airPressure = 1013 + Math.sin(baseX * 2) * Math.cos(baseY * 2) * 50 // hPa
        const temperature = 20 + Math.sin(baseX * 0.5) * Math.cos(baseY * 0.5) * 15 // Celsius

        // Cloud formation and precipitation
        const cloudDensity = Math.max(0, Math.sin(baseY * 3) * Math.cos(baseX * 2) + 0.3)
        const rain = cloudDensity > 0.7 && rng.next() < 0.1
        const lightning = cloudDensity > 0.9 && rng.next() < 0.005
        const snowflake = temperature < 0 && cloudDensity > 0.5 && rng.next() < 0.05

        // Wind currents and turbulence
        const windSpeed = Math.abs(Math.sin(baseX * 4 + i * 0.02) * Math.cos(baseY * 3)) * 0.1
        const turbulence = windSpeed * Math.sin(baseX * 10 + baseY * 8) * 0.05

        // Atmospheric optics (rainbows, halos)
        const rainbow = rain && Math.abs(baseX) < 0.1 && Math.abs(baseY) < 0.1 && rng.next() < 0.01
        const halo = snowflake && Math.abs(baseX) < 0.2 && Math.abs(baseY) < 0.2 && rng.next() < 0.008

        // Climate zones and biomes
        const latitude = baseY * 90 // -90 to 90
        const longitude = baseX * 180 // -180 to 180
        const biomeType = getBiome(latitude, temperature)

        // Ozone layer and UV radiation
        const ozoneLayer = 1 - Math.exp(-Math.abs(baseY) * 2) * 0.5
        const uvRadiation = (1 - ozoneLayer) * 0.1

        // Greenhouse effect and CO2 levels
        const co2Level = 420 + Math.sin(i * 0.01) * 20 // ppm
        const greenhouseEffect = (co2Level - 400) * 0.001

        x = baseX + windSpeed * Math.cos(i * 0.01) + turbulence + (rainbow ? 0.1 : 0) + greenhouseEffect
        y = baseY + windSpeed * Math.sin(i * 0.01) + (rain ? 0.05 : 0) + (lightning ? 0.08 : 0) + uvRadiation

        metadata = {
          airPressure: airPressure,
          temperature: temperature,
          humidity: cloudDensity * 100,
          isRaining: rain,
          hasLightning: lightning,
          isSnowing: snowflake,
          hasRainbow: rainbow,
          hasHalo: halo,
          windSpeed: windSpeed * 100, // km/h
          cloudType: cloudDensity > 0.8 ? "cumulonimbus" : cloudDensity > 0.5 ? "stratus" : "cirrus",
          biome: biomeType,
          ozoneLevel: ozoneLayer * 100,
          co2Level: co2Level,
          climateZone:
            latitude > 60 || latitude < -60 ? "polar" : latitude > 30 || latitude < -30 ? "temperate" : "tropical",
        }
        break
      }

      case "geological": {
        // Geological time with tectonic plates, volcanic activity, and erosion
        const elevation = Math.sin(baseX * 3) * Math.cos(baseY * 3) * 0.5 // km
        const plateMovement = Math.sin(baseX * 0.8 + i * 0.005) * Math.cos(baseY * 0.6) * 0.1

        // Tectonic plate boundaries and earthquakes
        const faultLine = Math.abs(baseX - baseY) < 0.1 || Math.abs(baseX + baseY) < 0.1
        const earthquake = faultLine && rng.next() < 0.001
        const seismicWave = earthquake ? Math.sin(i * 0.1) * 0.05 : 0

        // Volcanic activity and magma flow
        const volcano = rng.next() < 0.002 && elevation > 0.3
        const eruption = volcano && rng.next() < 0.1
        const lavaFlow = eruption ? Math.sin(i * 0.08) * 0.08 : 0

        // Erosion and sedimentation
        const erosionRate = Math.abs(elevation) * 0.05
        const sedimentDeposit = erosionRate * Math.sin(baseX * 5) * 0.03

        // Mineral formation and crystal growth
        const mineralVein = rng.next() < 0.05
        const crystalGrowth = mineralVein ? Math.sin(i * 0.03) * 0.02 : 0

        // Fossilization and ancient life
        const fossil = rng.next() < 0.0005
        const ancientLife = fossil ? Math.floor(rng.next() * 5) : "none" // Trilobite, dinosaur, etc.

        // Geothermal vents and hot springs
        const geothermalVent = rng.next() < 0.003 && elevation < -0.1
        const hotSpring = geothermalVent ? Math.sin(baseX * 10) * 0.03 : 0

        // Ice ages and glaciation
        const iceAge = Math.sin(i * 0.001) > 0.5 // Long-term climate cycle
        const glacier = iceAge && elevation > 0.4 && rng.next() < 0.1

        x =
          baseX +
          plateMovement +
          seismicWave +
          lavaFlow +
          sedimentDeposit +
          crystalGrowth +
          hotSpring +
          (glacier ? 0.05 : 0)
        y =
          baseY +
          elevation * 0.1 +
          plateMovement * 0.8 +
          seismicWave * 0.5 +
          lavaFlow * 0.8 +
          sedimentDeposit * 0.5 +
          crystalGrowth * 0.8 +
          hotSpring * 0.5 +
          (glacier ? 0.08 : 0)

        metadata = {
          elevation: elevation,
          rockType: Math.floor(rng.next() * 3), // Igneous, sedimentary, metamorphic
          isFaultLine: faultLine,
          hasEarthquake: earthquake,
          isVolcano: volcano,
          hasEruption: eruption,
          hasMineralVein: mineralVein,
          hasFossil: fossil,
          ancientLife: ancientLife,
          geothermalActivity: geothermalVent,
          isGlacier: glacier,
          erosionRate: erosionRate * 100, // mm/year
          sedimentThickness: Math.abs(sedimentDeposit) * 100, // meters
          crustalStress: Math.abs(plateMovement) * 100, // MPa
          magmaChamberPressure: eruption ? 1000 : 100, // MPa
          geologicalAge: i * 1000000, // Years
        }
        break
      }

      case "biological": {
        // Biological systems with cells, organs, and physiological processes
        const cellActivity = Math.sin(baseX * 5) * Math.cos(baseY * 5) + 0.5
        const metabolicRate = Math.abs(cellActivity) * 0.1

        // Organ systems and tissue differentiation
        const organType = Math.floor(rng.next() * 5) // Heart, lung, brain, liver, kidney
        const tissueGrowth = cellActivity > 0.7 && rng.next() < 0.1
        const differentiation = tissueGrowth ? 0.05 : 0

        // Blood flow and circulation
        const bloodPressure = 120 + Math.sin(i * 0.05) * 20 // mmHg
        const bloodFlow = Math.sin(baseX * 10 + i * 0.1) * 0.05
        const oxygenation = bloodFlow > 0.03 ? 0.02 : 0

        // Immune response and pathogen detection
        const pathogenPresent = rng.next() < 0.005
        const immuneCell = pathogenPresent ? Math.sin(i * 0.2) * 0.08 : 0
        const inflammation = pathogenPresent && rng.next() < 0.5

        // Hormone regulation and feedback loops
        const hormoneLevel = Math.sin(i * 0.03) * 0.1 + 0.5
        const feedbackLoop = hormoneLevel > 0.8 ? 0.03 : 0

        // Sensory perception and neural signals
        const neuralSignal = Math.sin(baseX * 15 + baseY * 15) * 0.03
        const sensoryInput = neuralSignal > 0.02 ? 0.02 : 0

        // DNA repair and aging
        const dnaDamage = rng.next() < 0.001
        const dnaRepair = dnaDamage ? 0.01 : 0
        const agingEffect = i * 0.00001

        x = baseX + differentiation + bloodFlow + immuneCell + feedbackLoop + sensoryInput + dnaRepair + agingEffect
        y =
          baseY +
          metabolicRate * 0.8 +
          differentiation * 0.5 +
          bloodFlow * 0.8 +
          immuneCell * 0.5 +
          feedbackLoop * 0.8 +
          sensoryInput * 0.5 +
          dnaRepair * 0.5

        metadata = {
          cellState: cellActivity > 0.7 ? "active" : "resting",
          organFunction: organType,
          bloodPressure: bloodPressure,
          oxygenSaturation: oxygenation * 100,
          hasPathogen: pathogenPresent,
          inflammation: inflammation,
          hormoneType: Math.floor(rng.next() * 4), // Insulin, adrenaline, cortisol, estrogen
          neuralSignalStrength: Math.abs(neuralSignal) * 100,
          dnaIntegrity: 1 - dnaDamage,
          biologicalAge: i * 0.01, // Years
          metabolicEfficiency: metabolicRate * 100,
          immuneResponse: immuneCell > 0.05,
          homeostasis: Math.abs(hormoneLevel - 0.5) < 0.1,
        }
        break
      }

      case "cosmic_scale": {
        // Cosmic scale with superclusters, dark energy, and the expansion of the universe
        const cosmicWebDensity = Math.sin(baseX * 0.5) * Math.cos(baseY * 0.5) + 0.5
        const darkEnergyDensity = Math.sin(baseX * 0.2 + i * 0.001) * 0.1 + 0.7

        // Galaxy clusters and superclusters
        const galaxyCluster = cosmicWebDensity > 0.7 && rng.next() < 0.05
        const superclusterCore = galaxyCluster && Math.sin(baseX * 0.1) > 0.8
        const galaxyHalo = superclusterCore ? Math.sin(baseX * 2) * Math.cos(baseY * 2) * 0.1 : 0

        // Expansion of the universe (Hubble's Law)
        const distance = Math.sqrt(baseX * baseX + baseY * baseY)
        const recessionVelocity = distance * 70 // km/s/Mpc (Hubble constant)
        const expansionEffect = recessionVelocity * 0.0001

        // Dark matter filaments
        const darkMatterFilament = cosmicWebDensity > 0.6 && rng.next() < 0.1
        const filamentDensity = darkMatterFilament ? Math.sin(baseX * 3) * Math.cos(baseY * 3) * 0.05 : 0

        // Cosmic microwave background radiation
        const cmbFluctuation = Math.sin(baseX * 100 + baseY * 100) * 0.001
        const cmbTemperature = 2.725 + cmbFluctuation // Kelvin

        // Gravitational waves
        const gravitationalWave = rng.next() < 0.0001
        const spacetimeRipple = gravitationalWave ? Math.sin(i * 0.05) * 0.02 : 0

        // Quasars and active galactic nuclei
        const quasar = rng.next() < 0.0008 && galaxyCluster
        const agnJet = quasar ? Math.sin(i * 0.03) * 0.08 : 0

        x =
          baseX +
          expansionEffect * Math.cos(Math.atan2(baseY, baseX)) +
          galaxyHalo +
          filamentDensity +
          spacetimeRipple +
          agnJet
        y =
          baseY +
          expansionEffect * Math.sin(Math.atan2(baseY, baseX)) +
          galaxyHalo * 0.8 +
          filamentDensity * 0.5 +
          spacetimeRipple * 0.8 +
          agnJet * 0.5

        metadata = {
          cosmicWebDensity: cosmicWebDensity,
          darkEnergyDensity: darkEnergyDensity,
          isGalaxyCluster: galaxyCluster,
          isSuperclusterCore: superclusterCore,
          recessionVelocity: recessionVelocity,
          hasDarkMatterFilament: darkMatterFilament,
          cmbTemperature: cmbTemperature,
          hasGravitationalWave: gravitationalWave,
          isQuasar: quasar,
          universeAge: 13.8, // Billion years
          cosmicExpansionRate: expansionEffect * 100,
          galaxyCount: Math.floor(cosmicWebDensity * 1000),
          darkMatterPercentage: 27 + Math.sin(i * 0.001) * 5,
          darkEnergyPercentage: 68 + Math.cos(i * 0.001) * 5,
        }
        break
      }

      case "microscopic_world": {
        // Microscopic world with subatomic particles, quantum fluctuations, and string theory
        const quantumFieldFluctuation = Math.sin(baseX * 20) * Math.cos(baseY * 20) * 0.05
        const stringVibrationAmplitude = Math.sin(baseX * 15 + baseY * 15 + i * 0.3) * 0.03

        // Subatomic particles (quarks, leptons)
        const particleType = Math.floor(rng.next() * 6) // Up, Down, Electron, Neutrino, Photon, Gluon
        const particleSpin = rng.next() < 0.5 ? "up" : "down"
        const particleInteraction = Math.sin(baseX * 30 + baseY * 30) * 0.01

        // Quantum foam and spacetime ripples
        const quantumFoam = Math.sin(baseX * 50) * Math.cos(baseY * 50) * 0.005
        const spacetimeRipple = Math.sin(i * 0.05) * 0.01

        // Extra dimensions (compactified)
        const extraDimX = Math.sin(baseX * 5 + i * 0.1) * 0.02
        const extraDimY = Math.cos(baseY * 5 + i * 0.1) * 0.02

        // Virtual particles and vacuum energy
        const virtualParticle = rng.next() < 0.05
        const vacuumEnergy = virtualParticle ? Math.sin(i * 0.2) * 0.03 : 0

        // Quantum entanglement and non-locality
        const entangledPair = Math.floor(i / 2) * 2
        const entangled = i === entangledPair || i === entangledPair + 1
        const nonLocalityEffect = entangled ? Math.sin(i * 0.1) * 0.04 : 0

        // Higgs field and mass generation
        const higgsFieldStrength = 1 + Math.sin(baseX * 8 + baseY * 8) * 0.2
        const massGeneration = higgsFieldStrength > 1.1 && rng.next() < 0.01

        x =
          baseX +
          quantumFieldFluctuation +
          stringVibrationAmplitude +
          particleInteraction +
          quantumFoam +
          extraDimX +
          vacuumEnergy +
          nonLocalityEffect
        y =
          baseY +
          quantumFieldFluctuation * 0.8 +
          stringVibrationAmplitude * 0.5 +
          particleInteraction * 0.8 +
          quantumFoam * 0.5 +
          extraDimY * 0.8 +
          vacuumEnergy * 0.5 +
          nonLocalityEffect * 0.5

        metadata = {
          particleType: particleType,
          particleSpin: particleSpin,
          quantumFieldStrength: Math.abs(quantumFieldFluctuation) * 100,
          stringVibration: stringVibrationAmplitude * 100,
          hasExtraDimension: extraDimX !== 0 || extraDimY !== 0,
          isVirtualParticle: virtualParticle,
          isEntangled: entangled,
          higgsField: higgsFieldStrength,
          massGenerated: massGeneration,
          quantumGravityEffect: Math.abs(quantumFoam) * 1000,
          vacuumEnergyDensity: Math.abs(vacuumEnergy) * 1000,
          nonLocality: nonLocalityEffect * 100,
          fundamentalForce: Math.floor(rng.next() * 4), // Strong, Weak, Electromagnetic, Gravitational
        }
        break
      }

      case "living_forest": {
        // Living forest with ancient trees, glowing flora, and hidden spirits
        const treeDensity = Math.sin(baseX * 2) * Math.cos(baseY * 2) + 0.5
        const glowingFloraIntensity = Math.sin(baseX * 4 + baseY * 4) * 0.1 + 0.1

        // Ancient tree roots and branches
        const rootSystem = Math.sin(baseX * 8) * Math.cos(baseY * 6) * 0.08
        const branchCanopy = Math.abs(baseY) * 0.15
        const ancientBark = Math.abs(treeDensity) > 0.5 ? 0.05 : 0

        // Forest spirits and elemental beings
        const forestSpirit = rng.next() < 0.005
        const elementalAura = forestSpirit ? Math.sin(i * 0.1) * 0.05 : 0
        const spiritTrail = forestSpirit ? Math.sin(i * 0.2) * 0.03 : 0

        // Bioluminescent fungi and glowing moss
        const bioluminescentFungi = rng.next() < 0.02 && glowingFloraIntensity > 0.1
        const glowingMoss = bioluminescentFungi ? Math.sin(baseX * 10) * 0.03 : 0

        // Whispering winds and rustling leaves
        const windWhisper = Math.sin(baseX * 3 + i * 0.01) * 0.05
        const leafRustle = Math.cos(baseY * 4 + i * 0.02) * 0.04

        // Hidden pathways and magical clearings
        const hiddenPath = Math.abs(baseX - 0.5) < 0.1 && Math.abs(baseY + 0.5) < 0.1
        const magicClearing = hiddenPath ? Math.sin(i * 0.05) * 0.08 : 0

        // Fauna presence (deer, owls, foxes)
        const deer = rng.next() < 0.003
        const owl = rng.next() < 0.002
        const fox = rng.next() < 0.004

        x = baseX + rootSystem + elementalAura + glowingMoss + windWhisper + magicClearing + (deer ? 0.05 : 0)
        y = baseY + branchCanopy + spiritTrail + glowingMoss * 0.8 + leafRustle + magicClearing * 0.5 + (owl ? 0.03 : 0)

        metadata = {
          treeAge: Math.floor(treeDensity * 1000) + 100, // Years
          floraType: Math.floor(rng.next() * 4), // Fungi, moss, fern, flower
          isGlowing: glowingFloraIntensity > 0.1,
          hasSpirit: forestSpirit,
          spiritType: Math.floor(rng.next() * 3), // Dryad, Sylph, Gnome
          windStrength: Math.abs(windWhisper) * 10, // km/h
          leafColor: Math.floor(rng.next() * 5), // Green, red, yellow, brown, blue (magical)
          hiddenPath: hiddenPath,
          animalPresence: deer || owl || fox,
          forestHealth: treeDensity * 100,
          magicalEnergy: glowingFloraIntensity * 100,
          soundscape: windWhisper + leafRustle,
        }
        break
      }

      case "deep_ocean": {
        // Deep ocean with abyssal plains, hydrothermal vents, and unique life forms
        const abyssalDepth = Math.max(0, -baseY * 10000 + 5000) // 0-10000m depth
        const hydrothermalActivity = Math.sin(baseX * 3) * Math.cos(baseY * 3) * 0.1 + 0.05

        // Hydrothermal vents and black smokers
        const ventPlume = hydrothermalActivity > 0.1 && rng.next() < 0.05
        const mineralPrecipitation = ventPlume ? Math.sin(i * 0.1) * 0.05 : 0

        // Chemosynthetic ecosystems
        const chemosyntheticLife = hydrothermalActivity > 0.08 && rng.next() < 0.1
        const tubeWormColony = chemosyntheticLife ? Math.sin(baseX * 8) * Math.cos(baseY * 6) * 0.03 : 0

        // Abyssal creatures (anglerfish, giant squid)
        const anglerfish = rng.next() < 0.001 && abyssalDepth > 3000
        const giantSquid = rng.next() < 0.0005 && abyssalDepth > 5000
        const deepSeaJelly = rng.next() < 0.01 && abyssalDepth > 1000

        // Ocean trenches and subduction zones
        const oceanTrench = Math.abs(baseX) > 1.5 && Math.abs(baseY) > 1.5
        const subductionZone = oceanTrench && rng.next() < 0.001
        const trenchDepth = oceanTrench ? Math.sin(i * 0.02) * 0.1 : 0

        // Marine snow and detritus
        const marineSnow = Math.sin(baseX * 20 + baseY * 20 + i * 0.5) * 0.01
        const detritusFall = marineSnow > 0.005 ? 0.005 : 0

        // Deep ocean currents and thermohaline circulation
        const deepCurrent = Math.sin(baseX * 0.5 + i * 0.001) * 0.08
        const thermohalineFlow = Math.exp(-abyssalDepth * 0.0001) * Math.sin(baseX * 0.8) * 0.05

        x =
          baseX +
          mineralPrecipitation +
          tubeWormColony +
          trenchDepth +
          marineSnow +
          deepCurrent +
          (anglerfish ? 0.05 : 0)
        y =
          baseY +
          hydrothermalActivity * 0.5 +
          tubeWormColony * 0.8 +
          trenchDepth * 0.5 +
          detritusFall +
          thermohalineFlow +
          (giantSquid ? 0.08 : 0)

        metadata = {
          depth: abyssalDepth,
          temperature: 2 + abyssalDepth * 0.0001, // Near freezing
          pressure: 1 + abyssalDepth * 0.1, // High pressure
          hasHydrothermalVent: hydrothermalActivity > 0.05,
          hasChemosyntheticLife: chemosyntheticLife,
          creatureType: anglerfish
            ? "anglerfish"
            : giantSquid
              ? "giant_squid"
              : deepSeaJelly
                ? "deep_sea_jelly"
                : "none",
          isOceanTrench: oceanTrench,
          marineSnowDensity: marineSnow * 100,
          currentSpeed: Math.abs(deepCurrent) * 10, // km/h
          oxygenLevel: Math.max(0, 1 - abyssalDepth * 0.0001),
          nutrientAvailability: hydrothermalActivity * 100,
          geologicalFeature: subductionZone ? "subduction_zone" : "abyssal_plain",
          biomass: chemosyntheticLife ? 100 : 1,
        }
        break
      }

      case "biological_systems": {
        // Biological systems with cellular automata, genetic algorithms, and emergent behavior
        const cellularActivity = Math.sin(baseX * 5) * Math.cos(baseY * 5) + 0.5
        const geneticDiversity = Math.sin(baseX * 2 + i * 0.01) * 0.1 + 0.5

        // Cellular automata patterns (Conway's Game of Life)
        const cellState = cellularActivity > 0.7 ? 1 : 0 // Live or dead
        const neighborCount = countNeighbors(points, i, 0.1) // Count live neighbors
        const nextCellState = applyGameOfLifeRules(cellState, neighborCount)
        const cellGrowth = nextCellState === 1 && cellState === 0 ? 0.05 : 0

        // Genetic algorithms and evolution
        const mutationRate = 0.01
        const crossoverEvent = rng.next() < 0.05
        const adaptation = geneticDiversity * 0.1

        // Emergent behavior and self-organization
        const flockingBehavior = Math.sin(baseX * 8 + baseY * 6) * 0.05
        const swarmIntelligence = flockingBehavior > 0.03 ? 0.02 : 0

        // Protein folding and molecular dynamics
        const proteinFold = Math.sin(baseX * 12 + baseY * 12) * 0.03
        const molecularInteraction = proteinFold > 0.02 ? 0.01 : 0

        // Ecosystem dynamics and predator-prey models
        const predatorPreyCycle = Math.sin(i * 0.02) * 0.1
        const populationDensity = 1 + predatorPreyCycle

        // Biofeedback loops and homeostatic regulation
        const feedbackLoop = Math.sin(baseX * 3 + baseY * 3) * 0.04
        const homeostasis = Math.abs(feedbackLoop) < 0.01 ? 0.02 : 0

        x =
          baseX +
          cellGrowth +
          adaptation +
          flockingBehavior +
          molecularInteraction +
          populationDensity * 0.01 +
          homeostasis
        y =
          baseY +
          cellGrowth * 0.8 +
          adaptation * 0.5 +
          flockingBehavior * 0.8 +
          molecularInteraction * 0.5 +
          populationDensity * 0.008 +
          homeostasis * 0.5

        metadata = {
          cellState: cellState,
          nextCellState: nextCellState,
          geneticFitness: geneticDiversity * 100,
          mutationOccurred: rng.next() < mutationRate,
          crossoverOccurred: crossoverEvent,
          emergentProperty: flockingBehavior > 0.03,
          proteinStability: proteinFold * 100,
          populationSize: Math.floor(populationDensity * 1000),
          homeostasisAchieved: homeostasis > 0.01,
          ecosystemHealth: geneticDiversity * 100,
          biologicalComplexity: neighborCount,
          selfOrganization: swarmIntelligence > 0,
          evolutionaryPressure: Math.abs(predatorPreyCycle) * 10,
        }
        break
      }

      case "geological_time": {
        // Geological time with continental drift, ice ages, and mass extinctions
        const continentalDrift = Math.sin(baseX * 0.1 + i * 0.0001) * 0.5
        const iceSheetExtent = Math.sin(i * 0.00005) * 0.3 + 0.5 // Long-term cycle

        // Tectonic plate collisions and mountain building
        const collisionZone = Math.abs(baseX - 0.5) < 0.2 && Math.abs(baseY + 0.5) < 0.2
        const mountainBuilding = collisionZone ? Math.sin(i * 0.0002) * 0.1 : 0

        // Volcanic super-eruptions and climate impact
        const supervolcano = rng.next() < 0.00001
        const climateImpact = supervolcano ? Math.sin(i * 0.00003) * 0.2 : 0

        // Mass extinctions and biodiversity loss
        const extinctionEvent = rng.next() < 0.000005
        const biodiversityLoss = extinctionEvent ? Math.sin(i * 0.00002) * 0.1 : 0

        // Fossil record and evolutionary leaps
        const fossilRecord = Math.sin(i * 0.00001) * 0.05
        const evolutionaryLeap = rng.next() < 0.000001

        // Ocean basin formation and sea level changes
        const oceanBasin = Math.abs(baseY) > 1.5
        const seaLevelChange = oceanBasin ? Math.sin(i * 0.00004) * 0.1 : 0

        // Asteroid impacts and their aftermath
        const asteroidImpact = rng.next() < 0.0000001
        const impactCrater = asteroidImpact ? Math.sin(i * 0.00001) * 0.05 : 0

        x = baseX + continentalDrift + mountainBuilding + climateImpact + biodiversityLoss + fossilRecord + impactCrater
        y =
          baseY +
          iceSheetExtent * 0.1 +
          continentalDrift * 0.8 +
          mountainBuilding * 0.5 +
          climateImpact * 0.8 +
          biodiversityLoss * 0.5 +
          seaLevelChange +
          impactCrater * 0.8

        metadata = {
          continentalPosition: continentalDrift * 100, // km
          iceAge: iceSheetExtent > 0.7,
          isMountainRange: mountainBuilding > 0.05,
          isSupervolcano: supervolcano,
          hasExtinctionEvent: extinctionEvent,
          hasEvolutionaryLeap: evolutionaryLeap,
          oceanDepth: seaLevelChange * 1000, // meters
          hasAsteroidImpact: asteroidImpact,
          geologicalEra: getGeologicalEra(i * 1000000), // Years
          tectonicActivity: Math.abs(continentalDrift) * 10, // cm/year
          climateStability: 1 - Math.abs(climateImpact) * 10,
          biodiversityLevel: 1 - biodiversityLoss,
          fossilDensity: Math.abs(fossilRecord) * 100,
          seaLevel: seaLevelChange * 100, // meters
          impactEnergy: asteroidImpact ? 1e10 : 0, // Megatons
        }
        break
      }

      default:
        metadata = {
          magnitude: Math.sqrt(baseX * baseX + baseY * baseY),
          angle: Math.atan2(baseY, baseX),
        }
        break
    }

    transformedPoints.push({ x, y, metadata })
  }

  return transformedPoints
}

// Helper functions for scenarios
function isPrime(num: number): boolean {
  if (num <= 1) return false
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false
  }
  return true
}

function fibonacciSpiral(x: number, y: number): boolean {
  const angle = Math.atan2(y, x)
  const r = Math.sqrt(x * x + y * y)
  const goldenRatio = (1 + Math.sqrt(5)) / 2
  const expectedR = Math.exp(angle / goldenRatio)
  return Math.abs(r - expectedR) < 0.1
}

function getBiome(latitude: number, temperature: number): string {
  if (latitude > 60 || latitude < -60) {
    return temperature < 0 ? "tundra" : "taiga"
  } else if (latitude > 30 || latitude < -30) {
    if (temperature > 20) return "temperate_forest"
    if (temperature > 10) return "grassland"
    return "desert"
  } else {
    if (temperature > 25) return "tropical_rainforest"
    if (temperature > 15) return "savanna"
    return "chaparral"
  }
}

function countNeighbors(points: number[][], currentIndex: number, radius: number): number {
  let liveNeighbors = 0
  const [cx, cy] = points[currentIndex]

  for (let i = 0; i < points.length; i++) {
    if (i === currentIndex) continue
    const [nx, ny] = points[i]
    const dist = Math.sqrt((cx - nx) ** 2 + (cy - ny) ** 2)
    if (dist < radius) {
      // Assuming "live" if point exists within radius
      liveNeighbors++
    }
  }
  return liveNeighbors
}

function applyGameOfLifeRules(currentState: number, liveNeighbors: number): number {
  if (currentState === 1) {
    // Live cell
    if (liveNeighbors < 2 || liveNeighbors > 3) {
      return 0 // Dies
    }
    return 1 // Lives
  } else {
    // Dead cell
    if (liveNeighbors === 3) {
      return 1 // Becomes alive
    }
    return 0 // Stays dead
  }
}

function getGeologicalEra(yearsAgo: number): string {
  if (yearsAgo < 66000000) return "Cenozoic"
  if (yearsAgo < 252000000) return "Mesozoic"
  if (yearsAgo < 541000000) return "Paleozoic"
  if (yearsAgo < 4000000000) return "Proterozoic"
  return "Archean"
}

// Main function to generate flow art data
export function generateFlowArtData(params: GenerationParams) {
  const { dataset, scenario, colorScheme, seed, numSamples, noiseScale, timeStep } = params

  const rawPoints = generateDataset(dataset, seed, numSamples, noiseScale)
  const transformedPoints = applyScenarioTransform(rawPoints, scenario, new SeededRandom(seed))

  const colors = colorPalettes[colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma

  // Normalize points to fit within a 0-1 range for canvas
  let minX = Number.POSITIVE_INFINITY,
    maxX = Number.NEGATIVE_INFINITY,
    minY = Number.POSITIVE_INFINITY,
    maxY = Number.NEGATIVE_INFINITY
  for (const p of transformedPoints) {
    minX = Math.min(minX, p.x)
    maxX = Math.max(maxX, p.x)
    minY = Math.min(minY, p.y)
    maxY = Math.max(maxY, p.y)
  }

  const rangeX = maxX - minX
  const rangeY = maxY - minY

  const normalizedPoints = transformedPoints.map((p) => ({
    x: (p.x - minX) / rangeX,
    y: (p.y - minY) / rangeY,
    metadata: p.metadata,
  }))

  return {
    points: normalizedPoints,
    colors: colors,
    bounds: { minX, maxX, minY, maxY },
  }
}
