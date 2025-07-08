import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Web3Provider } from "@/lib/web3-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FlowSketch - AI Art Marketplace",
  description: "Discover, create, and trade unique AI-generated artworks on the blockchain",
  keywords: ["AI art", "NFT", "blockchain", "digital art", "marketplace"],
  authors: [{ name: "FlowSketch Team" }],
  openGraph: {
    title: "FlowSketch - AI Art Marketplace",
    description: "Discover, create, and trade unique AI-generated artworks on the blockchain",
    type: "website",
  },
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
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <Web3Provider>
            {children}
            <Toaster />
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  )
}
