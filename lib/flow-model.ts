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

// Mathematical datasets with enhanced complexity
const datasets = {
  spirals: (t: number, seed: number) => {
    const r = Math.exp(t * 0.1) * (1 + 0.3 * Math.sin(seed + t * 3))
    return {
      x: r * Math.cos(t * (2 + Math.sin(seed))),
      y: r * Math.sin(t * (2 + Math.cos(seed))),
      intensity: Math.abs(Math.sin(t * 0.5 + seed)),
    }
  },

  lorenz: (t: number, seed: number) => {
    const sigma = 10 + seed * 0.001
    const rho = 28 + Math.sin(seed) * 5
    const beta = 8 / 3 + Math.cos(seed) * 0.5

    const dt = 0.01
    let x = 1 + Math.sin(seed)
    let y = 1 + Math.cos(seed)
    let z = 1 + Math.sin(seed * 2)

    for (let i = 0; i < t * 10; i++) {
      const dx = sigma * (y - x) * dt
      const dy = (x * (rho - z) - y) * dt
      const dz = (x * y - beta * z) * dt
      x += dx
      y += dy
      z += dz
    }

    return {
      x: x * 5,
      y: y * 5,
      intensity: Math.abs(z) / 20,
    }
  },

  mandelbrot: (t: number, seed: number) => {
    const c_real = -0.7 + Math.sin(seed) * 0.3
    const c_imag = 0.27015 + Math.cos(seed) * 0.2

    let z_real = Math.cos(t) * 2
    let z_imag = Math.sin(t) * 2
    let iterations = 0

    for (let i = 0; i < 50; i++) {
      const temp = z_real * z_real - z_imag * z_imag + c_real
      z_imag = 2 * z_real * z_imag + c_imag
      z_real = temp
      iterations = i

      if (z_real * z_real + z_imag * z_imag > 4) break
    }

    return {
      x: z_real * 50,
      y: z_imag * 50,
      intensity: iterations / 50,
    }
  },

  julia: (t: number, seed: number) => {
    const c_real = -0.8 + Math.sin(seed) * 0.2
    const c_imag = 0.156 + Math.cos(seed) * 0.1

    let z_real = Math.cos(t * 2) * 1.5
    let z_imag = Math.sin(t * 2) * 1.5
    let iterations = 0

    for (let i = 0; i < 100; i++) {
      const temp = z_real * z_real - z_imag * z_imag + c_real
      z_imag = 2 * z_real * z_imag + c_imag
      z_real = temp
      iterations = i

      if (z_real * z_real + z_imag * z_imag > 4) break
    }

    return {
      x: z_real * 80,
      y: z_imag * 80,
      intensity: iterations / 100,
    }
  },

  fibonacci: (t: number, seed: number) => {
    const phi = (1 + Math.sqrt(5)) / 2
    const angle = t * phi * 2 * Math.PI + seed
    const radius = Math.sqrt(t + 1) * (10 + Math.sin(seed) * 3)

    return {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
      intensity: Math.abs(Math.sin(angle * phi)) * (1 + Math.cos(t * 0.1)),
    }
  },

  rose: (t: number, seed: number) => {
    const k = 3 + Math.floor(Math.sin(seed) * 4)
    const r = Math.cos(k * t) * (50 + Math.sin(seed * 2) * 20)

    return {
      x: r * Math.cos(t),
      y: r * Math.sin(t),
      intensity: Math.abs(Math.cos(k * t)) * (1 + Math.sin(t * 0.5 + seed)),
    }
  },

  lissajous: (t: number, seed: number) => {
    const a = 3 + Math.sin(seed) * 2
    const b = 2 + Math.cos(seed) * 2
    const delta = seed * 0.5

    return {
      x: Math.sin(a * t + delta) * (60 + Math.sin(seed * 3) * 20),
      y: Math.sin(b * t) * (60 + Math.cos(seed * 3) * 20),
      intensity: Math.abs(Math.sin(a * t + delta) * Math.sin(b * t)),
    }
  },

  butterfly: (t: number, seed: number) => {
    const scale = 20 + Math.sin(seed) * 10
    const x = Math.sin(t) * (Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) - Math.pow(Math.sin(t / 12), 5))
    const y = Math.cos(t) * (Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) - Math.pow(Math.sin(t / 12), 5))

    return {
      x: x * scale,
      y: y * scale,
      intensity: Math.abs(Math.sin(t * 0.3 + seed)),
    }
  },

  dragon: (t: number, seed: number) => {
    let x = 0,
      y = 0
    let angle = 0
    const iterations = Math.floor(t * 2) + 10

    for (let i = 0; i < iterations; i++) {
      const turn = ((i & -i) << 1) & i ? 1 : -1
      angle += (turn * Math.PI) / 2
      x += Math.cos(angle) * (1 + Math.sin(seed + i * 0.1) * 0.3)
      y += Math.sin(angle) * (1 + Math.cos(seed + i * 0.1) * 0.3)
    }

    return {
      x: x * (15 + Math.sin(seed) * 5),
      y: y * (15 + Math.cos(seed) * 5),
      intensity: Math.abs(Math.sin(t * 0.2 + seed)),
    }
  },

  henon: (t: number, seed: number) => {
    const a = 1.4 + Math.sin(seed) * 0.1
    const b = 0.3 + Math.cos(seed) * 0.05

    let x = 0,
      y = 0
    const iterations = Math.floor(t * 5) + 1

    for (let i = 0; i < iterations; i++) {
      const newX = 1 - a * x * x + y
      const newY = b * x
      x = newX
      y = newY
    }

    return {
      x: x * (100 + Math.sin(seed * 2) * 30),
      y: y * (100 + Math.cos(seed * 2) * 30),
      intensity: Math.abs(x + y) * 0.5,
    }
  },

  clifford: (t: number, seed: number) => {
    const a = -1.4 + Math.sin(seed) * 0.3
    const b = 1.6 + Math.cos(seed) * 0.3
    const c = 1.0 + Math.sin(seed * 2) * 0.2
    const d = 0.7 + Math.cos(seed * 2) * 0.2

    let x = 0,
      y = 0
    const iterations = Math.floor(t * 3) + 1

    for (let i = 0; i < iterations; i++) {
      const newX = Math.sin(a * y) + c * Math.cos(a * x)
      const newY = Math.sin(b * x) + d * Math.cos(b * y)
      x = newX
      y = newY
    }

    return {
      x: x * (80 + Math.sin(seed * 3) * 25),
      y: y * (80 + Math.cos(seed * 3) * 25),
      intensity: Math.abs(Math.sin(x) * Math.cos(y)),
    }
  },
}

