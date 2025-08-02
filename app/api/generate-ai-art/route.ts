import { type NextRequest, NextResponse } from "next/server"
import { generateDomePrompt, generatePanoramaPrompt, generateImagesInParallel, generateSingleImageOnly } from "./utils"

function buildUltraSimplePrompt(dataset: string, scenario: string, colorScheme: string, customPrompt?: string): string {
  // Use custom prompt if provided
  if (customPrompt && customPrompt.trim()) {
    return `${customPrompt.trim()}, ${colorScheme} colors, detailed`
  }

  // Ultra-simple dataset prompts
  const simpleDatasets: Record<string, string> = {
    nuanu: "Nuanu creative architecture",
    bali: "Balinese temples",
    thailand: "Thai temples",
    indonesian: "Indonesian culture",
    horror: "Indonesian mystical",
    spirals: "spiral patterns",
    fractal: "fractal art",
    mandelbrot: "Mandelbrot set",
    julia: "Julia fractals",
    lorenz: "Lorenz attractor",
    hyperbolic: "hyperbolic geometry",
    gaussian: "Gaussian fields",
    cellular: "cellular automata",
    voronoi: "Voronoi patterns",
    perlin: "Perlin noise",
    diffusion: "diffusion patterns",
    wave: "wave patterns",
    moons: "lunar mechanics",
    tribes: "tribal networks",
    heads: "mosaic heads",
    natives: "native tribes",
    statues: "sacred statues",
  }

  let prompt = simpleDatasets[dataset] || "abstract art"

  // Restore GODLEVEL Indonesian scenarios - keep rich prompts for key scenarios
  if (dataset === "indonesian") {
    const scenarioPrompts: Record<string, string> = {
      pure: "geometric patterns",
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
        "GODLEVEL PROMPT: New Guinea indigenous Asmat people renowned worldwide for intricate wood carvings, traditional bis poles and ancestor sculptures reaching toward sky like prayers to ancestral spirits, elaborate ceremonial masks and shields with supernatural power, traditional cultural practices and ceremonial displays, sago palm cultivation and processing providing staple food in swampy environment, traditional houses on stilts built over tidal areas, spiritual beliefs connecting ancestors and nature in continuous cycle, traditional music and dance ceremonies honoring ancestral spirits, river-based transportation and settlements with traditional canoes, oral traditions and mythology explaining creation and tribal history, artistic heritage recognized worldwide with museums collecting Asmat art, traditional tools and carving techniques passed down through master-apprentice relationships, ceremonial feasts celebrating cultural achievements, traditional initiation ceremonies for young people, hyperrealistic 8K art documentation showing master woodcarvers at work with intricate detail of traditional sculptures and atmospheric swamp environment, master craftsmen carving sacred bis poles from ironwood trees, intricate ancestral figures emerging from raw timber through skilled hands, ceremonial shields decorated with protective spirits and clan totems, traditional carving tools made from cassowary bones and wild boar tusks, swampy mangrove environment with traditional stilt houses reflecting in dark waters, spiritual connection between carver and ancestral spirits guiding every cut, UNESCO recognized artistic tradition preserving ancient Papuan culture, museum-quality sculptures representing thousands of years of artistic evolution, sacred men's houses displaying trophy skulls and ceremonial artifacts, traditional sago processing by women while men focus on sacred carving work, river ceremonies where finished sculptures are blessed by tribal elders, artistic mastery passed down through generations of master woodcarvers, each carving telling stories of creation myths and heroic ancestors",
    }

    if (scenarioPrompts[scenario]) {
      prompt = scenarioPrompts[scenario]
    }
  }

  // Simple colors
  const simpleColors: Record<string, string> = {
    plasma: "plasma colors",
    quantum: "quantum blue",
    cosmic: "cosmic purple",
    thermal: "thermal red",
    spectral: "rainbow",
    crystalline: "crystal clear",
    bioluminescent: "glowing blue",
    aurora: "aurora green",
    metallic: "metallic",
    prismatic: "prismatic",
    monochromatic: "grayscale",
    infrared: "infrared",
    lava: "lava red",
    futuristic: "neon",
    forest: "forest green",
    ocean: "ocean blue",
    sunset: "sunset orange",
    arctic: "arctic blue",
    neon: "neon bright",
    vintage: "vintage sepia",
    toxic: "toxic green",
    ember: "ember orange",
    lunar: "lunar gray",
    tidal: "tidal blue",
  }

  return `${prompt}, ${simpleColors[colorScheme] || "vibrant"}, detailed, 8K`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("🎨 AI Art API called - Format-Specific Dome & Panorama Generation")

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
      singleImageMode = false,
      generationMode = "auto",
    } = body

    // Build prompt with GODLEVEL scenarios restored
    const mainPrompt = buildUltraSimplePrompt(dataset, scenario, colorScheme, customPrompt)
    console.log("📝 Prompt:", mainPrompt.substring(0, 200) + "...")
    console.log("📏 Prompt length:", mainPrompt.length, "characters")

    const isGodLevel = mainPrompt.includes("GODLEVEL PROMPT:")
    const isAsmat = scenario === "asmat"

    // Only use single image mode if explicitly requested or for extremely long prompts
    const shouldUseSingleMode = singleImageMode || generationMode === "single" || mainPrompt.length > 3000

    if (shouldUseSingleMode) {
      console.log("🖼️ Single image mode - explicitly requested or extremely long prompt")
      try {
        const result = await generateSingleImageOnly(mainPrompt)

        return NextResponse.json({
          success: true,
          image: result.mainImage,
          domeImage: result.domeImage,
          panoramaImage: result.panoramaImage,
          originalPrompt: mainPrompt,
          promptLength: mainPrompt.length,
          provider: "OpenAI",
          model: "DALL-E 3",
          estimatedFileSize: "~2-4MB",
          generationMethod: result.method,
          generationDetails: {
            mainImage: "Generated successfully",
            domeImage: "Using main image for speed",
            panoramaImage: "Using main image for speed",
            note: "Single image mode - explicitly requested",
          },
          parameters: {
            dataset,
            scenario,
            colorScheme,
            singleImageMode: true,
            explicitSingleMode: true,
          },
        })
      } catch (error: any) {
        console.error("❌ Single image generation failed:", error.message)

        return NextResponse.json(
          {
            success: false,
            error: "Image generation failed",
            details: error.message,
            generationMethod: "single_failed",
            suggestion: "OpenAI API may be experiencing issues. Please try again.",
            troubleshooting: {
              issue: "API Error",
              cause: error.message.includes("503")
                ? "OpenAI service temporarily unavailable"
                : error.message.includes("429")
                  ? "Rate limit exceeded"
                  : error.message.includes("DEPLOYMENT_TIMEOUT")
                    ? "Deployment timeout"
                    : "API error",
              solutions: [
                "Try again in a few moments",
                "OpenAI may be experiencing high load",
                "Contact support if issue persists",
              ],
            },
          },
          { status: error.message.includes("DEPLOYMENT_TIMEOUT") ? 408 : 503 },
        )
      }
    }

    // Try format-specific parallel generation with extended timeouts
    console.log(`⚡ Attempting ${isGodLevel ? "GODLEVEL" : "standard"} parallel generation with proper formatting...`)
    try {
      const domePrompt = generateDomePrompt(mainPrompt)
      const panoramaPrompt = generatePanoramaPrompt(mainPrompt)

      console.log("🏛️ Dome prompt format check:", domePrompt.includes("FISHEYE") ? "✅ FISHEYE" : "❌ Missing FISHEYE")
      console.log(
        "🌐 Panorama prompt format check:",
        panoramaPrompt.includes("EQUIRECTANGULAR") ? "✅ EQUIRECTANGULAR" : "❌ Missing EQUIRECTANGULAR",
      )

      // Extended timeout for GODLEVEL prompts, especially Asmat
      const totalTimeout = isGodLevel ? (isAsmat ? 40000 : 35000) : 25000 // 40s for Asmat, 35s for other GODLEVEL, 25s for simple

      const parallelResults = (await Promise.race([
        generateImagesInParallel(mainPrompt, domePrompt, panoramaPrompt),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Parallel timeout")), totalTimeout)),
      ])) as Awaited<ReturnType<typeof generateImagesInParallel>>

      // Check if we got at least the main image
      if (parallelResults.mainImage) {
        console.log("✅ Parallel generation successful!")

        // Count successful generations
        const successCount = [
          parallelResults.mainImage,
          parallelResults.domeImage,
          parallelResults.panoramaImage,
        ].filter(Boolean).length

        return NextResponse.json({
          success: true,
          image: parallelResults.mainImage,
          domeImage: parallelResults.domeImage || parallelResults.mainImage,
          panoramaImage: parallelResults.panoramaImage || parallelResults.mainImage,
          originalPrompt: mainPrompt,
          promptLength: mainPrompt.length,
          provider: "OpenAI",
          model: "DALL-E 3",
          estimatedFileSize: "~2-4MB",
          generationMethod: isGodLevel ? "godlevel_parallel_formatted" : "standard_parallel_formatted",
          generationDetails: {
            mainImage: "Generated successfully",
            domeImage: parallelResults.domeImage ? "Generated with fisheye formatting" : "Using main image fallback",
            panoramaImage: parallelResults.panoramaImage
              ? "Generated with equirectangular formatting"
              : "Using main image fallback",
            errors: parallelResults.errors,
            successCount: `${successCount}/3 images generated`,
            note: isGodLevel
              ? "GODLEVEL parallel generation with format-specific dome and panorama prompts"
              : "Standard parallel generation with proper formatting",
            formatChecks: {
              domeFormatting: domePrompt.includes("FISHEYE")
                ? "✅ Fisheye formatting applied"
                : "❌ Missing fisheye formatting",
              panoramaFormatting: panoramaPrompt.includes("EQUIRECTANGULAR")
                ? "✅ Equirectangular formatting applied"
                : "❌ Missing equirectangular formatting",
            },
          },
          parameters: {
            dataset,
            scenario,
            colorScheme,
            seed,
            numSamples,
            noiseScale: noise,
            timeStep,
            domeProjection: !!parallelResults.domeImage,
            domeDiameter,
            domeResolution,
            projectionType: "fisheye",
            panoramic360: !!parallelResults.panoramaImage,
            panoramaResolution,
            panoramaFormat: "equirectangular",
            stereographicPerspective,
            godlevelMode: isGodLevel,
            asmatMode: isAsmat,
            extendedTimeout: totalTimeout,
            formatSpecific: true,
          },
        })
      } else {
        throw new Error("No main image generated")
      }
    } catch (error: any) {
      console.log("⚠️ Parallel generation failed, falling back to single image:", error.message)

      // Final fallback - single image only
      try {
        const result = await generateSingleImageOnly(mainPrompt)

        return NextResponse.json({
          success: true,
          image: result.mainImage,
          domeImage: result.domeImage,
          panoramaImage: result.panoramaImage,
          originalPrompt: mainPrompt,
          promptLength: mainPrompt.length,
          provider: "OpenAI",
          model: "DALL-E 3",
          estimatedFileSize: "~2-4MB",
          generationMethod: "emergency_single",
          generationDetails: {
            mainImage: "Generated successfully",
            domeImage: "Using main image (emergency fallback)",
            panoramaImage: "Using main image (emergency fallback)",
            errors: [`Parallel failed: ${error.message}`],
            note: "Emergency single image mode due to parallel failure",
          },
          parameters: {
            dataset,
            scenario,
            colorScheme,
            emergencyMode: true,
          },
        })
      } catch (finalError: any) {
        console.error("❌ All generation methods failed:", finalError.message)

        return NextResponse.json(
          {
            success: false,
            error: "All generation methods failed",
            details: finalError.message,
            timestamp: new Date().toISOString(),
            generationMethod: "all_failed",
            troubleshooting: {
              issue: "Complete API Failure",
              cause: finalError.message.includes("503")
                ? "OpenAI service unavailable"
                : finalError.message.includes("429")
                  ? "Rate limit exceeded"
                  : finalError.message.includes("DEPLOYMENT_TIMEOUT")
                    ? "Deployment timeout"
                    : "Unknown API error",
              solutions: [
                "OpenAI API is experiencing issues",
                "Try again in a few minutes",
                "Check OpenAI status page",
                "Contact support if issue persists",
              ],
            },
          },
          { status: finalError.message.includes("DEPLOYMENT_TIMEOUT") ? 408 : 503 },
        )
      }
    }
  } catch (error: any) {
    console.error("❌ Route handler error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Request processing failed",
        details: error.message,
        timestamp: new Date().toISOString(),
        generationMethod: "request_failed",
      },
      { status: 500 },
    )
  }
}
