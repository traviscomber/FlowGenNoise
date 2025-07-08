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
  description: "Create, mint, and trade AI-generated artworks as NFTs on the blockchain",
  keywords: ["NFT", "AI Art", "Blockchain", "Marketplace", "Digital Art", "Ethereum"],
  authors: [{ name: "FlowSketch Team" }],
  openGraph: {
    title: "FlowSketch - AI Art Marketplace",
    description: "Create, mint, and trade AI-generated artworks as NFTs on the blockchain",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "FlowSketch - AI Art Marketplace",
    description: "Create, mint, and trade AI-generated artworks as NFTs on the blockchain",
  },
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
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
