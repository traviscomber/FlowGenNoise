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
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Download,
  Palette,
  Settings,
  Sparkles,
  Eye,
  Wand2,
  RotateCcw,
  Play,
  Square,
  Zap,
  Globe,
  Mountain,
  ImageIcon,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Bug,
} from "lucide-react"
import { toast } from "sonner"
import { CULTURAL_DATASETS, COLOR_SCHEMES, buildPrompt, getScenarios } from "@/lib/ai-prompt"

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
        toast.success("✅ OpenAI API key is valid and working!")
      } else {
        toast.error(`❌ API Key Error: ${result.error}`)
      }
    } catch (error: any) {
      console.error("API key validation failed:", error)
      toast.error("Failed to validate API key")
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
          toast.success(
            `Prompt enhanced successfully! Added ${enhancement.statistics?.improvement?.characters || 0} characters.`,
          )
        } else {
          throw new Error(enhancement.error || "Enhancement failed")
        }
      } else {
        const error = await response.json()
        throw new Error(error.error || "Enhancement request failed")
      }
    } catch (error: any) {
      console.error("Enhancement error:", error)
      toast.error(`Enhancement failed: ${error.message || "Unknown error"}`)

      // Fallback to base prompt if enhancement fails
      const fallbackPrompt = buildPrompt({
        dataset: dataset || "vietnamese",
        scenario: scenario || "trung-sisters",
        colorScheme: colorScheme || "metallic",
        seed: seed || 1234,
        numSamples: numSamples || 4000,
        noiseScale: noiseScale || 0.08,
        customPrompt: customPrompt || "",
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
      toast.success("Enhanced prompt applied successfully!")
    } else {
      toast.error("No prompt to apply")
    }
  }, [editablePrompt])

  // Reset to original prompt
  const resetToOriginal = useCallback(() => {
    if (promptEnhancement && promptEnhancement.originalPrompt) {
      setEditablePrompt(promptEnhancement.originalPrompt)
      toast.info("Reset to original prompt")
    }
  }, [promptEnhancement])

  // Reset to enhanced prompt
  const resetToEnhanced = useCallback(() => {
    if (promptEnhancement && promptEnhancement.enhancedPrompt) {
      setEditablePrompt(promptEnhancement.enhancedPrompt)
      toast.info("Reset to enhanced prompt")
    }
  }, [promptEnhancement])

  // Generate all image types
  const generateImages = useCallback(async () => {
    if (isGenerating) return

    try {
      // Use enhanced prompt if available, otherwise build fresh
      let finalPrompt = ""
      if (customPrompt && customPrompt.trim()) {
        finalPrompt = customPrompt.trim()
      } else {
        finalPrompt = buildPrompt({
          dataset: dataset || "vietnamese",
          scenario: scenario || "trung-sisters",
          colorScheme: colorScheme || "metallic",
          seed: seed || 1234,
          numSamples: numSamples || 4000,
          noiseScale: noiseScale || 0.08,
          customPrompt: "",
          panoramic360: panoramic360 || false,
          panoramaFormat: panoramaFormat || "equirectangular",
          projectionType: projectionType || "fisheye",
        })
      }

      if (!finalPrompt || finalPrompt.length === 0) {
        throw new Error("Failed to generate prompt")
      }

      setIsGenerating(true)
      setResults({ errors: [] })
      setGenerationProgress({
        standard: "generating",
        dome: "generating",
        panorama360: "generating",
      })

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController()

      const response = await fetch("/api/generate-ai-art", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: finalPrompt,
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
        }),
        signal: abortControllerRef.current.signal,
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
        toast.success(`Generated ${successCount}/3 images successfully!`)

        if (safeResult.errors.length > 0) {
          safeResult.errors.forEach((error: string) => toast.error(error))
        }
      } else {
        const error = await response.json()
        throw new Error(error.error || "Generation failed")
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        toast.info("Generation cancelled")
      } else {
        console.error("Generation error:", error)
        toast.error(`Generation failed: ${error.message || "Unknown error"}`)
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
    panoramic360,
    panoramaFormat,
    projectionType,
    isGenerating,
  ])

  // Cancel generation
  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  // Download image
  const downloadImage = useCallback(async (imageUrl: string, filename: string) => {
    if (!imageUrl || !filename) {
      toast.error("Invalid download parameters")
      return
    }

    try {
      const response = await fetch(`/api/download-proxy?url=${encodeURIComponent(imageUrl)}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success(`Downloaded ${filename}`)
      } else {
        throw new Error("Download failed")
      }
    } catch (error: any) {
      console.error("Download error:", error)
      toast.error(`Download failed: ${error.message || "Unknown error"}`)
    }
  }, [])

  // Get status icon for generation progress
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "generating":
        return <Clock className="h-4 w-4 animate-spin text-blue-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
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
          <Button
            onClick={validateApiKey}
            disabled={isValidatingKey}
            variant="outline"
            size="sm"
            className="gap-2 bg-transparent"
          >
            {isValidatingKey ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <Bug className="h-4 w-4" />
                Debug API Key
              </>
            )}
          </Button>
        </div>

        {/* API Key Status */}
        {apiKeyStatus && (
          <Alert className={apiKeyStatus.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <div className="flex items-center gap-2">
              {apiKeyStatus.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={apiKeyStatus.success ? "text-green-800" : "text-red-800"}>
                {apiKeyStatus.message || apiKeyStatus.error}
              </AlertDescription>
            </div>
          </Alert>
        )}

        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="secondary">
            <Sparkles className="h-3 w-3 mr-1" />
            GODLEVEL Quality
          </Badge>
          <Badge variant="secondary">
            <Globe className="h-3 w-3 mr-1" />
            360° VR Ready
          </Badge>
          <Badge variant="secondary">
            <Mountain className="h-3 w-3 mr-1" />
            Dome Projection
          </Badge>
          <Badge variant="secondary">
            <Zap className="h-3 w-3 mr-1" />
            ChatGPT Enhanced
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Dataset Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Cultural Dataset
              </CardTitle>
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
                    {scenarioEntries.map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value.name}
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
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Technical Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="seed">Seed</Label>
                  <Button variant="ghost" size="sm" onClick={randomizeSeed}>
                    <RotateCcw className="h-4 w-4" />
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
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Projection Settings
              </CardTitle>
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
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Prompt Enhancement
              </CardTitle>
              <CardDescription>Use ChatGPT to enhance your prompts for better results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <Button
                onClick={previewAndEnhancePrompt}
                disabled={isEnhancing}
                className="w-full bg-transparent"
                variant="outline"
              >
                {isEnhancing ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Enhancing...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview & Enhance Prompt
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generation Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Generate Art
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isGenerating ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Generating...</span>
                    <Button variant="outline" size="sm" onClick={cancelGeneration}>
                      <Square className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        {getStatusIcon(generationProgress.standard)}
                        Standard
                      </span>
                      <span className="text-muted-foreground">{generationProgress.standard}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        {getStatusIcon(generationProgress.dome)}
                        Dome
                      </span>
                      <span className="text-muted-foreground">{generationProgress.dome}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        {getStatusIcon(generationProgress.panorama360)}
                        360° Panorama
                      </span>
                      <span className="text-muted-foreground">{generationProgress.panorama360}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <Button onClick={generateImages} className="w-full" size="lg">
                  <Play className="h-4 w-4 mr-2" />
                  Generate All Images
                </Button>
              )}

              {customPrompt && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>Using custom enhanced prompt ({customPrompt.length} characters)</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Generated Images
              </CardTitle>
              <CardDescription>
                Professional-quality AI art with seamless 360° wrapping and dome projection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="standard" className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Standard
                    {results.standard && <CheckCircle className="h-3 w-3 text-green-500" />}
                  </TabsTrigger>
                  <TabsTrigger value="dome" className="flex items-center gap-2">
                    <Mountain className="h-4 w-4" />
                    Dome
                    {results.dome && <CheckCircle className="h-3 w-3 text-green-500" />}
                  </TabsTrigger>
                  <TabsTrigger value="panorama360" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    360° VR
                    {results.panorama360 && <CheckCircle className="h-3 w-3 text-green-500" />}
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
                        <Button
                          onClick={() => downloadImage(results.standard!, `flowsketch-standard-${seed}.png`)}
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Standard
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                      <div className="text-center space-y-2">
                        <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/50" />
                        <p className="text-muted-foreground">Standard image will appear here</p>
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
                        <Button
                          onClick={() => downloadImage(results.dome!, `flowsketch-dome-${projectionType}-${seed}.png`)}
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Dome
                        </Button>
                      </div>
                      <Alert>
                        <Mountain className="h-4 w-4" />
                        <AlertDescription>
                          Optimized for {projectionType} dome projection with perfect radial composition
                        </AlertDescription>
                      </Alert>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                      <div className="text-center space-y-2">
                        <Mountain className="h-12 w-12 mx-auto text-muted-foreground/50" />
                        <p className="text-muted-foreground">Dome projection will appear here</p>
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
                        <Button
                          onClick={() =>
                            downloadImage(results.panorama360!, `flowsketch-360-${panoramaFormat}-${seed}.png`)
                          }
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download 360°
                        </Button>
                      </div>
                      <Alert>
                        <Globe className="h-4 w-4" />
                        <AlertDescription>
                          {panoramaFormat === "equirectangular"
                            ? "Perfect seamless wrapping for VR headsets - left edge connects flawlessly with right edge"
                            : "Stereographic projection with entire 360° view in circular frame"}
                        </AlertDescription>
                      </Alert>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                      <div className="text-center space-y-2">
                        <Globe className="h-12 w-12 mx-auto text-muted-foreground/50" />
                        <p className="text-muted-foreground">360° panorama will appear here</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Prompt Enhancement Dialog */}
      <Dialog open={isPromptDialogOpen} onOpenChange={setIsPromptDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Prompt Enhancement Studio
            </DialogTitle>
            <DialogDescription>Preview, edit, and enhance your AI art prompt with ChatGPT assistance</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Enhancement Statistics */}
            {promptEnhancement && promptEnhancement.statistics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {promptEnhancement.statistics.original?.characters || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Original Chars</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {promptEnhancement.statistics.enhanced?.characters || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Enhanced Chars</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    +{promptEnhancement.statistics.improvement?.percentage || 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Improvement</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div
                    className={`text-2xl font-bold ${promptEnhancement.statistics.withinLimit ? "text-green-600" : "text-red-600"}`}
                  >
                    {promptEnhancement.statistics.enhanced?.characters || 0}/4000
                  </div>
                  <div className="text-sm text-muted-foreground">Char Limit</div>
                </div>
              </div>
            )}

            {/* Enhancement Method Badge */}
            {promptEnhancement && (
              <div className="flex items-center gap-2">
                <Badge variant={promptEnhancement.enhancementMethod === "chatgpt" ? "default" : "secondary"}>
                  {promptEnhancement.enhancementMethod === "chatgpt" ? (
                    <>
                      <Zap className="h-3 w-3 mr-1" />
                      ChatGPT Enhanced
                    </>
                  ) : (
                    <>
                      <Settings className="h-3 w-3 mr-1" />
                      Rule-Based Enhanced
                    </>
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
                  Enhanced Prompt Editor
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
                placeholder="Your enhanced prompt will appear here..."
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
              <Button onClick={applyEnhancedPrompt} className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                Apply Enhanced Prompt
              </Button>
              <Button variant="outline" onClick={() => setIsPromptDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FlowArtGenerator
