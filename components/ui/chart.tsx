"use client"

import * as React from "react"
import { VictoryAxis, VictoryChart, VictoryLine, VictoryScatter, VictoryTheme } from "victory"

import { cn } from "@/lib/utils"

const Chart = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    data: { x: number; y: number }[]
    color?: string
  }
>(({ className, data, color = "#8884d8", ...props }, ref) => (
  <div ref={ref} className={cn("w-full h-64", className)} {...props}>
    <VictoryChart
      theme={VictoryTheme.material}
      domainPadding={20}
      height={250}
      padding={{ top: 20, bottom: 60, left: 60, right: 20 }}
    >
      <VictoryAxis
        label="X-Axis"
        style={{
          axisLabel: { padding: 30 },
        }}
      />
      <VictoryAxis
        dependentAxis
        label="Y-Axis"
        style={{
          axisLabel: { padding: 40 },
        }}
      />
      <VictoryLine
        data={data}
        style={{
          data: { stroke: color },
        }}
      />
      <VictoryScatter
        data={data}
        size={3}
        style={{
          data: { fill: color },
        }}
      />
    </VictoryChart>
  </div>
))
Chart.displayName = "Chart"

export { Chart }
