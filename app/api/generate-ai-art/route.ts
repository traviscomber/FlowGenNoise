import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("AI Art generation request body:", body)

    const {
      dataset,
      scenario,
      colorScheme,
      seed,
      numSamples,
      noise,
      customPrompt,
      panoramaResolution = "1080p",
      domeResolution = "1080p",
      panoramic360,
      domeProjection,
      panoramaFormat,
      stereographicPerspective,
    } = body

    // Check if OpenAI API key exists
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY not found in environment variables")
      return NextResponse.json(
        {
          success: false,
          error: "OpenAI API key not configured",
        },
        { status: 500 },
      )
    }

    // Build the prompt if not using custom prompt
    let finalPrompt = customPrompt
    if (!customPrompt) {
      const datasetDescriptions = {
        spirals: "fibonacci spiral patterns with golden ratio mathematics",
        fractal: "intricate fractal patterns with recursive geometry",
        hyperbolic: "hyperbolic geometry with curved space mathematics",
        gaussian: "gaussian field distributions with statistical patterns",
        cellular: "cellular automata with emergent complex patterns",
        voronoi: "voronoi diagram tessellations with organic boundaries",
        perlin: "perlin noise fields with natural organic textures",
        mandelbrot: "mandelbrot set fractals with infinite detail",
        lorenz: "lorenz attractor chaos theory visualizations",
        julia: "julia set fractals with complex number mathematics",
        diffusion: "reaction-diffusion patterns with chemical-like formations",
        wave: "wave interference patterns with harmonic mathematics",
      }

      const scenarioDescriptions = {
        pure: "pure mathematical visualization with abstract forms",
        landscape: "natural landscape with mountains, valleys, and organic terrain",
        architectural: "architectural structures with geometric buildings and urban design",
        geological: "geological rock formations with natural stone textures",
        botanical: "botanical plant structures with organic growth patterns",
        atmospheric: "atmospheric phenomena with clouds, mist, and weather effects",
        crystalline: "crystalline structures with geometric crystal formations",
        textile: "textile fabric patterns with woven and embroidered textures",
        metallic: "metallic surfaces with reflective and industrial materials",
        organic: "organic textures with natural biological forms",
        urban: "urban environments with city streets, buildings, and infrastructure",
        marine: "marine underwater ecosystems with aquatic life and coral",
      }

      const colorDescriptions = {
        plasma: "vibrant plasma colors with electric purples, magentas, and blues",
        quantum: "quantum energy colors with glowing greens, blues, and whites",
        cosmic: "cosmic space colors with deep purples, blues, and starlight",
        thermal: "thermal heat colors with reds, oranges, and yellows",
        spectral: "full spectrum rainbow colors with prismatic light effects",
        crystalline: "crystalline ice colors with clear blues, whites, and silver",
        bioluminescent: "bioluminescent colors with glowing blues, greens, and teals",
        aurora: "aurora borealis colors with dancing greens, purples, and blues",
        metallic: "metallic colors with gold, silver, copper, and bronze",
        prismatic: "prismatic light colors with rainbow refractions",
        monochromatic: "monochromatic grayscale with black, white, and gray tones",
        infrared: "infrared heat colors with deep reds and thermal gradients",
        lava: "molten lava colors with bright oranges, reds, and yellows",
        futuristic: "futuristic neon colors with electric blues, cyans, and purples",
        forest: "forest nature colors with deep greens, browns, and earth tones",
        ocean: "ocean water colors with deep blues, teals, and aqua",
        sunset: "sunset sky colors with warm oranges, pinks, and purples",
        arctic: "arctic ice colors with cool blues, whites, and pale tones",
        neon: "bright neon colors with electric pinks, greens, and blues",
        vintage: "vintage sepia colors with warm browns, tans, and aged tones",
        toxic: "toxic chemical colors with bright greens, yellows, and warning colors",
        ember: "glowing ember colors with deep reds, oranges, and fire tones",
      }

      // Add projection-specific descriptions
      let projectionText = ""
      if (panoramic360 && panoramaFormat === "stereographic") {
        if (stereographicPerspective === "tunnel") {
          projectionText =
            ", stereographic tunnel projection with fisheye perspective looking upward, sky in center, buildings curved around edges"
        } else {
          projectionText =
            ", stereographic little planet projection with fisheye perspective looking downward, landscape in center forming tiny planet effect"
        }
      } else if (domeProjection) {
        projectionText = ", optimized for dome projection with fisheye perspective, immersive 360-degree view"
      }

      finalPrompt = `Photorealistic ${datasetDescriptions[dataset as keyof typeof datasetDescriptions] || dataset} integrated into ${scenarioDescriptions[scenario as keyof typeof scenarioDescriptions] || scenario} with ${colorDescriptions[colorScheme as keyof typeof colorDescriptions] || colorScheme}${projectionText}, highly detailed, professional photography, dramatic lighting, ultra-realistic textures`
    }

    // Truncate prompt if too long (DALL-E has limits)
    if (finalPrompt.length > 1000) {
      finalPrompt = finalPrompt.substring(0, 997) + "..."
    }

    console.log("Final prompt:", finalPrompt)

    // Make request to OpenAI DALL-E API
    const openaiResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: finalPrompt,
        size: "1024x1024",
        quality: "hd",
        style: "vivid",
        n: 1,
      }),
    })

    console.log("OpenAI API response status:", openaiResponse.status)

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error("OpenAI API error:", errorText)
      return NextResponse.json(
        {
          success: false,
          error: `OpenAI API error: ${openaiResponse.status}`,
          details: errorText,
        },
        { status: 500 },
      )
    }

    const data = await openaiResponse.json()
    console.log("OpenAI response data:", data)

    if (!data.data || data.data.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No image generated by OpenAI",
        },
        { status: 500 },
      )
    }

    const imageUrl = data.data[0].url
    if (!imageUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "No image URL in OpenAI response",
        },
        { status: 500 },
      )
    }

    console.log("Generated image URL:", imageUrl)

    return NextResponse.json({
      success: true,
      image: imageUrl,
      resolution: panoramic360 ? panoramaResolution : domeProjection ? domeResolution : panoramaResolution,
      revisedPrompt: data.data[0].revised_prompt,
      dimensions: { width: 1024, height: 1024 },
    })
  } catch (error) {
    console.error("AI Art generation error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        details: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 },
    )
  }
}
