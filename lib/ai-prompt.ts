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

    // Ancient Temples & Spiritual Sites - God Level Detail
    "temple-of-literature":
      "DOME IMMERSION: Van Mieu Temple of Literature flowing through mathematical currents, Vietnam's first university from 1070 AD with ancient Confucian architecture, massive traditional curved rooflines with intricate dragon motifs and phoenix carvings reaching across the dome ceiling, red lacquered pillars with golden calligraphy inscriptions, stone stelae of doctoral graduates on turtle backs positioned around the dome perimeter, traditional Vietnamese courtyard gardens with lotus ponds reflecting algorithmic light patterns, ancient banyan trees with sprawling roots creating natural mathematical fractals, scholars in traditional ao dai robes studying ancient texts, incense smoke spiraling upward in complex fluid dynamics, traditional Vietnamese architectural elements merged with computational beauty, DOME PROJECTION with the sacred temple complex surrounding the viewer in 360-degree scholarly serenity, ",

    "jade-emperor-pagoda":
      "DOME IMMERSION: Jade Emperor Pagoda flowing through mystical mathematical patterns, ancient Taoist temple filled with incense smoke creating ethereal algorithmic clouds across the dome, intricate wooden carvings of dragons and phoenixes with photorealistic detail, statues of Taoist deities and Buddhist bodhisattvas positioned majestically around the spherical view, traditional Vietnamese lacquerware altars with golden inlay work, burning joss sticks creating spiraling smoke fractals, turtle pond with sacred turtles swimming in mathematical harmony, ancient banyan tree roots penetrating the temple structure in organic mathematical curves, red lanterns casting warm algorithmic light, traditional Vietnamese spiritual architecture merged with computational mysticism, DOME PROJECTION with the sacred temple's mystical atmosphere enveloping the viewer, ",

    // Imperial Heritage - Hue Dynasty Splendor
    "imperial-city-hue":
      "DOME IMMERSION: Imperial City of Hue flowing through royal mathematical currents, UNESCO World Heritage Nguyen Dynasty palace complex with magnificent traditional Vietnamese architecture, the Forbidden Purple City with ornate dragon-decorated rooflines extending across the dome ceiling, traditional Vietnamese imperial colors of gold and vermillion in algorithmic splendor, intricate ceramic tile work with phoenix and dragon motifs, royal throne halls with elaborate carved wooden screens, traditional Vietnamese court gardens with geometric lotus ponds, imperial guards in traditional uniforms with detailed embroidery, the Perfume River flowing through the scene in mathematical curves, ancient citadel walls with traditional Vietnamese fortification design, DOME PROJECTION with the imperial grandeur of Vietnamese royalty surrounding the viewer in majestic 360-degree splendor, ",

    "tomb-of-khai-dinh":
      "DOME IMMERSION: Tomb of Emperor Khai Dinh flowing through mathematical patterns, fusion of Vietnamese and European architectural styles in algorithmic harmony, intricate mosaic work with thousands of ceramic and glass pieces creating complex geometric patterns across the dome surface, elaborate dragon and phoenix motifs in traditional Vietnamese imperial art, ornate French colonial architectural elements merged with Vietnamese design, detailed stone carvings with mathematical precision, traditional Vietnamese imperial tomb architecture with multiple levels ascending toward the dome zenith, colorful ceramic decorations reflecting light in prismatic algorithmic effects, imperial Vietnamese symbolism integrated with computational beauty, DOME PROJECTION with the tomb's magnificent fusion architecture enveloping the viewer, ",

    // Traditional Villages & Rural Life
    "sapa-terraces":
      "DOME IMMERSION: Sapa rice terraces flowing through mountainous mathematical currents, spectacular stepped agricultural landscapes carved into misty mountain slopes extending across the entire dome view, Hmong and Red Dao ethnic minority villages with traditional stilt houses positioned around the dome perimeter, morning mist rising through the terraces in complex fluid dynamics, traditional Vietnamese conical hats (non la) worn by farmers working in the fields, water buffalo grazing on terraced slopes, traditional ethnic minority textiles with intricate geometric patterns, mountain peaks shrouded in clouds creating natural mathematical formations, traditional Vietnamese highland agriculture merged with computational beauty, DOME PROJECTION with the breathtaking terraced landscape surrounding the viewer in 360-degree mountain serenity, ",

    "mekong-delta":
      "DOME IMMERSION: Mekong Delta flowing through aquatic mathematical currents, vast network of rivers and canals creating complex algorithmic waterways across the dome surface, traditional Vietnamese sampan boats with curved bamboo covers navigating the mathematical flow fields, floating markets with vendors selling tropical fruits from boats, traditional Vietnamese stilt houses on the riverbanks, coconut palms swaying in algorithmic wind patterns, traditional Vietnamese fishing nets and traps creating geometric patterns in the water, rice paddies flooded with water reflecting the dome sky, traditional Vietnamese river life merged with computational dynamics, DOME PROJECTION with the delta's intricate waterway system enveloping the viewer, ",

    // Cultural Festivals & Traditions
    "tet-celebration":
      "DOME IMMERSION: Tet Lunar New Year celebration flowing through festive mathematical patterns, traditional Vietnamese New Year festivities filling the entire dome space with joy and color, elaborate peach blossom trees (hoa dao) and kumquat trees (cay quat) with algorithmic floral patterns, traditional Vietnamese ao dai dresses in vibrant colors swirling through the dome, dragon and lion dances with intricate costume details moving in mathematical harmony, traditional Vietnamese calligraphy banners with golden characters, red envelopes (li xi) floating through the air in algorithmic motion, traditional Vietnamese New Year foods and offerings, fireworks exploding in complex mathematical patterns across the dome ceiling, family gatherings with multiple generations in traditional dress, DOME PROJECTION with the Tet celebration's joyous atmosphere surrounding the viewer in 360-degree festive immersion, ",

    "mid-autumn-festival":
      "DOME IMMERSION: Mid-Autumn Festival flowing through lunar mathematical patterns, traditional Vietnamese Tet Trung Thu celebration with children carrying colorful lanterns in algorithmic processions across the dome, elaborate traditional Vietnamese lanterns in shapes of fish, dragons, and stars creating geometric light patterns, mooncakes with intricate designs and traditional Vietnamese symbols, traditional Vietnamese folk dances with performers in colorful costumes, full moon illuminating the dome ceiling with ethereal algorithmic light, traditional Vietnamese musical instruments creating sound visualization patterns, children in traditional Vietnamese clothing playing traditional games, lion dances with detailed costume work moving through mathematical formations, DOME PROJECTION with the festival's magical atmosphere enveloping the viewer, ",

    // Traditional Arts & Crafts
    "water-puppetry":
      "DOME IMMERSION: Vietnamese water puppetry (Mua Roi Nuoc) flowing through aquatic mathematical currents, traditional wooden puppets dancing on water surfaces with intricate carved details and colorful lacquer work, puppet masters hidden behind bamboo screens manipulating the figures with mathematical precision, traditional Vietnamese folk tales coming to life through algorithmic puppet movements, water splashing in complex fluid dynamics as puppets move, traditional Vietnamese musical accompaniment with drums, gongs, and wooden fish creating sound visualization patterns, elaborate puppet stage with traditional Vietnamese architectural elements, rice paddy settings with water buffalo and farmers as puppet characters, DOME PROJECTION with the water puppet theater surrounding the viewer in immersive cultural performance, ",

    "lacquerware-craft":
      "DOME IMMERSION: Vietnamese lacquerware craftsmanship flowing through artistic mathematical patterns, master artisans applying multiple layers of traditional Vietnamese lacquer with mathematical precision, intricate mother-of-pearl inlay work creating complex geometric designs across the dome surface, traditional Vietnamese motifs including dragons, phoenixes, and lotus flowers rendered in exquisite detail, eggshell lacquer technique creating delicate crackled patterns, traditional Vietnamese lacquer colors of black, red, and gold in algorithmic harmony, bamboo and wood base materials being transformed through traditional techniques, traditional Vietnamese workshop settings with artisans in traditional clothing, DOME PROJECTION with the lacquerware creation process enveloping the viewer in artistic immersion, ",

    // Historical Battles & Heroes
    "bach-dang-victory":
      "DOME IMMERSION: Bach Dang River victory flowing through historical mathematical currents, legendary Vietnamese naval battle against Chinese invasion with traditional Vietnamese war junks positioned strategically across the dome, General Ngo Quyen's brilliant tactical use of iron-tipped stakes hidden in the river creating geometric defensive patterns, traditional Vietnamese naval warfare with detailed historical accuracy, Mongol invasion fleets being defeated through mathematical strategic planning, traditional Vietnamese military uniforms and weapons with authentic historical detail, the Red River delta landscape with traditional Vietnamese villages, heroic Vietnamese defenders in traditional armor, DOME PROJECTION with the historic victory surrounding the viewer in patriotic 360-degree immersion, ",

    "trung-sisters-rebellion":
      "DOME IMMERSION: Trung Sisters rebellion flowing through heroic mathematical patterns, legendary Vietnamese female warriors Trung Trac and Trung Nhi leading the resistance against Chinese occupation, traditional Vietnamese war elephants with ornate decorations and armor moving through algorithmic battle formations, ancient Vietnamese citadels and fortifications with traditional architectural details, traditional Vietnamese weapons and military equipment with historical accuracy, Vietnamese people in traditional clothing supporting the rebellion, traditional Vietnamese landscapes with rivers and mountains, heroic statues and monuments commemorating the sisters, DOME PROJECTION with the rebellion's epic scope enveloping the viewer in historical grandeur, ",

    // Natural Wonders & Landscapes
    "halong-bay":
      "DOME IMMERSION: Ha Long Bay flowing through maritime mathematical currents, thousands of limestone karst towers rising from emerald waters in complex geological formations across the dome, traditional Vietnamese junk boats with distinctive red sails navigating through the algorithmic seascape, hidden caves and grottoes with stalactites and stalagmites creating natural mathematical patterns, traditional Vietnamese fishing villages floating on the water, morning mist creating ethereal atmospheric effects, traditional Vietnamese fishing techniques with cormorant birds, UNESCO World Heritage landscape with pristine natural beauty, DOME PROJECTION with the bay's magnificent karst landscape surrounding the viewer in 360-degree natural wonder, ",

    "phong-nha-caves":
      "DOME IMMERSION: Phong Nha-Ke Bang caves flowing through subterranean mathematical currents, massive limestone cave systems with cathedral-like chambers extending across the dome ceiling, spectacular stalactite and stalagmite formations creating natural algorithmic sculptures, underground rivers flowing through mathematical cave networks, traditional Vietnamese cave exploration with local guides, bioluminescent cave formations glowing with natural algorithmic light, traditional Vietnamese karst landscape above ground with dense jungle vegetation, UNESCO World Heritage geological formations with millions of years of natural mathematical processes, DOME PROJECTION with the cave system's magnificent underground architecture enveloping the viewer, ",

    // Traditional Cuisine & Markets
    "floating-market-mekong":
      "DOME IMMERSION: Mekong floating market flowing through commercial mathematical currents, traditional Vietnamese river commerce with hundreds of boats creating algorithmic market patterns across the dome, vendors selling tropical fruits, vegetables, and traditional Vietnamese foods from sampan boats, traditional Vietnamese conical hats and colorful clothing creating visual harmony, traditional Vietnamese river life with families living on boats, traditional cooking demonstrations on floating kitchens, traditional Vietnamese market calls and bargaining in multiple languages, sunrise over the Mekong creating golden algorithmic light effects, traditional Vietnamese river transportation and logistics, DOME PROJECTION with the floating market's vibrant commerce surrounding the viewer in 360-degree cultural immersion, ",

    "pho-street-culture":
      "DOME IMMERSION: Vietnamese pho street culture flowing through culinary mathematical patterns, traditional Vietnamese street food vendors with steaming pho bowls creating aromatic algorithmic clouds, traditional Vietnamese pho preparation with master chefs slicing beef paper-thin with mathematical precision, traditional Vietnamese street scenes with motorbikes, cyclos, and pedestrians in algorithmic urban harmony, traditional Vietnamese architecture with French colonial influences, traditional Vietnamese street furniture including low plastic stools and tables, traditional Vietnamese herbs and spices creating complex aromatic patterns, traditional Vietnamese coffee culture with ca phe sua da, DOME PROJECTION with the street food culture's authentic atmosphere enveloping the viewer, ",

    // Traditional Music & Performance
    "ca-tru-performance":
      "DOME IMMERSION: Ca Tru traditional music flowing through acoustic mathematical patterns, UNESCO Intangible Cultural Heritage performance with traditional Vietnamese female singers in elaborate ao dai costumes, traditional Vietnamese musical instruments including dan day lute and phach bamboo percussion creating sound visualization across the dome, traditional Vietnamese poetic lyrics with ancient literary references, traditional Vietnamese performance spaces with intimate settings, traditional Vietnamese audience participation with connoisseurs appreciating the subtle artistry, traditional Vietnamese cultural preservation efforts, DOME PROJECTION with the ca tru performance's refined atmosphere surrounding the viewer in cultural sophistication, ",

    "quan-ho-folk-songs":
      "DOME IMMERSION: Quan Ho folk songs flowing through melodic mathematical patterns, traditional Vietnamese antiphonal singing from Bac Ninh province with male and female groups responding to each other across the dome space, traditional Vietnamese festival settings with colorful traditional costumes, traditional Vietnamese courtship rituals expressed through song, traditional Vietnamese rural landscapes with rice paddies and village settings, traditional Vietnamese musical harmony creating algorithmic sound patterns, UNESCO Intangible Cultural Heritage performance with authentic cultural detail, traditional Vietnamese community celebrations and gatherings, DOME PROJECTION with the quan ho tradition's communal spirit enveloping the viewer, ",
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
