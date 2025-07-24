import Replicate from "replicate"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Use a text-to-image model from Replicate
    // Example model: stability-ai/sdxl
    // You can find other models at https://replicate.com/explore
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfdc46ce7a0b41fd11988cd39944",
      {
        input: {
          prompt: prompt,
          num_inference_steps: 25,
          guidance_scale: 7.5,
          width: 768,
          height: 768,
        },
      },
    )

    // The output from Replicate is typically an array of image URLs
    const imageUrl = Array.isArray(output) && output.length > 0 ? output[0] : null

    if (!imageUrl) {
      throw new Error("No image URL received from AI model.")
    }

    return new Response(JSON.stringify({ imageUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error generating AI art:", error)
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
