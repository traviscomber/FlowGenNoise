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

export interface Point {
  x: number
  y: number
  vx?: number
  vy?: number
  color?: string
  size?: number
  opacity?: number
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

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  nextGaussian(): number {
    const u = 0.5 - this.next()
    const v = 0.5 - this.next()
    return Math.sqrt(-2.0 * Math.log(Math.abs(u))) * Math.cos(2.0 * Math.PI * v)
  }
}

// Color scheme definitions
const colorSchemes: Record<string, string[]> = {
  plasma: ["#0d0887", "#46039f", "#7201a8", "#9c179e", "#bd3786", "#d8576b", "#ed7953", "#fb9f3a", "#fdca26", "#f0f921"],
  quantum: ["#000428", "#004e92", "#009ffd", "#00d2ff", "#ffffff", "#ff0080", "#8b0000", "#4b0082", "#000428"],
  cosmic: ["#0f0f23", "#1a1a2e", "#16213e", "#0f3460", "#533483", "#7209b7", "#a663cc", "#4cc9f0", "#7209b7"],
  thermal: ["#000000", "#330000", "#660000", "#990000", "#cc0000", "#ff0000", "#ff3300", "#ff6600", "#ff9900", "#ffcc00", "#ffff00"],
  spectral: ["#9e0142", "#d53e4f", "#f46d43", "#fdae61", "#fee08b", "#e6f598", "#abdda4", "#66c2a5", "#3288bd", "#5e4fa2"],
  crystalline: ["#e8f4f8", "#d1e7dd", "#b8dbd9", "#9ecccb", "#85bcbc", "#6caaa1", "#539885", "#3a8569", "#21734d", "#086030"],
  bioluminescent: ["#0a0a0a", "#1a4a3a", "#2a6a5a", "#3a8a7a", "#4aaa9a", "#5acaba", "#6aeada", "#7afffa", "#8affff", "#9affff"],
  aurora: ["#0d1b2a", "#1b263b", "#415a77", "#778da9", "#e0e1dd", "#778da9", "#415a77", "#1b263b", "#0d1b2a"],
  metallic: ["#2c2c2c", "#3c3c3c", "#4c4c4c", "#5c5c5c", "#6c6c6c", "#7c7c7c", "#8c8c8c", "#9c9c9c", "#acacac", "#bcbcbc"],
  prismatic: ["#ff0000", "#ff8000", "#ffff00", "#80ff00", "#00ff00", "#00ff80", "#00ffff", "#0080ff", "#0000ff", "#8000ff"],
  monochromatic: ["#000000", "#1a1a1a", "#333333", "#4d4d4d", "#666666", "#808080", "#999999", "#b3b3b3", "#cccccc", "#ffffff"],
  infrared: ["#000000", "#330000", "#660000", "#990000", "#cc0000", "#ff0000", "#ff3333", "#ff6666", "#ff9999", "#ffcccc"],
  ultraviolet: ["#000000", "#1a0033", "#330066", "#4d0099", "#6600cc", "#8000ff", "#9933ff", "#b366ff", "#cc99ff", "#e6ccff"],
  neon: ["#ff00ff", "#ff0080", "#ff0040", "#ff0000", "#ff4000", "#ff8000", "#ffff00", "#80ff00", "#00ff00", "#00ff80"],
  pastel: ["#ffd1dc", "#ffb6c1", "#ffc0cb", "#ffb3ba", "#ffdfba", "#ffffba", "#baffc9", "#bae1ff", "#c9c9ff", "#e6e6fa"],
  earth: ["#8b4513", "#a0522d", "#cd853f", "#daa520", "#b8860b", "#228b22", "#32cd32", "#6b8e23", "#9acd32", "#adff2f"],
  ocean: ["#000080", "#0000cd", "#0066cc", "#0099ff", "#00ccff", "#00ffff", "#66ffff", "#99ffff", "#ccffff", "#ffffff"],
  sunset: ["#ff4500", "#ff6347", "#ff7f50", "#ffa500", "#ffb347", "#ffd700", "#ffff00", "#ffffe0", "#fffacd", "#ffffff"],
  forest: ["#013220", "#228b22", "#32cd32", "#90ee90", "#98fb98", "#00ff7f", "#00fa9a", "#40e0d0", "#48d1cc", "#afeeee"],
  volcanic: ["#000000", "#8b0000", "#b22222", "#dc143c", "#ff0000", "#ff4500", "#ff6347", "#ff7f50", "#ffa500", "#ffff00"]
}

