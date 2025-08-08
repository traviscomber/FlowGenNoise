"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
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
import { Sparkles, Settings, ImageIcon, Calculator, Download, Eye, AlertCircle, CheckCircle, Loader2, Globe, Mountain, Dices } from 'lucide-react'
import { generateFlowField, generateDomeProjection as generateDomeSVG, type GenerationParams } from "@/lib/flow-model"

type Scenario = { value: string; label: string; description?: string }

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

const DATASETS: Array<{ value: string; label: string }> = [
  { value: "nuanu", label: "Nuanu Creative City" },
  { value: "bali", label: "Bali" },
  { value: "thailand", label: "Thailand" },
  { value: "indonesian", label: "Indonesian Heritage" },
  { value: "horror", label: "Indonesian Horror" },
  { value: "spirals", label: "Spirals" },
  { value: "fractal", label: "Fractal" },
  { value: "mandelbrot", label: "Mandelbrot" },
  { value: "julia", label: "Julia" },
  { value: "lorenz", label: "Lorenz" },
  { value: "hyperbolic", label: "Hyperbolic Geometry" },
  { value: "gaussian", label: "Gaussian Fields" },
  { value: "cellular", label: "Cellular Automata" },
  { value: "voronoi", label: "Voronoi Diagrams" },
  { value: "perlin", label: "Perlin Noise" },
  { value: "diffusion", label: "Reaction-Diffusion" },
  { value: "wave", label: "Wave Interference" },
  { value: "moons", label: "Moons" },
  { value: "tribes", label: "Tribes" },
  { value: "heads", label: "Heads" },
  { value: "natives", label: "Natives" },
  { value: "statues", label: "Statues" },
  { value: "8bit", label: "8bit" },
  { value: "escher", label: "M.C. Escher" },
  { value: "bosch", label: "Hieronymus Bosch" },
  { value: "picasso", label: "Pablo Picasso" },
  { value: "genesis", label: "Genesis" },
  { value: "camouflage", label: "Camouflage" },
]

