interface PromptParams {
  dataset: string
  scenario?: string
  colorScheme: string
  customPrompt?: string
}

export function buildPrompt(
  dataset: string,
  scenario?: string,
  colorScheme = "metallic",
  customPrompt?: string,
): string {
  if (customPrompt?.trim()) {
    return customPrompt.trim()
  }

  // Base mathematical flow dynamics
  let basePrompt = "Create a stunning mathematical visualization featuring dynamic flow patterns, "

  // Dataset-specific content
  if (dataset === "indonesian" && scenario) {
    basePrompt += getIndonesianScenarioPrompt(scenario)
  } else if (dataset === "thailand" && scenario) {
    basePrompt += getThailandScenarioPrompt(scenario)
  } else if (dataset === "vietnamese" && scenario) {
    basePrompt += getVietnameseScenarioPrompt(scenario)
  } else {
    basePrompt += getDatasetPrompt(dataset)
  }

  // Color scheme enhancement
  basePrompt += ` Rendered in ${getColorSchemeDescription(colorScheme)} color palette with rich gradients and luminous effects.`

  // Technical specifications for high quality
  basePrompt +=
    " Ultra-high resolution, photorealistic rendering, dramatic lighting, intricate mathematical patterns, flowing organic curves, mesmerizing visual complexity."

  return basePrompt
}

function getIndonesianScenarioPrompt(scenario: string): string {
  const scenarios: Record<string, string> = {
    pure: "pure mathematical flow dynamics with abstract geometric patterns, ",
    garuda:
      "the majestic Garuda Wisnu Kencana monument rising through swirling mathematical currents, golden wings spread wide against flowing parametric equations, divine Indonesian mythology merged with computational beauty, ",
    wayang:
      "traditional Wayang Kulit shadow puppets dancing through mathematical flow fields, intricate leather cutouts casting dynamic shadows, Javanese storytelling through algorithmic art, ",
    batik:
      "traditional Indonesian Batik patterns flowing like liquid mathematics, intricate geometric motifs swirling in organic currents, wax-resist dyeing techniques translated into digital flow dynamics, ",
    borobudur:
      "the ancient Borobudur temple emerging from mathematical flow patterns, Buddhist stupas and relief carvings integrated with parametric equations, spiritual geometry in motion, ",
    javanese:
      "Javanese cultural elements flowing through mathematical currents, gamelan instruments, traditional architecture, and royal court aesthetics merged with computational art, ",
    sundanese:
      "Sundanese highland culture flowing through mathematical patterns, traditional houses, rice terraces, and mountain landscapes integrated with algorithmic beauty, ",
    batak:
      "Batak traditional architecture and cultural symbols flowing through mathematical currents, Lake Toba landscapes, traditional houses, and tribal patterns in dynamic motion, ",
    dayak:
      "Dayak Borneo culture flowing through mathematical patterns, traditional longhouses, tribal art, and rainforest elements merged with computational dynamics, ",
    acehnese:
      "Acehnese Islamic culture flowing through mathematical currents, traditional mosques, calligraphy, and Sufi mysticism integrated with algorithmic art, ",
    minangkabau:
      "Minangkabau traditional architecture flowing through mathematical patterns, distinctive curved roofs, matrilineal culture, and Padang highlands in dynamic motion, ",
    "balinese-tribe":
      "Balinese Hindu culture flowing through mathematical currents, temple architecture, traditional ceremonies, and spiritual symbolism merged with computational beauty, ",
    papuans:
      "Papuan tribal culture flowing through mathematical patterns, traditional art, bird of paradise motifs, and highland landscapes integrated with algorithmic dynamics, ",
    baduy:
      "Baduy indigenous culture flowing through mathematical currents, traditional villages, sustainable living, and ancestral wisdom merged with computational art, ",
    "orang-rimba":
      "Orang Rimba forest culture flowing through mathematical patterns, jungle life, traditional knowledge, and harmony with nature in dynamic motion, ",
    "hongana-manyawa":
      "Hongana Manyawa tribal culture flowing through mathematical currents, Halmahera island life, traditional practices, and indigenous wisdom integrated with algorithmic beauty, ",
    asmat:
      "Asmat tribal art flowing through mathematical patterns, traditional wood carvings, ancestor worship, and Papua cultural heritage in dynamic motion, ",
    komodo:
      "Komodo dragon legends flowing through mathematical currents, ancient reptilian forms, Flores island landscapes, and mythical creatures merged with computational dynamics, ",
    dance:
      "traditional Indonesian dance flowing through mathematical patterns, graceful movements, cultural storytelling, and rhythmic motion integrated with algorithmic art, ",
    volcanoes:
      "Indonesian Ring of Fire flowing through mathematical currents, volcanic landscapes, lava flows, and geological forces merged with computational beauty, ",
    temples:
      "sacred Indonesian temples flowing through mathematical patterns, ancient architecture, spiritual geometry, and religious symbolism in dynamic motion, ",
  }
  return scenarios[scenario] || scenarios.pure
}

