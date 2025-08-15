"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Download,
  Settings,
  Sparkles,
  Eye,
  Globe,
  Camera,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
  Zap,
  ImageIcon,
  Wand2,
  Bug,
  Key,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { getDatasets, getScenarios, getColorSchemes, buildPrompt } from "@/lib/ai-prompt"

interface GeneratedImage {
  url: string
  type: "standard" | "dome" | "360"
  prompt: string
  timestamp: string
}

interface GenerationState {
  standard: { loading: boolean; image: GeneratedImage | null; error: string | null }
  dome: { loading: boolean; image: GeneratedImage | null; error: string | null }
  "360": { loading: boolean; image: GeneratedImage | null; error: string | null }
}

export default function FlowArtGenerator() {
  // State management
  const [selectedDataset, setSelectedDataset] = useState("vietnamese")
  const [selectedScenario, setSelectedScenario] = useState("trung-sisters")
  const [selectedColorScheme, setSelectedColorScheme] = useState("metallic")
  const [seed, setSeed] = useState(1234)
  const [numSamples, setNumSamples] = useState(4000)
  const [noiseScale, setNoiseScale] = useState(0.08)
  const [customPrompt, setCustomPrompt] = useState("")
  const [useCustomPrompt, setUseCustomPrompt] = useState(false)

  // Prompt enhancement settings
  const [enhancePrompt, setEnhancePrompt] = useState(true)
  const [enhancementLevel, setEnhancementLevel] = useState("moderate")
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [previewPrompt, setPreviewPrompt] = useState("")

  // 360° and Dome settings
  const [panoramic360, setPanoramic360] = useState(false)
  const [panoramaFormat, setPanoramaFormat] = useState("equirectangular")
  const [domeProjection, setDomeProjection] = useState(false)
  const [projectionType, setProjectionType] = useState("fisheye")

  // Generation states
  const [generationState, setGenerationState] = useState<GenerationState>({
    standard: { loading: false, image: null, error: null },
    dome: { loading: false, image: null, error: null },
    "360": { loading: false, image: null, error: null },
  })

  const [isGeneratingAll, setIsGeneratingAll] = useState(false)
  const [apiKeyStatus, setApiKeyStatus] = useState<"unknown" | "valid" | "invalid" | "checking">("unknown")

  // Get available options
  const datasets = getDatasets()
  const scenarios = getScenarios(selectedDataset)
  const colorSchemes = getColorSchemes()

  // Update scenario when dataset changes
  useEffect(() => {
    const scenarioKeys = Object.keys(scenarios)
    if (scenarioKeys.length > 0 && !scenarios[selectedScenario]) {
      setSelectedScenario(scenarioKeys[0])
    }
  }, [selectedDataset, scenarios, selectedScenario])

  // Update preview prompt when settings change
  useEffect(() => {
    if (!useCustomPrompt) {
      const prompt = buildPrompt({
        dataset: selectedDataset,
        scenario: selectedScenario,
        colorScheme: selectedColorScheme,
        seed,
        numSamples,
        noiseScale,
        customPrompt: "",
        panoramic360: false,
        panoramaFormat,
        projectionType,
      })
      setPreviewPrompt(prompt)
    } else {
      setPreviewPrompt(customPrompt)
    }
  }, [
    selectedDataset,
    selectedScenario,
    selectedColorScheme,
    seed,
    numSamples,
    noiseScale,
    customPrompt,
    useCustomPrompt,
    panoramaFormat,
    projectionType,
  ])

  // Enhance prompt with AI
  const enhancePromptWithAI = async () => {
    if (!previewPrompt.trim()) return

    setIsEnhancing(true)
    try {
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: previewPrompt,
          enhancementLevel,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setCustomPrompt(data.enhancedPrompt)
        setUseCustomPrompt(true)
        toast({
          title: "✨ Prompt Enhanced!",
          description: `Enhanced with ${data.method} method`,
        })
      } else {
        throw new Error(data.error || "Enhancement failed")
      }
    } catch (error: any) {
      toast({
        title: "❌ Enhancement Failed",
        description: error.message || "Could not enhance prompt",
        variant: "destructive",
      })
    } finally {
      setIsEnhancing(false)
    }
  }

  // Generate single image
  const generateImage = async (type: "standard" | "dome" | "360") => {
    setGenerationState((prev) => ({
      ...prev,
      [type]: { ...prev[type], loading: true, error: null },
    }))

    try {
      const finalPrompt = useCustomPrompt
        ? customPrompt
        : buildPrompt({
            dataset: selectedDataset,
            scenario: selectedScenario,
            colorScheme: selectedColorScheme,
            seed,
            numSamples,
            noiseScale,
            customPrompt: "",
            panoramic360: type === "360",
            panoramaFormat,
            projectionType: type === "dome" ? projectionType : "fisheye",
          })

      const response = await fetch("/api/generate-ai-art", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataset: selectedDataset,
          scenario: selectedScenario,
          colorScheme: selectedColorScheme,
          seed,
          numSamples,
          noiseScale,
          customPrompt: useCustomPrompt ? customPrompt : "",
          panoramic360: type === "360",
          panoramaFormat,
          domeProjection: type === "dome",
          projectionType,
          enhancePrompt,
          enhancementLevel,
        }),
      })

      const data = await response.json()

      if (data.success) {
        const newImage: GeneratedImage = {
          url: data.imageUrl,
          type,
          prompt: data.prompt || finalPrompt,
          timestamp: new Date().toISOString(),
        }

        setGenerationState((prev) => ({
          ...prev,
          [type]: { loading: false, image: newImage, error: null },
        }))

        toast({
          title: `${type.charAt(0).toUpperCase() + type.slice(1)} Image Generated!`,
          description: `Successfully created ${type} format image.`,
        })
      } else {
        throw new Error(data.error || "Generation failed")
      }
    } catch (error: any) {
      const errorMessage = error.message || "Unknown error occurred"
      setGenerationState((prev) => ({
        ...prev,
        [type]: { loading: false, image: null, error: errorMessage },
      }))

      toast({
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Generation Failed`,
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  // Generate all 3 formats simultaneously
  const generateAllFormats = async () => {
    setIsGeneratingAll(true)

    // Reset all states
    setGenerationState({
      standard: { loading: true, image: null, error: null },
      dome: { loading: true, image: null, error: null },
      "360": { loading: true, image: null, error: null },
    })

    try {
      // Generate all three formats in parallel
      const promises = [generateSingleFormat("standard"), generateSingleFormat("dome"), generateSingleFormat("360")]

      await Promise.allSettled(promises)

      toast({
        title: "🎉 All Formats Generated!",
        description: "Successfully created standard, dome, and 360° images.",
      })
    } catch (error) {
      toast({
        title: "❌ Generation Error",
        description: "Some formats may have failed to generate.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingAll(false)
    }
  }

  // Helper function for generating single format
  const generateSingleFormat = async (type: "standard" | "dome" | "360") => {
    try {
      const finalPrompt = useCustomPrompt
        ? customPrompt
        : buildPrompt({
            dataset: selectedDataset,
            scenario: selectedScenario,
            colorScheme: selectedColorScheme,
            seed,
            numSamples,
            noiseScale,
            customPrompt: "",
            panoramic360: type === "360",
            panoramaFormat,
            projectionType: type === "dome" ? projectionType : "fisheye",
          })

      const response = await fetch("/api/generate-ai-art", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataset: selectedDataset,
          scenario: selectedScenario,
          colorScheme: selectedColorScheme,
          seed,
          numSamples,
          noiseScale,
          customPrompt: useCustomPrompt ? customPrompt : "",
          panoramic360: type === "360",
          panoramaFormat,
          domeProjection: type === "dome",
          projectionType,
          enhancePrompt,
          enhancementLevel,
        }),
      })

      const data = await response.json()

      if (data.success) {
        const newImage: GeneratedImage = {
          url: data.imageUrl,
          type,
          prompt: data.prompt || finalPrompt,
          timestamp: new Date().toISOString(),
        }

        setGenerationState((prev) => ({
          ...prev,
          [type]: { loading: false, image: newImage, error: null },
        }))
      } else {
        throw new Error(data.error || "Generation failed")
      }
    } catch (error: any) {
      const errorMessage = error.message || "Unknown error occurred"
      setGenerationState((prev) => ({
        ...prev,
        [type]: { loading: false, image: null, error: errorMessage },
      }))
    }
  }

  // Debug API Key
  const debugApiKey = async () => {
    setApiKeyStatus("checking")
    try {
      const response = await fetch("/api/validate-openai-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const data = await response.json()

      if (data.valid) {
        setApiKeyStatus("valid")
        toast({
          title: "✅ API Key Valid",
          description: `OpenAI API key is working correctly. Model: ${data.model || "dall-e-3"}`,
        })
      } else {
        setApiKeyStatus("invalid")
        toast({
          title: "❌ API Key Invalid",
          description: data.error || "Please check your OpenAI API key configuration.",
          variant: "destructive",
        })
      }
    } catch (error) {
      setApiKeyStatus("invalid")
      toast({
        title: "❌ API Key Check Failed",
        description: "Could not validate API key. Please check your configuration.",
        variant: "destructive",
      })
    }
  }

  // Download image
  const downloadImage = async (imageUrl: string, type: string) => {
    try {
      const response = await fetch(`/api/download-proxy?url=${encodeURIComponent(imageUrl)}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `flowsketch-${type}-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "✅ Download Started",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} image download initiated.`,
      })
    } catch (error) {
      toast({
        title: "❌ Download Failed",
        description: "Could not download the image. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Render image card
  const renderImageCard = (
    type: "standard" | "dome" | "360",
    title: string,
    description: string,
    icon: React.ReactNode,
  ) => {
    const state = generationState[type]

    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            {icon}
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription className="text-sm">{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden relative">
            {state.loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
                  <p className="text-sm text-gray-600">Generating {type} image...</p>
                  <Progress value={33} className="w-24 mx-auto mt-2" />
                </div>
              </div>
            )}

            {state.error && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-50">
                <div className="text-center p-4">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                  <p className="text-sm text-red-600 mb-2">Generation Failed</p>
                  <p className="text-xs text-red-500">{state.error}</p>
                </div>
              </div>
            )}

            {state.image && (
              <img
                src={state.image.url || "/placeholder.svg"}
                alt={`${title} generated image`}
                className="w-full h-full object-cover"
              />
            )}

            {!state.loading && !state.error && !state.image && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">No image generated</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => generateImage(type)}
              disabled={state.loading || isGeneratingAll}
              className="flex-1"
              size="sm"
            >
              {state.loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>

            {state.image && (
              <Button onClick={() => downloadImage(state.image!.url, type)} variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🎨 FlowSketch Art Generator
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Generate stunning cultural artwork with GODLEVEL quality in multiple formats: Standard, Dome Projection, and
            360° Panorama
          </p>
          <Badge variant="secondary" className="mt-2">
            Enhanced with AI Prompt Optimization
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* API Key Status */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    <CardTitle className="text-lg">API Configuration</CardTitle>
                  </div>
                  <Button onClick={debugApiKey} disabled={apiKeyStatus === "checking"} variant="outline" size="sm">
                    {apiKeyStatus === "checking" ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <Bug className="h-4 w-4 mr-2" />
                        Debug API Key
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  {apiKeyStatus === "valid" && (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-700 dark:text-green-400">
                        OpenAI API key is configured and working
                      </span>
                    </>
                  )}
                  {apiKeyStatus === "invalid" && (
                    <>
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <span className="text-red-700 dark:text-red-400">API key issue detected</span>
                    </>
                  )}
                  {apiKeyStatus === "unknown" && (
                    <>
                      <Info className="h-5 w-5 text-yellow-500" />
                      <span className="text-yellow-700 dark:text-yellow-400">
                        Click "Debug API Key" to validate configuration
                      </span>
                    </>
                  )}
                  {apiKeyStatus === "checking" && (
                    <>
                      <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                      <span className="text-blue-700 dark:text-blue-400">Validating API key...</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Generation Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Generation Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dataset Selection */}
                <div className="space-y-2">
                  <Label>Cultural Dataset</Label>
                  <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {datasets.map((dataset) => (
                        <SelectItem key={dataset.id} value={dataset.id}>
                          {dataset.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Scenario Selection */}
                <div className="space-y-2">
                  <Label>Scenario</Label>
                  <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(scenarios).map(([key, scenario]) => (
                        <SelectItem key={key} value={key}>
                          {scenario.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Color Scheme */}
                <div className="space-y-2">
                  <Label>Color Scheme</Label>
                  <Select value={selectedColorScheme} onValueChange={setSelectedColorScheme}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorSchemes.map((scheme) => (
                        <SelectItem key={scheme.id} value={scheme.id}>
                          {scheme.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Prompt Enhancement */}
                <div className="space-y-4 p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-blue-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch id="enhance-prompt" checked={enhancePrompt} onCheckedChange={setEnhancePrompt} />
                      <Label htmlFor="enhance-prompt" className="font-medium">
                        AI Prompt Enhancement
                      </Label>
                    </div>
                    <Badge variant="secondary">GODLEVEL</Badge>
                  </div>

                  {enhancePrompt && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Enhancement Level</Label>
                        <Select value={enhancementLevel} onValueChange={setEnhancementLevel}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="slight">Slight Enhancement</SelectItem>
                            <SelectItem value="moderate">Moderate Enhancement</SelectItem>
                            <SelectItem value="dramatic">Dramatic Enhancement</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        onClick={enhancePromptWithAI}
                        disabled={isEnhancing || !previewPrompt.trim()}
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                      >
                        {isEnhancing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Enhancing...
                          </>
                        ) : (
                          <>
                            <Wand2 className="h-4 w-4 mr-2" />
                            Enhance Current Prompt
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Custom Prompt */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="custom-prompt" checked={useCustomPrompt} onCheckedChange={setUseCustomPrompt} />
                    <Label htmlFor="custom-prompt">Use Custom Prompt</Label>
                  </div>
                  {useCustomPrompt && (
                    <Textarea
                      placeholder="Enter your custom GODLEVEL prompt..."
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      rows={4}
                    />
                  )}
                </div>

                {/* Prompt Preview */}
                <div className="space-y-2">
                  <Label>Prompt Preview</Label>
                  <ScrollArea className="h-24 w-full rounded border p-2 bg-gray-50">
                    <p className="text-xs text-gray-600">
                      {previewPrompt.substring(0, 300)}
                      {previewPrompt.length > 300 && "..."}
                    </p>
                  </ScrollArea>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Characters: {previewPrompt.length}</span>
                    <span>Max: 4000</span>
                  </div>
                </div>

                {/* Technical Parameters */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Seed: {seed}</Label>
                    <Slider value={[seed]} onValueChange={(value) => setSeed(value[0])} min={1} max={9999} step={1} />
                  </div>

                  <div className="space-y-2">
                    <Label>Samples: {numSamples}</Label>
                    <Slider
                      value={[numSamples]}
                      onValueChange={(value) => setNumSamples(value[0])}
                      min={1000}
                      max={8000}
                      step={500}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Noise Scale: {noiseScale}</Label>
                    <Slider
                      value={[noiseScale]}
                      onValueChange={(value) => setNoiseScale(value[0])}
                      min={0.01}
                      max={0.2}
                      step={0.01}
                    />
                  </div>
                </div>

                <Separator />

                {/* Generate All Button */}
                <Button
                  onClick={generateAllFormats}
                  disabled={isGeneratingAll || apiKeyStatus !== "valid"}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  size="lg"
                >
                  {isGeneratingAll ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Generating All Formats...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5 mr-2" />
                      Generate All 3 Formats Simultaneously
                    </>
                  )}
                </Button>

                {isGeneratingAll && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>Generating GODLEVEL quality...</span>
                    </div>
                    <Progress value={33} className="w-full" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Generated Images */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
              {/* Standard Image */}
              {renderImageCard(
                "standard",
                "Standard Image",
                "1024×1024 GODLEVEL quality",
                <Camera className="h-5 w-5 text-blue-500" />,
              )}

              {/* Dome Projection */}
              {renderImageCard(
                "dome",
                "Dome Projection",
                "Fisheye format for planetarium",
                <Eye className="h-5 w-5 text-green-500" />,
              )}

              {/* 360° Panorama */}
              {renderImageCard(
                "360",
                "360° Panorama",
                "VR-ready equirectangular format",
                <Globe className="h-5 w-5 text-purple-500" />,
              )}
            </div>

            {/* Info Cards */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Alert>
                <Camera className="h-4 w-4" />
                <AlertDescription>
                  <strong>Standard:</strong> GODLEVEL quality perfect for prints, social media, and exhibitions.
                </AlertDescription>
              </Alert>

              <Alert>
                <Eye className="h-4 w-4" />
                <AlertDescription>
                  <strong>Dome:</strong> Optimized for planetarium and dome projection with perfect fisheye distortion.
                </AlertDescription>
              </Alert>

              <Alert>
                <Globe className="h-4 w-4" />
                <AlertDescription>
                  <strong>360°:</strong> Immersive VR format with seamless wrapping for virtual reality experiences.
                </AlertDescription>
              </Alert>
            </div>

            {/* Format Settings */}
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Format Settings</CardTitle>
                  <CardDescription>Configure specific settings for each output format</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 360° Settings */}
                  <div className="space-y-2">
                    <Label>360° Panorama Format</Label>
                    <Select value={panoramaFormat} onValueChange={setPanoramaFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equirectangular">Equirectangular (VR Ready)</SelectItem>
                        <SelectItem value="stereographic">Stereographic (Little Planet)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dome Settings */}
                  <div className="space-y-2">
                    <Label>Dome Projection Type</Label>
                    <Select value={projectionType} onValueChange={setProjectionType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fisheye">Fisheye</SelectItem>
                        <SelectItem value="tunnel-up">Tunnel Up</SelectItem>
                        <SelectItem value="tunnel-down">Tunnel Down</SelectItem>
                        <SelectItem value="little-planet">Little Planet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
