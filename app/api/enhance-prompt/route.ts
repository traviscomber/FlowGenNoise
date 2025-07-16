import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { dataset, scenario, numSamples, noiseScale, currentPrompt } = await request.json()

    console.log("Enhancing prompt for:", { dataset, scenario, numSamples, noiseScale })

    // Generate mathematical context for the dataset
    const datasetMath = getDatasetMathematicalContext(dataset)
    const scenarioContext = getScenarioContext(scenario)

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.log("No OpenAI API key found, using fallback prompt enhancement")

      const enhancedPrompt = `Enhanced mathematical visualization of ${dataset} dataset (${datasetMath}) in ${scenario} style (${scenarioContext}) with ${numSamples} sample points and ${noiseScale} noise scale. ${currentPrompt || ""} Professional artistic rendering with vibrant colors, mathematical precision, and dynamic composition suitable for gallery display.`

      return NextResponse.json({
        success: true,
        enhancedPrompt: enhancedPrompt.trim(),
        fallback: true,
        message: "Using basic enhancement - add OPENAI_API_KEY for AI-powered enhancement",
        originalContext: {
          dataset,
          scenario,
          numSamples,
          noiseScale,
        },
      })
    }

    const enhancementPrompt = `You are an expert in both mathematics and AI art generation. Create an enhanced DALL-E 3 prompt that combines mathematical precision with artistic beauty.

Current Context:
- Dataset: ${dataset} (${datasetMath})
- Scenario: ${scenario} (${scenarioContext})
- Data Points: ${numSamples}
- Noise Level: ${noiseScale}
- Current Prompt: ${currentPrompt || "None provided"}

Create a detailed, professional prompt that:
1. Incorporates the mathematical nature of the ${dataset} dataset
2. Blends it seamlessly with ${scenario} artistic elements
3. Mentions the complexity of ${numSamples} data points
4. Uses the noise level (${noiseScale}) to inform texture and detail
5. Ensures the result is suitable for high-resolution upscaling
6. Includes specific artistic techniques and visual elements
7. Maintains mathematical accuracy while being visually stunning

The prompt should be 2-3 sentences, highly detailed, and optimized for DALL-E 3's capabilities. Focus on creating gallery-quality mathematical art. Return only the enhanced prompt, no additional text.`

    try {
      console.log("Calling OpenAI for prompt enhancement...")

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are an expert prompt engineer specializing in mathematical art generation for DALL-E 3. Create detailed, artistic prompts that combine mathematical concepts with visual beauty.",
          },
          {
            role: "user",
            content: enhancementPrompt,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      })

      const enhancedPrompt = completion.choices[0]?.message?.content?.trim()

      if (!enhancedPrompt) {
        throw new Error("No enhanced prompt generated")
      }

      console.log("AI-enhanced prompt generated:", enhancedPrompt)

      return NextResponse.json({
        success: true,
        enhancedPrompt,
        originalContext: {
          dataset,
          scenario,
          numSamples,
          noiseScale,
        },
      })
    } catch (openaiError: any) {
      console.error("OpenAI enhancement error:", openaiError)

      // Fallback to basic enhancement
      const enhancedPrompt = `Enhanced mathematical visualization of ${dataset} dataset (${datasetMath}) in ${scenario} style (${scenarioContext}) with ${numSamples} sample points and ${noiseScale} noise scale. ${currentPrompt || ""} Professional artistic rendering with vibrant colors, mathematical precision, and dynamic composition suitable for gallery display.`

      return NextResponse.json({
        success: true,
        enhancedPrompt: enhancedPrompt.trim(),
        fallback: true,
        error: openaiError.message,
        message: "OpenAI enhancement failed, using basic enhancement",
        originalContext: {
          dataset,
          scenario,
          numSamples,
          noiseScale,
        },
      })
    }
  } catch (error) {
    console.error("Error enhancing prompt:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to enhance prompt: " + (error as Error).message,
      },
      { status: 500 },
    )
  }
}

function getDatasetMathematicalContext(dataset: string): string {
  const contexts = {
    spirals:
      "logarithmic spirals with polar coordinates r = aθ, featuring golden ratio proportions and Fibonacci sequences",
    moons:
      "two interlocking crescents based on circular arcs, representing binary classification boundaries in machine learning",
    circles: "concentric circular patterns following radial distribution functions and harmonic oscillations",
    blobs: "Gaussian mixture models with multivariate normal distributions creating organic cluster formations",
    checkerboard:
      "discrete grid patterns with alternating binary states, representing cellular automata and tessellation theory",
    gaussian: "normal distribution bell curves with statistical probability density functions and random sampling",
    grid: "regular lattice structures with uniform spacing, representing crystalline formations and periodic functions",
  }
  return contexts[dataset as keyof typeof contexts] || "mathematical point distributions with geometric patterns"
}

function getScenarioContext(scenario: string): string {
  const contexts = {
    pure: "clean mathematical visualization with grid lines, axes, and pure geometric forms highlighting mathematical properties",
    forest:
      "organic growth patterns, fractal tree structures, natural color gradients from deep forest greens to golden sunlight",
    cosmic: "stellar formations, nebula clouds, deep space colors with cosmic dust and celestial mechanics",
    ocean: "fluid dynamics, wave interference patterns, aquatic color palettes from deep blue to seafoam",
    neural: "synaptic connections, brain-like networks, electric blue and purple neural pathways with glowing nodes",
    fire: "combustion dynamics, flame propagation patterns, warm color spectrums from deep red to bright orange",
    ice: "crystalline structures, frost patterns, cool color palettes with prismatic light refraction",
    desert: "sand dune formations, wind erosion patterns, warm earth tones and golden hour lighting",
    sunset: "atmospheric light scattering, warm gradient transitions, golden hour color temperature",
    monochrome: "grayscale tonal variations, high contrast artistic composition, minimalist aesthetic",
  }
  return contexts[scenario as keyof typeof contexts] || "thematic visual elements with artistic color coordination"
}
