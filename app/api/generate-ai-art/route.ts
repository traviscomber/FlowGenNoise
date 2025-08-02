import { type NextRequest, NextResponse } from "next/server"
import {
  generateDomePrompt,
  generatePanoramaPrompt,
  generateImagesInParallel,
  generateImagesWithQueue,
  generateSingleImage,
  generateOptimizedPrompt,
} from "./utils"

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
        "Majestic Garuda Wisnu Kencana soaring through celestial realms, massive divine eagle with wingspan across golden sunset skies, intricate feather details with ethereal light, powerful talons gripping sacred lotus blossoms, noble eagle head crowned with jeweled diadem, eyes blazing with cosmic wisdom, Lord Vishnu mounted upon Garuda's back in divine regalia with four arms holding sacred conch shell, discus wheel of time, lotus of creation, ceremonial staff, flowing silk garments in royal blues and golds, Mount Meru rising with cascading waterfalls of liquid starlight, temple spires through clouds of incense, Indonesian archipelago spread below like scattered emeralds in sapphire seas, Ring of Fire volcanoes glowing with sacred flames, traditional gamelan music as golden sound waves, ancient Sanskrit mantras as luminous script, Ramayana epic scenes in floating stone tablets, divine aura radiating rainbow light spectrum, cosmic mandala patterns swirling in heavens, 17,508 islands visible as points of light, Borobudur and Prambanan temples glowing with spiritual energy, traditional Indonesian textiles woven into reality fabric",
      wayang:
        "Mystical Wayang Kulit shadow puppet performance bringing ancient Ramayana and Mahabharata epics to life, master dalang puppeteer silhouetted behind glowing white screen with intricately carved leather puppets, masterwork perforated artistry with gold leaf details catching flickering oil lamp light, dramatic shadows dancing into living characters, Prince Rama with noble features and ornate crown alongside Princess Sita with flowing hair and delicate jewelry, mighty Hanuman the white monkey hero leaping through air with mountain in grasp, gamelan orchestra creating visible sound waves in metallic gold and silver, traditional Indonesian musicians in batik clothing playing gender, saron, kendang drums, audience sitting cross-legged on woven mats mesmerized by eternal stories, coconut oil lamps casting warm amber light creating multiple shadow layers, ancient Javanese script floating in air telling story, tropical night sky with stars and flying spirits, traditional Javanese architecture with carved wooden pillars and clay tile roofs, incense smoke curling upward carrying prayers to ancestors, banana leaves and frangipani flowers as offerings, cultural heritage spanning over 1000 years as golden threads connecting past to present",
      batik:
        "Infinite cosmic tapestry of sacred Indonesian batik patterns coming alive with supernatural energy, master batik artisan applying hot wax with traditional canting tool creating flowing lines transforming into living rivers of light, parang rusak diagonal patterns representing flowing water and eternal life force undulating like ocean waves, kawung geometric circles symbolizing cosmic order expanding into mandala formations pulsing with universal rhythm, mega mendung cloud motifs in deep indigo blues swirling with actual storm clouds and lightning, ceplok star formations bursting into real constellations, sido mukti prosperity symbols manifesting as golden coins and rice grains falling like blessed rain, royal court designs with protective meanings creating shields of light around ancient Javanese palaces, intricate hand-drawn patterns using traditional canting tools guided by ancestral spirits, natural dyes from indigo plants, turmeric roots, mahogany bark creating earth tones shifting like living skin, cultural identity woven into fabric of reality itself, UNESCO heritage craft mastery passed down through generations, each pattern telling stories of creation myths and heroic legends, textile becoming portal to spiritual realm where ancestors dance in eternal celebration",
      borobudur:
        "Abstract mathematical mandala compositions with infinite geometric recursion, concentric circular patterns expanding outward in perfect mathematical harmony, three-dimensional geometric forms creating ascending spiral mathematics, bell-shaped mathematical curves and meditation circle equations integrated into cosmic algorithmic patterns, thousands of interconnected geometric panels showing mathematical sequences and numerical progressions rendered in abstract computational art style, serene mathematical equilibrium and golden ratio proportions becoming living geometric algorithms, multi-layered mandala mathematics with circular platforms representing different dimensional spaces, ancient geometric principles manifested in pure mathematical visualization, abstract mathematical textures with algorithmic complexity and fractal iterations, sacred geometry equations manifested in computational art forms, mathematical cosmology visualized through geometric algorithmic arrangements, classical mathematical sculpture aesthetics rendered in pure abstract form",
      komodo:
        "Mystical dragon-inspired artistic tapestry with ancient Indonesian mythological elements, legendary dragon spirits manifesting as flowing artistic forms with serpentine grace and ethereal beauty, ornate dragon scale patterns transformed into decorative art motifs with intricate golden filigree and jeweled textures, mythical dragon essence captured in traditional Indonesian artistic style with batik-inspired flowing patterns, ancient dragon legends visualized through artistic interpretation with ceremonial masks and totemic sculptures, dragon-inspired textile designs with elaborate patterns reminiscent of royal court artistry, mystical dragon energy flowing through artistic compositions like liquid gold and precious gems, traditional Indonesian dragon mythology brought to life through artistic mastery, ornate dragon motifs integrated into temple art and ceremonial decorations, artistic dragon forms dancing through compositions with supernatural elegance",
      dance:
        "Abstract mathematical choreography patterns with infinite algorithmic recursion, parametric equations describing graceful movement trajectories through three-dimensional space, mathematical visualization of rhythmic patterns and temporal sequences rendered in pure computational art style, algorithmic interpretation of synchronized movement creating geometric mandala formations, mathematical modeling of dance formations using coordinate geometry and spatial transformations, abstract computational art inspired by choreographic mathematics and movement algorithms, geometric visualization of musical rhythm patterns through mathematical wave functions and harmonic analysis, algorithmic dance patterns with fractal recursion and mathematical precision",
      volcanoes:
        "Mystical volcanic artistry with supernatural Indonesian fire spirits manifesting as ethereal beings of molten light and crystalline flame, ancient volcanic deities emerging from sacred crater temples with crowns of liquid gold and robes woven from volcanic glass threads, intricate lava flow patterns transformed into ornate decorative art motifs with filigree details in molten copper and bronze, volcanic energy visualized as flowing rivers of liquid starlight cascading down mountain slopes like celestial waterfalls, Ring of Fire archipelago rendered as cosmic mandala with each volcano a glowing jewel in divine geometric arrangement, sacred volcanic ash creating mystical atmospheric effects with particles of gold dust and silver mist swirling through dimensional portals",
      temples:
        "Abstract mathematical temple architecture with infinite geometric recursion and sacred algorithmic patterns, multi-tiered mathematical structures ascending through dimensional space using golden ratio proportions and Fibonacci spiral staircases, intricate geometric relief carvings depicting mathematical equations and algorithmic sequences rendered in pure computational art style, ceremonial mathematical gates adorned with fractal guardian patterns and geometric protective algorithms, lotus pond reflections creating perfect mathematical mirror symmetries and infinite recursive reflections, algorithmic incense patterns rising as mathematical smoke functions carrying computational prayers through dimensional portals",
      javanese:
        "Magnificent Javanese royal court of Yogyakarta Sultan's palace with refined traditions spanning centuries, elaborate batik patterns with philosophical meanings covering silk garments of court nobles, gamelan orchestras creating meditative soundscapes with bronze instruments channeling ancestral spirits, traditional Javanese architecture with joglo roofs and carved wooden pillars telling stories of ancient kingdoms, shadow puppet wayang performances in royal courtyards where dalang masters weave epic tales of gods and heroes, ancient Hindu-Buddhist influences merged with Islamic culture creating unique Javanese synthesis, terraced rice cultivation creating geometric patterns across volcanic landscapes",
      sundanese:
        "West Java's indigenous Sundanese people with distinct cultural identity thriving in mountainous terrain, traditional bamboo architecture with elevated houses on stilts protecting from floods and providing ventilation, angklung bamboo musical instruments creating harmonious melodies echoing through mountain valleys, traditional Sundanese dance performances with graceful movements inspired by nature, rice cultivation in mountainous terrain creating spectacular terraced landscapes, unique culinary traditions with fresh vegetables and fish from mountain streams, traditional clothing and textiles with intricate patterns and natural dyes",
      batak:
        "North Sumatra highland Batak people with distinctive architecture around magnificent Lake Toba, traditional Batak houses with dramatic curved roofs resembling buffalo horns reaching toward sky, intricate wood carvings and decorative elements telling clan histories and spiritual beliefs, traditional ulos textiles with sacred meanings woven by master craftswomen, patrilineal clan system and ancestral worship connecting living descendants to powerful spirits, Lake Toba cultural landscape with world's largest volcanic lake surrounded by traditional villages",
      dayak:
        "Indigenous Dayak peoples of Kalimantan Borneo with diverse sub-groups living in harmony with rainforest, traditional longhouses accommodating extended families with communal living spaces stretching hundreds of feet, intricate beadwork and traditional costumes with patterns representing clan identity and spiritual protection, traditional cultural practices and ceremonial displays, river-based transportation and settlements with traditional boats navigating jungle waterways, traditional tattoos with spiritual significance covering bodies with protective symbols",
      acehnese:
        "Northernmost Sumatra Acehnese province with strong Islamic identity and proud cultural tradition, traditional Acehnese architecture with Islamic influences showing Middle Eastern and local fusion, distinctive cultural practices and ceremonies blending Islamic faith with local customs, traditional Saman dance performances with dozens of dancers in perfect synchronization, coffee cultivation and trade traditions making Aceh famous for premium coffee beans, community resilience and strength shown through cultural preservation",
      minangkabau:
        "West Sumatra Minangkabau people with unique matrilineal social structure where women hold property and family lineage, distinctive rumah gadang houses with dramatic horn-shaped roofs resembling buffalo horns reaching toward sky, traditional Minang cuisine and culinary heritage famous throughout Indonesia and Malaysia, matriarchal inheritance and family systems where mothers pass property to daughters, traditional ceremonies and adat customs governing social behavior and community harmony",
      "balinese-tribe":
        "Bali island people with distinct Hindu-Dharma religion creating paradise of temples and ceremonies, elaborate temple ceremonies and festivals with thousands of devotees in colorful traditional dress, traditional Balinese architecture and sculpture with intricate stone carvings, intricate wood and stone carvings depicting Hindu mythology and local legends, traditional dance and music performances bringing Hindu epics to life, rice terrace agriculture and subak irrigation system creating spectacular landscapes",
      papuans:
        "New Guinea indigenous peoples with incredible cultural diversity representing hundreds of distinct tribes, traditional houses on stilts and tree houses built high above ground for protection, elaborate feathered headdresses and body decorations using bird of paradise plumes, hundreds of distinct languages and dialects making Papua most linguistically diverse region on Earth, traditional hunting and gathering practices using bows, arrows, and traditional tools",
      baduy:
        "Banten Java Baduy tribe maintaining strict traditional lifestyle in harmony with nature, traditional white and black clothing distinctions marking inner (Baduy Dalam) and outer (Baduy Luar) communities, sustainable agriculture without chemicals or modern tools preserving ancient farming methods, traditional houses without electricity, running water, or modern conveniences, oral tradition and customary law (pikukuh) governing every aspect of daily life, forest conservation and environmental protection as sacred duty",
      "orang-rimba":
        "Sumatra nomadic forest dwellers known as Kubu people living deep in rainforest, traditional forest shelters built from natural materials and relocated when moving to new areas, hunting and gathering traditional practices using traditional tools and forest knowledge, shamanic spiritual beliefs and forest spirits guiding daily life, traditional medicine using forest plants and spiritual healing practices, oral traditions and forest knowledge passed down through generations",
      "hongana-manyawa":
        "One of Indonesia's last nomadic forest-dwelling tribes living in remote rainforest areas of Halmahera island, traditional forest shelters and nomadic lifestyle moving seasonally through ancestral territories, traditional practices using tools made from forest materials, gathering forest foods and medicines using ancient knowledge, shamanic spiritual practices connecting human world to forest spirits, oral traditions and forest knowledge preserved through generations, traditional social organization based on kinship and forest territories, unique language and cultural practices distinct from outside world, adaptation to tropical rainforest with intimate ecological knowledge",
      asmat:
        "New Guinea indigenous Asmat people renowned worldwide for intricate wood carvings, traditional bis poles and ancestor sculptures reaching toward sky like prayers to ancestral spirits, elaborate ceremonial masks and shields with spiritual power, traditional cultural practices and ceremonial displays, sago palm cultivation and processing providing staple food in swampy environment, traditional houses on stilts built over tidal areas, spiritual beliefs connecting ancestors and nature in continuous cycle",
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
      domeDiameter = 20,
      domeResolution = "4K",
      projectionType = "fisheye",
      panoramaResolution = "8K",
      panoramaFormat = "equirectangular",
      stereographicPerspective,
      singleImageMode = false, // New parameter for single image mode
      generationMode = "auto", // auto, parallel, queue, single
    } = body

    // Build the main prompt
    const mainPrompt = buildPrompt(dataset, scenario, colorScheme, customPrompt)
    console.log("📝 Generated main prompt:", mainPrompt.substring(0, 200) + "...")
    console.log("📏 Main prompt length:", mainPrompt.length, "characters")

    // Optimize main prompt to prevent timeouts
    const optimizedMainPrompt = generateOptimizedPrompt(mainPrompt, 3500)

    // Single image mode - fastest option
    if (singleImageMode || generationMode === "single") {
      console.log("🖼️ Single image mode activated")
      try {
        const singleImage = await generateSingleImage(optimizedMainPrompt)

        return NextResponse.json({
          success: true,
          image: singleImage,
          domeImage: singleImage, // Use same image for all formats
          panoramaImage: singleImage,
          originalPrompt: mainPrompt,
          optimizedPrompt: optimizedMainPrompt,
          promptLength: optimizedMainPrompt.length,
          provider: "OpenAI",
          model: "DALL-E 3",
          estimatedFileSize: "~2-4MB",
          generationMethod: "single",
          generationDetails: {
            mainImage: "Generated successfully",
            domeImage: "Using main image",
            panoramaImage: "Using main image",
            optimizations: "Prompt optimized for speed",
          },
          parameters: {
            dataset,
            scenario,
            colorScheme,
            seed,
            numSamples,
            noiseScale: noise,
            timeStep,
            domeProjection: false,
            domeDiameter,
            domeResolution,
            projectionType,
            panoramic360: false,
            panoramaResolution,
            panoramaFormat,
            stereographicPerspective,
            singleImageMode: true,
          },
        })
      } catch (error: any) {
        console.error("❌ Single image generation failed:", error.message)
        return NextResponse.json(
          {
            success: false,
            error: "Single image generation failed: " + error.message,
            promptLength: optimizedMainPrompt.length,
            generationMethod: "single_failed",
          },
          { status: 500 },
        )
      }
    }

    // Generate dome and panorama prompts
    const domePrompt = generateDomePrompt(optimizedMainPrompt, domeDiameter, domeResolution, projectionType)
    const panoramaPrompt = generatePanoramaPrompt(
      optimizedMainPrompt,
      panoramaResolution,
      panoramaFormat,
      stereographicPerspective,
    )

    console.log("📏 Optimized main prompt length:", optimizedMainPrompt.length, "characters")
    console.log("📏 Dome prompt length:", domePrompt.length, "characters")
    console.log("📏 Panorama prompt length:", panoramaPrompt.length, "characters")

    // Determine generation strategy
    let results: any
    let generationMethod = "unknown"

    if (generationMode === "queue") {
      // Queue mode - most reliable
      console.log("🔄 Queue generation mode activated")
      try {
        results = await generateImagesWithQueue(optimizedMainPrompt, domePrompt, panoramaPrompt)
        generationMethod = "queue"
      } catch (error: any) {
        console.error("❌ Queue generation failed:", error.message)
        throw error
      }
    } else if (generationMode === "parallel") {
      // Parallel mode - fastest but risky
      console.log("⚡ Parallel generation mode activated")
      try {
        const parallelResults = (await Promise.race([
          generateImagesInParallel(optimizedMainPrompt, domePrompt, panoramaPrompt),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Parallel timeout")), 25000)),
        ])) as Awaited<ReturnType<typeof generateImagesInParallel>>

        if (parallelResults.mainImage) {
          results = {
            mainImage: parallelResults.mainImage,
            domeImage: parallelResults.domeImage || parallelResults.mainImage,
            panoramaImage: parallelResults.panoramaImage || parallelResults.mainImage,
            errors: parallelResults.errors,
            method: "parallel",
          }
          generationMethod = "parallel"
        } else {
          throw new Error("Parallel generation failed - no main image")
        }
      } catch (error: any) {
        console.log("⚠️ Parallel generation failed, falling back to queue:", error.message)
        results = await generateImagesWithQueue(optimizedMainPrompt, domePrompt, panoramaPrompt)
        generationMethod = "queue_fallback"
      }
    } else {
      // Auto mode - try parallel first, then queue
      console.log("🤖 Auto generation mode - trying parallel first...")
      try {
        const parallelResults = (await Promise.race([
          generateImagesInParallel(optimizedMainPrompt, domePrompt, panoramaPrompt),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Parallel timeout")), 20000)),
        ])) as Awaited<ReturnType<typeof generateImagesInParallel>>

        if (parallelResults.mainImage) {
          results = {
            mainImage: parallelResults.mainImage,
            domeImage: parallelResults.domeImage || parallelResults.mainImage,
            panoramaImage: parallelResults.panoramaImage || parallelResults.mainImage,
            errors: parallelResults.errors,
            method: "parallel",
          }
          generationMethod = "parallel"
          console.log("✅ Parallel generation successful!")
        } else {
          throw new Error("Parallel generation failed - no main image")
        }
      } catch (error: any) {
        console.log("⚠️ Parallel generation failed, falling back to queue:", error.message)
        try {
          results = await generateImagesWithQueue(optimizedMainPrompt, domePrompt, panoramaPrompt)
          generationMethod = "queue_fallback"
        } catch (queueError: any) {
          console.error("❌ Queue generation also failed:", queueError.message)

          // Final fallback - single image only
          console.log("🆘 Final fallback - generating single image only")
          const singleImage = await generateSingleImage(optimizedMainPrompt)

          return NextResponse.json({
            success: true,
            image: singleImage,
            domeImage: singleImage,
            panoramaImage: singleImage,
            originalPrompt: mainPrompt,
            optimizedPrompt: optimizedMainPrompt,
            promptLength: optimizedMainPrompt.length,
            provider: "OpenAI",
            model: "DALL-E 3",
            estimatedFileSize: "~2-4MB",
            generationMethod: "emergency_single",
            generationDetails: {
              mainImage: "Generated successfully",
              domeImage: "Using main image (fallback)",
              panoramaImage: "Using main image (fallback)",
              errors: [`Queue failed: ${queueError.message}`],
              note: "Emergency single image mode due to timeout issues",
            },
            parameters: {
              dataset,
              scenario,
              colorScheme,
              seed,
              numSamples,
              noiseScale: noise,
              timeStep,
              domeProjection: false,
              domeDiameter,
              domeResolution,
              projectionType,
              panoramic360: false,
              panoramaResolution,
              panoramaFormat,
              stereographicPerspective,
            },
          })
        }
      }
    }

    // Return successful response
    const response = {
      success: true,
      image: results.mainImage,
      domeImage: results.domeImage,
      panoramaImage: results.panoramaImage,
      originalPrompt: mainPrompt,
      optimizedPrompt: optimizedMainPrompt,
      promptLength: optimizedMainPrompt.length,
      provider: "OpenAI",
      model: "DALL-E 3",
      estimatedFileSize: "~2-4MB",
      generationMethod,
      generationDetails: {
        mainImage: results.mainImage ? "Generated successfully" : "Failed",
        domeImage: results.domeImage
          ? results.domeImage === results.mainImage
            ? "Using main image as fallback"
            : `Generated successfully with ${domeDiameter}m TUNNEL UP effect`
          : "Failed",
        panoramaImage: results.panoramaImage
          ? results.panoramaImage === results.mainImage
            ? "Using main image as fallback"
            : `Generated successfully at ${panoramaResolution} resolution`
          : "Failed",
        errors: results.errors || [],
        optimizations: "Prompt optimized to prevent timeouts",
      },
      parameters: {
        dataset,
        scenario,
        colorScheme,
        seed,
        numSamples,
        noiseScale: noise,
        timeStep,
        domeProjection: results.domeImage !== results.mainImage,
        domeDiameter,
        domeResolution,
        projectionType,
        panoramic360: results.panoramaImage !== results.mainImage,
        panoramaResolution,
        panoramaFormat,
        stereographicPerspective,
        generationMode,
      },
    }

    console.log(`✅ Returning successful response via ${generationMethod}`)
    return NextResponse.json(response)
  } catch (error: any) {
    console.error("❌ AI Art generation error:", error)

    // Handle deployment timeout specifically
    if (error.message.includes("DEPLOYMENT_TIMEOUT")) {
      return NextResponse.json(
        {
          success: false,
          error: "Generation timed out due to deployment limits. Try single image mode or reduce complexity.",
          details:
            "The function execution exceeded the deployment time limit. Consider using single image mode for faster generation.",
          timestamp: new Date().toISOString(),
          generationMethod: "timeout_failed",
          suggestion: "Use single image mode or reduce prompt complexity",
        },
        { status: 408 }, // Request Timeout
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate AI art",
        details: error.stack,
        timestamp: new Date().toISOString(),
        generationMethod: "failed",
      },
      { status: 500 },
    )
  }
}
