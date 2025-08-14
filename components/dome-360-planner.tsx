"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { toast } from "@/hooks/use-toast"
import {
  Download,
  Settings,
  Sparkles,
  RefreshCw,
  Globe,
  CircleDot,
  Loader2,
  ArrowUp,
  ArrowDown,
  Orbit,
  Palette,
} from "lucide-react"
import { CULTURAL_DATASETS, COLOR_SCHEMES, getScenarios } from "@/lib/ai-prompt"

interface GeneratedImage {
  imageUrl: string
  prompt: string
  aspectRatio: string
  format: string
  projectionType?: string
  panoramaFormat?: string
  seamlessWrapping?: boolean
  planetariumOptimized?: boolean
}

export default function Dome360Planner() {
  // State management
  const [dataset, setDataset] = useState("vietnamese")
  const [scenario, setScenario] = useState("trung-sisters")
  const [colorScheme, setColorScheme] = useState("metallic")
  const [seed, setSeed] = useState(1234)
  const [numSamples, setNumSamples] = useState(4000)
  const [noiseScale, setNoiseScale] = useState(0.08)

  // Projection settings
  const [projectionType, setProjectionType] = useState("fisheye")
  const [panoramaFormat, setPanoramaFormat] = useState("equirectangular")

  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null)
  const [generationType, setGenerationType] = useState<"dome" | "360">("dome")

  // Get available scenarios for current dataset
  const availableScenarios = getScenarios(dataset)

  // Reset scenario when dataset changes
  const handleDatasetChange = useCallback((newDataset: string) => {
    setDataset(newDataset)
    const scenarios = getScenarios(newDataset)
    const firstScenario = Object.keys(scenarios)[0]
    if (firstScenario) {
      setScenario(firstScenario)
    }
  }, [])

  // Generate random parameters
  const randomizeParameters = useCallback(() => {
    setSeed(Math.floor(Math.random() * 10000))
    setNumSamples(Math.floor(Math.random() * 6000) + 2000)
    setNoiseScale(Math.random() * 0.15 + 0.05)

    // Random color scheme
    const colorKeys = Object.keys(COLOR_SCHEMES)
    const randomColor = colorKeys[Math.floor(Math.random() * colorKeys.length)]
    setColorScheme(randomColor)

    // Random projection types
    const projectionTypes = ["fisheye", "tunnel-up", "tunnel-down", "little-planet"]
    const panoramaFormats = ["equirectangular", "stereographic"]
    setProjectionType(projectionTypes[Math.floor(Math.random() * projectionTypes.length)])
    setPanoramaFormat(panoramaFormats[Math.floor(Math.random() * panoramaFormats.length)])

    toast({
      title: "Parameters Randomized",
      description: "New random values generated for all parameters",
    })
  }, [])

  // Generate image
  const generateImage = useCallback(async () => {
    if (isGenerating) return

    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-ai-art", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataset,
          scenario,
          colorScheme,
          seed,
          numSamples,
          noiseScale,
          type: generationType,
          projectionType,
          panoramaFormat,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setGeneratedImage({
          imageUrl: data.imageUrl,
          prompt: data.prompt,
          aspectRatio: data.aspectRatio || (generationType === "360" ? "1.75:1" : "1:1"),
          format: data.format || (generationType === "360" ? "360° Panorama" : "Dome Projection"),
          projectionType: data.projectionType,
          panoramaFormat: data.panoramaFormat,
          seamlessWrapping: data.seamlessWrapping,
          planetariumOptimized: data.planetariumOptimized,
        })

        toast({
          title: "Generation Complete!",
          description: `${generationType === "360" ? "360° panorama" : "Dome projection"} generated successfully`,
        })
      } else {
        throw new Error(data.error || "Failed to generate image")
      }
    } catch (error: any) {
      console.error("Generation error:", error)
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate image",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }, [
    dataset,
    scenario,
    colorScheme,
    seed,
    numSamples,
    noiseScale,
    generationType,
    projectionType,
    panoramaFormat,
    isGenerating,
  ])

  // Download image
  const downloadImage = useCallback(async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(`/api/download-proxy?url=${encodeURIComponent(imageUrl)}&filename=${filename}`)

      if (!response.ok) {
        throw new Error("Download failed")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Download Complete",
        description: `${filename} downloaded successfully`,
      })
    } catch (error) {
      console.error("Download error:", error)
      toast({
        title: "Download Failed",
        description: "Failed to download image",
        variant: "destructive",
      })
    }
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Dome & 360° Planner
        </h1>
        <p className="text-muted-foreground">Specialized tool for dome projection and 360° panoramic art generation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Dome & 360° Settings
              </CardTitle>
              <CardDescription>Configure specialized projection parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Generation Type */}
              <div className="space-y-2">
                <Label>Generation Type</Label>
                <Select value={generationType} onValueChange={(value: "dome" | "360") => setGenerationType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dome">
                      <div className="flex items-center gap-2">
                        <CircleDot className="h-4 w-4" />
                        Dome Projection
                      </div>
                    </SelectItem>
                    <SelectItem value="360">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        360° Panorama
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Projection Type Selection */}
              {generationType === "dome" && (
                <div className="space-y-2">
                  <Label>Dome Projection Type</Label>
                  <Select value={projectionType} onValueChange={setProjectionType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fisheye">
                        <div className="flex items-center gap-2">
                          <CircleDot className="h-4 w-4" />
                          Fisheye
                        </div>
                      </SelectItem>
                      <SelectItem value="tunnel-up">
                        <div className="flex items-center gap-2">
                          <ArrowUp className="h-4 w-4" />
                          Tunnel Up
                        </div>
                      </SelectItem>
                      <SelectItem value="tunnel-down">
                        <div className="flex items-center gap-2">
                          <ArrowDown className="h-4 w-4" />
                          Tunnel Down
                        </div>
                      </SelectItem>
                      <SelectItem value="little-planet">
                        <div className="flex items-center gap-2">
                          <Orbit className="h-4 w-4" />
                          Little Planet
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Panorama Format Selection */}
              {generationType === "360" && (
                <div className="space-y-2">
                  <Label>360° Panorama Format</Label>
                  <Select value={panoramaFormat} onValueChange={setPanoramaFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equirectangular">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Equirectangular
                          <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-700 border-green-200">
                            Pro Seamless
                          </Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="stereographic">
                        <div className="flex items-center gap-2">
                          <CircleDot className="h-4 w-4" />
                          Stereographic
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Dataset Selection */}
              <div className="space-y-2">
                <Label>Cultural Dataset</Label>
                <Select value={dataset} onValueChange={handleDatasetChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CULTURAL_DATASETS).map(([key, data]) => (
                      <SelectItem key={key} value={key}>
                        {data.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Scenario Selection */}
              <div className="space-y-2">
                <Label>Scenario</Label>
                <Select value={scenario} onValueChange={setScenario}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(availableScenarios).map(([key, data]) => (
                      <SelectItem key={key} value={key}>
                        {data.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Color Scheme */}
              <div className="space-y-2">
                <Label>Color Scheme</Label>
                <Select value={colorScheme} onValueChange={setColorScheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(COLOR_SCHEMES).map(([key]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <Palette className="h-4 w-4" />
                          {key}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Parameters */}
              <div className="space-y-4 border-t pt-4">
                <div className="space-y-2">
                  <Label>Seed: {seed}</Label>
                  <Slider value={[seed]} onValueChange={(value) => setSeed(value[0])} max={9999} min={1} step={1} />
                </div>

                <div className="space-y-2">
                  <Label>Samples: {numSamples}</Label>
                  <Slider
                    value={[numSamples]}
                    onValueChange={(value) => setNumSamples(value[0])}
                    max={8000}
                    min={1000}
                    step={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Noise Scale: {noiseScale.toFixed(3)}</Label>
                  <Slider
                    value={[noiseScale]}
                    onValueChange={(value) => setNoiseScale(value[0])}
                    max={0.2}
                    min={0.01}
                    step={0.001}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button onClick={generateImage} disabled={isGenerating} className="w-full" size="lg">
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate {generationType === "360" ? "360° Panorama" : "Dome Projection"}
                    </>
                  )}
                </Button>

                <Button onClick={randomizeParameters} variant="outline" className="w-full bg-transparent">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Randomize Parameters
                </Button>
              </div>

              {/* Current Settings Display */}
              <div className="space-y-2 border-t pt-4">
                <Label className="text-sm font-semibold">Current Settings</Label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <Badge variant="outline" className="text-xs">
                      {generationType === "360" ? "360°" : "Dome"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Format:</span>
                    <Badge variant="outline" className="text-xs">
                      {generationType === "360" ? panoramaFormat : projectionType}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {generationType === "360" ? <Globe className="h-5 w-5" /> : <CircleDot className="h-5 w-5" />}
                Generated {generationType === "360" ? "360° Panorama" : "Dome Projection"}
              </CardTitle>
              <CardDescription>
                {generationType === "360"
                  ? `${panoramaFormat === "equirectangular" ? "Seamless equirectangular" : "Stereographic"} 360° panoramic artwork optimized for VR viewing`
                  : `${projectionType} projection optimized for planetarium dome display`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedImage ? (
                <div className="space-y-4">
                  <AspectRatio ratio={generationType === "360" ? 1.75 : 1}>
                    <img
                      src={generatedImage.imageUrl || "/placeholder.svg"}
                      alt={`Generated ${generationType === "360" ? "360° Panorama" : "Dome Projection"}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </AspectRatio>
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="flex gap-2">
                        <Badge variant="secondary">{generatedImage.format}</Badge>
                        {generatedImage.planetariumOptimized && <Badge variant="outline">Planetarium Ready</Badge>}
                        {generatedImage.seamlessWrapping && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Professional Seamless
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {generationType === "360" ? generatedImage.panoramaFormat : generatedImage.projectionType}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {generationType === "360" ? "1792×1024 • 360° Panorama" : "1024×1024 • Dome Projection"}
                      </p>
                      {generatedImage.seamlessWrapping && (
                        <p className="text-xs text-green-600">✓ Professional seamless edge wrapping verified</p>
                      )}
                    </div>
                    <Button
                      onClick={() => downloadImage(generatedImage.imageUrl, `flowsketch-${generationType}.jpg`)}
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className={`${generationType === "360" ? "aspect-[1.75]" : "aspect-square"} bg-muted rounded-lg flex items-center justify-center`}
                >
                  <div className="text-center space-y-2">
                    {generationType === "360" ? (
                      <Globe className="h-12 w-12 mx-auto text-muted-foreground" />
                    ) : (
                      <CircleDot className="h-12 w-12 mx-auto text-muted-foreground" />
                    )}
                    <p className="text-muted-foreground">
                      No {generationType === "360" ? "360° panorama" : "dome projection"} generated yet
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Current: {generationType === "360" ? panoramaFormat : projectionType}
                    </p>
                    {generationType === "360" && panoramaFormat === "equirectangular" && (
                      <p className="text-xs text-green-600">Will generate with professional seamless wrapping</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Named export for compatibility
export { Dome360Planner }
