"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Download, Save, Sparkles, Wand2, Eye, EyeOff } from "lucide-react"
import { ImageIcon } from "lucide-react"
import { SaveArtworkDialog } from "@/components/gallery/save-artwork-dialog"
import { useToast } from "@/hooks/use-toast"

type Mode = "flow" | "ai"

// Enhanced mathematical problem sets for datasets
const MATHEMATICAL_DATASETS = {
  spirals: {
    name: "Logarithmic Spirals",
    description: "Golden ratio spirals following r = a·e^(b·θ), mimicking nautilus shells and galaxy arms",
    mathConcept: "Polar coordinates, exponential growth, Fibonacci sequences, φ = 1.618",
  },
  moons: {
    name: "Two Moons Problem",
    description: "Interleaving crescents creating non-linear decision boundaries",
    mathConcept: "Non-linear classification, manifold learning, topological separation",
  },
  circles: {
    name: "Concentric Circles",
    description: "Radial symmetry with multiple distance metrics r² = x² + y²",
    mathConcept: "Euclidean distance, radial basis functions, circular harmonics",
  },
  blobs: {
    name: "Gaussian Mixture",
    description: "Multivariate normal distributions creating organic cluster formations",
    mathConcept: "Probability density functions, statistical clustering, σ² variance",
  },
  checkerboard: {
    name: "Discrete Tessellation",
    description: "Alternating grid pattern with sharp topological boundaries",
    mathConcept: "Discrete topology, tessellation theory, decision boundaries",
  },
  gaussian: {
    name: "Normal Distribution",
    description: "Perfect bell curve following central limit theorem N(μ,σ²)",
    mathConcept: "Statistical distribution, probability density, central limit theorem",
  },
  grid: {
    name: "Cartesian Lattice",
    description: "Regular coordinate system with periodic tiling structure",
    mathConcept: "Cartesian coordinates, lattice theory, periodic functions",
  },
}

const SCENARIOS = {
  forest: "Enchanted mathematical forest with emerald canopies, golden light, and organic textures",
  cosmic: "Deep space nebula with stellar formations, gravitational lensing, and cosmic phenomena",
  ocean: "Underwater paradise with bioluminescent organisms, caustic lighting, and flowing currents",
  neural: "Living neural network with synaptic connections, electrical impulses, and brain-like structures",
  fire: "Mathematical flames with heat distortion, dancing embers, and molten intensity",
  ice: "Crystalline wonderland with hexagonal symmetry, aurora effects, and pristine frost patterns",
  desert: "Wind-carved formations with golden sands, mirages, and oasis reflections",
  sunset: "Golden hour atmosphere with coral skies, lens flares, and warm atmospheric perspective",
  monochrome: "Classical black and white with dramatic chiaroscuro, fine art composition, and pure form",
}

