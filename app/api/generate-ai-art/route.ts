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
        "GODLEVEL PROMPT: Majestic Garuda Wisnu Kencana soaring through celestial realms, massive divine eagle with wingspan stretching across golden sunset skies, intricate feather details shimmering with ethereal light, powerful talons gripping sacred lotus blossoms radiating divine energy, noble eagle head crowned with jeweled diadem of ancient Javanese kings, eyes blazing with cosmic wisdom and protective spirit, Lord Vishnu mounted majestically upon Garuda's back in full divine regalia with four arms holding sacred conch shell, discus wheel of time, lotus of creation, and ceremonial staff, flowing silk garments in royal blues and golds dancing in celestial winds, Mount Meru rising in background with cascading waterfalls of liquid starlight, temple spires piercing through clouds of incense and prayers, Indonesian archipelago spread below like scattered emeralds in sapphire seas, Ring of Fire volcanoes glowing with sacred flames, traditional gamelan music visualized as golden sound waves rippling through dimensions, ancient Sanskrit mantras floating as luminous script in the air, Ramayana epic scenes carved into floating stone tablets, divine aura radiating rainbow light spectrum, cosmic mandala patterns swirling in the heavens, 17,508 islands of Indonesia visible as points of light below, Borobudur and Prambanan temples glowing with spiritual energy, traditional Indonesian textiles patterns woven into the very fabric of reality, hyperrealistic 8K cinematic masterpiece with volumetric lighting and particle effects",
      wayang:
        "GODLEVEL PROMPT: Mystical Wayang Kulit shadow puppet performance bringing ancient Ramayana and Mahabharata epics to life, master dalang puppeteer silhouetted behind glowing white screen with hundreds of intricately carved leather puppets, each puppet a masterwork of perforated artistry with gold leaf details catching flickering oil lamp light, dramatic shadows dancing and morphing into living characters, Prince Rama with perfect noble features and ornate crown alongside beautiful Princess Sita with flowing hair and delicate jewelry radiating purity and grace, mighty Hanuman the white monkey hero leaping through air with mountain in his grasp, gamelan orchestra of bronze instruments creating visible sound waves in metallic gold and silver, traditional Indonesian musicians in batik clothing playing gender, saron, and kendang drums, audience of villagers sitting cross-legged on woven mats mesmerized by the eternal stories, coconut oil lamps casting warm amber light creating multiple layers of shadows, ancient Javanese script floating in the air telling the story, tropical night sky filled with stars and flying spirits, traditional Javanese architecture with carved wooden pillars and clay tile roofs, incense smoke curling upward carrying prayers to ancestors, banana leaves and frangipani flowers as offerings, cultural heritage spanning over 1000 years visualized as golden threads connecting past to present, UNESCO World Heritage artistic tradition, hyperrealistic cinematic lighting with deep shadows and warm highlights, 8K resolution with intricate puppet details and atmospheric effects",
      batik:
        "GODLEVEL PROMPT: Infinite cosmic tapestry of sacred Indonesian batik patterns coming alive with supernatural energy, master batik artisan's hands applying hot wax with traditional canting tool creating flowing lines that transform into living rivers of light, parang rusak diagonal patterns representing flowing water and eternal life force undulating like ocean waves, kawung geometric circles symbolizing cosmic order expanding into mandala formations that pulse with universal rhythm, mega mendung cloud motifs in deep indigo blues swirling with actual storm clouds and lightning, ceplok star formations bursting into real constellations in the night sky, sido mukti prosperity symbols manifesting as golden coins and rice grains falling like blessed rain, royal court designs with protective meanings creating shields of light around ancient Javanese palaces, intricate hand-drawn patterns using traditional canting tools guided by ancestral spirits, natural dyes from indigo plants, turmeric roots, and mahogany bark creating earth tones that shift and change like living skin, cultural identity woven into fabric of reality itself, UNESCO heritage craft mastery passed down through generations of royal court artisans, each pattern telling stories of creation myths and heroic legends, textile becoming portal to spiritual realm where ancestors dance in eternal celebration, traditional Javanese philosophy of harmony between human, nature, and divine visualized as interconnected geometric patterns, workshop filled with clay pots of dye, bamboo tools, and cotton fabric stretched on wooden frames, tropical sunlight filtering through palm leaves creating natural batik shadows on the ground, master craftswomen in traditional kebaya clothing working with meditative focus, the very air shimmering with creative energy and cultural pride, hyperrealistic 8K detail showing every wax crack and dye gradient, volumetric lighting and particle effects bringing ancient art form to supernatural life",
      borobudur:
        "GODLEVEL PROMPT: Magnificent Borobudur Buddhist temple complex rising like cosmic mandala from misty Javanese plains, nine-tiered pyramid representing Buddhist cosmology with 2,672 relief panels telling complete story of Buddha's path to enlightenment, 504 Buddha statues in meditation poses each carved with individual expressions of serene wisdom, bell-shaped stupas containing hidden Buddha figures creating sacred geometry across temple terraces, pilgrims in saffron robes walking clockwise meditation path following ancient ritual circumambulation, sunrise illuminating temple with golden light revealing intricate stone carvings depicting Jataka tales and Buddhist teachings, Mount Merapi and Mount Merbabu forming sacred backdrop with volcanic peaks shrouded in mystical clouds, tropical jungle canopy stretching to horizon with ancient trees that witnessed temple's construction 1,200 years ago, stone relief panels coming alive with carved figures stepping from walls - bodhisattvas with flowing robes and lotus flowers, celestial musicians playing divine instruments, dancing apsaras with graceful movements frozen in stone, merchants and pilgrims from ancient maritime trade routes, elaborate architectural details showing Gupta and Javanese artistic fusion, hidden chambers within temple structure containing sacred relics and ancient manuscripts, restoration work by UNESCO preserving world heritage site for future generations, spiritual energy radiating from temple stones blessed by centuries of prayer and meditation, traditional Javanese ceremonies with offerings of flowers, incense, and prayers, gamelan music echoing across temple grounds during full moon celebrations, archaeological discoveries revealing temple's original splendor with colored stones and gold decorations, cosmic alignment with celestial bodies during equinoxes creating sacred light phenomena, hyperrealistic 8K architectural visualization with dramatic lighting showing intricate stone carving details and atmospheric temple ceremonies, volumetric lighting through incense smoke creating mystical ambiance",
      javanese:
        "GODLEVEL PROMPT: Magnificent Javanese royal court of Yogyakarta Sultan's palace with refined traditions spanning centuries, elaborate batik patterns with philosophical meanings covering silk garments of court nobles, gamelan orchestras creating meditative soundscapes with bronze instruments that seem to channel ancestral spirits, traditional Javanese architecture with joglo roofs and carved wooden pillars telling stories of ancient kingdoms, shadow puppet wayang performances in royal courtyards where dalang masters weave epic tales of gods and heroes, ancient Hindu-Buddhist influences merged seamlessly with Islamic culture creating unique Javanese synthesis, terraced rice cultivation creating geometric patterns across volcanic landscapes, traditional ceremonies and rituals connecting living descendants to royal ancestors, sophisticated artistic heritage spanning centuries with court painters, musicians, and craftsmen, Sultan's palace (Kraton) with its sacred layout representing cosmic order, traditional Javanese philosophy of harmony and balance expressed in daily life, court dancers in elaborate costumes performing sacred dances, royal gamelan sets made of bronze and gold creating music for the gods, traditional Javanese script and literature preserving ancient wisdom, ceremonial keris daggers with mystical powers passed down through generations, traditional medicine and healing practices using herbs and spiritual energy, hyperrealistic 8K cultural documentation with rich details of court life and artistic traditions",
      sundanese:
        "GODLEVEL PROMPT: West Java's indigenous Sundanese people with distinct cultural identity thriving in mountainous terrain, traditional bamboo architecture with elevated houses on stilts protecting from floods and providing ventilation, angklung bamboo musical instruments creating harmonious melodies that echo through mountain valleys, traditional Sundanese dance performances with graceful movements inspired by nature, rice cultivation in mountainous terrain creating spectacular terraced landscapes, unique culinary traditions with fresh vegetables and fish from mountain streams, traditional clothing and textiles with intricate patterns and natural dyes, ancient animistic beliefs blended seamlessly with Islam creating unique spiritual practices, community cooperation gotong royong traditions where entire villages work together, highland agricultural practices adapted to volcanic soil and mountain climate, traditional houses with steep roofs and bamboo walls designed for mountain weather, Sundanese language with its own script and literature, traditional crafts including bamboo weaving and wood carving, mountain festivals celebrating harvest and seasonal changes, traditional healing practices using mountain herbs and spiritual rituals, hyperrealistic 8K documentation of highland culture with dramatic mountain landscapes and traditional architecture",
      batak:
        "GODLEVEL PROMPT: North Sumatra highland Batak people with distinctive architecture around magnificent Lake Toba, traditional Batak houses with dramatic curved roofs resembling buffalo horns reaching toward sky, intricate wood carvings and decorative elements telling clan histories and spiritual beliefs, traditional ulos textiles with sacred meanings woven by master craftswomen, patrilineal clan system and ancestral worship connecting living descendants to powerful spirits, Lake Toba cultural landscape with world's largest volcanic lake surrounded by traditional villages, traditional music with gondang instruments creating rhythms that summon ancestral spirits, stone megalithic monuments erected by ancient Batak kings, ancient Batak script and literature preserving oral traditions, ceremonial feasts and rituals celebrating life passages and clan unity, traditional oral histories of heroic deeds and cultural achievements, traditional Batak architecture with houses built without nails using ancient joinery techniques, clan totems and symbols carved into house facades, traditional ceremonies for naming, marriage, and celebration with elaborate rituals, Batak Christian churches blending traditional architecture with Christian symbolism, hyperrealistic 8K cultural photography showing traditional architecture and Lake Toba landscape with dramatic lighting and atmospheric effects",
      dayak:
        "GODLEVEL PROMPT: Indigenous Dayak peoples of Kalimantan Borneo with diverse sub-groups living in harmony with rainforest, traditional longhouses accommodating extended families with communal living spaces stretching hundreds of feet, intricate beadwork and traditional costumes with patterns representing clan identity and spiritual protection, traditional cultural practices and ceremonial displays, river-based transportation and settlements with traditional boats navigating jungle waterways, traditional tattoos with spiritual significance covering bodies with protective symbols, hornbill bird cultural symbolism with sacred feathers used in ceremonies, forest-based lifestyle and sustainable practices using traditional knowledge, shamanic traditions and spiritual beliefs connecting human world to forest spirits, traditional crafts and woodcarving creating masks and totems, oral traditions and folklore passed down through generations, traditional medicine using rainforest plants and spiritual healing, longhouse architecture built on stilts with communal verandas, traditional ceremonies for rice planting and harvest, cultural heritage with elaborate shields and ceremonial items, hyperrealistic 8K rainforest photography showing traditional longhouses and Dayak cultural practices with atmospheric jungle lighting",
      acehnese:
        "GODLEVEL PROMPT: Northernmost Sumatra Acehnese province with strong Islamic identity and proud cultural tradition, traditional Acehnese architecture with Islamic influences showing Middle Eastern and local fusion, distinctive cultural practices and ceremonies blending Islamic faith with local customs, traditional Saman dance performances with dozens of dancers in perfect synchronization, coffee cultivation and trade traditions making Aceh famous for premium coffee beans, community resilience and strength shown through cultural preservation, traditional clothing and textiles with Islamic geometric patterns, Islamic educational institutions (dayah) preserving religious knowledge, maritime trading heritage with traditional boats and fishing techniques, unique Acehnese dialect and language distinct from other Indonesian languages, traditional crafts and metalwork creating Islamic calligraphy and decorative arts, Grand Mosque of Baiturrahman with black domes and minarets, traditional Acehnese houses with steep roofs and Islamic architectural elements, Islamic law (Sharia) implementation in daily life, traditional ceremonies for Islamic holidays and life passages, hyperrealistic 8K cultural documentation showing Islamic architecture and Acehnese traditions with dramatic lighting and cultural authenticity",
      minangkabau:
        "GODLEVEL PROMPT: West Sumatra Minangkabau people with unique matrilineal social structure where women hold property and family lineage, distinctive rumah gadang houses with dramatic horn-shaped roofs resembling buffalo horns reaching toward sky, traditional Minang cuisine and culinary heritage famous throughout Indonesia and Malaysia, matriarchal inheritance and family systems where mothers pass property to daughters, traditional ceremonies and adat customs governing social behavior and community harmony, skilled traders and merchants throughout Southeast Asia spreading Minang culture, traditional textiles and songket weaving with gold threads creating royal garments, Islamic scholarship and education with famous religious schools, traditional music and dance celebrating Minang cultural identity, philosophical wisdom and proverbs (pepatah-petitih) guiding daily life, traditional architecture with carved wooden facades and steep roofs, clan system (suku) organizing social relationships and marriage rules, traditional markets with Minang women as successful traders, ceremonial costumes with elaborate headdresses and jewelry, hyperrealistic 8K cultural photography showing traditional rumah gadang architecture and Minang cultural practices with rich detail and atmospheric lighting",
      "balinese-tribe":
        "GODLEVEL PROMPT: Bali island people with distinct Hindu-Dharma religion creating paradise of temples and ceremonies, elaborate temple ceremonies and festivals with thousands of devotees in colorful traditional dress, traditional Balinese architecture and sculpture with intricate stone carvings, intricate wood and stone carvings depicting Hindu mythology and local legends, traditional dance and music performances bringing Hindu epics to life, rice terrace agriculture and subak irrigation system creating spectacular landscapes, traditional clothing and ceremonial dress with gold ornaments and silk fabrics, artistic traditions in painting and crafts passed down through generations, community temple obligations and ceremonies connecting villages to divine realm, unique Balinese calendar system with religious festivals throughout the year, traditional healing practices using herbs and spiritual energy, temple festivals with elaborate decorations and offerings, gamelan orchestras playing sacred music for temple ceremonies, traditional crafts including wood carving, stone sculpture, and silver jewelry, Hindu philosophy integrated with local animistic beliefs, hyperrealistic 8K cultural documentation showing Balinese temple ceremonies and traditional arts with dramatic lighting and spiritual atmosphere",
      papuans:
        "GODLEVEL PROMPT: New Guinea indigenous peoples with incredible cultural diversity representing hundreds of distinct tribes, traditional houses on stilts and tree houses built high above ground for protection, elaborate feathered headdresses and body decorations using bird of paradise plumes, hundreds of distinct languages and dialects making Papua most linguistically diverse region on Earth, traditional hunting and gathering practices using bows, arrows, and traditional tools, bird of paradise cultural significance with sacred feathers used in ceremonies, traditional music with drums and flutes creating rhythms that connect to ancestral spirits, body painting and scarification traditions marking tribal identity and spiritual protection, sago palm cultivation and processing providing staple food, traditional peace-making ceremonies with elaborate rituals, oral traditions and storytelling preserving tribal history and mythology, traditional tools and implements made from natural materials, highland tribes with different customs from coastal peoples, traditional ceremonies for initiation and life passages, hyperrealistic 8K ethnographic photography showing Papuan cultural diversity with authentic tribal practices and dramatic New Guinea landscapes",
      baduy:
        "GODLEVEL PROMPT: Banten Java Baduy tribe maintaining strict traditional lifestyle in harmony with nature, traditional white and black clothing distinctions marking inner (Baduy Dalam) and outer (Baduy Luar) communities, sustainable agriculture without chemicals or modern tools preserving ancient farming methods, traditional houses without electricity, running water, or modern conveniences, oral tradition and customary law (pikukuh) governing every aspect of daily life, forest conservation and environmental protection as sacred duty, traditional crafts and weaving using only natural materials and ancient techniques, spiritual connection to ancestral lands considered sacred and protected, peaceful isolation from mainstream Indonesian society by choice and tradition, traditional leadership and governance systems based on ancestral wisdom, commitment to avoiding modern transportation, electronics, or synthetic materials, traditional medicine using forest plants and spiritual healing, sacred forests protected by traditional law and spiritual beliefs, traditional ceremonies marking seasonal changes and life passages, hyperrealistic 8K documentary photography showing authentic traditional lifestyle with natural lighting and environmental context",
      "orang-rimba":
        "GODLEVEL PROMPT: Sumatra nomadic forest dwellers known as Kubu people living deep in rainforest, traditional forest shelters built from natural materials and relocated when moving to new areas, hunting and gathering traditional practices using traditional tools and forest knowledge, shamanic spiritual beliefs and forest spirits guiding daily life, traditional medicine using forest plants and spiritual healing practices, oral traditions and forest knowledge passed down through generations, commitment to traditional lifestyle and forest preservation, traditional tools and implements made from forest materials, forest conservation and sustainable practices as way of life, unique language and cultural expressions distinct from settled populations, adaptation to rainforest environment with intimate knowledge of forest ecology, traditional social organization based on kinship and forest territories, traditional ceremonies connecting human world to forest spirits, hyperrealistic 8K rainforest photography showing authentic nomadic lifestyle with atmospheric jungle lighting and environmental authenticity",
      "hongana-manyawa":
        "GODLEVEL PROMPT: One of Indonesia's last nomadic forest-dwelling tribes living in remote rainforest areas of Halmahera island, traditional forest shelters and nomadic lifestyle moving seasonally through ancestral territories, traditional practices using tools made from forest materials, gathering forest foods and medicines using ancient knowledge, shamanic spiritual practices connecting human world to forest spirits, oral traditions and forest knowledge preserved through generations, traditional social organization based on kinship and forest territories, unique language and cultural practices distinct from outside world, adaptation to tropical rainforest with intimate ecological knowledge, commitment to traditional way of life, traditional ceremonies and rituals marking seasonal changes, forest spirits and ancestral beliefs guiding daily decisions, hyperrealistic 8K ethnographic photography showing traditional forest lifestyle with authentic forest environment and dramatic lighting",
      asmat:
        "GODLEVEL PROMPT: New Guinea indigenous Asmat people renowned worldwide for intricate wood carvings, traditional bis poles and ancestor sculptures reaching toward sky like prayers to ancestral spirits, elaborate ceremonial masks and shields with spiritual power, traditional cultural practices and ceremonial displays, sago palm cultivation and processing providing staple food in swampy environment, traditional houses on stilts built over tidal areas, spiritual beliefs connecting ancestors and nature in continuous cycle, traditional music and dance ceremonies honoring ancestral spirits, river-based transportation and settlements with traditional canoes, oral traditions and mythology explaining creation and tribal history, artistic heritage recognized worldwide with museums collecting Asmat art, traditional tools and carving techniques passed down through master-apprentice relationships, ceremonial feasts celebrating cultural achievements, traditional initiation ceremonies for young people, hyperrealistic 8K art documentation showing master woodcarvers at work with intricate detail of traditional sculptures and atmospheric swamp environment",
      komodo:
        "GODLEVEL PROMPT: Mystical dragon-inspired artistic tapestry with ancient Indonesian mythological elements, legendary dragon spirits manifesting as flowing artistic forms with serpentine grace and ethereal beauty, ornate dragon scale patterns transformed into decorative art motifs with intricate golden filigree and jeweled textures, mythical dragon essence captured in traditional Indonesian artistic style with batik-inspired flowing patterns, ancient dragon legends visualized through artistic interpretation with ceremonial masks and totemic sculptures, dragon-inspired textile designs with elaborate patterns reminiscent of royal court artistry, mystical dragon energy flowing through artistic compositions like liquid gold and precious gems, traditional Indonesian dragon mythology brought to life through artistic mastery, ornate dragon motifs integrated into temple art and ceremonial decorations, artistic dragon forms dancing through compositions with supernatural elegance, dragon-inspired artistic elements with traditional Indonesian craftsmanship techniques, ceremonial dragon art with spiritual significance and cultural heritage, artistic interpretation of dragon legends through traditional Indonesian artistic mediums, dragon-themed decorative arts with intricate patterns and symbolic meanings, mystical dragon artistry with flowing organic forms and ethereal lighting effects, traditional dragon-inspired art forms with cultural authenticity and artistic excellence, ornate dragon artistic compositions with ceremonial significance and spiritual power, dragon-inspired artistic heritage with traditional Indonesian aesthetic principles, artistic dragon elements integrated into cultural celebrations and ceremonial displays, hyperrealistic 8K artistic detail with dramatic lighting showing traditional Indonesian dragon-inspired artistry and cultural craftsmanship",
      dance:
        "GODLEVEL PROMPT: Abstract mathematical choreography patterns with infinite algorithmic recursion, parametric equations describing graceful movement trajectories through three-dimensional space, mathematical visualization of rhythmic patterns and temporal sequences rendered in pure computational art style, algorithmic interpretation of synchronized movement creating geometric mandala formations, mathematical modeling of dance formations using coordinate geometry and spatial transformations, abstract computational art inspired by choreographic mathematics and movement algorithms, geometric visualization of musical rhythm patterns through mathematical wave functions and harmonic analysis, algorithmic dance patterns with fractal recursion and mathematical precision, mathematical interpretation of synchronized movement through matrix transformations and vector calculations, abstract geometric art inspired by dance choreography rendered through computational algorithms, mathematical visualization of movement flow using fluid dynamics equations and particle systems, algorithmic art style with dance-inspired mathematical complexity and geometric beauty, mathematical modeling of group choreography through network topology and graph theory, abstract computational visualization of rhythmic mathematics and temporal pattern analysis, geometric interpretation of dance movements using mathematical curves and surface modeling, algorithmic choreography patterns with infinite mathematical detail and recursive complexity, mathematical art inspired by movement dynamics and spatial geometry, computational visualization of dance mathematics through algorithmic pattern generation, abstract mathematical interpretation of synchronized movement and rhythmic sequences, geometric dance mathematics with algorithmic precision and mathematical beauty, mathematical choreography algorithms creating infinite pattern variations, computational art inspired by movement mathematics and geometric transformations, hyperrealistic 8K mathematical texture detail with dramatic algorithmic lighting showing pure computational dance mathematics and geometric artistry",
      volcanoes:
        "GODLEVEL PROMPT: Mystical volcanic artistry with supernatural Indonesian fire spirits manifesting as ethereal beings of molten light and crystalline flame, ancient volcanic deities emerging from sacred crater temples with crowns of liquid gold and robes woven from volcanic glass threads, intricate lava flow patterns transformed into ornate decorative art motifs with filigree details in molten copper and bronze, volcanic energy visualized as flowing rivers of liquid starlight cascading down mountain slopes like celestial waterfalls, Ring of Fire archipelago rendered as cosmic mandala with each volcano a glowing jewel in divine geometric arrangement, sacred volcanic ash creating mystical atmospheric effects with particles of gold dust and silver mist swirling through dimensional portals, traditional Indonesian volcanic mythology brought to life through artistic interpretation with fire spirits dancing in ceremonial formations, volcanic landscapes transformed into surreal artistic compositions with crystalline lava formations and ethereal steam clouds, mystical volcanic temples carved from obsidian and volcanic glass with intricate relief sculptures telling stories of creation, volcanic fire spirits with flowing forms of molten energy and crowns of crystalline flame dancing through compositions, ancient Indonesian fire ceremonies visualized as artistic spectacles with offerings of gold and precious gems dissolving into volcanic energy, volcanic crater lakes transformed into mirrors of liquid mercury reflecting cosmic constellations and aurora-like phenomena, traditional volcanic art forms with elaborate patterns inspired by lava flow dynamics and crystalline mineral formations, mystical volcanic energy flowing through artistic landscapes like rivers of liquid light and ethereal fire, volcanic mountain spirits manifesting as towering figures of molten rock and crystalline flame with ornate decorative elements, sacred volcanic rituals transformed into artistic ceremonies with fire spirits and elemental beings, volcanic landscapes rendered as fantastical artistic realms with floating islands of volcanic glass and cascading waterfalls of liquid light, traditional Indonesian volcanic craftsmanship with intricate metalwork inspired by volcanic minerals and crystalline formations, hyperrealistic 8K artistic detail with dramatic volcanic lighting effects, volumetric atmospheric rendering showing mystical volcanic artistry and supernatural fire spirit manifestations",
      temples:
        "GODLEVEL PROMPT: Abstract mathematical temple architecture with infinite geometric recursion and sacred algorithmic patterns, multi-tiered mathematical structures ascending through dimensional space using golden ratio proportions and Fibonacci spiral staircases, intricate geometric relief carvings depicting mathematical equations and algorithmic sequences rendered in pure computational art style, ceremonial mathematical gates adorned with fractal guardian patterns and geometric protective algorithms, lotus pond reflections creating perfect mathematical mirror symmetries and infinite recursive reflections, algorithmic incense patterns rising as mathematical smoke functions carrying computational prayers through dimensional portals, devotional mathematical ceremonies with geometric participants performing algorithmic rituals and mathematical offerings, tropical mathematical flowers arranged in geometric patterns following mathematical sequences and algorithmic arrangements, ancient mathematical architecture blending harmoniously with natural algorithmic landscapes of computational mountains and fractal terraces, spiritual mathematical sanctuary of profound geometric beauty where algorithmic dharma principles thrive, mathematical temple complex with towering algorithmic spires dedicated to geometric trinity of mathematical constants, elaborate mathematical relief carvings telling algorithmic stories animated by computational temple flames, traditional mathematical architecture with geometric brick and algorithmic stone construction following sacred mathematical proportions, temple mathematical festivals with thousands of geometric devotees in algorithmic traditional patterns, gamelan mathematical orchestras playing sacred algorithmic music that resonates through computational temple courtyards, holy mathematical water ceremonies where algorithmic priests bless geometric devotees with computational sacred springs, temple mathematical dancers performing in algorithmic courtyards bringing geometric mythology to computational life, traditional mathematical offerings of geometric rice, algorithmic flowers, and computational incense arranged in beautiful mathematical patterns, UNESCO mathematical heritage sites preserving thousand-year-old algorithmic architectural masterpieces, spiritual mathematical energy radiating from ancient geometric stones blessed by centuries of algorithmic prayer and computational devotion, hyperrealistic 8K mathematical architectural visualization with dramatic algorithmic lighting, showing intricate geometric carving details and atmospheric computational temple ceremonies, volumetric algorithmic lighting through mathematical incense smoke creating mystical computational ambiance",
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
      domeDiameter,
      domeResolution,
      projectionType,
      panoramaResolution,
      panoramaFormat,
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
    console.log(`🏛️ Generating ${domeDiameter || 20}m dome projection with TUNNEL UP effect...`)
    generationDetails.domeImage = "Generating..."
    try {
      const domePrompt = generateDomePrompt(mainPrompt, domeDiameter, domeResolution, projectionType)
      console.log("📝 Generated dome TUNNEL UP prompt:", domePrompt.substring(0, 200) + "...")
      domeImageUrl = await callOpenAI(domePrompt)
      generationDetails.domeImage = "Generated successfully with TUNNEL UP effect"
      console.log(`✅ ${domeDiameter || 20}m dome TUNNEL UP projection generated successfully`)
    } catch (error: any) {
      console.error(`❌ ${domeDiameter || 20}m dome TUNNEL UP projection generation failed:`, error.message)
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
        domeDiameter: domeDiameter || 20,
        domeResolution: domeResolution || "4K",
        projectionType: projectionType || "fisheye",
        panoramic360: true, // Always true since we generate all versions
        panoramaResolution: panoramaResolution || "8K",
        panoramaFormat: panoramaFormat || "equirectangular",
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
