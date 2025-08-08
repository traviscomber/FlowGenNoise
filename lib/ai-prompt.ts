// Shared prompt builder for AI Art generation.
// This mirrors the buildPrompt logic from /api/generate-ai-art/route.ts
// so the preview matches what the backend will use.

export function buildPrompt(
  dataset: string,
  scenario: string | undefined,
  colorScheme: string,
  customPrompt?: string,
): string {
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

  // Build dataset-specific base
  let prompt = ""

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
    "8bit": "8bit pixel art, retro gaming aesthetics, pixelated graphics, classic arcade style",
    escher: "Escher-style tessellations, impossible geometry, recursive stairs, interlocking patterns",
    bosch: "Boschian surreal scenes with fantastical creatures and moral allegories",
  }

  prompt = datasetPrompts[dataset] || "Abstract mathematical art"

  // Add scenario-specific details for 8bit dataset
  if (dataset === "8bit") {
    const scenarioPrompts: Record<string, string> = {
      pure: "pure mathematical beauty with 8bit pixel aesthetics and retro gaming precision",
      "glitch-matrix":
        "GLITCH MATRIX CHAOS: Corrupted digital reality with cascading data streams in authentic 8bit pixel art...",
      "neon-synthwave":
        "NEON SYNTHWAVE DREAMS: Retro-futuristic landscapes rendered in vibrant 8bit pixel art...",
      "pixel-storm":
        "PIXEL STORM VORTEX: Swirling maelstrom of animated pixels creating hypnotic geometric patterns...",
      "digital-decay":
        "DIGITAL DECAY APOCALYPSE: Post-digital wasteland with fragmenting pixels and corrupted memory blocks...",
      "quantum-bits":
        "QUANTUM BIT DIMENSIONS: Microscopic 8bit universes with quantum pixel fluctuations and probability clouds...",
      "retro-cosmos":
        "RETRO COSMIC GENESIS: 8bit interpretation of cosmic creation with pixelated nebulae and digital star formation...",
      "cyber-mandala":
        "CYBER MANDALA MEDITATION: Sacred geometric patterns rendered in pure 8bit precision with digital enlightenment themes...",
      "pixel-fractals":
        "PIXEL FRACTAL INFINITY: Recursive 8bit patterns creating infinite depth with mathematical pixel precision...",
      "data-cathedral":
        "DATA CATHEDRAL SANCTUM: Monumental digital architecture built from pure 8bit data structures and code poetry...",
      "electric-dreams":
        "ELECTRIC DREAMS SEQUENCE: Surreal 8bit dreamscapes with flowing electric currents and digital consciousness themes...",
      "pixel-phoenix":
        "PIXEL PHOENIX REBIRTH: Mythical digital creature emerging from cascading pixel flames and data resurrection themes...",
      "binary-blizzard":
        "BINARY BLIZZARD STORM: Chaotic snowstorm of 1s and 0s creating mesmerizing 8bit weather phenomena...",
      "chrome-cascade":
        "CHROME CASCADE FALLS: Metallic pixel waterfalls with reflective chrome surfaces and liquid mercury effects...",
      "neon-labyrinth":
        "NEON LABYRINTH MAZE: Impossible 8bit maze structures with glowing pathways and digital minotaur guardians...",
    }

    if (scenario && scenarioPrompts[scenario]) {
      prompt += ", " + scenarioPrompts[scenario]
    }
  }

  // Add scenario-specific details for Indonesian dataset
  if (dataset === "indonesian") {
    const scenarioPrompts: Record<string, string> = {
      pure: "pure mathematical beauty with Indonesian geometric patterns",
      garuda:
        "GODLEVEL PROMPT: Majestic Garuda Wisnu Kencana soaring through celestial realms, massive divine eagle...",
      wayang:
        "GODLEVEL PROMPT: Mystical Wayang Kulit shadow puppet performance bringing ancient Ramayana...",
      batik:
        "GODLEVEL PROMPT: Infinite cosmic tapestry of sacred Indonesian batik patterns coming alive with supernatural energy...",
      borobudur:
        "GODLEVEL PROMPT: Magnificent Borobudur Buddhist temple complex rising like cosmic mandala...",
      javanese:
        "GODLEVEL PROMPT: Magnificent Javanese royal court of Yogyakarta Sultan's palace with refined traditions...",
      sundanese:
        "GODLEVEL PROMPT: West Java's indigenous Sundanese people with distinct cultural identity thriving in mountainous terrain...",
      batak:
        "GODLEVEL PROMPT: North Sumatra highland Batak people with distinctive architecture around magnificent Lake Toba...",
      dayak:
        "GODLEVEL PROMPT: Indigenous Dayak peoples of Kalimantan Borneo with diverse sub-groups living in harmony with rainforest...",
      acehnese:
        "GODLEVEL PROMPT: Northernmost Sumatra Acehnese province with strong Islamic identity and proud cultural tradition...",
      minangkabau:
        "GODLEVEL PROMPT: West Sumatra Minangkabau people with unique matrilineal social structure...",
      "balinese-tribe":
        "GODLEVEL PROMPT: Bali island people with distinct Hindu-Dharma religion creating paradise of temples and ceremonies...",
      papuans:
        "GODLEVEL PROMPT: New Guinea indigenous peoples with incredible cultural diversity representing hundreds of distinct tribes...",
      baduy:
        "GODLEVEL PROMPT: Banten Java Baduy tribe maintaining strict traditional lifestyle in harmony with nature...",
      "orang-rimba":
        "GODLEVEL PROMPT: Sumatra nomadic forest dwellers known as Kubu people living deep in rainforest...",
      "hongana-manyawa":
        "GODLEVEL PROMPT: One of Indonesia's last nomadic forest-dwelling tribes living in remote rainforest areas of Halmahera island...",
      asmat:
        "GODLEVEL PROMPT: New Guinea indigenous Asmat people renowned worldwide for intricate wood carvings...",
      komodo:
        "GODLEVEL PROMPT: Mystical dragon-inspired artistic tapestry with ancient Indonesian mythological elements...",
      dance:
        "GODLEVEL PROMPT: Abstract mathematical choreography patterns with infinite algorithmic recursion...",
      volcanoes:
        "GODLEVEL PROMPT: Mystical volcanic artistry with supernatural Indonesian fire spirits...",
      temples:
        "GODLEVEL PROMPT: Abstract mathematical temple architecture with infinite geometric recursion and sacred patterns...",
    }

    if (scenario && scenarioPrompts[scenario]) {
      prompt += ", " + scenarioPrompts[scenario]
    }
  }

  // Add scenario-specific details for Bosch dataset
  if (dataset === "bosch") {
    const scenarioPrompts: Record<string, string> = {
      pure: "pure mathematical beauty with Boschian surreal precision and fantastical creature elements",
      "garden-earthly-delights":
        "GODLEVEL BOSCH GARDEN OF EARTHLY DELIGHTS: Hieronymus Bosch's masterpiece triptych...",
      "temptation-saint-anthony":
        "GODLEVEL BOSCH TEMPTATION OF SAINT ANTHONY: Hieronymus Bosch's nightmarish vision...",
      "ship-fools":
        "GODLEVEL BOSCH SHIP OF FOOLS: Hieronymus Bosch's Ship of Fools populated with characteristic human-animal hybrids...",
      "seven-deadly-sins":
        "GODLEVEL BOSCH SEVEN DEADLY SINS WHEEL: Hieronymus Bosch's circular composition...",
      "haywain-triptych":
        "GODLEVEL BOSCH HAYWAIN TRIPTYCH: Hieronymus Bosch's Haywain featuring signature human-animal transformations...",
      "last-judgment":
        "GODLEVEL BOSCH LAST JUDGMENT: Hieronymus Bosch's terrifying Last Judgment with most creative demonic creatures...",
      "death-miser":
        "GODLEVEL BOSCH DEATH AND THE MISER: Hieronymus Bosch's Death and the Miser with signature demonic tempters...",
      "conjurer":
        "GODLEVEL BOSCH THE CONJURER: Hieronymus Bosch's satirical Conjurer scene with signature trickster creatures...",
      "stone-operation":
        "GODLEVEL BOSCH STONE OF MADNESS: Hieronymus Bosch's satirical Stone of Madness...",
      "adoration-magi":
        "GODLEVEL BOSCH ADORATION OF MAGI: Hieronymus Bosch's unique Adoration blending traditional nativity...",
      "christ-carrying-cross":
        "GODLEVEL BOSCH CHRIST CARRYING CROSS: Hieronymus Bosch's intense Christ Carrying Cross...",
    }

    if (scenario && scenarioPrompts[scenario]) {
      prompt += ", " + scenarioPrompts[scenario]
    }
  }

  // Color scheme
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
  prompt +=
    ", highly detailed, artistic masterpiece, professional photography quality, 8K resolution, stunning visual composition"

  return prompt
}
