"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Sparkles, Zap, Eye, Layers, Filter, Loader2, Star, Wand2 } from "lucide-react"

interface EnhancementSuiteProps {
  baseImageUrl: string
  onEnhancedImage: (imageUrl: string, metadata: any) => void
}

interface EnhancementOption {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: string
  premium?: boolean
  processing?: boolean
}

export function EnhancementSuite({ baseImageUrl, onEnhancedImage }: EnhancementSuiteProps) {
  const [selectedEnhancement, setSelectedEnhancement] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [enhancementSettings, setEnhancementSettings] = useState({
    intensity: [75],
    contrast: [50],
    saturation: [50],
    sharpness: [50],
    brightness: [50],
  })

  const enhancements: EnhancementOption[] = [
    {
      id: "cosmic-mandelbrot",
      name: "Cosmic Mandelbrot",
      description: "Transform into fractal cosmic art",
      icon: <Sparkles className="w-5 h-5" />,
      category: "Fractal Art",
      premium: true,
    },
    {
      id: "neural-dreams",
      name: "Neural Dreams",
      description: "AI-powered artistic interpretation",
      icon: <Eye className="w-5 h-5" />,
      category: "AI Art",
    },
    {
      id: "quantum-waves",
      name: "Quantum Waves",
      description: "Abstract quantum field visualization",
      icon: <Zap className="w-5 h-5" />,
      category: "Abstract",
    },
    {
      id: "lunar-landscape",
      name: "Lunar Landscape",
      description: "Space-themed artistic transformation",
      icon: <Star className="w-5 h-5" />,
      category: "Space Art",
    },
    {
      id: "crystal-formation",
      name: "Crystal Formation",
      description: "Geometric crystalline structures",
      icon: <Layers className="w-5 h-5" />,
      category: "Geometric",
    },
    {
      id: "fluid-dynamics",
      name: "Fluid Dynamics",
      description: "Flowing liquid-like transformations",
      icon: <Filter className="w-5 h-5" />,
      category: "Abstract",
    },
  ]

  const handleEnhancement = async (enhancementId: string) => {
    setSelectedEnhancement(enhancementId)
    setProcessing(true)
    setProgress(0)

    try {
      // Simulate enhancement processing
      const enhancement = enhancements.find((e) => e.id === enhancementId)

      // Progress simulation
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      // Apply enhancement using canvas manipulation
      const enhancedImage = await applyEnhancement(baseImageUrl, enhancementId, enhancementSettings)

      const metadata = {
        enhancement: enhancement?.name,
        category: enhancement?.category,
        settings: enhancementSettings,
        timestamp: new Date().toISOString(),
      }

      onEnhancedImage(enhancedImage, metadata)
    } catch (error) {
      console.error("Enhancement failed:", error)
    } finally {
      setProcessing(false)
      setProgress(0)
    }
  }

  const applyEnhancement = async (imageUrl: string, enhancementId: string, settings: any): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          resolve(imageUrl)
          return
        }

        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        // Apply different enhancements based on ID
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        switch (enhancementId) {
          case "cosmic-mandelbrot":
            applyCosmicEffect(data, settings)
            break
          case "neural-dreams":
            applyNeuralEffect(data, settings)
            break
          case "quantum-waves":
            applyQuantumEffect(data, settings)
            break
          case "lunar-landscape":
            applyLunarEffect(data, settings)
            break
          case "crystal-formation":
            applyCrystalEffect(data, settings)
            break
          case "fluid-dynamics":
            applyFluidEffect(data, settings)
            break
        }

        ctx.putImageData(imageData, 0, 0)
        resolve(canvas.toDataURL("image/png"))
      }

      img.src = imageUrl
    })
  }

  // Enhancement effect functions
  const applyCosmicEffect = (data: Uint8ClampedArray, settings: any) => {
    const intensity = settings.intensity[0] / 100
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * (1 + intensity * 0.5)) // Red boost
      data[i + 1] = Math.min(255, data[i + 1] * (1 + intensity * 0.3)) // Green
      data[i + 2] = Math.min(255, data[i + 2] * (1 + intensity * 0.8)) // Blue boost
    }
  }

  const applyNeuralEffect = (data: Uint8ClampedArray, settings: any) => {
    const intensity = settings.intensity[0] / 100
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
      data[i] = Math.min(255, avg + (data[i] - avg) * (1 + intensity))
      data[i + 1] = Math.min(255, avg + (data[i + 1] - avg) * (1 + intensity))
      data[i + 2] = Math.min(255, avg + (data[i + 2] - avg) * (1 + intensity))
    }
  }

  const applyQuantumEffect = (data: Uint8ClampedArray, settings: any) => {
    const intensity = settings.intensity[0] / 100
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * (1 + Math.sin(i * 0.01) * intensity))
      data[i + 1] = Math.min(255, data[i + 1] * (1 + Math.cos(i * 0.01) * intensity))
      data[i + 2] = Math.min(255, data[i + 2] * (1 + Math.sin(i * 0.02) * intensity))
    }
  }

  const applyLunarEffect = (data: Uint8ClampedArray, settings: any) => {
    const intensity = settings.intensity[0] / 100
    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3
      data[i] = Math.min(255, gray + data[i] * intensity * 0.3)
      data[i + 1] = Math.min(255, gray + data[i + 1] * intensity * 0.3)
      data[i + 2] = Math.min(255, gray + data[i + 2] * intensity * 0.5)
    }
  }

  const applyCrystalEffect = (data: Uint8ClampedArray, settings: any) => {
    const intensity = settings.intensity[0] / 100
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * (1 + intensity * 0.4))
      data[i + 1] = Math.min(255, data[i + 1] * (1 + intensity * 0.6))
      data[i + 2] = Math.min(255, data[i + 2] * (1 + intensity * 0.8))
    }
  }

  const applyFluidEffect = (data: Uint8ClampedArray, settings: any) => {
    const intensity = settings.intensity[0] / 100
    for (let i = 0; i < data.length; i += 4) {
      const wave = Math.sin(i * 0.001) * intensity
      data[i] = Math.min(255, Math.max(0, data[i] + wave * 50))
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + wave * 30))
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + wave * 70))
    }
  }

  return (
    <Card className="w-full mt-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
          <Wand2 className="w-5 h-5" />
          Enhancement Suite
        </CardTitle>
        <p className="text-sm text-purple-600 dark:text-purple-300">
          Transform your generated art with professional enhancement filters
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="enhancements" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="enhancements">Enhancements</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="enhancements" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enhancements.map((enhancement) => (
                <Card
                  key={enhancement.id}
                  className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                    selectedEnhancement === enhancement.id
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                  onClick={() => !processing && handleEnhancement(enhancement.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {enhancement.icon}
                        <Badge variant="secondary" className="text-xs">
                          {enhancement.category}
                        </Badge>
                      </div>
                      {enhancement.premium && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">
                          Premium
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{enhancement.name}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">{enhancement.description}</p>
                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      disabled={processing}
                    >
                      {processing && selectedEnhancement === enhancement.id ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Apply Enhancement"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Intensity</Label>
                  <Slider
                    value={enhancementSettings.intensity}
                    onValueChange={(value) => setEnhancementSettings((prev) => ({ ...prev, intensity: value }))}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                  <span className="text-xs text-gray-500">{enhancementSettings.intensity[0]}%</span>
                </div>

                <div>
                  <Label className="text-sm font-medium">Contrast</Label>
                  <Slider
                    value={enhancementSettings.contrast}
                    onValueChange={(value) => setEnhancementSettings((prev) => ({ ...prev, contrast: value }))}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                  <span className="text-xs text-gray-500">{enhancementSettings.contrast[0]}%</span>
                </div>

                <div>
                  <Label className="text-sm font-medium">Saturation</Label>
                  <Slider
                    value={enhancementSettings.saturation}
                    onValueChange={(value) => setEnhancementSettings((prev) => ({ ...prev, saturation: value }))}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                  <span className="text-xs text-gray-500">{enhancementSettings.saturation[0]}%</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Sharpness</Label>
                  <Slider
                    value={enhancementSettings.sharpness}
                    onValueChange={(value) => setEnhancementSettings((prev) => ({ ...prev, sharpness: value }))}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                  <span className="text-xs text-gray-500">{enhancementSettings.sharpness[0]}%</span>
                </div>

                <div>
                  <Label className="text-sm font-medium">Brightness</Label>
                  <Slider
                    value={enhancementSettings.brightness}
                    onValueChange={(value) => setEnhancementSettings((prev) => ({ ...prev, brightness: value }))}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                  <span className="text-xs text-gray-500">{enhancementSettings.brightness[0]}%</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {processing && (
          <div className="mt-4 space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-center text-purple-600 dark:text-purple-300">
              Applying {enhancements.find((e) => e.id === selectedEnhancement)?.name}... {progress}%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
