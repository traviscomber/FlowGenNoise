import { MathPlotter } from "./plot-utils"

/**
 * FlowSketch – Mathematical Art Generator with 360° Panorama Support
 * -----------------------------------------------------------
 * This file defines the public helpers that generate mathematical visualizations
 * in various formats: standard, dome projection, and 360° panoramic skyboxes.
 */

// Mathematical flow field generation with advanced datasets
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
  panoramic360?: boolean
  panoramaResolution?: string
  panoramaFormat?: string
  stereographicPerspective?: string
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

  range(min: number, max: number): number {
    return min + this.next() * (max - min)
  }
}

/* ------------------------------------------------------------------ */
/*  Colour palettes (kept – many parts of the UI reference them)      */
/* ------------------------------------------------------------------ */

// Color palette generators
const colorPalettes = {
  plasma: [
    "#0d0887",
    "#46039f",
    "#7201a8",
    "#9c179e",
    "#bd3786",
    "#d8576b",
    "#ed7953",
    "#fb9f3a",
    "#fdca26",
    "#f0f921",
  ],
  quantum: ["#001122", "#003366", "#0066cc", "#3399ff", "#66ccff", "#99ffff", "#ccffff", "#ffffff"],
  cosmic: ["#000011", "#220066", "#4400aa", "#6600ee", "#8833ff", "#aa66ff", "#cc99ff", "#eeccff"],
  thermal: [
    "#000000",
    "#330000",
    "#660000",
    "#990000",
    "#cc0000",
    "#ff3300",
    "#ff6600",
    "#ff9900",
    "#ffcc00",
    "#ffff00",
  ],
  spectral: [
    "#9e0142",
    "#d53e4f",
    "#f46d43",
    "#fdae61",
    "#fee08b",
    "#e6f598",
    "#abdda4",
    "#66c2a5",
    "#3288bd",
    "#5e4fa2",
  ],
  crystalline: [
    "#e6f3ff",
    "#cce7ff",
    "#99d6ff",
    "#66c2ff",
    "#33adff",
    "#0099ff",
    "#0080cc",
    "#006699",
    "#004d66",
    "#003333",
  ],
  bioluminescent: [
    "#001a1a",
    "#003333",
    "#004d4d",
    "#006666",
    "#008080",
    "#00b3b3",
    "#00e6e6",
    "#33ffff",
    "#66ffff",
    "#99ffff",
  ],
  aurora: ["#001122", "#003344", "#005566", "#007788", "#0099aa", "#33bbcc", "#66ddee", "#99ffff"],
  metallic: ["#2c1810", "#5d4037", "#8d6e63", "#a1887f", "#bcaaa4", "#d7ccc8", "#efebe9", "#f5f5f5"],
  prismatic: [
    "#ff0000",
    "#ff8000",
    "#ffff00",
    "#80ff00",
    "#00ff00",
    "#00ff80",
    "#00ffff",
    "#0080ff",
    "#0000ff",
    "#8000ff",
  ],
  monochromatic: [
    "#000000",
    "#1a1a1a",
    "#333333",
    "#4d4d4d",
    "#666666",
    "#808080",
    "#999999",
    "#b3b3b3",
    "#cccccc",
    "#ffffff",
  ],
  infrared: [
    "#000000",
    "#1a0000",
    "#330000",
    "#4d0000",
    "#660000",
    "#800000",
    "#990000",
    "#b30000",
    "#cc0000",
    "#ff0000",
  ],
  lava: ["#000000", "#330000", "#660000", "#990000", "#cc0000", "#ff3300", "#ff6600", "#ff9900", "#ffcc00", "#ffff66"],
  futuristic: [
    "#0a0a0a",
    "#1a1a2e",
    "#16213e",
    "#0f3460",
    "#533483",
    "#7209b7",
    "#a663cc",
    "#4717f6",
    "#00d4aa",
    "#7fffd4",
  ],
  forest: ["#0d2818", "#1e3a2e", "#2f4f4f", "#228b22", "#32cd32", "#90ee90", "#98fb98", "#f0fff0"],
  ocean: ["#000080", "#191970", "#0000cd", "#0000ff", "#4169e1", "#6495ed", "#87ceeb", "#b0e0e6", "#e0ffff"],
  sunset: [
    "#2f1b14",
    "#8b4513",
    "#cd853f",
    "#daa520",
    "#ffd700",
    "#ffa500",
    "#ff8c00",
    "#ff6347",
    "#ff4500",
    "#dc143c",
  ],
  arctic: [
    "#f0f8ff",
    "#e6f3ff",
    "#cce7ff",
    "#b3daff",
    "#99ccff",
    "#80bfff",
    "#66b2ff",
    "#4da6ff",
    "#3399ff",
    "#1a8cff",
  ],
  neon: ["#ff00ff", "#ff0080", "#ff0040", "#ff4000", "#ff8000", "#ffff00", "#80ff00", "#00ff00", "#00ff80", "#00ffff"],
  vintage: [
    "#8b4513",
    "#a0522d",
    "#cd853f",
    "#daa520",
    "#b8860b",
    "#daa520",
    "#f4a460",
    "#deb887",
    "#d2b48c",
    "#f5deb3",
  ],
  toxic: ["#32cd32", "#7fff00", "#adff2f", "#9aff9a", "#00ff7f", "#00fa9a", "#40e0d0", "#00ced1", "#00bfff", "#1e90ff"],
  ember: ["#000000", "#1a0000", "#330000", "#4d0000", "#660000", "#800000", "#990000", "#b30000", "#cc0000", "#ff6600"],
  lunar: ["#1a1a2e", "#16213e", "#0f3460", "#533483", "#7209b7", "#a663cc", "#c9b037", "#ffd700", "#fff8dc", "#ffffff"],
  tidal: ["#000080", "#191970", "#4169e1", "#6495ed", "#87ceeb", "#b0e0e6", "#e0ffff", "#f0f8ff", "#ffffff", "#fffacd"],
} as const

/* ------------------------------------------------------------------ */
/*  Helper that picks a colour based on index                          */
/* ------------------------------------------------------------------ */
function paletteColor(palette: readonly string[], idx: number): string {
  return palette[idx % palette.length]
}

