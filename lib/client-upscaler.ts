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
  static async upscaleImage(imageDataUrl: string, scaleFactor = 2): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")
          if (!ctx) return reject(new Error("Could not get canvas context"))

          const newWidth = img.width * scaleFactor
          const newHeight = img.height * scaleFactor
          canvas.width = newWidth
          canvas.height = newHeight

          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"
          ctx.drawImage(img, 0, 0, newWidth, newHeight)

          // Optional: sharpening filter
          const sharpened = this.applySharpeningFilter(ctx.getImageData(0, 0, newWidth, newHeight))
          ctx.putImageData(sharpened, 0, 0)

          resolve(canvas.toDataURL("image/png", 1))
        } catch (err) {
          reject(err)
        }
      }

      img.onerror = () => reject(new Error("Failed to load source image"))
      img.src = imageDataUrl
    })
  }

  /**
   * Lightweight colour / contrast enhancement.
   */
  static async enhanceImage(imageDataUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")
          if (!ctx) return reject(new Error("Could not get canvas context"))

          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)

          const enhanced = this.applyEnhancementFilters(ctx.getImageData(0, 0, canvas.width, canvas.height))
          ctx.putImageData(enhanced, 0, 0)

          resolve(canvas.toDataURL("image/png", 1))
        } catch (err) {
          reject(err)
        }
      }

      img.onerror = () => reject(new Error("Failed to load source image"))
      img.src = imageDataUrl
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
export async function upscaleImageClient(imageDataUrl: string, scaleFactor = 2): Promise<string> {
  return ClientUpscaler.upscaleImage(imageDataUrl, scaleFactor)
}

/** Enhance an image (wrapper around ClientUpscaler.enhanceImage). */
export async function enhanceImageClient(imageDataUrl: string): Promise<string> {
  return ClientUpscaler.enhanceImage(imageDataUrl)
}
