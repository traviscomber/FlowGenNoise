"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Wand2, Download, Archive } from "lucide-react"
import { generateDataset } from "@/lib/flow-model"
import { PlotUtils } from "@/lib/plot-utils"
import { GalleryStorage, type GalleryImage } from "@/lib/gallery-storage"
import { Gallery } from "@/components/gallery"
import { compressImage } from "@/lib/image-compression"
import { saveImageToGallery, getGalleryImages } from "@/lib/gallery-storage"
import { CloudSync } from "./cloud-sync"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface GenerationSettings {
  dataset: string
  scenario: string
  colorScheme: string
  seed: number
  samples: number
  noise: number
  generationMode: "svg" | "ai"
}

const COLOR_SCHEMES = {
  viridis: "Viridis (Green-Purple)",
  plasma: "Plasma (Purple-Yellow)",
  inferno: "Inferno (Red-Yellow)",
  magma: "Magma (Purple-Red)",
  cividis: "Cividis (Blue-Green)",
  rainbow: "Rainbow (Full Spectrum)",
  grayscale: "Grayscale (Black-White)",
  cool: "Cool (Blue-Green)",
  hot: "Hot (Red-Yellow)",
  spring: "Spring (Pink-Yellow)",
  summer: "Summer (Green-Yellow)",
  autumn: "Autumn (Red-Orange)",
  winter: "Winter (Blue-Purple)",
  spectral: "Spectral (Diverging)",
  RdYlGn: "Red-Yellow-Green",
  PuOr: "Purple-Orange",
  BrBG: "Brown-Green",
  PiYG: "Pink-Yellow-Green",
  PRGn: "Purple-Green",
  RdBu: "Red-Blue",
  RdGy: "Red-Gray",
  RdPu: "Red-Purple",
  YlGnBu: "Yellow-Green-Blue",
  GnBu: "Green-Blue",
  OrRd: "Orange-Red",
  PuBuGn: "Purple-Blue-Green",
  YlOrRd: "Yellow-Orange-Red",
  Blues: "Blues",
  Greens: "Greens",
  Greys: "Greys",
  Oranges: "Oranges",
  Purples: "Purples",
  Reds: "Reds",
} as const

const SCENARIOS = {
  none: { label: "Pure Mathematical", backgroundColor: "white" },
  enchanted_forest: { label: "Enchanted Forest", backgroundColor: "#8A2BE2" },
  deep_ocean: { label: "Deep Ocean", backgroundColor: "#00008B" },
  cosmic_nebula: { label: "Cosmic Nebula", backgroundColor: "#FF4500" },
  cyberpunk_city: { label: "Cyberpunk City", backgroundColor: "#808080" },
  ancient_temple: { label: "Ancient Temple", backgroundColor: "#A52A2A" },
  crystal_cave: { label: "Crystal Cave", backgroundColor: "#ADD8E6" },
  aurora_borealis: { label: "Aurora Borealis", backgroundColor: "#FF00FF" },
  volcanic_landscape: { label: "Volcanic Landscape", backgroundColor: "#A0522D" },
  neural_connections: { label: "Neural Connections", backgroundColor: "#FFD700" },
} as const

