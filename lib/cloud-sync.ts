"use client"
import { createClient } from "@supabase/supabase-js"
import type { GalleryImage } from "./gallery-storage"
import { GalleryStorage } from "@/lib/gallery-storage"
import type { useToast } from "@/components/ui/use-toast"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase: ReturnType<typeof createClient> | null = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  console.warn("Supabase environment variables are not set. Cloud sync will be disabled.")
}

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
  private static instance: CloudSyncService
  private listeners: Set<() => void> = new Set()
  private status: {
    isSyncing: boolean
    progress: number
    message: string
  } = {
    isSyncing: false,
    progress: 0,
    message: "",
  }

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  public static getInstance(): CloudSyncService {
    if (!CloudSyncService.instance) {
      CloudSyncService.instance = new CloudSyncService()
    }
    return CloudSyncService.instance
  }

  private setStatus(newStatus: Partial<CloudSyncService["status"]>) {
    this.status = { ...this.status, ...newStatus }
    this.notifyListeners()
  }

  public getStatus() {
    return this.status
  }

  public addStatusListener(listener: () => void) {
    this.listeners.add(listener)
  }

  public removeStatusListener(listener: () => void) {
    this.listeners.delete(listener)
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener())
  }

  static async signInWithEmail(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
      return { success: false, error: "Supabase client not initialized." }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      await this.getInstance().initializeUser()
      this.getInstance().setStatus({ isAuthenticated: true })

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
    if (!supabase) {
      return { success: false, error: "Supabase client not initialized." }
    }

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
        await this.getInstance().createUserProfile(data.user.id, email, displayName)
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async signOut(): Promise<void> {
    if (!supabase) return

    await supabase.auth.signOut()
    this.getInstance().setStatus({ isAuthenticated: false, isEnabled: false })
  }

  static async initializeAuth(): Promise<void> {
    if (!supabase) return

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session?.user) {
      this.getInstance().setStatus({ isAuthenticated: true })
      await this.getInstance().initializeUser()
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        this.getInstance().setStatus({ isAuthenticated: true })
        await this.getInstance().initializeUser()
      } else if (event === "SIGNED_OUT") {
        this.getInstance().setStatus({ isAuthenticated: false, isEnabled: false })
      }
    })
  }

  private async createUserProfile(userId: string, email: string, displayName?: string): Promise<void> {
    if (!supabase) return

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

  private async initializeUser(): Promise<void> {
    if (!supabase) return

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
      this.getInstance().setStatus({
        isEnabled: profile.sync_enabled,
        storageUsed: profile.storage_used,
        storageQuota: profile.storage_quota,
      })
    }
  }

  static async enableSync(): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
      return { success: false, error: "Supabase client not initialized." }
    }

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

      this.getInstance().setStatus({ isEnabled: true })

      // Perform initial sync
      await this.getInstance().performFullSync()

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async disableSync(): Promise<void> {
    if (!supabase) return

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from("user_profiles").update({ sync_enabled: false }).eq("id", user.id)

    this.getInstance().setStatus({ isEnabled: false })
  }

  static async uploadImageFullResolution(
    image: GalleryImage,
    onProgress?: (progress: number) => void,
  ): Promise<{ success: boolean; error?: string; cloudUrl?: string; thumbnailUrl?: string }> {
    if (!supabase) {
      console.error("Supabase client not initialized. Cannot upload image.")
      return { success: false, error: "Supabase client not initialized." }
    }

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
      await this.getInstance().updateStorageUsage()

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
    if (!this.getInstance().getStatus().isAuthenticated || !this.getInstance().getStatus().isEnabled) {
      // Save locally only
      return { success: true }
    }

    try {
      const result = await this.getInstance().uploadImageFullResolution(image, onProgress)

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
    if (!supabase) {
      console.error("Supabase client not initialized. Cannot download images.")
      return []
    }

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
    if (!supabase) {
      return { success: false, error: "Supabase client not initialized." }
    }

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

      await this.getInstance().updateStorageUsage()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  public async performFullSync(): Promise<{ success: boolean; conflicts: SyncConflict[]; error?: string }> {
    if (!this.getStatus().isAuthenticated || !this.getStatus().isEnabled) {
      return { success: false, conflicts: [], error: "Sync not enabled or not authenticated" }
    }

    this.setStatus({ isSyncing: true })

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

      this.setStatus({ lastSync: Date.now(), conflictCount: conflicts.length })

      return { success: true, conflicts }
    } catch (error: any) {
      return { success: false, conflicts: [], error: error.message }
    } finally {
      this.setStatus({ isSyncing: false })
    }
  }

  private async updateStorageUsage(): Promise<void> {
    if (!supabase) return

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

      this.getInstance().setStatus({ storageUsed: totalSize })
    } catch (error) {
      console.error("Failed to update storage usage:", error)
    }
  }

  public async uploadAllImages(toast: ReturnType<typeof useToast>["toast"]) {
    if (!supabase) {
      toast({ title: "Error", description: "Supabase client not initialized." })
      return
    }

    this.setStatus({ isSyncing: true, progress: 0, message: "Starting upload..." })
    const imagesToUpload = GalleryStorage.getGallery().filter((img) => !img.metadata.cloudStored)
    let uploadedCount = 0
    let failedCount = 0

    if (imagesToUpload.length === 0) {
      toast({ title: "No new images to upload.", description: "All local images are already synced to cloud." })
      this.setStatus({ isSyncing: false, progress: 100, message: "Upload complete." })
      return
    }

    for (const image of imagesToUpload) {
      this.setStatus({
        message: `Uploading ${uploadedCount + 1} of ${imagesToUpload.length}: ${image.metadata.filename}...`,
      })
      const publicUrl = await GalleryStorage.uploadImageToCloud(image)
      if (publicUrl) {
        GalleryStorage.updateImageMetadata(image.id, { cloudStored: true, imageUrl: publicUrl })
        uploadedCount++
      } else {
        failedCount++
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${image.metadata.filename}.`,
          variant: "destructive",
        })
      }
      this.setStatus({ progress: Math.round(((uploadedCount + failedCount) / imagesToUpload.length) * 100) })
    }

    this.setStatus({ isSyncing: false, message: "" })
    toast({
      title: "Upload Complete",
      description: `Successfully uploaded ${uploadedCount} images. Failed: ${failedCount}.`,
    })
  }

  public async downloadAllImages(toast: ReturnType<typeof useToast>["toast"]) {
    if (!supabase) {
      toast({ title: "Error", description: "Supabase client not initialized." })
      return
    }

    this.setStatus({ isSyncing: true, progress: 0, message: "Starting download..." })
    // This is a simplified example. In a real app, you'd fetch a list of cloud images
    // and compare with local, then download missing ones.
    const cloudImages = GalleryStorage.getGallery().filter((img) => img.metadata.cloudStored) // Assuming cloudStored means it exists in cloud
    let downloadedCount = 0
    let failedCount = 0

    if (cloudImages.length === 0) {
      toast({ title: "No cloud images to download.", description: "Your cloud gallery is empty or not synced." })
      this.setStatus({ isSyncing: false, progress: 100, message: "Download complete." })
      return
    }

    for (const image of cloudImages) {
      this.setStatus({
        message: `Downloading ${downloadedCount + 1} of ${cloudImages.length}: ${image.metadata.filename}...`,
      })
      const pathInStorage = image.imageUrl.split("flowsketch-gallery/")[1] // Extract path from public URL
      if (pathInStorage) {
        const localUrl = await GalleryStorage.downloadImageFromCloud(pathInStorage)
        if (localUrl) {
          GalleryStorage.updateImageMetadata(image.id, { imageUrl: localUrl })
          downloadedCount++
        } else {
          failedCount++
          toast({
            title: "Download Failed",
            description: `Failed to download ${image.metadata.filename}.`,
            variant: "destructive",
          })
        }
      } else {
        failedCount++ // Image URL was not a valid cloud URL
      }
      this.setStatus({ progress: Math.round(((downloadedCount + failedCount) / cloudImages.length) * 100) })
    }

    this.setStatus({ isSyncing: false, message: "" })
    toast({
      title: "Download Complete",
      description: `Successfully downloaded ${downloadedCount} images. Failed: ${failedCount}.`,
    })
  }

  public async batchScoreImages(toast: ReturnType<typeof useToast>["toast"]) {
    if (!supabase) {
      toast({ title: "Error", description: "Supabase client not initialized." })
      return
    }

    this.setStatus({ isSyncing: true, progress: 0, message: "Starting batch scoring..." })
    const result = await GalleryStorage.batchScoreImages((progress) => {
      this.setStatus({ progress, message: `Scoring images: ${Math.round(progress)}% complete...` })
    })
    this.setStatus({ isSyncing: false, message: "" })
    toast({
      title: "Batch Scoring Complete",
      description: `Scored ${result.scored} images, failed ${result.failed}.`,
    })
  }
}

/* ------------------------------------------------------------------ */
/* Convenience helpers used by the Gallery component                  */
/* ------------------------------------------------------------------ */

/**
 * Upload an image (full-resolution) to Supabase Storage.
 * Returns true on success, false on failure.
 */
export async function uploadImageToCloud(
  image: GalleryImage,
  onProgress?: (progress: number) => void,
): Promise<boolean> {
  const result = await CloudSyncService.uploadImageFullResolution(image, onProgress)
  return result.success
}

/**
 * Get the public URL of an already-uploaded image.
 * Returns null if the user isn’t authenticated or the image isn’t found.
 */
export async function getCloudImageUrl(imageId: string): Promise<string | null> {
  if (!supabase) return null

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from("gallery_images")
    .select("image_url")
    .eq("id", imageId)
    .eq("user_id", user.id)
    .single()

  if (error || !data?.image_url) return null
  return data.image_url as string
}

/**
 * Delete an image (and its thumbnail) from Supabase Storage **and**
 * remove the corresponding DB row.
 * Returns `{ success: boolean; error?: string }`.
 */
export async function deleteImageFromCloud(imageId: string): Promise<{ success: boolean; error?: string }> {
  return CloudSyncService.deleteCloudImage(imageId)
}

/**
 * List all images stored in the cloud for the current user.
 * Returns an array of GalleryImage objects.
 */
export async function listCloudImages(): Promise<GalleryImage[]> {
  return CloudSyncService.downloadImages()
}

/* Re-export CloudSyncService for direct use if needed */
