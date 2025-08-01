import { type NextRequest, NextResponse } from "next/server"

// Enhanced dataset information with comprehensive details
const DATASET_INFO = {
  nuanu: {
    name: "Nuanu Creative City",
    description:
      "A visionary development in Bali creating a future where culture, nature, and innovation thrive together, blending divine inspiration with harmonious living.",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description: "Raw mathematical beauty and geometric precision with sacred geometry patterns",
        keywords: [
          "mathematical precision",
          "geometric patterns",
          "algorithmic beauty",
          "pure mathematics",
          "sacred geometry",
          "golden ratio",
          "fibonacci sequences",
          "fractal structures",
          "symmetrical designs",
          "mathematical harmony",
        ],
      },
      "thk-tower": {
        name: "THK Tower",
        description:
          "The iconic architectural centerpiece of Nuanu Creative City, representing innovation and sustainable design with futuristic elements",
        keywords: [
          "modern architecture",
          "sustainable design",
          "iconic tower",
          "innovative structure",
          "green building",
          "futuristic design",
          "glass facades",
          "steel frameworks",
          "eco-friendly materials",
          "architectural marvel",
          "urban landmark",
          "contemporary aesthetics",
        ],
      },
      "popper-sentinels": {
        name: "Popper Sentinels",
        description:
          "Guardian statue installations that watch over the creative community with mysterious presence and artistic grandeur",
        keywords: [
          "guardian statues",
          "sentinel figures",
          "protective installations",
          "mysterious guardians",
          "artistic sculptures",
          "monumental art",
          "stone carvings",
          "bronze sculptures",
          "watchful protectors",
          "artistic monuments",
          "sculptural guardians",
        ],
      },
      "luna-beach": {
        name: "Luna Beach Club",
        description:
          "Sophisticated coastal creative space where ocean meets innovation in perfect harmony with tropical luxury",
        keywords: [
          "beach club",
          "coastal architecture",
          "ocean views",
          "luxury design",
          "tropical modernism",
          "waterfront",
          "seaside elegance",
          "palm trees",
          "infinity pools",
          "sunset terraces",
          "beachfront paradise",
          "coastal sophistication",
        ],
      },
      "labyrinth-dome": {
        name: "Labyrinth Dome",
        description:
          "Immersive geodesic dome experience featuring interactive digital installations and sacred geometry with mystical ambiance",
        keywords: [
          "geodesic dome",
          "immersive experience",
          "digital installations",
          "interactive art",
          "sacred geometry",
          "dome architecture",
          "mystical ambiance",
          "light projections",
          "holographic displays",
          "spiritual journey",
          "technological art",
        ],
      },
      "creative-studios": {
        name: "Creative Studios",
        description:
          "Artist workshops and collaborative spaces fostering innovation and cultural exchange with inspiring environments",
        keywords: [
          "artist studios",
          "creative workshops",
          "collaborative spaces",
          "innovation hubs",
          "cultural exchange",
          "maker spaces",
          "artistic creation",
          "inspiring environments",
          "creative energy",
          "artistic community",
          "workshop atmosphere",
        ],
      },
      "community-plaza": {
        name: "Community Plaza",
        description:
          "Central gathering space where culture, nature, and innovation converge in harmonious living with vibrant social energy",
        keywords: [
          "community gathering",
          "central plaza",
          "cultural convergence",
          "harmonious living",
          "social spaces",
          "public art",
          "vibrant atmosphere",
          "cultural celebration",
          "community spirit",
          "social harmony",
          "gathering place",
        ],
      },
      "digital-gardens": {
        name: "Digital Gardens",
        description:
          "Tech-nature integration showcasing the future of sustainable living and digital harmony with bio-technological wonders",
        keywords: [
          "digital nature",
          "tech integration",
          "sustainable living",
          "smart gardens",
          "bio-technology",
          "future ecology",
          "digital flora",
          "technological nature",
          "smart ecosystems",
          "bio-digital fusion",
          "futuristic gardens",
        ],
      },
    },
  },
  bali: {
    name: "Balinese Cultural Heritage",
    description:
      "Rich cultural traditions of Bali including Hindu temples, rice terraces, traditional ceremonies, and sacred arts with spiritual depth",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description: "Raw mathematical beauty and geometric precision with sacred geometry patterns",
        keywords: [
          "mathematical precision",
          "geometric patterns",
          "algorithmic beauty",
          "pure mathematics",
          "sacred geometry",
          "golden ratio",
          "fibonacci sequences",
          "fractal structures",
          "symmetrical designs",
          "mathematical harmony",
        ],
      },
      temples: {
        name: "Hindu Temples",
        description:
          "Sacred Pura architecture with intricate stone carvings and spiritual significance, featuring ornate details and divine atmosphere",
        keywords: [
          "Hindu temples",
          "Pura architecture",
          "stone carvings",
          "spiritual sanctuaries",
          "Balinese temples",
          "sacred architecture",
          "ornate details",
          "divine atmosphere",
          "temple spires",
          "religious art",
          "spiritual energy",
          "ancient wisdom",
          "ceremonial spaces",
          "holy grounds",
        ],
      },
      "rice-terraces": {
        name: "Rice Terraces",
        description:
          "Jatiluwih terraced landscapes showcasing ancient agricultural wisdom with emerald green fields cascading down mountainsides",
        keywords: [
          "rice terraces",
          "Jatiluwih",
          "agricultural landscapes",
          "terraced fields",
          "ancient farming",
          "green terraces",
          "emerald fields",
          "mountain agriculture",
          "cascading terraces",
          "rural beauty",
          "farming heritage",
          "landscape art",
          "natural geometry",
        ],
      },
      ceremonies: {
        name: "Hindu Ceremonies",
        description:
          "Galungan and Kuningan festivals with colorful processions and offerings, featuring vibrant celebrations and spiritual devotion",
        keywords: [
          "Hindu ceremonies",
          "Galungan festival",
          "Kuningan celebration",
          "religious processions",
          "temple offerings",
          "Balinese rituals",
          "colorful celebrations",
          "spiritual devotion",
          "festival atmosphere",
          "cultural traditions",
          "ceremonial beauty",
          "religious art",
        ],
      },
      dancers: {
        name: "Traditional Dancers",
        description:
          "Legong and Kecak performances with elaborate costumes and graceful movements, showcasing cultural artistry and storytelling",
        keywords: [
          "Balinese dance",
          "Legong dancers",
          "Kecak performance",
          "traditional costumes",
          "cultural dance",
          "graceful movements",
          "elaborate costumes",
          "artistic performance",
          "cultural storytelling",
          "dance artistry",
          "traditional theater",
          "expressive movement",
        ],
      },
      beaches: {
        name: "Tropical Beaches",
        description:
          "Volcanic sand beaches with coral reefs and traditional fishing boats, featuring pristine coastlines and ocean beauty",
        keywords: [
          "tropical beaches",
          "volcanic sand",
          "coral reefs",
          "fishing boats",
          "coastal temples",
          "ocean views",
          "pristine coastlines",
          "turquoise waters",
          "beach paradise",
          "coastal beauty",
          "marine life",
          "seaside serenity",
        ],
      },
      artisans: {
        name: "Balinese Artisans",
        description:
          "Master craftsmen creating wood carvings, silver jewelry, and traditional arts with exceptional skill and cultural heritage",
        keywords: [
          "Balinese artisans",
          "wood carving",
          "silver jewelry",
          "traditional crafts",
          "master craftsmen",
          "cultural arts",
          "handmade creations",
          "artistic heritage",
          "skilled craftsmanship",
          "cultural preservation",
          "artistic tradition",
          "creative mastery",
        ],
      },
      volcanoes: {
        name: "Sacred Volcanoes",
        description:
          "Mount Batur and Mount Agung, sacred peaks central to Balinese spirituality with majestic volcanic landscapes",
        keywords: [
          "Mount Batur",
          "Mount Agung",
          "sacred volcanoes",
          "volcanic peaks",
          "spiritual mountains",
          "sunrise views",
          "majestic landscapes",
          "volcanic beauty",
          "mountain spirituality",
          "natural grandeur",
          "sacred peaks",
          "volcanic majesty",
        ],
      },
    },
  },
  tribes: {
    name: "Cultural Communities",
    description:
      "Artistic patterns inspired by traditional community structures and cultural heritage with rich storytelling traditions",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description: "Raw mathematical beauty and geometric precision with sacred geometry patterns",
        keywords: [
          "mathematical precision",
          "geometric patterns",
          "algorithmic beauty",
          "pure mathematics",
          "sacred geometry",
          "golden ratio",
          "fibonacci sequences",
          "fractal structures",
          "symmetrical designs",
          "mathematical harmony",
        ],
      },
      landscape: {
        name: "Natural Landscape",
        description:
          "Community settlements in natural environments with traditional architecture harmoniously integrated with nature",
        keywords: [
          "community settlements",
          "natural landscape",
          "traditional architecture",
          "cultural villages",
          "harmonious design",
          "natural integration",
          "environmental harmony",
          "sustainable living",
          "landscape architecture",
          "cultural landscapes",
          "traditional settlements",
          "community design",
        ],
      },
      architectural: {
        name: "Village Architecture",
        description:
          "Traditional building patterns and community design principles showcasing cultural wisdom and architectural heritage",
        keywords: [
          "village architecture",
          "traditional buildings",
          "community design",
          "cultural structures",
          "heritage architecture",
          "architectural wisdom",
          "building traditions",
          "structural heritage",
          "community planning",
          "cultural buildings",
          "traditional construction",
          "architectural legacy",
        ],
      },
      ceremonial: {
        name: "Ceremonial Grounds",
        description:
          "Sacred spaces for cultural celebrations and community gatherings with spiritual significance and festive atmosphere",
        keywords: [
          "ceremonial grounds",
          "cultural celebrations",
          "community gatherings",
          "festival spaces",
          "traditional ceremonies",
          "sacred spaces",
          "spiritual gatherings",
          "cultural festivals",
          "celebration grounds",
          "community rituals",
          "festive atmosphere",
          "cultural heritage",
        ],
      },
      seasonal: {
        name: "Seasonal Activities",
        description:
          "Seasonal patterns and traditional cultural activities showcasing the rhythm of community life and natural cycles",
        keywords: [
          "seasonal activities",
          "cultural practices",
          "traditional festivals",
          "community traditions",
          "seasonal celebrations",
          "cultural rhythms",
          "natural cycles",
          "community life",
          "traditional practices",
          "seasonal rituals",
          "cultural seasons",
          "community activities",
        ],
      },
    },
  },
  natives: {
    name: "Indigenous Heritage",
    description:
      "Artistic interpretations of indigenous cultural patterns and traditional designs with deep spiritual connections",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description: "Raw mathematical beauty and geometric precision with sacred geometry patterns",
        keywords: [
          "mathematical precision",
          "geometric patterns",
          "algorithmic beauty",
          "pure mathematics",
          "sacred geometry",
          "golden ratio",
          "fibonacci sequences",
          "fractal structures",
          "symmetrical designs",
          "mathematical harmony",
        ],
      },
      landscape: {
        name: "Natural Landscape",
        description:
          "Indigenous communities in harmony with natural environments showcasing environmental stewardship and cultural landscapes",
        keywords: [
          "indigenous communities",
          "natural harmony",
          "cultural landscapes",
          "traditional territories",
          "environmental stewardship",
          "natural wisdom",
          "ecological balance",
          "landscape heritage",
          "environmental culture",
          "natural preservation",
          "cultural ecology",
          "traditional knowledge",
        ],
      },
      architectural: {
        name: "Traditional Architecture",
        description:
          "Indigenous building styles and architectural heritage featuring sustainable design and cultural significance",
        keywords: [
          "traditional architecture",
          "indigenous buildings",
          "cultural structures",
          "heritage design",
          "sustainable architecture",
          "building heritage",
          "architectural traditions",
          "cultural construction",
          "traditional design",
          "indigenous craftsmanship",
          "architectural wisdom",
          "structural heritage",
        ],
      },
      ceremonial: {
        name: "Sacred Ceremonies",
        description: "Spiritual and cultural ceremonial practices with deep meaning and traditional significance",
        keywords: [
          "sacred ceremonies",
          "cultural rituals",
          "spiritual practices",
          "traditional celebrations",
          "ceremonial art",
          "spiritual traditions",
          "cultural spirituality",
          "sacred practices",
          "ritual ceremonies",
          "spiritual heritage",
          "ceremonial traditions",
          "cultural ceremonies",
        ],
      },
      seasonal: {
        name: "Seasonal Life",
        description:
          "Seasonal activities and natural cycles in indigenous culture showcasing harmony with nature's rhythms",
        keywords: [
          "seasonal life",
          "natural cycles",
          "traditional activities",
          "cultural seasons",
          "environmental harmony",
          "seasonal wisdom",
          "natural rhythms",
          "cultural cycles",
          "seasonal traditions",
          "natural harmony",
          "environmental culture",
          "seasonal practices",
        ],
      },
    },
  },
  heads: {
    name: "Portrait Compositions",
    description:
      "Artistic compositions featuring human portraits and facial expressions in mosaic arrangements with emotional depth",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description: "Raw mathematical beauty and geometric precision with sacred geometry patterns",
        keywords: [
          "mathematical precision",
          "geometric patterns",
          "algorithmic beauty",
          "pure mathematics",
          "sacred geometry",
          "golden ratio",
          "fibonacci sequences",
          "fractal structures",
          "symmetrical designs",
          "mathematical harmony",
        ],
      },
      landscape: {
        name: "Portrait Landscape",
        description:
          "Artistic portraits arranged in landscape compositions showcasing human diversity and emotional expression",
        keywords: [
          "portrait landscape",
          "artistic faces",
          "human expressions",
          "portrait arrangements",
          "facial art",
          "human diversity",
          "emotional portraits",
          "expressive faces",
          "portrait gallery",
          "facial compositions",
          "human artistry",
          "portrait mosaic",
        ],
      },
      architectural: {
        name: "Structured Portraits",
        description:
          "Geometric arrangements of portrait compositions featuring systematic organization and artistic structure",
        keywords: [
          "structured portraits",
          "geometric faces",
          "architectural portraits",
          "organized compositions",
          "systematic arrangements",
          "portrait geometry",
          "structured art",
          "geometric organization",
          "architectural faces",
          "systematic portraits",
          "organized artistry",
          "geometric composition",
        ],
      },
      ceremonial: {
        name: "Expressive Portraits",
        description:
          "Portraits with diverse expressions and cultural themes showcasing human emotion and cultural diversity",
        keywords: [
          "expressive portraits",
          "diverse expressions",
          "cultural faces",
          "artistic portraits",
          "human diversity",
          "emotional expressions",
          "cultural portraits",
          "diverse faces",
          "expressive art",
          "human emotions",
          "portrait diversity",
          "cultural expressions",
        ],
      },
      seasonal: {
        name: "Emotional Variations",
        description:
          "Diverse emotional expressions and portrait variations showcasing the full spectrum of human emotion",
        keywords: [
          "emotional variations",
          "diverse emotions",
          "expressive faces",
          "human emotions",
          "portrait diversity",
          "emotional spectrum",
          "facial expressions",
          "human feelings",
          "emotional art",
          "expressive diversity",
          "emotional portraits",
          "human expression",
        ],
      },
    },
  },
  indonesian: {
    name: "Indonesian Mythology",
    description:
      "Rich mythological traditions of Indonesia featuring legendary creatures, spirits, and supernatural beings from Javanese, Balinese, Sundanese, and other regional folklore",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description: "Raw mathematical beauty and geometric precision with sacred geometry patterns",
        keywords: [
          "mathematical precision",
          "geometric patterns",
          "algorithmic beauty",
          "pure mathematics",
          "sacred geometry",
          "golden ratio",
          "fibonacci sequences",
          "fractal structures",
          "symmetrical designs",
          "mathematical harmony",
        ],
      },
      garuda: {
        name: "Garuda",
        description:
          "The magnificent divine bird creature, mount of Vishnu, symbol of Indonesia with golden feathers and majestic wings",
        keywords: [
          "divine bird",
          "golden feathers",
          "majestic wings",
          "mythical creature",
          "Indonesian symbol",
          "divine mount",
          "celestial being",
          "powerful wings",
          "sacred bird",
          "legendary creature",
          "mythological guardian",
          "spiritual protector",
        ],
      },
      barong: {
        name: "Barong",
        description:
          "The benevolent lion-like creature from Balinese mythology, protector against evil spirits with ornate decorations",
        keywords: [
          "benevolent guardian",
          "lion creature",
          "ornate decorations",
          "protective spirit",
          "Balinese mythology",
          "spiritual guardian",
          "ceremonial mask",
          "cultural protector",
          "traditional art",
          "mythical guardian",
          "sacred creature",
          "divine protector",
        ],
      },
      rangda: {
        name: "Rangda",
        description: "The powerful witch queen from Balinese folklore with wild hair, fangs, and mystical powers",
        keywords: [
          "witch queen",
          "mystical powers",
          "supernatural being",
          "Balinese folklore",
          "magical creature",
          "ancient wisdom",
          "spiritual entity",
          "mythological figure",
          "powerful sorceress",
          "legendary witch",
          "mystical guardian",
          "supernatural protector",
        ],
      },
      naga: {
        name: "Naga Serpent",
        description: "The divine serpent beings with human torsos and snake tails, guardians of water and wisdom",
        keywords: [
          "divine serpent",
          "serpent guardian",
          "water protector",
          "wisdom keeper",
          "mythical serpent",
          "aquatic guardian",
          "spiritual serpent",
          "legendary creature",
          "mystical being",
          "ancient guardian",
          "serpent deity",
          "water spirit",
        ],
      },
      hanuman: {
        name: "Hanuman",
        description:
          "The devoted monkey deity with incredible strength, wisdom, and loyalty from Hindu-Javanese tradition",
        keywords: [
          "monkey deity",
          "divine strength",
          "spiritual wisdom",
          "loyal guardian",
          "Hindu tradition",
          "mythical hero",
          "spiritual warrior",
          "divine messenger",
          "legendary protector",
          "sacred monkey",
          "spiritual guide",
          "mythological hero",
        ],
      },
      dewi: {
        name: "Dewi Sri",
        description:
          "The beautiful rice goddess bringing prosperity and abundance, patron of agriculture and fertility",
        keywords: [
          "rice goddess",
          "prosperity bringer",
          "agricultural deity",
          "fertility goddess",
          "abundant harvest",
          "divine beauty",
          "spiritual nurturer",
          "cultural goddess",
          "traditional deity",
          "sacred feminine",
          "harvest protector",
          "agricultural guardian",
        ],
      },
      wayang: {
        name: "Wayang Characters",
        description:
          "Traditional shadow puppet characters representing heroes, gods, and mythical beings from Indonesian epics",
        keywords: [
          "shadow puppets",
          "traditional theater",
          "mythical heroes",
          "cultural characters",
          "epic stories",
          "artistic tradition",
          "storytelling art",
          "cultural heritage",
          "traditional performance",
          "mythological theater",
          "shadow art",
          "cultural storytelling",
        ],
      },
    },
  },
  horror: {
    name: "Indonesian Horror Creatures",
    description:
      "Terrifying supernatural beings and horror creatures from Indonesian folklore, urban legends, and traditional ghost stories",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description: "Raw mathematical beauty and geometric precision with sacred geometry patterns",
        keywords: [
          "mathematical precision",
          "geometric patterns",
          "algorithmic beauty",
          "pure mathematics",
          "sacred geometry",
          "golden ratio",
          "fibonacci sequences",
          "fractal structures",
          "symmetrical designs",
          "mathematical harmony",
        ],
      },
      pontianak: {
        name: "Pontianak",
        description:
          "The vampiric spirit of a woman who died in childbirth, appearing as a beautiful woman to lure victims",
        keywords: [
          "vampiric spirit",
          "supernatural entity",
          "ghostly apparition",
          "mysterious figure",
          "folkloric creature",
          "spiritual being",
          "traditional ghost",
          "cultural legend",
          "supernatural guardian",
          "mystical presence",
          "ethereal being",
          "legendary spirit",
        ],
      },
      kuntilanak: {
        name: "Kuntilanak",
        description: "The vengeful female spirit with long black hair and white dress, seeking justice from beyond",
        keywords: [
          "vengeful spirit",
          "ghostly figure",
          "supernatural presence",
          "ethereal being",
          "spiritual entity",
          "mysterious apparition",
          "folkloric ghost",
          "cultural spirit",
          "traditional legend",
          "mystical guardian",
          "supernatural protector",
          "legendary presence",
        ],
      },
      penanggalan: {
        name: "Penanggalan",
        description:
          "The floating head spirit with trailing organs, a supernatural entity from Malay-Indonesian folklore",
        keywords: [
          "floating spirit",
          "supernatural entity",
          "mystical being",
          "folkloric creature",
          "spiritual presence",
          "ethereal guardian",
          "traditional spirit",
          "cultural legend",
          "mysterious entity",
          "supernatural guardian",
          "mystical protector",
          "legendary being",
        ],
      },
      pocong: {
        name: "Pocong",
        description:
          "The hopping ghost wrapped in burial shroud, a restless spirit seeking peace in Indonesian folklore",
        keywords: [
          "hopping ghost",
          "restless spirit",
          "burial shroud",
          "supernatural being",
          "folkloric ghost",
          "spiritual entity",
          "traditional spirit",
          "cultural legend",
          "mysterious presence",
          "ethereal being",
          "ghostly figure",
          "legendary spirit",
        ],
      },
      leak: {
        name: "Leak",
        description: "The shape-shifting witch from Balinese folklore with supernatural powers and mystical abilities",
        keywords: [
          "shape-shifting witch",
          "supernatural powers",
          "mystical abilities",
          "Balinese folklore",
          "magical entity",
          "spiritual being",
          "folkloric creature",
          "traditional witch",
          "cultural legend",
          "mystical guardian",
          "supernatural protector",
          "legendary sorceress",
        ],
      },
      wewe: {
        name: "Wewe Gombel",
        description: "The protective spirit of children who appears as an elderly woman, guardian of lost souls",
        keywords: [
          "protective spirit",
          "child guardian",
          "benevolent ghost",
          "spiritual protector",
          "folkloric guardian",
          "cultural spirit",
          "traditional protector",
          "mystical guardian",
          "supernatural caretaker",
          "legendary protector",
          "spiritual guide",
          "ethereal guardian",
        ],
      },
      sundel: {
        name: "Sundel Bolong",
        description:
          "The beautiful ghostly woman with a hole in her back, a tragic spirit from Indonesian urban legends",
        keywords: [
          "ghostly woman",
          "tragic spirit",
          "urban legend",
          "supernatural beauty",
          "folkloric ghost",
          "cultural legend",
          "mysterious entity",
          "spiritual being",
          "traditional ghost",
          "ethereal presence",
          "legendary spirit",
          "mystical figure",
        ],
      },
    },
  },
}

