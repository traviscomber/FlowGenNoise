import * as PlotUtils from "./plot-utils-core"

export type DataPoint = {
  x: number
  y: number
}

// ---------------------------------------------------------------------------
// Legacy wrapper – keeps older imports working
// ---------------------------------------------------------------------------
export function generateScatterPlotSVG(
  data: DataPoint[],
  cfg: {
    colorScheme?: string
    width?: number
    height?: number
  } = {},
) {
  const { colorScheme = "viridis", width = 800, height = 600 } = cfg
  return PlotUtils.createSVGPlot(data, colorScheme, width, height)
}
