"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { toast } from "@/hooks/use-toast"
import { Building, Globe, Settings, Zap, Eye, Download, Loader2, RotateCcw } from "lucide-react"

export default function Dome360Planner() {
  // Core settings
  const [dataset, setDataset] = useState("vietnamese")
  const [scenario, setScenario] = useState("temple-of-literature")
  const [colorScheme, setColorScheme] = useState("cosmic")

  // Dome settings
  const [domeDiameter, setDomeDiameter] = useState(20)
  const [domeHeight, setDomeHeight] = useState(12)
  const [domeTilt, setDomeTilt] = useState([45])
  const [projectionType, setProjectionType] = useState("fisheye")
  const [domeResolution, setDomeResolution] = useState("4K")

  // 360° settings
  const [panoramaFormat, setPanoramaFormat] = useState<"equirectangular" | "stereographic" | "cubemap">(
    "equirectangular",
  )
  const [panoramaResolution, setPanoramaResolution] = useState("8K")
  const [fieldOfView, setFieldOfView] = useState([360])
  const [verticalFOV, setVerticalFOV] = useState([180])

  // Preview
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeView, setActiveView] = useState<"dome" | "360">("dome")

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
    { value: "halong-bay", label: "🏔️ Ha Long Bay - Limestone Karsts" },
    { value: "sapa-terraces", label: "🌾 Sapa Rice Terraces - Mountain Agriculture" },
    { value: "mekong-delta", label: "🌊 Mekong Delta - River Life" },
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

  const generatePreview = useCallback(async () => {
    setIsGenerating(true)
    try {
      const res = await fetch("/api/generate-ai-art", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataset,
          scenario:
            dataset === "vietnamese" || dataset === "indonesian" || dataset === "thailand" ? scenario : undefined,
          colorScheme,
          domeProjection: activeView === "dome",
          domeDiameter,
          domeResolution,
          projectionType,
          panoramic360: activeView === "360",
          panoramaResolution,
          panoramaFormat,
        }),
      })

      if (!res.ok) throw new Error("Generation failed")

      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      setPreviewImage(activeView === "dome" ? data.domeImage : data.panoramaImage)
      toast({
        title: "Preview Generated",
        description: `${activeView === "dome" ? "Dome" : "360°"} preview ready`,
      })
    } catch (error: any) {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }, [
    dataset,
    scenario,
    colorScheme,
    activeView,
    domeDiameter,
    domeResolution,
    projectionType,
    panoramaResolution,
    panoramaFormat,
  ])

  const resetSettings = useCallback(() => {
    setDomeDiameter(20)
    setDomeHeight(12)
    setDomeTilt([45])
    setFieldOfView([360])
    setVerticalFOV([180])
    setPanoramaFormat("equirectangular")
    toast({
      title: "Settings Reset",
      description: "All parameters reset to defaults",
    })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <Building className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Professional Dome & 360° Planner
            </h1>
          </div>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Specialized planning tool for dome projections and 360° panoramic experiences with professional-grade
            output.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Settings className="h-5 w-5" />
                Professional Configuration
              </CardTitle>
              <CardDescription className="text-slate-400">Configure dome and 360° parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* View Type */}
              <div className="space-y-2">
                <Label className="text-slate-300">Output Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={activeView === "dome" ? "default" : "outline"}
                    onClick={() => setActiveView("dome")}
                    className="flex items-center gap-2"
                  >
                    <Building className="h-4 w-4" />
                    Dome
                  </Button>
                  <Button
                    variant={activeView === "360" ? "default" : "outline"}
                    onClick={() => setActiveView("360")}
                    className="flex items-center gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    360°
                  </Button>
                </div>
              </div>

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

              {/* Scenario */}
              {(dataset === "vietnamese" || dataset === "indonesian" || dataset === "thailand") && (
                <div className="space-y-2">
                  <Label className="text-slate-300">Cultural Scenario</Label>
                  <Select value={scenario} onValueChange={setScenario}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600 max-h-72">
                      {getCurrentScenarios().map((sc) => (
                        <SelectItem key={sc.value} value={sc.value}>
                          {sc.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Color Scheme */}
              <div className="space-y-2">
                <Label className="text-slate-300">Color Palette</Label>
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

              <Separator className="bg-slate-700" />

              {/* Dome Settings */}
              {activeView === "dome" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-blue-400" />
                    <Label className="text-slate-300 font-medium">Dome Configuration</Label>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-slate-300 text-sm">Diameter (m)</Label>
                      <Input
                        type="number"
                        value={domeDiameter}
                        onChange={(e) => setDomeDiameter(Number(e.target.value))}
                        className="bg-slate-700 border-slate-600 text-slate-100"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-300 text-sm">Height (m)</Label>
                      <Input
                        type="number"
                        value={domeHeight}
                        onChange={(e) => setDomeHeight(Number(e.target.value))}
                        className="bg-slate-700 border-slate-600 text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-sm">Dome Tilt: {domeTilt[0]}°</Label>
                    <Slider value={domeTilt} onValueChange={setDomeTilt} max={90} min={0} step={5} className="w-full" />
                  </div>

                  <div className="grid grid-cols-1 gap-3">
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
                  </div>
                </div>
              )}

              {/* 360° Settings */}
              {activeView === "360" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-green-400" />
                    <Label className="text-slate-300 font-medium">360° Configuration</Label>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-sm">Horizontal FOV: {fieldOfView[0]}°</Label>
                    <Slider
                      value={fieldOfView}
                      onValueChange={setFieldOfView}
                      max={360}
                      min={180}
                      step={30}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-sm">Vertical FOV: {verticalFOV[0]}°</Label>
                    <Slider
                      value={verticalFOV}
                      onValueChange={setVerticalFOV}
                      max={180}
                      min={90}
                      step={15}
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3">
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
                      </SelectContent>
                    </Select>
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
                  </div>

                  {panoramaFormat === "equirectangular" && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded text-xs text-green-300">
                      <div className="flex items-center gap-1 mb-1">
                        <Zap className="h-3 w-3" />
                        <span className="font-semibold">Professional Seamless Wrapping</span>
                      </div>
                      Advanced prompting ensures perfect horizontal continuity. Left and right edges connect seamlessly
                      for professional VR applications.
                    </div>
                  )}
                </div>
              )}

              <Separator className="bg-slate-700" />

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  onClick={generatePreview}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating {activeView === "dome" ? "Dome" : "360°"}...
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Generate {activeView === "dome" ? "Dome" : "360°"} Preview
                    </>
                  )}
                </Button>

                <Button variant="outline" onClick={resetSettings} className="w-full border-slate-600 bg-transparent">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-100">
                  {activeView === "dome" ? <Building className="h-5 w-5" /> : <Globe className="h-5 w-5" />}
                  {activeView === "dome" ? "Dome Projection Preview" : "360° Panorama Preview"}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Professional {activeView === "dome" ? "dome projection" : "360° panoramic"} visualization
                </CardDescription>
              </CardHeader>
              <CardContent>
                {previewImage ? (
                  <div className="space-y-4">
                    {activeView === "360" && panoramaFormat === "equirectangular" ? (
                      <div className="w-full">
                        <AspectRatio ratio={1.75} className="bg-slate-900 rounded-lg overflow-hidden">
                          <img
                            src={previewImage || "/placeholder.svg"}
                            alt="Professional 360° Seamless Panorama"
                            className="w-full h-full object-contain"
                            style={{
                              backgroundColor: "#1e293b",
                            }}
                          />
                        </AspectRatio>
                        <div className="mt-2 text-center">
                          <Badge variant="outline" className="border-slate-600 text-slate-300">
                            Professional 1.75:1 Equirectangular • Seamless Wrapping
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-square bg-slate-900 rounded-lg overflow-hidden">
                        <img
                          src={previewImage || "/placeholder.svg"}
                          alt={`Professional ${activeView === "dome" ? "Dome" : "360°"}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-2">
                      <Button
                        onClick={() => {
                          const a = document.createElement("a")
                          a.href = previewImage
                          a.download = `flowsketch-${activeView}-professional-${Date.now()}.png`
                          a.click()
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download {activeView === "dome" ? "Dome" : "360°"} Professional
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-square bg-slate-900 rounded-lg flex items-center justify-center">
                    <div className="text-center text-slate-400">
                      {activeView === "dome" ? (
                        <Building className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      ) : (
                        <Globe className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      )}
                      <p>Professional {activeView === "dome" ? "dome projection" : "360° panorama"} will appear here</p>
                      <p className="text-xs mt-2">Configure settings and generate preview</p>
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

// Named export for compatibility
export { Dome360Planner }
