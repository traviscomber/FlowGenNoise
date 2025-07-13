import type { DataPoint } from "./flow-model"

export interface ColorScheme {
  name: string
  colors: string[]
}

const COLOR_SCHEMES: Record<string, string[]> = {
  viridis: ["#440154", "#482777", "#3f4a8a", "#31678e", "#26838f", "#1f9d8a", "#6cce5a", "#b6de2b", "#fee825"],
  plasma: [
    "#0c0786",
    "#40039c",
    "#6a00a7",
    "#8f0da4",
    "#b12a90",
    "#cc4778",
    "#e16462",
    "#fb9b06",
    "#f7d13d",
    "#fcce25",
  ],
  inferno: [
    "#000003",
    "#1b0c41",
    "#4a0c6b",
    "#781c6d",
    "#a52c60",
    "#cf4446",
    "#ed6925",
    "#fb9b06",
    "#f7d13d",
    "#fcffa4",
  ],
  magma: ["#000003", "#1c1044", "#4f127b", "#812581", "#b5367a", "#e55964", "#fb8761", "#fec287", "#fcfdbf"],
  cividis: ["#00204c", "#00336f", "#39486b", "#575d6d", "#707173", "#8a8678", "#a69c75", "#c4b56c", "#e4cf5b"],
  turbo: ["#23171b", "#271a28", "#2d1e3e", "#3e2357", "#52286f", "#662d91", "#7b31b2", "#9035d3", "#a53af2"],
  rainbow: ["#ff0000", "#ff8000", "#ffff00", "#80ff00", "#00ff00", "#00ff80", "#00ffff", "#0080ff", "#0000ff"],
  cool: ["#00ffff", "#40bfff", "#8080ff", "#bf40ff", "#ff00ff"],
  warm: ["#ff0000", "#ff4000", "#ff8000", "#ffbf00", "#ffff00"],
}

export function generateScatterPlotSVG(data: DataPoint[]): string {
  if (!data || data.length === 0) {
    return ""
  }

  // Calculate bounds
  const xValues = data.map((d) => d.x)
  const yValues = data.map((d) => d.y)
  const xMin = Math.min(...xValues)
  const xMax = Math.max(...xValues)
  const yMin = Math.min(...yValues)
  const yMax = Math.max(...yValues)

  // Add padding
  const padding = 0.1
  const xRange = xMax - xMin
  const yRange = yMax - yMin
  const xPadding = xRange * padding
  const yPadding = yRange * padding

  const viewBoxXMin = xMin - xPadding
  const viewBoxXMax = xMax + xPadding
  const viewBoxYMin = yMin - yPadding
  const viewBoxYMax = yMax + yPadding

  const viewBoxWidth = viewBoxXMax - viewBoxXMin
  const viewBoxHeight = viewBoxYMax - viewBoxYMin

  // SVG dimensions
  const svgWidth = 800
  const svgHeight = 600

  // Get unique clusters
  const clusters = [...new Set(data.map((d) => d.cluster || 0))]
  const colors = COLOR_SCHEMES.viridis

  // Create SVG
  let svg = `<svg width="${svgWidth}" height="${svgHeight}" viewBox="${viewBoxXMin} ${viewBoxYMin} ${viewBoxWidth} ${viewBoxHeight}" xmlns="http://www.w3.org/2000/svg">`

  // Add background
  svg += `<rect x="${viewBoxXMin}" y="${viewBoxYMin}" width="${viewBoxWidth}" height="${viewBoxHeight}" fill="#1a1a1a"/>`

  // Add points
  data.forEach((point, index) => {
    const cluster = point.cluster || 0
    const colorIndex = cluster % colors.length
    const color = colors[colorIndex]
    const radius = 0.02 * Math.min(viewBoxWidth, viewBoxHeight)

    svg += `<circle cx="${point.x}" cy="${point.y}" r="${radius}" fill="${color}" opacity="0.8"/>`
  })

  svg += "</svg>"

  // Convert to base64 data URL
  const base64 = btoa(svg)
  return `data:image/svg+xml;base64,${base64}`
}
