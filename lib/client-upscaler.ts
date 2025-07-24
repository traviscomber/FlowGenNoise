// This file was previously truncated. Here's its full content.
"use client"

// This is a simplified client-side upscaler for demonstration purposes.
// In a real application, you might use a more sophisticated library or a server-side solution.

export const ClientUpscaler = {
  /**
   * Upscales an image data URL by a given factor using a simple canvas-based approach.
   * This method performs pixel-based upscaling, which can result in a blurry image
   * if the original image is low resolution. For true detail enhancement,
   * a more advanced algorithm (e.g., AI-based super-resolution) would be needed.
   *
   * @param imageDataUrl The data URL of the image to upscale (e.g., 'data:image/png;base64,...').
   * @param scaleFactor The factor by which to upscale the image (e.g., 2 for 2x, 4 for 4x).
   * @returns A Promise that resolves with the data URL of the upscaled image.
   */
  upscaleImage: async (imageDataUrl: string, scaleFactor: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous" // Required for CORS if image is from external source

      img.onload = () => {
        const originalWidth = img.width
        const originalHeight = img.height

        const upscaledWidth = originalWidth * scaleFactor
        const upscaledHeight = originalHeight * scaleFactor

        const canvas = document.createElement("canvas")
        canvas.width = upscaledWidth
        canvas.height = upscaledHeight
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          return reject(new Error("Could not get 2D context from canvas."))
        }

        // Disable image smoothing for pixelated upscaling, or enable for smoother
        ctx.imageSmoothingEnabled = false // For sharp pixel scaling
        // ctx.imageSmoothingEnabled = true; // For smoother scaling (might blur)

        // Draw the original image onto the new, larger canvas
        ctx.drawImage(img, 0, 0, upscaledWidth, upscaledHeight)

        // Get the upscaled image as a data URL
        const upscaledDataUrl = canvas.toDataURL("image/png")
        resolve(upscaledDataUrl)
      }

      img.onerror = (error) => {
        console.error("Error loading image for upscaling:", error)
        reject(new Error("Failed to load image for upscaling."))
      }

      img.src = imageDataUrl
    })
  },
}
