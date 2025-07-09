import { supabase } from "./supabase"
import type { GalleryImage } from "./gallery-storage"

export interface CloudSyncStatus {
  isEnabled: boolean
  isAuthenticated: boolean
  isSyncing: boolean
  lastSync: number | null
  pendingUploads: number
  storageUsed: number
  storageQuota: number
  conflictCount: number
}

export interface SyncConflict {
  localImage: GalleryImage
  cloudImage: GalleryImage
  type: "local_newer" | "cloud_newer" | "different_content"
}

export class CloudSyncService {
  private static syncStatus: CloudSyncStatus = {
    isEnabled: false,
    isAuthenticated: false,
    isSyncing: false,
    lastSync: null,
    pendingUploads: 0,
    storageUsed: 0,
    storageQuota: 100 * 1024 * 1024, // 100MB default
    conflictCount: 0,
  }

  private static listeners: Array<(status: CloudSyncStatus) => void> = []

  static addStatusListener(listener: (status: CloudSyncStatus) => void) {
    this.listeners.push(listener)
    listener(this.syncStatus)
  }

  static removeStatusListener(listener: (status: CloudSyncStatus) => void) {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  private static notifyListeners() {
    this.listeners.forEach((listener) => listener(this.syncStatus))
  }

  static async signInWithEmail(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      await this.initializeUser()
      this.syncStatus.isAuthenticated = true
      this.notifyListeners()

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async signUpWithEmail(
    email: string,
    password: string,
    displayName?: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        await this.createUserProfile(data.user.id, email, displayName)
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async signOut(): Promise<void> {
    await supabase.auth.signOut()
    this.syncStatus.isAuthenticated = false
    this.syncStatus.isEnabled = false
    this.notifyListeners()
  }

  static async initializeAuth(): Promise<void> {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session?.user) {
      this.syncStatus.isAuthenticated = true
      await this.initializeUser()
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        this.syncStatus.isAuthenticated = true
        await this.initializeUser()
      } else if (event === "SIGNED_OUT") {
        this.syncStatus.isAuthenticated = false
        this.syncStatus.isEnabled = false
      }
      this.notifyListeners()
    })
  }

  private static async createUserProfile(userId: string, email: string, displayName?: string): Promise<void> {
    const { error } = await supabase.from("user_profiles").insert({
      id: userId,
      email,
      display_name: displayName || null,
      sync_enabled: true,
      storage_quota: 100 * 1024 * 1024, // 100MB
      storage_used: 0,
    })

    if (error) {
      console.error("Failed to create user profile:", error)
    }
  }

  private static async initializeUser(): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    // Get or create user profile
    const { data: profile, error } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()

    if (error && error.code === "PGRST116") {
      // Profile doesn't exist, create it
      await this.createUserProfile(user.id, user.email!, user.user_metadata?.display_name)
    } else if (profile) {
      this.syncStatus.isEnabled = profile.sync_enabled
      this.syncStatus.storageUsed = profile.storage_used
      this.syncStatus.storageQuota = profile.storage_quota
    }

