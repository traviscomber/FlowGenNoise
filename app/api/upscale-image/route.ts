import { NextResponse } from "next/server"
import { uploadUpscaledImageToCloudinary } from "@/lib/cloudinary-utils"
import { saveGeneration, getGenerationById } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const { imageData, scaleFactor, originalGenerationId } = await req.json()

    if (!imageData) {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 })
    }

    // If we have an upscaled image and original generation ID, save it
    if (originalGenerationId && imageData.startsWith("data:image")) {
      try {
        // Get original generation info
        const originalGeneration = await getGenerationById(originalGenerationId)

        if (originalGeneration) {
          // Upload upscaled image to Cloudinary
          const cloudinaryResult = await uploadUpscaledImageToCloudinary(
            imageData,
            originalGeneration.cloudinary_public_id || `gen_${originalGenerationId}`,
            scaleFactor || 4,
          )

          // Save upscaled generation to database
          const upscaledGeneration = await saveGeneration({
            dataset: originalGeneration.dataset,
            seed: originalGeneration.seed,
            num_samples: originalGeneration.num_samples,
            noise: originalGeneration.noise,
            color_scheme: originalGeneration.color_scheme,
            generation_type: originalGeneration.generation_type,
            ai_prompt: originalGeneration.ai_prompt,
            is_upscaled: true,
            original_generation_id: originalGenerationId,
            scale_factor: scaleFactor || 4,
            upscale_method: "direct-bicubic-client",
            cloudinary_public_id: cloudinaryResult.public_id,
            cloudinary_url: cloudinaryResult.secure_url,
            image_width: cloudinaryResult.width,
            image_height: cloudinaryResult.height,
            image_format: cloudinaryResult.format,
            image_bytes: cloudinaryResult.bytes,
            base64_fallback: imageData,
          })

          return NextResponse.json({
            id: upscaledGeneration.id,
            requiresClientUpscaling: true,
            image: cloudinaryResult.secure_url,
            storage: {
              database: "supabase",
              cloudinary: "uploaded",
              fallback: "base64",
            },
            metadata: {
              originalSize: "1792x1024",
              upscaledSize: "7168x4096",
              scaleFactor: scaleFactor || 4,
              model: "Direct Client-side Bicubic",
              quality: "High Quality Direct Bicubic",
              method: "direct-bicubic-cloudinary",
            },
            cloudinary: {
              public_id: cloudinaryResult.public_id,
              width: cloudinaryResult.width,
              height: cloudinaryResult.height,
              format: cloudinaryResult.format,
              bytes: cloudinaryResult.bytes,
            },
          })
        }
      } catch (error) {
        console.error("Failed to save upscaled image:", error)
      }
    }

    // Default response for client-side upscaling
    return NextResponse.json({
      requiresClientUpscaling: true,
      storage: {
        database: "pending",
        cloudinary: "pending",
        fallback: "base64",
      },
      metadata: {
        originalSize: "1792x1024",
        upscaledSize: "7168x4096",
        scaleFactor: scaleFactor || 4,
        model: "Direct Client-side Bicubic",
        quality: "High Quality Direct Bicubic",
        method: "direct-bicubic-only",
      },
    })
  } catch (error: any) {
    console.error("Error in upscale endpoint:", error)
    return NextResponse.json(
      {
        error: "Upscaling service error",
        requiresClientUpscaling: true,
        storage: {
          database: "failed",
          cloudinary: "failed",
          fallback: "base64",
        },
        metadata: {
          originalSize: "1792x1024",
          upscaledSize: "7168x4096",
          scaleFactor: 4,
          model: "Direct Client-side Bicubic",
          quality: "High Quality Direct Bicubic",
          method: "direct-bicubic-fallback",
        },
      },
      { status: 500 },
    )
  }
}
