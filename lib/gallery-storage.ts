export interface GalleryImage {
  id: string
  imageUrl: string
  thumbnail?: string
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
    cloudStored?: boolean
    uploadedAt?: number
    originalSize?: number
    fileSize?: number
  }
  isFavorite: boolean
  tags: string[]
}

export interface StorageInfo {
  used: number
  available: number
  imageCount: number
}

export interface StorageStats {
  localImages: number
  cloudImages: number
  totalSize: number
  averageSize: number
  largestImage: number
}

export class GalleryStorage {
  private static readonly STORAGE_KEY = "flowsketch-gallery"
  private static readonly MAX_LOCAL_STORAGE = 50 * 1024 * 1024 // 50MB for local storage

  static saveImage(image: GalleryImage): void {
    const gallery = this.getGallery()
    const existingIndex = gallery.findIndex((img) => img.id === image.id)

    if (existingIndex >= 0) {
      gallery[existingIndex] = image
    } else {
      gallery.unshift(image) // Add to beginning for newest first
    }

    this.saveGallery(gallery)
  }

  static async saveImageWithCloudUpload(
    image: GalleryImage,
    onProgress?: (progress: number) => void,
  ): Promise<{ success: boolean; error?: string; cloudImage?: GalleryImage }> {
    // Save locally first
    this.saveImage(image)

    // Try cloud upload
    const { CloudSyncService } = await import("./cloud-sync")
    const result = await CloudSyncService.autoUploadNewGeneration(image, onProgress)

    if (result.success && result.cloudImage) {
      // Update local storage with cloud version
      this.saveImage(result.cloudImage)
      return { success: true, cloudImage: result.cloudImage }
    }

    return result
  }

  static getGallery(): GalleryImage[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Failed to load gallery:", error)
      return []
    }
  }

  static deleteImage(id: string): void {
    const gallery = this.getGallery().filter((img) => img.id !== id)
    this.saveGallery(gallery)
  }

  static toggleFavorite(id: string): void {
    const gallery = this.getGallery()
    const image = gallery.find((img) => img.id === id)
    if (image) {
      image.isFavorite = !image.isFavorite
      this.saveGallery(gallery)
    }
  }

  static clearGallery(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  static exportGallery(): string {
    return JSON.stringify(this.getGallery(), null, 2)
  }

  static importGallery(data: string): boolean {
    try {
      const imported = JSON.parse(data) as GalleryImage[]
      if (Array.isArray(imported)) {
        this.saveGallery(imported)
        return true
      }
      return false
    } catch (error) {
      console.error("Failed to import gallery:", error)
      return false
    }
  }

  static getStorageInfo(): StorageInfo {
    const gallery = this.getGallery()
    const serialized = JSON.stringify(gallery)
    const used = new Blob([serialized]).size

    return {
      used,
      available: this.MAX_LOCAL_STORAGE,
      imageCount: gallery.length,
    }
  }

  static getStorageStats(): StorageStats {
    const gallery = this.getGallery()
    const localImages = gallery.filter((img) => !img.metadata.cloudStored).length
    const cloudImages = gallery.filter((img) => img.metadata.cloudStored).length

    const imageSizes = gallery
      .map((img) => img.metadata.fileSize || this.estimateImageSize(img))
      .filter((size) => size > 0)

    const totalSize = imageSizes.reduce((sum, size) => sum + size, 0)
    const averageSize = imageSizes.length > 0 ? totalSize / imageSizes.length : 0
    const largestImage = imageSizes.length > 0 ? Math.max(...imageSizes) : 0

    return {
      localImages,
      cloudImages,
      totalSize,
      averageSize,
      largestImage,
    }
  }

  private static estimateImageSize(image: GalleryImage): number {
    // Estimate based on generation mode and parameters
    if (image.metadata.generationMode === "svg") {
      return 50 * 1024 // ~50KB for SVG
    } else {
      // AI generated images are typically larger
      const baseSize = 2 * 1024 * 1024 // 2MB base
      const sampleMultiplier = image.metadata.samples / 1000 // More samples = larger
      return Math.floor(baseSize * (1 + sampleMultiplier))
    }
  }

  private static saveGallery(gallery: GalleryImage[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(gallery))
    } catch (error) {
      console.error("Failed to save gallery:", error)
      // If storage is full, try to clean up old images
      this.cleanupOldImages(gallery)
    }
  }

  private static cleanupOldImages(gallery: GalleryImage[]): void {
    // Keep only the 50 most recent images if storage is full
    const sorted = gallery.sort((a, b) => b.metadata.createdAt - a.metadata.createdAt)
    const cleaned = sorted.slice(0, 50)

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cleaned))
    } catch (error) {
      console.error("Failed to cleanup gallery:", error)
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
