import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { dataset, scenario, colorScheme, numSamples, noiseScale, currentPrompt } = await request.json()

    // Create god-level mathematical art prompt
    const systemPrompt = `You are a world-class mathematical artist and theoretical physicist who creates museum-quality AI art prompts. Generate incredibly detailed, scientifically accurate prompts that combine advanced mathematics, theoretical physics, and professional art direction.`

    const enhancementPrompt = `Create a god-level AI art prompt for generating mathematical artwork with these parameters:

Dataset: ${dataset}
Scenario: ${scenario} 
Color Scheme: ${colorScheme}
Sample Points: ${numSamples}
Noise Scale: ${noiseScale}
Current Prompt: ${currentPrompt || "None"}

Generate a professional, museum-quality prompt that includes:

1. MATHEMATICAL FOUNDATION: Specific equations, theorems, and mathematical concepts
2. PHYSICAL LAWS: Relevant physics principles and quantitative parameters  
3. VISUAL SPECIFICATIONS: Professional art direction with technical details
4. LIGHTING & MATERIALS: HDR lighting, PBR materials, subsurface scattering
5. SCALE & COMPOSITION: From quantum to cosmic scale relationships
6. ARTISTIC STYLE: Professional photography/digital art techniques

Make it incredibly detailed, scientifically accurate, and artistically sophisticated. Include specific mathematical formulas, physical constants, and professional rendering techniques.`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: enhancementPrompt,
      maxTokens: 1000,
      temperature: 0.8,
    })

    return NextResponse.json({ enhancedPrompt: text })
  } catch (error: any) {
    console.error("Prompt enhancement error:", error)
    return NextResponse.json({ error: "Failed to enhance prompt", details: error.message }, { status: 500 })
  }
}
