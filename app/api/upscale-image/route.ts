import { NextResponse } from "next/server"
import Replicate from "replicate"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(req: Request) {
  try {
    const { image } = await req.json()

    if (!image) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 })
    }

    // Use a suitable image upscaling model from Replicate
    // Example model: stability-ai/stable-diffusion:ac732df830a8c01fd6b7b638b170a6a0c6b31e25f83fdba75a24f8699876fd5a
    // A better choice for upscaling might be: "nightmareai/real-esrgan:42fed1c4974146ea495a89835bc7468e443602ce740c1347c2a249bb7a2496e1"
    // Or a more general image-to-image model if you want to "enhance" rather than just upscale pixels.
    const output = await replicate.run(
      "nightmareai/real-esrgan:42fed1c4974146ea495a89835bc7468e443602ce740c1347c2a249bb7a2496e1",
      {
        input: {
          image: image,
          scale: 4, // Upscale by 4x
        },
      },
    )

    if (!output || typeof output !== "string") {
      throw new Error("Replicate did not return a valid image URL.")
    }

    return NextResponse.json({ upscaledImage: output })
  } catch (error) {
    console.error("Error upscaling image:", error)
    return NextResponse.json({ error: "Failed to upscale image" }, { status: 500 })
  }
}
