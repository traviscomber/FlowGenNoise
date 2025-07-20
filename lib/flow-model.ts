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

// Color palettes
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

// Helper that picks a colour based on index
function paletteColor(palette: readonly string[], idx: number): string {
  return palette[idx % palette.length]
}

// Seeded random number generator for consistent results
function seededRandom(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

// Simplified noise function
function simplexNoise(x: number, y: number, seed: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453
  return (n - Math.floor(n)) * 2 - 1
}

function generateAizawaAttractor(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  let x = 0.1
  let y = 0
  let z = 0
  const a = 0.95
  const b = 0.7
  const c = 0.6
  const d = 3.5
  const e = 0.25
  const f = 0.1
  const dt = 0.01
  const scale = 150

  let path = `M ${size / 2} ${size / 2}`

  for (let i = 0; i < params.numSamples; i++) {
    const dx = (z - b) * x - d * y
    const dy = d * x + (z - b) * y
    const dz = c + a * z - (z * z * z) / 3 - (x * x + y * y) * (1 + e * z) + f * z * x * x * x
    x += dx * dt
    y += dy * dt
    z += dz * dt

    const px = size / 2 + x * scale
    const py = size / 2 + y * scale

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

function generateThomasAttractor(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  let x = 0.1
  let y = 0
  let z = 0
  const b = 0.19
  const dt = 0.02
  const scale = 150

  let path = `M ${size / 2} ${size / 2}`

  for (let i = 0; i < params.numSamples; i++) {
    const dx = Math.sin(y) - b * x
    const dy = Math.sin(z) - b * y
    const dz = Math.sin(x) - b * z
    x += dx * dt
    y += dy * dt
    z += dz * dt

    const px = size / 2 + x * scale
    const py = size / 2 + y * scale

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

function generateDadrasAttractor(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  let x = 0.1
  let y = 0
  let z = 0
  const a = 1.56
  const b = 0.1
  const c = 4.2
  const d = 1.0
  const e = 1.0
  const dt = 0.01
  const scale = 80

  let path = `M ${size / 2} ${size / 2}`

  for (let i = 0; i < params.numSamples; i++) {
    const dx = y - a * x + b * y * z
    const dy = c * y - x * z + z
    const dz = d * x * y - e * z
    x += dx * dt
    y += dy * dt
    z += dz * dt

    const px = size / 2 + x * scale
    const py = size / 2 + y * scale

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

function generateChenAttractor(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  let x = 0.1
  let y = 0
  let z = 0
  const a = 36
  const b = 3
  const c = 28
  const dt = 0.005
  const scale = 10

  let path = `M ${size / 2} ${size / 2}`

  for (let i = 0; i < params.numSamples; i++) {
    const dx = a * (y - x) * dt
    const dy = (c - a) * x - x * z + c * y * dt
    const dz = x * y - b * z * dt
    x += dx
    y += dy
    z += dz

    const px = size / 2 + x * scale
    const py = size / 2 + y * scale

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

function generateRabinovichFabrikant(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  let x = 0.1
  let y = 0
  let z = 0
  const a = 0.14
  const b = 0.1
  const dt = 0.02
  const scale = 150

  let path = `M ${size / 2} ${size / 2}`

  for (let i = 0; i < params.numSamples; i++) {
    const dx = (y * (z - 1) + a * x) * dt
    const dy = (-x * (z - 1) + a * y) * dt
    const dz = (1 - z + x * y - b * (x * x) - b * (y * y)) * dt
    x += dx
    y += dy
    z += dz

    const px = size / 2 + x * scale
    const py = size / 2 + y * scale

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

function generateSprottAttractor(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  let x = 0.1
  let y = 0
  let z = 0
  const a = 0.4
  const dt = 0.02
  const scale = 150

  let path = `M ${size / 2} ${size / 2}`

  for (let i = 0; i < params.numSamples; i++) {
    const dx = y
    const dy = -x + y * z
    const dz = a - y * y
    x += dx * dt
    y += dy * dt
    z += dz * dt

    const px = size / 2 + x * scale
    const py = size / 2 + y * scale

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

function generateFourWingAttractor(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  let x = 0.1
  let y = 0
  let z = 0
  const a = 0.2
  const b = 0.01
  const c = -1.0
  const dt = 0.01
  const scale = 150

  let path = `M ${size / 2} ${size / 2}`

  for (let i = 0; i < params.numSamples; i++) {
    const dx = a * x + y * z
    const dy = b * x - x * z
    const dz = c * z + x * y
    x += dx * dt
    y += dy * dt
    z += dz * dt

    const px = size / 2 + x * scale
    const py = size / 2 + y * scale

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

function generateNewtonFractal(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const maxIterations = 50
  const zoom = 150
  const centerX = size / 2
  const centerY = size / 2

  for (let px = 0; px < size; px += 2) {
    for (let py = 0; py < size; py += 2) {
      let x = (px - centerX) / zoom
      let y = (py - centerY) / zoom

      for (let i = 0; i < maxIterations; i++) {
        const x2 = x * x
        const y2 = y * y
        const x3 = x2 * x
        const y3 = y2 * y

        const denominator = 4 * (x2 + y2) * (x2 + y2)
        if (denominator === 0) break

        const newX = (2 * x3 - 2 * x + 2 * x * y2) / denominator
        const newY = (-2 * y3 + 2 * y - 2 * x2 * y) / denominator

        x -= newX
        y -= newY

        if (newX * newX + newY * newY < 0.0001) {
          const colorIndex = i % colours.length
          const opacity = 1 - i / maxIterations
          pathParts.push(
            `<rect x="${px}" y="${py}" width="2" height="2" fill="${colours[colorIndex]}" opacity="${opacity}"/>`,
          )
          break
        }
      }
    }
  }
}

function generateBurningShip(
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
      const x0 = (px - centerX) / zoom
      const y0 = (py - centerY) / zoom
      let x = 0
      let y = 0
      let iteration = 0

      while (x * x + y * y <= 4 && iteration < maxIterations) {
        const xtemp = x * x - y * y + x0
        y = Math.abs(2 * x * y) + y0
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

function generateTricorn(
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
      const x0 = (px - centerX) / zoom
      const y0 = (py - centerY) / zoom
      let x = 0
      let y = 0
      let iteration = 0

      while (x * x + y * y <= 4 && iteration < maxIterations) {
        const xtemp = x * x - y * y + x0
        y = -2 * x * y + y0
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

function generateMultibrot(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const power = 3 // Adjust for different Multibrot sets
  const maxIterations = 100
  const zoom = 200
  const centerX = size / 2
  const centerY = size / 2

  for (let px = 0; px < size; px += 2) {
    for (let py = 0; py < size; py += 2) {
      const x0 = (px - centerX) / zoom
      const y0 = (py - centerY) / zoom
      let x = 0
      let y = 0
      let iteration = 0

      while (x * x + y * y <= 4 && iteration < maxIterations) {
        let xtemp = x
        let ytemp = y

        // Complex number exponentiation (z^power)
        for (let i = 1; i < power; i++) {
          const xNew = xtemp * x - ytemp * y
          const yNew = xtemp * y + ytemp * x
          xtemp = xNew
          ytemp = yNew
        }

        x = xtemp + x0
        y = ytemp + y0
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

function generatePhoenixFractal(
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
  const p = -0.5 // Phoenix parameter

  for (let px = 0; px < size; px += 2) {
    for (let py = 0; py < size; py += 2) {
      const x0 = (px - centerX) / zoom
      const y0 = (py - centerY) / zoom
      let x = 0
      let y = 0
      let x_prev = 0
      let y_prev = 0
      let iteration = 0

      while (x * x + y * y <= 4 && iteration < maxIterations) {
        const xtemp = x * x - y * y + x0 + p * x_prev
        y = 2 * x * y + y0 + p * y_prev
        x_prev = x
        y_prev = y
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

function generateBarnsleyFern(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  let x = 0
  let y = 0

  for (let i = 0; i < params.numSamples; i++) {
    const rand = random()

    let xNew, yNew
    if (rand < 0.01) {
      xNew = 0
      yNew = 0.16 * y
    } else if (rand < 0.86) {
      xNew = 0.85 * x + 0.04 * y
      yNew = -0.04 * x + 0.85 * y + 1.6
    } else if (rand < 0.93) {
      xNew = 0.2 * x - 0.26 * y
      yNew = 0.23 * x + 0.22 * y + 1.6
    } else {
      xNew = -0.15 * x + 0.28 * y
      yNew = 0.26 * x + 0.24 * y + 0.44
    }

    x = xNew
    y = yNew

    const px = size / 2 + x * 50
    const py = size - y * 50

    if (px >= 0 && px <= size && py >= 0 && py <= size) {
      const colorIndex = Math.floor(y * 5) % colours.length
      pathParts.push(`<rect x="${px}" y="${py}" width="1" height="1" fill="${colours[colorIndex]}" opacity="0.7"/>`)
    }
  }
}

function generateSierpinskiTriangle(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const depth = 7

  function drawTriangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, depth: number) {
    if (depth === 0) {
      const colorIndex = depth % colours.length
      pathParts.push(
        `<polygon points="${x1},${y1} ${x2},${y2} ${x3},${y3}" fill="${colours[colorIndex]}" opacity="0.8"/>`,
      )
      return
    }

    const midX12 = (x1 + x2) / 2
    const midY12 = (y1 + y2) / 2
    const midX23 = (x2 + x3) / 2
    const midY23 = (y2 + y3) / 2
    const midX31 = (x3 + x1) / 2
    const midY31 = (y3 + y1) / 2

    drawTriangle(x1, y1, midX12, midY12, midX31, midY31, depth - 1)
    drawTriangle(x2, y2, midX12, midY12, midX23, midY23, depth - 1)
    drawTriangle(x3, y3, midX31, midY31, midX23, midY23, depth - 1)
  }

  const x1 = size / 2
  const y1 = 50
  const x2 = 50
  const y2 = size - 50
  const x3 = size - 50
  const y3 = size - 50

  drawTriangle(x1, y1, x2, y2, x3, y3, depth)
}

function generateDragonCurve(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const iterations = 12
  let path = `M ${size / 2} ${size / 2}`
  let x = size / 2
  let y = size / 2
  let angle = 0
  const length = 8

  function turn(direction: number) {
    angle += direction * (Math.PI / 2)
  }

  function forward() {
    x += length * Math.cos(angle)
    y += length * Math.sin(angle)
    path += ` L ${x.toFixed(2)} ${y.toFixed(2)}`
  }

  let sequence = [1] // Initial sequence

  for (let i = 0; i < iterations; i++) {
    const newSequence = sequence
      .slice()
      .reverse()
      .map((val) => -val)
    sequence = sequence.concat([1], newSequence)
  }

  sequence.forEach((direction) => {
    turn(direction)
    forward()
  })

  const colorIndex = 0 % colours.length
  pathParts.push(
    `<path d="${path}" fill="none" stroke="${colours[colorIndex]}" stroke-width="1" stroke-opacity="0.8"/>`,
  )
}

function generateHilbertCurve(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const iterations = 5
  let path = `M 0 0`
  let x = 0
  let y = 0
  let angle = 0
  const length = size / (2 ** iterations - 1)

  function turnRight() {
    angle += Math.PI / 2
  }

  function turnLeft() {
    angle -= Math.PI / 2
  }

  function forward() {
    x += length * Math.cos(angle)
    y += length * Math.sin(angle)
    path += ` L ${x.toFixed(2)} ${y.toFixed(2)}`
  }

  function hilbert(i: number) {
    if (i <= 0) return

    turnLeft()
    hilbert(i - 1)
    forward()
    turnRight()
    hilbert(i - 1)
    forward()
    hilbert(i - 1)
    turnRight()
    forward()
    turnLeft()
    hilbert(i - 1)
  }

  hilbert(iterations)

  const colorIndex = 0 % colours.length
  pathParts.push(
    `<path d="${path}" fill="none" stroke="${colours[colorIndex]}" stroke-width="2" stroke-opacity="0.8" transform="translate(${length / 2}, ${length / 2}) scale(1, -1)"/>`,
  )
}

function generateKochSnowflake(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const iterations = 4

  function koch(x1: number, y1: number, x2: number, y2: number, depth: number) {
    if (depth === 0) {
      pathParts.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${colours[0]}" stroke-width="1"/>`)
      return
    }

    const dx = x2 - x1
    const dy = y2 - y1

    const xA = x1 + dx / 3
    const yA = y1 + dy / 3
    const xC = x2 - dx / 3
    const yC = y2 - dy / 3

    const xB = xA + (dx / 3) * Math.cos(Math.PI / 3) - (dy / 3) * Math.sin(Math.PI / 3)
    const yB = yA + (dx / 3) * Math.sin(Math.PI / 3) + (dy / 3) * Math.cos(Math.PI / 3)

    koch(x1, y1, xA, yA, depth - 1)
    koch(xA, yA, xB, yB, depth - 1)
    koch(xB, yB, xC, yC, depth - 1)
    koch(xC, yC, x2, y2, depth - 1)
  }

  const side = size * 0.8
  const height = (side * Math.sqrt(3)) / 2
  const x1 = size / 2 - side / 2
  const y1 = size / 2 + height / 2
  const x2 = size / 2 + side / 2
  const y2 = size / 2 + height / 2
  const x3 = size / 2
  const y3 = size / 2 - height / 2

  koch(x1, y1, x2, y2, iterations)
  koch(x2, y2, x3, y3, iterations)
  koch(x3, y3, x1, y1, iterations)
}

function generateLSystem(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const axiom = "F"
  const rules = {
    F: "FF+[+F-F-F]-[-F+F+F] ",
    "+": "+",
    "-": "-",
    "[": "[",
    "]": "]",
  }
  let sentence = axiom
  const iterations = 5
  const angle = 25 // degrees
  let path = `M ${size / 2} ${size * 0.9}`
  let x = size / 2
  let y = size * 0.9
  let currentAngle = -Math.PI / 2 // Upwards

  // Generate the L-system string
  for (let i = 0; i < iterations; i++) {
    let nextSentence = ""
    for (const char of sentence) {
      nextSentence += rules[char as keyof typeof rules] || char
    }
    sentence = nextSentence
  }

  // Interpret the L-system string
  const stack: { x: number; y: number; angle: number }[] = []

  for (const char of sentence) {
    if (char === "F") {
      const newX = x + Math.cos(currentAngle) * 5
      const newY = y + Math.sin(currentAngle) * 5
      path += ` L ${newX.toFixed(2)} ${newY.toFixed(2)}`
      x = newX
      y = newY
    } else if (char === "+") {
      currentAngle += (angle * Math.PI) / 180
    } else if (char === "-") {
      currentAngle -= (angle * Math.PI) / 180
    } else if (char === "[") {
      stack.push({ x: x, y: y, angle: currentAngle })
    } else if (char === "]") {
      const state = stack.pop()
      if (state) {
        x = state.x
        y = state.y
        currentAngle = state.angle
        path += ` M ${x.toFixed(2)} ${y.toFixed(2)}`
      }
    }
  }

  const colorIndex = 0 % colours.length
  pathParts.push(
    `<path d="${path}" fill="none" stroke="${colours[colorIndex]}" stroke-width="1" stroke-opacity="0.8"/>`,
  )
}

function generateCellularAutomata(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const rule = 30 // Rule number (0-255)
  const numRows = 64
  const cellSize = size / numRows

  // Convert rule to binary
  const ruleSet = rule.toString(2).padStart(8, "0").split("").map(Number)

  // Initialize the first row
  const grid: number[][] = [Array(numRows).fill(0)]
  grid[0][Math.floor(numRows / 2)] = 1

  // Generate subsequent rows
  for (let i = 1; i < numRows; i++) {
    grid[i] = Array(numRows).fill(0)
    for (let j = 0; j < numRows; j++) {
      const left = grid[i - 1][(j - 1 + numRows) % numRows]
      const center = grid[i - 1][j]
      const right = grid[i - 1][(j + 1) % numRows]

      // Calculate the rule index
      const ruleIndex = 7 - (left * 4 + center * 2 + right)

      // Apply the rule
      grid[i][j] = ruleSet[ruleIndex]
    }
  }

  // Render the grid
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numRows; j++) {
      if (grid[i][j] === 1) {
        const x = j * cellSize
        const y = i * cellSize
        const colorIndex = 0 % colours.length
        pathParts.push(
          `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${colours[colorIndex]}" opacity="0.9"/>`,
        )
      }
    }
  }
}

function generateGameOfLife(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const gridSize = 64
  const cellSize = size / gridSize
  let grid: number[][] = []

  // Initialize the grid randomly
  for (let i = 0; i < gridSize; i++) {
    grid[i] = []
    for (let j = 0; j < gridSize; j++) {
      grid[i][j] = random() > 0.5 ? 1 : 0
    }
  }

  // Simulate the game for a few generations
  for (let generation = 0; generation < 30; generation++) {
    const nextGrid: number[][] = []
    for (let i = 0; i < gridSize; i++) {
      nextGrid[i] = []
      for (let j = 0; j < gridSize; j++) {
        let neighbors = 0
        for (let x = -1; x <= 1; x++) {
          for (let y = -1; y <= 1; y++) {
            if (x === 0 && y === 0) continue
            const neighborX = (i + x + gridSize) % gridSize
            const neighborY = (j + y + gridSize) % gridSize
            neighbors += grid[neighborX][neighborY]
          }
        }

        // Apply the rules of the Game of Life
        if (grid[i][j] === 1) {
          nextGrid[i][j] = neighbors === 2 || neighbors === 3 ? 1 : 0
        } else {
          nextGrid[i][j] = neighbors === 3 ? 1 : 0
        }
      }
    }
    grid = nextGrid
  }

  // Render the final grid
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (grid[i][j] === 1) {
        const x = j * cellSize
        const y = i * cellSize
        const colorIndex = 0 % colours.length
        pathParts.push(
          `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${colours[colorIndex]}" opacity="0.9"/>`,
        )
      }
    }
  }
}

function generateTuringPattern(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const gridSize = 64
  const cellSize = size / gridSize
  let gridA: number[][] = []
  let gridB: number[][] = []

  // Initialize the grids randomly
  for (let i = 0; i < gridSize; i++) {
    gridA[i] = []
    gridB[i] = []
    for (let j = 0; j < gridSize; j++) {
      gridA[i][j] = 0.5 + random() * 0.1
      gridB[i][j] = 0.25 + random() * 0.05
    }
  }

  // Define reaction-diffusion parameters
  const dA = 1.0
  const dB = 0.5
  const feed = 0.055
  const kill = 0.062

  // Simulate the reaction-diffusion process
  for (let step = 0; step < 20; step++) {
    const nextGridA: number[][] = []
    const nextGridB: number[][] = []

    for (let i = 0; i < gridSize; i++) {
      nextGridA[i] = []
      nextGridB[i] = []
      for (let j = 0; j < gridSize; j++) {
        const a = gridA[i][j]
        const b = gridB[i][j]

        // Calculate Laplacian using a simple 5-point stencil
        const laplaceA =
          gridA[(i - 1 + gridSize) % gridSize][j] +
          gridA[(i + 1) % gridSize][j] +
          gridA[i][(j - 1 + gridSize) % gridSize] +
          gridA[i][(j + 1) % gridSize] -
          4 * a
        const laplaceB =
          gridB[(i - 1 + gridSize) % gridSize][j] +
          gridB[(i + 1) % gridSize][j] +
          gridB[i][(j - 1 + gridSize) % gridSize] +
          gridB[i][(j + 1) % gridSize] -
          4 * b

        // Apply the reaction-diffusion equations
        const aChange = dA * laplaceA - a * b * b + feed * (1 - a)
        const bChange = dB * laplaceB + a * b * b - (kill + feed) * b

        nextGridA[i][j] = a + aChange
        nextGridB[i][j] = b + bChange
      }
    }

    gridA = nextGridA
    gridB = nextGridB
  }

  // Render the pattern
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const a = gridA[i][j]
      const intensity = Math.max(0, Math.min(1, a)) // Clamp to 0-1
      const x = j * cellSize
      const y = i * cellSize
      const colorIndex = Math.floor(intensity * (colours.length - 1))
      pathParts.push(
        `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${colours[colorIndex]}" opacity="${intensity}"/>`,
      )
    }
  }
}

function generateGrayScott(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const gridSize = 64
  const cellSize = size / gridSize
  let gridA: number[][] = []
  let gridB: number[][] = []

  // Initialize the grids randomly
  for (let i = 0; i < gridSize; i++) {
    gridA[i] = []
    gridB[i] = []
    for (let j = 0; j < gridSize; j++) {
      gridA[i][j] = 1
      gridB[i][j] = 0
    }
  }

  // Add a small disturbance
  for (let i = gridSize / 2 - 5; i < gridSize / 2 + 5; i++) {
    for (let j = gridSize / 2 - 5; j < gridSize / 2 + 5; j++) {
      gridB[i][j] = 1
    }
  }

  // Define Gray-Scott parameters
  const dA = 1.0
  const dB = 0.5
  const feed = 0.055
  const kill = 0.062

  // Simulate the reaction-diffusion process
  for (let step = 0; step < 20; step++) {
    const nextGridA: number[][] = []
    const nextGridB: number[][] = []

    for (let i = 0; i < gridSize; i++) {
      nextGridA[i] = []
      nextGridB[i] = []
      for (let j = 0; j < gridSize; j++) {
        const a = gridA[i][j]
        const b = gridB[i][j]

        // Calculate Laplacian using a simple 5-point stencil
        const laplaceA =
          gridA[(i - 1 + gridSize) % gridSize][j] +
          gridA[(i + 1) % gridSize][j] +
          gridA[i][(j - 1 + gridSize) % gridSize] +
          gridA[i][(j + 1) % gridSize] -
          4 * a
        const laplaceB =
          gridB[(i - 1 + gridSize) % gridSize][j] +
          gridB[(i + 1) % gridSize][j] +
          gridB[i][(j - 1 + gridSize) % gridSize] +
          gridB[i][(j + 1) % gridSize] -
          4 * b

        // Apply the reaction-diffusion equations
        const aChange = dA * laplaceA - a * b * b + feed * (1 - a)
        const bChange = dB * laplaceB + a * b * b - (kill + feed) * b

        nextGridA[i][j] = a + aChange
        nextGridB[i][j] = b + bChange
      }
    }

    gridA = nextGridA
    gridB = nextGridB
  }

  // Render the pattern
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const b = gridB[i][j]
      const intensity = Math.max(0, Math.min(1, b)) // Clamp to 0-1
      const x = j * cellSize
      const y = i * cellSize
      const colorIndex = Math.floor(intensity * (colours.length - 1))
      pathParts.push(
        `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${colours[colorIndex]}" opacity="${intensity}"/>`,
      )
    }
  }
}

function generateBelousovZhabotinsky(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const gridSize = 64
  const cellSize = size / gridSize
  let gridU: number[][] = []
  let gridV: number[][] = []

  // Initialize the grids randomly
  for (let i = 0; i < gridSize; i++) {
    gridU[i] = []
    gridV[i] = []
    for (let j = 0; j < gridSize; j++) {
      gridU[i][j] = 0.5 + random() * 0.1
      gridV[i][j] = 0.25 + random() * 0.05
    }
  }

  // Define BZ parameters
  const epsilon = 0.02
  const q = 0.002
  const k = 0.005

  // Simulate the BZ reaction
  for (let step = 0; step < 20; step++) {
    const nextGridU: number[][] = []
    const nextGridV: number[][] = []

    for (let i = 0; i < gridSize; i++) {
      nextGridU[i] = []
      nextGridV[i] = []
      for (let j = 0; j < gridSize; j++) {
        const u = gridU[i][j]
        const v = gridV[i][j]

        // Calculate Laplacian using a simple 5-point stencil
        const laplaceU =
          gridU[(i - 1 + gridSize) % gridSize][j] +
          gridU[(i + 1) % gridSize][j] +
          gridU[i][(j - 1 + gridSize) % gridSize] +
          gridU[i][(j + 1) % gridSize] -
          4 * u
        const laplaceV =
          gridV[(i - 1 + gridSize) % gridSize][j] +
          gridV[(i + 1) % gridSize][j] +
          gridV[i][(j - 1 + gridSize) % gridSize] +
          gridV[i][(j + 1) % gridSize] -
          4 * v

        // Apply the BZ equations
        const uChange = u - u * u * u + q * v * v + k * laplaceU
        const vChange = epsilon * (u - v - u * u * u) + k * laplaceV

        nextGridU[i][j] = u + uChange
        nextGridV[i][j] = v + vChange
      }
    }

    gridU = nextGridU
    gridV = nextGridV
  }

  // Render the pattern
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const u = gridU[i][j]
      const intensity = Math.max(0, Math.min(1, u)) // Clamp to 0-1
      const x = j * cellSize
      const y = i * cellSize
      const colorIndex = Math.floor(intensity * (colours.length - 1))
      pathParts.push(
        `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${colours[colorIndex]}" opacity="${intensity}"/>`,
      )
    }
  }
}

function generateFitzHughNagumo(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const gridSize = 64
  const cellSize = size / gridSize
  let gridV: number[][] = []
  let gridW: number[][] = []

  // Initialize the grids randomly
  for (let i = 0; i < gridSize; i++) {
    gridV[i] = []
    gridW[i] = []
    for (let j = 0; j < gridSize; j++) {
      gridV[i][j] = -0.7 + random() * 0.2
      gridW[i][j] = 0.5 + random() * 0.1
    }
  }

  // Define FHN parameters
  const a = 0.7
  const b = 0.8
  const epsilon = 0.08
  const Iext = 0.5

  // Simulate the FHN equations
  for (let step = 0; step < 20; step++) {
    const nextGridV: number[][] = []
    const nextGridW: number[][] = []

    for (let i = 0; i < gridSize; i++) {
      nextGridV[i] = []
      nextGridW[i] = []
      for (let j = 0; j < gridSize; j++) {
        const v = gridV[i][j]
        const w = gridW[i][j]

        // Calculate Laplacian using a simple 5-point stencil
        const laplaceV =
          gridV[(i - 1 + gridSize) % gridSize][j] +
          gridV[(i + 1) % gridSize][j] +
          gridV[i][(j - 1 + gridSize) % gridSize] +
          gridV[i][(j + 1) % gridSize] -
          4 * v

        // Apply the FHN equations
        const vChange = v - (v * v * v) / 3 - w + Iext + 0.2 * laplaceV
        const wChange = epsilon * (v + a - b * w)

        nextGridV[i][j] = v + vChange
        nextGridW[i][j] = w + wChange
      }
    }

    gridV = nextGridV
    gridW = nextGridW
  }

  // Render the pattern
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const v = gridV[i][j]
      const intensity = Math.max(0, Math.min(1, (v + 1) / 2)) // Clamp to 0-1
      const x = j * cellSize
      const y = i * cellSize
      const colorIndex = Math.floor(intensity * (colours.length - 1))
      pathParts.push(
        `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${colours[colorIndex]}" opacity="${intensity}"/>`,
      )
    }
  }
}

function generateHodgkinHuxley(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const gridSize = 64
  const cellSize = size / gridSize
  let gridV: number[][] = []
  let gridM: number[][] = []
  let gridH: number[][] = []
  let gridN: number[][] = []

  // Initialize the grids randomly
  for (let i = 0; i < gridSize; i++) {
    gridV[i] = []
    gridM[i] = []
    gridH[i] = []
    gridN[i] = []
    for (let j = 0; j < gridSize; j++) {
      gridV[i][j] = -65 + random() * 10
      gridM[i][j] = 0.05 + random() * 0.02
      gridH[i][j] = 0.6 + random() * 0.1
      gridN[i][j] = 0.3 + random() * 0.1
    }
  }

  // Define HH parameters
  const gNa = 120
  const gK = 36
  const gL = 0.3
  const ENa = 50
  const EK = -77
  const EL = -54.3
  const Cm = 1

  // Simulate the HH equations
  for (let step = 0; step < 20; step++) {
    const nextGridV: number[][] = []
    const nextGridM: number[][] = []
    const nextGridH: number[][] = []
    const nextGridN: number[][] = []

    for (let i = 0; i < gridSize; i++) {
      nextGridV[i] = []
      nextGridM[i] = []
      nextGridH[i] = []
      nextGridN[i] = []
      for (let j = 0; j < gridSize; j++) {
        const V = gridV[i][j]
        const m = gridM[i][j]
        const h = gridH[i][j]
        const n = gridN[i][j]

        // Calculate alpha and beta rates
        const alphaM = (0.1 * (25 - V)) / (Math.exp((25 - V) / 10) - 1)
        const betaM = 4 * Math.exp(-V / 18)
        const alphaH = 0.07 * Math.exp(-V / 20)
        const betaH = 1 / (Math.exp((30 - V) / 10) + 1)
        const alphaN = (0.01 * (10 - V)) / (Math.exp((10 - V) / 10) - 1)
        const betaN = 0.125 * Math.exp(-V / 80)

        // Calculate derivatives
        const dV = -(gNa * m * m * m * h * (V - ENa) + gK * n * n * n * n * (V - EK) + gL * (V - EL)) / Cm
        const dm = alphaM * (1 - m) - betaM * m
        const dh = alphaH * (1 - h) - betaH * h
        const dn = alphaN * (1 - n) - betaN * n

        nextGridV[i][j] = V + dV
        nextGridM[i][j] = m + dm
        nextGridH[i][j] = h + dh
        nextGridN[i][j] = n + dn
      }
    }

    gridV = nextGridV
    gridM = nextGridM
    gridH = nextGridH
    gridN = nextGridN
  }

  // Render the pattern
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const V = gridV[i][j]
      const intensity = Math.max(0, Math.min(1, (V + 80) / 40)) // Clamp to 0-1
      const x = j * cellSize
      const y = i * cellSize
      const colorIndex = Math.floor(intensity * (colours.length - 1))
      pathParts.push(
        `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${colours[colorIndex]}" opacity="${intensity}"/>`,
      )
    }
  }
}

function generateKuramotoSivashinsky(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const gridSize = 64
  const cellSize = size / gridSize
  let grid: number[][] = []

  // Initialize the grid randomly
  for (let i = 0; i < gridSize; i++) {
    grid[i] = []
    for (let j = 0; j < gridSize; j++) {
      grid[i][j] = random() * 2 * Math.PI
    }
  }

  // Define KS parameters
  const nu = 1 // Viscosity
  const L = 2 * Math.PI // Domain size

  // Simulate the KS equation
  for (let step = 0; step < 20; step++) {
    const nextGrid: number[][] = []

    for (let i = 0; i < gridSize; i++) {
      nextGrid[i] = []
      for (let j = 0; j < gridSize; j++) {
        const u = grid[i][j]

        // Calculate derivatives using finite differences
        const uxxxx =
          grid[(i - 2 + gridSize) % gridSize][j] -
          4 * grid[(i - 1 + gridSize) % gridSize][j] +
          6 * grid[i][j] -
          4 * grid[(i + 1) % gridSize][j] +
          grid[(i + 2) % gridSize][j]
        const ux = (grid[(i + 1) % gridSize][j] - grid[(i - 1 + gridSize) % gridSize][j]) / 2

        // Apply the KS equation
        const uChange = -nu * uxxxx - u * ux

        nextGrid[i][j] = u + uChange
      }
    }

    grid = nextGrid
  }

  // Render the pattern
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const u = grid[i][j]
      const intensity = Math.max(0, Math.min(1, (Math.sin(u) + 1) / 2)) // Clamp to 0-1
      const x = j * cellSize
      const y = i * cellSize
      const colorIndex = Math.floor(intensity * (colours.length - 1))
      pathParts.push(
        `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${colours[colorIndex]}" opacity="${intensity}"/>`,
      )
    }
  }
}

function generateNavierStokes(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const gridSize = 64
  const cellSize = size / gridSize
  let gridU: number[][] = []
  let gridV: number[][] = []

  // Initialize the grids randomly
  for (let i = 0; i < gridSize; i++) {
    gridU[i] = []
    gridV[i] = []
    for (let j = 0; j < gridSize; j++) {
      gridU[i][j] = random() - 0.5
      gridV[i][j] = random() - 0.5
    }
  }

  // Define NS parameters
  const viscosity = 0.0001
  const force = 0.01

  // Simulate the NS equations
  for (let step = 0; step < 20; step++) {
    const nextGridU: number[][] = []
    const nextGridV: number[][] = []

    for (let i = 0; i < gridSize; i++) {
      nextGridU[i] = []
      nextGridV[i] = []
      for (let j = 0; j < gridSize; j++) {
        const u = gridU[i][j]
        const v = gridV[i][j]

        // Calculate derivatives using finite differences
        const uxx = gridU[(i - 1 + gridSize) % gridSize][j] - 2 * gridU[i][j] + gridU[(i + 1) % gridSize][j]
        const uyy = gridU[i][(j - 1 + gridSize) % gridSize] - 2 * gridU[i][j] + gridU[i][(j + 1) % gridSize]
        const vxx = gridV[(i - 1 + gridSize) % gridSize][j] - 2 * gridV[i][j] + gridV[(i + 1) % gridSize][j]
        const vyy = gridV[i][(j - 1 + gridSize) % gridSize] - 2 * gridV[i][j] + gridV[i][(j + 1) % gridSize]

        const dudx = (gridU[(i + 1) % gridSize][j] - gridU[(i - 1 + gridSize) % gridSize][j]) / 2
        const dudy = (gridU[i][(j + 1) % gridSize] - gridU[i][(j - 1 + gridSize) % gridSize]) / 2
        const dvdx = (gridV[(i + 1) % gridSize][j] - gridV[(i - 1 + gridSize) % gridSize][j]) / 2
        const dvdy = (gridV[i][(j + 1) % gridSize] - gridV[i][(j - 1 + gridSize) % gridSize]) / 2

        // Apply the NS equations
        const uChange = -u * dudx - v * dudy + viscosity * (uxx + uyy) + force * Math.sin(i / 10)
        const vChange = -u * dvdx - v * dvdy + viscosity * (vxx + vyy)

        nextGridU[i][j] = u + uChange
        nextGridV[i][j] = v + vChange
      }
    }

    gridU = nextGridU
    gridV = nextGridV
  }

  // Render the pattern
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const u = gridU[i][j]
      const v = gridV[i][j]
      const velocity = Math.sqrt(u * u + v * v)
      const intensity = Math.max(0, Math.min(1, velocity * 10)) // Clamp to 0-1
      const x = j * cellSize
      const y = i * cellSize
      const colorIndex = Math.floor(intensity * (colours.length - 1))
      pathParts.push(
        `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${colours[colorIndex]}" opacity="${intensity}"/>`,
      )
    }
  }
}

function generateSchrodinger(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const gridSize = 64
  const cellSize = size / gridSize
  let gridPsiR: number[][] = []
  let gridPsiI: number[][] = []

  // Initialize the grids randomly
  for (let i = 0; i < gridSize; i++) {
    gridPsiR[i] = []
    gridPsiI[i] = []
    for (let j = 0; j < gridSize; j++) {
      gridPsiR[i][j] = random() - 0.5
      gridPsiI[i][j] = random() - 0.5
    }
  }

  // Define Schrodinger parameters
  const hbar = 1
  const mass = 1
  const dt = 0.001
  const V = 0 // Potential energy

  // Simulate the Schrodinger equation
  for (let step = 0; step < 20; step++) {
    const nextGridPsiR: number[][] = []
    const nextGridPsiI: number[][] = []

    for (let i = 0; i < gridSize; i++) {
      nextGridPsiR[i] = []
      nextGridPsiI[i] = []
      for (let j = 0; j < gridSize; j++) {
        const psiR = gridPsiR[i][j]
        const psiI = gridPsiI[i][j]

        // Calculate Laplacian using finite differences
        const laplacePsiR =
          gridPsiR[(i - 1 + gridSize) % gridSize][j] +
          gridPsiR[(i + 1) % gridSize][j] +
          gridPsiR[i][(j - 1 + gridSize) % gridSize] +
          gridPsiR[i][(j + 1) % gridSize] -
          4 * psiR
        const laplacePsiI =
          gridPsiI[(i - 1 + gridSize) % gridSize][j] +
          gridPsiI[(i + 1) % gridSize][j] +
          gridPsiI[i][(j - 1 + gridSize) % gridSize] +
          gridPsiI[i][(j + 1) % gridSize] -
          4 * psiI

        // Apply the Schrodinger equation
        const psiRChange = -(hbar / (2 * mass)) * laplacePsiI - V * psiI
        const psiIChange = (hbar / (2 * mass)) * laplacePsiR + V * psiR

        nextGridPsiR[i][j] = psiR + psiRChange * dt
        nextGridPsiI[i][j] = psiI + psiIChange * dt
      }
    }

    gridPsiR = nextGridPsiR
    gridPsiI = nextGridPsiI
  }

  // Render the pattern
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const psiR = gridPsiR[i][j]
      const psiI = gridPsiI[i][j]
      const intensity = Math.max(0, Math.min(1, psiR * psiR + psiI * psiI)) // Clamp to 0-1
      const x = j * cellSize
      const y = i * cellSize
      const colorIndex = Math.floor(intensity * (colours.length - 1))
      pathParts.push(
        `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${colours[colorIndex]}" opacity="${intensity}"/>`,
      )
    }
  }
}

function generateKleinGordon(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const gridSize = 64
  const cellSize = size / gridSize
  let gridPhi: number[][] = []
  let gridPhiT: number[][] = []

  // Initialize the grids randomly
  for (let i = 0; i < gridSize; i++) {
    gridPhi[i] = []
    gridPhiT[i] = []
    for (let j = 0; j < gridSize; j++) {
      gridPhi[i][j] = random() - 0.5
      gridPhiT[i][j] = 0
    }
  }

  // Define Klein-Gordon parameters
  const mass = 1
  const dt = 0.01
  const c = 1 // Speed of light

  // Simulate the Klein-Gordon equation
  for (let step = 0; step < 20; step++) {
    const nextGridPhi: number[][] = []
    const nextGridPhiT: number[][] = []

    for (let i = 0; i < gridSize; i++) {
      nextGridPhi[i] = []
      nextGridPhiT[i] = []
      for (let j = 0; j < gridSize; j++) {
        const phi = gridPhi[i][j]
        const phiT = gridPhiT[i][j]

        // Calculate Laplacian using finite differences
        const laplacePhi =
          gridPhi[(i - 1 + gridSize) % gridSize][j] +
          gridPhi[(i + 1) % gridSize][j] +
          gridPhi[i][(j - 1 + gridSize) % gridSize] +
          gridPhi[i][(j + 1) % gridSize] -
          4 * phi

        // Apply the Klein-Gordon equation
        const phiTT = c * c * laplacePhi - mass * mass * phi
        const phiTChange = phiTT
        const phiChange = phiT

        nextGridPhiT[i][j] = phiT + phiTChange * dt
        nextGridPhi[i][j] = phi + phiChange * dt
      }
    }

    gridPhi = nextGridPhi
    gridPhiT = nextGridPhiT
  }

  // Render the pattern
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const phi = gridPhi[i][j]
      const intensity = Math.max(0, Math.min(1, (phi + 0.5) / 1)) // Clamp to 0-1
      const x = j * cellSize
      const y = i * cellSize
      const colorIndex = Math.floor(intensity * (colours.length - 1))
      pathParts.push(
        `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${colours[colorIndex]}" opacity="${intensity}"/>`,
      )
    }
  }
}

function generateSineGordon(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const gridSize = 64
  const cellSize = size / gridSize
  let gridPhi: number[][] = []
  let gridPhiT: number[][] = []

  // Initialize the grids randomly
  for (let i = 0; i < gridSize; i++) {
    gridPhi[i] = []
    gridPhiT[i] = []
    for (let j = 0; j < gridSize; j++) {
      gridPhi[i][j] = random() * 2 * Math.PI
      gridPhiT[i][j] = 0
    }
  }

  // Define Sine-Gordon parameters
  const dt = 0.01
  const c = 1 // Speed of light

  // Simulate the Sine-Gordon equation
  for (let step = 0; step < 20; step++) {
    const nextGridPhi: number[][] = []
    const nextGridPhiT: number[][] = []

    for (let i = 0; i < gridSize; i++) {
      nextGridPhi[i] = []
      nextGridPhiT[i] = []
      for (let j = 0; j < gridSize; j++) {
        const phi = gridPhi[i][j]
        const phiT = gridPhiT[i][j]

        // Calculate Laplacian using finite differences
        const laplacePhi =
          gridPhi[(i - 1 + gridSize) % gridSize][j] +
          gridPhi[(i + 1) % gridSize][j] +
          gridPhi[i][(j - 1 + gridSize) % gridSize] +
          gridPhi[i][(j + 1) % gridSize] -
          4 * phi

        // Apply the Sine-Gordon equation
        const phiTT = c * c * laplacePhi - Math.sin(phi)
        const phiTChange = phiTT
        const phiChange = phiT

        nextGridPhiT[i][j] = phiT + phiTChange * dt
        nextGridPhi[i][j] = phi + phiChange * dt
      }
    }

    gridPhi = nextGridPhi
    gridPhiT = nextGridPhiT
  }

  // Render the pattern
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const phi = gridPhi[i][j]
      const intensity = Math.max(0, Math.min(1, (Math.sin(phi) + 1) / 2)) // Clamp to 0-1
      const x = j * cellSize
      const y = i * cellSize
      const colorIndex = Math.floor(intensity * (colours.length - 1))
      pathParts.push(
        `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${colours[colorIndex]}" opacity="${intensity}"/>`,
      )
    }
  }
}

function generateKortewegDeVries(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const gridSize = 64
  const cellSize = size / gridSize
  let gridU: number[][] = []

  // Initialize the grid randomly
  for (let i = 0; i < gridSize; i++) {
    gridU[i] = []
    for (let j = 0; j < gridSize; j++) {
      gridU[i][j] = Math.sin((2 * Math.PI * j) / gridSize) + 0.1 * Math.sin((2 * Math.PI * 2 * j) / gridSize)
    }
  }

  // Define KdV parameters
  const dt = 0.001
  const dx = 1
  const alpha = 1
  const beta = 1

  // Simulate the KdV equation
  for (let step = 0; step < 20; step++) {
    const nextGridU: number[][] = []

    for (let i = 0; i < gridSize; i++) {
      nextGridU[i] = []
      for (let j = 0; j < gridSize; j++) {
        const u = gridU[i][j]

        // Calculate derivatives using finite differences
        const dudx = (gridU[i][(j + 1) % gridSize] - gridU[i][(j - 1 + gridSize) % gridSize]) / (2 * dx)
        const d3udx3 =
          (gridU[i][(j + 2) % gridSize] -
            2 * gridU[i][(j + 1) % gridSize] +
            2 * gridU[i][(j - 1 + gridSize) % gridSize] -
            gridU[i][(j - 2 + gridSize) % gridSize]) /
          (2 * dx * dx * dx)

        // Apply the KdV equation
        const uChange = -alpha * u * dudx - beta * d3udx3

        nextGridU[i][j] = u + uChange * dt
      }
    }

    gridU = nextGridU
  }

  // Render the pattern
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const u = gridU[i][j]
      const intensity = Math.max(0, Math.min(1, (u + 1) / 2)) // Clamp to 0-1
      const x = j * cellSize
      const y = i * cellSize
      const colorIndex = Math.floor(intensity * (colours.length - 1))
      pathParts.push(
        `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${colours[colorIndex]}" opacity="${intensity}"/>`,
      )
    }
  }
}

