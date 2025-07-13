export interface GalleryImage {
  id: string
  imageUrl: string
  metadata: {
    dataset: string
    scenario: string
    colorScheme: string
    seed: number
    samples: number
    noise: number
    generationMode: "svg" | "ai"
    createdAt: number
    filename: string
    fileSize?: number // Size in bytes
    aestheticScore?: number // 0-1 score
    cloudStored?: boolean // Indicates if the image is synced to cloud
  }
  isFavorite: boolean
  tags: string[]
}

export interface GalleryStats {
  totalImages: number
  localImages: number
  cloudImages: number
  totalLocalSize: number
  totalCloudSize: number // Estimated from local metadata
  favoriteImages: number
  averageScore: number | null
}

const GALLERY_STORAGE_KEY = "flowsketch_gallery_images"

export const GalleryStorage = {
  getGallery: (): GalleryImage[] => {
    if (typeof window === "undefined") return []
    try {
      const stored = localStorage.getItem(GALLERY_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Failed to parse gallery from localStorage:", error)
      return []
    }
  },

  saveGallery: (images: GalleryImage[]) => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(images))
    } catch (error) {
      console.error("Failed to save gallery to localStorage:", error)
    }
  },

  saveImage: (image: GalleryImage) => {
    const images = GalleryStorage.getGallery()
    const existingIndex = images.findIndex((img) => img.id === image.id)
    if (existingIndex > -1) {
      images[existingIndex] = image
    } else {
      images.unshift(image) // Add new images to the beginning
    }
    GalleryStorage.saveGallery(images)
  },

  deleteImage: (id: string) => {
    const images = GalleryStorage.getGallery().filter((img) => img.id !== id)
    GalleryStorage.saveGallery(images)
  },

  clearGallery: () => {
    if (typeof window === "undefined") return
    localStorage.removeItem(GALLERY_STORAGE_KEY)
  },

  toggleFavorite: (id: string): GalleryImage | undefined => {
    const images = GalleryStorage.getGallery()
    const imageIndex = images.findIndex((img) => img.id === id)
    if (imageIndex > -1) {
      images[imageIndex].isFavorite = !images[imageIndex].isFavorite
      GalleryStorage.saveGallery(images)
      return images[imageIndex]
    }
    return undefined
  },

  updateImageMetadata: (id: string, newMetadata: Partial<GalleryImage["metadata"]>): GalleryImage | undefined => {
    const images = GalleryStorage.getGallery()
    const imageIndex = images.findIndex((img) => img.id === id)
    if (imageIndex > -1) {
      images[imageIndex].metadata = {
        ...images[imageIndex].metadata,
        ...newMetadata,
      }
      GalleryStorage.saveGallery(images)
      return images[imageIndex]
    }
    return undefined
  },

  getStorageStats: (images: GalleryImage[]): GalleryStats => {
    let totalLocalSize = 0
    let favoriteImages = 0
    let totalScore = 0
    let scoredImagesCount = 0
    let localImagesCount = 0
    let cloudImagesCount = 0

    images.forEach((img) => {
      if (img.metadata && typeof img.metadata.fileSize === "number") {
        // Only count local size for images that are not cloud-stored, or if they are the primary local copy
        // This logic might need refinement based on exact sync strategy
        if (!img.metadata.cloudStored) {
          totalLocalSize += img.metadata.fileSize
          localImagesCount++
        } else {
          // If it's cloud stored, it's still "local" in the sense it's cached, but we track cloud count
          cloudImagesCount++
        }
      } else if (!img.metadata.cloudStored) {
        // If no fileSize, but it's a local-only image, estimate a small size
        totalLocalSize += 1024 * 50 // 50KB estimate for images without size
        localImagesCount++
      } else {
        cloudImagesCount++
      }

      if (img.isFavorite) {
        favoriteImages++
      }
      if (typeof img.metadata.aestheticScore === "number") {
        totalScore += img.metadata.aestheticScore
        scoredImagesCount++
      }
    })

    const totalCloudSize = images
      .filter((img) => img.metadata.cloudStored && typeof img.metadata.fileSize === "number")
      .reduce((sum, img) => sum + (img.metadata.fileSize || 0), 0)

    return {
      totalImages: images.length,
      localImages: localImagesCount,
      cloudImages: cloudImagesCount,
      totalLocalSize: totalLocalSize,
      totalCloudSize: totalCloudSize,
      favoriteImages: favoriteImages,
      averageScore: scoredImagesCount > 0 ? totalScore / scoredImagesCount : null,
    }
  },

  formatFileSize: (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  },
}
