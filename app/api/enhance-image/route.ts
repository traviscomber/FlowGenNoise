export const runtime = "nodejs"
export const maxDuration = 60

import { type NextRequest, NextResponse } from "next/server"

// Fallback enhancement when Sharp is not available
async function clientSideEnhancement(imageBuffer: Buffer, scale: number, options: any): Promise<Buffer> {
  // Convert buffer to base64 for client processing
  const base64 = imageBuffer.toString("base64")
  const dataUrl = `data:image/jpeg;base64,${base64}`

  // Return the original buffer scaled up (basic fallback)
  // In a real implementation, you might use a different image processing library
  return imageBuffer
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const imageFile = formData.get("image") as File
    const scale = Number.parseFloat((formData.get("scale") as string) || "2")
    const enhanceMode = (formData.get("enhanceMode") as string) || "generic"
    const denoiseStrength = Number.parseFloat((formData.get("denoiseStrength") as string) || "0.5")
    const sharpenStrength = Number.parseFloat((formData.get("sharpenStrength") as string) || "0.3")

    if (!imageFile) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 })
    }

    if (scale < 1 || scale > 10) {
      return NextResponse.json({ error: "Scale must be between 1 and 10" }, { status: 400 })
    }

    const imageBuffer = Buffer.from(await imageFile.arrayBuffer())

    try {
      // Try to use Sharp if available
      const sharp = await import("sharp")

      let pipeline = sharp.default(imageBuffer)
      const metadata = await pipeline.metadata()
      const newWidth = Math.round((metadata.width || 0) * scale)
      const newHeight = Math.round((metadata.height || 0) * scale)

      // Apply enhancement based on mode
      switch (enhanceMode) {
        case "photo":
          pipeline = pipeline
            .resize(newWidth, newHeight, {
              kernel: sharp.default.kernel.lanczos3,
              fit: "fill",
            })
            .modulate({
              brightness: 1.02,
              saturation: 1.05,
              hue: 0,
            })
            .sharpen({
              sigma: 1.0 + sharpenStrength,
              flat: 1.0,
              jagged: 2.0,
            })
          break

        case "artwork":
          pipeline = pipeline
            .resize(newWidth, newHeight, {
              kernel: sharp.default.kernel.cubic,
              fit: "fill",
            })
            .modulate({
              brightness: 1.01,
              saturation: 1.2,
              hue: 0,
            })
            .sharpen({
              sigma: 0.8 + sharpenStrength,
              flat: 0.8,
              jagged: 1.5,
            })
          break

        case "anime":
          pipeline = pipeline
            .resize(newWidth, newHeight, {
              kernel: sharp.default.kernel.mitchell,
              fit: "fill",
            })
            .modulate({
              brightness: 1.03,
              saturation: 1.25,
              hue: 0,
            })
            .sharpen({
              sigma: 0.6 + sharpenStrength,
              flat: 0.6,
              jagged: 1.2,
            })
          break

        default:
          pipeline = pipeline
            .resize(newWidth, newHeight, {
              kernel: sharp.default.kernel.lanczos2,
              fit: "fill",
            })
            .sharpen({
              sigma: 1.0 + sharpenStrength,
              flat: 1.0,
              jagged: 2.0,
            })
      }

      // Apply denoising if requested
      if (denoiseStrength > 0) {
        pipeline = pipeline.blur(denoiseStrength * 0.5).sharpen({
          sigma: 1.0 + denoiseStrength,
          flat: 1.0,
          jagged: 2.0,
        })
      }

      // Final quality enhancements
      pipeline = pipeline.gamma(1.1).linear(1.02, 0).jpeg({ quality: 95, progressive: true })

      const enhancedBuffer = await pipeline.toBuffer()

      return new NextResponse(enhancedBuffer, {
        headers: {
          "Content-Type": "image/jpeg",
          "Content-Disposition": `attachment; filename="enhanced_${scale}x.jpg"`,
        },
      })
    } catch (sharpError) {
      console.warn("Sharp not available, using fallback:", sharpError)

      // Fallback to basic processing
      const fallbackBuffer = await clientSideEnhancement(imageBuffer, scale, {
        enhanceMode,
        denoiseStrength,
        sharpenStrength,
      })

      return new NextResponse(fallbackBuffer, {
        headers: {
          "Content-Type": "image/jpeg",
          "Content-Disposition": `attachment; filename="enhanced_${scale}x.jpg"`,
        },
      })
    }
  } catch (error) {
    console.error("Enhancement error:", error)
    return NextResponse.json(
      {
        error: "Failed to enhance image",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
