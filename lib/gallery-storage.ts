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
  }
  isFavorite: boolean
  tags: string[]
}

export class GalleryStorage {
  private static readonly STORAGE_KEY = "flowsketch-gallery"
  private static readonly MAX_IMAGES = 100 // Prevent storage overflow

  static saveImage(image: GalleryImage): void {
    try {
      const gallery = this.getGallery()

      // Remove oldest images if we exceed the limit
      if (gallery.length >= this.MAX_IMAGES) {
        const sortedByDate = gallery.sort((a, b) => a.metadata.createdAt - b.metadata.createdAt)
        const toRemove = sortedByDate.slice(0, gallery.length - this.MAX_IMAGES + 1)
        toRemove.forEach((img) => this.deleteImage(img.id))
      }

      const updatedGallery = [image, ...this.getGallery()]
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedGallery))
    } catch (error) {
      console.error("Failed to save image to gallery:", error)
    }
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
    try {
      const gallery = this.getGallery()
      const filtered = gallery.filter((img) => img.id !== id)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered))
    } catch (error) {
      console.error("Failed to delete image:", error)
    }
  }

  static toggleFavorite(id: string): void {
    try {
      const gallery = this.getGallery()
      const updated = gallery.map((img) => (img.id === id ? { ...img, isFavorite: !img.isFavorite } : img))
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated))
    } catch (error) {
      console.error("Failed to toggle favorite:", error)
    }
  }

  static updateTags(id: string, tags: string[]): void {
    try {
      const gallery = this.getGallery()
      const updated = gallery.map((img) => (img.id === id ? { ...img, tags } : img))
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated))
    } catch (error) {
      console.error("Failed to update tags:", error)
    }
  }

  static clearGallery(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      console.error("Failed to clear gallery:", error)
    }
  }

  static exportGallery(): string {
    return JSON.stringify(this.getGallery(), null, 2)
  }

  static getStorageInfo(): { used: number; available: number; imageCount: number } {
    try {
      const gallery = this.getGallery()
      const used = new Blob([JSON.stringify(gallery)]).size
      const available = 5 * 1024 * 1024 // Approximate 5MB limit

      return {
        used,
        available,
        imageCount: gallery.length,
      }
    } catch (error) {
      return { used: 0, available: 5 * 1024 * 1024, imageCount: 0 }
    }
  }
}
