import { type NextRequest, NextResponse } from "next/server"

// Enhanced dataset information with comprehensive details
const DATASET_INFO = {
  nuanu: {
    name: "Nuanu Creative City",
    description:
      "A visionary development in Bali creating a future where culture, nature, and innovation thrive together, blending divine inspiration with harmonious living.",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description: "Raw mathematical beauty and geometric precision with sacred geometry patterns",
        keywords: [
          "mathematical precision",
          "geometric patterns",
          "algorithmic beauty",
          "pure mathematics",
          "sacred geometry",
          "golden ratio",
          "fibonacci sequences",
          "fractal structures",
          "symmetrical designs",
          "mathematical harmony",
        ],
      },
      cosmic: {
        name: "Deep Space",
        description: "Cosmic mathematical patterns with stellar formations and celestial structures",
        keywords: [
          "cosmic patterns",
          "stellar formations",
          "celestial structures",
          "space geometry",
          "astronomical beauty",
          "cosmic harmony",
          "stellar mathematics",
          "galactic patterns",
          "nebula formations",
          "cosmic fractals",
        ],
      },
      underwater: {
        name: "Ocean Depths",
        description: "Fluid mathematical dynamics with oceanic patterns and marine geometries",
        keywords: [
          "fluid dynamics",
          "oceanic patterns",
          "marine geometries",
          "wave mathematics",
          "aquatic structures",
          "tidal patterns",
          "underwater fractals",
          "marine algorithms",
          "oceanic flows",
          "aquatic harmony",
        ],
      },
      crystalline: {
        name: "Crystal Caverns",
        description: "Crystalline mathematical structures with geometric precision and mineral patterns",
        keywords: [
          "crystalline structures",
          "geometric precision",
          "mineral patterns",
          "crystal mathematics",
          "lattice formations",
          "prismatic geometry",
          "crystal fractals",
          "mineral algorithms",
          "crystalline harmony",
          "geometric crystals",
        ],
      },
      forest: {
        name: "Enchanted Forest",
        description: "Organic mathematical patterns with natural geometries and botanical structures",
        keywords: [
          "organic patterns",
          "natural geometries",
          "botanical structures",
          "forest mathematics",
          "tree algorithms",
          "leaf patterns",
          "organic fractals",
          "natural harmony",
          "botanical geometry",
          "forest dynamics",
        ],
      },
      aurora: {
        name: "Aurora Skies",
        description: "Atmospheric mathematical phenomena with dancing patterns and celestial displays",
        keywords: [
          "atmospheric phenomena",
          "dancing patterns",
          "celestial displays",
          "aurora mathematics",
          "sky algorithms",
          "atmospheric fractals",
          "celestial harmony",
          "sky patterns",
          "aurora dynamics",
          "atmospheric beauty",
        ],
      },
      volcanic: {
        name: "Volcanic Landscape",
        description: "Volcanic mathematical patterns with molten flows and geological structures",
        keywords: [
          "volcanic patterns",
          "molten flows",
          "geological structures",
          "volcanic mathematics",
          "lava algorithms",
          "geological fractals",
          "volcanic harmony",
          "molten geometry",
          "geological patterns",
          "volcanic dynamics",
        ],
      },
    },
  },
  spirals: {
    name: "Cosmic Spirals",
    description: "Mathematical spiral patterns inspired by galaxies, nautilus shells, and golden ratio formations",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description: "Raw mathematical beauty and geometric precision with sacred geometry patterns",
        keywords: [
          "mathematical precision",
          "geometric patterns",
          "algorithmic beauty",
          "pure mathematics",
          "sacred geometry",
          "golden ratio",
          "fibonacci sequences",
          "fractal structures",
          "symmetrical designs",
          "mathematical harmony",
        ],
      },
      cosmic: {
        name: "Deep Space",
        description: "Spiral galaxies and cosmic formations with stellar mathematical patterns",
        keywords: [
          "spiral galaxies",
          "cosmic formations",
          "stellar patterns",
          "galactic spirals",
          "cosmic mathematics",
          "astronomical spirals",
          "stellar geometry",
          "galactic harmony",
          "cosmic fractals",
          "space spirals",
        ],
      },
    },
  },
  fractal: {
    name: "Fractal Trees",
    description: "Self-similar mathematical structures with recursive patterns and infinite complexity",
    scenarios: {
      pure: {
        name: "Pure Mathematical",
        description: "Raw mathematical beauty and geometric precision with sacred geometry patterns",
        keywords: [
          "mathematical precision",
          "geometric patterns",
          "algorithmic beauty",
          "pure mathematics",
          "sacred geometry",
          "golden ratio",
          "fibonacci sequences",
          "fractal structures",
          "symmetrical designs",
          "mathematical harmony",
        ],
      },
      cosmic: {
        name: "Deep Space",
        description: "Fractal cosmic structures with recursive stellar formations",
        keywords: [
          "fractal structures",
          "recursive patterns",
          "stellar formations",
          "cosmic fractals",
          "mathematical trees",
          "recursive geometry",
          "fractal harmony",
          "cosmic recursion",
          "stellar fractals",
          "space trees",
        ],
      },
    },
  },
}

