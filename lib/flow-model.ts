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

export interface DomeProjectionParams {
  width: number
  height: number
  fov: number
  tilt: number
}

export function generateFlowField(params: GenerationParams): string {
  const { dataset, scenario, colorScheme, seed, numSamples, noiseScale, timeStep } = params

  // Set up deterministic random based on seed
  let randomSeed = seed
  const seededRandom = () => {
    randomSeed = (randomSeed * 9301 + 49297) % 233280
    return randomSeed / 233280
  }

  const width = 800
  const height = 800
  const centerX = width / 2
  const centerY = height / 2

  const paths: string[] = []
  const colors: string[] = []

  // Generate color palette based on scheme
  const getColorPalette = (scheme: string): string[] => {
    switch (scheme) {
      case "plasma":
        return [
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
        ]
      case "quantum":
        return ["#000428", "#004e92", "#009ffd", "#00d2ff", "#ffffff"]
      case "cosmic":
        return ["#2c1810", "#8b4513", "#ff6347", "#ffa500", "#ffff00", "#ffffff"]
      case "thermal":
        return ["#000000", "#440154", "#31688e", "#35b779", "#fde725"]
      case "spectral":
        return [
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
        ]
      case "sunset":
        return ["#ff6b35", "#f7931e", "#ffd23f", "#06ffa5", "#1fb3d3", "#5d2e5d"]
      default:
        return ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"]
    }
  }

  const palette = getColorPalette(colorScheme)

  // Generate mathematical patterns based on dataset
  for (let i = 0; i < numSamples; i++) {
    const t = i / numSamples
    let x: number, y: number

    switch (dataset) {
      case "spirals":
        const angle = t * Math.PI * 8 + seed * 0.1
        const radius = t * 200 + seededRandom() * 50
        x = centerX + Math.cos(angle) * radius
        y = centerY + Math.sin(angle) * radius
        break

      case "fractal":
        const branch = Math.floor(seededRandom() * 4)
        const depth = Math.floor(t * 6)
        x = centerX + (seededRandom() - 0.5) * 400 * Math.pow(0.7, depth)
        y = centerY + (seededRandom() - 0.5) * 400 * Math.pow(0.7, depth)
        break

      case "mandelbrot":
        const real = (seededRandom() - 0.5) * 4
        const imag = (seededRandom() - 0.5) * 4
        let zr = 0,
          zi = 0
        let iterations = 0
        while (zr * zr + zi * zi < 4 && iterations < 100) {
          const temp = zr * zr - zi * zi + real
          zi = 2 * zr * zi + imag
          zr = temp
          iterations++
        }
        x = centerX + real * 100
        y = centerY + imag * 100
        break

      case "tribes":
        // Tribal settlement patterns
        const village = Math.floor(seededRandom() * 5)
        const villageX = centerX + (village - 2) * 120
        const villageY = centerY + (seededRandom() - 0.5) * 300
        const houseAngle = seededRandom() * Math.PI * 2
        const houseRadius = seededRandom() * 60 + 20
        x = villageX + Math.cos(houseAngle) * houseRadius
        y = villageY + Math.sin(houseAngle) * houseRadius
        break

      case "heads":
        // Mosaic head composition
        const faceAngle = t * Math.PI * 2
        const faceRadius = 150 + seededRandom() * 50
        const feature = Math.floor(seededRandom() * 3)
        x = centerX + Math.cos(faceAngle) * faceRadius * (1 + feature * 0.2)
        y = centerY + Math.sin(faceAngle) * faceRadius * (1 + feature * 0.1)
        break

      default:
        x = centerX + (seededRandom() - 0.5) * 600
        y = centerY + (seededRandom() - 0.5) * 600
    }

    // Apply noise
    x += (seededRandom() - 0.5) * noiseScale * 100
    y += (seededRandom() - 0.5) * noiseScale * 100

    // Create path
    if (i === 0) {
      paths.push(`M ${x} ${y}`)
    } else {
      paths.push(`L ${x} ${y}`)
    }

    // Assign color
    const colorIndex = Math.floor(seededRandom() * palette.length)
    colors.push(palette[colorIndex])
  }

  // Generate SVG
  const pathString = paths.join(" ")
  const svgContent = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          ${palette.map((color, i) => `<stop offset="${(i / (palette.length - 1)) * 100}%" style="stop-color:${color};stop-opacity:1" />`).join("")}
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="#000000"/>
      <path d="${pathString}" stroke="url(#flowGradient)" stroke-width="2" fill="none" opacity="0.8"/>
      ${paths
        .map((_, i) => {
          if (i % 10 === 0) {
            const x = centerX + (seededRandom() - 0.5) * 600
            const y = centerY + (seededRandom() - 0.5) * 600
            return `<circle cx="${x}" cy="${y}" r="${2 + seededRandom() * 3}" fill="${colors[i % colors.length]}" opacity="0.6"/>`
          }
          return ""
        })
        .join("")}
    </svg>
  `

  return svgContent
}

export function generateDomeProjection(params: DomeProjectionParams): string {
  const { width, height, fov, tilt } = params

  // Enhanced dome projection visualization with circular composition
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) / 2 - 20

  // Create concentric circles for dome effect
  const circles = []
  for (let i = 1; i <= 5; i++) {
    const r = (radius * i) / 5
    circles.push(
      `<circle cx="${centerX}" cy="${centerY}" r="${r}" fill="none" stroke="#4a90e2" stroke-width="1" opacity="${0.3 - i * 0.05}"/>`,
    )
  }

  // Add radial lines for dome grid
  const lines = []
  for (let angle = 0; angle < 360; angle += 30) {
    const radian = (angle * Math.PI) / 180
    const x1 = centerX + Math.cos(radian) * (radius * 0.2)
    const y1 = centerY + Math.sin(radian) * (radius * 0.2)
    const x2 = centerX + Math.cos(radian) * radius
    const y2 = centerY + Math.sin(radian) * radius
    lines.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#4a90e2" stroke-width="1" opacity="0.2"/>`)
  }

  const svgContent = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="domeGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.9" />
          <stop offset="30%" style="stop-color:#4a90e2;stop-opacity:0.6" />
          <stop offset="70%" style="stop-color:#2c5aa0;stop-opacity:0.4" />
          <stop offset="100%" style="stop-color:#1a365d;stop-opacity:0.2" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="#000011"/>
      
      <!-- Dome grid -->
      ${circles.join("")}
      ${lines.join("")}
      
      <!-- Main dome circle -->
      <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="url(#domeGradient)" stroke="#4a90e2" stroke-width="3" filter="url(#glow)"/>
      
      <!-- Center point -->
      <circle cx="${centerX}" cy="${centerY}" r="5" fill="#ffffff" opacity="0.8"/>
      
      <!-- Dome info -->
      <text x="${centerX}" y="${centerY + radius + 30}" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="16" font-weight="bold">
        ${fov}° Dome Projection
      </text>
      <text x="${centerX}" y="${centerY + radius + 50}" text-anchor="middle" fill="#4a90e2" font-family="Arial" font-size="12">
        Optimized for Planetarium Display
      </text>
    </svg>
  `

  return svgContent
}
