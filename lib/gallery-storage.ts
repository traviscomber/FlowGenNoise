import { v4 as uuidv4 } from "uuid"

export interface GalleryImageMetadata {
  dataset?: string
  colorScheme?: string
  samples?: number
  noise?: number
  seed?: number
  generationMode?: "svg" | "ai"
  scenario?: string
  scenarioThreshold?: number
  createdAt: number
  filename: string
  fileSize: number
  cloudStored: boolean
  aiPrompt?: string
  aiDescription?: string
  aiNegativePrompt?: string
  uploadedAt?: number
  originalSize?: number
}

export interface GalleryImage {
  id: string
  imageUrl: string
  thumbnail?: string
  metadata: GalleryImageMetadata
  isFavorite: boolean
  tags: string[]
}

export interface SaveToGalleryParams {
  svg: string
  params: any
  colors: any
  timestamp: number
}

const STORAGE_KEY = "flowsketch-gallery"
const PRESETS_KEY = "flowsketch-presets"

export class GalleryStorage {
  static getAllImages(): GalleryImage[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return []

      const parsed = JSON.parse(stored)

      // Handle both array and object formats for backward compatibility
      if (Array.isArray(parsed)) {
        return parsed.map((img) => this.sanitizeImage(img))
      } else if (typeof parsed === "object" && parsed !== null) {
        // Convert object format to array
        return Object.values(parsed).map((img) => this.sanitizeImage(img as any))
      }

      return []
    } catch (error) {
      console.error("Error loading gallery images:", error)
      return []
    }
  }

  private static sanitizeImage(image: any): GalleryImage {
    return {
      id: image.id || uuidv4(),
      imageUrl: image.imageUrl || image.svg || "",
      thumbnail: image.thumbnail,
      metadata: {
        dataset: image.metadata?.dataset || image.dataset || "unknown",
        colorScheme: image.metadata?.colorScheme || image.colorScheme || "viridis",
        samples: image.metadata?.samples || image.samples || 1000,
        noise: image.metadata?.noise || image.noise || 0.1,
        seed: image.metadata?.seed || image.seed || 12345,
        generationMode: image.metadata?.generationMode || image.generationMode || "svg",
        scenario: image.metadata?.scenario || image.scenario || "none",
        scenarioThreshold: image.metadata?.scenarioThreshold || image.scenarioThreshold || 50,
        createdAt: image.metadata?.createdAt || image.createdAt || image.timestamp || Date.now(),
        filename: image.metadata?.filename || image.filename || `flowsketch-${Date.now()}.svg`,
        fileSize: image.metadata?.fileSize || image.fileSize || 0,
        cloudStored: image.metadata?.cloudStored || false,
        aiPrompt: image.metadata?.aiPrompt || image.aiPrompt,
        aiDescription: image.metadata?.aiDescription || image.aiDescription,
        aiNegativePrompt: image.metadata?.aiNegativePrompt || image.aiNegativePrompt,
        uploadedAt: image.metadata?.uploadedAt,
        originalSize: image.metadata?.originalSize,
      },
      isFavorite: image.isFavorite || false,
      tags: image.tags || [],
    }
  }

  static saveImage(image: GalleryImage): void {
    try {
      const images = this.getAllImages()
      const existingIndex = images.findIndex((img) => img.id === image.id)

      if (existingIndex >= 0) {
        images[existingIndex] = image
      } else {
        images.unshift(image) // Add to beginning for newest first
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(images))
      console.log("Image saved to gallery:", image.id)
    } catch (error) {
      console.error("Error saving image:", error)
      throw new Error("Failed to save image to gallery")
    }
  }

  static getImage(id: string): GalleryImage | null {
    try {
      const images = this.getAllImages()
      return images.find((img) => img.id === id) || null
    } catch (error) {
      console.error("Error getting image:", error)
      return null
    }
  }

  static deleteImage(id: string): void {
    try {
      const images = this.getAllImages()
      const filteredImages = images.filter((img) => img.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredImages))
      console.log("Image deleted from gallery:", id)
    } catch (error) {
      console.error("Error deleting image:", error)
      throw new Error("Failed to delete image")
    }
  }

  static toggleFavorite(id: string): void {
    try {
      const images = this.getAllImages()
      const image = images.find((img) => img.id === id)

      if (image) {
        image.isFavorite = !image.isFavorite
        localStorage.setItem(STORAGE_KEY, JSON.stringify(images))
        console.log("Favorite toggled for image:", id, image.isFavorite)
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      throw new Error("Failed to update favorite status")
    }
  }

  static updateImageMetadata(id: string, metadata: Partial<GalleryImageMetadata>): void {
    try {
      const images = this.getAllImages()
      const image = images.find((img) => img.id === id)

      if (image) {
        image.metadata = { ...image.metadata, ...metadata }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(images))
        console.log("Image metadata updated:", id)
      }
    } catch (error) {
      console.error("Error updating image metadata:", error)
      throw new Error("Failed to update image metadata")
    }
  }

  static getGallery(): GalleryImage[] {
    return this.getAllImages()
  }

  static clearGallery(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
      console.log("Gallery cleared")
    } catch (error) {
      console.error("Error clearing gallery:", error)
      throw new Error("Failed to clear gallery")
    }
  }

  static getPresets(): Record<string, any> {
    try {
      const stored = localStorage.getItem(PRESETS_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error("Error loading presets:", error)
      return {}
    }
  }

  static savePreset(name: string, preset: any): void {
    try {
      const presets = this.getPresets()
      presets[name] = preset
      localStorage.setItem(PRESETS_KEY, JSON.stringify(presets))
    } catch (error) {
      console.error("Error saving preset:", error)
      throw new Error("Failed to save preset")
    }
  }

  static deletePreset(name: string): void {
    try {
      const presets = this.getPresets()
      delete presets[name]
      localStorage.setItem(PRESETS_KEY, JSON.stringify(presets))
    } catch (error) {
      console.error("Error deleting preset:", error)
      throw new Error("Failed to delete preset")
    }
  }

  // Cloud sync helper methods
  static async uploadImageToCloud(image: GalleryImage): Promise<string | null> {
    // This would integrate with cloud storage
    console.log("Upload to cloud not implemented yet")
    return null
  }

  static async downloadImageFromCloud(path: string): Promise<string | null> {
    // This would integrate with cloud storage
    console.log("Download from cloud not implemented yet")
    return null
  }

  static async batchScoreImages(onProgress?: (progress: number) => void): Promise<{ scored: number; failed: number }> {
    // This would integrate with AI scoring
    console.log("Batch scoring not implemented yet")
    return { scored: 0, failed: 0 }
  }
}