function generateBurgersEquation(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const gridSize = 64
  const cellSize = size / gridSize
  let gridU: number[][] = []

  // Initialize the grid randomly
  for (let i = 0; i < gridSize; i++) {
    gridU[i] = []
    for (let j = 0; j < gridSize; j++) {
      gridU[i][j] = Math.sin((2 * Math.PI * j) / gridSize) + 0.1 * Math.sin((2 * Math.PI * 2 * j) / gridSize)
    }
  }

  // Define Burgers' equation parameters
  const dt = 0.001
  const dx = 1
  const nu = 0.01 // Viscosity

  // Simulate Burgers' equation
  for (let step = 0; step < 20; step++) {
    const nextGridU: number[][] = []

    for (let i = 0; i < gridSize; i++) {
      nextGridU[i] = []
      for (let j = 0; j < gridSize; j++) {
        const u = gridU[i][j]

        // Calculate derivatives using finite differences
        const dudx = (gridU[i][(j + 1) % gridSize] - gridU[i][(j - 1 + gridSize) % gridSize]) / (2 * dx)
        const d2udx2 =
          (gridU[i][(j + 1) % gridSize] - 2 * gridU[i][j] + gridU[i][(j - 1 + gridSize) % gridSize]) / (dx * dx)

        // Apply Burgers' equation
        const uChange = -u * dudx + nu * d2udx2

        nextGridU[i][j] = u + uChange * dt
      }
    }

    gridU = nextGridU
  }

  // Render the pattern
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const u = gridU[i][j]
      const intensity = Math.max(0, Math.min(1, (u + 1) / 2)) // Clamp to 0-1
      const x = j * cellSize
      const y = i * cellSize
      const colorIndex = Math.floor(intensity * (colours.length - 1))
      pathParts.push(
        `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${colours[colorIndex]}" opacity="${intensity}"/>`,
      )
    }
  }
}

