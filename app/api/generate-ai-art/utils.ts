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
      enhancedPrompt = `PERFECT SEAMLESS 360° EQUIRECTANGULAR PANORAMA: ${prompt}. CRITICAL REQUIREMENTS: The leftmost edge must connect PERFECTLY with the rightmost edge with absolutely no visible seam, discontinuity, or break in the pattern. The image must wrap around seamlessly in a continuous loop. Ensure horizontal continuity across the entire 360-degree view. The composition should flow naturally from left edge to right edge as if it's one continuous circular environment. No abrupt changes or mismatched elements at the edges. Optimized for VR viewing with flawless wraparound experience. Perfect cylindrical projection mapping.`
    } else if (panoramaFormat === "stereographic") {
      enhancedPrompt = `STEREOGRAPHIC 360° PROJECTION: ${prompt}. Create a stereographic projection with circular fisheye distortion, where the entire 360-degree view is compressed into a circular frame. The center should be the primary focus with increasing distortion toward the edges. Perfect for immersive spherical viewing experiences. Stereographic mapping with radial symmetry.`
    }
  } else if (type === "dome") {
    size = "1024x1024"

    // Enhanced dome prompt based on projection type
    const projectionType = params?.projectionType || "fisheye"

    if (projectionType === "fisheye") {
      enhancedPrompt = `DOME FISHEYE PROJECTION: ${prompt}, perfect fisheye perspective with circular composition, radial symmetry from center outward, optimized for planetarium dome projection, immersive 360-degree viewing experience, no distortion artifacts, professional dome mapping`
    } else if (projectionType === "tunnel-up") {
      enhancedPrompt = `DOME TUNNEL UP PROJECTION: ${prompt}, upward tunnel perspective with vanishing point at top center, vertical cylindrical mapping, looking up through a circular tunnel, dramatic perspective with depth, optimized for dome ceiling projection, immersive upward viewing experience`
    } else if (projectionType === "tunnel-down") {
      enhancedPrompt = `DOME TUNNEL DOWN PROJECTION: ${prompt}, downward tunnel perspective with vanishing point at bottom center, vertical cylindrical mapping, looking down through a circular tunnel, dramatic downward perspective with depth, optimized for dome floor projection, immersive downward viewing experience`
    } else if (projectionType === "little-planet") {
      enhancedPrompt = `DOME LITTLE PLANET PROJECTION: ${prompt}, stereographic little planet effect with spherical distortion, tiny planet perspective with curved horizon, 360-degree world wrapped into circular frame, whimsical planetary view, optimized for dome projection with spherical mapping`
    }
  } else {
    size = "1024x1024"
    enhancedPrompt = `STANDARD COMPOSITION: ${prompt}, balanced and centered composition, optimal framing, professional quality`
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