// Generate comprehensive AI art prompt with rich details
function generateComprehensiveAIPrompt(
  dataset: string,
  scenario: string,
  colorScheme: string,
  customPrompt?: string,
): string {
  const datasetInfo = DATASET_INFO[dataset as keyof typeof DATASET_INFO]
  const scenarioInfo = datasetInfo?.scenarios[scenario as keyof typeof datasetInfo.scenarios]

  if (!datasetInfo || !scenarioInfo) {
    return `Create a magnificent abstract digital artwork with ${colorScheme} colors featuring intricate geometric patterns, mathematical precision, and stunning visual complexity. Style: ultra-detailed, masterpiece quality, professional digital art, perfect composition, harmonious design, breathtaking beauty.`
  }

  let basePrompt = ""

  // If custom prompt is provided, integrate it with rich context
  if (customPrompt && customPrompt.trim()) {
    const sanitizedCustom = sanitizePrompt(customPrompt.trim())
    basePrompt = `${sanitizedCustom}, enhanced with ${datasetInfo.name}: ${scenarioInfo.description}. Create a breathtaking masterpiece celebrating ${scenarioInfo.name}.`
  } else {
    // Generate comprehensive prompt based on dataset and scenario
    basePrompt = `Create a stunning ${datasetInfo.name} masterpiece featuring ${scenarioInfo.name}: ${scenarioInfo.description}. This extraordinary artwork should capture the essence and beauty of this theme with exceptional artistic quality.`
  }

  // Add comprehensive color scheme context (shortened)
  const colorContext = {
    plasma:
      "vibrant plasma colors with electric blues, purples, and magentas, dynamic energy flows and spectacular light effects",
    quantum:
      "quantum field colors with deep blues to bright whites and golds, particle interactions and cosmic phenomena",
    cosmic:
      "cosmic colors with deep space blacks, stellar blues, and nebula purples, starfields and celestial formations",
    thermal:
      "thermal spectrum from cool blacks through warm reds to bright yellows, heat visualizations and energy distributions",
    spectral: "full spectral rainbow with smooth transitions, prismatic effects, and light dispersions",
    crystalline:
      "crystalline colors with clear blues, purples, and prismatic effects, gem-like clarity and refractive patterns",
    bioluminescent: "bioluminescent colors with glowing blues, greens, and ethereal lights, organic luminescence",
    aurora:
      "aurora borealis colors with dancing greens, blues, and purples, atmospheric phenomena and celestial displays",
    metallic:
      "metallic colors with silver, gold, copper, and bronze tones, lustrous surfaces and precious metal aesthetics",
    prismatic: "prismatic colors with rainbow refractions and light dispersions, optical phenomena and crystal optics",
    monochromatic:
      "monochromatic grayscale with subtle tonal variations, dramatic contrasts and sophisticated elegance",
    infrared:
      "infrared heat colors from deep reds to bright yellows, thermal imaging aesthetics and energy visualizations",
    lava: "molten lava colors with deep reds, oranges, and glowing yellows, volcanic energy and molten flows",
    futuristic:
      "futuristic colors with neon blues, purples, and electric accents, cyberpunk aesthetics and sci-fi themes",
    forest: "forest colors with deep greens, earth browns, and natural tones, woodland atmospheres and organic beauty",
    ocean: "ocean colors with deep blues, aqua greens, and foam whites, marine environments and aquatic beauty",
    sunset: "sunset colors with warm oranges, pinks, and golden yellows, romantic atmospheres and golden hour lighting",
    arctic: "arctic colors with ice blues, snow whites, and crystal clears, frozen landscapes and winter beauty",
    neon: "neon colors with electric pinks, greens, and glowing accents, vibrant nightlife aesthetics and urban energy",
    vintage:
      "vintage colors with sepia browns, aged golds, and muted tones, nostalgic atmospheres and timeless elegance",
    toxic: "toxic colors with acid greens, warning yellows, and danger reds, industrial aesthetics and intense impact",
    ember: "ember colors with glowing reds, orange sparks, and ash grays, fire aesthetics and warm glowing atmospheres",
    lunar:
      "lunar colors with silver grays, crater blacks, and moonlight whites, celestial themes and otherworldly beauty",
    tidal: "tidal colors with wave blues, foam whites, and deep ocean teals, oceanic movements and marine energy",
  }

  const colorDescription =
    colorContext[colorScheme as keyof typeof colorContext] ||
    `magnificent ${colorScheme} color palette with rich tonal variations and harmonious relationships`

  // Combine elements with optimized length
  let fullPrompt = `${basePrompt}

VISUAL STYLE: Rendered in ${colorDescription}. Museum-quality presentation with exceptional artistic quality, masterful color theory, perfect balance, and sophisticated visual hierarchy.

ARTISTIC ELEMENTS:`

  // Add scenario-specific keywords for enhanced detail
  if (scenarioInfo.keywords && scenarioInfo.keywords.length > 0) {
    const safeKeywords = scenarioInfo.keywords.filter((keyword) => !containsProblematicContent(keyword))
    if (safeKeywords.length > 0) {
      fullPrompt += ` ${safeKeywords.slice(0, 8).join(", ")}.`
    }
  }

  // Add technical specifications (shortened)
  fullPrompt += `

TECHNICAL EXCELLENCE:
- Ultra-high resolution with stunning detail and perfect clarity
- Professional digital art techniques with masterful execution  
- Perfect lighting design with dramatic shadows and highlights
- Exceptional color harmony and sophisticated palette usage
- Intricate textures and surface details
- Masterful composition with perfect balance and visual flow
- Museum-quality artistic presentation
- Breathtaking visual impact and emotional resonance
- Technical precision combined with artistic vision
- Innovative techniques pushing digital art boundaries

FINAL VISION: A breathtaking masterpiece that captures the essence of ${datasetInfo.name} with the highest levels of artistic achievement, technical excellence, and cultural authenticity.`

  return sanitizePrompt(fullPrompt)
}

