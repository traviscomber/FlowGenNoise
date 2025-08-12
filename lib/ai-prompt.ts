export function buildPrompt(dataset: string, scenario?: string, colorScheme = "plasma", customPrompt?: string): string {
  // If custom prompt is provided, use it directly
  if (customPrompt && customPrompt.trim()) {
    return truncatePrompt(customPrompt.trim())
  }

  // Base professional visualization prompt
  let basePrompt = `Create a stunning professional-grade mathematical art visualization with intricate patterns and flowing dynamics. `

  // Add dataset-specific content
  if (dataset === "vietnamese" && scenario && scenario !== "pure") {
    basePrompt += getVietnameseScenarioPrompt(scenario)
  } else if (dataset === "indonesian" && scenario && scenario !== "pure") {
    basePrompt += getIndonesianScenarioPrompt(scenario)
  } else if (dataset === "thailand" && scenario && scenario !== "pure") {
    basePrompt += getThailandScenarioPrompt(scenario)
  } else {
    // Mathematical dataset prompts
    basePrompt += getDatasetPrompt(dataset)
  }

  // Add professional color scheme
  basePrompt += ` Render in professional ${colorScheme} color palette with rich gradients, luminous effects, and sophisticated color harmony. `

  // Add professional technical specifications
  basePrompt += `PROFESSIONAL QUALITY: Ultra-high detail, photorealistic rendering, dramatic cinematic lighting, masterful composition, commercial-grade visual quality, suitable for professional presentation and immersive experiences.`

  return truncatePrompt(basePrompt)
}

