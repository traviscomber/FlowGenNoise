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

    // ULTRA-ENHANCED 360° prompt based on format with GODLEVEL SEAMLESS WRAPPING
    const panoramaFormat = params?.panoramaFormat || "equirectangular"

    if (panoramaFormat === "equirectangular") {
      enhancedPrompt = `🌟 ULTIMATE GODLEVEL PROFESSIONAL 360° EQUIRECTANGULAR PANORAMA - PERFECT SEAMLESS WRAPPING MASTERY 🌟

${prompt}

🔥 MANDATORY ULTRA-PROFESSIONAL SEAMLESS REQUIREMENTS - MUSEUM EXHIBITION QUALITY:

🎯 PERFECT EDGE CONTINUITY (CRITICAL):
- The LEFT EDGE must connect with the RIGHT EDGE with MATHEMATICAL PERFECTION - zero tolerance for discontinuity
- Imagine this image wrapped around a perfect cylinder - the seam must be COMPLETELY INVISIBLE
- NO color breaks, lighting changes, shadow interruptions, or object cuts at horizontal boundaries
- The composition flows as ONE CONTINUOUS 360-degree circular environment with flawless wraparound
- Professional cylindrical projection mapping where left boundary = right boundary with pixel-perfect precision

🏆 GODLEVEL TECHNICAL EXCELLENCE:
- Perfect 2:1 aspect ratio (1792x1024) optimized for equirectangular projection mapping
- Seamless horizontal continuity across the entire panoramic view with zero artifacts
- NO vertical seams, discontinuities, mismatched lighting, or broken elements at edges
- Professional VR headset optimization with premium immersive experience quality
- Museum-grade flawless wraparound that appears as one continuous world when cylindrically mapped

🎨 PROFESSIONAL VISUAL MASTERY:
- Award-winning composition with perfect visual flow that maintains continuity at wrap points
- Professional lighting consistency across all 360 degrees with no harsh transitions
- Color harmony and gradient continuity that flows seamlessly from right edge to left edge
- Architectural and environmental elements that connect naturally across the wraparound boundary
- Godlevel attention to edge matching with broadcast-quality precision

🌟 ULTIMATE QUALITY STANDARDS:
- International exhibition standard with museum-quality seamless wrapping
- Professional broadcast quality optimized for premium VR experiences
- Award-winning immersive art worthy of digital art galleries and VR showcases
- Masterpiece-level execution with godlevel artistic excellence and technical perfection
- Ultra-high definition clarity with HDR color depth and photorealistic immersive detail

RESULT: A flawless 360° equirectangular panorama where the left and right edges connect with such perfection that the seam is completely invisible, creating a truly seamless immersive world-class VR experience.`
    } else if (panoramaFormat === "stereographic") {
      enhancedPrompt = `🌟 ULTIMATE GODLEVEL STEREOGRAPHIC 360° PROJECTION MASTERY 🌟

${prompt}

🎯 STEREOGRAPHIC PERFECTION REQUIREMENTS:
- Premium stereographic projection with perfect circular fisheye distortion
- Entire 360-degree view compressed into flawless circular frame with mathematical precision
- Center focus with expertly calculated radial distortion increasing toward edges
- Perfect for immersive spherical viewing experiences with award-winning precision
- Professional stereographic mapping with radial symmetry from center outward
- Museum-quality fisheye lens effect with godlevel technical execution
- Little planet perspective with beautifully curved horizon and artistic mastery

🏆 TECHNICAL EXCELLENCE: Professional stereographic projection, perfect circular composition, award-winning fisheye distortion, museum exhibition quality, godlevel artistic precision.`
    }
  } else if (type === "dome") {
    size = "1024x1024"

    // Enhanced dome prompt based on projection type
    const projectionType = params?.projectionType || "fisheye"

    if (projectionType === "fisheye") {
      enhancedPrompt = `🌟 ULTIMATE GODLEVEL DOME FISHEYE PROJECTION MASTERY 🌟

${prompt}

🎯 FISHEYE DOME PERFECTION:
- Perfect fisheye perspective with flawless circular composition and mathematical precision
- Precise radial symmetry from center outward with professional dome mapping accuracy
- Optimized for premium planetarium dome projection with immersive 360-degree viewing
- Zero distortion artifacts with museum-quality fisheye lens effect
- Professional dome mapping with award-winning technical precision
- Godlevel planetarium quality worthy of international science centers
- Immersive dome experience with masterpiece-level artistic execution

🏆 TECHNICAL EXCELLENCE: Professional fisheye projection, perfect circular symmetry, planetarium optimization, museum exhibition quality, godlevel dome mastery.`
    } else if (projectionType === "tunnel-up") {
      enhancedPrompt = `🌟 ULTIMATE GODLEVEL DOME TUNNEL UP PROJECTION MASTERY 🌟

${prompt}

🎯 TUNNEL UP DOME PERFECTION:
- Dramatic upward tunnel perspective with perfect vanishing point at top center
- Precise vertical cylindrical mapping with mathematical perspective accuracy
- Looking up through a perfectly circular tunnel with professional depth rendering
- Dramatic architectural depth with award-winning lighting and shadow work
- Optimized for premium dome ceiling projection with immersive upward viewing
- Museum-quality upward perspective with godlevel technical execution
- Professional architectural visualization worthy of international exhibitions

🏆 TECHNICAL EXCELLENCE: Perfect upward tunnel perspective, precise vanishing point, professional dome ceiling optimization, museum exhibition quality, godlevel architectural mastery.`
    } else if (projectionType === "tunnel-down") {
      enhancedPrompt = `🌟 ULTIMATE GODLEVEL DOME TUNNEL DOWN PROJECTION MASTERY 🌟

${prompt}

🎯 TUNNEL DOWN DOME PERFECTION:
- Dramatic downward tunnel perspective with perfect vanishing point at bottom center
- Precise vertical cylindrical mapping with mathematical perspective accuracy
- Looking down through a perfectly circular tunnel with professional depth rendering
- Award-winning downward perspective with accurate depth and lighting mastery
- Optimized for premium dome floor projection with immersive downward viewing
- Museum-quality downward perspective with godlevel technical execution
- Professional architectural visualization worthy of international exhibitions

🏆 TECHNICAL EXCELLENCE: Perfect downward tunnel perspective, precise vanishing point, professional dome floor optimization, museum exhibition quality, godlevel architectural mastery.`
    } else if (projectionType === "little-planet") {
      enhancedPrompt = `🌟 ULTIMATE GODLEVEL DOME LITTLE PLANET PROJECTION MASTERY 🌟

${prompt}

🎯 LITTLE PLANET DOME PERFECTION:
- Premium stereographic little planet effect with perfect spherical distortion
- Tiny planet perspective with beautifully curved horizon and artistic mastery
- Complete 360-degree world wrapped into flawless circular frame with precision
- Whimsical yet mathematically precise planetary view with award-winning execution
- Optimized for premium dome projection with perfect spherical mapping
- Museum-quality little planet art with godlevel stereographic projection
- Professional planetary perspective worthy of international science exhibitions

🏆 TECHNICAL EXCELLENCE: Perfect little planet effect, precise spherical distortion, professional dome optimization, museum exhibition quality, godlevel planetary mastery.`
    }
  } else {
    size = "1024x1024"
    enhancedPrompt = `🌟 ULTIMATE GODLEVEL STANDARD COMPOSITION MASTERY 🌟

${prompt}

🎯 STANDARD PERFECTION:
- Perfectly balanced and centered composition with professional framing excellence
- Optimal visual hierarchy with award-winning artistic quality and museum-grade execution
- Masterpiece-level attention to detail with premium artistic excellence
- Professional broadcast quality with godlevel artistic mastery
- International exhibition standard worthy of digital art galleries

🏆 TECHNICAL EXCELLENCE: Perfect composition, professional framing, museum exhibition quality, godlevel artistic mastery, award-winning visual impact.`
  }

  console.log(`🎨 Generating ${type} image with OpenAI DALL-E 3`)
  console.log(`📏 Size: ${size}`)
  console.log(
    `🎯 Projection: ${type === "360" ? params?.panoramaFormat : type === "dome" ? params?.projectionType : "standard"}`,
  )
  console.log(`📝 Enhanced prompt: ${enhancedPrompt.substring(0, 300)}...`)

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
