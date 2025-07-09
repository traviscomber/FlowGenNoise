/* ------------------------------------------------------------------
   FlowSketch – Plot utilities
   Exports:
     - generateScatterPlotSVG : original helper used throughout the app
     - createSVGPlot          : higher-level helper (kept for new code)
   ------------------------------------------------------------------ */

export interface DataPoint {
  x: number
  y: number
  /** Optional category / label used for colour maps */
  category?: number
}

export interface PlotConfig {
  width?: number
  height?: number
  colorScheme?: string
  backgroundColor?: string
  strokeWidth?: number
}

/* ---------- Colour maps -------------------------------------------------- */
const COLOR_SCHEMES = {
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
  magma: [
    "#000003",
    "#0b0927",
    "#231151",
    "#410f75",
    "#5f187f",
    "#7b2382",
    "#982d80",
    "#b73779",
    "#d3436e",
    "#eb5760",
    "#f8765c",
    "#fca50a",
    "#fcffa4",
  ],
  inferno: [
    "#000003",
    "#0b0924",
    "#230c4c",
    "#410967",
    "#5f187f",
    "#7b2382",
    "#982d80",
    "#b73779",
    "#d3436e",
    "#eb5760",
    "#f8765c",
    "#fca50a",
    "#fcffa4",
  ],
  cool: ["#00ffff", "#0080ff", "#0000ff", "#8000ff", "#ff00ff"],
  warm: ["#ff0000", "#ff8000", "#ffff00", "#80ff00", "#00ff00"],
  rainbow: [
    "#ff0000",
    "#ff8000",
    "#ffff00",
    "#80ff00",
    "#00ff00",
    "#00ff80",
    "#00ffff",
    "#0080ff",
    "#0000ff",
    "#8000ff",
    "#ff00ff",
    "#ff0080",
  ],
}

function getColorFromScheme(scheme: string, value: number): string {
  const colors = COLOR_SCHEMES[scheme as keyof typeof COLOR_SCHEMES] || COLOR_SCHEMES.viridis
  const index = Math.floor(value * (colors.length - 1))
  return colors[Math.min(index, colors.length - 1)]
}

/* ========================================================================== */
/* Scatter-plot generator (legacy helper used elsewhere in the code-base)     */
/* ========================================================================== */
export function generateScatterPlotSVG(data: DataPoint[], config: PlotConfig = {}): string {
  const { width = 1792, height = 1024, colorScheme = "viridis", backgroundColor = "#000000", strokeWidth = 1 } = config

  if (!data || data.length === 0) {
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${backgroundColor}"/>
      <text x="50%" y="50%" text-anchor="middle" fill="white" font-size="24">No data to display</text>
    </svg>`
  }

  // Find data bounds
  const xValues = data.map((d) => d.x)
  const yValues = data.map((d) => d.y)
  const xMin = Math.min(...xValues)
  const xMax = Math.max(...xValues)
  const yMin = Math.min(...yValues)
  const yMax = Math.max(...yValues)

  // Add padding
  const padding = 50
  const plotWidth = width - 2 * padding
  const plotHeight = height - 2 * padding

  // Scale functions
  const scaleX = (x: number) => padding + ((x - xMin) / (xMax - xMin)) * plotWidth
  const scaleY = (y: number) => padding + ((yMax - y) / (yMax - yMin)) * plotHeight

  // Generate SVG elements
  const circles = data
    .map((point, index) => {
      const x = scaleX(point.x)
      const y = scaleY(point.y)
      const colorValue = index / (data.length - 1)
      const color = getColorFromScheme(colorScheme, colorValue)

      return `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="2" fill="${color}" stroke="none" opacity="0.8"/>`
    })
    .join("\n  ")

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${backgroundColor}"/>
  ${circles}
</svg>`
}

/* ========================================================================== */
/* High-level plot helper used by newer code                                  */
/* ========================================================================== */
export function createSVGPlot(data: DataPoint[], config: PlotConfig = {}): string {
  return generateScatterPlotSVG(data, config)
}
