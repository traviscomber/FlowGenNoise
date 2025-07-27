"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import {
  Download,
  Sparkles,
  Settings,
  ImageIcon,
  Loader2,
  RefreshCw,
  Globe,
  Square,
  AlertCircle,
  CheckCircle,
  Copy,
  ExternalLink,
} from "lucide-react"

// Mathematical datasets with enhanced descriptions
const MATHEMATICAL_DATASETS = {
  spirals: {
    name: "Fibonacci Spirals",
    description: "Golden ratio spiral patterns with φ = 1.618",
    icon: "🌀",
    complexity: "Medium",
    category: "Natural",
  },
  fractal: {
    name: "Fractal Trees",
    description: "Recursive branching structures",
    icon: "🌳",
    complexity: "High",
    category: "Recursive",
  },
  mandelbrot: {
    name: "Mandelbrot Set",
    description: "Classic fractal visualization",
    icon: "🔮",
    complexity: "High",
    category: "Complex",
  },
  julia: {
    name: "Julia Sets",
    description: "Complex plane transformations",
    icon: "💫",
    complexity: "High",
    category: "Complex",
  },
  lorenz: {
    name: "Lorenz Attractor",
    description: "Chaotic system dynamics",
    icon: "🦋",
    complexity: "Medium",
    category: "Chaos",
  },
  hyperbolic: {
    name: "Hyperbolic Geometry",
    description: "Non-Euclidean patterns",
    icon: "🌐",
    complexity: "High",
    category: "Geometric",
  },
  gaussian: {
    name: "Gaussian Fields",
    description: "Statistical distributions",
    icon: "📊",
    complexity: "Medium",
    category: "Statistical",
  },
  cellular: {
    name: "Cellular Automata",
    description: "Emergent grid patterns",
    icon: "🔲",
    complexity: "Medium",
    category: "Emergent",
  },
  voronoi: {
    name: "Voronoi Diagrams",
    description: "Natural tessellations",
    icon: "🔷",
    complexity: "Low",
    category: "Geometric",
  },
  perlin: {
    name: "Perlin Noise",
    description: "Organic texture patterns",
    icon: "🌊",
    complexity: "Low",
    category: "Procedural",
  },
  diffusion: {
    name: "Reaction-Diffusion",
    description: "Turing patterns",
    icon: "🧬",
    complexity: "High",
    category: "Biological",
  },
  wave: {
    name: "Wave Interference",
    description: "Harmonic superposition",
    icon: "〰️",
    complexity: "Medium",
    category: "Physics",
  },
  neural: {
    name: "Neural Networks",
    description: "Interconnected node patterns",
    icon: "🧠",
    complexity: "High",
    category: "AI",
  },
  quantum: {
    name: "Quantum Fields",
    description: "Probability wave functions",
    icon: "⚛️",
    complexity: "High",
    category: "Physics",
  },
  crystalline: {
    name: "Crystal Lattices",
    description: "Atomic structure symmetries",
    icon: "💎",
    complexity: "Medium",
    category: "Material",
  },
  plasma: {
    name: "Plasma Dynamics",
    description: "Electromagnetic field dynamics",
    icon: "⚡",
    complexity: "High",
    category: "Physics",
  },
}

