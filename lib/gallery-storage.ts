export interface GalleryImage {
  id: string
  imageUrl: string // Base64 or cloud URL
  metadata: {
    dataset: string
    scenario: string
    colorScheme: string
    seed: number
    samples: number
    noise: number
    generationMode: "svg" | "ai"
    upscale?: boolean
    createdAt: number
    filename: string
    fileSize?: number
    cloudStored?: boolean
    cloudUrl?: string
    cloudId?: string
    aestheticScore?: number
  }
  isFavorite: boolean
  tags: string[]
}

export interface GalleryStats {
  totalImages: number
  totalSize: number
  favoriteCount: number
  cloudSyncedCount: number
}

const GALLERY_STORAGE_KEY = "flowsketch_gallery"

export class GalleryStorage {
  static getGallery(): GalleryImage[] {
    if (typeof window === "undefined") return []
    try {
      const stored = localStorage.getItem(GALLERY_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Error loading gallery from localStorage:", error)
      return []
    }
  }

  static saveGallery(images: GalleryImage[]): void {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(images))
      // Dispatch custom event for components to listen to
      window.dispatchEvent(new CustomEvent("gallery-updated"))
    } catch (error) {
      console.error("Error saving gallery to localStorage:", error)
    }
  }

  static saveImage(image: GalleryImage): void {
    const gallery = this.getGallery()
    const existingIndex = gallery.findIndex((img) => img.id === image.id)

    if (existingIndex >= 0) {
      gallery[existingIndex] = image
    } else {
      gallery.unshift(image) // Add to beginning
    }

    this.saveGallery(gallery)
  }

  static deleteImage(imageId: string): void {
    const gallery = this.getGallery()
    const filtered = gallery.filter((img) => img.id !== imageId)
    this.saveGallery(filtered)
  }

  static clearGallery(): void {
    this.saveGallery([])
  }

  static toggleFavorite(imageId: string): GalleryImage | null {
    const gallery = this.getGallery()
    const image = gallery.find((img) => img.id === imageId)

    if (image) {
      image.isFavorite = !image.isFavorite
      this.saveGallery(gallery)
      return image
    }

    return null
  }

  static updateImageMetadata(imageId: string, metadata: Partial<GalleryImage["metadata"]>): GalleryImage | null {
    const gallery = this.getGallery()
    const image = gallery.find((img) => img.id === imageId)

    if (image) {
      image.metadata = { ...image.metadata, ...metadata }
      this.saveGallery(gallery)
      return image
    }

    return null
  }

  static getStorageStats(images: GalleryImage[]): GalleryStats {
    return {
      totalImages: images.length,
      totalSize: images.reduce((sum, img) => sum + (img.metadata.fileSize || 0), 0),
      favoriteCount: images.filter((img) => img.isFavorite).length,
      cloudSyncedCount: images.filter((img) => img.metadata.cloudStored).length,
    }
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }
}
