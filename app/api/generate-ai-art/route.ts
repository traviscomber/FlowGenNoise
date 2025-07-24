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
        spiral: "fibonacci spiral patterns with golden ratio mathematics and organic curves",
        checkerboard: "checkerboard grid patterns with alternating mathematical tessellations",
        neural: "neural network patterns with interconnected nodes and synaptic connections",
        fractal: "intricate fractal tree patterns with recursive branching geometry",
        wave: "wave function patterns with harmonic oscillations and interference",
        particle: "particle system dynamics with swarm behavior and emergent patterns",
        mandala: "sacred geometry mandalas with symmetrical mathematical precision",
        crystal: "crystal lattice structures with geometric mineral formations",
        flow: "flow field patterns with vector mathematics and fluid dynamics",
        noise: "perlin noise fields with organic natural textures and gradients",
        cellular: "cellular automata patterns with emergent complex behaviors",
        attractor: "strange attractor patterns with chaotic mathematical beauty",
      }

      const scenarioDescriptions = {
        "live-forest":
          "enchanted living forest with magical fairies dancing between trees, colorful butterflies with fractal wings, glowing mushrooms, sparkling dewdrops, and mystical woodland creatures",
        heads:
          "surreal collection of artistic heads with crazy psychedelic patterns, abstract facial features, geometric mind-bending designs, kaleidoscopic eyes, and trippy neural pathways",
        underwater:
          "vibrant underwater world with tropical fish swimming in schools, colorful coral reefs, floating jellyfish, sea anemones, and bioluminescent marine life",
        space:
          "cosmic space odyssey with swirling nebulae, distant galaxies, twinkling stars, colorful planets, asteroid fields, and cosmic dust clouds",
        cyberpunk:
          "futuristic cyberpunk cityscape with neon lights, holographic displays, digital rain, chrome surfaces, and high-tech urban architecture",
        dreamscape:
          "surreal dreamlike landscape with floating objects, impossible architecture, melting clocks, gravity-defying elements, and ethereal atmospheres",
        tribal:
          "ancient tribal patterns with sacred symbols, totemic designs, indigenous art motifs, ceremonial masks, and spiritual geometric forms",
        steampunk:
          "Victorian steampunk world with brass gears, steam pipes, clockwork mechanisms, copper machinery, and industrial vintage aesthetics",
        bioluminescent:
          "glowing bioluminescent environment with phosphorescent organisms, luminous plants, radiant fungi, and naturally glowing life forms",
        crystalline:
          "magical crystal caves with prismatic gems, mineral formations, refracting light beams, rainbow reflections, and sparkling geodes",
        volcanic:
          "dramatic volcanic landscape with flowing lava streams, molten rock, fire eruptions, glowing embers, and intense heat distortions",
        arctic:
          "pristine arctic tundra with ice formations, snow crystals, aurora borealis, frozen landscapes, and crystalline beauty",
        desert:
          "mystical desert oasis with sand dunes, cacti silhouettes, mirages, palm trees, and golden sunset lighting",
        jungle:
          "ancient jungle temple with overgrown vines, exotic wildlife, mysterious ruins, tropical vegetation, and hidden archaeological treasures",
        pure: "pure mathematical visualization with abstract geometric forms and clean mathematical beauty",
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
            ", stereographic tunnel projection with fisheye perspective looking upward, sky in center, elements curved around edges"
        } else {
          projectionText =
            ", stereographic little planet projection with fisheye perspective looking downward, landscape in center forming tiny planet effect"
        }
      } else if (domeProjection) {
        projectionText = ", optimized for dome projection with fisheye perspective, immersive 360-degree view"
      }

      finalPrompt = `Photorealistic ${datasetDescriptions[dataset as keyof typeof datasetDescriptions] || dataset} integrated into ${scenarioDescriptions[scenario as keyof typeof scenarioDescriptions] || scenario} with ${colorDescriptions[colorScheme as keyof typeof colorDescriptions] || colorScheme}${projectionText}, highly detailed, professional photography, dramatic lighting, ultra-realistic textures, magical atmosphere`
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
