import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth/auth-provider"

export const metadata = {
  title: "FlowSketch • Dataset × Scenario",
  description: "Mathematical art generator",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* Theme switched first so UI flashes less */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* AuthProvider now handles both anonymous & logged-in flows */}
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
