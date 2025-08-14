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
    seed: body.seed || Math.floor(Math.random() * 10000),
    numSamples: body.numSamples || 4000,
    noiseScale: body.noiseScale || 0.08,
    customPrompt: body.customPrompt || "",
    domeProjection: body.domeProjection !== undefined ? body.domeProjection : false,
    domeDiameter: body.domeDiameter || 15,
    domeResolution: body.domeResolution || "4K",
    projectionType: body.projectionType || "fisheye",
    panoramic360: body.panoramic360 !== undefined ? body.panoramic360 : false,
    panoramaResolution: body.panoramaResolution || "8K",
    panoramaFormat: body.panoramaFormat || "equirectangular",
    stereographicPerspective: body.stereographicPerspective || "little-planet",
  }
}

export async function generateWithOpenAI(
  prompt: string,
  type: "standard" | "dome" | "360" = "standard",
  signal?: AbortSignal,
): Promise<{ imageUrl: string; prompt: string }> {
  console.log(`🎨 Generating ${type} image with OpenAI DALL-E 3`)

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured")
  }

  try {
    // Determine the appropriate size based on generation type
    let size: "1024x1024" | "1792x1024" | "1024x1792"

    if (type === "360") {
      size = "1792x1024" // Wide format for panoramas
    } else {
      size = "1024x1024" // Square format for standard and dome
    }

    console.log(`📐 Using size: ${size} for ${type} generation`)

    // Enhance prompt based on type
    let enhancedPrompt = prompt

    if (type === "360") {
      enhancedPrompt = `SEAMLESS 360° PANORAMA: ${prompt}, equirectangular projection, seamless left-right wrapping, continuous horizon, no visible seams, VR-ready panoramic view`
    } else if (type === "dome") {
      enhancedPrompt = `DOME PROJECTION: ${prompt}, fisheye perspective, circular composition, radial symmetry, optimized for planetarium dome projection, immersive 360° viewing experience`
    }

    // Truncate if too long
    if (enhancedPrompt.length > 4000) {
      enhancedPrompt = enhancedPrompt.substring(0, 3900) + "..."
    }

    console.log(`📝 Enhanced prompt (${enhancedPrompt.length} chars):`, enhancedPrompt.substring(0, 200) + "...")

    // Use native fetch instead of OpenAI SDK
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: size,
        quality: "hd",
        style: "vivid",
      }),
      signal: signal,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error(`❌ OpenAI API error for ${type}:`, errorData)

      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again in a few minutes.")
      } else if (response.status === 400) {
        throw new Error(`Invalid request for ${type}: ${errorData.error?.message || "Bad request"}`)
      } else if (response.status === 401) {
        throw new Error("Invalid API key - please check your OpenAI configuration")
      } else if (response.status === 500) {
        throw new Error("OpenAI server error - please try again later")
      } else {
        throw new Error(`OpenAI API error for ${type}: ${response.status} ${response.statusText}`)
      }
    }

    const data = await response.json()

    if (!data.data || !data.data[0] || !data.data[0].url) {
      throw new Error(`No image URL received from OpenAI for ${type}`)
    }

    const imageUrl = data.data[0].url
    console.log(`✅ ${type} image generated successfully:`, imageUrl.substring(0, 100) + "...")

    return {
      imageUrl: imageUrl,
      prompt: enhancedPrompt,
    }
  } catch (error: any) {
    console.error(`❌ OpenAI ${type} generation failed:`, error)

    if (error.name === "AbortError") {
      throw new Error(`${type} generation was cancelled`)
    }

    // Handle fetch errors
    if (error.message?.includes("fetch")) {
      throw new Error(`Network error during ${type} generation`)
    }

    throw new Error(error.message || `Failed to generate ${type} image with OpenAI`)
  }
}
