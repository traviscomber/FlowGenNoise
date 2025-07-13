import { supabase } from "./supabase"
import { GalleryStorage, type GalleryImage } from "./gallery-storage"

export interface CloudSyncStatus {
  isEnabled: boolean
  isAuthenticated: boolean
  isSyncing: boolean
  lastSync: number | null
  storageUsed: number
  storageQuota: number
  error: string | null
}

export interface SyncConflict {
  type: "local_newer" | "cloud_newer" | "both_modified"
  localImage: GalleryImage
  cloudImage: GalleryImage
}

type StatusListener = (status: CloudSyncStatus) => void
const statusListeners: StatusListener[] = []

let currentStatus: CloudSyncStatus = {
  isEnabled: false,
  isAuthenticated: false,
  isSyncing: false,
  lastSync: null,
  storageUsed: 0,
  storageQuota: 0,
  error: null,
}

function updateStatus(newPartialStatus: Partial<CloudSyncStatus>) {
  currentStatus = { ...currentStatus, ...newPartialStatus }
  statusListeners.forEach((listener) => listener(currentStatus))
}

async function fetchStorageQuotaAndUsage() {
  const { data, error } = await supabase.storage.from("flowsketch-gallery").getBucket("flowsketch-gallery")

  if (error) {
    console.error("Error fetching storage bucket info:", error)
    updateStatus({ error: "Failed to fetch storage info." })
    return { storageUsed: 0, storageQuota: 0 }
  }

  // Supabase storage usage is not directly exposed via getBucket in client-side SDK.
  // You'd typically need a server-side function or a custom RPC to get detailed usage.
  // For now, we'll use a placeholder quota and assume usage is tracked by file uploads.
  // In a real app, you'd query `storage.objects` table or a custom function.
  const quota = 100 * 1024 * 1024 // Example: 100 MB quota
  let used = 0

  // Estimate usage by summing local cloud-synced image sizes
  const localImages = GalleryStorage.getGallery()
  used = localImages
    .filter((img) => img.metadata.cloudStored && typeof img.metadata.fileSize === "number")
    .reduce((sum, img) => sum + (img.metadata.fileSize || 0), 0)

  updateStatus({ storageUsed: used, storageQuota: quota })
  return { storageUsed: used, storageQuota: quota }
}

