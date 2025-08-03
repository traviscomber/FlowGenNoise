"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Download, Users, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface TribesParams {
  dataset: string
  scenario: string
  colorScheme: string
  seed: number
  numSamples: number
  noiseScale: number
  customPrompt: string
}

export function TribesDemo() {
  const { toast } = useToast()
  const [params, setParams] = useState<TribesParams>({
    dataset: "tribes",
    scenario: "landscape",
    colorScheme: "sunset",
    seed: Math.floor(Math.random() * 10000),
    numSamples: 2000,
    noiseScale: 0.05,
    customPrompt: "",
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [generationDetails, setGenerationDetails] = useState<any>(null)

  const updateParam = (key: keyof TribesParams, value: any) => {
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
      console.log("🏘️ Starting tribes art generation with params:", params)

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
          title: "Tribal Art Generated Successfully!",
          description: `Created ${params.dataset} artwork with ${params.numSamples} cultural elements`,
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
      a.download = `flowsketch-tribes-${params.seed}.png`
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Download Started",
        description: "Your tribal artwork is being downloaded",
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
            <Users className="w-5 h-5 mr-2" />
            Cultural Themes Generator
          </CardTitle>
          <CardDescription>
            Create artwork featuring tribal settlements, native communities, and cultural elements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Custom Prompt */}
          <div className="space-y-2">
            <Label htmlFor="customPrompt">Cultural Description (Optional)</Label>
            <Textarea
              id="customPrompt"
              placeholder="Describe specific cultural elements, ceremonies, or traditions you want to include..."
              value={params.customPrompt}
              onChange={(e) => updateParam("customPrompt", e.target.value)}
              rows={3}
            />
          </div>

          {/* Dataset Selection */}
          <div className="space-y-2">
            <Label>Cultural Theme</Label>
            <Select value={params.dataset} onValueChange={(value) => updateParam("dataset", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tribes">Tribal Settlements</SelectItem>
                <SelectItem value="natives">Native Communities</SelectItem>
                <SelectItem value="heads">Portrait Mosaics</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Scenario and Color Scheme */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Environment</Label>
              <Select value={params.scenario} onValueChange={(value) => updateParam("scenario", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="landscape">Natural Landscape</SelectItem>
                  <SelectItem value="architectural">Village Architecture</SelectItem>
                  <SelectItem value="ceremonial">Ceremonial Grounds</SelectItem>
                  <SelectItem value="seasonal">Seasonal Activities</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Color Palette</Label>
              <Select value={params.colorScheme} onValueChange={(value) => updateParam("colorScheme", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sunset">Warm Sunset</SelectItem>
                  <SelectItem value="earth">Earth Tones</SelectItem>
                  <SelectItem value="forest">Forest Greens</SelectItem>
                  <SelectItem value="desert">Desert Sands</SelectItem>
                  <SelectItem value="ocean">Ocean Blues</SelectItem>
                  <SelectItem value="fire">Fire & Ember</SelectItem>
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
              <Label>Cultural Elements: {params.numSamples.toLocaleString()}</Label>
              <Slider
                value={[params.numSamples]}
                onValueChange={([value]) => updateParam("numSamples", value)}
                min={500}
                max={5000}
                step={100}
              />
            </div>

            <div className="space-y-2">
              <Label>Artistic Variation: {params.noiseScale}</Label>
              <Slider
                value={[params.noiseScale]}
                onValueChange={([value]) => updateParam("noiseScale", value)}
                min={0}
                max={0.3}
                step={0.01}
              />
            </div>
          </div>

          {/* Generate Button */}
          <Button onClick={generateArt} disabled={isGenerating} className="w-full" size="lg">
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Cultural Art...
              </>
            ) : (
              <>
                <Users className="w-4 h-4 mr-2" />
                Generate Cultural Artwork
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Cultural Art</CardTitle>
          <CardDescription>Your cultural-themed artwork will appear here once generated</CardDescription>
        </CardHeader>
        <CardContent>
          {isGenerating && (
            <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Creating your cultural masterpiece...</p>
              </div>
            </div>
          )}

          {generatedImage && (
            <div className="space-y-4">
              <div className="relative">
                <Image
                  src={generatedImage || "/placeholder.svg"}
                  alt="Generated cultural art"
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
                    Generated with {params.numSamples.toLocaleString()} cultural elements using {params.dataset} theme
                  </p>
                </div>
              )}

              <Button onClick={downloadImage} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download Cultural Art
              </Button>
            </div>
          )}

          {!isGenerating && !generatedImage && (
            <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
              <div className="text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click "Generate Cultural Artwork" to create your art</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
