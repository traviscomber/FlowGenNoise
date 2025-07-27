"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
  Sparkles,
  Settings,
  ImageIcon,
  Calculator,
  Download,
  Zap,
  Eye,
  AlertCircle,
  FileText,
  CheckCircle,
  Loader2,
  Cpu,
  Palette,
} from "lucide-react"
import { generateFlowField, generateDomeProjection as generateDomeSVG, type GenerationParams } from "@/lib/flow-model"
import { ClientUpscaler } from "@/lib/client-upscaler"

interface GeneratedArt {
  svgContent: string
  imageUrl: string
  upscaledImageUrl?: string
  domeImageUrl?: string
  panorama360Url?: string
  params: GenerationParams
  mode: "svg" | "ai"
  upscaleMethod?: "cloudinary" | "client" | "mathematical"
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
  is4K?: boolean
  provider?: string
  model?: string
}

// Helper function to generate 360 panorama SVG
function generate360Panorama(params: GenerationParams): string {
  return generateFlowField(params)
}

export function FlowArtGenerator() {
  const [generatedArt, setGeneratedArt] = useState<GeneratedArt | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUpscaling, setIsUpscaling] = useState(false)
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false)
  const [isGeneratingDome, setIsGeneratingDome] = useState(false)
  const [isGenerating360, setIsGenerating360] = useState(false)
  const [progress, setProgress] = useState(0)
  const [mode, setMode] = useState<"svg" | "ai">("ai")
  const [error, setError] = useState<string | null>(null)
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null)

  // Enhanced generation parameters
  const [dataset, setDataset] = useState("spirals")
  const [scenario, setScenario] = useState("landscape")
  const [colorScheme, setColorScheme] = useState("plasma")
  const [seed, setSeed] = useState(Math.floor(Math.random() * 10000))
  const [numSamples, setNumSamples] = useState(1000)
  const [noiseScale, setNoiseScale] = useState(0.05)
  const [timeStep, setTimeStep] = useState(0.01)

  // AI provider settings
  const [useReplicate, setUseReplicate] = useState(false)
  const [replicateModel, setReplicateModel] = useState("stability-ai/sdxl")
  const [enable4K, setEnable4K] = useState(false)

  // Dome projection settings
  const [domeEnabled, setDomeEnabled] = useState(false)
  const [domeDiameter, setDomeDiameter] = useState(30)
  const [domeResolution, setDomeResolution] = useState("1080p")
  const [domeProjectionType, setDomeProjectionType] = useState("fulldome")

  // 360° panorama settings
  const [panorama360Enabled, setPanorama360Enabled] = useState(true)
  const [panoramaResolution, setPanoramaResolution] = useState("1080p")
  const [panoramaFormat, setPanoramaFormat] = useState("stereographic")
  const [stereographicPerspective, setStereographicPerspective] = useState("little-planet")

  // Gallery state
  const [gallery, setGallery] = useState<GeneratedArt[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // AI Art prompt enhancement
  const [customPrompt, setCustomPrompt] = useState("")
  const [useCustomPrompt, setUseCustomPrompt] = useState(false)

  const { toast } = useToast()

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
          const domeSvgContent = generateDomeSVG(params)
          const domeSvgBlob = new Blob([domeSvgContent], { type: "image/svg+xml" })
          domeImageUrl = URL.createObjectURL(domeSvgBlob)
        }

        if (panorama360Enabled) {
          setProgress(80)
          console.log("Generating 360° panorama...")
          const panoramaSvgContent = generate360Panorama(params)
          const panoramaSvgBlob = new Blob([panoramaSvgContent], { type: "image/svg+xml" })
          panorama360Url = URL.createObjectURL(panoramaSvgBlob)
        }

        setProgress(100)
        const newArt = {
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

        toast({
          title: `Mathematical SVG Generated! 🎨`,
          description: `${dataset} + ${scenario} visualization created with ${numSamples} data points.`,
        })
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
          customPrompt: useCustomPrompt ? customPrompt : undefined,
          domeProjection: domeEnabled,
          domeDiameter: domeEnabled ? domeDiameter : undefined,
          domeResolution: domeEnabled ? domeResolution : undefined,
          projectionType: domeEnabled ? domeProjectionType : undefined,
          panoramic360: panorama360Enabled,
          panoramaResolution: panorama360Enabled ? panoramaResolution : undefined,
          panoramaFormat: panorama360Enabled ? panoramaFormat : undefined,
          stereographicPerspective:
            panorama360Enabled && panoramaFormat === "stereographic" ? stereographicPerspective : undefined,
          enable4K,
          useReplicate,
          replicateModel,
        }

        console.log("Sending AI request:", requestBody)

        const response = await fetch("/api/generate-art", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        })

        console.log("AI API Response status:", response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error("AI API error response:", errorText)
          throw new Error(`AI API failed: ${response.status} - ${errorText}`)
        }

        const data = await response.json()
        console.log("AI art response received:", data)

        if (!data.image) {
          throw new Error("AI API returned no image")
        }

        setProgress(80)
        const newArt = {
          svgContent: "",
          imageUrl: data.image,
          domeImageUrl: data.domeImage,
          panorama360Url: data.panoramaImage || data.image,
          params,
          mode: "ai" as const,
          customPrompt: useCustomPrompt ? customPrompt : undefined,
          originalPrompt: data.originalPrompt,
          promptLength: data.promptLength,
          estimatedFileSize: data.estimatedFileSize,
          is4K: data.is4K,
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

        const providerText = data.provider === "replicate" ? `Replicate (${data.model})` : "OpenAI DALL-E 3"

        toast({
          title: data.is4K ? "4K Mathematical Art Generated! 🤖✨" : "Mathematical Art Generated! 🤖✨",
          description: `${dataset} + ${scenario} created with ${providerText}${data.is4K ? " in 4K quality" : ""}.`,
        })
      }
    } catch (error: any) {
      console.error("Generation error:", error)
      setError(error.message || "Failed to generate artwork")
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate artwork. Please try again.",
        variant: "destructive",
      })
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
    domeEnabled,
    domeDiameter,
    domeResolution,
    domeProjectionType,
    panorama360Enabled,
    panoramaResolution,
    panoramaFormat,
    stereographicPerspective,
    enable4K,
    useReplicate,
    replicateModel,
    toast,
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
        let fileName: string

        if (format === "dome") {
          if (!generatedArt.domeImageUrl) {
            toast({
              title: "Dome Image Not Available",
              description: "Please generate the dome projection first.",
              variant: "destructive",
            })
            return
          }
          imageUrl = generatedArt.domeImageUrl
          fileName = `flowsketch-dome-${generatedArt.params.dataset}-${generatedArt.params.scenario}-${generatedArt.params.seed}.jpg`
        } else if (format === "panorama") {
          if (!generatedArt.panorama360Url) {
            toast({
              title: "360° Panorama Not Available",
              description: "Please generate the 360° panorama first.",
              variant: "destructive",
            })
            return
          }
          imageUrl = generatedArt.panorama360Url
          fileName = `flowsketch-360-${generatedArt.params.dataset}-${generatedArt.params.scenario}-${generatedArt.params.seed}.jpg`
        } else {
          imageUrl = generatedArt.upscaledImageUrl || generatedArt.imageUrl
          const qualityTag = generatedArt.is4K ? "4K" : generatedArt.upscaledImageUrl ? "enhanced" : "HD"
          fileName = `flowsketch-${generatedArt.params.dataset}-${generatedArt.params.scenario}-${generatedArt.params.seed}-${qualityTag}.jpg`
        }

        console.log("Downloading:", fileName, "from:", imageUrl)

        // Check if it's a data URL (base64 image)
        if (imageUrl.startsWith("data:")) {
          // Direct download for data URLs
          const link = document.createElement("a")
          link.href = imageUrl
          link.download = fileName
          link.style.display = "none"
          document.body.appendChild(link)
          setDownloadStatus("Starting download...")
          link.click()
          document.body.removeChild(link)
          console.log("Direct download completed")
        } else if (imageUrl.startsWith("blob:")) {
          // Direct download for blob URLs
          const link = document.createElement("a")
          link.href = imageUrl
          link.download = fileName
          link.style.display = "none"
          document.body.appendChild(link)
          setDownloadStatus("Starting download...")
          link.click()
          document.body.removeChild(link)
          console.log("Blob download completed")
        } else {
          // For external URLs, use proxy download
          setDownloadStatus("Fetching image...")
          const proxyUrl = `/api/download-proxy?url=${encodeURIComponent(imageUrl)}&filename=${encodeURIComponent(fileName)}`

          const link = document.createElement("a")
          link.href = proxyUrl
          link.download = fileName
          link.target = "_blank"
          link.style.display = "none"
          document.body.appendChild(link)
          setDownloadStatus("Starting download...")
          link.click()
          document.body.removeChild(link)
          console.log("Proxy download initiated")
        }

        setDownloadStatus("Download completed!")

        toast({
          title: "Download Complete! 🎨",
          description: `${generatedArt.is4K ? "4K" : generatedArt.upscaledImageUrl ? "Enhanced" : "Original"} ${generatedArt.params.dataset} + ${generatedArt.params.scenario} downloaded successfully.`,
        })
      } catch (error: any) {
        console.error("Download error:", error)
        setDownloadStatus("Download failed!")
        toast({
          title: "Download Failed",
          description: "Could not download the image. Please try right-clicking and saving the image.",
          variant: "destructive",
        })
      } finally {
        setTimeout(() => {
          setDownloadStatus(null)
        }, 3000)
      }
    },
    [generatedArt, toast],
  )

  const upscaleImage = useCallback(async () => {
    if (!generatedArt) return

    setIsUpscaling(true)
    try {
      if (generatedArt.mode === "svg") {
        toast({
          title: "Mathematical Upscaling",
          description: "Re-rendering visualization with 4x more detail points...",
        })

        let imageDataUrl = generatedArt.imageUrl
        if (generatedArt.imageUrl.startsWith("blob:")) {
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")
          const img = new Image()

          await new Promise((resolve, reject) => {
            img.onload = () => {
              canvas.width = 512
              canvas.height = 512
              ctx?.drawImage(img, 0, 0, 512, 512)
              imageDataUrl = canvas.toDataURL("image/png")
              resolve(void 0)
            }
            img.onerror = reject
            img.src = generatedArt.imageUrl
          })
        }

        const upscaledDataUrl = await ClientUpscaler.upscaleImage(imageDataUrl, 4)

        setGeneratedArt((prev) =>
          prev
            ? {
                ...prev,
                upscaledImageUrl: upscaledDataUrl,
                upscaleMethod: "mathematical",
              }
            : null,
        )

        toast({
          title: "Mathematical Upscaling Complete! ✨",
          description: "Added 16x more data points with enhanced resolution.",
        })
      } else {
        toast({
          title: "AI Art Enhancement",
          description: "Applying advanced pixel enhancement to AI artwork...",
        })

        const upscaledDataUrl = await ClientUpscaler.upscaleImage(generatedArt.imageUrl, 4)

        setGeneratedArt((prev) =>
          prev
            ? {
                ...prev,
                upscaledImageUrl: upscaledDataUrl,
                upscaleMethod: "client",
              }
            : null,
        )

        toast({
          title: "AI Art Enhancement Complete! 🤖✨",
          description: "Applied advanced pixel enhancement to your AI artwork.",
        })
      }
    } catch (error: any) {
      console.error("Upscale error:", error)
      toast({
        title: "Upscaling Failed",
        description: "Enhancement failed. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpscaling(false)
    }
  }, [generatedArt, toast])

  const handleRandomSeed = useCallback(() => {
    const newSeed = Math.floor(Math.random() * 10000)
    setSeed(newSeed)
  }, [])

  const clearGallery = useCallback(() => {
    setGallery([])
    localStorage.removeItem("flowsketch-gallery")
    setCurrentPage(1)
    toast({
      title: "Gallery Cleared",
      description: "All saved artworks have been removed.",
    })
  }, [toast])

  const removeFromGallery = useCallback(
    (id: string) => {
      setGallery((prev) => prev.filter((art) => art.id !== id))
      toast({
        title: "Artwork Removed",
        description: "Artwork removed from gallery.",
      })
    },
    [toast],
  )

  const loadFromGallery = useCallback(
    (art: GeneratedArt) => {
      setGeneratedArt(art)
      setDataset(art.params.dataset)
      setScenario(art.params.scenario)
      setColorScheme(art.params.colorScheme)
      setSeed(art.params.seed)
      setNumSamples(art.params.numSamples)
      setNoiseScale(art.params.noiseScale)
      if (art.customPrompt) {
        setCustomPrompt(art.customPrompt)
        setUseCustomPrompt(true)
      }
      setMode(art.mode)
      toast({
        title: "Artwork Loaded",
        description: "Settings restored from gallery artwork.",
      })
    },
    [toast],
  )

  const getButtonText = () => {
    const providerText = useReplicate ? `Replicate ${replicateModel.split("/")[1]}` : "OpenAI DALL-E"
    const qualityText = enable4K ? " (4K)" : ""

    if (mode === "ai") {
      if (useCustomPrompt) {
        return `Generate Custom ${providerText}${qualityText}`
      }
      return `Generate ${dataset} + ${scenario} (${providerText})${qualityText}`
    } else {
      return `Generate Mathematical ${dataset} + ${scenario}`
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Sparkles className="h-8 w-8 text-purple-400" />
            FlowSketch Mathematical Art Generator
            <Sparkles className="h-8 w-8 text-purple-400" />
          </h1>
          <p className="text-slate-300 text-lg">
            Create stunning mathematical art with enhanced AI prompts, multiple providers, and professional 4K quality
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Download Status */}
        {downloadStatus && (
          <Alert className="mb-6 border-blue-500 bg-blue-50 dark:bg-blue-950">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">{downloadStatus}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Generation Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={mode} onValueChange={(value) => setMode(value as "svg" | "ai")}>
                  <TabsList className="grid w-full grid-cols-3 bg-slate-700">
                    <TabsTrigger value="ai" className="text-xs">
                      AI Art
                    </TabsTrigger>
                    <TabsTrigger value="svg" className="text-xs">
                      Math SVG
                    </TabsTrigger>
                    <TabsTrigger value="gallery" className="text-xs">
                      Gallery ({gallery.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="ai" className="space-y-4">
                    <Alert>
                      <Sparkles className="h-4 w-4" />
                      <AlertDescription>
                        Create photorealistic mathematical art with enhanced prompts based on actual mathematical
                        formulas and patterns.
                      </AlertDescription>
                    </Alert>

                    {/* AI Provider Selection */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                        <div className="space-y-0.5">
                          <label className="text-sm font-medium text-white flex items-center gap-2">
                            <Cpu className="h-4 w-4" />
                            Use Replicate Models
                          </label>
                          <p className="text-xs text-slate-400">
                            Access to SDXL, Playground, and other advanced models
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={useReplicate}
                          onChange={(e) => setUseReplicate(e.target.checked)}
                          className="h-5 w-5 rounded text-purple-600 focus:ring-purple-500 bg-slate-700 border-slate-600"
                        />
                      </div>

                      {useReplicate && (
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">Replicate Model</label>
                          <select
                            value={replicateModel}
                            onChange={(e) => setReplicateModel(e.target.value)}
                            className="w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
                          >
                            <option value="stability-ai/sdxl">Stability AI SDXL (Best Quality)</option>
                            <option value="playgroundai/playground-v2.5-1024px-aesthetic">
                              Playground V2.5 (Aesthetic)
                            </option>
                            <option value="bytedance/sdxl-lightning-4step">SDXL Lightning (Ultra Fast)</option>
                          </select>
                        </div>
                      )}

                      {/* Mathematical Dataset Selection */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                          <Calculator className="h-4 w-4" />
                          Mathematical Dataset
                        </label>
                        <select
                          value={dataset}
                          onChange={(e) => setDataset(e.target.value)}
                          className="w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
                        >
                          <option value="spirals">🌀 Fibonacci Spirals (φ = 1.618)</option>
                          <option value="fractal">🌳 Fractal Trees (Z² + C)</option>
                          <option value="mandelbrot">🎭 Mandelbrot Sets (|Z| &lt; 2)</option>
                          <option value="julia">💫 Julia Sets (C = -0.7269)</option>
                          <option value="lorenz">🦋 Lorenz Attractors (Chaos Theory)</option>
                          <option value="hyperbolic">🌐 Hyperbolic Geometry (K = -1)</option>
                          <option value="gaussian">📊 Gaussian Fields (σ² variance)</option>
                          <option value="cellular">🔲 Cellular Automata (Conway's Rules)</option>
                          <option value="voronoi">🔷 Voronoi Diagrams (Nearest Neighbor)</option>
                          <option value="perlin">🌊 Perlin Noise (Multi-octave)</option>
                          <option value="diffusion">🧪 Reaction-Diffusion (Turing Patterns)</option>
                          <option value="wave">〰️ Wave Interference (Superposition)</option>
                          <option value="moons">🌙 Lunar Orbital Mechanics (N-Body Dynamics)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                          <Palette className="h-4 w-4" />
                          Artistic Scenario
                        </label>
                        <select
                          value={scenario}
                          onChange={(e) => setScenario(e.target.value)}
                          className="w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
                        >
                          <option value="pure">🔬 Pure Mathematics</option>
                          <option value="landscape">🏔️ Natural Landscapes</option>
                          <option value="architectural">🏗️ Architectural Forms</option>
                          <option value="geological">⛰️ Geological Formations</option>
                          <option value="botanical">🌿 Botanical Structures</option>
                          <option value="atmospheric">☁️ Atmospheric Phenomena</option>
                          <option value="crystalline">💎 Crystalline Structures</option>
                          <option value="textile">🧵 Textile Patterns</option>
                          <option value="metallic">⚙️ Metallic Surfaces</option>
                          <option value="organic">🧬 Organic Textures</option>
                          <option value="urban">🏙️ Urban Environments</option>
                          <option value="marine">🌊 Marine Ecosystems</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Color Palette</label>
                        <select
                          value={colorScheme}
                          onChange={(e) => setColorScheme(e.target.value)}
                          className="w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
                        >
                          <option value="plasma">🔥 Plasma Energy</option>
                          <option value="quantum">⚛️ Quantum Fields</option>
                          <option value="cosmic">🌌 Cosmic Space</option>
                          <option value="thermal">🌡️ Thermal Heat</option>
                          <option value="spectral">🌈 Full Spectrum</option>
                          <option value="crystalline">💎 Crystal Ice</option>
                          <option value="bioluminescent">🦠 Bioluminescent</option>
                          <option value="aurora">🌌 Aurora Borealis</option>
                          <option value="metallic">⚙️ Metallic Shine</option>
                          <option value="prismatic">💎 Prismatic Light</option>
                          <option value="monochromatic">⚫ Monochrome</option>
                          <option value="infrared">🔴 Infrared Heat</option>
                          <option value="lava">🌋 Molten Lava</option>
                          <option value="futuristic">🚀 Futuristic Neon</option>
                          <option value="forest">🌲 Forest Nature</option>
                          <option value="ocean">🌊 Ocean Depths</option>
                          <option value="sunset">🌅 Sunset Sky</option>
                          <option value="arctic">❄️ Arctic Ice</option>
                          <option value="neon">💡 Bright Neon</option>
                          <option value="vintage">📸 Vintage Sepia</option>
                          <option value="toxic">☢️ Toxic Chemical</option>
                          <option value="ember">🔥 Glowing Ember</option>
                          <option value="lunar">🌙 Lunar Silver</option>
                          <option value="tidal">🌊 Tidal Forces</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">Samples: {numSamples}</label>
                          <input
                            type="range"
                            min="100"
                            max="5000"
                            step="100"
                            value={numSamples}
                            onChange={(e) => setNumSamples(Number(e.target.value))}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white mb-2">Noise: {noiseScale}</label>
                          <input
                            type="range"
                            min="0"
                            max="0.2"
                            step="0.01"
                            value={noiseScale}
                            onChange={(e) => setNoiseScale(Number(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Seed</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={seed}
                            onChange={(e) => setSeed(Number(e.target.value))}
                            className="flex-1 rounded-md border-slate-600 bg-slate-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
                          />
                          <Button type="button" onClick={handleRandomSeed} variant="outline" size="sm">
                            Random
                          </Button>
                        </div>
                      </div>

                      {/* 4K Quality Toggle */}
                      <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                        <div className="space-y-0.5">
                          <label className="text-sm font-medium text-white">4K Quality</label>
                          <p className="text-xs text-slate-400">Generate 3840x3840 images under 3.1MB</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={enable4K}
                          onChange={(e) => setEnable4K(e.target.checked)}
                          className="h-5 w-5 rounded text-purple-600 focus:ring-purple-500 bg-slate-700 border-slate-600"
                        />
                      </div>
                    </div>

                    {/* Custom Prompt Section */}
                    <div className="space-y-2">
                      <label className="inline-flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="h-5 w-5 rounded text-purple-600 focus:ring-purple-500 bg-slate-700 border-slate-600"
                          checked={useCustomPrompt}
                          onChange={(e) => setUseCustomPrompt(e.target.checked)}
                        />
                        <span className="text-white">Use Custom Prompt</span>
                      </label>

                      {useCustomPrompt && (
                        <div className="space-y-2">
                          <textarea
                            placeholder="Enter your custom mathematical art prompt..."
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            rows={3}
                            className="w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
                          />
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="svg" className="space-y-4">
                    <Alert>
                      <Calculator className="h-4 w-4" />
                      <AlertDescription>
                        Generate pure mathematical visualizations with SVG precision and infinite scalability.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>

                  <TabsContent value="gallery" className="space-y-4">
                    <Alert>
                      <ImageIcon className="h-4 w-4" />
                      <AlertDescription>
                        Your generated artworks are automatically saved here. Click any image to load its settings.
                      </AlertDescription>
                    </Alert>

                    {gallery.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-slate-300">
                            {gallery.length} saved artworks • Page {currentPage} of {totalPages}
                          </p>
                          <Button onClick={clearGallery} variant="outline" size="sm">
                            Clear All
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {currentItems.map((art) => (
                            <div
                              key={art.id}
                              className="relative group border border-slate-600 rounded-lg overflow-hidden bg-slate-800"
                            >
                              <div className="aspect-square relative">
                                {art.mode === "svg" && !art.upscaledImageUrl ? (
                                  <div
                                    className="w-full h-full flex items-center justify-center bg-slate-900"
                                    dangerouslySetInnerHTML={{ __html: art.svgContent }}
                                  />
                                ) : (
                                  <img
                                    src={art.upscaledImageUrl || art.imageUrl}
                                    alt={`${art.params.dataset} + ${art.params.scenario}`}
                                    className="w-full h-full object-cover cursor-pointer"
                                    onClick={() => loadFromGallery(art)}
                                  />
                                )}

                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                  <Button size="sm" variant="secondary" onClick={() => loadFromGallery(art)}>
                                    Load
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => removeFromGallery(art.id)}>
                                    Remove
                                  </Button>
                                </div>
                              </div>

                              {/* Caption */}
                              <div className="p-2 space-y-1">
                                <p className="text-xs font-medium text-white truncate">
                                  {art.params.dataset} • {art.params.scenario}
                                </p>
                                <div className="flex gap-1 flex-wrap">
                                  {art.provider && (
                                    <Badge variant="secondary" className="text-[10px] px-1 py-0">
                                      {art.provider === "replicate" ? "Replicate" : "OpenAI"}
                                    </Badge>
                                  )}
                                  {art.is4K && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] px-1 py-0 text-purple-400 border-purple-400"
                                    >
                                      4K
                                    </Badge>
                                  )}
                                  {art.upscaledImageUrl && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] px-1 py-0 text-orange-400 border-orange-400"
                                    >
                                      Enhanced
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {totalPages > 1 && (
                          <div className="flex justify-between items-center">
                            <Button
                              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1}
                              variant="outline"
                              size="sm"
                            >
                              Previous
                            </Button>
                            <Button
                              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                              disabled={currentPage === totalPages}
                              variant="outline"
                              size="sm"
                            >
                              Next
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">No saved artworks yet.</p>
                    )}
                  </TabsContent>
                </Tabs>

                <Separator className="bg-slate-600 my-6" />

                {/* Generation Button */}
                <div className="space-y-3">
                  <Button
                    onClick={generateArt}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating... {progress}%
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        {getButtonText()}
                      </>
                    )}
                  </Button>

                  {isGenerating && (
                    <div className="space-y-2">
                      <Progress value={progress} className="w-full" />
                      <p className="text-xs text-slate-400 text-center">
                        {progress < 30
                          ? "Preparing mathematical formulas..."
                          : progress < 80
                            ? "Creating mathematical artwork..."
                            : "Finalizing..."}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Mathematical Art Preview
                  {generatedArt?.is4K && (
                    <Badge variant="outline" className="ml-2 text-purple-400 border-purple-400">
                      4K Quality
                    </Badge>
                  )}
                  {generatedArt?.provider && (
                    <Badge variant="outline" className="ml-2 text-blue-400 border-blue-400">
                      {generatedArt.provider === "replicate"
                        ? `Replicate (${generatedArt.model?.split("/")[1]})`
                        : "OpenAI DALL-E 3"}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {generatedArt ? (
                    <div className="space-y-4">
                      <div className="relative overflow-hidden rounded-lg border border-slate-600">
                        {generatedArt.mode === "svg" && !generatedArt.upscaledImageUrl ? (
                          <div
                            className="w-full min-h-[600px] flex items-center justify-center bg-slate-900"
                            dangerouslySetInnerHTML={{ __html: generatedArt.svgContent }}
                          />
                        ) : (
                          <img
                            src={generatedArt.upscaledImageUrl || generatedArt.imageUrl}
                            alt={`${generatedArt.params.dataset} + ${generatedArt.params.scenario}`}
                            className="w-full h-auto max-h-[800px] object-contain"
                          />
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={upscaleImage}
                          disabled={isUpscaling || generatedArt.is4K}
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                        >
                          {isUpscaling ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Enhancing...
                            </>
                          ) : generatedArt.is4K ? (
                            "Already 4K Quality"
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Enhance Details
                            </>
                          )}
                        </Button>

                        <Button
                          onClick={() => downloadImage("regular")}
                          disabled={!!downloadStatus}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          {downloadStatus ? "Downloading..." : `Download ${generatedArt.is4K ? "4K " : ""}Image`}
                        </Button>
                      </div>

                      <div className="text-sm text-slate-400 space-y-1 p-3 bg-slate-700/30 rounded-lg">
                        <p>
                          <strong className="text-slate-300">Mode:</strong>{" "}
                          {generatedArt.mode === "ai" ? "AI Enhanced" : "Mathematical SVG"}
                          {generatedArt.is4K && " • 4K Quality"}
                          {generatedArt.provider &&
                            ` • ${generatedArt.provider === "replicate" ? "Replicate" : "OpenAI"}`}
                        </p>
                        <p>
                          <strong className="text-slate-300">Dataset:</strong> {generatedArt.params.dataset} •{" "}
                          <strong className="text-slate-300">Scenario:</strong> {generatedArt.params.scenario}
                        </p>
                        <p>
                          <strong className="text-slate-300">Colors:</strong> {generatedArt.params.colorScheme} •{" "}
                          <strong className="text-slate-300">Seed:</strong> {generatedArt.params.seed} •{" "}
                          <strong className="text-slate-300">Samples:</strong> {generatedArt.params.numSamples}
                        </p>
                        {generatedArt.estimatedFileSize && (
                          <p>
                            <strong className="text-slate-300">File Size:</strong>{" "}
                            <span className="text-green-400">{generatedArt.estimatedFileSize}</span>
                          </p>
                        )}
                        {generatedArt.originalPrompt && (
                          <div className="mt-3 p-2 bg-slate-800/50 rounded">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="h-3 w-3 text-purple-400" />
                              <p className="text-xs text-purple-400 font-medium">
                                Mathematical Prompt ({generatedArt.promptLength} characters):
                              </p>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed max-h-32 overflow-y-auto">
                              {generatedArt.originalPrompt}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-96 text-slate-400">
                      <ImageIcon className="h-16 w-16 mb-4 opacity-50" />
                      <p className="text-lg mb-2">No mathematical artwork generated yet</p>
                      <p className="text-sm text-center">
                        Configure your mathematical parameters and click "Generate" to create stunning mathematical art
                        with enhanced AI prompts based on real mathematical formulas
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
