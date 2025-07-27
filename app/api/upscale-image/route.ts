import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ success: false, error: "No image URL provided" }, { status: 400 })
    }

    console.log("Starting 4K upscaling for image:", imageUrl)

    // Use Replicate's Real-ESRGAN for upscaling
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error("Replicate API token not configured")
    }

    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        input: {
          image: imageUrl,
          scale: 4,
          face_enhance: false,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Replicate upscale API error:", errorText)
      throw new Error(`Replicate upscale API error: ${response.status} - ${errorText}`)
    }

    const prediction = await response.json()
    console.log("Replicate upscale prediction created:", prediction.id)

    // Poll for completion
    let result = prediction
    let pollAttempts = 0
    const maxPollAttempts = 120 // 2 minutes timeout for upscaling

    while ((result.status === "starting" || result.status === "processing") && pollAttempts < maxPollAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Poll every 2 seconds
      pollAttempts++

      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      })

      if (!pollResponse.ok) {
        throw new Error(`Failed to poll upscale prediction: ${pollResponse.status}`)
      }

      result = await pollResponse.json()
      console.log(`Replicate upscale status (poll attempt ${pollAttempts}):`, result.status)
    }

    if (result.status === "failed") {
      console.error("Replicate upscaling failed:", result.error)
      throw new Error(`Replicate upscaling failed: ${result.error || "Unknown error"}`)
    }

    if (result.status !== "succeeded") {
      throw new Error(`Replicate upscaling timed out or failed. Status: ${result.status}`)
    }

    if (!result.output) {
      console.error("Invalid Replicate upscale output:", result.output)
      throw new Error("No output from Replicate upscaling")
    }

    const upscaledImageUrl = result.output
    console.log("4K upscaling completed:", upscaledImageUrl)

    return NextResponse.json({
      success: true,
      upscaledImageUrl,
      originalImageUrl: imageUrl,
      estimatedFileSize: "2.5-3.1MB (4K Quality)",
      resolution: "3840x3840",
    })
  } catch (error: any) {
    console.error("4K upscaling error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to upscale image",
        details: error.stack,
      },
      { status: 500 },
    )
  }
}
