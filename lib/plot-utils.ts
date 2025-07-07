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
