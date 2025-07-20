/**
 * FlowSketch – Mathematical Art Generator with 360° Panorama Support
 * -----------------------------------------------------------
 * This file defines the public helpers that generate mathematical visualizations
 * in various formats: standard, dome projection, and 360° panoramic skyboxes.
 */

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
}

// Color schemes
const colorSchemes = {
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
  quantum: ["#000428", "#004e92", "#009ffd", "#00d2ff", "#ffffff", "#ff0080", "#8b00ff", "#4b0082", "#000428"],
  cosmic: [
    "#0f0f23",
    "#1a1a3a",
    "#2d1b69",
    "#4c2a85",
    "#6a4c93",
    "#8b5a8c",
    "#a8677c",
    "#c17767",
    "#d4874b",
    "#e09819",
  ],
  thermal: [
    "#000000",
    "#330000",
    "#660000",
    "#990000",
    "#cc0000",
    "#ff0000",
    "#ff3300",
    "#ff6600",
    "#ff9900",
    "#ffcc00",
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
  crystalline: ["#e8f4f8", "#b8e6f0", "#88d8e8", "#58cae0", "#28bcd8", "#1e90d0", "#1464c8", "#0a38c0", "#000cb8"],
  bioluminescent: ["#001122", "#003344", "#005566", "#007788", "#0099aa", "#00bbcc", "#00ddee", "#00ffff", "#66ffff"],
  aurora: ["#001100", "#003300", "#005500", "#007700", "#009900", "#00bb00", "#00dd00", "#00ff00", "#66ff66"],
  metallic: ["#2c2c2c", "#404040", "#545454", "#686868", "#7c7c7c", "#909090", "#a4a4a4", "#b8b8b8", "#cccccc"],
  prismatic: ["#ff0000", "#ff8000", "#ffff00", "#80ff00", "#00ff00", "#00ff80", "#00ffff", "#0080ff", "#0000ff"],
  monochromatic: ["#000000", "#1a1a1a", "#333333", "#4d4d4d", "#666666", "#808080", "#999999", "#b3b3b3", "#cccccc"],
  infrared: ["#000000", "#330000", "#660000", "#990000", "#cc0000", "#ff0000", "#ff3333", "#ff6666", "#ff9999"],
  lava: ["#000000", "#4d0000", "#990000", "#cc3300", "#ff6600", "#ff9900", "#ffcc00", "#ffff00", "#ffffff"],
  futuristic: ["#0a0a0a", "#1a1a2e", "#16213e", "#0f3460", "#533483", "#7209b7", "#a663cc", "#4cc9f0", "#7209b7"],
  forest: ["#0d2818", "#1e3a2e", "#2f4f3f", "#4a6741", "#6b8e23", "#8fbc8f", "#adff2f", "#9acd32", "#228b22"],
  ocean: ["#000080", "#191970", "#0000cd", "#0000ff", "#1e90ff", "#00bfff", "#87ceeb", "#87cefa", "#b0e0e6"],
  sunset: ["#2d1b69", "#8b1538", "#da4167", "#f78764", "#ffc49b", "#f4e4c1", "#f9844a", "#ee6c4d", "#3d5a80"],
  arctic: ["#e6f3ff", "#cce7ff", "#b3dbff", "#99cfff", "#80c3ff", "#66b7ff", "#4dabff", "#339fff", "#1a93ff"],
  neon: ["#ff006e", "#fb5607", "#ffbe0b", "#8338ec", "#3a86ff", "#06ffa5", "#ff006e", "#c77dff", "#560bad"],
  vintage: ["#8b4513", "#a0522d", "#cd853f", "#daa520", "#b8860b", "#d2691e", "#bc8f8f", "#f4a460", "#deb887"],
  toxic: ["#39ff14", "#32cd32", "#00ff00", "#adff2f", "#7fff00", "#9acd32", "#00ff7f", "#00fa9a", "#98fb98"],
  ember: ["#1a0000", "#4d0000", "#800000", "#b30000", "#e60000", "#ff1a1a", "#ff4d4d", "#ff8080", "#ffb3b3"],
}

/* ------------------------------------------------------------------ */
/*  Colour palettes (kept – many parts of the UI reference them)      */
/* ------------------------------------------------------------------ */

export const colorPalettes = {
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
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * generateFlowField - basic spirals placeholder
 * Returns an SVG string that the UI can preview.
 */
export function generateFlowField(params: GenerationParams): string {
  const size = 512
  const colours = colorPalettes[params.colorScheme as keyof typeof colorPalettes] ?? colorPalettes.plasma
  const random = seededRandom(params.seed)

  // Enhanced mathematical patterns based on dataset
  const pathParts: string[] = []
  const backgroundElements: string[] = []

  // Generate base mathematical structure based on dataset
  switch (params.dataset) {
    case "spirals":
      generateFibonacciSpirals(pathParts, size, colours, params, random)
      break
    case "fractal":
      generateFractalPatterns(pathParts, size, colours, params, random)
      break
    case "voronoi":
      generateVoronoiDiagram(pathParts, size, colours, params, random)
      break
    case "perlin":
      generatePerlinNoise(pathParts, size, colours, params, random)
      break
    case "mandelbrot":
      generateMandelbrotSet(pathParts, size, colours, params, random)
      break
    case "lorenz":
      generateLorenzAttractor(pathParts, size, colours, params, random)
      break
    case "julia":
      generateJuliaSet(pathParts, size, colours, params, random)
      break
    case "diffusion":
      generateReactionDiffusion(pathParts, size, colours, params, random)
      break
    case "wave":
      generateWaveInterference(pathParts, size, colours, params, random)
      break
    case "henon":
      generateHenonMap(pathParts, size, colours, params, random)
      break
    case "rossler":
      generateRosslerAttractor(pathParts, size, colours, params, random)
      break
    case "clifford":
      generateCliffordAttractor(pathParts, size, colours, params, random)
      break
    case "ikeda":
      generateIkedaMap(pathParts, size, colours, params, random)
      break
    case "tinkerbell":
      generateTinkerbellMap(pathParts, size, colours, params, random)
      break
    case "gingerbread":
      generateGingerbreadMap(pathParts, size, colours, params, random)
      break
    case "duffing":
      generateDuffingOscillator(pathParts, size, colours, params, random)
      break
    case "chua":
      generateChuaCircuit(pathParts, size, colours, params, random)
      break
    case "halvorsen":
      generateHalvorsenAttractor(pathParts, size, colours, params, random)
      break
    case "aizawa":
      generateAizawaAttractor(pathParts, size, colours, params, random)
      break
    case "thomas":
      generateThomasAttractor(pathParts, size, colours, params, random)
      break
    case "dadras":
      generateDadrasAttractor(pathParts, size, colours, params, random)
      break
    case "chen":
      generateChenAttractor(pathParts, size, colours, params, random)
      break
    case "rabinovich":
      generateRabinovichFabrikant(pathParts, size, colours, params, random)
      break
    case "sprott":
      generateSprottAttractor(pathParts, size, colours, params, random)
      break
    case "fourwing":
      generateFourWingAttractor(pathParts, size, colours, params, random)
      break
    case "newton":
      generateNewtonFractal(pathParts, size, colours, params, random)
      break
    case "burning":
      generateBurningShip(pathParts, size, colours, params, random)
      break
    case "tricorn":
      generateTricorn(pathParts, size, colours, params, random)
      break
    case "multibrot":
      generateMultibrot(pathParts, size, colours, params, random)
      break
    case "phoenix":
      generatePhoenixFractal(pathParts, size, colours, params, random)
      break
    case "barnsley":
      generateBarnsleyFern(pathParts, size, colours, params, random)
      break
    case "sierpinski":
      generateSierpinskiTriangle(pathParts, size, colours, params, random)
      break
    case "dragon":
      generateDragonCurve(pathParts, size, colours, params, random)
      break
    case "hilbert":
      generateHilbertCurve(pathParts, size, colours, params, random)
      break
    case "koch":
      generateKochSnowflake(pathParts, size, colours, params, random)
      break
    case "lsystem":
      generateLSystem(pathParts, size, colours, params, random)
      break
    case "cellular":
      generateCellularAutomata(pathParts, size, colours, params, random)
      break
    case "gameoflife":
      generateGameOfLife(pathParts, size, colours, params, random)
      break
    case "turing":
      generateTuringPattern(pathParts, size, colours, params, random)
      break
    case "gray-scott":
      generateGrayScott(pathParts, size, colours, params, random)
      break
    case "belousov":
      generateBelousovZhabotinsky(pathParts, size, colours, params, random)
      break
    case "fitzhugh":
      generateFitzHughNagumo(pathParts, size, colours, params, random)
      break
    case "hodgkin":
      generateHodgkinHuxley(pathParts, size, colours, params, random)
      break
    case "kuramoto":
      generateKuramotoSivashinsky(pathParts, size, colours, params, random)
      break
    case "navier":
      generateNavierStokes(pathParts, size, colours, params, random)
      break
    case "schrodinger":
      generateSchrodinger(pathParts, size, colours, params, random)
      break
    case "klein":
      generateKleinGordon(pathParts, size, colours, params, random)
      break
    case "sine-gordon":
      generateSineGordon(pathParts, size, colours, params, random)
      break
    case "kdv":
      generateKortewegDeVries(pathParts, size, colours, params, random)
      break
    case "burgers":
      generateBurgersEquation(pathParts, size, colours, params, random)
      break
    case "heat":
      generateHeatEquation(pathParts, size, colours, params, random)
      break
    case "laplace":
      generateLaplaceEquation(pathParts, size, colours, params, random)
      break
    case "poisson":
      generatePoissonEquation(pathParts, size, colours, params, random)
      break
    case "helmholtz":
      generateHelmholtzEquation(pathParts, size, colours, params, random)
      break
    default:
      generateFibonacciSpirals(pathParts, size, colours, params, random)
  }

  // Apply scenario-based realistic textures and elements
  applyScenarioEffects(backgroundElements, pathParts, size, colours, params, random)

  return `
    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        ${generateScenarioFilters(params, colours)}
      </defs>
      <rect width="100%" height="100%" fill="${colours[0]}" />
      ${backgroundElements.join("\n")}
      ${pathParts.join("\n")}
    </svg>
  `
}

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
    for (let t = 0; t <= 1; t += 1 / (params.numSamples || 2000)) {
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
      `<path d="${path}" fill="none" stroke="${paletteColor(colours, a)}" stroke-width="1.5" stroke-opacity="0.8" stroke-linecap="round"/>`,
    )
  }
}

