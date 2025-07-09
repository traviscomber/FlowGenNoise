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

/* ---------- Colour maps -------------------------------------------------- */
const colorSchemes = {
  magma: ["#000004", "#1b0c41", "#4a0c6b", "#781c6d", "#a52c60", "#cf4446", "#ed6925", "#fb9b06", "#f7d03c", "#fcffa4"],
  viridis: ["#440154", "#482777", "#3f4a8a", "#31678e", "#26838f", "#1f9d8a", "#6cce5a", "#b6de2b", "#fee825"],
  plasma: ["#0d0887", "#5302a3", "#8b0aa5", "#b83289", "#db5c68", "#f48849", "#febd2a", "#f0f921"],
  inferno: [
    "#000004",
    "#1b0c41",
    "#4a0c6b",
    "#781c6d",
    "#a52c60",
    "#cf4446",
    "#ed6925",
    "#fb9b06",
    "#f7d03c",
    "#fcffa4",
  ],
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
} as const

type SchemeName = keyof typeof colorSchemes

function getColorFromScheme(scheme: SchemeName, t: number): string {
  const colors = colorSchemes[scheme] ?? colorSchemes.magma
  const idx = Math.floor(t * (colors.length - 1))
  return colors[Math.max(0, Math.min(idx, colors.length - 1))]
}

/* ========================================================================== */
/* Scatter-plot generator (legacy helper used elsewhere in the code-base)     */
/* ========================================================================== */
export function generateScatterPlotSVG(
  data: number[][],
  colorScheme: SchemeName = "magma",
  width = 800,
  height = 600,
): string {
  if (!data?.length) {
    const empty =
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><text x="200" y="150" text-anchor="middle">No data</text></svg>'
    return "data:image/svg+xml;base64," + btoa(empty)
  }

  const padding = 50

  // Bounds
  const xs = data.map((d) => d[0])
  const ys = data.map((d) => d[1])
  const [minX, maxX] = [Math.min(...xs), Math.max(...xs)]
  const [minY, maxY] = [Math.min(...ys), Math.max(...ys)]

  const padX = (maxX - minX) * 0.1
  const padY = (maxY - minY) * 0.1

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

  data.forEach((pt, i) => {
    const [x, y] = pt
    const cx = scaleX(x)
    const cy = scaleY(y)
    const colour = getColorFromScheme(colorScheme, i / (data.length - 1))
    const r = Math.max(1, 3 - data.length / 1000)

    svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${colour}" opacity="0.8"/>`
  })

  svg += "</svg>"
  return "data:image/svg+xml;base64," + btoa(svg)
}

/* ========================================================================== */
/* High-level plot helper used by newer code                                  */
/* ========================================================================== */
export function createSVGPlot(data: DataPoint[], colorScheme: SchemeName = "magma", width = 800, height = 600): string {
  if (!data?.length) {
    const empty =
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><text x="200" y="150" text-anchor="middle">No data</text></svg>'
    return empty
  }

  const padding = 40
  const xs = data.map((d) => d.x)
  const ys = data.map((d) => d.y)
  const [minX, maxX] = [Math.min(...xs), Math.max(...xs)]
  const [minY, maxY] = [Math.min(...ys), Math.max(...ys)]

  const scaleX = (x: number) => padding + ((x - minX) / (maxX - minX || 1)) * (width - 2 * padding)
  const scaleY = (y: number) => padding + ((maxY - y) / (maxY - minY || 1)) * (height - 2 * padding)

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`
  svg += `<rect width="${width}" height="${height}" fill="#ffffff"/>`

  data.forEach((p, i) => {
    const colour =
      p.category !== undefined
        ? getColorFromScheme(colorScheme, (p.category % 10) / 9)
        : getColorFromScheme(colorScheme, i / (data.length - 1))
    svg += `<circle cx="${scaleX(p.x)}" cy="${scaleY(p.y)}" r="2" fill="${colour}" opacity="0.75"/>`
  })

  svg += "</svg>"
  return svg
}