// Sanitize prompt to avoid content policy violations while preserving richness
function sanitizePrompt(prompt: string): string {
  // Remove potentially problematic words/phrases but keep the rich descriptions
  const problematicTerms = [
    "tribal warfare",
    "warrior",
    "battle",
    "conflict",
    "weapon",
    "war",
    "fight",
    "violence",
    "blood",
    "death",
    "kill",
    "attack",
    "destroy",
    "harm",
    "dangerous",
    "threat",
    "enemy",
    "savage",
    "primitive",
    "barbaric",
  ]

  let sanitized = prompt

  problematicTerms.forEach((term) => {
    const regex = new RegExp(term, "gi")
    sanitized = sanitized.replace(regex, "peaceful")
  })

  // Replace with safer alternatives while maintaining descriptive richness
  sanitized = sanitized
    .replace(/warrior/gi, "guardian protector")
    .replace(/battle/gi, "grand celebration")
    .replace(/warfare/gi, "community gathering")
    .replace(/tribal/gi, "cultural")
    .replace(/primitive/gi, "traditional and authentic")
    .replace(/savage/gi, "natural and wild")
    .replace(/barbaric/gi, "authentic and powerful")

  return sanitized
}

// Check if content contains problematic terms
function containsProblematicContent(text: string): boolean {
  const problematicTerms = [
    "warfare",
    "warrior",
    "battle",
    "conflict",
    "weapon",
    "war",
    "fight",
    "violence",
    "blood",
    "death",
    "savage",
    "primitive",
    "barbaric",
  ]

  return problematicTerms.some((term) => text.toLowerCase().includes(term.toLowerCase()))
}

