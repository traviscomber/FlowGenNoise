import { NextResponse } from "next/server"
import { generateDataset } from "@/lib/flow-model"
import { generateScatterPlotSVG } from "@/lib/plot-utils"
import { uploadImageToCloudinary } from "@/lib/cloudinary-utils"
import { saveGeneration } from "@/lib/supabase"

export async function POST(req: Request) {
  const startTime = Date.now()

  try {
    const { dataset, seed, numSamples, noise, colorScheme } = await req.json()

    if (!dataset || typeof seed === "undefined" || typeof numSamples === "undefined" || typeof noise === "undefined") {
      return NextResponse.json({ error: "Missing dataset, seed, number of samples, or noise" }, { status: 400 })
    }

    // Generate the artwork data
    const data = generateDataset(dataset, seed, numSamples, noise)
    const imageBase64 = generateScatterPlotSVG(data)
    const generationTime = Date.now() - startTime

    // Prepare generation record
    const generationData = {
      dataset,
      seed,
      num_samples: numSamples,
      noise,
      color_scheme: colorScheme,
      generation_type: "svg" as const,
      is_upscaled: false,
      generation_time_ms: generationTime,
      base64_fallback: imageBase64, // Always store base64 as fallback
    }

    // Try to upload to Cloudinary
    let cloudinaryResult = null
    try {
      cloudinaryResult = await uploadImageToCloudinary(imageBase64, {
        folder: "flowsketch-generations/svg",
        public_id: `svg_${dataset}_${seed}_${Date.now()}`,
        tags: ["flowsketch", "svg", dataset, colorScheme || "default"],
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
        image: cloudinaryResult?.secure_url || imageBase64,
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
          numSamples,
          noise,
          colorScheme,
          type: "svg",
          generation_time_ms: generationTime,
        },
      })
    } catch (dbError) {
      console.error("Database save failed:", dbError)

      // Return image even if database fails
      return NextResponse.json({
        image: cloudinaryResult?.secure_url || imageBase64,
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
          numSamples,
          noise,
          colorScheme,
          type: "svg",
          generation_time_ms: generationTime,
        },
      })
    }
  } catch (error) {
    console.error("Error generating flow art:", error)
    return NextResponse.json({ error: "Failed to generate flow art" }, { status: 500 })
  }
}