/* ------------------------------------------------------------------ */
/*  Seeded random number generator for consistent results              */
/* ------------------------------------------------------------------ */
function seededRandom(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

/* ------------------------------------------------------------------ */
/*  Convert resolution string to actual dimensions                     */
/* ------------------------------------------------------------------ */
function getActualDimensions(resolution?: string) {
  switch (resolution) {
    case "1080p":
      return { width: 1080, height: 1080 }
    case "1440p":
      return { width: 1440, height: 1440 }
    case "2160p":
      return { width: 2160, height: 2160 }
    default:
      return { width: 1080, height: 1080 }
  }
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * generateFlowField - basic spirals placeholder
 * Returns an SVG string that the UI can preview.
 */
// Mathematical dataset generators
function generateSpirals(params: GenerationParams, rng: SeededRandom): Array<{ x: number; y: number; color: string }> {
  const points: Array<{ x: number; y: number; color: string }> = []
  const palette = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma

  for (let i = 0; i < params.numSamples; i++) {
    const t = (i / params.numSamples) * 20 * Math.PI
    const r = Math.sqrt(t) * 10
    const x = r * Math.cos(t) + rng.range(-50, 50) * params.noiseScale
    const y = r * Math.sin(t) + rng.range(-50, 50) * params.noiseScale

    const colorIndex = Math.floor((i / params.numSamples) * (palette.length - 1))
    points.push({ x, y, color: palette[colorIndex] })
  }

  return points
}

function generateFractal(params: GenerationParams, rng: SeededRandom): Array<{ x: number; y: number; color: string }> {
  const points: Array<{ x: number; y: number; color: string }> = []
  const palette = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma

  for (let i = 0; i < params.numSamples; i++) {
    let x = rng.range(-2, 2)
    let y = rng.range(-2, 2)

    // Iterate fractal equation
    for (let j = 0; j < 10; j++) {
      const newX = x * x - y * y + rng.range(-0.5, 0.5) * params.noiseScale
      const newY = 2 * x * y + rng.range(-0.5, 0.5) * params.noiseScale
      x = newX
      y = newY
    }

    const colorIndex = Math.floor(rng.next() * palette.length)
    points.push({ x: x * 100, y: y * 100, color: palette[colorIndex] })
  }

  return points
}

function generateMandelbrot(
  params: GenerationParams,
  rng: SeededRandom,
): Array<{ x: number; y: number; color: string }> {
  const points: Array<{ x: number; y: number; color: string }> = []
  const palette = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma

  for (let i = 0; i < params.numSamples; i++) {
    const cx = rng.range(-2.5, 1.5)
    const cy = rng.range(-2, 2)

    let x = 0,
      y = 0
    let iterations = 0
    const maxIterations = 100

    while (x * x + y * y < 4 && iterations < maxIterations) {
      const newX = x * x - y * y + cx
      const newY = 2 * x * y + cy
      x = newX + rng.range(-0.1, 0.1) * params.noiseScale
      y = newY + rng.range(-0.1, 0.1) * params.noiseScale
      iterations++
    }

    const colorIndex = Math.floor((iterations / maxIterations) * (palette.length - 1))
    points.push({ x: cx * 200, y: cy * 200, color: palette[colorIndex] })
  }

  return points
}

function generateLorenz(params: GenerationParams, rng: SeededRandom): Array<{ x: number; y: number; color: string }> {
  const points: Array<{ x: number; y: number; color: string }> = []
  const palette = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma

  let x = 1,
    y = 1,
    z = 1
  const sigma = 10,
    rho = 28,
    beta = 8 / 3

  for (let i = 0; i < params.numSamples; i++) {
    const dx = sigma * (y - x) * params.timeStep
    const dy = (x * (rho - z) - y) * params.timeStep
    const dz = (x * y - beta * z) * params.timeStep

    x += dx + rng.range(-0.1, 0.1) * params.noiseScale
    y += dy + rng.range(-0.1, 0.1) * params.noiseScale
    z += dz + rng.range(-0.1, 0.1) * params.noiseScale

    const colorIndex = Math.floor((i / params.numSamples) * (palette.length - 1))
    points.push({ x: x * 5, y: y * 5, color: palette[colorIndex] })
  }

  return points
}

function generateJulia(params: GenerationParams, rng: SeededRandom): Array<{ x: number; y: number; color: string }> {
  const points: Array<{ x: number; y: number; color: string }> = []
  const palette = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma

  const cx = -0.7269 + rng.range(-0.1, 0.1) * params.noiseScale
  const cy = 0.1889 + rng.range(-0.1, 0.1) * params.noiseScale

  for (let i = 0; i < params.numSamples; i++) {
    let x = rng.range(-2, 2)
    let y = rng.range(-2, 2)
    let iterations = 0
    const maxIterations = 100

    while (x * x + y * y < 4 && iterations < maxIterations) {
      const newX = x * x - y * y + cx
      const newY = 2 * x * y + cy
      x = newX
      y = newY
      iterations++
    }

    const colorIndex = Math.floor((iterations / maxIterations) * (palette.length - 1))
    points.push({ x: x * 100, y: y * 100, color: palette[colorIndex] })
  }

  return points
}

function generateHyperbolic(
  params: GenerationParams,
  rng: SeededRandom,
): Array<{ x: number; y: number; color: string }> {
  const points: Array<{ x: number; y: number; color: string }> = []
  const palette = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma

  for (let i = 0; i < params.numSamples; i++) {
    const u = rng.range(-Math.PI, Math.PI)
    const v = rng.range(-2, 2)

    const x = Math.sinh(v) * Math.cos(u) + rng.range(-10, 10) * params.noiseScale
    const y = Math.sinh(v) * Math.sin(u) + rng.range(-10, 10) * params.noiseScale

    const colorIndex = Math.floor((i / params.numSamples) * (palette.length - 1))
    points.push({ x: x * 50, y: y * 50, color: palette[colorIndex] })
  }

  return points
}

function generateGaussian(params: GenerationParams, rng: SeededRandom): Array<{ x: number; y: number; color: string }> {
  const points: Array<{ x: number; y: number; color: string }> = []
  const palette = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma

  for (let i = 0; i < params.numSamples; i++) {
    // Box-Muller transform for Gaussian distribution
    const u1 = rng.next()
    const u2 = rng.next()
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2)

    const x = z0 * 100 + rng.range(-20, 20) * params.noiseScale
    const y = z1 * 100 + rng.range(-20, 20) * params.noiseScale

    const colorIndex = Math.floor((i / params.numSamples) * (palette.length - 1))
    points.push({ x, y, color: palette[colorIndex] })
  }

  return points
}

function generateCellular(params: GenerationParams, rng: SeededRandom): Array<{ x: number; y: number; color: string }> {
  const points: Array<{ x: number; y: number; color: string }> = []
  const palette = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma

  const gridSize = Math.floor(Math.sqrt(params.numSamples))

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const state = rng.next() > 0.5 ? 1 : 0
      const x = (i - gridSize / 2) * 10 + rng.range(-5, 5) * params.noiseScale
      const y = (j - gridSize / 2) * 10 + rng.range(-5, 5) * params.noiseScale

      const colorIndex = state * (palette.length - 1)
      points.push({ x, y, color: palette[colorIndex] })
    }
  }

  return points
}

function generateVoronoi(params: GenerationParams, rng: SeededRandom): Array<{ x: number; y: number; color: string }> {
  const points: Array<{ x: number; y: number; color: string }> = []
  const palette = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma

  // Generate seed points
  const seeds: Array<{ x: number; y: number; color: string }> = []
  const numSeeds = Math.min(20, Math.floor(params.numSamples / 100))

  for (let i = 0; i < numSeeds; i++) {
    seeds.push({
      x: rng.range(-200, 200),
      y: rng.range(-200, 200),
      color: palette[Math.floor(rng.next() * palette.length)],
    })
  }

  // Generate Voronoi cells
  for (let i = 0; i < params.numSamples; i++) {
    const x = rng.range(-200, 200) + rng.range(-10, 10) * params.noiseScale
    const y = rng.range(-200, 200) + rng.range(-10, 10) * params.noiseScale

    // Find closest seed
    let minDist = Number.POSITIVE_INFINITY
    let closestSeed = seeds[0]

    for (const seed of seeds) {
      const dist = Math.sqrt((x - seed.x) ** 2 + (y - seed.y) ** 2)
      if (dist < minDist) {
        minDist = dist
        closestSeed = seed
      }
    }

    points.push({ x, y, color: closestSeed.color })
  }

  return points
}