// Generate comprehensive AI art prompt with rich details
function generateComprehensiveAIPrompt(
  dataset: string,
  scenario: string,
  colorScheme: string,
  customPrompt?: string,
): string {
  const datasetInfo = DATASET_INFO[dataset as keyof typeof DATASET_INFO]
  const scenarioInfo = datasetInfo?.scenarios[scenario as keyof typeof datasetInfo.scenarios]

  if (!datasetInfo || !scenarioInfo) {
    return `Create a magnificent ABSTRACT MATHEMATICAL DIGITAL ARTWORK with ${colorScheme} colors featuring intricate geometric patterns, mathematical precision, algorithmic beauty, fractal structures, flowing mathematical curves, parametric equations visualized, computational art aesthetics, and stunning mathematical complexity. Style: ultra-detailed mathematical art, abstract digital masterpiece, computational visualization, algorithmic beauty, geometric precision, mathematical harmony, breathtaking mathematical patterns.`
  }

  let basePrompt = ""

  // FORCE MATHEMATICAL/ABSTRACT ART STYLE - NO REALISTIC CONTENT
  const mathematicalPrefix = "Create a stunning ABSTRACT MATHEMATICAL DIGITAL ARTWORK inspired by"

  // If custom prompt is provided, integrate it with mathematical context
  if (customPrompt && customPrompt.trim()) {
    const sanitizedCustom = sanitizePrompt(customPrompt.trim())
    basePrompt = `${mathematicalPrefix} ${sanitizedCustom}, transformed into pure mathematical art celebrating ${scenarioInfo.name}. This should be an ABSTRACT COMPUTATIONAL VISUALIZATION with geometric patterns, mathematical curves, and algorithmic beauty - NOT realistic imagery.`
  } else {
    // Generate comprehensive mathematical art prompt
    basePrompt = `${mathematicalPrefix} ${datasetInfo.name} and ${scenarioInfo.name}: ${scenarioInfo.description}. Transform this concept into PURE MATHEMATICAL ART with abstract geometric patterns, computational aesthetics, and algorithmic beauty - NO realistic elements, only mathematical visualization.`
  }

  // Add comprehensive mathematical art specifications
  const colorContext = {
    plasma:
      "vibrant plasma mathematical gradients with electric blues, purples, and magentas creating flowing mathematical curves and algorithmic patterns",
    quantum:
      "quantum field mathematical visualization with deep blues to bright whites, particle interaction patterns and wave function mathematics",
    cosmic:
      "cosmic mathematical patterns with deep space geometries, stellar mathematical formations and celestial algorithmic structures",
    thermal:
      "thermal mathematical spectrum visualization with heat equation patterns, gradient mathematics and energy distribution algorithms",
    spectral:
      "full spectral mathematical rainbow with smooth algorithmic transitions, prismatic mathematical effects and light dispersion mathematics",
    crystalline:
      "crystalline mathematical structures with geometric precision, mathematical lattices and algorithmic crystal formations",
    bioluminescent:
      "bioluminescent mathematical patterns with glowing algorithmic structures and organic mathematical geometries",
    aurora:
      "aurora mathematical visualization with dancing algorithmic patterns, atmospheric mathematical phenomena and celestial computational art",
    metallic:
      "metallic mathematical surfaces with algorithmic reflections, geometric precision and mathematical material properties",
    prismatic:
      "prismatic mathematical patterns with rainbow algorithmic refractions and optical mathematical phenomena",
    monochromatic:
      "monochromatic mathematical gradients with sophisticated algorithmic tonal variations and geometric mathematical contrasts",
    infrared:
      "infrared mathematical heat visualization with thermal algorithmic patterns and energy mathematical distributions",
    lava: "molten mathematical patterns with flowing algorithmic structures and volcanic mathematical geometries",
    futuristic:
      "futuristic mathematical aesthetics with cyberpunk algorithmic patterns and sci-fi mathematical geometries",
    forest: "forest mathematical patterns with organic algorithmic structures and natural mathematical geometries",
    ocean: "ocean mathematical wave patterns with fluid algorithmic dynamics and marine mathematical structures",
    sunset: "sunset mathematical gradients with warm algorithmic transitions and golden mathematical harmonies",
    arctic:
      "arctic mathematical crystalline patterns with ice algorithmic structures and frozen mathematical geometries",
    neon: "neon mathematical patterns with electric algorithmic glows and vibrant mathematical energy fields",
    vintage: "vintage mathematical aesthetics with nostalgic algorithmic patterns and timeless mathematical elegance",
    toxic: "toxic mathematical patterns with acid algorithmic structures and intense mathematical energy fields",
    ember: "ember mathematical patterns with glowing algorithmic structures and fire mathematical dynamics",
    lunar: "lunar mathematical patterns with celestial algorithmic structures and otherworldly mathematical beauty",
    tidal: "tidal mathematical wave patterns with oceanic algorithmic movements and marine mathematical energy",
  }

  const colorDescription =
    colorContext[colorScheme as keyof typeof colorContext] ||
    `magnificent ${colorScheme} mathematical color palette with algorithmic variations and computational harmony`

  // Combine elements with STRONG mathematical focus
  let fullPrompt = `${basePrompt}

MATHEMATICAL ART SPECIFICATIONS: This must be PURE ABSTRACT MATHEMATICAL ART rendered in ${colorDescription}. NO realistic imagery, NO photographic elements, NO literal representations - ONLY mathematical visualization, geometric patterns, algorithmic beauty, and computational art aesthetics.

VISUAL STYLE: Abstract mathematical digital art with computational precision, algorithmic beauty, geometric harmony, mathematical curves, parametric equations, fractal structures, flowing mathematical patterns, and sophisticated mathematical visualization techniques.

MATHEMATICAL ELEMENTS:`

  // Add scenario-specific mathematical keywords
  if (scenarioInfo.keywords && scenarioInfo.keywords.length > 0) {
    const mathematicalKeywords = scenarioInfo.keywords
      .filter((keyword) => !containsProblematicContent(keyword))
      .map((keyword) => `mathematical interpretation of ${keyword}`)
      .slice(0, 6)

    if (mathematicalKeywords.length > 0) {
      fullPrompt += ` ${mathematicalKeywords.join(", ")} - all transformed into abstract mathematical patterns and geometric visualizations.`
    }
  }

  // Add STRONG mathematical art specifications
  fullPrompt += `

COMPUTATIONAL ART REQUIREMENTS:
- ABSTRACT MATHEMATICAL VISUALIZATION ONLY - no realistic imagery
- Geometric patterns with mathematical precision and algorithmic beauty
- Flowing mathematical curves, parametric equations, and computational aesthetics
- Fractal structures, recursive patterns, and mathematical self-similarity
- Algorithmic color distributions with mathematical harmony
- Computational art techniques with digital mathematical precision
- Abstract geometric compositions with mathematical relationships
- Mathematical pattern generation with algorithmic complexity
- Pure mathematical beauty without realistic elements
- Computational visualization of mathematical concepts
- Algorithmic art generation with mathematical foundations
- Abstract mathematical interpretation of cultural concepts

ARTISTIC EXECUTION:
- Museum-quality abstract mathematical art with computational precision
- Sophisticated mathematical visualization techniques
- Perfect algorithmic balance and mathematical composition
- Advanced computational art methods with mathematical foundations
- Mathematical color theory with algorithmic precision
- Abstract geometric harmony with mathematical relationships
- Computational creativity with mathematical beauty
- Digital mathematical art with algorithmic sophistication
- Pure mathematical aesthetics without realistic elements
- Advanced mathematical visualization with computational excellence

FINAL MATHEMATICAL VISION: A breathtaking ABSTRACT MATHEMATICAL DIGITAL ARTWORK that captures the mathematical essence of ${datasetInfo.name} through pure computational art, geometric patterns, algorithmic beauty, and mathematical visualization - completely abstract with NO realistic elements, only mathematical art perfection.`

  return sanitizePrompt(fullPrompt)
}

