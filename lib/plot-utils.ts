export interface PlotPoint {
  x: number
  y: number
}

export interface PlotSettings {
  width: number
  height: number
  xMin: number
  xMax: number
  yMin: number
  yMax: number
}

export class PlotUtils {
  static createSVGPath(points: PlotPoint[], settings: PlotSettings): string {
    if (points.length === 0) return ""

    const scaleX = settings.width / (settings.xMax - settings.xMin)
    const scaleY = settings.height / (settings.yMax - settings.yMin)

    const scaledPoints = points.map((p) => ({
      x: (p.x - settings.xMin) * scaleX,
      y: settings.height - (p.y - settings.yMin) * scaleY,
    }))

    let path = `M ${scaledPoints[0].x} ${scaledPoints[0].y}`

    for (let i = 1; i < scaledPoints.length; i++) {
      path += ` L ${scaledPoints[i].x} ${scaledPoints[i].y}`
    }

    return path
  }

  static generateParametricCurve(
    xFunc: (t: number) => number,
    yFunc: (t: number) => number,
    tMin: number,
    tMax: number,
    steps: number,
  ): PlotPoint[] {
    const points: PlotPoint[] = []
    const dt = (tMax - tMin) / steps

    for (let i = 0; i <= steps; i++) {
      const t = tMin + i * dt
      points.push({
        x: xFunc(t),
        y: yFunc(t),
      })
    }

    return points
  }

  static generateSpiral(
    centerX: number,
    centerY: number,
    maxRadius: number,
    turns: number,
    steps: number,
  ): PlotPoint[] {
    const points: PlotPoint[] = []
    const maxAngle = turns * 2 * Math.PI

    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const angle = t * maxAngle
      const radius = t * maxRadius

      points.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      })
    }

    return points
  }
}