function getThailandScenarioPrompt(scenario: string): string {
  const scenarios: Record<string, string> = {
    pure: "pure mathematical flow dynamics with abstract geometric patterns, ",
    garuda:
      "the divine Garuda soaring through celestial mathematical currents, massive golden wings spanning the dome of heaven, mythical bird-deity emerging from swirling parametric equations, Thai Buddhist cosmology merged with computational beauty, DOME IMMERSION with the majestic creature filling the entire spherical view, ",
    naga: "colossal Naga serpent-dragon coiling through underwater temple ruins, massive scaled body undulating through mathematical flow fields, ancient Thai mythology of the water serpent merged with algorithmic art, DOME PROJECTION showing the creature's immense form wrapping around the viewer, ",
    erawan:
      "the three-headed white elephant Erawan floating through cloud kingdoms, divine mount of Indra moving through celestial mathematical patterns, Thai Hindu-Buddhist mythology integrated with computational dynamics, DOME EXPERIENCE with the sacred elephant majestically positioned overhead, ",
    karen:
      "Karen hill tribe village life flowing through misty mountain mathematical currents, traditional silver jewelry glinting in algorithmic light, bamboo houses and terraced fields merged with computational beauty, DOME IMMERSION in the highland mist and cultural traditions, ",
    hmong:
      "Hmong New Year celebrations flowing through mathematical patterns, elaborate traditional costumes swirling in algorithmic motion, shamanic rituals and mountain culture integrated with computational art, DOME PROJECTION of the vibrant festival filling the spherical view, ",
    ayutthaya:
      "ancient Ayutthaya historical park flowing through mathematical currents, towering prangs and temple ruins reaching toward the dome zenith, UNESCO World Heritage architecture merged with algorithmic beauty, DOME EXPERIENCE with ancient spires surrounding the viewer, ",
    sukhothai:
      "Sukhothai dawn kingdom flowing through mathematical patterns, walking Buddha statues moving through algorithmic light, birthplace of Thai civilization integrated with computational dynamics, DOME IMMERSION in the golden age of Thai culture, ",
    songkran:
      "Songkran water festival flowing through mathematical currents, rainbow spray effects filling the dome space, traditional Thai New Year celebrations merged with algorithmic beauty, DOME PROJECTION with water and joy surrounding the viewer in 360 degrees, ",
    "loy-krathong":
      "Loy Krathong floating lights ceremony flowing through mathematical patterns, thousands of candlelit krathongs drifting on algorithmic water, full moon festival integrated with computational art, DOME EXPERIENCE with floating lights creating a magical celestial canopy, ",
    coronation:
      "Royal Thai coronation ceremony flowing through mathematical currents, elaborate golden regalia and throne room splendor merged with algorithmic beauty, ancient royal traditions integrated with computational dynamics, DOME IMMERSION in the majesty of Thai royalty, ",
    "wat-pho":
      "Wat Pho temple flowing through mathematical patterns, the colossal 46-meter golden reclining Buddha statue filling the entire dome view with exquisite detail, serene peaceful facial expression with half-closed eyes in meditation, perfectly proportioned body draped in golden robes with intricate folds and textures, massive head resting on ornate pillow with detailed carved patterns, the famous mother-of-pearl inlay work on the soles of the feet showing 108 auspicious symbols including lotus flowers, stupas, and sacred geometry, golden surface reflecting light with realistic metallic sheen and patina, individual fingers delicately positioned, traditional Thai artistic styling with authentic proportions, surrounded by traditional Thai temple architecture with ornate pillars and decorative elements, DOME PROJECTION with the sacred Buddha's magnificent form positioned majestically overhead in photorealistic detail, ",
    "wat-arun":
      "Wat Arun Temple of Dawn flowing through mathematical currents, towering central prang reaching toward the dome zenith at sunrise, Khmer-style architecture integrated with algorithmic beauty, DOME EXPERIENCE with the temple spire piercing the celestial sphere, ",
    "muay-thai":
      "ancient Muay Thai martial arts flowing through mathematical patterns, traditional training rituals and sacred mongkol headbands merged with computational dynamics, Thai boxing culture integrated with algorithmic art, DOME IMMERSION in the warrior traditions, ",
    "classical-dance":
      "Thai classical dance flowing through mathematical currents, elaborate costumes and graceful movements swirling in algorithmic motion, court dance traditions merged with computational beauty, DOME PROJECTION with dancers filling the spherical performance space, ",
    "golden-triangle":
      "Golden Triangle Mekong confluence flowing through mathematical patterns, three countries meeting in algorithmic harmony, river landscapes and cultural diversity integrated with computational art, DOME EXPERIENCE with the mighty Mekong surrounding the viewer, ",
    "floating-markets":
      "traditional Thai floating markets flowing through mathematical currents, vendors in boats navigating algorithmic canals, authentic Thai canal life merged with computational dynamics, DOME IMMERSION in the bustling waterway commerce and culture, ",
  }
  return scenarios[scenario] || scenarios.pure
}

