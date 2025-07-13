// lib/plot-utils.ts
export const PlotUtils = {
  createSVGPlot: (data: { x: number; y: number }[], colorScheme: string, width: number, height: number): string => {
    const margin = { top: 20, right: 20, bottom: 30, left: 40 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Find min/max for scaling
    const xMin = Math.min(...data.map((d) => d.x))
    const xMax = Math.max(...data.map((d) => d.x))
    const yMin = Math.min(...data.map((d) => d.y))
    const yMax = Math.max(...data.map((d) => d.y))

    // Simple linear scaling
    const xScale = (value: number) => ((value - xMin) / (xMax - xMin)) * innerWidth
    const yScale = (value: number) => innerHeight - ((value - yMin) / (yMax - yMin)) * innerHeight // Invert Y for SVG

    // Determine color based on a simple gradient or fixed colors for now
    // In a real implementation, you'd map data values to a color scale
    const getColor = (index: number) => {
      const colors: { [key: string]: string[] } = {
        plasma: ["#0d0887", "#6a00a8", "#b12a90", "#e16462", "#fca636", "#fcce2b"],
        viridis: [
          "#440154",
          "#482878",
          "#3e4989",
          "#31688e",
          "#26828e",
          "#1f9e89",
          "#35b779",
          "#6ece58",
          "#b5de2b",
          "#fde725",
        ],
        cividis: [
          "#00204d",
          "#003366",
          "#004780",
          "#005a99",
          "#006eb3",
          "#0082cc",
          "#0096e6",
          "#00aaff",
          "#00bfff",
          "#00d4ff",
        ],
        magma: ["#000004", "#1d1147", "#51127c", "#87258e", "#bc378c", "#e75e6f", "#f9945d", "#fecf4f", "#fcffa4"],
        inferno: ["#000004", "#2c105c", "#680f6b", "#9e175a", "#cd2e43", "#f16024", "#fca50a", "#fcf823"],
        twilight: [
          "#000000",
          "#2d004b",
          "#5c0096",
          "#8b00e0",
          "#b900ff",
          "#e800ff",
          "#ff00e8",
          "#ff00b9",
          "#ff008b",
          "#ff005c",
          "#ff002d",
          "#ff0000",
        ],
        hsv: ["#FF0000", "#FFFF00", "#00FF00", "#00FFFF", "#0000FF", "#FF00FF"], // Simplified HSV
        rainbow: ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#9400D3"],
        grayscale: ["#000000", "#333333", "#666666", "#999999", "#CCCCCC", "#FFFFFF"],
      }
      const schemeColors = colors[colorScheme] || colors.plasma // Default to plasma
      return schemeColors[index % schemeColors.length]
    }

    let circles = ""
    data.forEach((d, i) => {
      const cx = xScale(d.x)
      const cy = yScale(d.y)
      const color = getColor(i)
      circles += `<circle cx="${cx}" cy="${cy}" r="2" fill="${color}" />`
    })

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="#f8f8f8"/>
        <g transform="translate(${margin.left},${margin.top})">
          ${circles}
        </g>
      </svg>
    `
  },
}
