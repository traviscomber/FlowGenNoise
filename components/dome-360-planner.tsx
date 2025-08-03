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
import { Loader2, Download, Globe, Mountain, RefreshCw, Eye, Theater } from "lucide-react"
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
    domeDiameter: 20,
    domeResolution: "8K",
    projectionType: "fisheye", // Default to fisheye for TUNNEL UP effect
    panoramic360: true,
    panoramaResolution: "16K",
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

  const testWayangKulitShadows = async () => {
    setIsGenerating(true)
    setGeneratedImages({})
    setGenerationDetails(null)

    try {
      console.log("🎭 Starting Wayang Kulit Shadow Theatre dome projection test:", params)
      console.log("🏛️ Dome projection type:", params.projectionType)

      // Force Wayang Kulit shadow theatre configuration
      const wayangTestParams = {
        ...params,
        dataset: "indonesian", // Use Indonesian dataset
        scenario: "wayang", // Use wayang scenario for shadow theatre
        colorScheme: "aurora", // Use aurora colors for dramatic lighting
        customPrompt: "",
        domeDiameter: 20, // Force 20m diameter
        domeResolution: "8K", // Force highest resolution
        panoramaResolution: "16K", // Force highest resolution
        projectionType: params.projectionType || "fisheye", // Use selected projection type
        domeProjection: true, // Ensure dome projection is enabled
        panoramic360: true, // Ensure 360° is enabled
      }

      console.log("🎭 Wayang Kulit Shadow Theatre Test Configuration:", wayangTestParams)
      console.log("🏛️ Final projection type being sent:", wayangTestParams.projectionType)

      // Use the correct API endpoint
      const response = await fetch("/api/generate-ai-art", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(wayangTestParams),
      })

      console.log("📡 Wayang Kulit API response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        console.error("❌ Wayang Kulit API error:", errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("✅ Wayang Kulit Generation successful:", result.success)
      console.log("🎭 Wayang Kulit Dome generation details:", result.generationDetails)

      if (result.success && result.image) {
        setGeneratedImages({
          main: result.image,
          dome: result.domeImage || result.image,
          panorama: result.panoramaImage || result.image,
        })
        setGenerationDetails(result)

        // Count how many unique versions we got
        const versions = []
        if (result.image) versions.push("Wayang Kulit original")
        if (result.domeImage && result.domeImage !== result.image) versions.push("Shadow Theatre dome")
        if (result.panoramaImage && result.panoramaImage !== result.image) versions.push("360° Shadow VR")

        toast({
          title: "Wayang Kulit Shadow Theatre Generated Successfully!",
          description: `Created ${versions.length} version${versions.length > 1 ? "s" : ""}: ${versions.join(", ")}`,
        })

        // Log Wayang Kulit dome-specific test results
        console.log("🎭 Wayang Kulit Shadow Theatre generation test results:")
        console.log("- Wayang Kulit Main image URL:", result.image ? "✅ Generated" : "❌ Missing")
        console.log("- Shadow Theatre Dome URL:", result.domeImage ? "✅ Generated" : "❌ Missing")
        console.log("- 360° Shadow VR URL:", result.panoramaImage ? "✅ Generated" : "❌ Missing")
        console.log("- Dome diameter:", result.parameters?.domeDiameter || "Unknown")
        console.log("- Dome resolution:", result.parameters?.domeResolution || "Unknown")
        console.log("- Projection type:", result.parameters?.projectionType || "Unknown")
        console.log("- Generation details:", result.generationDetails)
        console.log("- Prompt length:", result.promptLength || "Unknown")
      } else {
        throw new Error(result.error || "Failed to generate Wayang Kulit Shadow Theatre image")
      }
    } catch (error: any) {
      console.error("💥 Wayang Kulit Shadow Theatre generation failed:", error)
      toast({
        title: "Wayang Kulit Shadow Theatre Generation Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const testFisheyeTunnelUp = async () => {
    setIsGenerating(true)
    setGeneratedImages({})
    setGenerationDetails(null)

    try {
      console.log("🐟 Starting FISHEYE TUNNEL UP projection test:", params)
      console.log("🏛️ Dome projection type:", params.projectionType)

      // Force fisheye projection for this test with enhanced TUNNEL UP requirements
      const fisheyeTestParams = {
        ...params,
        dataset: "spirals", // Use spirals for COSMOS patterns
        scenario: "cosmic", // Force cosmic scenario
        colorScheme: "cosmic", // Force cosmic colors
        customPrompt:
          "COSMOS mathematical spiral galaxies with stellar formations, cosmic fractals, and celestial mathematical structures creating infinite cosmic beauty through algorithmic precision and geometric harmony, perfect for fisheye dome projection with dramatic upward tunnel perspective, content flowing toward center point in concentric circles, radial symmetry with zenith focus",
        domeDiameter: 20, // Force 20m diameter
        domeResolution: "8K", // Force highest resolution
        panoramaResolution: "16K", // Force highest resolution
        projectionType: "fisheye", // Force fisheye for TUNNEL UP effect
        domeProjection: true, // Ensure dome projection is enabled
        panoramic360: true, // Ensure 360° is enabled
      }

      console.log("🐟 FISHEYE TUNNEL UP Test Configuration:", fisheyeTestParams)
      console.log("🏛️ Final projection type being sent:", fisheyeTestParams.projectionType)
      console.log("🐟 TUNNEL UP format: Circular fisheye with radial distortion and center focus")

      // Use the correct API endpoint
      const response = await fetch("/api/generate-ai-art", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fisheyeTestParams),
      })

      console.log("📡 FISHEYE API response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        console.error("❌ FISHEYE API error:", errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("✅ FISHEYE Generation successful:", result.success)
      console.log("🐟 FISHEYE Dome generation details:", result.generationDetails)

      if (result.success && result.image) {
        setGeneratedImages({
          main: result.image,
          dome: result.domeImage || result.image,
          panorama: result.panoramaImage || result.image,
        })
        setGenerationDetails(result)

        // Count how many unique versions we got
        const versions = []
        if (result.image) versions.push("COSMOS original")
        if (result.domeImage && result.domeImage !== result.image) versions.push("FISHEYE TUNNEL UP dome")
        if (result.panoramaImage && result.panoramaImage !== result.image) versions.push("16K 360° VR")

        toast({
          title: "FISHEYE TUNNEL UP Generated Successfully!",
          description: `Created ${versions.length} version${versions.length > 1 ? "s" : ""}: ${versions.join(", ")} - Dome should show circular fisheye format`,
        })

        // Log FISHEYE dome-specific test results
        console.log("🐟 FISHEYE TUNNEL UP generation test results:")
        console.log("- COSMOS Main image URL:", result.image ? "✅ Generated" : "❌ Missing")
        console.log("- FISHEYE TUNNEL UP Dome URL:", result.domeImage ? "✅ Generated" : "❌ Missing")
        console.log("- 16K 360° VR URL:", result.panoramaImage ? "✅ Generated" : "❌ Missing")
        console.log("- Dome diameter:", result.parameters?.domeDiameter || "Unknown")
        console.log("- Dome resolution:", result.parameters?.domeResolution || "Unknown")
        console.log("- Projection type:", result.parameters?.projectionType || "Unknown")
        console.log("- Generation details:", result.generationDetails)
        console.log("- Prompt length:", result.promptLength || "Unknown")
        console.log("🐟 TUNNEL UP format check: Dome image should be circular fisheye with center focus")
        console.log("- Custom prompt used:", fisheyeTestParams.customPrompt.substring(0, 100) + "...")
      } else {
        throw new Error(result.error || "Failed to generate FISHEYE TUNNEL UP image")
      }
    } catch (error: any) {
      console.error("💥 FISHEYE TUNNEL UP generation failed:", error)
      toast({
        title: "FISHEYE TUNNEL UP Generation Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const generateArt = async () => {
    setIsGenerating(true)
    setGeneratedImages({})
    setGenerationDetails(null)

    try {
      console.log("🌌 Starting dome/360° art generation with projection type:", params.projectionType)
      console.log("🎨 Dataset:", params.dataset, "Scenario:", params.scenario)

      // Use current parameters with selected projection type
      const generationParams = {
        ...params,
        customPrompt:
          params.customPrompt ||
          (params.dataset === "indonesian" && params.scenario === "wayang"
            ? "" // Let the API use the built-in wayang prompt
            : "COSMOS mathematical patterns with spiral galaxies, stellar formations, cosmic fractals, and celestial mathematical structures creating infinite cosmic beauty through algorithmic precision and geometric harmony"),
      }

      console.log("🌌 Generation Configuration:", generationParams)
      console.log("🏛️ Projection type being sent:", generationParams.projectionType)

      // Use the correct API endpoint
      const response = await fetch("/api/generate-ai-art", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(generationParams),
      })

      console.log("📡 API response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        console.error("❌ API error:", errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("✅ Generation successful:", result.success)
      console.log("🌌 Dome generation details:", result.generationDetails)

      if (result.success && result.image) {
        setGeneratedImages({
          main: result.image,
          dome: result.domeImage || result.image,
          panorama: result.panoramaImage || result.image,
        })
        setGenerationDetails(result)

        // Count how many unique versions we got
        const versions = []
        if (result.image) versions.push("Original")
        if (result.domeImage && result.domeImage !== result.image)
          versions.push(`${params.projectionType.toUpperCase()} dome`)
        if (result.panoramaImage && result.panoramaImage !== result.image) versions.push("360° VR")

        const artType =
          params.dataset === "indonesian" && params.scenario === "wayang"
            ? "Wayang Kulit Shadow Theatre"
            : `${params.projectionType.toUpperCase()} Dome`

        toast({
          title: `${artType} Generated Successfully!`,
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

  // Get available scenarios based on selected dataset
  const getAvailableScenarios = () => {
    if (params.dataset === "indonesian") {
      return [
        { value: "pure", label: "Pure Mathematical Beauty" },
        { value: "garuda", label: "🦅 Garuda Eagle" },
        { value: "wayang", label: "🎭 Wayang Kulit Shadow Theatre" },
        { value: "batik", label: "🎨 Sacred Batik Patterns" },
        { value: "borobudur", label: "🏛️ Borobudur Mandala" },
        { value: "komodo", label: "🐉 Komodo Dragon Spirits" },
        { value: "dance", label: "💃 Traditional Dance" },
        { value: "volcanoes", label: "🌋 Ring of Fire Volcanoes" },
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
            Create immersive artwork for planetariums, dome theaters, and VR experiences. Select Indonesian dataset +
            wayang scenario for shadow theatre.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test Buttons Section */}
          <div className="grid grid-cols-1 gap-3">
            {/* FISHEYE TUNNEL UP Test Section */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-900 mb-2 flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                FISHEYE TUNNEL UP Test
              </h4>
              <p className="text-sm text-purple-700 mb-3">
                Test the default fisheye projection with dramatic upward tunnel perspective effect optimized for
                planetarium dome ceiling viewing.
              </p>
              <Button
                onClick={testFisheyeTunnelUp}
                disabled={isGenerating}
                className="w-full bg-transparent"
                variant="outline"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing FISHEYE TUNNEL UP...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Test FISHEYE TUNNEL UP Projection
                  </>
                )}
              </Button>
            </div>

            {/* Wayang Kulit Shadow Theatre Test Section */}
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
              <h4 className="font-medium text-amber-900 mb-2 flex items-center">
                <Theater className="w-4 h-4 mr-2" />
                Wayang Kulit Shadow Theatre Test
              </h4>
              <p className="text-sm text-amber-700 mb-3">
                Test Indonesian shadow puppet theatre with dramatic shadows and backstage puppeteers, focusing on shadow
                projections without showing audience.
              </p>
              <Button
                onClick={testWayangKulitShadows}
                disabled={isGenerating}
                className="w-full bg-transparent"
                variant="outline"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing Wayang Kulit Shadows...
                  </>
                ) : (
                  <>
                    <Theater className="w-4 h-4 mr-2" />
                    Test Wayang Kulit Shadow Theatre
                  </>
                )}
              </Button>
            </div>
          </div>

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
              <Label>Dataset / Pattern</Label>
              <Select
                value={params.dataset}
                onValueChange={(value) => {
                  updateParam("dataset", value)
                  // Reset scenario when dataset changes
                  if (value === "indonesian") {
                    updateParam("scenario", "wayang") // Default to wayang for Indonesian
                  } else {
                    updateParam("scenario", "cosmic") // Default to cosmic for others
                  }
                }}
              >
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
                  <SelectItem value="indonesian">🇮🇩 Indonesian Cultural Heritage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Theme / Scenario</Label>
              <Select value={params.scenario} onValueChange={(value) => updateParam("scenario", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableScenarios().map((scenario) => (
                    <SelectItem key={scenario.value} value={scenario.value}>
                      {scenario.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Wayang Kulit Helper */}
          {params.dataset === "indonesian" && params.scenario === "wayang" && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center mb-2">
                <Theater className="w-4 h-4 mr-2 text-amber-700" />
                <span className="font-medium text-amber-900">Wayang Kulit Shadow Theatre Selected</span>
              </div>
              <p className="text-sm text-amber-700">
                Perfect! You've selected Indonesian dataset with wayang scenario. This will generate authentic shadow
                puppet theatre with dramatic shadows, backstage puppeteers, and traditional gamelan atmosphere - no
                audience shown.
              </p>
            </div>
          )}

          {/* Color Scheme */}
          <div className="space-y-2">
            <Label>Color Palette</Label>
            <Select value={params.colorScheme} onValueChange={(value) => updateParam("colorScheme", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cosmic">Cosmic Nebula</SelectItem>
                <SelectItem value="aurora">🎭 Aurora Borealis (Great for Shadow Theatre)</SelectItem>
                <SelectItem value="plasma">Electric Plasma</SelectItem>
                <SelectItem value="thermal">Thermal Vision</SelectItem>
                <SelectItem value="spectral">Full Spectrum</SelectItem>
                <SelectItem value="bioluminescent">Bioluminescent</SelectItem>
                <SelectItem value="crystalline">Crystal Prisms</SelectItem>
                <SelectItem value="ember">🔥 Glowing Embers (Great for Shadow Theatre)</SelectItem>
                <SelectItem value="vintage">📜 Vintage Sepia (Great for Shadow Theatre)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dome Settings */}
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">20m Dome Projection Settings</h4>
              <p className="text-sm text-blue-700 mb-3">
                Configuration for optimal 20m planetarium dome with selectable projection type
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Dome Diameter: 20m (Fixed)</Label>
                  <div className="p-2 bg-blue-100 rounded text-center text-blue-800 font-medium">20 meters</div>
                </div>

                <div className="space-y-2">
                  <Label>Resolution: 8K (Fixed)</Label>
                  <div className="p-2 bg-blue-100 rounded text-center text-blue-800 font-medium">8K Ultra HD</div>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <Label>Projection Type</Label>
                <Select value={params.projectionType} onValueChange={(value) => updateParam("projectionType", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fisheye">🐟 Fisheye TUNNEL UP (Default)</SelectItem>
                    <SelectItem value="equidistant">📐 Equidistant Projection</SelectItem>
                    <SelectItem value="stereographic">🔄 Stereographic Projection</SelectItem>
                    <SelectItem value="orthographic">📏 Orthographic Projection</SelectItem>
                    <SelectItem value="azimuthal">🎯 Azimuthal Projection</SelectItem>
                  </SelectContent>
                </Select>
                <div className="p-2 bg-blue-50 rounded text-xs text-blue-700">
                  {params.projectionType === "fisheye" && (
                    <span className="font-medium">
                      🐟 TUNNEL UP fisheye: Circular format with dramatic upward tunnel effect, content flows toward
                      center point creating immersive dome ceiling viewing experience
                    </span>
                  )}
                  {params.projectionType === "equidistant" && (
                    <span className="font-medium">📐 Uniform angular distribution across dome surface</span>
                  )}
                  {params.projectionType === "stereographic" && (
                    <span className="font-medium">🔄 Conformal mapping preserving angles and shapes</span>
                  )}
                  {params.projectionType === "orthographic" && (
                    <span className="font-medium">📏 Parallel ray mapping with true proportions</span>
                  )}
                  {params.projectionType === "azimuthal" && (
                    <span className="font-medium">🎯 Radial symmetry with equal-area mapping</span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">16K 360° VR Settings</h4>
              <p className="text-sm text-green-700 mb-3">
                Fixed configuration for highest quality VR and immersive viewing
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Resolution: 16K (Fixed)</Label>
                  <div className="p-2 bg-green-100 rounded text-center text-green-800 font-medium">16K Ultra HD</div>
                </div>

                <div className="space-y-2">
                  <Label>Format: Equirectangular (Fixed)</Label>
                  <div className="p-2 bg-green-100 rounded text-center text-green-800 font-medium">
                    Equirectangular VR
                  </div>
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
                Generating{" "}
                {params.dataset === "indonesian" && params.scenario === "wayang"
                  ? "Wayang Kulit Shadow Theatre"
                  : `${params.projectionType.toUpperCase()} Dome`}
                ...
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 mr-2" />
                Generate{" "}
                {params.dataset === "indonesian" && params.scenario === "wayang"
                  ? "Wayang Kulit Shadow Theatre"
                  : `${params.projectionType.toUpperCase()} Dome + 360° VR`}
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            {params.dataset === "indonesian" && params.scenario === "wayang"
              ? "Generates: Original Shadow Theatre + Dome Projection + 360° VR"
              : `Generates: Original + ${params.projectionType.toUpperCase()} Dome + 16K 360° VR`}
          </p>
        </CardContent>
      </Card>

      {/* Results Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Immersive Art</CardTitle>
          <CardDescription>
            {params.dataset === "indonesian" && params.scenario === "wayang"
              ? "Wayang Kulit Shadow Theatre: Original, Dome, and 360° VR"
              : `All 3 versions: Original, ${params.projectionType.toUpperCase()} Dome, and 360° VR`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isGenerating && (
            <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Creating all 3 immersive versions...</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {params.dataset === "indonesian" && params.scenario === "wayang"
                    ? "Shadow Theatre → Dome → 360° VR"
                    : `Original → ${params.projectionType.toUpperCase()} Dome → 360° VR`}
                </p>
              </div>
            </div>
          )}

          {(generatedImages.main || generatedImages.dome || generatedImages.panorama) && (
            <Tabs defaultValue="main" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="main">Original</TabsTrigger>
                <TabsTrigger value="dome">{params.projectionType.toUpperCase()} Dome</TabsTrigger>
                <TabsTrigger value="panorama">360° VR</TabsTrigger>
              </TabsList>

              <TabsContent value="main" className="space-y-4">
                {generatedImages.main && (
                  <>
                    <div className="relative">
                      <Image
                        src={generatedImages.main || "/placeholder.svg"}
                        alt={
                          params.dataset === "indonesian" && params.scenario === "wayang"
                            ? "Generated Wayang Kulit shadow theatre art"
                            : "Generated standard mathematical art"
                        }
                        width={512}
                        height={512}
                        className="w-full rounded-lg shadow-lg"
                        unoptimized
                      />
                    </div>
                    <div className="space-y-2">
                      <Badge variant="secondary">
                        {params.dataset === "indonesian" && params.scenario === "wayang"
                          ? "🎭 Wayang Kulit Shadow Theatre"
                          : "Original Mathematical Art"}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {params.dataset === "indonesian" && params.scenario === "wayang"
                          ? "Traditional Indonesian shadow puppet theatre with dramatic shadows, backstage puppeteers, and gamelan atmosphere"
                          : "Standard mathematical artwork with algorithmic beauty and geometric precision"}
                      </p>
                    </div>
                    <Button
                      onClick={() =>
                        downloadImage(
                          generatedImages.main!,
                          params.dataset === "indonesian" && params.scenario === "wayang"
                            ? "wayang-kulit-original"
                            : "original",
                        )
                      }
                      className="w-full"
                    >
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
                        alt={`Generated ${params.projectionType} dome projection art`}
                        width={512}
                        height={512}
                        className="w-full rounded-lg shadow-lg"
                        unoptimized
                      />
                    </div>
                    <div className="space-y-2">
                      <Badge variant="secondary">
                        <Mountain className="w-3 h-3 mr-1" />
                        20m {params.projectionType.toUpperCase()} Dome • 8K Ultra HD
                        {params.dataset === "indonesian" && params.scenario === "wayang" && " • Shadow Theatre"}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {params.dataset === "indonesian" && params.scenario === "wayang"
                          ? `Wayang Kulit shadow theatre optimized for 20-meter diameter planetarium dome with ${params.projectionType} projection, perfect for immersive shadow puppet viewing`
                          : (params.projectionType === "fisheye" &&
                              "TUNNEL UP fisheye effect optimized for 20-meter diameter planetarium dome with dramatic upward perspective illusion for overhead ceiling viewing") ||
                            (params.projectionType === "equidistant" &&
                              "Equidistant projection with uniform angular distribution across dome surface for accurate planetarium display") ||
                            (params.projectionType === "stereographic" &&
                              "Stereographic projection with conformal mapping preserving angles and shapes for enhanced dome clarity") ||
                            (params.projectionType === "orthographic" &&
                              "Orthographic projection with parallel ray mapping maintaining true proportions across dome surface") ||
                            (params.projectionType === "azimuthal" &&
                              "Azimuthal projection with radial symmetry and equal-area mapping for consistent dome brightness")}
                      </p>
                    </div>
                    <Button
                      onClick={() =>
                        downloadImage(
                          generatedImages.dome!,
                          params.dataset === "indonesian" && params.scenario === "wayang"
                            ? `wayang-kulit-dome-${params.projectionType.toLowerCase()}`
                            : `20m-dome-${params.projectionType.toLowerCase()}`,
                        )
                      }
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download 20m {params.projectionType.toUpperCase()} Dome Version
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
                        alt="Generated 16K 360° panorama art"
                        width={512}
                        height={256}
                        className="w-full rounded-lg shadow-lg"
                        unoptimized
                      />
                    </div>
                    <div className="space-y-2">
                      <Badge variant="secondary">
                        <Globe className="w-3 h-3 mr-1" />
                        16K 360° VR • Ultra HD • Equirectangular
                        {params.dataset === "indonesian" && params.scenario === "wayang" && " • Shadow Theatre"}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {params.dataset === "indonesian" && params.scenario === "wayang"
                          ? "Seamless 16K ultra-high-definition 360° Wayang Kulit shadow theatre ready for VR headsets and immersive shadow puppet experiences"
                          : "Seamless 16K ultra-high-definition 360° mathematical art ready for VR headsets and immersive viewing experiences"}
                      </p>
                    </div>
                    <Button
                      onClick={() =>
                        downloadImage(
                          generatedImages.panorama!,
                          params.dataset === "indonesian" && params.scenario === "wayang"
                            ? "wayang-kulit-360-vr"
                            : "16k-360-vr",
                        )
                      }
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download 16K 360° VR Version
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
                <Badge variant="secondary">
                  {params.dataset === "indonesian" && params.scenario === "wayang"
                    ? "Wayang Kulit Test"
                    : `${params.projectionType.toUpperCase()} Dome Test`}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {params.dataset === "indonesian" && params.scenario === "wayang"
                  ? `Wayang Kulit shadow theatre test completed with ${params.numSamples.toLocaleString()} data points for immersive display`
                  : `${params.projectionType.toUpperCase()} dome test completed with ${params.numSamples.toLocaleString()} data points for immersive display`}
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="font-medium">Original</div>
                  <div className="text-muted-foreground">
                    {generationDetails.generationDetails?.mainImage || "Status unknown"}
                  </div>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded">
                  <div className="font-medium">20m {params.projectionType.toUpperCase()} Dome</div>
                  <div className="text-muted-foreground">
                    {generationDetails.generationDetails?.domeImage || "Status unknown"}
                  </div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="font-medium">16K 360° VR</div>
                  <div className="text-muted-foreground">
                    {generationDetails.generationDetails?.panoramaImage || "Status unknown"}
                  </div>
                </div>
              </div>

              {/* Test Results */}
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h5 className="font-medium text-blue-900 mb-2">
                  {params.dataset === "indonesian" && params.scenario === "wayang"
                    ? "Wayang Kulit Shadow Theatre Test Results"
                    : `20m ${params.projectionType.toUpperCase()} Dome Test Results`}
                </h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-medium">Dataset:</span> {params.dataset}
                  </div>
                  <div>
                    <span className="font-medium">Scenario:</span> {params.scenario}
                  </div>
                  <div>
                    <span className="font-medium">Dome Diameter:</span>{" "}
                    {generationDetails.parameters?.domeDiameter || 20}m
                  </div>
                  <div>
                    <span className="font-medium">Dome Resolution:</span>{" "}
                    {generationDetails.parameters?.domeResolution || "8K"}
                  </div>
                  <div>
                    <span className="font-medium">Projection Type:</span>{" "}
                    {generationDetails.parameters?.projectionType || params.projectionType}
                  </div>
                  <div>
                    <span className="font-medium">
                      {params.dataset === "indonesian" && params.scenario === "wayang"
                        ? "Shadow Theatre:"
                        : params.projectionType === "fisheye"
                          ? "TUNNEL UP Effect:"
                          : "Projection Effect:"}
                    </span>{" "}
                    ✅ Active
                  </div>
                  <div>
                    <span className="font-medium">360° Resolution:</span>{" "}
                    {generationDetails.parameters?.panoramaResolution || "16K"}
                  </div>
                  <div>
                    <span className="font-medium">360° Format:</span>{" "}
                    {generationDetails.parameters?.panoramaFormat || "equirectangular"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isGenerating && !generatedImages.main && (
            <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
              <div className="text-center">
                <Globe className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Select Indonesian dataset + wayang scenario for shadow theatre, or test FISHEYE TUNNEL UP
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Original + {params.projectionType.toUpperCase()} Dome + 360° VR
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
