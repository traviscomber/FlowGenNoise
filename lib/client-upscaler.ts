// Client-side image upscaling using Canvas API with bicubic interpolation
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

          // Use bicubic interpolation for high-quality upscaling
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"

          // Draw the upscaled image using bicubic interpolation
          ctx.drawImage(img, 0, 0, newWidth, newHeight)

          // Apply bicubic sharpening filter for better quality
          const imageData = ctx.getImageData(0, 0, newWidth, newHeight)
          const sharpened = this.applyBicubicSharpening(imageData)
          ctx.putImageData(sharpened, 0, 0)

          // Convert to data URL
          const upscaledDataUrl = canvas.toDataURL("image/png", 1.0)
          resolve(upscaledDataUrl)
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        reject(new Error("Failed to load image"))
      }

      img.src = imageDataUrl
    })
  }

  private static applyBicubicSharpening(imageData: ImageData): ImageData {
    const data = imageData.data
    const width = imageData.width
    const height = imageData.height
    const output = new ImageData(width, height)

    // Bicubic sharpening kernel
    const kernel = [0, -0.5, 0, -0.5, 3, -0.5, 0, -0.5, 0]

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          // RGB channels only
          let sum = 0
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4 + c
              sum += data[idx] * kernel[(ky + 1) * 3 + (kx + 1)]
            }
          }
          const outputIdx = (y * width + x) * 4 + c
          output.data[outputIdx] = Math.max(0, Math.min(255, sum))
        }
        // Copy alpha channel
        const alphaIdx = (y * width + x) * 4 + 3
        output.data[alphaIdx] = data[alphaIdx]
      }
    }

    return output
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

          // Apply bicubic enhancement filters
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const enhanced = this.applyBicubicEnhancement(imageData)
          ctx.putImageData(enhanced, 0, 0)

          const enhancedDataUrl = canvas.toDataURL("image/png", 1.0)
          resolve(enhancedDataUrl)
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        reject(new Error("Failed to load image"))
      }

      img.src = imageDataUrl
    })
  }

  private static applyBicubicEnhancement(imageData: ImageData): ImageData {
    const data = imageData.data
    const enhanced = new ImageData(imageData.width, imageData.height)

    for (let i = 0; i < data.length; i += 4) {
      // Bicubic contrast and saturation enhancement
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]

      // Apply bicubic contrast enhancement
      const contrast = 1.3
      const brightness = 10

      const enhancedR = Math.max(0, Math.min(255, (r - 128) * contrast + 128 + brightness))
      const enhancedG = Math.max(0, Math.min(255, (g - 128) * contrast + 128 + brightness))
      const enhancedB = Math.max(0, Math.min(255, (b - 128) * contrast + 128 + brightness))

      enhanced.data[i] = enhancedR
      enhanced.data[i + 1] = enhancedG
      enhanced.data[i + 2] = enhancedB
      enhanced.data[i + 3] = a
    }

    return enhanced
  }
}
