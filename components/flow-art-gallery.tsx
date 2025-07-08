"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Loader2, Download, Zap, Sparkles, Search } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ClientUpscaler } from "@/lib/client-upscaler"
import { Card, CardContent } from "@/components/ui/card"

interface UpscaleMetadata {
  originalSize: string
  upscaledSize: string
  scaleFactor: number
  model: string
  quality: string
  method: string
}

interface GeneratedArtwork {
  id: string
  title: string
  dataset: string
  seed: number
  imageUrl: string
  upscaledImageUrl?: string
  colorScheme: string
  generationMode: "svg" | "ai"
  timestamp: Date
  metadata?: UpscaleMetadata
}

export function FlowArtGallery() {
  const [dataset, setDataset] = useState<string>("spirals")
  const [seed, setSeed] = useState<number>(1234)
  const [colorScheme, setColorScheme] = useState<string>("magma")
  const [generationMode, setGenerationMode] = useState<"svg" | "ai">("ai")
  const [loading, setLoading] = useState<boolean>(false)
  const [upscaling, setUpscaling] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [noise, setNoise] = useState<number>(0.05)
  const [numSamples, setNumSamples] = useState<number>(1000)
  const [upscaleProgress, setUpscaleProgress] = useState<number>(0)
  const [upscaleStatus, setUpscaleStatus] = useState<string>("")

  // Gallery state
  const [artworks, setArtworks] = useState<GeneratedArtwork[]>([])
  const [featuredArtwork, setFeaturedArtwork] = useState<GeneratedArtwork | null>(null)
  const [showGenerator, setShowGenerator] = useState<boolean>(false)

  const generateTitle = (dataset: string, seed: number) => {
    const titles = {
      spirals: ["Cosmic Spiral", "Infinite Vortex", "Spiral Dreams", "Galactic Flow"],
      checkerboard: ["Digital Grid", "Pixel Matrix", "Quantum Squares", "Binary Pattern"],
      moons: ["Lunar Dance", "Celestial Arcs", "Moon Phases", "Orbital Flow"],
      gaussian: ["Probability Cloud", "Random Beauty", "Gaussian Field", "Statistical Art"],
      grid: ["Perfect Order", "Structured Chaos", "Grid Symphony", "Mathematical Beauty"],
    }
    const titleOptions = titles[dataset as keyof typeof titles] || ["Generated Art"]
    return titleOptions[seed % titleOptions.length] + ` #${seed}`
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)

    try {
      let response
      if (generationMode === "svg") {
        response = await fetch("/api/generate-art", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ dataset, seed, colorScheme, numSamples, noise }),
        })
      } else {
        response = await fetch("/api/generate-ai-art", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ dataset, seed, colorScheme, numSamples, noise }),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate image")
      }

      const data = await response.json()

      const newArtwork: GeneratedArtwork = {
        id: `artwork-${Date.now()}`,
        title: generateTitle(dataset, seed),
        dataset,
        seed,
        imageUrl: data.image,
        colorScheme,
        generationMode,
        timestamp: new Date(),
      }

      setArtworks((prev) => [newArtwork, ...prev])
      setFeaturedArtwork(newArtwork)
      setShowGenerator(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpscale = async (artwork: GeneratedArtwork) => {
    setUpscaling(true)
    setUpscaleProgress(0)
    setUpscaleStatus("Trying free AI upscaling services...")
    setError(null)

    try {
      setUpscaleProgress(20)
      setUpscaleStatus("Connecting to free AI upscaling services...")

      const response = await fetch("/api/upscale-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageData: artwork.imageUrl,
          scaleFactor: 4,
          upscaleModel: "real-esrgan",
        }),
      })

      if (!response.ok) {
        throw new Error("Server upscaling failed")
      }

      const data = await response.json()

      if (data.requiresClientUpscaling) {
        setUpscaleProgress(50)
        setUpscaleStatus("Using high-quality client-side upscaling...")

        const upscaledImage = await ClientUpscaler.upscaleImage(artwork.imageUrl, 4)
        setUpscaleProgress(80)
        setUpscaleStatus("Applying enhancement filters...")

        const enhancedImage = await ClientUpscaler.enhanceImage(upscaledImage)

        const updatedArtwork = {
          ...artwork,
          upscaledImageUrl: enhancedImage,
          metadata: data.metadata,
        }

        setArtworks((prev) => prev.map((art) => (art.id === artwork.id ? updatedArtwork : art)))
        if (featuredArtwork?.id === artwork.id) {
          setFeaturedArtwork(updatedArtwork)
        }
      } else {
        const updatedArtwork = {
          ...artwork,
          upscaledImageUrl: data.image,
          metadata: data.metadata,
        }

        setArtworks((prev) => prev.map((art) => (art.id === artwork.id ? updatedArtwork : art)))
        if (featuredArtwork?.id === artwork.id) {
          setFeaturedArtwork(updatedArtwork)
        }
      }

      setUpscaleProgress(100)
      setUpscaleStatus("Free upscaling complete!")
    } catch (err: any) {
      try {
        setUpscaleProgress(30)
        setUpscaleStatus("Using client-side upscaling...")

        const upscaledImage = await ClientUpscaler.upscaleImage(artwork.imageUrl, 4)
        setUpscaleProgress(70)
        setUpscaleStatus("Enhancing image quality...")

        const enhancedImage = await ClientUpscaler.enhanceImage(upscaledImage)

        const updatedArtwork = {
          ...artwork,
          upscaledImageUrl: enhancedImage,
          metadata: {
            originalSize: "1792x1024",
            upscaledSize: "7168x4096",
            scaleFactor: 4,
            model: "Client-side Bicubic + Enhancement",
            quality: "High Quality Upscaled",
            method: "client-side",
          },
        }

        setArtworks((prev) => prev.map((art) => (art.id === artwork.id ? updatedArtwork : art)))
        if (featuredArtwork?.id === artwork.id) {
          setFeaturedArtwork(updatedArtwork)
        }

        setUpscaleProgress(100)
        setUpscaleStatus("Client-side upscaling complete!")
      } catch (clientError: any) {
        setError("All upscaling methods failed: " + clientError.message)
      }
    } finally {
      setUpscaling(false)
    }
  }

  const handleDownload = (artwork: GeneratedArtwork, isUpscaled = false) => {
    const downloadUrl = isUpscaled ? artwork.upscaledImageUrl : artwork.imageUrl
    if (downloadUrl) {
      const link = document.createElement("a")
      link.href = downloadUrl
      const fileExtension = artwork.generationMode === "svg" ? "svg" : "png"
      const suffix = isUpscaled ? "-upscaled-4x" : "-base"
      link.download = `${artwork.title.toLowerCase().replace(/\s+/g, "-")}${suffix}.${fileExtension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">FS</span>
                </div>
                <span className="text-xl font-bold">FlowSketch</span>
              </div>
              <nav className="hidden md:flex space-x-6">
                <button
                  onClick={() => setShowGenerator(!showGenerator)}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  CREATE
                </button>
                <button className="text-gray-300 hover:text-white transition-colors">EXPLORE</button>
                <button className="text-gray-300 hover:text-white transition-colors">GALLERY</button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-gray-900 rounded-full px-4 py-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="artworks, artists, collections..."
                  className="bg-transparent text-sm text-white placeholder-gray-400 outline-none w-64"
                />
              </div>
              <Button className="bg-white text-black hover:bg-gray-200">Connect</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Generator Panel */}
      {showGenerator && (
        <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Dataset</Label>
                  <Select value={dataset} onValueChange={setDataset}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="spirals">Spirals</SelectItem>
                      <SelectItem value="checkerboard">Checkerboard</SelectItem>
                      <SelectItem value="moons">Moons</SelectItem>
                      <SelectItem value="gaussian">Gaussian</SelectItem>
                      <SelectItem value="grid">Grid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Color Scheme</Label>
                  <Select value={colorScheme} onValueChange={setColorScheme}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="magma">Magma</SelectItem>
                      <SelectItem value="viridis">Viridis</SelectItem>
                      <SelectItem value="plasma">Plasma</SelectItem>
                      <SelectItem value="cividis">Cividis</SelectItem>
                      <SelectItem value="grayscale">Grayscale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Seed</Label>
                  <Input
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(Number(e.target.value))}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Samples</Label>
                  <Input
                    type="number"
                    value={numSamples}
                    onChange={(e) => setNumSamples(Number(e.target.value))}
                    className="bg-gray-800 border-gray-700 text-white"
                    min={100}
                    step={100}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Generation Mode</Label>
                  <RadioGroup
                    value={generationMode}
                    onValueChange={(value: "svg" | "ai") => setGenerationMode(value)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="svg" id="mode-svg" />
                      <Label htmlFor="mode-svg" className="text-gray-300">
                        SVG Plot
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ai" id="mode-ai" />
                      <Label htmlFor="mode-ai" className="text-gray-300">
                        AI Generated
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Noise Level</Label>
                  <Input
                    type="number"
                    value={noise}
                    onChange={(e) => setNoise(Number(e.target.value))}
                    className="bg-gray-800 border-gray-700 text-white"
                    step={0.01}
                    min={0}
                    max={1}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-8 py-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Flow Art"
                )}
              </Button>
            </div>

            {error && <div className="mt-4 text-center text-red-400">{error}</div>}
          </div>
        </div>
      )}

      {/* Hero Section */}
      {featuredArtwork && (
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${featuredArtwork.upscaledImageUrl || featuredArtwork.imageUrl})`,
            }}
          >
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
            <h1 className="text-5xl md:text-7xl font-bold mb-4">{featuredArtwork.title}</h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              A generative masterpiece using {featuredArtwork.dataset} dataset with {featuredArtwork.colorScheme}{" "}
              colors.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {featuredArtwork.upscaledImageUrl ? (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2">
                  <Sparkles className="w-4 h-4 mr-2" />
                  4x Upscaled • {featuredArtwork.metadata?.upscaledSize}
                </Badge>
              ) : (
                <Button
                  onClick={() => handleUpscale(featuredArtwork)}
                  disabled={upscaling}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {upscaling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                  Free 4x Upscale
                </Button>
              )}

              <Button
                onClick={() => handleDownload(featuredArtwork, !!featuredArtwork.upscaledImageUrl)}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-black"
              >
                <Download className="mr-2 h-4 w-4" />
                Download {featuredArtwork.upscaledImageUrl ? "4K" : "HD"}
              </Button>
            </div>

            {upscaling && (
              <div className="mt-6 max-w-md mx-auto space-y-2">
                <Progress value={upscaleProgress} className="w-full" />
                <p className="text-sm text-gray-300">{upscaleStatus}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Gallery Section */}
      {artworks.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Featured</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {artworks.map((artwork) => (
                <Card
                  key={artwork.id}
                  className="bg-gray-900 border-gray-800 overflow-hidden hover:border-gray-600 transition-colors cursor-pointer group"
                  onClick={() => setFeaturedArtwork(artwork)}
                >
                  <div className="relative aspect-square">
                    <img
                      src={artwork.upscaledImageUrl || artwork.imageUrl}
                      alt={artwork.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      {artwork.upscaledImageUrl ? (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                          <Sparkles className="w-3 h-3 mr-1" />
                          4x
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-500">HD</Badge>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-2">{artwork.title}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span className="capitalize">{artwork.dataset}</span>
                      <span>{artwork.generationMode.toUpperCase()}</span>
                    </div>

                    <div className="mt-3 flex gap-2">
                      {!artwork.upscaledImageUrl && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUpscale(artwork)
                          }}
                          disabled={upscaling}
                          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          Upscale
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownload(artwork, !!artwork.upscaledImageUrl)
                        }}
                        className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {artworks.length === 0 && (
        <section className="py-32 px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold mb-4">Create Your First Masterpiece</h2>
            <p className="text-xl text-gray-400 mb-8">
              Generate stunning flow art using mathematical datasets and AI enhancement.
            </p>
            <Button
              onClick={() => setShowGenerator(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-8 py-3 text-lg"
            >
              Start Creating
            </Button>
          </div>
        </section>
      )}
    </div>
  )
}
