export class ClientUpscaler {
  static async upscaleImage(imageUrl: string, scale = 2): Promise<string> {
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

          // Set canvas size to upscaled dimensions
          canvas.width = img.width * scale
          canvas.height = img.height * scale

          // Use image smoothing for better quality
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"

          // Draw the upscaled image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

          // Convert to data URL
          const dataUrl = canvas.toDataURL("image/png", 1.0)
          resolve(dataUrl)
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

          // Draw original image
          ctx.drawImage(img, 0, 0)

          // Apply enhancement filters
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data

          // Simple sharpening filter
          for (let i = 0; i < data.length; i += 4) {
            // Increase contrast slightly
            data[i] = Math.min(255, data[i] * 1.1) // Red
            data[i + 1] = Math.min(255, data[i + 1] * 1.1) // Green
            data[i + 2] = Math.min(255, data[i + 2] * 1.1) // Blue
          }

          ctx.putImageData(imageData, 0, 0)

          const dataUrl = canvas.toDataURL("image/png", 1.0)
          resolve(dataUrl)
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
}
