import { type NextRequest, NextResponse } from "next/server"
import {
  generateDomePrompt,
  generatePanoramaPrompt,
  generateImagesInParallel,
  generateSingleImageOnly,
  cleanPromptForImageGeneration,
} from "./utils"

function buildEnhancedModernPrompt(
  dataset: string,
  scenario: string,
  colorScheme: string,
  customPrompt?: string,
): string {
  // Use custom prompt if provided, but enhance it
  if (customPrompt && customPrompt.trim()) {
    return cleanPromptForImageGeneration(
      `${customPrompt.trim()}, ${colorScheme} color palette, hyperrealistic 8K digital art masterpiece, cinematic lighting, award-winning composition`,
    )
  }

  // Enhanced modern dataset prompts with stunning visual descriptions
  const enhancedDatasets: Record<string, string> = {
    nuanu:
      "Futuristic Nuanu creative city with crystalline architecture, holographic art installations, floating geometric structures, neon-lit creative spaces, advanced urban design",
    bali: "Mystical Balinese temple complex with golden hour lighting, intricate stone carvings, tropical paradise setting, sacred lotus ponds, ethereal mist effects",
    thailand:
      "Magnificent Thai temple architecture with ornate golden details, dramatic sunset lighting, traditional Thai artistic elements, spiritual atmosphere",
    indonesian:
      "Breathtaking Indonesian cultural landscape with volcanic mountains, emerald rice terraces, traditional architecture, tropical paradise",
    horror:
      "Dark mystical Indonesian supernatural realm with ethereal spirits, haunting beauty, dramatic shadows, mysterious atmosphere",
    spirals:
      "Mesmerizing mathematical spiral patterns with golden ratio geometry, dynamic flow, hypnotic movement, fractal complexity",
    fractal:
      "Intricate fractal art with infinite detail, recursive patterns, mathematical beauty, organic complexity, stunning visual depth",
    mandelbrot:
      "Spectacular Mandelbrot set visualization with infinite zoom, psychedelic colors, mathematical precision, cosmic beauty",
    julia:
      "Elegant Julia set fractals with delicate structures, complex mathematical beauty, ethereal patterns, infinite detail",
    lorenz:
      "Dynamic Lorenz attractor visualization with chaotic beauty, flowing trajectories, mathematical elegance, hypnotic motion",
    hyperbolic:
      "Stunning hyperbolic geometry with impossible perspectives, mathematical beauty, mind-bending visuals, geometric precision",
    gaussian:
      "Beautiful Gaussian field visualization with smooth gradients, statistical beauty, flowing patterns, mathematical elegance",
    cellular:
      "Complex cellular automata patterns with emergent behavior, algorithmic beauty, dynamic evolution, mathematical art",
    voronoi:
      "Elegant Voronoi diagram patterns with organic cell structures, natural tessellation, geometric beauty, mathematical precision",
    perlin:
      "Smooth Perlin noise landscapes with organic flow, natural patterns, procedural beauty, algorithmic generation",
    diffusion:
      "Mesmerizing reaction-diffusion patterns with organic growth, chemical beauty, dynamic evolution, natural complexity",
    wave: "Spectacular wave interference patterns with fluid dynamics, harmonic beauty, oscillating motion, mathematical elegance",
    moons:
      "Celestial lunar orbital mechanics with gravitational beauty, cosmic dance, astronomical precision, space phenomena",
    tribes:
      "Vibrant tribal network topology with cultural connections, social patterns, community structures, anthropological beauty",
    heads:
      "Artistic mosaic head compositions with portrait gallery, human diversity, facial expressions, cultural representation",
    natives:
      "Traditional native tribal culture with authentic heritage, ceremonial beauty, cultural richness, ancestral wisdom",
    statues:
      "Magnificent sacred sculptural statues with artistic mastery, cultural significance, spiritual presence, timeless beauty",
  }

  let prompt = enhancedDatasets[dataset] || "abstract digital art masterpiece"

  // Dramatically enhanced Indonesian Genesis Creation Story with modern artistic vision
  if (dataset === "indonesian") {
    const enhancedScenarioPrompts: Record<string, string> = {
      pure: "Stunning geometric patterns with mathematical precision, golden ratio harmony, sacred geometry",

      // WEEK 1: COSMOS - Enhanced with modern cinematic vision
      cosmos:
        "GODLEVEL PROMPT: Indonesian Genesis Cosmos Creation - The Divine Beginning of the Universe rendered as breathtaking cinematic masterpiece, Sang Hyang Widhi Wasa the Supreme Creator manifesting as brilliant cosmic consciousness with volumetric lighting effects expanding through infinite void filled with particle systems and stellar phenomena, primordial cosmic egg Brahmanda splitting open with explosive visual effects releasing torrents of divine light and stardust creating spectacular nebula formations, celestial realm Kahyangan emerging from cosmic waters with floating palaces of crystalline gold and liquid crystal architecture defying gravity, Batara Guru Shiva performing the cosmic dance of creation with motion blur effects while wielding trident of universal power crackling with energy, cosmic serpent Ananta Sesha coiled around Mount Meru with iridescent scales supporting the three worlds in perfect balance, divine cosmic wheel Chakra spinning with sacred geometries and mathematical precision representing future Indonesian islands as points of light, cosmic tree Kalpataru growing from center of universe with fractal branches reaching all dimensions pulsing with bioluminescent energy, primordial cosmic sound OM AUM visualized as rippling space-time waves creating vibrational frequencies that birth matter with particle effects, cosmic mandala patterns expanding outward in perfect mathematical harmony with Sanskrit mantras written in pure starlight and energy, celestial beings Dewata floating through cosmic realms with ethereal beauty playing divine gamelan orchestras that tune the fundamental frequencies of reality with visible sound waves, cosmic lotus Padma blooming in the void with each petal containing entire galaxies and solar systems rendered in stunning detail, divine cosmic breath Prana flowing as solar winds with particle trails carrying life essence to future worlds, cosmic fire Agni burning in the heart of newborn stars with plasma effects forging the elements that will become Indonesian soil, primordial cosmic waters Apah swirling in spiral galaxies with fluid dynamics preparing to descend as sacred rivers and seas, cosmic time Kala beginning its eternal cycle with temporal distortion effects showing past present and future existing simultaneously, divine cosmic consciousness Atman awakening in every particle of matter with quantum field effects preparing for the manifestation of Indonesian archipelago, hyperrealistic cosmic visualization with advanced volumetric lighting and particle systems showing the birth of Indonesian universe in stunning 8K detail",

      // WEEK 2: WATER - Enhanced with fluid dynamics and aquatic beauty
      water:
        "GODLEVEL PROMPT: Indonesian Genesis Water Creation - Sacred Flowing Life Force of the Archipelago rendered as stunning aquatic masterpiece, Dewi Sri goddess of water and fertility emerging from cosmic lotus with flowing hair that transforms into rivers and streams with realistic fluid dynamics, sacred Mount Meru releasing celestial waterfalls that cascade down through seven heavens with volumetric mist effects creating the primordial oceans, Baruna ocean god riding massive sea turtle Kurma through endless blue depths with bioluminescent trails while commanding tidal forces with conch shell trumpet creating sound waves, sacred springs Tirta emerging from earth with crystal clear water blessed by Hindu priests with holy water ceremonies surrounded by tropical paradise, traditional Indonesian water temples Pura Tirta with elaborate stone carvings and lotus ponds reflecting temple spires with perfect mirror reflections, ancient Subak irrigation system creating geometric rice terrace patterns across volcanic slopes like liquid staircases to heaven with golden hour lighting, sacred Ganges river Ganga flowing through Indonesian spiritual landscape with ethereal mist carrying prayers and offerings downstream, water spirits Nyi Roro Kidul ruling southern seas with underwater palaces of coral and pearl rendered in stunning detail, traditional Indonesian fishing boats with colorful sails navigating between islands while fishermen offer prayers to sea deities under dramatic skies, monsoon rains blessed by Indra god of storms bringing life-giving water to tropical forests with realistic precipitation effects, sacred water buffalo Kerbau wallowing in muddy rice paddies while farmers plant rice seedlings in flooded fields with authentic agricultural beauty, traditional Indonesian water festivals with elaborate processions carrying sacred water vessels through vibrant celebrations, holy water Tirta Amrita with healing properties blessed by Balinese priests during temple ceremonies with spiritual energy effects, underwater kingdoms with sea serpent Naga guardians protecting ancient treasures and wisdom in crystal clear depths, traditional Indonesian wells and water sources considered sacred portals to underworld with mystical lighting, water meditation practices with devotees sitting beside flowing streams while chanting mantras with peaceful atmosphere, sacred water lilies and lotus flowers blooming in temple ponds with each bloom representing spiritual enlightenment rendered in perfect detail, traditional Indonesian water music with bamboo instruments creating sounds that mimic flowing rivers and ocean waves with visible sound effects, hyperrealistic water visualization with advanced fluid dynamics and reflection effects showing the sacred essence of Indonesian waters in breathtaking 8K quality",

      // WEEK 3: PLANTS & ANIMALS - Enhanced with biodiversity and natural beauty
      "plants-animals":
        "GODLEVEL PROMPT: Indonesian Genesis Flora Fauna Creation - Living Ecosystem Symphony of Biodiversity rendered as stunning nature documentary masterpiece, Dewi Sri goddess of rice and fertility dancing through emerald rice fields with motion blur effects while golden grains multiply with each graceful movement creating abundance, sacred Banyan tree Beringin with massive trunk and aerial roots serving as dwelling place for ancestral spirits with ethereal lighting effects, Garuda the divine eagle soaring above tropical rainforest canopy with majestic wingspan casting protective shadows over endangered species below in cinematic detail, traditional Indonesian spice gardens with nutmeg cinnamon cloves and black pepper plants growing in volcanic soil enriched by centuries of ash with rich earth tones, sacred Rafflesia flower blooming once per year in deep jungle with massive petals that emit mystical fragrance attracting forest spirits with bioluminescent effects, Indonesian orangutan families swinging through Borneo rainforest canopy with realistic fur detail while mother teaches young ones ancient forest wisdom, traditional Indonesian medicinal plants Jamu with healing properties known to village shamans rendered with botanical accuracy, sacred lotus Padma blooming in temple ponds with each petal representing different aspect of enlightenment with spiritual energy effects, Indonesian Komodo dragons as living remnants of prehistoric era with detailed scales and powerful presence ruling ancient Indonesian kingdoms, traditional Indonesian butterfly gardens with thousands of colorful species including rare birdwing butterflies with wings like stained glass windows catching sunlight, sacred rice goddess ceremonies with farmers offering first harvest to Dewi Sri while gamelan orchestras play agricultural celebration music with golden hour lighting, Indonesian coral reefs with incredible biodiversity including rare fish species found nowhere else on earth rendered in crystal clear underwater detail, traditional Indonesian forest spirits Bunian living in harmony with animals while protecting ancient trees with mystical forest atmosphere, sacred Indonesian elephants decorated with ceremonial cloth and gold ornaments during temple festivals with majestic presence, traditional Indonesian bird markets with exotic species including birds of paradise with elaborate plumage used in ceremonial headdresses, Indonesian tiger spirits roaming through jungle temples with powerful grace while protecting sacred groves from human interference, traditional Indonesian herbal medicine gardens with plants that cure diseases rendered with botanical precision, sacred Indonesian mangrove forests serving as nurseries for marine life while protecting coastlines with ecological beauty, traditional Indonesian animal totems with each tribe having sacred animal spirits that guide and protect community members, hyperrealistic nature visualization with detailed flora and fauna showing the incredible biodiversity of Indonesian ecosystem in stunning 8K quality",

      // WEEK 4: VOLCANOES - Enhanced with geological drama and fire effects
      volcanoes:
        "GODLEVEL PROMPT: Indonesian Genesis Volcanic Creation - Sacred Fire Mountains Forging the Archipelago rendered as epic geological masterpiece, Batara Agni fire god emerging from molten earth core with crown of volcanic flames and robes woven from liquid lava with realistic fire effects, Mount Merapi the most sacred volcano breathing divine fire with volumetric smoke while Javanese sultans perform ancient ceremonies to appease volcanic spirits, Ring of Fire geological formation with active volcanoes creating the backbone of Indonesian islands through millions of years of eruptions with dramatic lighting, sacred volcanic ash Lahar flowing down mountain slopes with realistic particle effects creating the most fertile agricultural soil on earth where rice and spices grow abundantly, traditional Indonesian volcano worship ceremonies with offerings of flowers rice and incense placed at crater edges with spiritual atmosphere, Krakatoa legendary volcanic explosion that was heard around the world with spectacular visual effects creating magnificent sunsets for years afterward, volcanic hot springs Pemandian Air Panas with healing mineral waters where locals bathe with steam effects and therapeutic atmosphere, traditional Indonesian sulfur miners working in dangerous conditions at Kawah Ijen volcano where blue flames of burning sulfur create otherworldly scenes with realistic fire effects, sacred Mount Agung towering over Balinese temples as spiritual axis with majestic presence where Hindu gods reside in volcanic peaks, volcanic glass Obsidian formed from rapid cooling of lava flows used by ancient Indonesian craftsmen with crystalline beauty, traditional Indonesian volcanic sand beaches with black sand created from volcanic activity providing unique coastal landscapes with dramatic contrast, volcanic crater lakes Danau Kawah with turquoise waters heated by underground thermal activity creating mystical atmospheric effects with steam and mist, sacred volcanic stones used in traditional Indonesian architecture with detailed textures and ancient craftsmanship, traditional Indonesian fire walking ceremonies where devotees walk across hot volcanic coals with spiritual energy effects, volcanic lightning phenomena during major eruptions creating spectacular electrical displays with realistic lightning effects, traditional Indonesian volcanic observatories where scientists monitor seismic activity with modern technology respecting traditional beliefs, sacred volcanic caves formed by lava tubes serving as meditation retreats with mystical lighting, traditional Indonesian volcanic agriculture with farmers growing crops on steep volcanic slopes using ancient terracing techniques with agricultural beauty, volcanic thermal energy harnessed by modern Indonesia with geothermal facilities maintaining respect for traditional beliefs, hyperrealistic volcanic visualization with molten lava flows and dramatic lighting showing the raw geological power that created Indonesian islands in breathtaking 8K quality",

      // Enhanced traditional cultural scenarios with modern cinematic vision
      garuda:
        "GODLEVEL PROMPT: Majestic Garuda Wisnu Kencana soaring through celestial realms rendered as epic fantasy masterpiece, massive divine eagle with wingspan across golden sunset skies with volumetric lighting, intricate feather details with ethereal light effects and realistic texture, powerful talons gripping sacred lotus blossoms with delicate beauty, noble eagle head crowned with jeweled diadem catching light, eyes blazing with cosmic wisdom and inner fire, Lord Vishnu mounted upon Garuda's back in divine regalia with four arms holding sacred conch shell, discus wheel of time, lotus of creation, ceremonial staff with magical energy effects, flowing silk garments in royal blues and golds with fabric physics, Mount Meru rising with cascading waterfalls of liquid starlight and particle effects, temple spires through clouds of incense with atmospheric lighting, Indonesian archipelago spread below like scattered emeralds in sapphire seas with aerial perspective, Ring of Fire volcanoes glowing with sacred flames and realistic fire effects, traditional gamelan music visualized as golden sound waves with harmonic patterns, ancient Sanskrit mantras as luminous script floating in air, Ramayana epic scenes in floating stone tablets with animated reliefs, divine aura radiating rainbow light spectrum with prismatic effects, cosmic mandala patterns swirling in heavens with mathematical precision, islands visible as points of light with bioluminescent beauty, Borobudur and Prambanan temples glowing with spiritual energy and architectural detail, traditional Indonesian textiles woven into reality fabric with intricate patterns, hyperrealistic fantasy art with cinematic lighting and 8K detail",

      wayang:
        "GODLEVEL PROMPT: Mystical Wayang Kulit shadow puppet performance bringing ancient epics to life rendered as cinematic cultural masterpiece, master dalang puppeteer silhouetted behind glowing white screen with dramatic lighting, intricately carved leather puppets with gold leaf details catching flickering oil lamp light with realistic shadows, dramatic shadows dancing into living characters with motion effects, Prince Rama with noble features and ornate crown alongside Princess Sita with flowing hair and delicate jewelry rendered in stunning detail, mighty Hanuman the white monkey hero leaping through air with mountain in grasp showing incredible strength, gamelan orchestra creating visible sound waves in metallic gold and silver with harmonic visualization, traditional Indonesian musicians in batik clothing playing gender, saron, kendang drums with cultural authenticity, audience sitting cross-legged on woven mats mesmerized by eternal stories with emotional engagement, coconut oil lamps casting warm amber light creating multiple shadow layers with atmospheric effects, ancient Javanese script floating in air telling story with mystical energy, tropical night sky with stars and flying spirits with ethereal beauty, traditional Javanese architecture with carved wooden pillars and clay tile roofs showing architectural mastery, incense smoke curling upward carrying prayers to ancestors with volumetric effects, banana leaves and frangipani flowers as offerings with natural beauty, cultural heritage spanning centuries as golden threads connecting past to present with temporal effects, hyperrealistic cultural documentation with cinematic lighting and 8K detail",

      batik:
        "GODLEVEL PROMPT: Infinite cosmic tapestry of sacred Indonesian batik patterns coming alive with supernatural energy rendered as textile art masterpiece, master batik artisan applying hot wax with traditional canting tool creating flowing lines transforming into living rivers of light with magical effects, parang rusak diagonal patterns representing flowing water and eternal life force undulating like ocean waves with fluid dynamics, kawung geometric circles symbolizing cosmic order expanding into mandala formations pulsing with universal rhythm and energy effects, mega mendung cloud motifs in deep indigo blues swirling with actual storm clouds and lightning with realistic weather effects, ceplok star formations bursting into real constellations with stellar beauty, sido mukti prosperity symbols manifesting as golden coins and rice grains falling like blessed rain with particle effects, royal court designs with protective meanings creating shields of light around ancient Javanese palaces with architectural grandeur, intricate hand-drawn patterns using traditional canting tools guided by ancestral spirits with spiritual energy, natural dyes from indigo plants, turmeric roots, mahogany bark creating earth tones shifting like living skin with organic beauty, cultural identity woven into fabric of reality itself with metaphysical effects, UNESCO heritage craft mastery passed down through generations with historical depth, each pattern telling stories of creation myths and heroic legends with narrative power, textile becoming portal to spiritual realm where ancestors dance in eternal celebration with otherworldly beauty, hyperrealistic textile art with intricate detail and 8K quality",

      borobudur:
        "GODLEVEL PROMPT: Magnificent Borobudur temple rising from misty Javanese plains like massive stone mandala connecting earth to heaven rendered as architectural masterpiece, world's largest Buddhist monument glowing with golden sunrise light and volumetric effects, relief panels carved into volcanic stone coming alive with animated scenes of Buddha's teachings with spiritual energy, Buddha statues in perfect meditation poses each radiating serene enlightenment energy with ethereal aura, bell-shaped stupas containing hidden Buddha figures emerging from stone like lotus flowers blooming with magical effects, three circular platforms representing Buddhist cosmology with different colored auras and energy levels, pilgrims in white robes walking clockwise path to enlightenment leaving trails of golden light with spiritual journey visualization, ancient stones weathered by centuries telling stories of devotion with historical depth, sunrise illuminating the monument with divine radiance while Mount Merapi volcano smokes majestically in background with dramatic landscape, largest Buddhist temple complex surrounded by lush tropical jungle and rice paddies with natural beauty, architectural marvel embodying spiritual journey visualized as ascending spirals of light with metaphysical effects, Sailendra dynasty builders' vision manifested in perfect sacred geometry with mathematical precision, relief carvings depicting Prince Siddhartha's path to becoming Buddha animated with supernatural life and storytelling power, celestial beings and bodhisattvas floating around the temple in meditation with ethereal presence, traditional Javanese gamelan music resonating from the stones with harmonic visualization, incense smoke from countless offerings creating mystical atmosphere with volumetric effects, UNESCO World Heritage site protected by guardian spirits with spiritual protection, morning mist revealing and concealing the temple like divine revelation with atmospheric drama, pilgrims from around the world climbing sacred steps in spiritual pilgrimage with cultural diversity, ancient wisdom carved in stone speaking across centuries with timeless message, hyperrealistic architectural photography with dramatic lighting and 8K detail",

      komodo:
        "GODLEVEL PROMPT: Prehistoric Komodo dragons prowling volcanic islands rendered as wildlife documentary masterpiece, largest living lizards on Earth with massive muscular bodies and realistic scale detail, powerful jaws capable of delivering venomous bite with predatory intensity, ancient survivors from age of dinosaurs with prehistoric majesty, scaly armor-like skin glistening in tropical Indonesian sun with detailed texture, forked tongues flicking out to taste air with sensory precision, muscular tails and razor-sharp claws with anatomical accuracy, endemic to Indonesian archipelago representing untamed wilderness with natural power, living legends of Flores and Rinca islands with cultural significance, conservation symbols representing battle between modern world and ancient nature with environmental message, mystical connection to dragon mythology with legendary atmosphere, volcanic landscape of Komodo National Park with rugged hills and dramatic terrain, pink sand beaches where dragons hunt with coastal beauty, deer and wild boar fleeing in terror with realistic animal behavior, traditional Indonesian fishing boats anchored in crystal blue waters with maritime culture, park rangers observing from safe distance with conservation efforts, tourists witnessing living prehistory with educational value, UNESCO World Heritage marine park with ecological protection, Ring of Fire volcanic activity creating dramatic landscape with geological beauty, traditional Indonesian villages coexisting with dragons with cultural harmony, ancient folklore and legends about dragon kings with mythological depth, scientific research revealing secrets of evolution with educational content, hyperrealistic wildlife cinematography with dramatic lighting and 8K detail",

      dance:
        "GODLEVEL PROMPT: Graceful Balinese Legong dancers in elaborate golden costumes performing ancient court dance rendered as cultural performance masterpiece, intricate headdresses adorned with fresh frangipani flowers and golden ornaments catching temple lamplight with stunning detail, precise mudra hand gestures telling stories of gods and demons through sacred choreography with cultural authenticity, gamelan orchestra creating hypnotic metallic rhythms with harmonic visualization, Javanese court dances with refined elegance performed in royal palaces with aristocratic grace, Saman dance from Aceh with dozens of male dancers in perfect synchronization creating human mandala patterns with geometric beauty, colorful silk fabrics flowing with each gesture like liquid rainbows with fabric physics, spiritual devotion expressed through movement connecting earthly realm to divine consciousness with metaphysical effects, cultural storytelling through choreographed artistry with narrative power, temple ceremonies coming alive with dancers embodying Hindu deities with spiritual transformation, traditional Indonesian music visualized as golden sound waves with harmonic patterns, elaborate makeup and costumes transforming dancers into living gods with theatrical beauty, incense smoke swirling around performers creating mystical atmosphere with volumetric effects, tropical temple courtyards with carved stone pillars and lotus ponds with architectural grandeur, audiences mesmerized by ancient artistry with emotional engagement, UNESCO Intangible Cultural Heritage with historical significance, master dance teachers passing knowledge with educational value, traditional Indonesian philosophy of harmony expressed through movement with philosophical depth, hyperrealistic performance documentation with cinematic lighting and 8K detail",

      temples:
        "GODLEVEL PROMPT: Ornate Pura Besakih mother temple complex on Mount Agung slopes rendered as architectural masterpiece, multi-tiered meru towers reaching toward heavens with spiritual symbolism, intricate stone carvings depicting mythological scenes coming alive with supernatural energy, ceremonial gates adorned with guardian statues with protective presence, lotus ponds reflecting temple spires with perfect mirror reflections, incense smoke rising from prayer altars with volumetric effects, devotees in white ceremonial dress performing daily rituals with spiritual devotion, tropical flowers as offerings creating colorful carpets with natural beauty, ancient architecture blending with natural landscape with harmonious design, spiritual sanctuary where Hindu-Dharma religion thrives with religious significance, Prambanan temple complex with towering spires dedicated to Hindu trinity with divine presence, elaborate relief carvings telling epic stories with narrative power, traditional Balinese architecture with red brick and volcanic stone with material authenticity, temple festivals with thousands of devotees with cultural celebration, gamelan orchestras playing sacred music with harmonic beauty, holy water ceremonies where priests bless devotees with spiritual ritual, temple dancers performing in courtyards bringing Hindu mythology to life with cultural performance, traditional offerings arranged in beautiful geometric patterns with artistic arrangement, UNESCO World Heritage sites preserving ancient architectural masterpieces with historical preservation, spiritual energy radiating from ancient stones with metaphysical presence, hyperrealistic architectural photography with dramatic lighting and 8K detail",

      // Enhanced indigenous group scenarios with cultural authenticity and modern visual quality
      javanese:
        "GODLEVEL PROMPT: Magnificent Javanese royal court rendered as cultural heritage masterpiece, elaborate batik patterns with philosophical meanings covering silk garments with intricate textile detail, gamelan orchestras creating meditative soundscapes with harmonic visualization, traditional Javanese architecture with joglo roofs and carved wooden pillars with architectural mastery, shadow puppet wayang performances where dalang masters weave epic tales with storytelling power, ancient Hindu-Buddhist influences merged with Islamic culture with cultural synthesis, terraced rice cultivation creating geometric patterns with agricultural beauty, traditional ceremonies connecting living descendants to royal ancestors with spiritual continuity, sophisticated artistic heritage with court painters, musicians, and craftsmen with cultural refinement, Sultan's palace Kraton with sacred layout representing cosmic order with architectural symbolism, traditional Javanese philosophy of harmony expressed in daily life with philosophical depth, court dancers in elaborate costumes performing sacred dances with cultural performance, royal gamelan sets made of bronze and gold with musical artistry, traditional Javanese script and literature preserving ancient wisdom with literary heritage, ceremonial keris daggers with mystical powers with cultural artifacts, traditional medicine and healing practices with holistic wellness, hyperrealistic cultural documentation with rich detail and 8K quality",

      sundanese:
        "GODLEVEL PROMPT: West Java's indigenous Sundanese people rendered as highland cultural masterpiece, traditional bamboo architecture with elevated houses on stilts with sustainable design, angklung bamboo musical instruments creating harmonious melodies with musical beauty, traditional Sundanese dance performances with graceful movements with cultural expression, rice cultivation in mountainous terrain creating spectacular terraced landscapes with agricultural artistry, unique culinary traditions with fresh vegetables and mountain cuisine with gastronomic culture, traditional clothing and textiles with intricate patterns with textile artistry, ancient animistic beliefs blended with Islam with spiritual synthesis, community cooperation gotong royong traditions with social harmony, highland agricultural practices adapted to volcanic soil with environmental adaptation, traditional houses with steep roofs and bamboo walls with architectural functionality, Sundanese language with its own script and literature with linguistic heritage, traditional crafts including bamboo weaving and wood carving with artisanal skill, mountain festivals celebrating harvest and seasonal changes with cultural celebration, traditional healing practices using mountain herbs with natural medicine, hyperrealistic highland culture documentation with dramatic mountain landscapes and 8K detail",

      batak:
        "GODLEVEL PROMPT: North Sumatra highland Batak people rendered as Lake Toba cultural masterpiece, traditional Batak houses with dramatic curved roofs resembling buffalo horns with architectural symbolism, intricate wood carvings and decorative elements telling clan histories with narrative artistry, traditional ulos textiles with sacred meanings woven by master craftswomen with textile mastery, patrilineal clan system and ancestral worship with spiritual tradition, Lake Toba cultural landscape with world's largest volcanic lake with geological grandeur, traditional music with gondang instruments creating rhythms that summon ancestral spirits with spiritual music, stone megalithic monuments erected by ancient Batak kings with archaeological significance, ancient Batak script and literature preserving oral traditions with literary heritage, ceremonial feasts and rituals celebrating life passages with cultural ceremony, warrior traditions and oral histories with heroic narratives, traditional Batak architecture with houses built without nails with engineering mastery, clan totems and symbols carved into house facades with cultural identity, traditional ceremonies for naming, marriage, and death with life cycle rituals, Batak Christian churches blending traditional architecture with religious synthesis, hyperrealistic cultural photography with Lake Toba landscape and dramatic lighting in 8K detail",

      dayak:
        "GODLEVEL PROMPT: Indigenous Dayak peoples of Kalimantan Borneo rendered as rainforest cultural masterpiece, traditional longhouses accommodating extended families with communal architecture, intricate beadwork and traditional costumes with artistic craftsmanship, headhunting historical traditions with cultural artifacts, river-based transportation and settlements with aquatic lifestyle, traditional tattoos with spiritual significance with body art, hornbill bird cultural symbolism with sacred feathers with natural symbolism, forest-based lifestyle and hunting practices with traditional skills, shamanic traditions and spiritual beliefs with forest spirituality, traditional crafts and woodcarving creating masks and totems with artistic expression, oral traditions and folklore with cultural storytelling, traditional medicine using rainforest plants with natural healing, longhouse architecture built on stilts with functional design, traditional ceremonies for rice planting and harvest with agricultural ritual, warrior culture with elaborate shields and weapons with martial tradition, hyperrealistic rainforest photography with traditional longhouses and atmospheric jungle lighting in 8K detail",

      acehnese:
        "GODLEVEL PROMPT: Northernmost Sumatra Acehnese province rendered as Islamic cultural masterpiece, traditional Acehnese architecture with Islamic influences with architectural fusion, distinctive cultural practices blending Islamic faith with local customs with religious synthesis, traditional Saman dance performances with dozens of dancers in perfect synchronization with choreographic precision, coffee cultivation and trade traditions with agricultural heritage, tsunami resilience and community strength with disaster recovery, traditional clothing and textiles with Islamic geometric patterns with textile artistry, Islamic educational institutions dayah preserving religious knowledge with educational tradition, maritime trading heritage with traditional boats with nautical culture, unique Acehnese dialect and language with linguistic identity, traditional crafts and metalwork creating Islamic calligraphy with artistic skill, Grand Mosque of Baiturrahman with black domes and minarets with architectural grandeur, traditional Acehnese houses with steep roofs with functional architecture, Islamic law Sharia implementation with legal tradition, traditional ceremonies for Islamic holidays with religious celebration, hyperrealistic cultural documentation with Islamic architecture and dramatic lighting in 8K detail",

      minangkabau:
        "GODLEVEL PROMPT: West Sumatra Minangkabau people rendered as matrilineal cultural masterpiece, distinctive rumah gadang houses with dramatic horn-shaped roofs with architectural symbolism, traditional Minang cuisine and culinary heritage with gastronomic excellence, matriarchal inheritance and family systems with social structure, traditional ceremonies and adat customs with cultural governance, skilled traders and merchants with commercial tradition, traditional textiles and songket weaving with gold threads with luxury craftsmanship, Islamic scholarship and education with religious learning, traditional music and dance celebrating Minang cultural identity with cultural performance, philosophical wisdom and proverbs guiding daily life with cultural philosophy, traditional architecture with carved wooden facades with decorative artistry, clan system organizing social relationships with kinship structure, traditional markets with Minang women as successful traders with economic empowerment, ceremonial costumes with elaborate headdresses and jewelry with ceremonial regalia, hyperrealistic cultural photography with traditional rumah gadang architecture and rich detail in 8K quality",

      "balinese-tribe":
        "GODLEVEL PROMPT: Bali island people rendered as Hindu-Dharma paradise masterpiece, elaborate temple ceremonies and festivals with thousands of devotees with religious celebration, traditional Balinese architecture and sculpture with intricate stone carvings with architectural artistry, wood and stone carvings depicting Hindu mythology with narrative sculpture, traditional dance and music performances bringing Hindu epics to life with cultural performance, rice terrace agriculture and subak irrigation system with agricultural engineering, traditional clothing and ceremonial dress with gold ornaments with ceremonial regalia, artistic traditions in painting and crafts with cultural artistry, community temple obligations connecting villages to divine realm with spiritual community, unique Balinese calendar system with religious festivals with temporal tradition, traditional healing practices using herbs and spiritual energy with holistic medicine, temple festivals with elaborate decorations and offerings with religious artistry, gamelan orchestras playing sacred music with musical tradition, traditional crafts including wood carving, stone sculpture, and silver jewelry with artisanal mastery, Hindu philosophy integrated with local animistic beliefs with spiritual synthesis, hyperrealistic cultural documentation with Balinese temple ceremonies and dramatic lighting in 8K detail",

      papuans:
        "GODLEVEL PROMPT: New Guinea indigenous peoples rendered as cultural diversity masterpiece, traditional houses on stilts and tree houses with elevated architecture, elaborate feathered headdresses and body decorations using bird of paradise plumes with ceremonial regalia, hundreds of distinct languages making Papua most linguistically diverse region with linguistic richness, traditional hunting and gathering practices with subsistence skills, bird of paradise cultural significance with sacred feathers with natural symbolism, traditional music with drums and flutes with musical tradition, body painting and scarification traditions with body art, sago palm cultivation and processing with traditional agriculture, tribal warfare and peace-making ceremonies with conflict resolution, oral traditions and storytelling preserving tribal history with cultural memory, traditional tools and weapons made from natural materials with technological adaptation, highland tribes with different customs from coastal peoples with ecological diversity, traditional ceremonies for initiation and life passages with ritual tradition, hyperrealistic ethnographic photography with Papuan cultural diversity and dramatic New Guinea landscapes in 8K detail",

      baduy:
        "GODLEVEL PROMPT: Banten Java Baduy tribe rendered as traditional lifestyle preservation masterpiece, traditional white and black clothing distinctions with cultural identity, sustainable agriculture without modern tools with ecological farming, traditional houses without modern conveniences with sustainable living, oral tradition and customary law governing daily life with cultural governance, forest conservation and environmental protection with ecological stewardship, traditional crafts and weaving using natural materials with sustainable artistry, spiritual connection to ancestral lands with sacred geography, isolation from mainstream society by choice with cultural autonomy, traditional leadership based on ancestral wisdom with indigenous governance, forbidden modern technology with technological resistance, traditional medicine using forest plants with natural healing, sacred forests protected by traditional law with environmental protection, traditional ceremonies marking seasonal changes with temporal ritual, hyperrealistic documentary photography with authentic traditional lifestyle and natural lighting in 8K detail",

      "orang-rimba":
        "GODLEVEL PROMPT: Sumatra nomadic hunter-gatherers rendered as forest lifestyle masterpiece, traditional forest shelters built from natural materials with sustainable architecture, hunting and gathering practices using traditional knowledge with subsistence skills, shamanic spiritual beliefs and forest spirits with animistic spirituality, traditional medicine using forest plants with natural healing, oral traditions and forest knowledge with ecological wisdom, resistance to modernization to preserve traditional lifestyle with cultural preservation, traditional tools and hunting weapons from forest materials with technological adaptation, forest conservation and sustainable practices with ecological stewardship, unique language and cultural expressions with linguistic identity, adaptation to rainforest environment with ecological knowledge, traditional social organization based on kinship with social structure, threatened by deforestation with environmental crisis, traditional ceremonies connecting human world to forest spirits with spiritual ritual, hyperrealistic rainforest photography with authentic nomadic lifestyle and atmospheric jungle lighting in 8K detail",

      "hongana-manyawa":
        "GODLEVEL PROMPT: Indonesia's last nomadic hunter-gatherer tribe rendered as stone age preservation masterpiece, traditional forest shelters and nomadic lifestyle with mobile architecture, hunting with traditional weapons and tools with primitive technology, gathering forest foods and medicines with subsistence knowledge, shamanic spiritual practices connecting to forest spirits with animistic religion, oral traditions and forest knowledge with cultural memory, threatened by deforestation and mining with environmental destruction, traditional social organization based on kinship with tribal structure, unique language and cultural practices with linguistic isolation, adaptation to tropical rainforest with ecological specialization, resistance to outside contact with cultural isolation, traditional ceremonies and rituals marking seasonal changes with temporal awareness, forest spirits and ancestral beliefs guiding decisions with spiritual guidance, hyperrealistic ethnographic photography with stone age lifestyle and authentic forest environment in 8K detail",

      asmat:
        "GODLEVEL PROMPT: New Guinea indigenous Asmat people rendered as woodcarving mastery masterpiece, traditional bis poles and ancestor sculptures reaching toward sky with sculptural artistry, elaborate ceremonial masks and shields with supernatural power with ritual objects, traditional cultural practices and ceremonial displays with cultural performance, sago palm cultivation and processing with traditional agriculture, traditional houses on stilts built over tidal areas with aquatic architecture, spiritual beliefs connecting ancestors and nature with animistic spirituality, traditional music and dance ceremonies honoring ancestral spirits with ritual performance, river-based transportation and settlements with aquatic lifestyle, oral traditions and mythology explaining creation with cosmological narrative, artistic heritage recognized worldwide with international acclaim, traditional tools and carving techniques with artisanal mastery, ceremonial feasts celebrating cultural achievements with community celebration, traditional initiation ceremonies for young people with rite of passage, hyperrealistic art documentation with master woodcarvers at work and intricate sculptural detail in atmospheric swamp environment with 8K quality, master craftsmen carving sacred bis poles from ironwood trees with sculptural precision, intricate ancestral figures emerging from raw timber with artistic transformation, ceremonial shields decorated with protective spirits with ritual artistry, traditional carving tools made from natural materials with primitive technology, swampy mangrove environment with traditional stilt houses with aquatic habitat, spiritual connection between carver and ancestral spirits with artistic inspiration, UNESCO recognized artistic tradition with cultural heritage, museum-quality sculptures representing artistic evolution with historical significance, sacred men's houses displaying cultural artifacts with ritual space, traditional sago processing by women with gender roles, river ceremonies where finished sculptures are blessed with ritual consecration, artistic mastery passed down through generations with cultural transmission, each carving telling stories of creation myths with narrative sculpture",
    }

    if (enhancedScenarioPrompts[scenario]) {
      prompt = enhancedScenarioPrompts[scenario]
    }
  }

  // Enhanced modern color palettes with sophisticated descriptions
  const enhancedColors: Record<string, string> = {
    plasma: "vibrant plasma energy colors with electric blues, magenta, and cyan",
    quantum: "quantum field colors with deep blues, silver, and ethereal white",
    cosmic: "cosmic nebula colors with deep purples, gold, and stellar blue",
    thermal: "thermal spectrum colors with intense reds, orange, and yellow gradients",
    spectral: "full spectrum rainbow colors with prismatic light effects",
    crystalline: "crystal clear colors with diamond white, ice blue, and prismatic reflections",
    bioluminescent: "bioluminescent colors with glowing blues, greens, and ethereal light",
    aurora: "aurora borealis colors with dancing greens, blues, and purple",
    metallic: "metallic colors with chrome, gold, silver, and copper reflections",
    prismatic: "prismatic colors with rainbow light refraction and spectral beauty",
    monochromatic: "sophisticated grayscale with dramatic contrast and tonal depth",
    infrared: "infrared spectrum colors with deep reds and thermal visualization",
    lava: "molten lava colors with intense reds, orange, and volcanic glow",
    futuristic: "futuristic neon colors with electric blues, cyan, and digital glow",
    forest: "forest colors with emerald greens, earth browns, and natural harmony",
    ocean: "ocean colors with deep blues, turquoise, and aquatic beauty",
    sunset: "sunset colors with golden orange, pink, and warm atmospheric glow",
    arctic: "arctic colors with ice blues, crystal white, and polar beauty",
    neon: "neon bright colors with electric intensity and urban glow",
    vintage: "vintage colors with warm sepia, amber, and nostalgic tones",
    toxic: "toxic colors with radioactive greens and hazardous glow",
    ember: "ember colors with glowing orange, red, and fire warmth",
    lunar: "lunar colors with silver gray, moonlight white, and celestial beauty",
    tidal: "tidal colors with ocean blues, foam white, and wave dynamics",
  }

  return cleanPromptForImageGeneration(
    `${prompt}, ${enhancedColors[colorScheme] || "vibrant color palette"}, hyperrealistic 8K digital art masterpiece, cinematic lighting, award-winning composition, stunning visual effects, breathtaking detail`,
  )
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

    // Build prompt with enhanced Indonesian Genesis Creation Story
    const mainPrompt = buildEnhancedModernPrompt(dataset, scenario, colorScheme, customPrompt)
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
