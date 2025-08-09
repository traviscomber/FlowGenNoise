// Shared prompt building logic for consistency between preview and generation

export function buildPrompt(
  dataset: string,
  scenario?: string,
  colorScheme = "metallic",
  customPrompt?: string,
): string {
  // If custom prompt is provided, use it as base
  if (customPrompt && customPrompt.trim()) {
    return customPrompt.trim()
  }

  // Build standard prompt based on dataset and scenario
  let basePrompt = ""

  // Dataset-specific prompts
  switch (dataset) {
    case "indonesian":
      basePrompt = buildIndonesianPrompt(scenario || "pure", colorScheme)
      break
    case "thailand":
      basePrompt = buildThailandPrompt(colorScheme)
      break
    case "spirals":
      basePrompt = `Intricate mathematical spiral patterns with ${colorScheme} color palette, fibonacci sequences, golden ratio spirals, logarithmic spirals, nested recursive spirals creating hypnotic depth, flowing mathematical beauty`
      break
    case "fractal":
      basePrompt = `Complex fractal mathematics with ${colorScheme} coloring, mandelbrot-style iterations, self-similar patterns at multiple scales, infinite recursive detail, mathematical precision and organic beauty`
      break
    case "mandelbrot":
      basePrompt = `Classic Mandelbrot set visualization with ${colorScheme} gradient coloring, complex number plane iterations, escape-time algorithm visualization, boundary detail exploration, mathematical art`
      break
    case "julia":
      basePrompt = `Julia set mathematical visualization with ${colorScheme} color scheme, complex dynamic systems, filled julia sets, parameter space exploration, fractal boundary structures`
      break
    case "lorenz":
      basePrompt = `Lorenz attractor chaotic system visualization with ${colorScheme} palette, butterfly effect demonstration, strange attractor paths, dynamic system trajectories, chaos theory mathematics`
      break
    case "hyperbolic":
      basePrompt = `Hyperbolic geometry patterns with ${colorScheme} coloring, non-Euclidean space visualization, Poincaré disk model, tessellations in hyperbolic plane, curved space mathematics`
      break
    case "gaussian":
      basePrompt = `Gaussian field mathematical visualization with ${colorScheme} palette, probability distributions, statistical mathematics, random field patterns, mathematical statistics art`
      break
    case "cellular":
      basePrompt = `Cellular automata patterns with ${colorScheme} coloring, Conway's Game of Life, rule-based evolution, emergent complexity from simple rules, discrete mathematical systems`
      break
    case "voronoi":
      basePrompt = `Voronoi diagram mathematical art with ${colorScheme} color scheme, computational geometry, nearest neighbor partitions, Delaunay triangulation duals, spatial analysis mathematics`
      break
    case "perlin":
      basePrompt = `Perlin noise mathematical visualization with ${colorScheme} palette, procedural generation, gradient noise functions, natural-looking randomness, computer graphics mathematics`
      break
    case "diffusion":
      basePrompt = `Reaction-diffusion system patterns with ${colorScheme} coloring, Gray-Scott model, Turing patterns, mathematical biology, pattern formation in nature`
      break
    case "wave":
      basePrompt = `Wave interference mathematical patterns with ${colorScheme} palette, superposition principles, constructive and destructive interference, wave equation solutions, physics mathematics`
      break
    case "escher":
      basePrompt = `M.C. Escher-inspired mathematical art with ${colorScheme} coloring, impossible geometries, tessellations, optical illusions, mathematical paradoxes, recursive patterns`
      break
    case "8bit":
      basePrompt = `8-bit pixel art mathematical visualization with ${colorScheme} retro palette, pixelated mathematical functions, digital art aesthetics, computer graphics history, mathematical gaming art`
      break
    case "bosch":
      basePrompt = `Hieronymus Bosch-inspired mathematical surrealism with ${colorScheme} palette, fantastical mathematical creatures, surreal geometric landscapes, medieval artistic style meets mathematics`
      break
    default:
      basePrompt = `Abstract mathematical visualization with ${colorScheme} color scheme, flowing mathematical patterns, algorithmic art, computational mathematics, digital art`
      break
  }

  return basePrompt
}

