// lib/plot-utils.ts
import type { FlowArtSettings } from "./flow-model"

// Define a type for the data points
export type DataPoint = { x: number; y: number; value: number }

// Color scheme definitions (simplified for client-side SVG generation)
const COLOR_SCHEMES: { [key: string]: (value: number) => string } = {
  plasma: (value: number) => {
    // Simple approximation of plasma colormap
    const r = Math.floor(255 * Math.pow(value, 0.5))
    const g = Math.floor(255 * Math.pow(value, 1.5))
    const b = Math.floor(255 * Math.pow(value, 2.5))
    return `rgb(${r},${g},${b})`
  },
  viridis: (value: number) => {
    // Simple approximation of viridis colormap
    const r = Math.floor(255 * (0.2 + 0.7 * value))
    const g = Math.floor(255 * (0.9 - 0.7 * value))
    const b = Math.floor(255 * (0.4 + 0.5 * value))
    return `rgb(${r},${g},${b})`
  },
  cividis: (value: number) => {
    // Simple approximation of cividis colormap
    const r = Math.floor(255 * (0.1 + 0.8 * value))
    const g = Math.floor(255 * (0.5 + 0.4 * value))
    const b = Math.floor(255 * (0.8 - 0.7 * value))
    return `rgb(${r},${g},${b})`
  },
  magma: (value: number) => {
    // Simple approximation of magma colormap
    const r = Math.floor(255 * Math.pow(value, 0.7))
    const g = Math.floor(255 * Math.pow(value, 0.3))
    const b = Math.floor(255 * Math.pow(value, 0.1))
    return `rgb(${r},${g},${b})`
  },
  inferno: (value: number) => {
    // Simple approximation of inferno colormap
    const r = Math.floor(255 * Math.pow(value, 0.8))
    const g = Math.floor(255 * Math.pow(value, 0.4))
    const b = Math.floor(255 * Math.pow(value, 0.2))
    return `rgb(${r},${g},${b})`
  },
  twilight: (value: number) => {
    // Simple approximation of twilight colormap (diverging)
    if (value < 0.5) {
      const v = value * 2
      const r = Math.floor(255 * v)
      const g = 0
      const b = Math.floor(255 * (1 - v))
      return `rgb(${r},${g},${b})`
    } else {
      const v = (value - 0.5) * 2
      const r = Math.floor(255 * (1 - v))
      const g = Math.floor(255 * v)
      const b = 0
      return `rgb(${r},${g},${b})`
    }
  },
  hsv: (value: number) => {
    // Simple HSV approximation (hue changes, saturation/value fixed)
    const h = value * 360 // Hue from 0 to 360
    const s = 1 // Full saturation
    const v = 1 // Full value
    return `hsl(${h}, ${s * 100}%, ${(v * 100) / 2}%)` // Use HSL for CSS
  },
  rainbow: (value: number) => {
    // Simple rainbow approximation
    const hue = value * 360
    return `hsl(${hue}, 100%, 50%)`
  },
  grayscale: (value: number) => {
    const gray = Math.floor(value * 255)
    return `rgb(${gray},${gray},${gray})`
  },
}

/**
 * Generates an SVG string for a scatter plot based on provided data points.
 * @param data - Array of data points {x, y, value}.
 * @param settings - FlowArtSettings containing colorScheme.
 * @returns A base64 encoded SVG string.
 */
export function generateScatterPlotSVG(data: DataPoint[], settings: FlowArtSettings): string {
  const width = 800
  const height = 600
  const padding = 50

  // Find min/max for scaling
  const minX = Math.min(...data.map((d) => d.x))
  const maxX = Math.max(...data.map((d) => d.x))
  const minY = Math.min(...data.map((d) => d.y))
  const maxY = Math.max(...data.map((d) => d.y))
  const minValue = Math.min(...data.map((d) => d.value))
  const maxValue = Math.max(...data.map((d) => d.value))

  // Scaling functions
  const scaleX = (x: number) => padding + ((x - minX) / (maxX - minX)) * (width - 2 * padding)
  const scaleY = (y: number) => height - padding - ((y - minY) / (maxY - minY)) * (height - 2 * padding) // Invert Y for SVG
  const scaleValue = (value: number) => (value - minValue) / (maxValue - minValue) // Normalize to 0-1

  const getColor = COLOR_SCHEMES[settings.colorScheme] || COLOR_SCHEMES.plasma

  const circles = data
    .map((d) => {
      const cx = scaleX(d.x)
      const cy = scaleY(d.y)
      const color = getColor(scaleValue(d.value))
      const radius = 1.5 // Fixed radius for simplicity, could be dynamic
      return `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${color}" />`
    })
    .join("\n")

  const svgContent = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#1a1a2e"/> <!-- Dark background for contrast -->
      ${circles}
    </svg>
  `

  // Encode to base64
  return `data:image/svg+xml;base64,${btoa(svgContent)}`
}
