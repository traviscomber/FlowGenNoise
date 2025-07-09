export function createSVGPlot(data: number[][], colorScheme = "magma", width = 800, height = 600): string {
  if (!data?.length) {
    const empty =
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><text x="200" y="150" text-anchor="middle">No data</text></svg>'
    return "data:image/svg+xml;base64," + btoa(empty)
  }

  /* ---------- bounds & scaling ---------- */
  const xs = data.map((d) => d[0])
  const ys = data.map((d) => d[1])
  const [minX, maxX] = [Math.min(...xs), Math.max(...xs)]
  const [minY, maxY] = [Math.min(...ys), Math.max(...ys)]
  const padX = (maxX - minX) * 0.1
  const padY = (maxY - minY) * 0.1
  const padding = 50

  const scaleX = (x: number) => ((x - minX + padX) / (maxX - minX + 2 * padX)) * (width - 2 * padding) + padding
  const scaleY = (y: number) =>
    height - padding - ((y - minY + padY) / (maxY - minY + 2 * padY)) * (height - 2 * padding)

  /* ---------- SVG assembly ---------- */
  let svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<rect width="${width}" height="${height}" fill="#1a1a1a"/>` +
    `<defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">` +
    `<path d="M40 0 L0 0 0 40" fill="none" stroke="#333" stroke-width="1" opacity="0.3"/></pattern></defs>` +
    `<rect width="${width}" height="${height}" fill="url(#grid)"/>`

  data.forEach((p, idx) => {
    const [x, y] = p
    const cVal = idx / (data.length - 1)
    const colour = getColorFromScheme(colorScheme, cVal)
    const r = Math.max(1, 3 - data.length / 1000)
    svg += `<circle cx="${scaleX(x)}" cy="${scaleY(y)}" r="${r}" fill="${colour}" opacity="0.8"/>`
  })

  svg += "</svg>"
  return "data:image/svg+xml;base64," + btoa(svg)
}

function getColorFromScheme(scheme: string, value: number): string {
  switch (scheme) {
    case "magma": {
      // Approximating magma colormap with a gradient from purple to yellow
      const r = Math.floor(255 * value)
      const g = Math.floor(255 * value)
      const b = Math.floor(255 * (1 - value))
      return `rgb(${r}, ${g}, ${b})`
    }
    case "viridis": {
      // A more complex but visually appealing colormap (approximation)
      const r = Math.floor(255 * Math.pow(value, 2))
      const g = Math.floor(255 * value)
      const b = Math.floor(255 * Math.pow(1 - value, 2))
      return `rgb(${r}, ${g}, ${b})`
    }
    case "plasma": {
      const r = Math.floor(255 * Math.pow(value, 3))
      const g = Math.floor(255 * Math.pow(value, 0.5))
      const b = Math.floor(255 * Math.pow(1 - value, 3))
      return `rgb(${r}, ${g}, ${b})`
    }
    default:
      return "white"
  }
}
