"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"
import {
  Sparkles,
  Settings,
  ImageIcon,
  Calculator,
  Download,
  Zap,
  Eye,
  AlertCircle,
  CheckCircle,
  Loader2,
  Users,
  Dice1,
  Trash2,
} from "lucide-react"
import { generateFlowField, generateDomeProjection as generateDomeSVG, type GenerationParams } from "@/lib/flow-model"

interface GeneratedArt {
  svgContent: string
  imageUrl: string
  domeImageUrl?: string
  panorama360Url?: string
  params: GenerationParams
  mode: "svg" | "ai"
  customPrompt?: string
  originalPrompt?: string
  promptLength?: number
  timestamp: number
  id: string
  isDomeProjection?: boolean
  is360Panorama?: boolean
  domeSpecs?: {
    diameter: number
    resolution: string
    projectionType: string
  }
  panoramaSpecs?: {
    resolution: string
    format: string
  }
  estimatedFileSize?: string
  provider?: string
  model?: string
}

export function FlowArtGenerator() {
  const [generatedArt, setGeneratedArt] = useState<GeneratedArt | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false)
  const [progress, setProgress] = useState(0)
  const [mode, setMode] = useState<"svg" | "ai">("ai")
  const [error, setError] = useState<string | null>(null)
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null)

  // Enhanced generation parameters with full mathematical controls
  const [dataset, setDataset] = useState("tribes")
  const [scenario, setScenario] = useState("landscape")
  const [colorScheme, setColorScheme] = useState("sunset")
  const [seed, setSeed] = useState(1234)
  const [numSamples, setNumSamples] = useState(3000)
  const [noiseScale, setNoiseScale] = useState(0.1)
  const [timeStep, setTimeStep] = useState(0.01)

  // Dome projection settings - fixed to 10 meters
  const [domeEnabled, setDomeEnabled] = useState(false)
  const [domeDiameter] = useState(10) // Fixed to 10 meters
  const [domeResolution, setDomeResolution] = useState("4K")
  const [domeProjectionType, setDomeProjectionType] = useState("fisheye")

  // 360° panorama settings
  const [panorama360Enabled, setPanorama360Enabled] = useState(true)
  const [panoramaResolution, setPanoramaResolution] = useState("8K")
  const [panoramaFormat, setPanoramaFormat] = useState("stereographic")
  const [stereographicPerspective, setStereographicPerspective] = useState("little-planet")

  // Gallery state
  const [gallery, setGallery] = useState<GeneratedArt[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // AI Art prompt enhancement
  const [customPrompt, setCustomPrompt] = useState("")
  const [enhancedPrompt, setEnhancedPrompt] = useState("")
  const [useCustomPrompt, setUseCustomPrompt] = useState(false)

  // Load gallery from localStorage on mount
  useEffect(() => {
    const savedGallery = localStorage.getItem("flowsketch-gallery")
    if (savedGallery) {
      try {
        setGallery(JSON.parse(savedGallery))
      } catch (error) {
        console.error("Failed to load gallery from localStorage:", error)
      }
    }
  }, [])

  // Save gallery to localStorage whenever it changes
  useEffect(() => {
    if (gallery.length > 0) {
      localStorage.setItem("flowsketch-gallery", JSON.stringify(gallery))
    }
  }, [gallery])

  // Reset to first page when gallery changes
  useEffect(() => {
    setCurrentPage(1)
  }, [gallery.length])

  // Calculate pagination
  const totalPages = Math.ceil(gallery.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = gallery.slice(startIndex, endIndex)

  const generateArt = useCallback(async () => {
    console.log("Generate button clicked! Mode:", mode)
    setIsGenerating(true)
    setProgress(0)
    setError(null)

    try {
      const params: GenerationParams = {
        dataset,
        scenario,
        colorScheme,
        seed,
        numSamples,
        noiseScale,
        timeStep,
        domeProjection: domeEnabled,
        domeDiameter: domeEnabled ? domeDiameter : undefined,
        domeResolution: domeEnabled ? domeResolution : undefined,
        projectionType: domeEnabled ? domeProjectionType : undefined,
        panoramic360: panorama360Enabled,
        panoramaResolution: panorama360Enabled ? panoramaResolution : undefined,
        panoramaFormat: panorama360Enabled ? panoramaFormat : undefined,
        stereographicPerspective:
          panorama360Enabled && panoramaFormat === "stereographic" ? stereographicPerspective : undefined,
      }

      console.log("Generating with params:", params)

      if (mode === "svg") {
        // Generate SVG flow field
        setProgress(30)
        console.log("Generating SVG content...")
        const svgContent = generateFlowField(params)
        console.log("SVG generated, length:", svgContent.length)

        setProgress(50)
        const svgBlob = new Blob([svgContent], { type: "image/svg+xml" })
        const imageUrl = URL.createObjectURL(svgBlob)
        console.log("Blob URL created:", imageUrl)

        let domeImageUrl: string | undefined
        let panorama360Url: string | undefined

        if (domeEnabled) {
          setProgress(65)
          console.log("Generating dome projection...")
          const domeSvgContent = generateDomeSVG({
            width: 1024,
            height: 1024,
            fov: 180,
            tilt: 0,
          })
          const domeSvgBlob = new Blob([domeSvgContent], { type: "image/svg+xml" })
          domeImageUrl = URL.createObjectURL(domeSvgBlob)
        }

        if (panorama360Enabled) {
          setProgress(80)
          console.log("Generating 360° panorama...")
          const panoramaSvgContent = generateFlowField(params)
          const panoramaSvgBlob = new Blob([panoramaSvgContent], { type: "image/svg+xml" })
          panorama360Url = URL.createObjectURL(panoramaSvgBlob)
        }

        setProgress(100)
        const newArt: GeneratedArt = {
          svgContent,
          imageUrl,
          domeImageUrl,
          panorama360Url,
          params,
          mode: "svg" as const,
          timestamp: Date.now(),
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          isDomeProjection: domeEnabled,
          is360Panorama: panorama360Enabled,
          domeSpecs: domeEnabled
            ? {
                diameter: domeDiameter,
                resolution: domeResolution,
                projectionType: domeProjectionType,
              }
            : undefined,
          panoramaSpecs: panorama360Enabled
            ? {
                resolution: panoramaResolution,
                format: panoramaFormat,
              }
            : undefined,
        }
        setGeneratedArt(newArt)
        setGallery((prev) => [newArt, ...prev])

        toast.success(
          `Mathematical SVG Generated! 🎨 ${dataset} + ${scenario} visualization created with ${numSamples} data points.`,
        )
      } else {
        // Generate AI art with enhanced mathematical prompts
        setProgress(20)
        console.log("Calling AI art API...")

        const requestBody = {
          dataset,
          scenario,
          colorScheme,
          seed,
          numSamples,
          noise: noiseScale,
          timeStep,
          customPrompt: useCustomPrompt ? enhancedPrompt || customPrompt : undefined,
          domeProjection: domeEnabled,
          domeDiameter: domeEnabled ? domeDiameter : undefined,
          domeResolution: domeEnabled ? domeResolution : undefined,
          projectionType: domeEnabled ? domeProjectionType : undefined,
          panoramic360: panorama360Enabled,
          panoramaResolution: panorama360Enabled ? panoramaResolution : undefined,
          panoramaFormat: panorama360Enabled ? panoramaFormat : undefined,
          stereographicPerspective:
            panorama360Enabled && panoramaFormat === "stereographic" ? stereographicPerspective : undefined,
        }

        console.log("Sending AI request:", requestBody)

        const response = await fetch("/api/generate-art", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        })

        console.log("AI API Response status:", response.status)

        if (!response.ok) {
          const errorData = await response.json()
          console.error("AI API error response:", errorData)
          throw new Error(errorData.error || `AI API failed: ${response.status}`)
        }

        const data = await response.json()
        console.log("AI art response received:", data)

        if (!data.image) {
          throw new Error("AI API returned no image")
        }

        setProgress(80)
        const newArt: GeneratedArt = {
          svgContent: "",
          imageUrl: data.image,
          domeImageUrl: data.domeImage,
          panorama360Url: data.panoramaImage || data.image,
          params,
          mode: "ai" as const,
          customPrompt: useCustomPrompt ? enhancedPrompt || customPrompt : undefined,
          originalPrompt: data.originalPrompt,
          promptLength: data.promptLength,
          estimatedFileSize: data.estimatedFileSize,
          provider: data.provider,
          model: data.model,
          timestamp: Date.now(),
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          isDomeProjection: domeEnabled,
          is360Panorama: panorama360Enabled,
          domeSpecs: domeEnabled
            ? {
                diameter: domeDiameter,
                resolution: domeResolution,
                projectionType: domeProjectionType,
              }
            : undefined,
          panoramaSpecs: panorama360Enabled
            ? {
                resolution: panoramaResolution,
                format: panoramaFormat,
              }
            : undefined,
        }
        setGeneratedArt(newArt)
        setGallery((prev) => [newArt, ...prev])

        setProgress(100)

        toast.success(`Mathematical Art Generated! 🤖✨ ${dataset} + ${scenario} created with OpenAI DALL-E 3.`)
      }
    } catch (error: any) {
      console.error("Generation error:", error)
      setError(error.message || "Failed to generate artwork")
      toast.error(error.message || "Failed to generate artwork. Please try again.")
    } finally {
      setIsGenerating(false)
      setProgress(0)
    }
  }, [
    dataset,
    scenario,
    colorScheme,
    seed,
    numSamples,
    noiseScale,
    timeStep,
    mode,
    useCustomPrompt,
    customPrompt,
    enhancedPrompt,
    domeEnabled,
    domeDiameter,
    domeResolution,
    domeProjectionType,
    panorama360Enabled,
    panoramaResolution,
    panoramaFormat,
    stereographicPerspective,
  ])

  const downloadImage = useCallback(
    async (format: "regular" | "dome" | "panorama" = "regular") => {
      if (!generatedArt) {
        console.log("No generated art to download")
        return
      }

      console.log("Download button clicked!", format)
      setDownloadStatus("Preparing download...")

      try {
        let imageUrl: string
        let filename: string

        switch (format) {
          case "dome":
            if (!generatedArt.domeImageUrl) {
              throw new Error("No dome projection available")
            }
            imageUrl = generatedArt.domeImageUrl
            filename = `flowsketch-dome-${generatedArt.params.dataset}-${Date.now()}.${generatedArt.mode === "svg" ? "svg" : "jpg"}`
            break
          case "panorama":
            if (!generatedArt.panorama360Url) {
              throw new Error("No 360° panorama available")
            }
            imageUrl = generatedArt.panorama360Url
            filename = `flowsketch-360-${generatedArt.params.dataset}-${Date.now()}.${generatedArt.mode === "svg" ? "svg" : "jpg"}`
            break
          default:
            imageUrl = generatedArt.imageUrl
            filename = `flowsketch-${generatedArt.params.dataset}-${Date.now()}.${generatedArt.mode === "svg" ? "svg" : "jpg"}`
        }

        console.log("Downloading from URL:", imageUrl)

        if (generatedArt.mode === "svg") {
          // Direct download for SVG
          const link = document.createElement("a")
          link.href = imageUrl
          link.download = filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          setDownloadStatus("SVG downloaded successfully!")
        } else {
          // Use proxy for AI-generated images
          const proxyUrl = `/api/download-proxy?url=${encodeURIComponent(imageUrl)}&filename=${encodeURIComponent(filename)}`
          console.log("Using proxy URL:", proxyUrl)

          const link = document.createElement("a")
          link.href = proxyUrl
          link.download = filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          setDownloadStatus("Image downloaded successfully!")
        }

        toast.success(`Download Complete! 📥 ${filename} has been saved to your device.`)
      } catch (error: any) {
        console.error("Download error:", error)
        setDownloadStatus(`Download failed: ${error.message}`)
        toast.error(error.message || "Failed to download image. Please try again.")
      } finally {
        setTimeout(() => setDownloadStatus(null), 3000)
      }
    },
    [generatedArt],
  )

  const enhancePrompt = useCallback(async () => {
    if (!customPrompt.trim()) {
      toast.error("Please enter a custom prompt first.")
      return
    }

    setIsEnhancingPrompt(true)
    try {
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPrompt: customPrompt,
          dataset,
          scenario,
          colorScheme,
          numSamples,
          noiseScale,
          domeProjection: domeEnabled,
          domeDiameter: domeEnabled ? domeDiameter : undefined,
          domeResolution: domeEnabled ? domeResolution : undefined,
          panoramic360: panorama360Enabled,
          panoramaResolution: panorama360Enabled ? panoramaResolution : undefined,
          stereographicPerspective:
            panorama360Enabled && panoramaFormat === "stereographic" ? stereographicPerspective : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error(`Prompt enhancement failed: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setEnhancedPrompt(data.enhancedPrompt)
        toast.success("Prompt Enhanced! ✨ Your prompt has been enhanced with mathematical and artistic details.")
      } else {
        throw new Error(data.error || "Prompt enhancement failed")
      }
    } catch (error: any) {
      console.error("Prompt enhancement error:", error)
      toast.error(error.message || "Failed to enhance prompt. Please try again.")
    } finally {
      setIsEnhancingPrompt(false)
    }
  }, [
    customPrompt,
    dataset,
    scenario,
    colorScheme,
    numSamples,
    noiseScale,
    domeEnabled,
    domeDiameter,
    domeResolution,
    panorama360Enabled,
    panoramaResolution,
    panoramaFormat,
    stereographicPerspective,
  ])

  const clearGallery = useCallback(() => {
    setGallery([])
    localStorage.removeItem("flowsketch-gallery")
    toast.success("Gallery Cleared - All generated artworks have been removed.")
  }, [])

  const randomizeSeed = useCallback(() => {
    const newSeed = Math.floor(Math.random() * 10000)
    setSeed(newSeed)
    toast.success(`Seed Randomized! 🎲 New seed: ${newSeed}`)
  }, [])

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
              FlowSketch Art Generator
            </h1>
          </div>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Generate stunning mathematical visualizations and AI-powered artwork with advanced projection support for
            domes and 360° environments.
          </p>
        </div>

        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800 border-slate-700">
            <TabsTrigger value="generate" className="data-[state=active]:bg-purple-600">
              <Calculator className="h-4 w-4 mr-2" />
              Generate Art
            </TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-purple-600">
              <ImageIcon className="h-4 w-4 mr-2" />
              Gallery ({gallery.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Controls */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-100">
                      <Settings className="h-5 w-5" />
                      Generation Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Mode Selection */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-300">Generation Mode</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={mode === "svg" ? "default" : "outline"}
                          onClick={() => setMode("svg")}
                          className={mode === "svg" ? "bg-purple-600 hover:bg-purple-700" : "border-slate-600"}
                        >
                          <Calculator className="h-4 w-4 mr-2" />
                          Mathematical SVG
                        </Button>
                        <Button
                          variant={mode === "ai" ? "default" : "outline"}
                          onClick={() => setMode("ai")}
                          className={mode === "ai" ? "bg-purple-600 hover:bg-purple-700" : "border-slate-600"}
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          AI Art
                        </Button>
                      </div>
                    </div>

                    {/* Dataset Selection */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-300">Mathematical Dataset</Label>
                      <Select value={dataset} onValueChange={setDataset}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="spirals">Fibonacci Spirals</SelectItem>
                          <SelectItem value="fractal">Fractal Trees</SelectItem>
                          <SelectItem value="mandelbrot">Mandelbrot Set</SelectItem>
                          <SelectItem value="julia">Julia Set</SelectItem>
                          <SelectItem value="lorenz">Lorenz Attractor</SelectItem>
                          <SelectItem value="hyperbolic">Hyperbolic Geometry</SelectItem>
                          <SelectItem value="gaussian">Gaussian Fields</SelectItem>
                          <SelectItem value="cellular">Cellular Automata</SelectItem>
                          <SelectItem value="voronoi">Voronoi Diagrams</SelectItem>
                          <SelectItem value="perlin">Perlin Noise</SelectItem>
                          <SelectItem value="diffusion">Reaction-Diffusion</SelectItem>
                          <SelectItem value="wave">Wave Interference</SelectItem>
                          <SelectItem value="moons">Lunar Orbital Mechanics</SelectItem>
                          <SelectItem value="tribes">Tribal Network Topology</SelectItem>
                          <SelectItem value="heads">Mosaic Head Compositions</SelectItem>
                          <SelectItem value="natives">Ancient Native Tribes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Special Dataset Notices */}
                    {dataset === "tribes" && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
                        <h4 className="text-sm font-medium text-amber-900 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Enhanced Tribes Dataset Active
                        </h4>
                        <p className="text-xs text-amber-800">
                          You'll see: Villages with people, ritual ceremonies, chiefs & shamans, seasonal activities,
                          trading posts, and complex tribal societies with 50-250 people per tribe!
                        </p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs border-amber-300 text-amber-700">
                            Villages
                          </Badge>
                          <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                            People
                          </Badge>
                          <Badge variant="outline" className="text-xs border-red-300 text-red-700">
                            Rituals
                          </Badge>
                          <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                            Seasonal
                          </Badge>
                        </div>
                      </div>
                    )}

                    {dataset === "natives" && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                        <h4 className="text-sm font-medium text-green-900 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Ancient Native Tribes Dataset Active
                        </h4>
                        <p className="text-xs text-green-800">
                          Experience authentic indigenous civilizations: Longhouses & tipis, ceremonial dance circles,
                          medicine wheels, sacred groves, hunting grounds, and traditional tribal life!
                        </p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                            Longhouses
                          </Badge>
                          <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                            Dance Circles
                          </Badge>
                          <Badge variant="outline" className="text-xs border-purple-300 text-purple-700">
                            Medicine Wheels
                          </Badge>
                          <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700">
                            Sacred Groves
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* Scenario Selection */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-300">Visual Scenario</Label>
                      <Select value={scenario} onValueChange={setScenario}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="pure">Pure Mathematical</SelectItem>
                          <SelectItem value="landscape">Natural Landscape</SelectItem>
                          <SelectItem value="architectural">Architectural</SelectItem>
                          <SelectItem value="geological">Geological</SelectItem>
                          <SelectItem value="botanical">Botanical</SelectItem>
                          <SelectItem value="atmospheric">Atmospheric</SelectItem>
                          <SelectItem value="crystalline">Crystalline</SelectItem>
                          <SelectItem value="textile">Textile</SelectItem>
                          <SelectItem value="metallic">Metallic</SelectItem>
                          <SelectItem value="organic">Organic</SelectItem>
                          <SelectItem value="urban">Urban</SelectItem>
                          <SelectItem value="marine">Marine</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Color Scheme */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-300">Color Palette</Label>
                      <Select value={colorScheme} onValueChange={setColorScheme}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="plasma">Plasma</SelectItem>
                          <SelectItem value="quantum">Quantum</SelectItem>
                          <SelectItem value="cosmic">Cosmic</SelectItem>
                          <SelectItem value="thermal">Thermal</SelectItem>
                          <SelectItem value="spectral">Spectral</SelectItem>
                          <SelectItem value="crystalline">Crystalline</SelectItem>
                          <SelectItem value="bioluminescent">Bioluminescent</SelectItem>
                          <SelectItem value="aurora">Aurora</SelectItem>
                          <SelectItem value="metallic">Metallic</SelectItem>
                          <SelectItem value="prismatic">Prismatic</SelectItem>
                          <SelectItem value="monochromatic">Monochromatic</SelectItem>
                          <SelectItem value="infrared">Infrared</SelectItem>
                          <SelectItem value="lava">Lava</SelectItem>
                          <SelectItem value="futuristic">Futuristic</SelectItem>
                          <SelectItem value="forest">Forest</SelectItem>
                          <SelectItem value="ocean">Ocean</SelectItem>
                          <SelectItem value="sunset">Sunset</SelectItem>
                          <SelectItem value="arctic">Arctic</SelectItem>
                          <SelectItem value="neon">Neon</SelectItem>
                          <SelectItem value="vintage">Vintage</SelectItem>
                          <SelectItem value="toxic">Toxic</SelectItem>
                          <SelectItem value="ember">Ember</SelectItem>
                          <SelectItem value="lunar">Lunar</SelectItem>
                          <SelectItem value="tidal">Tidal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Mathematical Parameters */}
                    <div className="space-y-3 pt-3 border-t border-slate-600">
                      <h4 className="text-sm font-medium text-slate-300">Mathematical Parameters</h4>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium text-slate-300">Random Seed</Label>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={randomizeSeed}
                            className="h-6 px-2 text-xs border-slate-600 bg-transparent"
                          >
                            <Dice1 className="h-3 w-3" />
                          </Button>
                        </div>
                        <Input
                          type="number"
                          value={seed}
                          onChange={(e) => setSeed(Number.parseInt(e.target.value) || 0)}
                          className="bg-slate-700 border-slate-600 text-slate-100"
                          min="0"
                          max="9999"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-300">
                          Data Points: {numSamples.toLocaleString()}
                        </Label>
                        <Slider
                          value={[numSamples]}
                          onValueChange={(value) => setNumSamples(value[0])}
                          min={100}
                          max={10000}
                          step={100}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-300">Noise Scale: {noiseScale}</Label>
                        <Slider
                          value={[noiseScale]}
                          onValueChange={(value) => setNoiseScale(value[0])}
                          min={0}
                          max={1}
                          step={0.01}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-300">Time Step: {timeStep}</Label>
                        <Slider
                          value={[timeStep]}
                          onValueChange={(value) => setTimeStep(value[0])}
                          min={0.001}
                          max={0.1}
                          step={0.001}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Custom Prompt for AI */}
                    {mode === "ai" && (
                      <div className="space-y-3 pt-3 border-t border-slate-600">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center space-x-2">
                            <Switch checked={useCustomPrompt} onCheckedChange={setUseCustomPrompt} />
                            <span className="text-sm font-medium text-slate-300">Custom AI Prompt</span>
                          </Label>
                        </div>
                        {useCustomPrompt && (
                          <div className="space-y-3">
                            <Textarea
                              value={customPrompt}
                              onChange={(e) => setCustomPrompt(e.target.value)}
                              placeholder="Describe your vision... (will be enhanced with mathematical details)"
                              className="bg-slate-700 border-slate-600 text-slate-100 text-sm min-h-[100px] resize-vertical"
                              rows={4}
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={enhancePrompt}
                                disabled={isEnhancingPrompt || !customPrompt.trim()}
                                variant="outline"
                                size="sm"
                                className="border-purple-500 text-purple-400 hover:bg-purple-500/10 bg-transparent"
                              >
                                {isEnhancingPrompt ? (
                                  <>
                                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                    Enhancing...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="h-3 w-3 mr-2" />
                                    Enhance Prompt
                                  </>
                                )}
                              </Button>
                              <Button
                                onClick={generateArt}
                                disabled={isGenerating || !customPrompt.trim()}
                                size="sm"
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                              >
                                {isGenerating ? (
                                  <>
                                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    <Zap className="h-3 w-3 mr-2" />
                                    Generate Now
                                  </>
                                )}
                              </Button>
                            </div>
                            {customPrompt && (
                              <div className="bg-slate-900 p-3 rounded-md border border-slate-600">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium text-slate-400">CURRENT PROMPT</span>
                                  <span className="text-xs text-slate-500">{customPrompt.length} characters</span>
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                  {customPrompt}
                                </p>
                              </div>
                            )}
                            {enhancedPrompt && (
                              <div className="bg-slate-900 p-3 rounded-md border border-slate-600">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium text-slate-400">ENHANCED PROMPT</span>
                                  <span className="text-xs text-slate-500">{enhancedPrompt.length} characters</span>
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                  {enhancedPrompt}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 360° Panorama Settings */}
                    <div className="space-y-3 pt-3 border-t border-slate-600">
                      <div className="flex items-center space-x-2">
                        <Switch checked={panorama360Enabled} onCheckedChange={setPanorama360Enabled} />
                        <Label className="text-sm font-medium text-slate-300">360° Panorama Mode</Label>
                      </div>

                      {panorama360Enabled && (
                        <div className="space-y-3 pl-4 border-l-2 border-purple-500">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-300">Resolution</Label>
                            <Select value={panoramaResolution} onValueChange={setPanoramaResolution}>
                              <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-700 border-slate-600">
                                <SelectItem value="4K">4K (4096×2048)</SelectItem>
                                <SelectItem value="8K">8K (8192×4096)</SelectItem>
                                <SelectItem value="16K">16K (16384×8192)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-300">Format</Label>
                            <Select value={panoramaFormat} onValueChange={setPanoramaFormat}>
                              <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-700 border-slate-600">
                                <SelectItem value="equirectangular">Equirectangular (VR/360°)</SelectItem>
                                <SelectItem value="stereographic">Stereographic Projection</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {panoramaFormat === "stereographic" && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-slate-300">Perspective</Label>
                              <Select value={stereographicPerspective} onValueChange={setStereographicPerspective}>
                                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-700 border-slate-600">
                                  <SelectItem value="little-planet">Little Planet (Looking Down)</SelectItem>
                                  <SelectItem value="tunnel">Tunnel View (Looking Up)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Dome Projection Settings - Fixed to 10 meters */}
                    <div className="space-y-3 pt-3 border-t border-slate-600">
                      <div className="flex items-center space-x-2">
                        <Switch checked={domeEnabled} onCheckedChange={setDomeEnabled} />
                        <Label className="text-sm font-medium text-slate-300">Dome Projection (10m diameter)</Label>
                      </div>

                      {domeEnabled && (
                        <div className="space-y-3 pl-4 border-l-2 border-blue-500">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs text-blue-800">
                              🏛️ Dome diameter is fixed at 10 meters for optimal viewing experience
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-300">Resolution</Label>
                            <Select value={domeResolution} onValueChange={setDomeResolution}>
                              <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-700 border-slate-600">
                                <SelectItem value="2K">2K (2048×2048)</SelectItem>
                                <SelectItem value="4K">4K (4096×4096)</SelectItem>
                                <SelectItem value="8K">8K (8192×8192)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-300">Projection Type</Label>
                            <Select value={domeProjectionType} onValueChange={setDomeProjectionType}>
                              <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-700 border-slate-600">
                                <SelectItem value="fisheye">Fisheye</SelectItem>
                                <SelectItem value="equirectangular">Equirectangular</SelectItem>
                                <SelectItem value="stereographic">Stereographic</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Generate Button */}
                    <Button
                      onClick={generateArt}
                      disabled={isGenerating || (useCustomPrompt && !customPrompt.trim())}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate {mode === "svg" ? "Mathematical SVG" : "AI Art"}
                          {useCustomPrompt && customPrompt.trim() && " (Custom Prompt)"}
                        </>
                      )}
                    </Button>

                    {/* Progress Bar */}
                    {isGenerating && progress > 0 && (
                      <div className="space-y-2">
                        <Progress value={progress} className="w-full" />
                        <p className="text-xs text-slate-400 text-center">{progress}% complete</p>
                      </div>
                    )}

                    {/* Error Display */}
                    {error && (
                      <Alert className="border-red-500 bg-red-500/10">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-red-400">{error}</AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Preview */}
              <div className="lg:col-span-2">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-slate-100">
                      <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Generated Artwork
                      </div>
                      {generatedArt && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-purple-500 text-purple-400">
                            {generatedArt.mode === "svg" ? "Mathematical SVG" : "AI Generated"}
                          </Badge>
                          {generatedArt.isDomeProjection && (
                            <Badge variant="outline" className="border-blue-500 text-blue-400">
                              Dome 10m
                            </Badge>
                          )}
                          {generatedArt.is360Panorama && (
                            <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                              360°
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {generatedArt ? (
                      <div className="space-y-4">
                        {/* Main Image */}
                        <div className="relative bg-slate-900 rounded-lg overflow-hidden">
                          {generatedArt.mode === "svg" ? (
                            <div
                              className="w-full h-96 flex items-center justify-center"
                              dangerouslySetInnerHTML={{ __html: generatedArt.svgContent }}
                            />
                          ) : (
                            <img
                              src={generatedArt.imageUrl || "/placeholder.svg"}
                              alt="Generated artwork"
                              className="w-full h-96 object-contain"
                            />
                          )}
                        </div>

                        {/* Additional Views */}
                        {(generatedArt.domeImageUrl || generatedArt.panorama360Url) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {generatedArt.domeImageUrl && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                  🏛️ Dome Projection
                                  {generatedArt.domeSpecs && (
                                    <Badge variant="outline" className="text-xs">
                                      {generatedArt.domeSpecs.diameter}m
                                    </Badge>
                                  )}
                                </h4>
                                <div className="relative bg-slate-900 rounded-lg overflow-hidden">
                                  {generatedArt.mode === "svg" ? (
                                    <div
                                      className="w-full h-48 flex items-center justify-center"
                                      dangerouslySetInnerHTML={{ __html: generatedArt.svgContent }}
                                    />
                                  ) : (
                                    <img
                                      src={generatedArt.domeImageUrl || "/placeholder.svg"}
                                      alt="Dome projection"
                                      className="w-full h-48 object-contain"
                                    />
                                  )}
                                </div>
                              </div>
                            )}

                            {generatedArt.panorama360Url && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                  🌐 360° Panorama
                                  {generatedArt.panoramaSpecs && (
                                    <Badge variant="outline" className="text-xs">
                                      {generatedArt.panoramaSpecs.format}
                                    </Badge>
                                  )}
                                </h4>
                                <div className="relative bg-slate-900 rounded-lg overflow-hidden">
                                  {generatedArt.mode === "svg" ? (
                                    <div
                                      className="w-full h-48 flex items-center justify-center"
                                      dangerouslySetInnerHTML={{ __html: generatedArt.svgContent }}
                                    />
                                  ) : (
                                    <img
                                      src={generatedArt.panorama360Url || "/placeholder.svg"}
                                      alt="360° panorama"
                                      className="w-full h-48 object-contain"
                                    />
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                          <Button onClick={() => downloadImage("regular")} className="bg-green-600 hover:bg-green-700">
                            <Download className="h-4 w-4 mr-2" />
                            Download Main
                          </Button>

                          {generatedArt.domeImageUrl && (
                            <Button
                              onClick={() => downloadImage("dome")}
                              variant="outline"
                              className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download Dome
                            </Button>
                          )}

                          {generatedArt.panorama360Url && (
                            <Button
                              onClick={() => downloadImage("panorama")}
                              variant="outline"
                              className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download 360°
                            </Button>
                          )}
                        </div>

                        {/* Download Status */}
                        {downloadStatus && (
                          <Alert className="border-green-500 bg-green-500/10">
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription className="text-green-400">{downloadStatus}</AlertDescription>
                          </Alert>
                        )}

                        {/* Artwork Details */}
                        <div className="space-y-3 pt-4 border-t border-slate-600">
                          <h4 className="text-sm font-medium text-slate-300">Artwork Details</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-slate-400">Dataset:</span>
                              <p className="text-slate-200 capitalize">{generatedArt.params?.dataset || "N/A"}</p>
                            </div>
                            <div>
                              <span className="text-slate-400">Scenario:</span>
                              <p className="text-slate-200 capitalize">{generatedArt.params?.scenario || "N/A"}</p>
                            </div>
                            <div>
                              <span className="text-slate-400">Color Scheme:</span>
                              <p className="text-slate-200 capitalize">{generatedArt.params?.colorScheme || "N/A"}</p>
                            </div>
                            <div>
                              <span className="text-slate-400">Seed:</span>
                              <p className="text-slate-200">{generatedArt.params?.seed || "N/A"}</p>
                            </div>
                            <div>
                              <span className="text-slate-400">Data Points:</span>
                              <p className="text-slate-200">
                                {generatedArt.params?.numSamples?.toLocaleString() || "N/A"}
                              </p>
                            </div>
                            <div>
                              <span className="text-slate-400">Noise Scale:</span>
                              <p className="text-slate-200">{generatedArt.params?.noiseScale || "N/A"}</p>
                            </div>
                            <div>
                              <span className="text-slate-400">Time Step:</span>
                              <p className="text-slate-200">{generatedArt.params?.timeStep || "N/A"}</p>
                            </div>
                            {generatedArt.mode === "ai" && generatedArt.provider && (
                              <div>
                                <span className="text-slate-400">Provider:</span>
                                <p className="text-slate-200 capitalize">{generatedArt.provider}</p>
                              </div>
                            )}
                            {generatedArt.estimatedFileSize && (
                              <div>
                                <span className="text-slate-400">File Size:</span>
                                <p className="text-slate-200">{generatedArt.estimatedFileSize}</p>
                              </div>
                            )}
                          </div>

                          {generatedArt.mode === "ai" && generatedArt.originalPrompt && (
                            <div className="space-y-2">
                              <span className="text-slate-400 text-sm">Generated Prompt:</span>
                              <div className="bg-slate-900 p-3 rounded-md">
                                <p className="text-slate-300 text-sm leading-relaxed">{generatedArt.originalPrompt}</p>
                                {generatedArt.promptLength && (
                                  <p className="text-slate-500 text-xs mt-2">{generatedArt.promptLength} characters</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="h-96 flex items-center justify-center text-slate-400">
                        <div className="text-center space-y-4">
                          <div className="w-16 h-16 mx-auto bg-slate-700 rounded-full flex items-center justify-center">
                            <ImageIcon className="h-8 w-8" />
                          </div>
                          <div>
                            <p className="text-lg font-medium">No artwork generated yet</p>
                            <p className="text-sm">Configure your settings and click Generate to create art</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-100">Gallery</h2>
              <div className="flex items-center gap-2">
                {gallery.length > 0 && (
                  <Button
                    onClick={clearGallery}
                    variant="outline"
                    size="sm"
                    className="border-red-500 text-red-400 bg-transparent"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Gallery
                  </Button>
                )}
                <Badge variant="outline" className="border-slate-600">
                  {gallery.length} artworks
                </Badge>
              </div>
            </div>

            {gallery.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="py-12">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-slate-700 rounded-full flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-slate-300">No artworks in gallery</p>
                      <p className="text-sm text-slate-400">Generate some mathematical art to see it here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="gallery-grid">
                  {currentItems.map((art) => (
                    <Card key={art.id} className="bg-slate-800 border-slate-700 overflow-hidden">
                      <div className="relative">
                        {art.mode === "svg" ? (
                          <div
                            className="w-full h-48 bg-slate-900 flex items-center justify-center"
                            dangerouslySetInnerHTML={{ __html: art.svgContent }}
                          />
                        ) : (
                          <img
                            src={art.imageUrl || "/placeholder.svg"}
                            alt="Generated artwork"
                            className="w-full h-48 object-cover"
                          />
                        )}
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Badge
                            variant="outline"
                            className="bg-slate-800/80 border-purple-500 text-purple-400 text-xs"
                          >
                            {art.mode === "svg" ? "SVG" : "AI"}
                          </Badge>
                          {art.isDomeProjection && (
                            <Badge variant="outline" className="bg-slate-800/80 border-blue-500 text-blue-400 text-xs">
                              Dome
                            </Badge>
                          )}
                          {art.is360Panorama && (
                            <Badge
                              variant="outline"
                              className="bg-slate-800/80 border-yellow-500 text-yellow-400 text-xs"
                            >
                              360°
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-medium text-slate-200 capitalize">
                              {art.params?.dataset || "Unknown"} + {art.params?.scenario || "Unknown"}
                            </h3>
                            <p className="text-sm text-slate-400 capitalize">
                              {art.params?.colorScheme || "Unknown"} palette
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                            <div>Seed: {art.params?.seed || "N/A"}</div>
                            <div>Points: {art.params?.numSamples?.toLocaleString() || "N/A"}</div>
                            <div>Noise: {art.params?.noiseScale || "N/A"}</div>
                            <div>Step: {art.params?.timeStep || "N/A"}</div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                setGeneratedArt(art)
                                // Switch to generate tab to view
                                const generateTab = document.querySelector('[value="generate"]') as HTMLElement
                                generateTab?.click()
                              }}
                              className="flex-1 bg-purple-600 hover:bg-purple-700"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const link = document.createElement("a")
                                link.href = art.imageUrl
                                link.download = `flowsketch-${art.params?.dataset || "art"}-${art.timestamp}.${art.mode === "svg" ? "svg" : "jpg"}`
                                link.click()
                              }}
                              className="border-slate-600"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="border-slate-600"
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={currentPage === page ? "bg-purple-600 hover:bg-purple-700" : "border-slate-600"}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="border-slate-600"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
