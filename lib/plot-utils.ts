// Color schemes for visualization
const colorSchemes = {
  magma: ["#000004", "#1b0c41", "#4a0c6b", "#781c6d", "#a52c60", "#cf4446", "#ed6925", "#fb9b06", "#f7d03c", "#fcffa4"],
  viridis: ["#440154", "#482777", "#3f4a8a", "#31678e", "#26838f", "#1f9d8a", "#6cce5a", "#b6de2b", "#fee825"],
  plasma: ["#0d0887", "#5302a3", "#8b0aa5", "#b83289", "#db5c68", "#f48849", "#febd2a", "#f0f921"],
  cividis: [
    "#00224e",
    "#123570",
    "#3b496c",
    "#575d6d",
    "#707173",
    "#8a8678",
    "#a59c74",
    "#c3b369",
    "#e1cc55",
    "#fee838",
  ],
  grayscale: [
    "#000000",
    "#1a1a1a",
    "#333333",
    "#4d4d4d",
    "#666666",
    "#808080",
    "#999999",
    "#b3b3b3",
    "#cccccc",
    "#ffffff",
  ],
}

function getColorFromScheme(scheme: string, value: number): string {
  const colors = colorSchemes[scheme as keyof typeof colorSchemes] || colorSchemes.magma
  const index = Math.floor(value * (colors.length - 1))
  return colors[Math.max(0, Math.min(index, colors.length - 1))]
}

export function generateScatterPlotSVG(data: number[][], colorScheme = "magma"): string {
  if (!data || data.length === 0) {
    return (
      "data:image/svg+xml;base64," +
      btoa(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><text x="200" y="200" text-anchor="middle">No data</text></svg>',
      )
    )
  }

  const width = 800
  const height = 600
  const padding = 50

  // Find data bounds
  const xValues = data.map((d) => d[0])
  const yValues = data.map((d) => d[1])
  const xMin = Math.min(...xValues)
  const xMax = Math.max(...xValues)
  const yMin = Math.min(...yValues)
  const yMax = Math.max(...yValues)

  // Add some padding to bounds
  const xRange = xMax - xMin
  const yRange = yMax - yMin
  const xPadding = xRange * 0.1
  const yPadding = yRange * 0.1

  const xScale = (x: number) => ((x - xMin + xPadding) / (xRange + 2 * xPadding)) * (width - 2 * padding) + padding
  const yScale = (y: number) =>
    height - padding - ((y - yMin + yPadding) / (yRange + 2 * yPadding)) * (height - 2 * padding)

  // Create SVG
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`

  // Background
  svg += `<rect width="${width}" height="${height}" fill="#1a1a1a"/>`

  // Grid lines
  svg += `<defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#333" stroke-width="1" opacity="0.3"/></pattern></defs>`
  svg += `<rect width="${width}" height="${height}" fill="url(#grid)"/>`

  // Data points
  data.forEach((point, index) => {
    const x = xScale(point[0])
    const y = yScale(point[1])
    const colorValue = index / (data.length - 1)
    const color = getColorFromScheme(colorScheme, colorValue)
    const radius = Math.max(1, 3 - data.length / 1000)

    svg += `<circle cx="${x}" cy="${y}" r="${radius}" fill="${color}" opacity="0.8"/>`
  })

  svg += "</svg>"

  return "data:image/svg+xml;base64," + btoa(svg)
}