// Sanitize prompt to avoid content policy violations while preserving richness
function sanitizePrompt(prompt: string): string {
  // Remove potentially problematic words/phrases but keep mathematical descriptions
  const problematicTerms = [
    "tribal warfare",
    "warrior",
    "battle",
    "conflict",
    "weapon",
    "war",
    "fight",
    "violence",
    "blood",
    "death",
    "kill",
    "attack",
    "destroy",
    "harm",
    "dangerous",
    "threat",
    "enemy",
    "savage",
    "primitive",
    "barbaric",
    "terrifying",
    "scary",
    "frightening",
    "evil",
    "demon",
    "devil",
    "haunted",
    "cursed",
    "dark magic",
    "witch",
    "sorcery",
    "black magic",
  ]

  let sanitized = prompt

  problematicTerms.forEach((term) => {
    const regex = new RegExp(term, "gi")
    sanitized = sanitized.replace(regex, "mathematical pattern")
  })

  // Replace with mathematical alternatives while maintaining descriptive richness
  sanitized = sanitized
    .replace(/horror/gi, "mathematical complexity")
    .replace(/terrifying/gi, "mathematically awe-inspiring")
    .replace(/scary/gi, "mathematically mysterious")
    .replace(/frightening/gi, "mathematically captivating")
    .replace(/evil/gi, "mathematically complex")
    .replace(/demon/gi, "mathematical entity")
    .replace(/devil/gi, "mathematical structure")
    .replace(/ghost/gi, "mathematical pattern")
    .replace(/spirit/gi, "mathematical essence")
    .replace(/supernatural/gi, "mathematically transcendent")
    .replace(/haunted/gi, "mathematically enchanted")
    .replace(/cursed/gi, "mathematically blessed")
    .replace(/dark magic/gi, "mathematical algorithms")
    .replace(/witch/gi, "mathematical practitioner")
    .replace(/sorcery/gi, "mathematical computation")
    .replace(/black magic/gi, "advanced mathematics")
    .replace(/warrior/gi, "mathematical guardian")
    .replace(/battle/gi, "mathematical interaction")
    .replace(/warfare/gi, "mathematical dynamics")
    .replace(/tribal/gi, "mathematical community")
    .replace(/primitive/gi, "fundamentally mathematical")
    .replace(/savage/gi, "mathematically wild")
    .replace(/barbaric/gi, "mathematically powerful")

  return sanitized
}

