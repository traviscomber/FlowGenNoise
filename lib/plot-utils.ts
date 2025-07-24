export function drawFlowArt(
  canvas: HTMLCanvasElement,
  points: Array<{ x: number; y: number; metadata: any }>,
  colors: string[],
  stereographicProjection: boolean,
  stereographicPerspective: string,
) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const width = canvas.width
  const height = canvas.height

  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = "black" // Background color
  ctx.fillRect(0, 0, width, height)

  const pointSize = 1.5 // Base point size

  for (let i = 0; i < points.length; i++) {
    let { x, y, metadata } = points[i]

    // Apply stereographic projection if enabled
    if (stereographicProjection) {
      ;[x, y] = applyStereographicProjection(x, y, stereographicPerspective)
    }

    // Map normalized [0,1] coordinates to canvas dimensions
    const displayX = x * width
    const displayY = y * height

    // Determine color based on metadata or simple gradient
    let color = colors[Math.floor((i / points.length) * colors.length)]

    // Example: Color based on 'magnitude' metadata for 'pure' scenario
    if (metadata && typeof metadata.magnitude === "number") {
      const colorIndex = Math.floor((metadata.magnitude / 2) * colors.length) // Assuming magnitude up to ~2
      color = colors[Math.min(colors.length - 1, Math.max(0, colorIndex))]
    }
    // Example: Color based on 'isTree' for 'forest' scenario
    if (metadata && typeof metadata.isTree === "boolean") {
      color = metadata.isTree ? "#228B22" : "#8B4513" // Green for trees, brown for ground
    }
    // Example: Color based on 'isStar' for 'cosmic' scenario
    if (metadata && typeof metadata.isStar === "boolean") {
      color = metadata.isStar ? "#FFD700" : "#4B0082" // Gold for stars, indigo for space
    }
    // Example: Color based on 'depth' for 'ocean' scenario
    if (metadata && typeof metadata.depth === "number") {
      const depthNormalized = metadata.depth / 1000 // Normalize depth to 0-1
      const deepColor = `rgb(0, 0, ${Math.floor(50 + depthNormalized * 200)})`
      const shallowColor = `rgb(0, ${Math.floor(100 + (1 - depthNormalized) * 150)}, ${Math.floor(
        200 + (1 - depthNormalized) * 50,
      )})`
      color = depthNormalized > 0.5 ? deepColor : shallowColor
    }
    // Example: Color based on 'neuronType' for 'neural' scenario
    if (metadata && typeof metadata.neuronType === "number") {
      const neuronColors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF"]
      color = neuronColors[metadata.neuronType % neuronColors.length]
    }
    // Example: Color based on 'isParticle' for 'quantum' scenario
    if (metadata && typeof metadata.isParticle === "boolean") {
      color = metadata.isParticle ? "#00FFFF" : "#FF00FF" // Cyan for particles, magenta for waves
    }
    // Example: Color based on 'cellState' for 'microscopic' scenario
    if (metadata && typeof metadata.cellState === "number") {
      color = metadata.cellState === 1 ? "#00FF00" : "#FF0000" // Green for live, red for dead
    }
    // Example: Color based on 'crystalSystem' for 'crystal' scenario
    if (metadata && typeof metadata.crystalSystem === "number") {
      const crystalColors = ["#ADD8E6", "#87CEEB", "#6495ED", "#4169E1", "#1E90FF", "#00BFFF", "#00CED1"]
      color = crystalColors[metadata.crystalSystem % crystalColors.length]
    }
    // Example: Color based on 'plasmaState' for 'plasma' scenario
    if (metadata && typeof metadata.plasmaState === "string") {
      color = metadata.plasmaState === "hot" ? "#FF4500" : "#00FFFF" // Orange-red for hot, cyan for cold
    }
    // Example: Color based on 'temperature' for 'atmospheric' scenario
    if (metadata && typeof metadata.temperature === "number") {
      const tempNormalized = (metadata.temperature + 20) / 50 // Normalize -20 to 30 C
      const coldColor = `rgb(0, 0, ${Math.floor(150 + tempNormalized * 100)})`
      const hotColor = `rgb(${Math.floor(150 + tempNormalized * 100)}, 0, 0)`
      color = tempNormalized > 0.5 ? hotColor : coldColor
    }
    // Example: Color based on 'rockType' for 'geological' scenario
    if (metadata && typeof metadata.rockType === "number") {
      const rockColors = ["#8B4513", "#A0522D", "#D2B48C"] // Brown, Sienna, Tan
      color = rockColors[metadata.rockType % rockColors.length]
    }
    // Example: Color based on 'cellState' for 'biological' scenario
    if (metadata && typeof metadata.cellState === "string") {
      color = metadata.cellState === "active" ? "#00FF00" : "#FFD700" // Green for active, gold for resting
    }
    // Example: Color based on 'isGalaxyCluster' for 'cosmic_scale' scenario
    if (metadata && typeof metadata.isGalaxyCluster === "boolean") {
      color = metadata.isGalaxyCluster ? "#FFD700" : "#4B0082" // Gold for clusters, indigo for void
    }
    // Example: Color based on 'particleType' for 'microscopic_world' scenario
    if (metadata && typeof metadata.particleType === "number") {
      const particleColors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"]
      color = particleColors[metadata.particleType % particleColors.length]
    }
    // Example: Color based on 'isGlowing' for 'living_forest' scenario
    if (metadata && typeof metadata.isGlowing === "boolean") {
      color = metadata.isGlowing ? "#00FF00" : "#228B22" // Bright green for glowing, dark green for normal
    }
    // Example: Color based on 'hasHydrothermalVent' for 'deep_ocean' scenario
    if (metadata && typeof metadata.hasHydrothermalVent === "boolean") {
      color = metadata.hasHydrothermalVent ? "#FF4500" : "#000080" // Orange-red for vents, deep blue for ocean
    }
    // Example: Color based on 'emergentProperty' for 'biological_systems' scenario
    if (metadata && typeof metadata.emergentProperty === "boolean") {
      color = metadata.emergentProperty ? "#00FFFF" : "#FF00FF" // Cyan for emergent, magenta for individual
    }
    // Example: Color based on 'isIceAge' for 'geological_time' scenario
    if (metadata && typeof metadata.isIceAge === "boolean") {
      color = metadata.isIceAge ? "#ADD8E6" : "#8B4513" // Light blue for ice age, brown for normal
    }

    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(displayX, displayY, pointSize, 0, Math.PI * 2)
    ctx.fill()
  }
}