function getVietnameseScenarioPrompt(scenario: string): string {
  const scenarios: Record<string, string> = {
    "temple-of-literature": `Majestic Temple of Literature (Văn Miếu) in Hanoi, Vietnam's first university from 1070 AD. Ancient red-lacquered wooden architecture with upturned eaves and traditional Vietnamese roof tiles, ornate dragon carvings on pillars, stone stelae of doctorate holders in peaceful courtyards. Ancient scholars in traditional áo dài studying under centuries-old banyan trees, incense smoke curling through carved wooden screens, traditional Vietnamese lanterns casting warm golden light on stone pathways. Morning mist filtering through traditional gates, lotus ponds reflecting ancient pavilions, Confucian scholarly atmosphere with traditional calligraphy and ancient books. Professional architectural photography quality with authentic Vietnamese cultural details. `,

    "jade-emperor-pagoda": `Sacred Jade Emperor Pagoda (Chùa Ngọc Hoàng) in Ho Chi Minh City, mystical Taoist temple filled with ethereal incense smoke and spiritual energy. Dark wooden interior with intricate hand-carved dragons, phoenixes, and mythical creatures, statues of Taoist deities surrounded by offerings of tropical fruits and flowers. Thick aromatic incense smoke creating mystical atmosphere, red prayer papers hanging from ceiling, traditional turtle pond with ancient tortoises, ornate altars with golden Buddha statues gleaming through incense haze. Devotees in traditional Vietnamese dress performing rituals, flickering candlelight casting dancing shadows on carved wooden surfaces. Professional documentary photography style capturing authentic Vietnamese spiritual culture. `,

    "imperial-city-hue": `Grand Imperial City of Hue (Đại Nội), former royal capital of Vietnam's Nguyen Dynasty. Magnificent Purple Forbidden City with traditional Vietnamese palace architecture, ornate golden dragons on red-lacquered pillars, royal courtyards with geometric stone patterns. Peaceful lotus-filled moats reflecting ancient pavilions, traditional Vietnamese gardens with carefully pruned bonsai trees and stone bridges, imperial tombs with intricate mosaic work using ceramic and glass. Traditional court musicians in historical costumes, royal guards in authentic uniforms, morning light filtering through ancient courtyards. UNESCO World Heritage grandeur with professional architectural documentation quality. `,

    "tomb-of-khai-dinh": `Elaborate Tomb of Emperor Khai Dinh in Hue, unique fusion of Vietnamese and European architectural styles. Intricate mosaic decorations with porcelain, glass, and ceramic shards creating stunning geometric patterns, ornate dragon staircases with detailed stone carvings, imperial burial chambers with golden decorative elements. Traditional Vietnamese roof architecture combined with French baroque influences, peaceful mountain setting with ancient pine trees, ceremonial pathways leading to the tomb. Mystical atmosphere of royal heritage with professional heritage photography quality capturing the artistic fusion of cultures. `,

    "sapa-terraces": `Breathtaking Sapa rice terraces in northern Vietnam mountains, carved into hillsides by Hmong and Red Dao ethnic minorities over centuries. Emerald green rice paddies reflecting sky like natural mirrors, traditional wooden stilt houses with thatched roofs, ethnic minority farmers in colorful traditional clothing working the fields. Misty mountain peaks surrounding the terraces, water buffalo grazing in flooded fields, ancient agricultural techniques passed down through generations. Terraced landscapes stretching to the horizon, golden sunrise over mountains, peaceful rural life with traditional farming methods. UNESCO World Heritage landscape with professional nature photography quality. `,

    "mekong-delta": `Vibrant Mekong Delta river life with floating markets and traditional Vietnamese boats. Wooden sampans loaded with tropical fruits, vegetables, and flowers, floating vendors in traditional conical hats (nón lá) conducting early morning commerce. Coconut palms lining peaceful waterways, traditional stilt houses over water with fishing nets drying in tropical sun, children playing by riverbanks. Water hyacinth flowers floating on river surface, traditional river life with authentic Vietnamese culture, lush tropical vegetation, golden sunset reflections on water. Professional travel photography capturing authentic Vietnamese river commerce and traditional lifestyle. `,

    "tet-celebration": `Joyous Tet (Lunar New Year) celebration with traditional Vietnamese festivities and cultural traditions. Red and gold decorations everywhere, blooming peach blossoms (hoa đào) and yellow apricot flowers (hoa mai), families in traditional áo dài gathering for reunion dinner. Dragon and lion dances in streets with traditional drums and gongs, red envelopes (lì xì) being exchanged, traditional foods like bánh chưng and bánh tét. Ancestral altars with offerings and incense, fireworks lighting up night sky, children playing traditional games, festive lanterns illuminating celebrations. Temple visits for good fortune, community celebrations with traditional Vietnamese music. Professional cultural photography capturing authentic Vietnamese New Year traditions. `,

    "mid-autumn-festival": `Magical Mid-Autumn Festival (Tết Trung Thu) with colorful lanterns and traditional moon worship. Children carrying star-shaped, fish-shaped, and butterfly-shaped lanterns through streets, traditional lion dances with elaborate costumes, families gathering under full moon. Colorful paper lanterns hanging from trees and buildings, moon cake sharing ceremonies with intricate designs, traditional folk tales being told to children. Festive street decorations, cultural performances with traditional Vietnamese instruments, community celebrations with warm family gatherings. Traditional Vietnamese music and storytelling, authentic cultural festival atmosphere. Professional festival photography capturing the magic of Vietnamese children's festival. `,

    "water-puppetry": `Traditional Vietnamese water puppetry (múa rối nước) performance on village pond stage. Wooden puppets dancing gracefully on water surface, controlled by skilled puppet masters hidden behind bamboo screen, traditional Vietnamese folk stories being performed. Traditional musicians with drums, gongs, and wooden fish instruments, rural village setting with traditional architecture, lotus ponds and bamboo groves. Folk tales of Vietnamese legends and daily life, children watching in wonder, cultural heritage performance with authentic traditional staging. Evening setting with traditional lanterns, authentic Vietnamese folk art with professional cultural documentation quality. `,

    "lacquerware-craft": `Master Vietnamese artisan creating traditional lacquerware with mother-of-pearl inlay work. Intricate hand-painted designs on glossy black lacquer surfaces, traditional workshop setting with wooden tools and brushes, delicate mother-of-pearl patterns being carefully applied. Traditional Vietnamese decorative motifs of dragons, phoenixes, and lotus flowers, artistic concentration and cultural craftsmanship, detailed work requiring years of training. Traditional Vietnamese art techniques passed down through generations, workshop filled with beautiful lacquered objects including boxes, furniture, and decorative items. Artistic heritage preservation with professional craft photography quality. `,

    "bach-dang-victory": `Historic Bach Dang River naval victory with traditional Vietnamese war boats and strategic military tactics. Ancient wooden warships with dragon prows and traditional Vietnamese naval architecture, Vietnamese warriors in traditional armor and weapons, strategic river battle scene with bamboo stakes planted in river. Traditional military banners with Vietnamese symbols, heroic naval combat demonstrating Vietnamese military ingenuity, historical Vietnamese military tactics against foreign invaders. River landscape with traditional boat construction, cultural pride and heritage, patriotic atmosphere celebrating Vietnamese independence. Professional historical documentation quality capturing legendary Vietnamese military victory. `,

    "trung-sisters-rebellion": `Legendary Trung Sisters (Hai Bà Trưng) leading Vietnamese rebellion against Chinese rule in 40 AD. Two determined warrior sisters on war elephants, traditional Vietnamese armor and ancient weapons, female leadership in ancient Vietnam. Ancient battlefield with Vietnamese independence fighters, traditional military banners with Vietnamese cultural symbols, heroic stance representing resistance against oppression. Cultural symbols of Vietnamese female empowerment, historical Vietnamese costumes and military equipment, patriotic atmosphere celebrating national heroes. Legendary female warriors who became symbols of Vietnamese independence, national heroes with professional historical portrait quality. `,

    "halong-bay": `Spectacular Ha Long Bay with thousands of limestone karsts rising majestically from emerald waters. Traditional Vietnamese junk boats with distinctive brown sails navigating between towering limestone pillars, hidden caves and grottoes with stalactites and stalagmites. Fishing villages on stilts with traditional architecture, peaceful bay waters reflecting dramatic rock formations, UNESCO World Heritage natural wonder. Traditional Vietnamese fishing boats with authentic design, misty morning atmosphere creating mystical beauty, pristine natural landscape. Geological marvels formed over millions of years, professional nature photography capturing Vietnam's most iconic natural treasure. `,

    "phong-nha-caves": `Magnificent Phong Nha-Ke Bang caves with underground rivers and massive limestone formations. Ancient cave systems with cathedral-like chambers, underground boat tours through crystal-clear rivers, dramatic stalactites and stalagmites creating natural sculptures. Spectacular cave formations with natural lighting effects, pristine underground ecosystems, geological wonders formed over millennia. Cave exploration with traditional Vietnamese boats navigating underground waterways, natural heritage site with mysterious underground world. Professional cave photography capturing the majesty of Vietnam's underground natural wonders. `,

    "floating-market-mekong": `Bustling Cai Rang floating market in Mekong Delta with boats full of fresh tropical produce. Colorful wooden boats loaded with tropical fruits, vegetables, and local products, vendors in traditional conical hats conducting early morning commerce. Traditional river commerce with authentic Vietnamese trading methods, floating vendors calling out prices and displaying goods on long poles. Fresh tropical produce including dragon fruit, rambutan, and mangoes, traditional boat life with authentic Vietnamese river culture. Vibrant market atmosphere with traditional trading methods, professional documentary photography capturing authentic Vietnamese floating market culture. `,

    "pho-street-culture": `Authentic Vietnamese pho street culture with steaming bowls and traditional sidewalk dining. Traditional pho vendors with large soup pots simmering aromatic beef broth, customers sitting on low plastic stools enjoying breakfast. Fresh herbs including cilantro, Thai basil, and mint, lime wedges and chili sauce, bustling street food scene with authentic Vietnamese breakfast culture. Steam rising from bowls of pho, traditional Vietnamese food preparation methods, community dining atmosphere with locals gathering for morning meals. Cultural food heritage with traditional recipes passed down through generations, professional food photography capturing authentic Vietnamese street food culture. `,

    "ca-tru-performance": `Traditional Ca Tru musical performance with female vocalist and authentic Vietnamese instruments. Elegant female singer in traditional áo dài performing ancient court music, traditional Vietnamese musical instruments including đàn đáy (three-stringed lute) and phách (bamboo clappers). Intimate performance setting with traditional Vietnamese cultural arts, UNESCO recognized intangible heritage, sophisticated musical tradition from Vietnamese royal courts. Traditional costume and makeup, musical storytelling with ancient Vietnamese songs, preserved cultural art form with authentic Vietnamese folk music. Artistic cultural expression with professional cultural documentation quality. `,

    "quan-ho-folk-songs": `Traditional Quan Ho folk singing with alternating male and female voices from Bac Ninh province. Singers in traditional Vietnamese costumes performing antiphonal singing style, cultural music performance with authentic Vietnamese musical heritage. Traditional folk songs with call-and-response between groups, community cultural gathering with traditional Vietnamese singing techniques. Cultural celebration with folk music tradition, artistic cultural expression with traditional Vietnamese music, authentic Vietnamese musical heritage with professional cultural photography quality. `,
  }

  return scenarios[scenario] || scenarios["temple-of-literature"]
}