// Check if content contains problematic terms
function containsProblematicContent(text: string): boolean {
  const problematicTerms = [
    "warfare",
    "warrior",
    "battle",
    "conflict",
    "weapon",
    "war",
    "fight",
    "violence",
    "blood",
    "death",
    "savage",
    "primitive",
    "barbaric",
    "horror",
    "terrifying",
    "scary",
    "evil",
    "demon",
    "ghost",
  ]

  return problematicTerms.some((term) => text.toLowerCase().includes(term.toLowerCase()))
}

// Generate dome-specific prompt with rich mathematical details for planetarium dome
function generateDomePrompt(basePrompt: string, additionalParams: any): string {
  const { domeDiameter = 20, domeResolution, projectionType } = additionalParams

  return `IMMERSIVE PLANETARIUM DOME MATHEMATICAL ART WITH DRAMATIC TUNNEL EFFECT: Transform this extraordinary ABSTRACT MATHEMATICAL ARTWORK for breathtaking ${domeDiameter}m diameter planetarium dome display with stunning fisheye tunnel projection effect.

DOME TUNNEL EFFECT SPECIFICATIONS FOR ${domeDiameter}M DOME:
- DRAMATIC FISHEYE TUNNEL EFFECT with mathematical precision optimized for ${domeDiameter}-meter dome projection
- POWERFUL CENTRAL FOCAL POINT creating tunnel illusion that draws viewers into mathematical depths
- RADIAL MATHEMATICAL PATTERNS flowing outward from center in perfect circular symmetry
- TUNNEL PERSPECTIVE DISTORTION with algorithmic precision creating immersive depth experience
- CIRCULAR FISHEYE COMPOSITION optimized for overhead dome viewing from center position
- SEAMLESS EDGE BLENDING with mathematical precision for perfect ${domeDiameter}m dome wraparound
- DRAMATIC DEPTH ILLUSION using mathematical perspective and algorithmic distortion
- TUNNEL VORTEX EFFECT with mathematical curves spiraling toward central vanishing point
- FISHEYE PROJECTION MAPPING with computational precision for professional planetarium systems
- LITTLE PLANET EFFECT option with stereographic mathematical projection creating curved world illusion
- OVERHEAD VIEWING OPTIMIZATION ensuring perfect visual experience when looking up at ${domeDiameter}m dome ceiling

MATHEMATICAL TUNNEL ARTISTIC VISION:
${basePrompt}

DOME TUNNEL TRANSFORMATION REQUIREMENTS:
Transform this magnificent mathematical concept into a dramatic TUNNEL EFFECT specifically for ${domeDiameter}-meter planetarium dome projection. The composition must feature a powerful central mathematical focal point with all algorithmic elements radiating outward in perfect radial symmetry, creating an absolutely breathtaking tunnel illusion when projected overhead on the ${domeDiameter}m dome ceiling. 

TUNNEL EFFECT SPECIFICATIONS:
- Central vanishing point with mathematical precision drawing viewers into algorithmic depths
- Radial mathematical flow patterns creating tunnel perspective illusion
- Fisheye distortion with computational accuracy for seamless dome projection
- Circular composition boundary perfectly fitted for dome projection systems
- Mathematical tunnel vortex with algorithmic spiral patterns
- Dramatic perspective depth using mathematical curves and geometric progression
- Seamless circular edge blending for perfect dome environment immersion

FINAL DOME TUNNEL VISION: Create a breathtaking ABSTRACT MATHEMATICAL TUNNEL ARTWORK that completely transforms the ${domeDiameter}m dome into an immersive mathematical vortex, with dramatic fisheye tunnel effects, radial mathematical patterns, and algorithmic depth illusion - all rendered as PURE ABSTRACT MATHEMATICAL ART with tunnel projection optimization.`
}