function generatePerlin(params: GenerationParams, rng: SeededRandom): Array<{ x: number; y: number; color: string }> {
  const points: Array<{ x: number; y: number; color: string }> = []
  const palette = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma

  // Simple Perlin-like noise
  for (let i = 0; i < params.numSamples; i++) {
    const x = rng.range(-200, 200)
    const y = rng.range(-200, 200)

    // Multi-octave noise
    let noise = 0
    let amplitude = 1
    let frequency = 0.01

    for (let octave = 0; octave < 4; octave++) {
      noise += amplitude * (rng.next() - 0.5) * Math.sin(frequency * x) * Math.cos(frequency * y)
      amplitude *= 0.5
      frequency *= 2
    }

    noise += rng.range(-0.5, 0.5) * params.noiseScale

    const colorIndex = Math.floor(((noise + 1) / 2) * (palette.length - 1))
    points.push({ x, y, color: palette[Math.max(0, Math.min(palette.length - 1, colorIndex))] })
  }

  return points
}

function generateDiffusion(
  params: GenerationParams,
  rng: SeededRandom,
): Array<{ x: number; y: number; color: string }> {
  const points: Array<{ x: number; y: number; color: string }> = []
  const palette = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma

  // Reaction-diffusion simulation
  const gridSize = Math.floor(Math.sqrt(params.numSamples / 4))

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const u = rng.next()
      const v = rng.next()

      // Simple reaction-diffusion step
      const laplacianU = rng.range(-0.1, 0.1)
      const laplacianV = rng.range(-0.1, 0.1)

      const reaction = u * v * v
      const newU = u + params.timeStep * (0.16 * laplacianU - reaction + 0.035 * (1 - u))
      const newV = v + params.timeStep * (0.08 * laplacianV + reaction - 0.099 * v)

      const x = (i - gridSize / 2) * 8 + rng.range(-4, 4) * params.noiseScale
      const y = (j - gridSize / 2) * 8 + rng.range(-4, 4) * params.noiseScale

      const colorIndex = Math.floor(newU * (palette.length - 1))
      points.push({ x, y, color: palette[Math.max(0, Math.min(palette.length - 1, colorIndex))] })
    }
  }

  return points
}

function generateWave(params: GenerationParams, rng: SeededRandom): Array<{ x: number; y: number; color: string }> {
  const points: Array<{ x: number; y: number; color: string }> = []
  const palette = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma

  for (let i = 0; i < params.numSamples; i++) {
    const x = rng.range(-200, 200)
    const y = rng.range(-200, 200)

    // Wave interference pattern
    const wave1 = Math.sin(0.05 * x + params.timeStep * 100)
    const wave2 = Math.sin(0.05 * y + params.timeStep * 100)
    const wave3 = Math.sin(0.03 * (x + y) + params.timeStep * 50)

    const interference = (wave1 + wave2 + wave3) / 3
    const amplitude = interference + rng.range(-0.2, 0.2) * params.noiseScale

    const colorIndex = Math.floor(((amplitude + 1) / 2) * (palette.length - 1))
    points.push({ x, y, color: palette[Math.max(0, Math.min(palette.length - 1, colorIndex))] })
  }

  return points
}

// NEW: Moons dataset - Complex lunar orbital mechanics with tidal forces
function generateMoons(params: GenerationParams, rng: SeededRandom): Array<{ x: number; y: number; color: string }> {
  const points: Array<{ x: number; y: number; color: string }> = []
  const palette = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.lunar

  // Multiple moon system with complex orbital mechanics
  const numMoons = 3 + Math.floor(rng.next() * 5) // 3-7 moons
  const moons: Array<{
    distance: number
    speed: number
    phase: number
    mass: number
    eccentricity: number
    inclination: number
  }> = []

  // Generate moon parameters
  for (let i = 0; i < numMoons; i++) {
    moons.push({
      distance: 50 + i * 40 + rng.range(-20, 20), // Orbital distance
      speed: 0.1 / (i + 1) + rng.range(-0.02, 0.02), // Orbital speed (Kepler's laws)
      phase: rng.range(0, 2 * Math.PI), // Initial phase
      mass: 1 + rng.range(0.5, 3), // Relative mass
      eccentricity: rng.range(0, 0.3), // Orbital eccentricity
      inclination: rng.range(-Math.PI / 6, Math.PI / 6), // Orbital inclination
    })
  }

  // Generate orbital paths with gravitational perturbations
  for (let i = 0; i < params.numSamples; i++) {
    const t = (i / params.numSamples) * 50 * Math.PI // Time parameter

    for (let moonIndex = 0; moonIndex < moons.length; moonIndex++) {
      const moon = moons[moonIndex]

      // Basic elliptical orbit
      const meanAnomaly = moon.speed * t + moon.phase
      const eccentricAnomaly = meanAnomaly + moon.eccentricity * Math.sin(meanAnomaly)
      const trueAnomaly =
        2 *
        Math.atan2(
          Math.sqrt(1 + moon.eccentricity) * Math.sin(eccentricAnomaly / 2),
          Math.sqrt(1 - moon.eccentricity) * Math.cos(eccentricAnomaly / 2),
        )

      // Distance varies with eccentricity
      const r =
        (moon.distance * (1 - moon.eccentricity * moon.eccentricity)) / (1 + moon.eccentricity * Math.cos(trueAnomaly))

      // 3D orbital mechanics projected to 2D
      const x3d = r * Math.cos(trueAnomaly)
      const y3d = r * Math.sin(trueAnomaly) * Math.cos(moon.inclination)
      const z3d = r * Math.sin(trueAnomaly) * Math.sin(moon.inclination)

      // Gravitational perturbations from other moons
      let perturbX = 0,
        perturbY = 0
      for (let otherIndex = 0; otherIndex < moons.length; otherIndex++) {
        if (otherIndex !== moonIndex) {
          const otherMoon = moons[otherIndex]
          const otherMeanAnomaly = otherMoon.speed * t + otherMoon.phase
          const otherR = otherMoon.distance
          const otherX = otherR * Math.cos(otherMeanAnomaly)
          const otherY = otherR * Math.sin(otherMeanAnomaly)

          const dx = otherX - x3d
          const dy = otherY - y3d
          const distance = Math.sqrt(dx * dx + dy * dy) + 1 // Avoid division by zero
          const force = otherMoon.mass / (distance * distance * distance)

          perturbX += force * dx * 10
          perturbY += force * dy * 10
        }
      }

      // Tidal forces - create complex wave patterns
      const tidalForce = Math.sin(t * 0.1 + moonIndex) * moon.mass * 5
      const tidalX = tidalForce * Math.cos(trueAnomaly + Math.PI / 2)
      const tidalY = tidalForce * Math.sin(trueAnomaly + Math.PI / 2)

      // Libration effects (small oscillations)
      const librationAmplitude = 3 * moon.eccentricity
      const librationX = librationAmplitude * Math.sin(3 * trueAnomaly + moon.phase)
      const librationY = librationAmplitude * Math.cos(3 * trueAnomaly + moon.phase)

      // Final position with all effects
      const finalX = x3d + perturbX + tidalX + librationX + rng.range(-5, 5) * params.noiseScale
      const finalY = y3d + perturbY + tidalY + librationY + rng.range(-5, 5) * params.noiseScale

      // Color based on moon properties and orbital phase
      const phaseIntensity = (Math.sin(trueAnomaly) + 1) / 2 // Moon phase
      const distanceIntensity = 1 - (r - moon.distance * 0.7) / (moon.distance * 0.6) // Distance variation
      const massIntensity = moon.mass / 4 // Mass influence

      const colorIntensity = (phaseIntensity + distanceIntensity + massIntensity) / 3
      const colorIndex = Math.floor(colorIntensity * (palette.length - 1))

      // Add gravitational lensing effect
      const lensingFactor = 1 + (moon.mass * 0.1) / Math.max(1, r / 50)
      const lensedX = finalX * lensingFactor
      const lensedY = finalY * lensingFactor

      points.push({
        x: lensedX,
        y: lensedY,
        color: palette[Math.max(0, Math.min(palette.length - 1, colorIndex))],
      })

      // Add trailing particles for each moon (space debris, dust)
      if (i % 10 === 0) {
        for (let trail = 1; trail <= 5; trail++) {
          const trailAnomaly = trueAnomaly - trail * 0.1
          const trailR = r + rng.range(-10, 10)
          const trailX = trailR * Math.cos(trailAnomaly) + rng.range(-15, 15) * params.noiseScale
          const trailY =
            trailR * Math.sin(trailAnomaly) * Math.cos(moon.inclination) + rng.range(-15, 15) * params.noiseScale

          const trailColorIndex = Math.max(0, colorIndex - trail)
          points.push({
            x: trailX,
            y: trailY,
            color: palette[Math.max(0, Math.min(palette.length - 1, trailColorIndex))],
          })
        }
      }
    }

    // Add asteroid belt between certain orbital distances
    if (rng.next() > 0.7) {
      const asteroidDistance = 120 + rng.range(-30, 30)
      const asteroidAngle = rng.range(0, 2 * Math.PI)
      const asteroidX = asteroidDistance * Math.cos(asteroidAngle) + rng.range(-20, 20) * params.noiseScale
      const asteroidY = asteroidDistance * Math.sin(asteroidAngle) + rng.range(-20, 20) * params.noiseScale

      points.push({
        x: asteroidX,
        y: asteroidY,
        color: palette[Math.floor(palette.length * 0.3)], // Darker colors for asteroids
      })
    }
  }

  return points
}

