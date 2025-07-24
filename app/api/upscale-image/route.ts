import { NextResponse } from "next/server"
import Replicate from "replicate"

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    // Use a super-resolution model from Replicate
    // This model is just an example, you might choose a different one.
    const output = await replicate.run(
      "nightmareai/real-esrgan:42fed1c4974146ea495a8156d55570787b7b020e70006b99c817b983b1c0191b",
      {
        input: {
          image: imageUrl,
          scale: 4, // Upscale by 4x
        },
      },
    )

    if (!output || typeof output !== "string") {
      throw new Error("Replicate API did not return a valid image URL.")
    }

    return NextResponse.json({ success: true, upscaledUrl: output })
  } catch (error: any) {
    console.error("Error upscaling image with Replicate:", error)
    return NextResponse.json({ error: "Failed to upscale image", details: error.message }, { status: 500 })
  }
}
