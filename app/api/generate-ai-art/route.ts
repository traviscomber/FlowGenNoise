import { type NextRequest, NextResponse } from "next/server"
import {
  generateDomePrompt,
  generatePanoramaPrompt,
  generateImagesInParallel,
  generateSingleImageOnly,
  cleanPromptForImageGeneration,
} from "./utils"

function buildUltraSimplePrompt(dataset: string, scenario: string, colorScheme: string, customPrompt?: string): string {
  // Use custom prompt if provided
  if (customPrompt && customPrompt.trim()) {
    return cleanPromptForImageGeneration(`${customPrompt.trim()}, ${colorScheme} colors, detailed`)
  }

  // Ultra-simple dataset prompts
  const simpleDatasets: Record<string, string> = {
    nuanu: "Nuanu creative architecture",
    bali: "Balinese temples",
    thailand: "Thai temples",
    indonesian: "Indonesian culture",
    horror: "Indonesian mystical",
    spirals: "spiral patterns",
    fractal: "fractal art",
    mandelbrot: "Mandelbrot set",
    julia: "Julia fractals",
    lorenz: "Lorenz attractor",
    hyperbolic: "hyperbolic geometry",
    gaussian: "Gaussian fields",
    cellular: "cellular automata",
    voronoi: "Voronoi patterns",
    perlin: "Perlin noise",
    diffusion: "diffusion patterns",
    wave: "wave patterns",
    moons: "lunar mechanics",
    tribes: "tribal networks",
    heads: "mosaic heads",
    natives: "native tribes",
    statues: "sacred statues",
  }

  let prompt = simpleDatasets[dataset] || "abstract art"

  // Enhanced Indonesian Genesis Creation Story - Four Fundamental Elements
  if (dataset === "indonesian") {
    const scenarioPrompts: Record<string, string> = {
      pure: "geometric patterns",

      // WEEK 1: COSMOS - The Divine Beginning
      cosmos:
        "GODLEVEL PROMPT: Indonesian Genesis Cosmos Creation - The Divine Beginning of the Universe, Sang Hyang Widhi Wasa the Supreme Creator manifesting as brilliant cosmic consciousness expanding through infinite void, primordial cosmic egg Brahmanda splitting open releasing torrents of divine light and stardust, celestial realm Kahyangan emerging from cosmic waters with floating palaces of gold and crystal, Batara Guru Shiva dancing the cosmic dance of creation while wielding trident of universal power, cosmic serpent Ananta Sesha coiled around Mount Meru supporting the three worlds, divine cosmic wheel Chakra spinning with sacred geometries representing future Indonesian islands, cosmic tree Kalpataru growing from center of universe with branches reaching all dimensions, primordial cosmic sound OM AUM resonating through space-time creating vibrational frequencies that birth matter, cosmic mandala patterns expanding outward in perfect mathematical harmony with Sanskrit mantras written in starlight, celestial beings Dewata floating through cosmic realms playing divine gamelan orchestras that tune the fundamental frequencies of reality, cosmic lotus Padma blooming in the void with each petal containing entire galaxies and solar systems, divine cosmic breath Prana flowing as solar winds carrying life essence to future worlds, cosmic fire Agni burning in the heart of newborn stars forging the elements that will become Indonesian soil, primordial cosmic waters Apah swirling in spiral galaxies preparing to descend as sacred rivers and seas, cosmic time Kala beginning its eternal cycle with past present and future existing simultaneously, divine cosmic consciousness Atman awakening in every particle of matter preparing for the manifestation of Indonesian archipelago, hyperrealistic cosmic visualization with volumetric lighting and particle effects showing the birth of Indonesian universe",

      // WEEK 2: WATER - The Sacred Flowing Life Force
      water:
        "GODLEVEL PROMPT: Indonesian Genesis Water Creation - Sacred Flowing Life Force of the Archipelago, Dewi Sri goddess of water and fertility emerging from cosmic lotus with flowing hair that becomes rivers and streams, sacred Mount Meru releasing celestial waterfalls that cascade down through seven heavens creating the primordial oceans, Baruna ocean god riding massive sea turtle Kurma through endless blue depths while commanding tidal forces with conch shell trumpet, sacred springs Tirta emerging from earth blessed by Hindu priests with holy water ceremonies, traditional Indonesian water temples Pura Tirta with elaborate stone carvings and lotus ponds reflecting temple spires, ancient Subak irrigation system creating geometric rice terrace patterns across volcanic slopes like liquid staircases to heaven, sacred Ganges river Ganga flowing through Indonesian spiritual landscape carrying prayers and offerings downstream, water spirits Nyi Roro Kidul ruling southern seas with underwater palaces of coral and pearl, traditional Indonesian fishing boats with colorful sails navigating between islands while fishermen offer prayers to sea deities, monsoon rains blessed by Indra god of storms bringing life-giving water to tropical forests and agricultural lands, sacred water buffalo Kerbau wallowing in muddy rice paddies while farmers plant rice seedlings in flooded fields, traditional Indonesian water festivals with elaborate processions carrying sacred water vessels, holy water Tirta Amrita with healing properties blessed by Balinese priests during temple ceremonies, underwater kingdoms with sea serpent Naga guardians protecting ancient treasures and wisdom, traditional Indonesian wells and water sources considered sacred portals to underworld, water meditation practices with devotees sitting beside flowing streams while chanting mantras, sacred water lilies and lotus flowers blooming in temple ponds with each bloom representing spiritual enlightenment, traditional Indonesian water music with bamboo instruments creating sounds that mimic flowing rivers and ocean waves, hyperrealistic water visualization with fluid dynamics and reflection effects showing the sacred essence of Indonesian waters",

      // WEEK 3: PLANTS & ANIMALS - The Living Ecosystem Symphony
      "plants-animals":
        "GODLEVEL PROMPT: Indonesian Genesis Flora Fauna Creation - Living Ecosystem Symphony of Biodiversity, Dewi Sri goddess of rice and fertility dancing through emerald rice fields while golden grains multiply with each graceful movement, sacred Banyan tree Beringin with massive trunk and aerial roots serving as dwelling place for ancestral spirits and forest deities, Garuda the divine eagle soaring above tropical rainforest canopy with wingspan casting protective shadows over endangered species below, traditional Indonesian spice gardens with nutmeg cinnamon cloves and black pepper plants growing in volcanic soil enriched by centuries of ash, sacred Rafflesia flower blooming once per year in deep jungle with massive petals that emit mystical fragrance attracting forest spirits, Indonesian orangutan families swinging through Borneo rainforest canopy while mother teaches young ones ancient forest wisdom, traditional Indonesian medicinal plants Jamu with healing properties known to village shamans and traditional healers, sacred lotus Padma blooming in temple ponds with each petal representing different aspect of enlightenment and spiritual growth, Indonesian Komodo dragons as living remnants of prehistoric era when dragons ruled the earth alongside ancient Indonesian kingdoms, traditional Indonesian butterfly gardens with thousands of colorful species including rare birdwing butterflies with wings like stained glass windows, sacred rice goddess ceremonies with farmers offering first harvest to Dewi Sri while gamelan orchestras play agricultural celebration music, Indonesian coral reefs with incredible biodiversity including rare fish species found nowhere else on earth, traditional Indonesian forest spirits Bunian living in harmony with animals while protecting ancient trees from destruction, sacred Indonesian elephants decorated with ceremonial cloth and gold ornaments during temple festivals and royal processions, traditional Indonesian bird markets with exotic species including birds of paradise with elaborate plumage used in ceremonial headdresses, Indonesian tiger spirits roaming through jungle temples while protecting sacred groves from human interference, traditional Indonesian herbal medicine gardens with plants that cure diseases and promote longevity according to ancient Javanese texts, sacred Indonesian mangrove forests serving as nurseries for marine life while protecting coastlines from tsunamis and storms, traditional Indonesian animal totems with each tribe having sacred animal spirits that guide and protect community members, hyperrealistic nature visualization with detailed flora and fauna showing the incredible biodiversity of Indonesian ecosystem",

      // WEEK 4: VOLCANOES - The Sacred Fire Mountains
      volcanoes:
        "GODLEVEL PROMPT: Indonesian Genesis Volcanic Creation - Sacred Fire Mountains Forging the Archipelago, Batara Agni fire god emerging from molten earth core with crown of volcanic flames and robes woven from liquid lava threads, Mount Merapi the most sacred volcano breathing divine fire while Javanese sultans perform ancient ceremonies to appease volcanic spirits, Ring of Fire geological formation with active volcanoes creating the backbone of Indonesian islands through millions of years of eruptions, sacred volcanic ash Lahar flowing down mountain slopes creating the most fertile agricultural soil on earth where rice and spices grow abundantly, traditional Indonesian volcano worship ceremonies with offerings of flowers rice and incense placed at crater edges to honor fire deities, Krakatoa legendary volcanic explosion that was heard around the world while creating spectacular sunsets for years afterward, volcanic hot springs Pemandian Air Panas with healing mineral waters where locals bathe while believing in therapeutic properties, traditional Indonesian sulfur miners working in dangerous conditions at Kawah Ijen volcano where blue flames of burning sulfur create otherworldly scenes, sacred Mount Agung towering over Balinese temples as spiritual axis of the island where Hindu gods reside in volcanic peaks, volcanic glass Obsidian formed from rapid cooling of lava flows used by ancient Indonesian craftsmen to create ceremonial knives and tools, traditional Indonesian volcanic sand beaches with black sand created from volcanic activity providing unique coastal landscapes, volcanic crater lakes Danau Kawah with turquoise waters heated by underground thermal activity creating mystical atmospheric effects, sacred volcanic stones used in traditional Indonesian architecture including temples and royal palaces built to withstand earthquakes, traditional Indonesian fire walking ceremonies where devotees walk across hot volcanic coals while in spiritual trance states, volcanic lightning phenomena during major eruptions creating spectacular electrical displays that ancient Indonesians interpreted as battles between gods, traditional Indonesian volcanic observatories where scientists monitor seismic activity while respecting local spiritual beliefs about volcano spirits, sacred volcanic caves formed by lava tubes serving as meditation retreats for Hindu and Buddhist monks, traditional Indonesian volcanic agriculture with farmers growing crops on steep volcanic slopes using ancient terracing techniques, volcanic thermal energy harnessed by modern Indonesia while maintaining respect for traditional beliefs about fire mountain spirits, hyperrealistic volcanic visualization with molten lava flows and dramatic lighting showing the raw geological power that created Indonesian islands",

      // Traditional Cultural Scenarios
      garuda:
        "GODLEVEL PROMPT: Majestic Garuda Wisnu Kencana soaring through celestial realms, massive divine eagle with wingspan across golden sunset skies, intricate feather details with ethereal light, powerful talons gripping sacred lotus blossoms, noble eagle head crowned with jeweled diadem, eyes blazing with cosmic wisdom, Lord Vishnu mounted upon Garuda's back in divine regalia with four arms holding sacred conch shell, discus wheel of time, lotus of creation, ceremonial staff, flowing silk garments in royal blues and golds, Mount Meru rising with cascading waterfalls of liquid starlight, temple spires through clouds of incense, Indonesian archipelago spread below like scattered emeralds in sapphire seas, Ring of Fire volcanoes glowing with sacred flames, traditional gamelan music as golden sound waves, ancient Sanskrit mantras as luminous script, Ramayana epic scenes in floating stone tablets, divine aura radiating rainbow light spectrum, cosmic mandala patterns swirling in heavens, islands visible as points of light, Borobudur and Prambanan temples glowing with spiritual energy, traditional Indonesian textiles woven into reality fabric",

      wayang:
        "GODLEVEL PROMPT: Mystical Wayang Kulit shadow puppet performance bringing ancient Ramayana and Mahabharata epics to life, master dalang puppeteer silhouetted behind glowing white screen with intricately carved leather puppets, masterwork perforated artistry with gold leaf details catching flickering oil lamp light, dramatic shadows dancing into living characters, Prince Rama with noble features and ornate crown alongside Princess Sita with flowing hair and delicate jewelry, mighty Hanuman the white monkey hero leaping through air with mountain in grasp, gamelan orchestra creating visible sound waves in metallic gold and silver, traditional Indonesian musicians in batik clothing playing gender, saron, kendang drums, audience sitting cross-legged on woven mats mesmerized by eternal stories, coconut oil lamps casting warm amber light creating multiple shadow layers, ancient Javanese script floating in air telling story, tropical night sky with stars and flying spirits, traditional Javanese architecture with carved wooden pillars and clay tile roofs, incense smoke curling upward carrying prayers to ancestors, banana leaves and frangipani flowers as offerings, cultural heritage spanning over centuries as golden threads connecting past to present",

      batik:
        "GODLEVEL PROMPT: Infinite cosmic tapestry of sacred Indonesian batik patterns coming alive with supernatural energy, master batik artisan applying hot wax with traditional canting tool creating flowing lines transforming into living rivers of light, parang rusak diagonal patterns representing flowing water and eternal life force undulating like ocean waves, kawung geometric circles symbolizing cosmic order expanding into mandala formations pulsing with universal rhythm, mega mendung cloud motifs in deep indigo blues swirling with actual storm clouds and lightning, ceplok star formations bursting into real constellations, sido mukti prosperity symbols manifesting as golden coins and rice grains falling like blessed rain, royal court designs with protective meanings creating shields of light around ancient Javanese palaces, intricate hand-drawn patterns using traditional canting tools guided by ancestral spirits, natural dyes from indigo plants, turmeric roots, mahogany bark creating earth tones shifting like living skin, cultural identity woven into fabric of reality itself, UNESCO heritage craft mastery passed down through generations, each pattern telling stories of creation myths and heroic legends, textile becoming portal to spiritual realm where ancestors dance in eternal celebration",

      borobudur:
        "GODLEVEL PROMPT: Magnificent Borobudur temple rising from misty Javanese plains like massive stone mandala connecting earth to heaven, world's largest Buddhist monument glowing with golden sunrise light, relief panels carved into volcanic stone coming alive with animated scenes of Buddha's teachings and Jataka tales, Buddha statues in perfect meditation poses each radiating serene enlightenment energy, bell-shaped stupas containing hidden Buddha figures emerging from stone like lotus flowers blooming, three circular platforms representing Buddhist cosmology - Kamadhatu world of desire, Rupadhatu world of forms, and Arupadhatu formless world - each level glowing with different colored auras, pilgrims in white robes walking clockwise path to enlightenment leaving trails of golden light, ancient stones weathered by centuries telling stories of devotion and spiritual seeking, sunrise illuminating the monument with divine radiance while Mount Merapi volcano smokes majestically in background, largest Buddhist temple complex in the world surrounded by lush tropical jungle and rice paddies, architectural marvel embodying spiritual journey from earthly desires to nirvana visualized as ascending spirals of light, Sailendra dynasty builders' vision manifested in perfect sacred geometry, each stone block precisely placed according to cosmic principles, relief carvings depicting Prince Siddhartha's path to becoming Buddha animated with supernatural life, celestial beings and bodhisattvas floating around the temple in meditation, traditional Javanese gamelan music resonating from the stones themselves, incense smoke from countless offerings creating mystical atmosphere, UNESCO World Heritage site protected by guardian spirits, morning mist revealing and concealing the temple like a divine revelation, pilgrims from around the world climbing the sacred steps in spiritual pilgrimage, ancient wisdom carved in stone speaking across centuries, hyperrealistic cinematic masterpiece with volumetric lighting, atmospheric effects, and spiritual energy visualization",

      komodo:
        "GODLEVEL PROMPT: Prehistoric Komodo dragons prowling volcanic islands of Flores and Rinca like living dinosaurs from ancient times, largest living lizards on Earth with massive muscular bodies reaching lengths, powerful jaws capable of delivering venomous bite that can fell water buffalo, ancient survivors from age of dinosaurs when giants ruled the earth, scaly armor-like skin glistening in tropical Indonesian sun with patterns resembling ancient dragon mythology, forked tongues flicking out to taste air for prey scents carried on ocean winds, muscular tails thick as tree trunks and razor-sharp claws that can tear through flesh and bone, endemic to Indonesian archipelago representing untamed wilderness and primal power, living legends of Flores and Rinca islands where local villagers call them ora and tell stories of dragon spirits, conservation symbols representing battle between modern world and ancient nature, mystical connection to dragon mythology of Asian cultures, volcanic landscape of Komodo National Park with rugged hills and savanna grasslands, pink sand beaches where dragons hunt for carrion washed ashore, deer and wild boar fleeing in terror from apex predators, traditional Indonesian fishing boats anchored in crystal blue waters, park rangers in khaki uniforms observing from safe distance, tourists on guided tours witnessing living prehistory, UNESCO World Heritage marine park protecting both dragons and coral reefs, Ring of Fire volcanic activity creating dramatic landscape, traditional Indonesian villages where locals have coexisted with dragons for centuries, ancient folklore and legends about dragon kings and serpent deities, scientific research revealing secrets of dragon evolution and survival, hyperrealistic wildlife cinematography with dramatic lighting, showing every scale detail and predatory movement, atmospheric volcanic landscape with mist and dramatic skies",

      dance:
        "GODLEVEL PROMPT: Graceful Balinese Legong dancers in elaborate golden costumes performing ancient court dance with supernatural elegance, intricate headdresses adorned with fresh frangipani flowers and golden ornaments catching temple lamplight, precise mudra hand gestures telling stories of gods and demons through sacred choreography passed down through centuries, gamelan orchestra creating hypnotic metallic rhythms that seem to control the dancers' movements like divine puppetry, Javanese court dances with refined elegance performed in royal palaces with dancers moving like living sculptures, Saman dance from Aceh with dozens of male dancers in perfect synchronization creating human mandala patterns, colorful silk fabrics flowing with each gesture like liquid rainbows, spiritual devotion expressed through movement connecting earthly realm to divine consciousness, cultural storytelling through choreographed artistry where every gesture has deep meaning, temple ceremonies coming alive with dancers embodying Hindu deities and mythological characters, traditional Indonesian music visualized as golden sound waves guiding the performers, elaborate makeup and costumes transforming dancers into living gods and goddesses, incense smoke swirling around performers creating mystical atmosphere, tropical temple courtyards with carved stone pillars and lotus ponds reflecting the dance, audiences of devotees and tourists mesmerized by ancient artistry, UNESCO Intangible Cultural Heritage performances preserving ancient traditions, master dance teachers passing knowledge to young students in sacred guru-disciple relationships, traditional Indonesian philosophy of harmony between body, mind, and spirit expressed through movement, hyperrealistic cinematography capturing every graceful gesture and costume detail, volumetric lighting creating dramatic shadows and highlights, cultural pride and spiritual energy radiating from every performance",

      temples:
        "GODLEVEL PROMPT: Ornate Pura Besakih mother temple complex on Mount Agung slopes rising like stairway to heaven, multi-tiered meru towers reaching toward heavens with each level representing different spiritual realm, intricate stone carvings depicting mythological scenes from Ramayana and Mahabharata coming alive with supernatural energy, ceremonial gates adorned with guardian statues of fierce demons and protective deities, lotus ponds reflecting temple spires creating perfect mirror images, incense smoke rising from prayer altars carrying devotees' prayers to divine realm, devotees in white ceremonial dress performing daily rituals and offerings, tropical flowers as offerings - frangipani, hibiscus, and marigolds creating colorful carpets, ancient architecture blending harmoniously with natural landscape of volcanic mountains and rice terraces, spiritual sanctuary of profound beauty where Hindu-Dharma religion thrives, Prambanan temple complex with towering spires dedicated to Hindu trinity of Brahma, Vishnu, and Shiva, elaborate relief carvings telling epic stories animated by flickering temple flames, traditional Balinese architecture with red brick and volcanic stone construction, temple festivals with thousands of devotees in colorful traditional dress, gamelan orchestras playing sacred music that resonates through temple courtyards, holy water ceremonies where priests bless devotees with tirta from sacred springs, temple dancers performing in temple courtyards bringing Hindu mythology to life, traditional offerings of rice, flowers, and incense arranged in beautiful geometric patterns, UNESCO World Heritage sites preserving ancient architectural masterpieces, spiritual energy radiating from ancient stones blessed by centuries of prayer and devotion, hyperrealistic architectural photography with dramatic lighting, showing intricate stone carving details and atmospheric temple ceremonies, volumetric lighting through incense smoke creating mystical ambiance",

      // Major Indigenous Groups
      javanese:
        "GODLEVEL PROMPT: Magnificent Javanese royal court of Yogyakarta Sultan's palace with refined traditions spanning centuries, elaborate batik patterns with philosophical meanings covering silk garments of court nobles, gamelan orchestras creating meditative soundscapes with bronze instruments channeling ancestral spirits, traditional Javanese architecture with joglo roofs and carved wooden pillars telling stories of ancient kingdoms, shadow puppet wayang performances in royal courtyards where dalang masters weave epic tales of gods and heroes, ancient Hindu-Buddhist influences merged with Islamic culture creating unique Javanese synthesis, terraced rice cultivation creating geometric patterns across volcanic landscapes, traditional ceremonies and rituals connecting living descendants to royal ancestors, sophisticated artistic heritage spanning centuries with court painters, musicians, and craftsmen, Sultan's palace Kraton with its sacred layout representing cosmic order, traditional Javanese philosophy of harmony and balance expressed in daily life, court dancers in elaborate costumes performing sacred dances, royal gamelan sets made of bronze and gold creating music for the gods, traditional Javanese script and literature preserving ancient wisdom, ceremonial keris daggers with mystical powers passed down through generations, traditional medicine and healing practices using herbs and spiritual energy, hyperrealistic cultural documentation with rich details of court life and artistic traditions",

      sundanese:
        "GODLEVEL PROMPT: West Java's indigenous Sundanese people with distinct cultural identity thriving in mountainous terrain, traditional bamboo architecture with elevated houses on stilts protecting from floods and wild animals, angklung bamboo musical instruments creating harmonious melodies that echo through mountain valleys, traditional Sundanese dance performances with graceful movements inspired by nature, rice cultivation in mountainous terrain creating spectacular terraced landscapes, unique culinary traditions with fresh vegetables and fish from mountain streams, traditional clothing and textiles with intricate patterns and natural dyes, ancient animistic beliefs blended seamlessly with Islam creating unique spiritual practices, community cooperation gotong royong traditions where entire villages work together, highland agricultural practices adapted to volcanic soil and mountain climate, traditional houses with steep roofs and bamboo walls designed for mountain weather, Sundanese language with its own script and literature, traditional crafts including bamboo weaving and wood carving, mountain festivals celebrating harvest and seasonal changes, traditional healing practices using mountain herbs and spiritual rituals, hyperrealistic documentation of highland culture with dramatic mountain landscapes and traditional architecture",

      batak:
        "GODLEVEL PROMPT: North Sumatra highland Batak people with distinctive architecture around magnificent Lake Toba, traditional Batak houses with dramatic curved roofs resembling buffalo horns reaching toward sky, intricate wood carvings and decorative elements telling clan histories and spiritual beliefs, traditional ulos textiles with sacred meanings woven by master craftswomen, patrilineal clan system and ancestral worship connecting living descendants to powerful spirits, Lake Toba cultural landscape with world's largest volcanic lake surrounded by traditional villages, traditional music with gondang instruments creating rhythms that summon ancestral spirits, stone megalithic monuments erected by ancient Batak kings, ancient Batak script and literature preserving oral traditions, ceremonial feasts and rituals celebrating life passages and clan unity, warrior traditions and oral histories of battles and heroic deeds, traditional Batak architecture with houses built without nails using ancient joinery techniques, clan totems and symbols carved into house facades, traditional ceremonies for naming, marriage, and death with elaborate rituals, Batak Christian churches blending traditional architecture with Christian symbolism, hyperrealistic cultural photography showing traditional architecture and Lake Toba landscape with dramatic lighting and atmospheric effects",

      dayak:
        "GODLEVEL PROMPT: Indigenous Dayak peoples of Kalimantan Borneo with diverse sub-groups living in harmony with rainforest, traditional longhouses accommodating extended families with communal living spaces stretching hundreds of feet, intricate beadwork and traditional costumes with patterns representing clan identity and spiritual protection, headhunting historical traditions with trophy skulls displayed in longhouse rafters, river-based transportation and settlements with traditional boats navigating jungle waterways, traditional tattoos with spiritual significance covering warriors' bodies with protective symbols, hornbill bird cultural symbolism with sacred feathers used in ceremonies, forest-based lifestyle and hunting practices using blowguns and traditional traps, shamanic traditions and spiritual beliefs connecting human world to forest spirits, traditional crafts and woodcarving creating masks and totems, oral traditions and folklore passed down through generations, traditional medicine using rainforest plants and spiritual healing, longhouse architecture built on stilts with communal verandas, traditional ceremonies for rice planting and harvest, warrior culture with elaborate shields and weapons, hyperrealistic rainforest photography showing traditional longhouses and Dayak cultural practices with atmospheric jungle lighting",

      acehnese:
        "GODLEVEL PROMPT: Northernmost Sumatra Acehnese province with strong Islamic identity and proud independence tradition, traditional Acehnese architecture with Islamic influences showing Middle Eastern and local fusion, distinctive cultural practices and ceremonies blending Islamic faith with local customs, traditional Saman dance performances with dozens of dancers in perfect synchronization, coffee cultivation and trade traditions making Aceh famous for premium coffee beans, tsunami resilience and community strength shown in disaster recovery, traditional clothing and textiles with Islamic geometric patterns, Islamic educational institutions dayah preserving religious knowledge, maritime trading heritage with traditional boats and fishing techniques, unique Acehnese dialect and language distinct from other Indonesian languages, traditional crafts and metalwork creating Islamic calligraphy and decorative arts, Grand Mosque of Baiturrahman with black domes and minarets, traditional Acehnese houses with steep roofs and Islamic architectural elements, Islamic law Sharia implementation in daily life, traditional ceremonies for Islamic holidays and life passages, hyperrealistic cultural documentation showing Islamic architecture and Acehnese traditions with dramatic lighting and cultural authenticity",

      minangkabau:
        "GODLEVEL PROMPT: West Sumatra Minangkabau people with unique matrilineal social structure where women hold property and family lineage, distinctive rumah gadang houses with dramatic horn-shaped roofs resembling buffalo horns reaching toward sky, traditional Minang cuisine and culinary heritage famous throughout Indonesia and Malaysia, matriarchal inheritance and family systems where mothers pass property to daughters, traditional ceremonies and adat customs governing social behavior and community harmony, skilled traders and merchants throughout Southeast Asia spreading Minang culture, traditional textiles and songket weaving with gold threads creating royal garments, Islamic scholarship and education with famous religious schools, traditional music and dance celebrating Minang cultural identity, philosophical wisdom and proverbs pepatah-petitih guiding daily life, traditional architecture with carved wooden facades and steep roofs, clan system suku organizing social relationships and marriage rules, traditional markets with Minang women as successful traders, ceremonial costumes with elaborate headdresses and jewelry, hyperrealistic cultural photography showing traditional rumah gadang architecture and Minang cultural practices with rich detail and atmospheric lighting",

      "balinese-tribe":
        "GODLEVEL PROMPT: Bali island people with distinct Hindu-Dharma religion creating paradise of temples and ceremonies, elaborate temple ceremonies and festivals with thousands of devotees in colorful traditional dress, traditional Balinese architecture and sculpture with intricate stone carvings, intricate wood and stone carvings depicting Hindu mythology and local legends, traditional dance and music performances bringing Hindu epics to life, rice terrace agriculture and subak irrigation system creating spectacular landscapes, traditional clothing and ceremonial dress with gold ornaments and silk fabrics, artistic traditions in painting and crafts passed down through generations, community temple obligations and ceremonies connecting villages to divine realm, unique Balinese calendar system with religious festivals throughout the year, traditional healing practices using herbs and spiritual energy, temple festivals with elaborate decorations and offerings, gamelan orchestras playing sacred music for temple ceremonies, traditional crafts including wood carving, stone sculpture, and silver jewelry, Hindu philosophy integrated with local animistic beliefs, hyperrealistic cultural documentation showing Balinese temple ceremonies and traditional arts with dramatic lighting and spiritual atmosphere",

      papuans:
        "GODLEVEL PROMPT: New Guinea indigenous peoples with incredible cultural diversity representing hundreds of distinct tribes, traditional houses on stilts and tree houses built high above ground for protection, elaborate feathered headdresses and body decorations using bird of paradise plumes, hundreds of distinct languages and dialects making Papua most linguistically diverse region on Earth, traditional hunting and gathering practices using bows, arrows, and traditional traps, bird of paradise cultural significance with sacred feathers used in ceremonies, traditional music with drums and flutes creating rhythms that connect to ancestral spirits, body painting and scarification traditions marking tribal identity and spiritual protection, sago palm cultivation and processing providing staple food, tribal warfare and peace-making ceremonies with elaborate rituals, oral traditions and storytelling preserving tribal history and mythology, traditional tools and weapons made from stone, bone, and wood, highland tribes with different customs from coastal peoples, traditional ceremonies for initiation and life passages, hyperrealistic ethnographic photography showing Papuan cultural diversity with authentic tribal practices and dramatic New Guinea landscapes",

      baduy:
        "GODLEVEL PROMPT: Banten Java Baduy tribe maintaining strict traditional lifestyle in complete rejection of modern world, traditional white and black clothing distinctions marking inner Baduy Dalam and outer Baduy Luar communities, sustainable agriculture without chemicals or modern tools preserving ancient farming methods, traditional houses without electricity, running water, or modern conveniences, oral tradition and customary law pikukuh governing every aspect of daily life, forest conservation and environmental protection as sacred duty, traditional crafts and weaving using only natural materials and ancient techniques, spiritual connection to ancestral lands considered sacred and protected, isolation from mainstream Indonesian society by choice and tradition, traditional leadership and governance systems based on ancestral wisdom, forbidden to use modern transportation, electronics, or synthetic materials, traditional medicine using forest plants and spiritual healing, sacred forests protected by traditional law and spiritual beliefs, traditional ceremonies marking seasonal changes and life passages, hyperrealistic documentary photography showing authentic traditional lifestyle with natural lighting and environmental context",

      "orang-rimba":
        "GODLEVEL PROMPT: Sumatra nomadic hunter-gatherers known as Kubu people living deep in rainforest, traditional forest shelters built from natural materials and abandoned when moving to new areas, hunting and gathering traditional practices using blowguns and forest knowledge, shamanic spiritual beliefs and forest spirits guiding daily life, traditional medicine using forest plants and spiritual healing practices, oral traditions and forest knowledge passed down through generations, resistance to sedentarization and modernization to preserve traditional lifestyle, traditional tools and hunting weapons made from forest materials, forest conservation and sustainable practices as way of life, unique language and cultural expressions distinct from settled populations, adaptation to rainforest environment with intimate knowledge of forest ecology, traditional social organization based on kinship and forest territories, threatened by deforestation and palm oil plantations, traditional ceremonies connecting human world to forest spirits, hyperrealistic rainforest photography showing authentic nomadic lifestyle with atmospheric jungle lighting and environmental authenticity",

      "hongana-manyawa":
        "GODLEVEL PROMPT: One of Indonesia's last nomadic hunter-gatherer tribes living in remote rainforest areas of Halmahera island, traditional forest shelters and nomadic lifestyle moving seasonally through ancestral territories, hunting with traditional weapons and tools made from forest materials, gathering forest foods and medicines using ancient knowledge, shamanic spiritual practices connecting human world to forest spirits, oral traditions and forest knowledge threatened by outside contact, threatened by deforestation and mining destroying ancestral lands, traditional social organization based on kinship and forest territories, unique language and cultural practices distinct from outside world, adaptation to tropical rainforest with intimate ecological knowledge, resistance to outside contact to preserve traditional way of life, traditional ceremonies and rituals marking seasonal changes, forest spirits and ancestral beliefs guiding daily decisions, hyperrealistic ethnographic photography showing last remnants of stone age lifestyle with authentic forest environment and dramatic lighting",

      asmat:
        "GODLEVEL PROMPT: New Guinea indigenous Asmat people renowned worldwide for intricate wood carvings, traditional bis poles and ancestor sculptures reaching toward sky like prayers to ancestral spirits, elaborate ceremonial masks and shields with supernatural power, traditional cultural practices and ceremonial displays, sago palm cultivation and processing providing staple food in swampy environment, traditional houses on stilts built over tidal areas, spiritual beliefs connecting ancestors and nature in continuous cycle, traditional music and dance ceremonies honoring ancestral spirits, river-based transportation and settlements with traditional canoes, oral traditions and mythology explaining creation and tribal history, artistic heritage recognized worldwide with museums collecting Asmat art, traditional tools and carving techniques passed down through master-apprentice relationships, ceremonial feasts celebrating cultural achievements, traditional initiation ceremonies for young people, hyperrealistic art documentation showing master woodcarvers at work with intricate detail of traditional sculptures and atmospheric swamp environment, master craftsmen carving sacred bis poles from ironwood trees, intricate ancestral figures emerging from raw timber through skilled hands, ceremonial shields decorated with protective spirits and clan totems, traditional carving tools made from cassowary bones and wild boar tusks, swampy mangrove environment with traditional stilt houses reflecting in dark waters, spiritual connection between carver and ancestral spirits guiding every cut, UNESCO recognized artistic tradition preserving ancient Papuan culture, museum-quality sculptures representing thousands of years of artistic evolution, sacred men's houses displaying trophy skulls and ceremonial artifacts, traditional sago processing by women while men focus on sacred carving work, river ceremonies where finished sculptures are blessed by tribal elders, artistic mastery passed down through generations of master woodcarvers, each carving telling stories of creation myths and heroic ancestors",
    }

    if (scenarioPrompts[scenario]) {
      prompt = scenarioPrompts[scenario]
    }
  }

  // Simple colors
  const simpleColors: Record<string, string> = {
    plasma: "plasma colors",
    quantum: "quantum blue",
    cosmic: "cosmic purple",
    thermal: "thermal red",
    spectral: "rainbow",
    crystalline: "crystal clear",
    bioluminescent: "glowing blue",
    aurora: "aurora green",
    metallic: "metallic",
    prismatic: "prismatic",
    monochromatic: "grayscale",
    infrared: "infrared",
    lava: "lava red",
    futuristic: "neon",
    forest: "forest green",
    ocean: "ocean blue",
    sunset: "sunset orange",
    arctic: "arctic blue",
    neon: "neon bright",
    vintage: "vintage sepia",
    toxic: "toxic green",
    ember: "ember orange",
    lunar: "lunar gray",
    tidal: "tidal blue",
  }

  return cleanPromptForImageGeneration(`${prompt}, ${simpleColors[colorScheme] || "vibrant"}, detailed, 8K`)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("🎨 AI Art API called - Mathematical Dome & Panorama Transformations")

    const {
      dataset,
      scenario,
      colorScheme,
      seed,
      numSamples,
      noise,
      timeStep,
      customPrompt,
      domeDiameter = 20,
      domeResolution = "4K",
      projectionType = "fisheye",
      panoramaResolution = "8K",
      panoramaFormat = "equirectangular",
      stereographicPerspective,
      singleImageMode = false,
      generationMode = "auto",
    } = body

    // Build prompt with Indonesian Genesis Creation Story
    const mainPrompt = buildUltraSimplePrompt(dataset, scenario, colorScheme, customPrompt)
    console.log("📝 Prompt:", mainPrompt.substring(0, 200) + "...")
    console.log("📏 Prompt length:", mainPrompt.length, "characters")

    const isGodLevel = mainPrompt.includes("GODLEVEL PROMPT:")
    const isGenesisElement = ["cosmos", "water", "plants-animals", "volcanoes"].includes(scenario)

    // Only use single image mode if explicitly requested or for extremely long prompts
    const shouldUseSingleMode = singleImageMode || generationMode === "single" || mainPrompt.length > 3000

    if (shouldUseSingleMode) {
      console.log("🖼️ Single image mode with mathematical transformations")
      try {
        const result = await generateSingleImageOnly(mainPrompt)

        return NextResponse.json({
          success: true,
          image: result.mainImage,
          domeImage: result.domeImage,
          panoramaImage: result.panoramaImage,
          originalPrompt: mainPrompt,
          promptLength: mainPrompt.length,
          provider: "OpenAI",
          model: "DALL-E 3",
          estimatedFileSize: "~2-4MB",
          generationMethod: result.method,
          generationDetails: {
            mainImage: "Generated successfully",
            domeImage: "Mathematical fisheye transformation applied from source art",
            panoramaImage: "Mathematical equirectangular transformation applied from source art",
            note: "Single image mode with mathematical transformations from original art data",
          },
          parameters: {
            dataset,
            scenario,
            colorScheme,
            singleImageMode: true,
            mathematicalTransforms: true,
            genesisElement: isGenesisElement,
          },
        })
      } catch (error: any) {
        console.error("❌ Single image generation failed:", error.message)

        return NextResponse.json(
          {
            success: false,
            error: "Image generation failed",
            details: error.message,
            generationMethod: "single_failed",
            suggestion: "OpenAI API may be experiencing issues. Please try again.",
            troubleshooting: {
              issue: "API Error",
              cause: error.message.includes("503")
                ? "OpenAI service temporarily unavailable"
                : error.message.includes("429")
                  ? "Rate limit exceeded"
                  : error.message.includes("DEPLOYMENT_TIMEOUT")
                    ? "Deployment timeout"
                    : "API error",
              solutions: [
                "Try again in a few moments",
                "OpenAI may be experiencing high load",
                "Contact support if issue persists",
              ],
            },
          },
          { status: error.message.includes("DEPLOYMENT_TIMEOUT") ? 408 : 503 },
        )
      }
    }

    // Try mathematical transformation approach first
    console.log(`⚡ Attempting ${isGodLevel ? "GODLEVEL" : "standard"} generation with mathematical transformations...`)
    try {
      const domePrompt = generateDomePrompt(mainPrompt)
      const panoramaPrompt = generatePanoramaPrompt(mainPrompt)

      console.log("🧮 Using mathematical transformations from original art data")

      // Extended timeout for Genesis elements and GODLEVEL prompts
      const totalTimeout = isGodLevel ? (isGenesisElement ? 45000 : 40000) : 25000

      const parallelResults = (await Promise.race([
        generateImagesInParallel(mainPrompt, domePrompt, panoramaPrompt),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Parallel timeout")), totalTimeout)),
      ])) as Awaited<ReturnType<typeof generateImagesInParallel>>

      // Check if we got at least the main image
      if (parallelResults.mainImage) {
        console.log("✅ Generation with mathematical transformations successful!")

        // Count successful generations
        const successCount = [
          parallelResults.mainImage,
          parallelResults.domeImage,
          parallelResults.panoramaImage,
        ].filter(Boolean).length

        return NextResponse.json({
          success: true,
          image: parallelResults.mainImage,
          domeImage: parallelResults.domeImage || parallelResults.mainImage,
          panoramaImage: parallelResults.panoramaImage || parallelResults.mainImage,
          originalPrompt: mainPrompt,
          promptLength: mainPrompt.length,
          provider: "OpenAI",
          model: "DALL-E 3",
          estimatedFileSize: "~2-4MB",
          generationMethod: isGodLevel ? "godlevel_mathematical_transforms" : "standard_mathematical_transforms",
          generationDetails: {
            mainImage: "Generated successfully",
            domeImage: parallelResults.domeImage
              ? "Mathematical fisheye transformation applied from original art data"
              : "Using main image fallback",
            panoramaImage: parallelResults.panoramaImage
              ? "Mathematical equirectangular transformation applied from original art data"
              : "Using main image fallback",
            errors: parallelResults.errors,
            successCount: `${successCount}/3 images generated`,
            note: isGodLevel
              ? "GODLEVEL generation with mathematical dome and panorama transformations from original art"
              : "Standard generation with mathematical transformations from original art",
            mathematicalTransforms: {
              domeTransform: parallelResults.domeImage
                ? "✅ Fisheye projection applied from mathematical data"
                : "❌ Fallback used",
              panoramaTransform: parallelResults.panoramaImage
                ? "✅ Equirectangular projection applied from mathematical data"
                : "❌ Fallback used",
            },
          },
          parameters: {
            dataset,
            scenario,
            colorScheme,
            seed,
            numSamples,
            noiseScale: noise,
            timeStep,
            domeProjection: !!parallelResults.domeImage,
            domeDiameter,
            domeResolution,
            projectionType: "fisheye",
            panoramic360: !!parallelResults.panoramaImage,
            panoramaResolution,
            panoramaFormat: "equirectangular",
            stereographicPerspective,
            godlevelMode: isGodLevel,
            genesisElement: isGenesisElement,
            extendedTimeout: totalTimeout,
            mathematicalTransforms: true,
          },
        })
      } else {
        throw new Error("No main image generated")
      }
    } catch (error: any) {
      console.log("⚠️ Mathematical transformation failed, falling back to single image:", error.message)

      // Final fallback - single image only
      try {
        const result = await generateSingleImageOnly(mainPrompt)

        return NextResponse.json({
          success: true,
          image: result.mainImage,
          domeImage: result.domeImage,
          panoramaImage: result.panoramaImage,
          originalPrompt: mainPrompt,
          promptLength: mainPrompt.length,
          provider: "OpenAI",
          model: "DALL-E 3",
          estimatedFileSize: "~2-4MB",
          generationMethod: "emergency_single_mathematical",
          generationDetails: {
            mainImage: "Generated successfully",
            domeImage: "Mathematical fisheye transformation applied from original art data (emergency fallback)",
            panoramaImage:
              "Mathematical equirectangular transformation applied from original art data (emergency fallback)",
            errors: [`Mathematical parallel failed: ${error.message}`],
            note: "Emergency single image mode with mathematical transformations from original art",
          },
          parameters: {
            dataset,
            scenario,
            colorScheme,
            emergencyMode: true,
            mathematicalTransforms: true,
          },
        })
      } catch (finalError: any) {
        console.error("❌ All generation methods failed:", finalError.message)

        return NextResponse.json(
          {
            success: false,
            error: "All generation methods failed",
            details: finalError.message,
            timestamp: new Date().toISOString(),
            generationMethod: "all_failed",
            troubleshooting: {
              issue: "Complete API Failure",
              cause: finalError.message.includes("503")
                ? "OpenAI service unavailable"
                : finalError.message.includes("429")
                  ? "Rate limit exceeded"
                  : finalError.message.includes("DEPLOYMENT_TIMEOUT")
                    ? "Deployment timeout"
                    : "Unknown API error",
              solutions: [
                "OpenAI API is experiencing issues",
                "Try again in a few minutes",
                "Check OpenAI status page",
                "Contact support if issue persists",
              ],
            },
          },
          { status: finalError.message.includes("DEPLOYMENT_TIMEOUT") ? 408 : 503 },
        )
      }
    }
  } catch (error: any) {
    console.error("❌ Route handler error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Request processing failed",
        details: error.message,
        timestamp: new Date().toISOString(),
        generationMethod: "request_failed",
      },
      { status: 500 },
    )
  }
}
