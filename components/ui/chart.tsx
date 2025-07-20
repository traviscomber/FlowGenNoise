"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Workaround for https://github.com/recharts/recharts/issues/3615
const Tooltip = ({
  active,
  payload,
  label,
  formatter,
  content,
  className,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> & {
  formatter?: (value: number | string | Array<number | string>, name: string, props: any) => React.ReactNode
  content?: React.ComponentProps<typeof ChartTooltipContent>["content"]
}) => {
  if (active && payload && payload.length) {
    return (
      <ChartTooltipContent
        className={className}
        itemClassName="font-medium"
        formatter={formatter}
        payload={payload}
        label={label}
        content={content}
      />
    )
  }

  return null
}

const ChartContext = React.createContext<
  | {
      config: Record<string, { label?: string; color?: string }>
    }
  | undefined
>(undefined)

type ChartProps = React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer> & {
  config: Record<string, { label?: string; color?: string }>
}

function Chart({ config, className, children, ...props }: ChartProps) {
  return (
    <ChartContext.Provider value={{ config }}>
      <RechartsPrimitive.ResponsiveContainer className={cn("h-[--chart-height]", className)} {...props}>
        {children}
      </RechartsPrimitive.ResponsiveContainer>
    </ChartContext.Provider>
  )
}

Chart.displayName = "Chart"

const ChartTooltip = ({ ...props }) => <Tooltip {...props} />

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    formatter?: (value: number | string | Array<number | string>, name: string, props: any) => React.ReactNode
    content?: React.ComponentProps<typeof RechartsPrimitive.Tooltip>["content"]
    payload?: RechartsPrimitive.TooltipProps["payload"]
    label?: RechartsPrimitive.TooltipProps["label"]
  }
>(({ className, content, hideLabel = false, hideIndicator = false, formatter, payload, label, ...props }, ref) => {
  const { config } = React.useContext(ChartContext) ?? { config: {} }

  if (!payload?.length) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn("rounded-lg border bg-background px-3 py-1.5 text-sm shadow-md", className)}
      {...props}
    >
      {!hideLabel && label ? <div className="text-muted-foreground mb-0.5 text-xs">{label}</div> : null}
      {content ? (
        content({ payload, label })
      ) : (
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            if (item.dataKey === "tooltip") return null

            const value = formatter ? formatter(item.value!, item.name!, item) : item.value
            const indicatorColor = config[item.dataKey as string]?.color

            return (
              <div key={item.dataKey} className="flex items-center gap-2">
                {hideIndicator ? null : (
                  <div
                    className={cn("h-2 w-2 rounded-full", indicatorColor)}
                    style={{
                      backgroundColor: indicatorColor ?? item.color,
                    }}
                  />
                )}
                {config[item.dataKey as string]?.label ?? item.name}:{" "}
                <span className="font-mono font-medium">{value}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
})

ChartTooltipContent.displayName = "ChartTooltipContent"

export { Chart, ChartTooltip, ChartTooltipContent }
