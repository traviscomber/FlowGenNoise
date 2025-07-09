import type { DataPoint } from "./flow-model"

const colorSchemes = {
  magma: ["#000004", "#3b0f70", "#8c2981", "#de4968", "#fe9f6d", "#fcfdbf"],
  viridis: ["#440154", "#482777", "#3f4a8a", "#31678e", "#26838f", "#1f9d8a", "#6cce5a", "#b6de2b", "#fee825"],
  plasma: ["#0d0887", "#5302a3", "#8b0aa5", "#b83289", "#db5c68", "#f48849", "#febd2a", "#f0f921"],
  cividis: ["#00224e", "#123570", "#3b496c", "#575d6d", "#707173", "#8a8678", "#a59c74", "#c3b369", "#e1cc55"],
  grayscale: ["#000000", "#404040", "#808080", "#c0c0c0", "#ffffff"],
}

export function generateScatterPlotSVG(data: DataPoint[], colorScheme = "magma"): string {
  const width = 800
  const height = 600
  const margin = 50

  // Find data bounds
  const xExtent = [Math.min(...data.map((d) => d.x)), Math.max(...data.map((d) => d.x))]
  const yExtent = [Math.min(...data.map((d) => d.y)), Math.max(...data.map((d) => d.y))]

  // Add padding
  const xPadding = (xExtent[1] - xExtent[0]) * 0.1
  const yPadding = (yExtent[1] - yExtent[0]) * 0.1
  xExtent[0] -= xPadding
  xExtent[1] += xPadding
  yExtent[0] -= yPadding
  yExtent[1] += yPadding

  // Scale functions
  const xScale = (x: number) => margin + ((x - xExtent[0]) / (xExtent[1] - xExtent[0])) * (width - 2 * margin)
  const yScale = (y: number) => height - margin - ((y - yExtent[0]) / (yExtent[1] - yExtent[0])) * (height - 2 * margin)

  const colors = colorSchemes[colorScheme as keyof typeof colorSchemes] || colorSchemes.magma
  const numCategories = Math.max(...data.map((d) => d.category)) + 1

  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="#fafafa"/>
    <defs>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>`

  // Add grid
  const gridLines = 10
  for (let i = 0; i <= gridLines; i++) {
    const x = margin + (i / gridLines) * (width - 2 * margin)
    const y = margin + (i / gridLines) * (height - 2 * margin)
    svg += `<line x1="${x}" y1="${margin}" x2="${x}" y2="${height - margin}" stroke="#e0e0e0" stroke-width="0.5"/>`
    svg += `<line x1="${margin}" y1="${y}" x2="${width - margin}" y2="${y}" stroke="#e0e0e0" stroke-width="0.5"/>`
  }

  // Add data points
  data.forEach((point) => {
    const x = xScale(point.x)
    const y = yScale(point.y)
    const colorIndex = Math.floor((point.category / numCategories) * (colors.length - 1))
    const color = colors[colorIndex]
    const radius = 3 + Math.random() * 2

    svg += `<circle cx="${x}" cy="${y}" r="${radius}" fill="${color}" opacity="0.7" filter="url(#glow)"/>`
  })

  // Add axes
  svg += `<line x1="${margin}" y1="${height - margin}" x2="${width - margin}" y2="${height - margin}" stroke="#333" stroke-width="2"/>`
  svg += `<line x1="${margin}" y1="${margin}" x2="${margin}" y2="${height - margin}" stroke="#333" stroke-width="2"/>`

  svg += "</svg>"

  return `data:image/svg+xml;base64,${btoa(svg)}`
}
