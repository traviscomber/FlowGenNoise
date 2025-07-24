interface Point {
  x: number
  y: number
  z: number
  color: string
  originalX: number
  originalY: number
  originalZ: number
}

export function drawFlowFieldToSVG(points: Point[], width: number, height: number): string {
  let svgContent = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`

  // Sort points by Z-coordinate for correct rendering order (further points first)
  points.sort((a, b) => a.z - b.z)

  points.forEach((point) => {
    // Simple perspective scaling for Z
    const scale = 1 - point.z / 200 // Adjust 200 for desired perspective effect
    const size = 2 * scale // Point size
    const opacity = Math.max(0.1, scale) // Opacity based on depth

    svgContent += `<circle cx="${point.x}" cy="${point.y}" r="${size}" fill="${point.color}" opacity="${opacity}" />`
  })

  svgContent += `</svg>`
  return svgContent
}
