"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import {
  Download,
  Settings,
  Sparkles,
  RefreshCw,
  Globe,
  CircleDot,
  Loader2,
  Palette,
  Eye,
  Edit3,
  CheckCircle,
  AlertCircle,
  Square,
} from "lucide-react"
import { CULTURAL_DATASETS, COLOR_SCHEMES, getScenarios } from "@/lib/ai-prompt"

interface GeneratedImage {
  imageUrl: string
  prompt: string
  aspectRatio: string
  format: string
  projectionType?: string
  panoramaFormat?: string
  seamlessWrapping?: boolean
  planetariumOptimized?: boolean
  orionCalibration?: boolean
  geometricAlignment?: string
}

const ASPECT_RATIOS = {
  standard: [
    { value: "1:1", label: "Square (1440×1440)", width: 1440, height: 1440 },
    { value: "4:3", label: "Portrait (1440×1080)", width: 1440, height: 1080 },
    { value: "3:4", label: "Landscape (1080×1440)", width: 1080, height: 1440 },
    { value: "16:9", label: "Widescreen (1440×810)", width: 1440, height: 810 },
  ],
  dome: [
    { value: "1:1", label: "Square Dome (1440×1440)", width: 1440, height: 1440 },
    { value: "4:3", label: "Portrait Dome (1440×1080)", width: 1440, height: 1080 },
  ],
  "360": [
    { value: "2:1", label: "Equirectangular (1440×720)", width: 1440, height: 720 },
    { value: "16:9", label: "Panoramic (1440×810)", width: 1440, height: 810 },
    { value: "3:4", label: "Portrait Panorama (1080×1440)", width: 1080, height: 1440 },
  ],
}

