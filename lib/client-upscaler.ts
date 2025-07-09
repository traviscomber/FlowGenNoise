// Direct client-side bicubic upscaling using Canvas API
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

          // Set new dimensions for direct bicubic upscaling
          const newWidth = img.width * scaleFactor
          const newHeight = img.height * scaleFactor

          canvas.width = newWidth
          canvas.height = newHeight

          // Direct bicubic interpolation - highest quality setting
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"

          // Apply direct bicubic upscaling
          ctx.drawImage(img, 0, 0, newWidth, newHeight)

          // Apply direct bicubic sharpening for enhanced quality
          const imageData = ctx.getImageData(0, 0, newWidth, newHeight)
          const sharpened = this.applyDirectBicubicSharpening(imageData)
          ctx.putImageData(sharpened, 0, 0)

          // Convert to high-quality PNG
          const upscaledDataUrl = canvas.toDataURL("image/png", 1.0)
          resolve(upscaledDataUrl)
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        reject(new Error("Failed to load image for bicubic upscaling"))
      }

      img.src = imageDataUrl
    })
  }

  private static applyDirectBicubicSharpening(imageData: ImageData): ImageData {
    const data = imageData.data
    const width = imageData.width
    const height = imageData.height
    const output = new ImageData(width, height)

    // Direct bicubic sharpening kernel - optimized for quality
    const kernel = [0, -0.25, 0, -0.25, 2, -0.25, 0, -0.25, 0]

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          // Apply direct bicubic convolution
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
        // Preserve alpha channel
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

          // Apply direct bicubic enhancement
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const enhanced = this.applyDirectBicubicEnhancement(imageData)
          ctx.putImageData(enhanced, 0, 0)

          const enhancedDataUrl = canvas.toDataURL("image/png", 1.0)
          resolve(enhancedDataUrl)
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        reject(new Error("Failed to load image for enhancement"))
      }

      img.src = imageDataUrl
    })
  }

  private static applyDirectBicubicEnhancement(imageData: ImageData): ImageData {
    const data = imageData.data
    const enhanced = new ImageData(imageData.width, imageData.height)

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]

      // Direct bicubic contrast and brightness enhancement
      const contrast = 1.15
      const brightness = 5

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

  // New method to upload upscaled image to Cloudinary
  static async uploadUpscaledToCloudinary(
    upscaledDataUrl: string,
    originalPublicId: string,
    scaleFactor = 4,
  ): Promise<any> {
    try {
      const response = await fetch("/api/upscale-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageData: upscaledDataUrl,
          originalPublicId,
          scaleFactor,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to upload to Cloudinary")
      }

      return await response.json()
    } catch (error) {
      console.error("Error uploading upscaled image to Cloudinary:", error)
      return null
    }
  }
}