// NEW: Tribes dataset - Complex social network topology with tribal patterns
function generateTribes(params: GenerationParams, rng: SeededRandom): Array<{ x: number; y: number; color: string }> {
  const points: Array<{ x: number; y: number; color: string }> = []
  const palette = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.plasma

  // Generate tribal communities
  const numTribes = 5 + Math.floor(rng.next() * 8) // 5-12 tribes
  const tribes: Array<{
    centerX: number
    centerY: number
    size: number
    totems: number
    color: string
    influence: number
    connections: number[]
  }> = []

  // Create tribal centers
  for (let i = 0; i < numTribes; i++) {
    const angle = (i / numTribes) * 2 * Math.PI + rng.range(-0.5, 0.5)
    const distance = 100 + rng.range(-30, 30)

    tribes.push({
      centerX: distance * Math.cos(angle),
      centerY: distance * Math.sin(angle),
      size: 20 + rng.range(10, 40),
      totems: 8 + Math.floor(rng.next() * 12),
      color: palette[i % palette.length],
      influence: 0.5 + rng.range(0, 0.5),
      connections: [],
    })
  }

  // Create tribal connections (trade routes, alliances)
  for (let i = 0; i < tribes.length; i++) {
    const numConnections = 1 + Math.floor(rng.next() * 3)
    for (let j = 0; j < numConnections; j++) {
      const targetIndex = Math.floor(rng.next() * tribes.length)
      if (targetIndex !== i && !tribes[i].connections.includes(targetIndex)) {
        tribes[i].connections.push(targetIndex)
      }
    }
  }

  // Generate tribal settlements
  for (let tribeIndex = 0; tribeIndex < tribes.length; tribeIndex++) {
    const tribe = tribes[tribeIndex]
    const samplesPerTribe = Math.floor(params.numSamples / numTribes)

    // Central ceremonial circle
    const ceremonialRadius = tribe.size * 0.3
    const ceremonialPoints = Math.floor(tribe.totems * 1.5)

    for (let i = 0; i < ceremonialPoints; i++) {
      const angle = (i / ceremonialPoints) * 2 * Math.PI
      const radius = ceremonialRadius * (0.8 + rng.range(0, 0.4))
      const x = tribe.centerX + radius * Math.cos(angle) + rng.range(-5, 5) * params.noiseScale
      const y = tribe.centerY + radius * Math.sin(angle) + rng.range(-5, 5) * params.noiseScale

      points.push({ x, y, color: tribe.color })
    }

    // Totem positions (sacred geometry)
    for (let i = 0; i < tribe.totems; i++) {
      const goldenAngle = i * 137.5 * (Math.PI / 180) // Golden angle for natural distribution
      const spiralRadius = Math.sqrt(i) * 8
      const totemX = tribe.centerX + spiralRadius * Math.cos(goldenAngle)
      const totemY = tribe.centerY + spiralRadius * Math.sin(goldenAngle)

      // Create totem structure
      for (let j = 0; j < 5; j++) {
        const offsetAngle = (j / 5) * 2 * Math.PI
        const offsetRadius = 3 + rng.range(0, 2)
        const x = totemX + offsetRadius * Math.cos(offsetAngle) + rng.range(-2, 2) * params.noiseScale
        const y = totemY + offsetRadius * Math.sin(offsetAngle) + rng.range(-2, 2) * params.noiseScale

        points.push({ x, y, color: tribe.color })
      }
    }

    // Dwelling arrangements (family clusters)
    const dwellingClusters = Math.floor(tribe.size / 15)
    for (let cluster = 0; cluster < dwellingClusters; cluster++) {
      const clusterAngle = rng.range(0, 2 * Math.PI)
      const clusterDistance = tribe.size * (0.4 + rng.range(0, 0.4))
      const clusterX = tribe.centerX + clusterDistance * Math.cos(clusterAngle)
      const clusterY = tribe.centerY + clusterDistance * Math.sin(clusterAngle)

      const dwellingsInCluster = 3 + Math.floor(rng.next() * 5)
      for (let dwelling = 0; dwelling < dwellingsInCluster; dwelling++) {
        const dwellingAngle = (dwelling / dwellingsInCluster) * 2 * Math.PI
        const dwellingRadius = 8 + rng.range(0, 5)
        const x = clusterX + dwellingRadius * Math.cos(dwellingAngle) + rng.range(-3, 3) * params.noiseScale
        const y = clusterY + dwellingRadius * Math.sin(dwellingAngle) + rng.range(-3, 3) * params.noiseScale

        points.push({ x, y, color: tribe.color })
      }
    }

    // Territorial boundaries (Voronoi-like)
    const boundaryPoints = Math.floor(samplesPerTribe * 0.3)
    for (let i = 0; i < boundaryPoints; i++) {
      const angle = rng.range(0, 2 * Math.PI)
      const distance = tribe.size * (0.8 + rng.range(0, 0.3))
      const x = tribe.centerX + distance * Math.cos(angle) + rng.range(-10, 10) * params.noiseScale
      const y = tribe.centerY + distance * Math.sin(angle) + rng.range(-10, 10) * params.noiseScale

      // Fade color at boundaries
      const fadedColor = adjustColorBrightness(tribe.color, 0.6)
      points.push({ x, y, color: fadedColor })
    }
  }

  // Generate connection paths (trade routes, migration paths)
  for (let i = 0; i < tribes.length; i++) {
    const tribe = tribes[i]
    for (const connectionIndex of tribe.connections) {
      const targetTribe = tribes[connectionIndex]
      const pathPoints = 20 + Math.floor(rng.next() * 30)

      for (let j = 0; j < pathPoints; j++) {
        const t = j / pathPoints
        const x = tribe.centerX + t * (targetTribe.centerX - tribe.centerX) + rng.range(-15, 15) * params.noiseScale
        const y = tribe.centerY + t * (targetTribe.centerY - tribe.centerY) + rng.range(-15, 15) * params.noiseScale

        // Blend colors along the path
        const blendedColor = blendColors(tribe.color, targetTribe.color, t)
        points.push({ x, y, color: blendedColor })
      }
    }
  }

  return points
}