// Generate dome-specific prompt with rich details
function generateDomePrompt(basePrompt: string, additionalParams: any): string {
  const { domeDiameter, domeResolution, projectionType } = additionalParams

  return `IMMERSIVE PLANETARIUM DOME PROJECTION MASTERPIECE: Transform this extraordinary artwork for breathtaking ${domeDiameter}m diameter planetarium dome display at stunning ${domeResolution} resolution using advanced ${projectionType} projection mapping technology.

DOME-SPECIFIC TECHNICAL REQUIREMENTS:
- Sophisticated fisheye distortion optimization specifically calibrated for dome projection systems
- Powerful central focal point designed for optimal overhead viewing from dome center position
- Masterful radial composition that works flawlessly on curved dome surface geometry
- Strategic visual element distribution optimized for complete 180° field of view coverage
- Enhanced contrast and brightness calibration specifically for dome projection environments
- Seamless edge blending technology integration for perfect dome environment immersion
- Immersive perspective design that completely surrounds viewers in artistic beauty
- Advanced projection mapping compatibility with professional planetarium systems

ARTISTIC VISION FOR DOME EXPERIENCE:
${basePrompt}

DOME TRANSFORMATION SPECIFICATIONS:
Transform this magnificent concept specifically for planetarium dome projection, ensuring all visual elements are positioned and scaled with mathematical precision for optimal dome display. The composition should feature a powerful central focus with artistic elements radiating outward in perfect harmony, creating an absolutely breathtaking overhead viewing experience when projected on the dome ceiling. Every aspect should be optimized for the unique immersive environment of planetarium presentation, creating a transcendent artistic experience that surrounds viewers in beauty and wonder.`
}

