import type { DataPoint } from "./flow-model"

const colorSchemes = {
  viridis: ["#440154", "#31688e", "#35b779", "#fde725"],
  plasma: ["#0d0887", "#7e03a8", "#cc4778", "#f89441", "#f0f921"],
  magma: ["#000004", "#3b0f70", "#8c2981", "#de4968", "#fe9f6d", "#fcfdbf"],
  inferno: ["#000004", "#420a68", "#932667", "#dd513a", "#fca50a", "#fcffa4"],
  cool: ["#00ffff", "#0080ff", "#0000ff", "#8000ff"],
  warm: ["#ff0000", "#ff8000", "#ffff00", "#80ff00"],
  grayscale: ["#000000", "#404040", "#808080", "#c0c0c0", "#ffffff"],
}

function getColor(value: number, scheme: string): string {
  const colors = colorSchemes[scheme as keyof typeof colorSchemes] || colorSchemes.viridis
  const index = Math.floor(value * (colors.length - 1))
  return colors[Math.max(0, Math.min(index, colors.length - 1))]
}

export function createSVGPlot(data: DataPoint[], colorScheme = "magma", width = 800, height = 600): string {
  if (!data || data.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="#f8f9fa"/>
      <text x="${width / 2}" y="${height / 2}" text-anchor="middle" fill="#666">No data to display</text>
    </svg>`
  }

  // Find data bounds
  const xValues = data.map((d) => d.x)
  const yValues = data.map((d) => d.y)
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

  // Generate SVG
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="${width}" height="${height}" fill="#ffffff"/>
    <defs>
      <style>
        .point { opacity: 0.7; }
        .point:hover { opacity: 1; stroke: #000; stroke-width: 1; }
      </style>
    </defs>`

  // Add grid
  svg += `<g stroke="#e0e0e0" stroke-width="0.5" opacity="0.5">`
  for (let i = 0; i <= 10; i++) {
    const x = padding + (i / 10) * plotWidth
    const y = padding + (i / 10) * plotHeight
    svg += `<line x1="${x}" y1="${padding}" x2="${x}" y2="${height - padding}"/>`
    svg += `<line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}"/>`
  }
  svg += `</g>`

  // Add data points
  data.forEach((point, i) => {
    const x = scaleX(point.x)
    const y = scaleY(point.y)
    const colorValue =
      point.label !== undefined
        ? point.label / Math.max(1, Math.max(...data.map((d) => d.label || 0)))
        : i / data.length
    const color = getColor(colorValue, colorScheme)

    svg += `<circle cx="${x}" cy="${y}" r="2" fill="${color}" class="point"/>`
  })

  svg += `</svg>`
  return svg
}
