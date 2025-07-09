import type { DataPoint } from "./flow-model"

export function generateScatterPlotSVG(data: DataPoint[]): string {
  const width = 800
  const height = 600
  const padding = 50

  // Find data bounds
  const xValues = data.map((d) => d.x)
  const yValues = data.map((d) => d.y)
  const xMin = Math.min(...xValues)
  const xMax = Math.max(...xValues)
  const yMin = Math.min(...yValues)
  const yMax = Math.max(...yValues)

  // Create scales
  const xScale = (x: number) => ((x - xMin) / (xMax - xMin)) * (width - 2 * padding) + padding
  const yScale = (y: number) => ((y - yMin) / (yMax - yMin)) * (height - 2 * padding) + padding

  // Generate color based on position
  const getColor = (x: number, y: number) => {
    const normalizedX = (x - xMin) / (xMax - xMin)
    const normalizedY = (y - yMin) / (yMax - yMin)
    const hue = (normalizedX + normalizedY) * 180
    return `hsl(${hue}, 70%, 50%)`
  }

  // Create SVG points
  const points = data
    .map((d) => {
      const cx = xScale(d.x)
      const cy = yScale(d.y)
      const color = getColor(d.x, d.y)
      return `<circle cx="${cx}" cy="${cy}" r="2" fill="${color}" opacity="0.7"/>`
    })
    .join("")

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#16213e;stop-opacity:1" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      ${points}
    </svg>
  `

  return `data:image/svg+xml;base64,${btoa(svg)}`
}
