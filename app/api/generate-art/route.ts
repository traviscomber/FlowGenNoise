import { type NextRequest, NextResponse } from "next/server"
import { callOpenAI, generateDomePrompt, generatePanoramaPrompt } from "./utils"

function buildPrompt(dataset: string, scenario: string, colorScheme: string, customPrompt?: string): string {
  // Use custom prompt if provided (especially for COSMOS testing)
  if (customPrompt && customPrompt.trim()) {
    let prompt = customPrompt.trim()

    // Add color scheme to custom prompt
    const colorPrompts: Record<string, string> = {
      plasma: "vibrant plasma colors, electric blues and magentas",
      quantum: "quantum field colors, deep blues and ethereal whites",
      cosmic:
        "cosmic COSMOS colors, deep space purples and stellar golds, nebula blues and cosmic magentas, galactic spirals and stellar formations",
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

    // Add COSMOS-specific enhancements if this is a COSMOS test
    if (prompt.includes("COSMOS")) {
      prompt +=
        ", infinite cosmic mathematical beauty, spiral galaxy formations, stellar mathematical structures, cosmic fractal patterns, celestial algorithmic precision, galactic geometric harmony, nebula mathematical formations, cosmic spiral mathematics, stellar computational art, galactic algorithmic beauty"
    }

    return prompt
  }

  // Build dataset-specific prompt with COSMOS enhancements
  let prompt = ""

  // Dataset-specific base prompts with COSMOS support
  const datasetPrompts: Record<string, string> = {
    nuanu:
      "Nuanu Creative City architectural elements, modern creative spaces, innovative design, futuristic urban planning",
    bali: "Balinese Hindu temples, traditional architecture, tropical paradise, sacred geometry, rice terraces",
    thailand: "Thai Buddhist temples, golden spires, traditional architecture, serene landscapes, lotus flowers",
    indonesian: "Indonesian cultural heritage, traditional patterns, mystical elements, archipelago beauty",
    horror: "Indonesian mystical creatures, supernatural folklore elements, traditional legends",
    spirals:
      "COSMOS Mathematical spiral patterns, Fibonacci sequences, golden ratio, geometric precision, spiral galaxies, cosmic formations, stellar mathematical patterns, galactic spirals, cosmic mathematics, astronomical spirals, stellar geometry, galactic harmony, cosmic fractals, space spirals",
    fractal:
      "COSMOS Fractal patterns, recursive geometry, infinite detail, mathematical beauty, cosmic fractal structures, stellar recursive patterns",
    mandelbrot:
      "COSMOS Mandelbrot set visualization, complex mathematical patterns, infinite zoom, cosmic mathematical complexity",
    julia: "COSMOS Julia set fractals, complex plane mathematics, iterative patterns, cosmic mathematical iterations",
    lorenz: "COSMOS Lorenz attractor, chaos theory visualization, butterfly effect patterns, cosmic chaos mathematics",
    hyperbolic: "COSMOS Hyperbolic geometry, non-Euclidean space, curved mathematical surfaces, cosmic curved geometry",
    gaussian:
      "COSMOS Gaussian field visualization, statistical distributions, probability landscapes, cosmic probability fields",
    cellular:
      "COSMOS Cellular automata patterns, Conway's Game of Life, emergent complexity, cosmic cellular structures",
    voronoi: "COSMOS Voronoi diagrams, spatial partitioning, natural tessellation patterns, cosmic tessellation",
    perlin: "COSMOS Perlin noise landscapes, procedural generation, organic randomness, cosmic procedural patterns",
    diffusion:
      "COSMOS Reaction-diffusion patterns, chemical wave propagation, Turing patterns, cosmic wave mathematics",
    wave: "COSMOS Wave interference patterns, harmonic oscillations, frequency visualizations, cosmic wave harmonics",
    moons: "COSMOS Lunar orbital mechanics, celestial body movements, gravitational dance, cosmic orbital mathematics",
    tribes: "COSMOS Tribal network topology, social connections, community structures, cosmic network patterns",
    heads: "COSMOS Mosaic head compositions, portrait arrangements, facial geometry, cosmic portrait mathematics",
    natives: "COSMOS Ancient native tribes, traditional cultures, indigenous wisdom, cosmic cultural patterns",
    statues: "COSMOS Sacred sculptural statues, carved monuments, artistic figures, cosmic sculptural mathematics",
  }

  prompt = datasetPrompts[dataset] || "COSMOS Abstract mathematical art"

  // Add COSMOS scenario-specific details
  if (scenario === "cosmic" || dataset === "spirals") {
    prompt +=
      ", COSMOS infinite cosmic mathematical beauty with spiral galaxy formations, stellar mathematical structures, cosmic fractal patterns, celestial algorithmic precision, galactic geometric harmony, nebula mathematical formations, cosmic spiral mathematics, stellar computational art, galactic algorithmic beauty, astronomical mathematical patterns, cosmic geometric structures, stellar fractal formations, galactic mathematical precision, cosmic algorithmic harmony, nebula computational art, stellar geometric beauty, galactic fractal mathematics, cosmic computational precision, astronomical algorithmic structures"
  }

  // Add color scheme with COSMOS enhancements
  const colorPrompts: Record<string, string> = {
    plasma: "vibrant plasma colors, electric blues and magentas",
    quantum: "quantum field colors, deep blues and ethereal whites",
    cosmic:
      "COSMOS cosmic colors, deep space purples and stellar golds, nebula blues and cosmic magentas, galactic spirals and stellar formations, cosmic mathematical color harmonies, stellar algorithmic gradients, galactic computational colors, nebula mathematical spectrums",
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

  // Add artistic quality descriptors with COSMOS enhancements
  prompt +=
    ", highly detailed, artistic masterpiece, professional photography quality, 8K resolution, stunning visual composition"

  if (dataset === "spirals" || scenario === "cosmic") {
    prompt +=
      ", COSMOS infinite cosmic mathematical beauty, spiral galaxy formations, stellar mathematical structures, cosmic fractal patterns, celestial algorithmic precision, galactic geometric harmony"
  }

  return prompt
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("🎨 AI Art API called with body:", JSON.stringify(body, null, 2))

    const {
      dataset,
      scenario,
      colorScheme,
      seed,
      numSamples,
      noise,
      timeStep,
      customPrompt,
      domeProjection,
      domeDiameter = 20, // Apply default dome diameter
      domeResolution = "8K", // Apply highest resolution
      projectionType = "fisheye",
      panoramaResolution = "16K", // Apply highest resolution
      panoramaFormat = "equirectangular",
      stereographicPerspective,
    } = body

    // Build the main prompt
    const mainPrompt = buildPrompt(dataset, scenario, colorScheme, customPrompt)
    console.log("📝 Generated main prompt:", mainPrompt.substring(0, 200) + "...")
    console.log("📏 Prompt length:", mainPrompt.length, "characters")

    let mainImageUrl: string
    let domeImageUrl: string
    let panoramaImageUrl: string
    const generationDetails: any = {}

    try {
      console.log("🖼️ Generating main image...")
      mainImageUrl = await callOpenAI(mainPrompt)
      generationDetails.mainImage = "Generated successfully"
      console.log("✅ Main image generated successfully")
    } catch (error: any) {
      console.error("❌ Main image generation failed:", error.message)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate main image: " + error.message,
          promptLength: mainPrompt.length,
          promptPreview: mainPrompt.substring(0, 200) + "...",
        },
        { status: 500 },
      )
    }

    // ALWAYS generate dome projection for complete set with TUNNEL UP effect
    console.log(`🏛️ Generating ${domeDiameter}m dome projection with TUNNEL UP effect...`)
    generationDetails.domeImage = "Generating..."
    try {
      const domePrompt = generateDomePrompt(mainPrompt, domeDiameter, domeResolution, projectionType)
      console.log("📝 Generated dome TUNNEL UP prompt:", domePrompt.substring(0, 200) + "...")
      domeImageUrl = await callOpenAI(domePrompt)
      generationDetails.domeImage = "Generated successfully with TUNNEL UP effect"
      console.log(`✅ ${domeDiameter}m dome TUNNEL UP projection generated successfully`)
    } catch (error: any) {
      console.error(`❌ ${domeDiameter}m dome TUNNEL UP projection generation failed:`, error.message)
      domeImageUrl = mainImageUrl // Use main image as fallback
      generationDetails.domeImage = `Fallback used: ${error.message}`
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
      console.log("📝 Generated panorama prompt:", panoramaPrompt.substring(0, 200) + "...")
      panoramaImageUrl = await callOpenAI(panoramaPrompt)
      generationDetails.panoramaImage = "Generated successfully"
      console.log("✅ 360° panorama generated successfully")
    } catch (error: any) {
      console.error("❌ 360° panorama generation failed:", error.message)
      panoramaImageUrl = mainImageUrl // Use main image as fallback
      generationDetails.panoramaImage = `Fallback used: ${error.message}`
    }

    // Prepare response with ALL THREE versions
    const response = {
      success: true,
      image: mainImageUrl,
      domeImage: domeImageUrl || mainImageUrl, // Always provide dome image with TUNNEL UP
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
        domeDiameter: 20, // Apply default dome diameter
        domeResolution: "8K", // Apply highest resolution
        projectionType: "fisheye",
        panoramic360: true, // Always true since we generate all versions
        panoramaResolution: "16K", // Apply highest resolution
        panoramaFormat: "equirectangular",
        stereographicPerspective,
      },
    }

    console.log("✅ Returning successful response with all three images including TUNNEL UP dome effect")
    return NextResponse.json(response)
  } catch (error: any) {
    console.error("❌ AI Art generation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate AI art",
        details: error.stack,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
