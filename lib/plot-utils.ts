import type { DataPoint } from "./flow-model"

const colorSchemes = {
  viridis: ["#440154", "#31688e", "#35b779", "#fde725"],
  plasma: ["#0d0887", "#7e03a8", "#cc4778", "#f89441", "#f0f921"],
  magma: ["#000004", "#3b0f70", "#8c2981", "#de4968", "#fe9f6d", "#fcfdbf"],
  inferno: ["#000004", "#420a68", "#932667", "#dd513a", "#fca50a", "#fcffa4"],
  cool: ["#00ffff", "#0080ff", "#0000ff", "#8000ff"],
  warm: ["#ff0000", "#ff8000", "#ffff00", "#80ff00"],
}

export function createSVGPlot(data: DataPoint[], colorScheme: string, width: number, height: number): string {
  const colors = colorSchemes[colorScheme as keyof typeof colorSchemes] || colorSchemes.viridis

  // Find data bounds
  const xValues = data.map((p) => p.x)
  const yValues = data.map((p) => p.y)
  const xMin = Math.min(...xValues)
  const xMax = Math.max(...xValues)
  const yMin = Math.min(...yValues)
  const yMax = Math.max(...yValues)

  // Add padding
  const padding = 40
  const plotWidth = width - 2 * padding
  const plotHeight = height - 2 * padding

  // Scale functions
  const scaleX = (x: number) => padding + ((x - xMin) / (xMax - xMin)) * plotWidth
  const scaleY = (y: number) => padding + ((yMax - y) / (yMax - yMin)) * plotHeight

  // Create SVG
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`

  // Background
  svg += `<rect width="${width}" height="${height}" fill="#1a1a1a"/>`

  // Plot points
  data.forEach((point) => {
    const x = scaleX(point.x)
    const y = scaleY(point.y)
    const color = colors[point.category || 0] || colors[0]

    svg += `<circle cx="${x}" cy="${y}" r="2" fill="${color}" opacity="0.8"/>`
  })

  svg += "</svg>"
  return svg
}
