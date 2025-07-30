"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Cloud, CloudOff, Loader2, User, LogOut } from "lucide-react"
import { CloudSync, type CloudSyncStatus } from "@/lib/cloud-sync"

export default function CloudSyncComponent() {
  const { toast } = useToast()
  const [status, setStatus] = useState<CloudSyncStatus>(CloudSync.getStatus())
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handleStatusChange = (newStatus: CloudSyncStatus) => {
      setStatus(newStatus)
    }

    CloudSync.addStatusListener(handleStatusChange)
    CloudSync.initializeAuth()

    return () => CloudSync.removeStatusListener(handleStatusChange)
  }, [])

  const handleSignIn = async () => {
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    const result = await CloudSync.signInWithEmail(email, password)
    setIsLoading(false)

    if (result.success) {
      toast({
        title: "Signed In",
        description: "Successfully signed in to cloud sync.",
      })
      setEmail("")
      setPassword("")
    } else {
      toast({
        title: "Sign In Failed",
        description: result.error,
        variant: "destructive",
      })
    }
  }

  const handleSignOut = async () => {
    await CloudSync.signOut()
    toast({
      title: "Signed Out",
      description: "Successfully signed out of cloud sync.",
    })
  }

  const handleToggleSync = async (enabled: boolean) => {
    if (enabled) {
      const result = await CloudSync.enableSync()
      if (result.success) {
        toast({
          title: "Cloud Sync Enabled",
          description: "Your images will now sync to the cloud.",
        })
      }
    } else {
      await CloudSync.disableSync()
      toast({
        title: "Cloud Sync Disabled",
        description: "Images will only be stored locally.",
      })
    }
  }

  const handleFullSync = async () => {
    setIsLoading(true)
    const result = await CloudSync.performFullSync()
    setIsLoading(false)

    if (result.success) {
      toast({
        title: "Sync Complete",
        description: "All images have been synchronized.",
      })
    } else {
      toast({
        title: "Sync Failed",
        description: result.error || "Failed to sync images.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status.isAuthenticated ? (
            <Cloud className="h-5 w-5 text-blue-500" />
          ) : (
            <CloudOff className="h-5 w-5 text-gray-400" />
          )}
          Cloud Sync
        </CardTitle>
        <CardDescription>
          {status.isAuthenticated ? "Sync your gallery across devices" : "Sign in to sync your gallery across devices"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!status.isAuthenticated ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
            <Button onClick={handleSignIn} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <User className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="sync-enabled">Enable Sync</Label>
              <Switch id="sync-enabled" checked={status.isEnabled} onCheckedChange={handleToggleSync} />
            </div>

            {status.isEnabled && (
              <div className="space-y-2">
                <Button
                  onClick={handleFullSync}
                  disabled={status.isSyncing}
                  variant="outline"
                  className="w-full bg-transparent"
                >
                  {status.isSyncing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Cloud className="mr-2 h-4 w-4" />
                      Sync Now
                    </>
                  )}
                </Button>

                {status.lastSync && (
                  <p className="text-sm text-muted-foreground text-center">
                    Last sync: {new Date(status.lastSync).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            <Button onClick={handleSignOut} variant="outline" className="w-full bg-transparent">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        )}

        {status.error && <p className="text-sm text-destructive">{status.error}</p>}
      </CardContent>
    </Card>
  )
}
