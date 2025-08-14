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
    // Enhanced 360° prompt with stronger seamless wrapping instructions
    enhancedPrompt = `PERFECT SEAMLESS 360° EQUIRECTANGULAR PANORAMA: ${prompt}. CRITICAL REQUIREMENTS: The leftmost edge must connect PERFECTLY with the rightmost edge with absolutely no visible seam, discontinuity, or break in the pattern. The image must wrap around seamlessly in a continuous loop. Ensure horizontal continuity across the entire 360-degree view. The composition should flow naturally from left edge to right edge as if it's one continuous circular environment. No abrupt changes or mismatched elements at the edges. Optimized for VR viewing with flawless wraparound experience.`
  } else if (type === "dome") {
    size = "1024x1024"
    enhancedPrompt = `DOME PROJECTION OPTIMIZED: ${prompt}, fisheye perspective with perfect circular composition, radial symmetry from center outward, optimized for planetarium dome projection, immersive 360-degree viewing experience, no distortion artifacts`
  } else {
    size = "1024x1024"
    enhancedPrompt = `STANDARD COMPOSITION: ${prompt}, balanced and centered composition, optimal framing, professional quality`
  }

  console.log(`🎨 Generating ${type} image with OpenAI DALL-E 3`)
  console.log(`📏 Size: ${size}`)
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
