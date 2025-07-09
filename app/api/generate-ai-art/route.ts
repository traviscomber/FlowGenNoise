import { NextResponse } from "next/server"
import { generateText, experimental_generateImage } from "ai"
import { openai } from "@ai-sdk/openai"
import { uploadImageToCloudinary } from "@/lib/cloudinary-utils"
import { saveGeneration } from "@/lib/supabase"

export async function POST(req: Request) {
  const startTime = Date.now()

  try {
    const { dataset, seed, colorScheme, numSamples, noise } = await req.json()

    if (
      !dataset ||
      typeof seed === "undefined" ||
      !colorScheme ||
      typeof numSamples === "undefined" ||
      typeof noise === "undefined"
    ) {
      return NextResponse.json(
        { error: "Missing dataset, seed, color scheme, number of samples, or noise" },
        { status: 400 },
      )
    }

    // Step 1: Generate enhanced prompt for high-quality base image
    const { text: imagePrompt } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Create a highly detailed image generation prompt for DALL-E 3 that will serve as a base for professional 8K upscaling. The artwork should be a generative art masterpiece inspired by a '${dataset}' dataset with a '${colorScheme}' color scheme.

Requirements for upscaling-ready image:
- Clean, sharp edges and well-defined structures
- Rich detail that will enhance beautifully when upscaled
- Professional composition suitable for large format printing
- Mathematical precision with ${numSamples} elements arranged organically
- Subtle noise texture of ${noise} that adds visual interest
- High contrast and vibrant colors that will scale well
- Complex patterns and textures that reward close inspection
- Gallery-quality artistic composition

The image should be optimized as a base for AI upscaling to 8K resolution, with every element designed to enhance beautifully when processed through professional upscaling algorithms.`,
      temperature: 0.8,
    })

    console.log("Generated Base Image Prompt:", imagePrompt)

    // Step 2: Generate high-quality base image
    const { image } = await experimental_generateImage({
      model: openai.image("dall-e-3"),
      prompt: imagePrompt,
      quality: "hd",
      size: "1792x1024", // Maximum DALL-E 3 resolution
      style: "vivid",
    })

    const baseImage = `data:image/png;base64,${image.base64}`
    const generationTime = Date.now() - startTime

    // Prepare generation record
    const generationData = {
      dataset,
      seed,
      num_samples: numSamples,
      noise,
      color_scheme: colorScheme,
      generation_type: "ai" as const,
      ai_prompt: imagePrompt,
      is_upscaled: false,
      generation_time_ms: generationTime,
      base64_fallback: baseImage, // Always store base64 as fallback
    }

    // Try to upload to Cloudinary
    let cloudinaryResult = null
    try {
      cloudinaryResult = await uploadImageToCloudinary(baseImage, {
        folder: "flowsketch-generations/ai",
        public_id: `ai_${dataset}_${seed}_${Date.now()}`,
        tags: ["flowsketch", "ai-generated", dataset, colorScheme],
      })

      // Update generation data with Cloudinary info
      Object.assign(generationData, {
        cloudinary_public_id: cloudinaryResult.public_id,
        cloudinary_url: cloudinaryResult.secure_url,
        image_width: cloudinaryResult.width,
        image_height: cloudinaryResult.height,
        image_format: cloudinaryResult.format,
        image_bytes: cloudinaryResult.bytes,
      })
    } catch (cloudinaryError) {
      console.error("Cloudinary upload failed:", cloudinaryError)
      // Continue without Cloudinary - we have base64 fallback
    }

    // Save to Supabase database
    try {
      const savedGeneration = await saveGeneration(generationData)

      return NextResponse.json({
        id: savedGeneration.id,
        image: cloudinaryResult?.secure_url || baseImage,
        baseResolution: "1792x1024",
        readyForUpscaling: true,
        recommendedUpscale: "4x",
        storage: {
          database: "supabase",
          cloudinary: cloudinaryResult ? "uploaded" : "failed",
          fallback: "base64",
        },
        cloudinary: cloudinaryResult
          ? {
              public_id: cloudinaryResult.public_id,
              width: cloudinaryResult.width,
              height: cloudinaryResult.height,
              format: cloudinaryResult.format,
              bytes: cloudinaryResult.bytes,
            }
          : null,
        generation_params: {
          dataset,
          seed,
          colorScheme,
          numSamples,
          noise,
          type: "ai",
          prompt: imagePrompt,
          generation_time_ms: generationTime,
        },
      })
    } catch (dbError) {
      console.error("Database save failed:", dbError)

      // Return image even if database fails
      return NextResponse.json({
        image: cloudinaryResult?.secure_url || baseImage,
        baseResolution: "1792x1024",
        readyForUpscaling: true,
        recommendedUpscale: "4x",
        storage: {
          database: "failed",
          cloudinary: cloudinaryResult ? "uploaded" : "failed",
          fallback: "base64",
        },
        error: "Failed to save to database, but image generated successfully",
        cloudinary: cloudinaryResult,
        generation_params: {
          dataset,
          seed,
          colorScheme,
          numSamples,
          noise,
          type: "ai",
          prompt: imagePrompt,
          generation_time_ms: generationTime,
        },
      })
    }
  } catch (error: any) {
    console.error("Error generating base AI art:", error)
    if (error.message.includes("api_key")) {
      return NextResponse.json(
        { error: "OpenAI API key is missing or invalid. Please set OPENAI_API_KEY." },
        { status: 500 },
      )
    }
    return NextResponse.json({ error: "Failed to generate AI art: " + error.message }, { status: 500 })
  }
}
