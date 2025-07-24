import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import PasswordGate from "@/components/auth/password-gate"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FlowSketch Art Generator",
  description: "Generate abstract mathematical art with AI",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const passwordGateEnabled = process.env.NEXT_PUBLIC_PASSWORD_GATE_PASSWORD !== undefined

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {passwordGateEnabled ? <PasswordGate>{children}</PasswordGate> : children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