// Scenario-based environmental effects
const scenarios = {
  urban: (point: { x: number; y: number; intensity: number }, seed: number) => {
    const gridEffect = Math.abs(Math.sin(point.x * 0.02)) * Math.abs(Math.cos(point.y * 0.02))
    const buildingNoise = Math.sin(point.x * 0.05 + seed) * Math.cos(point.y * 0.03 + seed * 2)

    return {
      ...point,
      x: point.x + buildingNoise * 5,
      y: point.y + gridEffect * 3,
      intensity: point.intensity * (0.7 + gridEffect * 0.5),
    }
  },

  landscape: (point: { x: number; y: number; intensity: number }, seed: number) => {
    const terrainHeight = Math.sin(point.x * 0.01 + seed) * Math.cos(point.y * 0.008 + seed * 1.5)
    const windEffect = Math.sin(point.x * 0.03 + seed * 3) * 0.3

    return {
      ...point,
      x: point.x + windEffect * 8,
      y: point.y + terrainHeight * 12,
      intensity: point.intensity * (0.8 + Math.abs(terrainHeight) * 0.4),
    }
  },

  geological: (point: { x: number; y: number; intensity: number }, seed: number) => {
    const stratification = Math.floor(point.y * 0.02) * 5
    const faultLine = Math.abs(Math.sin(point.x * 0.008 + seed)) > 0.8 ? 15 : 0
    const erosion = Math.sin(point.x * 0.02 + seed) * Math.sin(point.y * 0.015 + seed * 2) * 4

    return {
      ...point,
      x: point.x + faultLine + erosion,
      y: point.y + stratification,
      intensity: point.intensity * (0.6 + Math.abs(erosion) * 0.1),
    }
  },

  pure: (point: { x: number; y: number; intensity: number }) => point,
}

