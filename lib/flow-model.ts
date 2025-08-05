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

// Color palette definitions
const colorPalettes: Record<string, string[]> = {
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
  quantum: ["#000428", "#004e92", "#009ffd", "#00d2ff", "#ffffff"],
  cosmic: ["#2c1810", "#8b4513", "#ff6347", "#ffa500", "#ffff00", "#ffffff"],
  thermal: ["#000000", "#440154", "#31688e", "#35b779", "#fde725"],
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
  crystalline: ["#1a1a2e", "#16213e", "#0f3460", "#533483", "#7209b7", "#a663cc"],
  bioluminescent: ["#0c0c0c", "#1a4c96", "#0066cc", "#00ccff", "#66ffcc", "#ccffcc"],
  aurora: ["#0d1b2a", "#415a77", "#778da9", "#e0e1dd", "#a8dadc", "#457b9d"],
  metallic: ["#2c2c2c", "#4a4a4a", "#696969", "#a9a9a9", "#c0c0c0", "#f5f5f5"],
  prismatic: ["#ff0080", "#ff8000", "#ffff00", "#80ff00", "#00ff80", "#0080ff"],
  monochromatic: ["#000000", "#333333", "#666666", "#999999", "#cccccc", "#ffffff"],
  infrared: ["#000000", "#8b0000", "#ff0000", "#ff6347", "#ffa500", "#ffff00"],
  lava: ["#1a0000", "#660000", "#cc0000", "#ff3300", "#ff6600", "#ffcc00"],
  futuristic: ["#0a0a0a", "#1a1a2e", "#16213e", "#0f3460", "#533483", "#7209b7"],
  forest: ["#0b2818", "#1e5128", "#4e9f3d", "#8bc34a", "#cddc39", "#ffeb3b"],
  ocean: ["#001f3f", "#0074d9", "#39cccc", "#2ecc40", "#01ff70", "#ffffff"],
  sunset: ["#ff6b35", "#f7931e", "#ffd23f", "#5d2e5d", "#1fb3d3", "#ffffff"],
  arctic: ["#e6f3ff", "#b3d9ff", "#80bfff", "#4da6ff", "#1a8cff", "#0066cc"],
  neon: ["#ff00ff", "#00ffff", "#ffff00", "#ff0080", "#8000ff", "#00ff80"],
  vintage: ["#8b4513", "#daa520", "#cd853f", "#f4a460", "#ffefd5", "#fff8dc"],
  toxic: ["#32cd32", "#7fff00", "#adff2f", "#9acd32", "#6b8e23", "#556b2f"],
  ember: ["#2c0703", "#8b1538", "#dc143c", "#ff6347", "#ffa500", "#ffd700"],
  lunar: ["#1c1c1c", "#4a4a4a", "#808080", "#c0c0c0", "#e6e6e6", "#ffffff"],
  tidal: ["#003366", "#0066cc", "#3399ff", "#66ccff", "#99e6ff", "#ccf5ff"],
}

