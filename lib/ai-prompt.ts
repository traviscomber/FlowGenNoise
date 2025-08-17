// Enhanced AI Prompt Generation System with ULTIMATE GODLEVEL Quality
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

// Cultural datasets with detailed scenarios - COMPLETE RESTORATION WITH GODLEVEL ENHANCEMENT
export const CULTURAL_DATASETS = {
  heads: {
    name: "👤 Heads & Portraits",
    scenarios: {
      "pure-mathematical": {
        name: "🔢 Pure Mathematical Head",
        description:
          "Mathematical head visualization with geometric precision, golden ratio facial proportions, Fibonacci spiral hair patterns, fractal skin texture mapping, algorithmic beauty generation, computational geometry excellence, mathematical art perfection, geometric abstraction mastery, digital geometry mastery, algorithmic art generation, mathematical visualization excellence, geometric pattern complexity, mathematical art generation, computational beauty, godlevel mathematical excellence.",
      },
      "hyper-realistic": {
        name: "📸 Hyper-Realistic Portrait",
        description:
          "Ultra-photorealistic human head portrait with microscopic skin detail, individual pore visibility, subsurface light scattering, authentic eye moisture and reflection, natural hair strand definition, professional studio lighting with Rembrandt setup, 85mm lens compression, shallow depth of field, museum-quality portraiture, award-winning photographic excellence, commercial photography standard, flawless skin texture mapping, authentic human expression, professional headshot perfection, broadcast television quality, magazine cover worthy, celebrity portrait standard, Hollywood glamour lighting, professional makeup artistry, high-fashion editorial quality, luxury brand campaign worthy, international photography award level, godlevel photorealistic mastery.",
      },
      "classical-sculpture": {
        name: "🏛️ Classical Marble Sculpture",
        description:
          "Masterpiece classical marble sculpture head in the tradition of Michelangelo and Bernini, perfect anatomical proportions following golden ratio, sublime chiseled features with divine artistic expression, museum-quality Renaissance craftsmanship, pristine white Carrara marble with subtle veining, dramatic chiaroscuro lighting, sculptural perfection with godlike idealized beauty, Vatican Museum exhibition worthy, Louvre collection standard, classical antiquity reverence, timeless artistic immortality, divine artistic inspiration, sculptural genius manifestation, marble carving virtuosity, Renaissance master technique, artistic heritage preservation, cultural monument significance, eternal beauty captured in stone, godlevel sculptural excellence.",
      },
      "cyberpunk-futuristic": {
        name: "🤖 Cyberpunk Future Head",
        description:
          "Ultra-futuristic cyberpunk head with seamless bio-mechanical integration, holographic neural interfaces, neon-lit cybernetic implants, chrome and carbon fiber augmentations, LED circuit patterns under translucent synthetic skin, advanced AI consciousness indicators, quantum processing nodes, neural link connections, dystopian high-tech aesthetics, blade runner atmosphere, ghost in the shell inspiration, matrix-level digital integration, advanced prosthetic artistry, technological singularity visualization, transhumanist evolution, digital consciousness manifestation, cyber-enhanced humanity, futuristic body modification, advanced biotechnology integration, godlevel cyberpunk artistry, sci-fi masterpiece quality.",
      },
      "fantasy-ethereal": {
        name: "🧚 Fantasy Ethereal Being",
        description:
          "Ethereal fantasy being head with otherworldly beauty, luminescent skin with magical aura, mystical facial markings that glow with inner light, flowing hair that defies gravity with particle effects, eyes that hold galaxies and ancient wisdom, delicate pointed ears with intricate jewelry, crown of living flowers and crystals, magical energy emanating from features, fairy tale princess perfection, elven nobility and grace, mythical creature elegance, fantasy art masterpiece, magical realism perfection, enchanted forest spirit, celestial being manifestation, divine feminine energy, mystical creature artistry, legendary beauty incarnate, godlevel fantasy excellence.",
      },
      "horror-grotesque": {
        name: "👹 Horror Grotesque",
        description:
          "Masterfully crafted horror grotesque head with artistic terror excellence, professional special effects makeup artistry, intricate prosthetic work with museum-quality craftsmanship, dramatic lighting for maximum atmospheric impact, cinematic horror movie standard, award-winning creature design, practical effects mastery, gothic horror aesthetic, dark fantasy artistry, theatrical makeup excellence, professional monster design, horror film industry standard, creature feature quality, dark artistic expression, gothic masterpiece, professional horror artistry, cinematic terror excellence, special effects virtuosity, horror genre mastery, godlevel grotesque artistry.",
      },
      "anime-manga": {
        name: "🎌 Anime Manga Style",
        description:
          "Perfect anime manga style head with flawless cel-shading technique, large expressive eyes with multiple highlight layers, perfectly styled hair with dynamic flow and shine, smooth gradient skin tones, professional anime studio quality, Studio Ghibli level artistry, manga illustration perfection, Japanese animation excellence, otaku culture celebration, kawaii aesthetic mastery, anime character design perfection, professional voice actor worthy, anime convention showcase quality, manga artist virtuosity, Japanese pop culture excellence, animation industry standard, godlevel anime artistry.",
      },
      "abstract-geometric": {
        name: "🔺 Abstract Geometric",
        description:
          "Revolutionary abstract geometric head composition with mathematical precision, golden ratio proportions, complex polygonal faceting, prismatic color theory application, cubist influence with modern digital artistry, algorithmic beauty generation, computational geometry excellence, mathematical art perfection, geometric abstraction mastery, digital art innovation, contemporary art museum worthy, modern art gallery exhibition standard, avant-garde artistic expression, geometric pattern complexity, mathematical visualization excellence, algorithmic art generation, digital geometry mastery, godlevel abstract excellence.",
      },
      "oil-painting-classical": {
        name: "🎨 Classical Oil Painting",
        description:
          "Museum-quality classical oil painting head in the tradition of Leonardo da Vinci and Rembrandt, masterful brushwork with visible texture, rich impasto technique, luminous glazing layers, chiaroscuro lighting mastery, Renaissance painting excellence, old master technique perfection, classical portraiture tradition, oil painting virtuosity, fine art museum collection worthy, art history significance, painting technique mastery, classical art education standard, traditional painting excellence, artistic heritage preservation, fine art auction house quality, godlevel painting mastery.",
      },
      "watercolor-impressionist": {
        name: "🌸 Watercolor Impressionist",
        description:
          "Exquisite watercolor impressionist head with fluid brushwork, transparent color layering, wet-on-wet technique mastery, soft edge blending, luminous color harmony, impressionist light capture, plein air painting quality, French impressionist tradition, watercolor medium mastery, artistic spontaneity, color theory excellence, painting technique virtuosity, fine art gallery worthy, watercolor society exhibition standard, impressionist movement homage, artistic expression freedom, godlevel watercolor excellence.",
      },
      "digital-art-modern": {
        name: "💻 Digital Art Modern",
        description:
          "Cutting-edge digital art head with advanced rendering techniques, photorealistic digital painting, professional digital artistry, concept art industry standard, video game character quality, digital illustration mastery, computer graphics excellence, digital painting virtuosity, modern art movement, contemporary digital expression, technology-enhanced creativity, digital medium mastery, professional concept artist quality, entertainment industry standard, digital art innovation, godlevel digital excellence.",
      },
      "steampunk-victorian": {
        name: "⚙️ Steampunk Victorian",
        description:
          "Elaborate steampunk Victorian head with brass and copper mechanical augmentations, intricate clockwork mechanisms, steam-powered prosthetics, Victorian era fashion elements, leather and brass accessories, mechanical monocle with gears, steam vents and pressure gauges, industrial revolution aesthetics, retro-futuristic design, alternate history visualization, steampunk subculture celebration, Victorian gothic elements, mechanical artistry, industrial design excellence, period costume accuracy, godlevel steampunk artistry.",
      },
      "tribal-cultural": {
        name: "🪶 Tribal Cultural",
        description:
          "Respectful tribal cultural head representation with authentic traditional face painting, ceremonial markings with cultural significance, traditional jewelry and adornments, feathers and natural materials, cultural heritage celebration, indigenous artistry honor, traditional craftsmanship respect, cultural authenticity preservation, ethnographic accuracy, anthropological significance, cultural education value, traditional art forms celebration, indigenous culture respect, cultural diversity appreciation, heritage preservation importance, godlevel cultural artistry.",
      },
      "zombie-undead": {
        name: "🧟 Zombie Undead",
        description:
          "Professional zombie undead head with award-winning special effects makeup, realistic decay and decomposition artistry, professional prosthetic application, cinematic horror quality, walking dead television standard, zombie apocalypse authenticity, horror movie industry excellence, special effects mastery, creature design perfection, horror genre expertise, practical effects artistry, makeup artist virtuosity, horror film quality, godlevel zombie artistry.",
      },
      "alien-extraterrestrial": {
        name: "👽 Alien Extraterrestrial",
        description:
          "Scientifically plausible alien extraterrestrial head with evolutionary biology consideration, xenobiology speculation, advanced civilization indicators, non-human intelligence manifestation, interstellar species design, science fiction authenticity, speculative evolution artistry, astrobiology inspiration, cosmic perspective, alien culture visualization, extraterrestrial intelligence, space exploration wonder, scientific imagination, sci-fi genre excellence, godlevel alien artistry.",
      },
      "mega-freak-extreme": {
        name: "🎪 Mega Freak Extreme",
        description:
          "Extreme artistic interpretation with radical creative distortion, surreal proportions and impossible anatomy, psychedelic color explosions, reality-bending visual effects, artistic freedom maximization, creative boundary pushing, experimental art excellence, avant-garde expression, artistic rebellion, creative chaos mastery, visual shock artistry, extreme artistic vision, boundary-breaking creativity, artistic revolution, godlevel freak artistry.",
      },
    },
  },
  faces: {
    name: "😊 Faces & Expressions",
    scenarios: {
      "pure-mathematical": {
        name: "🔢 Pure Mathematical Expression",
        description:
          "Mathematical facial expression with geometric emotion mapping, algorithmic smile curves, fractal eye patterns, mathematical beauty ratios, computational expression analysis, geometric emotion visualization, mathematical art perfection, algorithmic facial geometry, digital expression mastery, mathematical emotion excellence, geometric pattern complexity, computational beauty generation, mathematical visualization excellence, godlevel mathematical expression.",
      },
      "joy-ecstatic": {
        name: "😄 Ecstatic Joy",
        description:
          "Pure ecstatic joy facial expression with genuine Duchenne smile, crinkled eyes radiating happiness, natural laugh lines, spontaneous emotional authenticity, infectious positive energy, life celebration manifestation, happiness psychology perfection, emotional intelligence visualization, positive psychology embodiment, joy therapy effectiveness, happiness research validation, emotional wellness representation, mental health positivity, psychological well-being, emotional healing power, godlevel joy expression.",
      },
      "melancholy-contemplative": {
        name: "😔 Melancholy Contemplation",
        description:
          "Profound melancholy contemplative expression with philosophical depth, introspective gaze into infinite distance, subtle emotional complexity, existential questioning manifestation, poetic sadness beauty, romantic era emotional depth, artistic melancholy tradition, emotional intelligence sophistication, psychological complexity, human condition reflection, emotional authenticity, contemplative wisdom, philosophical introspection, emotional maturity, godlevel melancholy artistry.",
      },
      "fierce-warrior": {
        name: "😤 Fierce Warrior",
        description:
          "Fierce warrior expression with determined battle readiness, steely resolve in focused eyes, jaw set with unwavering determination, noble courage manifestation, heroic spirit embodiment, warrior code honor, battle-tested strength, leadership authority, protective instinct, courage under fire, heroic determination, warrior tradition respect, martial arts discipline, combat readiness, godlevel warrior expression.",
      },
      "serene-meditation": {
        name: "😌 Serene Meditation",
        description:
          "Perfect serene meditation expression with inner peace radiance, closed eyes in deep contemplation, facial muscles completely relaxed, spiritual enlightenment glow, mindfulness practice perfection, Buddhist meditation tradition, zen philosophy embodiment, spiritual awakening manifestation, consciousness expansion, inner harmony achievement, meditation mastery, spiritual development, enlightenment pursuit, godlevel serenity expression.",
      },
      "mischievous-playful": {
        name: "😏 Mischievous Playful",
        description:
          "Delightfully mischievous playful expression with twinkling eyes full of secrets, subtle smirk suggesting hidden knowledge, playful energy radiating, childhood wonder preservation, innocent troublemaking, creative mischief, playful intelligence, humor appreciation, wit and cleverness, social playfulness, creative expression, joyful rebellion, playful wisdom, godlevel mischief expression.",
      },
      "wise-ancient": {
        name: "👴 Ancient Wisdom",
        description:
          "Ancient wisdom expression with eyes holding centuries of knowledge, deep wrinkles mapping life experience, serene acceptance of mortality, philosophical understanding, elder wisdom tradition, generational knowledge transfer, life experience accumulation, wisdom literature embodiment, sage advice manifestation, elder respect culture, wisdom tradition honor, life lesson integration, godlevel wisdom expression.",
      },
      "innocent-childlike": {
        name: "👶 Innocent Childlike",
        description:
          "Pure innocent childlike expression with wonder-filled eyes, natural curiosity manifestation, untainted by world cynicism, genuine emotional openness, childhood magic preservation, innocence protection, pure heart expression, natural joy, unconditioned love, authentic emotion, childhood development, innocent wisdom, pure spirit, godlevel innocence expression.",
      },
      "mysterious-enigmatic": {
        name: "🎭 Mysterious Enigmatic",
        description:
          "Captivating mysterious enigmatic expression with secrets hidden behind knowing eyes, subtle smile suggesting untold stories, magnetic charisma, psychological complexity, human mystery celebration, enigmatic personality, mysterious allure, psychological depth, complex character, intriguing personality, mysterious charm, enigmatic wisdom, godlevel mystery expression.",
      },
      "passionate-intense": {
        name: "🔥 Passionate Intensity",
        description:
          "Burning passionate intensity expression with fire in focused eyes, emotional depth beyond words, creative passion manifestation, artistic inspiration embodiment, passionate dedication, intense commitment, emotional authenticity, passionate pursuit, creative fire, artistic passion, intense dedication, passionate excellence, godlevel passion expression.",
      },
      "compassionate-loving": {
        name: "💝 Compassionate Love",
        description:
          "Infinite compassionate love expression with unconditional acceptance radiating, maternal/paternal protective instinct, healing energy emanation, empathetic understanding, compassionate service, loving kindness, emotional healing, therapeutic presence, compassionate care, loving support, emotional nurturing, godlevel compassion expression.",
      },
      "determined-focused": {
        name: "🎯 Determined Focus",
        description:
          "Laser-focused determination expression with unwavering concentration, goal-oriented intensity, success mindset manifestation, achievement psychology, performance excellence, focused attention, determined pursuit, goal achievement, success psychology, performance optimization, focused excellence, godlevel determination expression.",
      },
      "surprised-amazed": {
        name: "😲 Surprised Amazement",
        description:
          "Genuine surprised amazement expression with wide eyes full of wonder, mouth slightly agape in awe, natural surprise reaction, wonder preservation, amazement psychology, surprise emotion, wonder experience, awe inspiration, amazement authenticity, surprise psychology, godlevel amazement expression.",
      },
      "confident-powerful": {
        name: "💪 Confident Power",
        description:
          "Radiating confident power expression with self-assured presence, leadership authority, personal empowerment, confidence psychology, self-esteem manifestation, personal power, leadership presence, confident authority, empowerment psychology, self-confidence, godlevel confidence expression.",
      },
      "dreamy-ethereal": {
        name: "☁️ Dreamy Ethereal",
        description:
          "Dreamy ethereal expression with eyes gazing into otherworldly realms, soft focus suggesting dream state, mystical consciousness, dream psychology, ethereal beauty, dreamy atmosphere, mystical experience, ethereal presence, dream state, godlevel ethereal expression.",
      },
      "artistic-creative": {
        name: "🎨 Artistic Creative",
        description:
          "Pure artistic creative expression with inspiration flowing through features, creative genius manifestation, artistic vision embodiment, creative process visualization, artistic inspiration, creative excellence, artistic mastery, creative genius, artistic vision, godlevel creative expression.",
      },
    },
  },
  vietnamese: {
    name: "🇻🇳 Vietnamese Heritage",
    scenarios: {
      "pure-mathematical": {
        name: "🔢 Pure Mathematical Vietnamese",
        description:
          "Mathematical Vietnamese cultural patterns with geometric temple architecture, fractal dragon motifs, algorithmic traditional patterns, mathematical art excellence, computational Vietnamese heritage, geometric cultural visualization, mathematical tradition mapping, algorithmic cultural beauty, digital heritage mastery, mathematical cultural excellence, geometric pattern complexity, computational cultural generation, mathematical visualization excellence, godlevel mathematical Vietnamese artistry.",
      },
      "trung-sisters": {
        name: "⚔️ Hai Bà Trưng - Trung Sisters",
        description:
          "Legendary Vietnamese heroines Hai Bà Trưng living as ancient warrior queens in 40 AD, daily life in traditional Vietnamese villages with thatched-roof houses on stilts, rice farming communities along Red River delta, women warriors training with bronze spears and shields, riding war elephants through bamboo forests, leading village councils under banyan trees, traditional Vietnamese communal houses (đình) where villagers gather for ceremonies, ancient Vietnamese citadels with wooden watchtowers, daily rituals of ancestor worship at family altars, traditional Vietnamese clothing with silk áo dài and conical hats, village markets with clay pottery and bronze tools, fishing boats on rivers with traditional nets, heroic legends incarnate with national independence symbols, cultural heroes embodying patriotic spirit with historical valor beyond measure, museum-quality historical accuracy, UNESCO cultural heritage significance, Vietnamese national pride manifestation, godlevel heroic excellence.",
      },
      "temple-of-literature": {
        name: "🏛️ Temple of Literature - First University",
        description:
          "Vietnam's first university (1070 AD) where scholars live and study Confucian classics, daily life of students in traditional dormitories with wooden beds and study desks, morning rituals of bowing to Confucius statue, scholars practicing calligraphy with brush and ink on rice paper, traditional Vietnamese academic robes and scholar hats, students reciting classical texts in courtyards, teachers conducting lessons under ancient trees, examination halls where students take imperial tests, library pavilions with ancient scrolls and books, scholars debating philosophy in peaceful gardens, traditional Vietnamese vegetarian meals served in ceramic bowls, incense ceremonies honoring literary saints, magnificent traditional Vietnamese architecture with red-tiled roofs gleaming under golden sunlight, ornate gates with intricate dragon carvings, stone stelae of doctorate holders with calligraphy mastery, peaceful gardens with sacred lotus ponds reflecting ancient wisdom, centuries-old trees providing spiritual shade, traditional lanterns casting mystical light, scholarly atmosphere permeating every stone, Confucian educational heritage with traditional Vietnamese academic excellence, godlevel architectural mastery.",
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
    },
  },
  indonesian: {
    name: "🇮🇩 Indonesian Heritage",
    scenarios: {
      "pure-mathematical": {
        name: "🔢 Pure Mathematical Indonesian",
        description:
          "Mathematical Indonesian cultural patterns with geometric batik designs, fractal temple architecture, algorithmic traditional motifs, mathematical art excellence, computational Indonesian heritage, geometric cultural visualization, mathematical tradition mapping, algorithmic cultural beauty, digital heritage mastery, mathematical cultural excellence, geometric pattern complexity, computational cultural generation, mathematical visualization excellence, godlevel mathematical Indonesian artistry.",
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
        name: "🌿 Dayak Longhouse Communities",
        description:
          "Bornean Dayak indigenous people living in traditional longhouses (rumah panjang) that house entire extended families, daily life in communal wooden structures raised on stilts above jungle floor, families sharing common verandas while maintaining private apartments, traditional hunting with blowpipes and poison darts in dense rainforest, women weaving rattan baskets and traditional textiles, men carving wooden masks and totems for spiritual ceremonies, children learning traditional stories and jungle survival skills, communal cooking areas with wood fires and clay pots, traditional fishing in jungle rivers with handmade nets, shamanic healing ceremonies with traditional medicines from forest plants, traditional tattoos marking life achievements and spiritual protection, village councils making decisions under longhouse roof, traditional music with wooden drums and bamboo instruments, Indonesian tribal heritage, forest heritage, cultural traditions, river communities, traditional tattoos, godlevel Dayak cultural excellence.",
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
        name: "🌺 Balinese Village Life",
        description:
          "Balinese Hindu villagers living in traditional family compounds (puri) with multiple pavilions around central courtyard, daily life begins with morning offerings (canang sari) of flowers and incense at family temple, women weaving traditional textiles on wooden looms, men carving intricate stone sculptures for temples, children learning traditional Balinese dance in village pavilions, rice farmers working terraced fields (subak) with traditional irrigation systems, village ceremonies with gamelan orchestras playing bronze instruments, traditional Balinese houses with thatched roofs and carved wooden doors, daily temple visits wearing traditional white clothing and colorful sashes, village markets selling tropical fruits, spices, and handmade crafts, traditional cooking in clay pots over wood fires, family meals served on banana leaves, evening prayers at village temples with flickering oil lamps, Balinese Hindu culture, temple ceremonies, traditional dances, cultural festivals, Indonesian island heritage, spiritual traditions, artistic expressions, rice terraces, temple architecture, godlevel Balinese cultural excellence.",
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
    name: "🇹🇭 Thailand Heritage",
    scenarios: {
      "pure-mathematical": {
        name: "🔢 Pure Mathematical Thai",
        description:
          "Mathematical Thai cultural patterns with geometric temple architecture, fractal naga serpent designs, algorithmic traditional motifs, mathematical art excellence, computational Thai heritage, geometric cultural visualization, mathematical tradition mapping, algorithmic cultural beauty, digital heritage mastery, mathematical cultural excellence, geometric pattern complexity, computational cultural generation, mathematical visualization excellence, godlevel mathematical Thai artistry.",
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
        name: "🏔️ Karen Hill Tribe Village Life",
        description:
          "Karen hill tribe people living in traditional bamboo houses on mountain slopes, daily life begins with tending terraced vegetable gardens and rice fields, women weaving traditional textiles on backstrap looms with intricate patterns, men hunting wild boar and deer in mountain forests with traditional crossbows, children helping with daily chores like collecting firewood and water from mountain streams, traditional Karen clothing with hand-embroidered tunics and silver jewelry, village elders teaching traditional stories and customs around evening fires, traditional animist ceremonies honoring mountain spirits and ancestors, communal meals of rice, vegetables, and forest herbs served in bamboo containers, traditional medicine using mountain plants and herbs, village councils meeting in traditional community houses, seasonal festivals celebrating rice harvest and mountain spirits, mountainous landscape, traditional lifestyle, ethnic minority culture, handwoven textiles, traditional jewelry, cultural heritage of northern Thailand, long-neck traditions, godlevel Karen cultural excellence.",
      },
      hmong: {
        name: "🎭 Hmong Mountain Village Life",
        description:
          "Hmong ethnic families living in traditional wooden houses in mountain villages, daily life centered around intricate needlework and silver jewelry making, women creating elaborate embroidered clothing with geometric patterns passed down through generations, men farming mountain slopes with traditional slash-and-burn agriculture, children learning traditional songs and stories in Hmong language, traditional New Year celebrations with colorful costumes and courtship rituals, shamanic healing ceremonies with traditional drums and spiritual chants, village markets where families trade handmade textiles and silver ornaments, traditional cooking with mountain herbs and vegetables in clay pots, extended families living in clan groups with shared responsibilities, traditional music with bamboo pipes and mouth harps, seasonal migration following agricultural cycles, Hmong ethnic group in traditional colorful clothing, intricate embroidery, silver jewelry, mountain villages, traditional lifestyle, cultural ceremonies, northern Thailand heritage, traditional crafts, godlevel Hmong cultural excellence.",
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
  escher: {
    name: "🎨 Escher Inspired",
    scenarios: {
      "pure-mathematical": {
        name: "🔢 Pure Mathematical Escher",
        description:
          "Mathematical Escher-inspired patterns with geometric precision, impossible mathematical objects, fractal tessellations, algorithmic optical illusions, computational geometry excellence, mathematical art perfection, geometric abstraction mastery, digital geometry mastery, algorithmic art generation, mathematical visualization excellence, geometric pattern complexity, mathematical art generation, computational beauty, godlevel mathematical Escher excellence.",
      },
      "impossible-stairs": {
        name: "♾️ Impossible Staircases",
        description:
          "M.C. Escher inspired impossible staircases with paradoxical architecture defying physics laws, people walking up and down simultaneously in perpetual motion, mind-bending optical illusion with precise black and white geometric patterns, mathematical impossibility made visually compelling, architectural paradox with perfect geometric precision, visual mathematics embodiment, perspective manipulation mastery, impossible object visualization, mathematical art perfection, geometric illusion excellence, optical paradox mastery, visual impossibility achievement, godlevel Escher artistry.",
      },
      tessellations: {
        name: "🔷 Tessellation Patterns",
        description:
          "Intricate Escher-style tessellations with mathematically perfect interlocking geometric shapes, infinite pattern repetition with seamless transitions, artistic geometry with visual mathematics perfection, tessellation symmetry with geometric precision and mathematical beauty beyond comprehension, pattern mathematics visualization, geometric art mastery, mathematical precision excellence, infinite pattern complexity, geometric harmony perfection, tessellation virtuosity, godlevel geometric excellence.",
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
      relativity: {
        name: "🏗️ Relativity Architecture",
        description:
          "Escher's Relativity-inspired impossible architecture with multiple gravity directions, staircases going in all directions, people walking on walls and ceilings, architectural paradox with geometric precision, mind-bending spatial relationships.",
      },
    },
  },
  spirals: {
    name: "🌀 Spirals",
    scenarios: {
      pure: {
        name: "Pure Mathematical Spirals",
        description:
          "Mathematical spiral patterns with Fibonacci sequences perfection, golden ratio spirals with divine proportions, logarithmic spirals found in nature's design, Archimedean spirals with perfect mathematical precision, hyperbolic spirals with infinite complexity, mathematical elegance embodiment, geometric beauty transcendence, natural spiral formations with cosmic significance, mathematical harmony with universal patterns, spiral mathematics mastery, geometric perfection achievement, mathematical art excellence, godlevel spiral mastery.",
      },
    },
  },
  fractal: {
    name: "🔺 Fractal",
    scenarios: {
      pure: {
        name: "Pure Fractal Geometry",
        description:
          "Fractal geometry patterns with self-similar structures, infinite complexity, recursive patterns, mathematical fractals, geometric iterations, fractal dimensions, mathematical beauty, infinite detail, natural fractal formations.",
      },
    },
  },
  mandelbrot: {
    name: "🔢 Mandelbrot",
    scenarios: {
      pure: {
        name: "Mandelbrot Set Visualization",
        description:
          "Mandelbrot set visualizations with complex number iterations, fractal boundaries, mathematical complexity, infinite detail, chaotic dynamics, mathematical art, computational beauty, complex plane mathematics.",
      },
    },
  },
  julia: {
    name: "🎭 Julia",
    scenarios: {
      pure: {
        name: "Julia Set Fractals",
        description:
          "Julia set fractals with complex dynamics, mathematical iterations, fractal art, chaotic attractors, mathematical beauty, computational geometry, infinite patterns, complex number mathematics.",
      },
    },
  },
  lorenz: {
    name: "🦋 Lorenz",
    scenarios: {
      pure: {
        name: "Lorenz Attractor Chaos",
        description:
          "Lorenz attractor patterns with chaos theory visualization, butterfly effect, strange attractors, dynamical systems, mathematical chaos, nonlinear dynamics, chaotic beauty, sensitive dependence.",
      },
    },
  },
  hyperbolic: {
    name: "🌐 Hyperbolic",
    scenarios: {
      pure: {
        name: "Hyperbolic Geometry",
        description:
          "Hyperbolic geometry patterns with non-Euclidean geometry, curved space visualizations, hyperbolic tessellations, mathematical geometry, geometric art, spatial mathematics, curved space beauty.",
      },
    },
  },
  gaussian: {
    name: "📊 Gaussian",
    scenarios: {
      pure: {
        name: "Gaussian Distributions",
        description:
          "Gaussian distributions with statistical visualizations, probability curves, normal distributions, mathematical statistics, data visualization, statistical beauty, mathematical probability, bell curves.",
      },
    },
  },
  cellular: {
    name: "🔬 Cellular",
    scenarios: {
      pure: {
        name: "Cellular Automata",
        description:
          "Cellular automata patterns with Conway's Game of Life, emergent behavior, computational patterns, rule-based systems, mathematical emergence, algorithmic art, computational beauty, emergent complexity.",
      },
    },
  },
  voronoi: {
    name: "🕸️ Voronoi",
    scenarios: {
      pure: {
        name: "Voronoi Diagrams",
        description:
          "Voronoi diagrams with spatial partitioning, geometric tessellations, proximity patterns, computational geometry, mathematical partitions, geometric art, spatial mathematics, natural patterns.",
      },
    },
  },
  perlin: {
    name: "🌊 Perlin",
    scenarios: {
      pure: {
        name: "Perlin Noise Patterns",
        description:
          "Perlin noise patterns with procedural generation, natural randomness, algorithmic textures, computational noise, mathematical randomness, procedural art, algorithmic beauty, natural textures.",
      },
    },
  },
  diffusion: {
    name: "⚗️ Reaction-Diffusion",
    scenarios: {
      pure: {
        name: "Reaction-Diffusion Systems",
        description:
          "Reaction-diffusion systems with pattern formation, chemical patterns, Turing patterns, mathematical biology, emergent patterns, natural mathematics, biological computation, self-organization.",
      },
    },
  },
  wave: {
    name: "〰️ Wave",
    scenarios: {
      pure: {
        name: "Wave Interference",
        description:
          "Wave interference patterns with harmonic oscillations, wave equations, frequency visualizations, mathematical waves, acoustic patterns, wave mathematics, harmonic beauty, wave dynamics.",
      },
    },
  },
  "8bit": {
    name: "🎮 8bit",
    scenarios: {
      pure: {
        name: "8-bit Pixel Art",
        description:
          "8-bit pixel art patterns with retro gaming aesthetics, pixelated mathematical visualizations, digital art, computational graphics, nostalgic computing, pixel mathematics, digital beauty, retro aesthetics.",
      },
    },
  },
  bosch: {
    name: "🖼️ Bosch",
    scenarios: {
      pure: {
        name: "Bosch-Inspired Surrealism",
        description:
          "Hieronymus Bosch inspired surreal mathematical art with fantastical creatures, surreal landscapes, medieval artistic style, imaginative mathematics, artistic surrealism, mathematical fantasy, dreamlike imagery.",
      },
    },
  },
} as const

export const COLOR_SCHEMES = {
  plasma: "vibrant plasma colors with electric blues, magentas, and cyans creating electromagnetic field visualization",
  quantum: "quantum field colors with particle physics inspired hues showing subatomic energy states",
  cosmic: "cosmic nebula colors with deep purples, blues, and stellar whites capturing universe majesty",
  thermal: "thermal imaging colors from cool blues to hot reds and whites showing energy distribution",
  spectral: "full electromagnetic spectrum from infrared to ultraviolet revealing hidden light frequencies",
  crystalline: "crystal formation colors with prismatic refractions creating rainbow light dispersion",
  bioluminescent: "bioluminescent colors like deep sea creatures with natural light generation",
  aurora: "aurora borealis colors with greens, purples, and blues dancing across polar skies",
  metallic: "metallic colors with gold, silver, copper, and bronze showing precious metal luster",
  prismatic: "prismatic light dispersion with rainbow spectrums creating optical phenomena",
  monochromatic: "single hue variations from light to dark showing tonal perfection",
  infrared: "infrared heat signature colors revealing thermal energy patterns",
  lava: "volcanic lava colors with reds, oranges, and blacks showing molten earth power",
  futuristic: "futuristic neon colors with electric accents creating cyberpunk atmosphere",
  forest: "forest colors with greens, browns, and earth tones celebrating natural harmony",
  ocean: "ocean depths colors with blues, teals, and aquas showing marine beauty",
  sunset: "sunset colors with oranges, pinks, and purples capturing golden hour magic",
  arctic: "arctic colors with whites, blues, and ice tones showing polar beauty",
  neon: "bright neon colors with electric intensity creating urban nightlife energy",
  vintage: "vintage sepia and aged colors with nostalgic warmth and historical charm",
  toxic: "toxic waste colors with sickly greens and yellows creating hazardous atmosphere",
  ember: "glowing ember colors with reds and oranges showing fire's dying beauty",
  lunar: "lunar surface colors with grays and whites capturing moon's mysterious beauty",
  tidal: "tidal pool colors with blues, greens, and sandy tones showing coastal life",
  holographic: "holographic colors with iridescent shifts and rainbow interference patterns",
  galactic: "galactic colors with deep space purples, stellar blues, and cosmic dust golds",
  ethereal: "ethereal colors with translucent pastels and ghostly luminescence",
  volcanic: "volcanic colors with molten oranges, ash grays, and sulfur yellows",
  crystalline_ice: "crystalline ice colors with pure whites, arctic blues, and frozen clarity",
} as const

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

    let basePrompt = "ULTIMATE GODLEVEL MASTERPIECE: "
    let scenarioDescription = ""
    let isMathematicalScenario = false

    if (
      params.scenario === "pure-mathematical" ||
      params.scenario === "pure" ||
      [
        "spirals",
        "fractal",
        "mandelbrot",
        "julia",
        "lorenz",
        "hyperbolic",
        "gaussian",
        "cellular",
        "voronoi",
        "perlin",
        "diffusion",
        "wave",
        "8bit",
        "bosch",
      ].includes(params.dataset)
    ) {
      isMathematicalScenario = true
    }

    // Get scenario description based on dataset with enhanced logic
    if (
      params.dataset === "heads" &&
      params.scenario &&
      CULTURAL_DATASETS.heads.scenarios[params.scenario as keyof typeof CULTURAL_DATASETS.heads.scenarios]
    ) {
      const scenario =
        CULTURAL_DATASETS.heads.scenarios[params.scenario as keyof typeof CULTURAL_DATASETS.heads.scenarios]
      scenarioDescription = scenario.description
      basePrompt += `${scenarioDescription}, `
    } else if (
      params.dataset === "faces" &&
      params.scenario &&
      CULTURAL_DATASETS.faces.scenarios[params.scenario as keyof typeof CULTURAL_DATASETS.faces.scenarios]
    ) {
      const scenario =
        CULTURAL_DATASETS.faces.scenarios[params.scenario as keyof typeof CULTURAL_DATASETS.faces.scenarios]
      scenarioDescription = scenario.description
      basePrompt += `${scenarioDescription}, `
    } else if (
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
        basePrompt += `Mathematical visualization of ${params.dataset} patterns with godlevel precision, `
      }
    }

    if (isMathematicalScenario) {
      // 100% ABSTRACT for mathematical scenarios only
      basePrompt +=
        "PURE MATHEMATICAL ABSTRACTION: complete geometric abstraction with no representational elements, pure mathematical visualization, algorithmic beauty generation, computational geometry excellence, mathematical art perfection, geometric abstraction mastery, digital geometry mastery, algorithmic art generation, mathematical visualization excellence, geometric pattern complexity, mathematical art generation, computational beauty, "
    } else {
      // NEURALUA ART STYLE for cultural scenarios - more concrete and representational
      basePrompt +=
        "NEURALUA ART STYLE: highly detailed photorealistic rendering with artistic interpretation, maintaining recognizable cultural elements while enhancing with sophisticated artistic techniques, realistic human features with cultural authenticity, traditional clothing and architecture rendered with museum-quality accuracy, natural lighting with cinematic quality, documentary photography meets fine art painting, cultural heritage preservation through artistic excellence, ethnographic accuracy with artistic beauty, realistic proportions with enhanced visual appeal, authentic cultural representation with artistic mastery, "
    }

    // Add color scheme with enhanced descriptions
    const colorDescription =
      COLOR_SCHEMES[params.colorScheme as keyof typeof COLOR_SCHEMES] || "vibrant colors with professional excellence"

    if (isMathematicalScenario) {
      basePrompt += `rendered in ${colorDescription} with abstract color theory mastery and experimental pigment application, `
    } else {
      basePrompt += `rendered in ${colorDescription} with natural color harmony and realistic lighting, `
    }

    if (isMathematicalScenario) {
      basePrompt +=
        "painterly brushstrokes with digital precision, texture mapping with organic randomness, layered transparency with depth illusion, gestural mark-making with intentional accidents, color field painting with emotional intensity, abstract composition with hidden narratives, "
    } else {
      basePrompt +=
        "photorealistic detail with artistic enhancement, natural textures with authentic materials, realistic lighting with atmospheric depth, cultural authenticity with artistic interpretation, documentary quality with fine art aesthetics, "
    }

    // Add technical parameters - OPTIMIZED FOR SPACE
    basePrompt += `${params.numSamples || 4000} data points with mathematical precision, noise scale ${params.noiseScale || 0.08} for optimal detail, seed ${params.seed || 1234} for reproducible excellence, `

    if (isMathematicalScenario) {
      basePrompt +=
        "museum-grade abstract expressionist quality with international avant-garde standards, experimental composition with controlled spontaneity, ultra-high detail with artistic interpretation, award-winning abstract composition with international recognition, 8K HDR with painterly texture, atmospheric lighting with mood enhancement, breathtaking visual impact with psychological depth, "
    } else {
      basePrompt +=
        "museum-grade photorealistic quality with cultural documentation standards, authentic representation with artistic excellence, ultra-high detail with realistic interpretation, award-winning cultural photography with international recognition, 8K HDR with natural texture, authentic lighting with cultural atmosphere, breathtaking visual impact with cultural significance, "
    }

    // Add 360° specific instructions if needed - CRITICAL SEAMLESS WRAPPING
    if (params.panoramic360 && params.panoramaFormat === "equirectangular") {
      basePrompt +=
        "CRITICAL 360° SEAMLESS WRAPPING: LEFT EDGE must connect PERFECTLY with RIGHT EDGE - zero visible seam, continuous environment with flowing transitions, VR-optimized seamless wraparound with immersive experience, "
    } else if (params.panoramic360 && params.panoramaFormat === "stereographic") {
      basePrompt +=
        "STEREOGRAPHIC 360°: perfect circular composition with radial flow, entire 360° view in circular frame with center focus and natural distortion, "
    }

    if (isMathematicalScenario) {
      basePrompt +=
        "pure abstract perfection with mathematical beauty, award-winning experimental art with international recognition, contemporary art museum quality with cultural significance, godlevel abstract excellence with transcendent beauty, professional gallery standard with collector appeal, fine art exhibition worthy with artistic innovation, abstract mastery with technical virtuosity, creative genius with experimental vision, ultimate abstract perfection achievement"
    } else {
      basePrompt +=
        "cultural authenticity with artistic excellence, award-winning documentary art with international recognition, ethnographic museum quality with cultural significance, godlevel realistic excellence with cultural beauty, professional documentation standard with artistic appeal, cultural exhibition worthy with educational value, realistic mastery with technical virtuosity, cultural genius with authentic vision, ultimate cultural perfection achievement"
    }

    // Ensure we stay within reasonable limits while preserving critical information
    if (basePrompt.length > 1800) {
      // Intelligently truncate while preserving key elements
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
        truncated += ", CRITICAL: LEFT EDGE must connect PERFECTLY with RIGHT EDGE - zero seam, godlevel excellence"
      }

      basePrompt = truncated
    }

    return basePrompt
  } catch (error) {
    console.error("Error building prompt:", error)
    return "ULTIMATE GODLEVEL MASTERPIECE: Beautiful mathematical art with cosmic colors, ultra-high detail with artistic interpretation, award-winning composition with international recognition, 8K HDR with natural texture, excellence with artistic mastery, premium art with godlevel perfection"
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