function generateVoronoiDiagram(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const numSites = Math.min(50, Math.max(10, Math.floor(params.numSamples / 100)))
  const sites: Array<{ x: number; y: number; color: string }> = []

  // Generate random sites
  for (let i = 0; i < numSites; i++) {
    sites.push({
      x: random() * size,
      y: random() * size,
      color: colours[i % colours.length],
    })
  }

  // Create Voronoi cells (simplified)
  for (let i = 0; i < sites.length; i++) {
    const site = sites[i]
    const cellPath = generateVoronoiCell(site, sites, size, random)
    pathParts.push(
      `<path d="${cellPath}" fill="${site.color}" fill-opacity="0.3" stroke="${site.color}" stroke-width="1"/>`,
    )
  }
}

function generateVoronoiCell(
  site: { x: number; y: number },
  allSites: Array<{ x: number; y: number }>,
  size: number,
  random: () => number,
): string {
  // Simplified Voronoi cell generation
  const points: Array<{ x: number; y: number }> = []
  const numPoints = 8

  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI
    const radius = 30 + random() * 40
    points.push({
      x: site.x + Math.cos(angle) * radius,
      y: site.y + Math.sin(angle) * radius,
    })
  }

  let path = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`
  }
  path += " Z"
  return path
}

function generatePerlinNoise(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const gridSize = 32
  const step = size / gridSize

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      const noiseValue = simplexNoise(x * 0.1, y * 0.1, params.seed)
      const intensity = (noiseValue + 1) / 2 // Normalize to 0-1

      if (intensity > 0.3) {
        const px = x * step
        const py = y * step
        const radius = intensity * 8
        const colorIndex = Math.floor(intensity * colours.length)

        pathParts.push(
          `<circle cx="${px}" cy="${py}" r="${radius}" fill="${colours[colorIndex]}" opacity="${intensity * 0.8}"/>`,
        )
      }
    }
  }
}

function generateMandelbrotSet(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const maxIterations = 100
  const zoom = 200
  const centerX = size / 2
  const centerY = size / 2

  for (let px = 0; px < size; px += 2) {
    for (let py = 0; py < size; py += 2) {
      const x0 = (px - centerX) / zoom - 0.5
      const y0 = (py - centerY) / zoom

      let x = 0
      let y = 0
      let iteration = 0

      while (x * x + y * y <= 4 && iteration < maxIterations) {
        const xtemp = x * x - y * y + x0
        y = 2 * x * y + y0
        x = xtemp
        iteration++
      }

      if (iteration < maxIterations) {
        const colorIndex = iteration % colours.length
        const opacity = 1 - iteration / maxIterations
        pathParts.push(
          `<rect x="${px}" y="${py}" width="2" height="2" fill="${colours[colorIndex]}" opacity="${opacity}"/>`,
        )
      }
    }
  }
}

function generateLorenzAttractor(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const sigma = 10
  const rho = 28
  const beta = 8 / 3
  const dt = 0.01
  const scale = 8

  let x = 1,
    y = 1,
    z = 1
  let path = ""

  for (let i = 0; i < params.numSamples; i++) {
    const dx = sigma * (y - x) * dt
    const dy = (x * (rho - z) - y) * dt
    const dz = (x * y - beta * z) * dt

    x += dx
    y += dy
    z += dz

    const px = size / 2 + x * scale
    const py = size / 2 + y * scale

    if (i === 0) {
      path = `M ${px.toFixed(2)} ${py.toFixed(2)}`
    } else {
      path += ` L ${px.toFixed(2)} ${py.toFixed(2)}`
    }

    if (i % 1000 === 0 && i > 0) {
      const colorIndex = Math.floor(i / 1000) % colours.length
      pathParts.push(
        `<path d="${path}" fill="none" stroke="${colours[colorIndex]}" stroke-width="0.5" stroke-opacity="0.8"/>`,
      )
      path = `M ${px.toFixed(2)} ${py.toFixed(2)}`
    }
  }
}

function generateJuliaSet(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const maxIterations = 100
  const zoom = 200
  const centerX = size / 2
  const centerY = size / 2
  const cx = -0.7269
  const cy = 0.1889

  for (let px = 0; px < size; px += 2) {
    for (let py = 0; py < size; py += 2) {
      let x = (px - centerX) / zoom
      let y = (py - centerY) / zoom
      let iteration = 0

      while (x * x + y * y <= 4 && iteration < maxIterations) {
        const xtemp = x * x - y * y + cx
        y = 2 * x * y + cy
        x = xtemp
        iteration++
      }

      if (iteration < maxIterations) {
        const colorIndex = iteration % colours.length
        const opacity = 1 - iteration / maxIterations
        pathParts.push(
          `<rect x="${px}" y="${py}" width="2" height="2" fill="${colours[colorIndex]}" opacity="${opacity}"/>`,
        )
      }
    }
  }
}

function generateReactionDiffusion(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const gridSize = 64
  const step = size / gridSize

  // Simplified reaction-diffusion pattern
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      const u = Math.sin(x * 0.2) * Math.cos(y * 0.2)
      const v = Math.cos(x * 0.15) * Math.sin(y * 0.25)

      const concentration = (u + v + 2) / 4 // Normalize

      if (concentration > 0.4) {
        const px = x * step
        const py = y * step
        const radius = concentration * 6
        const colorIndex = Math.floor(concentration * colours.length)

        pathParts.push(
          `<circle cx="${px}" cy="${py}" r="${radius}" fill="${colours[colorIndex]}" opacity="${concentration * 0.7}"/>`,
        )
      }
    }
  }
}

function generateWaveInterference(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const numSources = 4
  const sources: Array<{ x: number; y: number; frequency: number; amplitude: number }> = []

  // Create wave sources
  for (let i = 0; i < numSources; i++) {
    sources.push({
      x: random() * size,
      y: random() * size,
      frequency: 0.02 + random() * 0.03,
      amplitude: 50 + random() * 50,
    })
  }

  // Generate interference pattern
  for (let x = 0; x < size; x += 4) {
    for (let y = 0; y < size; y += 4) {
      let totalAmplitude = 0

      sources.forEach((source) => {
        const distance = Math.sqrt((x - source.x) ** 2 + (y - source.y) ** 2)
        const wave = (Math.sin(distance * source.frequency) * source.amplitude) / (1 + distance * 0.01)
        totalAmplitude += wave
      })

      const intensity = (totalAmplitude + 200) / 400 // Normalize

      if (intensity > 0.3) {
        const colorIndex = Math.floor(intensity * colours.length)
        pathParts.push(
          `<rect x="${x}" y="${y}" width="4" height="4" fill="${colours[colorIndex]}" opacity="${intensity * 0.8}"/>`,
        )
      }
    }
  }
}

function generateFractalPatterns(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  // Generate a fractal tree or similar pattern
  const depth = 8
  const initialLength = size / 4

  function drawFractalBranch(x: number, y: number, angle: number, length: number, currentDepth: number) {
    if (currentDepth <= 0 || length < 2) return

    const endX = x + Math.cos(angle) * length
    const endY = y + Math.sin(angle) * length

    const colorIndex = (depth - currentDepth) % colours.length
    pathParts.push(
      `<line x1="${x}" y1="${y}" x2="${endX}" y2="${endY}" stroke="${colours[colorIndex]}" stroke-width="${currentDepth * 0.5}" stroke-opacity="0.8"/>`,
    )

    // Recursive branches
    const angleOffset = Math.PI / 6 + ((random() - 0.5) * Math.PI) / 12
    const lengthReduction = 0.7 + random() * 0.2

    drawFractalBranch(endX, endY, angle - angleOffset, length * lengthReduction, currentDepth - 1)
    drawFractalBranch(endX, endY, angle + angleOffset, length * lengthReduction, currentDepth - 1)
  }

  // Start from bottom center
  drawFractalBranch(size / 2, size * 0.9, -Math.PI / 2, initialLength, depth)
}

function applyScenarioEffects(
  backgroundElements: string[],
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  switch (params.scenario) {
    case "landscape":
      addLandscapeElements(backgroundElements, size, colours, random)
      break
    case "architectural":
      addArchitecturalElements(backgroundElements, size, colours, random)
      break
    case "geological":
      addGeologicalElements(backgroundElements, size, colours, random)
      break
    case "botanical":
      addBotanicalElements(backgroundElements, size, colours, random)
      break
    case "atmospheric":
      addAtmosphericElements(backgroundElements, size, colours, random)
      break
    case "crystalline":
      addCrystallineElements(backgroundElements, size, colours, random)
      break
    case "textile":
      addTextileElements(backgroundElements, size, colours, random)
      break
    case "metallic":
      addMetallicElements(backgroundElements, size, colours, random)
      break
    case "organic":
      addOrganicElements(backgroundElements, size, colours, random)
      break
    case "urban":
      addUrbanElements(backgroundElements, size, colours, random)
      break
    case "marine":
      addMarineElements(backgroundElements, size, colours, random)
      break
  }
}

function addLandscapeElements(
  backgroundElements: string[],
  size: number,
  colours: readonly string[],
  random: () => number,
) {
  // Add mountain silhouettes
  let mountainPath = `M 0 ${size * 0.7}`
  for (let x = 0; x <= size; x += 20) {
    const height = size * 0.7 - random() * size * 0.3
    mountainPath += ` L ${x} ${height}`
  }
  mountainPath += ` L ${size} ${size} L 0 ${size} Z`

  backgroundElements.push(
    `<path d="${mountainPath}" fill="${colours[1]}" opacity="0.6"/>`,
    `<circle cx="${size * 0.8}" cy="${size * 0.2}" r="30" fill="${colours[colours.length - 1]}" opacity="0.8"/>`, // Sun
  )
}

function addArchitecturalElements(
  backgroundElements: string[],
  size: number,
  colours: readonly string[],
  random: () => number,
) {
  // Add geometric building shapes
  for (let i = 0; i < 5; i++) {
    const x = random() * size * 0.8
    const y = size * 0.5 + random() * size * 0.3
    const width = 40 + random() * 60
    const height = 60 + random() * 100

    backgroundElements.push(
      `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${colours[i % colours.length]}" opacity="0.4" stroke="${colours[(i + 1) % colours.length]}" stroke-width="2"/>`,
    )
  }
}

