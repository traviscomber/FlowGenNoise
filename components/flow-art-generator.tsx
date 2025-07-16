"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ImageIcon, Sparkles, Zap, Brain, Dna, Atom, Microscope } from "lucide-react"

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
                    <SelectItem value="\
