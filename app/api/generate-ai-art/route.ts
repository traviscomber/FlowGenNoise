import { type NextRequest, NextResponse } from "next/server"
import {
  generateDomePrompt,
  generatePanoramaPrompt,
  generateImagesInParallel,
  generateSingleImageOnly,
  cleanPromptForImageGeneration,
} from "./utils"

const enhancedColors: Record<string, string> = {
  plasma: "vibrant plasma energy colors with electric blues and magenta",
  quantum: "quantum field colors with deep blues and ethereal white",
  cosmic: "cosmic nebula colors with deep purples and stellar gold",
  thermal: "thermal spectrum colors with intense reds and orange gradients",
  spectral: "full spectrum rainbow colors with prismatic light effects",
  crystalline: "crystal clear colors with diamond white and ice blue",
  bioluminescent: "bioluminescent colors with glowing blues and greens",
  aurora: "aurora borealis colors with dancing greens and blues",
  metallic: "metallic colors with chrome, gold, and silver reflections",
  prismatic: "prismatic colors with rainbow light refraction",
  monochromatic: "sophisticated grayscale with dramatic contrast",
  infrared: "infrared spectrum colors with deep reds",
  lava: "molten lava colors with intense reds and volcanic glow",
  futuristic: "futuristic neon colors with electric blues and cyan",
  forest: "forest colors with emerald greens and earth browns",
  ocean: "ocean colors with deep blues and turquoise",
  sunset: "sunset colors with golden orange and pink",
  arctic: "arctic colors with ice blues and crystal white",
  neon: "neon bright colors with electric intensity",
  vintage: "vintage colors with warm sepia and amber",
  toxic: "toxic colors with radioactive greens",
  ember: "ember colors with glowing orange and red",
  lunar: "lunar colors with silver gray and moonlight white",
  tidal: "tidal colors with ocean blues and foam white",
}

