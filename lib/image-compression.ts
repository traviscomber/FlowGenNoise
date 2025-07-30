export async function compressImage(imageUrl: string, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!

      // Calculate new dimensions (compress to max 1024px on longest side)
      const maxSize = 1024
      let { width, height } = img

      if (width > height && width > maxSize) {
        height = (height * maxSize) / width
        width = maxSize
      } else if (height > maxSize) {
        width = (width * maxSize) / height
        height = maxSize
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height)

      try {
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality)
        resolve(compressedDataUrl)
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => reject(new Error("Failed to load image for compression"))
    img.src = imageUrl
  })
}