// Get color from scheme
function getColor(scheme: string, index: number, total: number): string {
  const colors = colorSchemes[scheme] || colorSchemes.plasma
  const colorIndex = Math.floor((index / total) * (colors.length - 1))
  return colors[colorIndex]
}

// Noise function (simplified Perlin noise)
function noise(x: number, y: number, seed: number): number {
  const random = new SeededRandom(seed + Math.floor(x * 12.9898 + y * 78.233) * 43758.5453)
  return random.next() * 2 - 1
}

// Generate cellular automata patterns
function generateCellularPattern(params: GenerationParams, rng: SeededRandom): Point[] {
  const points: Point[] = []
  const { scenario, colorScheme, numSamples } = params
  
  // Grid dimensions
  const gridSize = Math.floor(Math.sqrt(numSamples))
  const cellSize = 800 / gridSize
  
  switch (scenario) {
    case "conway-life":
      return generateConwayLife(gridSize, cellSize, colorScheme, rng)
    case "rule-30":
      return generateRule30(gridSize, cellSize, colorScheme, rng)
    case "rule-110":
      return generateRule110(gridSize, cellSize, colorScheme, rng)
    case "brians-brain":
      return generateBriansBrain(gridSize, cellSize, colorScheme, rng)
    case "wireworld":
      return generateWireworld(gridSize, cellSize, colorScheme, rng)
    case "langtons-ant":
      return generateLangtonsAnt(gridSize, cellSize, colorScheme, rng)
    case "forest-fire":
      return generateForestFire(gridSize, cellSize, colorScheme, rng)
    case "majority-rule":
      return generateMajorityRule(gridSize, cellSize, colorScheme, rng)
    default:
      return generateConwayLife(gridSize, cellSize, colorScheme, rng)
  }
}

// Conway's Game of Life
function generateConwayLife(gridSize: number, cellSize: number, colorScheme: string, rng: SeededRandom): Point[] {
  const points: Point[] = []
  let grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false))
  
  // Initialize with random pattern
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      grid[i][j] = rng.next() < 0.3
    }
  }
  
  // Evolve for several generations
  for (let gen = 0; gen < 50; gen++) {
    const newGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false))
    
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const neighbors = countNeighbors(grid, i, j, gridSize)
        
        if (grid[i][j]) {
          // Cell is alive
          newGrid[i][j] = neighbors === 2 || neighbors === 3
        } else {
          // Cell is dead
          newGrid[i][j] = neighbors === 3
        }
      }
    }
    
    grid = newGrid
  }
  
  // Convert to points
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (grid[i][j]) {
        points.push({
          x: j * cellSize + cellSize / 2,
          y: i * cellSize + cellSize / 2,
          color: getColor(colorScheme, i * gridSize + j, gridSize * gridSize),
          size: cellSize * 0.8,
          opacity: 0.8
        })
      }
    }
  }
  
  return points
}

// Count living neighbors for Conway's Game of Life
function countNeighbors(grid: boolean[][], x: number, y: number, size: number): number {
  let count = 0
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue
      const nx = (x + dx + size) % size
      const ny = (y + dy + size) % size
      if (grid[nx][ny]) count++
    }
  }
  return count
}

// Rule 30 Elementary Cellular Automaton
function generateRule30(gridSize: number, cellSize: number, colorScheme: string, rng: SeededRandom): Point[] {
  const points: Point[] = []
  const generations = gridSize
  let currentRow = Array(gridSize).fill(false)
  
  // Initialize with single cell in center
  currentRow[Math.floor(gridSize / 2)] = true
  
  for (let gen = 0; gen < generations; gen++) {
    // Add current row to points
    for (let i = 0; i < gridSize; i++) {
      if (currentRow[i]) {
        points.push({
          x: i * cellSize + cellSize / 2,
          y: gen * cellSize + cellSize / 2,
          color: getColor(colorScheme, gen, generations),
          size: cellSize * 0.9,
          opacity: 0.8
        })
      }
    }
    
    // Generate next row using Rule 30
    const nextRow = Array(gridSize).fill(false)
    for (let i = 0; i < gridSize; i++) {
      const left = currentRow[(i - 1 + gridSize) % gridSize]
      const center = currentRow[i]
      const right = currentRow[(i + 1) % gridSize]
      
      // Rule 30: 111->0, 110->0, 101->0, 100->1, 011->1, 010->1, 001->1, 000->0
      const pattern = (left ? 4 : 0) + (center ? 2 : 0) + (right ? 1 : 0)
      nextRow[i] = [false, true, true, true, true, false, false, false][pattern]
    }
    
    currentRow = nextRow
  }
  
  return points
}