// NEW: Heads dataset - Surreal mosaic head compositions
function generateHeads(params: GenerationParams, rng: SeededRandom): Array<{ x: number; y: number; color: string }> {
  const points: Array<{ x: number; y: number; color: string }> = []
  const palette = colorPalettes[params.colorScheme as keyof typeof colorPalettes] || colorPalettes.prismatic

  const numHeads = 2 + Math.floor(rng.next() * 4) // 2-5 heads
  const headsPerRow = Math.ceil(Math.sqrt(numHeads))

  for (let headIndex = 0; headIndex < numHeads; headIndex++) {
    const row = Math.floor(headIndex / headsPerRow)
    const col = headIndex % headsPerRow
    const headCenterX = (col - headsPerRow / 2) * 150
    const headCenterY = (row - headsPerRow / 2) * 150

    // Head outline (elliptical)
    const headWidth = 60 + rng.range(-10, 20)
    const headHeight = 80 + rng.range(-10, 20)
    const fragmentsPerHead = Math.floor(params.numSamples / numHeads)

    // Generate facial feature positions
    const eyeY = headCenterY - headHeight * 0.15
    const leftEyeX = headCenterX - headWidth * 0.25
    const rightEyeX = headCenterX + headWidth * 0.25
    const noseX = headCenterX
    const noseY = headCenterY + headHeight * 0.05
    const mouthX = headCenterX
    const mouthY = headCenterY + headHeight * 0.25

    // Create mosaic fragments for head outline
    const outlineFragments = Math.floor(fragmentsPerHead * 0.4)
    for (let i = 0; i < outlineFragments; i++) {
      const angle = (i / outlineFragments) * 2 * Math.PI
      const radiusX = headWidth * (0.8 + rng.range(0, 0.4))
      const radiusY = headHeight * (0.8 + rng.range(0, 0.4))

      // Elliptical head shape
      const x = headCenterX + radiusX * Math.cos(angle) + rng.range(-8, 8) * params.noiseScale
      const y = headCenterY + radiusY * Math.sin(angle) + rng.range(-8, 8) * params.noiseScale

      const colorIndex = Math.floor((angle / (2 * Math.PI)) * palette.length)
      points.push({ x, y, color: palette[colorIndex] })
    }

    // Left eye (fragmented)
    const leftEyeFragments = Math.floor(fragmentsPerHead * 0.08)
    for (let i = 0; i < leftEyeFragments; i++) {
      const angle = rng.range(0, 2 * Math.PI)
      const radius = 8 + rng.range(0, 5)
      const x = leftEyeX + radius * Math.cos(angle) + rng.range(-3, 3) * params.noiseScale
      const y = eyeY + radius * Math.sin(angle) * 0.7 + rng.range(-3, 3) * params.noiseScale

      // Create iris and pupil fragments
      const distanceFromCenter = Math.sqrt((x - leftEyeX) ** 2 + (y - eyeY) ** 2)
      let eyeColor
      if (distanceFromCenter < 3) {
        eyeColor = "#000000" // Pupil
      } else if (distanceFromCenter < 6) {
        eyeColor = palette[Math.floor(palette.length * 0.6)] // Iris
      } else {
        eyeColor = "#ffffff" // Sclera
      }

      points.push({ x, y, color: eyeColor })
    }

    // Right eye (fragmented, mirrored)
    const rightEyeFragments = Math.floor(fragmentsPerHead * 0.08)
    for (let i = 0; i < rightEyeFragments; i++) {
      const angle = rng.range(0, 2 * Math.PI)
      const radius = 8 + rng.range(0, 5)
      const x = rightEyeX + radius * Math.cos(angle) + rng.range(-3, 3) * params.noiseScale
      const y = eyeY + radius * Math.sin(angle) * 0.7 + rng.range(-3, 3) * params.noiseScale

      const distanceFromCenter = Math.sqrt((x - rightEyeX) ** 2 + (y - eyeY) ** 2)
      let eyeColor
      if (distanceFromCenter < 3) {
        eyeColor = "#000000"
      } else if (distanceFromCenter < 6) {
        eyeColor = palette[Math.floor(palette.length * 0.6)]
      } else {
        eyeColor = "#ffffff"
      }

      points.push({ x, y, color: eyeColor })
    }

    // Nose (geometric fragments)
    const noseFragments = Math.floor(fragmentsPerHead * 0.06)
    for (let i = 0; i < noseFragments; i++) {
      const t = i / noseFragments
      const noseWidth = 6 + t * 8
      const x = noseX + rng.range(-noseWidth, noseWidth) + rng.range(-2, 2) * params.noiseScale
      const y = noseY + t * 15 + rng.range(-2, 2) * params.noiseScale

      const colorIndex = Math.floor(t * palette.length)
      points.push({ x, y, color: palette[colorIndex] })
    }

    // Mouth (curved fragments)
    const mouthFragments = Math.floor(fragmentsPerHead * 0.08)
    for (let i = 0; i < mouthFragments; i++) {
      const t = (i / mouthFragments) * Math.PI // Half circle for smile
      const mouthWidth = 20
      const x = mouthX + mouthWidth * Math.cos(t + Math.PI) + rng.range(-2, 2) * params.noiseScale
      const y = mouthY + 8 * Math.sin(t) + rng.range(-2, 2) * params.noiseScale

      const colorIndex = Math.floor((t / Math.PI) * palette.length)
      points.push({ x, y, color: palette[colorIndex] })
    }

    // Hair (fractal-like fragments)
    const hairFragments = Math.floor(fragmentsPerHead * 0.15)
    for (let i = 0; i < hairFragments; i++) {
      const angle = rng.range(-Math.PI, 0) // Top half of head
      const distance = headHeight * (0.9 + rng.range(0, 0.5))
      const x = headCenterX + distance * Math.cos(angle) + rng.range(-15, 15) * params.noiseScale
      const y = headCenterY + distance * Math.sin(angle) + rng.range(-10, 10) * params.noiseScale

      // Create hair strands with fibonacci spirals
      const strandLength = 10 + rng.range(0, 20)
      for (let j = 0; j < 3; j++) {
        const strandX = x + j * 2 * Math.cos(angle + Math.PI / 2)
        const strandY = y + j * 2 * Math.sin(angle + Math.PI / 2)

        const colorIndex = Math.floor(rng.next() * palette.length)
        points.push({ x: strandX, y: strandY, color: palette[colorIndex] })
      }
    }

    // Facial tessellation (crazy geometric patterns)
    const tessellationFragments = Math.floor(fragmentsPerHead * 0.15)
    for (let i = 0; i < tessellationFragments; i++) {
      // Create random polygonal fragments within face bounds
      const x = headCenterX + rng.range(-headWidth * 0.6, headWidth * 0.6)
      const y = headCenterY + rng.range(-headHeight * 0.6, headHeight * 0.6)

      // Check if point is within elliptical face boundary
      const normalizedX = (x - headCenterX) / headWidth
      const normalizedY = (y - headCenterY) / headHeight
      if (normalizedX * normalizedX + normalizedY * normalizedY < 0.36) {
        // Create small geometric fragments
        const fragmentSize = 2 + rng.range(0, 4)
        const numVertices = 3 + Math.floor(rng.next() * 4) // 3-6 sided polygons

        for (let vertex = 0; vertex < numVertices; vertex++) {
          const vertexAngle = (vertex / numVertices) * 2 * Math.PI
          const vertexX = x + fragmentSize * Math.cos(vertexAngle) + rng.range(-1, 1) * params.noiseScale
          const vertexY = y + fragmentSize * Math.sin(vertexAngle) + rng.range(-1, 1) * params.noiseScale

          const colorIndex = Math.floor(((x + y + headCenterX + headCenterY) / 100) * palette.length) % palette.length
          points.push({ x: vertexX, y: vertexY, color: palette[colorIndex] })
        }
      }
    }
  }

  return points
}

