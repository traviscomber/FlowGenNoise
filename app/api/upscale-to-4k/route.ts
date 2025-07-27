import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, targetResolution = "2160p" } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    console.log("🔍 Starting 4K upscaling process")
    console.log("📸 Input image:", imageUrl.substring(0, 50) + "...")
    console.log("🎯 Target resolution:", targetResolution)

    // Use Real-ESRGAN for high-quality upscaling
    const output = await replicate.run(
      "nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
      {
        input: {
          image: imageUrl,
          scale: targetResolution === "2160p" ? 4 : 2, // 4x for 4K, 2x for 1440p
          face_enhance: false, // Keep false for mathematical art
        },
      },
    )

    if (!output) {
      throw new Error("Upscaling failed - no output received")
    }

    const upscaledImageUrl = Array.isArray(output) ? output[0] : output

    console.log("✅ 4K upscaling completed successfully!")
    console.log("🖼️ Upscaled image:", upscaledImageUrl.substring(0, 50) + "...")

    // Calculate dimensions based on target resolution
    const dimensions = targetResolution === "2160p" ? { width: 2160, height: 2160 } : { width: 1440, height: 1440 }

    return NextResponse.json({
      success: true,
      image: upscaledImageUrl,
      originalImage: imageUrl,
      dimensions,
      targetResolution,
      upscaleRatio: targetResolution === "2160p" ? "4x" : "2x",
      estimatedFileSize: targetResolution === "2160p" ? "~4.2MB" : "~2.1MB",
      provider: "Real-ESRGAN",
    })
  } catch (error: any) {
    console.error("❌ 4K upscaling error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || "4K upscaling failed",
      },
      { status: 500 },
    )
  }
}