function getVietnameseScenarioPrompt(scenario: string): string {
  const scenarios: Record<string, string> = {
    pure: "pure mathematical flow dynamics with abstract geometric patterns, ",

    // Ancient Temples & Spiritual Sites - ULTRA GOD LEVEL DETAIL
    "temple-of-literature":
      "DOME IMMERSION: Van Mieu Temple of Literature flowing through sacred mathematical currents, Vietnam's first university established 1070 AD with magnificent traditional Vietnamese Confucian architecture filling the entire dome sphere, massive traditional curved rooflines with intricate hand-carved dragon motifs and phoenix sculptures reaching majestically across the dome ceiling in photorealistic detail, vermillion red lacquered pillars with golden Vietnamese calligraphy inscriptions glowing with algorithmic light, ancient stone stelae of 82 doctoral graduates mounted on sacred turtle backs (Bia Rua) positioned around the dome perimeter with authentic historical inscriptions, traditional Vietnamese courtyard gardens with pristine lotus ponds reflecting mathematical light patterns, ancient banyan trees with massive sprawling root systems creating natural fractal formations, scholars in traditional white ao dai robes with black silk headbands studying ancient Confucian texts under algorithmic sunlight, traditional Vietnamese incense burners with spiraling smoke creating complex fluid dynamics, authentic Vietnamese architectural elements including upturned eaves, ceramic roof tiles, and wooden lattice screens, traditional Vietnamese scholarly instruments including ink stones, bamboo brushes, and silk scrolls, morning mist rising through the temple courtyards in ethereal mathematical patterns, traditional Vietnamese temple bells creating sound visualization across the dome, DOME PROJECTION with the sacred temple complex's scholarly atmosphere enveloping the viewer in 360-degree educational serenity and ancient wisdom, ",

    "jade-emperor-pagoda":
      "DOME IMMERSION: Jade Emperor Pagoda (Chua Ngoc Hoang) flowing through mystical Taoist mathematical patterns, ancient temple built 1909 filled with supernatural incense smoke creating ethereal algorithmic clouds across the entire dome ceiling, intricate hand-carved wooden dragons and phoenixes with photorealistic scales and feathers, statues of Taoist deities including the Jade Emperor himself positioned majestically around the spherical view with authentic Vietnamese religious artistry, traditional Vietnamese lacquerware altars with mother-of-pearl inlay work glowing with algorithmic light, burning joss sticks creating spiraling smoke fractals in complex fluid dynamics, sacred turtle pond with ancient turtles swimming in mathematical harmony while devotees pray, massive ancient banyan tree roots penetrating the temple structure in organic mathematical curves, traditional Vietnamese red lanterns casting warm algorithmic shadows, statues of Buddhist bodhisattvas and Taoist immortals with intricate robes and serene expressions, traditional Vietnamese incense coils hanging from the ceiling creating geometric patterns, devotees in traditional Vietnamese clothing offering prayers and burning incense, traditional Vietnamese temple architecture with curved rooflines and ceramic decorations, DOME PROJECTION with the pagoda's mystical supernatural atmosphere enveloping the viewer in spiritual 360-degree immersion, ",

    // Imperial Heritage - Hue Dynasty ULTRA DETAILED
    "imperial-city-hue":
      "DOME IMMERSION: Imperial City of Hue (Dai Noi) flowing through royal mathematical currents, UNESCO World Heritage Nguyen Dynasty palace complex (1802-1945) with magnificent traditional Vietnamese imperial architecture filling the dome, the Forbidden Purple City (Tu Cam Thanh) with ornate dragon-decorated rooflines extending majestically across the dome ceiling, traditional Vietnamese imperial colors of gold and vermillion in algorithmic splendor with authentic historical accuracy, intricate ceramic tile work featuring phoenix and dragon motifs with photorealistic detail, royal throne halls including the Thai Hoa Palace with elaborate carved wooden screens and golden decorations, traditional Vietnamese court gardens with geometric lotus ponds and ancient bonsai trees, imperial guards in traditional Nguyen Dynasty uniforms with detailed embroidery and ceremonial weapons, the Perfume River (Song Huong) flowing through the scene in mathematical curves with traditional dragon boats, ancient citadel walls with traditional Vietnamese fortification design and cannon emplacements, traditional Vietnamese imperial ceremonies with court officials in silk robes, royal palanquins with intricate carvings and silk curtains, traditional Vietnamese court music with ancient instruments, morning mist rising from the Perfume River creating ethereal atmospheric effects, DOME PROJECTION with the imperial grandeur of Vietnamese royalty surrounding the viewer in majestic 360-degree historical splendor, ",

    "tomb-of-khai-dinh":
      "DOME IMMERSION: Tomb of Emperor Khai Dinh (Lang Khai Dinh) flowing through architectural mathematical patterns, fusion of Vietnamese and European styles (completed 1931) in algorithmic harmony across the dome, intricate mosaic work with thousands of ceramic and glass pieces creating complex geometric patterns covering the dome surface, elaborate dragon and phoenix motifs in traditional Vietnamese imperial art with photorealistic scales and feathers, ornate French colonial architectural elements merged seamlessly with Vietnamese design, detailed stone carvings with mathematical precision including lotus flowers and imperial symbols, traditional Vietnamese imperial tomb architecture with multiple ascending levels toward the dome zenith, colorful ceramic decorations reflecting light in prismatic algorithmic effects, the emperor's bronze statue with authentic historical detail, traditional Vietnamese imperial symbolism integrated with computational beauty, elaborate stairways with dragon balustrades, traditional Vietnamese guardian statues with fierce expressions, morning sunlight creating dramatic shadows and highlights, DOME PROJECTION with the tomb's magnificent fusion architecture enveloping the viewer in imperial 360-degree grandeur, ",

    // Traditional Villages & Rural Life MEGA DETAILED
    "sapa-terraces":
      "DOME IMMERSION: Sapa rice terraces flowing through mountainous mathematical currents, spectacular stepped agricultural landscapes carved into misty Hoang Lien Son mountain slopes extending across the entire dome view, Hmong and Red Dao ethnic minority villages with traditional wooden stilt houses positioned around the dome perimeter, morning mist rising through the terraces in complex fluid dynamics creating ethereal atmospheric effects, traditional Vietnamese conical hats (non la) worn by farmers working in the flooded fields with water buffalo, traditional ethnic minority textiles with intricate geometric patterns including indigo-dyed hemp and silver jewelry, mountain peaks including Fansipan (3,143m) shrouded in clouds creating natural mathematical formations, traditional Vietnamese highland agriculture with ancient irrigation systems, ethnic minority women in traditional colorful clothing harvesting rice, traditional Vietnamese mountain villages with wooden houses on stilts, terraced fields reflecting the sky in mathematical mirror patterns, traditional Vietnamese farming tools including wooden plows and bamboo baskets, morning sunrise creating golden algorithmic light effects across the terraces, traditional Vietnamese highland culture with ethnic festivals and ceremonies, DOME PROJECTION with the breathtaking terraced landscape surrounding the viewer in 360-degree mountain agricultural serenity, ",

    "mekong-delta":
      "DOME IMMERSION: Mekong Delta flowing through aquatic mathematical currents, vast network of rivers and canals creating complex algorithmic waterways across the dome surface, traditional Vietnamese sampan boats with curved bamboo covers navigating the mathematical flow fields, floating markets with vendors selling tropical fruits including dragon fruit, rambutan, and durian from traditional boats, traditional Vietnamese stilt houses on the riverbanks with corrugated metal roofs and wooden structures, coconut palms swaying in algorithmic wind patterns with realistic frond movement, traditional Vietnamese fishing nets and bamboo fish traps creating geometric patterns in the muddy water, rice paddies flooded with water reflecting the dome sky in mirror-like mathematical patterns, traditional Vietnamese river life with families cooking and living on boats, traditional Vietnamese fishing techniques with cormorant birds, water hyacinth and lotus flowers floating in algorithmic patterns, traditional Vietnamese delta architecture adapted to flooding, morning mist rising from the water creating ethereal atmospheric effects, DOME PROJECTION with the delta's intricate waterway system enveloping the viewer in aquatic 360-degree immersion, ",

    // Cultural Festivals & Traditions ULTRA IMMERSIVE
    "tet-celebration":
      "DOME IMMERSION: Tet Lunar New Year celebration flowing through festive mathematical patterns, traditional Vietnamese New Year festivities filling the entire dome space with joy and vibrant colors, elaborate peach blossom trees (hoa dao) and kumquat trees (cay quat) with algorithmic floral patterns and realistic petals, traditional Vietnamese ao dai dresses in silk with intricate embroidery swirling through the dome in mathematical harmony, dragon and lion dances with photorealistic costume details including scales, fur, and flowing fabric moving in complex choreographed patterns, traditional Vietnamese calligraphy banners with golden characters including 'Phuc' (luck) and 'Tho' (longevity), red envelopes (li xi) floating through the air in algorithmic motion with traditional Vietnamese decorative patterns, traditional Vietnamese New Year foods including banh chung (square sticky rice cake) and mut (candied fruits), fireworks exploding in complex mathematical patterns across the dome ceiling with realistic light effects, family gatherings with multiple generations in traditional Vietnamese clothing, traditional Vietnamese Tet decorations including parallel sentences (cau doi) and apricot blossoms, traditional Vietnamese New Year customs including ancestor worship and temple visits, children playing traditional Vietnamese games, DOME PROJECTION with the Tet celebration's joyous atmosphere surrounding the viewer in 360-degree festive cultural immersion, ",

    "mid-autumn-festival":
      "DOME IMMERSION: Mid-Autumn Festival (Tet Trung Thu) flowing through lunar mathematical patterns, traditional Vietnamese children's festival with colorful lanterns in algorithmic processions across the dome, elaborate traditional Vietnamese lanterns in shapes of fish, dragons, stars, and lotus flowers creating geometric light patterns, mooncakes with intricate designs featuring traditional Vietnamese symbols including lotus flowers and Chinese characters, traditional Vietnamese folk dances with performers in colorful silk costumes with flowing sleeves, full moon illuminating the dome ceiling with ethereal algorithmic silver light, traditional Vietnamese musical instruments including dan bau (monochord) and trong com (rice drum) creating sound visualization patterns, children in traditional Vietnamese clothing playing traditional games including den ong sao (star-shaped lanterns), lion dances with detailed costume work moving through mathematical formations, traditional Vietnamese Mid-Autumn stories including Chang'e and the Moon Palace, traditional Vietnamese mooncake making with wooden molds, families gathering in courtyards under the full moon, traditional Vietnamese lantern parades through ancient streets, DOME PROJECTION with the festival's magical lunar atmosphere enveloping the viewer in childhood wonder and cultural celebration, ",

    // Traditional Arts & Crafts MASTER LEVEL DETAIL
    "water-puppetry":
      "DOME IMMERSION: Vietnamese water puppetry (Mua Roi Nuoc) flowing through aquatic mathematical currents, traditional wooden puppets dancing on water surfaces with intricate hand-carved details and colorful lacquer work, puppet masters hidden behind bamboo screens manipulating the figures with mathematical precision using underwater rods, traditional Vietnamese folk tales including 'The Legend of the Restored Sword' coming to life through algorithmic puppet movements, water splashing in complex fluid dynamics as puppets move creating realistic spray patterns, traditional Vietnamese musical accompaniment with drums, gongs, wooden fish, and dan bau creating sound visualization patterns across the dome, elaborate puppet stage with traditional Vietnamese architectural elements including curved rooflines and red lacquer, rice paddy settings with water buffalo and farmers as puppet characters, traditional Vietnamese village scenes with markets and festivals, dragon puppets breathing fire effects, phoenix puppets with flowing feathers, traditional Vietnamese fishing scenes with nets and boats, puppet battles with traditional Vietnamese weapons, DOME PROJECTION with the water puppet theater surrounding the viewer in immersive cultural performance with splashing water effects, ",

    "lacquerware-craft":
      "DOME IMMERSION: Vietnamese lacquerware craftsmanship flowing through artistic mathematical patterns, master artisans applying multiple layers of traditional Vietnamese lacquer (son ta) with mathematical precision, intricate mother-of-pearl inlay work (kham oc) creating complex geometric designs across the dome surface, traditional Vietnamese motifs including dragons, phoenixes, lotus flowers, and bamboo rendered in exquisite photorealistic detail, eggshell lacquer technique creating delicate crackled patterns with authentic texture, traditional Vietnamese lacquer colors of deep black, vermillion red, and golden yellow in algorithmic harmony, bamboo and wood base materials being transformed through traditional techniques passed down through generations, traditional Vietnamese workshop settings with artisans in traditional clothing using ancient tools, traditional Vietnamese lacquer trees (cay son) with sap collection, traditional Vietnamese decorative objects including jewelry boxes, vases, and screens, traditional Vietnamese lacquer painting techniques with fine brushwork, traditional Vietnamese patterns including geometric designs and nature motifs, DOME PROJECTION with the lacquerware creation process enveloping the viewer in artistic immersion and traditional craftsmanship, ",

    // Historical Battles & Heroes EPIC SCALE
    "bach-dang-victory":
      "DOME IMMERSION: Bach Dang River victory (938 AD) flowing through historical mathematical currents, legendary Vietnamese naval battle against Chinese Southern Han invasion with traditional Vietnamese war junks positioned strategically across the dome, General Ngo Quyen's brilliant tactical use of iron-tipped stakes hidden in the river creating geometric defensive patterns, traditional Vietnamese naval warfare with detailed historical accuracy including traditional weapons and armor, Chinese invasion fleets being defeated through mathematical strategic planning with realistic battle scenes, traditional Vietnamese military uniforms and weapons including crossbows, spears, and traditional swords with authentic historical detail, the Bach Dang River delta landscape with traditional Vietnamese villages and fishing boats, heroic Vietnamese defenders in traditional armor with detailed metalwork, traditional Vietnamese war drums and battle flags, traditional Vietnamese naval tactics including fire ships and ramming, victory celebrations with traditional Vietnamese ceremonies, traditional Vietnamese historical monuments commemorating the victory, DOME PROJECTION with the historic naval victory surrounding the viewer in patriotic 360-degree immersion and national pride, ",

    "trung-sisters-rebellion":
      "DOME IMMERSION: Trung Sisters rebellion (40-43 AD) flowing through heroic mathematical patterns, legendary Vietnamese female warriors Trung Trac and Trung Nhi leading the resistance against Chinese Han occupation, traditional Vietnamese war elephants with ornate decorations and armor moving through algorithmic battle formations, ancient Vietnamese citadels and fortifications with traditional architectural details and defensive walls, traditional Vietnamese weapons and military equipment with historical accuracy including bronze spears and crossbows, Vietnamese people in traditional Han-era clothing supporting the rebellion with detailed period costumes, traditional Vietnamese landscapes with rivers, mountains, and ancient forests, heroic statues and monuments commemorating the sisters with traditional Vietnamese sculptural style, traditional Vietnamese female warriors in armor with authentic historical detail, ancient Vietnamese battle tactics and formations, traditional Vietnamese victory celebrations and ceremonies, traditional Vietnamese historical sites associated with the rebellion, DOME PROJECTION with the rebellion's epic scope enveloping the viewer in historical grandeur and female empowerment, ",

    // Natural Wonders & Landscapes BREATHTAKING DETAIL
    "halong-bay":
      "DOME IMMERSION: Ha Long Bay flowing through maritime mathematical currents, 1,600 limestone karst towers rising from emerald waters in complex geological formations across the dome, traditional Vietnamese junk boats with distinctive red sails and wooden hulls navigating through the algorithmic seascape, hidden caves and grottoes including Sung Sot Cave with stalactites and stalagmites creating natural mathematical patterns, traditional Vietnamese fishing villages floating on the water with houses on stilts, morning mist creating ethereal atmospheric effects with realistic fog patterns, traditional Vietnamese fishing techniques with cormorant birds and traditional nets, UNESCO World Heritage landscape with pristine natural beauty and biodiversity, traditional Vietnamese legends including the dragon creating the bay, limestone formations with names like Fighting Cock Islet and Stone Dog, traditional Vietnamese seafood including fresh fish, crab, and squid, traditional Vietnamese boat life with families living on junks, emerald green water with realistic wave patterns and reflections, DOME PROJECTION with the bay's magnificent karst landscape surrounding the viewer in 360-degree natural wonder and maritime beauty, ",

    "phong-nha-caves":
      "DOME IMMERSION: Phong Nha-Ke Bang caves flowing through subterranean mathematical currents, massive limestone cave systems with cathedral-like chambers extending across the dome ceiling, spectacular stalactite and stalagmite formations creating natural algorithmic sculptures with realistic mineral textures, underground rivers flowing through mathematical cave networks with crystal-clear water, traditional Vietnamese cave exploration with local guides using traditional bamboo boats, bioluminescent cave formations glowing with natural algorithmic light effects, traditional Vietnamese karst landscape above ground with dense tropical jungle vegetation, UNESCO World Heritage geological formations with millions of years of natural mathematical processes, traditional Vietnamese cave temples and shrines with Buddhist statues, traditional Vietnamese legends about cave spirits and dragons, massive cave chambers including the world's largest cave passage, traditional Vietnamese speleology with ancient exploration techniques, underground waterfalls and pools with realistic water effects, DOME PROJECTION with the cave system's magnificent underground architecture enveloping the viewer in subterranean wonder, ",

    // Traditional Cuisine & Markets SENSORY IMMERSION
    "floating-market-mekong":
      "DOME IMMERSION: Mekong floating market flowing through commercial mathematical currents, traditional Vietnamese river commerce with hundreds of boats creating algorithmic market patterns across the dome, vendors selling tropical fruits including dragon fruit, rambutan, mangosteen, and durian from traditional sampan boats, traditional Vietnamese conical hats and colorful clothing creating visual harmony, traditional Vietnamese river life with families living and working on boats, traditional cooking demonstrations on floating kitchens with realistic steam and smoke effects, traditional Vietnamese market calls and bargaining in authentic Vietnamese language, sunrise over the Mekong creating golden algorithmic light effects with realistic water reflections, traditional Vietnamese river transportation including motorboats and paddle boats, traditional Vietnamese floating architecture adapted to river life, traditional Vietnamese river food including fresh fish soup and tropical fruit, traditional Vietnamese commerce with traditional scales and baskets, traditional Vietnamese river culture with boat races and festivals, DOME PROJECTION with the floating market's vibrant commerce surrounding the viewer in 360-degree cultural and commercial immersion, ",

    "pho-street-culture":
      "DOME IMMERSION: Vietnamese pho street culture flowing through culinary mathematical patterns, traditional Vietnamese street food vendors with steaming pho bowls creating aromatic algorithmic clouds, traditional Vietnamese pho preparation with master chefs slicing beef paper-thin with mathematical precision, traditional Vietnamese street scenes with Honda motorbikes, cyclos, and pedestrians in algorithmic urban harmony, traditional Vietnamese architecture with French colonial influences including shuttered windows and balconies, traditional Vietnamese street furniture including low plastic stools and aluminum tables, traditional Vietnamese herbs and spices including star anise, cinnamon, and fresh herbs creating complex aromatic patterns, traditional Vietnamese coffee culture with ca phe sua da (iced coffee with condensed milk), traditional Vietnamese street life with vendors selling banh mi, spring rolls, and fresh fruit, traditional Vietnamese urban sounds including motorbike engines and street vendors, traditional Vietnamese street cooking with portable stoves and woks, traditional Vietnamese social culture with people gathering to eat and talk, DOME PROJECTION with the street food culture's authentic atmosphere enveloping the viewer in urban culinary immersion, ",

    // Traditional Music & Performance ARTISTIC MASTERY
    "ca-tru-performance":
      "DOME IMMERSION: Ca Tru traditional music flowing through acoustic mathematical patterns, UNESCO Intangible Cultural Heritage performance with traditional Vietnamese female singers in elaborate ao dai costumes with silk embroidery, traditional Vietnamese musical instruments including dan day (3-string lute) and phach (bamboo percussion) creating sound visualization across the dome, traditional Vietnamese poetic lyrics with ancient literary references and sophisticated wordplay, traditional Vietnamese performance spaces with intimate settings including traditional furniture and decorations, traditional Vietnamese audience participation with connoisseurs appreciating the subtle artistry through traditional gestures, traditional Vietnamese cultural preservation efforts with master artists teaching students, traditional Vietnamese court music traditions with refined artistic expression, traditional Vietnamese literary culture with poetry and classical texts, traditional Vietnamese musical theory with complex rhythmic patterns, traditional Vietnamese artistic refinement with sophisticated cultural appreciation, traditional Vietnamese performance costumes with intricate details and traditional jewelry, DOME PROJECTION with the ca tru performance's refined atmosphere surrounding the viewer in cultural sophistication and artistic mastery, ",

    "quan-ho-folk-songs":
      "DOME IMMERSION: Quan Ho folk songs flowing through melodic mathematical patterns, traditional Vietnamese antiphonal singing from Bac Ninh province with male and female groups responding to each other across the dome space, traditional Vietnamese festival settings with colorful traditional costumes including silk ao dai and traditional headwear, traditional Vietnamese courtship rituals expressed through song with authentic cultural practices, traditional Vietnamese rural landscapes with rice paddies and village settings, traditional Vietnamese musical harmony creating algorithmic sound patterns with traditional pentatonic scales, UNESCO Intangible Cultural Heritage performance with authentic cultural detail, traditional Vietnamese community celebrations and gatherings with multiple generations participating, traditional Vietnamese folk poetry with improvised lyrics and traditional themes, traditional Vietnamese cultural transmission with elders teaching youth, traditional Vietnamese seasonal festivals with quan ho performances, traditional Vietnamese social bonding through communal singing, traditional Vietnamese musical instruments accompanying the singing, DOME PROJECTION with the quan ho tradition's communal spirit enveloping the viewer in folk cultural immersion and traditional Vietnamese social harmony, ",
  }
  return scenarios[scenario] || scenarios.pure
}

