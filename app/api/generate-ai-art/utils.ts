export interface GenerationParams {
  dataset: string
  scenario: string
  colorScheme: string
  seed?: number
  numSamples?: number
  noiseScale?: number
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

export async function generateWithOpenAI(prompt: string, imageType: "standard" | "dome" | "360" = "standard") {
  try {
    console.log(`🎨 Generating ${imageType} image with OpenAI DALL-E 3...`)
    console.log("📝 Prompt length:", prompt.length)
    console.log("📝 Prompt preview:", prompt.substring(0, 200) + "...")

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured")
    }

    // Determine the optimal size based on image type
    let size: "1024x1024" | "1792x1024" | "1024x1792"
    let enhancedPrompt = prompt

    if (imageType === "360") {
      // Use 1792x1024 for 360° panoramas (1.75:1 ratio)
      size = "1792x1024"
      console.log("🌐 Generating 360° panorama with 1792x1024 resolution (1.75:1 ratio)")

      // Enhance prompt for seamless 360° generation
      if (!prompt.includes("360°") && !prompt.includes("equirectangular")) {
        enhancedPrompt +=
          " PROFESSIONAL 360° EQUIRECTANGULAR PANORAMA: Generate as seamless 360-degree equirectangular panorama optimized for 1792x1024 resolution. CRITICAL: Left and right edges must connect perfectly for VR viewing. Horizontal field of view: 360° with seamless wraparound. Vertical field of view: 154° (optimized for 1.75:1 ratio). Horizon positioned at 60% height. NO VISIBLE SEAMS at edges."
      }
    } else if (imageType === "dome") {
      // Use 1024x1024 for dome projections
      size = "1024x1024"
      console.log("🏛️ Generating dome projection with 1024x1024 resolution")

      enhancedPrompt +=
        " PROFESSIONAL DOME PROJECTION: Generate as circular fisheye projection suitable for planetarium dome display. 180-degree field of view with center-focused composition. Perfect for fulldome projection systems with immersive dome experience."
    } else {
      // Use 1024x1024 for standard images
      size = "1024x1024"
      console.log("🖼️ Generating standard image with 1024x1024 resolution")

      enhancedPrompt +=
        " PROFESSIONAL STANDARD IMAGE: Generate high-quality standard format image with perfect composition, professional photography quality, and masterpiece artwork standards."
    }

    // Truncate prompt if too long
    const finalPrompt = enhancedPrompt.length > 4000 ? enhancedPrompt.substring(0, 3900) + "..." : enhancedPrompt

    // Make API call to OpenAI
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: finalPrompt,
        n: 1,
        size: size,
        quality: "hd",
        style: "vivid",
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const imageUrl = data.data?.[0]?.url

    if (!imageUrl) {
      throw new Error("No image URL returned from OpenAI")
    }

    console.log(`✅ ${imageType} image generated successfully`)
    console.log("🔗 Image URL:", imageUrl.substring(0, 50) + "...")

    return {
      success: true,
      imageUrl,
      prompt: enhancedPrompt,
      metadata: {
        model: "dall-e-3",
        size,
        quality: "hd",
        style: "vivid",
        type: imageType,
        aspectRatio: imageType === "360" ? "1.75:1" : "1:1",
        resolution: size,
        seamlessWrapping: imageType === "360",
        vrReady: imageType === "360",
        domeReady: imageType === "dome",
        professionalQuality: true,
      },
    }
  } catch (error: any) {
    console.error(`❌ OpenAI generation failed for ${imageType}:`, error)

    // Handle specific error types
    if (error.message?.includes("timeout")) {
      throw new Error(`${imageType} generation timed out. Please try again.`)
    } else if (error.message?.includes("400")) {
      throw new Error("Invalid prompt or parameters. Please try a different prompt.")
    } else if (error.message?.includes("429")) {
      throw new Error("Rate limit exceeded. Please try again in a moment.")
    } else if (error.message?.includes("500")) {
      throw new Error("OpenAI service temporarily unavailable. Please try again.")
    }

    throw new Error(`Failed to generate ${imageType} image: ${error.message}`)
  }
}
