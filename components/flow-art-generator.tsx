"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Download, Sparkles, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface GenerationParams {
  dataset: string
  scenario: string
  colorScheme: string
  seed: number
  numSamples: number
  noiseScale: number
  timeStep: number
  customPrompt: string
}

export function FlowArtGenerator() {
  const { toast } = useToast()
  const [params, setParams] = useState<GenerationParams>({
    dataset: "spirals",
    scenario: "landscape",
    colorScheme: "plasma",
    seed: Math.floor(Math.random() * 10000),
    numSamples: 3000,
    noiseScale: 0.1,
    timeStep: 0.01,
    customPrompt: "",
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [generationDetails, setGenerationDetails] = useState<any>(null)

  const updateParam = (key: keyof GenerationParams, value: any) => {
    setParams((prev) => ({ ...prev, [key]: value }))
  }

  const generateRandomSeed = () => {
    updateParam("seed", Math.floor(Math.random() * 10000))
  }

  const generateArt = async () => {
    setIsGenerating(true)
    setGeneratedImage(null)
    setGenerationDetails(null)

    try {
      console.log("🎨 Starting art generation with params:", params)

      const response = await fetch("/api/generate-art", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      })

      console.log("📡 API response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        console.error("❌ API error:", errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("✅ Generation successful:", result.success)

      if (result.success && result.image) {
        setGeneratedImage(result.image)
        setGenerationDetails(result)
        toast({
          title: "Art Generated Successfully!",
          description: `Created ${params.dataset} artwork with ${params.numSamples} data points`,
        })
      } else {
        throw new Error(result.error || "Failed to generate image")
      }
    } catch (error: any) {
      console.error("💥 Generation failed:", error)
      toast({
        title: "Generation Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadImage = async () => {
    if (!generatedImage) return

    try {
      const response = await fetch(generatedImage)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `flowsketch-${params.dataset}-${params.seed}.png`
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Download Started",
        description: "Your artwork is being downloaded",
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download the image",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Controls Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="w-5 h-5 mr-2" />
            Mathematical Flow Generator
          </CardTitle>
          <CardDescription>
            Create stunning mathematical art using advanced algorithms and AI enhancement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Custom Prompt */}
          <div className="space-y-2">
            <Label htmlFor="customPrompt">Custom Prompt (Optional)</Label>
            <Textarea
              id="customPrompt"
              placeholder="Describe additional artistic elements you want to include..."
              value={params.customPrompt}
              onChange={(e) => updateParam("customPrompt", e.target.value)}
              rows={3}
            />
          </div>

          {/* Dataset Selection */}
          <div className="space-y-2">
            <Label>Mathematical Dataset</Label>
            <Select value={params.dataset} onValueChange={(value) => updateParam("dataset", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spirals">Spirals & Fibonacci</SelectItem>
                <SelectItem value="fractal">Fractal Patterns</SelectItem>
                <SelectItem value="mandelbrot">Mandelbrot Set</SelectItem>
                <SelectItem value="julia">Julia Set</SelectItem>
                <SelectItem value="lorenz">Lorenz Attractor</SelectItem>
                <SelectItem value="voronoi">Voronoi Diagrams</SelectItem>
                <SelectItem value="cellular">Cellular Automata</SelectItem>
                <SelectItem value="gaussian">Gaussian Fields</SelectItem>
                <SelectItem value="diffusion">Reaction-Diffusion</SelectItem>
                <SelectItem value="wave">Wave Interference</SelectItem>
                <SelectItem value="hyperbolic">Hyperbolic Geometry</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Scenario and Color Scheme */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Scenario</Label>
              <Select value={params.scenario} onValueChange={(value) => updateParam("scenario", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="landscape">Natural Landscape</SelectItem>
                  <SelectItem value="architectural">Architectural</SelectItem>
                  <SelectItem value="crystalline">Crystal Formations</SelectItem>
                  <SelectItem value="botanical">Botanical Garden</SelectItem>
                  <SelectItem value="cosmic">Cosmic Space</SelectItem>
                  <SelectItem value="underwater">Underwater World</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Color Scheme</Label>
              <Select value={params.colorScheme} onValueChange={(value) => updateParam("colorScheme", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plasma">Plasma</SelectItem>
                  <SelectItem value="magma">Magma</SelectItem>
                  <SelectItem value="sunset">Sunset</SelectItem>
                  <SelectItem value="cosmic">Cosmic</SelectItem>
                  <SelectItem value="quantum">Quantum</SelectItem>
                  <SelectItem value="thermal">Thermal</SelectItem>
                  <SelectItem value="spectral">Spectral</SelectItem>
                  <SelectItem value="crystalline">Crystalline</SelectItem>
                  <SelectItem value="bioluminescent">Bioluminescent</SelectItem>
                  <SelectItem value="aurora">Aurora</SelectItem>
                  <SelectItem value="metallic">Metallic</SelectItem>
                  <SelectItem value="neon">Neon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Numerical Parameters */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Seed: {params.seed}</Label>
                <Button onClick={generateRandomSeed} variant="outline" size="sm">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Random
                </Button>
              </div>
              <Slider
                value={[params.seed]}
                onValueChange={([value]) => updateParam("seed", value)}
                min={1}
                max={10000}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label>Data Points: {params.numSamples.toLocaleString()}</Label>
              <Slider
                value={[params.numSamples]}
                onValueChange={([value]) => updateParam("numSamples", value)}
                min={100}
                max={10000}
                step={100}
              />
            </div>

            <div className="space-y-2">
              <Label>Noise Scale: {params.noiseScale}</Label>
              <Slider
                value={[params.noiseScale]}
                onValueChange={([value]) => updateParam("noiseScale", value)}
                min={0}
                max={1}
                step={0.01}
              />
            </div>

            <div className="space-y-2">
              <Label>Time Step: {params.timeStep}</Label>
              <Slider
                value={[params.timeStep]}
                onValueChange={([value]) => updateParam("timeStep", value)}
                min={0.001}
                max={0.1}
                step={0.001}
              />
            </div>
          </div>

          {/* Generate Button */}
          <Button onClick={generateArt} disabled={isGenerating} className="w-full" size="lg">
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Art...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Mathematical Art
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Artwork</CardTitle>
          <CardDescription>Your mathematical art will appear here once generated</CardDescription>
        </CardHeader>
        <CardContent>
          {isGenerating && (
            <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Creating your mathematical masterpiece...</p>
              </div>
            </div>
          )}

          {generatedImage && (
            <div className="space-y-4">
              <div className="relative">
                <Image
                  src={generatedImage || "/placeholder.svg"}
                  alt="Generated mathematical art"
                  width={512}
                  height={512}
                  className="w-full rounded-lg shadow-lg"
                  unoptimized
                />
              </div>

              {generationDetails && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{generationDetails.provider}</Badge>
                    <Badge variant="secondary">{generationDetails.model}</Badge>
                    <Badge variant="secondary">{generationDetails.estimatedFileSize}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Generated with {params.numSamples.toLocaleString()} data points using {params.dataset} algorithm
                  </p>
                </div>
              )}

              <Button onClick={downloadImage} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download Artwork
              </Button>
            </div>
          )}

          {!isGenerating && !generatedImage && (
            <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
              <div className="text-center">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click "Generate Mathematical Art" to create your artwork
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
