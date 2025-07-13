import { supabase } from "./supabase"
import { GalleryStorage, type GalleryImage } from "./gallery-storage"
import { compressImage } from "./image-compression"

export type CloudSyncStatus = {
  isEnabled: boolean
  isAuthenticated: boolean
  isSyncing: boolean
  lastSync: number | null
  storageUsed: number
  storageQuota: number
  error: string | null
}

export type SyncConflict = {
  type: "local_newer" | "cloud_newer" | "both_modified"
  localImage: GalleryImage
  cloudImage: GalleryImage
}

const CLOUD_SYNC_ENABLED_KEY = "flowsketch_cloud_sync_enabled"
const BUCKET_NAME = "flowsketch-gallery-images"

export class CloudSyncService {
  private static instance: CloudSyncService
  private status: CloudSyncStatus
  private statusListeners: ((status: CloudSyncStatus) => void)[] = []
  private galleryListeners: (() => void)[] = [] // For internal use to trigger gallery re-render

  private constructor() {
    this.status = {
      isEnabled: this.getSyncEnabledState(),
      isAuthenticated: false,
      isSyncing: false,
      lastSync: null,
      storageUsed: 0,
      storageQuota: 0,
      error: null,
    }
    this.initializeAuth()
    this.setupGalleryListener()
  }

  public static getInstance(): CloudSyncService {
    if (!CloudSyncService.instance) {
      CloudSyncService.instance = new CloudSyncService()
    }
    return CloudSyncService.instance
  }

  private getSyncEnabledState(): boolean {
    if (typeof window === "undefined") return false
    return localStorage.getItem(CLOUD_SYNC_ENABLED_KEY) === "true"
  }

  private setSyncEnabledState(enabled: boolean): void {
    if (typeof window === "undefined") return
    localStorage.setItem(CLOUD_SYNC_ENABLED_KEY, String(enabled))
    this.updateStatus({ isEnabled: enabled })
  }

  public async initializeAuth(): Promise<void> {
    const { data, error } = await supabase.auth.getUser()
    if (data?.user) {
      this.updateStatus({ isAuthenticated: true })
      await this.fetchStorageQuota()
    } else {
      this.updateStatus({ isAuthenticated: false, storageUsed: 0, storageQuota: 0, error: error?.message || null })
      this.setSyncEnabledState(false) // Disable sync if not authenticated
    }
  }

  private setupGalleryListener(): void {
    if (typeof window === "undefined") return
    window.addEventListener("gallery-updated", () => {
      if (this.status.isEnabled && this.status.isAuthenticated && !this.status.isSyncing) {
        // Debounce this to avoid excessive syncs
        clearTimeout(this.syncDebounceTimer)
        this.syncDebounceTimer = setTimeout(() => this.performFullSync(), 1000)
      }
    })
  }

  private syncDebounceTimer: NodeJS.Timeout | null = null

  public getStatus(): CloudSyncStatus {
    return { ...this.status }
  }

  public addStatusListener(listener: (status: CloudSyncStatus) => void): void {
    this.statusListeners.push(listener)
  }

  public removeStatusListener(listener: (status: CloudSyncStatus) => void): void {
    this.statusListeners = this.statusListeners.filter((l) => l !== listener)
  }

  private updateStatus(updates: Partial<CloudSyncStatus>): void {
    this.status = { ...this.status, ...updates }
    this.statusListeners.forEach((listener) => listener(this.status))
  }

  private async fetchStorageQuota(): Promise<void> {
    const { data, error } = await supabase.rpc("get_user_storage_info")
    if (error) {
      console.error("Error fetching storage info:", error)
      this.updateStatus({ error: "Failed to fetch storage info" })
      return
    }
    if (data && data.length > 0) {
      const { total_size, quota_size } = data[0]
      this.updateStatus({
        storageUsed: total_size || 0,
        storageQuota: quota_size || 0,
        error: null,
      })
    }
  }