    this.notifyListeners()
  }

  static async enableSync(): Promise<{ success: boolean; error?: string }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: "Not authenticated" }
      }

      const { error } = await supabase.from("user_profiles").update({ sync_enabled: true }).eq("id", user.id)

      if (error) {
        return { success: false, error: error.message }
      }

      this.syncStatus.isEnabled = true
      this.notifyListeners()

      // Perform initial sync
      await this.performFullSync()

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async disableSync(): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from("user_profiles").update({ sync_enabled: false }).eq("id", user.id)

    this.syncStatus.isEnabled = false
    this.notifyListeners()
  }

  static async uploadImage(image: GalleryImage): Promise<{ success: boolean; error?: string }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: "Not authenticated" }
      }

      // Upload image file to Supabase Storage
      const imageBlob = await fetch(image.imageUrl).then((r) => r.blob())
      const fileName = `${user.id}/${image.id}.${image.metadata.generationMode === "svg" ? "svg" : "png"}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("gallery-images")
        .upload(fileName, imageBlob, {
          contentType: image.metadata.generationMode === "svg" ? "image/svg+xml" : "image/png",
          upsert: true,
        })

      if (uploadError) {
        return { success: false, error: uploadError.message }
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("gallery-images").getPublicUrl(fileName)

      // Save to database
      const { error: dbError } = await supabase.from("gallery_images").upsert({
        id: image.id,
        user_id: user.id,
        image_url: publicUrl,
        metadata: image.metadata,
        is_favorite: image.isFavorite,
        tags: image.tags,
      })

      if (dbError) {
        return { success: false, error: dbError.message }
      }

      // Update storage usage
      await this.updateStorageUsage()

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async uploadImageWithProgress(
    image: GalleryImage,
    onProgress?: (progress: number) => void,
  ): Promise<{ success: boolean; error?: string; cloudUrl?: string }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: "Not authenticated" }
      }

      onProgress?.(10)

      // Compress image for upload
      const { ImageCompressor } = await import("./image-compression")
      const compressionResult = await ImageCompressor.compressForUpload(image.imageUrl)

      onProgress?.(30)

      // Upload main image
      const mainFileName = `${user.id}/${image.id}.jpg`
      const { data: mainUpload, error: mainError } = await supabase.storage
        .from("gallery-images")
        .upload(mainFileName, compressionResult.compressedImage, {
          contentType: "image/jpeg",
          upsert: true,
        })

      if (mainError) {
        return { success: false, error: mainError.message }
      }

      onProgress?.(60)

      // Upload thumbnail
      const thumbFileName = `${user.id}/thumbs/${image.id}.jpg`
      const { data: thumbUpload, error: thumbError } = await supabase.storage
        .from("gallery-images")
        .upload(thumbFileName, compressionResult.thumbnail, {
          contentType: "image/jpeg",
          upsert: true,
        })

      onProgress?.(80)

      // Get public URLs
      const {
        data: { publicUrl: mainUrl },
      } = supabase.storage.from("gallery-images").getPublicUrl(mainFileName)

      const {
        data: { publicUrl: thumbUrl },
      } = supabase.storage.from("gallery-images").getPublicUrl(thumbFileName)

      // Save to database with compression info
      const enhancedMetadata = {
        ...image.metadata,
        compression: {
          originalSize: compressionResult.originalSize,
          compressedSize: compressionResult.compressedSize,
          compressionRatio: compressionResult.compressionRatio,
          uploadedAt: Date.now(),
        },
      }

      const { error: dbError } = await supabase.from("gallery_images").upsert({
        id: image.id,
        user_id: user.id,
        image_url: mainUrl,
        thumbnail_url: thumbUrl,
        metadata: enhancedMetadata,
        is_favorite: image.isFavorite,
        tags: image.tags,
      })

      if (dbError) {
        return { success: false, error: dbError.message }
      }

      onProgress?.(100)

      // Update storage usage
      await this.updateStorageUsage()

      return { success: true, cloudUrl: mainUrl }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async autoUploadNewGeneration(
    image: GalleryImage,
    onProgress?: (progress: number) => void,
  ): Promise<{ success: boolean; error?: string; cloudImage?: GalleryImage }> {
    // Check if user is authenticated and sync is enabled
    if (!this.syncStatus.isAuthenticated || !this.syncStatus.isEnabled) {
      // Save locally only
      return { success: true }
    }

    try {
      const result = await this.uploadImageWithProgress(image, onProgress)

      if (result.success && result.cloudUrl) {
        // Update the image with cloud URL
        const cloudImage: GalleryImage = {
          ...image,
          imageUrl: result.cloudUrl,
          metadata: {
            ...image.metadata,
            cloudStored: true,
            uploadedAt: Date.now(),
          },
        }

        return { success: true, cloudImage }
      }

      return result
    } catch (error: any) {
      console.error("Auto-upload failed:", error)
      return { success: false, error: error.message }
    }
  }

  static async getOptimizedImageUrl(image: GalleryImage, preferThumbnail = false): Promise<string> {
    // If cloud stored and we want thumbnail, try to get it
    if (image.thumbnail && preferThumbnail) {
      return image.thumbnail
    }

    // Return the main image URL
    return image.imageUrl
  }

  static async downloadImages(): Promise<GalleryImage[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Failed to download images:", error)
        return []
      }

      return data.map((row) => ({
        id: row.id,
        imageUrl: row.image_url,
        thumbnail: row.thumbnail_url,
        metadata: row.metadata,
        isFavorite: row.is_favorite,
        tags: row.tags,
      }))
    } catch (error) {
      console.error("Failed to download images:", error)
      return []
    }
  }

  static async deleteCloudImage(imageId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: "Not authenticated" }
      }

      // Delete from storage
      const fileName = `${user.id}/${imageId}.png` // Try PNG first
      await supabase.storage.from("gallery-images").remove([fileName])

      const svgFileName = `${user.id}/${imageId}.svg` // Try SVG
      await supabase.storage.from("gallery-images").remove([svgFileName])

      // Delete from database
      const { error } = await supabase.from("gallery_images").delete().eq("id", imageId).eq("user_id", user.id)

      if (error) {
        return { success: false, error: error.message }
      }

      await this.updateStorageUsage()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async performFullSync(): Promise<{ success: boolean; conflicts: SyncConflict[]; error?: string }> {
    if (!this.syncStatus.isAuthenticated || !this.syncStatus.isEnabled) {
      return { success: false, conflicts: [], error: "Sync not enabled or not authenticated" }
    }

    this.syncStatus.isSyncing = true
    this.notifyListeners()

    try {
      // Get local images
      const localImages = JSON.parse(localStorage.getItem("flowsketch-gallery") || "[]") as GalleryImage[]

      // Get cloud images
      const cloudImages = await this.downloadImages()

      const conflicts: SyncConflict[] = []
      const toUpload: GalleryImage[] = []
      const toDownload: GalleryImage[] = []

      // Create maps for easier lookup
      const localMap = new Map(localImages.map((img) => [img.id, img]))
      const cloudMap = new Map(cloudImages.map((img) => [img.id, img]))

      // Find images to upload (local only)
      for (const localImage of localImages) {
        const cloudImage = cloudMap.get(localImage.id)
        if (!cloudImage) {
          toUpload.push(localImage)
        } else {
          // Check for conflicts
          if (localImage.metadata.createdAt !== cloudImage.metadata.createdAt) {
            conflicts.push({
              localImage,
              cloudImage,
              type: localImage.metadata.createdAt > cloudImage.metadata.createdAt ? "local_newer" : "cloud_newer",
            })
          }
        }
      }

      // Find images to download (cloud only)
      for (const cloudImage of cloudImages) {
        if (!localMap.has(cloudImage.id)) {
          toDownload.push(cloudImage)
        }
      }

      // Upload local images
      for (const image of toUpload) {
        await this.uploadImage(image)
      }

      // Download cloud images
      if (toDownload.length > 0) {
        const updatedLocal = [...localImages, ...toDownload]
        localStorage.setItem("flowsketch-gallery", JSON.stringify(updatedLocal))
      }

      this.syncStatus.lastSync = Date.now()
      this.syncStatus.conflictCount = conflicts.length

      return { success: true, conflicts }
    } catch (error: any) {
      return { success: false, conflicts: [], error: error.message }
    } finally {
      this.syncStatus.isSyncing = false
      this.notifyListeners()
    }
  }

  private static async updateStorageUsage(): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase.from("gallery_images").select("image_url").eq("user_id", user.id)

      if (error) return

      // Estimate storage usage (this is approximate)
      const estimatedUsage = data.length * 500 * 1024 // Assume ~500KB per image

      await supabase.from("user_profiles").update({ storage_used: estimatedUsage }).eq("id", user.id)

      this.syncStatus.storageUsed = estimatedUsage
      this.notifyListeners()
    } catch (error) {
      console.error("Failed to update storage usage:", error)
    }
  }

  static getStatus(): CloudSyncStatus {
    return { ...this.syncStatus }
  }

  static async resolveConflict(conflict: SyncConflict, resolution: "keep_local" | "keep_cloud"): Promise<void> {
    if (resolution === "keep_local") {
      await this.uploadImage(conflict.localImage)
    } else {
      // Update local storage with cloud version
      const localImages = JSON.parse(localStorage.getItem("flowsketch-gallery") || "[]") as GalleryImage[]
      const updatedImages = localImages.map((img) => (img.id === conflict.cloudImage.id ? conflict.cloudImage : img))
      localStorage.setItem("flowsketch-gallery", JSON.stringify(updatedImages))
    }
  }
}
