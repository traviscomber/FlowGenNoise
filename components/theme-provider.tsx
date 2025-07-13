"use client"
import { ThemeProvider as NextThemeProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

/**
 * Thin wrapper around `next-themes` so we can add extra props later
 * without touching every usage site.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemeProvider {...props}>{children}</NextThemeProvider>
}
