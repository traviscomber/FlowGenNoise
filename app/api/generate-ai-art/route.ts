import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      prompt: userPrompt,
      negative_prompt: userNegativePrompt,
      seed,
      dataset,
      colorScheme,
      numSamples,
      noise,
      scenario,
      scenarioThreshold,
    } = body

    console.log("🎨 AI Art Generation Request:", {
      userPrompt: userPrompt?.substring(0, 100) + "...",
      dataset,
      colorScheme,
      scenario,
      scenarioThreshold,
      seed,
    })

    // Dataset descriptions for AI prompt generation
    const datasetDescriptions = {
      lissajous:
        "flowing parametric curves with harmonic oscillations creating elegant loops and figure-eight patterns",
      mandelbrot: "intricate fractal boundaries with infinite detail and self-similar recursive structures",
      julia: "complex fractal patterns with organic branching and swirling mathematical beauty",
      sierpinski: "triangular fractal geometry with recursive subdivisions and chaos game patterns",
      fern: "delicate organic fractal structures resembling natural plant growth patterns",
      neural_network: "interconnected nodes and synaptic pathways forming brain-like network structures",
      moon_phases: "orbital mechanics creating cyclical patterns with gravitational dance movements",
      checkerboard: "geometric grid patterns with alternating tessellations and mathematical precision",
      spiral_galaxy: "cosmic spiral arms with stellar formations and galactic rotation patterns",
      dna_helix: "double helix molecular structures with base pair connections and genetic patterns",
      wave_interference: "overlapping wave patterns creating complex interference and resonance effects",
      crystal_lattice: "three-dimensional crystalline structures with atomic precision and geometric beauty",
    }

    // Color scheme descriptions
    const colorDescriptions = {
      viridis: "deep purple to bright yellow gradient with scientific precision",
      plasma: "vibrant magenta to bright yellow with electric energy",
      inferno: "dark purple through red to bright yellow like burning flames",
      magma: "deep black through purple and red to bright yellow volcanic colors",
      cividis: "blue to yellow colorblind-friendly gradient with clarity",
      rainbow: "full spectrum colors creating prismatic beauty",
      grayscale: "monochromatic black to white gradient with elegant simplicity",
      neon: "electric bright colors with glowing cyberpunk aesthetics",
      pastel: "soft muted colors with gentle dreamy qualities",
      monochrome: "stark black and white contrast with dramatic impact",
    }

    // Scenario descriptions with rich detail
    const scenarioDescriptions = {
      none: "",
      enchanted_forest:
        "mystical woodland realm with ancient trees, glowing mushrooms, fairy lights, magical mist, and ethereal forest spirits dancing through dappled moonlight",
      deep_ocean:
        "abyssal underwater world with bioluminescent creatures, coral formations, deep sea trenches, mysterious currents, and ancient underwater civilizations",
      cosmic_nebula:
        "vast stellar nursery with swirling gas clouds, newborn stars, cosmic dust, gravitational lensing, and the infinite beauty of deep space",
      cyberpunk_city:
        "neon-lit urban dystopia with holographic advertisements, rain-slicked streets, towering megastructures, digital interfaces, and electric atmosphere",
      ancient_temple:
        "sacred archaeological site with weathered stone columns, hieroglyphic carvings, golden artifacts, mystical symbols, and timeless spiritual energy",
      crystal_cave:
        "underground cavern filled with massive crystal formations, prismatic light reflections, mineral deposits, and geological wonder",
      aurora_borealis:
        "dancing northern lights with electromagnetic phenomena, polar atmosphere, celestial curtains of light, and arctic wilderness",
      volcanic_landscape:
        "molten lava flows, volcanic ash clouds, geothermal activity, igneous rock formations, and the raw power of Earth's creation",
      neural_connections:
        "synaptic networks with electrical impulses, neurotransmitter flows, brain tissue, cognitive patterns, and consciousness visualization",
      quantum_realm:
        "subatomic particle interactions, quantum entanglement, probability waves, dimensional fluctuations, and the fundamental fabric of reality",
      steampunk_workshop:
        "Victorian-era mechanical laboratory with brass gears, steam pipes, clockwork mechanisms, copper tubing, and industrial craftsmanship",
      underwater_city:
        "submerged civilization with bubble domes, aquatic architecture, marine life integration, pressure-resistant structures, and oceanic harmony",
      space_station:
        "orbital facility with rotating habitats, solar panels, docking bays, zero-gravity environments, and advanced space technology",
      mystical_portal:
        "interdimensional gateway with swirling energy vortex, reality distortions, magical runes, ethereal boundaries, and otherworldly passages",
    }

    // Build the AI prompt based on user input and mathematical settings
    let finalPrompt = ""
    let aiDescription = ""

    if (userPrompt && userPrompt.trim()) {
      // User provided their own prompt - use it directly but enhance with mathematical context
      finalPrompt = `${userPrompt.trim()}, incorporating ${datasetDescriptions[dataset]} with ${colorDescriptions[colorScheme]} color palette`
      aiDescription = `Custom prompt with ${dataset} mathematical foundation`
    } else {
      // Generate prompt based on mathematical settings and scenario
      const mathDescription = datasetDescriptions[dataset] || "abstract mathematical patterns"
      const colorDescription = colorDescriptions[colorScheme] || "vibrant colors"

      if (scenario === "none" || scenarioThreshold < 20) {
        // Pure mathematical art (0-19% threshold)
        finalPrompt = `Abstract mathematical art featuring ${mathDescription} with ${colorDescription}, highly detailed, artistic, beautiful, digital art masterpiece`
        aiDescription = `Pure mathematical ${dataset} pattern with ${colorScheme} colors`
      } else if (scenarioThreshold < 50) {
        // Subtle thematic hints (20-49% threshold)
        const scenarioHint = scenarioDescriptions[scenario]?.split(",")[0] || ""
        finalPrompt = `Abstract art with ${mathDescription} subtly inspired by ${scenarioHint}, using ${colorDescription}, artistic, beautiful, digital art`
        aiDescription = `${dataset} patterns with subtle ${scenario} influences`
      } else if (scenarioThreshold < 80) {
        // Balanced blend (50-79% threshold)
        const scenarioDesc = scenarioDescriptions[scenario] || ""
        finalPrompt = `${scenarioDesc} where the environment and structures follow ${mathDescription}, rendered with ${colorDescription}, highly detailed, artistic, beautiful, digital art masterpiece`
        aiDescription = `Balanced blend of ${scenario} theme with ${dataset} mathematical structure`
      } else {
        // Scenario dominates (80-100% threshold)
        const scenarioDesc = scenarioDescriptions[scenario] || ""
        finalPrompt = `${scenarioDesc}, where every element, structure, and form is shaped by underlying ${mathDescription}, creating a world where mathematics becomes visible reality, rendered with ${colorDescription}, highly detailed, artistic, beautiful, digital art masterpiece`
        aiDescription = `${scenario} world shaped by ${dataset} mathematical laws`
      }
    }

    // Enhanced negative prompt
    const negativePrompt =
      userNegativePrompt ||
      "blurry, low quality, distorted, ugly, bad anatomy, watermark, text, signature, amateur, simple, basic"

    console.log("🚀 Final prompt being sent to DALL-E 3:", finalPrompt)
    console.log("🎯 AI Description:", aiDescription)

    // Call OpenAI DALL-E 3 API directly
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
        quality: "standard",
        response_format: "url",
      }),
    })

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error("OpenAI API error:", errorText)

      // Return a transparent pixel as fallback
      const transparentPixel =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=="

      return NextResponse.json({
        image: transparentPixel,
        aiDescription: `OpenAI API Error: ${errorText}`,
      })
    }

    const openaiData = await openaiResponse.json()
    const imageUrl = openaiData.data?.[0]?.url

    if (!imageUrl) {
      console.error("No image URL in OpenAI response:", openaiData)

      // Return a transparent pixel as fallback
      const transparentPixel =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=="

      return NextResponse.json({
        image: transparentPixel,
        aiDescription: "No image generated by OpenAI",
      })
    }

    console.log("✅ Successfully generated AI art")

    return NextResponse.json({
      image: imageUrl,
      aiDescription: aiDescription,
    })
  } catch (error: any) {
    console.error("Error in generate-ai-art route:", error)

    // Return a transparent pixel as fallback
    const transparentPixel =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=="

    return NextResponse.json({
      image: transparentPixel,
      aiDescription: `Generation failed: ${error.message}`,
    })
  }
}