// Color schemes with enhanced palettes
const colorSchemes = {
  futuristic: ["#00ffff", "#ff00ff", "#ffff00", "#00ff00", "#ff0080"],
  ocean: ["#001f3f", "#0074D9", "#7FDBFF", "#39CCCC", "#2ECC40"],
  sunset: ["#FF4136", "#FF851B", "#FFDC00", "#F012BE", "#B10DC9"],
  forest: ["#2ECC40", "#3D9970", "#01FF70", "#85144b", "#FF851B"],
  cosmic: ["#111111", "#2D1B69", "#7209B7", "#F72585", "#4CC9F0"],
  aurora: ["#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"],
  neon: ["#ff006e", "#8338ec", "#3a86ff", "#06ffa5", "#ffbe0b"],
  monochrome: ["#000000", "#333333", "#666666", "#999999", "#cccccc"],
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
const colorSchemes_old = {
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
  const { dataset, scenario, colorScheme, seed, numSamples, noiseScale, timeStep } = params

  const datasetFn = datasets[dataset as keyof typeof datasets] || datasets.spirals
  const scenarioFn = scenarios[scenario as keyof typeof scenarios] || scenarios.pure
  const colors = colorSchemes[colorScheme as keyof typeof colorSchemes] || colorSchemes.futuristic

  const points: Array<{ x: number; y: number; intensity: number }> = []

  // Generate base mathematical points
  for (let i = 0; i < numSamples; i++) {
    const t = (i / numSamples) * Math.PI * 8 + seed * 0.01
    const basePoint = datasetFn(t, seed)

    // Apply noise
    const noiseX = (Math.sin(t * 13.7 + seed) + Math.cos(t * 7.3 + seed * 2)) * noiseScale * 100
    const noiseY = (Math.cos(t * 11.1 + seed) + Math.sin(t * 5.9 + seed * 3)) * noiseScale * 100

    const noisyPoint = {
      x: basePoint.x + noiseX,
      y: basePoint.y + noiseY,
      intensity: basePoint.intensity,
    }

    // Apply scenario effects
    const finalPoint = scenarioFn(noisyPoint, seed)
    points.push(finalPoint)
  }

  // Find bounds for centering
  const bounds = points.reduce(
    (acc, point) => ({
      minX: Math.min(acc.minX, point.x),
      maxX: Math.max(acc.maxX, point.x),
      minY: Math.min(acc.minY, point.y),
      maxY: Math.max(acc.maxY, point.y),
    }),
    {
      minX: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    },
  )

  const centerX = (bounds.minX + bounds.maxX) / 2
  const centerY = (bounds.minY + bounds.maxY) / 2
  const scale = Math.min(400 / (bounds.maxX - bounds.minX), 400 / (bounds.maxY - bounds.minY)) * 0.8

  // Generate SVG paths
  let svgContent = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bg-gradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" style="stop-color:#000011;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
      </radialGradient>
    </defs>
    <rect width="512" height="512" fill="url(#bg-gradient)"/>
  `

  // Create flowing paths
  for (let i = 0; i < points.length - 1; i++) {
    const point = points[i]
    const nextPoint = points[i + 1]

    const x1 = (point.x - centerX) * scale + 256
    const y1 = (point.y - centerY) * scale + 256
    const x2 = (nextPoint.x - centerX) * scale + 256
    const y2 = (nextPoint.y - centerY) * scale + 256

    const colorIndex = Math.floor(point.intensity * colors.length) % colors.length
    const color = colors[colorIndex]
    const opacity = Math.max(0.1, Math.min(1, point.intensity))
    const strokeWidth = Math.max(0.5, point.intensity * 3)

    if (x1 >= 0 && x1 <= 512 && y1 >= 0 && y1 <= 512) {
      svgContent += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
        stroke="${color}" stroke-width="${strokeWidth}" opacity="${opacity}" 
        stroke-linecap="round"/>\n`
    }
  }

  // Add glow effects for enhanced visual appeal
  for (let i = 0; i < Math.min(points.length, 100); i += 10) {
    const point = points[i]
    const x = (point.x - centerX) * scale + 256
    const y = (point.y - centerY) * scale + 256

    if (x >= 0 && x <= 512 && y >= 0 && y <= 512 && point.intensity > 0.7) {
      const colorIndex = Math.floor(point.intensity * colors.length) % colors.length
      const color = colors[colorIndex]
      const radius = point.intensity * 8

      svgContent += `<circle cx="${x}" cy="${y}" r="${radius}" 
        fill="${color}" opacity="0.3" 
        filter="blur(2px)"/>\n`
    }
  }

  svgContent += "</svg>"
  return svgContent
}

