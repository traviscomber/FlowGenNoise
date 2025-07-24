"use client"

import { Tooltip } from "@/components/ui/tooltip"

import * as React from "react"
import { Label } from "@radix-ui/react-label"
import {
  CartesianGrid,
  Line,
  LineChart,
  Bar,
  BarChart,
  Area,
  AreaChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  type ContentType,
  type TooltipProps,
  ResponsiveContainer,
  Legend,
} from "recharts"

import { cn } from "@/lib/utils"

// region: Chart
type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <Chart />")
  }

  return context
}

type ChartProps = React.ComponentProps<"div"> & {
  config: ChartConfig
}

function Chart({ config, className, children, ...props }: ChartProps) {
  return (
    <ChartContext.Provider value={{ config }}>
      <div className={cn("h-[400px] w-full", className)} {...props}>
        {children}
      </div>
    </ChartContext.Provider>
  )
}
Chart.displayName = "Chart"

// endregion

// region: ChartContainer
type ChartContainerProps = React.ComponentProps<"div"> &
  ChartContextProps & {
    id?: string
    children: React.ReactNode
  }

function ChartContainer({ id, config, className, children, ...props }: ChartContainerProps) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId}`
  return (
    <ChartContext.Provider value={{ config }}>
      <div id={chartId} className={cn("flex aspect-video justify-center text-foreground", className)} {...props}>
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}
ChartContainer.displayName = "ChartContainer"

// endregion

// region: ChartTooltip
type ChartTooltipProps = TooltipProps<any, any> & {
  hideIndicator?: boolean
  hideLabel?: boolean
  formatter?: ContentType<any, any>["formatter"]
}

function ChartTooltip({
  hideIndicator = false,
  hideLabel = false,
  formatter,
  className,
  content,
  ...props
}: ChartTooltipProps) {
  const { config } = useChart()

  return (
    <Tooltip
      className={cn("!bg-card !text-card-foreground", className)}
      cursor={{
        stroke: "hsl(var(--muted))",
        strokeWidth: 1,
        opacity: 0.5,
      }}
      content={
        content ||
        (({ active, payload, label }) => {
          if (active && payload && payload.length) {
            return (
              <div className="grid gap-1.5 rounded-lg border bg-background px-3 py-2 text-sm shadow-md">
                {!hideLabel && <div className="font-medium">{label}</div>}
                <div className="grid gap-1.5">
                  {payload.map((item, i) => {
                    const { stroke, fill, dataKey, value } = item
                    const indicatorColor = stroke || fill || "currentColor"
                    return (
                      <div key={item.dataKey} className="flex items-center gap-2">
                        {!hideIndicator && (
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: indicatorColor }} />
                        )}
                        {formatter && item.dataKey ? (
                          <ChartTooltipLabel config={config} dataKey={dataKey} value={value} formatter={formatter} />
                        ) : (
                          <div className="flex justify-between gap-4">
                            <ChartTooltipLabel config={config} dataKey={dataKey} />
                            <span className="font-mono font-medium tabular-nums text-foreground">{value}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          }

          return null
        })
      }
      {...props}
    />
  )
}
ChartTooltip.displayName = "ChartTooltip"

type ChartTooltipLabelProps = React.ComponentPropsWithoutRef<typeof Label> & {
  config: ChartConfig
  dataKey?: string | number
  value?: number
  formatter?: ContentType<any, any>["formatter"]
}

function ChartTooltipLabel({ config, dataKey, value, formatter, ...props }: ChartTooltipLabelProps) {
  const label = dataKey ? config[dataKey as keyof ChartConfig]?.label : ""
  const formattedValue = formatter && value !== undefined ? formatter(value, dataKey as string) : ""
  return (
    <Label className="font-medium" {...props}>
      {label}
      {formattedValue && <span className="ml-1 text-muted-foreground">{formattedValue}</span>}
    </Label>
  )
}

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> &
    Pick<ChartTooltipProps, "hideIndicator" | "hideLabel" | "formatter"> & {
      payload: TooltipProps<any, any>["payload"]
      label: TooltipProps<any, any>["label"]
    }
>(({ payload, label, hideIndicator, hideLabel, formatter, className }, ref) => {
  const { config } = useChart()

  if (!payload || !payload.length) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn("grid gap-1.5 rounded-lg border bg-background px-3 py-2 text-sm shadow-md", className)}
    >
      {!hideLabel && <div className="font-medium">{label}</div>}
      <div className="grid gap-1.5">
        {payload.map((item, i) => {
          const { stroke, fill, dataKey, value } = item
          const indicatorColor = stroke || fill || "currentColor"
          return (
            <div key={item.dataKey} className="flex items-center gap-2">
              {!hideIndicator && <div className="h-2 w-2 rounded-full" style={{ backgroundColor: indicatorColor }} />}
              {formatter && item.dataKey ? (
                <ChartTooltipLabel config={config} dataKey={dataKey} value={value} formatter={formatter} />
              ) : (
                <div className="flex justify-between gap-4">
                  <ChartTooltipLabel config={config} dataKey={dataKey} />
                  <span className="font-mono font-medium tabular-nums text-foreground">{value}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

// endregion

// region: ChartLegend
type ChartLegendProps = React.ComponentProps<typeof Label> & {
  content?: ContentType<any, any>["content"]
  hideIndicator?: boolean
}

function ChartLegend({ content, className, hideIndicator = false, ...props }: ChartLegendProps) {
  const { config } = useChart()

  return (
    <Legend
      content={
        content ||
        (({ payload }) => {
          return (
            <div className={cn("flex flex-wrap items-center justify-center gap-4", className)} {...props}>
              {payload?.map((item) => {
                const { value, payload } = item
                const indicatorColor = payload?.stroke || payload?.fill || "currentColor"

                return (
                  <div key={value} className="flex items-center gap-1.5">
                    {!hideIndicator && (
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: indicatorColor }} />
                    )}
                    <Label>{value}</Label>
                  </div>
                )
              })}
            </div>
          )
        })
      }
      {...props}
    />
  )
}
ChartLegend.displayName = "ChartLegend"

type ChartConfig = {
  [k: string]: {
    label?: string
    color?: string
    icon?: React.ComponentType<{ className?: string }>
  }
}

export {
  Chart,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  // Recharts
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
}