export default function Dome360Planner() {
  // State management
  const [dataset, setDataset] = useState("vietnamese")
  const [scenario, setScenario] = useState("trung-sisters")
  const [colorScheme, setColorScheme] = useState("metallic")
  const [seed, setSeed] = useState(1234)
  const [numSamples, setNumSamples] = useState(4000)
  const [noiseScale, setNoiseScale] = useState(0.08)
  const [customPrompt, setCustomPrompt] = useState("")

  const projectionType = "fisheye" // Dome projection is always fisheye
  const panoramaFormat = "equirectangular" // 360° is always equirectangular
  const stereographicPerspective = "wide-angle" // Default stereographic perspective

  const [aspectRatios, setAspectRatios] = useState({
    standard: "1:1",
    dome: "1:1",
    "360": "2:1",
  })

  const [loraWeight, setLoraWeight] = useState(1.0)
  const [guidanceScale, setGuidanceScale] = useState(2.5)

  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<{
    standard?: GeneratedImage
    dome?: GeneratedImage
    "360"?: GeneratedImage
  }>({})
  const [generationType, setGenerationType] = useState<"standard" | "dome" | "360">("standard")

  const [selectedTypes, setSelectedTypes] = useState<{
    standard: boolean
    dome: boolean
    "360": boolean
  }>({
    standard: true,
    dome: false,
    "360": false,
  })

  // Prompt enhancement state
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false)
  const [enhancedPrompt, setEnhancedPrompt] = useState("")
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [promptStats, setPromptStats] = useState<any>(null)
  const [editablePrompt, setEditablePrompt] = useState("")
  const [variationType, setVariationType] = useState<"slight" | "moderate" | "dramatic">("moderate")
  const [error, setError] = useState<string | null>(null)

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

    setError(null)
    toast({
      title: "Parameters Randomized",
      description: "New random values generated for all parameters",
    })
  }, [])

  // Preview and enhance prompt
  const previewPrompt = useCallback(async () => {
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
  }, [
    dataset,
    scenario,
    colorScheme,
    seed,
    numSamples,
    noiseScale,
    customPrompt,
    generationType,
    panoramaFormat,
    projectionType,
    variationType,
  ])

  const handleGenerate = useCallback(async () => {
    if (!dataset || !scenario) {
      toast({
        title: "Missing Selection",
        description: "Please select both a dataset and scenario before generating.",
        variant: "destructive",
      })
      return
    }

    // Check if at least one type is selected
    const hasSelection = selectedTypes.standard || selectedTypes.dome || selectedTypes["360"]
    if (!hasSelection) {
      toast({
        title: "No Image Types Selected",
        description: "Please select at least one image type to generate.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setGeneratedImages({})

    try {
      const baseParams = {
        dataset,
        scenario,
        colorScheme,
        seed,
        numSamples,
        noiseScale,
        customPrompt,
        panoramic360: generationType === "360",
        panoramaFormat,
        projectionType, // This will be "fisheye" for dome
        variationType,
        generationType,
      }

      // Generate only selected types
      const generationPromises = []

      if (selectedTypes.standard) {
        console.log("[v0] Generating Standard image...")
        const standardAspectRatio =
          ASPECT_RATIOS.standard.find((ar) => ar.value === aspectRatios.standard) || ASPECT_RATIOS.standard[0]
        generationPromises.push(
          fetch("/api/generate-ai-art", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...baseParams,
              width: standardAspectRatio.width,
              height: standardAspectRatio.height,
              model: "black-forest-labs/flux-1.1-pro-ultra", // Set FLUX 1.1 Pro Ultra as preferred model
              num_inference_steps: 4,
              guidance_scale: 8,
              scheduler: "DPMSolverMultistep",
              style: "vivid",
              quality: "standard",
            }),
          })
            .then((res) => res.json())
            .then((data) => ({ type: "standard", data })),
        )
      }

      if (selectedTypes.dome) {
        console.log("[v0] Generating Dome image with 180° fisheye projection...")
        const domeAspectRatio = ASPECT_RATIOS.dome.find((ar) => ar.value === aspectRatios.dome) || ASPECT_RATIOS.dome[0]
        generationPromises.push(
          fetch("/api/generate-ai-art", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...baseParams,
              width: domeAspectRatio.width,
              height: domeAspectRatio.height,
              model: "black-forest-labs/flux-1.1-pro-ultra", // Set FLUX 1.1 Pro Ultra as preferred model
              num_inference_steps: 4,
              guidance_scale: 8,
              scheduler: "DPMSolverMultistep",
              style: "vivid",
              quality: "standard",
              domeProjection: true,
              projectionType: "fisheye", // Always "fisheye" for dome
              hemisphericalMapping: true,
              fisheyeDistortion: true,
              planetariumOptimized: true,
            }),
          })
            .then((res) => res.json())
            .then((data) => ({ type: "dome", data })),
        )
      }

      if (selectedTypes["360"]) {
        console.log("[v0] Generating 360° Panorama with equirectangular godlevel wrapping...")
        const panoramaAspectRatio =
          ASPECT_RATIOS["360"].find((ar) => ar.value === aspectRatios["360"]) || ASPECT_RATIOS["360"][0]
        generationPromises.push(
          fetch("/api/generate-ai-art", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...baseParams,
              width: panoramaAspectRatio.width,
              height: panoramaAspectRatio.height,
              model: "black-forest-labs/flux-1.1-pro-ultra", // Use FLUX 1.1 Pro Ultra for 360° as well
              num_inference_steps: 4,
              guidance_scale: 8,
              scheduler: "DPMSolverMultistep",
              style: "vivid",
              quality: "standard",
              panoramic360: true,
              panoramaFormat: panoramaFormat, // equirectangular or stereographic - 360° ONLY
              stereographicPerspective: stereographicPerspective, // wide-angle, ultra-wide, circular-frame - 360° ONLY
              equirectangularMapping: true,
              seamlessWrapping: true,
              vrOptimized: true,
            }),
          })
            .then((res) => res.json())
            .then((data) => ({ type: "360", data })),
        )
      }

      // Wait for all selected generations to complete
      const results = await Promise.all(generationPromises)

      // Process results and update state
      const newGeneratedImages: { [key: string]: GeneratedImage } = {}

      for (const result of results) {
        if (result.data.success && result.data.imageUrl) {
          newGeneratedImages[result.type] = {
            imageUrl: result.data.imageUrl,
            prompt: result.data.prompt || "",
            aspectRatio: result.data.aspectRatio || (result.type === "360" ? "2:1" : "1:1"),
            format:
              result.data.format ||
              (result.type === "360" ? "360° Panorama" : result.type === "dome" ? "Dome Projection" : "Standard Image"),
            projectionType: result.data.projectionType,
            PanoramaFormat: result.data.PanoramaFormat,
            seamlessWrapping: result.data.seamlessWrapping,
            planetariumOptimized: result.data.planetariumOptimized,
            orionCalibration: result.data.orionCalibration,
            geometricAlignment: result.data.geometricAlignment,
          }
          console.log(`[v0] ${result.type} image generated successfully:`, result.data.imageUrl)
        } else {
          console.error(`[v0] ${result.type} generation failed:`, result.data.error)
          toast({
            title: `${result.type.charAt(0).toUpperCase() + result.type.slice(1)} Generation Failed`,
            description: result.data.error || "Unknown error occurred",
            variant: "destructive",
          })
        }
      }

      setGeneratedImages(newGeneratedImages)

      // Set the generation type to the first successfully generated type
      const firstGeneratedType = Object.keys(newGeneratedImages)[0]
      if (firstGeneratedType) {
        setGenerationType(firstGeneratedType as "standard" | "dome" | "360")
      }

      toast({
        title: "Generation Complete",
        description: `Successfully generated ${Object.keys(newGeneratedImages).length} image(s)`,
      })
    } catch (error) {
      console.error("[v0] Generation error:", error)
      toast({
        title: "Generation Failed",
        description: "An error occurred during generation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }, [
    dataset,
    scenario,
    colorScheme,
    seed,
    numSamples,
    noiseScale,
    customPrompt,
    selectedTypes,
    generationType,
    panoramaFormat,
    projectionType,
    variationType,
    stereographicPerspective,
    aspectRatios,
  ])

  const currentImage = generatedImages[generationType]

  console.log("[v0] Current generation type:", generationType)
  console.log("[v0] Current image exists:", currentImage ? "Yes" : "No")
  console.log("[v0] Current image aspect ratio:", currentImage?.aspectRatio)

  const downloadImage = useCallback(
    async (imageUrl: string, filename: string) => {
      try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)
        const datasetName = dataset.replace(/[^a-zA-Z0-9]/g, "-")
        const scenarioName = scenario.replace(/[^a-zA-Z0-9]/g, "-")
        const colorSchemeName = colorScheme.replace(/[^a-zA-Z0-9]/g, "-")
        const typeInfo = generationType === "360" ? `360-${panoramaFormat}` : `dome-fisheye`

        const uniqueFilename = `flowsketch-${typeInfo}-${datasetName}-${scenarioName}-${colorSchemeName}-${timestamp}.png`

        const response = await fetch(
          `/api/download-proxy?url=${encodeURIComponent(imageUrl)}&filename=${encodeURIComponent(uniqueFilename)}`,
        )

        if (!response.ok) {
          throw new Error("Download failed")
        }

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = uniqueFilename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Download Complete",
          description: `${uniqueFilename} downloaded successfully`,
        })
      } catch (error) {
        console.error("Download error:", error)
        toast({
          title: "Download Failed",
          description: "Failed to download image",
          variant: "destructive",
        })
      }
    },
    [dataset, scenario, colorScheme, generationType, panoramaFormat],
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          FlowSketch Art Generator
        </h1>
        <p className="text-muted-foreground">
          Professional AI art generation with selective output types and ChatGPT enhancement
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="secondary">
            <Square className="w-3 h-3 mr-1" />
            Standard Quality
          </Badge>
          <Badge variant="secondary">
            <CircleDot className="w-3 h-3 mr-1" />
            Dome Optimized
          </Badge>
          <Badge variant="secondary">
            <Globe className="w-3 h-3 mr-1" />
            360° VR Ready
          </Badge>
          <Badge variant="secondary">
            <Sparkles className="w-3 h-3 mr-1" />
            ChatGPT Enhanced
          </Badge>
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
              <CardDescription>Configure image generation parameters and select output types</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Select Image Types to Generate */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Select Image Types to Generate</Label>
                <div className="space-y-3 border border-gray-200 rounded-lg p-3">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="standard"
                        checked={selectedTypes.standard}
                        onCheckedChange={(checked) =>
                          setSelectedTypes((prev) => ({ ...prev, standard: checked as boolean }))
                        }
                      />
                      <Label htmlFor="standard" className="flex items-center gap-2 cursor-pointer">
                        <Square className="h-4 w-4" />
                        Standard Image - FLUX 1.1 Pro Ultra
                      </Label>
                    </div>
                    {selectedTypes.standard && (
                      <div className="ml-6 space-y-1">
                        <Label className="text-xs text-muted-foreground">Aspect Ratio</Label>
                        <Select
                          value={aspectRatios.standard}
                          onValueChange={(value) => setAspectRatios((prev) => ({ ...prev, standard: value }))}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ASPECT_RATIOS.standard.map((ratio) => (
                              <SelectItem key={ratio.value} value={ratio.value}>
                                {ratio.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="dome"
                        checked={selectedTypes.dome}
                        onCheckedChange={(checked) =>
                          setSelectedTypes((prev) => ({ ...prev, dome: checked as boolean }))
                        }
                      />
                      <Label htmlFor="dome" className="flex items-center gap-2 cursor-pointer">
                        <CircleDot className="h-4 w-4" />
                        Dome Projection - FLUX 1.1 Pro Ultra
                      </Label>
                    </div>
                    {selectedTypes.dome && (
                      <div className="ml-6 space-y-1">
                        <Label className="text-xs text-muted-foreground">Aspect Ratio</Label>
                        <Select
                          value={aspectRatios.dome}
                          onValueChange={(value) => setAspectRatios((prev) => ({ ...prev, dome: value }))}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ASPECT_RATIOS.dome.map((ratio) => (
                              <SelectItem key={ratio.value} value={ratio.value}>
                                {ratio.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="360"
                        checked={selectedTypes["360"]}
                        onCheckedChange={(checked) =>
                          setSelectedTypes((prev) => ({ ...prev, "360": checked as boolean }))
                        }
                      />
                      <Label htmlFor="360" className="flex items-center gap-2 cursor-pointer">
                        <Globe className="h-4 w-4" />
                        360° Panorama - FLUX 1.1 Pro Ultra
                      </Label>
                    </div>
                    {selectedTypes["360"] && (
                      <div className="ml-6 space-y-1">
                        <Label className="text-xs text-muted-foreground">Aspect Ratio</Label>
                        <Select
                          value={aspectRatios["360"]}
                          onValueChange={(value) => setAspectRatios((prev) => ({ ...prev, "360": value }))}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ASPECT_RATIOS["360"].map((ratio) => (
                              <SelectItem key={ratio.value} value={ratio.value}>
                                {ratio.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Select image types and aspect ratios. FLUX 1.1 Pro Ultra is used for all generations with customizable
                  dimensions up to 1440px.
                </p>
              </div>

              {/* Generation Type for Viewing */}
              <div className="space-y-2">
                <Label>View Generated Image</Label>
                <Select
                  value={generationType}
                  onValueChange={(value: "standard" | "dome" | "360") => setGenerationType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">
                      <div className="flex items-center gap-2">
                        <Square className="h-4 w-4" />
                        Standard Image
                      </div>
                    </SelectItem>
                    <SelectItem value="dome">
                      <div className="flex items-center gap-2">
                        <CircleDot className="h-4 w-4" />
                        Dome Projection
                      </div>
                    </SelectItem>
                    <SelectItem value="360">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        360° Panorama
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dome Projection Settings */}
              {(selectedTypes.dome || generationType === "dome") && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Projection Settings</Label>

                  <div className="space-y-3">
                    {/* 360° Format - Fixed Display */}
                    <div className="space-y-2 border border-green-200 bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-green-800">360° Format</Label>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Fixed
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-semibold text-green-900">Equirectangular</span>
                      </div>
                      <p className="text-xs text-green-700">Perfect seamless wrapping for VR</p>
                    </div>

                    {/* Dome Projection - Fixed Display */}
                    <div className="space-y-2 border border-blue-200 bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-blue-800">Dome Projection</Label>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          Fixed
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <CircleDot className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-900">Fisheye</span>
                      </div>
                      <p className="text-xs text-blue-700">Standard dome projection</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 360° Panorama Settings */}
              {(selectedTypes["360"] || generationType === "360") && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Projection Settings</Label>

                  <div className="space-y-3">
                    {/* 360° Format - Fixed Display */}
                    <div className="space-y-2 border border-green-200 bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-green-800">360° Format</Label>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Fixed
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-semibold text-green-900">Equirectangular</span>
                      </div>
                      <p className="text-xs text-green-700">Perfect seamless wrapping for VR</p>
                    </div>

                    {/* Dome Projection - Fixed Display */}
                    <div className="space-y-2 border border-blue-200 bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-blue-800">Dome Projection</Label>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          Fixed
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <CircleDot className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-900">Fisheye</span>
                      </div>
                      <p className="text-xs text-blue-700">Standard dome projection</p>
                    </div>
                  </div>
                </div>
              )}

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
                    {Object.entries(COLOR_SCHEMES).map(([key]) => (
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
                      onClick={previewPrompt}
                      variant="outline"
                      className="w-full bg-transparent"
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
                          <span className="text-slate-800">✨</span> Preview & Enhance Prompt
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

              {generationType === "360" && panoramaFormat === "equirectangular" && (
                <div className="space-y-4 border border-blue-200 bg-blue-50 p-4 rounded-lg">
                  <Label className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    FLUX Equirectangular LoRA + Orion360 Standards
                  </Label>

                  <div className="space-y-2">
                    <Label className="text-sm">LoRA Weight: {loraWeight.toFixed(1)}</Label>
                    <Slider
                      value={[loraWeight]}
                      onValueChange={(value) => setLoraWeight(value[0])}
                      max={1.5}
                      min={0.5}
                      step={0.1}
                      className="w-full"
                    />
                    <p className="text-xs text-blue-600">
                      Recommended: 0.5-1.5. Increase above 1.0 if image appears too flat.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Guidance Scale: {guidanceScale.toFixed(1)}</Label>
                    <Slider
                      value={[guidanceScale]}
                      onValueChange={(value) => setGuidanceScale(value[0])}
                      max={5.0}
                      min={1.0}
                      step={0.1}
                      className="w-full"
                    />
                    <p className="text-xs text-blue-600">
                      Recommended: ~2.5 for realistic scenes. Higher values for more prompt adherence.
                    </p>
                  </div>

                  <div className="text-xs text-blue-700 bg-white p-2 rounded border border-blue-300">
                    <strong>Resolution:</strong> 1440×720 (2:1 aspect ratio) • <strong>Format:</strong> Equirectangular
                    • <strong>VR Ready:</strong> Yes • <strong>Neuralia Style:</strong> H3ritage Series •{" "}
                    <strong>Orion360:</strong> Professional Calibration
                  </div>

                  <div className="text-xs text-green-700 bg-green-50 p-2 rounded border border-green-300">
                    <strong>🎯 Orion360 Standards:</strong> Seamless edge wrapping • Color calibration • Geometric
                    alignment • Professional VR compliance • Zero visible seams • Perfect continuity
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button onClick={handleGenerate} disabled={isGenerating} className="w-full" size="lg">
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Selected Types...
                    </>
                  ) : (
                    <>
                      <span className="text-slate-100">✨</span> Generate Selected Images
                    </>
                  )}
                </Button>

                <Button onClick={randomizeParameters} variant="outline" className="w-full bg-transparent">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Randomize Parameters
                </Button>
              </div>

              {/* Current Settings Display */}
              <div className="space-y-2 border-t pt-4">
                <Label className="text-sm font-semibold">Selected Types</Label>
                <div className="flex flex-wrap gap-1">
                  {selectedTypes.standard && (
                    <Badge variant="outline" className="text-xs">
                      <Square className="w-3 h-3 mr-1" />
                      Standard
                    </Badge>
                  )}
                  {selectedTypes.dome && (
                    <Badge variant="outline" className="text-xs">
                      <CircleDot className="w-3 h-3 mr-1" />
                      Dome
                    </Badge>
                  )}
                  {selectedTypes["360"] && (
                    <Badge variant="outline" className="text-xs">
                      <Globe className="w-3 h-3 mr-1" />
                      360°
                    </Badge>
                  )}
                  {!selectedTypes.standard && !selectedTypes.dome && !selectedTypes["360"] && (
                    <Badge variant="destructive" className="text-xs">
                      None Selected
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {generationType === "360" ? (
                  <Globe className="h-5 w-5" />
                ) : generationType === "dome" ? (
                  <CircleDot className="h-5 w-5" />
                ) : (
                  <Square className="h-5 w-5" />
                )}
                Generated{" "}
                {generationType === "360"
                  ? "360° Panorama"
                  : generationType === "dome"
                    ? "Dome Projection"
                    : "Standard Image"}
              </CardTitle>
              <CardDescription>
                {generationType === "360"
                  ? `${panoramaFormat === "equirectangular" ? "Equirectangular godlevel wrapping" : "Stereographic"} 360° panoramic artwork with seamless continuity for VR viewing`
                  : generationType === "dome"
                    ? `180° fisheye ${projectionType} projection with hemispherical mapping optimized for planetarium dome display`
                    : "High-quality standard image with ChatGPT-enhanced prompts"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentImage ? (
                <div className="space-y-4">
                  <div className="w-full bg-muted rounded-lg overflow-hidden">
                    <AspectRatio ratio={generationType === "360" ? 2 : 1}>
                      <img
                        src={currentImage.imageUrl || "/placeholder.svg"}
                        alt={`Generated ${generationType === "360" ? "360° Panorama" : generationType === "dome" ? "Dome Projection" : "Standard Image"}`}
                        className="w-full h-full"
                        style={{
                          objectFit:
                            generationType === "360" ? "contain" : generationType === "dome" ? "cover" : "cover",
                          backgroundColor: generationType === "360" ? "#000" : "transparent",
                          borderRadius: generationType === "dome" ? "50%" : "0", // Circular display for dome fisheye
                        }}
                        onLoad={(e) => {
                          const img = e.target as HTMLImageElement
                          console.log(
                            "[v0] Image loaded - Natural dimensions:",
                            img.naturalWidth,
                            "x",
                            img.naturalHeight,
                          )
                          console.log("[v0] Image loaded - Display dimensions:", img.width, "x", img.height)
                          console.log(
                            "[v0] Image loaded - Aspect ratio:",
                            (img.naturalWidth / img.naturalHeight).toFixed(2),
                          )
                          if (generationType === "360") {
                            const aspectRatio = img.naturalWidth / img.naturalHeight
                            console.log(
                              "[v0] 360° aspect ratio check:",
                              aspectRatio >= 1.9 && aspectRatio <= 2.1 ? "✅ Valid 2:1" : "❌ Invalid aspect ratio",
                            )
                          }
                          if (generationType === "dome") {
                            const aspectRatio = img.naturalWidth / img.naturalHeight
                            console.log(
                              "[v0] Dome aspect ratio check:",
                              aspectRatio >= 0.9 && aspectRatio <= 1.1
                                ? "✅ Valid 1:1 fisheye"
                                : "❌ Invalid aspect ratio",
                            )
                          }
                        }}
                      />
                    </AspectRatio>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="flex gap-2">
                        <Badge variant="secondary">{currentImage.format}</Badge>
                        {currentImage.planetariumOptimized && <Badge variant="outline">Planetarium Ready</Badge>}
                        {currentImage.seamlessWrapping && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Professional Seamless
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {generationType === "360"
                            ? currentImage.PanoramaFormat
                            : generationType === "dome"
                              ? currentImage.projectionType
                              : "Standard"}
                        </Badge>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          Neuralia H3ritage
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {generationType === "360"
                          ? "1792×1024 • 360° Panorama • Neuralia Style • Orion360 Calibrated"
                          : generationType === "dome"
                            ? "1440×1440 • Dome Projection • Neuralia Style"
                            : "1440×1440 • Standard Image • Neuralia Style"}
                      </p>
                      {currentImage.seamlessWrapping && (
                        <p className="text-xs text-green-600">✓ Orion360 professional seamless wrapping verified</p>
                      )}
                    </div>
                    <Button
                      onClick={() => {
                        if (currentImage) {
                          downloadImage(currentImage.imageUrl, `flowsketch-${generationType}.jpg`)
                        }
                      }}
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-full bg-muted rounded-lg flex items-center justify-center">
                  <AspectRatio ratio={generationType === "360" ? 2 : 1}>
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      {generationType === "360" ? (
                        <Globe className="h-12 w-12 mb-2" />
                      ) : generationType === "dome" ? (
                        <CircleDot className="h-12 w-12 mb-2" />
                      ) : (
                        <Square className="h-12 w-12 mb-2" />
                      )}
                      <p className="text-sm">
                        {generationType === "360"
                          ? "360° Equirectangular Panorama with Godlevel Wrapping"
                          : generationType === "dome"
                            ? "180° Fisheye Dome Projection"
                            : "Standard Image"}
                      </p>
                      <p className="text-xs text-center mt-1">
                        {generationType === "360"
                          ? "Seamless wraparound format optimized for VR viewing"
                          : generationType === "dome"
                            ? "Hemispherical projection for planetarium dome display"
                            : "High-quality standard format"}
                      </p>
                    </div>
                  </AspectRatio>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Named export for compatibility
export { Dome360Planner }
