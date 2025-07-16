import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { dataset, scenario, seed, numSamples, noise, customPrompt } = await request.json()

    // Build the prompt based on parameters
    let prompt = customPrompt
    if (!customPrompt) {
      prompt = `A beautiful ${dataset} pattern in a ${scenario} style, mathematical art, generative design, 
      ${numSamples} data points, noise level ${noise}, seed ${seed}, digital art, high quality, detailed`
    }

    // For demo purposes, we'll use Replicate's FLUX model
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: process.env.REPLICATE_MODEL_VERSION || "black-forest-labs/flux-schnell",
        input: {
          prompt: prompt,
          width: 512,
          height: 512,
          num_inference_steps: 4,
          seed: seed,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.status}`)
    }

    const prediction = await response.json()

    // Poll for completion
    let result = prediction
    while (result.status === "starting" || result.status === "processing") {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      })

      result = await pollResponse.json()
    }

    if (result.status === "succeeded" && result.output) {
      return NextResponse.json({
        success: true,
        image: Array.isArray(result.output) ? result.output[0] : result.output,
      })
    } else {
      throw new Error("AI generation failed")
    }
  } catch (error) {
    console.error("Error generating AI art:", error)
    return NextResponse.json({ success: false, error: "Failed to generate AI art" }, { status: 500 })
  }
}
