"use client"

import type React from "react"

import { useTheme } from "@/components/theme-provider"
import * as Toast from "@radix-ui/react-toast"

type ToasterProps = React.ComponentProps<typeof Toast.Provider>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Toast.Provider swipeDirection="right" {...props}>
      <Toast.Viewport className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" />
    </Toast.Provider>
  )
}

export { Toaster }
