import type { DataPoint } from "./flow-model"

export function generateScatterPlotSVG(data: DataPoint[]): string {
  const width = 800
  const height = 600
  const margin = 50

  // Find data bounds
  const xExtent = data.reduce(
    (acc, d) => [Math.min(acc[0], d.x), Math.max(acc[1], d.x)],
    [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY],
  )
  const yExtent = data.reduce(
    (acc, d) => [Math.min(acc[0], d.y), Math.max(acc[1], d.y)],
    [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY],
  )

  // Scale functions
  const xScale = (x: number) => margin + ((x - xExtent[0]) / (xExtent[1] - xExtent[0])) * (width - 2 * margin)
  const yScale = (y: number) => height - margin - ((y - yExtent[0]) / (yExtent[1] - yExtent[0])) * (height - 2 * margin)

  // Color palette
  const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7"]

  // Generate SVG
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="white"/>
    <defs>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>`

  // Add data points
  data.forEach((point) => {
    const x = xScale(point.x)
    const y = yScale(point.y)
    const color = colors[point.category || 0]
    const radius = 3 + Math.random() * 2

    svg += `<circle cx="${x}" cy="${y}" r="${radius}" fill="${color}" opacity="0.7" filter="url(#glow)"/>`
  })

  svg += "</svg>"

  // Convert to base64 data URL
  const base64 = Buffer.from(svg).toString("base64")
  return `data:image/svg+xml;base64,${base64}`
}
