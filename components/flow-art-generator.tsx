"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Download, Sparkles, Zap, Database, Cloud, HardDrive } from "lucide-react"
import { upscaleImageBicubic, createImageFromDataUrl } from "@/lib/client-upscaler"

interface GenerationResult {
  id?: string
  image: string
  storage?: {
    database: string
    cloudinary: string
    fallback: string
  }
  cloudinary?: {
    public_id: string
    width: number
    height: number
    format: string
    bytes: number
  }
  generation_params?: any
  baseResolution?: string
  readyForUpscaling?: boolean
  recommendedUpscale?: string
}

export function FlowArtGenerator() {
  const [dataset, setDataset] = useState("spiral")
  const [seed, setSeed] = useState(42)
  const [numSamples, setNumSamples] = useState(1000)
  const [noise, setNoise] = useState(0.1)
  const [colorScheme, setColorScheme] = useState("viridis")
  const [generatedImage, setGeneratedImage] = useState<GenerationResult | null>(null)
  const [upscaledImage, setUpscaledImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUpscaling, setIsUpscaling] = useState(false)
  const [upscaleProgress, setUpscaleProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("svg")

  const handleGenerate = async (type: "svg" | "ai") => {
    setIsGenerating(true)
    setGeneratedImage(null)
    setUpscaledImage(null)

    try {
      const endpoint = type === "svg" ? "/api/generate-art" : "/api/generate-ai-art"
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataset,
          seed,
          numSamples,
          noise,
          colorScheme,
        }),
      })

      if (!response.ok) {
        throw new Error("Generation failed")
      }

      const result: GenerationResult = await response.json()
      setGeneratedImage(result)
    } catch (error) {
      console.error("Generation error:", error)
      alert("Failed to generate artwork. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUpscale = async () => {
    if (!generatedImage) return

    setIsUpscaling(true)
    setUpscaleProgress(0)

    try {
      // Create image element from the generated image
      const img = await createImageFromDataUrl(generatedImage.image)

      // Perform client-side bicubic upscaling
      const upscaledDataUrl = await upscaleImageBicubic(img, 4, setUpscaleProgress)
      setUpscaledImage(upscaledDataUrl)

      // Try to save the upscaled image to database/cloudinary
      if (generatedImage.id) {
        try {
          await fetch("/api/upscale-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageData: upscaledDataUrl,
              scaleFactor: 4,
              originalGenerationId: generatedImage.id,
            }),
          })
        } catch (saveError) {
          console.error("Failed to save upscaled image:", saveError)
          // Continue anyway - we have the upscaled image
        }
      }
    } catch (error) {
      console.error("Upscaling error:", error)
      alert("Failed to upscale image. Please try again.")
    } finally {
      setIsUpscaling(false)
      setUpscaleProgress(0)
    }
  }

  const downloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const StorageStatus = ({ storage }: { storage?: GenerationResult["storage"] }) => {
    if (!storage) return null

    return (
      <div className="flex gap-2 flex-wrap">
        <Badge variant={storage.database === "supabase" ? "default" : "destructive"}>
          <Database className="w-3 h-3 mr-1" />
          DB: {storage.database}
        </Badge>
        <Badge variant={storage.cloudinary === "uploaded" ? "default" : "secondary"}>
          <Cloud className="w-3 h-3 mr-1" />
          CDN: {storage.cloudinary}
        </Badge>
        <Badge variant="outline">
          <HardDrive className="w-3 h-3 mr-1" />
          Fallback: {storage.fallback}
        </Badge>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">FlowSketch Art Generator</h1>
        <p className="text-muted-foreground">Generate beautiful mathematical art with SVG precision or AI creativity</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Generation Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="svg">SVG Generation</TabsTrigger>
                <TabsTrigger value="ai">AI Generation</TabsTrigger>
              </TabsList>

              <TabsContent value="svg" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="dataset">Dataset Type</Label>
                    <Select value={dataset} onValueChange={setDataset}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spiral">Spiral</SelectItem>
                        <SelectItem value="circle">Circle</SelectItem>
                        <SelectItem value="wave">Wave</SelectItem>
                        <SelectItem value="fractal">Fractal</SelectItem>
                        <SelectItem value="noise">Noise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="seed">Seed</Label>
                    <Input
                      id="seed"
                      type="number"
                      value={seed}
                      onChange={(e) => setSeed(Number.parseInt(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label>Samples: {numSamples}</Label>
                    <Slider
                      value={[numSamples]}
                      onValueChange={(value) => setNumSamples(value[0])}
                      min={100}
                      max={5000}
                      step={100}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Noise: {noise}</Label>
                    <Slider
                      value={[noise]}
                      onValueChange={(value) => setNoise(value[0])}
                      min={0}
                      max={1}
                      step={0.01}
                      className="mt-2"
                    />
                  </div>
                </div>

                <Button onClick={() => handleGenerate("svg")} disabled={isGenerating} className="w-full">
                  {isGenerating ? "Generating..." : "Generate SVG Art"}
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              </TabsContent>

              <TabsContent value="ai" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="dataset-ai">Dataset Inspiration</Label>
                    <Select value={dataset} onValueChange={setDataset}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spiral">Spiral Patterns</SelectItem>
                        <SelectItem value="circle">Circular Forms</SelectItem>
                        <SelectItem value="wave">Wave Dynamics</SelectItem>
                        <SelectItem value="fractal">Fractal Geometry</SelectItem>
                        <SelectItem value="noise">Organic Noise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="color-scheme">Color Scheme</Label>
                    <Select value={colorScheme} onValueChange={setColorScheme}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viridis">Viridis</SelectItem>
                        <SelectItem value="plasma">Plasma</SelectItem>
                        <SelectItem value="inferno">Inferno</SelectItem>
                        <SelectItem value="magma">Magma</SelectItem>
                        <SelectItem value="cool">Cool</SelectItem>
                        <SelectItem value="warm">Warm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="seed-ai">Creative Seed</Label>
                    <Input
                      id="seed-ai"
                      type="number"
                      value={seed}
                      onChange={(e) => setSeed(Number.parseInt(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label>Elements: {numSamples}</Label>
                    <Slider
                      value={[numSamples]}
                      onValueChange={(value) => setNumSamples(value[0])}
                      min={100}
                      max={5000}
                      step={100}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Texture Noise: {noise}</Label>
                    <Slider
                      value={[noise]}
                      onValueChange={(value) => setNoise(value[0])}
                      min={0}
                      max={1}
                      step={0.01}
                      className="mt-2"
                    />
                  </div>
                </div>

                <Button onClick={() => handleGenerate("ai")} disabled={isGenerating} className="w-full">
                  {isGenerating ? "Generating..." : "Generate AI Art"}
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Artwork</CardTitle>
          </CardHeader>
          <CardContent>
            {generatedImage ? (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={generatedImage.image || "/placeholder.svg"}
                    alt="Generated artwork"
                    className="w-full rounded-lg border"
                  />
                  {generatedImage.baseResolution && (
                    <Badge className="absolute top-2 right-2">{generatedImage.baseResolution}</Badge>
                  )}
                </div>

                <StorageStatus storage={generatedImage.storage} />

                {generatedImage.cloudinary && (
                  <div className="text-sm text-muted-foreground">
                    <p>Size: {(generatedImage.cloudinary.bytes / 1024).toFixed(1)} KB</p>
                    <p>Format: {generatedImage.cloudinary.format.toUpperCase()}</p>
                    <p>
                      Dimensions: {generatedImage.cloudinary.width}×{generatedImage.cloudinary.height}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => downloadImage(generatedImage.image, `flowsketch-${Date.now()}.png`)}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>

                  <Button onClick={handleUpscale} disabled={isUpscaling} size="sm">
                    {isUpscaling ? "Upscaling..." : "Upscale 4x"}
                    <Zap className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                {isUpscaling && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Upscaling Progress</span>
                      <span>{upscaleProgress}%</span>
                    </div>
                    <Progress value={upscaleProgress} />
                  </div>
                )}

                {upscaledImage && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="font-semibold">Upscaled Result (4x)</h3>
                      <div className="relative">
                        <img
                          src={upscaledImage || "/placeholder.svg"}
                          alt="Upscaled artwork"
                          className="w-full rounded-lg border"
                        />
                        <Badge className="absolute top-2 right-2">7168×4096</Badge>
                      </div>
                      <Button
                        onClick={() => downloadImage(upscaledImage, `flowsketch-upscaled-${Date.now()}.png`)}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Upscaled
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Generate your first artwork to see results here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// keep default export so the component can also be imported without braces
export default FlowArtGenerator
