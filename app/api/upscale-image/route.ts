import { NextResponse } from "next/server"
import { ClientUpscaler } from "@/lib/client-upscaler"

export async function POST(req: Request) {
  try {
    const { imageDataUrl, scaleFactor } = await req.json()

    if (!imageDataUrl || typeof scaleFactor !== "number") {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 })
    }

    // Use the client-side upscaler logic
    const upscaledDataUrl = await ClientUpscaler.upscaleImage(imageDataUrl, scaleFactor)

    return NextResponse.json({ upscaledImageUrl: upscaledDataUrl })
  } catch (error) {
    console.error("Error upscaling image:", error)
    return NextResponse.json({ error: "Failed to upscale image" }, { status: 500 })
  }
}
