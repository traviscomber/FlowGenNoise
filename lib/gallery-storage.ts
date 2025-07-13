import type { FlowArtSettings } from "./flow-model"

export type GalleryImage = {
  id: string
  imageUrl: string // Base64 or cloud URL
  metadata: FlowArtSettings & {
    dataset: string
    scenario: string
    colorScheme: string
    seed: number
    samples: number
    noise: number
    generationMode: "svg" | "ai"
    createdAt: number // Unix timestamp
    filename: string
    fileSize: number // in bytes
    aestheticScore?: number // 0-1 score
    cloudStored?: boolean // True if stored in cloud storage
    cloudUrl?: string // URL if stored in cloud
    cloudId?: string // ID if stored in cloud
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

const LOCAL_STORAGE_KEY = "flowsketch_gallery"

export class GalleryStorage {
  static getGallery(): GalleryImage[] {
    if (typeof window === "undefined") return []
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Failed to load gallery from local storage:", error)
      return []
    }
  }

  static saveGallery(gallery: GalleryImage[]): void {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(gallery))
      window.dispatchEvent(new CustomEvent("gallery-updated")) // Notify listeners
    } catch (error) {
      console.error("Failed to save gallery to local storage:", error)
    }
  }

  static saveImage(image: GalleryImage): void {
    const gallery = GalleryStorage.getGallery()
    const existingIndex = gallery.findIndex((img) => img.id === image.id)
    if (existingIndex > -1) {
      gallery[existingIndex] = image // Update existing
    } else {
      gallery.unshift(image) // Add new to the beginning
    }
    GalleryStorage.saveGallery(gallery)
  }

  static deleteImage(id: string): void {
    const gallery = GalleryStorage.getGallery()
    const updatedGallery = gallery.filter((img) => img.id !== id)
    GalleryStorage.saveGallery(updatedGallery)
  }

  static updateImageMetadata(id: string, updates: Partial<GalleryImage["metadata"]>): void {
    const gallery = GalleryStorage.getGallery()
    const imageIndex = gallery.findIndex((img) => img.id === id)
    if (imageIndex > -1) {
      gallery[imageIndex].metadata = { ...gallery[imageIndex].metadata, ...updates }
      GalleryStorage.saveGallery(gallery)
    }
  }

  static updateImageFavoriteStatus(id: string, isFavorite: boolean): void {
    const gallery = GalleryStorage.getGallery()
    const imageIndex = gallery.findIndex((img) => img.id === id)
    if (imageIndex > -1) {
      gallery[imageIndex].isFavorite = isFavorite
      GalleryStorage.saveGallery(gallery)
    }
  }

  static formatFileSize(bytes: number, decimals = 2): string {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  }

  static getStorageStats(gallery: GalleryImage[]): GalleryStats {
    let totalLocalSize = 0
    let favoriteImages = 0
    let totalScore = 0
    let scoredImagesCount = 0
    let localImagesCount = 0
    let cloudImagesCount = 0

    gallery.forEach((img) => {
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

    const totalCloudSize = gallery
      .filter((img) => img.metadata.cloudStored && typeof img.metadata.fileSize === "number")
      .reduce((sum, img) => sum + (img.metadata.fileSize || 0), 0)

    return {
      totalImages: gallery.length,
      localImages: localImagesCount,
      cloudImages: cloudImagesCount,
      totalLocalSize: totalLocalSize,
      totalCloudSize: totalCloudSize,
      favoriteImages: favoriteImages,
      averageScore: scoredImagesCount > 0 ? totalScore / scoredImagesCount : null,
    }
  }
}
