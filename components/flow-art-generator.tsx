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
  const [scenario, setScenario] = useState("garuda")
  const [colorScheme, setColorScheme] = useState("metallic")
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
    }
    return names[dataset] || dataset
  }

  const getDatasetScenarios = (dataset: string): Array<{ value: string; label: string; description: string }> => {
    const scenarios: Record<string, Array<{ value: string; label: string; description: string }>> = {
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
      indonesian: [
        {
          value: "pure",
          label: "Pure Mathematical Indonesian",
          description:
            "Raw mathematical beauty infused with Indonesian sacred geometry, batik patterns, and archipelago fractals",
        },
        {
          value: "garuda",
          label: "🦅 Garuda Wisnu Kencana Divine Eagle",
          description:
            "GODLEVEL PROMPT: Majestic Garuda Wisnu Kencana soaring through celestial realms with ADVANCED MATHEMATICAL ARTISTIC COMPOSITION, massive divine eagle with wingspan stretching across golden sunset skies following FIBONACCI SPIRAL FLIGHT PATTERNS, intricate feather details shimmering with ethereal light arranged in FRACTAL GEOMETRIC SEQUENCES, powerful talons gripping sacred lotus blossoms radiating divine energy in MANDALA MATHEMATICAL FORMATIONS, noble eagle head crowned with jeweled diadem of ancient Javanese kings positioned at GOLDEN RATIO FOCAL POINT, eyes blazing with cosmic wisdom and protective fury creating LOGARITHMIC SPIRAL ENERGY PATTERNS, Lord Vishnu mounted majestically upon Garuda's back in full divine regalia with four arms holding sacred conch shell, discus wheel of time, lotus of creation, and ceremonial staff arranged in TETRAHEDRAL SACRED GEOMETRY, flowing silk garments in royal blues and golds dancing in celestial winds following FLUID DYNAMICS MATHEMATICAL CURVES, Mount Meru rising in background with cascading waterfalls of liquid starlight forming PARABOLIC ARC TRAJECTORIES, temple spires piercing through clouds of incense and prayers arranged in HEXAGONAL CRYSTAL LATTICE PATTERNS, Indonesian archipelago spread below like scattered emeralds in sapphire seas following VORONOI DIAGRAM DISTRIBUTIONS, Ring of Fire volcanoes glowing with sacred flames positioned according to PRIME NUMBER SEQUENCES, traditional gamelan music visualized as golden sound waves rippling through dimensions in SINE AND COSINE WAVE HARMONICS, ancient Sanskrit mantras floating as luminous script in the air following EULER'S SPIRAL MATHEMATICAL CURVES, Ramayana epic scenes carved into floating stone tablets arranged in PLATONIC SOLID GEOMETRIC FORMATIONS, divine aura radiating rainbow light spectrum in CHROMATIC CIRCLE MATHEMATICAL PROGRESSIONS, cosmic mandala patterns swirling in the heavens following ARCHIMEDEAN SPIRAL MATHEMATICS, 17,508 islands of Indonesia visible as points of light below distributed according to GAUSSIAN PROBABILITY DISTRIBUTIONS, Borobudur and Prambanan temples glowing with spiritual energy positioned at INTERSECTION POINTS OF GOLDEN RECTANGLES, traditional Indonesian textiles patterns woven into the very fabric of reality using TESSELLATION MATHEMATICAL PRINCIPLES, celestial bodies orbiting in ELLIPTICAL KEPLER TRAJECTORIES, sacred geometry symbols (Sri Yantra, Flower of Life, Metatron's Cube) integrated into wing feather patterns using RECURSIVE MATHEMATICAL ALGORITHMS, atmospheric perspective following INVERSE SQUARE LAW OF LIGHT ATTENUATION, cloud formations shaped by NAVIER-STOKES FLUID DYNAMICS EQUATIONS, lightning bolts crackling with divine energy following LICHTENBERG FRACTAL PATTERNS, ocean waves below following GERSTNER WAVE MATHEMATICAL MODELS, wind currents visualized as VECTOR FIELD MATHEMATICAL REPRESENTATIONS, temple architecture incorporating HYPERBOLIC GEOMETRY PRINCIPLES, sacred fire flames dancing according to CHAOS THEORY MATHEMATICAL ATTRACTORS, celestial constellation patterns following SPHERICAL TRIGONOMETRY CALCULATIONS, divine light rays emanating in RADIAL SYMMETRY MATHEMATICAL PATTERNS, mystical energy fields visualized as ELECTROMAGNETIC FIELD EQUATIONS, time-space distortions around divine figures following EINSTEIN'S RELATIVITY MATHEMATICS, quantum energy particles swirling in PROBABILITY WAVE FUNCTIONS, sacred mountain peaks arranged in TRIANGULAR NUMBER SEQUENCES, river systems flowing in MEANDERING MATHEMATICAL CURVES, forest canopies following BRANCHING FRACTAL ALGORITHMS, architectural elements incorporating CATENARY CURVE MATHEMATICS, ceremonial arrangements following PERMUTATION AND COMBINATION PRINCIPLES, hyperrealistic 8K cinematic masterpiece with volumetric lighting and particle effects enhanced by ADVANCED MATHEMATICAL ARTISTIC ALGORITHMS, COMPUTATIONAL FLUID DYNAMICS for atmospheric effects, RAY TRACING MATHEMATICS for perfect lighting, BEZIER CURVE COMPOSITIONS for elegant flowing lines, PARAMETRIC SURFACE MODELING for divine figure sculpting, FOURIER TRANSFORM VISUALIZATIONS for music and sound wave representations, COMPLEX NUMBER PLANE MAPPINGS for dimensional portal effects, DIFFERENTIAL GEOMETRY for curved space-time representations around divine beings, TOPOLOGY MATHEMATICS for seamless dimensional transitions, GRAPH THEORY NETWORKS connecting all spiritual elements, MATRIX TRANSFORMATIONS for perspective and dimensional shifts",
        },
        {
          value: "wayang",
          label: "🎭 Wayang Kulit Shadow Theatre Epic",
          description:
            "GODLEVEL PROMPT: Mystical Wayang Kulit shadow puppet performance bringing ancient Ramayana and Mahabharata epics to life, master dalang puppeteer silhouetted behind glowing white screen with hundreds of intricately carved leather puppets, each puppet a masterwork of perforated artistry with gold leaf details catching flickering oil lamp light, dramatic shadows dancing and morphing into living characters, Prince Rama with perfect noble features and ornate crown battling ten-headed demon king Ravana whose multiple faces show rage, cunning, and supernatural power, beautiful Princess Sita with flowing hair and delicate jewelry radiating purity and grace, mighty Hanuman the white monkey warrior leaping through air with mountain in his grasp, gamelan orchestra of bronze instruments creating visible sound waves in metallic gold and silver, traditional Indonesian musicians in batik clothing playing gender, saron, and kendang drums, audience of villagers sitting cross-legged on woven mats mesmerized by the eternal stories, coconut oil lamps casting warm amber light creating multiple layers of shadows, ancient Javanese script floating in the air telling the story, tropical night sky filled with stars and flying spirits, traditional Javanese architecture with carved wooden pillars and clay tile roofs, incense smoke curling upward carrying prayers to ancestors, banana leaves and frangipani flowers as offerings, cultural heritage spanning over 1000 years visualized as golden threads connecting past to present, UNESCO World Heritage artistic tradition, hyperrealistic cinematic lighting with deep shadows and warm highlights, 8K resolution with intricate puppet details and atmospheric effects",
        },
        {
          value: "batik",
          label: "🎨 Sacred Batik Cosmic Patterns",
          description:
            "GODLEVEL PROMPT: Infinite cosmic tapestry of sacred Indonesian batik patterns coming alive with supernatural energy, master batik artisan's hands applying hot wax with traditional canting tool creating flowing lines that transform into living rivers of light, parang rusak diagonal patterns representing flowing water and eternal life force undulating like ocean waves, kawung geometric circles symbolizing cosmic order expanding into mandala formations that pulse with universal rhythm, mega mendung cloud motifs in deep indigo blues swirling with actual storm clouds and lightning, ceplok star formations bursting into real constellations in the night sky, sido mukti prosperity symbols manifesting as golden coins and rice grains falling like blessed rain, royal court designs with protective meanings creating shields of light around ancient Javanese palaces, intricate hand-drawn patterns using traditional canting tools guided by ancestral spirits, natural dyes from indigo plants, turmeric roots, and mahogany bark creating earth tones that shift and change like living skin, cultural identity woven into fabric of reality itself, UNESCO heritage craft mastery passed down through generations of royal court artisans, each pattern telling stories of creation myths and heroic legends, textile becoming portal to spiritual realm where ancestors dance in eternal celebration, traditional Javanese philosophy of harmony between human, nature, and divine visualized as interconnected geometric patterns, workshop filled with clay pots of dye, bamboo tools, and cotton fabric stretched on wooden frames, tropical sunlight filtering through palm leaves creating natural batik shadows on the ground, master craftswomen in traditional kebaya clothing working with meditative focus, the very air shimmering with creative energy and cultural pride, hyperrealistic 8K detail showing every wax crack and dye gradient, volumetric lighting and particle effects bringing ancient art form to supernatural life",
        },
        {
          value: "borobudur",
          label: "🏛️ Borobudur Buddhist Cosmic Mandala",
          description:
            "GODLEVEL PROMPT: Magnificent Borobudur temple rising from misty Javanese plains like a massive stone mandala connecting earth to heaven, world's largest Buddhist monument glowing with golden sunrise light, 2,672 relief panels carved into volcanic stone coming alive with animated scenes of Buddha's teachings and Jataka tales, 504 Buddha statues in perfect meditation poses each radiating serene enlightenment energy, bell-shaped stupas containing hidden Buddha figures emerging from stone like lotus flowers blooming, three circular platforms representing Buddhist cosmology - Kamadhatu (world of desire), Rupadhatu (world of forms), and Arupadhatu (formless world) - each level glowing with different colored auras, pilgrims in white robes walking clockwise path to enlightenment leaving trails of golden light, ancient stones weathered by centuries telling stories of devotion and spiritual seeking, sunrise illuminating the monument with divine radiance while Mount Merapi volcano smokes majestically in background, largest Buddhist temple complex in the world surrounded by lush tropical jungle and rice paddies, architectural marvel embodying spiritual journey from earthly desires to nirvana visualized as ascending spirals of light, Sailendra dynasty builders' vision manifested in perfect sacred geometry, each stone block precisely placed according to cosmic principles, relief carvings depicting Prince Siddhartha's path to becoming Buddha animated with supernatural life, celestial beings and bodhisattvas floating around the temple in meditation, traditional Javanese gamelan music resonating from the stones themselves, incense smoke from countless offerings creating mystical atmosphere, UNESCO World Heritage site protected by guardian spirits, morning mist revealing and concealing the temple like a divine revelation, pilgrims from around the world climbing the sacred steps in spiritual pilgrimage, ancient wisdom carved in stone speaking across centuries, hyperrealistic 8K cinematic masterpiece with volumetric lighting, atmospheric effects, and spiritual energy visualization",
        },
        {
          value: "komodo",
          label: "🐉 Komodo Dragons Ancient Guardians",
          description:
            "GODLEVEL PROMPT: Prehistoric Komodo dragons prowling volcanic islands of Flores and Rinca like living dinosaurs from ancient times, largest living lizards on Earth with massive muscular bodies reaching 10 feet in length, powerful jaws capable of delivering venomous bite that can fell water buffalo, ancient survivors from age of dinosaurs when giants ruled the earth, scaly armor-like skin glistening in tropical Indonesian sun with patterns resembling ancient dragon mythology, forked tongues flicking out to taste air for prey scents carried on ocean winds, muscular tails thick as tree trunks and razor-sharp claws that can tear through flesh and bone, endemic to Indonesian archipelago representing untamed wilderness and primal power, living legends of Flores and Rinca islands where local villagers call them 'ora' and tell stories of dragon spirits, conservation symbols representing battle between modern world and ancient nature, mystical connection to dragon mythology of Asian cultures, volcanic landscape of Komodo National Park with rugged hills and savanna grasslands, pink sand beaches where dragons hunt for carrion washed ashore, deer and wild boar fleeing in terror from apex predators, traditional Indonesian fishing boats anchored in crystal blue waters, park rangers in khaki uniforms observing from safe distance, tourists on guided tours witnessing living prehistory, UNESCO World Heritage marine park protecting both dragons and coral reefs, Ring of Fire volcanic activity creating dramatic landscape, traditional Indonesian villages where locals have coexisted with dragons for centuries, ancient folklore and legends about dragon kings and serpent deities, scientific research revealing secrets of dragon evolution and survival, hyperrealistic 8K wildlife cinematography with dramatic lighting, showing every scale detail and predatory movement, atmospheric volcanic landscape with mist and dramatic skies",
        },
        {
          value: "dance",
          label: "💃 Traditional Sacred Dance Ceremonies",
          description:
            "GODLEVEL PROMPT: Graceful Balinese Legong dancers in elaborate golden costumes performing ancient court dance with supernatural elegance, intricate headdresses adorned with fresh frangipani flowers and golden ornaments catching temple lamplight, precise mudra hand gestures telling stories of gods and demons through sacred choreography passed down through centuries, gamelan orchestra creating hypnotic metallic rhythms that seem to control the dancers' movements like divine puppetry, Javanese court dances with refined elegance performed in royal palaces with dancers moving like living sculptures, Saman dance from Aceh with dozens of male dancers in perfect synchronization creating human mandala patterns, colorful silk fabrics flowing with each gesture like liquid rainbows, spiritual devotion expressed through movement connecting earthly realm to divine consciousness, cultural storytelling through choreographed artistry where every gesture has deep meaning, temple ceremonies coming alive with dancers embodying Hindu deities and mythological characters, traditional Indonesian music visualized as golden sound waves guiding the performers, elaborate makeup and costumes transforming dancers into living gods and goddesses, incense smoke swirling around performers creating mystical atmosphere, tropical temple courtyards with carved stone pillars and lotus ponds reflecting the dance, audiences of devotees and tourists mesmerized by ancient artistry, UNESCO Intangible Cultural Heritage performances preserving thousand-year-old traditions, master dance teachers passing knowledge to young students in sacred guru-disciple relationships, traditional Indonesian philosophy of harmony between body, mind, and spirit expressed through movement, hyperrealistic 8K cinematography capturing every graceful gesture and costume detail, volumetric lighting creating dramatic shadows and highlights, cultural pride and spiritual energy radiating from every performance",
        },
        {
          value: "volcanoes",
          label: "🌋 Sacred Volcanic Ring of Fire",
          description:
            "GODLEVEL PROMPT: Majestic Mount Merapi smoking against dawn sky like sleeping dragon breathing fire, most active volcano in Indonesia with glowing lava flows creating rivers of molten rock, terraced rice fields cascading down volcanic slopes in perfect geometric patterns reflecting golden sunrise, Mount Bromo crater lake reflecting morning light like mirror of the gods surrounded by sea of sand and ancient caldera walls, sacred Mount Agung towering over Balinese temples as spiritual axis of the island where gods reside, volcanic ash creating fertile soil that feeds millions of Indonesians across the archipelago, traditional offerings of flowers and rice placed at crater edges by local villagers seeking protection from volcanic spirits, spiritual beliefs connecting mountains to divine realm where ancestors watch over their descendants, Ring of Fire geological power with 130 active volcanoes forming backbone of Indonesian islands, lush tropical vegetation thriving on mineral-rich volcanic slopes creating emerald green landscapes, cultural reverence for volcanic forces as both destroyer and creator of life, traditional Indonesian villages built on volcanic slopes where people have learned to live with constant geological activity, Mount Krakatoa's legendary 1883 eruption that was heard around the world, sulfur miners working in dangerous conditions at Kawah Ijen volcano with blue flames of burning sulfur creating otherworldly scenes, volcanic hot springs and geysers creating natural spas where locals bathe in healing mineral waters, traditional ceremonies to appease volcano spirits with elaborate rituals and offerings, scientific monitoring stations tracking seismic activity and gas emissions, dramatic volcanic sunsets with ash clouds creating spectacular colors across Indonesian skies, hyperrealistic 8K landscape photography with dramatic lighting, showing raw geological power and human adaptation, atmospheric effects with volcanic smoke and ash, cultural integration of volcanic forces into daily Indonesian life",
        },
        {
          value: "temples",
          label: "🛕 Hindu-Buddhist Temple Complexes",
          description:
            "GODLEVEL PROMPT: Ornate Pura Besakih mother temple complex on Mount Agung slopes rising like stairway to heaven, multi-tiered meru towers reaching toward heavens with each level representing different spiritual realm, intricate stone carvings depicting mythological scenes from Ramayana and Mahabharata coming alive with supernatural energy, ceremonial gates adorned with guardian statues of fierce demons and protective deities, lotus ponds reflecting temple spires creating perfect mirror images, incense smoke rising from prayer altars carrying devotees' prayers to divine realm, devotees in white ceremonial dress performing daily rituals and offerings, tropical flowers as offerings - frangipani, hibiscus, and marigolds creating colorful carpets, ancient architecture blending harmoniously with natural landscape of volcanic mountains and rice terraces, spiritual sanctuary of profound beauty where Hindu-Dharma religion thrives, Prambanan temple complex with towering spires dedicated to Hindu trinity of Brahma, Vishnu, and Shiva, elaborate relief carvings telling epic stories animated by flickering temple flames, traditional Balinese architecture with red brick and volcanic stone construction, temple festivals with thousands of devotees in colorful traditional dress, gamelan orchestras playing sacred music that resonates through temple courtyards, holy water ceremonies where priests bless devotees with tirta from sacred springs, temple dancers performing in temple courtyards bringing Hindu mythology to life, traditional offerings of rice, flowers, and incense arranged in beautiful geometric patterns, UNESCO World Heritage sites preserving thousand-year-old architectural masterpieces, spiritual energy radiating from ancient stones blessed by centuries of prayer and devotion, hyperrealistic 8K architectural photography with dramatic lighting, showing intricate stone carving details and atmospheric temple ceremonies, volumetric lighting through incense smoke creating mystical ambiance",
        },
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
        const currentScenario = showcaseScenarios[i]

        // Update settings
        setScenario(currentScenario.value)
        setSeed(Math.floor(Math.random() * 10000))

        setAutoGenProgress(((i + 1) / showcaseScenarios.length) * 100)

        toast.success(`🎨 Generating ${i + 1}/${showcaseScenarios.length}: ${currentScenario.description}`)

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
    setScenario("garuda")
    setColorScheme("metallic")
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
            domes and 360° environments. Now featuring GODLEVEL Indonesian tribal heritage prompts! 🇮🇩✨
          </p>
        </div>

        {/* Dataset Showcase Banner */}
        <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-purple-100 flex items-center gap-2">
                  ✨ {getDatasetDisplayName(dataset)} Showcase
                </h3>
                <p className="text-purple-200 text-sm">
                  Experience the full potential of {getDatasetDisplayName(dataset)} with{" "}
                  {getDatasetScenarios(dataset).length} unique GODLEVEL scenarios automatically generated
                </p>
              </div>
              <Button
                onClick={generateShowcase}
                disabled={isAutoGenerating || isGenerating}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isAutoGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Showcase...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Generate {getDatasetScenarios(dataset).length}-Piece Showcase
                  </>
                )}
              </Button>
            </div>
            {isAutoGenerating && (
              <div className="mt-4 space-y-2">
                <Progress value={autoGenProgress} className="w-full" />
                <p className="text-xs text-purple-300 text-center">
                  {autoGenProgress.toFixed(0)}% complete - Creating {getDatasetScenarios(dataset).length} unique
                  GODLEVEL artworks
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
                          <SelectItem value="indonesian">🇮🇩 Indonesian Tribal Heritage (GODLEVEL)</SelectItem>
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
                        This dataset includes {getDatasetScenarios(dataset).length} unique GODLEVEL scenarios for
                        comprehensive artistic exploration with hyperrealistic detail.
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

                    {/* Color Scheme */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-300">Color Palette</Label>
                      <Select value={colorScheme} onValueChange={setColorScheme}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="plasma">🔥 Plasma</SelectItem>
                          <SelectItem value="quantum">⚛️ Quantum</SelectItem>
                          <SelectItem value="cosmic">🌌 Cosmic</SelectItem>
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
                              placeholder="Describe your vision... (will be enhanced with GODLEVEL Indonesian details)"
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
                            Generating GODLEVEL Art (3 Versions)...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            {useCustomPrompt && customPrompt.trim()
                              ? "Generate Custom GODLEVEL Art (3 Versions)"
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
                              <h4 className="text-sm font-medium text-slate-300">Standard GODLEVEL Mathematical Art</h4>
                              <p className="text-xs text-slate-400">
                                Traditional format perfect for prints, displays, and standard viewing with
                                hyperrealistic detail
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
                                with immersive tunnel effect and hyperrealistic Indonesian cultural details
                              </p>
                              <div className="flex gap-2 text-xs">
                                <Badge variant="outline" className="border-purple-500 text-purple-400">
                                  {domeResolution}
                                </Badge>
                                <Badge variant="outline" className="border-purple-500 text-purple-400">
                                  {domeProjectionType}
                                </Badge>
                                <Badge variant="outline" className="border-purple-500 text-purple-400">
                                  GODLEVEL
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
                                immersive viewing with hyperrealistic Indonesian cultural immersion
                              </p>
                              <div className="flex gap-2 text-xs">
                                <Badge variant="outline" className="border-green-500 text-green-400">
                                  {panoramaResolution}
                                </Badge>
                                <Badge variant="outline" className="border-green-500 text-green-400">
                                  {panoramaFormat}
                                </Badge>
                                <Badge variant="outline" className="border-green-500 text-green-400">
                                  GODLEVEL
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
                          <h4 className="text-sm font-medium text-slate-300">GODLEVEL Artwork Details</h4>
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
                              <span className="text-slate-400 text-sm">Final Enhanced GODLEVEL Prompt:</span>
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
                              Ready to Generate {getDatasetDisplayName(dataset)} GODLEVEL Art
                            </p>
                            <p className="text-sm">
                              {useCustomPrompt && customPrompt.trim()
                                ? "Your custom prompt will be enhanced with GODLEVEL Indonesian elements"
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
              <h2 className="text-2xl font-bold text-slate-100">GODLEVEL Art Gallery</h2>
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
                      <p className="text-lg font-medium text-slate-300">No GODLEVEL artworks in gallery</p>
                      <p className="text-sm text-slate-400">Generate some GODLEVEL Indonesian art to see it here</p>
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
                            alt="Generated GODLEVEL artwork"
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
                          {art.mode === "svg" ? "Mathematical GODLEVEL Visualization" : "AI Generated GODLEVEL Art"}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {new Date(art.timestamp).toLocaleDateString()} - {art.params?.dataset || "Unknown"} GODLEVEL
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
            - Powered by GODLEVEL mathematical creativity and AI. 🇮🇩✨
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
