// Enhanced AI Prompt Generation System with Godlevel Quality
// Optimized for 1400 base characters with room for ChatGPT enhancement up to 4000 total

export interface PromptParams {
  dataset: string
  scenario: string
  colorScheme: string
  seed: number
  numSamples: number
  noiseScale: number
  customPrompt?: string
  panoramic360?: boolean
  panoramaFormat?: "equirectangular" | "stereographic"
  projectionType?: "fisheye" | "tunnel-up" | "tunnel-down" | "little-planet"
}

// Cultural datasets with detailed scenarios
export const CULTURAL_DATASETS = {
  vietnamese: {
    name: "🇻🇳 Vietnamese Heritage",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description:
          "Pure mathematical visualization without cultural elements, focusing on algorithmic beauty and mathematical patterns.",
      },
      "trung-sisters": {
        name: "⚔️ Hai Bà Trưng - Trung Sisters",
        description:
          "Legendary Vietnamese heroines Hai Bà Trưng (Trung Sisters), ancient warriors who led rebellion against Chinese rule in 40 AD, riding war elephants, traditional Vietnamese armor, heroic legends, national independence symbols, ancient Vietnamese military traditions, cultural heroes, patriotic spirit, historical valor, bronze weapons, traditional Vietnamese battle formations, ancient citadels, heroic sacrifice for freedom.",
      },
      "temple-of-literature": {
        name: "🏛️ Temple of Literature - First University",
        description:
          "Vietnam's first university (1070 AD), dedicated to Confucius and literature. Traditional Vietnamese architecture with ancient courtyards, red-tiled roofs, ornate gates, stone stelae of doctorate holders, peaceful gardens with lotus ponds, ancient trees, traditional lanterns, and scholarly atmosphere. Confucian educational heritage with traditional Vietnamese academic traditions.",
      },
      "jade-emperor-pagoda": {
        name: "🏮 Jade Emperor Pagoda - Taoist Temple",
        description:
          "Mystical Taoist temple dedicated to the Jade Emperor, filled with incense smoke, intricate wood carvings, statues of deities and spirits, dark atmospheric interior, flickering candles, ornate altars, traditional Vietnamese religious architecture, spiritual ambiance. Ancient Taoist traditions merged with Vietnamese folk beliefs.",
      },
      "imperial-city-hue": {
        name: "👑 Imperial City Hue - Royal Palace",
        description:
          "Former imperial capital with magnificent royal palaces, traditional Vietnamese imperial architecture, ornate dragon decorations, royal gardens, ancient gates, traditional courtyards, imperial colors of gold and red, majestic throne halls, historical grandeur. Nguyen Dynasty royal heritage with traditional Vietnamese imperial ceremonies.",
      },
      "halong-bay": {
        name: "🏔️ Ha Long Bay - Limestone Karsts",
        description:
          "UNESCO World Heritage site with thousands of limestone karsts rising from emerald waters, traditional Vietnamese junk boats with distinctive sails, misty seascape, dramatic rock formations, caves and grottoes, serene waters, mystical atmosphere. Legendary dragon mythology and natural wonder of Vietnam.",
      },
      "sapa-terraces": {
        name: "🌾 Sapa Rice Terraces - Mountain Agriculture",
        description:
          "Spectacular terraced rice fields carved into mountain slopes, traditional Vietnamese agricultural landscape, ethnic minority villages, misty mountains, golden rice during harvest season, traditional farming methods, rural Vietnamese life. Hmong and Dao ethnic minority cultural heritage.",
      },
      "mekong-delta": {
        name: "🌊 Mekong Delta - River Life",
        description:
          "Vast river delta with floating markets, traditional Vietnamese river boats, lush tropical vegetation, coconut palms, traditional stilt houses, river life, fishing nets, vibrant green landscape, peaceful waterways. Traditional Vietnamese river culture and agricultural abundance.",
      },
      "one-pillar-pagoda": {
        name: "🏛️ One Pillar Pagoda - Architectural Marvel",
        description:
          "Iconic One Pillar Pagoda in Hanoi, unique architectural design rising from lotus pond, traditional Vietnamese Buddhist architecture, spiritual symbolism, ancient craftsmanship, peaceful temple grounds, lotus flowers, traditional Vietnamese religious heritage.",
      },
      "hoi-an-ancient-town": {
        name: "🏮 Hoi An Ancient Town - Trading Port",
        description:
          "UNESCO World Heritage ancient trading port, traditional Vietnamese merchant houses, Japanese covered bridge, Chinese assembly halls, colorful lanterns, ancient streets, traditional architecture, cultural fusion, historical trading heritage.",
      },
      "my-son-sanctuary": {
        name: "🏛️ My Son Sanctuary - Cham Heritage",
        description:
          "Ancient Cham temple complex, Hindu-influenced architecture, red brick towers, intricate stone carvings, jungle setting, archaeological wonder, Cham cultural heritage, spiritual ruins, traditional Cham artistic elements.",
      },
      "cao-dai-temple": {
        name: "🏛️ Cao Dai Temple - Unique Religion",
        description:
          "Cao Dai temple with unique Vietnamese religious architecture, colorful decorations, divine eye symbol, traditional Vietnamese spiritual innovation, religious ceremonies, cultural synthesis, peaceful temple atmosphere.",
      },
      "water-puppet-theater": {
        name: "🎭 Water Puppet Theater - Folk Art",
        description:
          "Traditional Vietnamese water puppet performance, wooden puppets on water stage, folk stories and legends, traditional music, cultural entertainment, artistic heritage, village life stories, traditional Vietnamese performing arts.",
      },
      "vietnamese-pagoda": {
        name: "🏮 Traditional Vietnamese Pagoda",
        description:
          "Classic Vietnamese Buddhist pagoda with multi-tiered roofs, ornate decorations, peaceful courtyards, incense burning, traditional architecture, spiritual atmosphere, lotus ponds, ancient trees, Buddhist cultural heritage.",
      },
      "dong-ho-paintings": {
        name: "🎨 Dong Ho Folk Paintings",
        description:
          "Traditional Vietnamese folk paintings from Dong Ho village, woodblock printing, vibrant colors, cultural themes, traditional motifs, folk art heritage, rural Vietnamese artistic traditions, cultural storytelling through art.",
      },
      "vietnamese-silk-village": {
        name: "🧵 Traditional Silk Village",
        description:
          "Vietnamese silk weaving village, traditional looms, silk production process, artisan craftsmanship, cultural heritage, traditional textiles, rural Vietnamese life, silk farming, traditional Vietnamese clothing production.",
      },
      "tet-festival": {
        name: "🎊 Tet Festival - Lunar New Year",
        description:
          "Vietnamese Lunar New Year celebration, traditional decorations, peach blossoms, kumquat trees, family gatherings, cultural traditions, festive atmosphere, traditional Vietnamese New Year customs, ancestral worship.",
      },
      "vietnamese-coffee-culture": {
        name: "☕ Vietnamese Coffee Culture",
        description:
          "Traditional Vietnamese coffee culture, drip coffee preparation, street-side coffee shops, social gathering places, traditional brewing methods, cultural lifestyle, urban Vietnamese life, coffee plantation heritage.",
      },
      "floating-village": {
        name: "🏘️ Floating Village Life",
        description:
          "Traditional Vietnamese floating villages, houses on stilts, river community life, fishing boats, traditional lifestyle, water-based culture, sustainable living, Vietnamese river delta communities.",
      },
      "vietnamese-conical-hat": {
        name: "👒 Non La - Conical Hat Craft",
        description:
          "Traditional Vietnamese conical hat (non la) making, palm leaf weaving, traditional craftsmanship, cultural symbol, artisan skills, rural Vietnamese traditions, traditional headwear, cultural identity symbol.",
      },
      "bach-ma-temple": {
        name: "🏛️ Bach Ma Temple - White Horse",
        description:
          "Ancient Bach Ma Temple in Hanoi's Old Quarter, dedicated to the White Horse spirit, traditional Vietnamese folk religion, ancient architecture, cultural heritage, spiritual guardian of the city, traditional Vietnamese beliefs.",
      },
      "van-mieu-quoc-tu-giam": {
        name: "📚 Van Mieu Quoc Tu Giam - Imperial Academy",
        description:
          "Vietnam's first university and Confucian temple, traditional Vietnamese educational heritage, ancient learning traditions, scholarly atmosphere, Confucian architecture, cultural education center, academic excellence traditions.",
      },
    },
  },
  indonesian: {
    name: "🇮🇩 Indonesian Heritage",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description:
          "Pure mathematical visualization without cultural elements, focusing on algorithmic beauty and mathematical patterns.",
      },
      garuda: {
        name: "🦅 Garuda Wisnu Kencana",
        description:
          "Majestic Garuda, the divine eagle mount of Vishnu, with massive wings spread wide, golden feathers gleaming, carrying Lord Vishnu, traditional Indonesian Hindu-Buddhist art style, intricate details, spiritual power, cultural monument, Balinese artistic traditions, sacred symbolism.",
      },
      wayang: {
        name: "🎭 Wayang Kulit Shadow Puppets",
        description:
          "Traditional Indonesian shadow puppet theater, intricate leather puppets with elaborate details, dramatic shadows cast on screen, traditional gamelan music atmosphere, cultural storytelling, artistic silhouettes, Indonesian heritage, Javanese artistic traditions.",
      },
      batik: {
        name: "🎨 Batik Traditional Patterns",
        description:
          "Intricate Indonesian batik patterns with traditional motifs, wax-resist dyeing technique, geometric and floral designs, rich colors, cultural textile art, traditional Indonesian craftsmanship, detailed patterns, Javanese and Balinese styles.",
      },
      borobudur: {
        name: "🏛️ Borobudur Temple",
        description:
          "Ancient Buddhist temple with massive stone structure, intricate relief carvings, stupas, traditional Indonesian Buddhist architecture, spiritual atmosphere, historical monument, sunrise lighting, Central Java heritage.",
      },
      javanese: {
        name: "🎪 Javanese Culture",
        description:
          "Traditional Javanese cultural elements, batik patterns, gamelan instruments, traditional architecture, royal palaces, cultural ceremonies, Indonesian heritage, artistic traditions, court culture, traditional dances.",
      },
      sundanese: {
        name: "🎵 Sundanese Heritage",
        description:
          "West Javanese Sundanese culture, traditional music, angklung bamboo instruments, traditional houses, cultural dances, Indonesian regional heritage, artistic expressions, mountain culture, traditional crafts.",
      },
      batak: {
        name: "🏘️ Batak Traditions",
        description:
          "North Sumatran Batak culture, traditional houses with distinctive roofs, cultural ceremonies, traditional textiles, Indonesian tribal heritage, architectural elements, Lake Toba region, traditional music.",
      },
      dayak: {
        name: "🌿 Dayak Culture",
        description:
          "Bornean Dayak indigenous culture, traditional longhouses, cultural ceremonies, traditional crafts, Indonesian tribal art, forest heritage, cultural traditions, river communities, traditional tattoos.",
      },
      acehnese: {
        name: "🕌 Acehnese Heritage",
        description:
          "Acehnese Islamic culture, traditional architecture, cultural ceremonies, Indonesian regional heritage, Islamic artistic elements, traditional crafts, Sumatran culture, historical sultanate.",
      },
      minangkabau: {
        name: "🏠 Minangkabau Culture",
        description:
          "West Sumatran Minangkabau culture, distinctive traditional houses with horn-shaped roofs, cultural ceremonies, Indonesian matriarchal society, architectural heritage, traditional crafts, Padang culture.",
      },
      "balinese-tribe": {
        name: "🌺 Balinese Traditions",
        description:
          "Balinese Hindu culture, temple ceremonies, traditional dances, cultural festivals, Indonesian island heritage, spiritual traditions, artistic expressions, rice terraces, temple architecture.",
      },
      papuans: {
        name: "🪶 Papuan Heritage",
        description:
          "Papua indigenous culture, traditional ceremonies, cultural art, Indonesian tribal heritage, traditional crafts, cultural diversity, bird of paradise symbolism, traditional body art.",
      },
      baduy: {
        name: "🌱 Baduy Tribe",
        description:
          "Baduy indigenous people of West Java, traditional lifestyle, cultural preservation, Indonesian tribal heritage, traditional practices, cultural authenticity, sustainable living, traditional clothing.",
      },
      "orang-rimba": {
        name: "🌳 Orang Rimba Forest People",
        description:
          "Sumatran forest-dwelling people, traditional forest lifestyle, Indonesian indigenous culture, cultural preservation, traditional practices, jungle heritage, sustainable forest living.",
      },
      "hongana-manyawa": {
        name: "🏝️ Hongana Manyawa People",
        description:
          "Indigenous people of Halmahera, traditional culture, Indonesian tribal heritage, cultural preservation, traditional lifestyle, island culture, traditional fishing, forest traditions.",
      },
      asmat: {
        name: "🗿 Asmat Wood Carving Art",
        description:
          "Papuan Asmat wood carving traditions, intricate sculptures, cultural art, Indonesian tribal craftsmanship, traditional artistic expressions, ancestor worship, traditional masks, spiritual art.",
      },
      komodo: {
        name: "🐉 Komodo Dragon Legends",
        description:
          "Legendary Komodo dragons, Indonesian wildlife heritage, mythical creatures, cultural legends, natural heritage, traditional stories, island culture, conservation symbolism.",
      },
      dance: {
        name: "💃 Traditional Indonesian Dance",
        description:
          "Various traditional Indonesian dances, cultural performances, artistic expressions, Indonesian heritage, ceremonial dances, cultural celebrations, regional variations, traditional costumes.",
      },
      volcanoes: {
        name: "🌋 Indonesian Volcanic Landscapes",
        description:
          "Dramatic volcanic landscapes, Indonesian geological heritage, natural beauty, traditional relationship with volcanoes, cultural significance, Ring of Fire, traditional ceremonies, volcanic lakes.",
      },
      temples: {
        name: "🏛️ Sacred Indonesian Temples",
        description:
          "Various Indonesian temples, Hindu-Buddhist architecture, spiritual sites, cultural monuments, Indonesian religious heritage, traditional architecture, temple complexes, spiritual ceremonies.",
      },
    },
  },
  thailand: {
    name: "🇹🇭 Thailand - Gods & Ceremonies",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description:
          "Pure mathematical visualization without cultural elements, focusing on algorithmic beauty and mathematical patterns.",
      },
      garuda: {
        name: "🦅 Garuda - Divine Eagle",
        description:
          "Majestic Garuda, the divine eagle from Thai mythology, golden feathers, powerful wings, royal symbol of Thailand, traditional Thai art style, mythical creature, spiritual guardian, ornate details, Buddhist symbolism.",
      },
      naga: {
        name: "🐉 Naga - Serpent Dragon",
        description:
          "Powerful Naga serpent dragon from Thai Buddhist mythology, multiple heads, scales gleaming, guardian of temples, traditional Thai artistic style, mythical water deity, spiritual protector, temple decorations.",
      },
      erawan: {
        name: "🐘 Erawan - Three-Headed Elephant",
        description:
          "Erawan, the three-headed white elephant from Thai mythology, mount of Indra, majestic and powerful, traditional Thai artistic representation, mythical creature, spiritual significance, royal symbolism.",
      },
      karen: {
        name: "🏔️ Karen Hill Tribe",
        description:
          "Karen hill tribe people in traditional dress, mountainous landscape, traditional lifestyle, ethnic minority culture, handwoven textiles, traditional jewelry, cultural heritage of northern Thailand, long-neck traditions.",
      },
      hmong: {
        name: "🎭 Hmong Mountain People",
        description:
          "Hmong ethnic group in traditional colorful clothing, intricate embroidery, silver jewelry, mountain villages, traditional lifestyle, cultural ceremonies, northern Thailand heritage, traditional crafts.",
      },
      ayutthaya: {
        name: "🏛️ Ayutthaya Ancient Capital",
        description:
          "Ancient ruins of Ayutthaya, former capital of Siam, Buddhist temples, stone Buddha statues, historical architecture, UNESCO World Heritage site, Thai historical grandeur, ancient kingdom.",
      },
      sukhothai: {
        name: "🏺 Sukhothai Dawn Kingdom",
        description:
          "Sukhothai historical park, first Thai kingdom, ancient Buddhist temples, walking Buddha statues, lotus pond reflections, dawn of Thai civilization, peaceful historical atmosphere, traditional architecture.",
      },
      songkran: {
        name: "💦 Songkran Water Festival",
        description:
          "Thai New Year water festival, people celebrating with water, traditional ceremonies, temple visits, cultural celebration, joyful atmosphere, Thai cultural tradition, water blessings, festive spirit.",
      },
      "loy-krathong": {
        name: "🕯️ Loy Krathong Floating Lights",
        description:
          "Loy Krathong festival, floating krathongs on water, candles and incense, lotus-shaped boats, romantic evening atmosphere, Thai cultural celebration, spiritual offerings, traditional festival.",
      },
      coronation: {
        name: "👑 Royal Coronation Ceremony",
        description:
          "Thai royal coronation ceremony, elaborate golden regalia, traditional Thai royal dress, ornate throne, ceremonial atmosphere, Thai monarchy traditions, cultural grandeur, royal pageantry.",
      },
      "wat-pho": {
        name: "🧘 Wat Pho Reclining Buddha",
        description:
          "Wat Pho temple with massive golden reclining Buddha statue, 46 meters long, intricate mother-of-pearl inlay on feet, traditional Thai temple architecture, spiritual serenity, Bangkok landmark, Buddhist heritage.",
      },
      "wat-arun": {
        name: "🌅 Wat Arun Temple of Dawn",
        description:
          "Wat Arun temple at sunrise, towering spires decorated with colorful porcelain, Chao Phraya River, traditional Thai temple architecture, golden morning light, Bangkok icon, riverside temple.",
      },
      "muay-thai": {
        name: "🥊 Muay Thai Ancient Boxing",
        description:
          "Traditional Muay Thai boxing, fighters in traditional mongkol headbands, ancient martial art, cultural sport, training rituals, Thai fighting traditions, athletic prowess, traditional ceremonies.",
      },
      "classical-dance": {
        name: "💃 Thai Classical Dance",
        description:
          "Traditional Thai classical dance, elaborate costumes, graceful movements, cultural performance, ornate headdresses, artistic expression, Thai cultural heritage, royal court traditions.",
      },
      "golden-triangle": {
        name: "🌊 Golden Triangle Mekong",
        description:
          "Golden Triangle where Thailand, Laos, and Myanmar meet, Mekong River, mountainous landscape, cultural crossroads, traditional river life, Southeast Asian heritage, border region.",
      },
      "floating-markets": {
        name: "🛶 Traditional Floating Markets",
        description:
          "Thai floating markets, vendors in traditional boats, tropical fruits and vegetables, canal life, traditional commerce, cultural authenticity, vibrant market atmosphere, water-based trading.",
      },
    },
  },
  spirals: {
    name: "🌀 Spirals",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description:
          "Mathematical spiral patterns, Fibonacci sequences, golden ratio spirals, logarithmic spirals, Archimedean spirals, hyperbolic spirals, mathematical precision, geometric beauty.",
      },
    },
  },
  fractal: {
    name: "🔺 Fractal",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description:
          "Fractal geometry patterns, self-similar structures, infinite complexity, recursive patterns, mathematical fractals, geometric iterations, fractal dimensions, mathematical beauty.",
      },
    },
  },
  mandelbrot: {
    name: "🔢 Mandelbrot",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description:
          "Mandelbrot set visualizations, complex number iterations, fractal boundaries, mathematical complexity, infinite detail, chaotic dynamics, mathematical art, computational beauty.",
      },
    },
  },
  julia: {
    name: "🎭 Julia",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description:
          "Julia set fractals, complex dynamics, mathematical iterations, fractal art, chaotic attractors, mathematical beauty, computational geometry, infinite patterns.",
      },
    },
  },
  lorenz: {
    name: "🦋 Lorenz",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description:
          "Lorenz attractor patterns, chaos theory visualization, butterfly effect, strange attractors, dynamical systems, mathematical chaos, nonlinear dynamics, chaotic beauty.",
      },
    },
  },
  hyperbolic: {
    name: "🌐 Hyperbolic",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description:
          "Hyperbolic geometry patterns, non-Euclidean geometry, curved space visualizations, hyperbolic tessellations, mathematical geometry, geometric art, spatial mathematics.",
      },
    },
  },
  gaussian: {
    name: "📊 Gaussian",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description:
          "Gaussian distributions, statistical visualizations, probability curves, normal distributions, mathematical statistics, data visualization, statistical beauty, mathematical probability.",
      },
    },
  },
  cellular: {
    name: "🔬 Cellular",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description:
          "Cellular automata patterns, Conway's Game of Life, emergent behavior, computational patterns, rule-based systems, mathematical emergence, algorithmic art, computational beauty.",
      },
    },
  },
  voronoi: {
    name: "🕸️ Voronoi",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description:
          "Voronoi diagrams, spatial partitioning, geometric tessellations, proximity patterns, computational geometry, mathematical partitions, geometric art, spatial mathematics.",
      },
    },
  },
  perlin: {
    name: "🌊 Perlin",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description:
          "Perlin noise patterns, procedural generation, natural randomness, algorithmic textures, computational noise, mathematical randomness, procedural art, algorithmic beauty.",
      },
    },
  },
  diffusion: {
    name: "⚗️ Reaction-Diffusion",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description:
          "Reaction-diffusion systems, pattern formation, chemical patterns, Turing patterns, mathematical biology, emergent patterns, natural mathematics, biological computation.",
      },
    },
  },
  wave: {
    name: "〰️ Wave",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description:
          "Wave interference patterns, harmonic oscillations, wave equations, frequency visualizations, mathematical waves, acoustic patterns, wave mathematics, harmonic beauty.",
      },
    },
  },
  escher: {
    name: "🎨 Escher",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description:
          "M.C. Escher inspired mathematical art, impossible geometries, optical illusions, tessellations, infinite loops, architectural paradoxes, mathematical impossibilities, geometric art.",
      },
      "impossible-stairs": {
        name: "♾️ Impossible Staircases",
        description:
          "M.C. Escher inspired impossible staircases with paradoxical architecture, people walking up and down simultaneously, optical illusion with black and white geometric patterns, mind-bending perspective. Mathematical precision in impossible architectural structures with visual paradoxes.",
      },
      tessellations: {
        name: "🔷 Tessellation Patterns",
        description:
          "Intricate Escher-style tessellations with interlocking geometric shapes, mathematical precision, repeating patterns that transform seamlessly, artistic geometry with visual mathematics. Perfect tessellation symmetry with geometric precision and mathematical beauty.",
      },
      metamorphosis: {
        name: "🦋 Metamorphosis Sequences",
        description:
          "Escher metamorphosis transformation with objects gradually changing into other forms, seamless transitions between different shapes, artistic evolution with creative transformation sequences. Mathematical morphing with geometric continuity and artistic precision.",
      },
      "optical-illusions": {
        name: "👁️ Optical Illusions",
        description:
          "Mind-bending optical illusions in Escher style with impossible objects, visual paradoxes, mathematical impossibilities made visual, geometric illusions with professional artistic craftsmanship. Perspective tricks and mathematical visual illusions.",
      },
    },
  },
  "8bit": {
    name: "🎮 8bit",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description:
          "8-bit pixel art patterns, retro gaming aesthetics, pixelated mathematical visualizations, digital art, computational graphics, nostalgic computing, pixel mathematics, digital beauty.",
      },
    },
  },
  bosch: {
    name: "🖼️ Bosch",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description:
          "Hieronymus Bosch inspired surreal mathematical art, fantastical creatures, surreal landscapes, medieval artistic style, imaginative mathematics, artistic surrealism, mathematical fantasy.",
      },
    },
  },
} as const

