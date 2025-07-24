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
  type ChartConfig,
  ChartContainer as RechartsChartContainer,
  type ChartContainerProps as RechartsChartContainerProps,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

const ChartContext = React.createContext<ChartConfig | null>(null)

type ChartContainerProps = RechartsChartContainerProps & {
  config: ChartConfig
}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ config, className, children, ...props }, ref) => {
    return (
      <ChartContext.Provider value={config}>
        <RechartsChartContainer
          ref={ref}
          className={cn("flex h-[300px] w-full items-center justify-center", className)}
          {...props}
        >
          {children}
        </RechartsChartContainer>
      </ChartContext.Provider>
    )
  },
)
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = ({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean
  payload?: any[]
  label?: string
  formatter?: (value: any, name: string, props: any) => React.ReactNode
}) => {
  const config = React.useContext(ChartContext)

  if (active && payload && payload.length && config) {
    return (
      <div className="rounded-md border bg-background p-2 text-sm shadow-md">
        <div className="font-semibold">{label}</div>
        {payload.map((entry, index) => {
          const name = config[entry.dataKey]?.label || entry.dataKey
          const value = formatter ? formatter(entry.value, name, entry) : entry.value
          return (
            <div key={`item-${index}`} className="flex items-center justify-between gap-2">
              <span className="flex items-center">
                <span className="h-2 w-2 rounded-full mr-1" style={{ backgroundColor: entry.color }} />
                {name}:
              </span>
              <span className="font-bold">{value}</span>
            </div>
          )
        })}
      </div>
    )
  }

  return null
}
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof Tooltip>>(
  ({ className, ...props }, ref) => (
    <Tooltip ref={ref} content={<ChartTooltip />} wrapperClassName={cn("z-50", className)} {...props} />
  ),
)
ChartTooltipContent.displayName = "ChartTooltipContent"

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
}
