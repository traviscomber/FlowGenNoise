"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Alert } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { CULTURAL_DATASETS, COLOR_SCHEMES, buildPrompt, getScenarios } from "@/lib/ai-prompt"
import { REPLICATE_MODELS } from "@/app/api/generate-ai-art/utils"

interface GenerationResult {
  standard?: string
  dome?: string
  panorama360?: string
  errors: string[]
}

interface GenerationProgress {
  standard: "idle" | "generating" | "completed" | "failed"
  dome: "idle" | "generating" | "completed" | "failed"
  panorama360: "idle" | "generating" | "completed" | "failed"
}

interface PromptEnhancement {
  originalPrompt: string
  enhancedPrompt: string
  statistics: {
    original: { characters: number; words: number }
    enhanced: { characters: number; words: number }
    improvement: { characters: number; words: number; percentage: number }
    maxLength: number
    withinLimit: boolean
  }
  variationType: string
  generationType: string
  enhancementMethod: string
}

export function FlowArtGenerator() {
  // Core generation parameters
  const [dataset, setDataset] = useState("vietnamese")
  const [scenario, setScenario] = useState("trung-sisters")
  const [colorScheme, setColorScheme] = useState("metallic")
  const [seed, setSeed] = useState(1234)
  const [numSamples, setNumSamples] = useState(4000)
  const [noiseScale, setNoiseScale] = useState(0.08)
  const [customPrompt, setCustomPrompt] = useState("")
  const [negativePrompt, setNegativePrompt] = useState("")
  const [showAdvanced, setShowAdvanced] = useState(false)

  const [provider, setProvider] = useState<"openai" | "replicate">("replicate")
  const [replicateModel, setReplicateModel] = useState("black-forest-labs/flux-1.1-pro-ultra")

  // 360° and dome projection settings
  const [panoramic360, setPanoramic360] = useState(false)
  const [panoramaFormat, setPanoramaFormat] = useState("equirectangular")
  const [projectionType, setProjectionType] = useState("fisheye")

  // Prompt enhancement settings
  const [variationType, setVariationType] = useState("moderate")
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false)
  const [currentPrompt, setCurrentPrompt] = useState("")
  const [editablePrompt, setEditablePrompt] = useState("")
  const [promptEnhancement, setPromptEnhancement] = useState<PromptEnhancement | null>(null)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [isGeneratingGodlevel, setIsGeneratingGodlevel] = useState(false)

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress>({
    standard: "idle",
    dome: "idle",
    panorama360: "idle",
  })
  const [results, setResults] = useState<GenerationResult>({ errors: [] })
  const [activeTab, setActiveTab] = useState("standard")

  // Debug state
  const [apiKeyStatus, setApiKeyStatus] = useState<any>(null)
  const [isValidatingKey, setIsValidatingKey] = useState(false)

  // Refs for cancellation
  const abortControllerRef = useRef<AbortController | null>(null)

  // Get available scenarios for current dataset - with null safety
  const availableScenarios = getScenarios(dataset) || {}
  const scenarioEntries = Object.entries(availableScenarios)

  // Toast hook
  const { toast } = useToast()

  const refreshSite = useCallback(() => {
    window.location.reload()
  }, [])

  // Reset scenario when dataset changes
  const handleDatasetChange = useCallback((newDataset: string) => {
    setDataset(newDataset)
    const scenarios = getScenarios(newDataset) || {}
    const firstScenario = Object.keys(scenarios)[0]
    if (firstScenario) {
      setScenario(firstScenario)
    }
  }, [])

  // Validate OpenAI API Key
  const validateApiKey = useCallback(async () => {
    setIsValidatingKey(true)
    try {
      console.log("🔍 Validating OpenAI API key...")
      const response = await fetch("/api/validate-openai-key")
      const result = await response.json()
      setApiKeyStatus(result)

      if (result.success) {
        toast({ title: "✅ OpenAI API key is valid and working!", variant: "success" })
      } else {
        toast({ title: `❌ API Key Error: ${result.error}`, variant: "error" })
      }
    } catch (error: any) {
      console.error("API key validation failed:", error)
      toast({ title: "Failed to validate API key", variant: "error" })
      setApiKeyStatus({
        success: false,
        error: "Validation request failed",
      })
    } finally {
      setIsValidatingKey(false)
    }
  }, [])

  // Generate random seed
  const randomizeSeed = useCallback(() => {
    setSeed(Math.floor(Math.random() * 10000))
  }, [])

  const previewPrompt = useCallback(async () => {
    setIsPromptDialogOpen(true)

    try {
      // Build base prompt with null safety
      const basePrompt = buildPrompt({
        dataset: dataset || "vietnamese",
        scenario: scenario || "trung-sisters",
        colorScheme: colorScheme || "metallic",
        seed: seed || 1234,
        numSamples: numSamples || 4000,
        noiseScale: noiseScale || 0.08,
        customPrompt: customPrompt || "",
        negativePrompt: negativePrompt || "",
        panoramic360: panoramic360 || false,
        panoramaFormat: panoramaFormat || "equirectangular",
        projectionType: projectionType || "fisheye",
      })

      if (!basePrompt || basePrompt.length === 0) {
        throw new Error("Failed to build base prompt")
      }

      setCurrentPrompt(basePrompt)
      setEditablePrompt(basePrompt)
      setPromptEnhancement(null)
    } catch (error: any) {
      console.error("Preview error:", error)
      toast({ title: `Preview failed: ${error.message || "Unknown error"}`, variant: "error" })
    }
  }, [
    dataset,
    scenario,
    colorScheme,
    seed,
    numSamples,
    noiseScale,
    customPrompt,
    negativePrompt,
    panoramic360,
    panoramaFormat,
    projectionType,
    toast,
  ])

  const enhanceCurrentPrompt = useCallback(async () => {
    if (!editablePrompt) return

    setIsEnhancing(true)

    try {
      // Enhance with ChatGPT
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalPrompt: editablePrompt,
          negativePrompt: negativePrompt || "",
          variationLevel: variationType || "moderate",
          dataset: dataset || "vietnamese",
          scenario: scenario || "trung-sisters",
        }),
      })

      if (response.ok) {
        const enhancement = await response.json()
        if (enhancement.success && enhancement.enhancedPrompt) {
          setPromptEnhancement(enhancement)
          setEditablePrompt(enhancement.enhancedPrompt)
          toast({
            title: `Prompt enhanced successfully! Added ${enhancement.statistics?.improvement?.characters || 0} characters.`,
            variant: "success",
          })
        } else {
          throw new Error(enhancement.error || "Enhancement failed")
        }
      } else {
        const error = await response.json()
        throw new Error(error.error || "Enhancement request failed")
      }
    } catch (error: any) {
      console.error("Enhancement error:", error)
      toast({ title: `Enhancement failed: ${error.message || "Unknown error"}`, variant: "error" })
    } finally {
      setIsEnhancing(false)
    }
  }, [editablePrompt, negativePrompt, variationType, dataset, scenario, toast])

  // Preview and enhance prompt
  const previewAndEnhancePrompt = useCallback(async () => {
    setIsEnhancing(true)
    setIsPromptDialogOpen(true)

    try {
      // Build base prompt with null safety
      const basePrompt = buildPrompt({
        dataset: dataset || "vietnamese",
        scenario: scenario || "trung-sisters",
        colorScheme: colorScheme || "metallic",
        seed: seed || 1234,
        numSamples: numSamples || 4000,
        noiseScale: noiseScale || 0.08,
        customPrompt: customPrompt || "",
        negativePrompt: negativePrompt || "",
        panoramic360: panoramic360 || false,
        panoramaFormat: panoramaFormat || "equirectangular",
        projectionType: projectionType || "fisheye",
      })

      if (!basePrompt || basePrompt.length === 0) {
        throw new Error("Failed to build base prompt")
      }

      setCurrentPrompt(basePrompt)
      setEditablePrompt(basePrompt)

      // Enhance with ChatGPT
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalPrompt: basePrompt,
          negativePrompt: negativePrompt || "",
          variationLevel: variationType || "moderate",
          dataset: dataset || "vietnamese",
          scenario: scenario || "trung-sisters",
        }),
      })

      if (response.ok) {
        const enhancement = await response.json()
        if (enhancement.success && enhancement.enhancedPrompt) {
          setPromptEnhancement(enhancement)
          setEditablePrompt(enhancement.enhancedPrompt)
          toast({
            title: `Prompt enhanced successfully! Added ${enhancement.statistics?.improvement?.characters || 0} characters.`,
            variant: "success",
          })
        } else {
          throw new Error(enhancement.error || "Enhancement failed")
        }
      } else {
        const error = await response.json()
        throw new Error(error.error || "Enhancement request failed")
      }
    } catch (error: any) {
      console.error("Enhancement error:", error)
      toast({ title: `Enhancement failed: ${error.message || "Unknown error"}`, variant: "error" })

      // Fallback to base prompt if enhancement fails
      const fallbackPrompt = buildPrompt({
        dataset: dataset || "vietnamese",
        scenario: scenario || "trung-sisters",
        colorScheme: colorScheme || "metallic",
        seed: seed || 1234,
        numSamples: numSamples || 4000,
        noiseScale: noiseScale || 0.08,
        customPrompt: customPrompt || "",
        negativePrompt: negativePrompt || "",
        panoramic360: panoramic360 || false,
        panoramaFormat: panoramaFormat || "equirectangular",
        projectionType: projectionType || "fisheye",
      })

      if (fallbackPrompt) {
        setCurrentPrompt(fallbackPrompt)
        setEditablePrompt(fallbackPrompt)
      }
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
    negativePrompt,
    panoramic360,
    panoramaFormat,
    projectionType,
    variationType,
  ])

  // Apply enhanced prompt
  const applyEnhancedPrompt = useCallback(() => {
    if (editablePrompt && editablePrompt.trim()) {
      setCustomPrompt(editablePrompt.trim())
      setIsPromptDialogOpen(false)
      toast({ title: "Enhanced prompt applied successfully!", variant: "success" })
    } else {
      toast({ title: "No prompt to apply", variant: "error" })
    }
  }, [editablePrompt])

  // Reset to original prompt
  const resetToOriginal = useCallback(() => {
    if (promptEnhancement && promptEnhancement.originalPrompt) {
      setEditablePrompt(promptEnhancement.originalPrompt)
      toast({ title: "Reset to original prompt", variant: "info" })
    }
  }, [promptEnhancement])

  // Reset to enhanced prompt
  const resetToEnhanced = useCallback(() => {
    if (promptEnhancement && promptEnhancement.enhancedPrompt) {
      setEditablePrompt(promptEnhancement.enhancedPrompt)
      toast({ title: "Reset to enhanced prompt", variant: "info" })
    }
  }, [promptEnhancement])

  // Generate all image types
  const generateImages = useCallback(async () => {
    if (isGenerating) return

    setIsGenerating(true)
    setResults({ errors: [] })
    setGenerationProgress({
      standard: "generating",
      dome: "generating",
      panorama360: "generating",
    })

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      const baseParams = {
        dataset,
        scenario,
        colorScheme,
        seed,
        numSamples,
        noiseScale,
        customPrompt,
        negativePrompt,
        panoramic360,
        panoramaFormat,
        projectionType,
        provider,
        replicateModel,
      }

      let finalPrompt = ""
      if (customPrompt && customPrompt.trim()) {
        finalPrompt = customPrompt.trim()
      } else {
        finalPrompt = buildPrompt(baseParams)
      }

      if (!finalPrompt || finalPrompt.length === 0) {
        throw new Error("Failed to generate prompt")
      }

      const response = await fetch("/api/generate-ai-art", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: finalPrompt,
          negativePrompt: negativePrompt || "",
          dataset: dataset || "vietnamese",
          scenario: scenario || "trung-sisters",
          colorScheme: colorScheme || "metallic",
          seed: seed || 1234,
          numSamples: numSamples || 4000,
          noiseScale: noiseScale || 0.08,
          panoramic360: panoramic360 || false,
          panoramaFormat: panoramaFormat || "equirectangular",
          projectionType: projectionType || "fisheye",
          generateAll: true,
          provider,
          replicateModel,
        }),
        signal: abortController.signal,
      })

      if (response.ok) {
        const result = await response.json()

        // Ensure result has the expected structure
        const safeResult = {
          standard: result.standard || null,
          dome: result.dome || null,
          panorama360: result.panorama360 || null,
          errors: Array.isArray(result.errors) ? result.errors : [],
        }

        setResults(safeResult)

        // Update progress based on results
        setGenerationProgress({
          standard: safeResult.standard ? "completed" : "failed",
          dome: safeResult.dome ? "completed" : "failed",
          panorama360: safeResult.panorama360 ? "completed" : "failed",
        })

        const successCount = [safeResult.standard, safeResult.dome, safeResult.panorama360].filter(Boolean).length
        toast({
          title: `Generated ${successCount}/3 images successfully!`,
          description: "Your artwork has been generated successfully",
          variant: "success",
        })

        safeResult.errors.forEach((error: string) => toast({ title: error, variant: "error" }))
      } else {
        // Handle non-JSON responses
        let errorMessage = "Generation failed"
        try {
          const error = await response.json()
          errorMessage = error.error || errorMessage
        } catch (parseError) {
          // If response is not JSON, use status text
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        toast({ title: "Generation cancelled", variant: "info" })
      } else {
        console.error("Generation error:", error)
        toast({
          title: "Generation Failed",
          description: error.message || "Failed to generate artwork",
          variant: "destructive",
        })
        setGenerationProgress({
          standard: "failed",
          dome: "failed",
          panorama360: "failed",
        })
      }
    } finally {
      setIsGenerating(false)
      abortControllerRef.current = null
    }
  }, [
    dataset,
    scenario,
    colorScheme,
    seed,
    numSamples,
    noiseScale,
    customPrompt,
    negativePrompt,
    panoramic360,
    panoramaFormat,
    projectionType,
    isGenerating,
    provider,
    replicateModel,
  ])

  // Cancel generation
  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  // Download image
  const downloadImage = useCallback(
    async (imageUrl: string, filename: string) => {
      if (!imageUrl || !filename) {
        toast({ title: "Invalid download parameters", variant: "error" })
        return
      }

      try {
        // Create unique filename with comprehensive information
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)
        const datasetName = dataset.replace(/[^a-zA-Z0-9]/g, "-")
        const scenarioName = scenario.replace(/[^a-zA-Z0-9]/g, "-")
        const providerName = provider === "replicate" ? `replicate-${replicateModel.split("/")[1]}` : "openai-dalle3"
        const colorSchemeName = colorScheme.replace(/[^a-zA-Z0-9]/g, "-")

        const uniqueFilename = `flowsketch-${datasetName}-${scenarioName}-${providerName}-${colorSchemeName}-${timestamp}.png`

        const response = await fetch(
          `/api/download-proxy?url=${encodeURIComponent(imageUrl)}&filename=${encodeURIComponent(uniqueFilename)}`,
        )
        if (response.ok) {
          const blob = await response.blob()
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = uniqueFilename
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          toast({ title: `Downloaded ${uniqueFilename}`, variant: "success" })
        } else {
          throw new Error("Download failed")
        }
      } catch (error: any) {
        console.error("Download error:", error)
        toast({ title: `Download failed: ${error.message || "Unknown error"}`, variant: "error" })
      }
    },
    [dataset, scenario, provider, replicateModel, colorScheme],
  )

  const generateGodlevelPrompt = async () => {
    if (!editablePrompt) return

    console.log("[v0] Starting godlevel prompt generation")
    console.log("[v0] Original prompt:", editablePrompt)
    console.log("[v0] Dataset:", dataset, "Scenario:", scenario, "Color scheme:", colorScheme)

    setIsGeneratingGodlevel(true)
    try {
      console.log("[v0] Making API call to /api/generate-godlevel-prompt")
      const response = await fetch("/api/generate-godlevel-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalPrompt: editablePrompt,
          dataset: dataset,
          scenario: scenario,
          colorScheme: colorScheme,
          maxLength: 4000,
        }),
      })

      console.log("[v0] API response status:", response.status)
      if (!response.ok) {
        console.error("[v0] API response not ok:", response.status, response.statusText)
        throw new Error(`Failed to generate godlevel prompt: ${response.status}`)
      }

      console.log("[v0] Parsing response JSON")
      const data = await response.json()
      console.log("[v0] Received godlevel prompt:", data.godlevelPrompt?.substring(0, 100) + "...")

      setEditablePrompt(data.godlevelPrompt)

      setPromptEnhancement({
        originalPrompt: editablePrompt,
        enhancedPrompt: data.godlevelPrompt,
        statistics: {
          original: { words: editablePrompt.split(" ").length, characters: editablePrompt.length },
          enhanced: { words: data.godlevelPrompt.split(" ").length, characters: data.godlevelPrompt.length },
          improvement: {
            characters: data.godlevelPrompt.length - editablePrompt.length,
            words: data.godlevelPrompt.split(" ").length - editablePrompt.split(" ").length,
            percentage: Math.round(
              ((data.godlevelPrompt.length - editablePrompt.length) / editablePrompt.length) * 100,
            ),
          },
          maxLength: 4000,
          withinLimit: data.godlevelPrompt.length <= 4000,
        },
        variationType: "neuralia-artistic",
        generationType: "godlevel",
        enhancementMethod: "godlevel-neuralia",
      })

      console.log("[v0] Godlevel prompt generation completed successfully")
    } catch (error) {
      console.error("[v0] Error generating godlevel prompt:", error)
      alert("Failed to generate godlevel prompt. Please try again.")
    } finally {
      console.log("[v0] Setting isGeneratingGodlevel to false")
      setIsGeneratingGodlevel(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              FlowSketch Art Generator
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-2">
              Generate professional-quality AI art with perfect 360° seamless wrapping, dome projections, and cultural
              authenticity
            </p>
          </div>
          <div className="flex gap-2"></div>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="secondary">GODLEVEL Quality</Badge>
          <Badge variant="secondary">360° VR Ready</Badge>
          <Badge variant="secondary">Dome Projection</Badge>
          <Badge variant="secondary">ChatGPT Enhanced</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Dataset Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Cultural Dataset</CardTitle>
              <CardDescription>Choose from authentic cultural heritage collections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="dataset">Dataset</Label>
                <Select value={dataset} onValueChange={handleDatasetChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CULTURAL_DATASETS).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="scenario">Scenario</Label>
                <Select value={scenario} onValueChange={setScenario}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {scenarioEntries.map(([key]) => (
                      <SelectItem key={key} value={key}>
                        {key
                          .split("-")
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(" ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="colorScheme">Color Scheme</Label>
                <Select value={colorScheme} onValueChange={setColorScheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(COLOR_SCHEMES).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex flex-col">
                          <span className="capitalize">{key}</span>
                          <span className="text-xs text-muted-foreground">{value}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Technical Parameters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Technical Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="seed">Seed</Label>
                  <Button variant="ghost" size="sm" onClick={randomizeSeed}>
                    ⟲
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Slider
                    value={[seed]}
                    onValueChange={(value) => setSeed(value[0])}
                    max={9999}
                    min={1}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-12">{seed}</span>
                </div>
              </div>

              <div>
                <Label htmlFor="numSamples">Data Points</Label>
                <div className="flex gap-2">
                  <Slider
                    value={[numSamples]}
                    onValueChange={(value) => setNumSamples(value[0])}
                    max={8000}
                    min={1000}
                    step={500}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-12">{numSamples}</span>
                </div>
              </div>

              <div>
                <Label htmlFor="noiseScale">Noise Scale</Label>
                <div className="flex gap-2">
                  <Slider
                    value={[noiseScale]}
                    onValueChange={(value) => setNoiseScale(value[0])}
                    max={0.2}
                    min={0.01}
                    step={0.01}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-12">{noiseScale.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projection Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Projection Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="panoramaFormat">360° Format</Label>
                <Select value={panoramaFormat} onValueChange={setPanoramaFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equirectangular">
                      <div className="flex flex-col">
                        <span>Equirectangular</span>
                        <span className="text-xs text-muted-foreground">Perfect seamless wrapping for VR</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="stereographic">
                      <div className="flex flex-col">
                        <span>Stereographic</span>
                        <span className="text-xs text-muted-foreground">Little planet fisheye effect</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="projectionType">Dome Projection</Label>
                <Select value={projectionType} onValueChange={setProjectionType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fisheye">
                      <div className="flex flex-col">
                        <span>Fisheye</span>
                        <span className="text-xs text-muted-foreground">Standard dome projection</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="tunnel-up">
                      <div className="flex flex-col">
                        <span>Tunnel Up</span>
                        <span className="text-xs text-muted-foreground">Looking up through tunnel</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="tunnel-down">
                      <div className="flex flex-col">
                        <span>Tunnel Down</span>
                        <span className="text-xs text-muted-foreground">Looking down through tunnel</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="little-planet">
                      <div className="flex flex-col">
                        <span>Little Planet</span>
                        <span className="text-xs text-muted-foreground">Curved horizon planet view</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Prompt Enhancement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Prompt Enhancement</CardTitle>
              <CardDescription>Use ChatGPT to enhance your prompts for better results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="negativePrompt">Negative Prompt (Optional)</Label>
                <Textarea
                  id="negativePrompt"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="Enter words or elements you want to avoid in the generated image (e.g., blurry, low quality, distorted faces, text, watermarks)"
                  className="min-h-[80px] text-sm"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                  <span>Specify what to exclude from generation</span>
                  <span>{negativePrompt.length} characters</span>
                </div>
              </div>

              <div>
                <Label htmlFor="variationType">Enhancement Level</Label>
                <Select value={variationType} onValueChange={setVariationType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slight">
                      <div className="flex flex-col">
                        <span>Slight (+20%)</span>
                        <span className="text-xs text-muted-foreground">Subtle improvements</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="moderate">
                      <div className="flex flex-col">
                        <span>Moderate (+50%)</span>
                        <span className="text-xs text-muted-foreground">Balanced enhancement</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dramatic">
                      <div className="flex flex-col">
                        <span>Dramatic (+80%)</span>
                        <span className="text-xs text-muted-foreground">Maximum enhancement</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={previewPrompt}
                  className="flex-1 px-3 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md"
                >
                  <span className="text-slate-800">👁</span> Preview
                </button>
                <button
                  onClick={refreshSite}
                  className="px-3 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md"
                >
                  🔄
                </button>
              </div>
            </CardContent>
          </Card>

          {/* AI Provider Selection Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">🤖 AI Provider</CardTitle>
              <CardDescription>Choose your preferred image generation provider</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="provider">Provider</Label>
                <Select value={provider} onValueChange={(value: "openai" | "replicate") => setProvider(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="replicate">
                      <div className="flex flex-col">
                        <span>Replicate Models</span>
                        <span className="text-xs text-muted-foreground">Multiple model options available</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="openai">
                      <div className="flex flex-col">
                        <span>OpenAI DALL-E 3</span>
                        <span className="text-xs text-muted-foreground">High-quality, reliable generation</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {provider === "replicate" && (
                <div>
                  <Label htmlFor="replicateModel">Model</Label>
                  <Select value={replicateModel} onValueChange={setReplicateModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(REPLICATE_MODELS).map(([key, model]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex flex-col">
                            <span>{model.name}</span>
                            <span className="text-xs text-muted-foreground">{model.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                {provider === "replicate" ? (
                  <span>🔬 Replicate offers various models with different strengths and artistic styles</span>
                ) : (
                  <span>
                    <span className="text-slate-800">✨</span> DALL-E 3 HD with natural style for photorealistic results
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Generation Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Generate Art</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isGenerating ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Generating...</span>
                    <Button variant="outline" size="sm" onClick={cancelGeneration}>
                      ⟲ Cancel
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">Standard</span>
                      <span className="text-muted-foreground">{generationProgress.standard}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">Dome</span>
                      <span className="text-muted-foreground">{generationProgress.dome}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">360° Panorama</span>
                      <span className="text-muted-foreground">{generationProgress.panorama360}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={generateImages}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 font-medium"
                >
                  🎨 Generate Art
                </button>
              )}

              {customPrompt && (
                <Alert>
                  <span className="text-sm font-medium">
                    Using custom enhanced prompt ({customPrompt.length} characters)
                  </span>
                </Alert>
              )}

              {negativePrompt && (
                <Alert>
                  <span className="text-sm font-medium">
                    Using negative prompt ({negativePrompt.length} characters) - excluding specified elements
                  </span>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Generated Images</CardTitle>
              <CardDescription>
                Professional-quality AI art with seamless 360° wrapping and dome projection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="standard" className="flex items-center gap-2">
                    Standard
                    {results.standard && "✓"}
                  </TabsTrigger>
                  <TabsTrigger value="dome" className="flex items-center gap-2">
                    Dome
                    {results.dome && "✓"}
                  </TabsTrigger>
                  <TabsTrigger value="panorama360" className="flex items-center gap-2">
                    360° VR
                    {results.panorama360 && "✓"}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="standard" className="space-y-4">
                  {results.standard ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <AspectRatio ratio={1}>
                          <img
                            src={results.standard || "/placeholder.svg"}
                            alt="Standard generated art"
                            className="rounded-lg object-cover w-full h-full"
                          />
                        </AspectRatio>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => downloadImage(results.standard!, `flowsketch-standard-${seed}.png`)}
                          className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-md text-sm"
                        >
                          ⬇ Download Standard
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                      <div className="text-center space-y-2">
                        <span className="text-muted-foreground">Standard image will appear here</span>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="dome" className="space-y-4">
                  {results.dome ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <AspectRatio ratio={1}>
                          <img
                            src={results.dome || "/placeholder.svg"}
                            alt="Dome projection art"
                            className="rounded-lg object-cover w-full h-full"
                          />
                        </AspectRatio>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => downloadImage(results.dome!, `flowsketch-dome-${projectionType}-${seed}.png`)}
                          className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-md text-sm"
                        >
                          ⬇ Download Dome
                        </button>
                      </div>
                      <Alert>
                        <span className="text-sm font-medium">
                          Optimized for {projectionType} dome projection with perfect radial composition
                        </span>
                      </Alert>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                      <div className="text-center space-y-2">
                        <span className="text-muted-foreground">Dome projection will appear here</span>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="panorama360" className="space-y-4">
                  {results.panorama360 ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <AspectRatio ratio={2} className="bg-black rounded-lg overflow-hidden">
                          <img
                            src={results.panorama360 || "/placeholder.svg"}
                            alt="360° panoramic art"
                            className="w-full h-full object-contain"
                            style={{ objectPosition: "center" }}
                          />
                        </AspectRatio>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            downloadImage(results.panorama360!, `flowsketch-360-${panoramaFormat}-${seed}.png`)
                          }
                          className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-md text-sm"
                        >
                          ⬇ Download 360°
                        </button>
                      </div>
                      <Alert>
                        <span className="text-sm font-medium">
                          {panoramaFormat === "equirectangular"
                            ? "Perfect seamless wrapping for VR headsets - left edge connects flawlessly with right edge"
                            : "Stereographic projection with entire 360° view in circular frame"}
                        </span>
                      </Alert>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                      <div className="text-center space-y-2">
                        <span className="text-muted-foreground">360° panorama will appear here</span>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Prompt Preview Dialog */}
      <Dialog open={isPromptDialogOpen} onOpenChange={setIsPromptDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-slate-800">👁</span> Prompt Preview
            </DialogTitle>
            <DialogDescription>
              {promptEnhancement
                ? "Review your enhanced prompt"
                : "Review your original prompt and enhance it if needed"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Enhancement Statistics */}
            {promptEnhancement && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{promptEnhancement.statistics.original.words}</div>
                  <div className="text-sm text-muted-foreground">Original Words</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{promptEnhancement.statistics.enhanced.words}</div>
                  <div className="text-sm text-muted-foreground">Enhanced Words</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    +{promptEnhancement.statistics.improvement.words}
                  </div>
                  <div className="text-sm text-muted-foreground">Words Added</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {promptEnhancement.statistics.improvement.percentage}%
                  </div>
                  <div className="text-sm text-muted-foreground">Improvement</div>
                </div>
              </div>
            )}

            {/* Enhancement Method Badges */}
            {promptEnhancement && (
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {promptEnhancement.enhancementMethod === "chatgpt" ? (
                    <>ChatGPT Enhanced</>
                  ) : promptEnhancement.enhancementMethod === "godlevel-neuralia" ? (
                    <>Godlevel Neuralia Art</>
                  ) : (
                    <>Rule-Based Enhanced</>
                  )}
                </Badge>
                <Badge variant="outline">{promptEnhancement.variationType} variation</Badge>
                <Badge variant="outline">{promptEnhancement.generationType} generation</Badge>
              </div>
            )}

            {/* Prompt Editor */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="prompt-editor" className="text-base font-semibold">
                  {promptEnhancement ? "Enhanced Prompt" : "Original Prompt"}
                </Label>
                <div className="flex gap-2">
                  {promptEnhancement && (
                    <>
                      <Button variant="ghost" size="sm" onClick={resetToOriginal}>
                        Reset to Original
                      </Button>
                      <Button variant="ghost" size="sm" onClick={resetToEnhanced}>
                        Reset to Enhanced
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <Textarea
                id="prompt-editor"
                value={editablePrompt || ""}
                onChange={(e) => setEditablePrompt(e.target.value)}
                placeholder="Your prompt will appear here..."
                className="min-h-[200px] font-mono text-sm"
              />

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{(editablePrompt || "").length} characters</span>
                <span className={(editablePrompt || "").length > 4000 ? "text-red-500" : "text-green-500"}>
                  {(editablePrompt || "").length <= 4000 ? "Within limit" : "Exceeds 4000 char limit"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button onClick={enhanceCurrentPrompt} disabled={isEnhancing || !editablePrompt} className="flex-1">
                <span className="text-slate-100">{isEnhancing ? "⟳" : "✨"}</span>{" "}
                {isEnhancing ? "Enhancing..." : "Enhance"}
              </Button>

              <Button
                onClick={generateGodlevelPrompt}
                disabled={isGeneratingGodlevel || !editablePrompt}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <span className="text-white">{isGeneratingGodlevel ? "⟳" : "🎨"}</span>{" "}
                {isGeneratingGodlevel ? "Generating..." : "Godlevel Neuralia"}
              </Button>

              {promptEnhancement && (
                <Button
                  onClick={applyEnhancedPrompt}
                  className="flex-1"
                  disabled={!editablePrompt || editablePrompt.trim().length === 0}
                >
                  <span className="text-slate-100">✓</span> Apply
                </Button>
              )}

              <Button variant="outline" onClick={() => setIsPromptDialogOpen(false)} className="px-6">
                ↩ Return to Prompt
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FlowArtGenerator