// 8bit pattern generator
function generate8bitPattern(
  params: GenerationParams,
  rng: SeededRandom,
): Array<{ x: number; y: number; color: string; size: number; type: string }> {
  const points: Array<{ x: number; y: number; color: string; size: number; type: string }> = []
  const palette = colorPalettes[params.colorScheme] || colorPalettes.plasma

  // 8bit specific color limitations - reduce to 16 colors max
  const limitedPalette = palette.slice(0, 16)

  for (let i = 0; i < params.numSamples; i++) {
    const t = i / params.numSamples

    let elementType = "pixel"
    let x: number, y: number, size: number

    // Snap to pixel grid for authentic 8bit feel
    const pixelSize = 8
    const gridWidth = Math.floor(800 / pixelSize)
    const gridHeight = Math.floor(600 / pixelSize)

    switch (params.scenario) {
      case "retro-arcade":
        // Classic arcade game layout
        const spriteX = Math.floor(rng.next() * gridWidth) * pixelSize
        const spriteY = Math.floor(rng.next() * gridHeight) * pixelSize
        x = spriteX
        y = spriteY
        elementType = i < params.numSamples * 0.1 ? "player-sprite" : "background-pixel"
        size = pixelSize
        break

      case "cyberpunk-8bit":
        // Neon-lit cityscape with pixel buildings
        if (i < params.numSamples * 0.3) {
          // Buildings
          x = Math.floor(rng.next() * gridWidth) * pixelSize
          y = Math.floor(rng.next() * (gridHeight * 0.7)) * pixelSize + gridHeight * 0.3 * pixelSize
          elementType = "building-pixel"
          size = pixelSize
        } else {
          // Neon effects
          x = Math.floor(rng.next() * gridWidth) * pixelSize
          y = Math.floor(rng.next() * gridHeight) * pixelSize
          elementType = "neon-pixel"
          size = pixelSize / 2
        }
        break

      case "fantasy-quest":
        // RPG world with castles and dungeons
        if (i < params.numSamples * 0.05) {
          // Castle structures
          x = 200 + Math.floor(rng.next() * 20) * pixelSize
          y = 100 + Math.floor(rng.next() * 15) * pixelSize
          elementType = "castle-pixel"
          size = pixelSize * 2
        } else {
          // Terrain
          x = Math.floor(rng.next() * gridWidth) * pixelSize
          y = Math.floor(rng.next() * gridHeight) * pixelSize
          elementType = "terrain-pixel"
          size = pixelSize
        }
        break

      case "space-adventure":
        // Retro space shooter
        if (i < params.numSamples * 0.1) {
          // Spaceships
          x = Math.floor(rng.next() * gridWidth) * pixelSize
          y = Math.floor(rng.next() * (gridHeight * 0.5)) * pixelSize
          elementType = "spaceship-pixel"
          size = pixelSize * 1.5
        } else {
          // Stars and space
          x = Math.floor(rng.next() * gridWidth) * pixelSize
          y = Math.floor(rng.next() * gridHeight) * pixelSize
          elementType = "star-pixel"
          size = pixelSize / 2
        }
        break

      case "ocean-depths":
        // Underwater pixel world
        const waveY = Math.sin(i * 0.1) * 20 + 100
        x = Math.floor(rng.next() * gridWidth) * pixelSize
        y = Math.floor((waveY + rng.next() * 400) / pixelSize) * pixelSize
        elementType = y < 200 ? "surface-pixel" : "underwater-pixel"
        size = pixelSize
        break

      case "desert-wasteland":
        // Post-apocalyptic desert
        x = Math.floor(rng.next() * gridWidth) * pixelSize
        y = Math.floor((300 + rng.next() * 300) / pixelSize) * pixelSize
        elementType = "desert-pixel"
        size = pixelSize
        break

      case "magical-forest":
        // Enchanted woodland
        if (i < params.numSamples * 0.2) {
          // Trees
          x = Math.floor(rng.next() * gridWidth) * pixelSize
          y = Math.floor(rng.next() * (gridHeight * 0.8)) * pixelSize
          elementType = "tree-pixel"
          size = pixelSize * 2
        } else {
          // Forest floor
          x = Math.floor(rng.next() * gridWidth) * pixelSize
          y = Math.floor((400 + rng.next() * 200) / pixelSize) * pixelSize
          elementType = "forest-pixel"
          size = pixelSize
        }
        break

      case "steampunk-city":
        // Industrial steampunk
        if (i < params.numSamples * 0.4) {
          // Buildings and machinery
          x = Math.floor(rng.next() * gridWidth) * pixelSize
          y = Math.floor(rng.next() * (gridHeight * 0.8)) * pixelSize + gridHeight * 0.2 * pixelSize
          elementType = "steampunk-pixel"
          size = pixelSize
        } else {
          // Steam and smoke
          x = Math.floor(rng.next() * gridWidth) * pixelSize
          y = Math.floor(rng.next() * (gridHeight * 0.5)) * pixelSize
          elementType = "steam-pixel"
          size = pixelSize / 2
        }
        break

      case "neon-nights":
        // 80s synthwave
        if (i < params.numSamples * 0.3) {
          // Grid lines
          x = i % 2 === 0 ? Math.floor(rng.next() * gridWidth) * pixelSize : Math.floor(rng.next() * 10) * pixelSize * 8
          y =
            i % 2 === 0 ? Math.floor(rng.next() * 10) * pixelSize * 6 : Math.floor(rng.next() * gridHeight) * pixelSize
          elementType = "grid-pixel"
          size = pixelSize / 4
        } else {
          // Neon elements
          x = Math.floor(rng.next() * gridWidth) * pixelSize
          y = Math.floor(rng.next() * gridHeight) * pixelSize
          elementType = "synthwave-pixel"
          size = pixelSize
        }
        break

      case "pixel-dungeon":
        // Dark dungeon
        const roomX = Math.floor(i / 100) % 4
        const roomY = Math.floor(i / 400)
        x = roomX * 200 + Math.floor(rng.next() * 25) * pixelSize
        y = roomY * 150 + Math.floor(rng.next() * 18) * pixelSize
        elementType = "dungeon-pixel"
        size = pixelSize
        break

      case "cosmic-shooter":
        // Space shooter
        if (i < params.numSamples * 0.15) {
          // Enemy formations
          const formationX = (i % 10) * pixelSize * 6
          const formationY = Math.floor(i / 10) * pixelSize * 4
          x = formationX + 100
          y = formationY + 50
          elementType = "enemy-pixel"
          size = pixelSize
        } else {
          // Background stars
          x = Math.floor(rng.next() * gridWidth) * pixelSize
          y = Math.floor(rng.next() * gridHeight) * pixelSize
          elementType = "space-pixel"
          size = pixelSize / 4
        }
        break

      default:
        // Default 8bit pattern
        x = Math.floor(rng.next() * gridWidth) * pixelSize
        y = Math.floor(rng.next() * gridHeight) * pixelSize
        elementType = "pixel"
        size = pixelSize
    }

    // Apply minimal noise for 8bit precision
    x += Math.sin(t * Math.PI * 2 + params.seed) * params.noiseScale * 4
    y += Math.cos(t * Math.PI * 2 + params.seed) * params.noiseScale * 4

    // Snap back to pixel grid
    x = Math.round(x / pixelSize) * pixelSize
    y = Math.round(y / pixelSize) * pixelSize

    const colorIndex = Math.floor((t + rng.next() * 0.3) * limitedPalette.length) % limitedPalette.length
    const color = limitedPalette[colorIndex]

    points.push({ x, y, color, size, type: elementType })
  }

  return points
}

