"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"
import { useMountedState } from "react-use"

/**
 * Small icon-button that toggles between **light** and **dark** themes.
 * It relies on the ThemeProvider already set up in `components/theme-provider.tsx`.
 */
export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const isMounted = useMountedState()

  // Avoid Hydration Mismatch (render nothing until mounted on the client)
  if (!isMounted()) return null

  const isDark = theme === "dark"

  return (
    <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={() => setTheme(isDark ? "light" : "dark")}>
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
