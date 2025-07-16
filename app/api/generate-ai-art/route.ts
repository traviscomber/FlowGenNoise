import { type NextRequest, NextResponse } from "next/server"

/**
 * If you have your own preferred Replicate model, set its VERSION ID in
 * the environment variable  REPLICATE_MODEL_VERSION.
 *
 * The value below is a *public* SDXL-Turbo version that works well for
 * quick previews and does not require any extra paid add-ons.
 *
 *   stability-ai/sdxl-turbo -- version: 24b08e3b4c4d3e0e29e5d8b0fdfeb58f8a4e43b51355e37cb5879131
 *
 * Docs: https://replicate.com/stability-ai/sdxl-turbo
 */
const FALLBACK_MODEL_VERSION = "24b08e3b4c4d3e0e29e5d8b0fdfeb58f8a4e43b51355e37cb5879131"

export async function POST(req: NextRequest) {
  try {
    // ---------------------------------------------------------------------
    // 1. Parse and validate user request
    // ---------------------------------------------------------------------
    const { dataset, scenario, seed = 42, numSamples = 1, noise = 0.15, customPrompt } = await req.json()

    if (!dataset || !scenario) {
      return NextResponse.json(
        {
          success: false,
          error: "Both 'dataset' and 'scenario' are required (e.g. dataset='spirals', scenario='cosmic').",
        },
        { status: 400 },
      )
    }

    // ---------------------------------------------------------------------
    // 2. Compose the prompt
    // ---------------------------------------------------------------------
    const prompt =
      customPrompt?.trim() ||
      `A beautiful ${dataset} pattern in a ${scenario} style; mathematical art; generative design; ` +
        `${numSamples} data points; noise level ${noise}; seed ${seed}; ultra-detailed; 32-bit color`

    // ---------------------------------------------------------------------
    // 3. If we do NOT have a Replicate key, return a placeholder so the UI works
    // ---------------------------------------------------------------------
    if (!process.env.REPLICATE_API_TOKEN) {
      console.warn("⚠️  REPLICATE_API_TOKEN is not set. Returning a placeholder instead of calling Replicate.")
      return NextResponse.json({
        success: true,
        placeholder: true,
        image: "/placeholder.svg?height=512&width=512",
        prompt,
      })
    }

    // ---------------------------------------------------------------------
    // 4. Fire the Replicate prediction request
    // ---------------------------------------------------------------------
    const version = process.env.REPLICATE_MODEL_VERSION || FALLBACK_MODEL_VERSION

    const predictionRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version,
        input: {
          prompt,
          width: 1024,
          height: 1024,
          num_inference_steps: 30,
          guidance_scale: 3,
          seed,
        },
      }),
    })

    if (!predictionRes.ok) {
      // Bubble up the JSON error body so we can read it client-side
      const errorJson = await predictionRes.json().catch(() => null)
      return NextResponse.json(
        {
          success: false,
          error: `Replicate request failed: ${predictionRes.status}`,
          details: errorJson ?? null,
        },
        { status: predictionRes.status },
      )
    }

    let prediction = await predictionRes.json()

    // ---------------------------------------------------------------------
    // 5. Poll until the prediction is complete
    // ---------------------------------------------------------------------
    while (prediction.status === "starting" || prediction.status === "processing") {
      console.log("⏳  Waiting for Replicate prediction…")
      await new Promise((r) => setTimeout(r, 1500))

      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}` },
      })

      if (!pollRes.ok) {
        const errorJson = await pollRes.json().catch(() => null)
        return NextResponse.json(
          {
            success: false,
            error: `Replicate polling failed: ${pollRes.status}`,
            details: errorJson ?? null,
          },
          { status: pollRes.status },
        )
      }

      prediction = await pollRes.json()
    }

    if (prediction.status !== "succeeded" || !prediction.output?.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Replicate finished but did not return an image.",
          details: prediction,
        },
        { status: 500 },
      )
    }

    // prediction.output is usually an array of URLs; take the first one
    const imageUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output

    // ---------------------------------------------------------------------
    // 6. Success 🎉
    // ---------------------------------------------------------------------
    return NextResponse.json({
      success: true,
      image: imageUrl,
      prompt,
      modelVersion: version,
    })
  } catch (err: unknown) {
    console.error("❌ Unexpected error generating AI art:", err)
    return NextResponse.json({ success: false, error: "Unexpected server error." }, { status: 500 })
  }
}