// Generate 360° panorama-specific prompt with rich mathematical details
function generatePanoramaPrompt(basePrompt: string, additionalParams: any): string {
  const { panoramaResolution, panoramaFormat, stereographicPerspective } = additionalParams

  let panoramaPrompt = `IMMERSIVE 360° PANORAMIC MATHEMATICAL ARTWORK: Transform this extraordinary ABSTRACT MATHEMATICAL ART for breathtaking ${panoramaResolution} resolution 360° mathematical viewing experience in professional ${panoramaFormat} format.

360° PANORAMIC MATHEMATICAL ART REQUIREMENTS:
- PURE ABSTRACT MATHEMATICAL VISUALIZATION with seamless wraparound mathematical composition
- Seamless mathematical wraparound with absolutely no visible seams in algorithmic patterns
- Optimal horizontal mathematical aspect ratio specifically designed for 360° mathematical viewing
- Strategic mathematical pattern distribution across the complete 360° algorithmic viewing sphere
- Perfect mathematical horizon placement optimized for VR and 360° mathematical environment compatibility
- Flawless smooth mathematical transitions at wraparound edges with computational precision
- Enhanced mathematical detail density optimized for immersive algorithmic viewing experiences
- Natural mathematical composition flow that works beautifully around the full circular mathematical view
- Professional VR mathematical compatibility with industry-standard 360° algorithmic formats

MATHEMATICAL ARTISTIC VISION FOR 360° EXPERIENCE:
${basePrompt}

360° MATHEMATICAL TRANSFORMATION SPECIFICATIONS:
Transform this magnificent mathematical concept specifically for 360° panoramic viewing, ensuring the mathematical composition flows naturally and beautifully around the full circular view, creating an absolutely immersive mathematical experience when viewed in VR or 360° environments. Every mathematical element should be positioned with algorithmic precision to create a seamless, breathtaking panoramic mathematical experience that surrounds viewers in computational artistic beauty - all rendered as PURE ABSTRACT MATHEMATICAL ART.`

  if (panoramaFormat === "stereographic" && stereographicPerspective) {
    panoramaPrompt += `

ADVANCED STEREOGRAPHIC MATHEMATICAL PROJECTION:
Apply sophisticated ${stereographicPerspective} stereographic mathematical projection for unique and captivating mathematical visual perspective. This creates a distinctive curved mathematical world effect that transforms the flat mathematical artwork into an immersive spherical mathematical experience with dramatic algorithmic perspective distortion, computational precision, and mathematical beauty that showcases the power of advanced mathematical projection techniques - all as PURE ABSTRACT MATHEMATICAL ART.`
  }

  return sanitizePrompt(panoramaPrompt)
}