// Mathematical functions for different datasets
function generateNuanuPattern(
  params: GenerationParams,
  rng: SeededRandom,
): Array<{ x: number; y: number; color: string; size: number; type: string }> {
  const points: Array<{ x: number; y: number; color: string; size: number; type: string }> = []
  const palette = colorPalettes[params.colorScheme] || colorPalettes.plasma

  // Generate Nuanu Creative City elements
  for (let i = 0; i < params.numSamples; i++) {
    const t = i / params.numSamples

    // Create different types of creative elements based on scenario
    let elementType = "creative-space"
    let x: number, y: number, size: number

    switch (params.scenario) {
      case "thk-tower":
        // Central tower with radiating creative elements
        if (i < params.numSamples * 0.1) {
          elementType = "tower"
          x = 400 + Math.cos(t * Math.PI * 2) * 50 * rng.next()
          y = 300 + Math.sin(t * Math.PI * 2) * 50 * rng.next()
          size = 8 + rng.next() * 12
        } else {
          elementType = "creative-space"
          const angle = t * Math.PI * 2 + rng.next() * 0.5
          const radius = 100 + rng.next() * 200
          x = 400 + Math.cos(angle) * radius
          y = 300 + Math.sin(angle) * radius
          size = 3 + rng.next() * 6
        }
        break

      case "popper-sentinels":
        // Guardian statues positioned strategically
        if (i < params.numSamples * 0.05) {
          elementType = "sentinel"
          x = 100 + (i % 6) * 120 + rng.next() * 40
          y = 100 + Math.floor(i / 6) * 120 + rng.next() * 40
          size = 10 + rng.next() * 8
        } else {
          elementType = "creative-space"
          x = rng.next() * 800
          y = rng.next() * 600
          size = 2 + rng.next() * 4
        }
        break

      case "luna-beach":
        // Coastal creative spaces
        elementType = i < params.numSamples * 0.3 ? "beach-pavilion" : "creative-space"
        x = rng.next() * 800
        y = 400 + Math.sin(x * 0.01) * 100 + rng.next() * 100 // Coastal curve
        size = elementType === "beach-pavilion" ? 6 + rng.next() * 8 : 2 + rng.next() * 4
        break

      case "labyrinth-dome":
        // Geodesic dome with internal patterns
        const centerX = 400,
          centerY = 300
        const domeRadius = 150
        const angle = t * Math.PI * 2 * 5 // Multiple spirals
        const radius = rng.next() * domeRadius * Math.sqrt(rng.next()) // Even distribution
        x = centerX + Math.cos(angle) * radius
        y = centerY + Math.sin(angle) * radius
        elementType = radius < domeRadius * 0.3 ? "dome-core" : "dome-element"
        size = elementType === "dome-core" ? 8 + rng.next() * 6 : 3 + rng.next() * 5
        break

      case "creative-studios":
        // Clustered studio spaces
        const clusterX = (Math.floor(i / 50) % 4) * 200 + 100
        const clusterY = Math.floor(i / 200) * 150 + 100
        x = clusterX + (rng.next() - 0.5) * 80
        y = clusterY + (rng.next() - 0.5) * 80
        elementType = "studio"
        size = 4 + rng.next() * 6
        break

      case "community-plaza":
        // Central plaza with radiating community spaces
        const plazaRadius = 120
        const communityAngle = t * Math.PI * 2
        const communityRadius = rng.next() * plazaRadius + 50
        x = 400 + Math.cos(communityAngle) * communityRadius
        y = 300 + Math.sin(communityAngle) * communityRadius
        elementType = communityRadius < 80 ? "plaza-center" : "community-space"
        size = elementType === "plaza-center" ? 6 + rng.next() * 8 : 3 + rng.next() * 5
        break

      case "digital-gardens":
        // Tech-nature integration patterns
        x = rng.next() * 800
        y = rng.next() * 600
        const techNature = Math.sin(x * 0.02) * Math.cos(y * 0.02)
        elementType = techNature > 0 ? "digital-element" : "garden-element"
        size = 3 + rng.next() * 6 + Math.abs(techNature) * 4
        break

      default: // landscape and pure
        // Overall Nuanu landscape
        x = rng.next() * 800
        y = rng.next() * 600
        elementType = "creative-space"
        size = 2 + rng.next() * 6
    }

    // Apply noise and time evolution
    x += Math.sin(t * Math.PI * 2 + params.seed) * params.noiseScale * 20
    y += Math.cos(t * Math.PI * 2 + params.seed) * params.noiseScale * 20

    const colorIndex = Math.floor((t + rng.next() * 0.3) * palette.length) % palette.length
    const color = palette[colorIndex]

    points.push({ x, y, color, size, type: elementType })
  }

  return points
}

