import { type NextRequest, NextResponse } from "next/server"
import { experimental_generateImage } from "ai"
import { openai } from "@ai-sdk/openai"

/**
 * POST /api/generate-ai-art
 *
 * Body:
 * {
 *   dataset: string,
 *   scenario: string,
 *   colorScheme: string,
 *   seed: number,
 *   numSamples: number,
 *   noise: number,
 *   customPrompt?: string,
 *   enableStereographic?: boolean,
 *   stereographicPerspective?: string
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const {
      dataset,
      scenario,
      colorScheme,
      seed,
      numSamples,
      noise,
      customPrompt,
      enableStereographic,
      stereographicPerspective,
    } = await req.json()

    /* --------------------------------------------------------------------- */
    /* 1. Build a prompt (use customPrompt if one was provided)              */
    /* --------------------------------------------------------------------- */

    let prompt =
      customPrompt ||
      `Generate a highly detailed, abstract mathematical artwork.
Dataset: ${dataset}
Scenario: ${scenario}
Color Scheme: ${colorScheme}
Number of Sample Points: ${numSamples}
Noise Scale: ${noise}
`

    if (enableStereographic) {
      if (stereographicPerspective === "little-planet") {
        prompt += `Apply a dramatic little planet stereographic projection effect, creating a spherical, miniature world view. Emphasize curved horizons, radial distortion, and a sense of looking down onto a tiny, self-contained universe. The mathematical patterns should wrap seamlessly around this spherical form, creating a captivating, immersive visual.`
      } else if (stereographicPerspective === "tunnel") {
        prompt += `Apply an intense tunnel vision stereographic projection effect, creating a deep, immersive vortex. Emphasize strong inward curvature, a central vanishing point, and a sense of infinite depth. The mathematical patterns should stretch and distort along this tunnel, drawing the viewer's eye into the core of the artwork.`
      }
    }

    // Add a general artistic and technical enhancement if no custom prompt is provided
    if (!customPrompt) {
      prompt += `
Render this as an ultra-high-resolution, museum-grade composition. Incorporate advanced HDR lighting, physically based rendering (PBR) materials with subtle subsurface scattering, and a cinematic, photorealistic quality. The composition should balance intricate detail with grand scale, from quantum-level textures to cosmic-scale structures. Use a blend of abstract digital art and professional photography techniques.
`
    }

    // Critical instruction to ensure pure abstract visual art
    prompt += `IMPORTANT: No text, no words, no letters, no typography, no labels, no captions, no mathematical equations visible as text. Pure abstract visual art only. Focus on colors, shapes, patterns, and mathematical structures as visual elements, not written content.`

    console.log("Final prompt sent to AI:", prompt)

    /* --------------------------------------------------------------------- */
    /* 2. Try OpenAI DALL·E 3 first                                          */
    /* --------------------------------------------------------------------- */
    try {
      const { image } = await experimental_generateImage({
        model: openai.image("dall-e-3"),
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