export function generateDomeProjection(params: GenerationParams): string {
  const baseContent = generateFlowField(params)

  // Apply fisheye transformation for dome projection
  const parser = new DOMParser()
  const doc = parser.parseFromString(baseContent, "image/svg+xml")
  const svg = doc.documentElement

  // Add fisheye filter
  const defs = svg.querySelector("defs") || svg.insertBefore(doc.createElement("defs"), svg.firstChild)

  const fisheyeFilter = doc.createElement("filter")
  fisheyeFilter.setAttribute("id", "fisheye")
  fisheyeFilter.innerHTML = `
    <feGaussianBlur in="SourceGraphic" stdDeviation="0.5"/>
    <feOffset dx="0" dy="0"/>
  `
  defs.appendChild(fisheyeFilter)

  // Apply transformation to all elements
  const elements = svg.querySelectorAll("line, circle")
  elements.forEach((element) => {
    element.setAttribute("filter", "url(#fisheye)")

    if (element.tagName === "line") {
      const x1 = Number.parseFloat(element.getAttribute("x1") || "0")
      const y1 = Number.parseFloat(element.getAttribute("y1") || "0")
      const x2 = Number.parseFloat(element.getAttribute("x2") || "0")
      const y2 = Number.parseFloat(element.getAttribute("y2") || "0")

      // Apply fisheye distortion
      const center = 256
      const maxRadius = 200

      const transformPoint = (x: number, y: number) => {
        const dx = x - center
        const dy = y - center
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance > maxRadius) return { x, y }

        const factor = Math.sin(((distance / maxRadius) * Math.PI) / 2)
        return {
          x: center + dx * factor,
          y: center + dy * factor,
        }
      }

      const p1 = transformPoint(x1, y1)
      const p2 = transformPoint(x2, y2)

      element.setAttribute("x1", p1.x.toString())
      element.setAttribute("y1", p1.y.toString())
      element.setAttribute("x2", p2.x.toString())
      element.setAttribute("y2", p2.y.toString())
    }
  })

  return new XMLSerializer().serializeToString(svg)
}

