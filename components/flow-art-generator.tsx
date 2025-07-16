"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Download, ImageIcon, Save, Sparkles, Zap, Brain, Dna, Atom, Microscope, Wand2, Loader2 } from "lucide-react"
import { SaveArtworkDialog } from "@/components/gallery/save-artwork-dialog"

type Mode = "flow" | "ai"

export function FlowArtGenerator() {
  const [dataset, setDataset] = useState("ffhq")
  const [scenario, setScenario] = useState("random")
  const [seed, setSeed] = useState(Math.floor(Math.random() * 1000))
  const [numSamples, setNumSamples] = useState(1)
  const [noiseScale, setNoiseScale] = useState(0.8)
  const [timeStep, setTimeStep] = useState(0.8)
  const [customPrompt, setCustomPrompt] = useState("")
  const [mode, setMode] = useState<Mode>("flow")
  const [upscaleMethod, setUpscaleMethod] = useState("real-esrgan")
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    imageUrl: string
    svgContent: string
    upscaledImageUrl?: string
    prompt?: string
  } | null>(null)

  const enhancePrompt = async () => {
    setIsEnhancingPrompt(true)

    try {
      // Create a base prompt based on the selected dataset
      const datasetDescriptions: Record<string, string> = {
        neural_networks:
          "neural network architecture with interconnected nodes, activation functions, and weighted connections",
        dna_sequences:
          "DNA double helix structure with nucleotide base pairs, phosphate backbone, and genetic encoding patterns",
        quantum_fields:
          "quantum field visualization with particle-wave duality, probability distributions, and quantum entanglement",
        cosmic_phenomena: "cosmic deep space phenomena including nebulae, black holes, and galactic structures",
        fractal_geometry:
          "fractal mathematical patterns with self-similarity at different scales and complex recursive structures",
        protein_folding:
          "protein molecular folding with amino acid chains, alpha helices, beta sheets, and tertiary structures",
        brain_connectivity: "neural brain connectivity maps showing synaptic networks, dendrites, and axonal pathways",
        crystalline_structures:
          "crystalline molecular lattices with geometric atomic arrangements and symmetrical patterns",
      }

      const scenarioStyles: Record<string, string> = {
        cyberpunk: "with neon colors, futuristic technology, and urban dystopian elements",
        bioluminescent: "with organic glowing effects, ethereal light patterns, and natural luminescence",
        holographic: "with iridescent surfaces, light refraction, and dimensional shifting",
        microscopic: "as seen through an electron microscope with scientific precision and micro-level detail",
        ethereal: "with dreamlike qualities, soft lighting, and otherworldly atmosphere",
        crystalline: "with geometric precision, faceted surfaces, and light-refracting properties",
      }

      const scientificDataset = Object.keys(datasetDescriptions).includes(dataset)

      let basePrompt = ""
      if (scientificDataset) {
        basePrompt = `Create a scientifically accurate yet artistic visualization of ${datasetDescriptions[dataset] || "complex scientific data"}`
      } else {
        basePrompt = `Create a stunning digital artwork featuring ${dataset} dataset`
      }

      const styleDescription = scenarioStyles[scenario] || "with artistic interpretation and creative visual effects"

      // Add mathematical and scientific details based on the dataset
      let enhancedPrompt = `${basePrompt} ${styleDescription}. `

      if (dataset === "neural_networks") {
        enhancedPrompt +=
          "Incorporate visual representations of activation functions like ReLU, sigmoid, and tanh. Show weighted connections between neurons with varying line thickness. Include input layer, multiple hidden layers with different neuron densities, and output layer. Visualize backpropagation flow and gradient descent optimization paths."
      } else if (dataset === "dna_sequences") {
        enhancedPrompt +=
          "Show the detailed molecular structure of DNA with accurate base pairing (adenine-thymine, guanine-cytosine). Visualize the phosphodiester bonds in the sugar-phosphate backbone. Include representations of codons, genetic code sequences, and the helical twist with precise 10.5 base pairs per turn. Show nucleosome structures and chromatin condensation patterns."
      } else if (dataset === "quantum_fields") {
        enhancedPrompt +=
          "Visualize quantum field theory concepts including Feynman diagrams, probability wave functions, quantum tunneling effects, and Heisenberg uncertainty principle. Show particle-wave duality with interference patterns. Include representations of quantum entanglement, superposition states, and quantum vacuum fluctuations."
      } else if (dataset === "fractal_geometry") {
        enhancedPrompt +=
          "Create detailed Mandelbrot and Julia set visualizations with infinite recursive patterns. Show self-similarity at different scales with precise mathematical accuracy. Include Sierpinski triangles, Koch snowflakes, and Menger sponge structures. Visualize fractal dimension concepts and chaotic attractors with Lyapunov exponents."
      } else if (dataset === "protein_folding") {
        enhancedPrompt +=
          "Visualize the complex process of protein folding with accurate amino acid chain interactions. Show hydrogen bonding, hydrophobic interactions, and disulfide bridges. Include alpha helices, beta sheets, and tertiary structure formation. Represent chaperone proteins assisting the folding process and energy landscape funnels."
      } else if (dataset === "brain_connectivity") {
        enhancedPrompt +=
          "Create a detailed connectome visualization showing neural pathways, synaptic connections, and brain region interactions. Include accurate representations of white matter tracts, gray matter regions, and functional connectivity networks. Show neurotransmitter activity at synaptic junctions and action potential propagation along axons."
      }

      // Add artistic elements based on the scenario
      if (scenario === "cyberpunk") {
        enhancedPrompt +=
          " Render with neon blues, magentas, and electric greens against dark backgrounds. Include digital glitch effects, circuit-like patterns, and technological interfaces. Create a sense of digital dystopia with high contrast and sharp edges."
      } else if (scenario === "bioluminescent") {
        enhancedPrompt +=
          " Use ethereal blues, aquamarines, and phosphorescent greens that appear to genuinely glow. Create organic, flowing forms with natural luminescence patterns. Incorporate subtle gradients and soft light emission effects that mimic real bioluminescent organisms."
      } else if (scenario === "holographic") {
        enhancedPrompt +=
          " Render with rainbow iridescence, prismatic light effects, and dimensional shifting. Create the appearance of volumetric projection with transparent layers. Include interference patterns, light diffraction, and the sense of three-dimensional forms existing in projected space."
      }

      // Add technical quality specifications
      enhancedPrompt +=
        " The image should be highly detailed, scientifically accurate, and visually striking. Use advanced lighting techniques, depth of field, and rich color palettes to create visual interest. Maintain mathematical precision while achieving artistic beauty."

      setCustomPrompt(enhancedPrompt)
    } catch (error) {
      console.error("Error enhancing prompt:", error)
      alert("Failed to enhance prompt. Please try again.")
    } finally {
      setIsEnhancingPrompt(false)
    }
  }

  const generateArtwork = async () => {
    setIsLoading(true)
    setResult(null)

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
          customPrompt: mode === "ai" ? customPrompt : undefined,
          upscaleMethod,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Failed to generate artwork:", error)
      alert("Failed to generate artwork. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const downloadImage = () => {
    if (!result?.imageUrl) return

    const link = document.createElement("a")
    link.href = result.imageUrl
    link.download = `flow-art-${seed}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getDatasetIcon = (datasetValue: string) => {
    const icons = {
      neural_networks: <Brain className="h-4 w-4" />,
      dna_sequences: <Dna className="h-4 w-4" />,
      quantum_fields: <Atom className="h-4 w-4" />,
      protein_folding: <Microscope className="h-4 w-4" />,
      brain_connectivity: <Brain className="h-4 w-4" />,
    }
    return icons[datasetValue as keyof typeof icons] || null
  }

  const isScientificDataset = () => {
    const scientificDatasets = [
      "neural_networks",
      "dna_sequences",
      "quantum_fields",
      "cosmic_phenomena",
      "fractal_geometry",
      "protein_folding",
      "brain_connectivity",
      "crystalline_structures",
    ]
    return scientificDatasets.includes(dataset)
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            FlowSketch Art Generator
          </h1>
          <p className="text-muted-foreground">Generate beautiful artwork using flow-based models and advanced AI</p>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {mode === "ai" ? <Sparkles className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
                Generation Settings
              </CardTitle>
              <CardDescription>
                {mode === "ai"
                  ? "Create AI-generated artwork with advanced neural networks and scientific datasets"
                  : "Adjust the settings to generate your unique flow-based artwork"}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="mode">Generation Mode</Label>
                <Select value={mode} onValueChange={(value) => setMode(value as Mode)}>
                  <SelectTrigger id="mode">
                    <SelectValue placeholder="Select Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flow">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Flow Field Generation
                      </div>
                    </SelectItem>
                    <SelectItem value="ai">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        AI Art Generation
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dataset" className="flex items-center gap-2">
                  Dataset
                  {mode === "ai" && (
                    <Badge variant="secondary" className="text-xs">
                      AI Enhanced
                    </Badge>
                  )}
                </Label>
                <Select value={dataset} onValueChange={setDataset}>
                  <SelectTrigger id="dataset">
                    <SelectValue placeholder="Select Dataset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ffhq">
                      <div className="flex items-center gap-2">👤 Human Faces (FFHQ)</div>
                    </SelectItem>
                    <SelectItem value="bedroom">
                      <div className="flex items-center gap-2">🛏️ Interior Bedrooms</div>
                    </SelectItem>
                    <SelectItem value="church_outdoor">
                      <div className="flex items-center gap-2">⛪ Gothic Architecture</div>
                    </SelectItem>
                    <SelectItem value="celebahq">
                      <div className="flex items-center gap-2">⭐ Celebrity Portraits</div>
                    </SelectItem>

                    {/* Scientific & Neural Datasets */}
                    <SelectItem value="neural_networks">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Neural Network Visualizations
                        <Badge variant="outline" className="text-xs ml-auto">
                          Scientific
                        </Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="quantum_fields">
                      <div className="flex items-center gap-2">
                        <Atom className="h-4 w-4" />
                        Quantum Field Theory
                        <Badge variant="outline" className="text-xs ml-auto">
                          Physics
                        </Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="dna_sequences">
                      <div className="flex items-center gap-2">
                        <Dna className="h-4 w-4" />
                        DNA Molecular Structures
                        <Badge variant="outline" className="text-xs ml-auto">
                          Biology
                        </Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="cosmic_phenomena">
                      <div className="flex items-center gap-2">
                        🌌 Cosmic Deep Space
                        <Badge variant="outline" className="text-xs ml-auto">
                          Astronomy
                        </Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="fractal_geometry">
                      <div className="flex items-center gap-2">
                        🔢 Fractal Mathematics
                        <Badge variant="outline" className="text-xs ml-auto">
                          Math
                        </Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="protein_folding">
                      <div className="flex items-center gap-2">
                        <Microscope className="h-4 w-4" />
                        Protein Molecular Folding
                        <Badge variant="outline" className="text-xs ml-auto">
                          Biochemistry
                        </Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="brain_connectivity">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Brain Neural Connectivity
                        <Badge variant="outline" className="text-xs ml-auto">
                          Neuroscience
                        </Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="crystalline_structures">
                      <div className="flex items-center gap-2">
                        💎 Crystalline Lattices
                        <Badge variant="outline" className="text-xs ml-auto">
                          Chemistry
                        </Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="scenario" className="flex items-center gap-2">
                  Scenario Style
                  {mode === "ai" && (
                    <Badge variant="secondary" className="text-xs">
                      Enhanced
                    </Badge>
                  )}
                </Label>
                <Select value={scenario} onValueChange={setScenario}>
                  <SelectTrigger id="scenario">
                    <SelectValue placeholder="Select Scenario" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random">🎲 Random Artistic</SelectItem>
                    <SelectItem value="stylegan2">📸 Photorealistic (StyleGAN2)</SelectItem>
                    <SelectItem value="stylegan">🎨 Artistic Interpretation</SelectItem>
                    <SelectItem value="pggan">🔄 Progressive Detail</SelectItem>

                    {/* Enhanced AI Scenarios */}
                    <SelectItem value="cyberpunk">
                      <div className="flex items-center gap-2">
                        🌃 Cyberpunk Neon
                        <Badge variant="outline" className="text-xs ml-auto">
                          Futuristic
                        </Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="bioluminescent">
                      <div className="flex items-center gap-2">
                        ✨ Bioluminescent Glow
                        <Badge variant="outline" className="text-xs ml-auto">
                          Organic
                        </Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="holographic">
                      <div className="flex items-center gap-2">
                        🌈 Holographic Iridescent
                        <Badge variant="outline" className="text-xs ml-auto">
                          Tech
                        </Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="microscopic">
                      <div className="flex items-center gap-2">
                        🔬 Electron Microscope
                        <Badge variant="outline" className="text-xs ml-auto">
                          Scientific
                        </Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="ethereal">
                      <div className="flex items-center gap-2">
                        👻 Ethereal Dreamlike
                        <Badge variant="outline" className="text-xs ml-auto">
                          Artistic
                        </Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="crystalline">
                      <div className="flex items-center gap-2">
                        💎 Crystalline Precision
                        <Badge variant="outline" className="text-xs ml-auto">
                          Geometric
                        </Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {mode === "ai" && (
                <div className="grid gap-2 p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="custom-prompt" className="flex items-center gap-2">
                      <Wand2 className="h-4 w-4" />
                      {isScientificDataset() ? "Scientific AI Prompt" : "Custom AI Prompt"}
                    </Label>
                    {isScientificDataset() && (
                      <Button
                        onClick={enhancePrompt}
                        disabled={isEnhancingPrompt}
                        size="sm"
                        variant="outline"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600"
                      >
                        {isEnhancingPrompt ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Enhancing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3 w-3 mr-1" />
                            Generate Scientific Prompt
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  <Textarea
                    id="custom-prompt"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder={
                      isScientificDataset()
                        ? "Click 'Generate Scientific Prompt' to create a detailed mathematical prompt based on your selected dataset..."
                        : "Describe your vision... Leave empty to use auto-generated prompts based on dataset + scenario"
                    }
                    rows={5}
                    className="resize-none"
                  />

                  {isScientificDataset() && !customPrompt && (
                    <p className="text-xs text-muted-foreground">
                      💡 Generate a scientifically accurate prompt with mathematical concepts for your selected dataset
                    </p>
                  )}

                  {!isScientificDataset() && !customPrompt && (
                    <p className="text-xs text-muted-foreground">
                      💡 Auto-prompt will combine your selected dataset + scenario for optimal results
                    </p>
                  )}
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="seed">Seed</Label>
                <Input
                  id="seed"
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(Number.parseInt(e.target.value))}
                />
              </div>

              {mode === "flow" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="num-samples">Number of Samples</Label>
                    <Input
                      id="num-samples"
                      type="number"
                      value={numSamples}
                      onChange={(e) => setNumSamples(Number.parseInt(e.target.value))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="noise-scale">Noise Scale</Label>
                    <Slider
                      id="noise-scale"
                      defaultValue={[noiseScale * 100]}
                      max={100}
                      step={1}
                      onValueChange={(value) => setNoiseScale(value[0] / 100)}
                    />
                    <p className="text-sm text-muted-foreground">Current: {noiseScale.toFixed(2)}</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="time-step">Time Step</Label>
                    <Slider
                      id="time-step"
                      defaultValue={[timeStep * 100]}
                      max={100}
                      step={1}
                      onValueChange={(value) => setTimeStep(value[0] / 100)}
                    />
                    <p className="text-sm text-muted-foreground">Current: {timeStep.toFixed(2)}</p>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={generateArtwork}
                disabled={isLoading}
                className={`w-full ${
                  mode === "ai"
                    ? "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600"
                    : "bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 hover:from-blue-600 hover:via-cyan-600 hover:to-teal-600"
                }`}
              >
                {isLoading ? (
                  <>
                    {mode === "ai" ? (
                      <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                    ) : (
                      <Zap className="mr-2 h-4 w-4 animate-pulse" />
                    )}
                    {mode === "ai" ? "Generating AI Art..." : "Generating Flow Art..."}
                  </>
                ) : (
                  <>
                    {mode === "ai" ? <Sparkles className="mr-2 h-4 w-4" /> : <Zap className="mr-2 h-4 w-4" />}
                    {mode === "ai" ? "Generate AI Artwork" : "Generate Flow Artwork"}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          {result ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Generated Artwork</h2>
                <div className="flex gap-2">
                  <Badge variant={mode === "ai" ? "default" : "outline"}>
                    {mode === "ai" ? "🤖 AI Generated" : "📊 Flow Field"}
                  </Badge>
                  {getDatasetIcon(dataset) && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getDatasetIcon(dataset)}
                      Scientific
                    </Badge>
                  )}
                </div>
              </div>

              <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden">
                <img
                  src={result.imageUrl || "/placeholder.svg"}
                  alt="Generated Artwork"
                  className="w-full h-96 object-contain rounded-md shadow-md"
                />
              </div>

              {result.prompt && mode === "ai" && (
                <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                  <Label className="text-xs font-semibold text-purple-700 dark:text-purple-300">AI Prompt Used:</Label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{result.prompt}</p>
                </div>
              )}

              <div className="flex space-x-2">
                <Button variant="outline" onClick={downloadImage} className="flex-1 bg-transparent">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <SaveArtworkDialog
                  artworkData={{
                    imageUrl: result.imageUrl,
                    svgContent: result.svgContent,
                    upscaledImageUrl: result.upscaledImageUrl,
                    mode: mode,
                    params: {
                      dataset,
                      scenario,
                      seed,
                      numSamples,
                      noiseScale,
                      timeStep,
                    },
                    customPrompt: mode === "ai" ? customPrompt || result.prompt : undefined,
                    upscaleMethod: result.upscaledImageUrl ? upscaleMethod : undefined,
                  }}
                  onSaved={() => {
                    alert("Artwork saved to gallery!")
                  }}
                >
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Save className="mr-2 h-4 w-4" />
                    Save to Gallery
                  </Button>
                </SaveArtworkDialog>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-96">
              <div className="text-center text-muted-foreground">
                <div className="mb-4">
                  {mode === "ai" ? (
                    <Sparkles className="h-16 w-16 mx-auto opacity-50" />
                  ) : (
                    <Zap className="h-16 w-16 mx-auto opacity-50" />
                  )}
                </div>
                <p className="text-lg font-medium">
                  {mode === "ai" ? "Ready to create AI art!" : "Ready to generate flow art!"}
                </p>
                <p className="text-sm mt-2">
                  {mode === "ai"
                    ? isScientificDataset()
                      ? "Try the 'Generate Scientific Prompt' button for detailed mathematical concepts!"
                      : "Try the new scientific datasets like Neural Networks or DNA Sequences!"
                    : "Adjust the settings and click 'Generate Flow Artwork'."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FlowArtGenerator
