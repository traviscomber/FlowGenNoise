"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"
import {
  Palette,
  Download,
  Eye,
  Shuffle,
  Settings,
  Sparkles,
  Globe,
  Mountain,
  ImageIcon,
  Loader2,
  Edit3,
  Square,
  Zap,
} from "lucide-react"
import { CULTURAL_DATASETS, COLOR_SCHEMES, getScenarios, getDatasetName } from "@/lib/ai-prompt"

interface GenerationParams {
  dataset: string
  scenario?: string
  colorScheme: string
  seed: number
  numSamples: number
  noiseScale: number
  customPrompt?: string
  domeProjection?: boolean
  domeDiameter?: number
  domeResolution?: string
  projectionType?: string
  panoramic360?: boolean
  panoramaResolution?: string
  panoramaFormat?: string
  stereographicPerspective?: string
}

export default function FlowArtGenerator() {
  // State management
  const [params, setParams] = useState<GenerationParams>({
    dataset: "vietnamese",
    scenario: "trung-sisters",
    colorScheme: "metallic",
    seed: 1234,
    numSamples: 4000,
    noiseScale: 0.08,
    customPrompt: "",
    domeProjection: false,
    domeDiameter: 15,
    domeResolution: "4K",
    projectionType: "fisheye",
    panoramic360: false,
    panoramaResolution: "8K",
    panoramaFormat: "equirectangular",
    stereographicPerspective: "little-planet",
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<{
    standard?: string
    dome?: string
    panorama?: string
  }>({})
  const [activeTab, setActiveTab] = useState("standard")
  const [showPromptEditor, setShowPromptEditor] = useState(false)
  const [previewPrompt, setPreviewPrompt] = useState("")
  const [isPreviewingPrompt, setIsPreviewingPrompt] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationStatus, setGenerationStatus] = useState("")

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null)

  // Get available scenarios for current dataset
  const availableScenarios = getScenarios(params.dataset)

  // Handle parameter changes
  const updateParam = useCallback((key: keyof GenerationParams, value: any) => {
    setParams((prev) => {
      const newParams = { ...prev, [key]: value }

      // Reset scenario if dataset changes and scenario doesn't exist
      if (key === "dataset") {
        const scenarios = getScenarios(value)
        if (!scenarios[prev.scenario || ""]) {
          newParams.scenario = Object.keys(scenarios)[0] || ""
        }
      }

      return newParams
    })
  }, [])

  // Randomize parameters
  const randomizeParams = useCallback(() => {
    const datasets = Object.keys(CULTURAL_DATASETS)
    const colorSchemes = Object.keys(COLOR_SCHEMES)
    const randomDataset = datasets[Math.floor(Math.random() * datasets.length)]
    const scenarios = getScenarios(randomDataset)
    const scenarioKeys = Object.keys(scenarios)
    const randomScenario = scenarioKeys[Math.floor(Math.random() * scenarioKeys.length)]

    setParams((prev) => ({
      ...prev,
      dataset: randomDataset,
      scenario: randomScenario,
      colorScheme: colorSchemes[Math.floor(Math.random() * colorSchemes.length)],
      seed: Math.floor(Math.random() * 10000),
      numSamples: 2000 + Math.floor(Math.random() * 6000),
      noiseScale: 0.05 + Math.random() * 0.1,
    }))

    toast({
      title: "Parameters Randomized",
      description: `New configuration: ${getDatasetName(randomDataset)} with ${COLOR_SCHEMES[colorSchemes[Math.floor(Math.random() * colorSchemes.length)] as keyof typeof COLOR_SCHEMES]}`,
    })
  }, [])

  // Preview prompt
  const previewPromptHandler = useCallback(async () => {
    setIsPreviewingPrompt(true)
    try {
      const response = await fetch("/api/preview-ai-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        throw new Error("Failed to preview prompt")
      }

      const data = await response.json()
      setPreviewPrompt(data.prompt)
      setShowPromptEditor(true)
    } catch (error: any) {
      toast({
        title: "Preview Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsPreviewingPrompt(false)
    }
  }, [params])

  // Generate all 3 types of art
  const generateAllArt = useCallback(async () => {
    if (isGenerating) {
      // Cancel current generation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
      setIsGenerating(false)
      setGenerationProgress(0)
      setGenerationStatus("")
      return
    }

    setIsGenerating(true)
    setGenerationProgress(0)
    setGenerationStatus("Initializing generation...")

    // Create abort controller
    abortControllerRef.current = new AbortController()

    try {
      // Clear previous images
      setGeneratedImages({})

      // Progress simulation with status updates
      const progressSteps = [
        { progress: 10, status: "Preparing prompts..." },
        { progress: 25, status: "Generating standard artwork..." },
        { progress: 50, status: "Creating dome projection..." },
        { progress: 75, status: "Rendering 360° panorama..." },
        { progress: 90, status: "Finalizing images..." },
      ]

      let currentStep = 0
      const progressInterval = setInterval(() => {
        if (currentStep < progressSteps.length) {
          setGenerationProgress(progressSteps[currentStep].progress)
          setGenerationStatus(progressSteps[currentStep].status)
          currentStep++
        }
      }, 2000)

      const requestBody = {
        ...params,
        generateAll: true, // Flag to generate all 3 types
      }

      console.log("🎨 Generating all 3 art types with params:", requestBody)

      const response = await fetch("/api/generate-ai-art", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal,
      })

      clearInterval(progressInterval)
      setGenerationProgress(100)
      setGenerationStatus("Complete!")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()

      if (!data.success || !data.images) {
        throw new Error(data.error || "No images generated")
      }

      // Update all generated images
      setGeneratedImages({
        standard: data.images.standard?.imageUrl,
        dome: data.images.dome?.imageUrl,
        panorama: data.images.panorama?.imageUrl,
      })

      // Switch to standard tab to show results
      setActiveTab("standard")

      toast({
        title: "All Artwork Generated Successfully! 🎉",
        description: "Standard, Dome, and 360° Panorama versions are ready",
      })
    } catch (error: any) {
      if (error.name === "AbortError") {
        toast({
          title: "Generation Cancelled",
          description: "Art generation was cancelled by user",
        })
      } else {
        console.error("Generation error:", error)
        toast({
          title: "Generation Failed",
          description: error.message || "Failed to generate artwork",
          variant: "destructive",
        })
      }
    } finally {
      setIsGenerating(false)
      setGenerationProgress(0)
      setGenerationStatus("")
      abortControllerRef.current = null
    }
  }, [params, isGenerating])

  // Generate single art type
  const generateSingleArt = useCallback(
    async (type: "standard" | "dome" | "360") => {
      if (isGenerating) return

      setIsGenerating(true)
      setGenerationProgress(0)
      setGenerationStatus(`Generating ${type} artwork...`)

      // Create abort controller
      abortControllerRef.current = new AbortController()

      try {
        // Progress simulation
        const progressInterval = setInterval(() => {
          setGenerationProgress((prev) => {
            if (prev >= 90) return prev
            return prev + Math.random() * 10
          })
        }, 1000)

        const requestBody = {
          ...params,
          type: type,
          generateAll: false,
        }

        console.log(`🎨 Generating ${type} art with params:`, requestBody)

        const response = await fetch("/api/generate-ai-art", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
          signal: abortControllerRef.current.signal,
        })

        clearInterval(progressInterval)
        setGenerationProgress(100)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `HTTP ${response.status}`)
        }

        const data = await response.json()

        if (!data.success || !data.imageUrl) {
          throw new Error(data.error || "No image generated")
        }

        // Update generated images
        setGeneratedImages((prev) => ({
          ...prev,
          [type]: data.imageUrl,
        }))

        // Switch to the generated tab
        if (type === "standard") setActiveTab("standard")
        else if (type === "dome") setActiveTab("dome")
        else if (type === "360") setActiveTab("panorama")

        toast({
          title: "Art Generated Successfully!",
          description: `${type === "360" ? "360° Panorama" : type === "dome" ? "Dome Projection" : "Standard"} artwork created`,
        })
      } catch (error: any) {
        if (error.name === "AbortError") {
          toast({
            title: "Generation Cancelled",
            description: "Art generation was cancelled by user",
          })
        } else {
          console.error("Generation error:", error)
          toast({
            title: "Generation Failed",
            description: error.message || "Failed to generate artwork",
            variant: "destructive",
          })
        }
      } finally {
        setIsGenerating(false)
        setGenerationProgress(0)
        setGenerationStatus("")
        abortControllerRef.current = null
      }
    },
    [params, isGenerating],
  )

  // Download image
  const downloadImage = useCallback(async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(`/api/download-proxy?url=${encodeURIComponent(imageUrl)}`)

      if (!response.ok) {
        throw new Error("Failed to download image")
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Download Complete",
        description: `${filename} has been downloaded`,
      })
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-purple-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              FlowSketch Art Generator
            </h1>
            <Sparkles className="h-8 w-8 text-purple-400" />
          </div>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Professional AI-powered art generation with cultural heritage datasets, 360° panoramas, and dome projections
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
              OpenAI DALL-E 3
            </Badge>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
              Professional Quality
            </Badge>
            <Badge variant="secondary" className="bg-green-500/20 text-green-300">
              Cultural Heritage
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Generation Parameters
                </CardTitle>
                <CardDescription className="text-slate-400">Configure your artwork generation settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dataset Selection */}
                <div className="space-y-2">
                  <Label className="text-slate-200">Cultural Dataset</Label>
                  <Select value={params.dataset} onValueChange={(value) => updateParam("dataset", value)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {Object.entries(CULTURAL_DATASETS).map(([key, dataset]) => (
                        <SelectItem key={key} value={key} className="text-slate-100">
                          {dataset.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Scenario Selection */}
                {Object.keys(availableScenarios).length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-slate-200">Scenario</Label>
                    <Select value={params.scenario} onValueChange={(value) => updateParam("scenario", value)}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600 max-h-72">
                        {Object.entries(availableScenarios).map(([key, scenario]) => (
                          <SelectItem key={key} value={key} className="text-slate-100">
                            {scenario.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Color Scheme */}
                <div className="space-y-2">
                  <Label className="text-slate-200">Color Scheme</Label>
                  <Select value={params.colorScheme} onValueChange={(value) => updateParam("colorScheme", value)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600 max-h-72">
                      {Object.entries(COLOR_SCHEMES).map(([key, description]) => (
                        <SelectItem key={key} value={key} className="text-slate-100">
                          <div className="flex items-center gap-2">
                            <Palette className="h-4 w-4" />
                            {key} - {description.substring(0, 30)}...
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Advanced Parameters */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-200">Seed: {params.seed}</Label>
                    <Slider
                      value={[params.seed]}
                      onValueChange={([value]) => updateParam("seed", value)}
                      max={9999}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-200">Samples: {params.numSamples}</Label>
                    <Slider
                      value={[params.numSamples]}
                      onValueChange={([value]) => updateParam("numSamples", value)}
                      max={8000}
                      min={1000}
                      step={100}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-200">Noise Scale: {params.noiseScale.toFixed(3)}</Label>
                    <Slider
                      value={[params.noiseScale]}
                      onValueChange={([value]) => updateParam("noiseScale", value)}
                      max={0.2}
                      min={0.01}
                      step={0.001}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {/* Main Generate All Button */}
                  <Button
                    onClick={generateAllArt}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Cancel Generation
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Generate All 3 Types
                      </>
                    )}
                  </Button>

                  {/* Individual Generation Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => generateSingleArt("standard")}
                      disabled={isGenerating}
                      variant="outline"
                      className="border-slate-600 text-slate-200 hover:bg-slate-700"
                      size="sm"
                    >
                      <Square className="h-3 w-3 mr-1" />
                      Standard
                    </Button>
                    <Button
                      onClick={() => generateSingleArt("dome")}
                      disabled={isGenerating}
                      variant="outline"
                      className="border-slate-600 text-slate-200 hover:bg-slate-700"
                      size="sm"
                    >
                      <Mountain className="h-3 w-3 mr-1" />
                      Dome
                    </Button>
                    <Button
                      onClick={() => generateSingleArt("360")}
                      disabled={isGenerating}
                      variant="outline"
                      className="border-slate-600 text-slate-200 hover:bg-slate-700"
                      size="sm"
                    >
                      <Globe className="h-3 w-3 mr-1" />
                      360°
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={randomizeParams}
                      variant="outline"
                      className="border-slate-600 text-slate-200 hover:bg-slate-700 bg-transparent"
                    >
                      <Shuffle className="h-4 w-4 mr-2" />
                      Randomize
                    </Button>
                    <Button
                      onClick={previewPromptHandler}
                      disabled={isPreviewingPrompt}
                      variant="outline"
                      className="border-slate-600 text-slate-200 hover:bg-slate-700 bg-transparent"
                    >
                      {isPreviewingPrompt ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Eye className="h-4 w-4 mr-2" />
                      )}
                      Preview
                    </Button>
                  </div>
                </div>

                {/* Progress Bar */}
                {isGenerating && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>{generationStatus}</span>
                      <span>{Math.round(generationProgress)}%</span>
                    </div>
                    <Progress value={generationProgress} className="w-full" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Generated Artwork
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Professional AI-generated artwork with cultural heritage themes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-slate-700">
                    <TabsTrigger value="standard" className="data-[state=active]:bg-slate-600">
                      <Square className="h-4 w-4 mr-2" />
                      Standard
                      {generatedImages.standard && <div className="ml-2 w-2 h-2 bg-green-400 rounded-full" />}
                    </TabsTrigger>
                    <TabsTrigger value="dome" className="data-[state=active]:bg-slate-600">
                      <Mountain className="h-4 w-4 mr-2" />
                      Dome
                      {generatedImages.dome && <div className="ml-2 w-2 h-2 bg-green-400 rounded-full" />}
                    </TabsTrigger>
                    <TabsTrigger value="panorama" className="data-[state=active]:bg-slate-600">
                      <Globe className="h-4 w-4 mr-2" />
                      360° Panorama
                      {generatedImages.panorama && <div className="ml-2 w-2 h-2 bg-green-400 rounded-full" />}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="standard" className="mt-4">
                    <div className="space-y-4">
                      <AspectRatio ratio={1} className="bg-slate-700 rounded-lg overflow-hidden">
                        {generatedImages.standard ? (
                          <img
                            src={generatedImages.standard || "/placeholder.svg"}
                            alt="Generated Standard Art"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <div className="text-center space-y-2">
                              <Square className="h-12 w-12 mx-auto opacity-50" />
                              <p>Standard artwork will appear here</p>
                              <p className="text-sm">1024×1024 resolution</p>
                            </div>
                          </div>
                        )}
                      </AspectRatio>
                      {generatedImages.standard && (
                        <Button
                          onClick={() => downloadImage(generatedImages.standard!, "flowsketch-standard.jpg")}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Standard Art
                        </Button>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="dome" className="mt-4">
                    <div className="space-y-4">
                      <AspectRatio ratio={1} className="bg-slate-700 rounded-lg overflow-hidden">
                        {generatedImages.dome ? (
                          <img
                            src={generatedImages.dome || "/placeholder.svg"}
                            alt="Generated Dome Art"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <div className="text-center space-y-2">
                              <Mountain className="h-12 w-12 mx-auto opacity-50" />
                              <p>Dome projection artwork will appear here</p>
                              <p className="text-sm">Optimized for planetarium display</p>
                            </div>
                          </div>
                        )}
                      </AspectRatio>
                      {generatedImages.dome && (
                        <Button
                          onClick={() => downloadImage(generatedImages.dome!, "flowsketch-dome.jpg")}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Dome Art
                        </Button>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="panorama" className="mt-4">
                    <div className="space-y-4">
                      <AspectRatio ratio={2} className="bg-slate-700 rounded-lg overflow-hidden">
                        {generatedImages.panorama ? (
                          <img
                            src={generatedImages.panorama || "/placeholder.svg"}
                            alt="Generated 360° Panorama"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <div className="text-center space-y-2">
                              <Globe className="h-12 w-12 mx-auto opacity-50" />
                              <p>360° panoramic artwork will appear here</p>
                              <p className="text-sm">2:1 aspect ratio for VR viewing</p>
                            </div>
                          </div>
                        )}
                      </AspectRatio>
                      {generatedImages.panorama && (
                        <Button
                          onClick={() => downloadImage(generatedImages.panorama!, "flowsketch-360.jpg")}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download 360° Panorama
                        </Button>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Prompt Editor Dialog */}
        <Dialog open={showPromptEditor} onOpenChange={setShowPromptEditor}>
          <DialogContent className="max-w-4xl max-h-[80vh] bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-slate-100 flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Prompt Editor
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Preview and edit the AI generation prompt
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                value={previewPrompt}
                onChange={(e) => setPreviewPrompt(e.target.value)}
                className="min-h-[300px] bg-slate-700 border-slate-600 text-slate-100 font-mono text-sm"
                placeholder="AI generation prompt will appear here..."
              />
              <div className="flex justify-between items-center">
                <div className="text-sm text-slate-400">Characters: {previewPrompt.length} / 4000</div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setParams((prev) => ({ ...prev, customPrompt: previewPrompt }))
                      setShowPromptEditor(false)
                      toast({
                        title: "Custom Prompt Set",
                        description: "The edited prompt will be used for generation",
                      })
                    }}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Use Custom Prompt
                  </Button>
                  <Button
                    onClick={() => {
                      setParams((prev) => ({ ...prev, customPrompt: "" }))
                      setShowPromptEditor(false)
                      toast({
                        title: "Reset to Auto",
                        description: "Switched back to automatic prompt generation",
                      })
                    }}
                    variant="outline"
                    className="border-slate-600 text-slate-200 hover:bg-slate-700"
                  >
                    Reset to Auto
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
