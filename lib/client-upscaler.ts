export function upscaleImageBicubic(
  imageElement: HTMLImageElement,
  scaleFactor = 4,
  onProgress?: (progress: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        reject(new Error("Could not get canvas context"))
        return
      }

      const originalWidth = imageElement.naturalWidth
      const originalHeight = imageElement.naturalHeight
      const newWidth = originalWidth * scaleFactor
      const newHeight = originalHeight * scaleFactor

      canvas.width = newWidth
      canvas.height = newHeight

      // Enable image smoothing for bicubic-like interpolation
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"

      onProgress?.(25)

      // Draw the upscaled image
      ctx.drawImage(imageElement, 0, 0, newWidth, newHeight)

      onProgress?.(50)

      // Apply post-processing for better quality
      const imageData = ctx.getImageData(0, 0, newWidth, newHeight)
      const data = imageData.data

      onProgress?.(75)

      // Apply subtle sharpening and contrast enhancement
      for (let i = 0; i < data.length; i += 4) {
        // Increase contrast slightly
        data[i] = Math.min(255, data[i] * 1.1) // Red
        data[i + 1] = Math.min(255, data[i + 1] * 1.1) // Green
        data[i + 2] = Math.min(255, data[i + 2] * 1.1) // Blue
      }

      ctx.putImageData(imageData, 0, 0)

      onProgress?.(100)

      // Convert to base64
      const upscaledDataUrl = canvas.toDataURL("image/png", 1.0)
      resolve(upscaledDataUrl)
    } catch (error) {
      reject(error)
    }
  })
}

export function createImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = dataUrl
  })
}
