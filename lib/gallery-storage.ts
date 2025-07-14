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
}

export interface GalleryImage {
  id: string
  imageUrl: string
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

const STORAGE_KEY = "flowsketch_gallery_v1"
const PRESETS_KEY = "flowsketch_presets_v1"

export class GalleryStorage {
  static getAllImages(): GalleryImage[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return []

      const parsed = JSON.parse(stored)

      // Handle both array and object formats for backward compatibility
      if (Array.isArray(parsed)) {
        return parsed
      } else if (typeof parsed === "object" && parsed !== null) {
        // Convert object format to array
        return Object.values(parsed) as GalleryImage[]
      }

      return []
    } catch (error) {
      console.error("Error loading gallery images:", error)
      return []
    }
  }

  static saveImage(image: GalleryImage): void {
    try {
      const images = this.getAllImages()
      const existingIndex = images.findIndex((img) => img.id === image.id)

      if (existingIndex >= 0) {
        images[existingIndex] = image
      } else {
        images.push(image)
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(images))
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
      }
    } catch (error) {
      console.error("Error updating image metadata:", error)
      throw new Error("Failed to update image metadata")
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
}

export async function saveToGallery(params: SaveToGalleryParams): Promise<void> {
  try {
    const { svg, params: artParams, colors, timestamp } = params

    // Convert SVG to data URL for storage
    let imageUrl = svg
    if (svg.startsWith("<svg")) {
      // It's an SVG string, keep as is for now
      imageUrl = svg
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
  } catch (error) {
    console.error("Error in saveToGallery:", error)
    throw new Error("Failed to save artwork to gallery")
  }
}