export function FlowArtGenerator() {
  const [dataset, setDataset] = useState<keyof typeof MATHEMATICAL_DATASETS>("spirals")
  const [scenario, setScenario] = useState<keyof typeof SCENARIOS>("forest")
  const [seed, setSeed] = useState(Math.floor(Math.random() * 1000))
  const [numSamples, setNumSamples] = useState(2000)
  const [noiseScale, setNoiseScale] = useState(0.05)
  const [timeStep, setTimeStep] = useState(0.01)
  const [customPrompt, setCustomPrompt] = useState("")
  const [mode, setMode] = useState<Mode>("flow")
  const [upscaleMethod, setUpscaleMethod] = useState("real-esrgan")

  // Prompt management states
  const [generatedPrompt, setGeneratedPrompt] = useState("")
  const [finalPrompt, setFinalPrompt] = useState("")
  const [showPromptDetails, setShowPromptDetails] = useState(false)
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false)
  const [promptGenerated, setPromptGenerated] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ imageUrl: string; svgContent: string; upscaledImageUrl?: string } | null>(null)

  // Add new state for generated metadata
  const [generatedMetadata, setGeneratedMetadata] = useState<{
    title: string
    description: string
  } | null>(null)

  const { toast } = useToast()

  // Generate enhanced base prompt from dataset and scenario
  const generateBasePrompt = () => {
    const datasetInfo = MATHEMATICAL_DATASETS[dataset]
    const scenarioDesc = SCENARIOS[scenario]

    // Create rich, detailed base prompt
    const basePrompt = createEnhancedBasePrompt(datasetInfo, scenarioDesc, {
      numSamples,
      noiseScale,
      seed,
      timeStep,
    })

    setGeneratedPrompt(basePrompt)
    setFinalPrompt(basePrompt)
    setPromptGenerated(true)
  }

  // Helper function to create enhanced base prompts
  const createEnhancedBasePrompt = (
    datasetInfo: (typeof MATHEMATICAL_DATASETS)[keyof typeof MATHEMATICAL_DATASETS],
    scenarioDesc: string,
    params: { numSamples: number; noiseScale: number; seed: number; timeStep: number },
  ) => {
    const mathPrompts = {
      spirals: `Mesmerizing logarithmic spirals unfurling in perfect mathematical harmony, each curve following the golden ratio φ = 1.618. Fibonacci sequences manifest as nested spiral arms, creating hypnotic patterns that echo nautilus shells and galaxy formations. The spiral density increases toward the center, with ${params.numSamples} precisely calculated points tracing the path of r = a·e^(b·θ). Organic flow lines connect each mathematical node, creating a living tapestry of exponential growth and polar coordinate beauty.`,

      moons: `Two intertwining crescent moons dancing in non-linear mathematical space, representing the classic two-moon classification problem. Each crescent follows a perfect semicircular arc, with ${params.numSamples} data points distributed along the curved boundaries. The crescents interlock like yin-yang symbols, creating complex decision boundaries that challenge linear separation. Smooth gradients flow between the lunar shapes, with subtle noise (σ=${params.noiseScale}) adding organic texture to the mathematical precision.`,

      circles: `Concentric circles radiating outward in perfect radial symmetry, each ring representing a different distance metric in mathematical space. ${params.numSamples} points distributed across multiple circular bands, creating mandala-like patterns with precise geometric relationships. The circles follow r² = x² + y² equations, with each ring separated by calculated intervals. Flow fields connect the circular boundaries, creating ripple effects that propagate through the mathematical space like waves in a pond.`,

      blobs: `Gaussian probability clouds manifesting as organic blob formations, each cluster representing a different statistical distribution. ${params.numSamples} data points sampled from multivariate normal distributions, creating natural clustering patterns that resemble cellular structures or cloud formations. The blobs follow σ² variance parameters, with smooth probability density gradients connecting each cluster. Noise factor ${params.noiseScale} adds natural randomness to the mathematical precision.`,

      checkerboard: `Discrete mathematical tessellation creating an infinite checkerboard pattern, where each square represents a different topological region. ${params.numSamples} points distributed across the grid vertices, creating sharp decision boundaries that alternate in perfect mathematical rhythm. The pattern follows discrete topology principles, with each cell representing a different classification region. Flow lines create smooth transitions between the discrete mathematical spaces.`,

      gaussian: `Pure Gaussian distribution manifesting as a perfect bell curve in 2D space, following the central limit theorem. ${params.numSamples} points sampled from normal distribution N(μ,σ²), creating a natural mountain-like formation with highest density at the center. The distribution follows the probability density function f(x) = (1/σ√(2π))e^(-½((x-μ)/σ)²), with smooth gradients radiating outward from the statistical center.`,

      grid: `Perfect Cartesian coordinate system with ${params.numSamples} points arranged in mathematical precision across a regular lattice structure. Each intersection represents a coordinate pair (x,y) in Euclidean space, creating a foundation for all mathematical transformations. The grid follows periodic tiling principles, with each cell maintaining perfect geometric relationships. Flow fields transform the rigid mathematical structure into organic, flowing patterns.`,
    }

    const scenarioEnhancements = {
      forest: `Rendered as an enchanted mathematical forest where each equation becomes a living tree branch. Emerald greens (#2d5016, #4a7c59) and golden ratios manifest as autumn leaves. Dappled sunlight filters through the canopy, creating chiaroscuro lighting effects. Moss-covered bark textures emerge from the mathematical structures, with morning mist adding ethereal atmosphere. The forest floor sparkles with dewdrops that catch the light like tiny mathematical gems.`,

      cosmic: `Transformed into a cosmic nebula where mathematical equations become stellar formations. Deep space purples (#191970, #4b0082) and electric blues create the vast cosmic backdrop. Each mathematical point becomes a star, with gravitational lensing effects bending light around massive mathematical objects. Cosmic dust and gas clouds follow the flow fields, creating spectacular aurora-like phenomena. Distant galaxies spiral in the background, following the same mathematical principles.`,

      ocean: `Manifested as an underwater mathematical paradise where equations flow like ocean currents. Brilliant aqua blues (#006994, #1e90ff) and seafoam greens create depth and movement. Bioluminescent mathematical organisms pulse with inner light, creating a living reef of equations. Caustic light patterns dance across the mathematical seafloor, while gentle currents carry the flow fields like underwater aurora. Schools of geometric fish swim through the mathematical coral formations.`,

      neural: `Visualized as a living neural network where each mathematical point becomes a neuron firing with electric energy. Vibrant synaptic connections (#ff6b6b, #4ecdc4) pulse with data transmission. The mathematical structures form neural pathways, with electrical impulses following the flow fields. Dendrites and axons branch out in fractal patterns, creating a brain-like structure that processes the mathematical information. Neurotransmitters sparkle like stars at each synaptic junction.`,

      fire: `Rendered as mathematical flames where each equation burns with intense heat and light. Fiery reds (#8b0000, #dc143c) and molten oranges create the blazing atmosphere. The mathematical structures become dancing flames, with heat distortion effects warping the space around them. Embers float upward following the flow fields, creating trails of light. The fire's base glows with white-hot intensity, while the tips flicker with cooler orange and red hues.`,

      ice: `Crystallized into a frozen mathematical wonderland where equations become ice crystals. Pristine blues (#b0e0e6, #87ceeb) and arctic whites create the glacial palette. Each mathematical structure forms perfect ice crystals with hexagonal symmetry. Frost patterns follow the flow fields, creating delicate filigree across the surface. Aurora borealis dances overhead, casting ethereal light across the mathematical ice formations. Icicles hang like frozen equations, catching and refracting the polar light.`,

      desert: `Manifested as mathematical sand dunes where equations shift like desert winds. Warm golden sands (#daa520, #cd853f) and terracotta create the arid landscape. The mathematical structures form wind-carved rock formations, with sand particles following the flow fields. Mirages shimmer in the distance, creating optical illusions that bend the mathematical space. Oasis pools reflect the mathematical patterns, while desert flowers bloom in impossible mathematical precision.`,

      sunset: `Painted with the warm glow of golden hour where mathematics meets the sublime beauty of twilight. Coral pinks (#ff7f50) and amber golds (#ffa500) create the perfect lighting. The mathematical structures are silhouetted against the setting sun, with lens flares and atmospheric perspective adding depth. Clouds follow the flow fields, creating dramatic sky formations. The entire scene is bathed in warm, diffused light that makes every mathematical element glow with inner beauty.`,

      monochrome: `Rendered in exquisite black and white where mathematical beauty is distilled to pure form and contrast. Deep charcoals (#2c2c2c) and pristine whites create dramatic chiaroscuro effects. The mathematical structures become studies in light and shadow, with subtle gradations revealing every detail. Cross-hatching and stippling techniques add texture, while negative space creates breathing room. The composition follows classical artistic principles, making mathematics into fine art.`,
    }

    const mathPrompt = mathPrompts[dataset as keyof typeof mathPrompts] || mathPrompts.spirals
    const scenarioPrompt =
      scenarioEnhancements[scenario as keyof typeof scenarioEnhancements] || scenarioEnhancements.forest

    return `${mathPrompt}

${scenarioPrompt}

Technical specifications: Ultra-high resolution 8K masterpiece with professional gallery lighting. Mathematical precision meets artistic excellence through advanced rendering techniques including global illumination, subsurface scattering, and physically-based materials. Composition follows the rule of thirds with perfect mathematical balance. Color harmony achieved through complementary palettes and golden ratio proportions. Depth of field creates focus hierarchy while maintaining mathematical clarity throughout.

Artistic style: Hyperrealistic mathematical visualization with painterly qualities, combining the precision of technical illustration with the soul of fine art. Each mathematical element is rendered with museum-quality attention to detail. The piece should evoke both intellectual wonder and emotional resonance, making complex mathematics accessible through pure visual beauty.

Seed: ${params.seed} | Noise: ${params.noiseScale} | Flow: ${params.timeStep}`
  }

  // Enhance prompt using OpenAI
  const enhancePrompt = async () => {
    setIsEnhancingPrompt(true)

    try {
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dataset,
          scenario,
          numSamples,
          noiseScale,
          currentPrompt: generatedPrompt,
          customElements: customPrompt.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        let enhancedPrompt = data.enhancedPrompt

        // Incorporate custom prompt elements if provided
        if (customPrompt.trim()) {
          enhancedPrompt += ` Additional elements: ${customPrompt.trim()}`
        }

        setFinalPrompt(enhancedPrompt)
        toast({
          title: "Prompt Enhanced!",
          description: "AI has enhanced your prompt with artistic details.",
        })
      } else {
        throw new Error(data.error || "Failed to enhance prompt")
      }
    } catch (error) {
      console.error("Failed to enhance prompt:", error)
      toast({
        title: "Enhancement Failed",
        description: "Failed to enhance prompt. Using base prompt instead.",
        variant: "destructive",
      })
    } finally {
      setIsEnhancingPrompt(false)
    }
  }

  // Update the generateArtwork function to include metadata generation
  const generateArtwork = async () => {
    if (!promptGenerated) {
      toast({
        title: "Generate Prompt First",
        description: "Please generate a prompt before creating artwork.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setResult(null)
    setGeneratedMetadata(null)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode,
          dataset,
          scenario,
          seed,
          numSamples,
          noiseScale,
          timeStep,
          customPrompt: mode === "ai" ? finalPrompt : undefined,
          upscaleMethod,
          generateMetadata: true, // Request metadata generation
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)

      // Set generated metadata if available
      if (data.metadata) {
        setGeneratedMetadata(data.metadata)
      }

      toast({
        title: "Artwork Generated!",
        description: "Your mathematical art has been created successfully.",
      })
    } catch (error) {
      console.error("Failed to generate artwork:", error)
      toast({
        title: "Generation Failed",
        description: "Failed to generate artwork. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const downloadImage = () => {
    if (!result?.imageUrl) return

    const link = document.createElement("a")
    link.href = result.imageUrl
    link.download = `flow-art-${dataset}-${scenario}-${seed}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Reset prompt when dataset or scenario changes
  const handleDatasetChange = (newDataset: keyof typeof MATHEMATICAL_DATASETS) => {
    setDataset(newDataset)
    setPromptGenerated(false)
    setGeneratedPrompt("")
    setFinalPrompt("")
  }

  const handleScenarioChange = (newScenario: keyof typeof SCENARIOS) => {
    setScenario(newScenario)
    setPromptGenerated(false)
    setGeneratedPrompt("")
    setFinalPrompt("")
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">FlowSketch Art Generator</h1>
          <p className="text-muted-foreground">
            Generate beautiful mathematical artwork using flow-based models and AI
          </p>
        </div>
        <Button variant="outline" asChild>
          <a href="/gallery">
            <ImageIcon className="mr-2 h-4 w-4" />
            View Gallery
          </a>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Mathematical Dataset Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Mathematical Dataset *</CardTitle>
              <CardDescription>Choose the mathematical foundation for your artwork</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="dataset">Dataset Type</Label>
                <Select value={dataset} onValueChange={handleDatasetChange}>
                  <SelectTrigger id="dataset">
                    <SelectValue placeholder="Select Mathematical Dataset" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MATHEMATICAL_DATASETS).map(([key, info]) => (
                      <SelectItem key={key} value={key}>
                        {info.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dataset Info */}
              <div className="p-3 bg-muted rounded-md">
                <h4 className="font-medium text-sm mb-1">{MATHEMATICAL_DATASETS[dataset].name}</h4>
                <p className="text-sm text-muted-foreground mb-2">{MATHEMATICAL_DATASETS[dataset].description}</p>
                <Badge variant="outline" className="text-xs">
                  {MATHEMATICAL_DATASETS[dataset].mathConcept}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Generation Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Generation Settings</CardTitle>
              <CardDescription>Configure the mathematical parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="mode">Generation Mode</Label>
                <Select value={mode} onValueChange={(value) => setMode(value as Mode)}>
                  <SelectTrigger id="mode">
                    <SelectValue placeholder="Select Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flow">Flow (SVG Mathematical)</SelectItem>
                    <SelectItem value="ai">AI Enhanced (DALL-E)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="scenario">Artistic Scenario</Label>
                <Select value={scenario} onValueChange={handleScenarioChange}>
                  <SelectTrigger id="scenario">
                    <SelectValue placeholder="Select Artistic Style" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SCENARIOS).map(([key, description]) => (
                      <SelectItem key={key} value={key}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="seed">Seed</Label>
                  <Input
                    id="seed"
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(Number.parseInt(e.target.value))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="num-samples">Sample Points</Label>
                  <Input
                    id="num-samples"
                    type="number"
                    value={numSamples}
                    min={100}
                    max={10000}
                    onChange={(e) => setNumSamples(Number.parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="noise-scale">Noise Scale: {noiseScale.toFixed(3)}</Label>
                <Slider
                  id="noise-scale"
                  value={[noiseScale]}
                  max={0.2}
                  min={0.001}
                  step={0.001}
                  onValueChange={(value) => setNoiseScale(value[0])}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="time-step">Time Step: {timeStep.toFixed(3)}</Label>
                <Slider
                  id="time-step"
                  value={[timeStep]}
                  max={0.1}
                  min={0.001}
                  step={0.001}
                  onValueChange={(value) => setTimeStep(value[0])}
                />
              </div>
            </CardContent>
          </Card>

          {/* Prompt Management */}
          <Card>
            <CardHeader>
              <CardTitle>Prompt Generation</CardTitle>
              <CardDescription>Generate and enhance your AI prompt</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Custom Elements */}
              <div className="grid gap-2">
                <Label htmlFor="custom-prompt">Custom Elements (Optional)</Label>
                <Textarea
                  id="custom-prompt"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Add custom elements like 'with golden fractals', 'in watercolor style', etc."
                  rows={2}
                />
              </div>

              {/* Generate Base Prompt */}
              <Button onClick={generateBasePrompt} className="w-full bg-transparent" variant="outline">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Base Prompt
              </Button>

              {/* Generated Prompt Display */}
              {promptGenerated && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Generated Prompt</Label>
                    <Button variant="ghost" size="sm" onClick={() => setShowPromptDetails(!showPromptDetails)}>
                      {showPromptDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>

                  {showPromptDetails && (
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm font-mono">{generatedPrompt}</p>
                    </div>
                  )}

                  {/* Enhance Prompt Button */}
                  {mode === "ai" && (
                    <Button onClick={enhancePrompt} disabled={isEnhancingPrompt} className="w-full" variant="secondary">
                      <Wand2 className="mr-2 h-4 w-4" />
                      {isEnhancingPrompt ? "Enhancing..." : "AI Enhance Prompt"}
                    </Button>
                  )}

                  {/* Final Prompt Editor */}
                  <div className="grid gap-2">
                    <Label htmlFor="final-prompt">Final Prompt (Editable)</Label>
                    <Textarea
                      id="final-prompt"
                      value={finalPrompt}
                      onChange={(e) => setFinalPrompt(e.target.value)}
                      rows={4}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={generateArtwork} disabled={isLoading || !promptGenerated} className="w-full">
                {isLoading ? "Generating Artwork..." : "Generate Artwork"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Result Display */}
        <div>
          {result ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {generatedMetadata?.title ||
                    `${MATHEMATICAL_DATASETS[dataset].name} • ${scenario.charAt(0).toUpperCase() + scenario.slice(1)}`}
                </CardTitle>
                <CardDescription>
                  {generatedMetadata?.description || `Seed: ${seed} • ${numSamples} points • Noise: ${noiseScale}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <img
                  src={result.imageUrl || "/placeholder.svg"}
                  alt="Generated Mathematical Artwork"
                  className="w-full rounded-md shadow-md"
                />

                {/* Show generated story/description */}
                {generatedMetadata && (
                  <div className="p-4 bg-muted/50 rounded-md">
                    <h4 className="font-medium text-sm mb-2">The Story Behind This Artwork</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{generatedMetadata.description}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" onClick={downloadImage} className="flex-1 bg-transparent">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <SaveArtworkDialog
                  imageUrl={result.imageUrl}
                  svgContent={result.svgContent}
                  upscaledImageUrl={result.upscaledImageUrl}
                  mode={mode}
                  generationParams={{
                    dataset,
                    scenario,
                    seed,
                    numSamples,
                    noiseScale,
                    timeStep,
                    customPrompt: finalPrompt,
                    upscaleMethod: result.upscaledImageUrl ? upscaleMethod : undefined,
                  }}
                  generatedMetadata={generatedMetadata} // Pass metadata to save dialog
                >
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Save className="mr-2 h-4 w-4" />
                    Save to Gallery
                  </Button>
                </SaveArtworkDialog>
              </CardFooter>
            </Card>
          ) : (
            <Card className="h-full">
              <CardContent className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center space-y-4">
                  <div className="text-6xl">🎨</div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Ready to Create</h3>
                    <p className="text-muted-foreground text-sm max-w-md">
                      {!promptGenerated
                        ? "Select your mathematical dataset and generate a prompt to begin creating artwork."
                        : "Your prompt is ready! Click 'Generate Artwork' to create your mathematical masterpiece."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
