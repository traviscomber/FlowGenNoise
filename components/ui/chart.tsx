"use client"

import * as React from "react"
import type { VariantProps } from "class-variance-authority"
import { Bar, type BarChart, Line, type LineChart, Pie, type PieChart, Scatter, type ScatterChart } from "recharts"
import type { chartVariants } from "@/lib/chartVariants" // Assuming chartVariants is declared in this file

import { cn } from "@/lib/utils"

const ChartContext = React.createContext<ChartContextType>({} as ChartContextType)

type ChartContextType = {
  config: ChartConfig
}

type ChartConfig = {
  [key: string]: {
    label?: string
    color?: string
    icon?: React.ComponentType
  }
}

type ChartProps = {
  config: ChartConfig
  children: React.ReactNode
} & React.ComponentPropsWithoutRef<"div">

function Chart({ config, className, children, ...props }: ChartProps) {
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={true}
        className={cn("flex h-96 w-full flex-col items-center justify-center", className)}
        {...props}
      >
        {children}
      </div>
    </ChartContext.Provider>
  )
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode
    className?: string
  } & VariantProps<typeof chartVariants>
>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("flex aspect-video w-full", className)} {...props}>
      {children}
    </div>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: any[]
  label?: string
}) => {
  const { config } = React.useContext(ChartContext)

  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 text-sm shadow-md">
        <div className="grid gap-1">
          {label && <div className="font-medium">{label}</div>}
          {payload.map((item: any) => {
            const color = config[item.dataKey]?.color || item.color
            const label = config[item.dataKey]?.label || item.dataKey
            return (
              <div key={item.dataKey} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                  <span>{label}</span>
                </div>
                <span className="font-mono font-medium tabular-nums">{item.value}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return null
}

const ChartLegend = ({
  payload,
}: {
  payload?: any[]
}) => {
  const { config } = React.useContext(ChartContext)

  if (payload) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-4 p-2">
        {payload.map((item: any) => {
          const color = config[item.dataKey]?.color || item.color
          const label = config[item.dataKey]?.label || item.dataKey
          return (
            <div key={item.dataKey} className="flex items-center gap-2">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: color }} />
              <span>{label}</span>
            </div>
          )
        })}
      </div>
    )
  }

  return null
}

const ChartPrimitive = React.forwardRef<
  any,
  {
    children: React.ReactNode
  } & (
    | React.ComponentProps<typeof BarChart>
    | React.ComponentProps<typeof LineChart>
    | React.ComponentProps<typeof PieChart>
    | React.ComponentProps<typeof ScatterChart>
  )
>(({ children, ...props }, ref) => {
  const { config } = React.useContext(ChartContext)
  const chartProps = {
    ...props,
    style: {
      ...props.style,
      direction: "ltr",
    },
  }
  return (
    <ChartPrimitive.Root ref={ref} {...chartProps}>
      {children}
    </ChartPrimitive.Root>
  )
})

const ChartBar = React.forwardRef<any, React.ComponentProps<typeof Bar>>(({ className, ...props }, ref) => {
  const { config } = React.useContext(ChartContext)
  const color = config[props.dataKey as string]?.color

  return <Bar ref={ref} className={cn("fill-primary", className)} fill={color} {...props} />
})

const ChartLine = React.forwardRef<any, React.ComponentProps<typeof Line>>(({ className, ...props }, ref) => {
  const { config } = React.useContext(ChartContext)
  const color = config[props.dataKey as string]?.color

  return <Line ref={ref} className={cn("stroke-primary", className)} stroke={color} {...props} />
})

const ChartPie = React.forwardRef<any, React.ComponentProps<typeof Pie>>(({ className, ...props }, ref) => {
  const { config } = React.useContext(ChartContext)
  const color = config[props.dataKey as string]?.color

  return <Pie ref={ref} className={cn("fill-primary", className)} fill={color} {...props} />
})

const ChartScatter = React.forwardRef<any, React.ComponentProps<typeof Scatter>>(({ className, ...props }, ref) => {
  const { config } = React.useContext(ChartContext)
  const color = config[props.dataKey as string]?.color

  return <Scatter ref={ref} className={cn("fill-primary", className)} fill={color} {...props} />
})

export { Chart, ChartContainer, ChartTooltip, ChartLegend, ChartPrimitive, ChartBar, ChartLine, ChartPie, ChartScatter }