function generateBalinesePattern(
  params: GenerationParams,
  rng: SeededRandom,
): Array<{ x: number; y: number; color: string; size: number; type: string }> {
  const points: Array<{ x: number; y: number; color: string; size: number; type: string }> = []
  const palette = colorPalettes[params.colorScheme] || colorPalettes.plasma

  // Generate Balinese cultural elements
  for (let i = 0; i < params.numSamples; i++) {
    const t = i / params.numSamples

    // Create different types of cultural elements based on scenario
    let elementType = "cultural-element"
    let x: number, y: number, size: number

    switch (params.scenario) {
      case "temples":
        // Temple complexes with sacred geometry
        if (i < params.numSamples * 0.1) {
          elementType = "temple"
          x = 200 + (i % 3) * 200 + rng.next() * 50
          y = 150 + Math.floor(i / 3) * 150 + rng.next() * 50
          size = 12 + rng.next() * 8
        } else {
          elementType = "temple-element"
          const templeX = 200 + (Math.floor(i / 100) % 3) * 200
          const templeY = 150 + Math.floor(i / 300) * 150
          x = templeX + (rng.next() - 0.5) * 100
          y = templeY + (rng.next() - 0.5) * 100
          size = 3 + rng.next() * 6
        }
        break

      case "rice-terraces":
        // Terraced landscape patterns
        const terraceLevel = Math.floor(y / 60)
        x = rng.next() * 800
        y = terraceLevel * 60 + rng.next() * 50
        elementType = "rice-terrace"
        size = 2 + rng.next() * 4
        break

      case "ceremonies":
        // Ceremonial gathering patterns
        const ceremonyX = 400,
          ceremonyY = 300
        const ceremonyRadius = 80 + rng.next() * 120
        const ceremonyAngle = t * Math.PI * 2 + rng.next() * 0.5
        x = ceremonyX + Math.cos(ceremonyAngle) * ceremonyRadius
        y = ceremonyY + Math.sin(ceremonyAngle) * ceremonyRadius
        elementType = ceremonyRadius < 100 ? "ceremony-center" : "ceremony-participant"
        size = elementType === "ceremony-center" ? 8 + rng.next() * 6 : 3 + rng.next() * 5
        break

      case "dancers":
        // Dance formation patterns
        const danceFormation = Math.floor(i / 20)
        const danceAngle = (i % 20) * ((Math.PI * 2) / 20)
        const danceRadius = 60 + (danceFormation % 3) * 40
        x = 400 + Math.cos(danceAngle) * danceRadius
        y = 300 + Math.sin(danceAngle) * danceRadius
        elementType = "dancer"
        size = 4 + rng.next() * 6
        break

      case "beaches":
        // Coastal temple and beach patterns
        x = rng.next() * 800
        y = 450 + Math.sin(x * 0.01) * 50 + rng.next() * 100
        elementType = y > 500 ? "beach-element" : "coastal-temple"
        size = elementType === "coastal-temple" ? 6 + rng.next() * 8 : 2 + rng.next() * 4
        break

      case "artisans":
        // Artisan workshop clusters
        const workshopX = (Math.floor(i / 40) % 5) * 160 + 80
        const workshopY = Math.floor(i / 200) * 120 + 100
        x = workshopX + (rng.next() - 0.5) * 60
        y = workshopY + (rng.next() - 0.5) * 60
        elementType = "artisan"
        size = 3 + rng.next() * 5
        break

      case "volcanoes":
        // Sacred mountain patterns
        const volcanoX = 400,
          volcanoY = 200
        const volcanoRadius = Math.sqrt(rng.next()) * 200
        const volcanoAngle = rng.next() * Math.PI * 2
        x = volcanoX + Math.cos(volcanoAngle) * volcanoRadius
        y = volcanoY + Math.sin(volcanoAngle) * volcanoRadius + volcanoRadius * 0.5
        elementType = volcanoRadius < 50 ? "volcano-peak" : "volcano-slope"
        size = elementType === "volcano-peak" ? 10 + rng.next() * 8 : 2 + rng.next() * 6
        break

      default: // landscape and pure
        // General Balinese landscape
        x = rng.next() * 800
        y = rng.next() * 600
        elementType = "cultural-element"
        size = 2 + rng.next() * 6
    }

    // Apply noise and time evolution
    x += Math.sin(t * Math.PI * 2 + params.seed) * params.noiseScale * 20
    y += Math.cos(t * Math.PI * 2 + params.seed) * params.noiseScale * 20

    const colorIndex = Math.floor((t + rng.next() * 0.3) * palette.length) % palette.length
    const color = palette[colorIndex]

    points.push({ x, y, color, size, type: elementType })
  }

  return points
}