// Rule 110 Elementary Cellular Automaton
function generateRule110(gridSize: number, cellSize: number, colorScheme: string, rng: SeededRandom): Point[] {
  const points: Point[] = []
  const generations = gridSize
  let currentRow = Array(gridSize).fill(false)
  
  // Initialize with random pattern
  for (let i = 0; i < gridSize; i++) {
    currentRow[i] = rng.next() < 0.1
  }
  
  for (let gen = 0; gen < generations; gen++) {
    // Add current row to points
    for (let i = 0; i < gridSize; i++) {
      if (currentRow[i]) {
        points.push({
          x: i * cellSize + cellSize / 2,
          y: gen * cellSize + cellSize / 2,
          color: getColor(colorScheme, gen, generations),
          size: cellSize * 0.9,
          opacity: 0.8
        })
      }
    }
    
    // Generate next row using Rule 110
    const nextRow = Array(gridSize).fill(false)
    for (let i = 0; i < gridSize; i++) {
      const left = currentRow[(i - 1 + gridSize) % gridSize]
      const center = currentRow[i]
      const right = currentRow[(i + 1) % gridSize]
      
      // Rule 110: 111->0, 110->1, 101->1, 100->0, 011->1, 010->1, 001->1, 000->0
      const pattern = (left ? 4 : 0) + (center ? 2 : 0) + (right ? 1 : 0)
      nextRow[i] = [false, true, true, true, false, true, true, false][pattern]
    }
    
    currentRow = nextRow
  }
  
  return points
}

// Brian's Brain (3-state cellular automaton)
function generateBriansBrain(gridSize: number, cellSize: number, colorScheme: string, rng: SeededRandom): Point[] {
  const points: Point[] = []
  // 0 = ready, 1 = firing, 2 = refractory
  let grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0))
  
  // Initialize with random firing cells
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (rng.next() < 0.1) grid[i][j] = 1
    }
  }
  
  // Evolve for several generations
  for (let gen = 0; gen < 100; gen++) {
    const newGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0))
    
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const firingNeighbors = countFiringNeighbors(grid, i, j, gridSize)
        
        if (grid[i][j] === 0) {
          // Ready cell fires if exactly 2 neighbors are firing
          newGrid[i][j] = firingNeighbors === 2 ? 1 : 0
        } else if (grid[i][j] === 1) {
          // Firing cell becomes refractory
          newGrid[i][j] = 2
        } else {
          // Refractory cell becomes ready
          newGrid[i][j] = 0
        }
      }
    }
    
    grid = newGrid
  }
  
  // Convert to points
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (grid[i][j] > 0) {
        const intensity = grid[i][j] === 1 ? 1.0 : 0.5
        points.push({
          x: j * cellSize + cellSize / 2,
          y: i * cellSize + cellSize / 2,
          color: getColor(colorScheme, i * gridSize + j, gridSize * gridSize),
          size: cellSize * 0.8,
          opacity: intensity
        })
      }
    }
  }
  
  return points
}

// Count firing neighbors for Brian's Brain
function countFiringNeighbors(grid: number[][], x: number, y: number, size: number): number {
  let count = 0
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue
      const nx = (x + dx + size) % size
      const ny = (y + dy + size) % size
      if (grid[nx][ny] === 1) count++
    }
  }
  return count
}