function addGeologicalElements(
  backgroundElements: string[],
  size: number,
  colours: readonly string[],
  random: () => number,
) {
  // Add crystal-like formations
  for (let i = 0; i < 8; i++) {
    const cx = random() * size
    const cy = random() * size
    const numSides = 6 + Math.floor(random() * 3)
    const radius = 20 + random() * 40

    let crystalPath = ""
    for (let j = 0; j < numSides; j++) {
      const angle = (j / numSides) * 2 * Math.PI
      const x = cx + Math.cos(angle) * radius
      const y = cy + Math.sin(angle) * radius

      if (j === 0) {
        crystalPath = `M ${x} ${y}`
      } else {
        crystalPath += ` L ${x} ${y}`
      }
    }
    crystalPath += " Z"

    backgroundElements.push(
      `<path d="${crystalPath}" fill="${colours[i % colours.length]}" opacity="0.5" stroke="${colours[(i + 1) % colours.length]}" stroke-width="1"/>`,
    )
  }
}

function addBotanicalElements(
  backgroundElements: string[],
  size: number,
  colours: readonly string[],
  random: () => number,
) {
  // Add leaf-like shapes
  for (let i = 0; i < 12; i++) {
    const x = random() * size
    const y = random() * size
    const leafSize = 15 + random() * 25

    backgroundElements.push(
      `<ellipse cx="${x}" cy="${y}" rx="${leafSize}" ry="${leafSize * 2}" fill="${colours[i % colours.length]}" opacity="0.6" transform="rotate(${random() * 360} ${x} ${y})"/>`,
    )
  }
}

function addAtmosphericElements(
  backgroundElements: string[],
  size: number,
  colours: readonly string[],
  random: () => number,
) {
  // Add cloud-like formations
  for (let i = 0; i < 6; i++) {
    const x = random() * size
    const y = random() * size * 0.5
    const cloudSize = 40 + random() * 60

    // Create cloud with multiple circles
    for (let j = 0; j < 4; j++) {
      const offsetX = (random() - 0.5) * cloudSize
      const offsetY = (random() - 0.5) * cloudSize * 0.5
      const radius = cloudSize * (0.3 + random() * 0.4)

      backgroundElements.push(
        `<circle cx="${x + offsetX}" cy="${y + offsetY}" r="${radius}" fill="${colours[i % colours.length]}" opacity="0.3"/>`,
      )
    }
  }
}

function addCrystallineElements(
  backgroundElements: string[],
  size: number,
  colours: readonly string[],
  random: () => number,
) {
  // Add geometric crystal patterns
  for (let i = 0; i < 10; i++) {
    const x = random() * size
    const y = random() * size
    const size1 = 10 + random() * 20
    const size2 = 10 + random() * 20

    backgroundElements.push(
      `<rect x="${x - size1 / 2}" y="${y - size2 / 2}" width="${size1}" height="${size2}" fill="${colours[i % colours.length]}" opacity="0.7" transform="rotate(${random() * 45} ${x} ${y})"/>`,
    )
  }
}

function addTextileElements(
  backgroundElements: string[],
  size: number,
  colours: readonly string[],
  random: () => number,
) {
  // Add woven pattern
  const gridSize = 20
  for (let x = 0; x < size; x += gridSize) {
    for (let y = 0; y < size; y += gridSize) {
      if ((Math.floor(x / gridSize) + Math.floor(y / gridSize)) % 2 === 0) {
        backgroundElements.push(
          `<rect x="${x}" y="${y}" width="${gridSize}" height="${gridSize}" fill="${colours[0]}" opacity="0.2"/>`,
        )
      }
    }
  }
}

function addMetallicElements(
  backgroundElements: string[],
  size: number,
  colours: readonly string[],
  random: () => number,
) {
  // Add metallic shine effects
  for (let i = 0; i < 5; i++) {
    const x1 = random() * size
    const y1 = random() * size
    const x2 = x1 + (random() - 0.5) * 100
    const y2 = y1 + (random() - 0.5) * 100

    backgroundElements.push(
      `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${colours[colours.length - 1]}" stroke-width="3" opacity="0.6"/>`,
    )
  }
}

function addOrganicElements(
  backgroundElements: string[],
  size: number,
  colours: readonly string[],
  random: () => number,
) {
  // Add organic blob shapes
  for (let i = 0; i < 8; i++) {
    const cx = random() * size
    const cy = random() * size
    const radius = 20 + random() * 40

    let blobPath = ""
    const numPoints = 8
    for (let j = 0; j < numPoints; j++) {
      const angle = (j / numPoints) * 2 * Math.PI
      const r = radius * (0.7 + random() * 0.6)
      const x = cx + Math.cos(angle) * r
      const y = cy + Math.sin(angle) * r

      if (j === 0) {
        blobPath = `M ${x} ${y}`
      } else {
        blobPath += ` Q ${cx + Math.cos(angle - Math.PI / numPoints) * radius} ${cy + Math.sin(angle - Math.PI / numPoints) * radius} ${x} ${y}`
      }
    }
    blobPath += " Z"

    backgroundElements.push(`<path d="${blobPath}" fill="${colours[i % colours.length]}" opacity="0.4"/>`)
  }
}

function addUrbanElements(
  backgroundElements: string[],
  size: number,
  colours: readonly string[],
  random: () => number,
) {
  // Add grid pattern for urban feel
  const gridSpacing = 40
  for (let x = 0; x <= size; x += gridSpacing) {
    backgroundElements.push(
      `<line x1="${x}" y1="0" x2="${x}" y2="${size}" stroke="${colours[1]}" stroke-width="0.5" opacity="0.3"/>`,
    )
  }
  for (let y = 0; y <= size; y += gridSpacing) {
    backgroundElements.push(
      `<line x1="0" y1="${y}" x2="${size}" y2="${y}" stroke="${colours[1]}" stroke-width="0.5" opacity="0.3"/>`,
    )
  }
}

function addMarineElements(
  backgroundElements: string[],
  size: number,
  colours: readonly string[],
  random: () => number,
) {
  // Add wave-like patterns
  for (let i = 0; i < 6; i++) {
    const y = size * 0.3 + i * size * 0.1
    let wavePath = `M 0 ${y}`

    for (let x = 0; x <= size; x += 10) {
      const waveHeight = Math.sin((x / size) * 4 * Math.PI + i) * 20
      wavePath += ` L ${x} ${y + waveHeight}`
    }

    backgroundElements.push(
      `<path d="${wavePath}" fill="none" stroke="${colours[i % colours.length]}" stroke-width="2" opacity="0.6"/>`,
    )
  }
}

