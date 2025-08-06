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
import { Sparkles, Settings, ImageIcon, Calculator, Download, Eye, AlertCircle, CheckCircle, Loader2, Users, Dice1, Play, Wand2, Globe, Mountain, Camera } from 'lucide-react'
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
      escher: "M.C. Escher Mathematical Art",
      bosch: "Hieronymus Bosch Fantastical Worlds",
    }
    return names[dataset] || dataset
  }

  const getDatasetScenarios = (dataset: string): Array<{ value: string; label: string; description: string }> => {
    const scenarios: Record<string, Array<{ value: string; label: string; description: string }>> = {
      nuanu: [
        { 
          value: "pure", 
          label: "Pure Mathematical", 
          description: "Raw mathematical beauty with futuristic creative city aesthetics" 
        },
        {
          value: "thk-tower",
          label: "🏗️ THK Tower Architectural Marvel",
          description: "GODLEVEL PROMPT: Towering THK (Technology, Humanity, Knowledge) Tower rising 500 meters into the sky as the iconic centerpiece of Nuanu Creative City, revolutionary architectural design combining biomimetic structures with advanced materials, spiraling glass facades that shift color based on internal activities and time of day, integrated vertical gardens creating living walls that purify air and provide food, rooftop observatory and research facilities with telescopes and laboratories, underground levels extending deep into earth with geothermal energy systems, holographic displays projecting art installations onto building surfaces, sustainable architecture using recycled ocean plastic and carbon-negative concrete, elevator systems powered by gravity and regenerative energy, panoramic views of entire creative city from observation decks, architectural lighting that responds to music and community events, integrated maker spaces and innovation labs on every floor, community gathering spaces with amphitheaters and exhibition areas, smart building systems that learn and adapt to occupant needs, artistic collaborations between architects, engineers, and digital artists, hyperrealistic 8K architectural visualization with dramatic lighting and atmospheric effects, volumetric rendering showing internal structure and energy flows"
        },
        {
          value: "popper-sentinels",
          label: "🗿 Popper Sentinel Guardian Installations",
          description: "GODLEVEL PROMPT: Monumental Popper Sentinel statues strategically placed throughout Nuanu Creative City as guardian protectors and artistic landmarks, each sentinel standing 15 meters tall with unique artistic interpretations representing different aspects of creativity and innovation, sculptural forms combining classical Greek and Roman influences with futuristic cyberpunk aesthetics, interactive elements that respond to citizen presence with light shows and sound installations, integrated AI systems that learn from community interactions and evolve their responses, materials ranging from traditional bronze and marble to advanced metamaterials and programmable matter, each sentinel serving as both art installation and functional city infrastructure including weather monitoring, air purification, and emergency communication systems, artistic collaborations between international sculptors and local community artists, seasonal transformations where sentinels change appearance based on festivals and cultural events, underground chambers beneath each sentinel containing time capsules and community archives, holographic projections creating dynamic storytelling experiences about city history and future visions, integrated solar panels and wind turbines making each sentinel energy-positive, community gathering spaces around sentinel bases with amphitheaters and meditation gardens, artistic lighting systems that create spectacular nighttime displays, hyperrealistic 8K sculptural detail with weathering effects and material authenticity, atmospheric rendering showing sentinels in various weather conditions and times of day"
        },
        {
          value: "luna-beach",
          label: "🏖️ Luna Beach Club Coastal Innovation Hub",
          description: "GODLEVEL PROMPT: Luna Beach Club serving as Nuanu Creative City's premier coastal creative space where ocean meets innovation, sustainable beachfront architecture built on floating platforms that rise and fall with tides, solar panel canopies providing shade while generating clean energy, seawater desalination systems providing fresh water for the community, beach volleyball courts with smart sand that monitors player performance and provides coaching feedback, outdoor amphitheater carved into coastal cliffs for concerts and performances, tidal pools converted into natural aquariums showcasing marine biodiversity, beach bars serving locally grown food and drinks in biodegradable containers, maker spaces in weatherproof pavilions where artists work with ocean-inspired materials, surfboard and watercraft design studios with 3D printing capabilities, marine research stations studying ocean health and developing conservation technologies, floating art installations that move with currents and tides, underwater sculpture gardens accessible through snorkeling and diving, beach cleanup robots that patrol shoreline collecting plastic waste for recycling, bioluminescent algae cultivation creating natural lighting for evening events, community gardens using saltwater-tolerant plants and hydroponic systems, weather monitoring stations providing real-time ocean and atmospheric data, hyperrealistic 8K coastal visualization with accurate water physics and lighting, atmospheric effects showing various weather conditions and seasonal changes"
        },
        {
          value: "labyrinth-dome",
          label: "🌀 Labyrinth Dome Immersive Experience Center",
          description: "GODLEVEL PROMPT: Massive geodesic Labyrinth Dome serving as Nuanu Creative City's premier immersive experience and meditation center, 100-meter diameter transparent dome structure allowing natural light while protecting interior spaces, interior labyrinth pathways designed using sacred geometry and mathematical principles, interactive floor surfaces that respond to footsteps with light patterns and sound harmonics, central meditation chamber with perfect acoustics for sound healing and contemplation, rotating art installations suspended from dome ceiling creating ever-changing visual experiences, climate control systems maintaining optimal temperature and humidity for comfort, integrated planetarium projection systems for astronomical education and entertainment, maze-like pathways that reconfigure automatically using moveable walls and platforms, sensory experience zones featuring different textures, scents, and ambient sounds, community workshops and classes in mindfulness, creativity, and personal development, research facilities studying consciousness, meditation, and human potential, therapeutic spaces for mental health support and healing practices, artistic collaborations between neuroscientists, architects, and spiritual teachers, sustainable materials including bamboo, recycled glass, and living plant walls, energy systems powered entirely by renewable sources including solar, wind, and geothermal, visitor tracking systems ensuring safety while maintaining privacy and contemplative atmosphere, hyperrealistic 8K architectural rendering with accurate light refraction through dome structure, atmospheric effects showing interior lighting and shadow patterns throughout different times of day"
        },
        {
          value: "creative-studios",
          label: "🎨 Creative Studios Innovation Workshops",
          description: "GODLEVEL PROMPT: Network of Creative Studios throughout Nuanu City providing state-of-the-art facilities for artists, inventors, and innovators, modular building designs that can be reconfigured based on project needs and community requirements, shared maker spaces equipped with 3D printers, laser cutters, CNC machines, and traditional crafting tools, artist residency programs bringing international talent to collaborate with local creators, interdisciplinary collaboration spaces where artists work alongside scientists, engineers, and entrepreneurs, sustainable materials library featuring recycled, upcycled, and bio-based materials for creative projects, digital fabrication labs with virtual reality design tools and augmented reality prototyping systems, traditional craft workshops preserving cultural techniques while integrating modern innovations, community exhibition spaces showcasing work-in-progress and finished projects, educational programs for all ages teaching creativity, innovation, and entrepreneurship, business incubation services helping artists and inventors commercialize their creations, intellectual property support and legal services for creative professionals, funding and grant programs supporting experimental and community-benefit projects, international exchange programs connecting Nuanu creators with global creative communities, performance spaces for music, theater, dance, and multimedia presentations, recording studios and media production facilities with professional-grade equipment, hyperrealistic 8K interior visualization showing diverse creative activities and collaborative workspaces, atmospheric lighting showcasing various artistic mediums and creative processes"
        },
        {
          value: "community-plaza",
          label: "🏛️ Community Plaza Central Gathering Space",
          description: "GODLEVEL PROMPT: Grand Community Plaza serving as the heart of Nuanu Creative City where all pathways converge and community life flourishes, circular design with radiating pathways connecting to all major city districts and landmarks, central fountain featuring kinetic water sculptures that dance to music and community events, amphitheater seating carved from local stone accommodating thousands for festivals and performances, interactive art installations that respond to crowd size and energy levels, seasonal market spaces for local farmers, artisans, and food vendors, children's play areas with creative playground equipment designed by local artists, outdoor fitness equipment and exercise spaces promoting community health and wellness, free WiFi and charging stations powered by renewable energy sources, community bulletin boards and information kiosks keeping residents connected, outdoor chess and game tables fostering social interaction and friendly competition, memorial gardens honoring community founders and significant contributors, seasonal decorations and lighting celebrating cultural holidays and local traditions, emergency gathering point with disaster preparedness supplies and communication systems, street performer spaces with acoustic design optimizing sound quality, food truck zones with sustainable waste management and composting systems, community art projects where residents contribute to large-scale collaborative installations, weather protection pavilions providing shelter during rain and extreme temperatures, accessibility features ensuring full inclusion for people with disabilities, hyperrealistic 8K plaza visualization showing diverse community activities and seasonal celebrations, atmospheric rendering capturing the energy and vibrancy of community gatherings"
        },
        {
          value: "digital-gardens",
          label: "🌱 Digital Gardens Tech-Nature Integration",
          description: "GODLEVEL PROMPT: Revolutionary Digital Gardens throughout Nuanu Creative City seamlessly blending advanced technology with natural ecosystems, vertical farming towers using AI-optimized growing conditions producing food for the entire community, smart irrigation systems using sensors and weather data to minimize water waste while maximizing plant health, interactive plant displays where visitors can learn about botany, ecology, and sustainable agriculture through augmented reality experiences, bioluminescent plants genetically modified to provide natural lighting for pathways and gathering spaces, air purification systems using specially selected plants to clean urban air and reduce pollution, community composting facilities turning organic waste into nutrient-rich soil for garden expansion, seed libraries preserving heirloom varieties and promoting biodiversity, educational programs teaching permaculture, sustainable living, and environmental stewardship, research facilities studying plant genetics, climate adaptation, and food security, therapeutic gardens designed for mental health support and healing practices, sensory gardens featuring plants with diverse textures, scents, and visual appeal, butterfly and pollinator habitats supporting local ecosystem health, rainwater collection and filtration systems providing irrigation and reducing stormwater runoff, solar panel canopies protecting sensitive plants while generating clean energy, community workshops on gardening, nutrition, and sustainable living practices, artistic installations incorporating living plants as sculptural elements, hyperrealistic 8K botanical visualization showing diverse plant species and technological integration, atmospheric effects demonstrating seasonal changes and growth cycles throughout the year"
        },
        {
          value: "innovation-labs",
          label: "🔬 Innovation Labs Research & Development",
          description: "GODLEVEL PROMPT: Cutting-edge Innovation Labs serving as Nuanu Creative City's primary research and development facilities, clean room environments for nanotechnology and biotechnology research, quantum computing facilities advancing artificial intelligence and machine learning capabilities, materials science laboratories developing sustainable alternatives to traditional manufacturing materials, renewable energy research stations testing solar, wind, geothermal, and experimental energy technologies, medical research facilities focusing on preventive healthcare and longevity studies, environmental monitoring systems tracking air quality, water purity, and ecosystem health, collaborative spaces where researchers from different disciplines work together on interdisciplinary projects, startup incubation programs providing resources and mentorship for technology entrepreneurs, patent and intellectual property services helping inventors protect and commercialize their discoveries, international research partnerships connecting Nuanu labs with universities and institutions worldwide, public science education programs making research accessible to community members of all ages, ethical review boards ensuring all research meets highest standards for safety and social responsibility, technology transfer programs bringing laboratory discoveries into practical community applications, maker spaces equipped with advanced prototyping tools and manufacturing equipment, data centers using renewable energy and advanced cooling systems for computational research, hyperrealistic 8K laboratory visualization showing diverse research activities and advanced scientific equipment, atmospheric lighting highlighting the precision and innovation of scientific discovery"
        }
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
            "GODLEVEL PROMPT: Prehistoric Komodo dragons prowling volcanic islands of Flores and Rinca like living dinosaurs from ancient times, largest living lizards on Earth with massive muscular bodies reaching 10 feet in length, powerful jaws capable of delivering venomous bite that can fell water buffalo, ancient survivors from age of dinosaurs when giants ruled the earth, scaly armor-like skin glistening in tropical Indonesian sun with patterns resembling ancient dragon mythology, forked tongues flicking out to taste air for prey scents carried on ocean winds, muscular tails thick as tree trunks and razor-sharp claws that can tear through flesh and bone, endemic to Indonesian archipelago representing untamed wilderness and primal power, living legends of Flores and Rinca islands where local villagers call them 'ora' and tell stories of dragon spirits, conservation symbols representing battle between modern world and ancient nature, volcanic landscape of Komodo National Park with rugged hills and savanna grasslands, pink sand beaches where dragons hunt for carrion washed ashore, deer and wild boar fleeing in terror from apex predators, traditional Indonesian fishing boats anchored in crystal blue waters, park rangers in khaki uniforms observing from safe distance, tourists on guided tours witnessing living prehistory, UNESCO World Heritage marine park protecting both dragons and coral reefs, Ring of Fire volcanic activity creating dramatic landscape, traditional Indonesian villages where locals have coexisted with dragons for centuries, ancient folklore and legends about dragon kings and serpent deities, scientific research revealing secrets of dragon evolution and survival, hyperrealistic 8K wildlife cinematography with dramatic lighting, showing every scale detail and predatory movement, atmospheric volcanic landscape with mist and dramatic skies",
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
      escher: [
        { value: "pure", label: "Pure Mathematical", description: "Raw mathematical beauty with Escher precision" },
        {
          value: "birds-fish-tessellation",
          label: "🐦🐟 Birds & Fish Tessellation",
          description:
            "GODLEVEL PROMPT: M.C. Escher's iconic interlocking tessellation of birds transforming into fish in seamless mathematical precision, white birds with outstretched wings flying rightward gradually morphing into black fish swimming leftward, each bird's negative space perfectly forming a fish silhouette, infinite tessellation pattern extending in all directions with no gaps or overlaps, mathematical precision in every curve and angle ensuring perfect geometric fit, black and white lithographic style with meticulous cross-hatching and stippling techniques, organic forms constrained by rigid mathematical tessellation rules, visual mathematics demonstrating dual-figure ground relationships, precise geometric construction where positive and negative spaces create complementary forms, each transformation step following strict mathematical continuity, artistic mastery combining biological accuracy with geometric perfection, infinite pattern suggesting eternal cycle of transformation, mathematical beauty in the seamless transition between avian and aquatic forms, hyperrealistic technical precision in every feather detail and fish scale, 8K resolution showing perfect mathematical tessellation with no geometric errors",
        },
        {
          value: "impossible-penrose-triangle",
          label: "🔺 Impossible Penrose Triangle",
          description:
            "GODLEVEL PROMPT: M.C. Escher-style impossible Penrose triangle with each corner appearing geometrically correct but the whole structure defying three-dimensional logic, three wooden beams forming a triangular structure where each joint looks normal but the complete triangle cannot exist in real space, mathematical precision in perspective drawing despite logical impossibility, detailed wood grain texture and realistic shading making the impossible seem believable, architectural impossibility constructed with mathematical precision, each beam perfectly rendered with accurate perspective and lighting, visual paradox that challenges spatial reasoning and geometric intuition, lithographic black and white style with meticulous cross-hatching techniques, impossible object that appears solid and real from every angle, mathematical beauty emerging from logical contradiction, precise technical drawing creating believable impossibility, geometric construction that exploits visual perception limitations, architectural elements that connect in ways that shouldn't exist in three-dimensional space, hyperrealistic rendering making the impossible triangle seem tangible and real, 8K detail showing every wood grain and shadow despite geometric impossibility",
        },
        {
          value: "ascending-descending-stairs",
          label: "🪜 Ascending & Descending Stairs",
          description:
            "GODLEVEL PROMPT: M.C. Escher's impossible staircase where figures eternally climb stairs that simultaneously ascend and descend in an endless loop, architectural impossibility with precise mathematical perspective construction, robed figures walking clockwise around rectangular staircase that defies gravity and logic, each step appearing normal but the complete circuit being geometrically impossible, medieval monastery architecture with stone arches and columns, mathematical precision in every architectural detail despite spatial impossibility, visual paradox demonstrating relativity of up and down directions, lithographic black and white technique with detailed cross-hatching and architectural rendering, impossible architecture that seems believable through mathematical precision, geometric construction exploiting visual perception to create spatial paradox, figures trapped in eternal mathematical loop of climbing, precise perspective drawing making impossible architecture appear real, architectural elements following individual logic but creating collective impossibility, mathematical beauty in perpetual motion paradox, hyperrealistic stone texture and architectural detail, 8K resolution showing every architectural element in impossible but convincing detail",
        },
        {
          value: "lizards-metamorphosis",
          label: "🦎 Lizards Metamorphosis",
          description:
            "GODLEVEL PROMPT: M.C. Escher's metamorphosis sequence showing geometric tessellation patterns gradually transforming into living lizards that crawl off the page, flat hexagonal tessellation evolving into three-dimensional reptilian forms, mathematical precision in the gradual transformation from abstract geometry to biological reality, lizards emerging from flat pattern gaining volume, shadow, and life, precise geometric construction showing each stage of metamorphosis, black and white lithographic style with meticulous detail in scales and geometric patterns, mathematical continuity maintained throughout the transformation process, tessellated lizards becoming real lizards climbing over books and objects, visual mathematics demonstrating topological transformation, geometric precision in every scale and pattern detail, artistic mastery showing transition from two-dimensional pattern to three-dimensional life, mathematical beauty in the seamless evolution from abstract to concrete, precise technical drawing showing impossible but convincing transformation, each lizard perfectly rendered with biological accuracy, hyperrealistic detail in both geometric and organic phases, 8K resolution capturing every mathematical relationship and transformation detail with perfect geometric precision",
        },
        {
          value: "relativity-gravity",
          label: "🌀 Relativity Multiple Gravities",
          description:
            "GODLEVEL PROMPT: M.C. Escher's 'Relativity' architectural space with three different gravitational orientations coexisting simultaneously, impossible building interior where figures walk on floors, walls, and ceilings as if each surface has its own gravity, mathematical precision in perspective construction despite spatial impossibility, staircases leading in all directions with people oriented in different gravitational fields, architectural elements serving multiple functions depending on perspective, precise geometric construction of impossible spatial relationships, lithographic black and white style with detailed architectural rendering, mathematical exploration of relative perspective and spatial orientation, figures coexisting in same space but following different physical laws, architectural impossibility made believable through mathematical precision, visual representation of Einstein's relativity concepts through architectural geometry, precise perspective drawing creating convincing impossible space, geometric construction where each viewpoint follows its own logical rules, mathematical beauty in conflicting but coexistent realities, hyperrealistic architectural detail in impossible spatial configuration, 8K resolution showing every architectural element in mathematically precise impossible perspective",
        },
        {
          value: "hands-drawing-hands",
          label: "✋ Drawing Hands Recursion",
          description:
            "GODLEVEL PROMPT: M.C. Escher's iconic 'Drawing Hands' showing two realistic hands emerging from flat paper, each hand drawing the other in infinite recursive loop, mathematical precision in the transition from two-dimensional drawing to three-dimensional reality, detailed anatomical accuracy in hand structure and proportions, precise shading and cross-hatching technique creating convincing volume and depth, visual paradox of creation creating itself, lithographic black and white style with meticulous attention to every line and shadow, mathematical beauty in self-referential artistic creation, hands emerging from paper with convincing three-dimensional presence, precise technical drawing showing impossible but believable recursive creation, artistic mastery in rendering both flat drawing and dimensional reality, mathematical concept of infinite recursion visualized through artistic skill, detailed fabric texture of shirt cuffs and realistic skin rendering, visual philosophy about the nature of artistic creation and reality, hyperrealistic anatomical detail in impossible self-creating scenario, 8K resolution showing every skin texture and pencil line with mathematical precision",
        },
        {
          value: "waterfall-impossible",
          label: "💧 Impossible Waterfall",
          description:
            "GODLEVEL PROMPT: M.C. Escher's impossible waterfall flowing in perpetual loop defying gravity and physics, water flowing downward but somehow returning to its source at the same level, architectural structure with precise mathematical perspective despite physical impossibility, detailed stone architecture with arches and columns supporting impossible water channel, mathematical precision in water flow rendering and architectural construction, lithographic black and white technique with detailed cross-hatching and stippling, visual paradox of perpetual motion through impossible geometry, realistic water texture and flow patterns in impossible configuration, precise architectural drawing making impossible structure seem believable, mathematical beauty in endless cycle that violates conservation of energy, detailed vegetation and architectural elements surrounding impossible waterfall, geometric construction exploiting visual perception to create convincing impossibility, architectural elements that appear normal individually but create collective impossibility, hyperrealistic stone texture and water flow detail, 8K resolution showing every architectural element and water droplet in impossible but convincing perpetual motion",
        },
        {
          value: "sphere-reflections",
          label: "🔮 Self-Portrait in Spherical Mirror",
          description:
            "GODLEVEL PROMPT: M.C. Escher's self-portrait reflected in chrome sphere showing entire room and artist's hand holding the sphere, mathematical precision in spherical reflection geometry and perspective distortion, detailed chrome surface with perfect reflective properties, realistic hand anatomy holding reflective sphere, precise geometric construction of spherical mirror reflection showing 360-degree view compressed into circular format, lithographic black and white technique with meticulous attention to reflective surfaces, mathematical beauty in spherical geometry and optical physics, detailed room interior visible in spherical reflection including furniture and architectural elements, precise rendering of curved reflection showing impossible complete view, artistic mastery in depicting complex optical phenomena, mathematical accuracy in spherical distortion and perspective, detailed facial features and clothing visible in curved reflection, visual exploration of perception and reality through mathematical optics, hyperrealistic chrome surface and anatomical detail, 8K resolution showing perfect mathematical spherical reflection with every detail precisely rendered",
        },
        {
          value: "day-night-tessellation",
          label: "🌅🌙 Day & Night Tessellation",
          description:
            "GODLEVEL PROMPT: M.C. Escher's 'Day and Night' showing tessellated birds transforming from geometric pattern into flying birds over contrasting day and night landscapes, mathematical precision in tessellation where white birds fly over dark night landscape and black birds fly over bright day landscape, seamless transition from flat geometric pattern to three-dimensional flying birds, precise geometric construction maintaining tessellation rules while creating narrative transformation, detailed landscape with fields, rivers, and towns below flying birds, mathematical beauty in dual transformation from pattern to life and day to night, lithographic black and white technique with detailed landscape and geometric rendering, visual mathematics demonstrating figure-ground reversal and complementary relationships, precise perspective showing birds gaining dimension and life as they separate from tessellation, artistic mastery combining geometric precision with narrative storytelling, mathematical continuity in transformation from abstract pattern to concrete reality, detailed agricultural landscape with geometric field patterns, hyperrealistic bird anatomy and landscape detail, 8K resolution showing perfect tessellation mathematics and detailed landscape geography",
        },
        {
          value: "mobius-strip-ants",
          label: "🐜 Möbius Strip with Ants",
          description:
            "GODLEVEL PROMPT: M.C. Escher's Möbius strip with ants crawling along the surface demonstrating mathematical properties of non-orientable surfaces, precise geometric construction of twisted mathematical surface with only one side and one edge, detailed ant anatomy with realistic proportions and movement, mathematical accuracy in representing topological surface that challenges three-dimensional intuition, lithographic black and white technique with meticulous cross-hatching and stippling, ants following continuous path that demonstrates Möbius strip's single-sided property, mathematical beauty in surface that has no inside or outside, precise technical drawing showing impossible but mathematically real geometric form, detailed texture and shading creating convincing three-dimensional twisted surface, visual mathematics demonstrating topological concepts through biological metaphor, geometric construction that appears impossible but follows mathematical logic, artistic mastery in rendering complex mathematical surface, mathematical precision in every twist and geometric relationship, hyperrealistic ant detail and surface texture, 8K resolution showing perfect mathematical Möbius construction with biological accuracy",
        },
        {
          value: "convex-concave",
          label: "🏛️ Convex & Concave Architecture",
          description:
            "GODLEVEL PROMPT: M.C. Escher's architectural illusion where the same structure appears simultaneously convex and concave depending on viewing perspective, mathematical precision in perspective construction creating visual ambiguity, detailed architectural elements including arches, columns, and geometric decorations, precise geometric construction exploiting visual perception to create spatial paradox, lithographic black and white technique with detailed architectural rendering, visual mathematics demonstrating perceptual relativity and geometric ambiguity, architectural elements that can be interpreted as either protruding or receding, mathematical beauty in structures that challenge spatial interpretation, precise technical drawing creating believable architectural impossibility, detailed stone texture and architectural ornamentation, geometric construction where perspective lines create multiple valid interpretations, artistic mastery in creating convincing architectural paradox, mathematical exploration of perception and geometric interpretation, architectural elements following individual logic but creating collective ambiguity, hyperrealistic architectural detail in impossible spatial configuration, 8K resolution showing every architectural element with mathematical precision despite perceptual impossibility",
        },
        {
          value: "metamorphosis-complete",
          label: "🔄 Complete Metamorphosis Sequence",
          description:
            "GODLEVEL PROMPT: M.C. Escher's complete metamorphosis showing continuous transformation from geometric tessellation through various forms back to tessellation, mathematical precision in gradual transformation maintaining geometric continuity throughout, detailed sequence showing squares becoming birds becoming fish becoming geometric patterns, precise geometric construction ensuring mathematical relationships preserved during transformation, lithographic black and white technique with meticulous detail at every transformation stage, mathematical beauty in continuous topological transformation, visual mathematics demonstrating morphological continuity and geometric evolution, artistic mastery in maintaining recognizable forms while following strict mathematical rules, precise technical drawing showing impossible but mathematically consistent transformation, detailed rendering of each intermediate form in metamorphosis sequence, geometric construction following mathematical transformation rules, mathematical exploration of form and pattern relationships, continuous transformation that challenges perception of fixed form, hyperrealistic detail in both geometric and organic transformation phases, 8K resolution capturing every mathematical relationship and transformation detail with perfect geometric precision",
        },
        {
          value: "print-gallery",
          label: "🖼️ Print Gallery Recursion",
          description:
            "GODLEVEL PROMPT: M.C. Escher's 'Print Gallery' showing recursive loop where gallery visitor views print that contains the gallery he's standing in, mathematical precision in recursive perspective construction, detailed architectural interior with precise perspective and lighting, visual paradox of image containing itself in infinite regression, lithographic black and white technique with detailed architectural and figure rendering, mathematical beauty in self-referential artistic creation, precise geometric construction of impossible recursive space, detailed gallery interior with prints, visitors, and architectural elements, artistic mastery in creating convincing impossible recursive reality, mathematical exploration of infinite regression and self-reference, precise perspective drawing making impossible recursion seem believable, detailed human figures and gallery architecture, geometric construction that appears logical despite logical impossibility, visual philosophy about art, reality, and perception, hyperrealistic architectural and human detail in impossible recursive scenario, 8K resolution showing every architectural element and recursive detail with mathematical precision",
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
      bosch: [
        { 
          value: "pure", 
          label: "Pure Mathematical", 
          description: "Raw mathematical beauty with Boschian surreal precision" 
        },
        {
          value: "garden-earthly-delights",
          label: "🌺 Garden of Earthly Delights Triptych",
          description: "GODLEVEL PROMPT: Hieronymus Bosch's masterpiece Garden of Earthly Delights as three-panel triptych showing progression from Paradise through earthly pleasures to Hell, left panel depicting Adam and Eve in pristine Garden of Eden with exotic animals and fantastical plants, God presenting Eve to Adam under crystalline fountain of life, strange hybrid creatures and impossible architectural forms, middle panel exploding with naked figures engaged in surreal pleasures among giant fruits and bizarre contraptions, humans riding oversized animals through landscapes of coral-pink pools and crystal spheres, right panel showing apocalyptic hellscape with demons torturing souls using musical instruments as torture devices, burning cities and nightmarish creatures with human heads and animal bodies, intricate symbolism woven throughout each panel with hidden meanings about human nature and divine judgment, hyperrealistic 15th century Flemish painting technique with oil glazes creating luminous depth, every figure meticulously detailed despite fantastical nature, surreal juxtapositions of sacred and profane imagery, 8K resolution showing every brushstroke and symbolic detail"
        },
        {
          value: "temptation-saint-anthony",
          label: "👹 Temptation of Saint Anthony",
          description: "GODLEVEL PROMPT: Hieronymus Bosch's nightmarish vision of Saint Anthony's spiritual trials in the desert, holy hermit surrounded by grotesque demons and hybrid monsters attempting to break his faith through terrifying apparitions, flying demons with bat wings and human torsos carrying the saint through apocalyptic skies, bizarre creatures with fish heads, bird beaks, and human limbs emerging from burning ruins, demonic processions featuring impossible beings playing discordant music on organic instruments, saint maintaining serene composure amid chaos while reading sacred texts, landscape filled with burning buildings, twisted trees, and pools of fire, demons disguised as beautiful women offering earthly temptations, hybrid monsters with multiple heads and limbs performing blasphemous acts, surreal architecture defying physics with upside-down towers and organic buildings, symbolic imagery representing spiritual warfare between good and evil, meticulous Flemish painting technique capturing every horrific detail, dark palette punctuated by flames and supernatural light, psychological horror expressed through fantastical imagery, 8K hyperrealistic detail showing texture of demon skin and saint's weathered robes"
        },
        {
          value: "ship-fools",
          label: "🚢 Ship of Fools Allegory",
          description: "GODLEVEL PROMPT: Hieronymus Bosch's satirical Ship of Fools depicting humanity's moral folly through allegorical voyage, overcrowded boat filled with representatives of human vice and stupidity sailing toward spiritual destruction, drunken monks and nuns abandoning religious vows for earthly pleasures, gluttonous passengers gorging themselves while ship takes on water, fool's cap-wearing captain steering vessel toward rocky shores, passengers engaged in gambling, fighting, and debauchery while ignoring approaching doom, symbolic tree mast bearing fruits of temptation instead of proper sail, owl of wisdom watching disapprovingly from branches, water surrounding ship filled with floating symbols of vanity and sin, distant shoreline showing consequences of moral corruption, each passenger representing different aspect of human folly from greed to lust to pride, meticulous attention to facial expressions showing various states of intoxication and moral decay, rich symbolism drawn from medieval literature and moral teachings, Flemish oil painting technique creating luminous water effects and detailed fabric textures, social commentary on religious and secular corruption of Bosch's era, 8K resolution capturing every symbolic detail and character study"
        },
        {
          value: "seven-deadly-sins",
          label: "💀 Seven Deadly Sins Wheel",
          description: "GODLEVEL PROMPT: Hieronymus Bosch's circular composition depicting the Seven Deadly Sins as wheel of human moral failure, central eye of God watching over humanity's transgressions with Christ emerging from pupil, seven segments radiating outward each illustrating different sin through detailed vignettes, Pride shown through woman admiring herself in demon-held mirror while devil whispers vanities, Envy depicted as neighbors coveting each other's possessions with green-faced demons stoking jealousy, Wrath illustrated through tavern brawl with participants wielding household objects as weapons, Sloth showing lazy figure refusing work while responsibilities pile up around them, Greed featuring merchant weighing coins while poor beg outside his door, Gluttony displaying feast where diners consume impossible quantities while others starve, Lust revealing couples in compromising positions with demonic observers, four corner medallions showing Death of the Sinner, Judgment, Hell, and Glory, Latin inscriptions warning viewers about consequences of moral failure, intricate symbolic details in each scene revealing deeper theological meanings, masterful use of circular composition to suggest eternal cycle of sin and redemption, Flemish painting technique with jewel-like colors and precise brushwork, psychological insight into human nature through allegorical imagery, 8K hyperrealistic detail showing every moral lesson and symbolic element"
        },
        {
          value: "haywain-triptych",
          label: "🌾 Haywain Triptych Morality",
          description: "GODLEVEL PROMPT: Hieronymus Bosch's Haywain Triptych illustrating humanity's pursuit of worldly vanities through three-panel moral allegory, left panel showing Creation and Fall of Man in Garden of Eden with rebel angels transformed into insects and demons, central panel dominated by massive hay wagon representing earthly possessions and temporary pleasures, crowds of people from all social classes desperately grabbing at hay while wagon rolls toward Hell, Pope and Emperor following wagon on horseback showing even highest authorities succumb to material temptation, demons hidden within hay pulling wagon toward damnation while angels above pray for human souls, lovers on top of haystack oblivious to spiritual danger while demon plays music, right panel revealing Hell as destination with burning landscape and creative tortures for the damned, fantastical demons with hybrid animal-human features administering punishments, architectural impossibilities with organic buildings and mechanical torture devices, rich symbolism throughout with hay representing vanity and temporary nature of earthly goods, meticulous Flemish oil painting technique creating luminous effects and precise detail, social commentary on all levels of society from peasants to nobility, moral lesson about choosing spiritual over material wealth, 8K resolution showing every brushstroke and symbolic meaning"
        },
        {
          value: "last-judgment",
          label: "⚖️ Last Judgment Apocalypse",
          description: "GODLEVEL PROMPT: Hieronymus Bosch's terrifying vision of the Last Judgment with Christ as judge separating saved from damned, central figure of Christ displaying wounds of crucifixion while seated on rainbow throne, Virgin Mary and John the Baptist interceding for humanity, angels blowing trumpets to wake the dead from their graves, resurrected souls emerging from earth in various states of decay and restoration, blessed souls ascending toward heavenly light guided by angels, damned souls dragged downward by demons into fiery pit of Hell, fantastical punishments awaiting sinners with creative tortures matching their earthly crimes, hybrid demon creatures with animal heads and human bodies administering eternal justice, landscape divided between heavenly paradise and hellish wasteland, architectural marvels in heaven contrasting with burning ruins in Hell, symbolic imagery throughout representing divine justice and human moral choices, saints and martyrs surrounding Christ's throne displaying instruments of their martyrdom, detailed crowd scenes showing humanity from all walks of life facing final judgment, masterful use of vertical composition emphasizing ascension and descent, Flemish painting technique with luminous colors for heaven and dark tones for Hell, theological complexity expressed through visual narrative, 8K hyperrealistic detail capturing every soul's fate and divine majesty"
        },
        {
          value: "death-miser",
          label: "💰 Death and the Miser",
          description: "GODLEVEL PROMPT: Hieronymus Bosch's moral allegory of Death and the Miser showing wealthy man's final moments torn between salvation and damnation, dying miser in bed reaching toward bag of gold while angel points toward crucifix offering redemption, Death entering chamber as skeleton with arrow ready to claim soul, demon emerging from beneath bed offering earthly treasures as final temptation, room filled with symbols of worldly wealth including coins, jewelry, and fine fabrics, younger version of miser in background storing gold in chest while demons whisper encouragement, moral choice visualized through miser's gesture reaching simultaneously toward money and salvation, architectural details showing luxury of wealthy household with ornate furnishings, symbolic objects throughout room representing vanity and temporary nature of material possessions, contrast between spiritual and material values embodied in single dramatic moment, angel's serene expression opposing demon's grotesque features, Death portrayed as inevitable equalizer regardless of earthly status, rich symbolism drawn from medieval morality traditions, Flemish oil painting technique creating dramatic lighting effects, psychological tension expressed through body language and facial expressions, 8K resolution showing every symbolic detail and moral lesson about choosing eternal over temporal values"
        },
        {
          value: "conjurer",
          label: "🎭 The Conjurer Deception",
          description: "GODLEVEL PROMPT: Hieronymus Bosch's satirical scene of The Conjurer showing street magician deceiving gullible audience through sleight of hand, central figure of conjurer performing cup-and-ball trick while pickpocket accomplice steals from mesmerized spectators, crowd of onlookers with varying expressions from wonder to suspicion, symbolic owl perched nearby representing wisdom ignored by foolish audience, conjurer's table displaying magical implements and mysterious objects, background figures engaged in various forms of deception and trickery, moral allegory about human susceptibility to illusion and false promises, detailed character studies showing different personality types from naive to cunning, rich costume details indicating social status of various spectators, symbolic elements throughout scene warning against trusting appearances, masterful composition drawing viewer's eye to central deception while revealing secondary tricks, psychological insight into human nature and desire to believe in magic, social commentary on charlatans and their willing victims, Flemish painting technique with precise brushwork and luminous colors, hidden symbolic meanings in everyday objects and gestures, 8K hyperrealistic detail capturing every facial expression and symbolic element revealing deeper truths about human gullibility and moral blindness"
        },
        {
          value: "stone-operation",
          label: "🔪 Extraction of Stone of Madness",
          description: "GODLEVEL PROMPT: Hieronymus Bosch's satirical medical scene showing quack surgeon extracting 'stone of folly' from patient's head, central composition featuring supposed doctor wearing funnel as hat performing fraudulent operation, patient seated in chair with head bandaged while flower emerges instead of stone, audience of onlookers including nun and monk observing procedure with mixture of faith and skepticism, Latin inscription warning against trusting false healers, symbolic elements throughout scene representing different forms of human folly, medical instruments displayed prominently despite their uselessness for actual healing, landscape background showing normal life continuing while deception unfolds, rich symbolism with funnel representing empty-headedness of both doctor and patient, flower symbolizing natural growth versus artificial intervention, detailed facial expressions revealing character of each participant, social commentary on medical charlatanry and human desperation for cures, masterful use of circular composition focusing attention on central deception, Flemish oil painting technique creating precise detail and luminous effects, psychological insight into relationship between healer and patient, moral lesson about distinguishing genuine help from exploitation, 8K resolution showing every brushstroke and symbolic meaning in this allegory of human gullibility"
        },
        {
          value: "adoration-magi",
          label: "👑 Adoration of the Magi",
          description: "GODLEVEL PROMPT: Hieronymus Bosch's unique interpretation of the Adoration of the Magi blending traditional nativity with fantastical elements, three wise men presenting gifts to infant Christ while strange figures lurk in background, Melchior, Caspar, and Balthazar depicted with rich oriental costumes and exotic features, Virgin Mary holding Christ child in humble stable contrasting with elaborate gifts, Joseph standing protectively nearby while mysterious figures peer through stable openings, background landscape filled with Bosch's characteristic hybrid creatures and impossible architecture, symbolic gifts of gold, frankincense, and myrrh displayed prominently, angels hovering overhead in luminous glory, demonic figures hidden in shadows representing evil's presence even at Christ's birth, detailed crowd scenes showing mixture of devotion and curiosity, exotic animals from distant lands accompanying the magi's caravan, architectural elements combining realistic stable with fantastical structures, rich symbolism throughout representing triumph of good over evil, masterful use of light focusing on holy family while shadows conceal threatening elements, Flemish painting technique with jewel-like colors and precise detail, theological complexity expressed through visual narrative, 8K hyperrealistic resolution capturing every symbolic element and devotional detail in this sacred yet surreal composition"
        },
        {
          value: "christ-carrying-cross",
          label: "✝️ Christ Carrying the Cross",
          description: "GODLEVEL PROMPT: Hieronymus Bosch's intense close-up composition of Christ carrying the cross surrounded by grotesque faces of tormentors, central figure of Christ with serene expression amid chaos of hatred and mockery, crowd of distorted faces showing various expressions of cruelty, indifference, and sadistic pleasure, two thieves also visible with contrasting expressions of repentance and defiance, detailed physiognomy studies revealing inner character through external features, symbolic elements including crown of thorns and instruments of passion, masterful psychological portraiture showing spectrum of human nature from divine to demonic, rich symbolism with each face representing different aspect of humanity's response to divine sacrifice, composition creating claustrophobic effect emphasizing Christ's isolation, Flemish oil painting technique achieving photographic realism in facial details, moral commentary on human capacity for both cruelty and redemption, background elements minimal to focus attention on human drama, lighting effects creating dramatic contrast between Christ's luminous face and dark surrounding figures, theological depth expressed through visual narrative of salvation, 8K hyperrealistic detail showing every wrinkle, expression, and symbolic element in this profound meditation on human nature and divine love"
        }
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
            domes and 360° environments. Now featuring GODLEVEL Indonesian tribal heritage prompts and M.C. Escher
            mathematical art! 🇮🇩✨
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
                          <SelectItem value="escher">🎨 M.C. Escher Mathematical Art</SelectItem>
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
                          <SelectItem value="bosch">🎨 Hieronymus Bosch Fantastical Worlds</SelectItem>
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
                              placeholder="Describe your vision... (will be enhanced with GODLEVEL details)"
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
                                with immersive tunnel effect and hyperrealistic details
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
                                immersive viewing with hyperrealistic details
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
                                ? "Your custom prompt will be enhanced with GODLEVEL elements"
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
                        <p className="text-sm text-slate-400">Generate some GODLEVEL art to see it here</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {currentItems.map((art) => (
                        <Card key={art.id} className="bg-slate-900 border-slate-600 overflow-hidden">
                          <div className="relative">
                            {art.mode === "svg" ? (
                              <div
                                className="w-full h-48 flex items-center justify-center bg-slate-800"
                                dangerouslySetInnerHTML={{ __html: art.svgContent }}
                              />
                            ) : (
                              <img
                                src={art.imageUrl || "/placeholder.svg"}
                                alt={`Generated ${art.params?.dataset} artwork`}
                                className="w-full h-48 object-cover"
                              />
                            )}
                            <div className="absolute top-2 left-2">
                              <Badge className="bg-purple-600 text-white text-xs">
                                {getDatasetDisplayName(art.params?.dataset || "unknown")}
                              </Badge>
                            </div>
                            <div className="absolute top-2 right-2">
                              <Badge variant="outline" className="border-green-500 text-green-400 text-xs">
                                GODLEVEL
                              </Badge>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-slate-200 capitalize">
                                  {art.params?.scenario || "Unknown"}
                                </h4>
                                <span className="text-xs text-slate-400">
                                  {new Date(art.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                <Badge variant="outline" className="text-xs border-slate-500 text-slate-400">
                                  {art.params?.colorScheme || "Default"}
                                </Badge>
                                <Badge variant="outline" className="text-xs border-slate-500 text-slate-400">
                                  {art.mode?.toUpperCase() || "UNKNOWN"}
                                </Badge>
                                {art.isDomeProjection && (
                                  <Badge variant="outline" className="text-xs border-purple-500 text-purple-400">
                                    Dome
                                  </Badge>
                                )}
                                {art.is360Panorama && (
                                  <Badge variant="outline" className="text-xs border-green-500 text-green-400">
                                    360°
                                  </Badge>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setGeneratedArt(art)
                                    // Switch to generate tab to view
                                    const generateTab = document.querySelector('[value="generate"]') as HTMLElement
                                    generateTab?.click()
                                  }}
                                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-xs h-7"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="border-slate-600 bg-transparent"
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-slate-400">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="border-slate-600 bg-transparent"
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

        {/* Quick Actions */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                size="sm"
                variant="outline"
                onClick={resetAllParameters}
                className="border-slate-600 bg-transparent text-slate-300 hover:bg-slate-700"
              >
                Reset Parameters
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={randomizeSeed}
                className="border-slate-600 bg-transparent text-slate-300 hover:bg-slate-700"
              >
                <Dice1 className="h-3 w-3 mr-1" />
                Random Seed
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDataset("indonesian")}
                className="border-slate-600 bg-transparent text-slate-300 hover:bg-slate-700"
              >
                🇮🇩 Indonesian GODLEVEL
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDataset("escher")}
                className="border-slate-600 bg-transparent text-slate-300 hover:bg-slate-700"
              >
                🎨 M.C. Escher Math
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDataset("8bit")}
                className="border-slate-600 bg-transparent text-slate-300 hover:bg-slate-700"
              >
                🎮 8bit Pixel Art
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


// Default export
export default FlowArtGenerator