function generateHeatEquation(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const gridSize = 64
  const cellSize = size / gridSize
  let gridT: number[][] = []

  // Initialize the grid randomly
  for (let i = 0; i < gridSize; i++) {
    gridT[i] = []
    for (let j = 0; j < gridSize; j++) {
      gridT[i][j] = random()
    }
  }

  // Define Heat equation parameters
  const dt = 0.001
  const dx = 1
  const alpha = 0.1 // Thermal diffusivity

  // Simulate Heat equation
  for (let step = 0; step < 20; step++) {
    const nextGridT: number[][] = []

    for (let i = 0; i < gridSize; i++) {
      nextGridT[i] = []
      for (let j = 0; j < gridSize; j++) {
        const T = gridT[i][j]

        // Calculate Laplacian using finite differences
        const laplaceT =
          gridT[(i - 1 + gridSize) % gridSize][j] +
          gridT[(i + 1) % gridSize][j] +
          gridT[i][(j - 1 + gridSize) % gridSize] +
          gridT[i][(j + 1) % gridSize] -
          4 * T

        // Apply Heat equation
        const TChange = alpha * laplaceT

        nextGridT[i][j] = T + TChange * dt
      }
    }

    gridT = nextGridT
  }

  // Render the pattern
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const T = gridT[i][j]
      const intensity = Math.max(0, Math.min(1, T)) // Clamp to 0-1
      const x = j * cellSize
      const y = i * cellSize
      const colorIndex = Math.floor(intensity * (colours.length - 1))
      pathParts.push(
        `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${colours[colorIndex]}" opacity="${intensity}"/>`,
      )
    }
  }
}

