"use client"

import * as React from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  Bar,
  BarChart,
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts"
import {
  ChartContainer as BaseChartContainer,
  ChartTooltip as BaseChartTooltip,
  ChartTooltipContent as BaseChartTooltipContent,
} from "@/components/ui/chart" // Assuming these are provided by shadcn/ui

import { cn } from "@/lib/utils"

// Re-exporting the base components for convenience
export {
  BaseChartContainer as ChartContainer,
  BaseChartTooltip as ChartTooltip,
  BaseChartTooltipContent as ChartTooltipContent,
}

// You can define your own Chart components here, or use the base ones directly.
// For example, if you want to wrap Recharts components with some default styling or props:

const ChartLine = React.forwardRef<React.ElementRef<typeof Line>, React.ComponentPropsWithoutRef<typeof Line>>(
  ({ className, ...props }, ref) => <Line ref={ref} className={cn(className)} {...props} />,
)
ChartLine.displayName = "ChartLine"

const ChartBar = React.forwardRef<React.ElementRef<typeof Bar>, React.ComponentPropsWithoutRef<typeof Bar>>(
  ({ className, ...props }, ref) => <Bar ref={ref} className={cn(className)} {...props} />,
)
ChartBar.displayName = "ChartBar"

const ChartArea = React.forwardRef<React.ElementRef<typeof Area>, React.ComponentPropsWithoutRef<typeof Area>>(
  ({ className, ...props }, ref) => <Area ref={ref} className={cn(className)} {...props} />,
)
ChartArea.displayName = "ChartArea"

const ChartXAxis = React.forwardRef<React.ElementRef<typeof XAxis>, React.ComponentPropsWithoutRef<typeof XAxis>>(
  ({ className, ...props }, ref) => <XAxis ref={ref} className={cn(className)} {...props} />,
)
ChartXAxis.displayName = "ChartXAxis"

const ChartYAxis = React.forwardRef<React.ElementRef<typeof YAxis>, React.ComponentPropsWithoutRef<typeof YAxis>>(
  ({ className, ...props }, ref) => <YAxis ref={ref} className={cn(className)} {...props} />,
)
ChartYAxis.displayName = "ChartYAxis"

const ChartCartesianGrid = React.forwardRef<
  React.ElementRef<typeof CartesianGrid>,
  React.ComponentPropsWithoutRef<typeof CartesianGrid>
>(({ className, ...props }, ref) => <CartesianGrid ref={ref} className={cn(className)} {...props} />)
ChartCartesianGrid.displayName = "ChartCartesianGrid"

const ChartTooltipComponent = React.forwardRef<
  React.ElementRef<typeof Tooltip>,
  React.ComponentPropsWithoutRef<typeof Tooltip>
>(({ className, ...props }, ref) => <Tooltip ref={ref} className={cn(className)} {...props} />)
ChartTooltipComponent.displayName = "ChartTooltipComponent"

const ChartLegend = React.forwardRef<React.ElementRef<typeof Legend>, React.ComponentPropsWithoutRef<typeof Legend>>(
  ({ className, ...props }, ref) => <Legend ref={ref} className={cn(className)} {...props} />,
)
ChartLegend.displayName = "ChartLegend"

const ChartResponsiveContainer = React.forwardRef<
  React.ElementRef<typeof ResponsiveContainer>,
  React.ComponentPropsWithoutRef<typeof ResponsiveContainer>
>(({ className, ...props }, ref) => <ResponsiveContainer ref={ref} className={cn(className)} {...props} />)
ChartResponsiveContainer.displayName = "ChartResponsiveContainer"

// You can also create wrapper components for the main chart types
const ChartLineChart = React.forwardRef<
  React.ElementRef<typeof LineChart>,
  React.ComponentPropsWithoutRef<typeof LineChart>
>(({ className, ...props }, ref) => <LineChart ref={ref} className={cn(className)} {...props} />)
ChartLineChart.displayName = "ChartLineChart"

const ChartBarChart = React.forwardRef<
  React.ElementRef<typeof BarChart>,
  React.ComponentPropsWithoutRef<typeof BarChart>
>(({ className, ...props }, ref) => <BarChart ref={ref} className={cn(className)} {...props} />)
ChartBarChart.displayName = "ChartBarChart"

const ChartAreaChart = React.forwardRef<
  React.ElementRef<typeof AreaChart>,
  React.ComponentPropsWithoutRef<typeof AreaChart>
>(({ className, ...props }, ref) => <AreaChart ref={ref} className={cn(className)} {...props} />)
ChartAreaChart.displayName = "ChartAreaChart"

export {
  ChartLine,
  ChartBar,
  ChartArea,
  ChartXAxis,
  ChartYAxis,
  ChartCartesianGrid,
  ChartTooltipComponent as ChartTooltip, // Renamed to avoid conflict with BaseChartTooltip
  ChartLegend,
  ChartResponsiveContainer,
  ChartLineChart,
  ChartBarChart,
  ChartAreaChart,
}
