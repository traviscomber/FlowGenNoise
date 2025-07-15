export class PlotUtils {
  static createSVGPlot(data: Array<{ x: number; y: number }>, colorScheme: string, width = 800, height = 600): string {
    const padding = 50
    const plotWidth = width - 2 * padding
    const plotHeight = height - 2 * padding

    // Find data bounds
    const xValues = data.map((d) => d.x)
    const yValues = data.map((d) => d.y)
    const xMin = Math.min(...xValues)
    const xMax = Math.max(...xValues)
    const yMin = Math.min(...yValues)
    const yMax = Math.max(...yValues)

    // Scale functions
    const scaleX = (x: number) => padding + ((x - xMin) / (xMax - xMin)) * plotWidth
    const scaleY = (y: number) => padding + ((yMax - y) / (yMax - yMin)) * plotHeight

    // Color schemes
    const colorMaps = {
      viridis: ["#440154", "#482777", "#3f4a8a", "#31678e", "#26838f", "#1f9d8a", "#6cce5a", "#b6de2b", "#fee825"],
      plasma: [
        "#0c0786",
        "#40039c",
        "#6a00a7",
        "#8f0da4",
        "#b12a90",
        "#cc4778",
        "#e16462",
        "#f2844b",
        "#fca636",
        "#fcce25",
      ],
      inferno: [
        "#000003",
        "#1b0c41",
        "#4a0c6b",
        "#781c6d",
        "#a52c60",
        "#cf4446",
        "#ed6925",
        "#fb9b06",
        "#f7d13d",
        "#fcffa4",
      ],
      magma: ["#000003", "#1c1044", "#4f127b", "#812581", "#b5367a", "#e55964", "#fb8761", "#fec287", "#fcfdbf"],
      cividis: ["#00204c", "#00336f", "#39486b", "#575d6d", "#707173", "#8a8678", "#a69c75", "#c4b56c", "#e4cf5b"],
      rainbow: ["#ff0000", "#ff8000", "#ffff00", "#80ff00", "#00ff00", "#00ff80", "#00ffff", "#0080ff", "#0000ff"],
      grayscale: ["#000000", "#1a1a1a", "#333333", "#4d4d4d", "#666666", "#808080", "#999999", "#b3b3b3", "#cccccc"],
      neon: ["#ff00ff", "#ff0080", "#ff0040", "#ff4000", "#ff8000", "#ffff00", "#80ff00", "#00ff80", "#00ffff"],
      pastel: ["#ffb3ba", "#ffdfba", "#ffffba", "#baffc9", "#bae1ff", "#d4baff", "#ffbaff", "#ffbad4", "#c9ffba"],
      monochrome: ["#000000", "#ffffff", "#000000", "#ffffff", "#000000", "#ffffff", "#000000", "#ffffff", "#000000"],
    }

    const colors = colorMaps[colorScheme as keyof typeof colorMaps] || colorMaps.viridis

    // Generate SVG
    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`
    svg += `<rect width="${width}" height="${height}" fill="white"/>`

    // Plot points
    data.forEach((point, i) => {
      const x = scaleX(point.x)
      const y = scaleY(point.y)
      const colorIndex = Math.floor((i / data.length) * (colors.length - 1))
      const color = colors[colorIndex]

      svg += `<circle cx="${x}" cy="${y}" r="2" fill="${color}" opacity="0.7"/>`
    })

    // Add connecting lines for some patterns
    if (data.length > 1) {
      let pathData = `M ${scaleX(data[0].x)} ${scaleY(data[0].y)}`
      for (let i = 1; i < data.length; i++) {
        pathData += ` L ${scaleX(data[i].x)} ${scaleY(data[i].y)}`
      }
      svg += `<path d="${pathData}" stroke="${colors[Math.floor(colors.length / 2)]}" stroke-width="1" fill="none" opacity="0.3"/>`
    }

    svg += "</svg>"
    return svg
  }
}
