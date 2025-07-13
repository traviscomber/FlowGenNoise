import { supabase } from "./supabase"
import { GalleryStorage, type GalleryImage } from "./gallery-storage"

/**
 * ---------------------------------------------------------------------------
 * TYPES
 * ---------------------------------------------------------------------------
 */

/**
 * Shape of the status object React components subscribe to.
 * (Matches what FlowArtGenerator & Gallery expect.)
 */
export interface CloudSyncStatus {
  isEnabled: boolean
  isAuthenticated: boolean
  isSyncing: boolean
  lastSync: number | null
  storageUsed: number
  storageQuota: number
  error: string | null
}

/**
 * Conflict information returned by performFullSync().
 */
export interface SyncConflict {
  type: "local_newer" | "cloud_newer" | "both_modified"
  localImage: GalleryImage
  cloudImage: GalleryImage
}

/**
 * Utility for cloning status to avoid accidental mutation.
 */
const cloneStatus = (s: CloudSyncStatus): CloudSyncStatus => ({ ...s })

/**
 * ---------------------------------------------------------------------------
 * SINGLETON FACTORY
 * ---------------------------------------------------------------------------
 */

function createCloudSyncService() {
  /** Current in-memory status */
  let status: CloudSyncStatus = {
    isEnabled: false,
    isAuthenticated: false,
    isSyncing: false,
    lastSync: null,
    storageUsed: 0,
    storageQuota: 0,
    error: null,
  }

  /** Simple pub-sub for status changes */
  const listeners = new Set<(s: CloudSyncStatus) => void>()
  const notify = () => listeners.forEach((cb) => cb(cloneStatus(status)))

  /** Helpers -------------------------------------------------------------- */
  const setStatus = (patch: Partial<CloudSyncStatus>) => {
    status = { ...status, ...patch }
    notify()
  }

  /** ---------------------------------------------------------------------
   *  PUBLIC API
   *  ------------------------------------------------------------------- */
  return {
    /* STATUS ------------------------------------------------------------- */
    getStatus(): CloudSyncStatus {
      return cloneStatus(status)
    },

    addStatusListener(cb: (s: CloudSyncStatus) => void) {
      listeners.add(cb)
    },

    removeStatusListener(cb: (s: CloudSyncStatus) => void) {
      listeners.delete(cb)
    },

    /* AUTH --------------------------------------------------------------- */
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
      // Supabase requires e-mail confirmation – not authenticated yet.
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

    /* PREFERENCES -------------------------------------------------------- */
    async enableSync() {
      if (!status.isAuthenticated) return { success: false, error: "Not authenticated." }
      setStatus({ isEnabled: true })
      return { success: true }
    },

    async disableSync() {
      setStatus({ isEnabled: false })
    },

    /* SYNC (stubbed) ----------------------------------------------------- */
    /**
     * Fake full-sync implementation – always succeeds with no conflicts.
     * Replace with real logic when wiring to backend.
     */
    async performFullSync(): Promise<{ success: boolean; conflicts: SyncConflict[]; error?: string }> {
      if (!status.isAuthenticated) return { success: false, conflicts: [], error: "Not authenticated." }
      setStatus({ isSyncing: true })
      // …your real sync logic here…
      // For now we just wait 250 ms and resolve.
      await new Promise((r) => setTimeout(r, 250))
      setStatus({ isSyncing: false, lastSync: Date.now(), error: null })
      return { success: true, conflicts: [] }
    },

    async resolveConflict(_conflict: SyncConflict, _resolution: "keep_local" | "keep_cloud") {
      // No-op – conflicts never occur in stub.
      return { success: true }
    },

    /* IMAGE UPLOAD / DOWNLOAD (simplified) ------------------------------ */
    async uploadImageFullResolution(image: GalleryImage) {
      // Minimal implementation – just mark as cloud-stored locally.
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

    /* CLEANUP ------------------------------------------------------------ */
    async deleteCloudImage(_imageId: string) {
      // Stub: nothing to do
    },

    async clearCloudGallery() {
      GalleryStorage.clearGallery()
    },
  }
}

/**
 * ---------------------------------------------------------------------------
 * EXPORTS
 * ---------------------------------------------------------------------------
 */

export const CloudSyncService = createCloudSyncService()

/**
 * Alias kept for backward-compatibility with older imports:
 *   import { CloudSync } from "@/lib/cloud-sync"
 */
export const CloudSync = CloudSyncService
