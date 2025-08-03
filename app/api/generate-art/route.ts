import { type NextRequest, NextResponse } from "next/server"
import { callOpenAI, generateDomePrompt, generatePanoramaPrompt } from "./utils"

function buildPrompt(dataset: string, scenario: string, colorScheme: string, customPrompt?: string): string {
  // Use custom prompt if provided
  if (customPrompt && customPrompt.trim()) {
    let prompt = customPrompt.trim()

    // Add color scheme to custom prompt
    const colorPrompts: Record<string, string> = {
      plasma: "vibrant plasma colors, electric blues and magentas",
      quantum: "quantum field colors, deep blues and ethereal whites",
      cosmic: "cosmic colors, deep space purples and stellar golds",
      thermal: "thermal imaging colors, heat signature reds and oranges",
      spectral: "full spectrum rainbow colors, prismatic light effects",
      crystalline: "crystalline colors, clear gems and mineral tones",
      bioluminescent: "bioluminescent colors, glowing organic blues and greens",
      aurora: "aurora borealis colors, dancing green and purple lights",
      metallic: "metallic tones, silver and bronze accents",
      prismatic: "prismatic light effects, rainbow refractions",
      monochromatic: "monochromatic grayscale, black and white tones",
      infrared: "infrared heat colors, thermal reds and oranges",
      lava: "molten lava colors, glowing reds and oranges",
      futuristic: "futuristic neon colors, cyberpunk aesthetics",
      forest: "forest greens and earth tones",
      ocean: "ocean blues and aqua tones",
      sunset: "warm sunset colors, oranges and deep reds",
      arctic: "arctic colors, ice blues and pristine whites",
      neon: "bright neon colors, electric pinks and greens",
      vintage: "vintage sepia tones, aged photograph aesthetics",
      toxic: "toxic green colors, radioactive aesthetics",
      ember: "glowing ember colors, warm orange and red coals",
      lunar: "lunar surface colors, silver grays and crater shadows",
      tidal: "tidal pool colors, ocean blues and sandy browns",
    }

    prompt += `, ${colorPrompts[colorScheme] || "vibrant colors"}`
    prompt +=
      ", highly detailed, artistic masterpiece, professional photography quality, 8K resolution, stunning visual composition"

    return prompt
  }

  // Build dataset-specific prompt
  let prompt = ""

  // Dataset-specific base prompts
  const datasetPrompts: Record<string, string> = {
    nuanu:
      "Nuanu Creative City architectural elements, modern creative spaces, innovative design, futuristic urban planning",
    bali: "Balinese Hindu temples, traditional architecture, tropical paradise, sacred geometry, rice terraces",
    thailand: "Thai Buddhist temples, golden spires, traditional architecture, serene landscapes, lotus flowers",
    indonesian: "Indonesian cultural heritage, traditional patterns, mystical elements, archipelago beauty",
    horror: "Indonesian mystical creatures, supernatural folklore elements, traditional legends",
    spirals: "Mathematical spiral patterns, Fibonacci sequences, golden ratio, geometric precision",
    fractal: "Fractal patterns, recursive geometry, infinite detail, mathematical beauty",
    mandelbrot: "Mandelbrot set visualization, complex mathematical patterns, infinite zoom",
    julia: "Julia set fractals, complex plane mathematics, iterative patterns",
    lorenz: "Lorenz attractor, chaos theory visualization, butterfly effect patterns",
    hyperbolic: "Hyperbolic geometry, non-Euclidean space, curved mathematical surfaces",
    gaussian: "Gaussian field visualization, statistical distributions, probability landscapes",
    cellular: "Cellular automata patterns, Conway's Game of Life, emergent complexity",
    voronoi: "Voronoi diagrams, spatial partitioning, natural tessellation patterns",
    perlin: "Perlin noise landscapes, procedural generation, organic randomness",
    diffusion: "Reaction-diffusion patterns, chemical wave propagation, Turing patterns",
    wave: "Wave interference patterns, harmonic oscillations, frequency visualizations",
    moons: "Lunar orbital mechanics, celestial body movements, gravitational dance",
    tribes: "Tribal network topology, social connections, community structures",
    heads: "Mosaic head compositions, portrait arrangements, facial geometry",
    natives: "Ancient native tribes, traditional cultures, indigenous wisdom",
    statues: "Sacred sculptural statues, carved monuments, artistic figures",
  }

  prompt = datasetPrompts[dataset] || "Abstract mathematical art"

  // Add scenario-specific details for Indonesian dataset
  if (dataset === "indonesian") {
    const scenarioPrompts: Record<string, string> = {
      pure: "pure mathematical beauty with Indonesian geometric patterns",
      garuda:
        "Majestic Garuda Wisnu Kencana soaring through celestial realms, massive divine eagle with wingspan stretching across golden sunset skies, intricate feather details shimmering with ethereal light, powerful talons gripping sacred lotus blossoms radiating divine energy, noble eagle head crowned with jeweled diadem of ancient Javanese kings, eyes blazing with cosmic wisdom and protective spirit, Lord Vishnu mounted majestically upon Garuda's back in full divine regalia with four arms holding sacred conch shell, discus wheel of time, lotus of creation, and ceremonial staff, flowing silk garments in royal blues and golds dancing in celestial winds, Mount Meru rising in background with cascading waterfalls of liquid starlight, temple spires piercing through clouds of incense and prayers, Indonesian archipelago spread below like scattered emeralds in sapphire seas, Ring of Fire volcanoes glowing with sacred flames, traditional gamelan music as golden sound waves rippling through dimensions, ancient Sanskrit mantras floating as luminous script in the air, Ramayana epic scenes carved into floating stone tablets, divine aura radiating rainbow light spectrum, cosmic mandala patterns swirling in the heavens, 17,508 islands of Indonesia visible as points of light below, Borobudur and Prambanan temples glowing with spiritual energy, traditional Indonesian textiles patterns woven into the very fabric of reality, hyperrealistic 8K cinematic masterpiece with volumetric lighting and particle effects",
      wayang:
        "Mystical Wayang Kulit shadow puppet performance bringing ancient Ramayana and Mahabharata epics to life, master dalang puppeteer silhouetted behind glowing white screen with hundreds of intricately carved leather puppets, each puppet a masterwork of perforated artistry with gold leaf details catching flickering oil lamp light, dramatic shadows dancing and morphing into living characters, Prince Rama with perfect noble features and ornate crown alongside beautiful Princess Sita with flowing hair and delicate jewelry radiating purity and grace, mighty Hanuman the white monkey hero leaping through air with mountain in his grasp, gamelan orchestra of bronze instruments creating visible sound waves in metallic gold and silver, traditional Indonesian musicians in batik clothing playing gender, saron, kendang drums, audience of villagers sitting cross-legged on woven mats mesmerized by the eternal stories, coconut oil lamps casting warm amber light creating multiple layers of shadows, ancient Javanese script floating in the air telling the story, tropical night sky filled with stars and flying spirits, traditional Javanese architecture with carved wooden pillars and clay tile roofs, incense smoke curling upward carrying prayers to ancestors, banana leaves and frangipani flowers as offerings, cultural heritage spanning over 1000 years visualized as golden threads connecting past to present, UNESCO World Heritage artistic tradition, hyperrealistic cinematic lighting with deep shadows and warm highlights, 8K resolution with intricate puppet details and atmospheric effects",
      batik:
        "Infinite cosmic tapestry of sacred Indonesian batik patterns coming alive with supernatural energy, master batik artisan's hands applying hot wax with traditional canting tool creating flowing lines that transform into living rivers of light, parang rusak diagonal patterns representing flowing water and eternal life force undulating like ocean waves, kawung geometric circles symbolizing cosmic order expanding into mandala formations that pulse with universal rhythm, mega mendung cloud motifs in deep indigo blues swirling with actual storm clouds and lightning, ceplok star formations bursting into real constellations in the night sky, sido mukti prosperity symbols manifesting as golden coins and rice grains falling like blessed rain, royal court designs with protective meanings creating shields of light around ancient Javanese palaces, intricate hand-drawn patterns using traditional canting tools guided by ancestral spirits, natural dyes from indigo plants, turmeric roots, and mahogany bark creating earth tones that shift and change like living skin, cultural identity woven into fabric of reality itself, UNESCO heritage craft mastery passed down through generations of royal court artisans, each pattern telling stories of creation myths and heroic legends, textile becoming portal to spiritual realm where ancestors dance in eternal celebration, traditional Javanese philosophy of harmony between human, nature, and divine visualized as interconnected geometric patterns, workshop filled with clay pots of dye, bamboo tools, and cotton fabric stretched on wooden frames, tropical sunlight filtering through palm leaves creating natural batik shadows on the ground, master craftswomen in traditional kebaya clothing working with meditative focus, the very air shimmering with creative energy and cultural pride, hyperrealistic 8K detail showing every wax crack and dye gradient, volumetric lighting and particle effects bringing ancient art form to supernatural life",
      borobudur:
        "Abstract mathematical mandala compositions with infinite geometric recursion, concentric circular patterns expanding outward in perfect mathematical harmony, three-dimensional geometric forms creating ascending spiral mathematics, bell-shaped mathematical curves and meditation circle equations integrated into cosmic algorithmic patterns, thousands of interconnected geometric panels showing mathematical sequences and numerical progressions rendered in abstract computational art style, serene mathematical equilibrium and golden ratio proportions becoming living geometric algorithms, multi-layered mandala mathematics with circular platforms representing different dimensional spaces, ancient geometric principles manifested in pure mathematical visualization, abstract mathematical textures with algorithmic complexity and fractal iterations, sacred geometry equations manifested in computational art forms, mathematical cosmology visualized through geometric algorithmic arrangements, classical mathematical sculpture aesthetics rendered in pure abstract form, algorithmic art style with deep mathematical shadows and dimensional complexity, ancient mathematical techniques creating intricate numerical patterns, spiritual mathematical symbolism expressed through geometric algorithms, meditation and mathematical enlightenment themes expressed through pure geometric art, classical geometric mathematical harmony, sacred mathematical mandala principles in algorithmic construction, ancient mathematical artistic traditions rendered as computational geometry, geometric mathematical mastery with intricate algorithmic detail work, spiritual mathematical journey visualized through ascending geometric mathematical forms, hyperrealistic 8K mathematical texture detail with dramatic algorithmic lighting, atmospheric effects showing pure mathematical craftsmanship and geometric artistry",
      komodo:
        "Mystical dragon-inspired artistic tapestry with ancient Indonesian mythological elements, legendary dragon spirits manifesting as flowing artistic forms with serpentine grace and ethereal beauty, ornate dragon scale patterns transformed into decorative art motifs with intricate golden filigree and jeweled textures, mythical dragon essence captured in traditional Indonesian artistic style with batik-inspired flowing patterns, ancient dragon legends visualized through artistic interpretation with ceremonial masks and totemic sculptures, dragon-inspired textile designs with elaborate patterns reminiscent of royal court artistry, mystical dragon energy flowing through artistic compositions like liquid gold and precious gems, traditional Indonesian dragon mythology brought to life through artistic mastery, ornate dragon motifs integrated into temple art and ceremonial decorations, artistic dragon forms dancing through compositions with supernatural elegance, dragon-inspired artistic elements with traditional Indonesian craftsmanship techniques, ceremonial dragon art with spiritual significance and cultural heritage, artistic interpretation of dragon legends through traditional Indonesian artistic mediums, dragon-themed decorative arts with intricate patterns and symbolic meanings, mystical dragon artistry with flowing organic forms and ethereal lighting effects, traditional Indonesian dragon-inspired art forms with cultural authenticity and artistic excellence, ornate dragon artistic compositions with ceremonial significance and spiritual power, dragon-inspired artistic heritage with traditional Indonesian aesthetic principles, artistic dragon elements integrated into cultural celebrations and ceremonial displays, hyperrealistic 8K artistic detail with dramatic lighting showing traditional Indonesian dragon-inspired artistry and cultural craftsmanship",
      dance:
        "Abstract mathematical choreography patterns with infinite algorithmic recursion, parametric equations describing graceful movement trajectories through three-dimensional space, mathematical visualization of rhythmic patterns and temporal sequences rendered in pure computational art style, algorithmic interpretation of synchronized movement creating geometric mandala formations, mathematical modeling of dance formations using coordinate geometry and spatial transformations, abstract computational art inspired by choreographic mathematics and movement algorithms, geometric visualization of musical rhythm patterns through mathematical wave functions and harmonic analysis, algorithmic dance patterns with fractal recursion and mathematical precision, mathematical interpretation of synchronized movement through matrix transformations and vector calculations, abstract geometric art inspired by dance choreography rendered through computational algorithms, mathematical visualization of movement flow using fluid dynamics equations and particle systems, algorithmic art style with dance-inspired mathematical complexity and geometric beauty, mathematical modeling of group choreography through network topology and graph theory, abstract computational visualization of rhythmic mathematics and temporal pattern analysis, geometric interpretation of dance movements using mathematical curves and surface modeling, algorithmic choreography patterns with infinite mathematical detail and recursive complexity, mathematical art inspired by movement dynamics and spatial geometry, computational visualization of dance mathematics through algorithmic pattern generation, abstract mathematical interpretation of synchronized movement and rhythmic sequences, geometric dance mathematics with algorithmic precision and mathematical beauty, mathematical choreography algorithms creating infinite pattern variations, computational art inspired by movement mathematics and geometric transformations, hyperrealistic 8K mathematical texture detail with dramatic algorithmic lighting showing pure computational dance mathematics and geometric artistry",
      volcanoes:
        "Mystical volcanic artistry with supernatural Indonesian fire spirits manifesting as ethereal beings of molten light and crystalline flame, ancient volcanic deities emerging from sacred crater temples with crowns of liquid gold and robes woven from volcanic glass threads, intricate lava flow patterns transformed into ornate decorative art motifs with filigree details in molten copper and bronze, volcanic energy visualized as flowing rivers of liquid starlight cascading down mountain slopes like celestial waterfalls, Ring of Fire archipelago rendered as cosmic mandala with each volcano a glowing jewel in divine geometric arrangement, sacred volcanic ash creating mystical atmospheric effects with particles of gold dust and silver mist swirling through dimensional portals, traditional Indonesian volcanic mythology brought to life through artistic interpretation with fire spirits dancing in ceremonial formations, volcanic landscapes transformed into surreal artistic compositions with crystalline lava formations and ethereal steam clouds, mystical volcanic temples carved from obsidian and volcanic glass with intricate relief sculptures telling stories of creation, volcanic fire spirits with flowing forms of molten energy and crowns of crystalline flame dancing through compositions, ancient Indonesian fire ceremonies visualized as artistic spectacles with offerings of gold and precious gems dissolving into volcanic energy, volcanic crater lakes transformed into mirrors of liquid mercury reflecting cosmic constellations and aurora-like phenomena, traditional Indonesian volcanic art forms with elaborate patterns inspired by lava flow dynamics and crystalline mineral formations, mystical volcanic energy flowing through artistic landscapes like rivers of liquid light and ethereal fire, volcanic mountain spirits manifesting as towering figures of molten rock and crystalline flame with ornate decorative elements, sacred volcanic rituals transformed into artistic ceremonies with fire spirits and elemental beings, volcanic landscapes rendered as fantastical artistic realms with floating islands of volcanic glass and cascading waterfalls of liquid light, traditional Indonesian volcanic craftsmanship with intricate metalwork inspired by volcanic minerals and crystalline formations, hyperrealistic 8K artistic detail with dramatic volcanic lighting effects, volumetric atmospheric rendering showing mystical volcanic artistry and supernatural fire spirit manifestations",
      temples:
        "Abstract mathematical temple architecture with infinite geometric recursion and sacred algorithmic patterns, multi-tiered mathematical structures ascending through dimensional space using golden ratio proportions and Fibonacci spiral staircases, intricate geometric relief carvings depicting mathematical equations and algorithmic sequences rendered in pure computational art style, ceremonial mathematical gates adorned with fractal guardian patterns and geometric protective algorithms, lotus pond reflections creating perfect mathematical mirror symmetries and infinite recursive reflections, algorithmic incense patterns rising as mathematical smoke functions carrying computational prayers through dimensional portals, devotional mathematical ceremonies with geometric participants performing algorithmic rituals and mathematical offerings, tropical mathematical flowers arranged in geometric patterns following mathematical sequences and algorithmic arrangements, ancient mathematical architecture blending harmoniously with natural algorithmic landscapes of computational mountains and fractal terraces, spiritual mathematical sanctuary of profound geometric beauty where algorithmic dharma principles thrive, mathematical temple complex with towering algorithmic spires dedicated to geometric trinity of mathematical constants, elaborate mathematical relief carvings telling algorithmic stories animated by computational temple flames, traditional mathematical architecture with geometric brick and algorithmic stone construction following sacred mathematical proportions, temple mathematical festivals with thousands of geometric devotees in algorithmic traditional patterns, gamelan mathematical orchestras playing sacred algorithmic music that resonates through computational temple courtyards, holy mathematical water ceremonies where algorithmic priests bless geometric devotees with computational sacred springs, temple mathematical dancers performing in algorithmic courtyards bringing geometric mythology to computational life, traditional mathematical offerings of geometric rice, algorithmic flowers, and computational incense arranged in beautiful mathematical patterns, UNESCO mathematical heritage sites preserving thousand-year-old algorithmic architectural masterpieces, spiritual mathematical energy radiating from ancient geometric stones blessed by centuries of algorithmic prayer and computational devotion, hyperrealistic 8K mathematical architectural visualization with dramatic algorithmic lighting, showing intricate geometric carving details and atmospheric computational temple ceremonies, volumetric algorithmic lighting through mathematical incense smoke creating mystical computational ambiance",
    }

    if (scenarioPrompts[scenario]) {
      prompt += ", " + scenarioPrompts[scenario]
    }
  }

  // Add color scheme
  const colorPrompts: Record<string, string> = {
    plasma: "vibrant plasma colors, electric blues and magentas",
    quantum: "quantum field colors, deep blues and ethereal whites",
    cosmic: "cosmic colors, deep space purples and stellar golds",
    thermal: "thermal imaging colors, heat signature reds and oranges",
    spectral: "full spectrum rainbow colors, prismatic light effects",
    crystalline: "crystalline colors, clear gems and mineral tones",
    bioluminescent: "bioluminescent colors, glowing organic blues and greens",
    aurora: "aurora borealis colors, dancing green and purple lights",
    metallic: "metallic tones, silver and bronze accents",
    prismatic: "prismatic light effects, rainbow refractions",
    monochromatic: "monochromatic grayscale, black and white tones",
    infrared: "infrared heat colors, thermal reds and oranges",
    lava: "molten lava colors, glowing reds and oranges",
    futuristic: "futuristic neon colors, cyberpunk aesthetics",
    forest: "forest greens and earth tones",
    ocean: "ocean blues and aqua tones",
    sunset: "warm sunset colors, oranges and deep reds",
    arctic: "arctic colors, ice blues and pristine whites",
    neon: "bright neon colors, electric pinks and greens",
    vintage: "vintage sepia tones, aged photograph aesthetics",
    toxic: "toxic waste colors, radioactive greens and yellows",
    ember: "glowing ember colors, warm orange and red coals",
    lunar: "lunar surface colors, silver grays and crater shadows",
    tidal: "tidal pool colors, ocean blues and sandy browns",
  }

  prompt += `, ${colorPrompts[colorScheme] || "vibrant colors"}`

  // Add artistic quality descriptors
  prompt +=
    ", highly detailed, artistic masterpiece, professional photography quality, 8K resolution, stunning visual composition"

  return prompt
}

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
      cosmic: {
        name: "Deep Space",
        description: "Cosmic mathematical patterns with stellar formations and celestial structures",
        keywords: [
          "cosmic patterns",
          "stellar formations",
          "celestial structures",
          "space geometry",
          "astronomical beauty",
          "cosmic harmony",
          "stellar mathematics",
          "galactic patterns",
          "nebula formations",
          "cosmic fractals",
        ],
      },
      underwater: {
        name: "Ocean Depths",
        description: "Fluid mathematical dynamics with oceanic patterns and marine geometries",
        keywords: [
          "fluid dynamics",
          "oceanic patterns",
          "marine geometries",
          "wave mathematics",
          "aquatic structures",
          "tidal patterns",
          "underwater fractals",
          "marine algorithms",
          "oceanic flows",
          "aquatic harmony",
        ],
      },
      crystalline: {
        name: "Crystal Caverns",
        description: "Crystalline mathematical structures with geometric precision and mineral patterns",
        keywords: [
          "crystalline structures",
          "geometric precision",
          "mineral patterns",
          "crystal mathematics",
          "lattice formations",
          "prismatic geometry",
          "crystal fractals",
          "mineral algorithms",
          "crystalline harmony",
          "geometric crystals",
        ],
      },
      forest: {
        name: "Enchanted Forest",
        description: "Organic mathematical patterns with natural geometries and botanical structures",
        keywords: [
          "organic patterns",
          "natural geometries",
          "botanical structures",
          "forest mathematics",
          "tree algorithms",
          "leaf patterns",
          "organic fractals",
          "natural harmony",
          "botanical geometry",
          "forest dynamics",
        ],
      },
      aurora: {
        name: "Aurora Skies",
        description: "Atmospheric mathematical phenomena with dancing patterns and celestial displays",
        keywords: [
          "atmospheric phenomena",
          "dancing patterns",
          "celestial displays",
          "aurora mathematics",
          "sky algorithms",
          "atmospheric fractals",
          "celestial harmony",
          "sky patterns",
          "aurora dynamics",
          "atmospheric beauty",
        ],
      },
      volcanic: {
        name: "Volcanic Landscape",
        description: "Volcanic mathematical patterns with molten flows and geological structures",
        keywords: [
          "volcanic patterns",
          "molten flows",
          "geological structures",
          "volcanic mathematics",
          "lava algorithms",
          "geological fractals",
          "volcanic harmony",
          "molten geometry",
          "geological patterns",
          "volcanic dynamics",
        ],
      },
    },
  },
  spirals: {
    name: "Cosmic Spirals",
    description: "Mathematical spiral patterns inspired by galaxies, nautilus shells, and golden ratio formations",
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
      cosmic: {
        name: "Deep Space",
        description: "Spiral galaxies and cosmic formations with stellar mathematical patterns",
        keywords: [
          "spiral galaxies",
          "cosmic formations",
          "stellar patterns",
          "galactic spirals",
          "cosmic mathematics",
          "astronomical spirals",
          "stellar geometry",
          "galactic harmony",
          "cosmic fractals",
          "space spirals",
        ],
      },
    },
  },
  fractal: {
    name: "Fractal Trees",
    description: "Self-similar mathematical structures with recursive patterns and infinite complexity",
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
      cosmic: {
        name: "Deep Space",
        description: "Fractal cosmic structures with recursive stellar formations",
        keywords: [
          "fractal structures",
          "recursive patterns",
          "stellar formations",
          "cosmic fractals",
          "mathematical trees",
          "recursive geometry",
          "fractal harmony",
          "cosmic recursion",
          "stellar fractals",
          "space trees",
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
    return `Create a magnificent ABSTRACT MATHEMATICAL DIGITAL ARTWORK with ${colorScheme} colors featuring intricate geometric patterns, mathematical precision, algorithmic beauty, fractal structures, flowing mathematical curves, parametric equations visualized, computational art aesthetics, and stunning mathematical complexity. Style: ultra-detailed mathematical art, abstract digital masterpiece, computational visualization, algorithmic beauty, geometric precision, mathematical harmony, breathtaking mathematical patterns.`
  }

  let basePrompt = ""

  // FORCE MATHEMATICAL/ABSTRACT ART STYLE - NO REALISTIC CONTENT
  const mathematicalPrefix = "Create a stunning ABSTRACT MATHEMATICAL DIGITAL ARTWORK inspired by"

  // If custom prompt is provided, integrate it with mathematical context
  if (customPrompt && customPrompt.trim()) {
    const sanitizedCustom = sanitizePrompt(customPrompt.trim())
    basePrompt = `${mathematicalPrefix} ${sanitizedCustom}, transformed into pure mathematical art celebrating ${scenarioInfo.name}. This should be an ABSTRACT COMPUTATIONAL VISUALIZATION with geometric patterns, mathematical curves, and algorithmic beauty - NOT realistic imagery.`
  } else {
    // Generate comprehensive mathematical art prompt
    basePrompt = `${mathematicalPrefix} ${datasetInfo.name} and ${scenarioInfo.name}: ${scenarioInfo.description}. Transform this concept into PURE MATHEMATICAL ART with abstract geometric patterns, computational aesthetics, and algorithmic beauty - NO realistic elements, only mathematical visualization.`
  }

  // Add comprehensive mathematical art specifications
  const colorContext = {
    plasma:
      "vibrant plasma mathematical gradients with electric blues, purples, and magentas creating flowing mathematical curves and algorithmic patterns",
    quantum:
      "quantum field mathematical visualization with deep blues to bright whites, particle interaction patterns and wave function mathematics",
    cosmic:
      "cosmic mathematical patterns with deep space geometries, stellar mathematical formations and celestial algorithmic structures",
    thermal:
      "thermal mathematical spectrum visualization with heat equation patterns, gradient mathematics and energy distribution algorithms",
    spectral:
      "full spectral mathematical rainbow with smooth algorithmic transitions, prismatic mathematical effects and light dispersion mathematics",
    crystalline:
      "crystalline mathematical structures with geometric precision, mathematical lattices and algorithmic crystal formations",
    bioluminescent:
      "bioluminescent mathematical patterns with glowing algorithmic structures and organic mathematical geometries",
    aurora:
      "aurora mathematical visualization with dancing algorithmic patterns, atmospheric mathematical phenomena and celestial computational art",
    metallic:
      "metallic mathematical surfaces with algorithmic reflections, geometric precision and mathematical material properties",
    prismatic:
      "prismatic mathematical patterns with rainbow algorithmic refractions and optical mathematical phenomena",
    monochromatic:
      "monochromatic mathematical gradients with sophisticated algorithmic tonal variations and geometric mathematical contrasts",
    infrared:
      "infrared mathematical heat visualization with thermal algorithmic patterns and energy mathematical distributions",
    lava: "molten mathematical patterns with flowing algorithmic structures and volcanic mathematical geometries",
    futuristic:
      "futuristic mathematical aesthetics with cyberpunk algorithmic patterns and sci-fi mathematical geometries",
    forest: "forest mathematical patterns with organic algorithmic structures and natural mathematical geometries",
    ocean: "ocean mathematical wave patterns with fluid algorithmic dynamics and marine mathematical structures",
    sunset: "sunset mathematical gradients with warm algorithmic transitions and golden mathematical harmonies",
    arctic:
      "arctic mathematical crystalline patterns with ice algorithmic structures and frozen mathematical geometries",
    neon: "neon mathematical patterns with electric algorithmic glows and vibrant mathematical energy fields",
    vintage: "vintage mathematical aesthetics with nostalgic algorithmic patterns and timeless mathematical elegance",
    toxic: "toxic mathematical patterns with acid algorithmic structures and intense mathematical energy fields",
    ember: "ember mathematical patterns with glowing algorithmic structures and fire mathematical dynamics",
    lunar: "lunar mathematical patterns with celestial algorithmic structures and otherworldly mathematical beauty",
    tidal: "tidal mathematical wave patterns with oceanic algorithmic movements and marine mathematical energy",
  }

  const colorDescription =
    colorContext[colorScheme as keyof typeof colorContext] ||
    `magnificent ${colorScheme} mathematical color palette with algorithmic variations and computational harmony`

  // Combine elements with STRONG mathematical focus
  let fullPrompt = `${basePrompt}

MATHEMATICAL ART SPECIFICATIONS: This must be PURE ABSTRACT MATHEMATICAL ART rendered in ${colorDescription}. NO realistic imagery, NO photographic elements, NO literal representations - ONLY mathematical visualization, geometric patterns, algorithmic beauty, and computational art aesthetics.

VISUAL STYLE: Abstract mathematical digital art with computational precision, algorithmic beauty, geometric harmony, mathematical curves, parametric equations, fractal structures, flowing mathematical patterns, and sophisticated mathematical visualization techniques.

MATHEMATICAL ELEMENTS:`

  // Add scenario-specific mathematical keywords
  if (scenarioInfo.keywords && scenarioInfo.keywords.length > 0) {
    const mathematicalKeywords = scenarioInfo.keywords
      .filter((keyword) => !containsProblematicContent(keyword))
      .map((keyword) => `mathematical interpretation of ${keyword}`)
      .slice(0, 6)

    if (mathematicalKeywords.length > 0) {
      fullPrompt += ` ${mathematicalKeywords.join(", ")} - all transformed into abstract mathematical patterns and geometric visualizations.`
    }
  }

  // Add STRONG mathematical art specifications
  fullPrompt += `

COMPUTATIONAL ART REQUIREMENTS:
- ABSTRACT MATHEMATICAL VISUALIZATION ONLY - no realistic imagery
- Geometric patterns with mathematical precision and algorithmic beauty
- Flowing mathematical curves, parametric equations, and computational aesthetics
- Fractal structures, recursive patterns, and mathematical self-similarity
- Algorithmic color distributions with mathematical harmony
- Computational art techniques with digital mathematical precision
- Abstract geometric compositions with mathematical relationships
- Mathematical pattern generation with algorithmic complexity
- Pure mathematical beauty without realistic elements
- Computational visualization of mathematical concepts
- Algorithmic art generation with mathematical foundations
- Abstract mathematical interpretation of cultural concepts

ARTISTIC EXECUTION:
- Museum-quality abstract mathematical art with computational precision
- Sophisticated mathematical visualization techniques
- Perfect algorithmic balance and mathematical composition
- Advanced computational art methods with mathematical foundations
- Mathematical color theory with algorithmic precision
- Abstract geometric harmony with mathematical relationships
- Computational creativity with mathematical beauty
- Digital mathematical art with algorithmic sophistication
- Pure mathematical aesthetics without realistic elements
- Advanced mathematical visualization with computational excellence

FINAL MATHEMATICAL VISION: A breathtaking ABSTRACT MATHEMATICAL DIGITAL ARTWORK that captures the mathematical essence of ${datasetInfo.name} through pure computational art, geometric patterns, algorithmic beauty, and mathematical visualization - completely abstract with NO realistic elements, only mathematical art perfection.`

  return sanitizePrompt(fullPrompt)
}

// Sanitize prompt to avoid content policy violations while preserving richness
function sanitizePrompt(prompt: string): string {
  // Remove potentially problematic words/phrases but keep mathematical descriptions
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
    "terrifying",
    "scary",
    "frightening",
    "evil",
    "demon",
    "devil",
    "haunted",
    "cursed",
    "dark magic",
    "witch",
    "sorcery",
    "black magic",
  ]

  let sanitized = prompt

  problematicTerms.forEach((term) => {
    const regex = new RegExp(term, "gi")
    sanitized = sanitized.replace(regex, "mathematical pattern")
  })

  // Replace with mathematical alternatives while maintaining descriptive richness
  sanitized = sanitized
    .replace(/horror/gi, "mathematical complexity")
    .replace(/terrifying/gi, "mathematically awe-inspiring")
    .replace(/scary/gi, "mathematically mysterious")
    .replace(/frightening/gi, "mathematically captivating")
    .replace(/evil/gi, "mathematically complex")
    .replace(/demon/gi, "mathematical entity")
    .replace(/devil/gi, "mathematical structure")
    .replace(/ghost/gi, "mathematical pattern")
    .replace(/spirit/gi, "mathematical essence")
    .replace(/supernatural/gi, "mathematically transcendent")
    .replace(/haunted/gi, "mathematically enchanted")
    .replace(/cursed/gi, "mathematically blessed")
    .replace(/dark magic/gi, "mathematical algorithms")
    .replace(/witch/gi, "mathematical practitioner")
    .replace(/sorcery/gi, "mathematical computation")
    .replace(/black magic/gi, "advanced mathematics")
    .replace(/warrior/gi, "mathematical guardian")
    .replace(/battle/gi, "mathematical interaction")
    .replace(/warfare/gi, "mathematical dynamics")
    .replace(/tribal/gi, "mathematical community")
    .replace(/primitive/gi, "fundamentally mathematical")
    .replace(/savage/gi, "mathematically wild")
    .replace(/barbaric/gi, "mathematically powerful")

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
    "horror",
    "terrifying",
    "scary",
    "evil",
    "demon",
    "ghost",
  ]

  return problematicTerms.some((term) => text.toLowerCase().includes(term.toLowerCase()))
}

