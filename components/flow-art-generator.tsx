"use client"

import { useState, useCallback } from "react"
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
import { Download, Sparkles, Settings, ImageIcon, Info, Loader2, Zap, Wand2, Edit3 } from "lucide-react"
import { generateFlowField, type GenerationParams } from "@/lib/flow-model"
import { ClientUpscaler } from "@/lib/client-upscaler"
import { useToast } from "@/hooks/use-toast"

interface GeneratedArt {
  svgContent: string
  imageUrl: string
  upscaledImageUrl?: string
  params: GenerationParams
  mode: "svg" | "ai"
  upscaleMethod?: "cloudinary" | "client" | "mathematical"
  customPrompt?: string
}

export function FlowArtGenerator() {
  const [generatedArt, setGeneratedArt] = useState<GeneratedArt | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUpscaling, setIsUpscaling] = useState(false)
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false)
  const [progress, setProgress] = useState(0)
  const [mode, setMode] = useState<"svg" | "ai">("svg")

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
        description: "Mathematical concepts and artistic details added to your prompt.",
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
  }, [dataset, scenario, colorScheme, numSamples, noiseScale, customPrompt, toast])

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

        setProgress(100)
        setGeneratedArt({
          svgContent,
          imageUrl,
          params,
          mode: "svg",
        })

        toast({
          title: `${dataset.charAt(0).toUpperCase() + dataset.slice(1)} + ${scenario === "pure" ? "Pure Math" : scenario.charAt(0).toUpperCase() + scenario.slice(1)} Generated! 🎨`,
          description: `Beautiful ${dataset} dataset with ${scenario === "pure" ? "pure mathematical" : scenario} ${scenario === "pure" ? "visualization" : "scenario"} in ${colorScheme} colors.`,
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
        setGeneratedArt({
          svgContent: "",
          imageUrl: data.image,
          params,
          mode: "ai",
          customPrompt: useCustomPrompt ? customPrompt : undefined,
        })

        setProgress(100)
        toast({
          title: "AI Art Generated! 🤖✨",
          description: useCustomPrompt
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

  const downloadImage = useCallback(async () => {
    if (!generatedArt) {
      console.log("No generated art to download")
      return
    }

    console.log("Download button clicked!")

    try {
      const imageUrl = generatedArt.upscaledImageUrl || generatedArt.imageUrl
      const isEnhanced = !!generatedArt.upscaledImageUrl
      const fileExtension = generatedArt.mode === "svg" && !isEnhanced ? "svg" : "png"
      const fileName = `flowsketch-${generatedArt.mode}-${generatedArt.params.dataset}-${generatedArt.params.scenario}-${generatedArt.params.colorScheme}-${generatedArt.params.seed}${isEnhanced ? "-enhanced" : ""}.${fileExtension}`

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
        description: `${isEnhanced ? "Enhanced" : "Original"} ${generatedArt.params.dataset} + ${generatedArt.params.scenario === "pure" ? "pure math" : generatedArt.params.scenario} in ${generatedArt.params.colorScheme} colors downloaded.`,
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

  const getButtonText = () => {
    const scenarioText = scenario === "pure" ? "Pure Math" : scenario.charAt(0).toUpperCase() + scenario.slice(1)

    if (mode === "ai") {
      if (useCustomPrompt) {
        return "Generate Custom AI Art"
      }
      return `Generate AI ${dataset.charAt(0).toUpperCase() + dataset.slice(1)} + ${scenarioText}`
    } else {
      return `Generate ${dataset.charAt(0).toUpperCase() + dataset.slice(1)} + ${scenarioText}`
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
          FlowSketch Dataset + Scenario Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Choose a dataset pattern, scenario effects, and color palette
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
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="svg">Dataset + Scenario</TabsTrigger>
                  <TabsTrigger value="ai">AI Art</TabsTrigger>
                </TabsList>

                <TabsContent value="svg" className="space-y-4">
                  <Alert>
                    <Zap className="h-4 w-4" />
                    <AlertDescription>
                      Choose dataset pattern, scenario effects, and color palette independently for maximum creativity!
                    </AlertDescription>
                  </Alert>
                </TabsContent>

                <TabsContent value="ai" className="space-y-4">
                  <Alert>
                    <Sparkles className="h-4 w-4" />
                    <AlertDescription>
                      Create AI-generated artwork based on your dataset, scenario, and color palette combination. Use
                      prompt enhancement for better results!
                    </AlertDescription>
                  </Alert>
                </TabsContent>
              </Tabs>

              <div className="space-y-2">
                <Label>Dataset Pattern</Label>
                <Select value={dataset} onValueChange={setDataset}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spirals">🌀 Spirals</SelectItem>
                    <SelectItem value="moons">🌙 Moons</SelectItem>
                    <SelectItem value="circles">⭕ Circles</SelectItem>
                    <SelectItem value="blobs">🔵 Blobs</SelectItem>
                    <SelectItem value="checkerboard">🏁 Checkerboard</SelectItem>
                    <SelectItem value="gaussian">📊 Gaussian</SelectItem>
                    <SelectItem value="grid">⚏ Grid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Scenario Effects</Label>
                <Select value={scenario} onValueChange={setScenario}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pure">🔢 Pure Mathematical</SelectItem>
                    <SelectItem value="forest">🌲 Forest Growth</SelectItem>
                    <SelectItem value="cosmic">🌌 Cosmic Spiral</SelectItem>
                    <SelectItem value="ocean">🌊 Ocean Waves</SelectItem>
                    <SelectItem value="neural">🧠 Neural Network</SelectItem>
                    <SelectItem value="fire">🔥 Fire Dynamics</SelectItem>
                    <SelectItem value="ice">❄️ Ice Crystals</SelectItem>
                    <SelectItem value="desert">🏜️ Desert Dunes</SelectItem>
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
                    <SelectItem value="plasma">🟣 Plasma</SelectItem>
                    <SelectItem value="lava">🔴 Lava</SelectItem>
                    <SelectItem value="futuristic">🔵 Futuristic</SelectItem>
                    <SelectItem value="forest">🟢 Forest</SelectItem>
                    <SelectItem value="ocean">🌊 Ocean</SelectItem>
                    <SelectItem value="sunset">🌅 Sunset</SelectItem>
                    <SelectItem value="arctic">❄️ Arctic</SelectItem>
                    <SelectItem value="neon">💚 Neon</SelectItem>
                    <SelectItem value="vintage">🟤 Vintage</SelectItem>
                    <SelectItem value="cosmic">🌌 Cosmic</SelectItem>
                    <SelectItem value="toxic">🟡 Toxic</SelectItem>
                    <SelectItem value="ember">🟠 Ember</SelectItem>
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
                    placeholder="Click 'Enhance' to generate a mathematical AI art prompt, or write your own custom prompt here..."
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
                    ? "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600"
                    : "bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 hover:from-green-600 hover:via-blue-600 hover:to-purple-600"
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {mode === "ai" ? "Generating AI Art..." : "Generating Art..."}
                  </>
                ) : (
                  <>
                    {mode === "ai" ? <Sparkles className="h-4 w-4 mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                    {getButtonText()}
                  </>
                )}
              </Button>

              {isGenerating && (
                <div className="space-y-2">
                  <Progress value={progress} />
                  <p className="text-sm text-center text-gray-600">
                    {progress < 30
                      ? `Generating ${dataset} dataset...`
                      : progress < 60
                        ? mode === "ai"
                          ? useCustomPrompt
                            ? "Processing custom prompt..."
                            : "Applying AI artistic effects..."
                          : scenario === "pure"
                            ? "Applying pure mathematical visualization..."
                            : `Applying ${scenario} scenario effects...`
                        : progress < 90
                          ? "Rendering visualization..."
                          : "Finalizing artwork..."}
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
                <Button onClick={downloadImage} variant="outline" className="w-full bg-transparent">
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
                      {generatedArt.mode === "svg" ? "Adding Detail..." : "Enhancing AI Art..."}
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
                  Generated Artwork
                </span>
                {generatedArt && (
                  <div className="flex gap-2">
                    <Badge variant={generatedArt.mode === "ai" ? "default" : "outline"}>
                      {generatedArt.mode === "ai" ? "🤖 AI Art" : "📊 SVG"}
                    </Badge>
                    <Badge variant="outline">{generatedArt.params.dataset}</Badge>
                    <Badge variant="outline">
                      {generatedArt.params.scenario === "pure" ? "pure math" : generatedArt.params.scenario}
                    </Badge>
                    <Badge variant="outline">{generatedArt.params.colorScheme}</Badge>
                    <Badge variant="outline">{generatedArt.params.numSamples} points</Badge>
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

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Mode:</span>
                      <p className="font-medium">{generatedArt.mode === "ai" ? "AI Art" : "SVG"}</p>
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
                    <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Choose a dataset, scenario, and color palette!</p>
                    <p className="text-sm mt-2">
                      Try Spirals + Pure Math + Plasma or Gaussian + Neural + Futuristic for stunning results
                    </p>
                    <p className="text-sm mt-1 text-purple-600">
                      Switch to AI Art tab and use prompt enhancement for professional results! 🤖✨
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
