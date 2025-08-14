"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Download, Eye, Palette, Settings, Sparkles } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { AspectRatio } from "@/components/ui/aspect-ratio"

// Dataset configurations
const datasets = {
  vietnamese: {
    name: "Vietnamese Heritage",
    scenarios: [
      "trung-sisters",
      "ly-thai-to",
      "temple-of-literature",
      "hoan-kiem-lake",
      "ha-long-bay",
      "hoi-an-lanterns",
      "mekong-delta",
      "sapa-terraces",
      "imperial-city-hue",
      "one-pillar-pagoda",
      "cao-dai-temple",
      "floating-markets",
      "dragon-bridge",
      "marble-mountains",
      "perfume-river",
      "ban-gioc-falls",
      "phong-nha-caves",
      "golden-bridge",
      "bach-ma-temple",
    ],
  },
  indonesian: {
    name: "Indonesian Heritage",
    scenarios: ["borobudur", "prambanan", "komodo-dragon", "batik-patterns", "gamelan-orchestra"],
  },
  thailand: {
    name: "Thailand Heritage",
    scenarios: [
      "garuda",
      "naga-serpent",
      "erawan-elephant",
      "wat-pho-reclining-buddha",
      "grand-palace",
      "floating-market",
      "thai-classical-dance",
      "golden-chedi",
      "lotus-temple",
      "karen-hill-tribe",
      "loy-krathong-festival",
      "muay-thai-warriors",
      "royal-barge-procession",
      "temple-of-dawn",
      "emerald-buddha",
      "ayutthaya-ruins",
      "phi-phi-islands",
    ],
  },
  escher: {
    name: "Escher Inspired",
    scenarios: ["impossible-stairs", "tessellation", "metamorphosis", "relativity", "infinite-loop"],
  },
}

const colorSchemes = [
  "vibrant",
  "pastel",
  "monochrome",
  "earth-tones",
  "neon",
  "metallic",
  "warm",
  "cool",
  "sunset",
  "ocean",
]

interface GeneratedImage {
  imageUrl: string
  prompt: string
  aspectRatio?: string
  format?: string
  resolution?: string
}

interface BatchGenerationResult {
  standard: GeneratedImage
  dome: GeneratedImage
  panorama: GeneratedImage
}

