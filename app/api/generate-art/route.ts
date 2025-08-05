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
    "8bit": "8bit pixel art, retro gaming aesthetics, pixelated graphics, classic arcade style",
  }

  prompt = datasetPrompts[dataset] || "Abstract mathematical art"

  // Add scenario-specific details for 8bit dataset
  if (dataset === "8bit") {
    const scenarioPrompts: Record<string, string> = {
      pure: "pure mathematical beauty with 8bit pixel aesthetics and retro gaming precision",
      "glitch-matrix":
        "GLITCH MATRIX CHAOS: Corrupted digital reality with cascading data streams in authentic 8bit pixel art, system error artifacts manifesting as beautiful pixel corruption patterns, matrix-style falling code rendered in blocky 8bit characters, digital reality fragmenting into geometric pixel shards, corrupted memory blocks creating abstract pixel art compositions, data overflow visualized as pixel waterfalls of green and amber code, system crash aesthetics with beautiful pixel debris, digital noise patterns creating mesmerizing 8bit static art, corrupted sprite data manifesting as surreal pixel creatures, glitch art effects with authentic retro gaming color palette limitations, cascading binary code in pixel typography, digital reality tears revealing underlying 8bit architecture, memory leak visualizations as flowing pixel streams, corrupted texture mapping creating abstract 8bit landscapes, system error messages as decorative pixel art elements, digital archaeology of broken 8bit worlds",
      "neon-synthwave":
        "NEON SYNTHWAVE DREAMS: Retro-futuristic landscapes rendered in vibrant 8bit pixel art with pulsing neon grid systems, synthwave aesthetic with authentic pixel limitations and chromatic aberration effects, neon-lit highways stretching into pixel horizons with grid-lined roads, retro sports cars as sleek 8bit sprites racing through neon cityscapes, palm trees silhouetted against pixel sunsets in hot pink and cyan, laser grid effects creating geometric 8bit patterns, synthwave mountains with wireframe pixel outlines, neon signs and holographic advertisements in limited 8bit color palettes, retro-futuristic architecture with glowing pixel details, 80s aesthetic translated into authentic pixel art form, chromatic aberration effects using pixel color bleeding, synthwave characters in pixel form wearing neon clothing, laser light shows creating geometric pixel art displays, retro computer interfaces with glowing 8bit elements, nostalgic 80s atmosphere with authentic pixel art limitations, digital sunset gradients with pixel color banding effects",
      "pixel-storm":
        "PIXEL STORM VORTEX: Swirling maelstrom of animated pixels creating hypnotic geometric patterns in authentic 8bit style, tornado of pure pixel energy with individual blocks visible in the chaos, pixel particles forming spiral galaxies and vortex patterns, storm clouds made of clustered 8bit pixels in dark color palettes, lightning effects rendered as jagged pixel bolts with electric blue highlights, pixel rain falling in geometric patterns with authentic 8bit physics, whirlwind of colored pixels creating rainbow spiral effects, pixel debris caught in digital tornadoes, storm eye revealing calm pixel art landscapes, chaotic pixel weather systems with authentic retro gaming aesthetics, pixel hail and snow effects using white and gray blocks, digital storm clouds with pixel-perfect cumulus formations, pixel wind effects showing directional flow patterns, storm surge of pixels creating tidal wave effects, electric pixel storms with authentic 8bit color limitations, meteorological pixel phenomena with retro gaming charm",
      "digital-decay":
        "DIGITAL DECAY APOCALYPSE: Post-digital wasteland with fragmenting pixels and corrupted memory blocks in authentic 8bit style, abandoned digital cities with crumbling pixel architecture, corrupted data manifesting as beautiful pixel decay patterns, digital rust and erosion effects using authentic 8bit color degradation, fragmenting pixel structures revealing underlying code architecture, memory corruption creating abstract 8bit art compositions, digital archaeology of forgotten 8bit worlds, pixel graveyards with tombstone-like data structures, corrupted sprite data creating surreal pixel creatures, digital entropy visualized through pixel degradation, system failure aesthetics with beautiful pixel debris, abandoned digital infrastructure with overgrown pixel vegetation, corrupted texture files creating abstract 8bit landscapes, digital fossils of ancient 8bit civilizations, memory leak visualizations as flowing pixel streams, post-apocalyptic pixel environments with authentic retro gaming atmosphere",
      "quantum-bits":
        "QUANTUM BIT DIMENSIONS: Microscopic 8bit universes with quantum pixel fluctuations and probability clouds in authentic pixel art style, quantum superposition visualized through overlapping pixel states, probability waves rendered as flowing 8bit particle effects, quantum entanglement shown through connected pixel pairs, microscopic 8bit worlds existing in quantum dimensions, particle physics visualized through authentic pixel art aesthetics, quantum tunneling effects with pixels phasing through barriers, wave-particle duality shown through 8bit animation cycles, quantum field fluctuations creating pixel static patterns, subatomic 8bit particles with authentic color limitations, quantum mechanics translated into retro gaming visual language, probability clouds as pixel fog effects, quantum interference patterns in 8bit geometric forms, microscopic pixel universes with their own physics, quantum computing visualized through 8bit data processing, dimensional pixel portals showing quantum realm access",
      "retro-cosmos":
        "RETRO COSMIC GENESIS: 8bit interpretation of cosmic creation with pixelated nebulae and digital star formation in authentic retro gaming style, cosmic big bang rendered as expanding pixel explosion, stellar nurseries with baby stars as glowing 8bit sprites, galaxy formation through swirling pixel spiral arms, cosmic dust clouds rendered in authentic 8bit particle effects, planetary formation with pixel accretion disks, solar systems with pixelated planets and orbital mechanics, cosmic radiation visualized as pixel particle streams, black holes with pixel event horizons and accretion effects, cosmic microwave background as 8bit static patterns, stellar evolution from pixel proto-stars to pixel supernovas, cosmic web structure with pixel filaments connecting galaxies, asteroid belts as pixel debris fields, cosmic phenomena translated into retro gaming visual language, space-time curvature shown through pixel grid distortions, cosmic creation myths visualized through authentic 8bit aesthetics",
      "cyber-mandala":
        "CYBER MANDALA MEDITATION: Sacred geometric patterns rendered in pure 8bit precision with digital enlightenment themes, mandala formations using authentic pixel art techniques, sacred geometry translated into retro gaming visual language, digital meditation spaces with pixel lotus patterns, cyber-spiritual symbols in 8bit geometric forms, mandala animations using authentic pixel art frame cycles, digital prayer wheels with rotating pixel patterns, sacred pixel art with authentic color palette limitations, cyber-buddhist aesthetics in retro gaming style, digital enlightenment visualized through 8bit transcendence effects, pixel chakras with authentic color representations, sacred digital architecture with mandala-inspired pixel layouts, cyber-spiritual energy flows as pixel particle streams, digital meditation gardens with pixel zen elements, sacred pixel geometry with mathematical precision, cyber-mandala portals to digital enlightenment realms",
      "pixel-fractals":
        "PIXEL FRACTAL INFINITY: Recursive 8bit patterns creating infinite depth with mathematical pixel precision, fractal mathematics translated into authentic pixel art form, recursive pixel patterns with authentic retro gaming aesthetics, infinite zoom effects using 8bit scaling techniques, mathematical beauty rendered through pixel art precision, fractal trees with pixel branches and authentic color limitations, recursive pixel spirals creating hypnotic patterns, mathematical infinity visualized through 8bit artistic expression, fractal landscapes with pixel terrain generation, recursive pixel art with authentic retro gaming charm, mathematical patterns using pure pixel precision, fractal animations with authentic 8bit frame cycles, infinite complexity achieved through simple pixel elements, mathematical art using authentic retro gaming techniques, fractal geometry translated into pixel art mastery, recursive beauty through authentic 8bit artistic expression",
      "data-cathedral":
        "DATA CATHEDRAL SANCTUM: Monumental digital architecture built from pure 8bit data structures and code poetry, cathedral spires made of stacked pixel blocks, gothic digital architecture with authentic 8bit construction techniques, data streams flowing like pixel waterfalls through cathedral spaces, code poetry inscribed in pixel typography on digital walls, sacred digital spaces with pixel stained glass windows, monumental pixel architecture with authentic retro gaming aesthetics, digital pipe organs with pixel keys and authentic sound wave visualizations, cathedral lighting effects using authentic 8bit illumination techniques, sacred digital geometry with pixel precision construction, data sanctuary with flowing information streams as pixel art, digital worship spaces with pixel congregation areas, sacred code architecture with authentic retro gaming visual language, monumental pixel construction with mathematical precision, digital cathedral acoustics visualized through 8bit sound wave patterns, sacred data architecture with authentic pixel art mastery",
      "electric-dreams":
        "ELECTRIC DREAMS SEQUENCE: Surreal 8bit dreamscapes with flowing electric currents and digital consciousness themes, dream logic translated into authentic pixel art form, electric sheep rendered as pixel sprites with authentic retro gaming aesthetics, digital consciousness streams as flowing pixel currents, surreal pixel landscapes with dream-like physics, electric dreams with authentic 8bit color palette limitations, digital sleep patterns visualized through pixel wave forms, consciousness uploading effects using authentic pixel art techniques, electric neural networks as pixel circuit patterns, digital dream architecture with impossible pixel geometry, electric thought patterns as pixel lightning effects, consciousness streams flowing through 8bit digital landscapes, electric dreams with authentic retro gaming visual language, digital REM sleep visualized through pixel animation cycles, electric consciousness with authentic 8bit artistic expression, surreal digital dreams with pixel art mastery",
      "pixel-phoenix":
        "PIXEL PHOENIX REBIRTH: Mythical digital creature emerging from cascading pixel flames and data resurrection themes, phoenix rising rendered in authentic 8bit pixel art style, digital rebirth through pixel flame effects, mythical pixel creature with authentic retro gaming aesthetics, cascading pixel fire with authentic color palette limitations, data resurrection visualized through pixel phoenix transformation, digital mythology translated into authentic pixel art form, phoenix flames as flowing pixel particle effects, mythical rebirth cycle using authentic 8bit animation techniques, digital phoenix with pixel feather details and authentic sprite work, resurrection fire effects using authentic retro gaming visual language, pixel phoenix soaring through digital skies, mythical transformation sequences in authentic 8bit style, digital rebirth mythology with pixel art mastery, phoenix rising from pixel ashes with authentic retro gaming charm, mythical digital creature with authentic 8bit artistic expression",
      "binary-blizzard":
        "BINARY BLIZZARD STORM: Chaotic snowstorm of 1s and 0s creating mesmerizing 8bit weather phenomena, binary code falling like pixel snow with authentic retro gaming aesthetics, digital blizzard effects using authentic 8bit particle systems, binary storm patterns with mathematical precision, code snowflakes as individual pixel elements, digital weather phenomena translated into authentic pixel art form, binary precipitation with authentic color palette limitations, digital storm systems with pixel meteorology, code blizzard creating beautiful 8bit static patterns, binary weather with authentic retro gaming visual language, digital snow accumulation using pixel physics, binary storm clouds with authentic 8bit formation patterns, code weather systems with pixel precision, digital blizzard landscapes with authentic pixel art mastery, binary storm effects with authentic retro gaming charm, mathematical weather phenomena through authentic 8bit artistic expression",
      "chrome-cascade":
        "CHROME CASCADE FALLS: Metallic pixel waterfalls with reflective chrome surfaces and liquid mercury effects, chrome pixel art with authentic metallic color palette limitations, liquid metal effects using authentic 8bit animation techniques, reflective pixel surfaces with authentic retro gaming aesthetics, metallic waterfalls cascading in pixel form, chrome pixel art with authentic sprite work and metallic shading, liquid mercury pools with authentic 8bit reflection effects, metallic pixel landscapes with chrome surface details, reflective pixel art using authentic retro gaming visual language, chrome cascade effects with authentic color palette limitations, metallic pixel physics with authentic 8bit fluid dynamics, chrome pixel art mastery with authentic retro gaming charm, liquid metal streams flowing through pixel landscapes, metallic pixel art with authentic artistic expression, chrome effects using authentic 8bit rendering techniques, reflective pixel mastery with authentic retro gaming aesthetics",
      "neon-labyrinth":
        "NEON LABYRINTH MAZE: Impossible 8bit maze structures with glowing pathways and digital minotaur guardians, maze architecture rendered in authentic pixel art style, neon pathways glowing with authentic 8bit color palette limitations, digital labyrinth with impossible pixel geometry, maze walls constructed from authentic pixel blocks, neon lighting effects using authentic retro gaming techniques, labyrinth guardians as pixel sprites with authentic animation cycles, maze puzzles with authentic 8bit game design aesthetics, neon maze corridors with authentic pixel art precision, digital labyrinth architecture with authentic retro gaming visual language, impossible maze geometry using authentic pixel construction techniques, neon maze lighting with authentic color palette limitations, labyrinth exploration with authentic 8bit adventure game aesthetics, maze architecture with authentic pixel art mastery, digital labyrinth with authentic retro gaming charm, neon maze effects with authentic 8bit artistic expression",
    }

    if (scenarioPrompts[scenario]) {
      prompt += ", " + scenarioPrompts[scenario]
    }
  }

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
      domeDiameter = 20,
      domeResolution = "8K",
      projectionType = "fisheye",
      panoramaResolution = "16K",
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
      domeImage: domeImageUrl || mainImageUrl,
      panoramaImage: panoramaImageUrl || mainImageUrl,
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
        domeProjection: true,
        domeDiameter: 20,
        domeResolution: "8K",
        projectionType: "fisheye",
        panoramic360: true,
        panoramaResolution: "16K",
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
