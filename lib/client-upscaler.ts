// Client-side image upscaling using Canvas API
export class ClientUpscaler {
  static async upscaleImage(imageDataUrl: string, scaleFactor: number): Promise<string> {
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

          // Use bicubic-like interpolation by enabling image smoothing
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"

          // Draw the upscaled image
          ctx.drawImage(img, 0, 0, newWidth, newHeight)

          resolve(canvas.toDataURL("image/png"))
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = imageDataUrl
    })
  }

  static async enhanceImage(imageDataUrl: string): Promise<string> {
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

          // Get image data for enhancement
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data

          // Apply enhancement filters
          for (let i = 0; i < data.length; i += 4) {
            // Increase contrast slightly
            const contrast = 1.1
            data[i] = Math.min(255, Math.max(0, (data[i] - 128) * contrast + 128)) // Red
            data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * contrast + 128)) // Green
            data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * contrast + 128)) // Blue

            // Slight sharpening effect
            const sharpening = 1.05
            data[i] *= sharpening
            data[i + 1] *= sharpening
            data[i + 2] *= sharpening

            // Clamp values
            data[i] = Math.min(255, data[i])
            data[i + 1] = Math.min(255, data[i + 1])
            data[i + 2] = Math.min(255, data[i + 2])
          }

          // Put enhanced image data back
          ctx.putImageData(imageData, 0, 0)

          resolve(canvas.toDataURL("image/png"))
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error("Failed to load image for enhancement"))
      img.src = imageDataUrl
    })
  }
}
