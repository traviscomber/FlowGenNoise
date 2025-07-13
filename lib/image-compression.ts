export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: "jpeg" | "png" | "webp"
  thumbnailSize?: number
}

export interface CompressionResult {
  compressedImage: Blob
  thumbnail: Blob
  originalSize: number
  compressedSize: number
  compressionRatio: number
}

export class ImageCompressor {
  static async compressImage(imageUrl: string, options: CompressionOptions = {}): Promise<CompressionResult> {
    const { maxWidth = 1920, maxHeight = 1080, quality = 0.8, format = "jpeg", thumbnailSize = 300 } = options

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        try {
          // Calculate dimensions
          let { width, height } = img
          const aspectRatio = width / height

          if (width > maxWidth) {
            width = maxWidth
            height = width / aspectRatio
          }
          if (height > maxHeight) {
            height = maxHeight
            width = height * aspectRatio
          }

          // Create main compressed image
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")!
          canvas.width = width
          canvas.height = height

          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"
          ctx.drawImage(img, 0, 0, width, height)

          // Create thumbnail
          const thumbCanvas = document.createElement("canvas")
          const thumbCtx = thumbCanvas.getContext("2d")!
          const thumbSize = Math.min(thumbnailSize, Math.min(width, height))
          thumbCanvas.width = thumbSize
          thumbCanvas.height = thumbSize

          // Center crop for thumbnail
          const sourceSize = Math.min(width, height)
          const sourceX = (width - sourceSize) / 2
          const sourceY = (height - sourceSize) / 2

          thumbCtx.drawImage(canvas, sourceX, sourceY, sourceSize, sourceSize, 0, 0, thumbSize, thumbSize)

          // Convert to blobs
          canvas.toBlob(
            (compressedBlob) => {
              if (!compressedBlob) {
                reject(new Error("Failed to compress image"))
                return
              }

              thumbCanvas.toBlob(
                (thumbnailBlob) => {
                  if (!thumbnailBlob) {
                    reject(new Error("Failed to create thumbnail"))
                    return
                  }

                  // Calculate original size (estimate)
                  const originalSize = this.estimateImageSize(img.width, img.height)
                  const compressedSize = compressedBlob.size
                  const compressionRatio = originalSize / compressedSize

                  resolve({
                    compressedImage: compressedBlob,
                    thumbnail: thumbnailBlob,
                    originalSize,
                    compressedSize,
                    compressionRatio,
                  })
                },
                `image/${format}`,
                quality,
              )
            },
            `image/${format}`,
            quality,
          )
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = imageUrl
    })
  }

  static async compressForUpload(imageUrl: string): Promise<CompressionResult> {
    // Optimized settings for cloud upload
    return this.compressImage(imageUrl, {
      maxWidth: 2048,
      maxHeight: 2048,
      quality: 0.85,
      format: "jpeg",
      thumbnailSize: 400,
    })
  }

  static async createThumbnail(imageUrl: string, size = 300): Promise<Blob> {
    const result = await this.compressImage(imageUrl, {
      maxWidth: size,
      maxHeight: size,
      quality: 0.7,
      format: "jpeg",
    })
    return result.thumbnail
  }

  private static estimateImageSize(width: number, height: number): number {
    // Rough estimate: 4 bytes per pixel for RGBA
    return width * height * 4
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }
}