export const CloudSyncService = {
  addStatusListener: (listener: StatusListener) => {
    statusListeners.push(listener)
    listener(currentStatus) // Immediately send current status to new listener
  },
  removeStatusListener: (listener: StatusListener) => {
    const index = statusListeners.indexOf(listener)
    if (index > -1) {
      statusListeners.splice(index, 1)
    }
  },
  getStatus: () => currentStatus,

  initializeAuth: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    updateStatus({ isAuthenticated: !!user })

    supabase.auth.onAuthStateChange((event, session) => {
      const isAuthenticated = !!session?.user
      updateStatus({ isAuthenticated })
      if (isAuthenticated && currentStatus.isEnabled) {
        CloudSyncService.performFullSync()
      }
    })

    // Load initial sync preference from local storage
    const isSyncEnabled = localStorage.getItem("cloudSyncEnabled") === "true"
    updateStatus({ isEnabled: isSyncEnabled })
    if (isSyncEnabled && user) {
      CloudSyncService.performFullSync()
    }
  },

  signInWithEmail: async (email: string, password: string) => {
    updateStatus({ isSyncing: true, error: null })
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      updateStatus({ isSyncing: false, error: error.message })
      return { success: false, error: error.message }
    }
    updateStatus({ isAuthenticated: true, isSyncing: false })
    await CloudSyncService.enableSync() // Auto-enable sync on sign-in
    return { success: true }
  },

  signUpWithEmail: async (email: string, password: string, displayName?: string) => {
    updateStatus({ isSyncing: true, error: null })
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    })
    if (error) {
      updateStatus({ isSyncing: false, error: error.message })
      return { success: false, error: error.message }
    }
    updateStatus({ isAuthenticated: true, isSyncing: false })
    await CloudSyncService.enableSync() // Auto-enable sync on sign-up
    return { success: true }
  },

  signOut: async () => {
    updateStatus({ isSyncing: true, error: null })
    const { error } = await supabase.auth.signOut()
    if (error) {
      updateStatus({ isSyncing: false, error: error.message })
      return { success: false, error: error.message }
    }
    localStorage.removeItem("cloudSyncEnabled")
    updateStatus({ isEnabled: false, isAuthenticated: false, isSyncing: false, lastSync: null })
    // Clear cloud-stored flags from local gallery images
    const localImages = GalleryStorage.getGallery()
    localImages.forEach((img) => {
      if (img.metadata.cloudStored) {
        GalleryStorage.updateImageMetadata(img.id, { cloudStored: false })
      }
    })
    return { success: true }
  },

  enableSync: async () => {
    localStorage.setItem("cloudSyncEnabled", "true")
    updateStatus({ isEnabled: true })
    if (currentStatus.isAuthenticated) {
      return CloudSyncService.performFullSync()
    }
    return { success: true }
  },

  disableSync: async () => {
    localStorage.removeItem("cloudSyncEnabled")
    updateStatus({ isEnabled: false })
    return { success: true }
  },

  uploadImageFullResolution: async (image: GalleryImage, onProgress?: (progress: number) => void) => {
    if (!currentStatus.isAuthenticated) {
      return { success: false, error: "Not authenticated for cloud sync." }
    }

    updateStatus({ isSyncing: true, error: null })

    try {
      const response = await fetch(image.imageUrl)
      const blob = await response.blob()

      // Generate a unique path for the image in storage
      const filePath = `${supabase.auth.user()?.id}/${image.id}.${image.metadata.filename.split(".").pop()}`

      const { data, error: uploadError } = await supabase.storage.from("flowsketch-gallery").upload(filePath, blob, {
        cacheControl: "3600",
        upsert: true, // Overwrite if exists
      })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage.from("flowsketch-gallery").getPublicUrl(filePath)

      const publicUrl = publicUrlData.publicUrl

      // Save image metadata to database
      const { error: dbError } = await supabase.from("gallery_images").upsert(
        {
          id: image.id,
          user_id: supabase.auth.user()?.id,
          image_url: publicUrl,
          metadata: image.metadata,
          is_favorite: image.isFavorite,
          tags: image.tags,
        },
        { onConflict: "id" },
      )

      if (dbError) {
        throw dbError
      }

      // Update local image to mark as cloud stored and update file size
      const updatedImage: GalleryImage = {
        ...image,
        imageUrl: publicUrl, // Use the public URL for the cloud-stored image
        metadata: {
          ...image.metadata,
          cloudStored: true,
          fileSize: blob.size, // Store actual uploaded file size
        },
      }
      GalleryStorage.saveImage(updatedImage) // Update local storage with cloud info

      updateStatus({ isSyncing: false, lastSync: Date.now() })
      fetchStorageQuotaAndUsage() // Update usage after upload
      return { success: true, cloudImage: updatedImage }
    } catch (error: any) {
      console.error("Error uploading image:", error)
      updateStatus({ isSyncing: false, error: error.message })
      return { success: false, error: error.message }
    }
  },

  autoUploadNewGeneration: async (image: GalleryImage, onProgress?: (progress: number) => void) => {
    if (currentStatus.isEnabled && currentStatus.isAuthenticated) {
      return CloudSyncService.uploadImageFullResolution(image, onProgress)
    }
    return { success: false, error: "Cloud sync not enabled or authenticated." }
  },

  downloadImages: async (): Promise<GalleryImage[]> => {
    if (!currentStatus.isAuthenticated) {
      return []
    }
    updateStatus({ isSyncing: true, error: null })
    try {
      const { data, error } = await supabase.from("gallery_images").select("*").eq("user_id", supabase.auth.user()?.id)

      if (error) {
        throw error
      }

      const cloudImages: GalleryImage[] = data.map((item: any) => ({
        id: item.id,
        imageUrl: item.image_url,
        metadata: { ...item.metadata, cloudStored: true },
        isFavorite: item.is_favorite,
        tags: item.tags || [],
      }))

      updateStatus({ isSyncing: false, lastSync: Date.now() })
      return cloudImages
    } catch (error: any) {
      console.error("Error downloading images:", error)
      updateStatus({ isSyncing: false, error: error.message })
      return []
    }
  },

  deleteCloudImage: async (imageId: string) => {
    if (!currentStatus.isAuthenticated) {
      return { success: false, error: "Not authenticated for cloud sync." }
    }
    updateStatus({ isSyncing: true, error: null })
    try {
      // First, get the image record to find its file path
      const { data: imageRecord, error: fetchError } = await supabase
        .from("gallery_images")
        .select("metadata")
        .eq("id", imageId)
        .single()

      if (fetchError || !imageRecord?.metadata?.filename) {
        throw new Error("Image record not found or filename missing.")
      }

      const filePath = `${supabase.auth.user()?.id}/${imageId}.${imageRecord.metadata.filename.split(".").pop()}`

      const { error: storageError } = await supabase.storage.from("flowsketch-gallery").remove([filePath])

      if (storageError) {
        throw storageError
      }

      const { error: dbError } = await supabase.from("gallery_images").delete().eq("id", imageId)

      if (dbError) {
        throw dbError
      }

      updateStatus({ isSyncing: false, lastSync: Date.now() })
      fetchStorageQuotaAndUsage() // Update usage after deletion
      return { success: true }
    } catch (error: any) {
      console.error("Error deleting cloud image:", error)
      updateStatus({ isSyncing: false, error: error.message })
      return { success: false, error: error.message }
    }
  },

  clearCloudGallery: async () => {
    if (!currentStatus.isAuthenticated) {
      return { success: false, error: "Not authenticated for cloud sync." }
    }
    updateStatus({ isSyncing: true, error: null })
    try {
      // List all files for the current user
      const { data: files, error: listError } = await supabase.storage
        .from("flowsketch-gallery")
        .list(supabase.auth.user()?.id, {
          limit: 100, // Adjust limit as needed, or paginate for many files
        })

      if (listError) {
        throw listError
      }

      const filePaths = files.map((file) => `${supabase.auth.user()?.id}/${file.name}`)

      if (filePaths.length > 0) {
        const { error: removeError } = await supabase.storage.from("flowsketch-gallery").remove(filePaths)

        if (removeError) {
          throw removeError
        }
      }

      // Delete all database records for the user
      const { error: dbError } = await supabase.from("gallery_images").delete().eq("user_id", supabase.auth.user()?.id)

      if (dbError) {
        throw dbError
      }

      updateStatus({ isSyncing: false, lastSync: Date.now() })
      fetchStorageQuotaAndUsage() // Update usage after clearing
      return { success: true }
    } catch (error: any) {
      console.error("Error clearing cloud gallery:", error)
      updateStatus({ isSyncing: false, error: error.message })
      return { success: false, error: error.message }
    }
  },

  performFullSync: async () => {
    if (!currentStatus.isAuthenticated || currentStatus.isSyncing) {
      return { success: false, conflicts: [], error: "Not authenticated or already syncing." }
    }

    updateStatus({ isSyncing: true, error: null })
    const conflicts: SyncConflict[] = []

    try {
      const localImages = GalleryStorage.getGallery()
      const cloudImages = await CloudSyncService.downloadImages() // This also updates status

      const localMap = new Map(localImages.map((img) => [img.id, img]))
      const cloudMap = new Map(cloudImages.map((img) => [img.id, img]))

      // Identify images to upload (local only or local newer)
      for (const [id, localImg] of localMap.entries()) {
        const cloudImg = cloudMap.get(id)
        if (!cloudImg) {
          // Local only, upload it
          await CloudSyncService.uploadImageFullResolution(localImg)
        } else {
          // Both exist, check for conflicts
          if (localImg.metadata.createdAt > cloudImg.metadata.createdAt) {
            // Local is newer, upload local
            await CloudSyncService.uploadImageFullResolution(localImg)
          } else if (cloudImg.metadata.createdAt > localImg.metadata.createdAt) {
            // Cloud is newer, download cloud (handled by downloadImages and merge logic)
            // No explicit action needed here, will be handled by the final merge
          }
          // If timestamps are same, assume no conflict or already synced
        }
      }

      // Identify images to download (cloud only)
      // This is implicitly handled by `downloadImages` and the `loadGallery` merge logic
      // which will add cloud-only images to the local gallery.

      // Re-load gallery to ensure all local and cloud images are merged and up-to-date
      // This will also update `galleryStats` and `cloudSyncStatus.storageUsed`
      // The `loadGallery` in `components/gallery.tsx` handles the merging and local storage updates.
      // We trigger it via the status listener.

      updateStatus({ isSyncing: false, lastSync: Date.now() })
      fetchStorageQuotaAndUsage() // Ensure latest usage is reflected
      return { success: true, conflicts }
    } catch (error: any) {
      console.error("Full sync failed:", error)
      updateStatus({ isSyncing: false, error: error.message })
      return { success: false, conflicts, error: error.message }
    }
  },

  resolveConflict: async (conflict: SyncConflict, resolution: "keep_local" | "keep_cloud") => {
    updateStatus({ isSyncing: true, error: null })
    try {
      if (resolution === "keep_local") {
        await CloudSyncService.uploadImageFullResolution(conflict.localImage)
      } else {
        // Delete local, then download cloud (downloadImages will handle adding it back)
        GalleryStorage.deleteImage(conflict.localImage.id)
        // No explicit download needed here, the next full sync or gallery load will pull it.
      }
      updateStatus({ isSyncing: false, lastSync: Date.now() })
      fetchStorageQuotaAndUsage()
      return { success: true }
    } catch (error: any) {
      console.error("Error resolving conflict:", error)
      updateStatus({ isSyncing: false, error: error.message })
      return { success: false, error: error.message }
    }
  },
}