export function generate360Panorama(params: GenerationParams): string {
  if (params.panoramaFormat === "stereographic") {
    return generateStereographicProjection(params)
  }

  // Generate equirectangular panorama
  const baseContent = generateFlowField({
    ...params,
    numSamples: params.numSamples * 2, // More samples for panoramic view
  })

  const parser = new DOMParser()
  const doc = parser.parseFromString(baseContent, "image/svg+xml")
  const svg = doc.documentElement

  // Modify viewBox for panoramic aspect ratio
  svg.setAttribute("viewBox", "0 0 1024 512")
  svg.setAttribute("width", "1024")
  svg.setAttribute("height", "512")

  // Stretch and duplicate content for 360° effect
  const elements = svg.querySelectorAll("line, circle")
  const originalElements = Array.from(elements)

  originalElements.forEach((element) => {
    // Create mirrored copies for seamless 360° wrap
    for (let i = 1; i < 4; i++) {
      const clone = element.cloneNode(true) as Element

      if (clone.tagName === "line") {
        const x1 = Number.parseFloat(clone.getAttribute("x1") || "0")
        const x2 = Number.parseFloat(clone.getAttribute("x2") || "0")

        clone.setAttribute("x1", (x1 + i * 256).toString())
        clone.setAttribute("x2", (x2 + i * 256).toString())
      } else if (clone.tagName === "circle") {
        const cx = Number.parseFloat(clone.getAttribute("cx") || "0")
        clone.setAttribute("cx", (cx + i * 256).toString())
      }

      svg.appendChild(clone)
    }
  })

  return new XMLSerializer().serializeToString(svg)
}

export function generateStereographicProjection(params: GenerationParams): string {
  const { stereographicPerspective = "little-planet" } = params

  // Generate base content with more samples for better projection quality
  const baseParams = {
    ...params,
    numSamples: params.numSamples * 1.5,
  }

  const baseContent = generateFlowField(baseParams)
  const parser = new DOMParser()
  const doc = parser.parseFromString(baseContent, "image/svg+xml")
  const svg = doc.documentElement

  // Apply stereographic projection transformation
  const elements = svg.querySelectorAll("line, circle")
  const center = 256

  elements.forEach((element) => {
    if (element.tagName === "line") {
      const x1 = Number.parseFloat(element.getAttribute("x1") || "0")
      const y1 = Number.parseFloat(element.getAttribute("y1") || "0")
      const x2 = Number.parseFloat(element.getAttribute("x2") || "0")
      const y2 = Number.parseFloat(element.getAttribute("y2") || "0")

      const p1 = applyStereographicProjection(x1, y1, center, stereographicPerspective)
      const p2 = applyStereographicProjection(x2, y2, center, stereographicPerspective)

      element.setAttribute("x1", p1.x.toString())
      element.setAttribute("y1", p1.y.toString())
      element.setAttribute("x2", p2.x.toString())
      element.setAttribute("y2", p2.y.toString())
    } else if (element.tagName === "circle") {
      const cx = Number.parseFloat(element.getAttribute("cx") || "0")
      const cy = Number.parseFloat(element.getAttribute("cy") || "0")

      const p = applyStereographicProjection(cx, cy, center, stereographicPerspective)

      element.setAttribute("cx", p.x.toString())
      element.setAttribute("cy", p.y.toString())
    }
  })

  // Add scenario-specific elements based on perspective
  if (stereographicPerspective === "little-planet") {
    addLittlePlanetStereographicElements(svg, doc, params)
  } else if (stereographicPerspective === "tunnel") {
    addTunnelStereographicElements(svg, doc, params)
  }

  return new XMLSerializer().serializeToString(svg)
}

function applyStereographicProjection(
  x: number,
  y: number,
  center: number,
  perspective: string,
): { x: number; y: number } {
  // Convert to centered coordinates
  const dx = x - center
  const dy = y - center

  // Convert to polar coordinates
  const r = Math.sqrt(dx * dx + dy * dy)
  const theta = Math.atan2(dy, dx)

  if (r === 0) return { x, y }

  let newR: number

  if (perspective === "tunnel") {
    // Tunnel/upward perspective: invert the projection
    newR = r > 0 ? (center * 0.8) / (1 + r / (center * 0.5)) : 0
  } else {
    // Little planet perspective: standard stereographic projection
    const maxR = center * 0.8
    newR = r < maxR ? (2 * r) / (1 + (r * r) / (maxR * maxR)) : r
  }

  // Convert back to Cartesian coordinates
  const newX = center + newR * Math.cos(theta)
  const newY = center + newR * Math.sin(theta)

  return { x: newX, y: newY }
}

