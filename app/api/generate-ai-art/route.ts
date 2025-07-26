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

    // Build realistic, achievable prompts
    let finalPrompt = customPrompt
    if (!customPrompt) {
      const datasetDescriptions = {
        spiral: "elegant spiral patterns with mathematical curves and flowing lines",
        checkerboard: "geometric checkerboard patterns with clean alternating squares",
        neural: "network-like patterns with connected nodes and branching pathways",
        fractal: "detailed fractal patterns with repeating geometric structures",
        wave: "flowing wave patterns with smooth curves and rhythmic motion",
        particle: "scattered particle patterns with organic clustering and movement",
        mandala: "symmetrical mandala designs with radial geometric patterns",
        crystal: "crystalline structures with angular geometric formations",
        flow: "fluid flow patterns with curved streamlines and vector fields",
        noise: "organic texture patterns with natural randomness and variation",
        cellular: "cellular grid patterns with interconnected geometric cells",
        attractor: "mathematical curve patterns with elegant flowing trajectories",
      }

      const scenarioDescriptions = {
        "live-forest": "forest scene with trees, leaves, and natural lighting",
        heads: "artistic portrait composition with creative styling",
        underwater: "underwater scene with marine life and coral",
        space: "space scene with stars, planets, and cosmic elements",
        cyberpunk: "futuristic cityscape with neon lights and modern architecture",
        dreamscape: "surreal landscape with floating elements and soft lighting",
        tribal: "tribal art style with traditional patterns and earth tones",
        steampunk: "steampunk aesthetic with brass, gears, and vintage machinery",
        bioluminescent: "glowing elements with natural phosphorescent lighting",
        crystalline: "crystal cave environment with refracting light",
        volcanic: "volcanic landscape with lava flows and rocky terrain",
        arctic: "arctic scene with ice formations and cool lighting",
        desert: "desert landscape with sand dunes and warm lighting",
        jungle: "jungle environment with dense vegetation and ancient ruins",
        pure: "clean mathematical visualization with abstract forms",
      }

      const colorDescriptions = {
        plasma: "purple, magenta, and blue color palette",
        quantum: "blue, white, and silver color scheme",
        cosmic: "deep purple, blue, and starlight colors",
        thermal: "red, orange, and yellow heat colors",
        spectral: "rainbow spectrum with full color range",
        crystalline: "blue, white, and crystal clear colors",
        bioluminescent: "blue, green, and teal glowing colors",
        aurora: "green, blue, and purple aurora colors",
        metallic: "gold, silver, and bronze metallic tones",
        prismatic: "rainbow prismatic light colors",
        monochromatic: "black, white, and gray tones",
        infrared: "red and warm thermal colors",
        lava: "orange, red, and yellow molten colors",
        futuristic: "neon blue, cyan, and electric colors",
        forest: "green, brown, and natural earth tones",
        ocean: "blue, teal, and aqua water colors",
        sunset: "orange, pink, and purple sky colors",
        arctic: "blue, white, and ice colors",
        neon: "bright fluorescent colors",
        vintage: "sepia, brown, and aged colors",
        toxic: "bright green and yellow warning colors",
        ember: "orange, red, and glowing colors",
      }

      // Create realistic, balanced descriptions
      const datasetDesc = datasetDescriptions[dataset as keyof typeof datasetDescriptions] || "geometric patterns"
      const scenarioDesc = scenarioDescriptions[scenario as keyof typeof scenarioDescriptions] || "artistic scene"
      const colorDesc = colorDescriptions[colorScheme as keyof typeof colorDescriptions] || "vibrant colors"

      // Add projection-specific descriptions
      let projectionText = ""
      if (panoramic360 && panoramaFormat === "stereographic") {
        if (stereographicPerspective === "tunnel") {
          projectionText = ", fisheye perspective looking upward"
        } else {
          projectionText = ", fisheye perspective with tiny planet effect"
        }
      } else if (domeProjection) {
        projectionText = ", dome projection view"
      }

      // Realistic quality modifiers
      const qualityTerms = "digital art, high quality, detailed, well-composed, professional lighting, smooth gradients"

      // Construct the balanced prompt
      finalPrompt = `${datasetDesc} integrated into ${scenarioDesc} with ${colorDesc}${projectionText}, ${qualityTerms}`
    }

    // Clean and validate the prompt
    finalPrompt = sanitizePrompt(finalPrompt)

    // Ensure prompt is reasonable length
    if (finalPrompt.length > 800) {
      finalPrompt = finalPrompt.substring(0, 797) + "..."
    }

    console.log("Balanced prompt:", finalPrompt)

    // Make request to OpenAI DALL-E API with retry logic
    let openaiResponse
    let attempts = 0
    const maxAttempts = 3

    while (attempts < maxAttempts) {
      try {
        attempts++
        console.log(`Attempt ${attempts} to generate image...`)

        openaiResponse = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: finalPrompt,
            size: "1024x1024",
            quality: "standard", // Use standard for more realistic results
            style: "natural", // Natural style for realistic output
            n: 1,
          }),
        })

        if (openaiResponse.ok) {
          break // Success, exit retry loop
        }

        const errorText = await openaiResponse.text()
        console.error(`Attempt ${attempts} failed:`, errorText)

        // If it's a content policy violation, try with a simpler prompt
        if (errorText.includes("content policy") || errorText.includes("unable to process")) {
          console.log("Content policy issue detected, trying simpler prompt...")
          finalPrompt = createFallbackPrompt(dataset, colorScheme, panoramic360, domeProjection)
          console.log("Fallback prompt:", finalPrompt)
        }

        // Wait before retry (except on last attempt)
        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      } catch (fetchError) {
        console.error(`Network error on attempt ${attempts}:`, fetchError)
        if (attempts === maxAttempts) {
          throw fetchError
        }
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    if (!openaiResponse || !openaiResponse.ok) {
      const errorText = await openaiResponse?.text()
      console.error("All attempts failed. Final error:", errorText)
      return NextResponse.json(
        {
          success: false,
          error: `OpenAI API error after ${maxAttempts} attempts`,
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

// Sanitize prompt to remove potentially problematic content
function sanitizePrompt(prompt: string): string {
  // Remove potentially problematic words/phrases
  const problematicTerms = [
    "violent",
    "disturbing",
    "explicit",
    "inappropriate",
    "nsfw",
    "adult",
    "sexual",
    "nude",
    "naked",
  ]

  let sanitized = prompt
  problematicTerms.forEach((term) => {
    const regex = new RegExp(term, "gi")
    sanitized = sanitized.replace(regex, "artistic")
  })

  // Clean up multiple spaces and special characters
  sanitized = sanitized.replace(/\s+/g, " ").trim()

  return sanitized
}

// Create a simple, realistic fallback prompt
function createFallbackPrompt(
  dataset: string,
  colorScheme: string,
  panoramic360?: boolean,
  domeProjection?: boolean,
): string {
  const simpleDatasets = {
    spiral: "spiral patterns",
    checkerboard: "checkerboard patterns",
    neural: "network patterns",
    fractal: "fractal patterns",
    wave: "wave patterns",
    particle: "particle patterns",
    mandala: "mandala patterns",
    crystal: "crystal patterns",
    flow: "flow patterns",
    noise: "organic patterns",
    cellular: "cellular patterns",
    attractor: "curved patterns",
  }

  const simpleColors = {
    plasma: "purple and pink colors",
    quantum: "blue and white colors",
    cosmic: "purple and blue colors",
    thermal: "red and orange colors",
    spectral: "rainbow colors",
    crystalline: "blue and white colors",
    bioluminescent: "blue and green colors",
    aurora: "green and blue colors",
    metallic: "gold and silver colors",
    prismatic: "rainbow colors",
    monochromatic: "black and white",
    infrared: "red colors",
    lava: "orange and red colors",
    futuristic: "blue and cyan colors",
    forest: "green colors",
    ocean: "blue colors",
    sunset: "orange and pink colors",
    arctic: "blue and white colors",
    neon: "bright colors",
    vintage: "brown and sepia colors",
    toxic: "green colors",
    ember: "orange and red colors",
  }

  const datasetDesc = simpleDatasets[dataset as keyof typeof simpleDatasets] || "geometric patterns"
  const colorDesc = simpleColors[colorScheme as keyof typeof simpleColors] || "colorful"

  let projectionText = ""
  if (panoramic360) {
    projectionText = ", panoramic view"
  } else if (domeProjection) {
    projectionText = ", dome view"
  }

  return `Abstract ${datasetDesc} with ${colorDesc}${projectionText}, digital art, clean design`
}
