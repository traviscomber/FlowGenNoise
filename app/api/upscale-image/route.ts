import { NextResponse } from "next/server"

// Direct client-side bicubic upscaling only - no server processing
export async function POST(req: Request) {
  try {
    const { imageData, scaleFactor = 4 } = await req.json()

    if (!imageData) {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 })
    }

    console.log("Directing to client-side bicubic upscaling only...")

    // Always return original image with client-side upscaling flag
    // No server-side processing, no external APIs
    return NextResponse.json({
      success: true,
      image: imageData, // Original image
      metadata: {
        originalSize: "1792x1024",
        upscaledSize: `${1792 * scaleFactor}x${1024 * scaleFactor}`,
        scaleFactor: scaleFactor,
        model: "Direct Client-side Bicubic",
        quality: "High Quality Direct Bicubic",
        method: "direct-bicubic-only",
      },
      requiresClientUpscaling: true,
    })
  } catch (error: any) {
    console.error("Error in upscaling route:", error)
    return NextResponse.json(
      {
        error: "Upscaling route failed: " + error.message,
      },
      { status: 500 },
    )
  }
}
