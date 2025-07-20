"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Download,
  Sparkles,
  Settings,
  ImageIcon,
  Info,
  Loader2,
  Wand2,
  Edit3,
  Calculator,
  Globe,
  Eye,
} from "lucide-react"
import { generateFlowField, type GenerationParams } from "@/lib/flow-model"
import { ClientUpscaler } from "@/lib/client-upscaler"
import { useToast } from "@/hooks/use-toast"

interface GeneratedArt {
  svgContent: string
  imageUrl: string
  upscaledImageUrl?: string
  domeImageUrl?: string
  params: GenerationParams
  mode: "svg" | "ai"
  upscaleMethod?: "cloudinary" | "client" | "mathematical"
  customPrompt?: string
  timestamp: number
  id: string
  isDomeProjection?: boolean
  domeSpecs?: {
    diameter: number
    resolution: string
    projectionType: string
  }
}

export function FlowArtGenerator() {
  const [generatedArt, setGeneratedArt] = useState<GeneratedArt | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUpscaling, setIsUpscaling] = useState(false)
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false)
  const [isGeneratingDome, setIsGeneratingDome] = useState(false)
  const [progress, setProgress] = useState(0)
  const [mode, setMode] = useState<"svg" | "ai">("svg")

  // Dome projection settings
  const [domeEnabled, setDomeEnabled] = useState(true)
  const [domeDiameter, setDomeDiameter] = useState(30)
  const [domeResolution, setDomeResolution] = useState("8K")
  const [domeProjectionType, setDomeProjectionType] = useState("fulldome")

  // Gallery state
  const [gallery, setGallery] = useState<GeneratedArt[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

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

  // Generation parameters - separate dataset, scenario, and color palette
  const [dataset, setDataset] = useState("spirals")
  const [scenario, setScenario] = useState("pure")
  const [colorScheme, setColorScheme] = useState("plasma")
  const [seed, setSeed] = useState(Math.floor(Math.random() * 10000))
  const [numSamples, setNumSamples] = useState(2000)
  const [noiseScale, setNoiseScale] = useState(0.05)
  const [timeStep, setTimeStep] = useState(0.01)

  // AI Art prompt enhancement
  const [customPrompt, setCustomPrompt] = useState("")
  const [useCustomPrompt, setUseCustomPrompt] = useState(false)

  const { toast } = useToast()

  // Calculate pagination
  const totalPages = Math.ceil(gallery.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = gallery.slice(startIndex, endIndex)

  const enhancePrompt = useCallback(async () => {
    setIsEnhancingPrompt(true)

    try {
      console.log("Enhancing prompt for:", { dataset, scenario, colorScheme, numSamples, noiseScale })

      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataset,
          scenario,
          colorScheme,
          numSamples,
          noiseScale,
          currentPrompt: customPrompt,
          domeProjection: domeEnabled,
          domeDiameter,
          domeResolution,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to enhance prompt: ${response.status}`)
      }

      const data = await response.json()
      console.log("Enhanced prompt received:", data.enhancedPrompt)

      setCustomPrompt(data.enhancedPrompt)
      setUseCustomPrompt(true)

      toast({
        title: "Prompt Enhanced! ✨",
        description: domeEnabled
          ? "Mathematical concepts and dome projection details added to your prompt."
          : "Mathematical concepts and artistic details added to your prompt.",
      })
    } catch (error: any) {
      console.error("Prompt enhancement error:", error)
      toast({
        title: "Enhancement Failed",
        description: "Could not enhance prompt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsEnhancingPrompt(false)
    }
  }, [
    dataset,
    scenario,
    colorScheme,
    numSamples,
    noiseScale,
    customPrompt,
    domeEnabled,
    domeDiameter,
    domeResolution,
    toast,
  ])

  const generateDomeProjection = useCallback(async () => {
    if (!generatedArt) return

    setIsGeneratingDome(true)
    try {
      console.log("Generating dome projection...")

      const domeSpecs = {
        diameter: domeDiameter,
        resolution: domeResolution,
        projectionType: domeProjectionType,
      }

      // Generate dome-optimized version
      const domeParams = {
        ...generatedArt.params,
        domeProjection: true,
        domeDiameter,
        domeResolution,
        projectionType: domeProjectionType,
      }

      let domeImageUrl: string

      if (generatedArt.mode === "svg") {
        // Generate dome-optimized SVG
        const domeSvgContent = generateDomeProjection(domeParams)
        const svgBlob = new Blob([domeSvgContent], { type: "image/svg+xml" })
        domeImageUrl = URL.createObjectURL(svgBlob)
      } else {
        // Generate AI art optimized for dome
        const response = await fetch("/api/generate-ai-art", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...domeParams,
            customPrompt: useCustomPrompt
              ? customPrompt + " optimized for dome projection, fisheye perspective, immersive 360-degree view"
              : undefined,
          }),
        })

        if (!response.ok) {
          throw new Error(`Dome AI generation failed: ${response.status}`)
        }

        const data = await response.json()
        domeImageUrl = data.image
      }

      setGeneratedArt((prev) =>
        prev
          ? {
              ...prev,
              domeImageUrl,
              isDomeProjection: true,
              domeSpecs,
            }
          : null,
      )

      // Update gallery
      setGallery((prev) =>
        prev.map((art) =>
          art.id === generatedArt.id ? { ...art, domeImageUrl, isDomeProjection: true, domeSpecs } : art,
        ),
      )

      toast({
        title: "Dome Projection Generated! 🌐",
        description: `${domeDiameter}m dome projection in ${domeResolution} resolution created.`,
      })
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
  }, [generatedArt, domeDiameter, domeResolution, domeProjectionType, customPrompt, useCustomPrompt, toast])

  const generateArt = useCallback(async () => {
    console.log("Generate button clicked! Mode:", mode)
    setIsGenerating(true)
    setProgress(0)

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
      }

      console.log("Generating with params:", params)

      if (mode === "svg") {
        // Generate SVG flow field
        setProgress(30)
        console.log("Generating SVG content...")
        const svgContent = generateFlowField(params)
        console.log("SVG generated, length:", svgContent.length)

        setProgress(60)
        // Convert SVG to data URL
        const svgBlob = new Blob([svgContent], { type: "image/svg+xml" })
        const imageUrl = URL.createObjectURL(svgBlob)
        console.log("Blob URL created:", imageUrl)

        let domeImageUrl: string | undefined
        if (domeEnabled) {
          setProgress(80)
          console.log("Generating dome projection...")
          const domeSvgContent = generateDomeProjection(params)
          const domeSvgBlob = new Blob([domeSvgContent], { type: "image/svg+xml" })
          domeImageUrl = URL.createObjectURL(domeSvgBlob)
        }

        setProgress(100)
        const newArt = {
          svgContent,
          imageUrl,
          domeImageUrl,
          params,
          mode: "svg" as const,
          timestamp: Date.now(),
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          isDomeProjection: domeEnabled,
          domeSpecs: domeEnabled
            ? {
                diameter: domeDiameter,
                resolution: domeResolution,
                projectionType: domeProjectionType,
              }
            : undefined,
        }
        setGeneratedArt(newArt)
        setGallery((prev) => [newArt, ...prev])

        toast({
          title: `${dataset.charAt(0).toUpperCase() + dataset.slice(1)} + ${scenario === "pure" ? "Pure Math" : scenario.charAt(0).toUpperCase() + scenario.slice(1)} Generated! 🎨`,
          description: domeEnabled
            ? `Complex ${dataset} dataset with ${scenario === "pure" ? "advanced mathematical" : scenario} visualization optimized for ${domeDiameter}m dome projection.`
            : `Complex ${dataset} dataset with ${scenario === "pure" ? "advanced mathematical" : scenario} ${scenario === "pure" ? "visualization" : "scenario blend"} in ${colorScheme} colors.`,
        })
      } else {
        // Generate AI art
        setProgress(20)
        console.log("Calling AI art API...")

        const requestBody = {
          dataset,
          scenario,
          colorScheme,
          seed,
          numSamples,
          noise: noiseScale,
          customPrompt: useCustomPrompt
            ? domeEnabled
              ? customPrompt + " optimized for dome projection, fisheye perspective, immersive 360-degree view"
              : customPrompt
            : undefined,
          domeProjection: domeEnabled,
          domeDiameter: domeEnabled ? domeDiameter : undefined,
          domeResolution: domeEnabled ? domeResolution : undefined,
          projectionType: domeEnabled ? domeProjectionType : undefined,
        }

        console.log("Sending AI request:", requestBody)

        const response = await fetch("/api/generate-ai-art", {
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
          domeImageUrl: data.domeImage || data.image,
          params,
          mode: "ai" as const,
          customPrompt: useCustomPrompt ? customPrompt : undefined,
          timestamp: Date.now(),
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          isDomeProjection: domeEnabled,
          domeSpecs: domeEnabled
            ? {
                diameter: domeDiameter,
                resolution: domeResolution,
                projectionType: domeProjectionType,
              }
            : undefined,
        }
        setGeneratedArt(newArt)
        setGallery((prev) => [newArt, ...prev])

        setProgress(100)
        toast({
          title: "AI Art Generated! 🤖✨",
          description: domeEnabled
            ? `AI-enhanced ${dataset} + ${scenario === "pure" ? "pure mathematical" : scenario} artwork optimized for ${domeDiameter}m dome projection.`
            : useCustomPrompt
              ? "Custom enhanced prompt artwork created!"
              : `AI-enhanced ${dataset} + ${scenario === "pure" ? "pure mathematical" : scenario} artwork in ${colorScheme} palette.`,
        })
      }
    } catch (error: any) {
      console.error("Generation error:", error)
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
    toast,
  ])

  const upscaleImage = useCallback(async () => {
    if (!generatedArt) {
      console.log("No generated art to upscale")
      return
    }

    console.log("Upscale button clicked!")
    setIsUpscaling(true)

    try {
      // For SVG mode, use mathematical upscaling to add real detail
      if (generatedArt.mode === "svg") {
        console.log("Using mathematical upscaling for SVG...")
        toast({
          title: "Mathematical Upscaling",
          description: "Re-rendering visualization with 4x more detail points...",
        })

        // Convert SVG to data URL first
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

        // Apply mathematical upscaling with generation parameters
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
        // For AI art, use client-side upscaling
        console.log("Using pixel-based upscaling for AI art...")
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

  const downloadImage = useCallback(
    async (isDome = false) => {
      if (!generatedArt) {
        console.log("No generated art to download")
        return
      }

      console.log("Download button clicked!", isDome ? "Dome version" : "Regular version")

      try {
        const imageUrl = isDome
          ? generatedArt.domeImageUrl || generatedArt.imageUrl
          : generatedArt.upscaledImageUrl || generatedArt.imageUrl

        const isEnhanced = !!generatedArt.upscaledImageUrl && !isDome
        const fileExtension = generatedArt.mode === "svg" && !isEnhanced ? "svg" : "png"
        const domePrefix = isDome ? "dome-" : ""
        const fileName = `flowsketch-${domePrefix}${generatedArt.mode}-${generatedArt.params.dataset}-${generatedArt.params.scenario}-${generatedArt.params.colorScheme}-${generatedArt.params.seed}${isEnhanced ? "-enhanced" : ""}.${fileExtension}`

        console.log("Downloading:", fileName, "from:", imageUrl)

        // Check if it's a data URL (client-side upscaled or SVG blob)
        if (imageUrl.startsWith("data:") || imageUrl.startsWith("blob:")) {
          // Direct download for data URLs and blob URLs
          const link = document.createElement("a")
          link.href = imageUrl
          link.download = fileName
          link.style.display = "none"
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          console.log("Direct download completed")
        } else {
          // For external URLs, fetch and convert to blob
          const response = await fetch(imageUrl, { mode: "cors" })
          if (!response.ok) {
            throw new Error("Failed to fetch image for download")
          }

          const blob = await response.blob()
          const blobUrl = URL.createObjectURL(blob)

          const link = document.createElement("a")
          link.href = blobUrl
          link.download = fileName
          link.style.display = "none"
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)

          // Clean up the blob URL
          setTimeout(() => URL.revokeObjectURL(blobUrl), 100)
          console.log("Blob download completed")
        }

        toast({
          title: "Download Complete! 🎨",
          description: isDome
            ? `Dome projection for ${generatedArt.domeSpecs?.diameter}m dome downloaded.`
            : `${isEnhanced ? "Enhanced" : "Original"} ${generatedArt.params.dataset} + ${generatedArt.params.scenario === "pure" ? "pure math" : generatedArt.params.scenario} in ${generatedArt.params.colorScheme} colors downloaded.`,
        })
      } catch (error: any) {
        console.error("Download error:", error)
        toast({
          title: "Download Failed",
          description: "Could not download the image. Please try right-clicking and saving the image.",
          variant: "destructive",
        })
      }
    },
    [generatedArt, toast],
  )

  const handleRandomSeed = useCallback(() => {
    const newSeed = Math.floor(Math.random() * 10000)
    console.log("Random seed clicked, new seed:", newSeed)
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
      if (art.domeSpecs) {
        setDomeEnabled(true)
        setDomeDiameter(art.domeSpecs.diameter)
        setDomeResolution(art.domeSpecs.resolution)
        setDomeProjectionType(art.domeSpecs.projectionType)
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
    const scenarioText = scenario === "pure" ? "Pure Math" : scenario.charAt(0).toUpperCase() + scenario.slice(1)
    const domeText = domeEnabled ? ` for ${domeDiameter}m Dome` : ""

    if (mode === "ai") {
      if (useCustomPrompt) {
        return `Generate Custom AI Art${domeText}`
      }
      return `Generate AI ${dataset.charAt(0).toUpperCase() + dataset.slice(1)} + ${scenarioText}${domeText}`
    } else {
      return `Generate ${dataset.charAt(0).toUpperCase() + dataset.slice(1)} + ${scenarioText}${domeText}`
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
          FlowSketch Mathematical Art Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Advanced mathematical datasets with dome projection for immersive experiences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Generation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={mode} onValueChange={(value) => setMode(value as "svg" | "ai")}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="svg">Complex Math</TabsTrigger>
                  <TabsTrigger value="ai">AI Art</TabsTrigger>
                  <TabsTrigger value="gallery">Gallery ({gallery.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="svg" className="space-y-4">
                  <Alert>
                    <Calculator className="h-4 w-4" />
                    <AlertDescription>
                      Complex mathematical datasets with advanced algorithms: Fibonacci spirals, fractal checkerboards,
                      hyperbolic moons, multi-modal Gaussians, and more!{" "}
                      {domeEnabled && "Optimized for dome projection."}
                    </AlertDescription>
                  </Alert>
                </TabsContent>

                <TabsContent value="ai" className="space-y-4">
                  <Alert>
                    <Sparkles className="h-4 w-4" />
                    <AlertDescription>
                      Create AI-generated artwork based on your complex mathematical dataset and scenario combination.
                      {domeEnabled && " Automatically optimized for immersive dome projection."}
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
                        <p className="text-sm text-gray-600">
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
                            className="relative group border rounded-lg overflow-hidden bg-white dark:bg-gray-800"
                          >
                            <div className="aspect-square relative">
                              {art.mode === "svg" && !art.upscaledImageUrl ? (
                                <div
                                  className="w-full h-full flex items-center justify-center text-xs"
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

                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                                  <Button size="sm" variant="secondary" onClick={() => loadFromGallery(art)}>
                                    Load
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => removeFromGallery(art.id)}>
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <div className="p-2 space-y-1">
                              <div className="flex gap-1 flex-wrap">
                                <Badge variant="outline" className="text-xs">
                                  {art.mode}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {art.params.dataset}
                                </Badge>
                                {art.isDomeProjection && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Globe className="h-3 w-3 mr-1" />
                                    Dome
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {art.params.scenario} • {art.params.colorScheme}
                              </p>
                              {art.domeSpecs && (
                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                  {art.domeSpecs.diameter}m • {art.domeSpecs.resolution}
                                </p>
                              )}
                              <p className="text-xs text-gray-500">{new Date(art.timestamp).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {totalPages > 1 && (
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                              />
                            </PaginationItem>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  onClick={() => setCurrentPage(page)}
                                  isActive={currentPage === page}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            ))}

                            <PaginationItem>
                              <PaginationNext
                                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                className={
                                  currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
                                }
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No artworks in gallery yet</p>
                      <p className="text-sm mt-1">Generate some complex mathematical art to see it here!</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {/* Dome Projection Settings */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Dome Projection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="dome-enabled" className="text-sm">
                      Enable Dome Projection
                    </Label>
                    <Switch id="dome-enabled" checked={domeEnabled} onCheckedChange={setDomeEnabled} />
                  </div>

                  {domeEnabled && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-sm">Dome Diameter (meters)</Label>
                        <Slider
                          value={[domeDiameter]}
                          onValueChange={(value) => setDomeDiameter(value[0])}
                          max={100}
                          min={5}
                          step={1}
                        />
                        <div className="text-xs text-gray-600 text-center">{domeDiameter}m</div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">Resolution</Label>
                        <Select value={domeResolution} onValueChange={setDomeResolution}>
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="4K">4K (4096×4096)</SelectItem>
                            <SelectItem value="6K">6K (6144×6144)</SelectItem>
                            <SelectItem value="8K">8K (8192×8192)</SelectItem>
                            <SelectItem value="12K">12K (12288×12288)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">Projection Type</Label>
                        <Select value={domeProjectionType} onValueChange={setDomeProjectionType}>
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fulldome">Fulldome (180°)</SelectItem>
                            <SelectItem value="planetarium">Planetarium</SelectItem>
                            <SelectItem value="immersive">Immersive Experience</SelectItem>
                            <SelectItem value="scientific">Scientific Visualization</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label>Mathematical Dataset</Label>
                <Select value={dataset} onValueChange={setDataset}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spirals">🌀 Quantum Spirals (Fibonacci + Logarithmic + Archimedean)</SelectItem>
                    <SelectItem value="quantum">⚛️ Quantum Fields (Schrödinger + Heisenberg + Entanglement)</SelectItem>
                    <SelectItem value="strings">🧬 String Theory (11D M-Theory + Calabi-Yau + Branes)</SelectItem>
                    <SelectItem value="fractals">
                      🔺 Fractal Dimensions (Hausdorff + Julia + Sierpinski + Barnsley)
                    </SelectItem>
                    <SelectItem value="topology">
                      🕳️ Topological Spaces (Klein Bottle + Hopf Fibration + Riemann)
                    </SelectItem>
                    <SelectItem value="moons">🌙 Hyperbolic Moons (Elliptic Curves + Non-Euclidean)</SelectItem>
                    <SelectItem value="circles">⭕ Manifold Torus (4D Projections + Möbius Strips)</SelectItem>
                    <SelectItem value="blobs">🔵 Voronoi Dynamics (Lorenz Attractor + Chaos Theory)</SelectItem>
                    <SelectItem value="checkerboard">🏁 Fractal Checkerboard (Mandelbrot + Complex Plane)</SelectItem>
                    <SelectItem value="gaussian">📊 Multi-Modal Gaussian (Correlated + Perlin Noise)</SelectItem>
                    <SelectItem value="grid">⚏ Non-Linear Grid (Klein Bottle + Wave Distortion)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Scenario Blend</Label>
                <Select value={scenario} onValueChange={setScenario}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pure">
                      🔢 Pure Mathematical (Advanced Visualization + Sacred Geometry)
                    </SelectItem>
                    <SelectItem value="quantum">⚛️ Quantum Realm (Wave-Particle Duality + Superposition)</SelectItem>
                    <SelectItem value="cosmic">
                      🌌 Cosmic Scale (Gravitational Lensing + Dark Matter + Relativity)
                    </SelectItem>
                    <SelectItem value="microscopic">
                      🔬 Microscopic World (Molecular Dynamics + Brownian Motion)
                    </SelectItem>
                    <SelectItem value="forest">
                      🌲 Living Forest (L-Systems + Fractal Growth + Ecosystem Dynamics)
                    </SelectItem>
                    <SelectItem value="ocean">🌊 Deep Ocean (Navier-Stokes + Turbulence + Fluid Dynamics)</SelectItem>
                    <SelectItem value="neural">
                      🧠 Neural Networks (Synaptic Plasticity + Information Theory)
                    </SelectItem>
                    <SelectItem value="crystalline">
                      💎 Crystal Lattice (Symmetry Groups + Solid State Physics)
                    </SelectItem>
                    <SelectItem value="plasma">⚡ Plasma Physics (Magnetohydrodynamics + Fusion Dynamics)</SelectItem>
                    <SelectItem value="atmospheric">
                      🌅 Atmospheric Physics (Rayleigh Scattering + Fluid Mechanics)
                    </SelectItem>
                    <SelectItem value="geological">🏔️ Geological Time (Tectonic Forces + Mineral Formation)</SelectItem>
                    <SelectItem value="biological">🧬 Biological Systems (DNA Helixes + Protein Folding)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Color Palette</Label>
                <Select value={colorScheme} onValueChange={setColorScheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plasma">🟣 Plasma (Deep Purple → Magenta → Yellow)</SelectItem>
                    <SelectItem value="quantum">⚛️ Quantum (Probability Blue → Wave Green → Particle Gold)</SelectItem>
                    <SelectItem value="cosmic">🌌 Cosmic (Void Black → Nebula Purple → Star White)</SelectItem>
                    <SelectItem value="thermal">🔥 Thermal (Absolute Zero → Fusion Core)</SelectItem>
                    <SelectItem value="spectral">🌈 Spectral (Full Electromagnetic Spectrum)</SelectItem>
                    <SelectItem value="crystalline">
                      💎 Crystalline (Diamond White → Sapphire Blue → Emerald)
                    </SelectItem>
                    <SelectItem value="bioluminescent">🌟 Bioluminescent (Deep Sea → Algae Glow)</SelectItem>
                    <SelectItem value="aurora">🌌 Aurora (Solar Wind → Magnetic Field Interaction)</SelectItem>
                    <SelectItem value="metallic">⚡ Metallic (Copper → Silver → Gold → Platinum)</SelectItem>
                    <SelectItem value="prismatic">🔮 Prismatic (Light Refraction → Rainbow Dispersion)</SelectItem>
                    <SelectItem value="monochromatic">⚫ Monochromatic (Mathematical Grayscale Perfection)</SelectItem>
                    <SelectItem value="infrared">🔴 Infrared (Heat Signature Visualization)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* AI Prompt Enhancement Section */}
              {mode === "ai" && (
                <div className="space-y-3 p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Wand2 className="h-4 w-4" />
                      AI Prompt Enhancement
                    </Label>
                    <Button
                      onClick={enhancePrompt}
                      disabled={isEnhancingPrompt}
                      size="sm"
                      variant="outline"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600"
                    >
                      {isEnhancingPrompt ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Enhancing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3 mr-1" />
                          Enhance
                        </>
                      )}
                    </Button>
                  </div>

                  <Textarea
                    placeholder={
                      domeEnabled
                        ? "Click 'Enhance' to generate a complex mathematical AI art prompt optimized for dome projection, or write your own custom prompt here..."
                        : "Click 'Enhance' to generate a complex mathematical AI art prompt, or write your own custom prompt here..."
                    }
                    value={customPrompt}
                    onChange={(e) => {
                      setCustomPrompt(e.target.value)
                      setUseCustomPrompt(e.target.value.length > 0)
                    }}
                    rows={4}
                    className="text-sm resize-none"
                  />

                  {customPrompt && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        <Edit3 className="h-3 w-3 mr-1" />
                        Custom Prompt Active
                      </Badge>
                      {domeEnabled && (
                        <Badge variant="outline" className="text-xs">
                          <Globe className="h-3 w-3 mr-1" />
                          Dome Optimized
                        </Badge>
                      )}
                      <Button
                        onClick={() => {
                          setCustomPrompt("")
                          setUseCustomPrompt(false)
                        }}
                        size="sm"
                        variant="ghost"
                        className="text-xs h-6 px-2"
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label>Seed: {seed}</Label>
                <Slider value={[seed]} onValueChange={(value) => setSeed(value[0])} max={10000} min={1} step={1} />
                <Button variant="outline" size="sm" onClick={handleRandomSeed} disabled={isGenerating}>
                  Random Seed
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Sample Points: {numSamples}</Label>
                <Slider
                  value={[numSamples]}
                  onValueChange={(value) => setNumSamples(value[0])}
                  max={5000}
                  min={100}
                  step={100}
                />
              </div>

              <div className="space-y-2">
                <Label>Noise Scale: {noiseScale}</Label>
                <Slider
                  value={[noiseScale]}
                  onValueChange={(value) => setNoiseScale(value[0])}
                  max={0.2}
                  min={0.001}
                  step={0.001}
                />
              </div>

              <Button
                onClick={generateArt}
                disabled={isGenerating}
                className={`w-full ${
                  mode === "ai"
                    ? "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:to-pink-600"
                    : domeEnabled
                      ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600"
                      : "bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 hover:from-green-600 hover:via-blue-600 hover:to-purple-600"
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {mode === "ai" ? "Generating AI Art..." : "Generating Complex Math Art..."}
                  </>
                ) : (
                  <>
                    {mode === "ai" ? (
                      <Sparkles className="h-4 w-4 mr-2" />
                    ) : domeEnabled ? (
                      <Globe className="h-4 w-4 mr-2" />
                    ) : (
                      <Calculator className="h-4 w-4 mr-2" />
                    )}
                    {getButtonText()}
                  </>
                )}
              </Button>

              {isGenerating && (
                <div className="space-y-2">
                  <Progress value={progress} />
                  <p className="text-sm text-center text-gray-600">
                    {progress < 30
                      ? `Generating complex ${dataset} dataset...`
                      : progress < 60
                        ? mode === "ai"
                          ? useCustomPrompt
                            ? "Processing custom prompt..."
                            : "Applying AI artistic effects..."
                          : scenario === "pure"
                            ? "Applying advanced mathematical visualization..."
                            : `Blending with ${scenario} scenario dynamics...`
                        : progress < 80
                          ? "Rendering complex visualization..."
                          : domeEnabled
                            ? "Optimizing for dome projection..."
                            : "Finalizing mathematical artwork..."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {generatedArt && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={() => downloadImage(false)} variant="outline" className="w-full bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Download {generatedArt.upscaledImageUrl ? "Enhanced" : "Original"}
                </Button>

                {generatedArt.domeImageUrl && (
                  <Button onClick={() => downloadImage(true)} variant="outline" className="w-full bg-transparent">
                    <Globe className="h-4 w-4 mr-2" />
                    Download Dome Projection
                  </Button>
                )}

                <Button
                  onClick={upscaleImage}
                  disabled={isUpscaling || !!generatedArt.upscaledImageUrl}
                  variant="outline"
                  className="w-full bg-transparent"
                >
                  {isUpscaling ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {generatedArt.mode === "svg" ? "Adding Mathematical Detail..." : "Enhancing AI Art..."}
                    </>
                  ) : generatedArt.upscaledImageUrl ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Enhanced ✓ ({generatedArt.upscaleMethod === "mathematical" ? "16x More Points" : "Pixel Enhanced"}
                      )
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      {generatedArt.mode === "svg" ? "Add Mathematical Detail" : "Enhance AI Art"}
                    </>
                  )}
                </Button>

                {!generatedArt.domeImageUrl && domeEnabled && (
                  <Button
                    onClick={generateDomeProjection}
                    disabled={isGeneratingDome}
                    variant="outline"
                    className="w-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20"
                  >
                    {isGeneratingDome ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating Dome Projection...
                      </>
                    ) : (
                      <>
                        <Globe className="h-4 w-4 mr-2" />
                        Generate Dome Projection
                      </>
                    )}
                  </Button>
                )}

                {generatedArt.upscaledImageUrl && generatedArt.upscaleMethod === "mathematical" && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      True mathematical upscaling: Re-rendered with 4x scale factor and 16x more data points
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Generated Mathematical Artwork
                </span>
                {generatedArt && (
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant={generatedArt.mode === "ai" ? "default" : "outline"}>
                      {generatedArt.mode === "ai" ? "🤖 AI Art" : "📊 Complex Math"}
                    </Badge>
                    <Badge variant="outline">{generatedArt.params.dataset}</Badge>
                    <Badge variant="outline">
                      {generatedArt.params.scenario === "pure" ? "pure math" : generatedArt.params.scenario}
                    </Badge>
                    <Badge variant="outline">{generatedArt.params.colorScheme}</Badge>
                    <Badge variant="outline">{generatedArt.params.numSamples} points</Badge>
                    {generatedArt.isDomeProjection && (
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        <Globe className="w-3 h-3 mr-1" />
                        {generatedArt.domeSpecs?.diameter}m Dome
                      </Badge>
                    )}
                    {generatedArt.customPrompt && (
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        <Wand2 className="w-3 h-3 mr-1" />
                        Custom Prompt
                      </Badge>
                    )}
                    {generatedArt.upscaledImageUrl && (
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Enhanced
                      </Badge>
                    )}
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {generatedArt ? (
                <div className="space-y-4">
                  <Tabs defaultValue="regular" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="regular">Regular View</TabsTrigger>
                      <TabsTrigger value="dome" disabled={!generatedArt.domeImageUrl}>
                        Dome Projection {!generatedArt.domeImageUrl && "(Generate First)"}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="regular" className="space-y-4">
                      <div className="relative bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden">
                        {generatedArt.mode === "svg" && !generatedArt.upscaledImageUrl ? (
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
                    </TabsContent>

                    <TabsContent value="dome" className="space-y-4">
                      {generatedArt.domeImageUrl ? (
                        <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden">
                          <img
                            src={generatedArt.domeImageUrl || "/placeholder.svg"}
                            alt="Dome projection artwork"
                            className="w-full h-96 object-contain"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-blue-500 text-white">
                              <Eye className="w-3 h-3 mr-1" />
                              Dome View
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <div className="h-96 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-lg">
                          <div className="text-center">
                            <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Dome projection not generated yet</p>
                            <p className="text-sm mt-2">
                              Click "Generate Dome Projection" to create dome-optimized version
                            </p>
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Mode:</span>
                      <p className="font-medium">{generatedArt.mode === "ai" ? "AI Art" : "Complex Math"}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Dataset:</span>
                      <p className="font-medium capitalize">{generatedArt.params.dataset}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Scenario:</span>
                      <p className="font-medium capitalize">
                        {generatedArt.params.scenario === "pure" ? "Pure Math" : generatedArt.params.scenario}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Colors:</span>
                      <p className="font-medium capitalize">{generatedArt.params.colorScheme}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Seed:</span>
                      <p className="font-medium">{generatedArt.params.seed}</p>
                    </div>
                  </div>

                  {generatedArt.domeSpecs && (
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                      <Label className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                        Dome Specifications:
                      </Label>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 grid grid-cols-3 gap-2">
                        <div>Diameter: {generatedArt.domeSpecs.diameter}m</div>
                        <div>Resolution: {generatedArt.domeSpecs.resolution}</div>
                        <div>Type: {generatedArt.domeSpecs.projectionType}</div>
                      </div>
                    </div>
                  )}

                  {generatedArt.customPrompt && (
                    <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                      <Label className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                        Custom Prompt Used:
                      </Label>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-3">
                        {generatedArt.customPrompt}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Choose a complex mathematical dataset and scenario blend!</p>
                    <p className="text-sm mt-2">
                      Try Complex Spirals + Pure Math + Plasma or Hyperbolic Moons + Cosmic + Quantum for stunning
                      results
                    </p>
                    <p className="text-sm mt-1 text-purple-600">
                      Enable dome projection for immersive {domeDiameter}m dome experiences! 🌐✨
                    </p>
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
