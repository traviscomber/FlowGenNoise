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
    storageQuota: 500 * 1024 * 1024, // 500MB default for high-res images
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
      storage_quota: 500 * 1024 * 1024, // 500MB for high-res images
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

  static async uploadImageFullResolution(
    image: GalleryImage,
    onProgress?: (progress: number) => void,
  ): Promise<{ success: boolean; error?: string; cloudUrl?: string; thumbnailUrl?: string }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: "Not authenticated" }
      }

      onProgress?.(10)

      // Get the original image blob
      const imageBlob = await fetch(image.imageUrl).then((r) => r.blob())
      const fileSize = imageBlob.size

      onProgress?.(30)

      // Upload full resolution image
      const fileExtension = image.metadata.generationMode === "svg" ? "svg" : "png"
      const mainFileName = `${user.id}/${image.id}.${fileExtension}`

      const { data: mainUpload, error: mainError } = await supabase.storage
        .from("gallery-images")
        .upload(mainFileName, imageBlob, {
          contentType: image.metadata.generationMode === "svg" ? "image/svg+xml" : "image/png",
          upsert: true,
        })

      if (mainError) {
        return { success: false, error: mainError.message }
      }

      onProgress?.(70)

      // Create thumbnail for gallery view only (not for storage optimization)
      let thumbnailUrl: string | undefined
      if (image.metadata.generationMode !== "svg") {
        try {
          const thumbnailBlob = await this.createThumbnail(image.imageUrl)
          const thumbFileName = `${user.id}/thumbs/${image.id}.jpg`

          const { data: thumbUpload, error: thumbError } = await supabase.storage
            .from("gallery-images")
            .upload(thumbFileName, thumbnailBlob, {
              contentType: "image/jpeg",
              upsert: true,
            })

          if (!thumbError) {
            const {
              data: { publicUrl: thumbUrl },
            } = supabase.storage.from("gallery-images").getPublicUrl(thumbFileName)
            thumbnailUrl = thumbUrl
          }
        } catch (thumbError) {
          console.warn("Failed to create thumbnail:", thumbError)
          // Continue without thumbnail - not critical
        }
      }

      onProgress?.(90)

      // Get public URL for main image
      const {
        data: { publicUrl: mainUrl },
      } = supabase.storage.from("gallery-images").getPublicUrl(mainFileName)

      // Save to database with full metadata
      const enhancedMetadata = {
        ...image.metadata,
        cloudStored: true,
        uploadedAt: Date.now(),
        originalSize: fileSize,
        fileSize: fileSize,
      }

      const { error: dbError } = await supabase.from("gallery_images").upsert({
        id: image.id,
        user_id: user.id,
        image_url: mainUrl,
        thumbnail_url: thumbnailUrl,
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

      return { success: true, cloudUrl: mainUrl, thumbnailUrl }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  private static async createThumbnail(imageUrl: string, size = 400): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")!

        // Calculate thumbnail dimensions maintaining aspect ratio
        const { width, height } = img
        const aspectRatio = width / height

        let thumbWidth = size
        let thumbHeight = size

        if (aspectRatio > 1) {
          thumbHeight = size / aspectRatio
        } else {
          thumbWidth = size * aspectRatio
        }

        canvas.width = thumbWidth
        canvas.height = thumbHeight

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"
        ctx.drawImage(img, 0, 0, thumbWidth, thumbHeight)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error("Failed to create thumbnail"))
            }
          },
          "image/jpeg",
          0.8,
        )
      }

      img.onerror = () => reject(new Error("Failed to load image for thumbnail"))
      img.src = imageUrl
    })
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
      const result = await this.uploadImageFullResolution(image, onProgress)

      if (result.success && result.cloudUrl) {
        // Update the image with cloud URL and thumbnail
        const cloudImage: GalleryImage = {
          ...image,
          imageUrl: result.cloudUrl,
          thumbnail: result.thumbnailUrl,
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

      // Delete main image from storage
      const mainFileName = `${user.id}/${imageId}.png`
      await supabase.storage.from("gallery-images").remove([mainFileName])

      const svgFileName = `${user.id}/${imageId}.svg`
      await supabase.storage.from("gallery-images").remove([svgFileName])

      // Delete thumbnail
      const thumbFileName = `${user.id}/thumbs/${imageId}.jpg`
      await supabase.storage.from("gallery-images").remove([thumbFileName])

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

      // Upload local images at full resolution
      for (const image of toUpload) {
        await this.uploadImageFullResolution(image)
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

      // Get actual storage usage from Supabase
      const { data: files, error } = await supabase.storage.from("gallery-images").list(user.id, {
        limit: 1000,
      })

      if (error) return

      const totalSize = files.reduce((sum, file) => sum + (file.metadata?.size || 0), 0)

      await supabase.from("user_profiles").update({ storage_used: totalSize }).eq("id", user.id)

      this.syncStatus.storageUsed = totalSize
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
      await this.uploadImageFullResolution(conflict.localImage)
    } else {
      // Update local storage with cloud version
      const localImages = JSON.parse(localStorage.getItem("flowsketch-gallery") || "[]") as GalleryImage[]
      const updatedImages = localImages.map((img) => (img.id === conflict.cloudImage.id ? conflict.cloudImage : img))
      localStorage.setItem("flowsketch-gallery", JSON.stringify(updatedImages))
    }
  }
}
