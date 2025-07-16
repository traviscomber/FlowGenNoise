import { type NextRequest, NextResponse } from "next/server"
import { generateFlowVisualization } from "@/lib/flow-model"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mode, dataset, scenario, seed } = body

    if (mode === "flow") {
      // Generate SVG flow field
      const svgContent = generateFlowVisualization(dataset, seed)
      const svgBlob = new Blob([svgContent], { type: "image/svg+xml" })
      const imageUrl = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString("base64")}`

      return NextResponse.json({
        imageUrl,
        svgContent,
      })
    } else if (mode === "ai") {
      // Generate AI art using DALL·E 3
      if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json({
          imageUrl: `/placeholder.svg?height=512&width=512&text=AI+Art+${dataset}+${scenario}`,
          svgContent: "",
        })
      }

      const prompt = buildAIPrompt(dataset, scenario, seed)

      try {
        const response = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: `Generate an image: ${prompt}`,
            n: 1,
            size: "1024x1024",
            quality: "standard",
            response_format: "url",
          }),
        })

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`)
        }

        const data = await response.json()
        const imageUrl = data.data[0]?.url

        if (!imageUrl) {
          throw new Error("No image URL returned from OpenAI")
        }

        return NextResponse.json({
          imageUrl,
          svgContent: "",
          prompt,
        })
      } catch (error) {
        console.error("AI generation error:", error)
        return NextResponse.json({
          imageUrl: `/placeholder.svg?height=512&width=512&text=AI+Art+Error`,
          svgContent: "",
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

function buildAIPrompt(dataset: string, scenario: string, seed: number): string {
  const datasetPrompts = {
    neural_networks: "neural network visualization with interconnected nodes and synaptic connections",
    dna_sequences: "DNA double helix structure with genetic code patterns and molecular bonds",
    quantum_fields: "quantum particle interactions with energy fields and wave functions",
    cosmic_phenomena: "cosmic structures with stars, galaxies, and celestial phenomena",
    fractal_geometry: "fractal patterns with recursive mathematical structures",
    protein_folding: "protein folding visualization with amino acid chains and biochemical structures",
    brain_connectivity: "brain connectivity map with neural pathways and cognitive networks",
    crystalline_structures: "crystalline molecular structures with geometric lattice patterns",
  }

  const scenarioPrompts = {
    cyberpunk: "in a cyberpunk style with neon colors, futuristic aesthetics, and digital elements",
    bioluminescent: "with bioluminescent effects, organic glowing patterns, and natural luminescence",
    holographic: "with holographic effects, iridescent surfaces, and prismatic light refraction",
    microscopic: "in microscopic detail style, electron microscope aesthetic, ultra-detailed structures",
    ethereal: "in an ethereal dreamlike style, soft flowing forms, mystical atmosphere",
    crystalline: "with crystalline precision, geometric clarity, and sharp angular forms",
  }

  const basePrompt = datasetPrompts[dataset as keyof typeof datasetPrompts] || "abstract scientific visualization"
  const stylePrompt = scenarioPrompts[scenario as keyof typeof scenarioPrompts] || "in an artistic style"

  return `${basePrompt} ${stylePrompt}, high quality digital art, detailed, vibrant colors, seed:${seed}`
}
