"use client"

import { useState } from "react"
import { FlowArtGenerator } from "@/components/flow-art-generator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Palette, Zap, Settings, Users } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [showGenerator, setShowGenerator] = useState(false)

  if (showGenerator) {
    return <FlowArtGenerator />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FlowSketch
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin Panel
                </Button>
              </Link>
              <Button onClick={() => setShowGenerator(true)}>
                <Palette className="w-4 h-4 mr-2" />
                Create Art
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4">
            Mathematical Art Generator
          </Badge>
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Create Beautiful Flow Field Art
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Generate stunning mathematical art using advanced flow fields, noise algorithms, and AI-powered enhancement.
            Perfect for digital art, NFTs, and creative projects.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => setShowGenerator(true)}>
              <Zap className="w-5 h-5 mr-2" />
              Start Creating
            </Button>
            <Link href="/admin">
              <Button size="lg" variant="outline">
                <Settings className="w-5 h-5 mr-2" />
                Advanced Controls
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Powerful Features</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Everything you need to create professional mathematical art
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Palette className="w-8 h-8 text-blue-500 mb-2" />
                <CardTitle>Flow Field Generation</CardTitle>
                <CardDescription>Advanced mathematical algorithms create beautiful flowing patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Perlin noise integration</li>
                  <li>• Multiple projection types</li>
                  <li>• Customizable parameters</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="w-8 h-8 text-purple-500 mb-2" />
                <CardTitle>AI Enhancement</CardTitle>
                <CardDescription>AI-powered upscaling and style enhancement for professional results</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• 4K/8K upscaling</li>
                  <li>• Style transfer</li>
                  <li>• Quality enhancement</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Settings className="w-8 h-8 text-green-500 mb-2" />
                <CardTitle>Admin Panel</CardTitle>
                <CardDescription>Professional controls with job queuing and batch processing</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Offline job queue</li>
                  <li>• Parameter presets</li>
                  <li>• Undo/redo system</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="w-8 h-8 text-orange-500 mb-2" />
                <CardTitle>Gallery & Sharing</CardTitle>
                <CardDescription>Save, organize, and share your mathematical masterpieces</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Local gallery storage</li>
                  <li>• Cloud synchronization</li>
                  <li>• Export options</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-red-500 rounded mb-2" />
                <CardTitle>Multiple Formats</CardTitle>
                <CardDescription>Generate art in various resolutions and formats</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• 1K to 8K resolution</li>
                  <li>• PNG, JPEG, SVG</li>
                  <li>• 360° panoramic</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded mb-2" />
                <CardTitle>Real-time Preview</CardTitle>
                <CardDescription>See your changes instantly with live parameter adjustment</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Live canvas preview</li>
                  <li>• Parameter visualization</li>
                  <li>• Instant feedback</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Create Amazing Art?</h3>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of artists using FlowSketch to create stunning mathematical art. Start with our simple
            interface or dive deep with the admin panel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => setShowGenerator(true)}>
              <Palette className="w-5 h-5 mr-2" />
              Start Creating Now
            </Button>
            <Link href="/admin">
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent"
              >
                <Settings className="w-5 h-5 mr-2" />
                Explore Admin Panel
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            © 2024 FlowSketch. Mathematical art generation powered by advanced algorithms.
          </p>
        </div>
      </footer>
    </div>
  )
}
