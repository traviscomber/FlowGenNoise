// Client-side image upscaling using Canvas API and external upscaler library
// This file is intentionally left blank as upscaling is handled server-side via Replicate API.
// The client-side component `FlowArtGenerator.tsx` calls the `/api/upscale-image` route.

class Upscaler {
  constructor(options: { model: any }) {
    // Placeholder for future use if needed
  }
}

let upscaler: Upscaler | null = null

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

          // Use high-quality image smoothing
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"

          // Draw the upscaled image
          ctx.drawImage(img, 0, 0, newWidth, newHeight)

          // Apply sharpening filter for better quality
          const imageData = ctx.getImageData(0, 0, newWidth, newHeight)
          const sharpened = this.applySharpeningFilter(imageData)
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

  private static applySharpeningFilter(imageData: ImageData): ImageData {
    const data = imageData.data
    const width = imageData.width
    const height = imageData.height
    const output = new ImageData(width, height)

    // Sharpening kernel
    const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0]

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

          // Apply enhancement filters
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const enhanced = this.applyEnhancementFilters(imageData)
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

  private static applyEnhancementFilters(imageData: ImageData): ImageData {
    const data = imageData.data
    const enhanced = new ImageData(imageData.width, imageData.height)

    for (let i = 0; i < data.length; i += 4) {
      // Increase contrast and saturation
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]

      // Apply contrast enhancement
      const contrast = 1.2
      const enhancedR = Math.max(0, Math.min(255, (r - 128) * contrast + 128))
      const enhancedG = Math.max(0, Math.min(255, (g - 128) * contrast + 128))
      const enhancedB = Math.max(0, Math.min(255, (b - 128) * contrast + 128))

      enhanced.data[i] = enhancedR
      enhanced.data[i + 1] = enhancedG
      enhanced.data[i + 2] = enhancedB
      enhanced.data[i + 3] = a
    }

    return enhanced
  }
}

export async function getUpscaler() {
  if (!upscaler) {
    upscaler = new Upscaler({
      model: null, // Placeholder for future use if needed
    })
  }
  return upscaler
}

export async function upscaleImage(imageSrc: string, onProgress?: (progress: number) => void): Promise<string> {
  // Placeholder for future use if needed
  return new Promise((resolve, reject) => {
    reject(new Error("Upscaling is handled server-side via Replicate API"))
  })
}