function generateThaiPattern(
  params: GenerationParams,
  rng: SeededRandom,
): Array<{ x: number; y: number; color: string; size: number; type: string }> {
  const points: Array<{ x: number; y: number; color: string; size: number; type: string }> = []
  const palette = colorPalettes[params.colorScheme] || colorPalettes.plasma

  for (let i = 0; i < params.numSamples; i++) {
    const t = i / params.numSamples

    let elementType = "cultural-element"
    let x: number, y: number, size: number

    switch (params.scenario) {
      case "landscape":
        // Thai temple landscape
        if (i < params.numSamples * 0.15) {
          elementType = "temple"
          x = 150 + (i % 4) * 150 + rng.next() * 50
          y = 100 + Math.floor(i / 4) * 120 + rng.next() * 50
          size = 10 + rng.next() * 8
        } else {
          x = rng.next() * 800
          y = rng.next() * 600
          size = 2 + rng.next() * 5
        }
        break

      case "architectural":
        // Temple architecture focus
        const templeCount = 6
        const templeIndex = Math.floor(i / (params.numSamples / templeCount))
        const templeX = (templeIndex % 3) * 250 + 125
        const templeY = Math.floor(templeIndex / 3) * 200 + 150
        x = templeX + (rng.next() - 0.5) * 80
        y = templeY + (rng.next() - 0.5) * 80
        elementType = "temple-detail"
        size = 3 + rng.next() * 7
        break

      case "ceremonial":
        // Buddhist ceremony patterns
        const centerX = 400,
          centerY = 300
        const ceremonyRadius = 60 + rng.next() * 100
        const angle = t * Math.PI * 2 * 3
        x = centerX + Math.cos(angle) * ceremonyRadius
        y = centerY + Math.sin(angle) * ceremonyRadius
        elementType = "ceremony"
        size = 4 + rng.next() * 6
        break

      case "urban":
        // Bangkok street life
        x = rng.next() * 800
        y = rng.next() * 600
        elementType = "urban-element"
        size = 2 + rng.next() * 4
        break

      case "botanical":
        // Thai gardens with lotus ponds
        const gardenClusters = 4
        const clusterIndex = Math.floor(i / (params.numSamples / gardenClusters))
        const clusterX = (clusterIndex % 2) * 400 + 200
        const clusterY = Math.floor(clusterIndex / 2) * 300 + 150
        x = clusterX + (rng.next() - 0.5) * 150
        y = clusterY + (rng.next() - 0.5) * 150
        elementType = "botanical"
        size = 3 + rng.next() * 6
        break

      case "floating":
        // Floating market patterns
        x = rng.next() * 800
        y = 250 + Math.sin(x * 0.02) * 100 + rng.next() * 100
        elementType = "floating-market"
        size = 3 + rng.next() * 5
        break

      case "monks":
        // Monk procession patterns
        const processionPath = t * 800
        x = processionPath % 800
        y = 300 + Math.sin(processionPath * 0.01) * 50 + rng.next() * 40
        elementType = "monk"
        size = 4 + rng.next() * 4
        break

      default:
        x = rng.next() * 800
        y = rng.next() * 600
        size = 2 + rng.next() * 6
    }

    // Apply noise and time evolution
    x += Math.sin(t * Math.PI * 2 + params.seed) * params.noiseScale * 20
    y += Math.cos(t * Math.PI * 2 + params.seed) * params.noiseScale * 20

    const colorIndex = Math.floor((t + rng.next() * 0.3) * palette.length) % palette.length
    const color = palette[colorIndex]

    points.push({ x, y, color, size, type: elementType })
  }

  return points
}