function generateLaplaceEquation(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const gridSize = 64
  const cellSize = size / gridSize
  const gridU: number[][] = []

  // Initialize the grid with boundary conditions
  for (let i = 0; i < gridSize; i++) {
    gridU[i] = []
    for (let j = 0; j < gridSize; j++) {
      if (i === 0 || i === gridSize - 1 || j === 0 || j === gridSize - 1) {
        // Boundary conditions: set to random values
        gridU[i][j] = random()
      } else {
        // Interior points: initialize to 0
        gridU[i][j] = 0
      }
    }
  }

  // Solve Laplace equation using iterative method
  for (let iteration = 0; iteration < 50; iteration++) {
    for (let i = 1; i < gridSize - 1; i++) {
      for (let j = 1; j < gridSize - 1; j++) {
        // Update interior points using average of neighbors
        gridU[i][j] =
          (gridU[(i - 1 + gridSize) % gridSize][j] +
            gridU[(i + 1) % gridSize][j] +
            gridU[i][(j - 1 + gridSize) % gridSize] +
            gridU[i][(j + 1) % gridSize]) /
          4
      }
    }
  }

  // Render the pattern
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const u = gridU[i][j]
      const intensity = Math.max(0, Math.min(1, u)) // Clamp to 0-1
      const x = j * cellSize
      const y = i * cellSize
      const colorIndex = Math.floor(intensity * (colours.length - 1))
      pathParts.push(
        `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${colours[colorIndex]}" opacity="${intensity}"/>`,
      )
    }
  }
}

