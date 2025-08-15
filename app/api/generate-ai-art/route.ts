import { type NextRequest, NextResponse } from "next/server"
import { buildPrompt, applySafetyBypass, enhancePromptWithAI } from "@/lib/ai-prompt"

interface GenerationParams {
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
  enhancePrompt?: boolean
  enhancementLevel?: string
}

// Enhanced OpenAI generation with GODLEVEL quality and comprehensive error handling
async function generateWithOpenAI(
  prompt: string,
  type: "standard" | "dome" | "360",
  enhancePrompt = true,
  enhancementLevel = "moderate",
) {
  console.log(`🎨 Starting GODLEVEL OpenAI generation for ${type} image`)
  console.log(`📝 Base prompt length: ${prompt.length} characters`)

  // Validate API key
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error("OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.")
  }

  if (!apiKey.startsWith("sk-")) {
    throw new Error("Invalid OpenAI API key format. Key should start with 'sk-'")
  }

  // Determine image size based on type
  const size = type === "360" ? "1792x1024" : "1024x1024"

  // Apply GODLEVEL enhancements based on type
  let enhancedPrompt = prompt

  if (type === "360") {
    enhancedPrompt = `GODLEVEL 360° PANORAMA MASTERY: ${prompt}. CRITICAL TECHNICAL REQUIREMENTS: Perfect seamless wrapping where left edge connects flawlessly with right edge creating continuous circular environment. Zero visible seams with mathematical precision. VR-optimized equirectangular projection with 2:1 aspect ratio perfection. Professional panoramic photography with immersive environmental continuity. GODLEVEL 360° excellence worthy of premium VR experiences.`
  } else if (type === "dome") {
    enhancedPrompt = `GODLEVEL DOME PROJECTION MASTERY: ${prompt}. CRITICAL TECHNICAL REQUIREMENTS: Perfect circular fisheye composition with radial symmetry and center focus optimization. Immersive 360° view compressed into flawless circular frame with expert distortion mapping. Planetarium-ready dome projection with professional calibration. GODLEVEL fisheye excellence for premium dome experiences.`
  } else {
    enhancedPrompt = `GODLEVEL STANDARD IMAGE MASTERY: ${prompt}. CRITICAL TECHNICAL REQUIREMENTS: Museum-quality composition with perfect framing and professional artistic standards. Award-winning photography with cinematic lighting and technical excellence. GODLEVEL artistic mastery worthy of international exhibitions.`
  }

  // Apply additional AI enhancement if requested
  if (enhancePrompt) {
    try {
      const aiEnhanced = enhancePromptWithAI(enhancedPrompt, enhancementLevel)
      enhancedPrompt = aiEnhanced
      console.log(`✨ Applied ${enhancementLevel} AI enhancement`)
    } catch (enhanceError) {
      console.log("AI enhancement failed, using base GODLEVEL prompt:", enhanceError)
    }
  }

  // Apply safety bypass for cultural content
  enhancedPrompt = applySafetyBypass(enhancedPrompt)

  // Ensure prompt is within limits while maintaining quality
  if (enhancedPrompt.length > 4000) {
    // Intelligently truncate while preserving key elements
    const keyParts = enhancedPrompt.split(", ")
    let truncatedPrompt = keyParts[0] // Keep the main subject

    for (let i = 1; i < keyParts.length; i++) {
      const testPrompt = truncatedPrompt + ", " + keyParts[i]
      if (testPrompt.length <= 3900) {
        truncatedPrompt = testPrompt
      } else {
        break
      }
    }

    enhancedPrompt = truncatedPrompt + ", GODLEVEL artistic excellence"
  }

  console.log(`📐 Image size: ${size}`)
  console.log(`📝 Final enhanced prompt length: ${enhancedPrompt.length} characters`)
  console.log(`🎯 Generation type: ${type} with GODLEVEL quality`)

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
        size: size as "1024x1024" | "1792x1024",
        quality: "hd",
        style: "vivid",
        response_format: "url",
      }),
    })

    console.log(`📥 OpenAI API response status: ${response.status}`)

    if (!response.ok) {
      let errorMessage = `OpenAI API error: ${response.status} ${response.statusText}`

      try {
        const errorData = await response.json()
        if (errorData.error?.message) {
          errorMessage = errorData.error.message
        }
      } catch (parseError) {
        console.error("Failed to parse OpenAI error response:", parseError)
      }

      console.error(`❌ OpenAI API error: ${errorMessage}`)
      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log("📥 OpenAI response received successfully")

    if (!data.data || !data.data[0] || !data.data[0].url) {
      throw new Error("No image URL returned from OpenAI API")
    }

    const imageUrl = data.data[0].url
    console.log(`✅ GODLEVEL image generated successfully: ${imageUrl.substring(0, 50)}...`)

    return {
      imageUrl,
      prompt: enhancedPrompt,
      revisedPrompt: data.data[0].revised_prompt || enhancedPrompt,
      originalPromptLength: prompt.length,
      finalPromptLength: enhancedPrompt.length,
    }
  } catch (error: any) {
    console.error(`❌ GODLEVEL generation failed:`, error)

    if (error.message?.includes("safety system") || error.message?.includes("content policy")) {
      // Try with ultra-safe GODLEVEL fallback prompt
      console.log("🛡️ Attempting GODLEVEL generation with ultra-safe fallback...")
      const ultraSafePrompt = `GODLEVEL CULTURAL ARTWORK: Beautiful abstract art inspired by ${type} composition with vibrant colors and professional quality. Museum-worthy cultural heritage visualization with educational content and artistic excellence. Premium artistic sophistication with respectful cultural celebration. Technical mastery with 8K resolution and masterpiece quality. GODLEVEL artistic beauty with international exhibition standards.`

      try {
        const fallbackResponse = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: ultraSafePrompt,
            n: 1,
            size: size as "1024x1024" | "1792x1024",
            quality: "hd",
            style: "vivid",
            response_format: "url",
          }),
        })

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          if (fallbackData.data?.[0]?.url) {
            console.log("✅ Ultra-safe GODLEVEL fallback generation successful")
            return {
              imageUrl: fallbackData.data[0].url,
              prompt: ultraSafePrompt,
              revisedPrompt: fallbackData.data[0].revised_prompt || ultraSafePrompt,
              originalPromptLength: prompt.length,
              finalPromptLength: ultraSafePrompt.length,
              fallbackUsed: true,
            }
          }
        }
      } catch (fallbackError) {
        console.error("❌ Ultra-safe GODLEVEL fallback also failed:", fallbackError)
      }
    }

    throw error
  }
}

