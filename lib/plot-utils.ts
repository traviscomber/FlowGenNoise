export interface DataPoint {
  x: number
  y: number
  value: number
}

export interface PlotSettings {
  dataset: string
  colorScheme: string
  seed: number
  samples: number
  noise: number
}

// Color schemes mapping
const COLOR_SCHEMES: Record<string, string[]> = {
  plasma: [
    "#0d0887",
    "#46039f",
    "#7201a8",
    "#9c179e",
    "#bd3786",
    "#d8576b",
    "#ed7953",
    "#fb9f3a",
    "#fdca26",
    "#f0f921",
  ],
  viridis: ["#440154", "#482777", "#3f4a8a", "#31678e", "#26838f", "#1f9d8a", "#6cce5a", "#b6de2b", "#fee825"],
  cividis: [
    "#00224e",
    "#123570",
    "#3b496c",
    "#575d6d",
    "#707173",
    "#8a8678",
    "#a59c74",
    "#c3b369",
    "#e1cc55",
    "#fee838",
  ],
  magma: ["#000004", "#1c1044", "#4f127b", "#812581", "#b5367a", "#e55964", "#fb8761", "#fec287", "#fcfdbf"],
  inferno: [
    "#000004",
    "#1f0c48",
    "#550f6d",
    "#88226a",
    "#a83655",
    "#cc4778",
    "#e66a5c",
    "#f89441",
    "#fdc328",
    "#fcffa4",
  ],
  twilight: ["#e2d9e2", "#9ebbc9", "#6785be", "#5e43a5", "#1f0c48", "#550f6d", "#88226a", "#a83655", "#cc4778"],
  hsv: ["#ff0000", "#ff8000", "#ffff00", "#80ff00", "#00ff00", "#00ff80", "#00ffff", "#0080ff", "#0000ff", "#8000ff"],
  rainbow: ["#ff0000", "#ff4000", "#ff8000", "#ffbf00", "#ffff00", "#bfff00", "#80ff00", "#40ff00", "#00ff00"],
  grayscale: [
    "#000000",
    "#1a1a1a",
    "#333333",
    "#4d4d4d",
    "#666666",
    "#808080",
    "#999999",
    "#b3b3b3",
    "#cccccc",
    "#ffffff",
  ],
}

export function generateScatterPlotSVG(data: DataPoint[], settings: PlotSettings): string {
  const width = 800
  const height = 600
  const margin = 50

  // Find data bounds
  const xMin = Math.min(...data.map((d) => d.x))
  const xMax = Math.max(...data.map((d) => d.x))
  const yMin = Math.min(...data.map((d) => d.y))
  const yMax = Math.max(...data.map((d) => d.y))
  const valueMin = Math.min(...data.map((d) => d.value))
  const valueMax = Math.max(...data.map((d) => d.value))

  // Scale functions
  const scaleX = (x: number) => margin + ((x - xMin) / (xMax - xMin)) * (width - 2 * margin)
  const scaleY = (y: number) => height - margin - ((y - yMin) / (yMax - yMin)) * (height - 2 * margin)

  // Color mapping
  const colors = COLOR_SCHEMES[settings.colorScheme] || COLOR_SCHEMES.plasma
  const getColor = (value: number) => {
    const normalized = (value - valueMin) / (valueMax - valueMin)
    const index = Math.floor(normalized * (colors.length - 1))
    return colors[Math.max(0, Math.min(colors.length - 1, index))]
  }

  // Generate SVG points
  const points = data
    .map((point) => {
      const x = scaleX(point.x)
      const y = scaleY(point.y)
      const color = getColor(point.value)
      const radius = 1.5 + ((point.value - valueMin) / (valueMax - valueMin)) * 2

      return `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${radius.toFixed(1)}" fill="${color}" opacity="0.7"/>`
    })
    .join("\n  ")

  // Create SVG
  const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="white"/>
  <defs>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <g filter="url(#glow)">
    ${points}
  </g>
  <text x="${width / 2}" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#333">
    ${settings.dataset.charAt(0).toUpperCase() + settings.dataset.slice(1)} - ${settings.colorScheme} (${settings.samples} samples)
  </text>
</svg>`

  // Convert to base64 data URL
  return `data:image/svg+xml;base64,${btoa(svg)}`
}
