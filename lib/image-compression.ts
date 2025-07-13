// lib/image-compression.ts
export async function compressImage(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous" // Required for CORS if image is from different origin
    img.src = imageUrl

    img.onload = () => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        return reject(new Error("Could not get canvas context"))
      }

      // Set a max dimension to reduce size, e.g., 800px on the longest side
      const MAX_DIMENSION = 800
      let width = img.width
      let height = img.height

      if (width > height) {
        if (width > MAX_DIMENSION) {
          height *= MAX_DIMENSION / width
          width = MAX_DIMENSION
        }
      } else {
        if (height > MAX_DIMENSION) {
          width *= MAX_DIMENSION / height
          height = MAX_DIMENSION
        }
      }

      canvas.width = width
      canvas.height = height

      ctx.drawImage(img, 0, 0, width, height)

      // Convert to JPEG with reduced quality
      canvas.toDataURL("image/jpeg", 0.7, (blob: Blob | null) => {
        if (blob) {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        } else {
          reject(new Error("Failed to compress image"))
        }
      })
    }

    img.onerror = (error) => {
      reject(new Error(`Failed to load image for compression: ${error}`))
    }
  })
}
