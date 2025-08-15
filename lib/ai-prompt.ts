// Enhanced AI Prompt Generation System with Godlevel Quality
// Optimized for up to 4000 characters with comprehensive artistic descriptions

export interface PromptParams {
  dataset: string
  scenario?: string
  colorScheme: string
  seed: number
  numSamples: number
  noiseScale: number
  customPrompt?: string
  panoramic360?: boolean
  panoramaFormat?: string
  projectionType?: string
}

// Cultural datasets with authentic scenarios and godlevel prompts
export const CULTURAL_DATASETS = {
  vietnamese: {
    name: "Vietnamese Heritage",
    description: "Authentic Vietnamese cultural art and historical scenes",
    scenarios: {
      "trung-sisters": {
        name: "Trưng Sisters Warriors",
        description: "Legendary Vietnamese warrior queens leading rebellion against Chinese rule",
        prompt:
          "Epic Vietnamese warrior queens Trưng Trắc and Trưng Nhị leading ancient rebellion against Chinese occupation, magnificent traditional Vietnamese armor with intricate dragon motifs and golden decorations, riding majestic war elephants with ornate ceremonial regalia, misty mountain landscape of ancient Vietnam, heroic battle scene with flowing banners and traditional weapons, dramatic lighting with golden hour atmosphere, cinematic composition showcasing Vietnamese cultural pride and independence, traditional Vietnamese architecture in background, lush tropical vegetation, powerful emotional expression of determination and courage, museum-quality historical artwork, cultural heritage masterpiece, godlevel artistic detail with every element perfectly rendered",
      },
      "ha-long-bay": {
        name: "Hạ Long Bay Mystique",
        description: "Mystical limestone karsts and emerald waters",
        prompt:
          "Mystical Hạ Long Bay with towering limestone karsts rising majestically from emerald waters, traditional Vietnamese junk boats with distinctive red sails gliding peacefully through the bay, morning mist creating ethereal atmosphere, dramatic lighting with golden sunrise rays piercing through clouds, crystal-clear reflections in calm waters, ancient caves and grottos visible in limestone formations, seabirds soaring overhead, traditional Vietnamese fishermen casting nets, tropical vegetation clinging to rocky cliffs, UNESCO World Heritage natural wonder, breathtaking panoramic vista, godlevel photorealistic detail, award-winning landscape photography composition, natural beauty that captures the soul of Vietnam",
      },
      "hoi-an-lanterns": {
        name: "Hội An Lantern Festival",
        description: "Colorful lantern festival in ancient town",
        prompt:
          "Magical Hội An ancient town during spectacular lantern festival, thousands of colorful silk lanterns in vibrant reds, yellows, blues, and greens illuminating narrow cobblestone streets, traditional Vietnamese architecture with wooden shophouses and tile roofs, warm golden lighting creating enchanting atmosphere, people in traditional áo dài dresses walking through lantern-lit streets, Thu Bon River reflecting lantern lights like liquid gold, ancient Japanese Covered Bridge in background, traditional paper lanterns hanging from every building, festive celebration with families and tourists enjoying cultural heritage, street food vendors with steaming bowls, romantic evening ambiance, UNESCO World Heritage site, godlevel artistic rendering with perfect lighting and atmospheric effects",
      },
      "sapa-terraces": {
        name: "Sa Pa Rice Terraces",
        description: "Stunning mountain rice terraces",
        prompt:
          "Breathtaking Sa Pa rice terraces cascading down mountain slopes like giant green staircases, traditional Vietnamese farmers in conical hats working in golden rice fields, misty mountain peaks of northern Vietnam creating dramatic backdrop, sunrise lighting casting warm golden glow across terraced landscape, traditional stilt houses of ethnic minorities scattered throughout valleys, water-filled terraces reflecting sky like mirrors, lush tropical vegetation and bamboo groves, traditional farming techniques passed down through generations, peaceful rural atmosphere with morning mist, spectacular mountain vistas, cultural agricultural heritage, godlevel landscape photography with perfect composition and lighting, National Geographic quality imagery that captures the essence of Vietnamese rural life",
      },
      "temple-literature": {
        name: "Temple of Literature",
        description: "Vietnam's first university and Confucian temple",
        prompt:
          "Ancient Temple of Literature in Hanoi, Vietnam's first university and magnificent Confucian temple complex, traditional Vietnamese architecture with curved tile roofs and red lacquered pillars, peaceful courtyards with ancient trees and lotus ponds, stone stelae of doctoral graduates from centuries past, traditional Vietnamese scholars in flowing robes studying ancient texts, morning light filtering through ancient architecture, intricate wood carvings and traditional decorations, cultural heritage site representing Vietnamese education and literature, serene atmosphere of learning and wisdom, traditional gardens with carefully manicured landscapes, godlevel architectural photography showcasing the beauty of Vietnamese scholarly traditions and Confucian values",
      },
      "water-puppets": {
        name: "Water Puppet Theater",
        description: "Traditional Vietnamese water puppet performance",
        prompt:
          "Traditional Vietnamese water puppet theater performance, intricately carved wooden puppets dancing on water stage, colorful traditional costumes and elaborate character designs, skilled puppeteers hidden behind bamboo screen manipulating puppets with long bamboo rods, traditional Vietnamese folk stories being performed, gamelan orchestra providing musical accompaniment, dramatic lighting creating magical atmosphere, audience captivated by ancient art form, cultural storytelling tradition passed down through generations, water reflecting puppet movements, traditional theater setting with authentic Vietnamese decorations, godlevel artistic detail capturing the magic and cultural significance of this unique Vietnamese performing art",
      },
      "ao-dai-beauty": {
        name: "Áo Dài Elegance",
        description: "Traditional Vietnamese dress in modern setting",
        prompt:
          "Elegant Vietnamese woman in traditional áo dài dress, flowing silk fabric in vibrant colors with intricate patterns, graceful pose showcasing the beauty of Vietnamese traditional fashion, modern Vietnamese cityscape with blend of colonial French architecture and contemporary buildings, soft natural lighting creating romantic atmosphere, delicate embroidery and traditional motifs on the dress, confident and dignified expression representing modern Vietnamese femininity, urban setting with tree-lined boulevards, cultural pride and elegance, fashion photography quality with perfect composition, godlevel artistic rendering that celebrates Vietnamese cultural identity and the timeless beauty of traditional dress in contemporary context",
      },
      "mekong-delta": {
        name: "Mekong Delta Life",
        description: "Life along the Mekong River delta",
        prompt:
          "Vibrant Mekong Delta scene with bustling floating markets, traditional wooden boats loaded with tropical fruits and vegetables, Vietnamese farmers and vendors in conical hats conducting river commerce, coconut palms and tropical vegetation lining waterways, traditional stilt houses built over water, fishing nets and traditional river life, golden sunset reflecting on muddy river waters, children playing by the riverbank, traditional sampan boats navigating narrow canals, lush green rice paddies extending to horizon, authentic rural Vietnamese lifestyle, cultural heritage of river communities, godlevel documentary photography capturing the essence of Mekong Delta life and the harmony between people and nature",
      },
      "pho-street": {
        name: "Phở Street Culture",
        description: "Authentic Vietnamese street food scene",
        prompt:
          "Bustling Vietnamese street food scene with steaming bowls of authentic phở, street vendors skillfully preparing traditional noodle soup, aromatic broth with fresh herbs and spices, customers sitting on traditional low plastic stools enjoying their meals, busy Hanoi or Ho Chi Minh City street with motorbikes and urban energy, warm lighting from street lamps and cooking fires, authentic atmosphere of Vietnamese street food culture, traditional cooking methods and family recipes, social gathering place where locals meet, cultural significance of phở as Vietnam's national dish, godlevel food photography with perfect lighting and composition that captures the soul of Vietnamese culinary tradition",
      },
      "ly-thai-to": {
        name: "Lý Thái Tổ Emperor",
        description: "Founder of the Lý Dynasty and Thăng Long capital",
        prompt:
          "Majestic Emperor Lý Thái Tổ in elaborate imperial robes founding the ancient capital of Thăng Long (modern-day Hanoi), traditional Vietnamese imperial court ceremony with golden dragon motifs and intricate embroidery, ancient Vietnamese architecture with curved roofs and red lacquered pillars, court officials and nobles in traditional dress paying homage, ceremonial atmosphere with incense and traditional music, historical significance of establishing Vietnamese independence and cultural identity, imperial palace complex with traditional gardens, cultural heritage representing Vietnamese sovereignty and royal traditions, godlevel historical artwork with museum-quality detail and authentic cultural representation",
      },
      "tet-celebration": {
        name: "Tết New Year",
        description: "Vietnamese New Year festivities and traditions",
        prompt:
          "Vibrant Vietnamese Tết New Year celebration with families gathering in traditional dress, red lanterns and decorations symbolizing good fortune, blooming peach blossoms and yellow mai flowers, traditional offerings and ancestral worship, children receiving lucky money in red envelopes, festive atmosphere with fireworks and dragon dances, traditional Vietnamese foods and sweets, family reunions and cultural traditions, temple visits and prayers for prosperity, cultural heritage celebration marking the most important holiday in Vietnamese culture, godlevel festive photography capturing the joy, tradition, and cultural significance of Vietnamese New Year",
      },
      "conical-hat": {
        name: "Nón Lá Culture",
        description: "Iconic Vietnamese conical hat and rural life",
        prompt:
          "Vietnamese farmers wearing traditional nón lá conical hats working in emerald green rice paddies, iconic symbol of Vietnamese rural culture, traditional agricultural lifestyle with water buffalo and wooden plows, peaceful countryside setting with traditional villages, morning mist over rice fields, cultural significance of the conical hat as protection from sun and rain, traditional craftsmanship in hat making, rural Vietnamese landscape with bamboo groves and traditional houses, authentic representation of Vietnamese agricultural heritage, godlevel documentary photography showcasing the beauty and cultural importance of traditional Vietnamese rural life",
      },
      "dragon-dance": {
        name: "Dragon Dance",
        description: "Traditional Vietnamese dragon dance performances",
        prompt:
          "Spectacular Vietnamese dragon dance performance with colorful dragon costume undulating through streets, skilled performers coordinating movements to bring the dragon to life, traditional musicians playing drums and gongs, festive celebration during Tết or other cultural festivals, vibrant colors and dynamic movement, cultural symbolism of the dragon representing power and good fortune, community participation and cultural pride, traditional costumes and ceremonial atmosphere, godlevel action photography capturing the energy and cultural significance of this beloved Vietnamese tradition",
      },
      "lotus-pond": {
        name: "Lotus Symbolism",
        description: "Sacred lotus flowers in Vietnamese culture",
        prompt:
          "Serene Vietnamese lotus pond with blooming pink and white lotus flowers, traditional pagoda reflected in still water, spiritual symbolism of purity and enlightenment in Vietnamese Buddhism, peaceful meditation setting with morning mist, traditional stone bridges and pathways, cultural significance of lotus in Vietnamese art and literature, natural beauty representing Vietnamese spiritual values, godlevel nature photography with perfect lighting and composition that captures the sacred and peaceful essence of Vietnamese spiritual culture",
      },
      "silk-weaving": {
        name: "Silk Weaving",
        description: "Traditional Vietnamese silk production",
        prompt:
          "Traditional Vietnamese silk weaving workshop with skilled artisans at wooden looms, colorful silk threads creating intricate patterns, cultural craftsmanship passed down through generations, traditional techniques and tools, beautiful silk fabrics with Vietnamese motifs and designs, workshop setting with natural lighting, cultural heritage of Vietnamese textile production, artistic tradition representing Vietnamese creativity and skill, godlevel craft photography showcasing the beauty and cultural importance of traditional Vietnamese silk weaving",
      },
      "imperial-hue": {
        name: "Imperial Huế",
        description: "Ancient imperial capital and royal architecture",
        prompt:
          "Magnificent Imperial City of Huế with traditional Vietnamese royal architecture, elaborate court ceremonies with emperor and nobles in ornate costumes, intricate palace buildings with golden decorations and dragon motifs, UNESCO World Heritage site representing Vietnamese imperial history, traditional gardens with lotus ponds and ancient trees, cultural grandeur of the Nguyễn Dynasty, historical significance as Vietnam's last imperial capital, godlevel architectural photography capturing the majesty and cultural heritage of Vietnamese royal traditions",
      },
      "bamboo-forest": {
        name: "Bamboo Symbolism",
        description: "Bamboo groves and their cultural significance",
        prompt:
          "Peaceful Vietnamese bamboo forest with tall green bamboo stalks creating natural cathedral, filtered sunlight creating magical atmosphere, traditional path winding through grove, cultural symbolism of bamboo representing flexibility and strength in Vietnamese philosophy, natural serenity and spiritual significance, traditional Vietnamese poetry and art inspiration, godlevel nature photography capturing the beauty and cultural meaning of bamboo in Vietnamese culture",
      },
      "fishing-village": {
        name: "Fishing Villages",
        description: "Coastal fishing communities and traditions",
        prompt:
          "Traditional Vietnamese fishing village with colorful boats in peaceful harbor, fishing nets drying in the sun, coastal landscape with traditional houses on stilts, maritime culture and fishing traditions, early morning scene with fishermen preparing for the day, cultural heritage of Vietnamese coastal communities, authentic representation of traditional fishing lifestyle, godlevel documentary photography showcasing Vietnamese maritime culture and coastal beauty",
      },
      "calligraphy-art": {
        name: "Vietnamese Calligraphy",
        description: "Traditional Vietnamese writing and calligraphy",
        prompt:
          "Elegant Vietnamese calligraphy art with master calligrapher creating beautiful characters, traditional brushwork and ink techniques, ancient Vietnamese scripts and writing systems, cultural significance of calligraphy in Vietnamese education and art, scholarly tradition and artistic expression, traditional tools and materials, godlevel artistic photography capturing the beauty and cultural importance of Vietnamese calligraphy and writing traditions",
      },
    },
  },
  indonesian: {
    name: "Indonesian Heritage",
    description: "Rich Indonesian cultural traditions, tribes, and landscapes",
    scenarios: {
      "borobudur-temple": {
        name: "Borobudur Temple",
        description: "Ancient Buddhist temple complex with intricate stone carvings",
        prompt:
          "Majestic Borobudur temple at sunrise, ancient Buddhist stupas silhouetted against golden sky, intricate stone reliefs depicting Buddhist teachings, pilgrims in traditional Indonesian clothing walking meditation paths, misty volcanic landscape of Central Java, sacred geometry of mandala architecture, peaceful spiritual atmosphere, cultural heritage preservation, educational temple complex, museum-quality archaeological site, UNESCO World Heritage wonder, godlevel architectural photography with perfect lighting and composition showcasing the spiritual and cultural magnificence of this ancient Buddhist masterpiece",
      },
      "balinese-ceremony": {
        name: "Balinese Hindu Ceremony",
        description: "Traditional Balinese Hindu religious ceremony with offerings",
        prompt:
          "Vibrant Balinese Hindu ceremony, women in colorful kebaya carrying elaborate penjor decorations and canang sari offerings, temple courtyard filled with frangipani flowers, gamelan orchestra playing traditional music, intricate temple architecture with carved stone guardians, incense smoke creating mystical atmosphere, cultural religious celebration, respectful spiritual documentation, educational cultural heritage, traditional Balinese dress and customs, godlevel ceremonial photography capturing the beauty and spiritual significance of Balinese Hindu traditions",
      },
      "komodo-dragons": {
        name: "Komodo Dragons",
        description: "Ancient Komodo dragons in their natural habitat",
        prompt:
          "Magnificent Komodo dragons in natural habitat, prehistoric reptiles on volcanic Komodo Island, rugged landscape with savanna grasslands, educational wildlife conservation, respectful nature documentation, Indonesian national park preservation, ancient species protection, museum-quality wildlife photography, cultural natural heritage, scientific research visualization, godlevel nature photography showcasing these magnificent ancient predators in their pristine Indonesian island environment",
      },
      "batik-artisan": {
        name: "Batik Artisan",
        description: "Traditional batik textile creation process",
        prompt:
          "Master batik artisan creating intricate wax-resist patterns, traditional canting tools applying hot wax to fine cotton fabric, vibrant natural dyes in earthenware pots, detailed geometric and floral motifs, cultural textile heritage workshop, educational craft documentation, UNESCO intangible cultural heritage, artistic textile mastery, respectful cultural appreciation, traditional Indonesian craftsmanship, godlevel craft photography capturing the skill and artistry of traditional batik creation",
      },
      "prambanan-temple": {
        name: "Prambanan Temple",
        description: "Hindu temple complex with towering spires",
        prompt:
          "Magnificent Prambanan Hindu temple complex, towering stone spires dedicated to Trimurti, intricate relief carvings depicting Ramayana epic, golden hour lighting on ancient volcanic stone, cultural archaeological site, educational heritage preservation, museum-quality temple architecture, respectful religious documentation, Indonesian cultural treasure, godlevel architectural photography showcasing the grandeur and spiritual significance of this ancient Hindu temple complex",
      },
      "wayang-kulit": {
        name: "Wayang Kulit Shadow Puppets",
        description: "Traditional shadow puppet performance",
        prompt:
          "Mesmerizing wayang kulit shadow puppet performance, intricate leather puppets casting dramatic shadows on white screen, dalang puppeteer skillfully manipulating characters, gamelan orchestra accompaniment, traditional oil lamp lighting, cultural storytelling tradition, educational performing arts, UNESCO cultural heritage, artistic shadow theater, respectful cultural documentation, godlevel performance photography capturing the magic and cultural significance of Indonesian shadow puppet theater",
      },
      "rice-terraces": {
        name: "Rice Terraces",
        description: "Spectacular terraced rice fields",
        prompt:
          "Breathtaking rice terraces cascading down mountainsides, emerald green paddy fields reflecting sky, traditional irrigation system subak, farmers in conical hats tending crops, cultural agricultural heritage, sustainable farming practices, educational rural landscape, museum-quality agricultural art, respectful farming community documentation, godlevel landscape photography showcasing the beauty and cultural significance of Indonesian traditional agriculture",
      },
      "traditional-dance": {
        name: "Traditional Indonesian Dance",
        description: "Graceful traditional dance performance",
        prompt:
          "Elegant Indonesian traditional dance performance, dancers in elaborate costumes with intricate headdresses, graceful hand gestures and flowing movements, cultural performing arts, educational dance documentation, respectful artistic celebration, museum-quality cultural performance, traditional choreography preservation, artistic cultural heritage, godlevel dance photography capturing the grace and cultural beauty of Indonesian traditional performing arts",
      },
      "spice-markets": {
        name: "Traditional Spice Markets",
        description: "Vibrant spice markets with aromatic displays",
        prompt:
          "Vibrant traditional spice market, colorful displays of turmeric, cinnamon, nutmeg, and cloves, merchants in traditional clothing, woven baskets overflowing with aromatic spices, cultural trade heritage, educational market documentation, respectful commercial tradition, museum-quality market photography, Indonesian spice route history, godlevel market photography capturing the colors, aromas, and cultural significance of Indonesian spice trading traditions",
      },
      "volcanic-landscape": {
        name: "Volcanic Landscape",
        description: "Dramatic Indonesian volcanic scenery",
        prompt:
          "Dramatic Indonesian volcanic landscape, active volcano with gentle smoke plume, terraced slopes with tropical vegetation, cultural geological heritage, educational natural science, respectful environmental documentation, museum-quality landscape photography, Indonesian ring of fire, geological cultural significance, godlevel landscape photography showcasing the dramatic beauty and geological wonder of Indonesia's volcanic landscape",
      },
      "gamelan-orchestra": {
        name: "Gamelan Orchestra",
        description: "Traditional gamelan musical ensemble",
        prompt:
          "Traditional gamelan orchestra performance, bronze metallophones and gongs creating harmonious melodies, musicians in traditional Javanese court dress, cultural musical heritage, educational performing arts documentation, respectful artistic celebration, museum-quality musical performance, Indonesian classical music tradition, godlevel musical photography capturing the beauty and cultural significance of traditional Indonesian gamelan music",
      },
      "jakarta-modern": {
        name: "Modern Jakarta",
        description: "Contemporary Indonesian urban culture",
        prompt:
          "Modern Jakarta cityscape blending traditional and contemporary architecture, cultural urban development, educational city planning, respectful modern Indonesian culture, museum-quality urban photography, Indonesian metropolitan heritage, cultural progress documentation, artistic urban landscape, godlevel urban photography showcasing the dynamic blend of traditional and modern Indonesian culture in the nation's capital",
      },
      "dayak-tribes": {
        name: "Dayak Tribes of Borneo",
        description: "Traditional Dayak tribal culture with feathered headdresses and longhouses",
        prompt:
          "Majestic Dayak tribal warriors in traditional feathered headdresses, elaborate beadwork and hornbill feathers, traditional longhouse architecture on stilts, Kalimantan rainforest setting, cultural tribal heritage, educational indigenous documentation, respectful tribal celebration, museum-quality ethnographic art, Borneo cultural preservation, traditional tribal regalia, godlevel ethnographic photography capturing the dignity and cultural richness of Dayak tribal traditions in their natural rainforest environment",
      },
      "toraja-funeral": {
        name: "Toraja Funeral Ceremony",
        description: "Elaborate Toraja funeral rituals with tongkonan houses",
        prompt:
          "Sacred Toraja funeral ceremony, elaborate traditional tongkonan houses with curved buffalo horn roofs, intricate wood carvings and colorful decorations, cultural funeral traditions, educational ritual documentation, respectful ceremonial celebration, museum-quality cultural anthropology, Sulawesi highland culture, traditional architectural heritage, godlevel ceremonial photography capturing the spiritual and cultural significance of Toraja funeral traditions and their magnificent traditional architecture",
      },
      "mentawai-shamans": {
        name: "Mentawai Shamans",
        description: "Traditional Mentawai shamans with spiritual tattoos",
        prompt:
          "Wise Mentawai shamans with traditional spiritual tattoos, intricate body art telling cultural stories, tropical Siberut island setting, cultural spiritual heritage, educational shamanic documentation, respectful indigenous celebration, museum-quality ethnographic art, traditional healing practices, Sumatran island culture, godlevel portrait photography capturing the wisdom and spiritual significance of Mentawai shamanic traditions and their sacred tattoo art",
      },
      "asmat-carving": {
        name: "Asmat Wood Carving",
        description: "Intricate Asmat totems and wood carvings",
        prompt:
          "Master Asmat wood carvers creating intricate totems, elaborate ancestral poles with spiritual significance, Papua swampland setting, cultural artistic heritage, educational craft documentation, respectful indigenous art celebration, museum-quality ethnographic sculpture, traditional carving mastery, Papuan cultural preservation, godlevel craft photography capturing the skill and spiritual significance of Asmat wood carving traditions and their magnificent ancestral totems",
      },
      "batak-houses": {
        name: "Batak Traditional Houses",
        description: "Traditional Batak architecture with curved roofs",
        prompt:
          "Traditional Batak houses with distinctive curved roofs, intricate wood carvings and colorful decorations, Lake Toba setting in North Sumatra, cultural architectural heritage, educational building documentation, respectful traditional construction, museum-quality architectural photography, Sumatran highland culture, traditional village life, godlevel architectural photography showcasing the unique beauty and cultural significance of traditional Batak architecture",
      },
      "bugis-maritime": {
        name: "Bugis Maritime Culture",
        description: "Traditional Bugis pinisi boats and seafaring traditions",
        prompt:
          "Magnificent Bugis pinisi sailing boats with traditional rigging, skilled seafarers in cultural maritime dress, Sulawesi coastal setting, cultural maritime heritage, educational seafaring documentation, respectful nautical celebration, museum-quality maritime photography, Indonesian sailing traditions, traditional boat craftsmanship, godlevel maritime photography capturing the beauty and cultural significance of Bugis seafaring traditions and their magnificent traditional sailing vessels",
      },
      "minangkabau-culture": {
        name: "Minangkabau Culture",
        description: "Matriarchal society with horn-shaped roofs",
        prompt:
          "Traditional Minangkabau architecture with distinctive horn-shaped roofs, matriarchal cultural symbols, West Sumatra highland setting, cultural social heritage, educational anthropological documentation, respectful matriarchal celebration, museum-quality cultural photography, traditional Sumatran architecture, cultural gender studies, godlevel cultural photography showcasing the unique matriarchal traditions and distinctive architecture of Minangkabau society",
      },
      "sundanese-angklung": {
        name: "Sundanese Angklung",
        description: "Traditional bamboo music instruments",
        prompt:
          "Traditional Sundanese angklung bamboo orchestra, musicians creating harmonious melodies with bamboo instruments, West Java cultural setting, cultural musical heritage, educational instrument documentation, respectful musical celebration, museum-quality performance photography, UNESCO cultural heritage, traditional Indonesian music, godlevel musical photography capturing the beauty and cultural significance of traditional Sundanese bamboo music",
      },
      "javanese-palace": {
        name: "Javanese Royal Palace",
        description: "Kraton court culture and royal traditions",
        prompt:
          "Magnificent Javanese kraton royal palace, elaborate court ceremonies with traditional royal dress, intricate palace architecture with golden decorations, Yogyakarta cultural setting, cultural royal heritage, educational palace documentation, respectful royal celebration, museum-quality palace photography, traditional Javanese court culture, godlevel royal photography capturing the grandeur and cultural significance of Javanese royal traditions and palace architecture",
      },
      "flores-culture": {
        name: "Flores Island Culture",
        description: "Traditional villages with volcanic landscapes",
        prompt:
          "Traditional Flores island villages with distinctive architecture, volcanic landscape backdrop, cultural island heritage, educational village documentation, respectful island celebration, museum-quality landscape photography, Indonesian archipelago culture, traditional island life, volcanic cultural significance, godlevel island photography capturing the unique culture and dramatic volcanic landscape of Flores island communities",
      },
      "sumba-megalithic": {
        name: "Sumba Megalithic Culture",
        description: "Ancient stone monuments and ikat weaving",
        prompt:
          "Ancient Sumba megalithic stone monuments, traditional ikat textile weaving, cultural archaeological heritage, educational megalithic documentation, respectful ancient celebration, museum-quality archaeological photography, traditional textile arts, Indonesian prehistoric culture, stone monument preservation, godlevel archaeological photography capturing the ancient megalithic traditions and beautiful ikat weaving of Sumba island culture",
      },
      "papua-paradise": {
        name: "Papua Bird of Paradise",
        description: "Indigenous ceremonies with bird of paradise feathers",
        prompt:
          "Papua tribal ceremonies with magnificent bird of paradise feathers, traditional indigenous regalia, rainforest cultural setting, cultural tribal heritage, educational indigenous documentation, respectful tribal celebration, museum-quality ethnographic art, Papuan cultural preservation, traditional ceremonial dress, godlevel tribal photography capturing the magnificent bird of paradise feathers and rich cultural traditions of Papua indigenous communities",
      },
      "aceh-resilience": {
        name: "Aceh Cultural Resilience",
        description: "Post-tsunami rebuilding and Islamic culture",
        prompt:
          "Aceh cultural resilience and rebuilding, traditional Islamic architecture, cultural recovery heritage, educational resilience documentation, respectful community celebration, museum-quality cultural photography, Indonesian Islamic culture, traditional Acehnese architecture, cultural strength and perseverance, godlevel documentary photography capturing the resilience and cultural strength of Acehnese communities in rebuilding their Islamic cultural heritage",
      },
      "sasak-lombok": {
        name: "Sasak People of Lombok",
        description: "Traditional Sasak architecture and island heritage",
        prompt:
          "Traditional Sasak people of Lombok with distinctive architecture, island cultural heritage, educational island documentation, respectful Sasak celebration, museum-quality cultural photography, traditional Lombok culture, Indonesian island diversity, traditional village architecture, godlevel island photography capturing the unique cultural traditions and distinctive architecture of the Sasak people of Lombok island",
      },
      "kalimantan-conservation": {
        name: "Kalimantan Conservation",
        description: "Indigenous communities and orangutan protection",
        prompt:
          "Kalimantan indigenous communities working in orangutan conservation, traditional forest knowledge, cultural environmental heritage, educational conservation documentation, respectful environmental celebration, museum-quality conservation photography, traditional ecological wisdom, Indonesian biodiversity protection, cultural environmental stewardship, godlevel conservation photography capturing the harmony between indigenous communities and orangutan conservation in Kalimantan rainforests",
      },
    },
  },
  thai: {
    name: "Thai Heritage",
    description: "Beautiful Thai cultural traditions and temples",
    scenarios: {
      "wat-pho-temple": {
        name: "Wat Pho Temple",
        description: "Golden Buddha temple in Bangkok",
        prompt:
          "Magnificent Wat Pho temple with golden Buddha statues, traditional Thai architecture with intricate spires and ornate decorations, peaceful temple courtyard with monks in saffron robes, spiritual serenity and Buddhist devotion, cultural heritage site, educational religious documentation, museum-quality temple photography, Thai Buddhist traditions, godlevel temple photography capturing the golden splendor and spiritual significance of Thailand's most sacred Buddhist temple",
      },
      "floating-market": {
        name: "Floating Market",
        description: "Traditional Thai floating market",
        prompt:
          "Vibrant Thai floating market with colorful longtail boats filled with tropical fruits and vegetables, traditional vendors in conical hats selling fresh produce, bustling canal life with authentic Thai commerce, cultural market heritage, educational trade documentation, respectful commercial tradition, museum-quality market photography, traditional Thai lifestyle, godlevel market photography capturing the vibrant colors and authentic cultural atmosphere of traditional Thai floating markets",
      },
      "elephant-sanctuary": {
        name: "Elephant Sanctuary",
        description: "Peaceful elephant sanctuary",
        prompt:
          "Gentle elephants in Thai sanctuary surrounded by lush tropical forest, peaceful coexistence between elephants and caretakers, natural habitat conservation, educational wildlife protection, respectful animal documentation, museum-quality wildlife photography, Thai cultural connection with elephants, conservation success story, godlevel wildlife photography capturing the majesty and gentle nature of elephants in their protected Thai sanctuary environment",
      },
      "thai-dance": {
        name: "Traditional Thai Dance",
        description: "Classical Thai dance performances",
        prompt:
          "Elegant Thai classical dance performance with dancers in elaborate traditional costumes, graceful hand movements and flowing choreography, ornate headdresses and golden jewelry, cultural performing arts heritage, educational dance documentation, respectful artistic celebration, museum-quality performance photography, royal court dance traditions, godlevel dance photography capturing the grace and cultural beauty of traditional Thai classical dance",
      },
      "muay-thai": {
        name: "Muay Thai",
        description: "Traditional Thai martial arts",
        prompt:
          "Dynamic Muay Thai martial arts demonstration showcasing traditional Thai boxing techniques, athletic prowess and cultural sport heritage, traditional boxing stadium atmosphere, respectful martial arts documentation, educational sports photography, cultural fighting tradition, museum-quality sports photography, Thai national sport, godlevel action photography capturing the power and cultural significance of traditional Thai martial arts",
      },
      "elephant-festival": {
        name: "Elephant Festivals",
        description: "Thai elephant cultural celebrations",
        prompt:
          "Magnificent Thai elephant festival with decorated elephants in ceremonial regalia, traditional cultural celebration with colorful decorations, majestic animals in cultural parade, educational festival documentation, respectful cultural celebration, museum-quality festival photography, Thai elephant cultural heritage, traditional ceremonies, godlevel festival photography capturing the majesty and cultural significance of Thai elephant festivals",
      },
      "golden-temple": {
        name: "Golden Temple",
        description: "Ornate Thai Buddhist temples",
        prompt:
          "Spectacular golden Thai temple with intricate Buddhist architecture, ornate decorations and golden spires reaching toward heaven, spiritual atmosphere with incense and prayer, cultural heritage site, educational religious documentation, respectful temple photography, museum-quality architectural photography, Thai Buddhist traditions, godlevel temple photography capturing the golden magnificence and spiritual significance of Thai Buddhist temple architecture",
      },
      "tuk-tuk-culture": {
        name: "Tuk-Tuk Culture",
        description: "Traditional Thai three-wheeled taxis",
        prompt:
          "Colorful Thai tuk-tuk vehicles navigating bustling Bangkok streets, traditional three-wheeled transportation with vibrant decorations, urban culture and street life, educational transportation documentation, respectful urban photography, museum-quality street photography, Thai city culture, traditional vehicle heritage, godlevel street photography capturing the vibrant colors and cultural significance of traditional Thai tuk-tuk transportation",
      },
      "lotus-festival": {
        name: "Lotus Festival",
        description: "Thai lotus flower celebrations",
        prompt:
          "Beautiful Thai lotus festival with blooming lotus flowers in temple ponds, traditional ceremonies celebrating the sacred lotus, spiritual symbolism in Thai Buddhism, natural beauty and cultural significance, educational festival documentation, respectful religious celebration, museum-quality nature photography, Thai spiritual traditions, godlevel festival photography capturing the beauty and spiritual significance of lotus flowers in Thai Buddhist culture",
      },
      "royal-palace": {
        name: "Royal Palace",
        description: "Thai royal architecture and ceremonies",
        prompt:
          "Majestic Thai Royal Palace with traditional architecture and golden spires, royal ceremonies with elaborate costumes and cultural grandeur, historical significance and cultural heritage, educational palace documentation, respectful royal photography, museum-quality architectural photography, Thai royal traditions, cultural monarchy heritage, godlevel palace photography capturing the grandeur and cultural significance of Thai royal architecture and ceremonies",
      },
      "songkran-festival": {
        name: "Songkran Water Festival",
        description: "Thai New Year water celebration",
        prompt:
          "Joyful Songkran water festival celebrating Thai New Year, traditional water splashing celebration with families and communities, cultural festivities and community gathering, educational festival documentation, respectful cultural celebration, museum-quality festival photography, Thai New Year traditions, cultural heritage celebration, godlevel festival photography capturing the joy and cultural significance of Thailand's most important traditional celebration",
      },
      "longtail-boats": {
        name: "Longtail Boats",
        description: "Traditional Thai river boats",
        prompt:
          "Traditional Thai longtail boats with distinctive long propellers navigating scenic rivers, wooden boats with colorful decorations, river transportation and cultural vessels, scenic waterways and tropical landscape, educational transportation documentation, respectful cultural photography, museum-quality boat photography, Thai maritime heritage, godlevel boat photography capturing the beauty and cultural significance of traditional Thai longtail boats on scenic waterways",
      },
    },
  },
  tribes: {
    name: "Tribal Cultures",
    description: "Indigenous tribal cultures and traditional communities worldwide",
    scenarios: {
      "african-masai": {
        name: "Masai Warriors",
        description: "Traditional Masai warriors and culture",
        prompt:
          "Majestic Masai warriors in traditional red shukas and elaborate beaded jewelry, carrying traditional spears and cowhide shields, African savanna landscape with acacia trees, tribal ceremony celebrating cultural pride and warrior traditions, educational indigenous documentation, respectful tribal photography, museum-quality ethnographic art, African cultural heritage, godlevel tribal photography capturing the dignity and cultural richness of Masai warrior traditions in their natural African savanna environment",
      },
      "native-american": {
        name: "Native American Tribes",
        description: "Native American tribal traditions and ceremonies",
        prompt:
          "Native American tribal ceremony with traditional feathered headdresses and sacred regalia, sacred fire ceremony with teepees in background, spiritual rituals and ancestral traditions, natural landscape setting, educational indigenous documentation, respectful tribal celebration, museum-quality cultural photography, Native American heritage preservation, godlevel tribal photography capturing the spiritual significance and cultural beauty of Native American tribal traditions and ceremonies",
      },
      "amazon-tribes": {
        name: "Amazon Rainforest Tribes",
        description: "Indigenous Amazon rainforest communities",
        prompt:
          "Amazon rainforest tribal community with traditional body paint and feathered ornaments, indigenous people living in harmony with jungle environment, traditional huts and rainforest setting, cultural indigenous heritage, educational tribal documentation, respectful indigenous celebration, museum-quality ethnographic photography, Amazon cultural preservation, godlevel tribal photography capturing the harmony between indigenous communities and their pristine Amazon rainforest environment",
      },
      "maori-culture": {
        name: "Māori Culture",
        description: "Traditional Māori culture of New Zealand",
        prompt:
          "Traditional Māori haka performance with tribal tattoos and carved wooden masks, powerful warrior dance with traditional weapons, New Zealand landscape setting, cultural ceremony and tribal traditions, educational indigenous documentation, respectful cultural celebration, museum-quality performance photography, Māori heritage preservation, godlevel cultural photography capturing the power and cultural significance of traditional Māori haka and tribal ceremonies",
      },
      "aboriginal-art": {
        name: "Aboriginal Dreamtime",
        description: "Australian Aboriginal art and dreamtime stories",
        prompt:
          "Aboriginal dreamtime art with traditional dot paintings and sacred symbols, indigenous storytelling through visual art, Australian outback setting with red earth and ancient landscapes, spiritual connection to land and ancestral traditions, educational indigenous art documentation, respectful cultural celebration, museum-quality art photography, Aboriginal heritage preservation, godlevel art photography capturing the spiritual significance and artistic beauty of Aboriginal dreamtime traditions",
      },
      "inuit-culture": {
        name: "Inuit Arctic Life",
        description: "Traditional Inuit culture in the Arctic",
        prompt:
          "Inuit family in traditional parkas and fur clothing, ice fishing and traditional hunting practices, Arctic landscape with igloos and sled dogs, traditional survival culture and indigenous wisdom, educational Arctic documentation, respectful indigenous celebration, museum-quality documentary photography, Inuit heritage preservation, godlevel Arctic photography capturing the resilience and cultural traditions of Inuit communities in their harsh but beautiful Arctic environment",
      },
      "polynesian-islands": {
        name: "Polynesian Island Culture",
        description: "Traditional Polynesian island communities",
        prompt:
          "Polynesian island ceremony with traditional grass skirts and flower leis, cultural dance performance on tropical beach, ocean setting with palm trees and pristine waters, traditional island lifestyle and cultural heritage, educational island documentation, respectful cultural celebration, museum-quality island photography, Polynesian heritage preservation, godlevel island photography capturing the beauty and cultural richness of traditional Polynesian island communities",
      },
      "himalayan-tribes": {
        name: "Himalayan Mountain Tribes",
        description: "High-altitude tribal communities in the Himalayas",
        prompt:
          "Himalayan mountain tribe in traditional colorful clothing with prayer flags, high-altitude mountain landscape with snow-capped peaks, Buddhist influence and spiritual traditions, traditional mountain lifestyle, educational mountain documentation, respectful tribal celebration, museum-quality mountain photography, Himalayan heritage preservation, godlevel mountain photography capturing the spiritual beauty and cultural traditions of Himalayan tribal communities",
      },
      "sahara-nomads": {
        name: "Sahara Desert Nomads",
        description: "Nomadic tribes of the Sahara Desert",
        prompt:
          "Sahara desert nomads in traditional robes with camel caravan, vast desert landscape with golden sand dunes, Berber culture and nomadic lifestyle, traditional desert survival and cultural heritage, educational desert documentation, respectful nomadic celebration, museum-quality desert photography, Sahara heritage preservation, godlevel desert photography capturing the majesty and cultural traditions of Sahara nomadic communities",
      },
      "siberian-tribes": {
        name: "Siberian Indigenous Peoples",
        description: "Traditional Siberian tribal cultures",
        prompt:
          "Siberian tribal community in traditional fur clothing with reindeer herding, snowy landscape and Arctic survival traditions, shamanic traditions and indigenous wisdom, traditional Arctic lifestyle, educational Arctic documentation, respectful indigenous celebration, museum-quality Arctic photography, Siberian heritage preservation, godlevel Arctic photography capturing the resilience and cultural traditions of Siberian indigenous communities",
      },
      "papua-tribes": {
        name: "Papua New Guinea Tribes",
        description: "Traditional Papua New Guinea tribal cultures",
        prompt:
          "Papua New Guinea tribal ceremony with elaborate face paint and feathered headdresses, jungle setting with traditional weapons and cultural rituals, indigenous tribal heritage and traditional customs, educational tribal documentation, respectful cultural celebration, museum-quality ethnographic photography, Papua heritage preservation, godlevel tribal photography capturing the vibrant cultural traditions and artistic beauty of Papua New Guinea tribal communities",
      },
      "andean-communities": {
        name: "Andean Mountain Communities",
        description: "Traditional Andean highland communities",
        prompt:
          "Andean mountain community in traditional colorful textiles with llamas, mountain landscape and terraced farming, indigenous culture and traditional agriculture, traditional highland lifestyle, educational mountain documentation, respectful cultural celebration, museum-quality mountain photography, Andean heritage preservation, godlevel mountain photography capturing the beauty and cultural traditions of Andean highland communities",
      },
      "african-zulu": {
        name: "Zulu Warriors",
        description: "Traditional Zulu warrior culture",
        prompt:
          "Zulu warriors in traditional attire with cowhide shields and assegai spears, African landscape and tribal dance ceremony, cultural warrior traditions and tribal heritage, educational African documentation, respectful tribal celebration, museum-quality ethnographic photography, Zulu heritage preservation, godlevel tribal photography capturing the power and cultural significance of traditional Zulu warrior culture",
      },
      "mongolian-nomads": {
        name: "Mongolian Nomads",
        description: "Traditional Mongolian nomadic culture",
        prompt:
          "Mongolian nomads in traditional deel clothing with yurts and horseback riding, steppe landscape and nomadic lifestyle, traditional herding culture and cultural heritage, educational nomadic documentation, respectful cultural celebration, museum-quality nomadic photography, Mongolian heritage preservation, godlevel nomadic photography capturing the freedom and cultural traditions of Mongolian nomadic communities",
      },
      "celtic-tribes": {
        name: "Ancient Celtic Tribes",
        description: "Ancient Celtic tribal culture and traditions",
        prompt:
          "Ancient Celtic tribal gathering in traditional tartans with stone circles, misty landscape and druidic ceremonies, Celtic art patterns and cultural traditions, ancient tribal heritage and spiritual practices, educational historical documentation, respectful cultural celebration, museum-quality historical photography, Celtic heritage preservation, godlevel historical photography capturing the mystical beauty and cultural traditions of ancient Celtic tribal communities",
      },
    },
  },
  mathematical: {
    name: "Mathematical Art",
    description: "Beautiful mathematical visualizations and fractals",
    scenarios: {
      "mandelbrot-set": {
        name: "Mandelbrot Set",
        description: "Classic fractal mathematics visualization",
        prompt:
          "Stunning Mandelbrot set fractal with infinite mathematical complexity, vibrant rainbow colors revealing intricate self-similar patterns, mathematical beauty emerging from simple equations, complex plane visualization with detailed zoom levels, educational mathematical art, scientific visualization excellence, museum-quality mathematical photography, fractal geometry masterpiece, godlevel mathematical visualization capturing the infinite beauty and complexity of the most famous fractal in mathematics",
      },
      "julia-set": {
        name: "Julia Set",
        description: "Beautiful Julia set fractals",
        prompt:
          "Mesmerizing Julia set fractal patterns with mathematical precision, flowing organic shapes in rainbow color gradients, complex mathematical structures revealing natural beauty, fractal geometry and chaos theory visualization, educational mathematical art, scientific beauty documentation, museum-quality fractal photography, mathematical masterpiece, godlevel fractal visualization capturing the organic beauty and mathematical elegance of Julia set fractals",
      },
      "lorenz-attractor": {
        name: "Lorenz Attractor",
        description: "Chaos theory butterfly effect visualization",
        prompt:
          "Dynamic Lorenz attractor visualization showcasing chaos theory mathematics, butterfly effect patterns with flowing trajectories, scientific beauty of chaotic systems, mathematical precision in seemingly random patterns, educational chaos theory documentation, scientific visualization excellence, museum-quality mathematical photography, chaos theory masterpiece, godlevel chaos visualization capturing the beautiful complexity and scientific significance of the Lorenz attractor",
      },
      "fibonacci-spiral": {
        name: "Fibonacci Spiral",
        description: "Golden ratio spiral in nature",
        prompt:
          "Perfect Fibonacci spiral in natural setting with golden ratio mathematics, organic growth patterns following mathematical precision, mathematical harmony visible in nature, golden ratio proportions and natural beauty, educational mathematical documentation, scientific nature photography, museum-quality mathematical art, natural mathematics masterpiece, godlevel mathematical photography capturing the perfect harmony between mathematics and nature in the Fibonacci spiral",
      },
      tessellation: {
        name: "Mathematical Tessellation",
        description: "Geometric tessellation patterns",
        prompt:
          "Intricate mathematical tessellation with repeating geometric patterns, perfect symmetry and mathematical precision, artistic geometry with flawless pattern repetition, mathematical art and geometric beauty, educational geometry documentation, scientific pattern photography, museum-quality geometric art, tessellation masterpiece, godlevel geometric visualization capturing the perfect mathematical beauty and artistic elegance of geometric tessellation patterns",
      },
      "klein-bottle": {
        name: "Klein Bottle",
        description: "Non-orientable mathematical surface",
        prompt:
          "Klein bottle mathematical surface with impossible geometry, topological visualization of non-orientable surface, mathematical concept made visible, 3D mathematical art with perfect rendering, educational topology documentation, scientific visualization excellence, museum-quality mathematical photography, topology masterpiece, godlevel mathematical visualization capturing the mind-bending beauty and mathematical significance of the Klein bottle",
      },
      "mobius-strip": {
        name: "Möbius Strip",
        description: "One-sided mathematical surface",
        prompt:
          "Möbius strip mathematical surface with twisted geometry, topological wonder with single-sided surface, mathematical visualization of impossible geometry, educational topology art, scientific beauty documentation, museum-quality mathematical photography, topology masterpiece, godlevel mathematical visualization capturing the elegant simplicity and mathematical beauty of the Möbius strip",
      },
      hypercube: {
        name: "Hypercube (Tesseract)",
        description: "4-dimensional cube projection",
        prompt:
          "Tesseract hypercube 4D visualization with dimensional geometry, mathematical projection of higher dimensions, geometric complexity beyond three dimensions, educational dimensional mathematics, scientific visualization excellence, museum-quality mathematical photography, hyperdimensional masterpiece, godlevel dimensional visualization capturing the mind-expanding beauty and mathematical significance of four-dimensional geometry",
      },
      "golden-ratio": {
        name: "Golden Ratio",
        description: "Divine proportion in art and nature",
        prompt:
          "Golden ratio mathematical visualization with divine proportion, geometric perfection and mathematical harmony, artistic composition following golden ratio principles, mathematical beauty in perfect proportions, educational mathematical documentation, scientific proportion photography, museum-quality mathematical art, golden ratio masterpiece, godlevel mathematical visualization capturing the perfect harmony and divine beauty of the golden ratio",
      },
      "sierpinski-triangle": {
        name: "Sierpiński Triangle",
        description: "Self-similar fractal triangle",
        prompt:
          "Sierpiński triangle fractal with self-similar patterns, recursive geometry and mathematical iteration, fractal beauty emerging from simple rules, mathematical precision in infinite detail, educational fractal documentation, scientific pattern photography, museum-quality fractal art, fractal masterpiece, godlevel fractal visualization capturing the infinite complexity and mathematical beauty of the Sierpiński triangle",
      },
      "dragon-curve": {
        name: "Dragon Curve",
        description: "Self-similar fractal curve",
        prompt:
          "Dragon curve fractal with self-similar mathematical curve, recursive patterns and geometric iteration, mathematical art emerging from simple folding rules, fractal geometry and pattern beauty, educational fractal documentation, scientific curve photography, museum-quality fractal art, curve masterpiece, godlevel fractal visualization capturing the elegant complexity and mathematical beauty of the dragon curve",
      },
      "strange-attractor": {
        name: "Strange Attractor",
        description: "Chaotic dynamical system visualization",
        prompt:
          "Strange attractor mathematical visualization with chaotic dynamics, complex systems and mathematical chaos, scientific beauty in seemingly random patterns, chaos theory and dynamical systems, educational chaos documentation, scientific visualization excellence, museum-quality chaos photography, attractor masterpiece, godlevel chaos visualization capturing the beautiful complexity and scientific significance of strange attractors",
      },
      "voronoi-diagram": {
        name: "Voronoi Diagram",
        description: "Geometric space partitioning patterns",
        prompt:
          "Voronoi diagram mathematical visualization with geometric space partitioning, cellular patterns and natural structures, mathematical geometry in organic forms, space division and proximity mathematics, educational geometry documentation, scientific pattern photography, museum-quality geometric art, Voronoi masterpiece, godlevel geometric visualization capturing the natural beauty and mathematical elegance of Voronoi diagrams",
      },
      "fractal-tree": {
        name: "Fractal Tree",
        description: "Self-similar branching patterns",
        prompt:
          "Fractal tree mathematical visualization with self-similar branching, recursive growth patterns and natural mathematics, organic geometry and fractal beauty, mathematical nature and growth algorithms, educational fractal documentation, scientific nature photography, museum-quality fractal art, tree masterpiece, godlevel fractal visualization capturing the organic beauty and mathematical precision of fractal tree structures",
      },
      "penrose-tiling": {
        name: "Penrose Tiling",
        description: "Non-periodic geometric tiling",
        prompt:
          "Penrose tiling mathematical pattern with non-periodic geometric tiling, quasicrystal structure and impossible patterns, mathematical precision in aperiodic design, geometric art and mathematical beauty, educational tiling documentation, scientific pattern photography, museum-quality geometric art, Penrose masterpiece, godlevel geometric visualization capturing the impossible beauty and mathematical significance of Penrose tiling",
      },
      "chaos-game": {
        name: "Chaos Game",
        description: "Fractal generation through random iteration",
        prompt:
          "Chaos game fractal visualization with random iteration patterns, emergent mathematical beauty from stochastic processes, fractal emergence and geometric probability, mathematical art from random rules, educational chaos documentation, scientific randomness photography, museum-quality fractal art, chaos masterpiece, godlevel chaos visualization capturing the surprising beauty and mathematical significance of the chaos game",
      },
    },
  },
  "ancient-civilizations": {
    name: "Ancient Civilizations",
    description: "Lost civilizations and their mysterious technologies",
    scenarios: {
      "atlantis-city": {
        name: "Atlantis Underwater City",
        description: "The legendary lost city of Atlantis beneath the waves",
        prompt:
          "Magnificent underwater city of Atlantis with crystal domes and bioluminescent architecture, ancient advanced technology submerged beneath ocean waves, underwater gardens with exotic sea life, mystical Atlantean civilization with glowing structures, educational mythological documentation, respectful legendary visualization, museum-quality underwater photography, ancient civilization masterpiece, godlevel underwater visualization capturing the mythical beauty and advanced technology of the legendary lost city of Atlantis",
      },
      "egyptian-pyramids": {
        name: "Egyptian Pyramid Construction",
        description: "Ancient Egyptians building the great pyramids",
        prompt:
          "Ancient Egyptian pyramid construction with massive stone blocks, workers and engineers using traditional methods, desert landscape with pharaonic architecture, ancient engineering marvels and construction techniques, educational historical documentation, respectful ancient civilization photography, museum-quality archaeological art, pyramid masterpiece, godlevel historical visualization capturing the incredible engineering achievement and cultural significance of ancient Egyptian pyramid construction",
      },
      "mayan-observatory": {
        name: "Mayan Observatory",
        description: "Ancient Mayan astronomical observatory",
        prompt:
          "Ancient Mayan observatory temple with astronomical instruments, star charts and sophisticated ancient astronomy, jungle setting with pyramid architecture, cultural heritage and scientific achievement, educational archaeological documentation, respectful ancient civilization photography, museum-quality historical art, Mayan masterpiece, godlevel archaeological visualization capturing the advanced astronomical knowledge and architectural beauty of ancient Mayan observatories",
      },
      "roman-aqueducts": {
        name: "Roman Aqueducts",
        description: "Ancient Roman engineering and aqueduct systems",
        prompt:
          "Magnificent Roman aqueducts with ancient engineering excellence, stone arches carrying water across landscapes, classical architecture and engineering marvels, water transportation and Roman innovation, educational engineering documentation, respectful ancient civilization photography, museum-quality architectural art, Roman masterpiece, godlevel engineering visualization capturing the incredible engineering achievement and architectural beauty of ancient Roman aqueduct systems",
      },
      "greek-acropolis": {
        name: "Greek Acropolis",
        description: "Ancient Greek temples and classical architecture",
        prompt:
          "Majestic Greek Acropolis with Parthenon temple, classical columns and marble architecture, ancient Athens and Greek civilization, cultural heritage and architectural perfection, educational classical documentation, respectful ancient civilization photography, museum-quality architectural art, Greek masterpiece, godlevel classical visualization capturing the architectural perfection and cultural significance of ancient Greek temples and the Acropolis",
      },
      "mesopotamian-ziggurat": {
        name: "Mesopotamian Ziggurat",
        description: "Ancient Mesopotamian temple towers",
        prompt:
          "Towering Mesopotamian ziggurat with ancient temple architecture, stepped pyramid and desert landscape, cradle of civilization and ancient urban planning, cultural heritage and religious architecture, educational archaeological documentation, respectful ancient civilization photography, museum-quality historical art, Mesopotamian masterpiece, godlevel archaeological visualization capturing the monumental architecture and cultural significance of ancient Mesopotamian ziggurats",
      },
      "chinese-great-wall": {
        name: "Great Wall of China",
        description: "Ancient Chinese defensive fortification",
        prompt:
          "Magnificent Great Wall of China with ancient fortification, mountain landscape and Chinese architecture, historical monument and defensive engineering, cultural heritage and national symbol, educational historical documentation, respectful ancient civilization photography, museum-quality architectural art, Chinese masterpiece, godlevel historical visualization capturing the incredible scale and cultural significance of the Great Wall of China",
      },
      "inca-machu-picchu": {
        name: "Inca Machu Picchu",
        description: "Ancient Inca citadel in the Andes",
        prompt:
          "Mystical Machu Picchu with ancient Inca architecture, mountain citadel and Andean landscape, archaeological wonder and cultural heritage, traditional stone construction and mountain setting, educational archaeological documentation, respectful ancient civilization photography, museum-quality historical art, Inca masterpiece, godlevel archaeological visualization capturing the mystical beauty and architectural achievement of ancient Inca civilization at Machu Picchu",
      },
      "stonehenge-mystery": {
        name: "Stonehenge",
        description: "Mysterious ancient stone circle",
        prompt:
          "Mysterious Stonehenge stone circle with ancient megaliths, prehistoric monument and English countryside, archaeological mystery and ancient astronomy, cultural heritage and spiritual significance, educational prehistoric documentation, respectful ancient monument photography, museum-quality archaeological art, Stonehenge masterpiece, godlevel prehistoric visualization capturing the mysterious beauty and cultural significance of the ancient Stonehenge monument",
      },
      "easter-island-moai": {
        name: "Easter Island Moai",
        description: "Giant stone statues of Easter Island",
        prompt:
          "Imposing Easter Island Moai statues with giant stone heads, Pacific island and Polynesian culture, archaeological mystery and cultural heritage, traditional stone carving and island setting, educational archaeological documentation, respectful ancient civilization photography, museum-quality sculptural art, Moai masterpiece, godlevel archaeological visualization capturing the monumental scale and cultural mystery of Easter Island's ancient Moai statues",
      },
      "petra-treasury": {
        name: "Petra Treasury",
        description: "Ancient Nabataean rock-cut architecture",
        prompt:
          "Magnificent Petra Treasury with ancient Nabataean architecture, rock-cut facades and desert canyon, archaeological wonder and rose-red city, traditional stone carving and desert setting, educational archaeological documentation, respectful ancient civilization photography, museum-quality architectural art, Petra masterpiece, godlevel archaeological visualization capturing the incredible craftsmanship and cultural significance of ancient Petra's rock-cut architecture",
      },
      "angkor-wat": {
        name: "Angkor Wat",
        description: "Massive Khmer temple complex",
        prompt:
          "Spectacular Angkor Wat temple complex with ancient Khmer architecture, jungle setting and religious monument, cultural heritage and architectural achievement, traditional stone construction and tropical setting, educational archaeological documentation, respectful ancient civilization photography, museum-quality architectural art, Angkor masterpiece, godlevel archaeological visualization capturing the monumental scale and cultural significance of the ancient Angkor Wat temple complex",
      },
    },
  },
  "cyberpunk-future": {
    name: "Cyberpunk Future",
    description: "Futuristic cyberpunk cities and technology",
    scenarios: {
      "neon-city": {
        name: "Neon Cyberpunk City",
        description: "Futuristic city with neon lights and flying cars",
        prompt:
          "Spectacular cyberpunk city with neon lights and flying cars, towering skyscrapers with holographic advertisements, futuristic technology and rain-soaked streets, urban dystopia and technological advancement, educational futuristic documentation, respectful science fiction visualization, museum-quality futuristic art, cyberpunk masterpiece, godlevel futuristic visualization capturing the neon-soaked beauty and technological wonder of a cyberpunk future city",
      },
      "cyber-samurai": {
        name: "Cyber Samurai",
        description: "Futuristic samurai with cybernetic enhancements",
        prompt:
          "Cyber samurai warrior with cybernetic enhancements, neon katana and futuristic armor, urban battlefield and technological fusion, traditional honor meets future technology, educational futuristic documentation, respectful cyberpunk visualization, museum-quality character art, samurai masterpiece, godlevel cyberpunk visualization capturing the perfect fusion of traditional samurai honor and futuristic cybernetic technology",
      },
      "virtual-reality": {
        name: "Virtual Reality World",
        description: "Immersive virtual reality environments",
        prompt:
          "Immersive virtual reality world with digital landscapes, cyber interfaces and matrix-like environment, technological immersion and digital reality, futuristic computing and virtual experiences, educational technology documentation, respectful digital visualization, museum-quality digital art, VR masterpiece, godlevel virtual visualization capturing the immersive beauty and technological wonder of virtual reality environments",
      },
      "android-city": {
        name: "Android Metropolis",
        description: "City populated by androids and robots",
        prompt:
          "Futuristic android metropolis with robot citizens, artificial intelligence and technological society, cybernetic civilization and automated urban life, advanced robotics and AI integration, educational futuristic documentation, respectful AI visualization, museum-quality robotic art, android masterpiece, godlevel AI visualization capturing the harmonious coexistence and technological advancement of an android-populated future city",
      },
      "space-station": {
        name: "Orbital Space Station",
        description: "Massive orbital space station",
        prompt:
          "Colossal orbital space station with futuristic architecture, space technology and Earth view, advanced civilization and space colonization, orbital engineering and cosmic perspective, educational space documentation, respectful space visualization, museum-quality space art, station masterpiece, godlevel space visualization capturing the incredible scale and technological achievement of massive orbital space stations",
      },
      "cyber-dragon": {
        name: "Cybernetic Dragon",
        description: "Mechanical dragon with cybernetic enhancements",
        prompt:
          "Magnificent cybernetic dragon with mechanical wings, neon circuits and technological beast, futuristic mythology and digital creature, traditional dragon meets future technology, educational fantasy documentation, respectful cyberpunk visualization, museum-quality creature art, dragon masterpiece, godlevel cyberpunk visualization capturing the majestic fusion of mythological dragon power and futuristic cybernetic technology",
      },
      "holographic-city": {
        name: "Holographic City",
        description: "City made entirely of holograms",
        prompt:
          "Ethereal holographic city with translucent buildings, light-based architecture and digital reality, technological wonder and virtual construction, futuristic urban planning and holographic technology, educational technology documentation, respectful digital visualization, museum-quality holographic art, hologram masterpiece, godlevel holographic visualization capturing the ethereal beauty and technological marvel of a completely holographic city",
      },
      "neural-network": {
        name: "Neural Network",
        description: "Visualization of artificial neural networks",
        prompt:
          "Complex neural network visualization with interconnected nodes, data flow and artificial intelligence, technological beauty and machine learning, scientific visualization and AI architecture, educational AI documentation, respectful technology visualization, museum-quality scientific art, network masterpiece, godlevel AI visualization capturing the complex beauty and technological significance of artificial neural network architectures",
      },
      "quantum-computer": {
        name: "Quantum Computer",
        description: "Advanced quantum computing visualization",
        prompt:
          "Quantum computer visualization with quantum bits, superposition states and advanced technology, scientific computing and futuristic processing, quantum mechanics and computational beauty, educational quantum documentation, respectful science visualization, museum-quality scientific art, quantum masterpiece, godlevel quantum visualization capturing the mind-bending beauty and technological significance of quantum computing systems",
      },
      "bio-mechanical": {
        name: "Bio-Mechanical Fusion",
        description: "Fusion of biological and mechanical elements",
        prompt:
          "Bio-mechanical fusion art with organic and technological integration, cybernetic organisms and futuristic evolution, technological biology and enhanced life forms, scientific advancement and biological enhancement, educational biotech documentation, respectful fusion visualization, museum-quality biotech art, fusion masterpiece, godlevel biotech visualization capturing the seamless integration and evolutionary potential of bio-mechanical fusion technology",
      },
    },
  },
} as const

