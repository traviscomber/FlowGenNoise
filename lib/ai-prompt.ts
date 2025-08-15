// Enhanced AI Prompt Generation System with Godlevel Quality
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

// Cultural datasets with detailed scenarios - COMPLETE RESTORATION OF ALL DATASETS
export const CULTURAL_DATASETS = {
  vietnamese: {
    name: "🇻🇳 Vietnamese Heritage",
    scenarios: {
      "trung-sisters": {
        name: "⚔️ Hai Bà Trưng - Trung Sisters",
        description:
          "Legendary Vietnamese heroines Hai Bà Trưng (Trung Sisters), ancient warriors who led rebellion against Chinese rule in 40 AD, riding war elephants, traditional Vietnamese armor, heroic legends, national independence symbols, ancient Vietnamese military traditions, cultural heroes, patriotic spirit, historical valor, bronze weapons, traditional Vietnamese battle formations, ancient citadels, heroic sacrifice for freedom.",
      },
      "temple-of-literature": {
        name: "🏛️ Temple of Literature - First University",
        description:
          "Vietnam's first university (1070 AD), dedicated to Confucius and literature. Traditional Vietnamese architecture with ancient courtyards, red-tiled roofs, ornate gates, stone stelae of doctorate holders, peaceful gardens with lotus ponds, ancient trees, traditional lanterns, and scholarly atmosphere. Confucian educational heritage with traditional Vietnamese academic traditions.",
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
        name: "🌿 Dayak Culture",
        description:
          "Bornean Dayak indigenous culture, traditional longhouses, cultural ceremonies, traditional crafts, Indonesian tribal art, forest heritage, cultural traditions, river communities, traditional tattoos.",
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
        name: "🌺 Balinese Traditions",
        description:
          "Balinese Hindu culture, temple ceremonies, traditional dances, cultural festivals, Indonesian island heritage, spiritual traditions, artistic expressions, rice terraces, temple architecture.",
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
        name: "🏔️ Karen Hill Tribe",
        description:
          "Karen hill tribe people in traditional dress, mountainous landscape, traditional lifestyle, ethnic minority culture, handwoven textiles, traditional jewelry, cultural heritage of northern Thailand, long-neck traditions.",
      },
      hmong: {
        name: "🎭 Hmong Mountain People",
        description:
          "Hmong ethnic group in traditional colorful clothing, intricate embroidery, silver jewelry, mountain villages, traditional lifestyle, cultural ceremonies, northern Thailand heritage, traditional crafts.",
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
      "impossible-stairs": {
        name: "♾️ Impossible Staircases",
        description:
          "M.C. Escher inspired impossible staircases with paradoxical architecture, people walking up and down simultaneously, optical illusion with black and white geometric patterns, mind-bending perspective. Mathematical precision in impossible architectural structures with visual paradoxes.",
      },
      tessellations: {
        name: "🔷 Tessellation Patterns",
        description:
          "Intricate Escher-style tessellations with interlocking geometric shapes, mathematical precision, repeating patterns that transform seamlessly, artistic geometry with visual mathematics. Perfect tessellation symmetry with geometric precision and mathematical beauty.",
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
          "Mathematical spiral patterns with Fibonacci sequences, golden ratio spirals, logarithmic spirals, Archimedean spirals, hyperbolic spirals, mathematical precision, geometric beauty, natural spiral formations, mathematical elegance.",
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
  heads: {
    name: "👤 Heads & Portraits",
    scenarios: {
      "hyper-realism": {
        name: "📸 Hyper-Realistic Portraits",
        description:
          "Ultra-realistic human head portraits with photographic precision, every skin pore visible, natural lighting, professional photography quality, detailed facial features, realistic skin textures, natural expressions, museum-quality portrait art, lifelike human faces, anatomical accuracy, professional headshot photography, cinematic portrait lighting, award-winning portrait photography, hyperrealistic digital art mastery.",
      },
      "classical-realism": {
        name: "🎨 Classical Portrait Realism",
        description:
          "Classical realistic portrait painting style, traditional oil painting techniques, Renaissance-inspired portraiture, masterful brushwork, classical lighting, traditional portrait composition, academic realism, old master painting techniques, classical portrait art, traditional artistic methods, realistic human features, classical art mastery, museum-quality traditional portraits.",
      },
      "stylized-portraits": {
        name: "✨ Stylized Portrait Art",
        description:
          "Stylized portrait art with artistic interpretation, creative visual style, artistic portrait design, contemporary portrait art, modern artistic approach, creative portrait illustration, artistic head studies, stylized human features, contemporary art style, creative portrait composition, artistic interpretation of human faces, modern portrait artistry.",
      },
      "geometric-heads": {
        name: "🔷 Geometric Portrait Abstraction",
        description:
          "Geometric abstraction of human heads, angular facial features, cubist-inspired portraits, geometric portrait composition, abstract facial geometry, mathematical portrait art, geometric human forms, angular portrait design, abstract head studies, geometric facial interpretation, mathematical human representation, geometric portrait artistry.",
      },
      "surreal-portraits": {
        name: "🌀 Surreal Portrait Art",
        description:
          "Surreal portrait art with dreamlike qualities, fantastical human features, imaginative portrait design, surreal facial transformations, dreamlike portrait composition, fantastical head studies, surreal human interpretation, imaginative portrait artistry, dreamlike facial features, surreal portrait creativity, fantastical human art.",
      },
      "abstract-faces": {
        name: "🎭 Abstract Facial Art",
        description:
          "Abstract interpretation of human faces, non-representational portrait art, abstract facial forms, experimental portrait design, abstract human representation, conceptual face art, abstract portrait composition, experimental facial art, abstract head studies, conceptual portrait artistry, abstract human forms, experimental portrait creativity.",
      },
      "digital-portraits": {
        name: "💻 Digital Portrait Art",
        description:
          "Digital portrait art with modern techniques, contemporary digital artistry, computer-generated portraits, digital painting techniques, modern portrait technology, digital art mastery, contemporary portrait design, digital human representation, modern artistic methods, digital portrait innovation, contemporary digital creativity.",
      },
      "character-heads": {
        name: "🎪 Character Portrait Design",
        description:
          "Character portrait design with unique personalities, expressive character faces, personality-driven portraits, character art design, expressive human features, character development art, personality portrait studies, character design mastery, expressive portrait art, character-based human representation, personality-focused portrait artistry.",
      },
      "ethnic-diversity": {
        name: "🌍 Diverse Cultural Portraits",
        description:
          "Diverse cultural portrait representation, multicultural human faces, ethnic diversity in art, global portrait representation, cultural facial features, diverse human beauty, multicultural portrait art, global human representation, cultural portrait studies, diverse ethnic artistry, multicultural human art, global portrait diversity.",
      },
      "age-progression": {
        name: "⏳ Age Progression Studies",
        description:
          "Age progression portrait studies, human aging visualization, life stage portraits, temporal human representation, aging process art, generational portrait studies, time-based human art, age-related facial changes, temporal portrait progression, life cycle human representation, aging portrait artistry.",
      },
      "emotional-expressions": {
        name: "😊 Emotional Expression Studies",
        description:
          "Emotional expression portrait studies, human facial emotions, expressive portrait art, emotional human representation, facial expression mastery, emotional portrait design, human emotion visualization, expressive facial art, emotional character studies, human feeling representation, emotional portrait artistry.",
      },
      "fantasy-creatures": {
        name: "🧙 Fantasy Humanoid Portraits",
        description:
          "Fantasy humanoid portrait art, mythical creature faces, fantastical human-like beings, fantasy character portraits, mythological humanoid art, fantastical creature design, fantasy portrait creativity, mythical being representation, fantastical humanoid studies, fantasy character artistry, mythological portrait art.",
      },
      "cyberpunk-heads": {
        name: "🤖 Cyberpunk Portrait Art",
        description:
          "Cyberpunk portrait art with futuristic elements, sci-fi human representation, technological portrait design, futuristic human art, cybernetic portrait studies, sci-fi character faces, technological human enhancement, futuristic portrait artistry, cyberpunk human design, technological portrait creativity, sci-fi human visualization.",
      },
      "minimalist-portraits": {
        name: "⚪ Minimalist Portrait Design",
        description:
          "Minimalist portrait design with clean aesthetics, simple portrait composition, minimal human representation, clean portrait artistry, simplified facial features, minimal portrait creativity, clean human art, simplified portrait design, minimal artistic approach, clean portrait mastery, simplified human representation.",
      },
      "mega-freak": {
        name: "👹 Extreme Artistic Distortion",
        description:
          "Extreme artistic distortion of human features, highly stylized portrait art, dramatically exaggerated facial characteristics, avant-garde portrait design, experimental human representation, radical artistic interpretation, extreme portrait creativity, dramatically stylized human faces, avant-garde facial art, experimental portrait artistry, radical human visualization, extreme artistic expression.",
      },
    },
  },
  faces: {
    name: "😊 Faces & Expressions",
    scenarios: {
      "photorealistic-faces": {
        name: "📷 Photorealistic Facial Art",
        description:
          "Photorealistic facial art with incredible detail, lifelike human faces, photographic quality portraits, realistic facial features, natural skin textures, professional portrait photography, hyperrealistic face art, detailed human expressions, photographic portrait mastery, lifelike facial representation, realistic human beauty, photorealistic portrait excellence.",
      },
      "portrait-studies": {
        name: "🎨 Classical Portrait Studies",
        description:
          "Classical portrait studies with traditional techniques, academic facial art, classical drawing methods, traditional portrait mastery, academic human representation, classical artistic training, traditional facial studies, academic portrait excellence, classical human art, traditional artistic methods, academic portrait mastery.",
      },
      "expressive-faces": {
        name: "🎭 Expressive Facial Art",
        description:
          "Expressive facial art with emotional depth, dramatic human expressions, emotional portrait art, expressive human features, dramatic facial studies, emotional artistic representation, expressive portrait design, dramatic human emotion, emotional facial artistry, expressive human creativity, dramatic portrait excellence.",
      },
      "cultural-faces": {
        name: "🌏 Cultural Facial Heritage",
        description:
          "Cultural facial heritage representation, traditional human beauty, ethnic facial characteristics, cultural portrait art, heritage human representation, traditional facial features, cultural human diversity, ethnic portrait studies, heritage facial artistry, cultural human beauty, traditional portrait heritage.",
      },
      "artistic-interpretations": {
        name: "🖼️ Artistic Face Interpretations",
        description:
          "Artistic interpretations of human faces, creative facial art, artistic human representation, creative portrait design, artistic facial creativity, interpretive human art, creative face studies, artistic portrait innovation, creative human visualization, artistic facial mastery, interpretive portrait artistry.",
      },
      "contemporary-faces": {
        name: "🆕 Contemporary Facial Art",
        description:
          "Contemporary facial art with modern aesthetics, current artistic trends, modern human representation, contemporary portrait design, current facial artistry, modern artistic methods, contemporary human art, current portrait innovation, modern facial creativity, contemporary artistic excellence, current human visualization.",
      },
      "dramatic-lighting": {
        name: "💡 Dramatic Portrait Lighting",
        description:
          "Dramatic portrait lighting effects, cinematic facial illumination, professional portrait lighting, dramatic human representation, cinematic face art, professional lighting mastery, dramatic portrait artistry, cinematic human beauty, professional facial lighting, dramatic artistic illumination, cinematic portrait excellence.",
      },
      "micro-expressions": {
        name: "🔍 Micro-Expression Studies",
        description:
          "Micro-expression studies in facial art, subtle human emotions, detailed facial analysis, psychological portrait art, subtle expression mastery, detailed emotional representation, psychological human studies, subtle facial artistry, detailed emotion visualization, psychological portrait excellence, subtle human creativity.",
      },
      "face-morphology": {
        name: "🧬 Facial Morphology Studies",
        description:
          "Facial morphology studies with scientific accuracy, anatomical face art, structural human representation, morphological portrait studies, anatomical facial accuracy, structural human artistry, morphological face design, anatomical portrait mastery, structural facial creativity, morphological human excellence, anatomical artistic precision.",
      },
      "beauty-standards": {
        name: "💄 Beauty Standard Exploration",
        description:
          "Beauty standard exploration in facial art, diverse human beauty, cultural beauty representation, aesthetic facial studies, beauty diversity art, aesthetic human representation, beauty standard artistry, aesthetic portrait design, beauty cultural studies, aesthetic human creativity, beauty artistic excellence.",
      },
      "aging-faces": {
        name: "👴 Aging Process Visualization",
        description:
          "Aging process visualization in facial art, temporal human representation, life stage facial studies, aging portrait art, temporal face visualization, life cycle human art, aging facial artistry, temporal portrait design, life stage human creativity, aging artistic representation, temporal facial excellence.",
      },
      "gender-studies": {
        name: "⚧️ Gender Expression Studies",
        description:
          "Gender expression studies in facial art, diverse human representation, gender facial characteristics, inclusive portrait art, gender diversity studies, inclusive human artistry, gender expression creativity, diverse facial representation, inclusive portrait design, gender artistic exploration, diverse human excellence.",
      },
      "psychological-portraits": {
        name: "🧠 Psychological Portrait Art",
        description:
          "Psychological portrait art with emotional depth, mental state representation, psychological human studies, emotional facial art, mental health awareness art, psychological portrait design, emotional human representation, mental state visualization, psychological artistic expression, emotional portrait excellence, mental health artistry.",
      },
      "identity-exploration": {
        name: "🪪 Identity Exploration Art",
        description:
          "Identity exploration through facial art, personal human representation, identity portrait studies, self-expression facial art, personal identity visualization, individual human artistry, identity artistic exploration, personal portrait design, individual facial creativity, identity human excellence, personal artistic expression.",
      },
      "extreme-stylization": {
        name: "🎪 Extreme Facial Stylization",
        description:
          "Extreme facial stylization with radical artistic interpretation, highly stylized human features, avant-garde facial art, experimental human representation, radical portrait design, extreme artistic creativity, avant-garde human visualization, experimental facial artistry, radical human excellence, extreme portrait innovation, avant-garde facial mastery.",
      },
    },
  },
} as const

// Color schemes with professional descriptions - EXPORTED
export const COLOR_SCHEMES = {
  plasma: "vibrant plasma colors with electric blues, magentas, and cyans",
  quantum: "quantum field colors with particle physics inspired hues",
  cosmic: "cosmic nebula colors with deep purples, blues, and stellar whites",
  thermal: "thermal imaging colors from cool blues to hot reds and whites",
  spectral: "full electromagnetic spectrum from infrared to ultraviolet",
  crystalline: "crystal formation colors with prismatic refractions",
  bioluminescent: "bioluminescent colors like deep sea creatures",
  aurora: "aurora borealis colors with greens, purples, and blues",
  metallic: "metallic colors with gold, silver, copper, and bronze",
  prismatic: "prismatic light dispersion with rainbow spectrums",
  monochromatic: "single hue variations from light to dark",
  infrared: "infrared heat signature colors",
  lava: "volcanic lava colors with reds, oranges, and blacks",
  futuristic: "futuristic neon colors with electric accents",
  forest: "forest colors with greens, browns, and earth tones",
  ocean: "ocean depths colors with blues, teals, and aquas",
  sunset: "sunset colors with oranges, pinks, and purples",
  arctic: "arctic colors with whites, blues, and ice tones",
  neon: "bright neon colors with electric intensity",
  vintage: "vintage sepia and aged colors",
  toxic: "toxic waste colors with sickly greens and yellows",
  ember: "glowing ember colors with reds and oranges",
  lunar: "lunar surface colors with grays and whites",
  tidal: "tidal pool colors with blues, greens, and sandy tones",
} as const

// Build comprehensive prompt for AI generation with GODLEVEL quality - OPTIMIZED FOR 4000 CHAR LIMIT
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

    let basePrompt = "GODLEVEL MASTERPIECE: "
    let scenarioDescription = ""

    // Get scenario description based on dataset
    if (
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
        basePrompt += `Mathematical visualization of ${params.dataset} patterns, `
      }
    }

    // Add color scheme with enhanced descriptions
    const colorDescription = COLOR_SCHEMES[params.colorScheme as keyof typeof COLOR_SCHEMES] || "vibrant colors"
    basePrompt += `rendered in ${colorDescription} with professional color grading, `

    // Add technical parameters - OPTIMIZED FOR SPACE
    basePrompt += `${params.numSamples || 4000} data points, noise scale ${params.noiseScale || 0.08}, seed ${params.seed || 1234}, `

    // Add godlevel quality descriptors - CONDENSED
    basePrompt +=
      "museum-grade professional quality, award-winning composition, ultra-high definition, cinematic lighting, breathtaking visual impact, "

    // Add 360° specific instructions if needed - CRITICAL SEAMLESS WRAPPING
    if (params.panoramic360 && params.panoramaFormat === "equirectangular") {
      basePrompt +=
        "CRITICAL 360° SEAMLESS WRAPPING: LEFT EDGE must connect PERFECTLY with RIGHT EDGE - zero visible seam, continuous circular environment, professional cylindrical projection, VR-optimized seamless wraparound, "
    } else if (params.panoramic360 && params.panoramaFormat === "stereographic") {
      basePrompt +=
        "STEREOGRAPHIC 360°: perfect circular fisheye distortion, entire 360° view in circular frame, center focus with radial distortion, "
    }

    // Add final quality tags - CONDENSED
    basePrompt +=
      "8K HDR, photorealistic detail, award-winning digital art, museum exhibition quality, godlevel artistic excellence, professional broadcast standard"

    // Ensure we stay within reasonable limits while preserving critical information
    if (basePrompt.length > 1800) {
      // Intelligently truncate while preserving key elements
      const criticalPhrases = [
        "LEFT EDGE must connect PERFECTLY with RIGHT EDGE",
        "seamless",
        "godlevel",
        "museum-grade",
        "professional",
      ]

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
        truncated += ", CRITICAL: LEFT EDGE must connect PERFECTLY with RIGHT EDGE - zero seam"
      }

      basePrompt = truncated
    }

    return basePrompt
  } catch (error) {
    console.error("Error building prompt:", error)
    // Return a safe fallback with godlevel quality
    return "GODLEVEL MASTERPIECE: Beautiful mathematical art with cosmic colors, museum-grade professional quality, ultra-high detail, award-winning composition, 8K HDR, photorealistic excellence, premium digital art"
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
