"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Settings, ImageIcon, Calculator } from "lucide-react"
import { generateFlowField, generateDomeProjection as generateDomeSVG, type GenerationParams } from "@/lib/flow-model"
import { ClientUpscaler } from "@/lib/client-upscaler"
import { useToast } from "@/hooks/use-toast"

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
}

// Helper function to generate 360 panorama SVG
function generate360Panorama(params: GenerationParams): string {
  // This would generate a stereographic projection SVG
  // For now, return a basic SVG
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
  const [mode, setMode] = useState<"svg" | "ai">("ai") // Default to AI mode for realistic results

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

  // Generation parameters - restored original creative datasets and scenarios
  const [dataset, setDataset] = useState("spiral")
  const [scenario, setScenario] = useState("live-forest")
  const [colorScheme, setColorScheme] = useState("futuristic")
  const [seed, setSeed] = useState(Math.floor(Math.random() * 10000))
  const [numSamples, setNumSamples] = useState(4000)
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
          panoramic360: panorama360Enabled,
          panoramaResolution,
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
        description: panorama360Enabled
          ? "Mathematical concepts and stereographic projection details added to your prompt."
          : domeEnabled
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
    panorama360Enabled,
    panoramaResolution,
    stereographicPerspective,
    toast,
  ])

  const generate360Panorama = useCallback(async () => {
    if (!generatedArt) return

    setIsGenerating360(true)
    try {
      console.log("Generating 360° panorama...")

      const panoramaSpecs = {
        resolution: panoramaResolution,
        format: panoramaFormat,
      }

      // Generate 360° panorama version
      const panoramaParams = {
        ...generatedArt.params,
        panoramic360: true,
        panoramaResolution,
        panoramaFormat,
        stereographicPerspective,
      }

      let panorama360Url: string

      if (generatedArt.mode === "svg") {
        // Generate 360° panorama SVG
        const panoramaSvgContent = generate360Panorama(panoramaParams)
        const svgBlob = new Blob([panoramaSvgContent], { type: "image/svg+xml" })
        panorama360Url = URL.createObjectURL(svgBlob)
      } else {
        // Generate AI art optimized for 360° panorama
        const projectionType =
          panoramaFormat === "stereographic"
            ? stereographicPerspective === "tunnel"
              ? "stereographic tunnel projection looking up at buildings"
              : "stereographic little planet projection looking down"
            : "360 degree panoramic view, equirectangular projection"

        const response = await fetch("/api/generate-ai-art", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...panoramaParams,
            customPrompt: useCustomPrompt
              ? customPrompt + ` ${projectionType}, immersive environment, seamless wraparound`
              : undefined,
          }),
        })

        if (!response.ok) {
          throw new Error(`360° panorama AI generation failed: ${response.status}`)
        }

        const data = await response.json()
        panorama360Url = data.image
      }

      setGeneratedArt((prev) =>
        prev
          ? {
              ...prev,
              panorama360Url,
              is360Panorama: true,
              panoramaSpecs,
            }
          : null,
      )

      // Update gallery
      setGallery((prev) =>
        prev.map((art) =>
          art.id === generatedArt.id ? { ...art, panorama360Url, is360Panorama: true, panoramaSpecs } : art,
        ),
      )

      const formatDescription =
        panoramaFormat === "stereographic"
          ? `${stereographicPerspective} stereographic projection`
          : "equirectangular panorama"

      toast({
        title: "360° Panorama Generated! 🌐",
        description: `${panoramaResolution} ${formatDescription} ready for VR and immersive viewing.`,
      })
    } catch (error: any) {
      console.error("360° panorama generation error:", error)
      toast({
        title: "360° Panorama Generation Failed",
        description: error.message || "Failed to generate 360° panorama. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating360(false)
    }
  }, [generatedArt, panoramaResolution, panoramaFormat, stereographicPerspective, customPrompt, useCustomPrompt, toast])

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
        const domeSvgContent = generateDomeSVG(domeParams)
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
        // Convert SVG to data URL
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

        const formatText = panorama360Enabled
          ? panoramaFormat === "stereographic"
            ? `${stereographicPerspective} stereographic projection in ${panoramaResolution}`
            : `360° panorama in ${panoramaResolution}`
          : domeEnabled
            ? `${domeDiameter}m dome projection`
            : "standard format"

        toast({
          title: `${dataset.charAt(0).toUpperCase() + dataset.slice(1)} + ${scenario === "pure" ? "Pure Math" : scenario.charAt(0).toUpperCase() + scenario.slice(1)} Generated! 🎨`,
          description: `Complex ${dataset} dataset with ${scenario === "pure" ? "advanced mathematical" : scenario} visualization in ${formatText}.`,
        })
      } else {
        // Generate AI art
        setProgress(20)
        console.log("Calling AI art API...")

        const projectionDescription =
          panorama360Enabled && panoramaFormat === "stereographic"
            ? stereographicPerspective === "tunnel"
              ? " stereographic tunnel projection looking up at buildings, fisheye perspective"
              : " stereographic little planet projection looking down, tiny planet effect"
            : panorama360Enabled
              ? " 360 degree panoramic view, equirectangular projection, immersive skybox environment"
              : domeEnabled
                ? " optimized for dome projection, fisheye perspective, immersive 360-degree view"
                : ""

        const requestBody = {
          dataset,
          scenario,
          colorScheme,
          seed,
          numSamples,
          noise: noiseScale,
          customPrompt: useCustomPrompt ? customPrompt + projectionDescription : undefined,
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
          domeImageUrl: data.domeImage,
          panorama360Url: data.panoramaImage || data.image,
          params,
          mode: "ai" as const,
          customPrompt: useCustomPrompt ? customPrompt : undefined,
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
        const formatText = panorama360Enabled
          ? panoramaFormat === "stereographic"
            ? `${stereographicPerspective} stereographic projection in ${panoramaResolution}`
            : `360° panoramic skybox in ${panoramaResolution}`
          : domeEnabled
            ? `${domeDiameter}m dome projection`
            : `${colorScheme} palette`

        toast({
          title: "AI Art Generated! 🤖✨",
          description: panorama360Enabled
            ? `AI-enhanced ${dataset} + ${scenario === "pure" ? "pure mathematical" : scenario} ${formatText} created.`
            : domeEnabled
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
    panorama360Enabled,
    panoramaResolution,
    panoramaFormat,
    stereographicPerspective,
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
    async (format: "regular" | "dome" | "panorama" = "regular") => {
      if (!generatedArt) {
        console.log("No generated art to download")
        return
      }

      console.log("Download button clicked!", format)

      try {
        let imageUrl: string
        let fileExtension: string
        let fileName: string

        if (format === "dome") {
          // For dome downloads, ensure we have a dome image
          if (!generatedArt.domeImageUrl) {
            toast({
              title: "Dome Image Not Available",
              description: "Please generate the dome projection first.",
              variant: "destructive",
            })
            return
          }
          imageUrl = generatedArt.domeImageUrl
          fileExtension = "png"
          const domeSpec = generatedArt.domeSpecs
            ? `-${generatedArt.domeSpecs.diameter}m-${generatedArt.domeSpecs.resolution}`
            : ""
          fileName = `flowsketch-dome-${generatedArt.mode}-${generatedArt.params.dataset}-${generatedArt.params.scenario}-${generatedArt.params.colorScheme}-${generatedArt.params.seed}${domeSpec}.${fileExtension}`
        } else if (format === "panorama") {
          // For 360° panorama downloads
          if (!generatedArt.panorama360Url) {
            toast({
              title: "360° Panorama Not Available",
              description: "Please generate the 360° panorama first.",
              variant: "destructive",
            })
            return
          }
          imageUrl = generatedArt.panorama360Url
          fileExtension = "png"
          const panoramaSpec = generatedArt.panoramaSpecs
            ? `-${generatedArt.panoramaSpecs.resolution}-${generatedArt.panoramaSpecs.format}`
            : ""
          fileName = `flowsketch-360panorama-${generatedArt.mode}-${generatedArt.params.dataset}-${generatedArt.params.scenario}-${generatedArt.params.colorScheme}-${generatedArt.params.seed}${panoramaSpec}.${fileExtension}`
        } else {
          // For regular downloads
          imageUrl = generatedArt.upscaledImageUrl || generatedArt.imageUrl
          const isEnhanced = !!generatedArt.upscaledImageUrl
          fileExtension = generatedArt.mode === "svg" && !isEnhanced ? "svg" : "png"
          fileName = `flowsketch-${generatedArt.mode}-${generatedArt.params.dataset}-${generatedArt.params.scenario}-${generatedArt.params.colorScheme}-${generatedArt.params.seed}${isEnhanced ? "-enhanced" : ""}.${fileExtension}`
        }

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
          // For external URLs, create a proxy download to avoid CORS issues
          try {
            const proxyResponse = await fetch("/api/download-proxy", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ imageUrl, fileName }),
            })

            if (proxyResponse.ok) {
              const blob = await proxyResponse.blob()
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
              console.log("Proxy download completed")
            } else {
              throw new Error("Proxy download failed")
            }
          } catch (proxyError) {
            console.log("Proxy download failed, trying direct method...")
            // Fallback to direct download
            const link = document.createElement("a")
            link.href = imageUrl
            link.download = fileName
            link.target = "_blank"
            link.style.display = "none"
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            console.log("Direct link download attempted")
          }
        }

        toast({
          title: "Download Complete! 🎨",
          description:
            format === "panorama"
              ? `360° panoramic skybox in ${generatedArt.panoramaSpecs?.resolution} downloaded.`
              : format === "dome"
                ? `Dome projection for ${generatedArt.domeSpecs?.diameter}m dome downloaded.`
                : `${generatedArt.upscaledImageUrl ? "Enhanced" : "Original"} ${generatedArt.params.dataset} + ${generatedArt.params.scenario === "pure" ? "pure math" : generatedArt.params.scenario} in ${generatedArt.params.colorScheme} colors downloaded.`,
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
      if (art.panoramaSpecs) {
        setPanorama360Enabled(true)
        setPanoramaResolution(art.panoramaSpecs.resolution)
        setPanoramaFormat(art.panoramaSpecs.format)
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
    const formatText = panorama360Enabled
      ? panoramaFormat === "stereographic"
        ? ` ${stereographicPerspective === "tunnel" ? "Tunnel" : "Little Planet"} Projection`
        : ` 360° Skybox`
      : domeEnabled
        ? ` for ${domeDiameter}m Dome`
        : ""

    if (mode === "ai") {
      if (useCustomPrompt) {
        return `Generate Custom AI Art${formatText}`
      }
      return `Generate AI ${dataset.charAt(0).toUpperCase() + dataset.slice(1)} + ${scenarioText}${formatText}`
    } else {
      return `Generate ${dataset.charAt(0).toUpperCase() + dataset.slice(1)} + ${scenarioText}${formatText}`
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
          FlowSketch Mathematical Art Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Creative mathematical datasets with immersive scenarios - from live forests with fairies to neural networks
          with heads
        </p>
      </div>

      {/* Reference Images */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Reference Styles - Stereographic Projections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <img
                src="/reference-little-planet.jpg"
                alt="Little planet projection showing urban landscape with buildings and park"
                className="w-full max-w-sm mx-auto rounded-lg shadow-lg"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                <strong>Little Planet:</strong> Looking down perspective with landscape in center
              </p>
            </div>
            <div className="text-center">
              <img
                src="/reference-tunnel-projection.jpg"
                alt="Tunnel projection showing buildings curving around sky center"
                className="w-full max-w-sm mx-auto rounded-lg shadow-lg"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                <strong>Tunnel:</strong> Looking up perspective with sky in center, buildings around edge
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
            Target styles: Photorealistic stereographic projections with realistic textures, lighting, and dramatic
            perspectives
          </p>
        </CardContent>
      </Card>

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
                  <TabsTrigger value="ai">Photorealistic AI</TabsTrigger>
                  <TabsTrigger value="svg">Mathematical SVG</TabsTrigger>
                  <TabsTrigger value="gallery">Gallery ({gallery.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="ai" className="space-y-4">
                  <Alert>
                    <Sparkles className="h-4 w-4" />
                    <AlertDescription>
                      Create photorealistic AI-generated artwork with realistic textures, lighting, and environments.
                      Perfect for creating immersive stereographic projections like the reference images above.
                      {panorama360Enabled && " Automatically optimized for immersive stereographic projections."}
                      {domeEnabled && " Automatically optimized for immersive dome projection."}
                    </AlertDescription>
                  </Alert>
                </TabsContent>

                <TabsContent value="svg" className="space-y-4">
                  <Alert>
                    <Calculator className="h-4 w-4" />
                    <AlertDescription>
                      Creative mathematical datasets: spirals, checkerboards, neural networks, and more combined with
                      immersive scenarios like live forests with fairies and butterflies!{" "}
                      {panorama360Enabled && "Optimized for stereographic projections."}
                      {domeEnabled && "Optimized for dome projection."}
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
                                  className="w-full min-h-[600px] flex items-center justify-center bg-gray-50 dark:bg-gray-900"
                                  dangerouslySetInnerHTML={{ __html: art.svgContent }}
                                />
                              ) : (
                                <img
                                  src={art.upscaledImageUrl || art.imageUrl}
                                  alt={`${art.params.dataset} + ${art.params.scenario}`}
                                  className="w-full h-auto max-h-[800px] object-contain"
                                  onClick={() => loadFromGallery(art)}
                                />
                              )}

                              {/* Hover overlay with Load / Remove buttons */}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                <Button size="sm" variant="secondary" onClick={() => loadFromGallery(art)}>
                                  Load
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => removeFromGallery(art.id)}>
                                  Remove
                                </Button>
                              </div>
                            </div>

                            {/* Minimal caption under each thumbnail */}
                            <div className="p-2 space-y-1">
                              <p className="text-xs font-medium truncate">
                                {art.params.dataset} • {art.params.scenario}
                              </p>
                              <div className="flex gap-1 flex-wrap">
                                {art.mode === "ai" && (
                                  <span className="text-[10px] px-1 rounded bg-green-600/20 text-green-700 dark:text-green-300">
                                    AI
                                  </span>
                                )}
                                {art.isDomeProjection && (
                                  <span className="text-[10px] px-1 rounded bg-purple-600/20 text-purple-700 dark:text-purple-300">
                                    Dome
                                  </span>
                                )}
                                {art.is360Panorama && (
                                  <span className="text-[10px] px-1 rounded bg-blue-600/20 text-blue-700 dark:text-blue-300">
                                    360°
                                  </span>
                                )}
                                {art.upscaledImageUrl && (
                                  <span className="text-[10px] px-1 rounded bg-orange-600/20 text-orange-700 dark:text-orange-300">
                                    Enhanced
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

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
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No saved artworks yet.</p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Creative Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dataset</label>
                  <select
                    value={dataset}
                    onChange={(e) => setDataset(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="spiral">Spiral Patterns</option>
                    <option value="checkerboard">Checkerboard Grid</option>
                    <option value="neural">Neural Networks</option>
                    <option value="fractal">Fractal Trees</option>
                    <option value="wave">Wave Functions</option>
                    <option value="particle">Particle Systems</option>
                    <option value="mandala">Sacred Geometry</option>
                    <option value="crystal">Crystal Lattice</option>
                    <option value="flow">Flow Fields</option>
                    <option value="noise">Perlin Noise</option>
                    <option value="cellular">Cellular Automata</option>
                    <option value="attractor">Strange Attractors</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Scenario</label>
                  <select
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="live-forest">Live Forest (Fairies, Butterflies, Trees)</option>
                    <option value="heads">Heads (Crazy Head Patterns)</option>
                    <option value="underwater">Underwater World (Fish, Coral, Bubbles)</option>
                    <option value="space">Space Odyssey (Stars, Planets, Nebulae)</option>
                    <option value="cyberpunk">Cyberpunk City (Neon, Holograms, Tech)</option>
                    <option value="dreamscape">Dreamscape (Surreal, Floating Objects)</option>
                    <option value="tribal">Tribal Patterns (Ancient Symbols, Totems)</option>
                    <option value="steampunk">Steampunk (Gears, Steam, Victorian)</option>
                    <option value="bioluminescent">Bioluminescent (Glowing Life Forms)</option>
                    <option value="crystalline">Crystal Caves (Gems, Minerals, Light)</option>
                    <option value="volcanic">Volcanic (Lava, Fire, Molten Rock)</option>
                    <option value="arctic">Arctic Tundra (Ice, Snow, Aurora)</option>
                    <option value="desert">Desert Oasis (Sand, Cacti, Mirages)</option>
                    <option value="jungle">Jungle Temple (Vines, Ruins, Wildlife)</option>
                    <option value="pure">Pure Mathematics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Color Scheme</label>
                  <select
                    value={colorScheme}
                    onChange={(e) => setColorScheme(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Seed</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={seed}
                      onChange={(e) => setSeed(Number.parseInt(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <Button type="button" onClick={handleRandomSeed} variant="outline" size="sm">
                      Random
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Number of Samples
                  </label>
                  <input
                    type="number"
                    value={numSamples}
                    onChange={(e) => setNumSamples(Number.parseInt(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Noise Scale</label>
                  <input
                    type="number"
                    step="0.01"
                    value={noiseScale}
                    onChange={(e) => setNoiseScale(Number.parseFloat(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time Step</label>
                  <input
                    type="number"
                    step="0.001"
                    value={timeStep}
                    onChange={(e) => setTimeStep(Number.parseFloat(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generated Art Display */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Generated Artwork
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Button onClick={generateArt} disabled={isGenerating} className="flex-1">
                    {isGenerating ? `Generating... ${progress}%` : getButtonText()}
                  </Button>
                </div>

                {mode === "ai" && (
                  <div className="space-y-2">
                    <label className="inline-flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-offset-gray-800"
                        checked={useCustomPrompt}
                        onChange={(e) => setUseCustomPrompt(e.target.checked)}
                      />
                      <span className="text-gray-700 dark:text-gray-300">Use Custom Prompt</span>
                    </label>

                    {useCustomPrompt && (
                      <div className="space-y-2">
                        <textarea
                          placeholder="Enter your custom prompt here... (e.g., 'A photorealistic live forest with magical fairies dancing around spiral patterns, butterflies with fractal wings')"
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          rows={3}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <Button onClick={enhancePrompt} disabled={isEnhancingPrompt} variant="secondary" size="sm">
                          {isEnhancingPrompt ? "Enhancing..." : "✨ Enhance Prompt"}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="inline-flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-offset-gray-800"
                        checked={domeEnabled}
                        onChange={(e) => setDomeEnabled(e.target.checked)}
                      />
                      <span className="text-gray-700 dark:text-gray-300">Dome Projection</span>
                    </label>

                    {domeEnabled && (
                      <div className="space-y-2 mt-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Dome Diameter (meters)
                        </label>
                        <input
                          type="number"
                          value={domeDiameter}
                          onChange={(e) => setDomeDiameter(Number.parseInt(e.target.value))}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />

                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Dome Resolution
                        </label>
                        <select
                          value={domeResolution}
                          onChange={(e) => setDomeResolution(e.target.value)}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option>1080p</option>
                          <option>1440p</option>
                          <option>2160p</option>
                        </select>

                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Projection Type
                        </label>
                        <select
                          value={domeProjectionType}
                          onChange={(e) => setDomeProjectionType(e.target.value)}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="fulldome">Full Dome (Fisheye)</option>
                          <option value="truncated">Truncated Dome</option>
                          <option value="perspective">Perspective</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="inline-flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-offset-gray-800"
                        checked={panorama360Enabled}
                        onChange={(e) => setPanorama360Enabled(e.target.checked)}
                      />
                      <span className="text-gray-700 dark:text-gray-300">Stereographic Projection</span>
                    </label>

                    {panorama360Enabled && (
                      <div className="space-y-2 mt-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Resolution</label>
                        <select
                          value={panoramaResolution}
                          onChange={(e) => setPanoramaResolution(e.target.value)}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option>1080p</option>
                          <option>1440p</option>
                          <option>2160p</option>
                        </select>

                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Projection Format
                        </label>
                        <select
                          value={panoramaFormat}
                          onChange={(e) => setPanoramaFormat(e.target.value)}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="stereographic">Stereographic</option>
                          <option value="equirectangular">Equirectangular</option>
                        </select>

                        {panoramaFormat === "stereographic" && (
                          <>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Perspective
                            </label>
                            <select
                              value={stereographicPerspective}
                              onChange={(e) => setStereographicPerspective(e.target.value)}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                              <option value="little-planet">Little Planet (Looking Down)</option>
                              <option value="tunnel">Tunnel (Looking Up)</option>
                            </select>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {generatedArt ? (
                  <div className="space-y-4">
                    <div className="relative overflow-hidden rounded-lg border">
                      {generatedArt.mode === "svg" && !generatedArt.upscaledImageUrl ? (
                        <div
                          className="w-full min-h-[600px] flex items-center justify-center bg-gray-50 dark:bg-gray-900"
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
                      <Button onClick={upscaleImage} disabled={isUpscaling} variant="outline">
                        {isUpscaling ? "Enhancing..." : "🔍 Enhance Details"}
                      </Button>

                      <Button onClick={() => downloadImage("regular")}>📥 Download</Button>

                      {generatedArt.isDomeProjection && generatedArt.domeImageUrl && (
                        <Button onClick={() => downloadImage("dome")} variant="secondary">
                          🏛️ Download Dome
                        </Button>
                      )}

                      {generatedArt.is360Panorama && generatedArt.panorama360Url && (
                        <Button onClick={() => downloadImage("panorama")} variant="secondary">
                          🌐 Download Projection
                        </Button>
                      )}

                      {generatedArt.isDomeProjection && !generatedArt.domeImageUrl && (
                        <Button onClick={generateDomeProjection} disabled={isGeneratingDome} variant="outline">
                          {isGeneratingDome ? "Generating..." : "🏛️ Generate Dome"}
                        </Button>
                      )}

                      {generatedArt.is360Panorama && !generatedArt.panorama360Url && (
                        <Button onClick={generate360Panorama} disabled={isGenerating360} variant="outline">
                          {isGenerating360 ? "Generating..." : "🌐 Generate Projection"}
                        </Button>
                      )}
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p>
                        <strong>Mode:</strong> {generatedArt.mode === "ai" ? "Photorealistic AI" : "Mathematical SVG"}
                      </p>
                      <p>
                        <strong>Dataset:</strong> {generatedArt.params.dataset} • <strong>Scenario:</strong>{" "}
                        {generatedArt.params.scenario}
                      </p>
                      <p>
                        <strong>Color Scheme:</strong> {generatedArt.params.colorScheme} • <strong>Seed:</strong>{" "}
                        {generatedArt.params.seed}
                      </p>
                      {generatedArt.customPrompt && (
                        <p>
                          <strong>Custom Prompt:</strong> {generatedArt.customPrompt}
                        </p>
                      )}
                      {generatedArt.panoramaSpecs && generatedArt.panoramaSpecs.format === "stereographic" && (
                        <p>
                          <strong>Projection:</strong>{" "}
                          {stereographicPerspective === "tunnel"
                            ? "Tunnel (Looking Up)"
                            : "Little Planet (Looking Down)"}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Generate creative artwork to see it here.</p>
                    <p className="text-sm mt-2">
                      Try "Neural Networks" + "Live Forest" for magical AI-generated forests with neural patterns and
                      fairies!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
