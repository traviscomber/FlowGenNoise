/**
 * FlowSketch – SVG rendering helpers
 *
 * Exports:
 *   • createSVGPlot            – main helper (width/height configurable)
 *   • generateScatterPlotSVG   – alias (kept for backwards compatibility)
 *   • PlotUtils                – object bundling the helpers
 */

import type { Point } from "./flow-model"

/* Basic palettes – used when a colour scheme string doesn’t match */
const DEFAULT_PALETTE = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"]

function getPalette(scheme: string): string[] {
  switch (scheme) {
    case "viridis":
      return ["#440154", "#31688e", "#35b779", "#fde725"]
    case "plasma":
      return ["#0d0887", "#7e03a8", "#cc4778", "#f89441", "#f0f921"]
    case "inferno":
      return ["#000004", "#420a68", "#932667", "#dd513a", "#fca50a", "#fcffa4"]
    case "magma":
      return ["#000004", "#3b0f70", "#8c2981", "#de4968", "#fe9f6d", "#fcfdbf"]
    case "cool":
      return ["#00ffff", "#0080ff", "#0000ff", "#8000ff"]
    case "warm":
      return ["#ff0000", "#ff8000", "#ffff00", "#80ff00"]
    case "turbo":
      return ["#30123b", "#4140ba", "#2e9df5", "#4bd276", "#f3f34c", "#f79a23", "#ca2928"]
    default:
      return DEFAULT_PALETTE
  }
}

/**
 * Create a simple scatter-plot SVG string for a list of points
 */
export function createSVGPlot(points: Point[], colorScheme: string, width = 800, height = 600): string {
  if (!points.length) return "<svg xmlns='http://www.w3.org/2000/svg'/>"

  // Get bounds
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)

  const palette = getPalette(colorScheme)
  const radius = Math.max(1, Math.min(width, height) / 300)

  const circles = points
    .map((p, idx) => {
      const cx = ((p.x - minX) / (maxX - minX)) * width
      // Flip y so origin is bottom-left
      const cy = height - ((p.y - minY) / (maxY - minY)) * height
      const fill = palette[idx % palette.length]
      return `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${radius}" fill="${fill}" />`
    })
    .join("")

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${circles}</svg>`
}

/* -------------------------------------------------------------------------- */
/*  Alias kept to satisfy any legacy import/usage                            */
/* -------------------------------------------------------------------------- */
export const generateScatterPlotSVG = createSVGPlot

/* -------------------------------------------------------------------------- */
/*  Bundle helpers for the `{ PlotUtils }` named import in FlowArtGenerator   */
/* -------------------------------------------------------------------------- */
export const PlotUtils = {
  createSVGPlot,
  generateScatterPlotSVG,
}