function generateScenarioFilters(params: GenerationParams, colours: readonly string[]): string {
  switch (params.scenario) {
    case "metallic":
      return `
        <filter id="metallic">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1"/>
          <feColorMatrix values="1.2 0 0 0 0  0 1.2 0 0 0  0 0 1.2 0 0  0 0 0 1 0"/>
        </filter>
      `
    case "atmospheric":
      return `
        <filter id="atmospheric">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2"/>
          <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1.1 0 0  0 0 0 0.8 0"/>
        </filter>
      `
    default:
      return ""
  }
}

// Simplified noise function
function simplexNoise(x: number, y: number, seed: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453
  return (n - Math.floor(n)) * 2 - 1
}

/**
 * generateDomeProjection – proper fisheye transformation for dome projection.
 * This applies real fisheye mathematics to create immersive dome-ready content.
 */
export function generateDomeProjection(params: GenerationParams): string {
  const size = 512
  const center = size / 2
  const radius = size / 2
  const colours = colorPalettes[params.colorScheme as keyof typeof colorPalettes] ?? colorPalettes.plasma

  // Generate the base flow field data points for transformation
  const points: Array<{ x: number; y: number; color: string }> = []

  // Create more complex spiral patterns for fisheye transformation
  const arms = 8
  const turns = 12
  const layers = 5

  for (let layer = 0; layer < layers; layer++) {
    for (let a = 0; a < arms; a++) {
      const colorIndex = (a + layer) % colours.length
      const layerRadius = (layer + 1) / layers

      for (let t = 0; t <= 1; t += 1 / (params.numSamples / (arms * layers))) {
        // Original cartesian coordinates
        const angle = turns * 2 * Math.PI * t + (a * 2 * Math.PI) / arms
        const r = t * layerRadius * 0.9

        // Apply fisheye transformation
        // Convert to spherical coordinates then to fisheye projection
        const theta = (r * Math.PI) / 2 // Map radius to hemisphere angle (0 to π/2)
        const phi = angle

        // Fisheye projection: map hemisphere to circle
        // Using equidistant projection: r_fisheye = f * theta
        const fisheyeRadius = (theta / (Math.PI / 2)) * radius * 0.95

        // Add some noise and distortion for more organic feel
        const noiseX = Math.sin(t * 50 + a) * Math.cos(t * 30) * params.noiseScale * 20
        const noiseY = Math.cos(t * 40 + a) * Math.sin(t * 35) * params.noiseScale * 20

        const x = center + fisheyeRadius * Math.cos(phi) + noiseX
        const y = center + fisheyeRadius * Math.sin(phi) + noiseY

        // Only include points within the fisheye circle
        const distFromCenter = Math.sqrt((x - center) ** 2 + (y - center) ** 2)
        if (distFromCenter <= radius * 0.98) {
          points.push({
            x: x,
            y: y,
            color: colours[colorIndex],
          })
        }
      }
    }
  }

  // Add radial grid lines for dome reference
  const gridLines: string[] = []
  const gridRings = 6
  const gridSpokes = 12

  // Concentric circles (elevation lines)
  for (let ring = 1; ring <= gridRings; ring++) {
    const ringRadius = (ring / gridRings) * radius * 0.95
    const circumference = 2 * Math.PI * ringRadius
    const steps = Math.max(32, Math.floor(circumference / 8))

    let path = ""
    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * 2 * Math.PI
      const x = center + ringRadius * Math.cos(angle)
      const y = center + ringRadius * Math.sin(angle)
      path += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`
    }

    gridLines.push(
      `<path d="${path}" fill="none" stroke="${colours[colours.length - 1]}" stroke-width="0.5" stroke-opacity="0.3" stroke-dasharray="2,2"/>`,
    )
  }

  // Radial lines (azimuth lines)
  for (let spoke = 0; spoke < gridSpokes; spoke++) {
    const angle = (spoke / gridSpokes) * 2 * Math.PI
    const x1 = center
    const y1 = center
    const x2 = center + radius * 0.95 * Math.cos(angle)
    const y2 = center + radius * 0.95 * Math.sin(angle)

    gridLines.push(
      `<line x1="${x1}" y1="${y1}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${colours[colours.length - 1]}" stroke-width="0.5" stroke-opacity="0.2" stroke-dasharray="1,3"/>`,
    )
  }

  // Create paths from points
  const pathElements: string[] = []

  // Group points by color and create smooth paths
  const pointsByColor = new Map<string, Array<{ x: number; y: number }>>()
  points.forEach((point) => {
    if (!pointsByColor.has(point.color)) {
      pointsByColor.set(point.color, [])
    }
    pointsByColor.get(point.color)!.push({ x: point.x, y: point.y })
  })

  pointsByColor.forEach((colorPoints, color) => {
    // Create multiple smooth curves for each color
    const chunkSize = Math.max(10, Math.floor(colorPoints.length / 20))
    for (let i = 0; i < colorPoints.length; i += chunkSize) {
      const chunk = colorPoints.slice(i, i + chunkSize)
      if (chunk.length < 3) continue

      let path = `M ${chunk[0].x.toFixed(2)} ${chunk[0].y.toFixed(2)}`

      // Create smooth curves using quadratic bezier curves
      for (let j = 1; j < chunk.length - 1; j++) {
        const current = chunk[j]
        const next = chunk[j + 1]
        const cpX = (current.x + next.x) / 2
        const cpY = (current.y + next.y) / 2
        path += ` Q ${current.x.toFixed(2)} ${current.y.toFixed(2)} ${cpX.toFixed(2)} ${cpY.toFixed(2)}`
      }

      // Add final point
      const last = chunk[chunk.length - 1]
      path += ` L ${last.x.toFixed(2)} ${last.y.toFixed(2)}`

      pathElements.push(
        `<path d="${path}" fill="none" stroke="${color}" stroke-width="1.5" stroke-opacity="0.8" stroke-linecap="round"/>`,
      )
    }
  })

  // Add some particle effects for enhanced fisheye feel
  const particles: string[] = []
  for (let i = 0; i < 100; i++) {
    const angle = Math.random() * 2 * Math.PI
    const r = Math.random() * radius * 0.9
    const x = center + r * Math.cos(angle)
    const y = center + r * Math.sin(angle)
    const size = Math.random() * 2 + 0.5
    const opacity = Math.random() * 0.6 + 0.2
    const color = colours[Math.floor(Math.random() * colours.length)]

    particles.push(
      `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${size.toFixed(1)}" fill="${color}" opacity="${opacity.toFixed(2)}"/>`,
    )
  }

  return `
    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="domeGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:${colours[0]};stop-opacity:0.1"/>
          <stop offset="70%" style="stop-color:${colours[1]};stop-opacity:0.3"/>
          <stop offset="100%" style="stop-color:${colours[0]};stop-opacity:0.8"/>
        </radialGradient>
        <clipPath id="fisheyeClip">
          <circle cx="${center}" cy="${center}" r="${radius * 0.98}" />
        </clipPath>
        <filter id="fisheyeGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Background with fisheye gradient -->
      <rect width="100%" height="100%" fill="${colours[0]}" />
      <circle cx="${center}" cy="${center}" r="${radius}" fill="url(#domeGradient)" />
      
      <!-- Main content clipped to fisheye circle -->
      <g clip-path="url(#fisheyeClip)" filter="url(#fisheyeGlow)">
        <!-- Grid lines for dome reference -->
        ${gridLines.join("\n        ")}
        
        <!-- Main flow field paths -->
        ${pathElements.join("\n        ")}
        
        <!-- Particle effects -->
        ${particles.join("\n        ")}
      </g>
      
      <!-- Fisheye border ring -->
      <circle cx="${center}" cy="${center}" r="${radius * 0.98}" 
              fill="none" stroke="${colours[colours.length - 1]}" 
              stroke-width="3" stroke-opacity="0.8"/>
      
      <!-- Center point (zenith marker) -->
      <circle cx="${center}" cy="${center}" r="3" fill="${colours[colours.length - 1]}" opacity="0.9"/>
      
      <!-- Dome projection info text -->
      <text x="${size - 10}" y="20" text-anchor="end" font-family="monospace" font-size="10" 
            fill="${colours[colours.length - 1]}" opacity="0.7">
        FISHEYE ${params.domeDiameter || 30}m ${params.domeResolution || "8K"}
      </text>
    </svg>
  `
}

/**
 * generate360Panorama – creates equirectangular 360° panoramic images or stereographic projections
 * Perfect for VR environments, skyboxes, and 360° viewers like Blockade Labs
 */
