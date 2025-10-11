"use client"

import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Alert } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import {
  CULTURAL_DATASETS,
  COLOR_SCHEMES,
  buildPrompt,
  getScenarios,
  DATASET_METADATA,
  getDatasetsByCategory,
  getAllTags,
} from "@/lib/ai-prompt"

import { supabase } from "@/lib/supabase"

// Import REPLICATE_MODELS
import { REPLICATE_MODELS } from "@/lib/replicate-models"

interface GenerationResult {
  standard?: string
  dome?: string
  panorama360?: string
  errors: string[]
}

interface GenerationProgress {
  standard: "idle" | "generating" | "completed" | "failed"
  dome: "idle" | "generating" | "completed" | "failed"
  panorama360: "idle" | "generating" | "completed" | "failed"
}

interface PromptEnhancement {
  originalPrompt: string
  enhancedPrompt: string
  statistics: {
    original: { characters: number; words: number }
    enhanced: { characters: number; words: number }
    improvement: { characters: number; words: number; percentage: number }
    maxLength: number
    withinLimit: boolean
  }
  variationType: string
  generationType: string
  enhancementMethod: string
}

export function FlowArtGenerator() {
  // Core generation parameters
  const [dataset, setDataset] = useState("vietnamese")
  const [scenario, setScenario] = useState("trung-sisters")
  const [colorScheme, setColorScheme] = useState("metallic")
  const [seed, setSeed] = useState(1234)
  const [numSamples, setNumSamples] = useState(4000)
  const [noiseScale, setNoiseScale] = useState(0.08)
  const [customPrompt, setCustomPrompt] = useState("")
  const [negativePrompt, setNegativePrompt] = useState("")
  const [showAdvanced, setShowAdvanced] = useState(false)

  const [provider, setProvider] = useState<"openai" | "replicate">("openai")
  const [replicateModel, setReplicateModel] = useState("black-forest-labs/flux-1.1-pro-ultra")

  // 360° and dome projection settings
  const [panoramic360, setPanoramic360] = useState(false)
  const [panoramaFormat, setPanoramaFormat] = useState("equirectangular")
  const [projectionType, setProjectionType] = useState("fisheye")

  // Prompt enhancement settings
  const [variationType, setVariationType] = useState("moderate")
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false)
  const [currentPrompt, setCurrentPrompt] = useState("")
  const [editablePrompt, setEditablePrompt] = useState("")
  const [promptEnhancement, setPromptEnhancement] = useState<PromptEnhancement | null>(null)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [isGeneratingGodlevel, setIsGeneratingGodlevel] = useState(false)

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress>({
    standard: "idle",
    dome: "idle",
    panorama360: "idle",
  })
  const [results, setResults] = useState<GenerationResult>({ errors: [] })
  const [activeTab, setActiveTab] = useState("standard")

  // Debug state
  const [apiKeyStatus, setApiKeyStatus] = useState<any>(null)
  const [isValidatingKey, setIsValidatingKey] = useState(false)

  // Aspect ratio state
  const [aspectRatios, setAspectRatios] = useState<any[]>([])
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<{
    standard?: string
    dome?: string
    "360"?: string
  }>({})

  // Refs for cancellation
  const abortControllerRef = useRef<AbortController | null>(null)

  // Get available scenarios for current dataset - with null safety
  const availableScenarios = getScenarios(dataset) || {}
  const scenarioEntries = Object.entries(availableScenarios)

  // Toast hook
  const { toast } = useToast()

  const [generateTypes, setGenerateTypes] = useState({
    standard: true,
    dome: true,
    panorama360: true,
  })

  const [frameless, setFrameless] = useState(false)

  const [datasetCategory, setDatasetCategory] = useState<"all" | "scientific" | "commercial">("all")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [datasetSearchQuery, setDatasetSearchQuery] = useState("")

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
      })

      if (error) {
        console.error("Error saving generation preferences:", error)
      }
    } catch (error) {
      console.error("Error saving generation preferences:", error)
    }
  }, [])

  useEffect(() => {
    loadGenerationPreferences()
  }, [loadGenerationPreferences])

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

  const refreshSite = useCallback(() => {
    window.location.reload()
  }, [])

  // Reset scenario when dataset changes
  const handleDatasetChange = useCallback((newDataset: string) => {
    setDataset(newDataset)
    const scenarios = getScenarios(newDataset) || {}
    const firstScenario = Object.keys(scenarios)[0]
    if (firstScenario) {
      setScenario(firstScenario)
    }
  }, [])

  // Validate OpenAI API Key
  const validateApiKey = useCallback(async () => {
    setIsValidatingKey(true)
    try {
      console.log("🔍 Validating OpenAI API key...")
      const response = await fetch("/api/validate-openai-key")
      const result = await response.json()
      setApiKeyStatus(result)

      if (result.success) {
        toast({ title: "✅ OpenAI API key is valid and working!", variant: "success" })
      } else {
        toast({ title: `❌ API Key Error: ${result.error}`, variant: "error" })
      }
    } catch (error: any) {
      console.error("API key validation failed:", error)
      toast({ title: "Failed to validate API key", variant: "error" })
      setApiKeyStatus({
        success: false,
        error: "Validation request failed",
      })
    } finally {
      setIsValidatingKey(false)
    }
  }, [toast])

  // Generate random seed
  const randomizeSeed = useCallback(() => {
    setSeed(Math.floor(Math.random() * 10000))
  }, [])

  const randomizeDataset = useCallback(() => {
    const datasetKeys = Object.keys(CULTURAL_DATASETS)
    const randomDataset = datasetKeys[Math.floor(Math.random() * datasetKeys.length)]
    handleDatasetChange(randomDataset)

    // Also randomize color scheme
    const colorKeys = Object.keys(COLOR_SCHEMES)
    const randomColor = colorKeys[Math.floor(Math.random() * colorKeys.length)]
    setColorScheme(randomColor)

    // Randomize scenario after dataset change
    setTimeout(() => {
      const scenarios = getScenarios(randomDataset) || {}
      const scenarioKeys = Object.keys(scenarios)
      if (scenarioKeys.length > 0) {
        const randomScenario = scenarioKeys[Math.floor(Math.random() * scenarioKeys.length)]
        setScenario(randomScenario)
      }
    }, 0)
  }, [handleDatasetChange, setColorScheme, setScenario])

  const randomizeTechnicalParams = useCallback(() => {
    setSeed(Math.floor(Math.random() * 10000))
    setNumSamples(Math.floor(Math.random() * 7001) + 1000) // 1000-8000
    setNoiseScale(Math.random() * 0.19 + 0.01) // 0.01-0.2
  }, [setSeed, setNumSamples, setNoiseScale])

  const randomizeAll = useCallback(() => {
    // Randomize dataset
    const datasetKeys = Object.keys(CULTURAL_DATASETS)
    const randomDataset = datasetKeys[Math.floor(Math.random() * datasetKeys.length)]
    handleDatasetChange(randomDataset)

    // Randomize color scheme
    const colorKeys = Object.keys(COLOR_SCHEMES)
    const randomColor = colorKeys[Math.floor(Math.random() * colorKeys.length)]
    setColorScheme(randomColor)

    // Randomize scenario after dataset change
    setTimeout(() => {
      const currentDataset = CULTURAL_DATASETS[randomDataset]
      if (currentDataset && currentDataset.scenarios) {
        const scenarioKeys = Object.keys(currentDataset.scenarios)
        const randomScenario = scenarioKeys[Math.floor(Math.random() * scenarioKeys.length)]
        setScenario(randomScenario)
      }
    }, 100)

    // Randomize technical parameters
    setSeed(Math.floor(Math.random() * 10000))
    setNumSamples(Math.floor(Math.random() * 7001) + 1000) // 1000-8000
    setNoiseScale(Math.random() * 0.19 + 0.01) // 0.01-0.2
  }, [handleDatasetChange, setColorScheme, setScenario, setSeed, setNumSamples, setNoiseScale])

  const previewPrompt = useCallback(async () => {
    setIsPromptDialogOpen(true)

    try {
      // Build base prompt with null safety
      const basePrompt = buildPrompt({
        dataset: dataset || "vietnamese",
        scenario: scenario || "trung-sisters",
        colorScheme: colorScheme || "metallic",
        seed: seed || 1234,
        numSamples: numSamples || 4000,
        noiseScale: noiseScale || 0.08,
        customPrompt: customPrompt || "",
        negativePrompt: negativePrompt || "",
        panoramic360: panoramic360 || false,
        panoramaFormat: panoramaFormat || "equirectangular",
        projectionType: projectionType || "fisheye",
      })

      if (!basePrompt || basePrompt.length === 0) {
        throw new Error("Failed to build base prompt")
      }

      setCurrentPrompt(basePrompt)
      setEditablePrompt(basePrompt)
      setPromptEnhancement(null)
    } catch (error: any) {
      console.error("Preview error:", error)
      toast({ title: `Preview failed: ${error.message || "Unknown error"}`, variant: "error" })
    }
  }, [
    dataset,
    scenario,
    colorScheme,
    seed,
    numSamples,
    noiseScale,
    customPrompt,
    negativePrompt,
    panoramic360,
    panoramaFormat,
    projectionType,
    toast,
    setCurrentPrompt,
    setEditablePrompt,
    setPromptEnhancement,
    setIsPromptDialogOpen,
  ])

  const enhanceCurrentPrompt = useCallback(async () => {
    if (!editablePrompt) return

    setIsEnhancing(true)

    try {
      // Enhance with ChatGPT
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalPrompt: editablePrompt,
          negativePrompt: negativePrompt || "",
          variationLevel: variationType || "moderate",
          dataset: dataset || "vietnamese",
          scenario: scenario || "trung-sisters",
        }),
      })

      if (response.ok) {
        const enhancement = await response.json()
        if (enhancement.success && enhancement.enhancedPrompt) {
          setPromptEnhancement(enhancement)
          setEditablePrompt(enhancement.enhancedPrompt)
          toast({
            title: `Prompt enhanced successfully! Added ${enhancement.statistics?.improvement?.characters || 0} characters.`,
            variant: "success",
          })
        } else {
          throw new Error(enhancement.error || "Enhancement failed")
        }
      } else {
        const error = await response.json()
        throw new Error(error.error || "Enhancement request failed")
      }
    } catch (error: any) {
      console.error("Enhancement error:", error)
      toast({ title: `Enhancement failed: ${error.message || "Unknown error"}`, variant: "error" })
    } finally {
      setIsEnhancing(false)
    }
  }, [
    editablePrompt,
    negativePrompt,
    variationType,
    dataset,
    scenario,
    toast,
    setPromptEnhancement,
    setEditablePrompt,
    setIsEnhancing,
  ])

  // Preview and enhance prompt
  const previewAndEnhancePrompt = useCallback(async () => {
    setIsEnhancing(true)
    setIsPromptDialogOpen(true)

    try {
      // Build base prompt with null safety
      const basePrompt = buildPrompt({
        dataset: dataset || "vietnamese",
        scenario: scenario || "trung-sisters",
        colorScheme: colorScheme || "metallic",
        seed: seed || 1234,
        numSamples: numSamples || 4000,
        noiseScale: noiseScale || 0.08,
        customPrompt: customPrompt || "",
        negativePrompt: negativePrompt || "",
        panoramic360: panoramic360 || false,
        panoramaFormat: panoramaFormat || "equirectangular",
        projectionType: projectionType || "fisheye",
      })

      if (!basePrompt || basePrompt.length === 0) {
        throw new Error("Failed to build base prompt")
      }

      setCurrentPrompt(basePrompt)
      setEditablePrompt(basePrompt)

      // Enhance with ChatGPT
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalPrompt: basePrompt,
          negativePrompt: negativePrompt || "",
          variationLevel: variationType || "moderate",
          dataset: dataset || "vietnamese",
          scenario: scenario || "trung-sisters",
        }),
      })

      if (response.ok) {
        const enhancement = await response.json()
        if (enhancement.success && enhancement.enhancedPrompt) {
          setPromptEnhancement(enhancement)
          setEditablePrompt(enhancement.enhancedPrompt)
          toast({
            title: `Prompt enhanced successfully! Added ${enhancement.statistics?.improvement?.characters || 0} characters.`,
            variant: "success",
          })
        } else {
          throw new Error(enhancement.error || "Enhancement failed")
        }
      } else {
        const error = await response.json()
        throw new Error(error.error || "Enhancement request failed")
      }
    } catch (error: any) {
      console.error("Enhancement error:", error)
      toast({ title: `Enhancement failed: ${error.message || "Unknown error"}`, variant: "error" })

      // Fallback to base prompt if enhancement fails
      const fallbackPrompt = buildPrompt({
        dataset: dataset || "vietnamese",
        scenario: scenario || "trung-sisters",
        colorScheme: colorScheme || "metallic",
        seed: seed || 1234,
        numSamples: numSamples || 4000,
        noiseScale: noiseScale || 0.08,
        customPrompt: customPrompt || "",
        negativePrompt: negativePrompt || "",
        panoramic360: panoramic360 || false,
        panoramaFormat: panoramaFormat || "equirectangular",
        projectionType: projectionType || "fisheye",
      })

      if (fallbackPrompt) {
        setCurrentPrompt(fallbackPrompt)
        setEditablePrompt(fallbackPrompt)
      }
    } finally {
      setIsEnhancing(false)
    }
  }, [
    dataset,
    scenario,
    colorScheme,
    seed,
    numSamples,
    noiseScale,
    customPrompt,
    negativePrompt,
    panoramic360,
    panoramaFormat,
    projectionType,
    variationType,
    toast,
    setCurrentPrompt,
    setEditablePrompt,
    setPromptEnhancement,
    setIsEnhancing,
    setIsPromptDialogOpen,
  ])

  // Apply enhanced prompt
  const applyEnhancedPrompt = useCallback(() => {
    if (editablePrompt && editablePrompt.trim()) {
      setCustomPrompt(editablePrompt.trim())
      setIsPromptDialogOpen(false)
      toast({ title: "Enhanced prompt applied successfully!", variant: "success" })
    } else {
      toast({ title: "No prompt to apply", variant: "error" })
    }
  }, [editablePrompt, setCustomPrompt, setIsPromptDialogOpen, toast])

  // Reset to original prompt
  const resetToOriginal = useCallback(() => {
    if (promptEnhancement && promptEnhancement.originalPrompt) {
      setEditablePrompt(promptEnhancement.originalPrompt)
      toast({ title: "Reset to original prompt", variant: "info" })
    }
  }, [promptEnhancement, setEditablePrompt, toast])

  // Reset to enhanced prompt
  const resetToEnhanced = useCallback(() => {
    if (promptEnhancement && promptEnhancement.enhancedPrompt) {
      setEditablePrompt(promptEnhancement.enhancedPrompt)
      toast({ title: "Reset to enhanced prompt", variant: "info" })
    }
  }, [promptEnhancement, setEditablePrompt, toast])

  const generateImages = useCallback(async () => {
    if (isGenerating) return

    const selectedTypes = Object.entries(generateTypes).filter(([_, selected]) => selected)
    if (selectedTypes.length === 0) {
      toast({
        title: "No generation types selected",
        description: "Please select at least one image type to generate.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setResults({ errors: [] })

    // Initialize progress only for selected types
    const initialProgress: GenerationProgress = {
      standard: generateTypes.standard ? "generating" : "idle",
      dome: generateTypes.dome ? "generating" : "idle",
      panorama360: generateTypes.panorama360 ? "generating" : "idle",
    }
    setGenerationProgress(initialProgress)

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      const baseParams = {
        dataset,
        scenario,
        colorScheme,
        seed,
        numSamples,
        noiseScale,
        customPrompt,
        negativePrompt,
        panoramic360,
        panoramaFormat,
        projectionType,
        provider,
        replicateModel,
      }

      let finalPrompt = ""
      if (customPrompt && customPrompt.trim()) {
        finalPrompt = customPrompt.trim()
      } else {
        finalPrompt = buildPrompt(baseParams)
      }

      if (!finalPrompt || finalPrompt.length === 0) {
        throw new Error("Failed to generate prompt")
      }

      const response = await fetch("/api/generate-ai-art", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: finalPrompt,
          negativePrompt: negativePrompt || "",
          dataset: dataset || "vietnamese",
          scenario: scenario || "trung-sisters",
          colorScheme: colorScheme || "metallic",
          seed: seed || 1234,
          numSamples: numSamples || 4000,
          noiseScale: noiseScale || 0.08,
          panoramic360: panoramic360 || false,
          panoramaFormat: panoramaFormat || "equirectangular",
          projectionType: projectionType || "fisheye",
          generateAll: false,
          provider,
          replicateModel,
          generateTypes,
          selectedAspectRatio,
          frameless,
        }),
        signal: abortController.signal,
      })

      if (response.ok) {
        const result = await response.json()

        console.log("[v0] Received API response:", result)
        console.log("[v0] Result.standard:", result.standard)
        console.log("[v0] Result.dome:", result.dome)
        console.log("[v0] Result.panorama360:", result.panorama360)
        console.log("[v0] Result.errors:", result.errors)

        // Ensure result has the expected structure
        const safeResult = {
          standard: generateTypes.standard ? result.standard || null : null,
          dome: generateTypes.dome ? result.dome || null : null,
          panorama360: generateTypes.panorama360 ? result.panorama360 || null : null,
          errors: Array.isArray(result.errors) ? result.errors : [],
        }

        console.log("[v0] Safe result after processing:")
        console.log("[v0] SafeResult.standard:", safeResult.standard)
        console.log("[v0] SafeResult.dome:", safeResult.dome)
        console.log("[v0] SafeResult.panorama360:", safeResult.panorama360)

        setResults(safeResult)

        const availableTabs = []
        if (safeResult.standard) availableTabs.push("standard")
        if (safeResult.dome) availableTabs.push("dome")
        if (safeResult.panorama360) availableTabs.push("panorama360")

        if (availableTabs.length > 0) {
          setActiveTab(availableTabs[0])
        }

        // Update progress based on results
        setGenerationProgress({
          standard: safeResult.standard ? "completed" : "failed",
          dome: safeResult.dome ? "completed" : "failed",
          panorama360: safeResult.panorama360 ? "completed" : "failed",
        })

        const successCount = [safeResult.standard, safeResult.dome, safeResult.panorama360].filter(Boolean).length
        toast({
          title: `Generated ${successCount}/${Object.values(generateTypes).filter(Boolean).length} images successfully!`,
          description: "Your artwork has been generated successfully",
          variant: "success",
        })

        safeResult.errors.forEach((error: string) => toast({ title: error, variant: "error" }))
      } else {
        // Handle non-JSON responses
        let errorMessage = "Generation failed"
        try {
          const error = await response.json()
          errorMessage = error.error || errorMessage
        } catch (parseError) {
          // If response is not JSON, use status text
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        toast({ title: "Generation cancelled", variant: "info" })
      } else {
        console.error("Generation error:", error)
        toast({
          title: "Generation Failed",
          description: error.message || "Failed to generate artwork",
          variant: "destructive",
        })
        setGenerationProgress({
          standard: "failed",
          dome: "failed",
          panorama360: "failed",
        })
      }
    } finally {
      setIsGenerating(false)
      abortControllerRef.current = null
    }
  }, [
    dataset,
    scenario,
    colorScheme,
    seed,
    numSamples,
    noiseScale,
    customPrompt,
    negativePrompt,
    panoramic360,
    panoramaFormat,
    projectionType,
    isGenerating,
    provider,
    replicateModel,
    toast,
    setResults,
    setGenerationProgress,
    setIsGenerating,
    generateTypes,
    selectedAspectRatio,
    frameless,
  ])

  // Cancel generation
  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  // Download image
  const downloadImage = useCallback(
    async (imageUrl: string, filename: string) => {
      if (!imageUrl || !filename) {
        toast({ title: "Invalid download parameters", variant: "error" })
        return
      }

      try {
        // Create unique filename with comprehensive information
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)
        const datasetName = dataset.replace(/[^a-zA-Z0-9]/g, "-")
        const scenarioName = scenario.replace(/[^a-zA-Z0-9]/g, "-")
        const providerName = provider === "replicate" ? `replicate-${replicateModel.split("/")[1]}` : "openai-dalle3"
        const colorSchemeName = colorScheme.replace(/[^a-zA-Z0-9]/g, "-")

        const uniqueFilename = `flowsketch-${datasetName}-${scenarioName}-${providerName}-${colorSchemeName}-${timestamp}.png`

        const response = await fetch(
          `/api/download-proxy?url=${encodeURIComponent(imageUrl)}&filename=${encodeURIComponent(uniqueFilename)}`,
        )
        if (response.ok) {
          const blob = await response.blob()
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = uniqueFilename
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          toast({ title: `Downloaded ${uniqueFilename}`, variant: "success" })
        } else {
          throw new Error("Download failed")
        }
      } catch (error: any) {
        console.error("Download error:", error)
        toast({ title: `Download failed: ${error.message || "Unknown error"}`, variant: "error" })
      }
    },
    [dataset, scenario, provider, replicateModel, colorScheme, toast],
  )

  const generateGodlevelPrompt = async () => {
    if (!editablePrompt) return

    console.log("[v0] Starting godlevel prompt generation")
    console.log("[v0] Original prompt:", editablePrompt)
    console.log("[v0] Dataset:", dataset, "Scenario:", scenario, "Color scheme:", colorScheme)

    setIsGeneratingGodlevel(true)
    try {
      console.log("[v0] Making API call to /api/generate-godlevel-prompt")
      const response = await fetch("/api/generate-godlevel-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalPrompt: editablePrompt,
          dataset: dataset,
          scenario: scenario,
          colorScheme: colorScheme,
          maxLength: 4000,
        }),
      })

      console.log("[v0] API response status:", response.status)
      if (!response.ok) {
        console.error("[v0] API response not ok:", response.status, response.statusText)
        throw new Error(`Failed to generate godlevel prompt: ${response.status}`)
      }

      console.log("[v0] Parsing response JSON")
      const data = await response.json()
      console.log("[v0] Received godlevel prompt:", data.godlevelPrompt?.substring(0, 100) + "...")

      setEditablePrompt(data.godlevelPrompt)

      setPromptEnhancement({
        originalPrompt: editablePrompt,
        enhancedPrompt: data.godlevelPrompt,
        statistics: {
          original: { words: editablePrompt.split(" ").length, characters: editablePrompt.length },
          enhanced: { words: data.godlevelPrompt.split(" ").length, characters: data.godlevelPrompt.length },
          improvement: {
            characters: data.godlevelPrompt.length - editablePrompt.length,
            words: data.godlevelPrompt.split(" ").length - editablePrompt.split(" ").length,
            percentage: Math.round(
              ((data.godlevelPrompt.length - editablePrompt.length) / editablePrompt.length) * 100,
            ),
          },
          maxLength: 4000,
          withinLimit: data.godlevelPrompt.length <= 4000,
        },
        variationType: "neuralia-artistic",
        generationType: "godlevel",
        enhancementMethod: "godlevel-neuralia",
      })

      console.log("[v0] Godlevel prompt generation completed successfully")
    } catch (error) {
      console.error("[v0] Error generating godlevel prompt:", error)
      alert("Failed to generate godlevel prompt. Please try again.")
    } finally {
      console.log("[v0] Setting isGeneratingGodlevel to false")
      setIsGeneratingGodlevel(false)
    }
  }

  const fetchAspectRatios = async () => {
    try {
      const { supabase } = await import("@/lib/supabase")

      const { data, error } = await supabase.from("aspect_ratios").select("*").order("name")

      if (error) {
        console.error("Error fetching aspect ratios:", error)
        return
      }

      const sanaAspectRatios = [
        {
          id: "sana-4k-2-1",
          name: "SANA 4K 2:1",
          generation_type: "360",
          width: 4096,
          height: 2048,
          ratio: 2.0,
          is_default: false,
          description: "True 2:1 equirectangular for NVIDIA SANA 4K",
        },
        {
          id: "sana-4k-square",
          name: "SANA 4K Square",
          generation_type: "standard",
          width: 4096,
          height: 4096,
          ratio: 1.0,
          is_default: false,
          description: "4K square format for NVIDIA SANA",
        },
        {
          id: "sana-4k-21-9",
          name: "SANA 4K 21:9",
          generation_type: "360",
          width: 3072,
          height: 1280,
          ratio: 2.4,
          is_default: false,
          description: "Ultra-wide 21:9 for NVIDIA SANA",
        },
        {
          id: "sana-4k-16-9",
          name: "SANA 4K 16:9",
          generation_type: "standard",
          width: 2688,
          height: 1536,
          ratio: 1.75,
          is_default: false,
          description: "Widescreen 16:9 for NVIDIA SANA",
        },
        {
          id: "sana-4k-dome",
          name: "SANA 4K Dome",
          generation_type: "dome",
          width: 4096,
          height: 4096,
          ratio: 1.0,
          is_default: false,
          description: "4K dome projection for NVIDIA SANA",
        },
      ]

      // Combine database aspect ratios with NVIDIA SANA options
      const allAspectRatios = [...(data || []), ...sanaAspectRatios]
      setAspectRatios(allAspectRatios)

      // Set default aspect ratios
      const defaults = {
        standard: allAspectRatios?.find((ar) => ar.generation_type === "standard" && ar.is_default)?.id,
        dome: allAspectRatios?.find((ar) => ar.generation_type === "dome" && ar.is_default)?.id,
        "360": allAspectRatios?.find((ar) => ar.generation_type === "360" && ar.is_default)?.id,
      }
      setSelectedAspectRatio(defaults)
    } catch (error) {
      console.error("Error loading aspect ratios:", error)
    }
  }

  const filteredDatasets = useMemo(() => {
    let datasets = Object.keys(CULTURAL_DATASETS)

    console.log("[v0] Total datasets:", datasets.length)
    console.log("[v0] Category filter:", datasetCategory)
    console.log("[v0] Selected tags:", selectedTags)
    console.log("[v0] Search query:", datasetSearchQuery)

    // Filter by category
    if (datasetCategory !== "all") {
      datasets = datasets.filter((key) => {
        const meta = DATASET_METADATA[key as keyof typeof DATASET_METADATA]
        const matches = meta?.category === datasetCategory
        console.log(`[v0] Dataset ${key}: category=${meta?.category}, matches=${matches}`)
        return matches
      })
      console.log("[v0] After category filter:", datasets.length, datasets)
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      datasets = datasets.filter((key) => {
        const meta = DATASET_METADATA[key as keyof typeof DATASET_METADATA]
        return meta && selectedTags.some((tag) => meta.tags.includes(tag))
      })
      console.log("[v0] After tag filter:", datasets.length)
    }

    // Filter by search query
    if (datasetSearchQuery) {
      const query = datasetSearchQuery.toLowerCase()
      datasets = datasets.filter((key) => {
        const meta = DATASET_METADATA[key as keyof typeof DATASET_METADATA]
        const datasetInfo = CULTURAL_DATASETS[key]
        return (
          meta?.displayName.toLowerCase().includes(query) ||
          meta?.description.toLowerCase().includes(query) ||
          datasetInfo.name.toLowerCase().includes(query) ||
          meta?.tags.some((tag) => tag.includes(query))
        )
      })
      console.log("[v0] After search filter:", datasets.length)
    }

    console.log("[v0] Final filtered datasets:", datasets)
    return datasets
  }, [datasetCategory, selectedTags, datasetSearchQuery])

  useEffect(() => {
    fetchAspectRatios()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              FlowSketch Art Generator
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-2">
              Generate professional-quality AI art with perfect 360° seamless wrapping, dome projections, and cultural
              authenticity
            </p>
          </div>
          <div className="flex gap-2"></div>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="secondary">GODLEVEL Quality</Badge>
          <Badge variant="secondary">360° VR Ready</Badge>
          <Badge variant="secondary">Dome Projection</Badge>
          <Badge variant="secondary">ChatGPT Enhanced</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Dataset Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Cultural Dataset
                <Button variant="ghost" size="sm" onClick={randomizeDataset} title="Randomize Dataset">
                  🎲
                </Button>
              </CardTitle>
              <CardDescription>Choose from authentic cultural heritage collections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={datasetCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDatasetCategory("all")}
                  className="flex-1"
                >
                  All ({Object.keys(CULTURAL_DATASETS).length})
                </Button>
                <Button
                  variant={datasetCategory === "scientific" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDatasetCategory("scientific")}
                  className="flex-1"
                >
                  🔬 Scientific ({getDatasetsByCategory("scientific").length})
                </Button>
                <Button
                  variant={datasetCategory === "commercial" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDatasetCategory("commercial")}
                  className="flex-1"
                >
                  🎨 Commercial ({getDatasetsByCategory("commercial").length})
                </Button>
              </div>

              <div>
                <Label htmlFor="dataset-search">Search Datasets</Label>
                <input
                  id="dataset-search"
                  type="text"
                  placeholder="Search by name, description, or tags..."
                  value={datasetSearchQuery}
                  onChange={(e) => setDatasetSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>

              <div>
                <Label>Filter by Tags</Label>
                <div className="flex flex-wrap gap-1 mt-2">
                  {getAllTags().map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => {
                        setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                {selectedTags.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setSelectedTags([])} className="mt-2 text-xs">
                    Clear filters
                  </Button>
                )}
              </div>

              <div>
                <Label htmlFor="dataset">
                  Dataset ({filteredDatasets.length} {filteredDatasets.length === 1 ? "result" : "results"})
                </Label>
                <Select value={dataset} onValueChange={handleDatasetChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredDatasets.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No datasets match your filters
                      </div>
                    ) : (
                      filteredDatasets.map((key) => {
                        const meta = DATASET_METADATA[key as keyof typeof DATASET_METADATA]
                        const datasetInfo = CULTURAL_DATASETS[key]
                        return (
                          <SelectItem key={key} value={key}>
                            <div className="flex flex-col">
                              <span>{meta?.displayName || datasetInfo.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {meta?.description || datasetInfo.description}
                              </span>
                              <div className="flex gap-1 mt-1">
                                {meta?.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-[10px] px-1 py-0">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </SelectItem>
                        )
                      })
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="scenario">Scenario</Label>
                <Select value={scenario} onValueChange={setScenario}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {scenarioEntries.map(([key]) => (
                      <SelectItem key={key} value={key}>
                        {key
                          .split("-")
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(" ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="colorScheme">Color Scheme</Label>
                <Select value={colorScheme} onValueChange={setColorScheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(COLOR_SCHEMES).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex flex-col">
                          <span className="capitalize">{key}</span>
                          <span className="text-xs text-muted-foreground">{value}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Technical Parameters */}
          <Card>
            <CardHeader>
              {/* Added aspect ratio selection UI in Technical Parameters section */}
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  Technical Parameters
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={randomizeTechnicalParams}
                    title="Randomize Technical Parameters"
                  >
                    🎲
                  </Button>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="seed">Seed</Label>
                  <Button variant="ghost" size="sm" onClick={randomizeSeed}>
                    ⟲
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Slider
                    value={[seed]}
                    onValueChange={(value) => setSeed(value[0])}
                    max={9999}
                    min={1}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-12">{seed}</span>
                </div>
              </div>

              <div>
                <Label htmlFor="numSamples">Data Points</Label>
                <div className="flex gap-2">
                  <Slider
                    value={[numSamples]}
                    onValueChange={(value) => setNumSamples(value[0])}
                    max={8000}
                    min={1000}
                    step={500}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-12">{numSamples}</span>
                </div>
              </div>

              <div>
                <Label htmlFor="noiseScale">Noise Scale</Label>
                <div className="flex gap-2">
                  <Slider
                    value={[noiseScale]}
                    onValueChange={(value) => setNoiseScale(value[0])}
                    max={0.2}
                    min={0.01}
                    step={0.01}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-12">{noiseScale.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="standardAspectRatio" className="text-sm">
                    Standard Image Aspect Ratio
                  </Label>
                  <Select
                    value={selectedAspectRatio.standard || ""}
                    onValueChange={(value) => setSelectedAspectRatio((prev) => ({ ...prev, standard: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select aspect ratio" placeholder placeholder="Select aspect ratio" />
                    </SelectTrigger>
                    <SelectContent>
                      {aspectRatios
                        .filter((ar) => ar.generation_type === "standard" || ar.generation_type === "all")
                        .map((aspectRatio) => (
                          <SelectItem key={aspectRatio.id} value={aspectRatio.id}>
                            <div className="flex flex-col">
                              <span>{aspectRatio.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {aspectRatio.width}×{aspectRatio.height} ({aspectRatio.ratio}:1)
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="domeAspectRatio" className="text-sm">
                    Dome Projection Aspect Ratio
                  </Label>
                  <Select
                    value={selectedAspectRatio.dome || ""}
                    onValueChange={(value) => setSelectedAspectRatio((prev) => ({ ...prev, dome: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select aspect ratio" />
                    </SelectTrigger>
                    <SelectContent>
                      {aspectRatios
                        .filter((ar) => ar.generation_type === "dome" || ar.generation_type === "all")
                        .map((aspectRatio) => (
                          <SelectItem key={aspectRatio.id} value={aspectRatio.id}>
                            <div className="flex flex-col">
                              <span>{aspectRatio.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {aspectRatio.width}×{aspectRatio.height} ({aspectRatio.ratio}:1)
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="360AspectRatio" className="text-sm">
                    360° Panorama Aspect Ratio
                  </Label>
                  <Select
                    value={selectedAspectRatio["360"] || ""}
                    onValueChange={(value) => setSelectedAspectRatio((prev) => ({ ...prev, "360": value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select aspect ratio" />
                    </SelectTrigger>
                    <SelectContent>
                      {aspectRatios
                        .filter((ar) => ar.generation_type === "360" || ar.generation_type === "all")
                        .map((aspectRatio) => (
                          <SelectItem key={aspectRatio.id} value={aspectRatio.id}>
                            <div className="flex flex-col">
                              <span>{aspectRatio.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {aspectRatio.width}×{aspectRatio.height} ({aspectRatio.ratio}:1)
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projection Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Projection Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="panoramaFormat">360° Format</Label>
                <Select value={panoramaFormat} onValueChange={setPanoramaFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equirectangular">
                      <div className="flex flex-col">
                        <span>Equirectangular</span>
                        <span className="text-xs text-muted-foreground">Perfect seamless wrapping for VR</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="stereographic">
                      <div className="flex flex-col">
                        <span>Stereographic</span>
                        <span className="text-xs text-muted-foreground">Little planet fisheye effect</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="projectionType">Dome Projection</Label>
                <Select value={projectionType} onValueChange={setProjectionType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fisheye">
                      <div className="flex flex-col">
                        <span>Fisheye</span>
                        <span className="text-xs text-muted-foreground">Standard dome projection</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="tunnel-up">
                      <div className="flex flex-col">
                        <span>Tunnel Up</span>
                        <span className="text-xs text-muted-foreground">Looking up through tunnel</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="tunnel-down">
                      <div className="flex flex-col">
                        <span>Tunnel Down</span>
                        <span className="text-xs text-muted-foreground">Looking down through tunnel</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="little-planet">
                      <div className="flex flex-col">
                        <span>Little Planet</span>
                        <span className="text-xs text-muted-foreground">Curved horizon planet view</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Prompt Enhancement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Prompt Enhancement</CardTitle>
              <CardDescription>Use ChatGPT to enhance your prompts for better results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="negativePrompt">Negative Prompt (Optional)</Label>
                <Textarea
                  id="negativePrompt"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="Enter words or elements you want to avoid in the generated image (e.g., blurry, low quality, distorted faces, text, watermarks)"
                  className="min-h-[80px] text-sm"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                  <span>Specify what to exclude from generation</span>
                  <span>{negativePrompt.length} characters</span>
                </div>
              </div>

              <div>
                <Label htmlFor="variationType">Enhancement Level</Label>
                <Select value={variationType} onValueChange={setVariationType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slight">
                      <div className="flex flex-col">
                        <span>Slight (+20%)</span>
                        <span className="text-xs text-muted-foreground">Subtle improvements</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="moderate">
                      <div className="flex flex-col">
                        <span>Moderate (+50%)</span>
                        <span className="text-xs text-muted-foreground">Balanced enhancement</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dramatic">
                      <div className="flex flex-col">
                        <span>Dramatic (+80%)</span>
                        <span className="text-xs text-muted-foreground">Maximum enhancement</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={previewPrompt}
                  className="flex-1 px-3 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md"
                >
                  <span className="text-slate-800">👁</span> Preview
                </button>
                <button
                  onClick={refreshSite}
                  className="px-3 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md"
                >
                  🔄
                </button>
              </div>
            </CardContent>
          </Card>

          {/* AI Provider Selection Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">🤖 AI Provider</CardTitle>
              <CardDescription>Choose your preferred image generation provider</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="provider">Provider</Label>
                <Select value={provider} onValueChange={(value: "openai" | "replicate") => setProvider(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="replicate">
                      <div className="flex flex-col">
                        <span>Replicate Models</span>
                        <span className="text-xs text-muted-foreground">Multiple model options available</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="openai">
                      <div className="flex flex-col">
                        <span>OpenAI DALL-E 3</span>
                        <span className="text-xs text-muted-foreground">High-quality, reliable generation</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {provider === "replicate" && (
                <div>
                  <Label htmlFor="replicateModel">Model</Label>
                  <Select value={replicateModel} onValueChange={setReplicateModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(REPLICATE_MODELS).map(([key, model]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex flex-col">
                            <span>{model.name}</span>
                            <span className="text-xs text-muted-foreground">{model.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                {provider === "replicate" ? (
                  <span>🔬 Replicate offers various models with different strengths and artistic styles</span>
                ) : (
                  <span>
                    <span className="text-slate-800">✨</span> DALL-E 3 HD with natural style for photorealistic results
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Generation Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Generate Art</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isGenerating ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Generating...</span>
                    <Button variant="outline" size="sm" onClick={cancelGeneration}>
                      ⟲ Cancel
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {generateTypes.standard && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">Standard</span>
                        <span className="text-muted-foreground">{generationProgress.standard}</span>
                      </div>
                    )}
                    {generateTypes.dome && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">Dome</span>
                        <span className="text-muted-foreground">{generationProgress.dome}</span>
                      </div>
                    )}
                    {generateTypes.panorama360 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">360° Panorama</span>
                        <span className="text-muted-foreground">{generationProgress.panorama360}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Generate Types</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={generateTypes.standard}
                          onChange={(e) => updateGenerateTypes((prev) => ({ ...prev, standard: e.target.checked }))}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">Standard</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={generateTypes.dome}
                          onChange={(e) => updateGenerateTypes((prev) => ({ ...prev, dome: e.target.checked }))}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">Dome</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={generateTypes.panorama360}
                          onChange={(e) => updateGenerateTypes((prev) => ({ ...prev, panorama360: e.target.checked }))}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">360° VR</span>
                      </label>
                    </div>

                    <div className="pt-2 border-t">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={frameless}
                          onChange={(e) => setFrameless(e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">Frameless (no enhancement wrapper)</span>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={generateImages}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 font-medium"
                  >
                    🎨 Generate Art
                  </button>
                </div>
              )}

              {customPrompt && (
                <Alert>
                  <span className="text-sm font-medium">
                    Using custom enhanced prompt ({customPrompt.length} characters)
                  </span>
                </Alert>
              )}

              {negativePrompt && (
                <Alert>
                  <span className="text-sm font-medium">
                    Using negative prompt ({negativePrompt.length} characters) - excluding specified elements
                  </span>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-center mb-4">
            <Button
              variant="outline"
              size="lg"
              onClick={randomizeAll}
              className="text-lg px-6 py-3 bg-transparent"
              title="Randomize Everything"
            >
              🎲 Randomize All
            </Button>
          </div>

          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Generated Images</CardTitle>
              <CardDescription>
                Professional-quality AI art with seamless 360° wrapping and dome projection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="standard" className="flex items-center gap-2" disabled={!generateTypes.standard}>
                    Standard
                    {results.standard && "✓"}
                  </TabsTrigger>
                  <TabsTrigger value="dome" className="flex items-center gap-2" disabled={!generateTypes.dome}>
                    Dome
                    {results.dome && "✓"}
                  </TabsTrigger>
                  <TabsTrigger
                    value="panorama360"
                    className="flex items-center gap-2"
                    disabled={!generateTypes.panorama360}
                  >
                    360° VR
                    {results.panorama360 && "✓"}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="standard" className="space-y-4">
                  {results.standard ? (
                    <div className="space-y-4">
                      <div className="relative">
                        {/* Updated aspect ratio display in results section to use dynamic ratios */}
                        <AspectRatio
                          ratio={aspectRatios.find((ar) => ar.id === selectedAspectRatio.standard)?.ratio || 1}
                        >
                          <img
                            src={results.standard || "/placeholder.svg"}
                            alt="Standard generated art"
                            className="rounded-lg object-cover w-full h-full"
                          />
                        </AspectRatio>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => downloadImage(results.standard!, `flowsketch-standard-${seed}.png`)}
                          className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-md text-sm"
                        >
                          ⬇ Download Standard
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                      <div className="text-center space-y-2">
                        <span className="text-muted-foreground">Standard image will appear here</span>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="dome" className="space-y-4">
                  {results.dome ? (
                    <div className="space-y-4">
                      <div className="relative">
                        {/* Updated aspect ratio display in results section to use dynamic ratios */}
                        <AspectRatio ratio={aspectRatios.find((ar) => ar.id === selectedAspectRatio.dome)?.ratio || 1}>
                          <img
                            src={results.dome || "/placeholder.svg"}
                            alt="Dome projection art"
                            className="rounded-lg object-cover w-full h-full"
                          />
                        </AspectRatio>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => downloadImage(results.dome!, `flowsketch-dome-${projectionType}-${seed}.png`)}
                          className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-md text-sm"
                        >
                          ⬇ Download Dome
                        </button>
                      </div>
                      <Alert>
                        <span className="text-sm font-medium">
                          Optimized for {projectionType} dome projection with perfect radial composition
                        </span>
                      </Alert>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                      <div className="text-center space-y-2">
                        <span className="text-muted-foreground">Dome projection will appear here</span>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="panorama360" className="space-y-4">
                  {results.panorama360 ? (
                    <div className="space-y-4">
                      <div className="relative">
                        {/* Updated aspect ratio display in results section to use dynamic ratios */}
                        <AspectRatio
                          ratio={aspectRatios.find((ar) => ar.id === selectedAspectRatio["360"])?.ratio || 2}
                          className="bg-black rounded-lg overflow-hidden"
                        >
                          <img
                            src={results.panorama360 || "/placeholder.svg"}
                            alt="360° panoramic art"
                            className="w-full h-full object-contain"
                            style={{ objectPosition: "center" }}
                          />
                        </AspectRatio>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            downloadImage(results.panorama360!, `flowsketch-360-${panoramaFormat}-${seed}.png`)
                          }
                          className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-md text-sm"
                        >
                          ⬇ Download 360°
                        </button>
                      </div>
                      <Alert>
                        <span className="text-sm font-medium">
                          {panoramaFormat === "equirectangular"
                            ? "Perfect seamless wrapping for VR headsets - left edge connects flawlessly with right edge"
                            : "Stereographic projection with entire 360° view in circular frame"}
                        </span>
                      </Alert>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                      <div className="text-center space-y-2">
                        <span className="text-muted-foreground">360° panorama will appear here</span>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Prompt Preview Dialog */}
      <Dialog open={isPromptDialogOpen} onOpenChange={setIsPromptDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-slate-800">👁</span> Prompt Preview
            </DialogTitle>
            <DialogDescription>
              {promptEnhancement
                ? "Review your enhanced prompt"
                : "Review your original prompt and enhance it if needed"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Enhancement Statistics */}
            {promptEnhancement && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{promptEnhancement.statistics.original.words}</div>
                  <div className="text-sm text-muted-foreground">Original Words</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{promptEnhancement.statistics.enhanced.words}</div>
                  <div className="text-sm text-muted-foreground">Enhanced Words</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    +{promptEnhancement.statistics.improvement.words}
                  </div>
                  <div className="text-sm text-muted-foreground">Words Added</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {promptEnhancement.statistics.improvement.percentage}%
                  </div>
                  <div className="text-sm text-muted-foreground">Improvement</div>
                </div>
              </div>
            )}

            {/* Enhancement Method Badges */}
            {promptEnhancement && (
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {promptEnhancement.enhancementMethod === "chatgpt" ? (
                    <>ChatGPT Enhanced</>
                  ) : promptEnhancement.enhancementMethod === "godlevel-neuralia" ? (
                    <>Godlevel Neuralia Art</>
                  ) : (
                    <>Rule-Based Enhanced</>
                  )}
                </Badge>
                <Badge variant="outline">{promptEnhancement.variationType} variation</Badge>
                <Badge variant="outline">{promptEnhancement.generationType} generation</Badge>
              </div>
            )}

            {/* Prompt Editor */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="prompt-editor" className="text-base font-semibold">
                  {promptEnhancement ? "Enhanced Prompt" : "Original Prompt"}
                </Label>
                <div className="flex gap-2">
                  {promptEnhancement && (
                    <>
                      <Button variant="ghost" size="sm" onClick={resetToOriginal}>
                        Reset to Original
                      </Button>
                      <Button variant="ghost" size="sm" onClick={resetToEnhanced}>
                        Reset to Enhanced
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <Textarea
                id="prompt-editor"
                value={editablePrompt || ""}
                onChange={(e) => setEditablePrompt(e.target.value)}
                placeholder="Your prompt will appear here..."
                className="min-h-[200px] font-mono text-sm"
              />

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{(editablePrompt || "").length} characters</span>
                <span className={(editablePrompt || "").length > 4000 ? "text-red-500" : "text-green-500"}>
                  {(editablePrompt || "").length <= 4000 ? "Within limit" : "Exceeds 4000 char limit"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button onClick={enhanceCurrentPrompt} disabled={isEnhancing || !editablePrompt} className="flex-1">
                <span className="text-slate-100">{isEnhancing ? "⟳" : "✨"}</span>{" "}
                {isEnhancing ? "Enhancing..." : "Enhance"}
              </Button>

              <Button
                onClick={generateGodlevelPrompt}
                disabled={isGeneratingGodlevel || !editablePrompt}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <span className="text-white">{isGeneratingGodlevel ? "⟳" : "🎨"}</span>{" "}
                {isGeneratingGodlevel ? "Generating..." : "Godlevel Neuralia"}
              </Button>

              <Button
                onClick={applyEnhancedPrompt}
                className="flex-1"
                disabled={!editablePrompt || editablePrompt.trim().length === 0}
              >
                <span className="text-slate-100">✓</span> Apply
              </Button>

              <Button variant="outline" onClick={() => setIsPromptDialogOpen(false)} className="flex-1">
                ↩ Return to Prompt
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FlowArtGenerator