// Wireworld (4-state cellular automaton)
function generateWireworld(gridSize: number, cellSize: number, colorScheme: string, rng: SeededRandom): Point[] {
  const points: Point[] = []
  // 0 = empty, 1 = conductor, 2 = electron head, 3 = electron tail
  let grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0))
  
  // Create some wire patterns
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (rng.next() < 0.3) grid[i][j] = 1 // conductor
      if (rng.next() < 0.05) grid[i][j] = 2 // electron head
    }
  }
  
  // Evolve for several generations
  for (let gen = 0; gen < 50; gen++) {
    const newGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0))
    
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const electronHeads = countElectronHeads(grid, i, j, gridSize)
        
        if (grid[i][j] === 0) {
          // Empty stays empty
          newGrid[i][j] = 0
        } else if (grid[i][j] === 1) {
          // Conductor becomes electron head if 1 or 2 electron head neighbors
          newGrid[i][j] = (electronHeads === 1 || electronHeads === 2) ? 2 : 1
        } else if (grid[i][j] === 2) {
          // Electron head becomes electron tail
          newGrid[i][j] = 3
        } else {
          // Electron tail becomes conductor
          newGrid[i][j] = 1
        }
      }
    }
    
    grid = newGrid
  }
  
  // Convert to points
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (grid[i][j] > 0) {
        const stateColors = ['#000000', '#888888', '#ffff00', '#ff0000']
        points.push({
          x: j * cellSize + cellSize / 2,
          y: i * cellSize + cellSize / 2,
          color: stateColors[grid[i][j]],
          size: cellSize * 0.8,
          opacity: 0.8
        })
      }
    }
  }
  
  return points
}

// Count electron heads for Wireworld
function countElectronHeads(grid: number[][], x: number, y: number, size: number): number {
  let count = 0
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue
      const nx = (x + dx + size) % size
      const ny = (y + dy + size) % size
      if (grid[nx][ny] === 2) count++
    }
  }
  return count
}

// Langton's Ant
function generateLangtonsAnt(gridSize: number, cellSize: number, colorScheme: string, rng: SeededRandom): Point[] {
  const points: Point[] = []
  const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false))
  
  // Ant position and direction
  let antX = Math.floor(gridSize / 2)
  let antY = Math.floor(gridSize / 2)
  let direction = 0 // 0=up, 1=right, 2=down, 3=left
  
  // Run ant for many steps
  for (let step = 0; step < gridSize * gridSize; step++) {
    // Turn based on current cell
    if (grid[antY][antX]) {
      direction = (direction + 1) % 4 // Turn right
    } else {
      direction = (direction + 3) % 4 // Turn left
    }
    
    // Flip current cell
    grid[antY][antX] = !grid[antY][antX]
    
    // Move forward
    switch (direction) {
      case 0: antY = (antY - 1 + gridSize) % gridSize; break
      case 1: antX = (antX + 1) % gridSize; break
      case 2: antY = (antY + 1) % gridSize; break
      case 3: antX = (antX - 1 + gridSize) % gridSize; break
    }
  }
  
  // Convert to points
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (grid[i][j]) {
        points.push({
          x: j * cellSize + cellSize / 2,
          y: i * cellSize + cellSize / 2,
          color: getColor(colorScheme, i * gridSize + j, gridSize * gridSize),
          size: cellSize * 0.8,
          opacity: 0.8
        })
      }
    }
  }
  
  return points
}

// Forest Fire Model
function generateForestFire(gridSize: number, cellSize: number, colorScheme: string, rng: SeededRandom): Point[] {
  const points: Point[] = []
  // 0 = empty, 1 = tree, 2 = burning
  let grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0))
  
  // Initialize with trees
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (rng.next() < 0.6) grid[i][j] = 1
    }
  }
  
  // Start some fires
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (grid[i][j] === 1 && rng.next() < 0.01) grid[i][j] = 2
    }
  }
  
  // Evolve fire spread
  for (let gen = 0; gen < 100; gen++) {
    const newGrid = grid.map(row => [...row])
    
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (grid[i][j] === 0) {
          // Empty land grows tree with probability
          if (rng.next() < 0.01) newGrid[i][j] = 1
        } else if (grid[i][j] === 1) {
          // Tree catches fire from burning neighbors or lightning
          const burningNeighbors = countBurningNeighbors(grid, i, j, gridSize)
          if (burningNeighbors > 0 || rng.next() < 0.0001) {
            newGrid[i][j] = 2
          }
        } else {
          // Burning tree becomes empty
          newGrid[i][j] = 0
        }
      }
    }
    
    grid = newGrid
  }
  
  // Convert to points
  const stateColors = ['#8B4513', '#228B22', '#FF4500'] // brown, green, orange
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (grid[i][j] > 0) {
        points.push({
          x: j * cellSize + cellSize / 2,
          y: i * cellSize + cellSize / 2,
          color: stateColors[grid[i][j]],
          size: cellSize * 0.8,
          opacity: 0.8
        })
      }
    }
  }
  
  return points
}

