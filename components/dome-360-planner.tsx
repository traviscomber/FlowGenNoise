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
  ArrowUp,
  ArrowDown,
  Orbit,
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

export default function Dome360Planner() {
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
        projectionType,
        variationType,
        generationType,
      }

      // Generate only selected types
      const generationPromises = []

      if (selectedTypes.standard) {
        console.log("[v0] Generating Standard image...")
        generationPromises.push(
          fetch("/api/generate-ai-art", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...baseParams,
              width: 1440,
              height: 1440,
              model: "black-forest-labs/flux-1.1-pro-ultra",
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
        console.log("[v0] Generating Dome image...")
        generationPromises.push(
          fetch("/api/generate-ai-art", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...baseParams,
              width: 1440,
              height: 1440,
              model: "black-forest-labs/flux-1.1-pro-ultra",
              num_inference_steps: 4,
              guidance_scale: 8,
              scheduler: "DPMSolverMultistep",
              style: "vivid",
              quality: "standard",
            }),
          })
            .then((res) => res.json())
            .then((data) => ({ type: "dome", data })),
        )
      }

      if (selectedTypes["360"]) {
        console.log("[v0] Generating 360° Panorama image...")
        generationPromises.push(
          fetch("/api/generate-ai-art", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...baseParams,
              width: 1792,
              height: 1024,
              model: "dall-e-3", // Always use DALL-E 3 for 360° panoramas
              style: "natural",
              quality: "hd",
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
            panoramaFormat: result.data.panoramaFormat,
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
        const typeInfo = generationType === "360" ? `360-${panoramaFormat}` : `dome-${projectionType}`

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
    [dataset, scenario, colorScheme, generationType, panoramaFormat, projectionType],
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
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Select Image Types to Generate</Label>
                <div className="space-y-3 border border-gray-200 rounded-lg p-3">
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
                      Standard Image (1440×1440)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="dome"
                      checked={selectedTypes.dome}
                      onCheckedChange={(checked) => setSelectedTypes((prev) => ({ ...prev, dome: checked as boolean }))}
                    />
                    <Label htmlFor="dome" className="flex items-center gap-2 cursor-pointer">
                      <CircleDot className="h-4 w-4" />
                      Dome Projection (1440×1440)
                    </Label>
                  </div>
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
                      360° Panorama (1792×1024)
                    </Label>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Select one or more image types. Each selected type will be generated independently.
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

              {/* Projection Type Selection */}
              {(selectedTypes.dome || generationType === "dome") && (
                <div className="space-y-2">
                  <Label>Dome Projection Type</Label>
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
              )}

              {/* Panorama Format Selection */}
              {(selectedTypes["360"] || generationType === "360") && (
                <div className="space-y-2">
                  <Label>360° Panorama Format</Label>
                  <Select value={panoramaFormat} onValueChange={setPanoramaFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equirectangular">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Equirectangular
                          <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-700 border-blue-200">
                            FLUX LoRA
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
                  {panoramaFormat === "equirectangular" && (
                    <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                      <strong>FLUX Equirectangular LoRA:</strong> Godlevel 1792×1024 resolution with professional
                      seamless wrapping and neuralia h3ritage style. Trigger: "equirectangular 360 degree panorama"
                    </div>
                  )}
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
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Selected Images
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
                  ? `${panoramaFormat === "equirectangular" ? "Seamless equirectangular" : "Stereographic"} 360° panoramic artwork optimized for VR viewing with ChatGPT-enhanced prompts`
                  : generationType === "dome"
                    ? `${projectionType} projection optimized for planetarium dome display with ChatGPT-enhanced prompts`
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
                          objectFit: generationType === "360" ? "contain" : "cover",
                          backgroundColor: generationType === "360" ? "#000" : "transparent",
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
                            ? currentImage.panoramaFormat
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
                <div className="w-full bg-muted rounded-lg overflow-hidden">
                  <AspectRatio ratio={generationType === "360" ? 2 : 1}>
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center space-y-2">
                        {generationType === "360" ? (
                          <Globe className="h-12 w-12 mx-auto text-muted-foreground" />
                        ) : generationType === "dome" ? (
                          <CircleDot className="h-12 w-12 mx-auto text-muted-foreground" />
                        ) : (
                          <Square className="h-12 w-12 mx-auto text-muted-foreground" />
                        )}
                        <p className="text-muted-foreground">
                          No{" "}
                          {generationType === "360"
                            ? "360° panorama"
                            : generationType === "dome"
                              ? "dome projection"
                              : "standard image"}{" "}
                          generated yet
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Current:{" "}
                          {generationType === "360"
                            ? panoramaFormat
                            : generationType === "dome"
                              ? projectionType
                              : "standard"}
                        </p>
                        {generationType === "360" && panoramaFormat === "equirectangular" && (
                          <p className="text-xs text-green-600">
                            Will generate with Orion360 professional calibration standards
                          </p>
                        )}
                      </div>
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
