"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, RefreshCw, Heart } from "lucide-react"
import { toast } from "sonner"

import { SaveArtworkDialog } from "./gallery/save-artwork-dialog"
import { GalleryService } from "@/lib/gallery-service"

const FlowArtGenerator = () => {
  const [params, setParams] = useState({
    flowFieldDensity: 20,
    particleDensity: 5000,
    particleSpeed: 1,
    particleSize: 1,
    lineLength: 50,
    fadeIn: false,
    fadeOut: false,
    colorMode: "rainbow",
    rainbowSaturation: 100,
    rainbowLightness: 50,
    singleColor: "#ffffff",
  })
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [upscaledImage, setUpscaledImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUpscaling, setIsUpscaling] = useState(false)
  const [currentMode, setCurrentMode] = useState<"flow" | "ai">("flow")
  const [customPrompt, setCustomPrompt] = useState("")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [showSaveDialog, setShowSaveDialog] = useState(false)

  useEffect(() => {
    generateFlowArt()
  }, [])

  const generateFlowArt = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/flow-art", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ params }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setGeneratedImage(data.imageUrl)
    } catch (error) {
      console.error("Failed to generate flow art:", error)
      toast.error("Failed to generate flow art")
    } finally {
      setIsLoading(false)
    }
  }

  const generateAIArtwork = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/ai-art", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: customPrompt }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setGeneratedImage(data.imageUrl)
    } catch (error) {
      console.error("Failed to generate AI artwork:", error)
      toast.error("Failed to generate AI artwork")
    } finally {
      setIsLoading(false)
    }
  }

  const upscaleImage = async () => {
    if (!generatedImage) return

    setIsUpscaling(true)
    try {
      const response = await fetch("/api/upscale", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: generatedImage }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setUpscaledImage(data.upscaledImageUrl)
    } catch (error) {
      console.error("Failed to upscale image:", error)
      toast.error("Failed to upscale image")
    } finally {
      setIsUpscaling(false)
    }
  }

  const downloadImage = () => {
    if (!generatedImage) return

    const link = document.createElement("a")
    link.href = generatedImage
    link.download = "flow-art.png"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSaveToGallery = async (data: {
    title: string
    description: string
    tags: string[]
  }) => {
    if (!generatedImage) return

    try {
      await GalleryService.saveArtwork({
        title: data.title,
        description: data.description,
        imageUrl: generatedImage,
        upscaledImageUrl: upscaledImage || undefined,
        generationParams: params,
        mode: currentMode,
        customPrompt: currentMode === "ai" ? customPrompt : undefined,
        upscaleMethod: upscaledImage ? "AI Upscaler" : undefined,
        tags: data.tags,
      })

      toast.success("Artwork saved to gallery!")
    } catch (error) {
      console.error("Failed to save artwork:", error)
      toast.error("Failed to save artwork")
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Flow Art Generator</h1>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Adjust the parameters to generate your unique flow art.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="ai-mode">AI Mode</Label>
                <Switch
                  id="ai-mode"
                  checked={currentMode === "ai"}
                  onCheckedChange={(checked) => setCurrentMode(checked ? "ai" : "flow")}
                />
              </div>

              {currentMode === "ai" ? (
                <div>
                  <Label htmlFor="prompt">Prompt</Label>
                  <Input
                    type="text"
                    id="prompt"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Enter a prompt for the AI"
                  />
                  <Button onClick={generateAIArtwork} disabled={isLoading} className="mt-2 w-full">
                    {isLoading ? "Generating..." : "Generate AI Artwork"}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="flowFieldDensity">Flow Field Density</Label>
                    <Slider
                      id="flowFieldDensity"
                      defaultValue={[params.flowFieldDensity]}
                      max={50}
                      step={1}
                      onValueChange={(value) => setParams({ ...params, flowFieldDensity: value[0] })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="particleDensity">Particle Density</Label>
                    <Slider
                      id="particleDensity"
                      defaultValue={[params.particleDensity]}
                      max={10000}
                      step={100}
                      onValueChange={(value) => setParams({ ...params, particleDensity: value[0] })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="particleSpeed">Particle Speed</Label>
                    <Slider
                      id="particleSpeed"
                      defaultValue={[params.particleSpeed]}
                      max={10}
                      step={0.1}
                      onValueChange={(value) => setParams({ ...params, particleSpeed: value[0] })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="particleSize">Particle Size</Label>
                    <Slider
                      id="particleSize"
                      defaultValue={[params.particleSize]}
                      max={10}
                      step={0.1}
                      onValueChange={(value) => setParams({ ...params, particleSize: value[0] })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lineLength">Line Length</Label>
                    <Slider
                      id="lineLength"
                      defaultValue={[params.lineLength]}
                      max={200}
                      step={1}
                      onValueChange={(value) => setParams({ ...params, lineLength: value[0] })}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="fadeIn">Fade In</Label>
                    <Switch
                      id="fadeIn"
                      checked={params.fadeIn}
                      onCheckedChange={(checked) => setParams({ ...params, fadeIn: checked })}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="fadeOut">Fade Out</Label>
                    <Switch
                      id="fadeOut"
                      checked={params.fadeOut}
                      onCheckedChange={(checked) => setParams({ ...params, fadeOut: checked })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="colorMode">Color Mode</Label>
                    <Select
                      value={params.colorMode}
                      onValueChange={(value) => setParams({ ...params, colorMode: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a color mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rainbow">Rainbow</SelectItem>
                        <SelectItem value="single">Single Color</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {params.colorMode === "rainbow" ? (
                    <>
                      <div className="grid gap-2">
                        <Label htmlFor="rainbowSaturation">Rainbow Saturation</Label>
                        <Slider
                          id="rainbowSaturation"
                          defaultValue={[params.rainbowSaturation]}
                          max={100}
                          step={1}
                          onValueChange={(value) => setParams({ ...params, rainbowSaturation: value[0] })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="rainbowLightness">Rainbow Lightness</Label>
                        <Slider
                          id="rainbowLightness"
                          defaultValue={[params.rainbowLightness]}
                          max={100}
                          step={1}
                          onValueChange={(value) => setParams({ ...params, rainbowLightness: value[0] })}
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <Label htmlFor="singleColor">Single Color</Label>
                      <Input
                        type="color"
                        id="singleColor"
                        value={params.singleColor}
                        onChange={(e) => setParams({ ...params, singleColor: e.target.value })}
                      />
                    </div>
                  )}

                  <Button onClick={generateFlowArt} disabled={isLoading} className="w-full">
                    {isLoading ? "Generating..." : "Generate Flow Art"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-2/3">
          {generatedImage ? (
            <div className="flex flex-col gap-4">
              <img src={upscaledImage || generatedImage} alt="Generated Flow Art" className="rounded-md shadow-md" />

              <div className="flex gap-2">
                <Button
                  onClick={() => generateFlowArt()}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </Button>
                <Button
                  onClick={upscaleImage}
                  disabled={isUpscaling || !generatedImage}
                  className="flex items-center gap-2 bg-transparent"
                  variant="outline"
                >
                  {isUpscaling ? "Upscaling..." : "Upscale"}
                </Button>
                <Button
                  onClick={downloadImage}
                  disabled={!generatedImage}
                  className="flex items-center gap-2 bg-transparent"
                  variant="outline"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button onClick={() => setShowSaveDialog(true)} className="flex items-center gap-2" variant="outline">
                  <Heart className="w-4 h-4" />
                  Save to Gallery
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No art generated yet. Adjust the settings and click "Generate Flow Art".</p>
            </div>
          )}
        </div>
      </div>
      <SaveArtworkDialog
        open={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={handleSaveToGallery}
        imageUrl={generatedImage || ""}
        upscaledImageUrl={upscaledImage || undefined}
        generationParams={params}
        mode={currentMode}
        customPrompt={currentMode === "ai" ? customPrompt : undefined}
        upscaleMethod={upscaledImage ? "AI Upscaler" : undefined}
      />
    </div>
  )
}

export default FlowArtGenerator
