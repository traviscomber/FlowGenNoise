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

  // Create a VERY simple multi-arm spiral so we know something renders
  const arms = 5
  const turns = 8
  const pathParts: string[] = []

  for (let a = 0; a < arms; a++) {
    let path = `M ${size / 2} ${size / 2}`
    for (let t = 0; t <= 1; t += 1 / (params.numSamples || 2000)) {
      const angle = turns * 2 * Math.PI * t + (a * 2 * Math.PI) / arms
      const radius = t * (size / 2) * 0.85
      const x = size / 2 + radius * Math.cos(angle)
      const y = size / 2 + radius * Math.sin(angle)
      path += ` L ${x.toFixed(2)} ${y.toFixed(2)}`
    }
    pathParts.push(
      `<path d="${path}" fill="none" stroke="${paletteColor(colours, a)}" stroke-width="1" stroke-opacity="0.8"/>`,
    )
  }

  return `
    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${colours[0]}" />
      ${pathParts.join("\n")}
    </svg>
  `
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
 * generate360Panorama – creates equirectangular 360° panoramic images
 * Perfect for VR environments, skyboxes, and 360° viewers like Blockade Labs
 */
export function generate360Panorama(params: GenerationParams): string {
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