// Count burning neighbors for forest fire
function countBurningNeighbors(grid: number[][], x: number, y: number, size: number): number {
  let count = 0
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue
      const nx = (x + dx + size) % size
      const ny = (y + dy + size) % size
      if (grid[nx][ny] === 2) count++
    }
  }
  return count
}

// Majority Rule
function generateMajorityRule(gridSize: number, cellSize: number, colorScheme: string, rng: SeededRandom): Point[] {
  const points: Point[] = []
  let grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false))
  
  // Initialize with random states
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      grid[i][j] = rng.next() < 0.5
    }
  }
  
  // Evolve using majority rule
  for (let gen = 0; gen < 50; gen++) {
    const newGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false))
    
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const trueNeighbors = countTrueNeighbors(grid, i, j, gridSize)
        const totalNeighbors = 8
        
        // Adopt majority state of neighborhood
        newGrid[i][j] = trueNeighbors > totalNeighbors / 2
      }
    }
    
    grid = newGrid
  }
  
  // Convert to points
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (grid[i][j]) {
        points.push({
          x: j * cellSize + cellSize / 2,
          y: i * cellSize + cellSize / 2,
          color: getColor(colorScheme, i * gridSize + j, gridSize * gridSize),
          size: cellSize * 0.8,
          opacity: 0.8
        })
      }
    }
  }
  
  return points
}

// Count true neighbors for majority rule
function countTrueNeighbors(grid: boolean[][], x: number, y: number, size: number): number {
  let count = 0
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue
      const nx = (x + dx + size) % size
      const ny = (y + dy + size) % size
      if (grid[nx][ny]) count++
    }
  }
  return count
}

// Generate flow field based on dataset and scenario
export function generateFlowField(params: GenerationParams): string {
  const { dataset, scenario, colorScheme, seed, numSamples, noiseScale, timeStep } = params
  const rng = new SeededRandom(seed)
  
  let points: Point[] = []
  
  switch (dataset) {
    case "cellular":
      points = generateCellularPattern(params, rng)
      break
      
    case "spirals":
      points = generateSpiralPattern(params, rng)
      break
      
    case "fractal":
      points = generateFractalPattern(params, rng)
      break
      
    case "mandelbrot":
      points = generateMandelbrotSet(params, rng)
      break
      
    case "julia":
      points = generateJuliaSet(params, rng)
      break
      
    case "lorenz":
      points = generateLorenzAttractor(params, rng)
      break
      
    case "hyperbolic":
      points = generateHyperbolicPattern(params, rng)
      break
      
    case "gaussian":
      points = generateGaussianField(params, rng)
      break
      
    case "voronoi":
      points = generateVoronoiDiagram(params, rng)
      break
      
    case "perlin":
      points = generatePerlinNoise(params, rng)
      break
      
    case "diffusion":
      points = generateReactionDiffusion(params, rng)
      break
      
    case "wave":
      points = generateWaveInterference(params, rng)
      break
      
    default:
      // Default to simple flow field
      points = generateSimpleFlowField(params, rng)
      break
  }
  
  // Generate SVG
  const svgElements = points.map(point => {
    const color = point.color || getColor(colorScheme, Math.floor(point.x + point.y), numSamples)
    const size = point.size || 2
    const opacity = point.opacity || 0.7
    
    return `<circle cx="${point.x}" cy="${point.y}" r="${size}" fill="${color}" opacity="${opacity}" />`
  }).join('\n')
  
  return `<svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="800" fill="#000000"/>
    ${svgElements}
  </svg>`
}

