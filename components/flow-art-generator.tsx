"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
  CheckCircle,
  Loader2,
  Cpu,
} from "lucide-react"
import { generateFlowField, generateDomeProjection as generateDomeSVG, type GenerationParams } from "@/lib/flow-model"

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
            imageUrl = generatedArt.upscaledImageUrl || generatedArt.imageUrl
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

        toast({
          title: "Download Complete! 📥",
          description: `${filename} has been saved to your device.`,
        })
      } catch (error: any) {
        console.error("Download error:", error)
        setDownloadStatus(`Download failed: ${error.message}`)
        toast({
          title: "Download Failed",
          description: error.message || "Failed to download image. Please try again.",
          variant: "destructive",
        })
      } finally {
        setTimeout(() => setDownloadStatus(null), 3000)
      }
    },
    [generatedArt, toast],
  )

  const upscaleImage = useCallback(async () => {
    if (!generatedArt || generatedArt.mode === "svg") return

    setIsUpscaling(true)
    try {
      console.log("Starting upscaling process...")

      const response = await fetch("/api/upscale-to-4k", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: generatedArt.imageUrl }),
      })

      if (!response.ok) {
        throw new Error(`Upscaling failed: ${response.status}`)
      }

      const data = await response.json()
      console.log("Upscaling response:", data)

      if (data.success) {
        const updatedArt = {
          ...generatedArt,
          upscaledImageUrl: data.upscaledImageUrl,
          upscaleMethod: data.method,
          estimatedFileSize: data.estimatedFileSize,
        }
        setGeneratedArt(updatedArt)

        // Update gallery
        setGallery((prev) => prev.map((item) => (item.id === generatedArt.id ? updatedArt : item)))

        toast({
          title: "4K Upscaling Complete! 🚀",
          description: `Image enhanced to 4K resolution using ${data.method}.`,
        })
      } else {
        throw new Error(data.error || "Upscaling failed")
      }
    } catch (error: any) {
      console.error("Upscaling error:", error)
      toast({
        title: "Upscaling Failed",
        description: error.message || "Failed to upscale image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpscaling(false)
    }
  }, [generatedArt, toast])

  const enhancePrompt = useCallback(async () => {
    if (!customPrompt.trim()) {
      toast({
        title: "No Prompt to Enhance",
        description: "Please enter a custom prompt first.",
        variant: "destructive",
      })
      return
    }

    setIsEnhancingPrompt(true)
    try {
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: customPrompt,
          dataset,
          scenario,
          colorScheme,
        }),
      })

      if (!response.ok) {
        throw new Error(`Prompt enhancement failed: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setCustomPrompt(data.enhancedPrompt)
        toast({
          title: "Prompt Enhanced! ✨",
          description: "Your prompt has been enhanced with mathematical and artistic details.",
        })
      } else {
        throw new Error(data.error || "Prompt enhancement failed")
      }
    } catch (error: any) {
      console.error("Prompt enhancement error:", error)
      toast({
        title: "Enhancement Failed",
        description: error.message || "Failed to enhance prompt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsEnhancingPrompt(false)
    }
  }, [customPrompt, dataset, scenario, colorScheme, toast])

  const generateDomeProjection = useCallback(async () => {
    if (!generatedArt) return

    setIsGeneratingDome(true)
    try {
      console.log("Generating dome projection...")

      if (generatedArt.mode === "svg") {
        // Generate dome SVG
        const domeSvgContent = generateDomeSVG(generatedArt.params)
        const domeSvgBlob = new Blob([domeSvgContent], { type: "image/svg+xml" })
        const domeImageUrl = URL.createObjectURL(domeSvgBlob)

        const updatedArt = {
          ...generatedArt,
          domeImageUrl,
          isDomeProjection: true,
          domeSpecs: {
            diameter: domeDiameter,
            resolution: domeResolution,
            projectionType: domeProjectionType,
          },
        }
        setGeneratedArt(updatedArt)
        setGallery((prev) => prev.map((item) => (item.id === generatedArt.id ? updatedArt : item)))

        toast({
          title: "Dome Projection Generated! 🏛️",
          description: `SVG dome projection created for ${domeDiameter}ft dome.`,
        })
      } else {
        // Generate AI dome projection
        const response = await fetch("/api/generate-art", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...generatedArt.params,
            domeProjection: true,
            domeDiameter,
            domeResolution,
            projectionType: domeProjectionType,
            customPrompt: generatedArt.customPrompt,
          }),
        })

        if (!response.ok) {
          throw new Error(`Dome generation failed: ${response.status}`)
        }

        const data = await response.json()

        const updatedArt = {
          ...generatedArt,
          domeImageUrl: data.image,
          isDomeProjection: true,
          domeSpecs: {
            diameter: domeDiameter,
            resolution: domeResolution,
            projectionType: domeProjectionType,
          },
        }
        setGeneratedArt(updatedArt)
        setGallery((prev) => prev.map((item) => (item.id === generatedArt.id ? updatedArt : item)))

        toast({
          title: "AI Dome Projection Generated! 🤖🏛️",
          description: `Dome-optimized artwork created for ${domeDiameter}ft planetarium.`,
        })
      }
    } catch (error: any) {
      console.error("Dome generation error:", error)
      toast({
        title: "Dome Generation Failed",
        description: error.message || "Failed to generate dome projection. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingDome(false)
    }
  }, [generatedArt, domeDiameter, domeResolution, domeProjectionType, toast])

  const generate360Panorama = useCallback(async () => {
    if (!generatedArt) return

    setIsGenerating360(true)
    try {
      console.log("Generating 360° panorama...")

      if (generatedArt.mode === "svg") {
        // Generate 360° SVG
        const panoramaSvgContent = generate360Panorama(generatedArt.params)
        const panoramaSvgBlob = new Blob([panoramaSvgContent], { type: "image/svg+xml" })
        const panorama360Url = URL.createObjectURL(panoramaSvgBlob)

        const updatedArt = {
          ...generatedArt,
          panorama360Url,
          is360Panorama: true,
          panoramaSpecs: {
            resolution: panoramaResolution,
            format: panoramaFormat,
          },
        }
        setGeneratedArt(updatedArt)
        setGallery((prev) => prev.map((item) => (item.id === generatedArt.id ? updatedArt : item)))

        toast({
          title: "360° Panorama Generated! 🌐",
          description: `SVG panorama created in ${panoramaFormat} format.`,
        })
      } else {
        // Generate AI 360° panorama
        const response = await fetch("/api/generate-art", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...generatedArt.params,
            panoramic360: true,
            panoramaResolution,
            panoramaFormat,
            stereographicPerspective,
            customPrompt: generatedArt.customPrompt,
          }),
        })

        if (!response.ok) {
          throw new Error(`360° generation failed: ${response.status}`)
        }

        const data = await response.json()

        const updatedArt = {
          ...generatedArt,
          panorama360Url: data.image,
          is360Panorama: true,
          panoramaSpecs: {
            resolution: panoramaResolution,
            format: panoramaFormat,
          },
        }
        setGeneratedArt(updatedArt)
        setGallery((prev) => prev.map((item) => (item.id === generatedArt.id ? updatedArt : item)))

        toast({
          title: "AI 360° Panorama Generated! 🤖🌐",
          description: `360° artwork created in ${panoramaFormat} format.`,
        })
      }
    } catch (error: any) {
      console.error("360° generation error:", error)
      toast({
        title: "360° Generation Failed",
        description: error.message || "Failed to generate 360° panorama. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating360(false)
    }
  }, [generatedArt, panoramaResolution, panoramaFormat, stereographicPerspective, toast])

  const clearGallery = useCallback(() => {
    setGallery([])
    localStorage.removeItem("flowsketch-gallery")
    toast({
      title: "Gallery Cleared",
      description: "All generated artworks have been removed.",
    })
  }, [toast])

  const randomizeSeed = useCallback(() => {
    const newSeed = Math.floor(Math.random() * 10000)
    setSeed(newSeed)
    toast({
      title: "Seed Randomized! 🎲",
      description: `New seed: ${newSeed}`,
    })
  }, [toast])

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
                      <label className="text-sm font-medium text-slate-300">Generation Mode</label>
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
                      <label className="text-sm font-medium text-slate-300">Mathematical Dataset</label>
                      <select
                        value={dataset}
                        onChange={(e) => setDataset(e.target.value)}
                        className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100"
                      >
                        <option value="spirals">Fibonacci Spirals</option>
                        <option value="fractal">Fractal Trees</option>
                        <option value="mandelbrot">Mandelbrot Set</option>
                        <option value="julia">Julia Set</option>
                        <option value="lorenz">Lorenz Attractor</option>
                        <option value="hyperbolic">Hyperbolic Geometry</option>
                        <option value="gaussian">Gaussian Fields</option>
                        <option value="cellular">Cellular Automata</option>
                        <option value="voronoi">Voronoi Diagrams</option>
                        <option value="perlin">Perlin Noise</option>
                        <option value="diffusion">Reaction-Diffusion</option>
                        <option value="wave">Wave Interference</option>
                        <option value="moons">Lunar Orbital Mechanics</option>
                        <option value="tribes">Tribal Network Topology</option>
                        <option value="heads">Mosaic Head Compositions</option>
                      </select>
                    </div>

                    {/* Scenario Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Visual Scenario</label>
                      <select
                        value={scenario}
                        onChange={(e) => setScenario(e.target.value)}
                        className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100"
                      >
                        <option value="pure">Pure Mathematical</option>
                        <option value="landscape">Natural Landscape</option>
                        <option value="architectural">Architectural</option>
                        <option value="geological">Geological</option>
                        <option value="botanical">Botanical</option>
                        <option value="atmospheric">Atmospheric</option>
                        <option value="crystalline">Crystalline</option>
                        <option value="textile">Textile</option>
                        <option value="metallic">Metallic</option>
                        <option value="organic">Organic</option>
                        <option value="urban">Urban</option>
                        <option value="marine">Marine</option>
                      </select>
                    </div>

                    {/* Color Scheme */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Color Palette</label>
                      <select
                        value={colorScheme}
                        onChange={(e) => setColorScheme(e.target.value)}
                        className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100"
                      >
                        <option value="plasma">Plasma</option>
                        <option value="quantum">Quantum</option>
                        <option value="cosmic">Cosmic</option>
                        <option value="thermal">Thermal</option>
                        <option value="spectral">Spectral</option>
                        <option value="crystalline">Crystalline</option>
                        <option value="bioluminescent">Bioluminescent</option>
                        <option value="aurora">Aurora</option>
                        <option value="metallic">Metallic</option>
                        <option value="prismatic">Prismatic</option>
                        <option value="monochromatic">Monochromatic</option>
                        <option value="infrared">Infrared</option>
                        <option value="lava">Lava</option>
                        <option value="futuristic">Futuristic</option>
                        <option value="forest">Forest</option>
                        <option value="ocean">Ocean</option>
                        <option value="sunset">Sunset</option>
                        <option value="arctic">Arctic</option>
                        <option value="neon">Neon</option>
                        <option value="vintage">Vintage</option>
                        <option value="toxic">Toxic</option>
                        <option value="ember">Ember</option>
                        <option value="lunar">Lunar</option>
                        <option value="tidal">Tidal</option>
                      </select>
                    </div>

                    {/* Advanced Parameters */}
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 flex items-center justify-between">
                          Random Seed
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={randomizeSeed}
                            className="h-6 px-2 text-xs border-slate-600 bg-transparent"
                          >
                            🎲
                          </Button>
                        </label>
                        <input
                          type="number"
                          value={seed}
                          onChange={(e) => setSeed(Number.parseInt(e.target.value) || 0)}
                          className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100"
                          min="0"
                          max="9999"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">
                          Data Points: {numSamples.toLocaleString()}
                        </label>
                        <input
                          type="range"
                          value={numSamples}
                          onChange={(e) => setNumSamples(Number.parseInt(e.target.value))}
                          min="100"
                          max="10000"
                          step="100"
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Noise Scale: {noiseScale}</label>
                        <input
                          type="range"
                          value={noiseScale}
                          onChange={(e) => setNoiseScale(Number.parseFloat(e.target.value))}
                          min="0"
                          max="1"
                          step="0.01"
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Time Step: {timeStep}</label>
                        <input
                          type="range"
                          value={timeStep}
                          onChange={(e) => setTimeStep(Number.parseFloat(e.target.value))}
                          min="0.001"
                          max="0.1"
                          step="0.001"
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* AI Provider Settings */}
                    {mode === "ai" && (
                      <div className="space-y-3 pt-3 border-t border-slate-600">
                        <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                          <Cpu className="h-4 w-4" />
                          AI Provider Settings
                        </h4>

                        <div className="space-y-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={useReplicate}
                              onChange={(e) => setUseReplicate(e.target.checked)}
                              className="rounded border-slate-600"
                            />
                            <span className="text-sm text-slate-300">Use Replicate (Alternative to OpenAI)</span>
                          </label>
                        </div>

                        {useReplicate && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Replicate Model</label>
                            <select
                              value={replicateModel}
                              onChange={(e) => setReplicateModel(e.target.value)}
                              className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100"
                            >
                              <option value="stability-ai/sdxl">Stability AI SDXL</option>
                              <option value="playgroundai/playground-v2.5-1024px-aesthetic">
                                Playground v2.5 Aesthetic
                              </option>
                              <option value="bytedance/sdxl-lightning-4step">SDXL Lightning (Fast)</option>
                            </select>
                          </div>
                        )}

                        <div className="space-y-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={enable4K}
                              onChange={(e) => setEnable4K(e.target.checked)}
                              className="rounded border-slate-600"
                            />
                            <span className="text-sm text-slate-300">Enable 4K Upscaling</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Custom Prompt for AI */}
                    {mode === "ai" && (
                      <div className="space-y-3 pt-3 border-t border-slate-600">
                        <div className="flex items-center justify-between">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={useCustomPrompt}
                              onChange={(e) => setUseCustomPrompt(e.target.checked)}
                              className="rounded border-slate-600"
                            />
                            <span className="text-sm font-medium text-slate-300">Custom AI Prompt</span>
                          </label>
                          {useCustomPrompt && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={enhancePrompt}
                              disabled={isEnhancingPrompt || !customPrompt.trim()}
                              className="h-6 px-2 text-xs border-slate-600 bg-transparent"
                            >
                              {isEnhancingPrompt ? <Loader2 className="h-3 w-3 animate-spin" /> : "✨ Enhance"}
                            </Button>
                          )}
                        </div>
                        {useCustomPrompt && (
                          <textarea
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            placeholder="Describe your vision... (will be enhanced with mathematical details)"
                            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 text-sm"
                            rows={3}
                          />
                        )}
                      </div>
                    )}

                    {/* 360° Panorama Settings */}
                    <div className="space-y-3 pt-3 border-t border-slate-600">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={panorama360Enabled}
                          onChange={(e) => setPanorama360Enabled(e.target.checked)}
                          className="rounded border-slate-600"
                        />
                        <label className="text-sm font-medium text-slate-300">360° Panorama Mode</label>
                      </div>

                      {panorama360Enabled && (
                        <div className="space-y-3 pl-4 border-l-2 border-purple-500">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Resolution</label>
                            <select
                              value={panoramaResolution}
                              onChange={(e) => setPanoramaResolution(e.target.value)}
                              className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100"
                            >
                              <option value="1080p">1080p (1080×1080)</option>
                              <option value="1440p">1440p (1440×1440)</option>
                              <option value="2160p">4K (2160×2160)</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Format</label>
                            <select
                              value={panoramaFormat}
                              onChange={(e) => setPanoramaFormat(e.target.value)}
                              className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100"
                            >
                              <option value="equirectangular">Equirectangular (VR/360°)</option>
                              <option value="stereographic">Stereographic Projection</option>
                            </select>
                          </div>

                          {panoramaFormat === "stereographic" && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-300">Perspective</label>
                              <select
                                value={stereographicPerspective}
                                onChange={(e) => setStereographicPerspective(e.target.value)}
                                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100"
                              >
                                <option value="little-planet">Little Planet (Looking Down)</option>
                                <option value="tunnel">Tunnel View (Looking Up)</option>
                              </select>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Dome Projection Settings */}
                    <div className="space-y-3 pt-3 border-t border-slate-600">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={domeEnabled}
                          onChange={(e) => setDomeEnabled(e.target.checked)}
                          className="rounded border-slate-600"
                        />
                        <label className="text-sm font-medium text-slate-300">Dome Projection</label>
                      </div>

                      {domeEnabled && (
                        <div className="space-y-3 pl-4 border-l-2 border-blue-500">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">
                              Dome Diameter: {domeDiameter}ft
                            </label>
                            <input
                              type="range"
                              value={domeDiameter}
                              onChange={(e) => setDomeDiameter(Number.parseInt(e.target.value))}
                              min="10"
                              max="100"
                              step="5"
                              className="w-full"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Resolution</label>
                            <select
                              value={domeResolution}
                              onChange={(e) => setDomeResolution(e.target.value)}
                              className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100"
                            >
                              <option value="1080p">1080p</option>
                              <option value="1440p">1440p</option>
                              <option value="2160p">4K</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Projection Type</label>
                            <select
                              value={domeProjectionType}
                              onChange={(e) => setDomeProjectionType(e.target.value)}
                              className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100"
                            >
                              <option value="fulldome">Full Dome</option>
                              <option value="fisheye">Fisheye</option>
                              <option value="angular">Angular Fisheye</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Generate Button */}
                    <Button
                      onClick={generateArt}
                      disabled={isGenerating}
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
                          {generatedArt.is4K && (
                            <Badge variant="outline" className="border-green-500 text-green-400">
                              4K
                            </Badge>
                          )}
                          {generatedArt.isDomeProjection && (
                            <Badge variant="outline" className="border-blue-500 text-blue-400">
                              Dome
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
                              src={generatedArt.upscaledImageUrl || generatedArt.imageUrl}
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
                                      {generatedArt.domeSpecs.diameter}ft
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

                          {generatedArt.mode === "ai" && !generatedArt.upscaledImageUrl && (
                            <Button
                              onClick={upscaleImage}
                              disabled={isUpscaling}
                              variant="outline"
                              className="border-purple-500 text-purple-400 hover:bg-purple-500/10 bg-transparent"
                            >
                              {isUpscaling ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Zap className="h-4 w-4 mr-2" />
                              )}
                              4K Upscale
                            </Button>
                          )}

                          {!generatedArt.domeImageUrl && (
                            <Button
                              onClick={generateDomeProjection}
                              disabled={isGeneratingDome}
                              variant="outline"
                              className="border-blue-500 text-blue-400 hover:bg-blue-500/10 bg-transparent"
                            >
                              {isGeneratingDome ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "🏛️"}
                              Generate Dome
                            </Button>
                          )}

                          {!generatedArt.panorama360Url && (
                            <Button
                              onClick={generate360Panorama}
                              disabled={isGenerating360}
                              variant="outline"
                              className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 bg-transparent"
                            >
                              {isGenerating360 ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "🌐"}
                              Generate 360°
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
                              <p className="text-slate-200 capitalize">{generatedArt.params.dataset}</p>
                            </div>
                            <div>
                              <span className="text-slate-400">Scenario:</span>
                              <p className="text-slate-200 capitalize">{generatedArt.params.scenario}</p>
                            </div>
                            <div>
                              <span className="text-slate-400">Color Scheme:</span>
                              <p className="text-slate-200 capitalize">{generatedArt.params.colorScheme}</p>
                            </div>
                            <div>
                              <span className="text-slate-400">Seed:</span>
                              <p className="text-slate-200">{generatedArt.params.seed}</p>
                            </div>
                            <div>
                              <span className="text-slate-400">Data Points:</span>
                              <p className="text-slate-200">{generatedArt.params.numSamples.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-slate-400">Noise Scale:</span>
                              <p className="text-slate-200">{generatedArt.params.noiseScale}</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                            src={art.upscaledImageUrl || art.imageUrl}
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
                          {art.is4K && (
                            <Badge
                              variant="outline"
                              className="bg-slate-800/80 border-green-500 text-green-400 text-xs"
                            >
                              4K
                            </Badge>
                          )}
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
                              {art.params.dataset} + {art.params.scenario}
                            </h3>
                            <p className="text-sm text-slate-400 capitalize">{art.params.colorScheme} palette</p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                            <div>Seed: {art.params.seed}</div>
                            <div>Points: {art.params.numSamples.toLocaleString()}</div>
                            <div>Noise: {art.params.noiseScale}</div>
                            <div>{new Date(art.timestamp).toLocaleDateString()}</div>
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
                                link.href = art.upscaledImageUrl || art.imageUrl
                                link.download = `flowsketch-${art.params.dataset}-${art.timestamp}.${art.mode === "svg" ? "svg" : "jpg"}`
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
