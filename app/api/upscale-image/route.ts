import { NextResponse } from "next/server"
import { uploadUpscaledImageToCloudinary } from "@/lib/cloudinary-utils"

export async function POST(req: Request) {
  try {
    const { imageData, scaleFactor, originalPublicId } = await req.json()

    if (!imageData) {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 })
    }

    // Always return client-side upscaling flag since we're using direct bicubic only
    // But if we have an upscaled image, try to store it in Cloudinary
    if (originalPublicId && imageData.startsWith("data:image")) {
      try {
        const cloudinaryResult = await uploadUpscaledImageToCloudinary(imageData, originalPublicId, scaleFactor || 4)

        return NextResponse.json({
          requiresClientUpscaling: true,
          image: cloudinaryResult.secure_url,
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
      } catch (cloudinaryError) {
        console.error("Failed to upload upscaled image to Cloudinary:", cloudinaryError)
      }
    }

    // Default response for client-side upscaling
    return NextResponse.json({
      requiresClientUpscaling: true,
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