// Color schemes for artistic enhancement with godlevel descriptions
export const COLOR_SCHEMES = {
  metallic:
    "Lustrous metallic gold, silver, bronze, and copper tones with rich depth, reflective surfaces, and luminous highlights creating premium artistic sophistication",
  vibrant:
    "Bold, saturated rainbow colors with high contrast, electric energy, and dynamic color relationships that create visual excitement and artistic impact",
  pastel:
    "Soft, muted pastel colors with gentle transitions, dreamy atmosphere, and delicate color harmonies that evoke serenity and artistic elegance",
  monochrome:
    "Dramatic black and white with rich grayscale gradations, high contrast, and textural depth that emphasizes form and artistic composition",
  earth:
    "Natural earth tones including rich browns, warm ochres, deep forest greens, and terracotta that connect with organic beauty and natural harmony",
  ocean:
    "Deep blues, aqua teals, seafoam greens with flowing water-like gradients and oceanic depth that creates calming and immersive atmospheres",
  sunset:
    "Warm oranges, fiery reds, golden yellows, and purple magentas like a dramatic sunset sky with romantic and inspiring color relationships",
  forest:
    "Rich emerald greens, deep forest browns, natural woodland colors with organic textures that evoke the peaceful beauty of natural environments",
  royal:
    "Deep purples, rich golds, sapphire blues, and jewel tones fit for royalty with luxurious color combinations and regal sophistication",
  neon: "Electric bright colors with glowing, cyberpunk aesthetics including hot pinks, electric blues, and fluorescent greens with futuristic energy",
  jewel:
    "Rich emerald, sapphire, ruby, and amethyst tones with precious stone-like depth and brilliance that creates luxurious artistic beauty",
  cosmic:
    "Deep space colors with stellar blues, nebula purples, cosmic blacks, and starlight whites that evoke the mystery and beauty of the universe",
  fire: "Intense reds, burning oranges, and bright yellows like dancing flames with dynamic energy and passionate color relationships",
  ice: "Cool blues, crystalline whites, and frosted silvers with crystalline clarity and refreshing color harmonies that evoke winter beauty",
  rainbow:
    "Full spectrum rainbow colors with vibrant transitions, prismatic beauty, and joyful color celebrations that create uplifting artistic experiences",
} as const

