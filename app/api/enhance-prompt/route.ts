import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { type NextRequest, NextResponse } from "next/server"

export const runtime = "edge" // This API route can run on the edge

export async function POST(req: NextRequest) {
  try {
    const { prompt, datasetType } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    let systemPrompt = ""
    if (datasetType === "scientific") {
      systemPrompt = `You are an AI art prompt enhancer specializing in scientific and mathematical concepts. Your goal is to transform a simple scientific idea into a vivid, detailed, and artistically inspiring prompt for an image generation AI. Incorporate elements of abstract art, surrealism, or futuristic design. Use precise scientific terminology where appropriate, but ensure the overall prompt is imaginative and visually rich. Focus on light, texture, composition, and color to make the scientific concept visually stunning.

Example:
Input: "Fractal geometry"
Output: "An intricate, infinitely repeating fractal landscape, rendered with luminous neon lines against a deep cosmic void. The patterns evoke Mandelbrot sets and Julia fractals, glowing with an ethereal light, creating a sense of infinite depth and complexity. High detail, volumetric lighting, digital art, 8k."

Input: "Quantum entanglement"
Output: "A mesmerizing visual representation of quantum entanglement, where two particles are connected by shimmering, iridescent threads of light across vast cosmic distances. The scene is bathed in a soft, pulsating glow, with subtle energy fields radiating from the entangled pair. Abstract, ethereal, high resolution, conceptual art."

Input: "Neural network"
Output: "A sprawling, interconnected neural network visualized as a vibrant, bioluminescent city at night. Each node pulses with data, connected by glowing pathways that represent synaptic connections. The architecture is organic yet geometric, with a sense of intelligent growth and complex information flow. Cyberpunk aesthetic, intricate details, digital painting."
`
    } else {
      // Default prompt enhancement for non-scientific datasets
      systemPrompt = `You are an AI art prompt enhancer. Your goal is to transform a simple idea into a vivid, detailed, and artistically inspiring prompt for an image generation AI. Focus on light, texture, composition, and color to make the concept visually stunning. Add artistic styles and details.

Example:
Input: "A cat"
Output: "A majestic fluffy cat with emerald eyes, sitting regally on a velvet cushion, bathed in warm golden hour light. Detailed fur, intricate patterns on the cushion, chiaroscuro lighting, oil painting, highly detailed, 8k."

Input: "Forest"
Output: "An ancient, mystical forest at twilight, with towering trees draped in bioluminescent moss. A soft, ethereal mist drifts through the canopy, illuminated by fireflies. Deep greens and blues, fantasy art, volumetric fog, cinematic lighting."
`
    }

    const { text: enhancedPrompt } = await generateText({
      model: openai("gpt-4o"),
      prompt: prompt,
      system: systemPrompt,
      temperature: 0.7,
    })

    return NextResponse.json({ enhancedPrompt })
  } catch (error) {
    console.error("Error enhancing prompt:", error)
    return NextResponse.json({ error: "Failed to enhance prompt" }, { status: 500 })
  }
}