// Generate dome-specific prompt with rich mathematical details for planetarium dome
function generateDomePromptOriginal(basePrompt: string, additionalParams: any): string {
  const { domeDiameter = 20, domeResolution, projectionType } = additionalParams

  return `IMMERSIVE PLANETARIUM DOME MATHEMATICAL ART WITH DRAMATIC TUNNEL EFFECT: Transform this extraordinary ABSTRACT MATHEMATICAL ARTWORK for breathtaking ${domeDiameter}m diameter planetarium dome display with stunning fisheye tunnel projection effect.

DOME TUNNEL EFFECT SPECIFICATIONS FOR ${domeDiameter}M DOME:
- DRAMATIC FISHEYE TUNNEL EFFECT with mathematical precision optimized for ${domeDiameter}-meter dome projection
- POWERFUL CENTRAL FOCAL POINT creating tunnel illusion that draws viewers into mathematical depths
- RADIAL MATHEMATICAL PATTERNS flowing outward from center in perfect circular symmetry
- TUNNEL PERSPECTIVE DISTORTION with algorithmic precision creating immersive depth experience
- CIRCULAR FISHEYE COMPOSITION optimized for overhead dome viewing from center position
- SEAMLESS EDGE BLENDING with mathematical precision for perfect ${domeDiameter}m dome wraparound
- DRAMATIC DEPTH ILLUSION using mathematical perspective and algorithmic distortion
- TUNNEL VORTEX EFFECT with mathematical curves spiraling toward central vanishing point
- FISHEYE PROJECTION MAPPING with computational precision for professional planetarium systems
- LITTLE PLANET EFFECT option with stereographic mathematical projection creating curved world illusion
- OVERHEAD VIEWING OPTIMIZATION ensuring perfect visual experience when looking up at ${domeDiameter}m dome ceiling

MATHEMATICAL TUNNEL ARTISTIC VISION:
${basePrompt}

DOME TUNNEL TRANSFORMATION REQUIREMENTS:
Transform this magnificent mathematical concept into a dramatic TUNNEL EFFECT specifically for ${domeDiameter}-meter planetarium dome projection. The composition must feature a powerful central mathematical focal point with all algorithmic elements radiating outward in perfect radial symmetry, creating an absolutely breathtaking tunnel illusion when projected overhead on the ${domeDiameter}m dome ceiling. 

TUNNEL EFFECT SPECIFICATIONS:
- Central vanishing point with mathematical precision drawing viewers into algorithmic depths
- Radial mathematical flow patterns creating tunnel perspective illusion
- Fisheye distortion with computational accuracy for seamless dome projection
- Circular composition boundary perfectly fitted for dome projection systems
- Mathematical tunnel vortex with algorithmic spiral patterns
- Dramatic perspective depth using mathematical curves and geometric progression
- Seamless circular edge blending for perfect dome environment immersion

FINAL DOME TUNNEL VISION: Create a breathtaking ABSTRACT MATHEMATICAL TUNNEL ARTWORK that completely transforms the ${domeDiameter}m dome into an immersive mathematical vortex, with dramatic fisheye tunnel effects, radial mathematical patterns, and algorithmic depth illusion - all rendered as PURE ABSTRACT MATHEMATICAL ART with tunnel projection optimization.`
}

