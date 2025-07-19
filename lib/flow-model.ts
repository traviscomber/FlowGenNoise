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
        const erosionRateLocal = Math.cos(windDirection) * windStrength * 0.05

        // Oasis effect
        const oasisDistance = Math.sqrt((baseX - 0.8) ** 2 + (baseY + 0.5) ** 2)
        const oasisEffect = Math.exp(-oasisDistance * 3) * 0.2

        x = baseX + sandShift - erosionRateLocal
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
        const hexAngleLocal = Math.atan2(baseY, baseX)
        const hexSymmetryLocal = Math.sin(hexAngleLocal * 6) * 0.03

        // Sublimation effects
        const sublimation = Math.sin(baseX * 2 + baseY * 2) * 0.02

        x = baseX + frostPattern + hexSymmetryLocal
        y = baseY + crystalGrowth + sublimation

        metadata = {
          isCrystal: rng.next() < 0.1,
          crystallineStructure: crystalGrowth * 8,
          frostLevel: Math.abs(frostPattern) * 10,
          temperature: -20 + 10 * Math.sin(baseX * 0.2) - Math.abs(baseY) * 5,
          iceThickness: Math.max(0, 1 - Math.sqrt(baseX ** 2 + baseY ** 2)) * 10,
          phaseTransition: Math.abs(sublimation) > 0.01,
        }
        break

      case "sunset":
        // Add atmospheric light scattering with Rayleigh and Mie effects
        const altitude_Local = baseY + 1
        const atmosphericDensity = Math.exp(-altitude_Local * 2)

        // Rayleigh scattering (blue light)
        const rayleighScatter = atmosphericDensity * Math.pow(0.4, -4) * 0.1

        // Mie scattering (red/orange light)
        const mieScatter = atmosphericDensity * 0.05

        // Cloud formations
        const cloudDensity = Math.max(0, Math.sin(baseX * 2) * Math.cos(baseY * 1.5) + 0.3) * 0.2

        x = baseX + rayleighScatter * Math.sin(altitude_Local * 5)
        y = baseY + mieScatter + cloudDensity

        metadata = {
          lightIntensity: Math.max(0, 1 - altitude_Local * 0.5),
          colorTemperature: 2000 + 3000 * Math.exp(-altitude_Local),
          atmosphericPressure: 1013 * atmosphericDensity,
          humidity: 60 + 30 * Math.sin(baseX + baseY),
          cloudCover: cloudDensity * 100,
          sunAngle: (Math.atan2(altitude_Local, baseX) * 180) / Math.PI,
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
      case "quantum":
        // Quantum realm with wave-particle duality
        const waveFunction =
          Math.sin(baseX * 10) * Math.cos(baseY * 10) * Math.exp(-(baseX * baseX + baseY * baseY) * 2)
        const particlePosition = rng.gaussian() * 0.1
        const waveParticleDuality = rng.next() < 0.5 ? waveFunction : particlePosition

        // Quantum superposition
        const superposition = (Math.sin(baseX * 5) + Math.cos(baseY * 5)) / Math.sqrt(2)

        // Quantum entanglement correlation
        const entanglementDistance = Math.sqrt((baseX - 0.5) ** 2 + (baseY + 0.3) ** 2)
        const entanglement = Math.exp(-entanglementDistance * 3) * Math.sin(baseX * baseY * 20)

        x = baseX + waveParticleDuality + superposition * 0.1
        y = baseY + entanglement * 0.2

        metadata = {
          waveFunction: waveFunction,
          isParticle: Math.abs(particlePosition) > 0.05,
          superpositionState: superposition,
          entanglementStrength: Math.abs(entanglement),
          quantumNumber: Math.floor(Math.abs(baseX * baseY * 100)) % 4,
          uncertainty: Math.abs(waveParticleDuality) * 10,
        }
        break

      case "microscopic":
        // Molecular dynamics and Brownian motion
        const temperatureLocal = 300 + 50 * Math.sin(baseX * 0.5)
        const kineticEnergy = temperatureLocal * 1.38e-23 // Boltzmann constant simulation

        // Brownian motion
        const brownianX = rng.gaussian() * Math.sqrt(kineticEnergy) * 0.1
        const brownianY = rng.gaussian() * Math.sqrt(kineticEnergy) * 0.1

        // Van der Waals forces
        const molecularDistance = Math.sqrt(baseX ** 2 + baseY ** 2) + 0.1
        const vanDerWaals = (1 / Math.pow(molecularDistance, 12) - 1 / Math.pow(molecularDistance, 6)) * 0.01

        // Hydrogen bonding
        const hydrogenBond = Math.exp(-molecularDistance * 5) * Math.cos(Math.atan2(baseY, baseX) * 3) * 0.05

        x = baseX + brownianX + vanDerWaals * Math.cos(Math.atan2(baseY, baseX))
        y = baseY + brownianY + vanDerWaals * Math.sin(Math.atan2(baseY, baseX)) + hydrogenBond

        metadata = {
          temperature: temperatureLocal,
          kineticEnergy: kineticEnergy * 1e23,
          isMolecule: rng.next() < 0.3,
          bondStrength: Math.abs(hydrogenBond) * 100,
          diffusionRate: Math.sqrt(brownianX ** 2 + brownianY ** 2) * 100,
          molecularWeight: 10 + rng.range(0, 200),
        }
        break

      case "crystalline":
        // Crystal lattice with symmetry groups
        const latticeConstant = 0.5
        const latticeX = Math.round(baseX / latticeConstant) * latticeConstant
        const latticeY = Math.round(baseY / latticeConstant) * latticeConstant

        // Crystal defects and dislocations
        const defectProbability = 0.05
        const hasDefect = rng.next() < defectProbability
        const defectX = hasDefect ? rng.gaussian() * 0.1 : 0
        const defectY = hasDefect ? rng.gaussian() * 0.1 : 0

        // Piezoelectric effect
        const electricFieldLocal = Math.sin(baseX * 3) * Math.cos(baseY * 3)
        const piezoStrain = electricFieldLocal * 0.02

        // Crystal symmetry (hexagonal)
        const hexAngle = Math.atan2(baseY, baseX)
        const hexSymmetry = Math.sin(hexAngle * 6) * 0.03

        x = latticeX + defectX + piezoStrain + hexSymmetry
        y = latticeY + defectY + piezoStrain * Math.sin(hexAngle)

        metadata = {
          latticeType: "hexagonal",
          hasDefect: hasDefect,
          symmetryGroup: "P6/mmm",
          electricField: electricFieldLocal,
          crystalSize: Math.abs(baseX + baseY) * 10,
          hardness: 7 + rng.range(0, 3), // Mohs scale
        }
        break

      case "plasma":
        // Plasma physics with magnetohydrodynamics
        const magneticField = Math.sin(baseX * 2) * Math.cos(baseY * 2)
        // renamed to avoid duplicate identifier
        const electricFieldPlasma = Math.cos(baseX * 3) * Math.sin(baseY * 3)

        // Lorentz force on charged particles
        const charge = rng.next() < 0.5 ? 1 : -1
        const lorentzX = charge * (electricFieldPlasma + magneticField * baseY) * 0.1
        const lorentzY = charge * (electricFieldPlasma - magneticField * baseX) * 0.1

        // Plasma instabilities
        const instability = Math.sin(baseX * 8 + baseY * 6) * Math.exp(-Math.abs(baseX) * 2) * 0.15

        // Fusion reactions
        const fusionProbability = Math.exp(-Math.abs(baseX - baseY) * 5) * 0.1
        const fusionEnergy = fusionProbability * Math.sin(baseX * baseY * 50) * 0.2

        x = baseX + lorentzX + instability
        y = baseY + lorentzY + fusionEnergy

        metadata = {
          temperature: 10000 + Math.abs(fusionEnergy) * 100000,
          magneticField: magneticField,
          electricField: electricFieldPlasma,
          isIonized: true,
          charge: charge,
          fusionRate: fusionProbability * 1000,
          plasmaDensity: 1e15 + Math.abs(instability) * 1e16,
        }
        break

      case "atmospheric":
        // Advanced atmospheric physics
        const altitude = (baseY + 2) * 5000 // 0-20km altitude
        const pressure = 101325 * Math.exp(-altitude / 8400) // Barometric formula
        const temperature_Local = 288.15 - 0.0065 * altitude // Standard atmosphere

        // Rayleigh scattering
        const wavelength = 500e-9 // Green light
        const rayleighCoeff = (8 * Math.PI ** 3 * (1.33 ** 2 - 1) ** 2) / (3 * wavelength ** 4)
        const scattering = ((rayleighCoeff * pressure) / 101325) * 0.0001

        // Atmospheric turbulence
        const turbulenceLocal = Math.sin(baseX * 10) * Math.cos(baseY * 8) * Math.exp(-altitude / 5000) * 0.1

        // Coriolis effect
        const latitude = baseX * 90 // -90 to 90 degrees
        const coriolisParameter = 2 * 7.27e-5 * Math.sin((latitude * Math.PI) / 180)
        const coriolis = coriolisParameter * baseY * 0.001

        x = baseX + scattering * Math.cos(baseY * 5) + turbulenceLocal + coriolis
        y = baseY + scattering * Math.sin(baseX * 5) + turbulenceLocal * Math.sin(baseX * 3)

        metadata = {
          altitude: altitude,
          pressure: pressure,
          temperature: temperature_Local,
          humidity: 50 + 30 * Math.sin(baseX + baseY),
          windSpeed: Math.abs(turbulenceLocal) * 100,
          visibility: Math.max(0.1, 50 - scattering * 1000),
        }
        break

      case "geological":
        // Geological processes over deep time
        const geologicalTime = Math.abs(baseX + baseY) * 1e9 // Billions of years

        // Tectonic plate movement
        const plateVelocity = 2e-9 // 2 cm/year in units per year
        const tectonicShift = plateVelocity * geologicalTime * Math.sin(baseX * 0.1) * 0.1

        // Mountain building (orogeny)
        const orogenicForce = Math.exp(-Math.abs(baseX) * 2) * Math.sin(baseY * 3) * 0.3

        // Erosion and weathering
        const erosionRate_Local = 1e-6 * (1 + Math.abs(Math.sin(baseX * 2))) // m/year
        const erosionLocal = -erosionRate_Local * geologicalTime * 0.0001

        // Sediment deposition
        const sedimentThickness = Math.max(0, Math.sin(baseY * 2) + 0.5) * 0.2

        x = baseX + tectonicShift + orogenicForce * Math.cos(baseY)
        y = baseY + orogenicForce + erosionLocal + sedimentThickness

        metadata = {
          age: geologicalTime / 1e6, // Million years
          rockType: Math.floor(rng.next() * 3), // 0: igneous, 1: sedimentary, 2: metamorphic
          hardness: 2 + rng.range(0, 8), // Mohs scale
          mineralContent: Math.floor(rng.next() * 10),
          fossilAge: Math.max(0, geologicalTime - rng.range(0, 5e8)) / 1e6,
          tectonicActivity: Math.abs(tectonicShift) * 1000,
        }
        break

      case "biological":
        // Biological systems with DNA and protein structures
        const dnaLength = Math.abs(baseX * baseY) * 1000 + 100

        // DNA double helix
        const helixRadius = 0.1
        const helixPitch = 0.34 // nm per base pair
        const helixAngle = (baseX + baseY) * 10
        const helixX = helixRadius * Math.cos(helixAngle)
        const helixY = helixRadius * Math.sin(helixAngle)

        // Protein folding (simplified)
        const aminoAcids = Math.floor(dnaLength / 3) // Codon translation
        const foldingEnergy = -Math.log(Math.abs(Math.sin(baseX * 5) * Math.cos(baseY * 5)) + 0.1) * 0.1

        // Enzyme kinetics (Michaelis-Menten)
        const substrateConc = Math.abs(baseX) + 0.1
        const km = 0.5 // Michaelis constant
        const vmax = 1.0 // Maximum velocity
        const enzymeActivity = ((vmax * substrateConc) / (km + substrateConc)) * 0.1

        // Cell division
        const cellCycle = Math.sin(baseY * 2) * 0.05

        x = baseX + helixX + foldingEnergy * Math.cos(helixAngle) + enzymeActivity
        y = baseY + helixY + foldingEnergy * Math.sin(helixAngle) + cellCycle

        metadata = {
          dnaLength: dnaLength,
          proteinLength: aminoAcids,
          foldingStability: -foldingEnergy * 10,
          enzymeActivity: enzymeActivity * 100,
          cellPhase: Math.floor((Math.sin(baseY * 2) + 1) * 2), // 0-3 for G1,S,G2,M
          mutationRate: rng.next() * 1e-6,
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
          opacity = 0.3 + point.metadata.plasmaDensity * 1e-17

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