function applyStereographicProjection(x: number, y: number, perspective: string): [number, number] {
  // Normalize x, y from [0,1] to [-1,1] for projection
  const nx = x * 2 - 1
  const ny = y * 2 - 1

  let X, Y, Z
  // Map 2D point to a sphere (e.g., unit sphere)
  // This is a simplified inverse stereographic projection to get a 3D point
  // For a "little planet" effect, we project from the top of the sphere.
  // For "tunnel vision", we project from the side.

  if (perspective === "little_planet") {
    // Inverse stereographic projection from plane to sphere (from North Pole)
    const r2 = nx * nx + ny * ny
    X = (2 * nx) / (1 + r2)
    Y = (2 * ny) / (1 + r2)
    Z = (1 - r2) / (1 + r2) // Z is height, North Pole is (0,0,1)
  } else {
    // Inverse stereographic projection from plane to sphere (from a side point, e.g., (1,0,0))
    const r2 = nx * nx + ny * ny
    X = (r2 - 1) / (r2 + 1) // X is depth
    Y = (2 * nx) / (r2 + 1)
    Z = (2 * ny) / (r2 + 1)
  }

  // Now project back to 2D plane from a different perspective point
  // For "little planet", project from South Pole (0,0,-1)
  // For "tunnel vision", project from a point far along X axis (e.g., (2,0,0))

  let projectedX, projectedY

  if (perspective === "little_planet") {
    // Project from South Pole (0,0,-1) back to plane Z=0
    // The projection point is (0,0,-1). The plane is z=0.
    // Line from (0,0,-1) to (X,Y,Z) intersects z=0 at:
    // x_proj = X / (1+Z)
    // y_proj = Y / (1+Z)
    const divisor = 1 + Z
    projectedX = X / divisor
    projectedY = Y / divisor
  } else {
    // Project from a point (2,0,0) back to plane X=0
    // The projection point is (2,0,0). The plane is x=0.
    // Line from (2,0,0) to (X,Y,Z) intersects x=0 at:
    // y_proj = Y * (2 / (2 - X))
    // z_proj = Z * (2 / (2 - X))
    const divisor = 2 - X
    projectedX = Y / divisor // This becomes the new X
    projectedY = Z / divisor // This becomes the new Y
  }

  // Normalize back to [0,1] range for canvas
  // These values can go outside [-1,1] depending on projection, so we need to clamp or handle
  const finalX = (projectedX + 1) / 2
  const finalY = (projectedY + 1) / 2

  // Clamp values to ensure they stay within the canvas bounds
  return [Math.max(0, Math.min(1, finalX)), Math.max(0, Math.min(1, finalY))]
}

