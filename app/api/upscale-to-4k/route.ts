import { type NextRequest, NextResponse } from "next/server"
import sharp from "sharp"

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    console.log("Starting 4K upscaling for:", imageUrl)

    // Fetch the original image
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`)
    }

    const imageBuffer = await response.arrayBuffer()
    const inputBuffer = Buffer.from(imageBuffer)

    console.log(`Original image size: ${inputBuffer.length} bytes`)

    // Get original image metadata
    const metadata = await sharp(inputBuffer).metadata()
    console.log("Original image metadata:", {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      channels: metadata.channels,
    })

    // Calculate target dimensions (4K = 3840x3840)
    const targetSize = 3840
    const originalSize = Math.max(metadata.width || 1024, metadata.height || 1024)
    const scaleFactor = targetSize / originalSize

    console.log(`Upscaling from ${originalSize}px to ${targetSize}px (${scaleFactor.toFixed(2)}x)`)

    // Upscale using Sharp with high-quality settings
    const upscaledBuffer = await sharp(inputBuffer)
      .resize(targetSize, targetSize, {
        kernel: sharp.kernel.lanczos3, // High-quality resampling
        fit: "fill", // Ensure exact dimensions
        background: { r: 0, g: 0, b: 0, alpha: 1 }, // Black background for any padding
      })
      .jpeg({
        quality: 95, // High quality JPEG
        progressive: true, // Progressive JPEG for better loading
        mozjpeg: true, // Use mozjpeg encoder for better compression
      })
      .toBuffer()

    console.log(`Upscaled image size: ${upscaledBuffer.length} bytes`)

    // Convert to base64 data URL
    const base64 = upscaledBuffer.toString("base64")
    const dataUrl = `data:image/jpeg;base64,${base64}`

    // Calculate estimated file size
    const fileSizeMB = (upscaledBuffer.length / (1024 * 1024)).toFixed(1)

    console.log("4K upscaling completed successfully")

    return NextResponse.json({
      success: true,
      upscaledImageUrl: dataUrl,
      originalSize: `${metadata.width}x${metadata.height}`,
      upscaledSize: `${targetSize}x${targetSize}`,
      scaleFactor: scaleFactor.toFixed(2),
      estimatedFileSize: `${fileSizeMB}MB`,
      compressionRatio: (inputBuffer.length / upscaledBuffer.length).toFixed(2),
    })
  } catch (error) {
    console.error("4K upscaling error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to upscale image to 4K",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