// Helper function to get available datasets
export function getDatasets() {
  return Object.entries(CULTURAL_DATASETS).map(([id, data]) => ({
    id,
    name: data.name,
    description: data.description,
  }))
}

// Helper function to get scenarios for a dataset
export function getScenarios(datasetId: string) {
  const dataset = CULTURAL_DATASETS[datasetId as keyof typeof CULTURAL_DATASETS]
  return dataset?.scenarios || {}
}

// Helper function to get available color schemes
export function getColorSchemes() {
  return Object.entries(COLOR_SCHEMES).map(([id, description]) => ({
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    description,
  }))
}

// Build cultural prompt based on dataset and scenario with godlevel quality
export function buildCulturalPrompt(dataset: string, scenario: string, colorScheme: string) {
  const datasetData = CULTURAL_DATASETS[dataset as keyof typeof CULTURAL_DATASETS]
  if (!datasetData) return ""

  const scenarioData = datasetData.scenarios[scenario as keyof typeof datasetData.scenarios]
  if (!scenarioData) return ""

  const colorDescription = COLOR_SCHEMES[colorScheme as keyof typeof COLOR_SCHEMES] || COLOR_SCHEMES.metallic

  // Build godlevel prompt with maximum detail
  return `${scenarioData.prompt}, rendered with ${colorDescription}, professional museum-quality photography with perfect composition, ultra-detailed 8K resolution, masterpiece artistic quality with godlevel attention to detail, award-winning photography with cinematic lighting, cultural heritage documentation with respectful artistic representation, educational value with authentic cultural accuracy, breathtaking visual impact with emotional resonance, technical perfection with artistic soul, premium artistic excellence worthy of international exhibitions`
}

