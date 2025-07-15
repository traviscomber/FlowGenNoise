export const runtime = "nodejs"
export const maxDuration = 60 // seconds

import { type NextRequest, NextResponse } from "next/server"
import sharp from "sharp"

interface EnhanceRequest {
  scale: number
  enhanceMode: "photo" | "artwork" | "anime" | "generic"
  denoiseStrength: number
  sharpenStrength: number
}

// Simulate AI upscaling with advanced image processing
async function aiUpscale(imageBuffer: Buffer, scale: number, options: Partial<EnhanceRequest>): Promise<Buffer> {
  const { enhanceMode = "generic", denoiseStrength = 0.5, sharpenStrength = 0.3 } = options

  let pipeline = sharp(imageBuffer)

  // Get original dimensions
  const metadata = await pipeline.metadata()
  const newWidth = Math.round((metadata.width || 0) * scale)
  const newHeight = Math.round((metadata.height || 0) * scale)

  // Apply AI-like enhancement based on mode
  switch (enhanceMode) {
    case "photo":
      pipeline = pipeline
        .resize(newWidth, newHeight, {
          kernel: sharp.kernel.lanczos3,
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
          kernel: sharp.kernel.cubic,
          fit: "fill",
        })
        .modulate({
          brightness: 1.01,
          saturation: 1.1,
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
          kernel: sharp.kernel.mitchell,
          fit: "fill",
        })
        .modulate({
          brightness: 1.03,
          saturation: 1.15,
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
          kernel: sharp.kernel.lanczos2,
          fit: "fill",
        })
        .sharpen({
          sigma: 1.0 + sharpenStrength,
          flat: 1.0,
          jagged: 2.0,
        })
  }

  // Apply denoising (simulated with blur and unsharp mask)
  if (denoiseStrength > 0) {
    pipeline = pipeline.blur(denoiseStrength * 0.5).sharpen({
      sigma: 1.0 + denoiseStrength,
      flat: 1.0,
      jagged: 2.0,
    })
  }

  // Final quality enhancements
  pipeline = pipeline.gamma(1.1).linear(1.02, 0).jpeg({ quality: 95, progressive: true })

  return pipeline.toBuffer()
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

    const upscaledBuffer = await aiUpscale(imageBuffer, scale, {
      enhanceMode: enhanceMode as "photo" | "artwork" | "anime" | "generic",
      denoiseStrength,
      sharpenStrength,
    })

    return new NextResponse(upscaledBuffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": `attachment; filename="enhanced_${scale}x.jpg"`,
      },
    })
  } catch (error) {
    console.error("Enhancement error:", error)
    return NextResponse.json({ error: "Failed to enhance image" }, { status: 500 })
  }
}
