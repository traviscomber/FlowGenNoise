"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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
  Settings,
  Sparkles,
  Eye,
  Wand2,
  Globe,
  Edit3,
  RefreshCw,
  ImageIcon,
  Zap,
  Building,
  Mountain,
  Dice6,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { COLOR_SCHEMES, buildPrompt, getScenarios } from "@/lib/ai-prompt"

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
  const [scenario, setScenario] = useState("trung-sisters")
  const [colorScheme, setColorScheme] = useState("metallic")
  const [seed, setSeed] = useState(1234)
  const [numSamples, setNumSamples] = useState(4000)
  const [noiseScale, setNoiseScale] = useState(0.08)
  const [timeStep, setTimeStep] = useState(0.01)
  const [customPrompt, setCustomPrompt] = useState("")
  const [isCustomPrompt, setIsCustomPrompt] = useState(false)

  // Professional settings
  const [domeProjection, setDomeProjection] = useState(true)
  const [domeDiameter, setDomeDiameter] = useState(20)
  const [domeResolution, setDomeResolution] = useState("4K")
  const [projectionType, setProjectionType] = useState("fisheye")

  const [panoramic360, setPanoramic360] = useState(true)
  const [panoramaResolution, setPanoramaResolution] = useState("8K")
  const [panoramaFormat, setPanoramaFormat] = useState("equirectangular")
  const [stereographicPerspective, setStereographicPerspective] = useState("little-planet")

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

  // Dataset options
  const datasetOptions = [
    { value: "vietnamese", label: "🇻🇳 Vietnamese Heritage" },
    { value: "indonesian", label: "🇮🇩 Indonesian Heritage" },
    { value: "thailand", label: "🇹🇭 Thailand" },
    { value: "spirals", label: "🌀 Spirals" },
    { value: "fractal", label: "🔺 Fractal" },
    { value: "mandelbrot", label: "🔢 Mandelbrot" },
    { value: "julia", label: "🎭 Julia" },
    { value: "lorenz", label: "🦋 Lorenz" },
    { value: "hyperbolic", label: "🌐 Hyperbolic" },
    { value: "gaussian", label: "📊 Gaussian" },
    { value: "cellular", label: "🔬 Cellular" },
    { value: "voronoi", label: "🕸️ Voronoi" },
    { value: "perlin", label: "🌊 Perlin" },
    { value: "diffusion", label: "⚗️ Reaction-Diffusion" },
    { value: "wave", label: "〰️ Wave" },
    { value: "escher", label: "🎨 Escher" },
    { value: "8bit", label: "🎮 8bit" },
    { value: "bosch", label: "🖼️ Bosch" },
  ]

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

  // Keep scenario valid for current dataset
  useEffect(() => {
    const currentScenarios = Object.keys(availableScenarios)
    if (currentScenarios.length > 0 && !currentScenarios.includes(scenario)) {
      setScenario(currentScenarios[0] || "")
    }
  }, [dataset, scenario, availableScenarios])

  // Generate random seed
  const generateRandomSeed = useCallback(() => {
    const newSeed = Math.floor(Math.random() * 10000)
    setSeed(newSeed)
  }, [])

  // Randomize noise
  const randomizeNoise = useCallback(() => {
    setNoiseScale(Number((Math.random() * 0.4 + 0.01).toFixed(2)))
  }, [])

  // Randomize time step
  const randomizeTimeStep = useCallback(() => {
    setTimeStep(Number((Math.random() * 0.15 + 0.005).toFixed(3)))
  }, [])

  // Randomize all
  const randomizeAll = useCallback(() => {
    generateRandomSeed()
    randomizeNoise()
    randomizeTimeStep()
  }, [generateRandomSeed, randomizeNoise, randomizeTimeStep])

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
  const useCustomPromptHandler = useCallback(() => {
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
            timeStep,
            customPrompt: isCustomPrompt ? customPrompt : undefined,
            type,
            domeProjection: type === "dome" ? true : domeProjection,
            domeDiameter,
            domeResolution,
            projectionType,
            panoramic360: type === "360" ? true : panoramic360,
            panoramaResolution,
            panoramaFormat,
            stereographicPerspective,
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
              panoramaFormat,
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
    [
      dataset,
      scenario,
      colorScheme,
      seed,
      numSamples,
      noiseScale,
      timeStep,
      customPrompt,
      isCustomPrompt,
      isGenerating,
      domeProjection,
      domeDiameter,
      domeResolution,
      projectionType,
      panoramic360,
      panoramaResolution,
      panoramaFormat,
      stereographicPerspective,
    ],
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              FlowSketch Professional Art Generator
            </h1>
          </div>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Generate professional-grade mathematical visualizations and AI-powered artwork with seamless 360° panoramic
            wrapping and dome projections.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Settings className="h-5 w-5" />
                Professional Settings
              </CardTitle>
              <CardDescription className="text-slate-400">
                Configure parameters for professional-grade output
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dataset */}
              <div className="space-y-2">
                <Label className="text-slate-300">Dataset</Label>
                <Select value={dataset} onValueChange={handleDatasetChange}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600 max-h-72">
                    {datasetOptions.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Scenario */}
              {Object.keys(availableScenarios).length > 0 && (
                <div className="space-y-2">
                  <Label className="text-slate-300">Cultural Scenario</Label>
                  <Select value={scenario} onValueChange={handleScenarioChange}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                      <SelectValue placeholder="Select a scenario" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600 max-h-72">
                      {Object.entries(availableScenarios).map(([key, scenarioData]) => (
                        <SelectItem key={key} value={key}>
                          {scenarioData.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Color Scheme */}
              <div className="space-y-2">
                <Label className="text-slate-300">Professional Color Palette</Label>
                <Select value={colorScheme} onValueChange={setColorScheme}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600 max-h-72">
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

              {/* Parameters */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-slate-300">Seed</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={seed}
                      onChange={(e) => setSeed(Number.parseInt(e.target.value || "0", 10))}
                      className="bg-slate-700 border-slate-600 text-slate-100"
                    />
                    <Button variant="outline" onClick={generateRandomSeed} className="border-slate-600 bg-transparent">
                      <Dice6 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300">Samples</Label>
                  <Input
                    type="number"
                    value={numSamples}
                    onChange={(e) => setNumSamples(Number.parseInt(e.target.value || "1000", 10))}
                    className="bg-slate-700 border-slate-600 text-slate-100"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300">Noise Scale</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={noiseScale}
                      onChange={(e) => setNoiseScale(Number.parseFloat(e.target.value || "0.1"))}
                      className="bg-slate-700 border-slate-600 text-slate-100"
                    />
                    <Button variant="outline" onClick={randomizeNoise} className="border-slate-600 bg-transparent">
                      <Dice6 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300">Time Step</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.001"
                      value={timeStep}
                      onChange={(e) => setTimeStep(Number.parseFloat(e.target.value || "0.01"))}
                      className="bg-slate-700 border-slate-600 text-slate-100"
                    />
                    <Button variant="outline" onClick={randomizeTimeStep} className="border-slate-600 bg-transparent">
                      <Dice6 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Randomize All */}
              <Button variant="outline" onClick={randomizeAll} className="w-full border-slate-600 bg-transparent">
                <Dice6 className="h-4 w-4 mr-2" />
                Randomize All Parameters
              </Button>

              {/* 360° Professional Panorama */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Switch checked={panoramic360} onCheckedChange={setPanoramic360} />
                  <Label className="text-slate-300 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Professional 360° Panorama
                  </Label>
                </div>
                {panoramic360 && (
                  <div className="space-y-2 pl-6">
                    <div className="grid grid-cols-2 gap-3">
                      <Select value={panoramaResolution} onValueChange={setPanoramaResolution}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="4K">4K Professional</SelectItem>
                          <SelectItem value="8K">8K Ultra</SelectItem>
                          <SelectItem value="16K">16K Cinema</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={panoramaFormat} onValueChange={setPanoramaFormat}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="equirectangular">
                            Equirectangular <span className="text-green-400">(Seamless)</span>
                          </SelectItem>
                          <SelectItem value="stereographic">Stereographic</SelectItem>
                          <SelectItem value="cubemap">Cubemap</SelectItem>
                          <SelectItem value="cylindrical">Cylindrical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {panoramaFormat === "stereographic" && (
                      <div className="grid grid-cols-1">
                        <Label className="text-slate-300">Stereographic Style</Label>
                        <Select value={stereographicPerspective} onValueChange={setStereographicPerspective}>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            <SelectItem value="little-planet">Little Planet</SelectItem>
                            <SelectItem value="tunnel">Tunnel Effect</SelectItem>
                            <SelectItem value="fisheye">Fisheye</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Professional Dome Projection */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Switch checked={domeProjection} onCheckedChange={setDomeProjection} />
                  <Label className="text-slate-300 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Professional Dome Projection
                  </Label>
                </div>
                {domeProjection && (
                  <div className="grid grid-cols-2 gap-3 pl-6">
                    <Input
                      type="number"
                      value={domeDiameter}
                      onChange={(e) => setDomeDiameter(Number.parseInt(e.target.value || "20", 10))}
                      className="bg-slate-700 border-slate-600 text-slate-100"
                      placeholder="Diameter (m)"
                    />
                    <Select value={domeResolution} onValueChange={setDomeResolution}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="2K">2K Standard</SelectItem>
                        <SelectItem value="4K">4K Professional</SelectItem>
                        <SelectItem value="8K">8K Cinema</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="col-span-2">
                      <Select value={projectionType} onValueChange={setProjectionType}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="fisheye">Fisheye Professional</SelectItem>
                          <SelectItem value="equidistant">Equidistant</SelectItem>
                          <SelectItem value="stereographic">Stereographic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              {/* Professional Prompt Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300 flex items-center gap-2">
                    <Edit3 className="h-4 w-4" />
                    Professional Prompt
                  </Label>
                  <div className="flex items-center gap-2">
                    <Dialog open={promptDialogOpen} onOpenChange={setPromptDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={previewPromptHandler}
                          disabled={isLoadingPreview}
                          className="border-slate-600 bg-transparent"
                        >
                          {isLoadingPreview ? (
                            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Eye className="h-4 w-4 mr-2" />
                          )}
                          Preview
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl bg-slate-800 border-slate-700">
                        <DialogHeader>
                          <DialogTitle className="text-slate-100">Prompt Preview & Editor</DialogTitle>
                          <DialogDescription className="text-slate-400">
                            Preview and edit the AI prompt before generation
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Textarea
                            value={previewPrompt}
                            onChange={(e) => setPreviewPrompt(e.target.value)}
                            rows={10}
                            className="font-mono text-sm bg-slate-700 border-slate-600 text-slate-100"
                          />
                          <div className="flex gap-2">
                            <Button onClick={useCustomPromptHandler} className="flex-1">
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
                </div>

                {isCustomPrompt && (
                  <Badge variant="secondary" className="w-full justify-center">
                    Using Custom Prompt
                  </Badge>
                )}
              </div>

              {/* Generate Professional */}
              <div className="space-y-2">
                {isGenerating && (
                  <div className="space-y-2">
                    <Progress value={generationProgress} className="w-full" />
                    <p className="text-xs text-slate-400 text-center">
                      {generationProgress}% complete - Professional quality generation
                    </p>
                    <Button
                      variant="outline"
                      onClick={cancelGeneration}
                      className="w-full border-slate-600 bg-transparent"
                    >
                      Cancel Generation
                    </Button>
                  </div>
                )}

                {!isGenerating && (
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      onClick={() => generateArt("regular")}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Generate Professional Art
                    </Button>
                    <Button
                      onClick={() => generateArt("dome")}
                      variant="outline"
                      className="w-full border-slate-600 bg-transparent"
                    >
                      <Mountain className="h-4 w-4 mr-2" />
                      Generate Dome Pro
                    </Button>
                    <Button
                      onClick={() => generateArt("360")}
                      variant="outline"
                      className="w-full border-slate-600 bg-transparent"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Generate 360° Pro
                    </Button>
                  </div>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Professional Preview */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-100">
                  <ImageIcon className="h-5 w-5" />
                  Professional Preview
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Professional-grade output with seamless wrapping and dome projections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-slate-700">
                    <TabsTrigger value="regular" className="data-[state=active]:bg-purple-600">
                      Professional ({getImagesByType("regular").length})
                    </TabsTrigger>
                    <TabsTrigger value="dome" className="data-[state=active]:bg-purple-600">
                      <Mountain className="h-4 w-4 mr-2" />
                      Dome Pro ({getImagesByType("dome").length})
                    </TabsTrigger>
                    <TabsTrigger value="360" className="data-[state=active]:bg-purple-600">
                      <Globe className="h-4 w-4 mr-2" />
                      360° Pro ({getImagesByType("360").length})
                    </TabsTrigger>
                  </TabsList>

                  {(["regular", "dome", "360"] as const).map((type) => (
                    <TabsContent key={type} value={type} className="mt-4">
                      <div className="space-y-4">
                        {getImagesByType(type).length === 0 ? (
                          <div className="aspect-square bg-slate-900 rounded-lg flex items-center justify-center">
                            <div className="text-center text-slate-400">
                              <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                              <p>Professional {type} artwork will appear here</p>
                              <p className="text-xs mt-2">HD quality with seamless wrapping</p>
                            </div>
                          </div>
                        ) : (
                          <div className="grid gap-4">
                            {getImagesByType(type).map((image) => (
                              <div key={image.id} className="space-y-3">
                                <div className="relative">
                                  <AspectRatio ratio={type === "360" ? 1.75 : 1}>
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
                                    onClick={() =>
                                      downloadImage(image.url, `flowsketch-${type}-${image.timestamp}.png`)
                                    }
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex flex-wrap gap-1">
                                    <Badge variant="outline" className="border-slate-600 text-slate-300">
                                      {image.parameters.dataset}
                                    </Badge>
                                    {image.parameters.scenario && (
                                      <Badge variant="outline" className="border-slate-600 text-slate-300">
                                        {image.parameters.scenario}
                                      </Badge>
                                    )}
                                    <Badge variant="outline" className="border-slate-600 text-slate-300">
                                      {image.parameters.colorScheme}
                                    </Badge>
                                    <Badge variant="outline" className="border-slate-600 text-slate-300">
                                      Seed: {image.parameters.seed}
                                    </Badge>
                                  </div>

                                  <details className="text-sm">
                                    <summary className="cursor-pointer text-slate-400 hover:text-slate-300">
                                      View Prompt
                                    </summary>
                                    <p className="mt-2 p-3 bg-slate-900 rounded text-xs font-mono text-slate-300">
                                      {image.prompt}
                                    </p>
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
    </div>
  )
}
