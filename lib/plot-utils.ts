export function generateScatterPlotSVG(data: number[][]): string {
  const width = 600
  const height = 400
  const margin = 40 // Margin for padding

  // Find min/max for scaling
  let minX = Number.POSITIVE_INFINITY,
    maxX = Number.NEGATIVE_INFINITY,
    minY = Number.POSITIVE_INFINITY,
    maxY = Number.NEGATIVE_INFINITY
  for (const [x, y] of data) {
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
  }

  // Add some padding to the data range
  const paddingFactor = 0.1
  const rangeX = maxX - minX
  const rangeY = maxY - minY
  minX -= rangeX * paddingFactor
  maxX += rangeX * paddingFactor
  minY -= rangeY * paddingFactor
  maxY += rangeY * paddingFactor

  // Scaling functions to map data coordinates to SVG pixel coordinates
  const scaleX = (val: number) => margin + ((val - minX) / (maxX - minX)) * (width - 2 * margin)
  const scaleY = (val: number) => height - margin - ((val - minY) / (maxY - minY)) * (height - 2 * margin) // Invert Y for SVG

  // For color mapping (c=np.linalg.norm(X, axis=1), cmap='magma')
  const norms = data.map(([x, y]) => Math.sqrt(x * x + y * y))
  const minNorm = Math.min(...norms)
  const maxNorm = Math.max(...norms)

  const getColor = (norm: number) => {
    // Simple linear interpolation for a 'magma' like effect
    // Approximating magma colormap with a gradient from purple to yellow
    const t = (norm - minNorm) / (maxNorm - minNorm)
    const r = Math.floor(255 * t)
    const g = Math.floor(255 * t)
    const b = Math.floor(255 * (1 - t))
    return `rgb(${r}, ${g}, ${b})`
  }

  let circles = ""
  const pointRadius = 2 // Radius for SVG points

  for (let i = 0; i < data.length; i++) {
    const [x, y] = data[i]
    const norm = norms[i]
    const color = getColor(norm)
    circles += `<circle cx="${scaleX(x)}" cy="${scaleY(y)}" r="${pointRadius}" fill="${color}" fill-opacity="0.8" />`
  }

  const svgContent = `
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="${width}" height="${height}" fill="white"/>
          ${circles}
        </svg>
      `

  // Encode SVG to base64 data URL
  return `data:image/svg+xml;base64,${Buffer.from(svgContent).toString("base64")}`
}

/**
 * plotPointsToSvg - Converts an array of points into an SVG string.
 * This function is designed to be flexible and can be extended to support
 * different SVG elements (circles, paths, etc.) and styling based on point data.
 */
export function plotPointsToSvg(
  points: { x: number; y: number; metadata?: any }[],
  colorScheme: string,
  width: number = 512,
  height: number = 512,
): string {
  let svgContent = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`

  // Determine color palette based on scheme
  const colors = getColorPalette(colorScheme)

  // Add background gradient based on color palette
  svgContent += `
    <defs>
      <radialGradient id="bg-gradient" cx="50%" cy="50%" r="70%">
        <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:0.9"/>
        <stop offset="100%" style="stop-color:${colors[1]};stop-opacity:1"/>
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bg-gradient)"/>
  `

  const minX = Math.min(...points.map((p) => p.x))
  const maxX = Math.max(...points.map((p) => p.x))
  const minY = Math.min(...points.map((p) => p.y))
  const maxY = Math.max(...points.map((p) => p.y))

  const rangeX = maxX - minX
  const rangeY = maxY - minY

  const scaleX = width / (rangeX === 0 ? 1 : rangeX) * 0.8 // Scale to fit with some padding
  const scaleY = height / (rangeY === 0 ? 1 : rangeY) * 0.8

  const offsetX = (width - rangeX * scaleX) / 2 - minX * scaleX
  const offsetY = (height - rangeY * scaleY) / 2 - minY * scaleY

  for (let i = 0; i < points.length; i++) {
    const p = points[i]
    const screenX = p.x * scaleX + offsetX
    const screenY = p.y * scaleY + offsetY

    // Cycle through the color palette
    const color = colors[i % colors.length]

    let radius = 1.5 // Default radius
    let opacity = 0.7 // Default opacity

    // Apply dynamic styling based on metadata (if available)
    if (p.metadata) {
      if (p.metadata.isStar) {
        radius = 3 + Math.random() * 2 // Larger stars
        opacity = 0.9
      } else if (p.metadata.isBlackHole) {
        radius = 10 // Very large for black hole
        opacity = 0.9
        svgContent += `<circle cx="${screenX}" cy="${screenY}" r="${radius}" fill="black" opacity="${opacity}"/>`
        svgContent += `<circle cx="${screenX}" cy="${screenY}" r="${radius * 1.2}" fill="none" stroke="white" stroke-width="0.5" opacity="0.3"/>`
        continue // Skip default circle for black hole
      } else if (p.metadata.isTree) {
        radius = 2 + Math.random() * 1 // Trees
        opacity = 0.8
      } else if (p.metadata.isFirefly) {
        radius = 1 + Math.random() * 0.5 // Small, glowing
        opacity = 0.9
        svgContent += `<circle cx="${screenX}" cy="${screenY}" r="${radius}" fill="${color}" opacity="${opacity}"/>`
        svgContent += `<circle cx="${screenX}" cy="${screenY}" r="${radius * 2}" fill="none" stroke="${color}" stroke-width="0.2" opacity="0.4"/>`
        continue
      } else if (p.metadata.isEnzyme) {
        radius = 2.5
        opacity = 0.9
      } else if (p.metadata.isIonized) {
        radius = 1.8
        opacity = 0.8
      } else if (p.metadata.lightning) {
        radius = 4
        opacity = 1
        svgContent += `<circle cx="${screenX}" cy="${screenY}" r="${radius}" fill="yellow" opacity="${opacity}"/>`
        continue
      } else if (p.metadata.earthquake) {
        radius = 5
        opacity = 1
        svgContent += `<rect x="${screenX - radius / 2}" y="${screenY - radius / 2}" width="${radius}" height="${radius}" fill="red" opacity="${opacity}"/>`
        continue
      } else if (p.metadata.mitosis) {
        radius = 3
        opacity = 0.9
      } else if (p.metadata.isObserved) {
        radius = 2.5
        opacity = 1
      }
    }

    svgContent += `<circle cx="${screenX}" cy="${screenY}" r="${radius}" fill="${color}" opacity="${opacity}"/>`
  }

  svgContent += "</svg>"
  return svgContent
}

function getColorPalette(scheme: string): string[] {
  const palettes: { [key: string]: string[] } = {
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
  }
  return palettes[scheme] || palettes.plasma // Default to plasma
}