function getIndonesianScenarioPrompt(scenario: string): string {
  const scenarios: Record<string, string> = {
    garuda: `Majestic Garuda Wisnu Kencana statue with professional Hindu-Buddhist symbolism, golden wings spread wide in divine majesty, intricate traditional Balinese stone carvings, authentic Indonesian temple architecture. Professional cultural monument photography. `,
    wayang: `Traditional Wayang Kulit shadow puppet performance with intricate hand-carved leather puppets, professional gamelan orchestra, dramatic shadows on traditional screen, authentic Javanese cultural storytelling. Professional cultural documentation. `,
    batik: `Exquisite Indonesian batik patterns with traditional wax-resist dyeing techniques, intricate geometric and floral motifs showcasing centuries of cultural heritage, rich traditional colors and authentic Indonesian textile artistry. Professional textile photography. `,
    borobudur: `Ancient Borobudur temple complex with Buddhist stupas and detailed stone reliefs, sunrise over Central Java, UNESCO World Heritage site with professional architectural documentation quality. `,
    javanese: `Traditional Javanese court culture with authentic gamelan music performance, classical dance in traditional costumes, intricate batik textiles, royal palace architecture with professional cultural photography. `,
    sundanese: `Sundanese cultural traditions with traditional angklung bamboo instruments, authentic dance performances, West Java mountain landscapes with professional cultural documentation. `,
    batak: `Batak tribal culture from North Sumatra with traditional distinctive houses, authentic cultural ceremonies, Lake Toba setting with professional ethnographic photography. `,
    dayak: `Dayak indigenous culture from Borneo with traditional longhouses, authentic tribal art and crafts, rainforest setting with professional indigenous culture documentation. `,
    acehnese: `Acehnese Islamic culture with traditional mosque architecture, authentic Sufi traditions, northern Sumatra landscapes with professional religious architecture photography. `,
    minangkabau: `Minangkabau matriarchal culture with distinctive horn-shaped traditional roofs, authentic ceremonies, West Sumatra setting with professional architectural documentation. `,
    "balinese-tribe": `Balinese Hindu culture with authentic temple ceremonies, traditional dance performances in elaborate costumes, rice terraces, spiritual rituals with professional cultural photography. `,
    papuans: `Papuan indigenous culture with traditional dress and tribal ceremonies, New Guinea highlands setting with professional ethnographic documentation. `,
    baduy: `Baduy tribe traditional lifestyle with simple traditional clothing, sustainable living practices, West Java mountains with professional indigenous culture photography. `,
    "orang-rimba": `Orang Rimba forest people with traditional forest lifestyle, authentic Sumatra rainforest setting with professional indigenous culture documentation. `,
    "hongana-manyawa": `Hongana Manyawa indigenous people with traditional forest culture, authentic Halmahera island setting with professional ethnographic photography. `,
    asmat: `Asmat tribal art with intricate traditional wood carvings, authentic sculptures, Papua cultural heritage with professional indigenous art documentation. `,
    komodo: `Komodo dragon legends with ancient reptiles in natural habitat, Komodo National Park, Indonesian wildlife heritage with professional nature photography. `,
    dance: `Traditional Indonesian dance with elaborate authentic costumes, cultural performances showcasing diverse regional styles with professional cultural documentation. `,
    volcanoes: `Indonesian volcanic landscapes with active volcanoes, dramatic geological formations, Ring of Fire with professional landscape photography. `,
    temples: `Sacred Indonesian temples with authentic Hindu-Buddhist architecture, spiritual ceremonies, cultural heritage with professional religious architecture photography. `,
  }

  return scenarios[scenario] || scenarios["garuda"]
}