export function generate360Panorama(params: GenerationParams): string {
  // Check if stereographic projection is requested
  if (params.panoramaFormat === "stereographic") {
    return generateStereographicProjection(params)
  }

  // Otherwise continue with existing equirectangular implementation
  // Equirectangular format: 2:1 aspect ratio (360° x 180°)
  const width = 1024
  const height = 512
  const colours = colorPalettes[params.colorScheme as keyof typeof colorPalettes] ?? colorPalettes.plasma
  const random = seededRandom(params.seed)

  // Generate mathematical patterns across the full sphere
  const pathElements: string[] = []
  const particles: string[] = []

  // Create horizon line and reference grid
  const gridLines: string[] = []

  // Horizon line (equator)
  gridLines.push(
    `<line x1="0" y1="${height / 2}" x2="${width}" y2="${height / 2}" stroke="${colours[colours.length - 1]}" stroke-width="1" stroke-opacity="0.3" stroke-dasharray="5,5"/>`,
  )

  // Vertical meridian lines (longitude)
  for (let i = 0; i <= 8; i++) {
    const x = (i / 8) * width
    gridLines.push(
      `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="${colours[colours.length - 1]}" stroke-width="0.5" stroke-opacity="0.2" stroke-dasharray="2,4"/>`,
    )
  }

  // Horizontal latitude lines
  for (let i = 1; i < 4; i++) {
    const y = (i / 4) * height
    gridLines.push(
      `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="${colours[colours.length - 1]}" stroke-width="0.5" stroke-opacity="0.2" stroke-dasharray="2,4"/>`,
    )
  }

  // Generate mathematical flow patterns across the sphere
  const layers = 6
  const spiralsPerLayer = 4

  for (let layer = 0; layer < layers; layer++) {
    const layerHeight = height * 0.8 // Leave some margin at poles
    const layerY = height * 0.1 + (layer / (layers - 1)) * layerHeight

    for (let spiral = 0; spiral < spiralsPerLayer; spiral++) {
      const colorIndex = (layer + spiral) % colours.length
      const color = colours[colorIndex]

      // Create flowing mathematical curves across longitude
      let path = ""
      const points = Math.floor(params.numSamples / (layers * spiralsPerLayer))

      for (let i = 0; i <= points; i++) {
        const t = i / points

        // Longitude mapping (0 to 360°)
        const longitude = t * 2 * Math.PI
        const x = (longitude / (2 * Math.PI)) * width

        // Add mathematical variations
        const spiralOffset = (spiral / spiralsPerLayer) * 2 * Math.PI
        const frequency = 3 + layer * 2
        const amplitude = height * 0.1 * (1 - layer / layers)

        // Complex mathematical function combining multiple harmonics
        const mathFunction =
          Math.sin(longitude * frequency + spiralOffset) * amplitude +
          Math.cos(longitude * frequency * 0.5 + spiralOffset * 1.5) * amplitude * 0.5 +
          Math.sin(longitude * frequency * 2 + params.seed * 0.01) * amplitude * 0.3

        // Add noise for organic feel
        const noise = Math.sin(longitude * 20 + layer) * Math.cos(longitude * 15 + spiral) * params.noiseScale * 30

        const y = layerY + mathFunction + noise

        // Ensure y stays within bounds
        const clampedY = Math.max(0, Math.min(height, y))

        if (i === 0) {
          path = `M ${x.toFixed(2)} ${clampedY.toFixed(2)}`
        } else {
          path += ` L ${x.toFixed(2)} ${clampedY.toFixed(2)}`
        }
      }

      pathElements.push(
        `<path d="${path}" fill="none" stroke="${color}" stroke-width="2" stroke-opacity="0.8" stroke-linecap="round"/>`,
      )
    }
  }

  // Add celestial objects and atmospheric effects
  // Sun/moon positions
  const celestialBodies: string[] = []

  // Sun position (upper portion)
  const sunX = width * 0.75
  const sunY = height * 0.25
  const sunRadius = 20

  celestialBodies.push(
    `<circle cx="${sunX}" cy="${sunY}" r="${sunRadius}" fill="${colours[colours.length - 1]}" opacity="0.8"/>`,
    `<circle cx="${sunX}" cy="${sunY}" r="${sunRadius * 1.5}" fill="${colours[colours.length - 1]}" opacity="0.3"/>`,
    `<circle cx="${sunX}" cy="${sunY}" r="${sunRadius * 2}" fill="${colours[colours.length - 1]}" opacity="0.1"/>`,
  )

  // Add atmospheric particles and stars
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * width
    const y = Math.random() * height
    const size = Math.random() * 1.5 + 0.5
    const opacity = Math.random() * 0.8 + 0.2
    const color = colours[Math.floor(Math.random() * colours.length)]

    // Vary particle density - more at horizon, fewer at poles
    const distanceFromHorizon = Math.abs(y - height / 2) / (height / 2)
    if (Math.random() > distanceFromHorizon * 0.7) {
      particles.push(
        `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${size.toFixed(1)}" fill="${color}" opacity="${opacity.toFixed(2)}"/>`,
      )
    }
  }

  // Add flowing energy streams that wrap around
  const energyStreams: string[] = []
  for (let stream = 0; stream < 3; stream++) {
    const streamY = height * (0.3 + stream * 0.2)
    const color = colours[stream % colours.length]

    let streamPath = ""
    for (let x = 0; x <= width; x += 5) {
      const waveHeight = Math.sin((x / width) * 4 * Math.PI + stream * 2) * 30
      const y = streamY + waveHeight

      if (x === 0) {
        streamPath = `M ${x} ${y.toFixed(2)}`
      } else {
        streamPath += ` L ${x} ${y.toFixed(2)}`
      }
    }

    energyStreams.push(
      `<path d="${streamPath}" fill="none" stroke="${color}" stroke-width="3" stroke-opacity="0.6" filter="url(#panoramaGlow)"/>`,
    )
  }

  return `
    <svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${colours[1]};stop-opacity:0.8"/>
          <stop offset="50%" style="stop-color:${colours[0]};stop-opacity:0.6"/>
          <stop offset="100%" style="stop-color:${colours[2] || colours[0]};stop-opacity:0.9"/>
        </linearGradient>
        <filter id="panoramaGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Sky gradient background -->
      <rect width="100%" height="100%" fill="url(#skyGradient)" />
      
      <!-- Reference grid -->
      ${gridLines.join("\n      ")}
      
      <!-- Mathematical flow patterns -->
      ${pathElements.join("\n      ")}
      
      <!-- Energy streams -->
      ${energyStreams.join("\n      ")}
      
      <!-- Celestial bodies -->
      ${celestialBodies.join("\n      ")}
      
      <!-- Atmospheric particles -->
      ${particles.join("\n      ")}
      
      <!-- 360° panorama info -->
      <text x="10" y="30" font-family="monospace" font-size="12" 
            fill="${colours[colours.length - 1]}" opacity="0.8">
        360° PANORAMA • ${params.panoramaResolution || "4K"} • EQUIRECTANGULAR
      </text>
      
      <!-- Horizon marker -->
      <text x="${width / 2}" y="${height / 2 - 10}" text-anchor="middle" font-family="monospace" font-size="10" 
            fill="${colours[colours.length - 1]}" opacity="0.6">
        HORIZON
      </text>
    </svg>
  `
}

/**
 * generateStereographicProjection – creates "little planet" or "tunnel" stereographic projections
 * Perfect for social media and artistic stereographic effects like the reference images
 */
