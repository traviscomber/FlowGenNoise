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
    const fibSpiral = Math.sqrt(t) * Math.cos(t * phi + isPrime(Math.floor(t)) ? Math.PI / 4 : 0) * 0.2

    // Hyperbolic spiral with chaos theory
    const hypSpiral = (1 / t) * Math.sin(t * 3.14159) * 0.4

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
      z_imag = 2 * z_real * z_imag + c_imag
      z_real = temp
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

      case "forest":
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

      case "cosmic":
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

      case "ocean":
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

      case "neural":
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

      case "quantum":
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

        // Quantum field fluctuations
        const fieldFluctuation = Math.sin(baseX * 30) * Math.cos(baseY * 25) * Math.sin(i * 0.1) * 0.03

        x = baseX + quantumState + superposition + spookyAction + vacuumFluctuation + fieldFluctuation
        y = baseY + quantumState * Math.sin(i * 0.1) + spookyAction * 0.8 + (tunneled ? rng.gaussian() * 0.2 : 0)

        metadata = {
          particleType: Math.floor(rng.next() * 6), // Electron, photon, quark, etc.
          spin: rng.next() < 0.5 ? 0.5 : -0.5,
          charge: Math.floor(rng.next() * 3) - 1, // -1, 0, 1
          waveFunction: waveFunction,
          isObserved: observationCollapse,
          entangled: entangled,
          coherenceTime: coherenceTime * 1000, // femtoseconds
          tunneled: tunneled,
          virtualParticle: virtualParticle,
          uncertainty: Math.abs(quantumState) * 10,
          quantumNumber: Math.floor(Math.abs(baseX * baseY * 100)) % 4,
          fieldStrength: Math.abs(fieldFluctuation) * 100,
        }
        break

      case "microscopic":
        // Molecular world with atoms, molecules, and chemical reactions
        const temperature = 300 + 100 * Math.sin(baseX * 0.8)
        const kineticEnergy = temperature * 1.38e-23 // Boltzmann constant

        // Brownian motion
        const brownianX = rng.gaussian() * Math.sqrt(kineticEnergy) * 0.15
        const brownianY = rng.gaussian() * Math.sqrt(kineticEnergy) * 0.15

        // Molecular interactions
        const molecularDistance = Math.sqrt(baseX ** 2 + baseY ** 2) + 0.05
        const vanDerWaals = (1 / Math.pow(molecularDistance, 12) - 1 / Math.pow(molecularDistance, 6)) * 0.02

        // Chemical bonds
        const covalentBond = molecularDistance < 0.3 && rng.next() < 0.2
        const ionicBond = molecularDistance < 0.4 && rng.next() < 0.1
        const hydrogenBond = Math.exp(-molecularDistance * 8) * Math.cos(Math.atan2(baseY, baseX) * 3) * 0.08

        // Enzyme activity and catalysis
        const enzyme = rng.next() < 0.05
        const substrate = rng.next() < 0.3
        const catalysis = enzyme && substrate && molecularDistance < 0.2

        // Protein folding
        const aminoAcid = rng.next() < 0.4
        const proteinFold = aminoAcid ? Math.sin(baseX * 5 + baseY * 3) * 0.06 : 0

        // DNA replication and transcription
        const nucleotide = rng.next() < 0.25
        const basePair = nucleotide && Math.sin(baseX * 8) > 0.5
        const transcription = basePair && rng.next() < 0.1

        // Cellular organelles
        const mitochondria = rng.next() < 0.02
        const ribosome = rng.next() < 0.08
        const endoplasmicReticulum = Math.sin(baseX * 4) * Math.cos(baseY * 3) > 0.7

        x = baseX + brownianX + vanDerWaals * Math.cos(Math.atan2(baseY, baseX)) + proteinFold
        y = baseY + brownianY + vanDerWaals * Math.sin(Math.atan2(baseY, baseX)) + hydrogenBond

        metadata = {
          moleculeType: Math.floor(rng.next() * 8), // Water, protein, lipid, etc.
          temperature: temperature,
          kineticEnergy: kineticEnergy * 1e23,
          bondType: covalentBond ? "covalent" : ionicBond ? "ionic" : hydrogenBond > 0.05 ? "hydrogen" : "none",
          isEnzyme: enzyme,
          isSubstrate: substrate,
          catalyticActivity: catalysis ? 100 : 0,
          proteinStructure: aminoAcid ? Math.floor(rng.next() * 4) : -1, // Primary, secondary, tertiary, quaternary
          geneticMaterial: nucleotide,
          organelle: mitochondria ? "mitochondria" : ribosome ? "ribosome" : endoplasmicReticulum ? "ER" : "cytoplasm",
          diffusionRate: Math.sqrt(brownianX ** 2 + brownianY ** 2) * 1000,
          molecularWeight: 10 + rng.range(0, 500),
        }
        break

      // Add more contextual scenarios...
      case "crystalline":
        // Crystal formations with gems, minerals, and lattice structures
        const latticeConstant = 0.4
        const latticeX = Math.round(baseX / latticeConstant) * latticeConstant
        const latticeY = Math.round(baseY / latticeConstant) * latticeConstant

        // Crystal defects and impurities
        const dislocation = rng.next() < 0.03
        const impurity = rng.next() < 0.08
        const twinBoundary = Math.sin(baseX * 5) * Math.cos(baseY * 5) > 0.8

        // Gemstone formation
        const gemstone = rng.next() < 0.01
        const gemType = Math.floor(rng.next() * 6) // Diamond, ruby, sapphire, etc.
        const clarity = rng.range(0.5, 1.0)

        // Crystal growth and facets
        const growthRate = Math.abs(Math.sin(baseX * 3) * Math.cos(baseY * 3)) * 0.05
        const facetAngle = Math.atan2(baseY, baseX) + Math.PI / 6
        const facetReflection = Math.sin(facetAngle * 6) * 0.04

        // Piezoelectric and optical properties
        const crystalField = Math.sin(baseX * 4) * Math.cos(baseY * 4)
        const piezoStrain = crystalField * 0.03
        const birefringence = Math.sin(facetAngle * 2) * 0.02

        x = latticeX + (dislocation ? rng.gaussian() * 0.1 : 0) + piezoStrain + facetReflection
        y = latticeY + (impurity ? rng.gaussian() * 0.08 : 0) + growthRate + birefringence

        metadata = {
          crystalSystem: Math.floor(rng.next() * 7), // Cubic, tetragonal, etc.
          gemstone: gemstone,
          gemType: gemType,
          clarity: clarity,
          hardness: 3 + rng.range(0, 7), // Mohs scale
          hasDefect: dislocation || impurity,
          twinned: twinBoundary,
          opticalProperty: Math.floor(rng.next() * 4), // Transparent, translucent, etc.
          piezoelectric: Math.abs(crystalField) > 0.5,
          growthStage: Math.floor(growthRate * 10),
          mineralComposition: Math.floor(rng.next() * 12),
        }
        break

      case "plasma":
        // Plasma physics with ions, electrons, and electromagnetic phenomena
        const magneticField = Math.sin(baseX * 3) * Math.cos(baseY * 3)
        const electricField = Math.cos(baseX * 4) * Math.sin(baseY * 4)

        // Charged particle dynamics
        const charge = rng.next() < 0.5 ? 1 : -1
        const lorentzForceX = charge * (electricField + magneticField * baseY) * 0.12
        const lorentzForceY = charge * (electricField - magneticField * baseX) * 0.12

        // Plasma instabilities and turbulence
        const kelvinHelmholtz = Math.sin(baseX * 12 + baseY * 8) * Math.exp(-Math.abs(baseX) * 1.5) * 0.18
        const rayleighTaylor = Math.cos(baseY * 10) * Math.exp(-Math.abs(baseY) * 2) * 0.15

        // Fusion reactions and energy release
        const fusionCrossSection = Math.exp(-Math.abs(baseX - baseY) * 8) * 0.12
        const alphaParticle = fusionCrossSection > 0.08 && rng.next() < 0.1
        const neutronFlux = fusionCrossSection * Math.sin(baseX * baseY * 100) * 0.25

        // Magnetic confinement
        const magneticBottle = Math.exp(-((baseX ** 2 + baseY ** 2) * 2)) * magneticField * 0.1
        const plasmoidFormation = Math.abs(magneticField) > 0.7 && rng.next() < 0.05

        // Electromagnetic radiation
        const synchrotronRadiation = Math.abs(lorentzForceX + lorentzForceY) * 0.1
        const bremsstrahlung = charge * electricField * 0.08

        x = baseX + lorentzForceX + kelvinHelmholtz + magneticBottle + synchrotronRadiation
        y = baseY + lorentzForceY + rayleighTaylor + neutronFlux + bremsstrahlung

        metadata = {
          temperature: 10000 + Math.abs(fusionCrossSection) * 1000000,
          density: 1e15 + Math.abs(kelvinHelmholtz) * 1e17,
          magneticField: magneticField,
          electricField: electricField,
          charge: charge,
          isIonized: true,
          fusionRate: fusionCrossSection * 10000,
          alphaParticle: alphaParticle,
          confinementTime: Math.abs(magneticBottle) * 1000, // milliseconds
          plasmoid: plasmoidFormation,
          radiationPower: Math.abs(synchrotronRadiation + bremsstrahlung) * 1000,
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
  if (params.enableStereographic) {
    return generateStereographicProjection(params)
  }
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
          opacity = 0.4 + Math.abs(point.metadata.pattern) * 0.4
          break
        case "quantum":
          radius = 0.4 + point.metadata.uncertainty * 0.3
          opacity = 0.3 + point.metadata.entanglementStrength * 0.5

          if (point.metadata.isParticle) {
            stroke = colors[3]
            strokeWidth = 0.5
          }
          break

        case "microscopic":
          radius = 0.3 + point.metadata.diffusionRate * 0.1
          opacity = 0.2 + point.metadata.bondStrength * 0.3

          if (point.metadata.isMolecule) {
            stroke = colors[3]
            strokeWidth = 0.3
          }
          break

        case "crystalline":
          radius = 0.3 + point.metadata.crystalSize * 0.05
          opacity = 0.4 + point.metadata.hardness * 0.03

          if (point.metadata.hasDefect) {
            stroke = colors[3]
            strokeWidth = 0.5
          }
          break

        case "plasma":
          radius = 0.4 + point.metadata.temperature * 0.00001
          opacity = 0.3 + point.metadata.density * 1e-17

          if (point.metadata.isIonized) {
            stroke = colors[3]
            strokeWidth = 0.3
          }
          break

        case "atmospheric":
          radius = 0.3 + point.metadata.windSpeed * 0.01
          opacity = 0.2 + point.metadata.visibility * 0.01

          break

        case "geological":
          radius = 0.4 + point.metadata.age * 1e-7
          opacity = 0.3 + point.metadata.tectonicActivity * 0.01

          break

        case "biological":
          radius = 0.3 + point.metadata.proteinLength * 0.001
          opacity = 0.2 + point.metadata.enzymeActivity * 0.1

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

/**
 * generateStereographicProjection – creates "little planet" or "tunnel" stereographic projections
 * Perfect for social media and artistic stereographic effects
 */
export function generateStereographicProjection(
  params: GenerationParams & {
    stereographicPerspective?: string
  },
): string {
  const size = 512
  const center = size / 2
  const radius = size / 2 - 10
  const colors = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma
  const rng = new SeededRandom(params.seed)
  const isTunnel = params.stereographicPerspective === "tunnel"

  // Generate base mathematical dataset
  const basePoints = generateDataset(params.dataset, params.seed, params.numSamples, params.noiseScale)
  const transformedPoints = applyScenarioTransform(basePoints, params.scenario, rng)

  let svgContent = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`

  // Add circular clipping mask
  svgContent += `
    <defs>
      <clipPath id="circleClip">
        <circle cx="${center}" cy="${center}" r="${radius}"/>
      </clipPath>
      <radialGradient id="stereoGradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:0.9"/>
        <stop offset="70%" style="stop-color:${colors[1]};stop-opacity:0.6"/>
        <stop offset="100%" style="stop-color:${colors[2] || colors[0]};stop-opacity:1"/>
      </radialGradient>
    </defs>
  `

  // Background circle
  svgContent += `<circle cx="${center}" cy="${center}" r="${radius}" fill="url(#stereoGradient)" />`

  // Group all content within the circular clip
  svgContent += `<g clip-path="url(#circleClip)">`

  // Transform and render mathematical points with stereographic projection
  for (let i = 0; i < transformedPoints.length; i++) {
    const point = transformedPoints[i]

    // Convert Cartesian coordinates to polar
    const originalR = Math.sqrt(point.x * point.x + point.y * point.y)
    const originalTheta = Math.atan2(point.y, point.x)

    // Apply stereographic projection
    let projectedR: number
    if (isTunnel) {
      // Tunnel effect: invert the projection (center becomes edge, edge becomes center)
      projectedR = originalR > 0 ? (radius * 0.8) / (1 + originalR * 2) : 0
    } else {
      // Little planet effect: normal stereographic projection
      const normalizedR = Math.min(originalR * 2, 3) // Limit to prevent extreme values
      projectedR = (normalizedR * radius * 0.4) / (1 + normalizedR * normalizedR * 0.5)
    }

    // Convert back to Cartesian coordinates
    const projectedX = center + projectedR * Math.cos(originalTheta)
    const projectedY = center + projectedR * Math.sin(originalTheta)

    // Ensure point is within the circle
    const distFromCenter = Math.sqrt((projectedX - center) ** 2 + (projectedY - center) ** 2)
    if (distFromCenter <= radius * 0.95) {
      // Use color palette for coloring
      const colorIndex = Math.floor((i / transformedPoints.length) * colors.length) % colors.length
      const pointColor = colors[colorIndex]

      // Calculate point size based on distance from center and metadata
      let pointRadius = 1.5
      let opacity = 0.7

      // Apply scenario-specific styling
      switch (params.scenario) {
        case "pure":
          pointRadius = 1 + point.metadata.magnitude * 2
          opacity = 0.6 + (point.metadata.magnitude / 3) * 0.4
          if (point.metadata.isPrime) {
            pointRadius *= 1.3
          }
          break
        case "cosmic":
          pointRadius = 0.8 + (point.metadata.isStar ? 3 : 1)
          opacity = point.metadata.isStar ? 0.9 : 0.5
          break
        case "forest":
          pointRadius = 1 + (point.metadata.isTree ? 2 : 0.5)
          opacity = point.metadata.isTree ? 0.8 : 0.4
          break
        case "ocean":
          pointRadius = 1 + point.metadata.depth * 0.5
          opacity = 0.4 + point.metadata.depth * 0.4
          break
        case "neural":
          pointRadius = 1 + Math.abs(point.metadata.firingRate || 0) * 0.02
          opacity = 0.5 + Math.abs(point.metadata.synapticStrength || 0) * 0.4
          break
        default:
          pointRadius = 1 + point.metadata.intensity * 1.5
          opacity = 0.5 + Math.abs(point.metadata.pattern || 0) * 0.3
      }

      // Adjust size based on distance from center for depth effect
      const depthFactor = isTunnel
        ? (1 - distFromCenter / radius) * 0.5 + 0.5
        : // Tunnel: smaller at edges
          (distFromCenter / radius) * 0.5 + 0.5 // Planet: smaller at center

      pointRadius *= depthFactor

      svgContent += `<circle cx="${projectedX.toFixed(2)}" cy="${projectedY.toFixed(2)}" r="${pointRadius.toFixed(2)}" fill="${pointColor}" opacity="${opacity.toFixed(2)}"/>`
    }
  }

  // Add connecting lines for some scenarios
  if (params.scenario === "neural" || params.scenario === "pure") {
    const connectionCount = Math.min(50, Math.floor(transformedPoints.length / 10))
    for (let i = 0; i < connectionCount; i++) {
      const point1 = transformedPoints[i]
      const point2 =
        transformedPoints[(i + Math.floor(transformedPoints.length / connectionCount)) % transformedPoints.length]

      // Apply stereographic projection to both points
      const r1 = Math.sqrt(point1.x * point1.x + point1.y * point1.y)
      const theta1 = Math.atan2(point1.y, point1.x)
      const r2 = Math.sqrt(point2.x * point2.x + point2.y * point2.y)
      const theta2 = Math.atan2(point2.y, point2.x)

      let projR1, projR2
      if (isTunnel) {
        projR1 = r1 > 0 ? (radius * 0.8) / (1 + r1 * 2) : 0
        projR2 = r2 > 0 ? (radius * 0.8) / (1 + r2 * 2) : 0
      } else {
        const normR1 = Math.min(r1 * 2, 3)
        const normR2 = Math.min(r2 * 2, 3)
        projR1 = (normR1 * radius * 0.4) / (1 + normR1 * normR1 * 0.5)
        projR2 = (normR2 * radius * 0.4) / (1 + normR2 * normR2 * 0.5)
      }

      const x1 = center + projR1 * Math.cos(theta1)
      const y1 = center + projR1 * Math.sin(theta1)
      const x2 = center + projR2 * Math.cos(theta2)
      const y2 = center + projR2 * Math.sin(theta2)

      // Check if both points are within the circle
      const dist1 = Math.sqrt((x1 - center) ** 2 + (y1 - center) ** 2)
      const dist2 = Math.sqrt((x2 - center) ** 2 + (y2 - center) ** 2)

      if (dist1 <= radius * 0.95 && dist2 <= radius * 0.95) {
        const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
        if (distance < radius * 0.3) {
          // Only connect nearby points
          svgContent += `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${colors[1]}" stroke-width="0.5" opacity="0.3"/>`
        }
      }
    }
  }

  // Add radial grid lines for reference
  if (params.scenario === "pure") {
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * 2 * Math.PI
      const x1 = center + Math.cos(angle) * radius * 0.1
      const y1 = center + Math.sin(angle) * radius * 0.1
      const x2 = center + Math.cos(angle) * radius * 0.9
      const y2 = center + Math.sin(angle) * radius * 0.9

      svgContent += `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${colors[colors.length - 1]}" stroke-width="0.3" opacity="0.2"/>`
    }

    // Add concentric circles
    for (let i = 1; i <= 4; i++) {
      const circleRadius = (i / 4) * radius * 0.8
      svgContent += `<circle cx="${center}" cy="${center}" r="${circleRadius.toFixed(2)}" fill="none" stroke="${colors[colors.length - 1]}" stroke-width="0.3" opacity="0.2"/>`
    }
  }

  svgContent += `</g>` // Close clipping group

  // Add border ring
  svgContent += `<circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="${colors[colors.length - 1]}" stroke-width="3" opacity="0.8" />`

  // Add projection type label
  const perspectiveLabel = isTunnel ? "TUNNEL VISION" : "LITTLE PLANET"
  svgContent += `<text x="${size - 10}" y="${size - 10}" text-anchor="end" font-family="monospace" font-size="8" fill="${colors[colors.length - 1]}" opacity="0.7">${perspectiveLabel}</text>`

  // Add mathematical dataset label
  svgContent += `<text x="10" y="${size - 10}" text-anchor="start" font-family="monospace" font-size="8" fill="${colors[colors.length - 1]}" opacity="0.7">${params.dataset.toUpperCase()} + ${params.scenario.toUpperCase()}</text>`

  svgContent += "</svg>"
  return svgContent
}

