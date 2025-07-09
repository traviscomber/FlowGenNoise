import { NextResponse } from "next/server"
import { generateDataset } from "@/lib/flow-model"
import { generateScatterPlotSVG } from "@/lib/plot-utils"
import { uploadImageToCloudinary } from "@/lib/cloudinary-utils"

export async function POST(req: Request) {
  try {
    const { dataset, seed, numSamples, noise, colorScheme } = await req.json()

    if (!dataset || typeof seed === "undefined" || typeof numSamples === "undefined" || typeof noise === "undefined") {
      return NextResponse.json({ error: "Missing dataset, seed, number of samples, or noise" }, { status: 400 })
    }

    // Generate the artwork data
    const data = generateDataset(dataset, seed, numSamples, noise)
    const imageBase64 = generateScatterPlotSVG(data)

    // Upload to Cloudinary
    try {
      const cloudinaryResult = await uploadImageToCloudinary(imageBase64, {
        folder: "flowsketch-generations/svg",
        public_id: `svg_${dataset}_${seed}_${Date.now()}`,
        tags: ["flowsketch", "svg", dataset, colorScheme || "default"],
      })

      return NextResponse.json({
        image: cloudinaryResult.secure_url,
        cloudinary: {
          public_id: cloudinaryResult.public_id,
          width: cloudinaryResult.width,
          height: cloudinaryResult.height,
          format: cloudinaryResult.format,
          bytes: cloudinaryResult.bytes,
        },
        generation_params: {
          dataset,
          seed,
          numSamples,
          noise,
          colorScheme,
          type: "svg",
        },
      })
    } catch (cloudinaryError) {
      console.error("Cloudinary upload failed, returning base64:", cloudinaryError)
      // Fallback to base64 if Cloudinary fails
      return NextResponse.json({
        image: imageBase64,
        cloudinary_error: "Upload failed, using base64 fallback",
        generation_params: {
          dataset,
          seed,
          numSamples,
          noise,
          colorScheme,
          type: "svg",
        },
      })
    }
  } catch (error) {
    console.error("Error generating flow art:", error)
    return NextResponse.json({ error: "Failed to generate flow art" }, { status: 500 })
  }
}
