"use client"

import { useState, useCallback, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { CULTURAL_DATASETS, COLOR_SCHEMES, getScenarios } from "@/lib/ai-prompt"
import { supabase } from "@/lib/supabase"
import { RefreshCw, Sparkles, Eye, ArrowUp, CheckCircle } from "lucide-react"

interface GenerationResult {
  standard?: string
  dome?: string
  panorama360?: string
  cubemap?: string
}

interface AspectRatio {
  id: string
  name: string
  width: number
  height: number
  ratio: number
  generation_type: string
}

const FlowArtGenerator = () => {
  const { toast } = useToast()

  const [dataset, setDataset] = useState("vietnamese")
  const [scenario, setScenario] = useState("lotus-symbolism")
  const [colorScheme, setColorScheme] = useState("metallic")
  const [customPrompt, setCustomPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [results, setResults] = useState<GenerationResult>({})
  const [activeTab, setActiveTab] = useState<keyof GenerationResult>("standard")
  const [aspectRatios, setAspectRatios] = useState<AspectRatio[]>([])

  const [selectedAspectRatio, setSelectedAspectRatio] = useState<{
    standard?: string
    dome?: string
    "360"?: string
    cubemap?: string
  }>({})

  const [selectedModel, setSelectedModel] = useState<{
    standard: "flux" | "nvidia-sana"
  }>({
    standard: "nvidia-sana", // Default to NVIDIA SANA for best resolution
  })

  const [domeEffect, setDomeEffect] = useState<"fisheye" | "little-planet" | "tunnel-up">("fisheye")

  const [generateTypes, setGenerateTypes] = useState({
    standard: true,
    dome: true,
    panorama360: true,
    cubemap: true,
  })

  const [frameless, setFrameless] = useState(false)

  const [technicalParams, setTechnicalParams] = useState({
    seed: Math.floor(Math.random() * 10000),
    numSamples: 4000,
    noiseScale: 0.08,
    timeStep: 0.02,
  })

  const [isEnhancing, setIsEnhancing] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [previewPrompt, setPreviewPrompt] = useState("")

  const scenarioEntries = Object.entries(getScenarios(dataset))

  const loadGenerationPreferences = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase.from("generation_preferences").select("*").eq("user_id", user.id).single()

      if (error && error.code !== "PGRST116") {
        console.error("Error loading generation preferences:", error)
        return
      }

      if (data) {
        setGenerateTypes({
          standard: data.generate_standard,
          dome: data.generate_dome,
          panorama360: data.generate_360,
          cubemap: data.generate_cubemap || true,
        })
      }
    } catch (error) {
      console.error("Error loading generation preferences:", error)
    }
  }, [])

  const saveGenerationPreferences = useCallback(async (preferences: typeof generateTypes) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("generation_preferences").upsert({
        user_id: user.id,
        generate_standard: preferences.standard,
        generate_dome: preferences.dome,
        generate_360: preferences.panorama360,
        generate_cubemap: preferences.cubemap,
      })

      if (error) {
        console.error("Error saving generation preferences:", error)
      }
    } catch (error) {
      console.error("Error saving generation preferences:", error)
    }
  }, [])

  const updateGenerateTypes = useCallback(
    (updater: (prev: typeof generateTypes) => typeof generateTypes) => {
      setGenerateTypes((prev) => {
        const newTypes = updater(prev)
        saveGenerationPreferences(newTypes)
        return newTypes
      })
    },
    [saveGenerationPreferences],
  )

  const fetchAspectRatios = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("aspect_ratios").select("*").order("name")

      if (error) {
        console.error("Error fetching aspect ratios:", error)
        return
      }

      const sanaNvidiaRatios: AspectRatio[] = [
        { id: "sana-4k-2-1", name: "SANA 4K 2:1", width: 4096, height: 2048, ratio: 2.0, generation_type: "360" },
        {
          id: "sana-4k-square",
          name: "SANA 4K Square",
          width: 4096,
          height: 4096,
          ratio: 1.0,
          generation_type: "standard",
        },
        {
          id: "flux-4mp-square",
          name: "FLUX 4MP Square",
          width: 2048,
          height: 2048,
          ratio: 1.0,
          generation_type: "standard",
        },
        { id: "flux-21-9", name: "FLUX 21:9", width: 2688, height: 1536, ratio: 1.78, generation_type: "360" },
        { id: "sana-4k-4-3", name: "SANA 4K 4:3", width: 2304, height: 1792, ratio: 1.33, generation_type: "cubemap" },
        { id: "dome-fisheye", name: "Dome Fisheye", width: 2048, height: 2048, ratio: 1.0, generation_type: "dome" },
      ]

      const allRatios = [...(data || []), ...sanaNvidiaRatios]
      setAspectRatios(allRatios)

      // Set model-specific defaults
      setSelectedAspectRatio({
        standard: "sana-4k-square", // NVIDIA SANA 4K by default
        dome: "dome-fisheye", // Fixed dome resolution
        "360": "sana-4k-2-1", // Closest to 2:1 ratio
        cubemap: "sana-4k-4-3", // 4:3 for cubemap
      })
    } catch (error) {
      console.error("Error fetching aspect ratios:", error)
    }
  }, [])

  const handleDatasetChange = (newDataset: string) => {
    setDataset(newDataset)
    const scenarios = getScenarios(newDataset)
    const firstScenario = Object.keys(scenarios)[0]
    if (firstScenario) {
      setScenario(firstScenario)
    }
  }

  const randomizeDataset = () => {
    const datasets = Object.keys(CULTURAL_DATASETS)
    const randomDataset = datasets[Math.floor(Math.random() * datasets.length)]
    handleDatasetChange(randomDataset)

    const colorSchemes = Object.keys(COLOR_SCHEMES)
    const randomColorScheme = colorSchemes[Math.floor(Math.random() * colorSchemes.length)]
    setColorScheme(randomColorScheme)
  }

  const randomizeScenario = () => {
    const scenarios = getScenarios(dataset)
    const scenarioKeys = Object.keys(scenarios)
    const randomScenario = scenarioKeys[Math.floor(Math.random() * scenarioKeys.length)]
    setScenario(randomScenario)
  }

  const randomizeColorScheme = () => {
    const colorSchemes = Object.keys(COLOR_SCHEMES)
    const randomColorScheme = colorSchemes[Math.floor(Math.random() * colorSchemes.length)]
    setColorScheme(randomColorScheme)
  }

  const randomizeTechnicalParams = () => {
    setTechnicalParams({
      seed: Math.floor(Math.random() * 10000),
      numSamples: Math.floor(Math.random() * 6000) + 2000,
      noiseScale: Math.random() * 0.15 + 0.05,
      timeStep: Math.random() * 0.08 + 0.01,
    })
  }

  const randomizeAll = () => {
    randomizeDataset()
    randomizeColorScheme()
    randomizeTechnicalParams()
    toast({
      title: "All Parameters Randomized",
      description: "Dataset, scenario, color scheme, and technical parameters randomized",
    })
  }

  const generateArt = async () => {
    if (!dataset || !scenario) {
      toast({
        title: "Missing Information",
        description: "Please select a dataset and scenario.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setResults({})

    try {
      const response = await fetch("/api/generate-ai-art", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dataset,
          scenario,
          colorScheme,
          customPrompt,
          generateTypes,
          selectedAspectRatio,
          selectedModel,
          domeEffect,
          frameless,
          technicalParams,
          generateAll: false,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate art")
      }

      const data = await response.json()
      console.log("[v0] API response received:", data)

      const newResults: GenerationResult = {}
      if (data.standard) newResults.standard = data.standard
      if (data.dome) newResults.dome = data.dome
      if (data.panorama360) newResults.panorama360 = data.panorama360
      if (data.cubemap) newResults.cubemap = data.cubemap

      console.log("[v0] Extracted results:", newResults)
      setResults(newResults)

      // Set active tab to first available result
      const availableTabs = Object.keys(newResults) as (keyof GenerationResult)[]
      if (availableTabs.length > 0) {
        setActiveTab(availableTabs[0])
        console.log("[v0] Set active tab to:", availableTabs[0])
      }

      toast({
        title: "Art Generated Successfully",
        description: "Your AI art has been generated!",
      })
    } catch (error) {
      console.error("Error generating art:", error)
      toast({
        title: "Generation Failed",
        description: "Failed to generate art. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const enhancePrompt = async () => {
    if (!customPrompt || !customPrompt.trim()) {
      toast({
        title: "No Prompt",
        description: "Please enter a prompt to enhance.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalPrompt: customPrompt || "",
          dataset,
          scenario,
          colorScheme,
          technicalParams,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to enhance prompt")
      }

      const data = await response.json()
      setCustomPrompt(data.enhancedPrompt || "")

      toast({
        title: "Prompt Enhanced",
        description: "Your prompt has been enhanced with AI assistance.",
      })
    } catch (error) {
      console.error("Error enhancing prompt:", error)
      toast({
        title: "Enhancement Failed",
        description: "Failed to enhance prompt. Please try again.",
        variant: "destructive",
      })
    }
  }

  const previewEnhancedPrompt = async () => {
    setIsPreviewing(true)
    try {
      const response = await fetch("/api/preview-ai-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dataset,
          scenario,
          colorScheme,
          customPrompt,
          technicalParams,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to preview prompt")
      }

      const data = await response.json()
      setPreviewPrompt(data.prompt)

      toast({
        title: "Prompt Preview Generated",
        description: "Preview of enhanced prompt is ready",
      })
    } catch (error) {
      console.error("Error previewing prompt:", error)
      toast({
        title: "Preview Failed",
        description: "Failed to generate prompt preview",
        variant: "destructive",
      })
    } finally {
      setIsPreviewing(false)
    }
  }

  const applyGodlevelNeuralia = async () => {
    if (!results[activeTab as keyof GenerationResult]) {
      toast({
        title: "No Image Selected",
        description: "Please generate an image first",
        variant: "destructive",
      })
      return
    }

    setIsEnhancing(true)
    try {
      const response = await fetch("/api/generate-godlevel-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dataset,
          scenario,
          colorScheme,
          customPrompt,
          imageType: activeTab,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to apply godlevel neuralia")
      }

      const data = await response.json()
      setCustomPrompt(data.enhancedPrompt)

      toast({
        title: "Godlevel Neuralia Applied",
        description: "Advanced neuralia enhancements applied to prompt",
      })
    } catch (error) {
      console.error("Error applying godlevel neuralia:", error)
      toast({
        title: "Enhancement Failed",
        description: "Failed to apply godlevel neuralia",
        variant: "destructive",
      })
    } finally {
      setIsEnhancing(false)
    }
  }

  const returnToPrompt = () => {
    setCustomPrompt("")
    setPreviewPrompt("")
    toast({
      title: "Returned to Prompt",
      description: "Cleared custom prompt and preview",
    })
  }

  useEffect(() => {
    loadGenerationPreferences()
    fetchAspectRatios()
  }, [loadGenerationPreferences, fetchAspectRatios])

  useEffect(() => {
    const availableTypes = Object.entries(generateTypes)
      .filter(([_, enabled]) => enabled)
      .map(([type]) => type)

    if (availableTypes.length > 0 && !availableTypes.includes(activeTab)) {
      setActiveTab(availableTypes[0] as keyof GenerationResult)
    }
  }, [generateTypes, activeTab])

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">FlowSketch Art Generator</h1>
          <p className="text-muted-foreground">
            Create stunning AI art with cultural datasets and advanced generation techniques
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Controls */}
          <div className="space-y-6">
            {/* Cultural Dataset Selection */}
            <div className="bg-card rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Cultural Dataset</h3>
                <button
                  onClick={randomizeDataset}
                  className="p-2 rounded-md hover:bg-muted transition-colors"
                  title="Randomize dataset and scenario"
                >
                  🎲
                </button>
              </div>

              <select
                value={dataset}
                onChange={(e) => handleDatasetChange(e.target.value)}
                className="w-full p-3 rounded-md border bg-background"
              >
                {Object.entries(CULTURAL_DATASETS).map(([key, data]) => (
                  <option key={key} value={key}>
                    {data.name}
                  </option>
                ))}
              </select>

              {/* Scenario Selection */}
              {scenarioEntries.length > 0 && (
                <div className="flex gap-2">
                  <select
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value)}
                    className="flex-1 p-3 rounded-md border bg-background"
                  >
                    {scenarioEntries.map(([key, data]) => (
                      <option key={key} value={key}>
                        {data.name || key}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={randomizeScenario}
                    className="p-3 rounded-md hover:bg-muted transition-colors"
                    title="Randomize scenario"
                  >
                    🎲
                  </button>
                </div>
              )}

              {/* Color Scheme Selection */}
              <div className="flex gap-2">
                <select
                  value={colorScheme}
                  onChange={(e) => setColorScheme(e.target.value)}
                  className="flex-1 p-3 rounded-md border bg-background"
                >
                  {Object.entries(COLOR_SCHEMES).map(([key, data]) => (
                    <option key={key} value={key}>
                      {key.charAt(0).toUpperCase() + key.slice(1)} - {data}
                    </option>
                  ))}
                </select>
                <button
                  onClick={randomizeColorScheme}
                  className="p-3 rounded-md hover:bg-muted transition-colors"
                  title="Randomize color scheme"
                >
                  🎲
                </button>
              </div>
            </div>

            {/* Technical Parameters */}
            <div className="bg-card rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Technical Parameters</h3>
                <button
                  onClick={randomizeTechnicalParams}
                  className="p-2 rounded-md hover:bg-muted transition-colors"
                  title="Randomize technical parameters"
                >
                  🎲
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Seed: {technicalParams.seed}</label>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={technicalParams.seed}
                    onChange={(e) => setTechnicalParams((prev) => ({ ...prev, seed: Number.parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Samples: {technicalParams.numSamples}</label>
                  <input
                    type="range"
                    min="1000"
                    max="8000"
                    step="100"
                    value={technicalParams.numSamples}
                    onChange={(e) =>
                      setTechnicalParams((prev) => ({ ...prev, numSamples: Number.parseInt(e.target.value) }))
                    }
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Noise: {technicalParams.noiseScale.toFixed(3)}</label>
                  <input
                    type="range"
                    min="0.01"
                    max="0.2"
                    step="0.001"
                    value={technicalParams.noiseScale}
                    onChange={(e) =>
                      setTechnicalParams((prev) => ({ ...prev, noiseScale: Number.parseFloat(e.target.value) }))
                    }
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Step: {technicalParams.timeStep.toFixed(3)}</label>
                  <input
                    type="range"
                    min="0.005"
                    max="0.1"
                    step="0.001"
                    value={technicalParams.timeStep}
                    onChange={(e) =>
                      setTechnicalParams((prev) => ({ ...prev, timeStep: Number.parseFloat(e.target.value) }))
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Custom Prompt */}
            <div className="bg-card rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold">Custom Prompt</h3>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Enter your custom prompt here..."
                className="w-full p-3 rounded-md border bg-background min-h-[100px] resize-vertical"
              />
              <div className="flex gap-2">
                <button
                  onClick={enhancePrompt}
                  disabled={!customPrompt || !customPrompt.trim()}
                  className="flex-1 bg-secondary text-secondary-foreground py-2 px-4 rounded-md hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Enhance Prompt
                </button>
                <button
                  onClick={previewEnhancedPrompt}
                  disabled={isPreviewing}
                  className="flex-1 bg-secondary text-secondary-foreground py-2 px-4 rounded-md hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  {isPreviewing ? "Previewing..." : "Preview"}
                </button>
              </div>

              {/* Preview Prompt Display */}
              {previewPrompt && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <h4 className="text-sm font-semibold mb-2">Preview:</h4>
                  <p className="text-sm text-muted-foreground">{previewPrompt}</p>
                </div>
              )}
            </div>

            {/* Generation Types */}
            <div className="bg-card rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold">Generation Types</h3>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={generateTypes.standard}
                    onChange={(e) => updateGenerateTypes((prev) => ({ ...prev, standard: e.target.checked }))}
                  />
                  <span>Standard</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={generateTypes.dome}
                    onChange={(e) => updateGenerateTypes((prev) => ({ ...prev, dome: e.target.checked }))}
                  />
                  <span>180° Dome</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={generateTypes.panorama360}
                    onChange={(e) => updateGenerateTypes((prev) => ({ ...prev, panorama360: e.target.checked }))}
                  />
                  <span>360° Equirectangular</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={generateTypes.cubemap}
                    onChange={(e) => updateGenerateTypes((prev) => ({ ...prev, cubemap: e.target.checked }))}
                  />
                  <span>Cubemap</span>
                </label>
              </div>

              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={frameless} onChange={(e) => setFrameless(e.target.checked)} />
                <span>Frameless (no enhancement wrappers)</span>
              </label>
            </div>

            {/* Model and Effect Selection */}
            <div className="bg-card rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold">Model & Effects</h3>

              {generateTypes.standard && (
                <div>
                  <label className="block text-sm font-medium mb-2">Standard Model</label>
                  <select
                    value={selectedModel.standard}
                    onChange={(e) =>
                      setSelectedModel((prev) => ({ ...prev, standard: e.target.value as "flux" | "nvidia-sana" }))
                    }
                    className="w-full p-2 rounded-md border bg-background text-sm"
                  >
                    <option value="nvidia-sana">NVIDIA SANA (4K - Best Resolution)</option>
                    <option value="flux">FLUX 1.1 Pro Ultra (4MP)</option>
                  </select>
                </div>
              )}

              {generateTypes.dome && (
                <div>
                  <label className="block text-sm font-medium mb-2">180° Dome Effect</label>
                  <select
                    value={domeEffect}
                    onChange={(e) => setDomeEffect(e.target.value as "fisheye" | "little-planet" | "tunnel-up")}
                    className="w-full p-2 rounded-md border bg-background text-sm"
                  >
                    <option value="fisheye">Fisheye Projection</option>
                    <option value="little-planet">Little Planet</option>
                    <option value="tunnel-up">Tunnel Up</option>
                  </select>
                </div>
              )}

              {generateTypes.panorama360 && (
                <div>
                  <label className="block text-sm font-medium mb-2">360° Equirectangular</label>
                  <div className="p-2 bg-muted rounded-md text-sm text-muted-foreground">
                    Locked to closest 2:1 ratio (4096×2048) for optimal equirectangular format
                  </div>
                </div>
              )}
            </div>

            <div className="bg-card rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold">Resolution Settings</h3>

              {generateTypes.standard && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Standard Resolution ({selectedModel.standard === "nvidia-sana" ? "NVIDIA SANA 4K" : "FLUX 4MP"})
                  </label>
                  <select
                    value={selectedAspectRatio.standard || ""}
                    onChange={(e) => setSelectedAspectRatio((prev) => ({ ...prev, standard: e.target.value }))}
                    className="w-full p-2 rounded-md border bg-background text-sm"
                  >
                    {selectedModel.standard === "nvidia-sana" ? (
                      <>
                        <option value="sana-4k-square">4096×4096 (Square - Best Quality)</option>
                        <option value="sana-4k-16-9">2688×1536 (16:9)</option>
                        <option value="sana-4k-4-3">2304×1792 (4:3)</option>
                      </>
                    ) : (
                      <>
                        <option value="flux-4mp-square">2048×2048 (Square - 4MP)</option>
                        <option value="flux-16-9">2688×1536 (16:9)</option>
                        <option value="flux-4-3">2304×1792 (4:3)</option>
                      </>
                    )}
                  </select>
                </div>
              )}

              {generateTypes.cubemap && (
                <div>
                  <label className="block text-sm font-medium mb-2">Cubemap Resolution</label>
                  <select
                    value={selectedAspectRatio.cubemap || ""}
                    onChange={(e) => setSelectedAspectRatio((prev) => ({ ...prev, cubemap: e.target.value }))}
                    className="w-full p-2 rounded-md border bg-background text-sm"
                  >
                    <option value="sana-4k-4-3">2304×1792 (4:3 - Best for Environment Mapping)</option>
                    <option value="cubemap-hd">1600×1200 (4:3 HD)</option>
                    <option value="cubemap-standard">1280×960 (4:3 Standard)</option>
                  </select>
                </div>
              )}

              {generateTypes.dome && (
                <div>
                  <label className="block text-sm font-medium mb-2">180° Dome Resolution</label>
                  <div className="p-2 bg-muted rounded-md text-sm text-muted-foreground">
                    Fixed at 2048×2048 (Best resolution for dome projection)
                  </div>
                </div>
              )}
            </div>

            {/* Randomize All Button */}
            <button
              onClick={randomizeAll}
              className="w-full bg-accent text-accent-foreground py-3 px-6 rounded-md hover:bg-accent/90 transition-colors text-lg font-semibold flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Randomize All
            </button>

            {/* Generate Button */}
            <button
              onClick={generateArt}
              disabled={isGenerating}
              className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
            >
              {isGenerating ? "Generating..." : "Generate Art"}
            </button>
          </div>

          {/* Right Panel - Results */}
          <div className="space-y-6">
            <div className="bg-card rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Generated Images</h3>

              {/* Tabs */}
              <div className="flex space-x-1 mb-4 bg-muted p-1 rounded-lg">
                {generateTypes.standard && (
                  <button
                    onClick={() => setActiveTab("standard")}
                    className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                      activeTab === "standard"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Standard
                  </button>
                )}
                {generateTypes.dome && (
                  <button
                    onClick={() => setActiveTab("dome")}
                    className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                      activeTab === "dome"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Dome
                  </button>
                )}
                {generateTypes.panorama360 && (
                  <button
                    onClick={() => setActiveTab("panorama360")}
                    className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                      activeTab === "panorama360"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    360°
                  </button>
                )}
                {generateTypes.cubemap && (
                  <button
                    onClick={() => setActiveTab("cubemap")}
                    className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                      activeTab === "cubemap"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Cubemap
                  </button>
                )}
              </div>

              {/* Image Display */}
              <div className="min-h-[400px] flex items-center justify-center bg-muted rounded-lg">
                {isGenerating ? (
                  <div className="text-center space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground">Generating images...</p>
                  </div>
                ) : results[activeTab as keyof GenerationResult] ? (
                  <div className="w-full space-y-4">
                    {console.log(
                      "[v0] Displaying image for tab:",
                      activeTab,
                      "URL:",
                      results[activeTab as keyof GenerationResult],
                    )}
                    <img
                      src={results[activeTab as keyof GenerationResult] || "/placeholder.svg"}
                      alt={`Generated ${activeTab} art`}
                      className="w-full h-auto rounded-lg"
                      onLoad={() => console.log("[v0] Image loaded successfully for tab:", activeTab)}
                      onError={(e) => {
                        console.error("[v0] Image failed to load for tab:", activeTab, "Error:", e)
                        console.error("[v0] Image URL:", results[activeTab as keyof GenerationResult])
                      }}
                    />
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={enhancePrompt}
                        className="flex-1 bg-secondary text-secondary-foreground py-2 px-4 rounded-md hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
                      >
                        <ArrowUp className="w-4 h-4" />
                        Enhance
                      </button>
                      <button
                        onClick={applyGodlevelNeuralia}
                        disabled={isEnhancing}
                        className="flex-1 bg-secondary text-secondary-foreground py-2 px-4 rounded-md hover:bg-secondary/80 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        {isEnhancing ? "Applying..." : "Godlevel Neuralia"}
                      </button>
                      <button
                        onClick={() => setCustomPrompt(previewPrompt || customPrompt)}
                        className="flex-1 bg-secondary text-secondary-foreground py-2 px-4 rounded-md hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Apply
                      </button>
                      <button
                        onClick={returnToPrompt}
                        className="flex-1 bg-secondary text-secondary-foreground py-2 px-4 rounded-md hover:bg-secondary/80 transition-colors"
                      >
                        Return to Prompt
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    {console.log("[v0] No image for tab:", activeTab, "Results object:", results)}
                    <p className="text-muted-foreground">No {activeTab} image generated yet</p>
                    <p className="text-sm text-muted-foreground">Click "Generate Art" to create images</p>
                    {/* Debug info */}
                    <div className="text-xs text-muted-foreground mt-2">
                      <p>Active tab: {activeTab}</p>
                      <p>Available results: {Object.keys(results).join(", ") || "none"}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { FlowArtGenerator }
export default FlowArtGenerator
