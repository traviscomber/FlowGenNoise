import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const {
      prompt: userPrompt,
      negative_prompt,
      num_outputs = 1,
      guidance_scale = 7.5,
      num_inference_steps = 50,
      seed,
      dataset,
      colorScheme,
      numSamples,
      noise,
      scenario,
      scenarioThreshold = 50,
    } = await request.json()

    console.log("🎨 AI Art Generation Request:", {
      userPrompt,
      dataset,
      colorScheme,
      scenario,
      scenarioThreshold,
      seed,
    })

    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ OPENAI_API_KEY not found")
      return NextResponse.json({
        image:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==",
        aiDescription: "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.",
      })
    }

    // Enhanced dataset descriptions
    const datasetDescriptions = {
      lissajous:
        "flowing Lissajous curves with smooth, harmonic oscillations creating elegant figure-eight and infinity patterns",
      mandelbrot:
        "intricate Mandelbrot set fractals with infinite detail, self-similar patterns, and complex mathematical boundaries",
      julia: "mesmerizing Julia set fractals with swirling, organic patterns and infinite recursive detail",
      sierpinski:
        "geometric Sierpinski triangle fractals with triangular self-similar patterns and recursive subdivisions",
      fern: "delicate Barnsley fern fractals with natural, organic leaf-like patterns and branching structures",
      neural_network:
        "interconnected neural network nodes with synaptic connections, branching pathways, and organic circuitry",
      moon_phases:
        "cyclical moon phase patterns with crescents, full circles, and waning shapes in orbital arrangements",
      checkerboard:
        "geometric checkerboard patterns with alternating squares, grid structures, and tessellated arrangements",
      spiral_galaxy:
        "sweeping spiral galaxy arms with stellar formations, cosmic dust trails, and rotating galactic structures",
      dna_helix: "double helix DNA strands with twisted ribbons, genetic code patterns, and molecular structures",
      wave_interference: "overlapping wave interference patterns with constructive and destructive wave interactions",
      crystal_lattice:
        "crystalline lattice structures with geometric arrangements, molecular bonds, and prismatic formations",
    }

    const colorDescriptions = {
      viridis: "deep purple to bright yellow gradient colors (viridis palette)",
      plasma: "purple to pink to yellow gradient colors (plasma palette)",
      inferno: "black to red to yellow gradient colors (inferno palette)",
      magma: "black to purple to white gradient colors (magma palette)",
      cividis: "blue to yellow gradient colors (cividis palette)",
      rainbow: "full spectrum rainbow colors",
      grayscale: "black and white grayscale tones",
      neon: "bright electric neon colors with glowing effects",
      pastel: "soft pastel colors with gentle, muted tones",
      monochrome: "high contrast black and white patterns",
    }

    const scenarioDescriptions = {
      none: "",
      enchanted_forest:
        "mystical enchanted forest with glowing magical elements, ancient trees, fairy lights, moss-covered stones, and ethereal mist",
      deep_ocean:
        "deep ocean depths with bioluminescent creatures, coral formations, underwater currents, and mysterious abyssal lighting",
      cosmic_nebula:
        "cosmic nebula in deep space with swirling gas clouds, distant stars, cosmic dust, and celestial phenomena",
      cyberpunk_city:
        "futuristic cyberpunk cityscape with neon lights, holographic displays, digital rain, and high-tech architecture",
      ancient_temple:
        "ancient mystical temple with weathered stone columns, hieroglyphs, golden artifacts, and sacred geometry",
      crystal_cave:
        "crystalline cave system with glowing crystals, mineral formations, refracting light, and geometric structures",
      aurora_borealis:
        "northern lights aurora borealis with dancing colored lights, arctic landscape, and atmospheric phenomena",
      volcanic_landscape:
        "volcanic landscape with flowing lava, molten rock formations, ash clouds, and fiery geological features",
      neural_connections:
        "neural network connections with synapses, brain-like structures, electrical impulses, and organic circuitry",
      quantum_realm:
        "quantum realm with particle interactions, energy fields, subatomic structures, and probability clouds",
      steampunk_workshop:
        "Victorian steampunk workshop with brass gears, steam pipes, mechanical contraptions, and industrial machinery",
      underwater_city: "submerged underwater city with bubble domes, aquatic architecture, and marine life integration",
      space_station:
        "futuristic space station with rotating modules, solar panels, docking bays, and zero-gravity environments",
      mystical_portal:
        "magical portal gateway with swirling energy, dimensional rifts, arcane symbols, and otherworldly lighting",
    }

    // Build the mathematical foundation
    const mathFoundation = `${datasetDescriptions[dataset as keyof typeof datasetDescriptions]} with ${colorDescriptions[colorScheme as keyof typeof colorDescriptions]}, ${numSamples} sample points, noise level ${noise}`

    let finalPrompt = ""
    let aiDescription = ""

    // Apply scenario blending based on threshold
    if (userPrompt && userPrompt.trim()) {
      // User provided custom prompt - use it directly
      finalPrompt = userPrompt.trim()
      aiDescription = `Custom AI prompt: ${finalPrompt}`
    } else if (scenario === "none" || scenarioThreshold === 0) {
      // Pure mathematical art
      finalPrompt = `Abstract mathematical art featuring ${mathFoundation}. Digital art, high quality, detailed, artistic visualization of mathematical concepts.`
      aiDescription = `Pure mathematical art: ${dataset} patterns with ${colorScheme} colors`
    } else {
      // Blend mathematical and scenario elements based on threshold
      const scenarioDesc = scenarioDescriptions[scenario as keyof typeof scenarioDescriptions] || ""

      if (scenarioThreshold >= 80) {
        // Scenario dominates (80-100%)
        finalPrompt = `${scenarioDesc} where the environment and structures are formed by ${mathFoundation}. The mathematical patterns become the very fabric and architecture of this ${scenario.replace("_", " ")} world. Highly detailed, cinematic, artistic masterpiece.`
        aiDescription = `${scenario.replace("_", " ")} world built from ${dataset} mathematical patterns`
      } else if (scenarioThreshold >= 50) {
        // Balanced blend (50-79%)
        finalPrompt = `Abstract mathematical art featuring ${mathFoundation}, artistically interpreted within a ${scenarioDesc} setting. The mathematical patterns blend harmoniously with the thematic elements. Digital art, high quality, detailed visualization.`
        aiDescription = `${dataset} patterns blended with ${scenario.replace("_", " ")} theme`
      } else if (scenarioThreshold >= 20) {
        // Subtle thematic hints (20-49%)
        finalPrompt = `Abstract mathematical art featuring ${mathFoundation} with subtle visual hints and color inspiration from ${scenarioDesc}. The mathematical patterns remain primary with gentle thematic influences. Digital art, high quality, detailed.`
        aiDescription = `${dataset} patterns with subtle ${scenario.replace("_", " ")} influences`
      } else {
        // Minimal theme (1-19%)
        finalPrompt = `Abstract mathematical art featuring ${mathFoundation} with very subtle color and mood inspiration from ${scenarioDesc} aesthetics. Mathematical patterns dominate. Digital art, high quality, detailed.`
        aiDescription = `${dataset} patterns with minimal ${scenario.replace("_", " ")} mood`
      }
    }

    console.log("🚀 Final prompt being sent to DALL-E 3:", finalPrompt)

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
      console.error("❌ OpenAI API Error:", errorText)

      return NextResponse.json({
        image:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==",
        aiDescription: `OpenAI API Error: ${errorText.substring(0, 200)}...`,
      })
    }

    const result = await openaiResponse.json()
    console.log("✅ OpenAI Response received:", result.data?.[0]?.url ? "Image URL received" : "No image URL")

    if (result.data && result.data[0] && result.data[0].url) {
      // Convert the image URL to base64 for consistent handling
      try {
        const imageResponse = await fetch(result.data[0].url)
        const imageBuffer = await imageResponse.arrayBuffer()
        const base64Image = Buffer.from(imageBuffer).toString("base64")
        const dataUrl = `data:image/png;base64,${base64Image}`

        return NextResponse.json({
          image: dataUrl,
          aiDescription: aiDescription,
        })
      } catch (fetchError) {
        console.error("❌ Error fetching generated image:", fetchError)
        return NextResponse.json({
          image: result.data[0].url, // Return URL directly if base64 conversion fails
          aiDescription: aiDescription,
        })
      }
    } else {
      console.error("❌ No image URL in OpenAI response:", result)
      return NextResponse.json({
        image:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==",
        aiDescription: "Failed to generate image - no URL returned from OpenAI",
      })
    }
  } catch (error: any) {
    console.error("❌ Unexpected error in AI art generation:", error)

    return NextResponse.json({
      image:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==",
      aiDescription: `Generation failed: ${error.message || "Unknown error occurred"}`,
    })
  }
}
