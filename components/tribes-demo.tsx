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
    scenario: "pure",
    colorScheme: "forest",
    seed: Math.floor(Math.random() * 10000),
    numSamples: 3000,
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
      console.log("🏘️ Starting tribal art generation:", params)

      const response = await fetch("/api/generate-art", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success && result.image) {
        setGeneratedImage(result.image)
        setGenerationDetails(result)

        toast({
          title: "Cultural Art Generated!",
          description: "Your tribal-themed artwork has been created successfully",
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
            Create artwork inspired by tribal cultures, native communities, and traditional art forms.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Custom Prompt */}
          <div className="space-y-2">
            <Label htmlFor="customPrompt">Cultural Description (Optional)</Label>
            <Textarea
              id="customPrompt"
              placeholder="Describe the cultural theme you want to explore..."
              value={params.customPrompt}
              onChange={(e) => updateParam("customPrompt", e.target.value)}
              rows={3}
            />
          </div>

          {/* Dataset and Scenario */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cultural Pattern</Label>
              <Select value={params.dataset} onValueChange={(value) => updateParam("dataset", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tribes">Tribal Networks</SelectItem>
                  <SelectItem value="natives">Native Communities</SelectItem>
                  <SelectItem value="statues">Sacred Sculptures</SelectItem>
                  <SelectItem value="heads">Portrait Mosaics</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cultural Theme</Label>
              <Select value={params.scenario} onValueChange={(value) => updateParam("scenario", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pure">Pure Cultural</SelectItem>
                  <SelectItem value="cosmic">Cosmic Heritage</SelectItem>
                  <SelectItem value="forest">Forest Wisdom</SelectItem>
                  <SelectItem value="crystalline">Crystal Traditions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Color Scheme */}
          <div className="space-y-2">
            <Label>Color Palette</Label>
            <Select value={params.colorScheme} onValueChange={(value) => updateParam("colorScheme", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="forest">Forest Earth</SelectItem>
                <SelectItem value="sunset">Sunset Warmth</SelectItem>
                <SelectItem value="ember">Sacred Fire</SelectItem>
                <SelectItem value="vintage">Ancient Tones</SelectItem>
                <SelectItem value="lunar">Moonlight Silver</SelectItem>
                <SelectItem value="aurora">Spirit Lights</SelectItem>
              </SelectContent>
            </Select>
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
              <Label>Community Size: {params.numSamples.toLocaleString()}</Label>
              <Slider
                value={[params.numSamples]}
                onValueChange={([value]) => updateParam("numSamples", value)}
                min={1000}
                max={6000}
                step={100}
              />
            </div>

            <div className="space-y-2">
              <Label>Cultural Variation: {params.noiseScale}</Label>
              <Slider
                value={[params.noiseScale]}
                onValueChange={([value]) => updateParam("noiseScale", value)}
                min={0}
                max={0.15}
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
                Generate Cultural Art
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Cultural Art</CardTitle>
          <CardDescription>Your AI-generated cultural-themed artwork</CardDescription>
        </CardHeader>
        <CardContent>
          {isGenerating && (
            <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Creating cultural art...</p>
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
              <div className="space-y-2">
                <Badge variant="secondary">Cultural Art</Badge>
                <p className="text-sm text-muted-foreground">
                  Generated with {params.numSamples.toLocaleString()} cultural elements using {params.dataset} patterns
                </p>
              </div>
              <Button onClick={downloadImage} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download Cultural Artwork
              </Button>
            </div>
          )}

          {generationDetails && (
            <div className="mt-4 space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{generationDetails.provider}</Badge>
                <Badge variant="secondary">{generationDetails.model}</Badge>
                <Badge variant="secondary">{generationDetails.estimatedFileSize}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Cultural prompt length: {generationDetails.promptLength} characters
              </p>
            </div>
          )}

          {!isGenerating && !generatedImage && (
            <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
              <div className="text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Configure your settings and generate cultural art</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