function getDatasetPrompt(dataset: string): string {
  const datasets: Record<string, string> = {
    spirals:
      "mesmerizing spiral patterns flowing in mathematical harmony, Fibonacci sequences and golden ratio spirals, ",
    fractal: "intricate fractal geometries with self-similar patterns repeating at infinite scales, ",
    mandelbrot: "the iconic Mandelbrot set with its infinite complexity and boundary details, ",
    julia: "Julia set fractals with their elegant mathematical beauty and chaotic attractors, ",
    lorenz: "Lorenz attractor butterfly patterns flowing through phase space, ",
    hyperbolic: "hyperbolic geometry with its non-Euclidean mathematical beauty, ",
    gaussian: "Gaussian distributions and probability flows in mathematical space, ",
    cellular: "cellular automata patterns evolving through mathematical rules, ",
    voronoi: "Voronoi diagrams with their organic cell-like mathematical structures, ",
    perlin: "Perlin noise patterns creating organic mathematical textures, ",
    diffusion: "reaction-diffusion patterns with their chemical-mathematical beauty, ",
    wave: "wave interference patterns and mathematical oscillations, ",
    escher: "M.C. Escher-inspired impossible geometries and mathematical paradoxes, ",
    "8bit": "8-bit pixel art aesthetics merged with mathematical flow patterns, ",
    bosch: "Hieronymus Bosch surreal imagery flowing through mathematical currents, ",
  }
  return datasets[dataset] || "abstract mathematical patterns flowing in dynamic harmony, "
}

