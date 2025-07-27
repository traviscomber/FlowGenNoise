import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

// Convert resolution string to actual dimensions for AI generation
function getResolutionDimensions(resolution: string) {
  switch (resolution) {
    case "1080p":
      return { width: 1080, height: 1080 }
    case "1440p":
      return { width: 1440, height: 1440 }
    case "2160p":
      return { width: 2160, height: 2160 }
    default:
      return { width: 1080, height: 1080 }
  }
}

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

    // Determine which resolution to use
    const targetResolution = panoramic360 ? panoramaResolution : domeProjection ? domeResolution : panoramaResolution
    const dimensions = getResolutionDimensions(targetResolution)

    console.log("Using dimensions:", dimensions, "for resolution:", targetResolution)

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

      finalPrompt = `Photorealistic ${datasetDescriptions[dataset as keyof typeof datasetDescriptions] || dataset} in ${scenarioDescriptions[scenario as keyof typeof scenarioDescriptions] || scenario} setting with ${colorDescriptions[colorScheme as keyof typeof colorDescriptions] || colorScheme}, highly detailed, professional photography, dramatic lighting, 8k resolution`
    }

    console.log("Final prompt:", finalPrompt)

    // Check if Replicate token exists
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error("REPLICATE_API_TOKEN environment variable is not set")
    }

    console.log("Calling Replicate API...")

    // Use the correct Flux model
    const output = await replicate.run("black-forest-labs/flux-schnell", {
      input: {
        prompt: finalPrompt,
        width: dimensions.width,
        height: dimensions.height,
        num_outputs: 1,
        num_inference_steps: 4,
        seed: seed || Math.floor(Math.random() * 1000000),
        output_format: "jpg",
        output_quality: 85,
      },
    })

    console.log("Replicate raw output:", output)
    console.log("Output type:", typeof output)
    console.log("Output is array:", Array.isArray(output))

    // Handle different response formats
    let imageUrl: string

    if (Array.isArray(output)) {
      if (output.length === 0) {
        throw new Error("Replicate returned empty array")
      }
      imageUrl = output[0]
    } else if (typeof output === "string") {
      imageUrl = output
    } else if (output && typeof output === "object" && "url" in output) {
      imageUrl = (output as any).url
    } else {
      console.error("Unexpected output format:", output)
      throw new Error(`Unexpected output format: ${typeof output}`)
    }

    if (!imageUrl) {
      throw new Error("No image URL received from Replicate")
    }

    console.log("Final image URL:", imageUrl)

    return NextResponse.json({
      success: true,
      image: imageUrl,
      resolution: targetResolution,
      dimensions,
    })
  } catch (error) {
    console.error("AI Art generation error:", error)

    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }

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
