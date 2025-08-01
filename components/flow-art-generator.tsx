"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import {
  Sparkles,
  Settings,
  ImageIcon,
  Calculator,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  Loader2,
  Users,
  Trash2,
  Play,
} from "lucide-react"
import { generateFlowField, generateDomeProjection as generateDomeSVG, type GenerationParams } from "@/lib/flow-model"

interface GeneratedArt {
  svgContent: string
  imageUrl: string
  domeImageUrl?: string
  panorama360Url?: string
  params: GenerationParams
  mode: "svg" | "ai"
  customPrompt?: string
  originalPrompt?: string
  finalPrompt?: string
  promptLength?: number
  timestamp: number
  id: string
  isDomeProjection?: boolean
  is360Panorama?: boolean
  domeSpecs?: {
    diameter: number
    resolution: string
    projectionType: string
  }
  panoramaSpecs?: {
    resolution: string
    format: string
  }
  estimatedFileSize?: string
  provider?: string
  model?: string
  generationDetails?: {
    mainImage: string
    domeImage: string
    panoramaImage: string
  }
}

export function FlowArtGenerator() {
  const [generatedArt, setGeneratedArt] = useState<GeneratedArt | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false)
  const [progress, setProgress] = useState(0)
  const [mode, setMode] = useState<"svg" | "ai">("ai")
  const [error, setError] = useState<string | null>(null)
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null)

  // Enhanced generation parameters with Thailand as default
  const [dataset, setDataset] = useState("thailand")
  const [scenario, setScenario] = useState("landscape")
  const [colorScheme, setColorScheme] = useState("sunset")
  const [seed, setSeed] = useState(1234)
  const [numSamples, setNumSamples] = useState(3000)
  const [noiseScale, setNoiseScale] = useState(0.1)
  const [timeStep, setTimeStep] = useState(0.01)

  // Dome projection settings - fixed to 10 meters
  const [domeEnabled, setDomeEnabled] = useState(true)
  const [domeDiameter] = useState(10) // Fixed to 10 meters
  const [domeResolution, setDomeResolution] = useState("4K")
  const [domeProjectionType, setDomeProjectionType] = useState("fisheye")

  // 360° panorama settings
  const [panorama360Enabled, setPanorama360Enabled] = useState(true)
  const [panoramaResolution, setPanoramaResolution] = useState("8K")
  const [panoramaFormat, setPanoramaFormat] = useState("equirectangular")
  const [stereographicPerspective, setStereographicPerspective] = useState("little-planet")

  // Gallery state
  const [gallery, setGallery] = useState<GeneratedArt[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // AI Art prompt enhancement and final prompt editing
  const [customPrompt, setCustomPrompt] = useState("")
  const [enhancedPrompt, setEnhancedPrompt] = useState("")
  const [finalPrompt, setFinalPrompt] = useState("")
  const [useCustomPrompt, setUseCustomPrompt] = useState(false)
  const [showFinalPrompt, setShowFinalPrompt] = useState(false)
  const [finalPromptEdited, setFinalPromptEdited] = useState(false)

  // Auto-generation state
  const [isAutoGenerating, setIsAutoGenerating] = useState(false)
  const [autoGenProgress, setAutoGenProgress] = useState(0)

  // Load gallery from localStorage on mount
  useEffect(() => {
    const savedGallery = localStorage.getItem("flowsketch-gallery")
    if (savedGallery) {
      try {
        setGallery(JSON.parse(savedGallery))
      } catch (error) {
        console.error("Failed to load gallery from localStorage:", error)
      }
    }
  }, [])

  // Save gallery to localStorage whenever it changes
  useEffect(() => {
    if (gallery.length > 0) {
      localStorage.setItem("flowsketch-gallery", JSON.stringify(gallery))
    }
  }, [gallery])

  // Reset to first page when gallery changes
  useEffect(() => {
    setCurrentPage(1)
  }, [gallery.length])

  // Calculate pagination
  const totalPages = Math.ceil(gallery.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = gallery.slice(startIndex, endIndex)

  // Generate final prompt for preview
  const generateFinalPrompt = useCallback(() => {
    if (mode === "svg") return ""

    let prompt = ""

    if (useCustomPrompt && (enhancedPrompt || customPrompt)) {
      prompt = enhancedPrompt || customPrompt
      prompt += "\n\n"
    }

    // Build the same prompt structure as the API
    prompt += `Create an intricate generative art masterpiece inspired by '${dataset}' dataset, employing a '${colorScheme}' color scheme. The artwork should serve as an ideal base for professional 8K upscaling, focusing on clean, sharp edges and well-defined structures.\n\n`

    // Mathematical Precision
    prompt += `### Mathematical Precision:\n`
    switch (dataset) {
      case "thailand":
        prompt += `Arrange exactly ${numSamples.toLocaleString()} Thai cultural heritage elements organically across the canvas, creating an authentic representation of Thailand's rich cultural tapestry. Include golden Buddhist temples (Wat) with intricate spires and traditional Thai architecture featuring multi-tiered roofs, ornate decorations, and golden accents. Show traditional Thai classical dancers in elaborate silk costumes with intricate headdresses, graceful hand gestures (mudras), and flowing movements. Depict bustling floating markets with colorful longtail boats, vendors selling tropical fruits, flowers, and traditional crafts along scenic waterways. Include iconic tuk-tuks navigating busy streets filled with street food vendors, traditional shophouses, and vibrant urban life. Feature Buddhist monks in saffron robes walking in procession, meditating in temple courtyards, and participating in daily alms rounds. Show magnificent royal palaces with traditional Thai architecture, golden stupas, guardian statues, and ornate gardens. Include Thai festivals like Songkran (water festival) with people celebrating, Loy Krathong with floating lanterns and lotus offerings, and traditional ceremonies with dancers, musicians, and cultural performances. Add traditional Thai houses on stilts, spirit houses (san phra phum), lotus ponds, tropical vegetation, and authentic Thai cultural symbols throughout the composition. Each element should be mathematically distributed using cultural clustering algorithms that reflect authentic Thai settlement patterns and cultural organization. `
        break
      case "spirals":
        prompt += `Arrange exactly ${numSamples.toLocaleString()} spiral elements organically across the canvas, ensuring each one is unique yet harmoniously integrated with the others. The spirals should vary in size and density, creating dynamic flow throughout the piece with Fibonacci proportions, golden ratio curves, nautilus shell formations, and galaxy arm patterns. Include logarithmic spirals r=ae^(bθ) and Archimedean spirals with mathematical precision. `
        break
      case "fractal":
        prompt += `Generate exactly ${numSamples.toLocaleString()} fractal branching elements with self-similar structures at multiple scales. Each fractal should follow L-system rules F→F[+F]F[-F]F with recursive branching, creating tree-like formations, lightning patterns, fern fronds, and organic growth structures with mathematical precision and infinite detail. `
        break
      case "mandelbrot":
        prompt += `Create exactly ${numSamples.toLocaleString()} Mandelbrot set iteration points with complex plane mathematics z_{n+1} = z_n² + c. Include cardioid main bulbs, circular bulbs, infinite zoom detail with smooth escape-time coloring, fractal boundary precision, and psychedelic swirling patterns. `
        break
      case "julia":
        prompt += `Generate exactly ${numSamples.toLocaleString()} Julia set elements with flowing fractal boundaries, connected and disconnected sets, parameter space exploration, and elegant mathematical beauty with dreamlike surreal patterns. `
        break
      case "lorenz":
        prompt += `Create exactly ${numSamples.toLocaleString()} Lorenz attractor trajectory points forming butterfly-wing patterns with chaotic beauty, strange attractor dynamics, three-dimensional flow, and graceful curves suggesting movement and energy. `
        break
      case "tribes":
        prompt += `Arrange exactly ${numSamples.toLocaleString()} tribal settlement elements including people in traditional clothing, authentic dwellings, ceremonial circles, and cultural activities. Each figure should be unique with tribal details including chiefs, shamans, dancers, craftspeople, children playing, and daily life scenes with rich cultural storytelling. `
        break
      case "heads":
        prompt += `Compose exactly ${numSamples.toLocaleString()} facial feature elements creating portrait mosaics with golden ratio proportions φ=1.618. Each face should have unique expressions, geometric tessellation, anatomical precision, artistic interpretation, and mosaic composition with human beauty. `
        break
      case "natives":
        prompt += `Design exactly ${numSamples.toLocaleString()} native settlement elements with longhouses, tipis, medicine wheels, and ceremonial spaces. Include people in traditional dress, seasonal activities, authentic indigenous architecture, and cultural ceremonies. `
        break
      case "voronoi":
        prompt += `Arrange exactly ${numSamples.toLocaleString()} Voronoi cell seed points creating natural tessellation patterns like cracked earth, giraffe spots, honeycomb structures with organic boundaries and natural cell-like formations. `
        break
      case "cellular":
        prompt += `Generate exactly ${numSamples.toLocaleString()} cellular automata elements showing Conway's Game of Life patterns, gliders, oscillators, emergent complexity from simple rules, and biological structure formations. `
        break
      case "gaussian":
        prompt += `Create exactly ${numSamples.toLocaleString()} Gaussian distribution points forming bell-curve landscapes, statistical visualizations, probability density patterns, and smooth flowing terrain. `
        break
      case "diffusion":
        prompt += `Design exactly ${numSamples.toLocaleString()} reaction-diffusion pattern elements creating Turing patterns like zebra stripes, leopard spots, tiger markings, and natural biological formations with organic flow. `
        break
      case "wave":
        prompt += `Generate exactly ${numSamples.toLocaleString()} wave interference elements showing constructive and destructive patterns, standing waves, fluid dynamics, ocean ripples, and aquatic beauty. `
        break
      case "hyperbolic":
        prompt += `Create exactly ${numSamples.toLocaleString()} hyperbolic geometry elements with Escher-inspired tessellations, mind-bending patterns, infinite regression illusions, and non-Euclidean beauty. `
        break
      default:
        prompt += `Arrange exactly ${numSamples.toLocaleString()} ${dataset} elements with mathematical precision and organic distribution across the canvas, ensuring each element is unique yet harmoniously integrated. `
    }

    // Color Palette
    prompt += `\n### Color Palette:\n`
    if (dataset === "thailand") {
      switch (colorScheme) {
        case "sunset":
          prompt += `Employ authentic Thai sunset colors with golden temple hues (#FFD700), saffron monk robes (#FF8C00), royal purple (#800080), traditional red (#DC143C), and warm oranges (#FF6347). Include the golden glow of temple spires, the warm light of floating lanterns, and the rich colors of traditional Thai silk with natural harmony and cultural authenticity. `
          break
        case "cosmic":
          prompt += `Use Thai royal colors with deep golden yellows (#FFD700), royal blues (#0047AB), traditional reds (#DC143C), and pure whites (#FFFFFF). Include the cosmic beauty of Thai temple architecture reaching toward the heavens with stellar lighting effects and spiritual atmosphere. `
          break
        case "plasma":
          prompt += `Utilize vibrant Thai festival colors with electric blues of traditional ceramics (#0066CC), hot magentas of silk fabrics (#FF1493), golden temple accents (#FFD700), and bright festival oranges (#FF8C00). Create the energy and vibrancy of Thai celebrations with luminous effects and cultural depth. `
          break
        default:
          prompt += `Utilize authentic Thai ${colorScheme} palette with rich, culturally significant colors including temple gold, saffron orange, royal purple, traditional red, and ceremonial white, creating emotional impact and cultural authenticity with professional color harmony. `
      }
    } else {
      switch (colorScheme) {
        case "plasma":
          prompt += `Utilize a vibrant and high-contrast plasma color scheme with deep purples (#0d0887), electric blues (#46039f), hot magentas (#7201a8), coral oranges (#bd3786), bright oranges (#ed7953), and golden yellows (#fdca26). Include gradients with smooth transitions and luminous effects, interspersed with dark shadows to create depth and dimension. `
          break
        case "sunset":
          prompt += `Employ warm sunset colors with fiery oranges (#ff6b35), golden yellows (#f7931e), soft pinks (#ffd23f), deep purples (#5d2e5d), and cool blues (#1fb3d3). Create romantic golden hour lighting with natural color harmony and atmospheric warmth. `
          break
        case "cosmic":
          prompt += `Use deep space colors with rich browns (#2c1810), rusty oranges (#8b4513), stellar golds (#ffa500), bright yellows (#ffff00), and pure whites (#ffffff). Include nebula-like beauty with cosmic atmosphere and stellar lighting effects. `
          break
        default:
          prompt += `Utilize a ${colorScheme} color palette with rich, vibrant colors creating emotional impact and visual harmony with professional color theory and smooth gradients. `
      }
    }

    // Scenario Integration - RESTORED "pure" option
    switch (scenario) {
      case "pure":
        prompt += `Present the mathematical patterns in their purest form with minimal artistic interpretation. Focus on the raw mathematical beauty with clean geometric forms, precise mathematical relationships, and abstract mathematical visualization. Display mathematical formulas, equations, and numerical relationships as visual elements. Include mathematical notation like ∑, ∫, ∂, π, φ, e, and complex mathematical expressions rendered as artistic typography. Show mathematical graphs, coordinate systems, function plots, and geometric proofs as decorative elements. `
        break
      case "landscape":
        if (dataset === "thailand") {
          prompt += `Set in breathtaking Thai natural landscape with golden temples nestled among lush tropical hills, winding rivers with floating markets, ancient forests with hidden shrines, and scenic rice terraces. Include traditional Thai villages with wooden houses on stilts, coconut palms, lotus ponds, and the serene beauty of Thai countryside. Show people living in harmony with nature, monks walking forest paths, fishermen on traditional boats, and the peaceful integration of Thai culture with the natural environment. Add misty mountains, tropical waterfalls, and the golden light of Thai sunsets illuminating the cultural landscape. `
        } else if (dataset === "tribes" || dataset === "natives") {
          prompt += `Set in breathtaking natural landscape with tribal villages nestled in rolling valleys, flowing rivers, and ancient forests. Include people living in harmony with nature, smoke rising from cooking fires, daily activities, cultural ceremonies, and environmental storytelling. `
        } else {
          prompt += `Set in majestic natural landscape incorporating ${dataset} patterns in terrain formations, mountain ranges, river systems, atmospheric phenomena, and geological structures with cinematic lighting. `
        }
        break
      case "architectural":
        if (dataset === "thailand") {
          prompt += `Set in magnificent Thai architectural environment showcasing traditional temple architecture with multi-tiered roofs, golden spires, intricate wood carvings, and ornate decorations. Include royal palaces with traditional Thai design elements, modern Bangkok skyline with traditional influences, ancient ruins of Ayutthaya, and the harmonious blend of traditional and contemporary Thai architecture. Show detailed craftsmanship, geometric patterns, and the mathematical precision of Thai architectural design. `
        } else {
          prompt += `Set in futuristic architectural environment with ${dataset} patterns integrated into building design, structural engineering, urban planning, and modern materials with geometric precision. `
        }
        break
      case "crystalline":
        prompt += `Set in spectacular crystal formations with ${dataset} patterns in mineral structures, prismatic light effects, rainbow refractions, gem-like beauty, and optical phenomena. `
        break
      case "botanical":
        if (dataset === "thailand") {
          prompt += `Set in lush Thai botanical environment with tropical flowers like orchids, lotus blossoms, and frangipani, traditional herb gardens, sacred Bodhi trees, bamboo groves, and tropical fruit trees. Include traditional Thai garden design with geometric patterns, water features, and the integration of cultural elements with natural beauty. Show the rich biodiversity of Thailand with vibrant vegetation and traditional landscape architecture. `
        } else {
          prompt += `Set in lush botanical environment with ${dataset} patterns in plant growth, flower arrangements, leaf structures, natural organic beauty, and vibrant vegetation. `
        }
        break
      case "urban":
        if (dataset === "thailand") {
          prompt += `Set in vibrant Thai urban environment with bustling Bangkok streets, traditional markets, modern shopping centers, street food vendors, tuk-tuks navigating traffic, traditional shophouses mixed with modern buildings, and the dynamic energy of Thai city life. Include neon signs with Thai script, traditional architecture integrated into urban planning, and the unique character of Thai metropolitan areas. `
        } else {
          prompt += `Set in dynamic urban environment showcasing ${dataset} patterns with metropolitan energy and architectural diversity. `
        }
        break
      default:
        if (dataset === "thailand") {
          prompt += `Set in authentic Thai ${scenario} environment showcasing traditional cultural elements with thematic consistency and cultural accuracy, highlighting the beauty and richness of Thai heritage. `
        } else {
          prompt += `Set in ${scenario} environment showcasing ${dataset} patterns with thematic consistency and visual appeal. `
        }
    }

    // Additional sections
    prompt += `\n### Textures and Patterns:\nIntroduce complex textures within the ${dataset} elements, such as fine lines, cross-hatching, stippling, or organic dotting patterns, which will reveal new details upon close inspection. `

    if (dataset === "thailand") {
      prompt += `Include traditional Thai patterns like flame motifs, lotus designs, geometric temple decorations, silk textile patterns, and intricate wood carving details. `
    }

    prompt += `Ensure that these intricate patterns are meticulously crafted to reward viewers and enhance during upscaling. `

    prompt += `\n### Noise Texture:\nApply a subtle noise texture of ${noiseScale} to the entire image, giving it a tactile, almost tactile surface that adds sophistication and visual interest without overwhelming the primary elements. `

    prompt += `\n### Professional Composition:\nDesign the composition with a balance that suits large-format printing. The ${dataset} elements should guide the viewer's eye seamlessly across the canvas, creating a sense of movement and energy with rule of thirds, leading lines, and focal points. `

    if (dataset === "thailand") {
      prompt += `Use traditional Thai compositional principles with central focal points (like temple spires), balanced symmetry, and harmonious integration of cultural elements. `
    }

    prompt += `\n### Gallery-Quality:\nEnsure that the overall artwork exudes a refined, gallery-quality aesthetic suitable for exhibition, with each element contributing to a cohesive and engaging visual narrative. Focus on maintaining sharp, clean edges around each ${dataset} element and between color transitions to ensure clarity and precision are preserved during upscaling. Design with rich detail that enhances beautifully when processed through AI upscaling algorithms, emphasizing the depth and complexity of the piece.\n\n`

    prompt += `By adhering to these guidelines, the resulting image will be an exquisite generative art masterpiece, optimized for professional 8K upscaling and perfect for large-format, gallery-quality display. Ultra-high resolution with 16-bit color depth, advanced rendering, photorealistic detail, cinematic composition, and museum-worthy artistic excellence.`

    return prompt
  }, [mode, useCustomPrompt, enhancedPrompt, customPrompt, dataset, colorScheme, numSamples, scenario, noiseScale])

  // Update final prompt when parameters change
  useEffect(() => {
    if (mode === "ai" && !finalPromptEdited) {
      const newFinalPrompt = generateFinalPrompt()
      setFinalPrompt(newFinalPrompt)
    }
  }, [generateFinalPrompt, mode, finalPromptEdited])

  const generateArt = useCallback(async () => {
    console.log("Generate button clicked! Mode:", mode)
    setIsGenerating(true)
    setProgress(0)
    setError(null)

    try {
      const params: GenerationParams = {
        dataset,
        scenario,
        colorScheme,
        seed,
        numSamples,
        noiseScale,
        timeStep,
        domeProjection: domeEnabled,
        domeDiameter: domeEnabled ? domeDiameter : undefined,
        domeResolution: domeEnabled ? domeResolution : undefined,
        projectionType: domeEnabled ? domeProjectionType : undefined,
        panoramic360: panorama360Enabled,
        panoramaResolution: panorama360Enabled ? panoramaResolution : undefined,
        panoramaFormat: panorama360Enabled ? panoramaFormat : undefined,
        stereographicPerspective:
          panorama360Enabled && panoramaFormat === "stereographic" ? stereographicPerspective : undefined,
      }

      console.log("Generating with params:", params)

      if (mode === "svg") {
        // Generate SVG flow field
        setProgress(30)
        console.log("Generating SVG content...")
        const svgContent = generateFlowField(params)
        console.log("SVG generated, length:", svgContent.length)

        setProgress(50)
        const svgBlob = new Blob([svgContent], { type: "image/svg+xml" })
        const imageUrl = URL.createObjectURL(svgBlob)
        console.log("Blob URL created:", imageUrl)

        let domeImageUrl: string | undefined
        let panorama360Url: string | undefined

        if (domeEnabled) {
          setProgress(65)
          console.log("Generating dome projection...")
          const domeSvgContent = generateDomeSVG({
            width: 1024,
            height: 1024,
            fov: 180,
            tilt: 0,
          })
          const domeSvgBlob = new Blob([domeSvgContent], { type: "image/svg+xml" })
          domeImageUrl = URL.createObjectURL(domeSvgBlob)
        }

        if (panorama360Enabled) {
          setProgress(80)
          console.log("Generating 360° panorama...")
          const panoramaSvgContent = generateFlowField(params)
          const panoramaSvgBlob = new Blob([panoramaSvgContent], { type: "image/svg+xml" })
          panorama360Url = URL.createObjectURL(panoramaSvgBlob)
        }

        setProgress(100)
        const newArt: GeneratedArt = {
          svgContent,
          imageUrl,
          domeImageUrl,
          panorama360Url,
          params,
          mode: "svg" as const,
          timestamp: Date.now(),
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          isDomeProjection: domeEnabled,
          is360Panorama: panorama360Enabled,
          domeSpecs: domeEnabled
            ? {
                diameter: domeDiameter,
                resolution: domeResolution,
                projectionType: domeProjectionType,
              }
            : undefined,
          panoramaSpecs: panorama360Enabled
            ? {
                resolution: panoramaResolution,
                format: panoramaFormat,
              }
            : undefined,
        }
        setGeneratedArt(newArt)
        setGallery((prev) => [newArt, ...prev])

        // Clear custom prompt after successful generation
        if (useCustomPrompt) {
          setCustomPrompt("")
          setEnhancedPrompt("")
          setFinalPrompt("")
          setFinalPromptEdited(false)
        }

        toast.success(
          `Mathematical SVG Generated! 🎨 ${dataset} + ${scenario} visualization created with ${numSamples} data points.`,
        )
      } else {
        // Generate AI art with final prompt (user-editable)
        setProgress(20)
        console.log("Calling AI art API...")

        const requestBody = {
          dataset,
          scenario,
          colorScheme,
          seed,
          numSamples,
          noise: noiseScale,
          timeStep,
          customPrompt: finalPromptEdited ? finalPrompt : useCustomPrompt ? enhancedPrompt || customPrompt : undefined,
          domeProjection: domeEnabled,
          domeDiameter: domeEnabled ? domeDiameter : undefined,
          domeResolution: domeEnabled ? domeResolution : undefined,
          projectionType: domeEnabled ? domeProjectionType : undefined,
          panoramic360: panorama360Enabled,
          panoramaResolution: panorama360Enabled ? panoramaResolution : undefined,
          panoramaFormat: panorama360Enabled ? panoramaFormat : undefined,
          stereographicPerspective:
            panorama360Enabled && panoramaFormat === "stereographic" ? stereographicPerspective : undefined,
        }

        console.log("Sending AI request:", requestBody)

        const response = await fetch("/api/generate-art", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        })

        console.log("AI API Response status:", response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error("AI API error response:", errorText)

          let errorMessage = `API request failed with status ${response.status}`
          try {
            const errorData = JSON.parse(errorText)
            errorMessage = errorData.error || errorMessage
          } catch {
            // If response is not JSON, use the text directly (truncated)
            errorMessage = errorText.length > 200 ? errorText.substring(0, 200) + "..." : errorText
          }

          throw new Error(errorMessage)
        }

        const data = await response.json()
        console.log("AI art response received:", data)

        if (!data.success) {
          throw new Error(data.error || "AI generation failed")
        }

        if (!data.image) {
          throw new Error("No image URL returned from API")
        }

        setProgress(80)
        const newArt: GeneratedArt = {
          svgContent: "",
          imageUrl: data.image,
          domeImageUrl: data.domeImage,
          panorama360Url: data.panoramaImage || data.image,
          params,
          mode: "ai" as const,
          customPrompt: useCustomPrompt ? enhancedPrompt || customPrompt : undefined,
          originalPrompt: data.originalPrompt,
          finalPrompt: finalPromptEdited ? finalPrompt : data.originalPrompt,
          promptLength: data.promptLength,
          estimatedFileSize: data.estimatedFileSize,
          provider: data.provider,
          model: data.model,
          timestamp: Date.now(),
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          isDomeProjection: domeEnabled,
          is360Panorama: panorama360Enabled,
          domeSpecs: domeEnabled
            ? {
                diameter: domeDiameter,
                resolution: domeResolution,
                projectionType: domeProjectionType,
              }
            : undefined,
          panoramaSpecs: panorama360Enabled
            ? {
                resolution: panoramaResolution,
                format: panoramaFormat,
              }
            : undefined,
          generationDetails: data.generationDetails,
        }
        setGeneratedArt(newArt)
        setGallery((prev) => [newArt, ...prev])

        // Clear custom prompt after successful generation
        if (useCustomPrompt) {
          setCustomPrompt("")
          setEnhancedPrompt("")
          setFinalPrompt("")
          setFinalPromptEdited(false)
        }

        setProgress(100)

        toast.success(`Thai Cultural Art Generated! 🇹🇭✨ ${dataset} + ${scenario} created with OpenAI DALL-E 3.`)
      }
    } catch (error: any) {
      console.error("Generation error:", error)
      setError(error.message || "Failed to generate artwork")
      toast.error(error.message || "Failed to generate artwork. Please try again.")
    } finally {
      setIsGenerating(false)
      setProgress(0)
    }
  }, [
    dataset,
    scenario,
    colorScheme,
    seed,
    numSamples,
    noiseScale,
    timeStep,
    mode,
    useCustomPrompt,
    customPrompt,
    enhancedPrompt,
    finalPrompt,
    finalPromptEdited,
    domeEnabled,
    domeDiameter,
    domeResolution,
    domeProjectionType,
    panorama360Enabled,
    panoramaResolution,
    panoramaFormat,
    stereographicPerspective,
  ])

  // Auto-generate Thai cultural artwork with different scenarios
  const generateThaiShowcase = useCallback(async () => {
    setIsAutoGenerating(true)
    setAutoGenProgress(0)

    const thaiScenarios = [
      { scenario: "landscape", colorScheme: "sunset", description: "Thai temples in natural landscape" },
      { scenario: "architectural", colorScheme: "cosmic", description: "Traditional Thai architecture" },
      { scenario: "botanical", colorScheme: "plasma", description: "Thai botanical gardens" },
      { scenario: "urban", colorScheme: "neon", description: "Modern Thai city life" },
      { scenario: "pure", colorScheme: "thermal", description: "Pure Thai cultural patterns" },
    ]

    try {
      for (let i = 0; i < thaiScenarios.length; i++) {
        const { scenario: newScenario, colorScheme: newColorScheme, description } = thaiScenarios[i]

        // Update settings
        setScenario(newScenario)
        setColorScheme(newColorScheme)
        setSeed(Math.floor(Math.random() * 10000))

        setAutoGenProgress(((i + 1) / thaiScenarios.length) * 100)

        toast.success(`🇹🇭 Generating: ${description}`)

        // Wait for state to update
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Generate artwork
        await generateArt()

        // Wait between generations
        if (i < thaiScenarios.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
      }

      toast.success("🎉 Thai Cultural Showcase Complete! Generated 5 unique artworks.")
    } catch (error) {
      toast.error("Thai showcase generation failed. Please try again.")
    } finally {
      setIsAutoGenerating(false)
      setAutoGenProgress(0)
    }
  }, [generateArt])

  const downloadImage = useCallback(
    async (format: "regular" | "dome" | "panorama" = "regular") => {
      if (!generatedArt) {
        console.log("No generated art to download")
        return
      }

      console.log("Download button clicked!", format)
      setDownloadStatus("Preparing download...")

      try {
        let imageUrl: string
        let filename: string

        switch (format) {
          case "dome":
            if (!generatedArt.domeImageUrl) {
              throw new Error("No dome projection available")
            }
            imageUrl = generatedArt.domeImageUrl
            filename = `flowsketch-dome-${generatedArt.params.dataset}-${Date.now()}.${generatedArt.mode === "svg" ? "svg" : "jpg"}`
            break
          case "panorama":
            if (!generatedArt.panorama360Url) {
              throw new Error("No 360° panorama available")
            }
            imageUrl = generatedArt.panorama360Url
            filename = `flowsketch-360-${generatedArt.params.dataset}-${Date.now()}.${generatedArt.mode === "svg" ? "svg" : "jpg"}`
            break
          default:
            imageUrl = generatedArt.imageUrl
            filename = `flowsketch-${generatedArt.params.dataset}-${Date.now()}.${generatedArt.mode === "svg" ? "svg" : "jpg"}`
        }

        console.log("Downloading from URL:", imageUrl)

        if (generatedArt.mode === "svg") {
          // Direct download for SVG
          const link = document.createElement("a")
          link.href = imageUrl
          link.download = filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          setDownloadStatus("SVG downloaded successfully!")
        } else {
          // Use proxy for AI-generated images
          const proxyUrl = `/api/download-proxy?url=${encodeURIComponent(imageUrl)}&filename=${encodeURIComponent(filename)}`
          console.log("Using proxy URL:", proxyUrl)

          const link = document.createElement("a")
          link.href = proxyUrl
          link.download = filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          setDownloadStatus("Image downloaded successfully!")
        }

        toast.success(`Download Complete! 📥 ${filename} has been saved to your device.`)
      } catch (error: any) {
        console.error("Download error:", error)
        setDownloadStatus(`Download failed: ${error.message}`)
        toast.error(error.message || "Failed to download image. Please try again.")
      } finally {
        setTimeout(() => setDownloadStatus(null), 3000)
      }
    },
    [generatedArt],
  )

  const enhancePrompt = useCallback(async () => {
    if (!customPrompt.trim()) {
      toast.error("Please enter a custom prompt first.")
      return
    }

    setIsEnhancingPrompt(true)
    try {
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPrompt: customPrompt,
          dataset,
          scenario,
          colorScheme,
          numSamples,
          noiseScale,
          domeProjection: domeEnabled,
          domeDiameter: domeEnabled ? domeDiameter : undefined,
          domeResolution: domeEnabled ? domeResolution : undefined,
          panoramic360: panorama360Enabled,
          panoramaResolution: panorama360Enabled ? panoramaResolution : undefined,
          stereographicPerspective:
            panorama360Enabled && panoramaFormat === "stereographic" ? stereographicPerspective : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error(`Prompt enhancement failed: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setEnhancedPrompt(data.enhancedPrompt)
        setFinalPrompt(data.enhancedPrompt)
        setFinalPromptEdited(false)
        toast.success("Prompt Enhanced! ✨ Your prompt has been enhanced with mathematical and artistic details.")
      } else {
        throw new Error(data.error || "Prompt enhancement failed")
      }
    } catch (error: any) {
      console.error("Prompt enhancement error:", error)
      toast.error(error.message || "Failed to enhance prompt. Please try again.")
    } finally {
      setIsEnhancingPrompt(false)
    }
  }, [
    customPrompt,
    dataset,
    scenario,
    colorScheme,
    numSamples,
    noiseScale,
    domeEnabled,
    domeDiameter,
    domeResolution,
    panorama360Enabled,
    panoramaResolution,
    panoramaFormat,
    stereographicPerspective,
  ])

  const clearGallery = useCallback(() => {
    setGallery([])
    localStorage.removeItem("flowsketch-gallery")
    toast.success("Gallery Cleared - All generated artworks have been removed.")
  }, [])

  const randomizeSeed = useCallback(() => {
    const newSeed = Math.floor(Math.random() * 10000)
    setSeed(newSeed)
    toast.success(`Seed Randomized! 🎲 New seed: ${newSeed}`)
  }, [])

  const resetAllParameters = useCallback(() => {
    setDataset("thailand")
    setScenario("landscape")
    setColorScheme("sunset")
    setSeed(1234)
    setNumSamples(3000)
    setNoiseScale(0.1)
    setTimeStep(0.01)
    setCustomPrompt("")
    setEnhancedPrompt("")
    setFinalPrompt("")
    setFinalPromptEdited(false)
    setUseCustomPrompt(false)
    setShowFinalPrompt(false)
    setDomeEnabled(false)
    setPanorama360Enabled(true)
    setError(null)
    toast.success("Parameters Reset! 🔄 All settings restored to Thai defaults.")
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
              FlowSketch Art Generator
            </h1>
          </div>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Generate stunning mathematical visualizations and AI-powered artwork with advanced projection support for
            domes and 360° environments. Now featuring Thai Cultural Heritage!
          </p>
        </div>

        {/* Thai Showcase Banner */}
        {dataset === "thailand" && (
          <Card className="bg-gradient-to-r from-orange-900/50 to-yellow-900/50 border-orange-500/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-orange-100 flex items-center gap-2">
                    🇹🇭 Thai Cultural Heritage Showcase
                  </h3>
                  <p className="text-orange-200 text-sm">
                    Experience authentic Thai culture through AI-generated art featuring temples, dancers, markets, and
                    festivals
                  </p>
                </div>
                <Button
                  onClick={generateThaiShowcase}
                  disabled={isAutoGenerating || isGenerating}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {isAutoGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Showcase...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Generate Thai Showcase
                    </>
                  )}
                </Button>
              </div>
              {isAutoGenerating && (
                <div className="mt-4 space-y-2">
                  <Progress value={autoGenProgress} className="w-full" />
                  <p className="text-xs text-orange-300 text-center">{autoGenProgress.toFixed(0)}% complete</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800 border-slate-700">
            <TabsTrigger value="generate" className="data-[state=active]:bg-purple-600">
              <Calculator className="h-4 w-4 mr-2" />
              Generate Art
            </TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-purple-600">
              <ImageIcon className="h-4 w-4 mr-2" />
              Gallery ({gallery.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Controls */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-100">
                      <Settings className="h-5 w-5" />
                      Generation Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Mode Selection */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-300">Generation Mode</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={mode === "svg" ? "default" : "outline"}
                          onClick={() => setMode("svg")}
                          className={mode === "svg" ? "bg-purple-600 hover:bg-purple-700" : "border-slate-600"}
                        >
                          <Calculator className="h-4 w-4 mr-2" />
                          Mathematical SVG
                        </Button>
                        <Button
                          variant={mode === "ai" ? "default" : "outline"}
                          onClick={() => setMode("ai")}
                          className={mode === "ai" ? "bg-purple-600 hover:bg-purple-700" : "border-slate-600"}
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          AI Art
                        </Button>
                      </div>
                    </div>

                    {/* Dataset Selection */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-300">Mathematical Dataset</Label>
                      <Select value={dataset} onValueChange={setDataset}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="spirals">Fibonacci Spirals</SelectItem>
                          <SelectItem value="fractal">Fractal Trees</SelectItem>
                          <SelectItem value="mandelbrot">Mandelbrot Set</SelectItem>
                          <SelectItem value="julia">Julia Set</SelectItem>
                          <SelectItem value="lorenz">Lorenz Attractor</SelectItem>
                          <SelectItem value="hyperbolic">Hyperbolic Geometry</SelectItem>
                          <SelectItem value="gaussian">Gaussian Fields</SelectItem>
                          <SelectItem value="cellular">Cellular Automata</SelectItem>
                          <SelectItem value="voronoi">Voronoi Diagrams</SelectItem>
                          <SelectItem value="perlin">Perlin Noise</SelectItem>
                          <SelectItem value="diffusion">Reaction-Diffusion</SelectItem>
                          <SelectItem value="wave">Wave Interference</SelectItem>
                          <SelectItem value="moons">Lunar Orbital Mechanics</SelectItem>
                          <SelectItem value="tribes">Tribal Network Topology</SelectItem>
                          <SelectItem value="heads">Mosaic Head Compositions</SelectItem>
                          <SelectItem value="natives">Ancient Native Tribes</SelectItem>
                          <SelectItem value="thailand">Thai Cultural Heritage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Special Dataset Notices */}
                    {dataset === "tribes" && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
                        <h4 className="text-sm font-medium text-amber-900 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Enhanced Tribes Dataset Active
                        </h4>
                        <p className="text-xs text-amber-800">
                          You'll see: Villages with people, ritual ceremonies, chiefs & shamans, seasonal activities,
                          trading posts, and complex tribal societies with 50-250 people per tribe!
                        </p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs border-amber-300 text-amber-700">
                            Villages
                          </Badge>
                          <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                            People
                          </Badge>
                          <Badge variant="outline" className="text-xs border-red-300 text-red-700">
                            Rituals
                          </Badge>
                          <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                            Seasonal
                          </Badge>
                        </div>
                      </div>
                    )}

                    {dataset === "natives" && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                        <h4 className="text-sm font-medium text-green-900 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Ancient Native Tribes Dataset Active
                        </h4>
                        <p className="text-xs text-green-800">
                          Experience authentic indigenous civilizations: Longhouses & tipis, ceremonial dance circles,
                          medicine wheels, sacred groves, hunting grounds, and traditional tribal life!
                        </p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                            Longhouses
                          </Badge>
                          <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                            Dance Circles
                          </Badge>
                          <Badge variant="outline" className="text-xs border-purple-300 text-purple-700">
                            Medicine Wheels
                          </Badge>
                          <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700">
                            Sacred Groves
                          </Badge>
                        </div>
                      </div>
                    )}

                    {dataset === "thailand" && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 space-y-2">
                        <h4 className="text-sm font-medium text-orange-900 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Thai Cultural Heritage Dataset Active
                        </h4>
                        <p className="text-xs text-orange-800">
                          Experience authentic Thai culture: Golden temples (Wat), traditional Thai dancers, floating
                          markets, tuk-tuks, monks in saffron robes, royal palaces, Thai festivals, traditional
                          architecture, and vibrant street life!
                        </p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                            Temples
                          </Badge>
                          <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700">
                            Dancers
                          </Badge>
                          <Badge variant="outline" className="text-xs border-red-300 text-red-700">
                            Markets
                          </Badge>
                          <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                            Festivals
                          </Badge>
                          <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                            Architecture
                          </Badge>
                          <Badge variant="outline" className="text-xs border-purple-300 text-purple-700">
                            Monks
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* Generate Button */}
                    <div className="flex gap-2">
                      <Button
                        onClick={generateArt}
                        disabled={isGenerating || isAutoGenerating}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Thai Cultural Art
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Progress Bar */}
                    {isGenerating && progress > 0 && (
                      <div className="space-y-2">
                        <Progress value={progress} className="w-full" />
                        <p className="text-xs text-slate-400 text-center">{progress}% complete</p>
                      </div>
                    )}

                    {/* Error Display */}
                    {error && (
                      <Alert className="border-red-500 bg-red-500/10">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-red-400">{error}</AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Preview */}
              <div className="lg:col-span-2">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-slate-100">
                      <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Generated Thai Cultural Artwork
                      </div>
                      {generatedArt && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-orange-500 text-orange-400">
                            🇹🇭 Thai Heritage
                          </Badge>
                          {generatedArt.isDomeProjection && (
                            <Badge variant="outline" className="border-blue-500 text-blue-400">
                              Dome 10m
                            </Badge>
                          )}
                          {generatedArt.is360Panorama && (
                            <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                              360°
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {generatedArt ? (
                      <div className="space-y-4">
                        {/* Main Image */}
                        <div className="relative bg-slate-900 rounded-lg overflow-hidden">
                          {generatedArt.mode === "svg" ? (
                            <div
                              className="w-full h-96 flex items-center justify-center"
                              dangerouslySetInnerHTML={{ __html: generatedArt.svgContent }}
                            />
                          ) : (
                            <img
                              src={generatedArt.imageUrl || "/placeholder.svg"}
                              alt="Generated Thai cultural artwork"
                              className="w-full h-96 object-contain"
                            />
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                          <Button onClick={() => downloadImage("regular")} className="bg-green-600 hover:bg-green-700">
                            <Download className="h-4 w-4 mr-2" />
                            Download Thai Art
                          </Button>

                          {generatedArt.domeImageUrl && (
                            <Button
                              onClick={() => downloadImage("dome")}
                              variant="outline"
                              className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download Dome
                            </Button>
                          )}

                          {generatedArt.panorama360Url && (
                            <Button
                              onClick={() => downloadImage("panorama")}
                              variant="outline"
                              className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download 360°
                            </Button>
                          )}
                        </div>

                        {/* Download Status */}
                        {downloadStatus && (
                          <Alert className="border-green-500 bg-green-500/10">
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription className="text-green-400">{downloadStatus}</AlertDescription>
                          </Alert>
                        )}
                      </div>
                    ) : (
                      <div className="h-96 flex items-center justify-center text-slate-400">
                        <div className="text-center space-y-4">
                          <div className="w-16 h-16 mx-auto bg-slate-700 rounded-full flex items-center justify-center">
                            <ImageIcon className="h-8 w-8" />
                          </div>
                          <div>
                            <p className="text-lg font-medium">Ready to Generate Thai Cultural Art</p>
                            <p className="text-sm">Click "Generate Thai Cultural Art" to create stunning artwork</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-100">Thai Cultural Gallery</h2>
              <div className="flex items-center gap-2">
                {gallery.length > 0 && (
                  <Button
                    onClick={clearGallery}
                    variant="outline"
                    size="sm"
                    className="border-red-500 text-red-400 bg-transparent"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Gallery
                  </Button>
                )}
                <Badge variant="outline" className="border-slate-600">
                  {gallery.length} artworks
                </Badge>
              </div>
            </div>

            {gallery.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="py-12">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-slate-700 rounded-full flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-slate-300">No Thai artworks in gallery</p>
                      <p className="text-sm text-slate-400">Generate some Thai cultural art to see it here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentItems.map((art) => (
                  <Card key={art.id} className="bg-slate-800 border-slate-700 overflow-hidden">
                    <div className="relative">
                      {art.mode === "svg" ? (
                        <div
                          className="w-full h-48 bg-slate-900 flex items-center justify-center"
                          dangerouslySetInnerHTML={{ __html: art.svgContent }}
                        />
                      ) : (
                        <img
                          src={art.imageUrl || "/placeholder.svg"}
                          alt="Generated artwork"
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Badge variant="outline" className="bg-slate-800/80 border-orange-500 text-orange-400 text-xs">
                          🇹🇭 {art.mode === "svg" ? "SVG" : "AI"}
                        </Badge>
                        {art.isDomeProjection && (
                          <Badge variant="outline" className="bg-slate-800/80 border-blue-500 text-blue-400 text-xs">
                            Dome
                          </Badge>
                        )}
                        {art.is360Panorama && (
                          <Badge
                            variant="outline"
                            className="bg-slate-800/80 border-yellow-500 text-yellow-400 text-xs"
                          >
                            360°
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-medium text-slate-200 capitalize">
                            {art.params?.dataset || "Unknown"} + {art.params?.scenario || "Unknown"}
                          </h3>
                          <p className="text-sm text-slate-400 capitalize">
                            {art.params?.colorScheme || "Unknown"} palette
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setGeneratedArt(art)
                              // Switch to generate tab to view
                              const generateTab = document.querySelector('[value="generate"]') as HTMLElement
                              generateTab?.click()
                            }}
                            className="flex-1 bg-orange-600 hover:bg-orange-700"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadImage("regular")}
                            className="border-slate-600"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