// Simple flow field generator (fallback)
function generateSimpleFlowField(params: GenerationParams, rng: SeededRandom): Point[] {
  const points: Point[] = []
  const { numSamples, noiseScale, timeStep } = params
  
  for (let i = 0; i < numSamples; i++) {
    const x = rng.next() * 800
    const y = rng.next() * 800
    
    // Simple flow based on position
    const angle = noise(x * noiseScale, y * noiseScale, rng.seed) * Math.PI * 2
    const vx = Math.cos(angle) * timeStep * 100
    const vy = Math.sin(angle) * timeStep * 100
    
    points.push({
      x: x + vx,
      y: y + vy,
      vx,
      vy
    })
  }
  
  return points
}

// Placeholder functions for other patterns (implement as needed)
function generateSpiralPattern(params: GenerationParams, rng: SeededRandom): Point[] {
  const points: Point[] = []
  const { numSamples, colorScheme } = params
  
  for (let i = 0; i < numSamples; i++) {
    const t = (i / numSamples) * Math.PI * 20
    const r = t * 2
    const x = 400 + r * Math.cos(t)
    const y = 400 + r * Math.sin(t)
    
    if (x >= 0 && x <= 800 && y >= 0 && y <= 800) {
      points.push({
        x,
        y,
        color: getColor(colorScheme, i, numSamples),
        size: 2,
        opacity: 0.7
      })
    }
  }
  
  return points
}

function generateFractalPattern(params: GenerationParams, rng: SeededRandom): Point[] {
  // Implement fractal generation
  return generateSimpleFlowField(params, rng)
}

function generateMandelbrotSet(params: GenerationParams, rng: SeededRandom): Point[] {
  // Implement Mandelbrot set generation
  return generateSimpleFlowField(params, rng)
}

function generateJuliaSet(params: GenerationParams, rng: SeededRandom): Point[] {
  // Implement Julia set generation
  return generateSimpleFlowField(params, rng)
}

function generateLorenzAttractor(params: GenerationParams, rng: SeededRandom): Point[] {
  // Implement Lorenz attractor generation
  return generateSimpleFlowField(params, rng)
}

function generateHyperbolicPattern(params: GenerationParams, rng: SeededRandom): Point[] {
  // Implement hyperbolic geometry generation
  return generateSimpleFlowField(params, rng)
}

function generateGaussianField(params: GenerationParams, rng: SeededRandom): Point[] {
  // Implement Gaussian field generation
  return generateSimpleFlowField(params, rng)
}

function generateVoronoiDiagram(params: GenerationParams, rng: SeededRandom): Point[] {
  // Implement Voronoi diagram generation
  return generateSimpleFlowField(params, rng)
}

function generatePerlinNoise(params: GenerationParams, rng: SeededRandom): Point[] {
  // Implement Perlin noise visualization
  return generateSimpleFlowField(params, rng)
}

function generateReactionDiffusion(params: GenerationParams, rng: SeededRandom): Point[] {
  // Implement reaction-diffusion system
  return generateSimpleFlowField(params, rng)
}

function generateWaveInterference(params: GenerationParams, rng: SeededRandom): Point[] {
  // Implement wave interference patterns
  return generateSimpleFlowField(params, rng)
}

// Dome projection generator
export function generateDomeProjection(params: { width: number; height: number; fov: number; tilt: number }): string {
  const { width, height, fov, tilt } = params
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) / 2 * 0.9
  
  // Generate dome projection pattern
  const elements: string[] = []
  
  // Create concentric circles for dome effect
  for (let r = 0; r < radius; r += 20) {
    const opacity = 1 - (r / radius) * 0.7
    elements.push(`<circle cx="${centerX}" cy="${centerY}" r="${r}" fill="none" stroke="#ffffff" stroke-width="1" opacity="${opacity}" />`)
  }
  
  // Add radial lines
  for (let angle = 0; angle < 360; angle += 30) {
    const rad = (angle * Math.PI) / 180
    const x2 = centerX + radius * Math.cos(rad)
    const y2 = centerY + radius * Math.sin(rad)
    elements.push(`<line x1="${centerX}" y1="${centerY}" x2="${x2}" y2="${y2}" stroke="#ffffff" stroke-width="1" opacity="0.3" />`)
  }
  
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="#000000"/>
    ${elements.join('\n')}
  </svg>`
}