function useScenarios(dataset: string): Scenario[] {
  return useMemo<Scenario[]>(() => {
    if (dataset === "indonesian") {
      return [
        { value: "pure", label: "Pure Mathematical Indonesian" },
        { value: "garuda", label: "🦅 Garuda Wisnu Kencana Divine Eagle" },
        { value: "wayang", label: "🎭 Wayang Kulit Shadow Theatre Epic" },
        { value: "batik", label: "🎨 Sacred Batik Cosmic Patterns" },
        { value: "borobudur", label: "🏛️ Borobudur Buddhist Cosmic Mandala" },
        { value: "komodo", label: "🦎 Komodo Dragon Ancient Guardian" },
        { value: "dance", label: "💃 Traditional Dance Ceremonies" },
        { value: "volcanoes", label: "🌋 Sacred Volcanic Landscapes" },
        { value: "dayak", label: "🏹 Dayak Tribal Warriors" },
        { value: "toraja", label: "⚰️ Toraja Death Rituals" },
        { value: "batak", label: "🎭 Batak Shamanic Traditions" },
        { value: "asmat", label: "🗿 Asmat Wood Carving Spirits" },
        { value: "mentawai", label: "🌿 Mentawai Jungle Shamans" },
        { value: "dani", label: "🏔️ Dani Highland Warriors" },
        { value: "bugis", label: "⛵ Bugis Maritime Legends" },
        { value: "minangkabau", label: "🏠 Minangkabau Matriarchal Society" },
        { value: "sundanese", label: "🎵 Sundanese Musical Traditions" },
        { value: "javanese", label: "👑 Javanese Royal Courts" },
        { value: "balinese", label: "🕉️ Balinese Hindu Ceremonies" },
        { value: "acehnese", label: "🕌 Acehnese Islamic Heritage" },
        { value: "papuan", label: "🎨 Papuan Tribal Art" },
        { value: "flores", label: "🌺 Flores Island Mysteries" },
        { value: "sumba", label: "🐎 Sumba Megalithic Culture" },
        { value: "nias", label: "🗿 Nias Stone Jumping Rituals" },
        { value: "tengger", label: "🌋 Tengger Volcano Worshippers" },
        { value: "baduy", label: "🌾 Baduy Traditional Farmers" },
        { value: "sasak", label: "🏺 Sasak Pottery Masters" },
        { value: "makassar", label: "🏰 Makassar Trading Empire" },
        { value: "moluccan", label: "🌶️ Moluccan Spice Islands" },
        { value: "betawi", label: "🎪 Betawi Jakarta Culture" },
        { value: "lampung", label: "🐘 Lampung Elephant Riders" },
        { value: "riau", label: "🛶 Riau River Communities" },
        { value: "kalimantan", label: "🌳 Kalimantan Forest Spirits" },
        { value: "sulawesi", label: "🦋 Sulawesi Butterfly Dancers" },
        { value: "maluku", label: "🏝️ Maluku Island Traditions" },
        { value: "irian", label: "🦜 Irian Jaya Bird of Paradise" },
        { value: "timor", label: "🌅 Timor Sunrise Ceremonies" },
        { value: "lombok", label: "🏔️ Lombok Mountain Spirits" },
        { value: "sumbawa", label: "🐃 Sumbawa Buffalo Races" },
        { value: "bangka", label: "⛏️ Bangka Tin Mining Heritage" },
        { value: "belitung", label: "🏖️ Belitung Beach Legends" },
        { value: "natuna", label: "🐠 Natuna Sea Nomads" },
        { value: "anambas", label: "🏝️ Anambas Island Mysteries" },
        { value: "krakatau", label: "💥 Krakatau Volcanic Power" },
        { value: "merapi", label: "🔥 Merapi Sacred Fire Mountain" },
        { value: "bromo", label: "🌄 Bromo Sunrise Rituals" },
        { value: "rinjani", label: "⛰️ Rinjani Holy Mountain" },
        { value: "kerinci", label: "🌿 Kerinci Forest Guardians" },
        { value: "leuser", label: "🦧 Leuser Orangutan Sanctuary" },
        { value: "ujung-kulon", label: "🦏 Ujung Kulon Rhino Reserve" },
        { value: "bunaken", label: "🐠 Bunaken Marine Paradise" },
        { value: "raja-ampat", label: "🐙 Raja Ampat Underwater Kingdom" },
        { value: "wakatobi", label: "🐢 Wakatobi Turtle Sanctuary" },
        { value: "derawan", label: "🦈 Derawan Manta Ray Ballet" },
        { value: "thousand-islands", label: "🏝️ Thousand Islands Paradise" },
        { value: "karimunjawa", label: "🌊 Karimunjawa Blue Waters" },
        { value: "weh", label: "🤿 Weh Island Diving Mecca" },
        { value: "morotai", label: "⚓ Morotai WWII History" },
        { value: "halmahera", label: "🌋 Halmahera Volcanic Chain" },
        { value: "ternate", label: "🏰 Ternate Spice Sultanate" },
        { value: "tidore", label: "👑 Tidore Royal Heritage" },
        { value: "banda", label: "🌰 Banda Nutmeg Islands" },
        { value: "kei", label: "🏖️ Kei Islands White Sands" },
        { value: "aru", label: "🦜 Aru Islands Bird Paradise" },
        { value: "tanimbar", label: "🎭 Tanimbar Cultural Masks" },
        { value: "sermata", label: "🌊 Sermata Ocean Spirits" },
        { value: "alor", label: "🎵 Alor Traditional Music" },
        { value: "lembata", label: "🐋 Lembata Whale Hunters" },
        { value: "pantar", label: "🌋 Pantar Volcanic Islands" },
        { value: "solor", label: "⛵ Solor Maritime Culture" },
        { value: "adonara", label: "🌺 Adonara Flower Islands" },
        { value: "ende", label: "🌈 Ende Colored Lakes" },
        { value: "ngada", label: "🗿 Ngada Megalithic Villages" },
        { value: "manggarai", label: "🕷️ Manggarai Spider Web Fields" },
        { value: "rote", label: "🎵 Rote Sasando Music" },
        { value: "sabu", label: "🌾 Sabu Lontar Palm Culture" },
        { value: "kupang", label: "🏛️ Kupang Colonial Heritage" },
        { value: "atambua", label: "🏔️ Atambua Mountain Tribes" },
        { value: "belu", label: "🎭 Belu Traditional Ceremonies" },
        { value: "malaka", label: "🌿 Malaka Forest Wisdom" },
        { value: "tetun", label: "🗣️ Tetun Language Keepers" },
        { value: "kemak", label: "🏹 Kemak Warrior Traditions" },
        { value: "bunaq", label: "🌾 Bunaq Agricultural Rituals" },
        { value: "fataluku", label: "🌊 Fataluku Coastal Guardians" },
        { value: "makasae", label: "⛰️ Makasae Mountain Dwellers" },
        { value: "naueti", label: "🌸 Naueti Flower Ceremonies" },
        { value: "galoli", label: "🎨 Galoli Artistic Traditions" },
        { value: "mambae", label: "🌿 Mambae Herbal Healers" },
        { value: "tokodede", label: "🏔️ Tokodede Highland Culture" },
        { value: "habun", label: "🌾 Habun Rice Terraces" },
        { value: "kairui", label: "🌊 Kairui River Spirits" },
        { value: "midiki", label: "🎭 Midiki Mask Dancers" },
        { value: "isni", label: "🌺 Isni Sacred Flowers" },
        { value: "lakalei", label: "🏹 Lakalei Hunter Gatherers" },
        { value: "lolein", label: "🌿 Lolein Forest Shamans" },
        { value: "lovaia", label: "🌊 Lovaia Ocean Nomads" },
        { value: "lolotoe", label: "⛰️ Lolotoe Mountain Spirits" },
        { value: "tutuala", label: "🌅 Tutuala Sunrise Watchers" },
        { value: "lautem", label: "🏖️ Lautem Coastal Traditions" },
        { value: "lospalos", label: "🎵 Lospalos Musical Heritage" },
        { value: "iliomar", label: "🌾 Iliomar Agricultural Wisdom" },
        { value: "laga", label: "🌊 Laga Wave Riders" },
        { value: "baguia", label: "🏔️ Baguia Mountain Guardians" },
        { value: "quelicai", label: "🌿 Quelicai Forest Keepers" },
        { value: "uatolari", label: "🌺 Uatolari Flower Gardens" },
        { value: "viqueque", label: "🎭 Viqueque Cultural Center" },
        { value: "ossu", label: "🏹 Ossu Warrior Clans" },
        { value: "watulari", label: "🗿 Watulari Stone Circles" },
        { value: "beaco", label: "🌾 Beaco Harvest Festivals" },
        { value: "venilale", label: "⛰️ Venilale Sacred Peaks" },
        { value: "baucau", label: "🏛️ Baucau Ancient Ruins" },
        { value: "vemasse", label: "🌊 Vemasse Coastal Spirits" },
        { value: "laleia", label: "🌺 Laleia Tropical Gardens" },
        { value: "manatuto", label: "🌾 Manatuto Rice Cultures" },
        { value: "laclo", label: "🌊 Laclo River Ceremonies" },
        { value: "laclubar", label: "🏔️ Laclubar Highland Tribes" },
        { value: "marobo", label: "🌿 Marobo Forest Spirits" },
        { value: "barique", label: "🎭 Barique Mask Traditions" },
        { value: "soibada", label: "⛰️ Soibada Mountain Culture" },
        { value: "manufahi", label: "🌾 Manufahi Agricultural Heritage" },
        { value: "betano", label: "🌊 Betano Fishing Villages" },
        { value: "cova-lima", label: "🏖️ Cova Lima Coastal Plains" },
        { value: "suai", label: "🌺 Suai Flower Markets" },
        { value: "tilomar", label: "🌿 Tilomar Border Guardians" },
        { value: "bobonaro", label: "🏔️ Bobonaro Mountain Passes" },
        { value: "maliana", label: "🎵 Maliana Musical Traditions" },
        { value: "balibo", label: "🏛️ Balibo Historical Sites" },
        { value: "batugade", label: "🌊 Batugade Border Rivers" },
        { value: "liquica", label: "🌺 Liquica Coastal Beauty" },
        { value: "bazartete", label: "🎭 Bazartete Market Culture" },
        { value: "maubara", label: "🏖️ Maubara Beach Traditions" },
        { value: "ermera", label: "☕ Ermera Coffee Mountains" },
        { value: "atsabe", label: "🌿 Atsabe Highland Forests" },
        { value: "letefoho", label: "⛰️ Letefoho Sacred Heights" },
        { value: "hatolia", label: "🌾 Hatolia Terraced Fields" },
        { value: "railaco", label: "🌊 Railaco River Valleys" },
        { value: "zumalai", label: "🏔️ Zumalai Mountain Spirits" },
        { value: "ainaro", label: "🌺 Ainaro Flower Highlands" },
        { value: "hatu-builico", label: "⛰️ Hatu Builico Peaks" },
        { value: "maubisse", label: "🌿 Maubisse Cool Mountains" },
        { value: "same", label: "🎭 Same Cultural Crossroads" },
        { value: "alas", label: "🌊 Alas River Spirits" },
        { value: "turiscai", label: "🏔️ Turiscai Highland Culture" },
        { value: "dili", label: "🏛️ Dili Capital Heritage" },
        { value: "cristo-rei", label: "⛪ Cristo Rei Sacred Statue" },
        { value: "dom-aleixo", label: "🌺 Dom Aleixo Urban Gardens" },
        { value: "nain-feto", label: "👑 Nain Feto Royal District" },
        { value: "vera-cruz", label: "✝️ Vera Cruz Holy Cross" },
        { value: "metinaro", label: "🌊 Metinaro Coastal Plains" },
      ]
    }
    if (dataset === "escher") {
      return [
        { value: "pure", label: "Pure Mathematical" },
        { value: "birds-fish-tessellation", label: "🐦🐟 Birds & Fish Tessellation" },
        { value: "impossible-penrose-triangle", label: "🔺 Impossible Penrose Triangle" },
      ]
    }
    if (dataset === "8bit") {
      return [
        { value: "pure", label: "Pure" },
        { value: "glitch-matrix", label: "Glitch Matrix" },
        { value: "neon-synthwave", label: "Neon Synthwave" },
        { value: "pixel-storm", label: "Pixel Storm" },
        { value: "digital-decay", label: "Digital Decay" },
        { value: "quantum-bits", label: "Quantum Bits" },
        { value: "retro-cosmos", label: "Retro Cosmos" },
        { value: "cyber-mandala", label: "Cyber Mandala" },
        { value: "pixel-fractals", label: "Pixel Fractals" },
        { value: "data-cathedral", label: "Data Cathedral" },
        { value: "electric-dreams", label: "Electric Dreams" },
        { value: "pixel-phoenix", label: "Pixel Phoenix" },
        { value: "binary-blizzard", label: "Binary Blizzard" },
        { value: "chrome-cascade", label: "Chrome Cascade" },
        { value: "neon-labyrinth", label: "Neon Labyrinth" },
      ]
    }
    if (dataset === "bosch") {
      return [
        { value: "pure", label: "Pure" },
        { value: "garden-earthly-delights", label: "Garden of Earthly Delights" },
        { value: "temptation-saint-anthony", label: "Temptation of Saint Anthony" },
        { value: "ship-fools", label: "Ship of Fools" },
        { value: "seven-deadly-sins", label: "Seven Deadly Sins" },
        { value: "haywain-triptych", label: "Haywain Triptych" },
        { value: "last-judgment", label: "Last Judgment" },
        { value: "death-miser", label: "Death and the Miser" },
        { value: "conjurer", label: "The Conjurer" },
        { value: "stone-operation", label: "Stone Operation" },
        { value: "adoration-magi", label: "Adoration of Magi" },
        { value: "christ-carrying-cross", label: "Christ Carrying Cross" },
      ]
    }
    return [
      { value: "pure", label: "Pure Mathematical" },
      { value: "landscape", label: "Landscape" },
      { value: "abstract", label: "Abstract" },
    ]
  }, [dataset])
}