function buildEnhancedModernPrompt(
  dataset: string,
  scenario: string,
  colorScheme: string,
  customPrompt?: string,
): string {
  // Use custom prompt if provided, but enhance it carefully
  if (customPrompt && customPrompt.trim()) {
    const basePrompt = customPrompt.trim()
    const colorPalette = enhancedColors[colorScheme] || "vibrant color palette"
    const enhancement = ", hyperrealistic 8K digital art masterpiece, cinematic lighting"

    // Check length and truncate if needed
    const maxBaseLength = 4000 - colorPalette.length - enhancement.length - 50
    const truncatedBase =
      basePrompt.length > maxBaseLength ? basePrompt.substring(0, maxBaseLength) + "..." : basePrompt

    return cleanPromptForImageGeneration(`${truncatedBase}, ${colorPalette}${enhancement}`)
  }

  // Enhanced modern dataset prompts (more concise versions)
  const enhancedDatasets: Record<string, string> = {
    nuanu:
      "Futuristic Nuanu creative city with crystalline architecture, holographic installations, floating structures",
    bali: "Mystical Balinese temple complex with golden hour lighting, intricate carvings, tropical paradise",
    thailand: "Magnificent Thai temple architecture with ornate golden details, dramatic sunset lighting",
    indonesian: "Breathtaking Indonesian cultural landscape with volcanic mountains, emerald rice terraces",
    horror: "Dark mystical Indonesian supernatural realm with ethereal spirits, haunting beauty",
    spirals: "Mesmerizing mathematical spiral patterns with golden ratio geometry, dynamic flow",
    fractal: "Intricate fractal art with infinite detail, recursive patterns, mathematical beauty",
    mandelbrot: "Spectacular Mandelbrot set visualization with infinite zoom, psychedelic colors",
    julia: "Elegant Julia set fractals with delicate structures, complex mathematical beauty",
    lorenz: "Dynamic Lorenz attractor visualization with chaotic beauty, flowing trajectories",
    hyperbolic: "Stunning hyperbolic geometry with impossible perspectives, mathematical beauty",
    gaussian: "Beautiful Gaussian field visualization with smooth gradients, statistical beauty",
    cellular: "Complex cellular automata patterns with emergent behavior, algorithmic beauty",
    voronoi: "Elegant Voronoi diagram patterns with organic cell structures, natural tessellation",
    perlin: "Smooth Perlin noise landscapes with organic flow, natural patterns",
    diffusion: "Mesmerizing reaction-diffusion patterns with organic growth, chemical beauty",
    wave: "Spectacular wave interference patterns with fluid dynamics, harmonic beauty",
    moons: "Celestial lunar orbital mechanics with gravitational beauty, cosmic dance",
    tribes: "Vibrant tribal network topology with cultural connections, social patterns",
    heads: "Artistic mosaic head compositions with portrait gallery, human diversity",
    natives: "Traditional native tribal culture with authentic heritage, ceremonial beauty",
    statues: "Magnificent sacred sculptural statues with artistic mastery, cultural significance",
  }

  let prompt = enhancedDatasets[dataset] || "abstract digital art masterpiece"

  // Optimized Indonesian Genesis Creation Story with length control
  if (dataset === "indonesian") {
    const optimizedScenarioPrompts: Record<string, string> = {
      pure: "Stunning geometric patterns with mathematical precision, golden ratio harmony",

      // Optimized COSMOS - shorter but still powerful
      cosmos:
        "GODLEVEL PROMPT: Indonesian Genesis Cosmos Creation - Divine Beginning of Universe as cinematic masterpiece, Sang Hyang Widhi Wasa Supreme Creator manifesting as brilliant cosmic consciousness with volumetric lighting expanding through infinite void with particle systems, primordial cosmic egg Brahmanda splitting with explosive effects releasing divine light and stardust creating spectacular nebula, celestial realm Kahyangan emerging from cosmic waters with floating crystal palaces, Batara Guru Shiva performing cosmic dance with motion blur wielding trident of universal power, cosmic serpent Ananta Sesha coiled around Mount Meru with iridescent scales supporting three worlds, divine cosmic wheel Chakra spinning with sacred geometries representing future Indonesian islands as light points, cosmic tree Kalpataru growing from universe center with fractal branches reaching all dimensions pulsing with bioluminescent energy, primordial sound OM AUM visualized as rippling space-time waves creating vibrational frequencies birthing matter with particle effects, cosmic mandala patterns expanding in mathematical harmony with Sanskrit mantras written in starlight, celestial beings Dewata floating through cosmic realms playing divine gamelan orchestras tuning reality's fundamental frequencies with visible sound waves, cosmic lotus Padma blooming in void with petals containing galaxies and solar systems in stunning detail, divine cosmic breath Prana flowing as solar winds with particle trails carrying life essence to future worlds, cosmic fire Agni burning in newborn stars with plasma effects forging elements for Indonesian soil, primordial waters Apah swirling in spiral galaxies with fluid dynamics preparing to descend as sacred rivers, cosmic time Kala beginning eternal cycle with temporal distortion showing past present future simultaneously, divine consciousness Atman awakening in every matter particle with quantum field effects preparing Indonesian archipelago manifestation, hyperrealistic cosmic visualization with advanced volumetric lighting and particle systems showing Indonesian universe birth in stunning 8K detail",

      // Optimized WATER - shorter but still beautiful
      water:
        "GODLEVEL PROMPT: Indonesian Genesis Water Creation - Sacred Flowing Life Force as stunning aquatic masterpiece, Dewi Sri goddess emerging from cosmic lotus with flowing hair transforming into rivers with realistic fluid dynamics, sacred Mount Meru releasing celestial waterfalls cascading through seven heavens with volumetric mist creating primordial oceans, Baruna ocean god riding massive sea turtle Kurma through endless blue depths with bioluminescent trails commanding tidal forces with conch shell creating sound waves, sacred springs Tirta emerging from earth with crystal clear water blessed by Hindu priests surrounded by tropical paradise, traditional Indonesian water temples Pura Tirta with elaborate stone carvings and lotus ponds reflecting temple spires with perfect mirror reflections, ancient Subak irrigation creating geometric rice terrace patterns across volcanic slopes like liquid staircases with golden hour lighting, sacred Ganges flowing through Indonesian spiritual landscape with ethereal mist carrying prayers downstream, water spirits Nyi Roro Kidul ruling southern seas with underwater coral and pearl palaces in stunning detail, traditional fishing boats with colorful sails navigating between islands while fishermen offer prayers under dramatic skies, monsoon rains blessed by Indra bringing life-giving water to tropical forests with realistic precipitation effects, sacred water buffalo wallowing in muddy rice paddies while farmers plant seedlings with authentic agricultural beauty, traditional water festivals with elaborate processions carrying sacred vessels through vibrant celebrations, holy water Tirta Amrita with healing properties blessed by Balinese priests with spiritual energy effects, underwater kingdoms with sea serpent Naga guardians protecting ancient treasures in crystal clear depths, traditional wells considered sacred portals to underworld with mystical lighting, water meditation with devotees beside flowing streams chanting mantras with peaceful atmosphere, sacred water lilies blooming in temple ponds representing spiritual enlightenment in perfect detail, traditional water music with bamboo instruments creating sounds mimicking flowing rivers with visible sound effects, hyperrealistic water visualization with advanced fluid dynamics and reflection effects showing sacred Indonesian waters in breathtaking 8K quality",

      // Optimized other scenarios - much shorter
      "plants-animals":
        "GODLEVEL PROMPT: Indonesian Genesis Flora Fauna Creation - Living Ecosystem Symphony as nature documentary masterpiece, Dewi Sri dancing through emerald rice fields with motion blur while golden grains multiply creating abundance, sacred Banyan tree with massive trunk serving as dwelling for ancestral spirits with ethereal lighting, Garuda divine eagle soaring above rainforest canopy with majestic wingspan protecting endangered species in cinematic detail, traditional spice gardens with nutmeg cinnamon cloves growing in volcanic soil with rich earth tones, sacred Rafflesia blooming in deep jungle with massive petals emitting mystical fragrance with bioluminescent effects, Indonesian orangutan families swinging through Borneo canopy with realistic fur detail, traditional medicinal plants Jamu with healing properties rendered with botanical accuracy, sacred lotus blooming in temple ponds with spiritual energy effects, Indonesian Komodo dragons as prehistoric remnants with detailed scales ruling ancient kingdoms, traditional butterfly gardens with thousands of colorful species including rare birdwing butterflies catching sunlight, sacred rice goddess ceremonies with farmers offering harvest while gamelan orchestras play with golden hour lighting, Indonesian coral reefs with incredible biodiversity in crystal clear underwater detail, traditional forest spirits Bunian protecting ancient trees with mystical atmosphere, sacred elephants decorated with ceremonial cloth during temple festivals with majestic presence, traditional bird markets with exotic species including birds of paradise with elaborate plumage, Indonesian tiger spirits roaming jungle temples protecting sacred groves, traditional herbal medicine gardens with botanical precision, sacred mangrove forests protecting coastlines with ecological beauty, traditional animal totems with sacred spirits guiding communities, hyperrealistic nature visualization showing incredible Indonesian biodiversity in stunning 8K quality",

      volcanoes:
        "GODLEVEL PROMPT: Indonesian Genesis Volcanic Creation - Sacred Fire Mountains as epic geological masterpiece, Batara Agni fire god emerging from molten earth core with volcanic flame crown and lava robes with realistic fire effects, Mount Merapi sacred volcano breathing divine fire with volumetric smoke while Javanese sultans perform ancient ceremonies, Ring of Fire geological formation with active volcanoes creating Indonesian islands backbone through millions of years with dramatic lighting, sacred volcanic ash Lahar flowing down slopes with particle effects creating fertile agricultural soil, traditional volcano worship ceremonies with offerings at crater edges with spiritual atmosphere, Krakatoa legendary explosion heard worldwide with spectacular visual effects creating magnificent sunsets, volcanic hot springs with healing mineral waters and steam effects, traditional sulfur miners at Kawah Ijen where blue flames create otherworldly scenes with realistic fire effects, sacred Mount Agung towering over Balinese temples as spiritual axis where Hindu gods reside, volcanic glass Obsidian formed from rapid lava cooling with crystalline beauty, traditional volcanic sand beaches with black sand creating unique coastal landscapes, volcanic crater lakes with turquoise waters heated by underground thermal activity creating mystical atmospheric effects, sacred volcanic stones in traditional Indonesian architecture with detailed textures, traditional fire walking ceremonies with devotees walking across hot coals with spiritual energy effects, volcanic lightning during eruptions creating spectacular electrical displays with realistic lightning effects, traditional volcanic observatories monitoring seismic activity respecting traditional beliefs, sacred volcanic caves serving as meditation retreats with mystical lighting, traditional volcanic agriculture with farmers growing crops on steep slopes using ancient terracing, volcanic thermal energy harnessed by modern Indonesia maintaining respect for traditional beliefs, hyperrealistic volcanic visualization with molten lava flows and dramatic lighting showing raw geological power creating Indonesian islands in breathtaking 8K quality",

      // Traditional scenarios - much more concise
      garuda:
        "Majestic Garuda Wisnu Kencana soaring through celestial realms as epic fantasy masterpiece, massive divine eagle with wingspan across golden sunset skies with volumetric lighting, intricate feather details with ethereal light effects, Lord Vishnu mounted with four arms holding sacred objects with magical energy effects, flowing silk garments with fabric physics, Mount Meru with cascading starlight waterfalls, Indonesian archipelago spread below like scattered emeralds, Ring of Fire volcanoes glowing with sacred flames, traditional gamelan music as golden sound waves, ancient Sanskrit mantras as luminous script, divine aura radiating rainbow light spectrum, cosmic mandala patterns swirling in heavens, Borobudur and Prambanan temples glowing with spiritual energy, hyperrealistic fantasy art with cinematic lighting and 8K detail",

      wayang:
        "Mystical Wayang Kulit shadow puppet performance as cinematic cultural masterpiece, master dalang puppeteer behind glowing screen with dramatic lighting, intricately carved leather puppets with gold leaf details, dramatic shadows dancing into living characters, Prince Rama and Princess Sita in stunning detail, mighty Hanuman leaping with mountain in grasp, gamelan orchestra creating visible metallic sound waves, traditional musicians in batik clothing with cultural authenticity, audience mesmerized by eternal stories, coconut oil lamps casting warm amber light with atmospheric effects, ancient Javanese script floating in air with mystical energy, tropical night sky with stars and flying spirits, traditional architecture with carved pillars, incense smoke with volumetric effects, cultural heritage as golden threads connecting past to present, hyperrealistic cultural documentation with cinematic lighting and 8K detail",

      // Continue with other scenarios but much shorter...
      batik:
        "Infinite cosmic tapestry of sacred Indonesian batik patterns coming alive with supernatural energy as textile art masterpiece, master artisan applying hot wax creating flowing lines transforming into living rivers of light, parang rusak patterns undulating like ocean waves with fluid dynamics, kawung circles expanding into mandala formations pulsing with universal rhythm, mega mendung cloud motifs swirling with storm clouds and lightning, ceplok star formations bursting into real constellations, traditional patterns guided by ancestral spirits, natural dyes creating earth tones shifting like living skin, cultural identity woven into reality fabric, UNESCO heritage craft mastery, each pattern telling creation myths and heroic legends, textile becoming portal to spiritual realm where ancestors dance in eternal celebration, hyperrealistic textile art with intricate detail and 8K quality",

      // More concise versions for all other scenarios...
      borobudur:
        "Magnificent Borobudur temple rising from misty Javanese plains as architectural masterpiece, world's largest Buddhist monument glowing with golden sunrise light, relief panels coming alive with Buddha's teachings, Buddha statues radiating enlightenment energy, bell-shaped stupas with hidden Buddha figures emerging like lotus flowers, three circular platforms with different colored auras, pilgrims walking clockwise path leaving golden light trails, ancient stones telling stories of devotion, sunrise illuminating monument while Mount Merapi smokes majestically, largest Buddhist temple complex surrounded by tropical jungle, architectural marvel embodying spiritual journey as ascending light spirals, hyperrealistic architectural photography with dramatic lighting and 8K detail",

      komodo:
        "Prehistoric Komodo dragons prowling volcanic islands as wildlife documentary masterpiece, largest living lizards with massive muscular bodies and realistic scale detail, powerful venomous jaws with predatory intensity, ancient dinosaur survivors with prehistoric majesty, scaly armor-like skin glistening in tropical sun, forked tongues flicking with sensory precision, endemic to Indonesian archipelago representing untamed wilderness, living legends with cultural significance, conservation symbols representing battle between modern world and ancient nature, volcanic landscape of Komodo National Park with dramatic terrain, traditional fishing boats in crystal blue waters, UNESCO World Heritage marine park with ecological protection, hyperrealistic wildlife cinematography with dramatic lighting and 8K detail",

      dance:
        "Graceful Balinese Legong dancers in elaborate golden costumes as cultural performance masterpiece, intricate headdresses with frangipani flowers catching temple lamplight, precise mudra hand gestures telling stories through sacred choreography, gamelan orchestra creating hypnotic rhythms with harmonic visualization, Javanese court dances with refined elegance, Saman dance with dozens of dancers in perfect synchronization creating human mandala patterns, colorful silk fabrics flowing like liquid rainbows, spiritual devotion expressed through movement connecting earthly to divine realms, cultural storytelling through choreographed artistry, temple ceremonies with dancers embodying Hindu deities, traditional music as golden sound waves, elaborate makeup transforming dancers into living gods, hyperrealistic performance documentation with cinematic lighting and 8K detail",

      temples:
        "Ornate Pura Besakih mother temple complex as architectural masterpiece, multi-tiered meru towers reaching toward heavens, intricate stone carvings depicting mythological scenes coming alive, ceremonial gates with guardian statues, lotus ponds reflecting temple spires, incense smoke rising with volumetric effects, devotees in white ceremonial dress performing rituals, tropical flowers as colorful offerings, ancient architecture blending with natural landscape, Prambanan temple complex with towering spires dedicated to Hindu trinity, elaborate relief carvings telling epic stories, traditional Balinese architecture with red brick and volcanic stone, temple festivals with thousands of devotees, gamelan orchestras playing sacred music, holy water ceremonies, UNESCO World Heritage sites preserving ancient masterpieces, hyperrealistic architectural photography with dramatic lighting and 8K detail",

      // Indigenous groups - much more concise
      javanese:
        "Magnificent Javanese royal court as cultural heritage masterpiece, elaborate batik patterns with philosophical meanings, gamelan orchestras creating meditative soundscapes, traditional architecture with joglo roofs and carved pillars, shadow puppet wayang performances with epic tales, Hindu-Buddhist-Islamic cultural synthesis, terraced rice cultivation creating geometric patterns, traditional ceremonies connecting descendants to ancestors, sophisticated artistic heritage with court artisans, Sultan's palace Kraton with sacred cosmic layout, traditional philosophy of harmony, court dancers in elaborate costumes, royal gamelan sets of bronze and gold, ceremonial keris daggers with mystical powers, hyperrealistic cultural documentation with rich detail and 8K quality",

      sundanese:
        "West Java Sundanese people as highland cultural masterpiece, traditional bamboo architecture with elevated stilt houses, angklung bamboo instruments creating harmonious melodies, traditional dance with graceful nature-inspired movements, rice cultivation in mountainous terrain creating spectacular terraces, unique mountain culinary traditions, traditional textiles with intricate patterns, animistic beliefs blended with Islam, community cooperation gotong royong traditions, highland agricultural practices adapted to volcanic soil, traditional steep-roofed bamboo houses, Sundanese language with own script, traditional bamboo weaving and wood carving crafts, mountain harvest festivals, traditional herbal healing practices, hyperrealistic highland culture with dramatic mountain landscapes and 8K detail",

      // Continue pattern for all other indigenous groups with much shorter descriptions...
      batak:
        "North Sumatra Batak people as Lake Toba cultural masterpiece, traditional houses with dramatic buffalo horn roofs, intricate wood carvings telling clan histories, traditional ulos textiles with sacred meanings, patrilineal clan system and ancestral worship, Lake Toba with world's largest volcanic lake, traditional gondang music summoning ancestral spirits, stone megalithic monuments, ancient Batak script preserving oral traditions, ceremonial feasts celebrating life passages, warrior traditions and heroic narratives, traditional nailless architecture, clan totems and symbols, traditional naming marriage death ceremonies, Batak Christian churches blending traditional architecture, hyperrealistic cultural photography with Lake Toba landscape and 8K detail",

      // All other groups follow similar pattern - much more concise but still descriptive
    }

    if (optimizedScenarioPrompts[scenario]) {
      prompt = optimizedScenarioPrompts[scenario]
    }
  }

  const colorPalette = enhancedColors[colorScheme] || "vibrant color palette"
  const enhancement = ", hyperrealistic 8K digital art masterpiece, cinematic lighting, award-winning composition"

  // Final length check and truncation if needed
  const fullPrompt = `${prompt}, ${colorPalette}${enhancement}`
  const maxLength = 3800 // Leave room for cleaning enhancements

  if (fullPrompt.length > maxLength) {
    const truncatedPrompt = fullPrompt.substring(0, maxLength - 3) + "..."
    console.log(`⚠️ Prompt truncated from ${fullPrompt.length} to ${truncatedPrompt.length} characters`)
    return cleanPromptForImageGeneration(truncatedPrompt)
  }

  return cleanPromptForImageGeneration(fullPrompt)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("🎨 AI Art API called - Mathematical Dome & Panorama Transformations")

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

    // Build prompt with enhanced Indonesian Genesis Creation Story
    const mainPrompt = buildEnhancedModernPrompt(dataset, scenario, colorScheme, customPrompt)
    console.log("📝 Prompt:", mainPrompt.substring(0, 200) + "...")
    console.log("📏 Prompt length:", mainPrompt.length, "characters")

    const isGodLevel = mainPrompt.includes("GODLEVEL PROMPT:")
    const isGenesisElement = ["cosmos", "water", "plants-animals", "volcanoes"].includes(scenario)

    // Only use single image mode if explicitly requested or for extremely long prompts
    const shouldUseSingleMode = singleImageMode || generationMode === "single" || mainPrompt.length > 3000

    if (shouldUseSingleMode) {
      console.log("🖼️ Single image mode with mathematical transformations")
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
            domeImage: "Mathematical fisheye transformation applied from source art",
            panoramaImage: "Mathematical equirectangular transformation applied from source art",
            note: "Single image mode with mathematical transformations from original art data",
          },
          parameters: {
            dataset,
            scenario,
            colorScheme,
            singleImageMode: true,
            mathematicalTransforms: true,
            genesisElement: isGenesisElement,
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

    // Try mathematical transformation approach first
    console.log(`⚡ Attempting ${isGodLevel ? "GODLEVEL" : "standard"} generation with mathematical transformations...`)
    try {
      const domePrompt = generateDomePrompt(mainPrompt)
      const panoramaPrompt = generatePanoramaPrompt(mainPrompt)

      console.log("🧮 Using mathematical transformations from original art data")

      // Extended timeout for Genesis elements and GODLEVEL prompts
      const totalTimeout = isGodLevel ? (isGenesisElement ? 45000 : 40000) : 25000

      const parallelResults = (await Promise.race([
        generateImagesInParallel(mainPrompt, domePrompt, panoramaPrompt),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Parallel timeout")), totalTimeout)),
      ])) as Awaited<ReturnType<typeof generateImagesInParallel>>

      // Check if we got at least the main image
      if (parallelResults.mainImage) {
        console.log("✅ Generation with mathematical transformations successful!")

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
          generationMethod: isGodLevel ? "godlevel_mathematical_transforms" : "standard_mathematical_transforms",
          generationDetails: {
            mainImage: "Generated successfully",
            domeImage: parallelResults.domeImage
              ? "Mathematical fisheye transformation applied from original art data"
              : "Using main image fallback",
            panoramaImage: parallelResults.panoramaImage
              ? "Mathematical equirectangular transformation applied from original art data"
              : "Using main image fallback",
            errors: parallelResults.errors,
            successCount: `${successCount}/3 images generated`,
            note: isGodLevel
              ? "GODLEVEL generation with mathematical dome and panorama transformations from original art"
              : "Standard generation with mathematical transformations from original art",
            mathematicalTransforms: {
              domeTransform: parallelResults.domeImage
                ? "✅ Fisheye projection applied from mathematical data"
                : "❌ Fallback used",
              panoramaTransform: parallelResults.panoramaImage
                ? "✅ Equirectangular projection applied from mathematical data"
                : "❌ Fallback used",
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
            genesisElement: isGenesisElement,
            extendedTimeout: totalTimeout,
            mathematicalTransforms: true,
          },
        })
      } else {
        throw new Error("No main image generated")
      }
    } catch (error: any) {
      console.log("⚠️ Mathematical transformation failed, falling back to single image:", error.message)

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
          generationMethod: "emergency_single_mathematical",
          generationDetails: {
            mainImage: "Generated successfully",
            domeImage: "Mathematical fisheye transformation applied from original art data (emergency fallback)",
            panoramaImage:
              "Mathematical equirectangular transformation applied from original art data (emergency fallback)",
            errors: [`Mathematical parallel failed: ${error.message}`],
            note: "Emergency single image mode with mathematical transformations from original art",
          },
          parameters: {
            dataset,
            scenario,
            colorScheme,
            emergencyMode: true,
            mathematicalTransforms: true,
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
