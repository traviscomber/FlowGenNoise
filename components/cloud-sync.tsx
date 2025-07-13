"use client"

import { useState, useEffect } from "react"
import { CloudSyncService, type CloudSyncStatus, type SyncConflict } from "@/lib/cloud-sync"

interface CloudSyncProps {
  onSyncComplete?: () => void
}

export function CloudSync({ onSyncComplete }: CloudSyncProps) {
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>(CloudSyncService.getStatus())
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState("")
  const [conflicts, setConflicts] = useState<SyncConflict[]>([])
  const [showConflicts, setShowConflicts] = useState(false)

  useEffect(() => {
    CloudSyncService.initializeAuth()

    const handleStatusChange = (status: CloudSyncStatus) => {
      setSyncStatus(status)
    }

    CloudSyncService.addStatusListener(handleStatusChange)
    return () => CloudSyncService.removeStatusListener(handleStatusChange)
  }, [])

  const handleAuth = async () => {
    setAuthLoading(true)
    setAuthError("")

    try {
      let result
      if (authMode === "signin") {
        result = await CloudSyncService.signInWithEmail(email, password)
      } else {
        result = await CloudSyncService.signUpWithEmail(email, password, displayName)
      }

      if (result.success) {
        setShowAuthDialog(false)
        setEmail("")
        setPassword("")
        setDisplayName("")
        if (authMode === "signin") {
          await handleEnableSync()
        }
      } else {
        setAuthError(result.error || "Authentication failed")
      }
    } catch (error: any) {
      setAuthError(error.message)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleEnableSync = async () => {
    const result = await CloudSyncService.enableSync()
    if (!result.success) {
      setAuthError(result.error || "Failed to enable sync")
    } else {
      onSyncComplete?.()
    }
  }

  const handleDisableSync = async () => {
    await CloudSyncService.disableSync()
  }

  const handleSignOut = async () => {
    await CloudSyncService.signOut()
  }

  const handleSync = async () => {
    const result = await CloudSyncService.performFullSync()
    if (result.conflicts.length > 0) {
      setConflicts(result.conflicts)
      setShowConflicts(true)
    } else {
      onSyncComplete?.()
    }
  }

  const handleResolveConflict = async (conflict: SyncConflict, resolution: "keep_local" | "keep_cloud") => {
    await CloudSyncService.resolveConflict(conflict, resolution)
    setConflicts((prev) => prev.filter((c) => c.localImage.id !== conflict.localImage.id))

    if (conflicts.length <= 1) {
      setShowConflicts(false)
      onSyncComplete?.()
    }
  }

  const storagePercentage = (syncStatus.storageUsed / syncStatus.storageQuota) * 100

  return (
    <div className="hidden">{/* Cloud sync functionality is now integrated directly into FlowArtGenerator.tsx */}</div>
  )
}