// Color schemes with professional descriptions
export const COLOR_SCHEMES = {
  plasma: "vibrant plasma colors with electric blues, magentas, and cyans",
  quantum: "quantum field colors with particle physics inspired hues",
  cosmic: "cosmic nebula colors with deep purples, blues, and stellar whites",
  thermal: "thermal imaging colors from cool blues to hot reds and whites",
  spectral: "full electromagnetic spectrum from infrared to ultraviolet",
  crystalline: "crystal formation colors with prismatic refractions",
  bioluminescent: "bioluminescent colors like deep sea creatures",
  aurora: "aurora borealis colors with greens, purples, and blues",
  metallic: "metallic colors with gold, silver, copper, and bronze",
  prismatic: "prismatic light dispersion with rainbow spectrums",
  monochromatic: "single hue variations from light to dark",
  infrared: "infrared heat signature colors",
  lava: "volcanic lava colors with reds, oranges, and blacks",
  futuristic: "futuristic neon colors with electric accents",
  forest: "forest colors with greens, browns, and earth tones",
  ocean: "ocean depths colors with blues, teals, and aquas",
  sunset: "sunset colors with oranges, pinks, and purples",
  arctic: "arctic colors with whites, blues, and ice tones",
  neon: "bright neon colors with electric intensity",
  vintage: "vintage sepia and aged colors",
  toxic: "toxic waste colors with sickly greens and yellows",
  ember: "glowing ember colors with reds and oranges",
  lunar: "lunar surface colors with grays and whites",
  tidal: "tidal pool colors with blues, greens, and sandy tones",
} as const

