import { type NextRequest, NextResponse } from "next/server"
import { generateFlowField } from "@/lib/flow-model"
import { experimental_generateImage } from "ai"
import { openai } from "@ai-sdk/openai"

export const runtime = "edge"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mode, dataset, scenario, seed, numSamples, noiseScale, timeStep, customPrompt, upscaleMethod } = body

    if (mode === "flow") {
      // Generate SVG flow field
      const svgContent = generateFlowField({
        dataset,
        scenario,
        seed,
        numSamples,
        noiseScale,
        timeStep,
      })

      // Convert SVG to data URL
      const svgBlob = new Blob([svgContent], { type: "image/svg+xml" })
      const imageUrl = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString("base64")}`

      return NextResponse.json({
        imageUrl,
        svgContent,
      })
    } else if (mode === "ai") {
      // Generate AI art using DALL·E 3
      if (!process.env.OPENAI_API_KEY) {
        console.warn("OPENAI_API_KEY is not set. Returning placeholder image.")
        // Return a placeholder image URL if API key is missing
        return NextResponse.json({
          imageUrl: "/placeholder.svg?height=1024&width=1024",
          altText: "Placeholder image due to missing OpenAI API key",
        })
      }

      // Create enhanced prompt based on dataset and scenario
      let enhancedPrompt = customPrompt

      if (!customPrompt) {
        const datasetDescriptions = {
          ffhq: "high-quality human faces with diverse expressions and features",
          bedroom: "modern interior bedroom spaces with elegant furniture and lighting",
          church_outdoor: "majestic gothic and classical church architecture in outdoor settings",
          celebahq: "celebrity portraits with professional photography styling",
          neural_networks: "abstract neural network visualizations with interconnected nodes and synapses",
          quantum_fields: "quantum field theory visualizations with particle interactions and wave functions",
          dna_sequences: "DNA double helix structures with genetic code patterns and molecular bonds",
          cosmic_phenomena: "deep space cosmic events like black holes, nebulae, and stellar formations",
          fractal_geometry: "complex fractal patterns with infinite recursive mathematical structures",
          protein_folding: "protein molecular structures showing amino acid chains and folding patterns",
          brain_connectivity: "neural brain connectivity maps showing synaptic networks and pathways",
          crystalline_structures: "crystalline molecular lattices with geometric atomic arrangements",
        }

        const scenarioStyles = {
          random: "with vibrant colors and dynamic composition",
          stylegan2: "in a photorealistic style with high detail and clarity",
          stylegan: "with artistic interpretation and creative visual effects",
          pggan: "with progressive detail enhancement and layered complexity",
          cyberpunk: "in a cyberpunk aesthetic with neon colors and futuristic elements",
          bioluminescent: "with bioluminescent glowing effects and organic patterns",
          holographic: "with holographic iridescent surfaces and light refraction",
          microscopic: "as seen through an electron microscope with scientific detail",
          ethereal: "with ethereal, dreamlike qualities and soft lighting",
          crystalline: "with crystalline structures and geometric precision",
        }

        const datasetDesc =
          datasetDescriptions[dataset as keyof typeof datasetDescriptions] || "abstract artistic patterns"
        const scenarioStyle = scenarioStyles[scenario as keyof typeof scenarioStyles] || "with artistic interpretation"

        // Check if it's a scientific dataset and add more detailed prompt
        const scientificDatasets = [
          "neural_networks",
          "quantum_fields",
          "dna_sequences",
          "cosmic_phenomena",
          "fractal_geometry",
          "protein_folding",
          "brain_connectivity",
          "crystalline_structures",
        ]

        if (scientificDatasets.includes(dataset)) {
          enhancedPrompt = `Create a scientifically accurate yet artistic visualization of ${datasetDesc} ${scenarioStyle}. `

          // Add dataset-specific details
          if (dataset === "neural_networks") {
            enhancedPrompt +=
              "Show weighted connections between neurons with varying line thickness. Include input layer, hidden layers, and output layer with activation functions. Visualize the mathematical concepts of neural networks with precision."
          } else if (dataset === "dna_sequences") {
            enhancedPrompt +=
              "Show the detailed molecular structure with accurate base pairing. Visualize the phosphodiester bonds and the helical twist with scientific accuracy."
          } else if (dataset === "quantum_fields") {
            enhancedPrompt +=
              "Visualize quantum field theory concepts including probability wave functions and particle interactions. Show the mathematical beauty of quantum physics."
          } else if (dataset === "fractal_geometry") {
            enhancedPrompt +=
              "Create detailed fractal patterns with infinite recursive structures and mathematical precision. Show self-similarity at different scales."
          }

          enhancedPrompt +=
            " The image should be highly detailed, scientifically accurate, and visually striking. Use advanced lighting techniques and rich color palettes to create visual interest while maintaining mathematical precision."
        } else {
          enhancedPrompt = `Create a stunning digital artwork featuring ${datasetDesc} ${scenarioStyle}. The image should be highly detailed, professionally composed, and visually striking. Use advanced lighting techniques and rich color palettes to create depth and visual interest.`
        }
      }

      try {
        const { url } = await experimental_generateImage({
          model: openai("dall-e-3"),
          prompt: enhancedPrompt,
          quality: "standard",
          style: "vivid",
          size: "1024x1024",
        })

        return NextResponse.json({ imageUrl: url, altText: enhancedPrompt })
      } catch (error) {
        console.error("AI generation error:", error)
        return NextResponse.json({
          imageUrl: "/placeholder.svg?height=1024&width=1024",
          altText: "Placeholder image due to AI generation failure",
          error: "AI generation failed",
        })
      }
    }

    return NextResponse.json({ error: "Invalid mode" }, { status: 400 })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
