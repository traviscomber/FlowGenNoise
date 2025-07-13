/**
 * PlotUtils – converts a dataset (array of points) into an SVG string.
 * Exports:
 *   • createSVGPlot(...)          – main function used by FlowArtGenerator
 *   • generateScatterPlotSVG(...) – alias kept for back-compat
 *   • PlotUtils object            – bundled export with both helpers
 */

type Point = { x: number; y: number }

interface PlotOptions {
  width?: number
  height?: number
  colorScheme?: string
  backgroundColor?: string
  pointRadius?: number
}

/* Simple colour palettes (matching FlowArtGenerator’s list) */
const PALETTES: Record<string, string[]> = {
  viridis: ["#440154", "#443983", "#31688e", "#21908d", "#35b779", "#8fd744", "#fde725"],
  plasma: ["#0d0887", "#5b02a3", "#9a179b", "#cb4679", "#ed7953", "#fdb42f", "#f0f921"],
  magma: ["#000004", "#180f3d", "#451077", "#721f81", "#9f2f7f", "#cd4071", "#f3785b", "#fca50a", "#f6e620"],
  inferno: ["#000004", "#180b3a", "#400b6f", "#6a176e", "#932667", "#bc3754", "#e55035", "#f77f0e", "#f9c932"],
  cool: ["#00ffff", "#0080ff", "#0000ff", "#8000ff"],
  warm: ["#ff0000", "#ff8000", "#ffff00", "#80ff00"],
}

function interpolateColor(colors: string[], t: number) {
  const n = colors.length - 1
  const i = Math.floor(t * n)
  const f = t * n - i
  const c1 = colors[i]
  const c2 = colors[i + 1] ?? colors[i]
  const toRGB = (hex: string) =>
    hex
      .slice(1)
      .match(/.{2}/g)!
      .map((v) => Number.parseInt(v, 16))
  const [r1, g1, b1] = toRGB(c1)
  const [r2, g2, b2] = toRGB(c2)
  const r = Math.round(r1 + (r2 - r1) * f)
  const g = Math.round(g1 + (g2 - g1) * f)
  const b = Math.round(b1 + (b2 - b1) * f)
  return `rgb(${r},${g},${b})`
}

export function createSVGPlot(
  data: Point[],
  {
    width = 800,
    height = 600,
    colorScheme = "viridis",
    backgroundColor = "#ffffff",
    pointRadius = 2,
  }: PlotOptions = {},
): string {
  // Normalise points to [0-1] range
  const xs = data.map((p) => p.x)
  const ys = data.map((p) => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)

  const colors = PALETTES[colorScheme] ?? PALETTES.viridis

  const circles = data
    .map((p, i) => {
      const t = i / (data.length - 1)
      const cx = ((p.x - minX) / (maxX - minX || 1)) * width
      const cy = ((p.y - minY) / (maxY - minY || 1)) * height
      const fill = interpolateColor(colors, t)
      return `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${pointRadius}" fill="${fill}" />`
    })
    .join("")

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="${backgroundColor}" />
      ${circles}
    </svg>
  `
}

/* ------------------------------------------------------------------ */
/* Backwards-compat alias – some older components still import this   */
/* ------------------------------------------------------------------ */
export const generateScatterPlotSVG = createSVGPlot

/* Bundle helper */
export const PlotUtils = { createSVGPlot, generateScatterPlotSVG }
