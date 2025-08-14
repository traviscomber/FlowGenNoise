"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/hooks/use-toast"
import {
  Download,
  Palette,
  Settings,
  Sparkles,
  Eye,
  RefreshCw,
  Play,
  Square,
  Globe,
  CircleDot,
  Loader2,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Orbit,
  AlertCircle,
  Edit3,
} from "lucide-react"
import { CULTURAL_DATASETS, COLOR_SCHEMES, getScenarios } from "@/lib/ai-prompt"

interface GeneratedImage {
  imageUrl: string
  prompt: string
  aspectRatio: string
  format: string
  resolution?: string
  vrOptimized?: boolean
  seamlessWrapping?: boolean
  planetariumOptimized?: boolean
  projectionType?: string
  panoramaFormat?: string
}

interface BatchGenerationResult {
  success: boolean
  batchGeneration: boolean
  images: {
    standard: GeneratedImage
    dome: GeneratedImage
    panorama: GeneratedImage
  }
  provider: string
  model: string
  quality: string
  parameters: any
  timestamp: string
}

export default function FlowArtGenerator() {
  // State management
  const [dataset, setDataset] = useState("vietnamese")
  const [scenario, setScenario] = useState("trung-sisters")
  const [colorScheme, setColorScheme] = useState("metallic")
  const [seed, setSeed] = useState(1234)
  const [numSamples, setNumSamples] = useState(4000)
  const [noiseScale, setNoiseScale] = useState(0.08)
  const [customPrompt, setCustomPrompt] = useState("")

  // Projection settings
  const [projectionType, setProjectionType] = useState("fisheye")
  const [panoramaFormat, setPanoramaFormat] = useState("equirectangular")

  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationStatus, setGenerationStatus] = useState("")
  const [activeTab, setActiveTab] = useState("standard")

  // Generated images state
  const [standardImage, setStandardImage] = useState<GeneratedImage | null>(null)
  const [domeImage, setDomeImage] = useState<GeneratedImage | null>(null)
  const [panoramaImage, setPanoramaImage] = useState<GeneratedImage | null>(null)

  // Prompt enhancement state
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false)
  const [enhancedPrompt, setEnhancedPrompt] = useState("")
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [promptStats, setPromptStats] = useState<any>(null)
  const [editablePrompt, setEditablePrompt] = useState("")
  const [variationType, setVariationType] = useState<"slight" | "moderate" | "dramatic">("moderate")
  const [error, setError] = useState<string | null>(null)

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null)

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
    setError(null)
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

    setError(null)
    toast({
      title: "Parameters Randomized",
      description: "New random values generated for all parameters",
    })
  }, [])

  // Preview and enhance prompt
  const previewPrompt = useCallback(
    async (generationType: "standard" | "dome" | "360" = "standard") => {
      setIsEnhancing(true)
      setError(null)

      try {
        const response = await fetch("/api/enhance-prompt", {
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
            panoramic360: generationType === "360",
            panoramaFormat,
            projectionType,
            variationType,
            generationType,
          }),
        })

        if (!response.ok) {
          throw new Error(`Failed to enhance prompt: ${response.statusText}`)
        }

        const data = await response.json()

        if (data.success) {
          setEnhancedPrompt(data.enhancedPrompt)
          setEditablePrompt(data.enhancedPrompt)
          setPromptStats(data.statistics)
          setIsPromptDialogOpen(true)
        } else {
          throw new Error(data.error || "Failed to enhance prompt")
        }
      } catch (error: any) {
        console.error("Prompt enhancement error:", error)
        setError(error.message || "Failed to enhance prompt")
        toast({
          title: "Enhancement Failed",
          description: error.message || "Failed to enhance prompt",
          variant: "destructive",
        })
      } finally {
        setIsEnhancing(false)
      }
    },
    [
      dataset,
      scenario,
      colorScheme,
      seed,
      numSamples,
      noiseScale,
      customPrompt,
      panoramaFormat,
      projectionType,
      variationType,
    ],
  )

  // Main generation function - generates all 3 types
  const generateAllTypes = useCallback(async () => {
    if (isGenerating) return

    setIsGenerating(true)
    setGenerationProgress(0)
    setGenerationStatus("Preparing generation...")
    setError(null)

    // Clear previous images
    setStandardImage(null)
    setDomeImage(null)
    setPanoramaImage(null)

    // Create abort controller
    abortControllerRef.current = new AbortController()

    try {
      setGenerationStatus("Generating all 3 image types...")
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
          customPrompt: editablePrompt || customPrompt,
          projectionType,
          panoramaFormat,
          generateAll: true, // This triggers batch generation
        }),
        signal: abortControllerRef.current.signal,
      })

      setGenerationProgress(60)
      setGenerationStatus("Processing results...")

      const data: BatchGenerationResult = await response.json()

      if (data.success && data.batchGeneration) {
        setGenerationProgress(90)
        setGenerationStatus("Finalizing images...")

        // Set all three images
        setStandardImage(data.images.standard)
        setDomeImage(data.images.dome)
        setPanoramaImage(data.images.panorama)

        setGenerationProgress(100)
        setGenerationStatus("All images generated successfully!")

        toast({
          title: "Generation Complete!",
          description: "All 3 image types generated successfully",
        })

        // Auto-switch to first generated image
        setActiveTab("standard")
      } else {
        throw new Error(data.error || "Failed to generate images")
      }
    } catch (error: any) {
      console.error("Generation error:", error)

      if (error.name === "AbortError") {
        setGenerationStatus("Generation cancelled")
        toast({
          title: "Generation Cancelled",
          description: "Image generation was cancelled",
        })
      } else {
        setGenerationStatus("Generation failed")
        setError(error.message || "Failed to generate images")
        toast({
          title: "Generation Failed",
          description: error.message || "Failed to generate images",
          variant: "destructive",
        })
      }
    } finally {
      setIsGenerating(false)
      setGenerationProgress(0)
      abortControllerRef.current = null
    }
  }, [
    dataset,
    scenario,
    colorScheme,
    seed,
    numSamples,
    noiseScale,
    customPrompt,
    editablePrompt,
    projectionType,
    panoramaFormat,
    isGenerating,
  ])

  // Generate single image type
  const generateSingleType = useCallback(
    async (type: "standard" | "dome" | "360") => {
      if (isGenerating) return

      setIsGenerating(true)
      setGenerationProgress(0)
      setGenerationStatus(`Generating ${type} image...`)
      setError(null)

      // Create abort controller
      abortControllerRef.current = new AbortController()

      try {
        setGenerationProgress(30)

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
            customPrompt: editablePrompt || customPrompt,
            projectionType,
            panoramaFormat,
            type: type,
            generateAll: false,
          }),
          signal: abortControllerRef.current.signal,
        })

        setGenerationProgress(70)
        setGenerationStatus("Processing image...")

        const data = await response.json()

        if (data.success) {
          setGenerationProgress(100)
          setGenerationStatus(`${type} image generated successfully!`)

          const imageData: GeneratedImage = {
            imageUrl: data.imageUrl,
            prompt: data.prompt,
            aspectRatio: data.aspectRatio || "1:1",
            format: data.format || "Standard",
            resolution: data.resolution,
            vrOptimized: data.vrOptimized,
            seamlessWrapping: data.seamlessWrapping,
            planetariumOptimized: data.planetariumOptimized,
            projectionType: data.projectionType,
            panoramaFormat: data.panoramaFormat,
          }

          // Set the appropriate image
          if (type === "standard") {
            setStandardImage(imageData)
            setActiveTab("standard")
          } else if (type === "dome") {
            setDomeImage(imageData)
            setActiveTab("dome")
          } else if (type === "360") {
            setPanoramaImage(imageData)
            setActiveTab("panorama")
          }

          toast({
            title: "Generation Complete!",
            description: `${type} image generated successfully`,
          })
        } else {
          throw new Error(data.error || "Failed to generate image")
        }
      } catch (error: any) {
        console.error("Generation error:", error)

        if (error.name === "AbortError") {
          setGenerationStatus("Generation cancelled")
          toast({
            title: "Generation Cancelled",
            description: "Image generation was cancelled",
          })
        } else {
          setGenerationStatus("Generation failed")
          setError(error.message || "Failed to generate image")
          toast({
            title: "Generation Failed",
            description: error.message || "Failed to generate image",
            variant: "destructive",
          })
        }
      } finally {
        setIsGenerating(false)
        setGenerationProgress(0)
        abortControllerRef.current = null
      }
    },
    [
      dataset,
      scenario,
      colorScheme,
      seed,
      numSamples,
      noiseScale,
      customPrompt,
      editablePrompt,
      projectionType,
      panoramaFormat,
      isGenerating,
    ],
  )

  // Cancel generation
  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsGenerating(false)
      setGenerationProgress(0)
      setGenerationStatus("Cancelling...")
    }
  }, [])

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
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          FlowSketch Art Generator
        </h1>
        <p className="text-muted-foreground">
          Professional AI-powered art generation with ChatGPT-enhanced prompts and multiple output formats
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="secondary">
            <Sparkles className="w-3 h-3 mr-1" />
            ChatGPT Enhanced
          </Badge>
          <Badge variant="secondary">Standard • Dome • 360°</Badge>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
                    {Object.entries(COLOR_SCHEMES).map(([key, description]) => (
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

              {/* Projection Settings */}
              <div className="space-y-4 border-t pt-4">
                <Label className="text-sm font-semibold">Projection Settings</Label>

                {/* Dome Projection Type */}
                <div className="space-y-2">
                  <Label className="text-sm">Dome Projection</Label>
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

                {/* 360° Panorama Format */}
                <div className="space-y-2">
                  <Label className="text-sm">360° Format</Label>
                  <Select value={panoramaFormat} onValueChange={setPanoramaFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equirectangular">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Equirectangular
                          <Badge variant="outline" className="ml-2 text-xs">
                            Seamless
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

              {/* Custom Prompt */}
              <div className="space-y-2">
                <Label>Custom Prompt (Optional)</Label>
                <Textarea
                  placeholder="Enter custom prompt to override automatic generation..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Prompt Enhancement Section */}
              <Separator />
              <div className="space-y-4">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  ChatGPT Prompt Enhancement
                </Label>

                <div className="space-y-2">
                  <Label className="text-sm">Enhancement Level</Label>
                  <Select
                    value={variationType}
                    onValueChange={(value: "slight" | "moderate" | "dramatic") => setVariationType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slight">🔹 Slight Enhancement</SelectItem>
                      <SelectItem value="moderate">🔸 Moderate Enhancement</SelectItem>
                      <SelectItem value="dramatic">🔶 Dramatic Enhancement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Dialog open={isPromptDialogOpen} onOpenChange={setIsPromptDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => previewPrompt(activeTab as "standard" | "dome" | "360")}
                      variant="outline"
                      className="w-full"
                      disabled={isEnhancing}
                    >
                      {isEnhancing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Enhancing with ChatGPT...
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview & Enhance Prompt
                        </>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        ChatGPT Enhanced Prompt
                      </DialogTitle>
                      <DialogDescription>
                        Review and edit the ChatGPT-enhanced prompt before generation. The prompt has been optimized for
                        artistic quality and cultural authenticity.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {promptStats && (
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <strong>Original:</strong> {promptStats.original.characters} chars,{" "}
                            {promptStats.original.words} words
                          </div>
                          <div>
                            <strong>Enhanced:</strong> {promptStats.enhanced.characters} chars,{" "}
                            {promptStats.enhanced.words} words
                          </div>
                          <div>
                            <strong>Enhancement:</strong> {variationType} level
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <Edit3 className="h-4 w-4" />
                          Enhanced Prompt (Editable)
                        </Label>
                        <Textarea
                          value={editablePrompt}
                          onChange={(e) => setEditablePrompt(e.target.value)}
                          rows={12}
                          className="font-mono text-sm"
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          {editablePrompt.length} / 4000 characters
                          {editablePrompt.length > 4000 && <span className="text-red-500 ml-2">⚠️ Too long</span>}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setEditablePrompt(enhancedPrompt)}>
                            Reset to Enhanced
                          </Button>
                          <Button onClick={() => setIsPromptDialogOpen(false)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Use This Prompt
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button onClick={generateAllTypes} disabled={isGenerating} className="w-full" size="lg">
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate All 3 Types
                    </>
                  )}
                </Button>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => generateSingleType("standard")}
                    disabled={isGenerating}
                    variant="outline"
                    size="sm"
                  >
                    <Square className="h-4 w-4 mr-1" />
                    Standard
                  </Button>
                  <Button
                    onClick={() => generateSingleType("dome")}
                    disabled={isGenerating}
                    variant="outline"
                    size="sm"
                  >
                    <CircleDot className="h-4 w-4 mr-1" />
                    Dome
                  </Button>
                  <Button onClick={() => generateSingleType("360")} disabled={isGenerating} variant="outline" size="sm">
                    <Globe className="h-4 w-4 mr-1" />
                    360°
                  </Button>
                </div>

                <Button onClick={randomizeParameters} variant="outline" className="w-full bg-transparent">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Randomize Parameters
                </Button>

                {isGenerating && (
                  <Button onClick={cancelGeneration} variant="destructive" size="sm" className="w-full">
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Generation
                  </Button>
                )}
              </div>

              {/* Progress */}
              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <span className="text-sm font-medium">{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} />
                  <p className="text-sm text-muted-foreground">{generationStatus}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Generated Artwork
              </CardTitle>
              <CardDescription>
                View your generated Standard, Dome, and 360° Panorama images with ChatGPT-enhanced prompts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="standard" className="flex items-center gap-2">
                    <Square className="h-4 w-4" />
                    Standard
                    {standardImage && <CheckCircle className="h-3 w-3 text-green-500" />}
                  </TabsTrigger>
                  <TabsTrigger value="dome" className="flex items-center gap-2">
                    <CircleDot className="h-4 w-4" />
                    Dome
                    {domeImage && <CheckCircle className="h-3 w-3 text-green-500" />}
                  </TabsTrigger>
                  <TabsTrigger value="panorama" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    360° Panorama
                    {panoramaImage && <CheckCircle className="h-3 w-3 text-green-500" />}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="standard" className="space-y-4">
                  {standardImage ? (
                    <div className="space-y-4">
                      <AspectRatio ratio={1}>
                        <img
                          src={standardImage.imageUrl || "/placeholder.svg"}
                          alt="Generated Standard Artwork"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </AspectRatio>
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <div className="flex gap-2">
                            <Badge variant="secondary">{standardImage.format}</Badge>
                            <Badge variant="outline">Professional Quality</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{standardImage.resolution || "1024×1024"}</p>
                        </div>
                        <Button
                          onClick={() => downloadImage(standardImage.imageUrl, "flowsketch-standard.jpg")}
                          size="sm"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <Square className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">No standard image generated yet</p>
                        <p className="text-sm text-muted-foreground">Perfect for general use and display</p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="dome" className="space-y-4">
                  {domeImage ? (
                    <div className="space-y-4">
                      <AspectRatio ratio={1}>
                        <img
                          src={domeImage.imageUrl || "/placeholder.svg"}
                          alt="Generated Dome Projection"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </AspectRatio>
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <div className="flex gap-2">
                            <Badge variant="secondary">{domeImage.format}</Badge>
                            {domeImage.planetariumOptimized && <Badge variant="outline">Planetarium Ready</Badge>}
                            <Badge variant="outline">{domeImage.projectionType || projectionType}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">1024×1024 • Dome Projection</p>
                        </div>
                        <Button onClick={() => downloadImage(domeImage.imageUrl, "flowsketch-dome.jpg")} size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <CircleDot className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">No dome projection generated yet</p>
                        <p className="text-xs text-muted-foreground">Current: {projectionType}</p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="panorama" className="space-y-4">
                  {panoramaImage ? (
                    <div className="space-y-4">
                      <AspectRatio ratio={1.75}>
                        <img
                          src={panoramaImage.imageUrl || "/placeholder.svg"}
                          alt="Generated 360° Panorama"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </AspectRatio>
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <div className="flex gap-2">
                            <Badge variant="secondary">{panoramaImage.format}</Badge>
                            {panoramaImage.vrOptimized && <Badge variant="outline">VR Ready</Badge>}
                            {panoramaImage.seamlessWrapping && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Professional Seamless
                              </Badge>
                            )}
                            <Badge variant="outline">{panoramaImage.panoramaFormat || panoramaFormat}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">1792×1024 • 360° Panorama</p>
                          {panoramaImage.seamlessWrapping && (
                            <p className="text-xs text-green-600">✓ Professional seamless edge wrapping verified</p>
                          )}
                        </div>
                        <Button onClick={() => downloadImage(panoramaImage.imageUrl, "flowsketch-360.jpg")} size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-[1.75] bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <Globe className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">No 360° panorama generated yet</p>
                        <p className="text-xs text-muted-foreground">Current: {panoramaFormat}</p>
                        {panoramaFormat === "equirectangular" && (
                          <p className="text-xs text-green-600">Will generate with professional seamless wrapping</p>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