// Build comprehensive prompt for AI generation with GODLEVEL quality - OPTIMIZED FOR 4000 CHAR LIMIT
export function buildPrompt(params: {
  dataset: string
  scenario?: string
  colorScheme: string
  seed?: number
  numSamples?: number
  noiseScale?: number
  customPrompt?: string
  panoramic360?: boolean
  panoramaFormat?: string
  projectionType?: string
}) {
  try {
    // If custom prompt is provided, use it
    if (params.customPrompt && params.customPrompt.trim()) {
      return params.customPrompt.trim()
    }

    let basePrompt = "GODLEVEL MASTERPIECE: "
    let scenarioDescription = ""

    // Get scenario description based on dataset
    if (
      params.dataset === "vietnamese" &&
      params.scenario &&
      CULTURAL_DATASETS.vietnamese.scenarios[params.scenario as keyof typeof CULTURAL_DATASETS.vietnamese.scenarios]
    ) {
      const scenario =
        CULTURAL_DATASETS.vietnamese.scenarios[params.scenario as keyof typeof CULTURAL_DATASETS.vietnamese.scenarios]
      scenarioDescription = scenario.description
      basePrompt += `${scenarioDescription}, `
    } else if (
      params.dataset === "indonesian" &&
      params.scenario &&
      CULTURAL_DATASETS.indonesian.scenarios[params.scenario as keyof typeof CULTURAL_DATASETS.indonesian.scenarios]
    ) {
      const scenario =
        CULTURAL_DATASETS.indonesian.scenarios[params.scenario as keyof typeof CULTURAL_DATASETS.indonesian.scenarios]
      scenarioDescription = scenario.description
      basePrompt += `${scenarioDescription}, `
    } else if (
      params.dataset === "thailand" &&
      params.scenario &&
      CULTURAL_DATASETS.thailand.scenarios[params.scenario as keyof typeof CULTURAL_DATASETS.thailand.scenarios]
    ) {
      const scenario =
        CULTURAL_DATASETS.thailand.scenarios[params.scenario as keyof typeof CULTURAL_DATASETS.thailand.scenarios]
      scenarioDescription = scenario.description
      basePrompt += `${scenarioDescription}, `
    } else if (
      params.dataset === "escher" &&
      params.scenario &&
      CULTURAL_DATASETS.escher.scenarios[params.scenario as keyof typeof CULTURAL_DATASETS.escher.scenarios]
    ) {
      const scenario =
        CULTURAL_DATASETS.escher.scenarios[params.scenario as keyof typeof CULTURAL_DATASETS.escher.scenarios]
      scenarioDescription = scenario.description
      basePrompt += `${scenarioDescription}, `
    } else {
      // Mathematical/abstract datasets
      const datasetInfo = CULTURAL_DATASETS[params.dataset as keyof typeof CULTURAL_DATASETS]
      if (datasetInfo && datasetInfo.scenarios.pure) {
        basePrompt += `${datasetInfo.scenarios.pure.description}, `
      } else {
        basePrompt += `Mathematical visualization of ${params.dataset} patterns, `
      }
    }

    // Add color scheme with enhanced descriptions
    const colorDescription = COLOR_SCHEMES[params.colorScheme as keyof typeof COLOR_SCHEMES] || "vibrant colors"
    basePrompt += `rendered in ${colorDescription} with professional color grading, `

    // Add technical parameters - OPTIMIZED FOR SPACE
    basePrompt += `${params.numSamples || 4000} data points, noise scale ${params.noiseScale || 0.08}, seed ${params.seed || 1234}, `

    // Add godlevel quality descriptors - CONDENSED
    basePrompt +=
      "museum-grade professional quality, award-winning composition, ultra-high definition, cinematic lighting, breathtaking visual impact, "

    // Add 360° specific instructions if needed - CRITICAL SEAMLESS WRAPPING
    if (params.panoramic360 && params.panoramaFormat === "equirectangular") {
      basePrompt +=
        "CRITICAL 360° SEAMLESS WRAPPING: LEFT EDGE must connect PERFECTLY with RIGHT EDGE - zero visible seam, continuous circular environment, professional cylindrical projection, VR-optimized seamless wraparound, "
    } else if (params.panoramic360 && params.panoramaFormat === "stereographic") {
      basePrompt +=
        "STEREOGRAPHIC 360°: perfect circular fisheye distortion, entire 360° view in circular frame, center focus with radial distortion, "
    }

    // Add final quality tags - CONDENSED
    basePrompt +=
      "8K HDR, photorealistic detail, award-winning digital art, museum exhibition quality, godlevel artistic excellence, professional broadcast standard"

    // Ensure we stay within reasonable limits while preserving critical information
    if (basePrompt.length > 1800) {
      // Intelligently truncate while preserving key elements
      const criticalPhrases = [
        "LEFT EDGE must connect PERFECTLY with RIGHT EDGE",
        "seamless",
        "godlevel",
        "museum-grade",
        "professional",
      ]

      let truncated = basePrompt.substring(0, 1700)
      const lastComma = truncated.lastIndexOf(",")
      if (lastComma > 1500) {
        truncated = truncated.substring(0, lastComma)
      }

      // Ensure critical seamless instruction is preserved for 360°
      if (
        params.panoramic360 &&
        params.panoramaFormat === "equirectangular" &&
        !truncated.includes("LEFT EDGE must connect PERFECTLY")
      ) {
        truncated += ", CRITICAL: LEFT EDGE must connect PERFECTLY with RIGHT EDGE - zero seam"
      }

      basePrompt = truncated
    }

    return basePrompt
  } catch (error) {
    console.error("Error building prompt:", error)
    // Return a safe fallback with godlevel quality
    return "GODLEVEL MASTERPIECE: Beautiful mathematical art with cosmic colors, museum-grade professional quality, ultra-high detail, award-winning composition, 8K HDR, photorealistic excellence, premium digital art"
  }
}

// Get available scenarios for a dataset
export function getScenarios(dataset: string) {
  const datasetInfo = CULTURAL_DATASETS[dataset as keyof typeof CULTURAL_DATASETS]
  return datasetInfo?.scenarios || {}
}

// Get dataset display name
export function getDatasetName(dataset: string): string {
  const datasetInfo = CULTURAL_DATASETS[dataset as keyof typeof CULTURAL_DATASETS]
  return datasetInfo?.name || dataset
}

// Validate dataset and scenario combination
export function validateDatasetScenario(dataset: string, scenario: string): boolean {
  const datasetInfo = CULTURAL_DATASETS[dataset as keyof typeof CULTURAL_DATASETS]
  if (!datasetInfo) return false

  return scenario in datasetInfo.scenarios
}

// Get all available datasets
export function getDatasets() {
  return Object.entries(CULTURAL_DATASETS).map(([key, value]) => ({
    id: key,
    name: value.name,
  }))
}

// Get color schemes
export function getColorSchemes() {
  return Object.entries(COLOR_SCHEMES).map(([key, value]) => ({
    id: key,
    name: key.charAt(0).toUpperCase() + key.slice(1),
    description: value,
  }))
}
