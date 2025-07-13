import { supabase } from "./supabase"
import { GalleryStorage, type GalleryImage } from "./gallery-storage"

/**
 * Cloud-sync helper utilities (stub).
 * Replace the bodies of the async functions with real
 * API calls once your backend is ready.
 */

/**
 * The current cloud-sync state the UI cares about.
 */
export interface CloudSyncStatus {
  /** User has enabled the cloud-sync feature in settings */
  isEnabled: boolean
  /** We have a valid auth session / token to talk to the backend */
  isAuthenticated: boolean
}

/**
 * An in-memory singleton that mimics a tiny event-emitter so
 * React components can stay in sync with backend state changes.
 */
function createCloudSyncService() {
  // --- PRIVATE STATE --------------------------------------------------------
  let status: CloudSyncStatus = {
    isEnabled: false,
    isAuthenticated: false,
  }

  const listeners = new Set<(s: CloudSyncStatus) => void>()

  function notify() {
    for (const cb of listeners) cb({ ...status })
  }

  // --- PUBLIC API -----------------------------------------------------------
  return {
    /* --------------------------------------------------------------------- */
    /*  Status helpers                                                       */
    /* --------------------------------------------------------------------- */

    /**
     * Get the latest status snapshot (cheap read-only clone).
     */
    getStatus(): CloudSyncStatus {
      return { ...status }
    },

    /**
     * Merge a partial update into the status and broadcast it.
     */
    _setStatus(patch: Partial<CloudSyncStatus>) {
      status = { ...status, ...patch }
      notify()
    },

    addStatusListener(cb: (s: CloudSyncStatus) => void) {
      listeners.add(cb)
    },

    removeStatusListener(cb: (s: CloudSyncStatus) => void) {
      listeners.delete(cb)
    },

    /* --------------------------------------------------------------------- */
    /*  Image helpers – stubbed for now                                      */
    /* --------------------------------------------------------------------- */

    /** Download every image stored in the cloud. */
    async downloadImages(): Promise<GalleryImage[]> {
      // TODO: fetch from your backend / Supabase bucket
      return []
    },

    /**
     * Upload (or re-upload) the full-resolution image to the cloud.
     * Keeps metadata such as `isFavorite` in sync.
     */
    async uploadImageFullResolution(image: GalleryImage): Promise<void> {
      if (!status.isAuthenticated) {
        throw new Error("Not authenticated to upload.")
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

        const { data, error: uploadError } = await supabase.storage
          .from("flowsketch-gallery-images")
          .upload(filePath, imageBlob, {
            cacheControl: "3600",
            upsert: false,
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

        const { data: publicUrlData } = supabase.storage.from("flowsketch-gallery-images").getPublicUrl(filePath)

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

        GalleryStorage.saveImage(cloudImage)
      } catch (error: any) {
        console.error("Error uploading image:", error)
      }
    },

    /** Delete a single image from cloud storage. */
    async deleteCloudImage(imageId: string): Promise<void> {
      if (!status.isAuthenticated) {
        throw new Error("Not authenticated to delete.")
      }

      try {
        const userId = (await supabase.auth.getUser()).data.user?.id
        if (!userId) throw new Error("User ID not found.")

        const { error } = await supabase.storage.from("flowsketch-gallery-images").remove([`${userId}/${imageId}`])
        if (error) throw error

        GalleryStorage.deleteImage(imageId)
      } catch (error: any) {
        console.error("Error deleting cloud image:", error)
      }
    },

    /** Clear the entire cloud gallery for the signed-in user. */
    async clearCloudGallery(): Promise<void> {
      if (!status.isAuthenticated) {
        throw new Error("Not authenticated to clear gallery.")
      }

      try {
        const userId = (await supabase.auth.getUser()).data.user?.id
        if (!userId) throw new Error("User ID not found.")

        const { data: files, error } = await supabase.storage.from("flowsketch-gallery-images").list(`${userId}/`, {
          limit: 100, // Adjust limit as needed
          offset: 0,
        })

        if (error) throw error

        const filePaths = files?.map((file) => `${userId}/${file.name}`) || []
        const { error: removeError } = await supabase.storage.from("flowsketch-gallery-images").remove(filePaths)
        if (removeError) throw removeError

        GalleryStorage.clearGallery()
      } catch (error: any) {
        console.error("Error clearing cloud gallery:", error)
      }
    },
  }
}

/**
 * A singleton instance you can import anywhere:
 *
 *   import { CloudSyncService } from "@/lib/cloud-sync"
 *
 * Components listen via:
 *   const status = CloudSyncService.getStatus()
 *   CloudSyncService.addStatusListener(cb)
 *
 * …and update via (typically inside auth flow):
 *   CloudSyncService._setStatus({ isAuthenticated: true })
 */
export const CloudSyncService = createCloudSyncService()