function generatePoissonEquation(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const gridSize = 64
  const cellSize = size / gridSize
  const gridU: number[][] = []
  const gridF: number[][] = [] // Source term

  // Initialize the grid with boundary conditions and source term
  for (let i = 0; i < gridSize; i++) {
    gridU[i] = []
    gridF[i] = []
    for (let j = 0; j < gridSize; j++) {
      if (i === 0 || i === gridSize - 1 || j === 0 || j === gridSize - 1) {
        // Boundary conditions: set to 0
        gridU[i][j] = 0
      } else {
        // Interior points: initialize to 0
        gridU[i][j] = 0
      }

      // Source term: create a simple source in the center
      const centerX = gridSize / 2
      const centerY = gridSize / 2
      const distance = Math.sqrt((i - centerX) ** 2 + (j - centerY) ** 2)
      gridF[i][j] = distance < gridSize / 4 ? 1 : 0
    }
  }

  // Solve Poisson equation using iterative method
  for (let iteration = 0; iteration < 50; iteration++) {
    for (let i = 1; i < gridSize - 1; i++) {
      for (let j = 1; j < gridSize - 1; j++) {
        // Update interior points using average of neighbors and source term
        gridU[i][j] =
          (gridU[(i - 1 + gridSize) % gridSize][j] +
            gridU[(i + 1) % gridSize][j] +
            gridU[i][(j - 1 + gridSize) % gridSize] +
            gridU[i][(j + 1) % gridSize] -
            gridF[i][j] * cellSize * cellSize) /
          4
      }
    }
  }

  // Render the pattern
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const u = gridU[i][j]
      const intensity = Math.max(0, Math.min(1, u)) // Clamp to 0-1
      const x = j * cellSize
      const y = i * cellSize
      const colorIndex = Math.floor(intensity * (colours.length - 1))
      pathParts.push(
        `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${colours[colorIndex]}" opacity="${intensity}"/>`,
      )
    }
  }
}

