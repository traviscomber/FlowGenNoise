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

function createCloudSyncService() {
  let status: CloudSyncStatus = {
    isEnabled: false,
    isAuthenticated: false,
    isSyncing: false,
    lastSync: null,
    storageUsed: 0,
    storageQuota: 0,
    error: null,
  }

  const listeners = new Set<(s: CloudSyncStatus) => void>()

  const notify = () => {
    listeners.forEach((cb) => cb({ ...status }))
  }

  const setStatus = (patch: Partial<CloudSyncStatus>) => {
    status = { ...status, ...patch }
    notify()
  }

  return {
    getStatus(): CloudSyncStatus {
      return { ...status }
    },

    addStatusListener(cb: (s: CloudSyncStatus) => void) {
      listeners.add(cb)
    },

    removeStatusListener(cb: (s: CloudSyncStatus) => void) {
      listeners.delete(cb)
    },

    async initializeAuth() {
      const { data } = await supabase.auth.getUser()
      setStatus({ isAuthenticated: !!data.user })
    },

    async signInWithEmail(email: string, password: string) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setStatus({ isAuthenticated: false, error: error.message })
        return { success: false, error: error.message }
      }
      setStatus({ isAuthenticated: true, error: null })
      return { success: true }
    },

    async signUpWithEmail(email: string, password: string, displayName?: string) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      })
      if (error) {
        setStatus({ error: error.message })
        return { success: false, error: error.message }
      }
      return {
        success: true,
        error: "Please check your email to confirm your account.",
      }
    },

    async signOut() {
      const { error } = await supabase.auth.signOut()
      if (error) {
        setStatus({ error: error.message })
        return
      }
      setStatus({
        isAuthenticated: false,
        isEnabled: false,
        storageUsed: 0,
        storageQuota: 0,
        lastSync: null,
        error: null,
      })
    },

    async enableSync() {
      if (!status.isAuthenticated) return { success: false, error: "Not authenticated." }
      setStatus({ isEnabled: true })
      return { success: true }
    },

    async disableSync() {
      setStatus({ isEnabled: false })
    },

    async performFullSync() {
      if (!status.isAuthenticated) return { success: false, conflicts: [], error: "Not authenticated." }
      setStatus({ isSyncing: true })

      // Simulate sync
      await new Promise((r) => setTimeout(r, 250))

      setStatus({ isSyncing: false, lastSync: Date.now(), error: null })
      return { success: true, conflicts: [] }
    },

    async resolveConflict() {
      return { success: true }
    },

    async uploadImageFullResolution(image: GalleryImage) {
      const stored: GalleryImage = {
        ...image,
        metadata: { ...image.metadata, cloudStored: true },
      }
      GalleryStorage.saveImage(stored)
    },

    async autoUploadNewGeneration(image: GalleryImage) {
      await this.uploadImageFullResolution(image)
      return { success: true, cloudImage: { ...image, metadata: { ...image.metadata, cloudStored: true } } }
    },

    async deleteCloudImage() {
      // Stub implementation
    },

    async clearCloudGallery() {
      GalleryStorage.clearGallery()
    },

    async downloadImages(): Promise<GalleryImage[]> {
      // Stub - return empty array for now
      return []
    },
  }
}

export const CloudSync = createCloudSyncService()