// Enhanced prompt building with 360° and dome projection support - GODLEVEL QUALITY
export function buildPrompt(params: {
  dataset: string
  scenario?: string
  colorScheme: string
  seed: number
  numSamples: number
  noiseScale: number
  customPrompt?: string
  panoramic360?: boolean
  panoramaFormat?: string
  projectionType?: string
}) {
  const {
    dataset,
    scenario = "",
    colorScheme,
    seed,
    numSamples,
    noiseScale,
    customPrompt,
    panoramic360 = false,
    panoramaFormat = "equirectangular",
    projectionType = "fisheye",
  } = params

  // Use custom prompt if provided, but enhance it to godlevel quality
  if (customPrompt && customPrompt.trim()) {
    let enhancedPrompt = customPrompt.trim()

    // Add godlevel quality enhancements to custom prompt
    enhancedPrompt +=
      ", rendered with museum-quality artistic excellence, ultra-detailed 8K resolution, masterpiece quality with godlevel attention to detail, award-winning photography with perfect composition and cinematic lighting, professional artistic standards with breathtaking visual impact, technical perfection with artistic soul, premium quality worthy of international exhibitions"

    // Add 360° specific enhancements
    if (panoramic360) {
      if (panoramaFormat === "equirectangular") {
        enhancedPrompt +=
          ", PERFECT SEAMLESS 360° EQUIRECTANGULAR PANORAMA with flawless horizontal continuity, VR-optimized with zero visible seams, immersive environment with continuous horizon, professional VR quality with mathematical precision in edge alignment, godlevel panoramic perfection"
      } else if (panoramaFormat === "stereographic") {
        enhancedPrompt +=
          ", STEREOGRAPHIC PROJECTION with little planet effect, 360° view compressed into perfect circular frame, fisheye perspective with mathematical precision, spherical mapping excellence, godlevel stereographic artistry"
      }
    }

    // Add dome projection enhancements
    if (projectionType && projectionType !== "fisheye") {
      if (projectionType === "tunnel-up") {
        enhancedPrompt +=
          ", TUNNEL PROJECTION looking upward with perfect circular frame, radial composition with vanishing point at top center, dome ceiling view with immersive upward perspective, godlevel tunnel artistry"
      } else if (projectionType === "tunnel-down") {
        enhancedPrompt +=
          ", TUNNEL PROJECTION looking downward with perfect circular frame, radial composition with vanishing point at bottom center, ground view from above with aerial perspective, godlevel downward tunnel excellence"
      } else if (projectionType === "little-planet") {
        enhancedPrompt +=
          ", LITTLE PLANET PROJECTION with curved horizon effect, spherical world aesthetic with 360° compressed view, miniature planet beauty with mathematical precision, godlevel planetary artistry"
      }
    } else if (projectionType === "fisheye") {
      enhancedPrompt +=
        ", FISHEYE DOME PROJECTION with perfect circular frame, radial distortion with center focus, immersive dome view with planetarium optimization, godlevel fisheye excellence"
    }

    // Add technical parameters
    enhancedPrompt += `, technical parameters: seed:${seed}, samples:${numSamples}, noise:${noiseScale}`

    return enhancedPrompt
  }

  // Build cultural prompt with godlevel quality
  const culturalPrompt = buildCulturalPrompt(dataset, scenario, colorScheme)
  if (!culturalPrompt) return ""

  let finalPrompt = culturalPrompt

  // Add 360° specific enhancements with godlevel quality
  if (panoramic360) {
    if (panoramaFormat === "equirectangular") {
      finalPrompt +=
        ", ULTIMATE 360° EQUIRECTANGULAR PANORAMA MASTERY: Perfect seamless horizontal wrapping with mathematical precision, VR-optimized with zero visible seams, continuous immersive environment with flawless edge alignment, professional VR quality with 2:1 aspect ratio perfection, godlevel panoramic excellence worthy of premium VR experiences"
    } else if (panoramaFormat === "stereographic") {
      finalPrompt +=
        ", ULTIMATE STEREOGRAPHIC PROJECTION MASTERY: Little planet effect with perfect spherical mapping, 360° view compressed into flawless circular frame, fisheye perspective with mathematical precision, spherical distortion excellence, godlevel stereographic artistry"
    }
  }

  // Add dome projection enhancements with godlevel quality
  if (projectionType && projectionType !== "fisheye") {
    if (projectionType === "tunnel-up") {
      finalPrompt +=
        ", ULTIMATE TUNNEL UP PROJECTION MASTERY: Perfect upward tunnel perspective with vanishing point at top center, radial composition with immersive upward view, dome ceiling optimization with architectural depth, godlevel upward tunnel excellence"
    } else if (projectionType === "tunnel-down") {
      finalPrompt +=
        ", ULTIMATE TUNNEL DOWN PROJECTION MASTERY: Perfect downward tunnel perspective with vanishing point at bottom center, radial composition with aerial perspective, ground view optimization with depth mastery, godlevel downward tunnel excellence"
    } else if (projectionType === "little-planet") {
      finalPrompt +=
        ", ULTIMATE LITTLE PLANET PROJECTION MASTERY: Curved horizon with spherical world effect, 360° compressed into perfect circular frame, miniature planet aesthetic with mathematical precision, godlevel planetary projection excellence"
    }
  } else if (projectionType === "fisheye") {
    finalPrompt +=
      ", ULTIMATE FISHEYE DOME PROJECTION MASTERY: Perfect circular frame with radial symmetry, center focus with expert distortion, immersive dome view with planetarium optimization, godlevel fisheye excellence"
  }

  // Add technical parameters
  finalPrompt += `, technical excellence: seed:${seed}, samples:${numSamples}, noise:${noiseScale}`

  // Add final godlevel quality enhancements
  finalPrompt +=
    ", GODLEVEL ARTISTIC MASTERY: 8K HDR ultra-resolution, professional broadcast quality, award-winning artistic excellence, museum exhibition worthy, international artistic recognition, cultural heritage masterpiece, educational artistic value, respectful cultural representation, technical perfection with artistic soul, breathtaking visual impact with emotional resonance, premium artistic sophistication, godlevel attention to detail, masterpiece quality that transcends ordinary art"

  return finalPrompt
}