function generateHelmholtzEquation(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  const gridSize = 64
  const cellSize = size / gridSize
  const gridU: number[][] = []

  // Initialize the grid with boundary conditions
  for (let i = 0; i < gridSize; i++) {
    gridU[i] = []
    for (let j = 0; j < gridSize; j++) {
      if (i === 0 || i === gridSize - 1 || j === 0 || j === gridSize - 1) {
        // Boundary conditions: set to random values
        gridU[i][j] = random()
      } else {
        // Interior points: initialize to 0
        gridU[i][j] = 0
      }
    }
  }

  // Define Helmholtz equation parameters
  const kSquared = 1 // Wave number squared

  // Solve Helmholtz equation using iterative method
  for (let iteration = 0; iteration < 50; iteration++) {
    for (let i = 1; i < gridSize - 1; i++) {
      for (let j = 1; j < gridSize - 1; j++) {
        // Update interior points using average of neighbors
        gridU[i][j] =
          (gridU[(i - 1 + gridSize) % gridSize][j] +
            gridU[(i + 1) % gridSize][j] +
            gridU[i][(j - 1 + gridSize) % gridSize] +
            gridU[i][(j + 1) % gridSize][j] =
          (gridU[(i - 1 + gridSize) % gridSize][j] +
            gridU[(i + 1) % gridSize][j] +
            gridU[i][(j - 1 + gridSize) % gridSize] +
            gridU[i][(j + 1) % gridSize]) /
          (4 - kSquared * cellSize * cellSize)
      }
      \
    }
  }

  // Render the pattern
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const u = gridU[i][j]
      const intensity = Math.max(0, Math.min(1, u)) // Clamp to 0-1
      const x = j * cellSize
      const y = i * cellSize
      const colorIndex = Math.floor(intensity * (colours.length - 1))
      pathParts.push(
        `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${colours[colorIndex]}" opacity="${intensity}"/>`,
      )
    }
  }
}

