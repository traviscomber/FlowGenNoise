"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
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
  Dice1,
  Trash2,
  Play,
  Wand2,
  Globe,
  Mountain,
  Camera,
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

  // Enhanced generation parameters with Indonesian as default
  const [dataset, setDataset] = useState("indonesian")
  const [scenario, setScenario] = useState("cosmos")
  const [colorScheme, setColorScheme] = useState("cosmic")
  const [seed, setSeed] = useState(1234)
  const [numSamples, setNumSamples] = useState(3000)
  const [noiseScale, setNoiseScale] = useState(0.1)
  const [timeStep, setTimeStep] = useState(0.01)

  // Dome projection settings - configurable diameter
  const [domeEnabled, setDomeEnabled] = useState(true) // Enable by default to show all 3 versions
  const [domeDiameter, setDomeDiameter] = useState(20) // Default to 20 meters, configurable
  const [domeResolution, setDomeResolution] = useState("4K")
  const [domeProjectionType, setDomeProjectionType] = useState("fisheye")

  // 360° panorama settings
  const [panorama360Enabled, setPanorama360Enabled] = useState(true) // Enable by default to show all 3 versions
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
  const [useCustomPrompt, setUseCustomPrompt] = useState(false)

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

  const getDatasetDisplayName = (dataset: string): string => {
    const names: Record<string, string> = {
      nuanu: "Nuanu Creative City",
      bali: "Balinese Cultural Heritage",
      thailand: "Thai Cultural Heritage",
      indonesian: "Indonesian Genesis Creation Story",
      horror: "Indonesian Horror Creatures",
      spirals: "Mathematical Spirals",
      fractal: "Fractal Patterns",
      mandelbrot: "Mandelbrot Set",
      julia: "Julia Set",
      lorenz: "Lorenz Attractor",
      hyperbolic: "Hyperbolic Geometry",
      gaussian: "Gaussian Fields",
      cellular: "Cellular Automata",
      voronoi: "Voronoi Diagrams",
      perlin: "Perlin Noise",
      diffusion: "Reaction-Diffusion",
      wave: "Wave Interference",
      moons: "Lunar Orbital Mechanics",
      tribes: "Tribal Network Topology",
      heads: "Mosaic Head Compositions",
      natives: "Ancient Native Tribes",
      statues: "Sacred & Sculptural Statues",
    }
    return names[dataset] || dataset
  }

  const getDatasetScenarios = (dataset: string): Array<{ value: string; label: string; description: string }> => {
    const scenarios: Record<string, Array<{ value: string; label: string; description: string }>> = {
      indonesian: [
        { value: "pure", label: "Pure Mathematical", description: "Raw mathematical beauty" },

        // WEEK 1: COSMOS - The Divine Beginning
        {
          value: "cosmos",
          label: "🌌 COSMOS - Divine Beginning",
          description:
            "Sang Hyang Widhi Wasa creating the universe, cosmic egg Brahmanda, celestial realm Kahyangan, Batara Guru cosmic dance, serpent Ananta Sesha, cosmic tree Kalpataru, primordial sound OM AUM, cosmic mandala patterns, celestial beings Dewata, cosmic lotus Padma, divine breath Prana, cosmic fire Agni, cosmic waters Apah, cosmic time Kala, divine consciousness Atman",
        },

        // WEEK 2: WATER - Sacred Flowing Life Force
        {
          value: "water",
          label: "🌊 WATER - Sacred Life Force",
          description:
            "Dewi Sri water goddess, Mount Meru celestial waterfalls, Baruna ocean god on turtle Kurma, sacred springs Tirta, water temples Pura Tirta, Subak irrigation terraces, Ganges river Ganga, water spirits Nyi Roro Kidul, monsoon rains from Indra, sacred water buffalo, water festivals, holy water Tirta Amrita, underwater Naga kingdoms, sacred wells, water meditation, lotus flowers, water music",
        },

        // WEEK 3: PLANTS & ANIMALS - Living Ecosystem Symphony
        {
          value: "plants-animals",
          label: "🌿 PLANTS & ANIMALS - Living Symphony",
          description:
            "Dewi Sri rice goddess, sacred Banyan tree Beringin, Garuda divine eagle, Indonesian spice gardens, sacred Rafflesia flower, orangutan families, medicinal plants Jamu, sacred lotus Padma, Komodo dragons, butterfly gardens, rice goddess ceremonies, coral reefs, forest spirits Bunian, sacred elephants, Indonesian tigers, herbal medicine gardens, mangrove forests, animal totems",
        },

        // WEEK 4: VOLCANOES - Sacred Fire Mountains (Enhanced)
        {
          value: "volcanoes",
          label: "🌋 VOLCANOES - Sacred Fire Mountains",
          description:
            "Batara Agni fire god, Mount Merapi sacred volcano, Ring of Fire formation, volcanic ash Lahar, volcano worship ceremonies, Krakatoa legendary explosion, volcanic hot springs, sulfur miners at Kawah Ijen, Mount Agung spiritual axis, volcanic glass Obsidian, volcanic sand beaches, crater lakes Danau Kawah, volcanic stones in architecture, fire walking ceremonies, volcanic lightning, volcanic observatories, volcanic caves, volcanic agriculture, volcanic thermal energy",
        },

        // Traditional Cultural Scenarios
        {
          value: "garuda",
          label: "🦅 Garuda Wisnu Kencana Divine Eagle",
          description:
            "Majestic divine eagle with Lord Vishnu, cosmic wisdom, Indonesian archipelago, Ring of Fire volcanoes, gamelan music, Sanskrit mantras, Ramayana scenes, cosmic mandala patterns, Borobudur temples, traditional textiles",
        },
        {
          value: "wayang",
          label: "🎭 Wayang Kulit Shadow Theatre Epic",
          description:
            "Shadow puppet performance, master dalang puppeteer, Prince Rama and Sita, Hanuman monkey warrior, gamelan orchestra, traditional architecture, cultural heritage spanning 1000 years",
        },
        {
          value: "batik",
          label: "🎨 Sacred Batik Cosmic Patterns",
          description:
            "Master batik artisan with canting tool, parang rusak patterns, kawung geometric circles, mega mendung cloud motifs, natural dyes, UNESCO heritage craft, ancestral spirits guidance",
        },
        {
          value: "borobudur",
          label: "🏛️ Borobudur Buddhist Cosmic Mandala",
          description:
            "World's largest Buddhist monument, 2,672 relief panels, 504 Buddha statues, bell-shaped stupas, three circular platforms, pilgrims' enlightenment path, Mount Merapi backdrop",
        },
        {
          value: "komodo",
          label: "🐉 Komodo Dragons Ancient Guardians",
          description:
            "Prehistoric dragons on Flores and Rinca islands, largest living lizards, volcanic landscape, pink sand beaches, UNESCO World Heritage marine park, living prehistory",
        },
        {
          value: "dance",
          label: "💃 Traditional Sacred Dance Ceremonies",
          description:
            "Balinese Legong dancers, gamelan orchestra, Javanese court dances, Saman dance synchronization, temple ceremonies, UNESCO Intangible Cultural Heritage",
        },
        {
          value: "temples",
          label: "🛕 Hindu-Buddhist Temple Complexes",
          description:
            "Pura Besakih mother temple, multi-tiered meru towers, Prambanan temple complex, ceremonial gates, lotus ponds, incense smoke, devotees in white dress, gamelan music",
        },

        // Major Indigenous Groups
        {
          value: "javanese",
          label: "👑 Javanese Royal Court Culture",
          description:
            "Yogyakarta Sultan's palace, elaborate batik patterns, gamelan orchestras, wayang performances, Hindu-Buddhist-Islamic synthesis, terraced rice cultivation",
        },
        {
          value: "sundanese",
          label: "🎋 Sundanese Highland Heritage",
          description:
            "West Java mountainous terrain, bamboo architecture, angklung musical instruments, traditional dance, rice terraces, mountain festivals",
        },
        {
          value: "batak",
          label: "🏔️ Batak Tribal Lake Toba Culture",
          description:
            "North Sumatra Lake Toba, buffalo horn roofs, ulos textiles, patrilineal clan system, gondang instruments, megalithic monuments",
        },
        {
          value: "dayak",
          label: "🌳 Dayak Borneo Longhouse Tribes",
          description:
            "Kalimantan rainforest, traditional longhouses, intricate beadwork, river transportation, traditional tattoos, hornbill symbolism",
        },
        {
          value: "acehnese",
          label: "🕌 Acehnese Islamic Sultanate Culture",
          description:
            "Northernmost Sumatra, Islamic architecture, Saman dance, coffee cultivation, tsunami resilience, Grand Mosque Baiturrahman",
        },
        {
          value: "minangkabau",
          label: "🏠 Minangkabau Matrilineal Society",
          description:
            "West Sumatra, rumah gadang buffalo horn roofs, matrilineal inheritance, traditional cuisine, skilled traders, songket weaving",
        },
        {
          value: "balinese-tribe",
          label: "🌺 Balinese Hindu-Dharma Culture",
          description:
            "Hindu-Dharma religion, temple ceremonies, traditional architecture, rice terrace agriculture, artistic traditions, gamelan orchestras",
        },
        {
          value: "papuans",
          label: "🪶 Papuan Indigenous Diversity",
          description:
            "New Guinea cultural diversity, feathered headdresses, bird of paradise plumes, hundreds of languages, traditional hunting, body painting",
        },
        {
          value: "baduy",
          label: "🌿 Baduy Traditional Isolationist Community",
          description:
            "Banten Java traditional lifestyle, white and black clothing, sustainable agriculture, forest conservation, oral traditions",
        },
        {
          value: "orang-rimba",
          label: "🌲 Orang Rimba Forest Nomads",
          description:
            "Sumatra nomadic hunter-gatherers, forest shelters, shamanic beliefs, traditional medicine, forest knowledge, sustainable practices",
        },
        {
          value: "hongana-manyawa",
          label: "🏹 Hongana Manyawa Last Isolated Tribe",
          description:
            "Halmahera island nomadic tribe, forest shelters, traditional tools, shamanic practices, oral traditions, ecological knowledge",
        },
        {
          value: "asmat",
          label: "🎨 Asmat Master Woodcarvers",
          description:
            "New Guinea woodcarving masters, bis poles, ceremonial masks, sago palm cultivation, river transportation, UNESCO artistic tradition",
        },
      ],
      // Other datasets remain the same...
      nuanu: [
        { value: "pure", label: "Pure Mathematical", description: "Raw mathematical beauty" },
        { value: "thk-tower", label: "THK Tower", description: "Iconic architectural centerpiece" },
        { value: "popper-sentinels", label: "Popper Sentinels", description: "Guardian statue installations" },
        { value: "luna-beach", label: "Luna Beach Club", description: "Coastal creative space" },
        { value: "labyrinth-dome", label: "Labyrinth Dome", description: "Immersive dome experience" },
        { value: "creative-studios", label: "Creative Studios", description: "Artist workshops and spaces" },
        { value: "community-plaza", label: "Community Plaza", description: "Central gathering space" },
        { value: "digital-gardens", label: "Digital Gardens", description: "Tech-nature integration" },
      ],
      bali: [
        { value: "pure", label: "Pure Mathematical", description: "Raw mathematical beauty" },
        { value: "temples", label: "Hindu Temples", description: "Sacred Pura architecture" },
        {
          value: "rice-terraces",
          label: "Terraced Fields",
          description:
            "Mathematical stepped field patterns with geometric precision, cascading mathematical functions creating organic terraced compositions, golden ratio spiral arrangements in agricultural geometry, fractal field boundaries with natural mathematical harmony, algorithmic landscape design principles",
        },
        { value: "ceremonies", label: "Hindu Ceremonies", description: "Galungan and Kuningan festivals" },
        { value: "dancers", label: "Traditional Dancers", description: "Legong and Kecak performances" },
        { value: "beaches", label: "Tropical Beaches", description: "Volcanic sand and coral reefs" },
        { value: "artisans", label: "Balinese Artisans", description: "Wood carving and silver work" },
        { value: "volcanoes", label: "Sacred Volcanoes", description: "Mount Batur and Agung" },
      ],
      thailand: [
        { value: "pure", label: "Pure Mathematical", description: "Raw mathematical beauty" },
        { value: "landscape", label: "Natural Landscape", description: "Temples in tropical settings" },
        { value: "architectural", label: "Temple Architecture", description: "Traditional Thai buildings" },
        { value: "ceremonial", label: "Cultural Ceremonies", description: "Festivals and traditions" },
        { value: "urban", label: "Modern Thailand", description: "Bangkok street life" },
        { value: "botanical", label: "Thai Gardens", description: "Lotus ponds and tropical flora" },
        { value: "floating", label: "Floating Markets", description: "Traditional water markets" },
        { value: "monks", label: "Buddhist Monks", description: "Saffron robes and meditation" },
      ],
      spirals: [
        { value: "pure", label: "Pure Mathematical", description: "Raw mathematical beauty" },
        { value: "fibonacci", label: "Fibonacci Spirals", description: "Golden ratio mathematics" },
        { value: "galaxy", label: "Galactic Arms", description: "Cosmic spiral formations" },
        { value: "nautilus", label: "Nautilus Shells", description: "Natural spiral patterns" },
        { value: "vortex", label: "Energy Vortex", description: "Dynamic spiral flows" },
        { value: "logarithmic", label: "Logarithmic", description: "Mathematical precision" },
        { value: "hurricane", label: "Hurricane Patterns", description: "Weather spiral systems" },
        { value: "dna", label: "DNA Helixes", description: "Biological double spirals" },
      ],
      fractal: [
        { value: "pure", label: "Pure Mathematical", description: "Raw mathematical beauty" },
        { value: "tree", label: "Tree Fractals", description: "Branching organic structures" },
        { value: "lightning", label: "Lightning Patterns", description: "Electric fractal forms" },
        { value: "fern", label: "Fern Fronds", description: "Delicate recursive patterns" },
        { value: "dragon", label: "Dragon Curves", description: "Complex mathematical curves" },
        { value: "julia", label: "Julia Sets", description: "Complex plane fractals" },
        { value: "snowflake", label: "Koch Snowflakes", description: "Geometric fractal boundaries" },
        { value: "coral", label: "Coral Reefs", description: "Natural fractal growth" },
      ],
      mandelbrot: [
        { value: "pure", label: "Pure Mathematical", description: "Raw mathematical beauty" },
        { value: "classic", label: "Classic Set", description: "Traditional Mandelbrot" },
        { value: "zoom", label: "Infinite Zoom", description: "Deep fractal exploration" },
        { value: "bulbs", label: "Cardioid Bulbs", description: "Main set structures" },
        { value: "seahorse", label: "Seahorse Valley", description: "Detailed fractal regions" },
        { value: "psychedelic", label: "Psychedelic", description: "Vibrant color escapes" },
        { value: "tendrils", label: "Fractal Tendrils", description: "Delicate spiral extensions" },
        { value: "burning", label: "Burning Ship", description: "Alternative fractal formula" },
      ],
      tribes: [
        { value: "pure", label: "Pure Mathematical", description: "Raw mathematical beauty" },
        { value: "village", label: "Tribal Villages", description: "Settlement patterns" },
        { value: "ceremony", label: "Sacred Ceremonies", description: "Ritual gatherings" },
        { value: "hunting", label: "Hunting Scenes", description: "Traditional activities" },
        { value: "crafts", label: "Traditional Crafts", description: "Artisan work" },
        { value: "storytelling", label: "Storytelling", description: "Cultural narratives" },
        { value: "migration", label: "Seasonal Migration", description: "Nomadic movements" },
        { value: "warfare", label: "Tribal Warfare", description: "Historical conflicts" },
      ],
      heads: [
        { value: "pure", label: "Pure Mathematical", description: "Raw mathematical beauty" },
        { value: "portraits", label: "Portrait Gallery", description: "Individual faces" },
        { value: "mosaic", label: "Face Mosaics", description: "Tessellated compositions" },
        { value: "expressions", label: "Expressions", description: "Emotional diversity" },
        { value: "profiles", label: "Profile Views", description: "Side perspectives" },
        { value: "abstract", label: "Abstract Faces", description: "Geometric interpretation" },
        { value: "elderly", label: "Wisdom Lines", description: "Aged character studies" },
        { value: "children", label: "Youthful Joy", description: "Innocent expressions" },
      ],
      natives: [
        { value: "pure", label: "Pure Mathematical", description: "Raw mathematical beauty" },
        { value: "longhouse", label: "Longhouses", description: "Traditional architecture" },
        { value: "tipis", label: "Tipi Circles", description: "Sacred arrangements" },
        { value: "totems", label: "Totem Poles", description: "Spiritual symbols" },
        { value: "powwow", label: "Powwow Gathering", description: "Cultural celebrations" },
        { value: "seasons", label: "Seasonal Life", description: "Natural cycles" },
        { value: "canoes", label: "River Canoes", description: "Water transportation" },
        { value: "dreamcatcher", label: "Dreamcatchers", description: "Protective talismans" },
      ],
      statues: [
        { value: "pure", label: "Pure Mathematical", description: "Raw mathematical beauty" },
        { value: "buddha", label: "Buddha Statues", description: "Serene meditation poses" },
        { value: "cats", label: "Cat Sculptures", description: "Feline grace and mystery" },
        { value: "greek", label: "Greek Classics", description: "Ancient marble perfection" },
        { value: "modern", label: "Modern Art", description: "Contemporary sculptural forms" },
        { value: "angels", label: "Angelic Figures", description: "Divine winged guardians" },
        { value: "warriors", label: "Warrior Statues", description: "Heroic battle poses" },
        { value: "animals", label: "Animal Totems", description: "Wildlife in stone and bronze" },
      ],
      horror: [
        { value: "pure", label: "Pure Mathematical", description: "Raw mathematical beauty" },
        { value: "kuntilanak", label: "Kuntilanak", description: "Female ghost in white" },
        { value: "pocong", label: "Pocong", description: "Wrapped corpse ghost" },
        { value: "genderuwo", label: "Genderuwo", description: "Hairy ape-like demon" },
        { value: "tuyul", label: "Tuyul", description: "Child spirit thief" },
        { value: "sundelbolong", label: "Sundel Bolong", description: "Back-holed ghost" },
        { value: "leak", label: "Leak", description: "Flying head with organs" },
        { value: "banaspati", label: "Banaspati", description: "Fire spirit" },
      ],
    }
    return (
      scenarios[dataset] || [
        { value: "pure", label: "Pure Mathematical", description: "Raw mathematical beauty" },
        { value: "landscape", label: "Landscape", description: "Natural environment" },
        { value: "abstract", label: "Abstract", description: "Pure mathematical form" },
        { value: "geometric", label: "Geometric", description: "Structured patterns" },
        { value: "organic", label: "Organic", description: "Natural forms" },
        { value: "crystalline", label: "Crystalline", description: "Crystal structures" },
        { value: "fluid", label: "Fluid Dynamics", description: "Flow patterns" },
        { value: "quantum", label: "Quantum Fields", description: "Subatomic visualization" },
      ]
    )
  }

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
        panoramaFormat: panoramaFormat,
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

        toast.success(
          `Mathematical SVG Generated! 🎨 ${dataset} + ${scenario} visualization created with ${numSamples} data points.`,
        )
      } else {
        // Generate AI art
        setProgress(20)
        console.log("Calling AI art API...")

        // Prepare the custom prompt to send
        const promptToSend = useCustomPrompt && customPrompt.trim() ? customPrompt.trim() : undefined

        const requestBody = {
          dataset,
          scenario,
          colorScheme,
          seed,
          numSamples,
          noise: noiseScale,
          timeStep,
          customPrompt: promptToSend, // Send the actual custom prompt
          domeProjection: domeEnabled,
          domeDiameter: domeEnabled ? domeDiameter : undefined,
          domeResolution: domeEnabled ? domeResolution : undefined,
          projectionType: domeEnabled ? domeProjectionType : undefined,
          panoramic360: panorama360Enabled,
          panoramaResolution: panorama360Enabled ? panoramaResolution : undefined,
          panoramaFormat: panoramaFormat,
          stereographicPerspective:
            panorama360Enabled && panoramaFormat === "stereographic" ? stereographicPerspective : undefined,
        }

        console.log("Sending AI request:", requestBody)
        console.log("Custom prompt being sent:", promptToSend ? promptToSend.substring(0, 100) + "..." : "None")

        const response = await fetch("/api/generate-ai-art", {
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
            if (errorData.details) {
              console.error("Error details:", errorData.details)
            }
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
          domeImageUrl: data.domeImage || data.image, // Always set dome image
          panorama360Url: data.panoramaImage || data.image, // Always set panorama image
          params,
          mode: "ai" as const,
          customPrompt: promptToSend,
          originalPrompt: data.originalPrompt,
          finalPrompt: data.originalPrompt,
          promptLength: data.promptLength,
          estimatedFileSize: data.estimatedFileSize,
          provider: data.provider,
          model: data.model,
          timestamp: Date.now(),
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          isDomeProjection: true, // Always true since we generate all versions
          is360Panorama: true, // Always true since we generate all versions
          domeSpecs: {
            diameter: domeDiameter,
            resolution: domeResolution,
            projectionType: domeProjectionType,
          },
          panoramaSpecs: {
            resolution: panoramaResolution,
            format: panoramaFormat,
          },
          generationDetails: data.generationDetails,
        }
        setGeneratedArt(newArt)
        setGallery((prev) => [newArt, ...prev])

        // Clear custom prompt after successful generation
        if (useCustomPrompt && customPrompt.trim()) {
          setCustomPrompt("")
          setEnhancedPrompt("")
          toast.success(
            `Custom ${getDatasetDisplayName(dataset)} Art Generated! ✨ Your custom prompt was integrated with ${dataset} + ${scenario} using OpenAI DALL-E 3.`,
          )
        } else {
          toast.success(
            `${getDatasetDisplayName(dataset)} Complete Set Generated! ✨ Created original + dome + 360° versions using OpenAI DALL-E 3.`,
          )
        }

        setProgress(100)
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
    domeEnabled,
    domeDiameter,
    domeResolution,
    domeProjectionType,
    panorama360Enabled,
    panoramaResolution,
    panoramaFormat,
    stereographicPerspective,
  ])

  // Auto-generate showcase with all scenarios
  const generateShowcase = useCallback(async () => {
    setIsAutoGenerating(true)
    setAutoGenProgress(0)

    const allScenarios = getDatasetScenarios(dataset)
    const showcaseScenarios = allScenarios // Use all scenarios

    try {
      for (let i = 0; i < showcaseScenarios.length; i++) {
        const { value: newScenario, label, description } = showcaseScenarios[i]

        // Update settings
        setScenario(newScenario)
        setColorScheme("cosmic")
        setSeed(Math.floor(Math.random() * 10000))

        setAutoGenProgress(((i + 1) / showcaseScenarios.length) * 100)

        toast.success(`🎨 Generating ${i + 1}/${showcaseScenarios.length}: ${label}`)

        // Wait for state to update
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Generate artwork
        await generateArt()

        // Wait between generations
        if (i < showcaseScenarios.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 3000))
        }
      }

      toast.success(
        `🎉 ${getDatasetDisplayName(dataset)} Showcase Complete! Generated ${showcaseScenarios.length} unique artworks.`,
      )
    } catch (error) {
      toast.error("Showcase generation failed. Please try again.")
    } finally {
      setIsAutoGenerating(false)
      setAutoGenProgress(0)
    }
  }, [generateArt, dataset])

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
          domeResolution: domeResolution ? domeResolution : undefined,
          panoramic360: panorama360Enabled,
          panoramaResolution: panoramaResolution ? panoramaResolution : undefined,
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
        setCustomPrompt(data.enhancedPrompt) // Update the custom prompt with enhanced version
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
            filename = `flowsketch-dome-${generatedArt.params?.dataset || "unknown"}-${Date.now()}.${generatedArt.mode === "svg" ? "svg" : "jpg"}`
            break
          case "panorama":
            if (!generatedArt.panorama360Url) {
              throw new Error("No 360° panorama available")
            }
            imageUrl = generatedArt.panorama360Url
            filename = `flowsketch-360-${generatedArt.params?.dataset || "unknown"}-${Date.now()}.${generatedArt.mode === "svg" ? "svg" : "jpg"}`
            break
          default:
            imageUrl = generatedArt.imageUrl
            filename = `flowsketch-${generatedArt.params?.dataset || "unknown"}-${Date.now()}.${generatedArt.mode === "svg" ? "svg" : "jpg"}`
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
    setDataset("indonesian")
    setScenario("cosmos")
    setColorScheme("cosmic")
    setSeed(1234)
    setNumSamples(3000)
    setNoiseScale(0.1)
    setTimeStep(0.01)
    setCustomPrompt("")
    setEnhancedPrompt("")
    setUseCustomPrompt(false)
    setDomeEnabled(true)
    setPanorama360Enabled(true)
    setError(null)
    toast.success("Parameters Reset! 🔄 All settings restored to defaults.")
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
            domes and 360° environments. Now featuring the complete Indonesian Genesis Creation Story! 🇮🇩✨
          </p>
        </div>

        {/* Indonesian Genesis Creation Story Banner */}
        <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-purple-100 flex items-center gap-2">
                  🌌 Indonesian Genesis Creation Story - 4 Fundamental Elements
                </h3>
                <p className="text-purple-200 text-sm">
                  Experience the complete Indonesian creation mythology: COSMOS (Divine Beginning), WATER (Sacred Life
                  Force), PLANTS & ANIMALS (Living Symphony), and VOLCANOES (Sacred Fire Mountains) - each with detailed
                  GODLEVEL scenarios
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="outline" className="border-blue-500 text-blue-400">
                    🌌 COSMOS
                  </Badge>
                  <Badge variant="outline" className="border-cyan-500 text-cyan-400">
                    🌊 WATER
                  </Badge>
                  <Badge variant="outline" className="border-green-500 text-green-400">
                    🌿 PLANTS & ANIMALS
                  </Badge>
                  <Badge variant="outline" className="border-red-500 text-red-400">
                    🌋 VOLCANOES
                  </Badge>
                </div>
              </div>
              <Button
                onClick={generateShowcase}
                disabled={isAutoGenerating || isGenerating}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isAutoGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Genesis...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Generate Complete Genesis Story
                  </>
                )}
              </Button>
            </div>
            {isAutoGenerating && (
              <div className="mt-4 space-y-2">
                <Progress value={autoGenProgress} className="w-full" />
                <p className="text-xs text-purple-300 text-center">
                  {autoGenProgress.toFixed(0)}% complete - Creating Indonesian Genesis Creation Story
                </p>
              </div>
            )}
          </CardContent>
        </Card>

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
                          <SelectItem value="indonesian">🇮🇩 Indonesian Genesis Creation Story (GODLEVEL)</SelectItem>
                          <SelectItem value="nuanu">🏗️ Nuanu Creative City</SelectItem>
                          <SelectItem value="bali">🏝️ Balinese Cultural Heritage</SelectItem>
                          <SelectItem value="thailand">🇹🇭 Thai Cultural Heritage</SelectItem>
                          <SelectItem value="horror">👻 Indonesian Horror Creatures</SelectItem>
                          <SelectItem value="spirals">🌀 Fibonacci Spirals</SelectItem>
                          <SelectItem value="fractal">🌿 Fractal Trees</SelectItem>
                          <SelectItem value="mandelbrot">🎭 Mandelbrot Set</SelectItem>
                          <SelectItem value="julia">🔮 Julia Set</SelectItem>
                          <SelectItem value="lorenz">🌪️ Lorenz Attractor</SelectItem>
                          <SelectItem value="hyperbolic">📐 Hyperbolic Geometry</SelectItem>
                          <SelectItem value="gaussian">📊 Gaussian Fields</SelectItem>
                          <SelectItem value="cellular">🔲 Cellular Automata</SelectItem>
                          <SelectItem value="voronoi">🕸️ Voronoi Diagrams</SelectItem>
                          <SelectItem value="perlin">🌊 Perlin Noise</SelectItem>
                          <SelectItem value="diffusion">⚗️ Reaction-Diffusion</SelectItem>
                          <SelectItem value="wave">〰️ Wave Interference</SelectItem>
                          <SelectItem value="moons">🌙 Lunar Orbital Mechanics</SelectItem>
                          <SelectItem value="tribes">🏘️ Tribal Network Topology</SelectItem>
                          <SelectItem value="heads">👥 Mosaic Head Compositions</SelectItem>
                          <SelectItem value="natives">🏕️ Ancient Native Tribes</SelectItem>
                          <SelectItem value="statues">🗿 Sacred & Sculptural Statues</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Dataset Info */}
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-600">
                      <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4" />
                        {getDatasetDisplayName(dataset)} Active
                      </h4>
                      <p className="text-xs text-slate-400">
                        {dataset === "indonesian"
                          ? "Complete Indonesian Genesis Creation Story with 4 fundamental elements: Cosmos, Water, Plants & Animals, and Volcanoes - each with detailed GODLEVEL scenarios and traditional cultural elements."
                          : `This dataset includes ${getDatasetScenarios(dataset).length} unique scenarios for comprehensive artistic exploration.`}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {getDatasetScenarios(dataset)
                          .slice(0, 4)
                          .map((scenario, index) => (
                            <Badge key={index} variant="outline" className="text-xs border-slate-500 text-slate-400">
                              {scenario.label}
                            </Badge>
                          ))}
                        {getDatasetScenarios(dataset).length > 4 && (
                          <Badge variant="outline" className="text-xs border-slate-500 text-slate-400">
                            +{getDatasetScenarios(dataset).length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Scenario Selection */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-300">Visual Scenario</Label>
                      <Select value={scenario} onValueChange={setScenario}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          {getDatasetScenarios(dataset).map((scenarioOption) => (
                            <SelectItem key={scenarioOption.value} value={scenarioOption.value}>
                              {scenarioOption.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Scenario Description */}
                    {dataset === "indonesian" && (
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-600">
                        <h4 className="text-sm font-medium text-slate-300 mb-2">
                          {getDatasetScenarios(dataset).find((s) => s.value === scenario)?.label}
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {getDatasetScenarios(dataset).find((s) => s.value === scenario)?.description}
                        </p>
                      </div>
                    )}

                    {/* Color Scheme */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-300">Color Palette</Label>
                      <Select value={colorScheme} onValueChange={setColorScheme}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="cosmic">🌌 Cosmic</SelectItem>
                          <SelectItem value="plasma">🔥 Plasma</SelectItem>
                          <SelectItem value="quantum">⚛️ Quantum</SelectItem>
                          <SelectItem value="thermal">🌡️ Thermal</SelectItem>
                          <SelectItem value="spectral">🌈 Spectral</SelectItem>
                          <SelectItem value="crystalline">💎 Crystalline</SelectItem>
                          <SelectItem value="bioluminescent">🦠 Bioluminescent</SelectItem>
                          <SelectItem value="aurora">🌌 Aurora</SelectItem>
                          <SelectItem value="metallic">⚙️ Metallic</SelectItem>
                          <SelectItem value="prismatic">🔮 Prismatic</SelectItem>
                          <SelectItem value="monochromatic">⚫ Monochromatic</SelectItem>
                          <SelectItem value="infrared">🔴 Infrared</SelectItem>
                          <SelectItem value="lava">🌋 Lava</SelectItem>
                          <SelectItem value="futuristic">🚀 Futuristic</SelectItem>
                          <SelectItem value="forest">🌲 Forest</SelectItem>
                          <SelectItem value="ocean">🌊 Ocean</SelectItem>
                          <SelectItem value="sunset">🌅 Sunset</SelectItem>
                          <SelectItem value="arctic">❄️ Arctic</SelectItem>
                          <SelectItem value="neon">💡 Neon</SelectItem>
                          <SelectItem value="vintage">📻 Vintage</SelectItem>
                          <SelectItem value="toxic">☢️ Toxic</SelectItem>
                          <SelectItem value="ember">🔥 Ember</SelectItem>
                          <SelectItem value="lunar">🌙 Lunar</SelectItem>
                          <SelectItem value="tidal">🌊 Tidal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Mathematical Parameters */}
                    <div className="space-y-3 pt-3 border-t border-slate-600">
                      <h4 className="text-sm font-medium text-slate-300">Mathematical Parameters</h4>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium text-slate-300">Random Seed</Label>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={randomizeSeed}
                            className="h-6 px-2 text-xs border-slate-600 bg-transparent"
                          >
                            <Dice1 className="h-3 w-3" />
                          </Button>
                        </div>
                        <Input
                          type="number"
                          value={seed}
                          onChange={(e) => setSeed(Number.parseInt(e.target.value) || 0)}
                          className="bg-slate-700 border-slate-600 text-slate-100"
                          min="0"
                          max="9999"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-300">
                          Data Points: {numSamples.toLocaleString()}
                        </Label>
                        <Slider
                          value={[numSamples]}
                          onValueChange={(value) => setNumSamples(value[0])}
                          min={100}
                          max={10000}
                          step={100}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-300">Noise Scale: {noiseScale}</Label>
                        <Slider
                          value={[noiseScale]}
                          onValueChange={(value) => setNoiseScale(value[0])}
                          min={0}
                          max={1}
                          step={0.01}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-300">Time Step: {timeStep}</Label>
                        <Slider
                          value={[timeStep]}
                          onValueChange={(value) => setTimeStep(value[0])}
                          min={0.001}
                          max={0.1}
                          step={0.001}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Custom Prompt for AI */}
                    {mode === "ai" && (
                      <div className="space-y-3 pt-3 border-t border-slate-600">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center space-x-2">
                            <Switch checked={useCustomPrompt} onCheckedChange={setUseCustomPrompt} />
                            <span className="text-sm font-medium text-slate-300">Custom AI Prompt</span>
                          </Label>
                        </div>
                        {useCustomPrompt && (
                          <div className="space-y-3">
                            <Textarea
                              value={customPrompt}
                              onChange={(e) => setCustomPrompt(e.target.value)}
                              placeholder="Describe your vision... (will be enhanced with GODLEVEL Indonesian Genesis elements)"
                              className="bg-slate-700 border-slate-600 text-slate-100 text-sm min-h-[100px] resize-vertical"
                              rows={4}
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={enhancePrompt}
                                disabled={isEnhancingPrompt || !customPrompt.trim()}
                                size="sm"
                                variant="outline"
                                className="border-purple-500 text-purple-400 hover:bg-purple-500/10 bg-transparent"
                              >
                                {isEnhancingPrompt ? (
                                  <>
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                    Enhancing...
                                  </>
                                ) : (
                                  <>
                                    <Wand2 className="h-3 w-3 mr-1" />
                                    Enhance Prompt
                                  </>
                                )}
                              </Button>
                            </div>
                            {customPrompt && (
                              <div className="bg-slate-900 p-3 rounded-md border border-slate-600">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium text-slate-400">CURRENT CUSTOM PROMPT</span>
                                  <span className="text-xs text-slate-500">{customPrompt.length} characters</span>
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                  {customPrompt}
                                </p>
                                <div className="mt-2 pt-2 border-t border-slate-700">
                                  <p className="text-xs text-slate-500">
                                    This custom prompt will be integrated with {getDatasetDisplayName(dataset)} GODLEVEL
                                    elements and mathematical precision based on your selected parameters.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Projection Settings */}
                    <div className="space-y-3 pt-3 border-t border-slate-600">
                      <h4 className="text-sm font-medium text-slate-300">Projection Settings</h4>

                      {/* Dome Projection */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center space-x-2">
                            <Switch checked={domeEnabled} onCheckedChange={setDomeEnabled} />
                            <span className="text-sm font-medium text-slate-300">
                              Dome Projection ({domeDiameter}m)
                            </span>
                          </Label>
                        </div>
                        {domeEnabled && (
                          <div className="space-y-2 pl-6">
                            <div className="space-y-1">
                              <Label className="text-xs text-slate-400">Dome Diameter (meters)</Label>
                              <Select
                                value={domeDiameter.toString()}
                                onValueChange={(value) => setDomeDiameter(Number(value))}
                              >
                                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100 h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-700 border-slate-600">
                                  <SelectItem value="10">10m (Small Dome)</SelectItem>
                                  <SelectItem value="15">15m (Medium Dome)</SelectItem>
                                  <SelectItem value="20">20m (Large Dome)</SelectItem>
                                  <SelectItem value="25">25m (Extra Large Dome)</SelectItem>
                                  <SelectItem value="30">30m (Giant Dome)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-slate-400">Resolution</Label>
                              <Select value={domeResolution} onValueChange={setDomeResolution}>
                                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100 h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-700 border-slate-600">
                                  <SelectItem value="2K">2K (2048x2048)</SelectItem>
                                  <SelectItem value="4K">4K (4096x4096)</SelectItem>
                                  <SelectItem value="8K">8K (8192x8192)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-slate-400">Projection Type</Label>
                              <Select value={domeProjectionType} onValueChange={setDomeProjectionType}>
                                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100 h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-700 border-slate-600">
                                  <SelectItem value="fisheye">Fisheye</SelectItem>
                                  <SelectItem value="equidistant">Equidistant</SelectItem>
                                  <SelectItem value="stereographic">Stereographic</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 360° Panorama */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center space-x-2">
                            <Switch checked={panorama360Enabled} onCheckedChange={setPanorama360Enabled} />
                            <span className="text-sm font-medium text-slate-300">360° Panorama</span>
                          </Label>
                        </div>
                        {panorama360Enabled && (
                          <div className="space-y-2 pl-6">
                            <div className="space-y-1">
                              <Label className="text-xs text-slate-400">Resolution</Label>
                              <Select value={panoramaResolution} onValueChange={setPanoramaResolution}>
                                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100 h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-700 border-slate-600">
                                  <SelectItem value="4K">4K (4096x2048)</SelectItem>
                                  <SelectItem value="8K">8K (8192x4096)</SelectItem>
                                  <SelectItem value="16K">16K (16384x8192)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-slate-400">Format</Label>
                              <Select value={panoramaFormat} onValueChange={setPanoramaFormat}>
                                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100 h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-700 border-slate-600">
                                  <SelectItem value="equirectangular">Equirectangular</SelectItem>
                                  <SelectItem value="stereographic">Stereographic</SelectItem>
                                  <SelectItem value="cylindrical">Cylindrical</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {panoramaFormat === "stereographic" && (
                              <div className="space-y-1">
                                <Label className="text-xs text-slate-400">Perspective</Label>
                                <Select value={stereographicPerspective} onValueChange={setStereographicPerspective}>
                                  <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100 h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-slate-700 border-slate-600">
                                    <SelectItem value="little-planet">Little Planet</SelectItem>
                                    <SelectItem value="tunnel">Tunnel</SelectItem>
                                    <SelectItem value="mirror-ball">Mirror Ball</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

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
                            Generating GODLEVEL Genesis Art (3 Versions)...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            {useCustomPrompt && customPrompt.trim()
                              ? "Generate Custom GODLEVEL Genesis Art (3 Versions)"
                              : `Generate ${getDatasetDisplayName(dataset)} GODLEVEL (3 Versions)`}
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Progress Bar */}
                    {isGenerating && progress > 0 && (
                      <div className="space-y-2">
                        <Progress value={progress} className="w-full" />
                        <p className="text-xs text-slate-400 text-center">
                          {progress}% complete - Creating GODLEVEL Original + Dome + 360° versions
                        </p>
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

              {/* Preview - Enhanced to show all 3 versions clearly */}
              <div className="lg:col-span-2">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-slate-100">
                      <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Generated {getDatasetDisplayName(dataset)} GODLEVEL Artwork
                      </div>
                      {generatedArt && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-purple-500 text-purple-400">
                            ✨ {getDatasetDisplayName(dataset)}
                          </Badge>
                          <Badge variant="outline" className="border-green-500 text-green-400">
                            3 GODLEVEL Versions
                          </Badge>
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {generatedArt ? (
                      <div className="space-y-6">
                        {/* Three Version Display */}
                        <Tabs defaultValue="original" className="w-full">
                          <TabsList className="grid w-full grid-cols-3 bg-slate-700">
                            <TabsTrigger value="original" className="data-[state=active]:bg-blue-600">
                              <Camera className="h-4 w-4 mr-2" />
                              Original
                            </TabsTrigger>
                            <TabsTrigger value="dome" className="data-[state=active]:bg-purple-600">
                              <Mountain className="h-4 w-4 mr-2" />
                              Dome {domeDiameter}m
                            </TabsTrigger>
                            <TabsTrigger value="panorama" className="data-[state=active]:bg-green-600">
                              <Globe className="h-4 w-4 mr-2" />
                              360° VR
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="original" className="space-y-4">
                            <div className="relative bg-slate-900 rounded-lg overflow-hidden border-2 border-blue-500/30">
                              {generatedArt.mode === "svg" ? (
                                <div
                                  className="w-full h-96 flex items-center justify-center"
                                  dangerouslySetInnerHTML={{ __html: generatedArt.svgContent }}
                                />
                              ) : (
                                <img
                                  src={generatedArt.imageUrl || "/placeholder.svg"}
                                  alt={`Generated ${getDatasetDisplayName(dataset)} artwork - Original`}
                                  className="w-full h-96 object-cover"
                                />
                              )}
                              <div className="absolute top-2 left-2">
                                <Badge className="bg-blue-600 text-white">
                                  <Camera className="h-3 w-3 mr-1" />
                                  Original GODLEVEL
                                </Badge>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-slate-300">Standard GODLEVEL Genesis Art</h4>
                              <p className="text-xs text-slate-400">
                                Traditional format perfect for prints, displays, and standard viewing with
                                hyperrealistic Indonesian Genesis detail
                              </p>
                              <Button
                                onClick={() => downloadImage("regular")}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download Original GODLEVEL Version
                              </Button>
                            </div>
                          </TabsContent>

                          <TabsContent value="dome" className="space-y-4">
                            <div className="relative bg-slate-900 rounded-lg overflow-hidden border-2 border-purple-500/30">
                              {generatedArt.mode === "svg" ? (
                                <div
                                  className="w-full h-96 flex items-center justify-center"
                                  dangerouslySetInnerHTML={{ __html: generatedArt.svgContent }}
                                />
                              ) : (
                                <img
                                  src={generatedArt.domeImageUrl || generatedArt.imageUrl || "/placeholder.svg"}
                                  alt={`Generated ${getDatasetDisplayName(dataset)} artwork - Dome Projection`}
                                  className="w-full h-96 object-cover"
                                />
                              )}
                              <div className="absolute top-2 left-2">
                                <Badge className="bg-purple-600 text-white">
                                  <Mountain className="h-3 w-3 mr-1" />
                                  Dome {domeDiameter}m GODLEVEL
                                </Badge>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-slate-300">
                                GODLEVEL Planetarium Dome Projection ({domeDiameter}m)
                              </h4>
                              <p className="text-xs text-slate-400">
                                {domeProjectionType} projection optimized for {domeDiameter}m diameter planetarium dome
                                with immersive fisheye effect and hyperrealistic Indonesian Genesis cultural details
                              </p>
                              <div className="flex gap-2 text-xs">
                                <Badge variant="outline" className="border-purple-500 text-purple-400">
                                  {domeResolution}
                                </Badge>
                                <Badge variant="outline" className="border-purple-500 text-purple-400">
                                  {domeProjectionType}
                                </Badge>
                                <Badge variant="outline" className="border-purple-500 text-purple-400">
                                  GODLEVEL Genesis
                                </Badge>
                              </div>
                              <Button
                                onClick={() => downloadImage("dome")}
                                className="w-full bg-purple-600 hover:bg-purple-700"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download Dome GODLEVEL Version
                              </Button>
                            </div>
                          </TabsContent>

                          <TabsContent value="panorama" className="space-y-4">
                            <div className="relative bg-slate-900 rounded-lg overflow-hidden border-2 border-green-500/30">
                              {generatedArt.mode === "svg" ? (
                                <div
                                  className="w-full h-96 flex items-center justify-center"
                                  dangerouslySetInnerHTML={{ __html: generatedArt.svgContent }}
                                />
                              ) : (
                                <img
                                  src={generatedArt.panorama360Url || generatedArt.imageUrl || "/placeholder.svg"}
                                  alt={`Generated ${getDatasetDisplayName(dataset)} artwork - 360° Panorama`}
                                  className="w-full h-96 object-cover"
                                />
                              )}
                              <div className="absolute top-2 left-2">
                                <Badge className="bg-green-600 text-white">
                                  <Globe className="h-3 w-3 mr-1" />
                                  360° VR GODLEVEL
                                </Badge>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-slate-300">
                                GODLEVEL 360° Virtual Reality Panorama
                              </h4>
                              <p className="text-xs text-slate-400">
                                {panoramaFormat} format at {panoramaResolution} resolution, perfect for VR headsets and
                                immersive viewing with hyperrealistic Indonesian Genesis cultural immersion
                              </p>
                              <div className="flex gap-2 text-xs">
                                <Badge variant="outline" className="border-green-500 text-green-400">
                                  {panoramaResolution}
                                </Badge>
                                <Badge variant="outline" className="border-green-500 text-green-400">
                                  {panoramaFormat}
                                </Badge>
                                <Badge variant="outline" className="border-green-500 text-green-400">
                                  GODLEVEL Genesis
                                </Badge>
                                {panoramaFormat === "stereographic" && (
                                  <Badge variant="outline" className="border-green-500 text-green-400">
                                    {stereographicPerspective}
                                  </Badge>
                                )}
                              </div>
                              <Button
                                onClick={() => downloadImage("panorama")}
                                className="w-full bg-green-600 hover:bg-green-700"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download 360° GODLEVEL Version
                              </Button>
                            </div>
                          </TabsContent>
                        </Tabs>

                        {/* Download Status */}
                        {downloadStatus && (
                          <Alert className="border-green-500 bg-green-500/10">
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription className="text-green-400">{downloadStatus}</AlertDescription>
                          </Alert>
                        )}

                        {/* Generation Status Summary */}
                        {generatedArt.mode === "ai" && generatedArt.generationDetails && (
                          <div className="bg-slate-900 p-4 rounded-lg border border-slate-600">
                            <h4 className="text-sm font-medium text-slate-300 mb-3">
                              GODLEVEL Generation Status Summary
                            </h4>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="text-center">
                                <div className="flex items-center justify-center mb-2">
                                  <Camera className="h-5 w-5 text-blue-400" />
                                </div>
                                <p className="text-xs font-medium text-slate-300">Original</p>
                                <Badge variant="outline" className="text-xs mt-1 border-green-500 text-green-400">
                                  {generatedArt.generationDetails.mainImage}
                                </Badge>
                              </div>
                              <div className="text-center">
                                <div className="flex items-center justify-center mb-2">
                                  <Mountain className="h-5 w-5 text-purple-400" />
                                </div>
                                <p className="text-xs font-medium text-slate-300">Dome</p>
                                <Badge
                                  variant="outline"
                                  className={`text-xs mt-1 ${
                                    generatedArt.generationDetails.domeImage.includes("successfully")
                                      ? "border-green-500 text-green-400"
                                      : "border-yellow-500 text-yellow-400"
                                  }`}
                                >
                                  {generatedArt.generationDetails.domeImage.includes("successfully")
                                    ? "✓ GODLEVEL Generated"
                                    : "⚠ Fallback"}
                                </Badge>
                              </div>
                              <div className="text-center">
                                <div className="flex items-center justify-center mb-2">
                                  <Globe className="h-5 w-5 text-green-400" />
                                </div>
                                <p className="text-xs font-medium text-slate-300">360° VR</p>
                                <Badge
                                  variant="outline"
                                  className={`text-xs mt-1 ${
                                    generatedArt.generationDetails.panoramaImage.includes("successfully")
                                      ? "border-green-500 text-green-400"
                                      : "border-yellow-500 text-yellow-400"
                                  }`}
                                >
                                  {generatedArt.generationDetails.panoramaImage.includes("successfully")
                                    ? "✓ GODLEVEL Generated"
                                    : "⚠ Fallback"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Artwork Details */}
                        <div className="space-y-3 pt-4 border-t border-slate-600">
                          <h4 className="text-sm font-medium text-slate-300">GODLEVEL Genesis Artwork Details</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-slate-400">Dataset:</span>
                              <p className="text-slate-200 capitalize">{generatedArt.params?.dataset || "N/A"}</p>
                            </div>
                            <div>
                              <span className="text-slate-400">Scenario:</span>
                              <p className="text-slate-200 capitalize">{generatedArt.params?.scenario || "N/A"}</p>
                            </div>
                            <div>
                              <span className="text-slate-400">Color Scheme:</span>
                              <p className="text-slate-200 capitalize">{generatedArt.params?.colorScheme || "N/A"}</p>
                            </div>
                            <div>
                              <span className="text-slate-400">Seed:</span>
                              <p className="text-slate-200">{generatedArt.params?.seed || "N/A"}</p>
                            </div>
                            <div>
                              <span className="text-slate-400">Data Points:</span>
                              <p className="text-slate-200">
                                {generatedArt.params?.numSamples?.toLocaleString() || "N/A"}
                              </p>
                            </div>
                            <div>
                              <span className="text-slate-400">Noise Scale:</span>
                              <p className="text-slate-200">{generatedArt.params?.noiseScale || "N/A"}</p>
                            </div>
                            <div>
                              <span className="text-slate-400">Time Step:</span>
                              <p className="text-slate-200">{generatedArt.params?.timeStep || "N/A"}</p>
                            </div>
                            {generatedArt.mode === "ai" && generatedArt.provider && (
                              <div>
                                <span className="text-slate-400">Provider:</span>
                                <p className="text-slate-200 capitalize">{generatedArt.provider}</p>
                              </div>
                            )}
                          </div>

                          {/* Custom Prompt Display */}
                          {generatedArt.mode === "ai" && generatedArt.customPrompt && (
                            <div className="space-y-2">
                              <span className="text-slate-400 text-sm">Custom GODLEVEL Prompt Used:</span>
                              <div className="bg-slate-900 p-3 rounded-md max-h-32 overflow-y-auto">
                                <p className="text-slate-300 text-sm leading-relaxed">{generatedArt.customPrompt}</p>
                              </div>
                            </div>
                          )}

                          {generatedArt.mode === "ai" && generatedArt.finalPrompt && (
                            <div className="space-y-2">
                              <span className="text-slate-400 text-sm">Final Enhanced GODLEVEL Genesis Prompt:</span>
                              <div className="bg-slate-900 p-3 rounded-md max-h-32 overflow-y-auto">
                                <p className="text-slate-300 text-sm leading-relaxed">
                                  {generatedArt.finalPrompt.substring(0, 500)}
                                  {generatedArt.finalPrompt.length > 500 && "..."}
                                </p>
                                {generatedArt.promptLength && (
                                  <p className="text-slate-500 text-xs mt-2">{generatedArt.promptLength} characters</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="h-96 flex items-center justify-center text-slate-400">
                        <div className="text-center space-y-4">
                          <div className="w-16 h-16 mx-auto bg-slate-700 rounded-full flex items-center justify-center">
                            <ImageIcon className="h-8 w-8" />
                          </div>
                          <div>
                            <p className="text-lg font-medium">
                              Ready to Generate {getDatasetDisplayName(dataset)} GODLEVEL Genesis Art
                            </p>
                            <p className="text-sm">
                              {useCustomPrompt && customPrompt.trim()
                                ? "Your custom prompt will be enhanced with GODLEVEL Indonesian Genesis elements"
                                : `Click "Generate ${getDatasetDisplayName(dataset)} GODLEVEL" to create all 3 hyperrealistic versions`}
                            </p>
                            <div className="flex justify-center gap-4 mt-4">
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Camera className="h-4 w-4" />
                                Original
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Mountain className="h-4 w-4" />
                                Dome
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Globe className="h-4 w-4" />
                                360° VR
                              </div>
                            </div>
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
              <h2 className="text-2xl font-bold text-slate-100">GODLEVEL Genesis Art Gallery</h2>
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
                  {gallery.length} GODLEVEL artworks
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
                      <p className="text-lg font-medium text-slate-300">No GODLEVEL Genesis artworks in gallery</p>
                      <p className="text-sm text-slate-400">
                        Generate some GODLEVEL Indonesian Genesis art to see it here
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
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
                            alt="Generated GODLEVEL Genesis artwork"
                            className="w-full h-48 object-cover"
                          />
                        )}
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Badge
                            variant="outline"
                            className="bg-slate-800/80 border-purple-500 text-purple-400 text-xs"
                          >
                            ✨ {art.mode === "svg" ? "SVG" : "AI"} GODLEVEL
                          </Badge>
                          {art.customPrompt && (
                            <Badge
                              variant="outline"
                              className="bg-slate-800/80 border-purple-500 text-purple-400 text-xs"
                            >
                              Custom
                            </Badge>
                          )}
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
                        <h3 className="text-lg font-medium text-slate-200 truncate">
                          {art.mode === "svg"
                            ? "Mathematical GODLEVEL Visualization"
                            : "AI Generated GODLEVEL Genesis Art"}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {new Date(art.timestamp).toLocaleDateString()} - {art.params?.dataset || "Unknown"} GODLEVEL
                          Genesis
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <Button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      className="border-slate-600"
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-slate-400">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      className="border-slate-600"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Reset Button */}
        <div className="text-center">
          <Button
            onClick={resetAllParameters}
            variant="secondary"
            className="bg-slate-700 hover:bg-slate-600 text-slate-300"
          >
            <Settings className="h-4 w-4 mr-2" />
            Reset All Parameters
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-slate-500 text-sm">
          <p>
            Created with ❤️ by{" "}
            <a
              href="https://twitter.com/steveagoni"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-400 underline"
            >
              @steveagoni
            </a>{" "}
            - Powered by GODLEVEL Indonesian Genesis Creation Story and AI. 🇮🇩✨
          </p>
          <p>
            <a
              href="https://github.com/steveagoni/flowsketch"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-400 underline"
            >
              View Source Code on GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
