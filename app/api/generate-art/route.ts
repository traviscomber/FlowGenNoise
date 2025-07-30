import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("=== Generate Art API Called ===")

    // Check if OpenAI API key exists
    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ OpenAI API key not found in environment variables")
      return NextResponse.json(
        {
          success: false,
          error: "OpenAI API key not configured. Please check environment variables.",
          details: "OPENAI_API_KEY is missing",
        },
        { status: 500 },
      )
    }

    console.log("✅ OpenAI API key found")

    const body = await request.json()
    console.log("📝 Request body:", JSON.stringify(body, null, 2))

    const {
      prompt = "abstract mathematical art",
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
      panoramaFormat = "equirectangular",
      stereographicPerspective = "little-planet",
    } = body

    // Build enhanced prompt
    let enhancedPrompt = ""

    if (customPrompt) {
      enhancedPrompt = `${customPrompt}\n\n`
    } else {
      enhancedPrompt = `${prompt}\n\n`
    }

    // Add mathematical foundation
    enhancedPrompt += `Create an intricate generative art masterpiece inspired by '${dataset}' mathematical patterns, employing a '${colorScheme}' color scheme. The artwork should be optimized for professional 8K upscaling with clean, sharp edges and well-defined structures.\n\n`

    // Dataset-specific details
    switch (dataset) {
      case "spirals":
        enhancedPrompt += `Generate exactly ${numSamples.toLocaleString()} spiral elements with Fibonacci proportions, golden ratio curves, nautilus shell formations, and galaxy arm patterns. Include logarithmic spirals r=ae^(bθ) and Archimedean spirals with mathematical precision. `
        break
      case "fractal":
        enhancedPrompt += `Create exactly ${numSamples.toLocaleString()} fractal branching elements with self-similar structures at multiple scales. Each fractal should follow L-system rules with recursive branching, creating tree-like formations and organic growth structures. `
        break
      case "mandelbrot":
        enhancedPrompt += `Generate exactly ${numSamples.toLocaleString()} Mandelbrot set iteration points with complex plane mathematics z_{n+1} = z_n² + c. Include cardioid main bulbs, circular bulbs, and infinite zoom detail with smooth escape-time coloring. `
        break
      case "tribes":
        enhancedPrompt += `Arrange exactly ${numSamples.toLocaleString()} tribal settlement elements including people in traditional clothing, authentic dwellings, ceremonial circles, and cultural activities with rich storytelling. `
        break
      default:
        enhancedPrompt += `Arrange exactly ${numSamples.toLocaleString()} ${dataset} elements with mathematical precision and organic distribution across the canvas. `
    }

    // Color scheme details
    switch (colorScheme) {
      case "plasma":
        enhancedPrompt += `Utilize a vibrant plasma color scheme with deep purples (#0d0887), electric blues (#46039f), hot magentas (#7201a8), coral oranges (#bd3786), bright oranges (#ed7953), and golden yellows (#fdca26). `
        break
      case "rainbow":
        enhancedPrompt += `Use full rainbow spectrum with vibrant reds, oranges, yellows, greens, blues, and violets creating prismatic beauty with chromatic dispersion effects. `
        break
      case "ocean":
        enhancedPrompt += `Apply ocean colors with deep blues, turquoise, seafoam greens, and white foam creating aquatic beauty with flowing water effects. `
        break
      case "cosmic":
        enhancedPrompt += `Use deep space colors with rich browns, rusty oranges, stellar golds, bright yellows, and pure whites creating nebula-like beauty with cosmic atmosphere. `
        break
      default:
        enhancedPrompt += `Utilize a ${colorScheme} color palette with rich, vibrant colors creating emotional impact and visual harmony. `
    }

    // Scenario integration
    switch (scenario) {
      case "landscape":
        enhancedPrompt += `Set in majestic natural landscape incorporating ${dataset} patterns in terrain formations, mountain ranges, river systems, and atmospheric phenomena with cinematic lighting. `
        break
      case "architectural":
        enhancedPrompt += `Set in futuristic architectural environment with ${dataset} patterns integrated into building design, structural engineering, and modern materials. `
        break
      case "crystalline":
        enhancedPrompt += `Set in spectacular crystal formations with ${dataset} patterns in mineral structures, prismatic light effects, and rainbow refractions. `
        break
      default:
        enhancedPrompt += `Set in ${scenario} environment showcasing ${dataset} patterns with thematic consistency. `
    }

    // Technical specifications
    enhancedPrompt += `\n\nApply noise texture of ${noise} for sophisticated surface quality. Use time step of ${timeStep} for smooth temporal flow. Ensure gallery-quality aesthetic suitable for exhibition with sharp, clean edges and rich detail that enhances during AI upscaling. Ultra-high resolution with 16-bit color depth, advanced rendering, photorealistic detail, and museum-worthy artistic excellence.`

    console.log("🎨 Enhanced prompt created:", enhancedPrompt.substring(0, 200) + "...")
    console.log("📏 Prompt length:", enhancedPrompt.length)

    // Truncate prompt if too long for OpenAI
    const finalPrompt = enhancedPrompt.length > 4000 ? enhancedPrompt.substring(0, 3997) + "..." : enhancedPrompt

    console.log("🚀 Calling OpenAI API...")

    // Call OpenAI API
    const openaiResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: finalPrompt,
        n: 1,
        size: "1024x1024",
        quality: "hd",
        style: "vivid",
      }),
    })

    console.log("📡 OpenAI Response status:", openaiResponse.status)

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error("❌ OpenAI API error:", errorText)

      let errorMessage = "OpenAI API error"
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.error?.message || errorMessage
        console.error("🔍 Parsed error:", errorData)
      } catch (parseError) {
        console.error("🔍 Raw error text:", errorText.substring(0, 500))
        errorMessage = `HTTP ${openaiResponse.status}: ${errorText.substring(0, 200)}`
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          details: {
            status: openaiResponse.status,
            statusText: openaiResponse.statusText,
            promptLength: finalPrompt.length,
          },
        },
        { status: 500 },
      )
    }

    const openaiData = await openaiResponse.json()
    console.log("✅ OpenAI response received")

    if (!openaiData.data || !openaiData.data[0] || !openaiData.data[0].url) {
      console.error("❌ No image URL in OpenAI response:", openaiData)
      return NextResponse.json(
        {
          success: false,
          error: "No image URL returned from OpenAI",
          details: openaiData,
        },
        { status: 500 },
      )
    }

    const imageUrl = openaiData.data[0].url
    console.log("🖼️ Image generated successfully:", imageUrl.substring(0, 50) + "...")

    // Handle dome projection if requested
    let domeImageUrl = undefined
    let domeGenerationStatus = "Not requested"

    if (domeProjection) {
      console.log("🏛️ Generating dome projection...")

      const domePrompt = `Create a stunning ${dataset} mathematical art visualization specifically designed for ${domeDiameter}-meter diameter dome projection with ${domeResolution} resolution. Perfect circular composition that fills the entire frame edge-to-edge with all ${dataset} elements arranged in concentric circles radiating from center. ${projectionType} projection mapping with 180-degree field of view. Central focal point with strongest visual elements. Radial symmetry optimized for curved dome surfaces. ${colorScheme} color palette optimized for dome viewing.`

      try {
        const domeResponse = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: domePrompt.length > 4000 ? domePrompt.substring(0, 3997) + "..." : domePrompt,
            n: 1,
            size: "1024x1024",
            quality: "hd",
            style: "vivid",
          }),
        })

        if (domeResponse.ok) {
          const domeData = await domeResponse.json()
          if (domeData.data && domeData.data[0] && domeData.data[0].url) {
            domeImageUrl = domeData.data[0].url
            domeGenerationStatus = "Generated successfully"
            console.log("✅ Dome projection generated")
          } else {
            domeImageUrl = imageUrl
            domeGenerationStatus = "API returned no image, using main image"
          }
        } else {
          domeImageUrl = imageUrl
          domeGenerationStatus = `Generation failed: HTTP ${domeResponse.status}`
        }
      } catch (error) {
        console.error("❌ Dome generation error:", error)
        domeImageUrl = imageUrl
        domeGenerationStatus = `Exception: ${error.message}`
      }
    }

    // Handle 360° panorama if requested
    let panoramaImageUrl = undefined
    let panoramaGenerationStatus = "Not requested"

    if (panoramic360) {
      console.log("🌐 Generating 360° panorama...")

      let panoramaPrompt =
        finalPrompt +
        `\n\n360° PANORAMIC OPTIMIZATION: Specially designed for 360-degree panoramic viewing with ${panoramaResolution} resolution and ${panoramaFormat} projection format. Seamless wraparound composition with no visible seams.`

      if (panoramaFormat === "equirectangular") {
        panoramaPrompt += ` Equirectangular projection with 2:1 aspect ratio for VR headsets.`
      } else if (panoramaFormat === "stereographic" && stereographicPerspective === "little-planet") {
        panoramaPrompt += ` Little planet stereographic projection with central focal point creating spherical planet effect.`
      }

      try {
        const panoramaResponse = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: panoramaPrompt.length > 4000 ? panoramaPrompt.substring(0, 3997) + "..." : panoramaPrompt,
            n: 1,
            size: panoramaFormat === "equirectangular" ? "1792x1024" : "1024x1024",
            quality: "hd",
            style: "vivid",
          }),
        })

        if (panoramaResponse.ok) {
          const panoramaData = await panoramaResponse.json()
          if (panoramaData.data && panoramaData.data[0] && panoramaData.data[0].url) {
            panoramaImageUrl = panoramaData.data[0].url
            panoramaGenerationStatus = "Generated successfully"
            console.log("✅ 360° panorama generated")
          } else {
            panoramaImageUrl = imageUrl
            panoramaGenerationStatus = "API returned no image, using main image"
          }
        } else {
          panoramaImageUrl = imageUrl
          panoramaGenerationStatus = `Generation failed: HTTP ${panoramaResponse.status}`
        }
      } catch (error) {
        console.error("❌ Panorama generation error:", error)
        panoramaImageUrl = imageUrl
        panoramaGenerationStatus = `Exception: ${error.message}`
      }
    }

    console.log("🎉 All generation complete")

    return NextResponse.json({
      success: true,
      image: imageUrl,
      domeImage: domeImageUrl,
      panoramaImage: panoramaImageUrl,
      originalPrompt: finalPrompt,
      promptLength: finalPrompt.length,
      provider: "OpenAI",
      model: "DALL-E 3",
      estimatedFileSize: "~2-4MB",
      parameters: {
        dataset,
        scenario,
        colorScheme,
        seed,
        numSamples,
        noise,
        timeStep,
        domeProjection,
        panoramic360,
      },
      generationDetails: {
        mainImage: "Generated successfully",
        domeImage: domeGenerationStatus,
        panoramaImage: panoramaGenerationStatus,
      },
      debug: {
        hasApiKey: !!process.env.OPENAI_API_KEY,
        promptLength: finalPrompt.length,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error("💥 Fatal error in generate-art API:", error)
    console.error("Stack trace:", error.stack)

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate artwork",
        details: {
          name: error.name,
          stack: error.stack?.substring(0, 500),
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    )
  }
}