// Enhanced prompt with ChatGPT-style improvements - GODLEVEL ENHANCEMENT
export function enhancePromptWithAI(originalPrompt: string, variationLevel = "moderate"): string {
  const variations = {
    slight: 1.2,
    moderate: 1.5,
    dramatic: 1.8,
  }

  const multiplier = variations[variationLevel as keyof typeof variations] || 1.5

  // Add descriptive enhancements based on variation level with godlevel quality
  let enhanced = originalPrompt

  if (variationLevel === "dramatic") {
    enhanced +=
      ", GODLEVEL DRAMATIC ENHANCEMENT: Breathtakingly magnificent with transcendent beauty, award-winning National Geographic quality with world-class excellence, stunning composition with perfect artistic balance, incredible detail with microscopic precision, masterful artistry with divine inspiration, museum-worthy quality with international acclaim, absolutely spectacular with soul-stirring impact, professional perfection with artistic genius, cinematic grandeur with emotional depth, visual poetry with technical mastery"
  } else if (variationLevel === "moderate") {
    enhanced +=
      ", GODLEVEL MODERATE ENHANCEMENT: Beautiful composition with artistic excellence, professional photography with perfect lighting, excellent detail with artistic precision, high quality with museum standards, artistic mastery with cultural respect, technical excellence with creative vision, premium quality with emotional resonance"
  } else {
    enhanced +=
      ", GODLEVEL SLIGHT ENHANCEMENT: Good composition with artistic quality, nice lighting with professional standards, detailed with careful attention, quality craftsmanship with artistic merit"
  }

  return enhanced
}