function getColorSchemeDescription(colorScheme: string): string {
  const schemes: Record<string, string> = {
    plasma: "vibrant plasma colors with electric purples, magentas, and yellows",
    quantum: "quantum-inspired colors with ethereal blues, greens, and silver highlights",
    cosmic: "deep space colors with cosmic purples, blues, and stellar whites",
    thermal: "thermal imaging colors with intense reds, oranges, and yellows",
    spectral: "full spectrum rainbow colors with prismatic light effects",
    crystalline: "crystal-clear colors with diamond whites, ice blues, and prismatic refractions",
    bioluminescent: "bioluminescent colors with glowing greens, blues, and phosphorescent highlights",
    aurora: "aurora borealis colors with dancing greens, purples, and ethereal lights",
    metallic: "metallic colors with gold, silver, copper, and bronze reflections",
    prismatic: "prismatic colors with rainbow refractions and light-splitting effects",
    monochromatic: "elegant monochromatic tones with subtle gradations",
    infrared: "infrared thermal colors with heat-signature reds and oranges",
    lava: "molten lava colors with intense reds, oranges, and volcanic blacks",
    futuristic: "futuristic neon colors with electric blues, cyans, and digital highlights",
    forest: "natural forest colors with deep greens, earth browns, and organic tones",
    ocean: "ocean depth colors with deep blues, teals, and aquatic highlights",
    sunset: "sunset colors with warm oranges, pinks, and golden hour lighting",
    arctic: "arctic colors with ice blues, polar whites, and crystalline effects",
    neon: "vibrant neon colors with electric pinks, greens, and glowing highlights",
    vintage: "vintage colors with sepia tones, aged patinas, and nostalgic warmth",
    toxic: "toxic waste colors with radioactive greens, chemical yellows, and danger reds",
    ember: "glowing ember colors with warm reds, oranges, and fire-like intensity",
    lunar: "lunar surface colors with silver grays, crater shadows, and moonlight whites",
    tidal: "tidal pool colors with sea greens, coral pinks, and oceanic blues",
  }
  return schemes[colorScheme] || "vibrant multi-colored"
}
