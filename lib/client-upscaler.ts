export class ClientUpscaler {
  static async upscaleImage(imageUrl: string, scaleFactor = 4): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject(new Error("Could not get canvas context"))
          return
        }

        // Set canvas size to upscaled dimensions
        canvas.width = img.width * scaleFactor
        canvas.height = img.height * scaleFactor

        // Use bicubic-like interpolation by enabling image smoothing
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"

        // Draw upscaled image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        // Convert to data URL
        const upscaledDataUrl = canvas.toDataURL("image/png", 1.0)
        resolve(upscaledDataUrl)
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
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject(new Error("Could not get canvas context"))
          return
        }

        canvas.width = img.width
        canvas.height = img.height

        // Draw original image
        ctx.drawImage(img, 0, 0)

        // Apply enhancement filters
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Simple sharpening and contrast enhancement
        for (let i = 0; i < data.length; i += 4) {
          // Increase contrast
          data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.2 + 128)) // Red
          data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.2 + 128)) // Green
          data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.2 + 128)) // Blue
        }

        ctx.putImageData(imageData, 0, 0)

        const enhancedDataUrl = canvas.toDataURL("image/png", 1.0)
        resolve(enhancedDataUrl)
      }

      img.onerror = () => {
        reject(new Error("Failed to load image for enhancement"))
      }

      img.src = imageUrl
    })
  }
}

// Export convenience functions
export const upscaleImageClient = (imageUrl: string, scaleFactor = 4) =>
  ClientUpscaler.upscaleImage(imageUrl, scaleFactor)

export const enhanceImageClient = (imageUrl: string) => ClientUpscaler.enhanceImage(imageUrl)
