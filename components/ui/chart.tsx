"use client"

import type * as React from "react"
import { CartesianGrid, Line, LineChart, Bar, BarChart, Area, AreaChart, XAxis, YAxis } from "recharts"
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

// Define types for common chart props
interface ChartBaseProps {
  data: Record<string, any>[]
  categories: string[]
  index: string
  chartConfig: ChartConfig
  className?: string
}

interface LineChartProps extends ChartBaseProps {
  type?: "monotone" | "natural" | "linear"
  strokeWidth?: number
  dot?: boolean
}

interface BarChartProps extends ChartBaseProps {
  barSize?: number
  layout?: "horizontal" | "vertical"
}

interface AreaChartProps extends ChartBaseProps {
  type?: "monotone" | "natural" | "linear"
  fillOpacity?: number
}

// Line Chart Component
const CustomLineChart: React.FC<LineChartProps> = ({
  data,
  categories,
  index,
  chartConfig,
  className,
  type = "monotone",
  strokeWidth = 2,
  dot = false,
}) => (
  <ChartContainer config={chartConfig} className={cn("min-h-[200px] w-full", className)}>
    <LineChart accessibilityLayer data={data}>
      <CartesianGrid vertical={false} />
      <XAxis
        dataKey={index}
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        tickFormatter={(value) => value.slice(0, 3)}
      />
      <YAxis tickLine={false} axisLine={false} tickMargin={8} />
      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
      <ChartLegend content={<ChartLegendContent />} />
      {categories.map((category) => (
        <Line
          key={category}
          dataKey={category}
          type={type}
          stroke={chartConfig[category]?.color}
          strokeWidth={strokeWidth}
          dot={dot}
        />
      ))}
    </LineChart>
  </ChartContainer>
)

// Bar Chart Component
const CustomBarChart: React.FC<BarChartProps> = ({
  data,
  categories,
  index,
  chartConfig,
  className,
  barSize = 30,
  layout = "horizontal",
}) => (
  <ChartContainer config={chartConfig} className={cn("min-h-[200px] w-full", className)}>
    <BarChart accessibilityLayer data={data} layout={layout}>
      <CartesianGrid vertical={layout === "vertical"} horizontal={layout === "horizontal"} />
      {layout === "horizontal" ? (
        <XAxis
          dataKey={index}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 3)}
        />
      ) : (
        <XAxis type="number" dataKey={index} tickLine={false} axisLine={false} tickMargin={8} />
      )}
      {layout === "vertical" ? (
        <YAxis dataKey={index} tickLine={false} axisLine={false} tickMargin={8} type="category" />
      ) : (
        <YAxis type="number" tickLine={false} axisLine={false} tickMargin={8} />
      )}
      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
      <ChartLegend content={<ChartLegendContent />} />
      {categories.map((category) => (
        <Bar key={category} dataKey={category} fill={chartConfig[category]?.color} barSize={barSize} />
      ))}
    </BarChart>
  </ChartContainer>
)

// Area Chart Component
const CustomAreaChart: React.FC<AreaChartProps> = ({
  data,
  categories,
  index,
  chartConfig,
  className,
  type = "monotone",
  fillOpacity = 0.4,
}) => (
  <ChartContainer config={chartConfig} className={cn("min-h-[200px] w-full", className)}>
    <AreaChart accessibilityLayer data={data}>
      <CartesianGrid vertical={false} />
      <XAxis
        dataKey={index}
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        tickFormatter={(value) => value.slice(0, 3)}
      />
      <YAxis tickLine={false} axisLine={false} tickMargin={8} />
      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
      <ChartLegend content={<ChartLegendContent />} />
      {categories.map((category) => (
        <Area
          key={category}
          dataKey={category}
          type={type}
          fill={chartConfig[category]?.color}
          fillOpacity={fillOpacity}
          stroke={chartConfig[category]?.color}
          stackId="a" // For stacked area charts
        />
      ))}
    </AreaChart>
  </ChartContainer>
)

export { CustomLineChart, CustomBarChart, CustomAreaChart }
