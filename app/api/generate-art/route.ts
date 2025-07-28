import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🎨 AI Art Generation API called")

    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ OpenAI API key not found")
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    const body = await request.json()
    console.log("📝 Request body:", body)

    const {
      dataset = "spirals",
      scenario = "landscape",
      colorScheme = "plasma",
      seed = 1234,
      numSamples = 3000,
      noise = 0.1,
      timeStep = 0.01,
      customPrompt,
      domeProjection = false,
      domeDiameter = 10,
      domeResolution = "4K",
      projectionType = "fisheye",
      panoramic360 = false,
      panoramaResolution = "8K",
      panoramaFormat = "stereographic",
      stereographicPerspective = "little-planet",
    } = body

    // Build the mathematical art prompt
    let prompt =
      customPrompt ||
      `A stunning ${scenario} visualization of ${dataset} mathematical patterns using ${colorScheme} color scheme, with ${numSamples} data points, seed ${seed}, noise scale ${noise}, and time step ${timeStep}. `

    // Add mathematical details
    prompt += `Highly detailed mathematical visualization, fractal geometry, complex mathematical structures, `

    // Add scenario-specific details
    switch (scenario) {
      case "landscape":
        prompt += "natural landscape setting, organic flowing forms, "
        break
      case "architectural":
        prompt += "architectural structures, geometric buildings, "
        break
      case "crystalline":
        prompt += "crystal formations, prismatic structures, "
        break
      default:
        prompt += "abstract mathematical beauty, "
    }

    // Add dataset-specific details
    switch (dataset) {
      case "tribes":
        prompt +=
          "tribal village settlements, people in traditional clothing, ceremonial gatherings, chiefs and shamans, seasonal activities, trading posts, complex tribal societies, "
        break
      case "heads":
        prompt += "mosaic head compositions, geometric facial features, artistic portraits, "
        break
      case "natives":
        prompt +=
          "ancient native tribes, longhouses, tipis, ceremonial dance circles, medicine wheels, sacred groves, traditional tribal life, "
        break
      case "spirals":
        prompt += "fibonacci spirals, golden ratio patterns, nautilus shells, "
        break
      case "fractal":
        prompt += "fractal trees, recursive branching, self-similar patterns, "
        break
      default:
        prompt += "complex mathematical patterns, "
    }

    // Add projection-specific details
    if (domeProjection) {
      prompt += `optimized for ${domeDiameter}m diameter dome projection, ${domeResolution} resolution, ${projectionType} projection, `
    }

    if (panoramic360) {
      prompt += `360-degree panoramic view, ${panoramaResolution} resolution, ${panoramaFormat} format, `
      if (panoramaFormat === "stereographic" && stereographicPerspective) {
        prompt += `${stereographicPerspective} perspective, `
      }
    }

    prompt += "ultra high quality, photorealistic, stunning visual impact, masterpiece"

    console.log("🚀 Enhanced prompt:", prompt)
    console.log("📏 Prompt length:", prompt.length)

    // Generate image with OpenAI DALL-E 3
    console.log("🎨 Calling OpenAI DALL-E 3...")

    const openaiResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt.length > 4000 ? prompt.substring(0, 3997) + "..." : prompt,
        n: 1,
        size: "1024x1024",
        quality: "hd",
        style: "vivid",
      }),
    })

    console.log("✅ OpenAI response status:", openaiResponse.status)

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      console.error("❌ OpenAI API error:", errorData)
      throw new Error(`OpenAI API error: ${errorData.error?.message || "Unknown error"}`)
    }

    const openaiData = await openaiResponse.json()

    if (!openaiData.data || !openaiData.data[0] || !openaiData.data[0].url) {
      throw new Error("No image URL returned from OpenAI")
    }

    const imageUrl = openaiData.data[0].url

    // Generate additional formats if requested
    let domeImage = null
    let panoramaImage = null

    if (domeProjection) {
      // For dome projection, we'll return the same image but with dome metadata
      domeImage = imageUrl
    }

    if (panoramic360) {
      // For 360 panorama, we'll return the same image but with panorama metadata
      panoramaImage = imageUrl
    }

    return NextResponse.json({
      success: true,
      image: imageUrl,
      domeImage,
      panoramaImage,
      originalPrompt: prompt,
      promptLength: prompt.length,
      provider: "OpenAI",
      model: "DALL-E 3",
      estimatedFileSize: "~2-4MB",
      is4K: false,
    })
  } catch (error: any) {
    console.error("❌ AI Art generation error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate AI art",
        details: error.toString(),
      },
      { status: 500 },
    )
  }
}
