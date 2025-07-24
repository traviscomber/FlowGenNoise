"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { ChartContext } from "./ChartContext" // Import ChartContext from the correct file

import { cn } from "@/lib/utils"

// Workaround for https://github.com/recharts/recharts/issues/3615
const Tooltip = RechartsPrimitive.Tooltip

function Chart({
  config,
  children,
  className,
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer> & {
  config: ChartContext["config"]
} & (
    | {
        data: Record<string, any>[]
        categories: string[]
      }
    | {
        data?: never
        categories?: never
      }
  )) {
  return (
    <ChartContext.Provider value={{ config, ...props }}>
      <div className={cn("h-[400px] w-full", className)}>
        <RechartsPrimitive.ResponsiveContainer {...props}>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

// Helper to use accessible colors from tailwind config.
function ChartTooltip({
  active,
  payload,
  className,
  formatter,
  content,
  ...props
}: React.ComponentProps<typeof Tooltip> & {
  formatter?: (value: number, name: string, props: { payload: Record<string, any> }) => [string, string]
  content?: React.ComponentProps<typeof ChartTooltipContent>["content"]
}) {
  const { config } = React.useContext(ChartContext)

  if (active && payload && payload.length) {
    const item = payload[0]
    const _formatter =
      typeof formatter === "function"
        ? formatter
        : (value: number, name: string) => {
            const entry = config[name]
            if (entry && entry.label) {
              return [value, entry.label]
            }
            return [value, name]
          }
    return (
      <Tooltip
        active={active}
        payload={payload}
        formatter={_formatter}
        content={({ active, payload }) => {
          if (active && payload && payload.length) {
            return (
              <ChartTooltipContent
                className={className}
                item={item}
                payload={payload}
                config={config}
                content={content}
              />
            )
          }

          return null
        }}
        {...props}
      />
    )
  }

  return null
}

interface ChartTooltipContentProps extends React.ComponentPropsWithoutRef<"div"> {
  item: RechartsPrimitive.TooltipProps["payload"][number]
  payload: RechartsPrimitive.TooltipProps["payload"]
  config: ChartContext["config"]
  content?: React.ComponentProps<typeof ChartTooltipContent>["content"]
}

const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  ({ className, item, payload, config, content, ...props }, ref) => {
    if (content) {
      return (
        <div ref={ref} className={cn("p-2", className)} {...props}>
          {content({ item, payload, config })}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[130px] items-center gap-1.5 rounded-lg border bg-white px-2.5 py-1.5 text-xs shadow-xl dark:bg-zinc-950",
          className,
        )}
        {...props}
      >
        {payload.map((item) => {
          const key = item.dataKey as keyof typeof config

          return (
            <div key={item.dataKey} className="flex items-center justify-between space-x-2">
              <ChartTooltipLabel className="shrink-0" style={{ color: config[key]?.color }}>
                {config[key]?.label || item.dataKey}
              </ChartTooltipLabel>
              <ChartTooltipValue>{item.value as number}</ChartTooltipValue>
            </div>
          )
        })}
      </div>
    )
  },
)
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartTooltipLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex items-center", className)} {...props} />,
)
ChartTooltipLabel.displayName = "ChartTooltipLabel"

const ChartTooltipValue = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("relative ml-auto font-medium tabular-nums", className)} {...props} />
  ),
)
ChartTooltipValue.displayName = "ChartTooltipValue"

export { Chart, ChartTooltip, ChartTooltipContent }
