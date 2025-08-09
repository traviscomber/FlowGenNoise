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
      "Wat Pho temple flowing through mathematical patterns, the massive 46-meter reclining Buddha filling the dome view, golden statue and traditional Thai architecture merged with computational art, DOME PROJECTION with the sacred Buddha positioned majestically overhead, ",
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