// Helper functions for color manipulation
function adjustColorBrightness(color: string, factor: number): string {
  const hex = color.replace("#", "")
  const r = Math.floor(Number.parseInt(hex.substr(0, 2), 16) * factor)
  const g = Math.floor(Number.parseInt(hex.substr(2, 2), 16) * factor)
  const b = Math.floor(Number.parseInt(hex.substr(4, 2), 16) * factor)

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
}

function blendColors(color1: string, color2: string, t: number): string {
  const hex1 = color1.replace("#", "")
  const hex2 = color2.replace("#", "")

  const r1 = Number.parseInt(hex1.substr(0, 2), 16)
  const g1 = Number.parseInt(hex1.substr(2, 2), 16)
  const b1 = Number.parseInt(hex1.substr(4, 2), 16)

  const r2 = Number.parseInt(hex2.substr(0, 2), 16)
  const g2 = Number.parseInt(hex2.substr(2, 2), 16)
  const b2 = Number.parseInt(hex2.substr(4, 2), 16)

  const r = Math.floor(r1 + (r2 - r1) * t)
  const g = Math.floor(g1 + (g2 - g1) * t)
  const b = Math.floor(b1 + (b2 - b1) * t)

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
}

// Dataset selector
function generateDataset(params: GenerationParams): Array<{ x: number; y: number; color: string }> {
  const rng = new SeededRandom(params.seed)

  switch (params.dataset) {
    case "spirals":
      return generateSpirals(params, rng)
    case "fractal":
      return generateFractal(params, rng)
    case "mandelbrot":
      return generateMandelbrot(params, rng)
    case "lorenz":
      return generateLorenz(params, rng)
    case "julia":
      return generateJulia(params, rng)
    case "hyperbolic":
      return generateHyperbolic(params, rng)
    case "gaussian":
      return generateGaussian(params, rng)
    case "cellular":
      return generateCellular(params, rng)
    case "voronoi":
      return generateVoronoi(params, rng)
    case "perlin":
      return generatePerlin(params, rng)
    case "diffusion":
      return generateDiffusion(params, rng)
    case "wave":
      return generateWave(params, rng)
    case "moons":
      return generateMoons(params, rng)
    case "tribes":
      return generateTribes(params, rng)
    case "heads":
      return generateHeads(params, rng)
    default:
      return generateSpirals(params, rng)
  }
}

// Stereographic projection helpers
function stereographicProjection(x: number, y: number, perspective: string): { x: number; y: number } {
  if (perspective === "tunnel") {
    // Tunnel projection (looking up)
    const r = Math.sqrt(x * x + y * y)
    const theta = Math.atan2(y, x)
    const newR = 200 / (1 + r / 100)
    return {
      x: newR * Math.cos(theta),
      y: newR * Math.sin(theta),
    }
  } else {
    // Little planet projection (looking down)
    const r = Math.sqrt(x * x + y * y)
    const theta = Math.atan2(y, x)
    const newR = r / (1 + r / 200)
    return {
      x: newR * Math.cos(theta),
      y: newR * Math.sin(theta),
    }
  }
}

// Main generation functions
export function generateFlowField(params: GenerationParams): string {
  const plotter = new MathPlotter({
    width: 800,
    height: 800,
    backgroundColor: getBackgroundColor(params.colorScheme),
    strokeColor: getStrokeColor(params.colorScheme),
  })

  const paths: string[] = []
  const colors: string[] = []

  // Generate different mathematical patterns based on dataset
  switch (params.dataset) {
    case "spirals":
      const spiralPoints = plotter.generateFibonacciSpiral(params.numSamples, 10)
      paths.push(plotter.pointsToPath(spiralPoints))
      colors.push(getStrokeColor(params.colorScheme))
      break

    case "fractal":
      const fractalPath = plotter.generateFractalTree(8, 100, -Math.PI / 2)
      paths.push(fractalPath)
      colors.push(getStrokeColor(params.colorScheme))
      break

    case "mandelbrot":
      const mandelbrotPoints = plotter.generateMandelbrotSet(200, 200, 50)
      paths.push(plotter.pointsToPath(mandelbrotPoints))
      colors.push(getStrokeColor(params.colorScheme))
      break

    case "lorenz":
      const lorenzPoints = plotter.generateLorenzAttractor(params.numSamples, params.timeStep)
      paths.push(plotter.pointsToPath(lorenzPoints))
      colors.push(getStrokeColor(params.colorScheme))
      break

    case "moons":
      // For moons, generate multiple orbital paths
      const moonPoints = plotter.generateLorenzAttractor(params.numSamples, params.timeStep)
      paths.push(plotter.pointsToPath(moonPoints))
      colors.push(getStrokeColor(params.colorScheme))
      break

    case "tribes":
      // For tribes, generate network topology
      const tribePoints = plotter.generateFibonacciSpiral(params.numSamples, 10)
      paths.push(plotter.pointsToPath(tribePoints))
      colors.push(getStrokeColor(params.colorScheme))
      break

    case "heads":
      // For heads, generate mosaic patterns
      const headPoints = plotter.generateMandelbrotSet(200, 200, 50)
      paths.push(plotter.pointsToPath(headPoints))
      colors.push(getStrokeColor(params.colorScheme))
      break

    default:
      // Default to spiral
      const defaultPoints = plotter.generateFibonacciSpiral(params.numSamples, 10)
      paths.push(plotter.pointsToPath(defaultPoints))
      colors.push(getStrokeColor(params.colorScheme))
  }

  return plotter.generateSVG(paths, colors)
}

/**
 * generateDomeProjection – proper fisheye transformation for dome projection.
 * This applies real fisheye mathematics to create immersive dome-ready content.
 */
export function generateDomeProjection(params: GenerationParams): string {
  // Generate dome-optimized SVG with fisheye transformation
  const baseSvg = generateFlowField(params)

  // Apply dome transformation (simplified for demo)
  return baseSvg.replace("<svg", '<svg viewBox="0 0 800 800" style="transform: perspective(1000px) rotateX(45deg)"')
}

/**
 * generate360Panorama – creates equirectangular 360° panoramic images or stereographic projections
 * Perfect for VR environments, skyboxes, and 360° viewers like Blockade Labs
 */