function getThailandScenarioPrompt(scenario: string): string {
  const scenarios: Record<string, string> = {
    garuda: `Magnificent Garuda, the divine eagle mount of Vishnu in Thai Buddhist-Hindu tradition. Golden feathered creature with human torso, spread wings in majestic pose, royal Thai temple setting with intricate traditional artistic details and authentic Thai religious symbolism. Professional temple architecture photography. `,
    naga: `Sacred Naga serpent dragon from Thai Buddhist mythology. Multi-headed serpent with iridescent scales, temple guardian statue, Mekong River setting, traditional Thai temple architecture with golden decorations and authentic Thai religious artistry. Professional religious sculpture photography. `,
    erawan: `Erawan, the three-headed white elephant from Thai Hindu-Buddhist tradition. Majestic white elephant with multiple heads, royal Thai symbolism, ornate traditional decorations, authentic temple setting with professional cultural monument photography. `,
    karen: `Karen Hill Tribe people in traditional dress with intricate silver jewelry, authentic mountain villages, northern Thailand highlands, traditional weaving and cultural ceremonies with professional ethnographic photography. `,
    hmong: `Hmong mountain people with colorful traditional clothing featuring intricate embroidery, authentic mountain villages, cultural festivals, northern Thailand setting with professional cultural documentation. `,
    ayutthaya: `Ancient Ayutthaya kingdom ruins with Buddhist temples, weathered stone Buddha statues, historical Thai architecture, UNESCO World Heritage site with professional archaeological photography. `,
    sukhothai: `Sukhothai Historical Park with ancient Thai temples, distinctive walking Buddha statues, lotus ponds with reflections, dawn of Thai civilization with professional heritage photography. `,
    songkran: `Songkran Water Festival celebration with traditional water splashing, authentic Thai New Year customs, temple visits, community festivities, April celebrations with professional cultural festival photography. `,
    "loy-krathong": `Loy Krathong Festival with floating lanterns on water, traditional banana leaf boats with candles, full moon night, romantic Thai tradition with professional festival photography. `,
    coronation: `Thai Royal Coronation ceremony with elaborate golden regalia, traditional Thai royal costumes, authentic Buddhist rituals, palace setting with professional ceremonial photography. `,
    "wat-pho": `Wat Pho Temple with massive Reclining Buddha statue measuring 46 meters, golden decorations, traditional Thai temple architecture, Bangkok setting, peaceful meditation atmosphere with professional temple photography. `,
    "wat-arun": `Wat Arun Temple of Dawn with towering spires decorated with porcelain, Chao Phraya River setting, sunrise lighting, iconic Bangkok landmark with professional architectural photography. `,
    "muay-thai": `Ancient Muay Thai boxing with traditional rituals, sacred headbands (mongkol), temple training grounds, cultural martial arts heritage with professional sports photography. `,
    "classical-dance": `Thai Classical Dance with elaborate traditional costumes, graceful hand movements, traditional masks, royal court performances, cultural artistry with professional dance photography. `,
    "golden-triangle": `Golden Triangle region where Thailand, Laos, and Myanmar meet, Mekong River confluence, mountainous border region, cultural crossroads with professional landscape photography. `,
    "floating-markets": `Traditional Thai floating markets with boats full of tropical fruits, vendors in traditional hats, authentic canal commerce, traditional Thai culture with professional market photography. `,
  }

  return scenarios[scenario] || scenarios["garuda"]
}

