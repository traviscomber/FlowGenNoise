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
import { cn } from "@/utils"
import { useChart } from "@/components/ui/chart"

// Define a type for common chart props
interface CommonChartProps {
  data: Record<string, any>[]
  chartConfig: ChartConfig
  className?: string
}

// Line Chart Component
interface LineChartProps extends CommonChartProps {
  lines: { dataKey: string; stroke: string; type?: "monotone" | "linear" }[]
}

const CustomLineChart: React.FC<LineChartProps> = ({ data, chartConfig, lines, className }) => (
  <ChartContainer config={chartConfig} className={className}>
    <LineChart data={data}>
      <CartesianGrid vertical={false} />
      <XAxis
        dataKey="month"
        tickLine={false}
        tickMargin={10}
        axisLine={false}
        tickFormatter={(value) => value.slice(0, 3)}
      />
      <YAxis />
      <CustomChartTooltip cursor={false} />
      <Legend />
      {lines.map((line, index) => (
        <Line key={index} dataKey={line.dataKey} type={line.type || "monotone"} stroke={line.stroke} dot={false} />
      ))}
    </LineChart>
  </ChartContainer>
)

// Bar Chart Component
interface BarChartProps extends CommonChartProps {
  bars: { dataKey: string; fill: string }[]
}

const CustomBarChart: React.FC<BarChartProps> = ({ data, chartConfig, bars, className }) => (
  <ChartContainer config={chartConfig} className={className}>
    <BarChart data={data}>
      <CartesianGrid vertical={false} />
      <XAxis
        dataKey="month"
        tickLine={false}
        tickMargin={10}
        axisLine={false}
        tickFormatter={(value) => value.slice(0, 3)}
      />
      <YAxis />
      <CustomChartTooltip cursor={false} />
      <Legend />
      {bars.map((bar, index) => (
        <Bar key={index} dataKey={bar.dataKey} fill={bar.fill} radius={8} />
      ))}
    </BarChart>
  </ChartContainer>
)

// Area Chart Component
interface AreaChartProps extends CommonChartProps {
  areas: { dataKey: string; fill: string; stroke: string; type?: "monotone" | "linear" }[]
}

const CustomAreaChart: React.FC<AreaChartProps> = ({ data, chartConfig, areas, className }) => (
  <ChartContainer config={chartConfig} className={className}>
    <AreaChart data={data}>
      <CartesianGrid vertical={false} />
      <XAxis
        dataKey="month"
        tickLine={false}
        tickMargin={10}
        axisLine={false}
        tickFormatter={(value) => value.slice(0, 3)}
      />
      <YAxis />
      <CustomChartTooltip cursor={false} />
      <Legend />
      {areas.map((area, index) => (
        <Area key={index} dataKey={area.dataKey} type={area.type || "monotone"} fill={area.fill} stroke={area.stroke} />
      ))}
    </AreaChart>
  </ChartContainer>
)

// Chart Components (from shadcn/ui)
const ChartContext = React.createContext<ChartContextValues | null>(null)

function ChartContainer<T extends React.ComponentProps<"div">>({
  id,
  className,
  children,
  config,
  ...props
}: T & {
  config: ChartConfig
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId}`
  return (
    <ChartContext.Provider value={{ config, chartId }}>
      <div
        data-chart={chartId}
        className={cn(
          "flex aspect-video h-full w-full flex-col [&_.recharts-cartesian-grid]:stroke-border [&_.recharts-tooltip-content]:rounded-md [&_.recharts-tooltip-content]:border-border [&_.recharts-tooltip-content]:bg-background [&_.recharts-tooltip-content]:px-2 [&_.recharts-tooltip-content]:py-1.5 [&_.recharts-tooltip-content]:text-popover-foreground [&_[data-value='active']]:opacity-100 [&_.recharts-active-dot]:fill-primary",
          className,
        )}
        {...props}
      >
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

const CustomChartTooltip = ({ ...props }) => {
  const { config } = useChart()
  return <Tooltip cursor={false} content={<CustomChartTooltipContent config={config} />} {...props} />
}

interface CustomChartTooltipContentProps {
  config: ChartConfig
  payload: any[]
}

const CustomChartTooltipContent = React.forwardRef<HTMLDivElement, CustomChartTooltipContentProps>(
  ({ className, payload, config }, ref) => {
    const { chartId } = useChart()

    if (!payload || !payload.length) {
      return null
    }

    const activePayload = payload[0]
    const { dataKey, name, value, color } = activePayload

    return (
      <div
        ref={ref}
        className={cn("rounded-md border border-border bg-background px-3 py-1.5 text-sm shadow-md", className)}
      >
        {config[dataKey]?.label && <div className="text-muted-foreground">{config[dataKey].label}</div>}
        <div className="flex items-center justify-between gap-x-4">
          <div className="flex items-center gap-x-2">
            <div
              className="size-2 rounded-full"
              style={{
                backgroundColor: color,
              }}
            />
            <span className="text-muted-foreground">{name}</span>
          </div>
          <span className="font-medium">{value}</span>
        </div>
      </div>
    )
  },
)
CustomChartTooltipContent.displayName = "CustomChartTooltipContent"

interface ChartContextValues {
  config: ChartConfig
  chartId: string
}

type ChartConfig = {
  [k: string]: {
    label?: string
    color?: string
    icon?: React.ComponentType<{ className?: string }>
  }
}

export {
  CustomLineChart as LineChart,
  CustomBarChart as BarChart,
  CustomAreaChart as AreaChart,
  ChartContainer,
  CustomChartTooltip as ChartTooltip,
  CustomChartTooltipContent as ChartTooltipContent,
  type ChartConfig,
}
