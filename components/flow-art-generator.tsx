"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, Palette, Settings, Sparkles, Zap } from "lucide-react"
import { toast } from "sonner"

interface GeneratedImage {
  url: string
  metadata: {
    dataset: string
    scenario: string
    colorScheme: string
    seed: number
    numSamples: number
    noise: number
  }
}

export function FlowArtGenerator() {
  const [dataset, setDataset] = useState("spirals")
  const [scenario, setScenario] = useState("landscape")
  const [colorScheme, setColorScheme] = useState("plasma")
  const [seed, setSeed] = useState(1234)
  const [numSamples, setNumSamples] = useState(3000)
  const [noise, setNoise] = useState(0.1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null)

  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false)
  const [customPrompt, setCustomPrompt] = useState("")
  const [enhancedPrompt, setEnhancedPrompt] = useState("")
  const [aiImage, setAiImage] = useState<string | null>(null)
  const [isUpscaling, setIsUpscaling] = useState(false)
  const [upscaledImage, setUpscaledImage] = useState<string | null>(null)

  const datasets = [
    { value: "spirals", label: "Spirals", description: "Two interleaved spirals" },
    { value: "moons", label: "Moons", description: "Two crescent moon shapes" },
    { value: "circles", label: "Circles", description: "Concentric circles" },
    { value: "blobs", label: "Blobs", description: "Four clustered regions" },
    { value: "checkerboard", label: "Checkerboard", description: "Checkerboard pattern" },
    { value: "gaussian", label: "Gaussian", description: "Normal distribution" },
    { value: "grid", label: "Grid", description: "Regular grid pattern" },
    { value: "fractal", label: "Fractal", description: "Sierpinski triangle" },
    { value: "mandelbrot", label: "Mandelbrot", description: "Mandelbrot set" },
    { value: "julia", label: "Julia Set", description: "Julia set fractal" },
    { value: "lorenz", label: "Lorenz", description: "Lorenz attractor" },
    { value: "tribes", label: "Tribes", description: "Tribal settlements" },
    { value: "heads", label: "Heads", description: "Face patterns" },
    { value: "natives", label: "Natives", description: "Native settlements" },
  ]

  const scenarios = [
    { value: "landscape", label: "Landscape", description: "Natural terrain" },
    { value: "architectural", label: "Architectural", description: "Building structures" },
    { value: "crystalline", label: "Crystalline", description: "Crystal formations" },
    { value: "botanical", label: "Botanical", description: "Plant life" },
    { value: "cosmic", label: "Cosmic", description: "Space themes" },
    { value: "ocean", label: "Ocean", description: "Underwater scenes" },
    { value: "forest", label: "Forest", description: "Woodland environments" },
    { value: "desert", label: "Desert", description: "Arid landscapes" },
  ]

  const colorSchemes = [
    { value: "plasma", label: "Plasma", description: "Purple to yellow" },
    { value: "magma", label: "Magma", description: "Black to white through red" },
    { value: "sunset", label: "Sunset", description: "Warm oranges and pinks" },
    { value: "cosmic", label: "Cosmic", description: "Deep space colors" },
    { value: "quantum", label: "Quantum", description: "Electric blues" },
    { value: "thermal", label: "Thermal", description: "Heat map colors" },
    { value: "spectral", label: "Spectral", description: "Rainbow spectrum" },
    { value: "crystalline", label: "Crystalline", description: "Gem-like colors" },
    { value: "bioluminescent", label: "Bioluminescent", description: "Glowing blues and greens" },
    { value: "aurora", label: "Aurora", description: "Northern lights" },
    { value: "metallic", label: "Metallic", description: "Gold and silver" },
    { value: "neon", label: "Neon", description: "Electric colors" },
  ]

  const generateArt = async () => {
    setIsGenerating(true)
    try {
      console.log("Generating art with params:", { dataset, scenario, colorScheme, seed, numSamples, noise })

      const response = await fetch("/api/generate-art", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dataset,
          scenario,
          colorScheme,
          seed,
          numSamples,
          noise,
        }),
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API error response:", errorText)
        throw new Error(`API request failed: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log("API response data:", data)

      if (data.success && data.image) {
        setGeneratedImage({
          url: data.image,
          metadata: {
            dataset,
            scenario,
            colorScheme,
            seed,
            numSamples,
            noise,
          },
        })
        toast.success("Artwork generated successfully!")
      } else {
        throw new Error(data.error || "No image returned from API")
      }
    } catch (error: any) {
      console.error("Error generating art:", error)
      toast.error(`Failed to generate artwork: ${error.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateAIArt = async () => {
    setIsGeneratingAI(true)
    try {
      console.log("Generating AI art with params:", {
        dataset,
        scenario,
        colorScheme,
        seed,
        numSamples,
        noise,
        customPrompt,
      })

      const response = await fetch("/api/generate-ai-art", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dataset,
          scenario,
          colorScheme,
          seed,
          numSamples,
          noise,
          customPrompt: enhancedPrompt || customPrompt,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`AI generation failed: ${response.status} - ${errorText}`)
      }

      const data = await response.json()

      if (data.image) {
        setAiImage(data.image)
        toast.success("AI artwork generated successfully!")
      } else {
        throw new Error("No AI image returned")
      }
    } catch (error: any) {
      console.error("Error generating AI art:", error)
      toast.error(`Failed to generate AI artwork: ${error.message}`)
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const enhancePrompt = async () => {
    setIsEnhancingPrompt(true)
    try {
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dataset,
          scenario,
          colorScheme,
          numSamples,
          noiseScale: noise,
          currentPrompt: customPrompt,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to enhance prompt")
      }

      const data = await response.json()
      setEnhancedPrompt(data.enhancedPrompt)
      toast.success("Prompt enhanced with AI!")
    } catch (error: any) {
      console.error("Error enhancing prompt:", error)
      toast.error(`Failed to enhance prompt: ${error.message}`)
    } finally {
      setIsEnhancingPrompt(false)
    }
  }

  const upscaleImage = async () => {
    if (!aiImage) return

    setIsUpscaling(true)
    try {
      const response = await fetch("/api/upscale-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageData: aiImage,
          scaleFactor: 4,
          upscaleModel: "real-esrgan",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to upscale image")
      }

      const data = await response.json()

      if (data.requiresClientUpscaling) {
        // Use client-side upscaling
        const { ClientUpscaler } = await import("@/lib/client-upscaler")
        const upscaled = await ClientUpscaler.upscaleImage(aiImage, 4)
        setUpscaledImage(upscaled)
      } else {
        setUpscaledImage(data.image)
      }

      toast.success("Image upscaled successfully!")
    } catch (error: any) {
      console.error("Error upscaling image:", error)
      toast.error(`Failed to upscale image: ${error.message}`)
    } finally {
      setIsUpscaling(false)
    }
  }

  const downloadImage = () => {
    if (!generatedImage) return

    const link = document.createElement("a")
    link.href = generatedImage.url
    link.download = `flowsketch-${dataset}-${Date.now()}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Image downloaded!")
  }

  const randomizeSettings = () => {
    const randomDataset = datasets[Math.floor(Math.random() * datasets.length)]
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)]
    const randomColorScheme = colorSchemes[Math.floor(Math.random() * colorSchemes.length)]
    const randomSeed = Math.floor(Math.random() * 10000)
    const randomSamples = Math.floor(Math.random() * 4000) + 1000
    const randomNoise = Math.random() * 0.3

    setDataset(randomDataset.value)
    setScenario(randomScenario.value)
    setColorScheme(randomColorScheme.value)
    setSeed(randomSeed)
    setNumSamples(randomSamples)
    setNoise(randomNoise)

    toast.success("Settings randomized!")
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          FlowSketch Art Generator
        </h1>
        <p className="text-muted-foreground text-lg">Create stunning mathematical art with procedural generation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Dataset & Style
              </CardTitle>
              <CardDescription>Choose your mathematical foundation and visual style</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="dataset">Mathematical Dataset</Label>
                <Select value={dataset} onValueChange={setDataset}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {datasets.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        <div>
                          <div className="font-medium">{d.label}</div>
                          <div className="text-sm text-muted-foreground">{d.description}</div>
                        </div>
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
                    {scenarios.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        <div>
                          <div className="font-medium">{s.label}</div>
                          <div className="text-sm text-muted-foreground">{s.description}</div>
                        </div>
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
                    {colorSchemes.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        <div>
                          <div className="font-medium">{c.label}</div>
                          <div className="text-sm text-muted-foreground">{c.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Parameters
              </CardTitle>
              <CardDescription>Fine-tune the generation parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="seed">Seed: {seed}</Label>
                <Slider
                  value={[seed]}
                  onValueChange={(value) => setSeed(value[0])}
                  max={9999}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="numSamples">Samples: {numSamples.toLocaleString()}</Label>
                <Slider
                  value={[numSamples]}
                  onValueChange={(value) => setNumSamples(value[0])}
                  max={5000}
                  min={500}
                  step={100}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="noise">Noise: {noise.toFixed(2)}</Label>
                <Slider
                  value={[noise]}
                  onValueChange={(value) => setNoise(value[0])}
                  max={0.5}
                  min={0}
                  step={0.01}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Enhancement
              </CardTitle>
              <CardDescription>Create stunning AI art with enhanced prompts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customPrompt">Custom Prompt (Optional)</Label>
                <textarea
                  id="customPrompt"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Describe your vision... (leave empty for auto-generation)"
                  className="w-full min-h-[80px] p-3 border rounded-md resize-none"
                />
              </div>

              {enhancedPrompt && (
                <div>
                  <Label>Enhanced Prompt</Label>
                  <div className="p-3 bg-muted rounded-md text-sm">{enhancedPrompt}</div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={enhancePrompt}
                  disabled={isEnhancingPrompt}
                  variant="outline"
                  className="flex-1 bg-transparent"
                >
                  {isEnhancingPrompt ? (
                    <>
                      <Zap className="mr-2 h-4 w-4 animate-spin" />
                      Enhancing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Enhance Prompt
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button onClick={generateArt} disabled={isGenerating} className="w-full" size="lg">
              {isGenerating ? (
                <>
                  <Zap className="mr-2 h-4 w-4 animate-spin" />
                  Generating Math Art...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Mathematical Art
                </>
              )}
            </Button>

            <Button
              onClick={generateAIArt}
              disabled={isGeneratingAI}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              size="lg"
            >
              {isGeneratingAI ? (
                <>
                  <Zap className="mr-2 h-4 w-4 animate-spin" />
                  Generating AI Art...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate AI Art (DALL-E 3)
                </>
              )}
            </Button>

            <Button onClick={randomizeSettings} variant="outline" className="w-full bg-transparent">
              <Zap className="mr-2 h-4 w-4" />
              Randomize Settings
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Generated Artwork</CardTitle>
              <CardDescription>Your mathematical art will appear here</CardDescription>
            </CardHeader>
            <CardContent>
              {generatedImage || aiImage ? (
                <div className="space-y-4">
                  {/* Mathematical Art */}
                  {generatedImage && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Mathematical Art</h3>
                      <img
                        src={generatedImage.url || "/placeholder.svg"}
                        alt="Generated Mathematical Art"
                        className="w-full h-auto rounded-lg border shadow-lg"
                      />
                    </div>
                  )}

                  {/* AI Art */}
                  {aiImage && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">AI Enhanced Art</h3>
                      <img
                        src={aiImage || "/placeholder.svg"}
                        alt="Generated AI Art"
                        className="w-full h-auto rounded-lg border shadow-lg"
                      />

                      {!upscaledImage && (
                        <Button
                          onClick={upscaleImage}
                          disabled={isUpscaling}
                          className="w-full mt-2 bg-transparent"
                          variant="outline"
                        >
                          {isUpscaling ? (
                            <>
                              <Zap className="mr-2 h-4 w-4 animate-spin" />
                              Upscaling to 4K...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Upscale to 4K
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Upscaled Image */}
                  {upscaledImage && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">4K Upscaled Art</h3>
                      <img
                        src={upscaledImage || "/placeholder.svg"}
                        alt="Upscaled AI Art"
                        className="w-full h-auto rounded-lg border shadow-lg"
                      />
                    </div>
                  )}

                  {/* Metadata */}
                  {generatedImage && (
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{generatedImage.metadata.dataset}</Badge>
                      <Badge variant="secondary">{generatedImage.metadata.scenario}</Badge>
                      <Badge variant="secondary">{generatedImage.metadata.colorScheme}</Badge>
                      <Badge variant="outline">Seed: {generatedImage.metadata.seed}</Badge>
                      <Badge variant="outline">{generatedImage.metadata.numSamples.toLocaleString()} samples</Badge>
                    </div>
                  )}

                  <Separator />

                  <div className="flex gap-2">
                    {generatedImage && (
                      <Button onClick={downloadImage} className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        Download Math Art
                      </Button>
                    )}
                    {aiImage && (
                      <Button
                        onClick={() => {
                          const link = document.createElement("a")
                          link.href = upscaledImage || aiImage
                          link.download = `flowsketch-ai-${dataset}-${Date.now()}.png`
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                          toast.success("AI artwork downloaded!")
                        }}
                        className="flex-1"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download AI Art
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-96 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <div className="text-center">
                    <Sparkles className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">Generate mathematical art or AI art to see it here</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Mathematical art generates instantly • AI art creates stunning enhanced versions
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