// Artistic scenarios
const SCENARIOS = {
  pure: { name: "Pure Abstract", description: "Clean mathematical precision", icon: "🔬" },
  cosmic: { name: "Cosmic", description: "Space phenomena and stellar formations", icon: "🌌" },
  microscopic: { name: "Microscopic", description: "Cellular and molecular worlds", icon: "🔬" },
  crystalline: { name: "Crystalline", description: "Crystal and mineral formations", icon: "💎" },
  organic: { name: "Organic", description: "Biological and natural forms", icon: "🌿" },
  atmospheric: { name: "Atmospheric", description: "Weather and cloud formations", icon: "☁️" },
  quantum: { name: "Quantum", description: "Subatomic particle interactions", icon: "⚛️" },
  neural: { name: "Neural", description: "Brain synapses and neural networks", icon: "🧠" },
  electromagnetic: { name: "Electromagnetic", description: "Field visualizations and wave propagation", icon: "📡" },
  fluid: { name: "Fluid Dynamics", description: "Flow patterns and turbulence", icon: "🌊" },
  botanical: { name: "Botanical", description: "Plant growth and organic forms", icon: "🌱" },
  geological: { name: "Geological", description: "Rock formations and mineral structures", icon: "🏔️" },
  architectural: { name: "Architectural", description: "Geometric building structures", icon: "🏗️" },
  textile: { name: "Textile", description: "Fabric weaving and textile patterns", icon: "🧵" },
}

// Color schemes
const COLOR_SCHEMES = {
  plasma: { name: "Plasma", description: "Electric purple and blue energy", colors: ["#8B5CF6", "#3B82F6"] },
  quantum: { name: "Quantum", description: "Glowing green and blue fields", colors: ["#10B981", "#3B82F6"] },
  cosmic: { name: "Cosmic", description: "Deep purple and blue space", colors: ["#6366F1", "#1E1B4B"] },
  thermal: { name: "Thermal", description: "Red, orange, and yellow heat", colors: ["#EF4444", "#F59E0B"] },
  spectral: { name: "Spectral", description: "Full rainbow spectrum", colors: ["#EF4444", "#8B5CF6"] },
  crystalline: { name: "Crystalline", description: "Blue, white, and silver ice", colors: ["#3B82F6", "#F8FAFC"] },
  bioluminescent: {
    name: "Bioluminescent",
    description: "Aquatic blue and green glow",
    colors: ["#06B6D4", "#10B981"],
  },
  aurora: { name: "Aurora", description: "Dancing green and purple lights", colors: ["#10B981", "#8B5CF6"] },
  metallic: { name: "Metallic", description: "Gold, silver, and bronze", colors: ["#F59E0B", "#6B7280"] },
  prismatic: { name: "Prismatic", description: "Rainbow light refraction", colors: ["#EF4444", "#8B5CF6"] },
  monochromatic: { name: "Monochromatic", description: "Elegant grayscale", colors: ["#374151", "#F9FAFB"] },
  infrared: { name: "Infrared", description: "Heat signature red", colors: ["#DC2626", "#FCA5A5"] },
  neon: { name: "Neon", description: "Bright fluorescent colors", colors: ["#10B981", "#F59E0B"] },
  sunset: { name: "Sunset", description: "Warm orange and pink sky", colors: ["#F97316", "#EC4899"] },
  ocean: { name: "Ocean", description: "Deep blue and teal depths", colors: ["#0EA5E9", "#0D9488"] },
  forest: { name: "Forest", description: "Green and earth tones", colors: ["#059669", "#92400E"] },
  volcanic: { name: "Volcanic", description: "Molten lava colors", colors: ["#DC2626", "#F59E0B"] },
  arctic: { name: "Arctic", description: "Cool blue and white ice", colors: ["#0EA5E9", "#F8FAFC"] },
}

// Projection types
const PROJECTION_TYPES = {
  "little-planet": {
    name: "Little Planet",
    description: "Spherical world projection with curved horizon",
    icon: Globe,
    technical: "Stereographic projection mapping infinite plane to finite sphere",
  },
  "tunnel-view": {
    name: "Tunnel View",
    description: "Inverted perspective with infinite depth",
    icon: Square,
    technical: "Inverse stereographic projection creating tunnel effect",
  },
}

interface GenerationResult {
  success: boolean
  image?: string
  error?: string
  provider?: string
  model?: string
  attempts?: number
  originalPrompt?: string
  finalPrompt?: string
  revisedPrompt?: string
  promptLength?: number
  is4K?: boolean
  dimensions?: { width: number; height: number }
  estimatedFileSize?: string
  safetyLevel?: number
}