export default function FlowArtGenerator() {
  const [settings, setSettings] = useState<GenerationSettings>({
    dataset: "gaussian",
    scenario: "none",
    colorScheme: "viridis",
    seed: Math.floor(Math.random() * 100000),
    samples: 1000,
    noise: 0.05,
    generationMode: "svg",
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [isUpscaling, setIsUpscaling] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [upscaledImage, setUpscaledImage] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("generate")
  const [lastGeneration, setLastGeneration] = useState<GalleryImage | null>(null)
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    setGalleryImages(getGalleryImages())
  }, [])

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true)
    setError(null)
    setProgress(0)
    setGeneratedImage(null)
    setUpscaledImage(null)

    try {
      if (settings.generationMode === "svg") {
        // Generate mathematical SVG
        setProgress(20)
        const data = generateDataset(settings.dataset, settings.seed, settings.samples, settings.noise)

        setProgress(60)
        const svg = PlotUtils.createSVGPlot(data, settings.colorScheme, 800, 600)

        setProgress(80)
        const blob = new Blob([svg], { type: "image/svg+xml" })
        const url = URL.createObjectURL(blob)

        setProgress(100)
        setGeneratedImage(url)

        // Save to gallery
        const image: GalleryImage = {
          id: `flow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          imageUrl: url,
          metadata: {
            ...settings,
            createdAt: Date.now(),
            filename: `flow-art-${settings.dataset}-${Date.now()}.svg`,
          },
          isFavorite: false,
          tags: [settings.dataset, settings.scenario, "mathematical"],
        }

        GalleryStorage.saveImage(image)
        setLastGeneration(image)
      } else {
        // Generate AI-enhanced version
        setProgress(10)
        // No need to generate SVG data on the client if the API doesn't use it for DALL-E 3 prompt
        // const data = FlowModel.generateDataset(settings.dataset, settings.samples, settings.seed, settings.noise)
        // const svg = PlotUtils.createSVGPlot(data, settings.colorScheme, 1024, 1024)

        setProgress(50)
        const response = await fetch("/api/generate-ai-art", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // Removed svgData as the API route doesn't use it for DALL-E 3 prompt generation
            dataset: settings.dataset,
            seed: settings.seed,
            colorScheme: settings.colorScheme,
            numSamples: settings.samples, // Corrected parameter name
            noise: settings.noise,
            scenario: settings.scenario,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to generate AI art")
        }

        setProgress(80)
        const result = await response.json()

        setProgress(100)
        setGeneratedImage(result.image) // Changed from result.imageUrl to result.image as per API response

        // Save to gallery
        const image: GalleryImage = {
          id: `ai-flow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          imageUrl: result.image, // Changed from result.imageUrl to result.image
          metadata: {
            ...settings,
            createdAt: Date.now(),
            filename: `ai-flow-art-${settings.dataset}-${Date.now()}.png`,
          },
          isFavorite: false,
          tags: [settings.dataset, settings.scenario, "ai-generated"],
        }

        GalleryStorage.saveImage(image)
        setLastGeneration(image)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsGenerating(false)
      setProgress(0)
    }
  }, [settings])

  const handleUpscale = async () => {
    if (!generatedImage) return

    setIsUpscaling(true)
    setError(null)

    try {
      const response = await fetch("/api/upscale-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: generatedImage }),
      })

      if (!response.ok) {
        throw new Error("Failed to upscale image")
      }

      const result = await response.json()
      setUpscaledImage(result.upscaledUrl)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsUpscaling(false)
    }
  }

  const handleDownload = (imageUrl: string, filename: string) => {
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleRandomize = () => {
    setSettings({
      ...settings,
      seed: Math.floor(Math.random() * 100000),
      dataset: Object.keys(SCENARIOS)[Math.floor(Math.random() * Object.keys(SCENARIOS).length)],
      scenario: Object.keys(SCENARIOS)[Math.floor(Math.random() * Object.keys(SCENARIOS).length)],
      colorScheme: Object.keys(COLOR_SCHEMES)[Math.floor(Math.random() * Object.keys(COLOR_SCHEMES).length)],
    })
  }

  const handleImageSelect = (image: GalleryImage) => {
    setSettings({
      dataset: image.metadata.dataset,
      scenario: image.metadata.scenario,
      colorScheme: image.metadata.colorScheme,
      seed: image.metadata.seed,
      samples: image.metadata.samples,
      noise: image.metadata.noise,
      generationMode: image.metadata.generationMode,
    })
    setActiveTab("generate")
  }

  const handleSaveToGallery = useCallback(async () => {
    if (generatedImage) {
      try {
        const compressed = await compressImage(generatedImage)
        saveImageToGallery(compressed)
        setGalleryImages(getGalleryImages())
        toast({
          title: "Image Saved!",
          description: "Your AI artwork has been added to the gallery.",
        })
      } catch (error) {
        console.error("Error saving image to gallery:", error)
        toast({
          title: "Save Failed",
          description: "Could not save image to gallery.",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "No Image to Save",
        description: "Please generate an AI image first.",
        variant: "destructive",
      })
    }
  }, [generatedImage, toast])

  return (
    <div className="grid lg:grid-cols-3 gap-6 p-4 md:p-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>FlowSketch Art Generator</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="dataset">Mathematical Dataset</Label>
              <Select value={settings.dataset} onValueChange={(value) => setSettings({ ...settings, dataset: value })}>
                <SelectTrigger id="dataset">
                  <SelectValue placeholder="Select a dataset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gaussian">Gaussian Blobs</SelectItem>
                  <SelectItem value="spirals">Spirals</SelectItem>
                  <SelectItem value="moons">Moons</SelectItem>
                  <SelectItem value="checkerboard">Checkerboard</SelectItem>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="neural">Neural Connection</SelectItem> {/* Added Neural Connection */}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="seed">Seed: {settings.seed}</Label>
              <Slider
                id="seed"
                min={0}
                max={100000}
                step={1}
                value={[settings.seed]}
                onValueChange={([val]) => setSettings({ ...settings, seed: val })}
              />
              <Button
                variant="outline"
                onClick={() => setSettings({ ...settings, seed: Math.floor(Math.random() * 100000) })}
              >
                Randomize Seed
              </Button>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="num-samples">Number of Samples: {settings.samples}</Label>
              <Slider
                id="num-samples"
                min={100}
                max={5000}
                step={100}
                value={[settings.samples]}
                onValueChange={([val]) => setSettings({ ...settings, samples: val })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="noise">Noise: {settings.noise.toFixed(2)}</Label>
              <Slider
                id="noise"
                min={0}
                max={0.5}
                step={0.01}
                value={[settings.noise]}
                onValueChange={([val]) => setSettings({ ...settings, noise: val })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="color-scheme">Color Scheme</Label>
              <Select
                value={settings.colorScheme}
                onValueChange={(value) => setSettings({ ...settings, colorScheme: value })}
              >
                <SelectTrigger id="color-scheme">
                  <SelectValue placeholder="Select a color scheme" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(COLOR_SCHEMES).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="scenario">Creative Scenario</Label>
              <Select
                value={settings.scenario}
                onValueChange={(value) => setSettings({ ...settings, scenario: value })}
              >
                <SelectTrigger id="scenario">
                  <SelectValue placeholder="Select a scenario" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SCENARIOS).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerate} disabled={isGenerating || isUpscaling}>
              {isGenerating || isUpscaling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Art
                </>
              )}
            </Button>
            {generatedImage && (
              <Button onClick={handleSaveToGallery} disabled={isGenerating || isUpscaling}>
                <Download className="mr-2 h-4 w-4" /> Save to Gallery
              </Button>
            )}
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="w-full max-w-md">
              <div className="bg-muted rounded-lg overflow-hidden relative">
                {(isGenerating || isUpscaling) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
                {generatedImage ? (
                  <img
                    src={generatedImage || "/placeholder.svg"}
                    alt="Generated artwork"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                    No art generated yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" /> Gallery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Gallery images={galleryImages} onImageSelect={handleImageSelect} />
        </CardContent>
      </Card>
      <CloudSync />
    </div>
  )
}
