"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
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
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Download,
  Palette,
  Settings,
  Sparkles,
  Eye,
  RotateCcw,
  Wand2,
  Globe,
  Edit3,
  RefreshCw,
  Maximize2,
  ImageIcon,
  Zap,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { CULTURAL_DATASETS, COLOR_SCHEMES, buildPrompt, getScenarios } from "@/lib/ai-prompt"

interface GeneratedImage {
  id: string
  url: string
  prompt: string
  timestamp: number
  type: "regular" | "dome" | "360"
  parameters: {
    dataset: string
    scenario?: string
    colorScheme: string
    seed: number
    numSamples: number
    noiseScale: number
  }
}

export default function FlowArtGenerator() {
  // Core state
  const [dataset, setDataset] = useState("vietnamese")
  const [scenario, setScenario] = useState("")
  const [colorScheme, setColorScheme] = useState("cosmic")
  const [seed, setSeed] = useState(1234)
  const [numSamples, setNumSamples] = useState(4000)
  const [noiseScale, setNoiseScale] = useState(0.08)
  const [customPrompt, setCustomPrompt] = useState("")
  const [isCustomPrompt, setIsCustomPrompt] = useState(false)

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [activeTab, setActiveTab] = useState("regular")
  const [error, setError] = useState<string | null>(null)

  // UI state
  const [promptDialogOpen, setPromptDialogOpen] = useState(false)
  const [previewPrompt, setPreviewPrompt] = useState("")
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null)

  // Get available scenarios for current dataset
  const availableScenarios = getScenarios(dataset)

  // Handle dataset change
  const handleDatasetChange = useCallback((newDataset: string) => {
    setDataset(newDataset)
    setScenario("") // Reset scenario when dataset changes
    setError(null)
  }, [])

  // Handle scenario change
  const handleScenarioChange = useCallback((newScenario: string) => {
    setScenario(newScenario)
    setError(null)
  }, [])

  // Generate random seed
  const generateRandomSeed = useCallback(() => {
    const newSeed = Math.floor(Math.random() * 10000)
    setSeed(newSeed)
  }, [])

  // Preview prompt
  const previewPromptHandler = useCallback(async () => {
    setIsLoadingPreview(true)
    try {
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
          customPrompt: isCustomPrompt ? customPrompt : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to preview prompt")
      }

      const data = await response.json()
      setPreviewPrompt(data.prompt)
      setPromptDialogOpen(true)
    } catch (error) {
      console.error("Preview error:", error)
      toast({
        title: "Preview Error",
        description: "Failed to preview prompt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingPreview(false)
    }
  }, [dataset, scenario, colorScheme, seed, numSamples, noiseScale, customPrompt, isCustomPrompt])

  // Use custom prompt
  const useCustomPrompt = useCallback(() => {
    setCustomPrompt(previewPrompt)
    setIsCustomPrompt(true)
    setPromptDialogOpen(false)
    toast({
      title: "Custom Prompt Set",
      description: "Using the edited prompt for generation.",
    })
  }, [previewPrompt])

  // Reset to auto prompt
  const resetToAutoPrompt = useCallback(() => {
    setCustomPrompt("")
    setIsCustomPrompt(false)
    toast({
      title: "Reset to Auto",
      description: "Using automatic prompt generation.",
    })
  }, [])

  // Generate art
  const generateArt = useCallback(
    async (type: "regular" | "dome" | "360" = "regular") => {
      if (isGenerating) return

      setIsGenerating(true)
      setGenerationProgress(0)
      setError(null)

      // Create abort controller
      abortControllerRef.current = new AbortController()

      try {
        // Progress simulation
        const progressInterval = setInterval(() => {
          setGenerationProgress((prev) => Math.min(prev + Math.random() * 15, 90))
        }, 500)

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
            customPrompt: isCustomPrompt ? customPrompt : undefined,
            type,
            panoramic360: type === "360",
            panoramaFormat: type === "360" ? "equirectangular" : undefined,
          }),
          signal: abortControllerRef.current.signal,
        })

        clearInterval(progressInterval)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
          throw new Error(errorData.error || `HTTP ${response.status}`)
        }

        const data = await response.json()

        if (!data.success || !data.imageUrl) {
          throw new Error(data.error || "No image generated")
        }

        // Create new image record
        const newImage: GeneratedImage = {
          id: `${Date.now()}-${type}`,
          url: data.imageUrl,
          prompt:
            data.prompt ||
            buildPrompt({
              dataset,
              scenario,
              colorScheme,
              seed,
              numSamples,
              noiseScale,
              customPrompt: isCustomPrompt ? customPrompt : undefined,
              panoramic360: type === "360",
              panoramaFormat: type === "360" ? "equirectangular" : undefined,
            }),
          timestamp: Date.now(),
          type,
          parameters: {
            dataset,
            scenario,
            colorScheme,
            seed,
            numSamples,
            noiseScale,
          },
        }

        setGeneratedImages((prev) => [newImage, ...prev])
        setGenerationProgress(100)

        // Switch to the appropriate tab
        setActiveTab(type)

        toast({
          title: "Generation Complete!",
          description: `${type === "360" ? "360° panorama" : type === "dome" ? "Dome projection" : "Regular"} image generated successfully.`,
        })
      } catch (error: any) {
        console.error("Generation error:", error)

        if (error.name === "AbortError") {
          toast({
            title: "Generation Cancelled",
            description: "Image generation was cancelled.",
          })
        } else {
          const errorMessage = error.message || "Unknown error occurred"
          setError(errorMessage)
          toast({
            title: "Generation Error",
            description: errorMessage,
            variant: "destructive",
          })
        }
      } finally {
        setIsGenerating(false)
        setGenerationProgress(0)
        abortControllerRef.current = null
      }
    },
    [dataset, scenario, colorScheme, seed, numSamples, noiseScale, customPrompt, isCustomPrompt, isGenerating],
  )

  // Cancel generation
  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  // Download image
  const downloadImage = useCallback(async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(`/api/download-proxy?url=${encodeURIComponent(imageUrl)}`)
      if (!response.ok) throw new Error("Download failed")

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
        description: `Image saved as ${filename}`,
      })
    } catch (error) {
      console.error("Download error:", error)
      toast({
        title: "Download Error",
        description: "Failed to download image. Please try again.",
        variant: "destructive",
      })
    }
  }, [])

  // Get images by type
  const getImagesByType = useCallback(
    (type: "regular" | "dome" | "360") => {
      return generatedImages.filter((img) => img.type === type)
    },
    [generatedImages],
  )

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          FlowSketch Professional Art Generator
        </h1>
        <p className="text-muted-foreground text-lg">
          Generate stunning mathematical art with cultural heritage and advanced AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Cultural Dataset
              </CardTitle>
              <CardDescription>Choose your cultural inspiration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="dataset">Dataset</Label>
                <Select value={dataset} onValueChange={handleDatasetChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select dataset" />
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

              {Object.keys(availableScenarios).length > 0 && (
                <div>
                  <Label htmlFor="scenario">Scenario</Label>
                  <Select value={scenario} onValueChange={handleScenarioChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select scenario" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(availableScenarios).map(([key, scenarioData]) => (
                        <SelectItem key={key} value={key}>
                          {scenarioData.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="colorScheme">Color Scheme</Label>
                <Select value={colorScheme} onValueChange={setColorScheme}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select color scheme" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(COLOR_SCHEMES).map(([key, description]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex flex-col">
                          <span className="font-medium capitalize">{key}</span>
                          <span className="text-xs text-muted-foreground">{description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Advanced Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="seed">Seed</Label>
                  <Button variant="outline" size="sm" onClick={generateRandomSeed} className="h-6 px-2 bg-transparent">
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                </div>
                <Input
                  id="seed"
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(Number.parseInt(e.target.value) || 0)}
                  min={0}
                  max={9999}
                />
              </div>

              <div>
                <Label htmlFor="numSamples">Data Points: {numSamples.toLocaleString()}</Label>
                <Slider
                  id="numSamples"
                  min={1000}
                  max={10000}
                  step={500}
                  value={[numSamples]}
                  onValueChange={(value) => setNumSamples(value[0])}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="noiseScale">Noise Scale: {noiseScale.toFixed(3)}</Label>
                <Slider
                  id="noiseScale"
                  min={0.01}
                  max={0.2}
                  step={0.005}
                  value={[noiseScale]}
                  onValueChange={(value) => setNoiseScale(value[0])}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Prompt Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Prompt Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Dialog open={promptDialogOpen} onOpenChange={setPromptDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={previewPromptHandler}
                      disabled={isLoadingPreview}
                      className="flex-1 bg-transparent"
                    >
                      {isLoadingPreview ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Eye className="h-4 w-4 mr-2" />
                      )}
                      Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Prompt Preview & Editor</DialogTitle>
                      <DialogDescription>Preview and edit the AI prompt before generation</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea
                        value={previewPrompt}
                        onChange={(e) => setPreviewPrompt(e.target.value)}
                        rows={10}
                        className="font-mono text-sm"
                      />
                      <div className="flex gap-2">
                        <Button onClick={useCustomPrompt} className="flex-1">
                          <Wand2 className="h-4 w-4 mr-2" />
                          Use Custom Prompt
                        </Button>
                        <Button variant="outline" onClick={() => setPromptDialogOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {isCustomPrompt && (
                  <Button variant="outline" onClick={resetToAutoPrompt} size="sm">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {isCustomPrompt && (
                <Badge variant="secondary" className="w-full justify-center">
                  Using Custom Prompt
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Generation Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Generate Art
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Generating...</span>
                    <span>{Math.round(generationProgress)}%</span>
                  </div>
                  <Progress value={generationProgress} />
                  <Button variant="outline" onClick={cancelGeneration} className="w-full bg-transparent">
                    Cancel Generation
                  </Button>
                </div>
              )}

              {!isGenerating && (
                <div className="grid grid-cols-1 gap-2">
                  <Button onClick={() => generateArt("regular")} className="w-full">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Generate Regular
                  </Button>
                  <Button onClick={() => generateArt("dome")} variant="outline" className="w-full">
                    <Maximize2 className="h-4 w-4 mr-2" />
                    Generate Dome
                  </Button>
                  <Button onClick={() => generateArt("360")} variant="outline" className="w-full">
                    <Globe className="h-4 w-4 mr-2" />
                    Generate 360°
                  </Button>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Generated Art
              </CardTitle>
              <CardDescription>Your AI-generated mathematical art will appear here</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="regular" className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Regular ({getImagesByType("regular").length})
                  </TabsTrigger>
                  <TabsTrigger value="dome" className="flex items-center gap-2">
                    <Maximize2 className="h-4 w-4" />
                    Dome ({getImagesByType("dome").length})
                  </TabsTrigger>
                  <TabsTrigger value="360" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    360° ({getImagesByType("360").length})
                  </TabsTrigger>
                </TabsList>

                {(["regular", "dome", "360"] as const).map((type) => (
                  <TabsContent key={type} value={type} className="mt-4">
                    <div className="space-y-4">
                      {getImagesByType(type).length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <div className="mb-4">
                            {type === "regular" && <ImageIcon className="h-12 w-12 mx-auto opacity-50" />}
                            {type === "dome" && <Maximize2 className="h-12 w-12 mx-auto opacity-50" />}
                            {type === "360" && <Globe className="h-12 w-12 mx-auto opacity-50" />}
                          </div>
                          <p>No {type} images generated yet</p>
                          <p className="text-sm">
                            Click "Generate {type === "360" ? "360°" : type}" to create your first image
                          </p>
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {getImagesByType(type).map((image) => (
                            <div key={image.id} className="space-y-3">
                              <div className="relative">
                                <AspectRatio ratio={type === "360" ? 2 : 1}>
                                  <img
                                    src={image.url || "/placeholder.svg"}
                                    alt={`Generated ${type} art`}
                                    className={`w-full h-full rounded-lg ${
                                      type === "360" ? "object-contain" : "object-cover"
                                    }`}
                                    style={type === "360" ? { objectPosition: "center" } : {}}
                                  />
                                </AspectRatio>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="absolute top-2 right-2"
                                  onClick={() => downloadImage(image.url, `flowsketch-${type}-${image.timestamp}.png`)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="space-y-2">
                                <div className="flex flex-wrap gap-1">
                                  <Badge variant="outline">{image.parameters.dataset}</Badge>
                                  {image.parameters.scenario && (
                                    <Badge variant="outline">{image.parameters.scenario}</Badge>
                                  )}
                                  <Badge variant="outline">{image.parameters.colorScheme}</Badge>
                                  <Badge variant="outline">Seed: {image.parameters.seed}</Badge>
                                </div>

                                <details className="text-sm">
                                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                    View Prompt
                                  </summary>
                                  <p className="mt-2 p-3 bg-muted rounded text-xs font-mono">{image.prompt}</p>
                                </details>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
