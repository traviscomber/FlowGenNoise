"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import {
  Sparkles,
  Settings,
  ImageIcon,
  Download,
  Loader2,
  Globe,
  Building,
  Dice6,
  Mountain,
  Pencil,
  Eye,
  Zap,
} from "lucide-react"

interface GeneratedArtResponse {
  success: boolean
  image: string
  domeImage?: string
  panoramaImage?: string
  originalPrompt?: string
  promptLength?: number
  provider?: string
  model?: string
  quality?: string
  estimatedFileSize?: string
  generationDetails?: {
    mainImage: string
    domeImage: string
    panoramaImage: string
  }
  parameters?: any
  error?: string
}

export default function FlowArtGenerator() {
  // Core params
  const [dataset, setDataset] = useState("vietnamese")
  const [scenario, setScenario] = useState("temple-of-literature")
  const [colorScheme, setColorScheme] = useState("metallic")

  const [seed, setSeed] = useState(1234)
  const [numSamples, setNumSamples] = useState(3000)
  const [noiseScale, setNoiseScale] = useState(0.1)
  const [timeStep, setTimeStep] = useState(0.01)

  // Prompt editing
  const [promptPreview, setPromptPreview] = useState("")
  const [editEnabled, setEditEnabled] = useState(false)
  const [editedPrompt, setEditedPrompt] = useState("")

  // Dome settings
  const [domeProjection, setDomeProjection] = useState(true)
  const [domeDiameter, setDomeDiameter] = useState(20)
  const [domeResolution, setDomeResolution] = useState("4K")
  const [projectionType, setProjectionType] = useState("fisheye")

  // 360 panorama settings
  const [panoramic360, setPanoramic360] = useState(true)
  const [panoramaResolution, setPanoramaResolution] = useState("8K")
  const [panoramaFormat, setPanoramaFormat] = useState<"equirectangular" | "stereographic" | "cubemap" | "cylindrical">(
    "equirectangular",
  )
  const [stereographicPerspective, setStereographicPerspective] = useState<"little-planet" | "tunnel" | "fisheye">(
    "little-planet",
  )

  // UI state
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [activeTab, setActiveTab] = useState<"regular" | "dome" | "panorama">("regular")
  const [error, setError] = useState<string | null>(null)
  const [showExamples, setShowExamples] = useState(false)

  // Results
  const [image, setImage] = useState<string | null>(null)
  const [domeImage, setDomeImage] = useState<string | null>(null)
  const [panoramaImage, setPanoramaImage] = useState<string | null>(null)

  const datasetOptions = [
    { value: "vietnamese", label: "Vietnamese Heritage" },
    { value: "indonesian", label: "Indonesian Heritage" },
    { value: "thailand", label: "Thailand" },
    { value: "spirals", label: "Spirals" },
    { value: "fractal", label: "Fractal" },
    { value: "mandelbrot", label: "Mandelbrot" },
    { value: "julia", label: "Julia" },
    { value: "lorenz", label: "Lorenz" },
    { value: "hyperbolic", label: "Hyperbolic" },
    { value: "gaussian", label: "Gaussian" },
    { value: "cellular", label: "Cellular" },
    { value: "voronoi", label: "Voronoi" },
    { value: "perlin", label: "Perlin" },
    { value: "diffusion", label: "Reaction-Diffusion" },
    { value: "wave", label: "Wave" },
    { value: "escher", label: "Escher" },
    { value: "8bit", label: "8bit" },
    { value: "bosch", label: "Bosch" },
  ]

  const vietnameseScenarios = [
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

  const indonesianScenarios = [
    { value: "pure", label: "Pure Mathematical" },
    { value: "garuda", label: "Garuda Wisnu Kencana" },
    { value: "wayang", label: "Wayang Kulit" },
    { value: "batik", label: "Batik Patterns" },
    { value: "borobudur", label: "Borobudur Temple" },
    { value: "javanese", label: "Javanese Culture" },
    { value: "sundanese", label: "Sundanese Heritage" },
    { value: "batak", label: "Batak Traditions" },
    { value: "dayak", label: "Dayak Culture" },
    { value: "acehnese", label: "Acehnese Heritage" },
    { value: "minangkabau", label: "Minangkabau Culture" },
    { value: "balinese-tribe", label: "Balinese Traditions" },
    { value: "papuans", label: "Papuan Heritage" },
    { value: "baduy", label: "Baduy Tribe" },
    { value: "orang-rimba", label: "Orang Rimba" },
    { value: "hongana-manyawa", label: "Hongana Manyawa" },
    { value: "asmat", label: "Asmat Art" },
    { value: "komodo", label: "Dragon Legends" },
    { value: "dance", label: "Traditional Dance" },
    { value: "volcanoes", label: "Volcanic Landscapes" },
    { value: "temples", label: "Sacred Temples" },
  ]

  const thailandScenarios = [
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

  // Get current scenarios based on dataset
  const getCurrentScenarios = () => {
    if (dataset === "vietnamese") return vietnameseScenarios
    if (dataset === "indonesian") return indonesianScenarios
    if (dataset === "thailand") return thailandScenarios
    return [{ value: "cosmic", label: "Cosmic" }]
  }

  // Ensure stereographic default when format is stereographic
  useEffect(() => {
    if (panoramaFormat === "stereographic" && !stereographicPerspective) {
      setStereographicPerspective("little-planet")
    }
  }, [panoramaFormat, stereographicPerspective])

  // Keep scenario valid for current dataset
  useEffect(() => {
    const currentScenarios = getCurrentScenarios()
    const isValid = currentScenarios.some((s) => s.value === scenario)
    if (!isValid) {
      setScenario(currentScenarios[0]?.value || "pure")
    }
  }, [dataset, scenario])

  const refreshPrompt = useCallback(async () => {
    try {
      const res = await fetch("/api/preview-ai-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataset,
          scenario:
            dataset === "indonesian" || dataset === "thailand" || dataset === "vietnamese" ? scenario : undefined,
          colorScheme,
          customPrompt: editEnabled && editedPrompt.trim() ? editedPrompt.trim() : undefined,
        }),
      })
      const data = await res.json()
      if (data?.prompt) {
        setPromptPreview(data.prompt)
        if (!editEnabled) setEditedPrompt(data.prompt)
      }
    } catch {
      // no-op
    }
  }, [dataset, scenario, colorScheme, editEnabled, editedPrompt])

  // Keep preview in sync when parameters change (lightweight)
  useEffect(() => {
    refreshPrompt()
  }, [dataset, scenario, colorScheme, editEnabled, refreshPrompt])

  // Randomizers
  const randomizeSeed = useCallback(() => {
    setSeed(Math.floor(Math.random() * 10000))
  }, [])
  const randomizeNoise = useCallback(() => {
    setNoiseScale(Number((Math.random() * 0.4 + 0.01).toFixed(2)))
  }, [])
  const randomizeTimeStep = useCallback(() => {
    setTimeStep(Number((Math.random() * 0.15 + 0.005).toFixed(3)))
  }, [])
  const randomizeAll = useCallback(() => {
    randomizeSeed()
    randomizeNoise()
    randomizeTimeStep()
  }, [randomizeSeed, randomizeNoise, randomizeTimeStep])

  const generate = useCallback(async () => {
    setIsGenerating(true)
    setProgress(10)
    setError(null)

    try {
      const res = await fetch("/api/generate-ai-art", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataset,
          scenario:
            dataset === "indonesian" || dataset === "thailand" || dataset === "vietnamese" ? scenario : undefined,
          colorScheme,
          seed,
          numSamples,
          noise: noiseScale,
          timeStep,
          customPrompt: editEnabled && editedPrompt.trim() ? editedPrompt.trim() : undefined,
          domeDiameter: domeProjection ? domeDiameter : undefined,
          domeResolution: domeResolution ? domeResolution : undefined,
          projectionType: domeProjection ? projectionType : undefined,
          panoramaResolution: panoramic360 ? panoramaResolution : undefined,
          panoramaFormat,
          stereographicPerspective:
            panoramic360 && panoramaFormat === "stereographic" ? stereographicPerspective : undefined,
        }),
      })

      setProgress(60)

      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || `Request failed with ${res.status}`)
      }
      const data: GeneratedArtResponse = await res.json()
      if (!data.success) throw new Error(data.error || "Generation failed")

      setImage(data.image)
      setDomeImage(data.domeImage || null)
      setPanoramaImage(data.panoramaImage || null)
      setActiveTab("regular")
      setProgress(100)
      toast({
        title: "Professional Art Generated",
        description: `${data.quality || "HD"} quality images ready for download.`,
      })
    } catch (e: any) {
      console.error(e)
      setError(e?.message || "Failed to generate")
      toast({
        title: "Generation failed",
        description: e?.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
      setTimeout(() => setProgress(0), 600)
    }
  }, [
    dataset,
    scenario,
    colorScheme,
    seed,
    numSamples,
    noiseScale,
    timeStep,
    editEnabled,
    editedPrompt,
    domeProjection,
    domeDiameter,
    domeResolution,
    projectionType,
    panoramic360,
    panoramaResolution,
    panoramaFormat,
    stereographicPerspective,
  ])

  const download = useCallback(async (url: string | null, filename: string) => {
    if (!url) return
    try {
      const r = await fetch(url, { mode: "cors", credentials: "omit" })
      const blob = await r.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = blobUrl
      a.download = filename
      a.click()
      setTimeout(() => URL.revokeObjectURL(blobUrl), 500)
      toast({
        title: "Download started",
        description: filename,
      })
    } catch {
      const a = document.createElement("a")
      a.href = `/api/download-proxy?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`
      a.download = filename
      a.click()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              FlowSketch Professional Art Generator
            </h1>
          </div>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Generate professional-grade mathematical visualizations and AI-powered artwork with seamless 360° panoramic
            wrapping and dome projections.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Settings className="h-5 w-5" />
                Professional Settings
              </CardTitle>
              <CardDescription className="text-slate-400">
                Configure parameters for professional-grade output
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dataset */}
              <div className="space-y-2">
                <Label className="text-slate-300">Dataset</Label>
                <Select value={dataset} onValueChange={setDataset}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600 max-h-72">
                    {datasetOptions.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Scenario (for Vietnamese, Indonesian and Thailand datasets) */}
              {dataset === "vietnamese" || dataset === "indonesian" || dataset === "thailand" ? (
                <div className="space-y-2">
                  <Label className="text-slate-300">Cultural Scenario</Label>
                  <Select value={scenario} onValueChange={setScenario}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                      <SelectValue placeholder="Select a scenario" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600 max-h-72">
                      {getCurrentScenarios().map((sc) => (
                        <SelectItem key={sc.value} value={sc.value}>
                          {sc.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-400">
                    {dataset === "vietnamese"
                      ? "Professional-grade detailed scenarios for Vietnamese heritage, temples, and cultural traditions."
                      : dataset === "indonesian"
                        ? "Authentic scenarios for Indonesian cultural heritage with professional quality."
                        : "Professional Thai cultural scenarios with authentic traditional elements."}
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label className="text-slate-300">Cultural Scenario</Label>
                  <p className="text-xs text-slate-400">
                    Cultural scenarios are available for Vietnamese Heritage, Indonesian Heritage and Thailand datasets.
                    Choose one to enable detailed professional cultural scenarios.
                  </p>
                </div>
              )}

              {/* Color Scheme */}
              <div className="space-y-2">
                <Label className="text-slate-300">Professional Color Palette</Label>
                <Select value={colorScheme} onValueChange={setColorScheme}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600 max-h-72">
                    {[
                      "plasma",
                      "quantum",
                      "cosmic",
                      "thermal",
                      "spectral",
                      "crystalline",
                      "bioluminescent",
                      "aurora",
                      "metallic",
                      "prismatic",
                      "monochromatic",
                      "infrared",
                      "lava",
                      "futuristic",
                      "forest",
                      "ocean",
                      "sunset",
                      "arctic",
                      "neon",
                      "vintage",
                      "toxic",
                      "ember",
                      "lunar",
                      "tidal",
                    ].map((c) => (
                      <SelectItem key={c} value={c}>
                        {c[0].toUpperCase() + c.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Params */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-slate-300">Seed</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={seed}
                      onChange={(e) => setSeed(Number.parseInt(e.target.value || "0", 10))}
                      className="bg-slate-700 border-slate-600 text-slate-100"
                    />
                    <Button variant="outline" onClick={randomizeSeed} className="border-slate-600 bg-transparent">
                      <Dice6 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300">Samples</Label>
                  <Input
                    type="number"
                    value={numSamples}
                    onChange={(e) => setNumSamples(Number.parseInt(e.target.value || "1000", 10))}
                    className="bg-slate-700 border-slate-600 text-slate-100"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300">Noise Scale</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={noiseScale}
                      onChange={(e) => setNoiseScale(Number.parseFloat(e.target.value || "0.1"))}
                      className="bg-slate-700 border-slate-600 text-slate-100"
                    />
                    <Button variant="outline" onClick={randomizeNoise} className="border-slate-600 bg-transparent">
                      <Dice6 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300">Time Step</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.001"
                      value={timeStep}
                      onChange={(e) => setTimeStep(Number.parseFloat(e.target.value || "0.01"))}
                      className="bg-slate-700 border-slate-600 text-slate-100"
                    />
                    <Button variant="outline" onClick={randomizeTimeStep} className="border-slate-600 bg-transparent">
                      <Dice6 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* 360° Professional Panorama */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch checked={panoramic360} onCheckedChange={setPanoramic360} />
                    <Label className="text-slate-300 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Professional 360° Panorama
                    </Label>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowExamples(!showExamples)}
                    className={`text-slate-400 hover:text-slate-300 ${showExamples ? "bg-slate-700" : ""}`}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Examples
                  </Button>
                </div>

                {showExamples && (
                  <div className="space-y-3 p-4 bg-slate-900 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="h-4 w-4 text-purple-400" />
                      <p className="text-sm font-medium text-slate-300">Professional Seamless Wrapping</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <div className="relative">
                          <img
                            src="/360-test-pattern.jpg"
                            alt="360° Test Pattern"
                            className="w-full h-20 object-cover rounded border border-slate-600"
                          />
                          <Badge className="absolute top-1 left-1 bg-blue-600 text-xs">Seamless Pattern</Badge>
                        </div>
                        <p className="text-xs text-slate-400">
                          <strong>Professional Equirectangular:</strong> Notice how the pattern wraps seamlessly from
                          right edge to left edge.{" "}
                          <span className="text-green-400 font-semibold">
                            No visible seams when wrapped around a sphere.
                          </span>
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="relative">
                          <img
                            src="/360-aqueduct-example.jpg"
                            alt="360° Aqueduct Panorama"
                            className="w-full h-20 object-cover rounded border border-slate-600"
                          />
                          <Badge className="absolute top-1 left-1 bg-green-600 text-xs">VR Ready</Badge>
                        </div>
                        <p className="text-xs text-slate-400">
                          <strong>Professional VR Panorama:</strong> Seamless horizontal wrapping with proper
                          equirectangular distortion. Content flows continuously across the wrap point.
                        </p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-700">
                      <div className="flex items-start gap-2">
                        <Zap className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-slate-500">
                          <strong className="text-purple-400">Professional Mode:</strong> Our advanced prompting ensures{" "}
                          <span className="font-mono bg-slate-800 px-1 rounded">seamless horizontal wrapping</span> with
                          no visible seams when edges connect in VR viewers.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {panoramic360 && (
                  <div className="space-y-2 pl-6">
                    <div className="grid grid-cols-2 gap-3">
                      <Select value={panoramaResolution} onValueChange={setPanoramaResolution}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="4K">4K Professional</SelectItem>
                          <SelectItem value="8K">8K Ultra</SelectItem>
                          <SelectItem value="16K">16K Cinema</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={panoramaFormat} onValueChange={(v: any) => setPanoramaFormat(v)}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="equirectangular">
                            Equirectangular <span className="text-green-400">(Seamless)</span>
                          </SelectItem>
                          <SelectItem value="stereographic">Stereographic</SelectItem>
                          <SelectItem value="cubemap">Cubemap</SelectItem>
                          <SelectItem value="cylindrical">Cylindrical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {panoramaFormat === "equirectangular" && (
                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded text-xs text-green-300">
                        <div className="flex items-center gap-1 mb-1">
                          <Zap className="h-3 w-3" />
                          <span className="font-semibold">Professional Seamless Wrapping</span>
                        </div>
                        Advanced prompting ensures perfect horizontal continuity. Left and right edges connect
                        seamlessly for professional VR applications. Output: 1792×1024 (1.75:1 - closest to ideal 2:1
                        with DALL-E 3).
                      </div>
                    )}

                    {panoramaFormat === "stereographic" && (
                      <div className="grid grid-cols-1">
                        <Label className="text-slate-300">Stereographic Style</Label>
                        <Select
                          value={stereographicPerspective}
                          onValueChange={(v: any) => setStereographicPerspective(v)}
                        >
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            <SelectItem value="little-planet">Little Planet</SelectItem>
                            <SelectItem value="tunnel">Tunnel Effect</SelectItem>
                            <SelectItem value="fisheye">Fisheye</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Professional Dome Projection */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Switch checked={domeProjection} onCheckedChange={setDomeProjection} />
                  <Label className="text-slate-300 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Professional Dome Projection
                  </Label>
                </div>
                {domeProjection && (
                  <div className="grid grid-cols-2 gap-3 pl-6">
                    <Input
                      type="number"
                      value={domeDiameter}
                      onChange={(e) => setDomeDiameter(Number.parseInt(e.target.value || "20", 10))}
                      className="bg-slate-700 border-slate-600 text-slate-100"
                      placeholder="Diameter (m)"
                    />
                    <Select value={domeResolution} onValueChange={setDomeResolution}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="2K">2K Standard</SelectItem>
                        <SelectItem value="4K">4K Professional</SelectItem>
                        <SelectItem value="8K">8K Cinema</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="col-span-2">
                      <Select value={projectionType} onValueChange={setProjectionType}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="fisheye">Fisheye Professional</SelectItem>
                          <SelectItem value="equidistant">Equidistant</SelectItem>
                          <SelectItem value="stereographic">Stereographic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              {/* Professional Prompt Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300 flex items-center gap-2">
                    <Pencil className="h-4 w-4" />
                    Professional Prompt
                  </Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-slate-600 bg-transparent"
                      onClick={refreshPrompt}
                    >
                      Refresh
                    </Button>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="enable-edit"
                        checked={editEnabled}
                        onCheckedChange={(v) => {
                          setEditEnabled(v)
                          if (v && !editedPrompt) {
                            setEditedPrompt(promptPreview)
                          }
                        }}
                      />
                      <Label htmlFor="enable-edit" className="text-slate-300">
                        Edit
                      </Label>
                    </div>
                  </div>
                </div>
                <Textarea
                  value={editEnabled ? editedPrompt : promptPreview}
                  onChange={(e) => (editEnabled ? setEditedPrompt(e.target.value) : undefined)}
                  className="bg-slate-700 border-slate-600 text-slate-100 min-h-[120px]"
                  placeholder="Professional prompt preview will appear here..."
                  readOnly={!editEnabled}
                />
                <p className="text-xs text-slate-400">
                  Professional-grade prompt with seamless wrapping instructions. Toggle "Edit" to customize before
                  generating.
                </p>
              </div>

              {/* Generate Professional */}
              <Button
                onClick={generate}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Professional Art...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Professional Art
                  </>
                )}
              </Button>

              {isGenerating && (
                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  <p className="text-xs text-slate-400 text-center">
                    {progress}% complete - Professional quality generation
                  </p>
                </div>
              )}

              {error && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500 rounded p-2">{error}</div>
              )}
            </CardContent>
          </Card>

          {/* Professional Preview */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-100">
                  <ImageIcon className="h-5 w-5" />
                  Professional Preview
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Professional-grade output with seamless wrapping and dome projections
                </CardDescription>
              </CardHeader>
              <CardContent>
                {image ? (
                  <div className="space-y-4">
                    <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
                      <TabsList className="grid w-full grid-cols-3 bg-slate-700">
                        <TabsTrigger value="regular" className="data-[state=active]:bg-purple-600">
                          Professional
                        </TabsTrigger>
                        <TabsTrigger
                          value="dome"
                          disabled={!domeImage}
                          className="data-[state=active]:bg-purple-600 disabled:opacity-50"
                        >
                          <Mountain className="h-4 w-4 mr-2" />
                          Dome Pro
                        </TabsTrigger>
                        <TabsTrigger
                          value="panorama"
                          disabled={!panoramaImage}
                          className="data-[state=active]:bg-purple-600 disabled:opacity-50"
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          360° Pro
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="regular" className="mt-4">
                        <div className="aspect-square bg-slate-900 rounded-lg overflow-hidden">
                          <img
                            src={image || "/placeholder.svg"}
                            alt="Professional"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="mt-2 text-center">
                          <Badge variant="outline" className="border-slate-600 text-slate-300">
                            Professional HD Quality
                          </Badge>
                        </div>
                      </TabsContent>

                      <TabsContent value="dome" className="mt-4">
                        {domeImage && (
                          <>
                            <div className="aspect-square bg-slate-900 rounded-lg overflow-hidden">
                              <img
                                src={domeImage || "/placeholder.svg"}
                                alt="Professional Dome"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="mt-2 text-center">
                              <Badge variant="outline" className="border-slate-600 text-slate-300">
                                Professional Dome Projection
                              </Badge>
                            </div>
                          </>
                        )}
                      </TabsContent>

                      <TabsContent value="panorama" className="mt-4">
                        {panoramaImage && (
                          <>
                            {panoramaFormat === "equirectangular" ? (
                              <div className="w-full">
                                <AspectRatio ratio={1.75} className="bg-slate-900 rounded-lg overflow-hidden">
                                  <img
                                    src={panoramaImage || "/placeholder.svg"}
                                    alt="Professional 360° Seamless Panorama"
                                    className="w-full h-full object-cover"
                                    style={{
                                      objectFit: "cover",
                                      objectPosition: "center",
                                    }}
                                  />
                                </AspectRatio>
                              </div>
                            ) : (
                              <div className="aspect-square bg-slate-900 rounded-lg overflow-hidden">
                                <img
                                  src={panoramaImage || "/placeholder.svg"}
                                  alt={`Professional 360° ${panoramaFormat}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="mt-2 text-center space-y-1">
                              <Badge variant="outline" className="border-slate-600 text-slate-300">
                                Professional 360° Panorama{" "}
                                {panoramaFormat === "stereographic"
                                  ? `• ${stereographicPerspective}`
                                  : panoramaFormat === "equirectangular"
                                    ? "• Seamless Wrapping"
                                    : ""}
                              </Badge>
                            </div>
                          </>
                        )}
                      </TabsContent>
                    </Tabs>

                    <Separator className="bg-slate-700" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Button
                        onClick={() => download(image, `flowsketch-professional-${Date.now()}.png`)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Professional
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => download(domeImage, `flowsketch-dome-pro-${Date.now()}.png`)}
                        disabled={!domeImage}
                        className="border-slate-600"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Dome Pro
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => download(panoramaImage, `flowsketch-360-pro-${Date.now()}.png`)}
                        disabled={!panoramaImage}
                        className="border-slate-600"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        360° Pro
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-square bg-slate-900 rounded-lg flex items-center justify-center">
                    <div className="text-center text-slate-400">
                      <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>Professional artwork will appear here</p>
                      <p className="text-xs mt-2">HD quality with seamless wrapping</p>
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