function generateStatuePattern(
  params: GenerationParams,
  rng: SeededRandom,
): Array<{ x: number; y: number; color: string; size: number; type: string }> {
  const points: Array<{ x: number; y: number; color: string; size: number; type: string }> = []
  const palette = colorPalettes[params.colorScheme] || colorPalettes.plasma

  for (let i = 0; i < params.numSamples; i++) {
    const t = i / params.numSamples

    let elementType = "statue"
    let x: number, y: number, size: number

    switch (params.scenario) {
      case "buddha":
        // Buddha statue arrangements
        if (i < params.numSamples * 0.2) {
          elementType = "buddha-statue"
          x = 200 + (i % 3) * 200 + rng.next() * 80
          y = 150 + Math.floor(i / 3) * 150 + rng.next() * 80
          size = 12 + rng.next() * 8
        } else {
          elementType = "meditation-element"
          x = rng.next() * 800
          y = rng.next() * 600
          size = 2 + rng.next() * 4
        }
        break

      case "cats":
        // Cat sculpture arrangements
        const catPositions = [
          { x: 150, y: 150 },
          { x: 400, y: 100 },
          { x: 650, y: 200 },
          { x: 200, y: 350 },
          { x: 500, y: 300 },
          { x: 700, y: 400 },
          { x: 100, y: 500 },
          { x: 350, y: 450 },
          { x: 600, y: 500 },
        ]
        if (i < catPositions.length * 20) {
          const catIndex = Math.floor(i / 20)
          const cat = catPositions[catIndex]
          x = cat.x + (rng.next() - 0.5) * 60
          y = cat.y + (rng.next() - 0.5) * 60
          elementType = i % 20 === 0 ? "cat-statue" : "cat-detail"
          size = elementType === "cat-statue" ? 8 + rng.next() * 6 : 2 + rng.next() * 4
        } else {
          x = rng.next() * 800
          y = rng.next() * 600
          elementType = "environment"
          size = 1 + rng.next() * 3
        }
        break

      case "greek":
        // Classical Greek arrangement
        const greekColumns = 5
        const columnSpacing = 800 / (greekColumns + 1)
        if (i < params.numSamples * 0.3) {
          const columnIndex = i % greekColumns
          x = columnSpacing * (columnIndex + 1) + (rng.next() - 0.5) * 40
          y = 200 + rng.next() * 200
          elementType = "greek-statue"
          size = 10 + rng.next() * 8
        } else {
          x = rng.next() * 800
          y = rng.next() * 600
          elementType = "classical-element"
          size = 2 + rng.next() * 5
        }
        break

      case "modern":
        // Modern sculpture arrangement
        const modernClusters = 4
        const clusterIndex = Math.floor(i / (params.numSamples / modernClusters))
        const clusterX = (clusterIndex % 2) * 400 + 200
        const clusterY = Math.floor(clusterIndex / 2) * 300 + 150
        x = clusterX + (rng.next() - 0.5) * 120
        y = clusterY + (rng.next() - 0.5) * 120
        elementType = "modern-sculpture"
        size = 4 + rng.next() * 8
        break

      case "angels":
        // Angelic figure arrangements
        const angelFormation = Math.floor(i / 30)
        const angelAngle = (i % 30) * ((Math.PI * 2) / 30)
        const angelRadius = 80 + (angelFormation % 3) * 50
        x = 400 + Math.cos(angelAngle) * angelRadius
        y = 300 + Math.sin(angelAngle) * angelRadius
        elementType = "angel-statue"
        size = 6 + rng.next() * 8
        break

      case "warriors":
        // Warrior statue formations
        const battleLines = 3
        const lineIndex = Math.floor(i / (params.numSamples / battleLines))
        x = (i % (params.numSamples / battleLines)) * (800 / (params.numSamples / battleLines)) + rng.next() * 40
        y = 150 + lineIndex * 150 + rng.next() * 80
        elementType = "warrior-statue"
        size = 8 + rng.next() * 6
        break

      case "animals":
        // Animal totem arrangements
        const animalTypes = 6
        const animalIndex = i % animalTypes
        const animalX = (animalIndex % 3) * 250 + 125
        const animalY = Math.floor(animalIndex / 3) * 250 + 125
        x = animalX + (rng.next() - 0.5) * 100
        y = animalY + (rng.next() - 0.5) * 100
        elementType = "animal-totem"
        size = 6 + rng.next() * 8
        break

      default: // landscape and pure
        x = rng.next() * 800
        y = rng.next() * 600
        elementType = "statue"
        size = 4 + rng.next() * 8
    }

    // Apply noise and time evolution
    x += Math.sin(t * Math.PI * 2 + params.seed) * params.noiseScale * 15
    y += Math.cos(t * Math.PI * 2 + params.seed) * params.noiseScale * 15

    const colorIndex = Math.floor((t + rng.next() * 0.3) * palette.length) % palette.length
    const color = palette[colorIndex]

    points.push({ x, y, color, size, type: elementType })
  }

  return points
}

function generateSpiralPattern(
  params: GenerationParams,
  rng: SeededRandom,
): Array<{ x: number; y: number; color: string; size: number }> {
  const points: Array<{ x: number; y: number; color: string; size: number }> = []
  const palette = colorPalettes[params.colorScheme] || colorPalettes.plasma

  for (let i = 0; i < params.numSamples; i++) {
    const t = i / params.numSamples

    // Different spiral types based on scenario
    let x: number, y: number

    switch (params.scenario) {
      case "fibonacci":
        // Fibonacci spiral with golden ratio
        const phi = (1 + Math.sqrt(5)) / 2
        const angle = (i * 2 * Math.PI) / phi
        const radius = Math.sqrt(i) * 3
        x = 400 + radius * Math.cos(angle)
        y = 300 + radius * Math.sin(angle)
        break

      case "galaxy":
        // Galactic spiral arms
        const armAngle = t * Math.PI * 8 + params.seed
        const armRadius = t * 200 + rng.next() * 20
        x = 400 + armRadius * Math.cos(armAngle)
        y = 300 + armRadius * Math.sin(armAngle)
        break

      case "nautilus":
        // Nautilus shell spiral
        const nautilusAngle = t * Math.PI * 6
        const nautilusRadius = Math.exp(nautilusAngle * 0.1) * 2
        x = 400 + nautilusRadius * Math.cos(nautilusAngle)
        y = 300 + nautilusRadius * Math.sin(nautilusAngle)
        break

      case "vortex":
        // Energy vortex
        const vortexAngle = t * Math.PI * 12 + Math.sin(t * Math.PI * 4) * 0.5
        const vortexRadius = (1 - t) * 150 + Math.sin(t * Math.PI * 8) * 20
        x = 400 + vortexRadius * Math.cos(vortexAngle)
        y = 300 + vortexRadius * Math.sin(vortexAngle)
        break

      case "logarithmic":
        // Logarithmic spiral
        const logAngle = t * Math.PI * 10
        const logRadius = Math.exp(logAngle * 0.05) * 5
        x = 400 + logRadius * Math.cos(logAngle)
        y = 300 + logRadius * Math.sin(logAngle)
        break

      default:
        // Basic spiral
        const basicAngle = t * Math.PI * 6
        const basicRadius = t * 150
        x = 400 + basicRadius * Math.cos(basicAngle)
        y = 300 + basicRadius * Math.sin(basicAngle)
    }

    // Apply noise and time evolution
    x += Math.sin(t * Math.PI * 2 + params.seed) * params.noiseScale * 20
    y += Math.cos(t * Math.PI * 2 + params.seed) * params.noiseScale * 20

    const colorIndex = Math.floor(t * palette.length) % palette.length
    const color = palette[colorIndex]
    const size = 2 + Math.sin(t * Math.PI * 4) * 3

    points.push({ x, y, color, size })
  }

  return points
}