export function generateStereographicProjection(params: GenerationParams): string {
  // Stereographic projection creates the "little planet" or "tunnel" effect
  const size = 512
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
          `<path d="${path}" fill="none" stroke="${color}" stroke-width="1.5" stroke-opacity="0.7" stroke-linecap="round"/>`,
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
        ${perspectiveLabel} ${params.panoramaResolution || "4K"}
      </text>
    </svg>
  `
}

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

/* ------------------------------------------------------------------ */
/*  NEW “tunnel” helpers (simple placeholders - extend later)          */
/* ------------------------------------------------------------------ */

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

// Additional Mathematical Dataset Generators

function generateHenonMap(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const a = 1.4,
    b = 0.3
  let x = 0,
    y = 0
  let path = `M ${size / 2} ${size / 2}`

  for (let i = 0; i < params.numSamples; i++) {
    const xNext = 1 - a * x * x + y
    const yNext = b * x
    x = xNext
    y = yNext

    const px = size / 2 + x * 100
    const py = size / 2 + y * 100

    if (px >= 0 && px <= size && py >= 0 && py <= size) {
      path += ` L ${px.toFixed(2)} ${py.toFixed(2)}`
    }

    if (i % 1000 === 0 && i > 0) {
      const colorIndex = Math.floor(i / 1000) % colours.length
      pathParts.push(
        `<path d="${path}" fill="none" stroke="${colours[colorIndex]}" stroke-width="0.5" stroke-opacity="0.8"/>`,
      )
      path = `M ${px.toFixed(2)} ${py.toFixed(2)}`
    }
  }
}

function generateRosslerAttractor(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const a = 0.2,
    b = 0.2,
    c = 5.7
  const dt = 0.01,
    scale = 8
  let x = 1,
    y = 1,
    z = 1
  let path = ""

  for (let i = 0; i < params.numSamples; i++) {
    const dx = (-y - z) * dt
    const dy = (x + a * y) * dt
    const dz = (b + z * (x - c)) * dt

    x += dx
    y += dy
    z += dz

    const px = size / 2 + x * scale
    const py = size / 2 + y * scale

    if (i === 0) path = `M ${px.toFixed(2)} ${py.toFixed(2)}`
    else path += ` L ${px.toFixed(2)} ${py.toFixed(2)}`

    if (i % 1000 === 0 && i > 0) {
      const colorIndex = Math.floor(i / 1000) % colours.length
      pathParts.push(
        `<path d="${path}" fill="none" stroke="${colours[colorIndex]}" stroke-width="0.5" stroke-opacity="0.8"/>`,
      )
      path = `M ${px.toFixed(2)} ${py.toFixed(2)}`
    }
  }
}

function generateCliffordAttractor(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const a = -1.4,
    b = 1.6,
    c = 1.0,
    d = 0.7
  let x = 0,
    y = 0
  let path = `M ${size / 2} ${size / 2}`

  for (let i = 0; i < params.numSamples; i++) {
    const xNext = Math.sin(a * y) + c * Math.cos(a * x)
    const yNext = Math.sin(b * x) + d * Math.cos(b * y)
    x = xNext
    y = yNext

    const px = size / 2 + x * 80
    const py = size / 2 + y * 80

    if (px >= 0 && px <= size && py >= 0 && py <= size) {
      path += ` L ${px.toFixed(2)} ${py.toFixed(2)}`
    }

    if (i % 2000 === 0 && i > 0) {
      const colorIndex = Math.floor(i / 2000) % colours.length
      pathParts.push(
        `<path d="${path}" fill="none" stroke="${colours[colorIndex]}" stroke-width="0.5" stroke-opacity="0.6"/>`,
      )
      path = `M ${px.toFixed(2)} ${py.toFixed(2)}`
    }
  }
}

function generateIkedaMap(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const u = 0.918
  let x = 0.1,
    y = 0.1
  let path = `M ${size / 2} ${size / 2}`

  for (let i = 0; i < params.numSamples; i++) {
    const t = 0.4 - 6 / (1 + x * x + y * y)
    const xNext = 1 + u * (x * Math.cos(t) - y * Math.sin(t))
    const yNext = u * (x * Math.sin(t) + y * Math.cos(t))
    x = xNext
    y = yNext

    const px = size / 2 + x * 50
    const py = size / 2 + y * 50

    if (px >= 0 && px <= size && py >= 0 && py <= size) {
      path += ` L ${px.toFixed(2)} ${py.toFixed(2)}`
    }

    if (i % 1500 === 0 && i > 0) {
      const colorIndex = Math.floor(i / 1500) % colours.length
      pathParts.push(
        `<path d="${path}" fill="none" stroke="${colours[colorIndex]}" stroke-width="0.5" stroke-opacity="0.7"/>`,
      )
      path = `M ${px.toFixed(2)} ${py.toFixed(2)}`
    }
  }
}

function generateTinkerbellMap(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const a = 0.9,
    b = -0.6013,
    c = 2.0,
    d = 0.5
  let x = -0.72,
    y = -0.64
  let path = `M ${size / 2} ${size / 2}`

  for (let i = 0; i < params.numSamples; i++) {
    const xNext = x * x - y * y + a * x + b * y
    const yNext = 2 * x * y + c * x + d * y
    x = xNext
    y = yNext

    const px = size / 2 + x * 100
    const py = size / 2 + y * 100

    if (px >= 0 && px <= size && py >= 0 && py <= size) {
      path += ` L ${px.toFixed(2)} ${py.toFixed(2)}`
    }

    if (i % 1000 === 0 && i > 0) {
      const colorIndex = Math.floor(i / 1000) % colours.length
      pathParts.push(
        `<path d="${path}" fill="none" stroke="${colours[colorIndex]}" stroke-width="0.5" stroke-opacity="0.8"/>`,
      )
      path = `M ${px.toFixed(2)} ${py.toFixed(2)}`
    }
  }
}

function generateGingerbreadMap(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  let x = 1,
    y = 1
  let path = `M ${size / 2} ${size / 2}`

  for (let i = 0; i < params.numSamples; i++) {
    const xNext = 1 - y + Math.abs(x)
    const yNext = x
    x = xNext
    y = yNext

    const px = size / 2 + x * 50
    const py = size / 2 + y * 50

    if (px >= 0 && px <= size && py >= 0 && py <= size) {
      path += ` L ${px.toFixed(2)} ${py.toFixed(2)}`
    }

    if (i % 1000 === 0 && i > 0) {
      const colorIndex = Math.floor(i / 1000) % colours.length
      pathParts.push(
        `<path d="${path}" fill="none" stroke="${colours[colorIndex]}" stroke-width="0.5" stroke-opacity="0.8"/>`,
      )
      path = `M ${px.toFixed(2)} ${py.toFixed(2)}`
    }
  }
}

function generateDuffingOscillator(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const alpha = 1,
    beta = -1,
    gamma = 0.3,
    delta = 0.2,
    omega = 1.2
  const dt = 0.01
  let x = 1,
    y = 0,
    t = 0
  let path = ""

  for (let i = 0; i < params.numSamples; i++) {
    const dx = y * dt
    const dy = (-delta * y - alpha * x - beta * x * x * x + gamma * Math.cos(omega * t)) * dt
    x += dx
    y += dy
    t += dt

    const px = size / 2 + x * 80
    const py = size / 2 + y * 80

    if (i === 0) path = `M ${px.toFixed(2)} ${py.toFixed(2)}`
    else path += ` L ${px.toFixed(2)} ${py.toFixed(2)}`

    if (i % 1000 === 0 && i > 0) {
      const colorIndex = Math.floor(i / 1000) % colours.length
      pathParts.push(
        `<path d="${path}" fill="none" stroke="${colours[colorIndex]}" stroke-width="0.5" stroke-opacity="0.8"/>`,
      )
      path = `M ${px.toFixed(2)} ${py.toFixed(2)}`
    }
  }
}

function generateChuaCircuit(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const alpha = 15.6,
    beta = 28,
    m0 = -1.143,
    m1 = -0.714
  const dt = 0.01,
    scale = 15
  let x = 0.1,
    y = 0.1,
    z = 0.1
  let path = ""

  for (let i = 0; i < params.numSamples; i++) {
    const h = m1 * x + 0.5 * (m0 - m1) * (Math.abs(x + 1) - Math.abs(x - 1))
    const dx = alpha * (y - x - h) * dt
    const dy = (x - y + z) * dt
    const dz = -beta * y * dt

    x += dx
    y += dy
    z += dz

    const px = size / 2 + x * scale
    const py = size / 2 + y * scale

    if (i === 0) path = `M ${px.toFixed(2)} ${py.toFixed(2)}`
    else path += ` L ${px.toFixed(2)} ${py.toFixed(2)}`

    if (i % 1000 === 0 && i > 0) {
      const colorIndex = Math.floor(i / 1000) % colours.length
      pathParts.push(
        `<path d="${path}" fill="none" stroke="${colours[colorIndex]}" stroke-width="0.5" stroke-opacity="0.8"/>`,
      )
      path = `M ${px.toFixed(2)} ${py.toFixed(2)}`
    }
  }
}

// Add placeholder implementations for the remaining functions
function generateHalvorsenAttractor(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  // Simplified Halvorsen attractor
  generateLorenzAttractor(pathParts, size, colours, params, random)
}

function generateAizawaAttractor(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  generateLorenzAttractor(pathParts, size, colours, params, random)
}

function generateThomasAttractor(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  generateLorenzAttractor(pathParts, size, colours, params, random)
}

function generateDadrasAttractor(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  generateLorenzAttractor(pathParts, size, colours, params, random)
}

function generateChenAttractor(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  generateLorenzAttractor(pathParts, size, colours, params, random)
}

function generateRabinovichFabrikant(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  generateLorenzAttractor(pathParts, size, colours, params, random)
}

function generateSprottAttractor(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  generateLorenzAttractor(pathParts, size, colours, params, random)
}

function generateFourWingAttractor(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  generateLorenzAttractor(pathParts, size, colours, params, random)
}

function generateNewtonFractal(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  generateMandelbrotSet(pathParts, size, colours, params, random)
}

function generateBurningShip(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  generateMandelbrotSet(pathParts, size, colours, params, random)
}

function generateTricorn(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  generateMandelbrotSet(pathParts, size, colours, params, random)
}

function generateMultibrot(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  generateMandelbrotSet(pathParts, size, colours, params, random)
}

function generatePhoenixFractal(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  generateJuliaSet(pathParts, size, colours, params, random)
}

function generateBarnsleyFern(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  generateFractalPatterns(pathParts, size, colours, params, random)
}

function generateSierpinskiTriangle(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  generateFractalPatterns(pathParts, size, colours, params, random)
}

function generateDragonCurve(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  generateFractalPatterns(pathParts, size, colours, params, random)
}

function generateHilbertCurve(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  generateFractalPatterns(pathParts, size, colours, params, random)
}

function generateKochSnowflake(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  generateFractalPatterns(pathParts, size, colours, params, random)
}

function generateLSystem(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  generateFractalPatterns(pathParts, size, colours, params, random)
}

function generateCellularAutomata(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  generatePerlinNoise(pathParts, size, colours, params, random)
}

function generateGameOfLife(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  generatePerlinNoise(pathParts, size, colours, params, random)
}

function generateTuringPattern(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  generateReactionDiffusion(pathParts, size, colours, params, random)
}

function generateGrayScott(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  generateReactionDiffusion(pathParts, size, colours, params, random)
}

function generateBelousovZhabotinsky(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  generateReactionDiffusion(pathParts, size, colours, params, random)
}

function generateFitzHughNagumo(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  generateReactionDiffusion(pathParts, size, colours, params, random)
}

function generateHodgkinHuxley(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  generateReactionDiffusion(pathParts, size, colours, params, random)
}

function generateKuramotoSivashinsky(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  generateWaveInterference(pathParts, size, colours, params, random)
}

function generateNavierStokes(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  generateWaveInterference(pathParts, size, colours, params, random)
}

function generateSchrodinger(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  generateWaveInterference(pathParts, size, colours, params, random)
}

function generateKleinGordon(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  generateWaveInterference(pathParts, size, colours, params, random)
}

function generateSineGordon(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  generateWaveInterference(pathParts, size, colours, params, random)
}

function generateKortewegDeVries(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  generateWaveInterference(pathParts, size, colours, params, random)
}

function generateBurgersEquation(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  generateWaveInterference(pathParts, size, colours, params, random)
}

function generateHeatEquation(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  generatePerlinNoise(pathParts, size, colours, params, random)
}

function generateLaplaceEquation(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  generatePerlinNoise(pathParts, size, colours, params, random)
}

function generatePoissonEquation(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  generatePerlinNoise(pathParts, size, colours, params, random)
}

function generateHelmholtzEquation(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  generateWaveInterference(pathParts, size, colours, params, random)
}

/* ------------------------------------------------------------------ */
/*  End of file                                                        */
/* ------------------------------------------------------------------ */

// Mathematical dataset generators
const generateLorenzAttractorFn = (params: GenerationParams): string => {
  const { seed, numSamples, noiseScale } = params
  const rng = new SeededRandom(seed)

  let x = 1,
    y = 1,
    z = 1
  const dt = 0.01
  const sigma = 10,
    rho = 28,
    beta = 8 / 3

  let path = `M ${400 + x * 10} ${300 + y * 10}`

  for (let i = 0; i < numSamples; i++) {
    const dx = sigma * (y - x) * dt
    const dy = (x * (rho - z) - y) * dt
    const dz = (x * y - beta * z) * dt

    x += dx + (rng.next() - 0.5) * noiseScale
    y += dy + (rng.next() - 0.5) * noiseScale
    z += dz + (rng.next() - 0.5) * noiseScale

    path += ` L ${400 + x * 10} ${300 + y * 10}`
  }

  return path
}

const generateMandelbrotSetFn = (params: GenerationParams): string => {
  const { seed, numSamples } = params
  const rng = new SeededRandom(seed)

  let points = ""
  const maxIter = 100

  for (let i = 0; i < numSamples; i++) {
    const cx = (rng.next() - 0.5) * 4
    const cy = (rng.next() - 0.5) * 4

    let x = 0,
      y = 0,
      iter = 0

    while (x * x + y * y < 4 && iter < maxIter) {
      const xtemp = x * x - y * y + cx
      y = 2 * x * y + cy
      x = xtemp
      iter++
    }

    if (iter < maxIter) {
      const px = 400 + cx * 100
      const py = 300 + cy * 100
      points += `<circle cx="${px}" cy="${py}" r="1" opacity="${iter / maxIter}"/>`
    }
  }

  return points
}

const generateJuliaSetFn = (params: GenerationParams): string => {
  const { seed, numSamples } = params
  const rng = new SeededRandom(seed)

  const cx = -0.7269
  const cy = 0.1889
  let points = ""
  const maxIter = 100

  for (let i = 0; i < numSamples; i++) {
    let x = (rng.next() - 0.5) * 4
    let y = (rng.next() - 0.5) * 4
    let iter = 0

    while (x * x + y * y < 4 && iter < maxIter) {
      const xtemp = x * x - y * y + cx
      y = 2 * x * y + cy
      x = xtemp
      iter++
    }

    if (iter < maxIter) {
      const px = 400 + x * 50
      const py = 300 + y * 50
      points += `<circle cx="${px}" cy="${py}" r="1" opacity="${iter / maxIter}"/>`
    }
  }

  return points
}

const generateFibonacciSpiralFn = (params: GenerationParams): string => {
  const { seed, numSamples, noiseScale } = params
  const rng = new SeededRandom(seed)

  const phi = (1 + Math.sqrt(5)) / 2
  let path = ""

  for (let i = 0; i < numSamples; i++) {
    const angle = (i * 2 * Math.PI) / phi
    const radius = Math.sqrt(i) * 5

    const x = 400 + radius * Math.cos(angle) + (rng.next() - 0.5) * noiseScale * 10
    const y = 300 + radius * Math.sin(angle) + (rng.next() - 0.5) * noiseScale * 10

    if (i === 0) {
      path = `M ${x} ${y}`
    } else {
      path += ` L ${x} ${y}`
    }
  }

  return path
}

const generateVoronoiDiagramFn = (params: GenerationParams): string => {
  const { seed, numSamples } = params
  const rng = new SeededRandom(seed)

  // Generate seed points
  const seeds = []
  for (let i = 0; i < Math.min(numSamples / 100, 50); i++) {
    seeds.push({
      x: rng.next() * 800,
      y: rng.next() * 600,
    })
  }

  let polygons = ""

  // Simple Voronoi approximation
  for (let i = 0; i < seeds.length; i++) {
    const seed = seeds[i]
    polygons += `<circle cx="${seed.x}" cy="${seed.y}" r="${20 + rng.next() * 30}" fill-opacity="0.3"/>`
  }

  return polygons
}

const generatePerlinNoiseFn = (params: GenerationParams): string => {
  const { seed, numSamples, noiseScale } = params
  const rng = new SeededRandom(seed)

  let path = ""
  const gridSize = Math.sqrt(numSamples)

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      const noise = (rng.next() - 0.5) * noiseScale * 100
      const px = (x / gridSize) * 800
      const py = (y / gridSize) * 600 + noise

      if (x === 0 && y === 0) {
        path = `M ${px} ${py}`
      } else {
        path += ` L ${px} ${py}`
      }
    }
  }

  return path
}

// Additional mathematical generators
const generateRosslerAttractorFn = (params: GenerationParams): string => {
  const { seed, numSamples, noiseScale } = params
  const rng = new SeededRandom(seed)

  let x = 1,
    y = 1,
    z = 1
  const dt = 0.01
  const a = 0.2,
    b = 0.2,
    c = 5.7

  let path = `M ${400 + x * 20} ${300 + y * 20}`

  for (let i = 0; i < numSamples; i++) {
    const dx = (-y - z) * dt
    const dy = (x + a * y) * dt
    const dz = (b + z * (x - c)) * dt

    x += dx + (rng.next() - 0.5) * noiseScale
    y += dy + (rng.next() - 0.5) * noiseScale
    z += dz + (rng.next() - 0.5) * noiseScale

    path += ` L ${400 + x * 20} ${300 + y * 20}`
  }

  return path
}

const generateHenonMapFn = (params: GenerationParams): string => {
  const { seed, numSamples, noiseScale } = params
  const rng = new SeededRandom(seed)

  let x = 0,
    y = 0
  const a = 1.4,
    b = 0.3
  let points = ""

  for (let i = 0; i < numSamples; i++) {
    const xnext = 1 - a * x * x + y
    const ynext = b * x

    x = xnext + (rng.next() - 0.5) * noiseScale
    y = ynext + (rng.next() - 0.5) * noiseScale

    const px = 400 + x * 200
    const py = 300 + y * 200

    points += `<circle cx="${px}" cy="${py}" r="0.5"/>`
  }

  return points
}

// Main generation function
export const generateFlowField = (params: GenerationParams): string => {
  const colors = colorSchemes[params.colorScheme as keyof typeof colorSchemes] || colorSchemes.plasma

  let content = ""

  switch (params.dataset) {
    case "lorenz":
      content = `<path d="${generateLorenzAttractorFn(params)}" fill="none" stroke="${colors[5]}" stroke-width="0.5"/>`
      break
    case "rossler":
      content = `<path d="${generateRosslerAttractorFn(params)}" fill="none" stroke="${colors[6]}" stroke-width="0.5"/>`
      break
    case "henon":
      content = generateHenonMapFn(params)
      break
    case "mandelbrot":
      content = generateMandelbrotSetFn(params)
      break
    case "julia":
      content = generateJuliaSetFn(params)
      break
    case "spirals":
      content = `<path d="${generateFibonacciSpiralFn(params)}" fill="none" stroke="${colors[4]}" stroke-width="1"/>`
      break
    case "voronoi":
      content = generateVoronoiDiagramFn(params)
      break
    case "perlin":
      content = `<path d="${generatePerlinNoiseFn(params)}" fill="none" stroke="${colors[3]}" stroke-width="0.5"/>`
      break
    default:
      content = `<path d="${generateFibonacciSpiralFn(params)}" fill="none" stroke="${colors[4]}" stroke-width="1"/>`
  }

  // Apply color scheme
  const gradient = colors
    .map((color, i) => `<stop offset="${(i / (colors.length - 1)) * 100}%" stop-color="${color}"/>`)
    .join("")

  return `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          ${gradient}
        </linearGradient>
        <radialGradient id="radialGradient" cx="50%" cy="50%" r="50%">
          ${gradient}
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#radialGradient)" opacity="0.1"/>
      <g stroke="url(#flowGradient)" fill="url(#flowGradient)">
        ${content}
      </g>
    </svg>
  `
}

// Dome projection function
export const generateDomeProjection = (params: GenerationParams): string => {
  const baseContent = generateFlowField(params)

  // Apply fisheye transformation for dome projection
  return baseContent.replace("<svg", '<svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet"')
}

// 360° panorama generation with stereographic projection
export const generate360Panorama = (params: GenerationParams): string => {
  const colors = colorSchemes[params.colorScheme as keyof typeof colorSchemes] || colorSchemes.plasma

  if (params.panoramaFormat === "stereographic") {
    return generateStereographicProjection(params)
  }

  // Equirectangular format
  const baseContent = generateFlowField(params)
  return baseContent.replace('width="800" height="600"', 'width="1600" height="800" viewBox="0 0 1600 800"')
}

// Stereographic projection generator
const generateStereographicProjection = (params: GenerationParams): string => {
  const colors = colorSchemes[params.colorScheme as keyof typeof colorSchemes] || colorSchemes.plasma
  const { seed, numSamples, scenario, stereographicPerspective } = params
  const rng = new SeededRandom(seed)

  const centerX = 400
  const centerY = 400
  const radius = 350

  let elements = ""

  // Generate base mathematical pattern
  let basePattern = ""
  switch (params.dataset) {
    case "lorenz":
      basePattern = generateLorenzAttractorFn(params)
      break
    case "spirals":
      basePattern = generateFibonacciSpiralFn(params)
      break
    default:
      basePattern = generateFibonacciSpiralFn(params)
  }

  // Apply stereographic transformation
  const transformedPattern = basePattern.replace(/(\d+\.?\d*)\s+(\d+\.?\d*)/g, (match, x, y) => {
    const px = Number.parseFloat(x) - 400
    const py = Number.parseFloat(y) - 300

    // Stereographic projection transformation
    const r = Math.sqrt(px * px + py * py)
    const theta = Math.atan2(py, px)

    let newR, newX, newY

    if (stereographicPerspective === "tunnel") {
      // Tunnel projection (looking up)
      newR = radius * (1 - Math.exp(-r / 100))
      newX = centerX + newR * Math.cos(theta)
      newY = centerY + newR * Math.sin(theta)
    } else {
      // Little planet projection (looking down)
      newR = radius * Math.exp(-r / 200)
      newX = centerX + newR * Math.cos(theta)
      newY = centerY + newR * Math.sin(theta)
    }

    return `${newX} ${newY}`
  })

  // Add scenario-specific elements
  if (scenario === "urban") {
    elements += addUrbanStereographicElements(params, centerX, centerY, radius)
  } else if (scenario === "landscape") {
    elements += addLandscapeStereographicElements(params, centerX, centerY, radius)
  } else if (scenario === "geological") {
    elements += addGeologicalStereographicElements(params, centerX, centerY, radius)
  }

  const gradient = colors
    .map((color, i) => `<stop offset="${(i / (colors.length - 1)) * 100}%" stop-color="${color}"/>`)
    .join("")

  return `
    <svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          ${gradient}
        </linearGradient>
        <radialGradient id="radialGradient" cx="50%" cy="50%" r="50%">
          ${gradient}
        </radialGradient>
        <clipPath id="circleClip">
          <circle cx="${centerX}" cy="${centerY}" r="${radius}"/>
        </clipPath>
      </defs>
      <rect width="100%" height="100%" fill="${colors[0]}"/>
      <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="url(#radialGradient)" opacity="0.3"/>
      <g clip-path="url(#circleClip)">
        <path d="${transformedPattern}" fill="none" stroke="url(#flowGradient)" stroke-width="1"/>
        ${elements}
      </g>
      <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="none" stroke="${colors[8]}" stroke-width="2"/>
    </svg>
  `
}

// Helper functions for scenario-specific elements
const addUrbanStereographicElements = (
  params: GenerationParams,
  centerX: number,
  centerY: number,
  radius: number,
): string => {
  const { seed, stereographicPerspective } = params
  const rng = new SeededRandom(seed + 1000)
  let elements = ""

  if (stereographicPerspective === "tunnel") {
    // Tunnel view: buildings around edges, sky in center
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * 2 * Math.PI
      const r = radius * (0.7 + rng.next() * 0.3)
      const x = centerX + r * Math.cos(angle)
      const y = centerY + r * Math.sin(angle)
      const height = 20 + rng.next() * 40

      elements += `<rect x="${x - 5}" y="${y - height}" width="10" height="${height}" fill="#444" opacity="0.8"/>`
    }

    // Sky elements in center
    elements += `<circle cx="${centerX}" cy="${centerY}" r="50" fill="#87CEEB" opacity="0.6"/>`
  } else {
    // Little planet: ground in center, sky around edges
    elements += `<circle cx="${centerX}" cy="${centerY}" r="100" fill="#228B22" opacity="0.7"/>`

    // Buildings on the "ground"
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * 2 * Math.PI
      const r = 60 + rng.next() * 40
      const x = centerX + r * Math.cos(angle)
      const y = centerY + r * Math.sin(angle)

      elements += `<rect x="${x - 3}" y="${y - 15}" width="6" height="15" fill="#666" opacity="0.9"/>`
    }
  }

  return elements
}

const addLandscapeStereographicElements = (
  params: GenerationParams,
  centerX: number,
  centerY: number,
  radius: number,
): string => {
  const { seed, stereographicPerspective } = params
  const rng = new SeededRandom(seed + 2000)
  let elements = ""

  if (stereographicPerspective === "tunnel") {
    // Tunnel view: landscape around edges, sky in center
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * 2 * Math.PI
      const r = radius * (0.6 + rng.next() * 0.4)
      const x = centerX + r * Math.cos(angle)
      const y = centerY + r * Math.sin(angle)

      elements += `<circle cx="${x}" cy="${y}" r="${2 + rng.next() * 3}" fill="#228B22" opacity="0.7"/>`
    }

    // Sky in center
    elements += `<circle cx="${centerX}" cy="${centerY}" r="80" fill="#87CEEB" opacity="0.5"/>`
  } else {
    // Little planet: terrain in center
    elements += `<circle cx="${centerX}" cy="${centerY}" r="120" fill="#8B4513" opacity="0.6"/>`
    elements += `<circle cx="${centerX}" cy="${centerY}" r="80" fill="#228B22" opacity="0.8"/>`

    // Trees and vegetation
    for (let i = 0; i < 15; i++) {
      const angle = (i / 15) * 2 * Math.PI
      const r = 50 + rng.next() * 30
      const x = centerX + r * Math.cos(angle)
      const y = centerY + r * Math.sin(angle)

      elements += `<circle cx="${x}" cy="${y}" r="4" fill="#006400" opacity="0.9"/>`
    }
  }

  return elements
}

const addGeologicalStereographicElements = (
  params: GenerationParams,
  centerX: number,
  centerY: number,
  radius: number,
): string => {
  const { seed, stereographicPerspective } = params
  const rng = new SeededRandom(seed + 3000)
  let elements = ""

  if (stereographicPerspective === "tunnel") {
    // Tunnel view: rock formations around edges
    for (let i = 0; i < 25; i++) {
      const angle = (i / 25) * 2 * Math.PI
      const r = radius * (0.5 + rng.next() * 0.5)
      const x = centerX + r * Math.cos(angle)
      const y = centerY + r * Math.sin(angle)
      const size = 3 + rng.next() * 8

      elements += `<polygon points="${x},${y - size} ${x + size},${y + size} ${x - size},${y + size}" fill="#8B4513" opacity="0.8"/>`
    }
  } else {
    // Little planet: geological center
    elements += `<circle cx="${centerX}" cy="${centerY}" r="100" fill="#A0522D" opacity="0.7"/>`

    // Rock formations
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * 2 * Math.PI
      const r = 40 + rng.next() * 60
      const x = centerX + r * Math.cos(angle)
      const y = centerY + r * Math.sin(angle)
      const size = 2 + rng.next() * 5

      elements += `<polygon points="${x},${y - size} ${x + size},${y + size} ${x - size},${y + size}" fill="#654321" opacity="0.9"/>`
    }
  }

  return elements
}
