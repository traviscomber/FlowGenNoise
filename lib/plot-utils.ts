import type { DataPoint } from "./flow-model"

export class PlotUtils {
  static createSVGPlot(data: DataPoint[], colorScheme = "viridis", width = 800, height = 600): string {
    const margin = 40
    const plotWidth = width - 2 * margin
    const plotHeight = height - 2 * margin

    // Calculate bounds
    const xValues = data.map((d) => d.x)
    const yValues = data.map((d) => d.y)
    const xMin = Math.min(...xValues)
    const xMax = Math.max(...xValues)
    const yMin = Math.min(...yValues)
    const yMax = Math.max(...yValues)

    // Add padding
    const xRange = xMax - xMin
    const yRange = yMax - yMin
    const padding = 0.1
    const xMinPadded = xMin - xRange * padding
    const xMaxPadded = xMax + xRange * padding
    const yMinPadded = yMin - yRange * padding
    const yMaxPadded = yMax + yRange * padding

    // Scale functions
    const scaleX = (x: number) => margin + ((x - xMinPadded) / (xMaxPadded - xMinPadded)) * plotWidth
    const scaleY = (y: number) => height - margin - ((y - yMinPadded) / (yMaxPadded - yMinPadded)) * plotHeight

    // Color mapping
    const getColor = (point: DataPoint, index: number) => {
      return this.getColorFromScheme(colorScheme, point, index, data.length)
    }

    // Generate SVG
    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`

    // Background
    svg += `<rect width="${width}" height="${height}" fill="#ffffff"/>`

    // Plot area background
    svg += `<rect x="${margin}" y="${margin}" width="${plotWidth}" height="${plotHeight}" fill="#f8f9fa" stroke="#e9ecef"/>`

    // Data points
    data.forEach((point, index) => {
      const x = scaleX(point.x)
      const y = scaleY(point.y)
      const color = getColor(point, index)
      const radius = 2

      svg += `<circle cx="${x}" cy="${y}" r="${radius}" fill="${color}" opacity="0.7"/>`
    })

    svg += `</svg>`
    return svg
  }

  private static getColorFromScheme(scheme: string, point: DataPoint, index: number, total: number): string {
    const t = index / total
    const cluster = point.cluster || 0

    switch (scheme) {
      case "viridis":
        return this.viridisColor(t)
      case "plasma":
        return this.plasmaColor(t)
      case "inferno":
        return this.infernoColor(t)
      case "magma":
        return this.magmaColor(t)
      case "cool":
        return `hsl(${240 - t * 60}, 70%, ${50 + t * 30}%)`
      case "warm":
        return `hsl(${60 - t * 60}, 80%, ${50 + t * 20}%)`
      case "rainbow":
        return `hsl(${t * 360}, 70%, 50%)`
      case "monochrome":
        const gray = Math.floor(255 * (0.2 + t * 0.6))
        return `rgb(${gray}, ${gray}, ${gray})`
      default:
        return this.viridisColor(t)
    }
  }

  private static viridisColor(t: number): string {
    const colors = [
      [68, 1, 84],
      [59, 82, 139],
      [33, 144, 140],
      [93, 201, 99],
      [253, 231, 37],
    ]
    return this.interpolateColors(colors, t)
  }

  private static plasmaColor(t: number): string {
    const colors = [
      [13, 8, 135],
      [75, 3, 161],
      [125, 3, 168],
      [168, 34, 150],
      [208, 73, 119],
      [240, 148, 65],
      [252, 253, 191],
    ]
    return this.interpolateColors(colors, t)
  }

  private static infernoColor(t: number): string {
    const colors = [
      [0, 0, 4],
      [31, 12, 72],
      [85, 15, 109],
      [136, 34, 106],
      [186, 54, 85],
      [227, 89, 51],
      [249, 142, 8],
      [252, 255, 164],
    ]
    return this.interpolateColors(colors, t)
  }

  private static magmaColor(t: number): string {
    const colors = [
      [0, 0, 4],
      [28, 16, 68],
      [79, 18, 123],
      [129, 37, 129],
      [181, 54, 122],
      [229, 80, 100],
      [251, 135, 97],
      [254, 194, 135],
      [252, 253, 191],
    ]
    return this.interpolateColors(colors, t)
  }

  private static interpolateColors(colors: number[][], t: number): string {
    t = Math.max(0, Math.min(1, t))
    const scaledT = t * (colors.length - 1)
    const index = Math.floor(scaledT)
    const fraction = scaledT - index

    if (index >= colors.length - 1) {
      const color = colors[colors.length - 1]
      return `rgb(${color[0]}, ${color[1]}, ${color[2]})`
    }

    const color1 = colors[index]
    const color2 = colors[index + 1]

    const r = Math.round(color1[0] + (color2[0] - color1[0]) * fraction)
    const g = Math.round(color1[1] + (color2[1] - color1[1]) * fraction)
    const b = Math.round(color1[2] + (color2[2] - color1[2]) * fraction)

    return `rgb(${r}, ${g}, ${b})`
  }
}
