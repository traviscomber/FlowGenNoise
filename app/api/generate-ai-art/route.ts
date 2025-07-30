import { NextResponse } from "next/server"
import { experimental_generateImage } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  try {
    const { dataset, seed, scenario, colorScheme, numSamples, noise, customPrompt } = await req.json()

    if (
      !dataset ||
      typeof seed === "undefined" ||
      !scenario ||
      !colorScheme ||
      typeof numSamples === "undefined" ||
      typeof noise === "undefined"
    ) {
      return NextResponse.json(
        {
          error: "Missing dataset, seed, scenario, colorScheme, number of samples, or noise",
        },
        { status: 400 },
      )
    }

    console.log("Generating AI art with:", { dataset, scenario, colorScheme, seed, numSamples, noise })
    console.log("Custom prompt provided:", !!customPrompt)

    let finalPrompt: string

    if (customPrompt && customPrompt.trim().length > 0) {
      // Use the custom/enhanced prompt directly
      finalPrompt = customPrompt.trim()
      console.log("Using custom prompt:", finalPrompt)
    } else {
      // Generate default prompt based on dataset, scenario, and color scheme
      const colorDescriptions = {
        plasma: "vibrant plasma colors transitioning from deep purple through magenta to brilliant yellow",
        magma: "molten magma palette flowing from obsidian black through crimson red to golden white",
        sunset: "warm sunset hues with rich oranges, coral pinks, and golden yellows",
        cosmic: "deep space colors with stellar blues, nebula purples, and cosmic gold",
        quantum: "electric quantum blues with cyan highlights and ethereal white accents",
        thermal: "thermal heat map colors from cool black through fiery reds to blazing yellow",
        spectral: "full rainbow spectrum with seamless color transitions and prismatic effects",
        crystalline: "crystalline gem tones with sapphire blues, amethyst purples, and diamond whites",
        bioluminescent: "bioluminescent blues and greens with otherworldly glowing effects",
        aurora: "aurora borealis colors with dancing greens, ethereal blues, and mystical purples",
        metallic: "metallic sheen with silver, gold, and platinum highlights",
        neon: "electric neon colors with vibrant pinks, electric blues, and laser greens",
      }

      const scenarioDescriptions = {
        landscape: "sweeping natural landscape with organic terrain formations and atmospheric depth",
        architectural: "magnificent architectural structures with geometric precision and monumental scale",
        crystalline: "crystalline formations with light refraction and prismatic beauty",
        botanical: "lush botanical environment with organic growth patterns and natural harmony",
        cosmic: "vast cosmic space with stellar formations, nebulae, and celestial phenomena",
        ocean: "deep ocean environment with fluid dynamics and underwater light effects",
        forest: "mystical forest setting with organic fractals and natural light filtering",
        desert: "expansive desert landscape with sand dune formations and heat shimmer effects",
      }

      const datasetDescriptions = {
        spirals: "elegant double spiral formations creating mesmerizing helical patterns",
        moons: "crescent moon shapes forming celestial dance patterns",
        circles: "concentric circular formations with perfect geometric harmony",
        blobs: "organic blob clusters with smooth, flowing boundaries",
        checkerboard: "precise checkerboard pattern with mathematical regularity",
        gaussian: "gaussian distribution clouds with statistical beauty",
        grid: "structured grid formations with architectural precision",
        fractal: "sierpinski triangle fractals with infinite recursive detail",
        mandelbrot: "mandelbrot set visualization with infinite complexity at the boundary",
        julia: "julia set fractals with intricate mathematical beauty",
        lorenz: "lorenz attractor patterns showing chaotic system dynamics",
        tribes: "tribal settlement patterns with organic community structures",
        heads: "facial pattern formations with anthropomorphic elements",
        natives: "native settlement arrangements with cultural geometric patterns",
      }

      const datasetDesc = datasetDescriptions[dataset as keyof typeof datasetDescriptions] || dataset
      const colorDesc = colorDescriptions[colorScheme as keyof typeof colorDescriptions] || colorScheme
      const scenarioDesc = scenarioDescriptions[scenario as keyof typeof scenarioDescriptions] || scenario

      finalPrompt = `A breathtaking 8K masterpiece visualization of ${datasetDesc} rendered in a ${scenarioDesc}, illuminated with ${colorDesc}. The composition features ${numSamples.toLocaleString()} precisely calculated data points with ${noise} organic noise variation, creating a perfect balance between mathematical precision and natural beauty. Cinematic lighting, award-winning digital art, photorealistic rendering with depth of field, gallery-quality composition suitable for scientific art exhibitions. Ultra-detailed, hyperrealistic, with golden ratio composition and professional color grading.`

      console.log("Using generated prompt:", finalPrompt)
    }

    // Generate high-quality base image using DALL-E 3
    const { image } = await experimental_generateImage({
      model: openai.image("dall-e-3"),
      prompt: finalPrompt,
      quality: "hd",
      size: "1792x1024",
      style: "vivid",
    })

    const baseImage = `data:image/png;base64,${image.base64}`

    return NextResponse.json({
      image: baseImage,
      baseResolution: "1792x1024",
      readyForUpscaling: true,
      recommendedUpscale: "4x",
      promptUsed: finalPrompt,
      isCustomPrompt: !!customPrompt,
    })
  } catch (error: any) {
    console.error("Error generating AI art:", error)
    if (error.message.includes("api_key")) {
      return NextResponse.json(
        { error: "OpenAI API key is missing or invalid. Please set OPENAI_API_KEY." },
        { status: 500 },
      )
    }
    return NextResponse.json({ error: "Failed to generate AI art: " + error.message }, { status: 500 })
  }
}