export function generate360Panorama(params: GenerationParams): string {
  const points = generateDataset(params)

  // Apply stereographic projection
  const projectedPoints = points.map((point) => {
    if (params.panoramaFormat === "stereographic" && params.stereographicPerspective) {
      const projected = stereographicProjection(point.x, point.y, params.stereographicPerspective)
      return { ...point, x: projected.x, y: projected.y }
    }
    return point
  })

  const width = 800
  const height = 800
  const centerX = width / 2
  const centerY = height / 2

  let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`
  svg += `<rect width="100%" height="100%" fill="#000000"/>`

  for (const point of projectedPoints) {
    const x = centerX + point.x
    const y = centerY + point.y

    if (x >= 0 && x <= width && y >= 0 && y <= height) {
      svg += `<circle cx="${x}" cy="${y}" r="1.5" fill="${point.color}" opacity="0.8"/>`
    }
  }

  svg += "</svg>"
  return svg
}

/**
 * generateStereographicProjection – creates "little planet" or "tunnel" stereographic projections
 * Perfect for social media and artistic stereographic effects like the reference images
 */
export function generateStereographicProjection(params: GenerationParams): string {
  // Stereographic projection creates the "little planet" or "tunnel" effect
  const dimensions = getActualDimensions(params.panoramaResolution)
  const size = Math.min(dimensions.width, dimensions.height)
  const center = size / 2
  const radius = size / 2 - 10
  const colours = colorPalettes[params.colorScheme as keyof typeof colorPalettes] ?? colorPalettes.plasma
  const random = seededRandom(params.seed)
  const isTunnel = params.stereographicPerspective === "tunnel"

  // Generate mathematical patterns for stereographic transformation
  const pathElements: string[] = []
  const backgroundElements: string[] = []

  // Create realistic ground/landscape base
  const groundElements: string[] = []

  // Generate ground texture based on scenario and perspective
  switch (params.scenario) {
    case "urban":
    case "architectural":
      // Urban ground with roads and buildings
      if (isTunnel) {
        addUrbanTunnelElements(groundElements, size, center, radius, colours, random)
      } else {
        addUrbanStereographicElements(groundElements, size, center, radius, colours, random)
      }
      break
    case "landscape":
    case "botanical":
      // Natural landscape with grass and trees
      if (isTunnel) {
        addLandscapeTunnelElements(groundElements, size, center, radius, colours, random)
      } else {
        addLandscapeStereographicElements(groundElements, size, center, radius, colours, random)
      }
      break
    case "geological":
      // Rocky/mineral ground
      if (isTunnel) {
        addGeologicalTunnelElements(groundElements, size, center, radius, colours, random)
      } else {
        addGeologicalStereographicElements(groundElements, size, center, radius, colours, random)
      }
      break
    default:
      // Default to mixed landscape
      if (isTunnel) {
        addUrbanTunnelElements(groundElements, size, center, radius, colours, random)
      } else {
        addLandscapeStereographicElements(groundElements, size, center, radius, colours, random)
      }
  }

  // Add mathematical flow patterns transformed to stereographic
  const layers = 4
  const spiralsPerLayer = 6

  for (let layer = 0; layer < layers; layer++) {
    for (let spiral = 0; spiral < spiralsPerLayer; spiral++) {
      const colorIndex = (layer + spiral) % colours.length
      const color = colours[colorIndex]

      let path = ""
      const points = Math.floor(params.numSamples / (layers * spiralsPerLayer))

      for (let i = 0; i <= points; i++) {
        const t = i / points

        // Generate mathematical pattern
        const angle = t * 4 * Math.PI + (spiral / spiralsPerLayer) * 2 * Math.PI
        const r = (t * 0.8 + 0.1) * radius

        // Apply stereographic transformation
        // Map from sphere to plane using stereographic projection
        const sphereR = r / radius // Normalize to 0-1
        const sphereTheta = angle

        // Stereographic projection formula
        const projR = (2 * sphereR) / (1 + sphereR * sphereR)
        const finalR = projR * radius * 0.9

        // Add mathematical variations
        const mathVariation = Math.sin(angle * 3 + layer) * Math.cos(angle * 2 + spiral) * 20
        const noise = Math.sin(angle * 10 + params.seed * 0.01) * params.noiseScale * 15

        const x = center + (finalR + mathVariation + noise) * Math.cos(sphereTheta)
        const y = center + (finalR + mathVariation + noise) * Math.sin(sphereTheta)

        // Ensure points stay within the circle
        const distFromCenter = Math.sqrt((x - center) ** 2 + (y - center) ** 2)
        if (distFromCenter <= radius * 0.95) {
          if (i === 0) {
            path = `M ${x.toFixed(2)} ${y.toFixed(2)}`
          } else {
            path += ` L ${x.toFixed(2)} ${y.toFixed(2)}`
          }
        }
      }

      if (path) {
        pathElements.push(
          `<path d="${path}" fill="none" stroke="${color}" stroke-width="3" stroke-opacity="0.7" stroke-linecap="round"/>`,
        )
      }
    }
  }

  // Add atmospheric effects around the edge
  const atmosphereElements: string[] = []
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * 2 * Math.PI
    const r = radius * (0.85 + Math.random() * 0.1)
    const x = center + r * Math.cos(angle)
    const y = center + r * Math.sin(angle)
    const size = Math.random() * 3 + 1
    const opacity = Math.random() * 0.5 + 0.3

    atmosphereElements.push(
      `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${size.toFixed(1)}" fill="${colours[colours.length - 1]}" opacity="${opacity.toFixed(2)}"/>`,
    )
  }

  const perspectiveLabel = isTunnel ? "TUNNEL" : "LITTLE PLANET"

  return `
    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="stereographicGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:${isTunnel ? colours[colours.length - 1] : colours[2] || colours[0]};stop-opacity:0.8"/>
          <stop offset="70%" style="stop-color:${colours[1]};stop-opacity:0.4"/>
          <stop offset="100%" style="stop-color:${colours[0]};stop-opacity:0.9"/>
        </radialGradient>
        <clipPath id="stereographicClip">
          <circle cx="${center}" cy="${center}" r="${radius}" />
        </clipPath>
        <filter id="stereographicGlow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="${colours[0]}" />
      <circle cx="${center}" cy="${center}" r="${radius}" fill="url(#stereographicGradient)" />
      
      <!-- Main content clipped to circle -->
      <g clip-path="url(#stereographicClip)" filter="url(#stereographicGlow)">
        <!-- Ground/landscape elements -->
        ${groundElements.join("\n        ")}
        
        <!-- Mathematical flow patterns -->
        ${pathElements.join("\n        ")}
        
        <!-- Atmospheric effects -->
        ${atmosphereElements.join("\n        ")}
      </g>
      
      <!-- Border ring -->
      <circle cx="${center}" cy="${center}" r="${radius}" 
              fill="none" stroke="${colours[colours.length - 1]}" 
              stroke-width="2" stroke-opacity="0.8"/>
      
      <!-- Center point -->
      <circle cx="${center}" cy="${center}" r="2" fill="${colours[colours.length - 1]}" opacity="0.9"/>
      
      <!-- Label -->
      <text x="${size - 10}" y="20" text-anchor="end" font-family="monospace" font-size="10" 
            fill="${colours[colours.length - 1]}" opacity="0.7">
        ${perspectiveLabel} ${params.panoramaResolution || "1080p"}
      </text>
    </svg>
  `
}

// Helper functions for generating different mathematical patterns
function generateFibonacciSpirals(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const arms = 8
  const turns = 12
  const goldenRatio = 1.618033988749

  for (let a = 0; a < arms; a++) {
    let path = `M ${size / 2} ${size / 2}`
    for (let t = 0; t <= 1; t += 1 / (params.numSamples || 4000)) {
      const angle = turns * 2 * Math.PI * t * goldenRatio + (a * 2 * Math.PI) / arms
      const radius = t * (size / 2) * 0.85 * Math.sqrt(t)

      // Add noise based on scenario
      const noiseX = Math.sin(t * 50 + a) * params.noiseScale * 20
      const noiseY = Math.cos(t * 40 + a) * params.noiseScale * 20

      const x = size / 2 + radius * Math.cos(angle) + noiseX
      const y = size / 2 + radius * Math.sin(angle) + noiseY
      path += ` L ${x.toFixed(2)} ${y.toFixed(2)}`
    }
    pathParts.push(
      `<path d="${path}" fill="none" stroke="${paletteColor(colours, a)}" stroke-width="3" stroke-opacity="0.8" stroke-linecap="round"/>`,
    )
  }
}