// Additional pattern generators for other datasets...
function generateFractalPattern(
  params: GenerationParams,
  rng: SeededRandom,
): Array<{ x: number; y: number; color: string; size: number }> {
  const points: Array<{ x: number; y: number; color: string; size: number }> = []
  const palette = colorPalettes[params.colorScheme] || colorPalettes.plasma

  // L-system fractal generation
  for (let i = 0; i < params.numSamples; i++) {
    const t = i / params.numSamples

    // Fractal tree branching
    const depth = Math.floor(t * 8)
    const branchAngle = (t * Math.PI * 2 * Math.pow(2, depth)) % (Math.PI * 2)
    const branchLength = 100 / Math.pow(1.5, depth)

    let x = 400
    let y = 500

    // Build fractal path
    for (let d = 0; d <= depth; d++) {
      const angle = branchAngle + ((d * Math.PI) / 4) * (rng.next() - 0.5)
      const length = branchLength * Math.pow(0.7, d)
      x += Math.cos(angle) * length
      y -= Math.sin(angle) * length
    }

    // Apply noise
    x += Math.sin(t * Math.PI * 2 + params.seed) * params.noiseScale * 10
    y += Math.cos(t * Math.PI * 2 + params.seed) * params.noiseScale * 10

    const colorIndex = Math.floor(t * palette.length) % palette.length
    const color = palette[colorIndex]
    const size = 1 + (8 - depth) * 0.5

    points.push({ x, y, color, size })
  }

  return points
}

function generateMandelbrotPattern(
  params: GenerationParams,
  rng: SeededRandom,
): Array<{ x: number; y: number; color: string; size: number }> {
  const points: Array<{ x: number; y: number; color: string; size: number }> = []
  const palette = colorPalettes[params.colorScheme] || colorPalettes.plasma

  for (let i = 0; i < params.numSamples; i++) {
    const t = i / params.numSamples

    // Map to complex plane
    const cx = -2 + t * 3
    const cy = -1.5 + (i % 100) * 0.03

    // Mandelbrot iteration
    let zx = 0,
      zy = 0
    let iterations = 0
    const maxIterations = 50

    while (zx * zx + zy * zy < 4 && iterations < maxIterations) {
      const xtemp = zx * zx - zy * zy + cx
      zy = 2 * zx * zy + cy
      zx = xtemp
      iterations++
    }

    // Map back to screen coordinates
    const x = 200 + (cx + 2) * 100
    const y = 200 + (cy + 1.5) * 100

    const colorIndex = Math.floor((iterations / maxIterations) * palette.length) % palette.length
    const color = palette[colorIndex]
    const size = iterations < maxIterations ? 2 + iterations * 0.1 : 1

    points.push({ x, y, color, size })
  }

  return points
}

// Generic pattern generator for other datasets
function generateGenericPattern(
  params: GenerationParams,
  rng: SeededRandom,
): Array<{ x: number; y: number; color: string; size: number }> {
  const points: Array<{ x: number; y: number; color: string; size: number }> = []
  const palette = colorPalettes[params.colorScheme] || colorPalettes.plasma

  for (let i = 0; i < params.numSamples; i++) {
    const t = i / params.numSamples

    // Generate based on dataset type
    let x: number, y: number, size: number

    switch (params.dataset) {
      case "julia":
        // Julia set
        const angle = t * Math.PI * 2
        const radius = Math.sqrt(rng.next()) * 200
        x = 400 + radius * Math.cos(angle)
        y = 300 + radius * Math.sin(angle)
        size = 2 + Math.sin(angle * 4) * 2
        break

      case "lorenz":
        // Lorenz attractor
        const lorenzT = t * 100
        x = 400 + Math.sin(lorenzT * 0.1) * 150
        y = 300 + Math.cos(lorenzT * 0.07) * 100
        size = 1 + Math.abs(Math.sin(lorenzT * 0.05)) * 3
        break

      case "voronoi":
        // Voronoi diagram
        x = rng.next() * 800
        y = rng.next() * 600
        size = 2 + rng.next() * 4
        break

      case "tribes":
      case "heads":
      case "natives":
        // Organic clustering
        const clusterX = (Math.floor(i / 50) % 4) * 200 + 100
        const clusterY = Math.floor(i / 200) * 150 + 100
        x = clusterX + (rng.next() - 0.5) * 80
        y = clusterY + (rng.next() - 0.5) * 80
        size = 3 + rng.next() * 5
        break

      default:
        // Default pattern
        x = rng.next() * 800
        y = rng.next() * 600
        size = 2 + rng.next() * 4
    }

    // Apply noise and time evolution
    x += Math.sin(t * Math.PI * 2 + params.seed) * params.noiseScale * 20
    y += Math.cos(t * Math.PI * 2 + params.seed) * params.noiseScale * 20

    const colorIndex = Math.floor(t * palette.length) % palette.length
    const color = palette[colorIndex]

    points.push({ x, y, color, size })
  }

  return points
}

