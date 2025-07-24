import { type NextRequest, NextResponse } from "next/server"
import { experimental_generateImage } from "ai"
import { openai } from "@ai-sdk/openai"

/**
 * Generate an AI image from a fully-formed prompt.
 *
 * Request JSON:
 *   { prompt: string, size?: "1024x1024" | "1792x1024" | "1024x1792" }
 *
 * Response JSON:
 *   { imageUrl: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { dataset, scenario, colorScheme, seed, numSamples, noise, customPrompt } = await req.json()

    /* --------------------------------------------------------------------- */
    /* 1. Build a prompt (use customPrompt if one was provided)              */
    /* --------------------------------------------------------------------- */

    const prompt = customPrompt?.trim().length
      ? `${customPrompt.trim()}. IMPORTANT: No text, no words, no letters, no typography, no labels, no captions. Pure visual art only.`
      : `Create an ultra-high-resolution abstract mathematical artwork depicting "${dataset}" patterns blended with a "${scenario}" environment.
Colour palette: ${colorScheme}.
${numSamples} data points with noise level ${noise}.
Include scientific detail, museum-grade composition, HDR lighting, PBR materials, and professional post-processing.
Seed reference: ${seed}.

IMPORTANT: No text, no words, no letters, no typography, no labels, no captions, no mathematical equations visible as text.
Pure abstract visual art only. Focus on colors, shapes, patterns, and mathematical structures as visual elements, not written content.`

    /* --------------------------------------------------------------------- */
    /* 2. Try OpenAI DALL·E 3 first                                          */
    /* --------------------------------------------------------------------- */
    try {
      const { image } = await experimental_generateImage({
        model: openai("dall-e-3"),
        prompt,
        size: "1792x1024",
        quality: "hd",
        style: "vivid",
      })

      return NextResponse.json({
        image: `data:image/png;base64,${image.base64}`,
        promptUsed: prompt,
        provider: "openai",
      })
    } catch (openaiErr: any) {
      console.warn("OpenAI image generation failed – will try Replicate.", openaiErr)
    }

    /* --------------------------------------------------------------------- */
    /* 3. Fallback to Replicate only if a token is available                 */
    /* --------------------------------------------------------------------- */
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error("Both OpenAI generation failed and REPLICATE_API_TOKEN is missing.")
    }

    const replicateResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      // IMPORTANT: update version & input fields for the model you actually want
      body: JSON.stringify({
        version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4", // example SDXL Turbo
        input: {
          prompt,
          width: 1024,
          height: 1024,
          num_inference_steps: 30,
          guidance_scale: 7,
          seed,
        },
      }),
    })

    const prediction = await replicateResponse.json()

    if (!replicateResponse.ok) {
      console.error("Replicate error payload:", prediction)
      throw new Error(`Replicate API error ${replicateResponse.status}: ${prediction?.detail || "Unknown"}`)
    }

    // Poll Replicate prediction until it finishes
    let result = prediction
    while (result.status === "starting" || result.status === "processing") {
      await new Promise((r) => setTimeout(r, 1500))
      const poll = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}` },
      })
      result = await poll.json()
    }

    if (result.status !== "succeeded") {
      console.error("Replicate final status:", result)
      throw new Error(`Replicate prediction failed: ${result.status}`)
    }

    // Some models return a single URL, others an array
    const finalUrl = Array.isArray(result.output) ? result.output[0] : result.output

    return NextResponse.json({
      image: finalUrl,
      promptUsed: prompt,
      provider: "replicate",
      replicateStatus: result.status,
    })
  } catch (err: any) {
    console.error("AI art generation route error:", err)
    return NextResponse.json({ error: "AI art generation failed", detail: err.message }, { status: 500 })
  }
}