export default function FlowArtGenerator() {
  // Form state
  const [dataset, setDataset] = useState("vietnamese")
  const [scenario, setScenario] = useState("trung-sisters")
  const [colorScheme, setColorScheme] = useState("metallic")
  const [seed, setSeed] = useState(42)
  const [numSamples, setNumSamples] = useState(4000)
  const [noiseScale, setNoiseScale] = useState(0.08)
  const [customPrompt, setCustomPrompt] = useState("")

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationStatus, setGenerationStatus] = useState("")
  const [error, setError] = useState("")

  // Results state
  const [generatedImages, setGeneratedImages] = useState<BatchGenerationResult | null>(null)
  const [activeTab, setActiveTab] = useState("standard")

  // Preview state
  const [previewPrompt, setPreviewPrompt] = useState("")
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Reset scenario when dataset changes
  const handleDatasetChange = useCallback((newDataset: string) => {
    setDataset(newDataset)
    const firstScenario = datasets[newDataset as keyof typeof datasets]?.scenarios[0]
    if (firstScenario) {
      setScenario(firstScenario)
    }
  }, [])

  // Preview prompt function
  const previewPromptHandler = async () => {
    try {
      setGenerationStatus("Generating preview...")
      const response = await fetch("/api/preview-ai-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataset,
          scenario,
          colorScheme,
          seed,
          numSamples,
          noiseScale,
          customPrompt,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setPreviewPrompt(data.prompt)
        setIsPreviewOpen(true)
      } else {
        setError(data.error || "Failed to preview prompt")
      }
    } catch (err: any) {
      setError(err.message || "Failed to preview prompt")
    } finally {
      setGenerationStatus("")
    }
  }

  // Main generation function - generates all 3 types
  const generateArt = async () => {
    setIsGenerating(true)
    setError("")
    setGenerationProgress(0)
    setGeneratedImages(null)

    try {
      setGenerationStatus("Preparing prompts...")
      setGenerationProgress(10)

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
          customPrompt,
          generateAll: true, // This triggers batch generation
        }),
      })

      setGenerationStatus("Generating all 3 image types...")
      setGenerationProgress(30)

      const data = await response.json()

      if (data.success && data.batchGeneration) {
        setGenerationProgress(90)
        setGenerationStatus("Finalizing images...")

        // Set the batch results
        setGeneratedImages({
          standard: data.images.standard,
          dome: data.images.dome,
          panorama: data.images.panorama,
        })

        setGenerationProgress(100)
        setGenerationStatus("All 3 images generated successfully!")

        // Auto-switch to first tab
        setActiveTab("standard")
      } else {
        throw new Error(data.error || "Failed to generate images")
      }
    } catch (err: any) {
      console.error("Generation error:", err)
      setError(err.message || "Failed to generate art")
      setGenerationStatus("")
    } finally {
      setIsGenerating(false)
      setTimeout(() => {
        setGenerationProgress(0)
        setGenerationStatus("")
      }, 3000)
    }
  }

  // Individual generation functions
  const generateSingle = async (type: "standard" | "dome" | "360") => {
    setIsGenerating(true)
    setError("")
    setGenerationProgress(0)

    try {
      setGenerationStatus(`Generating ${type} image...`)
      setGenerationProgress(20)

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
          customPrompt,
          type: type,
          generateAll: false,
        }),
      })

      setGenerationProgress(70)

      const data = await response.json()

      if (data.success && !data.batchGeneration) {
        setGenerationProgress(100)
        setGenerationStatus(`${type} image generated successfully!`)

        // Update the specific image in the batch results
        const newImage: GeneratedImage = {
          imageUrl: data.imageUrl,
          prompt: data.prompt,
          aspectRatio: data.aspectRatio,
          format: data.format,
          resolution: data.resolution,
        }

        setGeneratedImages((prev) => ({
          standard: type === "standard" ? newImage : prev?.standard || ({} as GeneratedImage),
          dome: type === "dome" ? newImage : prev?.dome || ({} as GeneratedImage),
          panorama: type === "360" ? newImage : prev?.panorama || ({} as GeneratedImage),
        }))

        // Switch to the generated tab
        if (type === "360") {
          setActiveTab("panorama")
        } else {
          setActiveTab(type)
        }
      } else {
        throw new Error(data.error || `Failed to generate ${type} image`)
      }
    } catch (err: any) {
      console.error(`${type} generation error:`, err)
      setError(err.message || `Failed to generate ${type} art`)
      setGenerationStatus("")
    } finally {
      setIsGenerating(false)
      setTimeout(() => {
        setGenerationProgress(0)
        setGenerationStatus("")
      }, 3000)
    }
  }

  // Download function
  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch("/api/download-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (err) {
      console.error("Download failed:", err)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          FlowSketch Art Generator
        </h1>
        <p className="text-muted-foreground">
          Professional AI-powered art generation with Standard, Dome, and 360° formats
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Generation Settings
              </CardTitle>
              <CardDescription>Configure your art generation parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dataset Selection */}
              <div className="space-y-2">
                <Label>Cultural Dataset</Label>
                <Select value={dataset} onValueChange={handleDatasetChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(datasets).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.name}
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
                    {datasets[dataset as keyof typeof datasets]?.scenarios.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
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
                    {colorSchemes.map((scheme) => (
                      <SelectItem key={scheme} value={scheme}>
                        {scheme.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Advanced Settings */}
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Seed: {seed}</Label>
                  <Slider value={[seed]} onValueChange={(v) => setSeed(v[0])} min={1} max={10000} step={1} />
                </div>

                <div className="space-y-2">
                  <Label>Samples: {numSamples}</Label>
                  <Slider
                    value={[numSamples]}
                    onValueChange={(v) => setNumSamples(v[0])}
                    min={1000}
                    max={8000}
                    step={500}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Noise Scale: {noiseScale}</Label>
                  <Slider
                    value={[noiseScale]}
                    onValueChange={(v) => setNoiseScale(v[0])}
                    min={0.01}
                    max={0.2}
                    step={0.01}
                  />
                </div>
              </div>

              {/* Custom Prompt */}
              <div className="space-y-2">
                <Label>Custom Prompt (Optional)</Label>
                <Textarea
                  placeholder="Add custom elements to your prompt..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              {/* Main Generation Button */}
              <Button onClick={generateArt} disabled={isGenerating} className="w-full" size="lg">
                <Sparkles className="mr-2 h-4 w-4" />
                {isGenerating ? "Generating..." : "Generate All 3 Types"}
              </Button>

              {/* Individual Generation Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateSingle("standard")}
                  disabled={isGenerating}
                  className="text-xs"
                >
                  Standard
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateSingle("dome")}
                  disabled={isGenerating}
                  className="text-xs"
                >
                  Dome
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateSingle("360")}
                  disabled={isGenerating}
                  className="text-xs"
                >
                  360°
                </Button>
              </div>

              {/* Preview Button */}
              <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full bg-transparent" onClick={previewPromptHandler}>
                    <Eye className="mr-2 h-4 w-4" />
                    Preview Prompt
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Generated Prompt Preview</DialogTitle>
                    <DialogDescription>Review the AI prompt that will be used for generation</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea value={previewPrompt} readOnly rows={10} className="font-mono text-sm" />
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary">{previewPrompt.length} characters</Badge>
                      <Button
                        onClick={() => {
                          setCustomPrompt(previewPrompt)
                          setIsPreviewOpen(false)
                        }}
                      >
                        Use as Custom Prompt
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Generated Artwork
              </CardTitle>
              <CardDescription>Your AI-generated art in multiple formats</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Progress Bar */}
              {isGenerating && (
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{generationStatus}</span>
                    <span className="text-sm text-muted-foreground">{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} className="w-full" />
                </div>
              )}

              {/* Error Display */}
              {error && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Results Tabs */}
              {generatedImages ? (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="standard" className="flex items-center gap-2">
                      Standard
                      {generatedImages.standard?.imageUrl && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                    </TabsTrigger>
                    <TabsTrigger value="dome" className="flex items-center gap-2">
                      Dome
                      {generatedImages.dome?.imageUrl && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                    </TabsTrigger>
                    <TabsTrigger value="panorama" className="flex items-center gap-2">
                      360°
                      {generatedImages.panorama?.imageUrl && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="standard" className="space-y-4">
                    {generatedImages.standard?.imageUrl ? (
                      <div className="space-y-4">
                        <AspectRatio ratio={1}>
                          <img
                            src={generatedImages.standard.imageUrl || "/placeholder.svg"}
                            alt="Standard artwork"
                            className="rounded-lg object-cover w-full h-full"
                          />
                        </AspectRatio>
                        <div className="flex justify-between items-center">
                          <div className="space-y-1">
                            <Badge variant="secondary">1024×1024</Badge>
                            <Badge variant="outline">Standard Format</Badge>
                          </div>
                          <Button
                            onClick={() =>
                              downloadImage(generatedImages.standard.imageUrl, `flowsketch-standard-${Date.now()}.png`)
                            }
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Palette className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p>Standard artwork will appear here</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="dome" className="space-y-4">
                    {generatedImages.dome?.imageUrl ? (
                      <div className="space-y-4">
                        <AspectRatio ratio={1}>
                          <img
                            src={generatedImages.dome.imageUrl || "/placeholder.svg"}
                            alt="Dome projection artwork"
                            className="rounded-lg object-cover w-full h-full"
                          />
                        </AspectRatio>
                        <div className="flex justify-between items-center">
                          <div className="space-y-1">
                            <Badge variant="secondary">1024×1024</Badge>
                            <Badge variant="outline">Dome Projection</Badge>
                            <Badge variant="outline">Fisheye</Badge>
                          </div>
                          <Button
                            onClick={() =>
                              downloadImage(generatedImages.dome.imageUrl, `flowsketch-dome-${Date.now()}.png`)
                            }
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Palette className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p>Dome projection artwork will appear here</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="panorama" className="space-y-4">
                    {generatedImages.panorama?.imageUrl ? (
                      <div className="space-y-4">
                        <AspectRatio ratio={1.75}>
                          <img
                            src={generatedImages.panorama.imageUrl || "/placeholder.svg"}
                            alt="360° panoramic artwork"
                            className="rounded-lg object-cover w-full h-full"
                          />
                        </AspectRatio>
                        <div className="flex justify-between items-center">
                          <div className="space-y-1">
                            <Badge variant="secondary">1792×1024</Badge>
                            <Badge variant="outline">360° Panorama</Badge>
                            <Badge variant="outline">VR Ready</Badge>
                          </div>
                          <Button
                            onClick={() =>
                              downloadImage(generatedImages.panorama.imageUrl, `flowsketch-360-${Date.now()}.png`)
                            }
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Palette className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p>360° panoramic artwork will appear here</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Sparkles className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Click "Generate All 3 Types" to create your artwork</p>
                  <p className="text-sm mt-2">Standard, Dome, and 360° versions will be generated simultaneously</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