function addLittlePlanetStereographicElements(svg: Element, doc: Document, params: GenerationParams) {
  const { scenario, seed } = params
  const center = 256

  // Add ground/horizon elements based on scenario
  const groundGroup = doc.createElement("g")
  groundGroup.setAttribute("id", "ground-elements")

  if (scenario === "urban") {
    // Add building silhouettes around the edge
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * 2 * Math.PI
      const baseR = 200 + Math.sin(seed + i) * 20
      const height = 30 + Math.sin(seed * 2 + i) * 15

      const x1 = center + baseR * Math.cos(angle)
      const y1 = center + baseR * Math.sin(angle)
      const x2 = center + (baseR + height) * Math.cos(angle)
      const y2 = center + (baseR + height) * Math.sin(angle)

      const building = doc.createElement("line")
      building.setAttribute("x1", x1.toString())
      building.setAttribute("y1", y1.toString())
      building.setAttribute("x2", x2.toString())
      building.setAttribute("y2", y2.toString())
      building.setAttribute("stroke", "#333333")
      building.setAttribute("stroke-width", "2")
      building.setAttribute("opacity", "0.6")

      groundGroup.appendChild(building)
    }
  } else if (scenario === "landscape") {
    // Add terrain variations
    const terrainPath = doc.createElement("path")
    let pathData = `M ${center + 180 * Math.cos(0)} ${center + 180 * Math.sin(0)}`

    for (let i = 1; i <= 36; i++) {
      const angle = (i / 36) * 2 * Math.PI
      const r = 180 + Math.sin(seed + angle * 3) * 25
      const x = center + r * Math.cos(angle)
      const y = center + r * Math.sin(angle)
      pathData += ` L ${x} ${y}`
    }
    pathData += " Z"

    terrainPath.setAttribute("d", pathData)
    terrainPath.setAttribute("fill", "none")
    terrainPath.setAttribute("stroke", "#2ECC40")
    terrainPath.setAttribute("stroke-width", "1.5")
    terrainPath.setAttribute("opacity", "0.4")

    groundGroup.appendChild(terrainPath)
  }

  svg.appendChild(groundGroup)
}

function addTunnelStereographicElements(svg: Element, doc: Document, params: GenerationParams) {
  const { scenario, seed } = params
  const center = 256

  // Add tunnel/ceiling elements
  const tunnelGroup = doc.createElement("g")
  tunnelGroup.setAttribute("id", "tunnel-elements")

  if (scenario === "urban") {
    // Add building tops/ceiling elements in the center
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * 2 * Math.PI
      const r = 50 + Math.sin(seed + i) * 20

      const x = center + r * Math.cos(angle)
      const y = center + r * Math.sin(angle)

      const building = doc.createElement("rect")
      building.setAttribute("x", (x - 5).toString())
      building.setAttribute("y", (y - 5).toString())
      building.setAttribute("width", "10")
      building.setAttribute("height", "10")
      building.setAttribute("fill", "#666666")
      building.setAttribute("opacity", "0.7")

      tunnelGroup.appendChild(building)
    }
  }

  // Add concentric circles to enhance tunnel effect
  for (let i = 1; i <= 3; i++) {
    const circle = doc.createElement("circle")
    circle.setAttribute("cx", center.toString())
    circle.setAttribute("cy", center.toString())
    circle.setAttribute("r", (60 * i).toString())
    circle.setAttribute("fill", "none")
    circle.setAttribute("stroke", "#444444")
    circle.setAttribute("stroke-width", "0.5")
    circle.setAttribute("opacity", (0.3 / i).toString())

    tunnelGroup.appendChild(circle)
  }

  svg.appendChild(tunnelGroup)
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
