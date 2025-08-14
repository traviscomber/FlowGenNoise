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

    // Enhanced 360° prompt based on format
    const panoramaFormat = params?.panoramaFormat || "equirectangular"

    if (panoramaFormat === "equirectangular") {
      enhancedPrompt = `GODLEVEL PROFESSIONAL 360° EQUIRECTANGULAR PANORAMA - SEAMLESS WRAPPING CRITICAL: ${prompt}. 

MANDATORY SEAMLESS REQUIREMENTS FOR PROFESSIONAL VR QUALITY:
- The LEFT EDGE must connect PERFECTLY with the RIGHT EDGE with ZERO visible seam, discontinuity, or break
- Imagine wrapping this image around a perfect cylinder - left and right edges must align flawlessly
- NO abrupt color changes, lighting differences, shadow breaks, or object interruptions at horizontal edges
- The composition must flow continuously as one unbroken 360-degree circular environment
- Treat this as cylindrical projection mapping where left boundary = right boundary exactly
- Perfect horizontal continuity across the entire panoramic view with seamless wraparound
- NO vertical seams, discontinuities, mismatched lighting, or broken architectural elements at edges
- Optimized for premium VR headset viewing with museum-quality flawless wraparound experience
- Professional equirectangular mapping with mathematically perfect edge alignment
- The final image should appear as one continuous immersive world when wrapped cylindrically
- Godlevel attention to edge matching, lighting consistency, and compositional flow

TECHNICAL EXCELLENCE: Equirectangular projection, perfect 2:1 aspect ratio, seamless horizontal wrapping, VR-optimized, professional broadcast quality, award-winning immersive art, museum exhibition standard.`
    } else if (panoramaFormat === "stereographic") {
      enhancedPrompt = `GODLEVEL STEREOGRAPHIC 360° PROJECTION: ${prompt}. Create a premium stereographic projection with perfect circular fisheye distortion, where the entire 360-degree view is compressed into a flawless circular frame. The center should be the primary focus with mathematically precise increasing distortion toward the edges. Perfect for immersive spherical viewing experiences. Professional stereographic mapping with radial symmetry from center outward, award-winning fisheye lens effect, museum-quality precision.`
    }
  } else if (type === "dome") {
    size = "1024x1024"

    // Enhanced dome prompt based on projection type
    const projectionType = params?.projectionType || "fisheye"

    if (projectionType === "fisheye") {
      enhancedPrompt = `GODLEVEL DOME FISHEYE PROJECTION: ${prompt}, perfect fisheye perspective with flawless circular composition, precise radial symmetry from center outward, optimized for premium planetarium dome projection, immersive 360-degree viewing experience with zero distortion artifacts, professional dome mapping with mathematical precision, award-winning planetarium quality, museum-grade immersive art`
    } else if (projectionType === "tunnel-up") {
      enhancedPrompt = `GODLEVEL DOME TUNNEL UP PROJECTION: ${prompt}, dramatic upward tunnel perspective with perfect vanishing point at top center, precise vertical cylindrical mapping, looking up through a perfectly circular tunnel with mathematical perspective accuracy, dramatic depth with professional lighting, optimized for premium dome ceiling projection, immersive upward viewing experience, award-winning architectural perspective, museum-quality depth rendering`
    } else if (projectionType === "tunnel-down") {
      enhancedPrompt = `GODLEVEL DOME TUNNEL DOWN PROJECTION: ${prompt}, dramatic downward tunnel perspective with perfect vanishing point at bottom center, precise vertical cylindrical mapping, looking down through a mathematically perfect circular tunnel, professional downward perspective with accurate depth rendering, optimized for premium dome floor projection, immersive downward viewing experience, award-winning architectural visualization, museum-quality perspective art`
    } else if (projectionType === "little-planet") {
      enhancedPrompt = `GODLEVEL DOME LITTLE PLANET PROJECTION: ${prompt}, premium stereographic little planet effect with perfect spherical distortion, tiny planet perspective with beautifully curved horizon, complete 360-degree world wrapped into flawless circular frame, whimsical yet mathematically precise planetary view, optimized for premium dome projection with perfect spherical mapping, award-winning little planet art, museum-quality stereographic projection`
    }
  } else {
    size = "1024x1024"
    enhancedPrompt = `GODLEVEL STANDARD COMPOSITION: ${prompt}, perfectly balanced and centered composition with professional framing, optimal visual hierarchy, award-winning artistic quality, museum-grade professional excellence, masterpiece-level attention to detail, premium artistic execution`
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
