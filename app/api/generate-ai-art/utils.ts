export interface GenerationParams {
  dataset: string
  scenario?: string
  colorScheme: string
  seed: number
  numSamples: number
  noiseScale: number
  customPrompt?: string
  domeProjection?: boolean
  domeDiameter?: number
  domeResolution?: string
  projectionType?: string
  panoramic360?: boolean
  panoramaResolution?: string
  panoramaFormat?: string
  stereographicPerspective?: string
}

export function validateGenerationParams(body: any): GenerationParams {
  return {
    dataset: body.dataset || "vietnamese",
    scenario: body.scenario || "trung-sisters",
    colorScheme: body.colorScheme || "metallic",
    seed: typeof body.seed === "number" ? body.seed : Math.floor(Math.random() * 10000),
    numSamples: typeof body.numSamples === "number" ? body.numSamples : 4000,
    noiseScale: typeof body.noiseScale === "number" ? body.noiseScale : 0.08,
    customPrompt: body.customPrompt || "",
    domeProjection: body.domeProjection || false,
    domeDiameter: body.domeDiameter || 15,
    domeResolution: body.domeResolution || "4K",
    projectionType: body.projectionType || "fisheye",
    panoramic360: body.panoramic360 || false,
    panoramaResolution: body.panoramaResolution || "8K",
    panoramaFormat: body.panoramaFormat || "equirectangular",
    stereographicPerspective: body.stereographicPerspective || "little-planet",
  }
}

