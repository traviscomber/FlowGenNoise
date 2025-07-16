"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Sparkles,
  Download,
  RefreshCw,
  Zap,
  Eye,
  Save,
  GalleryThumbnailsIcon as Gallery,
  Settings,
  Palette,
  Brain,
  Dna,
  Atom,
  Telescope,
  Triangle,
  Microscope,
  Network,
  Gem,
} from "lucide-react"
import { SaveArtworkDialog } from "./gallery/save-artwork-dialog"
import type { ArtworkData } from "@/lib/gallery-service"
import Link from "next/link"

interface GenerationResult {
  imageUrl: string
  svgContent?: string
}

export default function FlowArtGenerator() {
  const [mode, setMode] = useState<"flow" | "ai">("flow")
  const [dataset, setDataset] = useState("neural_networks")
  const [scenario, setScenario] = useState("cyberpunk")
  const [seed, setSeed] = useState(Math.floor(Math.random() * 1000000))
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<GenerationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUpscaling, setIsUpscaling] = useState(false)
  const [upscaledImageUrl, setUpscaledImageUrl] = useState<string | null>(null)

  const datasets = [
    { value: "neural_networks", label: "Neural Networks", icon: <Brain className="h-4 w-4" /> },
    { value: "dna_sequences", label: "DNA Sequences", icon: <Dna className="h-4 w-4" /> },
    { value: "quantum_fields", label: "Quantum Fields", icon: <Atom className="h-4 w-4" /> },
    { value: "cosmic_phenomena", label: "Cosmic Phenomena", icon: <Telescope className="h-4 w-4" /> },
    { value: "fractal_geometry", label: "Fractal Geometry", icon: <Triangle className="h-4 w-4" /> },
    { value: "protein_folding", label: "Protein Folding", icon: <Microscope className="h-4 w-4" /> },
    { value: "brain_connectivity", label: "Brain Connectivity", icon: <Network className="h-4 w-4" /> },
    { value: "crystalline_structures", label: "Crystalline Structures", icon: <Gem className="h-4 w-4" /> },
  ]

  const scenarios = [
    { value: "cyberpunk", label: "Cyberpunk", description: "Neon-lit futuristic aesthetics" },
    { value: "bioluminescent", label: "Bioluminescent", description: "Organic glowing effects" },
    { value: "holographic", label: "Holographic", description: "Iridescent tech surfaces" },
    { value: "microscopic", label: "Microscopic", description: "Electron microscope detail" },
    { value: "ethereal", label: "Ethereal", description: "Dreamlike artistic quality" },
    { value: "crystalline", label: "Crystalline", description: "Geometric precision" },
  ]

  const generateArtwork = async () => {
    setIsGenerating(true)
    setProgress(0)
    setError(null)
    setResult(null)
    setUpscaledImageUrl(null)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + Math.random() * 20, 90))
      }, 200)

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          dataset,
          scenario,
          seed,
        }),
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Generation failed")
      }

      const data = await response.json()
      setResult({
        imageUrl: data.imageUrl,
        svgContent: data.svgContent,
      })
    } catch (error) {
      console.error("Generation error:", error)
      setError(error instanceof Error ? error.message : "Failed to generate artwork")
    } finally {
      setIsGenerating(false)
      setProgress(0)
    }
  }

  const upscaleImage = async () => {
    if (!result?.imageUrl) return

    setIsUpscaling(true)
    try {
      const response = await fetch("/api/upscale-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: result.imageUrl }),
      })

      if (!response.ok) {
        throw new Error("Upscaling failed")
      }

      const data = await response.json()
      setUpscaledImageUrl(data.upscaledImageUrl)
    } catch (error) {
      console.error("Upscaling error:", error)
      setError("Failed to upscale image")
    } finally {
      setIsUpscaling(false)
    }
  }

  const downloadImage = () => {
    const imageUrl = upscaledImageUrl || result?.imageUrl
    if (!imageUrl) return

    const link = document.createElement("a")
    link.href = imageUrl
    link.download = `flowsketch_${dataset}_${seed}.png`
    link.click()
  }

  const randomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000))
  }

  const getArtworkData = (): ArtworkData => ({
    title: `${datasets.find((d) => d.value === dataset)?.label} ${scenarios.find((s) => s.value === scenario)?.label}`,
    description: `Generated ${mode} artwork using ${dataset} dataset with ${scenario} styling`,
    imageUrl: result?.imageUrl || "",
    upscaledImageUrl: upscaledImageUrl || undefined,
    svgContent: result?.svgContent,
    mode,
    dataset,
    scenario,
    seed,
    tags: [mode, dataset, scenario].filter(Boolean),
    isFavorite: false,
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FlowSketch AI
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform scientific data into stunning visual art using advanced AI and flow visualization techniques
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Link href="/gallery">
              <Button variant="outline" size="sm">
                <Gallery className="h-4 w-4 mr-2" />
                View Gallery
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Generation Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Mode Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Generation Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={mode === "flow" ? "default" : "outline"}
                      onClick={() => setMode("flow")}
                      className="justify-start"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Flow
                    </Button>
                    <Button
                      variant={mode === "ai" ? "default" : "outline"}
                      onClick={() => setMode("ai")}
                      className="justify-start"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      AI Art
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {mode === "flow"
                      ? "Generate mathematical flow visualizations"
                      : "Create AI-powered artistic interpretations"}
                  </p>
                </div>

                <Separator />

                {/* Dataset Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Scientific Dataset</label>
                  <Select value={dataset} onValueChange={setDataset}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {datasets.map((ds) => (
                        <SelectItem key={ds.value} value={ds.value}>
                          <div className="flex items-center gap-2">
                            {ds.icon}
                            {ds.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Scenario Selection (AI mode only) */}
                {mode === "ai" && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Artistic Style</label>
                    <Select value={scenario} onValueChange={setScenario}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {scenarios.map((sc) => (
                          <SelectItem key={sc.value} value={sc.value}>
                            <div>
                              <div className="font-medium">{sc.label}</div>
                              <div className="text-xs text-muted-foreground">{sc.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Separator />

                {/* Seed Control */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Seed</label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="number"
                        value={seed}
                        onChange={(e) => setSeed(Number.parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                        min="0"
                        max="999999"
                      />
                    </div>
                    <Button variant="outline" size="sm" onClick={randomizeSeed}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Controls randomness - same seed produces same result</p>
                </div>

                <Separator />

                {/* Generate Button */}
                <Button onClick={generateArtwork} disabled={isGenerating} className="w-full" size="lg">
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Artwork
                    </>
                  )}
                </Button>

                {/* Progress Bar */}
                {isGenerating && (
                  <div className="space-y-2">
                    <Progress value={progress} className="w-full" />
                    <p className="text-xs text-center text-muted-foreground">
                      {progress < 30
                        ? "Initializing..."
                        : progress < 60
                          ? "Processing data..."
                          : progress < 90
                            ? "Generating artwork..."
                            : "Finalizing..."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dataset Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Dataset Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {datasets.find((d) => d.value === dataset)?.icon}
                    <span className="font-medium">{datasets.find((d) => d.value === dataset)?.label}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {dataset === "neural_networks" &&
                      "Visualize brain connectivity patterns and neural network structures with synaptic connections."}
                    {dataset === "dna_sequences" &&
                      "Explore genetic code patterns and molecular structures in beautiful helical formations."}
                    {dataset === "quantum_fields" &&
                      "Represent quantum particle interactions and energy field dynamics."}
                    {dataset === "cosmic_phenomena" &&
                      "Capture the beauty of stellar formations, galaxies, and cosmic events."}
                    {dataset === "fractal_geometry" &&
                      "Generate recursive mathematical patterns with infinite complexity."}
                    {dataset === "protein_folding" && "Visualize amino acid chains and biochemical protein structures."}
                    {dataset === "brain_connectivity" && "Map neural pathways and cognitive network connections."}
                    {dataset === "crystalline_structures" &&
                      "Display molecular lattices and chemical crystal formations."}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline">{mode === "ai" ? "AI Generated" : "Flow Visualization"}</Badge>
                    <Badge variant="outline">{datasets.find((d) => d.value === dataset)?.label}</Badge>
                    {mode === "ai" && (
                      <Badge variant="outline">{scenarios.find((s) => s.value === scenario)?.label}</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Generated Artwork</span>
                  {result && (
                    <div className="flex gap-2">
                      <SaveArtworkDialog
                        artwork={getArtworkData()}
                        trigger={
                          <Button variant="outline" size="sm">
                            <Save className="h-4 w-4 mr-2" />
                            Save to Gallery
                          </Button>
                        }
                      />
                      {!upscaledImageUrl && result.imageUrl && (
                        <Button variant="outline" size="sm" onClick={upscaleImage} disabled={isUpscaling}>
                          {isUpscaling ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Enhancing...
                            </>
                          ) : (
                            <>
                              <Zap className="h-4 w-4 mr-2" />
                              Enhance
                            </>
                          )}
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={downloadImage}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
                  {error ? (
                    <Alert className="max-w-md">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ) : result ? (
                    <div className="relative w-full h-full">
                      {mode === "flow" && result.svgContent && !upscaledImageUrl ? (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          dangerouslySetInnerHTML={{ __html: result.svgContent }}
                        />
                      ) : (
                        <img
                          src={upscaledImageUrl || result.imageUrl}
                          alt="Generated artwork"
                          className="w-full h-full object-cover"
                        />
                      )}
                      {upscaledImageUrl && (
                        <Badge className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Enhanced
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Click "Generate Artwork" to create your visualization</p>
                    </div>
                  )}
                </div>

                {result && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Mode:</span>
                        <div className="font-medium">{mode === "ai" ? "AI Art" : "Flow Viz"}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Dataset:</span>
                        <div className="font-medium">{datasets.find((d) => d.value === dataset)?.label}</div>
                      </div>
                      {mode === "ai" && (
                        <div>
                          <span className="text-muted-foreground">Style:</span>
                          <div className="font-medium">{scenarios.find((s) => s.value === scenario)?.label}</div>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Seed:</span>
                        <div className="font-medium">{seed}</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
