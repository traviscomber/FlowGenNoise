"use client"

import { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Shuffle, Sparkles, Save, Palette, Zap } from "lucide-react"
import {
  generateDataset,
  datasets,
  scenarios,
  colorSchemes,
  type DatasetType,
  type ScenarioType,
  type ColorSchemeType,
  type FlowParameters,
} from "@/lib/flow-model"
import { PlotUtils, type PlotConfig } from "@/lib/plot-utils"
import { saveToGallery } from "@/lib/gallery-storage"
import { useToast } from "@/hooks/use-toast"

interface Preset {
  name: string
  dataset: DatasetType
  scenario: ScenarioType
  colorScheme: ColorSchemeType
  params: FlowParameters
  colors: {
    stroke: string
    fill: string
    background: string
  }
}

const PRESETS: Preset[] = [
  {
    name: "Ocean Waves",
    dataset: "wave_interference",
    scenario: "deep_ocean",
    colorScheme: "viridis",
    params: {
      dataset: "wave_interference",
      samples: 200,
      noise: 0.2,
      complexity: 2,
      symmetry: 0.8,
      colorVariation: 0.6,
      flowIntensity: 1.5,
      scenario: "deep_ocean",
      scenarioThreshold: 70,
    },
    colors: { stroke: "#0ea5e9", fill: "none", background: "#f0f9ff" },
  },
  {
    name: "Fire Storm",
    dataset: "spiral_galaxy",
    scenario: "volcanic_landscape",
    colorScheme: "inferno",
    params: {
      dataset: "spiral_galaxy",
      samples: 300,
      noise: 0.4,
      complexity: 3,
      symmetry: 0.3,
      colorVariation: 0.9,
      flowIntensity: 2.2,
      scenario: "volcanic_landscape",
      scenarioThreshold: 85,
    },
    colors: { stroke: "#ef4444", fill: "none", background: "#fef2f2" },
  },
  {
    name: "Forest Flow",
    dataset: "fern",
    scenario: "enchanted_forest",
    colorScheme: "rainbow",
    params: {
      dataset: "fern",
      samples: 150,
      noise: 0.1,
      complexity: 1.5,
      symmetry: 0.7,
      colorVariation: 0.4,
      flowIntensity: 1.2,
      scenario: "enchanted_forest",
      scenarioThreshold: 60,
    },
    colors: { stroke: "#22c55e", fill: "none", background: "#f0fdf4" },
  },
  {
    name: "Cosmic Dance",
    dataset: "mandelbrot",
    scenario: "cosmic_nebula",
    colorScheme: "plasma",
    params: {
      dataset: "mandelbrot",
      samples: 400,
      noise: 0.3,
      complexity: 4,
      symmetry: 0.5,
      colorVariation: 0.8,
      flowIntensity: 2.8,
      scenario: "cosmic_nebula",
      scenarioThreshold: 90,
    },
    colors: { stroke: "#8b5cf6", fill: "none", background: "#faf5ff" },
  },
  {
    name: "Neural Network",
    dataset: "neural_network",
    scenario: "neural_connections",
    colorScheme: "neon",
    params: {
      dataset: "neural_network",
      samples: 250,
      noise: 0.15,
      complexity: 2.5,
      symmetry: 0.4,
      colorVariation: 0.7,
      flowIntensity: 1.8,
      scenario: "neural_connections",
      scenarioThreshold: 75,
    },
    colors: { stroke: "#00ff88", fill: "none", background: "#0a0a0a" },
  },
  {
    name: "Crystal Cave",
    dataset: "crystal_lattice",
    scenario: "crystal_cave",
    colorScheme: "cividis",
    params: {
      dataset: "crystal_lattice",
      samples: 180,
      noise: 0.05,
      complexity: 1.8,
      symmetry: 0.9,
      colorVariation: 0.3,
      flowIntensity: 1.1,
      scenario: "crystal_cave",
      scenarioThreshold: 65,
    },
    colors: { stroke: "#4c1d95", fill: "none", background: "#f8fafc" },
  },
]

