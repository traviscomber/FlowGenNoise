"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, Sparkles, Palette, Zap, TreePine, Waves, Rocket, Building, Archive } from "lucide-react"
import { generateDataset, SCENARIOS } from "@/lib/flow-model"
import { createSVGPlot } from "@/lib/plot-utils"
import { upscaleImageClient } from "@/lib/client-upscaler"
import { Gallery } from "@/components/gallery"
import { GalleryStorage, type GalleryImage } from "@/lib/gallery-storage"

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

const scenarios = [
  { value: "none", label: "None", description: "Pure mathematical patterns", icon: Palette },
  {
    value: "forest",
    label: "Enchanted Forest",
    description: "Trees, mushrooms, flowers & butterflies",
    icon: TreePine,
  },
  { value: "ocean", label: "Deep Ocean", description: "Fish, coral, seaweed & jellyfish", icon: Waves },
  { value: "space", label: "Cosmic Nebula", description: "Stars, planets, asteroids & nebulae", icon: Rocket },
  {
    value: "city",
    label: "Cyberpunk City",
    description: "Buildings, vehicles, neon signs & holograms",
    icon: Building,
  },
]

export default function FlowArtGenerator() {
  const [dataset, setDataset] = useState("spirals")
  const [seed, setSeed] = useState([42])
  const [samples, setSamples] = useState([500])
  const [noise, setNoise] = useState([0.05])
  const [colorScheme, setColorScheme] = useState("viridis")
  const [scenario, setScenario] = useState("none")
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUpscaling, setIsUpscaling] = useState(false)
  const [generationMode, setGenerationMode] = useState<"svg" | "ai">("svg")

  const [showGallery, setShowGallery] = useState(false)

  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const saveToGallery = useCallback(
    async (imageUrl: string) => {
      const scenarioSuffix = scenario !== "none" ? `-${scenario}` : ""
      const filename = `flowsketch-${dataset}${scenarioSuffix}-${seed[0]}-${Date.now()}.${generationMode === "svg" ? "svg" : "png"}`

      const galleryImage: GalleryImage = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        imageUrl,
        metadata: {
          dataset,
          scenario: scenario || "none",
          colorScheme,
          seed: seed[0],
          samples: samples[0],
          noise: noise[0],
          generationMode,
          createdAt: Date.now(),
          filename,
          cloudStored: false,
        },
        isFavorite: false,
        tags: [],
      }

      // Auto-upload to cloud with progress
      setIsUploading(true)
      setUploadProgress(0)

      try {
        const result = await GalleryStorage.saveImageWithCloudUpload(galleryImage, (progress) =>
          setUploadProgress(progress),
        )

        if (!result.success) {
          console.error("Upload failed:", result.error)
          // Still saved locally, so not a complete failure
        }
      } catch (error) {
        console.error("Upload error:", error)
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
      }
    },
    [dataset, scenario, colorScheme, seed, samples, noise, generationMode],
  )

  const handleImageSelect = useCallback((image: GalleryImage) => {
    // Load settings from selected gallery image
    setDataset(image.metadata.dataset)
    setScenario(image.metadata.scenario)
    setColorScheme(image.metadata.colorScheme)
    setSeed([image.metadata.seed])
    setSamples([image.metadata.samples])
    setNoise([image.metadata.noise])
    setGenerationMode(image.metadata.generationMode)
    setShowGallery(false)
  }, [])

  const generateArt = useCallback(async () => {
    setIsGenerating(true)
    try {
      let imageUrl: string

      if (generationMode === "svg") {
        // Generate SVG plot with scenario blending
        const data = generateDataset(dataset, seed[0], samples[0], noise[0], scenario !== "none" ? scenario : undefined)
        const svgContent = createSVGPlot(data, {
          colorScheme,
          width: 1792,
          height: 1024,
          backgroundColor: scenario && SCENARIOS[scenario] ? SCENARIOS[scenario].backgroundColor : "#ffffff",
        })
        const blob = new Blob([svgContent], { type: "image/svg+xml" })
        imageUrl = URL.createObjectURL(blob)
      } else {
        // Generate AI art with scenario context
        const response = await fetch("/api/generate-ai-art", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dataset,
            seed: seed[0],
            numSamples: samples[0],
            noise: noise[0],
            colorScheme,
            scenario: scenario || undefined,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to generate AI art")
        }

        const { image } = await response.json()
        imageUrl = image
      }

      setGeneratedImage(imageUrl)
      saveToGallery(imageUrl)
    } catch (error) {
      console.error("Error generating art:", error)
    } finally {
      setIsGenerating(false)
    }
  }, [dataset, seed, samples, noise, colorScheme, scenario, generationMode, saveToGallery])

  const upscaleImage = useCallback(async () => {
    if (!generatedImage) return

    setIsUpscaling(true)
    try {
      const upscaledUrl = await upscaleImageClient(generatedImage, 4)
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
    const scenarioSuffix = scenario !== "none" ? `-${scenario}` : ""
    link.download = `flowsketch-${dataset}${scenarioSuffix}-${seed[0]}-${Date.now()}.${generationMode === "svg" ? "svg" : "png"}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [generatedImage, dataset, scenario, seed, generationMode])

  const selectedDataset = datasets.find((d) => d.value === dataset)
  const selectedScenario = scenarios.find((s) => s.value === scenario)

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            FlowSketch Art Generator
          </h1>
          <Button variant="outline" onClick={() => setShowGallery(!showGallery)} className="ml-4">
            <Archive className="h-4 w-4 mr-2" />
            Gallery
          </Button>
        </div>
        <p className="text-muted-foreground text-lg">Create beautiful mathematical art with immersive scenarios</p>
      </div>

      {showGallery ? (
        <div className="max-w-7xl mx-auto">
          <Gallery onImageSelect={handleImageSelect} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Art Configuration
              </CardTitle>
              <CardDescription>Customize your mathematical art generation with creative scenarios</CardDescription>
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

              {/* Scenario Selection */}
              <div className="space-y-2">
                <Label htmlFor="scenario">Creative Scenario</Label>
                <Select value={scenario} onValueChange={setScenario}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a scenario" />
                  </SelectTrigger>
                  <SelectContent>
                    {scenarios.map((sc) => (
                      <SelectItem key={sc.value} value={sc.value}>
                        <div className="flex items-center gap-2">
                          <sc.icon className="h-4 w-4" />
                          <div className="flex flex-col">
                            <span className="font-medium">{sc.label}</span>
                            <span className="text-xs text-muted-foreground">{sc.description}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedScenario && selectedScenario.value !== "none" && (
                  <Badge variant="outline" className="w-fit">
                    <selectedScenario.icon className="h-3 w-3 mr-1" />
                    {selectedScenario.description}
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
                  <Slider
                    value={samples}
                    onValueChange={setSamples}
                    min={100}
                    max={2000}
                    step={50}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Noise: {noise[0].toFixed(3)}</Label>
                  <Slider value={noise} onValueChange={setNoise} min={0} max={0.2} step={0.005} className="w-full" />
                </div>
              </div>

              <Separator />

              {/* Generate Button */}
              <Button onClick={generateArt} disabled={isGenerating || isUploading} className="w-full" size="lg">
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Generating...
                  </>
                ) : isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Uploading... {uploadProgress}%
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Flow Art
                  </>
                )}
              </Button>

              {isUploading && (
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Artwork</CardTitle>
              <CardDescription>Your mathematical art will appear here</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-[16/9] bg-muted rounded-lg flex items-center justify-center mb-4">
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
                    {scenario !== "none" && (
                      <p className="text-sm mt-2">
                        Ready to blend with {scenarios.find((s) => s.value === scenario)?.label}
                      </p>
                    )}
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
                        Pro Upscale
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export { FlowArtGenerator }
