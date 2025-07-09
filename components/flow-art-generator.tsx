"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, Sparkles, Palette, Zap } from "lucide-react"
import { generateDataset } from "@/lib/flow-model"
import { createSVGPlot } from "@/lib/plot-utils"
import { upscaleImageClient } from "@/lib/client-upscaler"

const datasets = [
  { value: "spirals", label: "Spirals", description: "Flowing spiral patterns" },
  { value: "moons", label: "Moons", description: "Crescent moon shapes" },
  { value: "checkerboard", label: "Checkerboard", description: "Grid-like patterns" },
  { value: "gaussian", label: "Gaussian", description: "Cloud-like distributions" },
  { value: "grid", label: "Grid", description: "Structured grid points" },
  { value: "neural", label: "Neural Network", description: "Mathematical neural patterns" },
]

const colorSchemes = [
  { value: "viridis", label: "Viridis", colors: ["#440154", "#31688e", "#35b779", "#fde725"] },
  { value: "plasma", label: "Plasma", colors: ["#0d0887", "#7e03a8", "#cc4778", "#f89441", "#f0f921"] },
  { value: "magma", label: "Magma", colors: ["#000004", "#3b0f70", "#8c2981", "#de4968", "#fe9f6d", "#fcfdbf"] },
  { value: "inferno", label: "Inferno", colors: ["#000004", "#420a68", "#932667", "#dd513a", "#fca50a", "#fcffa4"] },
  { value: "cool", label: "Cool", colors: ["#00ffff", "#0080ff", "#0000ff", "#8000ff"] },
  { value: "warm", label: "Warm", colors: ["#ff0000", "#ff8000", "#ffff00", "#80ff00"] },
]

export default function FlowArtGenerator() {
  const [dataset, setDataset] = useState("spirals")
  const [seed, setSeed] = useState([42])
  const [samples, setSamples] = useState([500])
  const [noise, setNoise] = useState([0.05])
  const [colorScheme, setColorScheme] = useState("viridis")
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUpscaling, setIsUpscaling] = useState(false)
  const [generationMode, setGenerationMode] = useState<"svg" | "ai">("svg")

  const generateArt = useCallback(async () => {
    setIsGenerating(true)
    try {
      if (generationMode === "svg") {
        // Generate SVG plot
        const data = generateDataset(dataset, seed[0], samples[0], noise[0])
        const svgContent = createSVGPlot(data, colorScheme, 800, 600)
        const blob = new Blob([svgContent], { type: "image/svg+xml" })
        const url = URL.createObjectURL(blob)
        setGeneratedImage(url)
      } else {
        // Generate AI art
        const response = await fetch("/api/generate-ai-art", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dataset,
            seed: seed[0],
            samples: samples[0],
            noise: noise[0],
            colorScheme,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to generate AI art")
        }

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setGeneratedImage(url)
      }
    } catch (error) {
      console.error("Error generating art:", error)
    } finally {
      setIsGenerating(false)
    }
  }, [dataset, seed, samples, noise, colorScheme, generationMode])

  const upscaleImage = useCallback(async () => {
    if (!generatedImage) return

    setIsUpscaling(true)
    try {
      const upscaledUrl = await upscaleImageClient(generatedImage)
      setGeneratedImage(upscaledUrl)
    } catch (error) {
      console.error("Error upscaling image:", error)
    } finally {
      setIsUpscaling(false)
    }
  }, [generatedImage])

  const downloadImage = useCallback(() => {
    if (!generatedImage) return

    const link = document.createElement("a")
    link.href = generatedImage
    link.download = `flowsketch-${dataset}-${seed[0]}-${Date.now()}.${generationMode === "svg" ? "svg" : "png"}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [generatedImage, dataset, seed, generationMode])

  const selectedDataset = datasets.find((d) => d.value === dataset)
  const selectedColorScheme = colorSchemes.find((c) => c.value === colorScheme)

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          FlowSketch Art Generator
        </h1>
        <p className="text-muted-foreground text-lg">Create beautiful mathematical art from data patterns</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Art Configuration
            </CardTitle>
            <CardDescription>Customize your mathematical art generation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Generation Mode */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Generation Mode</Label>
              <div className="flex gap-2">
                <Button
                  variant={generationMode === "svg" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGenerationMode("svg")}
                  className="flex-1"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  SVG Plot
                </Button>
                <Button
                  variant={generationMode === "ai" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGenerationMode("ai")}
                  className="flex-1"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Generated
                </Button>
              </div>
            </div>

            <Separator />

            {/* Dataset Selection */}
            <div className="space-y-2">
              <Label htmlFor="dataset">Dataset Pattern</Label>
              <Select value={dataset} onValueChange={setDataset}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a dataset" />
                </SelectTrigger>
                <SelectContent>
                  {datasets.map((ds) => (
                    <SelectItem key={ds.value} value={ds.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{ds.label}</span>
                        <span className="text-xs text-muted-foreground">{ds.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedDataset && (
                <Badge variant="secondary" className="w-fit">
                  {selectedDataset.description}
                </Badge>
              )}
            </div>

            {/* Color Scheme */}
            <div className="space-y-2">
              <Label htmlFor="colorScheme">Color Palette</Label>
              <Select value={colorScheme} onValueChange={setColorScheme}>
                <SelectTrigger>
                  <SelectValue placeholder="Select colors" />
                </SelectTrigger>
                <SelectContent>
                  {colorSchemes.map((scheme) => (
                    <SelectItem key={scheme.value} value={scheme.value}>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {scheme.colors.slice(0, 4).map((color, i) => (
                            <div
                              key={i}
                              className="w-3 h-3 rounded-full border border-gray-300"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <span>{scheme.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Parameters */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Seed: {seed[0]}</Label>
                <Slider value={seed} onValueChange={setSeed} min={1} max={1000} step={1} className="w-full" />
              </div>

              <div className="space-y-2">
                <Label>Samples: {samples[0]}</Label>
                <Slider value={samples} onValueChange={setSamples} min={100} max={2000} step={50} className="w-full" />
              </div>

              <div className="space-y-2">
                <Label>Noise: {noise[0].toFixed(3)}</Label>
                <Slider value={noise} onValueChange={setNoise} min={0} max={0.2} step={0.005} className="w-full" />
              </div>
            </div>

            <Separator />

            {/* Generate Button */}
            <Button onClick={generateArt} disabled={isGenerating} className="w-full" size="lg">
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Flow Art
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preview Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Artwork</CardTitle>
            <CardDescription>Your mathematical art will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center mb-4">
              {generatedImage ? (
                <img
                  src={generatedImage || "/placeholder.svg"}
                  alt="Generated Flow Art"
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <Palette className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Click "Generate Flow Art" to create your artwork</p>
                </div>
              )}
            </div>

            {generatedImage && (
              <div className="flex gap-2">
                <Button onClick={downloadImage} variant="outline" className="flex-1 bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={upscaleImage}
                  disabled={isUpscaling}
                  variant="outline"
                  className="flex-1 bg-transparent"
                >
                  {isUpscaling ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      Upscaling...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Upscale
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