function getDatasetDisplayName(dataset: string): string {
  const names: Record<string, string> = {
    nuanu: "Nuanu Creative City",
    bali: "Balinese Cultural Heritage",
    thailand: "Thai Cultural Heritage",
    indonesian: "Indonesian Mythology & Tribal Heritage",
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
    "8bit": "8bit Pixel Art Generation",
    escher: "M.C. Escher Mathematical Art",
    bosch: "Hieronymus Bosch Fantastical Worlds",
    picasso: "Pablo Picasso Cubist Masterpieces",
    genesis: "Genesis Creation",
    camouflage: "Nature's Camouflage Mastery",
    spiralsShort: "Mathematical Spirals",
  }
  return names[dataset] || dataset
}

export default function FlowArtGenerator() {
  const [generatedArt, setGeneratedArt] = useState<GeneratedArt | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [mode, setMode] = useState<"svg" | "ai">("ai")
  const [error, setError] = useState<string | null>(null)
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null)

  // Defaults
  const [dataset, setDataset] = useState("indonesian")
  const [scenario, setScenario] = useState("garuda")
  const [colorScheme, setColorScheme] = useState("metallic")
  const [seed, setSeed] = useState(1234)
  const [numSamples, setNumSamples] = useState(3000)
  const [noiseScale, setNoiseScale] = useState(0.1)
  const [timeStep, setTimeStep] = useState(0.01)

  // Dome & 360
  const [domeEnabled, setDomeEnabled] = useState(true)
  const [domeDiameter, setDomeDiameter] = useState(20)
  const [domeResolution, setDomeResolution] = useState("4K")
  const [domeProjectionType, setDomeProjectionType] = useState("fisheye")

  const [panorama360Enabled, setPanorama360Enabled] = useState(true)
  const [panoramaResolution, setPanoramaResolution] = useState("8K")
  const [panoramaFormat, setPanoramaFormat] = useState("equirectangular")
  const [stereographicPerspective, setStereographicPerspective] = useState("little-planet")

  // Gallery
  const [gallery, setGallery] = useState<GeneratedArt[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // Prompt
  const [customPrompt, setCustomPrompt] = useState("")
  const [useCustomPrompt, setUseCustomPrompt] = useState(false)

  const scenarios = useScenarios(dataset)

  // Randomization functions
  const randomizeSeed = useCallback(() => {
    setSeed(Math.floor(Math.random() * 10000))
  }, [])

  const randomizeNoise = useCallback(() => {
    setNoiseScale(Number((Math.random() * 0.4 + 0.01).toFixed(2)))
  }, [])

  const randomizeTimeStep = useCallback(() => {
    setTimeStep(Number((Math.random() * 0.15 + 0.005).toFixed(3)))
  }, [])

  const randomizeAll = useCallback(() => {
    randomizeSeed()
    randomizeNoise()
    randomizeTimeStep()
  }, [randomizeSeed, randomizeNoise, randomizeTimeStep])

  // Load gallery with migration for legacy items (prevents .toUpperCase errors)
  useEffect(() => {
    const saved = localStorage.getItem("flowsketch-gallery")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const migrated: GeneratedArt[] = Array.isArray(parsed)
          ? parsed.map((item: any) => {
              const safeMode: "svg" | "ai" = item?.mode === "svg" || item?.mode === "ai" ? item.mode : (item?.svgContent ? "svg" : "ai")
              const safeParams: GenerationParams =
                item?.params && typeof item.params === "object"
                  ? item.params
                  : {
                      dataset: item?.dataset ?? "indonesian",
                      scenario: item?.scenario ?? "pure",
                      colorScheme: item?.colorScheme ?? "metallic",
                      seed: item?.seed ?? 0,
                      numSamples: item?.numSamples ?? 1000,
                      noiseScale: item?.noiseScale ?? 0.1,
                      timeStep: item?.timeStep ?? 0.01,
                      domeProjection: !!item?.domeEnabled,
                      panoramic360: !!item?.panorama360Enabled,
                    }
              return {
                svgContent: item?.svgContent ?? "",
                imageUrl: item?.imageUrl ?? "/placeholder.svg?height=800&width=800",
                domeImageUrl: item?.domeImageUrl,
                panorama360Url: item?.panorama360Url,
                params: safeParams,
                mode: safeMode,
                customPrompt: item?.customPrompt,
                originalPrompt: item?.originalPrompt,
                finalPrompt: item?.finalPrompt,
                promptLength: item?.promptLength,
                timestamp: item?.timestamp ?? Date.now(),
                id: item?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                isDomeProjection: item?.isDomeProjection,
                is360Panorama: item?.is360Panorama,
                domeSpecs: item?.domeSpecs,
                panoramaSpecs: item?.panoramaSpecs,
                estimatedFileSize: item?.estimatedFileSize,
                provider: item?.provider,
                model: item?.model,
                generationDetails: item?.generationDetails,
              } as GeneratedArt
            })
          : []
        setGallery(migrated)
      } catch (e) {
        console.error("Failed to load gallery:", e)
      }
    }
  }, [])

  // Persist gallery
  useEffect(() => {
    localStorage.setItem("flowsketch-gallery", JSON.stringify(gallery))
  }, [gallery])

  // Reset pagination on gallery change
  useEffect(() => {
    setCurrentPage(1)
  }, [gallery.length])

  // Ensure scenario stays valid for dataset
  useEffect(() => {
    const exists = scenarios.find((s) => s.value === scenario)
    if (!exists && scenarios[0]) {
      setScenario(scenarios[0].value)
    }
  }, [dataset, scenarios, scenario])

  const generateArt = useCallback(async () => {
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
        panoramaFormat,
        stereographicPerspective:
          panorama360Enabled && panoramaFormat === "stereographic" ? stereographicPerspective : undefined,
      }

      if (mode === "svg") {
        setProgress(35)
        const svgContent = generateFlowField(params)
        const svgBlob = new Blob([svgContent], { type: "image/svg+xml" })
        const imageUrl = URL.createObjectURL(svgBlob)

        let domeImageUrl: string | undefined
        let panorama360Url: string | undefined

        if (domeEnabled) {
          setProgress(65)
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
          setProgress(85)
          const panoBlob = new Blob([svgContent], { type: "image/svg+xml" })
          panorama360Url = URL.createObjectURL(panoBlob)
        }

        const newArt: GeneratedArt = {
          svgContent,
          imageUrl,
          domeImageUrl,
          panorama360Url,
          params,
          mode: "svg",
          timestamp: Date.now(),
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          isDomeProjection: !!domeEnabled,
          is360Panorama: !!panorama360Enabled,
          domeSpecs: domeEnabled
            ? { diameter: domeDiameter, resolution: domeResolution, projectionType: domeProjectionType }
            : undefined,
          panoramaSpecs: panorama360Enabled ? { resolution: panoramaResolution, format: panoramaFormat } : undefined,
        }

        setGeneratedArt(newArt)
        setGallery((prev) => [newArt, ...prev])
        setProgress(100)
        toast.success("Mathematical SVG generated!")
      } else {
        setProgress(20)
        const body = {
          dataset,
          scenario,
          colorScheme,
          seed,
          numSamples,
          noise: noiseScale,
          timeStep,
          customPrompt: useCustomPrompt && customPrompt.trim() ? customPrompt.trim() : undefined,
          domeProjection: domeEnabled,
          domeDiameter: domeEnabled ? domeDiameter : undefined,
          domeResolution: domeResolution ? domeResolution : undefined,
          projectionType: domeEnabled ? domeProjectionType : undefined,
          panoramic360: panorama360Enabled,
          panoramaResolution: panorama360Enabled ? panoramaResolution : undefined,
          panoramaFormat,
          stereographicPerspective:
            panorama360Enabled && panoramaFormat === "stereographic" ? stereographicPerspective : undefined,
        }

        const res = await fetch("/api/generate-ai-art", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })

        if (!res.ok) {
          const txt = await res.text()
          throw new Error(txt || `AI API error: ${res.status}`)
        }

        const data = await res.json()
        if (!data.success) throw new Error(data.error || "AI generation failed")

        const newArt: GeneratedArt = {
          svgContent: "",
          imageUrl: data.image,
          domeImageUrl: data.domeImage || data.image,
          panorama360Url: data.panoramaImage || data.image,
          params,
          mode: "ai",
          customPrompt: body.customPrompt,
          originalPrompt: data.originalPrompt,
          finalPrompt: data.finalPrompt,
          promptLength: data.promptLength,
          estimatedFileSize: data.estimatedFileSize,
          provider: data.provider,
          model: data.model,
          generationDetails: data.generationDetails,
          timestamp: Date.now(),
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          isDomeProjection: true,
          is360Panorama: true,
          domeSpecs: { diameter: domeDiameter, resolution: domeResolution, projectionType: domeProjectionType },
          panoramaSpecs: { resolution: panoramaResolution, format: panoramaFormat },
        }

        setGeneratedArt(newArt)
        setGallery((prev) => [newArt, ...prev])
        setProgress(100)
        toast.success("AI art generated ✨")
      }
    } catch (e: any) {
      setError(e?.message || "Failed to generate")
      toast.error(e?.message || "Failed to generate")
    } finally {
      setIsGenerating(false)
      setTimeout(() => setProgress(0), 300)
    }
  }, [
    mode,
    dataset,
    scenario,
    colorScheme,
    seed,
    numSamples,
    noiseScale,
    timeStep,
    domeEnabled,
    domeDiameter,
    domeResolution,
    domeProjectionType,
    panorama360Enabled,
    panoramaResolution,
    panoramaFormat,
    stereographicPerspective,
    customPrompt,
    useCustomPrompt,
  ])

  const downloadImage = useCallback(
    async (format: "regular" | "dome" | "panorama" = "regular") => {
      if (!generatedArt) return
      setDownloadStatus("Preparing download...")
      try {
        let url = generatedArt.imageUrl
        if (format === "dome" && generatedArt.domeImageUrl) url = generatedArt.domeImageUrl
        if (format === "panorama" && generatedArt.panorama360Url) url = generatedArt.panorama360Url

        const filename = `flowsketch-${format}-${Date.now()}.${generatedArt.mode === "svg" ? "svg" : "png"}`
        if (generatedArt.mode === "svg") {
          const a = document.createElement("a")
          a.href = url
          a.download = filename
          a.click()
        } else {
          try {
            const r = await fetch(url, { mode: "cors", credentials: "omit" })
            if (!r.ok) throw new Error(`Failed to fetch image: ${r.status}`)
            const blob = await r.blob()
            const blobUrl = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = blobUrl
            a.download = filename
            a.click()
            setTimeout(() => URL.revokeObjectURL(blobUrl), 500)
          } catch {
            const proxy = `/api/download-proxy?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`
            const a = document.createElement("a")
            a.href = proxy
            a.download = filename
            a.click()
          }
        }
        setDownloadStatus("Downloaded!")
        toast.success("Download complete")
      } catch (e: any) {
        setDownloadStatus("Download failed")
        toast.error(e?.message || "Download failed")
      } finally {
        setTimeout(() => setDownloadStatus(null), 2500)
      }
    },
    [generatedArt],
  )

  // Pagination
  const totalPages = Math.ceil(gallery.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = gallery.slice(startIndex, startIndex + itemsPerPage)

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
            Generate stunning mathematical visualizations and AI-powered artwork with advanced projection support.
          </p>
        </div>

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
                      <Label className="text-sm font-medium text-slate-300">Dataset</Label>
                      <Select value={dataset} onValueChange={setDataset}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600 max-h-72">
                          {DATASETS.map((d) => (
                            <SelectItem key={d.value} value={d.value}>
                              {d.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Scenario Selection */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-300">Scenario</Label>
                      <Select value={scenario} onValueChange={setScenario}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600 max-h-72">
                          {scenarios.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Color Scheme */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-300">Color Scheme</Label>
                      <Select value={colorScheme} onValueChange={setColorScheme}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600 max-h-72">
                          <SelectItem value="plasma">Plasma</SelectItem>
                          <SelectItem value="quantum">Quantum</SelectItem>
                          <SelectItem value="cosmic">Cosmic</SelectItem>
                          <SelectItem value="thermal">Thermal</SelectItem>
                          <SelectItem value="spectral">Spectral</SelectItem>
                          <SelectItem value="crystalline">Crystalline</SelectItem>
                          <SelectItem value="bioluminescent">Bioluminescent</SelectItem>
                          <SelectItem value="aurora">Aurora</SelectItem>
                          <SelectItem value="metallic">Metallic</SelectItem>
                          <SelectItem value="prismatic">Prismatic</SelectItem>
                          <SelectItem value="monochromatic">Monochromatic</SelectItem>
                          <SelectItem value="infrared">Infrared</SelectItem>
                          <SelectItem value="lava">Lava</SelectItem>
                          <SelectItem value="futuristic">Futuristic</SelectItem>
                          <SelectItem value="forest">Forest</SelectItem>
                          <SelectItem value="ocean">Ocean</SelectItem>
                          <SelectItem value="sunset">Sunset</SelectItem>
                          <SelectItem value="arctic">Arctic</SelectItem>
                          <SelectItem value="neon">Neon</SelectItem>
                          <SelectItem value="vintage">Vintage</SelectItem>
                          <SelectItem value="toxic">Toxic</SelectItem>
                          <SelectItem value="ember">Ember</SelectItem>
                          <SelectItem value="lunar">Lunar</SelectItem>
                          <SelectItem value="tidal">Tidal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Parameters */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-300">Seed</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={seed}
                            onChange={(e) => setSeed(parseInt(e.target.value || "0", 10))}
                            className="bg-slate-700 border-slate-600 text-slate-100 flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={randomizeSeed}
                            className="border-slate-600 hover:bg-slate-600"
                          >
                            <Dices className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-300">Data Points ({numSamples})</Label>
                        <Slider
                          value={[numSamples]}
                          min={500}
                          max={8000}
                          step={100}
                          onValueChange={([v]) => setNumSamples(v)}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium text-slate-300">Noise Scale ({noiseScale.toFixed(2)})</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={randomizeNoise}
                            className="border-slate-600 hover:bg-slate-600 h-6 w-6 p-0"
                          >
                            <Dices className="h-3 w-3" />
                          </Button>
                        </div>
                        <Slider
                          value={[noiseScale]}
                          min={0.01}
                          max={0.5}
                          step={0.01}
                          onValueChange={([v]) => setNoiseScale(Number(v))}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium text-slate-300">Time Step ({timeStep.toFixed(3)})</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={randomizeTimeStep}
                            className="border-slate-600 hover:bg-slate-600 h-6 w-6 p-0"
                          >
                            <Dices className="h-3 w-3" />
                          </Button>
                        </div>
                        <Slider
                          value={[timeStep]}
                          min={0.005}
                          max={0.2}
                          step={0.005}
                          onValueChange={([v]) => setTimeStep(Number(v))}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Randomize All Button */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={randomizeAll}
                      className="w-full border-slate-600 hover:bg-slate-600"
                    >
                      <Dices className="h-4 w-4 mr-2" />
                      Randomize All Parameters
                    </Button>

                    {/* Custom Prompt */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-slate-300">Custom Prompt</Label>
                        <div className="flex items-center gap-2">
                          <Switch checked={useCustomPrompt} onCheckedChange={setUseCustomPrompt} />
                          <span className="text-xs text-slate-400">Use</span>
                        </div>
                      </div>
                      <Textarea
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder="Optional: add your own prompt"
                        className="bg-slate-700 border-slate-600 text-slate-100 min-h-[80px]"
                        disabled={!useCustomPrompt}
                      />
                    </div>

                    {/* Dome Projection Settings */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-slate-300">Dome Projection</Label>
                        <Switch checked={domeEnabled} onCheckedChange={setDomeEnabled} />
                      </div>
                      {domeEnabled && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="number"
                              value={domeDiameter}
                              onChange={(e) => setDomeDiameter(parseInt(e.target.value || "20", 10))}
                              className="bg-slate-700 border-slate-600 text-slate-100"
                              placeholder="Diameter (m)"
                            />
                            <Select value={domeResolution} onValueChange={setDomeResolution}>
                              <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-700 border-slate-600">
                                <SelectItem value="2K">2K</SelectItem>
                                <SelectItem value="4K">4K</SelectItem>
                                <SelectItem value="8K">8K</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Select value={domeProjectionType} onValueChange={setDomeProjectionType}>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-700 border-slate-600">
                              <SelectItem value="fisheye">Fisheye</SelectItem>
                              <SelectItem value="equidistant">Equidistant</SelectItem>
                              <SelectItem value="stereographic">Stereographic</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    {/* 360° Panorama Settings */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-slate-300">360° Panorama</Label>
                        <Switch checked={panorama360Enabled} onCheckedChange={setPanorama360Enabled} />
                      </div>
                      {panorama360Enabled && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <Select value={panoramaResolution} onValueChange={setPanoramaResolution}>
                              <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-700 border-slate-600">
                                <SelectItem value="4K">4K</SelectItem>
                                <SelectItem value="8K">8K</SelectItem>
                                <SelectItem value="16K">16K</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select value={panoramaFormat} onValueChange={setPanoramaFormat}>
                              <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-700 border-slate-600">
                                <SelectItem value="equirectangular">Equirectangular</SelectItem>
                                <SelectItem value="stereographic">Stereographic</SelectItem>
                                <SelectItem value="cubemap">Cubemap</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {panoramaFormat === "stereographic" && (
                            <Select value={stereographicPerspective} onValueChange={setStereographicPerspective}>
                              <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-700 border-slate-600">
                                <SelectItem value="little-planet">Little Planet</SelectItem>
                                <SelectItem value="tunnel">Tunnel</SelectItem>
                                <SelectItem value="fisheye">Fisheye</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Generate Button */}
                    <Button
                      onClick={generateArt}
                      disabled={isGenerating}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Art
                        </>
                      )}
                    </Button>

                    {isGenerating && (
                      <div className="space-y-2">
                        <Progress value={progress} className="w-full" />
                        <p className="text-xs text-slate-400 text-center">
                          {progress}% complete
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Preview */}
              <div className="lg:col-span-2">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-100">
                      <Eye className="h-5 w-5" />
                      Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {error && (
                      <Alert className="mb-4 border-red-500 bg-red-500/10">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-red-400">{error}</AlertDescription>
                      </Alert>
                    )}

                    {generatedArt ? (
                      <div className="space-y-4">
                        {/* Preview Tabs */}
                        <Tabs defaultValue="regular" className="w-full">
                          <TabsList className="grid w-full grid-cols-3 bg-slate-700">
                            <TabsTrigger value="regular" className="data-[state=active]:bg-purple-600">
                              <ImageIcon className="h-4 w-4 mr-2" />
                              Regular
                            </TabsTrigger>
                            <TabsTrigger 
                              value="dome" 
                              disabled={!generatedArt.domeImageUrl}
                              className="data-[state=active]:bg-purple-600 disabled:opacity-50"
                            >
                              <Mountain className="h-4 w-4 mr-2" />
                              Dome
                            </TabsTrigger>
                            <TabsTrigger 
                              value="panorama" 
                              disabled={!generatedArt.panorama360Url}
                              className="data-[state=active]:bg-purple-600 disabled:opacity-50"
                            >
                              <Globe className="h-4 w-4 mr-2" />
                              360°
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="regular" className="mt-4">
                            <div className="aspect-square bg-slate-900 rounded-lg overflow-hidden">
                              <img
                                src={generatedArt.imageUrl || "/placeholder.svg"}
                                alt="Regular generated artwork"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="mt-2 text-center">
                              <Badge variant="outline" className="border-slate-600 text-slate-300">
                                Regular View
                              </Badge>
                            </div>
                          </TabsContent>

                          <TabsContent value="dome" className="mt-4">
                            <div className="aspect-square bg-slate-900 rounded-lg overflow-hidden">
                              <img
                                src={generatedArt.domeImageUrl || generatedArt.imageUrl || "/placeholder.svg"}
                                alt="Dome projection artwork"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="mt-2 text-center space-y-1">
                              <Badge variant="outline" className="border-slate-600 text-slate-300">
                                Dome Projection
                              </Badge>
                              {generatedArt.domeSpecs && (
                                <div className="text-xs text-slate-400">
                                  {generatedArt.domeSpecs.diameter}m • {generatedArt.domeSpecs.resolution} • {generatedArt.domeSpecs.projectionType}
                                </div>
                              )}
                            </div>
                          </TabsContent>

                          <TabsContent value="panorama" className="mt-4">
                            <div className="aspect-square bg-slate-900 rounded-lg overflow-hidden">
                              <img
                                src={generatedArt.panorama360Url || generatedArt.imageUrl || "/placeholder.svg"}
                                alt="360° panorama artwork"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="mt-2 text-center space-y-1">
                              <Badge variant="outline" className="border-slate-600 text-slate-300">
                                360° Panorama
                              </Badge>
                              {generatedArt.panoramaSpecs && (
                                <div className="text-xs text-slate-400">
                                  {generatedArt.panoramaSpecs.resolution} • {generatedArt.panoramaSpecs.format}
                                </div>
                              )}
                            </div>
                          </TabsContent>
                        </Tabs>
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={() => downloadImage("regular")}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Regular
                          </Button>
                          
                          {generatedArt.domeImageUrl && (
                            <Button
                              onClick={() => downloadImage("dome")}
                              variant="outline"
                              className="border-slate-600"
                            >
                              <Mountain className="h-4 w-4 mr-2" />
                              Dome
                            </Button>
                          )}
                          
                          {generatedArt.panorama360Url && (
                            <Button
                              onClick={() => downloadImage("panorama")}
                              variant="outline"
                              className="border-slate-600"
                            >
                              <Globe className="h-4 w-4 mr-2" />
                              360°
                            </Button>
                          )}
                        </div>

                        {downloadStatus && (
                          <Alert className="border-green-500 bg-green-500/10">
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription className="text-green-400">
                              {downloadStatus}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-square bg-slate-900 rounded-lg flex items-center justify-center">
                        <div className="text-center text-slate-400">
                          <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p>Generated artwork will appear here</p>
                          <p className="text-sm mt-2">Regular, Dome, and 360° views will be available</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            {gallery.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-12 text-center">
                  <ImageIcon className="h-16 w-16 mx-auto mb-4 text-slate-400 opacity-50" />
                  <h3 className="text-xl font-semibold text-slate-300 mb-2">No Artwork Yet</h3>
                  <p className="text-slate-400 mb-4">Generate your first piece of art to start building your gallery.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentItems.map((art) => (
                  <Card key={art.id} className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="aspect-square bg-slate-900 rounded-lg overflow-hidden mb-4">
                        <img
                          src={art.imageUrl || "/placeholder.svg"}
                          alt="Gallery artwork"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                            {art.mode.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="border-slate-600 text-slate-300">
                            {getDatasetDisplayName(art.params.dataset)}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-slate-400">
                          {new Date(art.timestamp).toLocaleDateString()}
                        </p>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              const link = document.createElement("a")
                              link.href = art.imageUrl
                              link.download = `flowsketch-${art.id}.${art.mode === "svg" ? "svg" : "png"}`
                              link.click()
                            }}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  className="border-slate-600"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-slate-300 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  className="border-slate-600"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