export function generateFlowField(params: GenerationParams): string {
  const rng = new SeededRandom(params.seed)
  let points: Array<{ x: number; y: number; color: string; size: number; type?: string }>

  // Generate points based on dataset
  switch (params.dataset) {
    case "8bit":
      points = generate8bitPattern(params, rng)
      break
    case "nuanu":
      points = generateNuanuPattern(params, rng)
      break
    case "bali":
      points = generateBalinesePattern(params, rng)
      break
    case "thailand":
      points = generateThaiPattern(params, rng)
      break
    case "statues":
      points = generateStatuePattern(params, rng)
      break
    case "spirals":
      points = generateSpiralPattern(params, rng)
      break
    case "fractal":
      points = generateFractalPattern(params, rng)
      break
    case "mandelbrot":
      points = generateMandelbrotPattern(params, rng)
      break
    default:
      points = generateGenericPattern(params, rng)
  }

  // Create SVG
  let svg = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="pointGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-opacity:1" />
      <stop offset="100%" style="stop-opacity:0.3" />
    </radialGradient>
  </defs>
  <rect width="800" height="600" fill="#000011"/>
`

  // Add points
  points.forEach((point, index) => {
    const opacity = 0.6 + Math.sin(index * 0.1) * 0.3
    svg += `  <circle cx="${point.x}" cy="${point.y}" r="${point.size}" fill="${point.color}" opacity="${opacity}" />
`
  })

  svg += `</svg>`

  return svg
}

// Enhanced dome projection utility with TUNNEL UP effect
export function generateDomeProjection(options: {
  width: number
  height: number
  fov: number
  tilt: number
}): string {
  const { width, height, fov, tilt } = options

  // Generate fisheye projection for dome with TUNNEL UP effect
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="domeTunnelGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
      <stop offset="30%" style="stop-color:#8888ff;stop-opacity:0.9" />
      <stop offset="60%" style="stop-color:#4444ff;stop-opacity:0.7" />
      <stop offset="85%" style="stop-color:#2222aa;stop-opacity:0.5" />
      <stop offset="100%" style="stop-color:#000044;stop-opacity:0.3" />
    </radialGradient>
    <filter id="tunnelBlur">
      <feGaussianBlur in="SourceGraphic" stdDeviation="1"/>
    </filter>
  </defs>
  <rect width="${width}" height="${height}" fill="#000011"/>
  
  <!-- TUNNEL UP EFFECT: Create dramatic upward tunnel perspective -->
  <circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) / 2 - 10}" 
          fill="url(#domeTunnelGradient)" 
          filter="url(#tunnelBlur)" />
`

  // Add dome-specific TUNNEL UP patterns
  const centerX = width / 2
  const centerY = height / 2
  const maxRadius = Math.min(width, height) / 2 - 20

  // Create concentric rings that create tunnel up illusion
  for (let ring = 0; ring < 8; ring++) {
    const ringRadius = (ring / 8) * maxRadius
    const ringOpacity = 0.8 - (ring / 8) * 0.6
    const ringWidth = 2 + ring * 0.5

    svg += `  <circle cx="${centerX}" cy="${centerY}" r="${ringRadius}" 
              fill="none" stroke="#ffffff" stroke-width="${ringWidth}" 
              opacity="${ringOpacity}" />
`
  }

  // Add spiral patterns that enhance tunnel up effect
  for (let i = 0; i < 1000; i++) {
    const t = i / 1000
    const spiralAngle = t * Math.PI * 2 * 12 // Multiple spiral arms
    const spiralRadius = t * maxRadius

    // Create tunnel perspective by varying size based on distance from center
    const tunnelPerspective = 1 - (spiralRadius / maxRadius) * 0.8
    const size = 1 + tunnelPerspective * 4

    const x = centerX + spiralRadius * Math.cos(spiralAngle)
    const y = centerY + spiralRadius * Math.sin(spiralAngle)

    // Only draw if within dome circle
    if (spiralRadius <= maxRadius) {
      const opacity = 0.2 + tunnelPerspective * 0.6
      svg += `  <circle cx="${x}" cy="${y}" r="${size}" fill="#ffffff" opacity="${opacity}" />
`
    }
  }

  // Add radial lines that enhance upward tunnel perspective
  for (let line = 0; line < 24; line++) {
    const lineAngle = (line / 24) * Math.PI * 2
    const x1 = centerX + Math.cos(lineAngle) * 20
    const y1 = centerY + Math.sin(lineAngle) * 20
    const x2 = centerX + Math.cos(lineAngle) * maxRadius
    const y2 = centerY + Math.sin(lineAngle) * maxRadius

    svg += `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
              stroke="#ffffff" stroke-width="1" opacity="0.3" />
`
  }

  svg += `</svg>`

  return svg
}