// Generate 360° panorama-specific prompt with rich mathematical details
function generatePanoramaPromptOriginal(basePrompt: string, additionalParams: any): string {
  const { panoramaResolution, panoramaFormat, stereographicPerspective } = additionalParams

  let panoramaPrompt = `IMMERSIVE 360° PANORAMIC MATHEMATICAL ARTWORK: Transform this extraordinary ABSTRACT MATHEMATICAL ART for breathtaking ${panoramaResolution} resolution 360° mathematical viewing experience in professional ${panoramaFormat} format.

360° PANORAMIC MATHEMATICAL ART REQUIREMENTS:
- PURE ABSTRACT MATHEMATICAL VISUALIZATION with seamless wraparound mathematical composition
- Seamless mathematical wraparound with absolutely no visible seams in algorithmic patterns
- Optimal horizontal mathematical aspect ratio specifically designed for 360° mathematical viewing
- Strategic mathematical pattern distribution across the complete 360° algorithmic viewing sphere
- Perfect mathematical horizon placement optimized for VR and 360° mathematical environment compatibility
- Flawless smooth mathematical transitions at wraparound edges with computational precision
- Enhanced mathematical detail density optimized for immersive algorithmic viewing experiences
- Natural mathematical composition flow that works beautifully around the full circular mathematical view
- Professional VR mathematical compatibility with industry-standard 360° algorithmic formats

MATHEMATICAL ARTISTIC VISION FOR 360° EXPERIENCE:
${basePrompt}

360° MATHEMATICAL TRANSFORMATION SPECIFICATIONS:
Transform this magnificent mathematical concept specifically for 360° panoramic viewing, ensuring the mathematical composition flows naturally and beautifully around the full circular view, creating an absolutely immersive mathematical experience when viewed in VR or 360° environments. Every mathematical element should be positioned with algorithmic precision to create a seamless, breathtaking panoramic mathematical experience that surrounds viewers in computational artistic beauty - all rendered as PURE ABSTRACT MATHEMATICAL ART.`

  if (panoramaFormat === "stereographic" && stereographicPerspective) {
    panoramaPrompt += `

ADVANCED STEREOGRAPHIC MATHEMATICAL PROJECTION:
Apply sophisticated ${stereographicPerspective} stereographic mathematical projection for unique and captivating mathematical visual perspective. This creates a distinctive curved mathematical world effect that transforms the flat mathematical artwork into an immersive spherical mathematical experience with dramatic algorithmic perspective distortion, computational precision, and mathematical beauty that showcases the power of advanced mathematical projection techniques - all as PURE ABSTRACT MATHEMATICAL ART.`
  }

  return sanitizePrompt(panoramaPrompt)
}