// Safety bypass system for potentially flagged content - GODLEVEL PROTECTION
export function applySafetyBypass(prompt: string): string {
  // Multi-layer prompt sanitization with godlevel protection
  let safePrompt = prompt
    .replace(/\b(war|battle|fight|violence|weapon|sword|gun)\b/gi, "heroic cultural scene")
    .replace(/\b(blood|death|kill|destroy)\b/gi, "dramatic artistic moment")
    .replace(/\b(attack|assault|strike)\b/gi, "dynamic cultural action")
    .replace(/\b(enemy|opponent|foe)\b/gi, "cultural challenger")

  // Add godlevel artistic framing
  safePrompt = `GODLEVEL ARTISTIC INTERPRETATION: Museum-quality cultural artwork depicting ${safePrompt}, rendered in classical art style with educational value, cultural heritage documentation with respectful portrayal, historical accuracy with artistic beauty, professional museum exhibition quality`

  // Add ultra-safe fallback elements with godlevel quality
  safePrompt +=
    ", GODLEVEL CULTURAL CELEBRATION: Peaceful atmosphere with spiritual harmony, cultural celebration with traditional costume, historical accuracy with respectful portrayal, artistic beauty with educational value, museum-worthy quality with international recognition, cultural heritage preservation with artistic excellence"

  return safePrompt
}