export async function saveToGallery(params: SaveToGalleryParams): Promise<GalleryImage> {
  try {
    const { svg, params: artParams, colors, timestamp } = params

    // Convert SVG to data URL for better storage and display
    let imageUrl = svg
    if (svg.startsWith("<svg")) {
      // Create a data URL from the SVG
      const svgBlob = new Blob([svg], { type: "image/svg+xml" })
      imageUrl = URL.createObjectURL(svgBlob)

      // For persistent storage, we'll keep the SVG string
      // but create a data URL for display
      const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
      imageUrl = svgDataUrl
    }

    const newImage: GalleryImage = {
      id: uuidv4(),
      imageUrl,
      metadata: {
        dataset: artParams.dataset || "unknown",
        colorScheme: artParams.colorScheme || "viridis",
        samples: artParams.samples || 1000,
        noise: artParams.noise || 0.1,
        seed: artParams.seed || 12345,
        generationMode: artParams.generationMode || "svg",
        scenario: artParams.scenario || "none",
        scenarioThreshold: artParams.scenarioThreshold || 50,
        createdAt: timestamp,
        filename: `flowsketch-${artParams.dataset || "art"}-${Date.now()}.svg`,
        fileSize: svg.length,
        cloudStored: false,
        aiPrompt: artParams.aiPrompt,
        aiDescription: artParams.aiDescription,
        aiNegativePrompt: artParams.aiNegativePrompt,
      },
      isFavorite: false,
      tags: [],
    }

    GalleryStorage.saveImage(newImage)
    console.log("Artwork saved to gallery:", newImage.id)
    return newImage
  } catch (error) {
    console.error("Error in saveToGallery:", error)
    throw new Error("Failed to save artwork to gallery")
  }
}

// Migration helper for old data formats
export function migrateGalleryData(): void {
  try {
    const oldKeys = ["flowsketch_gallery_v1", "flowsketch-gallery-v1", "flowsketch_gallery", "gallery-images"]

    let migratedData: GalleryImage[] = []

    for (const key of oldKeys) {
      const stored = localStorage.getItem(key)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed)) {
            migratedData = [...migratedData, ...parsed.map((img) => GalleryStorage["sanitizeImage"](img))]
          } else if (typeof parsed === "object") {
            migratedData = [
              ...migratedData,
              ...Object.values(parsed).map((img) => GalleryStorage["sanitizeImage"](img as any)),
            ]
          }
          // Remove old key after migration
          localStorage.removeItem(key)
        } catch (e) {
          console.warn(`Failed to migrate data from ${key}:`, e)
        }
      }
    }

    if (migratedData.length > 0) {
      // Remove duplicates based on ID
      const uniqueImages = migratedData.filter((img, index, self) => index === self.findIndex((i) => i.id === img.id))

      localStorage.setItem(STORAGE_KEY, JSON.stringify(uniqueImages))
      console.log(`Migrated ${uniqueImages.length} images to new format`)
    }
  } catch (error) {
    console.error("Error during gallery migration:", error)
  }
}
