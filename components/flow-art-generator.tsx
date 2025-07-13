"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, Sparkles, Zap, ImageIcon, Palette } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface GeneratedImage {
  id: string
  image: string
  dataset: string
  seed: number
  colorScheme: string
  numSamples: number
  noise: number
  timestamp: number
  type: "mathematical" | "ai"
}

export function FlowArtGenerator() {
  const [dataset, setDataset] = useState("spiral")
  const [seed, setSeed] = useState(42)
  const [colorScheme, setColorScheme] = useState("viridis")
  const [numSamples, setNumSamples] = useState([200])
  const [noise, setNoise] = useState([0.1])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUpscaling, setIsUpscaling] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [upscaledImage, setUpscaledImage] = useState<string | null>(null)
  const [gallery, setGallery] = useState<GeneratedImage[]>([])
  const [activeTab, setActiveTab] = useState("generate")
  const [generationType, setGenerationType] = useState<"mathematical" | "ai">("mathematical")

  const datasets = [
    { value: "spiral", label: "Spiral" },
    { value: "moons", label: "Two Moons" },
    { value: "circles", label: "Concentric Circles" },
    { value: "checkerboard", label: "Checkerboard" },
    { value: "swiss_roll", label: "Swiss Roll" },
    { value: "s_curve", label: "S-Curve" },
    { value: "blobs", label: "Gaussian Blobs" },
    { value: "aniso", label: "Anisotropic" },
  ]

  const colorSchemes = [
    { value: "viridis", label: "Viridis" },
    { value: "plasma", label: "Plasma" },
    { value: "inferno", label: "Inferno" },
    { value: "magma", label: "Magma" },
    { value: "cividis", label: "Cividis" },
    { value: "turbo", label: "Turbo" },
    { value: "rainbow", label: "Rainbow" },
    { value: "cool", label: "Cool" },
    { value: "warm", label: "Warm" },
  ]

  const generateMathematicalArt = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-art", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataset,
          seed,
          numSamples: numSamples[0],
          noise: noise[0],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate art")
      }

      const data = await response.json()
      setGeneratedImage(data.image)

      // Save to gallery
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        image: data.image,
        dataset,
        seed,
        colorScheme,
        numSamples: numSamples[0],
        noise: noise[0],
        timestamp: Date.now(),
        type: "mathematical",
      }
      setGallery((prev) => [newImage, ...prev])

      toast({
        title: "Art Generated!",
        description: "Your mathematical flow art has been created successfully.",
      })
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate art. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const generateAIArt = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-ai-art", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataset,
          seed,
          colorScheme,
          numSamples: numSamples[0],
          noise: noise[0],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate AI art")
      }

      const data = await response.json()
      setGeneratedImage(data.image)

      // Save to gallery
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        image: data.image,
        dataset,
        seed,
        colorScheme,
        numSamples: numSamples[0],
        noise: noise[0],
        timestamp: Date.now(),
        type: "ai",
      }
      setGallery((prev) => [newImage, ...prev])

      toast({
        title: "AI Art Generated!",
        description: "Your AI-enhanced flow art has been created successfully.",
      })
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate AI art. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const upscaleImage = async () => {
    if (!generatedImage) return

    setIsUpscaling(true)
    try {
      const response = await fetch("/api/upscale-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageData: generatedImage,
          scaleFactor: 4,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to upscale image")
      }

      const data = await response.json()
      setUpscaledImage(data.image)

      toast({
        title: "Image Upscaled!",
        description: "Your image has been enhanced to 4x resolution.",
      })
    } catch (error) {
      toast({
        title: "Upscaling Failed",
        description: "Failed to upscale image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpscaling(false)
    }
  }

  const downloadImage = (imageData: string, filename: string) => {
    const link = document.createElement("a")
    link.href = imageData
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const randomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 10000))
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          FlowSketch Art Generator
        </h1>
        <p className="text-muted-foreground text-lg">Create stunning mathematical and AI-enhanced generative art</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate Art</TabsTrigger>
          <TabsTrigger value="gallery">Gallery ({gallery.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Art Parameters
                </CardTitle>
                <CardDescription>Customize your generative art parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Generation Type */}
                <div className="space-y-2">
                  <Label>Generation Type</Label>
                  <Select
                    value={generationType}
                    onValueChange={(value: "mathematical" | "ai") => setGenerationType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mathematical">Mathematical Patterns</SelectItem>
                      <SelectItem value="ai">AI-Enhanced Art</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Dataset */}
                <div className="space-y-2">
                  <Label>Dataset Pattern</Label>
                  <Select value={dataset} onValueChange={setDataset}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {datasets.map((ds) => (
                        <SelectItem key={ds.value} value={ds.value}>
                          {ds.label}
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
                      {colorSchemes.map((cs) => (
                        <SelectItem key={cs.value} value={cs.value}>
                          {cs.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Seed */}
                <div className="space-y-2">
                  <Label>Seed</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={seed}
                      onChange={(e) => setSeed(Number.parseInt(e.target.value) || 0)}
                      className="flex-1"
                    />
                    <Button variant="outline" onClick={randomizeSeed}>
                      <Zap className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Number of Samples */}
                <div className="space-y-2">
                  <Label>Number of Samples: {numSamples[0]}</Label>
                  <Slider
                    value={numSamples}
                    onValueChange={setNumSamples}
                    min={50}
                    max={1000}
                    step={50}
                    className="w-full"
                  />
                </div>

                {/* Noise Level */}
                <div className="space-y-2">
                  <Label>Noise Level: {noise[0].toFixed(2)}</Label>
                  <Slider value={noise} onValueChange={setNoise} min={0} max={1} step={0.05} className="w-full" />
                </div>

                <Separator />

                {/* Generate Button */}
                <Button
                  onClick={generationType === "mathematical" ? generateMathematicalArt : generateAIArt}
                  disabled={isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate {generationType === "mathematical" ? "Mathematical" : "AI"} Art
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Generated Art
                </CardTitle>
                <CardDescription>Your generated artwork will appear here</CardDescription>
              </CardHeader>
              <CardContent>
                {generatedImage ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={generatedImage || "/placeholder.svg"}
                        alt="Generated Art"
                        className="w-full h-auto rounded-lg border"
                      />
                      <Badge className="absolute top-2 right-2">
                        {generationType === "mathematical" ? "Mathematical" : "AI Enhanced"}
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => downloadImage(generatedImage, `flowsketch-${Date.now()}.png`)}
                        variant="outline"
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button onClick={upscaleImage} disabled={isUpscaling} className="flex-1">
                        {isUpscaling ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Upscaling...
                          </>
                        ) : (
                          "Upscale 4x"
                        )}
                      </Button>
                    </div>

                    {upscaledImage && (
                      <div className="space-y-2">
                        <Label>Upscaled Version (4x)</Label>
                        <img
                          src={upscaledImage || "/placeholder.svg"}
                          alt="Upscaled Art"
                          className="w-full h-auto rounded-lg border"
                        />
                        <Button
                          onClick={() => downloadImage(upscaledImage, `flowsketch-upscaled-${Date.now()}.png`)}
                          variant="outline"
                          className="w-full"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Upscaled
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">Generate art to see preview</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Art Gallery</CardTitle>
              <CardDescription>Browse your generated artwork collection</CardDescription>
            </CardHeader>
            <CardContent>
              {gallery.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gallery.map((item) => (
                    <div key={item.id} className="space-y-2">
                      <div className="relative">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={`${item.dataset} art`}
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                        <Badge className="absolute top-2 right-2">{item.type === "mathematical" ? "Math" : "AI"}</Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{item.dataset}</p>
                        <p className="text-xs text-muted-foreground">
                          Seed: {item.seed} | Samples: {item.numSamples}
                        </p>
                        <p className="text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleDateString()}</p>
                      </div>
                      <Button
                        onClick={() => downloadImage(item.image, `flowsketch-${item.id}.png`)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No artwork generated yet. Create your first piece!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