  public async signInWithEmail(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    this.updateStatus({ authLoading: true, error: null })
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      this.updateStatus({ isAuthenticated: false, authLoading: false, error: error.message })
      return { success: false, error: error.message }
    }
    this.updateStatus({ isAuthenticated: true, authLoading: false, error: null })
    this.setSyncEnabledState(true) // Enable sync on successful sign-in
    await this.fetchStorageQuota()
    await this.performFullSync() // Perform initial sync after sign-in
    return { success: true }
  }

  public async signUpWithEmail(
    email: string,
    password: string,
    displayName?: string,
  ): Promise<{ success: boolean; error?: string }> {
    this.updateStatus({ authLoading: true, error: null })
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    })
    if (error) {
      this.updateStatus({ isAuthenticated: false, authLoading: false, error: error.message })
      return { success: false, error: error.message }
    }
    // Supabase requires email confirmation by default. User won't be authenticated immediately.
    this.updateStatus({
      isAuthenticated: false,
      authLoading: false,
      error: "Please check your email to confirm your account.",
    })
    return { success: true, error: "Please check your email to confirm your account." }
  }

  public async signOut(): Promise<void> {
    this.updateStatus({ isSyncing: true, error: null })
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Error signing out:", error)
      this.updateStatus({ error: error.message })
    } else {
      this.updateStatus({
        isAuthenticated: false,
        isEnabled: false,
        storageUsed: 0,
        storageQuota: 0,
        lastSync: null,
        error: null,
      })
      this.setSyncEnabledState(false)
      GalleryStorage.saveGallery(
        GalleryStorage.getGallery().map((img) => ({
          ...img,
          metadata: { ...img.metadata, cloudStored: false, cloudUrl: undefined, cloudId: undefined },
        })),
      )
    }
    this.updateStatus({ isSyncing: false })
  }

  public async enableSync(): Promise<{ success: boolean; error?: string }> {
    if (!this.status.isAuthenticated) {
      return { success: false, error: "User not authenticated." }
    }
    this.setSyncEnabledState(true)
    await this.performFullSync()
    return { success: true }
  }

  public async disableSync(): Promise<void> {
    this.setSyncEnabledState(false)
    this.updateStatus({ isSyncing: false, error: null })
  }

  public async performFullSync(): Promise<{ success: boolean; conflicts: SyncConflict[]; error?: string }> {
    if (!this.status.isEnabled || !this.status.isAuthenticated || this.status.isSyncing) {
      return { success: false, conflicts: [], error: "Sync not enabled, not authenticated, or already syncing." }
    }

    this.updateStatus({ isSyncing: true, error: null })
    const conflicts: SyncConflict[] = []

    try {
      const localGallery = GalleryStorage.getGallery()
      const { data: cloudFiles, error: fetchError } = await supabase.storage.from(BUCKET_NAME).list(
        supabase.auth.getUser().then((u) => u.data.user?.id + "/"),
        {
          limit: 100, // Adjust limit as needed
          offset: 0,
          sortBy: { column: "created_at", order: "desc" },
        },
      )

      if (fetchError) throw fetchError

      const cloudGallery: GalleryImage[] = []
      for (const file of cloudFiles || []) {
        if (file.name === ".emptyFolderPlaceholder") continue // Skip placeholder file
        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(`${supabase.auth.getUser().then((u) => u.data.user?.id + "/")}${file.name}`)
        const metadata = await this.fetchImageMetadata(publicUrlData.publicUrl)
        if (metadata) {
          cloudGallery.push({
            id: metadata.id,
            imageUrl: publicUrlData.publicUrl,
            metadata: {
              ...metadata,
              cloudStored: true,
              cloudUrl: publicUrlData.publicUrl,
              cloudId: file.id,
              fileSize: file.metadata?.size || 0,
              createdAt: Number.parseInt(file.metadata.createdAt),
            },
            isFavorite: metadata.isFavorite || false, // Default to false if not in metadata
            tags: metadata.tags || [], // Default to empty array if not in metadata
          })
        }
      }

      const updatedLocalGallery = [...localGallery]

      // Step 1: Identify new local images to upload
      for (const localImage of localGallery) {
        if (!localImage.metadata.cloudStored || !localImage.metadata.cloudId) {
          const uploadResult = await this.uploadImageFullResolution(localImage)
          if (uploadResult.success && uploadResult.cloudImage) {
            const index = updatedLocalGallery.findIndex((img) => img.id === localImage.id)
            if (index !== -1) updatedLocalGallery[index] = uploadResult.cloudImage
          } else {
            console.warn(`Failed to upload new local image ${localImage.id}: ${uploadResult.error}`)
          }
        }
      }

      // Step 2: Identify new cloud images to download and resolve conflicts
      for (const cloudImage of cloudGallery) {
        const localImage = updatedLocalGallery.find((img) => img.id === cloudImage.id)

        if (!localImage) {
          // New image in cloud, download it
          updatedLocalGallery.unshift(cloudImage) // Add to local gallery
        } else {
          // Image exists both locally and in cloud, check for conflicts
          const localModifiedAt = localImage.metadata.createdAt || 0
          const cloudModifiedAt = cloudImage.metadata.createdAt || 0

          if (localModifiedAt > cloudModifiedAt + 1000) {
            // Local is significantly newer
            conflicts.push({ type: "local_newer", localImage, cloudImage })
          } else if (cloudModifiedAt > localModifiedAt + 1000) {
            // Cloud is significantly newer
            conflicts.push({ type: "cloud_newer", localImage, cloudImage })
          } else if (localModifiedAt !== cloudModifiedAt) {
            // Both modified around same time, or slight difference
            conflicts.push({ type: "both_modified", localImage, cloudImage })
          } else {
            // No significant difference, ensure local metadata matches cloud
            const index = updatedLocalGallery.findIndex((img) => img.id === localImage.id)
            if (index !== -1) updatedLocalGallery[index] = cloudImage // Update local with cloud version (metadata, URL)
          }
        }
      }

      // Step 3: Identify deleted cloud images to remove locally
      for (const localImage of localGallery) {
        if (localImage.metadata.cloudStored && !cloudGallery.some((img) => img.id === localImage.id)) {
          // Image was cloud-stored but no longer in cloud, delete locally
          const index = updatedLocalGallery.findIndex((img) => img.id === localImage.id)
          if (index !== -1) updatedLocalGallery.splice(index, 1)
        }
      }

      GalleryStorage.saveGallery(updatedLocalGallery)
      this.updateStatus({ lastSync: Date.now(), error: null })
      await this.fetchStorageQuota() // Refresh storage usage after sync

      return { success: true, conflicts }
    } catch (error: any) {
      console.error("Full sync failed:", error)
      this.updateStatus({ error: error.message || "Full sync failed" })
      return { success: false, conflicts: [], error: error.message || "Full sync failed" }
    } finally {
      this.updateStatus({ isSyncing: false })
    }
  }

  public async resolveConflict(
    conflict: SyncConflict,
    resolution: "keep_local" | "keep_cloud",
  ): Promise<{ success: boolean; error?: string }> {
    this.updateStatus({ isSyncing: true, error: null })
    try {
      if (resolution === "keep_local") {
        // Upload local version, overwriting cloud
        const uploadResult = await this.uploadImageFullResolution(conflict.localImage, true)
        if (!uploadResult.success) throw new Error(uploadResult.error || "Failed to upload local version.")
        GalleryStorage.saveImage(uploadResult.cloudImage!)
      } else {
        // keep_cloud
        // Delete local, then download cloud version
        GalleryStorage.deleteImage(conflict.localImage.id)
        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(
            `${supabase.auth.getUser().then((u) => u.data.user?.id + "/")}${conflict.cloudImage.metadata.filename}`,
          )
        const metadata = await this.fetchImageMetadata(publicUrlData.publicUrl)
        if (!metadata) throw new Error("Failed to fetch cloud image metadata.")
        GalleryStorage.saveImage({
          ...conflict.cloudImage,
          imageUrl: publicUrlData.publicUrl,
          metadata: {
            ...metadata,
            cloudStored: true,
            cloudUrl: publicUrlData.publicUrl,
            cloudId: conflict.cloudImage.metadata.cloudId,
            fileSize: conflict.cloudImage.metadata.fileSize,
            createdAt: conflict.cloudImage.metadata.createdAt,
          },
        })
      }
      await this.fetchStorageQuota()
      return { success: true }
    } catch (error: any) {
      console.error("Error resolving conflict:", error)
      this.updateStatus({ error: error.message || "Failed to resolve conflict" })
      return { success: false, error: error.message || "Failed to resolve conflict" }
    } finally {
      this.updateStatus({ isSyncing: false })
    }
  }

  public async uploadImageFullResolution(
    image: GalleryImage,
    overwrite = false,
    onProgress?: (progress: number) => void,
  ): Promise<{ success: boolean; cloudImage?: GalleryImage; error?: string }> {
    if (!this.status.isAuthenticated) {
      return { success: false, error: "Not authenticated to upload." }
    }

    try {
      const userId = (await supabase.auth.getUser()).data.user?.id
      if (!userId) throw new Error("User ID not found.")

      const filePath = `${userId}/${image.metadata.filename}`
      let imageBlob: Blob

      if (image.imageUrl.startsWith("data:image/svg+xml;base64,")) {
        const svgString = atob(image.imageUrl.split(",")[1])
        imageBlob = new Blob([svgString], { type: "image/svg+xml" })
      } else if (image.imageUrl.startsWith("data:image/png;base64,")) {
        const base64 = image.imageUrl.split(",")[1]
        const byteCharacters = atob(base64)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        imageBlob = new Blob([byteArray], { type: "image/png" })
      } else if (image.imageUrl.startsWith("http")) {
        // If it's already a public URL, fetch it
        const response = await fetch(image.imageUrl)
        imageBlob = await response.blob()
      } else {
        throw new Error("Unsupported image URL format for upload.")
      }

      onProgress?.(10) // Start upload progress

      const { data, error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(filePath, imageBlob, {
        cacheControl: "3600",
        upsert: overwrite,
        contentType: imageBlob.type,
        // Store metadata directly in Supabase storage object metadata
        // This is a simplified approach; for complex metadata, use a database table
        metadata: {
          id: image.id,
          dataset: image.metadata.dataset,
          scenario: image.metadata.scenario,
          colorScheme: image.metadata.colorScheme,
          seed: image.metadata.seed.toString(),
          samples: image.metadata.samples.toString(),
          noise: image.metadata.noise.toString(),
          generationMode: image.metadata.generationMode,
          upscale: image.metadata.upscale?.toString() || "false",
          createdAt: image.metadata.createdAt.toString(),
          isFavorite: image.isFavorite.toString(),
          tags: JSON.stringify(image.tags),
        },
      })

      if (uploadError) throw uploadError

      onProgress?.(80) // Upload complete

      const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)

      const cloudImage: GalleryImage = {
        ...image,
        imageUrl: publicUrlData.publicUrl,
        metadata: {
          ...image.metadata,
          cloudStored: true,
          cloudUrl: publicUrlData.publicUrl,
          cloudId: data.id, // Supabase returns id on upload
          fileSize: imageBlob.size,
        },
      }
      onProgress?.(100) // Metadata updated

      return { success: true, cloudImage }
    } catch (error: any) {
      console.error("Error uploading image:", error)
      onProgress?.(0)
      return { success: false, error: error.message || "Failed to upload image" }
    }
  }

  public async autoUploadNewGeneration(
    newImage: GalleryImage,
    onProgress?: (progress: number) => void,
  ): Promise<{ success: boolean; cloudImage?: GalleryImage; error?: string }> {
    if (!this.status.isEnabled || !this.status.isAuthenticated) {
      return { success: false, error: "Cloud sync not enabled or authenticated." }
    }

    // For AI images, if upscale is true, we should upload the upscaled version.
    // However, the upscaling happens *after* initial generation.
    // So, this function will upload the initially generated image.
    // The `handleUpscale` function in `flow-art-generator.tsx` will handle re-uploading the upscaled version.

    // Compress image before uploading to save space and bandwidth
    let compressedImageUrl = newImage.imageUrl
    let originalSize = newImage.metadata.fileSize || 0

    try {
      if (newImage.metadata.generationMode === "ai" && !newImage.imageUrl.startsWith("data:image/svg")) {
        // Only compress non-SVG AI images
        compressedImageUrl = await compressImage(newImage.imageUrl)
        // Estimate compressed size (rough estimate, actual size will be known after upload)
        originalSize = newImage.imageUrl.length * 0.75 // Base64 string length approx 4/3 of bytes
        newImage.metadata.fileSize = compressedImageUrl.length * 0.75
      }
    } catch (compressionError) {
      console.warn("Image compression failed, uploading original:", compressionError)
      // Fallback to original if compression fails
    }

    const imageToUpload: GalleryImage = {
      ...newImage,
      imageUrl: compressedImageUrl,
    }

    return this.uploadImageFullResolution(imageToUpload, false, onProgress)
  }

  private async fetchImageMetadata(imageUrl: string): Promise<GalleryImage["metadata"] | null> {
    try {
      // Supabase storage does not directly expose custom metadata via public URL.
      // We need to fetch the list of files and then match by URL or filename.
      // This is a workaround. A better approach for rich metadata is to store it in a database table.

      const userId = (await supabase.auth.getUser()).data.user?.id
      if (!userId) return null

      const { data: files, error } = await supabase.storage.from(BUCKET_NAME).list(`${userId}/`, {
        search: imageUrl.split("/").pop(), // Search by filename
      })

      if (error) throw error

      const file = files?.[0]
      if (file && file.metadata) {
        // Reconstruct metadata from storage object metadata
        return {
          id: file.metadata.id,
          dataset: file.metadata.dataset,
          scenario: file.metadata.scenario,
          colorScheme: file.metadata.colorScheme,
          seed: Number.parseInt(file.metadata.seed),
          samples: Number.parseInt(file.metadata.samples),
          noise: Number.parseFloat(file.metadata.noise),
          generationMode: file.metadata.generationMode,
          upscale: file.metadata.upscale === "true",
          createdAt: Number.parseInt(file.metadata.createdAt),
          filename: file.name,
          fileSize: file.metadata.size || 0,
          cloudStored: true,
          cloudUrl: imageUrl,
          cloudId: file.id,
          isFavorite: file.metadata.isFavorite === "true",
          tags: JSON.parse(file.metadata.tags || "[]"),
        } as GalleryImage["metadata"]
      }
      return null
    } catch (error) {
      console.error("Error fetching image metadata from cloud:", error)
      return null
    }
  }
}

export const CloudSync = CloudSyncService.getInstance()
