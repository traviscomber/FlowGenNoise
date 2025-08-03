import { type NextRequest, NextResponse } from "next/server"
import { callOpenAI, generateDomePrompt, generatePanoramaPrompt } from "./utils"

function buildPrompt(dataset: string, scenario: string, colorScheme: string, customPrompt?: string): string {
  // Use custom prompt if provided
  if (customPrompt && customPrompt.trim()) {
    let prompt = customPrompt.trim()

    // Add color scheme to custom prompt
    const colorPrompts: Record<string, string> = {
      plasma: "vibrant plasma colors with electric blues and magentas",
      quantum: "quantum field colors with deep blues and ethereal whites",
      cosmic: "cosmic colors with deep space purples and stellar golds",
      thermal: "thermal imaging colors with heat signature reds and oranges",
      spectral: "full spectrum rainbow colors with prismatic light effects",
      crystalline: "crystalline colors with clear gems and mineral tones",
      bioluminescent: "bioluminescent colors with glowing organic blues and greens",
      aurora: "aurora borealis colors with dancing green and purple lights",
      metallic: "metallic tones with silver and bronze accents",
      prismatic: "prismatic light effects with rainbow refractions",
      monochromatic: "monochromatic grayscale with black and white tones",
      infrared: "infrared heat colors with thermal reds and oranges",
      lava: "molten lava colors with glowing reds and oranges",
      futuristic: "futuristic neon colors with cyberpunk aesthetics",
      forest: "forest greens and earth tones",
      ocean: "ocean blues and aqua tones",
      sunset: "warm sunset colors with oranges and deep reds",
      arctic: "arctic colors with ice blues and pristine whites",
      neon: "bright neon colors with electric pinks and greens",
      vintage: "vintage sepia tones with aged photograph aesthetics",
      toxic: "toxic waste colors with radioactive greens and yellows",
      ember: "glowing ember colors with warm orange and red coals",
      lunar: "lunar surface colors with silver grays and crater shadows",
      tidal: "tidal pool colors with ocean blues and sandy browns",
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
    horror: "Indonesian mystical creatures, supernatural folklore elements, traditional legends",
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
        "Majestic Garuda eagle soaring through celestial realms with advanced mathematical artistic composition, massive divine eagle with wingspan following Fibonacci spiral flight patterns, intricate feather details in fractal geometric sequences, powerful talons gripping sacred lotus in mandala mathematical formations, noble eagle head at golden ratio focal point, eyes creating logarithmic spiral energy patterns, Lord Vishnu in tetrahedral sacred geometry with four arms, flowing silk garments following fluid dynamics curves, Mount Meru with waterfalls in parabolic arc trajectories, temple spires in hexagonal crystal lattice patterns, Indonesian archipelago in Voronoi diagram distributions, Ring of Fire volcanoes in prime number sequences, gamelan music as sine and cosine wave harmonics, Sanskrit mantras following Euler's spiral curves, epic scenes in Platonic solid formations, divine aura in chromatic circle progressions, cosmic mandala in Archimedean spiral mathematics, 17,508 islands in Gaussian probability distributions, temples at golden rectangle intersections, textiles using tessellation principles, celestial bodies in elliptical Kepler trajectories, sacred geometry (Sri Yantra, Flower of Life, Metatron's Cube) in wing patterns using recursive algorithms, atmospheric perspective with inverse square law, clouds shaped by Navier-Stokes equations, lightning in Lichtenberg fractals, wind as vector fields, architecture with hyperbolic geometry, flames in chaos theory attractors, constellations in spherical trigonometry, light rays in radial symmetry, energy fields as electromagnetic equations, space-time distortions with relativity mathematics, quantum particles in probability wave functions, peaks in triangular number sequences, rivers in meandering curves, forests in branching fractals, architectural catenary curves, ceremonies in permutation principles, hyperrealistic 8K with computational fluid dynamics, ray tracing mathematics, Bezier curve compositions, parametric surface modeling, Fourier transform visualizations, complex number plane mappings, differential geometry, topology mathematics, graph theory networks, matrix transformations",
      wayang:
        "Mystical Wayang Kulit shadow puppet performance bringing ancient Ramayana and Mahabharata epics to life, master dalang puppeteer silhouetted behind glowing white screen with hundreds of intricately carved leather puppets, each puppet a masterwork of perforated artistry with gold leaf details catching flickering oil lamp light, dramatic shadows dancing and morphing into living characters, Prince Rama with noble features and ornate crown alongside Princess Sita with flowing hair and delicate jewelry, mighty Hanuman the monkey hero leaping through air with mountain in his grasp, gamelan orchestra of bronze instruments creating visible sound waves in metallic gold and silver, traditional Indonesian musicians in batik clothing playing gender, saron, and kendang drums, coconut oil lamps casting warm amber light creating multiple layers of shadows, ancient Javanese script floating in the air telling the story, tropical night sky filled with stars, traditional Javanese architecture with carved wooden pillars and clay tile roofs, incense smoke curling upward, banana leaves and frangipani flowers as offerings, cultural heritage spanning over 1000 years visualized as golden threads connecting past to present, UNESCO World Heritage artistic tradition, hyperrealistic cinematic lighting with deep shadows and warm highlights, 8K resolution with intricate puppet details and atmospheric effects, focus on shadow projections and backstage puppeteers, never showing audience",
      batik:
        "Sacred Indonesian batik textile patterns coming alive with supernatural energy, master batik artisan's hands applying hot wax with traditional canting tool creating flowing geometric lines that transform into living rivers of light, parang rusak diagonal patterns representing eternal life force undulating like geometric ribbons, kawung geometric circles symbolizing cosmic order expanding into mandala formations that pulse with universal rhythm, mega mendung cloud motifs in deep indigo blues creating geometric storm patterns and lightning, ceplok star formations bursting into real constellations in the night sky, sido mukti prosperity symbols manifesting as golden coins and rice grains falling like blessed rain, royal court designs with protective meanings creating shields of light around ancient Javanese palaces, intricate hand-drawn geometric patterns using traditional canting tools, natural dyes from indigo plants, turmeric roots, and mahogany bark creating earth tones that shift and change like living geometric skin, cultural identity woven into fabric of reality itself, UNESCO heritage craft mastery passed down through generations of royal court artisans, each pattern telling stories of creation myths and legends through geometric storytelling, textile becoming portal to spiritual realm where ancestors dance in eternal celebration through geometric formations, traditional Javanese philosophy of harmony between human, nature, and divine visualized as interconnected geometric patterns, workshop filled with clay pots of dye, bamboo tools, and cotton fabric stretched on wooden frames, tropical sunlight filtering through palm leaves creating natural batik shadows on the ground in geometric patterns, master craftswomen in traditional kebaya clothing working with meditative focus, the very air shimmering with creative energy and cultural pride, hyperrealistic 8K detail showing every wax crack and dye gradient in geometric precision, volumetric lighting and particle effects bringing ancient art form to supernatural life through geometric transformations, NO WATER, NO WAVES, focus on geometric textile patterns and sacred symbols",
      borobudur:
        "Abstract mathematical mandala compositions with infinite geometric recursion, concentric circular patterns expanding outward in perfect mathematical harmony, three-dimensional geometric forms creating ascending spiral mathematics, bell-shaped mathematical curves and meditation circle equations integrated into cosmic algorithmic patterns, thousands of interconnected geometric panels showing mathematical sequences and numerical progressions rendered in abstract computational art style, serene mathematical equilibrium and golden ratio proportions becoming living geometric algorithms, multi-layered mandala mathematics with circular platforms representing different dimensional spaces, ancient geometric principles manifested in pure mathematical visualization, abstract mathematical textures with algorithmic complexity and fractal iterations, sacred geometry equations manifested in computational art forms, mathematical cosmology visualized through geometric algorithmic arrangements, classical mathematical sculpture aesthetics rendered in pure abstract form, algorithmic art style with deep mathematical shadows and dimensional complexity, ancient mathematical techniques creating intricate numerical patterns, spiritual mathematical symbolism expressed through geometric algorithms, meditation and mathematical enlightenment themes expressed through pure geometric art, classical geometric mathematical harmony, sacred mathematical mandala principles in algorithmic construction, ancient mathematical artistic traditions rendered as computational geometry, geometric mathematical mastery with intricate algorithmic detail work, spiritual mathematical journey visualized through ascending geometric mathematical forms, hyperrealistic 8K mathematical texture detail with dramatic algorithmic lighting, atmospheric effects showing pure mathematical craftsmanship and geometric artistry",
      komodo:
        "Mystical dragon-inspired artistic tapestry with ancient Indonesian mythological elements, legendary dragon spirits manifesting as flowing artistic forms with serpentine grace and ethereal beauty, ornate dragon scale patterns transformed into decorative art motifs with intricate golden filigree and jeweled textures, mythical dragon essence captured in traditional Indonesian artistic style with batik-inspired flowing patterns, ancient dragon legends visualized through artistic interpretation with ceremonial masks and totemic sculptures, dragon-inspired textile designs with elaborate patterns reminiscent of royal court artistry, mystical dragon energy flowing through artistic compositions like liquid gold and precious gems, traditional Indonesian dragon mythology brought to life through artistic mastery, ornate dragon motifs integrated into temple art and ceremonial decorations, artistic dragon forms dancing through compositions with supernatural elegance, dragon-inspired artistic elements with traditional Indonesian craftsmanship techniques, ceremonial dragon art with spiritual significance and cultural heritage, artistic interpretation of dragon legends through traditional Indonesian artistic mediums, dragon-themed decorative arts with intricate patterns and symbolic meanings, mystical dragon artistry with flowing organic forms and ethereal lighting effects, traditional dragon-inspired art forms with cultural authenticity and artistic excellence, ornate dragon artistic compositions with ceremonial significance and spiritual power, dragon-inspired artistic heritage with traditional Indonesian aesthetic principles, artistic dragon elements integrated into cultural celebrations and ceremonial displays, hyperrealistic 8K artistic detail with dramatic lighting showing traditional Indonesian dragon-inspired artistry and cultural craftsmanship",
      dance:
        "Abstract mathematical choreography patterns with infinite algorithmic recursion, parametric equations describing graceful movement trajectories through three-dimensional space, mathematical visualization of rhythmic patterns and temporal sequences rendered in pure computational art style, algorithmic interpretation of synchronized movement creating geometric mandala formations, mathematical modeling of dance formations using coordinate geometry and spatial transformations, abstract computational art inspired by choreographic mathematics and movement algorithms, geometric visualization of musical rhythm patterns through mathematical wave functions and harmonic analysis, algorithmic dance patterns with fractal recursion and mathematical precision, mathematical interpretation of synchronized movement through matrix transformations and vector calculations, abstract geometric art inspired by dance choreography rendered through computational algorithms, mathematical visualization of movement flow using fluid dynamics equations and particle systems, algorithmic art style with dance-inspired mathematical complexity and geometric beauty, mathematical modeling of group choreography through network topology and graph theory, abstract computational visualization of rhythmic mathematics and temporal pattern analysis, geometric interpretation of dance movements using mathematical curves and surface modeling, algorithmic choreography patterns with infinite mathematical detail and recursive complexity, mathematical art inspired by movement dynamics and spatial geometry, computational visualization of dance mathematics through algorithmic pattern generation, abstract mathematical interpretation of synchronized movement and rhythmic sequences, geometric dance mathematics with algorithmic precision and mathematical beauty, mathematical choreography algorithms creating infinite pattern variations, computational art inspired by movement mathematics and geometric transformations, hyperrealistic 8K mathematical texture detail with dramatic algorithmic lighting showing pure computational dance mathematics and geometric artistry",
      volcanoes:
        "Mystical volcanic artistry with supernatural Indonesian fire spirits manifesting as ethereal beings of molten light and crystalline flame, ancient volcanic deities emerging from sacred crater temples with crowns of liquid gold and robes woven from volcanic glass threads, intricate lava flow patterns transformed into ornate decorative art motifs with filigree details in molten copper and bronze, volcanic energy visualized as flowing rivers of liquid starlight cascading down mountain slopes like celestial waterfalls, Ring of Fire archipelago rendered as cosmic mandala with each volcano a glowing jewel in divine geometric arrangement, sacred volcanic ash creating mystical atmospheric effects with particles of gold dust and silver mist swirling through dimensional portals, traditional Indonesian volcanic mythology brought to life through artistic interpretation with fire spirits dancing in ceremonial formations, volcanic landscapes transformed into surreal artistic compositions with crystalline lava formations and ethereal steam clouds, mystical volcanic temples carved from obsidian and volcanic glass with intricate relief sculptures telling stories of creation, volcanic fire spirits with flowing forms of molten energy and crowns of crystalline flame dancing through compositions, ancient Indonesian fire ceremonies visualized as artistic spectacles with offerings of gold and precious gems dissolving into volcanic energy, volcanic crater lakes transformed into mirrors of liquid mercury reflecting cosmic constellations and aurora-like phenomena, traditional volcanic art forms with elaborate patterns inspired by lava flow dynamics and crystalline mineral formations, mystical volcanic energy flowing through artistic landscapes like rivers of liquid light and ethereal fire, volcanic mountain spirits manifesting as towering figures of molten rock and crystalline flame with ornate decorative elements, sacred volcanic rituals transformed into artistic ceremonies with fire spirits and elemental beings, volcanic landscapes rendered as fantastical artistic realms with floating islands of volcanic glass and cascading waterfalls of liquid light, traditional Indonesian volcanic craftsmanship with intricate metalwork inspired by volcanic minerals and crystalline formations, hyperrealistic 8K artistic detail with dramatic volcanic lighting effects, volumetric atmospheric rendering showing mystical volcanic artistry and supernatural fire spirit manifestations",
    }

    if (scenarioPrompts[scenario]) {
      prompt += ", " + scenarioPrompts[scenario]
    }
  }

  // Add color scheme with stronger emphasis
  const colorPrompts: Record<string, string> = {
    plasma: "PLASMA COLOR PALETTE: vibrant electric plasma colors with bright blues, magentas, and electric purples",
    quantum: "QUANTUM COLOR PALETTE: quantum field colors with deep cosmic blues, ethereal whites, and silver tones",
    cosmic: "COSMIC COLOR PALETTE: deep space cosmic colors with rich purples, stellar golds, and nebula blues",
    thermal: "THERMAL COLOR PALETTE: thermal imaging heat colors with bright reds, oranges, and yellow heat signatures",
    spectral:
      "SPECTRAL COLOR PALETTE: full spectrum rainbow colors with prismatic light effects and chromatic brilliance",
    crystalline:
      "CRYSTALLINE COLOR PALETTE: crystal clear colors with gem tones, mineral blues, and prismatic refractions",
    bioluminescent:
      "BIOLUMINESCENT COLOR PALETTE: glowing organic colors with electric blues, neon greens, and phosphorescent tones",
    aurora: "AURORA COLOR PALETTE: aurora borealis colors with dancing greens, electric purples, and ethereal lights",
    metallic: "METALLIC COLOR PALETTE: metallic tones with silver, bronze, copper, and gold accents",
    prismatic: "PRISMATIC COLOR PALETTE: prismatic light effects with rainbow refractions and spectral dispersions",
    monochromatic: "MONOCHROMATIC COLOR PALETTE: grayscale tones with blacks, whites, and silver gradients",
    infrared: "INFRARED COLOR PALETTE: infrared heat colors with thermal reds, oranges, and heat signature yellows",
    lava: "LAVA COLOR PALETTE: molten lava colors with glowing reds, bright oranges, and volcanic yellows",
    futuristic: "FUTURISTIC COLOR PALETTE: cyberpunk neon colors with electric blues, hot pinks, and digital greens",
    forest: "FOREST COLOR PALETTE: natural forest colors with deep greens, earth browns, and woodland tones",
    ocean: "OCEAN COLOR PALETTE: oceanic colors with deep blues, aqua tones, and sea foam greens",
    sunset: "SUNSET COLOR PALETTE: warm sunset colors with bright oranges, deep reds, and golden yellows",
    arctic: "ARCTIC COLOR PALETTE: arctic colors with ice blues, pristine whites, and crystal clear tones",
    neon: "NEON COLOR PALETTE: bright electric neon colors with hot pinks, electric greens, and fluorescent blues",
    vintage: "VINTAGE COLOR PALETTE: aged sepia tones with warm browns, cream whites, and antique golds",
    toxic: "TOXIC COLOR PALETTE: radioactive colors with bright greens, electric yellows, and warning oranges",
    ember: "EMBER COLOR PALETTE: glowing ember colors with warm orange coals, red flames, and golden sparks",
    lunar: "LUNAR COLOR PALETTE: lunar surface colors with silver grays, crater shadows, and moonlight whites",
    tidal: "TIDAL COLOR PALETTE: tidal pool colors with ocean blues, sandy browns, and sea foam whites",
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
      domeDiameter,
      domeResolution,
      projectionType,
      panoramaResolution,
      panoramaFormat,
      stereographicPerspective,
    } = body

    // Build the main prompt
    const mainPrompt = buildPrompt(dataset, scenario, colorScheme, customPrompt)
    console.log("📝 Generated main prompt:", mainPrompt.substring(0, 200) + "...")
    console.log("📏 Prompt length:", mainPrompt.length, "characters")
    console.log("🎨 Color scheme applied:", colorScheme)
    console.log("🎭 Scenario applied:", scenario)

    // Special logging for Wayang Kulit
    if (dataset === "indonesian" && scenario === "wayang") {
      console.log("🎭 WAYANG KULIT SHADOW THEATRE MODE ACTIVATED")
      console.log("🎭 Indonesian dataset with wayang scenario")
      console.log("🎭 Focus: Shadow puppets, backstage puppeteers, no audience")
    }

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

    // ALWAYS generate dome projection for complete set
    console.log(`🏛️ Generating ${domeDiameter || 20}m dome projection with ${projectionType || "fisheye"} effect...`)
    generationDetails.domeImage = "Generating..."
    try {
      const domePrompt = generateDomePrompt(mainPrompt, domeDiameter, domeResolution, projectionType)
      console.log("📝 Generated dome prompt length:", domePrompt.length, "characters")
      console.log(
        "🏛️ Dome config: diameter =",
        domeDiameter || 20,
        "resolution =",
        domeResolution || "4K",
        "projection =",
        projectionType || "fisheye",
      )

      // Special logging for fisheye TUNNEL UP
      if ((projectionType || "fisheye") === "fisheye") {
        console.log("🐟 FISHEYE TUNNEL UP: Generating circular fisheye format with upward tunnel perspective")
        console.log("🐟 TUNNEL UP requirements: Circular frame, radial distortion, center-focused composition")
      }

      domeImageUrl = await callOpenAI(domePrompt)
      generationDetails.domeImage = `Generated successfully with ${projectionType || "fisheye"} effect`
      console.log(`✅ ${domeDiameter || 20}m dome ${projectionType || "fisheye"} projection generated successfully`)

      if ((projectionType || "fisheye") === "fisheye") {
        console.log("🐟 FISHEYE TUNNEL UP dome generation completed - should show circular fisheye format")
      }
    } catch (error: any) {
      console.error(`❌ ${domeDiameter || 20}m dome projection generation failed:`, error.message)
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
      console.log("📝 Generated panorama prompt length:", panoramaPrompt.length, "characters")
      console.log(
        "🌐 Panorama config: resolution =",
        panoramaResolution || "8K",
        "format =",
        panoramaFormat || "equirectangular",
        "perspective =",
        stereographicPerspective || "none",
      )
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
    console.log("🎨 Final color scheme verification:", colorScheme)
    console.log("🎭 Final scenario verification:", scenario)
    console.log(
      "🏛️ Final dome config verification: diameter =",
      domeDiameter || 20,
      "resolution =",
      domeResolution || "4K",
    )
    console.log(
      "🌐 Final panorama config verification: resolution =",
      panoramaResolution || "8K",
      "format =",
      panoramaFormat || "equirectangular",
    )

    // Special logging for Wayang Kulit completion
    if (dataset === "indonesian" && scenario === "wayang") {
      console.log("🎭 WAYANG KULIT SHADOW THEATRE GENERATION COMPLETED")
      console.log("🎭 All three versions should show shadow puppet theatre")
      console.log("🎭 Focus maintained: Shadows and backstage, no audience")
    }

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