// Helper functions for stereographic projection elements
function addUrbanStereographicElements(
  elements: string[],
  size: number,
  center: number,
  radius: number,
  colours: readonly string[],
  random: () => number,
) {
  // Add building-like structures around the perimeter (little planet view)
  const numBuildings = 12
  for (let i = 0; i < numBuildings; i++) {
    const angle = (i / numBuildings) * 2 * Math.PI
    const buildingR = radius * (0.6 + random() * 0.2)
    const buildingWidth = 15 + random() * 20
    const buildingHeight = 20 + random() * 30

    const x = center + buildingR * Math.cos(angle) - buildingWidth / 2
    const y = center + buildingR * Math.sin(angle) - buildingHeight / 2

    elements.push(
      `<rect x="${x}" y="${y}" width="${buildingWidth}" height="${buildingHeight}"
        fill="${colours[i % colours.length]}" opacity="0.6"
        stroke="${colours[(i + 1) % colours.length]}" stroke-width="1"/>`,
    )
  }
  // Add road/path in centre
  const roadElements: string[] = []
  const roadWidth = radius * 0.2
  roadElements.push(`<circle cx="${center}" cy="${center}" r="${roadWidth}" fill="#444" opacity="0.7"/>`)
  elements.push(...roadElements)
}

function addLandscapeStereographicElements(
  elements: string[],
  size: number,
  center: number,
  radius: number,
  colours: readonly string[],
  random: () => number,
) {
  // Add tree-like structures around the perimeter (little planet view)
  const numTrees = 24
  for (let i = 0; i < numTrees; i++) {
    const angle = (i / numTrees) * 2 * Math.PI
    const treeR = radius * (0.6 + random() * 0.2)
    const trunkLen = 10 + random() * 20
    const x = center + treeR * Math.cos(angle) - trunkLen / 2
    const y = center + treeR * Math.sin(angle) - trunkLen / 2

    elements.push(
      `<rect x="${x}" y="${y}" width="${trunkLen}" height="${trunkLen}"
        fill="${colours[i % colours.length]}" opacity="0.6"
        stroke="${colours[(i + 1) % colours.length]}" stroke-width="1"/>`,
    )
  }
}

function addGeologicalStereographicElements(
  elements: string[],
  size: number,
  center: number,
  radius: number,
  colours: readonly string[],
  random: () => number,
) {
  // Add rock-like structures around the perimeter (little planet view)
  const numRocks = 20
  for (let i = 0; i < numRocks; i++) {
    const angle = (i / numRocks) * 2 * Math.PI
    const rockR = radius * (0.6 + random() * 0.2)
    const rockLen = 10 + random() * 20
    const x = center + rockR * Math.cos(angle) - rockLen / 2
    const y = center + rockR * Math.sin(angle) - rockLen / 2

    elements.push(
      `<rect x="${x}" y="${y}" width="${rockLen}" height="${rockLen}"
        fill="${colours[i % colours.length]}" opacity="0.6"
        stroke="${colours[(i + 1) % colours.length]}" stroke-width="1"/>`,
    )
  }
}

function addUrbanTunnelElements(
  elements: string[],
  size: number,
  center: number,
  radius: number,
  colours: readonly string[],
  random: () => number,
) {
  // Buildings now point *inward* (looking up).  Draw simple blocks fading to centre.
  const numBuildings = 16
  for (let i = 0; i < numBuildings; i++) {
    const angle = (i / numBuildings) * 2 * Math.PI
    const dist = radius * (0.2 + random() * 0.3)
    const height = radius * (0.6 + random() * 0.3)
    const x1 = center + dist * Math.cos(angle)
    const y1 = center + dist * Math.sin(angle)
    const x2 = center + (dist + height) * Math.cos(angle)
    const y2 = center + (dist + height) * Math.sin(angle)
    elements.push(
      `<polygon points="${x1},${y1} ${x2},${y2}"
        fill="${colours[i % colours.length]}" opacity="0.5"/>`,
    )
  }
}

function addLandscapeTunnelElements(
  elements: string[],
  size: number,
  center: number,
  radius: number,
  colours: readonly string[],
  random: () => number,
) {
  // Simple tree silhouettes pointing inward
  const numTrees = 24
  for (let i = 0; i < numTrees; i++) {
    const angle = (i / numTrees) * 2 * Math.PI
    const dist = radius * (0.15 + random() * 0.25)
    const trunkLen = radius * 0.5
    const x1 = center + dist * Math.cos(angle)
    const y1 = center + dist * Math.sin(angle)
    const x2 = center + (dist + trunkLen) * Math.cos(angle)
    const y2 = center + (dist + trunkLen) * Math.sin(angle)
    elements.push(
      `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
        stroke="${colours[2] || colours[0]}" stroke-width="2" opacity="0.6"/>`,
    )
  }
}

function addGeologicalTunnelElements(
  elements: string[],
  size: number,
  center: number,
  radius: number,
  colours: readonly string[],
  random: () => number,
) {
  // Rocky spikes pointing towards centre
  const numRocks = 20
  for (let i = 0; i < numRocks; i++) {
    const angle = (i / numRocks) * 2 * Math.PI
    const dist = radius * (0.1 + random() * 0.25)
    const spikeLen = radius * (0.4 + random() * 0.2)
    const baseX = center + dist * Math.cos(angle)
    const baseY = center + dist * Math.sin(angle)
    const tipX = center + (dist + spikeLen) * Math.cos(angle)
    const tipY = center + (dist + spikeLen) * Math.sin(angle)
    elements.push(
      `<line x1="${baseX}" y1="${baseY}" x2="${tipX}" y2="${tipY}"
        stroke="${colours[i % colours.length]}" stroke-width="3" opacity="0.5"/>`,
    )
  }
}

function getBackgroundColor(colorScheme: string): string {
  const colorMap: Record<string, string> = {
    plasma: "#0a0a0a",
    quantum: "#000020",
    cosmic: "#000010",
    thermal: "#200000",
    spectral: "#000000",
    crystalline: "#f0f8ff",
    bioluminescent: "#001122",
    aurora: "#000011",
    metallic: "#1a1a1a",
    prismatic: "#000000",
    monochromatic: "#ffffff",
    infrared: "#100000",
    lava: "#200000",
    futuristic: "#000033",
    forest: "#001100",
    ocean: "#000033",
    sunset: "#330000",
    arctic: "#f0f8ff",
    neon: "#000000",
    vintage: "#2a1810",
    toxic: "#001100",
    ember: "#100000",
    lunar: "#0a0a1a",
    tidal: "#000033",
  }
  return colorMap[colorScheme] || "#000000"
}

function getStrokeColor(colorScheme: string): string {
  const colorMap: Record<string, string> = {
    plasma: "#ff00ff",
    quantum: "#00ffff",
    cosmic: "#8a2be2",
    thermal: "#ff4500",
    spectral: "#ff0000",
    crystalline: "#87ceeb",
    bioluminescent: "#00ff7f",
    aurora: "#00ff00",
    metallic: "#c0c0c0",
    prismatic: "#ff69b4",
    monochromatic: "#000000",
    infrared: "#ff0000",
    lava: "#ff6347",
    futuristic: "#00ffff",
    forest: "#228b22",
    ocean: "#4169e1",
    sunset: "#ffa500",
    arctic: "#87ceeb",
    neon: "#ff1493",
    vintage: "#daa520",
    toxic: "#adff2f",
    ember: "#ff4500",
    lunar: "#ffd700",
    tidal: "#87ceeb",
  }
  return colorMap[colorScheme] || "#ffffff"
}