function addStereographicGroundElements(
  groundElements: string[],
  scenario: string,
  size: number,
  center: number,
  radius: number,
  colors: readonly string[],
  rng: SeededRandom,
  isTunnel: boolean,
) {
  switch (scenario) {
    case "urban":
    case "architectural":
      if (isTunnel) {
        // Add road-like lines converging to center
        for (let i = 0; i < 10; i++) {
          const angle = (i / 10) * 2 * Math.PI
          const x1 = center + Math.cos(angle) * radius
          const y1 = center + Math.sin(angle) * radius
          const x2 = center + Math.cos(angle) * radius * 0.1
          const y2 = center + Math.sin(angle) * radius * 0.1

          groundElements.push(
            `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${colors[1]}" stroke-width="4" opacity="0.4"/>`,
          )
        }
      } else {
        // Add grid-like road patterns
        const gridSpacing = 30
        for (let x = center - radius; x <= center + radius; x += gridSpacing) {
          groundElements.push(
            `<line x1="${x.toFixed(2)}" y1="${(center - radius).toFixed(2)}" x2="${x.toFixed(2)}" y2="${(center + radius).toFixed(2)}" stroke="${colors[1]}" stroke-width="2" opacity="0.3"/>`,
          )
        }
        for (let y = center - radius; y <= center + radius; y += gridSpacing) {
          groundElements.push(
            `<line x1="${(center - radius).toFixed(2)}" y1="${y.toFixed(2)}" x2="${(center + radius).toFixed(2)}" y2="${y.toFixed(2)}" stroke="${colors[1]}" stroke-width="2" opacity="0.3"/>`,
          )
        }
      }
      break

    case "forest":
    case "botanical":
      if (isTunnel) {
        // Add concentric circles for tunnel effect
        for (let i = 1; i <= 8; i++) {
          const circleRadius = (i / 8) * radius
          groundElements.push(
            `<circle cx="${center}" cy="${center}" r="${circleRadius.toFixed(2)}" fill="none" stroke="${colors[1]}" stroke-width="3" opacity="0.3" stroke-dasharray="5,5"/>`,
          )
        }
      } else {
        // Add grass-like strokes
        for (let i = 0; i < 50; i++) {
          const angle = rng.next() * 2 * Math.PI
          const dist = rng.next() * radius
          const x1 = center + Math.cos(angle) * dist
          const y1 = center + Math.sin(angle) * dist
          const x2 = x1 + (rng.next() - 0.5) * 10
          const y2 = y1 + (rng.next() - 0.5) * 10

          groundElements.push(
            `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${colors[2]}" stroke-width="1.5" opacity="0.4"/>`,
          )
        }
      }
      break

    case "geological":
      if (isTunnel) {
        // Add jagged lines converging to center
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * 2 * Math.PI
          let path = `M ${center} ${center}`
          for (let j = 0; j < 5; j++) {
            const dist = (j / 4) * radius
            const x = center + Math.cos(angle) * dist + (rng.next() - 0.5) * 20
            const y = center + Math.sin(angle) * dist + (rng.next() - 0.5) * 20
            path += ` L ${x.toFixed(2)} ${y.toFixed(2)}`
          }
          groundElements.push(`<path d="${path}" fill="none" stroke="${colors[1]}" stroke-width="2" opacity="0.6"/>`)
        }
      } else {
        // Add rock-like circles
        for (let i = 0; i < 20; i++) {
          const x = center - radius + rng.next() * radius * 2
          const y = center - radius + rng.next() * radius * 2
          const rockSize = 3 + rng.next() * 8

          if ((x - center) ** 2 + (y - center) ** 2 <= radius ** 2) {
            groundElements.push(
              `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${rockSize.toFixed(2)}" fill="${colors[1]}" opacity="0.7"/>`,
            )
          }
        }
      }
      break

    default:
      // Default landscape elements
      if (isTunnel) {
        for (let i = 1; i <= 5; i++) {
          const circleRadius = (i / 5) * radius * 0.8
          groundElements.push(
            `<circle cx="${center}" cy="${center}" r="${circleRadius.toFixed(2)}" fill="none" stroke="${colors[1]}" stroke-width="2" opacity="0.4"/>`,
          )
        }
      }
      break
  }
}
