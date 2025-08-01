import { type NextRequest, NextResponse } from "next/server"
import { callOpenAI, generateDomePrompt, generatePanoramaPrompt } from "./utils"

function buildPrompt(dataset: string, scenario: string, colorScheme: string, customPrompt?: string): string {
  // Use custom prompt if provided
  if (customPrompt && customPrompt.trim()) {
    let prompt = customPrompt.trim()

    // Add color scheme to custom prompt
    const colorPrompts: Record<string, string> = {
      plasma: "vibrant plasma colors, electric blues and magentas",
      quantum: "quantum field colors, deep blues and ethereal whites",
      cosmic: "cosmic colors, deep space purples and stellar golds",
      thermal: "thermal imaging colors, heat signature reds and oranges",
      spectral: "full spectrum rainbow colors, prismatic light effects",
      crystalline: "crystalline colors, clear gems and mineral tones",
      bioluminescent: "bioluminescent colors, glowing organic blues and greens",
      aurora: "aurora borealis colors, dancing green and purple lights",
      metallic: "metallic tones, silver and bronze accents",
      prismatic: "prismatic light effects, rainbow refractions",
      monochromatic: "monochromatic grayscale, black and white tones",
      infrared: "infrared heat colors, thermal reds and oranges",
      lava: "molten lava colors, glowing reds and oranges",
      futuristic: "futuristic neon colors, cyberpunk aesthetics",
      forest: "forest greens and earth tones",
      ocean: "ocean blues and aqua tones",
      sunset: "warm sunset colors, oranges and deep reds",
      arctic: "arctic colors, ice blues and pristine whites",
      neon: "bright neon colors, electric pinks and greens",
      vintage: "vintage sepia tones, aged photograph aesthetics",
      toxic: "toxic waste colors, radioactive greens and yellows",
      ember: "glowing ember colors, warm orange and red coals",
      lunar: "lunar surface colors, silver grays and crater shadows",
      tidal: "tidal pool colors, ocean blues and sandy browns",
    }

    prompt += `, ${colorPrompts[colorScheme] || "vibrant colors"}`
    prompt +=
      ", highly detailed, artistic masterpiece, professional photography quality, 8K resolution, stunning visual composition"

    return prompt
  }

  // Build dataset-specific prompt
  let prompt = ""

  // Dataset-specific base prompts
  const datasetPrompts: Record<string, string> = {
    nuanu:
      "Nuanu Creative City architectural elements, modern creative spaces, innovative design, futuristic urban planning",
    bali: "Balinese Hindu temples, traditional architecture, tropical paradise, sacred geometry, rice terraces",
    thailand: "Thai Buddhist temples, golden spires, traditional architecture, serene landscapes, lotus flowers",
    indonesian: "Indonesian cultural heritage, traditional patterns, mystical elements, archipelago beauty",
    horror: "Indonesian supernatural creatures, mystical horror elements, traditional folklore monsters",
    spirals: "Mathematical spiral patterns, Fibonacci sequences, golden ratio, geometric precision",
    fractal: "Fractal patterns, recursive geometry, infinite detail, mathematical beauty",
    mandelbrot: "Mandelbrot set visualization, complex mathematical patterns, infinite zoom",
    julia: "Julia set fractals, complex plane mathematics, iterative patterns",
    lorenz: "Lorenz attractor, chaos theory visualization, butterfly effect patterns",
    hyperbolic: "Hyperbolic geometry, non-Euclidean space, curved mathematical surfaces",
    gaussian: "Gaussian field visualization, statistical distributions, probability landscapes",
    cellular: "Cellular automata patterns, Conway's Game of Life, emergent complexity",
    voronoi: "Voronoi diagrams, spatial partitioning, natural tessellation patterns",
    perlin: "Perlin noise landscapes, procedural generation, organic randomness",
    diffusion: "Reaction-diffusion patterns, chemical wave propagation, Turing patterns",
    wave: "Wave interference patterns, harmonic oscillations, frequency visualizations",
    moons: "Lunar orbital mechanics, celestial body movements, gravitational dance",
    tribes: "Tribal network topology, social connections, community structures",
    heads: "Mosaic head compositions, portrait arrangements, facial geometry",
    natives: "Ancient native tribes, traditional cultures, indigenous wisdom",
    statues: "Sacred sculptural statues, carved monuments, artistic figures",
  }

  prompt = datasetPrompts[dataset] || "Abstract mathematical art"

  // Add scenario-specific details for Indonesian dataset
  if (dataset === "indonesian") {
    const scenarioPrompts: Record<string, string> = {
      pure: "pure mathematical beauty with Indonesian geometric patterns",
      garuda:
        "Majestic Garuda Wisnu Kencana, divine eagle mount of Vishnu, golden feathers spread wide against celestial backdrop, powerful talons gripping sacred lotus, noble beak crowned with jeweled diadem, wings spanning cosmic horizons, embodying freedom and spiritual transcendence",
      wayang:
        "Intricate Wayang Kulit shadow puppets performing epic Ramayana tales, delicate perforated silhouettes dancing behind illuminated screen, gamelan orchestra creating mystical atmosphere, dalang puppeteer weaving ancient stories",
      batik:
        "Traditional batik patterns featuring parang rusak motifs, kawung geometric circles representing cosmic order, mega mendung cloud patterns in indigo blues, ceplok star formations, sido mukti prosperity symbols",
      borobudur:
        "Massive stone mandala temple Borobudur rising from Javanese plains, 2,672 relief panels narrating Buddhist teachings, 504 Buddha statues in meditation poses, bell-shaped stupas containing hidden Buddhas",
      komodo:
        "Prehistoric Komodo dragons prowling volcanic islands, largest living lizards with powerful jaws and venomous bite, ancient survivors from age of dinosaurs, scaly armor glistening in tropical sun",
      dance:
        "Graceful Balinese Legong dancers in golden costumes, elaborate headdresses with frangipani flowers, precise mudra hand gestures telling ancient stories, gamelan music guiding rhythmic movements",
      volcanoes:
        "Majestic Mount Merapi smoking against dawn sky, terraced rice fields cascading down volcanic slopes, Mount Bromo crater lake reflecting morning light, sacred Mount Agung towering over Balinese temples",
      temples:
        "Ornate Pura Besakih mother temple complex on Mount Agung slopes, multi-tiered meru towers reaching toward heavens, intricate stone carvings depicting mythological scenes",
      javanese:
        "Javanese court culture with refined batik patterns, gamelan instruments, traditional joglo architecture, shadow puppet wayang performances, ancient Hindu-Buddhist influences merged with Islamic culture",
      sundanese:
        "Sundanese highland culture with traditional bamboo architecture, angklung musical instruments creating harmonious melodies, rice cultivation in mountainous terrain, elevated traditional houses",
      batak:
        "Batak tribal culture with distinctive curved-roof traditional houses, intricate wood carvings and decorative elements, traditional ulos textiles with sacred meanings, Lake Toba cultural landscape",
      dayak:
        "Dayak Borneo tribes with traditional longhouses accommodating extended families, intricate beadwork and traditional costumes, hornbill bird cultural symbolism, forest-based lifestyle and hunting practices",
      acehnese:
        "Acehnese Islamic culture with traditional architecture showing Islamic influences, distinctive cultural practices and ceremonies, Saman dance performances, coffee cultivation and trade traditions",
      minangkabau:
        "Minangkabau matrilineal society with distinctive rumah gadang houses featuring horn-shaped roofs, traditional Minang cuisine and culinary heritage, skilled traders and merchants",
      "balinese-tribe":
        "Balinese Hindu culture with elaborate temple ceremonies and festivals, traditional Balinese architecture and sculpture, intricate wood and stone carvings, rice terrace agriculture and subak irrigation",
      papuans:
        "Papuan indigenous peoples with incredible cultural diversity, traditional houses on stilts and tree houses, elaborate feathered headdresses and body decorations, hundreds of distinct languages",
      baduy:
        "Baduy traditional community maintaining strict traditional lifestyle, rejection of modern technology, traditional white and black clothing distinctions, sustainable agriculture without chemicals",
      "orang-rimba":
        "Orang Rimba forest nomads, Sumatra hunter-gatherers also known as Kubu people, deep forest lifestyle with traditional shelters, hunting and gathering practices, shamanic spiritual beliefs",
      "hongana-manyawa":
        "Hongana Manyawa isolated tribe, one of Indonesia's last nomadic hunter-gatherer tribes, living in remote rainforest areas, resisting contact with outside world, traditional forest shelters",
      asmat:
        "Asmat master woodcarvers from New Guinea, renowned for intricate wood carvings, traditional bis poles and ancestor sculptures, elaborate ceremonial masks and shields, sago palm cultivation",
    }

    if (scenarioPrompts[scenario]) {
      prompt += ", " + scenarioPrompts[scenario]
    }
  }

  // Add color scheme
  const colorPrompts: Record<string, string> = {
    plasma: "vibrant plasma colors, electric blues and magentas",
    quantum: "quantum field colors, deep blues and ethereal whites",
    cosmic: "cosmic colors, deep space purples and stellar golds",
    thermal: "thermal imaging colors, heat signature reds and oranges",
    spectral: "full spectrum rainbow colors, prismatic light effects",
    crystalline: "crystalline colors, clear gems and mineral tones",
    bioluminescent: "bioluminescent colors, glowing organic blues and greens",
    aurora: "aurora borealis colors, dancing green and purple lights",
    metallic: "metallic tones, silver and bronze accents",
    prismatic: "prismatic light effects, rainbow refractions",
    monochromatic: "monochromatic grayscale, black and white tones",
    infrared: "infrared heat colors, thermal reds and oranges",
    lava: "molten lava colors, glowing reds and oranges",
    futuristic: "futuristic neon colors, cyberpunk aesthetics",
    forest: "forest greens and earth tones",
    ocean: "ocean blues and aqua tones",
    sunset: "warm sunset colors, oranges and deep reds",
    arctic: "arctic colors, ice blues and pristine whites",
    neon: "bright neon colors, electric pinks and greens",
    vintage: "vintage sepia tones, aged photograph aesthetics",
    toxic: "toxic waste colors, radioactive greens and yellows",
    ember: "glowing ember colors, warm orange and red coals",
    lunar: "lunar surface colors, silver grays and crater shadows",
    tidal: "tidal pool colors, ocean blues and sandy browns",
  }

  prompt += `, ${colorPrompts[colorScheme] || "vibrant colors"}`

  // Add artistic quality descriptors
  prompt +=
    ", highly detailed, artistic masterpiece, professional photography quality, 8K resolution, stunning visual composition"

  return prompt
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("AI Art API called with body:", JSON.stringify(body, null, 2))

    const {
      dataset,
      scenario,
      colorScheme,
      seed,
      numSamples,
      noise,
      timeStep,
      customPrompt,
      domeDiameter,
      domeResolution,
      projectionType,
      panoramaResolution,
      panoramaFormat,
      stereographicPerspective,
    } = body

    // Build the main prompt
    const mainPrompt = buildPrompt(dataset, scenario, colorScheme, customPrompt)
    console.log("Generated main prompt:", mainPrompt.substring(0, 200) + "...")

    let mainImageUrl: string
    let domeImageUrl: string
    let panoramaImageUrl: string
    const generationDetails: any = {}

    try {
      console.log("Generating main image...")
      mainImageUrl = await callOpenAI(mainPrompt)
      generationDetails.mainImage = "Generated successfully"
      console.log("✅ Main image generated successfully")
    } catch (error: any) {
      console.error("❌ Main image generation failed:", error)
      return NextResponse.json(
        { success: false, error: "Failed to generate main image: " + error.message },
        { status: 500 },
      )
    }

    // ALWAYS generate dome projection for complete set
    console.log(`🏛️ Generating ${domeDiameter || 20}m dome projection with tunnel effect...`)
    generationDetails.domeImage = "Generating..."
    try {
      const domePrompt = generateDomePrompt(mainPrompt, domeDiameter, domeResolution, projectionType)
      console.log("Generated dome prompt:", domePrompt.substring(0, 200) + "...")
      domeImageUrl = await callOpenAI(domePrompt)
      generationDetails.domeImage = "Generated successfully"
      console.log(`✅ ${domeDiameter || 20}m dome projection generated successfully`)
    } catch (error: any) {
      console.error(`❌ ${domeDiameter || 20}m dome projection generation failed:`, error)
      domeImageUrl = mainImageUrl // Use main image as fallback
      generationDetails.domeImage = "Using main image as fallback"
    }

    // ALWAYS generate 360° panorama for complete set
    console.log("🌐 Generating 360° panorama...")
    generationDetails.panoramaImage = "Generating..."
    try {
      const panoramaPrompt = generatePanoramaPrompt(
        mainPrompt,
        panoramaResolution,
        panoramaFormat,
        stereographicPerspective,
      )
      console.log("Generated panorama prompt:", panoramaPrompt.substring(0, 200) + "...")
      panoramaImageUrl = await callOpenAI(panoramaPrompt)
      generationDetails.panoramaImage = "Generated successfully"
      console.log("✅ 360° panorama generated successfully")
    } catch (error: any) {
      console.error("❌ 360° panorama generation failed:", error)
      panoramaImageUrl = mainImageUrl // Use main image as fallback
      generationDetails.panoramaImage = "Using main image as fallback"
    }

    // Prepare response with ALL THREE versions
    const response = {
      success: true,
      image: mainImageUrl,
      domeImage: domeImageUrl || mainImageUrl, // Always provide dome image
      panoramaImage: panoramaImageUrl || mainImageUrl, // Always provide panorama image
      originalPrompt: mainPrompt,
      promptLength: mainPrompt.length,
      provider: "OpenAI",
      model: "DALL-E 3",
      estimatedFileSize: "~2-4MB",
      generationDetails,
      parameters: {
        dataset,
        scenario,
        colorScheme,
        seed,
        numSamples,
        noiseScale: noise,
        timeStep,
        domeProjection: true, // Always true since we generate all versions
        domeDiameter: domeDiameter || 20,
        domeResolution: domeResolution || "4K",
        projectionType: projectionType || "fisheye",
        panoramic360: true, // Always true since we generate all versions
        panoramaResolution: panoramaResolution || "8K",
        panoramaFormat: panoramaFormat || "equirectangular",
        stereographicPerspective,
      },
    }

    console.log("✅ Returning successful response with all three images")
    return NextResponse.json(response)
  } catch (error: any) {
    console.error("❌ AI Art generation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate AI art",
        details: error.stack,
      },
      { status: 500 },
    )
  }
}