function getDatasetPrompt(dataset: string): string {
  const prompts: Record<string, string> = {
    spirals: `Mesmerizing spiral patterns with golden ratio proportions, Fibonacci sequences creating natural mathematical beauty, logarithmic spirals, nautilus shell formations with professional mathematical visualization. `,
    fractal: `Intricate fractal geometry with self-similar patterns, infinite detail, Mandelbrot-like structures, recursive mathematical beauty with professional scientific visualization quality. `,
    mandelbrot: `Classic Mandelbrot set visualization with complex number iterations, infinite zoom detail, boundary explorations with professional mathematical art quality. `,
    julia: `Julia set fractals with complex parameter variations, filled and unfilled sets, mathematical elegance with professional computational art quality. `,
    lorenz: `Lorenz attractor chaos theory visualization with butterfly effect patterns, strange attractors, dynamic systems with professional scientific visualization. `,
    hyperbolic: `Hyperbolic geometry with non-Euclidean space, Poincaré disk models, tessellations, curved space mathematics with professional geometric visualization. `,
    gaussian: `Gaussian distribution patterns with probability curves, statistical visualizations, bell curve mathematics with professional data visualization quality. `,
    cellular: `Cellular automata patterns with Conway's Game of Life, emergent complexity, rule-based evolution with professional computational visualization. `,
    voronoi: `Voronoi diagram tessellations with natural cell patterns, computational geometry, organic structures with professional geometric visualization. `,
    perlin: `Perlin noise landscapes with procedural generation, natural textures, terrain modeling with professional procedural art quality. `,
    diffusion: `Reaction-diffusion patterns with Turing structures, chemical wave propagation, biological pattern formation with professional scientific visualization. `,
    wave: `Wave interference patterns with constructive and destructive interference, harmonic oscillations, fluid dynamics with professional physics visualization. `,
    escher: `M.C. Escher-inspired impossible geometries with optical illusions, tessellations, mathematical art with professional artistic visualization quality. `,
    "8bit": `8-bit pixel art style with retro gaming aesthetics, digital nostalgia, computational art with professional pixel art quality. `,
    bosch: `Hieronymus Bosch-inspired surreal landscapes with fantastical creatures, medieval symbolism, artistic complexity with professional surreal art quality. `,
  }

  return prompts[dataset] || prompts.fractal
}

function truncatePrompt(prompt: string): string {
  if (prompt.length <= 4000) {
    return prompt
  }

  // Try to truncate at a sentence boundary
  const sentences = prompt.split(". ")
  let truncated = ""

  for (const sentence of sentences) {
    const testLength = truncated.length + sentence.length + 2 // +2 for '. '
    if (testLength > 3900) {
      break
    }
    truncated += (truncated ? ". " : "") + sentence
  }

  // If we couldn't fit any complete sentences, truncate at word boundary
  if (!truncated) {
    const words = prompt.split(" ")
    for (const word of words) {
      const testLength = truncated.length + word.length + 1 // +1 for space
      if (testLength > 3900) {
        break
      }
      truncated += (truncated ? " " : "") + word
    }
  }

  return truncated + "..."
}
