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

export const COLOR_SCHEMES = {
  metallic: "Metallic silver and gold tones with chrome reflections",
  neon: "Vibrant neon colors with electric glow effects",
  pastel: "Soft pastel colors with dreamy atmosphere",
  monochrome: "Black and white with dramatic contrast",
  earth: "Natural earth tones with organic warmth",
  ocean: "Deep blues and aqua with water-like fluidity",
  sunset: "Warm oranges and purples with golden light",
  forest: "Rich greens with natural woodland atmosphere",
  cosmic: "Deep space colors with stellar effects",
  vintage: "Retro color palette with aged patina",
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
      "origami-world": {
        name: "📄 Origami Paper Head",
        description:
          "Intricate origami paper head sculpture with visible fold lines and creases, delicate paper texture showing traditional Japanese folding techniques, complex geometric paper construction with multiple layers, warm lighting creating shadows between paper folds, traditional washi paper with subtle patterns, masterful origami artistry with precise angular features, paper portrait with dimensional depth, origami craftsmanship excellence, traditional paper folding mastery, Japanese paper art heritage, handcrafted paper sculpture, artistic paper engineering, godlevel origami portrait excellence.",
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
      "animal-transport": {
        name: "🐘 Elephant Caravan Portrait",
        description:
          "Majestic portrait of a mahout (elephant rider) atop a decorated Indian elephant, intricate traditional headwrap and ceremonial clothing, weathered face showing years of partnership with the gentle giant, ornate elephant decorations with golden bells and colorful textiles, realistic skin texture and facial hair detail, warm golden hour lighting, traditional Indian elephant caravan culture, authentic mahout-elephant bond, professional portrait photography quality, cultural heritage celebration, godlevel portrait excellence with animal transport authenticity.",
      },
      "lego-vision": {
        name: "🧱 LEGO Minifigure Head",
        description:
          "Iconic LEGO minifigure head with classic cylindrical shape and distinctive facial features, smooth plastic surface with precise molded details, authentic LEGO yellow skin tone with subtle texture variations, characteristic dot-matrix eyes and simple curved smile, Danish design excellence with modular construction philosophy, systematic creativity embodied in minimalist facial expression, precision-molded plastic with engineering perfection, childhood imagination catalyst with infinite possibility potential, modular human representation with universal appeal, LEGO brick aesthetic with constructive play heritage, Danish toy craftsmanship with global cultural impact, godlevel LEGO minifigure excellence.",
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
      "origami-world": {
        name: "📄 Origami Paper Expression",
        description:
          "Expressive origami paper face with emotional depth created through strategic paper folds, traditional Japanese paper folding techniques showing joy or contemplation, visible crease patterns forming facial features, warm lighting highlighting paper texture and dimensional shadows, delicate washi paper construction with subtle color variations, masterful origami emotion capture, paper sculpture expressing human feelings, traditional paper art with contemporary emotional resonance, handcrafted paper expression, artistic paper engineering mastery, godlevel origami emotional excellence.",
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
      "animal-transport": {
        name: "🐪 Camel Rider's Joy",
        description:
          "Joyful expression of a Bedouin camel rider crossing desert dunes, genuine smile radiating adventure and freedom, traditional keffiyeh headwrap flowing in desert wind, sun-weathered face showing desert wisdom, eyes sparkling with nomadic spirit, realistic facial expressions of desert travel joy, authentic Middle Eastern features, camel caravan culture celebration, desert nomad lifestyle, traditional Bedouin heritage, godlevel joyful expression with authentic desert transport culture.",
      },
      "lego-vision": {
        name: "🧱 LEGO Expression Variations",
        description:
          "Classic LEGO minifigure facial expressions with interchangeable emotion designs, modular expression system with snap-on face plates, Danish precision in emotional communication through minimal design elements, systematic approach to human emotion representation, constructive play psychology with expression-building possibilities, LEGO facial design evolution from simple dots to complex expressions, modular emotion engineering with childhood development support, precision-molded happiness, surprise, and determination expressions, Danish toy philosophy of creative emotional expression, LEGO face printing technology with micro-detail precision, godlevel LEGO expression excellence.",
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
      "origami-world": {
        name: "📄 Origami Vietnamese Village",
        description:
          "Intricate origami Vietnamese village diorama with paper-folded traditional houses on stilts, delicate paper rice terraces cascading down miniature mountains, origami Vietnamese people in traditional áo dài clothing, paper-crafted temples with curved roofs and dragon decorations, tiny origami boats on paper rivers, handmade paper lotus flowers in temple ponds, warm lighting from paper lanterns creating cozy village atmosphere, visible fold lines showing masterful paper engineering, traditional Vietnamese architecture rendered in precise origami techniques, cultural authenticity preserved through paper art mastery, godlevel Vietnamese origami excellence.",
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
      "animal-transport": {
        name: "🐃 Water Buffalo Rice Farming",
        description:
          "Vietnamese farmer guiding water buffalo through flooded rice paddies, traditional conical hat (nón lá) and rolled-up pants, gentle giant buffalo with massive horns and patient demeanor, muddy rice fields reflecting morning sky, traditional Vietnamese agricultural partnership between human and animal, farmer's weathered hands holding wooden plow, authentic rural Vietnamese lifestyle, water buffalo as essential farming companion, traditional rice cultivation methods, peaceful countryside atmosphere, Vietnamese agricultural heritage, godlevel authentic Vietnamese farming excellence.",
      },
      "lego-vision": {
        name: "🧱 LEGO Vietnamese Village",
        description:
          "Modular LEGO Vietnamese village with brick-built traditional houses on stilts, LEGO minifigure farmers in conical hats working plastic rice terraces, Danish construction system applied to Vietnamese architectural heritage, systematic building approach to cultural representation, LEGO temple complexes with modular pagoda roofs, precision-built Vietnamese cultural elements using standard LEGO bricks, constructive play celebrating Vietnamese traditions, modular approach to cultural education through building, LEGO Vietnamese minifigures with authentic cultural accessories, Danish toy craftsmanship honoring Vietnamese heritage, godlevel LEGO Vietnamese cultural excellence.",
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
      "origami-world": {
        name: "📄 Origami Indonesian Archipelago",
        description:
          "Magnificent origami Indonesian island village with paper-folded traditional houses featuring distinctive curved roofs, delicate origami Borobudur temple with intricate paper stupas, paper-crafted wayang kulit shadow puppets with detailed cutout patterns, origami gamelan orchestra with miniature paper instruments, handmade paper batik patterns showing traditional Indonesian motifs, tiny origami people in traditional Indonesian clothing, paper-folded tropical vegetation and palm trees, warm lighting creating atmospheric shadows between paper layers, visible fold lines showing masterful paper engineering, Indonesian cultural authenticity preserved through origami artistry, godlevel Indonesian origami excellence.",
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
      "animal-transport": {
        name: "🐅 Sumatran Tiger Guardian",
        description:
          "Mystical Indonesian shaman riding a majestic Sumatran tiger through dense rainforest, traditional Indonesian ceremonial clothing with batik patterns, tiger's powerful muscles rippling under orange and black stripes, ancient spiritual bond between human and sacred animal, jungle setting with tropical vegetation, traditional Indonesian animistic beliefs, shamanic journey through forest spirits, tiger as spiritual guardian and transport, Indonesian folklore and mythology, mystical forest atmosphere, godlevel Indonesian spiritual animal transport excellence.",
      },
      "lego-vision": {
        name: "🧱 LEGO Indonesian Archipelago",
        description:
          "Modular LEGO Indonesian island chain with brick-built traditional houses featuring curved roofs, LEGO Borobudur temple constructed from thousands of precision-molded bricks, Danish engineering applied to Indonesian architectural complexity, systematic building approach to cultural monument recreation, LEGO gamelan orchestra with minifigure musicians, modular batik patterns created through LEGO mosaic techniques, constructive play celebrating Indonesian diversity, precision-built temple stupas using advanced LEGO building techniques, LEGO Indonesian minifigures with traditional cultural accessories, Danish toy craftsmanship honoring Indonesian heritage, godlevel LEGO Indonesian cultural excellence.",
      },
    },
  },
  thailand: {
    name: "🇹🇭 Thailand Heritage",
    scenarios: {
      "pure-mathematical": {
        name: "🔢 Pure Mathematical Thai",
        description:
          "Mathematical Thai cultural patterns with geometric temple architecture, fractal naga serpent designs, algorithmic traditional motifs, mathematical art excellence, computational Thai heritage, geometric cultural visualization, mathematical tradition mapping, algorithmic cultural beauty, digital heritage mastery, mathematical Thai excellence, geometric pattern complexity, computational cultural generation, mathematical visualization excellence, godlevel mathematical Thai artistry.",
      },
      "origami-world": {
        name: "📄 Origami Thai Temple Complex",
        description:
          "Elaborate origami Thai temple complex with paper-folded golden stupas and intricate spires, delicate origami Thai monks in saffron robes, paper-crafted traditional Thai architecture with curved rooflines, origami naga serpents guarding temple entrances, handmade paper lotus flowers floating in temple ponds, tiny origami Thai people in traditional clothing, paper-folded tropical gardens with palm trees, warm golden lighting from paper lanterns creating sacred atmosphere, visible fold lines showing masterful paper engineering, Thai Buddhist cultural authenticity preserved through origami mastery, godlevel Thai origami excellence.",
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
      "animal-transport": {
        name: "🐘 Royal Thai Elephant Procession",
        description:
          "Ornate Thai royal elephant procession with mahout in traditional Thai silk clothing, elephant decorated with golden howdah (seat) and ceremonial regalia, intricate Thai artistic decorations covering elephant's body, traditional Thai royal ceremony atmosphere, mahout wearing traditional Thai headdress, elephant's gentle eyes showing intelligence and training, authentic Thai elephant culture, royal procession grandeur, traditional Thai craftsmanship in decorations, cultural significance of elephants in Thai society, godlevel Thai royal elephant transport excellence.",
      },
      "lego-vision": {
        name: "🧱 LEGO Thai Temple Complex",
        description:
          "Elaborate LEGO Thai temple complex with golden brick-built stupas and intricate spires, modular construction system applied to Thai architectural grandeur, LEGO monks in saffron robes with precision-molded accessories, Danish engineering excellence recreating Thai temple complexity, systematic building approach to Buddhist architecture, LEGO naga serpents guarding temple entrances with articulated brick construction, modular Thai cultural elements with authentic proportions, constructive play celebrating Thai Buddhist heritage, precision-built temple rooflines using advanced LEGO techniques, LEGO Thai minifigures with traditional cultural accessories, godlevel LEGO Thai temple excellence.",
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
      "origami-world": {
        name: "📄 Origami Impossible Architecture",
        description:
          "Mind-bending origami impossible architecture with paper-folded paradoxical structures, Escher-inspired origami staircases that fold back on themselves, paper tessellations creating optical illusions through strategic folding, impossible origami geometry with mathematical precision, paper-crafted architectural paradoxes, visible fold lines creating additional visual complexity, warm lighting emphasizing dimensional paper shadows, masterful origami engineering defying spatial logic, traditional Japanese paper folding techniques applied to impossible geometries, paper sculpture mathematics, godlevel impossible origami excellence.",
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
      "animal-transport": {
        name: "🦅 Impossible Flying Fish Transport",
        description:
          "Escher-inspired impossible transportation with people riding giant flying fish through paradoxical architecture, fish swimming through air while people walk on water below, mind-bending perspective with multiple gravity directions, impossible animal transport defying physics laws, geometric precision in impossible animal anatomy, mathematical impossibility made visually compelling, optical illusion with perfect artistic execution, surreal animal transportation paradox, Escher-style tessellation patterns on fish scales, godlevel impossible animal transport artistry.",
      },
      "lego-vision": {
        name: "🧱 LEGO Impossible Architecture",
        description:
          "Mind-bending LEGO impossible architecture with modular brick construction defying physics laws, Danish precision engineering applied to paradoxical structures, LEGO staircases that connect in impossible ways using systematic building techniques, modular optical illusions created through precise brick placement, constructive play with mathematical impossibility, LEGO tessellation patterns using standard brick elements, systematic approach to visual paradox construction, precision-molded LEGO elements creating Escher-inspired illusions, Danish toy engineering excellence in impossible geometry, modular construction philosophy applied to visual mathematics, godlevel LEGO impossible architecture excellence.",
      },
    },
  },
  spirals: {
    name: "🌀 Spirals",
    scenarios: {
      "origami-world": {
        name: "📄 Origami Spiral Garden",
        description:
          "Mesmerizing origami spiral garden with paper-folded spiral patterns creating three-dimensional mathematical beauty, delicate paper spirals following Fibonacci sequences, origami flowers arranged in golden ratio spirals, paper-crafted spiral staircases and pathways, handmade paper trees with spiral branch patterns, warm lighting creating spiral shadows, visible fold lines emphasizing spiral geometry, masterful origami engineering showing natural spiral mathematics, traditional Japanese paper folding techniques applied to spiral forms, paper sculpture spiral mastery, godlevel spiral origami excellence.",
      },
      pure: {
        name: "Pure Mathematical Spirals",
        description:
          "Mathematical spiral patterns with Fibonacci sequences perfection, golden ratio spirals with divine proportions, logarithmic spirals found in nature's design, Archimedean spirals with perfect mathematical precision, hyperbolic spirals with infinite complexity, mathematical elegance embodiment, geometric beauty transcendence, natural spiral formations with cosmic significance, mathematical harmony with universal patterns, spiral mathematics mastery, geometric perfection achievement, mathematical art excellence, godlevel spiral mastery.",
      },
      "animal-transport": {
        name: "🐌 Giant Spiral Shell Snail Ride",
        description:
          "Fantastical transportation on giant spiral shell snails with riders sitting in natural spiral chambers, snail shells following perfect Fibonacci spiral patterns, mathematical precision in shell geometry, riders following spiral pathways on snail's back, golden ratio spirals in shell construction, natural spiral mathematics embodied in living transport, spiral slime trails creating geometric patterns, mathematical beauty in biological spiral forms, spiral animal transport with geometric perfection, godlevel spiral animal transport excellence.",
      },
    },
  },
  fractal: {
    name: "🔺 Fractal",
    scenarios: {
      "origami-world": {
        name: "📄 Origami Fractal Forest",
        description:
          "Intricate origami fractal forest with paper-folded trees showing self-similar branching patterns, delicate paper leaves arranged in fractal geometries, origami fractals creating infinite detail through recursive paper folding, handmade paper structures with mathematical precision, warm lighting revealing fractal shadows and depth, visible fold lines emphasizing fractal complexity, masterful origami engineering showing natural fractal mathematics, traditional Japanese paper folding techniques applied to fractal forms, paper sculpture fractal mastery, godlevel fractal origami excellence.",
      },
      pure: {
        name: "Pure Fractal Geometry",
        description:
          "Fractal geometry patterns with self-similar structures, infinite complexity, recursive patterns, mathematical fractals, geometric iterations, fractal dimensions, mathematical beauty, infinite detail, natural fractal formations.",
      },
      "animal-transport": {
        name: "🦌 Fractal Antler Deer Transport",
        description:
          "Magical transportation on deer with fractal antler patterns, antlers showing infinite self-similar branching structures, riders navigating through fractal forest on deer back, mathematical precision in antler geometry, fractal patterns repeating at multiple scales, deer moving through fractal landscape with recursive tree patterns, natural fractal mathematics in animal anatomy, fractal animal transport with infinite detail, mathematical beauty in biological fractal forms, godlevel fractal animal transport excellence.",
      },
    },
  },
  mandelbrot: {
    name: "🔢 Mandelbrot",
    scenarios: {
      "origami-world": {
        name: "📄 Origami Mandelbrot Landscape",
        description:
          "Complex origami Mandelbrot landscape with paper-folded mathematical patterns, delicate paper structures showing infinite detail, origami interpretation of complex number mathematics, handmade paper fractals with recursive folding patterns, warm lighting revealing mathematical beauty through paper shadows, visible fold lines creating additional complexity layers, masterful origami engineering translating mathematical concepts into paper art, traditional Japanese paper folding techniques applied to mathematical visualization, paper sculpture mathematics mastery, godlevel mathematical origami excellence.",
      },
      pure: {
        name: "Mandelbrot Set Visualization",
        description:
          "Mandelbrot set visualizations with complex number iterations, fractal boundaries, mathematical complexity, infinite detail, chaotic dynamics, mathematical art, computational beauty, complex plane mathematics.",
      },
      "animal-transport": {
        name: "🐙 Mandelbrot Octopus Submarine",
        description:
          "Underwater transportation on giant octopus with tentacles showing Mandelbrot set patterns, octopus tentacles creating complex mathematical curves, riders in bio-luminescent underwater vehicle, tentacle patterns following complex number iterations, mathematical precision in octopus anatomy, underwater transport through mathematical seascape, complex dynamics in tentacle movement, Mandelbrot mathematics embodied in living sea creature, mathematical beauty in cephalopod transport, godlevel Mandelbrot animal transport excellence.",
      },
    },
  },
  julia: {
    name: "🎭 Julia",
    scenarios: {
      "origami-world": {
        name: "📄 Origami Julia Set Garden",
        description:
          "Elegant origami Julia set garden with paper-folded mathematical patterns creating beautiful landscapes, delicate paper structures showing chaotic attractors, origami interpretation of complex dynamics, handmade paper fractals with artistic precision, warm lighting revealing mathematical beauty through dimensional paper shadows, visible fold lines adding visual complexity, masterful origami engineering translating mathematical chaos into paper harmony, traditional Japanese paper folding techniques applied to Julia set visualization, paper sculpture mathematical artistry, godlevel Julia origami excellence.",
      },
      pure: {
        name: "Julia Set Fractals",
        description:
          "Julia set fractals with complex dynamics, mathematical iterations, fractal art, chaotic attractors, mathematical beauty, computational geometry, infinite patterns, complex number mathematics.",
      },
      "animal-transport": {
        name: "🦋 Julia Set Butterfly Swarm",
        description:
          "Ethereal transportation on swarm of butterflies with Julia set wing patterns, butterfly wings showing chaotic attractor mathematics, riders floating on cloud of mathematical butterflies, wing patterns following complex dynamics, Julia set fractals in butterfly wing designs, chaotic beauty in butterfly swarm transport, mathematical precision in wing geometry, butterfly migration following Julia set trajectories, mathematical chaos embodied in living transport, godlevel Julia animal transport excellence.",
      },
    },
  },
  lorenz: {
    name: "🦋 Lorenz",
    scenarios: {
      "origami-world": {
        name: "📄 Origami Butterfly Effect",
        description:
          "Delicate origami butterfly effect visualization with paper-folded chaotic patterns, intricate paper butterflies showing sensitive dependence, origami interpretation of chaos theory, handmade paper structures demonstrating nonlinear dynamics, warm lighting creating atmospheric chaos visualization, visible fold lines emphasizing butterfly wing patterns, masterful origami engineering showing mathematical chaos beauty, traditional Japanese paper folding techniques applied to chaos theory, paper sculpture chaos mastery, godlevel chaos origami excellence.",
      },
      pure: {
        name: "Lorenz Attractor Chaos",
        description:
          "Lorenz attractor patterns with chaos theory visualization, butterfly effect, strange attractors, dynamical systems, mathematical chaos, nonlinear dynamics, chaotic beauty, sensitive dependence.",
      },
      "animal-transport": {
        name: "🦋 Chaos Butterfly Migration",
        description:
          "Transportation following butterfly migration patterns showing Lorenz attractor chaos, butterflies creating chaotic flight paths with sensitive dependence, riders following unpredictable butterfly swarm transport, butterfly effect visualization in migration routes, chaotic dynamics in animal movement, mathematical chaos embodied in butterfly behavior, sensitive dependence in transport trajectories, chaos theory demonstrated through butterfly transport, mathematical beauty in chaotic animal movement, godlevel chaos animal transport excellence.",
      },
    },
  },
  hyperbolic: {
    name: "🌐 Hyperbolic",
    scenarios: {
      "origami-world": {
        name: "📄 Origami Hyperbolic Space",
        description:
          "Mind-bending origami hyperbolic space with paper-folded curved geometries, delicate paper structures showing non-Euclidean mathematics, origami interpretation of hyperbolic tessellations, handmade paper demonstrating curved space concepts, warm lighting revealing geometric complexity through paper shadows, visible fold lines emphasizing hyperbolic curvature, masterful origami engineering translating advanced geometry into paper art, traditional Japanese paper folding techniques applied to hyperbolic geometry, paper sculpture geometric mastery, godlevel hyperbolic origami excellence.",
      },
      pure: {
        name: "Hyperbolic Geometry",
        description:
          "Hyperbolic geometry patterns with non-Euclidean geometry, curved space visualizations, hyperbolic tessellations, mathematical geometry, geometric art, spatial mathematics, curved space beauty.",
      },
      "animal-transport": {
        name: "🐢 Hyperbolic Turtle Shell Transport",
        description:
          "Transportation on giant turtle with hyperbolic shell geometry, turtle shell showing non-Euclidean curved space patterns, riders navigating hyperbolic space on turtle back, shell patterns following hyperbolic tessellations, mathematical precision in curved shell geometry, hyperbolic animal transport through curved spacetime, non-Euclidean mathematics in turtle anatomy, geometric beauty in hyperbolic shell patterns, mathematical transport through curved space, godlevel hyperbolic animal transport excellence.",
      },
    },
  },
  gaussian: {
    name: "📊 Gaussian",
    scenarios: {
      "origami-world": {
        name: "📄 Origami Statistical Landscape",
        description:
          "Elegant origami statistical landscape with paper-folded bell curves and probability distributions, delicate paper structures showing Gaussian mathematics, origami interpretation of statistical beauty, handmade paper graphs with dimensional depth, warm lighting revealing statistical patterns through paper shadows, visible fold lines creating data visualization art, masterful origami engineering translating statistics into paper sculpture, traditional Japanese paper folding techniques applied to mathematical probability, paper sculpture statistical mastery, godlevel statistical origami excellence.",
      },
      pure: {
        name: "Gaussian Distributions",
        description:
          "Gaussian distributions with statistical visualizations, probability curves, normal distributions, mathematical statistics, data visualization, statistical beauty, mathematical probability, bell curves.",
      },
      "animal-transport": {
        name: "🐧 Gaussian Penguin Colony March",
        description:
          "Transportation following penguin colony migration showing Gaussian distribution patterns, penguins arranged in bell curve formations during march, riders following statistical animal behavior, penguin movement creating probability distribution patterns, mathematical precision in colony organization, statistical beauty in animal group behavior, Gaussian mathematics embodied in penguin transport, probability patterns in animal migration, mathematical statistics in biological transport, godlevel Gaussian animal transport excellence.",
      },
    },
  },
  cellular: {
    name: "🔬 Cellular",
    scenarios: {
      "origami-world": {
        name: "📄 Origami Cellular Automata",
        description:
          "Fascinating origami cellular automata with paper-folded emergent patterns, delicate paper cells showing computational evolution, origami interpretation of Conway's Game of Life, handmade paper structures demonstrating emergent behavior, warm lighting revealing pattern emergence through paper shadows, visible fold lines creating cellular grid systems, masterful origami engineering showing computational beauty, traditional Japanese paper folding techniques applied to algorithmic art, paper sculpture computational mastery, godlevel cellular origami excellence.",
      },
      pure: {
        name: "Cellular Automata",
        description:
          "Cellular automata patterns with Conway's Game of Life, emergent behavior, computational patterns, rule-based systems, mathematical emergence, algorithmic art, computational beauty, emergent complexity.",
      },
      "animal-transport": {
        name: "🐝 Cellular Automata Bee Swarm",
        description:
          "Transportation on bee swarm following cellular automata patterns, bees creating emergent behavior through simple rules, riders navigating on living cellular automata transport, bee colony showing computational emergence, mathematical precision in swarm intelligence, cellular patterns in bee behavior, emergent transport through bee colony, computational beauty in biological systems, mathematical emergence in animal transport, godlevel cellular animal transport excellence.",
      },
    },
  },
  voronoi: {
    name: "🕸️ Voronoi",
    scenarios: {
      "origami-world": {
        name: "📄 Origami Voronoi Cells",
        description:
          "Intricate origami Voronoi diagram with paper-folded spatial partitions, delicate paper cells showing proximity patterns, origami interpretation of computational geometry, handmade paper structures demonstrating natural tessellations, warm lighting revealing geometric relationships through paper shadows, visible fold lines emphasizing cell boundaries, masterful origami engineering translating spatial mathematics into paper art, traditional Japanese paper folding techniques applied to Voronoi patterns, paper sculpture geometric mastery, godlevel Voronoi origami excellence.",
      },
      pure: {
        name: "Voronoi Diagrams",
        description:
          "Voronoi diagrams with spatial partitioning, geometric tessellations, proximity patterns, computational geometry, mathematical partitions, geometric art, spatial mathematics, natural patterns.",
      },
      "animal-transport": {
        name: "🦒 Voronoi Giraffe Pattern Transport",
        description:
          "Transportation on giraffe with coat patterns showing Voronoi diagram tessellations, giraffe spots creating natural spatial partitioning, riders navigating Voronoi pattern landscape on giraffe back, mathematical precision in giraffe spot geometry, Voronoi mathematics embodied in animal markings, geometric beauty in natural animal patterns, spatial partitioning in biological transport, mathematical tessellations in giraffe anatomy, natural Voronoi patterns in animal transport, godlevel Voronoi animal transport excellence.",
      },
    },
  },
  perlin: {
    name: "🌊 Perlin",
    scenarios: {
      "origami-world": {
        name: "📄 Origami Noise Landscape",
        description:
          "Organic origami noise landscape with paper-folded natural randomness patterns, delicate paper terrain showing Perlin noise mathematics, origami interpretation of procedural generation, handmade paper structures demonstrating algorithmic textures, warm lighting revealing natural randomness through paper shadows, visible fold lines creating organic texture patterns, masterful origami engineering translating computational noise into paper art, traditional Japanese paper folding techniques applied to procedural patterns, paper sculpture algorithmic mastery, godlevel noise origami excellence.",
      },
      pure: {
        name: "Perlin Noise Patterns",
        description:
          "Perlin noise patterns with procedural generation, natural randomness, algorithmic textures, computational noise, mathematical randomness, procedural art, algorithmic beauty, natural textures.",
      },
      "animal-transport": {
        name: "🐋 Perlin Noise Whale Song Transport",
        description:
          "Transportation on whale following Perlin noise patterns in ocean currents, whale song creating natural randomness in navigation, riders following procedural whale migration routes, whale movement showing organic noise patterns, mathematical precision in natural whale behavior, Perlin noise embodied in whale transport, algorithmic beauty in biological navigation, procedural patterns in animal transport, natural randomness in whale migration, godlevel Perlin animal transport excellence.",
      },
    },
  },
  diffusion: {
    name: "⚗️ Reaction-Diffusion",
    scenarios: {
      "origami-world": {
        name: "📄 Origami Reaction Patterns",
        description:
          "Dynamic origami reaction-diffusion patterns with paper-folded chemical-inspired designs, delicate paper structures showing Turing patterns, origami interpretation of self-organization, handmade paper demonstrating pattern formation mathematics, warm lighting revealing biological patterns through paper shadows, visible fold lines emphasizing reaction boundaries, masterful origami engineering translating chemical patterns into paper art, traditional Japanese paper folding techniques applied to biological mathematics, paper sculpture pattern mastery, godlevel reaction origami excellence.",
      },
      pure: {
        name: "Reaction-Diffusion Systems",
        description:
          "Reaction-diffusion systems with pattern formation, chemical patterns, Turing patterns, mathematical biology, emergent patterns, natural mathematics, biological computation, self-organization.",
      },
      "animal-transport": {
        name: "🐆 Reaction-Diffusion Leopard Spots",
        description:
          "Transportation on leopard with coat patterns showing reaction-diffusion mathematics, leopard spots created by Turing pattern formation, riders navigating pattern formation landscape on leopard back, mathematical precision in spot development, reaction-diffusion embodied in animal markings, biological pattern formation in transport, mathematical chemistry in leopard anatomy, Turing patterns in animal transport, natural mathematics in biological systems, godlevel reaction-diffusion animal transport excellence.",
      },
    },
  },
  wave: {
    name: "〰️ Wave",
    scenarios: {
      "origami-world": {
        name: "📄 Origami Wave Interference",
        description:
          "Flowing origami wave interference patterns with paper-folded harmonic oscillations, delicate paper waves showing mathematical frequency, origami interpretation of wave equations, handmade paper structures demonstrating wave dynamics, warm lighting revealing wave patterns through paper shadows, visible fold lines creating wave interference effects, masterful origami engineering translating acoustic mathematics into paper art, traditional Japanese paper folding techniques applied to wave visualization, paper sculpture harmonic mastery, godlevel wave origami excellence.",
      },
      pure: {
        name: "Wave Interference",
        description:
          "Wave interference patterns with harmonic oscillations, wave equations, frequency visualizations, mathematical waves, acoustic patterns, wave mathematics, harmonic beauty, wave dynamics.",
      },
      "animal-transport": {
        name: "🐬 Wave Interference Dolphin Pod",
        description:
          "Transportation on dolphin pod creating wave interference patterns, dolphins jumping in harmonic wave formations, riders following wave mathematics on dolphin transport, dolphin echolocation showing wave interference, mathematical precision in dolphin wave behavior, wave dynamics embodied in dolphin transport, acoustic beauty in biological wave systems, harmonic patterns in animal transport, wave mathematics in dolphin navigation, godlevel wave animal transport excellence.",
      },
    },
  },
  "8bit": {
    name: "🎮 8bit",
    scenarios: {
      "origami-world": {
        name: "📄 Origami Pixel World",
        description:
          "Nostalgic origami pixel world with paper-folded 8-bit aesthetic, delicate paper squares creating pixelated patterns, origami interpretation of retro gaming, handmade paper structures showing digital nostalgia, warm lighting revealing pixel art through paper shadows, visible fold lines emphasizing geometric pixel boundaries, masterful origami engineering translating digital art into paper craft, traditional Japanese paper folding techniques applied to pixel art, paper sculpture digital mastery, godlevel pixel origami excellence.",
      },
      pure: {
        name: "8-bit Pixel Art",
        description:
          "8-bit pixel art patterns with retro gaming aesthetics, pixelated mathematical visualizations, digital art, computational graphics, nostalgic computing, pixel mathematics, digital beauty, retro aesthetics.",
      },
      "animal-transport": {
        name: "🐴 8-bit Pixel Horse Transport",
        description:
          "Retro 8-bit pixel art transportation on blocky pixel horse, horse rendered in classic video game style, riders in pixelated medieval armor, nostalgic gaming aesthetic with limited color palette, pixel art animation frames showing horse gallop, retro gaming transport with authentic 8-bit limitations, digital nostalgia in animal transport, classic arcade game style, pixel perfect horse anatomy, godlevel 8-bit animal transport excellence.",
      },
    },
  },
  bosch: {
    name: "🖼️ Bosch Masterpieces",
    scenarios: {
      "pure-mathematical": {
        name: "🔢 Pure Mathematical Bosch",
        description:
          "Mathematical Bosch-inspired patterns with geometric surrealism, fractal fantastical creatures, algorithmic medieval symbolism, mathematical art excellence, computational surreal heritage, geometric fantasy visualization, mathematical surrealism mapping, algorithmic artistic beauty, digital medieval mastery, mathematical artistic excellence, geometric pattern complexity, computational surreal generation, mathematical visualization excellence, godlevel mathematical Bosch artistry.",
      },
      "origami-world": {
        name: "📄 Origami Garden of Delights",
        description:
          "Surreal origami Garden of Earthly Delights with paper-folded fantastical creatures and impossible beings, delicate paper paradise with origami hybrid animals, handmade paper figures in various poses, origami interpretation of Bosch's surreal vision, paper-crafted medieval symbolism with contemporary precision, warm lighting creating mysterious shadows between paper layers, visible fold lines adding to the surreal complexity, masterful origami engineering translating Renaissance surrealism into paper art, traditional Japanese paper folding techniques applied to medieval fantasy, paper sculpture surreal mastery, godlevel Bosch origami excellence.",
      },
      "garden-earthly-delights": {
        name: "🌺 Garden of Earthly Delights",
        description:
          "Hieronymus Bosch's masterpiece Garden of Earthly Delights reimagined with photorealistic detail, the central panel showing nude figures in paradise garden with giant fruits and fantastical creatures, people riding oversized animals through lush landscapes, transparent spheres and crystal formations, exotic birds and hybrid creatures, medieval paradise with surreal elements, detailed human figures in natural poses, realistic skin tones and anatomy, lush garden vegetation with botanical accuracy, crystal-clear water features, fantastical architecture with realistic materials, Bosch's symbolic imagery rendered with documentary precision, surreal paradise with photographic quality, medieval fantasy with contemporary realism, museum-quality Renaissance artistry, godlevel Bosch excellence.",
      },
      "haywain-triptych": {
        name: "🚜 The Haywain Triptych",
        description:
          "Bosch's Haywain triptych with photorealistic medieval life, central panel showing people fighting over hay wagon representing worldly vanity, realistic medieval peasants and nobles in period-accurate clothing, detailed medieval landscape with authentic architecture, horse-drawn wagon with realistic craftsmanship, people climbing and falling from hay with natural physics, medieval town in background with architectural accuracy, demons and angels rendered with creature design excellence, realistic fire and smoke effects, authentic medieval weapons and tools, period-accurate social hierarchy depicted, medieval daily life with ethnographic precision, Bosch's moral allegory with documentary realism, godlevel medieval artistry.",
      },
      "temptation-st-anthony": {
        name: "👹 Temptation of St. Anthony",
        description:
          "Bosch's Temptation of St. Anthony with cinematic horror realism, hermit saint surrounded by grotesque demons and tempting creatures, realistic medieval monastery ruins with architectural detail, fantastical creatures with professional creature design, hybrid animals with biological plausibility, medieval hermit clothing with textile accuracy, dramatic lighting creating atmospheric mood, realistic fire and supernatural phenomena, detailed landscape with medieval authenticity, demons rendered with special effects quality, religious symbolism with cultural accuracy, medieval spiritual warfare with psychological depth, horror elements with artistic sophistication, godlevel religious artistry.",
      },
      "ship-fools": {
        name: "🚢 Ship of Fools",
        description:
          "Bosch's Ship of Fools with maritime realism, medieval boat filled with reveling passengers, realistic wooden ship construction with nautical accuracy, medieval clothing and accessories with period detail, people drinking and making merry with authentic medieval customs, detailed water and river landscape, realistic medieval musical instruments, authentic medieval food and drink, period-accurate social satire, medieval river life with ethnographic precision, boat craftsmanship with historical accuracy, medieval party atmosphere with cultural authenticity, social commentary with realistic human behavior, godlevel medieval maritime artistry.",
      },
      "death-miser": {
        name: "💀 Death and the Miser",
        description:
          "Bosch's Death and the Miser with dramatic realism, dying wealthy man in ornate medieval bedroom, realistic medieval interior with period furniture, detailed textiles and luxury objects, skeletal Death figure with anatomical accuracy, angels and demons with creature design excellence, medieval medical practices depicted, realistic candlelight and shadows, authentic medieval wealth display, period-accurate religious imagery, medieval deathbed scene with cultural authenticity, moral allegory with psychological depth, medieval memento mori with artistic sophistication, godlevel medieval mortality artistry.",
      },
      "seven-deadly-sins": {
        name: "😈 Seven Deadly Sins",
        description:
          "Bosch's Seven Deadly Sins table with photorealistic medieval scenes, circular composition showing each sin in detailed vignettes, realistic medieval people committing sins with psychological accuracy, authentic medieval settings and architecture, period-accurate clothing and objects, detailed facial expressions showing human nature, medieval daily life with ethnographic precision, moral instruction with artistic excellence, religious symbolism with cultural authenticity, medieval social commentary with realistic human behavior, circular mandala composition with geometric precision, godlevel medieval moral artistry.",
      },
      "adoration-magi": {
        name: "👑 Adoration of the Magi",
        description:
          "Bosch's Adoration of the Magi with Renaissance realism, three wise men presenting gifts to infant Jesus, realistic medieval and exotic clothing with textile detail, authentic Middle Eastern and European faces, detailed landscape with architectural accuracy, realistic animals including camels and horses, period-accurate religious iconography, authentic medieval craftsmanship in gifts, detailed facial expressions with emotional depth, biblical scene with historical accuracy, Renaissance painting techniques with oil mastery, religious devotion with artistic sophistication, godlevel religious Renaissance artistry.",
      },
      "crowning-thorns": {
        name: "👑 Crowning with Thorns",
        description:
          "Bosch's Crowning with Thorns with dramatic realism, Christ surrounded by tormentors in close-up composition, realistic human faces showing cruelty and suffering, detailed medieval armor and weapons, authentic period clothing and accessories, dramatic lighting emphasizing emotional intensity, realistic blood and wounds with medical accuracy, psychological portraiture with emotional depth, religious passion with artistic sophistication, medieval brutality with historical accuracy, human cruelty depicted with unflinching realism, godlevel religious drama artistry.",
      },
      "cure-folly": {
        name: "🧠 Cure of Folly",
        description:
          "Bosch's Cure of Folly with medical realism, medieval surgeon removing 'stone of madness' from patient's head, realistic medieval medical instruments and procedures, authentic period clothing for doctor and patient, detailed medieval interior with medical accuracy, realistic human anatomy and surgical detail, medieval medical practices with historical accuracy, psychological commentary with artistic depth, medical satire with cultural authenticity, medieval healthcare with ethnographic precision, human folly depicted with realistic detail, godlevel medieval medical artistry.",
      },
      "ecce-homo": {
        name: "👤 Ecce Homo",
        description:
          "Bosch's Ecce Homo with Renaissance portraiture realism, Christ presented to crowd with emotional intensity, realistic medieval crowd with individual character faces, authentic period architecture and clothing, detailed facial expressions showing human nature, biblical scene with historical accuracy, Renaissance painting techniques with artistic mastery, religious drama with psychological depth, medieval justice system depicted, human mob psychology with realistic behavior, godlevel religious portraiture artistry.",
      },
      "hermit-saints": {
        name: "🙏 Hermit Saints",
        description:
          "Bosch's hermit saints with spiritual realism, medieval hermits in wilderness settings, realistic medieval monastic clothing and accessories, authentic landscape with botanical accuracy, detailed cave dwellings and hermitages, realistic medieval religious objects and books, spiritual contemplation with psychological depth, medieval asceticism with cultural authenticity, wilderness survival with historical accuracy, religious devotion with artistic sophistication, medieval spirituality with ethnographic precision, godlevel religious hermit artistry.",
      },
      "last-judgment": {
        name: "⚖️ Last Judgment",
        description:
          "Bosch's Last Judgment with apocalyptic realism, Christ as judge with divine authority, realistic angels and demons with creature design excellence, detailed heaven and hell landscapes, authentic medieval religious iconography, dramatic lighting emphasizing divine judgment, realistic human figures in various states, biblical apocalypse with theological accuracy, medieval eschatology with cultural authenticity, divine justice with artistic sophistication, religious terror and hope depicted, godlevel apocalyptic artistry.",
      },
      "musical-hell": {
        name: "🎵 Musical Hell",
        description:
          "Bosch's musical hell with surreal realism, demons torturing souls with oversized musical instruments, realistic medieval instruments with acoustic accuracy, detailed torture scenes with artistic sophistication, fantastical creatures with biological plausibility, medieval hell imagery with theological accuracy, musical punishment with creative interpretation, demonic orchestra with creature design excellence, realistic fire and brimstone effects, medieval damnation with cultural authenticity, artistic horror with psychological depth, godlevel infernal musical artistry.",
      },
      "tree-man": {
        name: "🌳 Tree Man",
        description:
          "Bosch's Tree Man with surreal biological realism, hybrid creature with tree trunk body and human head, realistic bark texture and botanical detail, human anatomy integrated with plant biology, fantastical creature with biological plausibility, surreal landscape with environmental accuracy, medieval symbolism with artistic interpretation, hybrid biology with scientific speculation, creature design with artistic excellence, surreal anatomy with medical accuracy, fantastical evolution with creative genius, godlevel surreal creature artistry.",
      },
      "world-upside-down": {
        name: "🙃 World Upside Down",
        description:
          "Bosch's world upside down with satirical realism, medieval social order reversed with comic accuracy, realistic medieval people in absurd situations, authentic period clothing and objects, detailed medieval settings with architectural accuracy, social satire with cultural authenticity, medieval humor with psychological insight, absurd situations with realistic physics, comic reversal with artistic sophistication, medieval carnival atmosphere with ethnographic precision, human folly with artistic wisdom, godlevel satirical medieval artistry.",
      },
      "animal-transport": {
        name: "🦄 Bosch Fantastical Beast Transport",
        description:
          "Surreal transportation on Hieronymus Bosch-inspired hybrid creatures, fantastical beasts with multiple animal parts combined, riders on impossible animals with bird wings, fish tails, and mammal bodies, medieval surrealism with creature design excellence, Bosch-style hybrid anatomy with biological plausibility, fantastical animal transport through surreal landscape, medieval bestiary creatures with artistic sophistication, impossible animal combinations with Renaissance artistry, surreal creature transport with cultural authenticity, godlevel Bosch animal transport excellence.",
      },
      "lego-vision": {
        name: "🧱 LEGO Garden of Delights",
        description:
          "Surreal LEGO Garden of Earthly Delights with brick-built fantastical creatures and impossible beings, modular LEGO paradise with hybrid animals constructed from standard bricks, LEGO minifigure Adam and Eve in plastic Eden, Danish construction system applied to Bosch's surreal vision, systematic building approach to medieval fantasy recreation, LEGO hybrid creatures with articulated brick construction, modular LEGO symbolism with contemporary precision, constructive play with Renaissance surrealism, precision-molded LEGO elements creating Bosch-inspired illusions, Danish toy engineering excellence in impossible biology, godlevel LEGO Bosch excellence.",
      },
    },
  },
  whiterabbit: {
    name: "🐰 White Rabbit Gallery - Hooligan",
    scenarios: {
      "pure-mathematical": {
        name: "🔢 Pure Mathematical Hooligan",
        description:
          "Mathematical hooligan visualization with geometric rebellion patterns, fractal chaos theory, algorithmic street art excellence, computational graffiti mastery, mathematical vandalism artistry, geometric punk aesthetics, digital rebellion mathematics, algorithmic counter-culture, mathematical street excellence, geometric urban warfare, computational punk mastery, mathematical chaos generation, algorithmic rebellion artistry, geometric street mathematics, godlevel mathematical hooligan excellence.",
      },
      "origami-world": {
        name: "📄 Origami Hooligan Paper",
        description:
          "Rebellious origami hooligan with paper punk aesthetics, folded paper mohawk and spikes, aggressive angular paper construction, torn and weathered paper texture, street art origami with urban edge, paper graffiti elements, folded paper leather jacket, origami chains and punk accessories, paper rebellion artistry, urban paper sculpture, street origami mastery, punk paper engineering, rebellious paper folding, origami counter-culture, paper punk excellence, godlevel origami hooligan artistry.",
      },
      "street-punk-rebellion": {
        name: "🎸 Street Punk Rebellion",
        description:
          "Authentic street punk hooligan with mohawk and leather jacket, realistic punk fashion with safety pins and patches, urban graffiti background with street art excellence, rebellious attitude with authentic punk culture, street photography realism, underground music scene authenticity, punk rock heritage celebration, counter-culture documentation, urban rebellion artistry, street punk excellence, authentic subculture representation, punk fashion accuracy, rebellious spirit capture, godlevel punk artistry.",
      },
      "animal-transport": {
        name: "🐺 Wolf Pack Urban Transport",
        description:
          "Urban hooligan riding with wolf pack through city streets, realistic wolves with pack behavior, street punk rider with authentic punk fashion, urban environment with graffiti and street art, motorcycle gang aesthetics with wolf companions, rebellious transportation with animal allies, street pack mentality, urban wildlife integration, punk animal bonding, street rebellion with nature, authentic urban wolf pack, godlevel hooligan animal transport excellence.",
      },
    },
  },
  surreal: {
    name: "🎭 Surreal Creatures",
    scenarios: {
      "pure-mathematical": {
        name: "🔢 Pure Mathematical Surrealism",
        description:
          "Mathematical surrealism with impossible geometric creatures, fractal animal-human hybrids, algorithmic dream logic, computational impossibility generation, mathematical fantasy excellence, geometric surreal mastery, digital dream mathematics, algorithmic surreal artistry, mathematical impossibility visualization, geometric fantasy generation, computational surreal excellence, mathematical dream logic, algorithmic impossible creatures, geometric surreal mathematics, godlevel mathematical surrealism excellence.",
      },
      "origami-world": {
        name: "📄 Origami Impossible Beings",
        description:
          "Surreal origami creatures with impossible paper anatomy, folded paper human-animal hybrids, origami Victorian gentlemen with paper top hats, paper snail shells with intricate fold patterns, impossible paper engineering with surreal proportions, origami dream logic with paper magic, folded paper fantasy creatures, surreal paper sculpture mastery, origami impossibility artistry, paper dream engineering, surreal origami excellence, godlevel impossible paper creatures.",
      },
      "victorian-steampunk-menagerie": {
        name: "🎩 Victorian Steampunk Menagerie",
        description:
          "Elaborate Victorian steampunk menagerie with brass-adorned gentlemen riding impossible creatures, ornate top hats with clockwork mechanisms, copper and brass animal companions with steam-powered limbs, Victorian formal wear with mechanical augmentations, sepia-toned dreamscape with floating butterflies, intricate gear-work integrated into living beings, steam vents and pressure gauges on fantastical mounts, Victorian elegance merged with impossible biology, steampunk creature design excellence, brass and leather aesthetic perfection, godlevel Victorian surreal artistry.",
      },
      "metamorphic-tea-party": {
        name: "🫖 Metamorphic Tea Party",
        description:
          "Surreal tea party where guests transform into teacups and saucers, Victorian ladies with porcelain skin patterns, gentlemen with steam rising from their heads like teapots, furniture that breathes and blinks, tablecloth flowing like liquid mercury, floating sugar cubes with tiny wings, spoons that swim through air like fish, Alice in Wonderland impossibility with photorealistic detail, metamorphic dining experience, surreal social gathering excellence, godlevel tea party surrealism.",
      },
      "clockwork-menagerie": {
        name: "⚙️ Clockwork Menagerie",
        description:
          "Magnificent clockwork menagerie with mechanical animals housing human souls, brass elephants with transparent bellies revealing Victorian passengers, clockwork birds with human faces singing opera, steam-powered carousel horses galloping through clouds, mechanical butterflies with stained glass wings, copper snails leaving trails of golden gears, wind-up creatures with emotional expressions, Victorian circus of impossible machines, steampunk animal artistry, mechanical soul integration, godlevel clockwork creature excellence.",
      },
      "floating-library-scholars": {
        name: "📚 Floating Library Scholars",
        description:
          "Ethereal floating library with scholar-birds perched on flying books, Victorian academics with feathered wings reading while soaring, books that open to reveal miniature worlds, floating ink wells that rain words, quill pens that write in the air with luminous text, scholarly owls wearing spectacles and bow ties, levitating desks with candles that never melt, knowledge made manifest as glowing particles, academic surrealism with literary magic, floating wisdom artistry, godlevel scholarly surrealism.",
      },
      "musical-anatomy": {
        name: "🎼 Musical Anatomy",
        description:
          "Surreal beings with musical instrument anatomy, violinists whose bodies are actual violins with human consciousness, piano players with keyboard ribcages and hammer hearts, conductors with baton fingers directing orchestras of hybrid creatures, musical notes floating as living butterflies, sound waves visible as colorful ribbons in air, concert halls grown from giant musical instruments, symphonic biology with harmonic perfection, musical creature design excellence, godlevel musical surrealism.",
      },
      "garden-of-impossible-delights": {
        name: "🌺 Garden of Impossible Delights",
        description:
          "Fantastical garden where flowers have human faces and trees bear fruit-children, Victorian gardeners tending to plants that sing lullabies, roses that bloom into tiny dancers, sunflowers with eyes that follow visitors, mushrooms that house miniature tea parties, vines that write poetry in the air, garden paths that lead to different seasons simultaneously, botanical impossibility with nurturing care, surreal horticulture excellence, godlevel garden surrealism.",
      },
      "time-merchant-bazaar": {
        name: "⏰ Time Merchant Bazaar",
        description:
          "Mystical bazaar where time merchants sell bottled moments, Victorian shopkeepers with clock faces for heads, customers browsing shelves of crystallized memories, hourglasses containing miniature life stories, pocket watches that show different timelines, temporal currency made of golden seconds, time-worn travelers with calendars for skin, chronological marketplace with temporal goods, time-trading artistry, godlevel temporal commerce surrealism.",
      },
      "dream-cartographers": {
        name: "🗺️ Dream Cartographers",
        description:
          "Ethereal dream cartographers mapping the geography of sleep, Victorian explorers with compass hearts and map-skin, territories that shift based on the dreamer's mood, rivers of liquid starlight flowing through nightmare valleys, mountains made of crystallized thoughts, dream creatures serving as native guides, cartographic tools that draw themselves, navigational instruments powered by imagination, oneiric exploration excellence, godlevel dream mapping artistry.",
      },
      "mechanical-heart-surgeons": {
        name: "💝 Mechanical Heart Surgeons",
        description:
          "Surreal Victorian surgeons operating on mechanical hearts with emotional gears, patients with clockwork cardiovascular systems, love letters used as surgical thread, romantic poetry flowing through brass arteries, heartbreak manifested as broken springs and gears, emotional repair with precision instruments, surgical theaters filled with floating rose petals, medical romanticism with steampunk precision, cardiac mechanical artistry, godlevel emotional surgery surrealism.",
      },
      "cloud-shepherds": {
        name: "☁️ Cloud Shepherds",
        description:
          "Mystical cloud shepherds herding weather patterns across Victorian skies, aerial farmers with wings made of condensed mist, sheep-clouds that rain when sheared, storm-dogs that bark thunder and lightning, weather-staff that conducts atmospheric symphonies, sky pastures with rainbow fences, meteorological husbandry with celestial grace, atmospheric creature management, weather-working artistry, godlevel cloud shepherd surrealism.",
      },
      "memory-archaeologists": {
        name: "🏺 Memory Archaeologists",
        description:
          "Victorian memory archaeologists excavating buried recollections, forgotten thoughts crystallized as amber fossils, memory layers revealed through careful excavation, archaeological tools that uncover emotional sediment, ancient memories preserved in temporal strata, consciousness dig sites with psychological artifacts, memory museums displaying excavated experiences, temporal archaeology with emotional precision, consciousness excavation artistry, godlevel memory archaeology surrealism.",
      },
      "shadow-puppet-masters": {
        name: "🎭 Shadow Puppet Masters",
        description:
          "Enigmatic shadow puppet masters whose shadows live independent lives, Victorian puppeteers with shadow-selves that rebel, shadow theaters where darkness tells its own stories, puppet strings made of moonbeams and starlight, shadows that cast people instead of being cast by them, umbral performances with light and darkness dancing, shadow consciousness with autonomous will, darkness artistry with luminous contrast, shadow rebellion excellence, godlevel shadow puppet surrealism.",
      },
      "emotion-alchemists": {
        name: "🧪 Emotion Alchemists",
        description:
          "Victorian emotion alchemists distilling feelings into magical elixirs, laboratory equipment that processes human emotions, love potions that literally glow with warmth, sadness condensed into blue crystalline tears, joy bubbling in golden beakers, anger burning as red flame in glass containers, emotional transmutation with alchemical precision, feeling-based chemistry with mystical results, emotional laboratory artistry, godlevel emotion alchemy surrealism.",
      },
      "animal-transport": {
        name: "🐌 Victorian Snail Carriage",
        description:
          "Magnificent Victorian gentleman in ornate top hat and brass goggles riding atop an enormous gastropod carriage, elaborate snail shell decorated with clockwork mechanisms and copper fittings, steam vents emerging from shell spirals, Victorian formal wear with mechanical pocket watch chains, sepia-toned dreamscape with floating butterflies and bare winter trees, snail leaving trail of golden gears and brass cogs, impossible transportation with whimsical elegance, steampunk mollusk mastery, Victorian creature transport excellence, godlevel surreal animal transport artistry.",
      },
    },
  },

  endangered: {
    name: "🦋 Endangered Spirits",
    scenarios: {
      "pure-mathematical": {
        name: "🔢 Pure Mathematical Extinction",
        description:
          "Mathematical visualization of species extinction with geometric population decline curves, fractal DNA degradation patterns, algorithmic biodiversity loss mapping, mathematical conservation equations, computational extinction modeling, geometric species visualization, mathematical ecosystem collapse, algorithmic population dynamics, digital conservation mastery, mathematical species excellence, geometric pattern complexity, computational extinction generation, mathematical visualization excellence, godlevel mathematical extinction artistry.",
      },
      "origami-world": {
        name: "📄 Origami Vanishing Species",
        description:
          "Delicate origami endangered animals crafted from translucent paper that slowly dissolves, paper-folded creatures becoming transparent as they fade away, intricate origami ecosystems with disappearing habitats, visible fold lines showing fragile construction, ethereal lighting making paper animals appear ghostly, masterful origami technique capturing the ephemeral nature of extinction, paper conservation message through dissolving art, traditional paper folding representing species memory, handcrafted paper sculptures of vanishing wildlife, artistic paper engineering of disappearing worlds, godlevel origami extinction excellence.",
      },
      "siberian-tiger-spirit": {
        name: "🐅 Siberian Tiger Spirit Guardian",
        description:
          "Mystical Siberian tiger spirit emerging from frozen taiga dreamscape, ethereal ice crystals forming around massive paws, ghostly orange and black stripes shimmering with aurora borealis energy, ancient forest spirits whispering through snow-laden pines, tiger's breath creating magical frost patterns in arctic air, spiritual guardian of the last wilderness sanctuaries, eyes glowing with primordial wisdom of vanished forests, mystical connection between earthly tiger and celestial protector, shamanic journey through Siberian spirit realm, frozen landscape transformed into ethereal sanctuary, godlevel mystical tiger excellence.",
      },
      "mountain-gorilla-sage": {
        name: "🦍 Mountain Gorilla Sage Council",
        description:
          "Ancient mountain gorilla sage conducting mystical council in cloud-shrouded volcanic peaks, silverback elder with wisdom-filled eyes surrounded by ethereal mist, gorilla families gathering in sacred bamboo groves where spirits dwell, traditional African ancestral ceremonies with gorilla shamans, mystical communication through forest spirit language, volcanic mountains transformed into spiritual sanctuaries, gorilla elders teaching ancient forest wisdom to human dreamers, ethereal bamboo forests with floating light orbs, spiritual bond between gorilla consciousness and mountain spirits, mystical African highland atmosphere, godlevel gorilla sage excellence.",
      },
      "vaquita-ocean-phantom": {
        name: "🐬 Vaquita Ocean Phantom",
        description:
          "Ethereal vaquita porpoise spirit gliding through underwater dreamscape of the Sea of Cortez, ghostly marine mammal with translucent fins creating bioluminescent trails, mystical underwater realm where last vaquitas commune with ocean spirits, ancient Aztec water deities protecting sacred porpoise souls, underwater aurora effects dancing around phantom vaquita pods, mystical connection between earthly ocean and celestial sea, spiritual guardians of marine sanctuaries, ethereal underwater landscape with floating light particles, shamanic journey through oceanic spirit realm, mystical Mexican waters transformed into ethereal sanctuary, godlevel ocean phantom excellence.",
      },
      "saola-forest-unicorn": {
        name: "🦄 Saola Forest Unicorn Mystery",
        description:
          "Legendary saola appearing as mystical forest unicorn in Vietnamese jungle dreamscape, ethereal antelope with horn-like projections glowing with inner light, ancient forest spirits manifesting through saola consciousness, mystical Vietnamese mountain forests where reality blends with legend, shamanic encounters with the Asian unicorn in spiritual realm, ethereal jungle atmosphere with floating light orbs and mystical fog, traditional Vietnamese forest mythology brought to life, spiritual guardian of the last untouched wilderness, mystical connection between earthly saola and celestial unicorn, ethereal Annamite mountain sanctuary, godlevel forest unicorn excellence.",
      },
      "javan-rhino-temple-guardian": {
        name: "🦏 Javan Rhino Temple Guardian",
        description:
          "Mystical Javan rhinoceros serving as ancient temple guardian in ethereal Indonesian jungle sanctuary, massive rhino spirit with horn glowing like sacred crystal, traditional Javanese temple ruins overgrown with mystical vegetation, rhino guardian protecting sacred forest temples from spiritual realm, ancient Indonesian mythology where rhinos commune with temple spirits, ethereal jungle atmosphere with floating temple lanterns, mystical connection between earthly rhino and divine temple protector, shamanic journey through Indonesian spirit realm, sacred temple grounds transformed into ethereal wildlife sanctuary, godlevel temple guardian excellence.",
      },
      "snow-leopard-mountain-spirit": {
        name: "❄️ Snow Leopard Mountain Spirit",
        description:
          "Ethereal snow leopard spirit leaping between Himalayan peaks in celestial mountain realm, ghostly spotted coat shimmering with starlight and snow crystals, mystical high-altitude sanctuary where snow leopards commune with mountain deities, ancient Tibetan spiritual traditions honoring leopard spirits, ethereal mountain landscape with floating prayer flags and mystical clouds, spiritual guardian of the highest peaks, mystical connection between earthly leopard and celestial mountain spirit, shamanic journey through Himalayan spirit realm, sacred mountains transformed into ethereal leopard sanctuary, godlevel mountain spirit excellence.",
      },
      "pangolin-armor-mystic": {
        name: "🛡️ Pangolin Armor Mystic",
        description:
          "Mystical pangolin unrolling from ethereal armor ball in African savanna dreamscape, scales glowing like ancient protective talismans, traditional African spiritual ceremonies honoring pangolin medicine, mystical connection between pangolin armor and spiritual protection, ethereal savanna landscape with floating acacia trees and mystical light, shamanic healing rituals where pangolin spirits teach protection magic, ancient African mythology brought to life through pangolin consciousness, spiritual guardian of traditional medicine wisdom, mystical transformation between earthly pangolin and celestial armor spirit, godlevel armor mystic excellence.",
      },
      "kakapo-night-parrot-oracle": {
        name: "🦜 Kakapo Night Parrot Oracle",
        description:
          "Mystical kakapo serving as nocturnal oracle in ethereal New Zealand forest dreamscape, flightless parrot with wisdom-filled eyes glowing in moonlight, ancient Maori spiritual traditions honoring kakapo as forest messenger, mystical communication through night parrot dream language, ethereal native forest with floating fern fronds and mystical mist, spiritual guardian of ancient forest wisdom, mystical connection between earthly kakapo and celestial night oracle, shamanic journey through New Zealand spirit realm, sacred forests transformed into ethereal parrot sanctuary, godlevel night oracle excellence.",
      },
      "amur-leopard-shadow-hunter": {
        name: "🌙 Amur Leopard Shadow Hunter",
        description:
          "Ethereal Amur leopard moving like living shadow through Russian taiga dreamscape, spotted coat blending with dappled moonlight and forest shadows, mystical Siberian forest where leopards hunt in spiritual realm, ancient Russian folklore honoring leopard as shadow spirit, ethereal taiga landscape with floating birch leaves and mystical aurora, spiritual guardian of the northern wilderness, mystical connection between earthly leopard and celestial shadow hunter, shamanic journey through Siberian spirit realm, sacred forests transformed into ethereal leopard hunting grounds, godlevel shadow hunter excellence.",
      },
      "hawksbill-turtle-ocean-sage": {
        name: "🐢 Hawksbill Turtle Ocean Sage",
        description:
          "Ancient hawksbill turtle sage swimming through ethereal coral reef dreamscape, shell patterns glowing with bioluminescent wisdom, mystical underwater realm where turtles commune with ocean spirits, traditional Pacific Islander ceremonies honoring turtle ancestors, ethereal coral gardens with floating light particles and mystical currents, spiritual guardian of marine wisdom, mystical connection between earthly turtle and celestial ocean sage, shamanic journey through oceanic spirit realm, sacred reefs transformed into ethereal turtle sanctuary, godlevel ocean sage excellence.",
      },
      "black-rhino-earth-shaman": {
        name: "🌍 Black Rhino Earth Shaman",
        description:
          "Mystical black rhinoceros serving as earth shaman in ethereal African savanna dreamscape, massive horn channeling earth energy and ancient wisdom, traditional African spiritual ceremonies honoring rhino as earth guardian, mystical connection between rhino consciousness and geological spirits, ethereal savanna landscape with floating baobab trees and mystical dust devils, spiritual guardian of earth's ancient power, mystical transformation between earthly rhino and celestial earth shaman, shamanic journey through African spirit realm, sacred grasslands transformed into ethereal rhino sanctuary, godlevel earth shaman excellence.",
      },
      "orangutan-forest-philosopher": {
        name: "🦧 Orangutan Forest Philosopher",
        description:
          "Wise orangutan sage contemplating existence in ethereal Bornean rainforest dreamscape, ancient eyes holding forest wisdom and mystical knowledge, traditional Dayak spiritual traditions honoring orangutan as forest teacher, mystical communication through primate consciousness and tree spirit language, ethereal jungle canopy with floating leaves and mystical light beams, spiritual guardian of rainforest philosophy, mystical connection between earthly orangutan and celestial forest philosopher, shamanic journey through Bornean spirit realm, sacred forests transformed into ethereal orangutan sanctuary, godlevel forest philosopher excellence.",
      },
      "cross-river-gorilla-river-spirit": {
        name: "🌊 Cross River Gorilla River Spirit",
        description:
          "Mystical Cross River gorilla emerging from ethereal river mists in Cameroon-Nigeria border dreamscape, silverback spirit with water droplets creating rainbow halos, ancient African river ceremonies honoring gorilla as water guardian, mystical connection between gorilla consciousness and river spirits, ethereal tropical forest with floating river mist and mystical waterfalls, spiritual guardian of sacred waterways, mystical transformation between earthly gorilla and celestial river spirit, shamanic journey through West African spirit realm, sacred rivers transformed into ethereal gorilla sanctuary, godlevel river spirit excellence.",
      },
      "animal-transport": {
        name: "🐘 Sumatran Elephant Spirit Caravan",
        description:
          "Mystical Sumatran elephant spirit carrying ancient Indonesian shaman through ethereal rainforest dreamscape, massive elephant with tusks glowing like sacred ivory, traditional Indonesian spiritual journey where elephants serve as vehicles between earthly and spirit realms, shamanic rider in traditional ceremonial clothing communing with elephant consciousness, ethereal jungle atmosphere with floating tropical flowers and mystical light, spiritual bond between human and elephant transcending physical reality, ancient Indonesian mythology where elephants transport souls through forest spirit realm, mystical caravan through sacred Sumatran wilderness, godlevel spiritual elephant transport excellence.",
      },
    },
  },
}

export function buildPrompt(params: PromptParams): string {
  const { dataset, scenario, colorScheme, customPrompt, panoramic360, panoramaFormat, projectionType } = params

  // If custom prompt is provided, use it directly
  if (customPrompt && customPrompt.trim()) {
    console.log("[v0] Using custom prompt, skipping scenario logic")
    return customPrompt.trim()
  }

  // Get the dataset
  const datasetObj = CULTURAL_DATASETS[dataset as keyof typeof CULTURAL_DATASETS]
  if (!datasetObj) {
    console.log("[v0] Dataset not found, using default")
    return "Beautiful artistic visualization with godlevel excellence"
  }

  // Get the scenario
  const scenarioObj = datasetObj.scenarios[scenario as keyof typeof datasetObj.scenarios]
  if (!scenarioObj) {
    console.log("[v0] Scenario not found, using first available")
    const firstScenario = Object.values(datasetObj.scenarios)[0]
    if (!firstScenario) {
      return "Beautiful artistic visualization with godlevel excellence"
    }
    return firstScenario.description
  }

  // Build the base prompt from scenario description
  let prompt = scenarioObj.description

  // Add color scheme
  const colorSchemeDesc = COLOR_SCHEMES[colorScheme as keyof typeof COLOR_SCHEMES]
  if (colorSchemeDesc) {
    prompt += `, ${colorSchemeDesc}`
  }

  // Add 360° panorama specifications
  if (panoramic360) {
    if (panoramaFormat === "equirectangular") {
      prompt +=
        ", 360-degree equirectangular panorama format, seamless horizontal wrapping, VR-optimized, immersive spherical projection"
    } else if (panoramaFormat === "stereographic") {
      prompt += ", 360-degree stereographic projection, fisheye perspective, immersive circular format"
    }
  }

  // Add dome projection specifications
  if (params.domeProjection) {
    if (projectionType === "fisheye") {
      prompt += ", dome projection fisheye format, planetarium-optimized, hemispherical display"
    } else if (projectionType === "tunnel-up") {
      prompt += ", dome projection tunnel-up format, upward perspective, immersive ceiling display"
    } else if (projectionType === "tunnel-down") {
      prompt += ", dome projection tunnel-down format, downward perspective, floor projection"
    } else if (projectionType === "little-planet") {
      prompt += ", dome projection little-planet format, spherical world perspective, miniature planet effect"
    }
  }

  return prompt
}

export function getScenarios(dataset: string) {
  const datasetObj = CULTURAL_DATASETS[dataset as keyof typeof CULTURAL_DATASETS]
  if (!datasetObj) {
    return {}
  }
  return datasetObj.scenarios
}
