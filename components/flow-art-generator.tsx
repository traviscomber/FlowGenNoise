"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Palette, Wand2, Download, RefreshCw, Zap, Sparkles, Archive, Settings, Info, Award } from "lucide-react"
import { FlowModel } from "@/lib/flow-model"
import { PlotUtils } from "@/lib/plot-utils"
import { GalleryStorage, type GalleryImage } from "@/lib/gallery-storage"
import { Gallery } from "@/components/gallery"

interface GenerationSettings {
  dataset: string
  scenario: string
  colorScheme: string
  seed: number
  samples: number
  noise: number
  generationMode: "svg" | "ai"
}

export function FlowArtGenerator() {
  const [settings, setSettings] = useState<GenerationSettings>({
    dataset: "spiral",
    scenario: "none",
    colorScheme: "viridis",
    seed: Math.floor(Math.random() * 10000),
    samples: 1000,
    noise: 0.05,
    generationMode: "svg",
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [isUpscaling, setIsUpscaling] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [upscaledImage, setUpscaledImage] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("generate")
  const [lastGeneration, setLastGeneration] = useState<GalleryImage | null>(null)

  const datasets = [
    { value: "spiral", label: "Spiral Flow" },
    { value: "moons", label: "Two Moons" },
    { value: "circles", label: "Concentric Circles" },
    { value: "checkerboard", label: "Checkerboard" },
    { value: "swiss_roll", label: "Swiss Roll" },
    { value: "s_curve", label: "S-Curve" },
    { value: "blobs", label: "Gaussian Blobs" },
    { value: "rings", label: "Nested Rings" },
  ]

  const scenarios = [
    { value: "none", label: "Pure Mathematical" },
    { value: "enchanted_forest", label: "Enchanted Forest" },
    { value: "deep_ocean", label: "Deep Ocean" },
    { value: "cosmic_nebula", label: "Cosmic Nebula" },
    { value: "cyberpunk_city", label: "Cyberpunk City" },
    { value: "ancient_temple", label: "Ancient Temple" },
    { value: "crystal_cave", label: "Crystal Cave" },
    { value: "aurora_borealis", label: "Aurora Borealis" },
    { value: "volcanic_landscape", label: "Volcanic Landscape" },
  ]

  const colorSchemes = [
    { value: "viridis", label: "Viridis" },
    { value: "plasma", label: "Plasma" },
    { value: "inferno", label: "Inferno" },
    { value: "magma", label: "Magma" },
    { value: "cividis", label: "Cividis" },
    { value: "turbo", label: "Turbo" },
    { value: "cool", label: "Cool Blues" },
    { value: "warm", label: "Warm Sunset" },
    { value: "rainbow", label: "Rainbow" },
    { value: "monochrome", label: "Monochrome" },
  ]

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    setProgress(0)
    setGeneratedImage(null)
    setUpscaledImage(null)

    try {
      if (settings.generationMode === "svg") {
        // Generate mathematical SVG
        setProgress(20)
        const data = FlowModel.generateDataset(settings.dataset, settings.samples, settings.seed, settings.noise)

        setProgress(60)
        const svg = PlotUtils.createSVGPlot(data, settings.colorScheme, 800, 600)

        setProgress(80)
        const blob = new Blob([svg], { type: "image/svg+xml" })
        const url = URL.createObjectURL(blob)

        setProgress(100)
        setGeneratedImage(url)

        // Save to gallery
        const image: GalleryImage = {
          id: `flow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          imageUrl: url,
          metadata: {
            ...settings,
            createdAt: Date.now(),
            filename: `flow-art-${settings.dataset}-${Date.now()}.svg`,
          },
          isFavorite: false,
          tags: [settings.dataset, settings.scenario, "mathematical"],
        }

        GalleryStorage.saveImage(image)
        setLastGeneration(image)
      } else {
        // Generate AI-enhanced version
        setProgress(10)
        const data = FlowModel.generateDataset(settings.dataset, settings.samples, settings.seed, settings.noise)

        setProgress(30)
        const svg = PlotUtils.createSVGPlot(data, settings.colorScheme, 1024, 1024)

        setProgress(50)
        const response = await fetch("/api/generate-ai-art", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            svgData: svg,
            scenario: settings.scenario,
            dataset: settings.dataset,
            colorScheme: settings.colorScheme,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to generate AI art")
        }

        setProgress(80)
        const result = await response.json()

        setProgress(100)
        setGeneratedImage(result.imageUrl)

        // Save to gallery
        const image: GalleryImage = {
          id: `ai-flow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          imageUrl: result.imageUrl,
          metadata: {
            ...settings,
            createdAt: Date.now(),
            filename: `ai-flow-art-${settings.dataset}-${Date.now()}.png`,
          },
          isFavorite: false,
          tags: [settings.dataset, settings.scenario, "ai-generated"],
        }

        GalleryStorage.saveImage(image)
        setLastGeneration(image)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsGenerating(false)
      setProgress(0)
    }
  }

  const handleUpscale = async () => {
    if (!generatedImage) return

    setIsUpscaling(true)
    setError(null)

    try {
      const response = await fetch("/api/upscale-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: generatedImage }),
      })

      if (!response.ok) {
        throw new Error("Failed to upscale image")
      }

      const result = await response.json()
      setUpscaledImage(result.upscaledUrl)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsUpscaling(false)
    }
  }

  const handleDownload = (imageUrl: string, filename: string) => {
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleRandomize = () => {
    setSettings({
      ...settings,
      seed: Math.floor(Math.random() * 10000),
      dataset: datasets[Math.floor(Math.random() * datasets.length)].value,
      scenario: scenarios[Math.floor(Math.random() * scenarios.length)].value,
      colorScheme: colorSchemes[Math.floor(Math.random() * colorSchemes.length)].value,
    })
  }

  const handleImageSelect = (image: GalleryImage) => {
    setSettings({
      dataset: image.metadata.dataset,
      scenario: image.metadata.scenario,
      colorScheme: image.metadata.colorScheme,
      seed: image.metadata.seed,
      samples: image.metadata.samples,
      noise: image.metadata.noise,
      generationMode: image.metadata.generationMode,
    })
    setActiveTab("generate")
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          FlowSketch Art Generator
        </h1>
        <p className="text-muted-foreground text-lg">
          Create stunning mathematical art with AI enhancement and aesthetic scoring
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Generate Art
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Gallery
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Settings Panel */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Generation Settings
                </CardTitle>
                <CardDescription>Configure your mathematical art parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Generation Mode */}
                <div className="space-y-2">
                  <Label>Generation Mode</Label>
                  <Select
                    value={settings.generationMode}
                    onValueChange={(value: "svg" | "ai") => setSettings({ ...settings, generationMode: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="svg">
                        <div className="flex items-center gap-2">
                          <Palette className="h-4 w-4" />
                          Mathematical SVG
                        </div>
                      </SelectItem>
                      <SelectItem value="ai">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          AI Enhanced
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Dataset */}
                <div className="space-y-2">
                  <Label>Mathematical Dataset</Label>
                  <Select
                    value={settings.dataset}
                    onValueChange={(value) => setSettings({ ...settings, dataset: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {datasets.map((dataset) => (
                        <SelectItem key={dataset.value} value={dataset.value}>
                          {dataset.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Scenario */}
                {settings.generationMode === "ai" && (
                  <div className="space-y-2">
                    <Label>Creative Scenario</Label>
                    <Select
                      value={settings.scenario}
                      onValueChange={(value) => setSettings({ ...settings, scenario: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {scenarios.map((scenario) => (
                          <SelectItem key={scenario.value} value={scenario.value}>
                            {scenario.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Color Scheme */}
                <div className="space-y-2">
                  <Label>Color Scheme</Label>
                  <Select
                    value={settings.colorScheme}
                    onValueChange={(value) => setSettings({ ...settings, colorScheme: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorSchemes.map((scheme) => (
                        <SelectItem key={scheme.value} value={scheme.value}>
                          {scheme.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Seed */}
                <div className="space-y-2">
                  <Label>Random Seed</Label>
                  <Input
                    type="number"
                    value={settings.seed}
                    onChange={(e) => setSettings({ ...settings, seed: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>

                {/* Samples */}
                <div className="space-y-2">
                  <Label>Sample Count: {settings.samples}</Label>
                  <Slider
                    value={[settings.samples]}
                    onValueChange={([value]) => setSettings({ ...settings, samples: value })}
                    min={100}
                    max={5000}
                    step={100}
                  />
                </div>

                {/* Noise */}
                <div className="space-y-2">
                  <Label>Noise Level: {settings.noise.toFixed(3)}</Label>
                  <Slider
                    value={[settings.noise]}
                    onValueChange={([value]) => setSettings({ ...settings, noise: value })}
                    min={0}
                    max={0.2}
                    step={0.001}
                  />
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Generate Art
                      </>
                    )}
                  </Button>

                  <Button onClick={handleRandomize} variant="outline" className="w-full bg-transparent">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Randomize Settings
                  </Button>
                </div>

                {/* Progress */}
                {isGenerating && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}

                {/* Info */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    {settings.generationMode === "svg"
                      ? "Mathematical SVG generation creates precise geometric patterns based on flow dynamics."
                      : "AI enhancement transforms mathematical patterns into artistic interpretations using DALL-E 3."}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Preview Panel */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Generated Artwork
                  {lastGeneration?.aestheticScore && (
                    <Badge variant="outline" className="ml-2">
                      <Award className="h-3 w-3 mr-1" />
                      {lastGeneration.aestheticScore.score}/10
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Your mathematical art will appear here
                  {lastGeneration && (
                    <span className="ml-2">
                      • Generated: {new Date(lastGeneration.metadata.createdAt).toLocaleTimeString()}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {generatedImage ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={generatedImage || "/placeholder.svg"}
                        alt="Generated artwork"
                        className="w-full h-auto rounded-lg border shadow-lg"
                      />
                      {upscaledImage && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="default" className="bg-green-600">
                            <Zap className="h-3 w-3 mr-1" />
                            4K Enhanced
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Button
                        onClick={() =>
                          handleDownload(
                            upscaledImage || generatedImage,
                            `flowsketch-${settings.dataset}-${Date.now()}.${settings.generationMode === "svg" ? "svg" : "png"}`,
                          )
                        }
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download {upscaledImage ? "4K" : "Original"}
                      </Button>

                      {!upscaledImage && settings.generationMode !== "svg" && (
                        <Button onClick={handleUpscale} disabled={isUpscaling} variant="outline">
                          {isUpscaling ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                              Upscaling...
                            </>
                          ) : (
                            <>
                              <Zap className="h-4 w-4 mr-2" />
                              Upscale to 4K
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    {/* Settings Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-medium">{settings.dataset}</div>
                        <div className="text-muted-foreground">Dataset</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-medium">{settings.samples}</div>
                        <div className="text-muted-foreground">Samples</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-medium">{settings.noise.toFixed(3)}</div>
                        <div className="text-muted-foreground">Noise</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-medium">{settings.seed}</div>
                        <div className="text-muted-foreground">Seed</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No artwork generated yet</p>
                    <p className="text-sm">
                      Configure your settings and click "Generate Art" to create your masterpiece
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gallery">
          <Gallery onImageSelect={handleImageSelect} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