function generateHalvorsenAttractor(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  let x = 0.1
  let y = 0
  let z = 0
  const a = 1.4
  const dt = 0.01
  const scale = 20

  let path = `M ${size / 2} ${size / 2}`

  for (let i = 0; i < params.numSamples; i++) {
    const dx = -a * x - 4 * y - 4 * z - y * y
    const dy = -a * y - 4 * z - 4 * x - z * z
    const dz = -a * z - 4 * x - 4 * y - x * x
    x += dx * dt
    y += dy * dt
    z += dz * dt

    const px = size / 2 + x * scale
    const py = size / 2 + y * scale

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
  let x = 0.1
  let y = 0
  const u = 0.9
  const dt = 0.01
  const scale = 150

  let path = `M ${size / 2} ${size / 2}`

  for (let i = 0; i < params.numSamples; i++) {
    const tn = 0.4 - 6 / (1 + x * x + y * y)
    const xNext = 1 + u * (x * Math.cos(tn) - y * Math.sin(tn))
    const yNext = u * (x * Math.sin(tn) + y * Math.cos(tn))
    x = xNext
    y = yNext

    const px = size / 2 + x * scale
    const py = size / 2 + y * scale

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

function generateTinkerbellMap(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  let x = 0.1
  let y = 0
  const a = 0.9
  const b = -0.6013
  const c = 2.0
  const d = 0.5
  const dt = 0.01
  const scale = 80

  let path = `M ${size / 2} ${size / 2}`

  for (let i = 0; i < params.numSamples; i++) {
    const xNext = x * x - y * y + a * x + b * y
    const yNext = 2 * x * y + c * x + d * y
    x = xNext
    y = yNext

    const px = size / 2 + x * scale
    const py = size / 2 + y * scale

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

function generateGingerbreadMap(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  let x = 0.1
  let y = 0
  const dt = 0.01
  const scale = 80

  let path = `M ${size / 2} ${size / 2}`

  for (let i = 0; i < params.numSamples; i++) {
    const xNext = 1 - y + Math.abs(x)
    const yNext = x
    x = xNext
    y = yNext

    const px = size / 2 + x * scale
    const py = size / 2 + y * scale

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

function generateDuffingOscillator(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  let x = 0.1
  let y = 0
  const a = 2.75
  const b = 0.2
  const c = 0.3
  const dt = 0.01
  const scale = 150

  let path = `M ${size / 2} ${size / 2}`

  for (let i = 0; i < params.numSamples; i++) {
    const dx = y
    const dy = -b * x - c * y - x * x * x + a * Math.cos(dt * i)
    x += dx * dt
    y += dy * dt

    const px = size / 2 + x * scale
    const py = size / 2 + y * scale

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

function generateChuaCircuit(
  pathParts: string[],
  size: number,
  colours: readonly string[],
  params: GenerationParams,
  random: () => number,
) {
  let x = 0.1
  let y = 0
  let z = 0
  const a = 10
  const b = 16
  const c = 14.87
  const m0 = -1.143
  const m1 = -0.714
  const dt = 0.01
  const scale = 10

  let path = `M ${size / 2} ${size / 2}`

  function chuaFunction(x: number): number {
    const h = m1 * x + 0.5 * (m0 - m1) * (Math.abs(x + 1) - Math.abs(x - 1))
    return h
  }

  for (let i = 0; i < params.numSamples; i++) {
    const dx = a * (y - x + 0.2 * x) * dt
    const dy = (x - y + z) * dt
    const dz = -b * y - c * z * dt
    x += dx
    y += dy
    z += dz

    const px = size / 2 + x * scale
    const py = size / 2 + y * scale

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

/**
 * generateFlowField - Creates mathematical art visualizations
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
    case "dragoncurve":
      generateDragonCurve(pathParts, size, colours, params, random)
      break
    case "hilbertcurve":
      generateHilbertCurve(pathParts, size, colours, params, random)
      break
    case "kochsnowflake":
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
    case "grayscott":
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
    case "sine":
      generateSineGordon(pathParts, size, colours, params, random)
      break
    case "korteweg":
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
    case "halvorsen":
      generateHalvorsenAttractor(pathParts, size, colours, params, random)
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
    <svg viewBox="0 0 ${size} ${size}"  width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="stereoGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:${colours[1]};stop-opacity:0.2"/>
          <stop offset="70%" style="stop-color:${colours[0]};stop-opacity:0.6"/>
          <stop offset="100%" style="stop-color:${colours[colours.length - 1]};stop-opacity:0.9"/>
        </radialGradient>
        <clipPath id="stereoClip">
          <circle cx="${center}" cy="${center}" r="${radius}" />
        </clipPath>
        <filter id="stereoGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="${colours[0]}" />
      <circle cx="${center}" cy="${center}" r="${radius}" fill="url(#stereoGradient)" />
      
      <!-- Main content clipped to circle -->
      <g clip-path="url(#stereoClip)" filter="url(#stereoGlow)">
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
              stroke-width="3" stroke-opacity="0.8"/>
      
      <!-- Center point -->
      <circle cx="${center}" cy="${center}" r="2" fill="${colours[colours.length - 1]}" opacity="0.9"/>
      
      <!-- Projection info -->
      <text x="${size - 10}" y="20" text-anchor="end" font-family="monospace" font-size="10" 
            fill="${colours[colours.length - 1]}" opacity="0.8">
        STEREOGRAPHIC • ${perspectiveLabel}
      </text>
    </svg>
  `
}

// Helper functions for stereographic ground elements
function addUrbanStereographicElements(
  elements: string[],
  size: number,
  center: number,
  radius: number,
  colours: readonly string[],
  random: () => number,
) {
  // Add building blocks around the perimeter
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * 2 * Math.PI
    const r = radius * (0.6 + random() * 0.2)
    const x = center + r * Math.cos(angle)
    const y = center + r * Math.sin(angle)
    const buildingWidth = 15 + random() * 20
    const buildingHeight = 20 + random() * 30

    elements.push(
      `<rect x="${x - buildingWidth / 2}" y="${y - buildingHeight / 2}" width="${buildingWidth}" height="${buildingHeight}" 
             fill="${colours[i % colours.length]}" opacity="0.7" 
             transform="rotate(${(angle * 180) / Math.PI} ${x} ${y})"/>`,
    )
  }

  // Add road network
  for (let ring = 1; ring <= 3; ring++) {
    const ringRadius = (ring / 3) * radius * 0.8
    const roadPath = ""
    for (let i = 0; i <= 32; i++) {
