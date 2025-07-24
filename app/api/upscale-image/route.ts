import Replicate from "replicate"

export const runtime = "edge"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json()

    if (!imageUrl) {
      return new Response(JSON.stringify({ details: "Image URL is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Use a suitable image upscaling model from Replicate
    // Example: stability-ai/stable-diffusion-xl-base-1.0 for general upscaling
    // Or a dedicated upscaler like "nightmareai/real-esrgan" if available and suitable
    const output = await replicate.run(
      "nightmareai/real-esrgan:42fed1c4974146ea49526d7477563c9979ad7922991f003799029566681c846b",
      {
        input: {
          image: imageUrl,
          scale: 2, // Upscale by 2x
        },
      },
    )

    const upscaledImageUrl = Array.isArray(output) ? output[0] : output

    return new Response(JSON.stringify({ upscaledImageUrl }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error: any) {
    console.error("Error upscaling image:", error)
    return new Response(JSON.stringify({ details: error.message || "Internal Server Error" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    })
  }
}
