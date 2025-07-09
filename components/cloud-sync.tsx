"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Cloud,
  CloudOff,
  FolderSyncIcon as Sync,
  User,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Upload,
  Download,
  Wifi,
  WifiOff,
} from "lucide-react"
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
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {syncStatus.isAuthenticated ? (
              syncStatus.isEnabled ? (
                <Cloud className="h-5 w-5 text-green-500" />
              ) : (
                <CloudOff className="h-5 w-5 text-orange-500" />
              )
            ) : (
              <CloudOff className="h-5 w-5 text-gray-500" />
            )}
            Cloud Sync
          </CardTitle>
          <CardDescription>
            {syncStatus.isAuthenticated
              ? syncStatus.isEnabled
                ? "Your gallery is synced across devices"
                : "Cloud sync is available but disabled"
              : "Sign in to sync your gallery across devices"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!syncStatus.isAuthenticated ? (
            <div className="space-y-4">
              <Alert>
                <Wifi className="h-4 w-4" />
                <AlertDescription>
                  Sign in to automatically sync your gallery across all your devices. Your artworks will be safely
                  stored in the cloud.
                </AlertDescription>
              </Alert>
              <Button onClick={() => setShowAuthDialog(true)} className="w-full">
                <User className="h-4 w-4 mr-2" />
                Sign In / Sign Up
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Sync Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {syncStatus.isSyncing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : syncStatus.isEnabled ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-orange-500" />
                  )}
                  <span className="text-sm font-medium">
                    {syncStatus.isSyncing ? "Syncing..." : syncStatus.isEnabled ? "Sync Enabled" : "Sync Disabled"}
                  </span>
                </div>
                <Badge variant={syncStatus.isEnabled ? "default" : "secondary"}>
                  {syncStatus.isEnabled ? "Active" : "Inactive"}
                </Badge>
              </div>

              {/* Last Sync */}
              {syncStatus.lastSync && (
                <div className="text-sm text-muted-foreground">
                  Last sync: {new Date(syncStatus.lastSync).toLocaleString()}
                </div>
              )}

              {/* Storage Usage */}
              {syncStatus.isEnabled && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Storage Used</span>
                    <span>
                      {(syncStatus.storageUsed / 1024 / 1024).toFixed(1)} MB /{" "}
                      {(syncStatus.storageQuota / 1024 / 1024).toFixed(0)} MB
                    </span>
                  </div>
                  <Progress value={storagePercentage} className="h-2" />
                  {storagePercentage > 80 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        You're running low on storage space. Consider deleting old images or upgrading your plan.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Conflicts Warning */}
              {syncStatus.conflictCount > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {syncStatus.conflictCount} sync conflict{syncStatus.conflictCount > 1 ? "s" : ""} detected.
                    <Button variant="link" className="p-0 h-auto ml-1" onClick={() => setShowConflicts(true)}>
                      Resolve now
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <Separator />

              {/* Actions */}
              <div className="flex gap-2">
                {syncStatus.isEnabled ? (
                  <>
                    <Button onClick={handleSync} disabled={syncStatus.isSyncing} className="flex-1">
                      <Sync className="h-4 w-4 mr-2" />
                      {syncStatus.isSyncing ? "Syncing..." : "Sync Now"}
                    </Button>
                    <Button variant="outline" onClick={handleDisableSync}>
                      <CloudOff className="h-4 w-4 mr-2" />
                      Disable
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleEnableSync} className="flex-1">
                    <Cloud className="h-4 w-4 mr-2" />
                    Enable Sync
                  </Button>
                )}
              </div>

              <Button variant="outline" onClick={handleSignOut} className="w-full bg-transparent">
                Sign Out
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auth Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{authMode === "signin" ? "Sign In" : "Create Account"}</DialogTitle>
            <DialogDescription>
              {authMode === "signin"
                ? "Sign in to sync your gallery across devices"
                : "Create an account to start syncing your artworks"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {authError && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {authMode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name (Optional)</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your Name"
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleAuth} disabled={authLoading} className="flex-1">
                {authLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <User className="h-4 w-4 mr-2" />}
                {authMode === "signin" ? "Sign In" : "Create Account"}
              </Button>
            </div>

            <div className="text-center">
              <Button
                variant="link"
                onClick={() => {
                  setAuthMode(authMode === "signin" ? "signup" : "signin")
                  setAuthError("")
                }}
              >
                {authMode === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Conflicts Dialog */}
      <Dialog open={showConflicts} onOpenChange={setShowConflicts}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Sync Conflicts</DialogTitle>
            <DialogDescription>
              Some images have conflicts between your local and cloud versions. Choose which version to keep.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {conflicts.map((conflict, index) => (
              <Card key={conflict.localImage.id}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        <span className="font-medium">Local Version</span>
                        {conflict.type === "local_newer" && <Badge variant="default">Newer</Badge>}
                      </div>
                      <img
                        src={conflict.localImage.imageUrl || "/placeholder.svg"}
                        alt="Local version"
                        className="w-full h-32 object-cover rounded border"
                      />
                      <div className="text-xs text-muted-foreground">
                        Created: {new Date(conflict.localImage.metadata.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        <span className="font-medium">Cloud Version</span>
                        {conflict.type === "cloud_newer" && <Badge variant="default">Newer</Badge>}
                      </div>
                      <img
                        src={conflict.cloudImage.imageUrl || "/placeholder.svg"}
                        alt="Cloud version"
                        className="w-full h-32 object-cover rounded border"
                      />
                      <div className="text-xs text-muted-foreground">
                        Created: {new Date(conflict.cloudImage.metadata.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => handleResolveConflict(conflict, "keep_local")}
                      className="flex-1"
                    >
                      Keep Local
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleResolveConflict(conflict, "keep_cloud")}
                      className="flex-1"
                    >
                      Keep Cloud
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
