"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Download, Globe, Mountain, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface DomeParams {
  dataset: string
  scenario: string
  colorScheme: string
  seed: number
  numSamples: number
  noiseScale: number
  customPrompt: string
  domeProjection: boolean
  domeDiameter: number
  domeResolution: string
  projectionType: string
  panoramic360: boolean
  panoramaResolution: string
  panoramaFormat: string
  stereographicPerspective: string
}

export function Dome360Planner() {
  const { toast } = useToast()
  const [params, setParams] = useState<DomeParams>({
    dataset: "spirals",
    scenario: "cosmic",
    colorScheme: "cosmic",
    seed: Math.floor(Math.random() * 10000),
    numSamples: 4000,
    noiseScale: 0.08,
    customPrompt: "",
    domeProjection: true,
    domeDiameter: 15,
    domeResolution: "4K",
    projectionType: "fisheye",
    panoramic360: false,
    panoramaResolution: "8K",
    panoramaFormat: "equirectangular",
    stereographicPerspective: "little-planet",
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<{
    main?: string
    dome?: string
    panorama?: string
  }>({})
  const [generationDetails, setGenerationDetails] = useState<any>(null)

  const updateParam = (key: keyof DomeParams, value: any) => {
    setParams((prev) => ({ ...prev, [key]: value }))
  }

  const generateRandomSeed = () => {
    updateParam("seed", Math.floor(Math.random() * 10000))
  }

  const generateArt = async () => {
    setIsGenerating(true)
    setGeneratedImages({})
    setGenerationDetails(null)

    try {
      console.log("🏛️ Starting dome/360° art generation with params:", params)

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
        setGeneratedImages({
          main: result.image,
          dome: result.domeImage,
          panorama: result.panoramaImage,
        })
        setGenerationDetails(result)
        toast({
          title: "Immersive Art Generated Successfully!",
          description: `Created ${params.domeProjection ? "dome" : ""}${params.domeProjection && params.panoramic360 ? " and " : ""}${params.panoramic360 ? "360°" : ""} artwork`,
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

  const downloadImage = async (imageUrl: string, suffix: string) => {
    if (!imageUrl) return

    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `flowsketch-${suffix}-${params.seed}.png`
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Download Started",
        description: `Your ${suffix} artwork is being downloaded`,
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
            <Globe className="w-5 h-5 mr-2" />
            Dome & 360° Planner
          </CardTitle>
          <CardDescription>
            Create immersive artwork for planetariums, dome theaters, and VR experiences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Custom Prompt */}
          <div className="space-y-2">
            <Label htmlFor="customPrompt">Immersive Description (Optional)</Label>
            <Textarea
              id="customPrompt"
              placeholder="Describe the immersive experience you want to create..."
              value={params.customPrompt}
              onChange={(e) => updateParam("customPrompt", e.target.value)}
              rows={3}
            />
          </div>

          {/* Dataset and Scenario */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mathematical Pattern</Label>
              <Select value={params.dataset} onValueChange={(value) => updateParam("dataset", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spirals">Cosmic Spirals</SelectItem>
                  <SelectItem value="fractal">Fractal Trees</SelectItem>
                  <SelectItem value="mandelbrot">Mandelbrot Zoom</SelectItem>
                  <SelectItem value="julia">Julia Landscapes</SelectItem>
                  <SelectItem value="lorenz">Chaos Attractors</SelectItem>
                  <SelectItem value="voronoi">Crystal Cells</SelectItem>
                  <SelectItem value="wave">Wave Fields</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Immersive Theme</Label>
              <Select value={params.scenario} onValueChange={(value) => updateParam("scenario", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cosmic">Deep Space</SelectItem>
                  <SelectItem value="underwater">Ocean Depths</SelectItem>
                  <SelectItem value="crystalline">Crystal Caverns</SelectItem>
                  <SelectItem value="forest">Enchanted Forest</SelectItem>
                  <SelectItem value="aurora">Aurora Skies</SelectItem>
                  <SelectItem value="volcanic">Volcanic Landscape</SelectItem>
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
                <SelectItem value="cosmic">Cosmic Nebula</SelectItem>
                <SelectItem value="aurora">Aurora Borealis</SelectItem>
                <SelectItem value="plasma">Electric Plasma</SelectItem>
                <SelectItem value="thermal">Thermal Vision</SelectItem>
                <SelectItem value="spectral">Full Spectrum</SelectItem>
                <SelectItem value="bioluminescent">Bioluminescent</SelectItem>
                <SelectItem value="crystalline">Crystal Prisms</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Projection Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="domeProjection"
                checked={params.domeProjection}
                onCheckedChange={(checked) => updateParam("domeProjection", checked)}
              />
              <Label htmlFor="domeProjection">Enable Dome Projection</Label>
            </div>

            {params.domeProjection && (
              <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Dome Diameter: {params.domeDiameter}m</Label>
                    <Slider
                      value={[params.domeDiameter]}
                      onValueChange={([value]) => updateParam("domeDiameter", value)}
                      min={5}
                      max={30}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Resolution</Label>
                    <Select
                      value={params.domeResolution}
                      onValueChange={(value) => updateParam("domeResolution", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2K">2K (2048x2048)</SelectItem>
                        <SelectItem value="4K">4K (4096x4096)</SelectItem>
                        <SelectItem value="8K">8K (8192x8192)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Projection Type</Label>
                  <Select value={params.projectionType} onValueChange={(value) => updateParam("projectionType", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fisheye">Fisheye</SelectItem>
                      <SelectItem value="equidistant">Equidistant</SelectItem>
                      <SelectItem value="stereographic">Stereographic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="panoramic360"
                checked={params.panoramic360}
                onCheckedChange={(checked) => updateParam("panoramic360", checked)}
              />
              <Label htmlFor="panoramic360">Enable 360° Panorama</Label>
            </div>

            {params.panoramic360 && (
              <div className="space-y-4 pl-6 border-l-2 border-green-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Resolution</Label>
                    <Select
                      value={params.panoramaResolution}
                      onValueChange={(value) => updateParam("panoramaResolution", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4K">4K</SelectItem>
                        <SelectItem value="8K">8K</SelectItem>
                        <SelectItem value="16K">16K</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Format</Label>
                    <Select
                      value={params.panoramaFormat}
                      onValueChange={(value) => updateParam("panoramaFormat", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equirectangular">Equirectangular</SelectItem>
                        <SelectItem value="stereographic">Stereographic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {params.panoramaFormat === "stereographic" && (
                  <div className="space-y-2">
                    <Label>Perspective</Label>
                    <Select
                      value={params.stereographicPerspective}
                      onValueChange={(value) => updateParam("stereographicPerspective", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="little-planet">Little Planet</SelectItem>
                        <SelectItem value="tunnel">Tunnel View</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
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
                min={1000}
                max={8000}
                step={100}
              />
            </div>

            <div className="space-y-2">
              <Label>Noise Scale: {params.noiseScale}</Label>
              <Slider
                value={[params.noiseScale]}
                onValueChange={([value]) => updateParam("noiseScale", value)}
                min={0}
                max={0.2}
                step={0.01}
              />
            </div>
          </div>

          {/* Generate Button */}
          <Button onClick={generateArt} disabled={isGenerating} className="w-full" size="lg">
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Immersive Art...
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 mr-2" />
                Generate Immersive Artwork
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Immersive Art</CardTitle>
          <CardDescription>Your dome and 360° artwork will appear here once generated</CardDescription>
        </CardHeader>
        <CardContent>
          {isGenerating && (
            <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Creating your immersive experience...</p>
              </div>
            </div>
          )}

          {(generatedImages.main || generatedImages.dome || generatedImages.panorama) && (
            <Tabs defaultValue="main" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="main">Standard</TabsTrigger>
                <TabsTrigger value="dome" disabled={!generatedImages.dome}>
                  Dome
                </TabsTrigger>
                <TabsTrigger value="panorama" disabled={!generatedImages.panorama}>
                  360°
                </TabsTrigger>
              </TabsList>

              <TabsContent value="main" className="space-y-4">
                {generatedImages.main && (
                  <>
                    <div className="relative">
                      <Image
                        src={generatedImages.main || "/placeholder.svg"}
                        alt="Generated standard art"
                        width={512}
                        height={512}
                        className="w-full rounded-lg shadow-lg"
                        unoptimized
                      />
                    </div>
                    <Button onClick={() => downloadImage(generatedImages.main!, "standard")} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download Standard Version
                    </Button>
                  </>
                )}
              </TabsContent>

              <TabsContent value="dome" className="space-y-4">
                {generatedImages.dome && (
                  <>
                    <div className="relative">
                      <Image
                        src={generatedImages.dome || "/placeholder.svg"}
                        alt="Generated dome projection art"
                        width={512}
                        height={512}
                        className="w-full rounded-lg shadow-lg"
                        unoptimized
                      />
                    </div>
                    <div className="space-y-2">
                      <Badge variant="secondary">
                        <Mountain className="w-3 h-3 mr-1" />
                        {params.domeDiameter}m Dome • {params.domeResolution}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        Optimized for {params.projectionType} projection on {params.domeDiameter}m diameter dome
                      </p>
                    </div>
                    <Button onClick={() => downloadImage(generatedImages.dome!, "dome")} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download Dome Version
                    </Button>
                  </>
                )}
              </TabsContent>

              <TabsContent value="panorama" className="space-y-4">
                {generatedImages.panorama && (
                  <>
                    <div className="relative">
                      <Image
                        src={generatedImages.panorama || "/placeholder.svg"}
                        alt="Generated 360° panorama art"
                        width={512}
                        height={params.panoramaFormat === "equirectangular" ? 256 : 512}
                        className="w-full rounded-lg shadow-lg"
                        unoptimized
                      />
                    </div>
                    <div className="space-y-2">
                      <Badge variant="secondary">
                        <Globe className="w-3 h-3 mr-1" />
                        360° • {params.panoramaResolution} • {params.panoramaFormat}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {params.panoramaFormat === "equirectangular"
                          ? "Ready for VR headsets and 360° video platforms"
                          : `${params.stereographicPerspective} stereographic projection`}
                      </p>
                    </div>
                    <Button onClick={() => downloadImage(generatedImages.panorama!, "360")} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download 360° Version
                    </Button>
                  </>
                )}
              </TabsContent>
            </Tabs>
          )}

          {generationDetails && (
            <div className="mt-4 space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{generationDetails.provider}</Badge>
                <Badge variant="secondary">{generationDetails.model}</Badge>
                <Badge variant="secondary">{generationDetails.estimatedFileSize}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Generated with {params.numSamples.toLocaleString()} data points for immersive display
              </p>
            </div>
          )}

          {!isGenerating && !generatedImages.main && (
            <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
              <div className="text-center">
                <Globe className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Configure your immersive settings and generate artwork</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
