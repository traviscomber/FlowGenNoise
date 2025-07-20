/**
 * ClientUpscaler provides methods for client-side image upscaling.
 * This is primarily for pixel-based upscaling of AI-generated images,
 * or for converting SVG data URLs to PNG for further processing.
 */
export class ClientUpscaler {
  /**
   * Upscales an image (data URL or external URL) using a canvas-based approach.
   * For SVG data URLs, it first renders to a canvas and then upscales.
   * For other image types, it directly upscales the pixels.
   * @param imageUrl The data URL or external URL of the image to upscale.
   * @param scaleFactor The factor by which to scale the image (e.g., 2 for 2x, 4 for 4x).
   * @returns A Promise that resolves to the upscaled image as a data URL (PNG).
   */
  static async upscaleImage(imageUrl: string, scaleFactor = 2): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous" // Required for loading images from other origins onto canvas

      img.onload = () => {
        const originalWidth = img.width
        const originalHeight = img.height

        const scaledWidth = originalWidth * scaleFactor
        const scaledHeight = originalHeight * scaleFactor

        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          return reject(new Error("Could not get 2D context for canvas."))
        }

        canvas.width = scaledWidth
        canvas.height = scaledHeight

        // Disable image smoothing for sharper pixel scaling
        ctx.imageSmoothingEnabled = false
        ;(ctx as any).mozImageSmoothingEnabled = false // Firefox
        ;(ctx as any).webkitImageSmoothingEnabled = false // Chrome, Safari
        ;(ctx as any).msImageSmoothingEnabled = false // IE/Edge

        // Draw the original image onto the scaled canvas
        ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight)

        // Get the upscaled image as a data URL
        try {
          const upscaledDataUrl = canvas.toDataURL("image/png")
          resolve(upscaledDataUrl)
        } catch (error) {
          reject(new Error(`Failed to convert canvas to data URL: ${error}`))
        }
      }

      img.onerror = (error) => {
        console.error("Image loading error:", error)
        reject(new Error(`Failed to load image for upscaling: ${error.type}`))
      }

      img.src = imageUrl
    })
  }
}