// Generate 360° panorama-specific prompt with rich details
function generatePanoramaPrompt(basePrompt: string, additionalParams: any): string {
  const { panoramaResolution, panoramaFormat, stereographicPerspective } = additionalParams

  let panoramaPrompt = `IMMERSIVE 360° PANORAMIC MASTERPIECE: Transform this extraordinary artwork for breathtaking ${panoramaResolution} resolution 360° viewing experience in professional ${panoramaFormat} format.

360° PANORAMIC TECHNICAL REQUIREMENTS:
- Seamless wraparound composition with absolutely no visible seams or discontinuities
- Optimal horizontal aspect ratio specifically designed for 360° viewing experiences
- Strategic visual element distribution across the complete 360° viewing sphere
- Perfect horizon placement optimized for VR and 360° environment compatibility
- Flawless smooth transitions at wraparound edges with mathematical precision
- Enhanced detail density optimized for immersive viewing experiences
- Natural composition flow that works beautifully around the full circular view
- Professional VR compatibility with industry-standard 360° formats

ARTISTIC VISION FOR 360° EXPERIENCE:
${basePrompt}

360° TRANSFORMATION SPECIFICATIONS:
Transform this magnificent concept specifically for 360° panoramic viewing, ensuring the composition flows naturally and beautifully around the full circular view, creating an absolutely immersive experience when viewed in VR or 360° environments. Every element should be positioned with precision to create a seamless, breathtaking panoramic experience that surrounds viewers in artistic beauty.`

  if (panoramaFormat === "stereographic" && stereographicPerspective) {
    panoramaPrompt += `

ADVANCED STEREOGRAPHIC PROJECTION:
Apply sophisticated ${stereographicPerspective} stereographic projection for unique and captivating visual perspective. This creates a distinctive curved world effect that transforms the flat artwork into an immersive spherical experience with dramatic perspective distortion, mathematical precision, and artistic beauty that showcases the power of advanced projection mathematics.`
  }

  return sanitizePrompt(panoramaPrompt)
}