function buildIndonesianPrompt(scenario: string, colorScheme: string): string {
  const scenarioPrompts: Record<string, string> = {
    pure: `Pure mathematical visualization with ${colorScheme} color palette, abstract mathematical beauty, algorithmic art, computational mathematics`,
    garuda: `Garuda Wisnu Kencana monument with ${colorScheme} palette, majestic Garuda eagle wings, Hindu mythology, Lord Vishnu riding Garuda, Balinese spiritual art, Indonesian cultural heritage`,
    wayang: `Traditional Wayang Kulit shadow puppetry with ${colorScheme} coloring, intricate puppet silhouettes, Indonesian storytelling tradition, Javanese cultural art, dramatic shadow play`,
    batik: `Indonesian Batik patterns with ${colorScheme} color scheme, traditional wax-resist dyeing, intricate geometric and floral motifs, Javanese and Balinese textile art`,
    borobudur: `Borobudur Buddhist temple with ${colorScheme} palette, ancient stone stupas, Buddhist reliefs and carvings, Central Java heritage, spiritual mandala architecture`,
    javanese: `Javanese cultural heritage with ${colorScheme} coloring, traditional ceremonies, gamelan music visualization, court traditions, Central Java artistic heritage`,
    sundanese: `Sundanese cultural traditions with ${colorScheme} palette, West Java heritage, traditional music and dance, Sunda kingdom history, mountain landscapes`,
    batak: `Batak tribal culture with ${colorScheme} coloring, North Sumatra traditions, traditional architecture, Lake Toba landscapes, Batak script and carvings`,
    dayak: `Dayak tribal heritage with ${colorScheme} palette, Borneo indigenous culture, traditional longhouses, forest spirituality, tribal art and ceremonies`,
    acehnese: `Acehnese cultural heritage with ${colorScheme} coloring, Islamic architecture, traditional dances, Sumatra northern culture, historical sultanate`,
    minangkabau: `Minangkabau matriarchal culture with ${colorScheme} palette, traditional Rumah Gadang architecture, West Sumatra heritage, matrilineal society traditions`,
    "balinese-tribe": `Balinese Hindu traditions with ${colorScheme} coloring, temple ceremonies, traditional dances, spiritual rituals, artistic heritage`,
    papuans: `Papuan tribal culture with ${colorScheme} palette, traditional body painting, feather headdresses, indigenous spirituality, New Guinea heritage`,
    baduy: `Baduy tribe traditions with ${colorScheme} coloring, indigenous Sundanese people, traditional village life, spiritual connection to nature, West Java mountains`,
    "orang-rimba": `Orang Rimba forest people with ${colorScheme} palette, Sumatra jungle dwellers, traditional forest life, indigenous knowledge, harmony with nature`,
    "hongana-manyawa": `Hongana Manyawa tribe with ${colorScheme} coloring, Halmahera indigenous people, traditional forest culture, Maluku heritage, ancestral traditions`,
    asmat: `Asmat tribal art with ${colorScheme} palette, Papua wood carving traditions, ancestral poles, traditional sculptures, spiritual art forms`,
    komodo: `Komodo dragon legends with ${colorScheme} coloring, East Nusa Tenggara wildlife, mythical dragon stories, island landscapes, Indonesian natural heritage`,
    dance: `Indonesian traditional dances with ${colorScheme} palette, graceful movements, cultural ceremonies, regional dance variations, artistic expressions`,
    volcanoes: `Indonesian volcanic landscapes with ${colorScheme} coloring, Ring of Fire geology, active volcanoes, dramatic natural beauty, geological heritage`,
    temples: `Indonesian sacred temples with ${colorScheme} palette, Hindu and Buddhist architecture, spiritual monuments, ancient stone carvings, religious heritage`,
  }

  return (
    scenarioPrompts[scenario] ||
    `Indonesian cultural heritage with ${colorScheme} color palette, traditional arts and crafts, cultural diversity, archipelago beauty`
  )
}

function buildThailandPrompt(colorScheme: string): string {
  return `Thai cultural heritage with ${colorScheme} color palette, Buddhist temples, golden stupas, traditional Thai architecture, floating markets, tuk-tuks, Thai silk patterns, ornate decorations, Siamese artistic traditions, tropical landscapes, Thai spiritual art, temple murals, lotus flowers, elephant symbolism, Thai dance and music, royal palace architecture, traditional festivals, Thai culinary culture, river life, mountain temples, beach paradises, Thai handicrafts, silk weaving, wood carving traditions`
}
