"use client"

import { useState, useCallback, useEffect, useRef } from "react"
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Download, Sparkles, Settings, ImageIcon, Info, Loader2, Wand2, Edit3, Calculator } from "lucide-react"
import {
  generateFlowArtData,
  DATASETS,
  SCENARIOS,
  COLOR_SCHEMES,
  DEFAULT_FLOW_PARAMETERS,
  type GenerationParams,
  type GalleryItem,
} from "@/lib/flow-model"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { drawFlowArt, downloadImage } from "@/lib/plot-utils"
import { supabase } from "@/lib/supabase"
import Image from "next/image"
import type { GeneratedArt } from "@/types/generated-art" // Declare the GeneratedArt variable

export default function FlowArtGenerator() {
  const [generatedArt, setGeneratedArt] = useState<GeneratedArt | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUpscaling, setIsUpscaling] = useState(false)
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false)
  const [progress, setProgress] = useState(0)
  const [mode, setMode] = useState<"svg" | "ai">("svg")

  // Gallery state
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const { toast } = useToast() // Initialize toast after its declaration

  // Load gallery from Supabase on mount
  const fetchGalleryItems = useCallback(async () => {
    if (!supabase) {
      console.warn("Supabase client not initialized. Cannot fetch gallery items.")
      return
    }
    try {
      const { data, error } = await supabase.from("gallery_items").select("*").order("created_at", { ascending: false })
      if (error) throw error
      setGallery(data as GalleryItem[])
    } catch (error: any) {
      console.error("Error fetching gallery items:", error)
      toast({
        title: "Gallery Load Failed",
        description: error.message || "Could not load gallery items.",
        variant: "destructive",
      })
    }
  }, [toast])

  useEffect(() => {
    fetchGalleryItems()
  }, [fetchGalleryItems])

  // Save gallery to Supabase whenever new art is generated and saved
  const saveToGallery = useCallback(
    async (art: GeneratedArt) => {
      if (!supabase) {
        toast({
          title: "Supabase Not Configured",
          description:
            "Gallery features are disabled. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
          variant: "destructive",
        })
        return
      }

      try {
        // Convert data URL to Blob for Supabase storage
        const response = await fetch(art.imageUrl)
        const blob = await response.blob()

        const fileExtension = art.imageUrl.split(";")[0].split("/")[1] || "png"
        const fileName = `flowsketch-art-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExtension}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("gallery-images")
          .upload(fileName, blob, {
            cacheControl: "3600",
            upsert: false,
            contentType: blob.type,
          })

        if (uploadError) throw uploadError

        const publicUrl = supabase.storage.from("gallery-images").getPublicUrl(fileName).data.publicUrl

        const { error: insertError } = await supabase.from("gallery_items").insert({
          image_url: publicUrl,
          prompt: art.customPrompt || `${art.params.dataset} + ${art.params.scenario} in ${art.params.colorScheme}`,
          parameters: art.params,
          ai_enhanced_prompt: art.customPrompt,
        })

        if (insertError) throw insertError

        toast({
          title: "Saved to Gallery!",
          description: "Your art has been successfully saved.",
        })
        fetchGalleryItems() // Refresh gallery after saving
      } catch (error: any) {
        console.error("Error saving to gallery:", error)
        toast({
          title: "Save Failed",
          description: error.message || "Could not save art to gallery.",
          variant: "destructive",
        })
      }
    },
    [toast, fetchGalleryItems],
  )

  // Generation parameters - separate dataset, scenario, and color palette
  const [dataset, setDataset] = useState(DEFAULT_FLOW_PARAMETERS.dataset)
  const [scenario, setScenario] = useState(DEFAULT_FLOW_PARAMETERS.scenario)
  const [colorScheme, setColorScheme] = useState(DEFAULT_FLOW_PARAMETERS.colorScheme)
  const [seed, setSeed] = useState(DEFAULT_FLOW_PARAMETERS.seed)
  const [numSamples, setNumSamples] = useState(DEFAULT_FLOW_PARAMETERS.samples)
  const [noiseScale, setNoiseScale] = useState(DEFAULT_FLOW_PARAMETERS.noise)
  const [timeStep, setTimeStep] = useState(0.01) // This was not in DEFAULT_FLOW_PARAMETERS, keeping default

  // Stereographic projection settings
  const [enableStereographic, setEnableStereographic] = useState(DEFAULT_FLOW_PARAMETERS.stereographic)
  const [stereographicPerspective, setStereographicPerspective] = useState("little-planet")

  // AI Art prompt enhancement
  const [customPrompt, setCustomPrompt] = useState("")
  const [useCustomPrompt, setUseCustomPrompt] = useState(false)

  // Calculate pagination
  const totalPages = Math.ceil(gallery.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = gallery.slice(startIndex, endIndex)

  const enhancePrompt = useCallback(async () => {
    setIsEnhancingPrompt(true)

    try {
      console.log("Enhancing prompt for:", {
        dataset,
        scenario,
        colorScheme,
        numSamples,
        noiseScale,
        enableStereographic,
        stereographicPerspective,
      })

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
          enableStereographic,
          stereographicPerspective,
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
        description: `Mathematical concepts and artistic details added${enableStereographic ? ` with ${stereographicPerspective} effects` : ""}.`,
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
    enableStereographic,
    stereographicPerspective,
    toast,
  ])

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
        noise: noiseScale, // Renamed from noiseScale to noise in FlowParameters
        stereographic: enableStereographic, // Renamed from enableStereographic to stereographic
        stereographicPerspective,
      }

      console.log("Generating with params:", params)

      if (mode === "svg") {
        // Generate SVG flow field
        setProgress(30)
        console.log("Generating SVG content...")

        const artData = generateFlowArtData(params)
        const canvas = canvasRef.current
        if (!canvas) throw new Error("Canvas not available")

        drawFlowArt(canvas, artData, params.colorScheme, params.stereographic)
        const imageUrl = canvas.toDataURL("image/png")

        console.log("SVG generated, length:", imageUrl.length)

        setProgress(60)

        setProgress(100)
        const newArt: GeneratedArt = {
          svgContent: "", // We are using canvas for rendering, so SVG content is not directly stored here
          imageUrl,
          params,
          mode: "svg" as const,
          timestamp: Date.now(),
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        }
        setGeneratedArt(newArt)
        saveToGallery(newArt) // Save to Supabase gallery

        const projectionText = enableStereographic
          ? ` (${stereographicPerspective === "little-planet" ? "Little Planet" : "Tunnel Vision"})`
          : ""
        toast({
          title: `${dataset.charAt(0).toUpperCase() + dataset.slice(1)} + ${scenario === "pure" ? "Pure Math" : scenario.charAt(0).toUpperCase() + scenario.slice(1)} Generated! 🎨`,
          description: `Complex ${dataset} dataset with ${scenario === "pure" ? "advanced mathematical" : scenario} ${scenario === "pure" ? "visualization" : "scenario blend"} in ${colorScheme} colors${projectionText}.`,
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
          customPrompt: useCustomPrompt ? customPrompt : undefined,
          enableStereographic,
          stereographicPerspective,
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

        if (!data.imageUrl) {
          throw new Error("AI API returned no image")
        }

        setProgress(80)
        const newArt: GeneratedArt = {
          svgContent: "",
          imageUrl: data.imageUrl,
          params,
          mode: "ai" as const,
          customPrompt: useCustomPrompt ? customPrompt : undefined,
          timestamp: Date.now(),
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        }
        setGeneratedArt(newArt)
        saveToGallery(newArt) // Save to Supabase gallery

        setProgress(100)
        const projectionText = enableStereographic
          ? ` with ${stereographicPerspective === "little-planet" ? "Little Planet" : "Tunnel Vision"} effects`
          : ""
        toast({
          title: "AI Art Generated! 🤖✨",
          description: useCustomPrompt
            ? `Custom enhanced prompt artwork created${projectionText}!`
            : `AI-enhanced ${dataset} + ${scenario === "pure" ? "pure mathematical" : scenario} artwork in ${colorScheme} palette${projectionText}.`,
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
    toast,
    enableStereographic,
    stereographicPerspective,
    saveToGallery,
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

        // Regenerate with higher samples for mathematical upscaling
        const upscaledParams = {
          ...generatedArt.params,
          samples: generatedArt.params.samples * 4, // 4x more samples for higher detail
        }
        const artData = generateFlowArtData(upscaledParams)
        const canvas = canvasRef.current
        if (!canvas) throw new Error("Canvas not available")

        // Temporarily resize canvas for higher resolution rendering
        const originalWidth = canvas.width
        const originalHeight = canvas.height
        canvas.width = originalWidth * 2 // Render at 2x resolution
        canvas.height = originalHeight * 2

        drawFlowArt(canvas, artData, upscaledParams.colorScheme, upscaledParams.stereographic)
        const upscaledDataUrl = canvas.toDataURL("image/png")

        // Restore original canvas size
        canvas.width = originalWidth
        canvas.height = originalHeight

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
        // For AI art, use server-side upscaling (Replicate)
        console.log("Using server-side upscaling for AI art...")
        toast({
          title: "AI Art Enhancement",
          description: "Sending AI artwork to server for advanced pixel enhancement...",
        })

        const response = await fetch("/api/upscale-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: generatedArt.imageUrl }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("Upscale API error response:", errorText)
          throw new Error(`Upscale API failed: ${response.status} - ${errorText}`)
        }

        const data = await response.json()
        if (!data.upscaledUrl) {
          throw new Error("Upscale API returned no image")
        }

        setGeneratedArt((prev) =>
          prev
            ? {
                ...prev,
                upscaledImageUrl: data.upscaledUrl,
                upscaleMethod: "cloudinary", // Assuming Cloudinary or similar service is used by the API
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
        description: error.message || "Enhancement failed. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpscaling(false)
    }
  }, [generatedArt, toast])

  const downloadGeneratedImage = useCallback(async () => {
    if (!generatedArt) {
      console.log("No generated art to download")
      return
    }

    console.log("Download button clicked!")

    try {
      const imageUrl = generatedArt.upscaledImageUrl || generatedArt.imageUrl
      const isEnhanced = !!generatedArt.upscaledImageUrl
      const fileExtension = generatedArt.mode === "svg" && !isEnhanced ? "svg" : "png"
      const projectionSuffix = generatedArt.params.stereographic
        ? `-${generatedArt.params.stereographicPerspective}`
        : ""
      const fileName = `flowsketch-${generatedArt.mode}-${generatedArt.params.dataset}-${generatedArt.params.scenario}-${generatedArt.params.colorScheme}-${generatedArt.params.seed}${projectionSuffix}${isEnhanced ? "-enhanced" : ""}.${fileExtension}`

      console.log("Downloading:", fileName, "from:", imageUrl)

      // Use the utility function for downloading
      await downloadImage(imageUrl, fileName)

      const projectionText = generatedArt.params.stereographic
        ? ` (${generatedArt.params.stereographicPerspective === "little-planet" ? "Little Planet" : "Tunnel Vision"})`
        : ""
      toast({
        title: "Download Complete! 🎨",
        description: `${isEnhanced ? "Enhanced" : "Original"} ${generatedArt.params.dataset} + ${generatedArt.params.scenario === "pure" ? "pure math" : generatedArt.params.scenario} in ${generatedArt.params.colorScheme} colors${projectionText} downloaded.`,
      })
    } catch (error: any) {
      console.error("Download error:", error)
      toast({
        title: "Download Failed",
        description: "Could not download the image. Please try right-clicking and saving the image.",
        variant: "destructive",
      })
    }
  }, [generatedArt, toast])

  const handleRandomSeed = useCallback(() => {
    const newSeed = Math.floor(Math.random() * 10000)
    console.log("Random seed clicked, new seed:", newSeed)
    setSeed(newSeed)
  }, [])

  const clearGallery = useCallback(async () => {
    if (!supabase) {
      toast({
        title: "Supabase Not Configured",
        description: "Gallery features are disabled. Cannot clear gallery.",
        variant: "destructive",
      })
      return
    }
    try {
      // Delete all items from the database
      const { error: deleteError } = await supabase
        .from("gallery_items")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000") // Delete all rows

      if (deleteError) throw deleteError

      // Also delete all files from storage bucket
      const { data: listData, error: listError } = await supabase.storage.from("gallery-images").list()
      if (listError) throw listError

      const filesToRemove = listData.map((file) => file.name)
      if (filesToRemove.length > 0) {
        const { error: removeError } = await supabase.storage.from("gallery-images").remove(filesToRemove)
        if (removeError) throw removeError
      }

      setGallery([])
      setCurrentPage(1)
      toast({
        title: "Gallery Cleared",
        description: "All saved artworks have been removed.",
      })
    } catch (error: any) {
      console.error("Error clearing gallery:", error)
      toast({
        title: "Clear Gallery Failed",
        description: error.message || "Could not clear gallery. Please try again.",
        variant: "destructive",
      })
    }
  }, [toast])

  const removeFromGallery = useCallback(
    async (id: string, imageUrl: string) => {
      if (!supabase) {
        toast({
          title: "Supabase Not Configured",
          description: "Gallery features are disabled. Cannot remove artwork.",
          variant: "destructive",
        })
        return
      }
      try {
        // Extract file path from public URL
        const filePath = imageUrl.split("/gallery-images/")[1]

        const { error: storageError } = await supabase.storage.from("gallery-images").remove([filePath])
        if (storageError) throw storageError

        const { error: dbError } = await supabase.from("gallery_items").delete().eq("id", id)
        if (dbError) throw dbError

        setGallery((prev) => prev.filter((art) => art.id !== id))
        toast({
          title: "Artwork Removed",
          description: "Artwork removed from gallery.",
        })
      } catch (error: any) {
        console.error("Error removing from gallery:", error)
        toast({
          title: "Removal Failed",
          description: error.message || "Could not remove artwork. Please try again.",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  const loadFromGallery = useCallback(
    (art: GalleryItem) => {
      // Convert GalleryItem to GeneratedArt for display
      const loadedArt: GeneratedArt = {
        svgContent: "", // Not directly stored for loaded items
        imageUrl: art.image_url,
        params: art.parameters,
        mode: art.ai_enhanced_prompt ? "ai" : "svg", // Infer mode based on prompt presence
        customPrompt: art.ai_enhanced_prompt || art.prompt,
        timestamp: new Date(art.created_at).getTime(),
        id: art.id,
      }
      setGeneratedArt(loadedArt)
      setDataset(art.parameters.dataset)
      setScenario(art.parameters.scenario)
      setColorScheme(art.parameters.colorScheme)
      setSeed(art.parameters.seed)
      setNumSamples(art.parameters.samples)
      setNoiseScale(art.parameters.noise)
      setEnableStereographic(art.parameters.stereographic || false)
      setStereographicPerspective(art.parameters.stereographicPerspective || "little-planet")
      setCustomPrompt(art.ai_enhanced_prompt || art.prompt || "")
      setUseCustomPrompt(!!art.ai_enhanced_prompt || !!art.prompt)
      setMode(art.ai_enhanced_prompt ? "ai" : "svg")
      toast({
        title: "Artwork Loaded",
        description: "Settings restored from gallery artwork.",
      })
    },
    [toast],
  )

  const getButtonText = () => {
    const scenarioText = scenario === "pure" ? "Pure Math" : scenario.charAt(0).toUpperCase() + scenario.slice(1)
    const projectionText = enableStereographic
      ? ` (${stereographicPerspective === "little-planet" ? "Little Planet" : "Tunnel"})`
      : ""

    if (mode === "ai") {
      if (useCustomPrompt) {
        return `Generate Custom AI Art${projectionText}`
      }
      return `Generate AI ${dataset.charAt(0).toUpperCase() + dataset.slice(1)} + ${scenarioText}${projectionText}`
    } else {
      return `Generate ${dataset.charAt(0).toUpperCase() + dataset.slice(1)} + ${scenarioText}${projectionText}`
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
          FlowSketch Complex Mathematical Art Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Advanced mathematical datasets with scenario blending for stunning visual results
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
                      hyperbolic moons, multi-modal Gaussians, and more!
                    </AlertDescription>
                  </Alert>
                </TabsContent>

                <TabsContent value="ai" className="space-y-4">
                  <Alert>
                    <Sparkles className="h-4 w-4" />
                    <AlertDescription>
                      Create AI-generated artwork based on your complex mathematical dataset and scenario combination.
                      Use prompt enhancement for professional results!
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
                              {/* Use Image component for optimized loading */}
                              <Image
                                src={art.image_url || "/placeholder.svg"}
                                alt={`${art.parameters.dataset} + ${art.parameters.scenario}`}
                                layout="fill"
                                objectFit="cover"
                                className="cursor-pointer"
                                onClick={() => loadFromGallery(art)}
                              />

                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                                  <Button size="sm" variant="secondary" onClick={() => loadFromGallery(art)}>
                                    Load
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => removeFromGallery(art.id, art.image_url)}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <div className="p-2 space-y-1">
                              <div className="flex gap-1 flex-wrap">
                                <Badge variant={art.ai_enhanced_prompt ? "default" : "outline"}>
                                  {art.ai_enhanced_prompt ? "🤖 AI Art" : "📊 Complex Math"}
                                </Badge>
                                <Badge variant="outline">{art.parameters.dataset}</Badge>
                                <Badge variant="outline">
                                  {art.parameters.scenario === "pure" ? "pure math" : art.parameters.scenario}
                                </Badge>
                                <Badge variant="outline">{art.parameters.colorScheme}</Badge>
                                <Badge variant="outline">{art.parameters.samples} points</Badge>
                                {art.parameters.stereographic && (
                                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                    {art.parameters.stereographicPerspective === "little-planet"
                                      ? "🪐 Little Planet"
                                      : "🕳️ Tunnel Vision"}
                                  </Badge>
                                )}
                                {art.ai_enhanced_prompt && (
                                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                    <Wand2 className="w-3 h-3 mr-1" />
                                    Custom Prompt
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {art.parameters.scenario} • {art.parameters.colorScheme}
                              </p>
                              <p className="text-xs text-gray-500">{new Date(art.created_at).toLocaleDateString()}</p>
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
                      <p className="text-sm mt-1 text-purple-600">
                        Switch to AI Art tab and use prompt enhancement for professional AI artwork! 🤖✨
                      </p>
                      <p className="text-sm mt-1 text-blue-600">
                        Enable Stereographic Projection for social media-ready "Little Planet" or "Tunnel Vision"
                        effects! 🌍
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="space-y-2">
                <Label>Mathematical Dataset</Label>
                <Select value={dataset} onValueChange={setDataset}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DATASETS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
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
                    {SCENARIOS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
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
                    {COLOR_SCHEMES.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold flex items-center gap-2">🌍 Stereographic Projection</Label>
                  <Switch checked={enableStereographic} onCheckedChange={setEnableStereographic} />
                </div>

                {enableStereographic && (
                  <div className="space-y-2">
                    <Label>Projection Style</Label>
                    <Select value={stereographicPerspective} onValueChange={setStereographicPerspective}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="little-planet">🪐 Little Planet (Looking Down)</SelectItem>
                        <SelectItem value="tunnel">🕳️ Tunnel Vision (Looking Up)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {enableStereographic && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Stereographic projection creates artistic "little planet" or "tunnel" effects perfect for social
                      media.
                      {stereographicPerspective === "little-planet"
                        ? " Little Planet shows the world as if viewed from above a tiny sphere."
                        : " Tunnel Vision creates a dramatic inward-looking perspective effect."}
                    </AlertDescription>
                  </Alert>
                )}
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
                    placeholder="Click 'Enhance' to generate a complex mathematical AI art prompt, or write your own custom prompt here..."
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
                      {enableStereographic && (
                        <Badge variant="outline" className="text-xs">
                          {stereographicPerspective === "little-planet" ? "🪐" : "🕳️"}{" "}
                          {stereographicPerspective === "little-planet" ? "Little Planet" : "Tunnel"}
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
                    {mode === "ai" ? <Sparkles className="h-4 w-4 mr-2" /> : <Calculator className="h-4 w-4 mr-2" />}
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
                        : progress < 90
                          ? "Rendering complex visualization..."
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
                <Button onClick={downloadGeneratedImage} variant="outline" className="w-full bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Download {generatedArt.upscaledImageUrl ? "Enhanced" : "Original"}
                </Button>

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
                    <Badge variant="outline">{generatedArt.params.samples} points</Badge>
                    {generatedArt.params.stereographic && (
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {generatedArt.params.stereographicPerspective === "little-planet"
                          ? "🪐 Little Planet"
                          : "🕳️ Tunnel Vision"}
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
                  <div className="relative bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden">
                    {generatedArt.mode === "svg" ? (
                      <canvas
                        ref={canvasRef}
                        width={512} // Default canvas size for display
                        height={512}
                        className="w-full h-96 object-contain"
                      />
                    ) : (
                      <img
                        src={generatedArt.upscaledImageUrl || generatedArt.imageUrl}
                        alt="Generated artwork"
                        className="w-full h-96 object-contain"
                      />
                    )}
                  </div>

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

                  {generatedArt.params.stereographic && (
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                      <Label className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                        Stereographic Projection:
                      </Label>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {generatedArt.params.stereographicPerspective === "little-planet"
                          ? "🪐 Little Planet - Spherical world view from above, perfect for social media"
                          : "🕳️ Tunnel Vision - Dramatic inward perspective with vanishing point effects"}
                      </p>
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
                      Try Complex Spirals + Pure Math + Plasma or Hyperbolic Moons + Cosmic + Futuristic for stunning
                      results
                    </p>
                    <p className="text-sm mt-1 text-purple-600">
                      Switch to AI Art tab and use prompt enhancement for professional AI artwork! 🤖✨
                    </p>
                    <p className="text-sm mt-1 text-blue-600">
                      Enable Stereographic Projection for social media-ready "Little Planet" or "Tunnel Vision" effects!
                      🌍
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