export default function FlowArtGenerator() {
  // State management
  const [dataset, setDataset] = useState("spirals")
  const [scenario, setScenario] = useState("pure")
  const [colorScheme, setColorScheme] = useState("plasma")
  const [projectionType, setProjectionType] = useState("little-planet")
  const [customPrompt, setCustomPrompt] = useState("")
  const [seed, setSeed] = useState(1234)
  const [resolution, setResolution] = useState("2160p")
  const [enable4K, setEnable4K] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null)
  const [activeTab, setActiveTab] = useState("dataset")

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Generation function
  const generateArt = useCallback(async () => {
    if (isGenerating) return

    setIsGenerating(true)
    setGenerationProgress(0)
    setGeneratedImage(null)
    setGenerationResult(null)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => Math.min(prev + Math.random() * 15, 85))
      }, 500)

      const response = await fetch("/api/generate-ai-art", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dataset,
          scenario,
          colorScheme,
          seed,
          customPrompt,
          projectionType,
          resolution,
          enable4K,
        }),
      })

      clearInterval(progressInterval)
      setGenerationProgress(100)

      const result: GenerationResult = await response.json()
      setGenerationResult(result)

      if (result.success && result.image) {
        setGeneratedImage(result.image)
        toast({
          title: "✨ Art Generated Successfully!",
          description: `Created with ${result.provider} ${result.model} in ${result.attempts} attempt(s)`,
        })
      } else {
        toast({
          title: "❌ Generation Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Generation error:", error)
      toast({
        title: "❌ Network Error",
        description: "Failed to connect to generation service",
        variant: "destructive",
      })
      setGenerationResult({
        success: false,
        error: "Network error - please check your connection",
      })
    } finally {
      setIsGenerating(false)
      setGenerationProgress(0)
    }
  }, [dataset, scenario, colorScheme, seed, customPrompt, projectionType, resolution, enable4K, isGenerating])

  // Download function
  const downloadImage = useCallback(async () => {
    if (!generatedImage) return

    try {
      const response = await fetch(generatedImage)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `flowsketch-${dataset}-${projectionType}-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast({
        title: "📥 Download Started",
        description: "Your artwork is being downloaded",
      })
    } catch (error) {
      toast({
        title: "❌ Download Failed",
        description: "Could not download the image",
        variant: "destructive",
      })
    }
  }, [generatedImage, dataset, projectionType])

  // Copy image URL
  const copyImageUrl = useCallback(() => {
    if (generatedImage) {
      navigator.clipboard.writeText(generatedImage)
      toast({
        title: "📋 URL Copied",
        description: "Image URL copied to clipboard",
      })
    }
  }, [generatedImage])

  // Random seed generator
  const generateRandomSeed = useCallback(() => {
    setSeed(Math.floor(Math.random() * 10000))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-4xl font-bold text-transparent">
            FlowSketch Art Generator
          </h1>
          <p className="text-lg text-slate-300">
            Transform mathematical concepts into stunning stereographic projections for dome installations
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Control Panel */}
          <div className="lg:col-span-1">
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-100">
                  <Settings className="h-5 w-5" />
                  Generation Controls
                </CardTitle>
                <CardDescription className="text-slate-400">Configure your mathematical art parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-slate-700">
                    <TabsTrigger value="dataset" className="text-xs">
                      Data
                    </TabsTrigger>
                    <TabsTrigger value="style" className="text-xs">
                      Style
                    </TabsTrigger>
                    <TabsTrigger value="projection" className="text-xs">
                      View
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="text-xs">
                      Pro
                    </TabsTrigger>
                  </TabsList>

                  {/* Dataset Tab */}
                  <TabsContent value="dataset" className="space-y-4">
                    <div>
                      <Label className="text-slate-200">Mathematical Dataset</Label>
                      <Select value={dataset} onValueChange={setDataset}>
                        <SelectTrigger className="border-slate-600 bg-slate-700 text-slate-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-slate-600 bg-slate-800">
                          {Object.entries(MATHEMATICAL_DATASETS).map(([key, data]) => (
                            <SelectItem key={key} value={key} className="text-slate-100">
                              <div className="flex items-center gap-2">
                                <span>{data.icon}</span>
                                <div>
                                  <div className="font-medium">{data.name}</div>
                                  <div className="text-xs text-slate-400">{data.description}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {dataset && (
                        <div className="mt-2 flex gap-2">
                          <Badge variant="outline" className="border-slate-600 text-slate-300">
                            {MATHEMATICAL_DATASETS[dataset as keyof typeof MATHEMATICAL_DATASETS].complexity}
                          </Badge>
                          <Badge variant="outline" className="border-slate-600 text-slate-300">
                            {MATHEMATICAL_DATASETS[dataset as keyof typeof MATHEMATICAL_DATASETS].category}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label className="text-slate-200">Custom Enhancement</Label>
                      <Textarea
                        placeholder="Add custom artistic direction or mathematical parameters..."
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        className="border-slate-600 bg-slate-700 text-slate-100 placeholder:text-slate-400"
                        rows={3}
                      />
                    </div>
                  </TabsContent>

                  {/* Style Tab */}
                  <TabsContent value="style" className="space-y-4">
                    <div>
                      <Label className="text-slate-200">Artistic Scenario</Label>
                      <Select value={scenario} onValueChange={setScenario}>
                        <SelectTrigger className="border-slate-600 bg-slate-700 text-slate-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-slate-600 bg-slate-800">
                          {Object.entries(SCENARIOS).map(([key, data]) => (
                            <SelectItem key={key} value={key} className="text-slate-100">
                              <div className="flex items-center gap-2">
                                <span>{data.icon}</span>
                                <div>
                                  <div className="font-medium">{data.name}</div>
                                  <div className="text-xs text-slate-400">{data.description}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-slate-200">Color Scheme</Label>
                      <Select value={colorScheme} onValueChange={setColorScheme}>
                        <SelectTrigger className="border-slate-600 bg-slate-700 text-slate-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-slate-600 bg-slate-800">
                          {Object.entries(COLOR_SCHEMES).map(([key, data]) => (
                            <SelectItem key={key} value={key} className="text-slate-100">
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-4 w-4 rounded-full"
                                  style={{
                                    background: `linear-gradient(45deg, ${data.colors[0]}, ${data.colors[1]})`,
                                  }}
                                />
                                <div>
                                  <div className="font-medium">{data.name}</div>
                                  <div className="text-xs text-slate-400">{data.description}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  {/* Projection Tab */}
                  <TabsContent value="projection" className="space-y-4">
                    <div>
                      <Label className="text-slate-200">Projection Type</Label>
                      <div className="mt-2 grid gap-2">
                        {Object.entries(PROJECTION_TYPES).map(([key, data]) => (
                          <div
                            key={key}
                            className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                              projectionType === key
                                ? "border-purple-500 bg-purple-500/10"
                                : "border-slate-600 bg-slate-700/50 hover:border-slate-500"
                            }`}
                            onClick={() => setProjectionType(key)}
                          >
                            <div className="flex items-center gap-3">
                              <data.icon className="h-5 w-5 text-slate-300" />
                              <div>
                                <div className="font-medium text-slate-100">{data.name}</div>
                                <div className="text-xs text-slate-400">{data.description}</div>
                                <div className="mt-1 text-xs text-slate-500">{data.technical}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Advanced Tab */}
                  <TabsContent value="advanced" className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <Label className="text-slate-200">Random Seed</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={generateRandomSeed}
                          className="border-slate-600 bg-slate-700 text-slate-100 hover:bg-slate-600"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </div>
                      <Input
                        type="number"
                        value={seed}
                        onChange={(e) => setSeed(Number.parseInt(e.target.value) || 0)}
                        className="border-slate-600 bg-slate-700 text-slate-100"
                      />
                    </div>

                    <div>
                      <Label className="text-slate-200">Resolution</Label>
                      <Select value={resolution} onValueChange={setResolution}>
                        <SelectTrigger className="border-slate-600 bg-slate-700 text-slate-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-slate-600 bg-slate-800">
                          <SelectItem value="1080p" className="text-slate-100">
                            1080p (1920×1080)
                          </SelectItem>
                          <SelectItem value="1440p" className="text-slate-100">
                            1440p (2560×1440)
                          </SelectItem>
                          <SelectItem value="2160p" className="text-slate-100">
                            4K (3840×2160)
                          </SelectItem>
                          <SelectItem value="4320p" className="text-slate-100">
                            8K (7680×4320)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-slate-200">High Quality Mode</Label>
                        <p className="text-xs text-slate-400">Enhanced detail and clarity</p>
                      </div>
                      <Switch checked={enable4K} onCheckedChange={setEnable4K} />
                    </div>
                  </TabsContent>
                </Tabs>

                <Separator className="my-6 bg-slate-600" />

                {/* Generation Button */}
                <Button
                  onClick={generateArt}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Art
                    </>
                  )}
                </Button>

                {/* Progress Bar */}
                {isGenerating && (
                  <div className="mt-4">
                    <div className="mb-2 flex justify-between text-sm text-slate-300">
                      <span>Generating artwork...</span>
                      <span>{Math.round(generationProgress)}%</span>
                    </div>
                    <Progress value={generationProgress} className="bg-slate-700" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Display Area */}
          <div className="lg:col-span-2">
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-slate-100">
                      <ImageIcon className="h-5 w-5" />
                      Generated Artwork
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      {generatedImage
                        ? "Your mathematical art is ready"
                        : "Configure parameters and generate your artwork"}
                    </CardDescription>
                  </div>
                  {generatedImage && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyImageUrl}
                        className="border-slate-600 bg-slate-700 text-slate-100 hover:bg-slate-600"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(generatedImage, "_blank")}
                        className="border-slate-600 bg-slate-700 text-slate-100 hover:bg-slate-600"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button onClick={downloadImage} className="bg-green-600 text-white hover:bg-green-700" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="aspect-square w-full overflow-hidden rounded-lg border border-slate-600 bg-slate-900">
                  {generatedImage ? (
                    <img
                      src={generatedImage || "/placeholder.svg"}
                      alt="Generated mathematical art"
                      className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">
                      <div className="text-center">
                        <ImageIcon className="mx-auto mb-4 h-16 w-16 opacity-50" />
                        <p className="text-lg font-medium">No artwork generated yet</p>
                        <p className="text-sm">Configure your parameters and click Generate Art</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Generation Results */}
                {generationResult && (
                  <div className="mt-6">
                    <h3 className="mb-3 font-semibold text-slate-200">Generation Details</h3>
                    <div className="space-y-3">
                      {generationResult.success ? (
                        <Alert className="border-green-600 bg-green-600/10">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <AlertDescription className="text-green-300">
                            Successfully generated with {generationResult.provider} {generationResult.model} in{" "}
                            {generationResult.attempts} attempt(s)
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert className="border-red-600 bg-red-600/10">
                          <AlertCircle className="h-4 w-4 text-red-400" />
                          <AlertDescription className="text-red-300">{generationResult.error}</AlertDescription>
                        </Alert>
                      )}

                      {generationResult.success && (
                        <div className="grid gap-2 text-sm text-slate-300">
                          <div className="flex justify-between">
                            <span>Dimensions:</span>
                            <span>
                              {generationResult.dimensions?.width}×{generationResult.dimensions?.height}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>File Size:</span>
                            <span>{generationResult.estimatedFileSize}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Quality:</span>
                            <span>{generationResult.is4K ? "High Definition" : "Standard"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Safety Level:</span>
                            <span>{generationResult.safetyLevel}/3</span>
                          </div>
                        </div>
                      )}
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
