import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { PasswordGate } from "@/components/auth/password-gate"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FlowSketch - Mathematical Art Generator",
  description: "Create stunning mathematical art with AI-powered generation and enhancement",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <PasswordGate>{children}</PasswordGate>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
