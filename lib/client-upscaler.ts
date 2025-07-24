import type { UpscaleParams } from "./flow-model"

export async function upscaleImage(params: UpscaleParams): Promise<string> {
  try {
    const response = await fetch("/api/upscale-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to upscale image")
    }

    const data = await response.json()
    return data.upscaledImageUrl
  } catch (error) {
    console.error("Error upscaling image:", error)
    throw error
  }
}
