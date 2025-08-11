"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
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
    dataset: "vietnamese",
    scenario: "temple-of-literature",
    colorScheme: "cosmic",
    seed: Math.floor(Math.random() * 10000),
    numSamples: 4000,
    noiseScale: 0.08,
    customPrompt: "",
    domeProjection: true,
    domeDiameter: 15,
    domeResolution: "4K",
    projectionType: "fisheye",
    panoramic360: true,
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
    setParams((prev) => {
      const newParams = { ...prev, [key]: value }

      // Reset scenario to first available option when dataset changes
      if (key === "dataset") {
        const scenarios = getScenarios(value)
        newParams.scenario = scenarios[0]?.value || "pure"
      }

      return newParams
    })
  }

  const generateRandomSeed = () => {
    updateParam("seed", Math.floor(Math.random() * 10000))
  }

  // Get scenarios based on selected dataset
  const getScenarios = (dataset?: string) => {
    const currentDataset = dataset || params.dataset
    if (currentDataset === "vietnamese") {
      return [
        { value: "pure", label: "Pure Mathematical" },
        { value: "temple-of-literature", label: "🏛️ Temple of Literature - First University" },
        { value: "jade-emperor-pagoda", label: "🏮 Jade Emperor Pagoda - Taoist Temple" },
        { value: "imperial-city-hue", label: "👑 Imperial City Hue - Royal Palace" },
        { value: "tomb-of-khai-dinh", label: "⚱️ Tomb of Khai Dinh - Imperial Mausoleum" },
        { value: "sapa-terraces", label: "🌾 Sapa Rice Terraces - Mountain Agriculture" },
        { value: "mekong-delta", label: "🌊 Mekong Delta - River Life" },
        { value: "tet-celebration", label: "🎊 Tet Celebration - Lunar New Year" },
        { value: "mid-autumn-festival", label: "🏮 Mid-Autumn Festival - Lantern Night" },
        { value: "water-puppetry", label: "🎭 Water Puppetry - Traditional Theater" },
        { value: "lacquerware-craft", label: "🎨 Lacquerware Craft - Traditional Art" },
        { value: "bach-dang-victory", label: "⚔️ Bach Dang Victory - Naval Battle" },
        { value: "trung-sisters-rebellion", label: "🛡️ Trung Sisters - Female Warriors" },
        { value: "halong-bay", label: "🏔️ Ha Long Bay - Limestone Karsts" },
        { value: "phong-nha-caves", label: "🕳️ Phong Nha Caves - Underground Wonder" },
        { value: "floating-market-mekong", label: "🛶 Floating Market - River Commerce" },
        { value: "pho-street-culture", label: "🍜 Pho Street Culture - Culinary Heritage" },
        { value: "ca-tru-performance", label: "🎵 Ca Tru Performance - Ancient Music" },
        { value: "quan-ho-folk-songs", label: "🎶 Quan Ho Folk Songs - Traditional Singing" },
      ]
    } else if (currentDataset === "thailand") {
      return [
        { value: "pure", label: "Pure Mathematical" },
        { value: "garuda", label: "🦅 Garuda - Divine Eagle" },
        { value: "naga", label: "🐉 Naga - Serpent Dragon" },
        { value: "erawan", label: "🐘 Erawan - Three-Headed Elephant" },
        { value: "karen", label: "🏔️ Karen Hill Tribe" },
        { value: "hmong", label: "🎭 Hmong Mountain People" },
        { value: "ayutthaya", label: "🏛️ Ayutthaya Ancient Capital" },
        { value: "sukhothai", label: "🏺 Sukhothai Dawn Kingdom" },
        { value: "songkran", label: "💦 Songkran Water Festival" },
        { value: "loy-krathong", label: "🕯️ Loy Krathong Floating Lights" },
        { value: "coronation", label: "👑 Royal Coronation Ceremony" },
        { value: "wat-pho", label: "🧘 Wat Pho Reclining Buddha" },
        { value: "wat-arun", label: "🌅 Wat Arun Temple of Dawn" },
        { value: "muay-thai", label: "🥊 Muay Thai Ancient Boxing" },
        { value: "classical-dance", label: "💃 Thai Classical Dance" },
        { value: "golden-triangle", label: "🌊 Golden Triangle Mekong" },
        { value: "floating-markets", label: "🛶 Traditional Floating Markets" },
      ]
    } else if (currentDataset === "indonesian") {
      return [
        { value: "pure", label: "Pure Mathematical" },
        { value: "garuda", label: "🦅 Garuda Wisnu Kencana" },
        { value: "wayang", label: "🎭 Wayang Shadow Puppets" },
        { value: "batik", label: "🎨 Traditional Batik" },
        { value: "borobudur", label: "🏛️ Borobudur Temple" },
        { value: "javanese", label: "🎵 Javanese Culture" },
        { value: "balinese-tribe", label: "🌺 Balinese Hindu" },
        { value: "dayak", label: "🏞️ Dayak Borneo" },
        { value: "papuans", label: "🪶 Papuan Tribes" },
        { value: "komodo", label: "🦎 Komodo Dragons" },
        { value: "volcanoes", label: "🌋 Ring of Fire" },
        { value: "temples", label: "🏯 Sacred Temples" },
      ]
    } else {
      return [
        { value: "cosmic", label: "Deep Space" },
        { value: "underwater", label: "Ocean Depths" },
        { value: "crystalline", label: "Crystal Caverns" },
        { value: "forest", label: "Enchanted Forest" },
        { value: "aurora", label: "Aurora Skies" },
        { value: "volcanic", label: "Volcanic Landscape" },
      ]
    }
  }

  const generateArt = async () => {
    setIsGenerating(true)
    setGeneratedImages({})
    setGenerationDetails(null)

    try {
      console.log("🏛️ Starting dome/360° art generation with params:", params)

      const response = await fetch("/api/generate-ai-art", {
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
          dome: result.domeImage || result.image, // Fallback to main if dome missing
          panorama: result.panoramaImage || result.image, // Fallback to main if panorama missing
        })
        setGenerationDetails(result)

        // Count how many unique versions we got
        const versions = []
        if (result.image) versions.push("original")
        if (result.domeImage && result.domeImage !== result.image) versions.push("dome tunnel")
        if (result.panoramaImage && result.panoramaImage !== result.image) versions.push("360° VR")

        toast({
          title: "Immersive Art Generated Successfully!",
          description: `Created ${versions.length} version${versions.length > 1 ? "s" : ""}: ${versions.join(", ")}`,
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
            Create immersive artwork for planetariums, dome theaters, and VR experiences. Generates all 3 versions:
            Original, Dome Tunnel, and 360° VR.
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
              <Label>Cultural Dataset</Label>
              <Select value={params.dataset} onValueChange={(value) => updateParam("dataset", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vietnamese">🇻🇳 Vietnamese Heritage</SelectItem>
                  <SelectItem value="indonesian">🇮🇩 Indonesian Heritage</SelectItem>
                  <SelectItem value="thailand">🇹🇭 Thailand - Gods & Ceremonies</SelectItem>
                  <SelectItem value="spirals">🌀 Cosmic Spirals</SelectItem>
                  <SelectItem value="fractal">🌿 Fractal Trees</SelectItem>
                  <SelectItem value="mandelbrot">🔢 Mandelbrot Zoom</SelectItem>
                  <SelectItem value="julia">🎨 Julia Landscapes</SelectItem>
                  <SelectItem value="lorenz">🦋 Chaos Attractors</SelectItem>
                  <SelectItem value="hyperbolic">📐 Hyperbolic Geometry</SelectItem>
                  <SelectItem value="gaussian">📊 Gaussian Distributions</SelectItem>
                  <SelectItem value="cellular">🔬 Cellular Automata</SelectItem>
                  <SelectItem value="voronoi">💎 Crystal Cells</SelectItem>
                  <SelectItem value="perlin">🌊 Perlin Noise</SelectItem>
                  <SelectItem value="diffusion">⚗️ Reaction-Diffusion</SelectItem>
                  <SelectItem value="wave">🌊 Wave Fields</SelectItem>
                  <SelectItem value="escher">🔄 M.C. Escher Paradoxes</SelectItem>
                  <SelectItem value="8bit">🎮 8-bit Pixel Art</SelectItem>
                  <SelectItem value="bosch">🎨 Hieronymus Bosch Surreal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Immersive Scenario</Label>
              <Select value={params.scenario} onValueChange={(value) => updateParam("scenario", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getScenarios().map((scenario) => (
                    <SelectItem key={scenario.value} value={scenario.value}>
                      {scenario.label}
                    </SelectItem>
                  ))}
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
                <SelectItem value="cosmic">🌌 Cosmic Nebula</SelectItem>
                <SelectItem value="aurora">🌈 Aurora Borealis</SelectItem>
                <SelectItem value="plasma">⚡ Electric Plasma</SelectItem>
                <SelectItem value="thermal">🔥 Thermal Vision</SelectItem>
                <SelectItem value="spectral">🎨 Full Spectrum</SelectItem>
                <SelectItem value="bioluminescent">🌟 Bioluminescent</SelectItem>
                <SelectItem value="crystalline">💎 Crystal Prisms</SelectItem>
                <SelectItem value="golden">✨ Royal Gold</SelectItem>
                <SelectItem value="temple">🏛️ Temple Sacred</SelectItem>
                <SelectItem value="festival">🎊 Festival Bright</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dome Settings */}
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Dome Projection Settings</h4>
              <p className="text-sm text-blue-700 mb-3">Configure dome tunnel effect for planetarium projection</p>
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
                  <Select value={params.domeResolution} onValueChange={(value) => updateParam("domeResolution", value)}>
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

              <div className="space-y-2 mt-4">
                <Label>Projection Type</Label>
                <Select value={params.projectionType} onValueChange={(value) => updateParam("projectionType", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fisheye">🐟 Fisheye Tunnel</SelectItem>
                    <SelectItem value="equidistant">📐 Equidistant Tunnel</SelectItem>
                    <SelectItem value="stereographic">🌍 Little Planet Effect</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">360° VR Settings</h4>
              <p className="text-sm text-green-700 mb-3">Configure panoramic settings for VR and immersive viewing</p>
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
                  <Select value={params.panoramaFormat} onValueChange={(value) => updateParam("panoramaFormat", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equirectangular">📐 Equirectangular</SelectItem>
                      <SelectItem value="stereographic">🌍 Stereographic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
                Creating All 3 Versions...
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 mr-2" />
                Generate All 3 Versions
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Generates Original + Dome Tunnel + 360° VR versions
          </p>
        </CardContent>
      </Card>

      {/* Results Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Immersive Art</CardTitle>
          <CardDescription>All 3 versions: Original, Dome Tunnel, and 360° VR</CardDescription>
        </CardHeader>
        <CardContent>
          {isGenerating && (
            <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Creating all 3 immersive versions...</p>
                <p className="text-xs text-muted-foreground mt-1">Original → Dome Tunnel → 360° VR</p>
              </div>
            </div>
          )}

          {(generatedImages.main || generatedImages.dome || generatedImages.panorama) && (
            <Tabs defaultValue="main" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="main">Original</TabsTrigger>
                <TabsTrigger value="dome">Dome Tunnel</TabsTrigger>
                <TabsTrigger value="panorama">360° VR</TabsTrigger>
              </TabsList>

              <TabsContent value="main" className="space-y-4">
                {generatedImages.main && (
                  <>
                    <div className="relative">
                      <Image
                        src={generatedImages.main || "/placeholder.svg"}
                        alt="Generated standard mathematical art"
                        width={512}
                        height={512}
                        className="w-full rounded-lg shadow-lg"
                        unoptimized
                      />
                    </div>
                    <div className="space-y-2">
                      <Badge variant="secondary">Original Mathematical Art</Badge>
                      <p className="text-sm text-muted-foreground">
                        Standard mathematical artwork with algorithmic beauty and geometric precision
                      </p>
                    </div>
                    <Button onClick={() => downloadImage(generatedImages.main!, "original")} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download Original Version
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
                        alt="Generated dome tunnel projection art"
                        width={512}
                        height={512}
                        className="w-full rounded-lg shadow-lg"
                        unoptimized
                      />
                    </div>
                    <div className="space-y-2">
                      <Badge variant="secondary">
                        <Mountain className="w-3 h-3 mr-1" />
                        {params.domeDiameter}m Dome Tunnel • {params.domeResolution}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        Fisheye tunnel effect optimized for {params.domeDiameter}m diameter planetarium dome with
                        dramatic depth illusion
                      </p>
                    </div>
                    <Button onClick={() => downloadImage(generatedImages.dome!, "dome-tunnel")} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download Dome Tunnel Version
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
                        alt="Generated 360° panorama mathematical art"
                        width={512}
                        height={params.panoramaFormat === "equirectangular" ? 256 : 512}
                        className="w-full rounded-lg shadow-lg"
                        unoptimized
                      />
                    </div>
                    <div className="space-y-2">
                      <Badge variant="secondary">
                        <Globe className="w-3 h-3 mr-1" />
                        360° VR • {params.panoramaResolution} • {params.panoramaFormat}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {params.panoramaFormat === "equirectangular"
                          ? "Seamless 360° mathematical art ready for VR headsets and immersive viewing"
                          : `${params.stereographicPerspective} stereographic mathematical projection`}
                      </p>
                    </div>
                    <Button onClick={() => downloadImage(generatedImages.panorama!, "360-vr")} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download 360° VR Version
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
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="font-medium">Original</div>
                  <div className="text-muted-foreground">{generationDetails.mainImage}</div>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded">
                  <div className="font-medium">Dome</div>
                  <div className="text-muted-foreground">{generationDetails.domeImage}</div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="font-medium">360° VR</div>
                  <div className="text-muted-foreground">{generationDetails.panoramaImage}</div>
                </div>
              </div>
            </div>
          )}

          {!isGenerating && !generatedImages.main && (
            <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
              <div className="text-center">
                <Globe className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Configure your settings and generate all 3 versions</p>
                <p className="text-xs text-muted-foreground mt-1">Original + Dome Tunnel + 360° VR</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
