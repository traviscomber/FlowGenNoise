import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json()

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    // Use Replicate API for upscaling
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN

    if (!REPLICATE_API_TOKEN) {
      return NextResponse.json({ error: "REPLICATE_API_TOKEN is not set" }, { status: 500 })
    }

    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "9283608cc6b7be6b65a8e44983db012355f47434166ef1660a933dbf0535f9c3", // RealESRGAN
        input: {
          image: imageUrl,
          scale: 4, // Upscale by 4x
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Replicate API error:", errorData)
      return NextResponse.json(
        { error: errorData.detail || "Failed to start upscaling job" },
        { status: response.status },
      )
    }

    const prediction = await response.json()
    const predictionId = prediction.id

    // Poll for the result
    let upscaledUrl = null
    let status = prediction.status

    while (status !== "succeeded" && status !== "failed" && status !== "canceled") {
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Wait for 2 seconds
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          Authorization: `Token ${REPLICATE_API_TOKEN}`,
        },
      })
      const pollResult = await pollResponse.json()
      status = pollResult.status
      if (status === "succeeded" && pollResult.output && pollResult.output.length > 0) {
        upscaledUrl = pollResult.output[0]
      }
    }

    if (status === "succeeded" && upscaledUrl) {
      return NextResponse.json({ upscaledImageUrl: upscaledUrl })
    } else {
      return NextResponse.json({ error: `Upscaling failed with status: ${status}` }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in upscale-image API:", error)
    return NextResponse.json({ error: "Internal server error during upscaling" }, { status: 500 })
  }
}
