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
      "8bit": "8bit Pixel Art Generation",
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
            "GODLEVEL PROMPT: Majestic Garuda Wisnu Kencana soaring through celestial realms, massive divine eagle with wingspan stretching across golden sunset skies, intricate feather details shimmering with ethereal light, powerful talons gripping sacred lotus blossoms radiating divine energy, noble eagle head crowned with jeweled diadem of ancient Javanese kings, eyes blazing with cosmic wisdom and protective fury, Lord Vishnu mounted majestically upon Garuda's back in full divine regalia with four arms holding sacred conch shell, discus wheel of time, lotus of creation, and mace of justice, flowing silk garments in royal blues and golds dancing in celestial winds, Mount Meru rising in background with cascading waterfalls of liquid starlight, temple spires piercing through clouds of incense and prayers, Indonesian archipelago spread below like scattered emeralds in sapphire seas, Ring of Fire volcanoes glowing with sacred flames, traditional gamelan music visualized as golden sound waves rippling through dimensions, ancient Sanskrit mantras floating as luminous script in the air, Ramayana epic scenes carved into floating stone tablets, divine aura radiating rainbow light spectrum, cosmic mandala patterns swirling in the heavens, 17,508 islands of Indonesia visible as points of light below, Borobudur and Prambanan temples glowing with spiritual energy, traditional Indonesian textiles patterns woven into the very fabric of reality, hyperrealistic 8K cinematic masterpiece with volumetric lighting and particle effects",
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
        // Enhanced Major Indigenous Groups with GODLEVEL prompts
        {
          value: "javanese",
          label: "👑 Javanese Royal Court Culture",
          description:
            "GODLEVEL PROMPT: Magnificent Javanese royal court of Yogyakarta Sultan's palace with refined traditions spanning centuries, elaborate batik patterns with philosophical meanings covering silk garments of court nobles, gamelan orchestras creating meditative soundscapes with bronze instruments that seem to channel ancestral spirits, traditional Javanese architecture with joglo roofs and carved wooden pillars telling stories of ancient kingdoms, shadow puppet wayang performances in royal courtyards where dalang masters weave epic tales of gods and heroes, ancient Hindu-Buddhist influences merged seamlessly with Islamic culture creating unique Javanese synthesis, terraced rice cultivation creating geometric patterns across volcanic landscapes, traditional ceremonies and rituals connecting living descendants to royal ancestors, sophisticated artistic heritage spanning centuries with court painters, musicians, and craftsmen, Sultan's palace (Kraton) with its sacred layout representing cosmic order, traditional Javanese philosophy of harmony and balance expressed in daily life, court dancers in elaborate costumes performing sacred dances, royal gamelan sets made of bronze and gold creating music for the gods, traditional Javanese script and literature preserving ancient wisdom, ceremonial keris daggers with mystical powers passed down through generations, traditional medicine and healing practices using herbs and spiritual energy, hyperrealistic 8K cultural documentation with rich details of court life and artistic traditions. Geolocation: Central Java. Weapons: Keris, spears. Costumes: Batik, traditional Javanese attire. Vehicles: Horse-drawn carriages.",
        },
        {
          value: "sundanese",
          label: "🎋 Sundanese Highland Heritage",
          description:
            "GODLEVEL PROMPT: West Java's indigenous Sundanese people with distinct cultural identity thriving in mountainous terrain, traditional bamboo architecture with elevated houses on stilts protecting from floods and wild animals, angklung bamboo musical instruments creating harmonious melodies that echo through mountain valleys, traditional Sundanese dance performances with graceful movements inspired by nature, rice cultivation in mountainous terrain creating spectacular terraced landscapes, unique culinary traditions with fresh vegetables and fish from mountain streams, traditional clothing and textiles with intricate patterns and natural dyes, ancient animistic beliefs blended seamlessly with Islam creating unique spiritual practices, community cooperation gotong royong traditions where entire villages work together, highland agricultural practices adapted to volcanic soil and mountain climate, traditional houses with steep roofs and bamboo walls designed for mountain weather, Sundanese language with its own script and literature, traditional crafts including bamboo weaving and wood carving, mountain festivals celebrating harvest and seasonal changes, traditional healing practices using mountain herbs and spiritual rituals, hyperrealistic 8K documentation of highland culture with dramatic mountain landscapes and traditional architecture. Geolocation: West Java highlands. Weapons: Parang (machete), bamboo spears. Costumes: Kebaya, batik sarongs, ikat textiles. Vehicles: Bamboo rafts, horses.",
        },
        {
          value: "batak",
          label: "🏔️ Batak Tribal Lake Toba Culture",
          description:
            "GODLEVEL PROMPT: North Sumatra highland Batak people with distinctive architecture around magnificent Lake Toba, traditional Batak houses with dramatic curved roofs resembling buffalo horns reaching toward sky, intricate wood carvings and decorative elements telling clan histories and spiritual beliefs, traditional ulos textiles with sacred meanings woven by master craftswomen, patrilineal clan system and ancestral worship connecting living descendants to powerful spirits, Lake Toba cultural landscape with world's largest volcanic lake surrounded by traditional villages, traditional music with gondang instruments creating rhythms that summon ancestral spirits, stone megalithic monuments erected by ancient Batak kings, ancient Batak script and literature preserving oral traditions, ceremonial feasts and rituals celebrating life passages and clan unity, warrior traditions and oral histories of battles and heroic deeds, traditional Batak architecture with houses built without nails using ancient joinery techniques, clan totems and symbols carved into house facades, traditional ceremonies for naming, marriage, and death with elaborate rituals, Batak Christian churches blending traditional architecture with Christian symbolism, hyperrealistic 8K cultural photography showing traditional architecture and Lake Toba landscape with dramatic lighting and atmospheric effects. Geolocation: North Sumatra, Lake Toba region. Weapons: Piso Gaja Dompak (ceremonial sword), spears. Costumes: Ulos textiles, headcloths. Vehicles: Traditional boats, horses.",
        },
        {
          value: "dayak",
          label: "🌳 Dayak Borneo Longhouse Tribes",
          description:
            "GODLEVEL PROMPT: Indigenous Dayak peoples of Kalimantan Borneo with diverse sub-groups living in harmony with rainforest, traditional longhouses accommodating extended families with communal living spaces stretching hundreds of feet, intricate beadwork and traditional costumes with patterns representing clan identity and spiritual protection, headhunting historical traditions with trophy skulls displayed in longhouse rafters, river-based transportation and settlements with traditional boats navigating jungle waterways, traditional tattoos with spiritual significance covering warriors' bodies with protective symbols, hornbill bird cultural symbolism with sacred feathers used in ceremonies, forest-based lifestyle and hunting practices using blowguns and traditional traps, shamanic traditions and spiritual beliefs connecting human world to forest spirits, traditional crafts and woodcarving creating masks and totems, oral traditions and folklore passed down through generations, traditional medicine using rainforest plants and spiritual healing, longhouse architecture built on stilts with communal verandas, traditional ceremonies for rice planting and harvest, warrior culture with elaborate shields and weapons, hyperrealistic 8K rainforest photography showing traditional longhouses and Dayak cultural practices with atmospheric jungle lighting. Geolocation: Kalimantan (Borneo) rainforest. Weapons: Mandau (sword), blowguns, spears. Costumes: Tattoos, beadwork, bark clothing. Vehicles: Longboats, rafts.",
        },
        {
          value: "acehnese",
          label: "🕌 Acehnese Islamic Sultanate Culture",
          description:
            "GODLEVEL PROMPT: Northernmost Sumatra Acehnese province with strong Islamic identity and proud independence tradition, traditional Acehnese architecture with Islamic influences showing Middle Eastern and local fusion, distinctive cultural practices and ceremonies blending Islamic faith with local customs, traditional Saman dance performances with dozens of dancers in perfect synchronization, coffee cultivation and trade traditions making Aceh famous for premium coffee beans, tsunami resilience and community strength shown in 2004 disaster recovery, traditional clothing and textiles with Islamic geometric patterns, Islamic educational institutions (dayah) preserving religious knowledge, maritime trading heritage with traditional boats and fishing techniques, unique Acehnese dialect and language distinct from other Indonesian languages, traditional crafts and metalwork creating Islamic calligraphy and decorative arts, Grand Mosque of Baiturrahman with black domes and minarets, traditional Acehnese houses with steep roofs and Islamic architectural elements, Islamic law (Sharia) implementation in daily life, traditional ceremonies for Islamic holidays and life passages, hyperrealistic 8K cultural documentation showing Islamic architecture and Acehnese traditions with dramatic lighting and cultural authenticity. Geolocation: Aceh, Northern Sumatra. Weapons: Rencong (dagger), swords. Costumes: Islamic attire, songket textiles. Vehicles: Fishing boats, horse-drawn carts.",
        },
        {
          value: "minangkabau",
          label: "🏠 Minangkabau Matrilineal Society",
          description:
            "GODLEVEL PROMPT: West Sumatra Minangkabau people with unique matrilineal social structure where women hold property and family lineage, distinctive rumah gadang houses with dramatic horn-shaped roofs resembling buffalo horns reaching toward sky, traditional Minang cuisine and culinary heritage famous throughout Indonesia and Malaysia, matriarchal inheritance and family systems where mothers pass property to daughters, traditional ceremonies and adat customs governing social behavior and community harmony, skilled traders and merchants throughout Southeast Asia spreading Minang culture, traditional textiles and songket weaving with gold threads creating royal garments, Islamic scholarship and education with famous religious schools, traditional music and dance celebrating Minang cultural identity, philosophical wisdom and proverbs (pepatah-petitih) guiding daily life, traditional architecture with carved wooden facades and steep roofs, clan system (suku) organizing social relationships and marriage rules, traditional markets with Minang women as successful traders, ceremonial costumes with elaborate headdresses and jewelry, hyperrealistic 8K cultural photography showing traditional rumah gadang architecture and Minang cultural practices with rich detail and atmospheric lighting. Geolocation: West Sumatra highlands. Weapons: Keris, swords, knives. Costumes: Songket textiles, traditional headdresses. Vehicles: Buffalo-drawn carts, horses.",
        },
        {
          value: "balinese-tribe",
          label: "🌺 Balinese Hindu-Dharma Culture",
          description:
            "GODLEVEL PROMPT: Bali island people with distinct Hindu-Dharma religion creating paradise of temples and ceremonies, elaborate temple ceremonies and festivals with thousands of devotees in colorful traditional dress, traditional Balinese architecture and sculpture with intricate stone carvings, intricate wood and stone carvings depicting Hindu mythology and local legends, traditional dance and music performances bringing Hindu epics to life, rice terrace agriculture and subak irrigation system creating spectacular landscapes, traditional clothing and ceremonial dress with gold ornaments and silk fabrics, artistic traditions in painting and crafts passed down through generations, community temple obligations and ceremonies connecting villages to divine realm, unique Balinese calendar system with religious festivals throughout the year, traditional healing practices using herbs and spiritual energy, temple festivals with elaborate decorations and offerings, gamelan orchestras playing sacred music that resonates through temple courtyards, holy water ceremonies where priests bless devotees with tirta from sacred springs, hyperrealistic 8K cultural documentation showing Balinese temple ceremonies and traditional arts with dramatic lighting and spiritual atmosphere. Geolocation: Bali island. Weapons: Keris, spears, tridents. Costumes: Traditional dance costumes, gold ornaments. Vehicles: Jukung boats, bullock carts.",
        },
        {
          value: "papuans",
          label: "🪶 Papuan Indigenous Diversity",
          description:
            "GODLEVEL PROMPT: New Guinea indigenous peoples with incredible cultural diversity representing hundreds of distinct tribes, traditional houses on stilts and tree houses built high above ground for protection, elaborate feathered headdresses and body decorations using bird of paradise plumes, hundreds of distinct languages and dialects making Papua most linguistically diverse region on Earth, traditional hunting and gathering practices using bows, arrows, and traditional traps, bird of paradise cultural significance with sacred feathers used in ceremonies, traditional music with drums and flutes creating rhythms that connect to ancestral spirits, body painting and scarification traditions marking tribal identity and spiritual protection, sago palm cultivation and processing providing staple food, tribal warfare and peace-making ceremonies with elaborate rituals, oral traditions and storytelling preserving tribal history and mythology, traditional tools and weapons made from stone, bone, and wood, highland tribes with different customs from coastal peoples, traditional ceremonies for initiation and life passages, hyperrealistic 8K ethnographic photography showing Papuan cultural diversity with authentic tribal practices and dramatic New Guinea landscapes. Geolocation: New Guinea highlands and coasts. Weapons: Bows, arrows, spears, stone axes. Costumes: Feather headdresses, body paint, shell ornaments. Vehicles: Dugout canoes, rafts.",
        },
        // Enhanced Unique Indigenous Communities
        {
          value: "baduy",
          label: "🌿 Baduy Traditional Isolationist Community",
          description:
            "GODLEVEL PROMPT: Banten Java Baduy tribe maintaining strict traditional lifestyle in complete rejection of modern world, traditional white and black clothing distinctions marking inner (Baduy Dalam) and outer (Baduy Luar) communities, sustainable agriculture without chemicals or modern tools preserving ancient farming methods, traditional houses without electricity, running water, or modern conveniences, oral tradition and customary law (pikukuh) governing every aspect of daily life, forest conservation and environmental protection as sacred duty, traditional crafts and weaving using only natural materials and ancient techniques, spiritual connection to ancestral lands considered sacred and protected, isolation from mainstream Indonesian society by choice and tradition, traditional leadership and governance systems based on ancestral wisdom, forbidden to use modern transportation, electronics, or synthetic materials, traditional medicine using forest plants and spiritual energy, sacred forests protected by traditional law and spiritual beliefs, traditional ceremonies marking seasonal changes and life passages, hyperrealistic 8K documentary photography showing authentic traditional lifestyle with natural lighting and environmental context. Geolocation: Banten, West Java. Weapons: Golok (machete), bamboo spears. Costumes: Traditional white and black clothing. Vehicles: Foot travel only.",
        },
        {
          value: "orang-rimba",
          label: "🌲 Orang Rimba Forest Nomads",
          description:
            "GODLEVEL PROMPT: Sumatra nomadic hunter-gatherers known as Kubu people living deep in rainforest, traditional forest shelters built from natural materials and abandoned when moving to new areas, hunting and gathering traditional practices using blowguns and forest knowledge, shamanic spiritual beliefs and forest spirits guiding daily life, traditional medicine using forest plants and spiritual healing practices, oral traditions and forest knowledge passed down through generations, resistance to sedentarization and modernization to preserve traditional lifestyle, traditional tools and hunting weapons made from forest materials, forest conservation and sustainable practices as way of life, unique language and cultural expressions distinct from settled populations, adaptation to rainforest environment with intimate knowledge of forest ecology, traditional social organization based on kinship and forest territories, threatened by deforestation and palm oil plantations, traditional ceremonies connecting human world to forest spirits, hyperrealistic 8K rainforest photography showing authentic nomadic lifestyle with atmospheric jungle lighting and environmental authenticity. Geolocation: Sumatra rainforest. Weapons: Blowguns, spears, traps. Costumes: Bark clothing, loincloths. Vehicles: Foot travel only.",
        },
        {
          value: "hongana-manyawa",
          label: "🏹 Hongana Manyawa Last Isolated Tribe",
          description:
            "GODLEVEL PROMPT: One of Indonesia's last nomadic hunter-gatherer tribes living in remote rainforest areas of Halmahera island, traditional forest shelters and nomadic lifestyle moving seasonally through ancestral territories, hunting with traditional weapons and tools made from forest materials, gathering forest foods and medicines using ancient knowledge, shamanic spiritual practices connecting human world to forest spirits, oral traditions and forest knowledge threatened by outside contact, threatened by deforestation and mining destroying ancestral lands, traditional social organization based on kinship and forest territories, unique language and cultural practices distinct from outside world, adaptation to tropical rainforest with intimate ecological knowledge, resistance to outside contact to preserve traditional way of life, traditional ceremonies and rituals marking seasonal changes, forest spirits and ancestral beliefs guiding daily decisions, hyperrealistic 8K ethnographic photography showing last remnants of stone age lifestyle with authentic forest environment and dramatic lighting. Geolocation: Halmahera island rainforest. Weapons: Bows, arrows, spears. Costumes: Bark clothing, natural ornaments. Vehicles: Foot travel only.",
        },
        {
          value: "asmat",
          label: "🎨 Asmat Master Woodcarvers",
          description:
            "GODLEVEL PROMPT: New Guinea indigenous Asmat people renowned worldwide for intricate wood carvings, traditional bis poles and ancestor sculptures reaching toward sky like prayers to ancestral spirits, elaborate ceremonial masks and shields with supernatural power, headhunting historical traditions with trophy skulls displayed in men's houses, sago palm cultivation and processing providing staple food in swampy environment, traditional houses on stilts built over tidal swamps, spiritual beliefs connecting ancestors and nature in continuous cycle, traditional music and dance ceremonies summoning ancestral spirits, river-based transportation and settlements with traditional canoes, oral traditions and mythology explaining creation and tribal history, artistic heritage recognized worldwide with museums collecting Asmat art, traditional tools and carving techniques passed down through master-apprentice relationships, ceremonial feasts celebrating successful hunts and tribal victories, traditional initiation ceremonies for young warriors, hyperrealistic 8K art documentation showing master woodcarvers at work with intricate detail of traditional sculptures and atmospheric swamp environment. Geolocation: Papua coastal swamps. Weapons: Spears, shields, bows and arrows. Costumes: Elaborate masks, body paint, woven skirts. Vehicles: Dugout canoes.",
        },
      ],
      "8bit": [
        { value: "pure", label: "Pure Mathematical", description: "Raw mathematical beauty with 8bit aesthetics" },
        {
          value: "glitch-matrix",
          label: "🔥 Glitch Matrix Chaos",
          description: "Corrupted digital reality with cascading data streams and pixel corruption artifacts",
        },
        {
          value: "neon-synthwave",
          label: "🌈 Neon Synthwave Dreams",
          description: "Retro-futuristic landscapes with pulsing neon grids and chromatic aberration effects",
        },
        {
          value: "pixel-storm",
          label: "⚡ Pixel Storm Vortex",
          description: "Swirling maelstrom of animated pixels creating hypnotic geometric patterns",
        },
        {
          value: "digital-decay",
          label: "💀 Digital Decay Apocalypse",
          description: "Post-digital wasteland with fragmenting pixels and corrupted memory blocks",
        },
        {
          value: "quantum-bits",
          label: "🔬 Quantum Bit Dimensions",
          description: "Microscopic 8bit universes with quantum pixel fluctuations and probability clouds",
        },
        {
          value: "retro-cosmos",
          label: "🌌 Retro Cosmic Genesis",
          description: "8bit interpretation of cosmic creation with pixelated nebulae and digital star formation",
        },
        {
          value: "cyber-mandala",
          label: "🕉️ Cyber Mandala Meditation",
          description: "Sacred geometric patterns rendered in pure 8bit precision with digital enlightenment",
        },
        {
          value: "pixel-fractals",
          label: "🌀 Pixel Fractal Infinity",
          description: "Recursive 8bit patterns creating infinite depth with mathematical pixel precision",
        },
        {
          value: "data-cathedral",
          label: "⛪ Data Cathedral Sanctum",
          description: "Monumental digital architecture built from pure 8bit data structures and code poetry",
        },
        {
          value: "electric-dreams",
          label: "💫 Electric Dreams Sequence",
          description: "Surreal 8bit dreamscapes with flowing electric currents and digital consciousness",
        },
        {
          value: "pixel-phoenix",
          label: "🔥 Pixel Phoenix Rebirth",
          description: "Mythical digital creature emerging from cascading pixel flames and data resurrection",
        },
        {
          value: "binary-blizzard",
          label: "❄️ Binary Blizzard Storm",
          description: "Chaotic snowstorm of 1s and 0s creating mesmerizing 8bit weather phenomena",
        },
        {
          value: "chrome-cascade",
          label: "💎 Chrome Cascade Falls",
          description: "Metallic pixel waterfalls with reflective chrome surfaces and liquid mercury effects",
        },
        {
          value: "neon-labyrinth",
          label: "🌟 Neon Labyrinth Maze",
          description: "Impossible 8bit maze structures with glowing pathways and digital minotaur guardians",
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
        { value: "crystalline", label: "Crystal structures", description: "Crystal structures" },
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
                        <SelectItem value="8bit">🎮 8bit Pixel Art Generation</SelectItem>
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
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-96 bg-slate-900 rounded-lg border border-slate-700">
                        <div className="space-y-3">
                          <div className="flex items-center justify-center">
                            <ImageIcon className="h-8 w-8" />
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-medium text-slate-300">
                              Ready to Generate {getDatasetDisplayName(dataset)} GODLEVEL Art
                            </p>
                            <p className="text-sm text-slate-400">
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
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-slate-100">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  GODLEVEL Art Gallery
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={clearGallery}
                    className="h-6 px-2 text-xs border-red-500 text-red-400 hover:bg-red-500/10 bg-transparent"
                  >
                    Clear Gallery
                  </Button>
                  <Badge variant="secondary">{gallery.length} GODLEVEL artworks</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gallery.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 bg-slate-900 rounded-lg border border-slate-700">
                  <div className="space-y-3">
                    <div className="flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-slate-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-medium text-slate-300">No GODLEVEL artworks in gallery</p>
                      <p className="text-sm text-slate-400">Generate some GODLEVEL Indonesian art to see it here</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentItems.map((art) => (
                      <Card key={art.id} className="bg-slate-800 border-slate-700">
                        <CardContent className="p-3 space-y-2">
                          <div className="relative bg-slate-900 rounded-lg overflow-hidden">
                            {art.mode === "svg" ? (
                              <div
                                className="w-full h-48 flex items-center justify-center"
                                dangerouslySetInnerHTML={{ __html: art.svgContent }}
                              />
                            ) : (
                              <img
                                src={art.imageUrl || "/placeholder.svg"}
                                alt={`Generated ${getDatasetDisplayName(dataset)} artwork`}
                                className="w-full h-48 object-cover"
                              />
                            )}
                            <div className="absolute top-2 left-2">
                              <Badge className="bg-purple-600 text-white">
                                ✨ {art.mode === "svg" ? "SVG" : "AI"} GODLEVEL
                              </Badge>
                              {art.customPrompt && (
                                <Badge className="ml-1 bg-blue-600 text-white">
                                  Custom
                                </Badge>
                              )}
                              {art.isDomeProjection && (
                                <Badge className="ml-1 bg-pink-600 text-white">
                                  Dome
                                </Badge>
                              )}
                              {art.is360Panorama && (
                                <Badge className="ml-1 bg-green-600 text-white">
                                  360°
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-slate-300">
                              {art.mode === "svg" ? "Mathematical GODLEVEL Visualization" : "AI Generated GODLEVEL Art"}
                            </p>
                            <p className="text-xs text-slate-400">
                              {new Date(art.timestamp).toLocaleDateString()} - {art.params?.dataset || "Unknown"} GODLEVEL
                            </p>
                          </div>
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
                        className="border-slate-500 text-slate-400"
                      >
                        Previous
                      </Button>
                      <p className="text-sm text-slate-400">
                        Page {currentPage} of {totalPages}
                      </p>
                      <Button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        variant="outline"
                        className="border-slate-500 text-slate-400"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reset Button */}
      <div className="text-center">
        <Button
          onClick={resetAllParameters}
          variant="destructive"
          className="bg-red-600 hover:bg-red-700 text-white font-medium py-3"
        >
          Reset All Parameters
        </Button>
      </div>

      {/* Footer */}
      <div className="text-center text-slate-500 text-sm">
        Created with ❤️ by <a href="https://neural.love/" target="_blank" rel="noopener noreferrer" className="underline">
          Neuralia
        </a> - Powered by GODLEVEL mathematical creativity and AI. 🇮🇩✨
      </div>
    </div>
  </div>
)
}

export default FlowArtGenerator
