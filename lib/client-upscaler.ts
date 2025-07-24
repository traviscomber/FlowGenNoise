export class ClientUpscaler {
  static async upscaleImage(imageUrl: string, scaleFactor = 2): Promise<string> {
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

          // Use better image scaling
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"

          // Draw the upscaled image
          ctx.drawImage(img, 0, 0, newWidth, newHeight)

          // Apply some enhancement filters
          const imageData = ctx.getImageData(0, 0, newWidth, newHeight)
          const data = imageData.data

          // Simple sharpening filter
          for (let i = 0; i < data.length; i += 4) {
            // Increase contrast slightly
            data[i] = Math.min(255, data[i] * 1.1) // Red
            data[i + 1] = Math.min(255, data[i + 1] * 1.1) // Green
            data[i + 2] = Math.min(255, data[i + 2] * 1.1) // Blue
          }

          ctx.putImageData(imageData, 0, 0)

          // Convert to data URL
          const dataUrl = canvas.toDataURL("image/png", 0.95)
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
}