export default function FlowArtGenerator() {
  const { toast } = useToast()

  // Enhanced state with dataset and scenario selection
  const [dataset, setDataset] = useState<DatasetType>("lissajous")
  const [scenario, setScenario] = useState<ScenarioType>("none")
  const [colorScheme, setColorScheme] = useState<ColorSchemeType>("viridis")
  const [seed, setSeed] = useState(Math.floor(Math.random() * 100000))

  const [params, setParams] = useState<FlowParameters>({
    dataset: "lissajous",
    samples: 200,
    noise: 0.2,
    complexity: 2,
    symmetry: 0.5,
    colorVariation: 0.5,
    flowIntensity: 1.5,
    scenario: "none",
    scenarioThreshold: 50,
  })

  const [colors, setColors] = useState({
    stroke: "#3b82f6",
    fill: "none",
    background: "#ffffff",
  })

  const [currentSvg, setCurrentSvg] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationMode, setGenerationMode] = useState<"mathematical" | "ai">("mathematical")

  // Memoized data generation with ALL parameters
  const generatedData = useMemo(() => {
    try {
      console.log("Generating data with ALL parameters:", {
        dataset,
        seed,
        samples: params.samples,
        noise: params.noise,
        complexity: params.complexity,
        symmetry: params.symmetry,
        flowIntensity: params.flowIntensity,
        scenarioThreshold: params.scenarioThreshold,
      })

      const data = generateDataset(
        dataset,
        seed,
        params.samples,
        params.noise,
        params.complexity,
        params.symmetry,
        params.flowIntensity,
        params.scenarioThreshold,
      )

      console.log("Generated data points:", data?.length || 0)

      if (!Array.isArray(data)) {
        console.error("generateDataset returned non-array:", typeof data)
        return [{ x: 400, y: 300 }]
      }

      return data
    } catch (error) {
      console.error("Error generating data:", error)
      return [{ x: 400, y: 300 }]
    }
  }, [
    dataset,
    seed,
    params.samples,
    params.noise,
    params.complexity,
    params.symmetry,
    params.flowIntensity,
    params.scenarioThreshold,
  ])

  // Memoized SVG generation with ALL parameters passed to PlotUtils
  const svgContent = useMemo(() => {
    try {
      if (!Array.isArray(generatedData)) {
        console.error("generatedData is not an array in svgContent:", typeof generatedData)
        return PlotUtils.generateSVG([{ x: 400, y: 300 }], {
          width: 800,
          height: 600,
          strokeWidth: 2,
          strokeColor: colors.stroke,
          fillColor: colors.fill,
          backgroundColor: colors.background,
          complexity: params.complexity,
          symmetry: params.symmetry,
          flowIntensity: params.flowIntensity,
          scenarioThreshold: params.scenarioThreshold,
        })
      }

      const config: PlotConfig = {
        width: 800,
        height: 600,
        strokeWidth: 2,
        strokeColor: colors.stroke,
        fillColor: colors.fill,
        backgroundColor: colors.background,
        complexity: params.complexity,
        symmetry: params.symmetry,
        flowIntensity: params.flowIntensity,
        scenarioThreshold: params.scenarioThreshold,
        showPoints: true,
        showConnections: true,
        pointSize: 2,
      }

      console.log("Generating SVG with config:", config)
      return PlotUtils.generateSVG(generatedData, config)
    } catch (error) {
      console.error("Error generating SVG:", error)
      return `<svg width="800" height="600"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="400" y="300" textAnchor="middle">Error</text></svg>`
    }
  }, [generatedData, colors, params.complexity, params.symmetry, params.flowIntensity, params.scenarioThreshold])

  // Safe parameter update functions
  const updateParam = useCallback((key: keyof FlowParameters, value: number | number[]) => {
    try {
      // Handle slider array values
      const numericValue = Array.isArray(value) ? value[0] : value

      if (typeof numericValue !== "number" || !isFinite(numericValue)) {
        console.warn(`Invalid value for ${key}:`, value)
        return
      }

      console.log(`Updating parameter ${key} to:`, numericValue)

      setParams((prev) => ({
        ...prev,
        [key]: numericValue,
      }))
    } catch (error) {
      console.error(`Error updating parameter ${key}:`, error)
    }
  }, [])

  const generateArt = useCallback(async () => {
    if (generationMode === "ai") {
      setIsGenerating(true)
      // AI Generation Mode
      try {
        const response = await fetch("/api/generate-ai-art", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Abstract ${dataset} pattern with ${scenario} theme, ${params.complexity} complexity and ${params.flowIntensity} intensity`,
            dataset,
            scenario,
            colorScheme,
            params,
            seed,
          }),
        })

        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const data = await response.json()

        // The AI route returns { image, aiDescription }. `image` is a PNG URL / data-URL.
        if (data.image) {
          // Embed the PNG into the canvas area by wrapping it in an <img>
          const aiArtwork = `<img src="${data.image}" alt="AI Generated Art" style="max-width:100%;height:auto;display:block;margin:auto;" />`
          setCurrentSvg(aiArtwork)

          // Auto-save AI artwork to gallery
          try {
            await saveToGallery({
              svg: data.image, // Save the actual image URL
              params: {
                ...params,
                dataset,
                scenario,
                colorScheme,
                seed,
                generationMode: "ai",
                aiPrompt: `Abstract ${dataset} pattern with ${scenario} theme, ${params.complexity} complexity and ${params.flowIntensity} intensity`,
                aiDescription: data.aiDescription,
              },
              colors,
              timestamp: Date.now(),
            })

            toast({
              title: "AI Artwork Generated & Saved",
              description: "Your AI artwork has been automatically saved to the gallery",
            })
          } catch (saveError) {
            console.error("Failed to auto-save AI artwork:", saveError)
            toast({
              title: "Generated but Save Failed",
              description: "Artwork generated but failed to save to gallery",
              variant: "destructive",
            })
          }
        } else {
          throw new Error("No image returned from AI generation")
        }
      } catch (error) {
        console.error("AI generation error:", error)
        toast({
          title: "AI Generation Failed",
          description: String(error),
          variant: "destructive",
        })
        // Fall back to mathematical SVG
        setCurrentSvg(svgContent)

        // Auto-save fallback mathematical artwork
        try {
          await saveToGallery({
            svg: svgContent,
            params: { ...params, dataset, scenario, colorScheme, seed, generationMode: "svg" },
            colors,
            timestamp: Date.now(),
          })

          toast({
            title: "Mathematical Artwork Generated & Saved",
            description: "Fallback mathematical artwork has been saved to the gallery",
          })
        } catch (saveError) {
          console.error("Failed to auto-save fallback artwork:", saveError)
        }
      } finally {
        setIsGenerating(false)
      }
    } else {
      console.log("Setting mathematical SVG content")
      setCurrentSvg(svgContent)

      // Auto-save mathematical artwork to gallery
      try {
        await saveToGallery({
          svg: svgContent,
          params: { ...params, dataset, scenario, colorScheme, seed, generationMode: "svg" },
          colors,
          timestamp: Date.now(),
        })

        toast({
          title: "Mathematical Artwork Generated & Saved",
          description: "Your mathematical artwork has been automatically saved to the gallery",
        })
      } catch (saveError) {
        console.error("Failed to auto-save mathematical artwork:", saveError)
        toast({
          title: "Generated but Save Failed",
          description: "Artwork generated but failed to save to gallery",
          variant: "destructive",
        })
      }
    }
  }, [generationMode, dataset, scenario, colorScheme, params, seed, svgContent, colors, toast])

  const applyPreset = useCallback(
    (preset: Preset) => {
      try {
        setDataset(preset.dataset)
        setScenario(preset.scenario)
        setColorScheme(preset.colorScheme)
        setParams(preset.params)
        setColors(preset.colors)
        toast({
          title: "Preset Applied",
          description: `Applied "${preset.name}" preset with ${preset.dataset} dataset`,
        })
      } catch (error) {
        console.error("Error applying preset:", error)
        toast({
          title: "Error",
          description: "Failed to apply preset",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  const randomizeParams = useCallback(() => {
    try {
      // Randomize dataset and scenario for crazy combinations
      const randomDataset = datasets[Math.floor(Math.random() * datasets.length)].value as DatasetType
      const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)].value as ScenarioType
      const randomColorScheme = colorSchemes[Math.floor(Math.random() * colorSchemes.length)].value as ColorSchemeType

      setDataset(randomDataset)
      setScenario(randomScenario)
      setColorScheme(randomColorScheme)
      setSeed(Math.floor(Math.random() * 100000))

      const randomParams: FlowParameters = {
        dataset: randomDataset,
        samples: Math.floor(Math.random() * 400) + 100,
        noise: Math.random() * 0.5,
        complexity: Math.random() * 4 + 0.5,
        symmetry: Math.random(),
        colorVariation: Math.random(),
        flowIntensity: Math.random() * 2.5 + 0.5,
        scenario: randomScenario,
        scenarioThreshold: Math.floor(Math.random() * 100),
      }
      setParams(randomParams)

      toast({
        title: "Parameters Randomized",
        description: `Generated crazy combo: ${randomDataset} + ${randomScenario}`,
      })
    } catch (error) {
      console.error("Error randomizing parameters:", error)
    }
  }, [toast])

  const saveArtwork = useCallback(async () => {
    try {
      const svgToSave = currentSvg || svgContent
      if (!svgToSave) {
        throw new Error("No artwork to save")
      }

      await saveToGallery({
        svg: svgToSave,
        params: { ...params, dataset, scenario, colorScheme, seed },
        colors,
        timestamp: Date.now(),
      })

      toast({
        title: "Artwork Saved",
        description: "Your artwork has been saved to the gallery",
      })
    } catch (error) {
      console.error("Error saving artwork:", error)
      toast({
        title: "Save Failed",
        description: "Failed to save artwork to gallery",
        variant: "destructive",
      })
    }
  }, [currentSvg, svgContent, params, dataset, scenario, colorScheme, seed, colors, toast])

  const downloadArtwork = useCallback(() => {
    try {
      const artwork = currentSvg || svgContent
      if (!artwork) throw new Error("No artwork to download")

      // Detect whether currentSvg is an <img> wrapper
      const match = artwork.match(/<img[^>]+src=["']([^"']+)["']/i)
      const imgSrc = match?.[1]

      if (imgSrc) {
        // Download PNG / data-URL
        const a = document.createElement("a")
        a.href = imgSrc
        a.download = `flowsketch-${dataset}-${scenario}-${Date.now()}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      } else {
        // Otherwise treat as raw SVG
        const blob = new Blob([artwork], { type: "image/svg+xml" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `flowsketch-${dataset}-${scenario}-${Date.now()}.svg`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }

      toast({ title: "Download Started" })
    } catch (error) {
      console.error("Download failed:", error)
      toast({ title: "Download Failed", description: String(error), variant: "destructive" })
    }
  }, [currentSvg, svgContent, dataset, scenario, toast])

  const generateTestArtwork = useCallback(async () => {
    try {
      // Create a few test artworks with different settings
      const testConfigs = [
        {
          dataset: "lissajous" as DatasetType,
          scenario: "ocean_waves" as ScenarioType,
          colorScheme: "viridis" as ColorSchemeType,
          testParams: { ...params, samples: 150, noise: 0.1, complexity: 1.5 },
        },
        {
          dataset: "spiral_galaxy" as DatasetType,
          scenario: "cosmic_nebula" as ScenarioType,
          colorScheme: "plasma" as ColorSchemeType,
          testParams: { ...params, samples: 200, noise: 0.3, complexity: 2.5 },
        },
        {
          dataset: "mandelbrot" as DatasetType,
          scenario: "crystal_cave" as ScenarioType,
          colorScheme: "rainbow" as ColorSchemeType,
          testParams: { ...params, samples: 100, noise: 0.05, complexity: 3.0 },
        },
      ]

      for (let i = 0; i < testConfigs.length; i++) {
        const config = testConfigs[i]
        const testSeed = Math.floor(Math.random() * 100000)

        // Generate test data
        const testData = generateDataset(
          config.dataset,
          testSeed,
          config.testParams.samples,
          config.testParams.noise,
          config.testParams.complexity,
          config.testParams.symmetry,
          config.testParams.flowIntensity,
          config.testParams.scenarioThreshold,
        )

        // Generate test SVG
        const testSvg = PlotUtils.generateSVG(testData, {
          width: 800,
          height: 600,
          strokeWidth: 2,
          strokeColor: colors.stroke,
          fillColor: colors.fill,
          backgroundColor: colors.background,
          complexity: config.testParams.complexity,
          symmetry: config.testParams.symmetry,
          flowIntensity: config.testParams.flowIntensity,
          scenarioThreshold: config.testParams.scenarioThreshold,
          showPoints: true,
          showConnections: true,
          pointSize: 2,
        })

        // Save to gallery
        await saveToGallery({
          svg: testSvg,
          params: {
            ...config.testParams,
            dataset: config.dataset,
            scenario: config.scenario,
            colorScheme: config.colorScheme,
            seed: testSeed,
            generationMode: "svg",
          },
          colors,
          timestamp: Date.now() - i * 1000, // Stagger timestamps
        })
      }

      toast({
        title: "Test Artwork Generated",
        description: `Generated ${testConfigs.length} test artworks and saved to gallery`,
      })
    } catch (error) {
      console.error("Failed to generate test artwork:", error)
      toast({
        title: "Test Generation Failed",
        description: "Failed to generate test artwork",
        variant: "destructive",
      })
    }
  }, [params, colors, toast])

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Panel - Takes up 4 columns on large screens */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <Palette className="h-5 w-5 text-white" />
                </div>
                Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Generation Mode */}
              <div className="space-y-4">
                <Label className="text-base font-semibold text-gray-700">Generation Mode</Label>
                <Tabs
                  value={generationMode}
                  onValueChange={(value) => setGenerationMode(value as "mathematical" | "ai")}
                >
                  <TabsList className="grid w-full grid-cols-2 h-12 bg-gray-100">
                    <TabsTrigger value="mathematical" className="text-sm font-medium">
                      Mathematical
                    </TabsTrigger>
                    <TabsTrigger value="ai" className="text-sm font-medium">
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI Enhanced
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Dataset Selection */}
              <div className="space-y-4">
                <Label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Dataset Pattern
                </Label>
                <Select value={dataset} onValueChange={(value) => setDataset(value as DatasetType)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Choose a mathematical pattern" />
                  </SelectTrigger>
                  <SelectContent>
                    {datasets.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Scenario Selection */}
              <div className="space-y-4">
                <Label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Creative Scenario
                </Label>
                <Select value={scenario} onValueChange={(value) => setScenario(value as ScenarioType)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Choose a creative theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {scenarios.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Color Scheme Selection */}
              <div className="space-y-4">
                <Label className="text-base font-semibold text-gray-700">Color Scheme</Label>
                <Select value={colorScheme} onValueChange={(value) => setColorScheme(value as ColorSchemeType)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Choose colors" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorSchemes.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Parameters */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold text-gray-700">Samples</Label>
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{params.samples}</span>
                  </div>
                  <Slider
                    value={[params.samples]}
                    onValueChange={(value) => updateParam("samples", value)}
                    min={50}
                    max={500}
                    step={10}
                    className="w-full"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold text-gray-700">Noise</Label>
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{params.noise.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[params.noise]}
                    onValueChange={(value) => updateParam("noise", value)}
                    min={0}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold text-gray-700">Complexity</Label>
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {params.complexity.toFixed(1)}
                    </span>
                  </div>
                  <Slider
                    value={[params.complexity]}
                    onValueChange={(value) => updateParam("complexity", value)}
                    min={0.5}
                    max={5}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold text-gray-700">Symmetry</Label>
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {params.symmetry.toFixed(2)}
                    </span>
                  </div>
                  <Slider
                    value={[params.symmetry]}
                    onValueChange={(value) => updateParam("symmetry", value)}
                    min={0}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold text-gray-700">Flow Intensity</Label>
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {params.flowIntensity.toFixed(1)}
                    </span>
                  </div>
                  <Slider
                    value={[params.flowIntensity]}
                    onValueChange={(value) => updateParam("flowIntensity", value)}
                    min={0.1}
                    max={3}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold text-gray-700">Scenario Blend</Label>
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{params.scenarioThreshold}%</span>
                  </div>
                  <Slider
                    value={[params.scenarioThreshold]}
                    onValueChange={(value) => updateParam("scenarioThreshold", value)}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold text-gray-700">Seed</Label>
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{seed}</span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSeed(Math.floor(Math.random() * 100000))}
                    className="w-full"
                  >
                    <Shuffle className="h-4 w-4 mr-2" />
                    New Seed
                  </Button>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Action Buttons */}
              <div className="space-y-4">
                <Button
                  onClick={generateArt}
                  className="w-full h-14 text-base font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating..." : "Generate Art"}
                </Button>

                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" onClick={randomizeParams} className="h-12 font-medium bg-transparent">
                    <Shuffle className="h-4 w-4 mr-2" />
                    Crazy Random
                  </Button>
                  <Button variant="outline" onClick={saveArtwork} className="h-12 font-medium bg-transparent">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>

                <Button
                  variant="outline"
                  onClick={generateTestArtwork}
                  className="w-full h-12 font-medium bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Test Gallery
                </Button>

                <Button variant="outline" onClick={downloadArtwork} className="w-full h-12 font-medium bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Presets */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="text-lg font-semibold">Crazy Presets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {PRESETS.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    onClick={() => applyPreset(preset)}
                    className="justify-start h-16 text-left font-medium hover:bg-gray-50 p-4"
                  >
                    <div className="flex flex-col items-start w-full">
                      <div className="flex items-center gap-3 w-full">
                        <Badge
                          variant="secondary"
                          className="w-6 h-6 rounded-full p-0 flex items-center justify-center border-2"
                          style={{
                            backgroundColor: preset.colors.stroke + "15",
                            borderColor: preset.colors.stroke,
                            color: preset.colors.stroke,
                          }}
                        >
                          ●
                        </Badge>
                        <span className="text-sm font-semibold">{preset.name}</span>
                      </div>
                      <span className="text-xs text-gray-500 ml-9">
                        {preset.dataset} + {preset.scenario}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Canvas Area - Takes up 8 columns on large screens */}
        <div className="lg:col-span-8">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm h-full">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl font-semibold">Generated Artwork</CardTitle>
            </CardHeader>
            <CardContent className="h-full">
              <div className="flex justify-center items-center min-h-[600px] p-4">
                <div
                  className="border-4 border-gray-200 rounded-2xl overflow-hidden shadow-2xl bg-white"
                  style={{ minWidth: "800px", minHeight: "600px", maxWidth: "100%" }}
                  dangerouslySetInnerHTML={{
                    __html: currentSvg || svgContent,
                  }}
                />
              </div>

              <div className="mt-8 flex justify-between items-center text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="font-medium">
                    Dataset: <span className="font-mono">{dataset}</span>
                  </span>
                  <span className="font-medium">
                    Scenario: <span className="font-mono">{scenario}</span>
                  </span>
                  <span className="font-medium">
                    Points: <span className="font-mono">{Array.isArray(generatedData) ? generatedData.length : 0}</span>
                  </span>
                  <span className="font-medium">
                    Mode: <span className="font-mono">{generationMode === "ai" ? "AI Enhanced" : "Mathematical"}</span>
                  </span>
                  <span className="font-medium">
                    Seed: <span className="font-mono">{seed}</span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
