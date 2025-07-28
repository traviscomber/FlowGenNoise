import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Generate art API called with body:", body)

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
      panoramaFormat = "equirectangular",
      stereographicPerspective = "little-planet",
    } = body

    // Build base prompt
    let basePrompt = ""

    if (customPrompt) {
      basePrompt = `${customPrompt}\n\n`
    }

    // PROFESSIONAL FOUNDATION
    basePrompt += `Create an intricate generative art masterpiece inspired by '${dataset}' dataset, employing a '${colorScheme}' color scheme. The artwork should serve as an ideal base for professional 8K upscaling, focusing on clean, sharp edges and well-defined structures.\n\n`

    // MATHEMATICAL PRECISION - Dataset specific
    basePrompt += `### Mathematical Precision:\n`
    switch (dataset) {
      case "spirals":
        basePrompt += `Arrange exactly ${numSamples.toLocaleString()} spiral elements organically across the canvas, ensuring each one is unique yet harmoniously integrated with the others. The spirals should vary in size and density, creating dynamic flow throughout the piece with Fibonacci proportions, golden ratio curves, nautilus shell formations, and galaxy arm patterns. Include logarithmic spirals r=ae^(bθ) and Archimedean spirals with mathematical precision. `
        break
      case "fractal":
        basePrompt += `Generate exactly ${numSamples.toLocaleString()} fractal branching elements with self-similar structures at multiple scales. Each fractal should follow L-system rules F→F[+F]F[-F]F with recursive branching, creating tree-like formations, lightning patterns, fern fronds, and organic growth structures with mathematical precision and infinite detail. `
        break
      case "mandelbrot":
        basePrompt += `Create exactly ${numSamples.toLocaleString()} Mandelbrot set iteration points with complex plane mathematics z_{n+1} = z_n² + c. Include cardioid main bulbs, circular bulbs, infinite zoom detail with smooth escape-time coloring, fractal boundary precision, and psychedelic swirling patterns. `
        break
      case "julia":
        basePrompt += `Generate exactly ${numSamples.toLocaleString()} Julia set elements with flowing fractal boundaries, connected and disconnected sets, parameter space exploration, and elegant mathematical beauty with dreamlike surreal patterns. `
        break
      case "lorenz":
        basePrompt += `Create exactly ${numSamples.toLocaleString()} Lorenz attractor trajectory points forming butterfly-wing patterns with chaotic beauty, strange attractor dynamics, three-dimensional flow, and graceful curves suggesting movement and energy. `
        break
      case "tribes":
        basePrompt += `Arrange exactly ${numSamples.toLocaleString()} tribal settlement elements including people in traditional clothing, authentic dwellings, ceremonial circles, and cultural activities. Each figure should be unique with tribal details including chiefs, shamans, dancers, craftspeople, children playing, and daily life scenes with rich cultural storytelling. `
        break
      case "heads":
        basePrompt += `Compose exactly ${numSamples.toLocaleString()} facial feature elements creating portrait mosaics with golden ratio proportions φ=1.618. Each face should have unique expressions, geometric tessellation, anatomical precision, artistic interpretation, and mosaic composition with human beauty. `
        break
      case "natives":
        basePrompt += `Design exactly ${numSamples.toLocaleString()} native settlement elements with longhouses, tipis, medicine wheels, and ceremonial spaces. Include people in traditional dress, seasonal activities, authentic indigenous architecture, and cultural ceremonies. `
        break
      case "voronoi":
        basePrompt += `Arrange exactly ${numSamples.toLocaleString()} Voronoi cell seed points creating natural tessellation patterns like cracked earth, giraffe spots, honeycomb structures with organic boundaries and natural cell-like formations. `
        break
      case "cellular":
        basePrompt += `Generate exactly ${numSamples.toLocaleString()} cellular automata elements showing Conway's Game of Life patterns, gliders, oscillators, emergent complexity from simple rules, and biological structure formations. `
        break
      case "gaussian":
        basePrompt += `Create exactly ${numSamples.toLocaleString()} Gaussian distribution points forming bell-curve landscapes, statistical visualizations, probability density patterns, and smooth flowing terrain. `
        break
      case "diffusion":
        basePrompt += `Design exactly ${numSamples.toLocaleString()} reaction-diffusion pattern elements creating Turing patterns like zebra stripes, leopard spots, tiger markings, and natural biological formations with organic flow. `
        break
      case "wave":
        basePrompt += `Generate exactly ${numSamples.toLocaleString()} wave interference elements showing constructive and destructive patterns, standing waves, fluid dynamics, ocean ripples, and aquatic beauty. `
        break
      case "hyperbolic":
        basePrompt += `Create exactly ${numSamples.toLocaleString()} hyperbolic geometry elements with Escher-inspired tessellations, mind-bending patterns, infinite regression illusions, and non-Euclidean beauty. `
        break
      default:
        basePrompt += `Arrange exactly ${numSamples.toLocaleString()} ${dataset} elements with mathematical precision and organic distribution across the canvas, ensuring each element is unique yet harmoniously integrated. `
    }

    // COLOR PALETTE - Contextual and detailed
    basePrompt += `\n### Color Palette:\n`
    switch (colorScheme) {
      case "plasma":
        basePrompt += `Utilize a vibrant and high-contrast plasma color scheme with deep purples (#0d0887), electric blues (#46039f), hot magentas (#7201a8), coral oranges (#bd3786), bright oranges (#ed7953), and golden yellows (#fdca26). Include gradients with smooth transitions and luminous effects, interspersed with dark shadows to create depth and dimension. `
        break
      case "magma":
        basePrompt += `Utilize a vibrant and high-contrast magma color scheme that features deep reds, oranges, yellows, and black. Include a gradient from deep reds and oranges to bright yellows, interspersed with dark, almost black shadows to create depth and dimension. `
        break
      case "sunset":
        basePrompt += `Employ warm sunset colors with fiery oranges (#ff6b35), golden yellows (#f7931e), soft pinks (#ffd23f), deep purples (#5d2e5d), and cool blues (#1fb3d3). Create romantic golden hour lighting with natural color harmony and atmospheric warmth. `
        break
      case "cosmic":
        basePrompt += `Use deep space colors with rich browns (#2c1810), rusty oranges (#8b4513), stellar golds (#ffa500), bright yellows (#ffff00), and pure whites (#ffffff). Include nebula-like beauty with cosmic atmosphere and stellar lighting effects. `
        break
      case "quantum":
        basePrompt += `Apply futuristic quantum colors with deep space blues (#000428), electric cyans (#009ffd), bright whites (#ffffff), and glowing energy effects. Create high-tech sci-fi atmosphere with electromagnetic visualization. `
        break
      case "thermal":
        basePrompt += `Implement thermal imaging colors from cool blacks (#000000) through deep purples (#440154), ocean blues (#31688e), forest greens (#35b779), to bright yellows (#fde725). Create smooth temperature gradients with scientific beauty. `
        break
      case "spectral":
        basePrompt += `Use full rainbow spectrum with vibrant reds (#9e0142), oranges (#d53e4f), yellows (#fdae61), greens (#abdda4), blues (#3288bd), and violets (#5e4fa2). Create prismatic beauty with chromatic dispersion and rainbow light effects. `
        break
      case "crystalline":
        basePrompt += `Apply crystal colors with diamond clarity, sapphire blues (#0f52ba), emerald greens (#50c878), ruby reds (#e0115f), and prismatic refractions. Create gem-like beauty with transparent and reflective qualities. `
        break
      case "bioluminescent":
        basePrompt += `Use bioluminescent colors with glowing blue-greens, electric blues, phosphorescent effects, and deep sea creature beauty with natural light emission. `
        break
      case "aurora":
        basePrompt += `Apply aurora colors with ethereal greens, electric blues, mystical reds, and northern lights beauty with atmospheric glow and celestial effects. `
        break
      case "metallic":
        basePrompt += `Use metallic colors with golden golds (#ffd700), silver silvers (#c0c0c0), copper oranges (#b87333), and platinum whites (#e5e4e2). Create reflective metallic surfaces with industrial beauty. `
        break
      case "neon":
        basePrompt += `Apply neon colors with electric pinks, cyber blues, toxic greens, and glowing effects. Create cyberpunk atmosphere with artificial lighting and urban energy. `
        break
      default:
        basePrompt += `Utilize a ${colorScheme} color palette with rich, vibrant colors creating emotional impact and visual harmony with professional color theory and smooth gradients. `
    }

    // SCENARIO INTEGRATION
    switch (scenario) {
      case "landscape":
        if (dataset === "tribes" || dataset === "natives") {
          basePrompt += `Set in breathtaking natural landscape with tribal villages nestled in rolling valleys, flowing rivers, and ancient forests. Include people living in harmony with nature, smoke rising from cooking fires, daily activities, cultural ceremonies, and environmental storytelling. `
        } else {
          basePrompt += `Set in majestic natural landscape incorporating ${dataset} patterns in terrain formations, mountain ranges, river systems, atmospheric phenomena, and geological structures with cinematic lighting. `
        }
        break
      case "architectural":
        basePrompt += `Set in futuristic architectural environment with ${dataset} patterns integrated into building design, structural engineering, urban planning, and modern materials with geometric precision. `
        break
      case "crystalline":
        basePrompt += `Set in spectacular crystal formations with ${dataset} patterns in mineral structures, prismatic light effects, rainbow refractions, gem-like beauty, and optical phenomena. `
        break
      case "botanical":
        basePrompt += `Set in lush botanical environment with ${dataset} patterns in plant growth, flower arrangements, leaf structures, natural organic beauty, and vibrant vegetation. `
        break
      default:
        basePrompt += `Set in ${scenario} environment showcasing ${dataset} patterns with thematic consistency and visual appeal. `
    }

    // TEXTURES AND PATTERNS
    basePrompt += `\n### Textures and Patterns:\nIntroduce complex textures within the ${dataset} elements, such as fine lines, cross-hatching, stippling, or organic dotting patterns, which will reveal new details upon close inspection. Ensure that these intricate patterns are meticulously crafted to reward viewers and enhance during upscaling. `

    // NOISE TEXTURE
    basePrompt += `\n### Noise Texture:\nApply a subtle noise texture of ${noise} to the entire image, giving it a tactile, almost tactile surface that adds sophistication and visual interest without overwhelming the primary elements. `

    // COMPOSITION
    basePrompt += `\n### Professional Composition:\nDesign the composition with a balance that suits large-format printing. The ${dataset} elements should guide the viewer's eye seamlessly across the canvas, creating a sense of movement and energy with rule of thirds, leading lines, and focal points. `

    // GALLERY QUALITY AND UPSCALING
    basePrompt += `\n### Gallery-Quality:\nEnsure that the overall artwork exudes a refined, gallery-quality aesthetic suitable for exhibition, with each element contributing to a cohesive and engaging visual narrative. Focus on maintaining sharp, clean edges around each ${dataset} element and between color transitions to ensure clarity and precision are preserved during upscaling. Design with rich detail that enhances beautifully when processed through AI upscaling algorithms, emphasizing the depth and complexity of the piece.\n\n`

    basePrompt += `By adhering to these guidelines, the resulting image will be an exquisite generative art masterpiece, optimized for professional 8K upscaling and perfect for large-format, gallery-quality display. Ultra-high resolution with 16-bit color depth, advanced rendering, photorealistic detail, cinematic composition, and museum-worthy artistic excellence.`

    console.log("Base prompt length:", basePrompt.length)

    // Generate main image
    console.log("Generating main image...")
    const mainImageResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: basePrompt.length > 4000 ? basePrompt.substring(0, 3997) + "..." : basePrompt,
        n: 1,
        size: "1024x1024",
        quality: "hd",
        style: "vivid",
      }),
    })

    if (!mainImageResponse.ok) {
      const errorData = await mainImageResponse.json()
      console.error("OpenAI API error:", errorData)
      throw new Error(`OpenAI API error: ${errorData.error?.message || "Unknown error"}`)
    }

    const mainImageData = await mainImageResponse.json()
    console.log("Main image generated successfully")

    if (!mainImageData.data || !mainImageData.data[0] || !mainImageData.data[0].url) {
      throw new Error("No image URL returned from OpenAI")
    }

    const imageUrl = mainImageData.data[0].url

    // Generate dome projection if requested
    let domeImageUrl = undefined
    let domeGenerationStatus = "Not requested"

    if (domeProjection) {
      console.log(`Generating dome projection image for ${domeDiameter}m dome with ${domeResolution} resolution...`)

      // Create a completely different dome-optimized prompt
      const domePrompt = `Create a stunning ${dataset} mathematical art visualization specifically designed for ${domeDiameter}-meter diameter dome projection with ${domeResolution} resolution. 

DOME PROJECTION REQUIREMENTS:
- Perfect circular composition that fills the entire frame edge-to-edge
- All ${dataset} elements arranged in concentric circles radiating from center
- ${projectionType} projection mapping with 180-degree field of view
- No elements near the very edges to avoid distortion
- Central focal point with strongest visual elements
- Radial symmetry that works on curved dome surfaces
- Elements get progressively smaller toward edges
- Seamless wraparound with no visible seams

MATHEMATICAL ELEMENTS:
${
  dataset === "tribes"
    ? `Tribal villages arranged in perfect circles around a central ceremonial ground. ${numSamples.toLocaleString()} people in traditional dress positioned in concentric rings. Chiefs and shamans at center, families in middle rings, activities toward edges. Smoke from fires creates vertical elements. All figures face inward toward center.`
    : dataset === "spirals"
      ? `${numSamples.toLocaleString()} Fibonacci spirals emanating from center point in perfect radial symmetry. Golden ratio proportions with r=ae^(bθ). Each spiral unique but harmoniously integrated. Logarithmic and Archimedean spirals creating galaxy-like formation.`
      : `${numSamples.toLocaleString()} ${dataset} elements in perfect circular arrangement radiating from center with mathematical precision.`
}

COLOR SCHEME: ${colorScheme} palette optimized for dome viewing with enhanced contrast and luminosity.

DOME TECHNICAL SPECS:
- Optimized for ${domeDiameter}m diameter planetarium dome
- ${domeResolution} resolution (${domeResolution === "2K" ? "2048x2048" : domeResolution === "4K" ? "4096x4096" : "8192x8192"})
- ${projectionType} projection type
- Immersive overhead viewing experience
- Perfect for planetarium and dome theater display

The final image must be a perfect circle that completely fills the square frame, with all mathematical elements arranged to create stunning immersive experience when projected on dome ceiling.`

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
            domeGenerationStatus = "Generated successfully with dome optimization"
            console.log("Dome projection image generated successfully")
          } else {
            console.log("Dome API returned no image, using main image")
            domeImageUrl = imageUrl
            domeGenerationStatus = "API returned no image, using main image"
          }
        } else {
          const domeError = await domeResponse.json()
          console.log("Dome generation failed:", domeError)
          domeImageUrl = imageUrl
          domeGenerationStatus = `Generation failed: ${domeError.error?.message || "Unknown error"}, using main image`
        }
      } catch (error) {
        console.error("Dome projection generation error:", error)
        domeImageUrl = imageUrl
        domeGenerationStatus = `Exception occurred: ${error.message}, using main image`
      }
    }

    // Generate 360° panorama if requested
    let panoramaImageUrl = undefined
    let panoramaGenerationStatus = "Not requested"

    if (panoramic360) {
      console.log(`Generating 360° panoramic image with ${panoramaResolution} resolution...`)

      let panoramaPrompt =
        basePrompt +
        `\n\n### 360° PANORAMIC OPTIMIZATION:\nSpecially designed for 360-degree panoramic viewing with ${panoramaResolution} resolution and ${panoramaFormat} projection format. The composition wraps seamlessly around a full sphere with no visible seams or distortions. All ${dataset} elements are distributed to create continuous visual flow across the entire 360-degree environment.`

      let imageSize = "1024x1024"

      if (panoramaFormat === "equirectangular") {
        panoramaPrompt += ` Uses equirectangular projection mapping with 2:1 aspect ratio, where horizontal represents 360° longitude and vertical represents 180° latitude. The composition accounts for polar distortion with smaller elements near the top and bottom edges and larger elements near the center horizontal band. Elements should flow horizontally across the image to create seamless wraparound when viewed in VR. Perfect for VR headsets and 360° video platforms.`
        imageSize = "1792x1024" // 2:1 aspect ratio for equirectangular
      } else if (panoramaFormat === "stereographic") {
        if (stereographicPerspective === "little-planet") {
          panoramaPrompt += ` Optimized for little planet stereographic projection with central focal point and radial composition that creates stunning spherical planet effect when transformed. All ${dataset} elements radiate outward from the center in concentric circles, with the most important elements in the center and supporting elements flowing toward the edges. The composition should look like looking down at a small planet from above.`
        } else if (stereographicPerspective === "tunnel") {
          panoramaPrompt += ` Designed for tunnel stereographic projection with central void and outward radiating patterns that create immersive tunnel effect. Elements should form concentric rings around a central opening, creating depth and perspective that draws the viewer into the center. Perfect for creating immersive tunnel-like experiences.`
        }
      }

      panoramaPrompt += ` The final result should be optimized for immersive digital experiences and VR environments.`

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
            size: imageSize,
            quality: "hd",
            style: "vivid",
          }),
        })

        if (panoramaResponse.ok) {
          const panoramaData = await panoramaResponse.json()
          if (panoramaData.data && panoramaData.data[0] && panoramaData.data[0].url) {
            panoramaImageUrl = panoramaData.data[0].url
            panoramaGenerationStatus = "Generated successfully with 360° optimization"
            console.log("360° panoramic image generated successfully")
          } else {
            console.log("Panorama API returned no image, using main image")
            panoramaImageUrl = imageUrl
            panoramaGenerationStatus = "API returned no image, using main image"
          }
        } else {
          const panoramaError = await panoramaResponse.json()
          console.log("Panorama generation failed:", panoramaError)
          panoramaImageUrl = imageUrl
          panoramaGenerationStatus = `Generation failed: ${panoramaError.error?.message || "Unknown error"}, using main image`
        }
      } catch (error) {
        console.error("360° panoramic generation error:", error)
        panoramaImageUrl = imageUrl
        panoramaGenerationStatus = `Exception occurred: ${error.message}, using main image`
      }
    }

    console.log("All images generated successfully")

    return NextResponse.json({
      success: true,
      image: imageUrl,
      domeImage: domeImageUrl,
      panoramaImage: panoramaImageUrl,
      originalPrompt: basePrompt,
      promptLength: basePrompt.length,
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
    })
  } catch (error: any) {
    console.error("Art generation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate artwork",
      },
      { status: 500 },
    )
  }
}
