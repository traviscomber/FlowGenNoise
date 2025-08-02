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
    horror: "Indonesian supernatural creatures, mystical horror elements, traditional folklore monsters",
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
        "GODLEVEL PROMPT: Majestic Garuda Wisnu Kencana soaring through celestial realms, massive divine eagle with wingspan stretching across golden sunset skies, intricate feather details shimmering with ethereal light, powerful talons gripping sacred lotus blossoms radiating divine energy, noble eagle head crowned with jeweled diadem of ancient Javanese kings, eyes blazing with cosmic wisdom and protective fury, Lord Vishnu mounted majestically upon Garuda's back in full divine regalia with four arms holding sacred conch shell, discus wheel of time, lotus of creation, and mace of justice, flowing silk garments in royal blues and golds dancing in celestial winds, Mount Meru rising in background with cascading waterfalls of liquid starlight, temple spires piercing through clouds of incense and prayers, Indonesian archipelago spread below like scattered emeralds in sapphire seas, Ring of Fire volcanoes glowing with sacred flames, traditional gamelan music visualized as golden sound waves rippling through dimensions, ancient Sanskrit mantras floating as luminous script in the air, Ramayana epic scenes carved into floating stone tablets, divine aura radiating rainbow light spectrum, cosmic mandala patterns swirling in the heavens, 17,508 islands of Indonesia visible as points of light below, Borobudur and Prambanan temples glowing with spiritual energy, traditional Indonesian textiles patterns woven into the very fabric of reality, hyperrealistic 8K cinematic masterpiece with volumetric lighting and particle effects",
      wayang:
        "GODLEVEL PROMPT: Mystical Wayang Kulit shadow puppet performance bringing ancient Ramayana and Mahabharata epics to life, master dalang puppeteer silhouetted behind glowing white screen with hundreds of intricately carved leather puppets, each puppet a masterwork of perforated artistry with gold leaf details catching flickering oil lamp light, dramatic shadows dancing and morphing into living characters, Prince Rama with perfect noble features and ornate crown battling ten-headed demon king Ravana whose multiple faces show rage, cunning, and supernatural power, beautiful Princess Sita with flowing hair and delicate jewelry radiating purity and grace, mighty Hanuman the white monkey warrior leaping through air with mountain in his grasp, gamelan orchestra of bronze instruments creating visible sound waves in metallic gold and silver, traditional Indonesian musicians in batik clothing playing gender, saron, and kendang drums, audience of villagers sitting cross-legged on woven mats mesmerized by the eternal stories, coconut oil lamps casting warm amber light creating multiple layers of shadows, ancient Javanese script floating in the air telling the story, tropical night sky filled with stars and flying spirits, traditional Javanese architecture with carved wooden pillars and clay tile roofs, incense smoke curling upward carrying prayers to ancestors, banana leaves and frangipani flowers as offerings, cultural heritage spanning over 1000 years visualized as golden threads connecting past to present, UNESCO World Heritage artistic tradition, hyperrealistic cinematic lighting with deep shadows and warm highlights, 8K resolution with intricate puppet details and atmospheric effects",
      batik:
        "GODLEVEL PROMPT: Infinite cosmic tapestry of sacred Indonesian batik patterns coming alive with supernatural energy, master batik artisan's hands applying hot wax with traditional canting tool creating flowing lines that transform into living rivers of light, parang rusak diagonal patterns representing flowing water and eternal life force undulating like ocean waves, kawung geometric circles symbolizing cosmic order expanding into mandala formations that pulse with universal rhythm, mega mendung cloud motifs in deep indigo blues swirling with actual storm clouds and lightning, ceplok star formations bursting into real constellations in the night sky, sido mukti prosperity symbols manifesting as golden coins and rice grains falling like blessed rain, royal court designs with protective meanings creating shields of light around ancient Javanese palaces, intricate hand-drawn patterns using traditional canting tools guided by ancestral spirits, natural dyes from indigo plants, turmeric roots, and mahogany bark creating earth tones that shift and change like living skin, cultural identity woven into fabric of reality itself, UNESCO heritage craft mastery passed down through generations of royal court artisans, each pattern telling stories of creation myths and heroic legends, textile becoming portal to spiritual realm where ancestors dance in eternal celebration, traditional Javanese philosophy of harmony between human, nature, and divine visualized as interconnected geometric patterns, workshop filled with clay pots of dye, bamboo tools, and cotton fabric stretched on wooden frames, tropical sunlight filtering through palm leaves creating natural batik shadows on the ground, master craftswomen in traditional kebaya clothing working with meditative focus, the very air shimmering with creative energy and cultural pride, hyperrealistic 8K detail showing every wax crack and dye gradient, volumetric lighting and particle effects bringing ancient art form to supernatural life",
      borobudur:
        "GODLEVEL PROMPT: Magnificent Borobudur temple rising from misty Javanese plains like a massive stone mandala connecting earth to heaven, world's largest Buddhist monument glowing with golden sunrise light, 2,672 relief panels carved into volcanic stone coming alive with animated scenes of Buddha's teachings and Jataka tales, 504 Buddha statues in perfect meditation poses each radiating serene enlightenment energy, bell-shaped stupas containing hidden Buddha figures emerging from stone like lotus flowers blooming, three circular platforms representing Buddhist cosmology - Kamadhatu (world of desire), Rupadhatu (world of forms), and Arupadhatu (formless world) - each level glowing with different colored auras, pilgrims in white robes walking clockwise path to enlightenment leaving trails of golden light, ancient stones weathered by centuries telling stories of devotion and spiritual seeking, sunrise illuminating the monument with divine radiance while Mount Merapi volcano smokes majestically in background, largest Buddhist temple complex in the world surrounded by lush tropical jungle and rice paddies, architectural marvel embodying spiritual journey from earthly desires to nirvana visualized as ascending spirals of light, Sailendra dynasty builders' vision manifested in perfect sacred geometry, each stone block precisely placed according to cosmic principles, relief carvings depicting Prince Siddhartha's path to becoming Buddha animated with supernatural life, celestial beings and bodhisattvas floating around the temple in meditation, traditional Javanese gamelan music resonating from the stones themselves, incense smoke from countless offerings creating mystical atmosphere, UNESCO World Heritage site protected by guardian spirits, morning mist revealing and concealing the temple like a divine revelation, pilgrims from around the world climbing the sacred steps in spiritual pilgrimage, ancient wisdom carved in stone speaking across centuries, hyperrealistic 8K cinematic masterpiece with volumetric lighting, atmospheric effects, and spiritual energy visualization",
      komodo:
        "GODLEVEL PROMPT: Prehistoric Komodo dragons prowling volcanic islands of Flores and Rinca like living dinosaurs from ancient times, largest living lizards on Earth with massive muscular bodies reaching 10 feet in length, powerful jaws capable of delivering venomous bite that can fell water buffalo, ancient survivors from age of dinosaurs when giants ruled the earth, scaly armor-like skin glistening in tropical Indonesian sun with patterns resembling ancient dragon mythology, forked tongues flicking out to taste air for prey scents carried on ocean winds, muscular tails thick as tree trunks and razor-sharp claws that can tear through flesh and bone, endemic to Indonesian archipelago representing untamed wilderness and primal power, living legends of Flores and Rinca islands where local villagers call them 'ora' and tell stories of dragon spirits, conservation symbols representing battle between modern world and ancient nature, mystical connection to dragon mythology of Asian cultures, volcanic landscape of Komodo National Park with rugged hills and savanna grasslands, pink sand beaches where dragons hunt for carrion washed ashore, deer and wild boar fleeing in terror from apex predators, traditional Indonesian fishing boats anchored in crystal blue waters, park rangers in khaki uniforms observing from safe distance, tourists on guided tours witnessing living prehistory, UNESCO World Heritage marine park protecting both dragons and coral reefs, Ring of Fire volcanic activity creating dramatic landscape, traditional Indonesian villages where locals have coexisted with dragons for centuries, ancient folklore and legends about dragon kings and serpent deities, scientific research revealing secrets of dragon evolution and survival, hyperrealistic 8K wildlife cinematography with dramatic lighting, showing every scale detail and predatory movement, atmospheric volcanic landscape with mist and dramatic skies",
      dance:
        "GODLEVEL PROMPT: Graceful Balinese Legong dancers in elaborate golden costumes performing ancient court dance with supernatural elegance, intricate headdresses adorned with fresh frangipani flowers and golden ornaments catching temple lamplight, precise mudra hand gestures telling stories of gods and demons through sacred choreography passed down through centuries, gamelan orchestra creating hypnotic metallic rhythms that seem to control the dancers' movements like divine puppetry, Javanese court dances with refined elegance performed in royal palaces with dancers moving like living sculptures, Saman dance from Aceh with dozens of male dancers in perfect synchronization creating human mandala patterns, colorful silk fabrics flowing with each gesture like liquid rainbows, spiritual devotion expressed through movement connecting earthly realm to divine consciousness, cultural storytelling through choreographed artistry where every gesture has deep meaning, temple ceremonies coming alive with dancers embodying Hindu deities and mythological characters, traditional Indonesian music visualized as golden sound waves guiding the performers, elaborate makeup and costumes transforming dancers into living gods and goddesses, incense smoke swirling around performers creating mystical atmosphere, tropical temple courtyards with carved stone pillars and lotus ponds reflecting the dance, audiences of devotees and tourists mesmerized by ancient artistry, UNESCO Intangible Cultural Heritage performances preserving thousand-year-old traditions, master dance teachers passing knowledge to young students in sacred guru-disciple relationships, traditional Indonesian philosophy of harmony between body, mind, and spirit expressed through movement, hyperrealistic 8K cinematography capturing every graceful gesture and costume detail, volumetric lighting creating dramatic shadows and highlights, cultural pride and spiritual energy radiating from every performance",
      volcanoes:
        "GODLEVEL PROMPT: Majestic Mount Merapi smoking against dawn sky like sleeping dragon breathing fire, most active volcano in Indonesia with glowing lava flows creating rivers of molten rock, terraced rice fields cascading down volcanic slopes in perfect geometric patterns reflecting golden sunrise, Mount Bromo crater lake reflecting morning light like mirror of the gods surrounded by sea of sand and ancient caldera walls, sacred Mount Agung towering over Balinese temples as spiritual axis of the island where gods reside, volcanic ash creating fertile soil that feeds millions of Indonesians across the archipelago, traditional offerings of flowers and rice placed at crater edges by local villagers seeking protection from volcanic spirits, spiritual beliefs connecting mountains to divine realm where ancestors watch over their descendants, Ring of Fire geological power with 130 active volcanoes forming backbone of Indonesian islands, lush tropical vegetation thriving on mineral-rich volcanic slopes creating emerald green landscapes, cultural reverence for volcanic forces as both destroyer and creator of life, traditional Indonesian villages built on volcanic slopes where people have learned to live with constant geological activity, Mount Krakatoa's legendary 1883 eruption that was heard around the world, sulfur miners working in dangerous conditions at Kawah Ijen volcano with blue flames of burning sulfur creating otherworldly scenes, volcanic hot springs and geysers creating natural spas where locals bathe in healing mineral waters, traditional ceremonies to appease volcano spirits with elaborate rituals and offerings, scientific monitoring stations tracking seismic activity and gas emissions, dramatic volcanic sunsets with ash clouds creating spectacular colors across Indonesian skies, hyperrealistic 8K landscape photography with dramatic lighting, showing raw geological power and human adaptation, atmospheric effects with volcanic smoke and ash, cultural integration of volcanic forces into daily Indonesian life",
      temples:
        "GODLEVEL PROMPT: Ornate Pura Besakih mother temple complex on Mount Agung slopes rising like stairway to heaven, multi-tiered meru towers reaching toward heavens with each level representing different spiritual realm, intricate stone carvings depicting mythological scenes from Ramayana and Mahabharata coming alive with supernatural energy, ceremonial gates adorned with guardian statues of fierce demons and protective deities, lotus ponds reflecting temple spires creating perfect mirror images, incense smoke rising from prayer altars carrying devotees' prayers to divine realm, devotees in white ceremonial dress performing daily rituals and offerings, tropical flowers as offerings - frangipani, hibiscus, and marigolds creating colorful carpets, ancient architecture blending harmoniously with natural landscape of volcanic mountains and rice terraces, spiritual sanctuary of profound beauty where Hindu-Dharma religion thrives, Prambanan temple complex with towering spires dedicated to Hindu trinity of Brahma, Vishnu, and Shiva, elaborate relief carvings telling epic stories animated by flickering temple flames, traditional Balinese architecture with red brick and volcanic stone construction, temple festivals with thousands of devotees in colorful traditional dress, gamelan orchestras playing sacred music that resonates through temple courtyards, holy water ceremonies where priests bless devotees with tirta from sacred springs, temple dancers performing in temple courtyards bringing Hindu mythology to life, traditional offerings of rice, flowers, and incense arranged in beautiful geometric patterns, UNESCO World Heritage sites preserving thousand-year-old architectural masterpieces, spiritual energy radiating from ancient stones blessed by centuries of prayer and devotion, hyperrealistic 8K architectural photography with dramatic lighting, showing intricate stone carving details and atmospheric temple ceremonies, volumetric lighting through incense smoke creating mystical ambiance",
      // Enhanced Major Indigenous Groups with GODLEVEL prompts
      javanese:
        "GODLEVEL PROMPT: Magnificent Javanese royal court of Yogyakarta Sultan's palace with refined traditions spanning centuries, elaborate batik patterns with philosophical meanings covering silk garments of court nobles, gamelan orchestras creating meditative soundscapes with bronze instruments that seem to channel ancestral spirits, traditional Javanese architecture with joglo roofs and carved wooden pillars telling stories of ancient kingdoms, shadow puppet wayang performances in royal courtyards where dalang masters weave epic tales of gods and heroes, ancient Hindu-Buddhist influences merged seamlessly with Islamic culture creating unique Javanese synthesis, terraced rice cultivation creating geometric patterns across volcanic landscapes, traditional ceremonies and rituals connecting living descendants to royal ancestors, sophisticated artistic heritage spanning centuries with court painters, musicians, and craftsmen, Sultan's palace (Kraton) with its sacred layout representing cosmic order, traditional Javanese philosophy of harmony and balance expressed in daily life, court dancers in elaborate costumes performing sacred dances, royal gamelan sets made of bronze and gold creating music for the gods, traditional Javanese script and literature preserving ancient wisdom, ceremonial keris daggers with mystical powers passed down through generations, traditional medicine and healing practices using herbs and spiritual energy, hyperrealistic 8K cultural documentation with rich details of court life and artistic traditions",
      sundanese:
        "GODLEVEL PROMPT: West Java's indigenous Sundanese people with distinct cultural identity thriving in mountainous terrain, traditional bamboo architecture with elevated houses on stilts protecting from floods and wild animals, angklung bamboo musical instruments creating harmonious melodies that echo through mountain valleys, traditional Sundanese dance performances with graceful movements inspired by nature, rice cultivation in mountainous terrain creating spectacular terraced landscapes, unique culinary traditions with fresh vegetables and fish from mountain streams, traditional clothing and textiles with intricate patterns and natural dyes, ancient animistic beliefs blended seamlessly with Islam creating unique spiritual practices, community cooperation gotong royong traditions where entire villages work together, highland agricultural practices adapted to volcanic soil and mountain climate, traditional houses with steep roofs and bamboo walls designed for mountain weather, Sundanese language with its own script and literature, traditional crafts including bamboo weaving and wood carving, mountain festivals celebrating harvest and seasonal changes, traditional healing practices using mountain herbs and spiritual rituals, hyperrealistic 8K documentation of highland culture with dramatic mountain landscapes and traditional architecture",
      batak:
        "GODLEVEL PROMPT: North Sumatra highland Batak people with distinctive architecture around magnificent Lake Toba, traditional Batak houses with dramatic curved roofs resembling buffalo horns reaching toward sky, intricate wood carvings and decorative elements telling clan histories and spiritual beliefs, traditional ulos textiles with sacred meanings woven by master craftswomen, patrilineal clan system and ancestral worship connecting living descendants to powerful spirits, Lake Toba cultural landscape with world's largest volcanic lake surrounded by traditional villages, traditional music with gondang instruments creating rhythms that summon ancestral spirits, stone megalithic monuments erected by ancient Batak kings, ancient Batak script and literature preserving oral traditions, ceremonial feasts and rituals celebrating life passages and clan unity, warrior traditions and oral histories of battles and heroic deeds, traditional Batak architecture with houses built without nails using ancient joinery techniques, clan totems and symbols carved into house facades, traditional ceremonies for naming, marriage, and death with elaborate rituals, Batak Christian churches blending traditional architecture with Christian symbolism, hyperrealistic 8K cultural photography showing traditional architecture and Lake Toba landscape with dramatic lighting and atmospheric effects",
      dayak:
        "GODLEVEL PROMPT: Indigenous Dayak peoples of Kalimantan Borneo with diverse sub-groups living in harmony with rainforest, traditional longhouses accommodating extended families with communal living spaces stretching hundreds of feet, intricate beadwork and traditional costumes with patterns representing clan identity and spiritual protection, headhunting historical traditions with trophy skulls displayed in longhouse rafters, river-based transportation and settlements with traditional boats navigating jungle waterways, traditional tattoos with spiritual significance covering warriors' bodies with protective symbols, hornbill bird cultural symbolism with sacred feathers used in ceremonies, forest-based lifestyle and hunting practices using blowguns and traditional traps, shamanic traditions and spiritual beliefs connecting human world to forest spirits, traditional crafts and woodcarving creating masks and totems, oral traditions and folklore passed down through generations, traditional medicine using rainforest plants and spiritual healing, longhouse architecture built on stilts with communal verandas, traditional ceremonies for rice planting and harvest, warrior culture with elaborate shields and weapons, hyperrealistic 8K rainforest photography showing traditional longhouses and Dayak cultural practices with atmospheric jungle lighting",
      acehnese:
        "GODLEVEL PROMPT: Northernmost Sumatra Acehnese province with strong Islamic identity and proud independence tradition, traditional Acehnese architecture with Islamic influences showing Middle Eastern and local fusion, distinctive cultural practices and ceremonies blending Islamic faith with local customs, traditional Saman dance performances with dozens of dancers in perfect synchronization, coffee cultivation and trade traditions making Aceh famous for premium coffee beans, tsunami resilience and community strength shown in 2004 disaster recovery, traditional clothing and textiles with Islamic geometric patterns, Islamic educational institutions (dayah) preserving religious knowledge, maritime trading heritage with traditional boats and fishing techniques, unique Acehnese dialect and language distinct from other Indonesian languages, traditional crafts and metalwork creating Islamic calligraphy and decorative arts, Grand Mosque of Baiturrahman with black domes and minarets, traditional Acehnese houses with steep roofs and Islamic architectural elements, Islamic law (Sharia) implementation in daily life, traditional ceremonies for Islamic holidays and life passages, hyperrealistic 8K cultural documentation showing Islamic architecture and Acehnese traditions with dramatic lighting and cultural authenticity",
      minangkabau:
        "GODLEVEL PROMPT: West Sumatra Minangkabau people with unique matrilineal social structure where women hold property and family lineage, distinctive rumah gadang houses with dramatic horn-shaped roofs resembling buffalo horns reaching toward sky, traditional Minang cuisine and culinary heritage famous throughout Indonesia and Malaysia, matriarchal inheritance and family systems where mothers pass property to daughters, traditional ceremonies and adat customs governing social behavior and community harmony, skilled traders and merchants throughout Southeast Asia spreading Minang culture, traditional textiles and songket weaving with gold threads creating royal garments, Islamic scholarship and education with famous religious schools, traditional music and dance celebrating Minang cultural identity, philosophical wisdom and proverbs (pepatah-petitih) guiding daily life, traditional architecture with carved wooden facades and steep roofs, clan system (suku) organizing social relationships and marriage rules, traditional markets with Minang women as successful traders, ceremonial costumes with elaborate headdresses and jewelry, hyperrealistic 8K cultural photography showing traditional rumah gadang architecture and Minang cultural practices with rich detail and atmospheric lighting",
      "balinese-tribe":
        "GODLEVEL PROMPT: Bali island people with distinct Hindu-Dharma religion creating paradise of temples and ceremonies, elaborate temple ceremonies and festivals with thousands of devotees in colorful traditional dress, traditional Balinese architecture and sculpture with intricate stone carvings, intricate wood and stone carvings depicting Hindu mythology and local legends, traditional dance and music performances bringing Hindu epics to life, rice terrace agriculture and subak irrigation system creating spectacular landscapes, traditional clothing and ceremonial dress with gold ornaments and silk fabrics, artistic traditions in painting and crafts passed down through generations, community temple obligations and ceremonies connecting villages to divine realm, unique Balinese calendar system with religious festivals throughout the year, traditional healing practices using herbs and spiritual energy, temple festivals with elaborate decorations and offerings, gamelan orchestras playing sacred music for temple ceremonies, traditional crafts including wood carving, stone sculpture, and silver jewelry, Hindu philosophy integrated with local animistic beliefs, hyperrealistic 8K cultural documentation showing Balinese temple ceremonies and traditional arts with dramatic lighting and spiritual atmosphere",
      papuans:
        "GODLEVEL PROMPT: New Guinea indigenous peoples with incredible cultural diversity representing hundreds of distinct tribes, traditional houses on stilts and tree houses built high above ground for protection, elaborate feathered headdresses and body decorations using bird of paradise plumes, hundreds of distinct languages and dialects making Papua most linguistically diverse region on Earth, traditional hunting and gathering practices using bows, arrows, and traditional traps, bird of paradise cultural significance with sacred feathers used in ceremonies, traditional music with drums and flutes creating rhythms that connect to ancestral spirits, body painting and scarification traditions marking tribal identity and spiritual protection, sago palm cultivation and processing providing staple food, tribal warfare and peace-making ceremonies with elaborate rituals, oral traditions and storytelling preserving tribal history and mythology, traditional tools and weapons made from stone, bone, and wood, highland tribes with different customs from coastal peoples, traditional ceremonies for initiation and life passages, hyperrealistic 8K ethnographic photography showing Papuan cultural diversity with authentic tribal practices and dramatic New Guinea landscapes",
      // Enhanced Unique Indigenous Communities
      baduy:
        "GODLEVEL PROMPT: Banten Java Baduy tribe maintaining strict traditional lifestyle in complete rejection of modern world, traditional white and black clothing distinctions marking inner (Baduy Dalam) and outer (Baduy Luar) communities, sustainable agriculture without chemicals or modern tools preserving ancient farming methods, traditional houses without electricity, running water, or modern conveniences, oral tradition and customary law (pikukuh) governing every aspect of daily life, forest conservation and environmental protection as sacred duty, traditional crafts and weaving using only natural materials and ancient techniques, spiritual connection to ancestral lands considered sacred and protected, isolation from mainstream Indonesian society by choice and tradition, traditional leadership and governance systems based on ancestral wisdom, forbidden to use modern transportation, electronics, or synthetic materials, traditional medicine using forest plants and spiritual healing, sacred forests protected by traditional law and spiritual beliefs, traditional ceremonies marking seasonal changes and life passages, hyperrealistic 8K documentary photography showing authentic traditional lifestyle with natural lighting and environmental context",
      "orang-rimba":
        "GODLEVEL PROMPT: Sumatra nomadic hunter-gatherers known as Kubu people living deep in rainforest, traditional forest shelters built from natural materials and abandoned when moving to new areas, hunting and gathering traditional practices using blowguns and forest knowledge, shamanic spiritual beliefs and forest spirits guiding daily life, traditional medicine using forest plants and spiritual healing practices, oral traditions and forest knowledge passed down through generations, resistance to sedentarization and modernization to preserve traditional lifestyle, traditional tools and hunting weapons made from forest materials, forest conservation and sustainable practices as way of life, unique language and cultural expressions distinct from settled populations, adaptation to rainforest environment with intimate knowledge of forest ecology, traditional social organization based on kinship and forest territories, threatened by deforestation and palm oil plantations, traditional ceremonies connecting human world to forest spirits, hyperrealistic 8K rainforest photography showing authentic nomadic lifestyle with atmospheric jungle lighting and environmental authenticity",
      "hongana-manyawa":
        "GODLEVEL PROMPT: One of Indonesia's last nomadic hunter-gatherer tribes living in remote rainforest areas of Halmahera island, traditional forest shelters and nomadic lifestyle moving seasonally through ancestral territories, hunting with traditional weapons and tools made from forest materials, gathering forest foods and medicines using ancient knowledge, shamanic spiritual practices connecting human world to forest spirits, oral traditions and forest knowledge threatened by outside contact, threatened by deforestation and mining destroying ancestral lands, traditional social organization based on kinship and forest territories, unique language and cultural practices distinct from outside world, adaptation to tropical rainforest with intimate ecological knowledge, resistance to outside contact to preserve traditional way of life, traditional ceremonies and rituals marking seasonal changes, forest spirits and ancestral beliefs guiding daily decisions, hyperrealistic 8K ethnographic photography showing last remnants of stone age lifestyle with authentic forest environment and dramatic lighting",
      asmat:
        "GODLEVEL PROMPT: New Guinea indigenous Asmat people renowned worldwide for intricate wood carvings, traditional bis poles and ancestor sculptures reaching toward sky like prayers to ancestral spirits, elaborate ceremonial masks and shields with supernatural power, headhunting historical traditions with trophy skulls displayed in men's houses, sago palm cultivation and processing providing staple food in swampy environment, traditional houses on stilts built over tidal swamps, spiritual beliefs connecting ancestors and nature in continuous cycle, traditional music and dance ceremonies summoning ancestral spirits, river-based transportation and settlements with traditional canoes, oral traditions and mythology explaining creation and tribal history, artistic heritage recognized worldwide with museums collecting Asmat art, traditional tools and carving techniques passed down through master-apprentice relationships, ceremonial feasts celebrating successful hunts and tribal victories, traditional initiation ceremonies for young warriors, hyperrealistic 8K art documentation showing master woodcarvers at work with intricate detail of traditional sculptures and atmospheric swamp environment",
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
    console.log("AI Art API called with body:", JSON.stringify(body, null, 2))

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
    console.log("Generated main prompt:", mainPrompt.substring(0, 200) + "...")

    let mainImageUrl: string
    let domeImageUrl: string
    let panoramaImageUrl: string
    const generationDetails: any = {}

    try {
      console.log("Generating main image...")
      mainImageUrl = await callOpenAI(mainPrompt)
      generationDetails.mainImage = "Generated successfully"
      console.log("✅ Main image generated successfully")
    } catch (error: any) {
      console.error("❌ Main image generation failed:", error)
      return NextResponse.json(
        { success: false, error: "Failed to generate main image: " + error.message },
        { status: 500 },
      )
    }

    // ALWAYS generate dome projection for complete set with TUNNEL UP effect
    console.log(`🏛️ Generating ${domeDiameter || 20}m dome projection with TUNNEL UP effect...`)
    generationDetails.domeImage = "Generating..."
    try {
      const domePrompt = generateDomePrompt(mainPrompt, domeDiameter, domeResolution, projectionType)
      console.log("Generated dome TUNNEL UP prompt:", domePrompt.substring(0, 200) + "...")
      domeImageUrl = await callOpenAI(domePrompt)
      generationDetails.domeImage = "Generated successfully with TUNNEL UP effect"
      console.log(`✅ ${domeDiameter || 20}m dome TUNNEL UP projection generated successfully`)
    } catch (error: any) {
      console.error(`❌ ${domeDiameter || 20}m dome TUNNEL UP projection generation failed:`, error)
      domeImageUrl = mainImageUrl // Use main image as fallback
      generationDetails.domeImage = "Using main image as fallback"
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
      console.log("Generated panorama prompt:", panoramaPrompt.substring(0, 200) + "...")
      panoramaImageUrl = await callOpenAI(panoramaPrompt)
      generationDetails.panoramaImage = "Generated successfully"
      console.log("✅ 360° panorama generated successfully")
    } catch (error: any) {
      console.error("❌ 360° panorama generation failed:", error)
      panoramaImageUrl = mainImageUrl // Use main image as fallback
      generationDetails.panoramaImage = "Using main image as fallback"
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
      },
      { status: 500 },
    )
  }
}
