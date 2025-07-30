"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FlowArtGenerator } from "@/components/flow-art-generator"
import { TribesDemo } from "@/components/tribes-demo"
import { Dome360Planner } from "@/components/dome-360-planner"
import { Settings, Palette, Zap, Globe, Users, Mountain } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [activeDemo, setActiveDemo] = useState<"flow" | "tribes" | "dome">("flow")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  FlowSketch
                </h1>
                <p className="text-sm text-muted-foreground">Mathematical Art Generator</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin Panel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Create Stunning Mathematical Art
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Generate beautiful, complex mathematical visualizations using AI-powered algorithms. From spirals to
              fractals, create gallery-quality art with customizable parameters.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <Badge variant="secondary" className="text-sm">
                <Zap className="w-3 h-3 mr-1" />
                AI-Powered
              </Badge>
              <Badge variant="secondary" className="text-sm">
                <Globe className="w-3 h-3 mr-1" />
                360° & Dome Support
              </Badge>
              <Badge variant="secondary" className="text-sm">
                <Users className="w-3 h-3 mr-1" />
                Cultural Themes
              </Badge>
              <Badge variant="secondary" className="text-sm">
                <Mountain className="w-3 h-3 mr-1" />
                8K Resolution
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Selector */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="flex justify-center mb-8">
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={activeDemo === "flow" ? "default" : "ghost"}
                onClick={() => setActiveDemo("flow")}
                className="rounded-md"
              >
                Mathematical Flow
              </Button>
              <Button
                variant={activeDemo === "tribes" ? "default" : "ghost"}
                onClick={() => setActiveDemo("tribes")}
                className="rounded-md"
              >
                Cultural Themes
              </Button>
              <Button
                variant={activeDemo === "dome" ? "default" : "ghost"}
                onClick={() => setActiveDemo("dome")}
                className="rounded-md"
              >
                Dome & 360°
              </Button>
            </div>
          </div>

          {/* Demo Content */}
          <div className="max-w-7xl mx-auto">
            {activeDemo === "flow" && <FlowArtGenerator />}
            {activeDemo === "tribes" && <TribesDemo />}
            {activeDemo === "dome" && <Dome360Planner />}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-white/50 dark:bg-slate-800/50">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Powerful Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="w-5 h-5 mr-2 text-blue-500" />
                  Mathematical Precision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Generate art based on complex mathematical algorithms including fractals, spirals, Mandelbrot sets,
                  and more with precise parameter control.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-purple-500" />
                  AI Enhancement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Powered by DALL-E 3 for stunning visual enhancement, transforming mathematical patterns into
                  gallery-quality artwork.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-green-500" />
                  Immersive Formats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Create 360° panoramas, dome projections, and VR-ready content optimized for planetariums and immersive
                  experiences.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-orange-500" />
                  Cultural Themes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Incorporate cultural elements like tribal settlements, native communities, and traditional art forms
                  into mathematical visualizations.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mountain className="w-5 h-5 mr-2 text-red-500" />
                  High Resolution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Generate artwork up to 8K resolution with professional quality suitable for large format printing and
                  exhibition display.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-indigo-500" />
                  Advanced Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Fine-tune every aspect with advanced parameters, batch processing, offline queues, and professional
                  admin tools.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t bg-white/80 dark:bg-slate-900/80">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">FlowSketch - Mathematical Art Generator • Built with Next.js and AI</p>
        </div>
      </footer>
    </div>
  )
}