// Call OpenAI API with retry logic and better error handling
async function callOpenAI(prompt: string, retries = 2): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`OpenAI API call attempt ${attempt + 1}/${retries + 1}`)
      console.log(`Prompt length: ${prompt.length} characters`)

      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: prompt.length > 3900 ? prompt.substring(0, 3900) + "..." : prompt,
          n: 1,
          size: "1024x1024",
          quality: "hd",
          style: "vivid",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error(`OpenAI API error (attempt ${attempt + 1}):`, errorData)

        // Check if it's a content policy violation
        if (errorData.error?.code === "content_policy_violation") {
          console.log("Content policy violation detected, trying with safer prompt...")

          // Generate a comprehensive but safe fallback prompt
          const safePrompt = `Create a magnificent abstract digital artwork masterpiece with geometric patterns, flowing mathematical curves, and harmonious colors. Style: ultra-detailed, museum-quality, professional digital art, perfect composition, breathtaking beauty, artistic excellence, sophisticated design, masterful execution, stunning visual impact, technical precision, creative innovation, artistic mastery, visual sophistication, exceptional quality, gallery-worthy presentation, artistic brilliance, creative vision, technical excellence, professional artistry, masterpiece quality, breathtaking aesthetics, visual poetry, artistic perfection.`

          const safeResponse = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "dall-e-3",
              prompt: safePrompt,
              n: 1,
              size: "1024x1024",
              quality: "hd",
              style: "vivid",
            }),
          })

          if (safeResponse.ok) {
            const safeData = await safeResponse.json()
            if (safeData.data && safeData.data[0] && safeData.data[0].url) {
              console.log("✅ Generated comprehensive safe fallback artwork")
              return safeData.data[0].url
            }
          }
        }

        if (attempt === retries) {
          throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`)
        }

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)))
        continue
      }

      const data = await response.json()

      if (!data.data || !data.data[0] || !data.data[0].url) {
        throw new Error("No image URL returned from OpenAI API")
      }

      return data.data[0].url
    } catch (error) {
      console.error(`OpenAI API call failed (attempt ${attempt + 1}):`, error)

      if (attempt === retries) {
        throw error
      }

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)))
    }
  }

  throw new Error("All OpenAI API attempts failed")
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== FlowSketch Art Generation API ===")

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured")
    }

    const body = await request.json()
    const {
      dataset,
      scenario,
      colorScheme,
      seed,
      numSamples,
      noise,
      timeStep,
      customPrompt,
      domeProjection,
      domeDiameter,
      domeResolution,
      projectionType,
      panoramic360,
      panoramaResolution,
      panoramaFormat,
      stereographicPerspective,
    } = body

    console.log("Received generation request:", {
      dataset,
      scenario,
      colorScheme,
      customPrompt: customPrompt ? customPrompt.substring(0, 100) + "..." : "None",
      domeProjection,
      panoramic360,
    })

    // Generate comprehensive AI art prompt
    const mainPrompt = generateComprehensiveAIPrompt(dataset, scenario, colorScheme, customPrompt)
    console.log("Generated comprehensive main prompt:", mainPrompt.substring(0, 200) + "...")
    console.log(`Full prompt length: ${mainPrompt.length} characters`)

    // Generate main image
    console.log("🎨 Generating main artwork...")
    const mainImageUrl = await callOpenAI(mainPrompt)
    console.log("✅ Main artwork generated successfully")

    let domeImageUrl: string | undefined
    let panoramaImageUrl: string | undefined
    const generationDetails: any = {
      mainImage: "Generated successfully",
      domeImage: "Not requested",
      panoramaImage: "Not requested",
    }

    // Generate dome projection if requested
    if (domeProjection) {
      try {
        console.log("🏛️ Generating dome projection...")
        generationDetails.domeImage = "Generating..."

        const domePrompt = generateDomePrompt(mainPrompt, {
          domeDiameter,
          domeResolution,
          projectionType,
        })

        console.log("Generated dome prompt:", domePrompt.substring(0, 200) + "...")
        console.log(`Dome prompt length: ${domePrompt.length} characters`)
        domeImageUrl = await callOpenAI(domePrompt)
        generationDetails.domeImage = "Generated successfully"
        console.log("✅ Dome projection generated successfully")
      } catch (error: any) {
        console.error("❌ Dome projection generation failed:", error)
        generationDetails.domeImage = `Generation failed: ${error.message}`
      }
    }

    // Generate 360° panorama if requested
    if (panoramic360) {
      try {
        console.log("🌐 Generating 360° panorama...")
        generationDetails.panoramaImage = "Generating..."

        const panoramaPrompt = generatePanoramaPrompt(mainPrompt, {
          panoramaResolution,
          panoramaFormat,
          stereographicPerspective,
        })

        console.log("Generated panorama prompt:", panoramaPrompt.substring(0, 200) + "...")
        console.log(`Panorama prompt length: ${panoramaPrompt.length} characters`)
        panoramaImageUrl = await callOpenAI(panoramaPrompt)
        generationDetails.panoramaImage = "Generated successfully"
        console.log("✅ 360° panorama generated successfully")
      } catch (error: any) {
        console.error("❌ 360° panorama generation failed:", error)
        generationDetails.panoramaImage = `Generation failed: ${error.message}`
      }
    }

    // Prepare response
    const response = {
      success: true,
      image: mainImageUrl,
      domeImage: domeImageUrl,
      panoramaImage: panoramaImageUrl,
      originalPrompt: mainPrompt,
      promptLength: mainPrompt.length,
      provider: "OpenAI",
      model: "DALL-E 3",
      estimatedFileSize: "~2-4MB",
      generationDetails,
      parameters: {
        dataset,
        scenario,
        colorScheme,
        seed,
        numSamples,
        noiseScale: noise,
        timeStep,
        domeProjection,
        domeDiameter,
        domeResolution,
        projectionType,
        panoramic360,
        panoramaResolution,
        panoramaFormat,
        stereographicPerspective,
      },
    }

    console.log("🎉 Generation completed successfully")
    console.log("📊 Final result summary:")
    console.log("- Main image:", !!response.image)
    console.log("- Dome image:", !!response.domeImage)
    console.log("- Panorama image:", !!response.panoramaImage)
    console.log("- Generation details:", response.generationDetails)
    console.log(`- Main prompt length: ${response.promptLength} characters`)

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("💥 Generation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate artwork",
        details: {
          name: error.name,
          stack: error.stack?.split("\n").slice(0, 5).join("\n"),
        },
      },
      { status: 500 },
    )
  }
}
