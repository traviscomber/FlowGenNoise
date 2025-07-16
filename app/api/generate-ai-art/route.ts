import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { dataset, scenario, seed, numSamples, noise, customPrompt } = await request.json()

    const theme = scenario || "default"

    if (
      !dataset ||
      typeof seed === "undefined" ||
      !theme ||
      typeof numSamples === "undefined" ||
      typeof noise === "undefined"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing dataset, seed, scenario/colorScheme, number of samples, or noise",
        },
        { status: 400 },
      )
    }

    console.log("Generating AI art with theme:", theme)
    console.log("Custom prompt provided:", !!customPrompt)

    let finalPrompt: string

    if (customPrompt && customPrompt.trim().length > 0) {
      // Use the custom/enhanced prompt directly
      finalPrompt = customPrompt.trim()
      console.log("Using custom prompt:", finalPrompt)
    } else {
      // Generate default prompt based on dataset and scenario
      finalPrompt = `Create a stunning mathematical art piece inspired by a ${dataset} dataset with ${numSamples} data points arranged in a ${theme} theme. The artwork should feature mathematical precision with ${dataset} patterns, blended seamlessly with ${theme} visual elements. Include subtle noise texture (${noise} level) for organic feel. Professional gallery-quality composition suitable for high-resolution display, with rich details and vibrant colors that enhance when upscaled. Mathematical beauty meets artistic expression.`
      console.log("Using generated prompt:", finalPrompt)
    }

    // Mock AI art generation - in a real app, this would call DALL-E or similar API
    // For now, return a placeholder image URL
    const placeholderImage = `https://picsum.photos/seed/${seed}/512/512`

    return NextResponse.json({
      image: placeholderImage,
      success: true,
    })
  } catch (error) {
    console.error("Error generating AI art:", error)
    return NextResponse.json({ success: false, error: "Failed to generate AI art" }, { status: 500 })
  }
}
