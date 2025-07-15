export async function compressImage(
  dataUrl: string,
  quality = 0.8,
  maxWidth = 1024,
  maxHeight = 1024,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = dataUrl
    img.crossOrigin = "anonymous" // Set crossOrigin to avoid CORS issues

    img.onload = () => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        return reject(new Error("Could not get 2D context from canvas"))
      }

      let width = img.width
      let height = img.height

      // Calculate new dimensions to fit within maxWidth/maxHeight while maintaining aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height
          height = maxHeight
        }
      }

      canvas.width = width
      canvas.height = height

      ctx.drawImage(img, 0, 0, width, height)

      // Convert canvas to data URL (PNG for lossless, JPEG for lossy compression)
      // Using image/jpeg for compression, image/png for original quality if preferred
      const outputFormat = dataUrl.startsWith("data:image/png") ? "image/png" : "image/jpeg"

      canvas.toDataURL(outputFormat, quality)
        ? resolve(canvas.toDataURL(outputFormat, quality))
        : reject(new Error("Failed to convert canvas to data URL"))
    }

    img.onerror = (error) => {
      reject(new Error(`Failed to load image for compression: ${error}`))
    }
  })
}
