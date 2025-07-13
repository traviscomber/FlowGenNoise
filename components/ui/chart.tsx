"use client"

import { cn } from "@/lib/utils"
import * as React from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  Bar,
  BarChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  Area,
  AreaChart,
} from "recharts"
import { ChartContainer as RechartsChartContainer, type ChartContainerProps } from "@tremor/react"

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ className, children, ...props }, ref) => (
    <RechartsChartContainer ref={ref} className={className} {...props}>
      {children}
    </RechartsChartContainer>
  ),
)
ChartContainer.displayName = "ChartContainer"

import { type ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Helper to determine chart type and render accordingly
const ChartComponent = ({ type, data, config }: { type: string; data: any[]; config: ChartConfig }) => {
  switch (type) {
    case "line":
      return (
        <LineChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          {Object.entries(config).map(([key, item]) => {
            if (item.type === "line") {
              return (
                <Line
                  key={key}
                  dataKey={key}
                  type="monotone"
                  stroke={`var(--color-${key})`}
                  strokeWidth={2}
                  dot={false}
                />
              )
            }
            return null
          })}
        </LineChart>
      )
    case "bar":
      return (
        <BarChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          {Object.entries(config).map(([key, item]) => {
            if (item.type === "bar") {
              return <Bar key={key} dataKey={key} fill={`var(--color-${key})`} radius={4} />
            }
            return null
          })}
        </BarChart>
      )
    case "area":
      return (
        <AreaChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          {Object.entries(config).map(([key, item]) => {
            if (item.type === "area") {
              return (
                <Area
                  key={key}
                  dataKey={key}
                  type="monotone"
                  fill={`var(--color-${key})`}
                  stroke={`var(--color-${key})`}
                />
              )
            }
            return null
          })}
        </AreaChart>
      )
    case "pie":
      return (
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          {Object.entries(config).map(([key, item]) => {
            if (item.type === "pie") {
              return (
                <Pie
                  key={key}
                  data={data}
                  dataKey={item.dataKey}
                  nameKey={item.nameKey}
                  innerRadius={item.innerRadius || 0}
                  outerRadius={item.outerRadius || 0}
                  fill={`var(--color-${key})`}
                  paddingAngle={5}
                  cornerRadius={5}
                />
              )
            }
            return null
          })}
        </PieChart>
      )
    case "radialbar":
      return (
        <RadialBarChart innerRadius="10%" outerRadius="80%" data={data}>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          {Object.entries(config).map(([key, item]) => {
            if (item.type === "radialbar") {
              return (
                <RadialBar key={key} dataKey={item.dataKey} fill={`var(--color-${key})`} background cornerRadius={10} />
              )
            }
            return null
          })}
        </RadialBarChart>
      )
    default:
      return null
  }
}

interface ChartProps extends React.ComponentProps<typeof ChartContainer> {
  type: "line" | "bar" | "pie" | "radialbar" | "area"
  data: any[]
  config: ChartConfig
}

const Chart = ({ type, data, config, className, ...props }: ChartProps) => (
  <ChartContainer config={config} className={cn("min-h-[200px] w-full", className)} {...props}>
    <ChartComponent type={type} data={data} config={config} />
  </ChartContainer>
)

export { Chart, ChartContainer }
