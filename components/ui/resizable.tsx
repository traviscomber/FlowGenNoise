"use client"

import * as React from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "react-resizable-panels"

import { cn } from "@/lib/utils"

const Resizable = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <ResizablePanelGroup ref={ref} className={cn("flex h-full w-full", className)} {...props}>
        {children}
      </ResizablePanelGroup>
    )
  },
)
Resizable.displayName = "Resizable"

const ResizablePanels = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    defaultSize?: number
    minSize?: number
    maxSize?: number
  }
>(({ className, defaultSize, minSize, maxSize, children, ...props }, ref) => {
  return (
    <ResizablePanel
      ref={ref}
      className={cn("relative flex-1", className)}
      defaultSize={defaultSize}
      minSize={minSize}
      maxSize={maxSize}
      {...props}
    >
      {children}
    </ResizablePanel>
  )
})
ResizablePanels.displayName = "ResizablePanels"

const ResizableHandleComponent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <ResizableHandle
        ref={ref}
        className={cn(
          "relative z-10 flex h-full w-1 cursor-ew-resize items-center justify-center bg-border",
          className,
        )}
        {...props}
      >
        <div className="absolute h-6 w-1 bg-background" />
      </ResizableHandle>
    )
  },
)
ResizableHandleComponent.displayName = "ResizableHandleComponent"

export { Resizable, ResizablePanels, ResizableHandleComponent, ResizablePanelGroup, ResizablePanel, ResizableHandle }