export async function POST(request: NextRequest) {
  console.log("🚀 GODLEVEL Generation API route called")

  try {
    // Parse request body with comprehensive error handling
    let body: GenerationParams
    try {
      body = await request.json()
      console.log(`📥 Request body received - Dataset: ${body.dataset}, Scenario: ${body.scenario}`)
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON in request body",
          details: parseError instanceof Error ? parseError.message : "Unknown parsing error",
        },
        { status: 400 },
      )
    }

    console.log("📋 GODLEVEL Request parameters:", {
      dataset: body.dataset,
      scenario: body.scenario,
      colorScheme: body.colorScheme,
      customPrompt: body.customPrompt ? `${body.customPrompt.length} chars` : "none",
      enhancePrompt: body.enhancePrompt,
      enhancementLevel: body.enhancementLevel,
    })

    // Build the GODLEVEL prompt
    let finalPrompt: string
    try {
      finalPrompt = buildPrompt({
        dataset: body.dataset || "vietnamese",
        scenario: body.scenario || "trung-sisters",
        colorScheme: body.colorScheme || "metallic",
        seed: body.seed || 1234,
        numSamples: body.numSamples || 4000,
        noiseScale: body.noiseScale || 0.08,
        customPrompt: body.customPrompt || "",
        panoramic360: body.panoramic360 || false,
        panoramaFormat: body.panoramaFormat || "equirectangular",
        projectionType: body.projectionType || "fisheye",
      })
    } catch (promptError) {
      console.error("❌ Failed to build GODLEVEL prompt:", promptError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate GODLEVEL prompt",
          details: promptError instanceof Error ? promptError.message : "Unknown prompt error",
        },
        { status: 500 },
      )
    }

    if (!finalPrompt || finalPrompt.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Generated GODLEVEL prompt is empty",
        },
        { status: 400 },
      )
    }

    console.log(`📝 GODLEVEL prompt generated (${finalPrompt.length} chars)`)

    // Determine generation type
    let generationType: "standard" | "dome" | "360" = "standard"
    if (body.panoramic360) {
      generationType = "360"
    } else if (body.domeProjection) {
      generationType = "dome"
    }

    console.log(`🎯 GODLEVEL generation type: ${generationType}`)

    // Generate with OpenAI using GODLEVEL quality
    const result = await generateWithOpenAI(
      finalPrompt,
      generationType,
      body.enhancePrompt !== false,
      body.enhancementLevel || "moderate",
    )

    console.log("✅ GODLEVEL generation completed successfully")

    return NextResponse.json({
      success: true,
      imageUrl: result.imageUrl,
      prompt: result.prompt,
      revisedPrompt: result.revisedPrompt,
      type: generationType,
      parameters: {
        dataset: body.dataset,
        scenario: body.scenario,
        colorScheme: body.colorScheme,
        seed: body.seed,
        numSamples: body.numSamples,
        noiseScale: body.noiseScale,
        enhancePrompt: body.enhancePrompt,
        enhancementLevel: body.enhancementLevel,
      },
      promptStats: {
        originalLength: result.originalPromptLength,
        finalLength: result.finalPromptLength,
        fallbackUsed: result.fallbackUsed || false,
      },
      timestamp: new Date().toISOString(),
      quality: "GODLEVEL",
    })
  } catch (error: any) {
    console.error("❌ GODLEVEL Generation API error:", error)

    // Ensure we always return valid JSON
    const errorResponse = {
      success: false,
      error: error.message || "Unknown GODLEVEL generation error",
      details: error.stack || "No stack trace available",
      timestamp: new Date().toISOString(),
      quality: "GODLEVEL",
    }

    // Determine appropriate status code
    let statusCode = 500
    if (error.message?.includes("API key")) {
      statusCode = 401
    } else if (error.message?.includes("Invalid") || error.message?.includes("Empty")) {
      statusCode = 400
    } else if (error.message?.includes("rate limit")) {
      statusCode = 429
    }

    return NextResponse.json(errorResponse, { status: statusCode })
  }
}