export function downloadImage(dataUrl: string, filename: string) {
  const link = document.createElement("a")
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function getSvgDataUrl(
  points: Array<{ x: number; y: number; metadata: any }>,
  colors: string[],
  stereographicProjection: boolean,
  stereographicPerspective: string,
  width: number,
  height: number,
): string {
  let svgContent = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`
  svgContent += `<rect width="${width}" height="${height}" fill="black"/>` // Background

  const pointRadius = 1.5 // Base radius for SVG circles

  for (let i = 0; i < points.length; i++) {
    let { x, y, metadata } = points[i]

    // Apply stereographic projection if enabled
    if (stereographicProjection) {
      ;[x, y] = applyStereographicProjection(x, y, stereographicPerspective)
    }

    // Map normalized [0,1] coordinates to SVG dimensions
    const displayX = x * width
    const displayY = y * height

    // Determine color based on metadata or simple gradient
    let color = colors[Math.floor((i / points.length) * colors.length)]

    // Example: Color based on 'magnitude' metadata for 'pure' scenario
    if (metadata && typeof metadata.magnitude === "number") {
      const colorIndex = Math.floor((metadata.magnitude / 2) * colors.length) // Assuming magnitude up to ~2
      color = colors[Math.min(colors.length - 1, Math.max(0, colorIndex))]
    }
    // Example: Color based on 'isTree' for 'forest' scenario
    if (metadata && typeof metadata.isTree === "boolean") {
      color = metadata.isTree ? "#228B22" : "#8B4513" // Green for trees, brown for ground
    }
    // Example: Color based on 'isStar' for 'cosmic' scenario
    if (metadata && typeof metadata.isStar === "boolean") {
      color = metadata.isStar ? "#FFD700" : "#4B0082" // Gold for stars, indigo for space
    }
    // Example: Color based on 'depth' for 'ocean' scenario
    if (metadata && typeof metadata.depth === "number") {
      const depthNormalized = metadata.depth / 1000 // Normalize depth to 0-1
      const deepColor = `rgb(0, 0, ${Math.floor(50 + depthNormalized * 200)})`
      const shallowColor = `rgb(0, ${Math.floor(100 + (1 - depthNormalized) * 150)}, ${Math.floor(
        200 + (1 - depthNormalized) * 50,
      )})`
      color = depthNormalized > 0.5 ? deepColor : shallowColor
    }
    // Example: Color based on 'neuronType' for 'neural' scenario
    if (metadata && typeof metadata.neuronType === "number") {
      const neuronColors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF"]
      color = neuronColors[metadata.neuronType % neuronColors.length]
    }
    // Example: Color based on 'isParticle' for 'quantum' scenario
    if (metadata && typeof metadata.isParticle === "boolean") {
      color = metadata.isParticle ? "#00FFFF" : "#FF00FF" // Cyan for particles, magenta for waves
    }
    // Example: Color based on 'cellState' for 'microscopic' scenario
    if (metadata && typeof metadata.cellState === "number") {
      color = metadata.cellState === 1 ? "#00FF00" : "#FF0000" // Green for live, red for dead
    }
    // Example: Color based on 'crystalSystem' for 'crystal' scenario
    if (metadata && typeof metadata.crystalSystem === "number") {
      const crystalColors = ["#ADD8E6", "#87CEEB", "#6495ED", "#4169E1", "#1E90FF", "#00BFFF", "#00CED1"]
      color = crystalColors[metadata.crystalSystem % crystalColors.length]
    }
    // Example: Color based on 'plasmaState' for 'plasma' scenario
    if (metadata && typeof metadata.plasmaState === "string") {
      color = metadata.plasmaState === "hot" ? "#FF4500" : "#00FFFF" // Orange-red for hot, cyan for cold
    }
    // Example: Color based on 'temperature' for 'atmospheric' scenario
    if (metadata && typeof metadata.temperature === "number") {
      const tempNormalized = (metadata.temperature + 20) / 50 // Normalize -20 to 30 C
      const coldColor = `rgb(0, 0, ${Math.floor(150 + tempNormalized * 100)})`
      const hotColor = `rgb(${Math.floor(150 + tempNormalized * 100)}, 0, 0)`
      color = tempNormalized > 0.5 ? hotColor : coldColor
    }
    // Example: Color based on 'rockType' for 'geological' scenario
    if (metadata && typeof metadata.rockType === "number") {
      const rockColors = ["#8B4513", "#A0522D", "#D2B48C"] // Brown, Sienna, Tan
      color = rockColors[metadata.rockType % rockColors.length]
    }
    // Example: Color based on 'cellState' for 'biological' scenario
    if (metadata && typeof metadata.cellState === "string") {
      color = metadata.cellState === "active" ? "#00FF00" : "#FFD700" // Green for active, gold for resting
    }
    // Example: Color based on 'isGalaxyCluster' for 'cosmic_scale' scenario
    if (metadata && typeof metadata.isGalaxyCluster === "boolean") {
      color = metadata.isGalaxyCluster ? "#FFD700" : "#4B0082" // Gold for clusters, indigo for void
    }
    // Example: Color based on 'particleType' for 'microscopic_world' scenario
    if (metadata && typeof metadata.particleType === "number") {
      const particleColors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"]
      color = particleColors[metadata.particleType % particleColors.length]
    }
    // Example: Color based on 'isGlowing' for 'living_forest' scenario
    if (metadata && typeof metadata.isGlowing === "boolean") {
      color = metadata.isGlowing ? "#00FF00" : "#228B22" // Bright green for glowing, dark green for normal
    }
    // Example: Color based on 'hasHydrothermalVent' for 'deep_ocean' scenario
    if (metadata && typeof metadata.hasHydrothermalVent === "boolean") {
      color = metadata.hasHydrothermalVent ? "#FF4500" : "#000080" // Orange-red for vents, deep blue for ocean
    }
    // Example: Color based on 'emergentProperty' for 'biological_systems' scenario
    if (metadata && typeof metadata.emergentProperty === "boolean") {
      color = metadata.emergentProperty ? "#00FFFF" : "#FF00FF" // Cyan for emergent, magenta for individual
    }
    // Example: Color based on 'isIceAge' for 'geological_time' scenario
    if (metadata && typeof metadata.isIceAge === "boolean") {
      color = metadata.isIceAge ? "#ADD8E6" : "#8B4513" // Light blue for ice age, brown for normal
    }

    svgContent += `<circle cx="${displayX}" cy="${displayY}" r="${pointRadius}" fill="${color}"/>`
  }

  svgContent += `</svg>`
  return `data:image/svg+xml;base64,${btoa(svgContent)}`
}
