import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster" // For shadcn/ui toast
import { Toaster as SonnerToaster } from "@/components/ui/sonner" // For sonner toast

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FlowSketch Art Generator",
  description: "Generate beautiful mathematical art with AI enhancements.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster /> {/* shadcn/ui toast */}
          <SonnerToaster /> {/* sonner toast */}
        </ThemeProvider>
      </body>
    </html>
  )
}
