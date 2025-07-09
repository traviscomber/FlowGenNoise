// Direct client-side bicubic upscaling using Canvas API
export class ClientUpscaler {
  static async upscaleImage(imageUrl: string, scaleFactor = 4): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")

          if (!ctx) {
            reject(new Error("Could not get canvas context"))
            return
          }

          // Set new dimensions
          const newWidth = img.width * scaleFactor
          const newHeight = img.height * scaleFactor

          canvas.width = newWidth
          canvas.height = newHeight

          // Use bicubic-like interpolation by enabling imageSmoothingEnabled
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"

          // Draw the upscaled image
          ctx.drawImage(img, 0, 0, newWidth, newHeight)

          // Convert to data URL
          const upscaledDataUrl = canvas.toDataURL("image/png", 1.0)
          resolve(upscaledDataUrl)
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        reject(new Error("Failed to load image for upscaling"))
      }

      img.src = imageUrl
    })
  }

  static async enhanceImage(imageUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")

          if (!ctx) {
            reject(new Error("Could not get canvas context"))
            return
          }

          canvas.width = img.width
          canvas.height = img.height

          // Draw the image
          ctx.drawImage(img, 0, 0)

          // Get image data for enhancement
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data

          // Apply simple sharpening filter
          for (let i = 0; i < data.length; i += 4) {
            // Increase contrast slightly
            data[i] = Math.min(255, data[i] * 1.1) // Red
            data[i + 1] = Math.min(255, data[i + 1] * 1.1) // Green
            data[i + 2] = Math.min(255, data[i + 2] * 1.1) // Blue
          }

          // Put enhanced image data back
          ctx.putImageData(imageData, 0, 0)

          const enhancedDataUrl = canvas.toDataURL("image/png", 1.0)
          resolve(enhancedDataUrl)
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        reject(new Error("Failed to load image for enhancement"))
      }

      img.src = imageUrl
    })
  }

  static async uploadUpscaledToCloudinary(
    imageData: string,
    originalPublicId: string,
    scaleFactor: number,
  ): Promise<{ image: string; cloudinary: any } | null> {
    try {
      const response = await fetch("/api/upscale-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageData,
          originalPublicId,
          scaleFactor,
        }),
      })

      if (!response.ok) {
        console.error("Failed to upload upscaled image to Cloudinary")
        return null
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error("Error uploading upscaled image:", error)
      return null
    }
  }
}
