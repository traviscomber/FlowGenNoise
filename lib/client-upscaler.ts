// -----------------------------------------------------------------------------
// lib/client-upscaler.ts
//
// A tiny client-side image-processing helper.  Provides:
//
//  • class ClientUpscaler      – static methods for upscaling / enhancing
//  • function upscaleImageClient  – convenience wrapper (alias for class method)
//  • function enhanceImageClient  – convenience wrapper (alias for class method)
//
// Components are free to import whichever style they prefer:
//
//   import { ClientUpscaler } from "@/lib/client-upscaler"
//   import { upscaleImageClient } from "@/lib/client-upscaler"
// -----------------------------------------------------------------------------

/**
 * Core image-processing utilities implemented with the <canvas> API.
 */
export class ClientUpscaler {
  /**
   * Upscale an image using canvas bicubic-like interpolation and an
   * optional sharpening pass.
   */
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
          canvas.width = img.width * scaleFactor
          canvas.height = img.height * scaleFactor

          // Use bicubic-like interpolation by enabling image smoothing
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"

          // Draw scaled image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

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

  /**
   * Lightweight colour / contrast enhancement.
   */
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

          // Get image data for processing
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data

          // Apply enhancement filters
          for (let i = 0; i < data.length; i += 4) {
            // Increase contrast slightly
            data[i] = Math.min(255, data[i] * 1.1) // Red
            data[i + 1] = Math.min(255, data[i + 1] * 1.1) // Green
            data[i + 2] = Math.min(255, data[i + 2] * 1.1) // Blue
            // Alpha stays the same
          }

          // Put enhanced data back
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

  // ---------- private helpers ------------------------------------------------

  private static applySharpeningFilter(imageData: ImageData): ImageData {
    const { data, width, height } = imageData
    const out = new ImageData(width, height)
    const k = [0, -1, 0, -1, 5, -1, 0, -1, 0]

    const idx = (x: number, y: number) => (y * width + x) * 4
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0
          let ki = 0
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              sum += data[idx(x + kx, y + ky) + c] * k[ki++]
            }
          }
          out.data[idx(x, y) + c] = Math.max(0, Math.min(255, sum))
        }
        // copy alpha
        out.data[idx(x, y) + 3] = data[idx(x, y) + 3]
      }
    }
    return out
  }

  private static applyEnhancementFilters(imageData: ImageData): ImageData {
    const out = new ImageData(imageData.width, imageData.height)
    for (let i = 0; i < imageData.data.length; i += 4) {
      const contrast = 1.2
      for (let c = 0; c < 3; c++) {
        const value = imageData.data[i + c]
        out.data[i + c] = Math.max(0, Math.min(255, (value - 128) * contrast + 128))
      }
      out.data[i + 3] = imageData.data[i + 3] // alpha
    }
    return out
  }
}

// -----------------------------------------------------------------------------
// Convenience named helpers – these satisfy legacy imports like:
//
//   import { upscaleImageClient } from "@/lib/client-upscaler"
// -----------------------------------------------------------------------------

/** Upscale an image (wrapper around ClientUpscaler.upscaleImage). */
export async function upscaleImageClient(imageUrl: string, scaleFactor = 4): Promise<string> {
  return ClientUpscaler.upscaleImage(imageUrl, scaleFactor)
}

/** Enhance an image (wrapper around ClientUpscaler.enhanceImage). */
export async function enhanceImageClient(imageUrl: string): Promise<string> {
  return ClientUpscaler.enhanceImage(imageUrl)
}
