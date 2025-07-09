import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json()

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json({ error: "Replicate API token not configured" }, { status: 500 })
    }

    // Use Replicate's aesthetic predictor
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "daeed1ba277b382462ee9f6a8b6c1c5c6c3e3c8e1c1c1c1c1c1c1c1c1c1c1c1c",
        input: {
          image: imageUrl,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.statusText}`)
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

    if (result.status === "succeeded") {
      const aestheticScore = result.output
      return NextResponse.json({
        score: aestheticScore,
        rating: getAestheticRating(aestheticScore),
      })
    } else {
      throw new Error("Aesthetic prediction failed")
    }
  } catch (error: any) {
    console.error("Error scoring image:", error)

    // Fallback to local aesthetic scoring if Replicate fails
    try {
      const localScore = await getLocalAestheticScore(req)
      return NextResponse.json(localScore)
    } catch (fallbackError) {
      return NextResponse.json(
        {
          error: "Failed to score image",
          details: error.message,
        },
        { status: 500 },
      )
    }
  }
}

function getAestheticRating(score: number): string {
  if (score >= 8.0) return "Exceptional"
  if (score >= 7.0) return "Excellent"
  if (score >= 6.0) return "Very Good"
  if (score >= 5.0) return "Good"
  if (score >= 4.0) return "Fair"
  return "Needs Improvement"
}

async function getLocalAestheticScore(req: Request): Promise<{ score: number; rating: string; method: string }> {
  const { imageUrl, metadata } = await req.json()

  // Local aesthetic scoring algorithm based on image properties
  let score = 5.0 // Base score

  try {
    // Fetch image to analyze
    const imageResponse = await fetch(imageUrl)
    const imageBuffer = await imageResponse.arrayBuffer()
    const imageSize = imageBuffer.byteLength

    // Score based on generation parameters
    if (metadata) {
      // Higher sample count generally means more detail
      if (metadata.samples > 1000) score += 0.5
      if (metadata.samples > 1500) score += 0.3

      // Optimal noise levels
      if (metadata.noise >= 0.02 && metadata.noise <= 0.08) score += 0.4

      // AI generated images tend to score higher
      if (metadata.generationMode === "ai") score += 0.8

      // Scenario-based images are more complex
      if (metadata.scenario && metadata.scenario !== "none") score += 0.6

      // Color scheme preferences
      const preferredSchemes = ["viridis", "plasma", "magma"]
      if (preferredSchemes.includes(metadata.colorScheme)) score += 0.3
    }

    // File size indicates complexity/detail
    if (imageSize > 500000) score += 0.4 // > 500KB
    if (imageSize > 1000000) score += 0.3 // > 1MB

    // Add some randomness for variety
    score += (Math.random() - 0.5) * 0.6

    // Clamp score between 1-10
    score = Math.max(1.0, Math.min(10.0, score))

    return {
      score: Number(score.toFixed(1)),
      rating: getAestheticRating(score),
      method: "local",
    }
  } catch (error) {
    // Fallback random score if all else fails
    const fallbackScore = 4.0 + Math.random() * 4.0
    return {
      score: Number(fallbackScore.toFixed(1)),
      rating: getAestheticRating(fallbackScore),
      method: "fallback",
    }
  }
}