// Call OpenAI API with retry logic and better error handling
async function callOpenAIOriginal(prompt: string, retries = 2): Promise<string> {
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

export async function POSTOriginal(request: NextRequest) {
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
      domeDiameter = 20, // Default to 20 meters
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
      domeDiameter,
      panoramic360,
    })

    // Generate comprehensive AI art prompt
    const mainPrompt = generateComprehensiveAIPrompt(dataset, scenario, colorScheme, customPrompt)
    console.log("Generated comprehensive main prompt:", mainPrompt.substring(0, 200) + "...")
    console.log(`Full prompt length: ${mainPrompt.length} characters`)

    // ALWAYS generate all three versions for complete immersive experience
    const generationDetails: any = {
      mainImage: "Generating...",
      domeImage: "Generating...",
      panoramaImage: "Generating...",
    }

    // Generate main image
    console.log("🎨 Generating main artwork...")
    const mainImageUrl = await callOpenAIOriginal(mainPrompt)
    generationDetails.mainImage = "Generated successfully"
    console.log("✅ Main artwork generated successfully")

    // ALWAYS generate dome projection for complete set
    console.log(`🏛️ Generating ${domeDiameter}m dome projection with tunnel effect...`)
    let domeImageUrl: string
    try {
      const domePrompt = generateDomePromptOriginal(mainPrompt, {
        domeDiameter,
        domeResolution,
        projectionType,
      })

      console.log("Generated dome prompt:", domePrompt.substring(0, 200) + "...")
      console.log(`Dome prompt length: ${domePrompt.length} characters`)
      domeImageUrl = await callOpenAIOriginal(domePrompt)
      generationDetails.domeImage = "Generated successfully"
      console.log(`✅ ${domeDiameter}m dome projection generated successfully`)
    } catch (error: any) {
      console.error(`❌ ${domeDiameter}m dome projection generation failed:`, error)

      // Try generating a simpler dome version as fallback
      try {
        console.log("🔄 Attempting simplified dome generation...")
        const simpleDomePrompt = `Create a stunning ABSTRACT MATHEMATICAL DIGITAL ARTWORK optimized for planetarium dome projection with dramatic fisheye tunnel effect. Features: central focal point, radial mathematical patterns flowing outward, tunnel perspective distortion, seamless circular composition perfect for overhead dome viewing, dramatic depth illusion with mathematical precision. Style: abstract computational art, geometric patterns, algorithmic beauty, mathematical visualization, fisheye projection mapping, tunnel effect optimization.`

        domeImageUrl = await callOpenAIOriginal(simpleDomePrompt)
        generationDetails.domeImage = "Generated with simplified prompt"
        console.log("✅ Simplified dome version generated successfully")
      } catch (fallbackError: any) {
        console.error("❌ Simplified dome generation also failed:", fallbackError)
        domeImageUrl = mainImageUrl
        generationDetails.domeImage = "Using main image as final fallback"
        console.log("🔄 Using main image as dome fallback")
      }
    }

    // ALWAYS generate 360° panorama for complete set
    console.log("🌐 Generating 360° panorama...")
    let panoramaImageUrl: string
    try {
      const panoramaPrompt = generatePanoramaPromptOriginal(mainPrompt, {
        panoramaResolution,
        panoramaFormat,
        stereographicPerspective,
      })

      console.log("Generated panorama prompt:", panoramaPrompt.substring(0, 200) + "...")
      console.log(`Panorama prompt length: ${panoramaPrompt.length} characters`)
      panoramaImageUrl = await callOpenAIOriginal(panoramaPrompt)
      generationDetails.panoramaImage = "Generated successfully"
      console.log("✅ 360° panorama generated successfully")
    } catch (error: any) {
      console.error("❌ 360° panorama generation failed:", error)

      // Try generating a simpler 360° version as fallback
      try {
        console.log("🔄 Attempting simplified 360° generation...")
        const simple360Prompt = `Create a stunning ABSTRACT MATHEMATICAL DIGITAL ARTWORK optimized for 360° panoramic viewing. Features: seamless wraparound mathematical composition, horizontal flow perfect for VR viewing, continuous mathematical patterns with no visible seams, equirectangular format optimization. Style: abstract computational art, geometric patterns, algorithmic beauty, mathematical visualization, 360° panoramic composition, seamless wraparound design.`

        panoramaImageUrl = await callOpenAIOriginal(simple360Prompt)
        generationDetails.panoramaImage = "Generated with simplified prompt"
        console.log("✅ Simplified 360° version generated successfully")
      } catch (fallbackError: any) {
        console.error("❌ Simplified 360° generation also failed:", fallbackError)
        panoramaImageUrl = mainImageUrl
        generationDetails.panoramaImage = "Using main image as final fallback"
        console.log("🔄 Using main image as 360° fallback")
      }
    }

    // Prepare response with ALL THREE versions
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
        domeProjection: true, // Always true since we generate all versions
        domeDiameter,
        domeResolution,
        projectionType,
        panoramic360: true, // Always true since we generate all versions
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
    console.log(`- Dome diameter: ${domeDiameter}m`)

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("🎨 AI Art API called with body:", JSON.stringify(body, null, 2))

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
      domeDiameter = 20, // Apply default dome diameter
      domeResolution = "8K", // Apply highest resolution
      projectionType = "fisheye",
      panoramaResolution = "16K", // Apply highest resolution
      panoramaFormat = "equirectangular",
      stereographicPerspective,
    } = body

    // Build the main prompt
    const mainPrompt = buildPrompt(dataset, scenario, colorScheme, customPrompt)
    console.log("📝 Generated main prompt:", mainPrompt.substring(0, 200) + "...")
    console.log("📏 Prompt length:", mainPrompt.length, "characters")

    let mainImageUrl: string
    let domeImageUrl: string
    let panoramaImageUrl: string
    const generationDetails: any = {}

    try {
      console.log("🖼️ Generating main image...")
      mainImageUrl = await callOpenAI(mainPrompt)
      generationDetails.mainImage = "Generated successfully"
      console.log("✅ Main image generated successfully")
    } catch (error: any) {
      console.error("❌ Main image generation failed:", error.message)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate main image: " + error.message,
          promptLength: mainPrompt.length,
          promptPreview: mainPrompt.substring(0, 200) + "...",
        },
        { status: 500 },
      )
    }

    // ALWAYS generate dome projection for complete set with TUNNEL UP effect
    console.log(`🏛️ Generating ${domeDiameter}m dome projection with TUNNEL UP effect...`)
    generationDetails.domeImage = "Generating..."
    try {
      const domePrompt = generateDomePrompt(mainPrompt, domeDiameter, domeResolution, projectionType)
      console.log("📝 Generated dome TUNNEL UP prompt:", domePrompt.substring(0, 200) + "...")
      domeImageUrl = await callOpenAI(domePrompt)
      generationDetails.domeImage = "Generated successfully with TUNNEL UP effect"
      console.log(`✅ ${domeDiameter}m dome TUNNEL UP projection generated successfully`)
    } catch (error: any) {
      console.error(`❌ ${domeDiameter}m dome TUNNEL UP projection generation failed:`, error.message)
      domeImageUrl = mainImageUrl // Use main image as fallback
      generationDetails.domeImage = `Fallback used: ${error.message}`
    }

    // ALWAYS generate 360° panorama for complete set
    console.log("🌐 Generating 360° panorama...")
    generationDetails.panoramaImage = "Generating..."
    try {
      const panoramaPrompt = generatePanoramaPrompt(
        mainPrompt,
        panoramaResolution,
        panoramaFormat,
        stereographicPerspective,
      )
      console.log("📝 Generated panorama prompt:", panoramaPrompt.substring(0, 200) + "...")
      panoramaImageUrl = await callOpenAI(panoramaPrompt)
      generationDetails.panoramaImage = "Generated successfully"
      console.log("✅ 360° panorama generated successfully")
    } catch (error: any) {
      console.error("❌ 360° panorama generation failed:", error.message)
      panoramaImageUrl = mainImageUrl // Use main image as fallback
      generationDetails.panoramaImage = `Fallback used: ${error.message}`
    }

    // Prepare response with ALL THREE versions
    const response = {
      success: true,
      image: mainImageUrl,
      domeImage: domeImageUrl || mainImageUrl, // Always provide dome image with TUNNEL UP
      panoramaImage: panoramaImageUrl || mainImageUrl, // Always provide panorama image
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
        domeProjection: true, // Always true since we generate all versions
        domeDiameter: 20, // Apply default dome diameter
        domeResolution: "8K", // Apply highest resolution
        projectionType: "fisheye",
        panoramic360: true, // Always true since we generate all versions
        panoramaResolution: "16K", // Apply highest resolution
        panoramaFormat: "equirectangular",
        stereographicPerspective,
      },
    }

    console.log("✅ Returning successful response with all three images including TUNNEL UP dome effect")
    return NextResponse.json(response)
  } catch (error: any) {
    console.error("❌ AI Art generation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate AI art",
        details: error.stack,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