// Call OpenAI API with retry logic and better error handling
async function callOpenAI(prompt: string, retries = 2): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`OpenAI API call attempt ${attempt + 1}/${retries + 1}`)
      console.log(`Prompt length: ${prompt.length} characters`)

      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: prompt.length > 3900 ? prompt.substring(0, 3900) + "..." : prompt,
          n: 1,
          size: "1024x1024",
          quality: "hd",
          style: "vivid",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error(`OpenAI API error (attempt ${attempt + 1}):`, errorData)

        // Check if it's a content policy violation
        if (errorData.error?.code === "content_policy_violation") {
          console.log("Content policy violation detected, trying with safer prompt...")

          // Generate a comprehensive but safe fallback prompt
          const safePrompt = `Create a magnificent abstract digital artwork masterpiece with geometric patterns, flowing mathematical curves, and harmonious colors. Style: ultra-detailed, museum-quality, professional digital art, perfect composition, breathtaking beauty, artistic excellence, sophisticated design, masterful execution, stunning visual impact, technical precision, creative innovation, artistic mastery, visual sophistication, exceptional quality, gallery-worthy presentation, artistic brilliance, creative vision, technical excellence, professional artistry, masterpiece quality, breathtaking aesthetics, visual poetry, artistic perfection.`

          const safeResponse = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "dall-e-3",
              prompt: safePrompt,
              n: 1,
              size: "1024x1024",
              quality: "hd",
              style: "vivid",
            }),
          })

          if (safeResponse.ok) {
            const safeData = await safeResponse.json()
            if (safeData.data && safeData.data[0] && safeData.data[0].url) {
              console.log("✅ Generated comprehensive safe fallback artwork")
              return safeData.data[0].url
            }
          }
        }

        if (attempt === retries) {
          throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`)
        }

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)))
        continue
      }

      const data = await response.json()

      if (!data.data || !data.data[0] || !data.data[0].url) {
        throw new Error("No image URL returned from OpenAI API")
      }

      return data.data[0].url
    } catch (error) {
      console.error(`OpenAI API call failed (attempt ${attempt + 1}):`, error)

      if (attempt === retries) {
        throw error
      }

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)))
    }
  }

  throw new Error("All OpenAI API attempts failed")
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== FlowSketch Art Generation API ===")

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured")
    }

    const body = await request.json()
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
      domeDiameter = 20, // Default to 20 meters
      domeResolution,
      projectionType,
      panoramic360,
      panoramaResolution,
      panoramaFormat,
      stereographicPerspective,
    } = body

    console.log("Received generation request:", {
      dataset,
      scenario,
      colorScheme,
      customPrompt: customPrompt ? customPrompt.substring(0, 100) + "..." : "None",
      domeProjection,
      domeDiameter,
      panoramic360,
    })

    // Generate comprehensive AI art prompt
    const mainPrompt = generateComprehensiveAIPrompt(dataset, scenario, colorScheme, customPrompt)
    console.log("Generated comprehensive main prompt:", mainPrompt.substring(0, 200) + "...")
    console.log(`Full prompt length: ${mainPrompt.length} characters`)

    // ALWAYS generate all three versions for complete immersive experience
    const generationDetails: any = {
      mainImage: "Generating...",
      domeImage: "Generating...",
      panoramaImage: "Generating...",
    }

    // Generate main image
    console.log("🎨 Generating main artwork...")
    const mainImageUrl = await callOpenAI(mainPrompt)
    generationDetails.mainImage = "Generated successfully"
    console.log("✅ Main artwork generated successfully")

    // ALWAYS generate dome projection for complete set
    console.log(`🏛️ Generating ${domeDiameter}m dome projection with tunnel effect...`)
    let domeImageUrl: string
    try {
      const domePrompt = generateDomePrompt(mainPrompt, {
        domeDiameter,
        domeResolution,
        projectionType,
      })

      console.log("Generated dome prompt:", domePrompt.substring(0, 200) + "...")
      console.log(`Dome prompt length: ${domePrompt.length} characters`)
      domeImageUrl = await callOpenAI(domePrompt)
      generationDetails.domeImage = "Generated successfully"
      console.log(`✅ ${domeDiameter}m dome projection generated successfully`)
    } catch (error: any) {
      console.error(`❌ ${domeDiameter}m dome projection generation failed:`, error)

      // Try generating a simpler dome version as fallback
      try {
        console.log("🔄 Attempting simplified dome generation...")
        const simpleDomePrompt = `Create a stunning ABSTRACT MATHEMATICAL DIGITAL ARTWORK optimized for planetarium dome projection with dramatic fisheye tunnel effect. Features: central focal point, radial mathematical patterns flowing outward, tunnel perspective distortion, seamless circular composition perfect for overhead dome viewing, dramatic depth illusion with mathematical precision. Style: abstract computational art, geometric patterns, algorithmic beauty, mathematical visualization, fisheye projection mapping, tunnel effect optimization.`

        domeImageUrl = await callOpenAI(simpleDomePrompt)
        generationDetails.domeImage = "Generated with simplified prompt"
        console.log("✅ Simplified dome version generated successfully")
      } catch (fallbackError: any) {
        console.error("❌ Simplified dome generation also failed:", fallbackError)
        domeImageUrl = mainImageUrl
        generationDetails.domeImage = "Using main image as final fallback"
        console.log("🔄 Using main image as dome fallback")
      }
    }

    // ALWAYS generate 360° panorama for complete set
    console.log("🌐 Generating 360° panorama...")
    let panoramaImageUrl: string
    try {
      const panoramaPrompt = generatePanoramaPrompt(mainPrompt, {
        panoramaResolution,
        panoramaFormat,
        stereographicPerspective,
      })

      console.log("Generated panorama prompt:", panoramaPrompt.substring(0, 200) + "...")
      console.log(`Panorama prompt length: ${panoramaPrompt.length} characters`)
      panoramaImageUrl = await callOpenAI(panoramaPrompt)
      generationDetails.panoramaImage = "Generated successfully"
      console.log("✅ 360° panorama generated successfully")
    } catch (error: any) {
      console.error("❌ 360° panorama generation failed:", error)

      // Try generating a simpler 360° version as fallback
      try {
        console.log("🔄 Attempting simplified 360° generation...")
        const simple360Prompt = `Create a stunning ABSTRACT MATHEMATICAL DIGITAL ARTWORK optimized for 360° panoramic viewing. Features: seamless wraparound mathematical composition, horizontal flow perfect for VR viewing, continuous mathematical patterns with no visible seams, equirectangular format optimization. Style: abstract computational art, geometric patterns, algorithmic beauty, mathematical visualization, 360° panoramic composition, seamless wraparound design.`

        panoramaImageUrl = await callOpenAI(simple360Prompt)
        generationDetails.panoramaImage = "Generated with simplified prompt"
        console.log("✅ Simplified 360° version generated successfully")
      } catch (fallbackError: any) {
        console.error("❌ Simplified 360° generation also failed:", fallbackError)
        panoramaImageUrl = mainImageUrl
        generationDetails.panoramaImage = "Using main image as final fallback"
        console.log("🔄 Using main image as 360° fallback")
      }
    }

    // Prepare response with ALL THREE versions
    const response = {
      success: true,
      image: mainImageUrl,
      domeImage: domeImageUrl,
      panoramaImage: panoramaImageUrl,
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
        domeDiameter,
        domeResolution,
        projectionType,
        panoramic360: true, // Always true since we generate all versions
        panoramaResolution,
        panoramaFormat,
        stereographicPerspective,
      },
    }

    console.log("🎉 Generation completed successfully")
    console.log("📊 Final result summary:")
    console.log("- Main image:", !!response.image)
    console.log("- Dome image:", !!response.domeImage)
    console.log("- Panorama image:", !!response.panoramaImage)
    console.log("- Generation details:", response.generationDetails)
    console.log(`- Main prompt length: ${response.promptLength} characters`)
    console.log(`- Dome diameter: ${domeDiameter}m`)

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("💥 Generation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate artwork",
        details: {
          name: error.name,
          stack: error.stack?.split("\n").slice(0, 5).join("\n"),
        },
      },
      { status: 500 },
    )
  }
}
