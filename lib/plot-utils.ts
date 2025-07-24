interface Point {
  x: number
  y: number
}

export function plotPointsToSvg(points: Point[], colorScheme: string): string {
  // Determine min/max x and y for scaling
  let minX = Number.POSITIVE_INFINITY,
    maxX = Number.NEGATIVE_INFINITY,
    minY = Number.POSITIVE_INFINITY,
    maxY = Number.NEGATIVE_INFINITY
  for (const p of points) {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
  }

  // Add some padding
  const padding = 0.1
  const rangeX = maxX - minX
  const rangeY = maxY - minY
  minX -= rangeX * padding
  maxX += rangeX * padding
  minY -= rangeY * padding
  maxY += rangeY * padding

  const viewBoxWidth = maxX - minX
  const viewBoxHeight = maxY - minY

  // Define SVG dimensions
  const svgWidth = 1024
  const svgHeight = 1024

  // Map color scheme name to actual colors (simplified for example)
  const colors = getColorScheme(colorScheme)

  let svgContent = `<svg viewBox="${minX} ${minY} ${viewBoxWidth} ${viewBoxHeight}" width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`

  // Draw points as circles
  const pointRadius = Math.min(viewBoxWidth, viewBoxHeight) / 200 // Adjust radius based on viewBox size
  points.forEach((p, i) => {
    const colorIndex = Math.floor((i / points.length) * colors.length)
    const color = colors[colorIndex]
    svgContent += `<circle cx="${p.x}" cy="${p.y}" r="${pointRadius}" fill="${color}" opacity="0.7" />`
  })

  svgContent += `</svg>`
  return svgContent
}

function getColorScheme(scheme: string): string[] {
  switch (scheme) {
    case "plasma":
      return [
        "#0d0887",
        "#40039c",
        "#6a00a8",
        "#8f00a7",
        "#af00a4",
        "#cb00a0",
        "#e3009b",
        "#f70093",
        "#ff008b",
        "#ff5f73",
      ]
    case "viridis":
      return ["#440154", "#482878", "#3e4989", "#31688e", "#26838f", "#1f9d8a", "#6ece58", "#b5de2b", "#fde725"]
    case "magma":
      return ["#000004", "#1d1147", "#51127c", "#871f7f", "#bc3754", "#ed6925", "#fcb01e", "#fcfdbf"]
    case "cividis":
      return [
        "#00204d",
        "#003366",
        "#004780",
        "#005c99",
        "#0070b3",
        "#0085cc",
        "#0099e6",
        "#00ade0",
        "#00c2fa",
        "#00d6ff",
      ]
    case "rainbow":
      return ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#9400D3"]
    default:
      return ["#000000", "#FFFFFF"] // Default to black and white
  }
}
