export class ImageCompression {
  static async compressImage(imageUrl: string, quality = 0.8, maxWidth = 1024, maxHeight = 1024): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject(new Error("Could not get canvas context"))
          return
        }

        // Calculate new dimensions
        let { width, height } = img

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)

        resolve(canvas.toDataURL("image/jpeg", quality))
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = imageUrl
    })
  }

  static getImageSize(imageUrl: string): Promise<{ width: number; height: number; size: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        // Estimate file size from data URL
        const sizeInBytes = Math.round((imageUrl.length * 3) / 4)

        resolve({
          width: img.width,
          height: img.height,
          size: sizeInBytes,
        })
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = imageUrl
    })
  }
}
