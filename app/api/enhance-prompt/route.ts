import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      currentPrompt,
      dataset = "spirals",
      scenario = "landscape",
      colorScheme = "plasma",
      numSamples = 3000,
      noiseScale = 0.1,
      domeProjection = false,
      domeDiameter = 10,
      domeResolution = "4K",
      panoramic360 = false,
      panoramaResolution = "8K",
      stereographicPerspective = "little-planet",
    } = body

    if (!currentPrompt) {
      return NextResponse.json({ success: false, error: "No prompt provided" }, { status: 400 })
    }

    // Build comprehensive enhancement using the professional structure
    let enhancementContext = `Transform this artistic vision into a professional generative art masterpiece: "${currentPrompt}"\n\n`

    enhancementContext += `Create an intricate generative art masterpiece inspired by the user's vision, employing professional gallery-quality standards. The artwork should serve as an ideal base for professional 8K upscaling, focusing on clean, sharp edges and well-defined structures.\n\n`

    // MATHEMATICAL PRECISION - Dataset specific
    enhancementContext += `### MATHEMATICAL PRECISION - ${dataset.toUpperCase()} DATASET:\n`
    switch (dataset) {
      case "spirals":
        enhancementContext += `Arrange exactly ${numSamples.toLocaleString()} spiral elements organically across the canvas, ensuring each one is unique yet harmoniously integrated. The spirals should vary in size and density, creating dynamic flow with Fibonacci proportions, golden ratio curves, and nautilus shell formations. Include logarithmic spirals, Archimedean spirals, and galaxy arm patterns.\n`
        break
      case "fractal":
        enhancementContext += `Generate exactly ${numSamples.toLocaleString()} fractal branching elements with self-similar structures at multiple scales. Each fractal should follow L-system rules with recursive branching, creating tree-like formations, lightning patterns, and organic growth structures with mathematical precision.\n`
        break
      case "mandelbrot":
        enhancementContext += `Create exactly ${numSamples.toLocaleString()} Mandelbrot set iteration points with complex plane mathematics. Include cardioid main bulbs, circular bulbs, and infinite zoom detail with smooth escape-time coloring and fractal boundary precision.\n`
        break
      case "tribes":
        enhancementContext += `Arrange exactly ${numSamples.toLocaleString()} tribal settlement elements including people in traditional clothing, dwellings, ceremonial circles, and cultural activities. Each figure should be unique with authentic tribal details, chiefs, shamans, dancers, and daily life scenes.\n`
        break
      case "heads":
        enhancementContext += `Compose exactly ${numSamples.toLocaleString()} facial feature elements creating portrait mosaics with golden ratio proportions. Each face should have unique expressions, geometric tessellation, and anatomical precision with artistic interpretation.\n`
        break
      case "natives":
        enhancementContext += `Design exactly ${numSamples.toLocaleString()} native settlement elements with longhouses, tipis, medicine wheels, and ceremonial spaces. Include people in traditional dress, seasonal activities, and authentic indigenous architecture.\n`
        break
      case "julia":
        enhancementContext += `Generate exactly ${numSamples.toLocaleString()} Julia set elements with flowing fractal boundaries, connected and disconnected sets, and parameter space exploration with mathematical elegance.\n`
        break
      case "lorenz":
        enhancementContext += `Create exactly ${numSamples.toLocaleString()} Lorenz attractor trajectory points forming butterfly-wing patterns with chaotic beauty, strange attractor dynamics, and three-dimensional flow.\n`
        break
      case "voronoi":
        enhancementContext += `Arrange exactly ${numSamples.toLocaleString()} Voronoi cell seed points creating natural tessellation patterns like cracked earth, giraffe spots, or honeycomb structures with organic boundaries.\n`
        break
      case "cellular":
        enhancementContext += `Generate exactly ${numSamples.toLocaleString()} cellular automata elements showing Conway's Game of Life patterns, gliders, oscillators, and emergent complexity from simple rules.\n`
        break
      case "gaussian":
        enhancementContext += `Create exactly ${numSamples.toLocaleString()} Gaussian distribution points forming bell-curve landscapes, statistical visualizations, and probability density patterns.\n`
        break
      case "diffusion":
        enhancementContext += `Design exactly ${numSamples.toLocaleString()} reaction-diffusion pattern elements creating Turing patterns like zebra stripes, leopard spots, and natural biological formations.\n`
        break
      case "wave":
        enhancementContext += `Generate exactly ${numSamples.toLocaleString()} wave interference elements showing constructive and destructive patterns, standing waves, and fluid dynamics.\n`
        break
      default:
        enhancementContext += `Arrange exactly ${numSamples.toLocaleString()} ${dataset} elements with mathematical precision and organic distribution across the canvas.\n`
    }

    // COLOR PALETTE - Contextual to selected scheme
    enhancementContext += `\n### COLOR PALETTE - ${colorScheme.toUpperCase()} SCHEME:\n`
    switch (colorScheme) {
      case "plasma":
        enhancementContext += `Utilize a vibrant plasma color scheme with deep purples (#0d0887), electric blues (#46039f), hot magentas (#7201a8), coral oranges (#bd3786), bright oranges (#ed7953), and golden yellows (#fdca26). Create high-contrast gradients with smooth transitions and luminous effects.\n`
        break
      case "magma":
        enhancementContext += `Utilize a vibrant magma color scheme featuring deep reds, oranges, yellows, and black. Include gradients from deep reds and oranges to bright yellows, interspersed with dark, almost black shadows to create depth and dimension.\n`
        break
      case "sunset":
        enhancementContext += `Employ warm sunset colors with fiery oranges (#ff6b35), golden yellows (#f7931e), soft pinks (#ffd23f), deep purples (#5d2e5d), and cool blues (#1fb3d3). Create romantic golden hour lighting with natural color harmony.\n`
        break
      case "cosmic":
        enhancementContext += `Use deep space colors with rich browns (#2c1810), rusty oranges (#8b4513), stellar golds (#ffa500), bright yellows (#ffff00), and pure whites (#ffffff). Include nebula-like beauty with cosmic atmosphere.\n`
        break
      case "quantum":
        enhancementContext += `Apply futuristic quantum colors with deep space blues (#000428), electric cyans (#009ffd), bright whites (#ffffff), and glowing effects. Create high-tech sci-fi atmosphere with energy visualization.\n`
        break
      case "thermal":
        enhancementContext += `Implement thermal imaging colors from cool blacks (#000000) through deep purples (#440154), ocean blues (#31688e), forest greens (#35b779), to bright yellows (#fde725). Create smooth temperature gradients.\n`
        break
      case "spectral":
        enhancementContext += `Use full rainbow spectrum with vibrant reds (#9e0142), oranges (#d53e4f), yellows (#fdae61), greens (#abdda4), blues (#3288bd), and violets (#5e4fa2). Create prismatic beauty with chromatic dispersion.\n`
        break
      default:
        enhancementContext += `Utilize a ${colorScheme} color palette with rich, vibrant colors creating emotional impact and visual harmony with professional color theory.\n`
    }

    // SCENARIO INTEGRATION
    enhancementContext += `\n### VISUAL SCENARIO - ${scenario.toUpperCase()} SETTING:\n`
    switch (scenario) {
      case "landscape":
        if (dataset === "tribes" || dataset === "natives") {
          enhancementContext += `Set in breathtaking natural landscape with tribal villages nestled in valleys, flowing rivers, ancient forests. Include people living in harmony with nature, smoke from cooking fires, daily activities, and cultural ceremonies integrated with the terrain.\n`
        } else {
          enhancementContext += `Set in majestic natural landscape incorporating ${dataset} patterns in terrain formations, mountain ranges, river systems, and atmospheric phenomena. Include cinematic lighting and environmental storytelling.\n`
        }
        break
      case "architectural":
        enhancementContext += `Set in futuristic architectural environment with ${dataset} patterns integrated into building design, structural engineering, and urban planning. Include modern materials and geometric precision.\n`
        break
      case "crystalline":
        enhancementContext += `Set in spectacular crystal formations with ${dataset} patterns in mineral structures, prismatic light effects, rainbow refractions, and gem-like beauty.\n`
        break
      case "botanical":
        enhancementContext += `Set in lush botanical environment with ${dataset} patterns in plant growth, flower arrangements, leaf structures, and natural organic beauty.\n`
        break
      default:
        enhancementContext += `Set in ${scenario} environment showcasing ${dataset} patterns with thematic consistency and visual appeal.\n`
    }

    // TEXTURES AND PATTERNS
    enhancementContext += `\n### TEXTURES AND PATTERNS:\n`
    enhancementContext += `Introduce complex textures within the ${dataset} elements, such as fine lines, cross-hatching, stippling, or organic dotting patterns. These intricate details should be meticulously crafted to reward close inspection and enhance beautifully during upscaling. Each texture should contribute to the overall mathematical beauty while maintaining visual coherence.\n`

    // NOISE TEXTURE
    enhancementContext += `\n### NOISE TEXTURE:\n`
    enhancementContext += `Apply a subtle noise texture of ${noiseScale} to the entire image, giving it a tactile, sophisticated surface that adds visual interest without overwhelming the primary ${dataset} elements. This noise should enhance the organic feel and provide texture variation.\n`

    // COMPOSITION
    enhancementContext += `\n### PROFESSIONAL COMPOSITION:\n`
    enhancementContext += `Design the composition with perfect balance suitable for large-format printing. The ${dataset} elements should guide the viewer's eye seamlessly across the canvas, creating sense of movement and energy. Use rule of thirds, leading lines, and focal points for professional photography composition.\n`

    // TECHNICAL SPECIFICATIONS
    if (domeProjection) {
      enhancementContext += `\n### DOME PROJECTION OPTIMIZATION:\n`
      enhancementContext += `Specially optimize for ${domeDiameter}m diameter dome projection with ${domeResolution} resolution and fisheye mapping. Design for immersive planetarium display with spherical coordinate transformation. Arrange all ${dataset} elements to work beautifully on curved dome surfaces with proper distortion correction. Use circular fisheye projection with 180-degree field of view, central composition with radial symmetry, avoiding edge distortions.\n`
    }

    if (panoramic360) {
      enhancementContext += `\n### 360° PANORAMIC OPTIMIZATION:\n`
      enhancementContext += `Design for 360-degree panoramic viewing with ${panoramaResolution} resolution and equirectangular projection. Create seamless wraparound composition with no visible seams. Distribute ${dataset} elements for continuous visual flow across entire 360-degree environment. Optimize for ${stereographicPerspective} stereographic projection with appropriate focal points and radial composition for VR experience.\n`
    }

    // GALLERY QUALITY
    enhancementContext += `\n### GALLERY-QUALITY STANDARDS:\n`
    enhancementContext += `Ensure the artwork exudes refined, gallery-quality aesthetic suitable for museum exhibition. Each element should contribute to cohesive and engaging visual narrative with professional artistic excellence.\n`

    // UPSCALING OPTIMIZATION
    enhancementContext += `\n### OPTIMIZATION FOR 8K UPSCALING:\n`
    enhancementContext += `Focus on maintaining sharp, clean edges around each ${dataset} element and between color transitions. Design with rich detail that enhances beautifully when processed through AI upscaling algorithms, emphasizing depth and complexity.\n`

    enhancementContext += `\n### FINAL ENHANCEMENT INSTRUCTION:\n`
    enhancementContext += `Create a comprehensive 2500-3500 character masterpiece prompt that seamlessly blends:\n`
    enhancementContext += `1. The user's original vision: "${currentPrompt}"\n`
    enhancementContext += `2. Professional generative art structure with mathematical precision\n`
    enhancementContext += `3. ${dataset.toUpperCase()} dataset with exactly ${numSamples.toLocaleString()} elements\n`
    enhancementContext += `4. ${colorScheme.toUpperCase()} color palette with specific color codes and gradients\n`
    enhancementContext += `5. ${scenario.toUpperCase()} visual setting with thematic integration\n`
    enhancementContext += `6. Gallery-quality composition optimized for 8K upscaling\n`
    enhancementContext += `7. Professional textures, noise (${noiseScale}), and artistic excellence\n`
    if (domeProjection) {
      enhancementContext += `8. Dome projection optimization for ${domeDiameter}m diameter immersive display\n`
    }
    if (panoramic360) {
      enhancementContext += `9. 360° panoramic optimization for VR and immersive experiences\n`
    }
    enhancementContext += `The result should be a museum-worthy generative art masterpiece!`

    // Call OpenAI GPT-4 for comprehensive enhancement
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a master generative art prompt engineer who creates professional, gallery-quality artwork prompts. You specialize in blending mathematical precision with artistic excellence, creating detailed prompts (2500-3500 characters) that result in museum-worthy generative art optimized for 8K upscaling. Your prompts follow professional structure with mathematical precision, color theory, composition principles, and technical optimization while maintaining visual beauty and artistic appeal. You understand dome projection and 360° panoramic requirements for immersive experiences.`,
          },
          {
            role: "user",
            content: enhancementContext,
          },
        ],
        max_tokens: 1800,
        temperature: 0.85,
      }),
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      console.error("OpenAI API error:", errorData)
      throw new Error(`OpenAI API error: ${errorData.error?.message || "Unknown error"}`)
    }

    const openaiData = await openaiResponse.json()

    if (!openaiData.choices || !openaiData.choices[0] || !openaiData.choices[0].message) {
      throw new Error("No enhanced prompt returned from OpenAI")
    }

    const enhancedPrompt = openaiData.choices[0].message.content.trim()

    return NextResponse.json({
      success: true,
      enhancedPrompt,
      originalLength: currentPrompt.length,
      enhancedLength: enhancedPrompt.length,
      enhancementRatio: Math.round((enhancedPrompt.length / currentPrompt.length) * 100) / 100,
      contextualElements: {
        dataset,
        scenario,
        colorScheme,
        numSamples,
        noiseScale,
        domeProjection,
        panoramic360,
      },
    })
  } catch (error: any) {
    console.error("Prompt enhancement error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to enhance prompt",
      },
      { status: 500 },
    )
  }
}
