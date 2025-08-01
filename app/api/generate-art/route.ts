import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { generateFlowField, type GenerationParams } from "@/lib/flow-model"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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

    // Generate SVG first for mathematical base
    const params: GenerationParams = {
      dataset,
      scenario,
      colorScheme,
      seed,
      numSamples,
      noiseScale: noise,
      timeStep,
      domeProjection,
      domeDiameter,
      domeResolution,
      projectionType,
      panoramic360,
      panoramaResolution,
      panoramaFormat,
      stereographicPerspective,
    }

    console.log("📊 Generating SVG with params:", params)
    const svgContent = generateFlowField(params)

    // Build enhanced prompt for AI generation
    let enhancedPrompt = ""

    if (customPrompt) {
      enhancedPrompt = customPrompt + "\n\n"
    } else {
      enhancedPrompt = `${prompt}\n\n`
    }

    // Enhanced prompt building with Thailand-specific content
    enhancedPrompt += `Create an intricate generative art masterpiece inspired by '${dataset}' dataset, employing a '${colorScheme}' color scheme. The artwork should serve as an ideal base for professional 8K upscaling, focusing on clean, sharp edges and well-defined structures.\n\n`

    // Mathematical Precision with Thailand-specific enhancements
    enhancedPrompt += `### Mathematical Precision:\n`
    switch (dataset) {
      case "thailand":
        enhancedPrompt += `Arrange exactly ${numSamples.toLocaleString()} Thai cultural heritage elements organically across the canvas, creating an authentic representation of Thailand's rich cultural tapestry. Include golden Buddhist temples (Wat) with intricate spires and traditional Thai architecture featuring multi-tiered roofs, ornate decorations, and golden accents. Show traditional Thai classical dancers in elaborate silk costumes with intricate headdresses, graceful hand gestures (mudras), and flowing movements. Depict bustling floating markets with colorful longtail boats, vendors selling tropical fruits, flowers, and traditional crafts along scenic waterways. Include iconic tuk-tuks navigating busy streets filled with street food vendors, traditional shophouses, and vibrant urban life. Feature Buddhist monks in saffron robes walking in procession, meditating in temple courtyards, and participating in daily alms rounds. Show magnificent royal palaces with traditional Thai architecture, golden stupas, guardian statues, and ornate gardens. Include Thai festivals like Songkran (water festival) with people celebrating, Loy Krathong with floating lanterns and lotus offerings, and traditional ceremonies with dancers, musicians, and cultural performances. Add traditional Thai houses on stilts, spirit houses (san phra phum), lotus ponds, tropical vegetation, and authentic Thai cultural symbols throughout the composition. Each element should be mathematically distributed using cultural clustering algorithms that reflect authentic Thai settlement patterns and cultural organization. `
        break
      case "spirals":
        enhancedPrompt += `Arrange exactly ${numSamples.toLocaleString()} spiral elements organically across the canvas, ensuring each one is unique yet harmoniously integrated with the others. The spirals should vary in size and density, creating dynamic flow throughout the piece with Fibonacci proportions, golden ratio curves, nautilus shell formations, and galaxy arm patterns. Include logarithmic spirals r=ae^(bθ) and Archimedean spirals with mathematical precision. `
        break
      case "fractal":
        enhancedPrompt += `Generate exactly ${numSamples.toLocaleString()} fractal branching elements with self-similar structures at multiple scales. Each fractal should follow L-system rules F→F[+F]F[-F]F with recursive branching, creating tree-like formations, lightning patterns, fern fronds, and organic growth structures with mathematical precision and infinite detail. `
        break
      case "mandelbrot":
        enhancedPrompt += `Create exactly ${numSamples.toLocaleString()} Mandelbrot set iteration points with complex plane mathematics z_{n+1} = z_n² + c. Include cardioid main bulbs, circular bulbs, infinite zoom detail with smooth escape-time coloring, fractal boundary precision, and psychedelic swirling patterns. `
        break
      case "tribes":
        enhancedPrompt += `Arrange exactly ${numSamples.toLocaleString()} tribal settlement elements including people in traditional clothing, authentic dwellings, ceremonial circles, and cultural activities. Each figure should be unique with tribal details including chiefs, shamans, dancers, craftspeople, children playing, and daily life scenes with rich cultural storytelling. `
        break
      case "heads":
        enhancedPrompt += `Compose exactly ${numSamples.toLocaleString()} facial feature elements creating portrait mosaics with golden ratio proportions φ=1.618. Each face should have unique expressions, geometric tessellation, anatomical precision, artistic interpretation, and mosaic composition with human beauty. `
        break
      case "natives":
        enhancedPrompt += `Design exactly ${numSamples.toLocaleString()} native settlement elements with longhouses, tipis, medicine wheels, and ceremonial spaces. Include people in traditional dress, seasonal activities, authentic indigenous architecture, and cultural ceremonies. `
        break
      default:
        enhancedPrompt += `Arrange exactly ${numSamples.toLocaleString()} ${dataset} elements with mathematical precision and organic distribution across the canvas, ensuring each element is unique yet harmoniously integrated. `
    }

    // Color Palette with Thailand-specific colors
    enhancedPrompt += `\n### Color Palette:\n`
    if (dataset === "thailand") {
      switch (colorScheme) {
        case "sunset":
          enhancedPrompt += `Employ authentic Thai sunset colors with golden temple hues (#FFD700), saffron monk robes (#FF8C00), royal purple (#800080), traditional red (#DC143C), and warm oranges (#FF6347). Include the golden glow of temple spires, the warm light of floating lanterns, and the rich colors of traditional Thai silk with natural harmony and cultural authenticity. `
          break
        case "cosmic":
          enhancedPrompt += `Use Thai royal colors with deep golden yellows (#FFD700), royal blues (#0047AB), traditional reds (#DC143C), and pure whites (#FFFFFF). Include the cosmic beauty of Thai temple architecture reaching toward the heavens with stellar lighting effects and spiritual atmosphere. `
          break
        case "plasma":
          enhancedPrompt += `Utilize vibrant Thai festival colors with electric blues of traditional ceramics (#0066CC), hot magentas of silk fabrics (#FF1493), golden temple accents (#FFD700), and bright festival oranges (#FF8C00). Create the energy and vibrancy of Thai celebrations with luminous effects and cultural depth. `
          break
        default:
          enhancedPrompt += `Utilize authentic Thai ${colorScheme} palette with rich, culturally significant colors including temple gold, saffron orange, royal purple, traditional red, and ceremonial white, creating emotional impact and cultural authenticity with professional color harmony. `
      }
    } else {
      switch (colorScheme) {
        case "plasma":
          enhancedPrompt += `Utilize a vibrant and high-contrast plasma color scheme with deep purples (#0d0887), electric blues (#46039f), hot magentas (#7201a8), coral oranges (#bd3786), bright oranges (#ed7953), and golden yellows (#fdca26). Include gradients with smooth transitions and luminous effects, interspersed with dark shadows to create depth and dimension. `
          break
        case "sunset":
          enhancedPrompt += `Employ warm sunset colors with fiery oranges (#ff6b35), golden yellows (#f7931e), soft pinks (#ffd23f), deep purples (#5d2e5d), and cool blues (#1fb3d3). Create romantic golden hour lighting with natural color harmony and atmospheric warmth. `
          break
        case "cosmic":
          enhancedPrompt += `Use deep space colors with rich browns (#2c1810), rusty oranges (#8b4513), stellar golds (#ffa500), bright yellows (#ffff00), and pure whites (#ffffff). Include nebula-like beauty with cosmic atmosphere and stellar lighting effects. `
          break
        default:
          enhancedPrompt += `Utilize a ${colorScheme} color palette with rich, vibrant colors creating emotional impact and visual harmony with professional color theory and smooth gradients. `
      }
    }

    // Scenario Integration with Thailand-specific scenarios
    switch (scenario) {
      case "pure":
        enhancedPrompt += `Present the mathematical patterns in their purest form with minimal artistic interpretation. Focus on the raw mathematical beauty with clean geometric forms, precise mathematical relationships, and abstract mathematical visualization. Display mathematical formulas, equations, and numerical relationships as visual elements. Include mathematical notation like ∑, ∫, ∂, π, φ, e, and complex mathematical expressions rendered as artistic typography. Show mathematical graphs, coordinate systems, function plots, and geometric proofs as decorative elements. `
        break
      case "landscape":
        if (dataset === "thailand") {
          enhancedPrompt += `Set in breathtaking Thai natural landscape with golden temples nestled among lush tropical hills, winding rivers with floating markets, ancient forests with hidden shrines, and scenic rice terraces. Include traditional Thai villages with wooden houses on stilts, coconut palms, lotus ponds, and the serene beauty of Thai countryside. Show people living in harmony with nature, monks walking forest paths, fishermen on traditional boats, and the peaceful integration of Thai culture with the natural environment. Add misty mountains, tropical waterfalls, and the golden light of Thai sunsets illuminating the cultural landscape. `
        } else if (dataset === "tribes" || dataset === "natives") {
          enhancedPrompt += `Set in breathtaking natural landscape with tribal villages nestled in rolling valleys, flowing rivers, and ancient forests. Include people living in harmony with nature, smoke rising from cooking fires, daily activities, cultural ceremonies, and environmental storytelling. `
        } else {
          enhancedPrompt += `Set in majestic natural landscape incorporating ${dataset} patterns in terrain formations, mountain ranges, river systems, atmospheric phenomena, and geological structures with cinematic lighting. `
        }
        break
      case "architectural":
        if (dataset === "thailand") {
          enhancedPrompt += `Set in magnificent Thai architectural environment showcasing traditional temple architecture with multi-tiered roofs, golden spires, intricate wood carvings, and ornate decorations. Include royal palaces with traditional Thai design elements, modern Bangkok skyline with traditional influences, ancient ruins of Ayutthaya, and the harmonious blend of traditional and contemporary Thai architecture. Show detailed craftsmanship, geometric patterns, and the mathematical precision of Thai architectural design. `
        } else {
          enhancedPrompt += `Set in futuristic architectural environment with ${dataset} patterns integrated into building design, structural engineering, urban planning, and modern materials with geometric precision. `
        }
        break
      case "botanical":
        if (dataset === "thailand") {
          enhancedPrompt += `Set in lush Thai botanical environment with tropical flowers like orchids, lotus blossoms, and frangipani, traditional herb gardens, sacred Bodhi trees, bamboo groves, and tropical fruit trees. Include traditional Thai garden design with geometric patterns, water features, and the integration of cultural elements with natural beauty. Show the rich biodiversity of Thailand with vibrant vegetation and traditional landscape architecture. `
        } else {
          enhancedPrompt += `Set in lush botanical environment with ${dataset} patterns in plant growth, flower arrangements, leaf structures, natural organic beauty, and vibrant vegetation. `
        }
        break
      case "urban":
        if (dataset === "thailand") {
          enhancedPrompt += `Set in vibrant Thai urban environment with bustling Bangkok streets, traditional markets, modern shopping centers, street food vendors, tuk-tuks navigating traffic, traditional shophouses mixed with modern buildings, and the dynamic energy of Thai city life. Include neon signs with Thai script, traditional architecture integrated into urban planning, and the unique character of Thai metropolitan areas. `
        } else {
          enhancedPrompt += `Set in dynamic urban environment showcasing ${dataset} patterns with metropolitan energy and architectural diversity. `
        }
        break
      default:
        if (dataset === "thailand") {
          enhancedPrompt += `Set in authentic Thai ${scenario} environment showcasing traditional cultural elements with thematic consistency and cultural accuracy, highlighting the beauty and richness of Thai heritage. `
        } else {
          enhancedPrompt += `Set in ${scenario} environment showcasing ${dataset} patterns with thematic consistency and visual appeal. `
        }
    }

    // Additional sections
    enhancedPrompt += `\n### Textures and Patterns:\nIntroduce complex textures within the ${dataset} elements, such as fine lines, cross-hatching, stippling, or organic dotting patterns, which will reveal new details upon close inspection. `

    if (dataset === "thailand") {
      enhancedPrompt += `Include traditional Thai patterns like flame motifs, lotus designs, geometric temple decorations, silk textile patterns, and intricate wood carving details. `
    }

    enhancedPrompt += `Ensure that these intricate patterns are meticulously crafted to reward viewers and enhance during upscaling. `

    enhancedPrompt += `\n### Noise Texture:\nApply a subtle noise texture of ${noise} to the entire image, giving it a tactile, almost tactile surface that adds sophistication and visual interest without overwhelming the primary elements. `

    enhancedPrompt += `\n### Professional Composition:\nDesign the composition with a balance that suits large-format printing. The ${dataset} elements should guide the viewer's eye seamlessly across the canvas, creating a sense of movement and energy with rule of thirds, leading lines, and focal points. `

    if (dataset === "thailand") {
      enhancedPrompt += `Use traditional Thai compositional principles with central focal points (like temple spires), balanced symmetry, and harmonious integration of cultural elements. `
    }

    enhancedPrompt += `\n### Gallery-Quality:\nEnsure that the overall artwork exudes a refined, gallery-quality aesthetic suitable for exhibition, with each element contributing to a cohesive and engaging visual narrative. Focus on maintaining sharp, clean edges around each ${dataset} element and between color transitions to ensure clarity and precision are preserved during upscaling. Design with rich detail that enhances beautifully when processed through AI upscaling algorithms, emphasizing the depth and complexity of the piece.\n\n`

    // Add dome and panorama specifications
    if (domeProjection) {
      enhancedPrompt += `\n### Dome Projection Optimization:\nOptimize the artwork for ${domeDiameter}m diameter dome projection at ${domeResolution} resolution using ${projectionType} projection. Ensure all visual elements are positioned and scaled appropriately for immersive planetarium display, with central focus points and radial composition that works effectively in a dome environment. `
    }

    if (panoramic360) {
      enhancedPrompt += `\n### 360° Panorama Optimization:\nOptimize for ${panoramaResolution} 360° panoramic viewing in ${panoramaFormat} format. Ensure seamless wraparound composition with no visible seams, appropriate horizon placement, and visual elements that work effectively in virtual reality and 360° viewing environments. `

      if (panoramaFormat === "stereographic" && stereographicPerspective) {
        enhancedPrompt += `Use ${stereographicPerspective} stereographic perspective for unique visual impact. `
      }
    }

    enhancedPrompt += `\n\nBy adhering to these guidelines, the resulting image will be an exquisite generative art masterpiece, optimized for professional 8K upscaling and perfect for large-format, gallery-quality display. Ultra-high resolution with 16-bit color depth, advanced rendering, photorealistic detail, cinematic composition, and museum-worthy artistic excellence.`

    console.log("🤖 Sending prompt to OpenAI DALL-E 3...")
    console.log("📝 Prompt length:", enhancedPrompt.length)

    // Generate main image with OpenAI DALL-E 3
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "vivid",
    })

    const mainImageUrl = response.data[0]?.url
    if (!mainImageUrl) {
      throw new Error("No image URL returned from OpenAI")
    }

    console.log("✅ Main image generated successfully")

    // Initialize generation details
    const generationDetails = {
      mainImage: "Generated successfully",
      domeImage: "Not requested",
      panoramaImage: "Not requested",
    }

    let domeImageUrl: string | undefined
    let panoramaImageUrl: string | undefined

    // Generate dome projection if requested
    if (domeProjection) {
      try {
        console.log("🏛️ Generating dome projection...")

        const domePrompt = `Transform this artwork for ${domeDiameter}m diameter dome projection: ${enhancedPrompt}\n\nAdditional dome-specific requirements:\n- Optimize for ${domeResolution} resolution dome display\n- Use ${projectionType} projection mapping\n- Ensure central focal point for overhead viewing\n- Radial composition suitable for planetarium environment\n- Maintain visual clarity when projected on curved dome surface\n- Consider viewer perspective from dome center looking up`

        const domeResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: domePrompt,
          n: 1,
          size: "1024x1024",
          quality: "hd",
          style: "vivid",
        })

        domeImageUrl = domeResponse.data[0]?.url
        generationDetails.domeImage = domeImageUrl ? "Generated successfully" : "Generation failed"
        console.log("✅ Dome projection generated successfully")
      } catch (error) {
        console.error("❌ Dome projection generation failed:", error)
        generationDetails.domeImage = "Generation failed - using main image"
        domeImageUrl = mainImageUrl // Fallback to main image
      }
    }

    // Generate 360° panorama if requested
    if (panoramic360) {
      try {
        console.log("🌐 Generating 360° panorama...")

        let panoramaPrompt = `Transform this artwork for 360° panoramic viewing: ${enhancedPrompt}\n\nAdditional panorama-specific requirements:\n- Optimize for ${panoramaResolution} resolution 360° display\n- Use ${panoramaFormat} format projection\n- Ensure seamless wraparound composition with no visible seams\n- Appropriate horizon placement for VR viewing\n- Visual elements distributed for 360° immersive experience`

        if (panoramaFormat === "stereographic" && stereographicPerspective) {
          panoramaPrompt += `\n- Apply ${stereographicPerspective} stereographic projection for unique visual perspective`
        }

        const panoramaResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: panoramaPrompt,
          n: 1,
          size: "1024x1024",
          quality: "hd",
          style: "vivid",
        })

        panoramaImageUrl = panoramaResponse.data[0]?.url
        generationDetails.panoramaImage = panoramaImageUrl ? "Generated successfully" : "Generation failed"
        console.log("✅ 360° panorama generated successfully")
      } catch (error) {
        console.error("❌ 360° panorama generation failed:", error)
        generationDetails.panoramaImage = "Generation failed - using main image"
        panoramaImageUrl = mainImageUrl // Fallback to main image
      }
    }

    const result = {
      success: true,
      image: mainImageUrl,
      domeImage: domeImageUrl,
      panoramaImage: panoramaImageUrl,
      svgContent,
      originalPrompt: enhancedPrompt,
      promptLength: enhancedPrompt.length,
      estimatedFileSize: "~2-4MB (1024x1024 HD)",
      provider: "OpenAI",
      model: "DALL-E 3",
      generationDetails,
      parameters: {
        dataset,
        scenario,
        colorScheme,
        seed,
        numSamples,
        noiseScale: noise,
        timeStep,
        domeProjection,
        domeDiameter,
        domeResolution,
        projectionType,
        panoramic360,
        panoramaResolution,
        panoramaFormat,
        stereographicPerspective,
      },
    }

    console.log("🎉 Generation completed successfully")
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("💥 Generation failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate artwork",
      },
      { status: 500 },
    )
  }
}