export async function generateWithOpenAI(
  prompt: string,
  type: "standard" | "dome" | "360",
  params?: GenerationParams,
  signal?: AbortSignal,
): Promise<{ imageUrl: string; prompt: string }> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error("OpenAI API key not configured")
  }

  // Determine size based on type
  let size: "1024x1024" | "1792x1024"
  let enhancedPrompt = prompt

  if (type === "360") {
    size = "1792x1024"

    // ULTIMATE GODLEVEL 360° SEAMLESS WRAPPING PROMPT
    const panoramaFormat = params?.panoramaFormat || "equirectangular"

    if (panoramaFormat === "equirectangular") {
      enhancedPrompt = `ULTIMATE GODLEVEL 360° EQUIRECTANGULAR PANORAMA - PERFECT SEAMLESS WRAPPING: ${prompt}

MANDATORY SEAMLESS REQUIREMENTS - MUSEUM EXHIBITION QUALITY:
• LEFT EDGE must connect PERFECTLY with RIGHT EDGE - zero visible seam, mathematical precision
• Continuous 360° circular environment - imagine wrapping around perfect cylinder
• NO color breaks, lighting changes, shadow interruptions, or object cuts at horizontal boundaries  
• Professional cylindrical projection mapping where left boundary = right boundary exactly
• Perfect horizontal continuity with zero artifacts, discontinuities, or edge mismatches
• VR-optimized for premium headsets with flawless wraparound immersive experience
• Museum-grade seamless edge alignment worthy of international digital art exhibitions

TECHNICAL EXCELLENCE: Equirectangular 2:1 aspect ratio, seamless horizontal wrapping, professional VR quality, award-winning immersive art, broadcast standard, godlevel artistic mastery with perfect edge continuity.`
    } else if (panoramaFormat === "stereographic") {
      enhancedPrompt = `ULTIMATE GODLEVEL STEREOGRAPHIC 360° PROJECTION: ${prompt}

STEREOGRAPHIC MASTERY:
• Premium stereographic projection with perfect circular fisheye distortion
• Entire 360° view compressed into flawless circular frame with mathematical precision
• Center focus with expertly calculated radial distortion increasing toward edges
• Professional stereographic mapping with award-winning technical execution
• Museum-quality fisheye lens effect with godlevel artistic precision

TECHNICAL EXCELLENCE: Perfect circular composition, professional stereographic projection, award-winning fisheye distortion, museum exhibition quality, godlevel artistic mastery.`
    }
  } else if (type === "dome") {
    size = "1024x1024"

    const projectionType = params?.projectionType || "fisheye"

    if (projectionType === "fisheye") {
      enhancedPrompt = `ULTIMATE GODLEVEL DOME FISHEYE PROJECTION: ${prompt}

FISHEYE DOME MASTERY:
• Perfect fisheye perspective with flawless circular composition and mathematical precision
• Precise radial symmetry from center outward with professional dome mapping accuracy
• Optimized for premium planetarium dome projection with immersive 360° viewing experience
• Zero distortion artifacts with museum-quality fisheye lens effect
• Professional dome mapping with award-winning technical precision worthy of international science centers

TECHNICAL EXCELLENCE: Professional fisheye projection, perfect circular symmetry, planetarium optimization, museum exhibition quality, godlevel dome mastery.`
    } else if (projectionType === "tunnel-up") {
      enhancedPrompt = `ULTIMATE GODLEVEL DOME TUNNEL UP PROJECTION: ${prompt}

TUNNEL UP MASTERY:
• Dramatic upward tunnel perspective with perfect vanishing point at top center
• Precise vertical cylindrical mapping with mathematical perspective accuracy
• Looking up through perfectly circular tunnel with professional depth rendering
• Dramatic architectural depth with award-winning lighting and shadow work
• Optimized for premium dome ceiling projection with immersive upward viewing experience

TECHNICAL EXCELLENCE: Perfect upward tunnel perspective, precise vanishing point, professional dome ceiling optimization, museum exhibition quality, godlevel architectural mastery.`
    } else if (projectionType === "tunnel-down") {
      enhancedPrompt = `ULTIMATE GODLEVEL DOME TUNNEL DOWN PROJECTION: ${prompt}

TUNNEL DOWN MASTERY:
• Dramatic downward tunnel perspective with perfect vanishing point at bottom center
• Precise vertical cylindrical mapping with mathematical perspective accuracy
• Looking down through perfectly circular tunnel with professional depth rendering
• Award-winning downward perspective with accurate depth and lighting mastery
• Optimized for premium dome floor projection with immersive downward viewing experience

TECHNICAL EXCELLENCE: Perfect downward tunnel perspective, precise vanishing point, professional dome floor optimization, museum exhibition quality, godlevel architectural mastery.`
    } else if (projectionType === "little-planet") {
      enhancedPrompt = `ULTIMATE GODLEVEL DOME LITTLE PLANET PROJECTION: ${prompt}

LITTLE PLANET MASTERY:
• Premium stereographic little planet effect with perfect spherical distortion
• Tiny planet perspective with beautifully curved horizon and artistic mastery
• Complete 360° world wrapped into flawless circular frame with mathematical precision
• Whimsical yet mathematically precise planetary view with award-winning execution
• Optimized for premium dome projection with perfect spherical mapping

TECHNICAL EXCELLENCE: Perfect little planet effect, precise spherical distortion, professional dome optimization, museum exhibition quality, godlevel planetary mastery.`
    }
  } else {
    size = "1024x1024"
    enhancedPrompt = `ULTIMATE GODLEVEL STANDARD COMPOSITION: ${prompt}

STANDARD MASTERY:
• Perfectly balanced and centered composition with professional framing excellence
• Optimal visual hierarchy with award-winning artistic quality and museum-grade execution
• Masterpiece-level attention to detail with premium artistic excellence
• Professional broadcast quality with godlevel artistic mastery worthy of international exhibitions

TECHNICAL EXCELLENCE: Perfect composition, professional framing, museum exhibition quality, godlevel artistic mastery, award-winning visual impact.`
  }

  // Ensure we stay within 4000 character limit
  if (enhancedPrompt.length > 3900) {
    // Intelligently truncate while preserving key seamless instructions
    const keyPhrases = [
      "LEFT EDGE must connect PERFECTLY with RIGHT EDGE",
      "seamless",
      "continuous 360°",
      "museum-grade",
      "professional",
      "godlevel",
    ]

    let truncated = enhancedPrompt.substring(0, 3800)
    const lastSentence = truncated.lastIndexOf(".")
    if (lastSentence > 3500) {
      truncated = truncated.substring(0, lastSentence + 1)
    }

    // Ensure critical seamless instruction is preserved for 360°
    if (type === "360" && !truncated.includes("LEFT EDGE must connect PERFECTLY with RIGHT EDGE")) {
      truncated += " CRITICAL: LEFT EDGE must connect PERFECTLY with RIGHT EDGE - zero visible seam."
    }

    enhancedPrompt = truncated + "..."
  }

  console.log(`🎨 Generating ${type} image with OpenAI DALL-E 3`)
  console.log(`📏 Size: ${size}`)
  console.log(`📝 Enhanced prompt length: ${enhancedPrompt.length} chars`)
  console.log(
    `🎯 Projection: ${type === "360" ? params?.panoramaFormat : type === "dome" ? params?.projectionType : "standard"}`,
  )

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: size,
        quality: "hd",
        style: "vivid",
      }),
      signal,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`

      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again in a few minutes.")
      } else if (response.status === 400) {
        throw new Error(`Invalid request: ${errorMessage}`)
      } else if (response.status === 401) {
        throw new Error("Invalid API key or authentication failed")
      } else {
        throw new Error(errorMessage)
      }
    }

    const data = await response.json()

    if (!data.data || !data.data[0] || !data.data[0].url) {
      throw new Error("No image URL returned from OpenAI")
    }

    const imageUrl = data.data[0].url
    console.log(`✅ ${type} image generated successfully`)

    return {
      imageUrl,
      prompt: enhancedPrompt,
    }
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new Error("Generation was cancelled")
    }
    console.error(`❌ OpenAI generation failed for ${type}:`, error)
    throw error
  }
}
